'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: electron/archivos.js
   Propósito:
   - Lectura y escritura segura de archivos.
   - Gestión de carpetas, imágenes y anexos.
   - Copias de seguridad y restauración.
   - Importación y exportación de datos.
   - Verificación de integridad mediante hash.
   - Registro de canales IPC para el proceso renderer.
   ========================================================= */

const {
  app,
  ipcMain,
  shell,
  BrowserWindow
} = require('electron');

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');

/* =========================================================
   CONSTANTES
   ========================================================= */

const CANALES = Object.freeze({
  LEER_TEXTO: 'archivos:leer-texto',
  LEER_JSON: 'archivos:leer-json',
  ESCRIBIR_TEXTO: 'archivos:escribir-texto',
  ESCRIBIR_JSON: 'archivos:escribir-json',
  EXISTE: 'archivos:existe',
  OBTENER_INFO: 'archivos:obtener-info',
  LISTAR_CARPETA: 'archivos:listar-carpeta',
  CREAR_CARPETA: 'archivos:crear-carpeta',
  COPIAR: 'archivos:copiar',
  MOVER: 'archivos:mover',
  RENOMBRAR: 'archivos:renombrar',
  ELIMINAR: 'archivos:eliminar',
  ABRIR: 'archivos:abrir',
  MOSTRAR_EN_CARPETA: 'archivos:mostrar-en-carpeta',
  COPIAR_IMAGEN: 'archivos:copiar-imagen',
  COPIAR_ANEXO: 'archivos:copiar-anexo',
  CREAR_RESPALDO: 'archivos:crear-respaldo',
  RESTAURAR_RESPALDO: 'archivos:restaurar-respaldo',
  EXPORTAR_DATOS: 'archivos:exportar-datos',
  IMPORTAR_DATOS: 'archivos:importar-datos',
  CALCULAR_HASH: 'archivos:calcular-hash',
  VERIFICAR_HASH: 'archivos:verificar-hash',
  OBTENER_RUTAS: 'archivos:obtener-rutas'
});

const ARCHIVOS_DATOS = Object.freeze([
  'configuracion.json',
  'empresa.json',
  'usuarios.json',
  'obras.json',
  'contratistas.json',
  'bitacora.json',
  'consecutivos.json'
]);

const EXTENSIONES_IMAGEN = Object.freeze([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.bmp'
]);

const EXTENSIONES_ANEXO = Object.freeze([
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.csv',
  '.txt',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.bmp',
  '.dwg',
  '.dxf',
  '.zip'
]);

const LIMITES = Object.freeze({
  TEXTO_MAX_BYTES: 25 * 1024 * 1024,
  JSON_MAX_BYTES: 25 * 1024 * 1024,
  IMAGEN_MAX_BYTES: 30 * 1024 * 1024,
  ANEXO_MAX_BYTES: 100 * 1024 * 1024
});

const estado = {
  ipcRegistrado: false
};

/* =========================================================
   RUTAS
   ========================================================= */

function obtenerRaizProyecto() {
  return path.resolve(__dirname, '..');
}

function obtenerRutaDatosBase() {
  return path.join(obtenerRaizProyecto(), 'data');
}

function obtenerRutaUsuario() {
  return path.join(app.getPath('userData'), 'bitacora-de-obra');
}

function obtenerRutaDatosUsuario() {
  return path.join(obtenerRutaUsuario(), 'data');
}

function obtenerRutaObrasUsuario() {
  return path.join(obtenerRutaUsuario(), 'obras');
}

function obtenerRutaImagenesUsuario() {
  return path.join(obtenerRutaUsuario(), 'imagenes');
}

function obtenerRutaAnexosUsuario() {
  return path.join(obtenerRutaUsuario(), 'anexos');
}

function obtenerRutaRespaldosUsuario() {
  return path.join(obtenerRutaUsuario(), 'respaldos');
}

function obtenerRutaExportacionesUsuario() {
  return path.join(obtenerRutaUsuario(), 'exportaciones');
}

