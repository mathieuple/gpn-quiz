# Modèle des données utilisateur

## Données persistantes

GPN Quiz enregistre un seul objet `userData` dans `localStorage`. Il contient les XP et records, les réglages, la progression par notion et les confusions réellement rencontrées. Les statistiques d’écran comme la couverture ou la moyenne sont calculées à partir de ces données et ne sont pas dupliquées.

## Schéma actuel

Le schéma courant est `schemaVersion: 3`. `version: 1` reste présent pour reconnaître le format historique des fichiers d’export.

```text
userData
├── version, schemaVersion, updatedAt
├── xp, bestCombo, survivalRecord, statsUpdatedAt
├── settings { theme, animations, sound, updatedAt }
├── notions[notionId] { maîtrise, compteurs, planification, updatedAt }
└── confusions["idA|idB"] { count, lastSeen, updatedAt }
```

Les dates sont des timestamps Unix en millisecondes. Une entrée de notion est créée lors de sa première révision ; un nouveau contenu peut donc être publié sans modifier les sauvegardes existantes.

## Migration et validation

Le chargement et l’import passent par la couche `js/storage`. Les anciennes sauvegardes `version: 1` et `schemaRevision: 1/2` sont migrées automatiquement. Les XP, compteurs, maîtrises, échéances, confusions et réglages sont conservés. Les champs facultatifs manquants reçoivent leurs valeurs par défaut. Les structures incompatibles sont rejetées ; les maîtrises hors limites et dates invalides sont réparées sans réinitialiser le reste.

## Identifiants stables

La progression utilise l’ID de définition. Une question propre à un cours utilise `course-question:<questionId>`. Les `notionId`, `courseId` et `questionId` doivent désormais être considérés comme stables.

Si une notion ou une question disparaît, son ancienne progression reste dans la sauvegarde mais n’intervient plus dans l’application. Un renommage d’ID crée une nouvelle progression et laisse l’ancienne orpheline. Modifier le texte d’une question en conservant son ID conserve sa progression.

## Données locales et future synchronisation

`localStorage` reste la source immédiate, y compris hors ligne. Les `updatedAt` de chaque notion, des réglages, des statistiques globales et des confusions permettront plus tard de comparer indépendamment une copie locale et une copie distante. Aucune résolution de conflit ni connexion réseau n’est implémentée à ce stade.

## Ne pas synchroniser

La question affichée, l’ordre aléatoire, la file de répétition de la session, le feedback, le combo temporaire, les vies en cours, les animations, les modales et les objets de contenu pédagogique ne font pas partie de `userData`.

## Mapping Supabase futur

| Table | Rôle | Clé principale | Champs principaux |
|---|---|---|---|
| `profiles` | rattacher les données au compte | `user_id` | `created_at`, `updated_at` |
| `notion_progress` | progression indépendante par notion ou question | `(user_id, notion_id)` | maîtrises, compteurs, dates de révision, intervalle, `updated_at` |
| `user_stats` | XP et records | `user_id` | `xp`, `best_combo`, `survival_record`, `updated_at` |
| `user_settings` | préférences | `user_id` | `theme`, `animations`, `sound`, `updated_at` |
| `user_confusions` | confusions persistantes | `(user_id, notion_a_id, notion_b_id)` | `count`, `last_seen`, `updated_at` |

Une future couche de synchronisation pourra transformer l’objet local en lignes de ces tables après chaque sauvegarde locale, sans modifier le moteur de quiz.
