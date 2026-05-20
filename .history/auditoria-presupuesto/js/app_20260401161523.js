function page(){
  const p = location.pathname.split("/").pop().toLowerCase();
  return p || "index.html";
}

/* ==========================================
   ✅ iOS/PWA: storage persistente + diagnóstico
   ========================================== */
let __storageWarned = false;
let __persistTried = false;

function isIOS(){
  const ua = navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

// Navegadores embebidos típicos (WhatsApp/IG/FB) => suelen usar storage “volátil”
function isInAppBrowser(){
  const ua = (navigator.userAgent || "").toLowerCase();
  return (
    ua.includes("fbav") ||
    ua.includes("fban") ||
    ua.includes("instagram") ||
    ua.includes("wv") ||
    ua.includes("line/") ||
    ua.includes("micromessenger") ||
    ua.includes("snapchat") ||
    ua.includes("telegram") ||
    ua.includes("whatsapp")
  );
}

function localStorageWritable(){
  try{
    const k = "__ppro_ls_test__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  }catch(_){
    return false;
  }
}

async function requestPersistentStorage(){
  if(__persistTried) return;
  __persistTried = true;

  const lsOK = localStorageWritable();
  if(!lsOK && !__storageWarned){
    __storageWarned = true;

    const hint =
      (isIOS() ? "En iPhone esto suele pasar en Modo Privado o dentro de WhatsApp/Instagram.\n\n" : "") +
      "Solución:\n" +
      "1) Abre el link en Safari (no dentro de otra app).\n" +
      "2) Desactiva Modo Privado.\n" +
      "3) (Recomendado) Compartir → Añadir a pantalla de inicio.\n";

    alert("⚠️ Tu navegador está bloqueando el almacenamiento (LocalStorage).\n\nNo se podrán guardar proyectos ni la Base APU.\n\n" + hint);
    return;
  }

  try{
    if(navigator.storage && typeof navigator.storage.persisted === "function" && typeof navigator.storage.persist === "function"){
      const already = await navigator.storage.persisted();
      if(!already){
        const granted = await navigator.storage.persist();
        console.log("[PWA] persist granted:", granted);
      }else{
        console.log("[PWA] storage already persisted");
      }
    }
  }catch(err){
    console.log("[PWA] persist error:", err);
  }

  if(isIOS() && isInAppBrowser() && !__storageWarned){
    __storageWarned = true;
    alert(
      "ℹ️ Estás usando un navegador embebido (dentro de otra app).\n\n" +
      "En iPhone esto puede NO guardar datos o borrarlos.\n\n" +
      "Abre el link en Safari y (recomendado) agrégalo a Pantalla de inicio."
    );
  }
}

function initPWA(){
  requestPersistentStorage().catch(()=>{});

  const once = ()=>{
    requestPersistentStorage().catch(()=>{});
    window.removeEventListener("click", once, true);
    window.removeEventListener("touchstart", once, true);
    window.removeEventListener("keydown", once, true);
  };
  window.addEventListener("click", once, true);
  window.addEventListener("touchstart", once, true);
  window.addEventListener("keydown", once, true);

  if(!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("pwa/sw.js").catch((e)=>{
      console.log("[PWA] SW register failed:", e);
    });
  });
}

function bindTabsIfPresent(){
  const tabs = Array.from(document.querySelectorAll("[data-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));
  if(!tabs.length || !panels.length) return;

  function activate(key){
    tabs.forEach(t => t.classList.toggle("active", t.getAttribute("data-tab")===key));
    panels.forEach(p => p.style.display = (p.getAttribute("data-panel")===key) ? "" : "none");
  }

  tabs.forEach(t => t.addEventListener("click", (e)=>{
    e.preventDefault();
    activate(t.getAttribute("data-tab"));
  }));

  const tab = UI.getParam("tab");
  activate(tab || tabs[0].getAttribute("data-tab"));
}

/* ========= helpers base64 docs ========= */
function blobToDataUrl(blob){
  return new Promise((res, rej)=>{
    const fr = new FileReader();
    fr.onload = ()=>res(String(fr.result||""));
    fr.onerror = ()=>rej(fr.error || new Error("No se pudo leer archivo"));
    fr.readAsDataURL(blob);
  });
}
async function dataUrlToBlob(dataUrl){
  const r = await fetch(dataUrl);
  return await r.blob();
}

/* ========= helpers logo/image ========= */
async function fileToDataUrl(file){
  if(!file) return "";
  const MAX_IMG = 4 * 1024 * 1024; // 4MB
  if((file.size||0) > MAX_IMG) throw new Error("Imagen demasiado grande. Máx 4MB.");
  return await blobToDataUrl(file);
}

/* ========= helper excel ========= */
function sanitizeFileName(name){
  return String(name||"archivo")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "archivo";
}

/* ==========================================
   ✅ Helpers: % y totales (compat AIU -> A/I/U)
   ========================================== */
function pct(project, key, legacyKey){
  const v = project?.[key];
  if(Number.isFinite(Number(v))) return Number(v);
  const lv = legacyKey ? project?.[legacyKey] : undefined;
  if(Number.isFinite(Number(lv))) return Number(lv);
  return 0;
}

/*
  ✅ FIX del bug:
  - En tu Calc.calcTotals nuevo, es común que el IVA venga como { iva: ... } (no ivaUtil)
  - La app mostraba 0 en “IVA sobre Utilidad” porque buscaba t.ivaUtil
  - Aquí mapeamos automáticamente iva -> ivaUtil si falta ivaUtil.
*/
function totalsCompat(project){
  const t = (window.Calc && typeof Calc.calcTotals === "function") ? (Calc.calcTotals(project) || {}) : {};
  const directo = Number(t.directo||0);

  if(("admin" in t) || ("imprev" in t) || ("util" in t) || ("ivaUtil" in t) || ("subtotal" in t) || ("iva" in t)){
    const admin = Number(t.admin||0);
    const imprev = Number(t.imprev||0);
    const util = Number(t.util||0);

    const subtotal =
      Number.isFinite(Number(t.subtotal))
        ? Number(t.subtotal||0)
        : (directo + admin + imprev + util);

    const ivaUtil =
      ("ivaUtil" in t)
        ? Number(t.ivaUtil||0)
        : (("iva" in t) ? Number(t.iva||0) : 0);

    const total =
      Number.isFinite(Number(t.total))
        ? Number(t.total||0)
        : (subtotal + ivaUtil);

    return { directo, admin, imprev, util, subtotal, ivaUtil, total };
  }

  const aiu = Number(t.aiu||0);
  const iva = Number(t.iva||0);
  const total = Number(t.total|| (directo + aiu + iva));
  return {
    directo,
    admin: aiu,
    imprev: 0,
    util: 0,
    subtotal: directo + aiu,
    ivaUtil: iva,
    total
  };
}

/* ==========================================
   ✅ NUEVO: Capítulos manuales por proyecto
   - Se guardan en project.chapters = [{id, chapterCode, chapterName}]
   - Para dropdowns, se mezcla con capítulos inferidos por ítems
   ========================================== */
function ensureProjectChapters(project){
  const p = project || {};
  if(!Array.isArray(p.chapters)) p.chapters = [];
  // normalizar
  p.chapters = p.chapters
    .map(c=>({
      id: String(c?.id || ""),
      chapterCode: String(c?.chapterCode || "").trim(),
      chapterName: String(c?.chapterName || "").trim()
    }))
    .filter(c=>c.chapterCode);
  return p.chapters;
}

function getInferredChaptersFromItems(project){
  // usa Calc.groupByChapters para respetar chapterName existente
  try{
    const { groups } = Calc.groupByChapters(project);
    return (groups||[])
      .map(g=>({
        chapterCode: String(g.chapterCode||"").trim(),
        chapterName: String(g.chapterName||"").trim()
      }))
      .filter(x=>x.chapterCode);
  }catch(_){
    // fallback simple
    const map = new Map();
    for(const it of (project?.items||[])){
      const code = String(it.chapterCode || "").trim();
      if(!code) continue;
      if(!map.has(code)){
        map.set(code, { chapterCode: code, chapterName: String(it.chapterName||"").trim() });
      }
    }
    return Array.from(map.values());
  }
}

function getAllChaptersForProject(project){
  const manual = ensureProjectChapters(project).map(c=>({
    chapterCode: c.chapterCode,
    chapterName: c.chapterName
  }));

  const inferred = getInferredChaptersFromItems(project);

  // merge por chapterCode (manual tiene prioridad en nombre)
  const map = new Map();
  for(const x of inferred){
    map.set(String(x.chapterCode), { chapterCode: String(x.chapterCode), chapterName: String(x.chapterName||"") });
  }
  for(const x of manual){
    map.set(String(x.chapterCode), { chapterCode: String(x.chapterCode), chapterName: String(x.chapterName||"") });
  }

  const arr = Array.from(map.values());
  arr.sort((a,b)=>{
    const na = Number(a.chapterCode), nb = Number(b.chapterCode);
    if(Number.isFinite(na) && Number.isFinite(nb)) return na-nb;
    return String(a.chapterCode).localeCompare(String(b.chapterCode));
  });
  return arr;
}

function lookupChapterName(project, chapterCode){
  const code = String(chapterCode||"").trim();
  if(!code) return "";
  const all = getAllChaptersForProject(project);
  const found = all.find(x=>String(x.chapterCode)===code);
  return found ? String(found.chapterName||"") : "";
}

function makeId(prefix="id"){
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}


function deepCloneBudgetRuntime(v){
  try{ return JSON.parse(JSON.stringify(v)); }catch(_){ return v; }
}

function normalizeBudgetModeRuntime(v){
  return String(v || "").trim().toLowerCase() === "official" ? "official"
    : String(v || "").trim().toLowerCase() === "oficial" ? "official"
    : "base";
}

function storageBudgetKey(mode){
  return normalizeBudgetModeRuntime(mode) === "official" ? "oficial" : "base";
}

function makeBudgetBranchFromProjectView(project){
  const p = project || {};
  return {
    items: Array.isArray(p.items) ? deepCloneBudgetRuntime(p.items) : [],
    chapters: Array.isArray(p.chapters) ? deepCloneBudgetRuntime(p.chapters) : [],
    apuOverrides: (p.apuOverrides && typeof p.apuOverrides === "object" && !Array.isArray(p.apuOverrides)) ? deepCloneBudgetRuntime(p.apuOverrides) : {},
    subApuOverrides: (p.subApuOverrides && typeof p.subApuOverrides === "object" && !Array.isArray(p.subApuOverrides)) ? deepCloneBudgetRuntime(p.subApuOverrides) : {},
    indirectMode: String(p.indirectMode || "manual"),
    indirectTable: Array.isArray(p.indirectTable) ? deepCloneBudgetRuntime(p.indirectTable) : [],
    adminPct: Number(p.adminPct ?? 18),
    imprevPct: Number(p.imprevPct ?? 2),
    utilPct: Number(p.utilPct ?? 5),
    ivaUtilPct: Number(p.ivaUtilPct ?? 19),
    aiuPct: Number(p.aiuPct ?? ((Number(p.adminPct||0) + Number(p.imprevPct||0) + Number(p.utilPct||0)) || 25)),
    ivaPct: Number(p.ivaPct ?? p.ivaUtilPct ?? 19),
    ivaBase: String(p.ivaBase || "sobre_directo_aiu")
  };
}

function ensureProjectBudgetsRuntime(project){
  const p = project || {};
  if(!p.budgets || typeof p.budgets !== "object" || Array.isArray(p.budgets)){
    p.budgets = {};
  }
  if(!p.budgets.base || typeof p.budgets.base !== "object" || Array.isArray(p.budgets.base)){
    p.budgets.base = makeBudgetBranchFromProjectView(p);
  }
  if(p.budgets.oficial != null && (typeof p.budgets.oficial !== "object" || Array.isArray(p.budgets.oficial))){
    p.budgets.oficial = null;
  }
  if(!p.activeBudget) p.activeBudget = "base";
  p.activeBudget = storageBudgetKey(p.activeBudget);
  return p;
}

function getProjectBudgetRuntime(project, mode){
  if(!project) return null;
  ensureProjectBudgetsRuntime(project);
  const key = storageBudgetKey(mode);
  const buds = project.budgets || {};
  return key === "oficial" ? (buds.oficial || null) : (buds.base || null);
}

function getProjectActiveBudgetModeRuntime(projectOrId){
  const project = typeof projectOrId === "string"
    ? (window.StorageAPI?.getProjectById ? StorageAPI.getProjectById(projectOrId) : null)
    : projectOrId;
  return normalizeBudgetModeRuntime(project?.activeBudget || "base");
}

function buildProjectPatchFromBudgetState(project, mode, budgetState){
  const current = deepCloneBudgetRuntime(project || {});
  ensureProjectBudgetsRuntime(current);

  const key = storageBudgetKey(mode);
  const nextBudgets = deepCloneBudgetRuntime(current.budgets || {});
  nextBudgets[key] = deepCloneBudgetRuntime(budgetState || makeBudgetBranchFromProjectView(current));

  const active = nextBudgets[key] || makeBudgetBranchFromProjectView(current);

  return {
    budgets: nextBudgets,
    activeBudget: key,
    items: Array.isArray(active.items) ? deepCloneBudgetRuntime(active.items) : [],
    chapters: Array.isArray(active.chapters) ? deepCloneBudgetRuntime(active.chapters) : [],
    apuOverrides: (active.apuOverrides && typeof active.apuOverrides === "object" && !Array.isArray(active.apuOverrides)) ? deepCloneBudgetRuntime(active.apuOverrides) : {},
    subApuOverrides: (active.subApuOverrides && typeof active.subApuOverrides === "object" && !Array.isArray(active.subApuOverrides)) ? deepCloneBudgetRuntime(active.subApuOverrides) : {},
    indirectMode: String(active.indirectMode || "manual"),
    indirectTable: Array.isArray(active.indirectTable) ? deepCloneBudgetRuntime(active.indirectTable) : [],
    adminPct: Number(active.adminPct ?? 18),
    imprevPct: Number(active.imprevPct ?? 2),
    utilPct: Number(active.utilPct ?? 5),
    ivaUtilPct: Number(active.ivaUtilPct ?? 19),
    aiuPct: Number(active.aiuPct ?? ((Number(active.adminPct||0)+Number(active.imprevPct||0)+Number(active.utilPct||0)) || 25)),
    ivaPct: Number(active.ivaPct ?? active.ivaUtilPct ?? 19),
    ivaBase: String(active.ivaBase || "sobre_directo_aiu")
  };
}

function syncCurrentRootIntoActiveBudget(projectId){
  if(!(window.StorageAPI && typeof StorageAPI.getProjectById === "function" && typeof StorageAPI.updateProject === "function")) return null;
  const current = StorageAPI.getProjectById(projectId);
  if(!current) return null;
  ensureProjectBudgetsRuntime(current);
  const mode = current.activeBudget || "base";
  const snapshot = makeBudgetBranchFromProjectView(current);
  const patch = buildProjectPatchFromBudgetState(current, mode, snapshot);
  return StorageAPI.updateProject(projectId, patch);
}

function setProjectActiveBudgetRuntime(projectId, mode){
  if(!(window.StorageAPI && typeof StorageAPI.getProjectById === "function" && typeof StorageAPI.updateProject === "function")) return null;
  const current = StorageAPI.getProjectById(projectId);
  if(!current) return null;
  ensureProjectBudgetsRuntime(current);

  const currentKey = current.activeBudget || "base";
  const nextBudgets = deepCloneBudgetRuntime(current.budgets || {});
  nextBudgets[currentKey] = makeBudgetBranchFromProjectView(current);

  const targetKey = storageBudgetKey(mode);
  const targetBudget = targetKey === "oficial" ? nextBudgets.oficial : nextBudgets.base;
  if(!targetBudget) return null;

  const patch = buildProjectPatchFromBudgetState({ ...current, budgets: nextBudgets }, targetKey, targetBudget);
  return StorageAPI.updateProject(projectId, patch);
}

function cloneBaseToOfficialRuntime(projectId){
  if(!(window.StorageAPI && typeof StorageAPI.getProjectById === "function" && typeof StorageAPI.updateProject === "function")) return null;
  const current = StorageAPI.getProjectById(projectId);
  if(!current) return null;
  ensureProjectBudgetsRuntime(current);

  const nextBudgets = deepCloneBudgetRuntime(current.budgets || {});
  nextBudgets[current.activeBudget || "base"] = makeBudgetBranchFromProjectView(current);

  const baseBudget = nextBudgets.base || makeBudgetBranchFromProjectView(current);
  nextBudgets.oficial = deepCloneBudgetRuntime(baseBudget);

  const patch = buildProjectPatchFromBudgetState({ ...current, budgets: nextBudgets }, "oficial", nextBudgets.oficial);
  return StorageAPI.updateProject(projectId, patch);
}

function installBudgetRuntimeFallbacks(){
  if(!window.StorageAPI || window.__budgetRuntimeFallbacksInstalled) return;
  window.__budgetRuntimeFallbacksInstalled = true;

  const originalUpdate = StorageAPI.updateProject?.bind(StorageAPI);
  const original = {
    addItem: StorageAPI.addItem?.bind(StorageAPI),
    updateItem: StorageAPI.updateItem?.bind(StorageAPI),
    deleteItem: StorageAPI.deleteItem?.bind(StorageAPI),
    setApuOverride: StorageAPI.setApuOverride?.bind(StorageAPI),
    clearApuOverride: StorageAPI.clearApuOverride?.bind(StorageAPI),
    updateItemsPUByCode: StorageAPI.updateItemsPUByCode?.bind(StorageAPI),
    updateItemsPUByApuRefCode: StorageAPI.updateItemsPUByApuRefCode?.bind(StorageAPI),
    upsertProjectChapter: StorageAPI.upsertProjectChapter?.bind(StorageAPI),
    deleteProjectChapter: StorageAPI.deleteProjectChapter?.bind(StorageAPI)
  };

  let syncing = false;
  function syncAfter(projectId){
    if(syncing || !projectId || !originalUpdate) return;
    syncing = true;
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      ensureProjectBudgetsRuntime(fresh);
      const patch = buildProjectPatchFromBudgetState(fresh, fresh.activeBudget || "base", makeBudgetBranchFromProjectView(fresh));
      originalUpdate(projectId, patch);
    }finally{
      syncing = false;
    }
  }

  if(originalUpdate){
    StorageAPI.updateProject = function(projectId, patch){
      const res = originalUpdate(projectId, patch);
      if(!syncing) syncAfter(projectId);
      return StorageAPI.getProjectById(projectId) || res;
    };
  }

  ["addItem","updateItem","deleteItem","setApuOverride","clearApuOverride","upsertProjectChapter","deleteProjectChapter","updateItemsPUByCode","updateItemsPUByApuRefCode"].forEach(name=>{
    if(!original[name]) return;
    StorageAPI[name] = function(projectId, ...args){
      const res = original[name](projectId, ...args);
      syncAfter(projectId);
      return res;
    };
  });

  if(typeof StorageAPI.getProjectActiveBudgetMode !== "function"){
    StorageAPI.getProjectActiveBudgetMode = getProjectActiveBudgetModeRuntime;
  }
  if(typeof StorageAPI.getProjectBudget !== "function"){
    StorageAPI.getProjectBudget = function(projectId, mode){
      const project = StorageAPI.getProjectById(projectId);
      if(!project) return null;
      const b = getProjectBudgetRuntime(project, mode);
      return b ? deepCloneBudgetRuntime(b) : null;
    };
  }
  if(typeof StorageAPI.setActiveBudget !== "function"){
    StorageAPI.setActiveBudget = setProjectActiveBudgetRuntime;
  }
  if(typeof StorageAPI.cloneBaseToOfficial !== "function"){
    StorageAPI.cloneBaseToOfficial = cloneBaseToOfficialRuntime;
  }
}

function getBudgetModeLabel(mode){
  return normalizeBudgetModeRuntime(mode) === "official" ? "OFICIAL" : "BASE";
}

function getBudgetModeBadge(mode){
  return normalizeBudgetModeRuntime(mode) === "official"
    ? UI.chip("PRESUPUESTO OFICIAL", "ok")
    : UI.chip("PRESUPUESTO BASE", "ok");
}

function getBudgetModeInfo(project){
  const activeMode = (window.StorageAPI && typeof StorageAPI.getProjectActiveBudgetMode === "function")
    ? StorageAPI.getProjectActiveBudgetMode(project?.id)
    : String(project?.activeBudget || "base").toLowerCase();
  return {
    mode: normalizeBudgetModeRuntime(activeMode),
    label: getBudgetModeLabel(activeMode)
  };
}

function getProjectViewForBudget(project, mode){
  if(!project) return null;
  const clone = JSON.parse(JSON.stringify(project));
  const targetMode = normalizeBudgetModeRuntime(mode);
  const budget =
    (window.StorageAPI && typeof StorageAPI.getProjectBudget === "function")
      ? StorageAPI.getProjectBudget(project.id, targetMode)
      : getProjectBudgetRuntime(clone, targetMode);

  const b = budget || {};
  clone.activeBudget = targetMode;
  clone.items = Array.isArray(b.items) ? b.items : [];
  clone.apuOverrides = (b.apuOverrides && typeof b.apuOverrides === "object") ? b.apuOverrides : {};
  clone.subApuOverrides = (b.subApuOverrides && typeof b.subApuOverrides === "object") ? b.subApuOverrides : {};
  clone.adminPct = Number(b.adminPct ?? clone.adminPct ?? 0);
  clone.imprevPct = Number(b.imprevPct ?? clone.imprevPct ?? 0);
  clone.utilPct = Number(b.utilPct ?? clone.utilPct ?? 0);
  clone.ivaUtilPct = Number(b.ivaUtilPct ?? clone.ivaUtilPct ?? 0);
  clone.aiuPct = Number(b.aiuPct ?? clone.aiuPct ?? 0);
  clone.ivaPct = Number(b.ivaPct ?? clone.ivaPct ?? 0);
  clone.ivaBase = String(b.ivaBase || clone.ivaBase || "sobre_directo_aiu");
  clone.indirectMode = String(b.indirectMode || clone.indirectMode || "manual");
  clone.indirectTable = Array.isArray(b.indirectTable) ? b.indirectTable : [];
  return clone;
}

function getBudgetComparison(project){
  const baseView = getProjectViewForBudget(project, "base");
  const officialView = getProjectViewForBudget(project, "official");
  const tBase = baseView ? totalsCompat(baseView) : { total:0, subtotal:0, directo:0 };
  const tOfficial = officialView ? totalsCompat(officialView) : { total:0, subtotal:0, directo:0 };
  const diff = Number(tOfficial.total||0) - Number(tBase.total||0);
  const diffPct = Number(tBase.total||0) > 0 ? (diff / Number(tBase.total||0)) * 100 : 0;
  const officialItems = Array.isArray(officialView?.items) ? officialView.items.length : 0;
  return { baseView, officialView, tBase, tOfficial, diff, diffPct, officialItems };
}

function projectHasOfficialBudget(project){
  const cmp = getBudgetComparison(project);
  return cmp.officialItems > 0;
}

function getBudgetIndirectMethodAudit(project){
  const cmp = getBudgetComparison(project);

  const baseModeRaw = String(cmp.baseView?.indirectMode || "manual").trim().toLowerCase() === "table" ? "table" : "manual";
  const officialModeRaw = String(cmp.officialView?.indirectMode || "manual").trim().toLowerCase() === "table" ? "table" : "manual";

  const baseModeLabel = baseModeRaw === "table" ? "TABLA" : "MANUAL";
  const officialModeLabel = officialModeRaw === "table" ? "TABLA" : "MANUAL";
  const sameMethod = baseModeRaw === officialModeRaw;

  return {
    baseModeRaw,
    officialModeRaw,
    baseModeLabel,
    officialModeLabel,
    sameMethod,
    warningText: sameMethod
      ? "Ambos presupuestos usan el mismo criterio de cálculo de indirectos."
      : `Criterio distinto de cálculo de indirectos: Base = ${baseModeLabel}, Oficial = ${officialModeLabel}.`
  };
}

function ensureBudgetToolbarMount(){
  let host = UI.qs("#budgetToolbar");
  if(host) return host;

  const anchor =
    UI.qs("#projSub")?.parentElement ||
    UI.qs("#projTitle")?.parentElement ||
    UI.qs("main .container") ||
    document.body;

  if(!anchor) return null;

  host = document.createElement("div");
  host.id = "budgetToolbar";
  host.className = "card";
  host.style.margin = "12px 0";
  host.style.padding = "14px";

  if(anchor === document.body){
    document.body.insertBefore(host, document.body.firstChild);
  }else{
    anchor.insertAdjacentElement("afterend", host);
  }
  return host;
}

function renderBudgetToolbar(project){
  const host = ensureBudgetToolbarMount();
  if(!host || !project) return;

  const info = getBudgetModeInfo(project);
  const cmp = getBudgetComparison(project);
  const currency = project.currency || "COP";
  const hasOfficial = projectHasOfficialBudget(project);

  host.innerHTML = `
    <div class="cardhead">
      <h2>Doble presupuesto</h2>
      <p class="muted small">Proyecto único con dos capas presupuestales: Base y Oficial.</p>
    </div>

    <div class="row" style="gap:8px; flex-wrap:wrap; margin-bottom:10px">
      ${getBudgetModeBadge(info.mode)}
      ${hasOfficial ? UI.chip(`Δ ${UI.fmtMoney(cmp.diff||0, currency)}`) : UI.chip("Oficial no creado")}
      ${hasOfficial ? UI.chip(`${Number(cmp.diffPct||0).toFixed(2)}%`) : ""}
    </div>

    <div class="grid two" style="gap:12px">
      <div class="card item">
        <div class="name">Presupuesto Base</div>
        <div class="muted small">
          Ítems: ${UI.esc(String(cmp.baseView?.items?.length || 0))}<br>
          Total: <b>${UI.fmtMoney(cmp.tBase.total||0, currency)}</b>
        </div>
      </div>
      <div class="card item">
        <div class="name">Presupuesto Oficial</div>
        <div class="muted small">
          Ítems: ${UI.esc(String(cmp.officialView?.items?.length || 0))}<br>
          Total: <b>${UI.fmtMoney(cmp.tOfficial.total||0, currency)}</b>
        </div>
      </div>
    </div>

    <div class="row" style="gap:8px; flex-wrap:wrap; margin-top:12px">
      <button type="button" class="btn ${info.mode === "base" ? "primary" : ""}" data-budget-switch="base">Trabajar Presupuesto Base</button>
      <button type="button" class="btn ${info.mode === "official" ? "primary" : ""}" data-budget-switch="official">Trabajar Presupuesto Oficial</button>
      <button type="button" class="btn" data-budget-clone>${hasOfficial ? "Reclonar Base → Oficial" : "Generar Presupuesto Oficial desde Base"}</button>
      <button type="button" class="btn" data-budget-audit-pdf>PDF de auditoría</button>
    </div>

    <div class="muted small" style="margin-top:8px">
      Presupuesto activo: <b>${UI.esc(info.label)}</b>
    </div>
  `;

  host.querySelectorAll("[data-budget-switch]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const mode = btn.getAttribute("data-budget-switch") || "base";
      if(window.StorageAPI && typeof StorageAPI.setActiveBudget === "function"){
        StorageAPI.setActiveBudget(project.id, mode);
      }
      refreshProjectBudgetAwareUI(project.id);
    });
  });

  host.querySelector("[data-budget-clone]")?.addEventListener("click", ()=>{
    if(!(window.StorageAPI && typeof StorageAPI.cloneBaseToOfficial === "function")){
      alert("La función de clonado Base → Oficial no está disponible en storage.js.");
      return;
    }

    const msg = hasOfficial
      ? "Ya existe un Presupuesto Oficial.\n\nSi continúas, se reemplazará completamente por una nueva clonación del Presupuesto Base.\n\n¿Deseas continuar?"
      : "Se generará el Presupuesto Oficial clonando exactamente el Presupuesto Base.\n\n¿Deseas continuar?";
    if(!confirm(msg)) return;

    StorageAPI.cloneBaseToOfficial(project.id);
    alert("Presupuesto Oficial generado correctamente a partir del Presupuesto Base.");
    refreshProjectBudgetAwareUI(project.id);
  });

  host.querySelector("[data-budget-audit-pdf]")?.addEventListener("click", ()=>{
    const fresh = StorageAPI.getProjectById(project.id);
    if(!fresh) return;
    exportAuditPdf(fresh);
  });
}

