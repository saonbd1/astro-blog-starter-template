---
title: "LinkedIn API Pricing: Free Posting with the Right Endpoint"
description: "LinkedIn API pricing depends on the endpoint. Posting to your own profile is free with w_member_social. Here is the 422 trap and the legacy route that works."
pubDate: "Oct 04 2026"
category: "API"
tags: ["LinkedIn", "API", "Developer", "Automation"]
---

<!-- SEO: title 58/60 chars, description 157/160 chars. Focus keyword: linkedin api pricing free posting endpoint -->

Everyone asks the same question when they start building with LinkedIn: what does the API cost? The honest answer is "it depends on the endpoint," and the difference matters. I learned this while building an automated blog-to-LinkedIn pipeline for techtips.fun.

## The pricing reality

- **Marketing Developer Platform:** paid, partner-managed, meant for agencies running campaigns at scale.
- **Posting to your own profile:** free. The `w_member_social` scope on a standard developer app covers it.

If a pricing page quotes you four figures, it is quoting the marketing product. For a personal blog or a small team sharing its own articles, the bill is zero.

## Two endpoints, two behaviors

LinkedIn offers two ways to create a post:

1. `POST /v2/ugcPosts` — the modern endpoint. It expects an organization URN when your app was created under a Company Page. Send it a `urn:li:person` URN and it answers with a 422.
2. `POST /v2/shares` — the legacy endpoint, deprecated on paper but still working. It accepts `owner: urn:li:person:{sub}`, where `{sub}` comes from the OpenID `userinfo` response.

## The identity trap

Older tutorials tell you to build `urn:li:member:{id}` with a numeric member ID. OpenID sign-in no longer exposes that legacy numeric ID — the `sub` claim is a new-format identifier. So the member URN route is a dead end, and the person URN route only works on `shares`.

## What I shipped

A GitHub Actions workflow that posts a teaser (title, short description, canonical URL) with the article's OG image as the thumbnail. The script resolves the owner URN from `/v2/userinfo` at runtime, so nothing is hard-coded.

## The risk

Legacy endpoints can die. My fallback plan: post as `urn:li:organization` with the `w_organization_social` scope if LinkedIn retires `shares`.

## FAQ

- **Is the LinkedIn API free?** Posting to your own profile is free with `w_member_social`. The paid tier is the Marketing Developer Platform.
- **How much does LinkedIn API access cost for a blog?** Zero, plus free GitHub Actions minutes.
- **Why does ugcPosts return 422?** Usually a URN mismatch — company-page apps expect organization URNs there.

> Read the error, not the price tag. The free endpoint was one 422 away.
