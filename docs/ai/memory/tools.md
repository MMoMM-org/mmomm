# Tools — astro-mmomm
<!-- CI, build pipeline, API clients, local dev setup. Updated: 2026-05-12 -->

## Astro Modular Settings plugin — fork re-enabled with i18n-safe round-trip (2026-05-12)
<!-- 2026-05-12 — fork shipped, plugin re-enabled, smoke test passed -->
The plugin is now **re-enabled** in this vault via the `MMoMM-org/astro-modular-settings-mmomm` fork (`feat/multi-locale-aware` branch, last commit `ef6ac68`). The fork's parser/serializer round-trip is i18n-safe: `i18nKey`, `urlByLocale`, `external`, `navigation.footer`, `LocalisedString` shapes on title/description/footer.content/etc., and the `[CONFIG:LOCALES]` + `[CONFIG:DEFAULT_LOCALE]` markers all survive UI saves. Smoke test passed by toggling `showSocialIconsInFooter` (2026-05-12). Built artifacts at `src/content/.obsidian/plugins/astro-modular-settings/main.js|manifest.json|styles.css`.

**Why it now works** (architectural keys, condensed from decisions.md):
1. Plugin's `loadSettings()` overlays config.ts on top of `data.json` for the fields data.json can't faithfully represent without UI support (nav.pages, nav.footer, LocalisedString site-info, locales, defaultLocale, footer.content). config.ts is the source of truth; data.json is a cache.
2. Serializer is **in-place** (replaces only the `[...]` body) rather than wipe-between-markers. This preserves comments above `pages:`, the sibling marker-less `footer:` block, and any future co-located content.
3. Parser skips `//` and `/* */` comments and uses index-scanning instead of fragile regex; comments between marker and field, and between array items, are tolerated.

**Critical convention: Comments must live ABOVE `pages:` / `footer:` (not inside the array literal)** — the in-place serializer replaces the `[...]` body, so inline comments between items are destroyed on save. Comments between the marker and the field name are preserved. See the explanatory note at `src/config.ts:330+` for the durable rule.

**Refreshing the plugin** — when the fork advances (new commits on `feat/multi-locale-aware`):
```
cd ../obsidian-astro-modular-settings-mmomm
pnpm install --ignore-scripts    # --ignore-scripts: upstream preinstall references a missing scripts/npm-proxy.mjs
pnpm build                       # tsc -noEmit -skipLibCheck && esbuild production
cp main.js manifest.json styles.css ../astro-mmomm/src/content/.obsidian/plugins/astro-modular-settings/
```
Then reload Obsidian. Run `git diff src/config.ts` after any plugin-driven save as a sanity check.

**Adding a NAVIGATION_FOOTER marker (optional, recommended)**: the fork's parser/serializer round-trip works on the user's current config.ts which has `footer: [...]` orphaned between `[CONFIG:NAVIGATION_PAGES]` and `[CONFIG:NAVIGATION_SOCIAL]` (no marker). Adding `// [CONFIG:NAVIGATION_FOOTER]` immediately before `footer:` makes the round-trip explicit-marker-anchored (more robust against future structural changes) instead of relying on structural detection between pages-end and SOCIAL marker. Not required for current functioning.

---

## Astro Modular Settings plugin — historical clobber background (pre-fork, 2026-05-11)
<!-- 2026-05-11 — observed clobber + decision to disable; superseded by the 2026-05-12 fork above -->
Kept for context: explains why the fork was necessary and what classes of failure the fork prevents.


The Astro Modular Settings plugin (`src/content/.obsidian/plugins/astro-modular-settings/`) is a UI for editing `src/config.ts` via 174 `[CONFIG:KEY]` markers. Its own `data.json` is the in-memory model; the Astro build never reads it. The plugin has 2 `writeFileSync(configPath)` calls in main.js — at least one is reachable from a code path that runs **without** user interaction (the user reported "ich habe nur geschaut" / "I only looked", but config.ts was still clobbered). The "Apply all settings" / "Apply template" UI buttons exist as additional write paths. We don't know exactly which path fired in the observed incident; we know the plugin writes config.ts from at least one passive trigger (likely `onload()` or a data.json↔config.ts mismatch sync on load).

**Decision**: the plugin is **disabled** in this vault — removed from `src/content/.obsidian/community-plugins.json`. The Astro Composer plugin remains enabled and is the authoring entry point (0 markers, only opens config.ts via `configFilePath` ribbon command — never writes). Configuration of `src/config.ts` happens **only in the editor**, never through plugin UI.

