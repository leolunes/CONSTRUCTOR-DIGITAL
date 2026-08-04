"use strict";

/* ============================================================
   ENTRADAS.JS
   Carga el catálogo, permite seleccionar un equipo,
   completa la hoja Entradas y guarda los cambios.
============================================================ */

const RUTA_INDICE_EQUIPOS = "data/equipos-index.json";
const CLAVE_EQUIPO_ACTUAL = "costos_alquiler_equipo_actual";
const CLAVE_ENTRADAS = "costos_alquiler_entradas";

const CAMPOS_ENTRADA = [
  "precioAdquisicion",
  "valorRescate",
  "vidaUtilHoras",
  "horasAnio",
  "tasaInteres",
  "seguroAnual",
  "mantenimientoFijoAnual",
  "consumoCombustible",
  "precioCombustible",
  "factorLubricantes",
  "costoRodaje",
  "vidaRodajeHoras",
  "operadorMes",
  "horasOperadorMes",
  "margenAlquiler",
  "rendimiento",
  "unidadRendimiento",
  "movilizacion",
  "desmovilizacion",
  "horasAmortizacion"
];

let equiposDisponibles = [];
let equipoSeleccionado = null;
let datosOriginalesEquipo = null;

document.addEventListener("DOMContentLoaded", iniciarEntradas);

async function iniciarEntradas() {
  configurarInterfazGeneral();
  configurarEventos();

  try {
    equiposDisponibles = await cargarIndiceEquipos();

    if (!equiposDisponibles.length) {
      throw new Error("El archivo equipos-index.json no contiene equipos disponibles.");
    }

    llenarSelectorEquipos(equiposDisponibles);

    const equipoGuardado = obtenerEquipoGuardado();
    const idInicial =
      equipoGuardado?.id ||
      equipoGuardado?.slug ||
      equiposDisponibles[0].id ||
      equiposDisponibles[0].slug ||
      equiposDisponibles[0].carpeta;

    await seleccionarEquipo(idInicial);
    actualizarEstado("Base disponible", `${equiposDisponibles.length} equipo(s) cargado(s)`, true);
  } catch (error) {
    mostrarError(error);
    actualizarEstado("Error de carga", "Revise la base de equipos", false);
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
  const selectEquipo = document.getElementById("selectEquipo");
  const btnGuardar = document.getElementById("btnGuardarEntradas");
  const btnRestablecer = document.getElementById("btnRestablecer");
  const unidadRendimiento = document.getElementById("unidadRendimiento");

  if (selectEquipo) {
    selectEquipo.addEventListener("change", async (event) => {
      const idEquipo = event.target.value;

      if (!idEquipo) {
        return;
      }

      await seleccionarEquipo(idEquipo);
    });
  }

  if (btnGuardar) {
    btnGuardar.addEventListener("click", guardarEntradas);
  }

  if (btnRestablecer) {
    btnRestablecer.addEventListener("click", restablecerEntradas);
  }

  if (unidadRendimiento) {
    unidadRendimiento.addEventListener("input", actualizarUnidadRendimiento);
  }

  CAMPOS_ENTRADA.forEach((idCampo) => {
    const campo = document.getElementById(idCampo);

    if (!campo) {
      return;
    }

    campo.addEventListener("input", () => {
      campo.classList.remove("input-error");
    });
  });
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
    return contenido;
  }

  if (Array.isArray(contenido.equipos)) {
    return contenido.equipos;
  }

  if (Array.isArray(contenido.modelos)) {
    return contenido.modelos;
  }

  throw new Error(
    "El archivo equipos-index.json debe contener un arreglo o una propiedad llamada equipos."
  );
}

function llenarSelectorEquipos(equipos) {
  const selectEquipo = document.getElementById("selectEquipo");

  if (!selectEquipo) {
    return;
  }

  selectEquipo.innerHTML = "";

  equipos.forEach((equipo, indice) => {
    const option = document.createElement("option");
    const idEquipo = obtenerIdEquipo(equipo, indice);

    option.value = idEquipo;
    option.textContent = construirNombreEquipo(equipo);

    selectEquipo.appendChild(option);
  });
}

