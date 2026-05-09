# Decisions — astro-mmomm
<!-- Architecture choices and rationale. Updated: 2026-05-09 -->
<!-- What goes here: why we chose X over Y, ADR links, significant tradeoff choices -->
<!-- Format: YYYY-MM-DD — Decision: [what] — Rationale: [why] -->

2026-05-09 — Decision: Fork astro-modular to MMoMM-org/astro-modular-mmomm for i18n customizations — Rationale: upstream update mechanism wipes all theme files outside USER_PATHS on every upgrade; a fork keeps i18n patches in version control and survives upgrades. See [ADR-001](../../XDD/adr/ADR-001-fork-astro-modular-for-i18n.md).
