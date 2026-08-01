'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: electron/ventanas.js
   Propósito: creación y administración de ventanas Electron
   ========================================================= */

const {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  shell
} = require('electron');

const fs = require('fs');
const path = require('path');

/* =========================================================
   CONFIGURACIÓN GENERAL
   ========================================================= */

const NOMBRES_VENTANA = Object.freeze({
  PRINCIPAL: 'principal',
  CARGA: 'carga',
  VISTA_PREVIA: 'vista-previa',
  CONFIGURACION: 'configuracion',
  ACERCA_DE: 'acerca-de'
});

const CANALES = Object.freeze({
  ABRIR_VISTA_PREVIA: 'ventanas:abrir-vista-previa',
  ABRIR_CONFIGURACION: 'ventanas:abrir-configuracion',
  ABRIR_ACERCA_DE: 'ventanas:abrir-acerca-de',
  CERRAR_ACTUAL: 'ventanas:cerrar-actual',
  MINIMIZAR_ACTUAL: 'ventanas:minimizar-actual',
  MAXIMIZAR_ACTUAL: 'ventanas:maximizar-actual',
  RESTAURAR_ACTUAL: 'ventanas:restaurar-actual',
  RECARGAR_ACTUAL: 'ventanas:recargar-actual',
  ABRIR_EN_NAVEGADOR: 'ventanas:abrir-en-navegador',
  OBTENER_ESTADO: 'ventanas:obtener-estado',
  ESTADO_CAMBIO: 'ventanas:estado-cambio'
});

const CONFIGURACION_PREDETERMINADA = Object.freeze({
  tituloAplicacion: 'Bitácora de Obra',
  anchoPrincipal: 1380,
  altoPrincipal: 860,
  anchoMinimoPrincipal: 1024,
  altoMinimoPrincipal: 680,
  anchoVistaPrevia: 1180,
  altoVistaPrevia: 820,
  anchoConfiguracion: 980,
  altoConfiguracion: 760,
  anchoAcercaDe: 560,
  altoAcercaDe: 500,
  anchoCarga: 520,
  altoCarga: 310,
  mostrarCarga: true,
  tiempoMinimoCarga: 900,
  permitirDevTools: !app.isPackaged
});

/* =========================================================
   ESTADO INTERNO
   ========================================================= */

const estado = {
  iniciado: false,
  ipcRegistrado: false,
  opciones: { ...CONFIGURACION_PREDETERMINADA },
  ventanas: new Map(),
  ventanaPrincipal: null,
  ventanaCarga: null,
  ventanaVistaPrevia: null,
  ventanaConfiguracion: null,
  ventanaAcercaDe: null,
  temporizadorCarga: null
};

/* =========================================================
   RUTAS
   ========================================================= */

function obtenerRaizProyecto() {
  return path.resolve(__dirname, '..');
}

function obtenerRutaApp(nombreArchivo) {
  return path.join(
    obtenerRaizProyecto(),
    'app',
    nombreArchivo
  );
}

function obtenerRutaPreload() {
  return path.join(
    obtenerRaizProyecto(),
    'preload.js'
  );
}

function obtenerRutaEstadoVentanas() {
  return path.join(
    app.getPath('userData'),
    'estado-ventanas.json'
  );
}

/* =========================================================
   UTILIDADES
   ========================================================= */

function registrarVentana(nombre, ventana) {
  estado.ventanas.set(nombre, ventana);

  ventana.once('closed', () => {
    estado.ventanas.delete(nombre);

    if (nombre === NOMBRES_VENTANA.PRINCIPAL) {
      estado.ventanaPrincipal = null;
    }

    if (nombre === NOMBRES_VENTANA.CARGA) {
      estado.ventanaCarga = null;
    }

    if (nombre === NOMBRES_VENTANA.VISTA_PREVIA) {
      estado.ventanaVistaPrevia = null;
    }

    if (nombre === NOMBRES_VENTANA.CONFIGURACION) {
      estado.ventanaConfiguracion = null;
    }

    if (nombre === NOMBRES_VENTANA.ACERCA_DE) {
      estado.ventanaAcercaDe = null;
    }
  });

  return ventana;
}

