import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {definitions} from '../data/definitions.js';
import {confusionGroups} from '../data/confusion-groups.js';
import {loadContentPacks} from '../data/content-packs/loader.js';
import {validateContentPacks,validateSubjects} from '../data/content-packs/validate.js';
import {contentCatalog,coursePacks} from '../data/courses/index.js';
import {presentationGenerale} from '../data/courses/biologie-vegetale/presentation-generale.js';
import {questCeQueLeGenieEcologique} from '../data/courses/genie-ecologique/quest-ce-que-le-genie-ecologique.js';

const baseDefinition={id:'notion-base',terme:'Notion base',definitionCourte:'Définition base.',explication:'',matiere:'Matière test',theme:'Thème',variantesAcceptees:[],difficulte:1,distracteursProches:[]};
const newDefinition={id:'notion-nouvelle',terme:'Notion nouvelle',definitionCourte:'Définition nouvelle.',explication:'',matiere:'Matière test',theme:'Thème',variantesAcceptees:[],difficulte:1,distracteursProches:[]};
const testSubjects=[{id:'matiere-test',name:'Matière test',order:1}];
const pack=(id='cours-test',questionId='cours-test-q001')=>({
  schemaVersion:1,
  course:{id,subjectId:'matiere-test',title:'Cours test',order:1,version:1,sections:[{id:'bases',titre:'Bases',contenu:[{type:'paragraph',text:'Contenu source.'},{type:'definition',notionId:'notion-nouvelle'}],notions:['notion-base','notion-nouvelle']}]},
  definitionRefs:['notion-base'],definitionsToCreate:[{...newDefinition}],
  questions:[{id:questionId,sectionId:'bases',type:'qcm',question:'Question ?',answer:'A',choices:['A','B','C','D'],difficulty:1}],
  confusionGroups:[['notion-base','notion-nouvelle']]
});
const existingOnly=(id,questionId)=>{
  const value=pack(id,questionId);value.definitionsToCreate=[];value.course.sections[0].contenu=[{type:'paragraph',text:'Contenu source.'}];value.course.sections[0].notions=['notion-base'];value.confusionGroups=[];return value;
};
const validate=entries=>validateContentPacks(entries,{subjects:testSubjects,baseDefinitions:[baseDefinition],baseConfusionGroups:[['notion-base','notion-nouvelle']],report:()=>{}});

test('Content Packs : pack valide, nouvelle définition et groupe dédupliqué',()=>{
  const result=validate([{source:'courses/valide.json',pack:pack()}]);
  assert.equal(result.errors.length,0);assert.equal(result.courses.length,1);
  assert.equal(result.definitions.filter(item=>item.id==='notion-nouvelle').length,1);
  assert.equal(result.confusionGroups.filter(group=>group.includes('notion-base')&&group.includes('notion-nouvelle')).length,1);
});

test('Content Packs : schéma, cours, sections, blocs, questions et références invalides sont isolés',()=>{
  const cases=[
    {...pack(),schemaVersion:2},
    {...pack(),course:{...pack().course,subjectId:''}},
    {...pack(),course:{...pack().course,id:''}},
    {...pack(),course:{...pack().course,sections:[{...pack().course.sections[0],id:''}]}},
    {...pack(),course:{...pack().course,sections:[{...pack().course.sections[0],contenu:[{type:'inconnu',text:'x'}]}]}},
    {...pack(),definitionRefs:['absente'],definitionsToCreate:[]},
    {...pack(),questions:[{...pack().questions[0],sectionId:'absente'}]},
    {...pack(),confusionGroups:[['notion-base','absente']]}
  ];
  for(const [index,item] of cases.entries())assert.equal(validate([{source:`cas-${index}.json`,pack:item}]).courses.length,0);
});

test('Subjects : registre valide, erreurs explicites et suggestion de subjectId',()=>{
  assert.deepEqual(validateSubjects({schemaVersion:1,subjects:testSubjects},()=>{}).subjects,testSubjects);
  const invalid=validateSubjects({subjects:[{id:'doublon',name:'Matière',order:1},{id:'doublon',name:'Autre',order:-1},{id:'autre',name:'Matière',order:2}]},()=>{});
  assert.ok(invalid.errors.some(error=>error.includes('dupliqué')));assert.ok(invalid.errors.some(error=>error.includes('Order invalide')));assert.ok(invalid.errors.some(error=>error.includes('Nom de matière dupliqué')));
  const wrong=pack();wrong.course.subjectId='matiere-tset';const result=validate([{source:'typo.json',pack:wrong}]);
  assert.ok(result.errors.some(error=>error.includes('Subject inconnu : matiere-tset')));assert.ok(result.errors.some(error=>error.includes('Vouliez-vous dire : matiere-test')));
});

test('Content Packs V1 : ancien champ subject lu sans correction silencieuse du fichier',()=>{
  const legacy=pack();legacy.course.subject='Matière test';delete legacy.course.subjectId;
  const result=validate([{source:'v1.json',pack:legacy}]);
  assert.equal(result.errors.length,0);assert.equal(result.courses[0].subjectId,'matiere-test');assert.ok(result.warnings.some(warning=>warning.includes('Ancien champ')));
});

test('Définitions agrégées : une nouvelle notion peut être réutilisée par un autre chapitre',()=>{
  const creator=pack('createur','createur-q'),consumer=existingOnly('consommateur','consommateur-q');
  consumer.definitionRefs=['notion-base','notion-nouvelle'];consumer.course.sections[0].notions=['notion-base','notion-nouvelle'];
  const result=validate([{source:'createur.json',pack:creator},{source:'consommateur.json',pack:consumer}]);
  assert.equal(result.errors.length,0);assert.equal(result.courses.length,2);assert.equal(result.definitions.filter(item=>item.id==='notion-nouvelle').length,1);
});

