# 🌿 GPN Quiz — V1.2

Cours, définitions et quiz pour étudiants en BTSA GPN. Application statique en HTML, CSS et JavaScript ES Modules, sans bibliothèque, backend, compte, IA ou collecte de données. La V1.2 ajoute les Course Packs sans modifier les 150 notions ni les modes pédagogiques de la V1.1.

## Course System V1.2

Les Course Packs résident dans `data/courses/`. L’index central fournit les cours par matière, les relations cours ↔ définitions et les questions propres à chaque cours. `validateCourses()` écarte un pack invalide sans empêcher le reste de l’application de démarrer.

La page **Cours** est générée depuis cet index. Une lecture contient une table des matières légère, les blocs sémantiques du pack, ses définitions liées et **Réviser ce cours**. Cette session transmet au moteur existant uniquement les IDs de définitions et les questions du pack. Les questions de cours utilisent les mêmes scores de maîtrise, XP, répétition espacée et stockage que les définitions.

Le pack Odonates livré est volontairement minimal : il démontre le système avec des références déjà présentes, sans ajouter de contenu scientifique. Voir `docs/ADDING_A_COURSE.md` et `data/courses/_template.js` pour ajouter une vraie source de cours.

## Lancer localement

Avec Node.js 20 ou supérieur :

```powershell
cd "C:\Users\Mathieu\Desktop\Quizz GPN"
node server.js
```

Ouvrir **http://localhost:4173/**. Arrêter avec `Ctrl+C`. Aucun `npm install` ni build. Les modules et le service worker demandent HTTP : ne pas ouvrir `index.html` par double-clic. Le serveur est un outil de développement, pas un backend applicatif.

Le sous-chemin de test est **http://localhost:4173/gpn-quiz/**. Attention : localhost et 127.0.0.1 sont des origines différentes, avec des progressions indépendantes.

## Nouveautés pédagogiques

- Reconnaissance QCM et rappel actif en saisie séparés.
- Répétition espacée, révisions dues et session « Révisions du jour ».
- Confusions réellement observées, compteurs agrégés et mini-sessions de six questions.
- Audit exhaustif des distracteurs ; exclusions d'ambiguïtés entre toutes les propositions.
- Couverture distincte de la maîtrise des notions étudiées, dimensions par matière et prochaine révision dans les fiches.
- État neutre « Nouvelle » séparé des notions étudiées à revoir.
- « Je ne sais pas » affiche « À retenir », sans confusion inventée.
- En examen, presque vaut 0,75 point. XP et combo restent ceux de la V1.

## Reconnaissance et rappel actif

La maîtrise globale est arrondie à l'entier le plus proche : `0,35 × recognitionMastery + 0,65 × recallMastery`.

| Résultat | Reconnaissance | Rappel actif |
|---|---:|---:|
| QCM exact | +8 | inchangé |
| Saisie exacte | +2 | +12 |
| Saisie presque | +1 | +6 |
| Erreur | −8 dans la dimension utilisée | idem |
| Je ne sais pas | −5 dans la dimension utilisée | idem |

Toutes les dimensions sont bornées entre 0 et 100. `updateMastery` garde la règle de delta V1 ; `recordNotion` l'applique à la dimension correspondante. Les seuils globaux restent 25, 50, 75 et 90. L'ancienne maîtrise n'est plus présentée comme une mesure unique ambiguë.

En mixte, la probabilité initiale de saisie est 25 % pour une notion nouvelle, 30 % pour une reconnaissance très faible, 90 % si reconnaissance >75 et rappel <60, et 65 % sinon. Le garde-fou V1 contre trois formats consécutifs identiques est conservé. QCM et examen gardent leurs formats imposés. La révision ciblée utilise le même choix adaptatif.

## Répétition espacée

`js/progression/spaced-repetition.js` centralise un calendrier testable avec date injectée :

- Réussites espacées : 1, 3, 7, 14, puis 30 jours.
- Une seule progression d'échelon par période de 24 heures ; les répétitions immédiates ne repoussent pas indéfiniment l'échéance.
- QCM seul : intervalle plafonné à 3 jours. Saisie avec rappel actif encore inférieur à 60 : plafond de 7 jours.
- Presque : 75 % de l'intervalle prévu, au minimum 1 jour.
- Indice : intervalle de 1 jour, sans nouvelle réussite indépendante.
- Erreur ou inconnu : prochaine révision dans 1 heure et échelons de réussite remis à zéro. La file intra-session V1 reste disponible dans les sessions classiques.

