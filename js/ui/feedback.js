import {escapeHTML as e} from './helpers.js';

import {resolveKnownAnswer} from '../progression/confusions.js';
export function feedback(a,bank,combo){
  const title=a.result==='exact'?(a.revenge?'✓ BIEN RÉCUPÉRÉ !':'✓ EXACT !'):a.result==='almost'?'≈ PRESQUE !':a.result==='skip'?'🌱 À RETENIR':'À REVOIR';
  const other=a.result==='wrong'?resolveKnownAnswer(a.value,bank,a.type):null;
  const answerLabel=a.result==='exact'?'À retenir':a.result==='almost'?'Orthographe correcte':'Bonne réponse';
  return `<div class="feedback ${a.result}"><div class="row feedback-heading"><strong>${title}</strong><span>+${a.xp} XP${combo>1?' · 🔥 '+combo:''}</span></div>${a.result==='almost'?`<p class="feedback-note">Tu avais le bon terme. Ta réponse : <strong>${e(a.value)}</strong></p>`:''}<div class="feedback-answer"><p class="eyebrow">${answerLabel}</p><h3>${e(a.notion.terme)}</h3><p>${e(a.notion.definitionCourte)}</p></div><p class="feedback-explanation">${e(a.notion.explication)}</p>${['wrong','skip'].includes(a.result)?`${other?`<div class="confusion"><p>Tu as répondu : <strong>${e(other.terme)}</strong></p><strong>À ne pas confondre :</strong><p>${e(a.notion.terme)} → ${e(a.notion.definitionCourte)}</p><p>${e(other.terme)} → ${e(other.definitionCourte)}</p></div>`:''}<p class="small feedback-return">🌱 Cette notion reviendra bientôt.</p>`:''}</div>`;
}

