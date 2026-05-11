# ADR-005: Multi-Locale Architecture — N-Locale-Ready Design with DE/EN MVP

Status: Proposed
Date: 2026-05-11

## Context

ADR-002 locked in a bilingual (DE+EN) i18n architecture for the Hugo→Astro migration.
Three subsequent ADRs built on that bilingual assumption: ADR-003 (per-locale navigation
with `urlEn` as the second-locale escape), ADR-004 (Vault CMS DE/EN content-types
workaround). Phase 2a/2b shipped the bilingual routing, switcher, RSS, sitemap, and
T9 strings table; Phase 2 also migrated the non-blog Hugo content (5 page pairs) to
bilingual `pages` collection entries.

The user has now stated a direction shift: the architecture should support
**N locales**, not just DE+EN. MVP target stays DE/EN (no third locale shipped this
sprint), but every schema decision, helper signature, and migration step taken from
now on must keep the path to "add a third locale" trivial. The user's own framing:
"wir müssen in richtung kompletten umbau auf multi language... mvp wird sein de/en..
später dann vielleicht en/xx und danach vielleicht sogar xx/yy/zz als sprachen"
(complete rebuild toward multi-language; MVP DE/EN; later EN/xx; eventually xx/yy/zz).

The original Next-Move #1 (fork `obsidian-astro-modular-settings` to safely re-enable
the Settings UI with `i18nKey`/`urlEn` preservation) is folded into this larger
architecture — it becomes Phase 3 of this ADR, not a standalone fork-tweak, because
a plugin that's only DE/EN-aware would have to be rewritten again the moment a third
locale lands.

This ADR replaces the "do #1 in isolation" plan from `context.md` with a phased
multi-locale architecture migration. No code lands in the session that produced
this ADR; this is design + impact map + phasing only.

## Findings — Blast-Radius Audit

Codebase scan against `feat/astro-modular` HEAD (`4a8a374`), excluding `dist/`,
`.astro/`, `public/`, `node_modules/`, and the Obsidian plugin bundles.

### Single-Locale Anchors (hard-coded source of truth)

| File | Line | Anchor | Generalisation needed |
|---|---|---|---|
| `src/utils/i18n.ts` | 3 | `export type Locale = 'de' \| 'en'` | Keep union for MVP; derive `Locale = typeof LOCALES[number]` so widening = one-line change |
| `src/utils/i18n.ts` | 5 | `DEFAULT_LOCALE: Locale = 'de'` | Re-source from `siteConfig.defaultLocale` |
| `src/utils/i18n.ts` | 6 | `LOCALES: readonly Locale[] = ['de', 'en']` | Re-source from `siteConfig.locales` |
| `src/config.ts` | 198 | `language: "de"` (single-string) | Replace with `locales: ['de', 'en']` + `defaultLocale: 'de'`; keep `language` as a derived/legacy accessor if any theme code still reads it |

### Locale-Coupled Branches (`=== 'de'` / `=== 'en'`)

21 occurrences across 11 files. Three classes:

| Class | Count | Files | Refactor pattern |
|---|---|---|---|
| **Other-locale lookup** (`post.lang === 'de' ? 'en' : 'de'`) | 4 | `src/utils/i18n.ts:39,65`, `src/layouts/BaseLayout.astro:59-60` | Helper `otherLocale(current)` — for 2-locale MVP returns the other; for N locales falls back to `defaultLocale` or accepts an explicit target |
| **URL prefix builder** (`lang === 'de' ? '' : '/' + lang`) | 3 | `src/utils/internallinks.ts:9,108`, `src/utils/i18n.ts:10` | `localePrefix()` already exists in `i18n.ts:9-11`; consolidate the two duplicate inlines |
| **Inline UI string** (`lang === 'de' ? 'Zeige' : 'Showing'`) | 6 | `src/pages/posts/index.astro:139,145`, `src/pages/posts/tag/[...tag].astro:141`, `src/pages/en/posts/index.astro:139,145`, `src/pages/en/posts/tag/[...tag].astro:141` | Move to `src/i18n/strings.ts` T9 table — Phase 2 String migration claim in `context.md` missed these |
| **Locale-keyed branches in strings.ts** | 6 | `src/i18n/strings.ts:87,96,104,106,107,112` | Replace `locale === 'de' ? a : b` ternaries with per-locale function table: `const formatters: Record<Locale, Formatter>` |
| **Date-format default** | 2 | `src/utils/markdown.ts:175,205` | `formatDate(date, locale)` — drop `= 'de'` default; require explicit locale |

