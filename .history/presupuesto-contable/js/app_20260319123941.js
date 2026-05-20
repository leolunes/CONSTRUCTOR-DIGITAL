function page(){
  const p = location.pathname.split("/").pop().toLowerCase();
  return p || "index.html";
}

/* ==========================================
   PRESUPUESTO ACTIVO / PRESUPUESTO DUAL
   ========================================== */
const BUDGET_OFICIAL = "oficial";
const BUDGET_CONTRATISTA = "contratista";
const DEFAULT_BUDGET = BUDGET_CONTRATISTA;

function normalizeBudgetKey(v){
  const s = String(v || "").trim().toLowerCase();
  return s === BUDGET_OFICIAL ? BUDGET_OFICIAL : BUDGET_CONTRATISTA;
}

function getProjectActiveBudget(projectOrId){
  try{
    const projectId = typeof projectOrId === "string" ? projectOrId : String(projectOrId?.id || "");
    if(projectId && window.StorageAPI?.getActiveBudget){
      return normalizeBudgetKey(StorageAPI.getActiveBudget(projectId));
    }
  }catch(_){}
  return normalizeBudgetKey(projectOrId?.activeBudget || DEFAULT_BUDGET);
}

function getBudgetState(project, budgetKey){
  const p = project || {};
  const key = normalizeBudgetKey(budgetKey || getProjectActiveBudget(project));
  if(p?.budgets && p.budgets[key]) return p.budgets[key];
  return {
    key: BUDGET_CONTRATISTA,
    items: Array.isArray(p.items) ? p.items : [],
    facturacion: Array.isArray(p.facturacion) ? p.facturacion : [],
    apuOverrides: p.apuOverrides || {}
  };
}

function getActiveBudgetItems(project, budgetKey){
  const b = getBudgetState(project, budgetKey);
  return Array.isArray(b?.items) ? b.items : [];
}

function getActiveBudgetFacturacion(project, budgetKey){
  const b = getBudgetState(project, budgetKey);
  return Array.isArray(b?.facturacion) ? b.facturacion : [];
}

function getBudgetLabel(key){
  return normalizeBudgetKey(key) === BUDGET_OFICIAL ? "Presupuesto Oficial" : "Presupuesto Contratista";
}

function renderBudgetSelectorIfPresent(projectId){
  try{
    if(window.UI?.renderBudgetSelector){
      UI.renderBudgetSelector(projectId, "#budgetSelectorHost");
    }
  }catch(_){}
}

function currentBudgetKeyForProject(projectId){
  return getProjectActiveBudget(projectId);
}

function refreshProjectViews(projectId){
  const fresh = StorageAPI.getProjectById(projectId);
  if(!fresh) return;
  renderProjectDetail(fresh);
  renderChaptersTable(fresh);
  renderItemsTable(fresh);
  renderResumenItems(fresh);
  renderFacturacionTables(fresh).catch(()=>{});
  renderExpuriaTable(fresh).catch(()=>{});
  renderBudgetAuditIfPresent(fresh);
}

function addItemCompat(projectId, item, budgetKey){
  const key = normalizeBudgetKey(budgetKey || currentBudgetKeyForProject(projectId));
  if(window.StorageAPI?.addBudgetItem) return StorageAPI.addBudgetItem(projectId, key, item);
  return StorageAPI.addItem(projectId, item);
}

function updateItemCompat(projectId, itemId, patch, budgetKey){
  const key = normalizeBudgetKey(budgetKey || currentBudgetKeyForProject(projectId));
  if(window.StorageAPI?.updateBudgetItem) return StorageAPI.updateBudgetItem(projectId, key, itemId, patch);
  return StorageAPI.updateItem(projectId, itemId, patch);
}

function deleteItemCompat(projectId, itemId, budgetKey){
  const key = normalizeBudgetKey(budgetKey || currentBudgetKeyForProject(projectId));
  if(window.StorageAPI?.deleteBudgetItem) return StorageAPI.deleteBudgetItem(projectId, key, itemId);
  return StorageAPI.deleteItem(projectId, itemId);
}

function updateItemsPUByApuCompat(projectId, apuCode, newPU, budgetKey){
  const key = normalizeBudgetKey(budgetKey || currentBudgetKeyForProject(projectId));
  if(window.StorageAPI?.updateBudgetItemsPUByApuRefCode){
    return StorageAPI.updateBudgetItemsPUByApuRefCode(projectId, key, apuCode, newPU);
  }
  if(window.StorageAPI?.updateItemsPUByApuRefCode){
    return StorageAPI.updateItemsPUByApuRefCode(projectId, apuCode, newPU);
  }
  if(window.StorageAPI?.updateItemsPUByCode){
    return StorageAPI.updateItemsPUByCode(projectId, apuCode, newPU);
  }
  return 0;
}

function listFacturacionCompat(projectOrId, budgetKey){
  const projectId = typeof projectOrId === "string" ? projectOrId : String(projectOrId?.id || "");
  const key = normalizeBudgetKey(budgetKey || currentBudgetKeyForProject(projectId || projectOrId));
  if(projectId && window.StorageAPI?.listBudgetFacturacion){
    return StorageAPI.listBudgetFacturacion(projectId, key);
  }
  return Array.isArray(projectOrId?.facturacion) ? projectOrId.facturacion : [];
}

