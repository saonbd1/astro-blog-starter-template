#!/usr/bin/env node
/**
 * Turns a TechTips.fun article (Markdown/MDX in ../src/content/blog) into the
 * fully-baked props for the `Reel` composition:
 *
 *   - scenes:   title -> key points / animated code -> outro
 *   - captions: a word-level track with real timings, so the TikTok-style
 *               caption overlay highlights the right word at the right time
 *   - code:     already highlighted with Code Hike (done here, in Node, so the
 *               composition stays a pure function of its props)
 *
 * Usage:
 *   node scripts/build-reel-props.mjs --slug <slug>
 *   node scripts/build-reel-props.mjs --latest
 *   node scripts/build-reel-props.mjs --all
 *   node scripts/build-reel-props.mjs --list
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { getThemeColors } from "@code-hike/lighter";
import { highlight } from "codehike/code";
import { sanitizeReelProps } from "./glyph-audit.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REELS_ROOT = path.resolve(HERE, "..");
const BLOG_DIR = path.resolve(REELS_ROOT, "..", "src", "content", "blog");
const GENERATED_DIR = path.resolve(REELS_ROOT, "src", "generated");

const SITE_URL = "https://www.techtips.fun";
const OUTRO_URL = "techtips.fun";

const FPS = 30;
const TITLE_FRAMES = 105;
const POINT_FRAMES = 120;
const CODE_STEP_FRAMES = 95;
const OUTRO_FRAMES = 105;
const MAX_SECTIONS = 6;
const DEFAULT_MAX_SECONDS = 58;
const MAX_CODE_BLOCKS_PER_SECTION = 2;
const MAX_CODE_LINES = 9;
const MAX_WORDS_PER_CAPTION_PAGE = 4;

const DEFAULT_THEME = "github-dark";

const parseFrontmatter = (source) => {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { data: {}, body: source };

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    let raw = line.slice(separator + 1).trim();
    if (!raw) continue;

    if (raw.startsWith("[")) {
      try {
        data[key] = JSON.parse(raw);
        continue;
      } catch {
        /* fall through */
      }
    }

    if (
      (raw.startsWith('"') && raw.endsWith('"')) ||
      (raw.startsWith("'") && raw.endsWith("'"))
    ) {
      raw = raw.slice(1, -1);
    }
    data[key] = raw;
  }

  return { data, body: source.slice(match[0].length) };
};

const stripInlineMarkdown = (value) =>
  value
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const stripListBullet = (value) => value.replace(/^([-*+]|\d+[.)])\s+/, "");
const stripHeadingNumber = (value) => value.replace(/^\d+[.)]\s*/, "");

/** Break the body into `##`/`###` sections, each with prose + fenced code. */
const parseSections = (body) => {
  const sections = [];
  let current = { heading: null, prose: [], code: [] };
  sections.push(current);

  let inFence = false;
  let fenceLang = "";
  let fenceLines = [];

  for (const line of body.split(/\r?\n/)) {
    const fence = line.match(/^```(.*)$/);

    if (!inFence && fence) {
      inFence = true;
      fenceLang = (fence[1].trim().split(/\s+/)[0] ?? "").trim();
      fenceLines = [];
      continue;
    }

    if (inFence) {
      if (/^```/.test(line)) {
        inFence = false;
        current.code.push({ lang: fenceLang, code: fenceLines.join("\n") });
      } else {
        fenceLines.push(line);
      }
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.*)$/);
    if (heading) {
      current = {
        heading: stripHeadingNumber(heading[2].trim()),
        prose: [],
        code: [],
      };
      sections.push(current);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^#\s/.test(trimmed)) continue;
    if (trimmed.startsWith("![") || trimmed.startsWith("<")) continue;
    if (trimmed.startsWith("|")) continue;

    if (trimmed.startsWith(">")) {
      current.prose.push(stripInlineMarkdown(trimmed.replace(/^>\s?/, "")));
      continue;
    }

    current.prose.push(stripInlineMarkdown(stripListBullet(trimmed)));
  }

  return sections;
};

/* --------------------------------------------------------------- transforms */

