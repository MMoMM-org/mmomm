#!/usr/bin/env node
// Migrate Hugo blog posts from mmomm/ into astro-modular's posts collection.
// One-shot tool — designed for the specific Hugo frontmatter shape used in
// MMoMM-org/mmomm. Not a general Hugo→Astro converter.
//
// Usage:
//   node tools/migrate-from-hugo.mjs [--source PATH] [--images PATH]
//                                    [--dest PATH] [--slug SLUG]
//                                    [--skip SLUG,SLUG] [--dry-run] [--verbose]

import {
  readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync,
  statSync, copyFileSync,
} from 'node:fs';
import { join, extname, basename, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ── CLI parsing ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function flag(name, fallback) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  const next = args[idx + 1];
  if (next === undefined || next.startsWith('--')) return true;
  return next;
}
// Per-locale Hugo source defaults. Adding a third locale = add a key here
// (ADR-005 Phase 1 step 8). Users can still override per-section via --source.
const LOCALE_SOURCES = {
  de: { content: '../mmomm/content/blog', images: '../mmomm/static/img/wix' },
  en: { content: '../mmomm/content.en/blog', images: '../mmomm/static/img/wix' },
};
const VALID_LOCALES = Object.keys(LOCALE_SOURCES);

const LOCALE = flag('locale', 'de');
if (!VALID_LOCALES.includes(LOCALE)) {
  console.error(`--locale must be one of [${VALID_LOCALES.join(', ')}] (got: ${LOCALE})`);
  process.exit(1);
}

const SOURCE = resolve(ROOT, flag('source', LOCALE_SOURCES[LOCALE].content));
const IMAGES = resolve(ROOT, flag('images', LOCALE_SOURCES[LOCALE].images));
const DEST = resolve(ROOT, flag('dest', 'src/content/posts'));
const ONE_SLUG = flag('slug', null);
const SKIP = String(flag('skip', 'obsidian-todoist')).split(',').filter(Boolean);
const DRY = flag('dry-run', false) === true;
const VERBOSE = flag('verbose', false) === true;

const log = (...a) => console.log(...a);
const dbg = (...a) => VERBOSE && console.log('  ·', ...a);

