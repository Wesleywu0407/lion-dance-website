import fs from 'node:fs';
import path from 'node:path';

const galleryDir = path.join(process.cwd(), 'src', 'gallery');
const files = fs.readdirSync(galleryDir)
  .filter((name) => name.endsWith('.html') && name !== 'index.html')
  .sort();

for (const file of files) {
  const key = path.basename(file, '.html');
  const filePath = path.join(galleryDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  html = html.replace('<body>', `<body>\n  {% set gallery = galleries["${key}"] %}`);
  html = html.replace(
    /<h1 class="album-title">[\s\S]*?<\/h1>/,
    '<h1 class="album-title">{{ gallery.title }}</h1>'
  );
  html = html.replace(
    /<p class="album-intro">[\s\S]*?<\/p>/,
    '<p class="album-intro">{{ gallery.intro }}</p>'
  );
  html = html.replace(
    /<div class="album-grid reveal"[^>]*>[\s\S]*?<\/div>/,
    `<div class="album-grid reveal" aria-label="{{ gallery.title }}照片">
          {% for photo in gallery.photos %}
          <button class="album-photo" type="button" data-album-photo data-lightbox-src="{{ photo | galleryFull }}" aria-label="放大檢視：{{ photo.alt }}"><img src="{{ photo | galleryThumbnail }}" srcset="{{ photo | gallerySrcset }}" sizes="(max-width: 760px) 92vw, 720px" alt="{{ photo.alt }}" loading="lazy" decoding="async" width="{{ photo.width }}" height="{{ photo.height }}"></button>
          {% endfor %}
        </div>`
  );
  html = html.replace(
    /(<img\s+data-album-lightbox-image\s+alt=")[^"]*(")/,
    '$1{{ gallery.lightboxAlt }}$2'
  );

  fs.writeFileSync(filePath, html);
}

console.log(`Bound ${files.length} gallery templates to JSON data.`);
