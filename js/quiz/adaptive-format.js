import {random} from '../utils/random.js';
export function recallProbability(state) {
  if(!state?.timesSeen)return .25;
  if(state.recognitionMastery>75&&state.recallMastery<60)return .9;
  if(state.recognitionMastery<25)return .3;
  return .65;
}
export const adaptiveFormat = (state,rng=random) => rng()<recallProbability(state)?'text':'qcm';