function obtenerVentana(nombre) {
  const ventana = estado.ventanas.get(nombre);

  if (!ventana || ventana.isDestroyed()) {
    return null;
  }

  return ventana;
}

function obtenerVentanaDesdeEvento(evento) {
  if (!evento?.sender) return null;

  return BrowserWindow.fromWebContents(
    evento.sender
  );
}

function enviarCambioEstado(ventana) {
  if (
    !ventana ||
    ventana.isDestroyed() ||
    ventana.webContents.isDestroyed()
  ) {
    return;
  }

  ventana.webContents.send(
    CANALES.ESTADO_CAMBIO,
    {
      maximizada: ventana.isMaximized(),
      minimizada: ventana.isMinimized(),
      pantallaCompleta: ventana.isFullScreen()
    }
  );
}

function vincularEventosEstado(ventana) {
  [
    'maximize',
    'unmaximize',
    'minimize',
    'restore',
    'enter-full-screen',
    'leave-full-screen'
  ].forEach(nombreEvento => {
    ventana.on(
      nombreEvento,
      () => enviarCambioEstado(ventana)
    );
  });
}

function configurarNavegacionSegura(ventana) {
  ventana.webContents.setWindowOpenHandler(
    ({ url }) => {
      if (/^https?:\/\//i.test(url)) {
        shell.openExternal(url);
      }

      return { action: 'deny' };
    }
  );

  ventana.webContents.on(
    'will-navigate',
    (evento, url) => {
      const actual = ventana.webContents.getURL();

      if (
        /^https?:\/\//i.test(url) &&
        url !== actual
      ) {
        evento.preventDefault();
        shell.openExternal(url);
      }
    }
  );
}

function opcionesWebPreferencias() {
  return {
    preload: obtenerRutaPreload(),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: false,
    webSecurity: true,
    allowRunningInsecureContent: false,
    spellcheck: true,
    devTools: Boolean(
      estado.opciones.permitirDevTools
    )
  };
}

/* =========================================================
   PERSISTENCIA DE POSICIÓN Y TAMAÑO
   ========================================================= */

function leerEstadoGuardado() {
  try {
    const ruta = obtenerRutaEstadoVentanas();

    if (!fs.existsSync(ruta)) {
      return {};
    }

    const contenido = fs.readFileSync(
      ruta,
      'utf8'
    );

    return JSON.parse(contenido);
  }
  catch (error) {
    console.warn(
      'No fue posible leer el estado de las ventanas:',
      error.message
    );

    return {};
  }
}

function guardarEstadoVentana(
  nombre,
  ventana
) {
  if (
    !ventana ||
    ventana.isDestroyed() ||
    ventana.isMinimized() ||
    ventana.isMaximized() ||
    ventana.isFullScreen()
  ) {
    return;
  }

  try {
    const ruta = obtenerRutaEstadoVentanas();
    const guardado = leerEstadoGuardado();

    guardado[nombre] = {
      bounds: ventana.getBounds(),
      maximizada: ventana.isMaximized()
    };

    fs.mkdirSync(
      path.dirname(ruta),
      { recursive: true }
    );

    fs.writeFileSync(
      ruta,
      JSON.stringify(
        guardado,
        null,
        2
      ),
      'utf8'
    );
  }
  catch (error) {
    console.warn(
      'No fue posible guardar el estado de la ventana:',
      error.message
    );
  }
}

function estaDentroDePantallas(bounds) {
  if (!bounds) return false;

  const pantallas = screen.getAllDisplays();

  return pantallas.some(pantalla => {
    const area = pantalla.workArea;

    const interseccionHorizontal =
      bounds.x < area.x + area.width &&
      bounds.x + bounds.width > area.x;

    const interseccionVertical =
      bounds.y < area.y + area.height &&
      bounds.y + bounds.height > area.y;

    return (
      interseccionHorizontal &&
      interseccionVertical
    );
  });
}

