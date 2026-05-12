# Runbook: Adding a Locale

> Procedure for adding a new locale (e.g. `fr`, `es`, `it`) to the site.
> Codifies ADR-005's "N-locale-ready" design — adding a locale is data + a
> one-line type widening, not a structural rewrite.

## Pre-flight

- Branch off `main` or current feature branch — do not edit on `main` (hook-blocked).
- Run `pnpm build` once before starting so you have a known-good baseline page count
  (currently **59 pages** for DE+EN). The diff after adding the new locale should be
  the count of localised routes you intended to add (typically: posts index + tag
  indexes + per-post slug pages + per-page slug pages + RSS + Atom).
- Confirm `astro check` baseline error count (currently **32**, all pre-existing,
  see `docs/ai/memory/context.md` "Pre-existing TS noise").
- The Astro Modular Settings plugin in the vault is locale-aware as of
  2026-05-12 (ADR-005 Phase 3). You can edit `src/config.ts` either in your editor
  or via the plugin UI in Obsidian — both round-trip safely, **but** comments must
  live ABOVE `pages:` / `footer:`, never inside the array literal (see
  `docs/ai/memory/tools.md`).

## Procedure

The procedure below uses `fr` (French) as the worked example. Substitute the
two-letter BCP-47 code of the locale you are adding throughout.

### 1. Widen the `Locale` union (one-line change)

`src/types.ts`, line 8:

```ts
export type Locale = 'de' | 'en' | 'fr';
```

This is the **only** TypeScript type change required for a new locale. The
TypeScript compiler will now flag every `Record<Locale, ...>` and every per-locale
formatter table as incomplete — those errors are your remaining checklist of
content edits to make. Step through them rather than chasing them after the build
breaks at runtime.

### 2. Register the locale in `siteConfig`

`src/config.ts`, around the `[CONFIG:LOCALES]` marker:

```ts
// [CONFIG:LOCALES]
locales: ['de', 'en', 'fr'] as const,
// [CONFIG:DEFAULT_LOCALE]
defaultLocale: 'de',
```

Add the new locale to the `locales` array. **Do not** change `defaultLocale` —
the default locale lives at root URLs (per ADR-002 Decision 4 +
`prefixDefaultLocale: false`). Changing it would move every existing default-locale
URL.

### 3. Populate `LocalisedString` site-info values

Every `LocalisedString` field (`Record<Locale, string>`, required-all) now needs
a `fr` value. TypeScript will list them; the canonical set per ADR-005 Decision 3
is:

- `siteConfig.title`
- `siteConfig.description`
- `siteConfig.homepageTitle`
- `siteConfig.seo.defaultOgImageAlt`
- `siteConfig.footer.content`
- `siteConfig.profilePicture.alt`

Example for `description`:

```ts
description: {
  de: "PKM, Obsidian, MiYo, AI und anderes Gedöns",
  en: "PKM, Obsidian, MiYo, AI, and other oddments",
  fr: "PKM, Obsidian, MiYo, IA, et autres babioles",
},
```

### 4. Add T9 strings table entries

`src/i18n/strings.ts`, the `strings: Record<Locale, StringMap>` constant: add a
full `fr: { ... }` block. Use the existing `de` and `en` blocks as templates —
every key in `StringMap` must have a value. TypeScript flags the missing keys.

Then add a `fr` entry to each per-locale formatter table (Decision 6):

- `bcp47Tag` — pick the right BCP-47 tag (`'fr-FR'`, `'fr-CA'`, etc.)
- `pageOfTotalFormatters` — `(c, t) => \`Page ${c} sur ${t}\``
- `readingTimeFormatters` — `(m) => \`${m} min de lecture\``
- `wordCountFormatters` — handle singular/plural per locale grammar
- `moreTagsFormatters` — `(c) => \`+ ${c} de plus\``

Missing keys are compile errors — that is the point of the per-locale table over
ternaries.

### 5. Extend content collection schemas

`src/content.config.ts` — extend the `lang` enum on both `postsCollection` and
`pagesCollection`:

```ts
lang: z.enum(['de', 'en', 'fr']),
```

(Special collections `projects`, `docs`, `special` have no `lang` field today —
ADR-004 Decision 4 — so nothing to change there.)

### 6. Create the content folders

```
src/content/posts/fr/        # symmetric with posts/de/ and posts/en/
src/content/pages/fr/        # symmetric with pages/de/ and pages/en/
```

For each existing translation-paired page (5 page pairs as of Phase 2 — about,
jetzt/now, impressum, datenschutz/privacy-policy, videos), add an `fr/` sibling
with matching `translationKey` and `lang: fr`. Posts without a French translation
simply don't get a French file — `findTranslation()` returns `null` for unmatched
posts and the switcher hides the missing-locale link.

### 7. Add Vault CMS content-types for the new locale

ADR-004 Decision 1 keeps Vault CMS configuration-only (no fork). For each new
locale, duplicate the existing content-type entries in the plugin's `data.json`:

`src/content/.obsidian/plugins/vault-cms/data.json` — add:

```json
{ "id": "posts-fr-<timestamp>", "name": "Posts (FR)", "folder": "posts/fr", ... },
{ "id": "pages-fr-<timestamp>", "name": "Pages (FR)", "folder": "pages/fr", ... }
```

Mirror the same change in `src/content/.obsidian/plugins/astro-composer/data.json`.
Templates should include `lang: fr` and `translationKey: ""` so new notes are
schema-valid out-of-the-box.

Reload Obsidian once (`Ctrl/Cmd+R` in the developer console, or quit and reopen)
for the picker to refresh.

