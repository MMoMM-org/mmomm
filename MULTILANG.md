# Multilingual Workflow Guide

> Day-to-day guide for working with MMoMM's bilingual (DE/EN) setup.
> For the architectural reasoning see [ADR-002](docs/XDD/adr/ADR-002-i18n-architecture.md)
> and [ADR-005](docs/XDD/adr/ADR-005-multi-locale-architecture.md). For adding a
> third locale see [docs/runbooks/add-a-locale.md](docs/runbooks/add-a-locale.md).
>
> Last verified: **2026-05-12** — ADR-005 Phases 1–4 all shipped.

## TL;DR

- DE content lives at root URLs (`/posts/foo/`), EN at `/en/...` (`/en/posts/foo/`).
- DE files live in `src/content/{posts,pages}/de/`, EN in `src/content/{posts,pages}/en/`.
- Two files form a "translation pair" when they share the same `translationKey:`
  string in frontmatter — that's the only link mechanism.
- UI labels are translated via the T9 strings table at `src/i18n/strings.ts` —
  TypeScript enforces every key has a value for every locale.
- Site-info fields (`title`, `description`, `footer.content`, …) are `LocalisedString`
  objects in `src/config.ts`: `{ de: "…", en: "…" }`. TypeScript enforces parity.
- Two forks are involved: `astro-modular-mmomm` (theme, i18n-patched components)
  and `astro-modular-settings-mmomm` (Obsidian plugin, i18n-safe config editor).

## File map — where everything i18n-relevant lives

| Path | Role |
|---|---|
| `src/content/posts/de/<slug>/index.md` | DE post body + frontmatter |
| `src/content/posts/en/<slug>/index.md` | EN post body + frontmatter |
| `src/content/pages/de/<slug>.md` | DE static page (about, impressum, …) |
| `src/content/pages/en/<slug>.md` | EN static page |
| `src/content/special/` | Locale-neutral pages (404, home blurb, /now/) — no `lang` field |
| `src/content.config.ts` | Frontmatter schema — `lang: z.enum(['de','en'])` lives here |
| `src/config.ts` | Site config — `locales`, `defaultLocale`, `LocalisedString` site-info, `navigation.pages`, `navigation.footer` |
| `src/i18n/strings.ts` | T9 UI labels — `Record<Locale, StringMap>` (compile-time parity) |
| `src/utils/i18n.ts` | Helpers: `lt()`, `navUrl()`, `localePrefix()`, `postUrl()`, `pageUrl()`, `findTranslation()`, `findPageTranslation()` |
| `src/types.ts` | `Locale` union + `LocalisedString` type (single source of truth) |
| `src/pages/[locale]/...` | Parametric routes for non-default locales (Phase 2 dedup) |
| `src/pages/...` (no `[locale]/`) | Default-locale (DE) routes at root URLs |
| `src/pages/sitemap.xml.ts` | Emits hreflang alternates per translation pair |
| `src/content/bases/Home.base` | Default Obsidian landing tab — includes "🔴 Translation gaps" view |
| `src/content/bases/Translation-Pairs.base` | Dedicated triage: posts/pages grouped by `translationKey` |
| `tools/migrate-from-hugo.mjs` | Hugo → Astro migrator (locale-parameterised via `--locale`) |

## Day-to-day workflows

### Author a bilingual post

The vault is Obsidian; the editor surface is Vault CMS + Astro Composer. Both
are configured with per-locale content-types (ADR-004 Decision 1).

1. **Create the DE original**:
   - In Obsidian, "New from template" → pick **Posts (DE)**.
   - The template pre-fills `lang: de`, `translationKey: ""`, plus the rest of
     the post schema (date, tags, image, draft, …). File lands at
     `src/content/posts/de/<slug>/index.md`.
2. **Choose a `translationKey`**:
   - Open the new file's frontmatter, set `translationKey:` to a sprechenden,
     kebab-case string that's unique in the repo. Convention: usually the
     DE slug minus locale-specific bits, or a neutral handle.
   - Example: a DE post about Obsidian Dynbedded → `translationKey: "obsidian-dynbedded"`.
