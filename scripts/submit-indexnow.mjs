import { execFileSync } from 'node:child_process';

const key = process.env.INDEXNOW_KEY;
const host = 'www.techtips.fun';
const site = `https://${host}`;
const baseSha = process.env.BASE_SHA || 'HEAD^';
const headSha = process.env.HEAD_SHA || 'HEAD';

if (!key || !/^[A-Za-z0-9-]{8,128}$/.test(key)) {
  throw new Error('INDEXNOW_KEY is missing or invalid');
}

const changed = execFileSync('git', ['diff', '--name-status', baseSha, headSha], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean)
  .map((line) => {
    const [status, ...paths] = line.split('\t');
    return { status, path: paths.at(-1) };
  });

const urls = new Set();
const add = (path) => urls.add(`${site}${path}`);

for (const file of changed) {
  const path = file.path || '';
  if (path.startsWith('src/content/blog/') && path.endsWith('.md')) {
    const slug = path.split('/').pop().replace(/\.md$/, '').toLowerCase();
    add(`/blog/${slug}/`);
  } else if (path === 'src/pages/index.astro') {
    add('/');
  } else if (path === 'src/pages/blog/index.astro') {
    add('/blog/');
  } else if (path === 'src/pages/about.astro') {
    add('/about/');
  } else if (path === 'src/pages/contact-me.astro') {
    add('/contact-me/');
  } else if (path.startsWith('src/pages/categories/')) {
    add('/categories/');
  } else if (path.startsWith('src/pages/tags/')) {
    add('/tags/');
  } else if (path.startsWith('src/components/') || path.startsWith('src/layouts/') || path.startsWith('src/styles/') || path === 'src/consts.ts') {
    add('/');
    add('/blog/');
    add('/about/');
    add('/contact-me/');
  }
}

if (urls.size === 0) {
  console.log('No indexable URL changes detected.');
  process.exit(0);
}

const urlList = [...urls];
const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, urlList }),
});

console.log(`IndexNow response: ${response.status}; submitted ${urlList.length} URL(s).`);
if (!response.ok) {
  const text = await response.text();
  throw new Error(`IndexNow submission failed: ${text.slice(0, 500)}`);
}
