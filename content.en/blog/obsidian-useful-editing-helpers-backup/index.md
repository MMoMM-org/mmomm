---
title: "Obsidian: Useful Editing Helpers + Backup"
date: 2022-11-13T22:37:05.871Z
lastmod: 2022-11-13T22:37:05.871Z
description: "Little Obsidian helpers: Editing Toolbar, Emoji Toolbar, Icon Shortcodes, Frontmatter Tag Suggest and Aut-O-Backups"
slug: "obsidian-useful-editing-helpers-backup"
translationKey: "obsidian-helpers-backup"
categories: ["obsidian"]
tags: []
images: ["/img/wix/a64b4a_82f507cfa3a54e7785a7e678803e8fbf~mv2.png"]
draft: false
---
Hello and welcome,

Today I would like to present some small but very useful plugins. From the editing category:

- Editing Toolbar
- Emoji Toolbar
- Icon Shortcodes
- Frontmatter Tag Suggest

And a backup solution:

- Aut-O-Backups

I assume in this post that you already know Obsidian and also know how to install community plugins. Feel free to leave comments if you have questions about this.

Let's start with Aut-O-Backups:

## Aut-O-Backups

The [plugin was developed by Ryan McQuen](https://github.com/ryanpcmcquen/obsidian-dropbox-backups) and it is quite simple. This is a pro and a con.

After enabling the plugin it will make backups of your vault to a dropbox account every 20 minutes and that's it.

It will not delete old backups and you can't restore a note from backup directly. You should also watch out if you want to distribute your vault to somebody else to not include the **.\_\_dropbox\_backups\_token\_store\_\_** file out of the **obsidian-dropbox-backup** directory. This contains the authentication token. (Note: This is not really an issue normally as the authentication needs to be stored somewhere.)

![Dropbox Token Store](/img/wix/a64b4a_fb4a81c780b84c25a4223b20eb96fb5a~mv2.png)

Dropbox Token Store

I think the best approach is it to exclude the /Apps/Obsidian Backups directory from your local sync, so you need to use the web interface if you want to restore a specific note.

![Aut-O-Backups in Dropbox](/img/wix/a64b4a_725136adfa5e470e90863763fa8d1ea1~mv2.png)

Aut-O-Backups in Dropbox

It has saved my A\* a couple of times and it works without any issues.

Next on the list:

## Frontmatter Tag Suggest

Developed was the [Plugin from Jonathan Miller](https://github.com/jmilldotdev/obsidian-frontmatter-tag-suggest) and after installation it directly starts it's job.

If you start typing in a tags: or tag: line in your frontmatter, the plugin will suggest you the tags.

![Frontmatter Tag Suggest](/img/wix/a64b4a_5f2d782fa03e47b9afb95c46a028ff4f~mv2.png)

Frontmatter Tag Suggest

From time to time it doesn't really want to work, it then case just press Space once and continue typing, it should work then.

And the next plugin on the list which we are rolling up from behind:

## Icon Shortcodes

Developed by [aidenlx the Icon Shortcodes Plugin](https://github.com/aidenlx/obsidian-icon-shortcodes) allows to include during writing to insert Icons / Emojis on the fly. It is using GitHub favored emoji shortcodes ... which you can find here: [Emoji Cheat Sheet](https://github.com/ikatyang/emoji-cheat-sheet/blob/master/README.md)

Next to the default emois you can integrate other emojis and even create your own. Keep in mind that the loading time will increase if you add more and more emojis.

By default the search for an icon / emoji starts after a : (Colon), would would suggest to change the configuration to expect a space in front of a colon and also add a space after the inserted emoji.

![Icon Shortcodes](/img/wix/a64b4a_b06330bf34444b2cb3ba3ae2dcd956d1~mv2.png)

Icon Shortcodes

There is one thing the plugin can't do, simply searching for emojis. I at least find it difficult if I don't know what I'm looking for (searchcode wise)

In this case I rather use

## Emoji Toolbar

[Developed Oliver Yerbury-Hodgson.](https://github.com/oliveryh/obsidian-emoji-toolbar) You can't add any custom icons / emojis here, but you can look at all of them based on categories. There is also a neat trick, but we come back to that later.

You can activate the emoji Toolbar with the command palette or a hotkey, after that you can use words like with icon shortcode or you just scroll through it.

![Emoji Toolbar](/img/wix/a64b4a_595130d12ddd4310b7fa868986c598c8~mv2.png)

Emoji Toolbar

And last but no least

## Editing Toolbar

The plugin was developed [by Cuman](https://github.com/cumany/obsidian-editing-toolbar) and is based on the old cMenu plugin. But it was improved tremendously.

![](/img/wix/a64b4a_31c311808065444398b0d960fc1e531d~mv2.png)

It does not only support the initial few markdown and HTML formatting but on top of that submenus and colors directly out of the box. It is also not only a modal which floats on top of your note at the bottom but a toolbar at the top.

![](/img/wix/a64b4a_be7cf3908b124f7bb65c97318b157ece~mv2.png)

You can extend it with commands, which makes it simple to integrate templates from templater or via [Hotkeys for Templates](https://github.com/Vinzent03/obsidian-hotkeys-for-templates) the default templates.

This of course also works with the emoji toolbar (the mentioned trick from before), but unfortunately you can't insert emojis atm. Cuman has this as demo on his GitHub but also mentions that the plugins in the Blue Topaz vault have been modified. He gave the modification also to Oliver Yerbury-Hodgson so let's wait and see.

## Verdict

What do you think about those plugins? Small but useful, which make using Obsidian for the average user a lot easier.

And a backup is a MUST for Obsidian, Aut-O-Backups just works for me.

## Noteworthy Tidbits

A very useful resource for markdown can be found in [The Markdown Guide](https://www.markdownguide.org/cheat-sheet/)

## Conclusion

How do you do your backups? Do you prefer to use small plugins or swiss army knives? There are different positions available for this but this is a different subject.

Let me know your opinion. Not just about the plugins, backups and swiss army knives, but also about my content.

## Footnote

- [The video of the post](https://youtu.be/FKZetvL45G4)
- [My Youtube Video Vault](https://github.com/MMoMM-org/obsidian-youtube-vault)
- 40-02