### `urlEn` (bilingual escape hatch)

7 occurrences across 5 files:

| File | Lines | Purpose | Migration |
|---|---|---|---|
| `src/types.ts` | 36-37 | `urlEn?: string` field on NavigationItem | Replace with `urlByLocale?: Partial<Record<Locale, string>>` |
| `src/config.ts` | 320-334 | Override URLs for slug-divergent pages (`/ueber-mich/` ↔ `/en/about/`) | Translate 4 nav items to `urlByLocale: { en: "..." }` |
| `src/components/Header.astro` | 42-52 | URL resolver — uses urlEn when `locale === 'en'` | `urlByLocale[locale] ?? defaultUrlFor(locale, item.url)` |
| `src/components/Footer.astro` | 20-24 | Same resolver, footer copy | Same — extract shared helper to `i18n.ts` |

### Hard-coded `/en/` URL Strings

42 occurrences across 19 files. Three categories:

| Category | File examples | Refactor pattern |
|---|---|---|
| **Route literals** (`<a href="/en/posts/">`) | `src/components/PostCard.astro`, `src/components/LocalGraph.astro`, `src/components/Header.astro`, `src/layouts/PostLayout.astro` | Use `postUrl()`/`pageUrl()`/`localePrefix(locale) + "/posts/"` everywhere — these are existing helpers |
| **Image / asset path prefix** (`/en/posts/<slug>/<file>`) | `src/utils/images.ts`, `src/utils/internallinks.ts`, `scripts/sync-images.js`, `scripts/generate-graph-data.js`, `scripts/check-missing-images.js` | Use `localePrefix(lang) + '/posts/' + slug` — image pipeline ADR-002 path-based-slug-detection rule is already applied; the `/en/` literal is just the bilingual concretion |
| **Hugo migration / image renamer scripts** | `tools/migrate-from-hugo.mjs`, `tools/rename-image-attachments.mjs` | Take `--locale` arg; map locale → Hugo source root (HUGO_DE/HUGO_EN constants in renamer) |

### Route File Duplication

`src/pages/en/posts/` contains 7 `.astro` files that mirror `src/pages/posts/` 1:1 —
the bilingual route tree decided in ADR-002 Decision 4. Beyond ~22 LOC per duplicate
that diverges (locale prop value, getStaticPaths filter), the files are clones.

```
src/pages/posts/index.astro                       ↔ src/pages/en/posts/index.astro
src/pages/posts/[...slug].astro                   ↔ src/pages/en/posts/[...slug].astro
src/pages/posts/[page].astro                      ↔ src/pages/en/posts/[page].astro
src/pages/posts/tag/[...tag].astro                ↔ src/pages/en/posts/tag/[...tag].astro
src/pages/posts/tag/[...tag]/[page].astro         ↔ src/pages/en/posts/tag/[...tag]/[page].astro
src/pages/[...slug].astro                         ↔ src/pages/en/[...slug].astro
src/pages/index.astro                             ↔ src/pages/en/index.astro
```

For each new locale, 7 more files must be hand-copied. Not viable beyond N=3.

### Per-Locale Site Information (currently single-string)

| Field | Current | Migration |
|---|---|---|
| `siteConfig.title` | `"MingleMangleOfMyMind"` | `LocalisedString` — same value both locales for MVP |
| `siteConfig.description` | DE-only string | `LocalisedString` — must populate EN |
| `siteConfig.homepageTitle` | `""` (empty, falls back to title) | `LocalisedString` |
| `siteConfig.author` | `"Marcus Breiden"` | Keep as `string` — locale-neutral |
| `siteConfig.seo.defaultOgImageAlt` | `"MingleMangleOfMyMind logo."` | `LocalisedString` |
| `siteConfig.footer.content` | Single HTML string | `LocalisedString` |
| `siteConfig.profilePicture.alt` | Single string | `LocalisedString` |

## Decisions

### 1. MVP keeps `Locale = 'de' | 'en'`; APIs are N-locale-shaped

