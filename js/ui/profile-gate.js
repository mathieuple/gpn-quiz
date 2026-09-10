import {hasValidLeaderboardProfile} from '../leaderboard/leaderboard-state.js';

export function profileIsRequired(user){return !hasValidLeaderboardProfile(user);}

export function showProfileGate(ctx,onReady){
  const gate=document.createElement('div');gate.className='profile-gate';gate.setAttribute('role','dialog');gate.setAttribute('aria-modal','true');gate.setAttribute('aria-labelledby','profile-title');
  gate.innerHTML='<div class="profile-panel"><img src="./assets/gpn-quiz-logo.png" alt="" width="104" height="104"><div><p class="eyebrow">BIENVENUE SUR GPN QUIZ</p><h1 id="profile-title">Choisis ton pseudo</h1><p class="muted">Il apparaîtra dans le classement des meilleurs combos.</p></div><form id="profile-form" class="stack"><label class="field">Pseudo<input id="profile-name" type="text" minlength="2" maxlength="30" autocomplete="nickname" enterkeyhint="done" required></label><p class="small muted">2 à 30 caractères</p><p id="profile-error" class="small error" role="alert"></p><button class="button primary wide" type="submit">Continuer</button></form></div>';
  document.body.classList.add('profile-required');document.body.append(gate);
  const form=gate.querySelector('form'),input=gate.querySelector('input'),error=gate.querySelector('#profile-error'),button=gate.querySelector('button');
  form.onsubmit=async event=>{event.preventDefault();const result=ctx.leaderboard.setDisplayName(input.value);if(!result.valid){error.textContent=result.error;input.focus();return;}button.disabled=true;button.textContent=navigator.onLine===false?'Enregistré hors ligne':'Connexion au classement…';await Promise.race([ctx.leaderboard.sync(),new Promise(resolve=>setTimeout(resolve,4000))]);gate.remove();document.body.classList.remove('profile-required');onReady();};
  requestAnimationFrame(()=>input.focus({preventScroll:true}));
}