async function seleccionarEquipo(idEquipo) {
  const equipoIndice = buscarEquipoEnIndice(idEquipo);

  if (!equipoIndice) {
    throw new Error(`No se encontró el equipo "${idEquipo}" en el índice.`);
  }

  actualizarEstado("Cargando equipo", construirNombreEquipo(equipoIndice), true);

  const datosEquipo = await cargarDatosEquipo(equipoIndice);

  equipoSeleccionado = normalizarEquipo(equipoIndice, datosEquipo);
  datosOriginalesEquipo = copiarObjeto(equipoSeleccionado);

  const entradasGuardadas = obtenerEntradasGuardadas(equipoSeleccionado.id);

  if (entradasGuardadas) {
    equipoSeleccionado.entradas = {
      ...equipoSeleccionado.entradas,
      ...entradasGuardadas
    };
  }

  mostrarEquipo(equipoSeleccionado);
  guardarEquipoActual(equipoSeleccionado);

  const selectEquipo = document.getElementById("selectEquipo");

  if (selectEquipo) {
    selectEquipo.value = equipoSeleccionado.id;
  }

  actualizarEstado("Equipo seleccionado", equipoSeleccionado.codigo || equipoSeleccionado.nombre, true);
  ocultarError();
}

async function cargarDatosEquipo(equipoIndice) {
  if (equipoIndice.datos && typeof equipoIndice.datos === "object") {
    return equipoIndice.datos;
  }

  const carpeta =
    equipoIndice.carpeta ||
    equipoIndice.slug ||
    equipoIndice.id ||
    "plantilla";

  const rutaScript =
    equipoIndice.rutaDatos ||
    equipoIndice.archivoDatos ||
    `data/equipos/${carpeta}/datos.js`;

  const datosPrevios = capturarPosiblesVariablesGlobales();

  await cargarScriptDinamico(rutaScript);

  const datosNuevos = detectarDatosGlobales(datosPrevios);

  if (!datosNuevos) {
    throw new Error(
      `Se cargó ${rutaScript}, pero no se encontró un objeto de datos del equipo.`
    );
  }

  return datosNuevos;
}

function cargarScriptDinamico(ruta) {
  return new Promise((resolve, reject) => {
    const scriptAnterior = document.querySelector('script[data-equipo-dinamico="true"]');

    if (scriptAnterior) {
      scriptAnterior.remove();
    }

    const script = document.createElement("script");

    script.src = `${ruta}?v=${Date.now()}`;
    script.async = true;
    script.dataset.equipoDinamico = "true";

    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(`No fue posible cargar el archivo ${ruta}.`));

    document.body.appendChild(script);
  });
}

function capturarPosiblesVariablesGlobales() {
  return {
    EQUIPO: window.EQUIPO,
    equipo: window.equipo,
    DATOS_EQUIPO: window.DATOS_EQUIPO,
    datosEquipo: window.datosEquipo,
    equipoActual: window.equipoActual
  };
}

function detectarDatosGlobales(datosPrevios) {
  const candidatos = [
    window.EQUIPO,
    window.equipo,
    window.DATOS_EQUIPO,
    window.datosEquipo,
    window.equipoActual
  ];

  for (const candidato of candidatos) {
    if (candidato && typeof candidato === "object") {
      return candidato;
    }
  }

  for (const nombre of Object.keys(datosPrevios)) {
    const valorActual = window[nombre];

    if (
      valorActual &&
      valorActual !== datosPrevios[nombre] &&
      typeof valorActual === "object"
    ) {
      return valorActual;
    }
  }

  return null;
}

