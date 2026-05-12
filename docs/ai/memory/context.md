# Context — astro-mmomm
<!-- Current sprint focus, active work, known blockers. Updated: 2026-05-11 -->
<!-- This file is short-lived — prune entries older than 2 weeks via /memory-cleanup -->

## Active branch: `feat/astro-modular` (58 commits ahead of `main`, pushed to origin MMoMM-org/mmomm)

Migrating MMoMM-org/mmomm (Hugo, live at www.mmomm.org) → Astro using the **astro-modular** theme. Branch not merged to main, not deployed anywhere. Hugo site remains production source of truth.

**Pre-flight for next session**: `git rev-parse HEAD` should be the latest commit on this branch. `pnpm build` produces 59 page(s) (58 actual `index.html` + sitemap files). Of the 58 routes, 2 are harmless redirect-stubs at `/docs/` and `/projects/` from astro-modular's fallback (see troubleshooting.md — surviving `optionalContentTypes=false` is expected). Theme fork `MMoMM-org/astro-modular-mmomm` master at `4064b30`.

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

**Track C — Per-locale nav labels + Hugo nav parity** (`2e52723`, 2026-05-11): ADR-003 implementation. Extended `NavigationItem` with `i18nKey?` (T9 label key) and `urlEn?` (EN URL override for slug-divergent pages). Added `tOpt(locale, key, fallback)` in `src/i18n/strings.ts` for safe lookup of keys coming from untyped data. `siteConfig.navigation.pages` rebuilt to match Hugo main nav 1:1 — Beiträge/Posts, Videos, Jetzt/Now, Über mich/About, GitHub. New `siteConfig.navigation.footer` array drives a new legal-links row in Footer.astro — Impressum, Datenschutz/Privacy Policy. Header + Footer both derive locale from URL (mirrors Track A workaround for PageLayout/404 not propagating lang). ADR-003 revisions section updated: Decision 3's naive `/en/` prefix is insufficient when slugs diverge, hence `urlEn`.

**UI string migrations Phase 1** (`83fd031`, 2026-05-11): Pagination + LinkedMentions + PostLayout reading-time wired to T9. New `tPageOfTotal(locale, n, m)` and `tReadingTime(locale, minutes)` helpers in `src/i18n/strings.ts` centralize phrase interpolation; new `linkedMentions.referenced` key. `lang` prop threaded through all 8 Pagination call sites. Also fixed 4 pre-existing EN-route baseUrl bugs (`/posts/...` instead of `/en/posts/...` in `en/posts/index`, `en/posts/[page]`, both `en/posts/tag/...` routes) that silently routed EN paginated/tag-filtered users back to DE. `PostContent.astro` was on the migration list but is orphan code — skipped.

**`/now/` locale-neutral page** (`0e7c256`, 2026-05-11): the "Now Page Movement" page (`/now/`, English-only, no `/jetzt/` DE variant and no `/en/now/` prefix) — replicates the Hugo site's `static/now/index.html` meta-refresh trick with a clean Astro route. Established the locale-neutral page pattern (special collection + dedicated `.astro` route + `switcherHref` override + `urlEn` set equal to `url` to defeat the EN prefix); see `general.md` for the durable rule. Header + BaseLayout gained an optional `switcherHref?: string` prop. Build now emits 56 pages (-4: dropped jetzt+now bilingual pair and their public/{de,en}/pages/* image dirs).

**migrate-from-hugo.mjs root-cause fix** (`2f8fc77`, 2026-05-11): the in-loop body-mutation bug that caused the 80/122 placeholder rate is now fixed. processBody refactored into two passes — Pass 1 reads against the original (immutable) body, Pass 2 splices replacements in reverse so indices stay valid. Heuristic also extended: alt-text first (some Hugo posts actually do have populated alt), then caption AFTER (the preserved original heuristic), then caption BEFORE (dynbedded convention), then numbered fallback. Smoke-tested on 5 known-hard posts: 32/37 images (86%) resolve to caption-derived names. Future Hugo imports produce correct filenames on first pass; the renamer is no longer a permanent tax. troubleshooting.md entry marked resolved.