The TypeScript `Locale` union stays as `'de' | 'en'` for the MVP — no premature
generalisation to `string`. But every helper, schema field, and component
prop is designed so that the only changes required to add a third locale `'fr'`
are:

1. Widen the union: `type Locale = 'de' | 'en' | 'fr'`
2. Add to `siteConfig.locales: ['de', 'en', 'fr']`
3. Populate per-locale strings in `src/i18n/strings.ts` and any `LocalisedString` values
4. Optionally provide `urlByLocale` overrides where slugs diverge

No call sites need touching. No new route files. No new component branches.

**Rationale**: keeps MVP compile-tight (TypeScript catches every missing locale
in `Record<Locale, string>` shapes); generalisation to `Locale = typeof LOCALES[number]`
is itself a one-line change deferred to the moment it's needed.

### 2. Source of truth = `siteConfig.locales` + `defaultLocale`

```ts
// src/config.ts
locales: ['de', 'en'] as const,   // [CONFIG:LOCALES]
defaultLocale: 'de' as const,     // [CONFIG:DEFAULT_LOCALE]
```

`src/utils/i18n.ts` re-exports these as `LOCALES` and `DEFAULT_LOCALE` for ergonomic
imports. The legacy `language: "de"` field is **removed** — it caused two sources of
truth (config + Locale union) and is read by no astro-modular core path that the
current theme uses (verified by grep: only consumed by `BaseLayout.astro` for the
`<html lang>` attribute, which already prefers a passed `lang` prop).

New `[CONFIG:LOCALES]` and `[CONFIG:DEFAULT_LOCALE]` markers replace `[CONFIG:SITE_LANGUAGE]`.
The plugin (Phase 3) parses these.

### 3. `LocalisedString` shape: required-all `Record<Locale, string>`

```ts
// src/utils/i18n.ts
export type LocalisedString = Record<Locale, string>;

export function lt(locale: Locale, value: LocalisedString | string): string {
  return typeof value === 'string' ? value : value[locale];
}
```

The `lt()` helper (locale-translate, distinct from existing `t()` for T9 keys)
accepts both shapes so migrations can land field-by-field without breaking the
build. Migration rule: every consumer of a `LocalisedString` field threads `locale`
through and calls `lt()`. Plain-string call sites are accepted as backwards-compat
during the transition.

**Why required-all** (not `Partial<Record<Locale, string>>` with fallback): TypeScript
enforces parity at compile time. Forgetting to add an EN value when adding a
French translation surfaces immediately, not at runtime on a single page.

### 4. `urlEn` → `urlByLocale: Partial<Record<Locale, string>>`

```ts
// src/types.ts
export interface NavigationItem {
  title: string | LocalisedString;       // legacy: i18nKey wins if both present
  i18nKey?: string;                       // existing — preferred over title
  url?: string;                            // canonical/default-locale URL
  urlByLocale?: Partial<Record<Locale, string>>;
  external?: boolean;
  children?: NavigationItem[];
}
```

Resolver (extracted from `Header.astro:42-52` + `Footer.astro:20-24` into `i18n.ts`):

```ts
export function navUrl(item: NavigationItem, locale: Locale): string {
  const override = item.urlByLocale?.[locale];
  if (override) return override;
  if (!item.url) return '#';
  if (item.external) return item.url;
  // Default: prefix non-default-locale routes with /<locale>/
  return locale === DEFAULT_LOCALE ? item.url : `${localePrefix(locale)}${item.url}`;
}
```

The 4 nav items currently using `urlEn` migrate to `urlByLocale: { en: "..." }`
in `src/config.ts`. The plugin (Phase 3) handles the object shape.

### 5. Route deduplication via `src/pages/[locale]/...`

`src/pages/en/posts/...` (7 files) collapses into a single non-default-locale tree:

```
src/pages/posts/...               # default locale (DE) at root URL paths
src/pages/[locale]/posts/...      # non-default locales — same 7 file shape
```

`getStaticPaths` in the parameterised tree iterates over
`LOCALES.filter(l => l !== DEFAULT_LOCALE)`. The default locale's tree stays at the
root paths because Astro's `i18n.routing.prefixDefaultLocale: false` (ADR-002
Decision 4) requires non-prefixed default routes — keeping them as a separate file
tree is the simplest realisation that preserves that contract.

