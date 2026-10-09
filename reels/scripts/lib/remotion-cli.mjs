/**
 * Thin wrapper around the Remotion CLI.
 *
 * We deliberately shell out to the CLI (rather than using the Node bundler
 * APIs) because the CLI honours `remotion.config.ts` - including the
 * `@code-hike/lighter` alias that the Code Hike template needs. It also keeps
 * one code path shared by the CLI scripts and the GUI server.
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REELS_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

export const COMPOSITION_ID = "Reel";
export const FPS = 30;

/**
 * Remotion keeps one ~8 MB shared-memory pool per concurrent tab. Containers
 * frequently mount a tiny /dev/shm (64 MB), which makes Chrome crash mid-render
 * with "target closed". When that is the case, fall back to Remotion's
 * file-backed pools in /tmp instead.
 */
export const resolveShmBackend = () => {
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

export const remotionBin = () => {
  const local = path.join(REELS_ROOT, "node_modules", ".bin", "remotion");
  return fs.existsSync(local) ? local : "npx";
};

/**
 * Runs the Remotion CLI and streams its output line by line.
 * Resolves on exit code 0, rejects otherwise.
 */
export const spawnRemotion = ({ cliArgs, onLine, cwd = REELS_ROOT }) => {
  const shmBackend = resolveShmBackend();

  return new Promise((resolve, reject) => {
    const child = spawn(remotionBin(), cliArgs, {
      cwd,
      env: {
        ...process.env,
        ...(shmBackend ? { REMOTION_SHARED_MEMORY_BACKEND: shmBackend } : {}),
      },
    });

    let buffer = "";
    const handle = (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split(/[\r\n]+/);
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && onLine) onLine(trimmed);
      }
    };

    child.stdout.on("data", handle);
    child.stderr.on("data", handle);
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Remotion exited with code ${code}`));
    });
  });
};

/**
 * Turns Remotion's human-readable output into a single 0-100 progress number
 * plus a label for the UI.
 */
export const createProgressParser = () => {
  let bundling = 0;
  let rendered = 0;
  let total = 0;
  let encoding = 0;

  return {
    parse(line) {
      const bundle = line.match(/Bundling (\d+)%/);
      if (bundle) bundling = Number(bundle[1]);

      const render = line.match(/Rendered (\d+)\/(\d+)/);
      if (render) {
        rendered = Number(render[1]);
        total = Number(render[2]);
      }

      const encode = line.match(/Encoded (\d+)\/(\d+)/);
      if (encode) {
        encoding =
          Number(encode[2]) === 0 ? 0 : Number(encode[1]) / Number(encode[2]);
      }

      return this.snapshot();
    },
    snapshot() {
      if (total === 0) {
        return { percent: Math.round((bundling / 100) * 15), label: "Bundling" };
      }
      const renderRatio = rendered / total;
      if (renderRatio < 1) {
        return {
          percent: Math.round(15 + renderRatio * 70),
          label: `Rendering ${rendered}/${total}`,
        };
      }
      return {
        percent: Math.round(85 + Math.min(1, encoding) * 15),
        label: "Encoding",
      };
    },
  };
};
