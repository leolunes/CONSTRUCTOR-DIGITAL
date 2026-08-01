'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/almacenamiento.js
   Propósito: persistencia local centralizada
   ========================================================= */

(() => {
  const CLAVES = Object.freeze({
    ESTADO: 'bitacora.estado',
    CONFIGURACION: 'bitacora.configuracion',
    RESPALDO: 'bitacora.respaldo',
    VERSION: 1
  });

  function ahora() {
    return new Date().toISOString();
  }

  function leer(clave, defecto = null) {
    try {
      const texto = localStorage.getItem(clave);
      return texto ? JSON.parse(texto) : defecto;
    } catch (e) {
      console.error(e);
      return defecto;
    }
  }

  function escribir(clave, valor) {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  function eliminar(clave) {
    localStorage.removeItem(clave);
  }

  function guardarEstado() {
    const estado = window.BitacoraEstado?.obtener?.();
    if (!estado) return false;

    return escribir(CLAVES.ESTADO, {
      version: CLAVES.VERSION,
      fecha: ahora(),
      estado
    });
  }

  function cargarEstado() {
    const datos = leer(CLAVES.ESTADO);
    if (!datos?.estado) return false;

    window.BitacoraEstado?.reemplazar?.(
      datos.estado,
      {
        origen: 'almacenamiento',
        marcarCambios: false
      }
    );

    return true;
  }

  function guardarConfiguracion(configuracion) {
    return escribir(CLAVES.CONFIGURACION, {
      fecha: ahora(),
      configuracion
    });
  }

  function cargarConfiguracion() {
    return leer(CLAVES.CONFIGURACION, {});
  }

  function crearRespaldo() {
    const estado = window.BitacoraEstado?.obtener?.();
    if (!estado) return null;

    const respaldo = {
      version: CLAVES.VERSION,
      fecha: ahora(),
      estado
    };

    escribir(CLAVES.RESPALDO, respaldo);
    return respaldo;
  }

  function restaurarRespaldo() {
    const respaldo = leer(CLAVES.RESPALDO);
    if (!respaldo?.estado) return false;

    window.BitacoraEstado?.reemplazar?.(
      respaldo.estado,
      {
        origen: 'respaldo',
        marcarCambios: false
      }
    );

    return true;
  }

  function limpiarTodo() {
    eliminar(CLAVES.ESTADO);
    eliminar(CLAVES.CONFIGURACION);
    eliminar(CLAVES.RESPALDO);
  }

  document.addEventListener(
    'bitacora:estado-cambio',
    () => {
      guardarEstado();
    }
  );

  window.addEventListener(
    'beforeunload',
    () => {
      guardarEstado();
    }
  );

  function iniciar() {
    cargarEstado();

    document.dispatchEvent(
      new CustomEvent(
        'bitacora:almacenamiento-listo'
      )
    );

    console.info(
      'Almacenamiento inicializado.'
    );
  }

  window.BitacoraAlmacenamiento =
    Object.freeze({
      iniciar,
      leer,
      escribir,
      eliminar,
      guardarEstado,
      cargarEstado,
      guardarConfiguracion,
      cargarConfiguracion,
      crearRespaldo,
      restaurarRespaldo,
      limpiarTodo
    });

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      iniciar,
      { once: true }
    );
  } else {
    iniciar();
  }

})();