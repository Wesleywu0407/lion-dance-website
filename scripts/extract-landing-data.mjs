import fs from 'node:fs';
import path from 'node:path';

const landingDir = path.join(process.cwd(), 'src', 'landing');
const outputDir = path.join(process.cwd(), 'src', '_data', 'landing');
fs.mkdirSync(outputDir, { recursive: true });

function text(html, pattern, label, file) {
  const match = html.match(pattern);
  if (!match) throw new Error(`${file}: missing ${label}`);
  return match[1]
    .trim()
    .replaceAll('{{ site.lineId }}', 'lion6869')
    .replaceAll('{{ site.phone }}', '0922-140-496');
}

const files = fs.readdirSync(landingDir).filter((name) => name.endsWith('.html')).sort();

for (const file of files) {
  const key = path.basename(file, '.html');
  const html = fs.readFileSync(path.join(landingDir, file), 'utf8');
  const hero = html.match(/<div class="page-hero-inner reveal reveal-hero">([\s\S]*?)<\/div>/)?.[1] || '';
  const cta = html.match(/<div class="cta-band reveal">([\s\S]*?)<div class="cta-band-actions">/)?.[1] || '';
  const blocks = [];

  for (const match of html.matchAll(/<div class="ctb about-block">([\s\S]*?)<\/div>/g)) {
    blocks.push({
      title: text(match[1], /<p class="ctb-phrase">([\s\S]*?)<\/p>/, 'block title', file),
      text: text(match[1], /<p class="ctb-support">([\s\S]*?)<\/p>/, 'block text', file)
    });
  }

  const data = {
    key,
    heroTag: text(hero, /<p class="section-tag">([\s\S]*?)<\/p>/, 'hero tag', file),
    h1: text(hero, /<h1 class="section-heading">([\s\S]*?)<\/h1>/, 'hero h1', file),
    intro: text(hero, /<p>([\s\S]*?)<\/p>/, 'hero intro', file),
    blocks,
    ctaTitle: text(cta, /<h2>([\s\S]*?)<\/h2>/, 'CTA title', file),
    ctaText: text(cta, /<p>([\s\S]*?)<\/p>/, 'CTA text', file)
  };

  fs.writeFileSync(path.join(outputDir, `${key}.json`), `${JSON.stringify(data, null, 2)}\n`);
}

console.log(`Extracted ${files.length} landing page data files.`);
