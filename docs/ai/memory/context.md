# Context — astro-mmomm
<!-- Current sprint focus, active work, known blockers. Updated: 2026-05-11 -->
<!-- This file is short-lived — prune entries older than 2 weeks via /memory-cleanup -->

## Active branch: `feat/astro-modular` (49 commits ahead of `main`, pushed to origin MMoMM-org/mmomm)

Migrating MMoMM-org/mmomm (Hugo, live at www.mmomm.org) → Astro using the **astro-modular** theme. Branch not merged to main, not deployed anywhere. Hugo site remains production source of truth.

**Pre-flight for next session**: `git rev-parse HEAD` should be `243eabd` or later. `pnpm build` produces 60 pages clean. Theme fork `MMoMM-org/astro-modular-mmomm` master at `4064b30`.

## What's shipped (full list)

**Phase 2a — i18n routing scaffold**: DE at `/posts/<slug>/`, EN at `/en/posts/<slug>/`. Astro core i18n config. Symmetric content layout `src/content/posts/{de,en}/<slug>/index.md` with `lang` + `translationKey`. 14 DE + 14 EN posts migrated from Hugo via `tools/migrate-from-hugo.mjs`.

**Phase 2b — i18n correctness (T1–T11 + T3c)**: backlinks, ProjectLayout/PostLayout client-script URLs, wikilinks-in-bodies (filesystem slug→lang map), sitemap hreflang, per-locale RSS+Atom, BaseLayout lang prop, locale-aware homepages, DE↔EN switcher, locale-aware graph generator + LocalGraph runtime filter, typed `src/i18n/strings.ts` foundation.

**Personalization** (`a59dc7f`): real `src/config.ts` values — site `https://www.mmomm.org`, title `MingleMangleOfMyMind`, author `Marcus Breiden`, lang `de`, description `"PKM, Obsidian, MiYo, AI und anderes Gedöns"`. Socials: GitHub (MMoMM-org), LinkedIn, YouTube, Xing.

**Header track A/B/C-mini** (2026-05-10/11): switcher locale derived from `Astro.url.pathname` not prop (fixed `/en/en/...` multiplier), `data-no-swup` on switcher links (Swup container was freezing header on transitions), GitHub icon, header `localizedNavUrl` helper prefixes `/en` for EN routes on absolute internal URLs.

**ADR-004 plan complete (2026-05-11)** — 3 sequential commits:
1. ✅ `fab7815` — pages schema bilingual (required `lang` + optional `translationKey`)
2. ✅ `d85dc30` — purge all astro-modular demo content (-2936 LOC), prune nav to `Posts`+`GitHub`, disable `optionalContentTypes.{projects,docs}`. Build: 77 → 50 pages.
3. ✅ `4ab9388` — Hugo non-blog migration. 5 bilingual page pairs (10 files): `ueber-mich`/`about`, `jetzt`/`now`, `impressum`/`impressum`, `datenschutz`/`privacy-policy`, `videos`/`videos`. Title-suffix stripped, body H1s removed/downgraded, Hugo `{{< youtube >}}` → inline iframe (no MDX). Routes split: `src/pages/[...slug].astro` DE-only + special fallbacks; new `src/pages/en/[...slug].astro` EN-only. New i18n helpers: `pageSlug`, `pageUrl`, `getLocalisedPages`, `findPageTranslation`. Build: 50 → 60 pages.

**i18n image pipeline fix** (`8873c03`, 2026-05-11): the locale-as-slug bug — `pathParts[indexOf('posts') + 1]` returned `'en'` instead of the slug across 3 sites (`scripts/sync-images.js`, `remarkFolderImages` in `internallinks.ts`, `remark-obsidian-embeds.ts`). EN posts had zero working body images and zero rendered cover images (ImageWrapper `isImageMissing` → `null`). Realigned all 3 on ADR-002 URL convention: `public/posts/<slug>/<file>` (DE, no prefix, attachments/ flattened) and `public/en/posts/<slug>/<file>` (EN). Stale `public/posts/` (pre-i18n + old sync output) nuked and rebuilt. See `general.md` "Path-based slug detection must skip locale folder" for the durable rule.

**Track A — Switcher path translation** (`243eabd`, 2026-05-11): bilingual pages now cross-link to translated slug, not naive path-strip. `/jetzt/` → `/en/now/`, `/ueber-mich/` → `/en/about/`, `/datenschutz/` → `/en/privacy-policy/` (and reverse). PageLayout now passes `page` + `lang` to BaseLayout (was empty before; URL-derived workaround stays as safety net), BaseLayout forwards `page` to Header, Header adds a `page.data.translationKey` branch using `findPageTranslation` + `pageUrl`. Special-page fallbacks (projects/docs index) lack translationKey → fall through to existing strip logic, no regression.

## Active plan — none

Both major plans of the session (ADR-004 + i18n correctness) are shipped. No active queued plan. Pick from "next moves" below or surface a new track.

## Next moves (pick one, ordered by leverage)

