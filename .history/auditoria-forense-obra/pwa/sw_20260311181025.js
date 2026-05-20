const CACHE_NAME = "afo-cache-v1";

const APP_ASSETS = [
  "../index.html",
  "../contratos.html",
  "../contrato-detalle.html",
  "../facturacion.html",
  "../alertas.html",
  "../informes.html",
  "../css/styles.css",
  "../js/app.js",
  "../js/contratos.js",
  "../js/tecnico.js",
  "../js/facturacion.js",
  "../js/tributario.js",
  "../js/cruces.js",
  "../js/alertas.js",
  "../js/reportes.js",
  "../js/calc.js",
  "../js/db.js",
  "../js/pdf.js",
  "../js/storage.js",
  "../js/ui.js",
  "../assets/logo.svg",
  "../assets/icon-192.svg",
  "../assets/icon-512.svg",
  "./manifest.webmanifest"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS))
  );
  self.skipWaiting();
});

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

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match("../index.html");
        });
    })
  );
});