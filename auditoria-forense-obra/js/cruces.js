(function () {

  function getContrato(contratoId) {
    if (!window.AFOContratos) return null;
    return window.AFOContratos.getById(contratoId);
  }

  function buildExpectedValues(contratoId) {
    const comp = window.AFOTecnico
      ? window.AFOTecnico.calculateComposition(contratoId)
      : {
          materiales: 0,
          manoObra: 0,
          equipos: 0,
          transportes: 0,
          otros: 0,
          total: 0
        };

    return {
      materiales: Number(comp.materiales || 0),
      manoObra: Number(comp.manoObra || 0),
      equipos: Number(comp.equipos || 0),
      transportes: Number(comp.transportes || 0),
      otros: Number(comp.otros || 0),
      total: Number(comp.total || 0)
    };
  }

  function buildActualValues(contratoId) {
    const resumen = window.AFOFacturacion
      ? window.AFOFacturacion.calculateSummary(contratoId)
      : {
          materiales: 0,
          manoObra: 0,
          equipos: 0,
          transportes: 0,
          otros: 0,
          iva: 0,
          total: 0
        };

    return {
      materiales: Number(resumen.materiales || 0),
      manoObra: Number(resumen.manoObra || 0),
      equipos: Number(resumen.equipos || 0),
      transportes: Number(resumen.transportes || 0),
      otros: Number(resumen.otros || 0),
      iva: Number(resumen.iva || 0),
      total: Number(resumen.total || 0)
    };
  }

  function compareComponent(name, expected, actual, contratoId) {
    const analisis = window.AFOCalc.analyzeDeviation(expected, actual);

    return {
      contratoId,
      componente: name,
      esperado: Number(expected || 0),
      real: Number(actual || 0),
      diferencia: Number(analisis.diferencia || 0),
      porcentaje: Number(analisis.porcentaje || 0),
      riesgo: analisis.riesgo || "bajo"
    };
  }

  function compareContrato(contratoId) {
    const expected = buildExpectedValues(contratoId);
    const actual = buildActualValues(contratoId);

    return [
      compareComponent("materiales", expected.materiales, actual.materiales, contratoId),
      compareComponent("manoObra", expected.manoObra, actual.manoObra, contratoId),
      compareComponent("equipos", expected.equipos, actual.equipos, contratoId),
      compareComponent("transportes", expected.transportes, actual.transportes, contratoId),
      compareComponent("otros", expected.otros, actual.otros, contratoId)
    ];
  }

  function buildExecutiveSummary(contratoId) {
    const cruces = compareContrato(contratoId);

    const resumen = {
      contratoId,
      totalComponentes: cruces.length,
      bajos: 0,
      medios: 0,
      altos: 0,
      criticos: 0,
      desviacionGlobal: 0,
      valorEsperado: 0,
      valorFacturado: 0
    };

    cruces.forEach(item => {
      resumen.valorEsperado += Number(item.esperado || 0);
      resumen.valorFacturado += Number(item.real || 0);

      switch ((item.riesgo || "").toLowerCase()) {
        case "bajo":
          resumen.bajos += 1;
          break;
        case "medio":
          resumen.medios += 1;
          break;
        case "alto":
          resumen.altos += 1;
          break;
        default:
          resumen.criticos += 1;
          break;
      }
    });

    resumen.desviacionGlobal = Number(resumen.valorFacturado || 0) - Number(resumen.valorEsperado || 0);

    return resumen;
  }

  function renderCrucesTable(containerId = "tablaCruces", contratoId = "") {
    if (!contratoId) {
      window.AFOUI.renderTable(
        containerId,
        [{ field: "mensaje", label: "Información" }],
        [{ mensaje: "Seleccione un contrato para analizar." }]
      );
      return;
    }

    const cruces = compareContrato(contratoId);

    const columns = [
      { field: "componente", label: "Componente" },
      { field: "esperado", label: "Esperado" },
      { field: "real", label: "Real" },
      { field: "diferencia", label: "Diferencia" },
      { field: "porcentaje", label: "Desviación %" },
      { field: "riesgo", label: "Riesgo" }
    ];

    const data = cruces.map(item => ({
      componente: item.componente,
      esperado: window.AFOUI.formatMoney(item.esperado),
      real: window.AFOUI.formatMoney(item.real),
      diferencia: window.AFOUI.formatMoney(item.diferencia),
      porcentaje: Number(item.porcentaje || 0).toFixed(2) + " %",
      riesgo: item.riesgo
    }));

    window.AFOUI.renderTable(containerId, columns, data);
  }

  function renderSummaryCards(containerId = "resumenCruces", contratoId = "") {
    if (!contratoId) {
      window.AFOUI.renderCards(containerId, []);
      return;
    }

    const resumen = buildExecutiveSummary(contratoId);

    const cards = [
      { title: "Riesgo bajo", value: resumen.bajos },
      { title: "Riesgo medio", value: resumen.medios },
      { title: "Riesgo alto", value: resumen.altos },
      { title: "Riesgo crítico", value: resumen.criticos }
    ];

    window.AFOUI.renderCards(containerId, cards);
  }

  function buildAlertDetail(item) {
    let titulo = "DESVIACION_OTROS";
    let detalle = "El componente analizado presenta desviación importante frente a la estructura técnica estimada.";

    if (item.componente === "transportes") {
      titulo = "DESVIACION_TRANSPORTES";
      detalle = "La facturación en transportes presenta desviación relevante frente a la estructura técnica esperada del contrato.";
    } else if (item.componente === "materiales") {
      titulo = "DESVIACION_MATERIALES";
      detalle = "La facturación en materiales presenta desviación relevante frente a la composición técnica del presupuesto auditado.";
    } else if (item.componente === "equipos") {
      titulo = "DESVIACION_EQUIPOS";
      detalle = "La facturación en equipos presenta desviación relevante frente a lo técnicamente esperado en el presupuesto.";
    } else if (item.componente === "manoObra") {
      titulo = "DESVIACION_MANO_OBRA";
      detalle = "La facturación en mano de obra presenta desviación relevante frente a la estructura esperada del contrato.";
    } else if (item.componente === "otros") {
      titulo = "DESVIACION_OTROS_COSTOS";
      detalle = "El rubro otros presenta desviación relevante frente al presupuesto técnico construido.";
    }

    return { titulo, detalle };
  }

  function saveAsAlerts(contratoId) {
    const cruces = compareContrato(contratoId);
    let total = 0;

    cruces.forEach(item => {
      if ((item.riesgo || "").toLowerCase() === "bajo") return;

      const alertData = buildAlertDetail(item);

      window.AFODB.saveAlerta({
        contratoId,
        origen: "cruce_tecnico_contable",
        nivel: item.riesgo,
        titulo: alertData.titulo,
        detalle: alertData.detalle,
        componente: item.componente,
        esperado: item.esperado,
        real: item.real,
        diferencia: item.diferencia,
        porcentaje: item.porcentaje
      });

      total += 1;
    });

    return total;
  }

  function getNarrative(contratoId) {
    const contrato = getContrato(contratoId);
    const cruces = compareContrato(contratoId);

    if (!contrato) {
      return "No existe información suficiente del contrato para generar el análisis narrativo.";
    }

    if (!cruces.length) {
      return "No existen datos suficientes para elaborar el análisis comparativo del contrato.";
    }

    const relevantes = cruces.filter(item => {
      const r = (item.riesgo || "").toLowerCase();
      return r === "medio" || r === "alto" || r === "critico";
    });

    if (!relevantes.length) {
      return "La comparación entre el presupuesto técnico construido y la facturación registrada no muestra, por ahora, desviaciones relevantes que ameriten observación especial.";
    }

    const nombres = relevantes.map(r => r.componente).join(", ");
    return "La comparación entre el presupuesto técnico construido para el contrato " +
      (contrato.numeroContrato || "") +
      " y la facturación registrada evidencia desviaciones en los componentes: " +
      nombres +
      ". Estos resultados sugieren la necesidad de revisión documental, tributaria y contable por parte del auditor o revisor fiscal, con énfasis en verificar la razonabilidad de los soportes frente a la composición técnica real de la obra.";
  }

  function buildAdvancedIndicators(contratoId) {
    const expected = buildExpectedValues(contratoId);
    const actual = buildActualValues(contratoId);
    const cruces = compareContrato(contratoId);

    const excesoTransportes = cruces.find(c => c.componente === "transportes") || null;
    const desvioMateriales = cruces.find(c => c.componente === "materiales") || null;
    const desvioEquipos = cruces.find(c => c.componente === "equipos") || null;

    return {
      expected,
      actual,
      excesoTransportes,
      desvioMateriales,
      desvioEquipos,
      riesgoGlobal: deriveGlobalRisk(cruces)
    };
  }

  function deriveGlobalRisk(cruces) {
    let score = 0;

    cruces.forEach(item => {
      const r = (item.riesgo || "").toLowerCase();
      if (r === "medio") score += 2;
      else if (r === "alto") score += 4;
      else if (r === "critico") score += 6;
    });

    if (score <= 2) return "bajo";
    if (score <= 6) return "medio";
    if (score <= 12) return "alto";
    return "critico";
  }

  window.AFOCruces = {
    getContrato,
    buildExpectedValues,
    buildActualValues,
    compareContrato,
    buildExecutiveSummary,
    renderCrucesTable,
    renderSummaryCards,
    saveAsAlerts,
    getNarrative,
    buildAdvancedIndicators,
    deriveGlobalRisk
  };

})();