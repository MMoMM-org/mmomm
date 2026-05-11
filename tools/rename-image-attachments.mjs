#!/usr/bin/env node
// Rename image-N.<ext> placeholder attachments to caption-derived slugs.
//
// Context: tools/migrate-from-hugo.mjs has a bug in processBody — its match-loop
// mutates `body` while using m.index from the pre-mutation matchAll. After the
// first replace shortens the body (URL `/img/wix/long-hash.png` → `attachments/
// foo.png`), all subsequent match positions are stale and caption detection
// reads from the wrong slice. Result: ~66% of attachments fall to image-N.<ext>.
//
// This tool does NOT re-run the migration. It walks src/content/posts/{de,en}/
// <slug>/index.md, finds `![alt](attachments/image-N.<ext>)` refs, derives a
// caption from the CURRENT (stable) body, falls back to the Hugo source if
// needed, and renames the file + updates the markdown ref. Idempotent — running
// twice does nothing the second time. Dry-run by default; pass --apply to write.
//
// Usage:
//   node tools/rename-image-attachments.mjs               # dry-run
//   node tools/rename-image-attachments.mjs --apply       # write changes
//   node tools/rename-image-attachments.mjs --no-hugo     # skip Hugo fallback

import { readFileSync, writeFileSync, renameSync, existsSync, readdirSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const POSTS_BASE = join(REPO_ROOT, 'src/content/posts');
const HUGO_DE = join(REPO_ROOT, '../mmomm/content/blog');
const HUGO_EN = join(REPO_ROOT, '../mmomm/content.en/blog');

const APPLY = process.argv.includes('--apply');
const SKIP_HUGO = process.argv.includes('--no-hugo');

const PLACEHOLDER_REF = /!\[([^\]]*)\]\(attachments\/(image-\d+)(\.[a-z0-9]+)\)/g;
const ANY_IMG_REF = /!\[([^\]]*)\]\(([^)]+)\)/g;

