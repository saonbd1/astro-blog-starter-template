import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";

export async function GET(context) {
	const posts = await getCollection("blog");
	const items = posts
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
		.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.updatedDate ?? post.data.pubDate,
			link: `/blog/${post.id}/`,
			categories: [post.data.category, ...post.data.tags],
		}));

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		xmlns: {
			atom: "http://www.w3.org/2005/Atom",
		},
		customData: `<atom:link href="${new URL("/rss.xml", context.site).href}" rel="self" type="application/rss+xml" />`,
		items,
	});
}
