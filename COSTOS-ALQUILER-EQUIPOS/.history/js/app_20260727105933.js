"use strict";

/* ============================================================
   APP.JS
   Funciones generales de la aplicación:
   - Menú lateral
   - Año del pie de página
   - Navegación activa
   - Registro del Service Worker
   - Utilidades globales
   - Catálogo técnico de equipos registrados
============================================================ */

document.addEventListener("DOMContentLoaded", iniciarAplicacion);

const RUTA_INDICE_EQUIPOS = "data/equipos-index.json";
const CLAVE_EQUIPO_ACTUAL = "costos_alquiler_equipo_actual";

let catalogoEquipos = [];
let catalogoFiltrado = [];

/* ============================================================
   INICIO GENERAL
============================================================ */

function iniciarAplicacion() {
  actualizarAnio();
  configurarMenuLateral();
  marcarPaginaActiva();
  configurarEnlacesInternos();
  registrarServiceWorker();

  if (document.getElementById("gridEquipos")) {
    iniciarCatalogoInicio();
  }
}

/* ============================================================
   CATÁLOGO DE LA PÁGINA INICIAL
============================================================ */

async function iniciarCatalogoInicio() {
  configurarControlesCatalogo();

  try {
    catalogoEquipos = await cargarIndiceEquipos();
    catalogoFiltrado = [...catalogoEquipos];

    actualizarResumenCatalogo(catalogoEquipos.length);
    ordenarYRenderizarCatalogo();
  } catch (error) {
    console.error("No fue posible cargar el catálogo:", error);
    mostrarErrorCatalogo(error.message);
  }
}

async function cargarIndiceEquipos() {
  const respuesta = await fetch(
    `${RUTA_INDICE_EQUIPOS}?v=${Date.now()}`,
    {
      cache: "no-store"
    }
  );

  if (!respuesta.ok) {
    throw new Error(
      `No se pudo cargar ${RUTA_INDICE_EQUIPOS}.`
    );
  }

  const datos = await respuesta.json();

  const equipos = Array.isArray(datos)
    ? datos
    : Array.isArray(datos?.equipos)
      ? datos.equipos
      : [];

  if (!equipos.length) {
    throw new Error(
      "El archivo de equipos no contiene registros técnicos."
    );
  }

  return equipos.map(normalizarRegistroEquipo);
}

function normalizarRegistroEquipo(equipo) {
  const id = String(equipo?.id ?? "").trim();

  return {
    id,
    nombreEquipo:
      String(
        equipo?.nombreEquipo ??
        equipo?.nombre ??
        id ??
        "Equipo"
      ).trim(),
    codigoModelo:
      String(
        equipo?.codigoModelo ??
        equipo?.codigo ??
        "—"
      ).trim(),
    equipoReferencia:
      String(
        equipo?.equipoReferencia ??
        equipo?.referencia ??
        "Equipo registrado en la base de costos."
      ).trim(),
    imagen:
      String(
        equipo?.imagen ??
        `data/equipos/${id}/imagen.jpg`
      ).trim(),
    ruta:
      String(
        equipo?.rutaDatos ??
        equipo?.ruta ??
        `data/equipos/${id}/datos.js`
      ).trim(),
    unidadAlquiler:
      String(
        equipo?.unidadAlquiler ??
        "Hr"
      ).trim(),
    tarifaComercial:
      convertirNumero(
        equipo?.tarifaComercial
      ),
    versionDatos:
      String(
        equipo?.versionDatos ??
        ""
      ).trim()
  };
}

