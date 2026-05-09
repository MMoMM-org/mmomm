# src/ — Code Area Rules

## TDD
- RED: Write failing test first. No implementation before a failing test.
- GREEN: Minimal code to make the test pass. Nothing more.
- REFACTOR: Clean up only after GREEN. Run tests again.

## Contracts
- Domain rules live in docs/ai/memory/domain.md — link implementations to these
- Public interfaces must match the SDD contract
- Content collection schemas live in `src/content.config.ts` — treat as the contract for `src/content/**`

## Conventions
- TypeScript strict mode is on — no `any`; use `unknown` + narrowing
- Import order: node builtins → external → internal
- Astro components prefer zero client JS; add `client:*` only when interactivity demands it
- Co-locate component-specific styles inside the `.astro` file unless reused across components