**The clobber failure mode** — observed in this session — happens when:
1. Plugin's data.json contains stale or lossy values (e.g. demo nav, or nav stripped of fields the plugin doesn't know about), AND
2. The user triggers an "Apply" action in the plugin UI (including the Setup Wizard's apply/skip flow), THEN
3. The plugin writes the FULL marked block from data.json to config.ts, dropping fields the plugin model doesn't recognise.

**Fields the plugin model does NOT understand** (will be dropped on any Apply):
- `siteConfig.navigation.pages[].i18nKey` (ADR-003 T9 lookup key)
- `siteConfig.navigation.pages[].urlEn` (ADR-003 revision — slug-divergent EN URLs)
- `siteConfig.navigation.pages[].external` (icon-only GitHub external link flag)
- `siteConfig.navigation.footer` (entire array — no `[CONFIG:NAVIGATION_FOOTER]` marker exists; the plugin writes the whole `navigation: {}` block and silently drops the footer key)

**Operating rules** (the plugin is disabled, but the rules apply any time it gets re-enabled):
1. **Never re-enable `astro-modular-settings` in `community-plugins.json` without first forking it** to teach the plugin about `i18nKey`/`urlEn`/`footer`. Re-enabling as-is risks the same clobber: the plugin's lossy model overwrites config.ts's bilingual richness on any sync path.
2. **If you do re-enable**: also keep `astro-modular-settings/data.json` synced to MMoMM values (without i18nKey/urlEn/footer) as damage limitation, and run `git diff src/config.ts` after every Obsidian session.
3. **Fork plan** (analog to ADR-001 for the theme): create `MMoMM-org/astro-modular-settings-mmomm`, extend the navigation model with `i18nKey?`, `urlEn?`, `external?`, plus a top-level `footer?: NavigationItem[]` parallel to `pages`. Marker syntax stays compatible. See context.md "Next moves" for tracking.

The location to enable/disable the plugin is `src/content/.obsidian/community-plugins.json` (Obsidian's own list) — **not** `vault-cms/data.json`'s `enabledPlugins` array, which is vault-cms's own concept and does not include astro-modular-settings.

## Translation-gap triage = Bases CMS views (no code, no grep)
<!-- 2026-05-12 -->
Finding untranslated posts / pages — anything in `posts/` or `pages/` with
empty/null `translationKey` — is a Bases CMS lookup, not a grep over
`src/content/`. Two entry points:

- **`src/content/bases/Translation-Pairs.base`** (dedicated triage base, 3 views):
  posts grouped by `translationKey`, pages grouped by `translationKey`,
  and a flat "🔴 Missing translation key" list across both.
- **`src/content/bases/Home.base` → "🔴 Translation gaps" view** (one view on
  the default landing tab, same filter as the missing-key view above).

Both files share two formulas — `Locale` (🇩🇪/🇬🇧/❓ from `note.lang`) and
the gap-detection guard `if(note.translationKey == "" \|\| ... == null, "🔴 MISSING ...", ...)`.
Keep the formulas identical across both files so future locale-widening (e.g.
add `fr`) is a single-line change in two places. No code, no schema change —
pure Bases CMS configuration over the existing `lang` + `translationKey`
frontmatter (ADR-002 / ADR-004 Decision 4).

## Vault CMS + Astro Composer keep parallel content-type lists
<!-- 2026-05-11 -->
The astro-modular Obsidian plugin stack stores content-type configuration in TWO `data.json` files that overlap:
- `src/content/.obsidian/plugins/vault-cms/data.json` — the canonical registry. Has `contentTypes[]` (folder, linkBasePath, enabled, fileOrganization) AND `frontmatterProperties{<id>: {template, ...}}`. Also owns `defaultContentTypeId` and `seoConfig.scanDirectories`.
- `src/content/.obsidian/plugins/astro-composer/data.json` — the *authoring* surface. Has its own `contentTypes[]` with overlapping fields (id, name, folder, linkBasePath, template, enabled) — this is the list shown in the "new note" picker.

When reconfiguring content types (rename, split, disable), BOTH files must be updated together — IDs must match across them, otherwise the new-note flow opens a folder that the registry doesn't know about (or vice versa). The bilingual i18n workaround (ADR-004 Decision 1) lives entirely in these two JSONs: split `Posts` into `Posts (DE)` (`posts/de/`, template `lang: de`) and `Posts (EN)` (`posts/en/`, template `lang: en`), same for `Pages`. After editing, reload Obsidian (Cmd-R in the vault) so the plugins re-read their config. `defaultContentTypeId` in vault-cms must reference an ID that exists in the current `contentTypes[]` array, or the wizard breaks. Editing these files is safe — the Astro build never reads `.obsidian/`.

<!-- 2026-05-09 (Phase 2b) -->
- No unit-test suite; `package.json` `"test"` is the placeholder `echo 'Error: no test specified' && exit 1`. Verification for code changes is `pnpm build` + targeted `grep` against `dist/` (76–77 pages). For i18n changes, also assert per-locale URL shapes — e.g. `grep -oE 'href="/(en/)?posts/[^"]+"' dist/<page>/index.html`. Build also re-emits `dist/sitemap-index.xml` (from @astrojs/sitemap integration) alongside the hand-written `dist/sitemap.xml`.
- TS diagnostics for `Cannot find module '@/types' | '@/config' | 'astro:content' | 'import.meta.env'` are documented Astro typegen cache misses, not real type holes. They cascade into implicit-`any` hints in dependent code (parameters lose inferred types when imports fail). They clear on the next `pnpm dev` or `pnpm build` once `.astro/` regenerates. Don't fix by adding `any` casts; the build passes and runtime types are correct.

<!-- What goes here: commands that are non-obvious, tool quirks, CI gotchas, env var names -->
<!-- What does NOT go here: domain rules (→ domain.md), code style (→ general.md) -->

<!-- 2026-05-09 -->
- pnpm 11 post-install build approval must live in `pnpm-workspace.yaml` (keys: `allowBuilds:` map of `pkg: true` AND `onlyBuiltDependencies:` array). The `pnpm.onlyBuiltDependencies` block inside `package.json` is ignored by pnpm 11. Without the workspace config, `pnpm install` and `pnpm build` abort with `ERR_PNPM_IGNORED_BUILDS`. This repo allowlists `esbuild`, `sharp`, `workerd`.
- `pnpm run update` source = the fork at `MMoMM-org/astro-modular-mmomm`, not upstream. Patched `scripts/update.mjs` calls the GitHub `/repos/{REPO}/branches/{BRANCH}` API and pulls a branch tarball/zipball — not `/releases/latest`, because forks do not auto-mirror upstream releases. Last-pulled SHA is recorded in `.astro-modular-source` (gitignored) for the staleness short-circuit. Override transiently via `ASTRO_MODULAR_REPO=davidvkimball/astro-modular pnpm run update` to pull from upstream directly; `ASTRO_MODULAR_BRANCH=<name>` switches branches.
- USER_PATHS in `scripts/update.mjs` is split into two layers. The fork's defaults preserve cross-project conventions (`CLAUDE.md`, `.gitignore`, `pnpm-workspace.yaml`, `tools/` plus astro-modular's original list). Site-specific paths live in `.astro-modular-user-paths` at the repo root (one path per line, `#` for comments) — this site preserves `claude-docker/`, `claude-docker-home/`, `begin-code.sh`, `.mcp.json`, `.claude/`, `docs/`, `src/CLAUDE.md`. The fork has accepted MMoMM-specific i18n (DE/EN baked into `src/utils/i18n.ts`, locale routes under `src/pages/en/`) — the "generically useful for any consumer" framing is aspirational but not currently held; treat the fork as MMoMM's theme branch.

## Fork-sync workflow (local theme commits → fork master)
<!-- 2026-05-09 — first documented up-direction sync. Previous fork-sync commits (ba1f55c, 29bb0ee) were the OPPOSITE direction (pulling fork→site via `pnpm run update`). -->
1. Identify the theme-level files touched in the session: anything in `src/components/`, `src/layouts/`, `src/utils/`, `src/pages/`, `src/types.ts`, etc. — i.e., everything NOT in USER_PATHS (`docs/`, `.claude/`, `claude-docker*/`, `src/CLAUDE.md`, `.mcp.json`, `begin-code.sh`, `.astro-modular-user-paths`).
2. Clone the fork to a scratch dir: `gh repo clone MMoMM-org/astro-modular-mmomm "$TMPDIR/fork-sync-$(date +%s)" -- --depth=1`. Verify the clone HEAD matches `.astro-modular-source` to confirm no drift.
3. Copy the changed files from the local repo into the scratch fork (preserve relative paths). New files in `src/pages/en/`, `src/utils/`, etc., need `mkdir -p` for parent dirs.
4. Bundle as ONE commit per logical milestone on fork master with a summary message describing each task. Match the fork's bundled-commit history pattern (e.g. `28aa366` was a single bundled commit for the symmetric refactor). Do NOT format-patch + git am — local commits don't share ancestry with the fork tree because the local repo was bootstrapped from a fork copy, not cloned.
5. Push to fork master: `git push origin master`. Note the new SHA.
6. Update local `.astro-modular-source` (gitignored) to the new fork SHA so the next `pnpm run update` short-circuits — otherwise the update would pull-and-overwrite the just-synced files.
7. Clean up the scratch dir: `rm -rf "$TMPDIR/fork-sync-..."`.

Verifying after sync: `pnpm build` locally must still produce the same page count (no regressions from the round-trip). The local files weren't touched — only `.astro-modular-source` and any context docs were updated.
