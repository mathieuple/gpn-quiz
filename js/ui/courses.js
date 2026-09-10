import {escapeHTML as e,bar} from './helpers.js';
import {courseProgress} from '../progression/course-progress.js';
import {courseQuizOptions} from '../courses/course-session.js';
import {normalize} from '../utils/normalize.js';

const subjectLink=subject=>`#/courses/${encodeURIComponent(subject)}`;

function renderBlock(block,ctx) {
  if(block.type==='paragraph')return `<p>${e(block.text)}</p>`;
  if(block.type==='bullet-list')return `<ul>${block.items.map(item=>`<li>${e(item)}</li>`).join('')}</ul>`;
  if(block.type==='ordered-list')return `<ol>${block.items.map(item=>`<li>${e(item)}</li>`).join('')}</ol>`;
  if(block.type==='important')return `<aside class="course-important"><strong>À retenir</strong><p>${e(block.text)}</p></aside>`;
  if(block.type==='definition') {
    const definition=ctx.bank.find(item=>item.id===block.notionId);
    return definition?`<aside class="course-definition"><p class="eyebrow">DÉFINITION</p><h3>${e(definition.terme)}</h3><p>${e(definition.definitionCourte)}</p><a href="#/notions/${e(definition.id)}">Voir la fiche →</a></aside>`:'';
  }
  return `<div class="course-table-wrap"><table><caption>${e(block.caption||'Tableau du cours')}</caption><thead><tr>${block.headers.map(header=>`<th scope="col">${e(header)}</th>`).join('')}</tr></thead><tbody>${block.rows.map(row=>`<tr>${row.map(cell=>`<td>${e(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export function coursesScreen(root,ctx) {
  const all=ctx.courseIndex.getAllCourses(),subjects=[...new Set(all.map(course=>course.matiere))];
  root.innerHTML=`<div class="stack"><div><p class="eyebrow">📚 COURS</p><h1 class="mt">Apprendre avant de réviser.</h1><p class="muted mt">Des cours reliés aux définitions et au quiz.</p></div><label class="field">Rechercher un cours<input id="course-search" type="search" placeholder="Un cours ou une section…"></label><div id="course-subjects" class="course-subjects"></div></div>`;
  const render=()=>{
    const query=normalize(root.querySelector('#course-search').value);
    root.querySelector('#course-subjects').innerHTML=subjects.map(subject=>{
      const matches=ctx.courseIndex.getCoursesBySubject(subject).filter(course=>normalize([course.titre,...course.sections.map(section=>section.titre)].join(' ')).includes(query));
      return matches.length?`<a class="card course-subject-card" href="${subjectLink(subject)}"><span><strong>${e(subject)}</strong><small>${matches.length} cours</small></span><span aria-hidden="true">→</span></a>`:'';
    }).join('')||'<p class="empty">Aucun cours ne correspond à cette recherche.</p>';
  };
  root.querySelector('#course-search').oninput=render;render();
}

export function courseSubjectScreen(root,ctx,subject) {
  const courses=ctx.courseIndex.getCoursesBySubject(subject);
  if(!courses.length){root.innerHTML='<p class="empty">Cette matière ne contient aucun cours disponible.</p>';return;}
  root.innerHTML=`<div class="stack"><a class="back-link" href="#/courses">← Tous les cours</a><div><p class="eyebrow">MATIÈRE</p><h1 class="mt">${e(subject)}</h1></div><div class="course-list">${courses.map(course=>{
    const progress=courseProgress(course,ctx.user);
    return `<a class="card course-row" href="#/course/${e(course.id)}"><span class="course-order">${String(course.ordre).padStart(2,'0')}</span><span><strong>${e(course.titre)}</strong><small>${course.notions.length} notion${course.notions.length>1?'s':''} · ${progress.coverage}% couvert</small></span><span aria-hidden="true">→</span></a>`;
  }).join('')}</div></div>`;
}

export function courseReader(root,ctx,courseId) {
  const course=ctx.courseIndex.getCourseById(courseId);
  if(!course){root.innerHTML='<p class="empty">Cours introuvable ou Course Pack invalide.</p>';return;}
  const progress=courseProgress(course,ctx.user),definitions=ctx.courseIndex.getDefinitionsForCourse(course.id);
  const toc=course.sections.length>1?`<nav class="course-toc card" aria-label="Table des matières"><strong>Dans ce cours</strong><ol>${course.sections.map((section,index)=>`<li><button type="button" data-course-section="section-${e(section.id)}">${index+1}. ${e(section.titre)}</button></li>`).join('')}</ol></nav>`:'';
  root.innerHTML=`<div class="stack"><a class="back-link" href="${subjectLink(course.matiere)}">← ${e(course.matiere)}</a><article class="course-article"><header><p class="eyebrow">COURS ${String(course.ordre).padStart(2,'0')}</p><h1>${e(course.titre)}</h1><p class="muted">${e(course.matiere)}</p><div class="course-progress"><span>${progress.notionsSeen} / ${progress.notionsTotal} notions travaillées</span><strong>Maîtrise : ${progress.mastery} %</strong></div>${bar(progress.coverage,'Couverture du cours '+course.titre)}</header>${toc}${course.sections.map(section=>`<section id="section-${e(section.id)}"><h2>${e(section.titre)}</h2><div class="course-content">${section.contenu.map(block=>renderBlock(block,ctx)).join('')}</div></section>`).join('')}<section class="course-notions"><p class="eyebrow">NOTIONS IMPORTANTES</p><h2>À connaître dans ce cours</h2><div class="course-notion-links">${definitions.map(definition=>`<a href="#/notions/${e(definition.id)}"><strong>${e(definition.terme)}</strong><span>${e(definition.definitionCourte)}</span></a>`).join('')}</div></section><button id="revise-course" class="button primary wide">RÉVISER CE COURS</button></article></div>`;
  root.querySelectorAll('[data-course-section]').forEach(button=>button.onclick=()=>root.querySelector(`#${CSS.escape(button.dataset.courseSection)}`)?.scrollIntoView({behavior:'smooth',block:'start'}));
  root.querySelector('#revise-course').onclick=()=>ctx.start(courseQuizOptions(course));
}
