# Decisions — astro-mmomm
<!-- Architecture choices and rationale. Updated: 2026-05-09 -->
<!-- What goes here: why we chose X over Y, ADR links, significant tradeoff choices -->
<!-- Format: YYYY-MM-DD — Decision: [what] — Rationale: [why] -->

2026-05-09 — Decision: Fork astro-modular to MMoMM-org/astro-modular-mmomm for i18n customizations — Rationale: upstream update mechanism wipes all theme files outside USER_PATHS on every upgrade; a fork keeps i18n patches in version control and survives upgrades. See [ADR-001](../../XDD/adr/ADR-001-fork-astro-modular-for-i18n.md).
2026-05-09 — Decision: Bilingual i18n architecture — symmetric folders (DE at posts/de/<slug>/, EN at posts/en/<slug>/), Astro core i18n with prefixDefaultLocale:false, single collection with explicit `lang` frontmatter, ship DE+EN together, 301 redirects from /blog/ to /posts/ — Rationale: idiomatic Astro i18n, future-locale-friendly, Obsidian vault tidier; URL strategy unchanged (DE at root, EN at /en/). See [ADR-002](../../XDD/adr/ADR-002-i18n-architecture.md). [Revised same day from asymmetric — see ADR Revisions.]
