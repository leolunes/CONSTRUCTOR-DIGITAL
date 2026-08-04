"use strict";

/* ============================================================
   CATALOGO.JS
   Carga data/equipos-index.json, permite buscar y filtrar
   equipos, y envía el equipo seleccionado a Entradas.
============================================================ */

const RUTA_INDICE_EQUIPOS = "data/equipos-index.json";
const CLAVE_EQUIPO_CATALOGO = "costos_alquiler_equipo_catalogo";
const CLAVE_EQUIPO_ACTUAL = "costos_alquiler_equipo_actual";

let catalogoEquipos = [];
let catalogoFiltrado = [];

document.addEventListener("DOMContentLoaded", iniciarCatalogo);

async function iniciarCatalogo() {
  configurarInterfazGeneral();
  configurarEventos();

  try {
    catalogoEquipos = await cargarIndiceEquipos();

    if (!catalogoEquipos.length) {
      throw new Error("El archivo equipos-index.json no contiene equipos.");
    }

    catalogoFiltrado = [...catalogoEquipos];

    llenarFiltroFamilias(catalogoEquipos);
    renderizarCatalogo(catalogoFiltrado);
    ocultarError();
  } catch (error) {
    console.error(error);
    mostrarError(error);
    renderizarMensajeTabla("No fue posible cargar el catálogo.");
  }
}

function configurarInterfazGeneral() {
  const footerYear = document.getElementById("footerYear");

  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  const btnMenu = document.getElementById("btnMenu");
  const sidebar = document.getElementById("sidebar");

  if (btnMenu && sidebar) {
    btnMenu.addEventListener("click", () => {
      const abierto = sidebar.classList.toggle("open");
      btnMenu.setAttribute("aria-expanded", String(abierto));
    });
  }
}

function configurarEventos() {
  const buscador = document.getElementById("buscadorCatalogo");
  const filtroFamilia = document.getElementById("filtroFamilia");
  const tabla = document.getElementById("catalogoModelosBody");

  if (buscador) {
    buscador.addEventListener("input", aplicarFiltros);
  }

  if (filtroFamilia) {
    filtroFamilia.addEventListener("change", aplicarFiltros);
  }

  if (tabla) {
    tabla.addEventListener("click", manejarAccionCatalogo);
  }
}

async function cargarIndiceEquipos() {
  const respuesta = await fetch(RUTA_INDICE_EQUIPOS, {
    cache: "no-store"
  });

  if (!respuesta.ok) {
    throw new Error(
      `No se pudo abrir ${RUTA_INDICE_EQUIPOS}. Código HTTP: ${respuesta.status}.`
    );
  }

  const contenido = await respuesta.json();

  if (Array.isArray(contenido)) {
    return contenido.map(normalizarRegistroIndice);
  }

  if (Array.isArray(contenido.equipos)) {
    return contenido.equipos.map(normalizarRegistroIndice);
  }

  throw new Error(
    "El archivo equipos-index.json debe contener un arreglo de equipos."
  );
}

function normalizarRegistroIndice(equipo) {
  return {
    id: String(
      equipo.id ||
      equipo.slug ||
      equipo.carpeta ||
      equipo.codigoModelo ||
      equipo.codigo ||
      ""
    ).trim(),

    nombreEquipo:
      equipo.nombreEquipo ||
      equipo.nombre ||
      equipo.familia ||
      "Equipo sin nombre",

    codigoModelo:
      equipo.codigoModelo ||
      equipo.codigo ||
      equipo.codigoEquipo ||
      "",

    equipoReferencia:
      equipo.equipoReferencia ||
      equipo.referencia ||
      equipo.descripcion ||
      "",

    imagen:
      equipo.imagen ||
      equipo.foto ||
      "",

    ruta:
      equipo.ruta ||
      equipo.rutaDatos ||
      equipo.archivoDatos ||
      "",

    unidadAlquiler:
      equipo.unidadAlquiler ||
      equipo.unidad ||
      "",

    tarifaComercial: numero(
      equipo.tarifaComercial ??
      equipo.tarifa ??
      equipo.alquilerEquivalente
    ),

    familia:
      equipo.familia ||
      equipo.nombreEquipo ||
      equipo.nombre ||
      "Sin familia",

    marca:
      equipo.marca ||
      "",

    modelo:
      equipo.modelo ||
      "",

    rodaje:
      equipo.rodaje ||
      equipo.tipoRodaje ||
      "No especificado"
  };
}