const firstSentenceOf = (text, maxChars = 190) => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (clean.length <= maxChars) return clean;

  const slice = clean.slice(0, maxChars);
  const stop = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("! "),
    slice.lastIndexOf("? "),
  );

  if (stop > 70) return slice.slice(0, stop + 1);
  return `${slice.slice(0, slice.lastIndexOf(" "))}\u2026`;
};

const trimCode = (code, maxLines = MAX_CODE_LINES) => {
  const lines = code.replace(/\t/g, "   ").split("\n");
  while (lines.length > 0 && !lines[0].trim()) lines.shift();
  while (lines.length > 0 && !lines[lines.length - 1].trim()) lines.pop();
  return lines.slice(0, maxLines).join("\n");
};

const narrationFor = (scene) => {
  switch (scene.type) {
    case "title":
      // The headline is already huge on screen - caption the subtitle instead of
      // repeating it.
      return scene.subtitle.replace(/\u2026$/, "");
    case "point":
      return `${scene.heading}. ${scene.body}`;
    case "code":
      return `${scene.heading}. Let us look at the code.`;
    case "outro":
      return `${scene.heading}. ${scene.body}`;
    default:
      return "";
  }
};

/**
 * Word-level captions with timings proportional to the scene durations, so the
 * highlight tracks what is on screen without needing an audio track.
 */
const buildCaptions = (scenes, wordsPerPage = MAX_WORDS_PER_CAPTION_PAGE) => {
  const captions = [];
  let cursorMs = 0;

  for (const scene of scenes) {
    const durationMs = (scene.durationInFrames / FPS) * 1000;
    const words = narrationFor(scene).split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      cursorMs += durationMs;
      continue;
    }

    const weights = words.map((word) => word.length + 3);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const usable = durationMs * 0.92;

    let cursor = cursorMs;
    words.forEach((word, index) => {
      const share = (weights[index] / totalWeight) * usable;
      const isLastWordOfScene = index === words.length - 1;
      const pageIsFull = (index + 1) % wordsPerPage === 0;
      captions.push({
        // Whisper-style leading space: createTikTokStyleCaptions only starts a
        // new caption page when the incoming token begins with a space.
        text: ` ${word}`,
        startMs: Math.round(cursor),
        endMs: Math.round(cursor + share),
        // Force a page flush every few words (so text-heavy scenes don't produce
        // one giant line) and never let a page bleed into the next scene.
        ...(isLastWordOfScene || pageIsFull ? { pageBreakAfter: true } : {}),
  });
      cursor += share;
    });

    cursorMs += durationMs;
  }

  return captions;
};

/* ------------------------------------------------------------- props builder */

const buildScenes = (frontmatter, sections, options) => {
  const scenes = [];
  const category = frontmatter.category || "Tech";

  scenes.push({
    type: "title",
    kicker: category,
    title: frontmatter.title || "Untitled",
    subtitle: firstSentenceOf(frontmatter.description || "", 90) || "TechTips.fun",
    durationInFrames: TITLE_FRAMES,
  });

  let total = TITLE_FRAMES;

  for (const section of sections) {
    if (scenes.length - 1 >= options.maxSections) break;
    if (total + CODE_STEP_FRAMES + OUTRO_FRAMES > options.maxTotalFrames) break;
    if (!section.heading) continue;

    const codeBlocks = section.code
      .map((block) => ({ lang: block.lang || "text", code: trimCode(block.code) }))
      .filter((block) => block.code.trim().length > 0)
      .slice(0, MAX_CODE_BLOCKS_PER_SECTION);

    if (codeBlocks.length > 0) {
      const duration = codeBlocks.length * CODE_STEP_FRAMES;
      scenes.push({
        type: "code",
        kicker: "Code",
        heading: section.heading,
        steps: codeBlocks.map((block) => ({
          lang: block.lang,
          code: block.code,
          ...(block.lang && block.lang !== "text" ? { label: block.lang } : {}),
        })),
        durationInFrames: duration,
  });
      total += duration;
      continue;
    }

    const prose = firstSentenceOf(section.prose.join(" "), 150);
    if (prose.length < 40) continue;

    scenes.push({
      type: "point",
      kicker: category,
      heading: section.heading,
      body: prose,
      durationInFrames: POINT_FRAMES,
    });
    total += POINT_FRAMES;
  }

  scenes.push({
    type: "outro",
    heading: "Read the full article",
    body: "New posts every week on the blog.",
    url: options.outroUrl,
    durationInFrames: OUTRO_FRAMES,
  });

  return scenes;
};

