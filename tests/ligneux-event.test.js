import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {ligneuxSpecies} from '../data/ligneux/species.js';
import {ligneuxPhotos} from '../data/ligneux/photos.js';
import {ligneuxConfusionGroups} from '../data/ligneux/confusion-groups.js';
import {validateLigneuxPack} from '../js/ligneux/validate.js';
import {LigneuxSession} from '../js/ligneux/quiz-engine.js';
import {createLigneuxProgress} from '../js/ligneux/progress.js';

const root=new URL('../',import.meta.url);

test('le pack ligneux contient exactement 30 espèces et 4 à 5 photos vérifiées chacune',async()=>{
  const result=validateLigneuxPack(ligneuxSpecies,ligneuxPhotos);
  assert.deepEqual(result.errors,[]);
  assert.equal(result.speciesCount,30);
  assert.ok(result.photoCount>=120&&result.photoCount<=150);
  assert.equal(new Set(ligneuxSpecies.map(item=>item.id)).size,30);
  assert.equal(new Set(ligneuxPhotos.map(item=>item.id)).size,result.photoCount);
  for(const species of ligneuxSpecies)assert.ok(result.photoCounts[species.id]>=4&&result.photoCounts[species.id]<=5,species.id);
  for(const photo of ligneuxPhotos){const file=await stat(new URL(photo.src,root));assert.ok(file.size>4000,`${photo.id} est anormalement légère`);}
});

test('aucune plante herbacée exclue ne figure dans les données',()=>{
  const text=JSON.stringify(ligneuxSpecies).toLocaleLowerCase('fr');
  for(const forbidden of ['bardane','alliaire','lierre terrestre','ortie','chélidoine','plantain'])assert.equal(text.includes(forbidden),false,forbidden);
});

test('les noms de fichiers et textes alternatifs ne peuvent pas révéler la réponse',async()=>{
  for(const photo of ligneuxPhotos){assert.match(photo.src,/assets\/ligneux\/lnx-\d{2}-\d{2}\.webp$/);assert.equal(photo.src.includes(photo.speciesId),false);}
  const ui=await readFile(new URL('../js/ui/ligneux.js',import.meta.url),'utf8');
  assert.match(ui,/alt="Photographie botanique à identifier"/);
  assert.doesNotMatch(ui,/alt="[^"]*\$\{e\(question\.species/);
});

test('chaque question propose quatre réponses différentes et une seule bonne',()=>{
  const session=new LigneuxSession(ligneuxSpecies,ligneuxPhotos,createLigneuxProgress(),{mode:'discovery',count:20},{rng:()=>0.37,now:()=>1});
  for(let index=0;index<20;index++){
    const question=session.next(),ids=question.choices.map(item=>item.id);
    assert.equal(ids.length,4);assert.equal(new Set(ids).size,4);assert.equal(ids.filter(id=>id===question.species.id).length,1);
    session.submit(question.species.id);
  }
  assert.equal(session.answers.every(answer=>answer.correct),true);
});

test('les modes filtrent les organes et les confusions demandées',()=>{
  const leaves=new LigneuxSession(ligneuxSpecies,ligneuxPhotos,createLigneuxProgress(),{mode:'leaves',count:10},{rng:()=>0.2});
  assert.ok(leaves.eligiblePhotos().every(photo=>['leaf','twig'].includes(photo.organ)));
  const bark=new LigneuxSession(ligneuxSpecies,ligneuxPhotos,createLigneuxProgress(),{mode:'advanced',organ:'bark',count:10},{rng:()=>0.2});
  assert.ok(bark.eligiblePhotos().length>0);assert.ok(bark.eligiblePhotos().every(photo=>photo.organ==='bark'));
  const confusionIds=new Set(ligneuxConfusionGroups.flat()),confusions=new LigneuxSession(ligneuxSpecies,ligneuxPhotos,createLigneuxProgress(),{mode:'confusions',count:10},{rng:()=>0.2});
  assert.ok(confusions.eligiblePhotos().every(photo=>confusionIds.has(photo.speciesId)));
});

test('un examen de 30 questions représente chaque espèce une fois sans répéter de photo',()=>{
  const session=new LigneuxSession(ligneuxSpecies,ligneuxPhotos,createLigneuxProgress(),{mode:'exam',count:30},{rng:()=>0.41,now:()=>2});
  for(let index=0;index<30;index++){const question=session.next();session.submit(question.species.id);}
  assert.equal(new Set(session.answers.map(answer=>answer.species.id)).size,30);
  assert.equal(new Set(session.answers.map(answer=>answer.sourcePhoto.id)).size,30);
  assert.equal(session.progress.examHistory.length,1);
  assert.equal(session.progress.examHistory[0].grade,20);
});

test('la progression ligneux enregistre séparément espèces et photographies',()=>{
  const progress=createLigneuxProgress(),session=new LigneuxSession(ligneuxSpecies,ligneuxPhotos,progress,{mode:'discovery',count:1},{rng:()=>0.19,now:()=>123});
  const question=session.next();session.submit(question.choices.find(item=>item.id!==question.species.id).id);
  assert.equal(progress.totalAnswered,1);assert.equal(progress.wrong,1);assert.equal(progress.species[question.species.id].wrong,1);assert.equal(progress.photos[question.sourcePhoto.id].shown,1);
});

test('le cache initial reste léger et propose le téléchargement volontaire',async()=>{
  const worker=await readFile(new URL('../service-worker.js',import.meta.url),'utf8');
  const files=JSON.parse(worker.match(/const FILES=(\[[^;]+\]);/)[1]);
  assert.equal(files.some(file=>file.startsWith('assets/ligneux/')),false);
  assert.ok(files.includes('data/ligneux/photos.js'));
  assert.match(worker,/CACHE_LIGNEUX_PACK/);
});

test('l’accueil conserve les événements existants et expose le nouvel événement',async()=>{
  const home=await readFile(new URL('../js/ui/home.js',import.meta.url),'utf8');
  assert.match(home,/ecologie-generale-ecologie-biosphere/);
  assert.match(home,/lexique-expression-gestion-documentaire/);
  assert.match(home,/Reconnaissance des ligneux/);
  assert.match(home,/#\/ligneux/);
});