**Image-name quality pass** (`957060e`, 2026-05-11): 65 of 80 `image-N.<ext>` placeholders renamed to caption-derived slugs (81% recovery). New tool `tools/rename-image-attachments.mjs` walks `src/content/posts/{de,en}/<slug>/index.md`, detects captions in the current body (AFTER then BEFORE-image heuristics), falls back to Hugo source for the Nth image if needed, renames file + body ref. Idempotent, dry-run by default. Discovered the real root-cause of the original placeholders (NOT the alt-text-empty issue context.md previously assumed): `tools/migrate-from-hugo.mjs` has an in-loop body-mutation bug — match indices captured pre-loop become stale after each `body.replace()` shrinks the body, so caption-detection reads the wrong slice for images 2+ per post. Bug documented in `troubleshooting.md` with the fix recipe (reverse-order processing or index-splice); fix NOT applied to migrate-from-hugo.mjs in this commit — do that the next time we ingest from Hugo. 15 honest skips remain (images flanked by bullets, captions >80 chars, image at post end) — accepted as content edge cases. Build: 59 pages, URLs render correctly with new names.

**Plugin-clobber incident + plugin disabled** (2026-05-11, `d5bcc0b` + follow-up): the Astro Modular Settings plugin overwrote `src/config.ts`'s `siteConfig.navigation.pages` and `navigation.footer` from its `data.json` after `a347b0b` was committed. Lost: all `i18nKey`, `urlEn`, the entire `footer` array, and the MMoMM GitHub URL → David's astro-modular URL. Trigger NOT user-action: user confirmed "ich habe nur geschaut" / "I only looked" — likely the plugin auto-syncs data.json→config.ts on `onload()` or on detecting a data.json↔config.ts mismatch (2 `writeFileSync(configPath)` calls in main.js, at least one reachable without user interaction). Recovered via `git checkout HEAD -- src/config.ts`. data.json's nav.pages synced to MMoMM-flat as residual damage-limit. **Plugin then disabled** by removing `"astro-modular-settings"` from `src/content/.obsidian/community-plugins.json`. Configuration of `src/config.ts` happens in the editor only going forward. See tools.md for ops rules + the fork-plan track for eventual i18n-aware re-enable.

**Astro Modular Settings + ADR-004 drifts** (2026-05-11, post-`79cc41d`): three real drifts in `src/config.ts` fixed: (a) `optionalContentTypes.projects` true→false, (b) `optionalContentTypes.docs` true→false (both per ADR-004 Decision 5; commit `d85dc30` message claimed these but only flipped `homeOptions.*` siblings), (c) `footer.content` reattributed to the bilingual fork. `astro-modular-settings/data.json` synced to match real config.ts for safe single-string fields (siteInfo, footer, seo, homeOptions.{projects,docs}.enabled, optionalContentTypes, navigation.social, runWizardOnStartup→false). `navigation.pages` left stale on purpose — see tools.md durable rule (would clobber `i18nKey`+`urlEn`).

**Vault CMS bilingual config** (`79cc41d`, 2026-05-11): ADR-004 Decision 1 shipped. `src/content/.obsidian/plugins/vault-cms/data.json` and `astro-composer/data.json` both updated — `Posts` and `Pages` each split into `(DE)` → `<type>/de/` and `(EN)` → `<type>/en/` content-types. Templates now include `lang: de|en` and `translationKey: ""` so newly created notes are schema-valid out-of-the-box. `Projects` + `Documentation` left in place but `enabled: false` (re-enable path stays open). `defaultContentTypeId` is now `posts-de-1765432337485`. Reload-Obsidian needed once for the picker to refresh. No code, no plugin fork. See `tools.md` for the durable dual-config rule.

**UI string migrations Phase 2** (`1b67aa4`, 2026-05-11): the visible-on-DE English strings exposed by Phase 1's spot-check are now i18n. `formatDate`/`formatDateMobile` (`src/utils/markdown.ts`) take a `Locale` parameter and route through `Intl` with `de-DE`/`en-US` BCP-47 tags. PostCard derives `post.data.lang` and threads it through dates, reading-time, word-count (new `tWordCount` helper with proper de/en pluralization), and the "+N more" tag chip (new `tMoreTags`). PostLayout gets the same treatment. All 8 posts-list routes (DE+EN: `index`, `[page]`, `tag/[...tag]`, `tag/[...tag]/[page]`) now declare `const lang = '<x>' as Locale` and route pageTitle, pageDescription, h1, "Page N of M • K total posts" counter, "Showing N posts tagged with #X" line, "Show all posts" / "View All Posts" links, and the empty-state "Previous Page" button through `t()`/`tPageOfTotal`. New T9 keys: `posts.allPosts`, `posts.allPostsTagged`, `posts.showAllPosts`, `posts.viewAllPosts`, `posts.totalPosts`, `posts.postsTagged` (cap, headings), `posts.postsTaggedWith` (lowercase, mid-sentence). Folded in 5 more EN-route URL bugs of the same class as Phase 1. Bonus: a long-standing `Astro.props` destructure typing issue in both `[page].astro` files fixed by `as Props` cast — total `astro check` error count dropped from 66 → 32.

