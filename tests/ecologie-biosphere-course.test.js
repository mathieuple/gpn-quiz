import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {definitions as baseDefinitions} from '../data/definitions.js';
import {contentCatalog,contentDefinitions,courseIndex,coursePacks} from '../data/courses/index.js';
import {courseQuestionStateId,courseQuizOptions} from '../js/courses/course-session.js';
import {QuizSession} from '../js/quiz/quiz-engine.js';
import {defaults} from '../js/storage/migrations.js';
import {seededRandom} from '../js/utils/random.js';

const id='ecologie-generale-ecologie-biosphere';
const course=courseIndex.getCourseById(id);
const raw=JSON.parse(await readFile(new URL('../content/courses/ecologie-generale-ecologie-biosphere.json',import.meta.url),'utf8'));
const home=await readFile(new URL('../js/ui/home.js',import.meta.url),'utf8');
const worker=await readFile(new URL('../service-worker.js',import.meta.url),'utf8');
const previousCourses=new Map([
  ['biologie-vegetale-presentation-generale',{sections:8,questions:30}],
  ['genie-ecologique-definition-et-principes',{sections:9,questions:22}],
  ['biologie-fondamentale-constituants-genetique-evolution-phylogenie',{sections:20,questions:250}],
  ['lexique-expression-gestion-documentaire',{sections:1,questions:0}],
  ['expertise-faunistique-odonates',{sections:2,questions:0}]
]);

test('Écologie et biosphère : Content Pack présent, valide et classé dans la bonne matière',()=>{
  assert.ok(course);assert.equal(course.subjectId,'ecologie-generale');assert.equal(course.matiere,'Écologie générale');
  assert.equal(course.titre,'L’écologie et la biosphère');assert.equal(course.ordre,1);
  assert.equal(course.sections.length,19);assert.equal(course.questions.length,36);assert.equal(course.notions.length,26);
  assert.equal(contentCatalog.errors.length,0);assert.equal(contentCatalog.warnings.length,0);
  assert.equal(coursePacks.filter(item=>item.id===id).length,1);
  assert.deepEqual(courseIndex.getCoursesBySubject('ecologie-generale').map(item=>item.id),[id]);
});

test('Écologie et biosphère : sections et questions ont des IDs uniques et valides',()=>{
  const sectionIds=new Set(course.sections.map(section=>section.id)),questionIds=new Set();
  assert.equal(sectionIds.size,19);
  for(const question of course.questions){
    assert.ok(sectionIds.has(question.sectionId),question.id);assert.ok(!questionIds.has(question.id),question.id);questionIds.add(question.id);
    assert.ok(['qcm','short-answer'].includes(question.type));
    if(question.type==='qcm'){assert.equal(question.choices.length,4);assert.equal(new Set(question.choices).size,4);assert.equal(question.choices.filter(choice=>choice===question.answer).length,1);}
  }
  assert.equal(questionIds.size,36);
});

test('Écologie et biosphère : définitions existantes réutilisées sans doublon',()=>{
  assert.deepEqual(raw.definitionRefs,['habitat','facteur-abiotique','facteur-biotique','ecotone','stenotherme']);
  const baseIds=new Set(baseDefinitions.map(item=>item.id)),newIds=raw.definitionsToCreate.map(item=>item.id);
  assert.equal(newIds.length,21);assert.equal(new Set(newIds).size,21);assert.ok(newIds.every(item=>!baseIds.has(item)));
  for(const ref of raw.definitionRefs)assert.equal(contentDefinitions.filter(item=>item.id===ref).length,1);
  for(const created of newIds)assert.equal(contentDefinitions.filter(item=>item.id===created).length,1);
  assert.equal(new Set(contentDefinitions.map(item=>item.id)).size,contentDefinitions.length);
});

