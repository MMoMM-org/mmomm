---
title: "Obsidian: Dynbedded"
date: 2022-10-30T21:01:00.335Z
lastmod: 2022-10-30T21:01:00.335Z
description: "Hallo und Willkommen.Heute möchte ich euch Dynbedded vorstellen. Dynbedded erlaubt es Inhalte von anderen Notizen dynamisch in andere Notizen einzubinden. Das gilt sowohl für Dinge wie Dataview Abfragen, es erlaubt also einen Aufbau einer Dataview / Buttons Bibliothek, sowie auch für Datum Verweise, ihr könnt mit Hilfe von Dynbedded Tage zurück oder in die Zukunft springen.Geschrieben wurde das Plugin von ..... mir... aber schaut doch selbst ob ich Zuviel verspreche.Ich gehe hierbei davon aus da"
slug: "obsidian-dynbedded"
translationKey: "obsidian-dynbedded"
categories: ["obsidian"]
tags: []
images: ["/img/wix/a64b4a_d616a19f568747ad8dac15cb6c4b5bf3~mv2.png"]
draft: false
---
Hallo und Willkommen.

Heute möchte ich euch [Dynbedded](https://github.com/MMoMM-org/obsidian-dynbedded) vorstellen.

Dynbedded erlaubt es Inhalte von anderen Notizen dynamisch in andere Notizen einzubinden. Das gilt sowohl für Dinge wie Dataview Abfragen, es erlaubt also einen Aufbau einer Dataview / Buttons Bibliothek, sowie auch für Datum Verweise, ihr könnt mit Hilfe von Dynbedded Tage zurück oder in die Zukunft springen.

Geschrieben wurde das Plugin von ..... mir... aber schaut doch selbst ob ich Zuviel verspreche.

Ich gehe hierbei davon aus das ihr euch in Obsidian einigermaßen auskennt und auch wisst wie man Community Plugins installiert. Lasst gerne Kommentare da wenn ihr dazu fragen habt.

## Übersicht

Dynbedded hat momentan zwei Funktionen:

1. Einbinden von dynamischen Inhalten in Notizen, wobei diese dynamischen Inhalte Bezug auf die Notiz nehmen von der sie aufgerufen wurden.
2. Dynamische Datum Erzeugung, sowohl für das aktuelle Datum wie auch für ein relatives Datum, also in der Vergangenheit oder der Zukunft.

Schauen wir uns doch mal ein Beispiel für die erste Funktion an:

Links Standard Embedded Funktion / Rechts Dynbedded Embedded Funktion

![](/img/wix/a64b4a_d616a19f568747ad8dac15cb6c4b5bf3~mv2.png)  

- **Dataview**: zeigt die Inlinks in die Notiz darstellen an
- **Buttons**: zeigt eine Notiz mit 2 Buttons an
- **Buttons - Heute**: zeigt nur den Button Heute an.

Und hier nun die zweite Funktion:

![](/img/wix/a64b4a_43e7c039e7494ba0ad10dbbc0d3da4d4~mv2.png)  

- **TagesNotiz - Heute**: zeigt die Notiz an die ich gestern als HEUTE verknüpft habe
- Wie man hier auch sehen kann, funktionieren Checkboxen in Dynbedded direkt leider nicht.

![](/img/wix/a64b4a_724c7b85704a4a05b8d46351e19e6253~mv2.png)  

- **Tagesnotiz - Letze Woche**: zeigt die Informationen der Notiz von letzter Woche an

Was sind also die Pros / Cons von Dynbedded?

## Pros

- Dynbedded erlaubt den Aufbau von z.b. Dataview Queries die man dann in verschiedene Notizen einbauen kann. Das ist recht praktisch da man dann z.b. bei Änderungen nicht X verschiede Notizen oder Templates ändern muss.
- Klar kann man dafür auch dataviewJS nutzen, aber dafür muss man dann halt auch Javascript programmieren, hier kann man einfach die einfachere Möglichkeit von Dataview nutzen.
- Und das geht natürlich auch mit anderen Funktionen die Daten aus der aktiven Notiz benötigen.
- Das andere Feature mit relativen Datum Bezügen zu arbeiten war für mich der Hauptgrund dieses Plugin zu schreiben. Ich kann mir in einer Notiz immer die aktuelle Notiz von Heute, Morgen, Gestern, letze Woche etc Anschauen, ohne komplizierte Javascripte schreiben zu müssen und kann mir auch nur Ausschnitte dieser Notizen anzeigen lassen.
- Das passt gut in ein Konzept von Dashboards die nicht immer wieder neu erstellt werden müssen.

## Cons

- Leider kann man direkt keine Tasks / Checkboxen in den über Dynbedded eingebundenen Notizen erledigen. Dies geht aber falls man einen Dataview einbaut.
- Die Links zu den Notizen sind nur Text, keine wirklichen Links, dies bedeutet das Änderungen der Notiznamen die Verbindung zwischen den Notizen unterbrechen.

Und wie kann man Dynbedded nutzen?

## Syntax

### Standard Syntax

Für die einfachen Embedded reicht ein CodeBlock (z.b. Dataview)

```
```dynbedded
[[Titel der Notiz]]
```
```

Wenn man nur einen Teil einer Notiz einbinden will (z.b. Buttons - Heute):

```
```dynbedded
[[Titel der Notiz#Teil]]
```
```

### Relative Datum Notizen

Für HEUTE ist die Nutzung einfach, es reicht das angeben des Formates [basierend auf Moment.js Datum Format](https://momentjs.com/docs/#/displaying/format/).

```
```dynbedded
[[{{YYYY-MM-DD}}]]
```
```

Man gibt den kompletten Notiznamen innerhalb der {{}} an.

Wenn man also Notizen hat die nicht nur ein Datum haben, muss man diese zusätzlichen Informationen auch mit angeben.

```
```dynbedded
[[{{[DP-]YYYY-MM-DD}}]]
```
```

Der Teil der Notiz die also statisch ist wird in [] gepackt.

Die Angabe des relativen Datums mag am Anfang seltsam erscheinen, aber ist im Endeffekt doch recht einfach:

Zuerst nutzt man ein P und dann entsprechend die Zeitdifferenz die man abziehen oder addieren will. [Ihr könnt sogar auch mit Stunden arbeiten, dann ist es aber ein T.](https://en.wikipedia.org/wiki/ISO_8601#Durations)

|  |  |
| --- | --- |
| **Abkürzung** | **Bedeutung** |
| Y | Jahr |
| M | Monat |
| W | Woche |
| D | Tag |

Wenn ihr also euch eine Notiz von vor 7 Tagen anzeigen lassen wollt könnt ihr sowohl

```
```Dynbedded
{{YYYY-MM-DD|P-1W}}
```
```

oder auch

```
```dynbedded
{{YYYY-MM-DD|P-7D}}
```
```

nutzen.

## Anwendungsbeispiel

Welche Beispiele gibt es jetzt nun für Dynbedded?

### Standard "Bibliothek"

Zum Beispiel zum Einbinden von Notizen die Standard Dataview oder Buttons enthalten.

Erstellt ihr zum Beispiel eine Notiz mit je einem Button pro Header könnt ihr dann über Dynbedded diesen einen Button jeweils an der richtigen Stelle einbinden. Es steht also nichts mehr im Weg um Standard Buttons überall in eueren Notizen zu nutzen und bei Änderungen nur einen zu ändern und nicht Hunderte.

![](/img/wix/a64b4a_51afe2e5aa65452597c170521fb0c534~mv2.png)

Dasselbe funktioniert auch mit Dataview Querries welches halt einfacher ist als eigene Javascript Querries schreiben.

![](/img/wix/a64b4a_c03d73e522fd4be0b0608518c58e79fc~mv2.png)

### Startseite

Und die andere Möglichkeit ist eine Homenotiz / Dashboard aufzubauen welche einem relative Daten anzeigt, ohne das man laufend etwas ändern muss. Dies war mit mein Hauptgrund dieses Plugin zu entwickeln.

Anbei ein Beispiel, ist noch nicht fertig.

![](/img/wix/a64b4a_4c5e90161849490f87f3a7baf3976ed1~mv2.png)  

## Styling

Außerdem könnt ihr auch noch den Style der Einbindungen verändern. Das folgende Style Sheet zeigt z.b. Fehler in Rot und die normalen Einbindungen in Blau an. Aber da ist noch viel mehr möglich.

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

Es gibt also genug Möglichkeiten sich auszutoben.

## Urteil

Was soll ich sagen. Es macht das was es soll und da ich Buttons und Dataviews benutze fällt das Problem das ich normale Tasks / Checkboxen nicht nutzen kann für mich nicht ins Gewicht.

## Erwähnenswerte Kleinigkeiten

Gareth Stretton hat auf [Medium](https://medium.com/@gareth.stretton/obsidian-dataview-reuse-10fa0e635e46) einen anderen einfachen Workaround für wiederbenutzbare Dataview Querries geschrieben, schaut ihn euch ruhig an.

## Fazit

Also, was haltet IHR davon? Laßt es mich wissen. Nicht nur euere Meinung über das Plugin sondern auch über dieses Review und das [Video](https://youtu.be/_0MooUB_sWQ).

## Fußnote

- [Der Film zum Artikel](https://youtu.be/_0MooUB_sWQ)
- [Mein Youtube Video Vault](https://github.com/MMoMM-org/obsidian-youtube-vault)
- [Dynbedded](https://github.com/MMoMM-org/obsidian-dynbedded)
- 40-01
