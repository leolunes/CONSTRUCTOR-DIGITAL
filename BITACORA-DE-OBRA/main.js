'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: main.js
   Proceso principal de Electron
   ========================================================= */

const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  shell,
  session
} = require('electron');

const path = require('path');
const fs = require('fs/promises');
const { execFile } = require('child_process');

let ventanaPrincipal = null;

function crearVentanaPrincipal() {
  ventanaPrincipal = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    backgroundColor: '#f4f6f8',
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  ventanaPrincipal.loadFile(
    path.join(__dirname, 'app', 'index.html')
  );

  ventanaPrincipal.once('ready-to-show', () => {
    ventanaPrincipal.maximize();
    ventanaPrincipal.show();
  });

  ventanaPrincipal.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  ventanaPrincipal.on('closed', () => {
    ventanaPrincipal = null;
  });
}

ipcMain.handle('archivo:guardar', async (_evento, opciones = {}) => {
  const {
    titulo = 'Guardar archivo',
    nombreSugerido = 'archivo.txt',
    contenido = '',
    filtros = [{ name: 'Todos los archivos', extensions: ['*'] }]
  } = opciones;

  const resultado = await dialog.showSaveDialog(ventanaPrincipal, {
    title: titulo,
    defaultPath: nombreSugerido,
    filters: filtros
  });

  if (resultado.canceled || !resultado.filePath) {
    return { ok: false, cancelado: true };
  }

  await fs.writeFile(resultado.filePath, contenido);

  return {
    ok: true,
    ruta: resultado.filePath
  };
});

ipcMain.handle('archivo:guardar-binario', async (_evento, opciones = {}) => {
  const {
    titulo = 'Guardar archivo',
    nombreSugerido = 'archivo.bin',
    datos = [],
    filtros = [{ name: 'Todos los archivos', extensions: ['*'] }]
  } = opciones;

  const resultado = await dialog.showSaveDialog(ventanaPrincipal, {
    title: titulo,
    defaultPath: nombreSugerido,
    filters: filtros
  });

  if (resultado.canceled || !resultado.filePath) {
    return { ok: false, cancelado: true };
  }

  await fs.writeFile(
    resultado.filePath,
    Buffer.from(datos)
  );

  return {
    ok: true,
    ruta: resultado.filePath
  };
});


ipcMain.handle('archivo:abrir-ruta', async (_evento, opciones = {}) => {
  const ruta = String(opciones.ruta || '').trim();

  if (!ruta) {
    return { ok: false, mensaje: 'No existe una ruta de archivo registrada.' };
  }

  try {
    await fs.access(ruta);
    const error = await shell.openPath(ruta);

    if (error) {
      return { ok: false, mensaje: error };
    }

    return { ok: true, ruta };
  }
  catch {
    return {
      ok: false,
      mensaje: 'El archivo ya no existe en la ubicación donde fue guardado.',
      ruta
    };
  }
});

ipcMain.handle('archivo:guardar-pdf-html', async (_evento, opciones = {}) => {
  const {
    titulo = 'Exportar PDF',
    nombreSugerido = 'bitacora.pdf',
    contenidoHTML = ''
  } = opciones;

  const resultado = await dialog.showSaveDialog(ventanaPrincipal, {
    title: titulo,
    defaultPath: nombreSugerido,
    filters: [{ name: 'Documento PDF', extensions: ['pdf'] }]
  });

  if (resultado.canceled || !resultado.filePath) {
    return { ok: false, cancelado: true };
  }

  const carpetaTemporal = path.join(app.getPath('temp'), 'bitacora-de-obra');
  await fs.mkdir(carpetaTemporal, { recursive: true });
  const archivoTemporal = path.join(
    carpetaTemporal,
    `folio-${Date.now()}-${Math.random().toString(16).slice(2)}.html`
  );

  let ventanaPDF = null;

  try {
    await fs.writeFile(archivoTemporal, contenidoHTML, 'utf8');

    ventanaPDF = new BrowserWindow({
      show: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true
      }
    });

    await ventanaPDF.loadFile(archivoTemporal);
    await new Promise(resolve => setTimeout(resolve, 250));

    const pdf = await ventanaPDF.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: {
        top: 0.45,
        bottom: 0.45,
        left: 0.45,
        right: 0.45
      }
    });

    await fs.writeFile(resultado.filePath, pdf);

    return { ok: true, ruta: resultado.filePath };
  }
  finally {
    if (ventanaPDF && !ventanaPDF.isDestroyed()) ventanaPDF.destroy();
    await fs.unlink(archivoTemporal).catch(() => {});
  }
});

