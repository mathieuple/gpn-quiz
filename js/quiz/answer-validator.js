import {normalize} from '../utils/normalize.js';
import {levenshtein} from '../utils/levenshtein.js';
const variants = d => [d.terme,...(d.variantesAcceptees || [])].map(normalize);
const tolerance = s => s.length>=13?2:s.length>=6?1:0;
export function isKnownDifferentTerm(answer, expected, bank) {
  const a=normalize(answer);
  return bank.some(d=>d.id!==expected.id && variants(d).some(v=>levenshtein(a,v)<=tolerance(v)));
}
export function validateAnswer(answer, expected, bank) {
  const a=normalize(answer), accepted=variants(expected);
  if(!a) return 'wrong';
  if(accepted.includes(a)) return 'exact';
  if(isKnownDifferentTerm(a,expected,bank)) return 'wrong';
  return accepted.some(v=>levenshtein(a,v)<=tolerance(v))?'almost':'wrong';
}
