import {validateCourses} from '../courses/validate.js';
import {validateDefinitions} from '../validate.js';
import {levenshtein} from '../../js/utils/levenshtein.js';

export const CONTENT_PACK_SCHEMA_VERSION=1;
const text=value=>typeof value==='string'&&value.trim().length>0;
const unique=list=>[...new Set(list)];
const groupKey=group=>[...group].sort().join('|');
const normalizedName=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLocaleLowerCase('fr');

export function validateSubjects(document,report=console.warn) {
  const errors=[],valid=[],ids=new Set(),names=new Set();
  if(!document||typeof document!=='object'||Array.isArray(document)||!Array.isArray(document.subjects))errors.push('subjects.json doit contenir un tableau subjects.');
  if(document?.schemaVersion!==undefined&&document.schemaVersion!==CONTENT_PACK_SCHEMA_VERSION)errors.push(`schemaVersion inconnue dans subjects.json : ${String(document.schemaVersion)}.`);
  for(const subject of document?.subjects||[]) {
    const before=errors.length,id=text(subject?.id)?subject.id:'',name=text(subject?.name)?subject.name:'',nameKey=normalizedName(name);
    if(!id)errors.push('Subject sans ID.');
    else if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))errors.push(`Subject ID invalide : ${id}.`);
    else if(ids.has(id))errors.push(`Subject ID dupliqué : ${id}.`);else ids.add(id);
    if(!name)errors.push(`Subject ${id||'sans ID'} sans name.`);
    else if(names.has(nameKey))errors.push(`Nom de matière dupliqué : ${name}.`);else names.add(nameKey);
    if(!Number.isInteger(subject?.order)||subject.order<0)errors.push(`Order invalide pour le subject ${id||'sans ID'}.`);
    if(errors.length===before)valid.push({id,name,order:subject.order});
  }
  errors.forEach(message=>report(`[GPN subjects] ${message}`));
  return {subjects:valid.sort((a,b)=>a.order-b.order||a.name.localeCompare(b.name,'fr')),errors};
}

function resolveSubject(course,subjects,source,addError,addWarning) {
  const byId=new Map(subjects.map(subject=>[subject.id,subject])),byName=new Map(subjects.map(subject=>[normalizedName(subject.name),subject]));
  let subjectId=text(course?.subjectId)?course.subjectId:'';
  if(!subjectId) {
    const legacy=course?.subject??course?.matiere;
    const match=text(legacy)?byId.get(legacy)||byName.get(normalizedName(legacy)):null;
    if(match){subjectId=match.id;addWarning(source,`Ancien champ de matière converti en subjectId : ${subjectId}.`);}
  }
  if(!subjectId){addError(source,'subjectId absent.');return null;}
  const subject=byId.get(subjectId);
  if(subject)return subject;
  const candidate=subjects.map(item=>({item,distance:levenshtein(subjectId,item.id)})).sort((a,b)=>a.distance-b.distance)[0];
  const suggestion=candidate&&candidate.distance<=Math.max(2,Math.floor(subjectId.length*.25))?` Vouliez-vous dire : ${candidate.item.id} ?`:'';
  addError(source,`Subject inconnu : ${subjectId}.${suggestion}`);
  return null;
}

function validDefinition(definition) {
  return definition&&['id','terme','definitionCourte','theme'].every(key=>text(definition[key]))
    &&(definition.matiere===undefined||text(definition.matiere))
    &&(definition.explication===undefined||typeof definition.explication==='string')
    &&[1,2,3].includes(definition.difficulte)
    &&Array.isArray(definition.variantesAcceptees)&&definition.variantesAcceptees.every(value=>typeof value==='string')
    &&Array.isArray(definition.distracteursProches)&&definition.distracteursProches.every(value=>typeof value==='string');
}

