(function () {

  function getAll() {
    return window.AFODB.getAlertas();
  }

  function getByContrato(contratoId) {
    return window.AFODB.getAlertasByContrato(contratoId);
  }

  function create(data) {

    const alerta = {
      contratoId: data.contratoId || "",
      origen: data.origen || "sistema",
      nivel: data.nivel || "medio",
      titulo: data.titulo || "",
      detalle: data.detalle || "",
      componente: data.componente || "",
      numeroFactura: data.numeroFactura || "",
      proveedor: data.proveedor || "",
      fecha: new Date().toISOString(),
      estado: "activa"
    };

    return window.AFODB.saveAlerta(alerta);

  }

  function update(id, data) {
    return window.AFODB.updateAlerta(id, data);
  }

  function close(id) {
    return update(id, {
      estado: "cerrada",
      fechaCierre: new Date().toISOString()
    });
  }

  function remove(id) {
    return window.AFODB.deleteAlerta(id);
  }

  function buildTableData(alertas) {

    return alertas.map(item => ({

      fecha: new Date(item.fecha).toLocaleDateString("es-CO"),

      origen: item.origen || "",

      nivel: item.nivel || "",

      titulo: item.titulo || "",

      detalle: item.detalle || "",

      estado: item.estado || ""

    }));

  }

  function renderTable(containerId = "tablaAlertas", contratoId = "") {

    const alertas = contratoId ? getByContrato(contratoId) : getAll();

    const columns = [
      { field: "fecha", label: "Fecha" },
      { field: "origen", label: "Origen" },
      { field: "nivel", label: "Nivel" },
      { field: "titulo", label: "Código" },
      { field: "detalle", label: "Detalle" },
      { field: "estado", label: "Estado" }
    ];

    const data = buildTableData(alertas);

    window.AFOUI.renderTable(containerId, columns, data);

  }

  function buildSummary(contratoId = "") {

    const alertas = contratoId ? getByContrato(contratoId) : getAll();

    const resumen = {
      total: alertas.length,
      activas: 0,
      bajas: 0,
      medias: 0,
      altas: 0,
      criticas: 0
    };

    alertas.forEach(a => {

      if (a.estado === "activa") resumen.activas++;

      switch ((a.nivel || "").toLowerCase()) {

        case "bajo":
          resumen.bajas++;
          break;

        case "medio":
          resumen.medias++;
          break;

        case "alto":
          resumen.altas++;
          break;

        default:
          resumen.criticas++;
          break;

      }

    });

    return resumen;

  }

  function renderCards(containerId = "resumenAlertas", contratoId = "") {

    const r = buildSummary(contratoId);

    const cards = [

      { title: "Total alertas", value: r.total },

      { title: "Alertas activas", value: r.activas },

      { title: "Riesgo alto", value: r.altas },

      { title: "Riesgo crítico", value: r.criticas }

    ];

    window.AFOUI.renderCards(containerId, cards);

  }

  function generateFromAnalysis(contratoId) {

    let total = 0;

    if (window.AFOCruces) {
      total += window.AFOCruces.saveAsAlerts(contratoId);
    }

    if (window.AFOTtributario) {
      total += window.AFOTtributario.saveFindingsAsAlerts(contratoId);
    }

    return total;

  }

  function clearAll() {

    const alertas = getAll();

    alertas.forEach(a => {
      window.AFODB.deleteAlerta(a.id);
    });

  }

  function initPage() {

    renderTable();
    renderCards();

  }

  window.AFOAlertas = {

    getAll,
    getByContrato,
    create,
    update,
    close,
    remove,
    renderTable,
    renderCards,
    generateFromAnalysis,
    clearAll,
    initPage

  };

})();