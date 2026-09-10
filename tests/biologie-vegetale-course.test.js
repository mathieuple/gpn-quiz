import {test} from 'node:test';
import assert from 'node:assert/strict';
import {definitions} from '../data/definitions.js';
import {confusionGroups} from '../data/confusion-groups.js';
import {coursePacks,createCourseIndex} from '../data/courses/index.js';
import {validateCourses} from '../data/courses/validate.js';
import {validateDefinitions} from '../data/validate.js';
import {courseQuizOptions,courseQuestionStateId} from '../js/courses/course-session.js';
import {QuizSession} from '../js/quiz/quiz-engine.js';
import {defaults} from '../js/storage/migrations.js';
import {seededRandom} from '../js/utils/random.js';

const course=coursePacks.find(item=>item.id==='biologie-vegetale-presentation-generale');
const newIds=['thallophyte','lignee-verte','gametange','archegone','antheridie','sporange','sporophyte','gametophyte','spore','embryophyte'];

test('Le chapitre Présentation générale est découvert avec ses 8 sections et 30 questions',()=>{
  assert.ok(course);
  assert.equal(course.sections.length,8);
  assert.equal(course.questions.length,30);
  assert.deepEqual(course.questions.map(question=>question.id),Array.from({length:30},(_,index)=>`bv-presentation-q${String(index+1).padStart(2,'0')}`));
  assert.deepEqual(Object.fromEntries(['qcm','short-answer','definition-term'].map(type=>[type,course.questions.filter(question=>question.type===type).length])),{'qcm':24,'short-answer':6,'definition-term':0});
});

test('Définitions et Course Pack sont valides sans référence cassée',()=>{
  assert.equal(validateDefinitions(definitions,()=>{}).errors.length,0);
  assert.equal(validateCourses(coursePacks,definitions,()=>{}).errors.length,0);
  const index=createCourseIndex(coursePacks,definitions,()=>{});
  assert.equal(index.getDefinitionsForCourse(course.id).length,course.notions.length);
  assert.ok(course.notions.every(id=>definitions.some(definition=>definition.id===id)));
  assert.ok(index.getCoursesForDefinition('gametophyte').some(item=>item.id===course.id));
});

test('Les 10 notions autorisées absentes ont été créées sans Végétal ni Gamète',()=>{
  assert.ok(newIds.every(id=>definitions.some(definition=>definition.id===id)));
  assert.equal(definitions.some(definition=>definition.id==='vegetal'),false);
  assert.equal(definitions.some(definition=>definition.id==='gamete'),false);
  const lineage=definitions.find(definition=>definition.id==='lignee-verte');
  assert.ok(lineage.variantesAcceptees.includes('Archaeplastida'));
  const embryophyte=definitions.find(definition=>definition.id==='embryophyte');
  assert.ok(embryophyte.variantesAcceptees.includes('Archégoniates'));
  assert.equal(embryophyte.variantesAcceptees.includes('Cormophyte'),false);
});

test('Les 7 groupes de confusion demandés sont présents',()=>{
  const expected=[['monophyletique','polyphyletique'],['thallophyte','cormophyte'],['thalle','cormus'],['bryophyte','tracheophyte'],['gametophyte','sporophyte'],['gametange','sporange'],['archegone','antheridie']];
  for(const group of expected)assert.ok(confusionGroups.some(candidate=>group.every(id=>candidate.includes(id))));
});

test('Réviser ce cours reste strictement limité à ses notions et questions',()=>{
  const options=courseQuizOptions(course),allowed=new Set([...course.notions,...course.questions.map(question=>courseQuestionStateId(question.id))]);
  const session=new QuizSession(definitions,defaults(),options,{rng:seededRandom(31),now:()=>Date.UTC(2026,8,10)});
  while(!session.finished){const question=session.next();assert.ok(allowed.has(question.notion.id));session.submit(question.type==='qcm'?question.notion.id:question.notion.terme);}
  assert.equal(session.answers.length,20);
});

test('Le filtrage par section conserve les questions associées',()=>{
  const options=courseQuizOptions(course,'embryophytes');
  assert.equal(options.courseQuestions.length,9);
  assert.ok(options.courseQuestions.every(question=>question.sectionId==='embryophytes'));
  assert.deepEqual(options.ids,course.sections.find(section=>section.id==='embryophytes').notions);
});
