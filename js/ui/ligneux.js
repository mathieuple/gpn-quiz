import {escapeHTML as e,stat} from './helpers.js';
import {ligneuxProgressStats} from '../ligneux/progress.js';
import {ligneuxReferences} from '../../data/ligneux/species.js';

const modeLabels={discovery:'Découverte',leaves:'Reconnaissance des feuilles',advanced:'Reconnaissance approfondie',scientific:'Noms scientifiques',confusions:'Espèces ressemblantes',exam:'Examen blanc'};
const organLabels={leaf:'Feuille',twig:'Rameau',bud:'Bourgeon',bark:'Écorce',fruit:'Fruit ou graine',flower:'Fleur',habit:'Silhouette'};
const label=(species,style)=>style==='scientific'?species.scientific:species.french;

export function ligneuxHome(root,ctx){
  const progress=ligneuxProgressStats(ctx.user.ligneux,ctx.ligneuxSpecies.length),weak=ctx.ligneuxSpecies.filter(species=>(ctx.user.ligneux.species[species.id]?.wrong||0)>0).sort((a,b)=>(ctx.user.ligneux.species[b.id].wrong/ctx.user.ligneux.species[b.id].seen)-(ctx.user.ligneux.species[a.id].wrong/ctx.user.ligneux.species[a.id].seen)).slice(0,4);
  root.innerHTML=`<div class="stack ligneux-landing">
    <a class="back-link" href="#/"><i class="ph ph-arrow-left" aria-hidden="true"></i> Accueil</a>
    <header class="ligneux-header"><span class="event-badge"><i class="ph ph-tree" aria-hidden="true"></i> EVENT</span><p class="eyebrow">ÉVALUATION DU 5 NOVEMBRE</p><h1>Reconnaissance des ligneux</h1><p>30 espèces — BTSA GPN</p><p class="muted">Entraînement à l’identification des arbres et arbustes à partir de photographies, avec reconnaissance des noms scientifiques et critères botaniques.</p></header>
    <section class="card"><div class="stats-strip">${stat(progress.met+'/30','espèces rencontrées')}${stat(progress.percentage+' %','réussite globale')}${stat(progress.totalAnswered,'questions réalisées')}</div>${weak.length?`<p class="small muted mt">À retravailler : ${weak.map(item=>e(item.french)).join(', ')}.</p>`:''}</section>
    ${ctx.user.ligneux.examHistory.length?`<details class="card"><summary>Historique des examens blancs</summary><div class="stack mt">${[...ctx.user.ligneux.examHistory].reverse().slice(0,5).map(exam=>`<div class="row small"><span>${new Date(exam.date).toLocaleDateString('fr-FR')} · ${exam.correct}/${exam.total}</span><strong>${exam.grade.toLocaleString('fr-FR')} / 20</strong></div>`).join('')}</div></details>`:''}
    <form id="ligneux-form" class="stack">
      <fieldset><legend>Choisis ton entraînement</legend><div class="ligneux-modes">
        ${[
          ['discovery','ph-sparkle','Découverte','Apprendre les espèces avec une correction détaillée.'],
          ['leaves','ph-leaf','Feuilles','Feuilles et rameaux feuillés, comme en évaluation.'],
          ['advanced','ph-tree','Approfondie','Bourgeons, écorces, fruits, fleurs et silhouettes.'],
          ['scientific','ph-text-italic','Noms scientifiques','Photo ou nom français vers l’appellation latine.'],
          ['confusions','ph-arrows-left-right','Espèces ressemblantes','Bouleaux, chênes, érables et autres groupes proches.'],
          ['exam','ph-timer','Examen blanc','Correction à la fin, sans indice.']
        ].map(([id,icon,title,description],index)=>`<label class="card ligneux-mode"><input type="radio" name="mode" value="${id}" ${index===0?'checked':''}><i class="ph ${icon}" aria-hidden="true"></i><span><strong>${title}</strong><small>${description}</small></span></label>`).join('')}
      </div></fieldset>
      <div class="card stack ligneux-options">
        <label class="field">Nombre de questions<select name="count"><option value="10">10 questions</option><option value="20">20 questions</option><option value="30">30 questions</option><option value="all">Toutes les photographies</option></select></label>
        <label class="field" id="organ-field" hidden>Type de photographie<select name="organ"><option value="all">Tous les organes approfondis</option>${Object.entries(organLabels).filter(([id])=>id!=='leaf'&&ctx.ligneuxPhotos.some(photo=>photo.organ===id)).map(([id,text])=>`<option value="${id}">${text}</option>`).join('')}</select></label>
        <button class="button primary wide" type="submit">Commencer l’entraînement <i class="ph ph-arrow-right" aria-hidden="true"></i></button>
      </div>
    </form>
    <div class="ligneux-tools"><a class="button text" href="#/ligneux/credits">Crédits photographiques</a><button class="button text" id="ligneux-offline" type="button"><i class="ph ph-download-simple" aria-hidden="true"></i> Télécharger le pack hors ligne</button></div><p id="ligneux-offline-status" class="small muted" role="status"></p>
  </div>`;
  const form=root.querySelector('#ligneux-form'),organ=root.querySelector('#organ-field');
  form.onchange=()=>{const mode=new FormData(form).get('mode');organ.hidden=mode!=='advanced';};
  form.onsubmit=event=>{event.preventDefault();const data=new FormData(form);ctx.startLigneux({mode:data.get('mode'),count:data.get('count'),organ:data.get('organ')});};
  root.querySelector('#ligneux-offline').onclick=async event=>{
    const button=event.currentTarget,status=root.querySelector('#ligneux-offline-status');button.disabled=true;status.textContent='Préparation du téléchargement…';
    try{
      const registration=await navigator.serviceWorker.ready,worker=registration.active||registration.waiting||registration.installing;
      if(!worker)throw new Error('Service worker indisponible');
      const channel=new MessageChannel(),done=new Promise((resolve,reject)=>{channel.port1.onmessage=message=>{const data=message.data||{};if(data.type==='LINEUX_CACHE_PROGRESS')status.textContent=`Téléchargement : ${data.done} / ${data.total}`;if(data.type==='LINEUX_CACHE_DONE')resolve(data);if(data.type==='LINEUX_CACHE_ERROR')reject(new Error(data.message));};});
      worker.postMessage({type:'CACHE_LIGNEUX_PACK',files:ctx.ligneuxPhotos.map(photo=>photo.src)},[channel.port2]);await done;status.textContent='✓ Pack photographique disponible hors ligne.';
    }catch(error){status.textContent=`Téléchargement incomplet : ${error.message}`;button.disabled=false;}
  };
}

