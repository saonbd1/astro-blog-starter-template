---
title: "Automate LinkedIn Posts from Your Blog with GitHub Actions"
description: "I cross-post every blog article to LinkedIn automatically with GitHub Actions and the LinkedIn API. Here is the free setup, plus the 422 error that broke it."
pubDate: "Oct 05 2026"
heroImage: "/coder-desk.webp"
category: "Automation"
tags: ["LinkedIn", "GitHub Actions", "Automation", "API"]
---

<!-- SEO: title 58/60 chars, description 157/160 chars. Focus keyword: automate linkedin posts with github actions -->

I publish technical articles on techtips.fun. For months, every new post sat on the blog and went nowhere on LinkedIn, because cross-posting by hand was the bottleneck. Now each article publishes itself: one commit a day at 09:00 UTC, one teaser post on my profile, zero clicks.

## What the automation actually does

The chain has four links:

```
pending-posts/.order
       |  (daily, 09:00 UTC)
schedule-posts.yml  ->  move file to src/content/blog/, stamp pubDate, push
       |  (on push)
linkedin-share.yml  ->  build teaser from frontmatter, post to LinkedIn
       |
LinkedIn post: title + excerpt + link, OG image as thumbnail
```

1. I drop a Markdown file into `pending-posts/` and list it in `pending-posts/.order`.
2. A scheduled GitHub Actions workflow (`schedule-posts.yml`) runs daily at 09:00 UTC, moves the next file into `src/content/blog/`, stamps the publish date, and pushes to main.
3. A second workflow (`linkedin-share.yml`) watches for new files under `src/content/blog/`, builds a teaser from the post's title and description, and posts it to LinkedIn with the article URL.
4. LinkedIn renders the link preview card from the article's OG tags, and the OG image is attached as the share thumbnail.

## What it costs

Nothing. The `w_member_social` scope is free, and GitHub Actions minutes are free for public repos. The paid "LinkedIn API" pricing you see quoted applies to the Marketing Developer Platform and partner programs for agencies running campaigns at scale — not to posting your own content.

## Setting up the LinkedIn side

- Create an app in the LinkedIn Developer Portal and enable the **Sign In with LinkedIn** product (see my [LinkedIn OAuth client setup guide](/blog/how-to-set-up-linkedin-oauth-client/) for the full walkthrough).
- Request the `openid profile w_member_social` scopes. The `w_member_social` scope is what lets the app post to your own profile.
- Complete the OAuth flow once (a local redirect like `http://localhost` is fine for a personal project) and store the access token as a GitHub Actions secret named `LINKEDIN_TOKEN`.

## The 422 trap

The modern posting endpoint, `POST /v2/ugcPosts`, rejected every request I sent from this app with a 422 error whenever I used a `urn:li:person` URN. Apps created under a Company Page expect organization URNs there, and the legacy numeric member ID that `urn:li:member:` needs is no longer exposed by OpenID sign-in — the `sub` claim is a new-format identifier, so the member URN route is a dead end.

The fix was the older `POST /v2/shares` endpoint — deprecated on paper, still working. It accepts `owner: urn:li:person:{sub}`, where `{sub}` is the `sub` claim from the `/v2/userinfo` response. My script resolves that URN dynamically at runtime, so the automation never hard-codes an identifier.

If LinkedIn retires `shares`, my fallback is to post as `urn:li:organization` with the `w_organization_social` scope.

## Why teasers from frontmatter, not AI

"Content repurposing AI" tools promise to rewrite everything. My posts are technical. The title and description in the frontmatter are already the pitch — the automation just moves them. Fewer moving parts, no hallucinated claims, and the teaser always matches the article.

## The thumbnail problem

Each article has an OG card at `/og/{slug}.png` (1200×630), which the share script attaches as the thumbnail. Skip this step and your post still goes out — it just loses the image that earns the click.

## The tools

- **Astro** (63k+ GitHub stars) — the blog framework. Content collections validate the frontmatter the script reads.
- **GitHub Actions** — the scheduler and the trigger, free for public repos.
- **n8n** (206k stars) — the popular GUI alternative if you prefer nodes over YAML. I chose YAML because it lives in the repo with the content.

## What I will not automate

Engagement bait, auto-replies, and scraping. LinkedIn's automation rules allow posting your own content through the API; they do not allow fake engagement. The pipeline shares what I wrote, nothing more.

## FAQ

- **Can you automate LinkedIn posts for free?** Yes. GitHub Actions plus the `w_member_social` scope costs nothing beyond free Actions minutes.
- **Why did my LinkedIn API request fail with 422?** Most likely a URN mismatch: `ugcPosts` wants an organization URN for company-page apps, while `shares` accepts a person URN built from the OpenID `sub` claim.
- **Does LinkedIn allow automation?** Posting your own content through the official API is allowed. Engagement bait and third-party scraping tools are not.
- **Does this need an AI tool?** No. Frontmatter-driven teasers are deterministic and always on-topic.
- **Is the LinkedIn API free?** Posting to your own profile is free. The paid tier is the Marketing Developer Platform.

> Automate the boring part. Writing the article is the job; shipping it to every channel should be a pull request.
