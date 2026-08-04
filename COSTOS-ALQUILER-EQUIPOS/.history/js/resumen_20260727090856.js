"use strict";

const CLAVE_EQUIPO_ACTUAL = "costos_alquiler_equipo_actual";
const CLAVE_RESULTADOS_CALCULO = "costos_alquiler_resultados_calculo";

document.addEventListener("DOMContentLoaded", iniciarResumen);

function iniciarResumen() {
  configurarInterfazGeneral();
  try {
    const equipo = obtenerEquipoActual();
    if (!equipo) return mostrarSinEquipo();

    const calculo = obtenerCalculoDisponible(equipo);
    if (!calculo) return mostrarSinCalculo(equipo);

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

function obtenerEquipoActual() {
  try {
    const contenido = localStorage.getItem(CLAVE_EQUIPO_ACTUAL);
    return contenido ? JSON.parse(contenido) : null;
  } catch { return null; }
}

function obtenerCalculoDisponible(equipo) {
  if (equipo.calculo && typeof equipo.calculo === "object") return equipo.calculo;
  try {
    const contenido = localStorage.getItem(CLAVE_RESULTADOS_CALCULO);
    if (!contenido) return null;
    const guardado = JSON.parse(contenido);
    if (guardado.idEquipo && equipo.id &&
        String(guardado.idEquipo) !== String(equipo.id)) return null;
    return guardado.calculo || null;
  } catch { return null; }
}

function construirResumen(equipo, calculo) {
  const entradas = equipo.entradas || {};
  return {
    costoDirecto: numero(calculo.costoDirectoSinTransporte ?? calculo.costoDirecto),
    margenPorcentaje: numero(calculo.margenPorcentaje),
    margen: numero(calculo.utilidad),
    alquilerEquivalente: numero(calculo.alquilerEquivalente),
    tarifaComercial: numero(calculo.tarifaComercialObjetivo ?? entradas.tarifaComercialObjetivo),
    unidadAlquiler: String(calculo.unidadAlquiler || entradas.unidadAlquiler || equipo.unidadAlquiler || "Hr"),
    transporte: numero(calculo.transporte),
    costoFinal: numero(calculo.costoComercialFinal),
    rendimiento: numero(calculo.rendimiento ?? entradas.rendimiento),
    unidadRendimiento: String(calculo.unidadRendimiento || entradas.unidadRendimiento || "unidad/h"),
    costoUnidad: numero(calculo.costoPorUnidad)
  };
}

function mostrarEncabezadoEquipo(equipo) {
  asignarTexto("resumenNombreEquipo",
    equipo.nombre || [equipo.marca,equipo.modelo].filter(Boolean).join(" ") ||
    equipo.familia || "Equipo seleccionado");
  asignarTexto("resumenReferenciaEquipo",
    [equipo.codigo,equipo.familia,equipo.referencia].filter(Boolean).join(" · ") ||
    "Resumen comercial y productivo.");
}

function mostrarResumen(r) {
  asignarMoneda("resCostoDirecto", r.costoDirecto);
  asignarMoneda("resMargen", r.margen);
  asignarTexto("resMargenPorcentaje", `${formatearNumero(r.margenPorcentaje)} %`);
  asignarMoneda("resTarifaComercial", r.tarifaComercial);
  asignarTexto("resTarifaUnidad", `COP/${r.unidadAlquiler}`);
  asignarMoneda("resTransporte", r.transporte);
  asignarMoneda("resCostoFinal", r.costoFinal);
  asignarTexto("resRendimiento", formatearNumero(r.rendimiento));
  asignarTexto("resUnidadRendimiento", r.unidadRendimiento);
  asignarMoneda("resCostoUnidad", r.costoUnidad);
  asignarTexto("resCostoUnidadTexto", construirUnidadCosto(r.unidadRendimiento));

  asignarMoneda("detalleCostoDirecto", r.costoDirecto);
  asignarMoneda("detalleUtilidad", r.margen);
  asignarMoneda("detalleTarifa", r.tarifaComercial);
  asignarMoneda("detalleMovilizacion", r.transporte);
  asignarMoneda("detalleTarifaFinal", r.costoFinal);
  asignarTexto("detalleRendimiento", formatearNumero(r.rendimiento));
  asignarTexto("detalleUnidad", r.unidadRendimiento);
  asignarMoneda("detalleCostoUnidad", r.costoUnidad);
}

function construirUnidadCosto(unidad) {
  const limpia = String(unidad || "unidad/h")
    .replace(/\/día/gi,"").replace(/\/hora/gi,"").replace(/\/h/gi,"").trim();
  return `COP/${limpia || "unidad"}`;
}
function mostrarSinEquipo() {
  asignarTexto("resumenNombreEquipo","No hay un equipo seleccionado");
  asignarTexto("resumenReferenciaEquipo",
    "Regrese a Entradas, seleccione un equipo y guarde sus datos.");
  limpiarResultados();
}
function mostrarSinCalculo(equipo) {
  mostrarEncabezadoEquipo(equipo);
  asignarTexto("resumenReferenciaEquipo",
    "Primero debe abrir la sección Cálculo para generar los resultados.");
  limpiarResultados();
}
function mostrarError(error) {
  asignarTexto("resumenNombreEquipo","No fue posible generar el resumen");
  asignarTexto("resumenReferenciaEquipo",
    error instanceof Error ? error.message : String(error));
  limpiarResultados();
}
function limpiarResultados() {
  ["resCostoDirecto","resMargen","resTarifaComercial","resTransporte",
   "resCostoFinal","resRendimiento","resCostoUnidad","detalleCostoDirecto",
   "detalleUtilidad","detalleTarifa","detalleMovilizacion","detalleTarifaFinal",
   "detalleRendimiento","detalleUnidad","detalleCostoUnidad"]
   .forEach(id => asignarTexto(id,"—"));
  asignarTexto("resMargenPorcentaje","—");
  asignarTexto("resUnidadRendimiento","—");
  asignarTexto("resCostoUnidadTexto","COP/unidad");
}
function asignarTexto(id, valor) {
  const el=document.getElementById(id);
  if(el) el.textContent=valor ?? "—";
}
function asignarMoneda(id, valor) { asignarTexto(id, formatearMoneda(valor)); }
function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-CO",{
    style:"currency",currency:"COP",maximumFractionDigits:2
  }).format(Number.isFinite(valor)?valor:0);
}
function formatearNumero(valor) {
  return new Intl.NumberFormat("es-CO",{maximumFractionDigits:2})
    .format(Number.isFinite(valor)?valor:0);
}
function numero(valor) {
  if(typeof valor==="number") return Number.isFinite(valor)?valor:0;
  const texto=String(valor??"").trim().replace(/\s/g,"").replace(/\$/g,"");
  if(!texto) return 0;
  if(texto.includes(",")&&texto.includes(".")){
    const n=Number(texto.replace(/\./g,"").replace(",",".")); return Number.isFinite(n)?n:0;
  }
  if(texto.includes(",")){ const n=Number(texto.replace(",",".")); return Number.isFinite(n)?n:0; }
  const n=Number(texto); return Number.isFinite(n)?n:0;
}