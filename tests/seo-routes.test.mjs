import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const projectRoot = path.resolve(import.meta.dirname, '..');

const expectedRedirects = new Map([
  ['/index.html', '/'],
  ['/about.html', '/pages/about'],
  ['/services.html', '/pages/services'],
  ['/contact.html', '/pages/contact'],
  ['/gallery.html', '/gallery/'],
  ['/gallery/index.html', '/gallery/'],
  ...['opening', 'banquet', 'tourism', 'funeral', 'groundbreaking', 'festival-retail', 'temple', 'school', 'performance']
    .map((slug) => [`/gallery-${slug}.html`, `/gallery/${slug}`]),
  ...['about', 'services', 'contact', 'dragon-lion-introduction', 'privacy', 'ink-dragon-scroll']
    .map((slug) => [`/pages/${slug}.html`, `/pages/${slug}`]),
  ...['opening', 'banquet', 'tourism', 'funeral', 'groundbreaking', 'festival-retail', 'temple', 'school', 'performance']
    .map((slug) => [`/gallery/${slug}.html`, `/gallery/${slug}`]),
  ...['dragon-lion-dance-performance', 'lion-dance-performance', 'opening-lion-dance', 'company-event-lion-dance', 'year-end-party-lion-dance', 'lion-dance-price-guide']
    .map((slug) => [`/landing/${slug}.html`, `/landing/${slug}`])
]);

function publicSourceFiles() {
  const files = [
    'src/index.html',
    'src/script.js.njk',
    'src/_includes/header.njk',
    'src/_includes/footer.njk'
  ];

  for (const directory of ['src/pages', 'src/gallery', 'src/landing']) {
    for (const entry of fs.readdirSync(path.join(projectRoot, directory))) {
      if (entry.endsWith('.html')) files.push(path.join(directory, entry));
    }
  }

  return files;
}

test('declares every legacy route once as a forced permanent redirect', () => {
  const config = fs.readFileSync(path.join(projectRoot, 'netlify.toml'), 'utf8');
  const blocks = [...config.matchAll(/\[\[redirects\]\]([\s\S]*?)(?=\n\[\[redirects\]\]|$)/g)];
  const actual = new Map();

  for (const [, block] of blocks) {
    const from = block.match(/\bfrom\s*=\s*"([^"]+)"/)?.[1];
    const to = block.match(/\bto\s*=\s*"([^"]+)"/)?.[1];
    assert.ok(from && to, 'each redirect must define from and to');
    assert.equal(block.match(/\bstatus\s*=\s*(\d+)/)?.[1], '301', `${from} must be permanent`);
    assert.equal(block.match(/\bforce\s*=\s*(\w+)/)?.[1], 'true', `${from} must override generated files`);
    assert.equal(actual.has(from), false, `duplicate redirect source: ${from}`);
    actual.set(from, to);
  }

  assert.deepEqual(actual, expectedRedirects);
});

test('sitemap contains canonical clean URLs only', () => {
  const sitemap = fs.readFileSync(path.join(projectRoot, 'sitemap.xml'), 'utf8');
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

  assert.ok(locations.length > 1, 'sitemap should contain public pages');
  assert.equal(new Set(locations).size, locations.length, 'sitemap URLs must be unique');
  assert.equal(locations.some((location) => /\.html(?:$|[?#])/.test(location)), false);
});

test('every indexable public page has one clean canonical listed in the sitemap', () => {
  const sitemap = fs.readFileSync(path.join(projectRoot, 'sitemap.xml'), 'utf8');
  const locations = new Set(
    [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  );

  for (const relativePath of publicSourceFiles().filter((file) => file.endsWith('.html'))) {
    const source = fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
    if (!/<meta name="robots" content="index, follow">/.test(source)) continue;

    const canonicals = [...source.matchAll(/<link rel="canonical" href="([^"]+)">/g)];
    assert.equal(canonicals.length, 1, `${relativePath} must have exactly one canonical`);
    assert.equal(/\.html(?:$|[?#])/.test(canonicals[0][1]), false, `${relativePath} canonical must be clean`);
    assert.equal(locations.has(canonicals[0][1]), true, `${relativePath} canonical must be in sitemap`);
  }
});

test('public source does not link or canonicalize to legacy HTML routes', () => {
  const failures = [];

  for (const relativePath of publicSourceFiles()) {
    const source = fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
    if (/https:\/\/nansiengtaiwan\.com\/(?:pages|gallery|landing)\/[A-Za-z0-9-]+\.html/.test(source)) {
      failures.push(`${relativePath}: absolute legacy URL`);
    }
    if (/href=["'][^"']*(?:pages|gallery|landing)\/[A-Za-z0-9-]+\.html/.test(source)) {
      failures.push(`${relativePath}: legacy internal link`);
    }
    if (/href=["'](?:\.\.\/)?index\.html/.test(source)) {
      failures.push(`${relativePath}: legacy homepage link`);
    }
    if (/(?:href|src)=["'][^"']+\.html(?:[?#][^"']*)?["']/.test(source)) {
      failures.push(`${relativePath}: public HTML reference`);
    }
  }

  assert.deepEqual(failures, []);
});
