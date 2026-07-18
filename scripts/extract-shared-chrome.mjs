import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const representative = path.join(root, 'src', 'landing', 'company-event-lion-dance.html');
const includesDir = path.join(root, 'src', '_includes');
let html = fs.readFileSync(representative, 'utf8');

const header = html.match(/<header class="site-header">[\s\S]*?<\/header>/)?.[0];
const footer = html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)?.[0];
if (!header || !footer) throw new Error('Could not extract shared header/footer.');

fs.writeFileSync(path.join(includesDir, 'header.njk'), `${header}\n`);
fs.writeFileSync(path.join(includesDir, 'footer.njk'), `${footer}\n`);

const landingDir = path.join(root, 'src', 'landing');
const files = fs.readdirSync(landingDir).filter((name) => name.endsWith('.html'));
for (const file of files) {
  const filePath = path.join(landingDir, file);
  let source = fs.readFileSync(filePath, 'utf8');
  source = source.replace(/<header class="site-header">[\s\S]*?<\/header>/, '{% include "header.njk" %}');
  source = source.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, '{% include "footer.njk" %}');
  fs.writeFileSync(filePath, source);
}

console.log(`Extracted shared chrome and updated ${files.length} landing templates.`);
