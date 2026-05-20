const CACHE = "auditoria-presupuesto-v4"; // 🔥 IMPORTANTE cambiar versión

const ASSETS = [
  "../",
  "../index.html",
  "../proyectos.html",
  "../proyecto-detalle.html",
  "../apu.html",

  "../css/styles.css",

  "../js/db.js",
  "../js/storage.js",
  "../js/ui.js",
  "../js/calc.js",
  "../js/pdf.js",
  "../js/base-import.js",
  "../js/app.js",

  "../assets/icon-192.svg",
  "../assets/icon-512.svg",

  "./manifest.webmanifest"
];

const OFFLINE_FALLBACK = "../proyectos.html";

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

function isHTMLRequest(req) {
  return req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");
}

function isJSRequest(req){
  return req.url.includes(".js");
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  // 🔥 HTML → network first
  if (isHTMLRequest(req)) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          return caches.match(OFFLINE_FALLBACK);
        })
    );
    return;
  }

  // 🔥 JS → NETWORK FIRST (CLAVE)
  if (isJSRequest(req)) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // resto → cache first
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy));
        return res;
      });
    })
  );
});