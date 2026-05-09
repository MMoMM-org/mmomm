# astro-mmomm

## Core Philosophy
Static site for MMoMM.org built with Astro. Content-first, type-safe, no client JS unless required.
Lighthouse-perfect, RSS + sitemap supported.

## Memory & Context
@docs/ai/memory/memory.md

## Routing Rules
<!-- Run /memory-add to capture learnings. Routing reference: docs/ai/memory/routing-reference.md -->
- Personal/workflow corrections → global (~/.claude/includes/)
- Repo conventions/style → docs/ai/memory/general.md
- Tool/CI/build knowledge → docs/ai/memory/tools.md
- Domain/business rules → docs/ai/memory/domain.md
- Architectural decisions → docs/ai/memory/decisions.md
- Current focus/blockers → docs/ai/memory/context.md
- Bugs/fixes → docs/ai/memory/troubleshooting.md

## Build & Dev Commands
| Command           | Action                                     |
| :---------------- | :----------------------------------------- |
| `npm install`     | Install dependencies                       |
| `npm run dev`     | Start local dev server at localhost:4321   |
| `npm run build`   | Build production site to ./dist/           |
| `npm run preview` | Preview production build locally           |
| `npm run astro`   | Run Astro CLI (e.g. `astro check`, `astro add`) |

## Known Quirks
<!-- Non-obvious gotchas specific to this repo. Things that would trip up a new contributor. -->
- Content collections live in `src/content/` and are typed via `src/content.config.ts` — schema changes require `astro check`.
- Docker-based Claude Code environment is in `claude-docker/` and `claude-docker-home/` — not part of the site build.

## Stack-Specific Rules

### TypeScript Rules
- Strict mode: `"strict": true` in tsconfig — no exceptions
- No `any` — use `unknown` + narrowing or define a proper type
- Import order: node builtins → external → internal (enforced by ESLint/biome)
- Prefer explicit return types on public functions

### Astro Rules
- Pages live in `src/pages/`; each `.astro`/`.md`/`.mdx` file becomes a route
- Reusable UI in `src/components/` — keep client-side hydration directives minimal (`client:*`)
- Frontmatter schema for content collections is the source of truth — update `content.config.ts` before adding new fields
- Static assets imported via ESM go through `src/assets/`; truly static drop-ins in `public/`
