# Konseq als echte App installieren

Dieses Paket macht aus Konseq eine **installierbare App (PWA)** — mit eigenem
Icon, Vollbild und Offline-Betrieb, auf **Android-Handy und Laptop**.

## Was ist drin
- `index.html` – Gerüst, lädt `styles.css` und `app.js`
- `styles.css` – das Aussehen · `app.js` – die Logik
- `manifest.webmanifest` – App-Name, Icon, Vollbild-Einstellungen
- `sw.js` – Service-Worker: Offline-Betrieb und automatische Updates
- `version.json` + `tools/stamp-version.mjs` – automatischer Update-Hinweis
- `_headers` – Cache-Regeln fürs Hosting
- `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `icon-180.png` – App-Icons

**Wichtig:** Die App braucht zum Installieren eine Adresse mit `https://`
(oder `localhost`). Ein einfacher Doppelklick auf `index.html` (also `file://`)
reicht **nicht** — dann startet der Offline-Teil nicht.

## Dauerhaftes Hosting über GitHub + Cloudflare Pages (empfohlen)

So ist die App unter einer festen Adresse erreichbar und jede Änderung geht
nach dem Hochladen zu GitHub automatisch online.

1. Auf https://dash.cloudflare.com → **Workers & Pages** → **Create** →
   **Pages** → **Connect to Git** und das Repository `Joona2011/konseq` wählen.
2. Einstellungen beim Einrichten:
   - **Framework preset:** None
   - **Build command:** `node tools/stamp-version.mjs`
   - **Build output directory:** `/`  (das Projekt-Stammverzeichnis)
3. **Save and Deploy.** Nach ~1 Minute bekommst du eine `https://…pages.dev`-Adresse.
4. Ab jetzt: etwas ändern → zu GitHub pushen → Cloudflare veröffentlicht neu.
   Die installierte App zeigt dann von selbst **„Neue Version verfügbar“**.

Der Build-Befehl sorgt dafür, dass niemand mehr von Hand eine Versionsnummer
hochzählen muss. Ohne diesen Befehl funktioniert die App trotzdem — sie lädt die
neueste Fassung beim nächsten Neuladen —, nur der aktive Hinweis bleibt aus.

**Wichtig beim Umzug auf die neue Adresse:** Die Daten hängen an der Web-Adresse.
Mache **vorher** in der alten installierten App einen Export
(Menü → Datensicherung → Daten exportieren) und importiere die Datei **nach** dem
Umzug einmal auf der neuen Adresse (Menü → Datensicherung → Daten importieren).

**Schnelle Alternative ohne Konto (zum kurzen Testen):** Ordner auf
https://app.netlify.com/drop ziehen → sofort eine `https://…netlify.app`-Adresse.

## Auf dem Handy installieren (Android)
1. Öffne die gehostete Adresse in **Chrome**.
2. Menü (⋮) → **„App installieren"** bzw. **„Zum Startbildschirm hinzufügen"**.
3. Fertig — Konseq liegt als App mit Icon auf dem Startbildschirm, startet im
   Vollbild und läuft danach auch offline.

## Auf dem Laptop installieren (Chrome/Edge)
1. Öffne die Adresse im Browser.
2. Rechts in der Adressleiste erscheint ein **Installieren-Symbol** (Bildschirm
   mit Pfeil) → anklicken → **Installieren**.
3. Konseq öffnet sich als eigenständiges Fenster mit Icon in der Taskleiste.
   (Am Laptop wird die App bewusst im Handy-Rahmen dargestellt.)

## Lokal testen (optional, für Entwickler)
Im Ordner ein kleiner Server, dann `http://localhost:8000` öffnen:
```
python3 -m http.server 8000
```
Über `localhost` funktioniert auch der Offline-/Installier-Teil.

## Gut zu wissen
- **Daten** liegen lokal auf dem jeweiligen Gerät (kein Konto, kein Sync). Das
  war so besprochen; geräteübergreifender Sync wäre der nächste größere Schritt
  und würde einen kleinen Server brauchen.
- **Offline:** Nach dem ersten Öffnen mit Internet werden App, Schriftart und
  QR-Bibliothek zwischengespeichert; danach läuft alles ohne Netz. (Nur das
  Erzeugen neuer QR-Codes braucht beim allerersten Mal kurz Internet.)
- **Updates:** laufen automatisch. Nach einem neuen Deploy erkennt die
  installierte App die neue Fassung und bietet „Neue Version verfügbar“ an;
  ein Tippen lädt neu. Manuelles Hochzählen einer Versionsnummer entfällt.

## Und ein echter Play-Store-Eintrag / APK?
Möglich (z. B. mit Capacitor wird aus dieser PWA eine Android-APK), aber das ist
ein deutlich größerer Schritt mit Android-Studio-Setup und lässt sich hier nicht
fertig bauen. Für dich, Freunde und zum täglichen Nutzen ist die PWA oben der
schnellste, echte Weg — sie fühlt sich auf dem Handy wie eine normale App an.
