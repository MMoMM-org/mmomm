#!/usr/bin/env python3
"""
extract_wix.py — Converts Wix Thunderbolt SSR HTML files to Hugo Markdown.

Usage:
  cd /Volumes/Moon/Coding/MMoMM.org/mmomm
  python3 scripts/extract_wix.py
  python3 scripts/extract_wix.py --skip-media   # skip image downloads
"""

import argparse
import re
import sys
import urllib.request
from pathlib import Path
from urllib.parse import unquote, urlparse
from bs4 import BeautifulSoup

try:
    from markdownify import markdownify as md_convert
except ImportError:
    print("ERROR: pip3 install markdownify beautifulsoup4", file=sys.stderr)
    sys.exit(1)

# ─────────────────────────────────────────────────────────────────────────────
# Category mapping: Wix display name → Hugo slug
# ─────────────────────────────────────────────────────────────────────────────
CATEGORY_MAP = {
    'PWM':            'pkm',
    'PKM':            'pkm',
    'MiYo (DE)':      'miyo',
    'MiYo':           'miyo',
    'Obsidian (DE)':  'obsidian',
    'Obsidian (EN)':  'obsidian',
    'AI':             'ai',
    'Blog (DE)':      'blog',
    'Blog (EN)':      'blog',
}

# Tag mapping: Wix tag → Hugo slug (strip -1 artefacts from EN)
TAG_MAP = {
    'backup-1': 'backup', 'buttons-1': 'buttons', 'dataview-1': 'dataview',
    'dynbedded': 'dynbedded', 'dynbedded-1': 'dynbedded',
    'markdown-1': 'markdown', 'miyo-1': 'miyo', 'obsidian': 'obsidian',
    'obsidian-1': 'obsidian', 'pkm': 'pkm', 'pwm': 'pkm',
    'review': 'review', 'review-1': 'review', 'tasks-1': 'tasks',
    'templater-1': 'templater',
}

# Slug cleanup: Wix filename stem → clean Hugo slug
SLUG_MAP = {
    'miyo-ace-1':                                      'miyo-ace',
    'obsidian-buttons-1':                              'obsidian-buttons',
    'obsidian-supercharged-links-1':                   'obsidian-supercharged-links',
    'obsidian-readwise-integration-1':                 'obsidian-readwise-integration',
    'obsidian-todoist-1':                              'obsidian-todoist',
    'obsidian-dynbedded-1':                            'obsidian-dynbedded',
    'virtualisierung-ist-wie-ein-ラブホテル-rabu-hoteru': 'virtualisierung-ist-wie-ein-rabu-hoteru',
    'virtualization-is-like-a-ラブホテル-rabu-hoteru':   'virtualization-is-like-a-rabu-hoteru',
    'minglemangle-of-my-häää':                         'minglemangle-of-my-haaa',
}

# translationKey: maps clean DE slug → shared key (same for both languages)
TRANSLATION_KEYS = {
    'entschuldigt-die-unordnung':            'pardon-the-dust',
    'pardon-the-dust':                       'pardon-the-dust',
    'minglemangle-of-my-haaa':               'minglemangle-haaa',
    'minglemangle-of-my-lol-wut':            'minglemangle-haaa',
    'miyo-mach-es-dir-zu-eigen':             'miyo-make-it-your-own',
    'miyo-make-it-your-own':                 'miyo-make-it-your-own',
    'miyo-ace':                              'miyo-ace',
    'miyo-aggregate-informationssammlung':   'miyo-aggregate',
    'miyo-aggregate-collecting-information': 'miyo-aggregate',
    'die-2-aspekte-von-miyo':               'miyo-2-aspekte',
    'the-2-aspects-of-miyo':                'miyo-2-aspekte',
    'obsidian-buttons':                      'obsidian-buttons',
    'obsidian-die-in-der-alles-besser-ist':  'obsidian-the-better-one',
    'obsidian-the-one-where-everything-is-better': 'obsidian-the-better-one',
    'obsidian-dynbedded':                    'obsidian-dynbedded',
    'obsidian-dynbedded-1':                  'obsidian-dynbedded',
    'obsidian-helfer-beim-schreiben-backup': 'obsidian-helpers-backup',
    'obsidian-useful-editing-helpers-backup':'obsidian-helpers-backup',
    'obsidian-readwise-integration':         'obsidian-readwise',
    'obsidian-supercharged-links':           'obsidian-supercharged-links',
    'obsidian-todoist':                      'obsidian-todoist',
    'virtualisierung-ist-wie-ein-rabu-hoteru': 'rabu-hoteru',
    'virtualization-is-like-a-rabu-hoteru':  'rabu-hoteru',
}

