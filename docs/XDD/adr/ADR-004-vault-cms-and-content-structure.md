# ADR-004: Vault CMS Configuration Strategy + Bilingual Content Structure

Status: Accepted
Date: 2026-05-11

## Context

Phase 2b (i18n routing, switcher, RSS, sitemap) and Track A+B (switcher bug fixes, nav
polish) shipped. The next user-facing question — "clicking Projects on EN gives DE
content" — is bug (d) in `context.md`: per-locale nav. That's Track C in ADR-003, which
was explicitly deferred because the actual content didn't yet exist in EN. Hitting it
in a live preview made the deferral feel premature.

Stepping back, the real blocker isn't nav rendering — it's that we don't have an
authoring workflow that produces bilingual content. Until that exists, every layout
decision (nav, listings, switcher fallbacks) is speculation about content shape we
haven't built yet. The user proposed pivoting to "configure Vault CMS properly first,
then come back to layout/i18n with real content."

An assessment of the Obsidian-plugin stack and the Hugo source site produced the
findings below. They constrain how Vault CMS can support bilingual authoring, and
they reveal that the path from "we have a working theme" to "we have a working site"
is shorter than it appeared.

## Findings

### Plugin role split

Five Obsidian plugins ship with astro-modular. They are **complementary**, not
duplicates:

| Plugin | Role |
|--------|------|
| **Vault CMS** (v0.6.1) | Setup wizard + content-type definitions + preset manager (`davidvkimball/vault-cms-presets`). Not the authoring tool itself. |
| **Astro Composer** (v0.12.2) | Authoring flow: new-note creation, kebab-case slug generation, internal-link conversion, terminal access, config opener. |
| **Bases CMS** | Grid-view content management via `.base` files (bulk edits, filtering). |
| **Home Base** | Pins a `.base` view as the default tab. |
| **Astro Modular Settings** | Theme-config UI that drives `src/config.ts` via `[CONFIG:KEY]` markers (already known — see ADR-003 plugin-compat constraint). |

Source inspection of `vault-cms/main.js` (1.9 MB) and `astro-composer/main.js`
(659 KB) confirms **zero i18n awareness** — `translationKey`, `lang`, `locale`:
all match counts are zero in both plugins. Bilingual was never an intended
feature of this plugin stack, consistent with the underlying single-language
design of astro-modular itself (ADR-001).

### Schema state

`src/content.config.ts` already has bilingual fields on the **posts** collection:
`lang: z.enum(['de', 'en'])` (required) and `translationKey: z.string().optional()`.
Loader uses `glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' })` which
recursively picks up both `posts/de/<slug>/index.md` and `posts/en/<slug>/index.md`.

The `pages`, `projects`, and `docs` collections do **not** yet have these fields —
single-language schema only. The header comment on the posts collection still reads
"asymmetric layout" — stale documentation from before ADR-002 Decision #3's revision.

### Folder structure: `posts/de/` vs `de/posts/`

ADR-002 Decision #3 already locked in `posts/de/<slug>/`. The user re-raised the
question on 2026-05-11. Re-validated, decision holds:

| Aspect | `posts/de/<slug>/` (chosen) | `de/posts/<slug>/` (alternative) |
|--------|---|---|
| Astro `getCollection('posts')` | One collection, filter by `data.lang` | Multi-collection or mega-glob; loses per-type schema |
| Vault CMS content-types | Direct mapping: each type → `<type>/<locale>/` | Plugin model breaks — folder ≠ content-type |
| Adding a third locale | Add `posts/fr/` (Astro glob picks up) | Add `fr/posts/` (same) |
| "All German content together" | ❌ split across `<type>/de/` | ✅ single folder per locale |

The Astro + plugin alignment outweighs the mental-model preference. No change from
ADR-002.

### Hugo content shape — simpler than expected

The Hugo source (`../mmomm/content/`, `../mmomm/content.en/`) is one collection plus
five static pages, not five collections:

- `blog/` — dated post collection → already migrated as `posts/` (28 posts, 14×2)
- `videos/index.md` — single static page (curated YouTube embed list)
- `jetzt/index.md` (DE) / `now/index.md` (EN) — single static page, linked via `translationKey: "now"`
- `ueber-mich/index.md` (DE) / `about/index.md` (EN) — single static page, `translationKey: "about"`
- `impressum/index.md` — single static page (DE only has content; EN dir empty)
- `datenschutz/index.md` (DE) / `privacy-policy/index.md` (EN) — single static pages
- `categories/_index.md` — Hugo auto-feature, Astro equivalent already exists at `/posts/tag/<tag>/`

Five static pages map cleanly to the existing `pages` collection. **No new
content collections required.** One incidental: `videos/index.md` uses Hugo's
`{{< youtube ID "title" >}}` shortcode — needs an Astro-component or mdx replacement
during migration.

### Astro-modular sample content (Track #6)

5 demo posts + 4 demo pages + 3 demo projects + demo docs all live in the build.
They pollute EN listings (tagged `lang: en`), drive nav items that 404 cleanly,
and have no DE counterparts. With the optional content types disabled, projects
and docs disappear cleanly. Demo posts and pages need explicit deletion.

## Decisions

### 1. Vault CMS: configure-only, no fork

