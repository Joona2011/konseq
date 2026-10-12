/* Konseq Service Worker — macht die App offline-fähig und installierbar. */
const CACHE = "konseq-v11";
const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./icon-180.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          // Erfolgreiche GETs (auch Fonts/CDN) fürs Offline-Nutzen zwischenspeichern
          const copy = res.clone();
          caches.open(CACHE).then((c) => { try { c.put(req, copy); } catch (_) {} });
          return res;
        })
        .catch(() => {
          // Offline-Fallback für Navigationen
          if (req.mode === "navigate") return caches.match("./index.html");
        });
    })
  );
});
