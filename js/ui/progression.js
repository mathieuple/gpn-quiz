import {statistics} from '../progression/statistics.js';
import {escapeHTML as e,stat,bar} from './helpers.js';
import {topConfusions} from '../progression/confusions.js';
import {getDueNotions} from '../progression/spaced-repetition.js';

function dimensions(stats) {
  return `<div class="progress-subject"><div class="row small"><span>Reconnaissance</span><strong>${stats.recognition} %</strong></div>${bar(stats.recognition,'Reconnaissance')}</div><div class="progress-subject"><div class="row small"><span>Rappel actif</span><strong>${stats.recall} %</strong></div>${bar(stats.recall,'Rappel actif')}</div>`;
}

export function progression(root,ctx) {
  const s=statistics(ctx.bank,ctx.user),subjects=[...new Set(ctx.bank.map(d=>d.matiere))];
  const weak=ctx.bank.filter(d=>ctx.user.notions[d.id]?.timesSeen>0).sort((a,b)=>ctx.user.notions[a.id].recallMastery-ctx.user.notions[b.id].recallMastery).slice(0,10);
  const confusions=topConfusions(ctx.bank,ctx.user);
  root.innerHTML=`<div class="stack">
    <div><p class="eyebrow">CHAQUE NOTION COMPTE</p><h1 class="mt">Tes connaissances<br>prennent racine.</h1></div>
    <section class="card stack"><div class="row"><h2>Couverture</h2><strong>${s.coverage} %</strong></div>${bar(s.coverage,'Couverture')}<p>${s.seen} / ${ctx.bank.length} notions étudiées</p>
      <div class="divider"></div><div class="row wrap-mobile"><h2>Maîtrise des notions étudiées</h2><strong>${s.studiedMastery} %</strong></div><p class="small muted">Les notions nouvelles ne baissent pas cette moyenne. Le rappel actif pèse 65 %, la reconnaissance 35 %.</p>${dimensions(s)}
      <div class="divider"></div><div class="stats-strip">${stat(s.acquired,'acquises')}${stat(s.mastered,'maîtrisées')}${stat(getDueNotions(ctx.bank,ctx.user).length,'révisions dues')}</div>
      <div class="stats-strip">${stat(ctx.user.xp,'XP')}${stat(ctx.user.bestCombo,'meilleur combo')}${stat(ctx.user.survivalRecord,'record survie')}</div></section>
    <section class="card stack"><h2>Sur chaque terrain</h2>${subjects.map(subject=>{const st=statistics(ctx.bank.filter(d=>d.matiere===subject),ctx.user);return `<div class="stack subject-stats"><h3>${e(subject)}</h3><p class="small muted">Couverture : ${st.coverage} % · ${st.seen} notions étudiées</p>${dimensions(st)}</div>`;}).join('')}</section>
    ${confusions.length?`<section class="stack"><h2>À ne pas confondre</h2>${confusions.map(c=>`<button class="card confusion-pair" data-confusion="${e(c.key)}"><strong>${c.notions.map(d=>e(d.terme)).join(' ↔ ')}</strong><span class="small muted">${c.count} confusion${c.count>1?'s':''} · Réviser cette paire</span></button>`).join('')}</section>`:''}
    <section class="stack"><h2>Tes points faibles</h2>${weak.length?`<p class="muted small">Les notions étudiées avec le rappel actif le plus faible.</p><div class="card stack">${weak.map(d=>`<div class="row"><span>${e(d.terme)}</span><span class="muted small">${ctx.user.notions[d.id].recallMastery} %</span></div>`).join('')}</div><button id="weak" class="button primary">Réviser mes points faibles</button>`:'<div class="card"><p class="muted">Ton carnet est encore vierge. Lance une première session.</p><a href="#/" class="button primary mt">Commencer à réviser</a></div>'}</section></div>`;
  root.querySelector('#weak')?.addEventListener('click',()=>ctx.start({mode:'mixed',count:10,ids:weak.map(d=>d.id)}));
  root.querySelectorAll('[data-confusion]').forEach(button=>button.onclick=()=>ctx.start({mode:'mixed',preset:'confusion',count:6,ids:button.dataset.confusion.split('|')}));
}
