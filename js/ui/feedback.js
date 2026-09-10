import {escapeHTML as e} from './helpers.js';

import {resolveKnownAnswer} from '../progression/confusions.js';
export function feedback(a,bank,combo){
  const title=a.result==='exact'?(a.revenge?'✓ BIEN RÉCUPÉRÉ !':'✓ EXACT !'):a.result==='almost'?'≈ PRESQUE !':a.result==='skip'?'🌱 À RETENIR':'✕ À REVOIR';
  const other=a.result==='wrong'?resolveKnownAnswer(a.value,bank,a.type):null;
  return `<div class="feedback ${a.result}" role="status"><div class="row"><strong>${title}</strong><span>+${a.xp} XP${combo>1?' · 🔥 x'+combo:''}</span></div>${a.result==='almost'?`<p>Tu avais le bon terme.</p><p class="small">Ta réponse : ${e(a.value)}<br>Orthographe correcte :</p>`:''}<h3>${e(a.notion.terme)}</h3><p>${e(a.notion.definitionCourte)}</p><p class="small muted">${e(a.notion.explication)}</p>${['wrong','skip'].includes(a.result)?`${other?`<div class="confusion"><p>Tu as répondu : <strong>${e(other.terme)}</strong></p><strong>À ne pas confondre :</strong><p>${e(a.notion.terme)} → ${e(a.notion.definitionCourte)}</p><p>${e(other.terme)} → ${e(other.definitionCourte)}</p></div>`:''}<p class="small">🌱 Cette notion reviendra bientôt.</p>`:''}</div>`;
}

