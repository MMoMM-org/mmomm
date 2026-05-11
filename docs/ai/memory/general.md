# General — astro-mmomm
<!-- Conventions, naming rules, code style, git workflow. Updated: 2026-05-11 -->
<!-- What goes here: how files are named, folder structure, style choices, branch conventions -->
<!-- What does NOT go here: tool-specific quirks (→ tools.md), domain rules (→ domain.md) -->

## Content authoring: pages start body at H2, never H1
<!-- 2026-05-11 -->
`src/layouts/PageLayout.astro` (and `PostLayout.astro`) renders the frontmatter `title` field as the page's `<h1>` (`PageLayout.astro:152-154`). If the body markdown opens with `# Heading`, the rendered page has two H1s — bad for SEO and the page outline. Always start `pages/**/*.md` and `posts/**/*.md` bodies at H2 (`##`) or lower. When migrating from systems that put the title in the body (Hugo, Wordpress export, plain-text drafts), remove or downgrade the redundant body H1. The same applies to `posts` — keep the visual hierarchy consistent (PostLayout owns the page H1).
