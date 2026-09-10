import {combinedMastery} from '../progression/mastery.js';
import {DAY} from '../progression/spaced-repetition.js';
import {normalizeLeaderboardProfile} from '../leaderboard/leaderboard-state.js';

export const SCHEMA_VERSION=4;
export const createDefaultNotionProgress=()=>({mastery:0,recognitionMastery:0,recallMastery:0,timesSeen:0,timesCorrect:0,timesAlmostCorrect:0,timesWrong:0,correctStreak:0,wrongStreak:0,lastSeen:0,lastReviewAt:0,nextReviewAt:0,reviewInterval:0,successfulReviews:0,lastSuccessfulReviewAt:0,updatedAt:0});
export const createDefaultSettings=()=>({theme:'auto',animations:true,sound:false,updatedAt:0});
export const defaults=()=>({version:1,schemaVersion:SCHEMA_VERSION,updatedAt:0,statsUpdatedAt:0,xp:0,bestCombo:0,survivalRecord:0,notions:{},confusions:{},settings:createDefaultSettings(),profile:normalizeLeaderboardProfile()});

const record=value=>Boolean(value&&typeof value==='object'&&!Array.isArray(value));
const safeId=id=>typeof id==='string'&&id.trim().length>0&&!['__proto__','constructor','prototype'].includes(id);
const number=(value,max=Number.MAX_SAFE_INTEGER)=>Number.isFinite(value)?Math.max(0,Math.min(max,Math.floor(value))):0;
const date=value=>number(value);

function assertCompatible(input) {
  if(!record(input)||(input.version!==undefined&&input.version!==1)||(input.schemaVersion!==undefined&&![1,2,3,4].includes(input.schemaVersion))||(input.schemaRevision!==undefined&&![1,2].includes(input.schemaRevision)))throw new Error('Version ou structure de sauvegarde incompatible.');
}

export function migrate(input) {
  assertCompatible(input);
  const out=defaults();
  for(const key of ['xp','bestCombo','survivalRecord'])out[key]=number(input[key]);
  out.statsUpdatedAt=date(input.statsUpdatedAt??input.updatedAt);
  if(record(input.notions))for(const [id,n] of Object.entries(input.notions)) {
    if(!safeId(id)||!record(n))continue;
    const state=createDefaultNotionProgress();
    for(const key of ['timesSeen','timesCorrect','timesAlmostCorrect','timesWrong','correctStreak','wrongStreak'])state[key]=number(n[key]);
    state.recognitionMastery=number(n.recognitionMastery??n.mastery,100);
    state.recallMastery=number(n.recallMastery??n.mastery,100);
    state.mastery=combinedMastery(state.recognitionMastery,state.recallMastery);
    state.lastSeen=date(n.lastSeen);
    state.lastReviewAt=date(n.lastReviewAt??n.lastSeen);
    state.nextReviewAt=date(n.nextReviewAt??(state.timesSeen?(state.lastReviewAt?state.lastReviewAt+DAY:1):0));
    state.reviewInterval=Number.isFinite(n.reviewInterval)?Math.max(0,Math.min(30,n.reviewInterval)):state.timesSeen?1:0;
    state.successfulReviews=number(n.successfulReviews,5);
    state.lastSuccessfulReviewAt=date(n.lastSuccessfulReviewAt);
    state.updatedAt=date(n.updatedAt??Math.max(state.lastSeen,state.lastReviewAt,state.lastSuccessfulReviewAt));
    out.notions[id]=state;
  }
  if(record(input.confusions))for(const [key,value] of Object.entries(input.confusions)) {
    const ids=key.split('|');
    if(ids.length!==2||ids[0]===ids[1]||ids.some(id=>!safeId(id))||!record(value))continue;
    const canonical=ids.sort().join('|'),old=out.confusions[canonical],lastSeen=date(value.lastSeen),updatedAt=date(value.updatedAt??lastSeen);
    out.confusions[canonical]={count:number((old?.count||0)+number(value.count)),lastSeen:Math.max(old?.lastSeen||0,lastSeen),updatedAt:Math.max(old?.updatedAt||0,updatedAt)};
  }
  if(['auto','light','dark'].includes(input.settings?.theme))out.settings.theme=input.settings.theme;
  for(const key of ['animations','sound'])if(typeof input.settings?.[key]==='boolean')out.settings[key]=input.settings[key];
  out.settings.updatedAt=date(input.settings?.updatedAt);
  out.profile=normalizeLeaderboardProfile(input.profile,out.bestCombo);
  const childUpdates=[out.statsUpdatedAt,out.settings.updatedAt,out.profile.displayNameUpdatedAt,...Object.values(out.notions).map(n=>n.updatedAt),...Object.values(out.confusions).map(c=>c.updatedAt)];
  out.updatedAt=Math.max(date(input.updatedAt),...childUpdates);
  return out;
}