function refreshProjectBudgetAwareUI(projectId){
  const fresh = StorageAPI.getProjectById(projectId);
  if(!fresh) return;

  ensureProjectChapters(fresh);
  renderBudgetToolbar(fresh);
  renderProjectDetail(fresh);
  renderProjectChaptersUI(fresh);
  renderChaptersTable(fresh);
  renderItemsTable(fresh);
  renderResumenItems(fresh);
  refreshAddApuModalChapterOptions(fresh);
  renderIndirectRows(projectId);
  renderDocs(projectId).catch(()=>{});
}


function ensureBudgetComparisonMount(){
  let host = UI.qs("#budgetComparisonMount");
  if(host) return host;

  const ajustesPanel = document.querySelector('[data-panel="ajustes"]');
  if(!ajustesPanel) return null;

  const ajustesCard = ajustesPanel.querySelector(".card");
  if(!ajustesCard) return null;

  host = document.createElement("section");
  host.id = "budgetComparisonMount";
  host.className = "card";
  host.style.marginTop = "14px";
  host.innerHTML = `
    <div class="cardhead">
      <h2>Comparación Presupuesto Base vs Oficial</h2>
      <p class="muted small">Resumen comparativo entre ambos presupuestos del mismo proyecto. Esta sección se muestra dentro de Ajustes.</p>
    </div>
    <div id="budgetComparisonBody"></div>
    <div id="budgetComparisonIndirects" style="margin-top:14px"></div>
    <div id="budgetComparisonChapters" style="margin-top:14px"></div>
    <div id="budgetComparisonItems" style="margin-top:14px"></div>
  `;
  ajustesCard.insertAdjacentElement("afterend", host);
  return host;
}

function renderBudgetComparisonCard(project){
  const host = ensureBudgetComparisonMount();
  if(!host) return;

  const body = UI.qs("#budgetComparisonBody");
  if(!body) return;

  const hasOfficial =
    !!(project && project.budgets && project.budgets.oficial && Array.isArray(project.budgets.oficial.items));

  if(!hasOfficial){
    host.style.display = "none";
    body.innerHTML = "";
    return;
  }

  host.style.display = "";

  const cmp = getBudgetComparison(project);
  const indirectCmp = getBudgetIndirectComparison(project);
  const methodAudit = getBudgetIndirectMethodAudit(project);
  const currency = project.currency || "COP";

  const baseItems = Array.isArray(cmp.baseView?.items) ? cmp.baseView.items.length : 0;
  const officialItems = Array.isArray(cmp.officialView?.items) ? cmp.officialView.items.length : 0;

  body.innerHTML = `
    <div class="row" style="gap:8px; flex-wrap:wrap; margin-bottom:10px">
      <button type="button" class="btn ${methodAudit.baseModeRaw === "table" ? "" : "primary"}" data-audit-switch-budget="base">
        Base indirectos: ${UI.esc(methodAudit.baseModeLabel)}
      </button>
      <button type="button" class="btn ${methodAudit.officialModeRaw === "table" ? "" : "primary"}" data-audit-switch-budget="official">
        Oficial indirectos: ${UI.esc(methodAudit.officialModeLabel)}
      </button>
      ${methodAudit.sameMethod ? UI.chip("Mismo criterio", "ok") : UI.chip("Criterio distinto", "bad")}
    </div>

    <div class="card item" style="margin-bottom:14px">
      <div class="name">Validación de criterio de indirectos</div>
      <div class="muted small" style="margin-top:6px">${UI.esc(methodAudit.warningText)}</div>
    </div>

    <div class="grid two">
      <div class="card item">
        <div class="name">Presupuesto Base</div>
        <div class="muted small" style="margin-top:6px">Ítems: ${UI.esc(String(baseItems))}</div>
        <div class="muted small">Costos directos: <b>${UI.fmtMoney(cmp.tBase.directo||0, currency)}</b></div>
        <div class="muted small">Subtotal: <b>${UI.fmtMoney(cmp.tBase.subtotal||0, currency)}</b></div>
        <div class="muted small">Valor total: <b>${UI.fmtMoney(cmp.tBase.total||0, currency)}</b></div>
      </div>

      <div class="card item">
        <div class="name">Presupuesto Oficial</div>
        <div class="muted small" style="margin-top:6px">Ítems: ${UI.esc(String(officialItems))}</div>
        <div class="muted small">Costos directos: <b>${UI.fmtMoney(cmp.tOfficial.directo||0, currency)}</b></div>
        <div class="muted small">Subtotal: <b>${UI.fmtMoney(cmp.tOfficial.subtotal||0, currency)}</b></div>
        <div class="muted small">Valor total: <b>${UI.fmtMoney(cmp.tOfficial.total||0, currency)}</b></div>
      </div>
    </div>

    <hr class="sep">

    <div class="grid two">
      <div class="card item">
        <div class="name">Diferencia en costos directos</div>
        <div style="margin-top:6px"><b>${UI.fmtMoney((cmp.tOfficial.directo||0) - (cmp.tBase.directo||0), currency)}</b></div>
      </div>

      <div class="card item">
        <div class="name">Diferencia en valor total</div>
        <div style="margin-top:6px"><b>${UI.fmtMoney(cmp.diff||0, currency)}</b></div>
        <div class="muted small" style="margin-top:4px">${Number(cmp.diffPct||0).toFixed(2)}% frente al Base</div>
      </div>
    </div>

    <div style="margin-top:14px">
      <hr class="sep">
      <div class="cardhead">
        <h2>Comparación de costos indirectos</h2>
        <p class="muted small">Base vs Oficial para administración, imprevistos, utilidad, subtotal, IVA y valor total.</p>
      </div>

      <div class="tablewrap">
        <table class="table" style="min-width:1120px">
          <thead>
            <tr>
              <th>Concepto</th>
              <th style="text-align:right">Base</th>
              <th style="text-align:right">% Base</th>
              <th style="text-align:right">Oficial</th>
              <th style="text-align:right">% Oficial</th>
              <th style="text-align:right">Diferencia</th>
              <th style="text-align:right">% Dif.</th>
            </tr>
          </thead>
          <tbody>
            ${indirectCmp.rows.map(r=>`
              <tr>
                <td><b>${UI.esc(r.label)}</b></td>
                <td style="text-align:right"><b>${UI.fmtMoney(r.baseValue || 0, currency)}</b></td>
                <td style="text-align:right">${r.basePct ? `<b>${Number(r.basePct || 0).toFixed(2)}%</b>` : "—"}</td>
                <td style="text-align:right"><b>${UI.fmtMoney(r.officialValue || 0, currency)}</b></td>
                <td style="text-align:right">${r.officialPct ? `<b>${Number(r.officialPct || 0).toFixed(2)}%</b>` : "—"}</td>
                <td style="text-align:right"><b>${UI.fmtMoney(r.diff || 0, currency)}</b></td>
                <td style="text-align:right"><b>${Number(r.diffPct || 0).toFixed(2)}%</b></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  body.querySelectorAll("[data-audit-switch-budget]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const mode = btn.getAttribute("data-audit-switch-budget") || "base";
      if(window.StorageAPI && typeof StorageAPI.setActiveBudget === "function"){
        StorageAPI.setActiveBudget(project.id, mode);
      }
      refreshProjectBudgetAwareUI(project.id);
    });
  });
}


function getBudgetIndirectComparison(project){
  const cmp = getBudgetComparison(project);
  const baseView = cmp.baseView;
  const officialView = cmp.officialView;

  const baseSum = baseView ? summarizeIndirectUi(baseView) : { totals:{} };
  const officialSum = officialView ? summarizeIndirectUi(officialView) : { totals:{} };

  function makeRow(label, baseValue, officialValue, basePct, officialPct){
    const diff = Number(officialValue || 0) - Number(baseValue || 0);
    const diffPct = Number(baseValue || 0) > 0 ? (diff / Number(baseValue || 0)) * 100 : 0;
    return {
      label,
      baseValue: Number(baseValue || 0),
      officialValue: Number(officialValue || 0),
      diff,
      diffPct,
      basePct: Number(basePct || 0),
      officialPct: Number(officialPct || 0)
    };
  }

  const rows = [
    makeRow("Administración", baseSum.totals?.admin, officialSum.totals?.admin, baseSum.adminPct, officialSum.adminPct),
    makeRow("Imprevistos", baseSum.totals?.imprev, officialSum.totals?.imprev, baseSum.imprevPct, officialSum.imprevPct),
    makeRow("Utilidad", baseSum.totals?.util, officialSum.totals?.util, baseSum.utilPct, officialSum.utilPct),
    makeRow("Otros", Number(baseSum.totals?.indirectOthers || 0), Number(officialSum.totals?.indirectOthers || 0), baseSum.othersPct, officialSum.othersPct),
    makeRow("Subtotal", baseSum.totals?.subtotal, officialSum.totals?.subtotal, 0, 0),
    makeRow("IVA sobre utilidad", baseSum.totals?.ivaUtil, officialSum.totals?.ivaUtil, 0, 0),
    makeRow("Valor total", baseSum.totals?.total, officialSum.totals?.total, 0, 0)
  ];

  return {
    rows,
    base: baseSum,
    official: officialSum,
    currency: project?.currency || "COP"
  };
}

function renderBudgetIndirectComparison(project){
  const host = ensureBudgetComparisonMount();
  if(!host) return;

  const wrap = UI.qs("#budgetComparisonIndirects");
  if(!wrap) return;

  wrap.style.display = "none";
  wrap.innerHTML = "";
}

function getBudgetChapterComparisonRows(project){
  const cmp = getBudgetComparison(project);
  const baseView = cmp.baseView;
  const officialView = cmp.officialView;

  const baseGroups = (baseView && window.Calc && typeof Calc.groupByChapters === "function")
    ? ((Calc.groupByChapters(baseView) || {}).groups || [])
    : [];
  const officialGroups = (officialView && window.Calc && typeof Calc.groupByChapters === "function")
    ? ((Calc.groupByChapters(officialView) || {}).groups || [])
    : [];

  const map = new Map();

  baseGroups.forEach(g=>{
    const code = String(g.chapterCode || "").trim() || "SIN";
    map.set(code, {
      chapterCode: code,
      chapterName: String(g.chapterName || "").trim(),
      baseSubtotal: Number(g.subtotal || 0),
      officialSubtotal: 0
    });
  });

  officialGroups.forEach(g=>{
    const code = String(g.chapterCode || "").trim() || "SIN";
    if(!map.has(code)){
      map.set(code, {
        chapterCode: code,
        chapterName: String(g.chapterName || "").trim(),
        baseSubtotal: 0,
        officialSubtotal: Number(g.subtotal || 0)
      });
      return;
    }
    const row = map.get(code);
    row.officialSubtotal = Number(g.subtotal || 0);
    if(!row.chapterName && g.chapterName) row.chapterName = String(g.chapterName || "").trim();
  });

  return Array.from(map.values()).sort((a,b)=>{
    const an = Number(a.chapterCode), bn = Number(b.chapterCode);
    const aNum = Number.isFinite(an) && a.chapterCode !== "SIN";
    const bNum = Number.isFinite(bn) && b.chapterCode !== "SIN";
    if(aNum && bNum) return an - bn;
    if(a.chapterCode === "SIN") return 1;
    if(b.chapterCode === "SIN") return -1;
    return String(a.chapterCode).localeCompare(String(b.chapterCode), "es", { numeric:true, sensitivity:"base" });
  });
}

function renderBudgetChapterComparison(project){
  const host = ensureBudgetComparisonMount();
  if(!host) return;

  const wrap = UI.qs("#budgetComparisonChapters");
  if(!wrap) return;

  const hasOfficial =
    !!(project && project.budgets && project.budgets.oficial && Array.isArray(project.budgets.oficial.items));

  if(!hasOfficial){
    wrap.style.display = "none";
    wrap.innerHTML = "";
    return;
  }

  const rows = getBudgetChapterComparisonRows(project);
  const currency = project.currency || "COP";

  if(!rows.length){
    wrap.style.display = "none";
    wrap.innerHTML = "";
    return;
  }

  wrap.style.display = "";

  wrap.innerHTML = `
    <hr class="sep">
    <div class="cardhead">
      <h2>Comparación por capítulos</h2>
      <p class="muted small">Base vs Oficial por subtotal de capítulo.</p>
    </div>

    <div class="tablewrap">
      <table class="table" style="min-width:980px">
        <thead>
          <tr>
            <th>Capítulo</th>
            <th>Nombre</th>
            <th style="text-align:right">Base</th>
            <th style="text-align:right">Oficial</th>
            <th style="text-align:right">Diferencia</th>
            <th style="text-align:right">% Dif.</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r=>{
            const diff = Number(r.officialSubtotal || 0) - Number(r.baseSubtotal || 0);
            const pct = Number(r.baseSubtotal || 0) > 0 ? (diff / Number(r.baseSubtotal || 0)) * 100 : 0;
            return `
              <tr>
                <td><b>${UI.esc(r.chapterCode || "")}</b></td>
                <td>${UI.esc(r.chapterName || "")}</td>
                <td style="text-align:right"><b>${UI.fmtMoney(r.baseSubtotal || 0, currency)}</b></td>
                <td style="text-align:right"><b>${UI.fmtMoney(r.officialSubtotal || 0, currency)}</b></td>
                <td style="text-align:right"><b>${UI.fmtMoney(diff || 0, currency)}</b></td>
                <td style="text-align:right"><b>${Number(pct || 0).toFixed(2)}%</b></td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}


function getBudgetAlertThresholds(){
  return {
    puPct: 10,
    qtyPct: 10
  };
}

function calcPctChange(base, current){
  const b = Number(base || 0);
  const c = Number(current || 0);
  if(b === 0){
    return c === 0 ? 0 : 100;
  }
  return ((c - b) / b) * 100;
}

function detectBudgetItemAlerts(row){
  const th = getBudgetAlertThresholds();
  const alerts = [];

  const baseQty = Number(row.baseQty || 0);
  const officialQty = Number(row.officialQty || 0);
  const basePU = Number(row.basePU || 0);
  const officialPU = Number(row.officialPU || 0);

  const qtyPct = calcPctChange(baseQty, officialQty);
  const puPct = calcPctChange(basePU, officialPU);

  if(baseQty === 0 && officialQty > 0){
    alerts.push("Ítem nuevo en Oficial");
  }else if(baseQty > 0 && officialQty === 0){
    alerts.push("Ítem eliminado en Oficial");
  }else if(Math.abs(qtyPct) >= th.qtyPct){
    alerts.push(`Cantidad ${qtyPct >= 0 ? "subió" : "bajó"} ${Math.abs(qtyPct).toFixed(2)}%`);
  }

  if(basePU === 0 && officialPU > 0){
    alerts.push("PU nuevo en Oficial");
  }else if(basePU > 0 && officialPU === 0){
    alerts.push("PU eliminado en Oficial");
  }else if(Math.abs(puPct) >= th.puPct){
    alerts.push(`PU ${puPct >= 0 ? "subió" : "bajó"} ${Math.abs(puPct).toFixed(2)}%`);
  }

  return { qtyPct, puPct, alerts };
}

function getBudgetItemComparisonRows(project){
  const cmp = getBudgetComparison(project);
  const baseItems = Array.isArray(cmp.baseView?.items) ? cmp.baseView.items : [];
  const officialItems = Array.isArray(cmp.officialView?.items) ? cmp.officialView.items : [];

  function itemCompareKey(it){
    return String(
      it?.apuRefCode ||
      it?.code ||
      it?.desc ||
      it?.descripcion ||
      ""
    ).trim();
  }

  function itemDesc(it){
    return String(
      it?.desc ||
      it?.descripcion ||
      ""
    ).trim();
  }

  const map = new Map();

  baseItems.forEach(it=>{
    const key = itemCompareKey(it);
    map.set(key, {
      code: String(it?.code || "").trim(),
      desc: itemDesc(it),
      baseQty: Number(it?.qty || 0),
      basePU: Number(it?.pu || 0),
      officialQty: 0,
      officialPU: 0
    });
  });

  officialItems.forEach(it=>{
    const key = itemCompareKey(it);
    if(!map.has(key)){
      map.set(key, {
        code: String(it?.code || "").trim(),
        desc: itemDesc(it),
        baseQty: 0,
        basePU: 0,
        officialQty: Number(it?.qty || 0),
        officialPU: Number(it?.pu || 0)
      });
      return;
    }
    const row = map.get(key);
    row.officialQty = Number(it?.qty || 0);
    row.officialPU = Number(it?.pu || 0);
    if(!row.code) row.code = String(it?.code || "").trim();
    if(!row.desc) row.desc = itemDesc(it);
  });

  return Array.from(map.values()).sort((a,b)=>
    String(a.code || "").localeCompare(String(b.code || ""), "es", { numeric:true, sensitivity:"base" })
  );
}

function renderBudgetItemComparison(project){
  const host = ensureBudgetComparisonMount();
  if(!host) return;

  const wrap = UI.qs("#budgetComparisonItems");
  if(!wrap) return;

  const hasOfficial =
    !!(project && project.budgets && project.budgets.oficial && Array.isArray(project.budgets.oficial.items));

  if(!hasOfficial){
    wrap.style.display = "none";
    wrap.innerHTML = "";
    return;
  }

  const rows = getBudgetItemComparisonRows(project);
  const currency = project.currency || "COP";

  if(!rows.length){
    wrap.style.display = "none";
    wrap.innerHTML = "";
    return;
  }

  wrap.style.display = "";

  wrap.innerHTML = `
    <hr class="sep">
    <div class="cardhead">
      <h2>Comparación por ítems</h2>
      <p class="muted small">Diferencias en cantidades y precios unitarios. Umbrales de alerta: PU 10% y Cantidad 10%.</p>
    </div>

    <div class="tablewrap">
      <table class="table" style="min-width:1450px">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descripción</th>
            <th style="text-align:right">Cant Base</th>
            <th style="text-align:right">PU Base</th>
            <th style="text-align:right">Cant Oficial</th>
            <th style="text-align:right">PU Oficial</th>
            <th style="text-align:right">Dif Cant</th>
            <th style="text-align:right">Dif PU</th>
            <th style="text-align:right">% Cant</th>
            <th style="text-align:right">% PU</th>
            <th>Alertas</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r=>{
            const diffQty = Number(r.officialQty || 0) - Number(r.baseQty || 0);
            const diffPU = Number(r.officialPU || 0) - Number(r.basePU || 0);
            const audit = detectBudgetItemAlerts(r);
            return `
              <tr>
                <td><b>${UI.esc(r.code || "")}</b></td>
                <td>${UI.esc(r.desc || "")}</td>
                <td style="text-align:right">${UI.esc(String(r.baseQty || 0))}</td>
                <td style="text-align:right"><b>${UI.fmtMoney(r.basePU || 0, currency)}</b></td>
                <td style="text-align:right">${UI.esc(String(r.officialQty || 0))}</td>
                <td style="text-align:right"><b>${UI.fmtMoney(r.officialPU || 0, currency)}</b></td>
                <td style="text-align:right"><b>${UI.esc(String(diffQty))}</b></td>
                <td style="text-align:right"><b>${UI.fmtMoney(diffPU || 0, currency)}</b></td>
                <td style="text-align:right"><b>${Number(audit.qtyPct || 0).toFixed(2)}%</b></td>
                <td style="text-align:right"><b>${Number(audit.puPct || 0).toFixed(2)}%</b></td>
                <td>${audit.alerts.length ? audit.alerts.map(a=>UI.chip(a, "warn")).join(" ") : UI.chip("Sin alerta", "ok")}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}