function obtenerBoundsGuardados(
  nombre,
  fallback
) {
  const guardado = leerEstadoGuardado();
  const datos = guardado[nombre];

  if (
    datos?.bounds &&
    estaDentroDePantallas(datos.bounds)
  ) {
    return datos.bounds;
  }

  return fallback;
}

function vincularPersistencia(
  nombre,
  ventana
) {
  let temporizador = null;

  const programarGuardado = () => {
    clearTimeout(temporizador);

    temporizador = setTimeout(
      () => guardarEstadoVentana(
        nombre,
        ventana
      ),
      250
    );
  };

  ventana.on('resize', programarGuardado);
  ventana.on('move', programarGuardado);

  ventana.on('close', () => {
    clearTimeout(temporizador);
    guardarEstadoVentana(
      nombre,
      ventana
    );
  });
}

/* =========================================================
   VENTANA DE CARGA
   ========================================================= */

function crearVentanaCarga() {
  const existente = obtenerVentana(
    NOMBRES_VENTANA.CARGA
  );

  if (existente) {
    return existente;
  }

  const ventana = new BrowserWindow({
    width: estado.opciones.anchoCarga,
    height: estado.opciones.altoCarga,
    frame: false,
    transparent: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    show: false,
    center: true,
    skipTaskbar: true,
    alwaysOnTop: true,
    backgroundColor: '#ffffff',
    webPreferences: opcionesWebPreferencias()
  });

  estado.ventanaCarga = registrarVentana(
    NOMBRES_VENTANA.CARGA,
    ventana
  );

  const rutaCarga = obtenerRutaApp(
    'carga.html'
  );

  if (fs.existsSync(rutaCarga)) {
    ventana.loadFile(rutaCarga);
  }
  else {
    const html = `
      <!doctype html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        >
        <title>Bitácora de Obra</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
            background:
              linear-gradient(
                135deg,
                #0f3d56,
                #176b87
              );
            color: #ffffff;
          }

          main {
            width: 100%;
            padding: 36px;
            text-align: center;
          }

          .logo {
            width: 82px;
            height: 82px;
            margin: 0 auto 20px;
            display: grid;
            place-items: center;
            border-radius: 22px;
            background: rgba(255,255,255,.16);
            border: 1px solid rgba(255,255,255,.28);
            font-size: 28px;
            font-weight: 700;
          }

          h1 {
            margin: 0 0 8px;
            font-size: 27px;
          }

          p {
            margin: 0 0 25px;
            color: rgba(255,255,255,.82);
          }

          .barra {
            height: 5px;
            overflow: hidden;
            border-radius: 99px;
            background: rgba(255,255,255,.18);
          }

          .barra::after {
            content: "";
            display: block;
            width: 35%;
            height: 100%;
            border-radius: inherit;
            background: #ffffff;
            animation: cargar 1.15s infinite ease-in-out;
          }

          @keyframes cargar {
            from {
              transform: translateX(-120%);
            }

            to {
              transform: translateX(390%);
            }
          }
        </style>
      </head>
      <body>
        <main>
          <div class="logo">BO</div>
          <h1>Bitácora de Obra</h1>
          <p>Preparando la aplicación...</p>
          <div class="barra"></div>
        </main>
      </body>
      </html>
    `;

    ventana.loadURL(
      `data:text/html;charset=utf-8,${
        encodeURIComponent(html)
      }`
    );
  }

  ventana.once(
    'ready-to-show',
    () => ventana.show()
  );

  return ventana;
}

function cerrarVentanaCarga() {
  clearTimeout(estado.temporizadorCarga);

  const ventana = estado.ventanaCarga;

  if (
    ventana &&
    !ventana.isDestroyed()
  ) {
    ventana.close();
  }

  estado.ventanaCarga = null;
}

/* =========================================================
   VENTANA PRINCIPAL
   ========================================================= */

