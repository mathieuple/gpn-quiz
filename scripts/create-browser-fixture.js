import {writeFile,mkdir} from 'node:fs/promises';
import {defaults} from '../js/storage/migrations.js';
import {DAY} from '../js/progression/spaced-repetition.js';
const user=defaults(),now=Date.now();
user.settings.theme='light';user.xp=120;
for(const id of ['hypoxie','anoxie','stenotherme','thermophile','biotope','biocenose','anisoptere','zygoptere','migration','dispersion','genotype','phenotype','restauration-ecologique','rehabilitation-ecologique','reaffectation-ecologique','stenoxybionte']) {
  user.notions[id]={mastery:51,recognitionMastery:90,recallMastery:30,timesSeen:5,timesCorrect:4,timesAlmostCorrect:0,timesWrong:1,correctStreak:0,wrongStreak:1,lastSeen:now-DAY*2,lastReviewAt:now-DAY*2,nextReviewAt:now-DAY,reviewInterval:1,successfulReviews:1,lastSuccessfulReviewAt:now-DAY*3};
}
user.confusions={'anoxie|hypoxie':{count:3,lastSeen:now-DAY},'biocenose|biotope':{count:2,lastSeen:now-DAY}};
await mkdir(new URL('../tests/fixtures/',import.meta.url),{recursive:true});
await writeFile(new URL('../tests/fixtures/browser-progress.json',import.meta.url),JSON.stringify(user,null,2));
console.log('Fixture de test uniquement : importer sur le port isolé 4174.');
