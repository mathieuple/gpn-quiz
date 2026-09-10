# Audit des distracteurs V1.1

Commande reproductible : `node scripts/audit-distractors.js`.

- Références invalides détectées : 41
- Remplacées par un terme canonique : 2
- Supprimées au total : 65 (absentes ou ambiguës)
- Références ambiguës : 27
- Doublons déclarés : 0
- Paires à valider humainement : 17

Les synonymes sont détectés par variantes partagées, définitions identiques et exclusions documentées. Cette détection ne prétend pas automatiser une expertise scientifique. Aucune définition, explication, variante ou matière n'est modifiée. Diagnostic devient Diagnostic écologique (variante déjà officielle) ; les autres absences sont supprimées, sans remplacement scientifique inventé.

## Modifications de références

| Notion | Ancienne référence | Action | Motif |
|---|---|---|---|
| biocenose | Communauté | Supprimée | La banque indique explicitement la proximité des deux termes. |
| communaute | Biocénose | Supprimée | La banque indique explicitement la proximité des deux termes. |
| substrat | Sol | Supprimée | missing |
| flore | Végétation | Supprimée | missing |
| espece-exotique-envahissante | Espèce autochtone | Supprimée | missing |
| espece-exotique-envahissante | Espèce exotique | Supprimée | missing |
| bioindicateur | Indicateur écologique | Supprimée | missing |
| heliophile | Sciaphile | Supprimée | missing |
| ripisylve | Haie | Supprimée | missing |
| ripisylve | Forêt alluviale | Supprimée | missing |
| turbidite | Sédimentation | Supprimée | missing |
| etiage | Crue | Supprimée | missing |
| ecotone | Corridor écologique | Supprimée | missing |
| predation | Herbivorie | Supprimée | Le cours présente herbivorie comme prédation au sens large. |
| herbivorie | Prédation | Supprimée | Le cours présente herbivorie comme prédation au sens large. |
| mutualisme | Symbiose | Supprimée | La banque indique plusieurs acceptions de symbiose. |
| dispersion-de-reproduction | Dispersion natale | Supprimée | missing |
| producteur-primaire | Autotrophe | Supprimée | Définitions presque équivalentes dans cette banque. |
| autotrophe | Producteur primaire | Supprimée | Définitions presque équivalentes dans cette banque. |
| heterotrophe | Consommateur | Supprimée | Définitions largement recouvrantes dans le cours. |
| procaryote | Bactérie | Supprimée | Le cours définit une bactérie comme un procaryote. |
| bacterie | Cyanobactérie | Supprimée | Le cours définit la cyanobactérie comme une bactérie. |
| paroi-cellulaire | Membrane plasmique | Supprimée | missing |
| plaste | Chloroplaste | Supprimée | Le cours définit le chloroplaste comme un type de plaste. |
| plaste | Mitochondrie | Supprimée | missing |
| chloroplaste | Plaste | Supprimée | Le cours définit le chloroplaste comme un type de plaste. |
| cyanobacterie | Bactérie | Supprimée | Le cours définit la cyanobactérie comme une bactérie. |
| endosymbiose | Symbiose | Supprimée | Relation explicitement générale/spécifique. |
| symbiose | Mutualisme | Supprimée | La banque indique plusieurs acceptions de symbiose. |
| symbiose | Parasitisme | Supprimée | Acception large de symbiose explicitement signalée dans le cours. |
| symbiose | Endosymbiose | Supprimée | Relation explicitement générale/spécifique. |
| metabolite | Métabolisme | Supprimée | missing |
| metabolite | Enzyme | Supprimée | missing |
| cormophyte | Trachéophyte | Supprimée | Le sens de cormophyte varie selon les cours. |
| tracheophyte | Cormophyte | Supprimée | Le sens de cormophyte varie selon les cours. |
| bryophyte | Cormophyte | Supprimée | Le sens de cormophyte varie selon les cours. |
| monophyletique | Paraphylétique | Supprimée | missing |
| polyphyletique | Paraphylétique | Supprimée | missing |
| phylogenie | Classification | Supprimée | missing |
| foliole | Feuille simple | Supprimée | missing |
| rameau | Tige | Supprimée | missing |
| dioique | Monoïque | Supprimée | missing |
| dioique | Hermaphrodite | Supprimée | missing |
| fabacee | Poacée | Supprimée | missing |
| fabacee | Rosacée | Supprimée | missing |
| phytologie | Botanique | Supprimée | La définition de Phytologie indique le synonyme Botanique. |
| braun-blanquet | Abondance-dominance | Supprimée | Le nom désigne aussi une échelle dans la banque. |
| abondance-dominance | Braun-Blanquet | Supprimée | Le nom désigne aussi une échelle dans la banque. |
| abondance-dominance | Recouvrement | Supprimée | missing |
| transect | Quadrat | Supprimée | missing |
| observation-indirecte | Indice de présence | Supprimée | missing |
| odonate | Anisoptère | Supprimée | Relation de catégorie générale à sous-groupe. |
| odonate | Zygoptère | Supprimée | Relation de catégorie générale à sous-groupe. |
| anisoptere | Odonate | Supprimée | Relation de catégorie générale à sous-groupe. |
| zygoptere | Odonate | Supprimée | Relation de catégorie générale à sous-groupe. |
| hemimetabole | Holométabole | Supprimée | missing |
| imago | Larve | Supprimée | missing |
| autochtonie | Autochtone | Supprimée | missing |
| phenologie | Cycle biologique | Supprimée | missing |
| pronotum | Prothorax | Supprimée | missing |
| ommatidie | Ocelle | Supprimée | missing |
| hamuli | Cercoïdes | Supprimée | missing |
| lame-vulvaire | Ovipositeur | Supprimée | missing |
| anaerobie | Aérobie | Supprimée | missing |
| genie-ecologique | Gestion écologique | Supprimée | missing |
| approche-systemique | Diagnostic | Remplacée par Diagnostic écologique | alias |
| etat-des-lieux | Diagnostic | Remplacée par Diagnostic écologique | alias |

