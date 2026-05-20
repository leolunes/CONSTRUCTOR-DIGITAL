// ===============================
// OFERTAS ARTIFICIALMENTE BAJAS
// Archivo: js/oab.js
// ===============================

import {
  DB,
  actualizarResultadosOAB,
  limpiarResultadosOAB,
  actualizarOferta
} from "./db.js";

// ===============================
// UTILIDADES INTERNAS
// ===============================
function obtenerOfertasValidas() {
  return DB.ofertas.filter(o => Number(o.oferta) > 0);
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

function desviacionEstandarPoblacional(valores = []) {
  if (!valores.length) return 0;
  const prom = promedio(valores);
  const varianza = valores.reduce((acc, v) => acc + Math.pow(v - prom, 2), 0) / valores.length;
  return Math.sqrt(varianza);
}

function redondear(numero, decimales = 7) {
  return Number(Number(numero || 0).toFixed(decimales));
}

// ===============================
// COMPARACIÓN ABSOLUTA
// Según guía: alerta cuando la oferta es menor en 20% o más
// al costo total estimado, o al porcentaje parametrizado.
// ===============================
export function calcularComparacionAbsoluta(oferta, presupuesto, umbral = 0.2) {
  const ofertaNum = Number(oferta) || 0;
  const presupuestoNum = Number(presupuesto) || 0;
  const umbralNum = Number(umbral) || 0;

  const diferenciaPO = ofertaNum - presupuestoNum;
  const variacionPO = presupuestoNum > 0 ? diferenciaPO / presupuestoNum : 0;
  const limiteAbsoluto = presupuestoNum * (1 - umbralNum);
  const alertaAbsoluta = ofertaNum > 0 && ofertaNum <= limiteAbsoluto;

  return {
    diferenciaPO: redondear(diferenciaPO, 2),
    variacionPO: redondear(variacionPO, 7),
    limiteAbsoluto: redondear(limiteAbsoluto, 2),
    alertaAbsoluta
  };
}

// ===============================
// COMPARACIÓN RELATIVA
// Método sugerido cuando hay 5 o más ofertas.
// Valor mínimo aceptable = mediana - desviación estándar
// ===============================
export function calcularComparacionRelativa(ofertas = []) {
  const valores = ofertas
    .map(o => Number(o.oferta))
    .filter(v => v > 0);

  const prom = promedio(valores);
  const med = mediana(valores);
  const desv = desviacionEstandarPoblacional(valores);
  const minimoAceptable = med - desv;

  return {
    promedio: redondear(prom, 2),
    mediana: redondear(med, 2),
    desviacion: redondear(desv, 2),
    minimoAceptable: redondear(minimoAceptable, 2),
    totalOfertas: valores.length
  };
}

// ===============================
// CLASIFICACIÓN INICIAL OAB
// NO rechaza automáticamente.
// Solo identifica:
// - SIGUE EN CURSO
// - POSIBLE OAB - REQUERIR SUSTENTACIÓN
// ===============================
export function clasificarOfertaInicial(oferta, resultadosRelativos, presupuesto, umbral = 0.2) {
  const ofertaNum = Number(oferta) || 0;

  const absoluta = calcularComparacionAbsoluta(ofertaNum, presupuesto, umbral);
  const bajoMinimoRelativo = ofertaNum > 0 && ofertaNum < Number(resultadosRelativos.minimoAceptable || 0);

  const clasificacionInicial =
    absoluta.alertaAbsoluta || bajoMinimoRelativo
      ? "POSIBLE OAB - REQUERIR SUSTENTACIÓN"
      : "SIGUE EN CURSO";

  return {
    diferenciaPO: absoluta.diferenciaPO,
    variacionPO: absoluta.variacionPO,
    limiteAbsoluto: absoluta.limiteAbsoluto,
    alertaAbsoluta: absoluta.alertaAbsoluta,
    bajoMinimoRelativo,
    clasificacionInicial,
    requiereSustentacion: clasificacionInicial === "POSIBLE OAB - REQUERIR SUSTENTACIÓN"
  };
}

// ===============================
// EJECUTAR EVALUACIÓN OAB COMPLETA
// Aplica comparación absoluta y relativa a todas las ofertas.
// ===============================
export function ejecutarEvaluacionOAB(umbral = 0.2) {
  limpiarResultadosOAB();

  const presupuesto = Number(DB.proceso.presupuesto) || 0;
  const ofertasValidas = obtenerOfertasValidas();

  if (!ofertasValidas.length) {
    actualizarResultadosOAB({
      promedio: 0,
      mediana: 0,
      desviacion: 0,
      minimoAceptable: 0,
      limiteAbsoluto: 0,
      totalOfertas: 0,
      ofertasEnAlerta: 0
    });

    return {
      promedio: 0,
      mediana: 0,
      desviacion: 0,
      minimoAceptable: 0,
      limiteAbsoluto: 0,
      totalOfertas: 0,
      ofertasEnAlerta: 0
    };
  }

  const relativa = calcularComparacionRelativa(ofertasValidas);
  const limiteAbsoluto = (Number(presupuesto) || 0) * (1 - Number(umbral || 0));

  let ofertasEnAlerta = 0;

  ofertasValidas.forEach(oferta => {
    const clasificacion = clasificarOfertaInicial(
      oferta.oferta,
      relativa,
      presupuesto,
      umbral
    );

    if (clasificacion.requiereSustentacion) {
      ofertasEnAlerta += 1;
    }

    actualizarOferta(oferta.id, {
      diferenciaPO: clasificacion.diferenciaPO,
      variacionPO: clasificacion.variacionPO,
      alertaAbsoluta: clasificacion.alertaAbsoluta,
      bajoMinimoRelativo: clasificacion.bajoMinimoRelativo,
      clasificacionInicial: clasificacion.clasificacionInicial,
      requiereSustentacion: clasificacion.requiereSustentacion
    });
  });

  const resumen = {
    promedio: relativa.promedio,
    mediana: relativa.mediana,
    desviacion: relativa.desviacion,
    minimoAceptable: relativa.minimoAceptable,
    limiteAbsoluto: redondear(limiteAbsoluto, 2),
    totalOfertas: relativa.totalOfertas,
    ofertasEnAlerta
  };

  actualizarResultadosOAB(resumen);

  return resumen;
}

// ===============================
// OBTENER LECTURA DEL RESULTADO OAB
// ===============================
export function obtenerLecturaOAB() {
  const { totalOfertas, ofertasEnAlerta, minimoAceptable, limiteAbsoluto } = DB.resultadosOAB;

  if (!totalOfertas) {
    return "No existen ofertas registradas para analizar.";
  }

  if (!ofertasEnAlerta) {
    return `No se identificaron ofertas con posible precio artificialmente bajo. Mínimo aceptable: ${minimoAceptable}. Límite absoluto: ${limiteAbsoluto}.`;
  }

  return `Se identificaron ${ofertasEnAlerta} oferta(s) con posible precio artificialmente bajo. Estas ofertas requieren solicitud de sustentación.`;
}

// ===============================
// DECISIÓN FINAL DEL COMITÉ
// Esta función NO reemplaza el criterio jurídico,
// pero ayuda a aplicar la lógica del proceso.
// ===============================
export function sugerirDecisionFinal(oferta) {
  if (!oferta) return "PENDIENTE";

  if (oferta.clasificacionInicial !== "POSIBLE OAB - REQUERIR SUSTENTACIÓN") {
    return "ACEPTADA";
  }

  if (oferta.respondio === "NO") {
    return "RECHAZADA";
  }

  if (oferta.sustentoValido === "NO") {
    return "RECHAZADA";
  }

  if (oferta.respondio === "SI" && oferta.sustentoValido === "SI") {
    return "ACEPTADA";
  }

  return "PENDIENTE";
}

// ===============================
// APLICAR DECISIONES SUGERIDAS
// ===============================
export function aplicarDecisionesSugeridas() {
  DB.ofertas.forEach(oferta => {
    const estadoSugerido = sugerirDecisionFinal(oferta);
    actualizarOferta(oferta.id, { estado: estadoSugerido });
  });
}

// ===============================
// RESUMEN DE CLASIFICACIÓN INICIAL
// ===============================
export function obtenerResumenClasificacionInicial() {
  const resumen = {
    sigueEnCurso: 0,
    posibleOAB: 0
  };

  DB.ofertas.forEach(oferta => {
    if (oferta.clasificacionInicial === "SIGUE EN CURSO") {
      resumen.sigueEnCurso += 1;
    }

    if (oferta.clasificacionInicial === "POSIBLE OAB - REQUERIR SUSTENTACIÓN") {
      resumen.posibleOAB += 1;
    }
  });

  return resumen;
}

// ===============================
// RESUMEN DE ESTADOS FINALES
// ===============================
export function obtenerResumenEstadosFinales() {
  const resumen = {
    aceptadas: 0,
    rechazadas: 0,
    pendientes: 0
  };

  DB.ofertas.forEach(oferta => {
    if (oferta.estado === "ACEPTADA") resumen.aceptadas += 1;
    if (oferta.estado === "RECHAZADA") resumen.rechazadas += 1;
    if (oferta.estado === "PENDIENTE") resumen.pendientes += 1;
  });

  return resumen;
}