function ensureBudgetRiskTopMount(){
  let host = UI.qs("#budgetRiskTopMount");
  if(host) return host;

  const compareMount = UI.qs("#budgetComparisonMount");
  if(!compareMount) return null;

  host = document.createElement("section");
  host.id = "budgetRiskTopMount";
  host.className = "card";
  host.style.marginTop = "14px";
  compareMount.insertAdjacentElement("afterend", host);
  return host;
}

function getBudgetRiskTopRows(project, limit=10){
  const rows = getBudgetItemComparisonRows(project);

  const ranked = rows.map(r=>{
    const audit = detectBudgetItemAlerts(r);
    const basePartial = Number(r.baseQty || 0) * Number(r.basePU || 0);
    const officialPartial = Number(r.officialQty || 0) * Number(r.officialPU || 0);
    const impact = officialPartial - basePartial;
    const impactAbs = Math.abs(impact);
    return {
      ...r,
      audit,
      basePartial,
      officialPartial,
      impact,
      impactAbs
    };
  })
  .filter(r => r.audit.severity !== "ok" || r.impactAbs > 0)
  .sort((a,b)=>{
    const sevWeight = { bad: 3, warn: 2, ok: 1 };
    const sa = sevWeight[a.audit.severity] || 0;
    const sb = sevWeight[b.audit.severity] || 0;
    if(sb !== sa) return sb - sa;
    if(Number(b.impactAbs || 0) !== Number(a.impactAbs || 0)) return Number(b.impactAbs || 0) - Number(a.impactAbs || 0);
    return String(a.code || "").localeCompare(String(b.code || ""), "es", { numeric:true, sensitivity:"base" });
  });

  return ranked.slice(0, limit);
}

function renderBudgetRiskTop(project){
  const host = ensureBudgetRiskTopMount();
  if(!host || !project) return;

  const hasOfficial =
    !!(project && project.budgets && project.budgets.oficial && Array.isArray(project.budgets.oficial.items));

  if(!hasOfficial){
    host.style.display = "none";
    host.innerHTML = "";
    return;
  }

  const rows = getBudgetRiskTopRows(project, 10);
  const currency = project.currency || "COP";

  if(!rows.length){
    host.style.display = "none";
    host.innerHTML = "";
    return;
  }

  host.style.display = "";

  const criticalCount = rows.filter(r => r.audit.severity === "bad").length;
  const warningCount = rows.filter(r => r.audit.severity === "warn").length;

  host.innerHTML = `
    <div class="cardhead">
      <h2>Top de riesgos presupuestales</h2>
      <p class="muted small">Ranking automático de los ítems con mayor impacto económico o mayor severidad en la comparación Base vs Oficial.</p>
    </div>

    <div class="row" style="gap:8px; flex-wrap:wrap; margin-bottom:10px">
      ${UI.chip(`CRÍTICOS ${criticalCount}`, "bad")}
      ${UI.chip(`ALERTAS ${warningCount}`, "warn")}
      ${UI.chip(`TOP ${rows.length}`, "ok")}
    </div>

    <div class="tablewrap">
      <table class="table" style="min-width:1320px">
        <thead>
          <tr>
            <th>#</th>
            <th>Estado</th>
            <th>Código</th>
            <th>Descripción</th>
            <th style="text-align:right">Base</th>
            <th style="text-align:right">Oficial</th>
            <th style="text-align:right">Impacto</th>
            <th style="text-align:right">% Cant</th>
            <th style="text-align:right">% PU</th>
            <th>Hallazgo</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((r, idx)=>{
            const bg =
              r.audit.severity === "bad" ? "rgba(239,68,68,.10)" :
              r.audit.severity === "warn" ? "rgba(245,158,11,.10)" :
              "transparent";
            const impactChip = r.impact >= 0 ? "bad" : "ok";
            const qtyType = Math.abs(Number(r.audit.qtyPct || 0)) > 20 ? "bad" : (Math.abs(Number(r.audit.qtyPct || 0)) >= 10 ? "warn" : "ok");
            const puType = Math.abs(Number(r.audit.puPct || 0)) > 20 ? "bad" : (Math.abs(Number(r.audit.puPct || 0)) >= 10 ? "warn" : "ok");
            return `
              <tr style="background:${bg}">
                <td><b>${idx + 1}</b></td>
                <td>${UI.chip(r.audit.severityLabel || "OK", r.audit.severity || "ok")}</td>
                <td><b>${UI.esc(r.code || "")}</b></td>
                <td>${UI.esc(r.desc || "")}</td>
                <td style="text-align:right"><b>${UI.fmtMoney(r.basePartial || 0, currency)}</b></td>
                <td style="text-align:right"><b>${UI.fmtMoney(r.officialPartial || 0, currency)}</b></td>
                <td style="text-align:right">${UI.chip(UI.fmtMoney(r.impact || 0, currency), impactChip)}</td>
                <td style="text-align:right">${UI.chip(`${Number(r.audit.qtyPct || 0).toFixed(2)}%`, qtyType)}</td>
                <td style="text-align:right">${UI.chip(`${Number(r.audit.puPct || 0).toFixed(2)}%`, puType)}</td>
                <td>${r.audit.alerts.length ? r.audit.alerts.map(a=>UI.chip(a, r.audit.severity === "bad" ? "bad" : "warn")).join(" ") : UI.chip("Sin alerta", "ok")}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}


function buildAuditPdfFilename(project){
  const name = sanitizeFileName(project?.name || "proyecto");
  return `Informe_Auditoria_Presupuestal_${name}_${Date.now()}.pdf`;
}

function auditMoney(n){
  return "$ " + Math.round(Number(n || 0)).toLocaleString("es-CO");
}

function exportAuditPdf(project){
  if(!project) return;

  const JsPDFCtor = window.jspdf?.jsPDF || window.jsPDF;
  if(!JsPDFCtor){
    alert("No se encontró jsPDF. Verifica que la librería PDF esté cargada.");
    return;
  }
  if(!projectHasOfficialBudget(project)){
    alert("Primero debe existir un Presupuesto Oficial para generar el PDF de auditoría.");
    return;
  }

  const doc = new JsPDFCtor({ unit:"pt", format:"letter", orientation:"portrait" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = { top: 42, right: 44, bottom: 44, left: 44 };
  const usableW = W - M.left - M.right;
  const elaborador = (window.StorageAPI && typeof StorageAPI.getElaborador === "function")
    ? (StorageAPI.getElaborador() || {})
    : {};
  const nowTxt = new Date().toLocaleString();
  const currency = project.currency || "COP";
  const cmp = getBudgetComparison(project);
  const indirectCmp = getBudgetIndirectComparison(project);
  const methodAudit = getBudgetIndirectMethodAudit(project);
  const chapterRows = getBudgetChapterComparisonRows(project);
  const itemRows = getBudgetItemComparisonRows(project);
  const itemAlerts = itemRows
    .map(r => ({ ...r, audit: detectBudgetItemAlerts(r) }))
    .filter(r => Array.isArray(r.audit?.alerts) && r.audit.alerts.length);
  const riskTopRows = (typeof getBudgetRiskTopRows === "function")
    ? getBudgetRiskTopRows(project, 10)
    : [];
  const historyRows = readProjectAuditHistory(project).slice().reverse().slice(0, 25);

  let y = M.top;
  let pageNo = 1;

  function safeText(v){
    return String(v ?? "");
  }

  function money(v){
    return UI.fmtMoney(Number(v || 0), currency);
  }

  function line(yPos){
    doc.setLineWidth(0.35);
    doc.line(M.left, yPos, W - M.right, yPos);
  }

  function stampHeader(){
    if(pageNo === 1) return;
    const logo = String(project.logoDataUrl || "").trim();
    if(logo){
      try{ doc.addImage(logo, "PNG", M.left, 18, 42, 42); }catch(_){}
    }
    const textX = logo ? (M.left + 52) : M.left;
    doc.setFont("helvetica","bold");
    doc.setFontSize(9.5);
    doc.text("INFORME DE AUDITORÍA PRESUPUESTAL", textX, 28);

    doc.setFont("helvetica","normal");
    doc.setFontSize(8.8);
    doc.text(safeText(project.instEntidad || project.entity || project.name || ""), textX, 39);
    doc.text(safeText(project.instProyectoLabel || project.name || ""), textX, 50);

    doc.setFontSize(8.4);
    doc.text(nowTxt, W - M.right, 28, { align:"right" });
    doc.text(`Página ${pageNo}`, W - M.right, 39, { align:"right" });
    line(60);
  }

  function addPage(){
    doc.addPage();
    pageNo += 1;
    y = 74;
    stampHeader();
  }

  function ensureSpace(need = 18){
    if(y + need > H - M.bottom){
      addPage();
    }
  }

  function drawCover(){
    const logo = String(project.logoDataUrl || "").trim();
    if(logo){
      try{ doc.addImage(logo, "PNG", W/2 - 42, y, 84, 84); }catch(_){}
      y += 98;
    }

    doc.setFont("helvetica","bold");
    doc.setFontSize(17);
    doc.text("INFORME DE AUDITORÍA PRESUPUESTAL", W/2, y, { align:"center" });
    y += 22;

    doc.setFont("helvetica","bold");
    doc.setFontSize(11);
    doc.text("COMPARATIVO PRESUPUESTO BASE VS PRESUPUESTO OFICIAL", W/2, y, { align:"center" });
    y += 28;

    line(y);
    y += 22;

    const coverRows = [
      ["Proyecto", project.instProyectoLabel || project.name || ""],
      ["Entidad", project.instEntidad || project.entity || ""],
      ["País", project.instPais || ""],
      ["Departamento", project.instDepto || ""],
      ["Municipio", project.instMunicipio || project.location || ""],
      ["Fecha elaboración", project.instFechaElab || new Date().toLocaleDateString()],
      ["Moneda", currency]
    ];

    doc.setFontSize(10.5);
    coverRows.forEach(([label, value])=>{
      doc.setFont("helvetica","bold");
      doc.text(safeText(label), M.left, y);
      doc.setFont("helvetica","normal");
      const lines = doc.splitTextToSize(safeText(value || "-"), usableW - 120);
      doc.text(lines, M.left + 120, y);
      y += (Array.isArray(lines) ? lines.length : 1) * 12 + 6;
    });

    y += 12;
    line(y);
    y += 24;

    doc.setFont("helvetica","normal");
    doc.setFontSize(10);
    const intro = doc.splitTextToSize(
      "El presente informe consolida el análisis comparativo entre el Presupuesto Base y el Presupuesto Oficial del proyecto, incluyendo diferencias generales, variaciones por capítulos, ítems con alerta y trazabilidad reciente de cambios.",
      usableW
    );
    doc.text(intro, M.left, y);
    y += intro.length * 12 + 20;

    if(elaborador?.nombre || elaborador?.profesion || elaborador?.matricula){
      doc.setFont("helvetica","bold");
      doc.setFontSize(10);
      doc.text("Elaboró:", M.left, y);
      y += 14;
      doc.setFont("helvetica","normal");
      if(elaborador?.nombre){ doc.text(safeText(elaborador.nombre), M.left, y); y += 12; }
      if(elaborador?.profesion){ doc.text(safeText(elaborador.profesion), M.left, y); y += 12; }
      if(elaborador?.matricula){ doc.text(`Matrícula: ${safeText(elaborador.matricula)}`, M.left, y); y += 12; }
    }
  }

  function addTitle(text){
    ensureSpace(28);
    doc.setFont("helvetica","bold");
    doc.setFontSize(14);
    doc.text(safeText(text), M.left, y);
    y += 16;
    line(y);
    y += 12;
  }

  function addRow(label, value){
    ensureSpace(16);
    doc.setFont("helvetica","bold");
    doc.setFontSize(10);
    doc.text(safeText(label), M.left, y);
    doc.setFont("helvetica","normal");
    doc.text(safeText(value), W - M.right, y, { align:"right" });
    y += 14;
  }

  function addParagraph(text){
    ensureSpace(22);
    doc.setFont("helvetica","normal");
    doc.setFontSize(9.8);
    const lines = doc.splitTextToSize(safeText(text), usableW);
    doc.text(lines, M.left, y);
    y += lines.length * 11 + 6;
  }

  function addSimpleTable(headers, rows, widths){
    ensureSpace(24);
    doc.setFont("helvetica","bold");
    doc.setFontSize(8.7);

    let x = M.left;
    headers.forEach((h, i)=>{
      doc.text(safeText(h), x, y);
      x += widths[i];
    });
    y += 8;
    line(y);
    y += 10;

    doc.setFont("helvetica","normal");
    doc.setFontSize(8.2);

    rows.forEach(row=>{
      const prepared = row.map((cell, i)=>doc.splitTextToSize(safeText(cell), Math.max(24, widths[i]-6)));
      const maxLines = Math.max(...prepared.map(lines => lines.length || 1), 1);
      const rowH = maxLines * 9 + 5;

      ensureSpace(rowH + 8);

      let cx = M.left;
      prepared.forEach((lines, i)=>{
        doc.text(lines, cx, y);
        cx += widths[i];
      });

      y += rowH;
      line(y - 2);
      y += 6;
    });
  }

  drawCover();
  addPage();

  addTitle("1. Resumen general");
  addRow("Presupuesto Base", money(cmp.tBase.total || 0));
  addRow("Presupuesto Oficial", money(cmp.tOfficial.total || 0));
  addRow("Diferencia total", money(cmp.diff || 0));
  addRow("Variación porcentual", `${Number(cmp.diffPct || 0).toFixed(2)}%`);
  addRow("Método indirectos Base", methodAudit.baseModeLabel);
  addRow("Método indirectos Oficial", methodAudit.officialModeLabel);
  addParagraph(methodAudit.warningText);

  addTitle("2. Comparación de costos indirectos");
  if(!indirectCmp.rows.length){
    addParagraph("No se encontraron datos de costos indirectos para comparar.");
  }else{
    addSimpleTable(
      ["Concepto", "Base", "% Base", "Oficial", "% Oficial", "Dif.", "% Dif."],
      indirectCmp.rows.map(r=>[
        r.label || "",
        money(r.baseValue || 0),
        r.basePct ? `${Number(r.basePct || 0).toFixed(2)}%` : "-",
        money(r.officialValue || 0),
        r.officialPct ? `${Number(r.officialPct || 0).toFixed(2)}%` : "-",
        money(r.diff || 0),
        `${Number(r.diffPct || 0).toFixed(2)}%`
      ]),
      [120, 84, 52, 84, 56, 84, 52]
    );
  }

  addTitle("3. Comparación por capítulos");
  if(!chapterRows.length){
    addParagraph("No se encontraron capítulos para comparar.");
  }else{
    addSimpleTable(
      ["Capítulo", "Nombre", "Base", "Oficial", "Dif.", "%"],
      chapterRows.map(r=>{
        const diff = Number(r.officialSubtotal || 0) - Number(r.baseSubtotal || 0);
        const pct = Number(r.baseSubtotal || 0) > 0 ? (diff / Number(r.baseSubtotal || 0)) * 100 : 0;
        return [
          r.chapterCode || "",
          r.chapterName || "",
          money(r.baseSubtotal || 0),
          money(r.officialSubtotal || 0),
          money(diff || 0),
          `${Number(pct || 0).toFixed(2)}%`
        ];
      }),
      [55, 190, 82, 82, 82, 45]
    );
  }

  addTitle("4. Ítems con alerta");
  addParagraph("Umbrales usados en la auditoría automática: Precio Unitario 10% y Cantidad 10%.");
  if(!itemAlerts.length){
    addParagraph("No se detectaron ítems con alerta.");
  }else{
    addSimpleTable(
      ["Código", "Descripción", "Dif Cant", "Dif PU", "% Cant", "% PU", "Alertas"],
      itemAlerts.map(r=>{
        const diffQty = Number(r.officialQty || 0) - Number(r.baseQty || 0);
        const diffPU = Number(r.officialPU || 0) - Number(r.basePU || 0);
        return [
          r.code || "",
          r.desc || "",
          String(diffQty),
          money(diffPU || 0),
          `${Number(r.audit?.qtyPct || 0).toFixed(2)}%`,
          `${Number(r.audit?.puPct || 0).toFixed(2)}%`,
          (r.audit?.alerts || []).join(" | ")
        ];
      }),
      [50, 170, 50, 66, 50, 46, 126]
    );
  }

  addTitle("5. Top de riesgos presupuestales");
  if(!riskTopRows.length){
    addParagraph("No se identificaron riesgos presupuestales relevantes para priorizar en el ranking.");
  }else{
    addSimpleTable(
      ["#", "Estado", "Código", "Descripción", "Base", "Oficial", "Impacto"],
      riskTopRows.map((r, idx)=>[
        String(idx + 1),
        r.audit?.severityLabel || "OK",
        r.code || "",
        r.desc || "",
        money(r.basePartial || 0),
        money(r.officialPartial || 0),
        money(r.impact || 0)
      ]),
      [28, 52, 56, 182, 74, 74, 74]
    );
  }

  addTitle("6. Historial reciente de cambios");
  if(!historyRows.length){
    addParagraph("Aún no hay cambios registrados.");
  }else{
    addSimpleTable(
      ["Fecha", "Ppto", "Tipo", "Código", "Detalle", "Antes", "Después"],
      historyRows.map(r=>[
        new Date(r.at).toLocaleString(),
        r.budgetMode || "BASE",
        r.type || "",
        r.code || "",
        r.detail || "",
        r.beforeValue || "",
        r.afterValue || ""
      ]),
      [84, 40, 66, 52, 98, 92, 92]
    );
  }

  addTitle("7. Conclusión automática");
  const highAlerts = itemAlerts.length;
  const positiveChapters = chapterRows.filter(r => (Number(r.officialSubtotal || 0) - Number(r.baseSubtotal || 0)) > 0).length;

  addParagraph(
    `El análisis comparativo entre el Presupuesto Base y el Presupuesto Oficial del proyecto "${safeText(project.name || "")}" `
    + `evidencia una diferencia total de ${money(cmp.diff || 0)} (${Number(cmp.diffPct || 0).toFixed(2)}%). `
    + `Se identificaron ${highAlerts} ítems con alerta automática, ${riskTopRows.length} riesgos priorizados en el ranking, diferencias en costos indirectos y ${positiveChapters} capítulos con variación positiva frente al presupuesto base. `
    + `${methodAudit.sameMethod ? "Ambos presupuestos mantienen el mismo criterio de cálculo de indirectos. " : `Se detectó inconsistencia en el criterio de cálculo de indirectos (Base: ${methodAudit.baseModeLabel} / Oficial: ${methodAudit.officialModeLabel}). `}`
    + `Este informe sirve como soporte técnico para revisión presupuestal, interventoría y auditoría forense.`
  );

  ensureSpace(90);
  y += 10;
  line(y);
  y += 18;

  if(String(elaborador?.firmaDataUrl || "").trim()){
    try{
      doc.addImage(elaborador.firmaDataUrl, "JPEG", M.left, y - 6, 140, 46);
    }catch(_){
      try{ doc.addImage(elaborador.firmaDataUrl, "PNG", M.left, y - 6, 140, 46); }catch(__){}
    }
  }

  y += 50;
  doc.setFont("helvetica","bold");
  doc.setFontSize(10);
  if(elaborador?.nombre) doc.text(safeText(elaborador.nombre), M.left, y);
  y += 12;
  doc.setFont("helvetica","normal");
  if(elaborador?.profesion) doc.text(safeText(elaborador.profesion), M.left, y);
  y += 12;
  if(elaborador?.matricula) doc.text(`Matrícula: ${safeText(elaborador.matricula)}`, M.left, y);

  doc.save(buildAuditPdfFilename(project));
}


function normalizeHistoryBudgetMode(v){
  return String(v || "").trim().toLowerCase() === "official" ? "OFICIAL"
    : String(v || "").trim().toLowerCase() === "oficial" ? "OFICIAL"
    : "BASE";
}

function readProjectAuditHistory(project){
  return Array.isArray(project?.auditHistory) ? project.auditHistory.slice() : [];
}

function writeProjectAuditHistory(projectId, entries){
  const safe = Array.isArray(entries) ? entries.slice(-300) : [];
  StorageAPI.updateProject(projectId, { auditHistory: safe });
  return safe;
}

function pushProjectAuditEntry(projectId, entry){
  const project = StorageAPI.getProjectById(projectId);
  if(!project) return null;

  const history = readProjectAuditHistory(project);
  const next = {
    id: makeId("audit"),
    at: new Date().toISOString(),
    budgetMode: normalizeHistoryBudgetMode(project.activeBudget || "base"),
    type: String(entry?.type || "CAMBIO").trim(),
    code: String(entry?.code || "").trim(),
    desc: String(entry?.desc || "").trim(),
    detail: String(entry?.detail || "").trim(),
    beforeValue: String(entry?.beforeValue || "").trim(),
    afterValue: String(entry?.afterValue || "").trim()
  };

  history.push(next);
  writeProjectAuditHistory(projectId, history);
  return next;
}

function ensureBudgetHistoryMount(){
  let host = UI.qs("#budgetHistoryMount");
  if(host) return host;

  const compareMount = UI.qs("#budgetComparisonMount");
  if(!compareMount) return null;

  host = document.createElement("section");
  host.id = "budgetHistoryMount";
  host.className = "card";
  host.style.marginTop = "14px";
  compareMount.insertAdjacentElement("afterend", host);
  return host;
}

function renderBudgetHistory(project){
  const host = ensureBudgetHistoryMount();
  if(!host || !project) return;

  const rows = readProjectAuditHistory(project).slice().reverse();

  host.innerHTML = `
    <div class="cardhead">
      <h2>Historial de cambios</h2>
      <p class="muted small">Trazabilidad reciente de modificaciones dentro del proyecto.</p>
    </div>

    ${rows.length ? `
      <div class="tablewrap">
        <table class="table" style="min-width:1100px">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Presupuesto</th>
              <th>Tipo</th>
              <th>Código</th>
              <th>Descripción</th>
              <th>Detalle</th>
              <th>Antes</th>
              <th>Después</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r=>`
              <tr>
                <td>${UI.esc(new Date(r.at).toLocaleString())}</td>
                <td>${UI.chip(UI.esc(r.budgetMode || "BASE"), "ok")}</td>
                <td>${UI.esc(r.type || "")}</td>
                <td><b>${UI.esc(r.code || "")}</b></td>
                <td>${UI.esc(r.desc || "")}</td>
                <td>${UI.esc(r.detail || "")}</td>
                <td>${UI.esc(r.beforeValue || "")}</td>
                <td>${UI.esc(r.afterValue || "")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    ` : `
      <div class="muted small">Aún no hay cambios registrados.</div>
    `}
  `;
}

function getProjectSubApuOverrides(project){
  const raw = project?.subApuOverrides;
  if(raw && typeof raw === "object" && !Array.isArray(raw)) return raw;
  return {};
}

function getSubApuOverride(projectId, subKey){
  const project = StorageAPI.getProjectById(projectId);
  if(!project) return null;
  const key = String(subKey || "").trim();
  if(!key) return null;
  const map = getProjectSubApuOverrides(project);
  const hit = map[key];
  return (hit && Array.isArray(hit.lines)) ? hit : null;
}

function setSubApuOverride(projectId, subKey, lines, meta){
  const project = StorageAPI.getProjectById(projectId);
  if(!project) return null;
  const key = String(subKey || "").trim();
  if(!key) return null;

  const map = { ...getProjectSubApuOverrides(project) };
  map[key] = {
    subKey: key,
    updatedAt: new Date().toISOString(),
    meta: meta || {},
    lines: (Array.isArray(lines) ? lines : []).map(l => ({
      group: String(l.group || l.tipo || "-"),
      desc: String(l.desc || ""),
      unit: String(l.unit || ""),
      qty: Number(l.qty || 0),
      pu: Number(l.pu || 0),
      parcial: Number(l.parcial || 0) || (Number(l.qty || 0) * Number(l.pu || 0)),
      subRef: String(l.subRef || "").trim()
    }))
  };

  StorageAPI.updateProject(projectId, { subApuOverrides: map });
  return map[key];
}

function clearSubApuOverride(projectId, subKey){
  const project = StorageAPI.getProjectById(projectId);
  if(!project) return;
  const key = String(subKey || "").trim();
  if(!key) return;

  const map = { ...getProjectSubApuOverrides(project) };
  delete map[key];
  StorageAPI.updateProject(projectId, { subApuOverrides: map });
}


/* ==========================================
   ✅ Helper: actualizar PU por APU real (apuRefCode)
   ========================================== */
function updateItemsPUByApuCompat(projectId, apuCode, newPU){
  // Preferido: por apuRefCode
  if(window.StorageAPI && typeof StorageAPI.updateItemsPUByApuRefCode === "function"){
    return StorageAPI.updateItemsPUByApuRefCode(projectId, apuCode, newPU);
  }
  // Fallback legacy: por code visible
  if(window.StorageAPI && typeof StorageAPI.updateItemsPUByCode === "function"){
    return StorageAPI.updateItemsPUByCode(projectId, apuCode, newPU);
  }
  return 0;
}

/* ==========================================
   ✅ Helpers robustos para resolver APU
   - Evita fallos cuando el código visible cambia
   - Prioriza override/custom por code y por apuRefCode
   ========================================== */
function normalizeLookupCode(v){
  return String(v || "").trim();
}

function normalizeTextForMatch(v){
  return String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getItemByAnyLookup(project, code){
  const key = normalizeLookupCode(code);
  if(!project || !key) return null;
  return (project.items || []).find(it => {
    const visible = normalizeLookupCode(it?.code);
    const ref = normalizeLookupCode(it?.apuRefCode);
    return visible === key || ref === key;
  }) || null;
}

function getProjectOverrideByAnyLookup(projectId, codeA, codeB){
  const tries = [normalizeLookupCode(codeA), normalizeLookupCode(codeB)].filter(Boolean);
  if(!projectId || !tries.length || !window.StorageAPI || typeof StorageAPI.getApuOverride !== "function") return null;

  for(const key of tries){
    const ov = StorageAPI.getApuOverride(projectId, key);
    if(ov && Array.isArray(ov.lines) && ov.lines.length){
      return { key, ov };
    }
  }
  return null;
}

function getCustomAPUByAnyLookup(codeA, codeB){
  const tries = [normalizeLookupCode(codeA), normalizeLookupCode(codeB)].filter(Boolean);
  if(!tries.length || !window.StorageAPI) return null;

  if(typeof StorageAPI.getCustomAPU === "function"){
    for(const key of tries){
      const apu = StorageAPI.getCustomAPU(key);
      if(apu) return { key, apu };
    }
  }

  if(typeof StorageAPI.listCustomAPUs === "function"){
    const all = StorageAPI.listCustomAPUs() || [];
    for(const key of tries){
      const apu = all.find(x => normalizeLookupCode(x?.code) === key);
      if(apu) return { key, apu };
    }
  }

  return null;
}

async function getBaseAPUByAnyLookup(codeA, codeB){
  const tries = [normalizeLookupCode(codeA), normalizeLookupCode(codeB)].filter(Boolean);
  if(!tries.length || !window.APUBase || typeof APUBase.getAPU !== "function") return null;

  for(const key of tries){
    try{
      const apu = await APUBase.getAPU(key);
      if(apu) return { key, apu };
    }catch(_){}
  }
  return null;
}

async function tryResolveAPUFromProjectItem(projectId, requestedCode){
  const project = projectId ? StorageAPI.getProjectById(projectId) : null;
  const requested = normalizeLookupCode(requestedCode);

  let item = getItemByAnyLookup(project, requested);
  if(!item && project && requested){
    item = (project.items || []).find(it => normalizeTextForMatch(it?.desc) === normalizeTextForMatch(requested));
  }

  const visibleCode = normalizeLookupCode(item?.code || requested);
  const refCode = normalizeLookupCode(item?.apuRefCode || requested);

  const overrideHit = getProjectOverrideByAnyLookup(projectId, visibleCode, refCode);
  if(overrideHit){
    return {
      source: "override",
      resolvedCode: overrideHit.key,
      visibleCode,
      refCode,
      item,
      data: overrideHit.ov
    };
  }

  const customHit = getCustomAPUByAnyLookup(visibleCode, refCode);
  if(customHit){
    return {
      source: "custom",
      resolvedCode: customHit.key,
      visibleCode,
      refCode,
      item,
      data: customHit.apu
    };
  }

  const baseHit = await getBaseAPUByAnyLookup(refCode, visibleCode);
  if(baseHit){
    return {
      source: "base",
      resolvedCode: baseHit.key,
      visibleCode,
      refCode,
      item,
      data: baseHit.apu
    };
  }

  return {
    source: "",
    resolvedCode: refCode || visibleCode || requested,
    visibleCode,
    refCode,
    item,
    data: null
  };
}

/* ==========================================
   ✅ Export Excel (sin cambios de lógica)
   ========================================== */
function exportProjectExcel(project){
  if(!project) return;

  if(typeof XLSX === "undefined" || !XLSX?.utils){
    alert("No se encontró XLSX. Verifica que está cargado en el HTML.");
    return;
  }

  const totals = totalsCompat(project);
  const { groups, items } = Calc.groupByChapters(project);

  const adminPct = pct(project, "adminPct", "aiuPct");
  const imprevPct = pct(project, "imprevPct", null);
  const utilPct = pct(project, "utilPct", null);
  const ivaUtilPct = pct(project, "ivaUtilPct", "ivaPct");

  const resumenAOA = [
    ["FORMATO INSTITUCIONAL"],
    ["República / País", project.instPais || ""],
    ["Departamento", project.instDepto || ""],
    ["Municipio", project.instMunicipio || ""],
    ["Entidad contratante", project.instEntidad || (project.entity || "")],
    ["Proyecto (portada)", project.instProyectoLabel || project.name || ""],
    ["Ubicación", project.location || ""],
    ["Fecha elaboración", project.instFechaElab || ""],
    [""],
    ["RESUMEN PRESUPUESTO"],
    ["Moneda", project.currency || "COP"],
    ["Administración (%)", Number(adminPct||0)],
    ["Imprevistos (%)", Number(imprevPct||0)],
    ["Utilidad (%)", Number(utilPct||0)],
    ["IVA sobre Utilidad (%)", Number(ivaUtilPct||0)],
    [""],
    ["TOTAL COSTOS DIRECTOS", Number(totals.directo||0)],
    ["ADMINISTRACIÓN", Number(totals.admin||0)],
    ["IMPREVISTOS", Number(totals.imprev||0)],
    ["UTILIDAD", Number(totals.util||0)],
    ["SUBTOTAL", Number(totals.subtotal||0)],
    ["IVA sobre Utilidad", Number(totals.ivaUtil||0)],
    ["VALOR TOTAL", Number(totals.total||0)],
    [""],
    ["Items", (project.items||[]).length],
    ["Capítulos", (groups||[]).length],
  ];

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenAOA);

  const capsRows = (groups||[]).map(g=>({
    Capitulo: String(g.chapterCode||""),
    Nombre: String(g.chapterName||""),
    Items: Number(g.itemsCount||0),
    Subtotal: Number(g.subtotal||0),
    Moneda: project.currency || "COP"
  }));
  const wsCaps = XLSX.utils.json_to_sheet(capsRows.length ? capsRows : [{Capitulo:"",Nombre:"",Items:"",Subtotal:"",Moneda:project.currency||"COP"}]);

  const itemsRows = (items||[]).map(it=>{
    const parcial = Number(it.pu||0) * Number(it.qty||0);
    const cap = it.chapterCode || (String(it.code||"").split(".")[0] || "");
    return {
      Capitulo: String(cap||""),
      Codigo: String(it.code||""),
      Descripcion: String(it.desc||""),
      Unidad: String(it.unit||""),
      VR_Unitario: Number(it.pu||0),
      Cantidad: Number(it.qty||0),
      VR_Parcial: Number(parcial||0),
      Moneda: project.currency || "COP"
    };
  });
  const wsItems = XLSX.utils.json_to_sheet(itemsRows.length ? itemsRows : [{
    Capitulo:"",Codigo:"",Descripcion:"",Unidad:"",VR_Unitario:"",Cantidad:"",VR_Parcial:"",Moneda:project.currency||"COP"
  }]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
  XLSX.utils.book_append_sheet(wb, wsCaps, "Capitulos");
  XLSX.utils.book_append_sheet(wb, wsItems, "Items");

  const out = XLSX.write(wb, { bookType:"xlsx", type:"array" });
  const blob = new Blob([out], { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);

  const filename = `presupuesto_${sanitizeFileName(project.name)}_${Date.now()}.xlsx`;
  UI.downloadBlobUrl(url, filename);
}

/* ---------- PROYECTOS ---------- */
async function renderKpis(){
  const el = UI.qs("#kpis");
  if(!el) return;

  const ps = StorageAPI.listProjects();
  const total = ps.reduce((s,p)=> s + (totalsCompat(p).total||0), 0);

  let baseChip = UI.chip("NO","bad");
  try{
    const meta = await APUBase.getMeta();
    if(meta) baseChip = UI.chip(`OK (${meta.counts?.items||0})`,"ok");
  }catch(_){}

  el.innerHTML = `
    <div class="card item"><div class="topline"><div class="name">Proyectos</div><div class="chips">${UI.chip(String(ps.length),"ok")}</div></div><div class="muted small">En este dispositivo.</div></div>
    <div class="card item"><div class="topline"><div class="name">Total presupuestado</div><div class="chips">${UI.chip(UI.fmtMoney(total,"COP"))}</div></div><div class="muted small">Suma de totales.</div></div>
    <div class="card item"><div class="topline"><div class="name">Base APU</div><div class="chips">${baseChip}</div></div><div class="muted small">Importada desde XLSX.</div></div>
    <div class="card item"><div class="topline"><div class="name">Modo</div><div class="chips">${UI.chip("OFFLINE","ok")}</div></div><div class="muted small">LocalStorage + IndexedDB.</div></div>
  `;
}

function renderProjects(){
  const tbody = UI.qs("#lista");
  const empty = UI.qs("#empty");
  if(!tbody) return;

  const term = (UI.qs("#search")?.value || "").toLowerCase().trim();
  let ps = StorageAPI.listProjects();

  if(term){
    ps = ps.filter(p => `${p.name} ${p.entity} ${p.location}`.toLowerCase().includes(term));
  }

  if(!ps.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  tbody.innerHTML = ps.map(p=>{
    const t = totalsCompat(p);
    return `
      <tr>
        <td><b>${UI.esc(p.name)}</b></td>
        <td>${UI.esc(p.entity||"-")}</td>
        <td>${UI.esc(p.location||"-")}</td>
        <td>${p.updatedAt ? UI.esc(new Date(p.updatedAt).toLocaleString()) : "-"}</td>
        <td><b>${UI.fmtMoney(t.total, p.currency||"COP")}</b></td>
        <td class="row" style="gap:8px">
          <a class="btn primary" href="proyecto-detalle.html?projectId=${encodeURIComponent(p.id)}">Abrir</a>
          <button class="btn danger" type="button" data-del="${p.id}">Eliminar</button>
        </td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll("[data-del]").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const id = btn.getAttribute("data-del");
      if(!confirm("¿Eliminar proyecto y sus documentos?")) return;
      await DB.deleteFilesByOwner("project", id).catch(()=>{});
      StorageAPI.deleteProject(id);
      renderKpis();
      renderProjects();
    });
  });
}