export function validateContentPacks(entries,{subjects=[],baseDefinitions=[],legacyCourses=[],baseConfusionGroups=[],report=console.warn}={}) {
  const errors=[],warnings=[],prepared=[],owners=new Map(),baseById=new Map(baseDefinitions.map(item=>[item.id,item]));
  const addError=(source,message)=>{const value=`[${source}] ${message}`;if(!errors.includes(value))errors.push(value);};
  const addWarning=(source,message)=>{const value=`[${source}] ${message}`;if(!warnings.includes(value))warnings.push(value);};

  for(const entry of Array.isArray(entries)?entries:[]) {
    const source=entry?.source||'Content Pack inconnu',pack=entry?.pack,before=errors.length;
    if(!pack||typeof pack!=='object'||Array.isArray(pack)){addError(source,'Le fichier doit contenir un objet JSON.');continue;}
    if(pack.schemaVersion!==CONTENT_PACK_SCHEMA_VERSION){addError(source,`schemaVersion inconnue : ${String(pack.schemaVersion)}.`);continue;}
    if(!pack.course||typeof pack.course!=='object'||Array.isArray(pack.course))addError(source,'Bloc course absent.');
    for(const field of ['definitionRefs','definitionsToCreate','questions','confusionGroups'])if(!Array.isArray(pack[field]))addError(source,`${field} doit être un tableau.`);
    if(errors.length>before)continue;
    const subject=resolveSubject(pack.course,subjects,source,addError,addWarning);
    const refs=pack.definitionRefs,created=pack.definitionsToCreate.map(definition=>({...definition,matiere:subject?.name||definition?.matiere}));
    if(refs.some(id=>!text(id)))addError(source,'definitionRefs contient un ID invalide.');
    if(new Set(refs).size!==refs.length)addError(source,'definitionRefs contient un ID dupliqué.');
    const localDefinitionIds=new Set();
    for(const [index,definition] of created.entries()) {
      const declaredMatter=pack.definitionsToCreate[index]?.matiere;
      if(subject&&declaredMatter!==undefined&&declaredMatter!==subject.name)addError(source,`Matière incohérente pour la définition ${definition?.id||'sans ID'} : utiliser le subjectId ${subject.id}.`);
      if(!validDefinition(definition)){addError(source,`Définition invalide : ${definition?.id||'sans ID'}.`);continue;}
      if(localDefinitionIds.has(definition.id)){addError(source,`ID de définition dupliqué : ${definition.id}.`);continue;}
      localDefinitionIds.add(definition.id);
      if(baseById.has(definition.id))addWarning(source,`La définition ${definition.id} existe déjà : la banque globale est conservée.`);
      else if(owners.has(definition.id))addError(source,`ID de définition dupliqué dans ${owners.get(definition.id)} : ${definition.id}.`);
      else owners.set(definition.id,source);
    }
    if(errors.length===before)prepared.push({source,pack,refs,created,subject});
  }

  const candidateDefinitions=[...baseDefinitions];
  for(const {source,created} of prepared)for(const definition of created)if(!baseById.has(definition.id)&&owners.get(definition.id)===source)candidateDefinitions.push(definition);
  const definitionValidation=validateDefinitions(candidateDefinitions,()=>{});
  for(const message of definitionValidation.errors)addError('définitions agrégées',message);
  const bank=definitionValidation.definitions,definitionIds=new Set(bank.map(item=>item.id));
  const normalized=[];
  for(const item of prepared) {
    const {source,pack,refs,created,subject}=item,before=errors.length;
    const notions=unique([...refs,...created.map(definition=>definition.id)]);
    for(const id of refs)if(!definitionIds.has(id))addError(source,`definitionRef inconnue : ${id}.`);
    const {subject:legacySubject,matiere:legacyName,title,titre,order,ordre,...courseData}=pack.course;
    const course={...courseData,subjectId:subject.id,matiere:subject.name,titre:title??titre,ordre:order??ordre,notions,questions:pack.questions};
    const validation=validateCourses([course],bank,()=>{});
    for(const message of validation.errors)addError(source,message);
    for(const [index,group] of pack.confusionGroups.entries()) {
      if(!Array.isArray(group)||group.length<2||group.some(id=>!text(id))){addError(source,`Groupe de confusion invalide à l’index ${index}.`);continue;}
      if(new Set(group).size!==group.length)addError(source,`Groupe de confusion avec doublon à l’index ${index}.`);
      for(const id of group)if(!definitionIds.has(id))addError(source,`Groupe de confusion référençant un ID inconnu : ${id}.`);
    }
    if(errors.length===before)normalized.push({source,course,definitionIds:new Set(created.map(item=>item.id)),confusionGroups:pack.confusionGroups});
  }

  let validEntries=normalized,definitions=bank,courseValidation;
  while(true) {
    const usedNewIds=new Set(validEntries.flatMap(item=>[...item.definitionIds]));
    definitions=bank.filter(item=>baseById.has(item.id)||usedNewIds.has(item.id));
    courseValidation=validateCourses([...legacyCourses,...validEntries.map(item=>item.course)],definitions,()=>{});
    for(const message of courseValidation.errors)addError('catalogue agrégé',message);
    const validCourses=new Set(courseValidation.courses),next=validEntries.filter(item=>validCourses.has(item.course));
    if(next.length===validEntries.length)break;
    validEntries=next;
  }
  const seenGroups=new Set(),confusionGroups=[];
  for(const group of [...baseConfusionGroups,...validEntries.flatMap(item=>item.confusionGroups)]) {
    const key=groupKey(group);
    if(!seenGroups.has(key)){seenGroups.add(key);confusionGroups.push([...group]);}
  }
  errors.forEach(message=>report(`Content Pack invalide ${message}`));
  warnings.forEach(message=>report(`Content Pack avertissement ${message}`));
  return {courses:courseValidation.courses,definitions,confusionGroups,errors,warnings,validEntries};
}
