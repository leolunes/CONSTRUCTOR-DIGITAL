/* ==========================================================
   COSTOS DE ALQUILER EQUIPO DE CONSTRUCCIÓN
   app.js - Control general de la página de inicio
   ========================================================== */

"use strict";

/* ==========================================================
   CONFIGURACIÓN GENERAL
   ========================================================== */

const APP_CONFIG = Object.freeze({
  indiceEquipos: "data/equipos-index.json",
  maxEquiposPanelInicio: 6,
  maxResultadosBusquedaInicio: 6,
  moneda: "COP",
  locale: "es-CO"
});

/* ==========================================================
   ESTADO DE LA APLICACIÓN
   ========================================================== */

const appState = {
  equipos: [],
  cargando: false,
  error: null
};

/* ==========================================================
   INICIALIZACIÓN
   ========================================================== */

document.addEventListener("DOMContentLoaded", iniciarAplicacion);

async function iniciarAplicacion() {
  configurarAnioPiePagina();
  configurarMenuLateral();
  configurarBotones();
  configurarBuscadorInicio();
  registrarServiceWorker();

  await cargarCatalogo();
}

/* ==========================================================
   CARGA DEL CATÁLOGO
   ========================================================== */

async function cargarCatalogo() {
  if (appState.cargando) return;

  appState.cargando = true;
  appState.error = null;

  actualizarEstadoCatalogo("Cargando");
  actualizarEstadoConexion();

  try {
    const respuesta = await fetch(
      `${APP_CONFIG.indiceEquipos}?v=${Date.now()}`,
      { cache: "no-store" }
    );

    if (!respuesta.ok) {
      throw new Error(
        `No fue posible leer ${APP_CONFIG.indiceEquipos}. ` +
        `Código HTTP: ${respuesta.status}`
      );
    }

    const datos = await respuesta.json();

    if (!Array.isArray(datos)) {
      throw new Error(
        "El archivo equipos-index.json debe contener un arreglo de equipos."
      );
    }

    appState.equipos = datos
      .map(normalizarEquipoIndice)
      .filter(Boolean)
      .sort(ordenarPorNombre);

    renderizarDashboard();
    actualizarEstadoCatalogo("Disponible");
    actualizarEstadoConexion();

  } catch (error) {
    console.error("Error cargando el catálogo:", error);

    appState.error = error;
    appState.equipos = [];

    renderizarDashboard();
    actualizarEstadoCatalogo("Error");
    actualizarEstadoConexion(true);

    mostrarToast(
      "No fue posible cargar el catálogo. Verifique equipos-index.json y ejecute la app con Live Server.",
      "error"
    );
  } finally {
    appState.cargando = false;
  }
}

/* ==========================================================
   NORMALIZACIÓN DE DATOS
   ========================================================== */

function normalizarEquipoIndice(equipo, posicion) {
  if (!equipo || typeof equipo !== "object") return null;

  const nombreEquipo = textoSeguro(
    equipo.nombreEquipo ??
    equipo.nombre ??
    equipo.familia ??
    equipo.titulo
  );

  if (!nombreEquipo) {
    console.warn(
      `Registro ignorado en la posición ${posicion}: no tiene nombre.`
    );
    return null;
  }

  const id = crearSlug(
    equipo.id ??
    equipo.slug ??
    nombreEquipo
  );

  const rutaDatos = textoSeguro(
    equipo.ruta ??
    equipo.rutaDatos ??
    equipo.archivo ??
    `data/equipos/${id}/datos.js`
  );

  const imagen = textoSeguro(
    equipo.imagen ??
    equipo.rutaImagen ??
    `data/equipos/${id}/imagen.jpg`
  );

  const tarifa = numeroSeguro(
    equipo.tarifaComercial ??
    equipo.tarifa ??
    equipo.costoComercialFinal ??
    equipo.costoComercialFinalHora
  );

  return {
    ...equipo,
    id,
    nombreEquipo,
    rutaDatos,
    imagen,
    codigoModelo: textoSeguro(
      equipo.codigoModelo ??
      equipo.modelo ??
      equipo.codigo
    ),
    equipoReferencia: textoSeguro(
      equipo.equipoReferencia ??
      equipo.descripcion ??
      equipo.referencia
    ),
    unidadAlquiler: textoSeguro(
      equipo.unidadAlquiler ??
      equipo.unidad ??
      "Hr"
    ),
    tarifaComercial: tarifa
  };
}

