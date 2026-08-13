# Social-sharing cards

The blog now generates one branded **1200×630 PNG** for every Markdown post at `/og/{post-id}.png`. Each post page passes that image to the shared head component, so Facebook, X, and other crawlers receive an absolute post-specific `og:image` and `twitter:image` URL instead of the raw hero image.

The generated card uses the exact post title, the post’s featured image as the large right-side visual, and SaonBD’s small author portrait and identity row. The page metadata also identifies blog posts as `article`, includes the canonical URL, article publication timestamps, and the title and description from frontmatter.

Run `npm run generate:assets` after adding or changing posts or images. The command compresses public raster assets when a smaller result is available and regenerates every card. The production `npm run build` command runs this step automatically before Astro builds the site.

## Post image requirements

Keep each post’s `heroImage` value as a root-relative path under `public/`. The generator centre-crops the image into the card’s featured-image circle. The author portrait is read from `public/portrait.webp`.

## Deployment and preview cache

After deploying the updated site, social platforms may continue showing cached previews. Use the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and [X Card Validator](https://cards-dev.twitter.com/validator) to request a fresh crawl of a post URL. Verify that the preview image URL points to `/og/{post-id}.png` and that the title matches the post frontmatter.
