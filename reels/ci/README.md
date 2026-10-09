# reels/ci

## `article-reels.yml`

This is the **Generate article reels** workflow. Its real home is
`.github/workflows/article-reels.yml`.

It lives here because the tool that generated it could not write into
`.github/workflows/` \u2014 that path requires a token with the `workflows`
permission, and the available credential only has `contents`. Committing it
yourself takes one command:

```bash
mkdir -p .github/workflows
git mv reels/ci/article-reels.yml .github/workflows/article-reels.yml
git commit -m "ci: install the article-reels workflow"
git push
```

Then check it appears under **Actions → Generate article reels**, and run it
once with `max: 100` to backfill reels for the posts that predate it.

Why it has three triggers, how it decides what to render, and how to render
locally instead are all documented at the top of the workflow file and in
[`../../article-reels/README.md`](../../article-reels/README.md).
