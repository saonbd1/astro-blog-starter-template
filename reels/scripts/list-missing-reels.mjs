#!/usr/bin/env node
/**
 * Prints the slugs of articles that do not have a reel yet, newest first.
 *
 * Used by the "Generate article reels" workflow instead of diffing the
triggering commit: it is idempotent, self-healing after a failed render, and
works no matter how the post got published (see the workflow for why the push
*event* alone is not enough in this repo).
 *
 * Usage:
 *   node scripts/list-missing-reels.mjs [--limit N] [--slug <slug>] [--force]
 *
 * Slugs go to stdout (one per line); the summary goes to stderr so it can be
 * captured with $(...).
 */

import fs from "node:fs";
import path from "node:path";
import { REELS_ROOT } from "./lib/remotion-cli.mjs";
import { listArticles, readArticle } from "./build-reel-props.mjs";

const REPO_ROOT = path.resolve(REELS_ROOT, "..");
const REELS_OUT_DIR = path.join(REPO_ROOT, "article-reels");

const parseArgs = (argv) => {
  const args = { limit: Infinity, force: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--limit") args.limit = Number(argv[++index]) || Infinity;
    else if (arg === "--slug") args.slug = argv[++index];
    else if (arg === "--force") args.force = true;
  }
  return args;
};

const reelPath = (slug) => path.join(REELS_OUT_DIR, `${slug}.mp4`);

const publishedAt = (frontmatter) =>
  Date.parse(frontmatter.pubDate ?? "") || 0;

const main = async () => {
  const args = parseArgs(process.argv.slice(2));

  if (args.slug) {
    if (!args.force && fs.existsSync(reelPath(args.slug))) {
      console.error(`${args.slug}: reel already exists (use --force to redo).`);
      return;
    }
    process.stdout.write(`${args.slug}\n`);
    return;
  }

  const entries = [];
  for (const slug of await listArticles()) {
    if (!args.force && fs.existsSync(reelPath(slug))) continue;
    const { frontmatter } = await readArticle(slug);
    entries.push({ slug, published: publishedAt(frontmatter) });
  }

  // Newest first, so a freshly published post always wins a limited slot.
  entries.sort((a, b) => b.published - a.published);

  const selected = entries.slice(0, args.limit);
  for (const entry of selected) {
    process.stdout.write(`${entry.slug}\n`);
  }

  console.error(
    `missing reels: ${entries.length}; rendering ${selected.length}` +
      (entries.length > selected.length ? ` (limit ${args.limit})` : "") +
      "; output dir: article-reels/",
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
