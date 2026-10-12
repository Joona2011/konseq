# Konseq als echte App installieren

Dieses Paket macht aus Konseq eine **installierbare App (PWA)** — mit eigenem
Icon, Vollbild und Offline-Betrieb, auf **Android-Handy und Laptop**.

## Was ist drin
- `index.html` – die App (mit Manifest + Service-Worker eingebunden)
- `manifest.webmanifest` – App-Name, Icon, Vollbild-Einstellungen
- `sw.js` – Service-Worker: macht die App offline-fähig
- `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `icon-180.png` – App-Icons

**Wichtig:** Die App braucht zum Installieren eine Adresse mit `https://`
(oder `localhost`). Ein einfacher Doppelklick auf `index.html` (also `file://`)
reicht **nicht** — dann startet der Offline-Teil nicht. Deshalb einmal kurz
hosten (dauert 1–2 Minuten, kostenlos):

## Schnellster Weg: kostenlos hosten (empfohlen)

**Variante A – Netlify Drop (ohne Konto, Drag & Drop):**
1. Gehe auf https://app.netlify.com/drop
2. Zieh den **ganzen Ordner** `konseq-app` in das Feld.
3. Du bekommst sofort eine `https://…netlify.app`-Adresse.

**Variante B – Vercel oder GitHub Pages:** funktioniert genauso; Ordner
hochladen, HTTPS-Adresse erhalten.

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
- **Updates:** Wenn du `index.html` austauschst, erhöhe in `sw.js` die Zeile
  `const CACHE = "konseq-v1";` auf `-v2`, damit die neue Version geladen wird.

## Und ein echter Play-Store-Eintrag / APK?
Möglich (z. B. mit Capacitor wird aus dieser PWA eine Android-APK), aber das ist
ein deutlich größerer Schritt mit Android-Studio-Setup und lässt sich hier nicht
fertig bauen. Für dich, Freunde und zum täglichen Nutzen ist die PWA oben der
schnellste, echte Weg — sie fühlt sich auf dem Handy wie eine normale App an.
