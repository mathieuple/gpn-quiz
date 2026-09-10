import {scheduleReview} from './spaced-repetition.js';
export const levels=['À revoir','Fragile','En cours','Acquis','Maîtrisé'];
export const level = score => score>=90?4:score>=75?3:score>=50?2:score>=25?1:0;
export function updateMastery(score, result, type) {return Math.max(0,Math.min(100,score+(result==='skip'?-5:result==='wrong'?-8:result==='almost'?6:type==='qcm'?8:12)));}
export const clampMastery = value => Math.max(0,Math.min(100,Number.isFinite(value)?value:0));
export const combinedMastery = (recognition,recall) => Math.round(clampMastery(recognition)*.35+clampMastery(recall)*.65);
export function recordNotion(previous={}, result, type, now=Date.now(), hint=false) {
  const good=result==='exact'||result==='almost';
  let recognition=clampMastery(previous.recognitionMastery??previous.mastery??0);
  let recall=clampMastery(previous.recallMastery??previous.mastery??0);
  if(type==='qcm') recognition=updateMastery(recognition,result,type);
  else {recall=updateMastery(recall,result,type);if(good)recognition=clampMastery(recognition+(result==='exact'?2:1));}
  return {...previous,recognitionMastery:recognition,recallMastery:recall,mastery:combinedMastery(recognition,recall),timesSeen:(previous.timesSeen||0)+1,timesCorrect:(previous.timesCorrect||0)+(result==='exact'?1:0),timesAlmostCorrect:(previous.timesAlmostCorrect||0)+(result==='almost'?1:0),timesWrong:(previous.timesWrong||0)+(!good?1:0),correctStreak:good?(previous.correctStreak||0)+1:0,wrongStreak:good?0:(previous.wrongStreak||0)+1,lastSeen:now,...scheduleReview(previous,result,type,now,hint)};
}
