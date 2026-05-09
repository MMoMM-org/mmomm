# Decisions — astro-mmomm
<!-- Architecture choices and rationale. Updated: 2026-05-09 -->
<!-- What goes here: why we chose X over Y, ADR links, significant tradeoff choices -->
<!-- Format: YYYY-MM-DD — Decision: [what] — Rationale: [why] -->

2026-05-09 — Decision: Fork astro-modular to MMoMM-org/astro-modular-mmomm for i18n customizations — Rationale: upstream update mechanism wipes all theme files outside USER_PATHS on every upgrade; a fork keeps i18n patches in version control and survives upgrades. See [ADR-001](../../XDD/adr/ADR-001-fork-astro-modular-for-i18n.md).
2026-05-09 — Decision: Bilingual i18n architecture — asymmetric folders (DE at posts/<slug>/, EN at posts/en/<slug>/), Astro core i18n with prefixDefaultLocale:false, single collection with path-derived locale, ship DE+EN together, 301 redirects from /blog/ to /posts/ — Rationale: avoids moving 14 migrated DE posts, matches Hugo URL convention, prevents public EN regression at launch. See [ADR-002](../../XDD/adr/ADR-002-i18n-architecture.md).
