// See all configuration options: https://remotion.dev/docs/config
import { Config } from "@remotion/cli/config";
import { createRequire } from "node:module";

// Remotion compiles this file to CommonJS, so `import.meta` is not available.
// Resolve `@code-hike/lighter`'s ESM entry from the project root instead - the
// Remotion CLI is always invoked with the reels/ folder as the cwd (see
// scripts/render-reel.mjs).
const projectRequire = createRequire(`${process.cwd()}/package.json`);

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

Config.overrideRspackConfig((config) => {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "@code-hike/lighter": projectRequire.resolve(
          "@code-hike/lighter/dist/index.esm.mjs",
        ),
        https: false,
      },
    },
    ignoreWarnings: [
      ...(config.ignoreWarnings ?? []),
      /Critical dependency: the request of a dependency is an expression/,
    ],
  };
});
