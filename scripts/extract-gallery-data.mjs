import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const galleryDir = path.join(projectRoot, 'src', 'gallery');
const outputDir = path.join(projectRoot, 'src', '_data', 'galleries');

function decode(value = '') {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function readAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return match ? decode(match[1]) : '';
}

function readText(html, pattern, label, file) {
  const match = html.match(pattern);
  if (!match) throw new Error(`${file}: missing ${label}`);
  return decode(match[1].trim());
}

fs.mkdirSync(outputDir, { recursive: true });

const files = fs.readdirSync(galleryDir)
  .filter((name) => name.endsWith('.html') && name !== 'index.html')
  .sort();

for (const file of files) {
  const key = path.basename(file, '.html');
  const html = fs.readFileSync(path.join(galleryDir, file), 'utf8');
  const title = readText(html, /<h1 class="album-title">([\s\S]*?)<\/h1>/, 'album title', file);
  const intro = readText(html, /<p class="album-intro">([\s\S]*?)<\/p>/, 'album intro', file);
  const lightboxAlt = readAttribute(
    html.match(/<img\s+data-album-lightbox-image[^>]*>/)?.[0] || '',
    'alt'
  );
  const photos = [];
  const photoPattern = /<button class="album-photo"[^>]*>[\s\S]*?<\/button>/g;

  for (const block of html.match(photoPattern) || []) {
    const button = block.match(/<button[^>]*>/)?.[0] || '';
    const image = block.match(/<img[^>]*>/)?.[0] || '';
    photos.push({
      full: readAttribute(button, 'data-lightbox-src'),
      thumbnail: readAttribute(image, 'src'),
      alt: readAttribute(image, 'alt'),
      width: Number(readAttribute(image, 'width')),
      height: Number(readAttribute(image, 'height'))
    });
  }

  if (!photos.length) throw new Error(`${file}: no album photos found`);

  fs.writeFileSync(
    path.join(outputDir, `${key}.json`),
    `${JSON.stringify({ key, title, intro, lightboxAlt, photos }, null, 2)}\n`
  );
}

console.log(`Extracted ${files.length} gallery data files.`);
