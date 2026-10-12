# Kadence

Produktivitäts- und Kalender-App mit Score: Routinen, Tagesaufgaben, Wochenziele,
Kalender und eine Auswertung, die nur mit den eigenen Ansprüchen vergleicht.
Läuft als installierbare Web-App (PWA) auf Android und am Laptop.

## Inhalt

| Datei | Zweck |
| --- | --- |
| `index.html` | Die komplette App (Oberfläche, Logik, Übersetzungen DE/EN) |
| `manifest.webmanifest` | App-Name, Icons, Vollbild-Einstellungen |
| `sw.js` | Service-Worker für Offline-Betrieb und Updates |
| `icon-*.png` | App-Icons in allen benötigten Größen |
| `ANLEITUNG.md` | Installation auf dem Handy (vorläufig, bis eigenes Hosting steht) |

## Arbeitsweise

- Die Entwicklung folgt dem Fahrplan in sitzungsweise abgeschlossenen Schritten.
  Jede Sitzung endet mit einer getesteten Version und einem Commit.
- Bei jeder Änderung an `index.html` die Cache-Version in `sw.js`
  (`kadence-vN`) erhöhen, damit installierte Apps das Update laden.
  Ab Fahrplan-Sitzung 3 übernimmt das ein automatischer Update-Hinweis.
- In `index.html` steht `PREVIEW_BUILD=false`. Nur die Vorschau-Version
  setzt den Wert auf `true` und zeigt damit „Testdaten zurücksetzen“.

## Status

Prototyp vor Fahrplan-Sitzung 1. Daten liegen lokal im Browser,
Konten und Sync folgen in Phase 2.
