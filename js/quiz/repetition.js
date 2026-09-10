import {random} from '../utils/random.js';
import {isDue} from '../progression/spaced-repetition.js';
import {confusionWeight} from '../progression/confusions.js';
export function chooseNotion(pool,user,recent,queue,index,rng=random,now=Date.now()) {
  const eligible=queue.find(q=>q.due<=index&&q.id!==recent.at(-1)&&pool.some(d=>d.id===q.id));
  if(eligible){queue.splice(queue.indexOf(eligible),1);return {notion:pool.find(d=>d.id===eligible.id),revenge:true};}
  let candidates=pool.filter(d=>d.id!==recent.at(-1));if(!candidates.length)candidates=pool;
  const notPending=candidates.filter(d=>!queue.some(q=>q.id===d.id&&q.due>index));if(notPending.length)candidates=notPending;
  const last=pool.find(d=>d.id===recent.at(-1));
  const weighted=candidates.map(d=>{const n=user.notions[d.id];let weight=!n?.timesSeen?12:2+(100-n.mastery)/12+Math.min(5,n.wrongStreak||0)*2+Math.min(5,Math.max(0,now-n.lastSeen)/86400000/7);weight+=confusionWeight(d.id,user)+(isDue(n,now)?4:0);if(recent.includes(d.id))weight*=0.08;if(last?.theme===d.theme)weight*=0.5;if(last?.matiere===d.matiere)weight*=0.8;return {d,weight};});
  let ticket=rng()*weighted.reduce((s,x)=>s+x.weight,0);
  return {notion:(weighted.find(x=>(ticket-=x.weight)<=0)||weighted.at(-1)).d,revenge:false};
}
