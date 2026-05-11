import type { Locale } from '@/utils/i18n';

type StringMap = {
  'linkedMentions.title': string;
  'linkedMentions.referenced': string;
  'pagination.previous': string;
  'pagination.next': string;
  'post.published': string;
  'post.minReadFallback': string;
  'posts.allPosts': string;
  'posts.allPostsTagged': string;
  'posts.showAllPosts': string;
  'posts.viewAllPosts': string;
  'posts.totalPosts': string;
  'posts.postsTagged': string;
  'posts.postsTaggedWith': string;
  'nav.posts': string;
  'nav.videos': string;
  'nav.now': string;
  'nav.about': string;
  'nav.impressum': string;
  'nav.privacy': string;
};

const strings: Record<Locale, StringMap> = {
  de: {
    'linkedMentions.title': 'Verlinkte Erwähnungen',
    'linkedMentions.referenced': 'Referenziert in diesem Beitrag',
    'pagination.previous': 'Zurück',
    'pagination.next': 'Weiter',
    'post.published': 'Veröffentlicht',
    'post.minReadFallback': '1 Min. Lesezeit',
    'posts.allPosts': 'Alle Beiträge',
    'posts.allPostsTagged': 'Alle Beiträge mit Tag',
    'posts.showAllPosts': 'Alle Beiträge anzeigen',
    'posts.viewAllPosts': 'Alle Beiträge ansehen',
    'posts.totalPosts': 'Beiträge insgesamt',
    'posts.postsTagged': 'Beiträge mit Tag',
    'posts.postsTaggedWith': 'Beiträge mit Tag',
    'nav.posts': 'Beiträge',
    'nav.videos': 'Videos',
    'nav.now': 'Jetzt',
    'nav.about': 'Über mich',
    'nav.impressum': 'Impressum',
    'nav.privacy': 'Datenschutz',
  },
  en: {
    'linkedMentions.title': 'Linked Mentions',
    'linkedMentions.referenced': 'Referenced in this post',
    'pagination.previous': 'Previous',
    'pagination.next': 'Next',
    'post.published': 'Published',
    'post.minReadFallback': '1 min read',
    'posts.allPosts': 'All Posts',
    'posts.allPostsTagged': 'All posts tagged with',
    'posts.showAllPosts': 'Show all posts',
    'posts.viewAllPosts': 'View All Posts',
    'posts.totalPosts': 'total posts',
    'posts.postsTagged': 'Posts tagged',
    'posts.postsTaggedWith': 'posts tagged with',
    'nav.posts': 'Posts',
    'nav.videos': 'Videos',
    'nav.now': 'Now',
    'nav.about': 'About',
    'nav.impressum': 'Impressum',
    'nav.privacy': 'Privacy Policy',
  },
};

export type StringKey = keyof StringMap;

export function t(locale: Locale, key: StringKey): string {
  return strings[locale][key];
}

// Lookup by string-typed key (e.g., from data with no type narrowing).
// Returns the fallback when the key is missing or unknown — never throws.
export function tOpt(locale: Locale, key: string | undefined, fallback: string): string {
  if (!key) return fallback;
  const table = strings[locale] as Record<string, string>;
  return table[key] ?? fallback;
}

// BCP-47 tag per locale, used for Intl number/date formatters.
// Adding a new locale = add a tag here; TypeScript enforces exhaustiveness.
const bcp47Tag: Record<Locale, string> = {
  de: 'de-DE',
  en: 'en-US',
};

// Per-locale formatter tables (ADR-005 Decision 6). Each entry produces the
// final localised string for the given inputs. Replacing the previous
// `locale === 'de' ? a : b` ternaries means adding a third locale
// (e.g. 'fr') becomes a missing-key compile error rather than a silent
// English fallback.

const pageOfTotalFormatters: Record<Locale, (current: number, total: number) => string> = {
  de: (current, total) => `Seite ${current} von ${total}`,
  en: (current, total) => `Page ${current} of ${total}`,
};

const readingTimeFormatters: Record<Locale, (minutes: number) => string> = {
  de: (minutes) => `${minutes} Min. Lesezeit`,
  en: (minutes) => `${minutes} min read`,
};

const wordCountFormatters: Record<Locale, (count: number) => string> = {
  de: (count) => {
    const formatted = count.toLocaleString(bcp47Tag.de);
    return count === 1 ? '1 Wort' : `${formatted} Wörter`;
  },
  en: (count) => {
    const formatted = count.toLocaleString(bcp47Tag.en);
    return count === 1 ? '1 word' : `${formatted} words`;
  },
};

const moreTagsFormatters: Record<Locale, (count: number) => string> = {
  de: (count) => `+ ${count} weitere`,
  en: (count) => `+ ${count} more`,
};

// "Page N of M" — small interpolation helper kept here so the phrase stays
// in one place and stays in sync with `t`-driven strings.
export function tPageOfTotal(locale: Locale, current: number, total: number): string {
  return pageOfTotalFormatters[locale](current, total);
}

// "N min read" — formatted on demand from numeric minutes so the i18n surface
// stays at the render boundary, not in calculateReadingTime() (which returns
// a default English `.text` for non-locale-aware callers).
export function tReadingTime(locale: Locale, minutes: number): string {
  return readingTimeFormatters[locale](minutes);
}

// "N word(s)" with pluralization. DE: Wort/Wörter, EN: word/words.
// Number is formatted via toLocaleString so 1234 -> "1,234" (en) or "1.234" (de).
export function tWordCount(locale: Locale, count: number): string {
  return wordCountFormatters[locale](count);
}

// "+ N more" trailing label after a truncated list (used by PostCard tag chips).
export function tMoreTags(locale: Locale, count: number): string {
  return moreTagsFormatters[locale](count);
}