ipcMain.handle('archivo:abrir', async (_evento, opciones = {}) => {
  const {
    titulo = 'Abrir archivo',
    filtros = [{ name: 'Todos los archivos', extensions: ['*'] }]
  } = opciones;

  const resultado = await dialog.showOpenDialog(ventanaPrincipal, {
    title: titulo,
    properties: ['openFile'],
    filters: filtros
  });

  if (resultado.canceled || !resultado.filePaths?.length) {
    return { ok: false, cancelado: true };
  }

  const ruta = resultado.filePaths[0];
  const contenido = await fs.readFile(ruta, 'utf8');

  return {
    ok: true,
    ruta,
    contenido
  };
});

ipcMain.handle('archivo:seleccionar', async (_evento, opciones = {}) => {
  const {
    titulo = 'Seleccionar archivos',
    multiples = false,
    filtros = [{ name: 'Todos los archivos', extensions: ['*'] }]
  } = opciones;

  const properties = ['openFile'];

  if (multiples) {
    properties.push('multiSelections');
  }

  const resultado = await dialog.showOpenDialog(ventanaPrincipal, {
    title: titulo,
    properties,
    filters: filtros
  });

  if (resultado.canceled) {
    return {
      ok: false,
      cancelado: true,
      rutas: []
    };
  }

  return {
    ok: true,
    rutas: resultado.filePaths
  };
});

ipcMain.handle('carpeta:seleccionar', async (_evento, opciones = {}) => {
  const resultado = await dialog.showOpenDialog(ventanaPrincipal, {
    title: opciones.titulo || 'Seleccionar carpeta',
    properties: ['openDirectory', 'createDirectory']
  });

  if (resultado.canceled || !resultado.filePaths?.length) {
    return { ok: false, cancelado: true };
  }

  return {
    ok: true,
    ruta: resultado.filePaths[0]
  };
});

ipcMain.handle('ventana:imprimir', async (_evento, opciones = {}) => {
  if (!ventanaPrincipal) {
    return {
      ok: false,
      mensaje: 'La ventana principal no está disponible.'
    };
  }

  return new Promise((resolve) => {
    ventanaPrincipal.webContents.print(
      {
        silent: false,
        printBackground: true,
        color: true,
        margins: { marginType: 'default' },
        ...opciones
      },
      (exito, razonError) => {
        resolve({
          ok: exito,
          mensaje: razonError || ''
        });
      }
    );
  });
});

ipcMain.handle('app:informacion', async () => ({
  nombre: app.getName(),
  version: app.getVersion(),
  plataforma: process.platform,
  directorioUsuario: app.getPath('userData'),
  directorioDocumentos: app.getPath('documents')
}));



/* =========================================================
   MÓDULO 1 — GESTIÓN PERSISTENTE DE OBRAS
   ========================================================= */

async function obtenerRutaObrasPersistentes() {
  const carpeta = path.join(app.getPath('userData'), 'bitacora-de-obra', 'data');
  await fs.mkdir(carpeta, { recursive: true });
  const archivo = path.join(carpeta, 'obras.json');

  try {
    await fs.access(archivo);
  }
  catch {
    const origen = path.join(__dirname, 'data', 'obras.json');
    try {
      await fs.copyFile(origen, archivo);
    }
    catch {
      await fs.writeFile(archivo, '[]', 'utf8');
    }
  }

  return archivo;
}

async function leerObrasPersistentes() {
  const archivo = await obtenerRutaObrasPersistentes();
  try {
    const contenido = await fs.readFile(archivo, 'utf8');
    const datos = JSON.parse(contenido || '[]');
    return Array.isArray(datos) ? datos : (Array.isArray(datos.obras) ? datos.obras : []);
  }
  catch {
    return [];
  }
}

async function escribirObrasPersistentes(obras) {
  const archivo = await obtenerRutaObrasPersistentes();
  const temporal = `${archivo}.tmp`;
  await fs.writeFile(temporal, JSON.stringify(obras, null, 2), 'utf8');
  await fs.rename(temporal, archivo);
  return archivo;
}

ipcMain.handle('obras:listar', async () => ({
  ok: true,
  obras: await leerObrasPersistentes()
}));

