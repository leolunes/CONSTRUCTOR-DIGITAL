// ===============================
// EVALUACIÓN ECONÓMICA
// Archivo: js/economica.js
// ===============================

import {
  DB,
  actualizarOferta,
  actualizarResultadosEconomicos,
  limpiarResultadosEconomicos
} from "./db.js";

import { obtenerMetodoPorTRM, obtenerNombreMetodo } from "./trm.js";

// 🔥 FORMATO PESOS
function formatearPesos(valor) {
  return "$ " + Number(valor || 0).toLocaleString("es-CO");
}

// ===============================
// UTILIDADES INTERNAS
// ===============================
function redondear(numero, decimales = 7) {
  return Number(Number(numero || 0).toFixed(decimales));
}

function promedio(valores = []) {
  if (!valores.length) return 0;
  return valores.reduce((acc, v) => acc + v, 0) / valores.length;
}

function mediana(valores = []) {
  if (!valores.length) return 0;

  const ordenados = [...valores].sort((a, b) => a - b);
  const n = ordenados.length;
  const mitad = Math.floor(n / 2);

  if (n % 2 !== 0) {
    return ordenados[mitad];
  }

  return (ordenados[mitad - 1] + ordenados[mitad]) / 2;
}

function valorMedianaInferior(valores = []) {
  if (!valores.length) return 0;

  const ordenados = [...valores].sort((a, b) => a - b);
  const n = ordenados.length;

  if (n % 2 !== 0) {
    return ordenados[Math.floor(n / 2)];
  }

  return ordenados[n / 2 - 1];
}

function mediaGeometrica(valores = []) {
  const positivos = valores.filter(v => Number(v) > 0);
  if (!positivos.length) return 0;

  const sumaLogs = positivos.reduce((acc, v) => acc + Math.log(v), 0);
  return Math.exp(sumaLogs / positivos.length);
}

function menorValor(valores = []) {
  if (!valores.length) return 0;
  return Math.min(...valores);
}

function mediaAritmeticaBaja(valores = []) {
  if (!valores.length) return 0;
  const menor = menorValor(valores);
  const prom = promedio(valores);
  return (menor + prom) / 2;
}

// ===============================
// FILTRO REAL DE OFERTAS EVALUABLES
// Regla ajustada:
// - Sí incluye ofertas con restricción por precio artificialmente bajo
// - Sí incluye estados distintos, siempre que no estén eliminadas
// - Solo excluye las que tengan observación ELIMINADA
// ===============================
function esOfertaEvaluableEconomicamente(oferta) {
  return (
    String(oferta?.empresa || "").trim() !== "" &&
    Number(oferta?.oferta || 0) > 0 &&
    String(oferta?.observacion || "").trim().toUpperCase() !== "ELIMINADA"
  );
}

function obtenerOfertasEvaluablesEconomicamente() {
  return DB.ofertas.filter(esOfertaEvaluableEconomicamente);
}

function obtenerValoresAceptados() {
  return obtenerOfertasEvaluablesEconomicamente()
    .map(o => Number(o.oferta))
    .filter(v => v > 0);
}

// ===============================
// CÁLCULO DE VALORES BASE
// ===============================
export function calcularValoresBaseEconomicos() {
  const valores = obtenerValoresAceptados();

  const med = mediana(valores);
  const vme = valorMedianaInferior(valores);
  const geo = mediaGeometrica(valores);
  const min = menorValor(valores);
  const aritBaja = mediaAritmeticaBaja(valores);

  return {
    totalAceptadas: valores.length,
    mediana: redondear(med, 2),
    vme: redondear(vme, 2),
    mediaGeometrica: redondear(geo, 2),
    mediaAritmeticaBaja: redondear(aritBaja, 2),
    menorValor: redondear(min, 2)
  };
}

