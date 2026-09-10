import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {defaults,migrate} from '../js/storage/migrations.js';
import {cleanDisplayName,hasValidLeaderboardProfile,limitLeaderboard,setLocalDisplayName,validateDisplayName} from '../js/leaderboard/leaderboard-state.js';
import {LeaderboardService} from '../js/leaderboard/leaderboard-service.js';
import {profileIsRequired} from '../js/ui/profile-gate.js';

const UUID_A='11111111-1111-4111-8111-111111111111';
const UUID_B='22222222-2222-4222-8222-222222222222';

function mockClient({session=null,remoteBest=0,rows=[]}={}){
  const calls={getSession:0,signIn:0,sync:[],limits:[]};let active=session;
  const client={calls,auth:{async getSession(){calls.getSession++;return {data:{session:active},error:null};},async signInAnonymously(){calls.signIn++;active={user:{id:UUID_A}};return {data:{user:active.user,session:active},error:null};}},async rpc(name,args){if(name==='get_my_leaderboard_position')return {data:7,error:null};calls.sync.push(args);const best=Math.max(remoteBest,args.p_best_combo);remoteBest=best;return {data:{user_id:UUID_A,display_name:args.p_display_name,best_combo:best,best_combo_at:'2026-09-10T10:00:00Z',display_name_updated_at:args.p_display_name_updated_at},error:null};},from(){const chain={select(){return chain;},order(){return chain;},limit(value){calls.limits.push(value);return Promise.resolve({data:rows.slice(0,value),error:null});}};return chain;}};
  return client;
}

test('pseudo obligatoire, validé de 2 à 30 caractères et sans contournement',async()=>{
  const user=defaults();assert.equal(profileIsRequired(user),true);assert.equal(hasValidLeaderboardProfile(user),false);
  assert.equal(validateDisplayName(' ').valid,false);assert.equal(validateDisplayName('A').valid,false);assert.equal(validateDisplayName('x'.repeat(31)).valid,false);
  assert.equal(cleanDisplayName('  Ma\u200Bthieu  '),'Mathieu');assert.equal(setLocalDisplayName(user,'  Mathieu  ',10).displayName,'Mathieu');assert.equal(profileIsRequired(user),false);
  const source=await readFile(new URL('../js/ui/profile-gate.js',import.meta.url),'utf8');assert.doesNotMatch(source,/Passer|Plus tard|Fermer/);assert.match(source,/type="submit"/);
});

test('migration ajoute le profil sans perdre XP, combo, notions, confusions ou réglages',()=>{
  const legacy={version:1,schemaVersion:3,xp:405,bestCombo:37,survivalRecord:9,notions:{test:{timesSeen:2,mastery:40}},confusions:{'a|b':{count:2}},settings:{theme:'dark',sound:true,animations:false}};
  const user=migrate(legacy);assert.equal(user.xp,405);assert.equal(user.bestCombo,37);assert.equal(user.survivalRecord,9);assert.equal(user.notions.test.timesSeen,2);assert.equal(user.confusions['a|b'].count,2);assert.equal(user.settings.theme,'dark');assert.equal(user.profile.displayName,'');
});

test('identité anonyme créée une fois puis session réutilisée',async()=>{
  const user=defaults();user.bestCombo=12;setLocalDisplayName(user,'Mathieu',10);const client=mockClient(),service=new LeaderboardService({getUser:()=>user,saveUser:()=>true,clientProvider:async()=>client,isOnline:()=>true,now:()=>20});
  await service.sync();await service.sync();assert.equal(client.calls.signIn,1);assert.equal(client.calls.getSession,2);assert.equal(client.calls.sync.length,2);assert.equal(client.calls.sync[0].p_best_combo,12);assert.equal(user.profile.leaderboardUserId,UUID_A);assert.equal(user.profile.leaderboardSyncPending,false);
});

test('record résolu par max(local, distant) et synchronisation seulement après hausse locale',async()=>{
  const user=defaults();user.bestCombo=39;setLocalDisplayName(user,'Mathieu',10);const client=mockClient({remoteBest:44}),service=new LeaderboardService({getUser:()=>user,saveUser:()=>true,clientProvider:async()=>client,isOnline:()=>true,now:()=>20});
  await service.sync();assert.equal(user.bestCombo,44);assert.equal(user.profile.lastSyncedBestCombo,44);assert.equal(service.noteBestCombo(),false);
  user.bestCombo=43;assert.equal(service.noteBestCombo(),false);user.bestCombo=49;assert.equal(service.noteBestCombo(),true);await service.sync();assert.equal(client.calls.sync.at(-1).p_best_combo,49);assert.equal(user.profile.lastSyncedBestCombo,49);
});

