---
title: "Obsidian: Die in der alles besser ist"
date: 2022-11-27T20:01:02.170Z
lastmod: 2022-11-27T20:01:02.170Z
description: "Obsidian Plugins mit Better im Namen:
- Better Code Block
- Better Word Count
- Better File Link
- Better Inline Fields"
slug: "obsidian-die-in-der-alles-besser-ist"
translationKey: "obsidian-the-better-one"
categories: ["obsidian"]
tags: []
images: ["/img/wix/a64b4a_f6a4c34ff22b40deae811e0f60987d3f~mv2.png"]
draft: false
---
Hallo und Willkommen,

Heute möchte ich euch ein paar kleinere Plugins vorstellen die alle das Wort "Better" im Namen haben. Leider sind ein paar diese Plugins nicht aktiv in der Entwicklung aber sie funktionieren und haben keine großen Probleme (wenigstens ich habe keine).

Ich gehe hierbei davon aus, dass ihr euch in Obsidian einigermaßen auskennt und auch wisst wie man Community Plugins installiert. Lasst gerne Kommentare da, wenn ihr dazu Fragen habt.

Fangen wir mit Better CodeBlock an

## Better CodeBlock

Geschrieben wurde das [Plugin von Stargrey](https://github.com/stargrey/obsidian-better-codeblock), momentan wird es leider nicht gepflegt.

Es ist für die Coder unter uns, die ein wenig mehr "Style" wollen oder für Leute die ihren Obsidian Vault publishen.

Die Funktionalität des Plugins ist leider nicht im Preview / Editing Modus verfügbar.

Ansonsten hat es ganz nette Features:

- Angepasste Titel für Codeblocks
- Hervorheben von Code-Zeilen
- Verkleinern des Codeblocks
![](/img/wix/a64b4a_5fc1a5f8414c4601988b0dd0db5fc975~mv2.jpg)

Better Code Block - Edit Ansicht

Die zusätzlichen Funktionen können ganz einfach über entsprechende Elemente in der ersten Zeile eines Codeblockes (dort wo normalerweise auch die "Sprache" steht) benutzt werden:

- TI: "Mein Titel" - gibt dem Codeblock einen eigenen Titel (funktioniert leider nicht bei mir)
- HL:"3, 5-8" - hebt die Zeilen 3 und 5 bis 8 hervor
- "FOLD" - verkleinert den Codeblock
![](/img/wix/a64b4a_7af78bfcd64948e2934175fe8ed0a220~mv2.jpg)

Better Code Block - Lese Ansicht

Ab und zu müßt ihr die Notiz aufmachen und zumachen damit Änderungen sichtbar werden.

![](/img/wix/a64b4a_a40861b953c94e1abc9eb92ed519d854~mv2.jpg)

Better Code Blog - Lese Ansicht - Ausgeklappt

Ein weiteres Plugin aus der Kategorie "Funktioniert, ist aber nicht gepflegt".

## Better Word Count

Geschrieben von [Luke Leppan hatte Better Word Count](https://github.com/lukeleppan/better-word-count) einmal viele zusätzliche Features im Vergleich zum Core WordCount Plugin.

Leider ist seit dem Wechsel bei Obsidian auf den neuen Editor nur eine Funktion über geblieben.

Better Word Count zeigt euch nicht nur die Anzahl der Wörter und Buchstaben der Notiz an sondern erlaubt euch auch einen Text zu markieren und zeigt dann nur die Anzahl der Wörter und Buchstaben des markierten Textes an.

Das hilft wenn man wissen will wieviel Text man wirklich geschrieben hat und wieviel "Verpackung" in Form von Frontmatter etc drin steckt.

![](/img/wix/a64b4a_02a0bc53232c4a359507eaa3a99be28d~mv2.png)

Better Word Count

Verlassen wir nun den Bereich der Plugins deren Leben und Zukunft ungewiss ist.

## Better File Link

[Marc Julian Schwarz arbeitet an diesem Plugin](https://github.com/marcjulianschwarz/obsidian-file-link) was einen erlaubt über einen einfachen Dialog den man über die Command Palette aufrufen kann Dateien oder Verzeichnisse als Links in eine Notiz einzubinden. (Was für ein Bandwurmsatz 🐛)

Leider kann man nicht direkt ein Verzeichnis auswählen, sondern immer nur ein File in einem Verzeichnis und dann den Link auf das Verzeichnis setzen.

Ansonsten sind die Funktionen genau die die ich gesucht habe. Anstelle von Dateien mit Drag und Drop in meine Notiz ziehen zu müssen und dann die Dinge manuell "konfigurieren" zu müssen kann ich jetzt einen "normalen Datei Dialog" nutzen.

![](/img/wix/a64b4a_bee2a5e1ffdb4348bc8e8c94406a1733~mv2.png)

Better File Link

Für Leute die nicht dauern die Command Palette nutzen möchten kann man natürlich einen Hotkey konfigurieren.

Den Standard kann man auch in der Konfiguration festlegen und dort auch ändern wie eine Liste von Dateien aussieht. Dabei sollte man sich nicht verwirren lassen.

![](/img/wix/a64b4a_5880f412cba94d7eb267f40d06727637~mv2.png)

Better File Link Settings

Dort ist zwar Standardmäßig ein **-** drin, aber das ist nur ein Vorschlag und der wird nicht genutzt. Man muss es also noch konfigurieren.

![](/img/wix/a64b4a_8033c966acd74f998913785f37058216~mv2.png)

Better File Link - File List

Und das letzte Plugin in der Liste ist ein kleiner Helfer für `#Dataview`

## Better Inline Fields

Geschrieben von [David Šarman ist das Plugin](https://github.com/dsarman/better-inline-fields) ein kleiner Helfer für `#Dataview` Inline Datafields.

Ich nutze es eigentlich nur für die Möglichkeit Boolean Datafields wie einen Task zu nutzen.

![](/img/wix/a64b4a_135df032e9d049c9b8e2f549275e188c~mv2.png)

Better Inline Field - Checkboxen

Aber eine andere Funktion ist für bestimmte Felder Notizen vorgeschlagen zu bekommen ohne immer [[ ]] tippen zu müssen und dabei auf ein bestimmtes Verzeichnis beschränkt zu sein (Das muss man in der Konfiguration definieren).

![](/img/wix/a64b4a_e88d7ecce0e24dd38257ac780e556f44~mv2.png)

Better Inline Field - Note Suggester

![](/img/wix/a64b4a_34dd667914d440528f6b3d6e30aaab58~mv2.png)

Better Inline Fields - Notiz

Es arbeitet nicht zusammen mit dem [Various Complements Plugin](https://tadashi-aikawa.github.io/docs-obsidian-various-complements-plugin/).

Und wenn man mehr "Funktionen" für die Inline Datafield möchte, ist man mit dem [Metadata Menu (Plugin)](https://github.com/mdelobelle/metadatamenu) besser bedient, das hat aber nicht die Funktionalität der "Checkboxen"

## Urteil

Was haltet ihr von den Plugins? Kleine aber recht interessante Plugins die jedes eine kleine Nische füllt und das Arbeiten mit Obsidian vereinfachen.

Leider sind ein paar der Plugins nicht mehr so aktive gepflegt. Das hat jetzt nicht zu sagen das die Plugins nicht nutzbar sind. Aber man sollte sich natürlich immer fragen ob man einen seiner Prozesse auf Plugins aufbauen will die schon lange Bugs haben die nicht gefixt worden sind oder andere Probleme.

Manchmal haben die Entwickler einfach keine Zeit für ihre "Hobbies" und manchmal haben sie ihr Interesse verloren.

Im Endeffekt bleibt es euere Entscheidung ob ihr Community Plugins nutzen wollt. Ich bin der Meinung sie Erleichtern viele Prozesse und sind es wirklich Wert genauer betrachtet zu werden.

## Fazit

Was haltet ihr vom Thema Plugin Support? Ist es euch egal wenn Plugins über lange Zeit Fehler haben oder nicht gepflegt werden? Kennt ihr Alternativen?

Lasst mich euere Meinung wissen. Nicht nur über die Plugins, und Plugin Support sondern auch über meinen Content.

## Fußnote

- [Das Video zum Post](https://youtu.be/Yy65xdjHOBQ)
- 40-03
