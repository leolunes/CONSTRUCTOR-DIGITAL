'use strict';

(() => {
  const APP_VERSION = '1.73.0';
  const VERSION_URL = new URL('../version.json', document.baseURI).href;
  const UPDATE_CHECK_INTERVAL = 15 * 60 * 1000;
  let registroPwa = null;
  let recargaIniciada = false;
  let cambiosPendientes = false;
  let versionPublicada = APP_VERSION;

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
      #pwa-toggle-herramientas { display:none; }
      @media (max-width: 640px) {
        #pwa-toggle-herramientas {
          display:flex; align-items:center; justify-content:center; gap:8px;
          width:calc(100% - 20px); margin:8px 10px; padding:10px 12px;
          border:1px solid #b8c7d3; border-radius:9px;
          background:#173b57; color:#fff; font-weight:800; font-size:15px;
          box-shadow:0 2px 7px rgba(15,79,120,.18);
        }
        .barra-superior.herramientas-movil-ocultas .barra-herramientas { display:none !important; }
        .barra-superior .barra-herramientas { max-height:72vh; overflow:auto; -webkit-overflow-scrolling:touch; }
        .barra-superior .menu-principal { position:relative; z-index:2; }
      }
      @media print {
        #pwa-version-indicador, #pwa-actualizacion-aviso, #pwa-toggle-herramientas { display: none !important; }
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

      aviso.querySelector('#pwa-actualizar-ahora')?.addEventListener('click', async () => {
        if (cambiosPendientes) {
          const continuar = window.confirm(
            'Hay información que podría no haberse guardado.\n\n' +
            'Pulse Cancelar, guarde el folio y después actualice.\n' +
            'Pulse Aceptar para actualizar ahora.'
          );
          if (!continuar) return;
        }

        const boton = aviso.querySelector('#pwa-actualizar-ahora');
        if (boton) {
          boton.disabled = true;
          boton.textContent = 'Actualizando…';
        }

        try {
          await registroPwa?.update();
          await new Promise(resolve => setTimeout(resolve, 1200));
          const worker = registroPwa?.waiting;
          if (worker) {
            worker.postMessage({ type: 'SKIP_WAITING' });
            return;
          }

          // Respaldo específico para Safari/iPhone: elimina solo cachés de la app
          // y recarga con un parámetro de versión para forzar archivos nuevos.
          if ('caches' in window) {
            const nombres = await caches.keys();
            await Promise.all(nombres.filter(n => n.startsWith('bitacora-obra-')).map(n => caches.delete(n)));
          }
          const url = new URL(window.location.href);
          url.searchParams.set('actualizacion', versionPublicada || Date.now());
          window.location.replace(url.href);
        } catch (error) {
          console.warn('No fue posible completar la actualización:', error);
          window.location.reload();
        }
      });
    }
  };

  const mostrarActualizacion = () => {
    crearInterfaz();
    const aviso = document.getElementById('pwa-actualizacion-aviso');
    if (aviso) aviso.hidden = false;
  };

  const compararVersiones = (a, b) => {
    const pa = String(a || '').split('.').map(n => Number.parseInt(n, 10) || 0);
    const pb = String(b || '').split('.').map(n => Number.parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
      if ((pa[i] || 0) > (pb[i] || 0)) return 1;
      if ((pa[i] || 0) < (pb[i] || 0)) return -1;
    }
    return 0;
  };

  const consultarVersionPublicada = async () => {
    try {
      const url = new URL(VERSION_URL);
      url.searchParams.set('_', Date.now().toString());
      const respuesta = await fetch(url.href, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
      if (!respuesta.ok) return false;
      const datos = await respuesta.json();
      versionPublicada = String(datos.version || '').trim() || APP_VERSION;
      if (compararVersiones(versionPublicada, APP_VERSION) > 0) {
        mostrarActualizacion();
        registroPwa?.update().catch(() => {});
        return true;
      }
    } catch (error) {
      console.warn('No fue posible consultar version.json:', error);
    }
    return false;
  };

  const configurarHerramientasMoviles = () => {
    const cabecera = document.querySelector('.barra-superior');
    const herramientas = cabecera?.querySelector('.barra-herramientas');
    if (!cabecera || !herramientas || document.getElementById('pwa-toggle-herramientas')) return;

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.id = 'pwa-toggle-herramientas';
    boton.setAttribute('aria-controls', 'barra-herramientas-principal');
    herramientas.id ||= 'barra-herramientas-principal';

    const clave = 'bitacora-herramientas-movil-abiertas';
    const esMovil = () => window.matchMedia('(max-width: 640px)').matches;
    const aplicar = abierta => {
      const ocultas = esMovil() && !abierta;
      cabecera.classList.toggle('herramientas-movil-ocultas', ocultas);
      boton.setAttribute('aria-expanded', String(!ocultas));
      boton.textContent = ocultas ? '☰ Mostrar herramientas' : '✕ Ocultar herramientas';
    };

    let abiertas = false;
    try { abiertas = localStorage.getItem(clave) === '1'; } catch (_) {}
    aplicar(abiertas);
    cabecera.insertBefore(boton, herramientas);

    boton.addEventListener('click', () => {
      abiertas = cabecera.classList.contains('herramientas-movil-ocultas');
      aplicar(abiertas);
      try { localStorage.setItem(clave, abiertas ? '1' : '0'); } catch (_) {}
      if (abiertas) herramientas.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });

    window.addEventListener('resize', () => aplicar(abiertas), { passive: true });
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
    configurarHerramientasMoviles();
    vigilarCambiosSinGuardar();
    consultarVersionPublicada();

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
        if (document.visibilityState === 'visible') { registroPwa?.update().catch(() => {}); consultarVersionPublicada(); }
      });
      window.setInterval(() => { registroPwa?.update().catch(() => {}); consultarVersionPublicada(); }, UPDATE_CHECK_INTERVAL);
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
