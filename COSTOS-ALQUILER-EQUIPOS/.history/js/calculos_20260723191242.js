"use strict";

/* ============================================================
   CALCULOS.JS
   Lee el equipo guardado desde Entradas, calcula el costo
   horario por componentes y muestra los resultados.
============================================================ */

const CLAVE_EQUIPO_ACTUAL = "costos_alquiler_equipo_actual";
const CLAVE_RESULTADOS_CALCULO = "costos_alquiler_resultados_calculo";

document.addEventListener("DOMContentLoaded", iniciarCalculos);

function iniciarCalculos() {
  configurarInterfazGeneral();

  const btnRecalcular = document.getElementById("btnRecalcular");

  if (btnRecalcular) {
    btnRecalcular.addEventListener("click", ejecutarCalculo);
  }

  ejecutarCalculo();
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

function ejecutarCalculo() {
  try {
    const equipo = obtenerEquipoActual();

    if (!equipo) {
      mostrarSinEquipo();
      return;
    }

    const entradas = equipo.entradas || {};
    const resultados = calcularCostoHorario(entradas);

    equipo.calculo = resultados;

    localStorage.setItem(CLAVE_EQUIPO_ACTUAL, JSON.stringify(equipo));
    localStorage.setItem(
      CLAVE_RESULTADOS_CALCULO,
      JSON.stringify({
        idEquipo: equipo.id || equipo.codigo || "",
        calculo: resultados,
        fecha: new Date().toISOString()
      })
    );

    mostrarEncabezadoEquipo(equipo);
    mostrarResultados(resultados);
  } catch (error) {
    console.error(error);
    mostrarErrorCalculo(error);
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

function calcularCostoHorario(entradas) {
  const precioAdquisicion = numero(entradas.precioAdquisicion);
  const valorRescatePorcentaje = porcentajeDecimal(entradas.valorRescate);
  const vidaUtilHoras = numero(entradas.vidaUtilHoras);
  const horasAnio = numero(entradas.horasAnio);
  const tasaInteres = porcentajeDecimal(entradas.tasaInteres);
  const seguroAnual = porcentajeDecimal(entradas.seguroAnual);
  const mantenimientoFijoAnual = numero(entradas.mantenimientoFijoAnual);

  const consumoCombustible = numero(entradas.consumoCombustible);
  const precioCombustible = numero(entradas.precioCombustible);
  const factorLubricantes = porcentajeDecimal(entradas.factorLubricantes);

  const costoRodaje = numero(entradas.costoRodaje);
  const vidaRodajeHoras = numero(entradas.vidaRodajeHoras);

  const operadorMes = numero(entradas.operadorMes);
  const horasOperadorMes = numero(entradas.horasOperadorMes);

  const movilizacion = numero(entradas.movilizacion);
  const desmovilizacion = numero(entradas.desmovilizacion);
  const horasAmortizacion = numero(entradas.horasAmortizacion);

  const valorRescate = precioAdquisicion * valorRescatePorcentaje;

  const depreciacion = dividirSeguro(
    precioAdquisicion - valorRescate,
    vidaUtilHoras
  );

  const inversionMedia =
    ((precioAdquisicion - valorRescate) / 2) + valorRescate;

  const interes = dividirSeguro(
    inversionMedia * tasaInteres,
    horasAnio
  );

  const seguro = dividirSeguro(
    precioAdquisicion * seguroAnual,
    horasAnio
  );

  const mantenimientoFijo = dividirSeguro(
    mantenimientoFijoAnual,
    horasAnio
  );

  const seguroFijo = seguro + mantenimientoFijo;

  const combustible = consumoCombustible * precioCombustible;

  const lubricantes = combustible * factorLubricantes;

  const rodaje = dividirSeguro(
    costoRodaje,
    vidaRodajeHoras
  );

  const operador = dividirSeguro(
    operadorMes,
    horasOperadorMes
  );

  const otros = 0;

  const transporte = dividirSeguro(
    movilizacion + desmovilizacion,
    horasAmortizacion
  );

  const costoDirectoSinTransporte =
    depreciacion +
    interes +
    seguroFijo +
    combustible +
    lubricantes +
    rodaje +
    operador +
    otros;

  const costoDirecto =
    costoDirectoSinTransporte +
    transporte;

  return {
    depreciacion,
    interes,
    seguro,
    mantenimientoFijo,
    seguroFijo,
    combustible,
    lubricantes,
    rodaje,
    operador,
    otros,
    transporte,
    costoDirectoSinTransporte,
    costoDirecto
  };
}

function mostrarEncabezadoEquipo(equipo) {
  asignarTexto(
    "calculoNombreEquipo",
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
    "calculoReferenciaEquipo",
    referencia || "Datos tomados de la sección Entradas."
  );
}

function mostrarResultados(resultados) {
  asignarMoneda("calcDepreciacion", resultados.depreciacion);
  asignarMoneda("calcInteres", resultados.interes);
  asignarMoneda("calcSeguroFijo", resultados.seguroFijo);
  asignarMoneda("calcCombustible", resultados.combustible);
  asignarMoneda("calcLubricantes", resultados.lubricantes);
  asignarMoneda("calcRodaje", resultados.rodaje);
  asignarMoneda("calcOperador", resultados.operador);
  asignarMoneda("calcOtros", resultados.otros);
  asignarMoneda("calcTransporte", resultados.transporte);
  asignarMoneda("calcCostoDirecto", resultados.costoDirecto);
}

function mostrarSinEquipo() {
  asignarTexto("calculoNombreEquipo", "No hay un equipo seleccionado");
  asignarTexto(
    "calculoReferenciaEquipo",
    "Regrese a Entradas, seleccione un equipo y guarde sus datos."
  );

  [
    "calcDepreciacion",
    "calcInteres",
    "calcSeguroFijo",
    "calcCombustible",
    "calcLubricantes",
    "calcRodaje",
    "calcOperador",
    "calcOtros",
    "calcTransporte",
    "calcCostoDirecto"
  ].forEach((id) => asignarTexto(id, "—"));
}

function mostrarErrorCalculo(error) {
  asignarTexto("calculoNombreEquipo", "No fue posible calcular");
  asignarTexto(
    "calculoReferenciaEquipo",
    error instanceof Error ? error.message : String(error)
  );
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

function dividirSeguro(numerador, denominador) {
  const divisor = numero(denominador);

  if (divisor <= 0) {
    return 0;
  }

  return numero(numerador) / divisor;
}