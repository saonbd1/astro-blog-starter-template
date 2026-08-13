// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
	site: "https://www.techtips.fun",
	integrations: [
			mdx(),
			sitemap({
				filter: (page) => !page.includes('/categories/') && !page.includes('/tags/') && !page.includes('/sitemap/'),
			}),
		],
	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
	}),
});
