---
title: "Obsidian: Readwise Integration"
date: 2023-03-23T17:08:03.128Z
lastmod: 2023-03-23T17:08:03.128Z
description: "Obsidian Readwise Integration, Tips & Tricks and how I use it."
slug: "obsidian-readwise-integration"
translationKey: "obsidian-readwise"
categories: ["obsidian"]
tags: []
images: ["/img/wix/a64b4a_e813daae66f74660aa521fa86de7df63~mv2.png"]
draft: false
---
Hello and welcome,

today we take a look at a service which allows us to collect highlights from several different sources and can export them to Obsidian. [Readwise](https://readwise.io/i/marcus890) doesn't only collect your highlights, it also allows you to get those highlight brought up again via email or app via a SRS (Spaced Repetition System).

I use Readwise as it allows me to only use one plugin to export all my highlights (web, Kindle, etc.) to Obsidian. I use the Readwise Official plugin directly from Readwise.

If you want to know more about Readwise feel free to ask, but now let's take a look at the plugin and how it can be used.

## Overview

As already said, there is more to Readwise then highlight export to Obsidian, but the subject of this post is the Readwise Official Plugin. If you don't like the functionality of the plugin there are some alternatives which you can find at the end.

After Installation you only find a few options to manage your plugin inside of Obsidian.

![](/img/wix/a64b4a_94a0b0c4894b46488dcbd16663e67972~mv2.png)

Readwise Plugin Konfiguration

The only important things you configure is the sync interval and the folder into which the notes are created.

The look and structure of those notes (Customize Formatting Options) is being done on the Readwise website.

Readwise uses the Jinja2 Template Language to modify the layout of the notes.

> Don't forget to activate the different options if you want them!

### Category Folders

![](/img/wix/a64b4a_d97d5e8994b84e5aa1c3ef77b37b7d44~mv2.png)

Group Files in Category Folders

Configuration starts with the decision if you want the export split up into folders based on categories. The nice part of the configuration is the example you can find on the right side.

> IF you are using integrations into Readwise, like the Readwise Discord Bot from the official Obsidian Discord, the names of those categories could create some issues.

> The Discord Bot saves his bookmarks as Tweet, [Reclipped](https://reclipped.com/signup?referred_by=maruh0x7) saves the Youtube highlights as Podcasts.

### Note Names

After that you will define the note name. A lot of issues with the filesystems are already taken care of. You can find a more "sophisticated" version of file name sanitization in the footnotes.

I like it that you can directly see which variables you can use and that Readwise even delivers some tips & tricks. Also you will find a link to the documentation in each section.

![](/img/wix/a64b4a_fa5cff4a6c8045f9897efe74175e56bc~mv2.png)

File Name

> You can't rename or move the note in Obsidian without triggering a recreation of the note if you add a new highlight to it.

> The plugin uses the note name and location as a reference with Readwise.

### Note Titel

Untypical for Obsidian Readwise uses the term Page instead of Note. But I guess we can life with that. 😃

Next is the title of the note.

![](/img/wix/a64b4a_1e20a2d0ba4d43daa39ae9da5a325a01~mv2.png)

Page Title

### Note Metadata

You shouldn't mistake Page Metadata as the YAML Header in Obsidian.

This is the part of the note, which contains important information about the source of the highlights, and this is where Readwise shines.

You can get:

- Image URL, e.g. for book covers
- URL, e.g. a link into the Kindle App (if the highlight was a Kindle book) via a [readwise.io](http://readwise.io) redirect
- Author
- Category from Readwise etc.

This part will only be done once.

![](/img/wix/a64b4a_3f6da1774e6c403fabac7cd65edc5153~mv2.png)

Page Metadata

### Highlights Header

This part will always be done if you export a highlight.

- For the first time, so note creation (is\_new\_page)
- if you add new highlights after that (has\_new\_highlights)

> Readwise never changes a note. Every new highlight (even changed ones) are added at the end of the note.

![](/img/wix/a64b4a_a9ee28676c3245108ab93c08fcfe0c33~mv2.png)

Highlights Header

The highlights will then follow the Highlights Header.

### Highlight

This part will be used for every single highlight which is in the note. By default every highlight starts with a - (so bullet index).

You will find again lot of opportunities to change the highlight with the Jinja2 template language.

![](/img/wix/a64b4a_d708f21aa4c44b33882ac6d313a3fa86~mv2.png)

Highlight

### YAML Front Matter

And almost at the end, which is kinda weird as it is at the front of the note, you can configure the YAML Front Matter.

This is kinda "stupid", because you are at "Sync Notification" of the example on the right and need to scroll up all the time if you want to see how your change will look like.

![](/img/wix/a64b4a_d50076b349554b9d82931ced0eb63ed1~mv2.png)

YAML front matter

The three dashes at the start and the end of the YAML section are added automatically.

![](/img/wix/a64b4a_71f21f44960c4673bdbfdfbe2e14d028~mv2.png)

Front Matter

### Sync Notification

And finally at the end you have the sync notification. Every time there is a sync the information is added to a note if you export any highlights.

This can be interesting, but it doesn't has to.

![](/img/wix/a64b4a_7715bfb938ef4609863fb89f492e2d32~mv2.png)

Sync Notification

### Items to be exported

You can specify which items to be exported, but in my opinion this is to complicated to make sense.

I would welcome the option to be able to use tags to control the export.

![](/img/wix/a64b4a_fe40bc886bd94ff3b6b8963af7b3aa8f~mv2.png)

Items to be exported

And that's it configuration wise.

## Pros

- a lot of different highlight sources
- Spaced Repetition System (if you need it)
- a lot of different export targets
- own Reader
- Supplemental Books (Popular Highlights from books you don't own yourself)

## Cons

- Kindle URLs are redirected via Readwise.io website
- Export from specific resources is overly complicated
- Quite expensive if you only use it as a highlight aggregator.

## Usage Example

How do I use Readwise? And why, as there are other options to collect highlights.

### Why

I though a long time about: Why shouldn't I use a plugin for every service I use?

- Kindle = Kindle Plugin
- RainDrop.Io = Raindrop Plugin
- and so on

I wanted to have the same structure for all of my highlights and sources. On top of that some of my sources (e.g. [Reclipped](https://reclipped.com/signup?referred_by=maruh0x7)) don't have an automatic export / import into Obsidian but into Readwise.

### How

This is my configuration with a description on why I do it that way.

#### File Name

SM - Title = As I want to process the information further, see also MiYo - Compose, I use the "SM - " to differentiate the Source Material from the source note (which start with { ) and the different highlights / insights I create

#### Page Metadata

```
{% if image_url -%}
![rw-book-cover]({{image_url}})

{% endif -%}
## Metadata
- Author:: {% if author %}[[@{{author}}]]{% endif %}
- Full Title:: {{full_title}}
- Content:: #content/resource/readwise/{{category}}
- Status:: #status/fleeting/🎗️
- Type:: #type/resource/readwise
{% if document_tags -%}
- Document Tags:: {% for tag in document_tags %}#Readwise/{{tag}} {% endfor %}
{% endif -%}
{% if url -%}
- URL:: {{url}}
{% endif -%}
- ResourceNote::
```

The most obvious part here is that I implement the Page Metadata as Inline Dataview Fields, e.g. Author::

Another important part for me are the tags. Every tag which is coming from Readwise will start with Readwise. This allows the clear differentiation between tags which are coming from Readwise and tags which are created by myself. For example I can directly see if a note with the tag **Japan** was created by myself or which was created from outside.

#### Highlight

Changes I made here are instead of a - I use a >, the Highlight-ID always starts with ^rw to create a unique block reference and I also again add Readwise in-front of the tags.

```
> {{ highlight_text }}{% if highlight_location and highlight_location_url %} ([{{highlight_location}}]({{highlight_location_url}})){% elif highlight_location %} ({{highlight_location}}){% endif %}  ^rw{{highlight_id}}{% if highlight_tags %}
>    - Tags: {% for tag in highlight_tags %}#Readwise/{{tag}} {% endfor %}{% endif %}{% if highlight_note %}
>    - Note: {{ highlight_note }}{% endif %}
```

#### YAML Frontmatter

Well, here I go crazy and use the capabilities which comes with the templater plugin.

```
UUID: <% tp.date.now("YYYYMMDDHHmmss") %>
DateStamp: <% tp.date.now("YYYY-MM-DD") %>
Updated: 
publish: false
language: de
Vault: Privat
Year: <% tp.date.now("YYYY") %>
title: "SM - {{title}}" 
<%*
const quickAddApi = this.app.plugins.plugins['quickadd'].api;
quickAddApi.executeChoice('AddReadwise', {X: {{title}}});
-%>
```

The QuickAdd part will automatically add the note as a link to a Kanban Board, so that I perhaps think about working on the highlights sometime in the future.

#### Sync Notification

I add links to my daily notes.

```
- [[{{date|date('Y-m-d')}}]] {{time}} — Synced {{num_highlights}} highlight{{num_highlights|pluralize}} from {{num_books}} document{{num_books|pluralize}}. {% for book in books %} - {{ book.num_highlights_added}} highlights from {{ book.title }} {% endfor %}
```

This isn't really necessary though, as I use the List Modified Plugin, which add all modified or created notes to my daily notes automatically.

## Verdict

Readwise collects all different kind of highlights from different sources and processes them all in the same way. I like this consistency.

Configuration need a little bit to get used too, as most of it is done on the website, but it isn't really a problem.

You can use Jinja2 to create your own templates, it is questionable though if you really need it.

I only did minor changes to the original templates.

But as always, ymmv, and will depend on how your processes work.

## Noteworthy Tidbits

This article from [TfTHacker on Medium](https://tfthacker.medium.com/using-readwises-highlight-id-as-a-single-source-of-truth-in-obsidian-b1de98a8b87c) has the idea to use the ^rw block reference.

On top of that he also has a [Demovault which describes a Readwise Inbox Prozes](https://github.com/TfTHacker/obsidian-readwise-inbox).

## Conclusion

Especially in the area of export filtering Readwise need to deliver an update. I don't use the Reader or the Browser Plugin at the moment, as I use the highlight function from [Raindrop.io.](http://Raindrop.io)

I didn't had time though to take a closer look into Reader, perhaps he is a good alternative to [Raindrop.IO](http://Raindrop.IO) in this regard.

Otherwise Readwise fits into my processes and all of my highlights have the same structure, it doesn't matter from where they are coming.

Is it worth the 8 USD per month? You need to figure that out by yourself, especially as there are also the SRS and Reader.

## Fussnote

- [The Video for this post](https://youtu.be/u1v-0plVKPA)
- [The Vault for this Post](https://github.com/MMoMM-org/obsidian-youtube-vault)
- [readwise-mirror](https://github.com/jsonMartin/readwise-mirror) Alternative Readwise Integration plugin
- [Additional Sanitization of Filenames?](https://github.com/YTolun/obsidian-filename-emoji-remover/issues/1)
- [How can I customize the Readwise to Obsidian Export?](https://help.readwise.io/article/126-how-can-i-customize-the-readwise-to-obsidian-export#title)
- [Jinja — Jinja Documentation (2.11.x)](https://jinja.palletsprojects.com/en/2.11.x/)