function obtenerRutasAplicacion() {
  return {
    raizProyecto: obtenerRaizProyecto(),
    datosBase: obtenerRutaDatosBase(),
    usuario: obtenerRutaUsuario(),
    datos: obtenerRutaDatosUsuario(),
    obras: obtenerRutaObrasUsuario(),
    imagenes: obtenerRutaImagenesUsuario(),
    anexos: obtenerRutaAnexosUsuario(),
    respaldos: obtenerRutaRespaldosUsuario(),
    exportaciones: obtenerRutaExportacionesUsuario(),
    documentos: app.getPath('documents'),
    descargas: app.getPath('downloads'),
    escritorio: app.getPath('desktop')
  };
}

/* =========================================================
   UTILIDADES GENERALES
   ========================================================= */

function respuestaCorrecta(datos = {}) {
  return {
    ok: true,
    ...datos
  };
}

function respuestaError(error, datos = {}) {
  return {
    ok: false,
    error: error instanceof Error
      ? error.message
      : String(error || 'Error desconocido'),
    ...datos
  };
}

function obtenerVentanaDesdeEvento(evento) {
  if (!evento?.sender) return null;
  return BrowserWindow.fromWebContents(evento.sender);
}

function normalizarRuta(rutaEntrada) {
  if (!rutaEntrada) return '';
  return path.normalize(path.resolve(String(rutaEntrada)));
}

function esSubruta(rutaPadre, rutaHija) {
  const padre = normalizarRuta(rutaPadre);
  const hija = normalizarRuta(rutaHija);
  const relativa = path.relative(padre, hija);

  return (
    relativa === '' ||
    (
      !relativa.startsWith('..') &&
      !path.isAbsolute(relativa)
    )
  );
}

function limpiarNombreArchivo(nombre) {
  return String(nombre || '')
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/\.+$/g, '')
    .slice(0, 180);
}

function generarId(prefijo = 'id') {
  const fecha = Date.now().toString(36);
  const aleatorio = crypto.randomBytes(5).toString('hex');
  return `${prefijo}-${fecha}-${aleatorio}`;
}

function fechaParaNombre(fecha = new Date()) {
  const pad = numero => String(numero).padStart(2, '0');

  return [
    fecha.getFullYear(),
    pad(fecha.getMonth() + 1),
    pad(fecha.getDate())
  ].join('-') + '_' + [
    pad(fecha.getHours()),
    pad(fecha.getMinutes()),
    pad(fecha.getSeconds())
  ].join('-');
}

async function existe(rutaEntrada) {
  try {
    await fsp.access(normalizarRuta(rutaEntrada));
    return true;
  }
  catch {
    return false;
  }
}

async function asegurarCarpeta(rutaCarpeta) {
  const ruta = normalizarRuta(rutaCarpeta);
  await fsp.mkdir(ruta, { recursive: true });
  return ruta;
}

async function asegurarEstructura() {
  const rutas = obtenerRutasAplicacion();

  await Promise.all([
    asegurarCarpeta(rutas.usuario),
    asegurarCarpeta(rutas.datos),
    asegurarCarpeta(rutas.obras),
    asegurarCarpeta(rutas.imagenes),
    asegurarCarpeta(rutas.anexos),
    asegurarCarpeta(rutas.respaldos),
    asegurarCarpeta(rutas.exportaciones)
  ]);

  await inicializarDatosUsuario();

  return rutas;
}

async function inicializarDatosUsuario() {
  const origen = obtenerRutaDatosBase();
  const destino = obtenerRutaDatosUsuario();

  await asegurarCarpeta(destino);

  for (const nombre of ARCHIVOS_DATOS) {
    const archivoDestino = path.join(destino, nombre);

    if (await existe(archivoDestino)) {
      continue;
    }

    const archivoOrigen = path.join(origen, nombre);

    if (await existe(archivoOrigen)) {
      await fsp.copyFile(archivoOrigen, archivoDestino);
    }
    else {
      await escribirJSONSeguro(
        archivoDestino,
        {
          version: 1,
          creado: new Date().toISOString()
        }
      );
    }
  }
}

function validarTamano(stats, limite, tipo) {
  if (stats.size > limite) {
    throw new Error(
      `El ${tipo} supera el tamaño máximo permitido de ` +
      `${Math.round(limite / 1024 / 1024)} MB.`
    );
  }
}

function validarExtension(rutaArchivo, extensiones, tipo) {
  const extension = path.extname(rutaArchivo).toLowerCase();

  if (!extensiones.includes(extension)) {
    throw new Error(
      `La extensión ${extension || '(sin extensión)'} no está permitida para ${tipo}.`
    );
  }

  return extension;
}

