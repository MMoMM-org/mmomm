# Tools — astro-mmomm
<!-- CI, build pipeline, API clients, local dev setup. Updated: 2026-05-09 -->
<!-- What goes here: commands that are non-obvious, tool quirks, CI gotchas, env var names -->
<!-- What does NOT go here: domain rules (→ domain.md), code style (→ general.md) -->

<!-- 2026-05-09 -->
- pnpm 11 post-install build approval must live in `pnpm-workspace.yaml` (keys: `allowBuilds:` map of `pkg: true` AND `onlyBuiltDependencies:` array). The `pnpm.onlyBuiltDependencies` block inside `package.json` is ignored by pnpm 11. Without the workspace config, `pnpm install` and `pnpm build` abort with `ERR_PNPM_IGNORED_BUILDS`. This repo allowlists `esbuild`, `sharp`, `workerd`.