/* ==========================================================
   RENDERIZADO GENERAL
   ========================================================== */

function renderizarDashboard() {
  renderizarIndicadores();
  renderizarPanelEquipos();
}

function renderizarIndicadores() {
  const total = appState.equipos.length;

  const conImagen = appState.equipos.filter(
    equipo => Boolean(equipo.imagen)
  ).length;

  const tarifasValidas = appState.equipos
    .map(equipo => numeroSeguro(equipo.tarifaComercial))
    .filter(valor => valor > 0);

  const tarifaPromedio = tarifasValidas.length
    ? tarifasValidas.reduce((suma, valor) => suma + valor, 0) /
      tarifasValidas.length
    : 0;

  asignarTexto("totalEquipos", total);
  asignarTexto("equiposConImagen", conImagen);
  asignarTexto("tarifaPromedio", formatoMoneda(tarifaPromedio));
  asignarTexto("contadorPanelEquipos", total);
}

function renderizarPanelEquipos() {
  const contenedor = document.getElementById("listaEquiposInicio");

  if (!contenedor) return;

  contenedor.innerHTML = "";

  if (appState.error) {
    contenedor.appendChild(
      crearEstadoVacio(
        "No se pudo cargar el catálogo",
        "Revise el archivo data/equipos-index.json.",
        "⚠"
      )
    );
    return;
  }

  if (!appState.equipos.length) {
    contenedor.appendChild(
      crearEstadoVacio(
        "No hay equipos registrados",
        "Agregue equipos al archivo equipos-index.json.",
        "▦"
      )
    );
    return;
  }

  const equiposVisibles = appState.equipos.slice(
    0,
    APP_CONFIG.maxEquiposPanelInicio
  );

  equiposVisibles.forEach(equipo => {
    contenedor.appendChild(crearFilaEquipoInicio(equipo));
  });
}

function crearFilaEquipoInicio(equipo) {
  const enlace = document.createElement("a");
  enlace.className = "recent-equipment";
  enlace.href = crearUrlEquipo(equipo.id);
  enlace.setAttribute(
    "aria-label",
    `Abrir información de ${equipo.nombreEquipo}`
  );

  const imagenWrap = document.createElement("div");
  imagenWrap.className = "recent-equipment-image";

  const imagen = document.createElement("img");
  imagen.src = equipo.imagen;
  imagen.alt = equipo.nombreEquipo;
  imagen.loading = "lazy";

  imagen.addEventListener("error", () => {
    imagen.remove();

    const fallback = document.createElement("span");
    fallback.className = "image-fallback";
    fallback.textContent = "🚜";

    imagenWrap.appendChild(fallback);
  });

  imagenWrap.appendChild(imagen);

  const contenido = document.createElement("div");
  contenido.className = "recent-equipment-content";

  const nombre = document.createElement("strong");
  nombre.textContent = equipo.nombreEquipo;

  const detalle = document.createElement("span");

  const partesDetalle = [];

  if (equipo.codigoModelo) {
    partesDetalle.push(equipo.codigoModelo);
  }

  if (equipo.tarifaComercial > 0) {
    partesDetalle.push(
      `${formatoMoneda(equipo.tarifaComercial)} / ${equipo.unidadAlquiler}`
    );
  }

  detalle.textContent = partesDetalle.join(" · ") || "Ver información";

  contenido.append(nombre, detalle);

  const flecha = document.createElement("span");
  flecha.className = "recent-equipment-arrow";
  flecha.textContent = "→";

  enlace.append(imagenWrap, contenido, flecha);

  return enlace;
}

/* ==========================================================
   BUSCADOR DE LA PÁGINA DE INICIO
   ========================================================== */