async function bindProjectsPage(){
  UI.qs("#btnNew")?.addEventListener("click", ()=>{
    const name = prompt("Nombre del proyecto:","") || "";
    if(!name.trim()) return;

    const entity = prompt("Entidad (opcional):","") || "";
    const ubicacion = prompt("Ubicación (opcional):","") || "";

    const p = StorageAPI.createProject({ name, entity, location: ubicacion });
    window.location.href = `proyecto-detalle.html?projectId=${encodeURIComponent(p.id)}`;
  });

  UI.qs("#search")?.addEventListener("input", renderProjects);

  UI.qs("#btnInstallBase")?.addEventListener("click", ()=> UI.qs("#fileBase")?.click());

  UI.qs("#fileBase")?.addEventListener("change", async (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;
    try{
      alert("Importando base... (puede tardar un poco)");
      const meta = await APUBase.installFromFile(f);
      alert(`Base instalada OK.\nItems: ${meta.counts?.items || 0}\nCD lines: ${meta.counts?.cdLines||0}\nInsumos: ${meta.counts?.insumos||0}\nSubproductos: ${meta.counts?.subLines||0}`);
      await renderKpis();
    }catch(err){
      alert("Error instalando base: " + (err?.message || err));
    }finally{
      e.target.value = "";
    }
  });

  UI.qs("#btnExport")?.addEventListener("click", ()=>{
    const { url, filename } = StorageAPI.exportBackup();
    UI.downloadBlobUrl(url, filename);
  });

  UI.qs("#fileImport")?.addEventListener("change", async (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;
    try{
      await StorageAPI.importBackupFromFile(f);
      alert("Backup importado. Se recargará.");
      window.location.reload();
    }catch(err){
      alert("Error importando backup: " + err.message);
    }finally{
      e.target.value = "";
    }
  });

  UI.qs("#fileImportProject")?.addEventListener("change", async (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;
    try{
      const text = await f.text();
      const payload = JSON.parse(text);
      if(!payload || !payload.project) throw new Error("Archivo inválido. Falta 'project'.");

      const newProj = StorageAPI.importProjectAsNew(payload.project);

      const docs = Array.isArray(payload.docs) ? payload.docs : [];
      for(const d of docs){
        if(!d?.dataUrl) continue;
        const blob = await dataUrlToBlob(d.dataUrl);
        await DB.putFile({
          ownerType:"project",
          ownerId: newProj.id,
          kind:"doc_project",
          name: d.name || "archivo",
          mime: d.mime || blob.type || "application/octet-stream",
          size: Number(d.size || blob.size || 0),
          blob
        });
      }

      alert(`Proyecto importado OK.\nProyecto: ${newProj.name}\nAdjuntos: ${docs.length}`);
      await renderKpis();
      renderProjects();
    }catch(err){
      alert("Error importando proyecto: " + (err?.message || err));
    }finally{
      e.target.value = "";
    }
  });

  UI.qs("#btnReset")?.addEventListener("click", async ()=>{
    if(!confirm("¿Borrar TODO? (proyectos + documentos)")) return;

    const alsoBase = confirm("¿También deseas borrar la Base APU (IndexedDB)?\n\nOJO: tendrás que instalar el XLSX de nuevo.");
    const ps = StorageAPI.listProjects();
    for(const p of ps){
      await DB.deleteFilesByOwner("project", p.id).catch(()=>{});
    }
    StorageAPI.resetAll();

    if(alsoBase){
      try{
        await APUBase.deleteBaseDatabase();
      }catch(_){}
    }

    alert("Listo. Se recargará.");
    window.location.reload();
  });

  await renderKpis();
  renderProjects();
}

/* ---------- DETALLE PROYECTO ---------- */
async function renderDocs(projectId){
  const tbody = UI.qs("#tablaDocs tbody");
  const empty = UI.qs("#docsEmpty");
  if(!tbody) return;

  const all = await DB.listFilesByOwner("project", projectId);
  const docs = all.sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")));

  tbody.innerHTML = docs.map(d=>`
    <tr>
      <td>${UI.esc(d.name||"")}</td>
      <td>${UI.esc(d.mime||"")}</td>
      <td>${UI.esc(UI.fmtBytes(d.size||0))}</td>
      <td>${UI.esc((d.createdAt||"").slice(0,10))}</td>
      <td class="row" style="gap:8px">
        <button class="btn" type="button" data-dl="${d.id}">Descargar</button>
        <button class="btn danger" type="button" data-del="${d.id}">Eliminar</button>
      </td>
    </tr>
  `).join("");

  if(empty) empty.style.display = docs.length ? "none" : "";

  document.querySelectorAll("[data-dl]").forEach(btn=>{
    btn.addEventListener("click", ()=> UI.downloadFileFromIDB(btn.getAttribute("data-dl")));
  });

  document.querySelectorAll("[data-del]").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const id = btn.getAttribute("data-del");
      if(!confirm("¿Eliminar este documento?")) return;
      await DB.deleteFile(id).catch(()=>{});
      await renderDocs(projectId);
    });
  });
}
function renderProjectDetail(project){
  UI.qs("#projTitle") && (UI.qs("#projTitle").textContent = project.name);
  const budgetInfo = getBudgetModeInfo(project);
  UI.qs("#projSub") && (UI.qs("#projSub").textContent = `${project.entity || "—"} · ${project.location || "—"} · ${project.currency || "COP"} · Presupuesto activo: ${budgetInfo.label}`);

  const adminPct = pct(project, "adminPct", "aiuPct");
  const imprevPct = pct(project, "imprevPct", null);
  const utilPct = pct(project, "utilPct", null);
  const ivaUtilPct = pct(project, "ivaUtilPct", "ivaPct");

  const cmp = getBudgetComparison(project);

  const info = UI.qs("#cardInfo");
  if(info){
    info.innerHTML = `
      <div class="cardhead">
        <h2>${UI.esc(project.name)}</h2>
        <p class="muted small">Entidad: ${UI.esc(project.entity||"-")} · Ubicación: ${UI.esc(project.location||"-")} · Presupuesto activo: ${UI.esc(budgetInfo.label)}</p>
      </div>
      <div class="row" style="gap:8px; flex-wrap:wrap; margin-bottom:10px">
        ${getBudgetModeBadge(budgetInfo.mode)}
        ${projectHasOfficialBudget(project) ? UI.chip(`Base: ${UI.fmtMoney(cmp.tBase.total||0, project.currency||"COP")}`) : ""}
        ${projectHasOfficialBudget(project) ? UI.chip(`Oficial: ${UI.fmtMoney(cmp.tOfficial.total||0, project.currency||"COP")}`) : ""}
      </div>
      <div class="grid two">
        <div class="item"><div class="name">Administración</div><div class="muted small">${UI.esc(String(adminPct||0))}%</div></div>
        <div class="item"><div class="name">Imprevistos</div><div class="muted small">${UI.esc(String(imprevPct||0))}%</div></div>
        <div class="item"><div class="name">Utilidad</div><div class="muted small">${UI.esc(String(utilPct||0))}%</div></div>
        <div class="item"><div class="name">IVA s/Utilidad</div><div class="muted small">${UI.esc(String(ivaUtilPct||0))}%</div></div>
      </div>
    `;
  }

  const totals = totalsCompat(project);
  const k = UI.qs("#cardTotals");
  if(k){
    k.innerHTML = `
      <div class="card item"><div class="name">Ítems</div><div class="chips">${UI.chip(String((project.items||[]).length),"ok")}</div></div>
      <div class="card item"><div class="name">Costos directos</div><div class="chips">${UI.chip(UI.fmtMoney(totals.directo, project.currency||"COP"))}</div></div>
      <div class="card item"><div class="name">SUBTOTAL</div><div class="chips">${UI.chip(UI.fmtMoney(totals.subtotal||0, project.currency||"COP"))}</div></div>
      <div class="card item"><div class="name">VALOR TOTAL</div><div class="chips">${UI.chip(UI.fmtMoney(totals.total, project.currency||"COP"),"ok")}</div></div>
    `;
  }

  const rows = UI.qs("#totalsRows");
  if(rows){
    rows.innerHTML = `
      <div class="row space"><div class="name">TOTAL COSTOS DIRECTOS</div><div><b>${UI.fmtMoney(totals.directo, project.currency||"COP")}</b></div></div>

      <div class="row space"><div class="name">ADMINISTRACIÓN (${UI.esc(String(adminPct||0))}%)</div><div><b>${UI.fmtMoney(totals.admin||0, project.currency||"COP")}</b></div></div>
      <div class="row space"><div class="name">IMPREVISTOS (${UI.esc(String(imprevPct||0))}%)</div><div><b>${UI.fmtMoney(totals.imprev||0, project.currency||"COP")}</b></div></div>
      <div class="row space"><div class="name">UTILIDAD (${UI.esc(String(utilPct||0))}%)</div><div><b>${UI.fmtMoney(totals.util||0, project.currency||"COP")}</b></div></div>

      <hr class="sep">

      <div class="row space"><div class="name">SUBTOTAL</div><div><b>${UI.fmtMoney(totals.subtotal||0, project.currency||"COP")}</b></div></div>
      <div class="row space"><div class="name">IVA sobre Utilidad (${UI.esc(String(ivaUtilPct||0))}%)</div><div><b>${UI.fmtMoney(totals.ivaUtil||0, project.currency||"COP")}</b></div></div>

      <hr class="sep">
      <div class="row space"><div class="name">VALOR TOTAL</div><div><b>${UI.fmtMoney(totals.total, project.currency||"COP")}</b></div></div>
    `;
  }

  renderBudgetComparisonCard(project);
  renderBudgetIndirectComparison(project);
  renderBudgetChapterComparison(project);
  renderBudgetItemComparison(project);
  renderBudgetRiskTop(project);
  renderBudgetHistory(project);
}

