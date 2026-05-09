# Domain — astro-mmomm
<!-- Business rules, data models, entities, domain language. Updated: 2026-05-09 -->
<!-- What goes here: what X means in this codebase, business rules that drive code decisions -->
<!-- Entries that appear frequently may be promotable → run /memory-promote -->

<!-- 2026-05-09 -->
- Content collections and i18n status (`src/content.config.ts`):
  - **`posts`** — has `lang: 'de' | 'en'` and `translationKey` fields; locale-aware throughout. After symmetric refactor `post.id` is `<lang>/<bare-slug>` (e.g. `de/miyo-ace`). Use `postSlug(post)` to strip the prefix, `postUrl(post)` to build URLs.
  - **`projects`** — NO `lang` field. Single set shared across locales. Both DE and EN homepages render the same projects section. Localization is a future schema-extension initiative.
  - **`docs`** — NO `lang` field. Same shared-content pattern as projects.
  - **`special`** — single entries (no `home-de` / `home-en` split). The home blurb at `getEntry('special', 'home')` is the same on both locales today. Future per-locale entries would need either entry-key splitting or a `lang` schema field.
- `siteConfig` is single-string for `title`, `description`, `homepageTitle`, `homeOptions.featuredPost.slug`, etc. — no per-locale variants. Both DE and EN feeds, sitemaps, and homepages emit the same site title. Per-locale config translation is its own initiative (likely needs schema extension to `{de: ..., en: ...}` or a translation lookup at consumption sites).

