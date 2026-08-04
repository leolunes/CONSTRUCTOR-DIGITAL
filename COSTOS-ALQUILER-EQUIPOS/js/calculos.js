"use strict";

const CLAVE_EQUIPO_ACTUAL = "costos_alquiler_equipo_actual";
const CLAVE_RESULTADOS_CALCULO = "costos_alquiler_resultados_calculo";

document.addEventListener("DOMContentLoaded", iniciarCalculos);

function iniciarCalculos() {
  configurarInterfazGeneral();
  document.getElementById("btnRecalcular")?.addEventListener("click", ejecutarCalculo);
  ejecutarCalculo();
}

function configurarInterfazGeneral() {
  const footerYear = document.getElementById("footerYear");
  if (footerYear) footerYear.textContent = new Date().getFullYear();

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
    if (!equipo) return mostrarSinEquipo();

    const resultados = calcularCostoHorario(equipo.entradas || {}, equipo);
    equipo.calculo = resultados;

    localStorage.setItem(CLAVE_EQUIPO_ACTUAL, JSON.stringify(equipo));
    localStorage.setItem(CLAVE_RESULTADOS_CALCULO, JSON.stringify({
      idEquipo: equipo.id || equipo.codigo || "",
      versionDatos: equipo.versionDatos || "",
      calculo: resultados,
      fecha: new Date().toISOString()
    }));

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

function calcularCostoHorario(entradas, equipo = {}) {
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
  const margenDecimal = porcentajeDecimal(entradas.margenAlquiler);
  const tarifaComercialObjetivo = numero(entradas.tarifaComercialObjetivo);
  const rendimiento = numero(entradas.rendimiento);
  const unidadAlquiler = String(entradas.unidadAlquiler || equipo.unidadAlquiler || "Hr");
  const horasPorUnidadAlquiler = numero(
    entradas.horasPorUnidadAlquiler || equipo.horasPorUnidadAlquiler ||
    (unidadAlquiler.toLowerCase().startsWith("d") ? 8 : 1)
  ) || 1;

  const valorRescate = precioAdquisicion * valorRescatePorcentaje;
  const depreciacion = dividirSeguro(precioAdquisicion - valorRescate, vidaUtilHoras);
  const inversionMedia = ((precioAdquisicion - valorRescate) / 2) + valorRescate;
  const interes = dividirSeguro(inversionMedia * tasaInteres, horasAnio);
  const seguro = dividirSeguro(precioAdquisicion * seguroAnual, horasAnio);
  const mantenimientoFijo = dividirSeguro(mantenimientoFijoAnual, horasAnio);
  const seguroFijo = seguro + mantenimientoFijo;
  const combustible = consumoCombustible * precioCombustible;
  const lubricantes = combustible * factorLubricantes;
  const rodaje = dividirSeguro(costoRodaje, vidaRodajeHoras);
  const operador = dividirSeguro(operadorMes, horasOperadorMes);
  const otros = 0;
  const transporte = dividirSeguro(movilizacion + desmovilizacion, horasAmortizacion);

  const costoDirecto =
    depreciacion + interes + seguroFijo + combustible +
    lubricantes + rodaje + operador + otros;

  const utilidad = costoDirecto * margenDecimal;
  const alquilerEquivalente = costoDirecto + utilidad;

  /*
    La tarifa comercial objetivo pertenece a la unidad de alquiler
    (hora o día). El costo comercial final se expresa por hora.
  */
  const tarifaObjetivoHora = dividirSeguro(
    tarifaComercialObjetivo,
    horasPorUnidadAlquiler
  );

  const costoComercialFinal =
    costoDirecto > 0
      ? alquilerEquivalente + transporte
      : tarifaObjetivoHora + transporte;

  const costoPorUnidad =
    rendimiento > 0
      ? tarifaComercialObjetivo / rendimiento
      : 0;

  return {
    valorRescate,
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
    costoDirectoSinTransporte: costoDirecto,
    costoDirecto,
    margenPorcentaje: margenDecimal * 100,
    utilidad,
    alquilerEquivalente,
    tarifaComercialObjetivo,
    tarifaObjetivoHora,
    costoComercialFinal,
    rendimiento,
    unidadRendimiento: entradas.unidadRendimiento || "unidad/h",
    costoPorUnidad,
    unidadAlquiler,
    horasPorUnidadAlquiler
  };
}

function mostrarEncabezadoEquipo(equipo) {
  asignarTexto("calculoNombreEquipo",
    equipo.nombre || [equipo.marca, equipo.modelo].filter(Boolean).join(" ") ||
    equipo.familia || "Equipo seleccionado");
  asignarTexto("calculoReferenciaEquipo",
    [equipo.codigo, equipo.familia, equipo.referencia].filter(Boolean).join(" · ") ||
    "Datos tomados de la sección Entradas.");
}

function mostrarResultados(r) {
  asignarMoneda("calcDepreciacion", r.depreciacion);
  asignarMoneda("calcInteres", r.interes);
  asignarMoneda("calcSeguroFijo", r.seguroFijo);
  asignarMoneda("calcCombustible", r.combustible);
  asignarMoneda("calcLubricantes", r.lubricantes);
  asignarMoneda("calcRodaje", r.rodaje);
  asignarMoneda("calcOperador", r.operador);
  asignarMoneda("calcOtros", r.otros);
  asignarMoneda("calcTransporte", r.transporte);
  asignarMoneda("calcCostoDirecto", r.costoDirecto);
}

function mostrarSinEquipo() {
  asignarTexto("calculoNombreEquipo", "No hay un equipo seleccionado");
  asignarTexto("calculoReferenciaEquipo",
    "Regrese a Entradas, seleccione un equipo y guarde sus datos.");
  ["calcDepreciacion","calcInteres","calcSeguroFijo","calcCombustible",
   "calcLubricantes","calcRodaje","calcOperador","calcOtros",
   "calcTransporte","calcCostoDirecto"].forEach(id => asignarTexto(id, "—"));
}

function mostrarErrorCalculo(error) {
  asignarTexto("calculoNombreEquipo", "No fue posible calcular");
  asignarTexto("calculoReferenciaEquipo",
    error instanceof Error ? error.message : String(error));
}

function asignarTexto(id, valor) {
  const el = document.getElementById(id);
  if (el) el.textContent = valor ?? "—";
}
function asignarMoneda(id, valor) { asignarTexto(id, formatearMoneda(valor)); }
function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-CO", {
    style:"currency", currency:"COP", maximumFractionDigits:2
  }).format(Number.isFinite(valor) ? valor : 0);
}
function numero(valor) {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
  const texto = String(valor ?? "").trim().replace(/\s/g,"").replace(/\$/g,"");
  if (!texto) return 0;
  if (texto.includes(",") && texto.includes(".")) {
    const n = Number(texto.replace(/\./g,"").replace(",","."));
    return Number.isFinite(n) ? n : 0;
  }
  if (texto.includes(",")) {
    const n = Number(texto.replace(",","."));
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(texto);
  return Number.isFinite(n) ? n : 0;
}
function porcentajeDecimal(valor) {
  const n = numero(valor);
  return n > 1 ? n / 100 : n;
}
function dividirSeguro(a, b) {
  const d = numero(b);
  return d > 0 ? numero(a) / d : 0;
}