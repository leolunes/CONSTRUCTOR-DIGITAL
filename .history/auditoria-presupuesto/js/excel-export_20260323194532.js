(function(){
  function safe(v){ return String(v == null ? "" : v).trim(); }
  function num(v){ return Number(v || 0); }

  function sanitizeFileName(name){
    return String(name || "archivo")
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "_")
      .replace(/\s+/g, "_")
      .slice(0, 100) || "archivo";
  }

  function money(n){ return num(n); }

  function pct(project, key, legacyKey){
    var v = project ? project[key] : undefined;
    if(Number.isFinite(Number(v))) return Number(v);

    var lv = legacyKey ? (project ? project[legacyKey] : undefined) : undefined;
    if(Number.isFinite(Number(lv))) return Number(lv);

    return 0;
  }

  function ensureXLSX(){
    if(typeof XLSX === "undefined" || !XLSX || !XLSX.utils){
      throw new Error("No se encontró XLSX cargado en la página.");
    }
  }

  function downloadWorkbook(wb, filename){
    ensureXLSX();
    var out = XLSX.write(wb, { bookType:"xlsx", type:"array" });
    var blob = new Blob(
      [out],
      { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
    );

    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename || ("archivo_" + Date.now() + ".xlsx");
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
    return true;
  }

  function buildProjectView(project, mode){
    var m = String(mode || "base").toLowerCase();

    if(m === "oficial"){
      return {
        id: project && project.id,
        name: project && project.name,
        entity: project && project.entity,
        location: project && project.location,
        currency: project && project.currency,
        adminPct: project && project.adminPct,
        aiuPct: project && project.aiuPct,
        imprevPct: project && project.imprevPct,
        utilPct: project && project.utilPct,
        ivaUtilPct: project && project.ivaUtilPct,
        ivaPct: project && project.ivaPct,
        items: (project && Array.isArray(project.oficialItems)) ? project.oficialItems : [],
        chapters: (project && Array.isArray(project.oficialChapters)) ? project.oficialChapters : [],
        apuOverrides: (project && project.oficialApuOverrides) ? project.oficialApuOverrides : {},
        __budgetMode: "oficial"
      };
    }

    return {
      id: project && project.id,
      name: project && project.name,
      entity: project && project.entity,
      location: project && project.location,
      currency: project && project.currency,
      adminPct: project && project.adminPct,
      aiuPct: project && project.aiuPct,
      imprevPct: project && project.imprevPct,
      utilPct: project && project.utilPct,
      ivaUtilPct: project && project.ivaUtilPct,
      ivaPct: project && project.ivaPct,
      items: (project && Array.isArray(project.items)) ? project.items : [],
      chapters: (project && Array.isArray(project.chapters)) ? project.chapters : [],
      apuOverrides: (project && project.apuOverrides) ? project.apuOverrides : {},
      __budgetMode: "base"
    };
  }

  function budgetLabel(mode){
    return String(mode || "base").toLowerCase() === "oficial"
      ? "Presupuesto Oficial"
      : "Presupuesto Base";
  }

  function totalsCompat(project){
    var t = (window.Calc && typeof Calc.calcTotals === "function")
      ? (Calc.calcTotals(project) || {})
      : {};

    return {
      directo: num(t.directo),
      admin: num(t.admin),
      imprev: num(t.imprev),
      util: num(t.util),
      subtotal: num(t.subtotal),
      ivaUtil: num((t.ivaUtil != null) ? t.ivaUtil : t.iva),
      total: num(t.total)
    };
  }

  function groupByChaptersCompat(project){
    if(window.Calc && typeof Calc.groupByChapters === "function"){
      return Calc.groupByChapters(project) || { groups:[], items:[] };
    }
    return {
      groups: [],
      items: (project && Array.isArray(project.items)) ? project.items : []
    };
  }

  function makeMetaRows(project, mode){
    var view = buildProjectView(project, mode);
    var totals = totalsCompat(view);

    var adminPct = pct(project, "adminPct", "aiuPct");
    var imprevPct = pct(project, "imprevPct", null);
    var utilPct = pct(project, "utilPct", null);
    var ivaUtilPct = pct(project, "ivaUtilPct", "ivaPct");

    return [
      ["PROYECTO", safe(project && project.name)],
      ["TIPO DE PRESUPUESTO", budgetLabel(mode)],
      ["ENTIDAD", safe(project && project.entity)],
      ["UBICACIÓN", safe(project && project.location)],
      ["MONEDA", safe((project && project.currency) || "COP")],
      ["ADMINISTRACIÓN (%)", adminPct],
      ["IMPREVISTOS (%)", imprevPct],
      ["UTILIDAD (%)", utilPct],
      ["IVA SOBRE UTILIDAD (%)", ivaUtilPct],
      [""],
      ["TOTAL COSTOS DIRECTOS", totals.directo],
      ["ADMINISTRACIÓN", totals.admin],
      ["IMPREVISTOS", totals.imprev],
      ["UTILIDAD", totals.util],
      ["SUBTOTAL", totals.subtotal],
      ["IVA SOBRE UTILIDAD", totals.ivaUtil],
      ["VALOR TOTAL", totals.total]
    ];
  }

  function makeItemsRows(project, mode){
    var view = buildProjectView(project, mode);
    var items = (view && Array.isArray(view.items)) ? view.items : [];

    return items.map(function(it){
      var parcial = num(it && it.pu) * num(it && it.qty);
      return {
        Tipo_Presupuesto: budgetLabel(mode),
        Capitulo: safe(it && it.chapterCode),
        Nombre_Capitulo: safe(it && it.chapterName),
        Codigo: safe(it && it.code),
        Codigo_APU_Ref: safe((it && (it.apuRefCode || it.code))),
        Descripcion: safe(it && it.desc),
        Unidad: safe(it && it.unit),
        Precio_Unitario: money(it && it.pu),
        Cantidad: num(it && it.qty),
        Valor_Parcial: money(parcial)
      };
    });
  }

  function makeChapterRows(project, mode){
    var view = buildProjectView(project, mode);
    var grouped = groupByChaptersCompat(view);
    var groups = (grouped && Array.isArray(grouped.groups)) ? grouped.groups : [];

    return groups.map(function(g){
      return {
        Tipo_Presupuesto: budgetLabel(mode),
        Capitulo: safe(g && g.chapterCode),
        Nombre_Capitulo: safe(g && g.chapterName),
        Items: num(g && g.itemsCount),
        Subtotal: money(g && g.subtotal)
      };
    });
  }

  function exportBudgetWorkbook(project, mode){
    ensureXLSX();

    var wb = XLSX.utils.book_new();

    var metaRows = makeMetaRows(project, mode);
    var itemsRows = makeItemsRows(project, mode);
    var chapterRows = makeChapterRows(project, mode);

    var wsResumen = XLSX.utils.aoa_to_sheet(metaRows);
    var wsCap = XLSX.utils.json_to_sheet(
      chapterRows.length ? chapterRows : [{
        Tipo_Presupuesto: budgetLabel(mode),
        Capitulo: "",
        Nombre_Capitulo: "",
        Items: "",
        Subtotal: ""
      }]
    );
    var wsItems = XLSX.utils.json_to_sheet(
      itemsRows.length ? itemsRows : [{
        Tipo_Presupuesto: budgetLabel(mode),
        Capitulo: "",
        Nombre_Capitulo: "",
        Codigo: "",
        Codigo_APU_Ref: "",
        Descripcion: "",
        Unidad: "",
        Precio_Unitario: "",
        Cantidad: "",
        Valor_Parcial: ""
      }]
    );

    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
    XLSX.utils.book_append_sheet(wb, wsCap, "Capitulos");
    XLSX.utils.book_append_sheet(wb, wsItems, "Items");

    var suffix = String(mode || "base").toLowerCase() === "oficial" ? "oficial" : "base";
    var filename = "presupuesto_" + suffix + "_" + sanitizeFileName(project && project.name) + "_" + Date.now() + ".xlsx";

    return downloadWorkbook(wb, filename);
  }

  function makeCompareRows(project){
    var rows = (window.Compare && typeof Compare.compareItems === "function") ? Compare.compareItems(project) : [];

    return rows.map(function(r){
      return {
        Estado: safe(r && r.status),
        Capitulo_Base: safe(r && r.chapterCodeBase),
        Nombre_Capitulo_Base: safe(r && r.chapterNameBase),
        Capitulo_Oficial: safe(r && r.chapterCodeOfficial),
        Nombre_Capitulo_Oficial: safe(r && r.chapterNameOfficial),
        Codigo: safe(r && r.code),
        Codigo_APU_Ref: safe(r && r.apuRefCode),
        Descripcion: safe(r && r.desc),
        Unidad: safe(r && r.unit),

        PU_Base: money(r && r.puBase),
        PU_Oficial: money(r && r.puOfficial),
        Diferencia_PU: money(r && r.puDiff),
        Diferencia_PU_Pct: num(r && r.puPctDiff),

        Cantidad_Base: num(r && r.qtyBase),
        Cantidad_Oficial: num(r && r.qtyOfficial),
        Diferencia_Cantidad: num(r && r.qtyDiff),
        Diferencia_Cantidad_Pct: num(r && r.qtyPctDiff),

        Parcial_Base: money(r && r.parcialBase),
        Parcial_Oficial: money(r && r.parcialOfficial),
        Diferencia_Parcial: money(r && r.parcialDiff),
        Diferencia_Parcial_Pct: num(r && r.parcialPctDiff)
      };
    });
  }

  function makeCompareChapterRows(project){
    var rows = (window.Compare && typeof Compare.compareChapters === "function") ? Compare.compareChapters(project) : [];

    return rows.map(function(r){
      return {
        Estado: safe(r && r.status),
        Capitulo: safe(r && r.chapterCode),
        Nombre_Capitulo: safe(r && r.chapterName),
        Items_Base: num(r && r.itemsCountBase),
        Items_Oficial: num(r && r.itemsCountOfficial),
        Diferencia_Items: num(r && r.itemsCountDiff),
        Subtotal_Base: money(r && r.subtotalBase),
        Subtotal_Oficial: money(r && r.subtotalOfficial),
        Diferencia_Subtotal: money(r && r.subtotalDiff),
        Diferencia_Subtotal_Pct: num(r && r.subtotalPctDiff)
      };
    });
  }

  function makeCompareTotalsRows(project){
    var totals = (window.Compare && typeof Compare.compareTotals === "function") ? Compare.compareTotals(project) : null;
    if(!totals){
      return [];
    }

    return [
      {
        Concepto: "Total costos directos",
        Base: money(totals && totals.base && totals.base.directo),
        Oficial: money(totals && totals.official && totals.official.directo),
        Diferencia: money(totals && totals.diff && totals.diff.directo),
        Diferencia_Pct: num(totals && totals.pct && totals.pct.directo)
      },
      {
        Concepto: "Administración",
        Base: money(totals && totals.base && totals.base.admin),
        Oficial: money(totals && totals.official && totals.official.admin),
        Diferencia: money(totals && totals.diff && totals.diff.admin),
        Diferencia_Pct: num(totals && totals.pct && totals.pct.admin)
      },
      {
        Concepto: "Imprevistos",
        Base: money(totals && totals.base && totals.base.imprev),
        Oficial: money(totals && totals.official && totals.official.imprev),
        Diferencia: money(totals && totals.diff && totals.diff.imprev),
        Diferencia_Pct: num(totals && totals.pct && totals.pct.imprev)
      },
      {
        Concepto: "Utilidad",
        Base: money(totals && totals.base && totals.base.util),
        Oficial: money(totals && totals.official && totals.official.util),
        Diferencia: money(totals && totals.diff && totals.diff.util),
        Diferencia_Pct: num(totals && totals.pct && totals.pct.util)
      },
      {
        Concepto: "Subtotal",
        Base: money(totals && totals.base && totals.base.subtotal),
        Oficial: money(totals && totals.official && totals.official.subtotal),
        Diferencia: money(totals && totals.diff && totals.diff.subtotal),
        Diferencia_Pct: num(totals && totals.pct && totals.pct.subtotal)
      },
      {
        Concepto: "IVA sobre utilidad",
        Base: money(totals && totals.base && totals.base.ivaUtil),
        Oficial: money(totals && totals.official && totals.official.ivaUtil),
        Diferencia: money(totals && totals.diff && totals.diff.ivaUtil),
        Diferencia_Pct: num(totals && totals.pct && totals.pct.ivaUtil)
      },
      {
        Concepto: "Valor total",
        Base: money(totals && totals.base && totals.base.total),
        Oficial: money(totals && totals.official && totals.official.total),
        Diferencia: money(totals && totals.diff && totals.diff.total),
        Diferencia_Pct: num(totals && totals.pct && totals.pct.total)
      }
    ];
  }

  function exportCompareWorkbook(project){
    ensureXLSX();

    var wb = XLSX.utils.book_new();

    var rowsItems = makeCompareRows(project);
    var rowsChapters = makeCompareChapterRows(project);
    var rowsTotals = makeCompareTotalsRows(project);

    var wsItems = XLSX.utils.json_to_sheet(
      rowsItems.length ? rowsItems : [{
        Estado: "",
        Capitulo_Base: "",
        Nombre_Capitulo_Base: "",
        Capitulo_Oficial: "",
        Nombre_Capitulo_Oficial: "",
        Codigo: "",
        Codigo_APU_Ref: "",
        Descripcion: "",
        Unidad: "",
        PU_Base: "",
        PU_Oficial: "",
        Diferencia_PU: "",
        Diferencia_PU_Pct: "",
        Cantidad_Base: "",
        Cantidad_Oficial: "",
        Diferencia_Cantidad: "",
        Diferencia_Cantidad_Pct: "",
        Parcial_Base: "",
        Parcial_Oficial: "",
        Diferencia_Parcial: "",
        Diferencia_Parcial_Pct: ""
      }]
    );

    var wsChapters = XLSX.utils.json_to_sheet(
      rowsChapters.length ? rowsChapters : [{
        Estado: "",
        Capitulo: "",
        Nombre_Capitulo: "",
        Items_Base: "",
        Items_Oficial: "",
        Diferencia_Items: "",
        Subtotal_Base: "",
        Subtotal_Oficial: "",
        Diferencia_Subtotal: "",
        Diferencia_Subtotal_Pct: ""
      }]
    );

    var wsTotals = XLSX.utils.json_to_sheet(
      rowsTotals.length ? rowsTotals : [{
        Concepto: "",
        Base: "",
        Oficial: "",
        Diferencia: "",
        Diferencia_Pct: ""
      }]
    );

    XLSX.utils.book_append_sheet(wb, wsTotals, "Totales");
    XLSX.utils.book_append_sheet(wb, wsChapters, "Capitulos");
    XLSX.utils.book_append_sheet(wb, wsItems, "Items");

    var filename = "comparativo_" + sanitizeFileName(project && project.name) + "_" + Date.now() + ".xlsx";
    return downloadWorkbook(wb, filename);
  }

  function makeAuditSummaryRows(project){
    var audit = (window.Audit && typeof Audit.runAudit === "function") ? Audit.runAudit(project) : null;
    if(!audit){
      return [];
    }

    var s = audit.summary || {};
    var risk = s.risk || {};
    var totals = s.totals || {};
    var findings = s.findings || {};
    var bySeverity = findings.bySeverity || {};

    return [
      ["Proyecto", safe(project && project.name)],
      ["Riesgo", safe(risk.level)],
      ["Puntaje", num(risk.score)],
      ["Severidad global", safe(risk.severity)],
      [""],
      ["Total Base", money(totals.base)],
      ["Total Oficial", money(totals.official)],
      ["Diferencia", money(totals.diff)],
      ["Diferencia (%)", num(totals.pct)],
      [""],
      ["Hallazgos totales", num(findings.total)],
      ["Críticos", num(bySeverity.critica)],
      ["Altos", num(bySeverity.alta)],
      ["Medios", num(bySeverity.media)],
      ["Bajos", num(bySeverity.baja)],
      [""],
      ["Comentario ejecutivo", safe(s.executiveComment)]
    ];
  }

  function makeAuditFindingRows(project){
    var audit = (window.Audit && typeof Audit.runAudit === "function") ? Audit.runAudit(project) : null;
    var findings = (audit && Array.isArray(audit.findings)) ? audit.findings : [];

    return findings.map(function(f){
      return {
        Severidad: safe(f && f.severity),
        Tipo: safe(f && f.type),
        Titulo: safe(f && f.title),
        Codigo: safe(f && f.code),
        Descripcion: safe(f && f.desc),
        Capitulo: safe(f && f.chapterCode),
        Nombre_Capitulo: safe(f && f.chapterName),
        Valor_Base: (f && f.baseValue == null) ? "" : money(f && f.baseValue),
        Valor_Oficial: (f && f.officialValue == null) ? "" : money(f && f.officialValue),
        Diferencia: (f && f.diffValue == null) ? "" : money(f && f.diffValue),
        Diferencia_Pct: (f && f.pctValue == null) ? "" : num(f && f.pctValue),
        Detalle: safe(f && f.detail),
        Recomendacion: safe(f && f.recommendation)
      };
    });
  }

  function exportAuditWorkbook(project){
    ensureXLSX();

    var wb = XLSX.utils.book_new();

    var summaryRows = makeAuditSummaryRows(project);
    var findingRows = makeAuditFindingRows(project);

    var wsResumen = XLSX.utils.aoa_to_sheet(
      summaryRows.length ? summaryRows : [["Sin datos de auditoría", ""]]
    );

    var wsFindings = XLSX.utils.json_to_sheet(
      findingRows.length ? findingRows : [{
        Severidad: "",
        Tipo: "",
        Titulo: "",
        Codigo: "",
        Descripcion: "",
        Capitulo: "",
        Nombre_Capitulo: "",
        Valor_Base: "",
        Valor_Oficial: "",
        Diferencia: "",
        Diferencia_Pct: "",
        Detalle: "",
        Recomendacion: ""
      }]
    );

    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
    XLSX.utils.book_append_sheet(wb, wsFindings, "Hallazgos");

    var filename = "auditoria_" + sanitizeFileName(project && project.name) + "_" + Date.now() + ".xlsx";
    return downloadWorkbook(wb, filename);
  }

  window.ExcelExport = {
    exportBudgetWorkbook: exportBudgetWorkbook,
    exportCompareWorkbook: exportCompareWorkbook,
    exportAuditWorkbook: exportAuditWorkbook
  };
})();