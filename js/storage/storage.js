import {defaults,migrate,validateUserData} from './migrations.js';
export const STORAGE_KEY='gpnQuiz.userData.v1.1';
export const LEGACY_KEY='gpnQuiz.userData.v1';
export function load(storage) {
  try {
    const target=storage??globalThis.localStorage;
    for(const key of [STORAGE_KEY,LEGACY_KEY]) {
      const raw=target.getItem(key);
      if(raw)try{return migrate(JSON.parse(raw));}catch{/* Conserver la copie existante. */}
    }
  } catch {/* Stockage désactivé : application utilisable en mémoire. */}
  return defaults();
}
export function save(user,storage) {
  try {
    const target=storage??globalThis.localStorage,raw=target.getItem?.(STORAGE_KEY),normalized=migrate(user);
    if(raw)try{migrate(JSON.parse(raw));}catch {
      // Archiver avant remplacement ; en cas d'échec, ne rien écraser.
      target.setItem(STORAGE_KEY+'.recovery.'+Date.now(),raw);
    }
    target.setItem(STORAGE_KEY,JSON.stringify(normalized));return true;
  } catch {return false;}
}
export function serializeUserData(user){return JSON.stringify(migrate(user),null,2);}
export function parseImport(raw) {
  const result=validateUserData(JSON.parse(raw),{requireVersion:true});
  if(!result.valid)throw new Error('Ce fichier ne contient pas une progression GPN Quiz valide. '+result.fatalErrors.join(' '));
  return result.data;
}
