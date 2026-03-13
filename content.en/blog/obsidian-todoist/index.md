---
title: "Obsidian: Todoist"
date: 2022-12-12T11:50:37.593Z
lastmod: 2022-12-14T16:56:57.084Z
description: "The Todoist Sync Plugin for Obsidian has 2 functions:
- Displaying of Tasks
- Creation of  Tasks"
slug: "obsidian-todoist"
translationKey: "obsidian-todoist"
categories: ["obsidian"]
tags: []
images: ["/img/wix/a64b4a_ace49eb54f404fb48eb1b6da3249a69d~mv2.png"]
draft: false
---
Hello and welcome,

let's do a full review of an Obsidian plugin again, let's take a look at [Todoist Sync Plugin](https://github.com/jamiebrynes7/obsidian-todoist-plugin). There are more plugins to integrate with Todoist for Obsidian and I will cover them briefly at the end.

But before we start with Todoist a quick update about [Better Word Count](https://github.com/lukeleppan/better-word-count). Better Word Count got updated and now covers all functions which are described on the webpage. There are more functions to come and I will create a new video when that happens.

Back to Todoist:

I'm using the Todoist Sync Plugin as it displays all of my ToDos at one place. The privat and the work related ones.

The [Tasks Plugin](https://github.com/obsidian-tasks-group/obsidian-tasks) is being used by myself in Obsidian for ToDos which relate mostly only to Obsidian specific things and processes. I will talk about the differences later.

Let's take a quick look at [Todoist](https://doist.grsm.io/1wx938b4rtun) first and after that we cover the plugin.

## Todoist Overview

Todoist is a typical getting things done app with some small but quite neat features.

- QuickAdd incl. naturallanguage Dates
![](/img/wix/a64b4a_1b07bb182838465b8a7161a7a5045a7e~mv2.png)

Todoist QuickAdd

- Templates - Examples for specific processes, with tasks and sub-tasks
- Collaboration - Sharing or assigning tasks to other people
- Team Support - more functions for teams
- Different views for the tasks incl. Kanban Style
![](/img/wix/a64b4a_77f99d82e7264060bdb521796016108e~mv2.png)

Todoist Kanban Style View

- Email Integration
- Integration with a lot of other apps

The free version should cover most needs. The major restriction for me at the moment is the limit of 5 projects.

![](/img/wix/a64b4a_a11c719b93c840d081e28d9684b024a1~mv2.png)

Todoist 5 Projects

The integrations are a key point for me, as I'm using Fantastical, Spark and Outlook. And all of them work quite well with Todoist.

I also like the templates, I'm not using them in Todoist though. I use them as a start of point for Obsidian.

But let's take a look at the thing you are really here for, the Todoist Sync Plugin for Obsidian.

## Overview Todoist Sync Plugin

The Todoist Sync plugin has 2 functionalities:

- Displaying of Tasks
- Creation of Tasks

### Displaying of Tasks

You display tasks with the help of a codeblock:

```
```todoist
{
"name": "All Tasks",
"filter": "today | overdue"
}
```
```

You can modify this one quite a lot:

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| Name | Required | Description | Type | Default |
| name | X | The title for the materialized query. You can use the `{task\_count}` template which will be replaced by the number of tasks returned by the query. | string | ​ |
| filter | X | A valid [Todoist Filter](https://get.todoist.help/hc/en-us/articles/205248842-Filters) | string | ​ |
| autorefresh | ​ | Number of seconds between auto-refreshing. If omitted, the query use the default global settings. | number | null |
| sorting | ​ | Describes how to order the task in the query. Can be any of 'priority','dateAscending' (alias of 'date'), 'dateDescending', or multiple of these | string[] | [] |
| group | ​ | Denotes wether this query should have its task grouped by project & section. | bool | false |

The most important part here is the filter though. This one defines which tasks will be shown by the codeblock.

As an example: Let's say you want to show only tasks which are valid today or overdue from your Privat project and which don't have the label Obsidian your filter would look like:

```
"filter": "(today | overdue) & #Privat & !@Obsidian"
```

As you can see, the syntax being used here is the same syntax Todoist is using directly in their app.

### Creation of Tasks

If you want to create tasks directly out of Obsidian you have two commands:

- Create a task with the selected text
- Create a task with a link to the note.

At the moment the command "Create a task with the selected text" doesn't work correctly, the selected text will not be copied into the task.

You shouldn't press Enter too quickly, this will create the task.

![](/img/wix/a64b4a_7a34bbae50b44991bcdeb3fea3586168~mv2.png)

Todoist Sync: Create Task

### Pros

- Good integration with Obsidian with dynamic updates and the capability to complete tasks
- Capability to create tasks incl. link to the note.

### Cons

- Selected text will not transferred into the task (Bug)
- API queries sometimes not work
- Could use an update
- Doesn't support [Obsidian Advanced URI](https://github.com/Vinzent03/obsidian-advanced-uri)

### Todoist API Token

You can get the Todoist API token via [**https://todoist.com/prefs/integrations**](https://todoist.com/prefs/integrations)

![](/img/wix/a64b4a_f816e82c1de44e0f8caa87253c66c094~mv2.png)

This link and the link to the filters can be found on plugin web site, or here. 😀

Make sure you don't distribute **.obsidian/todoist-token** if you share your vault.

## Bonus Tip

As we are talking about how to use Todoist with Obsidian let's take a look at a different approach. You can use [Buttons](https://github.com/shabegom/buttons) to directly access the Todoist App.

For example you can create a new task:

```
```button
name Create New Todoist Task
type link
class obsidian-button
action todoist://addtask
```
```

Or you can open a specific project:

```
```button
name Open Todoist Privat Project
type link
class obsidian-button
action todoist://project?id=2303822263
```
```

The project ID which is needed for this can be found via the Todoist webpage. After selecting a project the project ID is in the URL.

![](/img/wix/a64b4a_3e022847b6d545c2879b074b8275d449~mv2.png)  

More information for the "commands" you need can be found in [Mobile URL Schemes](https://developer.todoist.com/guides/#mobile-app-url-schemes:~:text=Colors-,Mobile%20app%20URL%20schemes,-Marketing%20your%20app).

Those also work on the Mac.

## Todoist or Tasks

When do I use Todoist and when do I use Tasks?

I normally use Tasks for things I can also process in Obsidian. For example inside a daily note as a reminder to do something specific at that part of the note.

Or in meeting notes as reminders to do something specific. Sometimes I transfer those tasks over to Todoist afterwards and close the task of in Obsidian.

Todoist is being used for the things which can not be done completely in Obsidian. Changing of tires, reoccurring tasks, etc. Sometime I also use it as an entry into Obsidian with a link to a specific note.

But there is no drawn line in the ground. Everything is fluid.

## Verdict

The plugin does everything I need. I don't assign tasks to different people and the functions it has are sufficient. I thought about included the completed tasks in my daily notes but they are already fully packed and I can't really see the benefit of it.

From time to time you will get an error and no tasks show up, this is normally because too many requests are done to the Todoist API. They will go away soon and in the worst case scenario there is always the Todoist App in this case.

I normally use the app to create tasks on the fly, I don't like to fiddle around with Obsidian and Tasks on my mobile, it creates too much friction.

If there is something in relation to Obsidian I try to create the task from within Obsidian with the link to the note.

## Noteworthy Tidbits

As already said there are other Todoist Plugins around, but I don't use them. I use [Templater](https://github.com/SilentVoid13/Templater) to automate as much as possible and shy away from using commands or Buttons (There are exceptions to the rule like always). Leave me a comment if I should take a look at them.

- <https://github.com/dennisseidel/obsidian-todoist-link> (Uses notes as projects and lines in the notes as tasks)
- <https://github.com/wesmoncrief/obsidian-todoist-text> (A markdown approach, uses commands and markers in the note)
- <https://github.com/Ledaryy/obsidian-todoist-completed-tasks> (Adds completed tasks to a note between some markers and requires a command)
- <https://github.com/Ellpeck/ObsidianCustomFrames> (Allows the integration of the Todoist Webapp into the note.)

## Conclussion

## 

For the plugin and Todoist fits my processes. The Tasks plugin covers different areas and is also being used by myself.

I don't think that I will ever do my complete Task Management in Obsidian. First of is the "issue" with using Obsidian and Tasks on the phone. Todoist is far better in this area.

How do you do your task management? Do you use Todoist, Obsidian or something else?

Let me know in the comments.

## Footnote

- [The Movie to the Post](https://youtu.be/i4K4oVycfm8)
- [My Youtube Video Vault](https://github.com/MMoMM-org/obsidian-youtube-vault)
- 40-04
- `#Tasks`
- `#Templater`
- `#Buttons`
