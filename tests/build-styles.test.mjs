import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildStyles } from '../scripts/build-styles.mjs';

test('bundling preserves asset locations, data URLs and the module cascade', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'nansien-styles-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.mkdir(path.join(root, 'css/sections'), { recursive: true });
  await fs.writeFile(path.join(root, 'css/style.css'), '@import "./base.css?v=1";\n@import "./sections/gallery.css?v=1";');
  await fs.writeFile(path.join(root, 'css/base.css'), '.base { color: red; background: url("../images/logo.webp"); }');
  await fs.writeFile(path.join(root, 'css/sections/gallery.css'), `
    .gallery { color: blue; background: url("../../images/%E7%8D%85.webp?v=2#photo"); }
    .texture { background: url("data:image/svg+xml,%3Csvg%3E%3C/svg%3E"); }
  `);
  await buildStyles(path.join(root, '_site'), root);
  const css = await fs.readFile(path.join(root, '_site/css/style.css'), 'utf8');
  assert.doesNotMatch(css, /@import/);
  assert.match(css, /\/images\/logo\.webp/);
  assert.match(css, /\/images\/%E7%8D%85\.webp\?v=2#photo/);
  assert.match(css, /data:image\/svg\+xml,/);
  assert.ok(css.indexOf('.base') < css.indexOf('.gallery'), 'later modules must retain cascade precedence');
  assert.match(await fs.readFile(path.join(root, 'css/style.css'), 'utf8'), /@import/, 'editable source must remain modular');
});
