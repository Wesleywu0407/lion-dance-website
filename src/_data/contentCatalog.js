const fs = require('node:fs');
const path = require('node:path');
module.exports = async function () {
  const { entries, fieldsFor } = await import('../../supabase/functions/_shared/content-schema.mjs');
  return entries.map(({ path: sourcePath, ...entry }) => ({
    ...entry,
    fields: fieldsFor(entry),
    values: JSON.parse(fs.readFileSync(path.resolve(__dirname, '../..', sourcePath), 'utf8'))
  }));
};
