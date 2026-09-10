import {getDueNotions,DAY} from '../progression/spaced-repetition.js';
import {confusionWeight} from '../progression/confusions.js';
export const DAILY_LIMIT=20;
export function dailyPriority(notion,user,now) {
  const n=user.notions[notion.id];
  return Math.min(10,(now-n.nextReviewAt)/DAY)+Math.min(5,n.wrongStreak||0)*2+(100-n.recallMastery)/20+confusionWeight(notion.id,user);
}
export function dailyPreset(bank,user,now=Date.now()) {
  const due=getDueNotions(bank,user,now).sort((a,b)=>dailyPriority(b,user,now)-dailyPriority(a,user,now)||a.id.localeCompare(b.id));
  const ids=due.slice(0,DAILY_LIMIT).map(d=>d.id);
  return {mode:'mixed',preset:'daily',ids,count:ids.length};
}
