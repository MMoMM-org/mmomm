import type { Locale } from '@/utils/i18n';

type StringMap = {
  'linkedMentions.title': string;
  'linkedMentions.referenced': string;
  'pagination.previous': string;
  'pagination.next': string;
  'post.published': string;
  'post.minReadFallback': string;
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

// "Page N of M" — small interpolation helper kept here so the phrase stays
// in one place and stays in sync with `t`-driven strings.
export function tPageOfTotal(locale: Locale, current: number, total: number): string {
  return locale === 'de'
    ? `Seite ${current} von ${total}`
    : `Page ${current} of ${total}`;
}

// "N min read" — formatted on demand from numeric minutes so the i18n surface
// stays at the render boundary, not in calculateReadingTime() (which returns
// a default English `.text` for non-locale-aware callers).
export function tReadingTime(locale: Locale, minutes: number): string {
  return locale === 'de'
    ? `${minutes} Min. Lesezeit`
    : `${minutes} min read`;
}
