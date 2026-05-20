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
export function calcularValoresBaseEconomicos(ofertasCustom = null) {
  const valores = (Array.isArray(ofertasCustom)
    ? ofertasCustom
    : obtenerOfertasEvaluablesEconomicamente()
  )
    .map(o => Number(o.oferta))
    .filter(v => v > 0);

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
// 🔥 VALOR COMPETITIVO SUGERIDO (NIVEL EXPERTO)
// ===============================
export function calcularValorCompetitivo() {

  const presupuesto = Number(DB.proceso.presupuesto || 0);
  if (!presupuesto) {
    return null;
  }

  const ofertas = obtenerOfertasEvaluablesEconomicamente();
  if (!ofertas.length) return null;

  const porcentajes = ofertas.map(o => (Number(o.oferta) / presupuesto) * 100);

  const prom = promedio(porcentajes);
  const med = mediana(porcentajes);

  const desviacion = Math.sqrt(
    promedio(porcentajes.map(p => Math.pow(p - prom, 2)))
  );

  let mejor = null;

  for (let p = 88; p >= 80; p -= 0.2) {
    const valorSimulado = (p / 100) * presupuesto;

    let sumaPosiciones = 0;
    let evaluaciones = 0;

    ["MEDIANA","GEOMETRICA","ARITMETICA_BAJA","MENOR_VALOR"].forEach(metodo => {

      const ofertasSim = [
        ...ofertas.map(o => ({ ...o })),
        {
          id: -999,
          empresa: "SIMULADO",
          oferta: valorSimulado,
          cumpleCalidad: true,
          cumpleIndustria: true,
          cumpleDiscapacidad: true,
          cumpleMujer: true,
          cumpleMipyme: true
        }
      ];

      const bases = calcularValoresBaseEconomicos(ofertasSim);

      const tabla = ofertasSim.map(o => {
        const puntaje = calcularPuntajeSegunMetodo(
          o.oferta,
          metodo,
          Number(DB.proceso.puntajeMaximo || 0),
          bases
        );

        return {
          ...o,
          puntaje
        };
      }).sort((a,b)=>b.puntaje-a.puntaje);

      const pos = tabla.findIndex(o=>o.id===-999)+1;

      if (pos > 0) {
        sumaPosiciones += pos;
        evaluaciones++;
      }

    });

    const promedioPos = sumaPosiciones / evaluaciones;

    if (!mejor || promedioPos < mejor.promedioPos) {
      mejor = {
        porcentaje: p,
        promedioPos
      };
    }
  }

  if (!mejor) return null;

  const desviacionSugerida = mejor.porcentaje - 100;

  return {
    desviacionSugerida: Number(desviacionSugerida.toFixed(2)),
    valorPesos: Math.round((mejor.porcentaje / 100) * presupuesto),
    rango: [
      Number((desviacionSugerida + 0.5).toFixed(2)),
      Number((desviacionSugerida - 0.5).toFixed(2))
    ],
    robustez: mejor.promedioPos <= 2 ? "ALTA" : mejor.promedioPos <= 4 ? "MEDIA" : "BAJA",
    riesgo: desviacionSugerida < -8 ? "ALTO" : desviacionSugerida < -5 ? "MEDIO" : "BAJO"
  };
}
