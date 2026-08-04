"use strict";

/* ============================================================
   CATÁLOGO Y BUSCADOR DE EQUIPOS
   Archivo: js/buscador.js
   ============================================================ */

const BuscadorEquiposApp = (() => {

  const ESTADO = {
    equipos: [],
    filtrados: [],
    textoBusqueda: "",
    familiaSeleccionada: "",
    ordenSeleccionado: "nombre-asc"
  };

  const DOM = {};

  document.addEventListener("DOMContentLoaded", iniciar);

  async function iniciar() {
    capturarElementos();
    configurarEventos();
    actualizarAnio();
    enfocarBuscadorSiCorresponde();

    try {
      actualizarEstadoLateral(
        "Cargando",
        "Consultando el catálogo de equipos"
      );

      ESTADO.equipos = await cargarIndiceEquipos();
      normalizarEquipos();
      cargarFamilias();
      aplicarFiltros();

      actualizarEstadoLateral(
        "Disponible",
        "Catálogo cargado correctamente",
        true
      );

    } catch (error) {
      console.error(error);
      mostrarError(error);

      actualizarEstadoLateral(
        "Error",
        "No fue posible cargar el catálogo",
        false
      );
    }
  }

  /* ============================================================
     INICIALIZACIÓN
     ============================================================ */

  function capturarElementos() {
    DOM.sidebar = document.getElementById("sidebar");
    DOM.btnMenu = document.getElementById("btnMenu");

    DOM.inputBuscar = document.getElementById("inputBuscarEquipo");
    DOM.btnLimpiar = document.getElementById("btnLimpiarBusqueda");
    DOM.selectFamilia = document.getElementById("selectFamilia");
    DOM.selectOrden = document.getElementById("selectOrden");
    DOM.btnRestablecer = document.getElementById("btnRestablecerFiltros");

    DOM.listaEquipos = document.getElementById("listaEquipos");
    DOM.estadoCarga = document.getElementById("estadoCarga");
    DOM.estadoSinResultados = document.getElementById("estadoSinResultados");
    DOM.estadoError = document.getElementById("estadoError");
    DOM.descripcionError = document.getElementById("descripcionError");

    DOM.totalEquipos = document.getElementById("totalEquipos");
    DOM.totalFamilias = document.getElementById("totalFamilias");
    DOM.tituloResultados = document.getElementById("tituloResultados");
    DOM.cantidadResultados = document.getElementById("cantidadResultados");

    DOM.statusDot = document.getElementById("statusDot");
    DOM.statusTitle = document.getElementById("statusTitle");
    DOM.statusDescription = document.getElementById("statusDescription");
    DOM.footerYear = document.getElementById("footerYear");
  }

  function configurarEventos() {
    if (DOM.btnMenu && DOM.sidebar) {
      DOM.btnMenu.addEventListener("click", () => {
        const abierto = DOM.sidebar.classList.toggle("open");
        DOM.btnMenu.setAttribute("aria-expanded", String(abierto));
      });
    }

    if (DOM.inputBuscar) {
      DOM.inputBuscar.addEventListener(
        "input",
        aplicarBusquedaConEspera
      );
    }

    if (DOM.btnLimpiar) {
      DOM.btnLimpiar.addEventListener("click", () => {
        if (!DOM.inputBuscar) {
          return;
        }

        DOM.inputBuscar.value = "";
        ESTADO.textoBusqueda = "";
        aplicarFiltros();
        DOM.inputBuscar.focus();
      });
    }

    if (DOM.selectFamilia) {
      DOM.selectFamilia.addEventListener("change", () => {
        ESTADO.familiaSeleccionada = DOM.selectFamilia.value;
        aplicarFiltros();
      });
    }

    if (DOM.selectOrden) {
      DOM.selectOrden.addEventListener("change", () => {
        ESTADO.ordenSeleccionado = DOM.selectOrden.value;
        aplicarFiltros();
      });
    }

    if (DOM.btnRestablecer) {
      DOM.btnRestablecer.addEventListener(
        "click",
        restablecerFiltros
      );
    }
  }

  function enfocarBuscadorSiCorresponde() {
    const parametros = new URLSearchParams(window.location.search);

    if (
      parametros.get("accion") === "buscar" &&
      DOM.inputBuscar
    ) {
      setTimeout(() => DOM.inputBuscar.focus(), 100);
    }
  }

  /* ============================================================
     CARGA Y NORMALIZACIÓN DEL ÍNDICE
     ============================================================ */

  async function cargarIndiceEquipos() {
    const respuesta = await fetch("data/equipos-index.json", {
      cache: "no-store"
    });

    if (!respuesta.ok) {
      throw new Error(
        `No fue posible abrir data/equipos-index.json. Código ${respuesta.status}.`
      );
    }

    const contenido = await respuesta.json();

    if (Array.isArray(contenido)) {
      return contenido;
    }

    if (Array.isArray(contenido.equipos)) {
      return contenido.equipos;
    }

    if (Array.isArray(contenido.items)) {
      return contenido.items;
    }

    throw new Error(
      "equipos-index.json debe contener un arreglo o una propiedad equipos."
    );
  }

  function normalizarEquipos() {
    ESTADO.equipos = ESTADO.equipos
      .map(normalizarEquipo)
      .filter((equipo) => equipo.id);
  }

  function normalizarEquipo(registro, indice) {
    const id = primerValor(
      registro.id,
      registro.slug,
      registro.carpeta,
      registro.codigo,
      registro.modelo,
      `equipo-${indice + 1}`
    );

    const nombre = primerValor(
      registro.nombre,
      registro.titulo,
      registro.equipo,
      registro.modelo,
      humanizarTexto(id)
    );

    const codigo = primerValor(
      registro.codigo,
      registro.modelo,
      registro.id,
      id
    );

    const familia = primerValor(
      registro.familia,
      "Sin clasificar"
    );

    const referencia = primerValor(
      registro.equipoReferencia,
      registro.equipoDeReferencia,
      registro.referencia,
      registro.descripcion,
      ""
    );

    const imagen = primerValor(
      registro.imagen,
      registro.rutaImagen,
      `data/equipos/${registro.carpeta || registro.slug || id}/imagen.jpg`
    );

    const tarifa = numero(
      primerValor(
        registro.tarifaComercial,
        registro.tarifa,
        registro.alquiler,
        registro.precioHora,
        registro.costoComercial,
        0
      )
    );

    const rendimiento = numero(
      primerValor(
        registro.rendimiento,
        registro.rendimientoReferencial,
        registro.produccion,
        0
      )
    );

    const unidadRendimiento = primerValor(
      registro.unidadRendimiento,
      registro.unidadProduccion,
      ""
    );

    const estado = primerValor(
      registro.estado,
      "ACTIVO"
    );

    return {
      original: registro,
      id: String(id).trim(),
      nombre: String(nombre).trim(),
      codigo: String(codigo).trim(),
      familia: String(familia).trim(),
      referencia: String(referencia).trim(),
      imagen: String(imagen).trim(),
      tarifa,
      rendimiento,
      unidadRendimiento: String(unidadRendimiento).trim(),
      estado: String(estado).trim(),
      busqueda: normalizarTexto([
        id,
        nombre,
        codigo,
        familia,
        referencia,
        registro.marca,
        registro.rodaje,
        registro.combustible
      ].filter(Boolean).join(" "))
    };
  }

  /* ============================================================
     FILTROS
     ============================================================ */

  function cargarFamilias() {
    if (!DOM.selectFamilia) {
      return;
    }

    const familias = [...new Set(
      ESTADO.equipos
        .map((equipo) => equipo.familia)
        .filter(Boolean)
    )].sort(compararTexto);

    const opciones = familias.map((familia) => `
      <option value="${escaparAtributo(familia)}">
        ${escaparHtml(familia)}
      </option>
    `).join("");

    DOM.selectFamilia.innerHTML = `
      <option value="">
        Todas las familias
      </option>
      ${opciones}
    `;

    establecerTexto("totalFamilias", familias.length);
  }

  const aplicarBusquedaConEspera = debounce(() => {
    ESTADO.textoBusqueda = DOM.inputBuscar
      ? DOM.inputBuscar.value
      : "";

    aplicarFiltros();
  }, 180);

  function aplicarFiltros() {
    ocultarEstadoCarga();
    ocultarError();

    const termino = normalizarTexto(ESTADO.textoBusqueda);
    const familia = normalizarTexto(
      ESTADO.familiaSeleccionada
    );

    ESTADO.filtrados = ESTADO.equipos.filter((equipo) => {
      const coincideTexto =
        !termino ||
        equipo.busqueda.includes(termino) ||
        buscarPorPalabras(equipo.busqueda, termino);

      const coincideFamilia =
        !familia ||
        normalizarTexto(equipo.familia) === familia;

      return coincideTexto && coincideFamilia;
    });

    ordenarEquipos();
    renderizarEquipos();
    actualizarResumen();
  }

  function buscarPorPalabras(texto, consulta) {
    const palabras = consulta
      .split("-")
      .filter((palabra) => palabra.length >= 2);

    return palabras.every((palabra) => texto.includes(palabra));
  }

  function ordenarEquipos() {
    const orden = ESTADO.ordenSeleccionado;

    ESTADO.filtrados.sort((a, b) => {
      switch (orden) {
        case "nombre-desc":
          return compararTexto(b.nombre, a.nombre);

        case "tarifa-asc":
          return (
            compararNumero(a.tarifa, b.tarifa) ||
            compararTexto(a.nombre, b.nombre)
          );

        case "tarifa-desc":
          return (
            compararNumero(b.tarifa, a.tarifa) ||
            compararTexto(a.nombre, b.nombre)
          );

        case "nombre-asc":
        default:
          return compararTexto(a.nombre, b.nombre);
      }
    });
  }

  function restablecerFiltros() {
    ESTADO.textoBusqueda = "";
    ESTADO.familiaSeleccionada = "";
    ESTADO.ordenSeleccionado = "nombre-asc";

    if (DOM.inputBuscar) {
      DOM.inputBuscar.value = "";
    }

    if (DOM.selectFamilia) {
      DOM.selectFamilia.value = "";
    }

    if (DOM.selectOrden) {
      DOM.selectOrden.value = "nombre-asc";
    }

    aplicarFiltros();

    if (DOM.inputBuscar) {
      DOM.inputBuscar.focus();
    }
  }

  /* ============================================================
     RENDERIZADO
     ============================================================ */

  function renderizarEquipos() {
    if (!DOM.listaEquipos) {
      return;
    }

    if (!ESTADO.filtrados.length) {
      DOM.listaEquipos.innerHTML = "";
      mostrarSinResultados();
      return;
    }

    ocultarSinResultados();

    DOM.listaEquipos.innerHTML = ESTADO.filtrados
      .map(crearTarjetaEquipo)
      .join("");

    configurarErroresImagen();
    configurarAccesoTarjetas();
  }

  function crearTarjetaEquipo(equipo) {
    const urlFicha = `equipo.html?id=${encodeURIComponent(equipo.id)}`;

    const tarifa = equipo.tarifa > 0
      ? moneda(equipo.tarifa)
      : "Por definir";

    const rendimiento = equipo.rendimiento > 0
      ? `${decimal(equipo.rendimiento, 2)} ${escaparHtml(equipo.unidadRendimiento)}`
      : "Por definir";

    return `
      <article
        class="catalog-card"
        tabindex="0"
        role="link"
        data-url="${escaparAtributo(urlFicha)}"
        aria-label="Abrir ficha de ${escaparAtributo(equipo.nombre)}"
      >

        <div class="catalog-card-image">

          <img
            src="${escaparAtributo(equipo.imagen)}"
            alt="Imagen de ${escaparAtributo(equipo.nombre)}"
            loading="lazy"
          >

          <div class="catalog-card-image-fallback" hidden>
            🚜
          </div>

          <span class="catalog-card-status">
            ${escaparHtml(equipo.estado)}
          </span>

        </div>

        <div class="catalog-card-body">

          <div class="catalog-card-meta">

            <span class="catalog-card-code">
              ${escaparHtml(equipo.codigo)}
            </span>

            <span class="catalog-card-family">
              ${escaparHtml(equipo.familia)}
            </span>

          </div>

          <h3>
            ${escaparHtml(equipo.nombre)}
          </h3>

          <p>
            ${escaparHtml(
              equipo.referencia ||
              "Consulte la información técnica y económica del equipo."
            )}
          </p>

          <div class="catalog-card-values">

            <div>

              <span>
                Tarifa comercial
              </span>

              <strong>
                ${tarifa}
              </strong>

            </div>

            <div>

              <span>
                Rendimiento
              </span>

              <strong>
                ${rendimiento}
              </strong>

            </div>

          </div>

        </div>

        <div class="catalog-card-footer">

          <span>
            Ver ficha completa
          </span>

          <span aria-hidden="true">
            →
          </span>

        </div>

      </article>
    `;
  }

  function configurarErroresImagen() {
    document
      .querySelectorAll(".catalog-card-image img")
      .forEach((imagen) => {
        imagen.addEventListener("error", () => {
          const fallback = imagen.nextElementSibling;
          imagen.hidden = true;

          if (fallback) {
            fallback.hidden = false;
          }
        }, { once: true });
      });
  }

  function configurarAccesoTarjetas() {
    document.querySelectorAll(".catalog-card").forEach((tarjeta) => {
      tarjeta.addEventListener("click", () => {
        abrirFicha(tarjeta.dataset.url);
      });

      tarjeta.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter" || evento.key === " ") {
          evento.preventDefault();
          abrirFicha(tarjeta.dataset.url);
        }
      });
    });
  }

  function abrirFicha(url) {
    if (url) {
      window.location.href = url;
    }
  }

  function actualizarResumen() {
    establecerTexto("totalEquipos", ESTADO.equipos.length);

    const cantidad = ESTADO.filtrados.length;
    const palabra = cantidad === 1 ? "equipo" : "equipos";

    establecerTexto(
      "cantidadResultados",
      `${cantidad} ${palabra}`
    );

    const tieneBusqueda = Boolean(
      ESTADO.textoBusqueda.trim()
    );

    const tieneFamilia = Boolean(
      ESTADO.familiaSeleccionada
    );

    let titulo = "Todos los equipos";

    if (tieneBusqueda && tieneFamilia) {
      titulo = `Resultados en ${ESTADO.familiaSeleccionada}`;
    } else if (tieneFamilia) {
      titulo = ESTADO.familiaSeleccionada;
    } else if (tieneBusqueda) {
      titulo = "Resultados de búsqueda";
    }

    establecerTexto("tituloResultados", titulo);
  }

  /* ============================================================
     ESTADOS DE INTERFAZ
     ============================================================ */

  function ocultarEstadoCarga() {
    if (DOM.estadoCarga) {
      DOM.estadoCarga.hidden = true;
    }
  }

  function mostrarSinResultados() {
    if (DOM.estadoSinResultados) {
      DOM.estadoSinResultados.hidden = false;
    }
  }

  function ocultarSinResultados() {
    if (DOM.estadoSinResultados) {
      DOM.estadoSinResultados.hidden = true;
    }
  }

  function mostrarError(error) {
    ocultarEstadoCarga();
    ocultarSinResultados();

    if (DOM.listaEquipos) {
      DOM.listaEquipos.innerHTML = "";
    }

    if (DOM.estadoError) {
      DOM.estadoError.hidden = false;
    }

    if (DOM.descripcionError) {
      DOM.descripcionError.textContent =
        error?.message ||
        "Se presentó un error inesperado.";
    }
  }

  function ocultarError() {
    if (DOM.estadoError) {
      DOM.estadoError.hidden = true;
    }
  }

  function actualizarEstadoLateral(
    titulo,
    descripcion,
    correcto = null
  ) {
    if (DOM.statusTitle) {
      DOM.statusTitle.textContent = titulo;
    }

    if (DOM.statusDescription) {
      DOM.statusDescription.textContent = descripcion;
    }

    if (!DOM.statusDot) {
      return;
    }

    DOM.statusDot.classList.remove("success", "error");

    if (correcto === true) {
      DOM.statusDot.classList.add("success");
    }

    if (correcto === false) {
      DOM.statusDot.classList.add("error");
    }
  }

  /* ============================================================
     UTILIDADES
     ============================================================ */

  function actualizarAnio() {
    if (DOM.footerYear) {
      DOM.footerYear.textContent =
        `© ${new Date().getFullYear()}`;
    }
  }

  function establecerTexto(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
      elemento.textContent = valor ?? "";
    }
  }

  function primerValor(...valores) {
    return valores.find(
      (valor) =>
        valor !== undefined &&
        valor !== null &&
        valor !== ""
    );
  }

  function numero(valor) {
    if (typeof valor === "number" && Number.isFinite(valor)) {
      return valor;
    }

    if (typeof valor !== "string") {
      return 0;
    }

    let limpio = valor
      .trim()
      .replace(/\s/g, "")
      .replace(/[^\d,.-]/g, "");

    if (limpio.includes(",") && limpio.includes(".")) {
      limpio = limpio.lastIndexOf(",") > limpio.lastIndexOf(".")
        ? limpio.replace(/\./g, "").replace(",", ".")
        : limpio.replace(/,/g, "");
    } else if (limpio.includes(",")) {
      const partes = limpio.split(",");
      limpio = partes.at(-1).length <= 3
        ? limpio.replace(",", ".")
        : limpio.replace(/,/g, "");
    }

    const resultado = Number(limpio);

    return Number.isFinite(resultado)
      ? resultado
      : 0;
  }

  function moneda(valor) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(numero(valor));
  }

  function decimal(valor, decimales = 2) {
    return new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimales
    }).format(numero(valor));
  }

  function compararTexto(a, b) {
    return String(a ?? "").localeCompare(
      String(b ?? ""),
      "es",
      {
        sensitivity: "base",
        numeric: true
      }
    );
  }

  function compararNumero(a, b) {
    return numero(a) - numero(b);
  }

  function normalizarTexto(valor) {
    return String(valor ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function humanizarTexto(valor) {
    return String(valor ?? "")
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (letra) => letra.toUpperCase());
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

  function debounce(funcion, espera = 200) {
    let temporizador;

    return (...argumentos) => {
      clearTimeout(temporizador);

      temporizador = setTimeout(
        () => funcion(...argumentos),
        espera
      );
    };
  }

  return {
    iniciar,
    restablecerFiltros
  };

})();