import { getCollection, type CollectionEntry } from 'astro:content';
import { siteConfig } from '../config';
import type { Locale, LocalisedString, NavigationItem } from '../types';

// Re-export so existing imports `from '@/utils/i18n'` keep working — Locale is
// now defined in src/types.ts per ADR-005 Decision 2.
export type { Locale, LocalisedString };

/** Configured locales, sourced from siteConfig (ADR-005 Decision 2). */
export const LOCALES: readonly Locale[] = siteConfig.locales;

/** Configured default locale, sourced from siteConfig (ADR-005 Decision 2). */
export const DEFAULT_LOCALE: Locale = siteConfig.defaultLocale;

/** URL prefix for a locale. Default locale = '' (root), others = '/<locale>'. */
export function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`;
}

/**
 * Resolve a `LocalisedString | string` value for a given locale. Accepts the
 * legacy single-string shape during the Phase 1 migration (ADR-005 Decision 3)
 * so call sites can adopt `LocalisedString` field-by-field without breaking
 * the build. New code should pass a `LocalisedString`.
 */
export function lt(locale: Locale, value: LocalisedString | string): string {
  return typeof value === 'string' ? value : value[locale];
}

/**
 * Resolve a navigation item's URL for the current locale (ADR-005 Decision 4).
 *
 * Precedence:
 *   1. `urlByLocale[locale]` — explicit per-locale override (use for slug-divergent
 *      pages like /ueber-mich/ -> /en/about/, or locale-neutral routes like /now/).
 *   2. Missing url -> '#' (dropdown-only parent).
 *   3. External or absolute URL (http(s)://, #, mailto:) -> verbatim.
 *   4. Relative path -> prefixed with localePrefix(locale).
 *
 * Replaces the duplicated localizedNavUrl/navUrl resolvers that previously
 * lived in Header.astro and Footer.astro.
 */
export function navUrl(item: Pick<NavigationItem, 'url' | 'urlByLocale' | 'external'>, locale: Locale): string {
  const override = item.urlByLocale?.[locale];
  if (override) return override;
  const url = item.url;
  if (!url) return '#';
  if (item.external) return url;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('#') || url.startsWith('mailto:')) {
    return url;
  }
  if (url.startsWith('/')) return `${localePrefix(locale)}${url}`;
  return url;
}

/** Strip the locale folder prefix from a post id to get the bare slug. */
export function postSlug(post: CollectionEntry<'posts'>): string {
  return post.id.replace(/^(de|en)\//, '');
}

/** Build the canonical URL path for a post (locale-aware). */
export function postUrl(post: CollectionEntry<'posts'>): string {
  return `${localePrefix(post.data.lang)}/posts/${postSlug(post)}`;
}

/** Build a tag URL for a given locale and tag. */
export function tagUrl(locale: Locale, tag: string): string {
  return `${localePrefix(locale)}/posts/tag/${tag}`;
}

/** Filter the posts collection to a single locale. */
export async function getLocalisedPosts(locale: Locale) {
  const all = await getCollection('posts');
  return all.filter((p) => p.data.lang === locale);
}

/** Find the translation counterpart of a post (or null). */
export async function findTranslation(
  post: CollectionEntry<'posts'>,
): Promise<CollectionEntry<'posts'> | null> {
  if (!post.data.translationKey) return null;
  const otherLocale: Locale = post.data.lang === 'de' ? 'en' : 'de';
  const others = await getLocalisedPosts(otherLocale);
  return others.find((p) => p.data.translationKey === post.data.translationKey) ?? null;
}

/** Strip the locale folder prefix from a page id to get the bare slug. */
export function pageSlug(page: CollectionEntry<'pages'>): string {
  return page.id.replace(/^(de|en)\//, '');
}

/** Build the canonical URL path for a page (locale-aware). */
export function pageUrl(page: CollectionEntry<'pages'>): string {
  return `${localePrefix(page.data.lang)}/${pageSlug(page)}`;
}

/** Filter the pages collection to a single locale. */
export async function getLocalisedPages(locale: Locale) {
  const all = await getCollection('pages');
  return all.filter((p) => p.data.lang === locale);
}

/** Find the translation counterpart of a page (or null). */
export async function findPageTranslation(
  page: CollectionEntry<'pages'>,
): Promise<CollectionEntry<'pages'> | null> {
  if (!page.data.translationKey) return null;
  const otherLocale: Locale = page.data.lang === 'de' ? 'en' : 'de';
  const others = await getLocalisedPages(otherLocale);
  return others.find((p) => p.data.translationKey === page.data.translationKey) ?? null;
}