1. **Vault CMS bilingual config** — ADR-004 Decision 1, configure-only (no second fork). Set up per-locale content-types in the Obsidian plugin so new posts/pages auto-land in `src/content/<X>/{de,en}/<slug>/index.md` with `lang` + `translationKey` pre-filled. Plugin reference: `davidvkimball/vault-cms-presets`. Estimated 30-45 min in Obsidian; no code changes expected.
2. **GH Pages deploy preview** — currently the work is reviewable only via local `pnpm dev`. Three pieces: `siteConfig.deployment.platform: "github-pages"`, `.github/workflows/deploy.yml`, `public/CNAME` with `www.mmomm.org`. Open question: replace `MMoMM-org/mmomm` main (force-overwrite Hugo) or push to a new repo first? Affects whether `www.mmomm.org` flips to Astro immediately or after a soak.
3. **Track C — Per-locale nav labels** (now relevant — nav was reduced to Posts+GitHub in step 2; user may want to plug About/Now/Videos/Impressum/Datenschutz into nav next, and that needs translated labels). Architectural decision per ADR-003: keep `navigation.pages` flat for plugin-compat (Astro Modular Settings requires array shape), translate labels via T9 strings table, prefix URLs locale-aware at render. Header already prefixes URLs (done in `9f5ef14`); labels are the remaining piece.
4. **Per-locale `siteConfig`** — title, description, homepageTitle, defaultOgImageAlt are single-string today. Feeds, sitemaps, homepages all read these. Options: `{de: …, en: …}` schema or a `siteConfigByLocale` table mirroring `src/i18n/strings.ts`. Touches `src/config.ts` shape (breaks Astro Modular Settings markers) — needs ADR.
5. **Image-name quality pass** — 80/122 attachments (66%) are `image-N.<ext>` placeholders from `tools/migrate-from-hugo.mjs:164` caption-detection fallback. Highest-leverage move: re-run migration with `alt`-text-first heuristic (alt is more reliable than captions in Hugo source). Probably a 1h fix.
6. **Migrated wikilinks cleanup** — DE/EN post bodies contain template-placeholder `[[Titel der Notiz]]` wikilinks from the migration tool. LocalGraph renders nothing on those posts because no real backlinks. Either fill in real cross-post links or strip placeholders.
7. **Other UI string migrations** (Phase 2b foundation `src/i18n/strings.ts` exists): `Pagination.astro` Previous/Next, `PostContent.astro` Published, reading-time fallbacks, `LinkedMentions.astro:377` "Referenced in this post". Each call site needs a `lang` prop wired through. Lower urgency — current strings are English-only but unobtrusive.
8. **Upstream sync workflow** — ADR-001 Phase 3 TBD. When `davidvkimball/astro-modular` releases new versions, merge into the fork. Standard pattern: `cd <fork>; git fetch upstream; git merge upstream/master`. Cadence and conflict-resolution rules not yet captured.
9. **`/blog/` redirects** — Phase 3 deploy concern. Astro config edits get reverted by `scripts/generate-deployment-config.js`. Defer to platform config (`_redirects` or `netlify.toml`) once deploy target is chosen.

## Discoveries this session worth remembering

(All also in durable memory files — referenced here for next-session context.)

- **Path-based slug detection must skip locale folder** — `general.md`. Bug class hit 3 places this session. Future remark plugins / scripts will hit it unless authored aware.
- **Astro 7 alpha caches mask edits** — `troubleshooting.md`. Dev: edit Header.astro, dev keeps serving old HTML — restart fixes. Build: edit remark plugin, dist keeps old URLs — `rm -rf .astro` fixes. Sources update fine; the cache lies.
- **`/projects/` + `/docs/` emit redirect-stub HTML** — `troubleshooting.md`. Even with `optionalContentTypes.X = false`, astro-modular's `src/pages/{projects,docs}/index.astro` fallback emits a thin 404-redirect file. Harmless but easy to mistake for a real route.
- **PageLayout/PostLayout render title as H1** — `general.md`. Body markdown must start at H2 or layouts emit double-H1.

## Key references

- **Branch**: `feat/astro-modular`. Branch off `main`, no direct main commits (hook-blocked).
- **Fork**: <https://github.com/MMoMM-org/astro-modular-mmomm> master at `4064b30`. Clone-patch-push pattern documented in `tools.md`. Pull via `pnpm run update` (uses `.astro-modular-source` to track last SHA).
- **USER_PATHS layering**: cross-project defaults in fork's `scripts/update.mjs`; site-specific paths in local `.astro-modular-user-paths` (root, gitignored).
- **ADRs**: ADR-001 (fork), ADR-002 (i18n; Decision #3 revised), ADR-003 (per-locale nav strategy), ADR-004 (Vault CMS + content structure).
- **Migration tool**: `tools/migrate-from-hugo.mjs` — defaults to `--source ../mmomm/content/blog`; needs `--source` per Hugo section.
- **Hugo source**: `/Volumes/Moon/Coding/MMoMM.org/mmomm/` (sibling repo, GH Pages live).

## Pre-existing TS noise to ignore

- `'z' is deprecated` in `content.config.ts` (Astro 7 alpha re-export).
- `Cannot find module '@/types'`, `'@/config'`, `'astro:content'` after `pnpm run update` — `.astro/` type cache wipe. Resolved by next `pnpm dev` or `pnpm build`.
- `mdast` module not found — pre-existing type-only import in `remark-obsidian-embeds.ts`.

## Plugin stack reference (Vault CMS context)

Five astro-modular Obsidian plugins, complementary:
- **Astro Composer** — authoring (new-note flow, kebab-slugs, internal links)
- **Vault CMS** — setup wizard + content-types + preset manager (`davidvkimball/vault-cms-presets`)
- **Bases CMS** — grid-view content management via `.base` files
- **Home Base** — pins a `.base` view as default tab
- **Astro Modular Settings** — `src/config.ts` editor via `[CONFIG:KEY]` markers (ADR-003 plugin-compat)

All five plugins have **zero i18n awareness** (grep `translationKey|"lang"|"locale"` = 0 hits). Bilingual workaround per ADR-004 Decision 1: per-locale content-types in plugin config, no fork.
