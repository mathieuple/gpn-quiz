# Audit avant modification — V1.1

Lecture de tous les modules, écrans, styles, tests, manifest, service worker, serveur, documentation et des 150 objets de la banque. Pas de dépôt Git ni de fichier AGENTS.md dans le dossier. Les sources pédagogiques initiales sont conservées à la racine.

État de référence : **17 tests réussis, 0 échec**, exécutés avant modification, dont 3 000 QCM.

- `mastery` unique : +8 QCM, +12 saisie, +6 presque, −8 erreur, −5 inconnu. XP séparés, presque conserve le combo.
- Mixte aléatoire 50/50, maximum deux formats identiques successifs. Examen équilibré et sans répétition tant que le pool n'est pas épuisé ; scores appliqués à la fin.
- Sélection pondérée : nouveautés, faiblesse, erreurs, ancienneté ; historique de cinq notions et file d'erreurs à +3…6 positions. Aucun calendrier entre journées.
- Stockage local v1, assainissement et import/export. Pas de session persistée.
- Statistique principale : moyenne incluant les notions jamais étudiées.
- Distracteurs par priorités catégorielles, sans exclusion d'équivalences. 41 références absentes. Deux occurrences de « Diagnostic » correspondent à une variante officielle de Diagnostic écologique.
- « Je ne sais pas » affiche à tort une comparaison choisie dans les distracteurs ; aucune confusion réelle n'est enregistrée.
- Examen : presque vaut actuellement un point entier.
- PWA versionnée, assets locaux en cache, rafraîchissement de la banque et chemins relatifs. Cette stratégie sera conservée.

Évolutions ciblées : modules pédagogiques ajoutés aux dossiers existants, maintien des routes/composants, aucune nouvelle définition. Sauvegarde V1 conservée et nouvelle clé V1.1. Enveloppe `version: 1` compatible avec le validateur existant, `schemaRevision: 2` pour distinguer le nouveau modèle.