// ===============================
// PUNTAJES POR FÓRMULA
// ===============================
export function calcularPuntajeMediana(oferta, puntajeMaximo, baseMediana, vme, totalAceptadas) {
  const vi = Number(oferta) || 0;
  const max = Number(puntajeMaximo) || 0;

  let base = Number(baseMediana) || 0;

  if (totalAceptadas % 2 === 0) {
    base = Number(vme) || 0;
  }

  if (base <= 0 || vi <= 0) return 0;

  const puntaje = max * (1 - Math.abs((base - vi) / base));
  return Math.max(0, redondear(puntaje, 7));
}

export function calcularPuntajeGeometrica(oferta, puntajeMaximo, baseGeometrica) {
  const vi = Number(oferta) || 0;
  const max = Number(puntajeMaximo) || 0;
  const base = Number(baseGeometrica) || 0;

  if (base <= 0 || vi <= 0) return 0;

  const puntaje = max * (1 - Math.abs((base - vi) / base));
  return Math.max(0, redondear(puntaje, 7));
}

export function calcularPuntajeAritmeticaBaja(oferta, puntajeMaximo, baseAritmeticaBaja) {
  const vi = Number(oferta) || 0;
  const max = Number(puntajeMaximo) || 0;
  const base = Number(baseAritmeticaBaja) || 0;

  if (base <= 0 || vi <= 0) return 0;

  const puntaje = max * (1 - Math.abs((base - vi) / base));
  return Math.max(0, redondear(puntaje, 7));
}

export function calcularPuntajeMenorValor(oferta, puntajeMaximo, baseMenorValor) {
  const vi = Number(oferta) || 0;
  const max = Number(puntajeMaximo) || 0;
  const base = Number(baseMenorValor) || 0;

  if (base <= 0 || vi <= 0) return 0;

  const puntaje = max * (base / vi);
  return Math.max(0, redondear(puntaje, 7));
}

// ===============================
// CALCULAR PUNTAJE SEGÚN MÉTODO
// ===============================
export function calcularPuntajeSegunMetodo(oferta, metodo, puntajeMaximo, bases) {
  switch (metodo) {
    case "MEDIANA":
      return calcularPuntajeMediana(
        oferta,
        puntajeMaximo,
        bases.mediana,
        bases.vme,
        bases.totalAceptadas
      );

    case "GEOMETRICA":
      return calcularPuntajeGeometrica(
        oferta,
        puntajeMaximo,
        bases.mediaGeometrica
      );

    case "ARITMETICA_BAJA":
      return calcularPuntajeAritmeticaBaja(
        oferta,
        puntajeMaximo,
        bases.mediaAritmeticaBaja
      );

    case "MENOR_VALOR":
      return calcularPuntajeMenorValor(
        oferta,
        puntajeMaximo,
        bases.menorValor
      );

    default:
      return 0;
  }
}

// ===============================
// APLICAR RANKING
// ===============================
export function aplicarRankingEconomico() {
  const evaluables = obtenerOfertasEvaluablesEconomicamente()
    .map(o => ({ id: o.id, puntaje: Number(o.puntaje) || 0 }))
    .sort((a, b) => b.puntaje - a.puntaje);

  evaluables.forEach((item, index) => {
    actualizarOferta(item.id, {
      ranking: index + 1
    });
  });
}

