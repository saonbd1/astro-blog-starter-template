// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";


// https://astro.build/config
export default defineConfig({
	output: "static",
	site: "https://www.techtips.fun",
	integrations: [
			mdx(),
			sitemap({
				filter: (page) => !page.includes('/categories/') && !page.includes('/tags/') && !page.includes('/sitemap/'),
			}),
		],
});
