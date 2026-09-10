import {normalize} from '../js/utils/normalize.js';
export function validateDefinitions(bank, report=console.warn) {
  const ids=new Set(), valid=[], errors=[];
  for(const d of Array.isArray(bank)?bank:[]) {
    if(!d || ['id','terme','definitionCourte','matiere','theme'].some(k=>typeof d[k]!=='string'||!d[k].trim()) || ids.has(d.id) || ![1,2,3].includes(d.difficulte) || !Array.isArray(d.variantesAcceptees) || !d.variantesAcceptees.every(v=>typeof v==='string') || !Array.isArray(d.distracteursProches) || !d.distracteursProches.every(v=>typeof v==='string')) {errors.push(`Notion invalide ignorée : ${d?.id ?? 'sans ID'}`);continue;}
    ids.add(d.id);valid.push(d);
  }
  const terms=new Set(valid.map(d=>normalize(d.terme)));
  for(const d of valid) for(const term of d.distracteursProches) if(!terms.has(normalize(term))) errors.push(`Distracteur absent pour ${d.id} : ${term}`);
  errors.forEach(e=>report(`[GPN banque] ${e}`));
  return {definitions:valid,errors};
}
