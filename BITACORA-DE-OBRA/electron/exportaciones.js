'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: electron/exportaciones.js
   Propósito:
   - Exportación de folios y bitácoras.
   - Guardado de PDF, Word, JSON y ZIP.
   - Integración con diálogos nativos.
   - Coordinación con ventanas de vista previa.
   - Registro de canales IPC.
   ========================================================= */

const {
  app,
  ipcMain,
  BrowserWindow,
  shell
} = require('electron');

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

let archiver = null;

try {
  archiver = require('archiver');
}
catch {
  archiver = null;
}

/* =========================================================
   DEPENDENCIAS INTERNAS
   ========================================================= */

const archivos = require('./archivos');
const dialogos = require('./dialogos');

/* =========================================================
   CANALES IPC
   ========================================================= */

const CANALES = Object.freeze({
  EXPORTAR_PDF: 'exportaciones:exportar-pdf',
  EXPORTAR_WORD: 'exportaciones:exportar-word',
  EXPORTAR_JSON: 'exportaciones:exportar-json',
  EXPORTAR_ZIP: 'exportaciones:exportar-zip',
  EXPORTAR_BITACORA: 'exportaciones:exportar-bitacora',
  EXPORTAR_FOLIO: 'exportaciones:exportar-folio',
  GUARDAR_BUFFER: 'exportaciones:guardar-buffer',
  OBTENER_FORMATOS: 'exportaciones:obtener-formatos',
  ABRIR_EXPORTACION: 'exportaciones:abrir-exportacion',
  MOSTRAR_EXPORTACION: 'exportaciones:mostrar-exportacion'
});

/* =========================================================
   FORMATOS SOPORTADOS
   ========================================================= */

const FORMATOS = Object.freeze({
  PDF: {
    id: 'pdf',
    nombre: 'Documento PDF',
    extension: 'pdf',
    mime: 'application/pdf'
  },

  WORD: {
    id: 'word',
    nombre: 'Documento Word',
    extension: 'docx',
    mime:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  },

  JSON: {
    id: 'json',
    nombre: 'Archivo JSON',
    extension: 'json',
    mime: 'application/json'
  },

  ZIP: {
    id: 'zip',
    nombre: 'Archivo comprimido ZIP',
    extension: 'zip',
    mime: 'application/zip'
  }
});

/* =========================================================
   ESTADO INTERNO
   ========================================================= */

const estado = {
  ipcRegistrado: false
};

