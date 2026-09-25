import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { entries } from '../supabase/functions/_shared/content-schema.mjs';
const escape=value=>String(value).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
let count=0;
const site = JSON.parse(fs.readFileSync('src/_data/site.json', 'utf8'));
const stylesheet = fs.readFileSync('_site/css/style.css', 'utf8');
assert.doesNotMatch(stylesheet, /@import\s/, 'Public CSS must not create an import waterfall');
const canonicals = new Set();
for(const entry of entries.filter(e=>e.kind==='seo')){
  const data=JSON.parse(fs.readFileSync(entry.path,'utf8'));
  const file=`_site${entry.url.endsWith('/')?entry.url+'index':entry.url}.html`;
  const html=fs.readFileSync(file,'utf8');
  const canonical = `${site.siteUrl}${data.path}`;
  assert.deepEqual([...html.matchAll(/<link rel="canonical" href="([^"]+)">/g)].map(match => match[1]), [canonical], `${entry.id}: canonical`);
  assert.equal(canonicals.has(canonical), false, `${entry.id}: duplicate canonical`);
  canonicals.add(canonical);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${entry.id}: one primary heading`);
  assert.ok(html.includes('media="print" onload="this.media=\'all\';this.onload=null"'), `${entry.id}: font CSS must not block first paint`);
  assert.match(html, /<noscript><link rel="stylesheet" href="https:\/\/fonts.googleapis.com/, `${entry.id}: fonts must work without JavaScript`);
  assert.equal(/href=["'][^"']*\.html(?:[?#][^"']*)?["']/.test(html), false, `${entry.id}: legacy internal link in rendered page`);
  assert.equal((html.match(/<title>/g)||[]).length,1,entry.id);
  assert.ok(html.includes(`<title>${escape(data.title)}</title>`),`${entry.id}: title`);
  for(const [attribute,key,value] of [['name','description',data.description],['property','og:title',data.shareTitle||data.title],['property','og:description',data.shareDescription||data.description],['name','twitter:title',data.shareTitle||data.title],['name','twitter:description',data.shareDescription||data.description]]){
    assert.ok(html.includes(`<meta ${attribute}="${key}" content="${escape(value)}">`),`${entry.id}: ${key}`);
  }
  for(const [,json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
    const graph=JSON.parse(json);const nodes=graph['@graph']||[graph];
    for(const node of nodes.filter(n=>['WebPage','ContactPage','AboutPage','CollectionPage'].includes(n['@type']))){
      assert.equal(node.name,data.title,`${entry.id}: schema title`);assert.equal(node.description,data.description,`${entry.id}: schema description`);
    }
  }
  count++;
}
const about = fs.readFileSync('_site/pages/about.html', 'utf8');
assert.equal((about.match(/<h2 class="about-chapter-title"/g) || []).length, 5, 'About page chapters must be headings');
const sitemap = fs.readFileSync('_site/sitemap.xml', 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, 'Sitemap must not repeat URLs');
assert.deepEqual([...sitemapUrls].sort(), [...canonicals].sort(), 'Sitemap must match all public SEO pages');

// Inspect rendered public pages too: a new page must not silently miss the sitemap.
for (const relative of ['index.html', ...['pages', 'gallery', 'landing'].flatMap(dir =>
  fs.readdirSync(`_site/${dir}`).filter(file => file.endsWith('.html')).map(file => path.join(dir, file)))]) {
  const html = fs.readFileSync(path.join('_site', relative), 'utf8');
  if (/<meta name="robots" content="noindex/.test(html)) continue;
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  assert.ok(canonical && canonicals.has(canonical), `${relative}: indexable page missing from sitemap`);
}

for (const file of fs.readdirSync('_site/landing').filter(file => file.endsWith('.html'))) {
  const html = fs.readFileSync(`_site/landing/${file}`, 'utf8');
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || '';
  assert.match(main, /<h2 class="ctb-phrase">/, `${file}: semantic content headings`);
  assert.match(main, /href="\/gallery\//, `${file}: contextual case links`);
  if (file !== 'lion-dance-price-guide.html') {
    assert.match(main, /href="\/landing\/lion-dance-price-guide"/, `${file}: contextual price guide link`);
  }
  if (file === 'lion-dance-price-guide.html') {
    const faq = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map(match => JSON.parse(match[1])).find(node => node['@type'] === 'FAQPage');
    assert.ok(faq?.mainEntity.length, 'Price guide FAQ schema must be present');
    for (const item of faq.mainEntity) {
      assert.ok(main.includes(`<summary>${escape(item.name)}</summary>`), 'FAQ question must be visible');
      assert.ok(main.includes(`<p>${escape(item.acceptedAnswer.text)}</p>`), 'FAQ answer must match visible content');
    }
  }
}
for(const file of ['_site/admin/index.html','_site/admin/seo.html','_site/admin/technical.html']){
  const html=fs.readFileSync(file,'utf8');
  assert.match(html,/name="robots" content="noindex/);
  assert.equal(html.includes('googletagmanager.com'),false,'No advertising tags on auth/admin pages');
}
console.log(`SEO content check passed: ${count} pages, canonical sitemap, headings, contextual links, visible price FAQs, sharing tags and noindex admin pages.`);