ipcMain.handle('obras:guardar', async (_evento, obra = {}) => {
  const obras = await leerObrasPersistentes();
  const ahora = new Date().toISOString();
  const registro = {
    ...obra,
    id: obra.id || `obra-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    creadoEn: obra.creadoEn || ahora,
    actualizadoEn: ahora
  };
  const indice = obras.findIndex(item => item.id === registro.id);
  if (indice >= 0) obras[indice] = { ...obras[indice], ...registro };
  else obras.push(registro);
  await escribirObrasPersistentes(obras);
  return { ok: true, obra: registro, obras };
});

ipcMain.handle('obras:eliminar', async (_evento, id) => {
  const obras = await leerObrasPersistentes();
  const restantes = obras.filter(item => item.id !== id);
  await escribirObrasPersistentes(restantes);
  return { ok: true, eliminado: obras.length !== restantes.length, obras: restantes };
});

ipcMain.handle('obras:seleccionar', async (_evento, obra = {}) => {
  const carpeta = path.join(app.getPath('userData'), 'bitacora-de-obra', 'data');
  await fs.mkdir(carpeta, { recursive: true });
  const archivo = path.join(carpeta, 'obra-activa.json');

  if (!obra || !obra.id) {
    await fs.unlink(archivo).catch(() => {});
    return { ok: true, obra: null };
  }

  await fs.writeFile(archivo, JSON.stringify(obra, null, 2), 'utf8');
  return { ok: true, obra };
});

ipcMain.handle('obras:activa', async () => {
  const archivo = path.join(app.getPath('userData'), 'bitacora-de-obra', 'data', 'obra-activa.json');
  try {
    const contenido = await fs.readFile(archivo, 'utf8');
    return { ok: true, obra: JSON.parse(contenido) };
  }
  catch {
    return { ok: true, obra: null };
  }
});


/* =========================================================
   MÓDULO 2 — GESTIÓN PERSISTENTE DE FOLIOS
   ========================================================= */

async function obtenerRutaFoliosPersistentes() {
  const carpeta = path.join(
    app.getPath('userData'),
    'bitacora-de-obra',
    'data'
  );

  await fs.mkdir(carpeta, { recursive: true });

  const archivo = path.join(carpeta, 'folios.json');

  try {
    await fs.access(archivo);
  }
  catch {
    const origen = path.join(__dirname, 'data', 'folios.json');

    try {
      await fs.copyFile(origen, archivo);
    }
    catch {
      await fs.writeFile(archivo, '[]', 'utf8');
    }
  }

  return archivo;
}

async function leerFoliosPersistentes() {
  const archivo = await obtenerRutaFoliosPersistentes();

  try {
    const contenido = await fs.readFile(archivo, 'utf8');
    const datos = JSON.parse(contenido || '[]');

    return Array.isArray(datos)
      ? datos
      : (Array.isArray(datos.folios) ? datos.folios : []);
  }
  catch {
    return [];
  }
}

async function escribirFoliosPersistentes(folios) {
  const archivo = await obtenerRutaFoliosPersistentes();
  const temporal = `${archivo}.tmp`;

  await fs.writeFile(
    temporal,
    JSON.stringify(folios, null, 2),
    'utf8'
  );

  await fs.rename(temporal, archivo);

  return archivo;
}

function normalizarNumeroFolio(numero) {
  return String(Number(numero) || 1).padStart(5, '0');
}

ipcMain.handle('folios:listar', async (_evento, filtro = {}) => {
  const folios = await leerFoliosPersistentes();

  const filtrados = filtro.obraId
    ? folios.filter(item => item.obraId === filtro.obraId)
    : folios;

  filtrados.sort((a, b) =>
    Number(a.consecutivo || a.numero || 0) -
    Number(b.consecutivo || b.numero || 0)
  );

  return {
    ok: true,
    folios: filtrados
  };
});

ipcMain.handle('folios:guardar', async (_evento, folio = {}) => {
  if (!folio.obraId) {
    return {
      ok: false,
      mensaje: 'Debe seleccionar una obra antes de guardar el folio.'
    };
  }

  const folios = await leerFoliosPersistentes();
  const ahora = new Date().toISOString();

  let consecutivo = Number(folio.consecutivo || folio.numero || 0);

  if (!consecutivo) {
    const deLaObra = folios.filter(item => item.obraId === folio.obraId);

    consecutivo = deLaObra.length
      ? Math.max(...deLaObra.map(item =>
          Number(item.consecutivo || item.numero || 0)
        )) + 1
      : 1;
  }

  const registro = {
    ...folio,
    id:
      folio.id ||
      `folio-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    obraId: folio.obraId,
    consecutivo,
    numero: normalizarNumeroFolio(consecutivo),
    fecha: folio.fecha || new Date().toISOString().slice(0, 10),
    estadoFolio: folio.estadoFolio || 'Borrador',
    creadoEn: folio.creadoEn || ahora,
    actualizadoEn: ahora
  };

  const indice = folios.findIndex(item => item.id === registro.id);

  if (indice >= 0) {
    folios[indice] = {
      ...folios[indice],
      ...registro
    };
  }
  else {
    folios.push(registro);
  }

  await escribirFoliosPersistentes(folios);

  const carpeta = path.join(
    app.getPath('userData'),
    'bitacora-de-obra',
    'data'
  );

  await fs.writeFile(
    path.join(carpeta, 'folio-activo.json'),
    JSON.stringify(registro, null, 2),
    'utf8'
  );

  return {
    ok: true,
    folio: registro,
    folios
  };
});