function llenarFiltroFamilias(equipos) {
  const filtro = document.getElementById("filtroFamilia");

  if (!filtro) {
    return;
  }

  const familias = [...new Set(
    equipos
      .map((equipo) => equipo.familia)
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "es"));

  filtro.innerHTML = '<option value="">Todas las familias</option>';

  familias.forEach((familia) => {
    const opcion = document.createElement("option");
    opcion.value = familia;
    opcion.textContent = familia;
    filtro.appendChild(opcion);
  });
}

function aplicarFiltros() {
  const buscador = document.getElementById("buscadorCatalogo");
  const filtroFamilia = document.getElementById("filtroFamilia");

  const texto = normalizarTexto(buscador?.value || "");
  const familiaSeleccionada = filtroFamilia?.value || "";

  catalogoFiltrado = catalogoEquipos.filter((equipo) => {
    const coincideFamilia =
      !familiaSeleccionada ||
      equipo.familia === familiaSeleccionada;

    const contenidoBusqueda = normalizarTexto([
      equipo.id,
      equipo.nombreEquipo,
      equipo.codigoModelo,
      equipo.equipoReferencia,
      equipo.familia,
      equipo.marca,
      equipo.modelo,
      equipo.rodaje,
      equipo.unidadAlquiler
    ].join(" "));

    const coincideTexto =
      !texto ||
      contenidoBusqueda.includes(texto);

    return coincideFamilia && coincideTexto;
  });

  renderizarCatalogo(catalogoFiltrado);
}

function renderizarCatalogo(equipos) {
  const cuerpo = document.getElementById("catalogoModelosBody");

  if (!cuerpo) {
    return;
  }

  cuerpo.innerHTML = "";

  if (!equipos.length) {
    renderizarMensajeTabla("No se encontraron equipos con los filtros aplicados.");
    return;
  }

  equipos.forEach((equipo) => {
    const fila = document.createElement("tr");

    const marcaModelo = [
      equipo.marca,
      equipo.modelo
    ].filter(Boolean).join(" ");

    fila.innerHTML = `
      <td>
        <div class="catalog-image-cell">
          <img
            src="${escaparAtributo(equipo.imagen)}"
            alt="${escaparAtributo(equipo.nombreEquipo)}"
            loading="lazy"
            onerror="this.style.display='none'; this.nextElementSibling.hidden=false;"
          >
          <div class="catalog-image-fallback" hidden>Sin imagen</div>
        </div>
      </td>

      <td>
        <strong>${escaparHtml(equipo.codigoModelo || "—")}</strong>
      </td>

      <td>
        ${escaparHtml(equipo.familia || "—")}
      </td>

      <td>
        <strong>${escaparHtml(marcaModelo || equipo.nombreEquipo || "—")}</strong>
        <small style="display:block;margin-top:4px;">
          ${escaparHtml(equipo.equipoReferencia || "")}
        </small>
      </td>

      <td>
        ${escaparHtml(equipo.rodaje || "—")}
      </td>

      <td>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button
            type="button"
            class="button button-primary"
            data-accion="seleccionar"
            data-id="${escaparAtributo(equipo.id)}"
          >
            Seleccionar
          </button>

          <a
            class="button button-secondary"
            href="equipo.html?id=${encodeURIComponent(equipo.id)}"
          >
            Ver ficha
          </a>
        </div>
      </td>
    `;

    cuerpo.appendChild(fila);
  });
}

function renderizarMensajeTabla(mensaje) {
  const cuerpo = document.getElementById("catalogoModelosBody");

  if (!cuerpo) {
    return;
  }

  cuerpo.innerHTML = `
    <tr>
      <td colspan="6">${escaparHtml(mensaje)}</td>
    </tr>
  `;
}