function renderChaptersTable(project){
  const tbody = UI.qs("#capsBody");
  const empty = UI.qs("#capsEmpty");
  if(!tbody) return;

  const { groups } = Calc.groupByChapters(project);
  if(!groups.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  tbody.innerHTML = groups.map(g=>`
    <tr>
      <td><b>${UI.esc(g.chapterCode)}</b></td>
      <td>${UI.esc(g.chapterName||"")}</td>
      <td style="text-align:right">${UI.esc(String(g.itemsCount))}</td>
      <td style="text-align:right"><b>${UI.fmtMoney(g.subtotal, project.currency||"COP")}</b></td>
    </tr>
  `).join("");
}

/* =========================
   ✅ NUEVO: render + bind capítulos manuales
   ========================= */
function renderProjectChaptersUI(project){
  const tbody = UI.qs("#projectChaptersBody");
  const empty = UI.qs("#projectChaptersEmpty");
  if(!tbody) return;

  ensureProjectChapters(project);

  if(!project.chapters.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  tbody.innerHTML = project.chapters
    .slice()
    .sort((a,b)=>{
      const na = Number(a.chapterCode), nb = Number(b.chapterCode);
      if(Number.isFinite(na) && Number.isFinite(nb)) return na-nb;
      return String(a.chapterCode).localeCompare(String(b.chapterCode));
    })
    .map(c=>`
      <tr>
        <td><b>${UI.esc(c.chapterCode||"")}</b></td>
        <td>${UI.esc(c.chapterName||"")}</td>
        <td class="row" style="gap:8px">
          <button class="btn" type="button" data-editchap="${UI.esc(c.id)}">Editar</button>
          <button class="btn danger" type="button" data-delchap="${UI.esc(c.id)}">Eliminar</button>
        </td>
      </tr>
    `).join("");

  tbody.querySelectorAll("[data-delchap]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-delchap");
      const fresh = StorageAPI.getProjectById(project.id);
      if(!fresh) return;

      ensureProjectChapters(fresh);

      const c = fresh.chapters.find(x=>x.id===id);
      if(!c) return;

      if(!confirm(`¿Eliminar el capítulo ${c.chapterCode} - ${c.chapterName}?`)) return;

      const next = fresh.chapters.filter(x=>x.id!==id);
      StorageAPI.updateProject(fresh.id, { chapters: next });

      const updated = StorageAPI.getProjectById(fresh.id);
      refreshProjectBudgetAwareUI(updated.id);
    });
  });

  tbody.querySelectorAll("[data-editchap]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-editchap");
      const fresh = StorageAPI.getProjectById(project.id);
      if(!fresh) return;

      ensureProjectChapters(fresh);
      const c = fresh.chapters.find(x=>x.id===id);
      if(!c) return;

      const inpCode = UI.qs("#projChapterCode");
      const inpName = UI.qs("#projChapterName");
      const hid = UI.qs("#projChapterEditId");

      if(inpCode) inpCode.value = c.chapterCode || "";
      if(inpName) inpName.value = c.chapterName || "";
      if(hid) hid.value = c.id || "";
    });
  });
}

/* ============================================================
   ✅ FIX: “Agregar capítulo” funcionando por submit + click
   ============================================================ */
function bindProjectChaptersUI(projectId){
  const form = UI.qs("#formProjectChapter");
  const inpCode = UI.qs("#projChapterCode");
  const inpName = UI.qs("#projChapterName");
  const hid = UI.qs("#projChapterEditId");
  const btnClear = UI.qs("#btnClearProjectChapterForm");
  const btnAdd = UI.qs("#btnAddProjectChapter");

  if(!form || !inpCode || !inpName) return;

  function clearForm(){
    inpCode.value = "";
    inpName.value = "";
    if(hid) hid.value = "";
  }
  btnClear?.addEventListener("click", clearForm);

  function saveChapter(){
    const fresh = StorageAPI.getProjectById(projectId);
    if(!fresh) return;

    ensureProjectChapters(fresh);

    const chapterCode = String(inpCode.value||"").trim();
    const chapterName = String(inpName.value||"").trim();

    if(!chapterCode){
      alert("Escribe el número del capítulo.");
      return;
    }
    if(!/^\d+$/.test(chapterCode)){
      alert("El número de capítulo debe ser numérico (ej: 1, 2, 10).");
      return;
    }
    if(!chapterName){
      alert("Escribe el nombre del capítulo.");
      return;
    }

    const editId = String(hid?.value||"").trim();

    const dup = fresh.chapters.find(x=>x.chapterCode===chapterCode && x.id!==editId);
    if(dup){
      alert(`Ya existe el capítulo ${chapterCode}. Edita el existente.`);
      return;
    }

    let next = fresh.chapters.slice();
    if(editId){
      next = next.map(x => x.id===editId ? ({...x, chapterCode, chapterName}) : x);
    }else{
      next.push({ id: makeId("chap"), chapterCode, chapterName });
    }

    StorageAPI.updateProject(projectId, { chapters: next });

    const updated = StorageAPI.getProjectById(projectId);
    clearForm();
    refreshProjectBudgetAwareUI(updated.id);
  }

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    saveChapter();
  });

  btnAdd?.addEventListener("click", (e)=>{
    e.preventDefault();
    saveChapter();
  });

  [inpCode, inpName].forEach(inp=>{
    inp.addEventListener("keydown", (e)=>{
      if(e.key === "Enter"){
        e.preventDefault();
        saveChapter();
      }
    });
  });
}

/* =========================
   ✅ NUEVO: Modal agregar APU con capítulo
   ========================= */
let __addApuModalState = {
  projectId: "",
  apu: null
};

function openAddApuModal(project, apu){
  const modal = UI.qs("#addApuModal");
  if(!modal) {
    const qtyOld = Number(prompt("Cantidad del ítem:", "1") || "0");
    if(!qtyOld) return;

    StorageAPI.addItem(project.id, {
      chapterCode: apu.chapterCode || "",
      chapterName: apu.chapterName || "",
      code: apu.code,
      apuRefCode: apu.code,
      desc: apu.desc,
      unit: apu.unit,
      pu: Number(apu.pu||0),
      qty: qtyOld
    });

    const fresh = StorageAPI.getProjectById(project.id);
    refreshProjectBudgetAwareUI(fresh.id);
    alert("Ítem agregado al presupuesto.");
    return;
  }

  __addApuModalState.projectId = project.id;
  __addApuModalState.apu = apu;

  UI.qs("#addApuCode") && (UI.qs("#addApuCode").value = String(apu.code||""));
  UI.qs("#addApuUnit") && (UI.qs("#addApuUnit").value = String(apu.unit||""));
  UI.qs("#addApuDesc") && (UI.qs("#addApuDesc").value = String(apu.desc||""));
  UI.qs("#addApuQty") && (UI.qs("#addApuQty").value = "1");
  UI.qs("#addApuRawJson") && (UI.qs("#addApuRawJson").value = JSON.stringify(apu||{}));

  refreshAddApuModalChapterOptions(project);

  modal.style.display = "";
}


/* =========================
   ✅ NUEVO: Indirectos por tabla (UI jerárquica)
   - Soporta modo manual / tabla
   - Subtítulos y sub-subtítulos por numeración (1, 1.2, 1.2.1...)
   - Líneas de detalle bajo cada subtítulo
   - Guarda en project.indirectMode + project.indirectTable
   ========================= */
function safeNumInput(v){
  const n = Number(String(v ?? "").replaceAll(",","").trim());
  return Number.isFinite(n) ? n : 0;
}

function normalizeIndirectModeValue(v){
  return String(v || "manual").trim().toLowerCase() === "table" ? "table" : "manual";
}

function normalizeIndirectGroupValue(v){
  const s = String(v || "OTRO").trim().toUpperCase();
  if(["ADMIN","IMPREV","UTIL","OTRO"].includes(s)) return s;
  return "OTRO";
}

function normalizeIndirectItemCode(v){
  return String(v || "").trim().replace(/\s+/g, "");
}

function indirectItemLevel(item){
  const code = normalizeIndirectItemCode(item);
  if(!code) return 0;
  return code.split(".").filter(Boolean).length - 1;
}

function indirectSegments(item){
  return normalizeIndirectItemCode(item)
    .split(".")
    .filter(Boolean)
    .map(x => /^\d+$/.test(x) ? Number(x) : x);
}

function compareIndirectItemCodes(a, b){
  const aa = indirectSegments(a);
  const bb = indirectSegments(b);
  const len = Math.max(aa.length, bb.length);
  for(let i=0;i<len;i++){
    const av = aa[i];
    const bv = bb[i];
    if(av === undefined) return -1;
    if(bv === undefined) return 1;
    const an = typeof av === "number";
    const bn = typeof bv === "number";
    if(an && bn && av !== bv) return av - bv;
    const as = String(av);
    const bs = String(bv);
    if(as !== bs) return as.localeCompare(bs, "es", { numeric:true, sensitivity:"base" });
  }
  return 0;
}

function normalizeIndirectUiRow(row){
  const r = row || {};
  const rowType = String(r.rowType || "").trim().toLowerCase() === "header" ? "header" : "detail";

  let sourceType = String(r.sourceType || "manual").trim().toLowerCase();
  if(!["manual","insumo","subproducto","percent_cd"].includes(sourceType)){
    sourceType = "manual";
  }

  let calcType = String(r.calcType || "").trim().toLowerCase() === "percent_direct" ? "percent_direct" : "fixed";
  if(sourceType === "percent_cd"){
    calcType = "percent_direct";
  }

  const out = {
    id: String(r.id || makeId("ind")).trim(),
    rowType,
    item: normalizeIndirectItemCode(r.item),
    group: normalizeIndirectGroupValue(r.group || (rowType === "header" ? "OTRO" : "ADMIN")),
    desc: String(r.desc || "").trim(),
    unit: String(r.unit || "").trim(),
    qty: safeNumInput(r.qty),
    unitValue: safeNumInput(r.unitValue),
    percent: safeNumInput(r.percent),
    calcType,
    partial: safeNumInput(r.partial),
    sourceType,
    sourceRef: String(r.sourceRef || "").trim(),
    sourceLabel: String(r.sourceLabel || "").trim()
  };

  if(out.rowType === "header"){
    out.sourceType = "manual";
    out.sourceRef = "";
    out.sourceLabel = "";
    out.unit = "";
    out.qty = 0;
    out.unitValue = 0;
    out.percent = 0;
    out.calcType = "fixed";
    return out;
  }

  if(out.sourceType === "percent_cd"){
    out.unit = "%CD";
    out.qty = 1;
    out.calcType = "percent_direct";
  }

  return out;
}

function ensureProjectIndirectConfig(project){
  const p = project || {};
  p.indirectMode = normalizeIndirectModeValue(p.indirectMode || "manual");
  p.indirectTable = Array.isArray(p.indirectTable) ? p.indirectTable.map(normalizeIndirectUiRow) : [];
  p.indirectTable.sort((a,b)=>{
    const c = compareIndirectItemCodes(a.item, b.item);
    if(c !== 0) return c;
    if(a.rowType !== b.rowType) return a.rowType === "header" ? -1 : 1;
    return String(a.desc||"").localeCompare(String(b.desc||""), "es", { sensitivity:"base" });
  });
  return p;
}

function getIndirectRows(project){
  const p = project || {};
  let source = p;

  try{
    const activeMode =
      (window.StorageAPI && typeof StorageAPI.getProjectActiveBudgetMode === "function")
        ? StorageAPI.getProjectActiveBudgetMode(p?.id)
        : (p?.activeBudget || "base");

    if(p?.id && typeof getProjectViewForBudget === "function"){
      const view = getProjectViewForBudget(p, activeMode);
      if(view) source = view;
    }
  }catch(_){}

  return ensureProjectIndirectConfig(source).indirectTable.slice();
}

function saveIndirectRows(projectId, rows){
  const cleaned = (Array.isArray(rows) ? rows : []).map(normalizeIndirectUiRow);
  cleaned.sort((a,b)=>{
    const c = compareIndirectItemCodes(a.item, b.item);
    if(c !== 0) return c;
    if(a.rowType !== b.rowType) return a.rowType === "header" ? -1 : 1;
    return String(a.desc||"").localeCompare(String(b.desc||""), "es", { sensitivity:"base" });
  });

  const fresh = StorageAPI.getProjectById(projectId);
  if(
    fresh &&
    fresh.budgets &&
    typeof buildProjectPatchFromBudgetState === "function"
  ){
    const activeMode =
      (window.StorageAPI && typeof StorageAPI.getProjectActiveBudgetMode === "function")
        ? StorageAPI.getProjectActiveBudgetMode(projectId)
        : (fresh.activeBudget || "base");

    const branch =
      (window.StorageAPI && typeof StorageAPI.getProjectBudget === "function")
        ? (StorageAPI.getProjectBudget(projectId, activeMode) || makeBudgetBranchFromProjectView(fresh))
        : makeBudgetBranchFromProjectView(fresh);

    branch.indirectTable = cleaned;
    const patch = buildProjectPatchFromBudgetState(fresh, activeMode, branch);
    StorageAPI.updateProject(projectId, patch);
    return cleaned;
  }

  StorageAPI.updateProject(projectId, { indirectTable: cleaned });
  return cleaned;
}

function makeIndirectRow(rowType="detail", group="ADMIN", item=""){
  if(String(rowType).toLowerCase() === "header"){
    return normalizeIndirectUiRow({
      id: makeId("ind"),
      rowType: "header",
      item,
      group,
      desc: "",
      unit: "",
      qty: 0,
      unitValue: 0,
      percent: 0,
      calcType: "fixed"
    });
  }
  return normalizeIndirectUiRow({
    id: makeId("ind"),
    rowType: "detail",
    item,
    group,
    desc: "",
    unit: "MES",
    qty: 1,
    unitValue: 0,
    percent: 0,
    calcType: "fixed"
  });
}

function calcIndirectRowPartial(row, directo){
  const r = normalizeIndirectUiRow(row);
  if(r.rowType === "header") return 0;
  if(r.calcType === "percent_direct"){
    return Number(directo || 0) * (Number(r.percent || 0) / 100);
  }
  return Number(r.qty || 0) * Number(r.unitValue || 0);
}

function summarizeIndirectUi(project){
  const fresh = ensureProjectIndirectConfig(project);
  const totals = totalsCompat(fresh);
  const calcRaw = (window.Calc && typeof Calc.calcTotals === "function")
    ? (Calc.calcTotals(fresh) || {})
    : {};

  const indirectTotal =
    Number(totals.admin || 0) +
    Number(totals.imprev || 0) +
    Number(totals.util || 0) +
    Number(totals.indirectOthers || 0);

  const directo = Number(totals.directo || 0);
  const totalPct = directo > 0 ? (indirectTotal / directo) * 100 : 0;

  const adminPct = Number(
    calcRaw.adminPct ??
    (directo > 0 ? (Number(totals.admin || 0) / directo) * 100 : 0)
  );

  const imprevPct = Number(
    calcRaw.imprevPct ??
    (directo > 0 ? (Number(totals.imprev || 0) / directo) * 100 : 0)
  );

  const utilPct = Number(
    calcRaw.utilPct ??
    (directo > 0 ? (Number(totals.util || 0) / directo) * 100 : 0)
  );

  const othersPct = Number(
    calcRaw.indirectOthersPct ??
    (directo > 0 ? (Number(totals.indirectOthers || 0) / directo) * 100 : 0)
  );

  return {
    totals,
    indirectTotal,
    totalPct,
    adminPct,
    imprevPct,
    utilPct,
    othersPct
  };
}

function ensureIndirectTableMount(form){
  if(!form) return null;

  // ✅ Si el HTML actual ya trae el bloque de indirectos, reutilizarlo.
  const existingWrap = UI.qs("#tableIndirectWrap");
  const existingBody = UI.qs("#indirectTableBody");
  const existingMode = UI.qs("#indirectMode");
  if(existingWrap && existingBody && existingMode){
    existingWrap.setAttribute("data-mounted","1");
    return existingWrap;
  }

  let host = UI.qs("#indirectTableMount");
  if(host) return host;

  host = document.createElement("div");
  host.id = "indirectTableMount";
  host.className = "card";
  host.style.marginTop = "14px";

  host.innerHTML = `
    <div class="cardhead">
      <h2>Cuadro de costos indirectos</h2>
      <p class="muted small">Modo jerárquico con subtítulos, sub-subtítulos y líneas por numeración. Cada línea puede ser manual, desde insumo, desde subproducto o por %CD.</p>
    </div>

    <div class="grid two" style="margin-bottom:12px">
      <label>
        <div class="muted small">Modo de cálculo de indirectos</div>
        <select id="indirectModeSel" class="input">
          <option value="manual">Manual</option>
          <option value="table">Por tabla de indirectos</option>
        </select>
      </label>
      <div id="indirectModeHint" class="card item">
        <div class="name">Observación</div>
        <div class="muted small">Crea subtítulos tipo 1, 1.2, 1.2.1. En las líneas puedes escoger origen manual, insumo, subproducto o %CD del proyecto.</div>
      </div>
    </div>

    <div id="indirectTableWrap" style="display:none">
      <div class="row" style="gap:8px; flex-wrap:wrap; margin-bottom:10px">
        <button type="button" class="btn primary" id="btnIndirectAddLine">Agregar línea</button>
        <button type="button" class="btn" id="btnIndirectAddHeader">Agregar subtítulo</button>
      </div>

      <div style="overflow:auto">
        <table class="table">
          <thead>
            <tr>
              <th style="min-width:100px">ÍTEM</th>
              <th style="min-width:120px">GRUPO</th>
              <th style="min-width:320px">DESCRIPCIÓN</th>
              <th style="min-width:100px">UNIDAD</th>
              <th style="min-width:110px">CANTIDAD</th>
              <th style="min-width:150px">VR UNITARIO</th>
              <th style="min-width:120px">% DIRECTO</th>
              <th style="min-width:150px">ORIGEN</th>
              <th style="min-width:150px">VR PARCIAL</th>
              <th style="min-width:150px">ACCIÓN</th>
            </tr>
          </thead>
          <tbody id="indirectTableBody"></tbody>
        </table>
      </div>

      <div id="indirectTableEmpty" class="muted small" style="display:none; margin-top:10px">
        Aún no hay líneas. Usa “Agregar subtítulo” y “Agregar línea”.
      </div>

      <div id="indirectSummary" class="card item" style="margin-top:12px"></div>
    </div>
  `;

  form.appendChild(host);
  return host;
}

function setIndirectManualInputsDisabled(form, disabled){
  if(!form) return;
  ["adminPct","imprevPct","utilPct"].forEach(name=>{
    const inp = form[name];
    if(inp) inp.disabled = !!disabled;
  });
}

function readIndirectRowsFromDom(){
  const tbody = UI.qs("#indirectTableBody");
  if(!tbody) return [];

  return Array.from(tbody.querySelectorAll("tr[data-indirect-id]")).map(tr=>{
    const rowType = String(tr.getAttribute("data-row-type") || "detail").toLowerCase();
    const getVal = (field)=> tr.querySelector(`[data-field="${field}"]`)?.value || "";
    if(rowType === "header"){
      return normalizeIndirectUiRow({
        id: tr.getAttribute("data-indirect-id") || makeId("ind"),
        rowType,
        item: tr.getAttribute("data-item-code") || "",
        group: tr.getAttribute("data-group-code") || "OTRO",
        desc: tr.getAttribute("data-desc-text") || ""
      });
    }
    return normalizeIndirectUiRow({
      id: tr.getAttribute("data-indirect-id") || makeId("ind"),
      rowType,
      item: getVal("item"),
      group: getVal("group"),
      desc: getVal("desc"),
      unit: getVal("unit"),
      qty: getVal("qty"),
      unitValue: getVal("unitValue"),
      percent: getVal("percent"),
      calcType: getVal("calcType"),
      sourceType: getVal("sourceType"),
      sourceRef: tr.getAttribute("data-source-ref") || "",
      sourceLabel: tr.getAttribute("data-source-label") || ""
    });
  });
}

function refreshProjectComputedViews(projectId){
  const fresh = StorageAPI.getProjectById(projectId);
  if(!fresh) return;
  refreshProjectBudgetAwareUI(fresh.id);
}

function persistIndirectRowsFromDom(projectId){
  const rows = readIndirectRowsFromDom();
  saveIndirectRows(projectId, rows);
  refreshProjectComputedViews(projectId);
  renderIndirectRows(projectId);
}

function renderIndirectRows(projectId){
  const project = StorageAPI.getProjectById(projectId);
  if(!project) return;

  ensureProjectIndirectConfig(project);

  const tbody = UI.qs("#indirectTableBody");
  const empty = UI.qs("#indirectTableEmpty");
  const wrap = UI.qs("#indirectTableWrap") || UI.qs("#tableIndirectWrap");
  const sel = UI.qs("#indirectModeSel") || UI.qs("#indirectMode");
  const form = UI.qs("#formAjustes");

  if(!tbody || !wrap || !sel || !form) return;

  const mode = normalizeIndirectModeValue(project.indirectMode || "manual");
  sel.value = mode;
  wrap.style.display = mode === "table" ? "" : "none";
  setIndirectManualInputsDisabled(form, mode === "table");

  const rows = getIndirectRows(project);
  const directo = Number(totalsCompat(project).directo || 0);

  if(!rows.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = mode === "table" ? "" : "none";
    renderIndirectSummary(projectId);
    return;
  }

  if(empty) empty.style.display = "none";

  tbody.innerHTML = rows.map(row=>{
    const r = normalizeIndirectUiRow(row);
    const partial = calcIndirectRowPartial(r, directo);
    const level = indirectItemLevel(r.item);
    const indent = Math.max(0, level * 18);
    const sourceLabel = r.sourceLabel || (
      r.sourceType === "manual" ? "Manual" :
      r.sourceType === "insumo" ? "Insumo" :
      r.sourceType === "subproducto" ? "Subproducto" :
      "%CD"
    );

    if(r.rowType === "header"){
      return `
        <tr
          data-indirect-id="${UI.esc(r.id)}"
          data-row-type="header"
          data-item-code="${UI.esc(r.item)}"
          data-group-code="${UI.esc(r.group)}"
          data-desc-text="${UI.esc(r.desc)}"
          class="indirect-header-row"
        >
          <td><div class="chip"><b>${UI.esc(r.item || "—")}</b></div></td>
          <td><div class="chip">${UI.esc(r.group || "OTRO")}</div></td>
          <td colspan="5">
            <div style="margin-left:${indent}px; font-weight:700; letter-spacing:.2px; padding:10px 12px; border:1px solid var(--border); border-radius:14px; background:rgba(255,255,255,.04)">
              ${UI.esc(r.desc || "SUBTÍTULO")}
            </div>
            <div class="muted small" style="margin-top:6px; margin-left:${indent}px">Subtítulo (no calcula)</div>
          </td>
          <td><div class="chip">Jerarquía</div></td>
          <td data-role="partial" style="text-align:right"><b>${UI.fmtMoney(0, project.currency||"COP")}</b></td>
          <td>
            <div class="row" style="gap:8px; flex-wrap:wrap">
              <button type="button" class="btn" data-indirect-edit="${UI.esc(r.id)}">Editar</button>
              <button type="button" class="btn danger" data-indirect-del="${UI.esc(r.id)}">Quitar</button>
            </div>
          </td>
        </tr>
      `;
    }

    const isPercentCd = r.sourceType === "percent_cd";
    const unitVal = isPercentCd ? String(directo || 0) : String(r.unitValue || 0);
    const sourceControl = `
      <select class="input" data-field="sourceType">
        <option value="manual" ${r.sourceType==="manual"?"selected":""}>Manual</option>
        <option value="insumo" ${r.sourceType==="insumo"?"selected":""}>Insumo</option>
        <option value="subproducto" ${r.sourceType==="subproducto"?"selected":""}>Subproducto</option>
        <option value="percent_cd" ${r.sourceType==="percent_cd"?"selected":""}>%CD</option>
      </select>
      <div class="muted small" style="margin-top:6px">${UI.esc(sourceLabel)}</div>
    `;

    const actionButtons = `
      <div class="row" style="gap:8px; flex-wrap:wrap">
        ${(r.sourceType === "insumo" || r.sourceType === "subproducto") ? `<button type="button" class="btn" data-indirect-pick="${UI.esc(r.id)}">Base</button>` : ""}
        <button type="button" class="btn" data-indirect-edit-detail="${UI.esc(r.id)}">Editar</button>
        <button type="button" class="btn primary" data-indirect-save="${UI.esc(r.id)}">Guardar</button>
        <button type="button" class="btn danger" data-indirect-del="${UI.esc(r.id)}">Quitar</button>
      </div>
    `;

    return `
      <tr
        data-indirect-id="${UI.esc(r.id)}"
        data-row-type="detail"
        data-source-ref="${UI.esc(r.sourceRef || "")}"
        data-source-label="${UI.esc(r.sourceLabel || "")}"
      >
        <td><input class="input" data-field="item" value="${UI.esc(r.item)}" placeholder="1.2.1.1"></td>
        <td>
          <select class="input" data-field="group">
            <option value="ADMIN" ${r.group==="ADMIN"?"selected":""}>ADMIN</option>
            <option value="IMPREV" ${r.group==="IMPREV"?"selected":""}>IMPREV</option>
            <option value="UTIL" ${r.group==="UTIL"?"selected":""}>UTIL</option>
            <option value="OTRO" ${r.group==="OTRO"?"selected":""}>OTRO</option>
          </select>
        </td>
        <td>
          <div style="margin-left:${indent}px">
            <input class="input" data-field="desc" value="${UI.esc(r.desc)}" placeholder="Descripción" >
          </div>
        </td>
        <td><input class="input" data-field="unit" value="${UI.esc(isPercentCd ? "%CD" : r.unit)}" placeholder="MES" ></td>
        <td><input class="input" data-field="qty" type="number" step="any" value="${UI.esc(String(isPercentCd ? 1 : (r.qty||0)))}" ${isPercentCd ? "readonly" : ""}></td>
        <td><input class="input" data-field="unitValue" type="number" step="any" value="${UI.esc(unitVal)}" ></td>
        <td>
          <div class="row" style="gap:6px; flex-wrap:wrap">
            <select class="input" data-field="calcType" style="min-width:120px" ${isPercentCd ? "disabled" : ""}>
              <option value="fixed" ${r.calcType==="fixed"?"selected":""}>Cantidad</option>
              <option value="percent_direct" ${r.calcType==="percent_direct"?"selected":""}>% directo</option>
            </select>
            <input class="input" data-field="percent" type="number" step="any" value="${UI.esc(String(r.percent||0))}" style="min-width:90px">
          </div>
        </td>
        <td>${sourceControl}</td>
        <td data-role="partial" style="text-align:right"><b>${UI.fmtMoney(partial, project.currency||"COP")}</b></td>
        <td>${actionButtons}</td>
      </tr>
    `;
  }).join("");

  renderIndirectSummary(projectId);
}

