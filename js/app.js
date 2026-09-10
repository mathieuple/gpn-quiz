import {definitions} from '../data/definitions.js';
import {validateDefinitions} from '../data/validate.js';
import {load,save} from './storage/storage.js';
import {QuizSession} from './quiz/quiz-engine.js';
import {router} from './router.js';
import {applySettings} from './ui/helpers.js';
import {home} from './ui/home.js';
import {quizScreen} from './ui/quiz-screen.js';
import {results} from './ui/results.js';
import {notions} from './ui/notions.js';
import {progression} from './ui/progression.js';
import {settings} from './ui/settings.js';
import {coursesScreen,courseSubjectScreen,courseReader} from './ui/courses.js';
import {courseIndex,courseValidation} from '../data/courses/index.js';
const root=document.querySelector('#main');
const ctx={bank:validateDefinitions(definitions).definitions,courseIndex,courseValidation,user:load(),session:null,navigate(route){if(location.hash==='#'+route)render(route);else location.hash=route;},persist(){document.querySelector('#storage-status').textContent=save(ctx.user)?'':'La sauvegarde est indisponible. Ta progression reste active ici ; exporte-la depuis les paramètres.';},replaceUser(user){ctx.user=user;ctx.session=null;applySettings(user.settings);ctx.persist();},start(options){try{ctx.session=new QuizSession(ctx.bank,ctx.user,options);ctx.navigate('/play');}catch(error){root.textContent=error.message;}}};
const screens={'/':home,'/play':quizScreen,'/results':results,'/notions':notions,'/courses':coursesScreen,'/progress':progression,'/settings':settings};
function render(route){
  if(route.startsWith('/course/'))return courseReader(root,ctx,decodeURIComponent(route.slice(8)));
  if(route.startsWith('/courses/'))return courseSubjectScreen(root,ctx,decodeURIComponent(route.slice(9)));
  if(route.startsWith('/notions/'))return notions(root,ctx,{definitionId:decodeURIComponent(route.slice(9))});
  (screens[route]||home)(root,ctx);
}
document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();root.focus();root.scrollIntoView({block:'start'});});
applySettings(ctx.user.settings);router(render);ctx.persist();
if('serviceWorker' in navigator)navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'}).catch(error=>console.warn('Mode hors ligne indisponible :',error.message));
