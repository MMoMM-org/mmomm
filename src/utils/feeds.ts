import rss from "@astrojs/rss";
import { siteConfig } from "../config";
import { shouldShowPost, sortPostsByDate } from "./markdown";
import { optimizePostImagePath } from "./images";
import { getLocalisedPosts, postUrl, type Locale, lt } from "./i18n";
import type { Post } from "@/types";

function extractImagePath(image: unknown): string {
  if (!image || typeof image !== "string") return "";

  if (image.startsWith("[[") && image.endsWith("]]")) {
    return image.slice(2, -2);
  }

  if (image.startsWith('"[[') && image.endsWith(']]"')) {
    return image.slice(3, -3);
  }

  return image;
}

function getMimeTypeFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    default:
      return "image/webp";
  }
}

function normalizeSiteUrl(url: string): string {
  return url.replace(/\/+$/, "") + "/";
}

function resolveSiteUrl(): string {
  return normalizeSiteUrl(import.meta.env.SITE || siteConfig.site);
}

async function getFeedPosts(locale: Locale): Promise<Post[]> {
  const localised = await getLocalisedPosts(locale);
  const isDev = import.meta.env.DEV;
  const visible = localised.filter((post) => shouldShowPost(post, isDev));
  return sortPostsByDate(visible);
}

function absoluteUrl(siteUrl: string, path: string): string {
  // postUrl returns a leading-slash path with no trailing slash; siteUrl ends with '/'.
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  return `${siteUrl}${trimmed}/`;
}

export async function buildRssFeed(locale: Locale) {
  const siteUrl = resolveSiteUrl();
  const sortedPosts = await getFeedPosts(locale);

  return rss({
    title: lt(locale, siteConfig.title),
    description: lt(locale, siteConfig.description),
    site: siteUrl,
    items: sortedPosts.map((post) => {
      const link = absoluteUrl(siteUrl, postUrl(post));
      const imagePath = post.data.image ? extractImagePath(post.data.image) : "";
      const buildImageUrl = (): string => {
        if (imagePath.startsWith("http")) return imagePath;
        const optimizedPath = optimizePostImagePath(imagePath, post.id, post.id);
        return `${siteUrl}${optimizedPath.startsWith("/") ? optimizedPath.slice(1) : optimizedPath}`;
      };

      return {
        title: post.data.title,
        description: post.data.description || "",
        pubDate: post.data.date,
        link,
        categories: post.data.tags || [],
        author: siteConfig.author,
        enclosure:
          post.data.image && post.data.imageOG
            ? {
                url: buildImageUrl(),
                type: getMimeTypeFromPath(imagePath),
                length: 0,
              }
            : undefined,
        customData: [
          post.data.targetKeyword && `<keyword>${post.data.targetKeyword}</keyword>`,
          post.data.image && `<image>${buildImageUrl()}</image>`,
        ]
          .filter(Boolean)
          .join(""),
      };
    }),

    customData: `
      <language>${locale}</language>
      <copyright>Copyright © ${new Date().getFullYear()} ${siteConfig.author}</copyright>
      <managingEditor>${siteConfig.author}</managingEditor>
      <webMaster>${siteConfig.author}</webMaster>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <generator>Astro RSS</generator>
      <docs>https://www.rssboard.org/rss-specification</docs>
      <ttl>60</ttl>
    `,

    xmlns: {
      atom: "http://www.w3.org/2005/Atom",
      content: "http://purl.org/rss/1.0/modules/content/",
      dc: "http://purl.org/dc/elements/1.1/",
    },
  });
}

export async function buildAtomFeed(locale: Locale): Promise<Response> {
  const siteUrl = resolveSiteUrl();
  const sortedPosts = await getFeedPosts(locale);
  const feedPath = locale === "en" ? "en/feed.xml" : "feed.xml";
  const feedSelfHref = `${siteUrl}${feedPath}`;

  const atomFeed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${locale}">
  <title>${lt(locale, siteConfig.title)}</title>
  <subtitle>${lt(locale, siteConfig.description)}</subtitle>
  <link href="${siteUrl}"/>
  <link href="${feedSelfHref}" rel="self"/>
  <id>${feedSelfHref}</id>
  <author>
    <name>${siteConfig.author}</name>
  </author>
  <updated>${new Date().toISOString()}</updated>

  ${sortedPosts
    .map((post) => {
      const link = absoluteUrl(siteUrl, postUrl(post));
      return `
  <entry>
    <title>${post.data.title}</title>
    <link href="${link}"/>
    <id>${link}</id>
    <published>${new Date(post.data.date).toISOString()}</published>
    <updated>${new Date(post.data.date).toISOString()}</updated>
    <summary>${post.data.description || ""}</summary>
    ${
      post.data.tags
        ? post.data.tags.map((tag) => `<category term="${tag}"/>`).join("")
        : ""
    }
  </entry>`;
    })
    .join("")}
</feed>`;

  return new Response(atomFeed, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