function serializarStats(rutaEntrada, stats) {
  return {
    ruta: normalizarRuta(rutaEntrada),
    nombre: path.basename(rutaEntrada),
    extension: path.extname(rutaEntrada).replace(/^\./, '').toLowerCase(),
    tamano: stats.size,
    esArchivo: stats.isFile(),
    esCarpeta: stats.isDirectory(),
    creado: stats.birthtime?.toISOString?.() || null,
    modificado: stats.mtime?.toISOString?.() || null,
    accedido: stats.atime?.toISOString?.() || null
  };
}

/* =========================================================
   LECTURA Y ESCRITURA
   ========================================================= */

async function leerTexto(rutaEntrada, codificacion = 'utf8') {
  const ruta = normalizarRuta(rutaEntrada);
  const stats = await fsp.stat(ruta);

  if (!stats.isFile()) {
    throw new Error('La ruta indicada no corresponde a un archivo.');
  }

  validarTamano(stats, LIMITES.TEXTO_MAX_BYTES, 'archivo de texto');

  return fsp.readFile(ruta, codificacion);
}

async function leerJSON(rutaEntrada, valorPredeterminado = null) {
  try {
    const contenido = await leerTexto(rutaEntrada, 'utf8');

    if (!contenido.trim()) {
      return valorPredeterminado;
    }

    return JSON.parse(contenido);
  }
  catch (error) {
    if (valorPredeterminado !== null) {
      return valorPredeterminado;
    }

    throw new Error(
      `No fue posible leer el archivo JSON: ${error.message}`
    );
  }
}

async function escribirArchivoAtomico(rutaEntrada, contenido, opciones = {}) {
  const ruta = normalizarRuta(rutaEntrada);
  const carpeta = path.dirname(ruta);
  const temporal = `${ruta}.${process.pid}.${Date.now()}.tmp`;

  await asegurarCarpeta(carpeta);

  const datos = Buffer.isBuffer(contenido)
    ? contenido
    : String(contenido ?? '');

  try {
    await fsp.writeFile(
      temporal,
      datos,
      opciones.codificacion || 'utf8'
    );

    if (await existe(ruta)) {
      const respaldoTemporal = `${ruta}.bak`;

      try {
        await fsp.copyFile(ruta, respaldoTemporal);
      }
      catch {
        // El respaldo .bak es auxiliar y no bloquea el guardado.
      }
    }

    await fsp.rename(temporal, ruta);
    return ruta;
  }
  catch (error) {
    if (await existe(temporal)) {
      await fsp.unlink(temporal).catch(() => {});
    }

    throw error;
  }
}

async function escribirTexto(rutaEntrada, contenido, opciones = {}) {
  return escribirArchivoAtomico(
    rutaEntrada,
    String(contenido ?? ''),
    opciones
  );
}

async function escribirJSONSeguro(rutaEntrada, datos, opciones = {}) {
  const espacios = Number.isInteger(opciones.espacios)
    ? opciones.espacios
    : 2;

  const contenido = JSON.stringify(datos, null, espacios);

  if (Buffer.byteLength(contenido, 'utf8') > LIMITES.JSON_MAX_BYTES) {
    throw new Error('El contenido JSON supera el tamaño máximo permitido.');
  }

  return escribirArchivoAtomico(
    rutaEntrada,
    contenido,
    { codificacion: 'utf8' }
  );
}

/* =========================================================
   INFORMACIÓN Y LISTADO
   ========================================================= */

async function obtenerInfo(rutaEntrada) {
  const ruta = normalizarRuta(rutaEntrada);
  const stats = await fsp.stat(ruta);

  return serializarStats(ruta, stats);
}