test('un record battu pendant une requête reste marqué pour une seconde synchronisation',async()=>{
  const user=defaults();user.bestCombo=1;setLocalDisplayName(user,'Mathieu',10);let release,markStarted;const wait=new Promise(resolve=>release=resolve),started=new Promise(resolve=>markStarted=resolve),sent=[];
  const client=mockClient({session:{user:{id:UUID_A}}});client.rpc=async(name,args)=>{if(name==='get_my_leaderboard_position')return {data:1,error:null};sent.push(args.p_best_combo);if(sent.length===1){markStarted();await wait;}return {data:{user_id:UUID_A,display_name:'Mathieu',best_combo:args.p_best_combo,best_combo_at:'2026-09-10T10:00:00Z',display_name_updated_at:new Date(10).toISOString()},error:null};};
  const service=new LeaderboardService({getUser:()=>user,saveUser:()=>true,clientProvider:async()=>client,isOnline:()=>true,now:()=>20}),first=service.sync();
  await started;user.bestCombo=2;service.noteBestCombo();release();await first;await new Promise(resolve=>setTimeout(resolve,0));if(service.syncPromise)await service.syncPromise;
  assert.deepEqual(sent,[1,2]);assert.equal(user.profile.lastSyncedBestCombo,2);assert.equal(user.profile.leaderboardSyncPending,false);
});

test('premier lancement et nouveau record hors ligne restent en attente puis se synchronisent',async()=>{
  const user=defaults();user.bestCombo=8;let online=false,clientCalls=0;setLocalDisplayName(user,'Léa',10);const client=mockClient(),service=new LeaderboardService({getUser:()=>user,saveUser:()=>true,clientProvider:async()=>{clientCalls++;return client;},isOnline:()=>online,now:()=>20});
  assert.equal((await service.sync()).status,'offline');assert.equal(user.profile.leaderboardSyncPending,true);assert.equal(clientCalls,0);user.bestCombo=15;service.noteBestCombo();online=true;assert.equal((await service.sync()).status,'synced');assert.equal(client.calls.sync.at(-1).p_best_combo,15);assert.equal(user.profile.leaderboardSyncPending,false);
});

test('classement trié par combo puis date, limité à 3 ou 20 et position obtenue par RPC',async()=>{
  const rows=[{user_id:UUID_A,display_name:'A',best_combo:10,best_combo_at:'2026-09-10T11:00:00Z'},{user_id:UUID_B,display_name:'B',best_combo:15,best_combo_at:'2026-09-10T12:00:00Z'},{user_id:'3',display_name:'C',best_combo:10,best_combo_at:'2026-09-10T10:00:00Z'}];
  assert.deepEqual(limitLeaderboard(rows,3).map(row=>row.display_name),['B','C','A']);assert.equal(limitLeaderboard(Array.from({length:30},(_,i)=>({user_id:String(i),best_combo:i,best_combo_at:String(i)})),20).length,20);
  const user=defaults();setLocalDisplayName(user,'Mathieu',10);const client=mockClient({session:{user:{id:UUID_A}},rows}),service=new LeaderboardService({getUser:()=>user,saveUser:()=>true,clientProvider:async()=>client,isOnline:()=>true});
  const result=await service.load(3);assert.equal(result.rows.length,3);assert.equal(result.position,7);assert.deepEqual(client.calls.limits,[3]);
});

test('UI, SQL et configuration contiennent les intégrations attendues sans secret',async()=>{
  const [home,progression,settings,sql,config]=await Promise.all(['../js/ui/home.js','../js/ui/progression.js','../js/ui/settings.js','../supabase/migrations/001_combo_leaderboard.sql','../js/config/supabase-config.js'].map(path=>readFile(new URL(path,import.meta.url),'utf8')));
  assert.match(home,/leaderboard-preview/);assert.match(progression,/leaderboard-full/);assert.match(settings,/display-name-form/);
  assert.match(sql,/enable row level security/i);assert.match(sql,/for insert[\s\S]*auth\.uid/i);assert.match(sql,/for update[\s\S]*auth\.uid/i);assert.match(sql,/greatest\(current_entry\.best_combo, excluded\.best_combo\)/i);assert.match(sql,/user_id is immutable/i);
  assert.doesNotMatch(config,/service_role|secret key|database password/i);
});
