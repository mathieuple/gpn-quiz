# Schéma Content Pack — version 1

Chaque fichier de `content/courses/` contient un objet JSON autonome. Le modèle copiable est `content/templates/course-pack.template.json`.

| Champ | Type | Requis | Description |
|---|---|---:|---|
| `schemaVersion` | entier | oui | Version du format. La seule valeur acceptée est `1`. |
| `course` | objet | oui | Métadonnées et sections du cours. |
| `definitionRefs` | tableau de chaînes | oui | IDs des notions globales déjà existantes. |
| `definitionsToCreate` | tableau d’objets | oui | Nouvelles notions absentes de la banque globale. Peut être vide. |
| `questions` | tableau d’objets | oui | Questions propres au cours. Peut être vide. |
| `confusionGroups` | tableau de tableaux | oui | Groupes d’au moins deux IDs existants. Peut être vide. |

## `course`

| Champ | Type | Requis | Description |
|---|---|---:|---|
| `id` | chaîne | oui | ID global, unique et stable. |
| `subjectId` | chaîne | oui | ID exact déclaré dans `content/subjects.json`. |
| `title` | chaîne | oui | Titre affiché. |
| `order` | entier ≥ 0 | oui | Ordre d’affichage dans la matière. |
| `version` | entier ≥ 1 | oui | Version éditoriale du cours. |
| `sections` | tableau | oui | Au moins une section. |
| `examCount` | entier ≥ 1 | non | Nombre de questions utilisé par l’examen ciblé. |
| `sources` | tableau ou objet | non | Métadonnées de provenance, sans interface dédiée. |

Une section contient `id`, `titre`, `contenu` et éventuellement `notions`. Les types de blocs admis sont :

- `{ "type": "paragraph", "text": "..." }`
- `{ "type": "bullet-list", "items": ["..."] }`
- `{ "type": "ordered-list", "items": ["..."] }`
- `{ "type": "important", "text": "..." }`
- `{ "type": "definition", "notionId": "..." }`
- `{ "type": "table", "caption": "...", "headers": ["..."], "rows": [["..."]] }`

## `definitionsToCreate`

Chaque objet contient `id`, `terme`, `definitionCourte`, `explication`, `theme`, `variantesAcceptees`, `difficulte` et `distracteursProches`. `difficulte` vaut `1`, `2` ou `3`. Le chargeur attribue automatiquement le nom de matière correspondant à `course.subjectId`, ce qui empêche les variantes orthographiques de créer une matière parallèle. L’ancien champ `matiere` reste accepté uniquement s’il correspond exactement au registre.

Les nouvelles notions sont ajoutées seulement en mémoire. Elles ne modifient pas `data/definitions.js`. En cas d’ID déjà existant, la définition globale gagne et un avertissement est produit.

## `questions`

Champs communs requis : `id`, `sectionId`, `type`, `question`, `answer`, `difficulty`. Les types sont `qcm`, `short-answer` et `definition-term`. `acceptedAnswers` est facultatif. Un QCM ajoute `choices`, avec exactement quatre chaînes uniques.

Le chargeur ajoute automatiquement le `courseId`, le titre et la matière lorsque le moteur prépare une session ; il n’est pas nécessaire de les dupliquer dans le JSON.

## Registre des matières

`content/subjects.json` est la source de vérité des matières. Chaque entrée contient un `id` stable en minuscules et tirets, un `name` affiché et un `order` entier positif ou nul. Les IDs et les noms sont uniques. Les matières sont triées par `order`, puis les cours d’une matière par `course.order`.

Un nouveau chapitre réutilise un `subjectId` existant. Une nouvelle matière est déclarée une seule fois dans ce registre avant l’ajout de son premier Content Pack. Un `subjectId` inconnu est refusé et n’est jamais corrigé silencieusement.

## Manifest

`content/manifest.json` contient uniquement la version et les chemins :

```json
{
  "schemaVersion": 1,
  "courses": ["courses/exemple.json"]
}
```

Les chemins sont relatifs au manifest, restent dans `courses/`, utilisent des minuscules, chiffres, tirets et barres obliques, et se terminent par `.json`.