function saveFacturacionCompat(projectId, rows, budgetKey){
  const project = StorageAPI.getProjectById(projectId);
  if(!project) return null;
  const key = normalizeBudgetKey(budgetKey || currentBudgetKeyForProject(projectId));
  if(window.StorageAPI?.updateProjectBudget){
    const budget = StorageAPI.getProjectBudget(projectId, key);
    return StorageAPI.updateProjectBudget(projectId, key, { ...budget, facturacion: rows });
  }
  return StorageAPI.updateProject(projectId, { facturacion: rows });
}

function getApuOverrideCompat(projectId, code, budgetKey){
  const key = normalizeBudgetKey(budgetKey || currentBudgetKeyForProject(projectId));
  if(window.StorageAPI?.getBudgetApuOverride){
    return StorageAPI.getBudgetApuOverride(projectId, key, code);
  }
  return window.StorageAPI?.getApuOverride ? StorageAPI.getApuOverride(projectId, code) : null;
}

function setApuOverrideCompat(projectId, code, lines, budgetKey){
  const key = normalizeBudgetKey(budgetKey || currentBudgetKeyForProject(projectId));
  if(window.StorageAPI?.setBudgetApuOverride){
    return StorageAPI.setBudgetApuOverride(projectId, key, code, lines);
  }
  return window.StorageAPI?.setApuOverride ? StorageAPI.setApuOverride(projectId, code, lines) : null;
}

function clearApuOverrideCompat(projectId, code, budgetKey){
  const key = normalizeBudgetKey(budgetKey || currentBudgetKeyForProject(projectId));
  if(window.StorageAPI?.clearBudgetApuOverride){
    return StorageAPI.clearBudgetApuOverride(projectId, key, code);
  }
  return window.StorageAPI?.clearApuOverride ? StorageAPI.clearApuOverride(projectId, code) : false;
}

function listBudgetCustomInsumosCompat(projectId, budgetKey){
  const key = normalizeBudgetKey(budgetKey || currentBudgetKeyForProject(projectId));
  if(window.StorageAPI?.listProjectBudgetCustomInsumos){
    return StorageAPI.listProjectBudgetCustomInsumos(projectId, key);
  }
  return window.StorageAPI?.listCustomInsumos ? StorageAPI.listCustomInsumos() : [];
}

function addBudgetCustomInsumoCompat(projectId, payload, budgetKey){
  const key = normalizeBudgetKey(budgetKey || currentBudgetKeyForProject(projectId));
  if(window.StorageAPI?.addProjectBudgetCustomInsumo){
    return StorageAPI.addProjectBudgetCustomInsumo(projectId, key, payload);
  }
  return window.StorageAPI?.addCustomInsumo ? StorageAPI.addCustomInsumo(payload) : null;
}

function getBudgetCustomAPUCompat(projectId, code, budgetKey){
  const key = normalizeBudgetKey(budgetKey || currentBudgetKeyForProject(projectId));
  if(window.StorageAPI?.getProjectBudgetCustomAPU){
    return StorageAPI.getProjectBudgetCustomAPU(projectId, key, code);
  }
  return window.StorageAPI?.getCustomAPU ? StorageAPI.getCustomAPU(code) : null;
}

function upsertBudgetCustomAPUCompat(projectId, apu, budgetKey){
  const key = normalizeBudgetKey(budgetKey || currentBudgetKeyForProject(projectId));
  if(window.StorageAPI?.upsertProjectBudgetCustomAPU){
    return StorageAPI.upsertProjectBudgetCustomAPU(projectId, key, apu);
  }
  return window.StorageAPI?.upsertCustomAPU ? StorageAPI.upsertCustomAPU(apu) : null;
}

function getCalcTotals(project, budgetKey){
  if(window.Calc?.calcTotalsForBudget){
    return Calc.calcTotalsForBudget(project, normalizeBudgetKey(budgetKey || getProjectActiveBudget(project)));
  }
  if(window.Calc?.calcTotals){
    return Calc.calcTotals(project);
  }
  return { directo:0, admin:0, imprev:0, util:0, subtotal:0, ivaUtil:0, total:0 };
}

function getCalcGroups(project, budgetKey){
  if(window.Calc?.groupByChaptersForBudget){
    return Calc.groupByChaptersForBudget(project, normalizeBudgetKey(budgetKey || getProjectActiveBudget(project)));
  }
  if(window.Calc?.groupByChapters){
    return Calc.groupByChapters(project);
  }
  return { groups:[], items:[] };
}

function renderBudgetAuditIfPresent(project){
  const host = UI.qs("#budgetAuditTable");
  const btn = UI.qs("#btnAuditoriaPresupuestal");
  if(btn && !btn.__auditBound){
    btn.__auditBound = true;
    btn.addEventListener("click", ()=>{
      if(typeof window.__projectDetailActivateTab === "function"){
        window.__projectDetailActivateTab("auditoria");
      }
      const fresh = StorageAPI.getProjectById(project.id);
      if(fresh) renderBudgetAuditIfPresent(fresh);
    });
  }

  if(!host || !window.Calc?.compareBudgets) return;

  const comp = Calc.compareBudgets(project, BUDGET_OFICIAL, BUDGET_CONTRATISTA);
  if(window.UI?.renderAuditTable){
    UI.renderAuditTable("#budgetAuditTable", comp);
  }else{
    host.innerHTML = (comp.rows || []).length
      ? `<div class="muted small">Hallazgos comparados: ${comp.rows.length}</div>`
      : `<div class="muted small">No hay datos para auditoría presupuestal.</div>`;
  }

  const sum = UI.qs("#budgetAuditSummary");
  if(sum){
    const s = comp.summary || {};
    sum.innerHTML = `
      <div class="row wrap" style="gap:8px">
        ${UI.chip(`Oficial: ${UI.fmtMoney(Number(s.totalOficial||0), project.currency||"COP")}`,"ok")}
        ${UI.chip(`Contratista: ${UI.fmtMoney(Number(s.totalContratista||0), project.currency||"COP")}`, Number(s.diffTotal||0) > 0 ? "bad" : "ok")}
        ${UI.chip(`Diferencia: ${UI.fmtMoney(Number(s.diffTotal||0), project.currency||"COP")}`, Number(s.diffTotal||0) > 0 ? "bad" : "ok")}
        ${UI.chip(`Δ %: ${Number(s.diffTotalPct||0).toFixed(2)}%`, Number(s.diffTotalPct||0) > 0 ? "bad" : "ok")}
      </div>
    `;
  }
}

