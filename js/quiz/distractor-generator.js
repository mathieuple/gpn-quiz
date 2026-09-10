import {normalize} from '../utils/normalize.js';
import {shuffle} from '../utils/random.js';
import {areAmbiguous} from './equivalence.js';
import {inConfusionGroup} from '../../data/confusion-groups.js';
import {confusionKey} from '../progression/confusions.js';

export function distractorScore(expected,candidate,user={}) {
  if(areAmbiguous(expected,candidate))return -Infinity;
  const explicit=expected.distracteursProches.some(t=>normalize(t)===normalize(candidate.terme));
  const reciprocal=candidate.distracteursProches.some(t=>normalize(t)===normalize(expected.terme));
  const base=explicit?100:reciprocal?90:inConfusionGroup(expected.id,candidate.id)?80:expected.theme===candidate.theme?60:expected.matiere===candidate.matiere?40:Math.abs(expected.difficulte-candidate.difficulte)<=1?10:1;
  const personal=Math.min(5,(user.confusions?.[confusionKey(expected.id,candidate.id)]?.count||0)*.5);
  return base+personal+(2-Math.abs(expected.difficulte-candidate.difficulte));
}

export function distractors(expected,bank,field='terme',options={}) {
  const chosen=[],seen=new Set([normalize(expected[field])]);
  const ranked=shuffle(bank,options.rng).map(d=>({d,score:distractorScore(expected,d,options.user)})).sort((a,b)=>b.score-a.score);
  for(const {d,score} of ranked) {
    if(score<(options.minScore??0)||seen.has(normalize(d[field]))||chosen.some(other=>areAmbiguous(d,other)))continue;
    chosen.push(d);seen.add(normalize(d[field]));if(chosen.length===3)break;
  }
  return chosen;
}
