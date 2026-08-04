// js/calc.js
// PRESUPUESTO PRO — Cálculos del presupuesto
// Versión con dos métodos de costos indirectos:
// 1) AIU por porcentajes
// 2) Costos indirectos estructurados

(function(){
  "use strict";

  /* =========================================================
     HELPERS GENERALES
     ========================================================= */

  function num(value, fallback = 0){
    const n = Number(
      String(value ?? "")
        .trim()
        .replace(/\s+/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
    );

    return Number.isFinite(n) ? n : fallback;
  }

  function safeText(value){
    return String(value ?? "").trim();
  }

  function normalizeMode(project){
    const raw = safeText(
      project?.indirectCostMode ||
      project?.aiuMode ||
      project?.costosIndirectosModo ||
      "percentages"
    ).toLowerCase();

    if(
      raw === "structured" ||
      raw === "structure" ||
      raw === "estructurado" ||
      raw === "estructura"
    ){
      return "structured";
    }

    return "percentages";
  }

  function normalizeCalcType(line){
    const raw = safeText(
      line?.calcType ||
      line?.calculationType ||
      line?.tipoCalculo ||
      line?.unit ||
      line?.unidadCalculo ||
      "QTY_PU"
    ).toUpperCase();

    if(
      raw === "%CD" ||
      raw === "PCT_CD" ||
      raw === "PORCENTAJE_CD" ||
      raw === "PERCENT_DIRECT"
    ){
      return "PCT_CD";
    }

    if(
      raw === "%U" ||
      raw === "PCT_UTIL" ||
      raw === "PORCENTAJE_UTILIDAD" ||
      raw === "PERCENT_UTILITY"
    ){
      return "PCT_UTIL";
    }

    if(
      raw === "%AIU" ||
      raw === "PCT_AIU" ||
      raw === "PORCENTAJE_AIU"
    ){
      return "PCT_AIU";
    }

    if(
      raw === "FIJO" ||
      raw === "FIXED" ||
      raw === "VALOR_FIJO"
    ){
      return "FIXED";
    }

    return "QTY_PU";
  }

  function normalizeCategory(line){
    const raw = safeText(
      line?.category ||
      line?.categoria ||
      line?.groupType ||
      line?.tipoGrupo ||
      line?.chapterType ||
      ""
    ).toUpperCase();

    if(raw.includes("ADMIN")) return "ADMIN";
    if(raw.includes("IMPREV")) return "IMPREV";
    if(raw.includes("UTIL")) return "UTIL";
    if(raw === "IVA" || raw.includes("IVA")) return "IVA";
    return "OTHER";
  }

  function uidFallback(prefix="ind"){
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  }

  /* =========================================================
     COSTOS DIRECTOS
     ========================================================= */

  function calcDirectCost(project){
    const items = Array.isArray(project?.items) ? project.items : [];

    return items.reduce((sum, item)=>{
      return sum + (num(item?.pu) * num(item?.qty));
    }, 0);
  }

  /* =========================================================
     MÉTODO 1 — AIU POR PORCENTAJES
     ========================================================= */

  function calcPercentageIndirects(project, directo){
    const adminPct = num(
      project?.adminPct ??
      project?.administracionPct ??
      project?.aiuPct ??
      0
    );

    const imprevPct = num(
      project?.imprevPct ??
      project?.imprevistosPct ??
      0
    );

    const utilPct = num(
      project?.utilPct ??
      project?.utilidadPct ??
      0
    );

    const ivaUtilPct = num(
      project?.ivaUtilPct ??
      project?.ivaSobreUtilidadPct ??
      project?.ivaPct ??
      0
    );

    const admin = directo * (adminPct / 100);
    const imprev = directo * (imprevPct / 100);
    const util = directo * (utilPct / 100);
    const ivaUtil = util * (ivaUtilPct / 100);

    const aiu = admin + imprev + util;
    const indirectTotal = aiu + ivaUtil;
    const subtotal = directo + aiu;
    const total = directo + indirectTotal;

    return {
      mode: "percentages",

      directo,

      adminPct,
      imprevPct,
      utilPct,
      ivaUtilPct,

      admin,
      imprev,
      util,

      iva: ivaUtil,
      ivaUtil,

      aiu,
      otherIndirect: 0,
      indirectTotal,

      subtotal,
      total,

      structuredChapters: [],
      structuredLines: []
    };
  }

  /* =========================================================
     MÉTODO 2 — COSTOS INDIRECTOS ESTRUCTURADOS
     ========================================================= */

  function normalizeStructuredChapters(project){
    const source =
      project?.indirectCostStructure?.chapters ??
      project?.indirectChapters ??
      project?.costosIndirectosEstructura?.chapters ??
      [];

    const chapters = Array.isArray(source) ? source : [];

    return chapters.map((chapter, index)=>({
      id: safeText(chapter?.id) || uidFallback("indchap"),
      code: safeText(
        chapter?.code ??
        chapter?.chapterCode ??
        chapter?.codigo ??
        String(index + 1)
      ),
      name: safeText(
        chapter?.name ??
        chapter?.chapterName ??
        chapter?.nombre ??
        `CAPÍTULO ${index + 1}`
      ),
      category: normalizeCategory(chapter),
      order: num(chapter?.order ?? index, index)
    }));
  }

  function normalizeStructuredLines(project){
    const source =
      project?.indirectCostStructure?.lines ??
      project?.indirectLines ??
      project?.costosIndirectosEstructura?.lines ??
      [];

    const lines = Array.isArray(source) ? source : [];

    return lines.map((line, index)=>({
      id: safeText(line?.id) || uidFallback("indline"),

      chapterId: safeText(
        line?.chapterId ??
        line?.indirectChapterId ??
        line?.capituloId ??
        ""
      ),

      chapterCode: safeText(
        line?.chapterCode ??
        line?.capituloCodigo ??
        ""
      ),

      chapterName: safeText(
        line?.chapterName ??
        line?.capituloNombre ??
        ""
      ),

      code: safeText(
        line?.code ??
        line?.codigo ??
        ""
      ),

      desc: safeText(
        line?.desc ??
        line?.description ??
        line?.concepto ??
        ""
      ),

      unit: safeText(
        line?.unit ??
        line?.unidad ??
        ""
      ),

      category: normalizeCategory(line),
      calcType: normalizeCalcType(line),

      qty: num(
        line?.qty ??
        line?.quantity ??
        line?.cantidad ??
        line?.percentage ??
        line?.porcentaje ??
        0
      ),

      pu: num(
        line?.pu ??
        line?.unitPrice ??
        line?.precioUnitario ??
        line?.fixedValue ??
        line?.valorFijo ??
        0
      ),

      manualBase: num(
        line?.base ??
        line?.calculationBase ??
        line?.baseCalculo ??
        0
      ),

      order: num(line?.order ?? index, index),
      enabled: line?.enabled !== false && line?.activo !== false
    }));
  }

  function findChapterForLine(chapters, line){
    if(line.chapterId){
      const byId = chapters.find(ch => ch.id === line.chapterId);
      if(byId) return byId;
    }

    if(line.chapterCode){
      const byCode = chapters.find(ch => ch.code === line.chapterCode);
      if(byCode) return byCode;
    }

    return null;
  }

  function calcStructuredLine(line, context){
    const {
      directo,
      utilidadAcumulada,
      aiuAcumulado
    } = context;

    const calcType = normalizeCalcType(line);

    let base = 0;
    let parcial = 0;

    if(calcType === "PCT_CD"){
      base = directo;
      parcial = base * (num(line.qty) / 100);
    }

    if(calcType === "PCT_UTIL"){
      base = utilidadAcumulada;
      parcial = base * (num(line.qty) / 100);
    }

    if(calcType === "PCT_AIU"){
      base = aiuAcumulado;
      parcial = base * (num(line.qty) / 100);
    }

    if(calcType === "FIXED"){
      base = num(line.pu);
      parcial = base;
    }

    if(calcType === "QTY_PU"){
      base = num(line.pu);
      parcial = num(line.qty) * num(line.pu);
    }

    return {
      ...line,
      calcType,
      base,
      parcial
    };
  }

  function calcStructuredIndirects(project, directo){
    const chapters = normalizeStructuredChapters(project)
      .sort((a,b)=>{
        if(a.order !== b.order) return a.order - b.order;
        return String(a.code).localeCompare(String(b.code), "es");
      });

    const lines = normalizeStructuredLines(project)
      .filter(line => line.enabled)
      .sort((a,b)=>{
        if(a.order !== b.order) return a.order - b.order;
        return String(a.code).localeCompare(String(b.code), "es");
      });

    let admin = 0;
    let imprev = 0;
    let util = 0;
    let ivaUtil = 0;
    let otherIndirect = 0;

    const calculatedLines = [];

    /*
      El orden importa:
      - una línea %U necesita que la utilidad ya haya sido calculada;
      - una línea %AIU necesita que administración, imprevistos y utilidad
        ya se hayan acumulado.
    */
    for(const rawLine of lines){
      const chapter = findChapterForLine(chapters, rawLine);

      const category =
        rawLine.category !== "OTHER"
          ? rawLine.category
          : (chapter?.category || "OTHER");

      const aiuAcumulado = admin + imprev + util;

      const calculated = calcStructuredLine(
        { ...rawLine, category },
        {
          directo,
          utilidadAcumulada: util,
          aiuAcumulado
        }
      );

      calculated.chapterId = chapter?.id || rawLine.chapterId || "";
      calculated.chapterCode = chapter?.code || rawLine.chapterCode || "";
      calculated.chapterName = chapter?.name || rawLine.chapterName || "";

      if(category === "ADMIN") admin += calculated.parcial;
      else if(category === "IMPREV") imprev += calculated.parcial;
      else if(category === "UTIL") util += calculated.parcial;
      else if(category === "IVA") ivaUtil += calculated.parcial;
      else otherIndirect += calculated.parcial;

      calculatedLines.push(calculated);
    }

    const calculatedChapters = chapters.map(chapter=>{
      const chapterLines = calculatedLines.filter(line=>{
        return (
          line.chapterId === chapter.id ||
          (
            !line.chapterId &&
            line.chapterCode &&
            line.chapterCode === chapter.code
          )
        );
      });

      const subtotal = chapterLines.reduce(
        (sum,line)=>sum + num(line.parcial),
        0
      );

      return {
        ...chapter,
        lines: chapterLines,
        subtotal
      };
    });

    /*
      Las líneas sin capítulo también deben conservarse.
    */
    const orphanLines = calculatedLines.filter(line=>{
      return !calculatedChapters.some(chapter=>{
        return chapter.lines.some(chLine => chLine.id === line.id);
      });
    });

    if(orphanLines.length){
      calculatedChapters.push({
        id: "indchap_sin_capitulo",
        code: "SIN",
        name: "SIN CAPÍTULO",
        category: "OTHER",
        order: 999999,
        lines: orphanLines,
        subtotal: orphanLines.reduce(
          (sum,line)=>sum + num(line.parcial),
          0
        )
      });
    }

    const aiu = admin + imprev + util;
    const indirectTotal = aiu + ivaUtil + otherIndirect;
    const subtotal = directo + admin + imprev + util + otherIndirect;
    const total = directo + indirectTotal;

    const adminPct = directo ? (admin / directo) * 100 : 0;
    const imprevPct = directo ? (imprev / directo) * 100 : 0;
    const utilPct = directo ? (util / directo) * 100 : 0;
    const ivaUtilPct = util ? (ivaUtil / util) * 100 : 0;

    return {
      mode: "structured",

      directo,

      adminPct,
      imprevPct,
      utilPct,
      ivaUtilPct,

      admin,
      imprev,
      util,

      iva: ivaUtil,
      ivaUtil,

      aiu,
      otherIndirect,
      indirectTotal,

      subtotal,
      total,

      structuredChapters: calculatedChapters,
      structuredLines: calculatedLines
    };
  }

  /* =========================================================
     FUNCIÓN PRINCIPAL
     ========================================================= */

  function calcTotals(project){
    const directo = calcDirectCost(project);
    const mode = normalizeMode(project);

    if(mode === "structured"){
      return calcStructuredIndirects(project, directo);
    }

    return calcPercentageIndirects(project, directo);
  }

  /* =========================================================
     AGRUPACIÓN DE ÍTEMS POR CAPÍTULOS
     ========================================================= */

  function groupByChapters(project){
    const items = (Array.isArray(project?.items) ? project.items : []).map(item => ({
      ...item,
      parcial: num(item?.pu) * num(item?.qty)
    }));

    function chapterOf(item){
      const explicit = safeText(item?.chapterCode);
      if(explicit) return explicit;

      const code = safeText(item?.code);
      const chapter = code.includes(".") ? code.split(".")[0] : "";

      return /^\d+$/.test(chapter) ? chapter : "SIN";
    }

    const map = new Map();

    for(const item of items){
      const chapterCode = chapterOf(item);

      if(!map.has(chapterCode)){
        map.set(chapterCode, {
          chapterCode,
          chapterName: safeText(item?.chapterName),
          itemsCount: 0,
          subtotal: 0,
          items: []
        });
      }

      const group = map.get(chapterCode);

      group.itemsCount += 1;
      group.subtotal += num(item.parcial);
      group.items.push(item);

      if(!group.chapterName && item?.chapterName){
        group.chapterName = safeText(item.chapterName);
      }
    }

    const groups = Array.from(map.values()).sort((a,b)=>{
      const an = Number(a.chapterCode);
      const bn = Number(b.chapterCode);

      const aNum = Number.isFinite(an) && a.chapterCode !== "SIN";
      const bNum = Number.isFinite(bn) && b.chapterCode !== "SIN";

      if(aNum && bNum) return an - bn;
      if(a.chapterCode === "SIN") return 1;
      if(b.chapterCode === "SIN") return -1;

      return String(a.chapterCode).localeCompare(
        String(b.chapterCode),
        "es"
      );
    });

    return { groups, items };
  }

  /* =========================================================
     API PÚBLICA
     ========================================================= */

  window.Calc = {
    calcTotals,
    groupByChapters,

    // Utilidades para la interfaz y los PDF
    calcDirectCost,
    normalizeMode,
    normalizeCalcType,
    normalizeCategory,
    normalizeStructuredChapters,
    normalizeStructuredLines
  };

})();