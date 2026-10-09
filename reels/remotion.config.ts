// See all configuration options: https://remotion.dev/docs/config
import { Config } from "@remotion/cli/config";
import { createRequire } from "node:module";

// Resolve `@code-hike/lighter`'s ESM entry from THIS project (not the cwd),
// so `remotion studio` / `remotion render` behave the same regardless of where
// they are invoked from.
const projectRequire = createRequire(import.meta.url);

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(null);

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
