import fs from 'node:fs';
import path from 'node:path';

const filePath = path.join(process.cwd(), 'src', 'pages', 'dragon-lion-introduction.html');
let html = fs.readFileSync(filePath, 'utf8');
const list = html.match(/<div class="intro-faq-list reveal">([\s\S]*?)<\/div>/)?.[1] || '';
const items = [];

for (const match of list.matchAll(/<details class="intro-faq-row">([\s\S]*?)<\/details>/g)) {
  const question = match[1].match(/<h3>([\s\S]*?)<\/h3>/)?.[1]?.trim();
  const answer = match[1].match(/<\/summary>\s*<p>([\s\S]*?)<\/p>/)?.[1]?.trim();
  if (question && answer) items.push({ question, answer });
}

if (!items.length) throw new Error('No FAQ entries found.');

const outputPath = path.join(process.cwd(), 'src', '_data', 'faq.json');
fs.writeFileSync(outputPath, `${JSON.stringify({ items }, null, 2)}\n`);

const scripts = [...html.matchAll(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g)];
const faqScript = scripts.find((match) => match[0].includes('"@type": "FAQPage"'));
if (!faqScript) throw new Error('FAQ JSON-LD script not found.');

html = html.replace(
  faqScript[0],
  '<script type="application/ld+json">\n  {{ faq | faqJsonLd | safe }}\n  </script>'
);
html = html.replace(
  /<div class="intro-faq-list reveal">[\s\S]*?<\/div>/,
  `<div class="intro-faq-list reveal">
            {% for item in faq.items %}
            <details class="intro-faq-row">
              <summary>
                <h3>{{ item.question }}</h3>
                <span class="intro-faq-icon" aria-hidden="true"></span>
              </summary>
              <p>{{ item.answer }}</p>
            </details>
            {% endfor %}
          </div>`
);

fs.writeFileSync(filePath, html);
console.log(`Bound ${items.length} FAQ entries to src/_data/faq.json.`);
