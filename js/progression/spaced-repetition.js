export const DAY = 86_400_000;
export const REVIEW_STEPS = [1,3,7,14,30];

export function scheduleReview(previous={}, result, type, now=Date.now(), hint=false) {
  const failed=result==='wrong'||result==='skip';
  if(failed) return {lastReviewAt:now,nextReviewAt:now+DAY/24,reviewInterval:1/24,successfulReviews:0,lastSuccessfulReviewAt:0};
  const independent=!previous.lastSuccessfulReviewAt || now-previous.lastSuccessfulReviewAt>=DAY;
  const successes=Math.min(5,(previous.successfulReviews||0)+(independent&&!hint?1:0));
  let interval=REVIEW_STEPS[Math.max(0,successes-1)];
  if(type==='qcm') interval=Math.min(interval,3);
  if(type==='text'&&Number.isFinite(previous.recallMastery)&&previous.recallMastery<60)interval=Math.min(interval,7);
  if(result==='almost') interval=Math.max(1,interval*.75);
  if(hint) interval=1;
  const proposed=now+interval*DAY;
  const nextReviewAt=!independent&&previous.nextReviewAt>now?Math.min(previous.nextReviewAt,proposed):proposed;
  return {lastReviewAt:now,nextReviewAt,reviewInterval:interval,successfulReviews:successes,lastSuccessfulReviewAt:independent&&!hint?now:(previous.lastSuccessfulReviewAt||0)};
}
export const isDue = (state, now) => Boolean(state?.timesSeen>0 && state.nextReviewAt>0 && state.nextReviewAt<=now);
export function getDueNotions(bank,user,now=Date.now()) {return bank.filter(d=>isDue(user.notions[d.id],now));}
export function nextReviewLabel(state, now=Date.now()) {
  if(!state?.timesSeen) return 'Après ta première révision';
  if(isDue(state,now)) return 'À revoir maintenant';
  if(!state.nextReviewAt) return 'À programmer';
  const days=(state.nextReviewAt-now)/DAY;
  if(days<1) return 'Dans moins de 24 h';
  if(days<2) return 'Demain';
  return `Dans ${Math.ceil(days)} jours`;
}