## Exclusions à valider avec l'enseignant

Ces paires sont exclues dans les deux sens, y compris entre distracteurs. C'est une précaution QCM, pas une déclaration de synonymie ni une nouvelle variante de réponse.

- biocenose ↔ communaute : La banque indique explicitement la proximité des deux termes.
- predation ↔ herbivorie : Le cours présente herbivorie comme prédation au sens large.
- parasitisme ↔ symbiose : Acception large de symbiose explicitement signalée dans le cours.
- mutualisme ↔ symbiose : La banque indique plusieurs acceptions de symbiose.
- producteur-primaire ↔ autotrophe : Définitions presque équivalentes dans cette banque.
- consommateur ↔ heterotrophe : Définitions largement recouvrantes dans le cours.
- procaryote ↔ bacterie : Le cours définit une bactérie comme un procaryote.
- bacterie ↔ cyanobacterie : Le cours définit la cyanobactérie comme une bactérie.
- plaste ↔ chloroplaste : Le cours définit le chloroplaste comme un type de plaste.
- endosymbiose ↔ symbiose : Relation explicitement générale/spécifique.
- cormophyte ↔ tracheophyte : Le sens de cormophyte varie selon les cours.
- cormophyte ↔ bryophyte : Le sens de cormophyte varie selon les cours.
- braun-blanquet ↔ abondance-dominance : Le nom désigne aussi une échelle dans la banque.
- suivi ↔ suivi-ecologique : Terme ou variante officielle partagé
- odonate ↔ anisoptere : Relation de catégorie générale à sous-groupe.
- odonate ↔ zygoptere : Relation de catégorie générale à sous-groupe.
- Phytologie ↔ Botanique : synonyme explicite, mais Botanique absent. Référence supprimée ; aucune nouvelle notion.

## Résultat après nettoyage

0 référence non valide restante. 150 notions conservées. Le fichier JSON compagnon contient chaque référence, y compris les valides. Les candidats de repli restent classés par groupe, thème et matière ; un score faible ne garantit pas une proximité pédagogique fine, notamment pour Dioïque et Fabacée, dont les alternatives de cours sont absentes.
