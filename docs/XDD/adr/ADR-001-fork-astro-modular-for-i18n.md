# ADR-001: Fork astro-modular to host i18n customizations

Status: Accepted
Date: 2026-05-09

## Context

The site was migrated to Astro using the astro-modular theme by David V. Kimball
(https://github.com/davidvkimball/astro-modular). The theme provides Vault CMS / Obsidian
integration, custom themes, search, and graph view, and is updated via `pnpm run update`
(see `scripts/update.mjs`).

The site must replace an existing bilingual Hugo site at MMoMM-org/mmomm: German as the
primary language and English translations, covering approximately 22 posts × 2 languages
linked via Hugo's `translationKey`. Astro core i18n with custom theme work was selected as
the bilingual strategy.

astro-modular is a single-language theme. Its `src/config.ts` exposes `language: string`
(one locale). The upgrade mechanism in `scripts/update.mjs` works as follows:

1. It backs up a fixed allowlist of user-owned paths (`USER_PATHS`): `src/content/`,
   profile/favicon/og images in `public/`, and `.env*` files.
2. It replaces all other framework files with the latest release tarball fetched from
   `https://github.com/davidvkimball/astro-modular/releases/latest`.
3. It restores the backed-up paths.

Any i18n patch to `src/pages/`, `src/components/`, `src/config.ts`, `astro.config.mjs`,
or layouts is wiped on every `pnpm run update`. The upstream repo has approximately 30
releases. Without isolation, i18n customizations would need to be manually re-applied
after every upstream upgrade.

The decision was required before beginning i18n implementation, while the branch
`feat/astro-modular` was still in early setup (commit `c537505`).

## Decision

Fork `davidvkimball/astro-modular` to `MMoMM-org/astro-modular-mmomm`
(https://github.com/MMoMM-org/astro-modular-mmomm, default branch `master`). All i18n
customizations to the theme — route structure, layout changes, `astro.config.mjs` i18n
settings, component translations, config schema extensions — will be developed and
maintained in this fork. The fork's `master` branch becomes the upstream source for this
project instead of the original repo.

`scripts/update.mjs` line 22 (`const REPO = 'davidvkimball/astro-modular'`) will be
patched to point at `MMoMM-org/astro-modular-mmomm` once i18n customizations exist in the
fork. Until then, `pnpm run update` continues to reference the original repo.

## Consequences

**Positive:**

- i18n customizations survive upstream upgrades because they live in a branch we control.
- We control the timing of upstream pulls — we can skip a release or delay merge until
  conflicts are resolved.
- One source of truth for the customized theme; no per-update re-application of patches.

**Negative / costs:**

- GitHub forks do not auto-mirror upstream releases. The fork currently has 0 releases.
  `pnpm run update` calls `releases/latest`, which will 404 against the fork until we
  either add a release-mirroring GitHub Actions workflow (re-publishing upstream tags to
  the fork) or rewrite `update.mjs` to use branch tarballs instead.
- Ongoing merge maintenance: each upstream release requires a manual
  `git fetch upstream && git merge upstream/master` with conflict resolution where our
  i18n changes diverge from upstream.
- The fork patch to `scripts/update.mjs` (REPO constant) must not be lost during
  upstream merges.

## Alternatives Considered

**In-repo patches with manual re-application after each `pnpm run update`**

Rejected. Every upgrade would require the developer to diff the incoming changes against
the local i18n patches, re-apply conflicting hunks by hand, and re-test. The upgrade
mechanism replaces files wholesale, so there is no automated merge step. This approach
becomes increasingly error-prone as i18n surface area grows. The user explicitly rejected
this approach.

**Disable `pnpm run update` entirely and manage theme as vendored source**

Not considered explicitly. Would avoid the 404 problem but forfeit upstream bug fixes and
feature improvements entirely. A fork preserves the upgrade path while giving us control.

**Contribute i18n support upstream to astro-modular**

Not viable on the project's timeline. Upstream i18n would require a significant design
change to `src/config.ts` and the routing layer. This could be revisited if the upstream
maintainer is receptive, but cannot block the site launch.

## Deferred Work

The following items are deferred until i18n customizations exist in the fork:

1. **Release-mirror workflow** — GitHub Actions on `MMoMM-org/astro-modular-mmomm` that
   watches `davidvkimball/astro-modular` for new releases and re-publishes them to the
   fork, allowing `pnpm run update` to function against the fork's `releases/latest`.

2. **`scripts/update.mjs` REPO patch** — Change line 22 from
   `const REPO = 'davidvkimball/astro-modular'` to
   `const REPO = 'MMoMM-org/astro-modular-mmomm'` and commit the change to both the fork
   and this project's working tree.

3. **Upstream merge cadence** — Establish a documented schedule (or trigger) for pulling
   upstream releases into the fork and resolving conflicts.
