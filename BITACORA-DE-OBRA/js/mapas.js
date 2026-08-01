'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/mapas.js
   Propósito: gestión de mapas y geolocalización
   Compatible con Leaflet.js
   ========================================================= */

(() => {

  let mapa = null;
  let marcador = null;

  function obtenerObra() {
    return window.BitacoraEstado?.obtener?.('bitacoraActual.obra') || {};
  }

  function coordenadasDefecto() {
    return {
      latitud: 7.12539,
      longitud: -73.11980,
      zoom: 13
    };
  }

  function inicializar(idContenedor = 'mapa') {

    if (typeof L === 'undefined') {
      throw new Error('Leaflet no está disponible.');
    }

    const obra = obtenerObra();

    const lat =
      obra.ubicacion?.latitud ??
      obra.latitud ??
      coordenadasDefecto().latitud;

    const lng =
      obra.ubicacion?.longitud ??
      obra.longitud ??
      coordenadasDefecto().longitud;

    const zoom = coordenadasDefecto().zoom;

    mapa = L.map(idContenedor).setView([lat, lng], zoom);

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap'
      }
    ).addTo(mapa);

    marcador = L.marker([lat, lng]).addTo(mapa);

    document.dispatchEvent(
      new CustomEvent(
        'bitacora:mapa-inicializado',
        {
          detail: { latitud: lat, longitud: lng }
        }
      )
    );

    return mapa;
  }

  function actualizarMarcador(latitud, longitud) {

    if (!mapa || !marcador) return false;

    marcador.setLatLng([latitud, longitud]);
    mapa.setView([latitud, longitud], mapa.getZoom());

    document.dispatchEvent(
      new CustomEvent(
        'bitacora:mapa-actualizado',
        {
          detail: { latitud, longitud }
        }
      )
    );

    return true;
  }

  async function capturarGPS() {

    if (!navigator.geolocation) {
      throw new Error('Geolocalización no soportada.');
    }

    return new Promise((resolve, reject) => {

      navigator.geolocation.getCurrentPosition(

        posicion => {

          const datos = {
            latitud: posicion.coords.latitude,
            longitud: posicion.coords.longitude,
            precision: posicion.coords.accuracy
          };

          actualizarMarcador(
            datos.latitud,
            datos.longitud
          );

          document.dispatchEvent(
            new CustomEvent(
              'bitacora:gps-capturado',
              { detail: datos }
            )
          );

          resolve(datos);

        },

        error => reject(error),

        {
          enableHighAccuracy: true,
          timeout: 10000
        }

      );

    });

  }

  function centrarEnObra() {

    const obra = obtenerObra();

    const lat =
      obra.ubicacion?.latitud ??
      obra.latitud;

    const lng =
      obra.ubicacion?.longitud ??
      obra.longitud;

    if (lat == null || lng == null) {
      return false;
    }

    return actualizarMarcador(lat, lng);
  }

  function destruir() {

    if (mapa) {
      mapa.remove();
      mapa = null;
      marcador = null;
    }

    return true;
  }

  window.BitacoraMapas = Object.freeze({
    inicializar,
    actualizarMarcador,
    capturarGPS,
    centrarEnObra,
    destruir
  });

  console.info('Mapas inicializados.');

})();