"use strict";

/* ============================================================
   SERVICE WORKER
   Aplicación: Costos de Alquiler de Equipos de Construcción
   Ubicación del archivo: pwa/sw.js
============================================================ */

const VERSION_APP = "v1.0.0";

const CACHE_APP = `costos-alquiler-app-${VERSION_APP}`;
const CACHE_DATOS = `costos-alquiler-datos-${VERSION_APP}`;
const CACHE_IMAGENES = `costos-alquiler-imagenes-${VERSION_APP}`;

const PAGINA_INICIO = "../index.html";

/*
  Los archivos se escriben desde la ubicación pwa/sw.js.
  Por eso las rutas comienzan con ../
*/
const ARCHIVOS_BASE = [
  "../",
  "../index.html",
  "../entradas.html",
  "../calculo.html",
  "../resumen.html",
  "../equipos.html",
  "../equipo.html",
  "../catalogos-modelo.html",

  "../css/styles.css",

  "../js/app.js",
  "../js/calculos.js",
  "../js/entradas.js",
  "../js/resumen.js",
  "../js/catalogo.js",
  "../js/buscador.js",
  "../js/equipo.js",

  "../data/equipos-index.json",

  "../assets/images/logo.png",

  "../pwa/manifest.webmanifest"
];

/* ============================================================
   INSTALACIÓN
============================================================ */

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    instalarArchivosBase()
  );

  self.skipWaiting();
});

async function instalarArchivosBase() {
  const cache = await caches.open(CACHE_APP);

  /*
    Se utiliza allSettled para que un archivo faltante no impida
    completamente la instalación de la aplicación.
  */
  const resultados = await Promise.allSettled(
    ARCHIVOS_BASE.map(async (ruta) => {
      const solicitud = new Request(ruta, {
        cache: "reload"
      });

      const respuesta = await fetch(solicitud);

      if (!respuesta.ok) {
        throw new Error(
          `No se pudo precargar ${ruta}. HTTP ${respuesta.status}`
        );
      }

      await cache.put(
        solicitud,
        respuesta.clone()
      );
    })
  );

  const errores = resultados.filter(
    (resultado) => resultado.status === "rejected"
  );

  if (errores.length) {
    console.warn(
      "Algunos archivos no pudieron precargarse:",
      errores
    );
  }
}

/* ============================================================
   ACTIVACIÓN
============================================================ */

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    activarNuevaVersion()
  );
});

async function activarNuevaVersion() {
  const cachesPermitidos = [
    CACHE_APP,
    CACHE_DATOS,
    CACHE_IMAGENES
  ];

  const nombresCache = await caches.keys();

  await Promise.all(
    nombresCache.map((nombreCache) => {
      if (!cachesPermitidos.includes(nombreCache)) {
        return caches.delete(nombreCache);
      }

      return Promise.resolve(false);
    })
  );

  await self.clients.claim();
}

/* ============================================================
   INTERCEPCIÓN DE SOLICITUDES
============================================================ */

self.addEventListener("fetch", (evento) => {
  const solicitud = evento.request;

  if (solicitud.method !== "GET") {
    return;
  }

  const url = new URL(solicitud.url);

  /*
    Solo se gestionan recursos del mismo origen.
  */
  if (url.origin !== self.location.origin) {
    return;
  }

  if (solicitud.mode === "navigate") {
    evento.respondWith(
      responderNavegacion(solicitud)
    );

    return;
  }

  if (esArchivoDeDatos(url)) {
    evento.respondWith(
      redPrimeroConCache(
        solicitud,
        CACHE_DATOS
      )
    );

    return;
  }

  if (esImagen(url, solicitud)) {
    evento.respondWith(
      cachePrimeroConActualizacion(
        solicitud,
        CACHE_IMAGENES
      )
    );

    return;
  }

  evento.respondWith(
    cachePrimeroConRed(
      solicitud,
      CACHE_APP
    )
  );
});

/* ============================================================
   ESTRATEGIA PARA PÁGINAS HTML
   Red primero y caché como respaldo.
============================================================ */

async function responderNavegacion(solicitud) {
  try {
    const respuestaRed = await fetch(solicitud);

    if (
      respuestaRed &&
      respuestaRed.ok
    ) {
      const cache = await caches.open(CACHE_APP);

      await cache.put(
        solicitud,
        respuestaRed.clone()
      );
    }

    return respuestaRed;
  } catch {
    const respuestaCache =
      await caches.match(solicitud);

    if (respuestaCache) {
      return respuestaCache;
    }

    const inicio =
      await caches.match(PAGINA_INICIO);

    if (inicio) {
      return inicio;
    }

    return new Response(
      crearPaginaSinConexion(),
      {
        status: 503,
        statusText: "Sin conexión",
        headers: {
          "Content-Type": "text/html; charset=utf-8"
        }
      }
    );
  }
}

/* ============================================================
   DATOS JSON Y ARCHIVOS datos.js
   Red primero para recibir actualizaciones.
============================================================ */

