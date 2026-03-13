---
title: "Obsidian: Buttons"
date: 2023-02-01T17:00:46.968Z
lastmod: 2023-02-01T17:00:46.968Z
description: "Obsidian automation with Buttons"
slug: "obsidian-buttons"
translationKey: "obsidian-buttons"
categories: ["obsidian"]
tags: []
images: ["/img/wix/a64b4a_10fa81df5103484a83e069d8776df441~mv2.png"]
draft: false
---
Hello and welcome,

today we take a closer look at a plugin which has some more depth to it: [Buttons Plugin](https://github.com/shabegom/buttons).

Buttons is a lot more complex then the other plugins we looked at till now and allows us to create Button inside our notes which make recurring tasks more easy.

And together with other Plugins, like [Multi-Column Markdown Plugin](https://github.com/ckRobinson/multi-column-markdown) or [Dynbedded](https://github.com/MMoMM-org/obsidian-dynbedded), you can enhance the capabilities quite a bit.

![](/img/wix/a64b4a_a4cffb2c5b1243f68430a390a3afc40c~mv2.png)

My Obsidian Homepage

## Overview

Buttons functions are:

- **Command:** execute command
- **Link:** open links (URL or URI)
- **Calculate:** well... calculate
- **Template:** Create a new note or add text to a note with a template
- **Text:** Create a new note or add text to a note
- **Swap:** Execute other buttons in a row

This isn't everything though, there are so called "Inline Button", which are references to buttons via their Button-ID and which resemble full buttons.

Easier said:

- Create a note with several buttons
- Add those buttons via Button-ID to other notes
- Result: central management of your default buttons
> Button-ID Tip
> Don't forget a blank line after the Button-ID, otherwise your button will be "Undefined"

[And those buttons can even self-destruct.](https://youtu.be/4y9NtHlJvbY?t=98)

## Advantages

- Creation of Buttons via a wizard (Button Maker)
- "Automation" of standard processes
- Simplification of recurring processes

## Disadvantages

- No macro support
- Inline buttons only work in Read Mode
- You can't pass arguments to commands
- Calculate buttons don't have a high value

So how can you use buttons?

## Examples

The simplest way to use buttons is to create them via the Button Maker. You can execute him via the command palette.

![](/img/wix/a64b4a_a5cf1689ecbc4e348cea58585d51fee4~mv2.png)

Button Maker

The button maker isn't that powerful though, but after giving him all the needed information, you can always edit the codeblock he creates.

And this is the second way to create buttons, by creating those codeblocks manually.

I personally normally use copy / paste of already defined buttons, or create the button first with the button maker and alter the result afterwards to my liking.

Let's take a closer look:

### Command Button

```
```button
name Open Previous Daily Note
type command
action Periodic Notes: Open previous daily note
```
```

This button will open yesterday's daily note, if you have the Periodic Notes Plugin installed.

And

```
```button
name Open Previous Daily Note
type command
action Periodic Notes: Open previous daily note
color blue
```
```

gives you the same button in blue.

If you add a **^button-previous** under the codeblock you will have a Button-ID. (later more about this)

### Link Button

```
```button
name To the Forum Batman!
type link
action https://forum.obsidian.md/
```
```

This codeblock will create a button which opens an URL. But "action" in this case can open any URL or URI, so for example also "obsidian://open?vault=Test&file=TestFile"

### Calculate Button

So let's get more complicated. Above examples where quite easy but the calculate button is a different beast.

> Meaning and Purpose
> If you really want to use this kind of button is up to you. I personally don't see any real usage possibilites.

A simple example for starters:

```
```button
name Add Em Up
type calculate
action 2+2
```
```

creates a:

```
Result: 4
```

directly beneath the button.

You can use values from outside the button too:

```
Bananas Have: 5  
Bananas Lost: 5

```button
name How Many Bananas Today?
type calculate
action $1-$2
color yellow
```
```

There is a slight issue with that though.. $1 ist the first row of the note and $2 is the second row of the note.

So if you would like to use this function you need to exactly know in which rows your values are.

The same is true if you would like to use "Natural Language Math" (Only works with english words, see https://github.com/bugwheels94/math-expression-evaluator/blob/master/src/functions.ts).

```
5 dogs plus 2 cats divided by 2 people

```button
name Who Get The Pets?
type calculate
action $1
class sad-button
```
```

class sad-button defines a customized style for the button (later more)

### Swap Button

The swap button is quite interesting. You can define an order for buttons you have defined elsewhere and every time you click on the button the next button is execute. The order resets if you close the note.

So you define the buttons somewhere together with their Button-ID!:

- button-add
- button-meeting
- button-forum

and use them in a Swap Button incl. Button-ID!

```
```button
name Crazy Swap Button
swap [add,meeting,forum]
```
^button-swap
```

And now you can add this Swap Button inline somewhere else

```
`button-swap`
```

> Limitations
> Inline Button normally only work in Reading View, not PreView oder Edit Mode. A workaround would be to use Dynbedded.

### Text & Template

The capabilities of text & template are the same, so I explain them together.

You have the following capabilities:

- Prepend: Prepend text / template in front of the button
- Append: Append text / template after the button
- Add at Line: Add the text / template at a specific line in the note
- New Note: Create a new note based on the text or template

An example for appending text:

```
```button
name Log
type append text
action Text goes here
```
```

and for the template:

```
```button
name Log
type append template
action Hourly Log Template Note
```
```

The template which is being used is called "Hourly Log Template Note".

Add at Line is similar:

```
```button
name Current Weather
type line(1) template
action Weather Template Note
```
```

This will add the "Weather Template Note" template at the first line

And if you want to create a new note you can also use split:

```
```button
name New Meeting
type note(Meeting, split) note
action Meeting Note Template
```
```

This creates a new note (called Meeting) in the area right of your current note.

## Advanced Examples

I already talked about some of the advanced usage examples above. But let's take a closer look. You can use those advanced functions by editing the codeblock or in the Button Maker.

### Remove

### 

Removes the codeblock after execution.

```
remove
```

If you reference the Button-IDs, you can also remove several Buttons from the note.

```
remove [id1, id2]
```

### Replace

### 

While using text or template you can also let the text replace several lines in your note. Again, be careful to correctly specify the correct lines.

```
replace [startLine, endLine]
```

### Inherit

### 

This function allows you to use values from other Buttons. You can also overwrite values in the button itself.

```
id parentButton
```

### 

### Custom Class

As you will see, the colour support is quite limited, and sometimes it just has to be more. So you can use a custom CSS class to style your button. The CSS file with the custom class needs to be in ".obsidian/snippets" and you need to activate it in Apperance/CSS Snippets".

```
class button-red
```

```
.button-purple {

    color: white;

    background-color: rebeccapurple !important;

}

.button-red {

    color: white;

    background-color: coral !important;

}
```

### Color

### 

There are of course also some predefined colurs you can use. Here are the possible colors:

- blue
- red
- green
- yellow
- purple

```
color yellow
```

### 

### Inline Buttons

### 

As already described in the Swap Button part, you can give every button an Button-ID by adding a BlockReference beneath it, e.g. **^button-today**

This button can then be used in other notes via

```
`button-today`
```

if you are in Read Mode.

### Templater

And now to one of the killer features of buttons, in conjunction with the [Templater Plugin](https://github.com/SilentVoid13/Templater).

If you add the line

```
templater true
```

into the button code block you can use templater functions.

From

```
```button
name Make an Hourly Note
type note(<% tp.date.now("HH[_]MM") %>) template
action Log Template Note
templater true
```
```

you will get if you click on the button at 16:20

```
```button
name Make an Hourly Note
type note(16_20) template
action Log Template Note
templater true
```
```

and afterwards it reverts back again

What does the button do, I hear you ask?

It will create a new note based on a template with the name 16\_20.

The template which will be used is "Log Template Note"

As you can see, you can achieve quite some interesting things with this.

## Quircks

As already mentioned Buttons has some quircks:

- After the Button-ID you need an empty line, otherwise the button can not be found.
- Sometimes the buttons will disappear in Edit / PreView mode. In this case it helps to refresh the note or to scroll through the codeblock with the cursor.
- You can spam the button, which leads to strange result:

  - Remove = you remove more then just the button
  - Templater = the templater syntax will be overwritten
- Templater functions are not executed, just try it slowly again (see above)
- If the calculation result is 0 nothing will be displayed

## How do I use Buttons?

I use Buttons on my "Homepage" and also in some of my notes.

My "Homepage" is a workspace with different notes for yesterday, today and Todo. The Buttons on it allow me quick access to certain things and processes I need all the time.

For example:

- Open Daily Note
- Open 5 Year Journal
- Open Dayplanner
- Open a random Zettelkasen Note for review
- Open a random vocabulary note for study
- Create a new Todoist Task
- Open the Privat Todoist project
- Open the Work Todoist project

![](/img/wix/a64b4a_a4cffb2c5b1243f68430a390a3afc40c~mv2.png)

My Obsidian Homepage

I already talked about the Buttons for Todoist in [Obsidian: Todoist](/blog/obsidian-todoist/) if you want examples for the other buttons let me know.

In my repeating meetings I have a button which appends a template below the button with all the necessary entries for the next meeting.

```
```button
name New Running Log Section
type append template
action i_repeatingMeeting
```
```

There are more tips at the end….

## Verdict

Buttons create a way to do things / processes I do again and again in a simple way and without any lengthy detour.

The Button Maker is a great helper and because codeblocks are utilized it is easy to adjust the buttons.

I'm missing some more advanced features like executing "Macros" or Javascript.

## Noteworthy Tidbits

And now some more tips, as promissed.

### Javascript

### 

One way to execute Javascript would be via Templater..

just create a new note with a Template which contains the Javascript.

That doesn't really help if you don't want to create a note though.

### Buttons in a line / Inline Button Tip

Ever tried having several buttons in a line next to each other?

One way would be to use inline buttons and place them on a line.

```
`button-eins` `button-zwei` `button-drei`
```

But this only works in Read Mode 😞

BUT.... if you use Dynbedded you can also use this approach in Preview mode

- Create a note with the buttons
- Add a header, e.g. OneToThree
- Add above line and at least an empty line
- Create a Dynbedded codeblock in your other note

```
```dynbedded
[[40-06 Buttons#OneToThree]]
```
```

Now your inline Buttons are working in Editing / PreView Mode.

One other option would be to use callouts and put the line into the callout, but then you will have the callout around the button.

### Buttons in columns

And here is how I have my buttons on my "Homepage" positioned in columns.

I'm using the Multi-Column Markdown Plugin and create 2 columns. At the beginning is a head, after that the codeblocks for the buttons of every column.

There are some issues though:

- The buttons disappear in Edit mode.. from time to time you can get them displayed if you run the cursor through the codeblocks.
- It wasn't that easy to get the Multi-Column Markdown Plugin to work. I needed to proceed step by step to get to the end result. First copy the example from the plugin page, after that making tiny changes. Just tipping everything from scratch didn't work.

My "Homepage" is completely read only and it works, so the issues above don't bother me anymore.

And if you don't needs Headers and Borders like above you can use the other tip from above.

### Standard Buttons without Inline Buttons

As you have probably noticed Inline Buttons are a little finicky. If you want to use Standard Buttons which you can use all over the place without relying on Inline Buttons I have the following 2 additional tips:

- Dynbedded = Again 😀 . Instead of the example from above you just use a header with the button beneath it.
- Inherit = You just define the button somewhere and then create a new button which inherits most of the necessary information.

I think both approaches have the same effort and result. I also think though that it gives some more ideas about using Buttons.

## Conclusion

I don't want to miss Buttons, it makes a lot of things easier and faster.

There are some posts in the forums and also some example vaults which use buttons. But I haven't found some really cool tricks, perhaps you know some?

## Fussnote

- [The Movie to the Post](https://youtu.be/mj0zGgNbpfQ)
- [Todoist](https://doist.grsm.io/1wx938b4rtun)
- [Obsidian: Dynbedded](/en/blog/obsidian-dynbedded/)
- [Obsidian: Todoist](/en/blog/obsidian-todoist-1/)
- [Natural Language Math](https://github.com/bugwheels94/math-expression-evaluator)
- 40-06
