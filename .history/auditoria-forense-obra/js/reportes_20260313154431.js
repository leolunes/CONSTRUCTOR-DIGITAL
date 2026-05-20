(function () {

  function getContratoInfo(contratoId) {
    const contrato = window.AFOContratos ? window.AFOContratos.getById(contratoId) : null;

    if (!contrato) return null;

    return {
      id: contrato.id,
      numero: contrato.numeroContrato || "",
      nombre: contrato.nombre || "",
      objeto: contrato.objeto || "",
      entidad: contrato.entidad || "",
      contratista: contrato.contratista || "",
      ubicacion: contrato.ubicacion || "",
      valor: Number(contrato.valorContrato || 0),
      plazo: Number(contrato.plazoMeses || 0),
      estado: contrato.estado || ""
    };
  }

  function buildBaseSummary(contratoId) {
    const baseItems = window.AFOBaseImport
      ? window.AFOBaseImport.getAll().filter(item => item.contratoId === contratoId)
      : [];

    let valorTotal = 0;
    const tipos = {
      material: 0,
      mano_obra: 0,
      equipo: 0,
      transporte: 0,
      otro: 0
    };

    baseItems.forEach(item => {
      valorTotal += Number(item.valorParcial || 0);
      const tipo = (item.tipo || "otro").toLowerCase();
      if (tipos[tipo] !== undefined) {
        tipos[tipo] += 1;
      } else {
        tipos.otro += 1;
      }
    });

    return {
      totalItems: baseItems.length,
      valorTotal,
      materiales: tipos.material,
      manoObra: tipos.mano_obra,
      equipos: tipos.equipo,
      transportes: tipos.transporte,
      otros: tipos.otro
    };
  }

  function buildPresupuestoSummary(contratoId) {
    const items = window.AFOPresupuesto
      ? window.AFOPresupuesto.getByContrato(contratoId)
      : [];

    let valorTotal = 0;
    let cantidadTotal = 0;

    items.forEach(item => {
      valorTotal += Number(item.valorParcial || 0);
      cantidadTotal += Number(item.cantidad || 0);
    });

    return {
      totalItems: items.length,
      cantidadTotal,
      valorTotal,
      items
    };
  }

  function buildTechnicalSummary(contratoId) {
    const estructura = window.AFOTecnico
      ? window.AFOTecnico.calculateComposition(contratoId)
      : {
          materiales: 0,
          manoObra: 0,
          equipos: 0,
          transportes: 0,
          otros: 0,
          total: 0
        };

    const porcentajes = window.AFOTecnico
      ? window.AFOTecnico.getExpectedStructure(contratoId)
      : {
          materiales: 0,
          manoObra: 0,
          equipos: 0,
          transportes: 0,
          otros: 0
        };

    return {
      materiales: Number(estructura.materiales || 0),
      manoObra: Number(estructura.manoObra || 0),
      equipos: Number(estructura.equipos || 0),
      transportes: Number(estructura.transportes || 0),
      otros: Number(estructura.otros || 0),
      total: Number(estructura.total || 0),
      porcentajes
    };
  }

  function buildFacturacionSummary(contratoId) {
    const resumen = window.AFOFacturacion
      ? window.AFOFacturacion.calculateSummary(contratoId)
      : {
          materiales: 0,
          manoObra: 0,
          equipos: 0,
          transportes: 0,
          otros: 0,
          iva: 0,
          total: 0,
          cantidad: 0
        };

    return {
      materiales: Number(resumen.materiales || 0),
      manoObra: Number(resumen.manoObra || 0),
      equipos: Number(resumen.equipos || 0),
      transportes: Number(resumen.transportes || 0),
      otros: Number(resumen.otros || 0),
      iva: Number(resumen.iva || 0),
      total: Number(resumen.total || 0),
      cantidad: Number(resumen.cantidad || 0)
    };
  }

  function buildCruceSummary(contratoId) {
    return window.AFOCruces ? window.AFOCruces.compareContrato(contratoId) : [];
  }

  function buildCruceExecutiveSummary(contratoId) {
    return window.AFOCruces
      ? window.AFOCruces.buildExecutiveSummary(contratoId)
      : {
          totalComponentes: 0,
          bajos: 0,
          medios: 0,
          altos: 0,
          criticos: 0,
          desviacionGlobal: 0,
          valorEsperado: 0,
          valorFacturado: 0
        };
  }

  function buildAlertSummary(contratoId) {
    const alertas = window.AFOAlertas ? window.AFOAlertas.getByContrato(contratoId) : [];

    const resumen = {
      total: alertas.length,
      activas: 0,
      bajas: 0,
      medias: 0,
      altas: 0,
      criticas: 0,
      items: alertas
    };

    alertas.forEach(alerta => {
      if ((alerta.estado || "").toLowerCase() === "activa") {
        resumen.activas += 1;
      }

      switch ((alerta.nivel || "").toLowerCase()) {
        case "bajo":
          resumen.bajas += 1;
          break;
        case "medio":
          resumen.medias += 1;
          break;
        case "alto":
          resumen.altas += 1;
          break;
        default:
          resumen.criticas += 1;
          break;
      }
    });

    return resumen;
  }

  function buildRiskPanel(contratoId) {
    const advanced = window.AFOCruces
      ? window.AFOCruces.buildAdvancedIndicators(contratoId)
      : {
          riesgoGlobal: "bajo",
          excesoTransportes: null,
          desvioMateriales: null,
          desvioEquipos: null
        };

    return {
      riesgoGlobal: advanced.riesgoGlobal || "bajo",
      excesoTransportes: advanced.excesoTransportes,
      desvioMateriales: advanced.desvioMateriales,
      desvioEquipos: advanced.desvioEquipos
    };
  }

  function buildNarrative(contratoId) {
    return window.AFOCruces
      ? window.AFOCruces.getNarrative(contratoId)
      : "No existe información suficiente para generar el análisis narrativo del informe.";
  }

  function buildReportData(contratoId) {
    return {
      contrato: getContratoInfo(contratoId),
      baseImportada: buildBaseSummary(contratoId),
      presupuesto: buildPresupuestoSummary(contratoId),
      tecnico: buildTechnicalSummary(contratoId),
      facturacion: buildFacturacionSummary(contratoId),
      cruces: buildCruceSummary(contratoId),
      crucesResumen: buildCruceExecutiveSummary(contratoId),
      alertas: buildAlertSummary(contratoId),
      riesgo: buildRiskPanel(contratoId),
      narrativa: buildNarrative(contratoId),
      fechaInforme: new Date().toISOString()
    };
  }

  function renderResumen(containerId, contratoId) {
    const data = buildReportData(contratoId);
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!data || !data.contrato) {
      container.innerHTML = "No existe información para generar el informe.";
      return;
    }

    const html = `
      <div class="info-box">
        <p><strong>Contrato:</strong> ${data.contrato.numero}</p>
        <p><strong>Nombre:</strong> ${data.contrato.nombre}</p>
        <p><strong>Entidad:</strong> ${data.contrato.entidad}</p>
        <p><strong>Contratista:</strong> ${data.contrato.contratista}</p>
        <p><strong>Ubicación:</strong> ${data.contrato.ubicacion}</p>
        <p><strong>Valor contractual:</strong> ${window.AFOUI.formatMoney(data.contrato.valor)}</p>
        <p><strong>Plazo:</strong> ${data.contrato.plazo} mes(es)</p>
        <p><strong>Riesgo global estimado:</strong> ${String(data.riesgo.riesgoGlobal || "").toUpperCase()}</p>
      </div>

      <div class="info-box mt-16">
        <strong>Base técnica y presupuesto auditado:</strong>
        <p>La base importada contiene ${data.baseImportada.totalItems} ítems y el presupuesto construido del contrato contiene ${data.presupuesto.totalItems} ítems con valor acumulado de ${window.AFOUI.formatMoney(data.presupuesto.valorTotal)}.</p>
      </div>

      <div class="info-box mt-16">
        <strong>Análisis narrativo:</strong>
        <p>${data.narrativa}</p>
      </div>
    `;

    container.innerHTML = html;
  }

  function renderCruces(containerId, contratoId) {
    const cruces = buildCruceSummary(contratoId);

    const columns = [
      { field: "componente", label: "Componente" },
      { field: "esperado", label: "Valor esperado" },
      { field: "real", label: "Valor facturado" },
      { field: "diferencia", label: "Diferencia" },
      { field: "porcentaje", label: "Desviación %" },
      { field: "riesgo", label: "Nivel de riesgo" }
    ];

    const data = cruces.map(c => ({
      componente: c.componente,
      esperado: window.AFOUI.formatMoney(c.esperado),
      real: window.AFOUI.formatMoney(c.real),
      diferencia: window.AFOUI.formatMoney(c.diferencia),
      porcentaje: Number(c.porcentaje || 0).toFixed(2) + "%",
      riesgo: c.riesgo
    }));

    window.AFOUI.renderTable(containerId, columns, data);
  }

  function renderAlertas(containerId, contratoId) {
    const alertas = buildAlertSummary(contratoId).items || [];

    const columns = [
      { field: "nivel", label: "Nivel" },
      { field: "titulo", label: "Código" },
      { field: "origen", label: "Origen" },
      { field: "detalle", label: "Descripción" },
      { field: "estado", label: "Estado" }
    ];

    const data = alertas.map(item => ({
      nivel: item.nivel || "",
      titulo: item.titulo || "",
      origen: item.origen || "",
      detalle: item.detalle || "",
      estado: item.estado || ""
    }));

    window.AFOUI.renderTable(containerId, columns, data);
  }

  function renderExecutiveCards(containerId, contratoId) {
    const data = buildReportData(contratoId);

    const cards = [
      { title: "Base importada", value: data.baseImportada.totalItems },
      { title: "Ítems presupuesto", value: data.presupuesto.totalItems },
      { title: "Facturas", value: data.facturacion.cantidad },
      { title: "Alertas", value: data.alertas.total }
    ];

    window.AFOUI.renderCards(containerId, cards);
  }

  function exportPDF(contratoId) {
    const data = buildReportData(contratoId);

    if (!window.AFOPDF) {
      alert("Módulo PDF no disponible.");
      return;
    }

    window.AFOPDF.generateReport(data);
  }

  window.AFOReportes = {
    getContratoInfo,
    buildBaseSummary,
    buildPresupuestoSummary,
    buildTechnicalSummary,
    buildFacturacionSummary,
    buildCruceSummary,
    buildCruceExecutiveSummary,
    buildAlertSummary,
    buildRiskPanel,
    buildNarrative,
    buildReportData,
    renderResumen,
    renderCruces,
    renderAlertas,
    renderExecutiveCards,
    exportPDF
  };

})();