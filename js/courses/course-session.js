export const courseQuestionStateId=id=>`course-question:${id}`;

export function courseQuestionToNotion(question) {
  return {
    id:courseQuestionStateId(question.id),
    terme:question.answer,
    definitionCourte:question.question,
    explication:question.explanation||'',
    matiere:question.matiere,
    theme:question.courseTitle,
    difficulte:question.difficulty,
    variantesAcceptees:question.acceptedAnswers||[],
    distracteursProches:[],
    courseQuestion:question
  };
}

export function courseQuizOptions(course,sectionId) {
  const section=sectionId?course.sections.find(item=>item.id===sectionId):null;
  if(sectionId&&!section)throw new Error('Section de cours inconnue.');
  const ids=sectionId?(section.notions||[]):course.notions;
  const questions=course.questions.filter(question=>!sectionId||question.sectionId===sectionId).map(question=>({...question,courseId:course.id,courseTitle:course.titre,matiere:course.matiere}));
  const count=ids.length+questions.length;
  if(!count)throw new Error('Ce cours ne contient encore aucun élément à réviser.');
  return {mode:'mixed',count:Math.min(20,count),ids:[...ids],courseQuestions:questions,preset:'course',courseId:course.id,sectionId:sectionId||null};
}
