---
title: "How to Add an Accessible Table of Contents to an Astro Blog"
description: "Build a reusable Astro table of contents component that creates stable heading links, works on mobile, and stays accessible without an extra package."
heroImage: "/article-media/astro-table-of-contents-hero.jpg"
pubDate: "Aug 14 2026"
category: "Web Development"
tags: ["Astro", "Blog", "Accessibility", "Frontend"]
---

A long article is easier to scan when readers can jump directly to the section they need. In this guide, you will add an **Astro table of contents** that reads the headings already rendered in a post, creates stable anchor links, and works in a shared article layout.

The solution targets three practical search needs: **Astro table of contents**, **Astro table of contents component**, and **add table of contents Astro**. It uses standard Astro templates, semantic HTML, and a small browser script. You do not need another package.

![Focused desktop implementation example showing the accessible table-of-contents panel and its heading links.](/article-media/astro-toc-focus-desktop-final.png)

*Focused desktop implementation view. This tinted panel isolates the table-of-contents component; it is not a full live-page screenshot.*

## What you will build

The finished component will do four things:

- Read `h2` and `h3` elements inside the article content.
- Give each heading a safe, unique ID when it does not already have one.
- Add an ordered list of links that point to those IDs.
- Remove the table of contents when an article has no qualifying headings.

