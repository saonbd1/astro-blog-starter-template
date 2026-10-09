/**
 * Guard against a nasty renderer crash.
 *
 * We only load the "latin" Google Fonts subset. If a headline or a code block
 * contains a glyph outside of it, Chromium falls back to a system font - and in
 * a container with no fonts installed that fallback kills the whole renderer
 * process ("Protocol error (Runtime.callFunctionOn): Target closed").
 *
 * We hit this for real with "\u2192" in the outro scene, so every build now
 * warns about characters that might not be covered.
 */

// ASCII + Latin-1/Extended + the common typographic punctuation we do use
// (curly quotes, en/em dash, ellipsis), which the latin subset does include.
const SAFE_GLYPH = /[\t\n\r\x20-\x7E\u00A0-\u024F\u2010-\u205E\u20AC\u2122]/;

const collectStrings = (props) => {
  const out = [];
  const push = (value) => {
    if (typeof value === "string") out.push(value);
  };

  push(props.title);
  push(props.description);
  push(props.category);
  push(props.url);
  props.tags.forEach(push);
  props.captions.forEach((caption) => push(caption.text));

  for (const scene of props.scenes) {
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
      scene.steps.forEach((step) => push(step.code));
    }
  }

  return out;
};

export const auditGlyphs = (props) => {
  const offenders = new Map();

  for (const text of collectStrings(props)) {
    for (const char of text) {
      if (SAFE_GLYPH.test(char)) continue;
      const code = char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
      offenders.set(char, code);
    }
  }

  return offenders;
};

export const warnAboutGlyphs = (props) => {
  const offenders = auditGlyphs(props);
  if (offenders.size === 0) return;

  const list = [...offenders.entries()]
    .map(([char, code]) => `"${char}" (U+${code})`)
    .join(", ");

  console.warn(
    `  ! ${props.slug}: non-Latin glyphs found: ${list}`,
    "\n    The latin webfont subset may not cover these, and Chromium font" +
      "\n    fallback can crash the renderer in a fontless container. Prefer ASCII," +
      "\n    or draw the symbol as inline SVG (see src/scenes/OutroScene.tsx).",
  );
};
