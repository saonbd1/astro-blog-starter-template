import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadRobotoMono } from "@remotion/google-fonts/RobotoMono";

// UI / caption font.
const inter = loadInter("normal", {
  weights: ["400", "600", "800", "900"],
  subsets: ["latin"],
});

// Code font.
const mono = loadRobotoMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

export const uiFontFamily = inter.fontFamily;
export const codeFontFamily = mono.fontFamily;

export const codeFontSize = 34;
export const codeTabSize = 3;
export const codeHorizontalPadding = 48;
export const codeVerticalPadding = 64;

export const waitForFonts = async () => {
  await Promise.all([inter.waitUntilDone(), mono.waitUntilDone()]);
};