function crearVentanaPrincipal(
  opciones = {}
) {
  const existente = obtenerVentana(
    NOMBRES_VENTANA.PRINCIPAL
  );

  if (existente) {
    if (existente.isMinimized()) {
      existente.restore();
    }

    existente.show();
    existente.focus();

    return existente;
  }

  if (
    estado.opciones.mostrarCarga &&
    !estado.ventanaCarga
  ) {
    crearVentanaCarga();
  }

  const bounds = obtenerBoundsGuardados(
    NOMBRES_VENTANA.PRINCIPAL,
    {
      width:
        estado.opciones.anchoPrincipal,
      height:
        estado.opciones.altoPrincipal
    }
  );

  const ventana = new BrowserWindow({
    ...bounds,
    minWidth:
      estado.opciones.anchoMinimoPrincipal,
    minHeight:
      estado.opciones.altoMinimoPrincipal,
    show: false,
    title:
      estado.opciones.tituloAplicacion,
    backgroundColor: '#f4f6f8',
    autoHideMenuBar: true,
    webPreferences: opcionesWebPreferencias(),
    ...opciones
  });

  estado.ventanaPrincipal = registrarVentana(
    NOMBRES_VENTANA.PRINCIPAL,
    ventana
  );

  vincularPersistencia(
    NOMBRES_VENTANA.PRINCIPAL,
    ventana
  );

  vincularEventosEstado(ventana);
  configurarNavegacionSegura(ventana);

  ventana.loadFile(
    obtenerRutaApp('index.html')
  );

  const mostrarPrincipal = () => {
    const ejecutar = () => {
      cerrarVentanaCarga();

      if (
        !ventana.isDestroyed()
      ) {
        ventana.show();
        ventana.focus();
      }
    };

    if (estado.opciones.mostrarCarga) {
      estado.temporizadorCarga = setTimeout(
        ejecutar,
        estado.opciones.tiempoMinimoCarga
      );
    }
    else {
      ejecutar();
    }
  };

  ventana.once(
    'ready-to-show',
    mostrarPrincipal
  );

  ventana.on(
    'close',
    evento => {
      if (
        process.platform === 'darwin' &&
        !app.isQuitting
      ) {
        evento.preventDefault();
        ventana.hide();
      }
    }
  );

  ventana.webContents.on(
    'render-process-gone',
    (_evento, detalles) => {
      console.error(
        'El proceso de renderizado principal finalizó:',
        detalles
      );
    }
  );

  return ventana;
}

/* =========================================================
   VENTANA DE VISTA PREVIA
   ========================================================= */

function crearVentanaVistaPrevia(
  parametros = {}
) {
  const existente = obtenerVentana(
    NOMBRES_VENTANA.VISTA_PREVIA
  );

  const tipo =
    parametros.tipo ||
    'folio';

  const id =
    parametros.id ||
    '';

  const consulta = new URLSearchParams({
    tipo,
    id
  }).toString();

  if (existente) {
    existente.loadFile(
      obtenerRutaApp(
        'vista-previa.html'
      ),
      {
        query: {
          tipo,
          id
        }
      }
    );

    if (existente.isMinimized()) {
      existente.restore();
    }

    existente.show();
    existente.focus();

    return existente;
  }

  const bounds = obtenerBoundsGuardados(
    NOMBRES_VENTANA.VISTA_PREVIA,
    {
      width:
        estado.opciones.anchoVistaPrevia,
      height:
        estado.opciones.altoVistaPrevia
    }
  );

  const ventana = new BrowserWindow({
    ...bounds,
    minWidth: 860,
    minHeight: 620,
    show: false,
    parent:
      estado.ventanaPrincipal || undefined,
    modal: false,
    title:
      `Vista previa | ${
        estado.opciones.tituloAplicacion
      }`,
    backgroundColor: '#f4f6f8',
    autoHideMenuBar: true,
    webPreferences: opcionesWebPreferencias()
  });

  estado.ventanaVistaPrevia =
    registrarVentana(
      NOMBRES_VENTANA.VISTA_PREVIA,
      ventana
    );

  vincularPersistencia(
    NOMBRES_VENTANA.VISTA_PREVIA,
    ventana
  );

  vincularEventosEstado(ventana);
  configurarNavegacionSegura(ventana);

  ventana.loadFile(
    obtenerRutaApp(
      'vista-previa.html'
    ),
    {
      query: {
        tipo,
        id
      }
    }
  );

  ventana.once(
    'ready-to-show',
    () => {
      ventana.show();
      ventana.focus();
    }
  );

  ventana.webContents.on(
    'did-finish-load',
    () => {
      ventana.webContents.send(
        'vista-previa:parametros',
        {
          tipo,
          id,
          consulta
        }
      );
    }
  );

  return ventana;
}

