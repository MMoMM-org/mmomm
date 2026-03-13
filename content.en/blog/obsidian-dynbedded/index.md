---
title: "Obsidian: Dynbedded"
date: 2022-10-30T21:00:57.613Z
lastmod: 2022-10-30T21:00:57.613Z
description: "Hello and welcome.Today I want to review Dynbedded.Dynbedded will integrate content from other notes dynamically. This is valid for dataview queries, so it becomes easy to create a library of common queries, but also for date references. You can jump back and forth in time with Dynbedded.The plugin was programmed by .... me .. but take a look yourself if I promise too much.I assume in this post that you already know Obsidian and also know how to install community plugins. Feel free to leave comm"
slug: "obsidian-dynbedded"
translationKey: "obsidian-dynbedded"
categories: ["obsidian"]
tags: []
images: ["/img/wix/a64b4a_0a0f11b0ce494971b1fd7e496c5cba0d~mv2.png"]
draft: false
---
Hello and welcome.

Today I want to review [Dynbedded](https://github.com/MMoMM-org/obsidian-dynbedded).

Dynbedded will integrate content from other notes dynamically. This is valid for dataview queries, so it becomes easy to create a library of common queries, but also for date references. You can jump back and forth in time with Dynbedded.

The plugin was programmed by .... me .. but take a look yourself if I promise too much.

I assume in this post that you already know Obsidian and also know how to install community plugins. Feel free to leave comments if you have questions about this.

## Overview

Dynbedded has two features:

1. Embedding of dynamic content. The content embedded will reference the current note, not the note from which the content is coming from.
2. Dynamic date substitution, for the current date but also for a relative date, so in the past or the future.

Let's take a look at some samples of the first feature:

Left Standard Embedded Feature / Right Dynbedded Embedded Feature

![](/img/wix/a64b4a_0a0f11b0ce494971b1fd7e496c5cba0d~mv2.png)  

- **Dataview**: shows inlinks into the note
- **Buttons**: shows a note with 2 buttons
- **Buttons - Today**: shows only the today button

And now the second feature:

![](/img/wix/a64b4a_419b374b203c4dba8eff03ddb5a711fc~mv2.png)  

- **Daily Note - Today**: show the note which I embedded yesterday as TODAY
- As you can see, Dynbedded doesn't support checking checkboxes natively

![](/img/wix/a64b4a_bde52b9ed9ef4f2cbe48282b25c58298~mv2.png)  

- **Daily Note - Last Week**: show the information from last weeks note

So what are the pros / cons of Dynbedded?

## Pros

- Dynbedded allows usage of for example dataview queries in several notes. This is quite handy as it means you only need to change the query in one place instead of all over your vault.
- Sure, you can use dataviewJS for it. But you need to know to program in javascript in this case, the other option is a lot easier.
- And of course this also works with other features / plugins which require information from the current note.
- The second feature with the dynamic date substitution was the main reason for me to write the plugin. I can display in a static note the content of yesterday, tomorrow, last week etc. without writing custom javascript code and can even look only at parts of that target note.
- All of this fit's nicely into the concept of dashboard which don't need to be recreated all the time.

## Cons

- Dynbedded doesn't support tasks / checkboxes natively. You can use dataview though as a workarround.
- The links which are used to embed the note are just text, not really links. So changing the target note will break the link.

What does it take to use Dynbedded?

## Syntax

### Standard Syntax

For an easy embedded a codeblock is sufficient. (e.g. Dataview)

```
```dynbedded
[[Title of Note]]
```
```

If you want to display only part of the note (z.B. Buttons- Today):

```
```dynbedded
[[Title of Note#Header]]
```
```

### Date Substitution

The usage for TODAY is quite simple, you only need to specify the format [based on Moment.js date format](https://momentjs.com/docs/#/displaying/format/).

```
```dynbedded
[[{{YYYY-MM-DD}}]]
```
```

You just need to specify the full note name inside the {{}}.

If you have a notename which doesn't only consist of a date, you need to specify this additional information too.

```
```dynbedded
[[{{[DP-]YYYY-MM-DD}}]]
```
```

The other part of the name needs to be put into [].

Using relative date substitution might look complicated in the beginning but is quite easy:

First you use a P and afterward the difference of time you want to subtract or add to today.

[If you want you can take hours but then it will be a T.](https://en.wikipedia.org/wiki/ISO_8601#Durations)

|  |  |
| --- | --- |
| **Abbreviation** | **Meaning** |
| Y | Year |
| M | Month |
| W | Week |
| D | Day |

If you want to show a note from 7 days ago you are either able to use:

```
```Dynbedded
{{YYYY-MM-DD|P-1W}}
```
```

or

```
```dynbedded
{{YYYY-MM-DD|P-7D}}
```
```

## Usage Example

Are there any examples on how to use Dynbedded?

### Standard "Library"

You can use for example Dynbedded to embed standard dataview queries or buttons.

Create a note with a button per header and use Dynbedded to integrate the button where you like by embedding it via the header.

So, nothing is keeping you from creating the buttons at one place and using it all over the place instead of recreating the same button again and again.

![](/img/wix/a64b4a_8ae09ca8f47a48ea9f1a6c0e51c84e29~mv2.png)

The same works of course also with dataview queries, which are simpler to write then javascript queries.

![](/img/wix/a64b4a_c8295f62456f4051bce69e2f72632d38~mv2.png)

### Startpage

And another example is a homenote / dashboard which uses relative dates to show specific information without the need to recreate the note again and again. This was my main reason to create the plugin.

An unfinished example.

![](/img/wix/a64b4a_4c5e90161849490f87f3a7baf3976ed1~mv2.png)  

## Styling

If you want you can also change the style of the embeds. The following style sheet shows errors in red and the normal embeds in blue. But there is a lot more possible.

```
/* Sets all the dynbedded text color to blue! */
.dynbedded {
    color: blue;
}
/* Sets all the error text color to red! */
.dynbedded-error {
    color: red;
}
```

There are a lot of possibilities to let of steam and be creative.

## Verdict

What should I say. It does what is does, and as I'm using Buttons and Dataview I don't really notice the issue that I can't use Tasks / Checkboxes natively.

## Noteworthy Tidbits

Gareth Stretton did describe on [Medium](https://medium.com/@gareth.stretton/obsidian-dataview-reuse-10fa0e635e46) an other workaround for centralised dataview queries, take a look.

## Conclusion

So what do YOU think? Let me know, not only about the plugin but also about the review and the [video](https://youtu.be/pytz0KENhp8).

## Footnote

- [The video of the post](https://youtu.be/pytz0KENhp8)
- [My Youtube Video Vault](https://github.com/MMoMM-org/obsidian-youtube-vault)
- [Dynbedded](https://github.com/MMoMM-org/obsidian-dynbedded)
- 40-01
