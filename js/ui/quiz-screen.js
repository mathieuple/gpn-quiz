import {escapeHTML as e,playSound} from './helpers.js';
import {feedback} from './feedback.js';
export function quizScreen(root,ctx){
  const session=ctx.session;if(!session){ctx.navigate('/');return;}
  if(session.finished){ctx.navigate('/results');return;}
  const q=session.current&&!session.answered?session.current:session.next(),exam=session.options.mode==='exam';
  const total=Number.isFinite(session.limit)?session.limit:'∞';
  root.innerHTML=`<div class="row question-meta"><span class="session-count">${exam?'EXAMEN':session.options.mode==='survival'?'SURVIE':session.options.preset==='daily'?'RÉVISIONS DU JOUR':session.options.preset==='confusion'?'À NE PAS CONFONDRE':session.options.preset==='course'?'RÉVISION DU COURS':'EN RÉVISION'} · ${session.answers.length+1} / ${total}</span><button id="stop" type="button" class="button text">Terminer</button></div><progress aria-label="Progression de la session" ${total==='∞'?'':`value="${session.answers.length}" max="${session.limit}"`}></progress><section class="card question-card" aria-labelledby="question-prompt"><div class="row wrap-mobile"><span class="badge">${e(q.notion.matiere)}</span>${!exam?`<span class="small">${session.options.mode==='survival'?'❤️'.repeat(session.lives):'🔥 x'+session.combo}</span>`:''}</div><p class="eyebrow mt">${q.revenge?'🌱 REVANCHE · ':''}${e(q.notion.theme)}</p><h1 id="question-prompt" class="question-prompt">${e(q.prompt)}</h1><div id="response-area">${q.type==='qcm'?`<div class="answers">${q.options.map((option,i)=>`<button type="button" class="answer" data-answer="${e(option.id)}"><span class="answer-letter">${'ABCD'[i]}</span><span>${e(option.label)}</span></button>`).join('')}</div>`:`<form id="answer-form" class="stack"><label class="field" for="answer-input">${e(q.answerLabel||'Quel est le terme ?')}<input id="answer-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" enterkeyhint="done" maxlength="200" placeholder="Ta réponse…" required></label><button class="button primary wide" type="submit">Valider</button></form>`}<div class="question-actions">${!exam&&q.type==='text'?'<button id="hint" type="button" class="button text">💡 Indice</button>':'<span></span>'}<button id="skip" type="button" class="button text">Je ne sais pas</button></div><p id="hint-text" role="status" class="small muted"></p></div><div id="feedback-area" role="status" aria-live="polite" aria-atomic="true"></div></section>`;
  function submit(value,skip=false){const a=session.submit(value,skip);if(!a)return;ctx.persist();if(exam){if(session.finished)ctx.navigate('/results');else quizScreen(root,ctx);return;}
    root.querySelectorAll('#response-area button,#response-area input').forEach(b=>b.disabled=true);
    root.querySelectorAll('[data-answer]').forEach(b=>{if(b.dataset.answer===q.notion.id)b.classList.add('correct');else if(b.dataset.answer===value)b.classList.add('incorrect');});
    playSound(['exact','almost'].includes(a.result),ctx.user.settings);
    root.querySelector('#feedback-area').innerHTML=feedback(a,ctx.bank,session.combo)+`<button id="next" type="button" class="button primary wide mt">${session.finished?'Voir mes résultats':'Continuer →'}</button>`;
    const next=root.querySelector('#next');next.onclick=()=>session.finished?ctx.navigate('/results'):quizScreen(root,ctx);next.focus({preventScroll:true});next.scrollIntoView({block:'nearest',behavior:'instant'});
  }
  root.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>submit(b.dataset.answer));
  const form=root.querySelector('#answer-form');if(form)form.onsubmit=event=>{event.preventDefault();const input=root.querySelector('#answer-input');if(input.value.trim())submit(input.value.trim());};
  root.querySelector('#skip').onclick=()=>submit('',true);
  const hint=root.querySelector('#hint');if(hint)hint.onclick=()=>{session.hint=true;hint.disabled=true;root.querySelector('#hint-text').textContent=`Première lettre : ${q.notion.terme[0].toUpperCase()}`;};
  root.querySelector('#stop').onclick=()=>{session.finish();ctx.persist();ctx.navigate('/results');};
  const heading=root.querySelector('h1');heading.tabIndex=-1;heading.focus({preventScroll:true});window.scrollTo(0,0);
}

