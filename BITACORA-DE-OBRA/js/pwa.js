'use strict';

(() => {
  if (!('serviceWorker' in navigator)) return;
  if (!/^https?:$/.test(window.location.protocol)) return;

  window.addEventListener('load', async () => {
    try {
      // document.baseURI está dentro de /app/. Subimos un nivel para registrar
      // el SW en la raíz de BITACORA-DE-OBRA, sin depender del dominio ni de
      // la subcarpeta usada por GitHub Pages.
      const swUrl = new URL('../sw.js', document.baseURI);
      const scopeUrl = new URL('../', document.baseURI);
      const registro = await navigator.serviceWorker.register(swUrl, {
        scope: scopeUrl.pathname
      });

      // Activa una actualización lista sin exigir cerrar todas las pestañas.
      if (registro.waiting) registro.waiting.postMessage({ type: 'SKIP_WAITING' });
      registro.addEventListener('updatefound', () => {
        const worker = registro.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            worker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    } catch (error) {
      console.warn('No fue posible registrar la PWA:', error);
    }
  });
})();
