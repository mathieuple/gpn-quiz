import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const root=new URL('../',import.meta.url);

test('déploiement statique à la racine : HTML, manifest et assets résolus',async()=>{
  const html=await readFile(new URL('index.html',root),'utf8');
  assert.doesNotMatch(html,/\/(?:gpn-quiz)\//i);
  const paths=[...html.matchAll(/(?:href|src)="(\.\/[^"#]+)"/g)].map(match=>match[1]);
  assert.ok(paths.includes('./manifest.webmanifest'));assert.ok(paths.includes('./js/app.js'));assert.ok(paths.includes('./css/style.css'));
  for(const path of paths)await readFile(new URL(path,root));
  const manifest=JSON.parse(await readFile(new URL('manifest.webmanifest',root),'utf8')),deployed='https://gpn-quiz.vercel.app/';
  assert.equal(new URL(manifest.scope,deployed).pathname,'/');
  const start=new URL(manifest.start_url,deployed);assert.equal(start.pathname,'/');assert.equal(start.hash,'#/');
  for(const icon of manifest.icons)await readFile(new URL(icon.src,root));
});

test('service worker racine : précache relatif et vérification de mise à jour',async()=>{
  const source=await readFile(new URL('service-worker.js',root),'utf8'),files=JSON.parse(source.match(/const FILES=(\[[^;]+\]);/)[1]);
  assert.match(source,/v1\.2-vercel-/);assert.match(source,/refresh/);assert.match(source,/cached\|\|refresh/);
  assert.ok(files.includes('data/courses/index.js'));assert.ok(files.every(path=>!path.startsWith('/')));
  for(const path of files)await readFile(new URL(path,root));
  const app=await readFile(new URL('js/app.js',root),'utf8');assert.match(app,/updateViaCache:'none'/);
});
