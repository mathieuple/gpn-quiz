import {distractors} from './distractor-generator.js';
import {shuffle,random} from '../utils/random.js';
export function generateQuestion(notion, bank, type='qcm', options={}) {
  const rng=options.rng||random;
  if(notion.courseQuestion) {
    const source=notion.courseQuestion;
    if(source.type==='qcm') {
      const answer=source.answer.trim().toLocaleLowerCase('fr');
      const choices=source.choices.map((label,index)=>({id:label.trim().toLocaleLowerCase('fr')===answer?notion.id:`${notion.id}:choice:${index}`,label}));
      return {notion,type:'qcm',reverse:false,prompt:source.question,options:shuffle(choices,rng),answerLabel:'Ta réponse'};
    }
    return {notion,type:'text',reverse:false,prompt:source.question,options:[],answerLabel:source.type==='definition-term'?'Quel est le terme ?':'Ta réponse'};
  }
  const reverse=type==='qcm' && rng()<0.4;
  const field=reverse?'definitionCourte':'terme';
  const others=distractors(notion,bank,field,{...options,minScore:options.allowFallback?55:0});
  if(others.length<3) type='text';
  return {notion,type,reverse:type==='qcm'&&reverse,prompt:type==='qcm'&&reverse?`Que signifie « ${notion.terme} » ?`:notion.definitionCourte, options:type==='qcm'?shuffle([notion,...others],rng).map(d=>({id:d.id,label:d[field]})):[],answerLabel:'Quel est le terme ?'};
}
