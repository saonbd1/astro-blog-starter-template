/**
 * Guard against a nasty renderer crash.
 *
 * We only load the "latin" Google Fonts subset. If a headline or a code block
 * contains a glyph outside of it, Chromium falls back to a system font - and in
 * a container with no fonts installed that fallback kills the whole renderer
 * process ("Protocol error (Runtime.callFunctionOn): Target closed").
 *
 * We hit this for real with "\u2192" in the outro scene. So every build now
 * detects risky characters, and can optionally strip them so a render can never
 * die on a stray emoji someone pasted into an article.
 */

// ASCII + Latin-1/Extended + the common typographic punctuation we do use
// (curly quotes, en/em dash, ellipsis), which the latin subset does include.
const SAFE_GLYPH = /[\t\n\r\x20-\x7E\u00A0-\u024F\u2010-\u205E\u20AC\u2122]/;

const codePointLabel = (char) =>
  `U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;

/** All the strings a reel can put on screen. */
const collectStrings = (props) => {
  const out = [];
  const push = (value) => {
    if (typeof value === "string") out.push(value);
  };

  push(props.title);
  push(props.description);
  push(props.category);
  push(props.url);
  if (Array.isArray(props.tags)) props.tags.forEach(push);
  if (Array.isArray(props.captions)) {
    props.captions.forEach((caption) => push(caption.text));
  }

  for (const scene of props.scenes ?? []) {
    push(scene.kicker);
    push(scene.heading);
    if (scene.type === "title") {
      push(scene.title);
      push(scene.subtitle);
    }
    if (scene.type === "point") push(scene.body);
    if (scene.type === "outro") {
      push(scene.body);
      push(scene.url);
    }
    if (scene.type === "code") {
      (scene.steps ?? []).forEach((step) => push(step.code));
    }
  }

  return out;
};

/** Map of offending character -> { code, count }. */
export const auditGlyphs = (props) => {
  const offenders = new Map();

  for (const text of collectStrings(props)) {
    for (const char of text) {
      if (SAFE_GLYPH.test(char)) continue;
      const existing = offenders.get(char);
      if (existing) existing.count += 1;
      else offenders.set(char, { code: codePointLabel(char), count: 1 });
    }
  }

  return offenders;
};

/** Plain-text version of the audit, for API responses. */
export const describeGlyphs = (offenders) =>
  [...offenders.entries()].map(([char, meta]) => ({
    char,
    code: meta.code,
    count: meta.count,
  }));

const sanitizeText = (value, offenders) =>
  [...value]
    .map((char) => {
      if (SAFE_GLYPH.test(char)) return char;
      const existing = offenders.get(char);
      if (existing) existing.count += 1;
      else offenders.set(char, { code: codePointLabel(char), count: 1 });
      return " "; // replace, never drop words silently into each other
    })
    .join("");

/**
 * Returns a copy of the props with every risky glyph replaced by a space, plus
 * a list of what was replaced. Run this BEFORE highlighting the code, so the
 * highlighted tokens never contain a glyph that can crash Chromium.
 */
export const sanitizeReelProps = (props) => {
  const offenders = new Map();
  const clean = (value) =>
    typeof value === "string" ? sanitizeText(value, offenders) : value;

  const scenes = (props.scenes ?? []).map((scene) => {
    const next = { ...scene };
    for (const key of ["kicker", "heading", "title", "subtitle", "body", "url"]) {
      if (typeof next[key] === "string") next[key] = clean(next[key]);
    }
    if (Array.isArray(next.steps)) {
      next.steps = next.steps.map((step) => ({ ...step, code: clean(step.code) }));
    }
    return next;
  });

  const sanitized = {
    ...props,
    title: clean(props.title),
    description: clean(props.description),
    category: clean(props.category),
    url: clean(props.url),
    tags: Array.isArray(props.tags) ? props.tags.map(clean) : props.tags,
    scenes,
  };

  sanitized.title = sanitized.title.replace(/\s{2,}/g, " ").trim();
  sanitized.category = sanitized.category.trim() || "Tech";

  return { props: sanitized, removed: describeGlyphs(offenders) };
};

export const warnAboutGlyphs = (props) => {
  const offenders = auditGlyphs(props);
  if (offenders.size === 0) return;

  const list = [...offenders.entries()]
    .map(([char, meta]) => `"${char}" (${meta.code})`)
    .join(", ");

  console.warn(
    `  ! ${props.slug}: non-Latin glyphs found: ${list}`,
    "\n    The latin webfont subset may not cover these, and Chromium font" +
      "\n    fallback can crash the renderer in a fontless container. Prefer ASCII," +
      "\n    or draw the symbol as inline SVG (see src/scenes/OutroScene.tsx).",
  );
};
