import {ligneuxById} from '../../data/ligneux/species.js';
import {ligneuxConfusionGroups} from '../../data/ligneux/confusion-groups.js';
import {recordLigneuxAnswer,recordLigneuxExam} from './progress.js';

const shuffle=(items,rng=Math.random)=>{const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;};
const groupFor=id=>ligneuxConfusionGroups.find(group=>group.includes(id))||[];

function distractors(species,all,mode,rng){
  const close=[...new Set([...(mode==='confusions'?groupFor(species.id):species.lookalikes||[]),...groupFor(species.id)])].filter(id=>id!==species.id).map(id=>ligneuxById.get(id)).filter(Boolean);
  const sameFamily=all.filter(item=>item.id!==species.id&&item.family===species.family&&!close.some(x=>x.id===item.id));
  const rest=all.filter(item=>item.id!==species.id&&!close.some(x=>x.id===item.id)&&!sameFamily.some(x=>x.id===item.id));
  return [...shuffle(close,rng),...shuffle(sameFamily,rng),...shuffle(rest,rng)].slice(0,3);
}

function priority(species,progress,rng){
  const item=progress.species[species.id];
  if(!item)return 1000+rng()*20;
  const failure=item.seen?item.wrong/item.seen:1;
  return 150*failure+Math.max(0,60-item.streak*15)+rng()*20;
}

export class LigneuxSession{
  constructor(species,photos,progress,options={},dependencies={}){
    this.species=species;this.photos=photos;this.progress=progress;this.rng=dependencies.rng||Math.random;this.now=dependencies.now||Date.now;
    this.options={mode:'discovery',count:10,organ:'all',...options};this.answers=[];this.usedPhotos=new Set();this.usedSpecies=new Set();this.current=null;this.answered=false;this.finished=false;
    const eligible=this.eligiblePhotos();if(!eligible.length)throw new Error('Aucune photographie disponible pour ce mode.');
    this.limit=this.options.count==='all'?eligible.length:Math.min(Number(this.options.count)||10,eligible.length);
    this.exam=this.options.mode==='exam';this.plan=this.exam?this.buildExamPlan(eligible):[];
  }
  eligiblePhotos(){
    let photos=this.options.ids?.length?this.photos.filter(photo=>this.options.ids.includes(photo.speciesId)):this.photos;
    if(this.options.mode==='leaves')return photos.filter(photo=>['leaf','twig'].includes(photo.organ));
    if(this.options.mode==='confusions'){const ids=new Set(ligneuxConfusionGroups.flat());return photos.filter(photo=>ids.has(photo.speciesId));}
    if(this.options.mode==='advanced'&&this.options.organ!=='all')return photos.filter(photo=>photo.organ===this.options.organ);
    if(this.options.mode==='advanced')return photos.filter(photo=>!['leaf'].includes(photo.organ));
    return photos;
  }
  buildExamPlan(eligible){
    if(this.limit===30){
      return shuffle(this.species,this.rng).map(species=>shuffle(eligible.filter(photo=>photo.speciesId===species.id),this.rng)[0]).filter(Boolean);
    }
    return shuffle(eligible,this.rng).slice(0,this.limit);
  }
  choosePhoto(){
    const eligible=this.eligiblePhotos().filter(photo=>!this.usedPhotos.has(photo.id));
    if(!eligible.length)return null;
    if(this.exam)return this.plan[this.answers.length]||eligible[0];
    const rankedSpecies=[...this.species].filter(species=>eligible.some(photo=>photo.speciesId===species.id)).sort((a,b)=>priority(b,this.progress,this.rng)-priority(a,this.progress,this.rng));
    const top=rankedSpecies.slice(0,Math.min(6,rankedSpecies.length)),species=top[Math.floor(this.rng()*top.length)];
    const candidates=eligible.filter(photo=>photo.speciesId===species.id).sort((a,b)=>(this.progress.photos[a.id]?.shown||0)-(this.progress.photos[b.id]?.shown||0));
    return candidates[0];
  }
  next(){
    if(this.finished)return null;
    const photo=this.choosePhoto();if(!photo){this.finish();return null;}
    const species=ligneuxById.get(photo.speciesId),scientific=this.options.mode==='scientific',nameOnly=scientific&&this.answers.length%2===1;
    const choices=shuffle([species,...distractors(species,this.species,this.options.mode,this.rng)],this.rng);
    this.current={photo:nameOnly?null:photo,sourcePhoto:photo,species,choices,answerStyle:scientific?'scientific':'french',prompt:nameOnly?`Quel est le nom scientifique de « ${species.french} » ?`:(scientific?'Quel est le nom scientifique de cette espèce ?':'Quelle est cette espèce ?')};
    this.usedPhotos.add(photo.id);this.usedSpecies.add(species.id);this.answered=false;return this.current;
  }
  submit(speciesId){
    if(this.answered||!this.current||this.finished)return null;this.answered=true;
    const selected=ligneuxById.get(speciesId),correct=speciesId===this.current.species.id,answeredAt=this.now();
    const answer={...this.current,selected,selectedId:speciesId,correct,answeredAt};this.answers.push(answer);recordLigneuxAnswer(this.progress,answer);
    if(this.answers.length>=this.limit)this.finish();return answer;
  }
  finish(){if(this.finished)return;this.finished=true;if(this.exam)recordLigneuxExam(this.progress,this.answers,this.now());}
}
