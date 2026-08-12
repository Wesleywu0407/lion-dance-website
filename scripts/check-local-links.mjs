import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), process.argv[2] || '.');
const htmlFiles = [];
const cssFiles = [];
const ignoredDirs = new Set(['.git', 'node_modules', '_site']);

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
    } else if (entry.name.endsWith('.css')) {
      cssFiles.push(fullPath);
    }
  }
}

walk(root);

const failures = [];
const checkedPaths = new Set();
const documentIds = new Map();

function report(message) {
  failures.push(message);
}

function relativeName(file) {
  return path.relative(root, file) || '.';
}

function readIds(file, html) {
  const ids = new Set();
  const idPattern = /<[^>]+\sid=["']([^"']+)["'][^>]*>/gi;
  let match;

  while ((match = idPattern.exec(html))) {
    if (ids.has(match[1])) {
      report(`${relativeName(file)}: duplicate id "${match[1]}"`);
    }
    ids.add(match[1]);
  }

  documentIds.set(path.resolve(file), ids);
}

function validateJsonLd(file, html) {
  const pattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = pattern.exec(html))) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      report(`${relativeName(file)}: invalid JSON-LD (${error.message})`);
    }
  }
}

function normalizeReference(fromFile, rawReference) {
  let reference = rawReference.trim();

  if (!reference || /^(?:mailto:|tel:|javascript:|data:|blob:)/i.test(reference)) {
    return null;
  }

  if (reference.startsWith('//')) {
    return null;
  }

  if (/^https?:/i.test(reference)) {
    try {
      const url = new URL(reference);
      if (!['nansiengtaiwan.com', 'www.nansiengtaiwan.com'].includes(url.hostname)) {
        return null;
      }
      reference = `${url.pathname}${url.search}${url.hash}`;
    } catch {
      report(`${relativeName(fromFile)}: invalid URL "${rawReference}"`);
      return null;
    }
  }

  const hashIndex = reference.indexOf('#');
  const fragment = hashIndex >= 0 ? reference.slice(hashIndex + 1) : '';
  const withoutHash = hashIndex >= 0 ? reference.slice(0, hashIndex) : reference;
  const withoutQuery = withoutHash.split('?')[0];
  let decodedPath;

  try {
    decodedPath = decodeURIComponent(withoutQuery);
  } catch {
    report(`${relativeName(fromFile)}: invalid URL encoding "${rawReference}"`);
    return null;
  }

  let target = decodedPath
    ? decodedPath.startsWith('/')
      ? path.join(root, decodedPath.slice(1))
      : path.resolve(path.dirname(fromFile), decodedPath)
    : path.resolve(fromFile);

  if (!target.startsWith(`${root}${path.sep}`) && target !== root) {
    report(`${relativeName(fromFile)}: path escapes project root "${rawReference}"`);
    return null;
  }

  if ((decodedPath.endsWith('/') || (fs.existsSync(target) && fs.statSync(target).isDirectory()))) {
    target = path.join(target, 'index.html');
  } else if (!path.extname(target) && !fs.existsSync(target) && fs.existsSync(`${target}.html`)) {
    // Netlify serves generated foo.html files at the canonical clean /foo URL.
    target = `${target}.html`;
  }

  return { fragment, target };
}

function checkReference(fromFile, rawReference) {
  const normalized = normalizeReference(fromFile, rawReference);
  if (!normalized) return;

  const key = `${relativeName(fromFile)} -> ${normalized.target}#${normalized.fragment}`;
  if (checkedPaths.has(key)) return;
  checkedPaths.add(key);

  if (!fs.existsSync(normalized.target) || !fs.statSync(normalized.target).isFile()) {
    report(`${relativeName(fromFile)}: missing "${rawReference}"`);
    return;
  }

  if (normalized.fragment && path.extname(normalized.target).toLowerCase() === '.html') {
    const ids = documentIds.get(path.resolve(normalized.target));
    if (ids && !ids.has(normalized.fragment)) {
      report(`${relativeName(fromFile)}: missing fragment "#${normalized.fragment}" in ${relativeName(normalized.target)}`);
    }
  }
}

const htmlSources = new Map();

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  htmlSources.set(file, html);
  readIds(file, html);
  validateJsonLd(file, html);
}

for (const [file, html] of htmlSources) {
  const attributePattern = /(?:href|src|data-src|action|poster)=["']([^"']+)["']/gi;
  let match;

  while ((match = attributePattern.exec(html))) {
    checkReference(file, match[1]);
  }

  const srcsetPattern = /(?:srcset|data-srcset)=["']([^"']+)["']/gi;
  while ((match = srcsetPattern.exec(html))) {
    for (const candidate of match[1].split(',')) {
      const reference = candidate.trim().split(/\s+/)[0];
      if (reference) checkReference(file, reference);
    }
  }
}

for (const file of cssFiles) {
  const css = fs.readFileSync(file, 'utf8');
  const urlPattern = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
  const importPattern = /@import\s+["']([^"']+)["']/gi;
  let match;

  while ((match = urlPattern.exec(css))) {
    checkReference(file, match[1].trim());
  }

  while ((match = importPattern.exec(css))) {
    checkReference(file, match[1]);
  }
}

console.log(`HTML files: ${htmlFiles.length}`);
console.log(`CSS files: ${cssFiles.length}`);
console.log(`Local references checked: ${checkedPaths.size}`);

if (failures.length) {
  console.log(failures.join('\n'));
  process.exit(1);
}

console.log('site integrity check passed');
