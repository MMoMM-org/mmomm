# Context — astro-mmomm
<!-- Current sprint focus, active work, known blockers. Updated: 2026-05-09 -->
<!-- This file is short-lived — prune entries older than 2 weeks via /memory-cleanup -->

## Active branch: `feat/astro-modular` (13 commits ahead of `main`)

The site is being migrated from Hugo (`MMoMM-org/mmomm`, still live at www.mmomm.org) to
Astro using the **astro-modular** theme. The branch has not been merged to `main` and not
deployed anywhere. Hugo site remains the production source of truth.

**Pre-flight check for next session**: `git rev-parse HEAD` should be `6b8cef5` (or
later if work continued). `pnpm build` should produce 76 pages cleanly.

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
- **Fork created and wired**: `MMoMM-org/astro-modular-mmomm` (master at `28aa366`)
  hosts theme-level patches. `pnpm run update` pulls from the fork via branch tarball
  (not GitHub Releases — forks don't auto-mirror those). `.astro-modular-source` records
  the last-pulled SHA. ADR-001 captures the fork decision; ADR-002 captures the i18n
  architecture (Decision #3 was revised same-day from asymmetric → symmetric folder
  layout).

## What's pending — Phase 2b (the next coherent chunk)

Phase 2a left several places still hardcoding `/posts/${post.id}` paths. They produce
broken cross-locale links. All belong in the fork (will need the same clone-patch-push
loop). In priority order:

1. **`src/components/LinkedMentions.astro`** lines 307, 323 — backlinks render with
   wrong locale. Use `postUrl(mention)` instead of `/posts/${mention.slug}`.
2. **`src/layouts/ProjectLayout.astro`** line 465 — runtime JS link.href hardcodes
   `/posts/${post.id}`.
3. **`src/components/GraphModal.astro`** lines 405, 407 and **`LocalGraph.astro`**
   line 264 — graph navigation URLs.
4. **`src/layouts/PostLayout.astro`** lines 389, 391 — client-side script in a `<script>`
   tag uses `/posts/${post.id}#{anchor}`. Needs the post object's locale serialised into
   the data attribute or the URL pre-computed server-side.
5. **`src/layouts/BaseLayout.astro`** — currently hardcodes `<html lang={siteConfig.language}>`
   (single global value). Needs a `lang` prop + hreflang `<link>` tags pointing at the
   `findTranslation(post)` counterpart.
6. **`src/components/Header.astro`** — no language switcher exists. Add a DE↔EN toggle
   that uses `findTranslation` to link to the paired post (or fall back to the locale
   homepage).
7. **`src/pages/rss.xml.ts`** + **`feed.xml.ts`** — currently emits both DE and EN posts
   in one feed with broken `/posts/en/<slug>/` URLs (those routes don't exist; correct
   is `/en/posts/<slug>/`). Split into per-locale feeds.
8. **`src/pages/sitemap.xml.ts`** — add hreflang annotations for translation pairs.
9. **`src/i18n/strings.ts`** (new file) — UI labels (Read more, Posted on, Tags,
   Pagination) currently hardcoded. Build a minimum-viable translation table; components
   consume via `t(locale, key)`.

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
- **Fork**: <https://github.com/MMoMM-org/astro-modular-mmomm> (master at SHA `28aa366`
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