/* ==========================================
   iOS/PWA: storage persistente + diagnóstico
   ========================================== */
let __storageWarned = false;
let __persistTried = false;

function isIOS(){
  const ua = navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

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
    const k = "__pcont_ls_test__";
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
    window.__projectDetailActivateTab = activate;
    window.__projectDetailCurrentTab = key;
  }

  tabs.forEach(t => t.addEventListener("click", (e)=>{
    e.preventDefault();
    activate(t.getAttribute("data-tab"));
  }));

  window.__projectDetailActivateTab = activate;

  const tab = UI.getParam("tab");
  activate(tab || tabs[0].getAttribute("data-tab"));
}

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

async function fileToDataUrl(file){
  if(!file) return "";
  const MAX_IMG = 4 * 1024 * 1024;
  if((file.size||0) > MAX_IMG) throw new Error("Imagen demasiado grande. Máx 4MB.");
  return await blobToDataUrl(file);
}

function sanitizeFileName(name){
  return String(name||"archivo")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "archivo";
}

function pct(project, key, legacyKey){
  const v = project?.[key];
  if(Number.isFinite(Number(v))) return Number(v);
  const lv = legacyKey ? project?.[legacyKey] : undefined;
  if(Number.isFinite(Number(lv))) return Number(lv);
  return 0;
}

