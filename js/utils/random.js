export const random = () => Math.random();
export function seededRandom(seed=1) {
  let state=seed>>>0;
  return () => {state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;};
}
export function shuffle(items, rng=random) {
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
