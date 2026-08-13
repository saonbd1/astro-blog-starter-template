import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const srcDir = path.join(root, 'src');
const sourceExtensions = new Set(['.png', '.jpg', '.jpeg']);

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(fullPath)));
    else files.push(fullPath);
  }
  return files;
}

const publicFiles = await walk(publicDir);
const candidates = publicFiles.filter((file) => {
  const relative = path.relative(publicDir, file);
  return !relative.startsWith(`og${path.sep}`) && sourceExtensions.has(path.extname(file).toLowerCase());
});

const replacements = new Map();
let savedBytes = 0;
for (const file of candidates) {
  const extension = path.extname(file);
  const basename = file.slice(0, -extension.length);
  const webpPath = `${basename}.webp`;
  const before = (await fs.stat(file)).size;
  await sharp(file, { failOn: 'none' }).webp({ quality: 82, effort: 6 }).toFile(webpPath);
  const after = (await fs.stat(webpPath)).size;
  replacements.set(`/${path.relative(publicDir, file).split(path.sep).join('/')}`, `/${path.relative(publicDir, webpPath).split(path.sep).join('/')}`);
  if (after < before) {
    savedBytes += before - after;
    await fs.rm(file);
  } else {
    await fs.rm(webpPath);
    replacements.delete(`/${path.relative(publicDir, file).split(path.sep).join('/')}`);
  }
}

const sourceFiles = (await walk(srcDir)).filter((file) => /\.(astro|md|mdx|js|ts|mjs)$/i.test(file));
for (const file of sourceFiles) {
  let source = await fs.readFile(file, 'utf8');
  const original = source;
  for (const [from, to] of replacements) source = source.replaceAll(from, to);
  if (source !== original) await fs.writeFile(file, source);
}

console.log(`Converted ${replacements.size} raster assets to WebP and saved ${savedBytes} bytes.`);
for (const [from, to] of replacements) console.log(`${from} -> ${to}`);
