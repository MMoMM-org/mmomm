#!/usr/bin/env python3
"""
new-post.py — Import an Obsidian Markdown file as a new bilingual Hugo blog post.

Usage (from repo root):
    ./scripts/new-post.sh <obsidian-file.md> <slug>
    python3 scripts/new-post.py <obsidian-file.md> <slug>

Examples:
    ./scripts/new-post.sh ~/Desktop/miyo-neues-konzept.md miyo-neues-konzept
    ./scripts/new-post.sh /tmp/obsidian-export/post.md obsidian-buttons-2

What it does:
    1. Strips YAML frontmatter if Obsidian added one
    2. Converts Obsidian embeds  ![[image.jpg]]  →  ![alt](/img/posts/slug/image.jpg)
    3. Converts Obsidian wiki-links  [[Page]]  →  plain text (or [[Page|Alias]] → Alias)
    4. Copies all referenced images to ./static/img/posts/<slug>/
    5. Writes the DE post to ./content/blog/<slug>/index.md
    6. Creates an EN draft stub at ./content.en/blog/<slug>/index.md
"""

import re
import sys
import shutil
from datetime import datetime, timezone
from pathlib import Path


# ─── Colours ──────────────────────────────────────────────────────────────────
def info(msg):  print(f"\033[32m▸\033[0m  {msg}")
def warn(msg):  print(f"\033[33m⚠\033[0m  {msg}")
def error(msg): print(f"\033[31m✗\033[0m  {msg}", file=sys.stderr); sys.exit(1)


# ─── Slug helper ──────────────────────────────────────────────────────────────
def sanitise_slug(raw: str) -> str:
    slug = raw.lower()
    slug = re.sub(r'[^a-z0-9-]', '-', slug)
    slug = re.sub(r'-+', '-', slug).strip('-')
    return slug


# ─── Frontmatter stripper ─────────────────────────────────────────────────────
def strip_frontmatter(text: str) -> str:
    """Remove YAML frontmatter (--- ... ---) if present at top of file."""
    lines = text.splitlines(keepends=True)
    if not lines or not lines[0].strip() == '---':
        return text
    for i, line in enumerate(lines[1:], start=1):
        if line.strip() == '---':
            return ''.join(lines[i + 1:])
    return text  # no closing ---, return as-is


# ─── Title extractor ──────────────────────────────────────────────────────────
def extract_title(text: str, slug: str) -> tuple[str, str]:
    """Return (title, body_without_h1)."""
    match = re.search(r'^#\s+(.+)$', text, re.MULTILINE)
    if match:
        title = match.group(1).strip()
        body = text[:match.start()] + text[match.end():]
        return title, body.strip()
    # Derive from slug
    title = slug.replace('-', ' ').title()
    return title, text.strip()


# ─── Obsidian embed finder ────────────────────────────────────────────────────
# Matches ![[filename.ext]] and ![[filename.ext|alt text]]
EMBED_PATTERN = re.compile(r'!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]')

IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'}


def is_image(name: str) -> bool:
    return Path(name).suffix.lower() in IMAGE_EXTENSIONS


def find_file(name: str, search_dirs: list[Path]) -> Path | None:
    for d in search_dirs:
        candidate = d / name
        if candidate.exists():
            return candidate
        # search up to 3 levels deep
        for found in d.rglob(name):
            return found
    return None


# ─── Obsidian → Hugo Markdown conversion ──────────────────────────────────────
def convert_obsidian(text: str, slug: str, source_dirs: list[Path], img_dest: Path) -> tuple[str, str | None]:
    """
    Convert Obsidian-flavoured Markdown to Hugo-compatible Markdown.
    Returns (converted_text, first_image_hugo_path_or_None).
    """
    first_image: str | None = None
    image_map: dict[str, str] = {}   # original_name → hugo_path or "" if not found

    # ── Pass 1: collect all embeds, copy images ──────────────────────────────
    for match in EMBED_PATTERN.finditer(text):
        raw_name = match.group(1).strip()
        if raw_name in image_map:
            continue  # already processed

        if not is_image(raw_name):
            # Non-image embed (e.g. ![[note]]) — treat as a block quote placeholder
            image_map[raw_name] = ''
            continue

        src = find_file(raw_name, source_dirs)
        if src is None:
            warn(f"Image not found, skipping: {raw_name}")
            image_map[raw_name] = ''
            continue

        img_dest.mkdir(parents=True, exist_ok=True)
        safe_name = re.sub(r'\s+', '-', raw_name.lower())
        dest = img_dest / safe_name
        shutil.copy2(src, dest)
        hugo_path = f'/img/posts/{slug}/{safe_name}'
        image_map[raw_name] = hugo_path
        if first_image is None:
            first_image = hugo_path
        info(f"Image: {raw_name} → ./static/img/posts/{slug}/{safe_name}")

    # ── Pass 2: replace embeds in text ───────────────────────────────────────
    def replace_embed(m: re.Match) -> str:
        raw_name = m.group(1).strip()
        alt = (m.group(2) or '').strip() or Path(raw_name).stem
        hugo_path = image_map.get(raw_name, '')

        if not is_image(raw_name):
            return f'> *{raw_name}*'   # non-image embed placeholder

        if hugo_path:
            return f'![{alt}]({hugo_path})'
        else:
            return f'<!-- IMAGE NOT FOUND: {raw_name} -->'

    text = EMBED_PATTERN.sub(replace_embed, text)

    # ── Pass 3: convert wiki-links ────────────────────────────────────────────
    # [[Page|Alias]] → Alias
    text = re.sub(r'\[\[([^\]|]+)\|([^\]]+)\]\]', r'\2', text)
    # [[Page]] → Page
    text = re.sub(r'\[\[([^\]]+)\]\]', r'\1', text)

    # ── Pass 4: clean up ──────────────────────────────────────────────────────
    text = re.sub(r'\n{3,}', '\n\n', text).strip()

    return text, first_image