function normalizarEquipo(indice, datos) {
  const fuente = {
    ...indice,
    ...datos
  };

  const entradasFuente =
    fuente.entradas ||
    fuente.parametros ||
    fuente.datosEntrada ||
    fuente.costos ||
    {};

  const id = obtenerIdEquipo(fuente);

  return {
    id,
    carpeta: fuente.carpeta || fuente.slug || id,
    codigo: obtenerPrimerValor(
      fuente.codigo,
      fuente.codigoEquipo,
      fuente.idModelo,
      fuente.referencia,
      id
    ),
    familia: obtenerPrimerValor(
      fuente.familia,
      fuente.tipo,
      fuente.categoria,
      "Sin familia"
    ),
    marca: obtenerPrimerValor(fuente.marca, ""),
    modelo: obtenerPrimerValor(
      fuente.modelo,
      fuente.referencia,
      fuente.nombreModelo,
      ""
    ),
    nombre: obtenerPrimerValor(
      fuente.nombre,
      fuente.equipo,
      fuente.descripcion,
      construirNombreEquipo(fuente)
    ),
    referencia: obtenerPrimerValor(
      fuente.referencia,
      [fuente.marca, fuente.modelo].filter(Boolean).join(" "),
      fuente.codigo,
      ""
    ),
    rodaje: obtenerPrimerValor(
      fuente.rodaje,
      fuente.tipoRodaje,
      "No especificado"
    ),
    combustible: obtenerPrimerValor(
      fuente.combustible,
      fuente.tipoCombustible,
      "ACPM"
    ),
    unidadAlquiler: obtenerPrimerValor(
      fuente.unidadAlquiler,
      fuente.unidad,
      "hora"
    ),
    imagen: resolverRutaImagen(fuente),
    entradas: {
      precioAdquisicion: numero(
        obtenerDato(entradasFuente, fuente, [
          "precioAdquisicion",
          "valorAdquisicion",
          "precioCompra",
          "valorEquipo"
        ])
      ),
      valorRescate: porcentajeVisible(
        obtenerDato(entradasFuente, fuente, [
          "valorRescate",
          "porcentajeRescate",
          "rescate"
        ])
      ),
      vidaUtilHoras: numero(
        obtenerDato(entradasFuente, fuente, [
          "vidaUtilHoras",
          "vidaUtil",
          "horasVidaUtil"
        ])
      ),
      horasAnio: numero(
        obtenerDato(entradasFuente, fuente, [
          "horasAnio",
          "horasTrabajoAnio",
          "horasPorAnio"
        ])
      ),
      tasaInteres: porcentajeVisible(
        obtenerDato(entradasFuente, fuente, [
          "tasaInteres",
          "interesAnual",
          "tasaInversion"
        ])
      ),
      seguroAnual: porcentajeVisible(
        obtenerDato(entradasFuente, fuente, [
          "seguroAnual",
          "tasaSeguro",
          "porcentajeSeguro"
        ])
      ),
      mantenimientoFijoAnual: numero(
        obtenerDato(entradasFuente, fuente, [
          "mantenimientoFijoAnual",
          "mantenimientoAnual",
          "costoFijoMantenimiento"
        ])
      ),
      consumoCombustible: numero(
        obtenerDato(entradasFuente, fuente, [
          "consumoCombustible",
          "consumoLitrosHora",
          "consumo",
          "litrosHora"
        ])
      ),
      precioCombustible: numero(
        obtenerDato(entradasFuente, fuente, [
          "precioCombustible",
          "precioAcpm",
          "precioDiesel"
        ])
      ),
      factorLubricantes: numero(
        obtenerDato(entradasFuente, fuente, [
          "factorLubricantes",
          "porcentajeLubricantes",
          "lubricantesFactor"
        ])
      ),
      costoRodaje: numero(
        obtenerDato(entradasFuente, fuente, [
          "costoRodaje",
          "valorRodaje",
          "costoLlantas"
        ])
      ),
      vidaRodajeHoras: numero(
        obtenerDato(entradasFuente, fuente, [
          "vidaRodajeHoras",
          "vidaRodaje",
          "vidaLlantasHoras"
        ])
      ),
      operadorMes: numero(
        obtenerDato(entradasFuente, fuente, [
          "operadorMes",
          "costoOperadorMensual",
          "salarioOperador"
        ])
      ),
      horasOperadorMes: numero(
        obtenerDato(entradasFuente, fuente, [
          "horasOperadorMes",
          "horasMes",
          "horasMensuales"
        ])
      ),
      margenAlquiler: porcentajeVisible(
        obtenerDato(entradasFuente, fuente, [
          "margenAlquiler",
          "margenUtilidad",
          "utilidad"
        ])
      ),
      rendimiento: numero(
        obtenerDato(entradasFuente, fuente, [
          "rendimiento",
          "rendimientoHora",
          "produccionHora"
        ])
      ),
      unidadRendimiento: obtenerPrimerValor(
        obtenerDato(entradasFuente, fuente, [
          "unidadRendimiento",
          "unidadProduccion"
        ]),
        "unidad/h"
      ),
      movilizacion: numero(
        obtenerDato(entradasFuente, fuente, [
          "movilizacion",
          "costoMovilizacion"
        ])
      ),
      desmovilizacion: numero(
        obtenerDato(entradasFuente, fuente, [
          "desmovilizacion",
          "costoDesmovilizacion"
        ])
      ),
      horasAmortizacion: numero(
        obtenerDato(entradasFuente, fuente, [
          "horasAmortizacion",
          "horasContrato",
          "horasEstimadas"
        ])
      )
    }
  };
}