export function validateUserData(input,{requireVersion=false}={}) {
  const errors=[],fatalErrors=[];
  const fatal=message=>{errors.push(message);fatalErrors.push(message);};
  if(!record(input)){fatal('La sauvegarde doit être un objet.');return {valid:false,data:null,errors,fatalErrors};}
  if(requireVersion&&input.version!==1)fatal('Version de sauvegarde absente ou incompatible.');
  try{assertCompatible(input);}catch(error){fatal(error.message);}
  for(const key of ['xp','bestCombo','survivalRecord'])if(input[key]!==undefined&&(!Number.isFinite(input[key])||input[key]<0))fatal(`${key} doit être un nombre positif.`);
  if(input.notions!==undefined&&!record(input.notions))fatal('notions doit être un objet indexé par ID.');
  if(record(input.notions))for(const [id,state] of Object.entries(input.notions)) {
    if(!safeId(id)||!record(state)){fatal(`Progression invalide pour l’ID ${id||'(vide)'}.`);continue;}
    for(const key of ['mastery','recognitionMastery','recallMastery'])if(state[key]!==undefined&&(!Number.isFinite(state[key])||state[key]<0||state[key]>100))errors.push(`${id}.${key} sera ramené entre 0 et 100.`);
    for(const key of ['timesSeen','timesCorrect','timesAlmostCorrect','timesWrong','correctStreak','wrongStreak','reviewInterval','successfulReviews'])if(state[key]!==undefined&&(!Number.isFinite(state[key])||state[key]<0))errors.push(`${id}.${key} sera ramené à une valeur positive.`);
    for(const key of ['lastSeen','lastReviewAt','nextReviewAt','lastSuccessfulReviewAt','updatedAt'])if(state[key]!==undefined&&(!Number.isFinite(state[key])||state[key]<0))errors.push(`${id}.${key} contient une date invalide et sera réinitialisé.`);
  }
  if(input.confusions!==undefined&&!record(input.confusions))fatal('confusions doit être un objet indexé par deux IDs.');
  if(record(input.confusions))for(const [key,value] of Object.entries(input.confusions)){const ids=key.split('|');if(ids.length!==2||ids[0]===ids[1]||ids.some(id=>!safeId(id))||!record(value))fatal(`Confusion invalide : ${key||'(vide)'}.`);}
  if(input.settings!==undefined&&!record(input.settings))fatal('settings doit être un objet.');
  if(record(input.settings)){
    if(input.settings.theme!==undefined&&!['auto','light','dark'].includes(input.settings.theme))errors.push('settings.theme sera réinitialisé.');
    for(const key of ['animations','sound'])if(input.settings[key]!==undefined&&typeof input.settings[key]!=='boolean')errors.push(`settings.${key} sera réinitialisé.`);
    if(input.settings.updatedAt!==undefined&&(!Number.isFinite(input.settings.updatedAt)||input.settings.updatedAt<0))errors.push('settings.updatedAt contient une date invalide et sera réinitialisé.');
  }
  if(input.profile!==undefined&&!record(input.profile))fatal('profile doit être un objet.');
  if(record(input.profile)){
    if(input.profile.displayName!==undefined&&typeof input.profile.displayName!=='string')fatal('profile.displayName doit être du texte.');
    if(input.profile.leaderboardSyncPending!==undefined&&typeof input.profile.leaderboardSyncPending!=='boolean')errors.push('profile.leaderboardSyncPending sera réinitialisé.');
    for(const key of ['displayNameUpdatedAt','lastSyncedBestCombo'])if(input.profile[key]!==undefined&&(!Number.isFinite(input.profile[key])||input.profile[key]<0))errors.push(`profile.${key} sera réinitialisé.`);
  }
  for(const key of ['updatedAt','statsUpdatedAt'])if(input[key]!==undefined&&(!Number.isFinite(input[key])||input[key]<0))errors.push(`${key} contient une date invalide et sera réinitialisé.`);
  if(fatalErrors.length)return {valid:false,data:null,errors,fatalErrors};
  return {valid:true,data:migrate(input),errors,fatalErrors};
}
