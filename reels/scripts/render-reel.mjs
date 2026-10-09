#!/usr/bin/env node
/**
 * Renders a reel (or a poster still) from an article.
 *
 *   node scripts/render-reel.mjs --slug <slug>      # one article
 *   node scripts/render-reel.mjs --latest           # newest article
 *   node scripts/render-reel.mjs --all              # every article
 *   node scripts/render-reel.mjs --latest --still   # PNG poster instead of MP4
 *
 * Props are rebuilt from the Markdown first, so a single command always renders
 * the current state of the article.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildForSlug,
  listArticles,
  newestSlug,
} from "./build-reel-props.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const OUT_DIR = path.join(ROOT, "out");
const GENERATED_DIR = path.join(ROOT, "src", "generated");
const COMPOSITION = "Reel";

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
    else if (arg === "--concurrency") args.concurrency = argv[++index];
    else if (arg === "--latest") args.latest = true;
    else if (arg === "--all") args.all = true;
    else if (arg === "--still") args.still = true;
    else if (arg === "--quiet") args.quiet = true;
  }
  return args;
};

const remotionBin = () => {
  const local = path.join(ROOT, "node_modules", ".bin", "remotion");
  return fs.existsSync(local) ? local : "npx";
};

/**
 * Remotion keeps one ~8 MB shared-memory pool per concurrent tab. Containers
 * frequently mount a tiny /dev/shm (64 MB), which makes Chrome crash mid-render
 * with "target closed". When that is the case, fall back to Remotion's
 * file-backed pools in /tmp instead.
 */
const resolveShmBackend = () => {
  if (process.env.REMOTION_SHARED_MEMORY_BACKEND) {
    return process.env.REMOTION_SHARED_MEMORY_BACKEND;
  }
  try {
    const stats = fs.statfsSync("/dev/shm");
    const bytes = Number(stats.bsize) * Number(stats.blocks);
    if (bytes > 0 && bytes < 512 * 1024 * 1024) {
      return "file";
    }
  } catch {
    /* /dev/shm may not exist (macOS/Windows) - leave the default alone */
  }
  return undefined;
};

const runRemotion = ({ args, propsPath, outputPath, still, frame }) => {
  const bin = remotionBin();
  const command = still ? "still" : "render";
  const cliArgs = [
    command,
    COMPOSITION,
    outputPath,
    `--props=${propsPath}`,
    "--log=info",
  ];

  if (still) cliArgs.push(`--frame=${frame}`);

  // Render only a slice of the reel (e.g. a short teaser clip).
  const FPS = 30;
  if (args.duration) {
    const start = Math.max(0, Math.round((args.from ?? 0) * FPS));
    const end = start + Math.round(args.duration * FPS) - 1;
    cliArgs.push(`--frames=${start}-${end}`);
  }
  if (args.concurrency) cliArgs.push(`--concurrency=${args.concurrency}`);
  if (args.theme) cliArgs.push(`--props=${propsPath}`);

  const shmBackend = resolveShmBackend();

  const result = spawnSync(bin, cliArgs, {
    cwd: ROOT,
    stdio: "inherit",
    env: {
      ...process.env,
      ...(shmBackend ? { REMOTION_SHARED_MEMORY_BACKEND: shmBackend } : {}),
    },
  });

  if (result.status !== 0) {
    throw new Error(`Remotion ${command} failed with code ${result.status}`);
  }
};

const renderSlug = async (slug, args) => {
  const { props, target } = await buildForSlug(slug, args.theme ?? undefined);
  await fs.promises.mkdir(OUT_DIR, { recursive: true });

  const extension = args.still ? "png" : "mp4";
  const outputPath = args.out
    ? path.resolve(process.cwd(), args.out)
    : path.join(OUT_DIR, `${slug}.${extension}`);

  const fullSeconds = props.durationInFrames / 30;
  const clipSeconds = args.duration
    ? `${args.duration}s clip of `
    : "";
  console.log(
    `\n> ${slug} (${props.scenes.length} scenes, ${clipSeconds}${fullSeconds.toFixed(1)}s full)`,
  );

  runRemotion({
    args,
    propsPath: target,
    outputPath,
    still: args.still,
    frame: args.frame,
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
