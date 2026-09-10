import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {definitions as bank} from '../data/definitions.js';
import {confusionGroups} from '../data/confusion-groups.js';
import {auditDistractors} from '../js/quiz/distractor-audit.js';
import {areAmbiguous} from '../js/quiz/equivalence.js';
import {distractorScore} from '../js/quiz/distractor-generator.js';
import {generateQuestion} from '../js/quiz/question-generator.js';
import {seededRandom} from '../js/utils/random.js';
import {recordNotion,combinedMastery} from '../js/progression/mastery.js';
import {scheduleReview,getDueNotions,DAY} from '../js/progression/spaced-repetition.js';
import {defaults,migrate} from '../js/storage/migrations.js';
import {load,save,STORAGE_KEY,LEGACY_KEY,parseImport} from '../js/storage/storage.js';
import {recordConfusion,confusionKey,topConfusions,confusionWeight} from '../js/progression/confusions.js';
import {adaptiveFormat,recallProbability} from '../js/quiz/adaptive-format.js';
import {dailyPreset} from '../js/quiz/daily-review.js';
import {QuizSession} from '../js/quiz/quiz-engine.js';
import {examPoints,examScore} from '../js/progression/exam-score.js';
import {statistics} from '../js/progression/statistics.js';
import {feedback} from '../js/ui/feedback.js';
const NOW=Date.UTC(2026,8,9,12),byId=id=>bank.find(d=>d.id===id);
const memory=initial=>{const map=new Map(Object.entries(initial||{}));return {map,getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};};

test('banque scientifique d’origine inchangée hors distracteurs ; audit complet sans référence invalide',async()=>{
  const original=JSON.parse(await readFile(new URL('../gpn_quiz_definitions_v1.json',import.meta.url),'utf8'));
  for(const old of original){const d=bank.find(n=>n.id===old.id);assert.ok(d,old.id+': notion d’origine absente');for(const key of Object.keys(old).filter(k=>k!=='distracteursProches'))assert.deepEqual(d[key],old[key],d.id+': '+key);}
  const before=auditDistractors(original),after=auditDistractors(bank);
  assert.equal(before.references.filter(r=>r.missing).length,41);
  assert.equal(before.references.filter(r=>r.status==='alias').length,2);
  assert.equal(after.references.filter(r=>r.status!=='valid').length,0);
  assert.ok(before.equivalences.some(p=>p.ids.includes('suivi')&&p.ids.includes('suivi-ecologique')));
});

test('audit détecte doublons, alias et synonymes potentiels',()=>{
  const a={...byId('hypoxie'),distracteursProches:['Anoxie','anoxie','sans oxygene']},b={...byId('anoxie'),variantesAcceptees:['sans oxygene']};
  const report=auditDistractors([a,b]);assert.equal(report.references.filter(r=>r.id==='hypoxie'&&r.duplicate).length,2);assert.ok(report.references.some(r=>r.synonym));
});

test('tous les groupes de confusion utilisent des IDs existants',()=>{for(const group of confusionGroups){assert.equal(new Set(group).size,group.length);assert.ok(group.every(id=>byId(id)));}});

test('stress déterministe : 6000 QCM, aucune ambiguïté entre les quatre options',()=>{
  const rng=seededRandom(110);
  for(const notion of bank)for(let i=0;i<40;i++){
    const q=generateQuestion(notion,bank,'qcm',{rng});
    assert.equal(q.type,'qcm');assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(o=>o.label)).size,4);assert.equal(q.options.filter(o=>o.id===notion.id).length,1);
    for(let a=0;a<4;a++)for(let b=a+1;b<4;b++)assert.equal(areAmbiguous(byId(q.options[a].id),byId(q.options[b].id)),false,notion.id);
  }
});

test('score : déclaration avant groupe avant thème ; petit pool sûr et hasard reproductible',()=>{
  const d=byId('hypoxie');assert.ok(distractorScore(d,byId('anoxie'))>distractorScore(d,byId('ommatidie')));
  assert.equal(distractorScore(byId('suivi'),byId('suivi-ecologique')),-Infinity);
  assert.deepEqual(generateQuestion(d,bank,'qcm',{rng:seededRandom(7)}),generateQuestion(d,bank,'qcm',{rng:seededRandom(7)}));
  assert.equal(generateQuestion(d,[d,byId('anoxie')],'qcm',{allowFallback:true}).type,'text');
});

test('Migration exploite la référence réciproque ; mixte refuse les replis sans proximité',()=>{
  const q=generateQuestion(byId('migration'),bank,'qcm',{rng:seededRandom(114)});
  assert.ok(q.options.some(o=>o.id==='autochtonie'));
  assert.ok(q.options.every(o=>['migration','dispersion','dispersion-de-reproduction','autochtonie'].includes(o.id)));
  assert.equal(generateQuestion(byId('dioique'),bank,'qcm',{allowFallback:true}).type,'text');
});