async function listarCarpeta(rutaEntrada, opciones = {}) {
  const ruta = normalizarRuta(rutaEntrada);
  const incluirOcultos = Boolean(opciones.incluirOcultos);
  const recursivo = Boolean(opciones.recursivo);
  const extensionFiltro = Array.isArray(opciones.extensiones)
    ? opciones.extensiones.map(ext => String(ext).toLowerCase())
    : null;

  const resultados = [];

  async function recorrer(carpetaActual) {
    const entradas = await fsp.readdir(
      carpetaActual,
      { withFileTypes: true }
    );

    for (const entrada of entradas) {
      if (!incluirOcultos && entrada.name.startsWith('.')) {
        continue;
      }

      const rutaCompleta = path.join(carpetaActual, entrada.name);
      const stats = await fsp.stat(rutaCompleta);
      const item = serializarStats(rutaCompleta, stats);

      if (
        !extensionFiltro ||
        item.esCarpeta ||
        extensionFiltro.includes(`.${item.extension}`) ||
        extensionFiltro.includes(item.extension)
      ) {
        resultados.push(item);
      }

      if (recursivo && entrada.isDirectory()) {
        await recorrer(rutaCompleta);
      }
    }
  }

  await recorrer(ruta);

  resultados.sort((a, b) => {
    if (a.esCarpeta !== b.esCarpeta) {
      return a.esCarpeta ? -1 : 1;
    }

    return a.nombre.localeCompare(
      b.nombre,
      'es',
      { sensitivity: 'base' }
    );
  });

  return resultados;
}

/* =========================================================
   COPIAR, MOVER, RENOMBRAR Y ELIMINAR
   ========================================================= */

async function copiarRecursivo(origenEntrada, destinoEntrada, opciones = {}) {
  const origen = normalizarRuta(origenEntrada);
  const destino = normalizarRuta(destinoEntrada);
  const sobrescribir = opciones.sobrescribir !== false;
  const stats = await fsp.stat(origen);

  if (stats.isDirectory()) {
    await asegurarCarpeta(destino);

    const entradas = await fsp.readdir(origen);

    for (const nombre of entradas) {
      await copiarRecursivo(
        path.join(origen, nombre),
        path.join(destino, nombre),
        opciones
      );
    }

    return destino;
  }

  await asegurarCarpeta(path.dirname(destino));

  if (!sobrescribir && await existe(destino)) {
    throw new Error(`El archivo de destino ya existe: ${destino}`);
  }

  await fsp.copyFile(origen, destino);
  return destino;
}

async function mover(origenEntrada, destinoEntrada, opciones = {}) {
  const origen = normalizarRuta(origenEntrada);
  const destino = normalizarRuta(destinoEntrada);

  if (!await existe(origen)) {
    throw new Error('El archivo o carpeta de origen no existe.');
  }

  if (await existe(destino)) {
    if (opciones.sobrescribir === false) {
      throw new Error('El destino ya existe.');
    }

    await eliminar(destino, { permanente: true });
  }

  await asegurarCarpeta(path.dirname(destino));

  try {
    await fsp.rename(origen, destino);
  }
  catch (error) {
    if (error.code !== 'EXDEV') {
      throw error;
    }

    await copiarRecursivo(origen, destino, opciones);
    await eliminar(origen, { permanente: true });
  }

  return destino;
}

async function renombrar(rutaEntrada, nuevoNombre) {
  const ruta = normalizarRuta(rutaEntrada);
  const nombreLimpio = limpiarNombreArchivo(nuevoNombre);

  if (!nombreLimpio) {
    throw new Error('El nuevo nombre no es válido.');
  }

  const destino = path.join(path.dirname(ruta), nombreLimpio);

  if (await existe(destino)) {
    throw new Error('Ya existe un archivo o carpeta con ese nombre.');
  }

  await fsp.rename(ruta, destino);
  return destino;
}

async function eliminar(rutaEntrada, opciones = {}) {
  const ruta = normalizarRuta(rutaEntrada);

  if (!await existe(ruta)) {
    return false;
  }

  if (opciones.permanente === false) {
    await shell.trashItem(ruta);
    return true;
  }

  const stats = await fsp.stat(ruta);

  if (stats.isDirectory()) {
    await fsp.rm(ruta, {
      recursive: true,
      force: true
    });
  }
  else {
    await fsp.unlink(ruta);
  }

  return true;
}

/* =========================================================
   IMÁGENES Y ANEXOS
   ========================================================= */