Forking Vault CMS to add native bilingual support is **rejected**. Reasoning:
the plugin is 1.9 MB minified with no obvious open-source TS repo, bilingual is
a substantial feature surface (wizard + content-types + templates + Bases views),
upstream's single-language stance is intentional, and we are a tiny user with no
leverage. **Workaround works without a fork**: define per-locale content-types
as separate entries in the plugin's `contentTypes` config (e.g., "Posts (DE)" →
`posts/de/`, "Posts (EN)" → `posts/en/`). Templates are plain strings — they can
include `lang: de` / `lang: en` literally without plugin code changes.

### 2. Theme: stay on astro-modular (forked)

No re-platform to a different Astro theme. Re-platforming would cost ~2–3 weeks
to redo the i18n work that's already shipped (routing, switcher, RSS-per-locale,
sitemap hreflang) and would force a new authoring workflow since the Vault CMS
plugin stack is astro-modular-specific. The current pain (per-locale nav, demo
cleanup, plugin i18n gap) is not theme-specific and would recur on most blog
themes. Reasonable alternatives surveyed in the discussion (Starlight, AstroPaper,
Astrofy, Cactus) either target the wrong genre (Starlight = docs) or have no
better i18n story than what we've already built. Existing astro-modular fork at
`MMoMM-org/astro-modular-mmomm` already records the upstream-sync TBD path
(ADR-001 Phase 3).

### 3. Content structure adopts Hugo's shape

Replicate Hugo's site structure in Astro using existing collections — `posts`
(done) plus the `pages` collection extended with five Hugo-equivalent bilingual
pages: videos, jetzt/now, ueber-mich/about, impressum, datenschutz/privacy-policy.
No new content collections. Folder layout follows ADR-002 Decision #3: `pages/de/`
and `pages/en/`.

### 4. Schema gets bilingual fields on `pages` (and optionally `projects`, `docs`)

The `pages` collection schema gains `lang: z.enum(['de', 'en'])` (required) and
`translationKey: z.string().optional()`. The stale "asymmetric layout" comment
on the posts collection gets corrected to reference ADR-002's symmetric revision.

`projects` and `docs` get the bilingual schema fields only **if** they survive
the demo cleanup (Decision #5 below) and become real content. If the user
disables `optionalContentTypes.{projects,docs}` and ships without them, their
schemas don't need touching.

### 5. Demo content gets deleted, optional types get disabled

The astro-modular sample content gets removed wholesale rather than translated
or archived:

```
src/content/posts/{getting-started.md,formatting-reference.md,vault-cms-guide.md,
  obsidian-embeds-demo.md,sample-folder-based-post/,attachments/}
src/content/pages/{about.md,contact.md,privacy-policy.md,thank-you.md,attachments/}
src/content/projects/*    (3 demo projects)
src/content/docs/*        (demo docs)
```

`src/content/special/` is **kept** — those are infrastructure pages (404, home,
posts, projects, docs landing pages). `siteConfig.optionalContentTypes.projects`
and `.docs` get set to `false` so the now-empty collection routes don't 404.
Nav items for Projects/Docs get removed from `siteConfig.navigation.pages`.

### 6. "Without code changes" scope is bounded

Tagesgeschäft (new posts, new pages, image insertion, frontmatter edits) is
fully no-code via the plugin stack. **Structural changes** (new collection
type, new layout component, schema additions) remain code-first — this is
inherent to Astro and identical to the Hugo predecessor (new section ≈ new
layout). The bilingual workaround in Decision #1 lives entirely in
plugin-config + template text, not code.

## Consequences

**Vault CMS deferred but unblocked.** Once the schema and content structure
land (Decisions 3–5), Vault CMS can be config-only reconfigured for bilingual
authoring without touching any plugin code. The actual plugin configuration is
a follow-up task, not part of this ADR's immediate execution.

**Track C (per-locale nav, ADR-003) gets simpler.** After demo cleanup, the
nav reduces to `Posts | About | Now | Impressum | Datenschutz | GitHub` (DE)
and `Posts | About | Now | Impressum | Privacy Policy | GitHub` (EN). All of
these have real bilingual content pairs (or will after the 5-page migration),
so the locale-aware URL prefix in ADR-003 becomes useful instead of 404-prone.

**Sample-content cleanup loses optionality.** Decision #5 deletes demos rather
than archiving. Future reference to "how did astro-modular ship by default"
would require pulling from `git log` or the upstream repo.

**Single-page Videos migration needs a shortcode replacement.** Hugo's
`{{< youtube >}}` shortcode has no Astro equivalent built in. Either an mdx
component (preferred — markdown stays portable) or inline iframe.

## Execution plan

Sequenced as three discrete commits so any can be reverted independently:

1. **Schema: `pages` bilingual.** Extend `src/content.config.ts` with `lang` +
   `translationKey` on the pages collection. Fix the stale "asymmetric layout"
   comment. Decide on projects/docs schema based on whether they survive Step 2.
2. **Demo cleanup + nav prune.** Delete demo files, set `optionalContentTypes`
   flags to `false`, prune `navigation.pages` to real items only. Verify build.
3. **Hugo non-blog migration.** Five static pages migrated to `pages/de/` and
   `pages/en/` with correct `lang`+`translationKey`, plus Astro youtube-embed
   component for the videos page.

After all three: Vault CMS bilingual config (separate ADR or section update —
not in this ADR).

## Revisions

None.
