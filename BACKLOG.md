# Backlog & Technical Debt — astro-mmomm

> Open work items for the bilingual Astro rebuild of [www.mmomm.org](https://www.mmomm.org).
> For day-to-day session state see [`docs/ai/memory/context.md`](docs/ai/memory/context.md).
> For architectural decisions see [`docs/ai/memory/decisions.md`](docs/ai/memory/decisions.md) and [`docs/XDD/adr/`](docs/XDD/adr/).
> Last reviewed: 2026-05-12.

---

## 🚀 Pre-deployment — blocking GitHub Pages go-live

These are the items between "Astro rebuild works locally" and "www.mmomm.org serves the rebuild".

### 1. GitHub Actions workflow for GH Pages deploy
- Site config now declares `deployment.platform: "github-pages"` (`src/config.ts:263`) but no workflow file exists at `.github/workflows/`.
- Need a `.github/workflows/deploy.yml` that runs `pnpm install && pnpm build` then publishes `dist/` to GH Pages.
- Astro's official guide: [Deploy your Astro Site to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/).
- Decision needed: deploy from the `feat/astro-modular` feature branch directly (interim, before cutover) or wait until the merge to `main`.

### 2. Cutover plan — `feat/astro-modular` → `main`
- The Astro rebuild lives on a long-lived feature branch. `main` still hosts the Hugo source serving production.
- Branch is currently **~110 commits ahead** of `main` with no PR.
- Sequence (when ready):
  1. Open PR `feat/astro-modular` → `main` for review history.
  2. Decide whether to squash or merge with full history (recommend merge to preserve Phase 2a/2b/Phase 3/Phase 4/Phase C narrative).
  3. After merge, the workflow above (item 1) deploys the rebuild.
  4. Old Hugo site content remains in git history; if needed for rollback, can revert the merge commit.

### 3. Custom domain DNS
- Once GH Pages serves `<MMoMM-org>.github.io/mmomm` (or wherever), point `www.mmomm.org` DNS at it.
- Verify with HTTPS cert provisioning (Let's Encrypt via GH Pages).
- Set GH Pages "Enforce HTTPS" once cert is live.

---

## 🟡 Open backlog — small, not blocking

### 4. `remark-obsidian-comments` multi-node `%%` support  *(TaskList #55)*
- Plugin walks text nodes individually, so a comment containing inline code (`` `foo` ``) splits into multiple AST nodes and the strip regex never matches the full `%%...%%` block. Comment renders as visible plain text.
- See [`docs/ai/memory/troubleshooting.md`](docs/ai/memory/troubleshooting.md#remark-obsidian-comments-doesnt-strip-when-comment-contains-inline-code) for the full diagnosis + content-author workaround.
- Real fix: theme-fork enhancement to walk paragraph children, detect `%%` across sibling nodes, splice the entire range. Edit lives in `astro-modular-mmomm/src/utils/remark-obsidian-comments.ts`.

### 5. Tag-cloud fallback on unknown `/posts/tag/<x>` URLs
- `extractTags()` only sources from frontmatter `tags:` arrays. Inline `#tag` references in body content produce clickable `<a href="/posts/tag/foobar">` links via `remarkInlineTags`, but no `getStaticPaths` entry exists for tags that have no frontmatter equivalent (e.g. `#PWM`, `#Dataview`, `#Tasks`, `#Templater`, `#Buttons`).
- Today: clicking such a tag → 404.
- Idea: when an unknown tag URL is requested, render a tag-cloud / "did you mean..." page instead. Or extend `extractTags()` to harvest from body content too (theme-fork edit).
- See [`docs/ai/memory/general.md`](docs/ai/memory/general.md#tag-index-pages-are-frontmatter-only--inline-tags-dont-auto-register) for the durable rule.

### 6. EN-localised 404 page
- `src/content/special/en/404.md` exists with English content (Phase C), but `src/pages/404.astro` reads only `${DEFAULT_LOCALE}/404` because Astro emits a single static `404.html` at build time.
- A future enhancement could route EN paths (`/en/<anything-broken>`) to a separate `/en/404.html` if Astro ever grows per-locale 404 support. Until then, EN visitors who hit a broken URL see the German 404.
- Low priority — broken URLs are rare and the German 404 is visually neutral.

---

## 🔧 Technical debt

### 7. `pnpm astro check` reports 28 errors
- Most are `Cannot find module 'mdast'` — TypeScript type-declarations for the `mdast` peer dependency are not installed.
- Build (`pnpm build`) is unaffected because the runtime doesn't need the types.
- Fix: `pnpm add -D @types/mdast` (or whichever package provides the types).
- Worth doing for editor LSP cleanliness even if the build is happy.

### 8. `context.md` rollup is stale
- Page count cited as "59 pages" (now 62 after Phase C).
- Branch state cited as "58 commits ahead of main" (now ~110).
- Theming + header + BRAT-fork-release work from 2026-05-12 is not summarised — only the Phase C section is up to date.
- Run `/memory-cleanup` (or do it manually) to fold heavy entries into the archive and bring the rollup current.

### 9. `obsidian-buttons` posts: nested triple-backtick fences confuse markdown parser
- `src/content/posts/de/obsidian-buttons/index.md` and the EN counterpart use a nested-fence pattern to display Obsidian button-syntax literally:
  ````
  ```
  ```button
  name Foo
  ```
  ```
  ````
- CommonMark closes the OUTER fence on the FIRST `` ``` `` it sees with no info string, then re-opens on the next bare `` ``` ``. The pattern ends up unbalanced and from roughly the first nested-fence block onward, much of the body is treated as code.
- Visible symptom: 342× `<span class="line">` (Shiki) vs 41× `<p>` in `dist/posts/obsidian-buttons/index.html`. Wikilinks and other inline syntax in the affected paragraphs render as literal text instead of resolved markup.
- Two fix paths:
  1. Rewrite the nested-fence sample blocks with 4-backtick outer fences (`` ```` ``) so the 3-backtick inner content is unambiguously literal. Mechanical, content-only.
  2. Replace the displayed-code samples with image attachments or a different syntax-display approach.
- Not blocking — the post is still readable, just visually plain. Tracked here so we don't forget when refining content quality.

### 10. Theme-fork drift on non-Header.astro files
- The 2026-05-12 fork-sync passes brought 5 + 5 theme files to current site state, but other theme files may have accumulated unmirrored edits (any file under `src/components/`, `src/layouts/`, `src/utils/`, `src/pages/` that was touched during Phase 2b / Track A/B/C / UI strings work and never `cp`'d up to `astro-modular-mmomm`).
- Detection: `cd ../astro-modular-mmomm && git diff --stat ../astro-mmomm/<theme-paths>` per pass.
- Practical mitigation: run a "fork-sync audit" pass whenever shipping a new theme-level feature, to keep the drift bounded. See [`docs/ai/memory/tools.md`](docs/ai/memory/tools.md) "Fork-sync workflow".

### 11. Plugin fork `master` vs `feat/multi-locale-aware`
- The plugin fork (`MMoMM-org/astro-modular-settings-mmomm`) ships releases from `feat/multi-locale-aware` (current state on the release `0.5.4-mmomm.1`). `master` is still an upstream mirror at `c023598`.
- Either: (a) merge `feat/multi-locale-aware` → master so master = current shipped state, or (b) document the convention that the feature branch is the release line and master mirrors upstream.
- Today the choice is implicit; making it explicit avoids future confusion.

---

## 👤 User-owned (not for Claude)

### 12. Graph view + wikilinks cleanup
- Original multilang punch list item (g): the graph view of the site doesn't show links between notes properly. User said "das mache ich wenn du fertig bist".

---

## ✅ Recently shipped (2026-05-12 — this session)

For context. Move to git-history-only and trim from this file when this list reaches ~5+ entries.

- **ADR-005 Phase C** (`f1dff84`) — bilingual special collection + `/now/` migrated to regular page pair
- **Theme-fork sync** (`astro-modular-mmomm@3e663d7`, `4d6e0e0`, `fc5bf83`) — Phase B fixes, Phase C mirror, Header.astro accumulated i18n catch-up
- **Plugin fork release** (`obsidian-astro-modular-settings-mmomm@0.5.4-mmomm.1`) — first BRAT-installable build, BRAT redirect committed in site
- **Vault CMS gap closure** (`acd8be8`) — Special Pages DE/EN content types in vault-cms + astro-composer
- **Theming pass** (`2fc72e4`) — favicons, OG card, profile picture, deployment platform → GH Pages
- **Header refinements** (`adec8bc`, `7ab4244`) — profile picture in header, GitHub octocat out of nav, DE `%%` comment fix, dark favicon resize, centered site title row
- **Memory updates** (`d14dc3b`, `230446e`, `88e5807`, `2428b33`) — durable lessons captured

---

## How to use this file

- New work item discovered? Add a section under the right header. Number doesn't matter; reorder freely.
- Item taken? Move to "Recently shipped" with a commit SHA, or just delete once the section reaches ~5 entries.
- Item revealed as a real architectural decision? Move it to an [ADR](docs/XDD/adr/) and link from here.
- Item is a known bug with a workaround? Move it to [`troubleshooting.md`](docs/ai/memory/troubleshooting.md) and link.
