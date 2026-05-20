(function () {

  const STORAGE_KEY = "presupuesto_items";

  function getAll() {
    return window.AFOStorage.get(STORAGE_KEY, []);
  }

  function setAll(items) {
    window.AFOStorage.set(STORAGE_KEY, items || []);
    return items || [];
  }

  function getByContrato(contratoId) {
    return getAll().filter(item => item.contratoId === contratoId);
  }

  function clearByContrato(contratoId) {
    const filtered = getAll().filter(item => item.contratoId !== contratoId);
    setAll(filtered);
  }

  function getBaseItemsByContrato(contratoId) {
    const baseItems = window.AFOBaseImport ? window.AFOBaseImport.getAll() : [];
    return baseItems.filter(item => item.contratoId === contratoId);
  }

  function getBaseItemById(id) {
    const baseItems = window.AFOBaseImport ? window.AFOBaseImport.getAll() : [];
    return baseItems.find(item => item.id === id) || null;
  }

  function fillBaseItemsSelect(selectId, contratoId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const items = getBaseItemsByContrato(contratoId);

    if (!items.length) {
      select.innerHTML = '<option value="">No hay base importada para este contrato</option>';
      return;
    }

    select.innerHTML = items.map(item => {
      const codigo = item.codigo || "SIN-CODIGO";
      const descripcion = item.descripcion || "Sin descripción";
      return `<option value="${item.id}">${codigo} - ${descripcion}</option>`;
    }).join("");
  }

  function create(data) {
    const cantidad = Number(data.cantidad || 0);
    const valorUnitario = Number(data.valorUnitario || 0);

    const presupuestoItem = {
      id: window.AFOStorage.generateId("pto"),
      contratoId: data.contratoId || "",
      baseItemId: data.baseItemId || "",
      codigoVisible: data.codigoVisible || "",
      descripcionVisible: data.descripcionVisible || "",
      unidad: data.unidad || "",
      cantidad,
      valorUnitario,
      valorParcial: cantidad * valorUnitario,
      fechaRegistro: new Date().toISOString()
    };

    const list = getAll();
    list.push(presupuestoItem);
    setAll(list);

    return presupuestoItem;
  }

  function update(id, data) {
    const items = getAll();

    const updated = items.map(item => {
      if (item.id !== id) return item;

      const cantidad = data.cantidad !== undefined ? Number(data.cantidad || 0) : Number(item.cantidad || 0);
      const valorUnitario = data.valorUnitario !== undefined ? Number(data.valorUnitario || 0) : Number(item.valorUnitario || 0);

      return {
        ...item,
        ...data,
        cantidad,
        valorUnitario,
        valorParcial: cantidad * valorUnitario,
        fechaActualizacion: new Date().toISOString()
      };
    });

    setAll(updated);
    return updated.find(item => item.id === id) || null;
  }

  function remove(id) {
    const filtered = getAll().filter(item => item.id !== id);
    setAll(filtered);
  }

  function buildSummary(contratoId) {
    const items = getByContrato(contratoId);

    const resumen = {
      totalItems: items.length,
      cantidadTotal: 0,
      valorTotal: 0,
      baseAmarrada: 0
    };

    items.forEach(item => {
      resumen.cantidadTotal += Number(item.cantidad || 0);
      resumen.valorTotal += Number(item.valorParcial || 0);
      if (item.baseItemId) resumen.baseAmarrada += 1;
    });

    return resumen;
  }

  function renderSummary(containerId = "resumenPresupuesto", contratoId = "") {
    const r = buildSummary(contratoId);

    const cards = [
      { title: "Ítems presupuesto", value: r.totalItems },
      { title: "Cantidad total", value: r.cantidadTotal.toLocaleString("es-CO") },
      { title: "Valor total", value: window.AFOUI.formatMoney(r.valorTotal) },
      { title: "Ítems amarrados a base", value: r.baseAmarrada }
    ];

    window.AFOUI.renderCards(containerId, cards);
  }

  function renderTable(containerId = "tablaPresupuesto", contratoId = "") {
    const items = getByContrato(contratoId);

    const columns = [
      { field: "codigoVisible", label: "Código" },
      { field: "descripcionVisible", label: "Descripción" },
      { field: "unidad", label: "Unidad" },
      { field: "cantidad", label: "Cantidad" },
      { field: "valorUnitario", label: "Vr Unitario" },
      { field: "valorParcial", label: "Vr Parcial" },
      { field: "baseReal", label: "Base real" }
    ];

    const data = items.map(item => {
      const base = getBaseItemById(item.baseItemId);

      return {
        codigoVisible: item.codigoVisible || "",
        descripcionVisible: item.descripcionVisible || "",
        unidad: item.unidad || "",
        cantidad: Number(item.cantidad || 0).toLocaleString("es-CO"),
        valorUnitario: window.AFOUI.formatMoney(item.valorUnitario || 0),
        valorParcial: window.AFOUI.formatMoney(item.valorParcial || 0),
        baseReal: base ? (base.codigo || "") + " - " + (base.descripcion || "") : "Sin amarre"
      };
    });

    window.AFOUI.renderTable(containerId, columns, data);
  }

  function bindForm(formId = "formPresupuesto") {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const data = {
        contratoId: form.contratoIdPresupuesto.value,
        baseItemId: form.baseItemId.value,
        codigoVisible: form.codigoVisible.value.trim(),
        descripcionVisible: form.descripcionVisible.value.trim(),
        unidad: form.unidadPresupuesto.value.trim(),
        cantidad: form.cantidadPresupuesto.value,
        valorUnitario: form.valorUnitarioPresupuesto.value
      };

      if (!data.contratoId) {
        window.AFOUI.showMessage("Debe seleccionar un contrato.", "error");
        return;
      }

      if (!data.baseItemId) {
        window.AFOUI.showMessage("Debe seleccionar un ítem de la base.", "error");
        return;
      }

      if (!data.descripcionVisible) {
        window.AFOUI.showMessage("Debe diligenciar la descripción visible del presupuesto.", "error");
        return;
      }

      create(data);

      form.reset();
      if (form.contratoIdPresupuesto) {
        form.contratoIdPresupuesto.value = data.contratoId;
      }

      if (window.AFOUI && window.AFOUI.showMessage) {
        window.AFOUI.showMessage("Ítem agregado al presupuesto correctamente.", "success");
      }
    });
  }

  function getCompositionByContrato(contratoId) {
    const presupuesto = getByContrato(contratoId);

    const result = {
      materiales: 0,
      manoObra: 0,
      equipos: 0,
      transportes: 0,
      otros: 0,
      total: 0
    };

    presupuesto.forEach(item => {
      const base = getBaseItemById(item.baseItemId);
      const valor = Number(item.valorParcial || 0);

      if (!base) {
        result.otros += valor;
        result.total += valor;
        return;
      }

      switch ((base.tipo || "").toLowerCase()) {
        case "material":
          result.materiales += valor;
          break;
        case "mano_obra":
          result.manoObra += valor;
          break;
        case "equipo":
          result.equipos += valor;
          break;
        case "transporte":
          result.transportes += valor;
          break;
        default:
          result.otros += valor;
          break;
      }

      result.total += valor;
    });

    return result;
  }

  window.AFOPresupuesto = {
    getAll,
    setAll,
    getByContrato,
    clearByContrato,
    getBaseItemsByContrato,
    getBaseItemById,
    fillBaseItemsSelect,
    create,
    update,
    remove,
    buildSummary,
    renderSummary,
    renderTable,
    bindForm,
    getCompositionByContrato
  };

})();