export function ligneuxQuiz(root,ctx){
  const session=ctx.ligneuxSession;if(!session){ctx.navigate('/ligneux');return;}if(session.finished){ctx.navigate('/ligneux/results');return;}
  const question=session.current&&!session.answered?session.current:session.next();if(!question){ctx.navigate('/ligneux/results');return;}
  const number=session.answers.length+1,total=session.limit,score=session.answers.filter(answer=>answer.correct).length;
  root.innerHTML=`<div class="stack ligneux-play">
    <div class="ligneux-quiz-top"><div class="row"><span class="eyebrow">${e(modeLabels[session.options.mode])}</span><span class="small">Question ${number} / ${total}</span><button class="button text" id="ligneux-stop" type="button">Terminer</button></div><progress value="${session.answers.length}" max="${total}" aria-label="Question ${number} sur ${total}"></progress>${!session.exam?`<span class="small muted">Score : ${score}</span>`:''}</div>
    <section class="card ligneux-question" aria-labelledby="ligneux-prompt">
      <h1 id="ligneux-prompt">${e(question.prompt)}</h1>
      ${question.photo?`<button class="ligneux-photo-button" id="ligneux-enlarge" type="button" aria-label="Agrandir la photographie"><img src="${e(question.photo.src)}" alt="Photographie botanique à identifier" decoding="async"></button>`:''}
      <div class="answers ligneux-answers" role="radiogroup" aria-label="Réponses proposées">${question.choices.map((species,index)=>`<button type="button" class="answer" role="radio" aria-checked="false" data-species="${e(species.id)}"><span class="answer-letter" aria-hidden="true">${'ABCD'[index]}</span><span>${e(label(species,question.answerStyle))}</span></button>`).join('')}</div>
      <button id="ligneux-validate" class="button primary wide" type="button" disabled>Valider</button>
      <div id="ligneux-feedback" aria-live="polite"></div>
    </section>
    <dialog class="ligneux-dialog" id="ligneux-dialog"><button class="icon-button" id="ligneux-close" aria-label="Fermer">×</button>${question.photo?`<img src="${e(question.photo.src)}" alt="Photographie botanique agrandie">`:''}</dialog>
  </div>`;
  let selectedId=null;
  const choices=[...root.querySelectorAll('[data-species]')],validate=root.querySelector('#ligneux-validate');
  choices.forEach(button=>button.onclick=()=>{if(session.answered)return;selectedId=button.dataset.species;choices.forEach(item=>{const selected=item===button;item.classList.toggle('selected',selected);item.setAttribute('aria-checked',selected?'true':'false');});validate.disabled=false;});
  validate.onclick=()=>{
    if(!selectedId||session.answered)return;const answer=session.submit(selectedId);ctx.persist();
    choices.forEach(button=>{button.disabled=true;if(!session.exam){if(button.dataset.species===answer.species.id)button.classList.add('correct');else if(button.dataset.species===selectedId)button.classList.add('incorrect');}});
    validate.remove();const feedback=root.querySelector('#ligneux-feedback');
    if(session.exam){feedback.innerHTML=`<button id="ligneux-next" class="button primary wide">${session.finished?'Voir les résultats':'Question suivante'} <i class="ph ph-arrow-right" aria-hidden="true"></i></button>`;}
    else{
      const selectedDifference=!answer.correct&&answer.selected?` ${answer.selected.french} présente plutôt : ${answer.selected.diagnostics[0].toLowerCase()}.`:'';
      const otherPhotos=ctx.ligneuxPhotos.filter(photo=>photo.speciesId===answer.species.id&&photo.id!==answer.sourcePhoto.id).slice(0,4);
      const similar=answer.species.lookalikes.map(id=>ctx.ligneuxSpecies.find(item=>item.id===id)?.french).filter(Boolean);
      const synonyms=[...(answer.species.aliasesFrench||[]),...(answer.species.aliasesScientific||[])];
      feedback.innerHTML=`<section class="ligneux-correction ${answer.correct?'is-correct':'is-wrong'}"><p class="eyebrow">${answer.correct?'✓ BONNE RÉPONSE':'À RETENIR'}</p><h2>${e(answer.species.french)}</h2><p><em>${e(answer.species.scientific)}</em> · ${e(answer.species.family)}</p>${synonyms.length?`<p class="small muted">Autres noms acceptés : ${e(synonyms.join(', '))}</p>`:''}<p class="small"><strong>Feuille :</strong> ${e(answer.species.leaf.type)}, ${e(answer.species.leaf.arrangement)} ; ${e(answer.species.leaf.shape)} ; bord ${e(answer.species.leaf.margin)}.</p><ul>${answer.species.diagnostics.map(item=>`<li>${e(item)}</li>`).join('')}</ul>${similar.length?`<p class="small"><strong>Espèces ressemblantes :</strong> ${e(similar.join(', '))}.</p>`:''}${selectedDifference?`<p class="small muted">${e(selectedDifference)}</p>`:''}${otherPhotos.length?`<div class="ligneux-other-photos"><p class="small"><strong>Autres vues de l’espèce</strong></p><div>${otherPhotos.map(photo=>`<img loading="lazy" src="${e(photo.src)}" alt="${e(organLabels[photo.organ]||'Autre vue botanique')} de ${e(answer.species.french)}">`).join('')}</div></div>`:''}</section><button id="ligneux-next" class="button primary wide">${session.finished?'Voir les résultats':'Question suivante'} <i class="ph ph-arrow-right" aria-hidden="true"></i></button>`;
    }
    root.querySelector('#ligneux-next').onclick=()=>session.finished?ctx.navigate('/ligneux/results'):ctx.navigate('/ligneux/play');
  };
  root.querySelector('#ligneux-stop').onclick=()=>{session.finish();ctx.persist();ctx.navigate('/ligneux/results');};
  const dialog=root.querySelector('#ligneux-dialog');root.querySelector('#ligneux-enlarge')?.addEventListener('click',()=>dialog.showModal());root.querySelector('#ligneux-close').onclick=()=>dialog.close();dialog.onclick=event=>{if(event.target===dialog)dialog.close();};
  window.scrollTo(0,0);
}