test('dimensions distinctes, gains, pertes, pondération et bornes',()=>{
  const q=recordNotion({},'exact','qcm',NOW);assert.equal(q.recognitionMastery,8);assert.equal(q.recallMastery,0);assert.equal(q.mastery,3);
  const t=recordNotion({},'exact','text',NOW);assert.equal(t.recognitionMastery,2);assert.equal(t.recallMastery,12);assert.equal(t.mastery,9);
  assert.equal(recordNotion({},'almost','text',NOW).recallMastery,6);
  assert.equal(recordNotion({recognitionMastery:50,recallMastery:50},'wrong','qcm',NOW).recallMastery,50);
  const top=recordNotion({recognitionMastery:100,recallMastery:98},'exact','text',NOW);assert.equal(top.mastery,100);
  assert.equal(recordNotion({recognitionMastery:3},'wrong','qcm',NOW).recognitionMastery,0);
  assert.equal(combinedMastery(80,40),54);
});

test('migration V1 conserve scores, compteurs, réglages et original octet pour octet',()=>{
  const legacy={version:1,xp:1240,bestCombo:12,survivalRecord:27,settings:{theme:'dark',sound:true,animations:false},notions:{hypoxie:{mastery:70,timesSeen:7,timesCorrect:4,timesAlmostCorrect:1,timesWrong:2,correctStreak:1,wrongStreak:0,lastSeen:NOW-DAY*2}}};
  const raw=JSON.stringify(legacy),storage=memory({[LEGACY_KEY]:raw}),user=load(storage);
  assert.equal(user.schemaVersion,3);assert.equal(user.xp,1240);assert.equal(user.bestCombo,12);assert.equal(user.survivalRecord,27);assert.deepEqual({...user.settings,updatedAt:undefined},{...legacy.settings,updatedAt:undefined});
  for(const [k,v] of Object.entries(legacy.notions.hypoxie))assert.equal(user.notions.hypoxie[k],v);
  assert.equal(user.notions.hypoxie.recognitionMastery,70);assert.equal(user.notions.hypoxie.recallMastery,70);
  assert.ok(save(user,storage));assert.equal(storage.map.get(LEGACY_KEY),raw);assert.equal(load(storage).xp,1240);assert.deepEqual(migrate(user),user);
  assert.equal(parseImport(raw).notions.hypoxie.mastery,70);
});

test('V1.1 corrompue : repli V1 et archivage avant remplacement',()=>{
  const storage=memory({[STORAGE_KEY]:'{broken',[LEGACY_KEY]:JSON.stringify({version:1,xp:77})});
  const user=load(storage);assert.equal(user.xp,77);assert.ok(save(user,storage));assert.ok([...storage.map.keys()].some(k=>k.startsWith(STORAGE_KEY+'.recovery.')));assert.ok(storage.map.has(LEGACY_KEY));
});

test('révisions : dates fixes, échelons 1/3/7/14/30 jours et un avancement quotidien',()=>{
  let n={},now=NOW;
  for(const expected of [1,3,7,14,30]){n=scheduleReview(n,'exact','text',now);assert.equal(n.reviewInterval,expected);assert.equal(n.nextReviewAt,now+expected*DAY);now=n.nextReviewAt;}
  const first=scheduleReview({},'exact','text',NOW),second=scheduleReview(first,'exact','text',NOW+1000);assert.equal(second.successfulReviews,1);assert.equal(second.nextReviewAt,first.nextReviewAt);
});

test('révisions : almost, erreur, inconnu, indice et QCM seuls',()=>{
  const prior={successfulReviews:3,lastSuccessfulReviewAt:NOW-DAY*10};
  const exact=scheduleReview(prior,'exact','text',NOW),almost=scheduleReview(prior,'almost','text',NOW);
  assert.ok(almost.reviewInterval<exact.reviewInterval);assert.ok(almost.reviewInterval>1);
  for(const result of ['wrong','skip']){const n=scheduleReview(prior,result,'text',NOW);assert.equal(n.nextReviewAt,NOW+DAY/24);assert.equal(n.successfulReviews,0);}
  assert.equal(scheduleReview(prior,'exact','qcm',NOW).reviewInterval,3);
  assert.equal(scheduleReview(prior,'exact','text',NOW,true).reviewInterval,1);
  assert.equal(scheduleReview({...prior,recallMastery:20},'exact','text',NOW).reviewInterval,7);
});

