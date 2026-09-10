export const escapeHTML = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const $ = selector => document.querySelector(selector);
export const stat = (value,label) => `<div class="stat"><strong>${escapeHTML(value)}</strong><span>${escapeHTML(label)}</span></div>`;
export const bar = (value,label) => `<progress max="100" value="${value}" aria-label="${escapeHTML(label)}"></progress>`;
export function applySettings(settings){document.documentElement.dataset.theme=settings.theme;document.documentElement.dataset.animations=settings.animations?'on':'off';}
export function playSound(good,settings){if(!settings.sound)return;try{const ctx=new (window.AudioContext||window.webkitAudioContext)(),osc=ctx.createOscillator(),gain=ctx.createGain();osc.connect(gain);gain.connect(ctx.destination);osc.frequency.value=good?660:220;gain.gain.setValueAtTime(.04,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.15);osc.start();osc.stop(ctx.currentTime+.15);osc.onended=()=>ctx.close();}catch{}}
