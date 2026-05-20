const STORE_KEY = "presupuesto_contable_v1";
const STORE_BACKUP_KEY = "presupuesto_contable_v1_backup";

const STORE_VERSION = 13;
const BUDGET_OFICIAL = "oficial";
const BUDGET_CONTRATISTA = "contratista";
const DEFAULT_ACTIVE_BUDGET = BUDGET_CONTRATISTA;
const VALID_BUDGET_KEYS = [BUDGET_OFICIAL, BUDGET_CONTRATISTA];

function nowISO(){ return new Date().toISOString(); }
function uid(prefix="id"){ return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`; }

function safeStr(v){ return String(v ?? "").trim(); }
function toNum(v, def=0){
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

/* =========================
   AJUSTES DE PERSISTENCIA MÓVIL
   ========================= */
function storageAvailable(){
  try{
    const t = "__pp_test__";
    localStorage.setItem(t, "1");
    localStorage.removeItem(t);
    return true;
  }catch(_){
    return false;
  }
}

function safeLocalGet(key){
  try{
    return localStorage.getItem(key);
  }catch(_){
    return null;
  }
}

function safeLocalSet(key, value){
  try{
    localStorage.setItem(key, value);
    return true;
  }catch(err){
    console.warn("[StorageAPI] No se pudo guardar en localStorage:", key, err);
    return false;
  }
}

function safeLocalRemove(key){
  try{
    localStorage.removeItem(key);
    return true;
  }catch(_){
    return false;
  }
}

function requestPersistentStorage(){
  try{
    if(navigator.storage && typeof navigator.storage.persist === "function"){
      navigator.storage.persist().catch(()=>{});
    }
  }catch(_){}
}

/* =========================
   Helpers generales
   ========================= */
function normalizeBudgetKey(v){
  const s = safeStr(v).toLowerCase();
  if(s === BUDGET_OFICIAL) return BUDGET_OFICIAL;
  return BUDGET_CONTRATISTA;
}

function ensureArray(v){
  return Array.isArray(v) ? v : [];
}

function deepClone(obj){
  try{
    return JSON.parse(JSON.stringify(obj));
  }catch(_){
    return null;
  }
}

/* =========================
   Chapters helpers
   ========================= */
function normalizeChapterCode(code){
  return safeStr(code);
}

function normalizeChapterName(name){
  return safeStr(name);
}

function normalizeChapters(raw){
  const arr = Array.isArray(raw) ? raw : [];
  const out = [];

  for(const c of arr){
    const code = normalizeChapterCode(c?.chapterCode ?? c?.code);
    const name = normalizeChapterName(c?.chapterName ?? c?.name);
    if(!code) continue;

    out.push({
      id: safeStr(c?.id) || uid("chap"),
      chapterCode: code,
      chapterName: name
    });
  }

  const seen = new Set();
  const uniq = [];
  for(const c of out){
    if(seen.has(c.chapterCode)) continue;
    seen.add(c.chapterCode);
    uniq.push(c);
  }

  uniq.sort((a,b)=>{
    const na = parseFloat(String(a.chapterCode).replace(",", "."));
    const nb = parseFloat(String(b.chapterCode).replace(",", "."));
    const fa = Number.isFinite(na);
    const fb = Number.isFinite(nb);
    if(fa && fb && na !== nb) return na - nb;
    return String(a.chapterCode).localeCompare(String(b.chapterCode), "es");
  });

  return uniq;
}

function findChapterByCode(project, code){
  const cc = normalizeChapterCode(code);
  if(!cc) return null;
  const chs = Array.isArray(project?.chapters) ? project.chapters : [];
  return chs.find(c => String(c.chapterCode) === cc) || null;
}

function deriveChapterCandidatesFromItemCode(itemCode){
  const code = safeStr(itemCode);
  if(!code) return [];

  const seg = code.split(".")[0];
  const baseSeg = safeStr(seg);

  const cand = [];
  if(baseSeg && /^\d+$/.test(baseSeg)){
    cand.push(baseSeg);
    cand.push(`${baseSeg}.00`);
  }
  return cand;
}

function resolveChapterCodeForItem(project, itemCode, explicitChapterCode){
  const exp = normalizeChapterCode(explicitChapterCode);
  if(exp) return exp;

  const cand = deriveChapterCandidatesFromItemCode(itemCode);
  if(!cand.length) return "";

  const chs = Array.isArray(project?.chapters) ? project.chapters : [];
  if(chs.length){
    const set = new Set(chs.map(c => String(c.chapterCode)));
    for(const c of cand){
      if(set.has(c)) return c;
    }
  }

  return cand[0] || "";
}

function resolveChapterNameForItem(project, chapterCode, fallbackName){
  const cc = normalizeChapterCode(chapterCode);
  const fb = safeStr(fallbackName);
  const ch = cc ? findChapterByCode(project, cc) : null;
  if(ch && ch.chapterName) return String(ch.chapterName);
  return fb;
}

/* =========================
   APU Ref helpers
   ========================= */
function normalizeApuRefCode(v){
  return safeStr(v);
}
function getItemApuLookupCode(it){
  const ref = normalizeApuRefCode(it?.apuRefCode);
  return ref || safeStr(it?.code);
}

/* =========================
   FACTURACIÓN
   Estructura alineada con app.js
   ========================= */
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

function normalizeFacturacionRegistro(r){
  const chapterCode = safeStr(r?.chapterCode);
  const chapterName = safeStr(r?.chapterName);
  const fecha = safeStr(r?.fecha);

  return {
    id: safeStr(r?.id) || uid("fact"),
    fecha: fecha || nowISO().slice(0,10),
    categoria: normalizeFactCategory(r?.categoria),
    chapterCode,
    chapterName,
    valor: toNum(r?.valor, toNum(r?.valorFacturado, 0)),
    proveedor: safeStr(r?.proveedor ?? r?.tercero),
    lugarFacturacion: safeStr(r?.lugarFacturacion),
    lugarEntrega: safeStr(r?.lugarEntrega),
    observacion: safeStr(r?.observacion ?? r?.concepto)
  };
}

function normalizeFacturacion(raw){
  if(Array.isArray(raw)){
    return raw.map(normalizeFacturacionRegistro);
  }

  if(raw && typeof raw === "object"){
    if(Array.isArray(raw.registros)){
      return raw.registros.map(normalizeFacturacionRegistro);
    }
  }

  return [];
}

/* =========================
   Helpers APU / Insumos custom
   ========================= */
function normalizeApuLine(line){
  const qty = toNum(line?.qty, 0);
  const pu = toNum(line?.pu, 0);
  const parcial = toNum(line?.parcial, qty * pu);

  return {
    group: safeStr(line?.group ?? line?.tipo),
    tipo: safeStr(line?.tipo ?? line?.group),
    desc: safeStr(line?.desc),
    unit: safeStr(line?.unit),
    qty,
    pu,
    parcial
  };
}

function normalizeCustomAPURecord(apu){
  const code = safeStr(apu?.code);
  if(!code) throw new Error("Custom APU: falta code");

  const lines = Array.isArray(apu?.lines) ? apu.lines.map(normalizeApuLine) : [];

  return {
    code,
    desc: safeStr(apu?.desc),
    unit: safeStr(apu?.unit),
    chapterCode: safeStr(apu?.chapterCode),
    chapterName: safeStr(apu?.chapterName),
    lines
  };
}

function normalizeCustomInsumoRecord(ins){
  return {
    id: safeStr(ins?.id) || uid("ins"),
    tipo: safeStr(ins?.tipo),
    desc: safeStr(ins?.desc),
    unit: safeStr(ins?.unit),
    pu: toNum(ins?.pu, 0)
  };
}

/* =========================
   Presupuestos por proyecto
   ========================= */
function buildEmptyBudgetState(key){
  const budgetKey = normalizeBudgetKey(key);

  return {
    key: budgetKey,
    label: budgetKey === BUDGET_OFICIAL ? "Presupuesto Oficial" : "Presupuesto Contratista",
    sourceType: budgetKey === BUDGET_OFICIAL ? "manual" : "base_importada",
    items: [],
    apuOverrides: {},
    facturacion: [],
    customAPUs: {},
    customInsumos: [],
    meta: {
      createdAt: nowISO(),
      updatedAt: nowISO(),
      baseSnapshot: null
    }
  };
}

function normalizeBudgetState(raw, keyHint=""){
  const key = normalizeBudgetKey(raw?.key || keyHint);
  const out = buildEmptyBudgetState(key);

  out.label = safeStr(raw?.label) || out.label;
  out.sourceType = safeStr(raw?.sourceType) || out.sourceType;

  out.items = [];
  if(Array.isArray(raw?.items)){
    out.items = raw.items.map(rawItem => ({
      id: safeStr(rawItem?.id) || uid("it"),
      chapterCode: safeStr(rawItem?.chapterCode),
      chapterName: safeStr(rawItem?.chapterName),
      apuRefCode: normalizeApuRefCode(rawItem?.apuRefCode) || safeStr(rawItem?.code || ""),
      code: safeStr(rawItem?.code),
      desc: safeStr(rawItem?.desc),
      unit: safeStr(rawItem?.unit),
      pu: toNum(rawItem?.pu, 0),
      qty: toNum(rawItem?.qty, 0)
    }));
  }

  out.apuOverrides = {};
  try{
    const rawOverrides = raw?.apuOverrides || {};
    for(const keyCode of Object.keys(rawOverrides)){
      const ov = rawOverrides[keyCode] || {};
      out.apuOverrides[keyCode] = {
        code: safeStr(ov.code || keyCode),
        updatedAt: safeStr(ov.updatedAt) || nowISO(),
        lines: Array.isArray(ov.lines) ? ov.lines.map(normalizeApuLine) : []
      };
    }
  }catch(_){
    out.apuOverrides = {};
  }

  out.facturacion = normalizeFacturacion(raw?.facturacion);

  try{
    const nextCustom = {};
    const rawCustomAPUs = raw?.customAPUs || {};
    for(const code of Object.keys(rawCustomAPUs)){
      const rec = normalizeCustomAPURecord({ ...rawCustomAPUs[code], code });
      nextCustom[rec.code] = rec;
    }
    out.customAPUs = nextCustom;
  }catch(_){
    out.customAPUs = {};
  }

  try{
    out.customInsumos = ensureArray(raw?.customInsumos).map(normalizeCustomInsumoRecord);
  }catch(_){
    out.customInsumos = [];
  }

  out.meta = {
    createdAt: safeStr(raw?.meta?.createdAt) || nowISO(),
    updatedAt: safeStr(raw?.meta?.updatedAt) || nowISO(),
    baseSnapshot: raw?.meta?.baseSnapshot ? deepClone(raw.meta.baseSnapshot) : null
  };

  return out;
}

function ensureProjectBudgets(proj){
  if(!proj || typeof proj !== "object") return proj;

  const budgets = (proj.budgets && typeof proj.budgets === "object") ? proj.budgets : {};

  const legacyContratista = {
    key: BUDGET_CONTRATISTA,
    label: "Presupuesto Contratista",
    sourceType: "base_importada",
    items: Array.isArray(proj.items) ? proj.items : [],
    apuOverrides: (proj.apuOverrides && typeof proj.apuOverrides === "object") ? proj.apuOverrides : {},
    facturacion: Array.isArray(proj.facturacion) ? proj.facturacion : [],
    customAPUs: (proj.customAPUsContratista && typeof proj.customAPUsContratista === "object") ? proj.customAPUsContratista : {},
    customInsumos: Array.isArray(proj.customInsumosContratista) ? proj.customInsumosContratista : [],
    meta: {
      createdAt: safeStr(proj.createdAt) || nowISO(),
      updatedAt: safeStr(proj.updatedAt) || nowISO(),
      baseSnapshot: proj.baseSnapshotContratista ? deepClone(proj.baseSnapshotContratista) : null
    }
  };

  proj.budgets = {
    [BUDGET_OFICIAL]: normalizeBudgetState(budgets[BUDGET_OFICIAL] || {
      key: BUDGET_OFICIAL,
      label: "Presupuesto Oficial",
      sourceType: "manual",
      items: [],
      apuOverrides: {},
      facturacion: [],
      customAPUs: {},
      customInsumos: [],
      meta: {
        createdAt: safeStr(proj.createdAt) || nowISO(),
        updatedAt: safeStr(proj.updatedAt) || nowISO(),
        baseSnapshot: proj.baseSnapshotOficial ? deepClone(proj.baseSnapshotOficial) : null
      }
    }, BUDGET_OFICIAL),

    [BUDGET_CONTRATISTA]: normalizeBudgetState(budgets[BUDGET_CONTRATISTA] || legacyContratista, BUDGET_CONTRATISTA)
  };

  proj.activeBudget = normalizeBudgetKey(proj.activeBudget || DEFAULT_ACTIVE_BUDGET);
  if(!VALID_BUDGET_KEYS.includes(proj.activeBudget)){
    proj.activeBudget = DEFAULT_ACTIVE_BUDGET;
  }

  if(!proj.baseSnapshots || typeof proj.baseSnapshots !== "object"){
    proj.baseSnapshots = {};
  }

  if(!proj.baseSnapshots[BUDGET_CONTRATISTA] && proj.budgets[BUDGET_CONTRATISTA]?.meta?.baseSnapshot){
    proj.baseSnapshots[BUDGET_CONTRATISTA] = deepClone(proj.budgets[BUDGET_CONTRATISTA].meta.baseSnapshot);
  }
  if(!proj.baseSnapshots[BUDGET_OFICIAL] && proj.budgets[BUDGET_OFICIAL]?.meta?.baseSnapshot){
    proj.baseSnapshots[BUDGET_OFICIAL] = deepClone(proj.budgets[BUDGET_OFICIAL].meta.baseSnapshot);
  }

  /* Compatibilidad con la app actual:
     la app existente sigue leyendo estos campos
     y aquí los seguimos apuntando al presupuesto contratista.
  */
  proj.items = proj.budgets[BUDGET_CONTRATISTA].items;
  proj.apuOverrides = proj.budgets[BUDGET_CONTRATISTA].apuOverrides;
  proj.facturacion = proj.budgets[BUDGET_CONTRATISTA].facturacion;

  return proj;
}

function getBudgetStateFromProject(project, budgetKey=DEFAULT_ACTIVE_BUDGET){
  if(!project) return normalizeBudgetState({}, budgetKey);
  ensureProjectBudgets(project);
  const key = normalizeBudgetKey(budgetKey || project.activeBudget || DEFAULT_ACTIVE_BUDGET);
  return project.budgets[key] || normalizeBudgetState({}, key);
}

function setBudgetStateOnProject(project, budgetKey, budgetState){
  if(!project) return project;
  ensureProjectBudgets(project);
  const key = normalizeBudgetKey(budgetKey);
  project.budgets[key] = normalizeBudgetState({ ...budgetState, key }, key);

  if(!project.baseSnapshots || typeof project.baseSnapshots !== "object"){
    project.baseSnapshots = {};
  }
  project.baseSnapshots[key] = project.budgets[key]?.meta?.baseSnapshot
    ? deepClone(project.budgets[key].meta.baseSnapshot)
    : null;

  project.items = project.budgets[BUDGET_CONTRATISTA].items;
  project.apuOverrides = project.budgets[BUDGET_CONTRATISTA].apuOverrides;
  project.facturacion = project.budgets[BUDGET_CONTRATISTA].facturacion;

  return project;
}

/* =========================
   Proyecto
   ========================= */
function normalizeProject(p){
  const proj = p || {};

  proj.currency = String(proj.currency || "COP");

  const hasNew =
    (proj.adminPct != null) ||
    (proj.imprevPct != null) ||
    (proj.utilPct != null) ||
    (proj.ivaUtilPct != null);

  if(!hasNew){
    const legacyAIU = Number(proj.aiuPct ?? 25);
    const legacyIVA = Number(proj.ivaPct ?? 19);

    proj.adminPct = Number.isFinite(legacyAIU) ? legacyAIU : 25;
    proj.imprevPct = 0;
    proj.utilPct = 0;
    proj.ivaUtilPct = Number.isFinite(legacyIVA) ? legacyIVA : 19;
  }else{
    proj.adminPct = Number(proj.adminPct ?? 18);
    proj.imprevPct = Number(proj.imprevPct ?? 2);
    proj.utilPct = Number(proj.utilPct ?? 5);
    proj.ivaUtilPct = Number(proj.ivaUtilPct ?? 19);
  }

  const aiuCompat = Number(proj.adminPct||0) + Number(proj.imprevPct||0) + Number(proj.utilPct||0);
  proj.aiuPct = Number.isFinite(Number(proj.aiuPct)) ? Number(proj.aiuPct) : aiuCompat;
  if(!Number.isFinite(proj.aiuPct)) proj.aiuPct = aiuCompat;

  proj.ivaPct = Number.isFinite(Number(proj.ivaPct)) ? Number(proj.ivaPct) : Number(proj.ivaUtilPct||19);
  if(!Number.isFinite(proj.ivaPct)) proj.ivaPct = Number(proj.ivaUtilPct||19);

  proj.ivaBase = String(proj.ivaBase || "sobre_directo_aiu");

  proj.logoDataUrl = String(proj.logoDataUrl || "");

  proj.instPais = String(proj.instPais || "");
  proj.instDepto = String(proj.instDepto || "");
  proj.instMunicipio = String(proj.instMunicipio || "");
  proj.instEntidad = String(proj.instEntidad || "");
  proj.instProyectoLabel = String(proj.instProyectoLabel || "");
  proj.instFechaElab = String(proj.instFechaElab || "");

  proj.chapters = normalizeChapters(proj.chapters);

  ensureProjectBudgets(proj);

  /* Normalización fina de items dentro de ambos presupuestos */
  try{
    const chs = Array.isArray(proj.chapters) ? proj.chapters : [];

    for(const budgetKey of VALID_BUDGET_KEYS){
      const budget = getBudgetStateFromProject(proj, budgetKey);
      budget.items = budget.items.map(raw => {
        const it = {
          id: safeStr(raw?.id) || uid("it"),
          chapterCode: safeStr(raw?.chapterCode),
          chapterName: safeStr(raw?.chapterName),
          apuRefCode: normalizeApuRefCode(raw?.apuRefCode) || safeStr(raw?.code || ""),
          code: safeStr(raw?.code),
          desc: safeStr(raw?.desc),
          unit: safeStr(raw?.unit),
          pu: toNum(raw?.pu, 0),
          qty: toNum(raw?.qty, 0)
        };

        const cc = normalizeChapterCode(it.chapterCode);
        if(cc && (!safeStr(it.chapterName))){
          const found = chs.find(c => String(c.chapterCode) === cc);
          if(found && found.chapterName) it.chapterName = String(found.chapterName);
        }

        return it;
      });

      budget.meta.updatedAt = safeStr(budget?.meta?.updatedAt) || nowISO();
      setBudgetStateOnProject(proj, budgetKey, budget);
    }
  }catch(_){}

  return proj;
}

function buildInitialStore(){
  return {
    meta:{
      createdAt: nowISO(),
      version: STORE_VERSION,
      lastSavedAt: nowISO(),

      elaborador: {
        nombre: "",
        profesion: "",
        matricula: "",
        firmaDataUrl: ""
      },

      customAPUs: {},
      customInsumos: [],

      /* Metadatos de bases importadas para trazabilidad futura */
      currentBaseMeta: {
        importedAt: "",
        sourceName: "",
        versionLabel: "",
        notes: ""
      },
      baseHistory: []
    },
    projects:[]
  };
}

function normalizeStoreMeta(meta){
  const out = meta || {};

  out.createdAt = safeStr(out.createdAt) || nowISO();
  out.version = STORE_VERSION;
  out.lastSavedAt = nowISO();

  if(!out.customAPUs || typeof out.customAPUs !== "object") out.customAPUs = {};
  if(!Array.isArray(out.customInsumos)) out.customInsumos = [];

  if(!out.elaborador){
    out.elaborador = { nombre:"", profesion:"", matricula:"", firmaDataUrl:"" };
  }else{
    out.elaborador.nombre = String(out.elaborador.nombre||"");
    out.elaborador.profesion = String(out.elaborador.profesion||"");
    out.elaborador.matricula = String(out.elaborador.matricula||"");
    out.elaborador.firmaDataUrl = String(out.elaborador.firmaDataUrl||"");
  }

  try{
    const nextCustom = {};
    for(const key of Object.keys(out.customAPUs)){
      const rec = normalizeCustomAPURecord({ ...out.customAPUs[key], code:key });
      nextCustom[rec.code] = rec;
    }
    out.customAPUs = nextCustom;
  }catch(_){
    out.customAPUs = {};
  }

  try{
    out.customInsumos = out.customInsumos.map(normalizeCustomInsumoRecord);
  }catch(_){
    out.customInsumos = [];
  }

  if(!out.currentBaseMeta || typeof out.currentBaseMeta !== "object"){
    out.currentBaseMeta = {
      importedAt: "",
      sourceName: "",
      versionLabel: "",
      notes: ""
    };
  }else{
    out.currentBaseMeta.importedAt = safeStr(out.currentBaseMeta.importedAt);
    out.currentBaseMeta.sourceName = safeStr(out.currentBaseMeta.sourceName);
    out.currentBaseMeta.versionLabel = safeStr(out.currentBaseMeta.versionLabel);
    out.currentBaseMeta.notes = safeStr(out.currentBaseMeta.notes);
  }

  if(!Array.isArray(out.baseHistory)) out.baseHistory = [];
  out.baseHistory = out.baseHistory.map(row => ({
    id: safeStr(row?.id) || uid("base"),
    importedAt: safeStr(row?.importedAt) || nowISO(),
    sourceName: safeStr(row?.sourceName),
    versionLabel: safeStr(row?.versionLabel),
    notes: safeStr(row?.notes)
  }));

  return out;
}

function loadStore(){
  requestPersistentStorage();

  if(!storageAvailable()){
    return buildInitialStore();
  }

  const rawMain = safeLocalGet(STORE_KEY);
  const rawBackup = safeLocalGet(STORE_BACKUP_KEY);

  if(!rawMain && !rawBackup){
    const init = buildInitialStore();
    const txt = JSON.stringify(init);
    safeLocalSet(STORE_KEY, txt);
    safeLocalSet(STORE_BACKUP_KEY, txt);
    return init;
  }

  let raw = rawMain || rawBackup;

  try{
    const db = JSON.parse(raw);

    db.meta = normalizeStoreMeta(db.meta);
    if(!db.projects) db.projects = [];
    db.projects = db.projects.map(p => normalizeProject(p));

    saveStore(db);
    return db;
  }catch(_){
    if(rawMain && rawBackup && rawMain !== rawBackup){
      try{
        const recovered = JSON.parse(rawBackup);
        recovered.meta = normalizeStoreMeta(recovered.meta);
        if(!recovered.projects) recovered.projects = [];
        recovered.projects = recovered.projects.map(p => normalizeProject(p));
        saveStore(recovered);
        return recovered;
      }catch(__){}
    }

    safeLocalRemove(STORE_KEY);
    safeLocalRemove(STORE_BACKUP_KEY);

    const init = buildInitialStore();
    saveStore(init);
    return init;
  }
}

function saveStore(db){
  const out = db || buildInitialStore();

  out.meta = normalizeStoreMeta(out.meta);

  if(!Array.isArray(out.projects)) out.projects = [];
  out.projects = out.projects.map(normalizeProject);

  const txt = JSON.stringify(out);

  safeLocalSet(STORE_KEY, txt);
  safeLocalSet(STORE_BACKUP_KEY, txt);

  return true;
}

function exportBackup(){
  const db = loadStore();
  const blob = new Blob([JSON.stringify(db,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  return { url, filename:`backup_presupuesto_contable_${Date.now()}.json` };
}

async function importBackupFromFile(file){
  const text = await file.text();
  const data = JSON.parse(text);
  if(!data || !data.projects) throw new Error("Backup inválido.");

  data.meta = normalizeStoreMeta(data.meta);
  data.projects = ensureArray(data.projects).map(normalizeProject);

  saveStore(data);
  return true;
}

function resetAll(){
  safeLocalRemove(STORE_KEY);
  safeLocalRemove(STORE_BACKUP_KEY);
}

/* =========================
   ELABORADOR + FIRMA
   ========================= */
function getElaborador(){
  const db = loadStore();
  return db.meta.elaborador || { nombre:"", profesion:"", matricula:"", firmaDataUrl:"" };
}

function setElaborador(patch){
  const db = loadStore();
  db.meta.elaborador = {
    ...(db.meta.elaborador || { nombre:"", profesion:"", matricula:"", firmaDataUrl:"" }),
    ...(patch || {})
  };
  saveStore(db);
  return db.meta.elaborador;
}

function clearFirma(){
  return setElaborador({ firmaDataUrl: "" });
}

/* =========================
   Base importada (metadatos)
   ========================= */
function getCurrentBaseMeta(){
  const db = loadStore();
  return db.meta.currentBaseMeta || {
    importedAt: "",
    sourceName: "",
    versionLabel: "",
    notes: ""
  };
}

function setCurrentBaseMeta(patch){
  const db = loadStore();
  const next = {
    ...(db.meta.currentBaseMeta || {
      importedAt: "",
      sourceName: "",
      versionLabel: "",
      notes: ""
    }),
    ...(patch || {})
  };

  if(!safeStr(next.importedAt)){
    next.importedAt = nowISO();
  }

  db.meta.currentBaseMeta = {
    importedAt: safeStr(next.importedAt),
    sourceName: safeStr(next.sourceName),
    versionLabel: safeStr(next.versionLabel),
    notes: safeStr(next.notes)
  };

  const hist = {
    id: uid("base"),
    importedAt: db.meta.currentBaseMeta.importedAt,
    sourceName: db.meta.currentBaseMeta.sourceName,
    versionLabel: db.meta.currentBaseMeta.versionLabel,
    notes: db.meta.currentBaseMeta.notes
  };

  db.meta.baseHistory = Array.isArray(db.meta.baseHistory) ? db.meta.baseHistory : [];
  db.meta.baseHistory.unshift(hist);

  saveStore(db);
  return db.meta.currentBaseMeta;
}

function listBaseHistory(){
  const db = loadStore();
  return Array.isArray(db.meta.baseHistory) ? db.meta.baseHistory.slice() : [];
}

/* ===== Custom Insumos globales ===== */
function listCustomInsumos(){
  return (loadStore().meta.customInsumos || []);
}

function addCustomInsumo({ tipo, desc, unit, pu }){
  const db = loadStore();
  const rec = normalizeCustomInsumoRecord({
    id: uid("ins"),
    tipo,
    desc,
    unit,
    pu
  });
  db.meta.customInsumos.unshift(rec);
  saveStore(db);
  return rec;
}

/* ===== Custom APUs globales ===== */
function getCustomAPU(code){
  const db = loadStore();
  const key = String(code||"").trim();
  return (db.meta.customAPUs && db.meta.customAPUs[key]) ? db.meta.customAPUs[key] : null;
}

function upsertCustomAPU(apu){
  const db = loadStore();
  const rec = normalizeCustomAPURecord(apu || {});
  db.meta.customAPUs[rec.code] = rec;
  saveStore(db);
  return db.meta.customAPUs[rec.code];
}

function listCustomAPUs(){
  const db = loadStore();
  return Object.values(db.meta.customAPUs || {});
}

/* =========================
   Projects
   ========================= */
function createProject(payload){
  const db = loadStore();

  const p = normalizeProject({
    id: uid("proj"),
    createdAt: nowISO(),
    updatedAt: nowISO(),
    currency: "COP",

    adminPct: 18,
    imprevPct: 2,
    utilPct: 5,
    ivaUtilPct: 19,

    aiuPct: 25,
    ivaPct: 19,
    ivaBase: "sobre_directo_aiu",

    logoDataUrl: "",
    instPais: "",
    instDepto: "",
    instMunicipio: "",
    instEntidad: "",
    instProyectoLabel: "",
    instFechaElab: "",

    chapters: [],
    activeBudget: DEFAULT_ACTIVE_BUDGET,
    budgets: {
      [BUDGET_OFICIAL]: buildEmptyBudgetState(BUDGET_OFICIAL),
      [BUDGET_CONTRATISTA]: buildEmptyBudgetState(BUDGET_CONTRATISTA)
    },
    baseSnapshots: {
      [BUDGET_OFICIAL]: null,
      [BUDGET_CONTRATISTA]: null
    },

    /* Compatibilidad legado */
    items: [],
    apuOverrides: {},
    facturacion: [],

    ...payload
  });

  db.projects.unshift(p);
  saveStore(db);
  return p;
}

function updateProject(id, patch){
  const db = loadStore();
  const idx = db.projects.findIndex(p=>p.id===id);
  if(idx===-1) return null;

  const merged = { ...db.projects[idx], ...patch, updatedAt: nowISO() };
  db.projects[idx] = normalizeProject(merged);

  saveStore(db);
  return db.projects[idx];
}

function listProjects(){ return loadStore().projects; }
function getProjectById(id){ return loadStore().projects.find(p=>p.id===id) || null; }

function deleteProject(id){
  const db = loadStore();
  db.projects = db.projects.filter(p=>p.id!==id);
  saveStore(db);
}

/* =========================
   Presupuesto activo por proyecto
   ========================= */
function getActiveBudget(projectId){
  const p = getProjectById(projectId);
  if(!p) return DEFAULT_ACTIVE_BUDGET;
  return normalizeBudgetKey(p.activeBudget || DEFAULT_ACTIVE_BUDGET);
}

function setActiveBudget(projectId, budgetKey){
  const db = loadStore();
  const pidx = db.projects.findIndex(p => p.id === projectId);
  if(pidx === -1) return null;

  db.projects[pidx].activeBudget = normalizeBudgetKey(budgetKey);
  db.projects[pidx].updatedAt = nowISO();

  saveStore(db);
  return db.projects[pidx].activeBudget;
}

function getProjectBudget(projectId, budgetKey=DEFAULT_ACTIVE_BUDGET){
  const p = getProjectById(projectId);
  if(!p) return null;
  return getBudgetStateFromProject(p, budgetKey);
}

function updateProjectBudget(projectId, budgetKey, patch){
  const db = loadStore();
  const pidx = db.projects.findIndex(p => p.id === projectId);
  if(pidx === -1) return null;

  const proj = db.projects[pidx];
  const current = getBudgetStateFromProject(proj, budgetKey);
  const merged = {
    ...current,
    ...(patch || {}),
    key: normalizeBudgetKey(budgetKey),
    meta: {
      ...(current.meta || {}),
      ...((patch && patch.meta) || {}),
      updatedAt: nowISO()
    }
  };

  setBudgetStateOnProject(proj, budgetKey, merged);
  proj.updatedAt = nowISO();
  db.projects[pidx] = normalizeProject(proj);
  saveStore(db);
  return getBudgetStateFromProject(db.projects[pidx], budgetKey);
}

/* =========================
   Snapshot de base por proyecto/presupuesto
   ========================= */
function getProjectBaseSnapshot(projectId, budgetKey=BUDGET_CONTRATISTA){
  const p = getProjectById(projectId);
  if(!p) return null;
  ensureProjectBudgets(p);

  const key = normalizeBudgetKey(budgetKey);
  if(p.baseSnapshots && p.baseSnapshots[key]){
    return deepClone(p.baseSnapshots[key]);
  }
  return p.budgets?.[key]?.meta?.baseSnapshot ? deepClone(p.budgets[key].meta.baseSnapshot) : null;
}

function setProjectBaseSnapshot(projectId, budgetKey=BUDGET_CONTRATISTA, snapshot=null){
  const db = loadStore();
  const pidx = db.projects.findIndex(p => p.id === projectId);
  if(pidx === -1) return null;

  const proj = db.projects[pidx];
  const key = normalizeBudgetKey(budgetKey);
  const budget = getBudgetStateFromProject(proj, key);

  budget.meta = {
    ...(budget.meta || {}),
    updatedAt: nowISO(),
    baseSnapshot: snapshot ? deepClone(snapshot) : null
  };

  setBudgetStateOnProject(proj, key, budget);
  proj.updatedAt = nowISO();

  if(!proj.baseSnapshots || typeof proj.baseSnapshots !== "object"){
    proj.baseSnapshots = {};
  }
  proj.baseSnapshots[key] = snapshot ? deepClone(snapshot) : null;

  db.projects[pidx] = normalizeProject(proj);
  saveStore(db);
  return getProjectBaseSnapshot(projectId, key);
}

/* =========================
   Chapters (compartidos por proyecto)
   ========================= */
function listProjectChapters(projectId){
  const p = getProjectById(projectId);
  return (p && Array.isArray(p.chapters)) ? p.chapters : [];
}

function upsertProjectChapter(projectId, chap){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return null;

  const chapterCode = normalizeChapterCode(chap?.chapterCode ?? chap?.code);
  const chapterName = normalizeChapterName(chap?.chapterName ?? chap?.name);
  if(!chapterCode) throw new Error("Capítulo: falta chapterCode");

  const p = db.projects[pidx];
  if(!Array.isArray(p.chapters)) p.chapters = [];

  const id = safeStr(chap?.id);
  let idx = id ? p.chapters.findIndex(c => String(c.id) === id) : -1;

  if(idx === -1){
    idx = p.chapters.findIndex(c => String(c.chapterCode) === chapterCode);
  }

  const rec = {
    id: (idx >= 0 ? p.chapters[idx].id : (id || uid("chap"))),
    chapterCode,
    chapterName
  };

  if(idx >= 0) p.chapters[idx] = rec;
  else p.chapters.push(rec);

  p.chapters = normalizeChapters(p.chapters);

  try{
    for(const budgetKey of VALID_BUDGET_KEYS){
      const budget = getBudgetStateFromProject(p, budgetKey);
      for(const it of (budget.items || [])){
        if(String(it.chapterCode||"") === chapterCode && !safeStr(it.chapterName)){
          it.chapterName = chapterName;
        }
      }
      setBudgetStateOnProject(p, budgetKey, budget);
    }
  }catch(_){}

  p.updatedAt = nowISO();
  db.projects[pidx] = normalizeProject(p);
  saveStore(db);
  return rec;
}

function deleteProjectChapter(projectId, chapIdOrCode){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return false;

  const key = safeStr(chapIdOrCode);
  if(!key) return false;

  const p = db.projects[pidx];
  if(!Array.isArray(p.chapters)) p.chapters = [];

  const before = p.chapters.length;
  p.chapters = p.chapters.filter(c => String(c.id) !== key && String(c.chapterCode) !== key);

  const changed = p.chapters.length !== before;
  if(changed){
    p.updatedAt = nowISO();
    db.projects[pidx] = normalizeProject(p);
    saveStore(db);
  }
  return changed;
}

/* =========================
   Items por presupuesto
   ========================= */
function listBudgetItems(projectId, budgetKey=DEFAULT_ACTIVE_BUDGET){
  const budget = getProjectBudget(projectId, budgetKey);
  return budget ? ensureArray(budget.items).slice() : [];
}

function addBudgetItem(projectId, budgetKey, item){
  const db = loadStore();
  const idx = db.projects.findIndex(p=>p.id===projectId);
  if(idx===-1) return null;

  const proj = db.projects[idx];
  const budget = getBudgetStateFromProject(proj, budgetKey);

  const code = safeStr(item?.code);
  const chapCode = resolveChapterCodeForItem(proj, code, item?.chapterCode);
  const chapName = resolveChapterNameForItem(proj, chapCode, item?.chapterName);

  const apuRefCode =
    normalizeApuRefCode(item?.apuRefCode) ||
    safeStr(item?.code || "");

  const it = {
    id: uid("it"),
    chapterCode: chapCode,
    chapterName: chapName,
    apuRefCode,
    code: "",
    desc: "",
    unit: "",
    pu: 0,
    qty: 0,
    ...item,
    chapterCode: chapCode || safeStr(item?.chapterCode || ""),
    chapterName: chapName || safeStr(item?.chapterName || ""),
    apuRefCode: apuRefCode || normalizeApuRefCode(item?.apuRefCode) || safeStr(item?.code || "")
  };

  it.id = safeStr(it.id) || uid("it");
  it.code = safeStr(it.code);
  it.desc = safeStr(it.desc);
  it.unit = safeStr(it.unit);
  it.pu = toNum(it.pu, 0);
  it.qty = toNum(it.qty, 0);

  budget.items.push(it);
  budget.meta.updatedAt = nowISO();

  setBudgetStateOnProject(proj, budgetKey, budget);
  proj.updatedAt = nowISO();

  db.projects[idx] = normalizeProject(proj);
  saveStore(db);
  return it;
}

function updateBudgetItem(projectId, budgetKey, itemId, patch){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return null;

  const proj = db.projects[pidx];
  const budget = getBudgetStateFromProject(proj, budgetKey);

  const iidx = (budget.items||[]).findIndex(i=>i.id===itemId);
  if(iidx===-1) return null;

  const cur = budget.items[iidx];
  const next = { ...cur, ...patch };

  const incomingCode = safeStr(patch?.code);
  const codeChanged = incomingCode && incomingCode !== safeStr(cur?.code);
  const patchHasApuRef = patch && Object.prototype.hasOwnProperty.call(patch, "apuRefCode");
  if(codeChanged && !patchHasApuRef){
    if(!normalizeApuRefCode(cur?.apuRefCode)){
      next.apuRefCode = safeStr(cur?.code || "");
    }else{
      next.apuRefCode = normalizeApuRefCode(cur.apuRefCode);
    }
  }

  if(patchHasApuRef){
    next.apuRefCode = normalizeApuRefCode(patch.apuRefCode);
  }

  if(!normalizeApuRefCode(next.apuRefCode)){
    next.apuRefCode = safeStr(next.code || "");
  }

  if(patch.code && patch.chapterCode == null){
    const resolved = resolveChapterCodeForItem(proj, String(patch.code), "");
    if(resolved) next.chapterCode = resolved;
  }

  if((patch.chapterCode != null) || next.chapterCode){
    if(!safeStr(next.chapterName)){
      next.chapterName = resolveChapterNameForItem(proj, next.chapterCode, next.chapterName);
    }
  }

  next.id = safeStr(next.id) || uid("it");
  next.code = safeStr(next.code);
  next.desc = safeStr(next.desc);
  next.unit = safeStr(next.unit);
  next.pu = toNum(next.pu, 0);
  next.qty = toNum(next.qty, 0);

  budget.items[iidx] = next;
  budget.meta.updatedAt = nowISO();

  setBudgetStateOnProject(proj, budgetKey, budget);
  proj.updatedAt = nowISO();

  db.projects[pidx] = normalizeProject(proj);

  saveStore(db);
  return next;
}

function deleteBudgetItem(projectId, budgetKey, itemId){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return false;

  const proj = db.projects[pidx];
  const budget = getBudgetStateFromProject(proj, budgetKey);

  budget.items = (budget.items || []).filter(i => i.id !== itemId);
  budget.meta.updatedAt = nowISO();

  setBudgetStateOnProject(proj, budgetKey, budget);
  proj.updatedAt = nowISO();

  saveStore(db);
  return true;
}

function updateBudgetItemsPUByCode(projectId, budgetKey, code, newPU){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return 0;

  const proj = db.projects[pidx];
  const budget = getBudgetStateFromProject(proj, budgetKey);

  const c = String(code||"").trim();
  let count = 0;
  for(const it of (budget.items||[])){
    const lookup = getItemApuLookupCode(it);
    if(String(lookup||"").trim() === c){
      it.pu = Number(newPU||0);
      count++;
    }
  }

  if(count){
    budget.meta.updatedAt = nowISO();
    setBudgetStateOnProject(proj, budgetKey, budget);
    proj.updatedAt = nowISO();
    saveStore(db);
  }
  return count;
}

function updateBudgetItemsPUByApuRefCode(projectId, budgetKey, apuRefCode, newPU){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return 0;

  const proj = db.projects[pidx];
  const budget = getBudgetStateFromProject(proj, budgetKey);

  const ref = String(apuRefCode||"").trim();
  let count = 0;

  for(const it of (budget.items||[])){
    const currentRef = normalizeApuRefCode(it?.apuRefCode) || safeStr(it?.code);
    if(String(currentRef).trim() === ref){
      it.pu = Number(newPU||0);
      count++;
    }
  }

  if(count){
    budget.meta.updatedAt = nowISO();
    setBudgetStateOnProject(proj, budgetKey, budget);
    proj.updatedAt = nowISO();
    saveStore(db);
  }
  return count;
}

/* =========================
   Override APU por presupuesto
   ========================= */
function getBudgetApuOverride(projectId, budgetKey, code){
  const budget = getProjectBudget(projectId, budgetKey);
  if(!budget) return null;
  const c = String(code||"").trim();
  return (budget.apuOverrides && budget.apuOverrides[c]) ? budget.apuOverrides[c] : null;
}

function setBudgetApuOverride(projectId, budgetKey, code, lines){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return null;

  const proj = db.projects[pidx];
  const budget = getBudgetStateFromProject(proj, budgetKey);

  const c = String(code||"").trim();
  if(!budget.apuOverrides) budget.apuOverrides = {};
  budget.apuOverrides[c] = {
    code: c,
    updatedAt: nowISO(),
    lines: Array.isArray(lines) ? lines.map(normalizeApuLine) : []
  };

  budget.meta.updatedAt = nowISO();
  setBudgetStateOnProject(proj, budgetKey, budget);
  proj.updatedAt = nowISO();
  saveStore(db);
  return getBudgetApuOverride(projectId, budgetKey, c);
}

function clearBudgetApuOverride(projectId, budgetKey, code){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return false;

  const proj = db.projects[pidx];
  const budget = getBudgetStateFromProject(proj, budgetKey);

  const c = String(code||"").trim();
  if(budget.apuOverrides && budget.apuOverrides[c]){
    delete budget.apuOverrides[c];
    budget.meta.updatedAt = nowISO();
    setBudgetStateOnProject(proj, budgetKey, budget);
    proj.updatedAt = nowISO();
    saveStore(db);
    return true;
  }
  return false;
}

/* =========================
   FACTURACIÓN por presupuesto
   ========================= */
function listBudgetFacturacion(projectId, budgetKey=DEFAULT_ACTIVE_BUDGET, categoria=""){
  const budget = getProjectBudget(projectId, budgetKey);
  if(!budget) return [];
  const rows = Array.isArray(budget.facturacion) ? budget.facturacion : [];
  const cat = safeStr(categoria);
  if(!cat) return rows.slice();
  const norm = normalizeFactCategory(cat);
  return rows.filter(r => normalizeFactCategory(r.categoria) === norm);
}

function addBudgetFacturacion(projectId, budgetKey, payload){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return null;

  const proj = db.projects[pidx];
  const budget = getBudgetStateFromProject(proj, budgetKey);

  if(!Array.isArray(budget.facturacion)) budget.facturacion = [];

  const rec = normalizeFacturacionRegistro(payload || {});
  budget.facturacion.unshift(rec);
  budget.meta.updatedAt = nowISO();

  setBudgetStateOnProject(proj, budgetKey, budget);
  proj.updatedAt = nowISO();

  db.projects[pidx] = normalizeProject(proj);
  saveStore(db);
  return rec;
}

function updateBudgetFacturacion(projectId, budgetKey, facturaId, patch){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return null;

  const proj = db.projects[pidx];
  const budget = getBudgetStateFromProject(proj, budgetKey);

  if(!Array.isArray(budget.facturacion)) budget.facturacion = [];

  const idx = budget.facturacion.findIndex(r => String(r.id) === String(facturaId));
  if(idx === -1) return null;

  const merged = {
    ...budget.facturacion[idx],
    ...(patch || {})
  };
  budget.facturacion[idx] = normalizeFacturacionRegistro(merged);
  budget.meta.updatedAt = nowISO();

  setBudgetStateOnProject(proj, budgetKey, budget);
  proj.updatedAt = nowISO();

  db.projects[pidx] = normalizeProject(proj);
  saveStore(db);
  return budget.facturacion[idx];
}

function deleteBudgetFacturacion(projectId, budgetKey, facturaId){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return false;

  const proj = db.projects[pidx];
  const budget = getBudgetStateFromProject(proj, budgetKey);

  if(!Array.isArray(budget.facturacion)) budget.facturacion = [];

  const before = budget.facturacion.length;
  budget.facturacion = budget.facturacion.filter(r => String(r.id) !== String(facturaId));

  const changed = budget.facturacion.length !== before;
  if(changed){
    budget.meta.updatedAt = nowISO();
    setBudgetStateOnProject(proj, budgetKey, budget);
    proj.updatedAt = nowISO();
    db.projects[pidx] = normalizeProject(proj);
    saveStore(db);
  }
  return changed;
}

function sumBudgetFacturacionByCategoria(projectId, budgetKey=DEFAULT_ACTIVE_BUDGET){
  const rows = listBudgetFacturacion(projectId, budgetKey);
  const out = {};
  for(const r of rows){
    const cat = normalizeFactCategory(r.categoria);
    out[cat] = Number(out[cat]||0) + Number(r.valor||0);
  }
  return out;
}

/* =========================
   Custom insumos / APUs por presupuesto
   ========================= */
function listProjectBudgetCustomInsumos(projectId, budgetKey=DEFAULT_ACTIVE_BUDGET){
  const budget = getProjectBudget(projectId, budgetKey);
  return budget ? ensureArray(budget.customInsumos).slice() : [];
}

function addProjectBudgetCustomInsumo(projectId, budgetKey, payload){
  const db = loadStore();
  const pidx = db.projects.findIndex(p => p.id === projectId);
  if(pidx === -1) return null;

  const proj = db.projects[pidx];
  const budget = getBudgetStateFromProject(proj, budgetKey);

  const rec = normalizeCustomInsumoRecord({
    id: uid("ins"),
    tipo: payload?.tipo,
    desc: payload?.desc,
    unit: payload?.unit,
    pu: payload?.pu
  });

  if(!Array.isArray(budget.customInsumos)) budget.customInsumos = [];
  budget.customInsumos.unshift(rec);
  budget.meta.updatedAt = nowISO();

  setBudgetStateOnProject(proj, budgetKey, budget);
  proj.updatedAt = nowISO();
  saveStore(db);
  return rec;
}

function listProjectBudgetCustomAPUs(projectId, budgetKey=DEFAULT_ACTIVE_BUDGET){
  const budget = getProjectBudget(projectId, budgetKey);
  return budget ? Object.values(budget.customAPUs || {}) : [];
}

function getProjectBudgetCustomAPU(projectId, budgetKey, code){
  const budget = getProjectBudget(projectId, budgetKey);
  if(!budget) return null;
  const key = safeStr(code);
  return (budget.customAPUs && budget.customAPUs[key]) ? budget.customAPUs[key] : null;
}

function upsertProjectBudgetCustomAPU(projectId, budgetKey, apu){
  const db = loadStore();
  const pidx = db.projects.findIndex(p => p.id === projectId);
  if(pidx === -1) return null;

  const proj = db.projects[pidx];
  const budget = getBudgetStateFromProject(proj, budgetKey);

  const rec = normalizeCustomAPURecord(apu || {});
  if(!budget.customAPUs || typeof budget.customAPUs !== "object"){
    budget.customAPUs = {};
  }

  budget.customAPUs[rec.code] = rec;
  budget.meta.updatedAt = nowISO();

  setBudgetStateOnProject(proj, budgetKey, budget);
  proj.updatedAt = nowISO();
  saveStore(db);

  return getProjectBudgetCustomAPU(projectId, budgetKey, rec.code);
}

/* =========================
   Compatibilidad con app actual
   TODAS estas funciones siguen operando
   sobre el presupuesto CONTRATISTA.
   ========================= */

/* ===== Items legado ===== */
function addItem(projectId, item){
  return addBudgetItem(projectId, BUDGET_CONTRATISTA, item);
}

function updateItem(projectId, itemId, patch){
  return updateBudgetItem(projectId, BUDGET_CONTRATISTA, itemId, patch);
}

function deleteItem(projectId, itemId){
  return deleteBudgetItem(projectId, BUDGET_CONTRATISTA, itemId);
}

function updateItemsPUByCode(projectId, code, newPU){
  return updateBudgetItemsPUByCode(projectId, BUDGET_CONTRATISTA, code, newPU);
}

function updateItemsPUByApuRefCode(projectId, apuRefCode, newPU){
  return updateBudgetItemsPUByApuRefCode(projectId, BUDGET_CONTRATISTA, apuRefCode, newPU);
}

/* ===== Override APU legado ===== */
function getApuOverride(projectId, code){
  return getBudgetApuOverride(projectId, BUDGET_CONTRATISTA, code);
}

function setApuOverride(projectId, code, lines){
  return setBudgetApuOverride(projectId, BUDGET_CONTRATISTA, code, lines);
}

function clearApuOverride(projectId, code){
  return clearBudgetApuOverride(projectId, BUDGET_CONTRATISTA, code);
}

/* ===== Facturación legado ===== */
function listFacturacion(projectId, categoria=""){
  return listBudgetFacturacion(projectId, BUDGET_CONTRATISTA, categoria);
}

function addFacturacion(projectId, payload){
  return addBudgetFacturacion(projectId, BUDGET_CONTRATISTA, payload);
}

function updateFacturacion(projectId, facturaId, patch){
  return updateBudgetFacturacion(projectId, BUDGET_CONTRATISTA, facturaId, patch);
}

function deleteFacturacion(projectId, facturaId){
  return deleteBudgetFacturacion(projectId, BUDGET_CONTRATISTA, facturaId);
}

function sumFacturacionByCategoria(projectId){
  return sumBudgetFacturacionByCategoria(projectId, BUDGET_CONTRATISTA);
}

/* =========================
   Importar proyecto como NUEVO
   ========================= */
function importProjectAsNew(projectObj){
  if(!projectObj) throw new Error("Proyecto inválido");
  const payload = normalizeProject({ ...projectObj });

  const base = createProject({
    name: payload.name || "Proyecto importado",
    entity: payload.entity || "",
    location: payload.location || "",
    currency: payload.currency || "COP",

    adminPct: Number(payload.adminPct ?? 18),
    imprevPct: Number(payload.imprevPct ?? 2),
    utilPct: Number(payload.utilPct ?? 5),
    ivaUtilPct: Number(payload.ivaUtilPct ?? 19),

    aiuPct: Number(payload.aiuPct||0),
    ivaPct: Number(payload.ivaPct||0),
    ivaBase: payload.ivaBase || "sobre_directo_aiu",

    logoDataUrl: payload.logoDataUrl || "",
    instPais: payload.instPais || "",
    instDepto: payload.instDepto || "",
    instMunicipio: payload.instMunicipio || "",
    instEntidad: payload.instEntidad || "",
    instProyectoLabel: payload.instProyectoLabel || "",
    instFechaElab: payload.instFechaElab || "",

    chapters: Array.isArray(payload.chapters) ? payload.chapters : [],
    activeBudget: normalizeBudgetKey(payload.activeBudget || DEFAULT_ACTIVE_BUDGET)
  });

  const contratista = getBudgetStateFromProject(payload, BUDGET_CONTRATISTA);
  const oficial = getBudgetStateFromProject(payload, BUDGET_OFICIAL);

  const mappedContratistaItems = ensureArray(contratista.items).map(it => ({
    id: uid("it"),
    chapterCode: safeStr(it.chapterCode || ""),
    chapterName: safeStr(it.chapterName || ""),
    apuRefCode: normalizeApuRefCode(it.apuRefCode) || safeStr(it.code || ""),
    code: safeStr(it.code || ""),
    desc: safeStr(it.desc || ""),
    unit: safeStr(it.unit || ""),
    pu: Number(it.pu || 0),
    qty: Number(it.qty || 0)
  }));

  const mappedOficialItems = ensureArray(oficial.items).map(it => ({
    id: uid("it"),
    chapterCode: safeStr(it.chapterCode || ""),
    chapterName: safeStr(it.chapterName || ""),
    apuRefCode: normalizeApuRefCode(it.apuRefCode) || safeStr(it.code || ""),
    code: safeStr(it.code || ""),
    desc: safeStr(it.desc || ""),
    unit: safeStr(it.unit || ""),
    pu: Number(it.pu || 0),
    qty: Number(it.qty || 0)
  }));

  updateProject(base.id, {
    budgets: {
      [BUDGET_CONTRATISTA]: {
        ...contratista,
        items: mappedContratistaItems
      },
      [BUDGET_OFICIAL]: {
        ...oficial,
        items: mappedOficialItems
      }
    },
    baseSnapshots: {
      [BUDGET_CONTRATISTA]: payload.baseSnapshots?.[BUDGET_CONTRATISTA] || contratista?.meta?.baseSnapshot || null,
      [BUDGET_OFICIAL]: payload.baseSnapshots?.[BUDGET_OFICIAL] || oficial?.meta?.baseSnapshot || null
    },
    facturacion: normalizeFacturacion(contratista.facturacion)
  });

  return getProjectById(base.id);
}

try{
  requestPersistentStorage();
}catch(_){}

window.StorageAPI = {
  loadStore, saveStore,
  exportBackup, importBackupFromFile, resetAll,

  getElaborador, setElaborador, clearFirma,

  getCurrentBaseMeta, setCurrentBaseMeta, listBaseHistory,

  listCustomInsumos, addCustomInsumo,
  getCustomAPU, upsertCustomAPU, listCustomAPUs,

  createProject, updateProject, listProjects, getProjectById, deleteProject,

  getActiveBudget, setActiveBudget,
  getProjectBudget, updateProjectBudget,

  getProjectBaseSnapshot, setProjectBaseSnapshot,

  listProjectChapters, upsertProjectChapter, deleteProjectChapter,

  listBudgetItems, addBudgetItem, updateBudgetItem, deleteBudgetItem,
  updateBudgetItemsPUByCode,
  updateBudgetItemsPUByApuRefCode,

  getBudgetApuOverride, setBudgetApuOverride, clearBudgetApuOverride,

  listBudgetFacturacion, addBudgetFacturacion, updateBudgetFacturacion, deleteBudgetFacturacion, sumBudgetFacturacionByCategoria,

  listProjectBudgetCustomInsumos, addProjectBudgetCustomInsumo,
  listProjectBudgetCustomAPUs, getProjectBudgetCustomAPU, upsertProjectBudgetCustomAPU,

  /* Compatibilidad actual */
  addItem, updateItem, deleteItem,
  updateItemsPUByCode,
  updateItemsPUByApuRefCode,

  getApuOverride, setApuOverride, clearApuOverride,

  listFacturacion, addFacturacion, updateFacturacion, deleteFacturacion, sumFacturacionByCategoria,

  importProjectAsNew
};