function configurarBuscadorInicio() {
  const formulario = document.getElementById("formBuscadorInicio");
  const entrada = document.getElementById("busquedaInicio");

  if (!formulario || !entrada) return;

  formulario.addEventListener("submit", evento => {
    evento.preventDefault();

    const consulta = entrada.value.trim();

    if (!consulta) {
      renderizarResultadosBusqueda([]);
      entrada.focus();
      return;
    }

    const resultados = buscarEquipos(consulta);

    renderizarResultadosBusqueda(resultados);

    if (!resultados.length) {
      mostrarToast(
        `No se encontraron equipos para “${consulta}”.`,
        "info"
      );
    }
  });

  entrada.addEventListener("input", () => {
    const consulta = entrada.value.trim();

    if (!consulta) {
      renderizarResultadosBusqueda([]);
      return;
    }

    const resultados = buscarEquipos(consulta);
    renderizarResultadosBusqueda(resultados);
  });

  const parametros = new URLSearchParams(window.location.search);

  if (parametros.get("accion") === "buscar") {
    setTimeout(() => enfocarBuscadorInicio(), 150);
  }
}

function buscarEquipos(consulta) {
  const termino = normalizarTextoBusqueda(consulta);

  if (!termino) return [];

  return appState.equipos
    .filter(equipo => {
      const contenido = [
        equipo.nombreEquipo,
        equipo.codigoModelo,
        equipo.equipoReferencia
      ]
        .map(normalizarTextoBusqueda)
        .join(" ");

      return contenido.includes(termino);
    })
    .slice(0, APP_CONFIG.maxResultadosBusquedaInicio);
}

function renderizarResultadosBusqueda(resultados) {
  const contenedor = document.getElementById(
    "resultadosBusquedaInicio"
  );

  if (!contenedor) return;

  contenedor.innerHTML = "";

  const entrada = document.getElementById("busquedaInicio");
  const consulta = entrada?.value.trim() ?? "";

  if (!consulta) return;

  if (!resultados.length) {
    const mensaje = document.createElement("div");
    mensaje.className = "search-empty";
    mensaje.textContent = "No se encontraron equipos con ese nombre.";
    contenedor.appendChild(mensaje);
    return;
  }

  resultados.forEach(equipo => {
    const enlace = document.createElement("a");
    enlace.className = "quick-result-item";
    enlace.href = crearUrlEquipo(equipo.id);

    const informacion = document.createElement("div");

    const nombre = document.createElement("strong");
    nombre.textContent = equipo.nombreEquipo;

    const descripcion = document.createElement("span");
    descripcion.textContent =
      equipo.equipoReferencia ||
      equipo.codigoModelo ||
      "Abrir ficha del equipo";

    informacion.append(nombre, descripcion);

    const flecha = document.createElement("span");
    flecha.textContent = "→";

    enlace.append(informacion, flecha);
    contenedor.appendChild(enlace);
  });
}

function enfocarBuscadorInicio() {
  const seccion = document.getElementById("seccionBuscador");
  const entrada = document.getElementById("busquedaInicio");

  seccion?.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  setTimeout(() => entrada?.focus(), 350);
}

/* ==========================================================
   BOTONES Y NAVEGACIÓN
   ========================================================== */

function configurarBotones() {
  const btnActualizar = document.getElementById(
    "btnActualizarDatos"
  );

  const btnEnfocar = document.getElementById(
    "btnEnfocarBuscador"
  );

  btnActualizar?.addEventListener("click", async () => {
    mostrarToast("Actualizando catálogo...", "info");
    await cargarCatalogo();

    if (!appState.error) {
      mostrarToast("Catálogo actualizado correctamente.", "success");
    }
  });

  btnEnfocar?.addEventListener("click", enfocarBuscadorInicio);
}

