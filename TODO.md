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
- [ ] Test end-to-end: first scheduled publish (2026-10-05 09:00 UTC) should auto-fire the LinkedIn teaser — 3 articles already staged in `pending-posts/` with branded OG cards in `public/og/`
- [ ] Optional: make re-runs idempotent (e.g., a `.shared` marker per slug) so re-pushes don't double-post
- [ ] Optional: 60s sleep in `schedule-posts.yml` before the LinkedIn workflow triggers (Cloudflare Git deploy race)
- [x] Rotate the LinkedIn client secret after it appeared in chat (done 2026-10-04: regenerated in the Developer Portal, old secret invalidated; new value stored as GitHub secret `LINKEDIN_CLIENT_SECRET` via `gh secret set --repo`; access token `LINKEDIN_TOKEN` unaffected — client-secret rotation does not invalidate existing tokens, so posting continues to ~2026-12-04; the secret is only needed for the OAuth token exchange at the next re-authorization)

## Social / SEO
- [ ] Re-scrape https://www.techtips.fun/blog/migrate-static-html-site-to-astro/ in the LinkedIn Post Inspector — the preview was cached before the OG image fix (OG tags verified correct on 2026-10-04)
- [ ] Add `socialImage` to the zod schema in `src/content.config.ts` (currently hardcoded as `/og/{slug}.png` in `src/pages/blog/[...slug].astro`; unknown keys are stripped by the schema)

## Articles & identity (2026-10-04)
- [x] 3 LinkedIn articles staged in `pending-posts/` (merged from 3 thin drafts): the expanded automation guide + a new LinkedIn OAuth client setup article (sibling to the Google OAuth for Blogger post, published a day earlier so the automation guide can link to it) + a Netlify vs Vercel email-experience comparison (4 signed manuscdn screenshot URLs downloaded locally before their 2026-12-01 expiry and rewritten to `public/article-media/`)
- [x] Branded OG cards for all 3 staged posts generated with the repo's own `npm run generate:assets` (placeholder hero fallback, author portrait)
- [x] `kamrul-digital-expert` identity skill saved to `C:\Users\saonb\.cline\skills\kamrul-digital-expert\` (SKILL.md + references/bio.md) — recovered from a corrupt zip, broken paths fixed, voice rules + length-verified platform templates added, bio de-exaggerated (stats verified via live API: Astro 63,031★ / n8n 206,599★)
- [ ] Optional: append author byline (E-E-A-T) to the 3 staged posts — draft ready, awaiting approval

## daily.dev
- [x] Installed `daily.dev` + `daily-dev-ask` agent skills and stored the API token (2026-10-04)
- [ ] Note: the daily.dev public API is read-only for content — sharing your own articles there is done via the Share button in the daily.dev extension/web app, not the API

## Maintenance
- [ ] Update skills later via `cd C:\Users\saonb\daily && git pull`, then re-copy the skill folders
