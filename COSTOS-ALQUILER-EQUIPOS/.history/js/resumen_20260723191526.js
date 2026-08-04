"use strict";

/* ============================================================
   RESUMEN.JS
   Lee el equipo y los resultados del cálculo para mostrar
   el resumen comercial, productivo y el costo por unidad.
============================================================ */

const CLAVE_EQUIPO_ACTUAL = "costos_alquiler_equipo_actual";
const CLAVE_RESULTADOS_CALCULO = "costos_alquiler_resultados_calculo";

document.addEventListener("DOMContentLoaded", iniciarResumen);

function iniciarResumen() {
  configurarInterfazGeneral();

  try {
    const equipo = obtenerEquipoActual();

    if (!equipo) {
      mostrarSinEquipo();
      return;
    }

    const calculo = obtenerCalculoDisponible(equipo);

    if (!calculo) {
      mostrarSinCalculo(equipo);
      return;
    }

    const resumen = construirResumen(equipo, calculo);

    equipo.resumen = resumen;
    equipo.calculo = calculo;

    localStorage.setItem(CLAVE_EQUIPO_ACTUAL, JSON.stringify(equipo));

    mostrarEncabezadoEquipo(equipo);
    mostrarResumen(resumen);
  } catch (error) {
    console.error(error);
    mostrarError(error);
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

function obtenerEquipoActual() {
  try {
    const contenido = localStorage.getItem(CLAVE_EQUIPO_ACTUAL);
    return contenido ? JSON.parse(contenido) : null;
  } catch {
    return null;
  }
}

function obtenerCalculoDisponible(equipo) {
  if (equipo.calculo && typeof equipo.calculo === "object") {
    return equipo.calculo;
  }

  try {
    const contenido = localStorage.getItem(CLAVE_RESULTADOS_CALCULO);

    if (!contenido) {
      return null;
    }

    const guardado = JSON.parse(contenido);

    if (
      guardado.idEquipo &&
      equipo.id &&
      String(guardado.idEquipo) !== String(equipo.id)
    ) {
      return null;
    }

    return guardado.calculo || null;
  } catch {
    return null;
  }
}

function construirResumen(equipo, calculo) {
  const entradas = equipo.entradas || {};

  const costoDirecto = numero(
    calculo.costoDirectoSinTransporte ?? calculo.costoDirecto
  );

  const transporte = numero(calculo.transporte);

  const margenPorcentaje = numero(entradas.margenAlquiler);
  const margenDecimal = porcentajeDecimal(margenPorcentaje);

  const margen = costoDirecto * margenDecimal;
  const tarifaComercial = costoDirecto + margen;
  const costoFinal = tarifaComercial + transporte;

  const rendimiento = numero(entradas.rendimiento);
  const unidadRendimiento =
    String(entradas.unidadRendimiento || "unidad/h").trim();

  const costoUnidad =
    rendimiento > 0
      ? costoFinal / rendimiento
      : 0;

  return {
    costoDirecto,
    margenPorcentaje,
    margen,
    tarifaComercial,
    transporte,
    costoFinal,
    rendimiento,
    unidadRendimiento,
    costoUnidad
  };
}

function mostrarEncabezadoEquipo(equipo) {
  asignarTexto(
    "resumenNombreEquipo",
    equipo.nombre ||
    [equipo.marca, equipo.modelo].filter(Boolean).join(" ") ||
    equipo.familia ||
    "Equipo seleccionado"
  );

  const referencia = [
    equipo.codigo,
    equipo.familia,
    equipo.referencia
  ].filter(Boolean).join(" · ");

  asignarTexto(
    "resumenReferenciaEquipo",
    referencia || "Resumen comercial y productivo."
  );
}

function mostrarResumen(resumen) {
  asignarMoneda("resCostoDirecto", resumen.costoDirecto);
  asignarMoneda("resMargen", resumen.margen);
  asignarTexto(
    "resMargenPorcentaje",
    `${formatearNumero(resumen.margenPorcentaje)} %`
  );

  asignarMoneda("resTarifaComercial", resumen.tarifaComercial);
  asignarMoneda("resTransporte", resumen.transporte);
  asignarMoneda("resCostoFinal", resumen.costoFinal);

  asignarTexto(
    "resRendimiento",
    formatearNumero(resumen.rendimiento)
  );

  asignarTexto(
    "resUnidadRendimiento",
    resumen.unidadRendimiento
  );

  asignarMoneda("resCostoUnidad", resumen.costoUnidad);

  asignarTexto(
    "resCostoUnidadTexto",
    construirUnidadCosto(resumen.unidadRendimiento)
  );

  asignarMoneda("detalleCostoDirecto", resumen.costoDirecto);
  asignarMoneda("detalleUtilidad", resumen.margen);
  asignarMoneda("detalleTarifa", resumen.tarifaComercial);
  asignarMoneda("detalleMovilizacion", resumen.transporte);
  asignarMoneda("detalleTarifaFinal", resumen.costoFinal);

  asignarTexto(
    "detalleRendimiento",
    formatearNumero(resumen.rendimiento)
  );

  asignarTexto(
    "detalleUnidad",
    resumen.unidadRendimiento
  );

  asignarMoneda(
    "detalleCostoUnidad",
    resumen.costoUnidad
  );
}

function construirUnidadCosto(unidadRendimiento) {
  const unidad = String(unidadRendimiento || "unidad/h")
    .replace("/hora", "")
    .replace("/h", "")
    .trim();

  return `COP/${unidad || "unidad"}`;
}

function mostrarSinEquipo() {
  asignarTexto("resumenNombreEquipo", "No hay un equipo seleccionado");
  asignarTexto(
    "resumenReferenciaEquipo",
    "Regrese a Entradas, seleccione un equipo y guarde sus datos."
  );

  limpiarResultados();
}

function mostrarSinCalculo(equipo) {
  mostrarEncabezadoEquipo(equipo);

  asignarTexto(
    "resumenReferenciaEquipo",
    "Primero debe abrir la sección Cálculo para generar los resultados."
  );

  limpiarResultados();
}

function mostrarError(error) {
  asignarTexto("resumenNombreEquipo", "No fue posible generar el resumen");
  asignarTexto(
    "resumenReferenciaEquipo",
    error instanceof Error ? error.message : String(error)
  );

  limpiarResultados();
}

function limpiarResultados() {
  [
    "resCostoDirecto",
    "resMargen",
    "resTarifaComercial",
    "resTransporte",
    "resCostoFinal",
    "resRendimiento",
    "resCostoUnidad",
    "detalleCostoDirecto",
    "detalleUtilidad",
    "detalleTarifa",
    "detalleMovilizacion",
    "detalleTarifaFinal",
    "detalleRendimiento",
    "detalleUnidad",
    "detalleCostoUnidad"
  ].forEach((id) => asignarTexto(id, "—"));

  asignarTexto("resMargenPorcentaje", "—");
  asignarTexto("resUnidadRendimiento", "—");
  asignarTexto("resCostoUnidadTexto", "COP/unidad");
}

function asignarTexto(idElemento, valor) {
  const elemento = document.getElementById(idElemento);

  if (elemento) {
    elemento.textContent = valor ?? "—";
  }
}

function asignarMoneda(idElemento, valor) {
  asignarTexto(idElemento, formatearMoneda(valor));
}

function formatearMoneda(valor) {
  const numeroSeguro = Number.isFinite(valor) ? valor : 0;

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 2
  }).format(numeroSeguro);
}

function formatearNumero(valor) {
  const numeroSeguro = Number.isFinite(valor) ? valor : 0;

  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 2
  }).format(numeroSeguro);
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

function porcentajeDecimal(valor) {
  const resultado = numero(valor);

  if (resultado > 1) {
    return resultado / 100;
  }

  return resultado;
}