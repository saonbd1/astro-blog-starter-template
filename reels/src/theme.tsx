import { getThemeColors } from "@code-hike/lighter";
import React from "react";
import { z } from "zod";

export type ThemeColors = Awaited<ReturnType<typeof getThemeColors>>;

/** Themes supported by `@code-hike/lighter` (used for the code scenes). */
export const themeSchema = z.enum([
  "dark-plus",
  "dracula-soft",
  "dracula",
  "github-dark",
  "github-dark-dimmed",
  "github-light",
  "light-plus",
  "material-darker",
  "material-default",
  "material-lighter",
  "material-ocean",
  "material-palenight",
  "min-dark",
  "min-light",
  "monokai",
  "nord",
  "one-dark-pro",
  "poimandres",
  "slack-dark",
  "slack-ochin",
  "solarized-dark",
  "solarized-light",
]);

export type Theme = z.infer<typeof themeSchema>;

export const ThemeColorsContext = React.createContext<ThemeColors | null>(null);

export const useThemeColors = () => {
  const themeColors = React.useContext(ThemeColorsContext);
  if (!themeColors) {
    throw new Error("ThemeColorsContext not found");
  }
  return themeColors;
};

export const ThemeProvider: React.FC<{
  readonly children: React.ReactNode;
  readonly themeColors: ThemeColors;
}> = ({ children, themeColors }) => {
  return (
    <ThemeColorsContext.Provider value={themeColors}>
      {children}
    </ThemeColorsContext.Provider>
  );
};
