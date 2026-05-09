# ADR-002: Bilingual (DE+EN) i18n Architecture

Status: Accepted (Decision #3 revised 2026-05-09 — see Revisions)
Date: 2026-05-09

## Context

MMoMM.org is a bilingual site (German primary, English translations) replacing a Hugo
predecessor (`MMoMM-org/mmomm`). The Hugo site used `translationKey` frontmatter to link
DE↔EN post pairs, with DE at the root and EN under `/en/`. There are approximately 22
posts per language.

The Astro rewrite is built on astro-modular (single-language by design). ADR-001 records
the decision to fork astro-modular to preserve i18n customizations across upstream updates.

At the point this decision was made, 14 DE posts had already been migrated to
`src/content/posts/<slug>/` via `tools/migrate-from-hugo.mjs`. The 14 EN posts were still
pending migration. The site was on branch `feat/astro-modular`, 5 commits ahead of `main`,
and the Hugo site remained live at www.mmomm.org.

Several independent choices had to be locked in simultaneously because they affect the
content schema, the migration script, the routing config, and eventually the fork — and the
schema must be decided before migrating EN content.

## Decision

Seven related decisions are recorded here as a single ADR because they form an interlocking
set that must be implemented in sequence.

### 1. URL strategy: `/posts/<slug>/` with 301 redirects from Hugo paths

Adopt astro-modular's `/posts/<slug>/` URL pattern (not Hugo's `/blog/<slug>/`). Add 301
redirects in `astro.config.mjs` under the `redirects:` key:

- `/blog/<slug>/` → `/posts/<slug>/` (DE, all existing posts)
- `/en/blog/<slug>/` → `/en/posts/<slug>/` (EN, all existing posts)

### 2. Launch model: ship DE+EN together

No DE-only intermediate launch. EN must be at feature and content parity before cutover
from the Hugo site at www.mmomm.org.

### 3. Content folder layout — symmetric by locale (revised 2026-05-09)

- DE posts: `src/content/posts/de/<slug>/`
- EN posts: `src/content/posts/en/<slug>/`

Each locale lives under its own folder. Locale is declared explicitly in frontmatter via
the required `lang` field; the path is informational, not authoritative. URL strategy is
unchanged — DE still emits at `/posts/<slug>/` (no `/de/` URL prefix), EN at
`/en/posts/<slug>/`. Routes filter by `data.lang`, not by path.

**Originally accepted as asymmetric** (DE at `posts/<slug>/`, EN at `posts/en/<slug>/`) to
avoid moving the 14 already-migrated DE posts. Reversed to symmetric on 2026-05-09 — the
visual symmetry, future-locale extensibility, and Obsidian vault tidiness outweigh the
one-shot cost of `git mv`. See Revisions.

### 4. Routing — Astro core i18n with `prefixDefaultLocale: false`

`astro.config.mjs` i18n block:

```js
i18n: {
  defaultLocale: 'de',
  locales: ['de', 'en'],
  routing: { prefixDefaultLocale: false },
}
```

DE routes live at `/posts/<slug>/` (no prefix). EN routes live at `/en/posts/<slug>/`.
Parallel route trees: `src/pages/posts/...` for DE, `src/pages/en/posts/...` for EN.
Route helper functions are shared; components accept a `locale` prop.

### 5. Content schema extension (`src/content.config.ts`)

Two new optional fields added to the posts collection schema:

```ts
lang: z.enum(['de', 'en']).optional(),         // explicit locale; path-derived if absent
translationKey: z.string().optional(),          // DE↔EN pairing key (preserved from Hugo)
```

The `lang` default is computed by the caller: `'en'` if the entry's `id` starts with
`en/`, else `'de'`. `translationKey` surfaces the linkage the migration script already
writes to frontmatter.

### 6. UI translations (`src/i18n/strings.ts`)

A new `strings.ts` module exports a per-locale string map and a `t(locale, key)` helper.
`src/config.ts` gains a per-locale `site` block for titles, descriptions, and nav labels.
Components consume strings via `t()` rather than hardcoded German text.