3. **Write and save the DE post**.
4. **Create the EN counterpart**:
   - "New from template" → **Posts (EN)**. File lands at
     `src/content/posts/en/<slug>/index.md` with `lang: en`,
     `translationKey: ""`.
   - **Copy the same `translationKey`** string from the DE post. Identical
     match — Strings müssen 100% gleich sein.
5. **Verify the link** — open `bases/Translation-Pairs.base` → "Posts —
   Translation Pairs" view. Both posts should appear under the same group
   header (the shared `translationKey`). Singletons mean either (a) only
   one half exists yet, or (b) a typo in one of the keys.

#### Slugs can differ; `translationKey` cannot

The DE slug and EN slug may freely diverge — that's intentional, so each
locale can have idiomatic URLs (`/posts/ueber-mich/` vs `/en/posts/about-me/`).
The pairing is exclusively through `translationKey`. The slug-divergent case
is the whole reason `translationKey` exists.

#### What linking gets you automatically

| Surface | Effect |
|---|---|
| Header language switcher | Click 🇩🇪/🇬🇧 → jumps to the paired post (not the homepage or a 404) |
| `sitemap.xml` | Each member of the pair gets a `<xhtml:link rel="alternate" hreflang="…">` to the other |
| Per-locale RSS/Atom (`/rss.xml`, `/en/rss.xml`) | Per-locale feed includes only that locale's posts |
| Featured-post selection on homepage | If `siteConfig.homeOptions.featuredPost.slug` doesn't exist in the current locale, `findTranslation()` is queried via `translationKey` to find the locale-matched counterpart |

### Author a bilingual static page

Same flow as posts, but:

- Templates: **Pages (DE)** / **Pages (EN)** content-type pickers.
- Files land at `src/content/pages/de/<slug>.md` (no nested folder; pages
  are single-file).
- Schema: `lang` + `translationKey` are required on every page (per
  ADR-004 Decision 4).
- If the slug differs in EN (e.g. `ueber-mich` ↔ `about`), also update
  `siteConfig.navigation.pages[i].urlByLocale.en` in `src/config.ts`
  — otherwise the nav link points at `/en/ueber-mich/` (which 404s).

### Add or edit a nav item

`src/config.ts` → `siteConfig.navigation.pages` (header) or `.footer` (legal
links row). Item shape:

```ts
{
  title: "Über mich",              // canonical / default-locale label
  i18nKey: "nav.about",            // T9 key for the translated label
  url: "/ueber-mich/",             // canonical / default-locale URL
  urlByLocale: { en: "/en/about/" }, // override URL per locale when slugs diverge
  external: false,                  // optional: skip locale-prefix when true
  icon: "github"                    // optional: lucide icon name
}
```

Then add the matching label to `src/i18n/strings.ts`:

```ts
// in StringMap type:
'nav.about': string;
// in strings.de:
'nav.about': 'Über mich',
// in strings.en:
'nav.about': 'About',
```

For **locale-neutral routes** (a single URL that's the same in every locale,
like `/now/`): set every locale to the same URL.

```ts
urlByLocale: { de: "/now/", en: "/now/" }
```

This defeats the automatic `/<locale>/` prefix.

#### Editing nav via the Astro Modular Settings plugin

The Astro Modular Settings plugin (`MMoMM-org/astro-modular-settings-mmomm`
fork) now round-trips `i18nKey`, `urlByLocale`, `external` and `navigation.footer`
without clobbering them (ADR-005 Phase 3). Editing the nav through the plugin
UI is safe.

**One rule**: comments must live **ABOVE** `pages:` / `footer:`, never inside
the array literal. The in-place serializer replaces the `[…]` body on save,
and inline comments between items would be wiped. See `src/config.ts:330+`
for the canonical example.

### Edit a `LocalisedString` site-info field

`siteConfig.title`, `description`, `homepageTitle`, `seo.defaultOgImageAlt`,
`footer.content`, `profilePicture.alt` are all `Record<Locale, string>`.

```ts
description: {
  de: "PKM, Obsidian, MiYo, AI und anderes Gedöns",
  en: "PKM, Obsidian, MiYo, AI, and other oddments",
}
```