# RSS category data (built from both RSS feeds)
RSS_CATEGORIES = {
    'virtualisierung-ist-wie-ein-rabu-hoteru': [],
    'virtualization-is-like-a-rabu-hoteru':    ['ai'],
    'obsidian-readwise-integration-1':         ['obsidian'],
    'obsidian-readwise-integration':           ['obsidian'],
    'miyo-aggregate-informationssammlung':     ['pkm', 'miyo'],
    'miyo-aggregate-collecting-information':   ['pkm', 'miyo'],
    'obsidian-buttons-1':                      ['obsidian'],
    'obsidian-buttons':                        ['obsidian'],
    'obsidian-supercharged-links':             ['obsidian'],
    'obsidian-supercharged-links-1':           ['obsidian'],
    'miyo-ace-1':                              ['pkm', 'miyo', 'obsidian'],
    'miyo-ace':                                ['pkm', 'miyo'],
    'obsidian-todoist-1':                      ['obsidian'],
    'obsidian-todoist':                        ['obsidian'],
    'the-2-aspects-of-miyo':                   ['miyo', 'pkm'],
    'die-2-aspekte-von-miyo':                  ['miyo', 'pkm'],
    'obsidian-the-one-where-everything-is-better': ['obsidian'],
    'obsidian-die-in-der-alles-besser-ist':    ['obsidian'],
    'obsidian-dynbedded-1':                    ['obsidian'],
    'obsidian-dynbedded':                      ['obsidian'],
    'obsidian-helfer-beim-schreiben-backup':   ['obsidian'],
    'obsidian-useful-editing-helpers-backup':  ['obsidian'],
    'miyo-mach-es-dir-zu-eigen':               ['miyo'],
    'miyo-make-it-your-own':                   ['miyo'],
    'minglemangle-of-my-haaa':                 [],
    'minglemangle-of-my-lol-wut':              [],
    'entschuldigt-die-unordnung':              [],
    'pardon-the-dust':                         [],
}

# Internal link rewrites
LINK_REWRITES = [
    # Wix source domain
    (r'https://mbreiden\.wixsite\.com/mmomm-blog/post/([^)\s"\']+)',    r'/blog/\1/'),
    (r'https://mbreiden\.wixsite\.com/mmomm-blog/en/post/([^)\s"\']+)', r'/en/blog/\1/'),
    (r'https://mbreiden\.wixsite\.com/mmomm-blog/%C3%BCber-mich',       '/ueber-mich/'),
    (r'https://mbreiden\.wixsite\.com/mmomm-blog/über-mich',            '/ueber-mich/'),
    (r'https://mbreiden\.wixsite\.com/mmomm-blog/now',                  '/jetzt/'),
    (r'https://mbreiden\.wixsite\.com/mmomm-blog/general-8',            '/videos/'),
    (r'https://mbreiden\.wixsite\.com/mmomm-blog/impressum',            '/impressum/'),
    (r'https://mbreiden\.wixsite\.com/mmomm-blog/datenschutzerkl[^)\s"\']*', '/datenschutz/'),
    (r'https://mbreiden\.wixsite\.com/mmomm-blog',                      '/'),
    (r'https://mbreiden\.wixsite\.com/mmomm-blog/profile/[^\s"\')\]]+', '/'),
    # Custom domain links (Wix stored some cross-links with the custom domain)
    (r'https?://(?:www\.)?mmomm\.org/post/([^)\s"\']+)',                r'/blog/\1/'),
    (r'https?://(?:www\.)?mmomm\.org/en/post/([^)\s"\']+)',             r'/en/blog/\1/'),
    # Relative Wix hashtag/category links inside post bodies → tag pages
    (r'\[([^\]]+)\]\(\.\./my-blog/hashtags/[^\)]+\)',                   r'`\1`'),
    (r'\[([^\]]+)\]\(\.\./my-blog/tags/[^\)]+\)',                       r'`\1`'),
    (r'\[([^\]]+)\]\(\.\./my-blog/categories/[^\)]+\)',                 r'`\1`'),
]

