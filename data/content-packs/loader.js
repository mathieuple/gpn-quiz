import {validateContentPacks,validateSubjects,CONTENT_PACK_SCHEMA_VERSION} from './validate.js';

const safeCoursePath=path=>typeof path==='string'&&/^courses\/[a-z0-9][a-z0-9/-]*\.json$/.test(path)&&!path.includes('..');

async function defaultReadJson(url) {
  if(url.protocol==='file:') {
    const {readFile}=await import('node:fs/promises');
    return JSON.parse(await readFile(url,'utf8'));
  }
  const response=await fetch(url,{cache:'no-cache'});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function loadContentPacks(manifestUrl,{subjectsUrl,readJson=defaultReadJson,baseDefinitions=[],legacyCourses=[],baseConfusionGroups=[],report=console.warn}={}) {
  const url=manifestUrl instanceof URL?manifestUrl:new URL(manifestUrl,import.meta.url),registryUrl=subjectsUrl?new URL(subjectsUrl,url):new URL('subjects.json',url),errors=[],entries=[];
  let subjectsDocument=null;
  try{subjectsDocument=await readJson(registryUrl);}catch(error){errors.push(`[subjects] Chargement impossible : ${error.message}`);}
  const subjectValidation=validateSubjects(subjectsDocument,()=>{}),subjects=subjectValidation.subjects;
  errors.push(...subjectValidation.errors.map(message=>`[subjects] ${message}`));
  let manifest;
  try{manifest=await readJson(url);}catch(error){errors.push(`[manifest] Chargement impossible : ${error.message}`);errors.forEach(message=>report(message));return {manifest:null,subjectsDocument,subjects,files:[],...validateContentPacks([],{subjects,baseDefinitions,legacyCourses,baseConfusionGroups,report}),errors};}
  if(!manifest||manifest.schemaVersion!==CONTENT_PACK_SCHEMA_VERSION||!Array.isArray(manifest.courses)) {
    errors.push('[manifest] Format invalide ou schemaVersion inconnue.');errors.forEach(message=>report(message));
    return {manifest,subjectsDocument,subjects,files:[],...validateContentPacks([],{subjects,baseDefinitions,legacyCourses,baseConfusionGroups,report}),errors};
  }
  const paths=[];
  for(const path of manifest.courses) {
    if(!safeCoursePath(path)){errors.push(`[manifest] Chemin de cours invalide : ${String(path)}.`);continue;}
    if(paths.includes(path)){errors.push(`[manifest] Chemin de cours dupliqué : ${path}.`);continue;}
    paths.push(path);
  }
  const loaded=await Promise.all(paths.map(async path=>{
    try{return {source:path,pack:await readJson(new URL(path,url))};}
    catch(error){errors.push(`[${path}] Chargement ou JSON invalide : ${error.message}`);return null;}
  }));
  entries.push(...loaded.filter(Boolean));
  const validation=validateContentPacks(entries,{subjects,baseDefinitions,legacyCourses,baseConfusionGroups,report:()=>{}});
  const allErrors=[...errors,...validation.errors];allErrors.forEach(message=>report(`Content Pack ${message}`));
  validation.warnings.forEach(message=>report(`Content Pack avertissement ${message}`));
  return {...validation,manifest,subjectsDocument,subjects,files:paths,errors:allErrors};
}