function configurarControlesCatalogo() {
  const inputBusqueda =
    document.getElementById("buscarEquipo");

  const botonLimpiar =
    document.getElementById("limpiarBusqueda");

  const selectorOrden =
    document.getElementById("ordenEquipos");

  const botonRestablecer =
    document.getElementById("btnRestablecerCatalogo");

  inputBusqueda?.addEventListener(
    "input",
    filtrarCatalogo
  );

  botonLimpiar?.addEventListener(
    "click",
    () => {
      if (inputBusqueda) {
        inputBusqueda.value = "";
        inputBusqueda.focus();
      }

      filtrarCatalogo();
    }
  );

  selectorOrden?.addEventListener(
    "change",
    ordenarYRenderizarCatalogo
  );

  botonRestablecer?.addEventListener(
    "click",
    () => {
      if (inputBusqueda) {
        inputBusqueda.value = "";
      }

      if (selectorOrden) {
        selectorOrden.value = "nombre";
      }

      catalogoFiltrado = [...catalogoEquipos];
      ordenarYRenderizarCatalogo();
    }
  );
}

function filtrarCatalogo() {
  const termino = normalizarTexto(
    document.getElementById("buscarEquipo")?.value
  );

  if (!termino) {
    catalogoFiltrado = [...catalogoEquipos];
  } else {
    catalogoFiltrado = catalogoEquipos.filter(
      (equipo) => {
        const textoBusqueda = normalizarTexto(
          [
            equipo.nombreEquipo,
            equipo.codigoModelo,
            equipo.equipoReferencia,
            equipo.unidadAlquiler
          ].join(" ")
        );

        return textoBusqueda.includes(termino);
      }
    );
  }

  ordenarYRenderizarCatalogo();
}

function ordenarYRenderizarCatalogo() {
  const criterio =
    document.getElementById("ordenEquipos")?.value ||
    "nombre";

  const listaOrdenada = [...catalogoFiltrado];

  listaOrdenada.sort((a, b) => {
    if (criterio === "codigo") {
      return a.codigoModelo.localeCompare(
        b.codigoModelo,
        "es",
        {
          sensitivity: "base"
        }
      );
    }

    if (criterio === "tarifa-menor") {
      return (
        a.tarifaComercial -
        b.tarifaComercial
      );
    }

    if (criterio === "tarifa-mayor") {
      return (
        b.tarifaComercial -
        a.tarifaComercial
      );
    }

    return a.nombreEquipo.localeCompare(
      b.nombreEquipo,
      "es",
      {
        sensitivity: "base"
      }
    );
  });

  renderizarCatalogo(listaOrdenada);
}

function renderizarCatalogo(equipos) {
  const grid =
    document.getElementById("gridEquipos");

  const estadoVacio =
    document.getElementById("estadoSinResultados");

  const estadoError =
    document.getElementById("estadoErrorCatalogo");

  if (!grid) {
    return;
  }

  grid.innerHTML = "";

  estadoError?.setAttribute("hidden", "");

  if (!equipos.length) {
    estadoVacio?.removeAttribute("hidden");
    actualizarContadorResultados(0);
    return;
  }

  estadoVacio?.setAttribute("hidden", "");

  const fragmento =
    document.createDocumentFragment();

  equipos.forEach((equipo) => {
    fragmento.appendChild(
      crearTarjetaEquipo(equipo)
    );
  });

  grid.appendChild(fragmento);

  actualizarContadorResultados(
    equipos.length
  );
}