**Cost**: a one-shot route refactor in Phase 2. **Benefit**: adding a third locale
requires zero new route files, only data.

### 6. `src/i18n/strings.ts` — per-locale function table, not ternaries

Replace 6 `locale === 'de' ? a : b` branches (lines 87-112 in
`src/i18n/strings.ts`) with a `Record<Locale, Formatter>` table per pluralisation
function. Example (`tWordCount`):

```ts
const wordCountFormatters: Record<Locale, (count: number) => string> = {
  de: (n) => n === 1 ? '1 Wort' : `${formatNumber(n, 'de')} Wörter`,
  en: (n) => n === 1 ? '1 word'  : `${formatNumber(n, 'en')} words`,
};
export const tWordCount = (locale: Locale, count: number) =>
  wordCountFormatters[locale](count);
```

Adding a third locale means adding a key to each formatter table — TypeScript flags
the missing key at compile time. This makes the T9 strings file itself N-locale-ready
without touching every consumer.

### 7. Plugin fork strategy — Phase 3, fully locale-aware

Defer the plugin fork to Phase 3, AFTER schema + routes are migrated. Fork
`davidvkimball/obsidian-astro-modular-settings` → `MMoMM-org/astro-modular-settings-mmomm`
(true GitHub fork, analog ADR-001). Scope:

1. **`NavigationItem` editor** — extends type with `i18nKey`, `urlByLocale`, `external`.
   `urlByLocale` rendered as a per-locale URL row generated from `siteConfig.locales`
   (no hardcoded DE/EN tabs — driven by locales array).
2. **`LocalisedString` editor** — for every site-info field that is `LocalisedString`,
   render N inputs (one per locale) instead of a single text box. Locale list read
   from `[CONFIG:LOCALES]`.
3. **New markers**: `[CONFIG:LOCALES]`, `[CONFIG:DEFAULT_LOCALE]`,
   `[CONFIG:NAVIGATION_FOOTER]` (parallel to `NAVIGATION_PAGES`).
4. **Plugin marker scheme for `LocalisedString` fields**: object-literal parsing
   under the same marker, not split per-locale markers — keeps the marker count
   stable when adding a locale, and keeps the source-of-truth as the JS object,
   not a marker schema.

The fork ships as a release alongside the schema migration so re-enabling the plugin
in the Obsidian vault is the final step of Phase 3, not earlier.

### 8. Vault CMS strategy preserved (ADR-004 Decision 1 reaffirmed)

Vault CMS already configures per-locale content-types ("Posts (DE)" → `posts/de/`,
"Posts (EN)" → `posts/en/`). For each new locale: add one content-type entry per
content collection per locale via Vault CMS settings — manual but bounded.

This stays "configure-only, no fork" because the plugin treats content-types as
opaque entries and has no notion of locale to begin with — adding more just works.

Document a runbook step in Phase 4: "Adding a locale" includes "duplicate each
Vault CMS content-type with the new locale tag".

### 9. Hreflang and sitemap

`src/pages/sitemap.xml.ts` and per-locale RSS/Atom feeds in `src/utils/feeds.ts`
iterate `LOCALES` rather than hardcoded `['de', 'en']`. Per-pair `<link rel="alternate" hreflang="...">`
emits N-1 alternates per page (one per non-current locale that has a translation
via `translationKey`).

For MVP DE/EN this is identical to today's behaviour; the change is structural.

### 10. Hugo migration tooling — locale-parameterised

`tools/migrate-from-hugo.mjs` and `tools/rename-image-attachments.mjs` take a
`--locale <de|en>` flag (already present in `migrate-from-hugo.mjs` per ADR-002
Phase 1) and map locale → Hugo source dir via an explicit table, not hardcoded
HUGO_DE/HUGO_EN constants. This is a Phase 1 cleanup and is the lowest-risk part
of the entire migration.

## Consequences

**Positive**

- Adding a third locale becomes a localised, low-blast-radius change: extend
  the union, populate `LocalisedString` values, optionally provide `urlByLocale`
  overrides. No route files, no schema edits, no plugin work beyond data entry.
