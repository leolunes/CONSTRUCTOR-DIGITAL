(function () {

  function getAll() {
    return window.AFODB.getContracts();
  }

  function getById(id) {
    const contratos = getAll();
    return contratos.find(c => c.id === id) || null;
  }

  function create(data) {
    const contrato = {
      numeroContrato: data.numeroContrato || "",
      nombre: data.nombre || "",
      objeto: data.objeto || "",
      entidad: data.entidad || "",
      contratista: data.contratista || "",
      ubicacion: data.ubicacion || "",
      valorContrato: Number(data.valorContrato || 0),
      plazoMeses: Number(data.plazoMeses || 0),
      estado: data.estado || "Activo"
    };

    return window.AFODB.saveContract(contrato);
  }

  function update(id, data) {
    return window.AFODB.updateContract(id, data);
  }

  function remove(id) {
    return window.AFODB.deleteContract(id);
  }

  function buildTableData(contratos) {
    return contratos.map(item => ({
      numeroContrato: item.numeroContrato || "",
      nombre: item.nombre || "",
      entidad: item.entidad || "",
      contratista: item.contratista || "",
      ubicacion: item.ubicacion || "",
      valorContrato: window.AFOUI.formatMoney(item.valorContrato || 0),
      estado: item.estado || ""
    }));
  }

  function renderTable(containerId = "tablaContratos") {
    const contratos = getAll();

    const columns = [
      { field: "numeroContrato", label: "No. Contrato" },
      { field: "nombre", label: "Nombre" },
      { field: "entidad", label: "Entidad" },
      { field: "contratista", label: "Contratista" },
      { field: "ubicacion", label: "Ubicación" },
      { field: "valorContrato", label: "Valor" },
      { field: "estado", label: "Estado" }
    ];

    const data = buildTableData(contratos);

    window.AFOUI.renderTable(containerId, columns, data);
  }

  function renderCards(containerId = "resumenContratos") {
    const contratos = getAll();

    const totalContratos = contratos.length;
    const totalValor = contratos.reduce((acc, item) => {
      return acc + Number(item.valorContrato || 0);
    }, 0);

    const activos = contratos.filter(c => (c.estado || "").toLowerCase() === "activo").length;

    const cards = [
      { title: "Total contratos", value: totalContratos },
      { title: "Contratos activos", value: activos },
      { title: "Valor acumulado", value: window.AFOUI.formatMoney(totalValor) }
    ];

    window.AFOUI.renderCards(containerId, cards);
  }

  function bindForm(formId = "formContrato") {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const data = {
        numeroContrato: form.numeroContrato.value.trim(),
        nombre: form.nombre.value.trim(),
        objeto: form.objeto.value.trim(),
        entidad: form.entidad.value.trim(),
        contratista: form.contratista.value.trim(),
        ubicacion: form.ubicacion.value.trim(),
        valorContrato: form.valorContrato.value,
        plazoMeses: form.plazoMeses.value,
        estado: form.estado.value
      };

      if (!data.numeroContrato || !data.nombre) {
        window.AFOUI.showMessage("Debe diligenciar al menos el número y el nombre del contrato.", "error");
        return;
      }

      create(data);
      form.reset();

      window.AFOUI.showMessage("Contrato guardado correctamente.", "success");

      renderTable();
      renderCards();

      if (window.AFOApp && typeof window.AFOApp.updateDashboard === "function") {
        window.AFOApp.updateDashboard();
      }
    });
  }

  function seedDemoData() {
    const contratos = getAll();
    if (contratos.length > 0) return;

    create({
      numeroContrato: "CTO-2026-001",
      nombre: "Mejoramiento vial urbano",
      objeto: "Obras de mejoramiento y adecuación vial",
      entidad: "Municipio de ejemplo",
      contratista: "Consorcio Vías 2026",
      ubicacion: "Santander",
      valorContrato: 850000000,
      plazoMeses: 6,
      estado: "Activo"
    });

    create({
      numeroContrato: "CTO-2026-002",
      nombre: "Construcción de placa huella",
      objeto: "Construcción de placa huella en zona rural",
      entidad: "Gobernación de ejemplo",
      contratista: "Unión Temporal Caminos",
      ubicacion: "Bucaramanga",
      valorContrato: 420000000,
      plazoMeses: 4,
      estado: "Activo"
    });
  }

  function initPage() {
    seedDemoData();
    renderTable();
    renderCards();
    bindForm();
  }

  window.AFOContratos = {
    getAll,
    getById,
    create,
    update,
    remove,
    renderTable,
    renderCards,
    bindForm,
    initPage
  };

})();