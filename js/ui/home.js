import {statistics} from '../progression/statistics.js';
import {escapeHTML as e,stat,bar} from './helpers.js';
import {getDueNotions} from '../progression/spaced-repetition.js';
import {dailyPreset} from '../quiz/daily-review.js';
import {courseQuizOptions} from '../courses/course-session.js';
import {renderLeaderboardPreview} from '../leaderboard/leaderboard-ui.js';

const modes=[['mixed','◈','Mixte'],['qcm','▦','QCM'],['text','✎','Saisie libre'],['exam','◷','Examen'],['survival','♡','Survie']];

export function home(root,ctx) {
  const s=statistics(ctx.bank,ctx.user),subjects=[...new Set(ctx.bank.map(d=>d.matiere))],courses=ctx.courseIndex.getAllCourses(),due=getDueNotions(ctx.bank,ctx.user);
  const daily=due.length?`<section class="card daily-card"><div><p class="eyebrow">RÉVISIONS DU JOUR</p><h2>${due.length} notion${due.length>1?'s':''} à revoir</h2><p class="muted small">≈ ${Math.max(1,Math.ceil(Math.min(20,due.length)/3))} min${due.length>20?' · Les 20 prioritaires pour commencer':''}</p></div><button id="daily-start" class="button primary wide">Commencer</button></section>`:'<p class="daily-clear">✓ Tu es à jour pour aujourd’hui.</p>';
  root.innerHTML=`<div class="stack">
    <section class="welcome"><p class="eyebrow">TON TERRAIN D’APPRENTISSAGE</p><h1>Un peu de révision.<br>Beaucoup de nature.</h1><p class="muted">Cours. Définitions. Quiz.</p></section>
    <section class="home-priority" aria-label="À faire maintenant">${daily}</section>
    <nav class="learning-links" aria-label="Apprendre et consulter">
      <a class="learning-link" href="#/courses"><span class="learning-link-icon" aria-hidden="true">▧</span><span><strong>Cours</strong><small>Lire et comprendre</small></span><span aria-hidden="true">→</span></a>
      <a class="learning-link" href="#/notions"><span class="learning-link-icon" aria-hidden="true">▤</span><span><strong>Notions</strong><small>Consulter les définitions</small></span><span aria-hidden="true">→</span></a>
    </nav>
    <form id="session-form" class="stack">
      <section class="hero"><div class="hero-top"><span class="eyebrow">QUIZ</span><span class="hero-symbol" aria-hidden="true">❋</span></div><h2>Tester mes connaissances</h2><p id="session-description">10 questions · Toutes matières · À ton rythme</p><div class="quick-lengths" role="group" aria-label="Nombre de questions">${[5,10,20,Infinity].map(n=>`<label class="chip"><input type="radio" name="count" aria-label="${n===Infinity?'Infini':n+' questions'}" value="${n}" ${n===10?'checked':''}>${n===Infinity?'∞':n}</label>`).join('')}</div><button class="button play" type="submit">Commencer le quiz <span aria-hidden="true">↗</span></button></section>
      <section><div class="section-title"><h2>Mode de révision</h2><span class="muted small">Au choix</span></div><div class="mode-grid">${modes.map(([id,icon,label])=>`<label class="chip"><input type="radio" name="mode" value="${id}" ${id==='mixed'?'checked':''}><span class="mode-icon" aria-hidden="true">${icon}</span>${label}</label>`).join('')}</div></section>
      <details class="card customization"><summary>Personnaliser <span class="muted small">Matière ou cours</span></summary><div class="stack">
        ${courses.length?`<label class="field">Cours à réviser<select name="course"><option value="">Aucun cours ciblé</option>${courses.map(course=>`<option value="${e(course.id)}">${e(course.matiere)} — ${e(course.titre)}</option>`).join('')}</select></label><p class="small muted">Le choix d’un cours limite la session à ses définitions et questions.</p>`:''}
        <fieldset><legend>Matières à réviser</legend><div class="chips">${subjects.map(subject=>`<label class="chip"><input type="checkbox" name="subject" value="${e(subject)}">${e(subject)}</label>`).join('')}</div></fieldset>
        <button id="all-subjects" type="button" class="button text">Toutes les matières</button>
      </div></details>
    </form>
    <section class="card home-progress"><div class="section-title"><h2>Ma progression</h2><a href="#/progress">Voir le détail →</a></div><div class="stats-strip">${stat(s.seen+'/'+ctx.bank.length,'notions explorées')}${stat(ctx.user.xp,'XP récoltés')}${stat(ctx.user.bestCombo,'meilleure série')}</div>${bar(s.coverage,'Couverture des notions')}<p class="small muted">${s.coverage} % de couverture · ${s.studiedMastery} % de maîtrise des notions étudiées</p></section>
    <section class="card leaderboard-card"><div class="section-title"><h2>🏆 Meilleurs combos</h2><a id="leaderboard-link" href="#/progress">Voir le classement →</a></div><div id="leaderboard-preview" aria-live="polite"></div></section>
  </div>`;
  root.querySelector('#daily-start')?.addEventListener('click',()=>ctx.start(dailyPreset(ctx.bank,ctx.user)));
  const form=root.querySelector('form');
  form.onchange=event=>{
    if(event.target.name==='mode'&&event.target.value==='exam')form.querySelector('[name=count][value="20"]').checked=true;
    const data=new FormData(form),mode=data.get('mode'),course=ctx.courseIndex.getCourseById(data.get('course'));
    root.querySelector('#session-description').textContent=mode==='exam'?'Examen · Correction à la fin · Sans indice':mode==='survival'?'3 vies · Difficulté progressive':`${data.get('count')==='Infinity'?'À volonté':data.get('count')+' questions'} · ${course?course.titre:data.getAll('subject').length||'Toutes matières'} · À ton rythme`;
  };
  root.querySelector('#all-subjects').onclick=()=>{form.querySelectorAll('[name=subject]').forEach(input=>input.checked=false);form.dispatchEvent(new Event('change'));};
  form.onsubmit=event=>{
    event.preventDefault();
    const data=new FormData(form),mode=data.get('mode'),count=mode==='exam'&&data.get('count')==='Infinity'?20:Number(data.get('count')),course=ctx.courseIndex.getCourseById(data.get('course'));
    ctx.start(course?{...courseQuizOptions(course),mode,count}:{mode,count,subjects:data.getAll('subject')});
  };
  root.querySelector('#leaderboard-link').onclick=event=>{event.preventDefault();ctx.navigate('/progress');setTimeout(()=>document.querySelector('#leaderboard')?.scrollIntoView({behavior:'smooth'}),0);};
  renderLeaderboardPreview(root.querySelector('#leaderboard-preview'),ctx);
}
