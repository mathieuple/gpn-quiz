import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {definitions} from '../data/definitions.js';
import {expressionGestionDocumentaireDefinitions as imported} from '../data/expression-gestion-documentaire-definitions.js';
import {biologieFondamentaleChapitre1 as firstEvent} from '../data/courses/biologie-fondamentale/constituants-genetique-evolution-phylogenie.js';
import {lexiqueExpressionGestionDocumentaire as secondEvent} from '../data/courses/expression-gestion-documentaire/lexique.js';
import {courseIndex} from '../data/courses/index.js';
import {validateCourses} from '../data/courses/validate.js';
import {courseQuizOptions} from '../js/courses/course-session.js';
import {QuizSession} from '../js/quiz/quiz-engine.js';
import {defaults} from '../js/storage/migrations.js';
import {seededRandom} from '../js/utils/random.js';

const expectedIds=['friend-shoring','localisme','glocalisation','gouvernance-mondiale','bilateralisme','autarcie','nationalisme','decouplage-fragmentation','slowbalisation','equitable','circulaire','libre-echange','omc','taxes','tech-nationalisme','barrieres-tarifaires','altermondialisation','multilateralisme','globalisation-deglobalisation','mercantilisme','securite-alimentaire','economie-monde','antimondialisation','shoring-reshoring-near-shoring'];

test('Events : le premier est conservé et le second possède un ID distinct',()=>{
  assert.equal(firstEvent.id,'biologie-fondamentale-constituants-genetique-evolution-phylogenie');
  assert.equal(firstEvent.sections.length,20);assert.equal(firstEvent.questions.length,250);
  assert.equal(secondEvent.id,'lexique-expression-gestion-documentaire');
  assert.notEqual(secondEvent.id,firstEvent.id);
  assert.equal(courseIndex.getCourseById(firstEvent.id),firstEvent);
  assert.equal(courseIndex.getCourseById(secondEvent.id),secondEvent);
});

test('Import : exactement 24 définitions complètes dans la bonne matière',()=>{
  assert.equal(imported.length,24);
  assert.deepEqual(imported.map(item=>item.id),expectedIds);
  assert.equal(new Set(imported.map(item=>item.id)).size,24);
  assert.ok(imported.every(item=>item.terme.trim()&&item.definitionCourte.trim()));
  assert.ok(imported.every(item=>item.matiere==='Expression et gestion documentaire'));
  assert.deepEqual(secondEvent.notions,expectedIds);
  assert.equal(secondEvent.questions.length,0);
  assert.equal(validateCourses([secondEvent],definitions,()=>{}).errors.length,0);
});

test('Import : aucune métadonnée interdite, aucun lien et aucune définition inventée',()=>{
  const forbidden=['prenom','prénom','responsable','auteur','lien','source','exemple','commentaire','note','provenance'];
  for(const item of imported){for(const key of forbidden)assert.equal(Object.hasOwn(item,key),false);}
  assert.doesNotMatch(JSON.stringify(imported),/https?:\/\//i);
  assert.equal(definitions.some(item=>item.id==='identitarisme'||item.terme.toLocaleUpperCase('fr')==='IDENTITARISME'),false);
  assert.equal(new Set(definitions.map(item=>item.id)).size,definitions.length);
});

test('Nouvel event : session indépendante limitée aux 24 notions',()=>{
  const options=courseQuizOptions(secondEvent),allowed=new Set(expectedIds),session=new QuizSession(definitions,defaults(),options,{rng:seededRandom(1809),now:()=>Date.UTC(2026,8,18)});
  assert.deepEqual(new Set(options.ids),allowed);assert.equal(options.courseQuestions.length,0);assert.equal(options.count,20);
  while(!session.finished){const question=session.next();assert.ok(allowed.has(question.notion.id));if(question.type==='qcm')assert.ok(question.options.every(option=>allowed.has(option.id)));session.submit(question.type==='qcm'?question.notion.id:question.notion.terme);}
  assert.equal(session.answers.length,20);
});

test('Accueil : les deux cartes Event sont présentes',()=>{
  const home=readFileSync(new URL('../js/ui/home.js',import.meta.url),'utf8');
  assert.match(home,/biologie-fondamentale-constituants-genetique-evolution-phylogenie/);
  assert.match(home,/lexique-expression-gestion-documentaire/);
  assert.match(home,/Lexique — Expression et gestion documentaire/);
});
