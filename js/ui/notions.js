import {escapeHTML as e,bar} from './helpers.js';
import {levels,level} from '../progression/mastery.js';
import {normalize} from '../utils/normalize.js';
import {nextReviewLabel} from '../progression/spaced-repetition.js';

function detail(d,n,ctx) {
  const studied=n.timesSeen>0,score=n.mastery||0;
  const courses=ctx.courseIndex.getCoursesForDefinition(d.id);
  return `<details class="card notion-row"><summary><span><span class="level-dot ${studied?'level-'+level(score):'level-new'}"></span>${e(d.terme)}</span><small class="muted">${studied?score+' %':'Nouvelle'}</small></summary><div class="notion-detail">
    <p class="small muted">${e(d.matiere)} · ${e(d.theme)}</p><p>${e(d.definitionCourte)}</p><p class="muted small">${e(d.explication)}</p>
    ${studied?`<div class="row small"><span>Reconnaissance</span><strong>${n.recognitionMastery} %</strong></div>${bar(n.recognitionMastery,'Reconnaissance de '+d.terme)}<div class="row small"><span>Rappel actif</span><strong>${n.recallMastery} %</strong></div>${bar(n.recallMastery,'Rappel actif de '+d.terme)}`:''}
    <p class="small">${studied?levels[level(score)]:'⚪ Nouvelle'} · ${n.timesSeen||0} tentatives · ${(n.timesCorrect||0)+(n.timesAlmostCorrect||0)} réussites</p>
    ${courses.length?`<div class="definition-courses"><p class="eyebrow">VU DANS</p>${courses.map(course=>`<a href="#/course/${e(course.id)}"><span>${e(course.matiere)}</span><strong>→ ${e(course.titre)}</strong></a>`).join('')}</div>`:''}
    <p class="small"><strong>Prochaine révision</strong><br>${nextReviewLabel(n)}</p><p class="small muted">Dernière révision : ${n.lastSeen?new Date(n.lastSeen).toLocaleDateString('fr-FR'):'pas encore explorée'}</p><button class="button" data-revise="${e(d.id)}">Réviser cette notion</button></div></details>`;
}

export function notions(root,ctx,options={}) {
  root.innerHTML=`<div class="stack"><div><p class="eyebrow">LE CARNET NATURALISTE</p><h1 class="mt">Les notions</h1><p class="muted mt">${ctx.bank.length} petites clés pour comprendre le vivant.</p></div><label class="field">Rechercher une notion<input id="search" type="search" placeholder="Un terme, un thème, une définition…"></label><div class="filter-grid"><label class="field">Matière<select id="subject"><option value="">Toutes les matières</option>${[...new Set(ctx.bank.map(d=>d.matiere))].map(s=>`<option>${e(s)}</option>`).join('')}</select></label><label class="field">Maîtrise<select id="level"><option value="">Tous les niveaux</option><option value="new">⚪ Nouvelles</option>${levels.map((l,i)=>`<option value="${i}">${l}</option>`).join('')}</select></label></div><p id="notion-count" class="small muted" role="status"></p><div id="notion-list" class="notion-list"></div></div>`;
  function render() {
    const search=normalize(root.querySelector('#search').value),subject=root.querySelector('#subject').value,selected=root.querySelector('#level').value;
    const bank=ctx.bank.filter(d=>{
      const n=ctx.user.notions[d.id]||{},studied=n.timesSeen>0;
      const matchesLevel=selected===''||(selected==='new'?!studied:studied&&level(n.mastery||0)===Number(selected));
      return (!subject||d.matiere===subject)&&matchesLevel&&normalize([d.terme,d.theme,d.definitionCourte].join(' ')).includes(search);
    });
    root.querySelector('#notion-count').textContent=`${bank.length} notion${bank.length>1?'s':''}`;
    root.querySelector('#notion-list').innerHTML=bank.length?bank.map(d=>detail(d,ctx.user.notions[d.id]||{},ctx).replace('<details ','<details data-notion="'+e(d.id)+'" ')).join(''):'<p class="empty">Aucune notion ne correspond à ces filtres.</p>';
    root.querySelectorAll('[data-revise]').forEach(b=>b.onclick=()=>ctx.start({mode:'mixed',count:1,ids:[b.dataset.revise]}));
    if(options.definitionId){const target=root.querySelector(`[data-notion="${CSS.escape(options.definitionId)}"]`);if(target){target.open=true;target.scrollIntoView({block:'start'});}}
  }
  root.querySelector('#search').oninput=render;root.querySelector('#subject').onchange=render;root.querySelector('#level').onchange=render;render();
}