- TypeScript enforces locale parity at compile time on every `LocalisedString`
  field and every per-locale formatter table — missing translations cannot ship.
- Single source of truth for the locale list (`siteConfig.locales`) — removes
  the current 3-way drift hazard (config `language`, Locale union literal,
  `LOCALES` constant).
- Plugin fork scope is locked in early — no second rewrite when third locale
  arrives.
- Route deduplication kills 7 files of bilingual clone code, eliminating the
  drift class that produced the 5 EN-route URL bugs caught in Phase 1/2.

**Negative / costs**

- Phase 2 (route deduplication) is a single large refactor that touches every
  page-route file and `getStaticPaths` — high blast radius for a single commit.
  Mitigation: ship Phase 2 only after Phase 1 build is green and all tests pass;
  squash-merge after manual smoke test of every route shape.
- Plugin fork (Phase 3) is a substantial effort (estimated 2-3 sessions) that
  doesn't ship user-visible value — only restores Settings-UI editability that's
  currently disabled by plugin clobber.
- `LocalisedString` adoption means every site-info field needs a new value entered
  for EN — content creation cost, not just code refactor.
- ADR-002 Decision 4 (parallel `src/pages/posts/` + `src/pages/en/posts/` trees)
  is preserved structurally but reshaped: default tree stays at the root, all
  non-default locales live under `[locale]/`. Existing redirects from `/blog/`
  remain valid.

## Alternatives Considered

**Keep bilingual hardcoding; tactical patch the plugin for `urlEn` preservation only**

The original Next-Move #1. Rejected: every line of plugin code written for
DE+EN-only must be rewritten when a third locale lands. The user has explicitly
signalled that third locale is on the roadmap, even if undated. Doing this work
twice costs strictly more than doing it once.

**Generalise `Locale` to `string` (or `typeof LOCALES[number]` derived from a runtime array) immediately**

Rejected for MVP. Widening the union loses compile-time enforcement of `Record<Locale, string>`
exhaustiveness — TypeScript stops catching missing translations. Keep the literal union;
let widening be the single planned change when a third locale ships.

**Use an external i18n library (paraglide, astro-i18n, etc.)**

Not considered in depth. The existing T9 strings table already covers UI strings
in a typed, compile-checked way. The remaining locale-coupling is structural
(routes, URLs, plugin config) — areas where external libraries don't add value
proportional to integration cost. Revisit if Phase 1's per-locale function table
becomes unwieldy.

**Two completely separate Astro projects for DE and EN**

Rejected for the same reasons as ADR-002 (deployment surface, cross-project link
resolution). N=3+ makes this even worse.

## Implementation Phases

Each phase is independently shippable. Phase boundaries are commit-revertable.

### Phase 1 — Schema migration foundation (~1 session)

1. Add `siteConfig.locales` + `siteConfig.defaultLocale` to `src/config.ts`
2. Update `src/utils/i18n.ts` to re-source `LOCALES`/`DEFAULT_LOCALE` from config
3. Remove `siteConfig.language` field; update any reader to use `defaultLocale`
4. Add `LocalisedString` type + `lt()` helper to `src/utils/i18n.ts`
5. Migrate site-info fields one at a time to `LocalisedString`:
   - `title`, `description`, `homepageTitle`, `defaultOgImageAlt`, `footer.content`,
     `profilePicture.alt`
6. Refactor `urlEn` → `urlByLocale` in `src/types.ts`, `src/config.ts`,
   `Header.astro`, `Footer.astro`; extract `navUrl()` to `i18n.ts`
7. Refactor `src/i18n/strings.ts` formatters to per-locale function table
8. Fix the 4 inline-string leaks in pages (`'Zeige' / 'Showing'`)
9. Refactor `formatDate`/`formatDateMobile` to require explicit locale
10. Refactor `tools/migrate-from-hugo.mjs` + `rename-image-attachments.mjs` to
    locale-parameterised source-dir tables
11. Verify `pnpm build` produces same page count + same URLs as today

### Phase 2 — Route deduplication (~1-2 sessions)

1. Create `src/pages/[locale]/posts/...` tree mirroring current `posts/` shape
2. `getStaticPaths` in each parameterised file iterates non-default locales
3. Delete `src/pages/en/...` files one by one as parameterised replacements
   verify-build-clean
