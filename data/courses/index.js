import {definitions as baseDefinitions} from '../definitions.js';
import {confusionGroups as baseConfusionGroups,mergeConfusionGroups} from '../confusion-groups.js';
import {loadContentPacks} from '../content-packs/loader.js';
import {validateCourses} from './validate.js';
import {odonatesDemo} from './expertise-faunistique/odonates-demo.js';
import {biologieFondamentaleChapitre1} from './biologie-fondamentale/constituants-genetique-evolution-phylogenie.js';
import {lexiqueExpressionGestionDocumentaire} from './expression-gestion-documentaire/lexique.js';

const legacyCoursePacks=[odonatesDemo,biologieFondamentaleChapitre1,lexiqueExpressionGestionDocumentaire];
export const contentCatalog=await loadContentPacks(new URL('../../content/manifest.json',import.meta.url),{
  baseDefinitions,
  legacyCourses:legacyCoursePacks,
  baseConfusionGroups
});
mergeConfusionGroups(contentCatalog.confusionGroups);
export const coursePacks=contentCatalog.courses;
export const contentDefinitions=contentCatalog.definitions;
export const subjects=contentCatalog.subjects;

export function createCourseIndex(packs,bank,report=console.warn,subjectRegistry=[]) {
  const validation=validateCourses(packs,bank,report),subjectList=[...subjectRegistry],subjectById=new Map(subjectList.map(subject=>[subject.id,subject])),subjectByName=new Map(subjectList.map(subject=>[subject.name,subject]));
  for(const course of validation.courses)if(!subjectById.has(course.subjectId)&&!subjectByName.has(course.matiere)) {
    const subject={id:course.subjectId||course.matiere,name:course.matiere,order:subjectList.length};subjectList.push(subject);subjectById.set(subject.id,subject);subjectByName.set(subject.name,subject);
  }
  for(const course of validation.courses)course.subjectId=subjectById.get(course.subjectId)?.id||subjectByName.get(course.matiere)?.id||course.subjectId;
  const subjectOrder=new Map(subjectList.map(subject=>[subject.id,subject.order]));
  const courses=[...validation.courses].sort((a,b)=>(subjectOrder.get(a.subjectId)??Number.MAX_SAFE_INTEGER)-(subjectOrder.get(b.subjectId)??Number.MAX_SAFE_INTEGER)||a.ordre-b.ordre||a.titre.localeCompare(b.titre,'fr'));
  const byId=new Map(courses.map(course=>[course.id,course])),definitionsById=new Map(bank.map(d=>[d.id,d])),bySubject=new Map(),byDefinition=new Map();
  for(const course of courses) {
    if(!bySubject.has(course.subjectId))bySubject.set(course.subjectId,[]);
    bySubject.get(course.subjectId).push(course);
    for(const notionId of course.notions){if(!byDefinition.has(notionId))byDefinition.set(notionId,[]);byDefinition.get(notionId).push(course);}
  }
  const displayedSubjects=subjectList.filter(subject=>bySubject.has(subject.id)).sort((a,b)=>a.order-b.order||a.name.localeCompare(b.name,'fr'));
  const registeredSubjects=[...subjectList].sort((a,b)=>a.order-b.order||a.name.localeCompare(b.name,'fr'));
  return {
    validation,
    getAllCourses:()=>courses,
    getAllSubjects:()=>displayedSubjects,
    getRegisteredSubjects:()=>registeredSubjects,
    getSubjectById:id=>subjectById.get(id)||subjectByName.get(id)||null,
    getCoursesBySubject:value=>{const subject=subjectById.get(value)||subjectByName.get(value);return subject?bySubject.get(subject.id)||[]:[];},
    getCourseById:id=>byId.get(id)||null,
    getCoursesForDefinition:id=>byDefinition.get(id)||[],
    getDefinitionsForCourse:id=>(byId.get(id)?.notions||[]).map(notionId=>definitionsById.get(notionId)).filter(Boolean),
    getQuestionsForCourse:(id,sectionId)=>(byId.get(id)?.questions||[]).filter(question=>!sectionId||question.sectionId===sectionId)
  };
}

export const courseIndex=createCourseIndex(coursePacks,contentDefinitions,console.warn,subjects);
export const courseValidation={...courseIndex.validation,contentErrors:contentCatalog.errors,contentWarnings:contentCatalog.warnings};
export const getAllCourses=courseIndex.getAllCourses;
export const getAllSubjects=courseIndex.getAllSubjects;
export const getRegisteredSubjects=courseIndex.getRegisteredSubjects;
export const getSubjectById=courseIndex.getSubjectById;
export const getCoursesBySubject=courseIndex.getCoursesBySubject;
export const getCourseById=courseIndex.getCourseById;
export const getCoursesForDefinition=courseIndex.getCoursesForDefinition;
export const getDefinitionsForCourse=courseIndex.getDefinitionsForCourse;
export const getQuestionsForCourse=courseIndex.getQuestionsForCourse;
