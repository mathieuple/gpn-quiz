import {definitions} from '../definitions.js';
import {validateCourses} from './validate.js';
import {odonatesDemo} from './expertise-faunistique/odonates-demo.js';
import {questCeQueLeGenieEcologique} from './genie-ecologique/quest-ce-que-le-genie-ecologique.js';
import {presentationGenerale} from './biologie-vegetale/presentation-generale.js';

export const coursePacks=[odonatesDemo,questCeQueLeGenieEcologique,presentationGenerale];

export function createCourseIndex(packs,bank,report=console.warn) {
  const validation=validateCourses(packs,bank,report),courses=[...validation.courses].sort((a,b)=>a.matiere.localeCompare(b.matiere,'fr')||a.ordre-b.ordre||a.titre.localeCompare(b.titre,'fr'));
  const byId=new Map(courses.map(course=>[course.id,course])),definitionsById=new Map(bank.map(d=>[d.id,d])),bySubject=new Map(),byDefinition=new Map();
  for(const course of courses) {
    if(!bySubject.has(course.matiere))bySubject.set(course.matiere,[]);
    bySubject.get(course.matiere).push(course);
    for(const notionId of course.notions){if(!byDefinition.has(notionId))byDefinition.set(notionId,[]);byDefinition.get(notionId).push(course);}
  }
  return {
    validation,
    getAllCourses:()=>courses,
    getCoursesBySubject:subject=>bySubject.get(subject)||[],
    getCourseById:id=>byId.get(id)||null,
    getCoursesForDefinition:id=>byDefinition.get(id)||[],
    getDefinitionsForCourse:id=>(byId.get(id)?.notions||[]).map(notionId=>definitionsById.get(notionId)).filter(Boolean),
    getQuestionsForCourse:(id,sectionId)=>(byId.get(id)?.questions||[]).filter(question=>!sectionId||question.sectionId===sectionId)
  };
}

export const courseIndex=createCourseIndex(coursePacks,definitions);
export const courseValidation=courseIndex.validation;
export const getAllCourses=courseIndex.getAllCourses;
export const getCoursesBySubject=courseIndex.getCoursesBySubject;
export const getCourseById=courseIndex.getCourseById;
export const getCoursesForDefinition=courseIndex.getCoursesForDefinition;
export const getDefinitionsForCourse=courseIndex.getDefinitionsForCourse;
export const getQuestionsForCourse=courseIndex.getQuestionsForCourse;
