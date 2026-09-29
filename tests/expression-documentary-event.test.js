import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {definitions} from '../data/definitions.js';
import {expressionGestionDocumentaireDefinitions as imported} from '../data/expression-gestion-documentaire-definitions.js';
import {biologieFondamentaleChapitre1} from '../data/courses/biologie-fondamentale/constituants-genetique-evolution-phylogenie.js';
import {lexiqueExpressionGestionDocumentaire as secondEvent} from '../data/courses/expression-gestion-documentaire/lexique.js';
import {courseIndex} from '../data/courses/index.js';
import {validateCourses} from '../data/courses/validate.js';
import {validateDefinitions} from '../data/validate.js';
import {courseQuizOptions} from '../js/courses/course-session.js';
import {QuizSession} from '../js/quiz/quiz-engine.js';
import {feedback} from '../js/ui/feedback.js';
import {escapeHTML} from '../js/ui/helpers.js';
import {defaults} from '../js/storage/migrations.js';
import {seededRandom} from '../js/utils/random.js';

const previousIds=['friend-shoring','localisme','glocalisation','gouvernance-mondiale','bilateralisme','autarcie','nationalisme','decouplage-fragmentation','slowbalisation','equitable','circulaire','libre-echange','omc','taxes','tech-nationalisme','barrieres-tarifaires','altermondialisation','multilateralisme','globalisation-deglobalisation','mercantilisme','securite-alimentaire','economie-monde','antimondialisation','shoring-reshoring-near-shoring'];
const expectedIds=['friend-shoring','localisme','glocalisation','gouvernance-mondiale','bilateralisme','autarcie','nationalisme','decouplage-fragmentation','slowbalisation','equitable','identitarisme','circulaire','libre-echange','omc','taxes','tech-nationalisme','barrieres-tarifaires','altermondialisation','multilateralisme','globalisation-deglobalisation','mercantilisme','securite-alimentaire','economie-monde','antimondialisation','shoring-reshoring-near-shoring'];
const notion=id=>imported.find(item=>item.id===id);

test('Events : le premier et le deuxième sont conservés sans troisième event',()=>{
  const firstEvent=courseIndex.getCourseById('ecologie-generale-ecologie-biosphere');
  assert.ok(firstEvent);assert.equal(firstEvent.sections.length,19);assert.equal(firstEvent.questions.length,36);
  assert.equal(biologieFondamentaleChapitre1.sections.length,20);assert.equal(biologieFondamentaleChapitre1.questions.length,250);
  assert.equal(secondEvent.id,'lexique-expression-gestion-documentaire');assert.equal(secondEvent.titre,'Lexique — Expression et gestion documentaire');
  assert.equal(courseIndex.getCourseById(firstEvent.id),firstEvent);assert.equal(courseIndex.getCourseById(secondEvent.id),secondEvent);
  const home=readFileSync(new URL('../js/ui/home.js',import.meta.url),'utf8');
  assert.equal([...home.matchAll(/courseId:/g)].length,2);assert.match(home,/ecologie-generale-ecologie-biosphere/);assert.doesNotMatch(home,/courseId:[^\n]*biologie-fondamentale-constituants-genetique-evolution-phylogenie/);assert.match(home,/lexique-expression-gestion-documentaire/);
});

test('Lexique V3 : exactement 25 notions avec définition et exemple séparés',()=>{
  assert.equal(imported.length,25);assert.deepEqual(imported.map(item=>item.id),expectedIds);assert.equal(new Set(expectedIds).size,25);
  assert.ok(imported.every(item=>item.terme.trim()&&item.definitionCourte.trim()&&item.exemple.trim()));
  assert.ok(imported.every(item=>item.matiere==='Expression et gestion documentaire'));
  assert.deepEqual(secondEvent.notions,expectedIds);assert.deepEqual(secondEvent.sections[0].notions,expectedIds);assert.equal(secondEvent.questions.length,0);assert.equal(secondEvent.version,3);
  assert.equal(validateDefinitions(definitions,()=>{}).errors.length,0);assert.equal(validateCourses([secondEvent],definitions,()=>{}).errors.length,0);
});

