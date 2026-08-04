/* =========================================================
   SERVICE WORKER
   APP: COSTOS-ALQUILER-EQUIPOS
   Versión de caché: Base maestra 12
   ========================================================= */

"use strict";

const CACHE_VERSION = "2026-07-27-base-12";
const CACHE_NAME = `costos-alquiler-equipos-${CACHE_VERSION}`;

const ARCHIVOS_BASE = [
  "./",
  "./index.html",
  "./entradas.html",
  "./calculo.html",
  "./resumen.html",
  "./catalogo-modelos.html",
  "./equipo.html",

  "./css/styles.css",

  "./js/app.js",
  "./js/entradas.js",
  "./js/calculos.js",
  "./js/resumen.js",
  "./js/catalogo.js",
  "./js/buscador.js",
  "./js/equipo.js",

  "./data/equipos-index.json",

  "./assets/images/logo.png",
  "./assets/icons/favicon.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",

  "./pwa/manifest.webmanifest"
];

/* =========================================================
   INSTALACIÓN
   Guarda solamente los archivos principales de la aplicación.
   Si algún archivo opcional no existe, la instalación continúa.
   ========================================================= */

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const archivo of ARCHIVOS_BASE) {
        try {
          await cache.add(archivo);
        } catch (error) {
          console.warn(
            `[Service Worker] No se pudo precargar: ${archivo}`,
            error
          );
        }
      }
    }).then(() => self.skipWaiting())
  );
});

/* =========================================================
   ACTIVACIÓN
   Elimina todas las versiones antiguas de la caché.
   ========================================================= */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nombresCache) =>
      Promise.all(
        nombresCache.map((nombre) => {
          if (nombre !== CACHE_NAME) {
            return caches.delete(nombre);
          }

          return Promise.resolve(false);
        })
      )
    ).then(() => self.clients.claim())
  );
});

/* =========================================================
   FUNCIONES AUXILIARES
   ========================================================= */

function esArchivoDeDatos(url) {
  return (
    url.pathname.includes("/data/") ||
    url.pathname.endsWith("/datos.js") ||
    url.pathname.endsWith("equipos-index.json")
  );
}

function esArchivoQueDebeActualizarse(url) {
  return (
    esArchivoDeDatos(url) ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".json") ||
    url.pathname.endsWith(".webmanifest")
  );
}

async function redPrimero(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const respuestaRed = await fetch(request, {
      cache: "no-store"
    });

    if (respuestaRed && respuestaRed.ok) {
      await cache.put(request, respuestaRed.clone());
    }

    return respuestaRed;
  } catch (error) {
    const respuestaCache = await cache.match(request);

    if (respuestaCache) {
      return respuestaCache;
    }

    if (request.mode === "navigate") {
      return cache.match("./index.html");
    }

    throw error;
  }
}

async function cachePrimero(request) {
  const cache = await caches.open(CACHE_NAME);
  const respuestaCache = await cache.match(request);

  if (respuestaCache) {
    return respuestaCache;
  }

  const respuestaRed = await fetch(request);

  if (respuestaRed && respuestaRed.ok) {
    await cache.put(request, respuestaRed.clone());
  }

  return respuestaRed;
}

/* =========================================================
   INTERCEPCIÓN DE SOLICITUDES
   - Datos, HTML, JS, CSS y JSON: red primero.
   - Imágenes e íconos: caché primero.
   ========================================================= */

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (esArchivoQueDebeActualizarse(url) || request.mode === "navigate") {
    event.respondWith(redPrimero(request));
    return;
  }

  event.respondWith(cachePrimero(request));
});

/* =========================================================
   MENSAJE PARA FORZAR ACTUALIZACIÓN
   Permite que la aplicación active inmediatamente esta versión.
   ========================================================= */

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});