function renderSingleIndirectRowPreview(tr, projectId){
  if(!tr) return;
  const project = StorageAPI.getProjectById(projectId);
  if(!project) return;
  const rowType = String(tr.getAttribute("data-row-type") || "detail").toLowerCase();
  if(rowType !== "detail") return;

  const directo = Number(totalsCompat(project).directo || 0);
  const sourceType = tr.querySelector('[data-field="sourceType"]')?.value || "manual";
  const row = normalizeIndirectUiRow({
    id: tr.getAttribute("data-indirect-id") || makeId("ind"),
    rowType,
    item: tr.querySelector('[data-field="item"]')?.value || "",
    group: tr.querySelector('[data-field="group"]')?.value || "OTRO",
    desc: tr.querySelector('[data-field="desc"]')?.value || "",
    unit: tr.querySelector('[data-field="unit"]')?.value || "",
    qty: tr.querySelector('[data-field="qty"]')?.value || 0,
    unitValue: sourceType === "percent_cd" ? directo : (tr.querySelector('[data-field="unitValue"]')?.value || 0),
    percent: tr.querySelector('[data-field="percent"]')?.value || 0,
    calcType: tr.querySelector('[data-field="calcType"]')?.value || "fixed",
    sourceType,
    sourceRef: tr.getAttribute("data-source-ref") || "",
    sourceLabel: tr.getAttribute("data-source-label") || ""
  });

  if(sourceType === "percent_cd"){
    const unitInp = tr.querySelector('[data-field="unit"]');
    const qtyInp = tr.querySelector('[data-field="qty"]');
    const uvInp = tr.querySelector('[data-field="unitValue"]');
    const calcSel = tr.querySelector('[data-field="calcType"]');
    if(unitInp) unitInp.value = "%CD";
    if(qtyInp) qtyInp.value = "1";
    if(uvInp) uvInp.value = String(directo || 0);
    if(calcSel) calcSel.value = "percent_direct";
  }

  const partial = calcIndirectRowPartial(row, directo);
  const partialTd = tr.querySelector('[data-role="partial"]');
  if(partialTd){
    partialTd.innerHTML = `<b>${UI.fmtMoney(partial, project.currency||"COP")}</b>`;
  }
}

function promptIndirectGroup(defaultValue="ADMIN"){
  const raw = prompt("Grupo (ADMIN / IMPREV / UTIL / OTRO):", defaultValue) ?? defaultValue;
  return normalizeIndirectGroupValue(raw);
}

function updateIndirectRowById(projectId, rowId, updater){
  const fresh = StorageAPI.getProjectById(projectId);
  if(!fresh) return null;
  const rows = getIndirectRows(fresh);
  const idx = rows.findIndex(x => String(x.id) === String(rowId));
  if(idx < 0) return null;
  const next = normalizeIndirectUiRow(typeof updater === "function" ? updater(rows[idx]) : rows[idx]);
  rows[idx] = next;
  saveIndirectRows(projectId, rows);
  return next;
}

async function pickIndirectResourceFromBase(projectId, rowId, sourceType){
  if(!window.APUBase || typeof APUBase.getMeta !== "function"){
    alert("La base APU no está disponible.");
    return;
  }

  let meta = null;
  try{ meta = await APUBase.getMeta(); }catch(_){}
  if(!meta){
    alert("Primero instala la Base APU (XLSX) desde Proyectos.");
    return;
  }

  const type = String(sourceType || "").trim().toLowerCase();
  if(type !== "insumo" && type !== "subproducto"){
    alert("Escoge primero origen: Insumo o Subproducto.");
    return;
  }

  const term = String(prompt(`Buscar ${type === "insumo" ? "insumo" : "subproducto"} en base:`, "") || "").trim();
  if(!term) return;

  if(type === "insumo"){
    let rows = [];
    try{
      rows = await APUBase.listInsumos(term);
    }catch(err){
      alert("Error consultando insumos: " + (err?.message || err));
      return;
    }
    rows = (rows || []).slice(0, 12);
    if(!rows.length){
      alert("No se encontraron insumos para esa búsqueda.");
      return;
    }

    const menu = rows.map((r, i)=>`${i+1}) ${r.tipo || "-"} | ${r.desc || ""} | ${r.unit || ""} | ${UI.fmtMoney(r.pu || 0, "COP")}`).join("\n");
    const pick = Number(prompt(`Selecciona el insumo:\n\n${menu}`, "1") || "0");
    if(!(pick >= 1 && pick <= rows.length)) return;

    const sel = rows[pick - 1];
    updateIndirectRowById(projectId, rowId, (cur)=>({
      ...cur,
      sourceType: "insumo",
      sourceRef: String(sel.code || sel.id || sel.desc || "").trim(),
      sourceLabel: `Insumo: ${String(sel.desc || "").trim()}`,
      desc: String(sel.desc || cur.desc || "").trim(),
      unit: String(sel.unit || cur.unit || "").trim(),
      unitValue: Number(sel.pu || 0),
      qty: Number(cur.qty || 1) || 1,
      calcType: "fixed"
    }));
    renderIndirectRows(projectId);
    return;
  }

  let list = [];
  try{
    list = await APUBase.listSubproductos();
  }catch(err){
    alert("Error consultando subproductos: " + (err?.message || err));
    return;
  }
  const q = term.toLowerCase();
  list = (list || []).filter(x =>
    String(x.subName || "").toLowerCase().includes(q) ||
    String(x.subKey || "").toLowerCase().includes(q)
  ).slice(0, 12);

  if(!list.length){
    alert("No se encontraron subproductos para esa búsqueda.");
    return;
  }

  const menu = list.map((r, i)=>`${i+1}) ${r.subName || ""} | ${r.subKey || ""}`).join("\n");
  const pick = Number(prompt(`Selecciona el subproducto:\n\n${menu}`, "1") || "0");
  if(!(pick >= 1 && pick <= list.length)) return;

  const sel = list[pick - 1];
  let subApu = null;
  try{
    subApu = await APUBase.getSubAPU(sel.subKey);
  }catch(err){
    alert("Error leyendo subproducto: " + (err?.message || err));
    return;
  }
  const directCost = Number(subApu?.directo || 0);

  updateIndirectRowById(projectId, rowId, (cur)=>({
    ...cur,
    sourceType: "subproducto",
    sourceRef: String(sel.subKey || "").trim(),
    sourceLabel: `Subproducto: ${String(sel.subName || sel.subKey || "").trim()}`,
    desc: String(sel.subName || cur.desc || "").trim(),
    unit: String(subApu?.unit || cur.unit || "GLB").trim(),
    unitValue: directCost,
    qty: Number(cur.qty || 1) || 1,
    calcType: "fixed"
  }));
  renderIndirectRows(projectId);
}

function applyIndirectSourceTypeToRow(projectId, rowId, sourceType){
  const project = StorageAPI.getProjectById(projectId);
  if(!project) return;

  const directo = Number(totalsCompat(project).directo || 0);

  updateIndirectRowById(projectId, rowId, (cur)=>{
    const row = normalizeIndirectUiRow({ ...cur, sourceType });
    if(row.sourceType === "manual"){
      row.sourceRef = "";
      row.sourceLabel = "";
      if(row.unit === "%CD") row.unit = "";
      if(row.calcType !== "percent_direct") row.calcType = "fixed";
      return row;
    }
    if(row.sourceType === "percent_cd"){
      row.sourceRef = "__CD__";
      row.sourceLabel = "Costo Directo del proyecto";
      row.unit = "%CD";
      row.qty = 1;
      row.unitValue = directo;
      row.calcType = "percent_direct";
      return row;
    }
    row.sourceRef = "";
    row.sourceLabel = "";
    row.calcType = "fixed";
    return row;
  });

  renderIndirectRows(projectId);
}

function promptCreateIndirectHeader(projectId){
  const fresh = StorageAPI.getProjectById(projectId);
  if(!fresh) return;

  const item = normalizeIndirectItemCode(prompt("Numeración del subtítulo:\nEj: 1.2 o 1.2.1", "") || "");
  if(!item) return;

  const group = promptIndirectGroup("ADMIN");
  const desc = String(prompt("Texto del subtítulo:", "") || "").trim();
  if(!desc) return;

  const rows = getIndirectRows(fresh);
  if(rows.some(x => normalizeIndirectItemCode(x.item) === item && x.rowType === "header")){
    alert(`Ya existe un subtítulo con la numeración ${item}.`);
    return;
  }

  const row = makeIndirectRow("header", group, item);
  row.desc = desc;
  rows.push(row);
  saveIndirectRows(projectId, rows);
  renderIndirectRows(projectId);
}

function promptCreateIndirectDetail(projectId){
  const fresh = StorageAPI.getProjectById(projectId);
  if(!fresh) return;

  const item = normalizeIndirectItemCode(prompt("Numeración de la línea:\nEj: 1.2.1.1", "") || "");
  if(!item) return;

  const group = promptIndirectGroup("ADMIN");
  const desc = String(prompt("Descripción de la línea:", "") || "").trim();
  const sourceType = String(prompt("Origen de la línea:\nmanual / insumo / subproducto / percent_cd", "manual") || "manual").trim().toLowerCase();

  const rows = getIndirectRows(fresh);
  const row = makeIndirectRow("detail", group, item);
  if(desc) row.desc = desc;
  row.sourceType = ["manual","insumo","subproducto","percent_cd"].includes(sourceType) ? sourceType : "manual";

  if(row.sourceType === "percent_cd"){
    const directo = Number(totalsCompat(fresh).directo || 0);
    row.unit = "%CD";
    row.qty = 1;
    row.unitValue = directo;
    row.calcType = "percent_direct";
    row.sourceRef = "__CD__";
    row.sourceLabel = "Costo Directo del proyecto";
  }

  rows.push(row);
  saveIndirectRows(projectId, rows);
  renderIndirectRows(projectId);
}

function editIndirectHeaderRow(projectId, rowId){
  const fresh = StorageAPI.getProjectById(projectId);
  if(!fresh) return;
  const rows = getIndirectRows(fresh);
  const idx = rows.findIndex(x => String(x.id) === String(rowId));
  if(idx < 0) return;

  const cur = normalizeIndirectUiRow(rows[idx]);
  const item = normalizeIndirectItemCode(prompt("Ítem / numeración del subtítulo:", cur.item || "") ?? cur.item);
  if(!item) return;
  const group = promptIndirectGroup(cur.group || "OTRO");
  const desc = String(prompt("Texto del subtítulo:", cur.desc || "") ?? cur.desc).trim();
  if(!desc) return;

  rows[idx] = normalizeIndirectUiRow({
    ...cur,
    rowType: "header",
    item,
    group,
    desc
  });

  saveIndirectRows(projectId, rows);
  renderIndirectRows(projectId);
}


function editIndirectDetailRow(projectId, rowId){
  const fresh = StorageAPI.getProjectById(projectId);
  if(!fresh) return;

  const rows = getIndirectRows(fresh);
  const idx = rows.findIndex(x => String(x.id) === String(rowId));
  if(idx < 0) return;

  const cur = normalizeIndirectUiRow(rows[idx]);
  if(cur.rowType !== "detail") return;

  const item = normalizeIndirectItemCode(prompt("Ítem / numeración de la línea:", cur.item || "") ?? cur.item);
  if(!item) return;

  const group = promptIndirectGroup(cur.group || "ADMIN");
  const desc = String(prompt("Descripción:", cur.desc || "") ?? cur.desc).trim();
  if(!desc) return;

  const unit = String(prompt("Unidad:", cur.unit || "") ?? cur.unit).trim();
  const qty = Number(prompt("Cantidad:", String(cur.qty || 0)) ?? cur.qty);
  const unitValue = Number(prompt("VR Unitario:", String(cur.unitValue || 0)) ?? cur.unitValue);
  const calcTypeRaw = String(prompt("Tipo de cálculo: fixed / percent_direct", cur.calcType || "fixed") ?? cur.calcType).trim().toLowerCase();
  const calcType = calcTypeRaw === "percent_direct" ? "percent_direct" : "fixed";
  const percent = Number(prompt("Porcentaje (% directo):", String(cur.percent || 0)) ?? cur.percent);
  const sourceTypeRaw = String(prompt("Origen: manual / insumo / subproducto / percent_cd", cur.sourceType || "manual") ?? cur.sourceType).trim().toLowerCase();
  const sourceType = ["manual","insumo","subproducto","percent_cd"].includes(sourceTypeRaw) ? sourceTypeRaw : "manual";

  rows[idx] = normalizeIndirectUiRow({
    ...cur,
    item,
    group,
    desc,
    unit,
    qty,
    unitValue,
    calcType,
    percent,
    sourceType
  });

  saveIndirectRows(projectId, rows);
  refreshProjectComputedViews(projectId);
  renderIndirectRows(projectId);
}


function renderIndirectSummary(projectId){
  const box = UI.qs("#indirectSummary");
  if(!box) return;

  const project = StorageAPI.getProjectById(projectId);
  if(!project) return;

  ensureProjectIndirectConfig(project);

  const s = summarizeIndirectUi(project);
  const totals = s.totals;
  const moneda = project.currency || "COP";

  const adminVal = Number(totals.admin || 0);
  const imprevVal = Number(totals.imprev || 0);
  const utilVal = Number(totals.util || 0);
  const otrosVal = Number(totals.indirectOthers || 0);

  box.innerHTML = `
    <div class="grid two">
      <div>
        <div class="row space"><div class="name">Total costos indirectos</div><div><b>${UI.fmtMoney(s.indirectTotal||0, moneda)}</b></div></div>
        <div class="row space"><div class="name">Porcentaje total costos directos</div><div><b>${Number(s.totalPct||0).toFixed(2)}%</b></div></div>
      </div>
      <div>
        <div class="row space"><div class="name">Administración</div><div><b>${UI.fmtMoney(adminVal, moneda)}</b> <span class="muted small">(${Number(s.adminPct||0).toFixed(2)}%)</span></div></div>
        <div class="row space"><div class="name">Imprevistos</div><div><b>${UI.fmtMoney(imprevVal, moneda)}</b> <span class="muted small">(${Number(s.imprevPct||0).toFixed(2)}%)</span></div></div>
        <div class="row space"><div class="name">Utilidad</div><div><b>${UI.fmtMoney(utilVal, moneda)}</b> <span class="muted small">(${Number(s.utilPct||0).toFixed(2)}%)</span></div></div>
        <div class="row space"><div class="name">Otros</div><div><b>${UI.fmtMoney(otrosVal, moneda)}</b> <span class="muted small">(${Number(s.othersPct||0).toFixed(2)}%)</span></div></div>
      </div>
    </div>
    <hr class="sep">
    <div class="row space"><div class="name">Subtotal</div><div><b>${UI.fmtMoney(totals.subtotal||0, moneda)}</b></div></div>
    <div class="row space"><div class="name">IVA sobre utilidad</div><div><b>${UI.fmtMoney(totals.ivaUtil||0, moneda)}</b></div></div>
    <div class="row space"><div class="name">Valor total</div><div><b>${UI.fmtMoney(totals.total||0, moneda)}</b></div></div>
  `;
}

function bindIndirectTableUI(projectId){
  const form = UI.qs("#formAjustes");
  if(!form) return;

  const host = ensureIndirectTableMount(form);
  if(!host && !UI.qs("#tableIndirectWrap")) return;

  const project = StorageAPI.getProjectById(projectId);
  if(!project) return;

  ensureProjectIndirectConfig(project);

  const sel = UI.qs("#indirectModeSel") || UI.qs("#indirectMode");
  const tbody = UI.qs("#indirectTableBody");
  const btnLine = UI.qs("#btnIndirectAddLine");
  const btnHeader = UI.qs("#btnIndirectAddHeader");

  if(!sel || !tbody || !btnLine || !btnHeader) return;

  sel.onchange = ()=>{
    StorageAPI.updateProject(projectId, { indirectMode: normalizeIndirectModeValue(sel.value) });
    refreshProjectComputedViews(projectId);
    renderIndirectRows(projectId);
  };

  btnLine.onclick = ()=>{
    promptCreateIndirectDetail(projectId);
  };

  btnHeader.onclick = ()=>{
    promptCreateIndirectHeader(projectId);
  };

  tbody.oninput = (e)=>{
    const target = e.target;
    if(!(target instanceof HTMLElement)) return;
    if(!target.matches("[data-field]")) return;
    const tr = target.closest("tr[data-indirect-id]");
    renderSingleIndirectRowPreview(tr, projectId);
  };

  tbody.onchange = async (e)=>{
    const target = e.target;
    if(!(target instanceof HTMLElement)) return;
    if(!target.matches("[data-field]")) return;

    const tr = target.closest("tr[data-indirect-id]");
    if(!tr) return;

    const rowId = tr.getAttribute("data-indirect-id");
    if(!rowId) return;

    const field = target.getAttribute("data-field") || "";
    if(field === "sourceType"){
      applyIndirectSourceTypeToRow(projectId, rowId, target.value);
      return;
    }

    persistIndirectRowsFromDom(projectId);
  };

  tbody.onclick = async (e)=>{
    const editBtn = e.target?.closest?.("[data-indirect-edit]");
    if(editBtn){
      const rowId = editBtn.getAttribute("data-indirect-edit");
      if(rowId) editIndirectHeaderRow(projectId, rowId);
      return;
    }

    const editDetailBtn = e.target?.closest?.("[data-indirect-edit-detail]");
    if(editDetailBtn){
      const rowId = editDetailBtn.getAttribute("data-indirect-edit-detail");
      if(rowId) editIndirectDetailRow(projectId, rowId);
      return;
    }

    const pickBtn = e.target?.closest?.("[data-indirect-pick]");
    if(pickBtn){
      const rowId = pickBtn.getAttribute("data-indirect-pick");
      if(!rowId) return;
      const tr = pickBtn.closest("tr[data-indirect-id]");
      const sourceType = tr?.querySelector?.('[data-field="sourceType"]')?.value || "manual";
      await pickIndirectResourceFromBase(projectId, rowId, sourceType);
      return;
    }

    const saveBtn = e.target?.closest?.("[data-indirect-save]");
    if(saveBtn){
      persistIndirectRowsFromDom(projectId);
      alert("Línea guardada.");
      return;
    }

    const btn = e.target?.closest?.("[data-indirect-del]");
    if(!btn) return;

    const id = btn.getAttribute("data-indirect-del");
    if(!id) return;
    if(!confirm("¿Eliminar esta línea de indirectos?")) return;

    const fresh = StorageAPI.getProjectById(projectId);
    const rows = getIndirectRows(fresh).filter(x => String(x.id) !== String(id));
    saveIndirectRows(projectId, rows);
    refreshProjectComputedViews(projectId);
    renderIndirectRows(projectId);
  };

  renderIndirectRows(projectId);
}

function closeAddApuModal(){
  const modal = UI.qs("#addApuModal");
  if(modal) modal.style.display = "none";
}

function refreshAddApuModalChapterOptions(project){
  const sel = UI.qs("#addApuChapterSel");
  const inpCode = UI.qs("#addApuChapterCode");
  const inpName = UI.qs("#addApuChapterName");
  if(!sel) return;

  const chapters = getAllChaptersForProject(project);

  sel.innerHTML = chapters.length
    ? chapters.map(c=>{
        const label = `${c.chapterCode} — ${c.chapterName||""}`.trim();
        return `<option value="${UI.esc(c.chapterCode)}" data-name="${UI.esc(c.chapterName||"")}">${UI.esc(label)}</option>`;
      }).join("")
    : `<option value="">(Sin capítulos definidos)</option>`;

  const pick = ()=>{
    const code = String(sel.value||"").trim();
    let name = "";
    if(code){
      name = lookupChapterName(project, code);
    }
    if(inpCode) inpCode.value = code;
    if(inpName) inpName.value = name;
  };

  sel.onchange = pick;
  pick();
}

function confirmAddApuToProject({ keepOpen=false }){
  const projectId = __addApuModalState.projectId;
  const apu = __addApuModalState.apu;
  if(!projectId || !apu) return;

  const fresh = StorageAPI.getProjectById(projectId);
  if(!fresh) return;

  const qty = Number(String(UI.qs("#addApuQty")?.value || "0").replaceAll(",",""));
  if(!(qty > 0)){
    alert("La cantidad debe ser mayor a 0.");
    return;
  }

  const chapterCode = String(UI.qs("#addApuChapterCode")?.value || "").trim();
  let chapterName = String(UI.qs("#addApuChapterName")?.value || "").trim();

  if(!chapterCode){
    alert("Debes seleccionar un capítulo destino.");
    return;
  }
  if(!chapterName){
    chapterName = lookupChapterName(fresh, chapterCode) || "";
  }

  StorageAPI.addItem(projectId, {
    chapterCode,
    chapterName,
    code: apu.code,
    apuRefCode: apu.code,
    desc: apu.desc,
    unit: apu.unit,
    pu: Number(apu.pu||0),
    qty
  });

  const updated = StorageAPI.getProjectById(projectId);
  refreshProjectBudgetAwareUI(updated.id);

  if(keepOpen){
    UI.qs("#addApuQty") && (UI.qs("#addApuQty").value = "1");
    refreshAddApuModalChapterOptions(updated);
    alert("Ítem agregado. Puedes escoger otro capítulo y volver a agregar.");
    return;
  }

  closeAddApuModal();
  alert("Ítem agregado al presupuesto.");
}

