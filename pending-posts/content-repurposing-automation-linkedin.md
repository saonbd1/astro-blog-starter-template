---
title: "Content Repurposing Automation: One Post, One LinkedIn Post"
description: "Every article on my blog now ships with a LinkedIn teaser automatically. Here is the content repurposing automation pipeline I built with GitHub Actions."
pubDate: "Oct 04 2026"
category: "Automation"
tags: ["Content Repurposing", "LinkedIn", "GitHub Actions", "Astro"]
---

<!-- SEO: title 59/60 chars, description 153/160 chars. Focus keyword: content repurposing automation linkedin -->

Writing an article used to take me an afternoon. Publishing it everywhere took another hour I did not have. Content repurposing automation fixed the second half: every post on techtips.fun now appears on LinkedIn the same day, without me lifting a finger.

## The pipeline

```
pending-posts/.order
       |  (daily, 09:00 UTC)
schedule-posts.yml  ->  move file to src/content/blog/, stamp pubDate, push
       |  (on push)
linkedin-share.yml  ->  build teaser from frontmatter, post to LinkedIn
       |
LinkedIn post: title + excerpt + link, OG image as thumbnail
```

## Why I generate teasers from frontmatter, not AI

"Content repurposing AI" tools promise to rewrite everything. My posts are technical. The title and description in the frontmatter are already the pitch — the automation just moves them. Fewer moving parts, no hallucinated claims, and the teaser always matches the article.

## The thumbnail problem

LinkedIn renders link previews from OG tags. Each article has an OG card at `/og/{slug}.png` (1200x630), which the share script attaches as the thumbnail. Skip this step and your post still goes out — it just loses the image that earns the click.

## The tools

- **Astro** (63k+ GitHub stars) — the blog framework. Content collections validate the frontmatter the script reads.
- **GitHub Actions** — the scheduler and the trigger, free for public repos.
- **n8n** (206k stars) — the popular GUI alternative if you prefer nodes over YAML. I chose YAML because it lives in the repo with the content.

## What I will not automate

Engagement bait, auto-replies, and scraping. LinkedIn's automation rules allow posting your own content through the API; they do not allow fake engagement. The pipeline shares what I wrote, nothing more.

## FAQ

- **What is content repurposing automation?** Taking one piece of content and publishing adapted versions elsewhere, automatically. Here: blog post to LinkedIn teaser.
- **Does this need an AI tool?** No. Frontmatter-driven teasers are deterministic and always on-topic.
- **How much does it cost?** Nothing — the GitHub Actions free tier and the free `w_member_social` LinkedIn scope.

> Repurpose the content, not the clicks. One good article, shipped everywhere, beats ten posts going nowhere.