4. Verify all URLs unchanged via build-output diff
5. Verify hreflang/sitemap/RSS output unchanged

### Phase 3 — Plugin fork (multi-locale aware) (~2-3 sessions)

1. Fork `davidvkimball/obsidian-astro-modular-settings` → `MMoMM-org/astro-modular-settings-mmomm`
2. Patch `NavigationItem` type and editor for `i18nKey`/`urlByLocale`/`external`
3. Add `LocalisedString` field editor (N inputs from `[CONFIG:LOCALES]`)
4. Add `[CONFIG:NAVIGATION_FOOTER]`, `[CONFIG:LOCALES]`, `[CONFIG:DEFAULT_LOCALE]` markers
5. Build, install, smoke test re-enable + edit-via-UI without config.ts clobber
6. Push fork; add release-mirror workflow (analog ADR-001 Deferred Work #1)
7. Re-enable plugin in `src/content/.obsidian/community-plugins.json`

### Phase 4 — Documentation + "add a locale" runbook (~0.5 sessions)

1. Write `docs/runbooks/add-a-locale.md`:
   widen Locale union → add locales[] entry → populate strings → add Vault CMS
   content-types → optionally add urlByLocale overrides → build → verify
2. Update memory: `tools.md` durable rule on the Locale anchor; `decisions.md`
   ADR-005 entry; `context.md` next-move-list rewrite
3. Update README if it references "bilingual" specifically

### Deferred — Locale type generalisation

Until a third locale is actually shipped: the union stays `'de' | 'en'`. When the
third locale lands, widen the union in one line and add to `siteConfig.locales`.
No separate ADR needed for that mechanical change; this ADR records the intent.

## Relation to Existing ADRs

- **ADR-001** (theme fork) — orthogonal; theme fork carries any Phase 1/2
  component-level i18n edits as it already does. No revision needed.
- **ADR-002** (bilingual i18n) — Decision 4 (route trees) **revised by Decision 5
  here**: parameterised `[locale]/` tree replaces hardcoded `src/pages/en/`.
  Decision 5 (schema) preserved. Decision 6 (UI translations) **extended by
  Decision 6 here**: per-locale function table for formatters.
- **ADR-003** (per-locale nav) — Decision 3 (`urlEn` escape hatch) **revised by
  Decision 4 here**: replaced with `urlByLocale: Partial<Record<Locale, string>>`.
  The "plugin compatibility" decision (#1 in ADR-003) is preserved structurally
  but reshaped — the plugin (post-fork) understands the new field; the constraint
  becomes "non-forked plugin compatibility" historical.
- **ADR-004** (Vault CMS + content structure) — Decision 1 (per-locale content-types,
  no fork) **reaffirmed for N>2**: the workaround scales linearly with the locale
  count. Decision 4 (bilingual schema fields on pages) generalises naturally —
  `lang: z.enum([...locales])` once the locale list is the source of truth.

## Deferred / Open Questions

1. **Plugin marker scheme for `LocalisedString` values** — Phase 3 picks between
   (a) object-literal under the existing marker, or (b) per-locale split markers
   like `[CONFIG:SITE_TITLE.DE]`. Decision deferred to Phase 3 implementation
   because it depends on the plugin's existing parser capabilities.
2. **Hreflang policy for N>2** — current ADR-002 emits a 1:1 alternate. With
   N=3+ locales, sitemap entries fan out as N-1 alternates each. Behaviour spec
   to be confirmed against Google's hreflang recommendations during Phase 1.
3. **Author field localisation** — kept as `string` (locale-neutral) in this ADR.
   Reopen if multi-author or transliteration use cases emerge.
4. **`urlByLocale` for non-existing translations** — when a nav item points at
   a page that doesn't exist in locale X, current behaviour will emit a broken
   URL. Phase 2 decides whether to filter such items at render time or accept
   the broken-link cost in exchange for stable nav shape.

## Decision Log

This ADR was preceded by a session-checkpoint context restore from 2026-05-11
14:30 UTC. The original task ("fork plugin for `urlEn`/`i18nKey` preservation")
was reframed on user input "wir müssen in richtung kompletten umbau auf multi
language" during the same session. No code lands in this ADR's session; Phase 1
begins in a follow-up session after user approval.
