---
title: "How to Create Categories and Tags in an Astro Blog"
description: "Create clear categories and useful tags in an Astro blog, generate archive pages at build time, and choose the right navigation option for readers."
heroImage: "/article-media/astro-categories-tags-hero.jpg"
pubDate: "Aug 14 2026"
category: "Web Development"
tags: ["Astro", "Blog", "Content Collections", "SEO", "Frontend"]
---

A blog becomes easier to explore when its taxonomy is clear. A **category** tells readers the main subject of a post, while **tags** describe its smaller ideas, tools, or use cases. In this guide, you will create **Astro categories and tags** with typed frontmatter, URL-safe archive pages, and navigation that grows with your content. Once a reader reaches a long article through that taxonomy, an [accessible table of contents](/blog/astro-table-of-contents-component-guide/) gives them the same kind of clear path within the post itself.

The approach uses Astro content collections and static routes. You do not need a database, CMS plug-in, or client-side filtering library. Astro validates the post metadata at build time, then generates the category and tag pages from the content already in your repository. Astro’s [content-collections documentation](https://docs.astro.build/en/guides/content-collections/) explains the collection and schema model used by this pattern.

## Choose the option that fits your blog

You can start small and add discovery features only when readers need them. The table below shows the three practical options this guide covers.

| Option | What you create | Best for | Trade-off |
| --- | --- | --- | --- |
| **Option 1: Frontmatter labels** | One category and a short tag list on every post | New or very small blogs | Readers cannot browse a dedicated archive page yet. |
| **Option 2: Generated archives** | Category and tag pages built from your post metadata | Most static Astro blogs | You need two small dynamic route files. |
| **Option 3: Navigation and index pages** | Archives plus a category menu, chip strip, and taxonomy index | Larger catalogs with several topics | Navigation needs regular editorial discipline. |

For most blogs, **Option 2 is the best starting point**. It keeps the data model simple and gives readers useful archive pages without adding a service or a database. Option 3 is the same foundation with better discovery controls.

## Add categories and tags to your content schema

Define the taxonomy fields in your blog collection first. In this example, `category` is a required string, while `tags` is an array that defaults to an empty list. This gives every post one clear home and lets you add several specific labels where they genuinely help.

```
import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
```

This schema is deliberately small. A category is broad enough to appear in your main navigation, such as `Web Development` or `Linux & Terminal`. A tag is narrower, such as `Astro`, `Accessibility`, or `CSS Grid`. Keep the category stable and use tags to describe details that can appear across more than one category.

## Add taxonomy to each Markdown post

Once the schema is in place, give every post one category and a short list of tags in its frontmatter. Keep the spelling and capitalization consistent, because the archive pages will group exact values together.

```
---
title: "Build a Fast Astro Blog"
description: "A practical guide to organizing and publishing an Astro blog."
pubDate: "2026-08-14"
heroImage: "/blog/astro-blog-cover.webp"
category: "Web Development"
tags: ["Astro", "Static Site", "Performance"]
---
```

Use **one category per post** unless your editorial model truly needs multiple primary subjects. A reader should be able to understand why a post belongs in its category without seeing its tags. Use three to five tags only when they add meaningful ways to find related content; a long list of near-duplicate tags makes a blog harder to maintain.

## Option 1: Display labels on the post only

The smallest implementation is to render the category and tags on the article page or blog card. This is useful when you are launching a new site and want a clean taxonomy without building archive routes yet.

```
<p>Category: {post.data.category}</p>

<ul aria-label="Post tags">
  {post.data.tags.map((tag) => <li>#{tag}</li>)}
</ul>
```

Start here if your blog has fewer than a handful of posts. You can keep the same frontmatter when you later add archives, so this option is never wasted work.

## Option 2: Generate category and tag archive pages

A static Astro site can create one page per taxonomy term during the build. The category route finds every unique category, turns each name into a route parameter, and filters the posts for the current page. Astro’s [routing documentation](https://docs.astro.build/en/guides/routing/) explains why a static dynamic route uses `getStaticPaths()` to declare the pages that should exist at build time.

Create `src/pages/categories/[category].astro` with this core logic:

```
---
import { getCollection } from 'astro:content';
import { toTaxonomySlug } from '../../utils/taxonomy';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  const categories = [...new Set(posts.map((post) => post.data.category))];

  return categories.map((category) => ({
    params: { category: toTaxonomySlug(category) },
    props: { category },
  }));
}

const { category } = Astro.props;
const posts = (await getCollection('blog'))
  .filter((post) => post.data.category === category)
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---
```

The tag route uses the same shape. The difference is that a post can have several tags, so you collect them with `flatMap()` and filter them with `includes()`.

```
---
import { getCollection } from 'astro:content';
import { toTaxonomySlug } from '../../utils/taxonomy';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  const tags = [...new Set(posts.flatMap((post) => post.data.tags))];

  return tags.map((tag) => ({
    params: { tag: toTaxonomySlug(tag) },
    props: { tag },
  }));
}

const { tag } = Astro.props;
const posts = (await getCollection('blog'))
  .filter((post) => post.data.tags.includes(tag))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---
```

Then render the `posts` array as normal cards or a simple list. The result is a category page such as `/categories/web-development/` and a tag page such as `/tags/astro/`. If you want an all-tags index, Astro’s official [tag-index tutorial](https://docs.astro.build/en/tutorial/5-astro-api/3/) shows the same collection-data approach.

## Create URL-safe taxonomy slugs

Never use the raw category or tag value directly as a URL. A small helper keeps paths predictable when labels contain spaces, punctuation, or an ampersand.

```
export function toTaxonomySlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

With this helper, `Web Development` becomes `web-development`, while `Networking & Privacy` becomes `networking-and-privacy`. Use the same helper everywhere you create taxonomy links. Otherwise, a navigation link can point to a route that the build never created.

## Option 3: Add discovery navigation and index pages

Once you have archive routes, add navigation that helps readers discover them. There are two useful patterns, and you can use both without changing the frontmatter model.

| Navigation pattern | Where it works best | How it should behave |
| --- | --- | --- |
| **Header category menu** | A global site header | Lists broad categories and keeps the main header compact. |
| **Horizontal category strip** | Blog home and archive pages | Shows active state, allows horizontal scrolling on mobile, and gives readers a quick topic switcher. |
| **Category and tag index pages** | A dedicated browse page or footer link | Shows every term with a post count for readers who want to explore the full library. |

Build the category list from the collection so it always reflects your current posts. Do not maintain the same list by hand in the header, blog index, and archive pages.

```
---
import { getCollection } from 'astro:content';
import { toTaxonomySlug } from '../utils/taxonomy';

const posts = await getCollection('blog');
const categories = [...new Set(posts.map((post) => post.data.category))]
  .sort((a, b) => a.localeCompare(b));
---

<nav aria-label="Blog categories">
  <a href="/blog/">All posts</a>
  {categories.map((category) => (
    <a href={`/categories/${toTaxonomySlug(category)}/`}>
      {category}
    </a>
  ))}
</nav>
```

For a narrow screen, let the category links scroll horizontally rather than wrap into several uneven rows. Use `white-space: nowrap`, `overflow-x: auto`, and comfortable link spacing. This preserves a clean mobile layout while still making every category available. If you are deciding how the archive cards or navigation sections themselves should arrange at each breakpoint, use the practical trade-offs in [CSS Grid vs Flexbox: when to actually use each one](/blog/css-grid-vs-flexbox-when-to-actually/).

## Keep taxonomy useful for readers and search engines

Taxonomy helps only when it stays intentional. Use categories for your long-term editorial pillars, and merge tags that mean the same thing. For example, choose either `AI Tools` or `Artificial Intelligence Tools`, not both. Review your category and tag list every few months as the blog grows.

Do not create a new tag for a phrase used in one post unless you expect related posts to follow. A tag archive with one thin result rarely helps readers. In contrast, a category page with several related practical articles can become a helpful navigation page even if you choose not to include it in your XML sitemap.

## Test before you publish

Before releasing the change, build the site and check the generated taxonomy pages. The following quick checks catch the most common problems.

| Check | What to confirm |
| --- | --- |
| Schema validation | Every post has one category, and tags are an array of strings. |
| Archive generation | Each unique category and tag creates the expected URL. |
| Filtering | A category page includes only matching posts; a tag page includes every post with that tag. |
| Slugs | Spaces, punctuation, and ampersands produce the same URL in every link. |
| Mobile navigation | Category links remain visible without creating horizontal page overflow. |
| Editorial consistency | Similar topics use the same capitalization and wording. |

Run the production build before you commit:

```bash
npm run build
```

## Common category and tag mistakes

### Creating too many categories

Categories should remain broad enough to be useful in a navigation menu. If a category has only one post and no planned follow-up, it may be a tag instead. Start with a small set of core subjects and expand only when the content genuinely supports it.

### Treating tags like keywords

Tags are for reader navigation, not for repeating every search phrase in the article. Choose a few specific labels that connect related posts. Your article title, headings, body, description, and internal links do the main work of explaining the topic.

### Changing labels without checking links

If you rename `Web Development` to `Web Dev`, the generated slug changes too. Search your header, category strip, cards, sitemap strategy, and internal links for the old route before publishing. A permanent redirect may be appropriate if the old archive is already public.

### Making the archive pages visually inconsistent

Archive pages are part of your site’s browsing experience. Reuse your normal header, footer, post-card styling, image aspect ratio, and responsive spacing. Readers should feel that category and tag pages belong to the same blog.

## Final thoughts

A strong **Astro blog categories** and **Astro blog tags** setup begins with simple, typed frontmatter. From there, Option 2 gives most static blogs the best balance: one category per post, a focused tag array, URL-safe static archive pages, and no extra service to run. When your catalog grows, add the navigation and index-page patterns from Option 3. Pair that structure with the [Astro table-of-contents guide](/blog/astro-table-of-contents-component-guide/) to improve both cross-post discovery and navigation inside each detailed tutorial.

Keep the names stable, keep the tags selective, and generate every discovery surface from the same content collection. That gives readers a clearer path through your blog and gives you a taxonomy that remains easy to maintain.

