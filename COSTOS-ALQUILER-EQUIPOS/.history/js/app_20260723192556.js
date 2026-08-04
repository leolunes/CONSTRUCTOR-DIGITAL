"use strict";

/* ============================================================
   APP.JS
   Funciones generales de la aplicación:
   - Menú lateral
   - Año del pie de página
   - Navegación activa
   - Registro del Service Worker
   - Utilidades globales
============================================================ */

document.addEventListener("DOMContentLoaded", iniciarAplicacion);

function iniciarAplicacion() {
  actualizarAnio();
  configurarMenuLateral();
  marcarPaginaActiva();
  configurarEnlacesInternos();
  registrarServiceWorker();
}

/* ============================================================
   AÑO DEL PIE DE PÁGINA
============================================================ */

function actualizarAnio() {
  const elementos = document.querySelectorAll(
    "#footerYear, [data-current-year]"
  );

  elementos.forEach((elemento) => {
    elemento.textContent = new Date().getFullYear();
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

  botonMenu.setAttribute("aria-expanded", "false");

  botonMenu.addEventListener("click", () => {
    const abierto = sidebar.classList.toggle("open");

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
      window.matchMedia("(max-width: 900px)").matches;

    if (!pantallaMovil) {
      return;
    }

    const clicDentroSidebar =
      sidebar.contains(evento.target);

    const clicBoton =
      botonMenu.contains(evento.target);

    if (!clicDentroSidebar && !clicBoton) {
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
    document.body.classList.remove("sidebar-open");
    botonMenu.setAttribute("aria-expanded", "false");
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
      .toLowerCase() || "index.html";

  const enlaces = document.querySelectorAll(
    "a[href]"
  );

  enlaces.forEach((enlace) => {
    const href = enlace
      .getAttribute("href")
      ?.split("?")[0]
      ?.split("#")[0]
      ?.toLowerCase();

    if (!href) {
      return;
    }

    const archivoEnlace =
      href.split("/").pop();

    if (archivoEnlace === paginaActual) {
      enlace.classList.add("active");
      enlace.setAttribute("aria-current", "page");
    }
  });
}

/* ============================================================
   ENLACES INTERNOS
============================================================ */

function configurarEnlacesInternos() {
  document.addEventListener("click", (evento) => {
    const enlace = evento.target.closest(
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
      document.querySelector(destinoId);

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
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", async () => {
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
  });
}

/* ============================================================
   UTILIDADES GLOBALES
============================================================ */

function formatearMoneda(valor) {
  const numero = convertirNumero(valor);

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(numero);
}

function formatearNumero(valor, decimales = 0) {
  const numero = convertirNumero(valor);

  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales
  }).format(numero);
}

function convertirNumero(valor) {
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : 0;
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

function guardarLocalStorage(clave, valor) {
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

function leerLocalStorage(clave, valorPredeterminado = null) {
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
    document.getElementById("toastContainer");

  if (!contenedor) {
    contenedor =
      document.createElement("div");

    contenedor.id = "toastContainer";
    contenedor.className = "toast-container";

    document.body.appendChild(contenedor);
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