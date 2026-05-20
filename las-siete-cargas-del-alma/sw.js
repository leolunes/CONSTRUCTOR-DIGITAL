const CACHE_NAME = "siete-cargas-alma-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./data/siete-cargas.json",
  "./assets/css/styles.css",
  "./assets/js/utils.js",
  "./assets/js/storage.js",
  "./assets/js/state.js",
  "./assets/js/score.js",
  "./assets/js/diagnostics.js",
  "./assets/js/planner.js",
  "./assets/js/compare.js",
  "./assets/js/portico.js",
  "./assets/js/guided.js",
  "./assets/js/render.js",
  "./assets/js/export-txt.js",
  "./assets/js/export-png.js",
  "./assets/js/export-pdf.js",
  "./assets/js/ui.js",
  "./assets/js/app.js",
  "./assets/img/icon-192.png",
  "./assets/img/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});