ipcMain.handle('folios:eliminar', async (_evento, id) => {
  const folios = await leerFoliosPersistentes();
  const restantes = folios.filter(item => item.id !== id);

  await escribirFoliosPersistentes(restantes);

  const activo = path.join(
    app.getPath('userData'),
    'bitacora-de-obra',
    'data',
    'folio-activo.json'
  );

  try {
    const actual = JSON.parse(await fs.readFile(activo, 'utf8'));

    if (actual?.id === id) {
      await fs.unlink(activo).catch(() => {});
    }
  }
  catch {
    // No existe folio activo.
  }

  return {
    ok: true,
    eliminado: folios.length !== restantes.length,
    folios: restantes
  };
});

ipcMain.handle('folios:seleccionar', async (_evento, folio = {}) => {
  const carpeta = path.join(
    app.getPath('userData'),
    'bitacora-de-obra',
    'data'
  );

  await fs.mkdir(carpeta, { recursive: true });
  const archivo = path.join(carpeta, 'folio-activo.json');

  if (!folio || !folio.id) {
    await fs.unlink(archivo).catch(() => {});
    return { ok: true, folio: null };
  }

  await fs.writeFile(
    archivo,
    JSON.stringify(folio, null, 2),
    'utf8'
  );

  return {
    ok: true,
    folio
  };
});

ipcMain.handle('folios:activo', async () => {
  const archivo = path.join(
    app.getPath('userData'),
    'bitacora-de-obra',
    'data',
    'folio-activo.json'
  );

  try {
    const contenido = await fs.readFile(archivo, 'utf8');

    return {
      ok: true,
      folio: JSON.parse(contenido)
    };
  }
  catch {
    return {
      ok: true,
      folio: null
    };
  }
});

ipcMain.handle('folios:nuevo-consecutivo', async (_evento, obraId) => {
  const folios = await leerFoliosPersistentes();
  const deLaObra = folios.filter(item => item.obraId === obraId);

  const consecutivo = deLaObra.length
    ? Math.max(...deLaObra.map(item =>
        Number(item.consecutivo || item.numero || 0)
      )) + 1
    : 1;

  return {
    ok: true,
    consecutivo,
    numero: normalizarNumeroFolio(consecutivo)
  };
});



/* =========================================================
   MÓDULO COMPLEMENTARIO — CONTRATISTAS Y CONFIGURACIÓN
   ========================================================= */

async function obtenerRutaDatosAplicacion(nombreArchivo) {
  const carpeta = path.join(
    app.getPath('userData'),
    'bitacora-de-obra',
    'data'
  );

  await fs.mkdir(carpeta, { recursive: true });

  return path.join(carpeta, nombreArchivo);
}

async function leerJSONAplicacion(nombreArchivo, valorPredeterminado) {
  const archivo = await obtenerRutaDatosAplicacion(nombreArchivo);

  try {
    const contenido = await fs.readFile(archivo, 'utf8');
    return JSON.parse(contenido);
  }
  catch {
    await fs.writeFile(
      archivo,
      JSON.stringify(valorPredeterminado, null, 2),
      'utf8'
    );

    return valorPredeterminado;
  }
}

async function escribirJSONAplicacion(nombreArchivo, datos) {
  const archivo = await obtenerRutaDatosAplicacion(nombreArchivo);
  const temporal = `${archivo}.tmp`;

  await fs.writeFile(
    temporal,
    JSON.stringify(datos, null, 2),
    'utf8'
  );

  await fs.rename(temporal, archivo);

  return archivo;
}

ipcMain.handle('contratistas:listar', async () => {
  const contratistas = await leerJSONAplicacion(
    'contratistas.json',
    []
  );

  return {
    ok: true,
    contratistas: Array.isArray(contratistas)
      ? contratistas
      : []
  };
});

