// Type definitions for the blog theme
import type { CollectionEntry } from "astro:content";

/**
 * Site locale union. MVP is hardcoded DE/EN per ADR-005 Decision 1; widen here
 * when adding a third locale (the only TypeScript change required by ADR-005).
 */
export type Locale = 'de' | 'en';

/**
 * Per-locale string value. Required-all (not Partial) so TypeScript enforces
 * locale parity at compile time — missing translations cannot ship. See
 * ADR-005 Decision 3.
 */
export type LocalisedString = Record<Locale, string>;

export type Post = CollectionEntry<"posts">;

export type PostData = CollectionEntry<"posts">["data"];

export type Page = CollectionEntry<"pages">;

export type PageData = CollectionEntry<"pages">["data"];

export type Project = CollectionEntry<"projects">;

export type ProjectData = CollectionEntry<"projects">["data"];

export type Docs = CollectionEntry<"docs">;

export type DocsData = CollectionEntry<"docs">["data"];

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export interface ReadingTime {
  text: string;
  minutes: number;
  time: number;
  words: number;
}

export interface NavigationItem {
  title: string;
  url?: string;  // Optional - if missing, item is dropdown-only.
                 // For bilingual pages this is the URL on the default locale; see urlByLocale.
  urlByLocale?: Partial<Record<Locale, string>>; // Per-locale URL override.
                  // When omitted, navUrl() prefixes url with /<locale>/ for non-default locales.
                  // Use when the slug differs across locales (e.g. /jetzt/ -> /en/now/) or
                  // when a route is intentionally locale-neutral (set every locale to the same URL).
  i18nKey?: string; // T9 key (in src/i18n/strings.ts) for the translated label.
                    // When omitted or unknown, title is used verbatim.
  external?: boolean;
  icon?: string;
  children?: NavigationItem[];  // Single level only
}

export interface SocialLink {
  title: string;
  url: string;
  icon: string;
}

export interface CommandPaletteItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: "post" | "page" | "project" | "docs" | "social" | "external" | "action";
  icon?: string;
}

export interface SearchResult {
  item: CommandPaletteItem;
  score: number;
  matches: Array<{
    indices: Array<[number, number]>;
    value: string;
    key: string;
  }>;
}

export interface ImageInfo {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface OpenGraphImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface SEOData {
  title: string;
  description: string;
  canonical: string;
  ogImage?: OpenGraphImage;
  ogType: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  noIndex?: boolean;
  robots?: string;
  articleSection?: string;
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
  };
  keywords?: string[];
}

export interface WikilinkMatch {
  link: string;
  display: string;
  slug: string;
}

export interface LinkedMention {
  title: string;
  slug: string;
  url: string;
  excerpt: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextUrl?: string;
  prevUrl?: string;
}