/* =========================================================
   VENTANA DE CONFIGURACIÓN
   ========================================================= */

function crearVentanaConfiguracion() {
  const existente = obtenerVentana(
    NOMBRES_VENTANA.CONFIGURACION
  );

  if (existente) {
    if (existente.isMinimized()) {
      existente.restore();
    }

    existente.show();
    existente.focus();

    return existente;
  }

  const bounds = obtenerBoundsGuardados(
    NOMBRES_VENTANA.CONFIGURACION,
    {
      width:
        estado.opciones.anchoConfiguracion,
      height:
        estado.opciones.altoConfiguracion
    }
  );

  const ventana = new BrowserWindow({
    ...bounds,
    minWidth: 760,
    minHeight: 600,
    show: false,
    parent:
      estado.ventanaPrincipal || undefined,
    modal: false,
    title:
      `Configuración | ${
        estado.opciones.tituloAplicacion
      }`,
    backgroundColor: '#f4f6f8',
    autoHideMenuBar: true,
    webPreferences: opcionesWebPreferencias()
  });

  estado.ventanaConfiguracion =
    registrarVentana(
      NOMBRES_VENTANA.CONFIGURACION,
      ventana
    );

  vincularPersistencia(
    NOMBRES_VENTANA.CONFIGURACION,
    ventana
  );

  vincularEventosEstado(ventana);
  configurarNavegacionSegura(ventana);

  ventana.loadFile(
    obtenerRutaApp(
      'configuracion.html'
    )
  );

  ventana.once(
    'ready-to-show',
    () => {
      ventana.show();
      ventana.focus();
    }
  );

  return ventana;
}

/* =========================================================
   VENTANA ACERCA DE
   ========================================================= */