### 7. Locale-aware component patches (fork-bound, deferred to Phase 2)

The following astro-modular components require i18n patches and will be developed in the
fork (`MMoMM-org/astro-modular-mmomm`):

- `BaseLayout.astro` — `<html lang>`, hreflang link tags, OG locale meta
- `Header.astro` — language switcher linking to the `translationKey`-paired post (or the
  target locale's homepage if no translation exists)
- `feed.xml.ts` / `rss.xml.ts` — per-locale RSS feeds
- `sitemap.xml.ts` — hreflang annotations in the sitemap
- `CommandPalette.astro` / search — locale-filtered Fuse.js index
- `LinkedMentions.astro`, `LocalGraph.astro` — locale-scoped link resolution
- Pagination, post-card, tags, TOC components — locale prop + `t()` lookups

## Implementation Phases

### Phase 1 (current session / `feat/astro-modular` branch)

- Extend `src/content.config.ts` with `lang` and `translationKey` fields
- Add `--locale` flag to `tools/migrate-from-hugo.mjs`
- Backfill `lang: 'de'` on the 14 already-migrated DE posts
- Migrate 14 EN posts to `src/content/posts/en/`
- No routing changes, no component churn; build remains DE-only

### Phase 2 (fork-bound)

- Add Astro core i18n config to `astro.config.mjs`
- Create parallel `/en/` route tree under `src/pages/en/`
- Implement `src/i18n/strings.ts` and per-locale `src/config.ts` site block
- Apply all locale-aware component patches listed in Decision 7
- Add `redirects:` block for `/blog/` → `/posts/` paths

### Phase 3 (fork sync — deferred per ADR-001)

- Wire release-mirror GitHub Actions workflow on `MMoMM-org/astro-modular-mmomm`
- Patch `scripts/update.mjs` REPO constant to point at the fork
- Document upstream merge cadence

## Consequences

**Positive:**

- ~~Asymmetric folder layout avoids a mass `git mv` of the 14 already-migrated DE posts,
  keeping the migration commit's git blame clean.~~ (Obsoleted by 2026-05-09 revision —
  symmetric layout chosen; `git mv` performed with `R` rename detection so blame survives.)
- `prefixDefaultLocale: false` matches Hugo's URL convention (DE at root), minimising URL
  surface change for the DE side and reducing redirect scope.
- Single content collection (not two separate ones) means no schema duplication and theme
  components query one collection.
- Shipping DE+EN together avoids a public EN regression at launch — no missing-content
  embarrassment at the new domain.
- 301 redirects from `/blog/` preserve inbound link equity from the Hugo era.

**Negative / costs:**

- ~~Asymmetric folders introduce path-based locale derivation rather than an explicit
  declared locale.~~ (Obsoleted — symmetric layout uses an explicit required `lang`
  frontmatter field; path is informational only.) Every collection consumer must still
  filter by locale; a forgotten filter returns mixed-locale results silently.
- Single collection requires every query to include a locale filter. A forgotten filter
  returns mixed-locale results silently.
- Adopting `/posts/` over `/blog/` creates SEO redirect dependence; search engines take
  time to propagate 301s and update indexed URLs.
- Ship-together delays launch: the cutover is a larger event with more test surface and
  requires EN content to reach parity before going live.
- Parallel route trees under `src/pages/` double the page-level file count and must stay
  in sync manually until a shared generator or layout mechanism abstracts the duplication.

## Alternatives Considered

**Two separate content collections (`posts` for DE, `posts-en` for EN)**

Rejected. Would require duplicating the full Zod schema, all collection queries, and any
future schema migrations. The path-based locale derivation in a single collection is
simpler and consistent with how the migration script already structures output.

**Move DE posts into `src/content/posts/de/<slug>/` for visual symmetry**

Initially rejected on cost-of-`git mv` grounds — see Revisions; this was reversed on
2026-05-09 and is now the chosen layout.

**`prefixDefaultLocale: true` (DE under `/de/`, EN under `/en/`)**