test('Écologie et biosphère : groupes de confusion pédagogiques et références valides',()=>{
  assert.deepEqual(raw.confusionGroups,[
    ['macroclimat','microclimat'],
    ['facteur-biotique','facteur-abiotique'],
    ['zone-euphotique','zone-aphotique'],
    ['zone-pelagique','zone-benthique']
  ]);
  const ids=new Set(contentDefinitions.map(item=>item.id));
  assert.ok(raw.confusionGroups.flat().every(item=>ids.has(item)));
  assert.ok(!raw.confusionGroups.some(group=>group.includes('eurytherme')));
});

test('Écologie et biosphère : quiz strictement limité au nouveau cours',()=>{
  const options=courseQuizOptions(course),allowed=new Set([...course.notions,...course.questions.map(question=>courseQuestionStateId(question.id))]);
  assert.equal(options.courseId,id);assert.equal(options.courseQuestions.length,36);
  const session=new QuizSession(contentDefinitions,defaults(),options,{rng:seededRandom(2909),now:()=>Date.UTC(2026,8,29)});
  while(!session.finished){const question=session.next();assert.ok(allowed.has(question.notion.id));session.submit(question.type==='qcm'?question.notion.id:question.notion.terme);}
  assert.equal(session.answers.length,20);assert.ok(session.answers.every(answer=>allowed.has(answer.notion.id)));
});

test('Écologie et biosphère : Event numéro 1 remplacé sans troisième Event',()=>{
  assert.match(home,/EVENT_COURSE_ID='ecologie-generale-ecologie-biosphere'/);
  assert.match(home,/subject:'ÉCOLOGIE GÉNÉRALE'/);assert.match(home,/title:'L’écologie et la biosphère'/);
  assert.doesNotMatch(home,/courseId:[^\n]*biologie-fondamentale-constituants-genetique-evolution-phylogenie/);
  assert.match(home,/courseId:'lexique-expression-gestion-documentaire'/);
  assert.equal([...home.matchAll(/courseId:/g)].length,2);
});

test('Écologie et biosphère : anciens cours et progression existante conservés',()=>{
  for(const [courseId,expected] of previousCourses){const item=courseIndex.getCourseById(courseId);assert.ok(item,courseId);assert.equal(item.sections.length,expected.sections);assert.equal(item.questions.length,expected.questions);}
  const user=defaults(),before={timesSeen:8,mastery:73,recognitionMastery:79,recallMastery:67,nextReviewAt:123456789};user.notions.habitat={...before};
  courseQuizOptions(course);assert.deepEqual(user.notions.habitat,before);assert.equal(user.notions.climat,undefined);
});

test('Écologie et biosphère : données de contrôle fidèles au PDF',()=>{
  const byId=new Map(contentDefinitions.map(item=>[item.id,item]));
  assert.equal(byId.get('climat').definitionCourte,'Ensemble des conditions météorologiques à long terme propres à une région donnée.');
  assert.equal(byId.get('macroclimat').definitionCourte,'Régimes climatiques à l’échelle planétaire, régionale et locale.');
  assert.equal(byId.get('microclimat').definitionCourte,'Régimes climatiques à petite échelle et localisés, comme ceux d’une communauté vivant dans un microhabitat.');
  assert.equal(byId.get('zone-abyssale').definitionCourte,'Partie profonde de l’océan située, selon le cours, entre environ 2 000 et 6 000 m.');
  assert.match(JSON.stringify(raw),/1 360 W\/m²/);assert.match(JSON.stringify(raw),/Gulf Stream/);assert.match(JSON.stringify(raw),/Moins de 0,1 %/);assert.match(JSON.stringify(raw),/Environ 3 %/);
  for(const notionId of ['ecotone','perturbation','zone-euphotique','thermocline','micticite','expansion','selection-habitat','facteur-biotique','facteur-abiotique'])assert.ok(course.notions.includes(notionId),notionId);
});

test('Écologie et biosphère : Content Pack disponible hors ligne sans le PDF source',()=>{
  const files=JSON.parse(worker.match(/const FILES=(\[[^;]+\]);/)[1]);
  assert.ok(files.includes('content/courses/ecologie-generale-ecologie-biosphere.json'));
  assert.ok(!files.some(file=>/\.pdf$/i.test(file)));
});
