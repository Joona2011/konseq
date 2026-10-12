# Konseq

Produktivitäts- und Kalender-App mit Score: Routinen, Tagesaufgaben, Wochenziele,
Kalender und eine Auswertung, die nur mit den eigenen Ansprüchen vergleicht.
Läuft als installierbare Web-App (PWA) auf Android und am Laptop.

## Inhalt

| Datei | Zweck |
| --- | --- |
| `index.html` | Gerüst der Seite, lädt `styles.css` und `app.js` |
| `styles.css` | Das gesamte Aussehen |
| `app.js` | Die komplette Logik (Oberfläche, Score, Kalender, Übersetzungen DE/EN) |
| `manifest.webmanifest` | App-Name, Icons, Vollbild-Einstellungen |
| `sw.js` | Service-Worker: Offline-Betrieb und automatische Updates |
| `version.json` | Aktuelle Versionskennung für den Update-Hinweis (vom Deploy gesetzt) |
| `tools/stamp-version.mjs` | Setzt beim Deploy die Version in `app.js`, `sw.js`, `version.json` |
| `_headers` | Cache-Regeln für Cloudflare Pages / Netlify |
| `icon-*.png` | App-Icons in allen benötigten Größen |
| `ANLEITUNG.md` | Installation und Hosting |

## Arbeitsweise

- Die Entwicklung folgt dem Fahrplan in sitzungsweise abgeschlossenen Schritten.
  Jede Sitzung endet mit einer getesteten Version und einem Commit.
- Versionsnummern werden **nicht mehr von Hand** hochgezählt: `tools/stamp-version.mjs`
  läuft beim Deploy (Build-Befehl bei Cloudflare Pages / Netlify) und stempelt die
  gleiche Kennung in `app.js`, `sw.js` und `version.json`. Die installierte App
  bemerkt die neue Fassung und zeigt „Neue Version verfügbar“.
- In `app.js` steht `PREVIEW_BUILD=false`. Nur die Vorschau-Version
  setzt den Wert auf `true` und zeigt damit „Testdaten zurücksetzen“.

## Status

Phase 1, Sitzung 1 erledigt: vollständige Datensicherung (Export/Import als
versionierte `.json`-Datei, erreichbar im Menü unter „Datensicherung") stellt
alle Daten 1:1 auf einem anderen Gerät wieder her. Zusätzlich hält die App ab
jetzt pro Tag fest, welche Routine/Aufgabe erledigt und wie viel an Wochenzielen
geschafft wurde (`S.log`) — Grundlage für die Monatsanalyse in Phase 8.

Sitzung 2 erledigt: Import einer `.ics`-Datei aus Google- oder Apple-Kalender
über „Termine empfangen" → „Datei wählen (.ics)". Versteht ganztägige und
jährliche Termine, rechnet UTC-Zeiten in die lokale Zeit um und legt keine
Dubletten an.

Sitzung 3 erledigt: Code in `index.html` / `styles.css` / `app.js` aufgeteilt,
eigenes Hosting über GitHub + Cloudflare Pages (siehe `ANLEITUNG.md`), und ein
automatischer Update-Hinweis ersetzt das manuelle Hochzählen der Version. Damit
ist Phase 1 (Fundament) abgeschlossen.

Daten liegen weiterhin lokal im Browser; Konten und echter Sync folgen in Phase 2.
