# Blog Post Workflow — MingleMangleOfMyMind

## Neuen Post erstellen

### 1. Deutschen Post anlegen

```bash
cd /Volumes/Moon/Coding/MMoMM.org/mmomm
hugo new blog/mein-post-titel/index.md
```

Öffnet `content/blog/mein-post-titel/index.md` — Frontmatter ist vorausgefüllt:

```yaml
---
title: "Mein Post Titel"
date: 2026-03-13T10:00:00Z
lastmod: 2026-03-13T10:00:00Z
description: ""        ← SEO-Beschreibung (max. 155 Zeichen)
slug: "mein-post-titel"
translationKey: "mein-post-titel"   ← GLEICHER Wert in DE und EN!
categories: []         ← z.B. ["pkm", "miyo", "obsidian", "ai"]
tags: []               ← z.B. ["obsidian", "tasks"]
images: []             ← Erstes Bild = Hero + OG-Bild
draft: true
---
```

### 2. Englischen Post anlegen

```bash
hugo new --contentDir content.en blog/mein-post-titel/index.md
```

**Wichtig:** `translationKey` muss identisch mit dem deutschen Post sein.
`slug` kann abweichen (z.B. `"my-post-title"` statt `"mein-post-titel"`).

```yaml
---
title: "My Post Title"
slug: "my-post-title"                ← eigener EN-Slug
translationKey: "mein-post-titel"   ← GLEICH wie DE!
```

### 3. Bilder einfügen

Bilder in `static/img/posts/mein-post-titel/` ablegen:

```
static/img/posts/mein-post-titel/
  hero.jpg        ← wird als Hero-Bild und OG-Image verwendet
  screenshot.png
```

Im Frontmatter:
```yaml
images: ["/img/posts/mein-post-titel/hero.jpg"]
```

Im Text:
```markdown
![Alt-Text](/img/posts/mein-post-titel/screenshot.png)
```

### 4. YouTube-Video einbetten

```markdown
{{< youtube VIDEO_ID "Titel des Videos" >}}
```

### 5. Lokal testen

```bash
hugo server -D    # -D zeigt auch draft:true Posts an
```

Öffne http://localhost:1313

### 6. Veröffentlichen

```bash
# draft: false setzen im Frontmatter, dann:
git add content/blog/mein-post-titel/ content.en/blog/mein-post-titel/
git add static/img/posts/mein-post-titel/
git commit -m "Post: Mein Post Titel (DE + EN)"
git push origin main
```

GitHub Actions baut und deployed automatisch → live auf www.mmomm.org in ~2 Min.

---

## Bestehenden Post bearbeiten

```bash
# Einfach die index.md bearbeiten, dann:
git add content/blog/post-slug/index.md
git commit -m "Update: Post-Slug"
git push
```

`lastmod` im Frontmatter manuell auf das heutige Datum setzen.

---

## Kategorien

Aktuell aktive Kategorien (slug → Label):

| Slug       | Deutsch | English |
|------------|---------|---------|
| `pkm`      | PKM     | PKM     |
| `miyo`     | MiYo    | MiYo    |
| `obsidian` | Obsidian | Obsidian |
| `ai`       | KI / AI | AI      |

Neue Kategorie: einfach im Frontmatter eintragen — Hugo erstellt die Seite automatisch.

---

## Lokale Entwicklung

```bash
# Hugo installieren (macOS)
brew install hugo

# Projekt starten
cd /Volumes/Moon/Coding/MMoMM.org/mmomm
hugo server -D

# Produktionsbuild testen
hugo --minify --gc
```

---

## Deploy-Infra

- **Trigger:** Push auf `main` → GitHub Actions → Hugo Build → GitHub Pages
- **Domain:** www.mmomm.org (CNAME in `static/CNAME`)
- **HTTPS:** GitHub Pages stellt automatisch ein Let's-Encrypt-Zertifikat aus
- **Build-Log:** GitHub → Repository → Actions