async function copiarArchivoGestionado(origenEntrada, configuracion = {}) {
  const origen = normalizarRuta(origenEntrada);
  const stats = await fsp.stat(origen);

  if (!stats.isFile()) {
    throw new Error('La ruta indicada no corresponde a un archivo.');
  }

  const tipo = configuracion.tipo || 'archivo';
  const limite = configuracion.limite || LIMITES.ANEXO_MAX_BYTES;
  const extensiones = configuracion.extensiones || EXTENSIONES_ANEXO;
  const carpetaBase = configuracion.carpetaBase;

  validarTamano(stats, limite, tipo);
  const extension = validarExtension(origen, extensiones, tipo);

  const obraId = limpiarNombreArchivo(
    configuracion.obraId || 'sin-obra'
  );

  const folioId = limpiarNombreArchivo(
    configuracion.folioId || 'sin-folio'
  );

  const carpetaDestino = path.join(
    carpetaBase,
    obraId,
    folioId
  );

  await asegurarCarpeta(carpetaDestino);

  const nombreOriginal = limpiarNombreArchivo(path.basename(origen));
  const nombreSinExtension = limpiarNombreArchivo(
    path.basename(nombreOriginal, extension)
  );

  const nombreFinal = [
    configuracion.prefijo || tipo,
    fechaParaNombre(),
    generarId('ref').slice(-8),
    nombreSinExtension
  ].filter(Boolean).join('_') + extension;

  const destino = path.join(carpetaDestino, nombreFinal);

  await fsp.copyFile(origen, destino);

  const hash = await calcularHash(destino);

  return {
    id: generarId(configuracion.prefijo || tipo),
    ruta: destino,
    rutaRelativa: path.relative(obtenerRutaUsuario(), destino),
    nombre: nombreFinal,
    nombreOriginal,
    extension: extension.replace(/^\./, ''),
    tamano: stats.size,
    hash,
    obraId,
    folioId,
    creado: new Date().toISOString()
  };
}

async function copiarImagen(origen, datos = {}) {
  return copiarArchivoGestionado(origen, {
    ...datos,
    tipo: 'imagen',
    prefijo: 'img',
    carpetaBase: obtenerRutaImagenesUsuario(),
    extensiones: EXTENSIONES_IMAGEN,
    limite: LIMITES.IMAGEN_MAX_BYTES
  });
}

async function copiarAnexo(origen, datos = {}) {
  return copiarArchivoGestionado(origen, {
    ...datos,
    tipo: 'anexo',
    prefijo: 'anx',
    carpetaBase: obtenerRutaAnexosUsuario(),
    extensiones: EXTENSIONES_ANEXO,
    limite: LIMITES.ANEXO_MAX_BYTES
  });
}

/* =========================================================
   HASH E INTEGRIDAD
   ========================================================= */

async function calcularHash(rutaEntrada, algoritmo = 'sha256') {
  const ruta = normalizarRuta(rutaEntrada);

  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algoritmo);
    const stream = fs.createReadStream(ruta);

    stream.on('error', reject);
    stream.on('data', bloque => hash.update(bloque));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

async function verificarHash(rutaEntrada, hashEsperado, algoritmo = 'sha256') {
  const hashActual = await calcularHash(rutaEntrada, algoritmo);

  return {
    valido: hashActual.toLowerCase() === String(hashEsperado).toLowerCase(),
    esperado: String(hashEsperado),
    actual: hashActual,
    algoritmo
  };
}

/* =========================================================
   EXPORTACIÓN E IMPORTACIÓN DE DATOS
   ========================================================= */

async function construirPaqueteDatos() {
  await asegurarEstructura();

  const rutaDatos = obtenerRutaDatosUsuario();
  const archivos = {};

  for (const nombre of ARCHIVOS_DATOS) {
    const ruta = path.join(rutaDatos, nombre);

    archivos[nombre] = await leerJSON(
      ruta,
      {}
    );
  }

  return {
    formato: 'BITACORA-DE-OBRA',
    versionFormato: 1,
    versionAplicacion: app.getVersion(),
    exportado: new Date().toISOString(),
    archivos
  };
}

async function exportarDatos(rutaDestino) {
  const ruta = normalizarRuta(rutaDestino);
  const paquete = await construirPaqueteDatos();

  await escribirJSONSeguro(ruta, paquete);

  return {
    ruta,
    hash: await calcularHash(ruta),
    exportado: paquete.exportado,
    cantidadArchivos: Object.keys(paquete.archivos).length
  };
}

