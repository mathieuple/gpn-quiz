import {test} from 'node:test';
import assert from 'node:assert/strict';
import {definitions} from '../data/definitions.js';
import {coursePacks,createCourseIndex} from '../data/courses/index.js';
import {validateCourses} from '../data/courses/validate.js';
import {courseQuizOptions,courseQuestionStateId} from '../js/courses/course-session.js';
import {QuizSession} from '../js/quiz/quiz-engine.js';
import {defaults} from '../js/storage/migrations.js';
import {seededRandom} from '../js/utils/random.js';

const course=coursePacks.find(item=>item.id==='genie-ecologique-definition-et-principes');

test('Le Course Pack Génie écologique est découvert et valide',()=>{
  assert.ok(course);
  const result=validateCourses(coursePacks,definitions,()=>{});
  assert.equal(result.errors.length,0);
  assert.ok(result.courses.includes(course));
  assert.equal(new Set(course.questions.map(question=>question.id)).size,course.questions.length);
  assert.equal(new Set(course.sections.map(section=>section.id)).size,course.sections.length);
});

test('Toutes les notions du cours existent et la relation inverse est indexée',()=>{
  const bankIds=new Set(definitions.map(definition=>definition.id));
  assert.ok(course.notions.every(id=>bankIds.has(id)));
  const index=createCourseIndex(coursePacks,definitions,()=>{});
  assert.equal(index.getDefinitionsForCourse(course.id).length,course.notions.length);
  assert.ok(index.getCoursesForDefinition('genie-ecologique').some(item=>item.id===course.id));
});

test('La révision du cours ne contient aucun élément extérieur',()=>{
  const options=courseQuizOptions(course),allowed=new Set([...course.notions,...course.questions.map(question=>courseQuestionStateId(question.id))]);
  const session=new QuizSession(definitions,defaults(),options,{rng:seededRandom(12),now:()=>Date.UTC(2026,8,10)});
  while(!session.finished){
    const generated=session.next();
    assert.ok(allowed.has(generated.notion.id));
    session.submit(generated.type==='qcm'?generated.notion.id:generated.notion.terme);
  }
  assert.ok(session.answers.length>0);
});

test('Le filtrage de section garde uniquement ses notions et ses questions',()=>{
  const sectionId='niveaux-intervention',options=courseQuizOptions(course,sectionId),section=course.sections.find(item=>item.id===sectionId);
  assert.deepEqual(options.ids,section.notions);
  assert.ok(options.courseQuestions.length>0);
  assert.ok(options.courseQuestions.every(question=>question.sectionId===sectionId));
});

test('Les distinctions propres au PDF restent dans le contenu et les questions du cours',()=>{
  const section=course.sections.find(item=>item.id==='niveaux-intervention');
  const serialized=JSON.stringify(section);
  assert.match(serialized,/écosystème très dégradé/);
  assert.match(serialized,/sans lien historique/);
  assert.equal(course.questions.filter(question=>question.sectionId==='niveaux-intervention').length,4);
});