**ADR-005 multi-locale architecture** (2026-05-11, `0429e07`): Pivot from "fork plugin for `urlEn`/`i18nKey` preservation" to "N-locale-ready design with DE/EN MVP" after user signalled "kompletter Umbau auf multi language" direction. Six locked-in decisions, blast-radius audit attached as ADR Findings, 4-phase plan; ADR-002 Decision 4 + ADR-003 Decision 3 revised in-line. See [ADR-005](../XDD/adr/ADR-005-multi-locale-architecture.md) for full text.

**ADR-005 Phase 1 shipped** (2026-05-11, commits `c4c9006`..`29c577c`, 6 commits): All 9 Phase 1 steps landed in one session. Build remains at 59 pages, astro check stable at 32 pre-existing errors.

- `c4c9006` **Commit A** (Decision 2): siteConfig.locales + defaultLocale source of truth. Locale + LocalisedString types moved to `src/types.ts`. `src/utils/i18n.ts` re-sources LOCALES/DEFAULT_LOCALE from config. New `lt(locale, value)` migration helper. Markers `[CONFIG:LOCALES]` + `[CONFIG:DEFAULT_LOCALE]` replace `[CONFIG:SITE_LANGUAGE]`. llms.txt.ts migrated.
- `95e1aa4` **Commit B** (Decision 3): 6 site-info fields → LocalisedString. EN description: "PKM, Obsidian, MiYo, AI, and other oddments". footer.content fully bilingual ("Gebaut mit ..." / "Built with ..."). 25 files touched, every consumer threads locale via lt(). seo.ts generate*SEO functions take explicit locale; entity-typed (post/page) functions derive from data.lang. ProjectLayout/DocumentationLayout use DEFAULT_LOCALE (collections have no lang schema today per ADR-004 Decision 4).
- `1ae64d8` **Commit C** (Decision 4): urlEn → urlByLocale: Partial<Record<Locale, string>>. New shared navUrl() resolver in i18n.ts (subsumes duplicate Header.localizedNavUrl + Footer.navUrl). 3 nav items (Jetzt, Über mich, Datenschutz) migrated.
- `cc311e9` **Commit D** (Decision 6): strings.ts ternaries → per-locale function tables. tPageOfTotal/tReadingTime/tWordCount/tMoreTags + bcp47Tag now Record<Locale, Formatter> — missing key on a 3rd locale = compile error.
- `db82b8e` **Commit E** (steps 6+7): 4 inline-string leaks fixed (3 new T9 keys: posts.showingPrefix, posts.exploreAllPrefix, posts.postsNoun). formatDate/formatDateMobile defaults removed; 7 callers updated with explicit locale.
- `29c577c` **Commit F** (step 8): Hugo migration tooling locale-parameterised. LOCALE_SOURCES + LOCALE_HUGO_BASES tables replace hardcoded HUGO_DE/HUGO_EN constants and inline ternaries. Adding a 3rd locale = add a key, validation rejects unknowns with a list-the-valid-options error.

**ADR-005 Phase 2 shipped** (2026-05-11, commit `3b09b00`): the 9-file `src/pages/en/` clone tree collapsed into a single parameterised `src/pages/[locale]/` tree in one commit. Each parameterised route's `getStaticPaths` iterates `LOCALES.filter(l => l !== DEFAULT_LOCALE)` and fans out paths. Files migrated: `index`, `[...slug]`, `posts/index`, `posts/[page]`, `posts/[...slug]`, `posts/tag/[...tag]`, `posts/tag/[...tag]/[page]`, `feed.xml.ts`, `rss.xml.ts`. Default-locale (DE) tree at root URLs preserved (ADR-002 Decision 4's `prefixDefaultLocale: false`). All 27 `/en/*` URLs intact; 59 pages built; astro check baseline (32 errors) unchanged. Adding a third locale now requires zero new route files — just data.

