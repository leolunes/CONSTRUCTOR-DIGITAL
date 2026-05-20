function safeStr(v){
  return String(v ?? "").trim();
}

function toNum(v, def=0){
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

const BUDGET_OFICIAL = "oficial";
const BUDGET_CONTRATISTA = "contratista";
const DEFAULT_BUDGET = BUDGET_CONTRATISTA;

function normalizeBudgetKey(v){
  const s = safeStr(v).toLowerCase();
  if(s === BUDGET_OFICIAL) return BUDGET_OFICIAL;
  return BUDGET_CONTRATISTA;
}

/* =========================================
   Helpers de acceso a items por presupuesto
   ========================================= */
function getBudgetState(project, budgetKey=DEFAULT_BUDGET){
  const p = project || {};
  const key = normalizeBudgetKey(budgetKey || p.activeBudget || DEFAULT_BUDGET);

  if(p.budgets && typeof p.budgets === "object" && p.budgets[key]){
    return p.budgets[key];
  }

  /* Compatibilidad con estructura anterior */
  return {
    key: BUDGET_CONTRATISTA,
    items: Array.isArray(p.items) ? p.items : [],
    apuOverrides: p.apuOverrides || {},
    facturacion: Array.isArray(p.facturacion) ? p.facturacion : []
  };
}

function getBudgetItems(project, budgetKey=DEFAULT_BUDGET){
  const budget = getBudgetState(project, budgetKey);
  return Array.isArray(budget?.items) ? budget.items : [];
}

function calcItemParcial(it){
  return toNum(it?.pu, 0) * toNum(it?.qty, 0);
}

function normalizeCalcItem(it){
  return {
    id: safeStr(it?.id),
    chapterCode: safeStr(it?.chapterCode),
    chapterName: safeStr(it?.chapterName),
    apuRefCode: safeStr(it?.apuRefCode),
    code: safeStr(it?.code),
    desc: safeStr(it?.desc),
    unit: safeStr(it?.unit),
    pu: toNum(it?.pu, 0),
    qty: toNum(it?.qty, 0),
    parcial: calcItemParcial(it)
  };
}

function resolvePercentages(project){
  const adminPct = Number(
    (project?.adminPct ?? project?.administracionPct ?? project?.aiuPct ?? 0)
  );
  const imprevPct = Number(
    (project?.imprevPct ?? project?.imprevistosPct ?? 0)
  );
  const utilPct = Number(
    (project?.utilPct ?? project?.utilidadPct ?? 0)
  );

  const ivaUtilPct = Number(
    (project?.ivaUtilPct ?? project?.ivaSobreUtilidadPct ?? project?.ivaPct ?? 0)
  );

  return {
    adminPct: Number.isFinite(adminPct) ? adminPct : 0,
    imprevPct: Number.isFinite(imprevPct) ? imprevPct : 0,
    utilPct: Number.isFinite(utilPct) ? utilPct : 0,
    ivaUtilPct: Number.isFinite(ivaUtilPct) ? ivaUtilPct : 0
  };
}

/* =========================================
   Totales por presupuesto
   ========================================= */
function calcTotalsForBudget(project, budgetKey=DEFAULT_BUDGET){
  const items = getBudgetItems(project, budgetKey);
  const directo = items.reduce((s,it)=> s + calcItemParcial(it), 0);

  const {
    adminPct,
    imprevPct,
    utilPct,
    ivaUtilPct
  } = resolvePercentages(project);

  const admin = directo * (adminPct/100);
  const imprev = directo * (imprevPct/100);
  const util = directo * (utilPct/100);

  const subtotal = directo + admin + imprev + util;
  const iva = util * (ivaUtilPct/100);
  const total = subtotal + iva;
  const aiu = admin + imprev + util;

  return {
    budgetKey: normalizeBudgetKey(budgetKey),
    itemsCount: items.length,

    // base
    directo,

    // nuevo formato
    adminPct, imprevPct, utilPct, ivaUtilPct,
    admin, imprev, util,
    subtotal,

    // compatibilidad PDF / legado
    iva,
    ivaUtil: iva,

    total,

    // compatibilidad legacy
    aiu
  };
}

/* =========================================
   Compatibilidad con app actual
   ========================================= */
function calcTotals(project){
  return calcTotalsForBudget(project, DEFAULT_BUDGET);
}

/* =========================================
   Agrupar por capítulos por presupuesto
   ========================================= */
function chapterOf(it){
  const c = String(it?.chapterCode || "").trim();
  if(c) return c;

  const code = String(it?.code || "").trim();
  const ch = code.includes(".") ? code.split(".")[0] : "";
  return /^\d+$/.test(ch) ? ch : "SIN";
}

function sortChapterGroups(a,b){
  const an = Number(a.chapterCode);
  const bn = Number(b.chapterCode);
  const aNum = Number.isFinite(an) && a.chapterCode !== "SIN";
  const bNum = Number.isFinite(bn) && b.chapterCode !== "SIN";

  if(aNum && bNum) return an - bn;
  if(a.chapterCode === "SIN") return 1;
  if(b.chapterCode === "SIN") return -1;

  return String(a.chapterCode).localeCompare(String(b.chapterCode), "es");
}

function groupByChaptersForBudget(project, budgetKey=DEFAULT_BUDGET){
  const items = getBudgetItems(project, budgetKey).map(normalizeCalcItem);

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

  const groups = Array.from(map.values()).sort(sortChapterGroups);

  return { groups, items };
}

/* Compatibilidad actual */
function groupByChapters(project){
  return groupByChaptersForBudget(project, DEFAULT_BUDGET);
}

/* =========================================
   Resumen por ítems
   ========================================= */
function listBudgetItemsWithTotals(project, budgetKey=DEFAULT_BUDGET){
  return getBudgetItems(project, budgetKey).map(normalizeCalcItem);
}

/* =========================================
   ACTAS PARCIALES - HELPERS
   ========================================= */
function getActasParciales(project){
  return Array.isArray(project?.actasParciales) ? project.actasParciales : [];
}

function normalizeActaCalcLine(line){
  const qtyPresupuesto = toNum(line?.qtyPresupuesto ?? line?.qtyBudget, 0);
  const qtyEjecutadoPrevio = toNum(line?.qtyEjecutadoPrevio ?? line?.qtyExecutedPrev, 0);
  const qtyActa = toNum(line?.qtyActa ?? line?.qty, 0);
  const pu = toNum(line?.pu, 0);
  const parcial = toNum(line?.parcial, qtyActa * pu);
  const qtySaldoLuego = toNum(
    line?.qtySaldoLuego,
    Math.max(0, qtyPresupuesto - qtyEjecutadoPrevio - qtyActa)
  );

  return {
    id: safeStr(line?.id),
    itemId: safeStr(line?.itemId),
    chapterCode: safeStr(line?.chapterCode),
    chapterName: safeStr(line?.chapterName),
    code: safeStr(line?.code),
    desc: safeStr(line?.desc),
    unit: safeStr(line?.unit),
    qtyPresupuesto,
    qtyEjecutadoPrevio,
    qtyActa,
    qtySaldoLuego,
    pu,
    parcial
  };
}

function normalizeActaCalc(acta){
  const lines = Array.isArray(acta?.lines) ? acta.lines.map(normalizeActaCalcLine) : [];
  const totalValor = lines.reduce((acc, l)=> acc + toNum(l?.parcial, 0), 0);

  return {
    id: safeStr(acta?.id),
    numero: safeStr(acta?.numero),
    fecha: safeStr(acta?.fecha),
    periodo: safeStr(acta?.periodo),
    estado: safeStr(acta?.estado),
    observacion: safeStr(acta?.observacion),
    createdAt: safeStr(acta?.createdAt),
    updatedAt: safeStr(acta?.updatedAt),
    totalLineas: lines.length,
    totalValor,
    lines
  };
}

function buildItemExecKey(it){
  const id = safeStr(it?.id);
  if(id) return `ID:${id}`;

  const code = safeStr(it?.code);
  if(code) return `CODE:${code}`;

  return `DESC:${safeStr(it?.chapterCode)}__${safeStr(it?.desc)}`.toUpperCase();
}

function buildActaLineExecKey(line){
  const itemId = safeStr(line?.itemId);
  if(itemId) return `ID:${itemId}`;

  const code = safeStr(line?.code);
  if(code) return `CODE:${code}`;

  return `DESC:${safeStr(line?.chapterCode)}__${safeStr(line?.desc)}`.toUpperCase();
}

/* =========================================
   ACUMULADOS DE EJECUCIÓN POR ACTAS
   ========================================= */
function calcActasAcumuladas(project, budgetKey=DEFAULT_BUDGET){
  const items = listBudgetItemsWithTotals(project, budgetKey);
  const actas = getActasParciales(project).map(normalizeActaCalc);

  const itemMap = new Map();
  const out = [];

  for(const it of items){
    const key = buildItemExecKey(it);
    const rec = {
      key,
      itemId: safeStr(it.id),
      chapterCode: safeStr(it.chapterCode),
      chapterName: safeStr(it.chapterName),
      code: safeStr(it.code),
      desc: safeStr(it.desc),
      unit: safeStr(it.unit),
      qtyPresupuesto: toNum(it.qty, 0),
      pu: toNum(it.pu, 0),
      valorPresupuesto: toNum(it.parcial, 0),

      qtyEjecutada: 0,
      valorEjecutado: 0,

      qtyPendiente: toNum(it.qty, 0),
      valorPendiente: toNum(it.parcial, 0),

      actasCount: 0,
      overExecuted: false,
      lines: []
    };
    itemMap.set(key, rec);
    out.push(rec);
  }

  for(const acta of actas){
    for(const rawLine of (acta.lines || [])){
      const line = normalizeActaCalcLine(rawLine);
      const key = buildActaLineExecKey(line);

      if(!itemMap.has(key)){
        const qtyPresupuesto = toNum(line.qtyPresupuesto, 0);
        const pu = toNum(line.pu, 0);
        const rec = {
          key,
          itemId: safeStr(line.itemId),
          chapterCode: safeStr(line.chapterCode),
          chapterName: safeStr(line.chapterName),
          code: safeStr(line.code),
          desc: safeStr(line.desc),
          unit: safeStr(line.unit),
          qtyPresupuesto,
          pu,
          valorPresupuesto: qtyPresupuesto * pu,

          qtyEjecutada: 0,
          valorEjecutado: 0,

          qtyPendiente: qtyPresupuesto,
          valorPendiente: qtyPresupuesto * pu,

          actasCount: 0,
          overExecuted: false,
          lines: []
        };
        itemMap.set(key, rec);
        out.push(rec);
      }

      const acc = itemMap.get(key);
      acc.qtyEjecutada += toNum(line.qtyActa, 0);
      acc.valorEjecutado += toNum(line.parcial, 0);
      acc.actasCount += 1;
      acc.lines.push({
        actaId: acta.id,
        actaNumero: acta.numero,
        actaFecha: acta.fecha,
        actaEstado: acta.estado,
        qtyActa: toNum(line.qtyActa, 0),
        parcial: toNum(line.parcial, 0)
      });
    }
  }

  for(const rec of out){
    rec.qtyPendiente = rec.qtyPresupuesto - rec.qtyEjecutada;
    rec.valorPendiente = rec.valorPresupuesto - rec.valorEjecutado;
    rec.overExecuted = rec.qtyEjecutada > rec.qtyPresupuesto || rec.valorEjecutado > rec.valorPresupuesto;
  }

  out.sort((a,b)=>{
    const ac = safeStr(a.chapterCode);
    const bc = safeStr(b.chapterCode);

    const an = Number(ac);
    const bn = Number(bc);
    const aNum = Number.isFinite(an) && ac !== "SIN";
    const bNum = Number.isFinite(bn) && bc !== "SIN";

    if(aNum && bNum && an !== bn) return an - bn;
    if(ac !== bc) return ac.localeCompare(bc, "es");

    return safeStr(a.code).localeCompare(safeStr(b.code), "es");
  });

  const summary = {
    itemsCount: out.length,
    qtyPresupuestoTotal: out.reduce((acc,r)=> acc + toNum(r.qtyPresupuesto, 0), 0),
    qtyEjecutadaTotal: out.reduce((acc,r)=> acc + toNum(r.qtyEjecutada, 0), 0),
    qtyPendienteTotal: out.reduce((acc,r)=> acc + toNum(r.qtyPendiente, 0), 0),
    valorPresupuestoTotal: out.reduce((acc,r)=> acc + toNum(r.valorPresupuesto, 0), 0),
    valorEjecutadoTotal: out.reduce((acc,r)=> acc + toNum(r.valorEjecutado, 0), 0),
    valorPendienteTotal: out.reduce((acc,r)=> acc + toNum(r.valorPendiente, 0), 0),
    itemsOverExecuted: out.filter(r => r.overExecuted).length
  };

  return { rows: out, summary };
}

function getActaExecutionRow(project, itemOrKey, budgetKey=DEFAULT_BUDGET){
  const acc = calcActasAcumuladas(project, budgetKey);
  const targetKey =
    typeof itemOrKey === "string"
      ? safeStr(itemOrKey)
      : buildItemExecKey(itemOrKey || {});
  return acc.rows.find(r => r.key === targetKey) || null;
}

function calcResumenActas(project){
  const actas = getActasParciales(project).map(normalizeActaCalc);

  const rows = actas.map(a => ({
    id: a.id,
    numero: a.numero,
    fecha: a.fecha,
    periodo: a.periodo,
    estado: a.estado,
    observacion: a.observacion,
    totalLineas: toNum(a.totalLineas, (a.lines || []).length),
    totalValor: toNum(a.totalValor, 0)
  }));

  const summary = {
    actasCount: rows.length,
    totalLineas: rows.reduce((acc,r)=> acc + toNum(r.totalLineas, 0), 0),
    totalValor: rows.reduce((acc,r)=> acc + toNum(r.totalValor, 0), 0),
    aprobadas: rows.filter(r => safeStr(r.estado).toUpperCase() === "APROBADA").length,
    pagadas: rows.filter(r => safeStr(r.estado).toUpperCase() === "PAGADA").length,
    borrador: rows.filter(r => safeStr(r.estado).toUpperCase() === "BORRADOR").length
  };

  return { rows, summary };
}

function calcActaDetalle(project, actaId){
  const actas = getActasParciales(project).map(normalizeActaCalc);
  const acta = actas.find(a => String(a.id) === String(actaId));
  if(!acta){
    return {
      acta: null,
      rows: [],
      summary: {
        totalLineas: 0,
        totalValor: 0
      }
    };
  }

  const rows = (acta.lines || []).map(normalizeActaCalcLine);
  return {
    acta,
    rows,
    summary: {
      totalLineas: rows.length,
      totalValor: rows.reduce((acc,r)=> acc + toNum(r.parcial, 0), 0)
    }
  };
}

/* =========================================
   CRUCE ACTAS VS FACTURACIÓN
   ========================================= */
function normalizeFactCategory(v){
  const s = safeStr(v).toUpperCase()
    .replace(/Á/g, "A")
    .replace(/É/g, "E")
    .replace(/Í/g, "I")
    .replace(/Ó/g, "O")
    .replace(/Ú/g, "U")
    .replace(/\s+/g, " ")
    .trim();

  if(
    s === "EQUIPO Y HERRAMIENTA" ||
    s === "EQUIPO Y HERRAM" ||
    s === "EQUIPO/HERRAMIENTAS"
  ) return "EQUIPO Y HERRAMIENTAS";

  return s;
}

function getFacturacionRows(project){
  return Array.isArray(project?.facturacion) ? project.facturacion : [];
}

function calcFacturacionVsActas(project, budgetKey=DEFAULT_BUDGET){
  const factRows = getFacturacionRows(project);
  const actasResumen = calcResumenActas(project);
  const acumulado = calcActasAcumuladas(project, budgetKey);

  const totalFacturado = factRows.reduce((acc, r)=> acc + toNum(r?.valor, 0), 0);
  const totalEjecutadoActas = toNum(acumulado.summary.valorEjecutadoTotal, 0);
  const diferenciaGlobal = totalFacturado - totalEjecutadoActas;

  const porCategoria = {};
  for(const r of factRows){
    const cat = normalizeFactCategory(r?.categoria);
    porCategoria[cat] = toNum(porCategoria[cat], 0) + toNum(r?.valor, 0);
  }

  return {
    summary: {
      actasCount: toNum(actasResumen.summary.actasCount, 0),
      totalEjecutadoActas,
      totalFacturado,
      diferenciaGlobal,
      facturasCount: factRows.length,
      itemsOverExecuted: toNum(acumulado.summary.itemsOverExecuted, 0)
    },
    porCategoria,
    acumuladoItems: acumulado.rows
  };
}

/* =========================================
   ALERTAS DE EJECUCIÓN / FACTURACIÓN
   Base para facturación expuria o ficticia
   ========================================= */
function buildActasAuditAlerts(project, budgetKey=DEFAULT_BUDGET){
  const alerts = [];
  const acumulado = calcActasAcumuladas(project, budgetKey);
  const cruce = calcFacturacionVsActas(project, budgetKey);

  for(const row of acumulado.rows){
    if(row.overExecuted){
      alerts.push({
        level: "alto",
        type: "EJECUCION_SUPERA_PRESUPUESTO",
        code: row.code,
        chapterCode: row.chapterCode,
        desc: row.desc,
        value: row.valorEjecutado - row.valorPresupuesto,
        message: `La ejecución acumulada supera el presupuesto del ítem ${row.code || row.desc}`
      });
    }

    if(toNum(row.qtyEjecutada, 0) > 0 && toNum(row.valorEjecutado, 0) === 0){
      alerts.push({
        level: "medio",
        type: "EJECUCION_SIN_VALOR",
        code: row.code,
        chapterCode: row.chapterCode,
        desc: row.desc,
        value: 0,
        message: `El ítem ${row.code || row.desc} tiene ejecución reportada sin valor acumulado`
      });
    }
  }

  if(toNum(cruce.summary.diferenciaGlobal, 0) > 0){
    alerts.unshift({
      level: cruce.summary.diferenciaGlobal > (cruce.summary.totalEjecutadoActas * 0.2) ? "alto" : "medio",
      type: "FACTURACION_SUPERA_EJECUCION_ACTAS",
      code: "",
      chapterCode: "",
      desc: "Cruce global actas vs facturación",
      value: cruce.summary.diferenciaGlobal,
      message: `La facturación registrada supera la ejecución acumulada de actas en ${cruce.summary.diferenciaGlobal.toFixed(2)}`
    });
  }

  return alerts;
}

/* =========================================
   Comparativo entre presupuestos
   Base para AUDITORÍA PRESUPUESTAL
   ========================================= */
function buildItemKey(it){
  const code = safeStr(it?.code);
  if(code) return code;
  return `${safeStr(it?.chapterCode)}__${safeStr(it?.desc)}`.toUpperCase();
}

function compareBudgets(project, budgetA=BUDGET_OFICIAL, budgetB=BUDGET_CONTRATISTA){
  const aKey = normalizeBudgetKey(budgetA);
  const bKey = normalizeBudgetKey(budgetB);

  const itemsA = listBudgetItemsWithTotals(project, aKey);
  const itemsB = listBudgetItemsWithTotals(project, bKey);

  const mapA = new Map();
  const mapB = new Map();

  for(const it of itemsA){
    mapA.set(buildItemKey(it), it);
  }
  for(const it of itemsB){
    mapB.set(buildItemKey(it), it);
  }

  const keys = new Set([...mapA.keys(), ...mapB.keys()]);
  const rows = [];

  for(const key of keys){
    const a = mapA.get(key) || null;
    const b = mapB.get(key) || null;

    const qtyA = toNum(a?.qty, 0);
    const qtyB = toNum(b?.qty, 0);

    const puA = toNum(a?.pu, 0);
    const puB = toNum(b?.pu, 0);

    const parcialA = toNum(a?.parcial, 0);
    const parcialB = toNum(b?.parcial, 0);

    const diffQty = qtyB - qtyA;
    const diffPU = puB - puA;
    const diffParcial = parcialB - parcialA;

    const diffPUPct = puA !== 0 ? (diffPU / puA) * 100 : (puB !== 0 ? 100 : 0);
    const diffParcialPct = parcialA !== 0 ? (diffParcial / parcialA) * 100 : (parcialB !== 0 ? 100 : 0);

    rows.push({
      key,
      chapterCode: safeStr(a?.chapterCode || b?.chapterCode),
      chapterName: safeStr(a?.chapterName || b?.chapterName),
      code: safeStr(a?.code || b?.code),
      desc: safeStr(a?.desc || b?.desc),
      unit: safeStr(a?.unit || b?.unit),

      oficial: {
        exists: !!a,
        qty: qtyA,
        pu: puA,
        parcial: parcialA
      },

      contratista: {
        exists: !!b,
        qty: qtyB,
        pu: puB,
        parcial: parcialB
      },

      diff: {
        qty: diffQty,
        pu: diffPU,
        parcial: diffParcial,
        puPct: diffPUPct,
        parcialPct: diffParcialPct
      },

      flags: {
        onlyInOficial: !!a && !b,
        onlyInContratista: !a && !!b,
        quantityChanged: qtyA !== qtyB,
        puHigherInContratista: puB > puA,
        parcialHigherInContratista: parcialB > parcialA,
        suspiciousOvercost: puB > puA || parcialB > parcialA
      }
    });
  }

  rows.sort((x,y)=>{
    const xc = safeStr(x.chapterCode);
    const yc = safeStr(y.chapterCode);

    const xn = Number(xc);
    const yn = Number(yc);
    const xNum = Number.isFinite(xn) && xc !== "SIN";
    const yNum = Number.isFinite(yn) && yc !== "SIN";

    if(xNum && yNum && xn !== yn) return xn - yn;
    if(xc !== yc) return xc.localeCompare(yc, "es");

    return safeStr(x.code).localeCompare(safeStr(y.code), "es");
  });

  const totalsOficial = calcTotalsForBudget(project, aKey);
  const totalsContratista = calcTotalsForBudget(project, bKey);

  const summary = {
    presupuestoA: aKey,
    presupuestoB: bKey,

    totalOficial: totalsOficial.total,
    totalContratista: totalsContratista.total,
    diffTotal: totalsContratista.total - totalsOficial.total,
    diffTotalPct: totalsOficial.total !== 0
      ? ((totalsContratista.total - totalsOficial.total) / totalsOficial.total) * 100
      : (totalsContratista.total !== 0 ? 100 : 0),

    directoOficial: totalsOficial.directo,
    directoContratista: totalsContratista.directo,
    diffDirecto: totalsContratista.directo - totalsOficial.directo,

    itemsSoloOficial: rows.filter(r => r.flags.onlyInOficial).length,
    itemsSoloContratista: rows.filter(r => r.flags.onlyInContratista).length,
    itemsConMayorPUContratista: rows.filter(r => r.flags.puHigherInContratista).length,
    itemsConMayorParcialContratista: rows.filter(r => r.flags.parcialHigherInContratista).length
  };

  return {
    rows,
    summary,
    totals: {
      oficial: totalsOficial,
      contratista: totalsContratista
    }
  };
}

/* =========================================
   Comparativo resumido por capítulos
   ========================================= */
function compareBudgetsByChapter(project, budgetA=BUDGET_OFICIAL, budgetB=BUDGET_CONTRATISTA){
  const comp = compareBudgets(project, budgetA, budgetB);
  const map = new Map();

  for(const row of comp.rows){
    const key = safeStr(row.chapterCode) || "SIN";

    if(!map.has(key)){
      map.set(key, {
        chapterCode: key,
        chapterName: safeStr(row.chapterName),
        oficial: 0,
        contratista: 0,
        diff: 0,
        diffPct: 0,
        itemsCount: 0
      });
    }

    const g = map.get(key);
    g.oficial += toNum(row.oficial.parcial, 0);
    g.contratista += toNum(row.contratista.parcial, 0);
    g.diff += toNum(row.diff.parcial, 0);
    g.itemsCount += 1;

    if(!g.chapterName && row.chapterName){
      g.chapterName = safeStr(row.chapterName);
    }
  }

  const rows = Array.from(map.values()).map(r => ({
    ...r,
    diffPct: r.oficial !== 0 ? (r.diff / r.oficial) * 100 : (r.contratista !== 0 ? 100 : 0)
  }));

  rows.sort(sortChapterGroups);

  return rows;
}

/* =========================================
   Matriz simple de alertas de auditoría
   ========================================= */
function buildBudgetAuditAlerts(project, budgetA=BUDGET_OFICIAL, budgetB=BUDGET_CONTRATISTA){
  const comp = compareBudgets(project, budgetA, budgetB);
  const alerts = [];

  for(const row of comp.rows){
    if(row.flags.onlyInContratista){
      alerts.push({
        level: "medio",
        type: "ITEM_SOLO_CONTRATISTA",
        code: row.code,
        chapterCode: row.chapterCode,
        desc: row.desc,
        message: `Ítem presente solo en presupuesto contratista: ${row.code || row.desc}`
      });
    }

    if(row.flags.onlyInOficial){
      alerts.push({
        level: "medio",
        type: "ITEM_SOLO_OFICIAL",
        code: row.code,
        chapterCode: row.chapterCode,
        desc: row.desc,
        message: `Ítem presente solo en presupuesto oficial: ${row.code || row.desc}`
      });
    }

    if(row.flags.puHigherInContratista){
      const pct = Number(row.diff.puPct || 0);
      alerts.push({
        level: pct >= 20 ? "alto" : "medio",
        type: "PU_MAYOR_CONTRATISTA",
        code: row.code,
        chapterCode: row.chapterCode,
        desc: row.desc,
        value: pct,
        message: `PU mayor en contratista para ${row.code || row.desc}: ${pct.toFixed(2)}%`
      });
    }

    if(row.flags.quantityChanged){
      alerts.push({
        level: "medio",
        type: "CANTIDAD_DIFERENTE",
        code: row.code,
        chapterCode: row.chapterCode,
        desc: row.desc,
        message: `Cantidad distinta entre presupuestos en ${row.code || row.desc}`
      });
    }
  }

  const totalPct = Number(comp.summary.diffTotalPct || 0);
  if(totalPct > 0){
    alerts.unshift({
      level: totalPct >= 20 ? "alto" : "medio",
      type: "TOTAL_CONTRATISTA_SUPERIOR",
      code: "",
      chapterCode: "",
      desc: "Total del presupuesto",
      value: totalPct,
      message: `El presupuesto contratista supera al oficial en ${totalPct.toFixed(2)}%`
    });
  }

  return alerts;
}

window.Calc = {
  calcTotals,
  calcTotalsForBudget,

  groupByChapters,
  groupByChaptersForBudget,

  listBudgetItemsWithTotals,

  calcActasAcumuladas,
  getActaExecutionRow,
  calcResumenActas,
  calcActaDetalle,
  calcFacturacionVsActas,
  buildActasAuditAlerts,

  compareBudgets,
  compareBudgetsByChapter,
  buildBudgetAuditAlerts
};