# Wix copyright / boilerplate text patterns to strip
WIX_BOILERPLATE = [
    r'Proudly created with \[Wix\.com\]\([^)]+\)',
    r'\[Wix\.com\]\([^)]+\)',
    r'© \d{4} by Train of Thoughts\.?',
    r'Train of Thoughts\.',
    r'Diese Website wird nicht in der EU gehostet!',
    r'\[Diese Website wird nicht in der EU gehostet[^\]]*\]\([^)]+\)',
    r'Schreibt mir eine Nachricht.*?(?=\n)',
    r'Send me a message.*?(?=\n)',
    r'Thanks for submitting!',
    r'Mein Blog über Allerlei',
    r'My Blog about a lot of things',
    r'\[Mingle Mangle Of My Mind\]\([^)]+\)',
]

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def get_meta(soup, prop=None, name=None):
    tag = soup.find('meta', property=prop) if prop else soup.find('meta', attrs={'name': name})
    return tag['content'].strip() if tag and tag.get('content') else ''


def clean_slug(raw_stem):
    stem = unquote(raw_stem)
    return SLUG_MAP.get(stem, stem)


def yaml_str(s):
    s = str(s).replace('\\', '\\\\').replace('"', '\\"')
    return f'"{s}"'


def yaml_list(lst):
    if not lst:
        return '[]'
    return '[' + ', '.join(yaml_str(i) for i in lst) + ']'


# ─────────────────────────────────────────────────────────────────────────────
# Content extraction
# ─────────────────────────────────────────────────────────────────────────────

def extract_rcv_body(soup):
    """
    Extract blog post body from Wix Rich Content Viewer (RCV) component.
    The RCV root has class 'UhKMm'. Inside, content blocks are in divs
    with class 'BoRwr'. Each block contains standard HTML tags (p, h1-h6,
    ul, ol, img, blockquote, pre) with Wix-specific CSS classes.
    """
    rcv = soup.find(class_='UhKMm')
    if not rcv:
        return ''

    # Strip all Wix class/style/id attributes before converting to Markdown
    for tag in rcv.find_all(True):
        for attr in ['class', 'id', 'style', 'data-hook', 'data-testid',
                     'data-breakout', 'data-aid', 'dir', 'aria-hidden',
                     'data-mesh-id', 'data-packed', 'type']:
            tag.attrs.pop(attr, None)

    # Convert to Markdown
    body = md_convert(str(rcv), heading_style='ATX', bullets='-', strip=['div'])
    return body


def extract_static_body(soup):
    """
    For static pages (über-mich, now, etc.) - fall back to wixui-rich-text
    since they don't use the RCV component.
    """
    NAV_SKIP = {
        'Home', 'Über mich', 'About Me', 'Jetzt', 'Now', 'Videos',
        'Impressum', 'Datenschutzerklärung', 'Privacy Policy', 'Datenschutz',
        'Mein Blog', 'My Blog', 'My Content', 'Kontakt', 'Contact',
        'Anmelden', 'Sign In', 'Blog', 'MingleMangleOfMyMind',
        'Mein Blog über Allerlei', 'My Blog about a lot of things',
    }
    container = soup.find(id='SITE_CONTAINER') or soup.body
    if not container:
        return ''

    blocks = []
    seen = set()
    for el in container.find_all(class_=re.compile(r'wixui-rich-text')):
        text = el.get_text(separator=' ', strip=True)
        if text in NAV_SKIP or len(text) < 20:
            continue
        sig = text[:60]
        if sig in seen:
            continue
        seen.add(sig)
        for tag in el.find_all(True):
            for attr in ['class', 'id', 'style', 'data-hook', 'aria-hidden']:
                tag.attrs.pop(attr, None)
        blocks.append(md_convert(str(el), heading_style='ATX', bullets='-').strip())

    return '\n\n'.join(blocks)


def clean_body(text):
    """Strip Wix boilerplate, clean up links, normalise whitespace."""
    for pattern in WIX_BOILERPLATE:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.DOTALL)
    for pattern, replacement in LINK_REWRITES:
        text = re.sub(pattern, replacement, text)
    # Remove Wix empty-line artefacts (two-space lines from empty divs)
    text = re.sub(r'\n  \n', '\n\n', text)
    text = re.sub(r'^  $', '', text, flags=re.MULTILINE)
    # Collapse excessive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Remove empty markdown links / images
    text = re.sub(r'!\[\]\s*\n', '', text)
    text = re.sub(r'\[!\[\]\([^\)]*\)\]\([^\)]*\)', '', text)
    return text.strip()


# ─────────────────────────────────────────────────────────────────────────────
# Media downloader
# ─────────────────────────────────────────────────────────────────────────────

