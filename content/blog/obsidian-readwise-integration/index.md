---
title: "Obsidian: Readwise Integration"
date: 2023-03-23T17:07:01.512Z
lastmod: 2023-03-23T17:07:01.512Z
description: "Obsidian Readwise Integration und wie ich es nutze"
slug: "obsidian-readwise-integration"
translationKey: "obsidian-readwise"
categories: ["obsidian"]
tags: []
images: ["/img/wix/a64b4a_10d7c5c6c26f4ea5858f2d7f072ce638~mv2.png"]
draft: false
---
Hallo und Willkommen,

heute schauen wir uns mal einen Dienst an, welcher es uns erlaubt Highlights von verschiedenen Quellen zu sammeln und dann nach Obsidian zu exportieren. [Readwise](https://readwise.io/i/marcus890) sammelt nicht nur die Highlights, es bietet auch die Möglichkeit, diese über ein SRS (Spaced Repetition System) immer wieder hervorzubringen.

Ich nutze Readwise, weil ich damit nur ein Plugin brauche, um alle meine Highlights (Web, Kindle) nach Obsidian zu exportieren. Dafür nutze ich das Readwise Official Plugin direkt von Readwise.

Wer mehr über Readwise im speziellen Wissen möchte, kann mich gerne fragen, aber jetzt wollen wir uns hier mehr mit dem Plugin beschäftigen und wie man es einsetzen kann.

## Übersicht

Wie gesagt, Readwise kann mehr als nur Highlights nach Obsidian exportieren, aber das Thema ist ja das Readwise Official Plugin. Falls euch die Funktionalität dieses Plugins nicht reicht oder gefällt, findet ihr am Ende ein paar Alternativen.

Nach der Installation findet man in der Konfiguration nur einige wenige Möglichkeiten das Plugin anzupassen.

![](/img/wix/a64b4a_94a0b0c4894b46488dcbd16663e67972~mv2.png)

Readwise Plugin Konfiguration

Hier legt ihr eigentlich nur den Sync Intervall und den Ordner fest, wo die Highlight Notes erstellt werden sollen.

Die Art und Weise wie die Highlights aussehen (Customize Formatting Options) bestimmt ihr auf der Readwise Webseite.

Readwise benutzt für das Anpassen der Exporte die Jinja2 Template Language.

> Vergesst bei der ganzen Konfiguration nicht die "Schalter" für die einzelnen Optionen zu aktivieren wenn ihr sie braucht.

### Kategorie Ordner

![](/img/wix/a64b4a_d97d5e8994b84e5aa1c3ef77b37b7d44~mv2.png)

Group Files in Category Folders

Die Konfiguration fängt an mit der Entscheidung, ob man die Exporte in verschiedenen Ordner basierend auf den Kategorien exportieren will. Sehr schön ist, dass man auf der rechten Seite immer Beispiele sieht, wie das Ergebnis der Formatierung aussieht. (Wenigstens für die Optionen direkt von Readwise.)

> Falls ihr eine Integration mit Readwise benutzt, wie den Readwise Discord Bot im offiziellen Obsidian Discord, könnten die vorgeschlagenen Kategorien "Probleme" bereiten.

> Der Discord Bot speichert seine "Bookmarks" als Tweet, [Reclipped](https://reclipped.com/signup?referred_by=maruh0x7) speichert seine Youtube Highlights als Podcasts.

### Notiz Namen

Danach geht es dann mit dem Notiznamen weiter. Viele der möglichen Probleme mit den Filesystemen werden direkt umgangen. In den Fußnoten findet ihr eine "verbesserte" Version den Namen umzubenennen.

Ich finde es gut, das direkt die Variablen, die man nutzen kann und einige andere Tipps für jede Option angezeigt werden. Dort gibt es auch immer direkt einen Link auf die komplette Dokumentation.

![](/img/wix/a64b4a_fa5cff4a6c8045f9897efe74175e56bc~mv2.png)

File Name

> Ihr könnt die Notizen in Obsidian nicht umbenennen oder verschieben, ohne das nicht beim nächsten Highlight in der Notiz die Notiz wieder neu erstellt wird.

> Das Plugin nutzt den erzeugten Namen als Referenz zu den Highlights in Readwise.

### Notiz Titel

Untypisch für Obsidian nutzt Readwise den Begriff Page anstelle von Note / Notiz. Aber ich denke, man kommt damit klar 😃

Als Nächstes kommt der Titel der Notiz.

![](/img/wix/a64b4a_1e20a2d0ba4d43daa39ae9da5a325a01~mv2.png)

Page Title

### Notiz Metadata

Das Page Metadata sollte man nicht mit dem YAML Header in Obsidian verwechseln.

Dies ist der Teil der Notiz, der die wichtigsten Informationen über die Herkunft der Highlights beinhaltet, und hier zeigt Readwise was es kann.

Ihr bekommt hier:

- Image URL, z.B. für Buch Bilder
- URL, z.B. für Links in die Kindle App (falls das Highlight ein Kindle Buch war) über einen readwise.io redirect
- Author
- Kategorie von Readwise etc.

Dieser Bereich wird nur einmal ausgeführt.

![](/img/wix/a64b4a_3f6da1774e6c403fabac7cd65edc5153~mv2.png)

Page Metadata

### Highlights Header

Dieser Bereich wird immer dann aufgerufen, wenn Highlights exportiert werden, also

- beim ersten Mal (is\_new\_page)
- wenn neue Highlights hinzugefügt wurden (has\_new\_highlights)

> Readwise ändert niemals die Notiz ab, jedes neues Highlight (auch Änderungen an bestehenden Highlights) werden ans Ende der Notiz gestellt.

![](/img/wix/a64b4a_a9ee28676c3245108ab93c08fcfe0c33~mv2.png)

Highlights Header

Nach diesem Highlights Header kommen dann die entsprechenden Highlights.

### Highlight

Dieser Bereich wird für jedes einzelne Highlight ausgeführt. Jedes einzelne Highlight beginnt standardmäßig mit einem - (also Bulletindex).

Auch hier gibt es viele Möglichkeiten, mit der Template-Sprache von Jinja2 dieses Highlight nach seinen Wünschen anzupassen.

![](/img/wix/a64b4a_d708f21aa4c44b33882ac6d313a3fa86~mv2.png)

Highlight

### YAML Front Matter

Und fast am Schluss, irgendwie komisch, wenn man bedenkt, dass das ja eigentlich ganz an den Anfang kommt, kommt die Möglichkeit das YAML Front Matter einer Notiz zu konfigurieren.

Das ist deswegen recht doof, weil auf der rechten Seite das Beispiel nun bei der "Sync Notification" angekommen ist und man deswegen immer noch oben Scrollen muss, um Änderungen zu sehen.

![](/img/wix/a64b4a_d50076b349554b9d82931ced0eb63ed1~mv2.png)

YAML front matter

Die drei Bindestriche am Anfang und Ende der YAML Sektion werden automatisch eingefügt.

![](/img/wix/a64b4a_71f21f44960c4673bdbfdfbe2e14d028~mv2.png)

Front Matter

### Sync Notification

Und zum guten Schluss dann die Sync Notification. Damit wird bei jedem Sync, wenn neue Highlights exportiert werden, am Ende einer Datei (die man in der Plugin-Konfiguration definiert) Informationen hinzugefügt.

Könnte ganz interessant sein, muss es aber nicht.

![](/img/wix/a64b4a_7715bfb938ef4609863fb89f492e2d32~mv2.png)

Sync Notification

### Artikel zum Exportieren

Man kann bestimmte Artikel exportieren, das ist aber meiner Meinung nach viel zu kompliziert um wirklich Sinn zu machen.

Ich würde es begrüßen, wenn man auch Tags definieren könnte, um den Export zu steuern.

![](/img/wix/a64b4a_fe40bc886bd94ff3b6b8963af7b3aa8f~mv2.png)

Items to be exported

Damit sind die Konfigurationsmöglichkeiten erschöpft.

## Vorteile

- sehr viele verschiedene Highlight-Quellen
- Spaced Repetition System (für die Leute, die es brauchen)
- viele Exportmöglichkeiten
- eigener Reader
- Supplemental Books (Populäre Highlight Sammlung von Büchern, die man nicht selbst hat.)

## Nachteile

- Kindle URLs gehen über Readwise.io Webseite
- Export von einzelnen Ressourcen ist kompliziert.
- Kostet recht viel, wenn man es nur als Highlight Sammler nutzt.

## Nutzungsbeispiel

Wie nutze ich jetzt Readwise? Und warum, wenn es auch andere Möglichkeiten gibt, Highlights zu sammeln.

### Warum

Ich habe lange überlegt, ob ich nicht den Weg von einzelnen Diensten mit einzelnen Plugins gehe, also

- Kindle = Kindle Plugin
- RainDrop.Io = Raindrop Plugin
- und so weiter

Ich wollte aber einen einheitlichen Aufbau der Highlights haben und für einige meiner Quellen (z.B. [Reclipped](https://reclipped.com/signup?referred_by=maruh0x7)) gibt es keinen ordentlichen Export / Import für Obsidian, aber für Readwise.

### Wie

Ich habe hier mal meine Konfiguration angefügt, mit der Erklärung, warum ich es so mache.

#### File Name

SM - Titel = Da ich die Informationen noch weiterverarbeiten will, siehe auch MiYo - Compose, unterscheide ich durch das "SM - " das Source Material von den Quellen Notizen (Beginnen mit { ) und den einzelnen verarbeiteten Highlights bzgl. Ergebnissen.

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

Hier ist wohl am auffälligsten, dass ich das Page Metadata an Inline Dataview Felder einbinde, z.B. Author::

Ein anderer, für mich wichtiger Punkt sind die Tags. Alle Tags, die aus Readwise kommen, beginnen mit Readwise. Damit habe ich eine klare Trennung zwischen Tags, die ich für meine eigenen Notizen nutze und Tags die über das SourceMaterial definiert sind. So kann ich immer direkt sehen, ob eine Notiz über **Japan** von mir selbst erstellt worden ist oder von außerhalb kommt.

#### Highlight

Die Änderungen hier sind zum einen anstelle von einem - nutze ich ein > und bei der Highlight-ID füge ich ein ^rw hinzu, um eindeutige Blockreferenz zu erzeugen.

```
> {{ highlight_text }}{% if highlight_location and highlight_location_url %} ([{{highlight_location}}]({{highlight_location_url}})){% elif highlight_location %} ({{highlight_location}}){% endif %}  ^rw{{highlight_id}}{% if highlight_tags %}
>    - Tags: {% for tag in highlight_tags %}#Readwise/{{tag}} {% endfor %}{% endif %}{% if highlight_note %}
>    - Note: {{ highlight_note }}{% endif %}
```

#### YAML Frontmatter

Tja, und hier tobe ich mich richtig aus, und nutze die Möglichkeit, die Templater mir bietet.

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

Der QuickAdd Teil fügt die neue Notiz als Link in ein Kanban Board ein, damit ich dann mal irgendwann dran denke, die Highlights auch zu verarbeiten.

#### Sync Notification

Hier setze ich auf Linking mit meiner Daily Note.

```
- [[{{date|date('Y-m-d')}}]] {{time}} — Synced {{num_highlights}} highlight{{num_highlights|pluralize}} from {{num_books}} document{{num_books|pluralize}}. {% for book in books %} - {{ book.num_highlights_added}} highlights from {{ book.title }} {% endfor %}
```

Das ist aber eigentlich unnötig, da ich auch das List Modified Plugin benutze, welches sowieso alle geänderten und neuen Notizen mit der Daily Note verknüpft.

## Urteil

Readwise sammelt alle möglichen Highlights von verschiedenen Quellen und verarbeitet diese immer auf die gleiche Art und Weise. Diese Konsistenz gefällt mir.

Die Konfiguration ist ein wenig gewöhnungsbedürftig, da das meiste außerhalb des Plugins auf der Webseite von Readwise passiert, das ist aber kein Problem.

Durch Jinja2 kann man sehr gut eigene Templates entwickeln, ist halt die Frage inwieweit dies wirklich notwendig ist.

Ich habe auch nur kleine Änderungen an den Originaltemplates durchgeführt.

Aber wie so oft hängt, das auch mit den Prozessen zusammen, die ihr nutzt.

## Erwähnenswerte Kleinigkeiten

Dieser Artikel von [TfTHacker auf Medium](https://tfthacker.medium.com/using-readwises-highlight-id-as-a-single-source-of-truth-in-obsidian-b1de98a8b87c) hat die Idee für die ^rw Blockreferenz geliefert.

Des Weiteren hat er noch einen [Demovault der einen Readwise Inbox Prozess](https://github.com/TfTHacker/obsidian-readwise-inbox) vorstellt.

## Fazit

Gerade im Bereich Exportfilter gibt es viel Nachholbedarf bei Readwise. Ich nutze momentan auch weder den Reader noch das Browser-Plugin von Readwise, da ich die Highlight-Funktion von Raindrop.io besser finde.

Ich muss aber ehrlich sagen, dass ich bisher noch keine Zeit hatte mich mehr mit dem Reader zu beschäftigen, vielleicht ist er ja jetzt eine gute Alternative für Raindrop.Io.

Ansonsten passt Readwise gut zu meinen Prozessen und alle meine Highlights haben den gleichen Aufbau, egal woher sie kommen.

Ist das 8 USD pro Monat wert? Das muss jeder selbst entscheiden, zumal es ja auch noch das SRS und den Reader gibt.

## Fussnote

- [Das Video zum Post](https://youtu.be/k6aUhRUOswY)
- [Der Vault zum Post](https://github.com/MMoMM-org/obsidian-youtube-vault)
- [readwise-mirror](https://github.com/jsonMartin/readwise-mirror) Alternatives Readwise Integrationsplugin
- [Additional Sanitization of Filenames?](https://github.com/YTolun/obsidian-filename-emoji-remover/issues/1)
- [How can I customize the Readwise to Obsidian Export?](https://help.readwise.io/article/126-how-can-i-customize-the-readwise-to-obsidian-export#title)
- [Jinja — Jinja Documentation (2.11.x)](https://jinja.palletsprojects.com/en/2.11.x/)
