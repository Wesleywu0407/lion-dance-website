import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const baseUrl = process.argv[2] || 'http://127.0.0.1:8123';
const htmlFiles = [];
const ignoredDirs = new Set(['.git', 'node_modules']);

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (entry.name.endsWith('.html')) {
      htmlFiles.push(fullPath);
    }
  }
}

walk(root);

const linkedUrls = new Set();

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const attributePattern = /(?:href|src|action)=["']([^"']+)["']/g;
  let match;

  while ((match = attributePattern.exec(html))) {
    const rawUrl = match[1];

    if (
      !rawUrl ||
      rawUrl.startsWith('#') ||
      rawUrl.startsWith('mailto:') ||
      rawUrl.startsWith('tel:') ||
      rawUrl.startsWith('javascript:') ||
      rawUrl.startsWith('data:')
    ) {
      continue;
    }

    if (rawUrl.startsWith('http') && !rawUrl.startsWith('https://nansiengtaiwan.com/')) {
      continue;
    }

    const localUrl = rawUrl
      .replace('https://nansiengtaiwan.com', '')
      .split('#')[0];

    if (localUrl.startsWith('/')) {
      linkedUrls.add(localUrl);
    }
  }
}

const failures = [];

for (const localUrl of linkedUrls) {
  const response = await fetch(`${baseUrl}${localUrl}`);

  if (response.status >= 400) {
    failures.push(`${response.status} ${localUrl}`);
  }
}

console.log(`HTML files: ${htmlFiles.length}`);
console.log(`Local linked URLs checked: ${linkedUrls.size}`);

if (failures.length) {
  console.log(failures.join('\n'));
  process.exit(1);
}

console.log('link check passed');