/* =========================
   Render de ítems + edición
   ========================= */
function renderItemsTable(project){
  const tbody = UI.qs("#itemsBody");
  const empty = UI.qs("#itemsEmpty");
  if(!tbody) return;

  const items = project.items || [];
  if(!items.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  tbody.innerHTML = items.map(it=>{
    const parcial = Number(it.pu||0) * Number(it.qty||0);
    const cap = it.chapterCode || (String(it.code||"").split(".")[0] || "");
    const apuCode = String(it.apuRefCode || it.code || "").trim();

    return `
      <tr>
        <td><b>${UI.esc(cap||"-")}</b></td>
        <td>${UI.esc(it.code||"")}</td>
        <td>${UI.esc(it.desc||"")}</td>
        <td>${UI.esc(it.unit||"")}</td>
        <td style="text-align:right"><b>${UI.fmtMoney(it.pu, project.currency||"COP")}</b></td>
        <td style="text-align:right">${UI.esc(String(it.qty||0))}</td>
        <td style="text-align:right"><b>${UI.fmtMoney(parcial, project.currency||"COP")}</b></td>
        <td class="row" style="gap:8px">
          <a class="btn" href="apu.html?code=${encodeURIComponent(apuCode)}&projectId=${encodeURIComponent(project.id)}">Ver APU</a>
          <button class="btn" type="button" data-edit="${it.id}">Editar</button>
          <button class="btn danger" type="button" data-del="${it.id}">Eliminar</button>
        </td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll("[data-del]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-del");
      if(!confirm("¿Eliminar ítem?")) return;
      StorageAPI.deleteItem(project.id, id);
      const fresh = StorageAPI.getProjectById(project.id);
      refreshProjectBudgetAwareUI(fresh.id);
    });
  });

  tbody.querySelectorAll("[data-edit]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-edit");
      const fresh = StorageAPI.getProjectById(project.id);
      if(!fresh) return;

      const it = (fresh.items||[]).find(x=>x.id===id);
      if(!it) return;

      const curChapterCode = String(it.chapterCode || (String(it.code||"").split(".")[0]||"")).trim();
      const curChapterName = String(it.chapterName||"").trim() || lookupChapterName(fresh, curChapterCode);

      const chapterCode = String(prompt("Capítulo (número):", curChapterCode) ?? curChapterCode).trim();
      let chapterName = String(prompt("Nombre del capítulo:", curChapterName) ?? curChapterName).trim();
const code = prompt("Código (visible):", it.code||"") ?? it.code;
const curApuRef = String(it.apuRefCode || it.code || "").trim();
      let apuRefCode = String(prompt("Código APU (Ref - real):", curApuRef) ?? curApuRef).trim();
      if(!apuRefCode) apuRefCode = String(code||"").trim();

      const desc = prompt("Descripción:", it.desc||"") ?? it.desc;
      const unit = prompt("Unidad:", it.unit||"") ?? it.unit;
      const pu = Number(prompt("VR Unitario:", String(it.pu||0)) ?? it.pu);
      const qty = Number(prompt("Cantidad:", String(it.qty||0)) ?? it.qty);

      if(chapterCode && !chapterName){
        chapterName = lookupChapterName(fresh, chapterCode) || "";
      }

      StorageAPI.updateItem(fresh.id, id, { chapterCode, chapterName, code, apuRefCode, desc, unit, pu, qty });
      const updated = StorageAPI.getProjectById(fresh.id);
      refreshProjectBudgetAwareUI(updated.id);
    });
  });
}

function renderResumenItems(project){
  const tbody = UI.qs("#resumenItemsBody");
  const empty = UI.qs("#resumenItemsEmpty");
  if(!tbody) return;

  const items = project.items || [];
  if(!items.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  const { items: items2 } = Calc.groupByChapters(project);

  tbody.innerHTML = items2.map(it=>{
    const parcial = Number(it.pu||0) * Number(it.qty||0);
    const cap = it.chapterCode || (String(it.code||"").split(".")[0] || "");
    return `
      <tr>
        <td><b>${UI.esc(cap||"-")}</b></td>
        <td><b>${UI.esc(it.code||"")}</b></td>
        <td>${UI.esc(it.desc||"")}</td>
        <td>${UI.esc(it.unit||"")}</td>
        <td style="text-align:right"><b>${UI.fmtMoney(it.pu, project.currency||"COP")}</b></td>
        <td style="text-align:right">${UI.esc(String(it.qty||0))}</td>
        <td style="text-align:right"><b>${UI.fmtMoney(parcial, project.currency||"COP")}</b></td>
      </tr>
    `;
  }).join("");
}

function renderApuResults(projectId, results){
  const tbody = UI.qs("#apuResultsBody");
  const empty = UI.qs("#apuResultsEmpty");
  if(!tbody) return;

  if(!results || !results.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  tbody.innerHTML = results.map(r=>`
    <tr>
      <td><b>${UI.esc(r.code||"")}</b></td>
      <td>${UI.esc(r.desc||"")}</td>
      <td>${UI.esc(r.unit||"")}</td>
      <td style="text-align:right"><b>${UI.fmtMoney(r.pu||0,"COP")}</b></td>
      <td>
        <button class="btn primary" type="button" data-addapu="${UI.esc(r.code||"")}">Agregar</button>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-addapu]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const code = btn.getAttribute("data-addapu");
      const sel = results.find(x=>String(x.code||"")===String(code||""));
      if(!sel) return;

      if(sel.isChapter){
        alert("Ese código es un CAPÍTULO. Escoge un ítem (ej: 1.01).");
        return;
      }

      const project = StorageAPI.getProjectById(projectId);
      if(!project) return;

      openAddApuModal(project, sel);
    });
  });
}
/* =========================================================
   ✅ VISOR "Consultas de Base APU"
   - ahora muestra TODO, también con buscador
   ========================================================= */
function bindBaseViewer(projectId){
  const btnVerFormulario = UI.qs("#btnVerFormulario");
  const btnVerCD = UI.qs("#btnVerCD");
  const btnVerSub = UI.qs("#btnVerSub");
  const btnVerInsumos = UI.qs("#btnVerInsumos");

  const viewer = UI.qs("#baseViewer");
  const title = UI.qs("#baseViewerTitle");
  const sub = UI.qs("#baseViewerSub");
  const btnClose = UI.qs("#btnCloseViewer");

  const searchRow = UI.qs("#baseViewerSearchRow");
  const inpSearch = UI.qs("#baseViewerSearch");
  const btnSearch = UI.qs("#btnBaseViewerSearch");

  const head = UI.qs("#baseViewerHead");
  const body = UI.qs("#baseViewerBody");
  const empty = UI.qs("#baseViewerEmpty");

  if(!btnVerFormulario || !btnVerCD || !btnVerSub || !btnVerInsumos) return;
  if(!viewer || !title || !sub || !btnClose || !head || !body || !empty) return;

  let mode = "";

  function showEmpty(flag){
    empty.style.display = flag ? "" : "none";
  }

  function openViewer(newMode){
    mode = newMode;
    viewer.style.display = "";

    if(searchRow) searchRow.style.display = "";
    if(inpSearch) inpSearch.value = "";

    if(mode === "formulario"){
      title.textContent = "FORMULARIO DE PRECIOS";
      sub.textContent = "Items (capítulos + ítems) de la base.";
      head.innerHTML = `
        <tr>
          <th>Código</th>
          <th>Descripción</th>
          <th>Unidad</th>
          <th style="text-align:right">PU</th>
          <th>Capítulo</th>
        </tr>
      `;
    }

    if(mode === "cd"){
      title.textContent = "Costos_Directos";
      sub.textContent = "Líneas de descomposición completas de la base.";
      head.innerHTML = `
        <tr>
          <th>Ítem</th>
          <th>Grupo</th>
          <th>Descripción</th>
          <th>Unidad</th>
          <th style="text-align:right">Cant/Rend</th>
          <th style="text-align:right">PU</th>
          <th style="text-align:right">Parcial</th>
        </tr>
      `;
    }

    if(mode === "sub"){
      title.textContent = "Subproductos";
      sub.textContent = "Listado completo de subproductos. Puedes abrir el detalle.";
      head.innerHTML = `
        <tr>
          <th>Nombre</th>
          <th>Key</th>
          <th>Acción</th>
        </tr>
      `;
    }

    if(mode === "insumos"){
      title.textContent = "Insumos";
      sub.textContent = "Listado completo de insumos (filtrable por tipo/desc/unidad).";
      head.innerHTML = `
        <tr>
          <th>Tipo</th>
          <th>Descripción</th>
          <th>Unidad</th>
          <th style="text-align:right">PU</th>
        </tr>
      `;
    }

    body.innerHTML = "";
    showEmpty(false);
    loadRows("");
  }

  function closeViewer(){
    viewer.style.display = "none";
    mode = "";
  }

  async function requireBase(){
    let meta = null;
    try{ meta = await APUBase.getMeta(); }catch(_){}
    if(!meta){
      alert("Primero instala la Base APU (XLSX) desde Proyectos.");
      return false;
    }
    return true;
  }

  async function loadRows(q){
    const ok = await requireBase();
    if(!ok) return;

    body.innerHTML = "";
    showEmpty(false);

    try{
      if(mode === "formulario"){
        const rows = await APUBase.listFormularioItems(q || "");
        if(!rows.length){ showEmpty(true); return; }

        body.innerHTML = rows.map(r=>{
          const cap = r.isChapter ? `CAP ${r.code}` : (r.chapterCode ? `CAP ${r.chapterCode}` : "");
          const capName = r.isChapter ? (r.desc || "") : (r.chapterName || "");
          return `
            <tr>
              <td><b>${UI.esc(r.code||"")}</b></td>
              <td>${UI.esc(r.desc||"")}</td>
              <td>${UI.esc(r.unit||"")}</td>
              <td style="text-align:right"><b>${UI.fmtMoney(r.pu||0,"COP")}</b></td>
              <td>${UI.esc((cap ? cap + " — " : "") + (capName||""))}</td>
            </tr>
          `;
        }).join("");
        return;
      }

      if(mode === "cd"){
        const rows = await APUBase.listCostosDirectosAll(q || "");
        if(!rows.length){ showEmpty(true); return; }

        body.innerHTML = rows.map(r=>`
          <tr>
            <td><b>${UI.esc(r.itemCode||"")}</b></td>
            <td>${UI.esc(r.group||"")}</td>
            <td>${UI.esc(r.desc||"")}</td>
            <td>${UI.esc(r.unit||"")}</td>
            <td style="text-align:right">${UI.esc(String(r.qty||0))}</td>
            <td style="text-align:right"><b>${UI.fmtMoney(r.pu||0,"COP")}</b></td>
            <td style="text-align:right"><b>${UI.fmtMoney(r.parcial||0,"COP")}</b></td>
          </tr>
        `).join("");
        return;
      }

      if(mode === "sub"){
        const list = await APUBase.listSubproductos();
        const qn = (q||"").trim().toLowerCase();
        const filtered = !qn ? list : list.filter(x =>
          String(x.subName||"").toLowerCase().includes(qn) ||
          String(x.subKey||"").toLowerCase().includes(qn)
        );

        if(!filtered.length){ showEmpty(true); return; }

        body.innerHTML = filtered.map(s=>`
          <tr>
            <td><b>${UI.esc(s.subName||"")}</b></td>
            <td class="muted small">${UI.esc(s.subKey||"")}</td>
            <td>
              <a class="btn" href="apu.html?sub=${encodeURIComponent(s.subKey||"")}&projectId=${encodeURIComponent(projectId||"")}">Ver</a>
            </td>
          </tr>
        `).join("");
        return;
      }

      if(mode === "insumos"){
        const rows = await APUBase.listInsumos(q || "");
        if(!rows.length){ showEmpty(true); return; }

        body.innerHTML = rows.map(r=>`
          <tr>
            <td>${UI.esc(r.tipo||"")}</td>
            <td>${UI.esc(r.desc||"")}</td>
            <td>${UI.esc(r.unit||"")}</td>
            <td style="text-align:right"><b>${UI.fmtMoney(r.pu||0,"COP")}</b></td>
          </tr>
        `).join("");
        return;
      }
    }catch(err){
      alert("Error consultando base: " + (err?.message || err));
    }
  }

  btnClose.addEventListener("click", closeViewer);

  btnVerFormulario.addEventListener("click", ()=> openViewer("formulario"));
  btnVerCD.addEventListener("click", ()=> openViewer("cd"));
  btnVerSub.addEventListener("click", ()=> openViewer("sub"));
  btnVerInsumos.addEventListener("click", ()=> openViewer("insumos"));

  btnSearch?.addEventListener("click", ()=>{
    loadRows(inpSearch?.value || "");
  });

  inpSearch?.addEventListener("keydown", (e)=>{
    if(e.key === "Enter"){
      e.preventDefault();
      btnSearch?.click();
    }
  });
}

