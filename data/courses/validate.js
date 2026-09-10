const QUESTION_TYPES=new Set(['qcm','short-answer','definition-term']);
const CONTENT_TYPES=new Set(['paragraph','bullet-list','ordered-list','important','definition','table']);
const text=value=>typeof value==='string'&&value.trim().length>0;

function validContent(block,notionIds) {
  if(!block||!CONTENT_TYPES.has(block.type))return false;
  if(['paragraph','important'].includes(block.type))return text(block.text);
  if(['bullet-list','ordered-list'].includes(block.type))return Array.isArray(block.items)&&block.items.length>0&&block.items.every(text);
  if(block.type==='definition')return text(block.notionId)&&notionIds.has(block.notionId);
  return Array.isArray(block.headers)&&block.headers.length>0&&block.headers.every(text)&&Array.isArray(block.rows)&&block.rows.length>0&&block.rows.every(row=>Array.isArray(row)&&row.length===block.headers.length&&row.every(text));
}

export function validateCourses(packs,definitions,report=console.warn) {
  const valid=[],errors=[],courseIds=new Set(),questionIds=new Set();
  const bank=Array.isArray(definitions)?definitions:[],notions=new Set(bank.map(d=>d.id)),subjects=new Set(bank.map(d=>d.matiere));
  const fail=(courseId,message)=>errors.push(`[${courseId||'cours sans ID'}] ${message}`);
  for(const course of Array.isArray(packs)?packs:[]) {
    const before=errors.length,id=text(course?.id)?course.id:'',localQuestionIds=new Set();
    if(!id||courseIds.has(id))fail(id,id?'ID de cours dupliqué.':'ID de cours manquant.');
    if(!text(course?.matiere)||!subjects.has(course.matiere))fail(id,'Matière absente de la banque de définitions.');
    if(!text(course?.titre))fail(id,'Titre manquant.');
    if(!Number.isInteger(course?.ordre)||course.ordre<0)fail(id,'Ordre invalide.');
    if(!Number.isInteger(course?.version)||course.version<1)fail(id,'Version invalide.');
    if(!Array.isArray(course?.sections)||!course.sections.length)fail(id,'Au moins une section est requise.');
    if(!Array.isArray(course?.notions))fail(id,'La liste notions est requise.');
    const courseNotions=new Set(Array.isArray(course?.notions)?course.notions:[]);
    for(const notionId of courseNotions)if(!notions.has(notionId))fail(id,`Notion inconnue : ${notionId}.`);
    if(courseNotions.size!==(course?.notions?.length||0))fail(id,'Une notion est référencée plusieurs fois.');
    const sectionIds=new Set();
    for(const section of course?.sections||[]) {
      if(!text(section?.id)||sectionIds.has(section.id))fail(id,'ID de section manquant ou dupliqué.');else sectionIds.add(section.id);
      if(!text(section?.titre))fail(id,`Titre manquant pour la section ${section?.id||'inconnue'}.`);
      if(!Array.isArray(section?.contenu)||!section.contenu.length)fail(id,`Contenu manquant pour la section ${section?.id||'inconnue'}.`);
      for(const block of section?.contenu||[])if(!validContent(block,notions))fail(id,`Bloc de contenu invalide dans ${section.id}.`);
      if(section?.notions!==undefined&&(!Array.isArray(section.notions)||section.notions.some(n=>!courseNotions.has(n))))fail(id,`Notions de section invalides dans ${section.id}.`);
    }
    if(!Array.isArray(course?.questions))fail(id,'La liste questions est requise.');
    for(const question of course?.questions||[]) {
      if(!text(question?.id)||questionIds.has(question.id)||localQuestionIds.has(question.id))fail(id,'ID de question manquant ou dupliqué.');
      if(text(question?.id))localQuestionIds.add(question.id);
      if(!sectionIds.has(question?.sectionId))fail(id,`Section inconnue pour la question ${question?.id||'inconnue'}.`);
      if(!QUESTION_TYPES.has(question?.type)||!text(question?.question)||!text(question?.answer)||![1,2,3].includes(question?.difficulty))fail(id,`Question invalide : ${question?.id||'inconnue'}.`);
      if(question?.acceptedAnswers!==undefined&&(!Array.isArray(question.acceptedAnswers)||!question.acceptedAnswers.every(text)))fail(id,`Réponses acceptées invalides : ${question?.id||'inconnue'}.`);
      if(question?.type==='qcm') {
        const choices=Array.isArray(question.choices)?question.choices:[],normalized=choices.map(v=>String(v).trim().toLocaleLowerCase('fr')),answer=text(question.answer)?question.answer.trim().toLocaleLowerCase('fr'):'';
        if(choices.length!==4||!choices.every(text)||new Set(normalized).size!==choices.length||normalized.filter(v=>v===answer).length!==1)fail(id,`Choix QCM invalides : ${question?.id||'inconnue'}.`);
      }
    }
    if(errors.length===before){valid.push(course);courseIds.add(id);for(const questionId of localQuestionIds)questionIds.add(questionId);}
  }
  errors.forEach(message=>report(`Course Pack invalide ${message}`));
  return {courses:valid,errors};
}
