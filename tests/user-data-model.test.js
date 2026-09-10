import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SCHEMA_VERSION,defaults,migrate,validateUserData} from '../js/storage/migrations.js';
import {STORAGE_KEY,load,save,serializeUserData,parseImport} from '../js/storage/storage.js';
import {recordNotion} from '../js/progression/mastery.js';
import {statistics} from '../js/progression/statistics.js';
import {definitions} from '../data/definitions.js';

const memory=initial=>{const map=new Map(Object.entries(initial||{}));return {map,getItem:key=>map.get(key)||null,setItem:(key,value)=>map.set(key,value)};};
const NOW=Date.UTC(2026,8,10,12);

test('création, sauvegarde et rechargement utilisent le schéma utilisateur stable',()=>{
  const storage=memory(),user=defaults();user.xp=42;user.statsUpdatedAt=NOW;user.updatedAt=NOW;
  assert.equal(user.schemaVersion,SCHEMA_VERSION);assert.ok(save(user,storage));
  const reloaded=load(storage);assert.deepEqual(reloaded,user);assert.ok(storage.map.has(STORAGE_KEY));
});

test('migration V1 vers le schéma courant sans perte de progression',()=>{
  const legacy={version:1,xp:321,bestCombo:9,survivalRecord:4,settings:{theme:'dark',animations:false,sound:true},notions:{hypoxie:{mastery:68,timesSeen:7,timesCorrect:5,timesWrong:2,lastSeen:NOW,nextReviewAt:NOW+86400000,reviewInterval:1}},confusions:{'anoxie|hypoxie':{count:3,lastSeen:NOW}}};
  const migrated=migrate(legacy);
  assert.equal(migrated.schemaVersion,SCHEMA_VERSION);assert.equal(migrated.xp,321);assert.equal(migrated.notions.hypoxie.timesSeen,7);assert.equal(migrated.notions.hypoxie.recognitionMastery,68);assert.equal(migrated.notions.hypoxie.nextReviewAt,NOW+86400000);assert.equal(migrated.confusions['anoxie|hypoxie'].count,3);assert.equal(migrated.settings.theme,'dark');
});

test('validation rejette les structures dangereuses et répare les valeurs bornées ou dates invalides',()=>{
  assert.equal(validateUserData({version:1,notions:[]},{requireVersion:true}).valid,false);
  assert.equal(validateUserData({version:1,xp:-1,notions:{}},{requireVersion:true}).valid,false);
  const result=validateUserData({version:1,xp:1,notions:{hypoxie:{mastery:180,timesSeen:1,lastSeen:'hier',nextReviewAt:-4}}},{requireVersion:true});
  assert.equal(result.valid,true);assert.equal(result.data.notions.hypoxie.mastery,100);assert.equal(result.data.notions.hypoxie.lastSeen,0);assert.equal(result.data.notions.hypoxie.nextReviewAt,0);assert.ok(result.errors.length>=3);
});

test('une nouvelle notion absente des données utilisateur ne nécessite aucune migration',()=>{
  const user=defaults(),newContent={id:'future-notion'};
  assert.equal(user.notions[newContent.id],undefined);assert.doesNotThrow(()=>statistics([...definitions,newContent],user));
});

test('export et import font un round-trip sans perte',()=>{
  const user=defaults();user.notions.hypoxie=recordNotion({},'exact','text',NOW);user.xp=15;user.statsUpdatedAt=NOW;user.updatedAt=NOW;
  const raw=serializeUserData(user),imported=parseImport(raw);
  assert.deepEqual(imported,migrate(user));assert.equal(JSON.parse(raw).schemaVersion,SCHEMA_VERSION);
});

test('la progression reste rattachée au même ID après rechargement',()=>{
  const storage=memory(),user=defaults();user.notions['course-question:stable-q01']=recordNotion({},'exact','qcm',NOW);save(user,storage);
  const reloaded=load(storage);assert.equal(reloaded.notions['course-question:stable-q01'].timesSeen,1);assert.equal(Object.keys(reloaded.notions).length,1);assert.equal(reloaded.notions['stable-q01'],undefined);
});
