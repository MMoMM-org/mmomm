---
title: "Obsidian: Buttons"
date: 2023-02-01T17:00:15.933Z
lastmod: 2023-02-01T17:00:15.933Z
description: "Obsidian Automatisierung mit Buttons"
slug: "obsidian-buttons"
translationKey: "obsidian-buttons"
categories: ["obsidian"]
tags: []
images: ["/img/wix/a64b4a_884b8f7f8447421c9bb2a544b996724a~mv2.png"]
draft: false
---
Hallo und Willkommen,

heute schauen wir uns mal ein Plugin an das ein wenig mehr Tiefe hat, das [Buttons Plugin](https://github.com/shabegom/buttons).

Im Gegensatz zu den bisherigen Plugins, ist Buttons schon ein wenig komplexer und erlaubt es uns Schaltflächen in unsere Notizen einzubauen, die immer wiederkehrende Dinge vereinfachen.

Und zusammen mit anderen Plugins, wie [Multi-Column Markdown Plugin](https://github.com/ckRobinson/multi-column-markdown) oder [Dynbedded](https://github.com/MMoMM-org/obsidian-dynbedded), kann man die Darstellung verändern oder die Leistungsfähigkeit noch vergrößern

![](/img/wix/a64b4a_a4cffb2c5b1243f68430a390a3afc40c~mv2.png)

Meine Obsidian Homepage

## Übersicht

Buttons können:

- **Command:** Befehle ausführen
- **Link:** Einen Link (URL oder URI) öffnen
- **Calculate:** Rechnen
- **Template:** Mit Hilfe eines Templates, eine Notiz erstellen oder Text einer bestehenden Notiz hinzufügen
- **Text:** Text einer bestehenden Notiz hinzufügen oder eine Notiz mit einem festen Text erstellen
- **Swap:** Andere Buttons aufrufen

Aber das ist noch nicht alles, es gibt so genannte "Inline Buttons", das sind Buttons die über eine Button-ID verknüpft werden. Einfacher gesagt:

- Man erstellt eine Notiz mit verschiedenen Buttons
- Man fügt die Button-ID in andere Notizen ein
- Ergebnis: Zentrale Verwaltung von Standard Buttons
> Button-ID Tipp
> Vergeßt nicht nach einer Button-ID eine Leerzeile zu haben, ansonsten ist der Button nachher "Undefined"

[Außerdem können sich die Buttons nach der Benutzung in Luft auflösen.](https://www.youtube.com/watch?v=e6zrnv_u05o)

## Vorteile

- Erstellung von einfachen Buttons über einen Wizard (Button Maker)
- "Automatisierung" von Standard Prozessen
- Vereinfachung von regelmäßig wiederkehrenden Prozessen

## Nachteile

- Keine Macros
- Inline Buttons funktionieren nur im View Modus
- Es können keine Parameter an Befehle weitergegeben werden
- Calculate Button haben geringen Nutzen

Und wie kann man jetzt Buttons nutzen?

## Nutzungsbeispiele

Die einfachste Möglichkeit Buttons zu nutzen ist via dem Button Maker. Dieser kann über die Command Palette aufgerufen werden.

![](/img/wix/a64b4a_1bb9dc091bea4a238626f565d43c0ef6~mv2.png)

Button Maker

Allerdings ist man mit dem Button Maker nicht besonders flexibel, aber nachdem man die Abfragen ausgefüllt hat, erstellt er einen CodeBlock, den man ja anpassen kann.

Und das ist dann auch schon die zweite Möglichkeit Buttons zu erstellen, indem man die Codeblocks direkt manuell erstellt.

Ich nutze entweder copy / paste von bestehenden Buttons oder erstelle zuerst den Button mit dem Button Maker und passe dann das Ergebnis an.

Schauen wir uns doch mal die einzelnen Möglichkeiten genauer an:

### Command Button

```
```button
name Open Previous Daily Note
type command
action Periodic Notes: Open previous daily note
```
```

Dieser Button öffnet die tägliche Notiz von gestern, wenn man das Periodic Notes Plugin installiert hat.

Und

```
```button
name Open Previous Daily Note
type command
action Periodic Notes: Open previous daily note
color blue
```
```

macht den Button blau.

Hängt man ein **^button-previous** unter den Codeblock hat man jetzt auch noch eine Button-ID. (Mehr dazu später)

### Link Button

```
```button
name To the Forum Batman!
type link
action https://forum.obsidian.md/
```
```

Dieser Codeblock erzeugt einen Button der eine URL öffnet. Aber im Endeffekt kann die "action" jede beliebige URL oder URI aufrufen, also auch z.B. "obsidian://open?vault=Test&file=TestFile"

### Calculate Button

Und nun wird es ein wenig komplizierter. Die Beispiele oben waren ja noch recht einfach, aber der Calculate Button hat es in sich.

> Sinn und Zweck
> Ob ihr diesen Button wirklich nutzen könnt oder wollt mußt ihr selbst entscheiden, ich persönlich sehe nicht wirklich eine Nutzungsmöglichkeit für mich.

Zuerst einmal ein einfaches Beispiel:

```
```button
name Add Em Up
type calculate
action 2+2
```
```

erzeugt ein:

```
Result: 4
```

direkt unter dem Button.

Man kann aber auch Werte ausserhalb des Buttons nutzen:

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

Da gibt es aber ein Problem... $1 ist die erste Zeile der Notiz und $2 ist die zweite Zeile der Notiz.

Wenn ihr diese Funktion also nutzen wollt müßt ihr genau wissen in welcher Zeile euere Werte stehen.

Dieselbe Einschränkung gibt es auch falls ihr "Natural Language Math" (Geht nur mit englischen "Funktionen", siehe https://github.com/bugwheels94/math-expression-evaluator/blob/master/src/functions.ts) nutzen wollt.

```
5 dogs plus 2 cats divided by 2 people

```button
name Who Get The Pets?
type calculate
action $1
class sad-button
```
```

class sad-button definiert hier übrigens einen Custom Style für den Button. (Später mehr darüber)

### Swap Button

Der Swap Button ist recht interessant, er ermöglicht es euch Buttons die ihr irgendwo definiert habt, in einer bestimmten Reihenfolge auszuführen. Jeder Button Click führt den nächsten Button aus. Die Reihenfolge wird zurück gesetzt wenn ihr die Notiz schließt.

Ihr definiert also irgendwo die Buttons inkl. Button-ID!:

- button-add
- button-meeting
- button-forum

und dann irgendwo den Swap Button inkl. Button-ID!

```
```button
name Crazy Swap Button
swap [add,meeting,forum]
```
^button-swap
```

Und dann könnt ihr diesen Swap Button irgendwo als Inline Button einfügen:

```
`button-swap`
```

> Einschränkungen
> Inline Button funktionieren normalerweise nur im Lese Modus, nicht im Preview / Edit Modus. Ein Workaround wäre Dynbedded zu nutzen.

### Text & Template

Die Möglichkeiten für Text und Template Buttons sind die gleichen, also fasse ich diese hier zusammen.

Euch stehen die folgenden Möglichkeiten zur Verfügung:

- Prepend: Fügt vor dem Button den Text / das Template ein
- Append: Fügt nach dem Button den Text / das Template ein
- Add at Line: Fügt an einer bestimmten Stelle den Text / das Template ein
- New Note: Erstellt eine neue Notiz mit dem Inhalt des Textes / Templates.

Hier mal das Beispiel für Append für Text:

```
```button
name Log
type append text
action Text goes here
```
```

und für Template:

```
```button
name Log
type append template
action Hourly Log Template Note
```
```

Das Template welches benutzt wird heißt "Hourly Log Template Note".

Add at Line ist ähnlich:

```
```button
name Current Weather
type line(1) template
action Weather Template Note
```
```

Hier wird in der ersten Zeile das "Weather Template Note" eingefügt.

Und bei der neuen Notiz gibt es den Parameter split:

```
```button
name New Meeting
type note(Meeting, split) note
action Meeting Note Template
```
```

Dieses erzeugt die neue Notiz in einem neuen Bereich rechts von der Notiz.

## Erweiterte Nutzungsbeispiele

Ein paar der erweiterten Funktionen sind oben schon erwähnt. Aber schauen wir uns diese mal genauer an. Ihr könnt diese erweiterten Funktionen nutzen, indem ihr einfach eine entsprechende Zeile dem CodeBlock hinzufügt.

### Remove

### 

Löscht den Button nach Ausführung.

```
remove
```

Durch Angabe der Button-IDs können auch mehrere Buttons in der Notiz gelöscht werden.

```
remove [id1, id2]
```

### Replace

### 

Bei Text und Template Buttons könnt ihr auch bestimmte Zeilen in der Notiz ersetzen lassen, auch hier müßt ihr wieder aufpassen die richtigen Zeilen zu benutzten.

```
replace [StartZeile, EndZeile]
```

### Inherit

### 

Diese Funktion ermöglicht es euch Werte aus einem anderen Button in diesem Button zu nutzen. In dem Button können die Werte des anderen Button auch überschrieben werden.

```
id parentButton
```

### Custom Class

Hiermit könnt ihr eine bestimmte angepasste CSS class nutzen, um das Aussehen des Buttons zu definieren. Die CSS Datei muss sich dazu in ".obsidian/snippets" befinden und

unter "Apperance/CSS Snippets" aktiviert sein.

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

Hiermit könnt ihr eine vordefinierte Farbe für die Buttons verwenden, mögliche Farben sind:

- blue
- red
- green
- yellow
- purple

```
color yellow
```

### Inline Buttons

### 

Wie bereits beim Swap Button beschrieben, ihr könnt jeden Button eine Button-ID geben, in dem ihr nach dem CodeBlock eine BlockReference angibt, e.g. **^button-today**

Diesen Button könnt ihr dann in anderen Notizen via

```
`button-today`
```

nutzen, wenn ihr euch in der View Ansicht befindet.

### Templater

Und das ist eins der Killer Features von Buttons zusammen mit dem [Templater Plugin](https://github.com/SilentVoid13/Templater).

Wenn ihr die Zeile

```
templater true
```

in einen Button einfügt, könnt ihr Templater Funktionen nutzen.

Aus

```
```button
name Make an Hourly Note
type note(<% tp.date.now("HH[_]MM") %>) template
action Log Template Note
templater true
```
```

wird dann um 16:20 wenn ihr drauf clicked

```
```button
name Make an Hourly Note
type note(16_20) template
action Log Template Note
templater true
```
```

und nach dem Click ist er wieder wie er vorher war.

Was macht dieser Button?

Er erstellt eine neue Notiz basierend auf einem Template mit dem Namen 16\_20

Das Template welches hierfür benutzt wird heißt "Log Template Note"

Wie ihr sehen könnt, kann man damit ein paar nette Dinge erreichen.

## Macken

Wie schon oben besprochen hat Buttons ein paar Macken

- Nach der Button-ID solltet ihr immer eine Leerzeile haben, sonst werden die Button nachher nicht gefunden.
- Im Edit / PreView Modus verschwinden die Buttons manchmal, dann muss man entweder die Notiz refreshen oder den Cursor durch den Codeblock bewegen
- Ihr könnt Buttons spammen, das kann zu komischen Effekten führen:

  - Remove = es wird mehr als der Button entfernt
  - Templater = die Templater Syntax wird überschrieben
- Templater Funktionen werden teilweise nicht ausgeführt, einfach in Ruhe noch mal probieren (siehe auch spammen 😀 )
- Falls das Ergebnis einer Rechnung Null ist wird nichts ausgegeben.

## Wie nutze ich Buttons?

Ich nutze Buttons sowohl auf meiner "Homepage" wie auch in einigen meiner Notizen.

Meine "Homepage" ist ein Workspace mit verschiedenen Notizen für Gestern, Heute, Todo und die Buttons darauf erlauben mir einen einfachen Zugriff auf Dinge die ich immer wieder tue. Das sind z.B.

- Öffnen der Tagesnotiz
- Öffnen des 5 Jahres Journals
- Öffnen des Tagesplanners
- Öffnen einer zufälligen Zettelkasten Notiz
- Einen neuen Todoist Task erstellen
- Öffnen des Privaten Todoist Projekts
- Öffnen des Todoist Projekts für die Arbeit

![](/img/wix/a64b4a_a4cffb2c5b1243f68430a390a3afc40c~mv2.png)

Meine Obsidian Homepage

Die Todoist Buttons habe ich ja schon in [Obsidian: Todoist](/blog/obsidian-todoist/) besprochen, wenn ihr die anderen Buttons als Beispiele haben möchtet last es mich wissen.

In meinen wiederkehrenden Meetings habe ich z.B. einen Button der ein Template in die Notiz einfügt mit den notwendigen Einträgen.

```
```button
name New Running Log Section
type append template
action i_repeatingMeeting
```
```

Später gibt es noch ein paar Tips….

## Urteil

Buttons erlauben es mir Dinge die ich immer wieder regelmäßig mache einfach ohne viele Umwege zu erledigen.

Der Button Maker hilft die Buttons zu erstellen und dank Codeblocks kann man diese schön anpassen.

Was mit fehlt ist die Möglichkeit "Macros" oder Javascript auszuführen.

## Erwähnenswerte Kleinigkeiten

Und hier noch die versprochenen Tips.

### Javascript

### 

Eine Möglichkeit Javascript auszuführen ist via Templater...

einfach eine neue Notiz mit einem Template erstellen, in der dann das Javascript drin ist.

Hilft natürlich nicht wenn man keine neue Notiz erstellen will.

### Buttons Nebeneinander / Inline Button Tip

Schon mal probiert Buttons nebeneinander zu haben in der gleichen Notiz?

Eine Möglichkeit für den Lese Modus wäre Inline Buttons:

```
`button-eins` `button-zwei` `button-drei`
```

Das geht aber wie gesagt nur im Lese Modus 😞

ABER.... wenn ihr Dynbedded nutzt geht es auch im Preview Modus.

- Notiz mit den Buttons erstellen
- Header einfügen, z.B. EinsBisDrei
- oben beschriebene Zeile einfügen danach mindestens eine Leerzeile
- In anderer Notiz einen Dynbedded Codeblock erstellen

```
```dynbedded
[[40-06 Buttons#EinsBisDrei]]
```
```

Und dann funktionieren Inline Button auch im Lesemodus.

Eine weitere Option wäre es die Inline Buttons innerhalb eines Callouts zu stecken. Dann hat man aber den Callout drum rum.

### Buttons in Spalten

Und hier dann noch wie ich die Buttons auf meiner "Homepage" in Spalten anordne.

Ich nutze dafür Multi-Column Markdown Plugin und erstelle 2 Spalten. Am Anfang der Spalte ist ein Header, danach dann die Codeblocks für die Buttons der Spalte.

Allerdings gibt es da ein paar Probleme:

- Die Buttons verschwinden im Edit Modus... ab und zu kann man diese hervorzaubern wenn man mit dem Cursor durch die Codeblocks läuft
- Es war nicht so einfach das Multi-Column Markdown Plugin zum laufen zu kriegen. Ich mußte mich erst Schritt bei Schritt an das Endformat ran tasten. Zuerst das Beispiel von der Plugin Seite kopieren, dann nach und nach Änderungen machen. Einfach nur alles abtippen hat nicht geklappt.

Da ich meine "Homepage" aber komplett im Lesemodus habe und es jetzt funktioniert spielen die o.g. Probleme für mich keine Rolle.

Und wenn ihr keine Überschriften wie im Beispiel haben wollt, könnt ihr ja den anderen Tipp von oben nutzen.

### Standard Buttons ohne Inline

Wie ihr ja schon oben gesehen habt sind Inline Buttons ein wenig problematisch. Um Standard Buttons zu bauen, die ihr überall immer wider nutzen könnt, ohne Inline Buttons zu nutzen habe ich hier noch die folgenden 2 Tips:

- Dynbedded = Mal wieder 😀 . Anstelle dem Beispiel von oben nutzt ihr einfach direkt einen Header unter dem der Button ist.
- Inherit = Ihr definiert euren Standard irgendwo und falls ihr den nutzen wollt benutzt ihr einfach die Inherit Funktion um auf den entsprechenden Button zu verweisen.

Beide Möglichkeiten machen glaube ich gleich viel Arbeit. Aber ich denke sie geben euch noch weitere Ideen Buttons sinnvoll zu nutzen.

## Fazit

Alles in allem möchte ich Buttons nicht missen, es macht viele Dinge einfacher und schneller.

Es gibt ein paar Posts im Forum und auch Beispiel Vaults die über Buttons neue Notizen erstellen. Leider habe ich keine Sammlung von coolen Tricks gefunden aber vielleicht kennt ihr ja ein paar?

## Fussnote

- [Der Film zum Post](https://youtu.be/cri5zprSfvw)
- [Todoist](https://doist.grsm.io/1wx938b4rtun)
- [Obsidian: Dynbedded](/blog/obsidian-dynbedded-1/)
- [Obsidian: Todoist](/blog/obsidian-todoist/)
- [Natural Language Math](https://github.com/bugwheels94/math-expression-evaluator)
- 40-06