function crearTarjetaEquipo(equipo) {
  const enlace =
    document.createElement("a");

  enlace.className = "catalog-card";
  enlace.href =
    `equipo.html?id=${encodeURIComponent(equipo.id)}`;

  enlace.setAttribute(
    "aria-label",
    `Consultar ficha técnica de ${equipo.nombreEquipo}`
  );

  enlace.addEventListener("click", () => {
    guardarEquipoSeleccionado(equipo);
  });

  const contenedorImagen =
    document.createElement("div");

  contenedorImagen.className =
    "catalog-card-image";

  const imagen =
    document.createElement("img");

  imagen.src =
    `${equipo.imagen}?v=${Date.now()}`;

  imagen.alt =
    `Imagen de ${equipo.nombreEquipo}`;

  imagen.loading = "lazy";

  imagen.decoding = "async";

  imagen.fetchPriority = "low";

  const fallback =
    document.createElement("div");

  fallback.className =
    "catalog-card-image-fallback";

  fallback.textContent = "🏗️";
  fallback.hidden = true;

  imagen.addEventListener("error", () => {
    imagen.hidden = true;
    fallback.hidden = false;
  });

  contenedorImagen.append(
    imagen,
    fallback
  );

  const estado =
    document.createElement("span");

  estado.className =
    "catalog-card-status";

  estado.textContent =
    "REGISTRADO";

  contenedorImagen.appendChild(estado);

  const cuerpo =
    document.createElement("div");

  cuerpo.className =
    "catalog-card-body";

  const meta =
    document.createElement("div");

  meta.className =
    "catalog-card-meta";

  const codigo =
    document.createElement("span");

  codigo.className =
    "catalog-card-code";

  codigo.textContent =
    equipo.codigoModelo;

  const unidad =
    document.createElement("span");

  unidad.className =
    "catalog-card-family";

  unidad.textContent =
    equipo.unidadAlquiler;

  meta.append(
    codigo,
    unidad
  );

  const titulo =
    document.createElement("h3");

  titulo.textContent =
    equipo.nombreEquipo;

  const descripcion =
    document.createElement("p");

  descripcion.textContent =
    equipo.equipoReferencia;

  const valores =
    document.createElement("div");

  valores.className =
    "catalog-card-values";

  const valorTarifa =
    document.createElement("div");

  const etiquetaTarifa =
    document.createElement("span");

  etiquetaTarifa.textContent =
    "Costo horario referencial";

  const datoTarifa =
    document.createElement("strong");

  datoTarifa.textContent =
    formatearMoneda(equipo.tarifaComercial);

  valorTarifa.append(
    etiquetaTarifa,
    datoTarifa
  );

  const valorUnidad =
    document.createElement("div");

  const etiquetaUnidad =
    document.createElement("span");

  etiquetaUnidad.textContent =
    "Unidad de análisis";

  const datoUnidad =
    document.createElement("strong");

  datoUnidad.textContent =
    equipo.unidadAlquiler;

  valorUnidad.append(
    etiquetaUnidad,
    datoUnidad
  );

  valores.append(
    valorTarifa,
    valorUnidad
  );

  cuerpo.append(
    meta,
    titulo,
    descripcion,
    valores
  );

  const pie =
    document.createElement("div");

  pie.className =
    "catalog-card-footer";

  const textoAbrir =
    document.createElement("span");

  textoAbrir.textContent =
    "Consultar ficha técnica";

  const flecha =
    document.createElement("span");

  flecha.textContent = "→";
  flecha.setAttribute(
    "aria-hidden",
    "true"
  );

  pie.append(
    textoAbrir,
    flecha
  );

  enlace.append(
    contenedorImagen,
    cuerpo,
    pie
  );

  return enlace;
}

function guardarEquipoSeleccionado(equipo) {
  const datosSeleccionados = {
    id: equipo.id,
    nombreEquipo: equipo.nombreEquipo,
    codigoModelo: equipo.codigoModelo,
    rutaDatos: equipo.ruta,
    imagen: equipo.imagen,
    unidadAlquiler: equipo.unidadAlquiler,
    tarifaComercial: equipo.tarifaComercial,
    seleccionadoEn:
      new Date().toISOString()
  };

  guardarLocalStorage(
    CLAVE_EQUIPO_ACTUAL,
    datosSeleccionados
  );
}

function actualizarResumenCatalogo(total) {
  const totalEquipos =
    document.getElementById("totalEquipos");

  const estadoCatalogo =
    document.getElementById("estadoCatalogo");

  if (totalEquipos) {
    totalEquipos.textContent =
      formatearNumero(total);
  }

  if (estadoCatalogo) {
    estadoCatalogo.textContent =
      `${total} equipos registrados`;
  }
}

