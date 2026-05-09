import type { Locale } from '@/utils/i18n';

type StringMap = {
  'linkedMentions.title': string;
  'pagination.previous': string;
  'pagination.next': string;
  'post.published': string;
  'post.minReadFallback': string;
};

const strings: Record<Locale, StringMap> = {
  de: {
    'linkedMentions.title': 'Verlinkte Erwähnungen',
    'pagination.previous': 'Zurück',
    'pagination.next': 'Weiter',
    'post.published': 'Veröffentlicht',
    'post.minReadFallback': '1 Min. Lesezeit',
  },
  en: {
    'linkedMentions.title': 'Linked Mentions',
    'pagination.previous': 'Previous',
    'pagination.next': 'Next',
    'post.published': 'Published',
    'post.minReadFallback': '1 min read',
  },
};

export type StringKey = keyof StringMap;

export function t(locale: Locale, key: StringKey): string {
  return strings[locale][key];
}
