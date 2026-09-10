const CACHE_PREFIX='gpn-quiz-'+encodeURIComponent(new URL(self.registration.scope).pathname)+'-';
const VERSION=CACHE_PREFIX+'v1.2-vercel-logo-20260910-1';
const FILES=["index.html","manifest.webmanifest","assets/icon.svg","assets/gpn-quiz-logo.png","assets/icon-192.png","assets/icon-512.png","css/components.css","css/screens.css","css/style.css","css/variables.css","js/app.js","js/router.js","js/courses/course-session.js","js/progression/confusions.js","js/progression/course-progress.js","js/progression/exam-score.js","js/progression/mastery.js","js/progression/spaced-repetition.js","js/progression/statistics.js","js/progression/xp.js","js/quiz/adaptive-format.js","js/quiz/answer-validator.js","js/quiz/daily-review.js","js/quiz/distractor-audit.js","js/quiz/distractor-generator.js","js/quiz/equivalence.js","js/quiz/question-generator.js","js/quiz/quiz-engine.js","js/quiz/repetition.js","js/storage/migrations.js","js/storage/storage.js","js/ui/courses.js","js/ui/feedback.js","js/ui/helpers.js","js/ui/home.js","js/ui/notions.js","js/ui/progression.js","js/ui/quiz-screen.js","js/ui/results.js","js/ui/settings.js","js/utils/levenshtein.js","js/utils/normalize.js","js/utils/random.js","data/confusion-groups.js","data/definitions.js","data/validate.js","data/courses/index.js","data/courses/validate.js","data/courses/expertise-faunistique/odonates-demo.js","data/courses/genie-ecologique/quest-ce-que-le-genie-ecologique.js","data/courses/biologie-vegetale/presentation-generale.js"];
self.addEventListener('install',event=>{event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(FILES.map(file=>new URL(file,self.registration.scope).href))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==VERSION).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope)||url.pathname.startsWith('/_vercel/insights/'))return;
  if(request.mode==='navigate') {
    const shell=new URL('index.html',self.registration.scope).href;
    const refresh=fetch(request).then(async response=>{if(response.ok){const cache=await caches.open(VERSION);await cache.put(shell,response.clone());}return response;});
    const update=refresh.catch(()=>{});event.waitUntil?.(update);
    event.respondWith(caches.match(shell).then(cached=>cached||refresh));
  } else {
    const refresh=fetch(request).then(async response=>{if(response.ok){const cache=await caches.open(VERSION);await cache.put(request,response.clone());}return response;});
    const update=refresh.catch(()=>{});event.waitUntil?.(update);
    event.respondWith(caches.match(request).then(cached=>cached||refresh));
  }
});
