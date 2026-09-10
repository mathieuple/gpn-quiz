export const presentationGenerale={
  id:'biologie-vegetale-presentation-generale',
  matiere:'Biologie végétale',
  titre:'Chapitre 1 — Présentation générale',
  ordre:1,
  version:1,
  sections:[
    {id:'importance-des-vegetaux',titre:'Importance des végétaux',contenu:[
      {type:'paragraph',text:'Les végétaux sont omniprésents à la surface de la planète et contribuent à modeler les paysages.'},
      {type:'paragraph',text:'Les régions désertiques, froides ou chaudes, constituent des exceptions, sans pour autant être totalement dépourvues de végétaux.'},
      {type:'paragraph',text:'Les végétaux sont fondamentaux dans la production de l’oxygène atmosphérique grâce à la photosynthèse oxygénique.'},
      {type:'paragraph',text:'Certaines bactéries réalisent également la photosynthèse, notamment les cyanobactéries, qui seraient à l’origine de l’oxygène atmosphérique.'},
      {type:'paragraph',text:'La végétation peut également renseigner sur la nature du sol, notamment son caractère calcaire ou acide.'}
    ],notions:['photosynthese','cyanobacterie']},
    {id:'diversite-vegetation',titre:'Diversité et organisation de la végétation',contenu:[
      {type:'paragraph',text:'Les arbres représentent la biomasse la plus importante du domaine continental.'},
      {type:'paragraph',text:'La biomasse de leurs racines est aussi importante que celle des troncs et des branches.'},
      {type:'paragraph',text:'Plusieurs grands groupes végétaux peuvent être rencontrés dans une forêt tempérée :'},
      {type:'bullet-list',items:['Gymnospermes, notamment les conifères ;','Angiospermes ligneux ;','Angiospermes herbacés ;','Filicophytes, correspondant aux fougères ;','Bryophytes, correspondant notamment aux mousses.']},
      {type:'paragraph',text:'La végétation peut être organisée en différentes strates :'},
      {type:'bullet-list',items:['strate arborescente ;','strate arbustive ;','strate herbacée ;','strate muscinale.']}
    ],notions:['bryophyte','strate-arborescente','strate-arbustive','strate-herbacee','strate-muscinale']},
    {id:'caracteristiques-vegetaux',titre:'Caractéristiques générales des végétaux',contenu:[
      {type:'paragraph',text:'Les végétaux sont des organismes photosynthétiques constitués d’une ou plusieurs cellules eucaryotes possédant une paroi et des plastes.'},
      {type:'paragraph',text:'Ils synthétisent des métabolites secondaires très variés, parfois spécifiques.'},
      {type:'paragraph',text:'Les végétaux présentent une grande diversité de formes :'},
      {type:'bullet-list',items:['algues unicellulaires ou pluricellulaires ;','mousses ;','fougères ;','conifères ;','plantes à fleurs.']},
      {type:'important',text:'Les champignons ne sont pas des végétaux.'}
    ],notions:['eucaryote','photosynthese','plaste','metabolite']},
    {id:'classification-phylogenetique',titre:'Classification phylogénétique',contenu:[
      {type:'paragraph',text:'Le groupe des « végétaux » tel qu’il est utilisé dans le langage courant n’est pas valide au sens de la classification phylogénétique.'},
      {type:'paragraph',text:'Les organismes traditionnellement appelés végétaux sont répartis en plusieurs endroits de l’arbre phylogénétique des Eucaryotes. Ce groupe est donc polyphylétique.'},
      {type:'paragraph',text:'Les scientifiques distinguent des groupes plus petits et monophylétiques.'},
      {type:'paragraph',text:'Le cours présente notamment la Lignée verte ou Archaeplastida.'},
      {type:'definition',notionId:'lignee-verte'},
      {type:'paragraph',text:'La Lignée verte est caractérisée par au moins une endosymbiose chez un ancêtre commun et par la présence de plastes.'}
    ],notions:['eucaryote','monophyletique','polyphyletique','lignee-verte','endosymbiose','symbiose','plaste']},
    {id:'thallophytes',titre:'Thallophytes et thalle',contenu:[
      {type:'definition',notionId:'thallophyte'},
      {type:'paragraph',text:'Les thallophytes possèdent un corps indifférencié appelé thalle.'},
      {type:'paragraph',text:'Le terme « thallophytes » a été créé au début du XIXe siècle et regroupait historiquement différents organismes thalloïdes. Ce groupe n’est plus considéré comme valide en classification phylogénétique.'},
      {type:'paragraph',text:'Les thalles peuvent présenter différentes formes :'},
      {type:'bullet-list',items:['filamenteuse ;','lamelleuse ;','mucilagineuse ;','foliacée ;','fruticuleuse.']},
      {type:'paragraph',text:'Leur texture peut être molle ou plus ou moins coriace. L’organisation reste simple, avec des cellules peu différenciées.'}
    ],notions:['thallophyte','thalle']},
    {id:'fucus',titre:'Exemple du Fucus',contenu:[
      {type:'paragraph',text:'Le Fucus vesiculosus est une algue brune.'},
      {type:'paragraph',text:'Les sexes sont séparés et correspondent à deux thalles différents.'},
      {type:'paragraph',text:'Son thalle est :'},
      {type:'bullet-list',items:['plat ;','coriace ;','doté de ramifications dichotomes.']},
      {type:'paragraph',text:'Son appareil reproducteur est simple. Il est localisé dans des conceptacles situés au niveau des vésicules, correspondant aux extrémités renflées.'}
    ],notions:['thalle']},
    {id:'cormophytes',titre:'Cormophytes et conquête du milieu terrestre',contenu:[
      {type:'paragraph',text:'La conquête du milieu terrestre s’accompagne de l’apparition de nouveaux caractères au cours de l’évolution.'},
      {type:'definition',notionId:'cormophyte'},
      {type:'paragraph',text:'Un Cormophyte est une plante dont l’appareil végétatif est un cormus.'},
      {type:'paragraph',text:'Le cormus est composé de trois organes aux tissus souvent différenciés :'},
      {type:'bullet-list',items:['racine ;','tige ;','feuilles.']},
      {type:'table',caption:'Cormus des Bryophytes et des Trachéophytes',headers:['Groupe','Caractéristiques'],rows:[['Bryophytes','Cormus non vascularisé et dépourvu de racines.'],['Trachéophytes','Cormus vascularisé et portant des racines.']]},
      {type:'paragraph',text:'La reproduction des Cormophytes permet également de les désigner comme Archégoniates ou Embryophytes dans le cadre du cours.'}
    ],notions:['cormophyte','cormus','bryophyte','tracheophyte','embryophyte']},
    {id:'embryophytes',titre:'Embryophytes et cycle de développement',contenu:[
      {type:'paragraph',text:'Le groupe des Embryophytes, également présenté dans le cours comme Archégoniates, plantes terrestres ou Cormophytes, est caractérisé notamment par :'},
      {type:'bullet-list',items:['des gamétanges ;','un sporange ;','une phase diploïde multicellulaire appelée sporophyte ;','un embryon ;','une cuticule recouvrant l’épiderme.']},
      {type:'definition',notionId:'gametange'},
      {type:'paragraph',text:'Le gamétange femelle est appelé archégone. Le gamétange mâle est appelé anthéridie.'},
      {type:'definition',notionId:'sporange'},
      {type:'definition',notionId:'spore'},
      {type:'paragraph',text:'Le gamétophyte produit des gamètes haploïdes. La fécondation des gamètes est à l’origine du sporophyte diploïde. Le sporophyte produit ensuite des spores par méiose.'},
      {type:'important',text:'Il existe toujours une succession : gamétophyte → sporophyte chez les végétaux selon le cours.'}
    ],notions:['embryophyte','gametange','archegone','antheridie','sporange','spore','gametophyte','sporophyte']}
  ],
  notions:['eucaryote','photosynthese','chloroplaste','plaste','cyanobacterie','metabolite','strate-arborescente','strate-arbustive','strate-herbacee','strate-muscinale','monophyletique','polyphyletique','endosymbiose','thalle','cormus','cormophyte','tracheophyte','bryophyte','symbiose','thallophyte','lignee-verte','gametange','archegone','antheridie','sporange','sporophyte','gametophyte','spore','embryophyte'],
  questions:[
    {id:'bv-presentation-q01',sectionId:'importance-des-vegetaux',type:'qcm',question:'Quel phénomène contribue à la production de l’oxygène atmosphérique par les végétaux ?',answer:'La photosynthèse oxygénique',choices:['La photosynthèse oxygénique','L’endosymbiose','La méiose','La fécondation'],difficulty:1},
    {id:'bv-presentation-q02',sectionId:'importance-des-vegetaux',type:'qcm',question:'Quel groupe bactérien cité dans le cours réalise également la photosynthèse ?',answer:'Les cyanobactéries',choices:['Les cyanobactéries','Les Bryophytes','Les Filicophytes','Les Gymnospermes'],difficulty:1},
    {id:'bv-presentation-q03',sectionId:'diversite-vegetation',type:'qcm',question:'Quelle partie des arbres possède, selon le cours, une biomasse aussi importante que celle des troncs et des branches ?',answer:'Les racines',choices:['Les racines','Les feuilles','Les fleurs','Les fruits'],difficulty:1},
    {id:'bv-presentation-q04',sectionId:'diversite-vegetation',type:'short-answer',question:'Comment appelle-t-on la strate végétale principalement constituée d’arbres ?',answer:'Strate arborescente',acceptedAnswers:['arborescente'],difficulty:1},
    {id:'bv-presentation-q05',sectionId:'diversite-vegetation',type:'short-answer',question:'Comment appelle-t-on la strate située au niveau des plantes herbacées ?',answer:'Strate herbacée',acceptedAnswers:['herbacée'],difficulty:1},
    {id:'bv-presentation-q06',sectionId:'caracteristiques-vegetaux',type:'qcm',question:'Quelle proposition correspond aux caractéristiques générales des végétaux données dans le cours ?',answer:'Organismes photosynthétiques eucaryotes possédant une paroi et des plastes',choices:['Organismes photosynthétiques eucaryotes possédant une paroi et des plastes','Organismes procaryotes dépourvus de plastes','Organismes eucaryotes dépourvus de paroi et de plastes','Organismes uniquement pluricellulaires dépourvus de plastes'],difficulty:1},
    {id:'bv-presentation-q07',sectionId:'caracteristiques-vegetaux',type:'qcm',question:'Quel groupe n’est pas considéré comme un groupe de végétaux dans le cours ?',answer:'Les champignons',choices:['Les champignons','Les mousses','Les fougères','Les conifères'],difficulty:1},
    {id:'bv-presentation-q08',sectionId:'classification-phylogenetique',type:'qcm',question:'Pourquoi le groupe des « végétaux » au sens courant n’est-il pas valide en classification phylogénétique ?',answer:'Parce qu’il est polyphylétique',choices:['Parce qu’il est polyphylétique','Parce qu’il est monophylétique','Parce qu’il ne contient aucun Eucaryote','Parce qu’il ne possède aucun plaste'],difficulty:2},
    {id:'bv-presentation-q09',sectionId:'classification-phylogenetique',type:'qcm',question:'Quel type de groupe les scientifiques cherchent-ils à reconnaître en classification phylogénétique ?',answer:'Des groupes monophylétiques',choices:['Des groupes monophylétiques','Des groupes polyphylétiques','Des groupes uniquement thalloïdes','Des groupes uniquement terrestres'],difficulty:2},
    {id:'bv-presentation-q10',sectionId:'classification-phylogenetique',type:'short-answer',question:'Quel groupe présenté dans le cours est caractérisé par une endosymbiose chez l’ancêtre commun et par la présence de plastes ?',answer:'Lignée verte',acceptedAnswers:['Archaeplastida','la lignée verte'],difficulty:2},
    {id:'bv-presentation-q11',sectionId:'thallophytes',type:'qcm',question:'Quelle organisation caractérise un thallophyte ?',answer:'Un corps indifférencié sans feuille, tige ni racine',choices:['Un corps indifférencié sans feuille, tige ni racine','Un cormus composé de racine, tige et feuilles','Un appareil uniquement constitué de racines','Un appareil vascularisé portant obligatoirement des racines'],difficulty:2},
    {id:'bv-presentation-q12',sectionId:'thallophytes',type:'short-answer',question:'Comment appelle-t-on le corps indifférencié d’un thallophyte ?',answer:'Thalle',difficulty:1},
    {id:'bv-presentation-q13',sectionId:'thallophytes',type:'qcm',question:'Le groupe des thallophytes est-il encore considéré comme valide en classification phylogénétique ?',answer:'Non',choices:['Non','Oui, sans exception','Oui, uniquement chez les champignons','Oui, uniquement chez les Trachéophytes'],difficulty:2},
    {id:'bv-presentation-q14',sectionId:'fucus',type:'qcm',question:'À quel type d’organisme appartient Fucus vesiculosus dans le cours ?',answer:'Une algue brune',choices:['Une algue brune','Une mousse','Une fougère','Un conifère'],difficulty:1},
    {id:'bv-presentation-q15',sectionId:'fucus',type:'qcm',question:'Comment sont organisés les sexes chez Fucus vesiculosus ?',answer:'Ils sont séparés sur deux thalles différents',choices:['Ils sont séparés sur deux thalles différents','Ils sont réunis dans un même thalle','L’espèce ne possède pas d’appareil reproducteur','La reproduction se déroule uniquement dans les racines'],difficulty:2},
    {id:'bv-presentation-q16',sectionId:'fucus',type:'qcm',question:'Quelle description correspond au thalle de Fucus vesiculosus ?',answer:'Plat, coriace et à ramifications dichotomes',choices:['Plat, coriace et à ramifications dichotomes','Vascularisé avec racines et feuilles','Filamenteux et muni d’un cormus','Composé d’une tige, de feuilles et de racines'],difficulty:2},
    {id:'bv-presentation-q17',sectionId:'fucus',type:'qcm',question:'Où est localisé l’appareil reproducteur du Fucus décrit dans le cours ?',answer:'Dans des conceptacles au niveau des vésicules',choices:['Dans des conceptacles au niveau des vésicules','Dans les racines','Dans les feuilles','Dans les sporanges portés par un cormus'],difficulty:2},
    {id:'bv-presentation-q18',sectionId:'cormophytes',type:'short-answer',question:'Comment appelle-t-on l’appareil végétatif d’un Cormophyte ?',answer:'Cormus',difficulty:1},
    {id:'bv-presentation-q19',sectionId:'cormophytes',type:'qcm',question:'Quels sont les trois organes constituant le cormus type ?',answer:'Racine, tige et feuilles',choices:['Racine, tige et feuilles','Thalle, spore et gamète','Racine, sporange et archégone','Tige, thalle et gamétange'],difficulty:1},
    {id:'bv-presentation-q20',sectionId:'cormophytes',type:'qcm',question:'Quelle caractéristique distingue les Trachéophytes des Bryophytes selon le cours ?',answer:'Leur cormus est vascularisé et porte des racines',choices:['Leur cormus est vascularisé et porte des racines','Leur cormus est non vascularisé et dépourvu de racines','Ils possèdent uniquement un thalle','Ils sont dépourvus de tissus différenciés'],difficulty:2},
    {id:'bv-presentation-q21',sectionId:'cormophytes',type:'qcm',question:'Comment le cours décrit-il le cormus des Bryophytes ?',answer:'Non vascularisé et dépourvu de racines',choices:['Non vascularisé et dépourvu de racines','Vascularisé et portant des racines','Constitué uniquement d’un thalle','Dépourvu de tout tissu différencié'],difficulty:2},
    {id:'bv-presentation-q22',sectionId:'embryophytes',type:'qcm',question:'Quelle structure produit les gamètes ?',answer:'Le gamétange',choices:['Le gamétange','Le sporange','Le sporophyte','La spore'],difficulty:2},
    {id:'bv-presentation-q23',sectionId:'embryophytes',type:'qcm',question:'Comment appelle-t-on le gamétange femelle ?',answer:'Archégone',choices:['Archégone','Anthéridie','Sporange','Sporophyte'],difficulty:2},
    {id:'bv-presentation-q24',sectionId:'embryophytes',type:'qcm',question:'Comment appelle-t-on le gamétange mâle ?',answer:'Anthéridie',choices:['Anthéridie','Archégone','Sporange','Sporophyte'],difficulty:2},
    {id:'bv-presentation-q25',sectionId:'embryophytes',type:'short-answer',question:'Quelle structure produit les spores ?',answer:'Sporange',acceptedAnswers:['le sporange'],difficulty:2},
    {id:'bv-presentation-q26',sectionId:'embryophytes',type:'qcm',question:'Quelle phase du cycle végétal est diploïde et multicellulaire ?',answer:'Le sporophyte',choices:['Le sporophyte','Le gamétophyte','La spore','Le gamétange'],difficulty:2},
    {id:'bv-presentation-q27',sectionId:'embryophytes',type:'qcm',question:'Quelle phase produit les gamètes haploïdes ?',answer:'Le gamétophyte',choices:['Le gamétophyte','Le sporophyte','Le sporange','La spore'],difficulty:2},
    {id:'bv-presentation-q28',sectionId:'embryophytes',type:'qcm',question:'Que produit le sporophyte par méiose ?',answer:'Des spores',choices:['Des spores','Des gamètes','Des archégones','Des anthéridies'],difficulty:2},
    {id:'bv-presentation-q29',sectionId:'embryophytes',type:'qcm',question:'Que produit le gamétophyte ?',answer:'Des gamètes',choices:['Des gamètes','Des spores par méiose','Des plastes','Des sporanges uniquement'],difficulty:2},
    {id:'bv-presentation-q30',sectionId:'embryophytes',type:'qcm',question:'Quelle succession est toujours présente chez les végétaux selon le cours ?',answer:'Gamétophyte → sporophyte',choices:['Gamétophyte → sporophyte','Sporophyte → thalle','Sporange → cormus','Archégone → anthéridie'],difficulty:3}
  ]
};
