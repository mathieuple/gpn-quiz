import {courseQuestionStateId} from '../courses/course-session.js';

export function courseProgress(course,user) {
  const notionStates=course.notions.map(id=>user.notions[id]||{}),questionStates=course.questions.map(q=>user.notions[courseQuestionStateId(q.id)]||{}),all=[...notionStates,...questionStates];
  const studied=all.filter(state=>state.timesSeen>0),notionsSeen=notionStates.filter(state=>state.timesSeen>0).length;
  const average=key=>Math.round(studied.reduce((sum,state)=>sum+(state[key]||0),0)/(studied.length||1));
  return {notionsSeen,notionsTotal:course.notions.length,elementsSeen:studied.length,elementsTotal:all.length,coverage:Math.round(notionsSeen/(course.notions.length||1)*100),mastery:average('mastery'),recognition:average('recognitionMastery'),recall:average('recallMastery')};
}
