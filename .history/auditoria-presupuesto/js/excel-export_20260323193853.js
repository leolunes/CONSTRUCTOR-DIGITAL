
  function buildProjectView(project, mode){
    const m = String(mode || "base").toLowerCase();

    if(m === "oficial"){
      return {
        ...project,
        items: Array.isArray(project?.oficialItems) ? project.oficialItems : [],
        chapters: Array.isArray(project?.oficialChapters) ? project.oficialChapters : [],
        apuOverrides: project?.oficialApuOverrides || {},
        __budgetMode: "oficial"
      };
    }

    return {
      ...project,
      items: Array.isArray(project?.items) ? project.items : [],
      chapters: Array.isArray(project?.chapters) ? project.chapters : [],
      apuOverrides: project?.apuOverrides || {},
      __budgetMode: "base"
    };
  }

  function budgetLabel(mode){
    return String(mode || "base").toLowerCase() === "oficial"
      ? "Presupuesto Oficial"
      : "Presupuesto Base";
  }

  function totalsCompat(project){
    const t = (window.Calc && typeof Calc.calcTotals === "function")
      ? (Calc.calcTotals(project) || {})
      : {};

    return {
      directo: num(t.directo),
      admin: num(t.admin),
      imprev: num(t.imprev),
      util: num(t.util),
      subtotal: num(t.subtotal),
      ivaUtil: num(t.ivaUtil ?? t.iva),
      total: num(t.total)
    };
  }

  function groupByChaptersCompat(project){
    if(window.Calc && typeof Calc.groupByChapters === "function"){
      return Calc.groupByChapters(project) || { groups:[], items:[] };
    }
    return {
      groups: [],
      items: Array.isArray(project?.items) ? project.items : []
    };
  }

  function makeMetaRows(project, mode){
    const view = buildProjectView(project, mode);
    const totals = totalsCompat(view);

    const adminPct = pct(project, "adminPct", "aiuPct");
    const imprevPct = pct(project, "imprevPct", null);
    const utilPct = pct(project, "utilPct", null);
    const ivaUtilPct = pct(project, "ivaUtilPct", "ivaPct");

    return [
      ["PROYECTO", safe(project?.name)],
      ["TIPO DE PRESUPUESTO", budgetLabel(mode)],
      ["ENTIDAD", safe(project?.entity)],
      ["UBICACIÓN", safe(project?.location)],
      ["MONEDA", safe(project?.currency || "COP")],
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
    const view = buildProjectView(project, mode);
    const items = Array.isArray(view?.items) ? view.items : [];

    return items.map(it => {
      const parcial = num(it?.pu) * num(it?.qty);
      return {
        Tipo_Presupuesto: budgetLabel(mode),
        Capitulo: safe(it?.chapterCode),
        Nombre_Capitulo: safe(it?.chapterName),
        Codigo: safe(it?.code),
        Codigo_APU_Ref: safe(it?.apuRefCode || it?.code),
        Descripcion: safe(it?.desc),
        Unidad: safe(it?.unit),
        Precio_Unitario: money(it?.pu),
        Cantidad: num(it?.qty),
        Valor_Parcial: money(parcial)
      };
    });
  }

  function makeChapterRows(project, mode){
    const view = buildProjectView(project, mode);
    const grouped = groupByChaptersCompat(view);
    const groups = Array.isArray(grouped?.groups) ? grouped.groups : [];

    return groups.map(g => ({
      Tipo_Presupuesto: budgetLabel(mode),
      Capitulo: safe(g?.chapterCode),
      Nombre_Capitulo: safe(g?.chapterName),
      Items: num(g?.itemsCount),
      Subtotal: money(g?.subtotal)
    }));
  }

  function exportBudgetWorkbook(project, mode){
    ensureXLSX();

    const wb = XLSX.utils.book_new();

    const metaRows = makeMetaRows(project, mode);
    const itemsRows = makeItemsRows(project, mode);
    const chapterRows = makeChapterRows(project, mode);

    const wsResumen = XLSX.utils.aoa_to_sheet(metaRows);
    const wsCap = XLSX.utils.json_to_sheet(
      chapterRows.length ? chapterRows : [{
        Tipo_Presupuesto: budgetLabel(mode),
        Capitulo: "",
        Nombre_Capitulo: "",
        Items: "",
        Subtotal: ""
      }]
    );
    const wsItems = XLSX.utils.json_to_sheet(
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

    const suffix = String(mode || "base").toLowerCase() === "oficial" ? "oficial" : "base";
    const filename = `presupuesto_${suffix}_${sanitizeFileName(project?.name)}_${Date.now()}.xlsx`;

    return downloadWorkbook(wb, filename);
  }

  function makeCompareRows(project){
    const rows = window.Compare?.compareItems ? Compare.compareItems(project) : [];

    return rows.map(r => ({
      Estado: safe(r?.status),
      Capitulo_Base: safe(r?.chapterCodeBase),
      Nombre_Capitulo_Base: safe(r?.chapterNameBase),
      Capitulo_Oficial: safe(r?.chapterCodeOfficial),
      Nombre_Capitulo_Oficial: safe(r?.chapterNameOfficial),
      Codigo: safe(r?.code),
      Codigo_APU_Ref: safe(r?.apuRefCode),
      Descripcion: safe(r?.desc),
      Unidad: safe(r?.unit),

      PU_Base: money(r?.puBase),
      PU_Oficial: money(r?.puOfficial),
      Diferencia_PU: money(r?.puDiff),
      Diferencia_PU_Pct: num(r?.puPctDiff),

      Cantidad_Base: num(r?.qtyBase),
      Cantidad_Oficial: num(r?.qtyOfficial),
      Diferencia_Cantidad: num(r?.qtyDiff),
      Diferencia_Cantidad_Pct: num(r?.qtyPctDiff),

      Parcial_Base: money(r?.parcialBase),
      Parcial_Oficial: money(r?.parcialOfficial),
      Diferencia_Parcial: money(r?.parcialDiff),
      Diferencia_Parcial_Pct: num(r?.parcialPctDiff)
    }));
  }

  function makeCompareChapterRows(project){
    const rows = window.Compare?.compareChapters ? Compare.compareChapters(project) : [];

    return rows.map(r => ({
      Estado: safe(r?.status),
      Capitulo: safe(r?.chapterCode),
      Nombre_Capitulo: safe(r?.chapterName),
      Items_Base: num(r?.itemsCountBase),
      Items_Oficial: num(r?.itemsCountOfficial),
      Diferencia_Items: num(r?.itemsCountDiff),
      Subtotal_Base: money(r?.subtotalBase),
      Subtotal_Oficial: money(r?.subtotalOfficial),
      Diferencia_Subtotal: money(r?.subtotalDiff),
      Diferencia_Subtotal_Pct: num(r?.subtotalPctDiff)
    }));
  }

  function makeCompareTotalsRows(project){
    const totals = window.Compare?.compareTotals ? Compare.compareTotals(project) : null;
    if(!totals){
      return [];
    }

    return [
      {
        Concepto: "Total costos directos",
        Base: money(totals?.base?.directo),
        Oficial: money(totals?.official?.directo),
        Diferencia: money(totals?.diff?.directo),
        Diferencia_Pct: num(totals?.pct?.directo)
      },
      {
        Concepto: "Administración",
        Base: money(totals?.base?.admin),
        Oficial: money(totals?.official?.admin),
        Diferencia: money(totals?.diff?.admin),
        Diferencia_Pct: num(totals?.pct?.admin)
      },
      {
        Concepto: "Imprevistos",
        Base: money(totals?.base?.imprev),
        Oficial: money(totals?.official?.imprev),
        Diferencia: money(totals?.diff?.imprev),
        Diferencia_Pct: num(totals?.pct?.imprev)
      },
      {
        Concepto: "Utilidad",
        Base: money(totals?.base?.util),
        Oficial: money(totals?.official?.util),
        Diferencia: money(totals?.diff?.util),
        Diferencia_Pct: num(totals?.pct?.util)
      },
      {
        Concepto: "Subtotal",
        Base: money(totals?.base?.subtotal),
        Oficial: money(totals?.official?.subtotal),
        Diferencia: money(totals?.diff?.subtotal),
        Diferencia_Pct: num(totals?.pct?.subtotal)
      },
      {
        Concepto: "IVA sobre utilidad",
        Base: money(totals?.base?.ivaUtil),
        Oficial: money(totals?.official?.ivaUtil),
        Diferencia: money(totals?.diff?.ivaUtil),
        Diferencia_Pct: num(totals?.pct?.ivaUtil)
      },
      {
        Concepto: "Valor total",
        Base: money(totals?.base?.total),
        Oficial: money(totals?.official?.total),
        Diferencia: money(totals?.diff?.total),
        Diferencia_Pct: num(totals?.pct?.total)
      }
    ];
  }

  function exportCompareWorkbook(project){
    ensureXLSX();

    const wb = XLSX.utils.book_new();

    const rowsItems = makeCompareRows(project);
    const rowsChapters = makeCompareChapterRows(project);
    const rowsTotals = makeCompareTotalsRows(project);

    const wsItems = XLSX.utils.json_to_sheet(
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

    const wsChapters = XLSX.utils.json_to_sheet(
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

    const wsTotals = XLSX.utils.json_to_sheet(
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

    const filename = `comparativo_${sanitizeFileName(project?.name)}_${Date.now()}.xlsx`;
    return downloadWorkbook(wb, filename);
  }

  function makeAuditSummaryRows(project){
    const audit = window.Audit?.runAudit ? Audit.runAudit(project) : null;
    if(!audit){
      return [];
    }

    const s = audit.summary || {};
    const risk = s.risk || {};
    const totals = s.totals || {};
    const findings = s.findings || {};
    const bySeverity = findings.bySeverity || {};

    return [
      ["Proyecto", safe(project?.name)],
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
    const audit = window.Audit?.runAudit ? Audit.runAudit(project) : null;
    const findings = Array.isArray(audit?.findings) ? audit.findings : [];

    return findings.map(f => ({
      Severidad: safe(f?.severity),
      Tipo: safe(f?.type),
      Titulo: safe(f?.title),
      Codigo: safe(f?.code),
      Descripcion: safe(f?.desc),
      Capitulo: safe(f?.chapterCode),
      Nombre_Capitulo: safe(f?.chapterName),
      Valor_Base: f?.baseValue == null ? "" : money(f?.baseValue),
      Valor_Oficial: f?.officialValue == null ? "" : money(f?.officialValue),
      Diferencia: f?.diffValue == null ? "" : money(f?.diffValue),
      Diferencia_Pct: f?.pctValue == null ? "" : num(f?.pctValue),
      Detalle: safe(f?.detail),
      Recomendacion: safe(f?.recommendation)
    }));
  }

  function exportAuditWorkbook(project){
    ensureXLSX();

    const wb = XLSX.utils.book_new();

    const summaryRows = makeAuditSummaryRows(project);
    const findingRows = makeAuditFindingRows(project);

    const wsResumen = XLSX.utils.aoa_to_sheet(
      summaryRows.length ? summaryRows : [["Sin datos de auditoría", ""]]
    );

    const wsFindings = XLSX.utils.json_to_sheet(
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

    const filename = `auditoria_${sanitizeFileName(project?.name)}_${Date.now()}.xlsx`;
    return downloadWorkbook(wb, filename);
  }

  window.ExcelExport = {
    exportBudgetWorkbook,
    exportCompareWorkbook,
    exportAuditWorkbook
  };
})();