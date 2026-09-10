import {normalize} from '../utils/normalize.js';
import {aliases, ambiguityReason} from './equivalence.js';

export function auditDistractors(bank) {
  const references = [];
  for (const notion of bank) {
    const seen = new Set();
    for (const reference of notion.distracteursProches) {
      const key = normalize(reference);
      const exact = bank.find(d => normalize(d.terme) === key);
      const matches = bank.filter(d => aliases(d).has(key));
      const target = exact || (matches.length === 1 ? matches[0] : null);
      const duplicate = seen.has(target?.id || key);
      seen.add(target?.id || key);
      const reason = target ? ambiguityReason(notion,target) : '';
      const synonym = !exact && matches.length > 0;
      const status = duplicate ? 'duplicate' : reason ? 'ambiguous' : target ? (exact?'valid':'alias') : 'missing';
      references.push({id:notion.id,reference,targetId:target?.id || null,status,missing:!exact,duplicate,synonym,reason:reason || (!target&&key==='botanique'?'La définition de Phytologie indique le synonyme Botanique.':'')});
    }
  }
  const equivalences=[];
  for(let i=0;i<bank.length;i++) for(let j=i+1;j<bank.length;j++) {
    const reason=ambiguityReason(bank[i],bank[j]);
    if(reason)equivalences.push({ids:[bank[i].id,bank[j].id],reason});
  }
  return {references,equivalences};
}
