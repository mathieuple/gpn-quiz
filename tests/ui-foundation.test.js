import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Phosphor Regular 2.1.2 is local, subsetted and accessible',()=>{
  const index=read('index.html'),css=read('assets/vendor/phosphor/regular/phosphor.css');
  assert.match(index,/\.\/assets\/vendor\/phosphor\/regular\/phosphor\.css/);
  assert.match(css,/@phosphor-icons\/web 2\.1\.2/);
  assert.ok(existsSync(new URL('../assets/vendor/phosphor/regular/Phosphor.woff2',import.meta.url)));
  for(const icon of ['house','book-open-text','notebook','chart-line-up','gear','arrow-right'])assert.match(css,new RegExp(`ph-${icon}`));
  assert.doesNotMatch(css,/ph-(thin|light|bold|fill|duotone)/);
  assert.match(index,/aria-label="Paramètres"><i class="ph ph-gear" aria-hidden="true"><\/i>/);
});

test('Motion mini 13.1.1 stays local and honors reduced motion',()=>{
  const module=read('js/ui/motion.js'),vendor=read('js/vendor/motion/mini-13.1.1.js'),variables=read('css/variables.css');
  assert.match(module,/mini-13\.1\.1\.js/);
  assert.match(module,/prefers-reduced-motion: reduce/);
  assert.match(module,/dataset\.animations==='off'/);
  assert.doesNotMatch(vendor,/\bfrom\s*["']https?:\/\//);
  for(const token of ['--motion-fast','--motion-normal','--motion-slow','--ease-standard','--ease-emphasized'])assert.match(variables,new RegExp(token));
});

test('PWA cache includes every UI foundation runtime asset',()=>{
  const sw=read('service-worker.js');
  for(const asset of ['assets/vendor/phosphor/regular/phosphor.css','assets/vendor/phosphor/regular/Phosphor.woff2','js/ui/motion.js','js/vendor/motion/mini-13.1.1.js'])assert.ok(sw.includes(`"${asset}"`),asset);
});
