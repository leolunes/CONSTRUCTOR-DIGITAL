'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/obras.js
   Propósito: gestión integral de obras y contratos
   ========================================================= */

(() => {
  const EVENTOS = Object.freeze({
    LISTO: 'bitacora:obras-listas',
    CREADA: 'bitacora:obra-creada',
    ACTUALIZADA: 'bitacora:obra-actualizada',
    ELIMINADA: 'bitacora:obra-eliminada',
    SELECCIONADA: 'bitacora:obra-seleccionada'
  });

  const ESTADOS = Object.freeze([
    'Planeación',
    'En ejecución',
    'Suspendida',
    'Terminada',
    'Liquidada',
    'Archivada'
  ]);

  let obraActualId = null;

  function utilidades() {
    return window.BitacoraUtilidades || {};
  }

  function estado() {
    return window.BitacoraEstado || null;
  }

  function generarId(prefijo = 'obra') {
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
    return utilidades().hoyISO
      ? utilidades().hoyISO()
      : new Date().toISOString().slice(0, 10);
  }

  function clonar(valor) {
    return utilidades().clonar
      ? utilidades().clonar(valor)
      : JSON.parse(JSON.stringify(valor));
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

  function obtenerObras() {
    return estado()?.obtener?.('catalogos.obras') || [];
  }

  function obtenerObraPorId(id) {
    return obtenerObras().find((obra) => obra.id === id) || null;
  }

  function crearEstructuraObra(datos = {}) {
    const marcaTiempo = ahoraISO();

    return {
      id: datos.id || generarId('obra'),
      codigo: limpiarTexto(datos.codigo || ''),
      nombre: limpiarTexto(datos.nombre || ''),
      numeroContrato: limpiarTexto(datos.numeroContrato || ''),
      objetoContrato: limpiarTexto(datos.objetoContrato || ''),
      entidadContratante: limpiarTexto(datos.entidadContratante || ''),
      contratistaId: datos.contratistaId || null,
      interventoria: limpiarTexto(datos.interventoria || ''),
      supervisor: limpiarTexto(datos.supervisor || ''),
      telefono: limpiarTexto(datos.telefono || datos.contacto?.telefono || ''),
      estado: ESTADOS.includes(datos.estado)
        ? datos.estado
        : 'Planeación',

      ubicacion: {
        departamento: limpiarTexto(datos.ubicacion?.departamento || datos.departamento || ''),
        municipio: limpiarTexto(datos.ubicacion?.municipio || datos.municipio || ''),
        direccion: limpiarTexto(datos.ubicacion?.direccion || datos.direccion || ''),
        sector: limpiarTexto(datos.ubicacion?.sector || datos.sector || ''),
        latitud:
          datos.ubicacion?.latitud !== undefined
            ? Number(datos.ubicacion.latitud)
            : null,
        longitud:
          datos.ubicacion?.longitud !== undefined
            ? Number(datos.ubicacion.longitud)
            : null,
        precision:
          datos.ubicacion?.precision !== undefined
            ? Number(datos.ubicacion.precision)
            : null
      },

      contrato: {
        fechaInicio: datos.contrato?.fechaInicio || datos.fechaInicio || '',
        fechaTerminacion: datos.contrato?.fechaTerminacion || datos.fechaTerminacion || '',
        plazoDias: Number(datos.contrato?.plazoDias || datos.plazoDias || 0),
        valorInicial: Number(datos.contrato?.valorInicial || datos.valorInicial || 0),
        valorAdiciones: Number(datos.contrato?.valorAdiciones || datos.valorAdiciones || 0),
        valorFinal: Number(datos.contrato?.valorFinal || datos.valorFinal || 0),
        porcentajeAvanceFisico:
          Number(datos.contrato?.porcentajeAvanceFisico || datos.porcentajeAvanceFisico || 0),
        porcentajeAvanceFinanciero:
          Number(datos.contrato?.porcentajeAvanceFinanciero || datos.porcentajeAvanceFinanciero || 0)
      },

      descripcion: limpiarTexto(datos.descripcion || ''),
      observaciones: limpiarTexto(datos.observaciones || ''),
      etiquetas: Array.isArray(datos.etiquetas)
        ? [...new Set(datos.etiquetas.map(limpiarTexto).filter(Boolean))]
        : [],
      documentos: Array.isArray(datos.documentos) ? clonar(datos.documentos) : [],
      imagenes: Array.isArray(datos.imagenes) ? clonar(datos.imagenes) : [],

      auditoria: {
        creadoEn: datos.auditoria?.creadoEn || marcaTiempo,
        actualizadoEn: marcaTiempo,
        creadoPor: datos.auditoria?.creadoPor || null,
        actualizadoPor: datos.auditoria?.actualizadoPor || null,
        version: Number(datos.auditoria?.version) || 1
      }
    };
  }

  function validarObra(obra) {
    const errores = [];

    if (!obra || typeof obra !== 'object') {
      return ['La obra no es válida.'];
    }

    if (!limpiarTexto(obra.nombre)) {
      errores.push('El nombre de la obra es obligatorio.');
    }

    if (!limpiarTexto(obra.numeroContrato)) {
      errores.push('El número de contrato es obligatorio.');
    }

    if (!ESTADOS.includes(obra.estado)) {
      errores.push('El estado de la obra no es válido.');
    }

    const duplicada = obtenerObras().find(
      (item) =>
        item.id !== obra.id &&
        limpiarTexto(item.numeroContrato).toLowerCase() ===
          limpiarTexto(obra.numeroContrato).toLowerCase()
    );

    if (duplicada) {
      errores.push('Ya existe una obra con el mismo número de contrato.');
    }

    const avanceFisico = Number(obra.contrato?.porcentajeAvanceFisico || 0);
    const avanceFinanciero = Number(obra.contrato?.porcentajeAvanceFinanciero || 0);

    if (avanceFisico < 0 || avanceFisico > 100) {
      errores.push('El avance físico debe estar entre 0 y 100.');
    }

    if (avanceFinanciero < 0 || avanceFinanciero > 100) {
      errores.push('El avance financiero debe estar entre 0 y 100.');
    }

    return errores;
  }

  function crearObra(datos = {}, opciones = {}) {
    const nuevaObra = crearEstructuraObra(datos);
    const errores = validarObra(nuevaObra);

    if (errores.length) {
      throw new Error(errores.join(' '));
    }

    const creada = estado()?.agregarALista?.(
      'catalogos.obras',
      nuevaObra,
      {
        origen: opciones.origen || 'obras',
        marcarCambios: opciones.marcarCambios !== false
      }
    );

    if (!creada) {
      throw new Error('No fue posible crear la obra.');
    }

    if (opciones.seleccionar !== false) {
      seleccionarObra(creada.id, {
        origen: opciones.origen || 'obras'
      });
    }

    emitir(EVENTOS.CREADA, { obra: creada });
    return creada;
  }

  function actualizarObra(id, cambios = {}, opciones = {}) {
    const actual = obtenerObraPorId(id);

    if (!actual) {
      throw new Error('La obra solicitada no existe.');
    }

    const actualizada = {
      ...actual,
      ...clonar(cambios),
      id: actual.id,
      nombre:
        cambios.nombre !== undefined
          ? limpiarTexto(cambios.nombre)
          : actual.nombre,
      numeroContrato:
        cambios.numeroContrato !== undefined
          ? limpiarTexto(cambios.numeroContrato)
          : actual.numeroContrato,
      objetoContrato:
        cambios.objetoContrato !== undefined
          ? limpiarTexto(cambios.objetoContrato)
          : actual.objetoContrato,
      entidadContratante:
        cambios.entidadContratante !== undefined
          ? limpiarTexto(cambios.entidadContratante)
          : actual.entidadContratante,
      telefono:
        cambios.telefono !== undefined
          ? limpiarTexto(cambios.telefono)
          : (actual.telefono || ''),
      ubicacion: {
        ...actual.ubicacion,
        ...(cambios.ubicacion || {})
      },
      contrato: {
        ...actual.contrato,
        ...(cambios.contrato || {})
      },
      auditoria: {
        ...actual.auditoria,
        ...(cambios.auditoria || {}),
        actualizadoEn: ahoraISO(),
        version: Number(actual.auditoria?.version || 0) + 1
      }
    };

    if (cambios.etiquetas !== undefined) {
      actualizada.etiquetas = [
        ...new Set(
          (Array.isArray(cambios.etiquetas) ? cambios.etiquetas : [])
            .map(limpiarTexto)
            .filter(Boolean)
        )
      ];
    }

    const errores = validarObra(actualizada);

    if (errores.length) {
      throw new Error(errores.join(' '));
    }

    const resultado = estado()?.actualizarEnLista?.(
      'catalogos.obras',
      id,
      actualizada,
      {
        origen: opciones.origen || 'obras',
        marcarCambios: opciones.marcarCambios !== false
      }
    );

    if (!resultado) {
      throw new Error('No fue posible actualizar la obra.');
    }

    if (obraActualId === id) {
      sincronizarObraConBitacora(resultado);
    }

    emitir(EVENTOS.ACTUALIZADA, { obra: resultado });
    return resultado;
  }

  function eliminarObra(id, opciones = {}) {
    const obra = obtenerObraPorId(id);

    if (!obra) return null;

    if (
      ['En ejecución', 'Suspendida'].includes(obra.estado) &&
      opciones.forzar !== true
    ) {
      throw new Error(
        'No se puede eliminar una obra activa o suspendida sin autorización expresa.'
      );
    }

    const eliminada = estado()?.eliminarDeLista?.(
      'catalogos.obras',
      id,
      {
        origen: opciones.origen || 'obras',
        marcarCambios: opciones.marcarCambios !== false
      }
    );

    if (!eliminada) return null;

    if (obraActualId === id) {
      obraActualId = null;

      estado()?.actualizar?.(
        'sesion.obraActualId',
        null,
        {
          origen: 'obras',
          marcarCambios: false
        }
      );

      limpiarObraActualEnBitacora();
    }

    emitir(EVENTOS.ELIMINADA, { obra: eliminada });
    return eliminada;
  }

  function sincronizarObraConBitacora(obra) {
    if (!obra) return;

    estado()?.actualizarVarios?.(
      {
        'bitacoraActual.obra.id': obra.id,
        'bitacoraActual.obra.nombre': obra.nombre,
        'bitacoraActual.obra.numeroContrato': obra.numeroContrato,
        'bitacoraActual.obra.objetoContrato': obra.objetoContrato,
        'bitacoraActual.obra.entidadContratante': obra.entidadContratante,
        'bitacoraActual.obra.departamento': obra.ubicacion?.departamento || '',
        'bitacoraActual.obra.municipio': obra.ubicacion?.municipio || '',
        'bitacoraActual.obra.direccion': obra.ubicacion?.direccion || '',
        'bitacoraActual.obra.ubicacion.latitud':
          obra.ubicacion?.latitud ?? null,
        'bitacoraActual.obra.ubicacion.longitud':
          obra.ubicacion?.longitud ?? null,
        'bitacoraActual.obra.ubicacion.precision':
          obra.ubicacion?.precision ?? null
      },
      {
        origen: 'obras',
        marcarCambios: false
      }
    );
  }

  function limpiarObraActualEnBitacora() {
    estado()?.actualizarVarios?.(
      {
        'bitacoraActual.obra.id': null,
        'bitacoraActual.obra.nombre': '',
        'bitacoraActual.obra.numeroContrato': '',
        'bitacoraActual.obra.objetoContrato': '',
        'bitacoraActual.obra.entidadContratante': '',
        'bitacoraActual.obra.departamento': '',
        'bitacoraActual.obra.municipio': '',
        'bitacoraActual.obra.direccion': '',
        'bitacoraActual.obra.ubicacion.latitud': null,
        'bitacoraActual.obra.ubicacion.longitud': null,
        'bitacoraActual.obra.ubicacion.precision': null
      },
      {
        origen: 'obras',
        marcarCambios: false
      }
    );
  }

  function seleccionarObra(id, opciones = {}) {
    const obra = obtenerObraPorId(id);

    if (!obra) {
      throw new Error('La obra solicitada no existe.');
    }

    obraActualId = obra.id;

    estado()?.actualizar?.(
      'sesion.obraActualId',
      obra.id,
      {
        origen: opciones.origen || 'obras',
        marcarCambios: false
      }
    );

    sincronizarObraConBitacora(obra);

    emitir(EVENTOS.SELECCIONADA, { obra });
    return clonar(obra);
  }

  function obtenerObraActual() {
    const id =
      obraActualId ||
      estado()?.obtener?.('sesion.obraActualId');

    return id ? obtenerObraPorId(id) : null;
  }

  function buscarObras(criterio = '') {
    const texto = utilidades().normalizarTexto
      ? utilidades().normalizarTexto(criterio)
      : limpiarTexto(criterio).toLowerCase();

    if (!texto) return obtenerObras();

    return obtenerObras().filter((obra) => {
      const contenido = [
        obra.codigo,
        obra.nombre,
        obra.numeroContrato,
        obra.objetoContrato,
        obra.entidadContratante,
        obra.estado,
        obra.ubicacion?.departamento,
        obra.ubicacion?.municipio,
        obra.ubicacion?.direccion,
        obra.descripcion,
        obra.observaciones,
        ...(obra.etiquetas || [])
      ].join(' ');

      const normalizado = utilidades().normalizarTexto
        ? utilidades().normalizarTexto(contenido)
        : contenido.toLowerCase();

      return normalizado.includes(texto);
    });
  }

  function ordenarObras(campo = 'nombre', direccion = 'asc') {
    const obras = obtenerObras();

    if (utilidades().ordenarPor) {
      return utilidades().ordenarPor(obras, campo, direccion);
    }

    const factor = direccion === 'desc' ? -1 : 1;

    return [...obras].sort((a, b) =>
      String(a[campo] || '').localeCompare(
        String(b[campo] || ''),
        'es',
        { sensitivity: 'base', numeric: true }
      ) * factor
    );
  }

  function cambiarEstado(id, nuevoEstado) {
    if (!ESTADOS.includes(nuevoEstado)) {
      throw new Error('El estado indicado no es válido.');
    }

    return actualizarObra(
      id,
      { estado: nuevoEstado },
      { origen: 'cambio-estado-obra' }
    );
  }

  function actualizarAvance(id, avanceFisico, avanceFinanciero) {
    return actualizarObra(
      id,
      {
        contrato: {
          porcentajeAvanceFisico: Math.min(
            Math.max(Number(avanceFisico) || 0, 0),
            100
          ),
          porcentajeAvanceFinanciero: Math.min(
            Math.max(Number(avanceFinanciero) || 0, 0),
            100
          )
        }
      },
      { origen: 'avance-obra' }
    );
  }

  async function capturarUbicacion(id = null) {
    if (!utilidades().obtenerCoordenadas) {
      throw new Error('La función de geolocalización no está disponible.');
    }

    const coordenadas = await utilidades().obtenerCoordenadas();
    const obraId = id || obtenerObraActual()?.id;

    if (!obraId) {
      throw new Error('Debe seleccionar una obra antes de capturar la ubicación.');
    }

    return actualizarObra(
      obraId,
      {
        ubicacion: {
          latitud: coordenadas.latitud,
          longitud: coordenadas.longitud,
          precision: coordenadas.precision
        }
      },
      { origen: 'geolocalizacion-obra' }
    );
  }

  function exportarObras() {
    return JSON.stringify(
      {
        version: 1,
        fecha: ahoraISO(),
        obras: obtenerObras()
      },
      null,
      2
    );
  }

  function importarObras(datos, opciones = {}) {
    const contenido =
      typeof datos === 'string'
        ? JSON.parse(datos)
        : datos;

    const obras = Array.isArray(contenido)
      ? contenido
      : contenido?.obras;

    if (!Array.isArray(obras)) {
      throw new Error('El archivo no contiene una lista válida de obras.');
    }

    const creadas = [];

    obras.forEach((obra) => {
      const nueva = crearObra(
        {
          ...obra,
          id: opciones.conservarIds ? obra.id : undefined
        },
        {
          origen: 'importar-obras',
          seleccionar: false
        }
      );

      creadas.push(nueva);
    });

    if (creadas.length && opciones.seleccionarPrimera !== false) {
      seleccionarObra(creadas[0].id, {
        origen: 'importar-obras'
      });
    }

    return creadas;
  }

  function asegurarSeleccionInicial() {
    const obras = obtenerObras();

    if (!obras.length) return null;

    const idGuardado = estado()?.obtener?.('sesion.obraActualId');
    const inicial =
      obras.find((obra) => obra.id === idGuardado) ||
      obras[0];

    obraActualId = inicial.id;

    estado()?.actualizar?.(
      'sesion.obraActualId',
      inicial.id,
      {
        origen: 'obras',
        marcarCambios: false
      }
    );

    sincronizarObraConBitacora(inicial);
    return inicial;
  }

  function iniciar() {
    asegurarSeleccionInicial();

    emitir(EVENTOS.LISTO, {
      obras: obtenerObras(),
      obraActual: obtenerObraActual()
    });

    console.info('Gestión de obras inicializada.');
  }

  window.BitacoraObras = Object.freeze({
    EVENTOS,
    ESTADOS,
    iniciar,
    crear: crearObra,
    actualizar: actualizarObra,
    eliminar: eliminarObra,
    seleccionar: seleccionarObra,
    obtenerTodas: obtenerObras,
    obtenerPorId: obtenerObraPorId,
    obtenerActual: obtenerObraActual,
    buscar: buscarObras,
    ordenar: ordenarObras,
    cambiarEstado,
    actualizarAvance,
    capturarUbicacion,
    exportar: exportarObras,
    importar: importarObras,
    validar: validarObra
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