const highlightScenes = async (scenes, theme) =>
  Promise.all(
    scenes.map(async (scene) => {
      if (scene.type !== "code") return scene;

      const steps = await Promise.all(
        scene.steps.map(async (step) => {
          const meta = step.label ?? "";
          try {
            return await highlight(
              { lang: step.lang, meta, value: step.code },
              theme,
            );
          } catch {
            return await highlight(
              { lang: "text", meta, value: step.code },
              theme,
            );
          }
        }),
      );

      return { ...scene, steps };
    }),
  );

export const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "pasted-article";

/**
 * Pasted Markdown often has no frontmatter at all. Fall back to the first H1 and
 * the first paragraph so the GUI works with a raw article dump.
 */
const deriveFrontmatter = (body, fallbackTitle) => {
  let title = "";
  let description = "";

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const h1 = line.match(/^#\s+(.*)$/);
    if (h1) {
      if (!title) title = stripInlineMarkdown(h1[1]);
      continue;
    }

    if (!title || description) continue;
    if (
      line.startsWith("#") ||
      line.startsWith("![") ||
      line.startsWith("```") ||
      line.startsWith(">") ||
      line.startsWith("|")
    ) {
      continue;
    }

    description = stripInlineMarkdown(stripListBullet(line));
    break;
  }

  return {
    title: title || fallbackTitle || "Pasted article",
    description,
    category: "Tech",
    tags: [],
  };
};

/**
 * The single entry point shared by the CLI and the GUI: Markdown text in,
 * fully-baked (and safely sanitised) props out.
 */
export const buildReelPropsFromMarkdown = async ({
  slug,
  markdown,
  theme = DEFAULT_THEME,
  maxSeconds = DEFAULT_MAX_SECONDS,
  url,
  wordsPerPage = MAX_WORDS_PER_CAPTION_PAGE,
}) => {
  const parsed = parseFrontmatter(markdown);
  const derived = deriveFrontmatter(parsed.body, slug);
  const frontmatter = { ...derived, ...parsed.data };

  for (const key of Object.keys(derived)) {
    if (
      frontmatter[key] === undefined ||
      frontmatter[key] === "" ||
      (Array.isArray(frontmatter[key]) && frontmatter[key].length === 0)
    ) {
      frontmatter[key] = derived[key];
    }
  }

  const resolvedSlug = slug || slugify(frontmatter.title);
  const sections = parseSections(parsed.body);
  const rawScenes = buildScenes(frontmatter, sections, {
    maxSections: MAX_SECTIONS,
    maxTotalFrames: Math.max(
      TITLE_FRAMES + OUTRO_FRAMES,
      Math.round(maxSeconds * FPS),
    ),
    outroUrl: OUTRO_URL,
  });

  const { props: safe, removed } = sanitizeReelProps({
    slug: resolvedSlug,
    title: frontmatter.title,
    description: frontmatter.description,
    category: frontmatter.category,
    tags: frontmatter.tags,
    url: url || `${SITE_URL}/blog/${resolvedSlug}/`,
    scenes: rawScenes,
  });

  const highlighted = await highlightScenes(safe.scenes, theme);
  const durationInFrames = highlighted.reduce(
    (sum, scene) => sum + scene.durationInFrames,
    0,
  );
  const themeColors = await getThemeColors(theme);

  return {
    props: {
      ...safe,
      theme,
      durationInFrames,
      scenes: highlighted,
      captions: buildCaptions(highlighted, wordsPerPage),
      themeColors,
    },
    removedGlyphs: removed,
  };
};

/* -------------------------------------------------------------------- driver */

