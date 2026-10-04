---
title: "Automate LinkedIn Posts from Your Blog with GitHub Actions"
description: "I cross-post every blog article to LinkedIn automatically with GitHub Actions and the LinkedIn API. Here is the free setup, plus the 422 error that broke it."
pubDate: "Oct 04 2026"
category: "Automation"
tags: ["LinkedIn", "GitHub Actions", "Automation", "API"]
---

<!-- SEO: title 58/60 chars, description 157/160 chars. Focus keyword: automate linkedin posts with github actions -->

I publish technical articles on techtips.fun. For months, every new post sat on the blog and went nowhere on LinkedIn, because cross-posting by hand was the bottleneck. Now each article publishes itself: one commit a day at 09:00 UTC, one teaser post on my profile, zero clicks.

## What the automation actually does

The chain has four links:

1. I drop a Markdown file into `pending-posts/` and list it in `pending-posts/.order`.
2. A scheduled GitHub Actions workflow (`schedule-posts.yml`) runs daily at 09:00 UTC, moves the next file into `src/content/blog/`, stamps the publish date, and pushes to main.
3. A second workflow (`linkedin-share.yml`) watches for new files under `src/content/blog/`, builds a teaser from the post's title and description, and posts it to LinkedIn with the article URL.
4. LinkedIn renders the link preview card from the article's OG tags, and the OG image is attached as the share thumbnail.

## Setting up the LinkedIn side

- Create an app in the LinkedIn Developer Portal and enable the **Sign In with LinkedIn** product.
- Request the `openid profile w_member_social` scopes. The `w_member_social` scope is what lets the app post to your own profile.
- Complete the OAuth flow once (a local redirect like `http://localhost` is fine for a personal project) and store the access token as a GitHub Actions secret named `LINKEDIN_TOKEN`.

## The 422 trap

The modern posting endpoint, `POST /v2/ugcPosts`, rejected every request I sent from this app with a 422 error whenever I used a `urn:li:person` URN. Apps created under a Company Page expect organization URNs there, and the legacy numeric member ID that `urn:li:member:` needs is no longer exposed by OpenID sign-in.

The fix was the older `POST /v2/shares` endpoint. It accepts `owner: urn:li:person:{sub}`, where `{sub}` is the `sub` claim from the `/v2/userinfo` response. My script resolves that URN dynamically, so the automation never hard-codes an identifier.

## What the post looks like

The teaser is plain text built from frontmatter: the title, a description truncated to about 250 characters, and the canonical URL. No AI generator, no scheduling SaaS, no monthly fee.

## What it costs

Nothing. The `w_member_social` scope is free. Paid "LinkedIn API" pricing applies to the Marketing Developer Platform and partner programs, not to posting your own content.

## FAQ

- **Can you automate LinkedIn posts for free?** Yes. GitHub Actions plus the `w_member_social` scope costs nothing beyond free Actions minutes.
- **Why did my LinkedIn API request fail with 422?** Most likely a URN mismatch: `ugcPosts` wants an organization URN for company-page apps, while `shares` accepts a person URN built from the OpenID `sub` claim.
- **Does LinkedIn allow automation?** Posting your own content through the official API is allowed. Engagement bait and third-party scraping tools are not.

> Automate the boring part. Writing the article is the job; shipping it to every channel should be a pull request.