Rejected. Hugo served DE at the root. Routing DE under `/de/` would change every existing
DE URL, multiplying the redirect surface and diverging from the established domain
convention. The chosen asymmetry (`/posts/` DE, `/en/posts/` EN) mirrors what Hugo did.

**Separate Astro projects for DE and EN with shared content**

Rejected. Significant operational complexity (two builds, two deployments, cross-project
link resolution). No precedent in the team's current stack. Adds deployment surface without
proportional benefit given the small post count (~22 posts per language).

**DE-only intermediate launch, add EN later**

Rejected by the user. The risk of a live EN regression (missing posts, broken links from
the old Hugo EN URLs) at the new domain outweighed the benefit of an earlier DE launch.

**Storing locale in frontmatter only (no path convention)**

Not viable without a path convention to fall back on. The migration script must place files
somewhere; deriving locale from path eliminates a mandatory frontmatter field that could be
omitted or wrong.

## Revisions

### 2026-05-09 — Decision #3 reversed: symmetric folder layout

The folder layout was switched from asymmetric (DE at `posts/<slug>/`, EN at
`posts/en/<slug>/`) to symmetric (DE at `posts/de/<slug>/`, EN at `posts/en/<slug>/`).

**Why the original choice was made**: at the time of writing this ADR, 14 DE posts had
already been migrated to `src/content/posts/<slug>/`. Moving them would have required a
mass `git mv` operation. The asymmetric layout was chosen to avoid that one-shot cost.

**Why it was reversed**: when implementing Phase 2 and looking at the file tree in
practice, the asymmetry was actively confusing — the `en/` subfolder reads like a special
category of DE posts rather than its own locale. Three concrete problems surfaced:

1. **Obsidian vault organization**: the vault that drives content authoring is the DE
   posts folder. Having an `en/` subfolder inside it makes the EN content look like it
   belongs to a DE category.
2. **Future locale extensibility**: adding French or Italian later would have to either
   continue the asymmetry (FR at `posts/fr/`, looking like another EN-style subcategory)
   or migrate everyone to symmetric anyway, just with more posts to move.
3. **Idiomatic Astro i18n**: every Astro i18n tutorial and example uses parallel locale
   folders. Asymmetric is non-standard and would surprise future contributors.

**What changed in the implementation**:

- 14 DE post folders moved: `src/content/posts/<slug>/` → `src/content/posts/de/<slug>/`
  via `git mv` (history preserved on rename detection).
- `src/utils/i18n.ts` `postSlug()` regex updated from `/^en\//` to `/^(de|en)\//` so it
  strips either locale prefix.
- `src/pages/posts/[...slug].astro` `getStaticPaths` switched from `params: { slug:
  post.id }` to `params: { slug: postSlug(post) }` so emitted DE URLs stay
  `/posts/<slug>/` and don't include the `/de/` folder prefix.
- `src/utils/images.ts` `optimizePostImagePath` now detects the locale from the post id
  prefix and emits the correct dist URL (`/posts/<slug>/<image>` for DE,
  `/en/posts/<slug>/<image>` for EN). Without this, 38 cover-image preload links pointed
  at non-existent `/posts/de/<slug>/<image>` paths.
- `src/components/PostCard.astro`, `src/components/PostContent.astro`,
  `src/layouts/PostLayout.astro` — image base path constructions and prev/next post
  hrefs switched from `/posts/${post.id}` to `postUrl(post)` (locale-aware).

**URL strategy unchanged**: DE still at `/posts/<slug>/`, EN at `/en/posts/<slug>/`. The
folder structure no longer mirrors the URL structure, but that's fine — routes filter on
the `lang` field, not on path.

Implementation landed in commit `<see git log on feat/astro-modular>` (and a follow-up
fork push on `MMoMM-org/astro-modular-mmomm`).

## Related

- [ADR-001: Fork astro-modular for i18n customizations](ADR-001-fork-astro-modular-for-i18n.md) — establishes the fork that hosts Phase 2 and Phase 3 work
