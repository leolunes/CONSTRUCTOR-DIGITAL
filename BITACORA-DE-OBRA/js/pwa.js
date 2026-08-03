'use strict';

(() => {
  const APP_VERSION = '1.72.0';
  const UPDATE_CHECK_INTERVAL = 15 * 60 * 1000;
  let registroPwa = null;
  let recargaIniciada = false;
  let cambiosPendientes = false;

  const crearEstilos = () => {
    if (document.getElementById('pwa-actualizacion-estilos')) return;
    const style = document.createElement('style');
    style.id = 'pwa-actualizacion-estilos';
    style.textContent = `
      #pwa-version-indicador {
        position: fixed; left: max(8px, env(safe-area-inset-left));
        bottom: max(8px, env(safe-area-inset-bottom)); z-index: 9996;
        padding: 4px 8px; border-radius: 999px;
        background: rgba(23,59,87,.88); color: #fff;
        font: 600 11px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif;
        box-shadow: 0 2px 8px rgba(0,0,0,.2); pointer-events: none;
      }
      #pwa-actualizacion-aviso {
        position: fixed; z-index: 99999;
        left: 50%; transform: translateX(-50%);
        bottom: max(18px, env(safe-area-inset-bottom));
        width: min(560px, calc(100% - 24px));
        box-sizing: border-box; border-radius: 14px;
        background: #fff; color: #173b57; border: 1px solid #cbd5df;
        box-shadow: 0 12px 35px rgba(0,0,0,.28);
        padding: 16px; font-family: system-ui,-apple-system,"Segoe UI",sans-serif;
      }
      #pwa-actualizacion-aviso[hidden] { display: none !important; }
      .pwa-actualizacion__titulo { margin: 0 0 6px; font-size: 17px; font-weight: 800; }
      .pwa-actualizacion__texto { margin: 0 0 14px; font-size: 14px; line-height: 1.45; color: #3c5265; }
      .pwa-actualizacion__acciones { display: flex; gap: 9px; justify-content: flex-end; flex-wrap: wrap; }
      .pwa-actualizacion__boton { border: 0; border-radius: 9px; padding: 10px 14px; font-weight: 750; cursor: pointer; }
      .pwa-actualizacion__boton--principal { background: #173b57; color: #fff; }
      .pwa-actualizacion__boton--secundario { background: #e9eef2; color: #173b57; }
      @media (max-width: 520px) {
        #pwa-actualizacion-aviso { bottom: max(10px, env(safe-area-inset-bottom)); padding: 14px; }
        .pwa-actualizacion__acciones { display: grid; grid-template-columns: 1fr 1fr; }
        .pwa-actualizacion__boton { width: 100%; }
      }
      @media print {
        #pwa-version-indicador, #pwa-actualizacion-aviso { display: none !important; }
      }
    `;
    document.head.appendChild(style);
  };

  const crearInterfaz = () => {
    crearEstilos();

    if (!document.getElementById('pwa-version-indicador')) {
      const version = document.createElement('div');
      version.id = 'pwa-version-indicador';
      version.textContent = `BITÁCORA DE OBRA · v${APP_VERSION}`;
      version.setAttribute('aria-label', `Versión ${APP_VERSION}`);
      document.body.appendChild(version);
    }

    if (!document.getElementById('pwa-actualizacion-aviso')) {
      const aviso = document.createElement('aside');
      aviso.id = 'pwa-actualizacion-aviso';
      aviso.hidden = true;
      aviso.setAttribute('role', 'dialog');
      aviso.setAttribute('aria-live', 'assertive');
      aviso.setAttribute('aria-labelledby', 'pwa-actualizacion-titulo');
      aviso.innerHTML = `
        <p id="pwa-actualizacion-titulo" class="pwa-actualizacion__titulo">Nueva versión disponible</p>
        <p class="pwa-actualizacion__texto">Se han encontrado mejoras para BITÁCORA DE OBRA. Actualice para usar la versión más reciente.</p>
        <div class="pwa-actualizacion__acciones">
          <button type="button" id="pwa-actualizar-mas-tarde" class="pwa-actualizacion__boton pwa-actualizacion__boton--secundario">Más tarde</button>
          <button type="button" id="pwa-actualizar-ahora" class="pwa-actualizacion__boton pwa-actualizacion__boton--principal">Actualizar ahora</button>
        </div>`;
      document.body.appendChild(aviso);

      aviso.querySelector('#pwa-actualizar-mas-tarde')?.addEventListener('click', () => {
        aviso.hidden = true;
      });

      aviso.querySelector('#pwa-actualizar-ahora')?.addEventListener('click', () => {
        if (cambiosPendientes) {
          const continuar = window.confirm(
            'Hay información que podría no haberse guardado.\n\n' +
            'Pulse Cancelar, guarde el folio y después actualice.\n' +
            'Pulse Aceptar para actualizar ahora.'
          );
          if (!continuar) return;
        }

        const worker = registroPwa?.waiting;
        if (!worker) {
          window.location.reload();
          return;
        }

        const boton = aviso.querySelector('#pwa-actualizar-ahora');
        if (boton) {
          boton.disabled = true;
          boton.textContent = 'Actualizando…';
        }
        worker.postMessage({ type: 'SKIP_WAITING' });
      });
    }
  };

  const mostrarActualizacion = () => {
    crearInterfaz();
    const aviso = document.getElementById('pwa-actualizacion-aviso');
    if (aviso) aviso.hidden = false;
  };

  const vigilarCambiosSinGuardar = () => {
    const marcar = event => {
      const objetivo = event.target;
      if (!(objetivo instanceof Element)) return;
      if (objetivo.closest('#pwa-actualizacion-aviso')) return;
      if (objetivo.matches('input, textarea, select, [contenteditable="true"]')) {
        cambiosPendientes = true;
      }
    };
    document.addEventListener('input', marcar, true);
    document.addEventListener('change', marcar, true);

    // Los botones de guardado conocidos limpian el indicador después de que
    // la lógica actual de la aplicación haya terminado su operación.
    document.addEventListener('click', event => {
      const boton = event.target instanceof Element
        ? event.target.closest('#btn-guardar, #btn-guardar-avance-editor, [data-accion="guardar"]')
        : null;
      if (boton) setTimeout(() => { cambiosPendientes = false; }, 800);
    }, true);

    window.BitacoraPWA = Object.assign(window.BitacoraPWA || {}, {
      version: APP_VERSION,
      marcarGuardado() { cambiosPendientes = false; },
      marcarCambiosPendientes() { cambiosPendientes = true; },
      buscarActualizacion() { return registroPwa?.update(); }
    });
  };

  const iniciar = async () => {
    crearInterfaz();
    vigilarCambiosSinGuardar();

    if (!('serviceWorker' in navigator)) return;
    if (!/^https?:$/.test(window.location.protocol)) return;

    try {
      const swUrl = new URL('../sw.js', document.baseURI);
      const scopeUrl = new URL('../', document.baseURI);
      registroPwa = await navigator.serviceWorker.register(swUrl, {
        scope: scopeUrl.pathname,
        updateViaCache: 'none'
      });

      if (registroPwa.waiting && navigator.serviceWorker.controller) {
        mostrarActualizacion();
      }

      registroPwa.addEventListener('updatefound', () => {
        const worker = registroPwa.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            mostrarActualizacion();
          }
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (recargaIniciada) return;
        recargaIniciada = true;
        window.location.reload();
      });

      // Revisa al abrir, al regresar a la aplicación y periódicamente.
      registroPwa.update().catch(() => {});
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registroPwa?.update().catch(() => {});
      });
      window.setInterval(() => registroPwa?.update().catch(() => {}), UPDATE_CHECK_INTERVAL);
    } catch (error) {
      console.warn('No fue posible registrar o actualizar la PWA:', error);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  } else {
    iniciar();
  }
})();
