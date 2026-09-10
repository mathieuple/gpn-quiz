// Copiez ce fichier dans le dossier de la matière, puis ajoutez son export à index.js.
// Les IDs utilisent des minuscules et des tirets. Les notions référencent definitions.js.
export const coursePackTemplate={
  id:'matiere-titre-du-cours',       // obligatoire, unique et stable
  matiere:'Matière existante',       // valeur exacte de definitions.js
  titre:'Titre du cours',             // obligatoire
  ordre:1,                            // entier positif ou nul, pour le tri
  version:1,                          // entier >= 1
  sections:[{
    id:'introduction',                // unique dans ce cours
    titre:'Introduction',
    contenu:[
      {type:'paragraph',text:'Texte fidèle au document source.'},
      {type:'bullet-list',items:['Élément 1','Élément 2']},
      {type:'ordered-list',items:['Étape 1','Étape 2']},
      {type:'important',text:'Point important du cours source.'},
      {type:'definition',notionId:'id-definition-existante'},
      {type:'table',caption:'Titre accessible',headers:['Colonne 1','Colonne 2'],rows:[['Valeur 1','Valeur 2']]}
    ],
    notions:['id-definition-existante'] // facultatif, prépare la révision par section
  }],
  notions:['id-definition-existante'],
  questions:[{
    id:'matiere-cours-q01',
    sectionId:'introduction',
    type:'short-answer',              // qcm | short-answer | definition-term
    question:'Question fidèle au cours source ?',
    answer:'Réponse attendue',
    acceptedAnswers:['Variante explicitement admise'],
    difficulty:1,
    explanation:'Explication facultative issue du cours source.'
    // Pour type: 'qcm', ajouter choices: ['Réponse attendue','Choix B','Choix C','Choix D']
  }]
};
