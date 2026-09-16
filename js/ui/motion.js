import {animate} from '../vendor/motion/mini-13.1.1.js';

export function motionIsReduced() {
  return document.documentElement.dataset.animations==='off'||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function enhancePressInteractions(scope) {
  if(motionIsReduced())return;
  scope.querySelectorAll('.button,.icon-button,.answer').forEach(control=>{
    if(control.dataset.motionPressBound)return;
    control.dataset.motionPressBound='true';
    const press=()=>{if(!control.disabled)animate(control,{scale:control.classList.contains('answer') ? .985 : .97},{duration:.12,ease:'easeOut'});};
    const release=()=>animate(control,{scale:1},{duration:.12,ease:'easeOut'});
    control.addEventListener('pointerdown',press);
    control.addEventListener('pointerup',release);
    control.addEventListener('pointercancel',release);
    control.addEventListener('pointerleave',release);
    control.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')press();});
    control.addEventListener('keyup',event=>{if(event.key==='Enter'||event.key===' ')release();});
    control.addEventListener('blur',release);
  });
}

export function enhanceScreen(root) {
  if(!motionIsReduced()&&root.firstElementChild)animate(root.firstElementChild,{opacity:[0,1],transform:['translateY(6px)','translateY(0)']},{duration:.2,ease:'easeOut'});
  enhancePressInteractions(root);
}

export function animateFeedback(element) {
  if(element&&!motionIsReduced())animate(element,{opacity:[0,1],transform:['translateY(4px)','translateY(0)']},{duration:.2,ease:'easeOut'});
}

export function animateAnswerResult(element) {
  if(element&&!motionIsReduced())animate(element,{scale:[1,.985,1]},{duration:.18,ease:'easeOut'});
}

export function transitionQuestion(element,onComplete) {
  if(!element||motionIsReduced()){onComplete();return;}
  const animation=animate(element,{opacity:[1,0],transform:['translateY(0)','translateY(-4px)']},{duration:.1,ease:'easeOut'});
  if(typeof animation?.then==='function')animation.then(onComplete);else setTimeout(onComplete,100);
}