// ===============================
// EJECUTAR EVALUACIÓN ECONÓMICA COMPLETA
// ===============================
export function ejecutarEvaluacionEconomica() {
  limpiarResultadosEconomicos();

  const trm = Number(DB.proceso.trm) || 0;
  const puntajeMaximo = Number(DB.proceso.puntajeMaximo) || 0;
  const metodo = obtenerMetodoPorTRM(trm);
  const nombreMetodo = obtenerNombreMetodo(metodo);
  const bases = calcularValoresBaseEconomicos();

  if (!bases.totalAceptadas) {
    actualizarResultadosEconomicos({
      metodo: "",
      mediana: 0,
      mediaGeometrica: 0,
      mediaAritmeticaBaja: 0,
      menorValor: 0,
      vme: 0,
      totalAceptadas: 0,
      mejorOferta: null,
      mejorPuntaje: 0
    });

    return {
      metodo: "",
      nombreMetodo: "No existen ofertas habilitadas para evaluar",
      ...bases,
      mejorOferta: null,
      mejorPuntaje: 0
    };
  }

  obtenerOfertasEvaluablesEconomicamente().forEach(oferta => {
    const puntaje = calcularPuntajeSegunMetodo(
      oferta.oferta,
      metodo,
      puntajeMaximo,
      bases
    );

    actualizarOferta(oferta.id, {
      puntaje
      // 🔥 NO se toca puntajeTotal aquí, se calcula en app.js
    });
  });

  aplicarRankingEconomico();

  const ranking = obtenerOfertasEvaluablesEconomicamente()
    .map(o => ({
      id: o.id,
      empresa: o.empresa,
      oferta: o.oferta,
      puntaje: o.puntaje,
      ranking: o.ranking
    }))
    .sort((a, b) => a.ranking - b.ranking);

  const mejorOferta = ranking.length ? ranking[0] : null;
  const mejorPuntaje = mejorOferta ? mejorOferta.puntaje : 0;

  const resumen = {
    metodo,
    nombreMetodo,
    mediana: bases.mediana,
    mediaGeometrica: bases.mediaGeometrica,
    mediaAritmeticaBaja: bases.mediaAritmeticaBaja,
    menorValor: bases.menorValor,
    vme: bases.vme,
    totalAceptadas: bases.totalAceptadas,
    mejorOferta,
    mejorPuntaje
  };

  actualizarResultadosEconomicos(resumen);

  return resumen;
}

// ===============================
// OBTENER TABLA ECONÓMICA
// ===============================
export function obtenerTablaEconomica() {
  return obtenerOfertasEvaluablesEconomicamente()
    .map(o => ({
      id: o.id,
      empresa: o.empresa,
      oferta: o.oferta,
      puntaje: o.puntaje,
      ranking: o.ranking
    }))
    .sort((a, b) => a.ranking - b.ranking);
}

// ===============================
// GENERAR LECTURA DE RESULTADOS
// ===============================
export function obtenerLecturaEconomica() {
  const resumen = DB.resultadosEconomicos;

  if (!resumen.totalAceptadas) {
    return "No existen ofertas habilitadas para aplicar la evaluación económica.";
  }

  if (!resumen.mejorOferta) {
    return "No fue posible determinar el orden de elegibilidad económica.";
  }

  return `La evaluación económica se realizó mediante el método ${obtenerNombreMetodo(resumen.metodo)}. Se evaluaron ${resumen.totalAceptadas} propuesta(s) habilitada(s). El proponente ubicado en el primer orden de elegibilidad económico es ${resumen.mejorOferta.empresa}, con una oferta de ${formatearPesos(resumen.mejorOferta.oferta)} y un puntaje de ${resumen.mejorPuntaje}.`;
}

// ===============================
// TEXTO BASE PARA INFORME
// ===============================
export function generarTextoEvaluacionEconomica() {
  const resumen = DB.resultadosEconomicos;
  const puntajeMaximo = Number(DB.proceso.puntajeMaximo) || 0;

  if (!resumen.totalAceptadas) {
    return "No existen ofertas habilitadas para la ponderación económica.";
  }

  if (!resumen.mejorOferta) {
    return "No fue posible establecer el orden de elegibilidad económico.";
  }

  return `Con base en las propuestas finalmente habilitadas, la entidad aplicó el método de ponderación económica ${obtenerNombreMetodo(resumen.metodo)}. El puntaje máximo asignable por valor de oferta fue de ${puntajeMaximo}. Una vez aplicadas las fórmulas previstas en el pliego, el proponente ubicado en el primer orden de elegibilidad económico es ${resumen.mejorOferta.empresa}, con un puntaje de ${resumen.mejorPuntaje}.`;
}
