'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: electron/dialogos.js
   Propósito: administración de diálogos nativos de Electron
   ========================================================= */

const { app, dialog, ipcMain, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

const CANALES = Object.freeze({
  MENSAJE: 'dialogos:mensaje',
  CONFIRMAR: 'dialogos:confirmar',
  ABRIR_ARCHIVO: 'dialogos:abrir-archivo',
  ABRIR_ARCHIVOS: 'dialogos:abrir-archivos',
  ABRIR_CARPETA: 'dialogos:abrir-carpeta',
  GUARDAR_ARCHIVO: 'dialogos:guardar-archivo',
  SELECCIONAR_IMAGENES: 'dialogos:seleccionar-imagenes',
  SELECCIONAR_ANEXOS: 'dialogos:seleccionar-anexos',
  ERROR: 'dialogos:error',
  ADVERTENCIA: 'dialogos:advertencia',
  INFORMACION: 'dialogos:informacion'
});

const FILTROS = Object.freeze({
  BITACORA: [{ name: 'Bitácora de Obra', extensions: ['json'] }],
  JSON: [{ name: 'Archivos JSON', extensions: ['json'] }],
  IMAGENES: [{
    name: 'Imágenes',
    extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp']
  }],
  DOCUMENTOS: [{
    name: 'Documentos',
    extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt']
  }],
  ANEXOS: [{
    name: 'Archivos permitidos',
    extensions: [
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt',
      'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp',
      'dwg', 'dxf', 'zip'
    ]
  }],
  PDF: [{ name: 'Documento PDF', extensions: ['pdf'] }],
  WORD: [{ name: 'Documento Word', extensions: ['docx'] }],
  ZIP: [{ name: 'Archivo comprimido', extensions: ['zip'] }],
  CSV: [{ name: 'Archivo CSV', extensions: ['csv'] }],
  TODOS: [{ name: 'Todos los archivos', extensions: ['*'] }]
});

const estado = {
  ipcRegistrado: false
};

function obtenerVentanaDesdeEvento(evento) {
  if (!evento?.sender) return null;
  return BrowserWindow.fromWebContents(evento.sender);
}

function resolverVentana(ventana) {
  if (ventana && !ventana.isDestroyed()) return ventana;

  const enfocada = BrowserWindow.getFocusedWindow();
  if (enfocada && !enfocada.isDestroyed()) return enfocada;

  return BrowserWindow
    .getAllWindows()
    .find(item => !item.isDestroyed()) || null;
}

function normalizarFiltros(filtros, predeterminados = FILTROS.TODOS) {
  return Array.isArray(filtros) && filtros.length
    ? filtros
    : predeterminados;
}

function limpiarNombreArchivo(nombre) {
  return String(nombre || '')
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/\.+$/g, '')
    .slice(0, 180);
}

function asegurarExtension(rutaArchivo, extension) {
  if (!rutaArchivo || !extension) return rutaArchivo;

  const ext = String(extension).replace(/^\./, '').toLowerCase();
  const actual = path.extname(rutaArchivo).replace(/^\./, '').toLowerCase();

  return actual === ext ? rutaArchivo : `${rutaArchivo}.${ext}`;
}

function obtenerDirectorioInicial(rutaPreferida) {
  if (rutaPreferida && fs.existsSync(rutaPreferida)) return rutaPreferida;
  return app.getPath('documents');
}

function serializarArchivo(rutaArchivo) {
  if (!rutaArchivo) return null;

  try {
    const stats = fs.statSync(rutaArchivo);

    return {
      ruta: rutaArchivo,
      nombre: path.basename(rutaArchivo),
      extension: path.extname(rutaArchivo).replace(/^\./, '').toLowerCase(),
      tamano: stats.size,
      fechaCreacion: stats.birthtime?.toISOString?.() || null,
      fechaModificacion: stats.mtime?.toISOString?.() || null,
      esArchivo: stats.isFile(),
      esCarpeta: stats.isDirectory()
    };
  }
  catch (error) {
    return {
      ruta: rutaArchivo,
      nombre: path.basename(rutaArchivo),
      extension: path.extname(rutaArchivo).replace(/^\./, '').toLowerCase(),
      tamano: 0,
      fechaCreacion: null,
      fechaModificacion: null,
      esArchivo: false,
      esCarpeta: false,
      error: error.message
    };
  }
}

async function mostrarMensaje(opciones = {}, ventana = null) {
  const configuracion = {
    type: opciones.tipo || opciones.type || 'info',
    title: opciones.titulo || opciones.title || 'Bitácora de Obra',
    message: opciones.mensaje || opciones.message || '',
    detail: opciones.detalle || opciones.detail || '',
    buttons: Array.isArray(opciones.botones) && opciones.botones.length
      ? opciones.botones
      : ['Aceptar'],
    defaultId: Number.isInteger(opciones.botonPredeterminado)
      ? opciones.botonPredeterminado
      : 0,
    cancelId: Number.isInteger(opciones.botonCancelar)
      ? opciones.botonCancelar
      : 0,
    noLink: true,
    normalizeAccessKeys: true
  };

  if (opciones.checkboxLabel) {
    configuracion.checkboxLabel = opciones.checkboxLabel;
    configuracion.checkboxChecked = Boolean(opciones.checkboxChecked);
  }

  const parent = resolverVentana(ventana);
  const resultado = parent
    ? await dialog.showMessageBox(parent, configuracion)
    : await dialog.showMessageBox(configuracion);

  return {
    ok: true,
    respuesta: resultado.response,
    marcado: Boolean(resultado.checkboxChecked)
  };
}