/* ---------- FIRMA ---------- */
function bindFirmaModal(){
  const btn = UI.qs("#btnDatosFirma");
  const modal = UI.qs("#firmaModal");
  if(!btn || !modal) return;

  const btnClose = UI.qs("#btnFirmaClose");
  const inpNombre = UI.qs("#firmaNombre");
  const inpProf = UI.qs("#firmaProfesion");
  const inpMat = UI.qs("#firmaMatricula");
  const canvas = UI.qs("#firmaCanvas");
  const btnClear = UI.qs("#firmaClear");
  const btnSave = UI.qs("#firmaSave");
  const btnDel = UI.qs("#firmaDelete");
  const btnJpg = UI.qs("#firmaDownloadJpg");
  const prev = UI.qs("#firmaPreview");

  if(!canvas) return;

  function open(){
    modal.style.display = "";
    const e = StorageAPI.getElaborador();
    if(inpNombre) inpNombre.value = e.nombre || "";
    if(inpProf) inpProf.value = e.profesion || "";
    if(inpMat) inpMat.value = e.matricula || "";
    if(prev) prev.src = e.firmaDataUrl || "";
    redrawFromSaved();
  }
  function close(){
    modal.style.display = "none";
  }

  btn.addEventListener("click", open);
  btnClose && btnClose.addEventListener("click", close);

  const ctx = canvas.getContext("2d");
  function fitCanvas(){
    const w = canvas.clientWidth || 520;
    const h = canvas.clientHeight || 220;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = "#ffffff";
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0,0,w,h);
  }

  let drawing = false;
  let last = null;

  function getPos(ev){
    const r = canvas.getBoundingClientRect();
    const x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
    const y = (ev.touches ? ev.touches[0].clientY : ev.clientY) - r.top;
    return { x, y };
  }

  function start(ev){
    ev.preventDefault();
    drawing = true;
    last = getPos(ev);
  }
  function move(ev){
    if(!drawing) return;
    ev.preventDefault();
    const p = getPos(ev);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
  }
  function end(){
    drawing = false;
    last = null;
  }

  function clear(){
    fitCanvas();
    if(prev) prev.src = StorageAPI.getElaborador().firmaDataUrl || "";
  }

  function toJpegDataUrl(){
    const tmp = document.createElement("canvas");
    tmp.width = canvas.width;
    tmp.height = canvas.height;
    const tctx = tmp.getContext("2d");
    tctx.fillStyle = "#0b1220";
    tctx.fillRect(0,0,tmp.width,tmp.height);
    tctx.drawImage(canvas,0,0);
    return tmp.toDataURL("image/jpeg", 0.92);
  }

  function redrawFromSaved(){
    fitCanvas();
    const e = StorageAPI.getElaborador();
    if(e.firmaDataUrl){
      const img = new Image();
      img.onload = ()=>{
        const w = canvas.clientWidth || 520;
        const h = canvas.clientHeight || 220;
        ctx.fillStyle = "#0b1220";
        ctx.fillRect(0,0,w,h);
        ctx.drawImage(img, 0, 0, w, h);
      };
      img.src = e.firmaDataUrl;
    }
  }

  window.addEventListener("resize", ()=>{
    if(modal.style.display !== "none") redrawFromSaved();
  });

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);

  canvas.addEventListener("touchstart", start, {passive:false});
  canvas.addEventListener("touchmove", move, {passive:false});
  canvas.addEventListener("touchend", end);

  btnClear && btnClear.addEventListener("click", ()=> clear());

  btnSave && btnSave.addEventListener("click", ()=>{
    const nombre = inpNombre ? inpNombre.value.trim() : "";
    const profesion = inpProf ? inpProf.value.trim() : "";
    const matricula = inpMat ? inpMat.value.trim() : "";

    const firmaDataUrl = toJpegDataUrl();
    const saved = StorageAPI.setElaborador({ nombre, profesion, matricula, firmaDataUrl });
    if(prev) prev.src = saved.firmaDataUrl || "";
    alert("Firma guardada. Ya aparecerá en el PDF.");
  });

  btnDel && btnDel.addEventListener("click", ()=>{
    if(!confirm("¿Quitar la firma guardada?")) return;
    StorageAPI.clearFirma();
    if(prev) prev.src = "";
    clear();
    alert("Firma eliminada.");
  });

  btnJpg && btnJpg.addEventListener("click", ()=>{
    const jpg = toJpegDataUrl();
    const a = document.createElement("a");
    a.href = jpg;
    a.download = `firma_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  fitCanvas();
  clear();
}

/* ---------- DETALLE (bind) ---------- */
async function bindProjectDetailPage(){
  const projectId = UI.getParam("projectId");
  const project = StorageAPI.getProjectById(projectId);
  if(!project){
    alert("Proyecto no encontrado.");
    window.location.href="proyectos.html";
    return;
  }

  installBudgetRuntimeFallbacks();
  ensureProjectChapters(project);
  ensureProjectBudgetsRuntime(project);
  syncCurrentRootIntoActiveBudget(projectId);

  bindTabsIfPresent();
  bindFirmaModal();
  bindBaseViewer(projectId);

  bindProjectChaptersUI(projectId);
  renderProjectChaptersUI(project);

  UI.qs("#btnAddApuClose")?.addEventListener("click", closeAddApuModal);
  UI.qs("#btnAddApuConfirm")?.addEventListener("click", ()=> confirmAddApuToProject({ keepOpen:false }));
  UI.qs("#btnAddApuConfirmAndKeep")?.addEventListener("click", ()=> confirmAddApuToProject({ keepOpen:true }));

  refreshProjectBudgetAwareUI(project.id);
  renderDocs(projectId).catch(()=>{});

  const inpLogo = UI.qs("#inpProjectLogo");
  const btnRmLogo = UI.qs("#btnRemoveProjectLogo");
  const logoPrev = UI.qs("#projectLogoPreview");

  function refreshLogoPreview(){
    const fresh = StorageAPI.getProjectById(projectId);
    if(!fresh) return;
    if(logoPrev) logoPrev.src = fresh.logoDataUrl || "";
  }
  refreshLogoPreview();

  inpLogo?.addEventListener("change", async (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;
    try{
      const dataUrl = await fileToDataUrl(f);
      StorageAPI.updateProject(projectId, { logoDataUrl: dataUrl });
      refreshLogoPreview();
      alert("Logo guardado en el proyecto.");
    }catch(err){
      alert("No se pudo guardar el logo: " + (err?.message || err));
    }finally{
      e.target.value = "";
    }
  });

  btnRmLogo?.addEventListener("click", ()=>{
    if(!confirm("¿Quitar el logo guardado de este proyecto?")) return;
    StorageAPI.updateProject(projectId, { logoDataUrl: "" });
    refreshLogoPreview();
    alert("Logo eliminado.");
  });

  UI.qs("#btnExportExcel")?.addEventListener("click", ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      exportProjectExcel(fresh);
    }catch(err){
      alert("Error exportando Excel: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfPresupuesto")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      await PDF.exportPresupuestoPDF(fresh, { share: isIOS() });
    }catch(err){
      alert("Error generando PDF: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfPresupuestoAPUs")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      await PDF.exportPresupuestoConAPUsPDF(fresh, { share: isIOS() });
    }catch(err){
      alert("Error generando PDF + APUs: " + (err?.message || err));
    }
  });

  UI.qs("#btnDlPdfPresupuesto")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      await PDF.exportPresupuestoPDF(fresh);
    }catch(err){
      alert("Error descargando PDF Presupuesto: " + (err?.message || err));
    }
  });

  UI.qs("#btnDlPdfPresupuestoAPUs")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      await PDF.exportPresupuestoConAPUsPDF(fresh);
    }catch(err){
      alert("Error descargando PDF Presupuesto + APUs: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfEspecificacionesTec")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      await PDF.exportEspecificacionesTecnicasPDF(fresh, { share: isIOS() });
    }catch(err){
      alert("Error generando PDF Especificaciones Técnicas: " + (err?.message || err));
    }
  });

  UI.qs("#btnDlPdfEspecificacionesTec")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      await PDF.exportEspecificacionesTecnicasPDF(fresh);
    }catch(err){
      alert("Error descargando PDF Especificaciones Técnicas: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfPresupuestoDesagregado")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      if(!window.PDF || typeof PDF.exportPresupuestoObraDesagregadoPDF !== "function"){
        alert("Este PDF aún no está implementado. Falta actualizar pdf.js (Presupuesto de Obra Desagregado).");
        return;
      }
      await PDF.exportPresupuestoObraDesagregadoPDF(fresh, { share: isIOS() });
    }catch(err){
      alert("Error generando PDF Presupuesto de Obra Desagregado: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfResumenPresupuestoDesagregado")?.addEventListener("click", async ()=>{
    try{
       const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      if(!window.PDF || typeof PDF.exportResumenPresupuestoObraDesagregadoPDF !== "function"){
        alert("Este PDF aún no está implementado. Falta actualizar pdf.js (Resumen Presupuesto de Obra Desagregado).");
        return;
      }
      await PDF.exportResumenPresupuestoObraDesagregadoPDF(fresh, { share: isIOS() });
    }catch(err){
      alert("Error generando Resumen Presupuesto de Obra Desagregado: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfDistribucionPctCD")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      if(!window.PDF || typeof PDF.exportDistribucionPorcentualCostosDirectosPDF !== "function"){
        alert("Este PDF aún no está implementado. Falta actualizar pdf.js (Distribución porcentual de Costos Directos).");
        return;
      }
      await PDF.exportDistribucionPorcentualCostosDirectosPDF(fresh, { share: isIOS() });
    }catch(err){
      alert("Error generando Distribución porcentual de Costos Directos: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfRendimientoEqMo")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      if(!window.PDF || typeof PDF.exportRendimientoEquipoManoObraActividadPDF !== "function"){
        alert("Este PDF aún no está implementado. Falta actualizar pdf.js (Rendimiento de Equipo y Mano de Obra).");
        return;
      }
      await PDF.exportRendimientoEquipoManoObraActividadPDF(fresh, { share: isIOS() });
    }catch(err){
      alert("Error generando Rendimiento de Equipo y Mano de Obra por Actividad: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfResumenMaterialesActividad")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      if(!window.PDF || typeof PDF.exportResumenMaterialesPorActividadPDF !== "function"){
        alert("Este PDF aún no está implementado. Falta actualizar pdf.js (Resumen materiales por actividad).");
        return;
      }
      await PDF.exportResumenMaterialesPorActividadPDF(fresh, { share: isIOS() });
    }catch(err){
      alert("Error generando Resumen materiales por actividad: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfCantRecursosInsumos")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      if(!window.PDF || typeof PDF.exportCantidadRecursosInsumosPresupuestoPDF !== "function"){
        alert("Este PDF aún no está implementado. Falta actualizar pdf.js (Cantidad de Recurso e Insumos del Presupuesto).");
        return;
      }
      await PDF.exportCantidadRecursosInsumosPresupuestoPDF(fresh, { share: isIOS() });
    }catch(err){
      alert("Error generando Cantidad de Recurso e Insumos del Presupuesto: " + (err?.message || err));
    }
  });

  (UI.qs("#btnPdfCalculoIndirectos") || UI.qs("#btnPdfCalcIndirectos"))?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      if(!window.PDF || typeof PDF.exportCalculoCostosIndirectosPDF !== "function"){
        alert("Este PDF aún no está implementado. Falta actualizar pdf.js (Cálculo de Costos Indirectos).");
        return;
      }
      await PDF.exportCalculoCostosIndirectosPDF(fresh, { share: isIOS() });
    }catch(err){
      alert("Error generando PDF Cálculo de Costos Indirectos: " + (err?.message || err));
    }
  });

  UI.qs("#formAjustes")?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);

    const adminPct = Number(fd.get("adminPct") || 0);
    const imprevPct = Number(fd.get("imprevPct") || 0);
    const utilPct = Number(fd.get("utilPct") || 0);
    const ivaUtilPct = Number(fd.get("ivaUtilPct") || 0);

    const instPais = String(fd.get("instPais") || "").trim();
    const instDepto = String(fd.get("instDepto") || "").trim();
    const instMunicipio = String(fd.get("instMunicipio") || "").trim();
    const instEntidad = String(fd.get("instEntidad") || "").trim();
    const instProyectoLabel = String(fd.get("instProyectoLabel") || "").trim();
    const instFechaElab = String(fd.get("instFechaElab") || "").trim();

    const indirectMode = normalizeIndirectModeValue(UI.qs("#indirectModeSel")?.value || project.indirectMode || "manual");
    const indirectTable = readIndirectRowsFromDom();

    StorageAPI.updateProject(projectId, {
      adminPct, imprevPct, utilPct, ivaUtilPct,
      instPais, instDepto, instMunicipio, instEntidad, instProyectoLabel, instFechaElab,
      indirectMode,
      indirectTable
    });

    const fresh = StorageAPI.getProjectById(projectId);
    alert("Ajustes guardados.");
    refreshProjectBudgetAwareUI(fresh.id);
  });

  const form = UI.qs("#formAjustes");
  if(form){
    const cfg = ensureProjectIndirectConfig(project);

    if(form.adminPct) form.adminPct.value = String(project.adminPct ?? project.aiuPct ?? 0);
    if(form.imprevPct) form.imprevPct.value = String(project.imprevPct ?? 0);
    if(form.utilPct) form.utilPct.value = String(project.utilPct ?? 0);
    if(form.ivaUtilPct) form.ivaUtilPct.value = String(project.ivaUtilPct ?? project.ivaPct ?? 0);

    if(form.instPais) form.instPais.value = String(project.instPais || "");
    if(form.instDepto) form.instDepto.value = String(project.instDepto || "");
    if(form.instMunicipio) form.instMunicipio.value = String(project.instMunicipio || "");
    if(form.instEntidad) form.instEntidad.value = String(project.instEntidad || "");
    if(form.instProyectoLabel) form.instProyectoLabel.value = String(project.instProyectoLabel || "");
    if(form.instFechaElab) form.instFechaElab.value = String(project.instFechaElab || "");

    if(cfg.indirectMode === "table"){
      setIndirectManualInputsDisabled(form, true);
    }
  }

  bindIndirectTableUI(projectId);

  UI.qs("#docsInput")?.addEventListener("change", async (e)=>{
    const files = Array.from(e.target.files || []);
    if(!files.length) return;

    const MAX_FILE = 25 * 1024 * 1024;
    const tooBig = files.find(f => (f.size||0) > MAX_FILE);
    if(tooBig){ alert(`Archivo demasiado grande (>25MB): ${tooBig.name}`); e.target.value=""; return; }

    for(const f of files){
      await DB.putFile({
        ownerType:"project",
        ownerId: projectId,
        kind:"doc_project",
        name: f.name,
        mime: f.type || "application/octet-stream",
        size: f.size || 0,
        blob: f
      });
    }
    e.target.value = "";
    await renderDocs(projectId);
    alert("Documentos guardados.");
  });

  UI.qs("#btnExportProj")?.addEventListener("click", async ()=>{
    try{
      const p = StorageAPI.getProjectById(projectId);
      if(!p) return;

      const metaDocs = await DB.listFilesByOwner("project", projectId);
      const docs = [];
      for(const m of metaDocs){
        const full = await DB.getFile(m.id);
        if(!full || !full.blob) continue;
        const dataUrl = await blobToDataUrl(full.blob);
        docs.push({
          name: full.name || m.name || "archivo",
          mime: full.mime || m.mime || "application/octet-stream",
          size: Number(full.size || m.size || 0),
          createdAt: full.createdAt || m.createdAt || new Date().toISOString(),
          dataUrl
        });
      }

      const payload = { meta: StorageAPI.loadStore().meta, project: p, docs };
      const blob = new Blob([JSON.stringify(payload,null,2)], {type:"application/json"});
      const url = URL.createObjectURL(blob);
      UI.downloadBlobUrl(url, `proyecto_${(p.name||"").replace(/\s+/g,"_")}_${Date.now()}.json`);
    }catch(err){
      alert("Error exportando proyecto: " + (err?.message || err));
    }
  });

  UI.qs("#btnDeleteProj")?.addEventListener("click", async ()=>{
    if(!confirm("¿Eliminar proyecto y sus documentos?")) return;
    await DB.deleteFilesByOwner("project", projectId).catch(()=>{});
    StorageAPI.deleteProject(projectId);
    alert("Proyecto eliminado.");
    window.location.href = "proyectos.html";
  });

  UI.qs("#btnExportBackup")?.addEventListener("click", ()=>{
    const { url, filename } = StorageAPI.exportBackup();
    UI.downloadBlobUrl(url, filename);
  });

  UI.qs("#fileImport2")?.addEventListener("change", async (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;
    try{
      await StorageAPI.importBackupFromFile(f);
      alert("Backup importado. Se recargará.");
      window.location.reload();
    }catch(err){
      alert("Error importando backup: " + err.message);
    }finally{
      e.target.value = "";
    }
  });

  UI.qs("#btnResetAll")?.addEventListener("click", async ()=>{
    if(!confirm("¿Borrar TODO? (proyectos + documentos)")) return;

    const alsoBase = confirm("¿También deseas borrar la Base APU (IndexedDB)?\n\nOJO: tendrás que instalar el XLSX de nuevo.");

    const ps = StorageAPI.listProjects();
    for(const p of ps){
      await DB.deleteFilesByOwner("project", p.id).catch(()=>{});
    }
    StorageAPI.resetAll();

    if(alsoBase){
      try{ await APUBase.deleteBaseDatabase(); }catch(_){}
    }

    alert("Listo. Se recargará.");
    window.location.href = "proyectos.html";
  });

  UI.qs("#btnApuSearch")?.addEventListener("click", async ()=>{
    try{
      const meta = await APUBase.getMeta();
      if(!meta){
        alert("Primero instala la Base APU (XLSX) desde Proyectos.");
        return;
      }
      const q = (UI.qs("#apuSearch")?.value || "").trim();
      if(!q) return;

      const results = await APUBase.search(q, 30);
      renderApuResults(projectId, results);
    }catch(err){
      alert("Error buscando en base: " + (err?.message || err));
    }
  });

  UI.qs("#apuSearch")?.addEventListener("keydown", (e)=>{
    if(e.key === "Enter"){
      e.preventDefault();
      UI.qs("#btnApuSearch")?.click();
    }
  });

  UI.qs("#formAddManual")?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);

    const fresh = StorageAPI.getProjectById(projectId);
    if(!fresh) return;

    let chapterCode = String(fd.get("chapterCode") || "").trim();
    let chapterName = String(fd.get("chapterName") || "").trim();

    const code = String(fd.get("code") || "").trim();
    const unit = String(fd.get("unit") || "").trim();
    const desc = String(fd.get("desc") || "").trim();
    const pu = Number(String(fd.get("pu") || "0").replaceAll(",",""));
    const qty = Number(String(fd.get("qty") || "0").replaceAll(",",""));

    if(!code || !unit || !desc) { alert("Completa código, unidad y descripción."); return; }
    if(!(pu > 0) || !(qty > 0)) { alert("PU y Cantidad deben ser > 0."); return; }

    if(!chapterCode){
      const def = code.includes(".") ? code.split(".")[0] : "";
      if(/^\d+$/.test(def)) chapterCode = def;
    }

    if(chapterCode && !chapterName){
      chapterName = lookupChapterName(fresh, chapterCode) || "";
    }

    StorageAPI.addItem(projectId, { chapterCode, chapterName, code, apuRefCode: code, unit, desc, pu, qty });

    e.target.reset();
    const updated = StorageAPI.getProjectById(projectId);
    refreshProjectBudgetAwareUI(updated.id);
    alert("Ítem agregado.");
  });
}

/* ---------- APU PAGE (Override por proyecto) ---------- */
async function bindAPUPage(){
  const codeParam = UI.getParam("code");
  const sub = UI.getParam("sub");
  const projectId = UI.getParam("projectId");

  const btnGo = UI.qs("#btnGoProject");
  if(btnGo){
    btnGo.href = projectId
      ? `proyecto-detalle.html?projectId=${encodeURIComponent(projectId)}&tab=items`
      : "proyectos.html";
  }

  const titleEl = UI.qs("#apuTitle");
  const subEl = UI.qs("#apuSub");
  const infoEl = UI.qs("#apuInfo");
  const bodyEl = UI.qs("#apuBody");
  const emptyEl = UI.qs("#apuEmpty");

  const editor = UI.qs("#apuEditor");
  const btnAddLine = UI.qs("#btnAddLine");
  const btnSaveOverride = UI.qs("#btnSaveOverride");
  const btnResetOverride = UI.qs("#btnResetOverride");

  let editMode = false;
  let localLines = [];

  function computeDirecto(lines){
    return (lines||[]).reduce((s,l)=>{
      const qty = Number(l.qty||0);
      const pu = Number(l.pu||0);
      const parcial = Number(l.parcial||0) || (qty*pu);
      return s + parcial;
    },0);
  }

  function renderLines(){
    if(!bodyEl) return;
    if(!localLines.length){
      bodyEl.innerHTML = "";
      emptyEl && (emptyEl.style.display = "");
      return;
    }
    emptyEl && (emptyEl.style.display = "none");

    bodyEl.innerHTML = localLines.map((l, idx)=>{
      const qty = Number(l.qty||0);
      const pu = Number(l.pu||0);
      const parcial = Number(l.parcial||0) || (qty*pu);

      const action = editMode
        ? `<div class="row" style="gap:8px">
             <button class="btn" type="button" data-editline="${idx}">Editar</button>
             <button class="btn danger" type="button" data-rmline="${idx}">Quitar</button>
           </div>`
        : (l.subRef
          ? `<a class="btn" href="apu.html?sub=${encodeURIComponent(l.subRef)}${projectId?`&projectId=${encodeURIComponent(projectId)}`:""}">Ver subproducto</a>`
          : `<span class="muted small">—</span>`);

      return `
        <tr>
          <td>${UI.esc(l.group||l.tipo||"-")}</td>
          <td>${UI.esc(l.desc||"")}</td>
          <td>${UI.esc(l.unit||"")}</td>
          <td style="text-align:right">${UI.esc(String(qty||0))}</td>
          <td style="text-align:right"><b>${UI.fmtMoney(pu,"COP")}</b></td>
          <td style="text-align:right"><b>${UI.fmtMoney(parcial,"COP")}</b></td>
          <td>${action}</td>
        </tr>
      `;
    }).join("");

    bodyEl.querySelectorAll("[data-rmline]").forEach(b=>{
      b.addEventListener("click", ()=>{
        const i = Number(b.getAttribute("data-rmline"));
        localLines.splice(i,1);
        renderLines();
      });
    });

    bodyEl.querySelectorAll("[data-editline]").forEach(b=>{
      b.addEventListener("click", ()=>{
        const i = Number(b.getAttribute("data-editline"));
        const cur = localLines[i];
        if(!cur) return;

        const group = prompt("Grupo:", cur.group||cur.tipo||"") ?? (cur.group||cur.tipo||"");
        const desc = prompt("Descripción:", cur.desc||"") ?? (cur.desc||"");
        const unit = prompt("Unidad:", cur.unit||"") ?? (cur.unit||"");
        const qty = Number(prompt("Cant/Rend:", String(cur.qty||0)) ?? cur.qty);
        const pu = Number(prompt("PU:", String(cur.pu||0)) ?? cur.pu);
        const parcial = qty * pu;

        localLines[i] = { ...cur, group, desc, unit, qty, pu, parcial };
        renderLines();
      });
    });
  }

  let apu = null;

  let apuCode = String(codeParam||"").trim();
  let displayCode = apuCode;

  if(projectId && apuCode){
    const proj = StorageAPI.getProjectById(projectId);
    const hit = (proj?.items||[]).find(x => String(x.code||"").trim() === apuCode);
    if(hit && hit.apuRefCode){
      const real = String(hit.apuRefCode||"").trim();
      if(real && real !== apuCode){
        displayCode = apuCode;
        apuCode = real;
      }
    }
  }

  if(apuCode){
    if(projectId){
      const ov = StorageAPI.getApuOverride(projectId, apuCode);
      if(ov && Array.isArray(ov.lines) && ov.lines.length){
        const title = (displayCode && displayCode !== apuCode) ? `APU ${displayCode} (Ref: ${apuCode})` : `APU ${apuCode}`;
        apu = {
          title,
          subtitle: "(Override del proyecto)",
          header: `${apuCode} — Override del proyecto`,
          metaLine: `Fuente: Override del proyecto · Actualizado: ${(ov.updatedAt||"").slice(0,19).replace("T"," ")}`,
          unit: "",
          directo: computeDirecto(ov.lines),
          lines: ov.lines.map(x=>({ ...x, subRef:"" }))
        };
      }
    }

    if(!apu){
      const custom = StorageAPI.getCustomAPU(apuCode);
      if(custom){
        const directo = (custom.lines||[]).reduce((s,l)=> s + Number(l.parcial||0), 0);
        const title = (displayCode && displayCode !== apuCode) ? `APU ${displayCode} (Ref: ${apuCode})` : `APU ${custom.code}`;
        apu = {
          title,
          subtitle: custom.desc || "",
          header: `${custom.code} — ${custom.desc||""}`,
          metaLine: `APU creado en la app · Capítulo ${custom.chapterCode||"-"} ${custom.chapterName||""}`,
          unit: custom.unit || "",
          directo,
          lines: (custom.lines||[]).map(l=>({ group:l.tipo||l.group||"-", desc:l.desc, unit:l.unit, qty:l.qty, pu:l.pu, parcial:l.parcial, subRef:"" }))
        };
      }else{
        apu = await APUBase.getAPU(apuCode);
        if(apu && displayCode && displayCode !== apuCode){
          apu.title = `APU ${displayCode} (Ref: ${apuCode})`;
        }
      }
    }
  }else if(sub){
    const subKey = String(sub || "").trim();
    let subApu = null;

    if(projectId){
      const ovSub = getSubApuOverride(projectId, subKey);
      if(ovSub && Array.isArray(ovSub.lines)){
        subApu = {
          title: "SUBPRODUCTO",
          subtitle: subKey,
          header: subKey,
          metaLine: `Fuente: Override del proyecto · Actualizado: ${(ovSub.updatedAt||"").slice(0,19).replace("T"," ")}`,
          unit: ovSub?.meta?.unit || "",
          directo: computeDirecto(ovSub.lines),
          lines: ovSub.lines.map(x=>({ ...x }))
        };
      }
    }

    if(!subApu){
      subApu = await APUBase.getSubAPU(subKey);
    }

    apu = subApu;
  }

  if(!apu){
    titleEl && (titleEl.textContent = "APU");
    subEl && (subEl.textContent = "No se encontró el APU solicitado. ¿Instalaste la base XLSX?");
    infoEl && (infoEl.innerHTML = `<div class="muted">Instala la base y verifica el código.</div>`);
    return;
  }

  titleEl && (titleEl.textContent = apu.title || "APU");
  subEl && (subEl.textContent = apu.subtitle || "");

  infoEl && (infoEl.innerHTML = `
    <div class="cardhead">
      <h2>${UI.esc(apu.header || "")}</h2>
      <p class="muted small">${UI.esc(apu.metaLine||"")}</p>
    </div>
    <div class="grid two">
      <div class="item"><div class="name">Unidad</div><div class="muted small">${UI.esc(apu.unit||"-")}</div></div>
      <div class="item"><div class="name">Costo directo</div><div class="muted small"><b>${UI.fmtMoney(apu.directo||0,"COP")}</b></div></div>
    </div>
  `);

  if(sub && !apuCode){
    const subKey = String(sub || "").trim();

    localLines = (apu.lines||[]).map(l=>({
      group: l.group || l.tipo || "-",
      desc: l.desc || "",
      unit: l.unit || "",
      qty: Number(l.qty||0),
      pu: Number(l.pu||0),
      parcial: Number(l.parcial||0) || (Number(l.qty||0)*Number(l.pu||0)),
      subRef: l.subRef || ""
    }));

    if(projectId){
      editMode = true;

      editor && (editor.style.display = "");
      btnSaveOverride && (btnSaveOverride.style.display = "");
      btnResetOverride && (btnResetOverride.style.display = "");

      btnAddLine?.addEventListener("click", ()=>{
        const group = prompt("Grupo:", "MATERIALES") || "";
        const desc = prompt("Descripción:", "") || "";
        const unit = prompt("Unidad:", "UND") || "";
        const qty = Number(prompt("Cant/Rend:", "1") || "0");
        const pu = Number(prompt("PU:", "0") || "0");
        const subRefLine = String(prompt("SubRef (opcional):", "") || "").trim();
        if(!desc.trim()) return;
        if(!(qty>0) || !(pu>=0)) return;
        localLines.push({ group, desc, unit, qty, pu, parcial: qty*pu, subRef: subRefLine });
        renderLines();
      });

      btnSaveOverride?.addEventListener("click", ()=>{
        if(!confirm("¿Guardar override del subproducto para este proyecto?\nEsto NO modifica la base general.")) return;

        const cleaned = localLines.map(l=>({
          group: String(l.group||"-"),
          desc: String(l.desc||""),
          unit: String(l.unit||""),
          qty: Number(l.qty||0),
          pu: Number(l.pu||0),
          parcial: Number(l.parcial||0) || (Number(l.qty||0)*Number(l.pu||0)),
          subRef: String(l.subRef||"").trim()
        }));

        const saved = setSubApuOverride(projectId, subKey, cleaned, {
          unit: String(apu.unit || "")
        });

        apu.directo = computeDirecto(cleaned);
        apu.metaLine = `Fuente: Override del proyecto · Actualizado: ${(saved?.updatedAt||"").slice(0,19).replace("T"," ")}`;
        subEl && (subEl.textContent = `${subKey} (Override del proyecto)`);
        infoEl && (infoEl.innerHTML = `
          <div class="cardhead">
            <h2>${UI.esc(apu.header || subKey)}</h2>
            <p class="muted small">${UI.esc(apu.metaLine||"")}</p>
          </div>
          <div class="grid two">
            <div class="item"><div class="name">Unidad</div><div class="muted small">${UI.esc(apu.unit||"-")}</div></div>
            <div class="item"><div class="name">Costo directo</div><div class="muted small"><b>${UI.fmtMoney(apu.directo||0,"COP")}</b></div></div>
          </div>
        `);

        alert(`Override del subproducto guardado en el proyecto.\nCosto directo: ${UI.fmtMoney(apu.directo||0,"COP")}`);
        renderLines();
      });

      btnResetOverride?.addEventListener("click", ()=>{
        if(!confirm("¿Quitar override del subproducto para este proyecto?\nLa base general no se modifica.")) return;
        clearSubApuOverride(projectId, subKey);
        alert("Override eliminado. Se recargará el subproducto base.");
        location.reload();
      });
    }else{
      editMode = false;
      editor && (editor.style.display = "none");
      btnSaveOverride && (btnSaveOverride.style.display = "none");
      btnResetOverride && (btnResetOverride.style.display = "none");
    }

    renderLines();
    return;
  }

  if(projectId && apuCode){
    btnSaveOverride && (btnSaveOverride.style.display = "");
    btnResetOverride && (btnResetOverride.style.display = "");

    localLines = (apu.lines||[]).map(l=>({
      group: l.group || l.tipo || "-",
      desc: l.desc || "",
      unit: l.unit || "",
      qty: Number(l.qty||0),
      pu: Number(l.pu||0),
      parcial: Number(l.parcial||0) || (Number(l.qty||0)*Number(l.pu||0))
    }));

    editor && (editor.style.display = "");
    editMode = true;

    btnAddLine?.addEventListener("click", ()=>{
      const group = prompt("Grupo:", "MATERIALES") || "";
      const desc = prompt("Descripción:", "") || "";
      const unit = prompt("Unidad:", "UND") || "";
      const qty = Number(prompt("Cant/Rend:", "1") || "0");
      const pu = Number(prompt("PU:", "0") || "0");
      if(!desc.trim()) return;
      if(!(qty>0) || !(pu>=0)) return;
      localLines.push({ group, desc, unit, qty, pu, parcial: qty*pu });
      renderLines();
    });

    btnSaveOverride?.addEventListener("click", ()=>{
      if(!confirm("¿Guardar override del APU para este proyecto?\nEsto actualizará el PU del ítem en el presupuesto.")) return;

      const cleaned = localLines.map(l=>({
        group: String(l.group||"-"),
        desc: String(l.desc||""),
        unit: String(l.unit||""),
        qty: Number(l.qty||0),
        pu: Number(l.pu||0),
        parcial: Number(l.parcial||0) || (Number(l.qty||0)*Number(l.pu||0))
      }));

      StorageAPI.setApuOverride(projectId, apuCode, cleaned);

      const newPU = computeDirecto(cleaned);
      const count = updateItemsPUByApuCompat(projectId, apuCode, newPU);

      alert(`Override guardado.\nNuevo PU (Costo directo): ${UI.fmtMoney(newPU,"COP")}\nÍtems actualizados: ${count}`);
      apu.directo = newPU;
      subEl && (subEl.textContent = "(Override del proyecto)");
      renderLines();
    });

    btnResetOverride?.addEventListener("click", async ()=>{
      if(!confirm("¿Quitar override del proyecto?\n(NO borra la Base APU).")) return;
      StorageAPI.clearApuOverride(projectId, apuCode);
      alert("Override eliminado. Vuelve a abrir el APU para ver el original (base/custom).");
      location.reload();
    });
  }

  renderLines();
}

/* ---------- BOOT ---------- */
(function boot(){
  initPWA();
  const p = page();
  if(p==="proyectos.html") bindProjectsPage();
  if(p==="proyecto-detalle.html") bindProjectDetailPage();
  if(p==="apu.html") bindAPUPage();
})();