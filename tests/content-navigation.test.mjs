import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { entries, fieldsFor } from '../supabase/functions/_shared/content-schema.mjs';
import { pagesFor, searchEntries, searchableFields, excerpt } from '../src/admin/content-navigation.mjs';

const records = new Map(entries.map(entry => [entry.id, {
  fields: fieldsFor(entry), values: JSON.parse(fs.readFileSync(entry.path, 'utf8'))
}]));

test('navigation combines each page and puts visible copy before search metadata', () => {
  const pages = pagesFor(entries);
  assert.equal(pages.length, 22);
  assert.equal(pages[0].label, '首頁');
  assert.deepEqual(pages.find(page => page.url === '/pages/services').entries.map(entry => entry.kind), ['services', 'seo']);
  assert.deepEqual(pages.find(page => page.url === '/landing/lion-dance-price-guide').entries.map(entry => entry.kind), ['landing', 'pricing', 'seo']);
  assert.equal(pages.find(page => page.url === '/gallery/').group, '活動案例');
});

test('finds nested body copy with the exact editable field path', () => {
  const record = records.get('faq');
  const phrase = record.values.items[1].answer.slice(0, 15);
  const result = searchEntries(entries, records, phrase).find(result => result.entry.id === 'faq');
  assert.ok(result.matches.some(match => JSON.stringify(match.path) === JSON.stringify(['items', 1, 'answer'])));
  assert.ok(result.matches.some(match => match.label.includes('常見問題 2')));
});

test('matches page names, URLs, field labels and normalized text without unsupported records', () => {
  assert.ok(searchEntries(entries, records, '首頁').some(result => result.entry.id === 'seo/home'));
  assert.ok(searchEntries(entries, records, '/PAGES/SERVICES').some(result => result.entry.id === 'services'));
  assert.ok(searchEntries(entries, records, '分享圖片網址').length > 0);
  const copy = new Map(records);
  copy.set('seo/home', { fields: [{ name: 'title', label: '標題' }], values: { title: 'ＡＢＣ 文字' } });
  assert.equal(searchEntries(entries, copy, 'abc')[0].entry.id, 'seo/home');
  assert.deepEqual(searchEntries(entries, records, 'no-such-copy-493029'), []);
  assert.deepEqual(searchEntries([], records, '首頁'), []);
  assert.deepEqual(searchEntries(entries, records, '   '), []);
});

test('index includes only editable fields, never fixed metadata', () => {
  const record = records.get('services');
  const fields = searchableFields(record.fields, record.values);
  assert.ok(fields.length > 10);
  assert.ok(fields.every(field => !field.path.includes('id') && !field.path.includes('image')));
  const price = records.get('landing/lion-dance-price-guide');
  assert.ok(searchableFields(price.fields, price.values).every(field => !field.path.includes('blocks')));
});

test('search excerpts include a match deep inside a paragraph', () => {
  const result = excerpt('前'.repeat(100) + '關鍵字' + '後'.repeat(100), '關鍵字');
  assert.ok(result.includes('關鍵字'));
  assert.ok(result.startsWith('…') && result.endsWith('…'));
  assert.ok(result.length <= 78);
});