/* =========================================================
   UTILIDADES
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
    error:
      error instanceof Error
        ? error.message
        : String(error || 'Error desconocido'),
    ...datos
  };
}

function obtenerVentanaDesdeEvento(evento) {
  if (!evento?.sender) return null;

  return BrowserWindow.fromWebContents(
    evento.sender
  );
}

function resolverVentana(ventana) {
  if (
    ventana &&
    !ventana.isDestroyed()
  ) {
    return ventana;
  }

  const enfocada =
    BrowserWindow.getFocusedWindow();

  if (
    enfocada &&
    !enfocada.isDestroyed()
  ) {
    return enfocada;
  }

  return BrowserWindow
    .getAllWindows()
    .find(item => !item.isDestroyed()) || null;
}

function limpiarNombre(nombre) {
  return String(nombre || '')
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/\.+$/g, '')
    .slice(0, 180);
}

function obtenerNombrePredeterminado(
  datos = {},
  extension = ''
) {
  const obra =
    limpiarNombre(
      datos.nombreObra ||
      datos.obra ||
      'Bitacora-de-Obra'
    );

  const folio =
    limpiarNombre(
      datos.numeroFolio ||
      datos.folio ||
      ''
    );

  const fecha =
    limpiarNombre(
      datos.fecha ||
      new Date()
        .toISOString()
        .slice(0, 10)
    );

  const partes = [
    obra,
    folio ? `Folio-${folio}` : '',
    fecha
  ].filter(Boolean);

  const nombre = partes.join('_');

  return extension
    ? `${nombre}.${extension}`
    : nombre;
}

function asegurarExtension(
  rutaArchivo,
  extension
) {
  const ext =
    String(extension || '')
      .replace(/^\./, '')
      .toLowerCase();

  if (!ext) return rutaArchivo;

  const actual =
    path.extname(rutaArchivo)
      .replace(/^\./, '')
      .toLowerCase();

  return actual === ext
    ? rutaArchivo
    : `${rutaArchivo}.${ext}`;
}

function normalizarBuffer(datos) {
  if (Buffer.isBuffer(datos)) {
    return datos;
  }

  if (
    datos &&
    datos.type === 'Buffer' &&
    Array.isArray(datos.data)
  ) {
    return Buffer.from(datos.data);
  }

  if (datos instanceof Uint8Array) {
    return Buffer.from(datos);
  }

  if (Array.isArray(datos)) {
    return Buffer.from(datos);
  }

  if (typeof datos === 'string') {
    const valor = datos.trim();

    if (
      valor.startsWith('data:') &&
      valor.includes(',')
    ) {
      const base64 =
        valor.slice(valor.indexOf(',') + 1);

      return Buffer.from(base64, 'base64');
    }

    return Buffer.from(datos, 'utf8');
  }

  throw new Error(
    'No fue posible convertir el contenido en un archivo.'
  );
}

async function guardarBufferEnRuta(
  rutaDestino,
  contenido
) {
  const ruta = path.resolve(rutaDestino);
  const buffer = normalizarBuffer(contenido);

  await fsp.mkdir(
    path.dirname(ruta),
    { recursive: true }
  );

  await fsp.writeFile(ruta, buffer);

  return {
    ruta,
    nombre: path.basename(ruta),
    tamano: buffer.length
  };
}

async function solicitarRutaGuardado(
  formato,
  opciones = {},
  ventana = null
) {
  const nombrePredeterminado =
    limpiarNombre(
      opciones.nombreArchivo ||
      obtenerNombrePredeterminado(
        opciones,
        formato.extension
      )
    );

  const resultado =
    await dialogos.guardarArchivo(
      {
        titulo:
          opciones.titulo ||
          `Exportar ${formato.nombre}`,

        nombrePredeterminado,

        extension:
          formato.extension,

        nombreFiltro:
          formato.nombre,

        filtros: [
          {
            name: formato.nombre,
            extensions: [
              formato.extension
            ]
          }
        ],

        rutaInicial:
          opciones.rutaInicial ||
          app.getPath('documents')
      },
      ventana
    );

  if (
    !resultado.ok ||
    resultado.cancelado
  ) {
    return null;
  }

  return asegurarExtension(
    resultado.ruta,
    formato.extension
  );
}

async function confirmarApertura(
  rutaArchivo,
  ventana = null
) {
  const resultado =
    await dialogos.confirmar(
      {
        titulo: 'Exportación finalizada',
        mensaje:
          'El archivo se exportó correctamente.',
        detalle:
          `Ubicación:\n${rutaArchivo}`,
        botones: [
          'Abrir archivo',
          'Cerrar'
        ],
        botonPredeterminado: 0,
        botonCancelar: 1
      },
      ventana
    );

  if (resultado.confirmado) {
    const error =
      await shell.openPath(rutaArchivo);

    if (error) {
      throw new Error(error);
    }
  }

  return true;
}

/* =========================================================
   EXPORTACIÓN PDF
   ========================================================= */

async function exportarPDF(
  ventanaOrigen,
  opciones = {}
) {
  const ventana =
    resolverVentana(ventanaOrigen);

  if (!ventana) {
    throw new Error(
      'No se encontró una ventana disponible para generar el PDF.'
    );
  }

  const rutaDestino =
    opciones.rutaDestino ||
    await solicitarRutaGuardado(
      FORMATOS.PDF,
      opciones,
      ventana
    );

  if (!rutaDestino) {
    return {
      cancelado: true
    };
  }

  const configuracionPDF = {
    printBackground:
      opciones.imprimirFondos !== false,

    landscape:
      Boolean(opciones.horizontal),

    pageSize:
      opciones.tamanoPapel ||
      'A4',

    margins: {
      top:
        Number(opciones.margenSuperior) ||
        0.5,

      bottom:
        Number(opciones.margenInferior) ||
        0.5,

      left:
        Number(opciones.margenIzquierdo) ||
        0.5,

      right:
        Number(opciones.margenDerecho) ||
        0.5
    },

    preferCSSPageSize:
      opciones.usarTamanoCSS !== false,

    displayHeaderFooter:
      Boolean(
        opciones.mostrarEncabezadoPie
      ),

    headerTemplate:
      opciones.plantillaEncabezado ||
      '<span></span>',

    footerTemplate:
      opciones.plantillaPie ||
      '<span></span>',

    generateTaggedPDF: true,
    generateDocumentOutline: true
  };

  const buffer =
    await ventana.webContents.printToPDF(
      configuracionPDF
    );

  await guardarBufferEnRuta(
    rutaDestino,
    buffer
  );

  const resultado = {
    ruta: rutaDestino,
    nombre: path.basename(rutaDestino),
    tamano: buffer.length,
    formato: FORMATOS.PDF.id
  };

  if (opciones.abrirAlFinal) {
    await shell.openPath(rutaDestino);
  }
  else if (
    opciones.preguntarAbrir !== false
  ) {
    await confirmarApertura(
      rutaDestino,
      ventana
    );
  }

  return resultado;
}

