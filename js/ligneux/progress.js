export const createLigneuxProgress=()=>({version:1,totalAnswered:0,correct:0,wrong:0,species:{},photos:{},examHistory:[],updatedAt:0});
const count=value=>Number.isFinite(value)?Math.max(0,Math.floor(value)):0;
const object=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};

export function normalizeLigneuxProgress(input){
  const source=object(input),out=createLigneuxProgress();
  out.totalAnswered=count(source.totalAnswered);out.correct=count(source.correct);out.wrong=count(source.wrong);out.updatedAt=count(source.updatedAt);
  for(const [id,value] of Object.entries(object(source.species))){
    const item=object(value);out.species[id]={seen:count(item.seen),correct:count(item.correct),wrong:count(item.wrong),streak:count(item.streak),lastSeen:count(item.lastSeen)};
  }
  for(const [id,value] of Object.entries(object(source.photos))){
    const item=object(value);out.photos[id]={shown:count(item.shown),correct:count(item.correct),wrong:count(item.wrong),lastSeen:count(item.lastSeen)};
  }
  if(Array.isArray(source.examHistory))out.examHistory=source.examHistory.slice(-20).filter(item=>item&&Number.isFinite(item.total)&&Number.isFinite(item.correct)).map(item=>({date:count(item.date),total:count(item.total),correct:count(item.correct),percentage:count(item.percentage),grade:Number.isFinite(item.grade)?Math.max(0,Math.min(20,item.grade)):0}));
  return out;
}

export function recordLigneuxAnswer(progress,answer){
  const now=answer.answeredAt||Date.now(),speciesId=answer.species.id,photoId=answer.photo?.id;
  progress.totalAnswered++;progress[answer.correct?'correct':'wrong']++;progress.updatedAt=now;
  const species=progress.species[speciesId]||{seen:0,correct:0,wrong:0,streak:0,lastSeen:0};
  species.seen++;species[answer.correct?'correct':'wrong']++;species.streak=answer.correct?species.streak+1:0;species.lastSeen=now;progress.species[speciesId]=species;
  if(photoId){const photo=progress.photos[photoId]||{shown:0,correct:0,wrong:0,lastSeen:0};photo.shown++;photo[answer.correct?'correct':'wrong']++;photo.lastSeen=now;progress.photos[photoId]=photo;}
}

export function recordLigneuxExam(progress,answers,now=Date.now()){
  const correct=answers.filter(answer=>answer.correct).length,total=answers.length,percentage=total?Math.round(correct/total*100):0;
  progress.examHistory=[...progress.examHistory,{date:now,total,correct,percentage,grade:total?Math.round(correct/total*2000)/100:0}].slice(-20);progress.updatedAt=now;
}

export function ligneuxProgressStats(progress,totalSpecies){
  const met=Object.keys(progress.species).length,percentage=progress.totalAnswered?Math.round(progress.correct/progress.totalAnswered*100):0;
  return {met,totalSpecies,unseen:Math.max(0,totalSpecies-met),percentage,totalAnswered:progress.totalAnswered};
}