function validarPaqueteImportacion(paquete) {
  if (!paquete || typeof paquete !== 'object') {
    throw new Error('El archivo de importación no contiene datos válidos.');
  }

  if (paquete.formato !== 'BITACORA-DE-OBRA') {
    throw new Error('El archivo no corresponde a Bitácora de Obra.');
  }

  if (!paquete.archivos || typeof paquete.archivos !== 'object') {
    throw new Error('El paquete no contiene la sección de archivos.');
  }

  return true;
}

async function importarDatos(rutaOrigen, opciones = {}) {
  const ruta = normalizarRuta(rutaOrigen);
  const paquete = await leerJSON(ruta);

  validarPaqueteImportacion(paquete);

  if (opciones.crearRespaldo !== false) {
    await crearRespaldo({
      motivo: 'antes-de-importar'
    });
  }

  const rutaDatos = obtenerRutaDatosUsuario();
  await asegurarCarpeta(rutaDatos);

  const importados = [];

  for (const nombre of ARCHIVOS_DATOS) {
    if (!(nombre in paquete.archivos)) {
      continue;
    }

    await escribirJSONSeguro(
      path.join(rutaDatos, nombre),
      paquete.archivos[nombre]
    );

    importados.push(nombre);
  }

  return {
    importados,
    origen: ruta,
    fechaImportacion: new Date().toISOString()
  };
}

/* =========================================================
   COPIAS DE SEGURIDAD Y RESTAURACIÓN
   ========================================================= */

async function crearManifest(rutaCarpeta) {
  const archivos = await listarCarpeta(rutaCarpeta, {
    recursivo: true,
    incluirOcultos: false
  });

  const manifest = [];

  for (const item of archivos) {
    if (!item.esArchivo) continue;

    manifest.push({
      rutaRelativa: path.relative(rutaCarpeta, item.ruta),
      tamano: item.tamano,
      hash: await calcularHash(item.ruta),
      modificado: item.modificado
    });
  }

  return manifest;
}

async function crearRespaldo(opciones = {}) {
  await asegurarEstructura();

  const nombre = limpiarNombreArchivo(
    opciones.nombre ||
    `respaldo_${fechaParaNombre()}`
  );

  const carpetaDestino = normalizarRuta(
    opciones.rutaDestino ||
    path.join(obtenerRutaRespaldosUsuario(), nombre)
  );

  if (await existe(carpetaDestino)) {
    throw new Error('Ya existe una copia de seguridad con ese nombre.');
  }

  await asegurarCarpeta(carpetaDestino);

  const carpetas = [
    ['data', obtenerRutaDatosUsuario()],
    ['obras', obtenerRutaObrasUsuario()],
    ['imagenes', obtenerRutaImagenesUsuario()],
    ['anexos', obtenerRutaAnexosUsuario()]
  ];

  for (const [nombreCarpeta, origen] of carpetas) {
    if (await existe(origen)) {
      await copiarRecursivo(
        origen,
        path.join(carpetaDestino, nombreCarpeta)
      );
    }
  }

  const manifest = await crearManifest(carpetaDestino);

  const metadata = {
    formato: 'BITACORA-DE-OBRA-RESPALDO',
    versionFormato: 1,
    versionAplicacion: app.getVersion(),
    creado: new Date().toISOString(),
    motivo: opciones.motivo || 'manual',
    cantidadArchivos: manifest.length,
    manifest
  };

  await escribirJSONSeguro(
    path.join(carpetaDestino, 'respaldo.json'),
    metadata
  );

  return {
    ruta: carpetaDestino,
    ...metadata
  };
}

async function validarRespaldo(rutaRespaldo) {
  const ruta = normalizarRuta(rutaRespaldo);
  const rutaMetadata = path.join(ruta, 'respaldo.json');

  if (!await existe(rutaMetadata)) {
    throw new Error('La carpeta seleccionada no contiene un respaldo válido.');
  }

  const metadata = await leerJSON(rutaMetadata);

  if (metadata.formato !== 'BITACORA-DE-OBRA-RESPALDO') {
    throw new Error('El respaldo seleccionado no corresponde a la aplicación.');
  }

  const errores = [];

  for (const item of metadata.manifest || []) {
    const archivo = path.join(ruta, item.rutaRelativa);

    if (!await existe(archivo)) {
      errores.push({
        archivo: item.rutaRelativa,
        error: 'No existe'
      });

      continue;
    }

    const verificacion = await verificarHash(archivo, item.hash);

    if (!verificacion.valido) {
      errores.push({
        archivo: item.rutaRelativa,
        error: 'Hash diferente'
      });
    }
  }

  return {
    valido: errores.length === 0,
    metadata,
    errores
  };
}

