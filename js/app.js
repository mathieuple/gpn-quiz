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
import {LeaderboardService} from './leaderboard/leaderboard-service.js';
import {hasValidLeaderboardProfile} from './leaderboard/leaderboard-state.js';
import {profileIsRequired,showProfileGate} from './ui/profile-gate.js';
const root=document.querySelector('#main');
const saveCurrentUser=()=>{const saved=save(ctx.user);document.querySelector('#storage-status').textContent=saved?'':'La sauvegarde est indisponible. Ta progression reste active ici ; exporte-la depuis les paramètres.';return saved;};
const ctx={bank:validateDefinitions(definitions).definitions,courseIndex,courseValidation,user:load(),session:null,navigate(route){if(location.hash==='#'+route)render(route);else location.hash=route;},persist(){saveCurrentUser();ctx.leaderboard?.noteBestCombo();},replaceUser(user){if(!hasValidLeaderboardProfile(user)&&hasValidLeaderboardProfile(ctx.user))user.profile=ctx.user.profile;ctx.user=user;ctx.session=null;ctx.leaderboard.adoptUser();applySettings(user.settings);ctx.persist();},updateDisplayName(value){const result=ctx.leaderboard.setDisplayName(value);if(result.valid)ctx.leaderboard.sync().catch(()=>{});return result;},start(options){try{ctx.session=new QuizSession(ctx.bank,ctx.user,options);ctx.navigate('/play');}catch(error){root.textContent=error.message;}}};
ctx.leaderboard=new LeaderboardService({getUser:()=>ctx.user,saveUser:saveCurrentUser});
const screens={'/':home,'/play':quizScreen,'/results':results,'/notions':notions,'/courses':coursesScreen,'/progress':progression,'/settings':settings};
function render(route){
  if(route.startsWith('/course/'))return courseReader(root,ctx,decodeURIComponent(route.slice(8)));
  if(route.startsWith('/courses/'))return courseSubjectScreen(root,ctx,decodeURIComponent(route.slice(9)));
  if(route.startsWith('/notions/'))return notions(root,ctx,{definitionId:decodeURIComponent(route.slice(9))});
  (screens[route]||home)(root,ctx);
}
document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();root.focus();root.scrollIntoView({block:'start'});});
let appStarted=false;
function startApp(){if(appStarted)return;appStarted=true;router(render);ctx.persist();ctx.leaderboard.start();}
applySettings(ctx.user.settings);
if(profileIsRequired(ctx.user))showProfileGate(ctx,startApp);else startApp();
if('serviceWorker' in navigator)navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'}).catch(error=>console.warn('Mode hors ligne indisponible :',error.message));
