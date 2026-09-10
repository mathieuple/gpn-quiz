import {chooseNotion} from './repetition.js';
import {generateQuestion} from './question-generator.js';
import {validateAnswer} from './answer-validator.js';
import {recordNotion} from '../progression/mastery.js';
import {xpFor} from '../progression/xp.js';
import {statistics} from '../progression/statistics.js';
import {shuffle,random} from '../utils/random.js';
import {adaptiveFormat} from './adaptive-format.js';
import {recordConfusion} from '../progression/confusions.js';
import {courseQuestionToNotion} from '../courses/course-session.js';
export class QuizSession {
  constructor(bank,user,options={},dependencies={}) {
    this.rng=dependencies.rng||random;this.now=dependencies.now||Date.now;
    this.user=user;this.options={mode:'mixed',count:10,subjects:[],...options};
    const courseItems=(options.courseQuestions||[]).map(courseQuestionToNotion);
    this.bank=[...bank,...courseItems];
    this.pool=[...bank.filter(d=>(!this.options.subjects.length||this.options.subjects.includes(d.matiere))&&(!options.ids||options.ids.includes(d.id))),...courseItems.filter(d=>!this.options.subjects.length||this.options.subjects.includes(d.matiere))];
    if(options.preset==='daily')this.pool.sort((a,b)=>options.ids.indexOf(a.id)-options.ids.indexOf(b.id));
    if(!this.pool.length)throw new Error('Aucune notion dans cette sélection.');
    this.limit=this.options.mode==='survival'?Infinity:this.options.count;
    this.answers=[];this.recent=[];this.queue=[];this.combo=0;this.best=0;this.lives=3;this.xp=0;this.finished=false;
    this.initialAcquired=statistics(bank,user).acquired;this.oldRecord=user.survivalRecord;
    const count=Number.isFinite(this.limit)?this.limit:20;
    this.examTypes=shuffle(Array.from({length:count},(_,i)=>i<Math.ceil(count/2)?'qcm':'text'),this.rng);
  }
  next() {
    if(this.finished)return null;
    let pool=this.pool;
    if(this.options.mode==='exam'){const unseen=pool.filter(d=>!this.answers.some(a=>a.notion.id===d.id));if(unseen.length)pool=unseen;}
    if(this.options.mode==='survival'&&this.answers.length<24){const difficulty=this.answers.length<8?1:this.answers.length<16?2:3;const subset=pool.filter(d=>d.difficulte===difficulty);if(subset.length)pool=subset;}
    const unseenDaily=this.options.preset==='daily'?pool.find(d=>!this.answers.some(a=>a.notion.id===d.id)):null;
    const selected=unseenDaily?{notion:unseenDaily,revenge:false}:chooseNotion(pool,this.user,this.recent,this.queue,this.answers.length,this.rng,this.now());
    let type=this.options.mode==='qcm'?'qcm':this.options.mode==='text'?'text':this.options.mode==='exam'?this.examTypes[this.answers.length]:adaptiveFormat(this.user.notions[selected.notion.id],this.rng);
    if(!['qcm','text','exam'].includes(this.options.mode)&&this.answers.length>=2&&this.answers.slice(-2).every(a=>a.type===type))type=type==='qcm'?'text':'qcm';
    this.current={...generateQuestion(selected.notion,this.bank,type,{rng:this.rng,user:this.user,allowFallback:!['qcm','exam'].includes(this.options.mode)}),revenge:selected.revenge};this.answered=false;this.hint=false;
    this.recent.push(selected.notion.id);this.recent=this.recent.slice(-5);return this.current;
  }
  submit(value,skip=false) {
    if(this.answered||!this.current||this.finished)return null;
    this.answered=true;const q=this.current;
    const result=skip?'skip':q.type==='qcm'?(value===q.notion.id?'exact':'wrong'):validateAnswer(value,q.notion,this.bank);
    const good=['exact','almost'].includes(result),xp=xpFor(result,q.type,this.hint);
    this.combo=good?this.combo+1:0;this.best=Math.max(this.best,this.combo);this.xp+=xp;
    if(!good){this.lives--;if(this.options.mode!=='exam'){this.queue=this.queue.filter(x=>x.id!==q.notion.id);this.queue.push({id:q.notion.id,due:this.answers.length+3+Math.floor(this.rng()*4)});}}
    const entry={...q,value,result,xp,hint:this.hint,reviewedAt:this.now()};this.answers.push(entry);
    if(this.options.mode!=='exam')this.apply(entry);
    if(this.answers.length>=this.limit||(this.options.mode==='survival'&&this.lives<=0))this.finish();
    return entry;
  }
  apply(a){this.user.notions[a.notion.id]=recordNotion(this.user.notions[a.notion.id],a.result,a.type,a.reviewedAt,a.hint);if(!a.notion.courseQuestion)recordConfusion(this.user,a,this.bank,a.reviewedAt);this.user.xp+=a.xp;this.user.bestCombo=Math.max(this.user.bestCombo,this.best);}
  finish(){if(this.finished)return;this.finished=true;if(this.options.mode==='exam')this.answers.forEach(a=>this.apply(a));if(this.options.mode==='survival')this.user.survivalRecord=Math.max(this.user.survivalRecord,this.answers.filter(a=>['exact','almost'].includes(a.result)).length);}
}
