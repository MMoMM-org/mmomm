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
| `src/content/posts/de/<slug>/index.md` | DE post — folder-based shape (post folder with `attachments/` sibling) |
| `src/content/posts/de/<slug>.md` | DE post — file-based shape (single Markdown file; images go in shared `de/attachments/`) |
| `src/content/posts/en/<slug>/index.md` | EN post — folder-based shape |
| `src/content/posts/en/<slug>.md` | EN post — file-based shape |
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

#### File-based vs folder-based posts — pick by image count

Both layouts are first-class. Pick by how many images your post will own:

| Layout | When to use | Markdown lives at | Images live in |
|---|---|---|---|
| **Folder-based** | Post has its own ≥1 image, OR you want each post's images grouped on disk | `src/content/posts/<locale>/<slug>/index.md` | `src/content/posts/<locale>/<slug>/attachments/*` (per-post folder) |
| **File-based** | Post has no own images, OR borrows from a shared pool | `src/content/posts/<locale>/<slug>.md` | `src/content/posts/<locale>/attachments/*` (locale-wide shared pool) |

You can mix both in the same locale folder. Slugs across folder-based and file-based posts share the same namespace — pick a slug that is unique across the locale.

**Wikilink form is the same for both**: `![[image.png|Alt text]]`. The image-resolver (`src/utils/internallinks.ts`) figures out where the asset lands based on the post's path on disk. No need to write `attachments/image.png` — the resolver adds the right prefix.

**Sync output** (after `pnpm dev` or `pnpm build`):

| Source | Synced to |
|---|---|
| `src/content/posts/de/<slug>/attachments/foo.png` (folder DE) | `public/posts/<slug>/foo.webp` |
| `src/content/posts/de/attachments/foo.png` (file-based DE) | `public/posts/foo.webp` |
| `src/content/posts/en/<slug>/attachments/foo.png` (folder EN) | `public/en/posts/<slug>/foo.webp` |
| `src/content/posts/en/attachments/foo.png` (file-based EN) | `public/en/posts/foo.webp` |

PNG/JPG/GIF/BMP/TIFF get converted to WebP (quality 85). Audio/video/PDF/SVG are copied as-is.

**Gotcha — new images on a running dev server**: `scripts/sync-images.js` runs once at `pnpm dev` startup. If you add a new image (or a new EN post that references new images) while the server is running, the file won't be in `public/`. Two ways to refresh: re-run `node scripts/sync-images.js` manually, or restart `pnpm dev`. Same applies to newly-created content files (Astro 7 alpha doesn't pick them up live either).

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

### Frontmatter properties — what each field does

The full schema is in `src/content.config.ts`. Every field listed here is parsed by Zod at content-load time — typos are surfaced as build errors, not silent fallbacks.

#### Posts (`postsCollection`)

| Field | Required | Type | What it does |
|---|---|---|---|
| `title` | yes | string | Post title. Used in `<h1>`, OG tags, RSS, sitemap, search index. Falls back to `"Untitled Post"`. |
| `date` | yes | ISO date | Publication date. Drives sort order on list pages and feeds, and the visible "DD MMM YYYY" line in the post header. Future dates are valid but get treated as scheduled — they still render. |
| `description` | recommended | string | Short summary. Used in the post's meta description, OG description, RSS `<description>`, and as the snippet on list cards. Empty → falls back to `"No description provided"`. |
| `tags` | optional | string[] | Tag list. Each tag becomes a tag page at `/posts/tag/<tag>/` (DE) or `/en/posts/tag/<tag>/` (EN), and the post appears in those tag indices. Also shown as chips below the post body. |
| `lang` | yes | `'de'` \| `'en'` | Locale. **Should match the folder** (`posts/de/*` → `lang: de`). Used by content filters (`getLocalisedPosts(locale)`) and for `<html lang>`. |
| `translationKey` | recommended | string | Pairs this post to its translation. Two posts share the same value → they're a pair. Empty string is allowed but disables hreflang + language-switcher routing for this post. See "Author a bilingual post" above. |
| `draft` | optional | boolean | When `true`, post is excluded from production builds (`pnpm build`). Dev server still renders drafts so you can preview them. Defaults to `false`. |
| `image` | optional | string \| `[[wiki]]` | Cover image. Accepts a plain path (`attachments/cover.png`), a Wiki-style array (`[[cover.png]]`), or empty/null. The image-resolver routes it to `public/...` and `<PostHeader>` renders it above the body. |
| `imageAlt` | optional | string | Alt text for the cover image. Required for accessibility if `image` is set — empty alt is treated as decorative. |
| `imageOG` | optional | boolean | When `true`, use this cover as the post's OG image (Open Graph). When `false`/missing, the build falls back to `src/config.ts → seo.defaultOgImage`. |
| `hideCoverImage` | optional | boolean | Render the post body without the cover image at the top (the image still drives OG/Twitter cards when `imageOG: true`). |
| `hideTOC` / `showTOC` | optional | boolean | Force-disable or force-enable the table of contents for this post. Default behaviour follows `siteConfig.postOptions.showTableOfContents` in `src/config.ts`. `hideTOC` wins over `showTOC` if both are set. |
| `targetKeyword` | optional | string | SEO keyword targeted by this post. Read by the SEO Obsidian plugin (audit highlights `<title>`/H1/body usage); not emitted to the page. |
| `author` | optional | string | Per-post author override. When unset, the site default (`src/config.ts → seo.author`) is used. |
| `noIndex` | optional | boolean | When `true`, emits `<meta name="robots" content="noindex">` and excludes the post from the sitemap. Use for unlisted/private content. |

#### Static pages (`pagesCollection`)

Most fields above also apply to pages. Key differences:

| Field | Notes for pages |
|---|---|
| `date` | **Not on pages.** Pages have `lastModified` (ISO date) instead — drives "Last updated" lines and sitemap `<lastmod>`. |
| `tags` | **Not on pages.** Pages aren't tagged. |
| `imageOG` | **Not on pages.** Pages always use `seo.defaultOgImage` unless `image` is overridden. |
| `targetKeyword`, `author` | **Not on pages.** |
| `lang`, `translationKey` | Same as posts — required + recommended respectively. |

#### Special pages (`specialCollection`)

Single-purpose home-blurb / 404 / placeholder fragments under `src/content/special/<locale>/<name>.md`. Schema is minimal:

| Field | Required | What it does |
|---|---|---|
| `title` | yes | Fragment title (rarely surfaces — most special fragments are body-only). |
| `description` | optional | Used if a `<meta description>` is needed. |
| `lang` | yes | Locale — `de` or `en`. The file id (e.g. `de/home`) is what consumers look up via `getEntry('special', \`${locale}/${name}\`)`. |
| `hideTOC` | optional | Same as posts. |

No `translationKey` here — special fragments pair by file name within their locale folder (`de/home` ↔ `en/home`).

#### Quick-pick decisions

| You want to … | Set |
|---|---|
| Hide a draft from production | `draft: true` |
| Use a cover image | `image: "[[cover.png]]"` + `imageAlt: "Description"` |
| Use that cover image on social shares too | also `imageOG: true` |
| Suppress the cover image at the top but keep it for social shares | `hideCoverImage: true` + `imageOG: true` |
| Disable the TOC for one long post | `hideTOC: true` |
| Mark a post as not yet translated | leave `translationKey: ""` |
| Hide from search engines and the sitemap | `noIndex: true` |

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
