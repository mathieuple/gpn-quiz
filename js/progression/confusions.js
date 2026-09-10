import {normalize} from '../utils/normalize.js';
import {aliases,areAmbiguous} from '../quiz/equivalence.js';
export const confusionKey = (a,b) => [a,b].sort().join('|');
export function resolveKnownAnswer(value,bank,type='text') {
  if(type==='qcm')return bank.find(d=>d.id===value)||null;
  const text=normalize(value),exact=bank.find(d=>normalize(d.terme)===text);
  if(exact)return exact;
  const matches=bank.filter(d=>aliases(d).has(text));
  return matches.length===1?matches[0]:null;
}
export function recordConfusion(user,answer,bank,now=Date.now()) {
  if(answer.result!=='wrong')return null;
  const other=resolveKnownAnswer(answer.value,bank,answer.type);
  if(!other||other.id===answer.notion.id||areAmbiguous(answer.notion,other))return null;
  user.confusions??={};
  const key=confusionKey(answer.notion.id,other.id);
  user.confusions[key]={count:(user.confusions[key]?.count||0)+1,lastSeen:now};
  return key;
}
export function confusionWeight(id,user) {
  let count=0;
  for(const [key,value] of Object.entries(user.confusions||{}))if(key.split('|').includes(id))count+=value.count;
  return Math.min(2,count*.2);
}
export function topConfusions(bank,user,limit=5) {
  return Object.entries(user.confusions||{}).map(([key,value])=>({key,...value,notions:key.split('|').map(id=>bank.find(d=>d.id===id))})).filter(c=>c.count>0&&c.notions.every(Boolean)).sort((a,b)=>b.count-a.count||b.lastSeen-a.lastSeen).slice(0,limit);
}