FAVICON_URLS = {
    'favicon-192x192.png': 'https://static.wixstatic.com/media/a64b4a_edcc59485b694c32b59ba8c490e100f1~mv2.png/v1/fill/w_192,h_192,lg_1,usm_0.66_1.00_0.01/a64b4a_edcc59485b694c32b59ba8c490e100f1~mv2.png',
    'favicon-32x32.png':   'https://static.wixstatic.com/media/a64b4a_edcc59485b694c32b59ba8c490e100f1~mv2.png/v1/fill/w_32,h_32,lg_1,usm_0.66_1.00_0.01/a64b4a_edcc59485b694c32b59ba8c490e100f1~mv2.png',
    'apple-touch-icon.png':'https://static.wixstatic.com/media/a64b4a_edcc59485b694c32b59ba8c490e100f1~mv2.png/v1/fill/w_180,h_180,lg_1,usm_0.66_1.00_0.01/a64b4a_edcc59485b694c32b59ba8c490e100f1~mv2.png',
}


def download(url: str, dest: Path) -> bool:
    if dest.exists():
        return True
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as r:
            dest.write_bytes(r.read())
        return True
    except Exception as e:
        print(f'    WARN download failed {Path(url).name}: {e}', file=sys.stderr)
        return False


def wix_url_to_local(url: str, media_dir: Path):
    """Returns (hugo_path, abs_dest)."""
    parsed = urlparse(url)
    filename = re.sub(r'[^\w.\-~]', '_', unquote(Path(parsed.path).name))
    return f'/img/wix/{filename}', media_dir / filename


def download_all_media(content_dirs, static_dir: Path):
    media_dir = static_dir / 'img' / 'wix'
    media_dir.mkdir(parents=True, exist_ok=True)
    wix_pat = re.compile(r'(https://(?:static|video)\.wixstatic\.com/[^\s\)"\']+)')

    for cdir in content_dirs:
        for md_file in cdir.rglob('*.md'):
            text = md_file.read_text(encoding='utf-8')
            urls = wix_pat.findall(text)
            if not urls:
                continue
            modified = False
            for url in set(urls):
                if 'video.wixstatic.com' in url:
                    continue  # video embeds handled manually
                hugo_path, dest = wix_url_to_local(url, media_dir)
                print(f'    ↓ {Path(url).name[:55]}')
                if download(url, dest):
                    text = text.replace(url, hugo_path)
                    modified = True
            if modified:
                md_file.write_text(text, encoding='utf-8')


# ─────────────────────────────────────────────────────────────────────────────
# Post processor
# ─────────────────────────────────────────────────────────────────────────────

def process_post(html_path: Path, output_dir: Path):
    html = html_path.read_text(encoding='utf-8', errors='replace')
    soup = BeautifulSoup(html, 'html.parser')

    raw_stem = unquote(html_path.stem)
    slug = clean_slug(raw_stem)
    translation_key = TRANSLATION_KEYS.get(slug, slug)
    categories = RSS_CATEGORIES.get(slug, RSS_CATEGORIES.get(raw_stem, []))

    title       = get_meta(soup, prop='og:title') or slug.replace('-', ' ').title()
    description = get_meta(soup, prop='og:description')
    pub_date    = get_meta(soup, prop='article:published_time')
    mod_date    = get_meta(soup, prop='article:modified_time') or pub_date
    og_image    = get_meta(soup, prop='og:image')

    body = extract_rcv_body(soup)
    body = clean_body(body)

    images = [og_image] if og_image else []

    fm = '\n'.join(filter(None, [
        '---',
        f'title: {yaml_str(title)}',
        f'date: {pub_date}' if pub_date else 'date: 2022-01-01T00:00:00Z',
        f'lastmod: {mod_date}' if mod_date else '',
        f'description: {yaml_str(description)}',
        f'slug: {yaml_str(slug)}',
        f'translationKey: {yaml_str(translation_key)}',
        f'categories: {yaml_list(categories)}',
        'tags: []',
        f'images: {yaml_list(images)}',
        'draft: false',
        '---',
        '',
    ]))

    out = output_dir / slug
    out.mkdir(parents=True, exist_ok=True)
    (out / 'index.md').write_text(fm + '\n' + body + '\n', encoding='utf-8')
    print(f'    {slug}/')


def process_static_page(html_path: Path, out_dir: Path, slug: str):
    html = html_path.read_text(encoding='utf-8', errors='replace')
    soup = BeautifulSoup(html, 'html.parser')

    title       = get_meta(soup, prop='og:title') or slug.replace('-', ' ').title()
    description = get_meta(soup, prop='og:description')

    body = extract_static_body(soup)
    body = clean_body(body)

    fm = f'---\ntitle: {yaml_str(title)}\ndescription: {yaml_str(description)}\ndraft: false\n---\n\n'
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / 'index.md').write_text(fm + body + '\n', encoding='utf-8')
    print(f'    {slug}/')


