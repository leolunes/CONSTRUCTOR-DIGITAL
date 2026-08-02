'use strict';

const CACHE_VERSION = 'bitacora-obra-v1.62.0';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './app/',
  './app/index.html',
  './app/obras.html',
  './app/contratistas.html',
  './app/configuracion.html',
  './app/historial.html',
  './app/anexos.html',
  './app/vista-previa.html',
  './css/variables.css',
  './css/general.css',
  './css/menu.css',
  './css/bitacora.css',
  './css/editor.css',
  './css/formularios.css',
  './css/modales.css',
  './css/impresion.css',
  './css/responsive.css',
  './css/evidencias-ubicacion.css',
  './css/obras-pagina.css',
  './css/contratistas-pagina.css',
  './css/historial-folios.css',
  './js/browser-api.js',
  './js/ipc-renderer.js',
  './js/pwa.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navegación: red primero para publicar cambios inmediatamente; si no hay
  // conexión, usa la página exacta almacenada o la entrada principal.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          return (await caches.match(request, { ignoreSearch: true })) ||
                 (await caches.match('./app/index.html')) ||
                 (await caches.match('./index.html'));
        })
    );
    return;
  }

  // Recursos locales: caché primero con actualización silenciosa.
  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
        }
        return response;
      });
      return cached || network;
    })
  );
});