async function restaurarRespaldo(rutaRespaldo, opciones = {}) {
  const validacion = await validarRespaldo(rutaRespaldo);

  if (!validacion.valido && opciones.forzar !== true) {
    throw new Error(
      'El respaldo presenta problemas de integridad y no puede restaurarse.'
    );
  }

  if (opciones.crearRespaldoActual !== false) {
    await crearRespaldo({
      motivo: 'antes-de-restaurar'
    });
  }

  const ruta = normalizarRuta(rutaRespaldo);

  const pares = [
    ['data', obtenerRutaDatosUsuario()],
    ['obras', obtenerRutaObrasUsuario()],
    ['imagenes', obtenerRutaImagenesUsuario()],
    ['anexos', obtenerRutaAnexosUsuario()]
  ];

  for (const [nombreCarpeta, destino] of pares) {
    const origen = path.join(ruta, nombreCarpeta);

    if (!await existe(origen)) {
      continue;
    }

    if (await existe(destino)) {
      await eliminar(destino, { permanente: true });
    }

    await copiarRecursivo(origen, destino);
  }

  return {
    restaurado: true,
    origen: ruta,
    fechaRestauracion: new Date().toISOString(),
    advertencias: validacion.errores
  };
}

/* =========================================================
   APERTURA EN EL SISTEMA
   ========================================================= */

async function abrirRuta(rutaEntrada) {
  const ruta = normalizarRuta(rutaEntrada);

  if (!await existe(ruta)) {
    throw new Error('La ruta indicada no existe.');
  }

  const resultado = await shell.openPath(ruta);

  if (resultado) {
    throw new Error(resultado);
  }

  return true;
}

async function mostrarEnCarpeta(rutaEntrada) {
  const ruta = normalizarRuta(rutaEntrada);

  if (!await existe(ruta)) {
    throw new Error('La ruta indicada no existe.');
  }

  shell.showItemInFolder(ruta);
  return true;
}

/* =========================================================
   IPC
   ========================================================= */

