const notions=[
  'friend-shoring','localisme','glocalisation','gouvernance-mondiale','bilateralisme','autarcie','nationalisme','decouplage-fragmentation','slowbalisation','equitable','circulaire','libre-echange','omc','taxes','tech-nationalisme','barrieres-tarifaires','altermondialisation','multilateralisme','globalisation-deglobalisation','mercantilisme','securite-alimentaire','economie-monde','antimondialisation','shoring-reshoring-near-shoring'
];

export const lexiqueExpressionGestionDocumentaire={
  id:'lexique-expression-gestion-documentaire',
  matiere:'Expression et gestion documentaire',
  titre:'Lexique — Expression et gestion documentaire',
  ordre:1,
  version:1,
  sections:[{
    id:'lexique',
    titre:'Lexique',
    contenu:notions.map(notionId=>({type:'definition',notionId})),
    notions:[...notions]
  }],
  notions,
  questions:[]
};
