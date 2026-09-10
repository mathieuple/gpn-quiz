import {combinedMastery} from '../progression/mastery.js';
import {DAY} from '../progression/spaced-repetition.js';
export const SCHEMA_REVISION=2;
export const defaults=()=>({version:1,schemaRevision:SCHEMA_REVISION,xp:0,bestCombo:0,survivalRecord:0,notions:{},confusions:{},settings:{theme:'auto',animations:true,sound:false}});
const number=(value,max=Number.MAX_SAFE_INTEGER)=>Number.isFinite(value)?Math.max(0,Math.min(max,Math.floor(value))):0;
export function migrate(input) {
  if(!input||typeof input!=='object'||Array.isArray(input)||(input.version!==undefined&&input.version!==1)||(input.schemaRevision!==undefined&&![1,2].includes(input.schemaRevision))) throw new Error('Version ou structure de sauvegarde incompatible.');
  const out=defaults();
  for(const key of ['xp','bestCombo','survivalRecord']) out[key]=number(input[key]);
  if(input.notions&&typeof input.notions==='object'&&!Array.isArray(input.notions)) for(const [id,n] of Object.entries(input.notions)) {
    if(['__proto__','constructor','prototype'].includes(id)||!n||typeof n!=='object')continue;
    out.notions[id]={};
    for(const key of ['mastery','timesSeen','timesCorrect','timesAlmostCorrect','timesWrong','correctStreak','wrongStreak','lastSeen']) out.notions[id][key]=number(n[key],key==='mastery'?100:Number.MAX_SAFE_INTEGER);
    const state=out.notions[id];
    state.recognitionMastery=number(n.recognitionMastery??n.mastery,100);
    state.recallMastery=number(n.recallMastery??n.mastery,100);
    state.mastery=combinedMastery(state.recognitionMastery,state.recallMastery);
    state.lastReviewAt=number(n.lastReviewAt??n.lastSeen);
    state.nextReviewAt=number(n.nextReviewAt??(state.timesSeen?(state.lastReviewAt?state.lastReviewAt+DAY:1):0));
    state.reviewInterval=Number.isFinite(n.reviewInterval)?Math.max(0,Math.min(30,n.reviewInterval)):state.timesSeen?1:0;
    state.successfulReviews=number(n.successfulReviews,5);
    state.lastSuccessfulReviewAt=number(n.lastSuccessfulReviewAt);
  }
  if(input.confusions&&typeof input.confusions==='object'&&!Array.isArray(input.confusions)) for(const [key,value] of Object.entries(input.confusions)) {
    const ids=key.split('|');
    if(ids.length!==2||ids[0]===ids[1]||ids.some(id=>!id||['__proto__','constructor','prototype'].includes(id))||!value||typeof value!=='object')continue;
    const canonical=ids.sort().join('|'),old=out.confusions[canonical];
    out.confusions[canonical]={count:number((old?.count||0)+number(value.count)),lastSeen:Math.max(old?.lastSeen||0,number(value.lastSeen))};
  }
  if(['auto','light','dark'].includes(input.settings?.theme)) out.settings.theme=input.settings.theme;
  for(const k of ['animations','sound']) if(typeof input.settings?.[k]==='boolean')out.settings[k]=input.settings[k];
  return out;
}
