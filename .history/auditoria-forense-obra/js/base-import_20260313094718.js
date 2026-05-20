(function () {

  const STORAGE_KEY = "base_items";

  function getAll() {
    return window.AFOStorage.get(STORAGE_KEY, []);
  }

  function setAll(items) {
    window.AFOStorage.set(STORAGE_KEY, items || []);
    return items || [];
  }

  function clearAll() {
    window.AFOStorage.set(STORAGE_KEY, []);
  }

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function toNumber(value) {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "number") return isNaN(value) ? 0 : value;

    let txt = String(value).trim();

    txt = txt.replace(/\$/g, "");
    txt = txt.replace(/\s/g, "");

    if (txt.includes(",") && txt.includes(".")) {
      txt = txt.replace(/\./g, "").replace(",", ".");
    } else {
      txt = txt.replace(/,/g, "");
    }

    const n = Number(txt);
    return isNaN(n) ? 0 : n;
  }

  function detectColumn(row, candidates) {
    const keys = Object.keys(row || {});
    for (const key of keys) {
      const normalized = normalizeText(key);
      for (const candidate of candidates) {
        if (normalized === normalizeText(candidate)) return key;
      }
    }

    for (const key of keys) {
      const normalized = normalizeText(key);
      for (const candidate of candidates) {
        if (normalized.includes(normalizeText(candidate))) return key;
      }
    }

    return null;
  }

  function classifyType(text) {
    const t = normalizeText(text);

    if (
      t.includes("material") ||
      t.includes("cemento") ||
      t.includes("arena") ||
      t.includes("grava") ||
      t.includes("acero") ||
      t.includes("tuberia") ||
      t.includes("ladrillo") ||
      t.includes("bloque")
    ) return "material";

    if (
      t.includes("mano de obra") ||
      t.includes("obrero") ||
      t.includes("oficial") ||
      t.includes("ayudante") ||
      t.includes("cuadrilla")
    ) return "mano_obra";

    if (
      t.includes("equipo") ||
      t.includes("maquinaria") ||
      t.includes("retroexcavadora") ||
      t.includes("vibro") ||
      t.includes("mezcladora") ||
      t.includes("compresor") ||
      t.includes("cortadora")
    ) return "equipo";

    if (
      t.includes("transporte") ||
      t.includes("acarreo") ||
      t.includes("flete") ||
      t.includes("volqueta")
    ) return "transporte";

    return "otro";
  }

  function mapRow(row, contratoId, sheetName, index) {
    const codigoCol = detectColumn(row, [
      "codigo",
      "cod",
      "item",
      "apu",
      "codigo apu",
      "codigo item"
    ]);

    const descripcionCol = detectColumn(row, [
      "descripcion",
      "detalle",
      "nombre",
      "actividad",
      "concepto",
      "descripcion item",
      "descripcion apu"
    ]);

    const unidadCol = detectColumn(row, [
      "unidad",
      "und",
      "u"
    ]);

    const cantidadCol = detectColumn(row, [
      "cantidad",
      "cant"
    ]);

    const valorUnitarioCol = detectColumn(row, [
      "valor unitario",
      "vr unitario",
      "precio unitario",
      "unitario",
      "valor u"
    ]);

    const valorParcialCol = detectColumn(row, [
      "valor parcial",
      "vr parcial",
      "parcial",
      "subtotal"
    ]);

    const tipoCol = detectColumn(row, [
      "tipo",
      "tipo costo",
      "grupo",
      "categoria",
      "clase"
    ]);

    const codigo = codigoCol ? String(row[codigoCol] || "").trim() : "";
    const descripcion = descripcionCol ? String(row[descripcionCol] || "").trim() : "";
    const unidad = unidadCol ? String(row[unidadCol] || "").trim() : "";
    const cantidad = cantidadCol ? toNumber(row[cantidadCol]) : 0;
    const valorUnitario = valorUnitarioCol ? toNumber(row[valorUnitarioCol]) : 0;
    const valorParcial = valorParcialCol
      ? toNumber(row[valorParcialCol])
      : (cantidad && valorUnitario ? cantidad * valorUnitario : 0);

    const tipoTexto = tipoCol ? String(row[tipoCol] || "").trim() : descripcion;
    const tipo = classifyType(tipoTexto);

    return {
      id: window.AFOStorage.generateId("base"),
      contratoId: contratoId || "",
      sheetName: sheetName || "Hoja1",
      rowIndex: index + 1,
      codigo,
      descripcion,
      unidad,
      cantidad,
      valorUnitario,
      valorParcial,
      tipo,
      raw: row
    };
  }

  function isValidItem(item) {
    return !!(item.codigo || item.descripcion);
  }

  function parseWorkbook(workbook, contratoId) {
    const items = [];

    workbook.SheetNames.forEach(sheetName => {
      const ws = workbook.Sheets[sheetName];
      const rows = window.XLSX.utils.sheet_to_json(ws, { defval: "" });

      rows.forEach((row, index) => {
        const item = mapRow(row, contratoId, sheetName, index);
        if (isValidItem(item)) {
          items.push(item);
        }
      });
    });

    return items;
  }

  function importExcel(file, contratoId) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No se seleccionó archivo."));
        return;
      }

      const reader = new FileReader();

      reader.onload = function (e) {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = window.XLSX.read(data, { type: "array" });

          const items = parseWorkbook(workbook, contratoId);
          setAll(items);

          resolve(items);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = function () {
        reject(new Error("No fue posible leer el archivo Excel."));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  function buildSummary() {
    const items = getAll();

    const resumen = {
      totalItems: items.length,
      totalCodigos: 0,
      materiales: 0,
      manoObra: 0,
      equipos: 0,
      transportes: 0,
      otros: 0,
      valorTotal: 0
    };

    const codigos = new Set();

    items.forEach(item => {
      if (item.codigo) codigos.add(item.codigo);

      resumen.valorTotal += Number(item.valorParcial || 0);

      switch ((item.tipo || "").toLowerCase()) {
        case "material":
          resumen.materiales += 1;
          break;
        case "mano_obra":
          resumen.manoObra += 1;
          break;
        case "equipo":
          resumen.equipos += 1;
          break;
        case "transporte":
          resumen.transportes += 1;
          break;
        default:
          resumen.otros += 1;
          break;
      }
    });

    resumen.totalCodigos = codigos.size;

    return resumen;
  }

  function renderSummary(containerId = "resumenBaseDatos") {
    const r = buildSummary();

    const cards = [
      { title: "Ítems importados", value: r.totalItems },
      { title: "Códigos únicos", value: r.totalCodigos },
      { title: "Materiales", value: r.materiales },
      { title: "Valor base", value: window.AFOUI.formatMoney(r.valorTotal) }
    ];

    window.AFOUI.renderCards(containerId, cards);
  }

  function renderTable(containerId = "tablaBaseDatos") {
    const items = getAll();

    const columns = [
      { field: "sheetName", label: "Hoja" },
      { field: "codigo", label: "Código" },
      { field: "descripcion", label: "Descripción" },
      { field: "unidad", label: "Unidad" },
      { field: "cantidad", label: "Cantidad" },
      { field: "valorUnitario", label: "Vr Unitario" },
      { field: "valorParcial", label: "Vr Parcial" },
      { field: "tipo", label: "Tipo" }
    ];

    const data = items.map(item => ({
      sheetName: item.sheetName || "",
      codigo: item.codigo || "",
      descripcion: item.descripcion || "",
      unidad: item.unidad || "",
      cantidad: item.cantidad || 0,
      valorUnitario: window.AFOUI.formatMoney(item.valorUnitario || 0),
      valorParcial: window.AFOUI.formatMoney(item.valorParcial || 0),
      tipo: item.tipo || ""
    }));

    window.AFOUI.renderTable(containerId, columns, data);
  }

  function bindForm(formId = "formImportacionBase") {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const contratoId = form.selectorContratoBase.value;
      const file = form.archivoExcelBase.files[0];

      if (!contratoId) {
        window.AFOUI.showMessage("Debe seleccionar un contrato.", "error");
        return;
      }

      if (!file) {
        window.AFOUI.showMessage("Debe seleccionar un archivo Excel.", "error");
        return;
      }

      try {
        const items = await importExcel(file, contratoId);

        renderSummary("resumenBaseDatos");
        renderTable("tablaBaseDatos");

        window.AFOUI.showMessage(
          "Base importada correctamente. Ítems cargados: " + items.length,
          "success"
        );
      } catch (error) {
        console.error(error);
        window.AFOUI.showMessage(
          "No fue posible importar la base Excel.",
          "error"
        );
      }
    });
  }

  window.AFOBaseImport = {
    getAll,
    setAll,
    clearAll,
    importExcel,
    buildSummary,
    renderSummary,
    renderTable,
    bindForm
  };

})();