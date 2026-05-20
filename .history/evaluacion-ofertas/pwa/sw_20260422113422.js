// ===============================
// SERVICE WORKER
// Archivo: pwa/sw.js
// ===============================

const CACHE_NAME = "evaluacion-ofertas-v1";

// Archivos principales que la app debe guardar en caché
const APP_SHELL = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./js/db.js",
  "./js/storage.js",
  "./js/calc.js",
  "./js/oab.js",
  "./js/economica.js",
  "./js/trm.js",
  "./js/report.js",
  "./js/pdf.js",
  "./js/ui.js",
  "./js/validators.js",
  "./pwa/manifest.webmanifest",
  "./assets/icon-192.svg",
  "./assets/icon-512.svg"
];

// ===============================
// INSTALACIÓN
// ===============================
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// ===============================
// ACTIVACIÓN
// Elimina cachés viejos
// ===============================
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ===============================
// FETCH
// Estrategia: cache first, luego red
// ===============================
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request)
          .then(networkResponse => {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(() => {
            // Si falla la red y no existe en caché, devuelve index.html para navegación
            if (event.request.mode === "navigate") {
              return caches.match("./index.html");
            }
          })
      );
    })
  );
});
