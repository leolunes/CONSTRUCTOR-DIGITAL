'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: preload.js
   Propósito: puente seguro entre Electron y la interfaz
   ========================================================= */

const {
  contextBridge,
  ipcRenderer
} = require('electron');

const canalesPermitidos = new Set([
  'archivo:guardar',
  'archivo:guardar-binario',
  'archivo:abrir',
  'archivo:abrir-ruta',
  'archivo:guardar-pdf-html',
  'archivo:seleccionar',
  'carpeta:seleccionar',
  'ventana:imprimir',
  'app:informacion',
  'obras:listar',
  'obras:guardar',
  'obras:eliminar',
  'obras:seleccionar',
  'obras:activa',
  'folios:listar',
  'folios:guardar',
  'folios:eliminar',
  'folios:seleccionar',
  'folios:activo',
  'folios:nuevo-consecutivo',
  'contratistas:listar',
  'contratistas:guardar',
  'contratistas:eliminar',
  'configuracion:obtener',
  'configuracion:guardar',
  'evidencias:seleccionar-imagenes',
  'evidencias:seleccionar-anexos',
  'evidencias:leer-imagen',
  'evidencias:eliminar-imagen',
  'gps:capturar',
  'documentos-obra:listar',
  'documentos-obra:agregar',
  'documentos-obra:abrir',
  'documentos-obra:descargar',
  'documentos-obra:eliminar'
]);

async function invocar(canal, datos = {}) {

  if (!canalesPermitidos.has(canal)) {
    throw new Error(
      `Canal IPC no permitido: ${canal}`
    );
  }

  return ipcRenderer.invoke(
    canal,
    datos
  );
}

contextBridge.exposeInMainWorld(
  'electronAPI',
  Object.freeze({

    guardarArchivo(opciones = {}) {
      return invocar(
        'archivo:guardar',
        opciones
      );
    },

    guardarArchivoBinario(opciones = {}) {
      return invocar(
        'archivo:guardar-binario',
        opciones
      );
    },

    abrirRuta(ruta = '') {
      return invocar('archivo:abrir-ruta', { ruta });
    },

    guardarPDFDesdeHTML(opciones = {}) {
      return invocar('archivo:guardar-pdf-html', opciones);
    },

    abrirArchivo(opciones = {}) {
      return invocar(
        'archivo:abrir',
  'archivo:abrir-ruta',
  'archivo:guardar-pdf-html',
        opciones
      );
    },

    seleccionarArchivos(opciones = {}) {
      return invocar(
        'archivo:seleccionar',
        opciones
      );
    },

    seleccionarCarpeta(opciones = {}) {
      return invocar(
        'carpeta:seleccionar',
        opciones
      );
    },

    imprimir(opciones = {}) {
      return invocar(
        'ventana:imprimir',
        opciones
      );
    },

    obtenerInformacionAplicacion() {
      return invocar(
        'app:informacion'
      );
    }
,

    listarObras() {
      return invocar('obras:listar');
    },

    guardarObra(obra = {}) {
      return invocar('obras:guardar', obra);
    },

    eliminarObra(id) {
      return invocar('obras:eliminar', id);
    },

    seleccionarObra(obra = {}) {
      return invocar('obras:seleccionar', obra);
    },

    obtenerObraActiva() {
      return invocar('obras:activa');
    }

    ,

    listarFolios(filtro = {}) {
      return invocar('folios:listar', filtro);
    },

    guardarFolio(folio = {}) {
      return invocar('folios:guardar', folio);
    },

    eliminarFolio(id) {
      return invocar('folios:eliminar', id);
    },

    seleccionarFolio(folio = {}) {
      return invocar('folios:seleccionar', folio);
    },

    obtenerFolioActivo() {
      return invocar('folios:activo');
    },

    obtenerNuevoConsecutivo(obraId) {
      return invocar('folios:nuevo-consecutivo', obraId);
    }

    ,

    listarContratistas() {
      return invocar('contratistas:listar');
    },

    guardarContratista(contratista = {}) {
      return invocar('contratistas:guardar', contratista);
    },

    eliminarContratista(id) {
      return invocar('contratistas:eliminar', id);
    },

    obtenerConfiguracion(opciones = {}) {
      return invocar('configuracion:obtener', opciones);
    },

    guardarConfiguracion(configuracion = {}, opciones = {}) {
      return invocar('configuracion:guardar', {
        configuracion,
        ...opciones
      });
    }

    ,

    seleccionarImagenesEvidencia(opciones = {}) {
      return invocar(
        'evidencias:seleccionar-imagenes',
        opciones
      );
    },

    seleccionarAnexosEvidencia(opciones = {}) {
      return invocar(
        'evidencias:seleccionar-anexos',
        opciones
      );
    },

    leerImagenEvidencia(imagen = {}) {
      return invocar('evidencias:leer-imagen', imagen);
    },

    eliminarImagenEvidencia(imagen = {}) {
      return invocar('evidencias:eliminar-imagen', imagen);
    },

    listarDocumentosObra(obraId = '') {
      return invocar('documentos-obra:listar', { obraId });
    },

    agregarDocumentosObra(datos = {}) {
      return invocar('documentos-obra:agregar', datos);
    },

    abrirDocumentoObra(documento = {}) {
      return invocar('documentos-obra:abrir', documento);
    },

    descargarDocumentoObra(documento = {}) {
      return invocar('documentos-obra:descargar', documento);
    },

    eliminarDocumentoObra(documento = {}) {
      return invocar('documentos-obra:eliminar', documento);
    },

    capturarGPSWindows() {
      return invocar('gps:capturar');
    }

  })
);

window.addEventListener(
  'DOMContentLoaded',
  () => {

    document.documentElement.setAttribute(
      'data-electron',
      'true'
    );

    console.info(
      'Puente seguro de Electron inicializado.'
    );

  }
);