export function ligneuxResults(root,ctx){
  const session=ctx.ligneuxSession;if(!session){ctx.navigate('/ligneux');return;}
  const total=session.answers.length,correct=session.answers.filter(answer=>answer.correct).length,percentage=total?Math.round(correct/total*100):0,grade=total?Math.round(correct/total*2000)/100:0,errors=session.answers.filter(answer=>!answer.correct);
  const correctSpecies=[...new Set(session.answers.filter(answer=>answer.correct).map(answer=>answer.species.french))],wrongSpecies=[...new Set(errors.map(answer=>answer.species.french))];
  root.innerHTML=`<div class="stack ligneux-results"><header class="results-score"><p class="eyebrow">${session.exam?'EXAMEN TERMINÉ':'ENTRAÎNEMENT TERMINÉ'}</p><strong>${session.exam?`${grade.toLocaleString('fr-FR')} / 20`:`${correct} / ${total}`}</strong><p>${percentage} % de réussite</p></header><section class="card stack"><div class="stats-strip">${stat(correct,'identifications justes')}${stat(errors.length,'à revoir')}${stat(new Set(session.answers.map(answer=>answer.species.id)).size,'espèces vues')}</div></section>${correctSpecies.length?`<section class="card"><h2>Espèces identifiées</h2><p class="mt">${e(correctSpecies.join(' · '))}</p></section>`:''}${wrongSpecies.length?`<section class="card stack"><h2>Erreurs à retravailler</h2>${errors.map(answer=>`<details><summary><span>${e(answer.species.french)}</span><span class="small muted">Réponse : ${e(answer.selected?.french||'Aucune')}</span></summary><div class="notice"><p><em>${e(answer.species.scientific)}</em></p><ul>${answer.species.diagnostics.map(item=>`<li>${e(item)}</li>`).join('')}</ul></div></details>`).join('')}</section><button id="ligneux-retry-errors" class="button primary wide">Réviser mes erreurs</button>`:''}<button id="ligneux-replay" class="button ${errors.length?'':'primary'} wide">Rejouer</button><a class="button text wide" href="#/ligneux">Changer de mode</a></div>`;
  root.querySelector('#ligneux-retry-errors')?.addEventListener('click',()=>ctx.startLigneux({mode:'discovery',count:Math.max(10,wrongSpecies.length*2),ids:[...new Set(errors.map(answer=>answer.species.id))]}));
  root.querySelector('#ligneux-replay').onclick=()=>ctx.startLigneux(session.options);
}

