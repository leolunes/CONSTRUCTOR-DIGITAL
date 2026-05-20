(function () {

  function getManualItems(contratoId) {
    const analisis = window.AFODB.getAnalisisByContrato(contratoId);
    if (!analisis || !analisis.length) return [];
    return analisis;
  }

  function addManualItem(data) {
    const item = {
      contratoId: data.contratoId || "",
      codigo: data.codigo || "",
      descripcion: data.descripcion || "",
      tipo: data.tipo || "material",
      valor: Number(data.valor || 0),
      unidad: data.unidad || "",
      cantidad: Number(data.cantidad || 0),
      origen: "manual"
    };

    return window.AFODB.saveAnalisis(item);
  }

  function removeManualItem(id) {
    const list = window.AFODB.getAnalisis();
    const filtered = list.filter(i => i.id !== id);
    window.AFOStorage.set("analisis", filtered);
  }

  function getPresupuestoItems(contratoId) {
    if (!window.AFOPresupuesto) return [];
    return window.AFOPresupuesto.getByContrato(contratoId);
  }

  function getTechnicalRowsFromPresupuesto(contratoId) {
    const presupuesto = getPresupuestoItems(contratoId);

    return presupuesto.map(item => {
      const base = window.AFOPresupuesto.getBaseItemById(item.baseItemId);

      return {
        id: item.id,
        contratoId: item.contratoId,
        codigo: item.codigoVisible || "",
        descripcion: item.descripcionVisible || "",
        tipo: base?.tipo || "otro",
        unidad: item.unidad || "",
        cantidad: Number(item.cantidad || 0),
        valor: Number(item.valorParcial || 0),
        valorUnitario: Number(item.valorUnitario || 0),
        baseCodigo: base?.codigo || "",
        baseDescripcion: base?.descripcion || "",
        origen: "presupuesto"
      };
    });
  }

  function getAllTechnicalItems(contratoId) {
    const fromPresupuesto = getTechnicalRowsFromPresupuesto(contratoId);
    const manuales = getManualItems(contratoId);

    const manualMapped = manuales.map(i => ({
      id: i.id,
      contratoId: i.contratoId,
      codigo: i.codigo || "",
      descripcion: i.descripcion || "",
      tipo: i.tipo || "otro",
      unidad: i.unidad || "",
      cantidad: Number(i.cantidad || 0),
      valor: Number(i.valor || 0),
      valorUnitario: Number(i.cantidad || 0) ? Number(i.valor || 0) / Number(i.cantidad || 1) : Number(i.valor || 0),
      baseCodigo: "",
      baseDescripcion: "",
      origen: "manual"
    }));

    return [...fromPresupuesto, ...manualMapped];
  }

  function calculateComposition(contratoId) {
    if (window.AFOPresupuesto) {
      const compPpto = window.AFOPresupuesto.getCompositionByContrato(contratoId);

      const manuales = getManualItems(contratoId);
      const compManual = window.AFOCalc.calculateCostDistribution(
        manuales.map(i => ({
          tipo: i.tipo,
          valor: Number(i.valor || 0)
        }))
      );

      return {
        materiales: Number(compPpto.materiales || 0) + Number(compManual.materiales || 0),
        manoObra: Number(compPpto.manoObra || 0) + Number(compManual.manoObra || 0),
        equipos: Number(compPpto.equipos || 0) + Number(compManual.equipos || 0),
        transportes: Number(compPpto.transportes || 0) + Number(compManual.transportes || 0),
        otros: Number(compPpto.otros || 0) + Number(compManual.otros || 0),
        total: Number(compPpto.total || 0) + Number(compManual.total || 0)
      };
    }

    const manuales = getManualItems(contratoId);
    return window.AFOCalc.calculateCostDistribution(manuales);
  }

  function getExpectedStructure(contratoId) {
    const comp = calculateComposition(contratoId);
    const total = Number(comp.total || 0) || 1;

    return {
      materiales: window.AFOCalc.percent(comp.materiales, total),
      manoObra: window.AFOCalc.percent(comp.manoObra, total),
      equipos: window.AFOCalc.percent(comp.equipos, total),
      transportes: window.AFOCalc.percent(comp.transportes, total),
      otros: window.AFOCalc.percent(comp.otros, total)
    };
  }

  function renderTable(containerId, contratoId) {
    const items = getAllTechnicalItems(contratoId);

    const columns = [
      { field: "codigo", label: "Código" },
      { field: "descripcion", label: "Descripción" },
      { field: "tipo", label: "Tipo" },
      { field: "cantidad", label: "Cantidad" },
      { field: "unidad", label: "Unidad" },
      { field: "valorUnitario", label: "Vr Unitario" },
      { field: "valor", label: "Vr Parcial" },
      { field: "origen", label: "Origen" }
    ];

    const data = items.map(i => ({
      codigo: i.codigo || "",
      descripcion: i.descripcion || "",
      tipo: i.tipo || "",
      cantidad: Number(i.cantidad || 0).toLocaleString("es-CO"),
      unidad: i.unidad || "",
      valorUnitario: window.AFOUI.formatMoney(i.valorUnitario || 0),
      valor: window.AFOUI.formatMoney(i.valor || 0),
      origen: i.origen || ""
    }));

    window.AFOUI.renderTable(containerId, columns, data);
  }

  function renderComposition(containerId, contratoId) {
    const comp = calculateComposition(contratoId);
    const estructura = getExpectedStructure(contratoId);

    const cards = [
      {
        title: "Materiales",
        value: window.AFOUI.formatMoney(comp.materiales) + " (" + estructura.materiales.toFixed(1) + "%)"
      },
      {
        title: "Mano de obra",
        value: window.AFOUI.formatMoney(comp.manoObra) + " (" + estructura.manoObra.toFixed(1) + "%)"
      },
      {
        title: "Equipos",
        value: window.AFOUI.formatMoney(comp.equipos) + " (" + estructura.equipos.toFixed(1) + "%)"
      },
      {
        title: "Transportes",
        value: window.AFOUI.formatMoney(comp.transportes) + " (" + estructura.transportes.toFixed(1) + "%)"
      }
    ];

    window.AFOUI.renderCards(containerId, cards);
  }

  function bindForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const data = {
        contratoId: form.contratoId.value,
        codigo: form.codigo.value,
        descripcion: form.descripcion.value,
        tipo: form.tipo.value,
        unidad: form.unidad.value,
        cantidad: form.cantidad.value,
        valor: form.valor.value
      };

      if (!data.descripcion) {
        window.AFOUI.showMessage("Debe ingresar una descripción del ítem.", "error");
        return;
      }

      addManualItem(data);
      form.reset();

      if (form.contratoId) {
        form.contratoId.value = data.contratoId;
      }

      window.AFOUI.showMessage("Ítem técnico manual agregado.", "success");
    });
  }

  window.AFOTecnico = {
    getManualItems,
    addManualItem,
    removeManualItem,
    getPresupuestoItems,
    getTechnicalRowsFromPresupuesto,
    getAllTechnicalItems,
    calculateComposition,
    getExpectedStructure,
    renderTable,
    renderComposition,
    bindForm
  };

})();