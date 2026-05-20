// ===============================
// EVALUACIÓN ECONÓMICA
// Archivo: js/economica.js
// ===============================

import {
  DB,
  PROYECTOS,
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
    Number(oferta?.oferta || 0) >= 0 &&
    String(oferta?.observacion || "").trim().toUpperCase() !== "ELIMINADA"
  );
}

function obtenerOfertasEvaluablesEconomicamente() {
  return DB.ofertas.filter(esOfertaEvaluableEconomicamente);
}

function obtenerValoresAceptados() {
  return obtenerOfertasEvaluablesEconomicamente()
    .map(o => Number(o.oferta))
    .filter(v => v >= 0);
}

// ===============================
// CÁLCULO DE VALORES BASE
// ===============================
export function calcularValoresBaseEconomicos(ofertasCustom = null) {
  const valores = (Array.isArray(ofertasCustom)
    ? ofertasCustom
    : obtenerOfertasEvaluablesEconomicamente()
  )
    .map(o => Number(o.oferta))
    .filter(v => v >= 0);

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

  // Persistir rankingFinal inicial para alimentar el histórico.
  // app.js recalcula luego el ranking final completo con factores adicionales.
  obtenerOfertasEvaluablesEconomicamente()
    .sort((a, b) => Number(a.ranking || 0) - Number(b.ranking || 0))
    .forEach((oferta, index) => {
      actualizarOferta(oferta.id, {
        rankingFinal: index + 1
      });
    });

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


// ===============================
// 🔥 SIMULACIÓN DE FÓRMULAS
// ===============================
export function simularEvaluacionEconomica(metodoSimulado) {
  const puntajeMaximo = Number(DB.proceso.puntajeMaximo) || 0;
  const bases = calcularValoresBaseEconomicos();

  if (!bases.totalAceptadas) {
    return {
      metodo: metodoSimulado,
      nombreMetodo: obtenerNombreMetodo(metodoSimulado),
      tabla: [],
      mejorOferta: null
    };
  }

  const tabla = obtenerOfertasEvaluablesEconomicamente()
    .map(oferta => {
      const puntaje = calcularPuntajeSegunMetodo(
        oferta.oferta,
        metodoSimulado,
        puntajeMaximo,
        bases
      );

      return {
        id: oferta.id,
        empresa: oferta.empresa,
        oferta: oferta.oferta,
        puntaje
      };
    })
    .sort((a, b) => b.puntaje - a.puntaje)
    .map((item, index) => ({
      ...item,
      ranking: index + 1
    }));

  const mejorOferta = tabla.length ? tabla[0] : null;

  return {
    metodo: metodoSimulado,
    nombreMetodo: obtenerNombreMetodo(metodoSimulado),
    tabla,
    mejorOferta,
    bases
  };
}

// ===============================
// 🔥 SIMULACIÓN ESCENARIO GANADOR DINÁMICO
// Recalcula bases estadísticas, puntaje económico,
// puntaje total y ranking final sin modificar DB.
// ===============================
function calcularPuntajesFactoresSimulados(oferta) {
  return {
    puntajeCalidad: oferta.cumpleCalidad ? Number(DB.proceso.puntajeCalidad || 0) : 0,
    puntajeSostenibilidad: oferta.cumpleSostenibilidad ? Number(DB.proceso.puntajeSostenibilidad || 0) : 0,
    puntajeIndustria: oferta.cumpleIndustria ? Number(DB.proceso.puntajeIndustriaNacional || 0) : 0,
    puntajeDiscapacidad: oferta.cumpleDiscapacidad ? Number(DB.proceso.puntajeDiscapacidad || 0) : 0,
    puntajeMujer: oferta.cumpleMujer ? Number(DB.proceso.puntajeMujer || 0) : 0,
    puntajeMipyme: oferta.cumpleMipyme ? Number(DB.proceso.puntajeMipyme || 0) : 0
  };
}

function calcularPuntajeTotalSimulado(oferta, puntajeEconomico) {
  const factores = calcularPuntajesFactoresSimulados(oferta);

  const total =
    Number(puntajeEconomico || 0) +
    Number(factores.puntajeCalidad || 0) +
    Number(factores.puntajeSostenibilidad || 0) +
    Number(factores.puntajeIndustria || 0) +
    Number(factores.puntajeDiscapacidad || 0) +
    Number(factores.puntajeMujer || 0) +
    Number(factores.puntajeMipyme || 0);

  return {
    ...factores,
    puntajeTotal: redondear(total, 4)
  };
}

function evaluarEscenarioSimulado(ofertasEscenario = [], metodo = "", puntajeMaximo = 0) {
  const bases = calcularValoresBaseEconomicos(ofertasEscenario);

  const tabla = ofertasEscenario
    .map(oferta => {
      const puntaje = calcularPuntajeSegunMetodo(
        oferta.oferta,
        metodo,
        puntajeMaximo,
        bases
      );

      const factores = calcularPuntajeTotalSimulado(oferta, puntaje);

      return {
        ...oferta,
        puntaje,
        puntajeCalidad: factores.puntajeCalidad,
        puntajeSostenibilidad: factores.puntajeSostenibilidad,
        puntajeIndustria: factores.puntajeIndustria,
        puntajeDiscapacidad: factores.puntajeDiscapacidad,
        puntajeMujer: factores.puntajeMujer,
        puntajeMipyme: factores.puntajeMipyme,
        puntajeTotal: factores.puntajeTotal
      };
    })
    .sort((a, b) => {
      const diffTotal = Number(b.puntajeTotal || 0) - Number(a.puntajeTotal || 0);
      if (diffTotal !== 0) return diffTotal;

      const diffEco = Number(b.puntaje || 0) - Number(a.puntaje || 0);
      if (diffEco !== 0) return diffEco;

      return Number(a.oferta || 0) - Number(b.oferta || 0);
    })
    .map((item, index) => ({
      ...item,
      rankingFinalSimulado: index + 1
    }));

  return {
    bases,
    tabla,
    ganador: tabla.length ? tabla[0] : null
  };
}

function combinarElementos(arr = [], k = 1) {
  const resultados = [];

  function helper(inicio, combo) {
    if (combo.length === k) {
      resultados.push([...combo]);
      return;
    }

    for (let i = inicio; i < arr.length; i++) {
      combo.push(arr[i]);
      helper(i + 1, combo);
      combo.pop();
    }
  }

  helper(0, []);
  return resultados;
}

function calcularViabilidadPorCantidad(cantidad) {
  if (cantidad <= 1) return "ALTA";
  if (cantidad <= 3) return "MEDIA";
  if (cantidad <= 6) return "BAJA";
  return "REMOTA";
}

// ===============================
// FUNCIÓN PRINCIPAL DE ESCENARIO GANADOR
// ===============================
export function simularEscenarioGanadorDinamico(miId, maxExclusiones = 3) {
  const miIdNum = Number(miId);

  const ofertasBase = obtenerOfertasEvaluablesEconomicamente()
    .map(o => ({ ...o }));

  const miOferta = ofertasBase.find(o => Number(o.id) === miIdNum);

  if (!miOferta) {
    return {
      encontrado: false,
      motivo: "No se encontró el proponente seleccionado dentro de las ofertas evaluables.",
      tablaActual: [],
      escenario: null
    };
  }

  const trm = Number(DB.proceso.trm) || 0;
  const puntajeMaximo = Number(DB.proceso.puntajeMaximo) || 0;
  const metodo = obtenerMetodoPorTRM(trm);
  const nombreMetodo = obtenerNombreMetodo(metodo);

  const escenarioActual = evaluarEscenarioSimulado(
    ofertasBase,
    metodo,
    puntajeMaximo
  );

  const miActual = escenarioActual.tabla.find(o => Number(o.id) === miIdNum);

  if (!miActual) {
    return {
      encontrado: false,
      motivo: "No fue posible ubicar al proponente seleccionado en el ranking simulado actual.",
      tablaActual: escenarioActual.tabla,
      escenario: null
    };
  }

  if (Number(miActual.rankingFinalSimulado || 0) === 1) {
    return {
      encontrado: true,
      yaEsGanador: true,
      metodo,
      nombreMetodo,
      posicionActual: 1,
      brechaLider: 0,
      viabilidad: "ALTA",
      escenario: {
        excluidos: [],
        totalExcluidos: 0,
        bases: escenarioActual.bases,
        tabla: escenarioActual.tabla,
        miResultado: miActual,
        ganador: miActual
      },
      tablaActual: escenarioActual.tabla
    };
  }

  const superiores = escenarioActual.tabla
    .filter(o => Number(o.rankingFinalSimulado || 0) < Number(miActual.rankingFinalSimulado || 0));

  const liderActual = escenarioActual.tabla[0];
  const brechaLider = liderActual
    ? redondear(Number(liderActual.puntajeTotal || 0) - Number(miActual.puntajeTotal || 0), 4)
    : 0;

  const max = Math.min(Number(maxExclusiones || 3), superiores.length);

  for (let k = 1; k <= max; k++) {
    const combinaciones = combinarElementos(superiores, k);

    for (const combo of combinaciones) {
      const idsExcluir = combo.map(o => Number(o.id));
      const ofertasFiltradas = ofertasBase.filter(o => !idsExcluir.includes(Number(o.id)));

      const escenario = evaluarEscenarioSimulado(
        ofertasFiltradas,
        metodo,
        puntajeMaximo
      );

      const miResultado = escenario.tabla.find(o => Number(o.id) === miIdNum);

      if (miResultado && Number(miResultado.rankingFinalSimulado || 0) === 1) {
        return {
          encontrado: true,
          yaEsGanador: false,
          metodo,
          nombreMetodo,
          posicionActual: miActual.rankingFinalSimulado,
          puntajeActual: miActual.puntajeTotal,
          liderActual: liderActual || null,
          brechaLider,
          viabilidad: calcularViabilidadPorCantidad(k),
          escenario: {
            excluidos: combo.map(o => ({
              id: o.id,
              empresa: o.empresa,
              rankingActual: o.rankingFinalSimulado,
              puntajeTotal: o.puntajeTotal,
              diferenciaContraMi: redondear(Number(o.puntajeTotal || 0) - Number(miActual.puntajeTotal || 0), 4)
            })),
            totalExcluidos: k,
            bases: escenario.bases,
            tabla: escenario.tabla,
            miResultado,
            ganador: escenario.ganador
          },
          tablaActual: escenarioActual.tabla
        };
      }
    }
  }

  return {
    encontrado: false,
    yaEsGanador: false,
    metodo,
    nombreMetodo,
    posicionActual: miActual.rankingFinalSimulado,
    puntajeActual: miActual.puntajeTotal,
    liderActual: liderActual || null,
    brechaLider,
    viabilidad: calcularViabilidadPorCantidad(superiores.length),
    superiores: superiores.map(o => ({
      id: o.id,
      empresa: o.empresa,
      rankingActual: o.rankingFinalSimulado,
      puntajeTotal: o.puntajeTotal,
      diferenciaContraMi: redondear(Number(o.puntajeTotal || 0) - Number(miActual.puntajeTotal || 0), 4)
    })),
    motivo: `No se encontró un escenario ganador excluyendo hasta ${maxExclusiones} proponente(s).`,
    escenario: null,
    tablaActual: escenarioActual.tabla
  };
}

// ===============================
// 🔥 SIMULACIÓN MULTI-ESCENARIO (NIVEL EXPERTO)
// Genera varios escenarios (1,2,3 exclusiones)
// ===============================
export function simularMultiplesEscenarios(miId, maxExclusiones = 3) {

  const resultados = [];

  for (let k = 1; k <= maxExclusiones; k++) {

    const resultado = simularEscenarioGanadorDinamico(miId, k);

    resultados.push({
      escenario: k,
      encontrado: resultado.encontrado,
      posicionActual: resultado.posicionActual,
      viabilidad: resultado.viabilidad,
      brechaLider: resultado.brechaLider,
      gana: resultado.encontrado,
      totalExcluidos: resultado.escenario?.totalExcluidos || 0,
      excluidos: resultado.escenario?.excluidos || [],
      puntajeProyectado: resultado.escenario?.miResultado?.puntajeTotal || null
    });
  }

  return resultados;
}




// ===============================
// 🔥 VALOR COMPETITIVO SUGERIDO (MODELO PREDICTIVO REAL)
// ===============================
export function calcularValorCompetitivo() {

  const presupuesto = Number(DB.proceso.presupuesto || 0);
  const puntajeMaximo = Number(DB.proceso.puntajeMaximo || 0);

  if (!presupuesto || !puntajeMaximo) return null;

  const ofertas = obtenerOfertasEvaluablesEconomicamente()
    .filter(o => Number(o.oferta || 0) >= 0);

  if (!ofertas.length) return null;

  const metodos = ["MEDIANA", "GEOMETRICA", "ARITMETICA_BAJA", "MENOR_VALOR"];

  // ===============================
  // 1. DESVIACIONES REALES DEL PROCESO
  // ===============================
  const porcentajes = ofertas.map(o => (Number(o.oferta) / presupuesto) * 100);
  const desviaciones = porcentajes.map(p => p - 100);
  const ordenados = [...porcentajes].sort((a, b) => a - b);

  function percentil(arr, q) {
    if (!arr.length) return 0;
    const pos = (arr.length - 1) * q;
    const base = Math.floor(pos);
    const resto = pos - base;

    if (arr[base + 1] !== undefined) {
      return arr[base] + resto * (arr[base + 1] - arr[base]);
    }

    return arr[base];
  }

  const p10 = percentil(ordenados, 0.10);
  const p25 = percentil(ordenados, 0.25);
  const p50 = percentil(ordenados, 0.50);
  const p75 = percentil(ordenados, 0.75);
  const p90 = percentil(ordenados, 0.90);

  const minReal = Math.min(...porcentajes);
  const maxReal = Math.max(...porcentajes);
  const promedioReal = promedio(porcentajes);
  const medianaReal = mediana(porcentajes);

  const desviacionEstandar = Math.sqrt(
    promedio(porcentajes.map(p => Math.pow(p - promedioReal, 2)))
  );

  // ===============================
  // 2. ZONA REAL DE COMPETENCIA
  // No permite recomendaciones fuera del comportamiento observado
  // ===============================
  const rangoInferior = Math.max(minReal, p10);
  const rangoSuperior = Math.min(maxReal, p75 + 0.75);

  // ===============================
  // 3. EVALUACIÓN SIMULADA DEL VALOR CANDIDATO EN LAS 4 FÓRMULAS
  // ===============================
  function evaluarCandidato(porcentajeCandidato) {
    const valorSimulado = (porcentajeCandidato / 100) * presupuesto;

    const posiciones = [];
    const puntajes = [];
    const brechasGanador = [];
    const rankings = [];

    metodos.forEach(metodo => {
      const ofertasSim = [
        ...ofertas.map(o => ({ ...o })),
        {
          id: -999,
          empresa: "OFERTA SIMULADA",
          oferta: valorSimulado,
          cumpleCalidad: true,
          cumpleSostenibilidad: true,
          cumpleIndustria: true,
          cumpleDiscapacidad: true,
          cumpleMujer: true,
          cumpleMipyme: true
        }
      ];

      const bases = calcularValoresBaseEconomicos(ofertasSim);

      const tabla = ofertasSim
        .map(o => {
          const puntaje = calcularPuntajeSegunMetodo(
            o.oferta,
            metodo,
            puntajeMaximo,
            bases
          );

          return {
            ...o,
            puntaje
          };
        })
        .sort((a, b) => {
          const diff = Number(b.puntaje || 0) - Number(a.puntaje || 0);
          if (diff !== 0) return diff;
          return Number(a.oferta || 0) - Number(b.oferta || 0);
        })
        .map((o, i) => ({
          ...o,
          ranking: i + 1
        }));

      const sim = tabla.find(o => o.id === -999);
      const ganador = tabla[0];

      if (sim) {
        posiciones.push(sim.ranking);
        puntajes.push(sim.puntaje);
        brechasGanador.push(Number(ganador?.puntaje || 0) - Number(sim.puntaje || 0));

        rankings.push({
          metodo,
          posicion: sim.ranking,
          puntaje: sim.puntaje,
          brechaGanador: Number(ganador?.puntaje || 0) - Number(sim.puntaje || 0),
          ganador: ganador?.empresa || ""
        });
      }
    });

    const promedioPosicion = promedio(posiciones);
    const mejorPosicion = Math.min(...posiciones);
    const peorPosicion = Math.max(...posiciones);
    const promedioPuntaje = promedio(puntajes);
    const brechaPromedio = promedio(brechasGanador);

    // Robustez: estabilidad en las 4 fórmulas
    const dispersionPosicion = Math.max(...posiciones) - Math.min(...posiciones);

    // Puntaje predictivo compuesto:
    // - mejor posición promedio
    // - menor peor posición
    // - menor brecha promedio
    // - menor dispersión entre fórmulas
    // - cercanía al centro competitivo real
    const distanciaCentro = Math.abs(porcentajeCandidato - medianaReal);

    const score =
      (promedioPosicion * 40) +
      (peorPosicion * 20) +
      (brechaPromedio * 15) +
      (dispersionPosicion * 15) +
      (distanciaCentro * 10);

    return {
      porcentaje: porcentajeCandidato,
      desviacion: porcentajeCandidato - 100,
      valorPesos: Math.round(valorSimulado),
      promedioPosicion,
      mejorPosicion,
      peorPosicion,
      promedioPuntaje,
      brechaPromedio,
      dispersionPosicion,
      distanciaCentro,
      score,
      rankings
    };
  }

  const candidatos = [];

  for (let p = rangoSuperior; p >= rangoInferior; p -= 0.05) {
    candidatos.push(evaluarCandidato(Number(p.toFixed(4))));
  }

  if (!candidatos.length) return null;

  candidatos.sort((a, b) => a.score - b.score);

  const mejor = candidatos[0];

  // ===============================
  // 4. ZONA DE MAYOR DENSIDAD COMPETITIVA
  // Calcula dónde están concentradas las ofertas reales más competitivas
  // ===============================
  const candidatosTop = candidatos.slice(0, Math.max(3, Math.ceil(candidatos.length * 0.10)));
  const desvTop = candidatosTop.map(c => c.desviacion).sort((a, b) => a - b);

  const rangoMin = Number(Math.min(...desvTop).toFixed(2));
  const rangoMax = Number(Math.max(...desvTop).toFixed(2));

  // ===============================
  // 5. PROBABILIDAD ESTIMADA DE COMPETITIVIDAD
  // No es probabilidad jurídica; es índice analítico de desempeño
  // ===============================
  const top3 = mejor.rankings.filter(r => Number(r.posicion || 0) <= 3).length;
  const top5 = mejor.rankings.filter(r => Number(r.posicion || 0) <= 5).length;

  let probabilidadCompetitiva = 0;

  if (top3 === 4) probabilidadCompetitiva = 90;
  else if (top3 >= 3) probabilidadCompetitiva = 80;
  else if (top5 === 4) probabilidadCompetitiva = 70;
  else if (top5 >= 3) probabilidadCompetitiva = 60;
  else if (mejor.promedioPosicion <= 8) probabilidadCompetitiva = 45;
  else probabilidadCompetitiva = 30;

  // ===============================
  // 6. RIESGO OAB
  // Basado en posición real frente a las ofertas más bajas observadas
  // ===============================
  let riesgo = "BAJO";
  const desvSugerida = mejor.desviacion;
  const desvMinReal = minReal - 100;
  const desvP10 = p10 - 100;
  const desvP25 = p25 - 100;

  if (desvSugerida <= desvP10) {
    riesgo = "ALTO";
  } else if (desvSugerida <= desvP25) {
    riesgo = "MEDIO";
  }

  // ===============================
  // 7. ROBUSTEZ
  // ===============================
  let robustez = "BAJA";

  if (mejor.peorPosicion <= 3 && mejor.dispersionPosicion <= 2) {
    robustez = "ALTA";
  } else if (mejor.peorPosicion <= 6 && mejor.dispersionPosicion <= 4) {
    robustez = "MEDIA";
  }

  return {
    desviacionSugerida: Number(mejor.desviacion.toFixed(2)),
    valorPesos: mejor.valorPesos,
    rango: [rangoMin, rangoMax],
    robustez,
    riesgo,

    probabilidadCompetitiva,
    posicionPromedio: Number(mejor.promedioPosicion.toFixed(2)),
    mejorPosicion: mejor.mejorPosicion,
    peorPosicion: mejor.peorPosicion,
    puntajePromedio: Number(mejor.promedioPuntaje.toFixed(4)),
    brechaPromedioGanador: Number(mejor.brechaPromedio.toFixed(4)),

    analisisProyecto: {
      ofertasEvaluadas: ofertas.length,
      minReal: Number((minReal - 100).toFixed(2)),
      maxReal: Number((maxReal - 100).toFixed(2)),
      promedioReal: Number((promedioReal - 100).toFixed(2)),
      medianaReal: Number((medianaReal - 100).toFixed(2)),
      p10: Number((p10 - 100).toFixed(2)),
      p25: Number((p25 - 100).toFixed(2)),
      p50: Number((p50 - 100).toFixed(2)),
      p75: Number((p75 - 100).toFixed(2)),
      p90: Number((p90 - 100).toFixed(2)),
      desviacionEstandar: Number(desviacionEstandar.toFixed(2))
    },

    sensibilidadFormulas: mejor.rankings.map(r => ({
      metodo: r.metodo,
      nombreMetodo: obtenerNombreMetodo(r.metodo),
      posicion: r.posicion,
      puntaje: Number(r.puntaje.toFixed(4)),
      brechaGanador: Number(r.brechaGanador.toFixed(4)),
      ganador: r.ganador
    }))
  };
}

// ===============================
// 🔥 VALOR COMPETITIVO HISTÓRICO
// TOP 3 PONDERADO DE TODOS LOS PROYECTOS GUARDADOS
// ===============================
export function calcularValorCompetitivoHistorico() {

  if (!PROYECTOS || !Array.isArray(PROYECTOS.lista)) {
    return null;
  }

  const muestras = [];
  const proyectosOmitidos = [];

  function esOfertaHistoricaValida(oferta) {
    return (
      String(oferta?.empresa || "").trim() !== "" &&
      Number(oferta?.oferta || 0) > 0 &&
      String(oferta?.observacion || "").trim().toUpperCase() !== "ELIMINADA"
    );
  }

  function medianaValoresOfertas(ofertasValidas = []) {
    const valores = ofertasValidas
      .map(o => Number(o.oferta || 0))
      .filter(v => v > 0)
      .sort((a, b) => a - b);

    return mediana(valores);
  }

  function esPresupuestoCompatible(presupuesto, ofertasValidas = []) {
    const presupuestoNum = Number(presupuesto || 0);
    const medianaOfertas = medianaValoresOfertas(ofertasValidas);

    if (!presupuestoNum || !medianaOfertas) return false;

    const relacion = medianaOfertas / presupuestoNum;

    return relacion >= 0.60 && relacion <= 1.40;
  }

  function obtenerPresupuestoHistoricoSeguro(proyecto, proceso, ofertasValidas) {
    const candidatos = [];

    const presupuestoProyecto = Number(proceso?.presupuesto || 0);
    if (presupuestoProyecto > 0) {
      candidatos.push({
        valor: presupuestoProyecto,
        origen: "PRESUPUESTO_OFICIAL_GUARDADO"
      });
    }

    if (Number(proyecto?.id) === Number(PROYECTOS?.activoId)) {
      const presupuestoActual = Number(DB.proceso?.presupuesto || 0);
      if (presupuestoActual > 0 && presupuestoActual !== presupuestoProyecto) {
        candidatos.push({
          valor: presupuestoActual,
          origen: "PRESUPUESTO_OFICIAL_ACTUAL"
        });
      }
    }

    for (const candidato of candidatos) {
      if (esPresupuestoCompatible(candidato.valor, ofertasValidas)) {
        return {
          valor: Number(candidato.valor || 0),
          origen: candidato.origen,
          valido: true,
          razon: "Presupuesto oficial compatible con las ofertas."
        };
      }
    }

    const medianaOfertas = medianaValoresOfertas(ofertasValidas);

    return {
      valor: 0,
      origen: "SIN_PRESUPUESTO_VALIDO",
      valido: false,
      razon:
        "El proyecto no tiene un presupuesto oficial compatible con sus ofertas. " +
        `Presupuesto guardado: ${formatearPesos(presupuestoProyecto)}. ` +
        `Mediana de ofertas: ${formatearPesos(medianaOfertas)}.`
    };
  }

  function ordenarOfertasHistoricas(ofertas = []) {
    const conRanking = ofertas.filter(o => Number(o.rankingFinal || 0) > 0);
    if (conRanking.length) {
      return conRanking.sort((a, b) => Number(a.rankingFinal || 0) - Number(b.rankingFinal || 0));
    }

    const conPuntajeTotal = ofertas.filter(o => Number(o.puntajeTotal || 0) > 0);
    if (conPuntajeTotal.length) {
      return conPuntajeTotal.sort((a, b) => {
        const diffTotal = Number(b.puntajeTotal || 0) - Number(a.puntajeTotal || 0);
        if (diffTotal !== 0) return diffTotal;
        const diffEco = Number(b.puntaje || 0) - Number(a.puntaje || 0);
        if (diffEco !== 0) return diffEco;
        return Number(a.oferta || 0) - Number(b.oferta || 0);
      });
    }

    const conPuntaje = ofertas.filter(o => Number(o.puntaje || 0) > 0);
    if (conPuntaje.length) {
      return conPuntaje.sort((a, b) => {
        const diff = Number(b.puntaje || 0) - Number(a.puntaje || 0);
        if (diff !== 0) return diff;
        return Number(a.oferta || 0) - Number(b.oferta || 0);
      });
    }

    return [...ofertas].sort((a, b) => Number(a.oferta || 0) - Number(b.oferta || 0));
  }

  PROYECTOS.lista.forEach(proyecto => {
    const data = proyecto?.data || {};
    const proceso = data.proceso || {};
    const ofertas = Array.isArray(data.ofertas) ? data.ofertas : [];

    if (!ofertas.length) return;

    const ofertasValidas = ofertas
      .filter(esOfertaHistoricaValida)
      .map(o => ({
        ...o,
        oferta: Number(o.oferta || 0),
        puntajeTotal: Number(o.puntajeTotal || 0),
        rankingFinal: Number(o.rankingFinal || 0),
        puntaje: Number(o.puntaje || 0)
      }));

    if (!ofertasValidas.length) return;

    const presupuestoInfo = obtenerPresupuestoHistoricoSeguro(proyecto, proceso, ofertasValidas);

    if (!presupuestoInfo.valido || !presupuestoInfo.valor) {
      proyectosOmitidos.push({
        proyecto: proyecto.nombre || proceso.nombre || "Proyecto sin nombre",
        razon: presupuestoInfo.razon
      });
      return;
    }

    const top = ordenarOfertasHistoricas(ofertasValidas).slice(0, 3);

    top.forEach((oferta, index) => {
      const peso = index === 0 ? 3 : index === 1 ? 2 : 1;
      const desviacion = ((Number(oferta.oferta || 0) - presupuestoInfo.valor) / presupuestoInfo.valor) * 100;

      muestras.push({
        proyectoId: proyecto.id,
        proyectoNombre: proyecto.nombre || proceso.nombre || "Proyecto sin nombre",
        empresa: oferta.empresa,
        posicion: Number(oferta.rankingFinal || 0) || (index + 1),
        desviacion,
        peso,
        presupuesto: presupuestoInfo.valor,
        presupuestoOrigen: presupuestoInfo.origen,
        oferta: oferta.oferta
      });
    });
  });

  if (!muestras.length) {
    return null;
  }

  const totalPeso = muestras.reduce((acc, m) => acc + Number(m.peso || 0), 0);

  const promedioPonderado = totalPeso
    ? muestras.reduce((acc, m) => acc + (Number(m.desviacion || 0) * Number(m.peso || 0)), 0) / totalPeso
    : 0;

  const desviacionesExpandidas = [];

  muestras.forEach(m => {
    for (let i = 0; i < Number(m.peso || 1); i++) {
      desviacionesExpandidas.push(Number(m.desviacion || 0));
    }
  });

  desviacionesExpandidas.sort((a, b) => a - b);

  function percentil(arr, q) {
    if (!arr.length) return 0;
    const pos = (arr.length - 1) * q;
    const base = Math.floor(pos);
    const resto = pos - base;

    if (arr[base + 1] !== undefined) {
      return arr[base] + resto * (arr[base + 1] - arr[base]);
    }

    return arr[base];
  }

  const p25 = percentil(desviacionesExpandidas, 0.25);
  const p50 = percentil(desviacionesExpandidas, 0.50);
  const p75 = percentil(desviacionesExpandidas, 0.75);

  const promedioSimple = promedio(desviacionesExpandidas);
  const desviacionEstandar = Math.sqrt(
    promedio(desviacionesExpandidas.map(v => Math.pow(v - promedioSimple, 2)))
  );

  const procesosAnalizados = new Set(muestras.map(m => m.proyectoId)).size;

  let confianza = "BAJA";
  if (procesosAnalizados >= 20) confianza = "ALTA";
  else if (procesosAnalizados >= 5) confianza = "MEDIA";

  const presupuestoActual = Number(DB.proceso.presupuesto || 0);
  const valorPesos = presupuestoActual
    ? Math.round(presupuestoActual * ((100 + promedioPonderado) / 100))
    : 0;

  let lectura = "";

  if (procesosAnalizados <= 1) {
    lectura =
      "El histórico todavía es limitado porque solo existe un proceso con información completa. " +
      "El resultado se calculó contra el presupuesto oficial del proceso, no contra la mediana de ofertas.";
  } else if (procesosAnalizados < 5) {
    lectura =
      "El histórico empieza a mostrar tendencia, pero aún cuenta con pocos procesos. " +
      "Se recomienda usarlo como apoyo y contrastarlo con el valor competitivo del proceso actual.";
  } else {
    lectura =
      "El histórico tiene una base más representativa y permite identificar una zona recurrente de competitividad a partir del TOP 3 ponderado de los proyectos guardados.";
  }

  if (proyectosOmitidos.length) {
    lectura +=
      ` Se omitieron ${proyectosOmitidos.length} proyecto(s) porque no tenían presupuesto oficial compatible con sus ofertas.`;
  }

  return {
    desviacionHistoricaSugerida: Number(promedioPonderado.toFixed(2)),
    valorPesos,
    rango: [
      Number(p25.toFixed(2)),
      Number(p75.toFixed(2))
    ],
    medianaHistorica: Number(p50.toFixed(2)),
    promedioSimple: Number(promedioSimple.toFixed(2)),
    desviacionEstandar: Number(desviacionEstandar.toFixed(2)),
    procesosAnalizados,
    muestrasTop3: muestras.length,
    confianza,
    metodo: "TOP 3 ponderado histórico contra presupuesto oficial",
    pesos: {
      primero: 3,
      segundo: 2,
      tercero: 1
    },
    lectura,
    proyectosOmitidos,
    detalle: muestras.map(m => ({
      proyecto: m.proyectoNombre,
      empresa: m.empresa,
      posicion: m.posicion,
      desviacion: Number(m.desviacion.toFixed(2)),
      peso: m.peso,
      presupuesto: m.presupuesto,
      oferta: m.oferta
    }))
  };
}

// ===============================
// 🔥 FACTORES ESTRATÉGICOS DE PUNTUACIÓN
// Proceso actual + histórico de proyectos
// ===============================
const FACTORES_ESTRATEGICOS = [
  {
    key: "cumpleCalidad",
    puntajeKey: "puntajeCalidad",
    nombre: "Factor de calidad"
  },
  {
    key: "cumpleSostenibilidad",
    puntajeKey: "puntajeSostenibilidad",
    nombre: "Sostenibilidad"
  },
  {
    key: "cumpleIndustria",
    puntajeKey: "puntajeIndustria",
    nombre: "Apoyo a la industria nacional"
  },
  {
    key: "cumpleDiscapacidad",
    puntajeKey: "puntajeDiscapacidad",
    nombre: "Vinculación personas con discapacidad"
  },
  {
    key: "cumpleMujer",
    puntajeKey: "puntajeMujer",
    nombre: "Emprendimientos y empresas de mujeres"
  },
  {
    key: "cumpleMipyme",
    puntajeKey: "puntajeMipyme",
    nombre: "Mipyme"
  }
];

function porcentajeFactor(valor, total) {
  if (!total) return 0;
  return redondear((Number(valor || 0) / Number(total || 1)) * 100, 2);
}

function interpretarFactor(tasaCumplimiento, tasaTop3 = null) {
  const tasa = Number(tasaCumplimiento || 0);
  const top = tasaTop3 === null || tasaTop3 === undefined ? null : Number(tasaTop3 || 0);

  if (top !== null && top >= 70 && tasa < 50) {
    return "Factor de alto impacto estratégico: pocos lo cumplen, pero aparece con fuerza entre los mejor ubicados.";
  }

  if (top !== null && top >= 70 && tasa >= 70) {
    return "Factor estándar competitivo: la mayoría de los mejores ubicados lo cumplen.";
  }

  if (tasa >= 80) {
    return "Factor ampliamente cumplido; no diferencia demasiado, pero perderlo puede restar competitividad.";
  }

  if (tasa >= 50) {
    return "Factor de cumplimiento medio; puede marcar diferencia si el puntaje asignado es relevante.";
  }

  return "Factor poco cumplido; puede representar oportunidad estratégica si otorga puntaje adicional.";
}

function cumpleFactorEstrategico(oferta = {}, factor = {}) {
  if (Boolean(oferta[factor.key])) return true;

  // Compatibilidad con proyectos antiguos o importados desde Excel:
  // si existe puntaje positivo en la columna oficial, se entiende que el proponente cumple el factor.
  if (factor.puntajeKey && Number(oferta[factor.puntajeKey] || 0) > 0) return true;

  return false;
}

function calcularAnalisisFactoresParaOfertas(ofertas = [], topN = 3) {
  const validas = ofertas.filter(o =>
    String(o?.empresa || "").trim() !== "" &&
    Number(o?.oferta || 0) >= 0 &&
    String(o?.observacion || "").trim().toUpperCase() !== "ELIMINADA"
  );

  const total = validas.length;

  const ordenadas = [...validas].sort((a, b) => {
    const ra = Number(a.rankingFinal || 0);
    const rb = Number(b.rankingFinal || 0);

    if (ra > 0 && rb > 0) return ra - rb;
    if (ra > 0) return -1;
    if (rb > 0) return 1;

    const diffTotal = Number(b.puntajeTotal || 0) - Number(a.puntajeTotal || 0);
    if (diffTotal !== 0) return diffTotal;

    const diffEco = Number(b.puntaje || 0) - Number(a.puntaje || 0);
    if (diffEco !== 0) return diffEco;

    return Number(a.oferta || 0) - Number(b.oferta || 0);
  });

  const top = ordenadas.slice(0, Math.min(topN, ordenadas.length));
  const ganador = ordenadas.length ? ordenadas[0] : null;

  const factores = FACTORES_ESTRATEGICOS.map(factor => {
    const cumplen = validas.filter(o => cumpleFactorEstrategico(o, factor)).length;
    const cumplenTop = top.filter(o => cumpleFactorEstrategico(o, factor)).length;
    const cumpleGanador = ganador ? cumpleFactorEstrategico(ganador, factor) : false;

    const tasaCumplimiento = porcentajeFactor(cumplen, total);
    const tasaTop3 = porcentajeFactor(cumplenTop, top.length);

    const brechaTop = redondear(tasaTop3 - tasaCumplimiento, 2);

    let prioridad = "MEDIA";

    if (brechaTop >= 25 || (tasaTop3 >= 70 && tasaCumplimiento < 60)) {
      prioridad = "ALTA";
    } else if (tasaCumplimiento >= 80 && tasaTop3 >= 80) {
      prioridad = "OBLIGATORIA";
    } else if (tasaTop3 < 40 && tasaCumplimiento < 40) {
      prioridad = "BAJA";
    }

    return {
      factor: factor.nombre,
      key: factor.key,
      totalOfertas: total,
      cumplen,
      tasaCumplimiento,
      topAnalizado: top.length,
      cumplenTop,
      tasaTop3,
      cumpleGanador,
      brechaTop,
      prioridad,
      lectura: interpretarFactor(tasaCumplimiento, tasaTop3)
    };
  });

  return {
    totalOfertas: total,
    topAnalizado: top.length,
    ganador: ganador ? ganador.empresa : "",
    factores
  };
}

// ===============================
// FACTORES ESTRATÉGICOS - PROCESO ACTUAL
// ===============================
export function calcularFactoresEstrategicosActual() {
  const resultado = calcularAnalisisFactoresParaOfertas(DB.ofertas, 3);

  if (!resultado.totalOfertas) {
    return null;
  }

  return {
    tipo: "PROCESO ACTUAL",
    ...resultado,
    lecturaGeneral:
      "Este análisis muestra qué porcentaje de proponentes cumple cada factor adicional y qué tanto esos factores aparecen entre los tres primeros lugares del proceso actual."
  };
}

// ===============================
// FACTORES ESTRATÉGICOS - HISTÓRICO
// ===============================
export function calcularFactoresEstrategicosHistorico() {
  function construirHistoricoDesdeAnalisisActual() {
    const analisisActual = calcularAnalisisFactoresParaOfertas(DB.ofertas, 3);

    if (!analisisActual || !analisisActual.totalOfertas) return null;

    return {
      tipo: "HISTÓRICO",
      procesosAnalizados: 1,
      confianza: "BAJA",
      factores: analisisActual.factores.map(f => ({
        factor: f.factor,
        key: f.key,
        totalOfertas: f.totalOfertas,
        cumplen: f.cumplen,
        tasaCumplimiento: f.tasaCumplimiento,
        totalTop3: f.topAnalizado,
        cumplenTop3: f.cumplenTop,
        tasaTop3: f.tasaTop3,
        totalGanadores: 1,
        cumplenGanadores: f.cumpleGanador ? 1 : 0,
        tasaGanadores: f.cumpleGanador ? 100 : 0,
        brechaTop: f.brechaTop,
        brechaGanador: f.cumpleGanador
          ? redondear(100 - Number(f.tasaCumplimiento || 0), 2)
          : redondear(0 - Number(f.tasaCumplimiento || 0), 2),
        proyectosConDatos: 1,
        prioridad: f.prioridad,
        lectura: f.lectura
      })),
      lecturaGeneral:
        "El histórico coincide con el proceso actual porque solo existe un proyecto registrado o porque el proyecto actual aún no se ha consolidado dentro del histórico guardado."
    };
  }

  // Caso crítico: si solo hay un proyecto, el histórico debe ser equivalente al proceso actual.
  if (!PROYECTOS || !Array.isArray(PROYECTOS.lista) || PROYECTOS.lista.length <= 1) {
    return construirHistoricoDesdeAnalisisActual();
  }

  const acumulado = {};

  FACTORES_ESTRATEGICOS.forEach(f => {
    acumulado[f.key] = {
      factor: f.nombre,
      key: f.key,
      totalOfertas: 0,
      cumplen: 0,
      totalTop3: 0,
      cumplenTop3: 0,
      totalGanadores: 0,
      cumplenGanadores: 0,
      proyectosConDatos: 0
    };
  });

  let procesosAnalizados = 0;

  PROYECTOS.lista.forEach(proyecto => {
    const data = proyecto?.data || {};

    // Si el proyecto iterado es el activo, se usa DB.ofertas para asegurar que el histórico
    // lea los datos actuales y no una copia guardada anterior sin factores.
    const ofertas = Number(proyecto?.id) === Number(PROYECTOS?.activoId)
      ? DB.ofertas
      : (Array.isArray(data.ofertas) ? data.ofertas : []);

    const analisis = calcularAnalisisFactoresParaOfertas(ofertas, 3);

    if (!analisis || !analisis.totalOfertas) return;

    procesosAnalizados++;

    analisis.factores.forEach(item => {
      const acc = acumulado[item.key];
      if (!acc) return;

      acc.totalOfertas += item.totalOfertas;
      acc.cumplen += item.cumplen;
      acc.totalTop3 += item.topAnalizado;
      acc.cumplenTop3 += item.cumplenTop;
      acc.totalGanadores += 1;
      acc.cumplenGanadores += item.cumpleGanador ? 1 : 0;
      acc.proyectosConDatos += 1;
    });
  });

  // Si hay proyectos en la lista, pero ninguno trae factores útiles, usar el proyecto actual.
  if (!procesosAnalizados) {
    return construirHistoricoDesdeAnalisisActual();
  }

  const factores = Object.values(acumulado).map(item => {
    const tasaCumplimiento = porcentajeFactor(item.cumplen, item.totalOfertas);
    const tasaTop3 = porcentajeFactor(item.cumplenTop3, item.totalTop3);
    const tasaGanadores = porcentajeFactor(item.cumplenGanadores, item.totalGanadores);
    const brechaTop = redondear(tasaTop3 - tasaCumplimiento, 2);
    const brechaGanador = redondear(tasaGanadores - tasaCumplimiento, 2);

    let prioridad = "MEDIA";

    if (brechaGanador >= 25 || brechaTop >= 25) {
      prioridad = "ALTA";
    } else if (tasaGanadores >= 80 && tasaTop3 >= 80) {
      prioridad = "OBLIGATORIA";
    } else if (tasaGanadores < 40 && tasaTop3 < 40) {
      prioridad = "BAJA";
    }

    return {
      factor: item.factor,
      key: item.key,
      totalOfertas: item.totalOfertas,
      cumplen: item.cumplen,
      tasaCumplimiento,
      totalTop3: item.totalTop3,
      cumplenTop3: item.cumplenTop3,
      tasaTop3,
      totalGanadores: item.totalGanadores,
      cumplenGanadores: item.cumplenGanadores,
      tasaGanadores,
      brechaTop,
      brechaGanador,
      proyectosConDatos: item.proyectosConDatos,
      prioridad,
      lectura: interpretarFactor(tasaCumplimiento, Math.max(tasaTop3, tasaGanadores))
    };
  });

  let confianza = "BAJA";
  if (procesosAnalizados >= 20) confianza = "ALTA";
  else if (procesosAnalizados >= 5) confianza = "MEDIA";

  return {
    tipo: "HISTÓRICO",
    procesosAnalizados,
    confianza,
    factores,
    lecturaGeneral:
      procesosAnalizados <= 1
        ? "El histórico todavía es limitado porque solo existe un proceso con información completa. Aun así, sirve como línea base inicial y mejorará al guardar más proyectos."
        : "Este análisis consolida el comportamiento de los factores adicionales en los proyectos guardados, comparando cumplimiento general, TOP 3 y ganadores."
  };
}

// ===============================
// FACTORES ESTRATÉGICOS - RESUMEN GENERAL
// ===============================
export function calcularFactoresEstrategicos() {
  return {
    actual: calcularFactoresEstrategicosActual(),
    historico: calcularFactoresEstrategicosHistorico()
  };
}

