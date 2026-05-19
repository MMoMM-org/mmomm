# Backlog & Technical Debt — astro-mmomm

> Open work items for the bilingual Astro rebuild of [www.mmomm.org](https://www.mmomm.org).
> For day-to-day session state see [`docs/ai/memory/context.md`](docs/ai/memory/context.md).
> For architectural decisions see [`docs/ai/memory/decisions.md`](docs/ai/memory/decisions.md) and [`docs/XDD/adr/`](docs/XDD/adr/).
> Last reviewed: 2026-05-19 (post-cutover).

---

## 🟢 Post-cutover follow-ups

The Astro rebuild is now live on www.mmomm.org (cutover 2026-05-19, commit `605df51`). These are small loose ends from the switchover.

### 1. Toggle "Enforce HTTPS" in GH Pages settings *(user-only, 1 click)*
- `https://www.mmomm.org/` and `http://www.mmomm.org/` both return 200, but `https_enforced: false` per `gh api repos/MMoMM-org/mmomm/pages`. GitHub Settings → Pages → tick "Enforce HTTPS".
- Cert is already provisioned (Let's Encrypt via GH Pages); this just adds the HTTP→HTTPS redirect.

### 2. Translation key for the HAL9000 AI-excuses pair
- `src/content/posts/de/es-tut-mir-leid-dave-ich-fürchte-das-kann-ich-nicht-tun.md` and `src/content/posts/en/im-sorry-dave-i-cant-do-that.md` both ship with `translationKey: ""`, so the language switcher and hreflang fan-out skip this pair. Fill the same kebab-case string into both frontmatters (e.g. `ai-excuses`) when ready.

### 3. Hugo rollback safety net
- The pre-cutover Hugo `main` (commit `4d8de87`) is preserved as the annotated tag `archive/hugo-2026-05-19`.
- Restore recipe (only if the Astro deploy goes catastrophically wrong): `git push origin archive/hugo-2026-05-19:main --force-with-lease`. This re-points main at the Hugo tip; the existing Hugo `deploy.yml` (still in that tag's tree) re-runs and the Hugo site comes back.
- Keep the tag indefinitely — it's the only canonical ref for the pre-cutover state since main was force-pushed.

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
- Page count cited as "59 pages" (now 65 post-cutover).
- Branch-state language ("N commits ahead of main") is now obsolete — `feat/astro-modular` was force-pushed to `main` on 2026-05-19; both refs are equal at `605df51` and onward.
- Theming + header + BRAT-fork-release work from 2026-05-12 plus the 2026-05-19 cutover session aren't summarised — only the Phase C section is current.
- Run `/memory-cleanup` (or do it manually) to fold heavy entries into the archive and bring the rollup current.

### 9. `obsidian-buttons` posts: 2 swap-button-with-anchor cases + orphan-fence regions still confuse parser

**Most cases fixed** (2026-05-12): 39 of 41 nested-fence patterns across 5 posts (`de/obsidian-buttons`, `en/obsidian-buttons`, `de/obsidian-dynbedded`, `en/obsidian-dynbedded`, `en/obsidian-todoist`) were converted from 3-backtick to 4-backtick outer fences so the inner `` ```<lang> `` content displays as literal code. obsidian-dynbedded and obsidian-todoist render correctly post-fix. obsidian-buttons mostly improves but two issues remain:

**Issue 1 — swap-button-with-anchor (2 cases, 1 in each locale)**: a nested-fence pattern that has an Obsidian block-anchor (`^button-swap`) between the inner-close and outer-close:
  ````
  ```
  ```button
  name Crazy Swap Button
  swap [add,meeting,forum]
  ```
  ^button-swap         ← anchor breaks the strict "inner-close + outer-close adjacent" rule
  ```
  ````
The automated fix skipped these because the outer-close is not on the line directly after the inner-close. Manual rewrite needed: either move the anchor outside the code-display block (lose it from the rendered code sample) or restructure as 4-backtick fence explicitly.

**Issue 2 — orphan ``` fences elsewhere in `obsidian-buttons`**: the file has standalone `` ``` `` fences that don't participate in any nested-fence pattern (e.g. lines 170 and 198 of `de/obsidian-buttons`). Combined with adjacent normal 3-tick code blocks they shift fence-parity and cause 20+ line spans of prose to render as code. Not a "nested fence" problem per se — needs content-level cleanup. Symptom: `dist/posts/obsidian-buttons/index.html` still has many `<span class="line">` segments containing German text.

Recommendation: spend 10 minutes manually inspecting `obsidian-buttons` source and fixing the remaining 2-3 trouble spots. Or live with the visual ugliness — the post is still readable.

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

## ✅ Recently shipped (2026-05-19 — cutover session)

For context. Move to git-history-only and trim from this file when this list reaches ~5+ entries.

- **Production cutover** — tagged Hugo main as `archive/hugo-2026-05-19` (preserves full Hugo history), force-pushed `feat/astro-modular` to `origin/main`. GH Pages workflow ran green; www.mmomm.org now serves the Astro rebuild
- **GH Pages CI + custom domain** (`605df51`) — `.github/workflows/deploy.yml` (pnpm 11 + node 22 → `actions/deploy-pages@v4`), `public/CNAME` ensures the deploy artifact preserves `www.mmomm.org`
- **File-based i18n post layout support** (`f2afda3`) — wikilink resolver now handles `src/content/posts/<locale>/<slug>.md` with shared `<locale>/attachments/`, mirroring sync-images.js output (locale-aware URL with `attachments/` stripped)
- **T11 cross-locale audit wave** (`6462b1d`, `ae9e909`, `08bbeba`) — confined to current locale: post prev/next nav, LinkedMentions backlinks, Command Palette search results, RSS/Atom auto-discovery `<link>` tags
- **First DE/EN translation pair authored** (`84ced8a`) — HAL9000 AI-excuses post, three meme images per side, file-based layout (surfaced the wikilink bug above)
- **Docs** (`a23ecd6`) — MULTILANG.md frontmatter property tables + file-based vs folder-based layout decision guide; memory updates (`e7486cd`, `40d1ec9`) for sync-images single-pass gotcha + T11 audit heuristic

---

## How to use this file

- New work item discovered? Add a section under the right header. Number doesn't matter; reorder freely.
- Item taken? Move to "Recently shipped" with a commit SHA, or just delete once the section reaches ~5 entries.
- Item revealed as a real architectural decision? Move it to an [ADR](docs/XDD/adr/) and link from here.
- Item is a known bug with a workaround? Move it to [`troubleshooting.md`](docs/ai/memory/troubleshooting.md) and link.
