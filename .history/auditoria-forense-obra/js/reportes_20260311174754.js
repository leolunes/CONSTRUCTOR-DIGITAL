(function () {

  function getContratoInfo(contratoId) {

    const contrato = window.AFOContratos.getById(contratoId);

    if (!contrato) return null;

    return {
      numero: contrato.numeroContrato,
      nombre: contrato.nombre,
      entidad: contrato.entidad,
      contratista: contrato.contratista,
      ubicacion: contrato.ubicacion,
      valor: contrato.valorContrato,
      plazo: contrato.plazoMeses
    };

  }

  function buildTechnicalSummary(contratoId) {

    const estructura = window.AFOTecnico.calculateComposition(contratoId);

    return {
      materiales: estructura.materiales || 0,
      manoObra: estructura.manoObra || 0,
      equipos: estructura.equipos || 0,
      transportes: estructura.transportes || 0,
      otros: estructura.otros || 0,
      total: estructura.total || 0
    };

  }

  function buildFacturacionSummary(contratoId) {

    const resumen = window.AFOFacturacion.calculateSummary(contratoId);

    return resumen;

  }

  function buildCruceSummary(contratoId) {

    const cruces = window.AFOCruces.compareContrato(contratoId);

    return cruces;

  }

  function buildAlertSummary(contratoId) {

    const alertas = window.AFOAlertas.getByContrato(contratoId);

    return alertas;

  }

  function buildReportData(contratoId) {

    return {

      contrato: getContratoInfo(contratoId),

      tecnico: buildTechnicalSummary(contratoId),

      facturacion: buildFacturacionSummary(contratoId),

      cruces: buildCruceSummary(contratoId),

      alertas: buildAlertSummary(contratoId),

      narrativa: window.AFOCruces.getNarrative(contratoId),

      fechaInforme: new Date().toISOString()

    };

  }

  function renderResumen(containerId, contratoId) {

    const data = buildReportData(contratoId);

    if (!data || !data.contrato) {
      document.getElementById(containerId).innerHTML = "No existe información para generar el informe.";
      return;
    }

    const html = `

      <h3>Informe de Auditoría Técnico-Contable</h3>

      <p><strong>Contrato:</strong> ${data.contrato.numero}</p>
      <p><strong>Objeto:</strong> ${data.contrato.nombre}</p>
      <p><strong>Entidad:</strong> ${data.contrato.entidad}</p>
      <p><strong>Contratista:</strong> ${data.contrato.contratista}</p>
      <p><strong>Ubicación:</strong> ${data.contrato.ubicacion}</p>

      <hr>

      <h4>Análisis narrativo</h4>
      <p>${data.narrativa}</p>

    `;

    document.getElementById(containerId).innerHTML = html;

  }

  function renderCruces(containerId, contratoId) {

    const cruces = window.AFOCruces.compareContrato(contratoId);

    const columns = [
      { field: "componente", label: "Componente" },
      { field: "esperado", label: "Valor esperado" },
      { field: "real", label: "Valor facturado" },
      { field: "porcentaje", label: "Desviación %" },
      { field: "riesgo", label: "Nivel de riesgo" }
    ];

    const data = cruces.map(c => ({
      componente: c.componente,
      esperado: window.AFOUI.formatMoney(c.esperado),
      real: window.AFOUI.formatMoney(c.real),
      porcentaje: c.porcentaje.toFixed(2) + "%",
      riesgo: c.riesgo
    }));

    window.AFOUI.renderTable(containerId, columns, data);

  }

  function renderAlertas(containerId, contratoId) {

    const alertas = window.AFOAlertas.getByContrato(contratoId);

    const columns = [
      { field: "nivel", label: "Nivel" },
      { field: "titulo", label: "Código" },
      { field: "detalle", label: "Descripción" }
    ];

    window.AFOUI.renderTable(containerId, columns, alertas);

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

    buildReportData,

    renderResumen,

    renderCruces,

    renderAlertas,

    exportPDF

  };

})();