**ADR-005 Phase 3 shipped** (2026-05-12, fork `MMoMM-org/astro-modular-settings-mmomm` `feat/multi-locale-aware` branch, commits `c816b24`..`ef6ac68`; vault commit `39ae100`): The Astro Modular Settings plugin is now **re-enabled** in the vault with an i18n-safe round-trip. Four fork commits cover (a) round-trip passthrough parser/serializer + new markers `[CONFIG:LOCALES]`/`[CONFIG:DEFAULT_LOCALE]` + tolerant validator, (b) NavigationTab UI editor extensions for `i18nKey` / `urlByLocale` / `external` (rendered when `locales.length > 1`), (c) `lt()` resolver + LocalisedString-aware reads/writes across SiteInfoTab/FeaturesTab/wizard, (d) **the four bug-fix lessons that emerged from smoke testing**: load-time config.ts overlay in `loadSettings()` (data.json is a cache, config.ts is the source of truth), in-place array rewrite (replace only the `[...]` body, not the wipe-between-markers anti-pattern), comment-aware value parser (skip `//` + `/* */` wherever whitespace is skipped), and marker-anchored index-scan replacing the fragile `\s*\n\s*<field>:` regex. Smoke test (toggle showSocialIconsInFooter through the plugin UI): all 6 `i18nKey`, 3 `urlByLocale`, 1 `external:true`, the `navigation.footer` array (2 items with i18n fields), `locales`, `defaultLocale`, and LocalisedString title/description/footer.content shapes survived. Comments must live ABOVE `pages:`/`footer:` — see tools.md rule.

**ADR-005 Phase 4 shipped** (2026-05-12): The N-locale runbook lives at
[`docs/runbooks/add-a-locale.md`](../../runbooks/add-a-locale.md) — widen `Locale`
union → add `siteConfig.locales[]` entry → populate `LocalisedString` + T9
strings → extend collection `lang` enums → add Vault CMS content-types →
optional `urlByLocale` overrides → build → verify hreflang/sitemap fan-out.
Three known cliffs documented (bilingual `findTranslation`, switcher renders a
single link, hreflang scaling for N>2). ADR-005 status flipped from Proposed
to Accepted with Phase 3 fork commits cross-linked
(`c816b24`/`8b73433`/`d6596b4`/`ef6ac68` + vault `39ae100`). `// [CONFIG:NAVIGATION_FOOTER]`
marker added to `src/config.ts` immediately above the `footer:` array for
explicit-marker round-trip robustness. Build verified — 59 pages, no regression.

## Active plan

ADR-005 Phases 1–4 all shipped. No active multi-locale work. Memory cleanup
(`/memory-cleanup`) is the recommended next housekeeping step before picking up
a non-ADR-005 move from the list below.

## Optional follow-ups (separate from ADR-005)

- **Release-mirror workflow for the plugin fork** (analog ADR-001 Deferred Work #1): GitHub Action that mirrors releases from `davidvkimball/obsidian-astro-modular-settings` upstream onto our fork so we know when upstream advances and can plan merges. Low priority — manual `git fetch upstream && git log upstream/master..HEAD` works fine for now.
- **PR the fork's `feat/multi-locale-aware` branch back to upstream** if davidvkimball is interested in landing locale-awareness in canonical. The work is general-purpose enough to be a reasonable contribution.

## Next moves outside ADR-005 (pick when ADR-005 has free space)

These survived the ADR-005 reframe — they're orthogonal to the multi-locale migration:

1. **GH Pages deploy preview** — currently reviewable only via local `pnpm dev`. Three pieces: `siteConfig.deployment.platform: "github-pages"`, `.github/workflows/deploy.yml`, `public/CNAME` with `www.mmomm.org`. Open question: replace `MMoMM-org/mmomm` main (force-overwrite Hugo) or push to a new repo first?
2. **Migrated wikilinks cleanup** — DE/EN post bodies contain template-placeholder `[[Titel der Notiz]]` wikilinks from the migration tool. LocalGraph renders nothing on those posts. Either fill in real cross-post links or strip placeholders.
3. **15 residual image-N placeholders** — content edge cases from the rename pass (`957060e`). Each needs a manual decision: invent a caption, keep the placeholder, or remove the image. List under `find src/content/posts -name 'image-*' -type f`. Not blocking.
4. **Upstream sync workflow** — ADR-001 Phase 3 TBD. When `davidvkimball/astro-modular` releases new versions, merge into the fork. Cadence and conflict-resolution rules not yet captured. Phase 3 of ADR-005 covers the same need for the plugin fork — bundle them.
5. **`/blog/` redirects** — deploy concern. Astro config edits get reverted by `scripts/generate-deployment-config.js`. Defer to platform config (`_redirects` or `netlify.toml`) once deploy target is chosen.

**Subsumed by ADR-005** (no longer separate moves):
- ~~Fork astro-modular-settings for i18n~~ → ADR-005 Phase 3 (locale-aware from start, not just `urlEn` preservation)
- ~~Per-locale `siteConfig`~~ → ADR-005 Decision 3 (`LocalisedString`, applied in Phase 1)
- ~~i18n string coverage Phase 3~~ → ADR-005 Phase 1 step 5+6 covers the 4 known inline gaps; remaining coverage audited as part of Phase 1 verification

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