function configurarMenuLateral() {
  const boton = document.getElementById("btnMenu");
  const sidebar = document.getElementById("sidebar");

  if (!boton || !sidebar) return;

  boton.addEventListener("click", () => {
    const abierto = sidebar.classList.toggle("sidebar-open");

    boton.setAttribute(
      "aria-expanded",
      abierto ? "true" : "false"
    );

    document.body.classList.toggle(
      "menu-open",
      abierto
    );
  });

  document.addEventListener("click", evento => {
    const esPantallaMovil = window.matchMedia(
      "(max-width: 1000px)"
    ).matches;

    if (!esPantallaMovil) return;

    const clicDentroSidebar = sidebar.contains(evento.target);
    const clicEnBoton = boton.contains(evento.target);

    if (!clicDentroSidebar && !clicEnBoton) {
      cerrarMenuLateral();
    }
  });

  window.addEventListener("resize", () => {
    if (!window.matchMedia("(max-width: 1000px)").matches) {
      cerrarMenuLateral();
    }
  });
}

function cerrarMenuLateral() {
  const boton = document.getElementById("btnMenu");
  const sidebar = document.getElementById("sidebar");

  sidebar?.classList.remove("sidebar-open");
  boton?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

/* ==========================================================
   ESTADO DE CONEXIÓN Y CATÁLOGO
   ========================================================== */

function actualizarEstadoCatalogo(texto) {
  asignarTexto("estadoCatalogo", texto);
}

function actualizarEstadoConexion(forzarError = false) {
  const titulo = document.getElementById("statusTitle");
  const descripcion = document.getElementById(
    "statusDescription"
  );
  const punto = document.getElementById("statusDot");

  if (!titulo || !descripcion || !punto) return;

  if (forzarError || appState.error) {
    titulo.textContent = "Error de lectura";
    descripcion.textContent =
      "No fue posible cargar los archivos del catálogo";
    punto.style.background = "#ef4444";
    return;
  }

  if (navigator.onLine) {
    titulo.textContent = "Catálogo disponible";
    descripcion.textContent =
      "Información cargada desde archivos del proyecto";
    punto.style.background = "#22c55e";
  } else {
    titulo.textContent = "Modo sin conexión";
    descripcion.textContent =
      "La app intentará usar los archivos almacenados";
    punto.style.background = "#f59e0b";
  }
}

window.addEventListener("online", () => {
  actualizarEstadoConexion();
  mostrarToast("La conexión a internet fue restablecida.", "success");
});

window.addEventListener("offline", () => {
  actualizarEstadoConexion();
  mostrarToast("La aplicación está trabajando sin conexión.", "info");
});

/* ==========================================================
   SERVICE WORKER
   ========================================================== */

function registrarServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("pwa/sw.js");
    } catch (error) {
      console.warn(
        "No fue posible registrar el Service Worker:",
        error
      );
    }
  });
}

/* ==========================================================
   MENSAJES TIPO TOAST
   ========================================================== */

