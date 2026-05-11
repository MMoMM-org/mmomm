# Context — astro-mmomm
<!-- Current sprint focus, active work, known blockers. Updated: 2026-05-09 -->
<!-- This file is short-lived — prune entries older than 2 weeks via /memory-cleanup -->

## Active branch: `feat/astro-modular` (~26 commits ahead of `main`, pushed to origin MMoMM-org/mmomm)

The site is being migrated from Hugo (`MMoMM-org/mmomm`, still live at www.mmomm.org) to
Astro using the **astro-modular** theme. The branch has not been merged to `main` and not
deployed anywhere. Hugo site remains the production source of truth.

**Pre-flight check for next session**: `git rev-parse HEAD` should be `a59dc7f` or
later. `pnpm build` should produce 77 pages cleanly. Site remote at MMoMM-org/mmomm
(`feat/astro-modular` branch) and theme fork at MMoMM-org/astro-modular-mmomm
(master `4064b30`) both up to date.

## What's done

- **Astro-modular migration**: stock Astro starter replaced with astro-modular theme on
  this branch (commit `d224114`). pnpm-based, port 5000, build via `pnpm build`.
- **Content migrated from Hugo**: 14 DE posts at `src/content/posts/de/<slug>/`, 14 EN
  posts at `src/content/posts/en/<slug>/`. All have `lang` + `translationKey` frontmatter.
  Migration tool: `tools/migrate-from-hugo.mjs --source ../mmomm/content[.en]/blog
  --dest src/content/posts/<locale> --locale <de|en>`.
- **i18n routing scaffold (Phase 2a)**: DE at `/posts/<slug>/`, EN at `/en/posts/<slug>/`.
  Astro core i18n config in `astro.config.mjs`. Parallel route trees under
  `src/pages/posts/` and `src/pages/en/posts/`. Cover image preloads + prev/next post
  hrefs are locale-aware.
