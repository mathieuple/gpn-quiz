import {defaults} from '../storage/migrations.js';
import {parseImport} from '../storage/storage.js';
import {applySettings} from './helpers.js';

export function settings(root,ctx) {
  root.innerHTML=`<div class="stack">
    <div><p class="eyebrow">À TA FAÇON</p><h1 class="mt">Paramètres</h1></div>
    <section class="card stack"><h2>Confort de révision</h2>
      <label class="settings-row">Thème<select id="theme"><option value="auto">Automatique</option><option value="light">Clair</option><option value="dark">Sombre</option></select></label>
      <label class="settings-row">Animations<input id="animations" type="checkbox" ${ctx.user.settings.animations?'checked':''}></label>
      <label class="settings-row">Sons<input id="sound" type="checkbox" ${ctx.user.settings.sound?'checked':''}></label>
    </section>
    <section class="card stack"><h2>Ton carnet, sur cet appareil</h2>
      <p class="muted small">Ta progression reste dans ce navigateur. Exporte une copie pour la conserver ou changer d’appareil.</p>
      <button id="export" class="button">↓ Exporter ma progression</button>
      <label class="field">Importer une sauvegarde JSON<input id="import" type="file" accept=".json,application/json"></label>
      <p id="import-status" class="small" role="status"></p><div class="divider"></div>
      <button id="reset" class="button danger">Réinitialiser ma progression</button>
      <div id="reset-confirm" class="notice hidden"><p>Effacer définitivement les scores et réglages de cet appareil ? Une exportation permet de les conserver.</p><div class="row mt"><button id="cancel-reset" class="button">Annuler</button><button id="confirm-reset" class="button danger">Tout effacer</button></div></div>
    </section>
    <section class="card stack"><h2>🌿 GPN Quiz</h2>
      <p>Cours, définitions et quiz pour étudiants en BTSA GPN.</p>
      <p class="muted small">Version 1.2 · ${ctx.bank.length} notions officielles · ${ctx.courseIndex.getAllCourses().length} cours<br>Sans compte, sans IA, sans collecte de données.</p>
      <p class="small muted">Les accents ne comptent pas comme des fautes. Une réponse presque correcte conserve le combo. En examen, elle vaut 0,75 point. Les indices réduisent les XP, pas la maîtrise.</p>
      <p class="small muted">Pour le mode hors ligne, effectue une première visite connectée. Installe ensuite l’application depuis le menu du navigateur.</p>
      <p id="offline-status" class="small muted"></p>
    </section>
  </div>`;
  root.querySelector('#theme').value=ctx.user.settings.theme;
  for(const key of ['theme','animations','sound'])root.querySelector('#'+key).onchange=event=>{ctx.user.settings[key]=key==='theme'?event.target.value:event.target.checked;applySettings(ctx.user.settings);ctx.persist();};
  root.querySelector('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(ctx.user,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='gpn-quiz-progression.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  root.querySelector('#import').onchange=async event=>{const file=event.target.files[0],status=root.querySelector('#import-status');if(!file)return;try{if(file.size>5000000)throw new Error('Fichier trop volumineux (5 Mo maximum).');const data=parseImport(await file.text());ctx.replaceUser(data);status.textContent='Progression importée. Les données précédentes ont été remplacées.';root.querySelector('#theme').value=data.settings.theme;for(const key of ['animations','sound'])root.querySelector('#'+key).checked=data.settings[key];}catch(error){status.textContent='Import refusé : '+error.message;}event.target.value='';};
  root.querySelector('#reset').onclick=()=>root.querySelector('#reset-confirm').classList.remove('hidden');
  root.querySelector('#cancel-reset').onclick=()=>root.querySelector('#reset-confirm').classList.add('hidden');
  root.querySelector('#confirm-reset').onclick=()=>{ctx.replaceUser(defaults());settings(root,ctx);root.querySelector('#import-status').textContent='Progression réinitialisée.';};
  root.querySelector('#offline-status').textContent=navigator.serviceWorker?.controller?'✓ Application disponible hors ligne.':'Le mode hors ligne sera prêt après la mise en cache initiale.';
}