# ─────────────────────────────────────────────────────────────────────────────
# Index stubs
# ─────────────────────────────────────────────────────────────────────────────

HOME_DE = """\
---
title: "MingleMangleOfMyMind"
description: "PKM, Obsidian, MiYo, AI und anderes Gedöns"
---

Willkommen bei **MingleMangleOfMyMind** — einem Blog über Persönliches Wissensmanagement,
Obsidian, das MiYo-Framework, AI und was sonst noch so durch meinen Kopf geht.
"""

HOME_EN = """\
---
title: "MingleMangleOfMyMind"
description: "PKM, Obsidian, MiYo, AI and other stuff"
---

Welcome to **MingleMangleOfMyMind** — a blog about Personal Knowledge Management,
Obsidian, the MiYo framework, AI, and whatever else is on my mind.
"""

BLOG_DE = "---\ntitle: \"Blog\"\ndescription: \"Alle Posts\"\n---\n"
BLOG_EN = "---\ntitle: \"Blog\"\ndescription: \"All posts\"\n---\n"

STATIC_PAGES = {
    'de': [
        ('über-mich.html',            'ueber-mich'),
        ('now.html',                  'jetzt'),
        ('general-8.html',            'videos'),
        ('impressum.html',            'impressum'),
        ('datenschutzerklärung.html', 'datenschutz'),
    ],
    'en': [
        ('en/über-mich.html',    'about'),
        ('en/now.html',          'now'),
        ('en/general-8.html',    'videos'),
        ('en/impressum.html',    'impressum'),
        ('en/privacy-policy.html','privacy-policy'),
    ],
}

CONTENT_DIRS = {'de': 'content', 'en': 'content.en'}
POST_DIRS    = {'de': 'post',    'en': 'en/post'}


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--wix-root', default='../oldsite/mbreiden.wixsite.com/mmomm-blog')
    parser.add_argument('--hugo-root', default='.')
    parser.add_argument('--skip-media', action='store_true')
    args = parser.parse_args()

    wix  = Path(args.wix_root).resolve()
    hugo = Path(args.hugo_root).resolve()

    if not wix.exists():
        print(f'ERROR: Wix root not found: {wix}', file=sys.stderr)
        sys.exit(1)

    # Blog posts
    for lang, post_subdir in POST_DIRS.items():
        print(f'\n=== {lang.upper()} posts ===')
        out = hugo / CONTENT_DIRS[lang] / 'blog'
        post_dir = wix / post_subdir
        for f in sorted(post_dir.glob('*.html')):
            process_post(f, out)

    # Static pages
    print('\n=== Static pages ===')
    for lang, pages in STATIC_PAGES.items():
        cdir = hugo / CONTENT_DIRS[lang]
        for src_name, slug in pages:
            src = wix / src_name
            if src.exists():
                process_static_page(src, cdir / slug, slug)
            else:
                print(f'  WARN missing: {src}')

    # Index stubs
    print('\n=== Index stubs ===')
    (hugo / 'content' / '_index.md').write_text(HOME_DE, encoding='utf-8')
    (hugo / 'content.en' / '_index.md').write_text(HOME_EN, encoding='utf-8')
    (hugo / 'content' / 'blog' / '_index.md').write_text(BLOG_DE, encoding='utf-8')
    (hugo / 'content.en' / 'blog' / '_index.md').write_text(BLOG_EN, encoding='utf-8')

    # Favicons
    print('\n=== Favicons ===')
    fav_dir = hugo / 'static' / 'favicon'
    fav_dir.mkdir(parents=True, exist_ok=True)
    for name, url in FAVICON_URLS.items():
        dest = fav_dir / name
        print(f'  ↓ {name}')
        download(url, dest)
    # Logo
    import shutil
    logo_src = fav_dir / 'favicon-192x192.png'
    logo_dst = hugo / 'static' / 'img' / 'logo.png'
    logo_dst.parent.mkdir(parents=True, exist_ok=True)
    if logo_src.exists() and not logo_dst.exists():
        shutil.copy2(logo_src, logo_dst)

    # Media
    if not args.skip_media:
        print('\n=== Downloading post media ===')
        download_all_media(
            [hugo / 'content', hugo / 'content.en'],
            hugo / 'static'
        )
    else:
        print('\n=== Media skipped (--skip-media) ===')

    print('\n✓ Done. Run: hugo server -D')


if __name__ == '__main__':
    main()