ipcMain.handle('contratistas:guardar', async (_evento, contratista = {}) => {
  const contratistas = await leerJSONAplicacion(
    'contratistas.json',
    []
  );

  const nombre = String(
    contratista.nombre ||
    contratista.nombreRazonSocial ||
    ''
  ).trim();

  const nit = String(
    contratista.nit ||
    contratista.nitDocumento ||
    ''
  ).trim();

  if (!nombre || !nit) {
    return {
      ok: false,
      mensaje: 'El nombre o razón social y el NIT son obligatorios.'
    };
  }

  const ahora = new Date().toISOString();

  const registro = {
    ...contratista,
    id:
      contratista.id ||
      `contratista-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    nombre,
    nit,
    creadoEn:
      contratista.creadoEn ||
      ahora,
    actualizadoEn: ahora
  };

  const indice = contratistas.findIndex(
    item => item.id === registro.id
  );

  if (indice >= 0) {
    contratistas[indice] = {
      ...contratistas[indice],
      ...registro
    };
  }
  else {
    contratistas.push(registro);
  }

  await escribirJSONAplicacion(
    'contratistas.json',
    contratistas
  );

  return {
    ok: true,
    contratista: registro,
    contratistas
  };
});

ipcMain.handle('contratistas:eliminar', async (_evento, id) => {
  const contratistas = await leerJSONAplicacion(
    'contratistas.json',
    []
  );

  const restantes = contratistas.filter(
    item => item.id !== id
  );

  await escribirJSONAplicacion(
    'contratistas.json',
    restantes
  );

  return {
    ok: true,
    eliminado:
      restantes.length !== contratistas.length,
    contratistas: restantes
  };
});

const CONFIGURACION_PREDETERMINADA = Object.freeze({
  empresaNombre: '',
  empresaNit: '',
  empresaDireccion: '',
  empresaTelefono: '',
  idioma: 'es-CO',
  formatoFecha: 'DD/MM/YYYY',
  guardadoAutomatico: true,
  intervaloGuardadoSegundos: 30,
  confirmarEliminacion: true
});

async function obtenerObraActivaPersistida() {
  const archivo = path.join(
    app.getPath('userData'),
    'bitacora-de-obra',
    'data',
    'obra-activa.json'
  );

  try {
    const contenido = await fs.readFile(archivo, 'utf8');
    return JSON.parse(contenido);
  }
  catch {
    return null;
  }
}

async function resolverObraConfiguracion(datos = {}) {
  if (datos && typeof datos === 'object' && datos.obraId) {
    return {
      id: String(datos.obraId),
      nombre: String(datos.obraNombre || '')
    };
  }

  return obtenerObraActivaPersistida();
}

ipcMain.handle('configuracion:obtener', async (_evento, datos = {}) => {
  const obra = await resolverObraConfiguracion(datos);
  const configuracionGeneral = await leerJSONAplicacion(
    'configuracion-aplicacion.json',
    CONFIGURACION_PREDETERMINADA
  );

  if (!obra?.id) {
    return {
      ok: true,
      obra: null,
      esConfiguracionPorObra: false,
      configuracion: {
        ...CONFIGURACION_PREDETERMINADA,
        ...(configuracionGeneral || {})
      }
    };
  }

  const configuraciones = await leerJSONAplicacion(
    'configuraciones-obras.json',
    {}
  );

  return {
    ok: true,
    obra,
    esConfiguracionPorObra: true,
    configuracion: {
      ...CONFIGURACION_PREDETERMINADA,
      ...(configuracionGeneral || {}),
      ...(configuraciones?.[obra.id] || {}),
      obraId: obra.id,
      obraNombre: obra.nombre || configuraciones?.[obra.id]?.obraNombre || ''
    }
  };
});

ipcMain.handle('configuracion:guardar', async (_evento, datos = {}) => {
  const envoltura = datos && datos.configuracion
    ? datos
    : { configuracion: datos };

  const configuracion = { ...(envoltura.configuracion || {}) };
  const obra = await resolverObraConfiguracion({
    obraId: envoltura.obraId || configuracion.obraId,
    obraNombre: envoltura.obraNombre || configuracion.obraNombre
  });

  if (!obra?.id) {
    await escribirJSONAplicacion(
      'configuracion-aplicacion.json',
      configuracion
    );

    return {
      ok: true,
      obra: null,
      esConfiguracionPorObra: false,
      configuracion
    };
  }

  const configuraciones = await leerJSONAplicacion(
    'configuraciones-obras.json',
    {}
  );

  const registro = {
    ...configuracion,
    obraId: obra.id,
    obraNombre: obra.nombre || configuracion.obraNombre || '',
    actualizadoEn: new Date().toISOString()
  };

  configuraciones[obra.id] = registro;
  await escribirJSONAplicacion(
    'configuraciones-obras.json',
    configuraciones
  );

  return {
    ok: true,
    obra,
    esConfiguracionPorObra: true,
    configuracion: registro
  };
});



/* =========================================================
   SELECCIÓN NATIVA DE EVIDENCIAS
   ========================================================= */

function segmentoSeguro(valor, respaldo) {
  const limpio = String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return limpio || respaldo;
}

async function obtenerCarpetaImagenesFolio(opciones = {}) {
  const obra = segmentoSeguro(opciones.obraId, 'obra-sin-id');
  const folio = segmentoSeguro(
    opciones.folioId || opciones.folioNumero,
    `folio-${Date.now()}`
  );

  const carpeta = path.join(
    app.getPath('userData'),
    'bitacora-de-obra',
    'storage',
    'imagenes',
    obra,
    folio
  );

  await fs.mkdir(carpeta, { recursive: true });
  return carpeta;
}

function tipoImagenPorExtension(extension) {
  const tipos = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    bmp: 'image/bmp'
  };

  return tipos[extension] || 'application/octet-stream';
}

ipcMain.handle(
  'evidencias:seleccionar-imagenes',
  async (_evento, opciones = {}) => {
    const resultado = await dialog.showOpenDialog(
      ventanaPrincipal,
      {
        title: opciones.titulo || 'Seleccionar fotografías',
        properties: ['openFile', 'multiSelections'],
        filters: [{
          name: 'Imágenes',
          extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp']
        }]
      }
    );

    if (resultado.canceled || !resultado.filePaths?.length) {
      return { ok: false, cancelado: true, archivos: [] };
    }

    const carpetaDestino = await obtenerCarpetaImagenesFolio(opciones);
    const archivos = [];

    for (let indice = 0; indice < resultado.filePaths.length; indice += 1) {
      const rutaOrigen = resultado.filePaths[indice];
      const extension = path.extname(rutaOrigen).replace('.', '').toLowerCase();
      const nombreOriginal = path.basename(rutaOrigen);
      const base = segmentoSeguro(path.basename(rutaOrigen, path.extname(rutaOrigen)), 'foto');
      const nombreInterno = `${Date.now()}-${indice + 1}-${base}.${extension || 'jpg'}`;
      const rutaDestino = path.join(carpetaDestino, nombreInterno);

      await fs.copyFile(rutaOrigen, rutaDestino);
      const datos = await fs.readFile(rutaDestino);
      const tipo = tipoImagenPorExtension(extension);

      archivos.push({
        id: `imagen-${Date.now()}-${indice + 1}-${Math.random().toString(16).slice(2)}`,
        numero: indice + 1,
        nombre: nombreOriginal,
        nombreOriginal,
        nombreInterno,
        ruta: rutaDestino,
        tipo,
        tamano: datos.length,
        descripcion: '',
        fechaAgregada: new Date().toISOString(),
        datos: `data:${tipo};base64,${datos.toString('base64')}`
      });
    }

    return { ok: true, archivos };
  }
);

ipcMain.handle('evidencias:leer-imagen', async (_evento, imagen = {}) => {
  const ruta = imagen.ruta;

  if (!ruta) {
    return { ok: false, mensaje: 'La fotografía no tiene una ruta registrada.' };
  }

  try {
    const datos = await fs.readFile(ruta);
    const extension = path.extname(ruta).replace('.', '').toLowerCase();
    const tipo = imagen.tipo || tipoImagenPorExtension(extension);

    return {
      ok: true,
      datos: `data:${tipo};base64,${datos.toString('base64')}`,
      tamano: datos.length,
      tipo
    };
  }
  catch (error) {
    return {
      ok: false,
      mensaje: `No fue posible leer la fotografía: ${error.message}`
    };
  }
});

ipcMain.handle('evidencias:eliminar-imagen', async (_evento, imagen = {}) => {
  if (!imagen.ruta) return { ok: true, eliminado: false };

  try {
    await fs.unlink(imagen.ruta);
    return { ok: true, eliminado: true };
  }
  catch (error) {
    if (error.code === 'ENOENT') return { ok: true, eliminado: false };
    return { ok: false, mensaje: error.message };
  }
});

ipcMain.handle(
  'evidencias:seleccionar-anexos',
  async (_evento, opciones = {}) => {
    const resultado = await dialog.showOpenDialog(
      ventanaPrincipal,
      {
        title:
          opciones.titulo ||
          'Seleccionar anexos',
        properties: [
          'openFile',
          'multiSelections'
        ],
        filters: [
          {
            name: 'Documentos',
            extensions: [
              'pdf',
              'doc',
              'docx',
              'xls',
              'xlsx',
              'csv',
              'txt',
              'jpg',
              'jpeg',
              'png',
              'zip'
            ]
          },
          {
            name: 'Todos los archivos',
            extensions: ['*']
          }
        ]
      }
    );

    if (
      resultado.canceled ||
      !resultado.filePaths?.length
    ) {
      return {
        ok: false,
        cancelado: true,
        archivos: []
      };
    }

    const archivos = [];

    for (const ruta of resultado.filePaths) {
      const datos = await fs.readFile(ruta);
      const extension =
        path.extname(ruta)
          .replace('.', '')
          .toLowerCase();

      const tipos = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        csv: 'text/csv',
        txt: 'text/plain',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        zip: 'application/zip'
      };

      const tipo =
        tipos[extension] ||
        'application/octet-stream';

      archivos.push({
        nombre: path.basename(ruta),
        ruta,
        tipo,
        tamano: datos.length,
        datos:
          `data:${tipo};base64,` +
          datos.toString('base64')
      });
    }

    return {
      ok: true,
      archivos
    };
  }
);


/* =========================================================
   GPS NATIVO DE WINDOWS
   Usa el servicio de ubicación de Windows desde el proceso
   principal. Evita depender exclusivamente del proveedor de
   geolocalización de Chromium/Electron.
   ========================================================= */
ipcMain.handle('gps:capturar', async () => {
  if (process.platform !== 'win32') {
    return {
      ok: false,
      codigo: 'PLATAFORMA_NO_COMPATIBLE',
      mensaje: 'La captura GPS nativa está disponible en Windows.'
    };
  }

  const script = `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Device
$watcher = New-Object System.Device.Location.GeoCoordinateWatcher([System.Device.Location.GeoPositionAccuracy]::High)
$watcher.MovementThreshold = 1
$watcher.Start()
$limite = (Get-Date).AddSeconds(30)
while ((Get-Date) -lt $limite -and $watcher.Status -ne [System.Device.Location.GeoPositionStatus]::Ready) {
  Start-Sleep -Milliseconds 250
}
if ($watcher.Status -ne [System.Device.Location.GeoPositionStatus]::Ready) {
  $estado = $watcher.Status.ToString()
  $watcher.Stop()
  throw "El servicio de ubicación de Windows no estuvo disponible. Estado: $estado"
}
$ubicacion = $watcher.Position.Location
$watcher.Stop()
if ($ubicacion.IsUnknown) {
  throw 'Windows no devolvió una ubicación válida.'
}
[pscustomobject]@{
  latitude = $ubicacion.Latitude
  longitude = $ubicacion.Longitude
  accuracy = $ubicacion.HorizontalAccuracy
  timestamp = (Get-Date).ToUniversalTime().ToString('o')
} | ConvertTo-Json -Compress
`;

  const ejecutar = archivo => new Promise((resolve, reject) => {
    execFile(
      archivo,
      ['-NoProfile', '-STA', '-ExecutionPolicy', 'Bypass', '-Command', script],
      { windowsHide: true, timeout: 40000, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          const detalle = String(stderr || error.message || '').trim();
          reject(new Error(detalle || 'No fue posible consultar la ubicación de Windows.'));
          return;
        }
        resolve(String(stdout || '').trim());
      }
    );
  });

  try {
    let salida;
    try {
      salida = await ejecutar('powershell.exe');
    } catch (errorPowerShell) {
      salida = await ejecutar('powershell');
    }

    const datos = JSON.parse(salida);
    const latitud = Number(datos.latitude);
    const longitud = Number(datos.longitude);
    const precision = Number(datos.accuracy || 0);

    if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
      throw new Error('Windows devolvió coordenadas inválidas.');
    }

    return {
      ok: true,
      latitud,
      longitud,
      precision: Number.isFinite(precision) ? precision : 0,
      fecha: datos.timestamp || new Date().toISOString(),
      fuente: 'windows'
    };
  } catch (error) {
    return {
      ok: false,
      codigo: 'GPS_WINDOWS_NO_DISPONIBLE',
      mensaje: error?.message || 'No fue posible obtener la ubicación de Windows.'
    };
  }
});



/* =========================================================
   MÓDULO DOCUMENTOS DE LA OBRA
   ========================================================= */

function limpiarNombreDocumento(nombre = '') {
  return String(nombre)
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180) || `documento-${Date.now()}`;
}

async function obtenerCarpetaDocumentosObra(obraId) {
  const idSeguro = limpiarNombreDocumento(obraId || 'obra-sin-id');
  const carpeta = path.join(
    app.getPath('userData'),
    'bitacora-de-obra',
    'obras',
    idSeguro,
    'documentos'
  );
  await fs.mkdir(carpeta, { recursive: true });
  return carpeta;
}

async function leerIndiceDocumentosObra(obraId) {
  const carpeta = await obtenerCarpetaDocumentosObra(obraId);
  const indice = path.join(carpeta, 'documentos.json');
  try {
    const contenido = await fs.readFile(indice, 'utf8');
    const datos = JSON.parse(contenido || '[]');
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

async function guardarIndiceDocumentosObra(obraId, documentos) {
  const carpeta = await obtenerCarpetaDocumentosObra(obraId);
  const indice = path.join(carpeta, 'documentos.json');
  const temporal = `${indice}.tmp`;
  await fs.writeFile(temporal, JSON.stringify(documentos, null, 2), 'utf8');
  await fs.rename(temporal, indice);
}

ipcMain.handle('documentos-obra:listar', async (_evento, { obraId } = {}) => {
  if (!obraId) return { ok: false, mensaje: 'No se indicó la obra.' };
  return { ok: true, documentos: await leerIndiceDocumentosObra(obraId) };
});

ipcMain.handle('documentos-obra:agregar', async (_evento, datos = {}) => {
  const obraId = String(datos.obraId || '').trim();
  if (!obraId) return { ok: false, mensaje: 'Seleccione una obra.' };

  const resultado = await dialog.showOpenDialog(ventanaPrincipal, {
    title: 'Agregar documentos de la obra',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Documentos de obra', extensions: ['pdf','doc','docx','xls','xlsx','ppt','pptx','csv','txt','jpg','jpeg','png','webp','dwg','dxf','zip','rar'] },
      { name: 'Todos los archivos', extensions: ['*'] }
    ]
  });

  if (resultado.canceled || !resultado.filePaths?.length) {
    return { ok: false, cancelado: true };
  }

  const carpeta = await obtenerCarpetaDocumentosObra(obraId);
  const documentos = await leerIndiceDocumentosObra(obraId);
  const agregados = [];

  for (const origen of resultado.filePaths) {
    const info = await fs.stat(origen);
    const nombreOriginal = path.basename(origen);
    const extension = path.extname(nombreOriginal).toLowerCase();
    const base = limpiarNombreDocumento(path.basename(nombreOriginal, extension));
    let nombreGuardado = `${base}${extension}`;
    let destino = path.join(carpeta, nombreGuardado);
    let n = 2;
    while (true) {
      try { await fs.access(destino); nombreGuardado = `${base} (${n++})${extension}`; destino = path.join(carpeta, nombreGuardado); }
      catch { break; }
    }
    await fs.copyFile(origen, destino);
    const registro = {
      id: `doc-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      obraId,
      nombre: nombreOriginal,
      nombreGuardado,
      ruta: destino,
      extension,
      tipo: extension.replace('.', '').toUpperCase() || 'ARCHIVO',
      tamano: info.size,
      categoria: datos.categoria || 'Otros',
      descripcion: datos.descripcion || '',
      cargadoEn: new Date().toISOString()
    };
    documentos.push(registro);
    agregados.push(registro);
  }

  await guardarIndiceDocumentosObra(obraId, documentos);
  return { ok: true, documentos, agregados };
});

