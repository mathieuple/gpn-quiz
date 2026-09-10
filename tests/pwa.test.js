import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
test('PWA : cache complet, sous-chemin, activation et navigation hors ligne',async()=>{
  const source=await readFile(new URL('../service-worker.js',import.meta.url),'utf8');
  const files=JSON.parse(source.match(/const FILES=(\[[^;]+\]);/)[1]);
  const root=new URL('../',import.meta.url),origin='https://example.test',scope=origin+'/gpn-quiz/';
  for(const file of files){await readFile(new URL(file,root));if(file.endsWith('.js')){const js=await readFile(new URL(file,root),'utf8');for(const match of js.matchAll(/from\s+['"]([^'"]+)['"]/g)){const resolved=new URL(match[1],new URL(file,scope)).pathname.slice('/gpn-quiz/'.length);assert.ok(files.includes(resolved),'Import non mis en cache : '+resolved);}}}
  const manifest=JSON.parse(await readFile(new URL('manifest.webmanifest',root),'utf8'));
  assert.equal(new URL(manifest.start_url,scope).pathname,'/gpn-quiz/');
  for(const icon of manifest.icons){const png=await readFile(new URL(icon.src,root)),size=Number(icon.sizes.split('x')[0]);assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);}
  const events={},entries=new Map(),deleted=[],cache={async addAll(urls){for(const url of urls)entries.set(url,new Response(await readFile(new URL(url.slice(scope.length),root))));},async put(req,response){entries.set(typeof req==='string'?req:req.url,response);}};
  const obsolete='gpn-quiz-'+encodeURIComponent('/gpn-quiz/')+'-obsolete';
  const caches={open:async()=>cache,keys:async()=>[obsolete,'gpn-quiz-other-scope','unrelated-app'],delete:async key=>deleted.push(key),match:async req=>entries.get(typeof req==='string'?req:req.url)?.clone()};
  vm.runInNewContext(source,{URL,Response,console,caches,fetch:async()=>{throw Error('Offline');},self:{registration:{scope},location:{origin},clients:{claim:async()=>{}},skipWaiting:async()=>{},addEventListener:(name,fn)=>events[name]=fn}});
  let pending;events.install({waitUntil:p=>pending=p});await pending;assert.equal(entries.size,files.length);
  events.activate({waitUntil:p=>pending=p});await pending;assert.deepEqual(deleted,[obsolete]);
  let response;events.fetch({request:{url:scope,method:'GET',mode:'navigate'},respondWith:p=>response=p});assert.match(await (await response).text(),/GPN Quiz/);
  events.fetch({request:{url:scope+'js/app.js',method:'GET',mode:'cors'},respondWith:p=>response=p});assert.match(await (await response).text(),/QuizSession/);
  events.fetch({request:{url:scope+'data/definitions.js',method:'GET',mode:'cors'},respondWith:p=>response=p,waitUntil:p=>pending=p});assert.match(await (await response).text(),/Sténoxybionte/);await pending;
  events.fetch({request:{url:scope+'data/courses/expertise-faunistique/odonates-demo.js',method:'GET',mode:'cors'},respondWith:p=>response=p,waitUntil:p=>pending=p});assert.match(await (await response).text(),/Odonates/);await pending;
});
