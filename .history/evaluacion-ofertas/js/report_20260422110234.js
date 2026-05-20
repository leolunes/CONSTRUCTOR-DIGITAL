// ===============================
// REPORTES Y TEXTOS AUTOMÁTICOS
// Archivo: js/report.js
// ===============================

import { DB, obtenerResumenGeneral } from "./db.js";
import { obtenerResumenTRM, obtenerNombreMetodo } from "./trm.js";
import {
  obtenerLecturaOAB,
  obtenerResumenClasificacionInicial,
  obtenerResumenEstadosFinales
} from "./oab.js";
import {
  obtenerLecturaEconomica,
  obtenerTablaEconomica
} from "./economica.js";

// ===============================
// UTILIDADES
// ===============================
function formatoNumero(valor) {
  return new Intl.NumberFormat("es-CO").format(Number(valor) || 0);
}

function formatoMoneda(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(Number(valor) || 0);
}

function hoyTexto() {
  const fecha = new Date();
  return fecha.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function linea(titulo, valor) {
  return `${titulo}: ${valor}`;
}

// ===============================
// INFORMACIÓN BÁSICA DEL PROCESO
// ===============================
export function generarInformeBasico() {
  const resumen = obtenerResumenGeneral();
  const trm = obtenerResumenTRM();
  const metodoNombre = trm.metodo ? trm.nombreMetodo : "No definido";

  const bloques = [
    "INFORME BÁSICO DEL PROCESO",
    "========================================",
    linea("Fecha del informe", DB.proceso.fechaEvaluacion || hoyTexto()),
    linea("Proceso", DB.proceso.nombre || "No registrado"),
    linea("Objeto", DB.proceso.objeto || "No registrado"),
    linea("Entidad", DB.proceso.entidad || "No registrada"),
    linea("Presupuesto oficial", formatoMoneda(DB.proceso.presupuesto)),
    linea("TRM", DB.proceso.trm || "No registrada"),
    linea("Decimal TRM", trm.decimal ? trm.decimal.toFixed(2) : "0.00"),
    linea("Método económico", metodoNombre),
    linea("Puntaje máximo por valor de oferta", formatoNumero(DB.proceso.puntajeMaximo)),
    linea("Total de ofertas registradas", resumen.totalOfertas),
    linea("Ofertas aceptadas", resumen.aceptadas),
    linea("Ofertas rechazadas", resumen.rechazadas),
    linea("Ofertas pendientes", resumen.pendientes),
    DB.proceso.observaciones ? linea("Observaciones generales", DB.proceso.observaciones) : ""
  ];

  return bloques.filter(Boolean).join("\n");
}

// ===============================
// SECCIÓN OAB
// ===============================
export function generarSeccionOAB() {
  const resumen = DB.resultadosOAB;
  const clasificacion = obtenerResumenClasificacionInicial();
  const estados = obtenerResumenEstadosFinales();

  const bloques = [
    "ANÁLISIS DE OFERTAS ARTIFICIALMENTE BAJAS",
    "========================================",
    linea("Total de ofertas analizadas", resumen.totalOfertas),
    linea("Promedio", formatoMoneda(resumen.promedio)),
    linea("Mediana", formatoMoneda(resumen.mediana)),
    linea("Desviación estándar", formatoMoneda(resumen.desviacion)),
    linea("Valor mínimo aceptable", formatoMoneda(resumen.minimoAceptable)),
    linea("Límite absoluto", formatoMoneda(resumen.limiteAbsoluto)),
    linea("Ofertas que siguen en curso", clasificacion.sigueEnCurso),
    linea("Ofertas con posible OAB", clasificacion.posibleOAB),
    linea("Ofertas aceptadas finalmente", estados.aceptadas),
    linea("Ofertas rechazadas finalmente", estados.rechazadas),
    linea("Ofertas pendientes", estados.pendientes),
    "",
    obtenerLecturaOAB()
  ];

  return bloques.join("\n");
}

// ===============================
// DETALLE DE OFERTAS
// ===============================
export function generarDetalleOfertas() {
  const ofertas = DB.ofertas;

  if (!ofertas.length) {
    return "No existen ofertas registradas.";
  }

  const lineas = [
    "DETALLE DE OFERTAS",
    "========================================"
  ];

  ofertas.forEach((oferta, index) => {
    lineas.push(
      `${index + 1}. ${oferta.empresa || "Sin nombre"}`,
      `   Oferta: ${formatoMoneda(oferta.oferta)}`,
      `   Clasificación inicial: ${oferta.clasificacionInicial || "No evaluada"}`,
      `   Requiere sustentación: ${oferta.requiereSustentacion ? "Sí" : "No"}`,
      `   Estado final: ${oferta.estado || "PENDIENTE"}`,
      `   Respondió: ${oferta.respondio || "No registra"}`,
      `   Sustento válido: ${oferta.sustentoValido || "No registra"}`,
      `   Causal de rechazo: ${oferta.causalRechazo || "No aplica"}`,
      `   Observación: ${oferta.observacion || "Sin observación"}`,
      ""
    );
  });

  return lineas.join("\n");
}

// ===============================
// SECCIÓN ECONÓMICA
// ===============================
export function generarSeccionEconomica() {
  const resumen = DB.resultadosEconomicos;
  const tabla = obtenerTablaEconomica();

  const bloques = [
    "EVALUACIÓN ECONÓMICA",
    "========================================",
    linea("Método aplicado", resumen.metodo ? obtenerNombreMetodo(resumen.metodo) : "No definido"),
    linea("Mediana", formatoMoneda(resumen.mediana)),
    linea("Valor mediana inferior (Vme)", formatoMoneda(resumen.vme)),
    linea("Media geométrica", formatoMoneda(resumen.mediaGeometrica)),
    linea("Media aritmética baja", formatoMoneda(resumen.mediaAritmeticaBaja)),
    linea("Menor valor", formatoMoneda(resumen.menorValor)),
    linea("Total de ofertas aceptadas", resumen.totalAceptadas),
    linea("Puntaje máximo", formatoNumero(DB.proceso.puntajeMaximo)),
    "",
    obtenerLecturaEconomica(),
    "",
    "TABLA DE RESULTADOS ECONÓMICOS",
    "----------------------------------------"
  ];

  if (!tabla.length) {
    bloques.push("No existen ofertas aceptadas para evaluación económica.");
    return bloques.join("\n");
  }

  tabla.forEach(item => {
    bloques.push(
      `Ranking ${item.ranking} | ${item.empresa} | Oferta: ${formatoMoneda(item.oferta)} | Puntaje: ${item.puntaje}`
    );
  });

  return bloques.join("\n");
}

// ===============================
// INFORME TÉCNICO COMPLETO
// ===============================
export function generarInformeTecnicoCompleto() {
  const partes = [
    "INFORME TÉCNICO DE EVALUACIÓN",
    "########################################",
    "",
    generarInformeBasico(),
    "",
    generarSeccionOAB(),
    "",
    generarDetalleOfertas(),
    "",
    generarSeccionEconomica()
  ];

  return partes.join("\n");
}

// ===============================
// CONCLUSIÓN AUTOMÁTICA
// ===============================
export function generarConclusionAutomatica() {
  const resumenEconomico = DB.resultadosEconomicos;

  if (!resumenEconomico.mejorOferta) {
    return "No fue posible establecer un primer orden de elegibilidad, debido a que no existen ofertas aceptadas con evaluación económica válida.";
  }

  return `Con fundamento en la evaluación realizada, el proponente ubicado en el primer orden de elegibilidad es ${resumenEconomico.mejorOferta.empresa}, con una oferta de ${formatoMoneda(resumenEconomico.mejorOferta.oferta)} y un puntaje económico de ${resumenEconomico.mejorPuntaje}.`;
}

// ===============================
// INFORME FINAL PARA ADJUDICACIÓN
// ===============================
export function generarInformeFinalAdjudicacion() {
  const partes = [
    generarInformeTecnicoCompleto(),
    "",
    "CONCLUSIÓN",
    "========================================",
    generarConclusionAutomatica()
  ];

  return partes.join("\n");
}

// ===============================
// RESUMEN CORTO PARA VISTA PREVIA
// ===============================
export function generarResumenEjecutivo() {
  const trm = obtenerResumenTRM();
  const resumen = obtenerResumenGeneral();
  const econ = DB.resultadosEconomicos;

  return {
    proceso: DB.proceso.nombre || "No registrado",
    entidad: DB.proceso.entidad || "No registrada",
    objeto: DB.proceso.objeto || "No registrado",
    presupuesto: formatoMoneda(DB.proceso.presupuesto),
    totalOfertas: resumen.totalOfertas,
    aceptadas: resumen.aceptadas,
    rechazadas: resumen.rechazadas,
    pendientes: resumen.pendientes,
    trm: DB.proceso.trm || 0,
    decimalTRM: trm.decimal ? trm.decimal.toFixed(2) : "0.00",
    metodo: trm.nombreMetodo || "No definido",
    lider: econ.mejorOferta ? econ.mejorOferta.empresa : "No definido",
    puntajeLider: econ.mejorPuntaje || 0
  };
}
