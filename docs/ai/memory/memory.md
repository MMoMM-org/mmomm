# Memory Index — astro-mmomm

> Routing rules are in CLAUDE.md (root). This file is the index only.
> Budget: ≤ 200 lines. Archive entries when stale. Run /memory-sync to check.

## Files
- [general.md](general.md) — conventions, style, naming [updated: 2026-05-12 (entry.id URL gotcha + wikilink path form)]
- [tools.md](tools.md) — CI, build, local dev [updated: 2026-05-11]
- [domain.md](domain.md) — business rules, data models [updated: 2026-05-09]
- [decisions.md](decisions.md) — architecture choices [updated: 2026-05-12 (Phase C)]
- [context.md](context.md) — current focus [updated: 2026-05-12 (Phase C)]
- [troubleshooting.md](troubleshooting.md) — known issues [updated: 2026-05-20 (Swup header-state-stale class + canonical-URL bug + T11 audit wave + sync-images + file-based locale image fix)]

## Archive
<!-- Archived entries live in archive/YYYY-MM/. Not loaded at session start. -->
<!-- memory-cleanup manages archive creation. Do not list archive files here. -->

## Critical Documentation
<!-- Add important docs here when created — Claude loads these on demand -->
<!-- - [Architecture Overview](../architecture/overview.md) -->
- [ADR-001: Fork astro-modular for i18n](../XDD/adr/ADR-001-fork-astro-modular-for-i18n.md) — why MMoMM-org/astro-modular-mmomm exists and what deferred work remains
- [ADR-002: Bilingual i18n architecture](../XDD/adr/ADR-002-i18n-architecture.md) — URL strategy, folder layout, Astro i18n config, schema extension, phasing (Phase 1–3)
- [ADR-003: Per-locale navigation translation](../XDD/adr/ADR-003-per-locale-navigation-translation.md) — keep `navigation.pages` flat for plugin compat; translate labels via T9 strings table; locales share nav structure
- [ADR-004: Vault CMS configuration + bilingual content structure](../XDD/adr/ADR-004-vault-cms-and-content-structure.md) — adopt Hugo content shape (5 static pages + posts), delete demos, configure-only Vault CMS bilingual workaround (no second fork), schema gains `lang`+`translationKey` on pages
- [ADR-005: Multi-locale architecture (N-locale-ready, DE/EN MVP)](../XDD/adr/ADR-005-multi-locale-architecture.md) — Accepted 2026-05-12; all 4 phases shipped. Schema foundation, route deduplication (`src/pages/[locale]/...`), locale-aware plugin fork, runbook. Revises ADR-002 Decision 4 and ADR-003 Decision 3
- [Runbook: Adding a Locale](../runbooks/add-a-locale.md) — N-locale add procedure: widen `Locale` union → `siteConfig.locales[]` → `LocalisedString` + T9 strings → Vault CMS content-types → optional `urlByLocale` overrides → build → verify hreflang/sitemap. ADR-005 Phase 4 deliverable
- [MULTILANG.md](../../MULTILANG.md) — day-to-day bilingual workflow guide at the repo root: authoring translated posts/pages, editing nav with `i18nKey`/`urlByLocale`, T9 strings, triage views, and when to edit each fork (theme `astro-modular-mmomm` vs plugin `astro-modular-settings-mmomm`)
- [BACKLOG.md](../../BACKLOG.md) — open punch list at the repo root: pre-deployment blockers (GH Actions, cutover), small backlog items (multi-node `%%`, tag-cloud fallback, EN 404), technical debt (`astro check`, fork drift), and user-owned tasks