Edit either in your editor or via the plugin UI. **TypeScript enforces parity** —
forgetting a locale is a compile error, not a silent fallback.

### Add or change a UI label (T9 string)

UI strings (pagination "Previous", reading-time "5 min read", "All Posts", …)
live in `src/i18n/strings.ts` as a `Record<Locale, StringMap>`.

1. Add the new key to the `StringMap` type (top of the file).
2. Add a value to **both** `de:` and `en:` blocks. TypeScript will refuse to
   compile if either is missing.
3. Use it at the call site via `t(locale, 'my.new.key')`.

For string keys that come from untyped data (e.g. plugin-config nav items),
use the safer `tOpt(locale, key, fallback)` — it returns the fallback if the
key is unknown.

For phrases that need interpolation or grammar-aware plural handling, see
the per-locale function tables in the same file (`pageOfTotalFormatters`,
`wordCountFormatters`, …). Add a `de:` and `en:` callback; TypeScript enforces
all locales are covered.

### Translation triage — what's untranslated?

Open Obsidian, switch to the `Home.base` default tab. Two relevant views:

- **🔴 Translation gaps** — flat list of posts/pages where `translationKey`
  is empty or null. Direct triage queue.
- **All Content** — every file in the vault grouped by folder.

For the full pair-view experience, open `bases/Translation-Pairs.base`. Three
views: posts grouped by translationKey, pages grouped by translationKey, and
the missing-key triage list. Singletons (translationKey set but only one half
present) appear as a lone card under their own header — visually obvious that
the counterpart needs writing.

Both base files share two formulas (`Locale`, `Translation Key or Missing`)
— keep them identical across both files so future locale-widening (e.g.
add `fr`) is a one-line edit in two places.

### Build verification

```bash
pnpm build      # produces 59 pages today (DE + EN)
```

Expected output: `59 page(s) built`. If the count drops, a route may have
broken; if it grows unexpectedly, something started fanning out per-locale
where it shouldn't.

Quick spot-checks:

```bash
# Routes exist for both locales
ls dist/posts/ dist/en/posts/

# hreflang alternates in sitemap
grep -c 'hreflang="de"' dist/sitemap.xml
grep -c 'hreflang="en"' dist/sitemap.xml

# Per-locale RSS feeds exist
ls dist/rss.xml dist/en/rss.xml
```

### Adding a third locale

See [`docs/runbooks/add-a-locale.md`](docs/runbooks/add-a-locale.md) — the
canonical N-locale-add procedure. Three known cliffs are documented there
(bilingual `findTranslation` lookup, single-link switcher in `Header.astro`,
hreflang fan-out verification).

## The two forks — who owns what

Two MMoMM-org GitHub forks live alongside this site repo. They are *not*
this repo — they're sibling working trees on disk. The parent workspace map
is `../CLAUDE.md` (`/Volumes/Moon/Coding/MMoMM.org/CLAUDE.md`).

### `MMoMM-org/astro-modular-mmomm` — the **theme** fork

**Local path**: `../astro-modular-mmomm/` (sibling repo).
**Upstream**: `davidvkimball/astro-modular`.
**Why we forked**: upstream's `pnpm run update` wipes every file outside
`USER_PATHS`, so any i18n-aware component edits (Header, Footer, PostCard,
sitemap, …) would be lost on every theme upgrade. The fork carries those
patches in version control (ADR-001).

**What lives in the theme fork**:

- `src/components/{Header,Footer,PostCard,…}.astro` with locale-aware logic
  (`navUrl()` calls, `lt()` for `LocalisedString`, `localePrefix()` for URLs).