ipcMain.handle('documentos-obra:abrir', async (_evento, documento = {}) => {
  const ruta = String(documento.ruta || '').trim();
  if (!ruta) return { ok: false, mensaje: 'El documento no tiene una ruta válida.' };
  try {
    await fs.access(ruta);
    const error = await shell.openPath(ruta);
    return error ? { ok: false, mensaje: error } : { ok: true };
  } catch {
    return { ok: false, mensaje: 'El archivo no existe o fue movido.' };
  }
});

ipcMain.handle('documentos-obra:descargar', async (_evento, documento = {}) => {
  const ruta = String(documento.ruta || '').trim();
  if (!ruta) return { ok: false, mensaje: 'El documento no tiene una ruta válida.' };
  const resultado = await dialog.showSaveDialog(ventanaPrincipal, {
    title: 'Guardar copia del documento',
    defaultPath: documento.nombre || path.basename(ruta),
    filters: [{ name: 'Archivo', extensions: [path.extname(ruta).replace('.', '') || '*'] }]
  });
  if (resultado.canceled || !resultado.filePath) return { ok: false, cancelado: true };
  await fs.copyFile(ruta, resultado.filePath);
  return { ok: true, ruta: resultado.filePath };
});

ipcMain.handle('documentos-obra:eliminar', async (_evento, documento = {}) => {
  const obraId = String(documento.obraId || '').trim();
  const id = String(documento.id || '').trim();
  if (!obraId || !id) return { ok: false, mensaje: 'Documento inválido.' };
  const documentos = await leerIndiceDocumentosObra(obraId);
  const actual = documentos.find(item => item.id === id);
  if (actual?.ruta) await fs.unlink(actual.ruta).catch(() => {});
  const restantes = documentos.filter(item => item.id !== id);
  await guardarIndiceDocumentosObra(obraId, restantes);
  return { ok: true, documentos: restantes };
});

app.whenReady().then(() => {
  // Autoriza la geolocalización únicamente para las ventanas locales
  // de la aplicación. Sin este permiso Electron puede bloquear el GPS
  // aunque Windows tenga activados los servicios de ubicación.
  const sesion = session.defaultSession;

  sesion.setPermissionCheckHandler((_webContents, permiso, origen) => {
    if (permiso !== 'geolocation') return false;

    return (
      origen.startsWith('file://') ||
      origen.startsWith('http://localhost') ||
      origen.startsWith('http://127.0.0.1')
    );
  });

  sesion.setPermissionRequestHandler((webContents, permiso, callback) => {
    const url = webContents?.getURL?.() || '';
    const esOrigenLocal =
      url.startsWith('file://') ||
      url.startsWith('http://localhost') ||
      url.startsWith('http://127.0.0.1');

    callback(permiso === 'geolocation' && esOrigenLocal);
  });

  crearVentanaPrincipal();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      crearVentanaPrincipal();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('uncaughtException', (error) => {
  console.error('Error no controlado en el proceso principal:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Promesa rechazada sin controlar:', error);
});