function totalsCompat(project, budgetKey){
  const t = getCalcTotals(project, budgetKey) || {};
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

function ensureProjectChapters(project){
  const p = project || {};
  if(!Array.isArray(p.chapters)) p.chapters = [];
  p.chapters = p.chapters
    .map(c=>({
      id: String(c?.id || ""),
      chapterCode: String(c?.chapterCode || "").trim(),
      chapterName: String(c?.chapterName || "").trim()
    }))
    .filter(c=>c.chapterCode);
  return p.chapters;
}

function getInferredChaptersFromItems(project, budgetKey){
  try{
    const { groups } = getCalcGroups(project, budgetKey);
    return (groups||[])
      .map(g=>({
        chapterCode: String(g.chapterCode||"").trim(),
        chapterName: String(g.chapterName||"").trim()
      }))
      .filter(x=>x.chapterCode);
  }catch(_){
    const map = new Map();
    for(const it of getActiveBudgetItems(project, budgetKey)){
      const code = String(it.chapterCode || "").trim();
      if(!code) continue;
      if(!map.has(code)){
        map.set(code, { chapterCode: code, chapterName: String(it.chapterName||"").trim() });
      }
    }
    return Array.from(map.values());
  }
}

function getAllChaptersForProject(project, budgetKey){
  const manual = ensureProjectChapters(project).map(c=>({
    chapterCode: c.chapterCode,
    chapterName: c.chapterName
  }));

  const inferred = getInferredChaptersFromItems(project, budgetKey);

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

function lookupChapterName(project, chapterCode, budgetKey){
  const code = String(chapterCode||"").trim();
  if(!code) return "";
  const all = getAllChaptersForProject(project, budgetKey);
  const found = all.find(x=>String(x.chapterCode)===code);
  return found ? String(found.chapterName||"") : "";
}

function makeId(prefix="id"){
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function fmtMoney2(n, currency="COP"){
  const sym = currency === "COP" ? "$ " : "";
  return sym + Number(n || 0).toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function exportProjectExcel(project){
  if(!project) return;

  if(typeof XLSX === "undefined" || !XLSX?.utils){
    alert("No se encontró XLSX. Verifica que está cargado en el HTML.");
    return;
  }

  const budgetKey = getProjectActiveBudget(project);
  const itemsActive = getActiveBudgetItems(project, budgetKey);
  const totals = totalsCompat(project, budgetKey);
  const { groups, items } = getCalcGroups(project, budgetKey);

  const adminPct = pct(project, "adminPct", "aiuPct");
  const imprevPct = pct(project, "imprevPct", null);
  const utilPct = pct(project, "utilPct", null);
  const ivaUtilPct = pct(project, "ivaUtilPct", "ivaPct");

  const resumenAOA = [
    ["FORMATO INSTITUCIONAL"],
    ["Tipo de presupuesto", getBudgetLabel(budgetKey)],
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
    ["Items", itemsActive.length],
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

  const filename = `presupuesto_${normalizeBudgetKey(budgetKey)}_${sanitizeFileName(project.name)}_${Date.now()}.xlsx`;
  UI.downloadBlobUrl(url, filename);
}

function factCategories(){
  return [
    "MATERIALES",
    "EQUIPO Y HERRAMIENTAS",
    "MANO DE OBRA",
    "SUBCONTRATOS",
    "TRANSPORTES",
    "OTROS"
  ];
}

function normalizeFactCategory(value){
  const s = String(value || "").trim().toUpperCase();
  if(
    s === "EQUIPO Y HERRAMIENTA" ||
    s === "EQUIPO Y HERRAM" ||
    s === "EQUIPO/HERRAMIENTAS" ||
    s === "EQUIPO Y HERRAMIENTAS"
  ) return "EQUIPO Y HERRAMIENTAS";
  return s;
}

function classifyLineToFactCategory(line){
  const g = String(line?.group || line?.tipo || "").toUpperCase();
  if(g.includes("MATERIAL")) return "MATERIALES";
  if(g.includes("MANO") && g.includes("OBRA")) return "MANO DE OBRA";
  if(g.includes("SUBCONTRAT")) return "SUBCONTRATOS";
  if(g.includes("TRANSP")) return "TRANSPORTES";
  if(g.includes("EQUIPO") || g.includes("HERRAM") || g.includes("MAQUIN")) return "EQUIPO Y HERRAMIENTAS";
  return "OTROS";
}

function getProjectFacturacion(project, budgetKey){
  return getActiveBudgetFacturacion(project, budgetKey);
}

function normalizeText(s){
  return String(s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeText(s){
  const t = normalizeText(s);
  if(!t) return [];
  return t.split(" ").filter(x => x.length >= 3);
}

function tokenOverlapScore(a, b){
  const sa = new Set(tokenizeText(a));
  const sb = new Set(tokenizeText(b));
  if(!sa.size || !sb.size) return 0;
  let inter = 0;
  for(const x of sa){
    if(sb.has(x)) inter++;
  }
  return inter / Math.max(sa.size, sb.size);
}

function placesLookDifferent(a, b){
  const na = normalizeText(a);
  const nb = normalizeText(b);
  if(!na || !nb) return false;
  if(na === nb) return false;
  if(na.includes(nb) || nb.includes(na)) return false;

  const sa = new Set(tokenizeText(na));
  const sb = new Set(tokenizeText(nb));
  let inter = 0;
  for(const x of sa){
    if(sb.has(x)) inter++;
  }
  return inter === 0;
}

async function getAPULinesForProjectItem(project, item, budgetKey){
  const apuCode = String(item?.apuRefCode || item?.code || "").trim();
  if(!apuCode) return [];

  const key = normalizeBudgetKey(budgetKey || getProjectActiveBudget(project));

  try{
    const ov = getApuOverrideCompat(project.id, apuCode, key);
    if(ov && Array.isArray(ov.lines)) return ov.lines;
  }catch(_){}

  try{
    const custom = getBudgetCustomAPUCompat(project.id, apuCode, key);
    if(custom && Array.isArray(custom.lines)) return custom.lines;
  }catch(_){}

  try{
    if(window.StorageAPI?.getCustomAPU){
      const globalCustom = StorageAPI.getCustomAPU(apuCode);
      if(globalCustom && Array.isArray(globalCustom.lines)) return globalCustom.lines;
    }
  }catch(_){}

  try{
    if(window.APUBase?.getAPU){
      const apu = await APUBase.getAPU(apuCode);
      if(apu && Array.isArray(apu.lines)) return apu.lines;
    }
  }catch(_){}

  return [];
}

async function calcProjectedFacturacion(project, budgetKey){
  const items = getActiveBudgetItems(project, budgetKey);
  const cats = factCategories();
  const projected = {};
  for(const c of cats) projected[c] = 0;

  for(const it of items){
    const qtyItem = Number(it.qty || 0);
    const lines = await getAPULinesForProjectItem(project, it, budgetKey);

    for(const ln of lines){
      const cat = classifyLineToFactCategory(ln);
      const qty = Number(ln.qty || 0);
      const pu = Number(ln.pu || 0);
      const parcial = Number(ln.parcial || 0) || (qty * pu);
      projected[cat] += (parcial * qtyItem);
    }
  }

  return projected;
}

async function buildExpectedResourcesIndex(project, budgetKey){
  const items = getActiveBudgetItems(project, budgetKey);
  const byCategory = {};
  const byChapterCategory = {};

  for(const c of factCategories()){
    byCategory[c] = [];
  }

  for(const it of items){
    const chapterCode = String(it.chapterCode || "").trim();
    const chapterName = String(it.chapterName || "").trim();
    const lines = await getAPULinesForProjectItem(project, it, budgetKey);

    for(const ln of lines){
      const category = classifyLineToFactCategory(ln);
      const desc = String(ln.desc || "").trim();
      if(!desc) continue;

      const resource = {
        desc,
        unit: String(ln.unit || "").trim(),
        itemCode: String(it.code || "").trim(),
        itemDesc: String(it.desc || "").trim(),
        chapterCode,
        chapterName
      };

      byCategory[category].push(resource);

      const key = `${chapterCode}||${category}`;
      if(!byChapterCategory[key]) byChapterCategory[key] = [];
      byChapterCategory[key].push(resource);
    }
  }

  return { byCategory, byChapterCategory };
}

function dedupeByDesc(list){
  const out = [];
  const seen = new Set();
  for(const x of (list || [])){
    const k = normalizeText(x?.desc || "");
    if(!k || seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
}

function findConceptMatchInExpected(concepto, expectedList){
  const text = String(concepto || "").trim();
  if(!text) return { found: true, score: 1, hit: null };

  let best = null;
  let bestScore = 0;

  for(const x of (expectedList || [])){
    const score = tokenOverlapScore(text, x.desc || "");
    if(score > bestScore){
      bestScore = score;
      best = x;
    }
  }

  return {
    found: bestScore >= 0.45,
    score: bestScore,
    hit: best
  };
}

async function analyzeFacturacionExpuria(project, budgetKey){
  const key = normalizeBudgetKey(budgetKey || getProjectActiveBudget(project));
  const factRows = getProjectFacturacion(project, key);
  const expected = await buildExpectedResourcesIndex(project, key);
  const projected = await calcProjectedFacturacion(project, key);
  const projectLocation = String(project?.location || "").trim();

  const findings = [];

  for(const r of factRows){
    const categoria = normalizeFactCategory(r.categoria);
    const chapterCode = String(r.chapterCode || "").trim();
    const chapterName = String(r.chapterName || "").trim();
    const observacion = String(r.observacion || "").trim();
    const lugarFacturacion = String(r.lugarFacturacion || "").trim();
    const lugarEntrega = String(r.lugarEntrega || "").trim();
    const valor = Number(r.valor || 0);

    const expectedCat = dedupeByDesc(expected.byCategory[categoria] || []);
    const expectedChapterCat = dedupeByDesc(expected.byChapterCategory[`${chapterCode}||${categoria}`] || []);

    if(Number(projected[categoria] || 0) <= 0){
      findings.push({
        sourceId: r.id,
        fecha: r.fecha || "",
        chapterCode,
        chapterName,
        categoria,
        proveedor: r.proveedor || "",
        lugarFacturacion,
        lugarEntrega,
        tipo: "CATEGORÍA NO CONTEMPLADA",
        detalle: `La categoría ${categoria} no tiene soporte proyectado dentro del presupuesto activo.`,
        valor
      });
    }

    if(chapterCode && expectedChapterCat.length === 0){
      findings.push({
        sourceId: r.id,
        fecha: r.fecha || "",
        chapterCode,
        chapterName,
        categoria,
        proveedor: r.proveedor || "",
        lugarFacturacion,
        lugarEntrega,
        tipo: "CAPÍTULO / CATEGORÍA NO CONTEMPLADA",
        detalle: `No se encontraron recursos de la categoría ${categoria} asociados al capítulo ${chapterCode}${chapterName ? " - " + chapterName : ""}.`,
        valor
      });
    }

    if(observacion){
      const baseList = chapterCode && expectedChapterCat.length ? expectedChapterCat : expectedCat;
      const match = findConceptMatchInExpected(observacion, baseList);

      if(baseList.length && !match.found){
        findings.push({
          sourceId: r.id,
          fecha: r.fecha || "",
          chapterCode,
          chapterName,
          categoria,
          proveedor: r.proveedor || "",
          lugarFacturacion,
          lugarEntrega,
          tipo: "CONCEPTO NO CONTEMPLADO",
          detalle: `El concepto reportado en soporte/observación no coincide con los recursos esperados de la categoría ${categoria}${chapterCode ? " para el capítulo " + chapterCode : ""}.`,
          valor
        });
      }

      if(!baseList.length && observacion){
        findings.push({
          sourceId: r.id,
          fecha: r.fecha || "",
          chapterCode,
          chapterName,
          categoria,
          proveedor: r.proveedor || "",
          lugarFacturacion,
          lugarEntrega,
          tipo: "SIN RECURSO ESPERADO PARA CONTRASTE",
          detalle: `Se registró un concepto facturado, pero no existe en el presupuesto una base esperada equivalente para la categoría ${categoria}${chapterCode ? " / capítulo " + chapterCode : ""}.`,
          valor
        });
      }
    }

    if(projectLocation && lugarFacturacion && placesLookDifferent(lugarFacturacion, projectLocation)){
      findings.push({
        sourceId: r.id,
        fecha: r.fecha || "",
        chapterCode,
        chapterName,
        categoria,
        proveedor: r.proveedor || "",
        lugarFacturacion,
        lugarEntrega,
        tipo: "LUGAR DE FACTURACIÓN DIFERENTE",
        detalle: `El lugar de facturación (${lugarFacturacion}) difiere del sitio del proyecto (${projectLocation}).`,
        valor
      });
    }

    if(projectLocation && lugarEntrega && placesLookDifferent(lugarEntrega, projectLocation)){
      findings.push({
        sourceId: r.id,
        fecha: r.fecha || "",
        chapterCode,
        chapterName,
        categoria,
        proveedor: r.proveedor || "",
        lugarFacturacion,
        lugarEntrega,
        tipo: "LUGAR DE ENTREGA DIFERENTE",
        detalle: `El lugar de entrega (${lugarEntrega}) difiere del sitio del proyecto (${projectLocation}).`,
        valor
      });
    }
  }

  const summaryMap = new Map();
  for(const f of findings){
    const k = String(f.tipo || "HALLAZGO");
    if(!summaryMap.has(k)){
      summaryMap.set(k, { tipo: k, cantidad: 0, valor: 0 });
    }
    const rec = summaryMap.get(k);
    rec.cantidad += 1;
    rec.valor += Number(f.valor || 0);
  }

  return {
    findings,
    summary: Array.from(summaryMap.values()),
    totalObserved: findings.reduce((s,x)=> s + Number(x.valor || 0), 0)
  };
}

function refreshFacturacionChapterOptions(project){
  const sel = UI.qs("#factChapterCode");
  const inpName = UI.qs("#factChapterName");
  if(!sel) return;

  const chapters = getAllChaptersForProject(project);

  sel.innerHTML = `<option value="">Seleccione capítulo</option>` + chapters.map(c=>{
    const label = `${c.chapterCode} — ${c.chapterName || ""}`.trim();
    return `<option value="${UI.esc(c.chapterCode)}">${UI.esc(label)}</option>`;
  }).join("");

  const syncName = ()=>{
    const code = String(sel.value || "").trim();
    const name = code ? lookupChapterName(project, code) : "";
    if(inpName) inpName.value = name;
  };

  sel.onchange = syncName;
  syncName();
}

async function renderFacturacionTables(project){
  const resumenBody = UI.qs("#facturacionResumenBody");
  const resumenEmpty = UI.qs("#facturacionResumenEmpty");
  const factBody = UI.qs("#facturacionBody");
  const factEmpty = UI.qs("#facturacionEmpty");
  const title = UI.qs("#factBudgetTitle");
  if(!resumenBody || !factBody) return;

  const budgetKey = getProjectActiveBudget(project);
  if(title) title.textContent = `Facturación — ${getBudgetLabel(budgetKey)}`;

  refreshFacturacionChapterOptions(project);

  const rows = getProjectFacturacion(project, budgetKey).slice().sort((a,b)=> String(b.fecha||"").localeCompare(String(a.fecha||"")));
  const cats = factCategories();

  const projected = await calcProjectedFacturacion(project, budgetKey);

  const facturado = {};
  for(const c of cats) facturado[c] = 0;

  for(const r of rows){
    const cat = normalizeFactCategory(r.categoria);
    if(!(cat in facturado)) facturado[cat] = 0;
    facturado[cat] += Number(r.valor || 0);
  }

  resumenBody.innerHTML = cats.map(cat=>{
    const p = Number(projected[cat] || 0);
    const f = Number(facturado[cat] || 0);
    const d = f - p;

    let estado = "COINCIDE";
    if(f > p) estado = "SOBREFACTURADO";
    else if(f < p) estado = "POR DEBAJO";

    return `
      <tr>
        <td><b>${UI.esc(cat)}</b></td>
        <td style="text-align:right">${UI.fmtMoney(p, project.currency||"COP")}</td>
        <td style="text-align:right">${UI.fmtMoney(f, project.currency||"COP")}</td>
        <td style="text-align:right">${UI.fmtMoney(d, project.currency||"COP")}</td>
        <td>${UI.esc(estado)}</td>
      </tr>
    `;
  }).join("");

  if(resumenEmpty) resumenEmpty.style.display = rows.length ? "none" : "";

  if(!rows.length){
    factBody.innerHTML = "";
    if(factEmpty) factEmpty.style.display = "";
    return;
  }
  if(factEmpty) factEmpty.style.display = "none";

  factBody.innerHTML = rows.map(r=>`
    <tr>
      <td>${UI.esc(String(r.fecha || "").slice(0,10))}</td>
      <td>${UI.esc((r.chapterCode || "") + ((r.chapterName || "") ? " - " + (r.chapterName || "") : ""))}</td>
      <td>${UI.esc(r.categoria || "")}</td>
      <td>${UI.esc(r.proveedor || "")}</td>
      <td>${UI.esc(r.lugarFacturacion || "")}</td>
      <td>${UI.esc(r.lugarEntrega || "")}</td>
      <td style="text-align:right">${UI.fmtMoney(Number(r.valor||0), project.currency||"COP")}</td>
      <td>${UI.esc(r.observacion || "")}</td>
      <td>
        <button class="btn danger" type="button" data-delfact="${UI.esc(r.id)}">Eliminar</button>
      </td>
    </tr>
  `).join("");

  factBody.querySelectorAll("[data-delfact]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-delfact");
      const fresh = StorageAPI.getProjectById(project.id);
      if(!fresh) return;

      const budget = getProjectActiveBudget(fresh);
      const next = getProjectFacturacion(fresh, budget).filter(x => String(x.id) !== String(id));
      saveFacturacionCompat(fresh.id, next, budget);

      const updated = StorageAPI.getProjectById(fresh.id);
      renderFacturacionTables(updated).catch(()=>{});
      renderExpuriaTable(updated).catch(()=>{});
    });
  });
}

async function renderExpuriaTable(project){
  const countChip = UI.qs("#expuriaCountChip");
  const totalChip = UI.qs("#expuriaTotalChip");
  const resumenBody = UI.qs("#expuriaResumenBody");
  const resumenEmpty = UI.qs("#expuriaResumenEmpty");
  const body = UI.qs("#expuriaBody");
  const empty = UI.qs("#expuriaEmpty");
  if(!body || !resumenBody) return;

  const budgetKey = getProjectActiveBudget(project);
  const analysis = await analyzeFacturacionExpuria(project, budgetKey);
  const rows = analysis.findings || [];
  const summary = analysis.summary || [];
  const totalObserved = Number(analysis.totalObserved || 0);

  if(countChip){
    countChip.innerHTML = UI.chip(`${getBudgetLabel(budgetKey)} · ${String(rows.length)}`, rows.length ? "bad" : "ok");
  }
  if(totalChip){
    totalChip.innerHTML = UI.chip(UI.fmtMoney(totalObserved, project.currency || "COP"), rows.length ? "bad" : "ok");
  }

  if(!summary.length){
    resumenBody.innerHTML = "";
    if(resumenEmpty) resumenEmpty.style.display = "";
  }else{
    if(resumenEmpty) resumenEmpty.style.display = "none";
    resumenBody.innerHTML = summary.map(r=>`
      <tr>
        <td><b>${UI.esc(r.tipo || "")}</b></td>
        <td style="text-align:right">${UI.esc(String(r.cantidad || 0))}</td>
        <td style="text-align:right">${UI.fmtMoney(Number(r.valor || 0), project.currency || "COP")}</td>
      </tr>
    `).join("");
  }

  if(!rows.length){
    body.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }

  if(empty) empty.style.display = "none";

  body.innerHTML = rows.map(r=>`
    <tr>
      <td>${UI.esc(String(r.fecha || "").slice(0,10))}</td>
      <td>${UI.esc((r.chapterCode || "") + ((r.chapterName || "") ? " - " + (r.chapterName || "") : ""))}</td>
      <td>${UI.esc(r.categoria || "")}</td>
      <td>${UI.esc(r.proveedor || "")}</td>
      <td>${UI.esc(r.lugarFacturacion || "")}</td>
      <td>${UI.esc(r.lugarEntrega || "")}</td>
      <td><b>${UI.esc(r.tipo || "")}</b></td>
      <td>${UI.esc(r.detalle || "")}</td>
      <td style="text-align:right">${UI.fmtMoney(Number(r.valor || 0), project.currency || "COP")}</td>
    </tr>
  `).join("");
}

function bindFacturacionUI(projectId){
  const btnFact = UI.qs("#btnFacturacion");
  const btnExp = UI.qs("#btnFacturacionExpuria");
  const formFact = UI.qs("#formFacturacionCategoria");

  btnFact?.addEventListener("click", ()=>{
    if(typeof window.__projectDetailActivateTab === "function"){
      window.__projectDetailActivateTab("facturacion");
    }
  });

  btnExp?.addEventListener("click", ()=>{
    if(typeof window.__projectDetailActivateTab === "function"){
      window.__projectDetailActivateTab("expuria");
    }
  });

  formFact?.addEventListener("submit", (e)=>{
    e.preventDefault();

    const fresh = StorageAPI.getProjectById(projectId);
    if(!fresh) return;

    const budgetKey = currentBudgetKeyForProject(projectId);
    const fd = new FormData(formFact);
    const categoria = normalizeFactCategory(fd.get("categoria"));
    const chapterCode = String(fd.get("chapterCode") || "").trim();
    const chapterName = String(fd.get("chapterName") || "").trim() || lookupChapterName(fresh, chapterCode);
    const valor = Number(String(fd.get("valor") || "0").replaceAll(",",""));
    const proveedor = String(fd.get("proveedor") || "").trim();
    const fechaInput = String(fd.get("fecha") || "").trim();
    const lugarFacturacion = String(fd.get("lugarFacturacion") || "").trim();
    const lugarEntrega = String(fd.get("lugarEntrega") || "").trim();
    const observacion = String(fd.get("observacion") || "").trim();

    if(!categoria){
      alert("Seleccione la categoría.");
      return;
    }
    if(!chapterCode){
      alert("Seleccione el capítulo al cual se asigna la factura.");
      return;
    }
    if(!(valor > 0)){
      alert("El valor facturado debe ser mayor a 0.");
      return;
    }
    if(!proveedor){
      alert("Escriba el proveedor.");
      return;
    }
    if(!fechaInput){
      alert("Seleccione la fecha de la factura.");
      return;
    }

    const next = getProjectFacturacion(fresh, budgetKey).slice();
    next.push({
      id: makeId("fact"),
      fecha: fechaInput,
      categoria,
      chapterCode,
      chapterName,
      valor,
      proveedor,
      lugarFacturacion,
      lugarEntrega,
      observacion
    });

    saveFacturacionCompat(projectId, next, budgetKey);
    formFact.reset();

    const updated = StorageAPI.getProjectById(projectId);
    refreshFacturacionChapterOptions(updated);
    renderFacturacionTables(updated).catch(()=>{});
    renderExpuriaTable(updated).catch(()=>{});
  });
}

/* ==========================================
   ÍTEM MANUAL CON APU
   ========================================== */
const __manualItemState = {
  projectId: "",
  mode: "nuevo",
  baseApu: null,
  lines: []
};

function parseMoneyInput(v){
  return Number(String(v || "0").replaceAll(",",""));
}

function computeLinesTotal(lines){
  return (lines || []).reduce((s, ln)=>{
    const qty = Number(ln.qty || 0);
    const pu = Number(ln.pu || 0);
    const parcial = Number(ln.parcial || 0) || (qty * pu);
    return s + parcial;
  }, 0);
}

function normalizeManualLine(line){
  const qty = Number(line?.qty || 0);
  const pu = Number(line?.pu || 0);
  const parcial = Number(line?.parcial || 0) || (qty * pu);
  return {
    group: String(line?.group || line?.tipo || "OTROS").trim(),
    desc: String(line?.desc || "").trim(),
    unit: String(line?.unit || "").trim(),
    qty,
    pu,
    parcial
  };
}

function syncManualChapterName(project){
  const inpCode = UI.qs("#manualChapterCode");
  const inpName = UI.qs("#manualChapterName");
  if(!inpCode || !inpName) return;

  const chapterCode = String(inpCode.value || "").trim();
  if(!chapterCode){
    return;
  }
  if(!String(inpName.value || "").trim()){
    inpName.value = lookupChapterName(project, chapterCode) || "";
  }
}

function syncManualApuTotals(){
  const total = computeLinesTotal(__manualItemState.lines);
  const chip = UI.qs("#manualApuTotalChip");
  const inpPU = UI.qs("#manualCalculatedPU");
  const inpCode = UI.qs("#manualCode");
  const inpRef = UI.qs("#manualApuRefCode");

  if(chip) chip.textContent = `PU APU: ${UI.fmtMoney(total, "COP")}`;
  if(inpPU) inpPU.value = UI.fmtMoney(total, "COP");

  const itemCode = String(inpCode?.value || "").trim();
  if(inpRef){
    inpRef.value = itemCode || "";
  }
}

function renderManualApuLines(){
  const body = UI.qs("#manualApuLinesBody");
  const empty = UI.qs("#manualApuLinesEmpty");
  if(!body) return;

  if(!__manualItemState.lines.length){
    body.innerHTML = "";
    if(empty) empty.style.display = "";
    syncManualApuTotals();
    return;
  }

  if(empty) empty.style.display = "none";

  body.innerHTML = __manualItemState.lines.map((ln, idx)=>{
    const parcial = Number(ln.parcial || 0) || (Number(ln.qty||0) * Number(ln.pu||0));
    return `
      <tr>
        <td>${UI.esc(ln.group || "")}</td>
        <td>${UI.esc(ln.desc || "")}</td>
        <td>${UI.esc(ln.unit || "")}</td>
        <td style="text-align:right">${UI.esc(String(ln.qty || 0))}</td>
        <td style="text-align:right"><b>${UI.fmtMoney(Number(ln.pu || 0), "COP")}</b></td>
        <td style="text-align:right"><b>${fmtMoney2(parcial, "COP")}</b></td>
        <td class="row" style="gap:8px">
          <button class="btn" type="button" data-manual-line-edit="${idx}">Editar</button>
          <button class="btn danger" type="button" data-manual-line-del="${idx}">Quitar</button>
        </td>
      </tr>
    `;
  }).join("");

  body.querySelectorAll("[data-manual-line-del]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const idx = Number(btn.getAttribute("data-manual-line-del"));
      __manualItemState.lines.splice(idx, 1);
      renderManualApuLines();
    });
  });

  body.querySelectorAll("[data-manual-line-edit]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const idx = Number(btn.getAttribute("data-manual-line-edit"));
      const cur = __manualItemState.lines[idx];
      if(!cur) return;

      const group = prompt("Tipo / grupo:", cur.group || "") ?? cur.group;
      const desc = prompt("Descripción:", cur.desc || "") ?? cur.desc;
      const unit = prompt("Unidad:", cur.unit || "") ?? cur.unit;
      const qty = Number(prompt("Cantidad:", String(cur.qty || 0)) ?? cur.qty);
      const pu = Number(prompt("PU:", String(cur.pu || 0)) ?? cur.pu);

      if(!String(desc || "").trim()){
        alert("La descripción no puede quedar vacía.");
        return;
      }
      if(!(qty > 0)){
        alert("La cantidad debe ser mayor a 0.");
        return;
      }
      if(!(pu >= 0)){
        alert("El PU no es válido.");
        return;
      }

      __manualItemState.lines[idx] = normalizeManualLine({ group, desc, unit, qty, pu, parcial: qty * pu });
      renderManualApuLines();
    });
  });

  syncManualApuTotals();
}

