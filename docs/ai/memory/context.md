# Context — astro-mmomm
<!-- Current sprint focus, active work, known blockers. Updated: 2026-05-09 -->
<!-- This file is short-lived — prune entries older than 2 weeks via /memory-cleanup -->

## Active branch: `feat/astro-modular` (21 commits ahead of `main`)

The site is being migrated from Hugo (`MMoMM-org/mmomm`, still live at www.mmomm.org) to
Astro using the **astro-modular** theme. The branch has not been merged to `main` and not
deployed anywhere. Hugo site remains the production source of truth.

**Pre-flight check for next session**: `git rev-parse HEAD` should be `adedc6a` (or
later if work continued). `pnpm build` should produce 77 pages cleanly. The branch is
local-only; consider `git push origin feat/astro-modular` for remote backup before
continuing.

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
- **Fork created and wired**: `MMoMM-org/astro-modular-mmomm` (master at `d397c8e` after Phase 2b sync; previously `28aa366`)
  hosts theme-level patches. `pnpm run update` pulls from the fork via branch tarball
  (not GitHub Releases — forks don't auto-mirror those). `.astro-modular-source` records
  the last-pulled SHA. ADR-001 captures the fork decision; ADR-002 captures the i18n
  architecture (Decision #3 was revised same-day from asymmetric → symmetric folder
  layout).

## Phase 2b — mostly shipped (this session, 8 commits)

| Commit | Task | What |
|--------|------|------|
| `7c09d53` | T1 | LinkedMentions backlinks use `findLinkedMentions` returning precomputed `mention.url` |
| `2724561` | T2 | ProjectLayout client-script wikilinks use server-serialized `post.url` |
| `8b76b93` | T4 | PostLayout client-script anchor URLs use the same pattern |
| `e5c2b43` | T10 | Wikilinks IN post bodies (discovered during T1 verification) — uses lazy filesystem-walked slug→lang map in `internallinks.ts` |
| `4df4c7b` | T8 | Sitemap `xhtml:link rel=alternate hreflang` per translation pair |
| `ea9f412` | T7 | Per-locale RSS+Atom split: `/rss.xml`+`/feed.xml` (DE), `/en/rss.xml`+`/en/feed.xml` (EN); shared logic in `src/utils/feeds.ts` |
| `17f52b6` | T5 | BaseLayout `lang` prop + hreflang `<link>` tags |
| `adedc6a` | T11 | Locale-aware homepages — fixed DE locale-mixing bug + new `src/pages/en/index.astro`; shared logic in `src/utils/home.ts` |

## What's pending after Phase 2b

1. **T6 — `src/components/Header.astro` DE↔EN switcher** — needs UX decisions: position
   (left/right of nav?), display style (icon, text "DE/EN", flag), fallback when no
   translation exists for the current page (link to locale homepage — both exist now
   thanks to T11). Uses `findTranslation(post)`.
2. **T9 — `src/i18n/strings.ts`** (new file) — UI labels (Read more, Posted on, Tags,
   Pagination) currently hardcoded. Build a minimum-viable translation table; components
   consume via `t(locale, key)`. Needs MVP key-set decision before dispatch.
3. **T3a — `scripts/generate-graph-data.js` rewrite** — the generator silently skips all
   28 migrated DE/EN posts because it doesn't recurse into `de/`/`en/` subfolders. Node
   IDs are bare slugs but `post.id` carries the locale prefix, so `PostLayout`'s
   `conn.source === post.id` matching cannot succeed. Rewrite needed: recurse into
   locale folders, parse `lang` from frontmatter, emit IDs as `<lang>/<bare-slug>`,
   attach `url` field per node.
4. **T3b — graph component URL consumption** (`GraphModal.astro:405,407`,
   `LocalGraph.astro:264`) — trivial 1-line update once T3a lands; reads `node.url`
   from generator output.
5. **T11 follow-up** — `dist/en/index.html` exists but EN site title/description still
   reads as the DE site title (single-string `siteConfig.title`). Per-locale config
   translation is its own initiative — same applies to RSS feeds (both feeds carry the
   same site title). Consider extending `siteConfig` schema to `{de: ..., en: ...}` or
   adding a translation lookup at consumption sites.

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

- **`src/config.ts` personalization**: still ships astro-modular's defaults — David V.
  Kimball as author, "Astro Modular" as title, fake social links, sample profile image.
  Real values: title "Mingle Mangle of My Mind" (or similar), author "Marcus Breiden",
  domain `https://www.mmomm.org`, real socials. The Vault CMS Obsidian plugin can drive
  most of this; `src/config.ts` is the source of truth.
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
- **Fork**: <https://github.com/MMoMM-org/astro-modular-mmomm> (master at SHA `d397c8e`
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
