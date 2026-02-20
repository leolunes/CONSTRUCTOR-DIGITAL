// pwa/sw.js

// Sube versión cuando quieras forzar actualización del cache
const CACHE = "bitacora-supervision-v10";

const ASSETS = [
  "../",
  "../index.html",
  "../obras.html",
  "../obras-detalle.html",
  "../visita-nueva.html",
  "../hallazgo-cerrar.html",
  "../app.html",

  "../css/styles.css",

  "../js/db.js",
  "../js/storage.js",
  "../js/ui.js",
  "../js/cronograma.js",
  "../js/migrate.js",
  "../js/pdf.js",
  "../js/app.js",

  "./manifest.webmanifest",
  "../assets/icons/icon-192.svg",
  "../assets/icons/icon-512.svg"
];

// Página fallback offline (cuando no hay red y no está en cache)
const OFFLINE_FALLBACK = "../obras.html";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null))))
      .then(() => self.clients.claim())
  );
});

// Helpers
function isHTMLRequest(req) {
  return req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");
}

self.addEventListener("fetch", (e) => {
  const req = e.request;

  // Solo GET
  if (req.method !== "GET") return;

  // Navegación (páginas): Network-first con fallback a cache y luego a OFFLINE_FALLBACK
  if (isHTMLRequest(req)) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const fallback = await caches.match(OFFLINE_FALLBACK);
          return fallback || new Response("Offline", { status: 503, statusText: "Offline" });
        })
    );
    return;
  }

  // Assets (css/js/icons/etc): Cache-first + update en background
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // Actualiza en background (stale-while-revalidate)
        fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          })
          .catch(() => {});
        return cached;
      }

      // Si no está en cache, trae de red y guarda
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => cached);
    })
  );
});