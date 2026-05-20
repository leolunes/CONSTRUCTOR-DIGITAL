function safeNum(v){
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function safeStr(v){
  return String(v ?? "").trim();
}

/* ==========================================
   ✅ DOBLE PRESUPUESTO (FASE 3 SEGURA)
   - Si existe project.budgets + activeBudget, calcula usando la rama activa
   - Si no existe, sigue usando la raíz actual del proyecto
   - NO rompe compatibilidad con la app actual
   ========================================== */
function normalizeBudgetMode(v){
  const s = safeStr(v).toLowerCase();
  return (s === "oficial" || s === "official") ? "oficial" : "base";
}

function cloneDeepSafe(obj){
  try{
    return JSON.parse(JSON.stringify(obj ?? null));
  }catch(_){
    return obj ?? null;
  }
}

function getBudgetAwareProject(project){
  const p = project || {};
  const budgets = (p && typeof p.budgets === "object" && !Array.isArray(p.budgets)) ? p.budgets : null;
  if(!budgets) return p;

  const mode = normalizeBudgetMode(p.activeBudget || "base");
  const active = mode === "oficial" ? budgets.oficial : budgets.base;
  if(!active || typeof active !== "object" || Array.isArray(active)) return p;

  const view = { ...p };

  if(Array.isArray(active.items)) view.items = cloneDeepSafe(active.items) || [];
  if(Array.isArray(active.chapters)) view.chapters = cloneDeepSafe(active.chapters) || [];
  if(active.apuOverrides && typeof active.apuOverrides === "object" && !Array.isArray(active.apuOverrides)){
    view.apuOverrides = cloneDeepSafe(active.apuOverrides) || {};
  }
  if(active.subApuOverrides && typeof active.subApuOverrides === "object" && !Array.isArray(active.subApuOverrides)){
    view.subApuOverrides = cloneDeepSafe(active.subApuOverrides) || {};
  }
  if("indirectMode" in active) view.indirectMode = String(active.indirectMode || "manual");
  if(Array.isArray(active.indirectTable)) view.indirectTable = cloneDeepSafe(active.indirectTable) || [];

  return view;
}

/* ==========================================
   INDIRECTOS POR TABLA
   - Soporta:
     1) manual  -> adminPct / imprevPct / utilPct / ivaUtilPct
     2) table   -> project.indirectTable
   - Cada fila puede ser:
     - fixed           => qty * unitValue
     - percent_direct  => directo * percent / 100
   - group esperado:
     - ADMIN
     - IMPREV
     - UTIL
     - OTRO / cualquier otro
   ========================================== */

function normalizeIndirectGroup(v){
  const s = safeStr(v).toUpperCase();
  if(!s) return "OTRO";

  if(
    s === "ADMIN" ||
    s === "ADMINISTRACION" ||
    s === "ADMINISTRACIÓN"
  ) return "ADMIN";

  if(
    s === "IMPREV" ||
    s === "IMPREVISTO" ||
    s === "IMPREVISTOS"
  ) return "IMPREV";

  if(
    s === "UTIL" ||
    s === "UTILIDAD" ||
    s === "UTILIDADES"
  ) return "UTIL";

  return "OTRO";
}

function normalizeIndirectCalcType(v){
  const s = safeStr(v).toLowerCase();
  if(
    s === "percent_direct" ||
    s === "percent-direct" ||
    s === "porcentaje_directo" ||
    s === "porcentaje-directo" ||
    s === "%directo" ||
    s === "%_directo"
  ) return "percent_direct";

  return "fixed";
}

function normalizeIndirectRow(row){
  const r = row || {};
  const rowType = safeStr(r.rowType).toLowerCase() === "header" ? "header" : "detail";

  return {
    id: safeStr(r.id),
    rowType,
    item: safeStr(r.item),
    group: normalizeIndirectGroup(r.group),
    desc: safeStr(r.desc),
    calcType: normalizeIndirectCalcType(r.calcType),
    unit: safeStr(r.unit),
    qty: safeNum(r.qty),
    unitValue: safeNum(r.unitValue),
    percent: safeNum(r.percent),
    partial: safeNum(r.partial),
    sourceType: safeStr(r.sourceType).toLowerCase(),
    sourceRef: safeStr(r.sourceRef),
    sourceLabel: safeStr(r.sourceLabel)
  };
}

function listIndirectRows(project){
  const view = getBudgetAwareProject(project);
  const arr = Array.isArray(view?.indirectTable) ? view.indirectTable : [];
  return arr.map(normalizeIndirectRow);
}

function calcIndirectTable(project, directo){
  const rows = listIndirectRows(project);

  let admin = 0;
  let imprev = 0;
  let util = 0;
  let otros = 0;

  const computedRows = rows.map(r=>{
    if(r.rowType === "header"){
      return {
        ...r,
        partial: 0
      };
    }

    let partial = 0;

    if(r.calcType === "percent_direct"){
      partial = safeNum(directo) * (safeNum(r.percent) / 100);
    }else{
      partial = safeNum(r.qty) * safeNum(r.unitValue);
    }

    const out = {
      ...r,
      partial
    };

    const g = normalizeIndirectGroup(r.group);
    if(g === "ADMIN") admin += partial;
    else if(g === "IMPREV") imprev += partial;
    else if(g === "UTIL") util += partial;
    else otros += partial;

    return out;
  });

  const adminPct = directo > 0 ? (admin / directo) * 100 : 0;
  const imprevPct = directo > 0 ? (imprev / directo) * 100 : 0;
  const utilPct = directo > 0 ? (util / directo) * 100 : 0;
  const otrosPct = directo > 0 ? (otros / directo) * 100 : 0;

  return {
    rows: computedRows,
    admin,
    imprev,
    util,
    otros,
    adminPct,
    imprevPct,
    utilPct,
    otrosPct
  };
}

function calcTotalsManual(project, directo){
  const view = getBudgetAwareProject(project);

  const adminPct = safeNum(
    view?.adminPct ?? view?.administracionPct ?? view?.aiuPct ?? 0
  );
  const imprevPct = safeNum(
    view?.imprevPct ?? view?.imprevistosPct ?? 0
  );
  const utilPct = safeNum(
    view?.utilPct ?? view?.utilidadPct ?? 0
  );
  const ivaUtilPct = safeNum(
    view?.ivaUtilPct ?? view?.ivaSobreUtilidadPct ?? view?.ivaPct ?? 0
  );

  const admin = directo * (adminPct / 100);
  const imprev = directo * (imprevPct / 100);
  const util = directo * (utilPct / 100);

  const subtotal = directo + admin + imprev + util;
  const iva = util * (ivaUtilPct / 100);
  const total = subtotal + iva;
  const aiu = admin + imprev + util;

  return {
    mode: "manual",
    directo,
    adminPct, imprevPct, utilPct, ivaUtilPct,
    admin, imprev, util,
    subtotal,
    iva,
    ivaUtil: iva,
    total,
    aiu,
    indirectRows: [],
    indirectOthers: 0,
    indirectOthersPct: 0
  };
}

function calcTotalsFromTable(project, directo){
  const view = getBudgetAwareProject(project);
  const indirect = calcIndirectTable(view, directo);

  const ivaUtilPct = safeNum(
    view?.ivaUtilPct ?? view?.ivaSobreUtilidadPct ?? view?.ivaPct ?? 0
  );

  const admin = safeNum(indirect.admin);
  const imprev = safeNum(indirect.imprev);
  const util = safeNum(indirect.util);
  const otros = safeNum(indirect.otros);

  const subtotal = directo + admin + imprev + util + otros;
  const iva = util * (ivaUtilPct / 100);
  const total = subtotal + iva;
  const aiu = admin + imprev + util;

  return {
    mode: "table",
    directo,

    adminPct: safeNum(indirect.adminPct),
    imprevPct: safeNum(indirect.imprevPct),
    utilPct: safeNum(indirect.utilPct),
    ivaUtilPct,

    admin,
    imprev,
    util,
    subtotal,

    iva,
    ivaUtil: iva,

    total,
    aiu,

    indirectRows: indirect.rows,
    indirectOthers: otros,
    indirectOthersPct: safeNum(indirect.otrosPct)
  };
}

function calcTotals(project){
  const view = getBudgetAwareProject(project);
  const items = Array.isArray(view?.items) ? view.items : [];
  const directo = items.reduce((s,it)=> s + (safeNum(it.pu) * safeNum(it.qty)), 0);

  const indirectMode = safeStr(view?.indirectMode || "manual").toLowerCase();

  if(indirectMode === "table"){
    return calcTotalsFromTable(view, directo);
  }

  return calcTotalsManual(view, directo);
}

function groupByChapters(project){
  const view = getBudgetAwareProject(project);
  const items = (Array.isArray(view?.items) ? view.items : []).map(it => ({
    ...it,
    parcial: safeNum(it.pu) * safeNum(it.qty)
  }));

  function chapterOf(it){
    const c = safeStr(it.chapterCode);
    if(c) return c;
    const code = safeStr(it.code);
    const ch = code.includes(".") ? code.split(".")[0] : "";
    return /^\d+$/.test(ch) ? ch : "SIN";
  }

  const map = new Map();
  for(const it of items){
    const ch = chapterOf(it);
    if(!map.has(ch)){
      map.set(ch, {
        chapterCode: ch,
        chapterName: it.chapterName || "",
        itemsCount: 0,
        subtotal: 0,
        items: []
      });
    }
    const g = map.get(ch);
    g.itemsCount += 1;
    g.subtotal += it.parcial;
    g.items.push(it);

    if(!g.chapterName && it.chapterName) g.chapterName = it.chapterName;
  }

  const groups = Array.from(map.values()).sort((a,b)=>{
    const an = Number(a.chapterCode), bn = Number(b.chapterCode);
    const aNum = Number.isFinite(an) && a.chapterCode !== "SIN";
    const bNum = Number.isFinite(bn) && b.chapterCode !== "SIN";
    if(aNum && bNum) return an - bn;
    if(a.chapterCode === "SIN") return 1;
    if(b.chapterCode === "SIN") return -1;
    return String(a.chapterCode).localeCompare(String(b.chapterCode));
  });

  return { groups, items };
}

window.Calc = {
  calcTotals,
  groupByChapters,
  calcIndirectTable
};
