#!/usr/bin/env node
/**
 * Renders a reel (or a poster still) from an article.
 *
 *   node scripts/render-reel.mjs --slug <slug>      # one article
 *   node scripts/render-reel.mjs --latest           # newest article
 *   node scripts/render-reel.mjs --all              # every article
 *   node scripts/render-reel.mjs --latest --still   # PNG poster instead of MP4
 *   node scripts/render-reel.mjs --slug <slug> --from 0 --duration 8
 *
 * Props are rebuilt from the Markdown first, so a single command always renders
 * the current state of the article.
 */

import fs from "node:fs";
import path from "node:path";
import { buildForSlug, listArticles, newestSlug } from "./build-reel-props.mjs";
import {
  COMPOSITION_ID,
  FPS,
  REELS_ROOT,
  spawnRemotion,
} from "./lib/remotion-cli.mjs";

const OUT_DIR = path.join(REELS_ROOT, "out");
const GENERATED_DIR = path.join(REELS_ROOT, "src", "generated");

const parseArgs = (argv) => {
  const args = { frame: 45 };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--slug") args.slug = argv[++index];
    else if (arg === "--theme") args.theme = argv[++index];
    else if (arg === "--out") args.out = argv[++index];
    else if (arg === "--frame") args.frame = Number(argv[++index]);
    else if (arg === "--from") args.from = Number(argv[++index]);
    else if (arg === "--duration") args.duration = Number(argv[++index]);
    else if (arg === "--max-seconds") args.maxSeconds = Number(argv[++index]);
    else if (arg === "--concurrency") args.concurrency = argv[++index];
    else if (arg === "--latest") args.latest = true;
    else if (arg === "--all") args.all = true;
    else if (arg === "--still") args.still = true;
    else if (arg === "--quiet") args.quiet = true;
  }
  return args;
};

const renderSlug = async (slug, args) => {
  const { props, target, removedGlyphs } = await buildForSlug(
    slug,
    args.theme ?? undefined,
    { maxSeconds: args.maxSeconds },
  );

  await fs.promises.mkdir(OUT_DIR, { recursive: true });

  if (removedGlyphs?.length) {
    console.log(
      `  note: replaced ${removedGlyphs.length} unsafe glyph(s) so the render cannot crash.`,
    );
  }

  const extension = args.still ? "png" : "mp4";
  const outputPath = args.out
    ? path.resolve(process.cwd(), args.out)
    : path.join(OUT_DIR, `${slug}.${extension}`);

  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });

  const fullSeconds = props.durationInFrames / FPS;
  const clipNote = args.duration ? `${args.duration}s clip of ` : "";
  console.log(
    `\n> ${slug} (${props.scenes.length} scenes, ${clipNote}${fullSeconds.toFixed(1)}s full)`,
  );

  const cliArgs = [
    args.still ? "still" : "render",
    COMPOSITION_ID,
    outputPath,
    `--props=${target}`,
    args.still ? "--log=error" : "--log=info",
  ];

  if (args.still) cliArgs.push(`--frame=${args.frame}`);
  if (args.concurrency) cliArgs.push(`--concurrency=${args.concurrency}`);

  // Render only a slice of the reel (e.g. a short teaser clip).
  if (args.duration) {
    const start = Math.max(0, Math.round((args.from ?? 0) * FPS));
    const end = start + Math.round(args.duration * FPS) - 1;
    cliArgs.push(`--frames=${start}-${end}`);
  }

  await spawnRemotion({
    cliArgs,
    onLine: args.quiet ? undefined : (line) => console.log(line),
  });

  const size = fs.statSync(outputPath).size;
  console.log(
    `  done -> ${path.relative(process.cwd(), outputPath)} (${(size / 1024 / 1024).toFixed(2)} MB)`,
  );
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  await fs.promises.mkdir(GENERATED_DIR, { recursive: true });

  if (args.all) {
    for (const slug of await listArticles()) {
      await renderSlug(slug, args);
    }
    return;
  }

  const slug = args.latest ? await newestSlug() : args.slug;
  if (!slug) {
    throw new Error("Pass --slug <slug>, --latest or --all.");
  }

  await renderSlug(slug, args);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