function actualizarContadorResultados(total) {
  const contador =
    document.getElementById("contadorResultados");

  if (!contador) {
    return;
  }

  contador.textContent =
    total === 1
      ? "1 equipo"
      : `${total} equipos`;
}

function mostrarErrorCatalogo(mensaje) {
  const grid =
    document.getElementById("gridEquipos");

  const estadoVacio =
    document.getElementById("estadoSinResultados");

  const estadoError =
    document.getElementById("estadoErrorCatalogo");

  const mensajeError =
    document.getElementById("mensajeErrorCatalogo");

  const estadoCatalogo =
    document.getElementById("estadoCatalogo");

  if (grid) {
    grid.innerHTML = "";
  }

  estadoVacio?.setAttribute("hidden", "");
  estadoError?.removeAttribute("hidden");

  if (mensajeError) {
    mensajeError.textContent = mensaje;
  }

  if (estadoCatalogo) {
    estadoCatalogo.textContent =
      "No fue posible cargar la base";
  }

  actualizarResumenCatalogo(0);
  actualizarContadorResultados(0);
}

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/* ============================================================
   AÑO DEL PIE DE PÁGINA
============================================================ */

function actualizarAnio() {
  const elementos = document.querySelectorAll(
    "#footerYear, [data-current-year]"
  );

  elementos.forEach((elemento) => {
    elemento.textContent =
      new Date().getFullYear();
  });
}

/* ============================================================
   MENÚ LATERAL
============================================================ */

function configurarMenuLateral() {
  const botonMenu =
    document.getElementById("btnMenu") ||
    document.querySelector("[data-menu-toggle]");

  const sidebar =
    document.getElementById("sidebar") ||
    document.querySelector(".sidebar");

  if (!botonMenu || !sidebar) {
    return;
  }

  botonMenu.setAttribute(
    "aria-expanded",
    "false"
  );

  botonMenu.addEventListener("click", () => {
    const abierto =
      sidebar.classList.toggle("open");

    botonMenu.setAttribute(
      "aria-expanded",
      String(abierto)
    );

    document.body.classList.toggle(
      "sidebar-open",
      abierto
    );
  });

  document.addEventListener("click", (evento) => {
    const pantallaMovil =
      window.matchMedia(
        "(max-width: 900px)"
      ).matches;

    if (!pantallaMovil) {
      return;
    }

    const clicDentroSidebar =
      sidebar.contains(evento.target);

    const clicBoton =
      botonMenu.contains(evento.target);

    if (
      !clicDentroSidebar &&
      !clicBoton
    ) {
      cerrarMenu();
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      cerrarMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      cerrarMenu();
    }
  });

  function cerrarMenu() {
    sidebar.classList.remove("open");
    document.body.classList.remove(
      "sidebar-open"
    );
    botonMenu.setAttribute(
      "aria-expanded",
      "false"
    );
  }
}

/* ============================================================
   NAVEGACIÓN ACTIVA
============================================================ */

function marcarPaginaActiva() {
  const paginaActual =
    window.location.pathname
      .split("/")
      .pop()
      .toLowerCase() ||
    "index.html";

  const enlaces =
    document.querySelectorAll("a[href]");

  enlaces.forEach((enlace) => {
    const href =
      enlace
        .getAttribute("href")
        ?.split("?")[0]
        ?.split("#")[0]
        ?.toLowerCase();

    if (!href) {
      return;
    }

    const archivoEnlace =
      href.split("/").pop();

    if (
      archivoEnlace ===
      paginaActual
    ) {
      enlace.classList.add("active");
      enlace.setAttribute(
        "aria-current",
        "page"
      );
    }
  });
}

/* ============================================================
   ENLACES INTERNOS
============================================================ */