function mostrarEquipo(equipo) {
  asignarTexto("campoCodigo", equipo.codigo);
  asignarTexto("campoFamilia", equipo.familia);
  asignarTexto("datoNombre", equipo.nombre);
  asignarTexto("datoReferencia", equipo.referencia || equipo.codigo);
  asignarTexto("datoRodaje", `Rodaje: ${equipo.rodaje}`);
  asignarTexto("datoCombustible", `Combustible: ${equipo.combustible}`);
  asignarTexto("datoUnidadAlquiler", `Unidad: ${equipo.unidadAlquiler}`);

  CAMPOS_ENTRADA.forEach((idCampo) => {
    const campo = document.getElementById(idCampo);

    if (!campo) {
      return;
    }

    const valor = equipo.entradas[idCampo];

    campo.value = valor ?? "";
  });

  mostrarImagenEquipo(equipo.imagen, equipo.nombre);
  actualizarUnidadRendimiento();
}

function mostrarImagenEquipo(rutaImagen, nombreEquipo) {
  const imagen = document.getElementById("imagenEquipo");
  const fallback = document.getElementById("imagenFallback");

  if (!imagen || !fallback) {
    return;
  }

  imagen.hidden = true;
  fallback.hidden = false;

  if (!rutaImagen) {
    return;
  }

  imagen.onload = () => {
    imagen.hidden = false;
    fallback.hidden = true;
  };

  imagen.onerror = () => {
    imagen.hidden = true;
    fallback.hidden = false;
  };

  imagen.alt = `Imagen de ${nombreEquipo}`;
  imagen.src = `${rutaImagen}?v=${Date.now()}`;
}

function guardarEntradas() {
  if (!equipoSeleccionado) {
    mostrarToast("Primero seleccione un equipo.", "error");
    return;
  }

  const entradas = leerFormularioEntradas();

  if (!validarEntradas(entradas)) {
    mostrarToast("Revise los campos marcados.", "error");
    return;
  }

  equipoSeleccionado.entradas = entradas;

  guardarEquipoActual(equipoSeleccionado);
  guardarEntradasPorEquipo(equipoSeleccionado.id, entradas);

  mostrarToast("Las entradas fueron guardadas correctamente.", "success");
  actualizarEstado("Entradas guardadas", equipoSeleccionado.codigo, true);
}

function restablecerEntradas() {
  if (!datosOriginalesEquipo) {
    return;
  }

  equipoSeleccionado = copiarObjeto(datosOriginalesEquipo);

  eliminarEntradasGuardadas(equipoSeleccionado.id);
  guardarEquipoActual(equipoSeleccionado);
  mostrarEquipo(equipoSeleccionado);

  mostrarToast("Se restablecieron los datos originales del equipo.", "success");
}

function leerFormularioEntradas() {
  const entradas = {};

  CAMPOS_ENTRADA.forEach((idCampo) => {
    const campo = document.getElementById(idCampo);

    if (!campo) {
      return;
    }

    entradas[idCampo] =
      campo.type === "number"
        ? numero(campo.value)
        : String(campo.value || "").trim();
  });

  return entradas;
}

function validarEntradas(entradas) {
  let valido = true;

  const camposMayoresQueCero = [
    "precioAdquisicion",
    "vidaUtilHoras",
    "horasAnio",
    "precioCombustible",
    "horasOperadorMes",
    "horasAmortizacion"
  ];

  CAMPOS_ENTRADA.forEach((idCampo) => {
    const campo = document.getElementById(idCampo);

    if (campo) {
      campo.classList.remove("input-error");
    }
  });

  camposMayoresQueCero.forEach((idCampo) => {
    const campo = document.getElementById(idCampo);
    const valor = entradas[idCampo];

    if (!Number.isFinite(valor) || valor <= 0) {
      valido = false;

      if (campo) {
        campo.classList.add("input-error");
      }
    }
  });

  return valido;
}

function guardarEquipoActual(equipo) {
  localStorage.setItem(CLAVE_EQUIPO_ACTUAL, JSON.stringify(equipo));
}

function obtenerEquipoGuardado() {
  try {
    const contenido = localStorage.getItem(CLAVE_EQUIPO_ACTUAL);
    return contenido ? JSON.parse(contenido) : null;
  } catch {
    return null;
  }
}

function guardarEntradasPorEquipo(idEquipo, entradas) {
  const base = obtenerBaseEntradasGuardadas();
  base[idEquipo] = entradas;

  localStorage.setItem(CLAVE_ENTRADAS, JSON.stringify(base));
}

function obtenerEntradasGuardadas(idEquipo) {
  const base = obtenerBaseEntradasGuardadas();
  return base[idEquipo] || null;
}