This approach works well for an Astro blog because the same layout can wrap every post. Astro content can be rendered inside a shared layout, while the content itself remains simple Markdown or MDX. See Astro’s [content-collections documentation](https://docs.astro.build/en/guides/content-collections/) for the supported content and rendering workflow.

## Start with a shared article layout

Put the table of contents in the layout that renders each post. That prevents you from copying the same markup into every article.

In this example, the layout gets a `showToc` property. When it is enabled, it adds an `aside` before the article content. The `details` and `summary` elements give readers a familiar disclosure control and keep the page compact.

```astro
---
type Props = {
  showToc?: boolean;
};

const { showToc = false } = Astro.props;
---

{showToc ? (
  <div class="post-layout">
    <aside class="toc" data-toc aria-label="Table of contents">
      <details open>
        <summary>On this page</summary>
        <nav aria-label="Article sections">
          <ol data-toc-list></ol>
        </nav>
      </details>
    </aside>

    <div class="post-content" data-post-content>
      <slot />
    </div>
  </div>
) : (
  <div class="post-content"><slot /></div>
)}
```

The important parts are `data-toc`, `data-post-content`, and `data-toc-list`. They are stable hooks for the small script you will add next. They do not depend on an article title, a heading label, or a CSS class used only for appearance.

## Add a stable heading-ID generator

A table-of-contents link needs a matching ID on its target heading. Some Markdown pipelines add heading IDs automatically. Astro’s [Markdown and heading guide](https://docs.astro.build/en/guides/markdown-content/) explains the default Markdown behavior, but do not assume IDs are present in every case—especially when content can come from Markdown, MDX, or a custom component.

Add this script below the article markup in the same layout. It finds headings in the post body only, so it does not accidentally include headings from the header, footer, or author card.

```astro
{showToc && (
  <script>
    const toc = document.querySelector<HTMLElement>('[data-toc]');
    const content = document.querySelector<HTMLElement>('[data-post-content]');
    const list = document.querySelector<HTMLOListElement>('[data-toc-list]');

    if (toc && content && list) {
      const headings = Array.from(
        content.querySelectorAll<HTMLHeadingElement>('h2, h3'),
      );

      headings.forEach((heading, index) => {
        if (!heading.id) {
          const text = heading.textContent?.trim().toLowerCase() || `section-${index + 1}`;
          const base = text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') || `section-${index + 1}`;

          let id = base;
          let suffix = 2;

          while (document.getElementById(id)) {
            id = `${base}-${suffix++}`;
          }

          heading.id = id;
        }

        const item = document.createElement('li');
        item.className = heading.tagName === 'H3' ? 'toc-subitem' : 'toc-item';

        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent?.trim() || `Section ${index + 1}`;

        item.append(link);
        list.append(item);
      });

      if (headings.length === 0) toc.remove();
    }
  </script>
)}
```

The script converts a heading such as `Build the component` into `build-the-component`. If a second heading has the same text, the `while` loop adds a suffix instead of creating two elements with the same ID. This keeps the generated links predictable.

## Style the Astro table of contents for desktop and mobile

Use the table of contents as a normal part of the article flow first. This is more resilient than placing it in a fixed left column, which can become cramped on smaller screens.

```css
.post-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.5rem;
  width: 100%;
}

.toc {
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 0 1rem;
}

.toc details {
  border: 1px solid rgba(var(--gray-light), 0.85);
  border-radius: 12px;
  background: rgba(var(--gray-light), 0.22);
  padding: 0.8rem 1rem;
}

.toc ol {
  list-style: none;
  margin: 0;
  padding: 0;
}

.toc li + li {
  margin-top: 0.45rem;
}

.toc .toc-subitem {
  padding-left: 0.85rem;
}

.post-content :is(h2, h3) {
  scroll-margin-top: 5.5rem;
}
```

The `minmax(0, 1fr)` rule is useful in responsive layouts because it allows the content track to shrink instead of forcing overflow. The `scroll-margin-top` rule prevents a sticky or tall header from covering the section title after a reader selects a link.

![Focused mobile implementation example showing the accessible table-of-contents panel in a narrow format.](/article-media/astro-toc-focus-mobile.png)

*Focused mobile implementation view. The color treatment distinguishes this component example from the live site while showing how the heading links remain contained on a narrow screen.*

## Enable the component from your blog route

After you add the layout capability, pass `showToc` from the page that renders your collection entries. A route can render the post content and place it inside the shared layout.

```astro
---
import { getCollection, render } from 'astro:content';
import BlogPost from '../../layouts/BlogPost.astro';

const { post } = Astro.props;
const { Content } = await render(post);
---

<BlogPost {...post.data} showToc>
  <Content />
</BlogPost>
```

Keep the post title as the only `h1`. Begin normal article sections with `h2`, and use `h3` only for subsections. That creates a clear page outline and gives the table of contents a useful structure. The heading hierarchy is also helpful for readers using assistive technology.

## Test your table of contents before publishing

Test at least one short post and one long post. A short post confirms that the component disappears cleanly when there are no `h2` or `h3` elements. A long post confirms that IDs are unique and that every link reaches the right section.

| Check | What good looks like |
|---|---|
| Heading selection | The list includes article `h2` and `h3` headings, but not headings in the header, footer, or author card. |
| Link targets | Every item points to a unique element ID on the same page. |
| Mobile layout | Long link text wraps inside the panel and the page has no horizontal scroll. |
| Keyboard access | You can open the disclosure and use every link with a keyboard. |
| Anchor landing | Selecting a link leaves the target heading visible below the site header. |
| Empty posts | The table of contents is removed when there are no qualifying headings. |

## Common problems and fixes

### The table of contents is empty

Check that your content is inside the element marked with `data-post-content`. Then confirm that the article uses `h2` or `h3` headings. A visual title styled as a paragraph will not be found by the selector.

### A link opens the wrong section

This usually happens when two headings get the same ID. Keep the unique-ID loop in place. Also avoid assigning manual IDs that duplicate another heading.

### The article jumps behind the header

Add `scroll-margin-top` to the target headings. Adjust the value to match the height of your header at the viewport sizes you support.

### Mobile pages scroll sideways

Check the width of the table-of-contents panel and all of its children. Use `width: 100%`, `box-sizing: border-box`, and a shrinkable grid track. Do not give links or list items a fixed desktop width.

## Final thoughts

A good **Astro table of contents component** is small, semantic, and reusable. It does not need a heavy client-side framework. By generating IDs only when necessary and scoping the selector to the article body, you can add reliable navigation to every long-form post in your site.

Start with the shared layout, verify the desktop and mobile behavior, and keep the same structure across your blog. That gives readers an easier way to navigate now and gives you a maintainable pattern for future articles.

