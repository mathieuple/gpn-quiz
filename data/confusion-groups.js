export const confusionGroups = [
  ['hypoxie', 'anoxie', 'anaerobie', 'stenoxybionte'],
  ['biotope', 'biocenose', 'ecosysteme', 'habitat'],
  ['stenoece', 'euryece', 'stenotherme', 'stenoxybionte'],
  ['heliophile', 'thermophile', 'stenotherme'],
  ['migration', 'dispersion', 'dispersion-de-reproduction'],
  ['genotype', 'phenotype', 'gene', 'allele'],
  ['anisoptere', 'zygoptere', 'hemimetabole', 'imago'],
  ['restauration-ecologique', 'rehabilitation-ecologique', 'reaffectation-ecologique', 'entretien-ecologique'],
  ['resilience-ecologique', 'resistance-ecologique', 'succession-ecologique'],
  ['limbe', 'petiole', 'stipule', 'foliole', 'pedoncule'],
  ['inventaire', 'suivi', 'echantillonnage', 'transect'],
  ['etat-des-lieux', 'diagnostic-ecologique', 'objectif-ecologique', 'suivi-ecologique'],
];

// Exclusions conservatrices fondées uniquement sur les définitions du cours.
// Elles ne rendent pas ces termes interchangeables en saisie libre.
export const ambiguousPairs = [
  ['biocenose', 'communaute', 'La banque indique explicitement la proximité des deux termes.'],
  ['suivi', 'suivi-ecologique', 'Les variantes officielles se recouvrent.'],
  ['producteur-primaire', 'autotrophe', 'Définitions presque équivalentes dans cette banque.'],
  ['consommateur', 'heterotrophe', 'Définitions largement recouvrantes dans le cours.'],
  ['mutualisme', 'symbiose', 'La banque indique plusieurs acceptions de symbiose.'],
  ['symbiose', 'parasitisme', 'Acception large de symbiose explicitement signalée dans le cours.'],
  ['cormophyte', 'tracheophyte', 'Le sens de cormophyte varie selon les cours.'],
  ['cormophyte', 'bryophyte', 'Le sens de cormophyte varie selon les cours.'],
  ['braun-blanquet', 'abondance-dominance', 'Le nom désigne aussi une échelle dans la banque.'],
  ['predation', 'herbivorie', 'Le cours présente herbivorie comme prédation au sens large.'],
  ['odonate', 'anisoptere', 'Relation de catégorie générale à sous-groupe.'],
  ['odonate', 'zygoptere', 'Relation de catégorie générale à sous-groupe.'],
  ['plaste', 'chloroplaste', 'Le cours définit le chloroplaste comme un type de plaste.'],
  ['bacterie', 'cyanobacterie', 'Le cours définit la cyanobactérie comme une bactérie.'],
  ['procaryote', 'bacterie', 'Le cours définit une bactérie comme un procaryote.'],
  ['symbiose', 'endosymbiose', 'Relation explicitement générale/spécifique.'],
];
export const inConfusionGroup = (a,b) => confusionGroups.some(group => group.includes(a) && group.includes(b));