function eliminarEntradasGuardadas(idEquipo) {
  const base = obtenerBaseEntradasGuardadas();

  delete base[idEquipo];

  localStorage.setItem(CLAVE_ENTRADAS, JSON.stringify(base));
}

function obtenerBaseEntradasGuardadas() {
  try {
    const contenido = localStorage.getItem(CLAVE_ENTRADAS);
    return contenido ? JSON.parse(contenido) : {};
  } catch {
    return {};
  }
}

function buscarEquipoEnIndice(idEquipo) {
  return equiposDisponibles.find((equipo, indice) => {
    return obtenerIdEquipo(equipo, indice) === idEquipo;
  });
}

function obtenerIdEquipo(equipo, indice = 0) {
  return String(
    equipo.id ||
    equipo.slug ||
    equipo.carpeta ||
    equipo.codigo ||
    equipo.codigoEquipo ||
    `equipo-${indice + 1}`
  );
}

function construirNombreEquipo(equipo) {
  const partes = [
    equipo.codigo || equipo.codigoEquipo,
    equipo.familia || equipo.tipo,
    equipo.marca,
    equipo.modelo || equipo.referencia,
    equipo.nombre
  ].filter(Boolean);

  return [...new Set(partes)].join(" - ") || "Equipo sin nombre";
}

function resolverRutaImagen(fuente) {
  if (fuente.imagen && String(fuente.imagen).includes("/")) {
    return fuente.imagen;
  }

  const carpeta =
    fuente.carpeta ||
    fuente.slug ||
    fuente.id ||
    "plantilla";

  const nombreImagen =
    fuente.imagen ||
    fuente.foto ||
    fuente.archivoImagen ||
    "imagen.jpg";

  return `data/equipos/${carpeta}/${nombreImagen}`;
}

function obtenerDato(entrada, fuente, nombres) {
  for (const nombre of nombres) {
    if (entrada[nombre] !== undefined && entrada[nombre] !== null) {
      return entrada[nombre];
    }

    if (fuente[nombre] !== undefined && fuente[nombre] !== null) {
      return fuente[nombre];
    }
  }

  return 0;
}

function obtenerPrimerValor(...valores) {
  return valores.find(
    (valor) =>
      valor !== undefined &&
      valor !== null &&
      String(valor).trim() !== ""
  );
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
    const normalizado = texto
      .replace(/\./g, "")
      .replace(",", ".");

    const resultado = Number(normalizado);
    return Number.isFinite(resultado) ? resultado : 0;
  }

  if (texto.includes(",")) {
    const resultado = Number(texto.replace(",", "."));
    return Number.isFinite(resultado) ? resultado : 0;
  }

  const resultado = Number(texto);
  return Number.isFinite(resultado) ? resultado : 0;
}

function porcentajeVisible(valor) {
  const resultado = numero(valor);

  if (resultado > 0 && resultado <= 1) {
    return resultado * 100;
  }

  return resultado;
}

function asignarTexto(idElemento, valor) {
  const elemento = document.getElementById(idElemento);

  if (!elemento) {
    return;
  }

  if ("value" in elemento) {
    elemento.value = valor ?? "";
  } else {
    elemento.textContent = valor ?? "—";
  }
}

function actualizarUnidadRendimiento() {
  const campo = document.getElementById("unidadRendimiento");
  const texto = document.getElementById("unidadRendimientoTexto");

  if (texto) {
    texto.textContent = campo?.value?.trim() || "—";
  }
}

function actualizarEstado(titulo, descripcion, correcto) {
  const statusTitle = document.getElementById("statusTitle");
  const statusDescription = document.getElementById("statusDescription");
  const statusDot = document.getElementById("statusDot");

  if (statusTitle) {
    statusTitle.textContent = titulo;
  }

  if (statusDescription) {
    statusDescription.textContent = descripcion;
  }

  if (statusDot) {
    statusDot.classList.toggle("success", Boolean(correcto));
    statusDot.classList.toggle("error", !correcto);
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
  const panel = document.getElementById("panelError");
  const mensaje = document.getElementById("mensajeError");

  if (panel) {
    panel.hidden = false;
  }

  if (mensaje) {
    mensaje.textContent =
      error instanceof Error ? error.message : String(error);
  }

  console.error(error);
}

function ocultarError() {
  const panel = document.getElementById("panelError");

  if (panel) {
    panel.hidden = true;
  }
}

function copiarObjeto(objeto) {
  return JSON.parse(JSON.stringify(objeto));
}