# TechTips.fun — TODO

## Automate LinkedIn cross-posting (short version + link)
- [x] Manually shared today's article teaser via the connected LinkedIn session (2026-10-04)
- [ ] Next scheduled post should go out automatically via the workflow chain below (target: next `pending-posts/` publish)
- [x] `scripts/share-to-linkedin.mjs` — builds a teaser (title + truncated frontmatter `description`) with the article link + OG thumbnail and posts via the LinkedIn legacy `/v2/shares` API (owner URN = OpenID `sub`); supports `<slug>`, `--latest`, `--dry-run`
- [x] `.github/workflows/linkedin-share.yml` — auto-fires when a new post is added to `src/content/blog/` (so the scheduled-publish workflow triggers it) + manual dispatch by slug
- [x] Create a LinkedIn developer app with the "Share on LinkedIn" AND "Sign In with LinkedIn" products and get an OAuth token with the `openid profile w_member_social` scopes (done 2026-10-04; token expires ~2026-12-04)
- [x] Store the token locally — `~\.linkedin-credential.xml` (DPAPI-encrypted), auto-loaded into `$env:LINKEDIN_TOKEN` by PowerShell profiles
- [x] Add the token as the GitHub repository secret `LINKEDIN_TOKEN` on saonbd1/astro-blog-starter-template (set via `gh secret set`, confirmed in `gh secret list`)
- [x] Verify the token with one real test post (done 2026-10-04: published the ToC article teaser, activity `urn:li:activity:7512385216968028160`). Key finding: `/v2/ugcPosts` rejects `urn:li:person` URNs for apps created under a Company Page (422: author must match `urn:li:company:`|`urn:li:member:`), and member URNs need the legacy numeric member ID which OpenID no longer exposes — so we post via the legacy `/v2/shares` endpoint, which accepts `urn:li:person:{openid-sub}` with `w_member_social`
- [ ] Test end-to-end: add a post to `pending-posts/`, run the Schedule post publishing workflow, confirm the LinkedIn teaser appears
- [ ] Optional: make re-runs idempotent (e.g., a `.shared` marker per slug) so re-pushes don't double-post

## Social / SEO
- [ ] Re-scrape https://www.techtips.fun/blog/migrate-static-html-site-to-astro/ in the LinkedIn Post Inspector — the preview was cached before the OG image fix (OG tags verified correct on 2026-10-04)
- [ ] Add `socialImage` to the zod schema in `src/content.config.ts` (currently hardcoded as `/og/{slug}.png` in `src/pages/blog/[...slug].astro`; unknown keys are stripped by the schema)

## daily.dev
- [x] Installed `daily.dev` + `daily-dev-ask` agent skills and stored the API token (2026-10-04)
- [ ] Note: the daily.dev public API is read-only for content — sharing your own articles there is done via the Share button in the daily.dev extension/web app, not the API

## Maintenance
- [ ] Update skills later via `cd C:\Users\saonb\daily && git pull`, then re-copy the skill folders
