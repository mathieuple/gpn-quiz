import {normalize} from '../utils/normalize.js';
import {ambiguousPairs} from '../../data/confusion-groups.js';

const cache = new WeakMap();
export function aliases(notion) {
  if (!cache.has(notion)) cache.set(notion, new Set([notion.terme, ...(notion.variantesAcceptees || [])].map(normalize)));
  return cache.get(notion);
}

export function ambiguityReason(a, b) {
  if (a.id === b.id) return 'Même notion';
  if ([...aliases(a)].some(alias => aliases(b).has(alias))) return 'Terme ou variante officielle partagé';
  if (normalize(a.definitionCourte) === normalize(b.definitionCourte)) return 'Définition identique';
  return ambiguousPairs.find(([x,y]) => (x===a.id && y===b.id) || (x===b.id && y===a.id))?.[2] || '';
}

export const areAmbiguous = (a,b) => Boolean(ambiguityReason(a,b));
