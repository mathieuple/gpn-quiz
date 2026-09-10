# Ajouter un cours à GPN Quiz

Les cours sont des données statiques. Aucun étudiant ne peut créer, importer ou modifier un contenu depuis l’application.

## Workflow

```text
Cours source (PDF ou autre document)
↓
Codex extrait uniquement le contenu fourni
↓
Course Pack JavaScript
↓
validateCourses()
↓
tests V1.2 et tests existants
↓
publication statique / GitHub Pages
```

1. Copier `data/courses/_template.js` dans le dossier de la matière.
2. Choisir un `id` stable en minuscules et tirets. Les IDs de cours et de questions sont uniques dans toute l’application ; les IDs de sections sont uniques dans le cours.
3. Reprendre exactement le nom de `matiere` présent dans `data/definitions.js`.
4. Transformer le document source en sections courtes. Les seuls blocs admis sont `paragraph`, `bullet-list`, `ordered-list`, `important`, `definition` et `table`.
5. Référencer les définitions par leur ID. Ne jamais recopier leur texte dans le Course Pack. Une notion utilisée dans `section.notions` doit aussi appartenir à `course.notions`.
6. Écrire les questions à partir du document source. Types admis : `qcm`, `short-answer`, `definition-term`. Un QCM contient exactement 4 choix uniques, dont la réponse attendue.
7. Importer le nouveau pack dans `data/courses/index.js` et l’ajouter à `coursePacks`. L’interface, les relations et les pages sont ensuite produites automatiquement.
8. Ajouter le fichier du pack à `FILES` dans `service-worker.js`, puis modifier `VERSION`. Cela publie sa nouvelle copie et conserve la lecture hors ligne.
9. Exécuter `node --test tests/*.test.js`. Toute référence cassée doit être corrigée avant publication.

Un pack invalide est écarté sans bloquer les autres cours. `validateCourses()` écrit des messages explicites dans la console développeur et renvoie aussi la liste `errors`.

## Prompt court pour Codex

```text
Analyse le cours fourni et ajoute-le à GPN Quiz avec le format Course Pack existant. Le document fourni est l’unique source pédagogique de référence : respecte son vocabulaire, son ordre et ses limites, sans combler ses lacunes par des connaissances externes sauf demande explicite. Réutilise une définition existante uniquement si elle correspond exactement ; crée seulement les nouvelles définitions indispensables. Écris des questions courtes, fidèles au document et sans ambiguïté. Signale séparément chaque incohérence ou ambiguïté potentielle. Enregistre le pack dans la matière appropriée, ajoute-le à l’index et au cache PWA, incrémente la version du service worker, exécute validateCourses() puis tous les tests avant livraison.
```

## Structure minimale

```js
{
  id: 'expertise-faunistique-odonates',
  matiere: 'Expertise faunistique',
  titre: 'Odonates',
  ordre: 2,
  version: 1,
  sections: [{
    id: 'generalites',
    titre: 'Généralités',
    contenu: [{type: 'paragraph', text: '...'}],
    notions: ['odonate']
  }],
  notions: ['odonate'],
  questions: [{
    id: 'efa-odonates-q01',
    sectionId: 'generalites',
    type: 'short-answer',
    question: '...',
    answer: '...',
    acceptedAnswers: [],
    difficulty: 1
  }]
}
```

`section.notions` est facultatif. Il prépare une future commande « Réviser cette section » ; le moteur accepte déjà les filtres `courseId` et `sectionId`, sans ajouter ce bouton à la page de lecture.