async function confirmar(opciones = {}, ventana = null) {
  const resultado = await mostrarMensaje({
    tipo: opciones.tipo || 'question',
    titulo: opciones.titulo || 'Confirmar acción',
    mensaje: opciones.mensaje || '¿Desea continuar?',
    detalle: opciones.detalle || '',
    botones: opciones.botones || [
      opciones.textoAceptar || 'Aceptar',
      opciones.textoCancelar || 'Cancelar'
    ],
    botonPredeterminado: Number.isInteger(opciones.botonPredeterminado)
      ? opciones.botonPredeterminado
      : 0,
    botonCancelar: Number.isInteger(opciones.botonCancelar)
      ? opciones.botonCancelar
      : 1,
    checkboxLabel: opciones.checkboxLabel,
    checkboxChecked: opciones.checkboxChecked
  }, ventana);

  return {
    ...resultado,
    confirmado: resultado.respuesta === 0
  };
}

function mostrarError(titulo, mensaje) {
  dialog.showErrorBox(
    String(titulo || 'Error'),
    String(mensaje || 'Ocurrió un error inesperado.')
  );

  return { ok: true };
}

async function mostrarAdvertencia(mensaje, detalle = '', ventana = null) {
  return mostrarMensaje({
    tipo: 'warning',
    titulo: 'Advertencia',
    mensaje,
    detalle
  }, ventana);
}

async function mostrarInformacion(mensaje, detalle = '', ventana = null) {
  return mostrarMensaje({
    tipo: 'info',
    titulo: 'Información',
    mensaje,
    detalle
  }, ventana);
}

async function abrirArchivo(opciones = {}, ventana = null) {
  const parent = resolverVentana(ventana);

  const configuracion = {
    title: opciones.titulo || 'Seleccionar archivo',
    defaultPath: obtenerDirectorioInicial(opciones.rutaInicial),
    filters: normalizarFiltros(opciones.filtros, FILTROS.TODOS),
    properties: ['openFile']
  };

  if (opciones.mostrarOcultos) configuracion.properties.push('showHiddenFiles');
  if (opciones.crearDirectorios) configuracion.properties.push('createDirectory');

  const resultado = parent
    ? await dialog.showOpenDialog(parent, configuracion)
    : await dialog.showOpenDialog(configuracion);

  if (resultado.canceled || !resultado.filePaths.length) {
    return { ok: false, cancelado: true, archivo: null };
  }

  return {
    ok: true,
    cancelado: false,
    archivo: serializarArchivo(resultado.filePaths[0])
  };
}

async function abrirArchivos(opciones = {}, ventana = null) {
  const parent = resolverVentana(ventana);

  const configuracion = {
    title: opciones.titulo || 'Seleccionar archivos',
    defaultPath: obtenerDirectorioInicial(opciones.rutaInicial),
    filters: normalizarFiltros(opciones.filtros, FILTROS.TODOS),
    properties: ['openFile', 'multiSelections']
  };

  if (opciones.mostrarOcultos) configuracion.properties.push('showHiddenFiles');

  const resultado = parent
    ? await dialog.showOpenDialog(parent, configuracion)
    : await dialog.showOpenDialog(configuracion);

  if (resultado.canceled || !resultado.filePaths.length) {
    return { ok: false, cancelado: true, archivos: [] };
  }

  return {
    ok: true,
    cancelado: false,
    archivos: resultado.filePaths.map(serializarArchivo)
  };
}

async function abrirCarpeta(opciones = {}, ventana = null) {
  const parent = resolverVentana(ventana);

  const configuracion = {
    title: opciones.titulo || 'Seleccionar carpeta',
    defaultPath: obtenerDirectorioInicial(opciones.rutaInicial),
    properties: ['openDirectory']
  };

  if (opciones.crearDirectorio !== false) {
    configuracion.properties.push('createDirectory');
  }

  if (opciones.mostrarOcultos) {
    configuracion.properties.push('showHiddenFiles');
  }

  const resultado = parent
    ? await dialog.showOpenDialog(parent, configuracion)
    : await dialog.showOpenDialog(configuracion);

  if (resultado.canceled || !resultado.filePaths.length) {
    return { ok: false, cancelado: true, carpeta: null };
  }

  return {
    ok: true,
    cancelado: false,
    carpeta: serializarArchivo(resultado.filePaths[0])
  };
}