test('Lexique V3 : les 24 anciens IDs et leur progression restent inchangés',()=>{
  assert.ok(previousIds.every(id=>expectedIds.includes(id)&&definitions.some(item=>item.id===id)));
  const user=defaults();user.notions['tech-nationalisme']={timesSeen:7,mastery:62,recognitionMastery:70,recallMastery:58,nextReviewAt:123456,successfulReviews:3};
  assert.equal(notion('tech-nationalisme').id,'tech-nationalisme');assert.deepEqual(user.notions['tech-nationalisme'],{timesSeen:7,mastery:62,recognitionMastery:70,recallMastery:58,nextReviewAt:123456,successfulReviews:3});
});

test('Identitarisme : nouvelle notion complète, unique et révisable',()=>{
  const item=notion('identitarisme');assert.ok(item);assert.equal(item.terme,'IDENTITARISME');assert.ok(item.definitionCourte);assert.ok(item.exemple);
  assert.equal(definitions.filter(definition=>definition.id==='identitarisme').length,1);
  const session=new QuizSession(definitions,defaults(),{mode:'mixed',count:1,ids:['identitarisme']},{rng:seededRandom(22),now:()=>Date.UTC(2026,8,22)});
  assert.equal(session.next().notion.id,'identitarisme');
});

test('Lexique V3 : contenus de contrôle fidèles à la source',()=>{
  assert.equal(notion('tech-nationalisme').exemple,'USA/Chine : semi-conducteurs.');
  assert.equal(notion('gouvernance-mondiale').definitionCourte,"Désigne les reglémentations applicables à l'echelle mondiale et vise à conserver les acquis de chaques pays dans une certaine forme d'équilibre. L'IGM (Indice Gouvernance Mondiale) qui est chargé de mesurer le respect des pays vis-à-vis des accords internationaux.");
  assert.equal(notion('gouvernance-mondiale').exemple,"L'Accord de Paris sur le Climat (2015)");
  assert.match(notion('omc').exemple,/Ce blocage compromet le fonctionnement d'ensemble du mécanisme de règlement des différends\.$/);
  assert.match(notion('shoring-reshoring-near-shoring').exemple,/Exemple de near-shoring : Zara/);
});

test('Lexique V3 : aucune métadonnée interdite, aucun lien et aucun doublon',()=>{
  const forbidden=['prenom','prénom','responsable','auteur','lien','url','source','commentaire','note','provenance'];
  for(const item of imported)for(const key of forbidden)assert.equal(Object.hasOwn(item,key),false);
  assert.doesNotMatch(JSON.stringify(imported),/https?:\/\//i);assert.equal(new Set(definitions.map(item=>item.id)).size,definitions.length);
});

test('Deuxième event : session indépendante limitée aux 25 notions',()=>{
  const options=courseQuizOptions(secondEvent),allowed=new Set(expectedIds),session=new QuizSession(definitions,defaults(),options,{rng:seededRandom(1809),now:()=>Date.UTC(2026,8,22)});
  assert.deepEqual(new Set(options.ids),allowed);assert.equal(options.courseQuestions.length,0);assert.equal(options.count,20);
  while(!session.finished){const question=session.next();assert.ok(allowed.has(question.notion.id));if(question.type==='qcm')assert.ok(question.options.every(option=>allowed.has(option.id)));session.submit(question.type==='qcm'?question.notion.id:question.notion.terme);}
  assert.equal(session.answers.length,20);
});

test('Interface V3 : exemples visibles dans les fiches, le cours et le feedback mobile',()=>{
  const notionsSource=readFileSync(new URL('../js/ui/notions.js',import.meta.url),'utf8'),coursesSource=readFileSync(new URL('../js/ui/courses.js',import.meta.url),'utf8'),styles=readFileSync(new URL('../css/screens.css',import.meta.url),'utf8');
  assert.match(notionsSource,/definition-example/);assert.match(coursesSource,/definition-example/);assert.match(styles,/\.feedback-example, \.definition-example/);assert.match(styles,/overflow-wrap: anywhere/);
  for(const id of ['tech-nationalisme','gouvernance-mondiale','omc','identitarisme','shoring-reshoring-near-shoring']){
    const item=notion(id),html=feedback({result:'exact',revenge:false,xp:10,notion:item},definitions,2);
    assert.equal(html.split(escapeHTML(item.definitionCourte)).length-1,1);assert.match(html,/EXEMPLE/);assert.ok(html.includes(escapeHTML(item.exemple)));
  }
});
