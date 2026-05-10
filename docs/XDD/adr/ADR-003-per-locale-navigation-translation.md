# ADR-003: Per-Locale Navigation Translation — Schema-Compatible Approach

Status: Accepted
Date: 2026-05-10

## Context

After Phase 2b shipped (T1–T11 + T3c), the language switcher and per-locale routing
were functional but the header navigation (`Posts / Projects / Docs / About / GitHub`)
remained hardcoded English in `src/config.ts` for both locales. A live browser test
of the migrated site (2026-05-10) surfaced six issues at once:

a) Visual gap missing between site title and first nav item
b) Language switcher: DE→EN works, EN→DE silently fails
c) Site title (Home link) always points to `/` (DE root) regardless of current locale
d) Nav labels are English-only — needs DE translation; some items (`Projects`, `Docs`)
   point to demo content from astro-modular and don't reflect real site structure
e) `GitHub` nav item is rendered as text — should be the FA brand icon (OctoCat)
f) Language switcher always jumps to the locale's homepage instead of the translated
   equivalent of the current page (e.g. `/posts/` should switch to `/en/posts/`)

Items (b), (c), and (f) are bugs in the existing `Header.astro` switcher and homepage
logic. Item (a) is a CSS gap. Item (e) is a small render swap. Item (d) is the only
one that demands a schema decision: how should the navigation be translated per locale?

The site has an active dependency on the **Astro Modular Settings** Obsidian plugin
(`src/content/.obsidian/plugins/astro-modular-settings/`), which reads and writes
`siteConfig` through `[CONFIG:KEY]` markers. Inspection of `main.js` shows the plugin
treats `navigation.pages` as a flat array (`pages.forEach`, `pages.push`,
`pages[index].title = ...`, `pages[parentIndex].children[childIndex]`). Any schema
change that converts `pages` from `NavigationItem[]` to a per-locale shape
(e.g. `Record<Locale, NavigationItem[]>`) breaks the plugin's UI.

The plugin is shipped as part of the Obsidian vault (not gitignored), so it could
in theory be patched in place, but doing so introduces a continuous merge burden
against upstream plugin updates and adds a second forked artifact to maintain
beyond the existing astro-modular fork (ADR-001).

## Decision

Adopt a **plugin-compatible, label-only translation** approach for navigation:

1. **Schema unchanged.** `siteConfig.navigation.pages` remains `NavigationItem[]` —
   a single canonical structure shared across locales. The Obsidian plugin
   continues to work without modification.

2. **Labels translated via the existing T9 i18n table.** Add navigation labels
   to `src/i18n/strings.ts` (the typed `Record<Locale, StringMap>` foundation
   shipped in T9). Each `NavigationItem` references a translation key; the
   Header rendering looks up the key via `t(key, lang)`.

3. **URLs are locale-aware at render time, not in config.** The canonical config
   stores a single URL per item (e.g. `/posts/`). At render time, when `lang === 'en'`,
   the Header prefixes URLs with `/en` (and inversely strips `/en` for DE).
   Same logic that's needed to fix bug (f) — the language switcher's "translated
   equivalent of current page" — is reused for nav rendering.

4. **DE and EN share the same nav structure.** Same items, same order, same logical
   targets — only the labels and URL prefixes differ. This matches the Hugo site's
   actual structure (DE: Blog/Videos/Jetzt/Über mich; EN: Blog/Videos/Now/About —
   same five logical positions, different labels).

## Consequences

**Plugin compatibility preserved.** Astro Modular Settings continues to drive
`navigation.pages` from Obsidian without breakage. No fork or vendor patch needed.

**Constraint accepted: locales must share nav structure.** If a future requirement
demands genuinely different navigation per locale (different items, different
ordering), this decision must be revisited. The likely revision path is a second
schema upgrade to `Record<Locale, NavigationItem[]>` plus a coordinated plugin
patch in the Obsidian vault — recorded as a follow-up ADR if/when that need
materializes. For the current Hugo-equivalent feature set, structural symmetry
is sufficient.

**T9 foundation extended.** The i18n strings table grows beyond the demo entry
(LinkedMentions title) into real production use for nav labels. Validates the
`Record<Locale, StringMap>` parity-enforcement approach.

**Renaming and pruning are separate concerns.** This ADR covers *how* nav labels
are translated. *Which* nav items exist (e.g. dropping astro-modular demos
`Projects`/`Docs`, adding Hugo equivalents `Videos`/`Jetzt`/`Über mich`/`Impressum`)
depends on which content has been migrated and is tracked separately under the
"Hugo non-blog migration" and "astro-modular sample content cleanup" pending
tracks in `context.md`.

## Implementation outline

The work splits into three tracks executed in two sessions:

**Session 1 (this one — Tracks A + B)**

- **Track A** — Fix the language-switching bugs (b, c, f) in `Header.astro`. The
  switcher must derive the current locale from the URL, render the home link
  locale-aware, and compute the translated equivalent of the current path
  rather than always linking to the locale homepage.
- **Track B** — Visual polish: CSS gap between site title and nav (a), and
  swap GitHub nav text for the `<Icon name="github">` OctoCat (e).

These tracks are plugin-neutral. They touch `Header.astro` and CSS only.

**Session 2 (later — Track C)**

- **Track C** — Per-locale nav labels via the T9 strings table, applying the
  decision in this ADR. Likely sequenced with Hugo non-blog migration so that
  real items (Videos, Jetzt, Über mich) replace astro-modular demos at the
  same time, avoiding a transitional state with translated demo labels.

## Revisions

None.
