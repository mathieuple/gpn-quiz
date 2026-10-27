const reusable=/^(CC0|CC BY(?:-SA)?|Public domain|PDM)/i;
export function validateLigneuxPack(species,photos){
  const errors=[],ids=new Set(),photoIds=new Set(),hashes=new Set(),counts=new Map();
  if(species.length!==30)errors.push(`Le module doit contenir exactement 30 espèces (actuel : ${species.length}).`);
  for(const item of species){
    if(!item.id||ids.has(item.id))errors.push(`ID d’espèce absent ou dupliqué : ${item.id||'(vide)'}.`);ids.add(item.id);
    for(const key of ['french','scientific','family','leaf'])if(!item[key])errors.push(`${item.id||'(sans ID)'} : champ ${key} absent.`);
    if(!Array.isArray(item.diagnostics)||item.diagnostics.length<2)errors.push(`${item.id} : caractères diagnostiques insuffisants.`);
  }
  for(const photo of photos){
    if(!photo.id||photoIds.has(photo.id))errors.push(`ID photo absent ou dupliqué : ${photo.id||'(vide)'}.`);photoIds.add(photo.id);
    if(!photo.originalSha1||hashes.has(photo.originalSha1))errors.push(`${photo.id} : fichier source absent ou dupliqué.`);hashes.add(photo.originalSha1);
    if(!ids.has(photo.speciesId))errors.push(`${photo.id} : espèce inconnue ${photo.speciesId}.`);
    if(!photo.src?.endsWith('.webp'))errors.push(`${photo.id} : chemin WebP invalide.`);
    if(!photo.author||!photo.sourcePage||!photo.license||!photo.licenseUrl)errors.push(`${photo.id} : attribution incomplète.`);
    if(!reusable.test(photo.license||''))errors.push(`${photo.id} : licence non reconnue comme réutilisable (${photo.license}).`);
    if(photo.verified!==true)errors.push(`${photo.id} : vérification botanique absente.`);
    counts.set(photo.speciesId,(counts.get(photo.speciesId)||0)+1);
  }
  for(const item of species){const count=counts.get(item.id)||0;if(count<4||count>5)errors.push(`${item.id} : ${count} photos (4 à 5 attendues).`);}
  return {valid:errors.length===0,errors,speciesCount:species.length,photoCount:photos.length,photoCounts:Object.fromEntries(counts)};
}
