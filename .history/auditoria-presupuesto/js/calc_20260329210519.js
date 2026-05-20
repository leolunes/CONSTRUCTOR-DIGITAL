function safeNum(v){
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function safeStr(v){
  return String(v ?? "").trim();
}

const BUDGET_BASE = "base";
const BUDGET_OFFICIAL = "official";

function normalizeBudgetMode(v){
  return String(v || "").toLowerCase() === BUDGET_OFFICIAL ? BUDGET_OFFICIAL : BUDGET_BASE;
}

function deepClone(obj){
  try{
    return JSON.parse(JSON.stringify(obj));
  }catch(_){
    return obj;
  }
}

/* ==========================================
   PRESUPUESTO ACTIVO / PRESUPUESTOS DUALES
   - Compatibilidad total con esquema viejo
   - Soporta:
     project.items (legacy)
     project.budgetBase
     project.budgetOfficial
     project.activeBudget
   ========================================== */
function makeEmptyBudget(){
  return {
    items: [],
    apuOverrides: {},
    subApuOverrides: {},
    adminPct: 18,
    imprevPct: 2,
    utilPct: 5,
    ivaUtilPct: 19,
    aiuPct: 25,
    ivaPct: 19,
    ivaBase: "sobre_directo_aiu",
    indirectMode: "manual",
    indirectTable: []
  };
}

function applyBudgetCompat(budget){
  const b = { ...makeEmptyBudget(), ...(budget || {}) };

  const hasNew =
    (b.adminPct != null) ||
    (b.imprevPct != null) ||
    (b.utilPct != null) ||
    (b.ivaUtilPct != null);

  if(!hasNew){
    const legacyAIU = safeNum(b.aiuPct ?? 25);
    const legacyIVA = safeNum(b.ivaPct ?? 19);
    b.adminPct = legacyAIU;
    b.imprevPct = 0;
    b.utilPct = 0;
    b.ivaUtilPct = legacyIVA;
  }else{
    b.adminPct = safeNum(b.adminPct ?? 18);
    b.imprevPct = safeNum(b.imprevPct ?? 2);
    b.utilPct = safeNum(b.utilPct ?? 5);
    b.ivaUtilPct = safeNum(b.ivaUtilPct ?? 19);
  }

  const aiuCompat = safeNum(b.adminPct) + safeNum(b.imprevPct) + safeNum(b.utilPct);
  b.aiuPct = safeNum(b.aiuPct || aiuCompat);
  b.ivaPct = safeNum(b.ivaPct || b.ivaUtilPct || 19);
  b.ivaBase = safeStr(b.ivaBase || "sobre_directo_aiu");
  b.items = Array.isArray(b.items) ? b.items : [];
  b.indirectMode = safeStr(b.indirectMode || "manual").toLowerCase() || "manual";
  b.indirectTable = Array.isArray(b.indirectTable) ? b.indirectTable : [];

  return b;
}

function extractLegacyRootBudget(project){
  return applyBudgetCompat({
    items: Array.isArray(project?.items) ? deepClone(project.items) : [],
    apuOverrides: project?.apuOverrides || {},
    subApuOverrides: project?.subApuOverrides || {},
    adminPct: project?.adminPct,
    imprevPct: project?.imprevPct,
    utilPct: project?.utilPct,
    ivaUtilPct: project?.ivaUtilPct,
    aiuPct: project?.aiuPct,
    ivaPct: project?.ivaPct,
    ivaBase: project?.ivaBase,
    indirectMode: project?.indirectMode,
    indirectTable: Array.isArray(project?.indirectTable) ? deepClone(project.indirectTable) : []
  });
}

function getBudget(project, mode){
  const p = project || {};
  const m = normalizeBudgetMode(mode || p.activeBudget);

  if(m === BUDGET_OFFICIAL){
    if(p.budgetOfficial && typeof p.budgetOfficial === "object"){
      return applyBudgetCompat(p.budgetOfficial);
    }
    return applyBudgetCompat(makeEmptyBudget());
  }

  if(p.budgetBase && typeof p.budgetBase === "object"){
    return applyBudgetCompat(p.budgetBase);
  }

  return extractLegacyRootBudget(p);
}

function getActiveBudget(project){
  return getBudget(project, project?.activeBudget);
}

function makeProjectViewForBudget(project, mode){
  const p = project || {};
  const budget = getBudget(p, mode);
  return {
    ...p,
    activeBudget: normalizeBudgetMode(mode || p.activeBudget),
    items: Array.isArray(budget.items) ? budget.items : [],
    apuOverrides: budget.apuOverrides || {},
    subApuOverrides: budget.subApuOverrides || {},
    adminPct: safeNum(budget.adminPct),
    imprevPct: safeNum(budget.imprevPct),
    utilPct: safeNum(budget.utilPct),
    ivaUtilPct: safeNum(budget.ivaUtilPct),
    aiuPct: safeNum(budget.aiuPct),
    ivaPct: safeNum(budget.ivaPct),
    ivaBase: safeStr(budget.ivaBase || "sobre_directo_aiu"),
    indirectMode: safeStr(budget.indirectMode || "manual"),
    indirectTable: Array.isArray(budget.indirectTable) ? budget.indirectTable : []
  };
}

/* ==========================================
   INDIRECTOS POR TABLA
   - Soporta:
     1) manual  -> adminPct / imprevPct / utilPct / ivaUtilPct
     2) table   -> budget.indirectTable o project.indirectTable
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
  return {
    id: safeStr(r.id),
    rowType: safeStr(r.rowType || "detail").toLowerCase() === "header" ? "header" : "detail",
    item: safeStr(r.item),
    group: normalizeIndirectGroup(r.group),
    desc: safeStr(r.desc),
    calcType: normalizeIndirectCalcType(r.calcType),
    unit: safeStr(r.unit),
    qty: safeNum(r.qty),
    unitValue: safeNum(r.unitValue),
    percent: safeNum(r.percent),
    partial: safeNum(r.partial),
    sourceType: safeStr(r.sourceType),
    sourceRef: safeStr(r.sourceRef),
    sourceLabel: safeStr(r.sourceLabel)
  };
}

function listIndirectRows(projectOrBudget){
  const source = projectOrBudget || {};
  const arr = Array.isArray(source?.indirectTable) ? source.indirectTable : [];
  return arr.map(normalizeIndirectRow);
}

function calcIndirectTable(projectOrBudget, directo){
  const rows = listIndirectRows(projectOrBudget);

  let admin = 0;
  let imprev = 0;
  let util = 0;
  let otros = 0;

  const computedRows = rows.map(r=>{
    let partial = 0;

    if(r.rowType === "header"){
      partial = 0;
    }else if(r.calcType === "percent_direct"){
      partial = safeNum(directo) * (safeNum(r.percent) / 100);
    }else{
      partial = safeNum(r.qty) * safeNum(r.unitValue);
    }

    const out = {
      ...r,
      partial
    };

    if(r.rowType !== "header"){
      const g = normalizeIndirectGroup(r.group);
      if(g === "ADMIN") admin += partial;
      else if(g === "IMPREV") imprev += partial;
      else if(g === "UTIL") util += partial;
      else otros += partial;
    }

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

function calcTotalsManual(projectOrBudget, directo){
  const adminPct = safeNum(
    projectOrBudget?.adminPct ?? projectOrBudget?.administracionPct ?? projectOrBudget?.aiuPct ?? 0
  );
  const imprevPct = safeNum(
    projectOrBudget?.imprevPct ?? projectOrBudget?.imprevistosPct ?? 0
  );
  const utilPct = safeNum(
    projectOrBudget?.utilPct ?? projectOrBudget?.utilidadPct ?? 0
  );
  const ivaUtilPct = safeNum(
    projectOrBudget?.ivaUtilPct ?? projectOrBudget?.ivaSobreUtilidadPct ?? projectOrBudget?.ivaPct ?? 0
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

function calcTotalsFromTable(projectOrBudget, directo){
  const indirect = calcIndirectTable(projectOrBudget, directo);

  const ivaUtilPct = safeNum(
    projectOrBudget?.ivaUtilPct ?? projectOrBudget?.ivaSobreUtilidadPct ?? projectOrBudget?.ivaPct ?? 0
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

function calcTotals(project, mode){
  const view = makeProjectViewForBudget(project, mode);
  const items = Array.isArray(view.items) ? view.items : [];
  const directo = items.reduce((s,it)=> s + (safeNum(it.pu) * safeNum(it.qty)), 0);

  const indirectMode = safeStr(view?.indirectMode || "manual").toLowerCase();

  if(indirectMode === "table"){
    return calcTotalsFromTable(view, directo);
  }

  return calcTotalsManual(view, directo);
}

function groupByChapters(project, mode){
  const view = makeProjectViewForBudget(project, mode);
  const items = (view.items || []).map(it => ({
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

/* ==========================================
   COMPARATIVO BASE vs OFICIAL
   ========================================== */
function itemKey(it){
  return safeStr(it?.id) || safeStr(it?.apuRefCode) || safeStr(it?.code) || safeStr(it?.desc);
}

function toComparableItem(it){
  const pu = safeNum(it?.pu);
  const qty = safeNum(it?.qty);
  return {
    id: safeStr(it?.id),
    chapterCode: safeStr(it?.chapterCode),
    chapterName: safeStr(it?.chapterName),
    code: safeStr(it?.code),
    apuRefCode: safeStr(it?.apuRefCode),
    desc: safeStr(it?.desc),
    unit: safeStr(it?.unit),
    pu,
    qty,
    parcial: pu * qty
  };
}

function calcBudgetComparison(project){
  const baseView = makeProjectViewForBudget(project, BUDGET_BASE);
  const officialView = makeProjectViewForBudget(project, BUDGET_OFFICIAL);

  const totalsBase = calcTotals(project, BUDGET_BASE);
  const totalsOfficial = calcTotals(project, BUDGET_OFFICIAL);

  const baseItems = (baseView.items || []).map(toComparableItem);
  const officialItems = (officialView.items || []).map(toComparableItem);

  const baseMap = new Map(baseItems.map(it => [itemKey(it), it]));
  const officialMap = new Map(officialItems.map(it => [itemKey(it), it]));

  const keys = Array.from(new Set([...baseMap.keys(), ...officialMap.keys()]));

  const itemDiffs = keys.map(key => {
    const b = baseMap.get(key) || null;
    const o = officialMap.get(key) || null;

    const baseParcial = safeNum(b?.parcial);
    const officialParcial = safeNum(o?.parcial);
    const diffParcial = officialParcial - baseParcial;
    const diffPct = baseParcial > 0 ? (diffParcial / baseParcial) * 100 : (officialParcial > 0 ? 100 : 0);

    return {
      key,
      status: b && o ? "modified" : (b ? "only_base" : "only_official"),
      chapterCode: safeStr(o?.chapterCode || b?.chapterCode),
      chapterName: safeStr(o?.chapterName || b?.chapterName),
      codeBase: safeStr(b?.code),
      codeOfficial: safeStr(o?.code),
      apuRefCode: safeStr(o?.apuRefCode || b?.apuRefCode),
      desc: safeStr(o?.desc || b?.desc),
      unit: safeStr(o?.unit || b?.unit),
      qtyBase: safeNum(b?.qty),
      qtyOfficial: safeNum(o?.qty),
      puBase: safeNum(b?.pu),
      puOfficial: safeNum(o?.pu),
      parcialBase: baseParcial,
      parcialOfficial: officialParcial,
      diffParcial,
      diffPct
    };
  });

  const chaptersBase = groupByChapters(project, BUDGET_BASE).groups || [];
  const chaptersOfficial = groupByChapters(project, BUDGET_OFFICIAL).groups || [];

  const chBaseMap = new Map(chaptersBase.map(g => [safeStr(g.chapterCode), g]));
  const chOfficialMap = new Map(chaptersOfficial.map(g => [safeStr(g.chapterCode), g]));
  const chKeys = Array.from(new Set([...chBaseMap.keys(), ...chOfficialMap.keys()]));

  const chapterDiffs = chKeys.map(key => {
    const b = chBaseMap.get(key) || null;
    const o = chOfficialMap.get(key) || null;
    const subtotalBase = safeNum(b?.subtotal);
    const subtotalOfficial = safeNum(o?.subtotal);
    const diffSubtotal = subtotalOfficial - subtotalBase;
    const diffPct = subtotalBase > 0 ? (diffSubtotal / subtotalBase) * 100 : (subtotalOfficial > 0 ? 100 : 0);

    return {
      chapterCode: key,
      chapterName: safeStr(o?.chapterName || b?.chapterName),
      itemsCountBase: safeNum(b?.itemsCount),
      itemsCountOfficial: safeNum(o?.itemsCount),
      subtotalBase,
      subtotalOfficial,
      diffSubtotal,
      diffPct
    };
  }).sort((a,b)=> String(a.chapterCode).localeCompare(String(b.chapterCode), "es", { numeric:true }));

  const totalDiff = safeNum(totalsOfficial.total) - safeNum(totalsBase.total);
  const totalDiffPct = safeNum(totalsBase.total) > 0 ? (totalDiff / safeNum(totalsBase.total)) * 100 : (safeNum(totalsOfficial.total) > 0 ? 100 : 0);

  return {
    base: {
      budget: getBudget(project, BUDGET_BASE),
      totals: totalsBase,
      groups: chaptersBase,
      items: baseItems
    },
    official: {
      budget: getBudget(project, BUDGET_OFFICIAL),
      totals: totalsOfficial,
      groups: chaptersOfficial,
      items: officialItems
    },
    summary: {
      totalBase: safeNum(totalsBase.total),
      totalOfficial: safeNum(totalsOfficial.total),
      diffTotal: totalDiff,
      diffTotalPct: totalDiffPct,
      directoBase: safeNum(totalsBase.directo),
      directoOfficial: safeNum(totalsOfficial.directo),
      diffDirecto: safeNum(totalsOfficial.directo) - safeNum(totalsBase.directo)
    },
    chapterDiffs,
    itemDiffs
  };
}

window.Calc = {
  calcTotals,
  groupByChapters,
  calcIndirectTable,
  getBudget,
  getActiveBudget,
  makeProjectViewForBudget,
  calcBudgetComparison
};