function manejarAccionCatalogo(evento) {
  const boton = evento.target.closest('[data-accion="seleccionar"]');

  if (!boton) {
    return;
  }

  const idEquipo = boton.dataset.id;
  const equipo = catalogoEquipos.find(
    (item) => String(item.id) === String(idEquipo)
  );

  if (!equipo) {
    mostrarToast("No fue posible identificar el equipo.", "error");
    return;
  }

  seleccionarEquipo(equipo);
}

function seleccionarEquipo(equipo) {
  const seleccion = {
    id: equipo.id,
    slug: equipo.id,
    carpeta: equipo.id,
    codigo: equipo.codigoModelo,
    codigoModelo: equipo.codigoModelo,
    familia: equipo.familia,
    nombre: equipo.nombreEquipo,
    nombreEquipo: equipo.nombreEquipo,
    referencia: equipo.equipoReferencia,
    equipoReferencia: equipo.equipoReferencia,
    imagen: equipo.imagen,
    rutaDatos: equipo.ruta,
    ruta: equipo.ruta,
    unidadAlquiler: equipo.unidadAlquiler,
    tarifaComercial: equipo.tarifaComercial,
    marca: equipo.marca,
    modelo: equipo.modelo,
    rodaje: equipo.rodaje
  };

  localStorage.setItem(
    CLAVE_EQUIPO_CATALOGO,
    JSON.stringify(seleccion)
  );

  const equipoActual = obtenerEquipoActual();

  if (
    equipoActual &&
    String(equipoActual.id || equipoActual.carpeta) === String(equipo.id)
  ) {
    localStorage.setItem(
      CLAVE_EQUIPO_ACTUAL,
      JSON.stringify({
        ...equipoActual,
        ...seleccion
      })
    );
  } else {
    localStorage.removeItem(CLAVE_EQUIPO_ACTUAL);
  }

  mostrarToast(
    `${equipo.nombreEquipo} fue seleccionado.`,
    "success"
  );

  window.setTimeout(() => {
    window.location.href =
      `entradas.html?equipo=${encodeURIComponent(equipo.id)}`;
  }, 350);
}

function obtenerEquipoActual() {
  try {
    const contenido = localStorage.getItem(CLAVE_EQUIPO_ACTUAL);
    return contenido ? JSON.parse(contenido) : null;
  } catch {
    return null;
  }
}

function mostrarToast(mensaje, tipo = "success") {
  const contenedor = document.getElementById("toastContainer");

  if (!contenedor) {
    window.alert(mensaje);
    return;
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${tipo}`;
  toast.textContent = mensaje;

  contenedor.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add("show");
  }, 20);

  window.setTimeout(() => {
    toast.classList.remove("show");

    window.setTimeout(() => {
      toast.remove();
    }, 250);
  }, 3000);
}

function mostrarError(error) {
  const panel = document.getElementById("panelCatalogoError");
  const mensaje = document.getElementById("mensajeCatalogoError");

  if (panel) {
    panel.hidden = false;
  }

  if (mensaje) {
    mensaje.textContent =
      error instanceof Error ? error.message : String(error);
  }
}

function ocultarError() {
  const panel = document.getElementById("panelCatalogoError");

  if (panel) {
    panel.hidden = true;
  }
}

function normalizarTexto(texto) {
  return String(texto)
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function escaparHtml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escaparAtributo(valor) {
  return escaparHtml(valor);
}

function numero(valor) {
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : 0;
  }

  const texto = String(valor ?? "")
    .trim()
    .replace(/\s/g, "")
    .replace(/\$/g, "");

  if (!texto) {
    return 0;
  }

  if (texto.includes(",") && texto.includes(".")) {
    const resultado = Number(
      texto.replace(/\./g, "").replace(",", ".")
    );

    return Number.isFinite(resultado) ? resultado : 0;
  }

  if (texto.includes(",")) {
    const resultado = Number(texto.replace(",", "."));
    return Number.isFinite(resultado) ? resultado : 0;
  }

  const resultado = Number(texto);
  return Number.isFinite(resultado) ? resultado : 0;
}