/* =========================================================
   EXPORTACIÓN WORD
   ========================================================= */

async function exportarWord(
  contenido,
  opciones = {},
  ventana = null
) {
  const rutaDestino =
    opciones.rutaDestino ||
    await solicitarRutaGuardado(
      FORMATOS.WORD,
      opciones,
      ventana
    );

  if (!rutaDestino) {
    return {
      cancelado: true
    };
  }

  const resultado =
    await guardarBufferEnRuta(
      rutaDestino,
      contenido
    );

  if (opciones.abrirAlFinal) {
    await shell.openPath(rutaDestino);
  }
  else if (
    opciones.preguntarAbrir !== false
  ) {
    await confirmarApertura(
      rutaDestino,
      ventana
    );
  }

  return {
    ...resultado,
    formato: FORMATOS.WORD.id
  };
}

/* =========================================================
   EXPORTACIÓN JSON
   ========================================================= */

async function exportarJSON(
  datos,
  opciones = {},
  ventana = null
) {
  const rutaDestino =
    opciones.rutaDestino ||
    await solicitarRutaGuardado(
      FORMATOS.JSON,
      opciones,
      ventana
    );

  if (!rutaDestino) {
    return {
      cancelado: true
    };
  }

  const contenido = JSON.stringify(
    datos,
    null,
    Number.isInteger(opciones.espacios)
      ? opciones.espacios
      : 2
  );

  await fsp.mkdir(
    path.dirname(rutaDestino),
    { recursive: true }
  );

  await fsp.writeFile(
    rutaDestino,
    contenido,
    'utf8'
  );

  if (opciones.abrirAlFinal) {
    await shell.openPath(rutaDestino);
  }
  else if (
    opciones.preguntarAbrir !== false
  ) {
    await confirmarApertura(
      rutaDestino,
      ventana
    );
  }

  return {
    ruta: rutaDestino,
    nombre: path.basename(rutaDestino),
    tamano:
      Buffer.byteLength(
        contenido,
        'utf8'
      ),
    formato: FORMATOS.JSON.id
  };
}

/* =========================================================
   EXPORTACIÓN ZIP
   ========================================================= */

async function crearZipConArchiver(
  rutaDestino,
  elementos = [],
  opciones = {}
) {
  if (!archiver) {
    throw new Error(
      'La dependencia "archiver" no está instalada. ' +
      'Ejecute: npm install archiver'
    );
  }

  await fsp.mkdir(
    path.dirname(rutaDestino),
    { recursive: true }
  );

  return new Promise(
    (resolve, reject) => {
      const salida =
        fs.createWriteStream(rutaDestino);

      const archivo =
        archiver('zip', {
          zlib: {
            level:
              Number.isInteger(
                opciones.nivelCompresion
              )
                ? opciones.nivelCompresion
                : 9
          }
        });

      salida.on(
        'close',
        () => {
          resolve({
            ruta: rutaDestino,
            nombre:
              path.basename(rutaDestino),
            tamano:
              archivo.pointer(),
            formato:
              FORMATOS.ZIP.id
          });
        }
      );

      salida.on('error', reject);
      archivo.on('error', reject);
      archivo.pipe(salida);

      for (const elemento of elementos) {
        const ruta =
          typeof elemento === 'string'
            ? elemento
            : elemento.ruta;

        if (!ruta || !fs.existsSync(ruta)) {
          continue;
        }

        const stats =
          fs.statSync(ruta);

        const nombre =
          typeof elemento === 'object' &&
          elemento.nombre
            ? elemento.nombre
            : path.basename(ruta);

        if (stats.isDirectory()) {
          archivo.directory(
            ruta,
            nombre
          );
        }
        else {
          archivo.file(
            ruta,
            { name: nombre }
          );
        }
      }

      if (opciones.metadata) {
        archivo.append(
          JSON.stringify(
            opciones.metadata,
            null,
            2
          ),
          {
            name:
              opciones.nombreMetadata ||
              'metadata.json'
          }
        );
      }

      archivo.finalize();
    }
  );
}

