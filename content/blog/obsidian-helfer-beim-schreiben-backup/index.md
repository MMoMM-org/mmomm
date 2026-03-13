---
title: "Obsidian: Helfer beim Schreiben + Backup"
date: 2022-11-13T22:37:01.488Z
lastmod: 2022-11-13T22:37:01.488Z
description: "Kleine Obsidian Helfer: Editing Toolbar, Emoji Toolbar, Icon Shortcodes, Frontmatter Tag Suggest und Aut-O-Backups"
slug: "obsidian-helfer-beim-schreiben-backup"
translationKey: "obsidian-helpers-backup"
categories: ["obsidian"]
tags: []
images: ["/img/wix/a64b4a_82f507cfa3a54e7785a7e678803e8fbf~mv2.png"]
draft: false
---
Hallo und Willkommen,

Heute möchte ich euch ein paar kleinere Plugins vorstellen die aber das Leben leichter machen. Aus dem Bereich Editing:

- Editing Toolbar
- Emoji Toolbar
- Icon Shortcodes
- Frontmatter Tag Suggest

Und dann eine Datensicherungslösung

- Aut-O-Backups

Ich gehe hierbei davon aus, dass ihr euch in Obsidian einigermaßen auskennt und auch wisst wie man Community Plugins installiert. Lasst gerne Kommentare da, wenn ihr dazu Fragen habt.

Fangen wir mit Aut-O-Backups an:

## Aut-O-Backups