function slugify(s) {
  return String(s ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'image';
}

function isUsableCaption(caption) {
  if (!caption) return false;
  const trimmed = caption.trim();
  if (!trimmed) return false;
  if (trimmed.length >= 80) return false;
  if (/^[#`>!\-*]/.test(trimmed)) return false;
  if (/^\[.*\]\(.*\)/.test(trimmed)) return false; // looks like a link line
  if (/^https?:\/\//.test(trimmed)) return false;
  return true;
}

// Caption-detection: look AFTER the image first (common pattern), then BEFORE
// (the preceding paragraph, used by dynbedded-style posts that caption before).
// Returns { caption, position: 'after' | 'before' } or null.
function detectCaption(body, beforeIndex, afterIndex) {
  const after = body.slice(afterIndex);
  const afterMatch = after.match(/^\n+([^\n]+)/);
  const afterCap = afterMatch?.[1]?.trim();
  if (isUsableCaption(afterCap)) return { caption: afterCap, position: 'after' };

  const before = body.slice(0, beforeIndex);
  const beforeMatch = before.match(/\n([^\n]+)\n+$/);
  const beforeCap = beforeMatch?.[1]?.trim();
  if (isUsableCaption(beforeCap)) return { caption: beforeCap, position: 'before' };

  return null;
}

// In the Hugo source, find the Nth image ref (1-based) and return its caption.
// Uses the same AFTER-then-BEFORE detection as the migrated body.
function captionFromHugo(slug, lang, nth) {
  if (SKIP_HUGO) return null;
  const hugoBase = lang === 'de' ? HUGO_DE : HUGO_EN;
  const file = join(hugoBase, slug, 'index.md');
  if (!existsSync(file)) return null;
  const body = readFileSync(file, 'utf8');
  const matches = [...body.matchAll(ANY_IMG_REF)];
  const imageMatches = matches.filter(m => /^\/(img|static)\//.test(m[2]));
  if (nth < 1 || nth > imageMatches.length) return null;
  const m = imageMatches[nth - 1];
  const detected = detectCaption(body, m.index, m.index + m[0].length);
  return detected?.caption ?? null;
}

function collectExistingNames(attachmentsDir) {
  if (!existsSync(attachmentsDir)) return new Set();
  return new Set(readdirSync(attachmentsDir));
}

function uniqueName(desired, taken) {
  if (!taken.has(desired)) return desired;
  const ext = extname(desired);
  const stem = desired.slice(0, -ext.length).replace(/-\d+$/, '');
  let i = 2;
  while (taken.has(`${stem}-${i}${ext}`)) i++;
  return `${stem}-${i}${ext}`;
}

function processPost(postDir, lang, slug) {
  const indexFile = join(postDir, 'index.md');
  const attachmentsDir = join(postDir, 'attachments');
  let body = readFileSync(indexFile, 'utf8');
  const taken = collectExistingNames(attachmentsDir);

  // Index of THIS placeholder in the post's full image stream (1-based).
  // Used for Hugo fallback (the Nth migrated image-N is the Nth Hugo image).
  const allMatches = [...body.matchAll(ANY_IMG_REF)];
  const allImageStream = allMatches
    .filter(m => /^attachments\//.test(m[2]))
    .map(m => ({ index: m.index, file: m[2].replace(/^attachments\//, '') }));

  // Build rename plan against the CURRENT body (no in-loop mutation).
  const matches = [...body.matchAll(PLACEHOLDER_REF)];
  const plan = [];
  for (const m of matches) {
    const [full, alt, stem, ext] = m;
    const oldFile = `${stem}${ext}`;
    const nthInStream = allImageStream.findIndex(s => s.file === oldFile && s.index === m.index) + 1;

    const detected = detectCaption(body, m.index, m.index + full.length);
    let caption = detected?.caption ?? null;
    let source = detected ? `current-${detected.position}` : null;
    if (!isUsableCaption(caption)) {
      const fallback = captionFromHugo(slug, lang, nthInStream);
      if (isUsableCaption(fallback)) {
        caption = fallback;
        source = 'hugo';
      } else {
        plan.push({ oldFile, status: 'skip', reason: 'no usable caption' });
        continue;
      }
    }
    let newFile = `${slugify(caption)}${ext}`;
    // Don't touch existing real names (paranoia)
    if (newFile.startsWith('image-')) {
      plan.push({ oldFile, status: 'skip', reason: 'slug starts with image-' });
      continue;
    }
    // Dedup against already-taken names in this post (including new ones we just planned)
    const projectedTaken = new Set(taken);
    plan.forEach(p => p.status === 'rename' && projectedTaken.add(p.newFile));
    projectedTaken.delete(oldFile); // we're freeing the old name
    newFile = uniqueName(newFile, projectedTaken);

    plan.push({ oldFile, newFile, full, alt, ext, matchIndex: m.index, source, caption, status: 'rename' });
  }

  return { indexFile, attachmentsDir, body, plan };
}

function applyPlan({ indexFile, attachmentsDir, body, plan }) {
  // Apply file renames first, then mutate body in reverse-match-order to keep
  // earlier match indices valid as we splice replacements in.
  const renames = plan.filter(p => p.status === 'rename');
  for (const p of renames) {
    const from = join(attachmentsDir, p.oldFile);
    const to = join(attachmentsDir, p.newFile);
    if (existsSync(from)) renameSync(from, to);
  }
  const indexedRenames = renames
    .map(p => ({ ...p })) // shallow clone
    .sort((a, b) => b.matchIndex - a.matchIndex);
  for (const p of indexedRenames) {
    const newAlt = p.alt && p.alt.trim() ? p.alt : p.caption;
    const newRef = `![${newAlt}](attachments/${p.newFile})`;
    body = body.slice(0, p.matchIndex) + newRef + body.slice(p.matchIndex + p.full.length);
  }
  writeFileSync(indexFile, body);
}

function main() {
  const results = { renamed: 0, skipped: 0, postsTouched: 0, byPost: [] };
  for (const lang of ['de', 'en']) {
    const langDir = join(POSTS_BASE, lang);
    if (!existsSync(langDir)) continue;
    for (const slug of readdirSync(langDir)) {
      const postDir = join(langDir, slug);
      const indexFile = join(postDir, 'index.md');
      if (!existsSync(indexFile)) continue;
      const result = processPost(postDir, lang, slug);
      const renames = result.plan.filter(p => p.status === 'rename');
      const skips = result.plan.filter(p => p.status === 'skip');
      if (renames.length || skips.length) {
        results.byPost.push({ lang, slug, renames, skips });
      }
      if (renames.length) {
        results.postsTouched++;
        results.renamed += renames.length;
        if (APPLY) applyPlan(result);
      }
      results.skipped += skips.length;
    }
  }
  return results;
}

const r = main();
console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}  Hugo fallback: ${SKIP_HUGO ? 'off' : 'on'}`);
console.log(`Renames: ${r.renamed}  Skipped: ${r.skipped}  Posts touched: ${r.postsTouched}`);
for (const p of r.byPost) {
  console.log(`\n${p.lang}/${p.slug}  (${p.renames.length} rename, ${p.skips.length} skip)`);
  for (const op of p.renames) console.log(`  ${op.oldFile.padEnd(18)} → ${op.newFile}   [${op.source}: "${op.caption}"]`);
  for (const op of p.skips)   console.log(`  ${op.oldFile.padEnd(18)} -- skip       [${op.reason}]`);
}
if (!APPLY && r.renamed > 0) console.log(`\nDry-run only. Re-run with --apply to write changes.`);
