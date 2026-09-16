import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('quiz mobile : progression claire, saisie iPhone et feedback accessible',()=>{
  const screen=read('js/ui/quiz-screen.js');
  assert.match(screen,/Question \$\{number\} \/ \$\{total\}/);
  assert.match(screen,/font-size: 16px|id="answer-input"/);
  assert.match(screen,/autocapitalize="sentences"/);
  assert.match(screen,/enterkeyhint="done"/);
  assert.match(screen,/aria-live="polite" aria-atomic="false"/);
});

test('double tap : les contrôles sont bloqués avant la soumission',()=>{
  const screen=read('js/ui/quiz-screen.js');
  const guard=screen.indexOf('if(submitting)return'),disable=screen.indexOf("control=>control.disabled=true"),submit=screen.indexOf('session.submit(value,skip)');
  assert.ok(guard>=0&&disable>guard&&submit>disable);
});

test('QCM : tous les états visuels et tactiles sont présents',()=>{
  const screen=read('js/ui/quiz-screen.js'),styles=read('css/screens.css'),motion=read('js/ui/motion.js');
  for(const state of ['selected','correct','incorrect','answer-muted'])assert.ok(screen.includes(`classList.add('${state}')`)||styles.includes(`.answer.${state}`));
  assert.match(styles,/\.answer:disabled/);
  assert.match(styles,/\.answer\.answer-muted:disabled/);
  assert.match(motion,/\.button,\.icon-button,\.answer/);
});

test('viewport dynamique, action Continuer sticky et résultat hiérarchisé',()=>{
  const styles=read('css/screens.css'),results=read('js/ui/results.js'),feedback=read('js/ui/feedback.js');
  assert.match(styles,/min-height: 100dvh/);
  assert.match(styles,/\.feedback-actions \{ position: sticky/);
  assert.match(results,/results-combo/);
  assert.match(results,/Réviser mes erreurs/);
  assert.match(feedback,/feedback-answer/);
  assert.match(feedback,/feedback-explanation/);
});

test('les modules des écrans principaux restent importables',async()=>{
  await Promise.all(['courses','feedback','home','notions','quiz-screen','results','settings'].map(name=>import(`../js/ui/${name}.js`)));
});