test('DefinitionsToCreate : la matière est dérivée de subjectId et une variante libre est refusée',()=>{
  const derived=pack();delete derived.definitionsToCreate[0].matiere;
  const valid=validate([{source:'derivee.json',pack:derived}]);assert.equal(valid.errors.length,0);assert.equal(valid.definitions.find(item=>item.id==='notion-nouvelle').matiere,'Matière test');
  const typo=pack();typo.definitionsToCreate[0].matiere='Matiere Test';
  assert.ok(validate([{source:'typo-matiere.json',pack:typo}]).errors.some(error=>error.includes('Matière incohérente')));
});

test('Content Packs : conflit de définition conserve la banque globale sans doublon',()=>{
  const conflicting=pack();conflicting.definitionRefs=[];conflicting.definitionsToCreate=[{...baseDefinition,definitionCourte:'Texte concurrent.'}];
  conflicting.course.sections[0].contenu=[{type:'definition',notionId:'notion-base'}];conflicting.course.sections[0].notions=['notion-base'];conflicting.confusionGroups=[];
  const result=validate([{source:'courses/conflit.json',pack:conflicting}]);
  assert.equal(result.errors.length,0);assert.equal(result.warnings.length,1);
  assert.equal(result.definitions.filter(item=>item.id==='notion-base').length,1);
  assert.equal(result.definitions.find(item=>item.id==='notion-base').definitionCourte,'Définition base.');
});

test('Content Packs : IDs de cours et questions globalement dupliqués sont refusés',()=>{
  const sameCourse=validate([{source:'a.json',pack:existingOnly('meme','premiere-q')},{source:'b.json',pack:existingOnly('meme','autre-q')}]);
  assert.equal(sameCourse.courses.length,1);assert.ok(sameCourse.errors.some(error=>error.includes('dupliqué')));
  const sameQuestion=validate([{source:'a.json',pack:existingOnly('cours-a','question-commune')},{source:'b.json',pack:existingOnly('cours-b','question-commune')}]);
  assert.equal(sameQuestion.courses.length,1);assert.ok(sameQuestion.errors.some(error=>error.includes('question')));
});

test('Manifest : chargement, fichier absent, JSON invalide et chemin invalide',async()=>{
  const manifestUrl=new URL('https://example.test/content/manifest.json');
  const documents=new Map([
    ['/content/subjects.json',{schemaVersion:1,subjects:testSubjects}],
    ['/content/manifest.json',{schemaVersion:1,courses:['courses/valide.json']}],
    ['/content/courses/valide.json',pack()]
  ]);
  const readJson=async url=>{if(!documents.has(url.pathname))throw new Error('absent');return structuredClone(documents.get(url.pathname));};
  const valid=await loadContentPacks(manifestUrl,{readJson,baseDefinitions:[baseDefinition],report:()=>{}});
  assert.equal(valid.errors.length,0);assert.equal(valid.courses.length,1);
  const legacySource=existingOnly('legacy','legacy-q'),legacy={id:'legacy',matiere:'Matière test',titre:'Cours historique',ordre:1,version:1,sections:legacySource.course.sections,notions:['notion-base'],questions:legacySource.questions};
  const missingManifest=await loadContentPacks(manifestUrl,{readJson:async url=>{if(url.pathname.endsWith('subjects.json'))return {schemaVersion:1,subjects:testSubjects};throw new Error('absent');},baseDefinitions:[baseDefinition],legacyCourses:[legacy],report:()=>{}});
  assert.ok(missingManifest.errors.some(error=>error.includes('Chargement impossible')));assert.equal(missingManifest.courses.length,1);
  documents.set('/content/manifest.json',{schemaVersion:1,courses:['courses/invalide.json']});
  const badJson=await loadContentPacks(manifestUrl,{readJson,baseDefinitions:[baseDefinition],report:()=>{}});
  assert.ok(badJson.errors.some(error=>error.includes('JSON invalide')));
  documents.set('/content/manifest.json',{schemaVersion:1,courses:['../secret.json']});
  const badPath=await loadContentPacks(manifestUrl,{readJson,baseDefinitions:[baseDefinition],report:()=>{}});
  assert.ok(badPath.errors.some(error=>error.includes('Chemin de cours invalide')));
});

test('Migration 1:1 : cours, sections, questions et IDs sont strictement préservés',async()=>{
  const cases=[
    ['biologie-vegetale-presentation-generale.json',presentationGenerale],
    ['genie-ecologique-definition-et-principes.json',questCeQueLeGenieEcologique]
  ];
  for(const [file,legacy] of cases) {
    const raw=JSON.parse(await readFile(new URL(`../content/courses/${file}`,import.meta.url),'utf8'));
    const {subjectId,title,order,...data}=raw.course,migrated={...data,matiere:contentCatalog.subjects.find(item=>item.id===subjectId).name,titre:title,ordre:order,notions:[...new Set([...raw.definitionRefs,...raw.definitionsToCreate.map(item=>item.id)])],questions:raw.questions};
    assert.deepEqual(migrated,legacy);
    const active=coursePacks.find(item=>item.id===legacy.id);assert.deepEqual({...active,subjectId:undefined},{...legacy,subjectId:undefined});
    assert.deepEqual(active.questions.map(item=>item.id),legacy.questions.map(item=>item.id));
    assert.deepEqual(active.notions,legacy.notions);
  }
  assert.equal(contentCatalog.errors.length,0);
  assert.ok(definitions.every(item=>contentCatalog.definitions.some(candidate=>candidate.id===item.id)));
  assert.ok(confusionGroups.some(group=>group.includes('gametophyte')&&group.includes('sporophyte')));
});
