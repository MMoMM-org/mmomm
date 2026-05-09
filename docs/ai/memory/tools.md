# Tools — astro-mmomm
<!-- CI, build pipeline, API clients, local dev setup. Updated: 2026-05-09 -->
<!-- What goes here: commands that are non-obvious, tool quirks, CI gotchas, env var names -->
<!-- What does NOT go here: domain rules (→ domain.md), code style (→ general.md) -->

<!-- 2026-05-09 -->
- pnpm 11 post-install build approval must live in `pnpm-workspace.yaml` (keys: `allowBuilds:` map of `pkg: true` AND `onlyBuiltDependencies:` array). The `pnpm.onlyBuiltDependencies` block inside `package.json` is ignored by pnpm 11. Without the workspace config, `pnpm install` and `pnpm build` abort with `ERR_PNPM_IGNORED_BUILDS`. This repo allowlists `esbuild`, `sharp`, `workerd`.
- `pnpm run update` source = the fork at `MMoMM-org/astro-modular-mmomm`, not upstream. Patched `scripts/update.mjs` calls the GitHub `/repos/{REPO}/branches/{BRANCH}` API and pulls a branch tarball/zipball — not `/releases/latest`, because forks do not auto-mirror upstream releases. Last-pulled SHA is recorded in `.astro-modular-source` (gitignored) for the staleness short-circuit. Override transiently via `ASTRO_MODULAR_REPO=davidvkimball/astro-modular pnpm run update` to pull from upstream directly; `ASTRO_MODULAR_BRANCH=<name>` switches branches.
- USER_PATHS in `scripts/update.mjs` is split into two layers. The fork's defaults preserve cross-project conventions (`CLAUDE.md`, `.gitignore`, `pnpm-workspace.yaml`, `tools/` plus astro-modular's original list). Site-specific paths live in `.astro-modular-user-paths` at the repo root (one path per line, `#` for comments) — this site preserves `claude-docker/`, `claude-docker-home/`, `begin-code.sh`, `.mcp.json`, `.claude/`, `docs/`, `src/CLAUDE.md`. Keeping site-specifics out of the fork lets the fork stay generically useful for any consumer.