async function redPrimeroConCache(
  solicitud,
  nombreCache
) {
  try {
    const respuestaRed = await fetch(solicitud);

    if (
      respuestaRed &&
      respuestaRed.ok
    ) {
      const cache = await caches.open(nombreCache);

      await cache.put(
        solicitud,
        respuestaRed.clone()
      );
    }

    return respuestaRed;
  } catch {
    const respuestaCache =
      await caches.match(solicitud);

    if (respuestaCache) {
      return respuestaCache;
    }

    return new Response(
      JSON.stringify({
        error: true,
        mensaje:
          "El archivo solicitado no está disponible sin conexión."
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      }
    );
  }
}

/* ============================================================
   ARCHIVOS ESTÁTICOS
   Caché primero y red como respaldo.
============================================================ */

async function cachePrimeroConRed(
  solicitud,
  nombreCache
) {
  const respuestaCache =
    await caches.match(solicitud);

  if (respuestaCache) {
    return respuestaCache;
  }

  try {
    const respuestaRed = await fetch(solicitud);

    if (
      respuestaRed &&
      respuestaRed.ok
    ) {
      const cache = await caches.open(nombreCache);

      await cache.put(
        solicitud,
        respuestaRed.clone()
      );
    }

    return respuestaRed;
  } catch {
    return new Response(
      "Recurso no disponible sin conexión.",
      {
        status: 503,
        statusText: "Sin conexión",
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      }
    );
  }
}

/* ============================================================
   IMÁGENES
   Muestra la caché de inmediato y actualiza en segundo plano.
============================================================ */

async function cachePrimeroConActualizacion(
  solicitud,
  nombreCache
) {
  const cache = await caches.open(nombreCache);
  const respuestaCache = await cache.match(solicitud);

  const actualizacion = fetch(solicitud)
    .then(async (respuestaRed) => {
      if (
        respuestaRed &&
        respuestaRed.ok
      ) {
        await cache.put(
          solicitud,
          respuestaRed.clone()
        );
      }

      return respuestaRed;
    })
    .catch(() => null);

  if (respuestaCache) {
    return respuestaCache;
  }

  const respuestaRed = await actualizacion;

  if (respuestaRed) {
    return respuestaRed;
  }

  return crearImagenAlternativa();
}

/* ============================================================
   IDENTIFICACIÓN DE RECURSOS
============================================================ */

function esArchivoDeDatos(url) {
  const ruta = url.pathname.toLowerCase();

  return (
    ruta.endsWith(".json") ||
    ruta.includes("/data/equipos/") &&
    ruta.endsWith("/datos.js") ||
    ruta.endsWith("/datos.js")
  );
}

function esImagen(url, solicitud) {
  const destinoImagen =
    solicitud.destination === "image";

  const extensionImagen =
    /\.(png|jpg|jpeg|webp|gif|svg|ico)$/i.test(
      url.pathname
    );

  return destinoImagen || extensionImagen;
}

/* ============================================================
   IMAGEN ALTERNATIVA
============================================================ */

function crearImagenAlternativa() {
  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="640"
      height="420"
      viewBox="0 0 640 420"
    >
      <rect
        width="640"
        height="420"
        fill="#e5e7eb"
      />

      <rect
        x="175"
        y="125"
        width="290"
        height="150"
        rx="18"
        fill="#cbd5e1"
      />

      <circle
        cx="245"
        cy="292"
        r="38"
        fill="#64748b"
      />

      <circle
        cx="395"
        cy="292"
        r="38"
        fill="#64748b"
      />

      <text
        x="320"
        y="345"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="22"
        fill="#334155"
      >
        Imagen no disponible
      </text>
    </svg>
  `;

  return new Response(
    svg.trim(),
    {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "no-store"
      }
    }
  );
}

/* ============================================================
   PÁGINA SIN CONEXIÓN
============================================================ */

function crearPaginaSinConexion() {
  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        >
        <title>Sin conexión</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
            background: #f1f5f9;
            color: #0f172a;
          }

          main {
            width: min(560px, 100%);
            padding: 36px;
            border-radius: 20px;
            background: #ffffff;
            box-shadow:
              0 18px 45px
              rgba(15, 23, 42, 0.12);
            text-align: center;
          }

          h1 {
            margin-top: 0;
            margin-bottom: 12px;
          }

          p {
            margin-bottom: 24px;
            line-height: 1.6;
            color: #475569;
          }

          button {
            border: 0;
            border-radius: 10px;
            padding: 12px 20px;
            font: inherit;
            font-weight: 700;
            color: #ffffff;
            background: #0f172a;
            cursor: pointer;
          }
        </style>
      </head>

      <body>
        <main>
          <h1>Sin conexión a internet</h1>

          <p>
            La página solicitada todavía no está guardada en este
            dispositivo. Revisa tu conexión e intenta nuevamente.
          </p>

          <button
            type="button"
            onclick="window.location.reload()"
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  `.trim();
}

/* ============================================================
   MENSAJES DESDE LA APLICACIÓN
============================================================ */

self.addEventListener("message", (evento) => {
  const datos = evento.data || {};

  if (datos.tipo === "ACTIVAR_NUEVA_VERSION") {
    self.skipWaiting();
  }

  if (datos.tipo === "LIMPIAR_CACHE_DATOS") {
    evento.waitUntil(
      caches.delete(CACHE_DATOS)
    );
  }

  if (datos.tipo === "LIMPIAR_CACHE_IMAGENES") {
    evento.waitUntil(
      caches.delete(CACHE_IMAGENES)
    );
  }

  if (datos.tipo === "LIMPIAR_TODAS_LAS_CACHES") {
    evento.waitUntil(
      caches.keys().then((nombres) =>
        Promise.all(
          nombres.map((nombre) =>
            caches.delete(nombre)
          )
        )
      )
    );
  }
});