async function exportarZIP(
  elementos,
  opciones = {},
  ventana = null
) {
  const rutaDestino =
    opciones.rutaDestino ||
    await solicitarRutaGuardado(
      FORMATOS.ZIP,
      opciones,
      ventana
    );

  if (!rutaDestino) {
    return {
      cancelado: true
    };
  }

  const resultado =
    await crearZipConArchiver(
      rutaDestino,
      Array.isArray(elementos)
        ? elementos
        : [],
      opciones
    );

  if (opciones.abrirAlFinal) {
    await shell.openPath(rutaDestino);
  }
  else if (
    opciones.preguntarAbrir !== false
  ) {
    await confirmarApertura(
      rutaDestino,
      ventana
    );
  }

  return resultado;
}

/* =========================================================
   EXPORTACIÓN DE BITÁCORA COMPLETA
   ========================================================= */

async function exportarBitacora(
  opciones = {},
  ventana = null
) {
  await archivos.asegurarEstructura();

  const rutas =
    archivos.obtenerRutasAplicacion();

  const elementos = [];

  if (fs.existsSync(rutas.datos)) {
    elementos.push({
      ruta: rutas.datos,
      nombre: 'data'
    });
  }

  if (
    opciones.incluirImagenes !== false &&
    fs.existsSync(rutas.imagenes)
  ) {
    elementos.push({
      ruta: rutas.imagenes,
      nombre: 'imagenes'
    });
  }

  if (
    opciones.incluirAnexos !== false &&
    fs.existsSync(rutas.anexos)
  ) {
    elementos.push({
      ruta: rutas.anexos,
      nombre: 'anexos'
    });
  }

  if (
    opciones.incluirObras !== false &&
    fs.existsSync(rutas.obras)
  ) {
    elementos.push({
      ruta: rutas.obras,
      nombre: 'obras'
    });
  }

  const metadata = {
    formato:
      'BITACORA-DE-OBRA-EXPORTACION',

    versionFormato: 1,

    versionAplicacion:
      app.getVersion(),

    exportado:
      new Date().toISOString(),

    incluye: {
      datos: true,
      obras:
        opciones.incluirObras !== false,
      imagenes:
        opciones.incluirImagenes !== false,
      anexos:
        opciones.incluirAnexos !== false
    }
  };

  return exportarZIP(
    elementos,
    {
      ...opciones,
      nombreArchivo:
        opciones.nombreArchivo ||
        obtenerNombrePredeterminado(
          {
            nombreObra:
              opciones.nombreObra ||
              'Bitacora-de-Obra-Completa',
            fecha:
              new Date()
                .toISOString()
                .slice(0, 10)
          },
          'zip'
        ),
      metadata,
      nombreMetadata:
        'exportacion.json'
    },
    ventana
  );
}

/* =========================================================
   EXPORTACIÓN DE FOLIO
   ========================================================= */