Geschrieben wurde das [Plugin von Ryan McQuen](https://github.com/ryanpcmcquen/obsidian-dropbox-backups) und es ist eigentlich recht einfach. Das ist sowohl ein Vorteil wie auch ein Nachteil.

Das Plugin macht nach der Einrichtung automatisch alle 20 Minuten eine Datensicherung in einen Dropbox Account. Und das ist es.

Es macht keine Bereinigung der alten Daten und ihr könnt auch keine Daten aus Obsidian wieder herstellen. Außerdem solltet ihr falls ihr euren Vault irgendwie verteilt sicherstellen, das ihr die **.\_\_dropbox\_backups\_token\_store\_\_** Datei aus dem **obsidian-dropbox-backup** Verzeichnis löscht. Da sind nämlich die Token für die Authentifizierung drin. (Anmerkung: Das ist nicht wirklich ein Problem den irgendwo muss man ja die Authentifizierung speichern.)

![Dropbox Token Store](/img/wix/a64b4a_fb4a81c780b84c25a4223b20eb96fb5a~mv2.png)

Dropbox Token Store

Da man am besten den Bereich /Apps/Obsidian Backups aus seinem Dropbox Sync rausnimmt bedeutet dies, das ihr die Weboberfläche benutzen müsst, um eine bestimmte Datei wiederherzustellen.

![Aut-O-Backups in Dropbox](/img/wix/a64b4a_725136adfa5e470e90863763fa8d1ea1~mv2.png)

Aut-O-Backups in Dropbox

Aber es hat mir schon ein paar mal den A\* gerettet, wie man so schön sagt. Und es arbeitet ohne Probleme.

Als Nächstes auf der Liste:

## Frontmatter Tag Suggest

Geschrieben wurde das [Plugin von Jonathan Miller](https://github.com/jmilldotdev/obsidian-frontmatter-tag-suggest) und nach der Installation macht es direkt das, was es soll.

Wenn ihr nun im Frontmatter in einer tags: oder tag: Zeile anfängt zu schreiben, schlägt euch das Plugin Tags vor.

![Frontmatter Tag Suggest](/img/wix/a64b4a_cf9ba5ec014e4a439e39de43fa9ddfba~mv2.png)

Frontmatter Tag Suggest

Ab und zu will es nicht richtig, dann hilft es meistens erstmal Space zu drücken und dann loszulegen.

Und das nächste Plugin auf der Liste, die wir von hinten nach vorne abarbeiten:

## Icon Shortcodes

Geschrieben von [aidenlx erlaubt das Icon Shortcodes Plugin](https://github.com/aidenlx/obsidian-icon-shortcodes) während des Schreibens Icons / Emojis einzufügen. Dabei werden GitHub favored emoji shortcodes unterstützt ... die kann man sich hier anschauen: [Emoji Cheat Sheet](https://github.com/ikatyang/emoji-cheat-sheet/blob/master/README.md)

Neben den Standard Emojis kann man noch zusätzliche Emojis einbinden und sogar eigene erstellen. Man sollte aber bedenken dass, wenn man mehr Emojis einbindet, die Ladezeiten steigen.

Standardmäßig startet die Icon / Emoji Suche nach einem **:** (Doppelpunkt), ich würde die Konfiguration aber so abändern das man erst ein SPACE vor dem **:** hat, sonst triggered der Shortcut laufend.

![Icon Shortcodes](/img/wix/a64b4a_dc5e412ec41746d98b31b0ad80c74814~mv2.png)

Icon Shortcodes

Eins kann das Plugin aber nicht, wirklich einfach nach Emojis suchen, ich finde es auf jeden Fall recht schwierig wenn ich das entsprechende Suchwort nicht kenne.

Da nutze ich dann doch lieber

## Emoji Toolbar

[geschrieben von Oliver Yerbury-Hodgson.](https://github.com/oliveryh/obsidian-emoji-toolbar) Hier kann man zwar keine anderen Icons / Emojis einbinden dafür gibt es aber die Möglichkeit sich alle Icons / Emojis anzuschauen. Zusätzlich gibt es auch noch einen kleinen Trick, da komme ich aber später noch einmal drauf zurück.

Aktiviert wird der Emoji Toolbar über die Command Palette oder einen HotKey, danach sucht man entweder wie bei Icon Shortcode mit Hilfe von Wörten oder man scrollt durch die Emojis durch.

![Emoji Toolbar](/img/wix/a64b4a_82f507cfa3a54e7785a7e678803e8fbf~mv2.png)

Emoji Toolbar

Und last but no least

## Editing Toolbar

Geschrieben wurde das [Plugin von Cuman](https://github.com/cumany/obsidian-editing-toolbar) und es basiert auf dem alten cMenu Plugin. Aber es wurde massiv verbessert.

![](/img/wix/a64b4a_d5fd81c2d7af48b598bbaf04a3197a6f~mv2.png)

Es unterstützt nicht nur die anfänglichen paar Markdown und HTML Formatierungen sondern jetzt auch Untermenus und Farben direkt ohne Konfiguration und ist nicht mehr ein Modal, was über dem Text schwebt, sondern ein Toolbar.

![](/img/wix/a64b4a_5cd6adc0cdf9433b874a314a1f9e552e~mv2.png)

Es kann um Befehle erweitertet werden, deswegen kann man sehr einfach Templates von Templater oder die Standard Templates via [Hotkeys for Templates](https://github.com/Vinzent03/obsidian-hotkeys-for-templates) einbinden.

Natürlich geht das auch mit dem Emoji Toolbar (der kleine Trick von eben), aber leider werden dann aktuell keine Emojis eingefügt. Cuman hat dies aber als Demo auf seinem GitHub, allerdings auch mit der Anmerkung das im Blue Topaz Vault die Plugins wären und diese Bugfixes hätten.

Er hat diesen Bugfix aber an Oliver Yerbury-Hodgson weiter gegeben, mal schauen wann das Update kommt.

## Urteil

Was haltet ihr von den Plugins? Kleine aber recht interessante Plugins die das Arbeiten für den normalen Benutzer mit Obsidian vereinfachen.

Und eine Datensicherung ist ein MUSS für Obsidian, für mich passt da Aut-O-Backups einfach.

## Erwähnenswerte Kleinigkeiten

Eine sehr gute Erklärung über Markdown, aktuell nur in Englisch, ich werde mal schauen wie schnell ich eine deutsche Version hinbekomme:

A quick reference to the Markdown syntax.

[The Markdown Guide](https://www.markdownguide.org/cheat-sheet/)

## Fazit

Wie macht ihr euere Datensicherung? Benutzt ihr lieber kleine Plugins oder Swiss Army Knives? Hier gibt es natürlich auch wieder verschiedene Meinungen , aber das ist ein anderes Thema.

Lasst mich euere Meinung wissen. Nicht nur über die Plugins, Datensicherung und Schweizer Taschenmesser sondern auch über meinen Content.

## Fußnote

- [Der Film zum Artikel](https://youtu.be/IUB9wWnGB2M)
- [Mein Youtube Video Vault](https://github.com/MMoMM-org/obsidian-youtube-vault)
- 40-02
