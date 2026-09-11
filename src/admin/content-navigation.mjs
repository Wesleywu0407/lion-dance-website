const normalize = value => String(value ?? '').normalize('NFKC').toLocaleLowerCase();

export const sectionLabels = {
  seo: 'Google 搜尋與社群分享', landing: '頁面文字',
  faq: '常見問題', services: '表演項目介紹', pricing: '報價與詢價說明'
};

export function pagesFor(entries) {
  const pages = new Map();
  for (const entry of entries) {
    if (!pages.has(entry.url)) pages.set(entry.url, { url: entry.url, label: entry.label, entries: [] });
    const page = pages.get(entry.url);
    page.entries.push(entry);
    if (entry.kind === 'seo') page.label = entry.label;
  }
  return [...pages.values()].map(page => ({
    ...page,
    group: page.url.startsWith('/gallery/') ? '活動案例' : page.url.startsWith('/landing/') ? '活動與價格專頁' : '主要頁面',
    entries: page.entries.sort((a, b) => Number(a.kind === 'seo') - Number(b.kind === 'seo'))
  }));
}

export function searchableFields(fields, values, prefix = [], labels = []) {
  return fields.flatMap(field => {
    const path = [...prefix, field.name];
    if (field.type !== 'list') return [{ path, label: [...labels, field.label].join(' / '), value: String(values?.[field.name] ?? '') }];
    return (values?.[field.name] || []).flatMap((item, index) => searchableFields(
      field.fields, item, [...path, index], [...labels, `${field.label} ${index + 1}`]
    ));
  });
}

export function searchEntries(entries, records, query) {
  const needle = normalize(query).trim();
  if (!needle) return [];
  return entries.flatMap(entry => {
    const record = records.get(entry.id);
    const matches = record ? searchableFields(record.fields, record.values).filter(field =>
      normalize(`${field.label} ${field.value}`).includes(needle)
    ) : [];
    const named = normalize(`${entry.label} ${entry.url} ${sectionLabels[entry.kind]}`).includes(needle);
    return matches.length || named ? [{ entry, matches }] : [];
  });
}

export function excerpt(value, query, length = 76) {
  const text = String(value).replace(/\s+/g, ' ');
  const index = normalize(text).indexOf(normalize(query).trim());
  const start = Math.max(0, index - 16);
  return `${start ? '…' : ''}${text.slice(start, start + length)}${text.length > start + length ? '…' : ''}`;
}
