const STORE_KEY = "presupuesto_pro_v1";
const STORE_BACKUP_KEY = "presupuesto_pro_v1_backup";

function nowISO(){ return new Date().toISOString(); }
function uid(prefix="id"){ return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`; }

function safeStr(v){ return String(v ?? "").trim(); }

const STORAGE_SCHEMA_VERSION = 11;
const BUDGET_BASE = "base";
const BUDGET_OFFICIAL = "official";

/* =========================
   Utilidades generales
   ========================= */
function deepClone(obj){
  try{
    return JSON.parse(JSON.stringify(obj));
  }catch(_){
    return obj;
  }
}

function toFiniteNumber(v, fallback=0){
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function ensureArray(v){
  return Array.isArray(v) ? v : [];
}

function ensureObject(v){
  return (v && typeof v === "object" && !Array.isArray(v)) ? v : {};
}

function normalizeBudgetMode(v){
  return String(v || "").toLowerCase() === BUDGET_OFFICIAL ? BUDGET_OFFICIAL : BUDGET_BASE;
}

/* =========================
   ✅ AJUSTES DE PERSISTENCIA MÓVIL
   - Escritura duplicada (principal + backup)
   - Recuperación automática si el principal falla
   - Solicitud de almacenamiento persistente cuando el navegador lo soporte
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
   Chapters helpers (✅ alineado a app.js)
   project.chapters = [{ id, chapterCode, chapterName }]
   ========================= */
function normalizeChapterCode(code){
  // Permite "3", "3.00", "03.00", "3.1", "10.00", etc.
  // Solo limpiamos espacios.
  return safeStr(code);
}

function normalizeChapterName(name){
  return safeStr(name);
}

function normalizeChapters(raw){
  const arr = Array.isArray(raw) ? raw : [];
  const out = [];

  for(const c of arr){
    // ✅ soportar tanto esquema nuevo como viejo
    const code = normalizeChapterCode(c?.chapterCode ?? c?.code);
    const name = normalizeChapterName(c?.chapterName ?? c?.name);
    if(!code) continue;

    out.push({
      id: safeStr(c?.id) || uid("chap"),
      chapterCode: code,
      chapterName: name
    });
  }

  // Unicidad por chapterCode (primero gana)
  const seen = new Set();
  const uniq = [];
  for(const c of out){
    if(seen.has(c.chapterCode)) continue;
    seen.add(c.chapterCode);
    uniq.push(c);
  }

  // Orden por "número" si aplica, si no lexicográfico
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

  // "3.01" => baseSeg "3"
  const seg = code.split(".")[0];
  const baseSeg = safeStr(seg);

  // Candidatos comunes: "3" y "3.00"
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

  // Si el proyecto ya tiene capítulos definidos, intentamos calzar con ellos
  const chs = Array.isArray(project?.chapters) ? project.chapters : [];
  if(chs.length){
    const set = new Set(chs.map(c => String(c.chapterCode)));
    for(const c of cand){
      if(set.has(c)) return c;
    }
  }

  // Fallback: el primero (normalmente "3")
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
   ✅ NUEVO: APU Ref helpers
   - item.code: código visible (puede renumerarse)
   - item.apuRefCode: código real del APU/base (para descomposición/PDF)
   ========================= */
function normalizeApuRefCode(v){
  return safeStr(v);
}
function getItemApuLookupCode(it){
  // Lo que debe usarse para buscar descomposición/override: apuRefCode si existe, si no code
  const ref = normalizeApuRefCode(it?.apuRefCode);
  return ref || safeStr(it?.code);
}

/* =========================
   ✅ NUEVO: Subproducto override helpers
   - subApuOverrides por proyecto/presupuesto
   - no modifica base importada
   ========================= */
function normalizeSubApuRefCode(v){
  return safeStr(v);
}

/* =========================
   Presupuestos duales
   ========================= */
function makeEmptyBudgetState(){
  return {
    items: [],
    apuOverrides: {},
    subApuOverrides: {},

    // Formato A-I-U + IVA utilidad
    adminPct: 18,
    imprevPct: 2,
    utilPct: 5,
    ivaUtilPct: 19,

    // Compat legacy
    aiuPct: 25,
    ivaPct: 19,
    ivaBase: "sobre_directo_aiu",

    // Indirectos / extras futuros
    indirectMode: "",
    indirectTable: []
  };
}

function applyAIUCompat(target){
  const t = target || makeEmptyBudgetState();

  const hasNew =
    (t.adminPct != null) ||
    (t.imprevPct != null) ||
    (t.utilPct != null) ||
    (t.ivaUtilPct != null);

  if(!hasNew){
    const legacyAIU = Number(t.aiuPct ?? 25);
    const legacyIVA = Number(t.ivaPct ?? 19);

    t.adminPct = Number.isFinite(legacyAIU) ? legacyAIU : 25;
    t.imprevPct = 0;
    t.utilPct = 0;
    t.ivaUtilPct = Number.isFinite(legacyIVA) ? legacyIVA : 19;
  }else{
    t.adminPct = Number(t.adminPct ?? 18);
    t.imprevPct = Number(t.imprevPct ?? 2);
    t.utilPct = Number(t.utilPct ?? 5);
    t.ivaUtilPct = Number(t.ivaUtilPct ?? 19);
  }

  const aiuCompat = Number(t.adminPct||0) + Number(t.imprevPct||0) + Number(t.utilPct||0);
  t.aiuPct = Number.isFinite(Number(t.aiuPct)) ? Number(t.aiuPct) : aiuCompat;
  if(!Number.isFinite(t.aiuPct)) t.aiuPct = aiuCompat;

  t.ivaPct = Number.isFinite(Number(t.ivaPct)) ? Number(t.ivaPct) : Number(t.ivaUtilPct||19);
  if(!Number.isFinite(t.ivaPct)) t.ivaPct = Number(t.ivaUtilPct||19);

  t.ivaBase = String(t.ivaBase || "sobre_directo_aiu");
  return t;
}

function normalizeBudgetItems(project, rawItems){
  const items = Array.isArray(rawItems) ? rawItems : [];
  const chs = Array.isArray(project?.chapters) ? project.chapters : [];

  for(const it of items){
    if(!normalizeApuRefCode(it?.apuRefCode)){
      it.apuRefCode = safeStr(it?.code || "");
    }else{
      it.apuRefCode = normalizeApuRefCode(it.apuRefCode);
    }

    const cc = normalizeChapterCode(it?.chapterCode);
    if(cc && (!safeStr(it?.chapterName))){
      const found = chs.find(c => String(c.chapterCode) === cc);
      if(found && found.chapterName) it.chapterName = String(found.chapterName);
    }

    it.code = safeStr(it?.code);
    it.desc = safeStr(it?.desc);
    it.unit = safeStr(it?.unit);
    it.chapterCode = safeStr(it?.chapterCode);
    it.chapterName = safeStr(it?.chapterName);
    it.pu = Number(it?.pu || 0);
    it.qty = Number(it?.qty || 0);

    if(!safeStr(it?.id)) it.id = uid("it");
  }

  return items;
}

function normalizeBudgetState(project, raw, legacyRoot){
  const out = { ...makeEmptyBudgetState(), ...ensureObject(raw) };
  const root = ensureObject(legacyRoot);

  if(!Array.isArray(out.items) || !out.items.length){
    if(Array.isArray(root.items)) out.items = deepClone(root.items);
  }
  if(!out.apuOverrides || typeof out.apuOverrides !== "object" || Array.isArray(out.apuOverrides)){
    out.apuOverrides = deepClone(root.apuOverrides || {});
  }
  if(!out.subApuOverrides || typeof out.subApuOverrides !== "object" || Array.isArray(out.subApuOverrides)){
    out.subApuOverrides = deepClone(root.subApuOverrides || {});
  }

  const aiuKeys = ["adminPct","imprevPct","utilPct","ivaUtilPct","aiuPct","ivaPct","ivaBase","indirectMode","indirectTable"];
  for(const k of aiuKeys){
    const emptyArr = (k === "indirectTable" && (!Array.isArray(out[k]) || !out[k].length));
    const emptyStr = (k !== "indirectTable" && (out[k] == null || out[k] === ""));
    if((emptyArr || emptyStr) && root[k] != null){
      out[k] = deepClone(root[k]);
    }
  }

  out.items = normalizeBudgetItems(project, out.items);
  out.apuOverrides = ensureObject(out.apuOverrides);
  out.subApuOverrides = ensureObject(out.subApuOverrides);
  out.indirectMode = safeStr(out.indirectMode);
  out.indirectTable = ensureArray(out.indirectTable);
  applyAIUCompat(out);

  return out;
}

function getBudgetByMode(project, mode){
  const m = normalizeBudgetMode(mode);
  return m === BUDGET_OFFICIAL ? project?.budgetOfficial : project?.budgetBase;
}

function getActiveBudget(project){
  const m = normalizeBudgetMode(project?.activeBudget);
  return getBudgetByMode(project, m) || getBudgetByMode(project, BUDGET_BASE) || makeEmptyBudgetState();
}

function syncRootProjectBudgetAliases(project){
  const proj = project || {};
  const active = getActiveBudget(proj);

  proj.items = Array.isArray(active.items) ? active.items : [];
  proj.apuOverrides = ensureObject(active.apuOverrides);
  proj.subApuOverrides = ensureObject(active.subApuOverrides);

  proj.adminPct = Number(active.adminPct ?? 18);
  proj.imprevPct = Number(active.imprevPct ?? 2);
  proj.utilPct = Number(active.utilPct ?? 5);
  proj.ivaUtilPct = Number(active.ivaUtilPct ?? 19);
  proj.aiuPct = Number(active.aiuPct ?? (proj.adminPct + proj.imprevPct + proj.utilPct));
  proj.ivaPct = Number(active.ivaPct ?? proj.ivaUtilPct);
  proj.ivaBase = String(active.ivaBase || "sobre_directo_aiu");
  proj.indirectMode = safeStr(active.indirectMode);
  proj.indirectTable = ensureArray(active.indirectTable);

  return proj;
}

function syncLegacyRootIntoActiveBudget(project){
  const proj = project || {};
  const activeMode = normalizeBudgetMode(proj.activeBudget);
  const key = activeMode === BUDGET_OFFICIAL ? "budgetOfficial" : "budgetBase";

  if(!proj[key]) proj[key] = makeEmptyBudgetState();
  const active = proj[key];

  if(Array.isArray(proj.items)) active.items = deepClone(proj.items);
  if(proj.apuOverrides && typeof proj.apuOverrides === "object" && !Array.isArray(proj.apuOverrides)){
    active.apuOverrides = deepClone(proj.apuOverrides);
  }
  if(proj.subApuOverrides && typeof proj.subApuOverrides === "object" && !Array.isArray(proj.subApuOverrides)){
    active.subApuOverrides = deepClone(proj.subApuOverrides);
  }

  const mapKeys = ["adminPct","imprevPct","utilPct","ivaUtilPct","aiuPct","ivaPct","ivaBase","indirectMode","indirectTable"];
  for(const k of mapKeys){
    if(proj[k] != null){
      active[k] = deepClone(proj[k]);
    }
  }

  proj[key] = normalizeBudgetState(proj, active, {});
  return proj;
}

function cloneBudgetState(src){
  const base = normalizeBudgetState({ chapters: [] }, deepClone(src || makeEmptyBudgetState()), {});
  return {
    items: deepClone(base.items || []),
    apuOverrides: deepClone(base.apuOverrides || {}),
    subApuOverrides: deepClone(base.subApuOverrides || {}),
    adminPct: Number(base.adminPct ?? 18),
    imprevPct: Number(base.imprevPct ?? 2),
    utilPct: Number(base.utilPct ?? 5),
    ivaUtilPct: Number(base.ivaUtilPct ?? 19),
    aiuPct: Number(base.aiuPct ?? 25),
    ivaPct: Number(base.ivaPct ?? 19),
    ivaBase: String(base.ivaBase || "sobre_directo_aiu"),
    indirectMode: safeStr(base.indirectMode),
    indirectTable: deepClone(base.indirectTable || [])
  };
}

/* =========================
   Proyecto
   ========================= */
function normalizeProject(p){
  const proj = p || {};

  proj.currency = String(proj.currency || "COP");

  // ✅ Logo institucional (por proyecto)
  proj.logoDataUrl = String(proj.logoDataUrl || "");

  // ✅ Formato institucional COMPLETO (por proyecto)
  proj.instPais = String(proj.instPais || "");
  proj.instDepto = String(proj.instDepto || "");
  proj.instMunicipio = String(proj.instMunicipio || "");
  proj.instEntidad = String(proj.instEntidad || "");
  proj.instProyectoLabel = String(proj.instProyectoLabel || "");
  proj.instFechaElab = String(proj.instFechaElab || "");

  // ✅ capítulos definidos por el usuario (por proyecto)
  proj.chapters = normalizeChapters(proj.chapters);

  // Presupuesto activo
  proj.activeBudget = normalizeBudgetMode(proj.activeBudget);

  // ✅ Migración desde esquema viejo (root items/root apuOverrides/etc.) al nuevo
  const legacyRoot = {
    items: Array.isArray(proj.items) ? proj.items : [],
    apuOverrides: ensureObject(proj.apuOverrides),
    subApuOverrides: ensureObject(proj.subApuOverrides),
    adminPct: proj.adminPct,
    imprevPct: proj.imprevPct,
    utilPct: proj.utilPct,
    ivaUtilPct: proj.ivaUtilPct,
    aiuPct: proj.aiuPct,
    ivaPct: proj.ivaPct,
    ivaBase: proj.ivaBase,
    indirectMode: proj.indirectMode,
    indirectTable: proj.indirectTable
  };

  proj.budgetBase = normalizeBudgetState(proj, proj.budgetBase, legacyRoot);
  proj.budgetOfficial = normalizeBudgetState(proj, proj.budgetOfficial, {});

  // Si viene updateProject con patch a nivel raíz, lo sincronizamos al presupuesto activo
  syncLegacyRootIntoActiveBudget(proj);

  // Normalización fina después de sync
  proj.budgetBase = normalizeBudgetState(proj, proj.budgetBase, {});
  proj.budgetOfficial = normalizeBudgetState(proj, proj.budgetOfficial, {});

  // ✅ Compatibilidad total con app actual: exponer en raíz el presupuesto activo
  syncRootProjectBudgetAliases(proj);

  return proj;
}

function buildInitialStore(){
  return {
    meta:{
      createdAt: nowISO(),
      version: STORAGE_SCHEMA_VERSION,
      lastSavedAt: nowISO(),

      elaborador: {
        nombre: "",
        profesion: "",
        matricula: "",
        firmaDataUrl: ""
      },

      customAPUs: {},
      customInsumos: []
    },
    projects:[]
  };
}

function loadStore(){
  requestPersistentStorage();

  if(!storageAvailable()){
    // Fallback seguro en caso extremo
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

  const raw = rawMain || rawBackup;

  try{
    const db = JSON.parse(raw);

    if(!db.meta) db.meta = { createdAt:nowISO(), version:STORAGE_SCHEMA_VERSION, lastSavedAt: nowISO() };
    if(!Number.isFinite(Number(db.meta.version))) db.meta.version = STORAGE_SCHEMA_VERSION;
    if(!db.meta.lastSavedAt) db.meta.lastSavedAt = nowISO();

    if(!db.meta.customAPUs) db.meta.customAPUs = {};
    if(!db.meta.customInsumos) db.meta.customInsumos = [];

    if(!db.meta.elaborador){
      db.meta.elaborador = { nombre:"", profesion:"", matricula:"", firmaDataUrl:"" };
    }else{
      db.meta.elaborador.nombre = String(db.meta.elaborador.nombre||"");
      db.meta.elaborador.profesion = String(db.meta.elaborador.profesion||"");
      db.meta.elaborador.matricula = String(db.meta.elaborador.matricula||"");
      db.meta.elaborador.firmaDataUrl = String(db.meta.elaborador.firmaDataUrl||"");
    }

    if(!db.projects) db.projects = [];

    // ✅ Normalizar proyectos
    db.projects = db.projects.map(p => normalizeProject(p));

    if(db.meta.version < STORAGE_SCHEMA_VERSION) db.meta.version = STORAGE_SCHEMA_VERSION;

    // ✅ Reescribe ambas copias ya normalizadas
    saveStore(db);
    return db;
  }catch(_){
    // ✅ Si falla el principal, intentar recuperar desde backup
    if(rawMain && rawBackup && rawMain !== rawBackup){
      try{
        const recovered = JSON.parse(rawBackup);
        if(!recovered.meta) recovered.meta = { createdAt:nowISO(), version:STORAGE_SCHEMA_VERSION, lastSavedAt: nowISO() };
        if(!recovered.projects) recovered.projects = [];
        recovered.projects = recovered.projects.map(p => normalizeProject(p));
        recovered.meta.version = STORAGE_SCHEMA_VERSION;
        recovered.meta.lastSavedAt = nowISO();
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

  if(!out.meta) out.meta = {};
  out.meta.version = STORAGE_SCHEMA_VERSION;
  out.meta.lastSavedAt = nowISO();

  // Antes de guardar, normalizar proyectos para que siempre viajen correctos
  if(!Array.isArray(out.projects)) out.projects = [];
  out.projects = out.projects.map(p => normalizeProject(p));

  const txt = JSON.stringify(out);

  // ✅ Guardado duplicado para mayor estabilidad en móvil
  safeLocalSet(STORE_KEY, txt);
  safeLocalSet(STORE_BACKUP_KEY, txt);

  return true;
}

function exportBackup(){
  const db = loadStore();
  const blob = new Blob([JSON.stringify(db,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  return { url, filename:`backup_presupuesto_pro_${Date.now()}.json` };
}

async function importBackupFromFile(file){
  const text = await file.text();
  const data = JSON.parse(text);
  if(!data || !data.projects) throw new Error("Backup inválido.");

  if(!data.meta) data.meta = { createdAt:nowISO(), version:STORAGE_SCHEMA_VERSION, lastSavedAt: nowISO() };
  if(!data.meta.customAPUs) data.meta.customAPUs = {};
  if(!data.meta.customInsumos) data.meta.customInsumos = [];
  if(!data.meta.elaborador) data.meta.elaborador = { nombre:"", profesion:"", matricula:"", firmaDataUrl:"" };

  if(!data.projects) data.projects = [];

  // ✅ Normalizar proyectos importados
  data.projects = data.projects.map(p => normalizeProject(p));

  data.meta.version = STORAGE_SCHEMA_VERSION;
  data.meta.lastSavedAt = nowISO();

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

/* ===== Custom Insumos ===== */
function listCustomInsumos(){
  return (loadStore().meta.customInsumos || []);
}

function addCustomInsumo({ tipo, desc, unit, pu }){
  const db = loadStore();
  const rec = {
    id: uid("ins"),
    tipo: String(tipo||"").trim(),
    desc: String(desc||"").trim(),
    unit: String(unit||"").trim(),
    pu: Number(pu||0)
  };
  db.meta.customInsumos.unshift(rec);
  saveStore(db);
  return rec;
}

/* ===== Custom APUs ===== */
function getCustomAPU(code){
  const db = loadStore();
  const key = String(code||"").trim();
  return (db.meta.customAPUs && db.meta.customAPUs[key]) ? db.meta.customAPUs[key] : null;
}

function upsertCustomAPU(apu){
  const db = loadStore();
  const key = String(apu?.code||"").trim();
  if(!key) throw new Error("Custom APU: falta code");
  db.meta.customAPUs[key] = {
    code: key,
    desc: String(apu.desc||"").trim(),
    unit: String(apu.unit||"").trim(),
    chapterCode: String(apu.chapterCode||"").trim(),
    chapterName: String(apu.chapterName||"").trim(),
    lines: Array.isArray(apu.lines) ? apu.lines : []
  };
  saveStore(db);
  return db.meta.customAPUs[key];
}

function listCustomAPUs(){
  const db = loadStore();
  return Object.values(db.meta.customAPUs || {});
}

/* ===== Projects ===== */
function createProject(payload){
  const db = loadStore();

  const p = normalizeProject({
    id: uid("proj"),
    createdAt: nowISO(),
    updatedAt: nowISO(),
    currency: "COP",

    // Compat y defaults visibles actuales
    adminPct: 18,
    imprevPct: 2,
    utilPct: 5,
    ivaUtilPct: 19,
    aiuPct: 25,
    ivaPct: 19,
    ivaBase: "sobre_directo_aiu",

    // Institucional
    logoDataUrl: "",
    instPais: "",
    instDepto: "",
    instMunicipio: "",
    instEntidad: "",
    instProyectoLabel: "",
    instFechaElab: "",

    // Chapters
    chapters: [],

    // Presupuestos duales
    activeBudget: BUDGET_BASE,
    budgetBase: makeEmptyBudgetState(),
    budgetOfficial: makeEmptyBudgetState(),

    // Compat raíz
    items: [],
    apuOverrides: {},
    subApuOverrides: {},

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

function listProjects(){
  return loadStore().projects;
}
function getProjectById(id){
  return loadStore().projects.find(p=>p.id===id) || null;
}

function deleteProject(id){
  const db = loadStore();
  db.projects = db.projects.filter(p=>p.id!==id);
  saveStore(db);
}

/* =========================
   Presupuestos del proyecto
   ========================= */
function getProjectBudget(projectId, mode){
  const p = getProjectById(projectId);
  if(!p) return null;
  return getBudgetByMode(p, mode);
}

function getProjectActiveBudgetMode(projectId){
  const p = getProjectById(projectId);
  if(!p) return BUDGET_BASE;
  return normalizeBudgetMode(p.activeBudget);
}

function setActiveBudget(projectId, mode){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return null;

  db.projects[pidx].activeBudget = normalizeBudgetMode(mode);
  db.projects[pidx].updatedAt = nowISO();
  db.projects[pidx] = normalizeProject(db.projects[pidx]);

  saveStore(db);
  return db.projects[pidx];
}

function cloneBaseToOfficial(projectId){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return null;

  const proj = db.projects[pidx];
  proj.budgetBase = normalizeBudgetState(proj, proj.budgetBase, {});
  proj.budgetOfficial = cloneBudgetState(proj.budgetBase);
  proj.activeBudget = BUDGET_OFFICIAL;
  proj.updatedAt = nowISO();

  db.projects[pidx] = normalizeProject(proj);
  saveStore(db);

  return db.projects[pidx];
}

function replaceBudget(projectId, mode, budgetPatch){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return null;

  const proj = db.projects[pidx];
  const key = normalizeBudgetMode(mode) === BUDGET_OFFICIAL ? "budgetOfficial" : "budgetBase";
  proj[key] = normalizeBudgetState(proj, { ...(proj[key] || {}), ...(budgetPatch || {}) }, {});
  proj.updatedAt = nowISO();

  db.projects[pidx] = normalizeProject(proj);
  saveStore(db);
  return db.projects[pidx][key];
}

/* =========================
   Chapters (por proyecto)
   ========================= */
function listProjectChapters(projectId){
  const p = getProjectById(projectId);
  return (p && Array.isArray(p.chapters)) ? p.chapters : [];
}

// ✅ API compatible con app.js: app.js usa updateProject({chapters:[...]})
// Igual dejamos helpers por si los usas en otras pantallas.
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

  // Si no existe por id, buscar por chapterCode
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

  // ✅ Propagar chapterName a ítems de ambos presupuestos
  try{
    for(const budgetKey of ["budgetBase", "budgetOfficial"]){
      const budget = p[budgetKey];
      if(!budget || !Array.isArray(budget.items)) continue;
      for(const it of budget.items){
        if(String(it.chapterCode||"") === chapterCode && !safeStr(it.chapterName)){
          it.chapterName = chapterName;
        }
      }
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
   Helpers internos de ítems/APU sobre presupuesto activo
   ========================= */
function getEditableActiveBudget(project){
  if(!project) return null;
  const mode = normalizeBudgetMode(project.activeBudget);
  const key = mode === BUDGET_OFFICIAL ? "budgetOfficial" : "budgetBase";
  if(!project[key]) project[key] = makeEmptyBudgetState();
  return project[key];
}

/* ===== Items ===== */
function addItem(projectId, item){
  const db = loadStore();
  const idx = db.projects.findIndex(p=>p.id===projectId);
  if(idx===-1) return null;

  const proj = db.projects[idx];
  const budget = getEditableActiveBudget(proj);

  const code = safeStr(item?.code);
  const chapCode = resolveChapterCodeForItem(proj, code, item?.chapterCode);
  const chapName = resolveChapterNameForItem(proj, chapCode, item?.chapterName);

  // ✅ NUEVO: apuRefCode (para no perder descomposición al renumerar code)
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

  if(!Array.isArray(budget.items)) budget.items = [];
  budget.items.push(it);

  proj.updatedAt = nowISO();
  db.projects[idx] = normalizeProject(proj);
  saveStore(db);
  return it;
}

function updateItem(projectId, itemId, patch){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return null;

  const proj = db.projects[pidx];
  const budget = getEditableActiveBudget(proj);

  const iidx = (budget.items||[]).findIndex(i=>i.id===itemId);
  if(iidx===-1) return null;

  const cur = budget.items[iidx];
  const next = { ...cur, ...patch };

  // ✅ preservar referencia APU cuando el usuario renumera "code"
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

  budget.items[iidx] = next;
  proj.updatedAt = nowISO();
  db.projects[pidx] = normalizeProject(proj);

  saveStore(db);
  return next;
}

function deleteItem(projectId, itemId){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return false;

  const proj = db.projects[pidx];
  const budget = getEditableActiveBudget(proj);

  budget.items = (budget.items||[]).filter(i=>i.id!==itemId);
  proj.updatedAt = nowISO();
  db.projects[pidx] = normalizeProject(proj);

  saveStore(db);
  return true;
}

// ✅ actualizar PU de todos los ítems por código dentro del presupuesto activo
// ✅ compara contra (apuRefCode || code), para que el override aplique aunque renumeres code.
function updateItemsPUByCode(projectId, code, newPU){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return 0;

  const proj = db.projects[pidx];
  const budget = getEditableActiveBudget(proj);

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
    proj.updatedAt = nowISO();
    db.projects[pidx] = normalizeProject(proj);
    saveStore(db);
  }
  return count;
}

/* =========================
   Override APU por proyecto/presupuesto activo
   ========================= */
function getApuOverride(projectId, code){
  const p = getProjectById(projectId);
  if(!p) return null;
  const c = String(code||"").trim();
  const active = getActiveBudget(p);
  return (active.apuOverrides && active.apuOverrides[c]) ? active.apuOverrides[c] : null;
}

function setApuOverride(projectId, code, lines){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return null;

  const proj = db.projects[pidx];
  const budget = getEditableActiveBudget(proj);

  const c = String(code||"").trim();
  if(!budget.apuOverrides) budget.apuOverrides = {};
  budget.apuOverrides[c] = {
    code: c,
    updatedAt: nowISO(),
    lines: Array.isArray(lines) ? lines : []
  };

  proj.updatedAt = nowISO();
  db.projects[pidx] = normalizeProject(proj);
  saveStore(db);
  return budget.apuOverrides[c];
}

function clearApuOverride(projectId, code){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return false;

  const proj = db.projects[pidx];
  const budget = getEditableActiveBudget(proj);

  const c = String(code||"").trim();
  if(budget.apuOverrides && budget.apuOverrides[c]){
    delete budget.apuOverrides[c];
    proj.updatedAt = nowISO();
    db.projects[pidx] = normalizeProject(proj);
    saveStore(db);
    return true;
  }
  return false;
}

/* =========================
   ✅ NUEVO: Override SUBPRODUCTO por proyecto/presupuesto activo
   ========================= */
function getSubApuOverride(projectId, code){
  const p = getProjectById(projectId);
  if(!p) return null;
  const c = String(code||"").trim();
  const active = getActiveBudget(p);
  return (active.subApuOverrides && active.subApuOverrides[c]) ? active.subApuOverrides[c] : null;
}

function setSubApuOverride(projectId, code, lines){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return null;

  const proj = db.projects[pidx];
  const budget = getEditableActiveBudget(proj);

  const c = String(code||"").trim();
  if(!budget.subApuOverrides) budget.subApuOverrides = {};

  budget.subApuOverrides[c] = {
    code: c,
    updatedAt: nowISO(),
    lines: Array.isArray(lines) ? lines : []
  };

  proj.updatedAt = nowISO();
  db.projects[pidx] = normalizeProject(proj);
  saveStore(db);
  return budget.subApuOverrides[c];
}

function clearSubApuOverride(projectId, code){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return false;

  const proj = db.projects[pidx];
  const budget = getEditableActiveBudget(proj);

  const c = String(code||"").trim();
  if(budget.subApuOverrides && budget.subApuOverrides[c]){
    delete budget.subApuOverrides[c];
    proj.updatedAt = nowISO();
    db.projects[pidx] = normalizeProject(proj);
    saveStore(db);
    return true;
  }
  return false;
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

    // ✅ institucional + logo
    logoDataUrl: payload.logoDataUrl || "",
    instPais: payload.instPais || "",
    instDepto: payload.instDepto || "",
    instMunicipio: payload.instMunicipio || "",
    instEntidad: payload.instEntidad || "",
    instProyectoLabel: payload.instProyectoLabel || "",
    instFechaElab: payload.instFechaElab || "",

    // ✅ chapters del proyecto
    chapters: Array.isArray(payload.chapters) ? payload.chapters : [],

    // ✅ conservar activeBudget si viniera
    activeBudget: normalizeBudgetMode(payload.activeBudget)
  });

  const baseItems = Array.isArray(payload?.budgetBase?.items) ? payload.budgetBase.items : (Array.isArray(payload.items) ? payload.items : []);
  const officialItems = Array.isArray(payload?.budgetOfficial?.items) ? payload.budgetOfficial.items : [];

  const mappedBaseItems = baseItems.map(it => ({
    id: uid("it"),
    chapterCode: safeStr(it.chapterCode || ""),
    chapterName: safeStr(it.chapterName || ""),
    apuRefCode: normalizeApuRefCode(it.apuRefCode) || safeStr(it.code || ""),
    code: it.code || "",
    desc: it.desc || "",
    unit: it.unit || "",
    pu: Number(it.pu||0),
    qty: Number(it.qty||0)
  }));

  const mappedOfficialItems = officialItems.map(it => ({
    id: uid("it"),
    chapterCode: safeStr(it.chapterCode || ""),
    chapterName: safeStr(it.chapterName || ""),
    apuRefCode: normalizeApuRefCode(it.apuRefCode) || safeStr(it.code || ""),
    code: it.code || "",
    desc: it.desc || "",
    unit: it.unit || "",
    pu: Number(it.pu||0),
    qty: Number(it.qty||0)
  }));

  replaceBudget(base.id, BUDGET_BASE, {
    items: mappedBaseItems,
    apuOverrides: deepClone(payload?.budgetBase?.apuOverrides || payload.apuOverrides || {}),
    subApuOverrides: deepClone(payload?.budgetBase?.subApuOverrides || payload.subApuOverrides || {}),
    adminPct: Number(payload?.budgetBase?.adminPct ?? payload.adminPct ?? 18),
    imprevPct: Number(payload?.budgetBase?.imprevPct ?? payload.imprevPct ?? 2),
    utilPct: Number(payload?.budgetBase?.utilPct ?? payload.utilPct ?? 5),
    ivaUtilPct: Number(payload?.budgetBase?.ivaUtilPct ?? payload.ivaUtilPct ?? 19),
    aiuPct: Number(payload?.budgetBase?.aiuPct ?? payload.aiuPct ?? 25),
    ivaPct: Number(payload?.budgetBase?.ivaPct ?? payload.ivaPct ?? 19),
    ivaBase: payload?.budgetBase?.ivaBase || payload.ivaBase || "sobre_directo_aiu",
    indirectMode: payload?.budgetBase?.indirectMode || payload.indirectMode || "",
    indirectTable: deepClone(payload?.budgetBase?.indirectTable || payload.indirectTable || [])
  });

  replaceBudget(base.id, BUDGET_OFFICIAL, {
    items: mappedOfficialItems,
    apuOverrides: deepClone(payload?.budgetOfficial?.apuOverrides || {}),
    subApuOverrides: deepClone(payload?.budgetOfficial?.subApuOverrides || {}),
    adminPct: Number(payload?.budgetOfficial?.adminPct ?? 18),
    imprevPct: Number(payload?.budgetOfficial?.imprevPct ?? 2),
    utilPct: Number(payload?.budgetOfficial?.utilPct ?? 5),
    ivaUtilPct: Number(payload?.budgetOfficial?.ivaUtilPct ?? 19),
    aiuPct: Number(payload?.budgetOfficial?.aiuPct ?? 25),
    ivaPct: Number(payload?.budgetOfficial?.ivaPct ?? 19),
    ivaBase: payload?.budgetOfficial?.ivaBase || "sobre_directo_aiu",
    indirectMode: payload?.budgetOfficial?.indirectMode || "",
    indirectTable: deepClone(payload?.budgetOfficial?.indirectTable || [])
  });

  setActiveBudget(base.id, normalizeBudgetMode(payload.activeBudget || BUDGET_BASE));
  return getProjectById(base.id);
}

try{
  requestPersistentStorage();
}catch(_){}

window.StorageAPI = {
  loadStore, saveStore,
  exportBackup, importBackupFromFile, resetAll,

  getElaborador, setElaborador, clearFirma,

  listCustomInsumos, addCustomInsumo,
  getCustomAPU, upsertCustomAPU, listCustomAPUs,

  createProject, updateProject, listProjects, getProjectById, deleteProject,

  // ✅ Presupuestos duales
  getActiveBudget,
  getProjectBudget,
  getProjectActiveBudgetMode,
  setActiveBudget,
  cloneBaseToOfficial,
  replaceBudget,

  // ✅ Chapters
  listProjectChapters, upsertProjectChapter, deleteProjectChapter,

  addItem, updateItem, deleteItem,
  updateItemsPUByCode,

  getApuOverride, setApuOverride, clearApuOverride,

  // ✅ NUEVO: Subproductos por proyecto/presupuesto activo
  getSubApuOverride, setSubApuOverride, clearSubApuOverride,

  importProjectAsNew
};