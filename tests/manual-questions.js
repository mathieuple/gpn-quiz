import {definitions} from '../data/definitions.js';
import {generateQuestion} from '../js/quiz/question-generator.js';
import {seededRandom} from '../js/utils/random.js';
import {escapeHTML as e} from '../js/ui/helpers.js';
const ids=['hypoxie','stenotherme','biotope','anisoptere','migration','genotype','restauration-ecologique'];
document.querySelector('#samples').innerHTML=ids.map((id,index)=>{
  const notion=definitions.find(d=>d.id===id),q=generateQuestion(notion,definitions,'qcm',{rng:seededRandom(110+index)});
  return `<section class="card stack"><h2>${e(notion.terme)}</h2><p>${e(q.prompt)}</p><ol>${q.options.map(o=>`<li>${e(o.label)}${o.id===id?' ✓':''}</li>`).join('')}</ol></section>`;
}).join('');