async function guardarArchivo(opciones = {}, ventana = null) {
  const parent = resolverVentana(ventana);

  const nombreBase = limpiarNombreArchivo(
    opciones.nombrePredeterminado ||
    opciones.nombreArchivo ||
    'archivo'
  ) || 'archivo';

  const extension = String(opciones.extension || '').replace(/^\./, '');

  const nombreFinal = extension &&
    !nombreBase.toLowerCase().endsWith(`.${extension.toLowerCase()}`)
      ? `${nombreBase}.${extension}`
      : nombreBase;

  const rutaInicial = opciones.rutaInicial &&
    fs.existsSync(opciones.rutaInicial)
      ? opciones.rutaInicial
      : app.getPath('documents');

  const configuracion = {
    title: opciones.titulo || 'Guardar archivo',
    defaultPath: path.join(rutaInicial, nombreFinal),
    filters: normalizarFiltros(
      opciones.filtros,
      extension
        ? [{
            name: opciones.nombreFiltro || `Archivo ${extension.toUpperCase()}`,
            extensions: [extension]
          }]
        : FILTROS.TODOS
    ),
    properties: ['createDirectory', 'showOverwriteConfirmation']
  };

  const resultado = parent
    ? await dialog.showSaveDialog(parent, configuracion)
    : await dialog.showSaveDialog(configuracion);

  if (resultado.canceled || !resultado.filePath) {
    return { ok: false, cancelado: true, ruta: null };
  }

  const ruta = asegurarExtension(resultado.filePath, extension);

  return {
    ok: true,
    cancelado: false,
    ruta,
    nombre: path.basename(ruta),
    extension: path.extname(ruta).replace(/^\./, '').toLowerCase()
  };
}

async function seleccionarImagenes(opciones = {}, ventana = null) {
  return abrirArchivos({
    titulo: opciones.titulo || 'Seleccionar fotografías',
    rutaInicial: opciones.rutaInicial,
    filtros: opciones.filtros || FILTROS.IMAGENES,
    mostrarOcultos: opciones.mostrarOcultos
  }, ventana);
}

async function seleccionarAnexos(opciones = {}, ventana = null) {
  return abrirArchivos({
    titulo: opciones.titulo || 'Seleccionar anexos',
    rutaInicial: opciones.rutaInicial,
    filtros: opciones.filtros || FILTROS.ANEXOS,
    mostrarOcultos: opciones.mostrarOcultos
  }, ventana);
}

function registrarIPC() {
  if (estado.ipcRegistrado) return;

  ipcMain.handle(CANALES.MENSAJE, (evento, opciones = {}) =>
    mostrarMensaje(opciones, obtenerVentanaDesdeEvento(evento))
  );

  ipcMain.handle(CANALES.CONFIRMAR, (evento, opciones = {}) =>
    confirmar(opciones, obtenerVentanaDesdeEvento(evento))
  );

  ipcMain.handle(CANALES.ABRIR_ARCHIVO, (evento, opciones = {}) =>
    abrirArchivo(opciones, obtenerVentanaDesdeEvento(evento))
  );

  ipcMain.handle(CANALES.ABRIR_ARCHIVOS, (evento, opciones = {}) =>
    abrirArchivos(opciones, obtenerVentanaDesdeEvento(evento))
  );

  ipcMain.handle(CANALES.ABRIR_CARPETA, (evento, opciones = {}) =>
    abrirCarpeta(opciones, obtenerVentanaDesdeEvento(evento))
  );

  ipcMain.handle(CANALES.GUARDAR_ARCHIVO, (evento, opciones = {}) =>
    guardarArchivo(opciones, obtenerVentanaDesdeEvento(evento))
  );

  ipcMain.handle(CANALES.SELECCIONAR_IMAGENES, (evento, opciones = {}) =>
    seleccionarImagenes(opciones, obtenerVentanaDesdeEvento(evento))
  );

  ipcMain.handle(CANALES.SELECCIONAR_ANEXOS, (evento, opciones = {}) =>
    seleccionarAnexos(opciones, obtenerVentanaDesdeEvento(evento))
  );

  ipcMain.handle(CANALES.ERROR, (_evento, opciones = {}) =>
    mostrarError(opciones.titulo, opciones.mensaje)
  );

  ipcMain.handle(CANALES.ADVERTENCIA, (evento, opciones = {}) =>
    mostrarAdvertencia(
      opciones.mensaje,
      opciones.detalle,
      obtenerVentanaDesdeEvento(evento)
    )
  );

  ipcMain.handle(CANALES.INFORMACION, (evento, opciones = {}) =>
    mostrarInformacion(
      opciones.mensaje,
      opciones.detalle,
      obtenerVentanaDesdeEvento(evento)
    )
  );

  estado.ipcRegistrado = true;
}

function eliminarIPC() {
  Object.values(CANALES).forEach(canal => ipcMain.removeHandler(canal));
  estado.ipcRegistrado = false;
}

module.exports = Object.freeze({
  CANALES,
  FILTROS,
  registrarIPC,
  eliminarIPC,
  mostrarMensaje,
  confirmar,
  mostrarError,
  mostrarAdvertencia,
  mostrarInformacion,
  abrirArchivo,
  abrirArchivos,
  abrirCarpeta,
  guardarArchivo,
  seleccionarImagenes,
  seleccionarAnexos,
  serializarArchivo
});