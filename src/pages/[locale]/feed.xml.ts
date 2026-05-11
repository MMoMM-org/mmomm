import type { APIRoute, GetStaticPaths } from "astro";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "../../utils/i18n";
import { buildAtomFeed } from "../../utils/feeds";

// ADR-005 Phase 2: parameterised Atom feed for non-default locales.
// Default-locale feed lives at src/pages/feed.xml.ts.
export const getStaticPaths: GetStaticPaths = () =>
  LOCALES
    .filter((l) => l !== DEFAULT_LOCALE)
    .map((locale) => ({ params: { locale } }));

export const GET: APIRoute = async ({ params }) =>
  buildAtomFeed(params.locale as Locale);