async function exportarFolio(
  datosFolio,
  opciones = {},
  ventana = null
) {
  if (
    !datosFolio ||
    typeof datosFolio !== 'object'
  ) {
    throw new Error(
      'No se recibieron los datos del folio.'
    );
  }

  const formato =
    String(
      opciones.formato ||
      'json'
    ).toLowerCase();

  if (formato === 'json') {
    return exportarJSON(
      datosFolio,
      {
        ...opciones,
        nombreArchivo:
          opciones.nombreArchivo ||
          obtenerNombrePredeterminado(
            {
              nombreObra:
                datosFolio.nombreObra ||
                datosFolio.obra ||
                'Bitacora',
              numeroFolio:
                datosFolio.numero ||
                datosFolio.numeroFolio ||
                datosFolio.id,
              fecha:
                datosFolio.fecha
            },
            'json'
          )
      },
      ventana
    );
  }

  if (formato === 'zip') {
    const temporales = [];
    const carpetaTemporal =
      await fsp.mkdtemp(
        path.join(
          app.getPath('temp'),
          'bitacora-folio-'
        )
      );

    try {
      const rutaJSON =
        path.join(
          carpetaTemporal,
          'folio.json'
        );

      await fsp.writeFile(
        rutaJSON,
        JSON.stringify(
          datosFolio,
          null,
          2
        ),
        'utf8'
      );

      temporales.push({
        ruta: rutaJSON,
        nombre: 'folio.json'
      });

      const anexos = [
        ...(Array.isArray(datosFolio.imagenes)
          ? datosFolio.imagenes
          : []),

        ...(Array.isArray(datosFolio.anexos)
          ? datosFolio.anexos
          : [])
      ];

      for (const item of anexos) {
        const ruta =
          item?.ruta ||
          item?.rutaArchivo ||
          item?.archivo;

        if (
          ruta &&
          fs.existsSync(ruta)
        ) {
          temporales.push({
            ruta,
            nombre:
              item.nombre ||
              path.basename(ruta)
          });
        }
      }

      return await exportarZIP(
        temporales,
        {
          ...opciones,
          nombreArchivo:
            opciones.nombreArchivo ||
            obtenerNombrePredeterminado(
              {
                nombreObra:
                  datosFolio.nombreObra ||
                  datosFolio.obra ||
                  'Bitacora',
                numeroFolio:
                  datosFolio.numero ||
                  datosFolio.numeroFolio ||
                  datosFolio.id,
                fecha:
                  datosFolio.fecha
              },
              'zip'
            ),
          metadata: {
            formato:
              'BITACORA-DE-OBRA-FOLIO',
            versionFormato: 1,
            exportado:
              new Date().toISOString(),
            folioId:
              datosFolio.id || null
          }
        },
        ventana
      );
    }
    finally {
      await fsp.rm(
        carpetaTemporal,
        {
          recursive: true,
          force: true
        }
      ).catch(() => {});
    }
  }

  throw new Error(
    `El formato de exportación "${formato}" no está soportado para folios.`
  );
}

/* =========================================================
   GUARDADO GENÉRICO
   ========================================================= */

async function guardarBuffer(
  contenido,
  opciones = {},
  ventana = null
) {
  const formato =
    FORMATOS[
      String(
        opciones.formato ||
        ''
      ).toUpperCase()
    ] || {
      id:
        opciones.formato ||
        'archivo',
      nombre:
        opciones.nombreFormato ||
        'Archivo',
      extension:
        opciones.extension ||
        'bin'
    };

  const rutaDestino =
    opciones.rutaDestino ||
    await solicitarRutaGuardado(
      formato,
      opciones,
      ventana
    );

  if (!rutaDestino) {
    return {
      cancelado: true
    };
  }

  const resultado =
    await guardarBufferEnRuta(
      rutaDestino,
      contenido
    );

  if (opciones.abrirAlFinal) {
    await shell.openPath(rutaDestino);
  }

  return {
    ...resultado,
    formato: formato.id
  };
}

/* =========================================================
   APERTURA DE EXPORTACIONES
   ========================================================= */

async function abrirExportacion(
  rutaEntrada
) {
  const ruta =
    path.resolve(
      String(rutaEntrada || '')
    );

  if (!fs.existsSync(ruta)) {
    throw new Error(
      'El archivo exportado no existe.'
    );
  }

  const error =
    await shell.openPath(ruta);

  if (error) {
    throw new Error(error);
  }

  return true;
}

async function mostrarExportacion(
  rutaEntrada
) {
  const ruta =
    path.resolve(
      String(rutaEntrada || '')
    );

  if (!fs.existsSync(ruta)) {
    throw new Error(
      'El archivo exportado no existe.'
    );
  }

  shell.showItemInFolder(ruta);
  return true;
}

/* =========================================================
   IPC
   ========================================================= */

