# Troubleshooting — astro-mmomm
<!-- Known issues and proven fixes. Updated: 2026-05-09 -->
<!-- Format: ## [Issue title] — Status: open/resolved — [fix description] -->
<!-- Resolved entries are archived by /memory-cleanup, not deleted -->

## `pnpm run update` clobbers the build allowlist — Status: open
<!-- 2026-05-09 -->
astro-modular's `pnpm run update` (scripts/update.mjs) replaces framework files including `package.json` and `pnpm-workspace.yaml` when pulling a new theme release. After every update, re-verify the `allowBuilds:` and `onlyBuiltDependencies:` entries for `esbuild`, `sharp`, and `workerd` in `pnpm-workspace.yaml`, otherwise the next `pnpm install`/`pnpm build` aborts with `ERR_PNPM_IGNORED_BUILDS`.

## `pnpm create astro-modular` denied by Claude Code auto-mode classifier — Status: resolved
<!-- 2026-05-09 -->
The npm scaffolder (`create-astro-modular`) is blocked by Claude Code's auto-mode classifier as "untrusted external code execution". Use the upstream README's documented alternative: `git clone --depth=1 https://github.com/davidvkimball/astro-modular.git <scratch-dir>`, then mirror the CLI's CLEANUP step by deleting `cli/`, `.github/`, `.ref/`, and `AGENTS.md` from the clone before copying files into the target repo.