async function searchManualInsumos(projectId, term){
  const q = String(term || "").trim();
  let baseRows = [];
  let customRows = [];

  try{
    const meta = await APUBase.getMeta();
    if(meta){
      baseRows = await APUBase.listInsumos(q, 80);
    }
  }catch(_){}

  try{
    customRows = listBudgetCustomInsumosCompat(projectId).filter(r=>{
      const hay = `${r.tipo || ""} ${r.desc || ""} ${r.unit || ""}`.toLowerCase();
      return !q || hay.includes(q.toLowerCase());
    }).map(r=>({
      tipo: r.tipo || "",
      desc: r.desc || "",
      unit: r.unit || "",
      pu: Number(r.pu || 0),
      _source: "custom"
    }));
  }catch(_){}

  const merged = [...baseRows.map(r=>({ ...r, _source:"base" })), ...customRows];
  const seen = new Set();
  const out = [];

  for(const r of merged){
    const k = `${String(r.tipo||"").trim()}|${String(r.desc||"").trim()}|${String(r.unit||"").trim()}|${Number(r.pu||0)}`;
    if(seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out.slice(0, 120);
}

function renderManualInsumoResults(results){
  const body = UI.qs("#manualInsumoResultsBody");
  const empty = UI.qs("#manualInsumoResultsEmpty");
  if(!body) return;

  if(!results || !results.length){
    body.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  body.innerHTML = results.map((r, idx)=>`
    <tr>
      <td>${UI.esc(r.tipo || "")}</td>
      <td>${UI.esc(r.desc || "")}</td>
      <td>${UI.esc(r.unit || "")}</td>
      <td style="text-align:right"><b>${UI.fmtMoney(Number(r.pu || 0), "COP")}</b></td>
      <td>
        <button class="btn primary" type="button" data-manual-insumo-add="${idx}">Agregar</button>
      </td>
    </tr>
  `).join("");

  body.querySelectorAll("[data-manual-insumo-add]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const idx = Number(btn.getAttribute("data-manual-insumo-add"));
      const r = results[idx];
      if(!r) return;

      const qty = Number(prompt(`Cantidad para "${r.desc}"`, "1") || "0");
      if(!(qty > 0)){
        alert("La cantidad debe ser mayor a 0.");
        return;
      }

      __manualItemState.lines.push(normalizeManualLine({
        group: r.tipo || "OTROS",
        desc: r.desc || "",
        unit: r.unit || "",
        qty,
        pu: Number(r.pu || 0)
      }));
      renderManualApuLines();
    });
  });
}