function crearVentanaAcercaDe() {
  const existente = obtenerVentana(
    NOMBRES_VENTANA.ACERCA_DE
  );

  if (existente) {
    existente.show();
    existente.focus();

    return existente;
  }

  const ventana = new BrowserWindow({
    width:
      estado.opciones.anchoAcercaDe,
    height:
      estado.opciones.altoAcercaDe,
    minWidth: 480,
    minHeight: 420,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    show: false,
    parent:
      estado.ventanaPrincipal || undefined,
    modal: true,
    title:
      `Acerca de | ${
        estado.opciones.tituloAplicacion
      }`,
    backgroundColor: '#ffffff',
    autoHideMenuBar: true,
    webPreferences: opcionesWebPreferencias()
  });

  estado.ventanaAcercaDe =
    registrarVentana(
      NOMBRES_VENTANA.ACERCA_DE,
      ventana
    );

  vincularEventosEstado(ventana);
  configurarNavegacionSegura(ventana);

  const rutaAcercaDe =
    obtenerRutaApp('acerca-de.html');

  if (fs.existsSync(rutaAcercaDe)) {
    ventana.loadFile(rutaAcercaDe);
  }
  else {
    const html = `
      <!doctype html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        >
        <title>Acerca de</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 32px;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
            color: #213547;
            background: #f4f6f8;
          }

          main {
            width: 100%;
            padding: 34px;
            text-align: center;
            border: 1px solid #dfe5ea;
            border-radius: 18px;
            background: #ffffff;
            box-shadow:
              0 16px 45px rgba(15, 61, 86, .12);
          }

          .logo {
            width: 82px;
            height: 82px;
            margin: 0 auto 20px;
            display: grid;
            place-items: center;
            border-radius: 22px;
            color: #ffffff;
            background: #0f3d56;
            font-size: 27px;
            font-weight: 700;
          }

          h1 {
            margin: 0 0 8px;
            font-size: 27px;
          }

          p {
            margin: 8px 0;
            color: #5c6b76;
            line-height: 1.5;
          }

          strong {
            color: #0f3d56;
          }

          button {
            margin-top: 22px;
            padding: 11px 22px;
            border: 0;
            border-radius: 9px;
            color: #ffffff;
            background: #0f3d56;
            font: inherit;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <main>
          <div class="logo">BO</div>
          <h1>Bitácora de Obra</h1>
          <p>
            Aplicación de escritorio para el registro,
            control y seguimiento diario de obras.
          </p>
          <p>
            <strong>Versión ${app.getVersion()}</strong>
          </p>
          <p>
            © ${new Date().getFullYear()}
          </p>
          <button onclick="window.close()">
            Cerrar
          </button>
        </main>
      </body>
      </html>
    `;

    ventana.loadURL(
      `data:text/html;charset=utf-8,${
        encodeURIComponent(html)
      }`
    );
  }

  ventana.once(
    'ready-to-show',
    () => {
      ventana.show();
      ventana.focus();
    }
  );

  return ventana;
}

/* =========================================================
   OPERACIONES SOBRE VENTANAS
   ========================================================= */

function cerrarVentana(
  nombre
) {
  const ventana = obtenerVentana(nombre);

  if (!ventana) return false;

  ventana.close();
  return true;
}

function cerrarVentanasSecundarias() {
  [
    NOMBRES_VENTANA.VISTA_PREVIA,
    NOMBRES_VENTANA.CONFIGURACION,
    NOMBRES_VENTANA.ACERCA_DE,
    NOMBRES_VENTANA.CARGA
  ].forEach(cerrarVentana);
}

function enfocarVentanaPrincipal() {
  const ventana =
    estado.ventanaPrincipal ||
    crearVentanaPrincipal();

  if (ventana.isMinimized()) {
    ventana.restore();
  }

  ventana.show();
  ventana.focus();

  return ventana;
}

function obtenerEstadoVentana(ventana) {
  if (
    !ventana ||
    ventana.isDestroyed()
  ) {
    return {
      existe: false,
      maximizada: false,
      minimizada: false,
      visible: false,
      pantallaCompleta: false
    };
  }

  return {
    existe: true,
    maximizada: ventana.isMaximized(),
    minimizada: ventana.isMinimized(),
    visible: ventana.isVisible(),
    pantallaCompleta:
      ventana.isFullScreen(),
    bounds: ventana.getBounds()
  };
}

/* =========================================================
   IPC
   ========================================================= */

