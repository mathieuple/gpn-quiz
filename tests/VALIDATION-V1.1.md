# Validation GPN Quiz V1.1 — 9 septembre 2026

## Résultat automatisé

Commande : `node --test tests/*.test.js`

- **35 tests réussis, 0 échec, 0 ignoré**.
- 16 tests métier V1 conservés sans modification.
- 18 tests adaptatifs V1.1.
- 1 test PWA simulant installation, activation, nettoyage du cache, sous-chemin et requêtes hors ligne.
- 3 000 générations QCM V1 + 6 000 générations V1.1 avec graine : 4 réponses, une correcte, aucun doublon, ID inexistant ou paire exclue.
- Vérification syntaxique de tous les fichiers JavaScript : réussite.
- `Math.random()` n'apparaît plus que dans `js/utils/random.js`.

La suite couvre notamment : conservation champ par champ des 150 notions hors distracteurs, audit des 41 références absentes, dimensions de maîtrise et bornes, migration V1, repli et archive d'une sauvegarde corrompue, intervalles à dates fixes, notions dues, limite quotidienne, confusion bidirectionnelle, absence de fausse confusion, pondérations plafonnées, difficulté adaptative, note d'examen 17,25/20 et statistiques séparées.

## Validation navigateur sur origine isolée

Une origine de test sur le port 4174 a évité de modifier la progression de l'aperçu principal. Données fictives importées par l'interface.

- Mobile 360 px : carte « Révisions du jour », 16 notions dues, estimation 6 minutes et démarrage réussi.
- Session quotidienne : les 16 notions ont été présentées une fois ; saisie libre choisie pour reconnaissance 90/rappel 30.
- Saisie + Entrée : « Hypoxie » face à Anoxie affiche les deux définitions existantes ; compteur agrégé passé de 3 à 4.
- « Je ne sais pas » : titre « À retenir », terme, définition et explication ; aucun encadré de confusion.
- Progression à 320 px : couverture 16/150, maîtrise étudiée, reconnaissance, rappel, matières, révisions dues, confusions et points faibles lisibles sans défilement horizontal observé.
- Mini-session Anoxie/Hypoxie : les deux notions alternent ; saisie puis QCM plausible Hypoxie/Anoxie/Anaérobie/Sténoxybionte.
- Fiche Hypoxie : barres reconnaissance/rappel, tentatives et prochaine révision affichées. Filtre « Nouvelles » distinct.
- Mode sombre et animations désactivées : lisibilité vérifiée à 320 px.
- Examen de cinq questions : une réponse `almost` + quatre erreurs donnent 3/20, soit 0,75/5 ramené sur 20 ; détail saisie 0,75/2.
- Desktop 1100 px : contenu centré, navigation Tab puis Entrée jusqu'au bouton Jouer et lancement réussi.
- Sous-chemin `/gpn-quiz/` : modules, routes et PWA fonctionnels.
- Console : aucune erreur bloquante relevée.
- Hors ligne réel : cache V1.1 activé, serveur 4174 arrêté, page rechargée et session quotidienne lancée avec 17 notions dues.

## Relecture pédagogique ciblée

Sept échantillons reproductibles ont été inspectés dans `tests/manual-questions.html` :

- Hypoxie / Anoxie / Anaérobie / Sténoxybionte ;
- Sténotherme / Thermophile / Euryèce / Sténoxybionte ;
- Biotope / Biocénose / Écosystème / Habitat ;
- Anisoptère / Zygoptère / Hémimétabole / Imago ;
- Migration / Dispersion / Dispersion de reproduction / Autochtonie ;
- Génotype / Phénotype / Gène / Allèle ;
- Restauration / Réhabilitation / Réaffectation / Entretien.

La première version de l'échantillon Migration contenait Facteur abiotique. Le moteur a été corrigé pour exploiter les références réciproques ; Autochtonie est désormais utilisée. Ces sept séries sont cohérentes avec les définitions fournies. Leur validation scientifique définitive revient à l'enseignant.

## Limites assumées

- Restauration d'une session après rechargement reportée pour éviter une double application des scores d'examen.
- Installation native non testée sur téléphone physique ; manifest, icônes, cache et fonctionnement hors ligne sont testés.
- Pas d'audit exhaustif avec lecteur d'écran ni de clavier virtuel réel.
- Les exclusions pédagogiques et les sujets dont les opposés sont absents, notamment Dioïque et Fabacée, demandent une validation humaine. En mixte, ces cas basculent en saisie ; en QCM strict, le moteur élargit vers des notions sûres.
- Aucune publication GitHub Pages effectuée.

Le serveur de test 4174 a été arrêté. Le serveur principal 4173 reste disponible pour l'aperçu.
