# article-reels

Vertical 1080x1920 reels, one MP4 per published article, generated
automatically by the **Generate article reels** workflow
([source](../reels/ci/article-reels.yml) — install it with
`git mv reels/ci/article-reels.yml .github/workflows/` before the first run).

- File name is the article slug: `article-reels/<slug>.mp4`.
- Produced from the Markdown in `src/content/blog/` - no extra input needed, so
  re-running the workflow regenerates the same video from the same article.
- The newest article is always rendered first; automatic runs are capped so a
  large backfill cannot run for hours. Automatic runs render at most 3 reels
  per run; manual runs choose their own `max`.

## Triggering it

It runs by itself when a post is published:

- when a commit adds a file under `src/content/blog/` (a normal push), and
- when the **Schedule post publishing** workflow finishes (scheduled publishes
  are pushed with `GITHUB_TOKEN`, which does not fire `push` events - hence the
  second trigger).

Manual runs (Actions -> Generate article reels -> Run workflow):

| Input | Effect |
| --- | --- |
| `slug` | Render just that one article |
| `max` | How many missing reels to render in this run (default 5) |
| `force` | Re-render even if a reel already exists |

To backfill everything at once, run it manually with `max: 100`.

## Rendering locally instead

```bash
cd reels
npm run reel -- --latest                                   # newest article
node scripts/render-reel.mjs --slug <slug> --out "$PWD/../article-reels/<slug>.mp4"
node scripts/list-missing-reels.mjs --limit 5              # what the workflow would pick
```

See [`reels/README.md`](../reels/README.md) for the pipeline, or run the GUI
with `npm run gui`.

## Repo size

Each reel is roughly 1-3 MB. GitHub blocks files over 100 MB and warns once a
repo passes ~1 GB, so this is fine for years of posts; if it ever matters,
switch the workflow to artifacts only, or move this folder to Git LFS.
