import { getCollection, type CollectionEntry } from 'astro:content';

export type Locale = 'de' | 'en';

export const DEFAULT_LOCALE: Locale = 'de';
export const LOCALES: readonly Locale[] = ['de', 'en'] as const;

/** URL prefix for a locale. DE = '' (root), EN = '/en'. */
export function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`;
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
