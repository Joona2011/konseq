/* Konseq Service Worker — Offline-Betrieb + automatische Updates.
   Strategie:
   - App-Hülle (Navigationen, app.js, styles.css): network-first. Ein neuer
     Deploy ist darum nach dem Neuladen sofort aktiv; offline kommt die
     zwischengespeicherte Fassung.
   - Unveränderliche Dateien (Icons, Schrift, CDN): cache-first.
   - version.json wird nie aus dem Cache beantwortet (immer frisch für den
     Update-Check der App).
   Der Worker übernimmt NICHT automatisch (kein skipWaiting beim Install),
   sondern erst, wenn die App nach Nutzerklick SKIP_WAITING sendet. */
const CACHE = "konseq-20261012144026"; // wird beim Deploy von tools/stamp-version.mjs gesetzt
const CORE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./icon-180.png"
];

self.addEventListener("install", (e) => {
  // Kein skipWaiting: der neue Worker wartet, bis die App das OK gibt.
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

// Gehört die URL zur App-Hülle (soll network-first laufen)?
function isShell(url, req) {
  if (req.mode === "navigate") return true;
  return /\/(index\.html|app\.js|styles\.css)$/.test(url.pathname) ||
         url.pathname === "/" || url.pathname.endsWith("/");
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  let url;
  try { url = new URL(req.url); } catch (_) { return; }

  // version.json: immer frisch, nie aus dem Cache
  if (url.pathname.endsWith("/version.json")) {
    e.respondWith(fetch(req).catch(() => new Response("{}", { headers: { "Content-Type": "application/json" } })));
    return;
  }

  if (isShell(url, req)) {
    // network-first: frische Fassung holen, Cache aktualisieren, offline Cache nutzen
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => { try { c.put(req, copy); } catch (_) {} });
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || (req.mode === "navigate" ? caches.match("./index.html") : undefined)))
    );
    return;
  }

  // Übrige (Icons, Schrift, CDN): cache-first, danach Netz + nachspeichern
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => { try { c.put(req, copy); } catch (_) {} });
        return res;
      }).catch(() => undefined);
    })
  );
});