Champs : `lastReviewAt`, `nextReviewAt`, `reviewInterval` (en jours, fraction possible), `successfulReviews` (échelon de réussites espacées, plafonné à 5), `lastSuccessfulReviewAt`.

Seules les notions déjà étudiées avec une échéance atteinte sont dues. Les nouvelles ne sont pas automatiquement dues. Le bloc quotidien prend jusqu'à 20 notions, en tenant compte du retard, des erreurs persistantes, du rappel faible et des confusions. Il les parcourt chacune une fois, sans laisser les erreurs priver les autres de leur passage. Le bilan permet de revoir les erreurs et, si nécessaire, de poursuivre les autres notions dues. La file différée reste inchangée pour les sessions de révision classiques.

## Confusions et qualité des QCM

`data/confusion-groups.js` contient les groupes et les exclusions pédagogiques. Une exclusion empêche deux notions de coexister dans un QCM ; elle ne les transforme pas en variantes acceptées en saisie.

Une confusion est comptée uniquement si une réponse réellement erronée identifie exactement un autre terme, son ID QCM ou une variante officielle non ambiguë. Pas de confusion pour un texte aléatoire, une approximation non identifiable ou « Je ne sais pas ». La paire est triée (`anoxie|hypoxie`) pour agréger les deux directions. Les bonus sont plafonnés : +2 au poids de sélection, +5 au score d'un distracteur.

Score de base : référence déclarée 100, référence réciproque 90, groupe 80, thème 60, matière 40, difficulté proche 10, dernier recours 1. La difficulté et les confusions départagent légèrement les candidats. Doublons, variantes partagées, définitions identiques et exclusions explicites sont éliminés, y compris entre les distracteurs.

En mixte/survie, si trois distracteurs de niveau thème ou supérieur ne sont pas disponibles, passage en saisie. En QCM strict et examen, élargissement progressif tout en interdisant les ambiguïtés ; certains sujets isolés demandent donc encore une validation pédagogique. Aucun terme absent ni aucune définition inventée n'est ajouté.

Rapport reproductible :

```powershell
node scripts/audit-distractors.js
```

Voir **docs/DISTRACTEURS.md** et **docs/distractor-audit.json** : 41 références absentes au départ, 2 canonicalisées, 39 supprimées, plus 26 références existantes ambiguës retirées. Les 150 termes, définitions, explications, variantes, matières et difficultés restent identiques aux sources initiales. L'audit ne prétend pas remplacer la relecture d'un enseignant.

## Sauvegarde et migration

L'enveloppe reste `version: 1` ; `schemaRevision: 2` identifie la structure V1.1. Ce choix conserve la compatibilité du format et de ses tests. **Nouvelle clé : `gpnQuiz.userData.v1.1`. Ancienne clé : `gpnQuiz.userData.v1`, conservée sans écriture ni suppression.**

Au chargement : préférence à V1.1 ; si absente ou illisible, lecture V1 et migration. L'application écrit ensuite le nouveau format séparément. Les données V1.1 illisibles sont archivées sous une clé `.recovery.<timestamp>` avant tout remplacement ; si l'archivage ou l'écriture échoue, l'application indique que la sauvegarde n'est pas disponible.

Pour chaque notion V1, `recognitionMastery` et `recallMastery` commencent à l'ancienne `mastery`. XP, records, compteurs, séries, dernière visite et réglages sont conservés. Aucun historique de type de question n'est inventé. Une notion déjà étudiée est initialement programmée à `lastSeen + 1 jour` ; si la date manque, elle est immédiatement due. Une notion nouvelle reste sans échéance. Les échelons de réussites espacées commencent à zéro.

Exemple :

```json
{
  "version": 1,
  "schemaRevision": 2,
  "xp": 1240,
  "bestCombo": 12,
  "survivalRecord": 27,
  "notions": {
    "hypoxie": {
      "mastery": 54,
      "recognitionMastery": 80,
      "recallMastery": 40,
      "timesSeen": 7,
      "lastReviewAt": 1788942140000,
      "nextReviewAt": 1789028540000,
      "reviewInterval": 1,
      "successfulReviews": 1
    }
  },
  "confusions": {"anoxie|hypoxie": {"count": 3, "lastSeen": 1788942140000}},
  "settings": {"theme": "auto", "animations": true, "sound": false}
}
```

