'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/folios.js
   Propósito: gestión integral de folios de la bitácora
   ========================================================= */

(() => {
  const EVENTOS = Object.freeze({
    LISTO: 'bitacora:folios-listos',
    CREADO: 'bitacora:folio-creado',
    ACTUALIZADO: 'bitacora:folio-actualizado',
    ELIMINADO: 'bitacora:folio-eliminado',
    SELECCIONADO: 'bitacora:folio-seleccionado'
  });

  const ESTADOS = Object.freeze([
    'Borrador',
    'En revisión',
    'Aprobado',
    'Cerrado',
    'Anulado'
  ]);

  let folioActualId = null;

  function utilidades() {
    return window.BitacoraUtilidades || {};
  }

  function estado() {
    return window.BitacoraEstado || null;
  }

  function generarId(prefijo = 'folio') {
    return utilidades().generarId
      ? utilidades().generarId(prefijo)
      : `${prefijo}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function ahoraISO() {
    return utilidades().ahoraISO
      ? utilidades().ahoraISO()
      : new Date().toISOString();
  }

  function hoyISO() {
    if (utilidades().hoyISO) return utilidades().hoyISO();

    const fecha = new Date();
    const diferenciaZona = fecha.getTimezoneOffset() * 60000;

    return new Date(fecha.getTime() - diferenciaZona)
      .toISOString()
      .slice(0, 10);
  }

  function clonar(valor) {
    if (utilidades().clonar) return utilidades().clonar(valor);

    if (typeof structuredClone === 'function') {
      return structuredClone(valor);
    }

    return JSON.parse(JSON.stringify(valor));
  }

  function limpiarTexto(valor) {
    return utilidades().limpiarEspacios
      ? utilidades().limpiarEspacios(valor)
      : String(valor ?? '').replace(/\s+/g, ' ').trim();
  }

  function emitir(nombre, detalle = {}) {
    document.dispatchEvent(
      new CustomEvent(nombre, {
        detail: clonar(detalle)
      })
    );
  }

  function obtenerFolios() {
    return estado()?.obtener?.('registros.folios') || [];
  }

  function obtenerFolioPorId(id) {
    return obtenerFolios().find((folio) => folio.id === id) || null;
  }

  function siguienteConsecutivo() {
    const consecutivos = obtenerFolios()
      .map((folio) => Number(folio.consecutivo))
      .filter(Number.isFinite);

    return consecutivos.length
      ? Math.max(...consecutivos) + 1
      : 1;
  }

  function formatearNumeroFolio(consecutivo) {
    return String(Number(consecutivo) || 0).padStart(4, '0');
  }

  function crearEstructuraFolio(datos = {}) {
    const marcaTiempo = ahoraISO();
    const consecutivo = Number(datos.consecutivo) || siguienteConsecutivo();

    return {
      id: datos.id || generarId('folio'),
      consecutivo,
      numero: datos.numero || formatearNumeroFolio(consecutivo),
      fecha: datos.fecha || hoyISO(),
      titulo: limpiarTexto(datos.titulo || `Folio ${formatearNumeroFolio(consecutivo)}`),
      estado: ESTADOS.includes(datos.estado) ? datos.estado : 'Borrador',
      obraId: datos.obraId || null,
      bitacoraId: datos.bitacoraId || null,
      contenidoHTML: datos.contenidoHTML || '',
      contenidoTexto: datos.contenidoTexto || '',
      observaciones: limpiarTexto(datos.observaciones || ''),
      etiquetas: Array.isArray(datos.etiquetas)
        ? [...new Set(datos.etiquetas.map(limpiarTexto).filter(Boolean))]
        : [],
      anexos: Array.isArray(datos.anexos) ? clonar(datos.anexos) : [],
      imagenes: Array.isArray(datos.imagenes) ? clonar(datos.imagenes) : [],
      firmado: Boolean(datos.firmado),
      auditoria: {
        creadoEn: datos.auditoria?.creadoEn || marcaTiempo,
        actualizadoEn: marcaTiempo,
        creadoPor: datos.auditoria?.creadoPor || null,
        actualizadoPor: datos.auditoria?.actualizadoPor || null,
        version: Number(datos.auditoria?.version) || 1
      }
    };
  }

  function validarFolio(folio) {
    const errores = [];

    if (!folio || typeof folio !== 'object') {
      return ['El folio no es válido.'];
    }

    if (!folio.titulo || !limpiarTexto(folio.titulo)) {
      errores.push('El título del folio es obligatorio.');
    }

    if (!folio.fecha) {
      errores.push('La fecha del folio es obligatoria.');
    }

    if (!ESTADOS.includes(folio.estado)) {
      errores.push('El estado del folio no es válido.');
    }

    const duplicado = obtenerFolios().find(
      (item) =>
        item.id !== folio.id &&
        Number(item.consecutivo) === Number(folio.consecutivo)
    );

    if (duplicado) {
      errores.push('Ya existe otro folio con el mismo consecutivo.');
    }

    return errores;
  }

  function crearFolio(datos = {}, opciones = {}) {
    const nuevoFolio = crearEstructuraFolio(datos);
    const errores = validarFolio(nuevoFolio);

    if (errores.length) {
      throw new Error(errores.join(' '));
    }

    const agregado = estado()?.agregarALista?.(
      'registros.folios',
      nuevoFolio,
      {
        origen: opciones.origen || 'folios',
        marcarCambios: opciones.marcarCambios !== false
      }
    );

    if (!agregado) {
      throw new Error('No fue posible crear el folio.');
    }

    if (opciones.seleccionar !== false) {
      seleccionarFolio(agregado.id, {
        origen: opciones.origen || 'folios'
      });
    }

    emitir(EVENTOS.CREADO, {
      folio: agregado
    });

    return agregado;
  }

  function actualizarFolio(id, cambios = {}, opciones = {}) {
    const actual = obtenerFolioPorId(id);

    if (!actual) {
      throw new Error('El folio solicitado no existe.');
    }

    const actualizado = {
      ...actual,
      ...clonar(cambios),
      id: actual.id,
      consecutivo: cambios.consecutivo !== undefined
        ? Number(cambios.consecutivo)
        : actual.consecutivo,
      titulo: cambios.titulo !== undefined
        ? limpiarTexto(cambios.titulo)
        : actual.titulo,
      observaciones: cambios.observaciones !== undefined
        ? limpiarTexto(cambios.observaciones)
        : actual.observaciones,
      etiquetas: cambios.etiquetas !== undefined
        ? [...new Set(
            (Array.isArray(cambios.etiquetas) ? cambios.etiquetas : [])
              .map(limpiarTexto)
              .filter(Boolean)
          )]
        : actual.etiquetas,
      auditoria: {
        ...actual.auditoria,
        ...(cambios.auditoria || {}),
        actualizadoEn: ahoraISO(),
        version: Number(actual.auditoria?.version || 0) + 1
      }
    };

    actualizado.numero =
      cambios.numero ||
      formatearNumeroFolio(actualizado.consecutivo);

    const errores = validarFolio(actualizado);

    if (errores.length) {
      throw new Error(errores.join(' '));
    }

    const resultado = estado()?.actualizarEnLista?.(
      'registros.folios',
      id,
      actualizado,
      {
        origen: opciones.origen || 'folios',
        marcarCambios: opciones.marcarCambios !== false
      }
    );

    if (!resultado) {
      throw new Error('No fue posible actualizar el folio.');
    }

    emitir(EVENTOS.ACTUALIZADO, {
      folio: resultado
    });

    return resultado;
  }

  function eliminarFolio(id, opciones = {}) {
    const folio = obtenerFolioPorId(id);

    if (!folio) return null;

    if (folio.estado === 'Cerrado' && opciones.forzar !== true) {
      throw new Error(
        'No se puede eliminar un folio cerrado sin autorización expresa.'
      );
    }

    const eliminado = estado()?.eliminarDeLista?.(
      'registros.folios',
      id,
      {
        origen: opciones.origen || 'folios',
        marcarCambios: opciones.marcarCambios !== false
      }
    );

    if (!eliminado) return null;

    if (folioActualId === id) {
      const restantes = obtenerFolios();
      const siguiente = restantes.at(-1) || null;

      folioActualId = siguiente?.id || null;

      estado()?.actualizar?.(
        'sesion.folioActualId',
        folioActualId,
        {
          origen: 'folios',
          marcarCambios: false
        }
      );
    }

    emitir(EVENTOS.ELIMINADO, {
      folio: eliminado
    });

    return eliminado;
  }

  function seleccionarFolio(id, opciones = {}) {
    const folio = obtenerFolioPorId(id);

    if (!folio) {
      throw new Error('El folio solicitado no existe.');
    }

    folioActualId = folio.id;

    estado()?.actualizar?.(
      'sesion.folioActualId',
      folio.id,
      {
        origen: opciones.origen || 'folios',
        marcarCambios: false
      }
    );

    estado()?.actualizarVarios?.(
      {
        'bitacoraActual.folio': folio.numero,
        'bitacoraActual.informacionGeneral.fecha': folio.fecha,
        'bitacoraActual.anotacion.contenidoHTML': folio.contenidoHTML || '',
        'bitacoraActual.anotacion.contenidoTexto': folio.contenidoTexto || '',
        'bitacoraActual.anotacion.observaciones': folio.observaciones || ''
      },
      {
        origen: opciones.origen || 'folios',
        marcarCambios: false
      }
    );

    emitir(EVENTOS.SELECCIONADO, {
      folio
    });

    return clonar(folio);
  }

  function obtenerFolioActual() {
    const id =
      folioActualId ||
      estado()?.obtener?.('sesion.folioActualId');

    return id ? obtenerFolioPorId(id) : null;
  }

  function sincronizarConBitacora() {
    const folio = obtenerFolioActual();
    const bitacora = estado()?.obtener?.('bitacoraActual');

    if (!folio || !bitacora) return null;

    return actualizarFolio(
      folio.id,
      {
        fecha:
          bitacora.informacionGeneral?.fecha ||
          folio.fecha,
        contenidoHTML:
          bitacora.anotacion?.contenidoHTML ||
          '',
        contenidoTexto:
          bitacora.anotacion?.contenidoTexto ||
          '',
        observaciones:
          bitacora.anotacion?.observaciones ||
          '',
        obraId:
          bitacora.obra?.id ||
          folio.obraId,
        bitacoraId:
          bitacora.id ||
          folio.bitacoraId
      },
      {
        origen: 'sincronizacion-bitacora'
      }
    );
  }

  function duplicarFolio(id) {
    const origen = obtenerFolioPorId(id);

    if (!origen) {
      throw new Error('El folio que desea duplicar no existe.');
    }

    return crearFolio(
      {
        ...clonar(origen),
        id: undefined,
        consecutivo: undefined,
        numero: undefined,
        titulo: `${origen.titulo} - copia`,
        estado: 'Borrador',
        firmado: false,
        auditoria: undefined
      },
      {
        origen: 'duplicar-folio'
      }
    );
  }

  function cambiarEstado(id, nuevoEstado) {
    if (!ESTADOS.includes(nuevoEstado)) {
      throw new Error('El estado indicado no es válido.');
    }

    return actualizarFolio(
      id,
      {
        estado: nuevoEstado
      },
      {
        origen: 'cambio-estado'
      }
    );
  }

  function buscarFolios(criterio = '') {
    const texto = utilidades().normalizarTexto
      ? utilidades().normalizarTexto(criterio)
      : limpiarTexto(criterio).toLowerCase();

    if (!texto) return obtenerFolios();

    return obtenerFolios().filter((folio) => {
      const contenido = [
        folio.numero,
        folio.titulo,
        folio.fecha,
        folio.estado,
        folio.contenidoTexto,
        folio.observaciones,
        ...(folio.etiquetas || [])
      ].join(' ');

      const normalizado = utilidades().normalizarTexto
        ? utilidades().normalizarTexto(contenido)
        : contenido.toLowerCase();

      return normalizado.includes(texto);
    });
  }

  function ordenarFolios(campo = 'consecutivo', direccion = 'asc') {
    const folios = obtenerFolios();

    if (utilidades().ordenarPor) {
      return utilidades().ordenarPor(folios, campo, direccion);
    }

    const factor = direccion === 'desc' ? -1 : 1;

    return [...folios].sort((a, b) => {
      if (a[campo] === b[campo]) return 0;
      return a[campo] > b[campo] ? factor : -factor;
    });
  }

  function renumerarFolios() {
    const ordenados = ordenarFolios('consecutivo', 'asc');

    ordenados.forEach((folio, indice) => {
      const consecutivo = indice + 1;

      actualizarFolio(
        folio.id,
        {
          consecutivo,
          numero: formatearNumeroFolio(consecutivo)
        },
        {
          origen: 'renumerar-folios',
          marcarCambios: true
        }
      );
    });

    return obtenerFolios();
  }

  function exportarFolios() {
    return JSON.stringify(
      {
        version: 1,
        fecha: ahoraISO(),
        folios: obtenerFolios()
      },
      null,
      2
    );
  }

  function importarFolios(datos, opciones = {}) {
    const contenido =
      typeof datos === 'string'
        ? JSON.parse(datos)
        : datos;

    const folios = Array.isArray(contenido)
      ? contenido
      : contenido?.folios;

    if (!Array.isArray(folios)) {
      throw new Error('El archivo no contiene una lista válida de folios.');
    }

    const creados = [];

    folios.forEach((folio) => {
      const nuevo = crearFolio(
        {
          ...folio,
          id: opciones.conservarIds ? folio.id : undefined,
          consecutivo: opciones.conservarConsecutivos
            ? folio.consecutivo
            : undefined,
          numero: opciones.conservarConsecutivos
            ? folio.numero
            : undefined
        },
        {
          origen: 'importar-folios',
          seleccionar: false
        }
      );

      creados.push(nuevo);
    });

    if (creados.length && opciones.seleccionarPrimero !== false) {
      seleccionarFolio(creados[0].id, {
        origen: 'importar-folios'
      });
    }

    return creados;
  }

  function asegurarFolioInicial() {
    const folios = obtenerFolios();

    if (folios.length) {
      const idGuardado = estado()?.obtener?.('sesion.folioActualId');
      const inicial =
        folios.find((folio) => folio.id === idGuardado) ||
        folios[0];

      folioActualId = inicial.id;

      estado()?.actualizar?.(
        'sesion.folioActualId',
        inicial.id,
        {
          origen: 'folios',
          marcarCambios: false
        }
      );

      return inicial;
    }

    return crearFolio(
      {
        titulo: 'Folio inicial'
      },
      {
        origen: 'folios-inicial',
        seleccionar: true,
        marcarCambios: false
      }
    );
  }

  function registrarEventos() {
    document.addEventListener(
      'bitacora:bitacora-actualizada',
      (evento) => {
        const ruta = evento.detail?.ruta || '';

        if (
          ruta.includes('anotacion') ||
          ruta.includes('informacionGeneral.fecha')
        ) {
          sincronizarConBitacora();
        }
      }
    );
  }

  function iniciar() {
    registrarEventos();
    asegurarFolioInicial();

    emitir(EVENTOS.LISTO, {
      folios: obtenerFolios(),
      folioActual: obtenerFolioActual()
    });

    console.info('Gestión de folios inicializada.');
  }

  window.BitacoraFolios = Object.freeze({
    EVENTOS,
    ESTADOS,
    iniciar,
    crear: crearFolio,
    actualizar: actualizarFolio,
    eliminar: eliminarFolio,
    seleccionar: seleccionarFolio,
    obtenerTodos: obtenerFolios,
    obtenerPorId: obtenerFolioPorId,
    obtenerActual: obtenerFolioActual,
    buscar: buscarFolios,
    ordenar: ordenarFolios,
    duplicar: duplicarFolio,
    cambiarEstado,
    renumerar: renumerarFolios,
    sincronizarConBitacora,
    exportar: exportarFolios,
    importar: importarFolios,
    siguienteConsecutivo,
    formatearNumero: formatearNumeroFolio
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