export const examPoints = result => result==='exact'?1:result==='almost'?.75:0;
export function examScore(answers) {
  const points=answers.reduce((sum,a)=>sum+examPoints(a.result),0),total=answers.length;
  return {points,total,grade:total?Math.round(points/total*20*100)/100:0,percentage:total?Math.round(points/total*100):0};
}