export const listArticles = async () => {
  const files = await fs.readdir(BLOG_DIR);
  return files
    .filter((file) => /\.(md|mdx)$/i.test(file))
    .map((file) => file.replace(/\.(md|mdx)$/i, ""))
    .sort();
};

export const readArticle = async (slug) => {
  for (const extension of [".md", ".mdx"]) {
    const filePath = path.join(BLOG_DIR, `${slug}${extension}`);
    try {
      const source = await fs.readFile(filePath, "utf8");
      const { data, body } = parseFrontmatter(source);
      return { frontmatter: data, body, source };
    } catch {
      /* try the next extension */
    }
  }
  throw new Error(`Article not found for slug "${slug}" in ${BLOG_DIR}`);
};

export const newestSlug = async () => {
  const slugs = await listArticles();
  let best = { slug: null, time: -Infinity };

  for (const slug of slugs) {
    const { frontmatter } = await readArticle(slug);
    const time = Date.parse(frontmatter.pubDate ?? "") || 0;
    if (time > best.time) best = { slug, time };
  }

  if (!best.slug) throw new Error("No articles found.");
  return best.slug;
};

const writeProps = async (props) => {
  await fs.mkdir(GENERATED_DIR, { recursive: true });
  const target = path.join(GENERATED_DIR, `${props.slug}.json`);
  await fs.writeFile(target, `${JSON.stringify(props, null, 2)}\n`);
  await fs.writeFile(
    path.join(GENERATED_DIR, "latest.json"),
    `${JSON.stringify(props, null, 2)}\n`,
  );
  return target;
};

export const describeRemovedGlyphs = (removedGlyphs) => {
  if (!removedGlyphs || removedGlyphs.length === 0) return null;
  return removedGlyphs
    .map((item) => `"${item.char}" (${item.code}) x${item.count}`)
    .join(", ");
};

export const buildForSlug = async (slug, theme = DEFAULT_THEME, options = {}) => {
  const { source } = await readArticle(slug);
  const { props, removedGlyphs } = await buildReelPropsFromMarkdown({
    slug,
    markdown: source,
    theme,
    ...options,
  });

  const removedNote = describeRemovedGlyphs(removedGlyphs);
  if (removedNote) {
    console.warn(`  ! ${slug}: replaced non-Latin glyphs: ${removedNote}`);
  }

  const target = await writeProps(props);
  return { props, target, removedGlyphs };
};

const parseArgs = (argv) => {
  const args = { theme: DEFAULT_THEME };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--slug") args.slug = argv[++index];
    else if (arg === "--max-seconds") args.maxSeconds = Number(argv[++index]);
    else if (arg === "--theme") args.theme = argv[++index];
    else if (arg === "--latest") args.latest = true;
    else if (arg === "--all") args.all = true;
    else if (arg === "--list") args.list = true;
  }
  return args;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));

  if (args.list) {
    console.log((await listArticles()).join("\n"));
    return;
  }

  if (args.all) {
    for (const slug of await listArticles()) {
      const { props, target } = await buildForSlug(slug, args.theme, {
    maxSeconds: args.maxSeconds,
  });
      const seconds = (props.durationInFrames / FPS).toFixed(1);
      console.log(
        `${slug}: ${props.scenes.length} scenes, ${seconds}s -> ${path.relative(process.cwd(), target)}`,
      );
    }
    // Leave latest.json pointing at the newest article, not whichever slug
    // happened to sort last.
    await buildForSlug(await newestSlug(), args.theme, {
      maxSeconds: args.maxSeconds,
    });
    return;
  }

  const slug = args.latest ? await newestSlug() : args.slug;
  if (!slug) {
    throw new Error(
      "Pass --slug <slug>, --latest, --all or --list. See `npm run props -- --list`.",
    );
  }

  const { props, target } = await buildForSlug(slug, args.theme, {
    maxSeconds: args.maxSeconds,
  });
  const seconds = (props.durationInFrames / FPS).toFixed(1);
  console.log(
    `${slug}: ${props.scenes.length} scenes, ${props.captions.length} caption words, ${seconds}s -> ${path.relative(process.cwd(), target)}`,
  );
};

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