export function ligneuxCredits(root,ctx){
  root.innerHTML=`<div class="stack ligneux-credits"><a class="back-link" href="#/ligneux"><i class="ph ph-arrow-left" aria-hidden="true"></i> Reconnaissance des ligneux</a><header><p class="eyebrow">SOURCES</p><h1>Crédits photographiques</h1><p class="muted">Les photographies sont stockées localement. Chaque image a été redimensionnée et convertie en WebP ; la licence et la page d’origine restent indiquées ci-dessous.</p></header><section class="card"><h2>Références botaniques</h2><p class="small mt"><a href="${ligneuxReferences.taxonomy}" target="_blank" rel="noopener">Kew — Plants of the World Online</a> · <a href="${ligneuxReferences.frenchTaxonomy}" target="_blank" rel="noopener">MNHN — TAXREF</a> · <a href="${ligneuxReferences.morphology}" target="_blank" rel="noopener">Forestry Commission — Know your broadleaves</a></p></section>${ctx.ligneuxSpecies.map(species=>{const photos=ctx.ligneuxPhotos.filter(photo=>photo.speciesId===species.id);return `<section class="card"><h2>${e(species.french)}</h2><p class="small muted"><em>${e(species.scientific)}</em></p><ol class="photo-credit-list">${photos.map(photo=>`<li><img loading="lazy" src="${e(photo.src)}" alt=""><span><strong>${e(organLabels[photo.organ]||photo.organ)}</strong> — ${e(photo.author)}<br><small>${e(photo.originalFile)} · ID ${e(photo.id)}</small><br><a href="${e(photo.sourcePage)}" target="_blank" rel="noopener">Wikimedia Commons</a> · <a href="${e(photo.licenseUrl)}" target="_blank" rel="noopener">${e(photo.license)}</a><br><small>${e(photo.adaptation)}</small></span></li>`).join('')}</ol></section>`;}).join('')}</div>`;
}