function registrarIPC() {
  if (estado.ipcRegistrado) return;

  ipcMain.handle(CANALES.LEER_TEXTO, async (_evento, ruta, opciones = {}) => {
    try {
      return respuestaCorrecta({
        contenido: await leerTexto(
          ruta,
          opciones.codificacion || 'utf8'
        )
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.LEER_JSON, async (_evento, ruta, valor = null) => {
    try {
      return respuestaCorrecta({
        datos: await leerJSON(ruta, valor)
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.ESCRIBIR_TEXTO, async (_evento, ruta, contenido, opciones = {}) => {
    try {
      return respuestaCorrecta({
        ruta: await escribirTexto(ruta, contenido, opciones)
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.ESCRIBIR_JSON, async (_evento, ruta, datos, opciones = {}) => {
    try {
      return respuestaCorrecta({
        ruta: await escribirJSONSeguro(ruta, datos, opciones)
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.EXISTE, async (_evento, ruta) => {
    try {
      return respuestaCorrecta({
        existe: await existe(ruta)
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.OBTENER_INFO, async (_evento, ruta) => {
    try {
      return respuestaCorrecta({
        info: await obtenerInfo(ruta)
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.LISTAR_CARPETA, async (_evento, ruta, opciones = {}) => {
    try {
      return respuestaCorrecta({
        elementos: await listarCarpeta(ruta, opciones)
      });
    }
    catch (error) {
      return respuestaError(error, { elementos: [] });
    }
  });

  ipcMain.handle(CANALES.CREAR_CARPETA, async (_evento, ruta) => {
    try {
      return respuestaCorrecta({
        ruta: await asegurarCarpeta(ruta)
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.COPIAR, async (_evento, origen, destino, opciones = {}) => {
    try {
      return respuestaCorrecta({
        ruta: await copiarRecursivo(origen, destino, opciones)
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.MOVER, async (_evento, origen, destino, opciones = {}) => {
    try {
      return respuestaCorrecta({
        ruta: await mover(origen, destino, opciones)
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.RENOMBRAR, async (_evento, ruta, nuevoNombre) => {
    try {
      return respuestaCorrecta({
        ruta: await renombrar(ruta, nuevoNombre)
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.ELIMINAR, async (_evento, ruta, opciones = {}) => {
    try {
      return respuestaCorrecta({
        eliminado: await eliminar(ruta, opciones)
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.ABRIR, async (_evento, ruta) => {
    try {
      return respuestaCorrecta({
        abierto: await abrirRuta(ruta)
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.MOSTRAR_EN_CARPETA, async (_evento, ruta) => {
    try {
      return respuestaCorrecta({
        mostrado: await mostrarEnCarpeta(ruta)
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.COPIAR_IMAGEN, async (_evento, origen, datos = {}) => {
    try {
      return respuestaCorrecta({
        imagen: await copiarImagen(origen, datos)
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.COPIAR_ANEXO, async (_evento, origen, datos = {}) => {
    try {
      return respuestaCorrecta({
        anexo: await copiarAnexo(origen, datos)
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.CREAR_RESPALDO, async (_evento, opciones = {}) => {
    try {
      return respuestaCorrecta({
        respaldo: await crearRespaldo(opciones)
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.RESTAURAR_RESPALDO, async (_evento, ruta, opciones = {}) => {
    try {
      return respuestaCorrecta({
        resultado: await restaurarRespaldo(ruta, opciones)
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.EXPORTAR_DATOS, async (_evento, ruta) => {
    try {
      return respuestaCorrecta({
        exportacion: await exportarDatos(ruta)
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.IMPORTAR_DATOS, async (_evento, ruta, opciones = {}) => {
    try {
      return respuestaCorrecta({
        importacion: await importarDatos(ruta, opciones)
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.CALCULAR_HASH, async (_evento, ruta, algoritmo = 'sha256') => {
    try {
      return respuestaCorrecta({
        hash: await calcularHash(ruta, algoritmo),
        algoritmo
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.VERIFICAR_HASH, async (_evento, ruta, hash, algoritmo = 'sha256') => {
    try {
      return respuestaCorrecta({
        verificacion: await verificarHash(ruta, hash, algoritmo)
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  ipcMain.handle(CANALES.OBTENER_RUTAS, async () => {
    try {
      await asegurarEstructura();

      return respuestaCorrecta({
        rutas: obtenerRutasAplicacion()
      });
    }
    catch (error) {
      return respuestaError(error);
    }
  });

  estado.ipcRegistrado = true;
}

function eliminarIPC() {
  Object.values(CANALES).forEach(canal => {
    ipcMain.removeHandler(canal);
  });

  estado.ipcRegistrado = false;
}

/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

async function iniciar() {
  await asegurarEstructura();
  registrarIPC();

  return {
    rutas: obtenerRutasAplicacion(),
    archivosDatos: [...ARCHIVOS_DATOS]
  };
}

/* =========================================================
   EXPORTACIÓN DEL MÓDULO
   ========================================================= */

module.exports = Object.freeze({
  CANALES,
  ARCHIVOS_DATOS,
  EXTENSIONES_IMAGEN,
  EXTENSIONES_ANEXO,
  LIMITES,
  iniciar,
  registrarIPC,
  eliminarIPC,
  obtenerRutasAplicacion,
  obtenerRutaUsuario,
  obtenerRutaDatosUsuario,
  obtenerRutaObrasUsuario,
  obtenerRutaImagenesUsuario,
  obtenerRutaAnexosUsuario,
  obtenerRutaRespaldosUsuario,
  obtenerRutaExportacionesUsuario,
  asegurarEstructura,
  inicializarDatosUsuario,
  existe,
  asegurarCarpeta,
  leerTexto,
  leerJSON,
  escribirTexto,
  escribirJSONSeguro,
  obtenerInfo,
  listarCarpeta,
  copiarRecursivo,
  mover,
  renombrar,
  eliminar,
  copiarImagen,
  copiarAnexo,
  calcularHash,
  verificarHash,
  exportarDatos,
  importarDatos,
  crearRespaldo,
  validarRespaldo,
  restaurarRespaldo,
  abrirRuta,
  mostrarEnCarpeta,
  limpiarNombreArchivo,
  generarId
});