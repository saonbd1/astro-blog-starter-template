---
title: "CSS Grid vs Flexbox when to actually use each one"
description: "This debate has been running since Grid shipped. Most explanations are either too vague (“Grid is 2D, Flexbox is 1D”) or too prescriptive. Here’s the"
pubDate: "Feb 18 2026"
heroImage: "/blog-placeholder-3.jpg"
---

This debate has been running since Grid shipped. Most explanations are either too vague (“Grid is 2D, Flexbox is 1D”) or too prescriptive. Here’s the mental model that finally made it click for me.

## The one rule that decides everything

 **Does the layout drive the content, or does the content drive the layout?** 

If you have a defined grid and you’re placing items into it — use CSS Grid. If you have a bunch of items and you’re figuring out how they flow — use Flexbox.

## Grid examples

```
/* Classic 3-column layout */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* Magazine layout */
.magazine {
  display: grid;
  grid-template-areas:
    "hero hero sidebar"
    "post1 post2 sidebar";
}
```

## Flexbox examples

```
/* Nav bar items */
.nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Card that stretches button to bottom */
.card {
  display: flex;
  flex-direction: column;
}
.card-btn { margin-top: auto; }
```

> In practice, you’ll use both on the same page — Grid for the macro layout, Flexbox for the micro components.

The moment I stopped treating them as competitors and started seeing them as different tools for different jobs, my CSS got dramatically cleaner.