function configurarEnlacesInternos() {
  document.addEventListener("click", (evento) => {
    const enlace =
      evento.target.closest(
        'a[href^="#"]'
      );

    if (!enlace) {
      return;
    }

    const destinoId =
      enlace.getAttribute("href");

    if (
      !destinoId ||
      destinoId === "#"
    ) {
      return;
    }

    const destino =
      document.querySelector(
        destinoId
      );

    if (!destino) {
      return;
    }

    evento.preventDefault();

    destino.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

/* ============================================================
   SERVICE WORKER / PWA
============================================================ */

function registrarServiceWorker() {
  if (
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  window.addEventListener(
    "load",
    async () => {
      try {
        await navigator.serviceWorker.register(
          "pwa/sw.js"
        );

        console.info(
          "Service Worker registrado correctamente."
        );
      } catch (error) {
        console.warn(
          "No fue posible registrar el Service Worker:",
          error
        );
      }
    }
  );
}

/* ============================================================
   UTILIDADES GLOBALES
============================================================ */

function formatearMoneda(valor) {
  const numero = convertirNumero(valor);

  return new Intl.NumberFormat(
    "es-CO",
    {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }
  ).format(numero);
}

function formatearNumero(
  valor,
  decimales = 0
) {
  const numero = convertirNumero(valor);

  return new Intl.NumberFormat(
    "es-CO",
    {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    }
  ).format(numero);
}

function convertirNumero(valor) {
  if (
    typeof valor === "number"
  ) {
    return Number.isFinite(valor)
      ? valor
      : 0;
  }

  const texto = String(valor ?? "")
    .trim()
    .replace(/\$/g, "")
    .replace(/\s/g, "");

  if (!texto) {
    return 0;
  }

  if (
    texto.includes(".") &&
    texto.includes(",")
  ) {
    const numero = Number(
      texto
        .replace(/\./g, "")
        .replace(",", ".")
    );

    return Number.isFinite(numero)
      ? numero
      : 0;
  }

  if (texto.includes(",")) {
    const numero = Number(
      texto.replace(",", ".")
    );

    return Number.isFinite(numero)
      ? numero
      : 0;
  }

  const numero = Number(texto);

  return Number.isFinite(numero)
    ? numero
    : 0;
}

function guardarLocalStorage(
  clave,
  valor
) {
  try {
    localStorage.setItem(
      clave,
      JSON.stringify(valor)
    );

    return true;
  } catch (error) {
    console.error(
      `No fue posible guardar ${clave}:`,
      error
    );

    return false;
  }
}

function leerLocalStorage(
  clave,
  valorPredeterminado = null
) {
  try {
    const contenido =
      localStorage.getItem(clave);

    if (contenido === null) {
      return valorPredeterminado;
    }

    return JSON.parse(contenido);
  } catch (error) {
    console.error(
      `No fue posible leer ${clave}:`,
      error
    );

    return valorPredeterminado;
  }
}

function eliminarLocalStorage(clave) {
  try {
    localStorage.removeItem(clave);
    return true;
  } catch (error) {
    console.error(
      `No fue posible eliminar ${clave}:`,
      error
    );

    return false;
  }
}

function mostrarToastGlobal(
  mensaje,
  tipo = "success"
) {
  let contenedor =
    document.getElementById(
      "toastContainer"
    );

  if (!contenedor) {
    contenedor =
      document.createElement("div");

    contenedor.id =
      "toastContainer";

    contenedor.className =
      "toast-container";

    document.body.appendChild(
      contenedor
    );
  }

  const toast =
    document.createElement("div");

  toast.className =
    `toast toast-${tipo}`;

  toast.textContent = mensaje;

  contenedor.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  window.setTimeout(() => {
    toast.classList.remove("show");

    window.setTimeout(() => {
      toast.remove();
    }, 250);
  }, 3000);
}

/* ============================================================
   API GLOBAL DE LA APLICACIÓN
============================================================ */

window.AppCostosEquipos = {
  formatearMoneda,
  formatearNumero,
  convertirNumero,
  guardarLocalStorage,
  leerLocalStorage,
  eliminarLocalStorage,
  mostrarToast: mostrarToastGlobal
};