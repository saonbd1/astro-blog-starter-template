import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { statSync } from "node:fs";
import { resolve } from "node:path";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";

const AUTHOR_NAME = "SaonBD";
const MIME_TYPES = {
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	webp: "image/webp",
	gif: "image/gif",
};

function escapeXml(value) {
	return value.replace(/[<>&'\"]/g, (character) => ({
		"<": "&lt;",
		">": "&gt;",
		"&": "&amp;",
		"'": "&apos;",
		'"': "&quot;",
	}[character]));
}

function getImageMetadata(imagePath) {
	if (!imagePath) return undefined;
	const extension = imagePath.split(".").pop()?.toLowerCase() ?? "";
	const type = MIME_TYPES[extension] ?? "application/octet-stream";
	const filePath = resolve(process.cwd(), "public", imagePath.replace(/^\/+/, ""));
	return {
		url: imagePath,
		type,
		length: statSync(filePath).size,
	};
}

export async function GET(context) {
	const posts = await getCollection("blog");
	const items = posts
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
		.map((post) => {
			const image = getImageMetadata(post.data.heroImage);
			const imageUrl = image ? new URL(image.url, context.site).href : undefined;
			const tags = [...new Set(post.data.tags)];
			const categories = [post.data.category, ...tags];
			const tagSubjects = tags.map((tag) => `<dc:subject>${escapeXml(tag)}</dc:subject>`).join("");
			return {
				title: post.data.title,
				description: post.data.description,
				pubDate: post.data.updatedDate ?? post.data.pubDate,
				link: `/blog/${post.id}/`,
				author: AUTHOR_NAME,
				categories,
				customData: `<dc:creator>${AUTHOR_NAME}</dc:creator>${tagSubjects}${image && imageUrl ? `<media:content url="${imageUrl}" medium="image" type="${image.type}" />` : ""}`,
				...(image && imageUrl
					? {
						content: `<p>${post.data.description}</p><p><img src="${imageUrl}" alt="${post.data.title}" /></p>`,
						enclosure: image,
					}
					: {}),
			};
		});

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		xmlns: {
			atom: "http://www.w3.org/2005/Atom",
			media: "http://search.yahoo.com/mrss/",
			dc: "http://purl.org/dc/elements/1.1/",
		},
		customData: `<atom:link href="${new URL("/rss.xml", context.site).href}" rel="self" type="application/rss+xml" />`,
		items,
	});
}
