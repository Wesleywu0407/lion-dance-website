import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const projectRoot = process.cwd();
const inputRoot = path.resolve(process.env.IMAGE_PIPELINE_INPUT || path.join(projectRoot, 'images', 'uploads'));
const outputRoot = path.resolve(process.env.IMAGE_PIPELINE_OUTPUT || path.join(projectRoot, '.cache', 'image-pipeline', 'uploads'));
const widths = [720, 1440, 1920];
const supported = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.avif']);

async function walk(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (supported.has(path.extname(entry.name).toLowerCase())) files.push(fullPath);
  }
  return files;
}

async function isFresh(input, output) {
  try {
    const [inputStat, outputStat] = await Promise.all([fs.stat(input), fs.stat(output)]);
    return outputStat.mtimeMs >= inputStat.mtimeMs;
  } catch {
    return false;
  }
}

await fs.mkdir(inputRoot, { recursive: true });
await fs.mkdir(outputRoot, { recursive: true });

const files = await walk(inputRoot);
let written = 0;

for (const input of files) {
  const relative = path.relative(inputRoot, input);
  const extension = path.extname(relative);
  const stem = relative.slice(0, -extension.length);

  for (const width of widths) {
    const output = path.join(outputRoot, `${stem}-${width}.webp`);
    if (await isFresh(input, output)) continue;

    await fs.mkdir(path.dirname(output), { recursive: true });
    await sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(output);
    written += 1;
  }
}

console.log(`Image pipeline: ${files.length} source image(s), ${written} output(s) written.`);