### 8. Optional: `urlByLocale` overrides for slug-divergent pages

If any nav item has a different slug in the new locale, add it to `urlByLocale`
in `src/config.ts`:

```ts
{ title: "Über mich", i18nKey: "nav.about", url: "/ueber-mich/",
  urlByLocale: { en: "/en/about/", fr: "/fr/a-propos/" } },
```

Otherwise `navUrl()` defaults to `/<locale>/<url>` (e.g. `/fr/ueber-mich/`), which
works fine as long as the page file at `pages/fr/ueber-mich.md` exists with the
matching slug.

For **locale-neutral** routes (e.g. `/now/`), set every locale to the same URL:

```ts
urlByLocale: { de: "/now/", en: "/now/", fr: "/now/" }
```

### 9. Build and verify

```bash
pnpm build
```

**Expected output**:

- Page count increases by the number of routes you fanned out into the new locale.
  For a full clone of the existing structure (posts index, tag indexes, per-post
  pages, per-page pages, RSS, Atom) using N posts: roughly `N + ~5` new routes.
- `sitemap.xml` includes `<xhtml:link rel="alternate" hreflang="fr" ...>` entries
  on every page that has a `fr` translation (per `translationKey` lookup).
- RSS at `/fr/rss.xml` and Atom at `/fr/feed.xml` exist with the new locale's
  posts (the feeds iterate `LOCALES` per ADR-005 Decision 9).
- `<html lang="fr">` on every `/fr/*` route.

**Quick smoke checks**:

```bash
# Routes for the new locale exist
ls dist/fr/

# RSS feed exists
ls dist/fr/rss.xml dist/fr/feed.xml

# Sitemap mentions the new locale
grep -c 'hreflang="fr"' dist/sitemap.xml
```

### 10. Update the memory bank

Update `docs/ai/memory/context.md` to mention the new locale shipped, including
the page-count baseline change (so the next session's pre-flight check has the
right number).

## Notes on what does NOT need to change

Per ADR-005, the following are **already N-locale-shaped** and require no edits
when adding a locale:

- `src/pages/[locale]/...` parametric route tree (Phase 2). `getStaticPaths`
  iterates `LOCALES.filter(l => l !== DEFAULT_LOCALE)` and picks up the new
  locale automatically.
- `src/utils/i18n.ts` helpers (`localePrefix`, `navUrl`, `postUrl`, `pageUrl`,
  `lt`, `getLocalisedPosts`, `getLocalisedPages`). They read `LOCALES` /
  `DEFAULT_LOCALE` from `siteConfig`.
- `src/utils/feeds.ts` — `buildRssFeed(locale)` and `buildAtomFeed(locale)` are
  locale-parameterised. The per-locale RSS/Atom files in `src/pages/[locale]/`
  pass through.
- `src/pages/sitemap.xml.ts` — iterates `LOCALES` and emits hreflang alternates
  per translation pair.
- `src/components/Header.astro` + `Footer.astro` — use `navUrl()` and `lt()`
  throughout; no locale-specific branches remain.
- The Astro Modular Settings plugin (fork `MMoMM-org/astro-modular-settings-mmomm`
  `feat/multi-locale-aware`) reads `[CONFIG:LOCALES]` and renders one URL row per
  configured locale in the navigation editor. No fork update required for added
  locales.
- `tools/migrate-from-hugo.mjs` + `tools/rename-image-attachments.mjs` — the
  `LOCALE_SOURCES`/`LOCALE_HUGO_BASES` tables reject unknown locales; if you
  intend to migrate Hugo content for the new locale, add an entry to each table
  with the right source directory (Phase 1 commit `29c577c`).

## Known cliffs

- **`findTranslation()` and `findPageTranslation()` (`src/utils/i18n.ts`) still
  hardcode bilingual lookup**:

  ```ts
  const otherLocale: Locale = post.data.lang === 'de' ? 'en' : 'de';
  ```

  For N > 2 locales, this returns one specific other-locale counterpart rather
  than "any available translation". The current behaviour breaks gracefully (it
  picks the wrong sibling in a 3-locale world), but the switcher will not list
  all available translations. Generalise to a list-returning helper when the
  third locale actually ships and the switcher is updated to render N-1 links.

- **Hreflang for N > 2** — `src/pages/sitemap.xml.ts` emits one `alternate` per
  translation pair. For N locales there are N-1 alternates per page. The current
  loop already iterates per-translation, so structurally it scales; verify
  against the build output that all N-1 alternates appear on a page that has
  all N translations.

- **The switcher in `src/components/Header.astro`** currently renders a single
  link to the other locale (the "DE↔EN switcher" of Phase 2b). For N locales,
  this needs to be replaced with a dropdown or N-1 inline links. Reopen when
  third locale ships.

These three are explicitly deferred (ADR-005 Deferred / Open Questions §1 and §4).
Adding a third locale to the codebase is safe; the UI affordances for selecting
between three locales will need a small follow-up.

## Reference commits

ADR-005 Phase 1–4:

- Phase 1 (schema): `c4c9006`..`29c577c` (6 commits)
- Phase 2 (route deduplication): `3b09b00`
- Phase 3 (plugin fork): `MMoMM-org/astro-modular-settings-mmomm`
  `feat/multi-locale-aware` — `c816b24`, `8b73433`, `d6596b4`, `ef6ac68` +
  vault `39ae100`
- Phase 4 (this runbook): TBD

See [ADR-005](../XDD/adr/ADR-005-multi-locale-architecture.md) for the full
architectural reasoning.