function registrarIPC() {
  if (estado.ipcRegistrado) return;

  ipcMain.handle(
    CANALES.ABRIR_VISTA_PREVIA,
    (_evento, parametros = {}) => {
      crearVentanaVistaPrevia(parametros);

      return {
        ok: true
      };
    }
  );

  ipcMain.handle(
    CANALES.ABRIR_CONFIGURACION,
    () => {
      crearVentanaConfiguracion();

      return {
        ok: true
      };
    }
  );

  ipcMain.handle(
    CANALES.ABRIR_ACERCA_DE,
    () => {
      crearVentanaAcercaDe();

      return {
        ok: true
      };
    }
  );

  ipcMain.handle(
    CANALES.CERRAR_ACTUAL,
    evento => {
      const ventana =
        obtenerVentanaDesdeEvento(evento);

      if (!ventana) {
        return {
          ok: false
        };
      }

      ventana.close();

      return {
        ok: true
      };
    }
  );

  ipcMain.handle(
    CANALES.MINIMIZAR_ACTUAL,
    evento => {
      const ventana =
        obtenerVentanaDesdeEvento(evento);

      if (!ventana) {
        return {
          ok: false
        };
      }

      ventana.minimize();

      return {
        ok: true
      };
    }
  );

  ipcMain.handle(
    CANALES.MAXIMIZAR_ACTUAL,
    evento => {
      const ventana =
        obtenerVentanaDesdeEvento(evento);

      if (!ventana) {
        return {
          ok: false
        };
      }

      if (ventana.isMaximized()) {
        ventana.unmaximize();
      }
      else {
        ventana.maximize();
      }

      return {
        ok: true,
        maximizada:
          ventana.isMaximized()
      };
    }
  );

  ipcMain.handle(
    CANALES.RESTAURAR_ACTUAL,
    evento => {
      const ventana =
        obtenerVentanaDesdeEvento(evento);

      if (!ventana) {
        return {
          ok: false
        };
      }

      if (ventana.isMinimized()) {
        ventana.restore();
      }

      if (ventana.isMaximized()) {
        ventana.unmaximize();
      }

      return {
        ok: true
      };
    }
  );

  ipcMain.handle(
    CANALES.RECARGAR_ACTUAL,
    evento => {
      const ventana =
        obtenerVentanaDesdeEvento(evento);

      if (!ventana) {
        return {
          ok: false
        };
      }

      ventana.reload();

      return {
        ok: true
      };
    }
  );

  ipcMain.handle(
    CANALES.ABRIR_EN_NAVEGADOR,
    async (_evento, url) => {
      if (!/^https?:\/\//i.test(String(url))) {
        return {
          ok: false,
          error:
            'La dirección no es válida.'
        };
      }

      await shell.openExternal(url);

      return {
        ok: true
      };
    }
  );

  ipcMain.handle(
    CANALES.OBTENER_ESTADO,
    evento => {
      const ventana =
        obtenerVentanaDesdeEvento(evento);

      return obtenerEstadoVentana(ventana);
    }
  );

  estado.ipcRegistrado = true;
}

function eliminarIPC() {
  Object.values(CANALES).forEach(canal => {
    if (
      canal !== CANALES.ESTADO_CAMBIO
    ) {
      ipcMain.removeHandler(canal);
    }
  });

  estado.ipcRegistrado = false;
}

/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

function configurar(
  opciones = {}
) {
  estado.opciones = {
    ...CONFIGURACION_PREDETERMINADA,
    ...opciones
  };

  return { ...estado.opciones };
}

function iniciar(
  opciones = {}
) {
  if (estado.iniciado) {
    return estado.ventanaPrincipal;
  }

  configurar(opciones);
  registrarIPC();

  estado.iniciado = true;

  return crearVentanaPrincipal();
}

function obtenerVentanaPrincipal() {
  return estado.ventanaPrincipal;
}

function obtenerVentanas() {
  return {
    principal:
      estado.ventanaPrincipal,
    carga:
      estado.ventanaCarga,
    vistaPrevia:
      estado.ventanaVistaPrevia,
    configuracion:
      estado.ventanaConfiguracion,
    acercaDe:
      estado.ventanaAcercaDe
  };
}

/* =========================================================
   EXPORTACIÓN DEL MÓDULO
   ========================================================= */

module.exports = Object.freeze({
  NOMBRES_VENTANA,
  CANALES,
  configurar,
  iniciar,
  registrarIPC,
  eliminarIPC,
  crearVentanaPrincipal,
  crearVentanaCarga,
  cerrarVentanaCarga,
  crearVentanaVistaPrevia,
  crearVentanaConfiguracion,
  crearVentanaAcercaDe,
  obtenerVentana,
  obtenerVentanaPrincipal,
  obtenerVentanas,
  obtenerEstadoVentana,
  enfocarVentanaPrincipal,
  cerrarVentana,
  cerrarVentanasSecundarias
});