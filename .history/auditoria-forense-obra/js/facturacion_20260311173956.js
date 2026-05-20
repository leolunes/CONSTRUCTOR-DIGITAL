(function () {

  function getAll() {
    return window.AFODB.getFacturas();
  }

  function getByContrato(contratoId) {
    return window.AFODB.getFacturasByContrato(contratoId);
  }

  function create(data) {
    const factura = {
      contratoId: data.contratoId || "",
      numeroFactura: data.numeroFactura || "",
      proveedor: data.proveedor || "",
      concepto: data.concepto || "",
      tipoGasto: data.tipoGasto || "otros",
      baseGravable: Number(data.baseGravable || 0),
      iva: Number(data.iva || 0),
      valorTotal: Number(data.valorTotal || 0),
      fechaFactura: data.fechaFactura || "",
      observaciones: data.observaciones || ""
    };

    return window.AFODB.saveFactura(factura);
  }

  function update(id, data) {
    return window.AFODB.updateFactura(id, data);
  }

  function remove(id) {
    return window.AFODB.deleteFactura(id);
  }

  function calculateSummary(contratoId) {
    const facturas = contratoId ? getByContrato(contratoId) : getAll();

    const resumen = {
      materiales: 0,
      manoObra: 0,
      equipos: 0,
      transportes: 0,
      otros: 0,
      iva: 0,
      total: 0,
      cantidad: facturas.length
    };

    facturas.forEach(item => {
      const valor = Number(item.valorTotal || 0);
      const iva = Number(item.iva || 0);

      resumen.total += valor;
      resumen.iva += iva;

      switch ((item.tipoGasto || "").toLowerCase()) {
        case "material":
          resumen.materiales += valor;
          break;
        case "mano_obra":
          resumen.manoObra += valor;
          break;
        case "equipo":
          resumen.equipos += valor;
          break;
        case "transporte":
          resumen.transportes += valor;
          break;
        default:
          resumen.otros += valor;
          break;
      }
    });

    return resumen;
  }

  function buildTableData(facturas) {
    return facturas.map(item => ({
      fechaFactura: item.fechaFactura || "",
      numeroFactura: item.numeroFactura || "",
      proveedor: item.proveedor || "",
      concepto: item.concepto || "",
      tipoGasto: item.tipoGasto || "",
      baseGravable: window.AFOUI.formatMoney(item.baseGravable || 0),
      iva: window.AFOUI.formatMoney(item.iva || 0),
      valorTotal: window.AFOUI.formatMoney(item.valorTotal || 0)
    }));
  }

  function renderTable(containerId = "tablaFacturas", contratoId = "") {
    const facturas = contratoId ? getByContrato(contratoId) : getAll();

    const columns = [
      { field: "fechaFactura", label: "Fecha" },
      { field: "numeroFactura", label: "Factura" },
      { field: "proveedor", label: "Proveedor" },
      { field: "concepto", label: "Concepto" },
      { field: "tipoGasto", label: "Tipo gasto" },
      { field: "baseGravable", label: "Base" },
      { field: "iva", label: "IVA" },
      { field: "valorTotal", label: "Total" }
    ];

    const data = buildTableData(facturas);
    window.AFOUI.renderTable(containerId, columns, data);
  }

  function renderCards(containerId = "resumenFacturas", contratoId = "") {
    const resumen = calculateSummary(contratoId);

    const cards = [
      { title: "Facturas cargadas", value: resumen.cantidad },
      { title: "Valor total", value: window.AFOUI.formatMoney(resumen.total) },
      { title: "IVA total", value: window.AFOUI.formatMoney(resumen.iva) },
      { title: "Transportes", value: window.AFOUI.formatMoney(resumen.transportes) }
    ];

    window.AFOUI.renderCards(containerId, cards);
  }

  function bindForm(formId = "formFactura") {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const data = {
        contratoId: form.contratoId.value,
        numeroFactura: form.numeroFactura.value.trim(),
        proveedor: form.proveedor.value.trim(),
        concepto: form.concepto.value.trim(),
        tipoGasto: form.tipoGasto.value,
        baseGravable: form.baseGravable.value,
        iva: form.iva.value,
        valorTotal: form.valorTotal.value,
        fechaFactura: form.fechaFactura.value,
        observaciones: form.observaciones.value.trim()
      };

      if (!data.contratoId || !data.numeroFactura || !data.proveedor) {
        window.AFOUI.showMessage("Debe diligenciar contrato, número de factura y proveedor.", "error");
        return;
      }

      create(data);
      form.reset();

      window.AFOUI.showMessage("Factura registrada correctamente.", "success");

      renderTable();
      renderCards();

      if (window.AFOApp && typeof window.AFOApp.updateDashboard === "function") {
        window.AFOApp.updateDashboard();
      }
    });
  }

  function seedDemoData() {
    const facturas = getAll();
    if (facturas.length > 0) return;

    const contratos = window.AFODB.getContracts();
    if (!contratos.length) return;

    const contratoId = contratos[0].id;

    create({
      contratoId,
      numeroFactura: "FV-001",
      proveedor: "Materiales Santander SAS",
      concepto: "Suministro de cemento y agregados",
      tipoGasto: "material",
      baseGravable: 12000000,
      iva: 2280000,
      valorTotal: 14280000,
      fechaFactura: "2026-03-01",
      observaciones: ""
    });

    create({
      contratoId,
      numeroFactura: "FV-002",
      proveedor: "Transportes del Oriente",
      concepto: "Acarreo de material pétreo",
      tipoGasto: "transporte",
      baseGravable: 5000000,
      iva: 0,
      valorTotal: 5000000,
      fechaFactura: "2026-03-03",
      observaciones: ""
    });
  }

  function initPage() {
    seedDemoData();
    renderTable();
    renderCards();
    bindForm();
  }

  window.AFOFacturacion = {
    getAll,
    getByContrato,
    create,
    update,
    remove,
    calculateSummary,
    renderTable,
    renderCards,
    bindForm,
    initPage
  };

})();