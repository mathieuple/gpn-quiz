# Ajouter un cours à GPN Quiz

Un cours est désormais un fichier JSON statique. Aucun étudiant ne peut importer ou modifier du contenu depuis l’application.

## Procédure

1. Copier `content/templates/course-pack.template.json` vers `content/courses/nom-du-cours.json`.
2. Choisir un `course.id` stable, unique, en minuscules et tirets.
3. Réutiliser le `subjectId` de la matière déclaré dans `content/subjects.json`.
4. Définir `course.title`, `course.order`, puis reproduire le cours source dans `course.sections`. Chaque section possède un `id` stable et unique dans le cours.
5. Placer dans `definitionRefs` les IDs des notions déjà présentes. Ne pas recopier leur définition.
6. Placer dans `definitionsToCreate` uniquement les notions réellement absentes, avec le schéma complet de la banque actuelle.
7. Ajouter les questions préparées dans `questions`. Types admis : `qcm`, `short-answer`, `definition-term`.
8. Ajouter dans `confusionGroups` uniquement des groupes dont tous les IDs existent dans la banque agrégée.
9. Ajouter le chemin relatif du JSON à `content/manifest.json`.
10. Exécuter `npm run validate:content`.
11. Exécuter `npm test`.
12. Exécuter `git add .`, créer le commit, puis pousser sur GitHub.

Le nouveau cours apparaît automatiquement dans Cours, dans les relations cours ↔ notions et dans les sessions « Réviser ce cours ». Aucun fichier JavaScript ne doit être modifié. Le manifest est récupéré en priorité sur le réseau ; chaque pack consulté est ensuite conservé par la PWA pour le mode hors ligne.

## Cas A — Nouveau chapitre d’une matière existante

1. Reprendre l’`id` de la matière dans `content/subjects.json` comme `course.subjectId`.
2. Choisir un nouveau `course.id`, un `course.title` et un `course.order` dans cette matière.
3. Ajouter le nouveau JSON à `content/manifest.json`, puis valider.

## Cas B — Nouvelle matière

1. Ajouter une seule entrée `{ "id", "name", "order" }` à `content/subjects.json`.
2. Utiliser cet `id` comme `course.subjectId` dans le premier Content Pack.
3. Ajouter le nouveau JSON à `content/manifest.json`.
4. Lancer la validation et les tests.

## Règles d’IDs

- `course.id` : unique dans toute l’application et immuable après publication.
- `course.subjectId` : ID exact et stable déclaré dans `content/subjects.json`.
- `section.id` : unique dans son cours.
- `question.id` : unique dans toute l’application et immuable pour préserver la progression.
- `definition.id` : réutiliser l’ID global existant dès que la notion existe déjà.

Une définition déclarée dans `definitionsToCreate` avec un ID déjà présent n’écrase jamais la banque globale. Le validateur conserve l’existante et affiche un avertissement. Un pack invalide est ignoré ; les autres cours continuent de fonctionner.

## Contenus autorisés

Les blocs de section admis sont `paragraph`, `bullet-list`, `ordered-list`, `important`, `definition` et `table`. Un bloc `definition` référence uniquement un `notionId`.

Un QCM possède exactement quatre choix uniques, dont un seul correspond à `answer`. Une question pointe vers une section réelle par `sectionId`.

## Workflow de préparation

```text
PDF ou PowerPoint
↓
préparation externe fidèle à la source
↓
Content Pack JSON
↓
npm run validate:content
↓
npm test
↓
commit et push
```

Consulter `docs/CONTENT_PACK_SCHEMA.md` pour la description complète du format.