# ─── Frontmatter builder ──────────────────────────────────────────────────────
def build_frontmatter(title: str, slug: str, now: str, first_image: str | None, lang: str = 'de') -> str:
    images = f'["/img/posts/{slug}/{Path(first_image).name}"]' if first_image else '[]'
    # Escape double quotes in title
    safe_title = title.replace('"', '\\"')
    return f"""---
title: "{safe_title}"
date: {now}
lastmod: {now}
description: ""
slug: "{slug}"
translationKey: "{slug}"
categories: []
tags: []
images: {images}
draft: true
---"""


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    if len(sys.argv) < 3:
        error("Usage: ./scripts/new-post.sh <obsidian-file.md> <slug>")

    source_path = Path(sys.argv[1]).resolve()
    slug = sanitise_slug(sys.argv[2])

    if not source_path.exists():
        error(f"Source file not found: {source_path}")
    if not slug:
        error("Slug is empty after sanitisation.")

    # Repo root = parent of scripts/
    repo_root = Path(__file__).resolve().parent.parent

    de_dir  = repo_root / 'content' / 'blog' / slug
    en_dir  = repo_root / 'content.en' / 'blog' / slug
    img_dir = repo_root / 'static' / 'img' / 'posts' / slug

    # Guard
    if (de_dir / 'index.md').exists():
        warn(f"DE post already exists: ./content/blog/{slug}/index.md")
        confirm = input("  Overwrite? [y/N] ").strip().lower()
        if confirm != 'y':
            info("Aborted.")
            sys.exit(0)

    # Read source
    raw = source_path.read_text(encoding='utf-8')
    text = strip_frontmatter(raw)
    title, text = extract_title(text, slug)

    # Image search dirs: source file's dir + any subdirs one level deep
    source_dir = source_path.parent
    search_dirs = [source_dir] + [d for d in source_dir.iterdir() if d.is_dir()]

    # Convert
    body, first_image = convert_obsidian(text, slug, search_dirs, img_dir)

    now = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

    # Write DE post
    de_dir.mkdir(parents=True, exist_ok=True)
    de_content = build_frontmatter(title, slug, now, first_image, 'de') + '\n\n' + body + '\n'
    (de_dir / 'index.md').write_text(de_content, encoding='utf-8')
    info(f"DE post created: ./content/blog/{slug}/index.md")

    # Write EN draft stub
    en_dir.mkdir(parents=True, exist_ok=True)
    en_stub = (
        build_frontmatter(title, slug, now, first_image, 'en')
        + f'\n\n<!-- TODO: Translate from DE: ./content/blog/{slug}/index.md -->\n\n*(English translation pending)*\n'
    )
    (en_dir / 'index.md').write_text(en_stub, encoding='utf-8')
    info(f"EN draft created:  ./content.en/blog/{slug}/index.md")

    # Summary
    print()
    print('─' * 50)
    print(f'\033[32m✓ Done!\033[0m  Slug: {slug}')
    print()
    print('Next steps:')
    print(f'  1. Fill in description + categories:')
    print(f'       ./content/blog/{slug}/index.md')
    print(f'  2. Translate the EN draft:')
    print(f'       ./content.en/blog/{slug}/index.md')
    print(f'  3. Preview locally:')
    print(f'       hugo server -D')
    print(f'  4. Set draft: false in both files, then publish:')
    print(f'       git add ./content/blog/{slug}/ ./content.en/blog/{slug}/ ./static/img/posts/{slug}/')
    print(f'       git commit -m "Post: {title} (DE + EN)"')
    print(f'       git push origin main')
    print('─' * 50)


if __name__ == '__main__':
    main()
