import {contentCatalog} from '../data/courses/index.js';

console.log('CONTENT VALIDATION\n');
if(contentCatalog.manifest)console.log('✓ content/manifest.json');
console.log(`✓ content/subjects.json (${contentCatalog.subjects.length} matières)`);
for(const entry of contentCatalog.validEntries) {
  const {course}=entry;
  console.log(`✓ ${course.id}`);
  console.log(`  ✓ ${course.sections.length} sections`);
  console.log(`  ✓ ${course.notions.length} notions`);
  console.log(`  ✓ ${course.questions.length} questions`);
  console.log(`  ✓ ${entry.confusionGroups.length} groupes de confusion`);
}
for(const warning of contentCatalog.warnings)console.warn(`⚠ ${warning}`);
for(const error of contentCatalog.errors)console.error(`✗ ${error}`);
console.log(`\n${contentCatalog.errors.length} erreur(s)`);
console.log(`${contentCatalog.warnings.length} avertissement(s)`);
if(contentCatalog.errors.length)process.exitCode=1;
