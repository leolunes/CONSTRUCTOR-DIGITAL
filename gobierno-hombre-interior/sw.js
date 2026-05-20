const CACHE_NAME = "gobierno-hombre-interior-v1.0.0";

const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./data/preguntas.json",
  "./data/resultados.json",
  "./data/capitulos.json",
  "./data/devocionales.json"
];

/* =========================
   INSTALACIÓN
========================= */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

/* =========================
   ACTIVACIÓN
========================= */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return null;
        })
      );
    })
  );
  self.clients.claim();
});

/* =========================
   FETCH
========================= */
self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(req)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseClone);
          });

          return networkResponse;
        })
        .catch(() => {
          if (req.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
    })
  );
});