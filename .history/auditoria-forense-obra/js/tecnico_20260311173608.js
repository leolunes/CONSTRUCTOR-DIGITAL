(function () {

  function getItems(contratoId) {

    const analisis = window.AFODB.getAnalisisByContrato(contratoId);

    if (!analisis || !analisis.length) return [];

    return analisis;

  }

  function addItem(data) {

    const item = {
      contratoId: data.contratoId,
      codigo: data.codigo || "",
      descripcion: data.descripcion || "",
      tipo: data.tipo || "material",
      valor: Number(data.valor || 0),
      unidad: data.unidad || "",
      cantidad: Number(data.cantidad || 0)
    };

    return window.AFODB.saveAnalisis(item);

  }

  function removeItem(id) {

    const list = window.AFODB.getAnalisis();

    const filtered = list.filter(i => i.id !== id);

    window.AFOStorage.set("analisis", filtered);

  }

  function calculateComposition(contratoId) {

    const items = getItems(contratoId);

    return window.AFOCalc.calculateCostDistribution(items);

  }

  function getExpectedStructure(contratoId) {

    const comp = calculateComposition(contratoId);

    const total = comp.total || 1;

    return {

      materiales: window.AFOCalc.percent(comp.materiales, total),

      manoObra: window.AFOCalc.percent(comp.manoObra, total),

      equipos: window.AFOCalc.percent(comp.equipos, total),

      transportes: window.AFOCalc.percent(comp.transportes, total),

      otros: window.AFOCalc.percent(comp.otros, total)

    };

  }

  function renderTable(containerId, contratoId) {

    const items = getItems(contratoId);

    const columns = [
      { field: "codigo", label: "Código" },
      { field: "descripcion", label: "Descripción" },
      { field: "tipo", label: "Tipo" },
      { field: "cantidad", label: "Cantidad" },
      { field: "unidad", label: "Unidad" },
      { field: "valor", label: "Valor" }
    ];

    const data = items.map(i => ({
      codigo: i.codigo,
      descripcion: i.descripcion,
      tipo: i.tipo,
      cantidad: i.cantidad,
      unidad: i.unidad,
      valor: window.AFOUI.formatMoney(i.valor)
    }));

    window.AFOUI.renderTable(containerId, columns, data);

  }

  function renderComposition(containerId, contratoId) {

    const comp = calculateComposition(contratoId);

    const cards = [

      {
        title: "Materiales",
        value: window.AFOUI.formatMoney(comp.materiales)
      },

      {
        title: "Mano de obra",
        value: window.AFOUI.formatMoney(comp.manoObra)
      },

      {
        title: "Equipos",
        value: window.AFOUI.formatMoney(comp.equipos)
      },

      {
        title: "Transportes",
        value: window.AFOUI.formatMoney(comp.transportes)
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

      addItem(data);

      form.reset();

      window.AFOUI.showMessage("Ítem técnico agregado.", "success");

    });

  }

  window.AFOTecnico = {

    getItems,

    addItem,

    removeItem,

    calculateComposition,

    getExpectedStructure,

    renderTable,

    renderComposition,

    bindForm

  };

})();