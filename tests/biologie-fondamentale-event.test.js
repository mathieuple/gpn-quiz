import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {definitions} from '../data/definitions.js';
import {validateDefinitions} from '../data/validate.js';
import {biologieFondamentaleChapitre1 as course} from '../data/courses/biologie-fondamentale/constituants-genetique-evolution-phylogenie.js';
import {courseIndex} from '../data/courses/index.js';
import {validateCourses} from '../data/courses/validate.js';
import {courseExamOptions,courseQuestionStateId,courseQuizOptions} from '../js/courses/course-session.js';
import {validateAnswer} from '../js/quiz/answer-validator.js';
import {QuizSession} from '../js/quiz/quiz-engine.js';
import {defaults} from '../js/storage/migrations.js';
import {seededRandom} from '../js/utils/random.js';

const notion=id=>definitions.find(item=>item.id===id);

test('Biologie fondamentale : Course Pack complet, valide et découvert',()=>{
  assert.equal(course.sections.length,20);
  assert.equal(course.questions.length,250);
  assert.equal(course.notions.length,new Set(course.notions).size);
  assert.deepEqual(course.sections.map((section,index)=>course.questions.filter(question=>question.sectionId===section.id).length),[
    ...Array(19).fill(12),22
  ]);
  assert.equal(validateDefinitions(definitions,()=>{}).errors.length,0);
  assert.equal(validateCourses([course],definitions,()=>{}).errors.length,0);
  assert.equal(courseIndex.getCourseById(course.id),course);
  assert.ok(courseIndex.getCoursesBySubject('Biologie fondamentale').includes(course));
});

test('Biologie fondamentale : 250 questions distinctes et exploitables',()=>{
  const ids=new Set(),sectionIds=new Set(course.sections.map(section=>section.id));
  for(const question of course.questions){
    assert.ok(!ids.has(question.id),`ID dupliqué : ${question.id}`);ids.add(question.id);
    assert.ok(sectionIds.has(question.sectionId));
    assert.ok(question.subtheme?.trim());
    assert.ok([1,2,3].includes(question.difficulty));
    assert.ok(question.question.trim());
    assert.ok(question.answer.trim());
    assert.ok(question.explanation.trim());
    if(question.type==='qcm'){
      assert.equal(question.choices.length,4);
      assert.equal(new Set(question.choices).size,4);
      assert.equal(question.choices.filter(choice=>choice===question.answer).length,1);
    } else assert.equal(question.type,'short-answer');
  }
  assert.equal(ids.size,250);
  assert.ok(course.questions.some(question=>question.type==='short-answer'));
  assert.ok(course.questions.some(question=>question.difficulty===3));
});

test('Biologie fondamentale : révision strictement limitée au cours',()=>{
  const options=courseQuizOptions(course),allowed=new Set([...course.notions,...course.questions.map(question=>courseQuestionStateId(question.id))]);
  const session=new QuizSession(definitions,defaults(),options,{rng:seededRandom(1609),now:()=>Date.UTC(2026,8,16)});
  while(!session.finished){
    const question=session.next();assert.ok(allowed.has(question.notion.id));
    session.submit(question.type==='qcm'?question.notion.id:question.notion.terme);
  }
  assert.equal(session.answers.length,20);
  assert.ok(session.answers.every(answer=>allowed.has(answer.notion.id)));
});

test('Biologie fondamentale : examen de 30 questions et correction différée',()=>{
  const user=defaults(),options=courseExamOptions(course),session=new QuizSession(definitions,user,options,{rng:seededRandom(30),now:()=>Date.UTC(2026,8,16)});
  assert.equal(options.mode,'exam');assert.equal(options.count,30);
  const first=session.next();session.submit(first.type==='qcm'?first.notion.id:first.notion.terme);
  assert.equal(user.notions[first.notion.id],undefined);
  while(!session.finished){const question=session.next();session.submit(question.type==='qcm'?question.notion.id:question.notion.terme);}
  assert.equal(session.answers.length,30);
  assert.equal(new Set(session.answers.map(answer=>answer.notion.id)).size,30);
  assert.ok(user.notions[first.notion.id]);
});

test('Biologie fondamentale : tolérance orthographique sans confusion biologique',()=>{
  assert.equal(validateAnswer('mitocondrie',notion('mitochondrie'),definitions),'almost');
  assert.equal(validateAnswer('peptidiqie',notion('liaison-peptidique'),definitions),'almost');
  assert.equal(validateAnswer('chromatinne',notion('chromatine'),definitions),'almost');
  assert.equal(validateAnswer('chromatide',notion('chromatine'),definitions),'wrong');
  assert.equal(validateAnswer('diploide',notion('haploide'),definitions),'wrong');
  assert.equal(validateAnswer('cation',notion('anion'),definitions),'wrong');
  assert.equal(validateAnswer('mitose',notion('meiose'),definitions),'wrong');
  assert.equal(validateAnswer('brassage inter chromosomique',notion('brassage-intra-chromosomique'),definitions),'wrong');
});

test('Biologie fondamentale : carte Event visible et reliée au quiz du cours',()=>{
  const home=readFileSync(new URL('../js/ui/home.js',import.meta.url),'utf8'),styles=readFileSync(new URL('../css/screens.css',import.meta.url),'utf8');
  assert.match(home,/EVENT_COURSE_ID='biologie-fondamentale-constituants-genetique-evolution-phylogenie'/);
  assert.match(home,/data-event-course/);
  assert.match(home,/ctx\.start\(courseQuizOptions\(ctx\.courseIndex\.getCourseById\(button\.dataset\.eventCourse\)\)\)/);
  assert.match(styles,/\.event-card \{/);
  assert.match(styles,/\.event-card \.event-button/);
});
