'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/estado.js
   Propósito: estado global centralizado de la aplicación
   ========================================================= */

(() => {
  const VERSION_ESTADO = 1;

  const EVENTOS = Object.freeze({
    CAMBIO: 'bitacora:estado-cambio',
    REEMPLAZADO: 'bitacora:estado-reemplazado',
    REINICIADO: 'bitacora:estado-reiniciado',
    BITACORA_ACTUALIZADA: 'bitacora:bitacora-actualizada',
    OBRA_ACTUALIZADA: 'bitacora:obra-actualizada',
    CONFIGURACION_ACTUALIZADA: 'bitacora:configuracion-actualizada'
  });

  function generarId(prefijo = 'id') {
    if (window.crypto?.randomUUID) {
      return `${prefijo}-${window.crypto.randomUUID()}`;
    }

    return `${prefijo}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function ahoraISO() {
    return new Date().toISOString();
  }

  function hoyISO() {
    const fecha = new Date();
    const diferenciaZona = fecha.getTimezoneOffset() * 60000;

    return new Date(fecha.getTime() - diferenciaZona)
      .toISOString()
      .slice(0, 10);
  }

  function crearEstadoInicial() {
    const marcaTiempo = ahoraISO();

    return {
      meta: {
        version: VERSION_ESTADO,
        creadoEn: marcaTiempo,
        actualizadoEn: marcaTiempo
      },

      aplicacion: {
        lista: false,
        cargando: false,
        guardando: false,
        cambiosPendientes: false,
        ultimoError: null,
        ultimoMensaje: '',
        modo: 'edicion'
      },

      usuario: {
        id: null,
        nombre: '',
        cargo: '',
        entidad: '',
        correo: ''
      },

      configuracion: {
        nombreAplicacion: 'Bitácora de Obra',
        idioma: 'es-CO',
        zonaHoraria: 'America/Bogota',
        formatoFecha: 'DD/MM/YYYY',
        guardadoAutomatico: true,
        intervaloGuardadoSegundos: 30,
        tema: 'claro',
        mostrarAyudas: true
      },

      sesion: {
        obraActualId: null,
        contratistaActualId: null,
        bitacoraActualId: null,
        folioActualId: null,
        vistaActual: 'bitacora',
        panelActual: null,
        busquedaActual: '',
        filtros: {}
      },

      catalogos: {
        obras: [],
        contratistas: [],
        usuarios: [],
        tiposAnexo: [],
        estadosBitacora: [
          'Borrador',
          'En revisión',
          'Aprobada',
          'Cerrada',
          'Anulada'
        ],
        condicionesClimaticas: [
          'Soleado',
          'Parcialmente nublado',
          'Nublado',
          'Lluvia ligera',
          'Lluvia fuerte',
          'Tormenta'
        ]
      },

      bitacoraActual: crearBitacoraVacia(),

      registros: {
        bitacoras: [],
        folios: [],
        anexos: [],
        imagenes: []
      },

      interfaz: {
        modalAbierto: null,
        menuExpandido: false,
        notificaciones: [],
        seleccion: null,
        editor: {
          palabras: 0,
          caracteres: 0,
          contenidoHTML: '',
          contenidoTexto: ''
        }
      }
    };
  }

  function crearBitacoraVacia() {
    const marcaTiempo = ahoraISO();

    return {
      id: generarId('bitacora'),
      consecutivo: null,
      folio: '',
      estado: 'Borrador',

      informacionGeneral: {
        fecha: hoyISO(),
        horaInicio: '',
        horaFin: '',
        jornada: '',
        numeroActa: '',
        referencia: ''
      },

      obra: {
        id: null,
        nombre: '',
        numeroContrato: '',
        objetoContrato: '',
        entidadContratante: '',
        municipio: '',
        departamento: '',
        direccion: '',
        ubicacion: {
          latitud: null,
          longitud: null,
          precision: null
        }
      },

      actores: {
        contratista: {
          id: null,
          nombre: '',
          nit: '',
          representanteLegal: '',
          residente: ''
        },
        interventoria: {
          nombre: '',
          nit: '',
          director: '',
          residente: ''
        },
        supervision: {
          entidad: '',
          supervisor: '',
          cargo: ''
        }
      },

      condiciones: {
        clima: '',
        temperatura: null,
        precipitacion: '',
        estadoTerreno: '',
        observaciones: ''
      },

      actividades: [],
      personal: [],
      equipos: [],
      materiales: [],
      ensayos: [],
      seguridadSST: [],
      ambiental: [],

      anotacion: {
        contenidoHTML: '',
        contenidoTexto: '',
        observaciones: '',
        compromisos: '',
        pendientes: ''
      },

      anexos: [],
      imagenes: [],
      planos: [],
      documentos: [],

      firmas: {
        contratista: null,
        interventoria: null,
        supervision: null
      },

      auditoria: {
        creadoEn: marcaTiempo,
        actualizadoEn: marcaTiempo,
        creadoPor: null,
        actualizadoPor: null,
        version: 1
      }
    };
  }

  let estado = crearEstadoInicial();
  const suscriptores = new Set();

  function clonar(valor) {
    if (typeof structuredClone === 'function') {
      return structuredClone(valor);
    }

    return JSON.parse(JSON.stringify(valor));
  }

  function esObjetoPlano(valor) {
    return (
      valor !== null &&
      typeof valor === 'object' &&
      !Array.isArray(valor)
    );
  }

  function fusionarProfundo(destino, fuente) {
    const resultado = clonar(destino);

    Object.entries(fuente || {}).forEach(([clave, valor]) => {
      if (esObjetoPlano(valor) && esObjetoPlano(resultado[clave])) {
        resultado[clave] = fusionarProfundo(resultado[clave], valor);
      } else {
        resultado[clave] = clonar(valor);
      }
    });

    return resultado;
  }

  function obtenerRuta(objeto, ruta) {
    if (!ruta) return objeto;

    const partes = Array.isArray(ruta)
      ? ruta
      : String(ruta).split('.').filter(Boolean);

    return partes.reduce(
      (acumulado, parte) =>
        acumulado !== undefined && acumulado !== null
          ? acumulado[parte]
          : undefined,
      objeto
    );
  }

  function establecerRuta(objeto, ruta, valor) {
    const partes = Array.isArray(ruta)
      ? ruta
      : String(ruta).split('.').filter(Boolean);

    if (!partes.length) {
      throw new Error('La ruta del estado no puede estar vacía.');
    }

    let referencia = objeto;

    for (let i = 0; i < partes.length - 1; i += 1) {
      const parte = partes[i];

      if (!esObjetoPlano(referencia[parte]) && !Array.isArray(referencia[parte])) {
        referencia[parte] = {};
      }

      referencia = referencia[parte];
    }

    referencia[partes.at(-1)] = clonar(valor);
  }

  function emitir(nombreEvento, detalle) {
    document.dispatchEvent(
      new CustomEvent(nombreEvento, {
        detail: clonar(detalle)
      })
    );
  }

  function notificar(cambio) {
    const instantanea = obtenerEstado();

    suscriptores.forEach((suscriptor) => {
      try {
        suscriptor(instantanea, cambio);
      } catch (error) {
        console.error('Error en un suscriptor del estado:', error);
      }
    });

    emitir(EVENTOS.CAMBIO, {
      cambio,
      estado: instantanea
    });
  }

  function obtenerEstado(ruta = null) {
    const valor = ruta ? obtenerRuta(estado, ruta) : estado;
    return clonar(valor);
  }

  function actualizarEstado(ruta, valor, opciones = {}) {
    const estadoAnterior = obtenerEstado();

    establecerRuta(estado, ruta, valor);
    estado.meta.actualizadoEn = ahoraISO();

    if (opciones.marcarCambios !== false) {
      estado.aplicacion.cambiosPendientes = true;
    }

    const cambio = {
      tipo: 'actualizacion',
      ruta: Array.isArray(ruta) ? ruta.join('.') : String(ruta),
      valor: clonar(valor),
      anterior: obtenerRuta(estadoAnterior, ruta),
      fecha: ahoraISO(),
      origen: opciones.origen || 'desconocido'
    };

    notificar(cambio);

    if (cambio.ruta.startsWith('bitacoraActual')) {
      emitir(EVENTOS.BITACORA_ACTUALIZADA, {
        ruta: cambio.ruta,
        valor: cambio.valor
      });
    }

    if (cambio.ruta.startsWith('bitacoraActual.obra')) {
      emitir(EVENTOS.OBRA_ACTUALIZADA, {
        ruta: cambio.ruta,
        valor: cambio.valor
      });
    }

    if (cambio.ruta.startsWith('configuracion')) {
      emitir(EVENTOS.CONFIGURACION_ACTUALIZADA, {
        ruta: cambio.ruta,
        valor: cambio.valor
      });
    }

    return obtenerEstado(ruta);
  }

  function actualizarVarios(cambios, opciones = {}) {
    if (!esObjetoPlano(cambios)) {
      throw new TypeError('Los cambios deben enviarse como un objeto.');
    }

    const estadoAnterior = obtenerEstado();

    Object.entries(cambios).forEach(([ruta, valor]) => {
      establecerRuta(estado, ruta, valor);
    });

    estado.meta.actualizadoEn = ahoraISO();

    if (opciones.marcarCambios !== false) {
      estado.aplicacion.cambiosPendientes = true;
    }

    const cambio = {
      tipo: 'actualizacion-multiple',
      cambios: clonar(cambios),
      anterior: estadoAnterior,
      fecha: ahoraISO(),
      origen: opciones.origen || 'desconocido'
    };

    notificar(cambio);
    return obtenerEstado();
  }

  function reemplazarEstado(nuevoEstado, opciones = {}) {
    if (!esObjetoPlano(nuevoEstado)) {
      throw new TypeError('El nuevo estado debe ser un objeto.');
    }

    const base = crearEstadoInicial();
    estado = fusionarProfundo(base, nuevoEstado);
    estado.meta.version = VERSION_ESTADO;
    estado.meta.actualizadoEn = ahoraISO();

    if (opciones.marcarCambios === false) {
      estado.aplicacion.cambiosPendientes = false;
    }

    const cambio = {
      tipo: 'reemplazo',
      fecha: ahoraISO(),
      origen: opciones.origen || 'desconocido'
    };

    notificar(cambio);
    emitir(EVENTOS.REEMPLAZADO, obtenerEstado());

    return obtenerEstado();
  }

  function reiniciarEstado() {
    estado = crearEstadoInicial();

    const cambio = {
      tipo: 'reinicio',
      fecha: ahoraISO(),
      origen: 'sistema'
    };

    notificar(cambio);
    emitir(EVENTOS.REINICIADO, obtenerEstado());

    return obtenerEstado();
  }

  function reiniciarBitacoraActual() {
    const nuevaBitacora = crearBitacoraVacia();

    estado.bitacoraActual = nuevaBitacora;
    estado.sesion.bitacoraActualId = nuevaBitacora.id;
    estado.aplicacion.cambiosPendientes = false;
    estado.meta.actualizadoEn = ahoraISO();

    const cambio = {
      tipo: 'nueva-bitacora',
      ruta: 'bitacoraActual',
      valor: clonar(nuevaBitacora),
      fecha: ahoraISO(),
      origen: 'sistema'
    };

    notificar(cambio);
    emitir(EVENTOS.BITACORA_ACTUALIZADA, nuevaBitacora);

    return clonar(nuevaBitacora);
  }

  function actualizarBitacora(parcial, opciones = {}) {
    if (!esObjetoPlano(parcial)) {
      throw new TypeError('La actualización de la bitácora debe ser un objeto.');
    }

    estado.bitacoraActual = fusionarProfundo(
      estado.bitacoraActual,
      parcial
    );

    estado.bitacoraActual.auditoria.actualizadoEn = ahoraISO();
    estado.bitacoraActual.auditoria.version =
      Number(estado.bitacoraActual.auditoria.version || 0) + 1;

    estado.aplicacion.cambiosPendientes =
      opciones.marcarCambios !== false;

    estado.meta.actualizadoEn = ahoraISO();

    const cambio = {
      tipo: 'actualizacion-bitacora',
      ruta: 'bitacoraActual',
      valor: clonar(parcial),
      fecha: ahoraISO(),
      origen: opciones.origen || 'desconocido'
    };

    notificar(cambio);
    emitir(EVENTOS.BITACORA_ACTUALIZADA, {
      cambio: clonar(parcial),
      bitacora: clonar(estado.bitacoraActual)
    });

    return clonar(estado.bitacoraActual);
  }

  function agregarALista(ruta, elemento, opciones = {}) {
    const lista = obtenerRuta(estado, ruta);

    if (!Array.isArray(lista)) {
      throw new TypeError(`La ruta "${ruta}" no contiene una lista.`);
    }

    const nuevoElemento = {
      id: elemento?.id || generarId('item'),
      ...clonar(elemento)
    };

    lista.push(nuevoElemento);
    estado.meta.actualizadoEn = ahoraISO();

    if (opciones.marcarCambios !== false) {
      estado.aplicacion.cambiosPendientes = true;
    }

    const cambio = {
      tipo: 'agregar-lista',
      ruta: String(ruta),
      valor: clonar(nuevoElemento),
      fecha: ahoraISO(),
      origen: opciones.origen || 'desconocido'
    };

    notificar(cambio);
    return clonar(nuevoElemento);
  }

  function actualizarEnLista(ruta, id, cambios, opciones = {}) {
    const lista = obtenerRuta(estado, ruta);

    if (!Array.isArray(lista)) {
      throw new TypeError(`La ruta "${ruta}" no contiene una lista.`);
    }

    const indice = lista.findIndex((item) => item.id === id);

    if (indice < 0) return null;

    lista[indice] = fusionarProfundo(lista[indice], cambios);
    estado.meta.actualizadoEn = ahoraISO();

    if (opciones.marcarCambios !== false) {
      estado.aplicacion.cambiosPendientes = true;
    }

    const cambio = {
      tipo: 'actualizar-lista',
      ruta: String(ruta),
      id,
      valor: clonar(cambios),
      fecha: ahoraISO(),
      origen: opciones.origen || 'desconocido'
    };

    notificar(cambio);
    return clonar(lista[indice]);
  }

  function eliminarDeLista(ruta, id, opciones = {}) {
    const lista = obtenerRuta(estado, ruta);

    if (!Array.isArray(lista)) {
      throw new TypeError(`La ruta "${ruta}" no contiene una lista.`);
    }

    const indice = lista.findIndex((item) => item.id === id);

    if (indice < 0) return null;

    const [eliminado] = lista.splice(indice, 1);
    estado.meta.actualizadoEn = ahoraISO();

    if (opciones.marcarCambios !== false) {
      estado.aplicacion.cambiosPendientes = true;
    }

    const cambio = {
      tipo: 'eliminar-lista',
      ruta: String(ruta),
      id,
      valor: clonar(eliminado),
      fecha: ahoraISO(),
      origen: opciones.origen || 'desconocido'
    };

    notificar(cambio);
    return clonar(eliminado);
  }

  function marcarGuardado() {
    estado.aplicacion.guardando = false;
    estado.aplicacion.cambiosPendientes = false;
    estado.aplicacion.ultimoError = null;
    estado.meta.actualizadoEn = ahoraISO();

    if (estado.bitacoraActual?.auditoria) {
      estado.bitacoraActual.auditoria.actualizadoEn = ahoraISO();
    }

    notificar({
      tipo: 'guardado',
      fecha: ahoraISO(),
      origen: 'sistema'
    });
  }

  function registrarError(error, contexto = '') {
    const detalle = {
      mensaje: error?.message || String(error || 'Error desconocido'),
      contexto,
      fecha: ahoraISO()
    };

    estado.aplicacion.ultimoError = detalle;
    estado.aplicacion.cargando = false;
    estado.aplicacion.guardando = false;
    estado.meta.actualizadoEn = ahoraISO();

    notificar({
      tipo: 'error',
      valor: detalle,
      fecha: detalle.fecha,
      origen: contexto || 'desconocido'
    });

    return clonar(detalle);
  }

  function suscribir(suscriptor) {
    if (typeof suscriptor !== 'function') {
      throw new TypeError('El suscriptor debe ser una función.');
    }

    suscriptores.add(suscriptor);

    return () => {
      suscriptores.delete(suscriptor);
    };
  }

  function exportarEstado() {
    return JSON.stringify(obtenerEstado(), null, 2);
  }

  function importarEstado(texto, opciones = {}) {
    const datos =
      typeof texto === 'string'
        ? JSON.parse(texto)
        : texto;

    return reemplazarEstado(datos, {
      origen: opciones.origen || 'importacion',
      marcarCambios: opciones.marcarCambios ?? false
    });
  }

  window.BitacoraEstado = Object.freeze({
    VERSION_ESTADO,
    EVENTOS,
    obtener: obtenerEstado,
    actualizar: actualizarEstado,
    actualizarVarios,
    reemplazar: reemplazarEstado,
    reiniciar: reiniciarEstado,
    crearBitacoraVacia,
    reiniciarBitacoraActual,
    actualizarBitacora,
    agregarALista,
    actualizarEnLista,
    eliminarDeLista,
    marcarGuardado,
    registrarError,
    suscribir,
    exportar: exportarEstado,
    importar: importarEstado
  });

  document.dispatchEvent(
    new CustomEvent('bitacora:estado-listo', {
      detail: obtenerEstado()
    })
  );

  console.info('Estado global de la Bitácora de Obra inicializado.');
})();