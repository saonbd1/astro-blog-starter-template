/** Split a sentence into words, ignoring extra whitespace. */
export const wordsOf = (text: string): string[] =>
  text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

/**
 * Greedy word wrap. Deterministic (no font measurement) which keeps renders
 * reproducible and works identically in Node and the browser.
 */
export const wrapText = (text: string, maxCharsPerLine: number): string[] => {
  const words = wordsOf(text);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && candidate.length > maxCharsPerLine) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines.length > 0 ? lines : [""];
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** Pick a display font size so a wrapped headline fills the frame nicely. */
export const headlineFontSize = (
  lines: number,
  { max = 104, min = 56 }: { max?: number; min?: number } = {},
): number => {
  if (lines <= 2) return max;
  if (lines === 3) return Math.round(max * 0.84);
  if (lines === 4) return Math.round(max * 0.72);
  return Math.max(min, Math.round(max * 0.6));
};

/** Trim a description down to a single punchy sentence for captions. */
export const firstSentence = (text: string, maxChars = 180): string => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;

  const slice = clean.slice(0, maxChars);
  const lastStop = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("! "),
    slice.lastIndexOf("? "),
  );

  if (lastStop > 60) return slice.slice(0, lastStop + 1);
  return `${slice.slice(0, slice.lastIndexOf(" "))}…`;
};
