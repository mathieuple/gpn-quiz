import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {definitions} from '../data/definitions.js';
import {validateSubjects} from '../data/content-packs/validate.js';
import {contentCatalog,courseIndex,coursePacks,createCourseIndex} from '../data/courses/index.js';
import {courseProgress} from '../js/progression/course-progress.js';
import {defaults} from '../js/storage/migrations.js';

const simpleCourse=(id,order)=>({id,subjectId:'biologie-vegetale',matiere:'Biologie végétale',titre:id,ordre:order,version:1,sections:[{id:'section',titre:'Section',contenu:[{type:'paragraph',text:'Contenu.'}],notions:['thalle']}],notions:['thalle'],questions:[]});

test('Subjects : subjects.json chargé, complet, unique et valide',async()=>{
  const document=JSON.parse(await readFile(new URL('../content/subjects.json',import.meta.url),'utf8')),result=validateSubjects(document,()=>{});
  assert.equal(result.errors.length,0);assert.equal(result.subjects.length,7);
  assert.equal(new Set(result.subjects.map(item=>item.id)).size,result.subjects.length);
  assert.ok(result.subjects.every(item=>item.name.trim()&&Number.isInteger(item.order)&&item.order>=0));
  assert.deepEqual(contentCatalog.subjects,result.subjects);
});

test('Subjects : matières affichées triées par subjects.order',()=>{
  assert.deepEqual(courseIndex.getAllSubjects().map(item=>item.id),[
    'biologie-fondamentale','biologie-vegetale','ecologie-generale','expertise-faunistique','expression-gestion-documentaire','genie-ecologique'
  ]);
  assert.equal(courseIndex.getSubjectById('biologie-vegetale').name,'Biologie végétale');
  assert.deepEqual(courseIndex.getCoursesBySubject('Biologie végétale'),courseIndex.getCoursesBySubject('biologie-vegetale'));
});

test('Subjects : plusieurs chapitres partagent un subjectId et suivent course.order',()=>{
  const second=simpleCourse('chapitre-2',2),first=simpleCourse('chapitre-1',1);
  const index=createCourseIndex([second,first],definitions,()=>{},contentCatalog.subjects);
  assert.deepEqual(index.getCoursesBySubject('biologie-vegetale').map(item=>item.id),['chapitre-1','chapitre-2']);
  assert.equal(index.getAllSubjects().filter(item=>item.id==='biologie-vegetale').length,1);
});

test('Subjects : une notion partagée conserve un seul ID et une progression globale',()=>{
  const first=simpleCourse('chapitre-a',1),second=simpleCourse('chapitre-b',2),index=createCourseIndex([first,second],definitions,()=>{},contentCatalog.subjects),user=defaults();
  user.notions.thalle={timesSeen:3,mastery:64,recognitionMastery:70,recallMastery:58};
  assert.equal(index.getDefinitionsForCourse(first.id)[0],index.getDefinitionsForCourse(second.id)[0]);
  assert.equal(index.getCoursesForDefinition('thalle').length,2);
  assert.equal(Object.keys(user.notions).filter(id=>id==='thalle').length,1);
  assert.equal(courseProgress(first,user).mastery,courseProgress(second,user).mastery);
});

test('Subjects : migration conserve cours, notions et questions existants',()=>{
  const expected=new Map([
    ['biologie-vegetale-presentation-generale',{sections:8,questions:30}],
    ['genie-ecologique-definition-et-principes',{sections:9,questions:22}],
    ['ecologie-generale-ecologie-biosphere',{sections:19,questions:36}],
    ['biologie-fondamentale-constituants-genetique-evolution-phylogenie',{sections:20,questions:250}],
    ['lexique-expression-gestion-documentaire',{sections:1,questions:0}],
    ['expertise-faunistique-odonates',{sections:2,questions:0}]
  ]);
  for(const [id,counts] of expected){const course=coursePacks.find(item=>item.id===id);assert.ok(course);assert.equal(course.sections.length,counts.sections);assert.equal(course.questions.length,counts.questions);assert.equal(course.notions.length,new Set(course.notions).size);assert.ok(course.subjectId);}
});
