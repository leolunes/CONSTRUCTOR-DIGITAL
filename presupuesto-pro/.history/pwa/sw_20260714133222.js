// pwa/sw.js
// PRESUPUESTO PRO — caché PWA con múltiples Bases APU y código editable de ítems y PDF desagregado corregido

const CACHE = "presupuesto-pro-v11";

const ASSETS = [
  "../",
  "../index.html",
  "../proyectos.html",
  "../proyecto-detalle.html",
  "../apu.html",
  "../bases.html",

  "../css/styles.css",

  "../js/db.js",
  "../js/storage.js",
  "../js/ui.js",
  "../js/calc.js",
  "../js/pdf.js",
  "../js/base-import.js",
  "../js/bases.js",
  "../js/app.js",

  "../data/plantillas-costos-indirectos.json",

  "../assets/icon-192.svg",
  "../assets/icon-512.svg",

  "./manifest.webmanifest"
];

const OFFLINE_FALLBACK = "../index.html";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.map(key => key !== CACHE ? caches.delete(key) : null)
      ))
      .then(() => self.clients.claim())
  );
});

function isHTMLRequest(request){
  return (
    request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html")
  );
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if(request.method !== "GET") return;

  if(isHTMLRequest(request)){
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE)
            .then(cache => cache.put(request, copy))
            .catch(() => {});
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if(cached) return cached;

          const fallback = await caches.match(OFFLINE_FALLBACK);
          return fallback || new Response("Offline", {
            status:503,
            statusText:"Offline"
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if(cached){
        fetch(request)
          .then(response => {
            const copy = response.clone();
            caches.open(CACHE)
              .then(cache => cache.put(request, copy))
              .catch(() => {});
          })
          .catch(() => {});
        return cached;
      }

      return fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE)
            .then(cache => cache.put(request, copy))
            .catch(() => {});
          return response;
        })
        .catch(() => cached);
    })
  );
});