- **Fork created and wired**: `MMoMM-org/astro-modular-mmomm` (master at `4064b30`; lineage: `28aa366` → `d397c8e` (T1-T11+T6 bundle) → `b1df8fb` (T3+T9 bundle) → `4064b30` (T3c LocalGraph runtime filter))
  hosts theme-level patches. `pnpm run update` pulls from the fork via branch tarball
  (not GitHub Releases — forks don't auto-mirror those). `.astro-modular-source` records
  the last-pulled SHA. ADR-001 captures the fork decision; ADR-002 captures the i18n
  architecture (Decision #3 was revised same-day from asymmetric → symmetric folder
  layout).

## Phase 2b — SHIPPED (this session, 11 tasks done)

All 11 tasks completed. Synced to fork via two bundled commits.

| Local SHA | Task | What |
|-----------|------|------|
| `7c09d53` | T1 | LinkedMentions backlinks use `findLinkedMentions` returning precomputed `mention.url` |
| `2724561` | T2 | ProjectLayout client-script wikilinks use server-serialized `post.url` |
| `8b76b93` | T4 | PostLayout client-script anchor URLs use the same pattern |
| `e5c2b43` | T10 | Wikilinks IN post bodies — lazy filesystem-walked slug→lang map in `internallinks.ts` |
| `4df4c7b` | T8 | Sitemap `xhtml:link rel=alternate hreflang` per translation pair |
| `ea9f412` | T7 | Per-locale RSS+Atom split (`/rss.xml`+`/feed.xml` DE, `/en/rss.xml`+`/en/feed.xml` EN); shared logic in `src/utils/feeds.ts` |
| `17f52b6` | T5 | BaseLayout `lang` prop + hreflang `<link>` tags |
| `adedc6a` | T11 | Locale-aware homepages — fixed DE locale-mixing bug + new `src/pages/en/index.astro`; shared logic in `src/utils/home.ts` |
| `fa47ada` | T6 | DE↔EN switcher in Header (desktop right-cluster + mobile menu); text-only, `aria-current` on active locale |
| `b829cb8` | T3 (a+b) | Graph generator recurses into `de/`/`en/`, parses `lang` from frontmatter, emits matching IDs and locale-aware URLs; consumers read `node.url` |
| `d5c1e68` | T9 | `src/i18n/strings.ts` typed table foundation with `Record<Locale, StringMap>` parity enforcement; demo migration of `LinkedMentions.astro` title |
| `66b070f` | T3c | LocalGraph runtime filter `currentSlug` is locale-aware (anchored regexes derive `de/<slug>` or `en/<slug>` matching graph node IDs) |

Fork-sync bundles: `d397c8e` (T1–T11 + T6) and `b1df8fb` (T3 + T9) on `MMoMM-org/astro-modular-mmomm` master.

## Active plan — Content structure adopts Hugo shape (ADR-004, 2026-05-11)

Pivot decision: layout/i18n polish (Track C and beyond) was speculation without real bilingual content. Configure Vault CMS for bilingual authoring requires the schema and content structure to land first. Three sequential commits:

1. **Schema bilingual on `pages`** (current step — Task #2)
   - Extend `src/content.config.ts`: pages collection gets `lang: z.enum(['de','en'])` + `translationKey: z.string().optional()`
   - Fix stale "asymmetric layout" comment on posts collection (ADR-002 revised to symmetric)
   - Decide projects/docs schema based on whether they survive Step 2
   - Verify build
2. **Demo cleanup + nav prune** (next)
   - Delete: `posts/{getting-started.md,formatting-reference.md,vault-cms-guide.md,obsidian-embeds-demo.md,sample-folder-based-post/,attachments/}`
   - Delete: `pages/{about.md,contact.md,privacy-policy.md,thank-you.md,attachments/}`
   - Delete: `projects/*`, `docs/*` (demo content)
   - Keep: `special/*` (infrastructure)
   - `siteConfig.optionalContentTypes.{projects,docs} = false`
   - Prune `siteConfig.navigation.pages` to real items
3. **Hugo non-blog migration** (then)
   - 5 static pages: videos, jetzt/now, ueber-mich/about, impressum, datenschutz/privacy-policy → `pages/de/` + `pages/en/` with `lang`+`translationKey`
   - Replace Hugo `{{< youtube ID "title" >}}` shortcode with Astro mdx component or inline iframe

After step 3 — Vault CMS bilingual config (separate work, configure-only per ADR-004 Decision 1).

## Plugin stack reference (one-time finding 2026-05-11)

Five astro-modular Obsidian plugins are complementary, not duplicates:
- **Astro Composer** = authoring (new-note flow, kebab-slugs, internal links, terminal)
- **Vault CMS** = setup wizard + content-types + preset manager (`davidvkimball/vault-cms-presets`)
- **Bases CMS** = grid-view content management via `.base` files
- **Home Base** = pins a `.base` view as default tab
- **Astro Modular Settings** = `src/config.ts` editor via `[CONFIG:KEY]` markers (ADR-003 plugin-compat)

All five plugins have **zero i18n awareness** (grep `translationKey|"lang"|"locale"` = 0 hits across both Vault CMS and Astro Composer source). Bilingual workaround per ADR-004 Decision 1: per-locale content-types in plugin config (no fork).

## Header & language-switcher track (queued — discovered 2026-05-10 during local preview)

A live browser walk of the site surfaced six issues, all in or adjacent to `Header.astro`. Bundled into three tracks per ADR-003:

**Track A — Language-switcher bugs** (must-fix; ~1h)
- (b) DE→EN works, EN→DE silently fails — switcher's active-locale detection broken
- (c) Site title (Home link) always points to `/` (DE root) — must be locale-aware (`/` for DE, `/en/` for EN)
- (f) Switcher always jumps to locale homepage — must compute translated equivalent of current path (`/posts/` ↔ `/en/posts/`)

**Track B — Visual polish** (small, ~15min)
- (a) CSS gap missing between site title and first nav item
- (e) Replace `GitHub` nav text item with `<Icon name="github">` OctoCat (FA brand icon already wired)

**Track C — Per-locale nav** (deferred to a later session, see ADR-003)
- (d) Nav labels are EN-only and some items point to astro-modular demos. Architectural decision: keep `navigation.pages` as a flat `NavigationItem[]` (plugin-compatible — Astro Modular Settings Obsidian plugin requires array shape), translate labels via the T9 i18n strings table, prefix URLs locale-aware at render. Best sequenced with Hugo non-blog migration so demo items get replaced with real ones at the same time.

## What's pending after Phase 2b

Phase 2b proper is fully shipped (T1–T11 + T3c). The next-track candidates from earlier in this branch (still unaddressed):

1. **Per-locale `siteConfig` translation** — both feeds, sitemaps, and homepages carry the same `siteConfig.title`/`description`/`homepageTitle` (single-string today). Extension options: `{de: ..., en: ...}` schema, or a lookup table that mirrors `src/i18n/strings.ts`.
2. **Other UI string migrations** (foundation exists via T9): `Pagination.astro` Previous/Next, `PostContent.astro` Published, reading-time fallbacks, `LinkedMentions.astro:377` "Referenced in this post", `Header.astro` `Switch language to ...` (interpolation case — needs a `t`-helper extension). Each needs a `lang` prop wired through callers.
3. **Localized `projects`/`docs`/`special` collections** — schemas have no `lang` field; both homepages share the same set.
4. **`src/config.ts` personalization** — ✅ SHIPPED 2026-05-10 (commit `a59dc7f`). Real values now in place: site `https://www.mmomm.org`, title `MingleMangleOfMyMind`, author `Marcus Breiden`, language `de`, description `"PKM, Obsidian, MiYo, AI und anderes Gedöns"` (DE — EN-side deferred to track #1 per-locale siteConfig). Socials: GitHub (MMoMM-org), LinkedIn, YouTube, Xing. Footer attribution to astro-modular theme retained. Nav still has demo `Projects`/`Docs` items pointing to astro-modular sample collections — falls under track #6 sample-content cleanup.
5. **Hugo non-blog migration + image-name quality pass** (combined track — discussed 2026-05-10):
   - **Hugo non-blog dirs awaiting migration** (at `../mmomm/content/`): `ueber-mich/`, `jetzt/`, `impressum/`, `datenschutz/`, `videos/`, `categories/`. The migration tool defaults `--source` to `../mmomm/content/blog` (line 30 of `tools/migrate-from-hugo.mjs`); each section needs a separate run, plus optional schema decisions (do these become `pages/` or a new collection? `categories/` is index-derived — different shape).
   - **Wix image extraction is ALREADY working** — confirmed: built site has zero `/img/wix/<hash>` references; migration tool detects `/img/wix/<file>` markdown patterns (regex `IMG_REF` ~line 148) and copies sources from `../mmomm/static/img/wix/` (85 hash-named files: `11062b_<hash>~mv2.jpg`, `a64b4a_<hash>~mv2.png`) into per-post `attachments/` folders, rewriting the markdown reference. Cover image goes to `cover.<ext>`. Image renaming uses `slugify(caption)` from the first non-blank paragraph after the image (line 158-164 — captions in Hugo are typically the line right after `![alt](src)`).
   - **Image-name quality gap** — current state in `src/content/posts/{de,en}/`: 122 attachments total, **80 (66%) are generic `image-N.<ext>`** placeholders (fallback at `tools/migrate-from-hugo.mjs:164` when caption detection fails — likely because the Hugo source has no plain-text caption directly under the image, or the image is followed by another markdown construct). 42 (34%) have readable slugified names. Examples of placeholder cases: `meine-obsidian-homepage.png` ✓ vs `image-3.png` ✗ in the same `de/obsidian-die-in-der-alles-besser-ist/attachments/` folder.
   - **Possible next-session moves** (not all needed):
     - (a) Re-run migration with an improved caption heuristic — try `alt` text first (`![alt](url)`), then captions, then a numbered fallback. Alt text is often present where captions aren't. Probably the highest leverage 1-hour fix.
     - (b) Manual quality pass on the 80 placeholder names — use Obsidian's vault rename to bulk-update both filename and references. Probably 30-60 min of judgment calls.
     - (c) Run migration on the 6 non-blog dirs and ensure image extraction works there too (it should — the regex is text-based — but verify each one has a meaningful page schema first).
   - **Open questions** for the next session: do `categories/` pages need rendering (Hugo had auto-generated category index pages — Astro doesn't have an exact equivalent without custom routes)? Does `videos/` map to a new collection or just an enriched post type?
6. **astro-modular sample content cleanup** — 5 demo posts and 4 demo pages (all `lang: en`) still in the build. Decide: delete vs translate vs leave-as-archive.
7. **Migrated post content** — DE/EN posts contain template-placeholder wikilinks (`[[Titel der Notiz]]`) from the migration tool. Real cross-post wikilinks need to be added (or the placeholders removed) before LocalGraph renders anything visible on those posts.
8. **GH Pages deploy + repo cutover** — `src/config.ts` `deployment.platform`, `.github/workflows/deploy.yml`, `public/CNAME` with `www.mmomm.org`. Open question: replace `MMoMM-org/mmomm` `main` (force-overwrite Hugo) or push to a new repo.
9. **Upstream sync workflow** — when `davidvkimball/astro-modular` releases new versions, how to merge them into the fork. Standard pattern documented in ADR-001 Phase 3 as TBD.

## Phase 2b discoveries worth remembering

- **`astro:content` config-load hazard**: `astro.config.mjs` → `internallinks.ts` (for remarkInternalLinks) → must NOT import `i18n.ts` (which imports `astro:content`, unavailable at config-load time). Worked around by inlining `postUrlFromPost` at `internallinks.ts:6`. See `troubleshooting.md`.
- **Slug→lang resolution for remark plugins**: filesystem walk + memoization on `globalThis` via `Symbol.for`. See `decisions.md` and `buildSlugLangMap` in `internallinks.ts`.
- **DE homepage was silently mixing locales** — `getCollection('posts')` with no lang filter. Same class of bug audit pattern: grep `getCollection('posts')` and verify each call is locale-paired.
- **Path-based ID generators must use `/` not `-`** — `scripts/generate-graph-data.js` previously joined nested folders with `-` (`category-my-post`) but Astro's `post.id` uses `/` (`category/my-post`). Latent mismatch surfaced when symmetric refactor put posts under `de/`, `en/`. Match the framework's ID format exactly.
- **Type-safe i18n table pattern**: `Record<Locale, StringMap>` where `StringMap` is the single-source-of-truth key shape. Drift between locales becomes a compile error. See `src/i18n/strings.ts` (T9).

## Phase 2b discoveries worth remembering

- **`astro:content` config-load hazard**: `astro.config.mjs` → `internallinks.ts`
  (for remarkInternalLinks) → must NOT import `i18n.ts` (which imports `astro:content`,
  unavailable at config-load time). Worked around by inlining `postUrlFromPost` at
  `internallinks.ts:6`. See `troubleshooting.md`.
- **Slug→lang resolution for remark plugins**: filesystem walk + memoization on
  `globalThis` via `Symbol.for`. See `decisions.md` and `buildSlugLangMap` in
  `internallinks.ts`.
- **DE homepage was silently mixing locales** — `getCollection('posts')` with no lang
  filter. Same class of bug likely lurks in tag/archive listing pages. Audit pattern:
  grep `getCollection('posts')` and verify each call is locale-paired.

## Other pending tracks

- **Hugo non-blog sections**: `ueber-mich/about`, `jetzt/now`, `impressum`,
  `datenschutz/privacy-policy`, `videos`, `categories` — not yet migrated. Migration tool
  (`tools/migrate-from-hugo.mjs`) currently handles only `/blog/`. Either extend it for
  pages or write a sibling script. Both DE + EN.
- **astro-modular sample content cleanup**: 5 demo posts (`getting-started.md`,
  `formatting-reference.md`, `vault-cms-guide.md`, `obsidian-embeds-demo.md`,
  `sample-folder-based-post/`) and 4 demo pages (`about.md`, `contact.md`,
  `privacy-policy.md`, `thank-you.md`) still in the build. They're tagged `lang: en`
  and appear in EN listings as if they were our content. Decide: delete vs translate vs
  leave-as-archive.
- **GH Pages deploy + repo cutover**: not started. Three pieces needed: `src/config.ts`
  `deployment.platform: "github-pages"`, `.github/workflows/deploy.yml`, `public/CNAME`
  with `www.mmomm.org`. Open question: replace `MMoMM-org/mmomm` (force-overwrite) or
  push to a new repo (`MMoMM-org/astro-mmomm`)?
- **Upstream sync workflow**: when `davidvkimball/astro-modular` releases new versions,
  how do we merge them into the fork? Documented as TBD in ADR-001 Phase 3. Standard
  pattern: `cd <fork>; git fetch upstream; git merge upstream/master; resolve conflicts
  on patched files; git push origin master`. Cadence and conflict-resolution rules not
  yet captured.
- **`/blog/` redirects**: my edits to `astro.config.mjs` to add `/blog/[...slug]` →
  `/posts/[...slug]` keep getting reverted by some build script (suspect
  `scripts/generate-deployment-config.js`). Production redirects need platform config
  (`netlify.toml`, `_redirects`, etc.) anyway — Phase 3 deploy concern.

## Key references

- **Branch**: `feat/astro-modular`. Branch off `main`, no direct main commits (hook-blocked).
- **Fork**: <https://github.com/MMoMM-org/astro-modular-mmomm> (master at SHA `4064b30`
  as of 2026-05-09). Clone, patch, push pattern documented in `tools.md`.
- **Local update flow**: `pnpm run update`. Reads SHA from
  `https://api.github.com/repos/MMoMM-org/astro-modular-mmomm/branches/master`, compares
  against `.astro-modular-source` (gitignored), pulls tarball, restores USER_PATHS.
  Override via `ASTRO_MODULAR_REPO=davidvkimball/astro-modular pnpm run update`.
- **USER_PATHS layering**: cross-project defaults in fork's `scripts/update.mjs`;
  site-specific paths in local `.astro-modular-user-paths` (root, gitignored — this site
  preserves `claude-docker*`, `.mcp.json`, `.claude/`, `docs/`, `src/CLAUDE.md`, etc.).
- **ADRs**: `docs/XDD/adr/ADR-001-fork-astro-modular-for-i18n.md` (fork decision),
  `docs/XDD/adr/ADR-002-i18n-architecture.md` (i18n; Decision #3 revised, see Revisions).
- **Memory bank**: `docs/ai/memory/{tools,decisions,troubleshooting}.md` carry the
  durable learnings. Run `/memory-add` after sessions with new gotchas.
- **Migration tool**: `tools/migrate-from-hugo.mjs`. Self-contained Node script, no
  extra deps. Mappings codified in commit `50efbba`.
- **Hugo source**: `/Volumes/Moon/Coding/MMoMM.org/mmomm/` (sibling repo, GH:
  `MMoMM-org/mmomm`, tracks `main`, GH Pages deploy live).

## Gotchas to keep in mind

- **Zod deprecation noise**: `content.config.ts` shows `'z' is deprecated` TS diagnostics
  on every Astro alpha re-export — pre-existing upstream noise from Astro 7 alpha. Not
  from our changes. Ignore.
- **TS path alias 'Cannot find module' errors**: `@/types`, `@/config`, `astro:content`
  TS diagnostics pop up after `pnpm run update` (the update wipes `.astro/` type cache).
  Resolved by next `pnpm dev` or `pnpm build`.
- **The linter rewrites `astro.config.mjs`**: my `/blog/` redirect entries keep
  disappearing across runs. Suspect a build-time formatter. Worked around by deferring
  prod redirects to platform config (Phase 3).
- **`pnpm create astro-modular` is denied by Claude auto-mode classifier** (npm
  scaffolder = "untrusted external code execution"). Use the README-documented
  alternative: `git clone --depth=1 …`. Already memoized in `troubleshooting.md`.
- **Hugo image convention**: images live flat in `static/img/wix/<hash>.png` (Wix
  import legacy), referenced as `/img/wix/<hash>.png`. The migration tool rewrites
  these to `attachments/<readable-name>.<ext>` per post folder.

## What I'd start with next session

Pick whichever next move feels right — they're tracked above. Quickest unblock: Phase 2b
URL helpers (LinkedMentions, ProjectLayout, GraphModal, LocalGraph), since they're
mechanical replacements following the `postUrl(post)` pattern already established.
Highest user value: site personalization in `src/config.ts` (so the site stops claiming
to be David V. Kimball's). Most operationally important: GH Pages deploy preview, so the
work can be visually reviewed.

The active question at session-end was: continue Phase 2b vs other tracks. Not answered.
