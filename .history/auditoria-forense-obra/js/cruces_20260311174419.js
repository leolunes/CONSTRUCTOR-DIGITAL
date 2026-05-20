(function () {

  function buildExpectedValues(contratoId) {
    const contrato = window.AFOContratos.getById(contratoId);
    const estructura = window.AFOTecnico.getExpectedStructure(contratoId);

    const valorContrato = Number(contrato?.valorContrato || 0);

    return {
      materiales: valorContrato * ((estructura.materiales || 0) / 100),
      manoObra: valorContrato * ((estructura.manoObra || 0) / 100),
      equipos: valorContrato * ((estructura.equipos || 0) / 100),
      transportes: valorContrato * ((estructura.transportes || 0) / 100),
      otros: valorContrato * ((estructura.otros || 0) / 100),
      total: valorContrato
    };
  }

  function buildActualValues(contratoId) {
    const resumen = window.AFOFacturacion.calculateSummary(contratoId);

    return {
      materiales: Number(resumen.materiales || 0),
      manoObra: Number(resumen.manoObra || 0),
      equipos: Number(resumen.equipos || 0),
      transportes: Number(resumen.transportes || 0),
      otros: Number(resumen.otros || 0),
      total: Number(resumen.total || 0),
      iva: Number(resumen.iva || 0)
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
      criticos: 0
    };

    cruces.forEach(item => {
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

    return resumen;
  }

  function renderCrucesTable(containerId = "tablaCruces", contratoId = "") {
    if (!contratoId) {
      window.AFOUI.renderTable(containerId, [
        { field: "mensaje", label: "Información" }
      ], [{ mensaje: "Seleccione o defina un contrato para analizar." }]);
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
      porcentaje: item.porcentaje.toFixed(2) + " %",
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

  function saveAsAlerts(contratoId) {
    const cruces = compareContrato(contratoId);
    let total = 0;

    cruces.forEach(item => {
      if (item.riesgo === "bajo") return;

      let titulo = "";
      let detalle = "";

      if (item.componente === "transportes" && item.riesgo !== "bajo") {
        titulo = "DESVIACION_TRANSPORTES";
        detalle = "El valor facturado en transportes presenta desviación relevante frente a la estructura técnica esperada.";
      } else if (item.componente === "materiales" && item.riesgo !== "bajo") {
        titulo = "DESVIACION_MATERIALES";
        detalle = "El valor facturado en materiales presenta desviación relevante frente a la composición técnica del contrato.";
      } else if (item.componente === "equipos" && item.riesgo !== "bajo") {
        titulo = "DESVIACION_EQUIPOS";
        detalle = "El valor facturado en equipos presenta desviación relevante frente a lo técnicamente esperado.";
      } else if (item.componente === "manoObra" && item.riesgo !== "bajo") {
        titulo = "DESVIACION_MANO_OBRA";
        detalle = "El valor facturado en mano de obra presenta desviación relevante frente a la estructura esperada.";
      } else {
        titulo = "DESVIACION_OTROS";
        detalle = "El componente analizado presenta desviación importante frente a la estructura técnica estimada.";
      }

      window.AFODB.saveAlerta({
        contratoId,
        origen: "cruce_tecnico_contable",
        nivel: item.riesgo,
        titulo,
        detalle,
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
    const cruces = compareContrato(contratoId);

    if (!cruces.length) {
      return "No existen datos suficientes para elaborar el análisis comparativo.";
    }

    const relevantes = cruces.filter(c => c.riesgo === "alto" || c.riesgo === "critico" || c.riesgo === "medio");

    if (!relevantes.length) {
      return "La comparación inicial no muestra desviaciones relevantes entre la estructura técnica estimada y la facturación registrada.";
    }

    const nombres = relevantes.map(r => r.componente).join(", ");

    return "La comparación entre la estructura técnica del contrato y la facturación registrada evidencia desviaciones en los componentes: " + nombres + ". Estos resultados sugieren la necesidad de revisión documental, tributaria y contable por parte del auditor o revisor fiscal.";
  }

  window.AFOCruces = {
    buildExpectedValues,
    buildActualValues,
    compareContrato,
    buildExecutiveSummary,
    renderCrucesTable,
    renderSummaryCards,
    saveAsAlerts,
    getNarrative
  };

})();