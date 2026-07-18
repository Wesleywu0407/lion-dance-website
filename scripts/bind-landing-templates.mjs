import fs from 'node:fs';
import path from 'node:path';

const landingDir = path.join(process.cwd(), 'src', 'landing');
const files = fs.readdirSync(landingDir).filter((name) => name.endsWith('.html')).sort();

for (const file of files) {
  const key = path.basename(file, '.html');
  const filePath = path.join(landingDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  html = html.replace('<body>', `<body>\n  {% set landingPage = landing["${key}"] %}`);
  html = html.replace(
    /<div class="page-hero-inner reveal reveal-hero">[\s\S]*?<\/div>/,
    `<div class="page-hero-inner reveal reveal-hero">
          <p class="section-tag">{{ landingPage.heroTag }}</p>
          <h1 class="section-heading">{{ landingPage.h1 }}</h1>
          <p>{{ landingPage.intro }}</p>
        </div>`
  );
  html = html.replace(
    /<div class="about-layout about-cinematic">[\s\S]*?(?=\n\s*<div class="landing-photo-strip)/,
    `<div class="about-layout about-cinematic">
          {% for block in landingPage.blocks %}
          <div class="ctb about-block">
            <p class="ctb-phrase">{{ block.title }}</p>
            <p class="ctb-support">{{ block.text }}</p>
          </div>
          {% endfor %}
        </div>
`
  );
  html = html.replace(
    /(<div class="cta-band reveal">[\s\S]*?<p class="section-tag">[\s\S]*?<\/p>\s*)<h2>[\s\S]*?<\/h2>\s*<p>[\s\S]*?<\/p>/,
    '$1<h2>{{ landingPage.ctaTitle }}</h2>\n          <p>{{ landingPage.ctaText }}</p>'
  );

  fs.writeFileSync(filePath, html);
}

console.log(`Bound ${files.length} landing templates to JSON data.`);