test('notions dues : dates futures, nouveautés exclues et matières mélangées',()=>{
  const user=defaults();user.notions={hypoxie:{timesSeen:2,nextReviewAt:NOW},anoxie:{timesSeen:2,nextReviewAt:NOW+1},genotype:{timesSeen:1,nextReviewAt:NOW-1},phenotype:{timesSeen:0,nextReviewAt:NOW-1}};
  assert.deepEqual(getDueNotions(bank,user,NOW).map(d=>d.id).sort(),['genotype','hypoxie']);
});

test('session du jour : 20 prioritaires maximum, aucune nouveauté et passage de toute la sélection',()=>{
  const user=defaults();for(const d of bank.slice(0,30))user.notions[d.id]={timesSeen:1,mastery:20,recognitionMastery:50,recallMastery:4,nextReviewAt:NOW-DAY,lastSeen:NOW-DAY,wrongStreak:0};
  const preset=dailyPreset(bank,user,NOW);assert.equal(preset.ids.length,20);assert.equal(preset.count,20);
  const session=new QuizSession(bank,user,preset,{rng:seededRandom(1),now:()=>NOW});while(!session.finished){const q=session.next();session.submit(q.type==='qcm'?q.notion.id:q.notion.terme);}
  assert.equal(new Set(session.answers.map(a=>a.notion.id)).size,20);assert.equal(getDueNotions(bank,user,NOW).length,10);
});

test('confusions réelles : ordre normalisé, variante, faux texte et skip',()=>{
  const user=defaults();
  const answer=(id,value,result='wrong',type='text')=>({notion:byId(id),value,result,type});
  recordConfusion(user,answer('hypoxie','Anoxie'),bank,NOW);recordConfusion(user,answer('anoxie','hypoxie','wrong','qcm'),bank,NOW+1);
  assert.equal(user.confusions[confusionKey('hypoxie','anoxie')].count,2);
  recordConfusion(user,answer('hypoxie','banane'),bank,NOW);recordConfusion(user,answer('hypoxie','','skip'),bank,NOW);recordConfusion(user,answer('suivi','suivi écologique'),bank,NOW);
  assert.equal(Object.keys(user.confusions).length,1);assert.equal(topConfusions(bank,user)[0].count,2);
  user.confusions[confusionKey('hypoxie','anoxie')].count=1000;assert.equal(confusionWeight('hypoxie',user),2);
});

test('adaptation : reconnaissance forte favorise rappel sans imposer le format',()=>{
  const n={timesSeen:10,recognitionMastery:85,recallMastery:30};assert.equal(recallProbability(n),.9);
  assert.equal(adaptiveFormat(n,()=>.8),'text');assert.equal(adaptiveFormat(n,()=>.99),'qcm');assert.equal(adaptiveFormat({},()=>.5),'qcm');
  const user=defaults();user.notions.hypoxie=n;const s=new QuizSession(bank,user,{mode:'mixed',ids:['hypoxie'],count:1},{rng:()=>.5,now:()=>NOW});assert.equal(s.next().type,'text');
});

test('examen : exact 1, presque 0.75 et note 17.25 sur 20',()=>{
  assert.equal(examPoints('exact'),1);assert.equal(examPoints('almost'),.75);assert.equal(examPoints('wrong'),0);assert.equal(examPoints('skip'),0);
  const answers=[...Array(15).fill({result:'exact'}),...Array(3).fill({result:'almost'}),...Array(2).fill({result:'wrong'})];assert.equal(examScore(answers).grade,17.25);
});

test('statistiques : couverture et moyennes sur notions vues distinctes',()=>{
  const user=defaults();user.notions={hypoxie:{timesSeen:1,mastery:54,recognitionMastery:80,recallMastery:40},anoxie:{timesSeen:1,mastery:74,recognitionMastery:100,recallMastery:60}};
  const s=statistics([byId('hypoxie'),byId('anoxie'),byId('genotype'),byId('phenotype')],user);assert.equal(s.coverage,50);assert.equal(s.studiedMastery,64);assert.equal(s.recognition,90);assert.equal(s.recall,50);assert.equal(s.mastery,32);
});

test('feedback inconnu : À RETENIR, pas de confusion inventée ; erreur connue compare les définitions',()=>{
  const a={notion:byId('hypoxie'),value:'',result:'skip',type:'text',xp:0};
  const skip=feedback(a,bank,0);assert.match(skip,/À RETENIR/);assert.doesNotMatch(skip,/À ne pas confondre/);
  const wrong=feedback({...a,result:'wrong',value:'Anoxie'},bank,0);assert.match(wrong,/Tu as répondu/);assert.match(wrong,/Absence de dioxygène/);
});
