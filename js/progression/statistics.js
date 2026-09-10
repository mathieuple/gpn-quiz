export function statistics(bank,user) {
  const states=bank.map(d=>user.notions[d.id]||{});
  const studied=states.filter(n=>n.timesSeen>0);
  const average=(items,key)=>Math.round(items.reduce((s,n)=>s+(n[key]||0),0)/(items.length||1));
  return {mastery:average(states,'mastery'),studiedMastery:average(studied,'mastery'),recognition:average(studied,'recognitionMastery'),recall:average(studied,'recallMastery'),coverage:Math.round(studied.length/(bank.length||1)*100),seen:studied.length,acquired:studied.filter(n=>n.mastery>=75).length,mastered:studied.filter(n=>n.mastery>=90).length};
}