// ── Tiny YAML reader (Hugo frontmatter shape only) ──────────────────────────
// Handles: key: "string", key: 'string', key: unquoted-scalar (e.g. ISO date),
//          key: true|false, key: [a, b] or [], multi-line "..." strings.
function parseFrontmatter(yaml) {
  const out = {};
  const lines = yaml.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const m = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!m) continue;
    const [, key, rawValueRaw] = m;
    let rawValue = rawValueRaw;
    // Multi-line double-quoted: opens but doesn't close on this line.
    if (rawValue.startsWith('"') && !endsWithUnescapedQuote(rawValue)) {
      const parts = [rawValue];
      while (++i < lines.length) {
        parts.push(lines[i]);
        if (endsWithUnescapedQuote(lines[i])) break;
      }
      rawValue = parts.join('\n');
    }
    out[key] = parseScalar(rawValue);
  }
  return out;
}
function endsWithUnescapedQuote(s) {
  // Strip a leading opening quote, then check for an unescaped closing one.
  const tail = s.replace(/^"/, '');
  const m = tail.match(/(?:^|[^\\])"\s*$/);
  return Boolean(m);
}
function parseScalar(v) {
  v = v.trim();
  if (v === '') return '';
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null' || v === '~') return null;
  if (/^".*"$/s.test(v)) return JSON.parse(v.replace(/\n/g, '\\n'));
  if (/^'.*'$/s.test(v)) return v.slice(1, -1);
  if (v.startsWith('[') && v.endsWith(']')) {
    // Best effort: parse as JSON. Hugo writes ["a","b"] which is JSON-safe.
    try { return JSON.parse(v); } catch { /* fall through */ }
  }
  return v; // unquoted scalar (e.g. ISO date)
}

// ── Tiny YAML writer (output canonical to astro-modular style) ──────────────
function writeFrontmatter(obj) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (v === null) { lines.push(`${k}: null`); continue; }
    if (typeof v === 'boolean') { lines.push(`${k}: ${v}`); continue; }
    if (Array.isArray(v)) {
      if (v.length === 0) { lines.push(`${k}: []`); continue; }
      lines.push(`${k}:`);
      for (const item of v) lines.push(`  - ${quoteIfNeeded(item)}`);
      continue;
    }
    if (typeof v === 'string' && v.includes('\n')) {
      // Block scalar (preserves newlines)
      lines.push(`${k}: |`);
      for (const ln of v.split('\n')) lines.push(`  ${ln}`);
      continue;
    }
    lines.push(`${k}: ${quoteIfNeeded(v)}`);
  }
  lines.push('---', '');
  return lines.join('\n');
}
function quoteIfNeeded(v) {
  if (typeof v !== 'string') return String(v);
  if (v === '') return '""';
  // Always quote strings that look like reserved values, contain colons,
  // contain special chars, or start with [, {, *, &, !, |, >, %, @, `.
  if (/^(true|false|null|yes|no|~)$/i.test(v)) return JSON.stringify(v);
  if (/[:#\[\]{}|>"'%@`,]/.test(v) || /^[\s\-?*&!]/.test(v)) return JSON.stringify(v);
  return v;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function slugify(s) {
  return String(s || '')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'image';
}
function dateOnly(v) {
  // Hugo dates are full ISO; astro-modular schema accepts coerce.date — both
  // strings and ISO work, but a plain YYYY-MM-DD reads cleaner.
  if (!v) return undefined;
  const s = String(v);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : s;
}
function ensureDir(p) { if (!existsSync(p)) mkdirSync(p, { recursive: true }); }

// ── Body transformation ─────────────────────────────────────────────────────
// Find /img/wix/<file> references and rewrite to attachments/<readable>.
// Also fix nested ``` fences (CommonMark requires longer fence for nested).
const IMG_REF = /!\[([^\]]*)\]\((\/img\/wix\/[^)]+)\)/g;

function isUsableCaption(s) {
  if (!s) return false;
  const t = s.trim();
  return !!t && t.length < 80 && !/^[#`>!\-*]/.test(t);
}

function processBody(body, ctx) {
  const used = new Set(); // filenames already used in this post
  const matches = [...body.matchAll(IMG_REF)];

  // Pass 1: compute all replacements against the ORIGINAL (immutable) body.
  // The previous implementation mutated `body` inside this loop while still
  // using `m.index` captured before the loop; after the first replace shrank
  // the body, subsequent caption-detection slices were misaligned and ~66% of
  // images fell to `image-N.<ext>` fallback. See troubleshooting.md.
  const replacements = [];
  for (const m of matches) {
    const [full, alt, srcPath] = m;
    const sourceFile = basename(srcPath);
    const ext = extname(sourceFile);

    // Heuristic priority: alt-text first, then caption AFTER (the typical
    // astro-modular convention), then caption BEFORE (the dynbedded
    // convention), then a numbered fallback.
    const altTrim = alt?.trim();
    const useAlt = altTrim && altTrim.length < 80;

    const afterCap = body.slice(m.index + full.length).match(/^\n+([^\n]+)/)?.[1]?.trim();
    const useAfter = isUsableCaption(afterCap);

    const beforeCap = body.slice(0, m.index).match(/\n([^\n]+)\n+$/)?.[1]?.trim();
    const useBefore = isUsableCaption(beforeCap);

    let captionText = null;
    if (useAlt) captionText = altTrim;
    else if (useAfter) captionText = afterCap;
    else if (useBefore) captionText = beforeCap;

    let filename = captionText ? `${slugify(captionText)}${ext}` : `image-${used.size + 1}${ext}`;
    let i = 2;
    while (used.has(filename)) {
      const stem = filename.slice(0, -ext.length).replace(/-\d+$/, '');
      filename = `${stem}-${i++}${ext}`;
    }
    used.add(filename);

    // Resolve and copy source image
    const srcAbs = resolve(IMAGES, sourceFile);
    if (!existsSync(srcAbs)) {
      ctx.warnings.push(`missing image (referenced in body): ${srcPath}`);
      continue;
    }
    ctx.images.push({ from: srcAbs, to: join(ctx.attachmentsDir, filename) });

    const newAlt = alt || captionText || '';
    const newRef = `![${newAlt}](attachments/${filename})`;
    replacements.push({ matchIndex: m.index, fullLen: full.length, newRef });
  }

  // Pass 2: splice replacements in reverse so earlier match indices stay valid
  // (we never touch body before the position we're splicing at).
  for (let i = replacements.length - 1; i >= 0; i--) {
    const r = replacements[i];
    body = body.slice(0, r.matchIndex) + r.newRef + body.slice(r.matchIndex + r.fullLen);
  }

  // Fix nested triple-backtick code blocks: when a fenced block contains another
  // fence on a line, promote the outer fence to four backticks.
  body = fixNestedFences(body);

  return body;
}

function fixNestedFences(body) {
  const lines = body.split('\n');
  // Identify outer fences that contain inner ``` lines, expand both.
  const stack = []; // indices of unclosed ``` lines
  const promote = new Set(); // line indices to promote to ````
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (/^\s*```(?!`)/.test(ln)) {
      if (stack.length === 0) {
        stack.push(i);
      } else {
        // closing fence
        const opener = stack.pop();
        // If this block contained any ``` on its own line between opener+1..i-1,
        // we'd have nested already pushed/popped — but our naive stack treats them
        // as nested OPENS. Detect: if any inner line in (opener, i) starts with ```,
        // promote opener and i.
        for (let j = opener + 1; j < i; j++) {
          if (/^\s*```(?!`)/.test(lines[j])) {
            promote.add(opener);
            promote.add(i);
            promote.add(j); // also promote the inner closer/opener
            break;
          }
        }
      }
    }
  }
  // Heuristic refinement: in our Hugo posts the pattern is
  //   ```
  //   ```language
  //   ...
  //   ```
  //   ```
  // which the naive parser sees as: open, open, close, close. So opener=0, then
  // hit `` `language `` (open #2), then `` ` `` (close #2 → pops #2), then `` ` ``
  // (close #1 → pops #1). On closing #1, we check if the block (0..3) contains
  // a `` ` `` line — yes it does, line 1 and 2. So we promote 0, 3, and the inner
  // ones. That gives us:
  //   ````
  //   ```language
  //   ...
  //   ```
  //   ````
  // which is correct CommonMark for "literal triple-backtick block containing
  // an inner fence." Lines 1 and 2 (the inner fences) stay as ``` — but our
  // promote set added line `j` which is wrong. Walk it back: only promote
  // outer (opener, i), not j.
  // Re-do without inner promotion:
  promote.clear();
  stack.length = 0;
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (/^\s*```(?!`)/.test(ln)) {
      if (stack.length === 0) stack.push(i);
      else {
        const opener = stack.pop();
        for (let j = opener + 1; j < i; j++) {
          if (/^\s*```(?!`)/.test(lines[j])) {
            promote.add(opener);
            promote.add(i);
            break;
          }
        }
      }
    }
  }
  for (const idx of promote) {
    lines[idx] = lines[idx].replace(/^(\s*)```/, '$1````');
  }
  return lines.join('\n');
}

// ── Per-post pipeline ───────────────────────────────────────────────────────
function migratePost(slug) {
  const srcFile = join(SOURCE, slug, 'index.md');
  if (!existsSync(srcFile)) {
    log(`✗ ${slug}: source not found at ${srcFile}`);
    return false;
  }
  const raw = readFileSync(srcFile, 'utf-8');
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) {
    log(`✗ ${slug}: no frontmatter`);
    return false;
  }
  const [, yamlText, bodyRaw] = fmMatch;
  const fm = parseFrontmatter(yamlText);

  const ctx = {
    slug,
    attachmentsDir: join(DEST, slug, 'attachments'),
    images: [],
    warnings: [],
  };

  // ── Frontmatter mapping ───────────────────────────────────────────────────
  const newFm = {};
  if (fm.title) newFm.title = fm.title;
  if (fm.description) newFm.description = fm.description;
  if (fm.date) newFm.date = dateOnly(fm.date);

  // categories[] + tags[] → merged unique tags
  const tags = new Set();
  for (const t of (fm.tags || [])) if (t) tags.add(t);
  for (const c of (fm.categories || [])) if (c) tags.add(c);
  if (tags.size) newFm.tags = [...tags];

  // images[0] → cover image
  if (Array.isArray(fm.images) && fm.images[0]) {
    const heroPath = fm.images[0];
    const heroFile = basename(heroPath);
    const ext = extname(heroFile);
    const dest = join(ctx.attachmentsDir, `cover${ext}`);
    const srcAbs = resolve(IMAGES, heroFile);
    if (existsSync(srcAbs)) {
      ctx.images.push({ from: srcAbs, to: dest });
      newFm.image = `[[cover${ext}]]`;
    } else {
      ctx.warnings.push(`missing hero image: ${heroPath}`);
    }
  }

  if (fm.draft === true) newFm.draft = true;
  // i18n: lang is required by the schema (see ADR-002); translationKey links
  // DE↔EN counterparts and is now surfaced by the schema extension.
  newFm.lang = LOCALE;
  if (fm.translationKey) newFm.translationKey = fm.translationKey;

  // ── Body ──────────────────────────────────────────────────────────────────
  const body = processBody(bodyRaw, ctx);
  const out = writeFrontmatter(newFm) + body.replace(/^\n+/, '');

  // ── Write ─────────────────────────────────────────────────────────────────
  if (DRY) {
    log(`◆ ${slug}: would write ${ctx.images.length} image(s) + index.md`);
    if (VERBOSE) {
      log('--- frontmatter ---');
      log(writeFrontmatter(newFm));
    }
    for (const w of ctx.warnings) log(`  ⚠ ${w}`);
    return true;
  }

  ensureDir(ctx.attachmentsDir);
  for (const img of ctx.images) {
    copyFileSync(img.from, img.to);
    dbg(`copied ${relative(ROOT, img.from)} → ${relative(ROOT, img.to)}`);
  }
  writeFileSync(join(DEST, slug, 'index.md'), out);
  log(`✓ ${slug}: ${ctx.images.length} image(s), ${[...tags].length} tag(s)${ctx.warnings.length ? `, ${ctx.warnings.length} warning(s)` : ''}`);
  for (const w of ctx.warnings) log(`  ⚠ ${w}`);
  return true;
}

// ── Main ────────────────────────────────────────────────────────────────────
function main() {
  if (!existsSync(SOURCE)) { log(`source dir not found: ${SOURCE}`); process.exit(1); }
  if (!existsSync(IMAGES)) { log(`images dir not found: ${IMAGES}`); process.exit(1); }

  log(`source : ${SOURCE}`);
  log(`images : ${IMAGES}`);
  log(`dest   : ${DEST}`);
  log(`mode   : ${DRY ? 'DRY-RUN' : 'WRITE'}\n`);

  const slugs = ONE_SLUG ? [ONE_SLUG] : readdirSync(SOURCE)
    .filter(name => statSync(join(SOURCE, name)).isDirectory())
    .filter(name => existsSync(join(SOURCE, name, 'index.md')));

  let ok = 0, skipped = 0;
  for (const slug of slugs) {
    if (SKIP.includes(slug)) { log(`- ${slug}: skipped`); skipped++; continue; }
    if (migratePost(slug)) ok++;
  }
  log(`\nDone. ${ok} migrated, ${skipped} skipped.`);
}
main();
