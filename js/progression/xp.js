export const xpFor = (result,type,hint) => ['wrong','skip'].includes(result)?0:hint?5:result==='almost'?10:type==='qcm'?10:15;
