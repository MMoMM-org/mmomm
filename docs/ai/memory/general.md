# General — astro-mmomm
<!-- Conventions, naming rules, code style, git workflow. Updated: 2026-05-11 -->
<!-- What goes here: how files are named, folder structure, style choices, branch conventions -->
<!-- What does NOT go here: tool-specific quirks (→ tools.md), domain rules (→ domain.md) -->

## Content authoring: pages start body at H2, never H1
<!-- 2026-05-11 -->
`src/layouts/PageLayout.astro` (and `PostLayout.astro`) renders the frontmatter `title` field as the page's `<h1>` (`PageLayout.astro:152-154`). If the body markdown opens with `# Heading`, the rendered page has two H1s — bad for SEO and the page outline. Always start `pages/**/*.md` and `posts/**/*.md` bodies at H2 (`##`) or lower. When migrating from systems that put the title in the body (Hugo, Wordpress export, plain-text drafts), remove or downgrade the redundant body H1. The same applies to `posts` — keep the visual hierarchy consistent (PostLayout owns the page H1).

## Path-based slug detection must skip the locale folder
<!-- 2026-05-11 -->
ADR-002 puts i18n content under `src/content/<collection>/<locale>/<slug>/` (locale = `de`|`en`). Any code that derives a slug from a file path by doing `pathParts[pathParts.indexOf(collection) + 1]` will pick up the **locale folder** as the slug for i18n content and silently mis-route URLs (`/posts/en/<file>` instead of `/en/posts/<slug>/<file>`). When adding a new remark plugin, content helper, or pipeline step that walks paths, peek at `pathParts[collectionIndex + 1]`: if it's `'de'` or `'en'`, the real slug is at `+ 2` and the URL needs a `/en` prefix for EN (empty for DE). Existing precedents: `remarkFolderImages` in `internallinks.ts`, both branches of `remark-obsidian-embeds.ts`, and the `syncFolderBasedImages` function in `scripts/sync-images.js` (which routes output to `public/<locale-prefix>/<collection>/<slug>/<file>` so URLs and files match).

## Cross-cutting components derive locale from URL, not props
<!-- 2026-05-11 -->
Header.astro and Footer.astro both derive the current locale via `Astro.url.pathname` rather than trusting a `lang` prop. The reason is that not every route reliably propagates `lang` through to BaseLayout — historically PageLayout passed nothing (fixed in Track A, but the workaround stays as a safety net), and special-route shells (404, etc.) also rendered without it, which caused the language switcher to compound `/en/en/en/...` on each click. The URL is the canonical source for the current locale on a static site, so any nav-aware component (switcher, locale-prefixed links, locale-keyed T9 lookups) should look at `Astro.url.pathname`. Props remain useful for *content* concerns (which post/page are we rendering) and for layout overrides; they are not the source of truth for "which locale am I in."
