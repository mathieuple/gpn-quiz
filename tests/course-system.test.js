import {test} from 'node:test';
import assert from 'node:assert/strict';
import {definitions} from '../data/definitions.js';
import {validateCourses} from '../data/courses/validate.js';
import {createCourseIndex} from '../data/courses/index.js';
import {courseQuizOptions,courseQuestionStateId} from '../js/courses/course-session.js';
import {courseProgress} from '../js/progression/course-progress.js';
import {QuizSession} from '../js/quiz/quiz-engine.js';
import {defaults} from '../js/storage/migrations.js';
import {seededRandom} from '../js/utils/random.js';

const question={id:'test-odonates-q01',sectionId:'bases',type:'qcm',question:'Question issue du cours ?',answer:'Réponse A',choices:['Réponse A','Réponse B','Réponse C','Réponse D'],difficulty:1};
const pack=(id='test-odonates',ordre=1)=>({id,matiere:'Expertise faunistique',titre:'Test Odonates',ordre,version:1,sections:[{id:'bases',titre:'Bases',contenu:[{type:'paragraph',text:'Contenu source.'}],notions:['odonate']},{id:'suite',titre:'Suite',contenu:[{type:'important',text:'Point source.'}],notions:['exuvie']}],notions:['odonate','exuvie'],questions:[{...question,id:id+'-q01'}]});

test('Course Packs : validation complète, IDs, sections et références',()=>{
  const valid=validateCourses([pack()],definitions,()=>{});assert.equal(valid.courses.length,1);assert.equal(valid.errors.length,0);
  const broken=pack('broken');broken.notions.push('notion-absente');broken.sections[1].id='bases';broken.questions[0].sectionId='absente';
  const result=validateCourses([broken],definitions,()=>{});assert.equal(result.courses.length,0);assert.ok(result.errors.some(error=>error.includes('Notion inconnue')));assert.ok(result.errors.some(error=>error.includes('section')));
  assert.doesNotThrow(()=>validateCourses([null,{...pack('bad-q'),questions:[{type:'qcm'}]}],definitions,()=>{}));
});

test('Course Packs invalides isolés et plusieurs packs découverts par l’index',()=>{
  const first=pack('course-a',2),second=pack('course-b',1),invalid={...pack('course-c'),matiere:'Matière inconnue'};
  const index=createCourseIndex([first,invalid,second],definitions,()=>{});
  assert.deepEqual(index.getAllCourses().map(course=>course.id),['course-b','course-a']);
  assert.equal(index.validation.errors.length>0,true);
});

test('Relations centralisées cours vers notions et notion vers cours',()=>{
  const first=pack('course-a'),second={...pack('course-b',2),notions:['exuvie'],sections:[{...pack().sections[0],notions:['exuvie']}]};
  const index=createCourseIndex([first,second],definitions,()=>{});
  assert.deepEqual(index.getDefinitionsForCourse('course-a').map(d=>d.id),['odonate','exuvie']);
  assert.deepEqual(index.getCoursesForDefinition('exuvie').map(c=>c.id),['course-a','course-b']);
  assert.equal(index.getQuestionsForCourse('course-a','bases').length,1);
});

test('Réviser ce cours filtre strictement définitions et questions',()=>{
  const course=pack('course-a'),options=courseQuizOptions(course),user=defaults();
  const session=new QuizSession(definitions,user,options,{rng:seededRandom(8),now:()=>Date.UTC(2026,8,9)}),allowed=new Set([...course.notions,courseQuestionStateId(course.questions[0].id)]);
  while(!session.finished){const q=session.next();assert.ok(allowed.has(q.notion.id));session.submit(q.type==='qcm'?q.notion.id:q.notion.terme);}
  assert.equal(session.answers.some(answer=>!allowed.has(answer.notion.id)),false);
  assert.ok(user.notions[courseQuestionStateId(course.questions[0].id)]||session.answers.every(answer=>course.notions.includes(answer.notion.id)));
});

test('Une question de cours utilise la session et le stockage de maîtrise existants',()=>{
  const course=pack('course-question'),source={...course.questions[0],courseId:course.id,courseTitle:course.titre,matiere:course.matiere},user=defaults();
  const session=new QuizSession(definitions,user,{mode:'mixed',count:1,ids:[],courseQuestions:[source],preset:'course'},{rng:seededRandom(2),now:()=>Date.UTC(2026,8,9)});
  const generated=session.next();assert.equal(generated.type,'qcm');assert.equal(generated.prompt,source.question);assert.equal(generated.options.length,4);
  session.submit(generated.notion.id);const state=user.notions[courseQuestionStateId(source.id)];assert.equal(state.timesSeen,1);assert.equal(state.recognitionMastery,8);assert.ok(state.nextReviewAt>0);
});

test('Filtrage de section préparé dans le moteur',()=>{
  const course=pack(),options=courseQuizOptions(course,'bases');
  assert.deepEqual(options.ids,['odonate']);assert.equal(options.courseQuestions.length,1);assert.equal(options.sectionId,'bases');
  const emptySection=courseQuizOptions(course,'suite');assert.deepEqual(emptySection.ids,['exuvie']);assert.equal(emptySection.courseQuestions.length,0);
  assert.throws(()=>courseQuizOptions(course,'inconnue'));
});

test('Progression du cours réutilise maîtrise, reconnaissance et rappel actif',()=>{
  const course=pack(),user=defaults();user.notions.odonate={timesSeen:2,mastery:54,recognitionMastery:80,recallMastery:40};user.notions[courseQuestionStateId(course.questions[0].id)]={timesSeen:1,mastery:74,recognitionMastery:100,recallMastery:60};
  const progress=courseProgress(course,user);assert.equal(progress.notionsSeen,1);assert.equal(progress.coverage,50);assert.equal(progress.mastery,64);assert.equal(progress.recognition,90);assert.equal(progress.recall,50);
});