Import/export JSON compatible V1 et V1.1. Réinitialiser agit sur la progression V1.1 ; la copie historique V1 reste disponible. Les réponses d'examen sont appliquées à la fin, y compris lors d'un arrêt volontaire.

## Examen et statistiques

Exact = 1 point ; presque = 0,75 ; erreur/inconnu = 0. La somme est ramenée sur 20, arrondie à deux décimales, avec virgule française. Exemple testé : 15 exactes + 3 presque + 2 erreurs = **17,25/20**. Un examen interrompu précise que la note est calculée sur les réponses données.

Couverture = notions étudiées / banque ; maîtrise étudiée, reconnaissance et rappel = moyennes sur les seules notions vues. La métrique globale incluant les nouvelles reste disponible au moteur, mais n'est plus le seul chiffre présenté à l'étudiant.

## Architecture conservée

- `data/definitions.js`, `data/validate.js` : définitions et validation ; `data/courses/` : Course Packs, validation et index.
- `js/quiz/` : moteur existant, adaptation du format, preset quotidien, audit et exclusions.
- `js/progression/` : maîtrise, XP, statistiques, calendrier, confusions et note d'examen.
- `js/storage/` : clés locales, assainissement et migration.
- `js/ui/` : mêmes écrans ; `js/app.js` et `js/router.js` : mêmes routes.
- `js/utils/random.js` : seul appel à `Math.random`, mélange et générateur à graine pour reproduire les tests. Les dépendances `{rng, now}` sont injectables dans `QuizSession`.
- `css/` : composants et thème existants, quelques règles pour les nouvelles cartes.

## Tests

```powershell
node --test tests/*.test.js
```

Tous les tests V1 sont conservés sans modification. Nouveaux tests : double maîtrise, conservation V1, idempotence, archivage, dates fixes, échéances, session quotidienne, confusions, sélection adaptative, note d'examen, statistiques et feedback. Stress : 3 000 QCM V1 et 6 000 QCM supplémentaires déterministes. Les données scientifiques sont comparées champ par champ aux sources originales.

Voir **tests/VALIDATION-V1.1.md** pour les résultats concrets. Les sept exemples pédagogiques reproductibles sont consultables dans `tests/manual-questions.html`.

Pour vérifier avec des données fictives sans toucher à la progression normale :

```powershell
node scripts/create-browser-fixture.js
$env:GPN_QUIZ_PORT = '4174'
node server.js
```

Ouvrir http://127.0.0.1:4174/gpn-quiz/ et importer `tests/fixtures/browser-progress.json` depuis les paramètres. Ce fichier est strictement une fixture de test.

## PWA et publication

Stratégie V1 conservée : assets en cache, HTML réseau avec repli hors ligne, banque et Course Packs rafraîchis depuis le réseau avec repli cache. Cache versionné V1.2 ; nouveaux modules ajoutés à `FILES`. Les caches sont isolés par sous-chemin. Modifier `VERSION` et ajouter chaque nouveau pack à `FILES` lors d’une publication. HTTPS ou localhost nécessaire ; l'installation native dépend du navigateur.

GitHub Pages : déposer les fichiers à la racine d'un dépôt, avec `.nojekyll`, puis **Settings → Pages → Deploy from a branch → main → /(root)**. Aucun build. Les chemins relatifs fonctionnent sous `/gpn-quiz/`. Aucun déploiement réalisé par cette livraison.

## Compromis et suites

- Restauration d'une session en cours reportée : sécuriser une transaction atomique progression/session est préférable à risquer des doubles points en examen. Recharger conserve les scores enregistrés, mais termine la session en mémoire.
- Les anciennes dimensions sont estimées identiques faute d'historique QCM/saisie ; elles se différencient avec les nouvelles réponses.
- Les intervalles sont des règles pédagogiques transparentes, pas une mesure scientifique individuelle de mémorisation.
- Les exclusions et les distracteurs élargis de sujets isolés (notamment Dioïque et Fabacée) restent à faire valider par l'enseignant. Le rapport nomme chaque cas, sans enrichir arbitrairement la banque.