- `src/layouts/{Base,Post,Page}Layout.astro` that thread `lang` through.
- `src/utils/i18n.ts` (the helpers themselves).
- `src/utils/internallinks.ts` and `src/utils/images.ts` with path-based-slug
  detection that skips locale folders (the "Path-based slug detection must
  skip locale folder" rule in `docs/ai/memory/general.md`).
- `src/pages/[locale]/...` parametric route tree (Phase 2 dedup).
- `src/types.ts` with the `Locale` union + `LocalisedString` type.
- `tools/migrate-from-hugo.mjs` and `tools/rename-image-attachments.mjs`
  with locale-parameterised source-dir tables.

**When to edit the theme fork (not the site)**:

- Touching anything in `src/components/`, `src/layouts/`, `src/utils/`,
  `src/pages/` (except `src/pages/index.astro` and special-collection routes),
  `src/types.ts`, the migration tools, or `scripts/update.mjs`.
- Adding new locale-aware UI affordances (e.g. a locale dropdown when locale
  count > 2 — see runbook's "known cliffs").

**When to edit the site (this repo) instead**:

- Anything under `src/content/`, `src/config.ts`, `src/i18n/strings.ts`
  (the site's UI labels), `src/content.config.ts` (the site's schema),
  `docs/`, `.claude/`, `claude-docker*/`, `.astro-modular-user-paths`,
  `pnpm-workspace.yaml`. These are the `USER_PATHS` the update script
  preserves — they don't belong in the theme fork.

**How to pull theme updates into the site**:

```bash
# from the site repo
pnpm run update
```

This pulls the fork's `master` branch via GitHub API, overlays files outside
`USER_PATHS`, and records the new SHA in `.astro-modular-source` (gitignored).
Override transiently with `ASTRO_MODULAR_REPO=…` / `ASTRO_MODULAR_BRANCH=…`.

**How to push site theme edits up to the fork**: see the "Fork-sync workflow"
section in `docs/ai/memory/tools.md`. Short version: clone fork to scratch
dir, copy changed files, bundle as one commit per logical milestone, push
fork master, update local `.astro-modular-source` to the new SHA.

### `MMoMM-org/astro-modular-settings-mmomm` — the **plugin** fork

**Local path**: `../obsidian-astro-modular-settings-mmomm/` (sibling repo).
**Upstream**: `davidvkimball/obsidian-astro-modular-settings`.
**Current branch**: `feat/multi-locale-aware`.
**Why we forked**: the upstream plugin's `data.json`→`config.ts` sync silently
drops `i18nKey`, `urlByLocale`, `external`, `navigation.footer`, and
`LocalisedString` shapes — fields the upstream model doesn't know about.
Re-enabling the plugin pre-fork meant a guaranteed config.ts clobber on the
next sync. The fork teaches the plugin those fields and round-trips them
losslessly (ADR-005 Phase 3, shipped 2026-05-12).

**What the fork does** (four architectural keys, condensed):

1. **Load-time overlay**: `loadSettings()` parses `config.ts` after `data.json`
   loads and overrides the fields data.json can't faithfully represent. config.ts
   is the source of truth; data.json is a cache.
2. **In-place array rewrite**: serializer replaces only the `[…]` body of
   `pages:` / `footer:`, not the whole region between markers — preserves
   sibling marker-less fields.
3. **Comment-aware value parser**: skips `//` and `/* */` everywhere
   whitespace is skipped, so doc-comments between items / between marker
   and field don't break parsing.
4. **Marker-anchored index-scan**: replaces the fragile
   `\s*\n\s*<field>:` regex; tolerant of intervening comments.

**When to edit the plugin fork**:

- The plugin's i18n model needs to learn about a new field (e.g. add a new
  optional locale-keyed property on `NavigationItem`).
- The parser/serializer hits an edge case (intervening comment shapes,
  marker placement, …).
- Upstream `davidvkimball/obsidian-astro-modular-settings` advances and a
  merge is needed.

**How to refresh the plugin in the vault after a fork change**:

```bash
cd ../obsidian-astro-modular-settings-mmomm
pnpm install --ignore-scripts    # --ignore-scripts: upstream preinstall references a missing scripts/npm-proxy.mjs
pnpm build                       # tsc -noEmit -skipLibCheck && esbuild production
cp main.js manifest.json styles.css ../astro-mmomm/src/content/.obsidian/plugins/astro-modular-settings/
```

Then in Obsidian: reload (Cmd-R) or restart. Run `git diff src/config.ts`
after the next plugin-driven save as a sanity check.

**Operating rule once enabled**: comments must live **ABOVE** `pages:` /
`footer:`, never inside the array literal. The in-place serializer replaces
the `[…]` body and would wipe inline comments between items. (Comments
between the marker and the field name are preserved.)

## Common pitfalls

- **Typo in `translationKey`**: silent failure. Build doesn't catch it,
  switcher just finds nothing, hreflang skips the alternate. Check via the
  Translation-Pairs base view, not by re-reading the files.
- **Empty `translationKey` (`""`)**: explicitly "no translation". Schema
  accepts it (the field is `.optional()`); switcher falls back to naive
  `/en/`-prefix-strip — works for same-slug pages, breaks silently when
  slugs diverge.
- **Locale-neutral pages need `urlByLocale` pinning**: a single-URL page
  served from `src/content/special/` (like `/now/`) must have every locale
  in `urlByLocale` pointing at the same URL — otherwise the EN header link
  goes to `/en/now/` which doesn't exist.
- **`translationKey` is a neutral handle, not a slug or a URL**: it identifies
  the *pair*, not the page. Don't put `/posts/foo/` in it; put `foo` or
  `my-topic-handle`.
- **Path-based slug detection must skip the locale folder**: when writing a
  remark plugin or content-pipeline script that needs `post.id` → slug
  conversion, the locale folder is the FIRST segment of the id (`de/foo`,
  `en/foo`), not the slug. Image/path scripts already enforce this; new
  scripts must too. See `docs/ai/memory/general.md`.
- **`pnpm run update` overwrites the theme**: it rewrites the theme tree
  from the fork's `master`. Any local-only theme edits in this site repo
  will be lost. If you edited theme files here, push them to the fork
  first (see fork-sync workflow in `docs/ai/memory/tools.md`), then run
  `update`.
- **Comments inside `pages:` or `footer:` array literals get wiped on
  plugin save**. Put them above the `pages:` / `footer:` line.

## Quick reference — "I want to …"

| Goal | Where to edit |
|---|---|
| Add a translated post | `src/content/posts/{de,en}/<slug>/index.md` (two files, same `translationKey`) |
| Add a translated static page | `src/content/pages/{de,en}/<slug>.md` (two files, same `translationKey`) |
| Add a nav item | `src/config.ts` `navigation.pages` + `i18nKey` + `urlByLocale` (if slug-divergent); add label to `src/i18n/strings.ts` |
| Change site title / description / footer text | `src/config.ts` — `LocalisedString` object literal |
| Change a UI button label / pagination text / reading-time phrasing | `src/i18n/strings.ts` |
| Add a new UI string | `src/i18n/strings.ts` — extend `StringMap` type + both locale blocks |
| Make a page locale-neutral (single URL for all locales) | `src/content/special/`, add to `src/pages/<slug>.astro` route, set `urlByLocale: { de: "/x/", en: "/x/" }` in any nav reference |
| Find untranslated content | Open `bases/Home.base` → "🔴 Translation gaps" view |
| Pull theme updates from the fork | `pnpm run update` |
| Edit a theme component (Header, PostCard, …) | Edit in `../astro-modular-mmomm/`, push to fork master, then `pnpm run update` here |
| Edit the Settings plugin | Edit in `../obsidian-astro-modular-settings-mmomm/`, build, copy three files into `src/content/.obsidian/plugins/astro-modular-settings/` |
| Add a third locale | Follow `docs/runbooks/add-a-locale.md` |

## Reference

- [ADR-001](docs/XDD/adr/ADR-001-fork-astro-modular-for-i18n.md) — why we forked the theme
- [ADR-002](docs/XDD/adr/ADR-002-i18n-architecture.md) — bilingual i18n architecture (URL strategy, folder layout, schema)
- [ADR-003](docs/XDD/adr/ADR-003-per-locale-navigation-translation.md) — per-locale navigation translation
- [ADR-004](docs/XDD/adr/ADR-004-vault-cms-and-content-structure.md) — Vault CMS + bilingual content structure
- [ADR-005](docs/XDD/adr/ADR-005-multi-locale-architecture.md) — N-locale-ready design (Accepted 2026-05-12)
- [add-a-locale runbook](docs/runbooks/add-a-locale.md) — the N-locale-add procedure
- [Parent workspace map](../CLAUDE.md) — overview of all MMoMM-org repos and their relationship