function mostrarToast(
  mensaje,
  tipo = "info",
  duracion = 3500
) {
  const contenedor = document.getElementById("toastContainer");

  if (!contenedor || !mensaje) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${tipo}`;
  toast.setAttribute("role", "status");

  const iconos = {
    success: "✓",
    error: "!",
    warning: "⚠",
    info: "i"
  };

  const icono = document.createElement("span");
  icono.className = "toast-icon";
  icono.textContent = iconos[tipo] ?? iconos.info;

  const texto = document.createElement("span");
  texto.className = "toast-message";
  texto.textContent = mensaje;

  const cerrar = document.createElement("button");
  cerrar.type = "button";
  cerrar.className = "toast-close";
  cerrar.textContent = "×";
  cerrar.setAttribute("aria-label", "Cerrar mensaje");

  cerrar.addEventListener("click", () => eliminarToast(toast));

  toast.append(icono, texto, cerrar);
  contenedor.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("toast-visible");
  });

  window.setTimeout(() => eliminarToast(toast), duracion);
}

function eliminarToast(toast) {
  if (!toast?.isConnected) return;

  toast.classList.remove("toast-visible");

  window.setTimeout(() => {
    toast.remove();
  }, 220);
}

/* ==========================================================
   ELEMENTOS AUXILIARES
   ========================================================== */

function crearEstadoVacio(titulo, descripcion, icono = "▦") {
  const contenedor = document.createElement("div");
  contenedor.className = "empty-state";

  const elementoIcono = document.createElement("div");
  elementoIcono.className = "empty-state-icon";
  elementoIcono.textContent = icono;

  const elementoTitulo = document.createElement("strong");
  elementoTitulo.textContent = titulo;

  const elementoDescripcion = document.createElement("p");
  elementoDescripcion.textContent = descripcion;

  contenedor.append(
    elementoIcono,
    elementoTitulo,
    elementoDescripcion
  );

  return contenedor;
}

function configurarAnioPiePagina() {
  asignarTexto(
    "footerYear",
    `© ${new Date().getFullYear()}`
  );
}

function crearUrlEquipo(id) {
  return `equipo.html?id=${encodeURIComponent(id)}`;
}

function asignarTexto(id, valor) {
  const elemento = document.getElementById(id);

  if (elemento) {
    elemento.textContent = String(valor ?? "");
  }
}

/* ==========================================================
   UTILIDADES
   ========================================================== */

function textoSeguro(valor) {
  if (valor === null || valor === undefined) return "";
  return String(valor).trim();
}

function numeroSeguro(valor) {
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : 0;
  }

  if (valor === null || valor === undefined || valor === "") {
    return 0;
  }

  const texto = String(valor)
    .trim()
    .replace(/\s/g, "")
    .replace(/\$/g, "");

  if (!texto) return 0;

  /*
    Convierte formatos frecuentes:
    271.305       -> 271305
    271,305       -> 271305
    271.305,50    -> 271305.50
    271305.50     -> 271305.50
  */

  let normalizado = texto;

  const contienePunto = normalizado.includes(".");
  const contieneComa = normalizado.includes(",");

  if (contienePunto && contieneComa) {
    const ultimoPunto = normalizado.lastIndexOf(".");
    const ultimaComa = normalizado.lastIndexOf(",");

    if (ultimaComa > ultimoPunto) {
      normalizado = normalizado
        .replace(/\./g, "")
        .replace(",", ".");
    } else {
      normalizado = normalizado.replace(/,/g, "");
    }
  } else if (contieneComa) {
    const partes = normalizado.split(",");

    if (partes.length === 2 && partes[1].length <= 2) {
      normalizado = normalizado.replace(",", ".");
    } else {
      normalizado = normalizado.replace(/,/g, "");
    }
  } else if (contienePunto) {
    const partes = normalizado.split(".");

    if (
      partes.length > 2 ||
      (partes.length === 2 && partes[1].length === 3)
    ) {
      normalizado = normalizado.replace(/\./g, "");
    }
  }

  const numero = Number(normalizado);

  return Number.isFinite(numero) ? numero : 0;
}

function formatoMoneda(valor) {
  return new Intl.NumberFormat(
    APP_CONFIG.locale,
    {
      style: "currency",
      currency: APP_CONFIG.moneda,
      maximumFractionDigits: 0
    }
  ).format(numeroSeguro(valor));
}

function ordenarPorNombre(a, b) {
  return a.nombreEquipo.localeCompare(
    b.nombreEquipo,
    APP_CONFIG.locale,
    { sensitivity: "base" }
  );
}

function normalizarTextoBusqueda(valor) {
  return textoSeguro(valor)
    .toLocaleLowerCase(APP_CONFIG.locale)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function crearSlug(valor) {
  const slug = normalizarTextoBusqueda(valor)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `equipo-${Date.now()}`;
}

/* ==========================================================
   API PÚBLICA MÍNIMA
   Los demás archivos podrán reutilizar estas funciones.
   ========================================================== */

window.CostosAlquilerApp = Object.freeze({
  getEquipos: () => [...appState.equipos],
  buscarEquipos,
  formatoMoneda,
  numeroSeguro,
  textoSeguro,
  normalizarTextoBusqueda,
  crearSlug,
  mostrarToast,
  recargarCatalogo: cargarCatalogo
});