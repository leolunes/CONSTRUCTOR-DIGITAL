(function () {

  function getFacturas(contratoId = "") {
    if (contratoId) {
      return window.AFOFacturacion.getByContrato(contratoId);
    }
    return window.AFOFacturacion.getAll();
  }

  function analyzeFactura(factura) {
    const base = Number(factura.baseGravable || 0);
    const iva = Number(factura.iva || 0);
    const total = Number(factura.valorTotal || 0);
    const tipo = String(factura.tipoGasto || "").toLowerCase();

    const hallazgos = [];

    if (base > 0 && iva === 0 && (tipo === "material" || tipo === "equipo")) {
      hallazgos.push({
        tipo: "tributario",
        nivel: "medio",
        codigo: "IVA_CERO_EN_CONCEPTO_SENSIBLE",
        mensaje: "Factura con IVA en cero en un rubro que podría requerir revisión tributaria."
      });
    }

    if (iva > base) {
      hallazgos.push({
        tipo: "tributario",
        nivel: "alto",
        codigo: "IVA_MAYOR_QUE_BASE",
        mensaje: "El IVA registrado es mayor que la base gravable reportada."
      });
    }

    if (total > 0 && base > 0 && (base + iva) !== total) {
      const diff = Math.abs((base + iva) - total);
      if (diff > 2) {
        hallazgos.push({
          tipo: "tributario",
          nivel: "medio",
          codigo: "DIFERENCIA_BASE_IVA_TOTAL",
          mensaje: "Existe diferencia entre base gravable + IVA y el valor total de la factura."
        });
      }
    }

    return hallazgos;
  }

  function analyzeByContrato(contratoId) {
    const facturas = getFacturas(contratoId);
    const resultados = [];

    facturas.forEach(factura => {
      const hallazgos = analyzeFactura(factura);
      hallazgos.forEach(h => {
        resultados.push({
          contratoId: factura.contratoId || contratoId,
          facturaId: factura.id,
          numeroFactura: factura.numeroFactura || "",
          proveedor: factura.proveedor || "",
          ...h
        });
      });
    });

    return resultados;
  }

  function buildSummary(contratoId = "") {
    const facturas = getFacturas(contratoId);

    const resumen = {
      cantidad: facturas.length,
      baseTotal: 0,
      ivaTotal: 0,
      totalFacturado: 0,
      facturasConIVA: 0,
      facturasSinIVA: 0
    };

    facturas.forEach(item => {
      const base = Number(item.baseGravable || 0);
      const iva = Number(item.iva || 0);
      const total = Number(item.valorTotal || 0);

      resumen.baseTotal += base;
      resumen.ivaTotal += iva;
      resumen.totalFacturado += total;

      if (iva > 0) {
        resumen.facturasConIVA += 1;
      } else {
        resumen.facturasSinIVA += 1;
      }
    });

    return resumen;
  }

  function renderSummaryCards(containerId = "resumenTributario", contratoId = "") {
    const resumen = buildSummary(contratoId);

    const cards = [
      { title: "Facturas con IVA", value: resumen.facturasConIVA },
      { title: "Facturas sin IVA", value: resumen.facturasSinIVA },
      { title: "IVA acumulado", value: window.AFOUI.formatMoney(resumen.ivaTotal) },
      { title: "Base gravable", value: window.AFOUI.formatMoney(resumen.baseTotal) }
    ];

    window.AFOUI.renderCards(containerId, cards);
  }

  function renderHallazgosTable(containerId = "tablaTributaria", contratoId = "") {
    const hallazgos = analyzeByContrato(contratoId);

    const columns = [
      { field: "numeroFactura", label: "Factura" },
      { field: "proveedor", label: "Proveedor" },
      { field: "nivel", label: "Nivel" },
      { field: "codigo", label: "Código" },
      { field: "mensaje", label: "Hallazgo" }
    ];

    window.AFOUI.renderTable(containerId, columns, hallazgos);
  }

  function saveFindingsAsAlerts(contratoId = "") {
    const hallazgos = analyzeByContrato(contratoId);

    hallazgos.forEach(h => {
      window.AFODB.saveAlerta({
        contratoId: h.contratoId || contratoId,
        origen: "tributario",
        nivel: h.nivel,
        titulo: h.codigo,
        detalle: h.mensaje,
        numeroFactura: h.numeroFactura || "",
        proveedor: h.proveedor || ""
      });
    });

    return hallazgos.length;
  }

  window.AFOTtributario = {
    getFacturas,
    analyzeFactura,
    analyzeByContrato,
    buildSummary,
    renderSummaryCards,
    renderHallazgosTable,
    saveFindingsAsAlerts
  };

})();