function registrarIPC() {
  if (estado.ipcRegistrado) {
    return;
  }

  ipcMain.handle(
    CANALES.EXPORTAR_PDF,
    async (
      evento,
      opciones = {}
    ) => {
      try {
        const ventana =
          obtenerVentanaDesdeEvento(evento);

        return respuestaCorrecta({
          exportacion:
            await exportarPDF(
              ventana,
              opciones
            )
        });
      }
      catch (error) {
        return respuestaError(error);
      }
    }
  );

  ipcMain.handle(
    CANALES.EXPORTAR_WORD,
    async (
      evento,
      contenido,
      opciones = {}
    ) => {
      try {
        const ventana =
          obtenerVentanaDesdeEvento(evento);

        return respuestaCorrecta({
          exportacion:
            await exportarWord(
              contenido,
              opciones,
              ventana
            )
        });
      }
      catch (error) {
        return respuestaError(error);
      }
    }
  );

  ipcMain.handle(
    CANALES.EXPORTAR_JSON,
    async (
      evento,
      datos,
      opciones = {}
    ) => {
      try {
        const ventana =
          obtenerVentanaDesdeEvento(evento);

        return respuestaCorrecta({
          exportacion:
            await exportarJSON(
              datos,
              opciones,
              ventana
            )
        });
      }
      catch (error) {
        return respuestaError(error);
      }
    }
  );

  ipcMain.handle(
    CANALES.EXPORTAR_ZIP,
    async (
      evento,
      elementos = [],
      opciones = {}
    ) => {
      try {
        const ventana =
          obtenerVentanaDesdeEvento(evento);

        return respuestaCorrecta({
          exportacion:
            await exportarZIP(
              elementos,
              opciones,
              ventana
            )
        });
      }
      catch (error) {
        return respuestaError(error);
      }
    }
  );

  ipcMain.handle(
    CANALES.EXPORTAR_BITACORA,
    async (
      evento,
      opciones = {}
    ) => {
      try {
        const ventana =
          obtenerVentanaDesdeEvento(evento);

        return respuestaCorrecta({
          exportacion:
            await exportarBitacora(
              opciones,
              ventana
            )
        });
      }
      catch (error) {
        return respuestaError(error);
      }
    }
  );

  ipcMain.handle(
    CANALES.EXPORTAR_FOLIO,
    async (
      evento,
      datosFolio,
      opciones = {}
    ) => {
      try {
        const ventana =
          obtenerVentanaDesdeEvento(evento);

        return respuestaCorrecta({
          exportacion:
            await exportarFolio(
              datosFolio,
              opciones,
              ventana
            )
        });
      }
      catch (error) {
        return respuestaError(error);
      }
    }
  );

  ipcMain.handle(
    CANALES.GUARDAR_BUFFER,
    async (
      evento,
      contenido,
      opciones = {}
    ) => {
      try {
        const ventana =
          obtenerVentanaDesdeEvento(evento);

        return respuestaCorrecta({
          archivo:
            await guardarBuffer(
              contenido,
              opciones,
              ventana
            )
        });
      }
      catch (error) {
        return respuestaError(error);
      }
    }
  );

  ipcMain.handle(
    CANALES.OBTENER_FORMATOS,
    async () => {
      return respuestaCorrecta({
        formatos:
          Object.values(FORMATOS)
      });
    }
  );

  ipcMain.handle(
    CANALES.ABRIR_EXPORTACION,
    async (
      _evento,
      ruta
    ) => {
      try {
        return respuestaCorrecta({
          abierto:
            await abrirExportacion(ruta)
        });
      }
      catch (error) {
        return respuestaError(error);
      }
    }
  );

  ipcMain.handle(
    CANALES.MOSTRAR_EXPORTACION,
    async (
      _evento,
      ruta
    ) => {
      try {
        return respuestaCorrecta({
          mostrado:
            await mostrarExportacion(ruta)
        });
      }
      catch (error) {
        return respuestaError(error);
      }
    }
  );

  estado.ipcRegistrado = true;
}

function eliminarIPC() {
  Object
    .values(CANALES)
    .forEach(canal => {
      ipcMain.removeHandler(canal);
    });

  estado.ipcRegistrado = false;
}

/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

function iniciar() {
  registrarIPC();

  return {
    formatos:
      Object.values(FORMATOS),
    archiverDisponible:
      Boolean(archiver)
  };
}

/* =========================================================
   EXPORTACIÓN DEL MÓDULO
   ========================================================= */

module.exports = Object.freeze({
  CANALES,
  FORMATOS,
  iniciar,
  registrarIPC,
  eliminarIPC,
  exportarPDF,
  exportarWord,
  exportarJSON,
  exportarZIP,
  exportarBitacora,
  exportarFolio,
  guardarBuffer,
  guardarBufferEnRuta,
  crearZipConArchiver,
  abrirExportacion,
  mostrarExportacion,
  solicitarRutaGuardado,
  obtenerNombrePredeterminado
});