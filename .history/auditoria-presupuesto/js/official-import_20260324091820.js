(function(){
  var SHEET_CANDIDATES = [
    "PRESUPUESTO OFICIAL",
    "PRESUPUESTO",
    "OFICIAL",
    "PRESUPUESTO_OBRA",
    "PRESUPUESTO DE OBRA",
    "FORMULARIO DE PRECIOS"
  ];

  function safe(v){
    return String(v == null ? "" : v).trim();
  }

  function num(v){
    if(v == null || v === "") return 0;
    if(typeof v === "number") return Number.isFinite(v) ? v : 0;

    var s = String(v).trim();
    if(!s) return 0;

    s = s
      .replace(/\$/g, "")
      .replace(/[^\d.,-]/g, "")
      .replace(/\.(?=\d{3}(\D|$))/g, "");

    var lastComma = s.lastIndexOf(",");
    var lastDot = s.lastIndexOf(".");
    var normalized = s;

    if(lastComma > lastDot){
      normalized = s.replace(/\./g, "").replace(",", ".");
    }else{
      normalized = s.replace(/,/g, "");
    }

    var n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
  }

  function normalizeText(s){
    return String(s || "")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function makeId(prefix){
    return (prefix || "id") + "_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
  }

  function isItemCode(v){
    var s = safe(v);
    return /^\d+(\.\d+)*$/.test(s);
  }

  function looksChapterCode(v){
    var s = safe(v);
    return /^\d+(\.00)?$/.test(s);
  }

  function chapterFromItemCode(code){
    var s = safe(code);
    if(!s) return "";
    if(s.indexOf(".") >= 0) return safe(s.split(".")[0]);
    if(/^\d+$/.test(s)) return s;
    return "";
  }

  function chapterSort(a, b){
    var aa = safe(a && a.chapterCode);
    var bb = safe(b && b.chapterCode);

    var na = Number(aa);
    var nb = Number(bb);

    var aNum = Number.isFinite(na);
    var bNum = Number.isFinite(nb);

    if(aNum && bNum) return na - nb;
    return aa.localeCompare(bb, "es", { numeric:true });
  }

  function rowHasContent(row){
    var i;
    for(i=0; i<row.length; i++){
      if(safe(row[i])) return true;
    }
    return false;
  }

  function looksLikeHeaderRow(row){
    var cells = [];
    var i;

    for(i=0; i<row.length; i++){
      cells.push(normalizeText(row[i]));
    }

    function hasAny(list){
      var j;
      for(j=0; j<list.length; j++){
        if(cells.indexOf(normalizeText(list[j])) >= 0) return true;
      }
      return false;
    }

    var hasCode = hasAny(["codigo", "código", "item", "actividad"]);
    var hasDesc = hasAny(["descripcion", "descripción", "detalle", "concepto"]);
    var hasUnit = hasAny(["unidad", "und", "un"]);
    var hasQty  = hasAny(["cantidad", "cant", "cant.", "cantidad obra"]);
    var hasPU   = hasAny(["precio unitario", "vr unitario", "valor unitario", "pu"]);

    return hasCode && hasDesc && (hasQty || hasPU || hasUnit);
  }

  function findHeaderIndex(rows, maxScan){
    var max = Math.min(maxScan || 60, rows.length);
    var i;

    for(i=0; i<max; i++){
      if(looksLikeHeaderRow(rows[i] || [])) return i;
    }

    return -1;
  }

  function getColIndex(headerRow, aliases){
    var h = [];
    var i, j;

    for(i=0; i<headerRow.length; i++){
      h.push(normalizeText(headerRow[i]));
    }

    for(j=0; j<aliases.length; j++){
      var idx = h.indexOf(normalizeText(aliases[j]));
      if(idx >= 0) return idx;
    }

    return -1;
  }

  function pickSheetName(wb){
    var names = wb && wb.SheetNames ? wb.SheetNames : [];
    var i, j;

    for(i=0; i<SHEET_CANDIDATES.length; i++){
      for(j=0; j<names.length; j++){
        if(normalizeText(names[j]) === normalizeText(SHEET_CANDIDATES[i])){
          return names[j];
        }
      }
    }

    return names.length ? names[0] : "";
  }

  function extractRowsFromSheet(wb, sheetName){
    if(!wb || !sheetName || !wb.Sheets || !wb.Sheets[sheetName]){
      throw new Error("No se encontró la hoja a importar.");
    }

    return XLSX.utils.sheet_to_json(
      wb.Sheets[sheetName],
      { header:1, raw:true, defval:"" }
    );
  }

  function normalizeOfficialRow(raw, currentChapterCode, currentChapterName){
    var code = safe(raw.code);
    var desc = safe(raw.desc);
    var unit = safe(raw.unit);
    var qty = num(raw.qty);
    var pu = num(raw.pu);

    var chapterCode = safe(raw.chapterCode);
    var chapterName = safe(raw.chapterName);

    if(!chapterCode){
      chapterCode = currentChapterCode || chapterFromItemCode(code);
    }

    if(!chapterName){
      chapterName = currentChapterName || "";
    }

    if(!code && !desc) return null;

    return {
      id: makeId("oit"),
      chapterCode: chapterCode,
      chapterName: chapterName,
      code: code,
      apuRefCode: safe(raw.apuRefCode || code),
      desc: desc,
      unit: unit,
      pu: pu,
      qty: qty
    };
  }

  function parseOfficialRows(rows){
    var headerIndex = findHeaderIndex(rows, 100);
    if(headerIndex < 0){
      throw new Error("No se encontró una fila de encabezados válida en el Excel del presupuesto oficial.");
    }

    var header = rows[headerIndex] || [];

    var idxChapterCode = getColIndex(header, [
      "capitulo", "capítulo", "cap", "capitulo codigo", "capítulo código"
    ]);

    var idxChapterName = getColIndex(header, [
      "nombre capitulo", "nombre capítulo", "capitulo nombre", "capítulo nombre", "capitulo descripcion", "capítulo descripción"
    ]);

    var idxCode = getColIndex(header, [
      "codigo", "código", "item", "actividad"
    ]);

    var idxDesc = getColIndex(header, [
      "descripcion", "descripción", "detalle", "concepto"
    ]);

    var idxUnit = getColIndex(header, [
      "unidad", "und", "un"
    ]);

    var idxQty = getColIndex(header, [
      "cantidad", "cant", "cant.", "cantidad obra"
    ]);

    var idxPU = getColIndex(header, [
      "precio unitario", "vr unitario", "valor unitario", "pu"
    ]);

    var idxRef = getColIndex(header, [
      "codigo apu ref", "codigo_apu_ref", "apu ref", "apu", "codigo base", "código base"
    ]);

    if(idxCode < 0 || idxDesc < 0){
      throw new Error("El Excel del presupuesto oficial debe tener al menos columnas de código y descripción.");
    }

    var items = [];
    var chaptersMap = {};
    var currentChapterCode = "";
    var currentChapterName = "";

    var r;
    for(r = headerIndex + 1; r < rows.length; r++){
      var row = rows[r] || [];
      if(!rowHasContent(row)) continue;

      var rawChapterCode = idxChapterCode >= 0 ? safe(row[idxChapterCode]) : "";
      var rawChapterName = idxChapterName >= 0 ? safe(row[idxChapterName]) : "";
      var rawCode = idxCode >= 0 ? safe(row[idxCode]) : "";
      var rawDesc = idxDesc >= 0 ? safe(row[idxDesc]) : "";
      var rawUnit = idxUnit >= 0 ? safe(row[idxUnit]) : "";
      var rawQty = idxQty >= 0 ? row[idxQty] : "";
      var rawPU = idxPU >= 0 ? row[idxPU] : "";
      var rawRef = idxRef >= 0 ? safe(row[idxRef]) : "";

      if(rawChapterCode){
        currentChapterCode = rawChapterCode;
        if(rawChapterName) currentChapterName = rawChapterName;
      }

      if(!rawChapterCode && looksChapterCode(rawCode) && rawDesc && !rawUnit && !num(rawQty) && !num(rawPU)){
        currentChapterCode = rawCode;
        currentChapterName = rawDesc;

        if(!chaptersMap[currentChapterCode]){
          chaptersMap[currentChapterCode] = {
            id: makeId("ochap"),
            chapterCode: currentChapterCode,
            chapterName: currentChapterName
          };
        }
        continue;
      }

      if(!isItemCode(rawCode) && !rawDesc){
        continue;
      }

      if(!isItemCode(rawCode) && rawDesc && !rawUnit && !num(rawQty) && !num(rawPU)){
        continue;
      }

      var item = normalizeOfficialRow({
        chapterCode: rawChapterCode,
        chapterName: rawChapterName,
        code: rawCode,
        apuRefCode: rawRef,
        desc: rawDesc,
        unit: rawUnit,
        qty: rawQty,
        pu: rawPU
      }, currentChapterCode, currentChapterName);

      if(!item) continue;

      if(!item.chapterCode){
        item.chapterCode = chapterFromItemCode(item.code);
      }

      if(item.chapterCode && !chaptersMap[item.chapterCode]){
        chaptersMap[item.chapterCode] = {
          id: makeId("ochap"),
          chapterCode: item.chapterCode,
          chapterName: item.chapterName || ""
        };
      }else if(item.chapterCode && item.chapterName && chaptersMap[item.chapterCode] && !chaptersMap[item.chapterCode].chapterName){
        chaptersMap[item.chapterCode].chapterName = item.chapterName;
      }

      items.push(item);
    }

    var chapters = Object.keys(chaptersMap).map(function(k){
      return chaptersMap[k];
    }).sort(chapterSort);

    return {
      oficialItems: items,
      oficialChapters: chapters
    };
  }

  function importOfficialBudgetFromWorkbook(projectId, workbook){
    if(!projectId) throw new Error("Falta projectId.");
    if(!workbook) throw new Error("No se recibió workbook.");

    var sheetName = pickSheetName(workbook);
    if(!sheetName){
      throw new Error("El archivo Excel no contiene hojas válidas.");
    }

    var rows = extractRowsFromSheet(workbook, sheetName);
    var parsed = parseOfficialRows(rows);

    if(!window.StorageAPI || typeof StorageAPI.updateProject !== "function"){
      throw new Error("StorageAPI no está disponible.");
    }

    StorageAPI.updateProject(projectId, {
      oficialItems: parsed.oficialItems,
      oficialChapters: parsed.oficialChapters,
      oficialApuOverrides: {}
    });

    return {
      sheetName: sheetName,
      oficialItems: parsed.oficialItems,
      oficialChapters: parsed.oficialChapters,
      counts: {
        items: parsed.oficialItems.length,
        chapters: parsed.oficialChapters.length
      }
    };
  }

  async function importOfficialBudgetFromFile(projectId, file){
    if(!projectId) throw new Error("Falta projectId.");
    if(!file) throw new Error("No se recibió archivo.");
    if(typeof XLSX === "undefined"){
      throw new Error("XLSX no está cargado en la página.");
    }

    var buffer = await file.arrayBuffer();
    var workbook = XLSX.read(buffer, { type:"array" });

    return importOfficialBudgetFromWorkbook(projectId, workbook);
  }

  function replaceOfficialBudget(projectId, payload){
    if(!projectId) throw new Error("Falta projectId.");
    if(!payload) throw new Error("No se recibió payload.");

    var oficialItems = Array.isArray(payload.oficialItems) ? payload.oficialItems : [];
    var oficialChapters = Array.isArray(payload.oficialChapters) ? payload.oficialChapters : [];

    if(!window.StorageAPI || typeof StorageAPI.updateProject !== "function"){
      throw new Error("StorageAPI no está disponible.");
    }

    StorageAPI.updateProject(projectId, {
      oficialItems: oficialItems,
      oficialChapters: oficialChapters,
      oficialApuOverrides: {}
    });

    return true;
  }

  function clearOfficialBudget(projectId){
    if(!projectId) throw new Error("Falta projectId.");

    if(!window.StorageAPI || typeof StorageAPI.updateProject !== "function"){
      throw new Error("StorageAPI no está disponible.");
    }

    StorageAPI.updateProject(projectId, {
      oficialItems: [],
      oficialChapters: [],
      oficialApuOverrides: {}
    });

    return true;
  }

  function getOfficialBudget(projectId){
    if(!projectId) return null;
    if(!window.StorageAPI || typeof StorageAPI.getProjectById !== "function") return null;

    var p = StorageAPI.getProjectById(projectId);
    if(!p) return null;

    return {
      oficialItems: Array.isArray(p.oficialItems) ? p.oficialItems : [],
      oficialChapters: Array.isArray(p.oficialChapters) ? p.oficialChapters : [],
      oficialApuOverrides: p.oficialApuOverrides || {}
    };
  }

  window.OfficialImport = {
    parseOfficialRows: parseOfficialRows,
    importOfficialBudgetFromWorkbook: importOfficialBudgetFromWorkbook,
    importOfficialBudgetFromFile: importOfficialBudgetFromFile,
    replaceOfficialBudget: replaceOfficialBudget,
    clearOfficialBudget: clearOfficialBudget,
    getOfficialBudget: getOfficialBudget
  };
})();