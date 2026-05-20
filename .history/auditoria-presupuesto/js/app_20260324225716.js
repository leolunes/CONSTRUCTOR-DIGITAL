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
   ✅ NUEVO: compat para presupuesto oficial
   - No rompe el presupuesto base existente
   ========================================== */
function cloneProjectWithBudgetView(project, mode){
  const p = project ? JSON.parse(JSON.stringify(project)) : {};
  const budgetMode = String(mode || "base").toLowerCase();

  if(window.ProjectModel && typeof ProjectModel.getBudgetView === "function"){
    try{
      return ProjectModel.getBudgetView(project, budgetMode);
    }catch(_){}
  }

  if(budgetMode === "oficial"){
    p.items = Array.isArray(project?.oficialItems) ? project.oficialItems : [];
    p.chapters = Array.isArray(project?.oficialChapters) ? project.oficialChapters : [];
    p.apuOverrides = project?.oficialApuOverrides || {};
    p.__budgetMode = "oficial";
  }else{
    p.items = Array.isArray(project?.items) ? project.items : [];
    p.chapters = Array.isArray(project?.chapters) ? project.chapters : [];
    p.apuOverrides = project?.apuOverrides || {};
    p.__budgetMode = "base";
  }

  return p;
}

function budgetLabel(mode){
  return String(mode||"base").toLowerCase() === "oficial"
    ? "Presupuesto Oficial"
    : "Presupuesto Base";
}

function getBudgetModeFromUI(){
  const sel = UI.qs("#budgetMode");
  if(!sel) return "base";
  return String(sel.value || "base").toLowerCase() === "oficial" ? "oficial" : "base";
}

function getProjectView(project, mode){
  return cloneProjectWithBudgetView(project, mode || getBudgetModeFromUI());
}

function getProjectItemsByMode(project, mode){
  return String(mode||"base").toLowerCase() === "oficial"
    ? (Array.isArray(project?.oficialItems) ? project.oficialItems : [])
    : (Array.isArray(project?.items) ? project.items : []);
}

function getProjectChaptersByMode(project, mode){
  return String(mode||"base").toLowerCase() === "oficial"
    ? (Array.isArray(project?.oficialChapters) ? project.oficialChapters : [])
    : (Array.isArray(project?.chapters) ? project.chapters : []);
}

function getBudgetCounts(project){
  return {
    baseItems: Array.isArray(project?.items) ? project.items.length : 0,
    oficialItems: Array.isArray(project?.oficialItems) ? project.oficialItems.length : 0,
    baseChapters: Array.isArray(project?.chapters) ? project.chapters.length : 0,
    oficialChapters: Array.isArray(project?.oficialChapters) ? project.oficialChapters.length : 0
  };
}

/* ==========================================
   ✅ NUEVO: comparación base vs oficial
   - Usa compare.js si existe
   - Si no existe, cae al comparador interno
   ========================================== */
function indexItemsForCompare(items){
  const map = new Map();

  for(const it of (items||[])){
    const keyCode = String(it?.code || "").trim();
    const keyRef = String(it?.apuRefCode || "").trim();
    const keyDesc = String(it?.desc || "").trim().toLowerCase();

    const key =
      keyRef ? `ref:${keyRef}` :
      keyCode ? `code:${keyCode}` :
      `desc:${keyDesc}`;

    map.set(key, {
      id: it?.id || "",
      chapterCode: String(it?.chapterCode || "").trim(),
      chapterName: String(it?.chapterName || "").trim(),
      code: keyCode,
      apuRefCode: keyRef,
      desc: String(it?.desc || "").trim(),
      unit: String(it?.unit || "").trim(),
      pu: Number(it?.pu || 0),
      qty: Number(it?.qty || 0),
      parcial: Number(it?.pu || 0) * Number(it?.qty || 0)
    });
  }

  return map;
}

function compareBudgets(project){
  if(window.Compare && typeof Compare.compareProject === "function"){
    try{
      return Compare.compareProject(project);
    }catch(_){}
  }

  const baseItems = Array.isArray(project?.items) ? project.items : [];
  const oficialItems = Array.isArray(project?.oficialItems) ? project.oficialItems : [];

  const baseMap = indexItemsForCompare(baseItems);
  const ofMap = indexItemsForCompare(oficialItems);

  const keys = new Set([...baseMap.keys(), ...ofMap.keys()]);
  const rows = [];

  for(const key of keys){
    const b = baseMap.get(key) || null;
    const o = ofMap.get(key) || null;

    const puBase = Number(b?.pu || 0);
    const puOf = Number(o?.pu || 0);
    const qtyBase = Number(b?.qty || 0);
    const qtyOf = Number(o?.qty || 0);
    const parcialBase = Number(b?.parcial || 0);
    const parcialOf = Number(o?.parcial || 0);

    rows.push({
      key,
      code: o?.code || b?.code || "",
      apuRefCode: o?.apuRefCode || b?.apuRefCode || "",
      desc: o?.desc || b?.desc || "",
      unit: o?.unit || b?.unit || "",
      base: b,
      oficial: o,
      puBase,
      puOficial: puOf,
      puDiff: puOf - puBase,
      qtyBase,
      qtyOficial: qtyOf,
      qtyDiff: qtyOf - qtyBase,
      parcialBase,
      parcialOficial: parcialOf,
      parcialDiff: parcialOf - parcialBase
    });
  }

  const totalsBase = totalsCompat(cloneProjectWithBudgetView(project, "base"));
  const totalsOf = totalsCompat(cloneProjectWithBudgetView(project, "oficial"));

  return {
    rows,
    totals: {
      base: totalsBase,
      oficial: totalsOf,
      diffTotal: Number(totalsOf.total||0) - Number(totalsBase.total||0),
      diffDirecto: Number(totalsOf.directo||0) - Number(totalsBase.directo||0)
    }
  };
}

/* ==========================================
   ✅ NUEVO: Capítulos manuales por proyecto
   - Base: project.chapters
   - Oficial: project.oficialChapters
   ========================================== */
function ensureProjectChapters(project, mode="base"){
  const isOfficial = String(mode||"base").toLowerCase() === "oficial";
  const key = isOfficial ? "oficialChapters" : "chapters";
  const p = project || {};

  if(!Array.isArray(p[key])) p[key] = [];

  p[key] = p[key]
    .map(c=>({
      id: String(c?.id || ""),
      chapterCode: String(c?.chapterCode || "").trim(),
      chapterName: String(c?.chapterName || "").trim()
    }))
    .filter(c=>c.chapterCode);

  return p[key];
}

function getInferredChaptersFromItems(project, mode="base"){
  const view = getProjectView(project, mode);

  try{
    const { groups } = Calc.groupByChapters(view);
    return (groups||[])
      .map(g=>({
        chapterCode: String(g.chapterCode||"").trim(),
        chapterName: String(g.chapterName||"").trim()
      }))
      .filter(x=>x.chapterCode);
  }catch(_){
    const map = new Map();
    for(const it of (view?.items||[])){
      const code = String(it.chapterCode || "").trim();
      if(!code) continue;
      if(!map.has(code)){
        map.set(code, { chapterCode: code, chapterName: String(it.chapterName||"").trim() });
      }
    }
    return Array.from(map.values());
  }
}

function getAllChaptersForProject(project, mode="base"){
  const manual = ensureProjectChapters(project, mode).map(c=>({
    chapterCode: c.chapterCode,
    chapterName: c.chapterName
  }));

  const inferred = getInferredChaptersFromItems(project, mode);

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

function lookupChapterName(project, chapterCode, mode="base"){
  const code = String(chapterCode||"").trim();
  if(!code) return "";
  const all = getAllChaptersForProject(project, mode);
  const found = all.find(x=>String(x.chapterCode)===code);
  return found ? String(found.chapterName||"") : "";
}

function makeId(prefix="id"){
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

/* ==========================================
   ✅ Helper: actualizar PU por APU real (apuRefCode)
   ========================================== */
function updateItemsPUByApuCompat(projectId, apuCode, newPU, mode="base"){
  const budgetMode = String(mode||"base").toLowerCase();

  if(budgetMode === "oficial"){
    if(window.StorageAPI && typeof StorageAPI.updateOfficialItemsPUByApuRefCode === "function"){
      return StorageAPI.updateOfficialItemsPUByApuRefCode(projectId, apuCode, newPU);
    }
    if(window.StorageAPI && typeof StorageAPI.updateOfficialItemsPUByCode === "function"){
      return StorageAPI.updateOfficialItemsPUByCode(projectId, apuCode, newPU);
    }
    return 0;
  }

  if(window.StorageAPI && typeof StorageAPI.updateItemsPUByApuRefCode === "function"){
    return StorageAPI.updateItemsPUByApuRefCode(projectId, apuCode, newPU);
  }
  if(window.StorageAPI && typeof StorageAPI.updateItemsPUByCode === "function"){
    return StorageAPI.updateItemsPUByCode(projectId, apuCode, newPU);
  }
  return 0;
}

/* ==========================================
   Export Excel
   - Usa excel-export.js si existe
   - Si no existe, mantiene fallback interno
   ========================================== */
function exportProjectExcel(project, mode="base"){
  if(!project) return;

  if(window.ExcelExport && typeof ExcelExport.exportBudgetWorkbook === "function"){
    try{
      return ExcelExport.exportBudgetWorkbook(project, mode);
    }catch(_){}
  }

  if(typeof XLSX === "undefined" || !XLSX?.utils){
    alert("No se encontró XLSX. Verifica que está cargado en el HTML.");
    return;
  }

  const view = getProjectView(project, mode);
  const totals = totalsCompat(view);
  const { groups, items } = Calc.groupByChapters(view);

  const adminPct = pct(project, "adminPct", "aiuPct");
  const imprevPct = pct(project, "imprevPct", null);
  const utilPct = pct(project, "utilPct", null);
  const ivaUtilPct = pct(project, "ivaUtilPct", "ivaPct");
  const label = budgetLabel(mode);

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
    ["TIPO DE PRESUPUESTO", label],
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
    ["Items", (view.items||[]).length],
    ["Capítulos", (groups||[]).length],
  ];

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenAOA);

  const capsRows = (groups||[]).map(g=>({
    Capitulo: String(g.chapterCode||""),
    Nombre: String(g.chapterName||""),
    Items: Number(g.itemsCount||0),
    Subtotal: Number(g.subtotal||0),
    Moneda: project.currency || "COP",
    Tipo_Presupuesto: label
  }));
  const wsCaps = XLSX.utils.json_to_sheet(capsRows.length ? capsRows : [{
    Capitulo:"",Nombre:"",Items:"",Subtotal:"",Moneda:project.currency||"COP",Tipo_Presupuesto:label
  }]);

  const itemsRows = (items||[]).map(it=>{
    const parcial = Number(it.pu||0) * Number(it.qty||0);
    const cap = it.chapterCode || (String(it.code||"").split(".")[0] || "");
    return {
      Tipo_Presupuesto: label,
      Capitulo: String(cap||""),
      Codigo: String(it.code||""),
      Codigo_APU_Ref: String(it.apuRefCode||it.code||""),
      Descripcion: String(it.desc||""),
      Unidad: String(it.unit||""),
      VR_Unitario: Number(it.pu||0),
      Cantidad: Number(it.qty||0),
      VR_Parcial: Number(parcial||0),
      Moneda: project.currency || "COP"
    };
  });
  const wsItems = XLSX.utils.json_to_sheet(itemsRows.length ? itemsRows : [{
    Tipo_Presupuesto:label,Capitulo:"",Codigo:"",Codigo_APU_Ref:"",Descripcion:"",Unidad:"",VR_Unitario:"",Cantidad:"",VR_Parcial:"",Moneda:project.currency||"COP"
  }]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
  XLSX.utils.book_append_sheet(wb, wsCaps, "Capitulos");
  XLSX.utils.book_append_sheet(wb, wsItems, "Items");

  const hasOfficial = Array.isArray(project?.oficialItems) && project.oficialItems.length > 0;
  if(hasOfficial){
    const comp = compareBudgets(project);
    const compRowsSrc = Array.isArray(comp.rows) ? comp.rows : [];
    const compRows = compRowsSrc.map(r=>({
      Codigo: String(r.code||""),
      Codigo_APU_Ref: String(r.apuRefCode||""),
      Descripcion: String(r.desc||""),
      Unidad: String(r.unit||""),
      PU_Base: Number(r.puBase||0),
      PU_Oficial: Number(r.puOficial||0),
      DIF_PU: Number(r.puDiff||0),
      Cant_Base: Number(r.qtyBase||0),
      Cant_Oficial: Number(r.qtyOficial||0),
      DIF_Cant: Number(r.qtyDiff||0),
      Parcial_Base: Number(r.parcialBase||0),
      Parcial_Oficial: Number(r.parcialOficial||0),
      DIF_Parcial: Number(r.parcialDiff||0)
    }));
    const wsComp = XLSX.utils.json_to_sheet(compRows.length ? compRows : [{
      Codigo:"",Codigo_APU_Ref:"",Descripcion:"",Unidad:"",
      PU_Base:"",PU_Oficial:"",DIF_PU:"",
      Cant_Base:"",Cant_Oficial:"",DIF_Cant:"",
      Parcial_Base:"",Parcial_Oficial:"",DIF_Parcial:""
    }]);
    XLSX.utils.book_append_sheet(wb, wsComp, "Comparativo");
  }

  const out = XLSX.write(wb, { bookType:"xlsx", type:"array" });
  const blob = new Blob([out], { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);

  const modeSuffix = String(mode||"base").toLowerCase() === "oficial" ? "oficial" : "base";
  const filename = `presupuesto_${modeSuffix}_${sanitizeFileName(project.name)}_${Date.now()}.xlsx`;
  UI.downloadBlobUrl(url, filename);
}
/* ==========================================
   UI Proyectos
   ========================================== */
async function bindProjectsPage(){
  UI.qs("#btnNewProject")?.addEventListener("click", ()=>{
    const name = prompt("Nombre del proyecto:");
    if(!name) return;

    const project = StorageAPI.createProject({
      name: String(name).trim(),
      createdAt: new Date().toISOString()
    });

    location.href = `proyecto-detalle.html?projectId=${encodeURIComponent(project.id)}`;
  });

  UI.qs("#btnImportBackup")?.addEventListener("change", async (e)=>{
    const file = e.target.files?.[0];
    if(!file) return;

    try{
      await StorageAPI.importBackupFromFile(file);
      alert("Backup importado correctamente.");
      renderProjectsList();
    }catch(err){
      alert("Error importando backup: " + (err?.message || err));
    }finally{
      e.target.value = "";
    }
  });

  UI.qs("#btnExportBackup")?.addEventListener("click", ()=>{
    try{
      StorageAPI.exportBackup();
    }catch(err){
      alert("Error exportando backup: " + (err?.message || err));
    }
  });

  renderProjectsList();
}

function renderProjectsList(){
  const list = StorageAPI.getProjects() || [];
  const tbody = UI.qs("#projectsBody");
  if(!tbody) return;

  if(!list.length){
    tbody.innerHTML = `<tr><td colspan="4" class="muted">No hay proyectos.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(p=>{
    const totals = totalsCompat(p);
    return `
      <tr>
        <td>${UI.esc(p.name || "")}</td>
        <td>${UI.fmtMoney(totals.total || 0, p.currency || "COP")}</td>
        <td>${(p.createdAt || "").slice(0,10)}</td>
        <td class="row">
          <a class="btn" href="proyecto-detalle.html?projectId=${encodeURIComponent(p.id)}">Abrir</a>
          <button class="btn danger" data-del="${p.id}">Eliminar</button>
        </td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll("[data-del]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-del");
      if(!confirm("¿Eliminar proyecto?")) return;

      StorageAPI.deleteProject(id);
      renderProjectsList();
    });
  });
}

/* ==========================================
   Detalle Proyecto
   ========================================== */
function renderProjectDetail(project){
  if(!project) return;

  UI.qs("#projectName") && (UI.qs("#projectName").textContent = project.name || "");

  const totals = totalsCompat(getProjectView(project));

  UI.qs("#kpiDirecto") && (UI.qs("#kpiDirecto").textContent = UI.fmtMoney(totals.directo || 0, project.currency || "COP"));
  UI.qs("#kpiAdmin") && (UI.qs("#kpiAdmin").textContent = UI.fmtMoney(totals.admin || 0, project.currency || "COP"));
  UI.qs("#kpiTotal") && (UI.qs("#kpiTotal").textContent = UI.fmtMoney(totals.total || 0, project.currency || "COP"));
}

/* ==========================================
   Tabla Capítulos
   ========================================== */
function renderChaptersTable(project){
  const tbody = UI.qs("#chaptersBody");
  if(!tbody) return;

  const view = getProjectView(project);
  let groups = [];

  try{
    const g = Calc.groupByChapters(view);
    groups = g.groups || [];
  }catch(_){
    groups = [];
  }

  if(!groups.length){
    tbody.innerHTML = `<tr><td colspan="4" class="muted">Sin capítulos.</td></tr>`;
    return;
  }

  tbody.innerHTML = groups.map(g=>`
    <tr>
      <td>${UI.esc(g.chapterCode || "")}</td>
      <td>${UI.esc(g.chapterName || "")}</td>
      <td>${g.itemsCount || 0}</td>
      <td>${UI.fmtMoney(g.subtotal || 0, project.currency || "COP")}</td>
    </tr>
  `).join("");
}

/* ==========================================
   Tabla Ítems (CLAVE VER APU)
   ========================================== */
function renderItemsTable(project){
  const tbody = UI.qs("#itemsBody");
  if(!tbody) return;

  const mode = getBudgetModeFromUI();
  const items = getProjectItemsByMode(project, mode);

  if(!items.length){
    tbody.innerHTML = `<tr><td colspan="8" class="muted">Sin ítems.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(it=>{
    const parcial = Number(it.pu||0) * Number(it.qty||0);
    const apuCode = it.apuRefCode || it.code;

    return `
      <tr>
        <td>${UI.esc(it.chapterCode || "")}</td>
        <td>${UI.esc(it.code || "")}</td>
        <td>${UI.esc(it.desc || "")}</td>
        <td>${UI.esc(it.unit || "")}</td>
        <td style="text-align:right">${UI.fmtMoney(it.pu || 0, project.currency || "COP")}</td>
        <td style="text-align:right">${it.qty || 0}</td>
        <td style="text-align:right"><b>${UI.fmtMoney(parcial, project.currency || "COP")}</b></td>
        <td class="row">

          <!-- 🔥 ESTE ES EL BOTÓN CLAVE -->
          <a class="btn"
             href="apu.html?code=${encodeURIComponent(apuCode)}&projectId=${encodeURIComponent(project.id)}&mode=${encodeURIComponent(mode)}">
             Ver APU
          </a>

          <button class="btn" data-edit="${it.id}">Editar</button>
          <button class="btn danger" data-del="${it.id}">Eliminar</button>
        </td>
      </tr>
    `;
  }).join("");

  // eliminar
  tbody.querySelectorAll("[data-del]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-del");
      if(!confirm("¿Eliminar ítem?")) return;

      if(mode === "oficial"){
        StorageAPI.deleteOfficialItem(project.id, id);
      }else{
        StorageAPI.deleteItem(project.id, id);
      }

      const fresh = StorageAPI.getProjectById(project.id);
      renderProjectDetail(fresh);
      renderChaptersTable(fresh);
      renderItemsTable(fresh);
    });
  });
}
/* ---------- PROYECTOS ---------- */
async function renderKpis(){
  const el = UI.qs("#kpis");
  if(!el) return;

  const ps = StorageAPI.listProjects();
  const totalBase = ps.reduce((s,p)=> s + (totalsCompat(getProjectView(p, "base")).total||0), 0);
  const totalOficial = ps.reduce((s,p)=> s + (totalsCompat(getProjectView(p, "oficial")).total||0), 0);

  let baseChip = UI.chip("NO","bad");
  try{
    const meta = await APUBase.getMeta();
    if(meta) baseChip = UI.chip(`OK (${meta.counts?.items||0})`,"ok");
  }catch(_){}

  el.innerHTML = `
    <div class="card item"><div class="topline"><div class="name">Proyectos</div><div class="chips">${UI.chip(String(ps.length),"ok")}</div></div><div class="muted small">En este dispositivo.</div></div>
    <div class="card item"><div class="topline"><div class="name">Total Base</div><div class="chips">${UI.chip(UI.fmtMoney(totalBase,"COP"))}</div></div><div class="muted small">Suma de presupuestos base.</div></div>
    <div class="card item"><div class="topline"><div class="name">Total Oficial</div><div class="chips">${UI.chip(UI.fmtMoney(totalOficial,"COP"))}</div></div><div class="muted small">Suma de presupuestos oficiales.</div></div>
    <div class="card item"><div class="topline"><div class="name">Base APU</div><div class="chips">${baseChip}</div></div><div class="muted small">Importada desde XLSX.</div></div>
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
    const tBase = totalsCompat(getProjectView(p, "base"));
    const tOf = totalsCompat(getProjectView(p, "oficial"));
    const diff = Number(tOf.total||0) - Number(tBase.total||0);

    return `
      <tr>
        <td><b>${UI.esc(p.name)}</b></td>
        <td>${UI.esc(p.entity||"-")}</td>
        <td>${UI.esc(p.location||"-")}</td>
        <td>${p.updatedAt ? UI.esc(new Date(p.updatedAt).toLocaleString()) : "-"}</td>
        <td>
          <div><b>Base:</b> ${UI.fmtMoney(tBase.total, p.currency||"COP")}</div>
          <div><b>Oficial:</b> ${UI.fmtMoney(tOf.total, p.currency||"COP")}</div>
          <div><b>Diferencia:</b> ${UI.fmtMoney(diff, p.currency||"COP")}</div>
        </td>
        <td class="row" style="gap:8px; flex-wrap:wrap">
          <a class="btn primary" href="proyecto-detalle.html?projectId=${encodeURIComponent(p.id)}">Abrir</a>
          <a class="btn" href="presupuesto-base.html?projectId=${encodeURIComponent(p.id)}">Base</a>
          <a class="btn" href="presupuesto-oficial.html?projectId=${encodeURIComponent(p.id)}">Oficial</a>
          <a class="btn" href="comparativo.html?projectId=${encodeURIComponent(p.id)}">Comparativo</a>
          <a class="btn" href="auditoria.html?projectId=${encodeURIComponent(p.id)}">Auditoría</a>
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

    let p = null;

    if(window.ProjectModel && typeof ProjectModel.createProject === "function"){
      try{
        const model = ProjectModel.createProject({ name, entity, location: ubicacion });
        p = StorageAPI.createProject(model);
      }catch(_){}
    }

    if(!p){
      p = StorageAPI.createProject({ name, entity, location: ubicacion });
    }

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
/* ==========================================
   ✅ Auditoría / Comparativo
   ========================================== */
function renderComparisonPanel(project){
  const host = UI.qs("#comparisonPanel");
  if(!host) return;

  let comp = null;
  try{
    comp = compareBudgets(project);
  }catch(_){
    comp = null;
  }

  let audit = null;
  try{
    if(window.Audit && typeof Audit.runAudit === "function"){
      audit = Audit.runAudit(project);
    }
  }catch(_){
    audit = null;
  }

  const rows = Array.isArray(comp?.rows) ? comp.rows : [];
  const totals = comp?.totals || null;
  const findings = Array.isArray(audit?.findings) ? audit.findings.slice(0, 10) : [];
  const summary = audit?.summary || null;

  host.innerHTML = `
    <section class="card" style="margin-top:14px">
      <div class="cardhead">
        <h2>Comparativo Base vs Oficial</h2>
        <p class="muted small">Comparación automática entre Presupuesto Base y Presupuesto Oficial.</p>
      </div>

      ${
        totals ? `
          <div class="grid two">
            <div class="item">
              <div class="name">Total Base</div>
              <div class="muted small"><b>${UI.fmtMoney(totals.base?.total||0, project.currency||"COP")}</b></div>
            </div>
            <div class="item">
              <div class="name">Total Oficial</div>
              <div class="muted small"><b>${UI.fmtMoney(totals.oficial?.total||0, project.currency||"COP")}</b></div>
            </div>
            <div class="item">
              <div class="name">Diferencia Total</div>
              <div class="muted small"><b>${UI.fmtMoney(totals.diffTotal||0, project.currency||"COP")}</b></div>
            </div>
            <div class="item">
              <div class="name">Diferencia Costos Directos</div>
              <div class="muted small"><b>${UI.fmtMoney(totals.diffDirecto||0, project.currency||"COP")}</b></div>
            </div>
          </div>
        ` : `<div class="muted">Aún no hay suficiente información para comparar.</div>`
      }

      ${
        summary ? `
          <hr class="sep">
          <div class="grid two">
            <div class="item">
              <div class="name">Riesgo</div>
              <div class="muted small"><b>${UI.esc(summary.risk?.level || "Riesgo bajo")}</b></div>
            </div>
            <div class="item">
              <div class="name">Puntaje</div>
              <div class="muted small"><b>${UI.esc(String(summary.risk?.score || 0))}</b></div>
            </div>
            <div class="item">
              <div class="name">Hallazgos</div>
              <div class="muted small"><b>${UI.esc(String(summary.findings?.total || 0))}</b></div>
            </div>
            <div class="item">
              <div class="name">Comentario ejecutivo</div>
              <div class="muted small">${UI.esc(summary.executiveComment || "—")}</div>
            </div>
          </div>
        ` : ``
      }
    </section>

    <section class="card" style="margin-top:14px">
      <div class="cardhead">
        <h2>Hallazgos de Auditoría</h2>
        <p class="muted small">Se listan los hallazgos preliminares detectados automáticamente.</p>
      </div>

      <div class="tablewrap">
        <table class="table" style="min-width:1120px">
          <thead>
            <tr>
              <th>Severidad</th>
              <th>Tipo</th>
              <th>Código</th>
              <th>Descripción</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            ${
              findings.length
                ? findings.map(f=>`
                    <tr>
                      <td><b>${UI.esc(String(f.severity||"").toUpperCase())}</b></td>
                      <td>${UI.esc(f.type||"")}</td>
                      <td>${UI.esc(f.code||"-")}</td>
                      <td>${UI.esc(f.desc||"-")}</td>
                      <td>${UI.esc(f.detail||"")}</td>
                    </tr>
                  `).join("")
                : `<tr><td colspan="5" class="muted">No se detectaron hallazgos de auditoría.</td></tr>`
            }
          </tbody>
        </table>
      </div>
    </section>

    <section class="card" style="margin-top:14px">
      <div class="cardhead">
        <h2>Diferencias por Ítem</h2>
        <p class="muted small">Diferencias de precios unitarios, cantidades y parciales.</p>
      </div>

      <div class="tablewrap">
        <table class="table" style="min-width:1320px">
          <thead>
            <tr>
              <th>Código</th>
              <th>APU Ref</th>
              <th>Descripción</th>
              <th>Unidad</th>
              <th style="text-align:right">PU Base</th>
              <th style="text-align:right">PU Oficial</th>
              <th style="text-align:right">Dif. PU</th>
              <th style="text-align:right">Cant Base</th>
              <th style="text-align:right">Cant Oficial</th>
              <th style="text-align:right">Dif. Cant</th>
              <th style="text-align:right">Parcial Base</th>
              <th style="text-align:right">Parcial Oficial</th>
              <th style="text-align:right">Dif. Parcial</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows.length
                ? rows.map(r=>`
                    <tr>
                      <td><b>${UI.esc(r.code||"")}</b></td>
                      <td>${UI.esc(r.apuRefCode||"")}</td>
                      <td>${UI.esc(r.desc||"")}</td>
                      <td>${UI.esc(r.unit||"")}</td>
                      <td style="text-align:right">${UI.fmtMoney(r.puBase||0, project.currency||"COP")}</td>
                      <td style="text-align:right">${UI.fmtMoney(r.puOficial||0, project.currency||"COP")}</td>
                      <td style="text-align:right"><b>${UI.fmtMoney(r.puDiff||0, project.currency||"COP")}</b></td>
                      <td style="text-align:right">${UI.esc(String(r.qtyBase||0))}</td>
                      <td style="text-align:right">${UI.esc(String(r.qtyOficial||0))}</td>
                      <td style="text-align:right"><b>${UI.esc(String(r.qtyDiff||0))}</b></td>
                      <td style="text-align:right">${UI.fmtMoney(r.parcialBase||0, project.currency||"COP")}</td>
                      <td style="text-align:right">${UI.fmtMoney(r.parcialOficial||0, project.currency||"COP")}</td>
                      <td style="text-align:right"><b>${UI.fmtMoney(r.parcialDiff||0, project.currency||"COP")}</b></td>
                    </tr>
                  `).join("")
                : `<tr><td colspan="13" class="muted">No hay datos comparables todavía.</td></tr>`
            }
          </tbody>
        </table>
      </div>
    </section>
  `;
}

/* ==========================================
   Detalle proyecto
   ========================================== */
function renderProjectDetail(project){
  const mode = getBudgetModeFromUI();
  const view = getProjectView(project, mode);

  UI.qs("#projTitle") && (UI.qs("#projTitle").textContent = project.name);
  UI.qs("#projSub") && (UI.qs("#projSub").textContent = `${project.entity || "—"} · ${project.location || "—"} · ${project.currency || "COP"}`);

  const adminPct = pct(project, "adminPct", "aiuPct");
  const imprevPct = pct(project, "imprevPct", null);
  const utilPct = pct(project, "utilPct", null);
  const ivaUtilPct = pct(project, "ivaUtilPct", "ivaPct");

  const info = UI.qs("#cardInfo");
  if(info){
    info.innerHTML = `
      <div class="cardhead">
        <h2>${UI.esc(project.name)}</h2>
        <p class="muted small">Entidad: ${UI.esc(project.entity||"-")} · Ubicación: ${UI.esc(project.location||"-")}</p>
        <div id="budgetModeInfo" style="margin-top:10px"></div>
      </div>
      <div class="grid two">
        <div class="item"><div class="name">Administración</div><div class="muted small">${UI.esc(String(adminPct||0))}%</div></div>
        <div class="item"><div class="name">Imprevistos</div><div class="muted small">${UI.esc(String(imprevPct||0))}%</div></div>
        <div class="item"><div class="name">Utilidad</div><div class="muted small">${UI.esc(String(utilPct||0))}%</div></div>
        <div class="item"><div class="name">IVA s/Utilidad</div><div class="muted small">${UI.esc(String(ivaUtilPct||0))}%</div></div>
      </div>
    `;
  }

  const budgetModeInfo = UI.qs("#budgetModeInfo");
  if(budgetModeInfo){
    const counts = getBudgetCounts(project);
    budgetModeInfo.innerHTML = `
      <div class="row" style="gap:8px; flex-wrap:wrap">
        <span class="chip ${mode === "oficial" ? "" : "ok"}">${UI.esc(budgetLabel(mode))}</span>
        <span class="chip">Base: ${UI.esc(String(counts.baseItems))} ítems / ${UI.esc(String(counts.baseChapters))} capítulos</span>
        <span class="chip">Oficial: ${UI.esc(String(counts.oficialItems))} ítems / ${UI.esc(String(counts.oficialChapters))} capítulos</span>
      </div>
    `;
  }

  const totals = totalsCompat(view);
  const k = UI.qs("#cardTotals");
  if(k){
    k.innerHTML = `
      <div class="card item"><div class="name">Ítems</div><div class="chips">${UI.chip(String((view.items||[]).length), mode==="oficial"?"warn":"ok")}</div></div>
      <div class="card item"><div class="name">Costo Directo</div><div class="chips">${UI.chip(UI.fmtMoney(totals.directo, project.currency||"COP"))}</div></div>
      <div class="card item"><div class="name">IVA s/Utilidad</div><div class="chips">${UI.chip(UI.fmtMoney(totals.ivaUtil, project.currency||"COP"))}</div></div>
      <div class="card item"><div class="name">VALOR TOTAL</div><div class="chips">${UI.chip(UI.fmtMoney(totals.total, project.currency||"COP"), mode==="oficial"?"warn":"ok")}</div></div>
    `;
  }

  const tr = UI.qs("#totalsRows");
  if(tr){
    tr.innerHTML = `
      <div class="row space"><div>Costo Directo</div><div><b>${UI.fmtMoney(totals.directo, project.currency||"COP")}</b></div></div>
      <hr class="sep">
      <div class="row space"><div>Administración (${adminPct||0}%)</div><div><b>${UI.fmtMoney(totals.admin, project.currency||"COP")}</b></div></div>
      <hr class="sep">
      <div class="row space"><div>Imprevistos (${imprevPct||0}%)</div><div><b>${UI.fmtMoney(totals.imprev, project.currency||"COP")}</b></div></div>
      <hr class="sep">
      <div class="row space"><div>Utilidad (${utilPct||0}%)</div><div><b>${UI.fmtMoney(totals.util, project.currency||"COP")}</b></div></div>
      <hr class="sep">
      <div class="row space"><div>Subtotal</div><div><b>${UI.fmtMoney(totals.subtotal, project.currency||"COP")}</b></div></div>
      <hr class="sep">
      <div class="row space"><div>IVA sobre Utilidad (${ivaUtilPct||0}%)</div><div><b>${UI.fmtMoney(totals.ivaUtil, project.currency||"COP")}</b></div></div>
      <hr class="sep">
      <div class="row space"><div><b>VALOR TOTAL</b></div><div><b>${UI.fmtMoney(totals.total, project.currency||"COP")}</b></div></div>
    `;
  }

  renderComparisonPanel(project);
}

/* ==========================================
   Capítulos
   ========================================== */
function renderChaptersTable(project){
  const tbody = UI.qs("#capsBody");
  const empty = UI.qs("#capsEmpty");
  if(!tbody) return;

  const mode = getBudgetModeFromUI();
  const view = getProjectView(project, mode);

  const { groups } = Calc.groupByChapters(view);

  if(!groups.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  tbody.innerHTML = groups.map(g=>`
    <tr>
      <td><b>${UI.esc(g.chapterCode||"-")}</b></td>
      <td>${UI.esc(g.chapterName||"-")}</td>
      <td style="text-align:right">${UI.esc(String(g.itemsCount||0))}</td>
      <td style="text-align:right"><b>${UI.fmtMoney(g.subtotal||0, project.currency||"COP")}</b></td>
    </tr>
  `).join("");
}

function renderProjectChaptersUI(project){
  const tbody = UI.qs("#projectChaptersBody");
  const empty = UI.qs("#projectChaptersEmpty");
  if(!tbody) return;

  const mode = getBudgetModeFromUI();
  const manual = ensureProjectChapters(project, mode);

  if(!manual.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
  }else{
    if(empty) empty.style.display = "none";
    tbody.innerHTML = manual.map(ch=>`
      <tr>
        <td><b>${UI.esc(ch.chapterCode||"")}</b></td>
        <td>${UI.esc(ch.chapterName||"")}</td>
        <td class="row" style="gap:8px">
          <button class="btn" type="button" data-edit-chapter="${UI.esc(ch.id||"")}">Editar</button>
          <button class="btn danger" type="button" data-del-chapter="${UI.esc(ch.id||"")}">Eliminar</button>
        </td>
      </tr>
    `).join("");
  }

  tbody.querySelectorAll("[data-edit-chapter]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-edit-chapter");
      const current = manual.find(x=>String(x.id)===String(id));
      if(!current) return;

      UI.qs("#projChapterEditId") && (UI.qs("#projChapterEditId").value = current.id || "");
      UI.qs("#projChapterCode") && (UI.qs("#projChapterCode").value = current.chapterCode || "");
      UI.qs("#projChapterName") && (UI.qs("#projChapterName").value = current.chapterName || "");
    });
  });

  tbody.querySelectorAll("[data-del-chapter]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-del-chapter");
      if(!confirm(`¿Eliminar este capítulo del ${budgetLabel(mode).toLowerCase()}?`)) return;

      const fresh = StorageAPI.getProjectById(project.id);
      if(!fresh) return;

      const key = mode === "oficial" ? "oficialChapters" : "chapters";
      const kept = ensureProjectChapters(fresh, mode).filter(x=>String(x.id)!==String(id));
      const patch = {};
      patch[key] = kept;

      StorageAPI.updateProject(project.id, patch);

      const updated = StorageAPI.getProjectById(project.id);
      renderProjectChaptersUI(updated);
      refreshAddApuModalChapterOptions(updated);
      renderChaptersTable(updated);
      renderProjectDetail(updated);
    });
  });

  const chapterSelBase = UI.qs("#selChapterBase");
  const chapterNameInp = UI.qs("#inpChapterName");
  if(chapterSelBase){
    const all = getAllChaptersForProject(project, mode);
    chapterSelBase.innerHTML = all.length
      ? all.map(c=>`<option value="${UI.esc(c.chapterCode)}" data-name="${UI.esc(c.chapterName||"")}">${UI.esc(`${c.chapterCode} — ${c.chapterName||""}`)}</option>`).join("")
      : `<option value="">(Sin capítulos definidos)</option>`;

    const sync = ()=>{
      const code = String(chapterSelBase.value||"").trim();
      const name = lookupChapterName(project, code, mode);
      if(chapterNameInp) chapterNameInp.value = name;
    };
    chapterSelBase.onchange = sync;
    sync();
  }
}

function bindProjectChaptersUI(projectId){
  const form = UI.qs("#formProjectChapter");
  const btnClear = UI.qs("#btnClearProjectChapterForm");
  if(!form) return;

  const clearForm = ()=>{
    UI.qs("#projChapterEditId") && (UI.qs("#projChapterEditId").value = "");
    UI.qs("#projChapterCode") && (UI.qs("#projChapterCode").value = "");
    UI.qs("#projChapterName") && (UI.qs("#projChapterName").value = "");
  };

  btnClear?.addEventListener("click", clearForm);

  form.addEventListener("submit", (e)=>{
    e.preventDefault();

    const fresh = StorageAPI.getProjectById(projectId);
    if(!fresh) return;

    const mode = getBudgetModeFromUI();
    const key = mode === "oficial" ? "oficialChapters" : "chapters";

    const editId = String(UI.qs("#projChapterEditId")?.value || "").trim();
    const chapterCode = String(UI.qs("#projChapterCode")?.value || "").trim();
    const chapterName = String(UI.qs("#projChapterName")?.value || "").trim();

    if(!chapterCode){
      alert("Debes escribir el número del capítulo.");
      return;
    }

    const current = ensureProjectChapters(fresh, mode);
    let next = current.slice();

    const duplicate = next.find(c => String(c.chapterCode)===chapterCode && String(c.id)!==editId);
    if(duplicate){
      alert("Ya existe un capítulo con ese código.");
      return;
    }

    if(editId){
      next = next.map(c => String(c.id)===editId
        ? { ...c, chapterCode, chapterName }
        : c
      );
    }else{
      next.push({
        id: makeId(mode === "oficial" ? "ochap" : "chap"),
        chapterCode,
        chapterName
      });
    }

    next.sort((a,b)=>{
      const na = Number(a.chapterCode), nb = Number(b.chapterCode);
      if(Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
      return String(a.chapterCode).localeCompare(String(b.chapterCode));
    });

    const patch = {};
    patch[key] = next;
    StorageAPI.updateProject(projectId, patch);

    const updated = StorageAPI.getProjectById(projectId);
    clearForm();
    renderProjectChaptersUI(updated);
    refreshAddApuModalChapterOptions(updated);
    renderChaptersTable(updated);
    renderProjectDetail(updated);
  });
}
/* ==========================================
   Documentos
   ========================================== */
async function renderDocs(projectId){
  const table = UI.qs("#tablaDocs tbody");
  const empty = UI.qs("#docsEmpty");
  if(!table) return;

  const files = await DB.listFilesByOwner("project", projectId).catch(()=>[]);
  if(!files.length){
    table.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  table.innerHTML = files.map(f=>`
    <tr>
      <td>${UI.esc(f.name||"archivo")}</td>
      <td>${UI.esc(f.mime||"-")}</td>
      <td>${UI.fmtBytes(f.size||0)}</td>
      <td>${f.createdAt ? UI.esc(new Date(f.createdAt).toLocaleString()) : "-"}</td>
      <td class="row" style="gap:8px">
        <button class="btn" type="button" data-dl="${f.id}">Descargar</button>
        <button class="btn danger" type="button" data-rm="${f.id}">Eliminar</button>
      </td>
    </tr>
  `).join("");

  table.querySelectorAll("[data-dl]").forEach(b=>{
    b.addEventListener("click", ()=> UI.downloadFileFromIDB(b.getAttribute("data-dl")));
  });

  table.querySelectorAll("[data-rm]").forEach(b=>{
    b.addEventListener("click", async ()=>{
      const id = b.getAttribute("data-rm");
      if(!confirm("¿Eliminar documento?")) return;
      await DB.deleteFile(id).catch(()=>{});
      await renderDocs(projectId);
    });
  });
}

/* ==========================================
   Modal agregar APU
   ========================================== */
const __addApuModalState = {
  projectId: "",
  apu: null
};

function openAddApuModal(project, apu){
  const modal = UI.qs("#addApuModal");
  if(!modal) return;

  if(!project || !apu){
    alert("No se pudo abrir el selector del APU.");
    return;
  }

  // Si no hay capítulos, ofrecer agregar directo usando el capítulo inferido
  const mode = getBudgetModeFromUI();
  const allCaps = getAllChaptersForProject(project, mode);

  if(!allCaps.length){
    const qtyOld = Number(prompt(`No hay capítulos definidos en el ${budgetLabel(mode).toLowerCase()}.\n\nCantidad para agregar este ítem:`, "1") || "0");
    if(!(qtyOld > 0)) return;

    const rawCode = String(apu.code||"").trim();
    const chapterCode = rawCode.includes(".") ? rawCode.split(".")[0] : "";
    const chapterName = "";

    if(mode === "oficial"){
      StorageAPI.addOfficialItem(project.id, {
        chapterCode,
        chapterName,
        code: apu.code,
        apuRefCode: apu.code,
        desc: apu.desc,
        unit: apu.unit,
        pu: Number(apu.pu||0),
        qty: qtyOld
      });
    }else{
      StorageAPI.addItem(project.id, {
        chapterCode,
        chapterName,
        code: apu.code,
        apuRefCode: apu.code,
        desc: apu.desc,
        unit: apu.unit,
        pu: Number(apu.pu||0),
        qty: qtyOld
      });
    }

    const fresh = StorageAPI.getProjectById(project.id);
    renderProjectDetail(fresh);
    renderChaptersTable(fresh);
    renderItemsTable(fresh);
    renderResumenItems(fresh);
    alert(`Ítem agregado al ${budgetLabel(mode).toLowerCase()}.`);
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

function closeAddApuModal(){
  const modal = UI.qs("#addApuModal");
  if(modal) modal.style.display = "none";
}

function refreshAddApuModalChapterOptions(project){
  const sel = UI.qs("#addApuChapterSel");
  const inpCode = UI.qs("#addApuChapterCode");
  const inpName = UI.qs("#addApuChapterName");
  if(!sel) return;

  const mode = getBudgetModeFromUI();
  const chapters = getAllChaptersForProject(project, mode);

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
      name = lookupChapterName(project, code, mode);
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

  const mode = getBudgetModeFromUI();

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
    chapterName = lookupChapterName(fresh, chapterCode, mode) || "";
  }

  if(mode === "oficial"){
    StorageAPI.addOfficialItem(projectId, {
      chapterCode,
      chapterName,
      code: apu.code,
      apuRefCode: apu.code,
      desc: apu.desc,
      unit: apu.unit,
      pu: Number(apu.pu||0),
      qty
    });
  }else{
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
  }

  const updated = StorageAPI.getProjectById(projectId);
  renderProjectDetail(updated);
  renderChaptersTable(updated);
  renderItemsTable(updated);
  renderResumenItems(updated);

  if(keepOpen){
    UI.qs("#addApuQty") && (UI.qs("#addApuQty").value = "1");
    refreshAddApuModalChapterOptions(updated);
    alert(`Ítem agregado al ${budgetLabel(mode).toLowerCase()}. Puedes volver a agregar.`);
    return;
  }

  closeAddApuModal();
  alert(`Ítem agregado al ${budgetLabel(mode).toLowerCase()}.`);
}
/* =========================
   Render de ítems + edición
   ========================= */
function renderItemsTable(project){
  const tbody = UI.qs("#itemsBody");
  const empty = UI.qs("#itemsEmpty");
  if(!tbody) return;

  const mode = getBudgetModeFromUI();
  const items = getProjectItemsByMode(project, mode);

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
          <a class="btn" href="apu.html?code=${encodeURIComponent(apuCode)}&projectId=${encodeURIComponent(project.id)}&mode=${encodeURIComponent(mode)}">Ver APU</a>
          <button class="btn" type="button" data-edit="${it.id}">Editar</button>
          <button class="btn danger" type="button" data-del="${it.id}">Eliminar</button>
        </td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll("[data-del]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-del");
      if(!confirm(`¿Eliminar ítem del ${budgetLabel(mode).toLowerCase()}?`)) return;

      if(mode === "oficial"){
        StorageAPI.deleteOfficialItem(project.id, id);
      }else{
        StorageAPI.deleteItem(project.id, id);
      }

      const fresh = StorageAPI.getProjectById(project.id);
      renderProjectDetail(fresh);
      renderChaptersTable(fresh);
      renderItemsTable(fresh);
      renderResumenItems(fresh);
    });
  });

  tbody.querySelectorAll("[data-edit]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-edit");
      const fresh = StorageAPI.getProjectById(project.id);
      if(!fresh) return;

      const list = getProjectItemsByMode(fresh, mode);
      const it = (list||[]).find(x=>x.id===id);
      if(!it) return;

      const curChapterCode = String(it.chapterCode || (String(it.code||"").split(".")[0]||"")).trim();
      const curChapterName = String(it.chapterName||"").trim() || lookupChapterName(fresh, curChapterCode, mode);

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
        chapterName = lookupChapterName(fresh, chapterCode, mode) || "";
      }

      if(mode === "oficial"){
        StorageAPI.updateOfficialItem(fresh.id, id, { chapterCode, chapterName, code, apuRefCode, desc, unit, pu, qty });
      }else{
        StorageAPI.updateItem(fresh.id, id, { chapterCode, chapterName, code, apuRefCode, desc, unit, pu, qty });
      }

      const updated = StorageAPI.getProjectById(fresh.id);
      renderProjectDetail(updated);
      renderChaptersTable(updated);
      renderItemsTable(updated);
      renderResumenItems(updated);
    });
  });
}

function renderResumenItems(project){
  const tbody = UI.qs("#resumenItemsBody");
  const empty = UI.qs("#resumenItemsEmpty");
  if(!tbody) return;

  const mode = getBudgetModeFromUI();
  const view = getProjectView(project, mode);
  const items = view.items || [];

  if(!items.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  const { items: items2 } = Calc.groupByChapters(view);

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

  const project = StorageAPI.getProjectById(projectId);
  if(!project){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }

  const rows = Array.isArray(results) ? results.filter(r=>!r.isChapter) : [];

  if(!rows.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  tbody.innerHTML = rows.map(r=>`
    <tr>
      <td><b>${UI.esc(r.code||"")}</b></td>
      <td>${UI.esc(r.desc||"")}</td>
      <td>${UI.esc(r.unit||"")}</td>
      <td style="text-align:right"><b>${UI.fmtMoney(r.pu||0, "COP")}</b></td>
      <td>
        <button class="btn primary" type="button" data-add-apu="${UI.esc(r.code||"")}">Agregar</button>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-add-apu]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const code = btn.getAttribute("data-add-apu");
      const apu = rows.find(x=>String(x.code||"")===String(code||""));
      if(!apu) return;

      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      openAddApuModal(fresh, apu);
    });
  });
}
/* =========================
   Base viewer / consultas
   ========================= */
async function bindBaseViewer(projectId){
  const btnForm = UI.qs("#btnVerFormulario");
  const btnCD = UI.qs("#btnVerCD");
  const btnSub = UI.qs("#btnVerSub");
  const btnIns = UI.qs("#btnVerInsumos");
  const btnClose = UI.qs("#btnCloseViewer");
  const btnSearch = UI.qs("#btnBaseViewerSearch");
  const inpSearch = UI.qs("#baseViewerSearch");

  const wrap = UI.qs("#baseViewer");
  const head = UI.qs("#baseViewerHead");
  const body = UI.qs("#baseViewerBody");
  const title = UI.qs("#baseViewerTitle");
  const sub = UI.qs("#baseViewerSub");
  const empty = UI.qs("#baseViewerEmpty");
  const searchRow = UI.qs("#baseViewerSearchRow");

  if(!wrap || !head || !body) return;

  let currentType = "";

  function showViewer(label, subtitle, headers, rows, withSearch){
    currentType = label || "";
    wrap.style.display = "";
    if(title) title.textContent = label || "Consulta";
    if(sub) sub.textContent = subtitle || "—";
    if(searchRow) searchRow.style.display = withSearch ? "" : "none";

    head.innerHTML = `<tr>${headers.map(h=>`<th>${UI.esc(h)}</th>`).join("")}</tr>`;

    if(!rows.length){
      body.innerHTML = "";
      if(empty) empty.style.display = "";
      return;
    }
    if(empty) empty.style.display = "none";

    body.innerHTML = rows.map(r=>`<tr>${r.map(c=>`<td>${UI.esc(c)}</td>`).join("")}</tr>`).join("");
  }

  async function loadFormulario(q=""){
    const rows = await APUBase.listFormularioItems(q, 300);
    showViewer(
      "FORMULARIO DE PRECIOS",
      `Registros: ${rows.length}`,
      ["Cap", "Código", "Descripción", "Unidad", "PU"],
      rows.map(r=>[
        String(r.chapterCode||""),
        String(r.code||""),
        String(r.desc||""),
        String(r.unit||""),
        UI.fmtMoney(r.pu||0, "COP")
      ]),
      true
    );
  }

  async function loadCD(q=""){
    const rows = await APUBase.listCostosDirectosAll(q, 350);
    showViewer(
      "Costos_Directos",
      `Registros: ${rows.length}`,
      ["Ítem", "Nombre Ítem", "Grupo", "Descripción", "Unidad", "Cant/Rend", "PU", "Parcial"],
      rows.map(r=>[
        String(r.itemCode||""),
        String(r.itemName||""),
        String(r.group||""),
        String(r.desc||""),
        String(r.unit||""),
        String(r.qty||0),
        UI.fmtMoney(r.pu||0, "COP"),
        UI.fmtMoney(r.parcial||0, "COP")
      ]),
      true
    );
  }

  async function loadSub(q=""){
    const list = await APUBase.listSubproductos(250);
    const qn = String(q||"").toLowerCase().trim();
    const rows = (list||[]).filter(x=>{
      if(!qn) return true;
      return `${x.subKey} ${x.subName}`.toLowerCase().includes(qn);
    });

    showViewer(
      "Subproductos",
      `Registros: ${rows.length}`,
      ["Clave", "Nombre"],
      rows.map(r=>[
        String(r.subKey||""),
        String(r.subName||"")
      ]),
      true
    );
  }

  async function loadInsumos(q=""){
    const rows = await APUBase.listInsumos(q, 350);
    showViewer(
      "Insumos",
      `Registros: ${rows.length}`,
      ["Tipo", "Descripción", "Unidad", "PU"],
      rows.map(r=>[
        String(r.tipo||""),
        String(r.desc||""),
        String(r.unit||""),
        UI.fmtMoney(r.pu||0, "COP")
      ]),
      true
    );
  }

  btnForm?.addEventListener("click", ()=> loadFormulario("").catch(err=>alert("Error: "+(err?.message||err))));
  btnCD?.addEventListener("click", ()=> loadCD("").catch(err=>alert("Error: "+(err?.message||err))));
  btnSub?.addEventListener("click", ()=> loadSub("").catch(err=>alert("Error: "+(err?.message||err))));
  btnIns?.addEventListener("click", ()=> loadInsumos("").catch(err=>alert("Error: "+(err?.message||err))));

  btnClose?.addEventListener("click", ()=>{
    wrap.style.display = "none";
    currentType = "";
  });

  btnSearch?.addEventListener("click", ()=>{
    const q = String(inpSearch?.value || "");
    if(currentType === "FORMULARIO DE PRECIOS") loadFormulario(q).catch(err=>alert("Error: "+(err?.message||err)));
    else if(currentType === "Costos_Directos") loadCD(q).catch(err=>alert("Error: "+(err?.message||err)));
    else if(currentType === "Subproductos") loadSub(q).catch(err=>alert("Error: "+(err?.message||err)));
    else if(currentType === "Insumos") loadInsumos(q).catch(err=>alert("Error: "+(err?.message||err)));
  });

  inpSearch?.addEventListener("keydown", (e)=>{
    if(e.key === "Enter"){
      e.preventDefault();
      btnSearch?.click();
    }
  });
}

/* =========================
   Firma / elaborador
   ========================= */
function bindFirmaModal(){
  const modal = UI.qs("#firmaModal");
  const openBtn = UI.qs("#btnDatosFirma");
  const closeBtn = UI.qs("#btnFirmaClose");
  const btnSave = UI.qs("#firmaSave");
  const btnDel = UI.qs("#firmaDelete");
  const btnClear = UI.qs("#firmaClear");
  const btnJpg = UI.qs("#firmaDownloadJpg");

  const inpNombre = UI.qs("#firmaNombre");
  const inpProf = UI.qs("#firmaProfesion");
  const inpMat = UI.qs("#firmaMatricula");
  const prev = UI.qs("#firmaPreview");
  const canvas = UI.qs("#firmaCanvas");
  if(!modal || !canvas) return;

  const ctx = canvas.getContext("2d", { willReadFrequently:true });

  function fitCanvas(){
    const w = canvas.clientWidth || 520;
    const h = canvas.clientHeight || 220;
    canvas.width = w;
    canvas.height = h;
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0,0,w,h);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#ffffff";
  }

  function clear(){
    fitCanvas();
  }

  function currentPos(e){
    const rect = canvas.getBoundingClientRect();
    const t = e.touches && e.touches[0] ? e.touches[0] : null;
    const x = t ? t.clientX : e.clientX;
    const y = t ? t.clientY : e.clientY;
    return { x: x - rect.left, y: y - rect.top };
  }

  let drawing = false;
  function start(e){
    e.preventDefault();
    drawing = true;
    const p = currentPos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }
  function move(e){
    if(!drawing) return;
    e.preventDefault();
    const p = currentPos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
  function end(){
    drawing = false;
  }

  function toJpegDataUrl(){
    return canvas.toDataURL("image/jpeg", 0.92);
  }

  function redrawFromSaved(){
    const e = StorageAPI.getElaborador ? StorageAPI.getElaborador() : null;
    fitCanvas();

    if(inpNombre) inpNombre.value = e?.nombre || "";
    if(inpProf) inpProf.value = e?.profesion || "";
    if(inpMat) inpMat.value = e?.matricula || "";
    if(prev) prev.src = e?.firmaDataUrl || "";

    if(e?.firmaDataUrl){
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

  openBtn && openBtn.addEventListener("click", ()=>{
    modal.style.display = "";
    redrawFromSaved();
  });

  closeBtn && closeBtn.addEventListener("click", ()=>{
    modal.style.display = "none";
  });

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
/* =========================
   Ajustes del proyecto
   ========================= */
function renderAjustes(project){
  const form = UI.qs("#formAjustes");
  if(!form) return;

  const byName = (n)=> form.querySelector(`[name="${n}"]`);

  byName("adminPct") && (byName("adminPct").value = String(pct(project, "adminPct", "aiuPct") || 0));
  byName("imprevPct") && (byName("imprevPct").value = String(pct(project, "imprevPct", null) || 0));
  byName("utilPct") && (byName("utilPct").value = String(pct(project, "utilPct", null) || 0));
  byName("ivaUtilPct") && (byName("ivaUtilPct").value = String(pct(project, "ivaUtilPct", "ivaPct") || 0));

  byName("instPais") && (byName("instPais").value = String(project.instPais || ""));
  byName("instDepto") && (byName("instDepto").value = String(project.instDepto || ""));
  byName("instMunicipio") && (byName("instMunicipio").value = String(project.instMunicipio || ""));
  byName("instEntidad") && (byName("instEntidad").value = String(project.instEntidad || ""));
  byName("instProyectoLabel") && (byName("instProyectoLabel").value = String(project.instProyectoLabel || ""));
  byName("instFechaElab") && (byName("instFechaElab").value = String(project.instFechaElab || ""));

  const prev = UI.qs("#projectLogoPreview");
  if(prev){
    prev.src = project.logoDataUrl || "";
    prev.style.display = project.logoDataUrl ? "block" : "none";
  }
}

function bindAjustes(projectId){
  const form = UI.qs("#formAjustes");
  if(!form) return;

  form.addEventListener("submit", (e)=>{
    e.preventDefault();

    const fd = new FormData(form);
    StorageAPI.updateProject(projectId, {
      adminPct: Number(fd.get("adminPct") || 0),
      imprevPct: Number(fd.get("imprevPct") || 0),
      utilPct: Number(fd.get("utilPct") || 0),
      ivaUtilPct: Number(fd.get("ivaUtilPct") || 0),

      instPais: String(fd.get("instPais") || ""),
      instDepto: String(fd.get("instDepto") || ""),
      instMunicipio: String(fd.get("instMunicipio") || ""),
      instEntidad: String(fd.get("instEntidad") || ""),
      instProyectoLabel: String(fd.get("instProyectoLabel") || ""),
      instFechaElab: String(fd.get("instFechaElab") || "")
    });

    const fresh = StorageAPI.getProjectById(projectId);
    renderProjectDetail(fresh);
    renderAjustes(fresh);
    alert("Ajustes guardados.");
  });

  UI.qs("#inpProjectLogo")?.addEventListener("change", async (e)=>{
    const file = e.target.files?.[0];
    if(!file) return;

    try{
      const dataUrl = await fileToDataUrl(file);
      StorageAPI.updateProject(projectId, { logoDataUrl: dataUrl });
      const fresh = StorageAPI.getProjectById(projectId);
      renderAjustes(fresh);
      alert("Logo guardado.");
    }catch(err){
      alert("Error guardando logo: " + (err?.message || err));
    }finally{
      e.target.value = "";
    }
  });

  UI.qs("#btnRemoveProjectLogo")?.addEventListener("click", ()=>{
    if(!confirm("¿Quitar logo del proyecto?")) return;
    StorageAPI.updateProject(projectId, { logoDataUrl: "" });
    const fresh = StorageAPI.getProjectById(projectId);
    renderAjustes(fresh);
  });
}

/* =========================
   Documentos del proyecto
   ========================= */
function bindProjectDocs(projectId){
  const inp = UI.qs("#docsInput");
  if(!inp) return;

  inp.addEventListener("change", async (e)=>{
    const files = Array.from(e.target.files || []);
    if(!files.length) return;

    try{
      for(const f of files){
        await DB.putFile({
          ownerType: "project",
          ownerId: projectId,
          kind: "doc_project",
          name: f.name,
          mime: f.type || "application/octet-stream",
          size: Number(f.size || 0),
          blob: f
        });
      }
      await renderDocs(projectId);
      alert(`Se cargaron ${files.length} archivo(s).`);
    }catch(err){
      alert("Error guardando documentos: " + (err?.message || err));
    }finally{
      e.target.value = "";
    }
  });
}

/* =========================
   Acciones generales proyecto
   ========================= */
function bindProjectActions(projectId){
  UI.qs("#btnExportProj")?.addEventListener("click", async ()=>{
    try{
      const project = StorageAPI.getProjectById(projectId);
      if(!project) return;

      const docs = await DB.listFilesByOwner("project", projectId).catch(()=>[]);
      const docsJson = [];

      for(const d of docs){
        if(!d?.blob) continue;
        const dataUrl = await blobToDataUrl(d.blob);
        docsJson.push({
          id: d.id,
          name: d.name,
          mime: d.mime,
          size: d.size,
          createdAt: d.createdAt,
          dataUrl
        });
      }

      const payload = {
        exportedAt: new Date().toISOString(),
        app: "auditoria-presupuesto",
        project,
        docs: docsJson
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      UI.downloadBlobUrl(url, `proyecto_${sanitizeFileName(project.name)}_${Date.now()}.json`);
    }catch(err){
      alert("Error exportando proyecto: " + (err?.message || err));
    }
  });

  UI.qs("#btnDeleteProj")?.addEventListener("click", async ()=>{
    if(!confirm("¿Eliminar proyecto y sus documentos?")) return;

    try{
      await DB.deleteFilesByOwner("project", projectId).catch(()=>{});
      StorageAPI.deleteProject(projectId);
      alert("Proyecto eliminado.");
      location.href = "proyectos.html";
    }catch(err){
      alert("Error eliminando proyecto: " + (err?.message || err));
    }
  });

  UI.qs("#btnExportBackup")?.addEventListener("click", ()=>{
    const out = StorageAPI.exportBackup();
    UI.downloadBlobUrl(out.url, out.filename);
  });

  UI.qs("#fileImport2")?.addEventListener("change", async (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;

    try{
      await StorageAPI.importBackupFromFile(f);
      alert("Backup importado. Se recargará.");
      location.reload();
    }catch(err){
      alert("Error importando backup: " + (err?.message || err));
    }finally{
      e.target.value = "";
    }
  });

  UI.qs("#btnResetAll")?.addEventListener("click", async ()=>{
    if(!confirm("¿Borrar TODO el contenido de la app?")) return;

    const alsoBase = confirm("¿También deseas borrar la Base APU instalada?");
    try{
      const ps = StorageAPI.listProjects();
      for(const p of ps){
        await DB.deleteFilesByOwner("project", p.id).catch(()=>{});
      }
      StorageAPI.resetAll();

      if(alsoBase){
        try{ await APUBase.deleteBaseDatabase(); }catch(_){}
      }

      alert("Todo fue eliminado.");
      location.href = "proyectos.html";
    }catch(err){
      alert("Error reseteando: " + (err?.message || err));
    }
  });
}

/* =========================
   Importar / manejar Presupuesto Oficial
   ========================= */
function bindOfficialImport(projectId){
  const fileInput = UI.qs("#fileOfficialImport");
  const btnImport = UI.qs("#btnImportOfficial");
  const btnImport2 = UI.qs("#btnImportOfficial2");
  const btnClear = UI.qs("#btnClearOfficial");
  const info = UI.qs("#officialImportInfo");

  async function doImport(file){
    if(!file) return;
    try{
      if(!(window.OfficialImport && typeof OfficialImport.importOfficialBudgetFromFile === "function")){
        throw new Error("OfficialImport no está disponible.");
      }

      info && (info.textContent = "Importando presupuesto oficial…");
      const result = await OfficialImport.importOfficialBudgetFromFile(projectId, file);

      const fresh = StorageAPI.getProjectById(projectId);
      if(page() === "proyecto-detalle.html"){
        renderProjectDetail(fresh);
        renderChaptersTable(fresh);
        renderItemsTable(fresh);
        renderResumenItems(fresh);
        renderProjectChaptersUI(fresh);
      }

      info && (info.textContent =
        `Importación completada. Hoja: ${result.sheetName || "-"} · Ítems: ${result.counts?.items || 0} · Capítulos: ${result.counts?.chapters || 0}`
      );

      alert(`Presupuesto Oficial importado correctamente.\nÍtems: ${result.counts?.items || 0}\nCapítulos: ${result.counts?.chapters || 0}`);
    }catch(err){
      info && (info.textContent = "Error en importación.");
      alert("Error importando presupuesto oficial: " + (err?.message || err));
    }finally{
      if(fileInput) fileInput.value = "";
    }
  }

  btnImport?.addEventListener("click", ()=> fileInput?.click());
  btnImport2?.addEventListener("click", ()=> fileInput?.click());

  fileInput?.addEventListener("change", async (e)=>{
    const f = e.target.files?.[0];
    await doImport(f);
  });

  btnClear?.addEventListener("click", ()=>{
    if(!confirm("¿Limpiar completamente el presupuesto oficial?")) return;

    try{
      if(window.OfficialImport && typeof OfficialImport.clearOfficialBudget === "function"){
        OfficialImport.clearOfficialBudget(projectId);
      }else{
        StorageAPI.updateProject(projectId, {
          oficialItems: [],
          oficialChapters: [],
          oficialApuOverrides: {}
        });
      }

      const fresh = StorageAPI.getProjectById(projectId);
      if(page() === "proyecto-detalle.html"){
        renderProjectDetail(fresh);
        renderChaptersTable(fresh);
        renderItemsTable(fresh);
        renderResumenItems(fresh);
        renderProjectChaptersUI(fresh);
      }

      info && (info.textContent = "Presupuesto oficial limpiado.");
      alert("Presupuesto oficial eliminado.");
    }catch(err){
      alert("Error limpiando presupuesto oficial: " + (err?.message || err));
    }
  });
}

/* =========================
   Exportaciones PDF / Excel
   ========================= */
function bindProjectExports(projectId){
  const getFresh = ()=> StorageAPI.getProjectById(projectId);

  UI.qs("#btnExportExcel")?.addEventListener("click", ()=>{
    const p = getFresh();
    if(!p) return;
    exportProjectExcel(p, getBudgetModeFromUI());
  });

  UI.qs("#btnExportBaseExcel")?.addEventListener("click", ()=>{
    const p = getFresh();
    if(!p) return;
    exportProjectExcel(p, "base");
  });

  UI.qs("#btnExportOfficialExcel")?.addEventListener("click", ()=>{
    const p = getFresh();
    if(!p) return;
    exportProjectExcel(p, "oficial");
  });

  UI.qs("#btnPdfBase")?.addEventListener("click", async ()=>{
    const p = getFresh();
    if(!p) return;
    try{
      await PDF.exportPresupuestoPDF(p, { mode:"base", share:isIOS() });
    }catch(err){
      alert("Error generando PDF Base: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfOfficial")?.addEventListener("click", async ()=>{
    const p = getFresh();
    if(!p) return;
    try{
      await PDF.exportPresupuestoPDF(p, { mode:"oficial", share:isIOS() });
    }catch(err){
      alert("Error generando PDF Oficial: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfPresupuesto")?.addEventListener("click", async ()=>{
    const p = getFresh();
    if(!p) return;
    try{
      await PDF.exportPresupuestoPDF(p, { mode:getBudgetModeFromUI(), share:isIOS() });
    }catch(err){
      alert("Error generando PDF: " + (err?.message || err));
    }
  });

  UI.qs("#btnDlPdfPresupuesto")?.addEventListener("click", async ()=>{
    const p = getFresh();
    if(!p) return;
    try{
      await PDF.exportPresupuestoPDF(p, { mode:getBudgetModeFromUI() });
    }catch(err){
      alert("Error descargando PDF: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfPresupuestoAPUs")?.addEventListener("click", async ()=>{
    const p = getFresh();
    if(!p) return;
    try{
      await PDF.exportPresupuestoConAPUsPDF(p, { mode:getBudgetModeFromUI(), share:isIOS() });
    }catch(err){
      alert("Error generando PDF + APUs: " + (err?.message || err));
    }
  });

  UI.qs("#btnDlPdfPresupuestoAPUs")?.addEventListener("click", async ()=>{
    const p = getFresh();
    if(!p) return;
    try{
      await PDF.exportPresupuestoConAPUsPDF(p, { mode:getBudgetModeFromUI() });
    }catch(err){
      alert("Error descargando PDF + APUs: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfPresupuestoDesagregado")?.addEventListener("click", async ()=>{
    const p = getFresh();
    if(!p) return;
    try{
      await PDF.exportPresupuestoObraDesagregadoPDF(p, { mode:getBudgetModeFromUI(), share:isIOS() });
    }catch(err){
      alert("Error generando desagregado: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfResumenPresupuestoDesagregado")?.addEventListener("click", async ()=>{
    const p = getFresh();
    if(!p) return;
    try{
      await PDF.exportResumenPresupuestoObraDesagregadoPDF(p, { mode:getBudgetModeFromUI(), share:isIOS() });
    }catch(err){
      alert("Error generando resumen desagregado: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfDistribucionPctCD")?.addEventListener("click", async ()=>{
    const p = getFresh();
    if(!p) return;
    try{
      await PDF.exportDistribucionPorcentualCostosDirectosPDF(p, { mode:getBudgetModeFromUI(), share:isIOS() });
    }catch(err){
      alert("Error generando distribución porcentual: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfRendimientoEqMo")?.addEventListener("click", async ()=>{
    const p = getFresh();
    if(!p) return;
    try{
      await PDF.exportRendimientoEquipoYManoDeObraPorActividadPDF(p, { mode:getBudgetModeFromUI(), share:isIOS() });
    }catch(err){
      alert("Error generando rendimientos: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfResumenMaterialesActividad")?.addEventListener("click", async ()=>{
    const p = getFresh();
    if(!p) return;
    try{
      await PDF.exportResumenMaterialesPorActividadPDF(p, { mode:getBudgetModeFromUI(), share:isIOS() });
    }catch(err){
      alert("Error generando resumen materiales: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfCantRecursosInsumos")?.addEventListener("click", async ()=>{
    const p = getFresh();
    if(!p) return;
    try{
      await PDF.exportCantidadRecursosEInsumosPresupuestoPDF(p, { mode:getBudgetModeFromUI(), share:isIOS() });
    }catch(err){
      alert("Error generando cantidad de recursos: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfEspecificacionesTec")?.addEventListener("click", async ()=>{
    const p = getFresh();
    if(!p) return;
    try{
      await PDF.exportEspecificacionesTecnicasPDF(p, { mode:getBudgetModeFromUI(), share:isIOS() });
    }catch(err){
      alert("Error generando especificaciones: " + (err?.message || err));
    }
  });

  UI.qs("#btnDlPdfEspecificacionesTec")?.addEventListener("click", async ()=>{
    const p = getFresh();
    if(!p) return;
    try{
      await PDF.exportEspecificacionesTecnicasPDF(p, { mode:getBudgetModeFromUI() });
    }catch(err){
      alert("Error descargando especificaciones: " + (err?.message || err));
    }
  });
}

/* =========================
   Página detalle / base / oficial
   ========================= */
async function bindProjectDetailPage(){
  const projectId = UI.getParam("projectId");
  if(!projectId){
    alert("Falta projectId.");
    location.href = "proyectos.html";
    return;
  }

  let project = StorageAPI.getProjectById(projectId);
  if(!project){
    alert("Proyecto no encontrado.");
    location.href = "proyectos.html";
    return;
  }

  if(window.ProjectModel && typeof ProjectModel.normalizeProject === "function"){
    try{
      const normalized = ProjectModel.normalizeProject(project);
      StorageAPI.updateProject(projectId, normalized);
      project = StorageAPI.getProjectById(projectId);
    }catch(_){}
  }

  bindTabsIfPresent();
  bindFirmaModal();
  bindAjustes(projectId);
  bindProjectDocs(projectId);
  bindProjectActions(projectId);
  bindProjectExports(projectId);
  bindOfficialImport(projectId);
  bindBaseViewer(projectId);
  bindProjectChaptersUI(projectId);

  UI.qs("#budgetMode")?.addEventListener("change", ()=>{
    const fresh = StorageAPI.getProjectById(projectId);
    renderProjectDetail(fresh);
    renderChaptersTable(fresh);
    renderItemsTable(fresh);
    renderResumenItems(fresh);
    renderProjectChaptersUI(fresh);
  });

  UI.qs("#btnApuSearch")?.addEventListener("click", async ()=>{
    const q = String(UI.qs("#apuSearch")?.value || "").trim();
    if(!q){
      renderApuResults(projectId, []);
      return;
    }
    try{
      const results = await APUBase.search(q, 30);
      renderApuResults(projectId, results);
    }catch(err){
      alert("Error buscando APU: " + (err?.message || err));
    }
  });

  UI.qs("#apuSearch")?.addEventListener("keydown", async (e)=>{
    if(e.key === "Enter"){
      e.preventDefault();
      UI.qs("#btnApuSearch")?.click();
    }
  });

  UI.qs("#btnAddApuClose")?.addEventListener("click", closeAddApuModal);
  UI.qs("#btnAddApuConfirm")?.addEventListener("click", ()=> confirmAddApuToProject({ keepOpen:false }));
  UI.qs("#btnAddApuConfirmAndKeep")?.addEventListener("click", ()=> confirmAddApuToProject({ keepOpen:true }));

  UI.qs("#formAddManual")?.addEventListener("submit", (e)=>{
    e.preventDefault();

    const form = e.currentTarget;
    const fd = new FormData(form);

    const mode = getBudgetModeFromUI();

    const chapterCode = String(fd.get("chapterCode") || "").trim();
    let chapterName = String(fd.get("chapterName") || "").trim();
    const code = String(fd.get("code") || "").trim();
    const unit = String(fd.get("unit") || "").trim();
    const desc = String(fd.get("desc") || "").trim();
    const pu = Number(fd.get("pu") || 0);
    const qty = Number(fd.get("qty") || 0);

    if(!code || !unit || !desc){
      alert("Debes completar código, unidad y descripción.");
      return;
    }
    if(!(pu > 0) || !(qty > 0)){
      alert("VR Unitario y Cantidad deben ser mayores a 0.");
      return;
    }

    if(chapterCode && !chapterName){
      chapterName = lookupChapterName(StorageAPI.getProjectById(projectId), chapterCode, mode) || "";
    }

    if(mode === "oficial"){
      StorageAPI.addOfficialItem(projectId, {
        chapterCode, chapterName, code, apuRefCode: code, desc, unit, pu, qty
      });
    }else{
      StorageAPI.addItem(projectId, {
        chapterCode, chapterName, code, apuRefCode: code, desc, unit, pu, qty
      });
    }

    form.reset();

    const fresh = StorageAPI.getProjectById(projectId);
    renderProjectDetail(fresh);
    renderChaptersTable(fresh);
    renderItemsTable(fresh);
    renderResumenItems(fresh);
  });

  renderProjectDetail(project);
  renderChaptersTable(project);
  renderProjectChaptersUI(project);
  renderItemsTable(project);
  renderResumenItems(project);
  renderAjustes(project);
  await renderDocs(projectId);
}

/* =========================
   Página APU — FIX REAL
   ========================= */
function qsAny(selectors){
  for(const s of selectors){
    const el = document.querySelector(s);
    if(el) return el;
  }
  return null;
}

function getProjectApuOverride(project, apuCode, mode="base"){
  const budgetMode = String(mode || "base").toLowerCase();
  const key = budgetMode === "oficial" ? "oficialApuOverrides" : "apuOverrides";
  const map = project?.[key] || {};
  if(!map || typeof map !== "object") return null;

  const code = String(apuCode || "").trim();
  if(!code) return null;

  return map[code] || null;
}

function saveProjectApuOverride(projectId, apuCode, apuData, mode="base"){
  const fresh = StorageAPI.getProjectById(projectId);
  if(!fresh) return;

  const budgetMode = String(mode || "base").toLowerCase();
  const key = budgetMode === "oficial" ? "oficialApuOverrides" : "apuOverrides";
  const current = (fresh?.[key] && typeof fresh[key] === "object") ? fresh[key] : {};

  const patch = {};
  patch[key] = {
    ...current,
    [String(apuCode).trim()]: apuData
  };

  StorageAPI.updateProject(projectId, patch);
}

function normalizeApuLine(line){
  return {
    group: String(line?.group || line?.grupo || "").trim(),
    desc: String(line?.desc || line?.description || line?.descripcion || "").trim(),
    unit: String(line?.unit || line?.unidad || "").trim(),
    qty: Number(line?.qty ?? line?.cant ?? line?.cantidad ?? line?.rend ?? 0),
    pu: Number(line?.pu ?? line?.price ?? line?.precio ?? 0),
    parcial: Number(
      line?.parcial ?? (
        Number(line?.qty ?? line?.cant ?? line?.cantidad ?? line?.rend ?? 0) *
        Number(line?.pu ?? line?.price ?? line?.precio ?? 0)
      )
    )
  };
}

function calcApuPU(lines){
  return (lines || []).reduce((s, x) => s + Number(x?.parcial || 0), 0);
}

function renderApuHeaderGeneric({ project, apuCode, apuName, apuUnit, apuPU, mode }){
  const titleEl = qsAny(["#apuTitle", "#title", "h1"]);
  const subEl   = qsAny(["#apuSub", "#subtitle", ".apu-subtitle"]);
  const loadEl  = qsAny(["#apuLoading", "#loadingText", ".loading-text"]);
  const backEl  = qsAny(["#btnBackProjects", "#btnBack"]);

  if(titleEl){
    titleEl.textContent = `APU ${apuCode || ""}`.trim();
  }

  if(subEl){
    subEl.textContent =
      `${apuName || "Sin descripción"} · ${apuUnit || "-"} · PU ${UI.fmtMoney(apuPU || 0, project?.currency || "COP")} · ${budgetLabel(mode)}`;
  }

  if(loadEl){
    loadEl.textContent = "";
  }

  if(backEl && project?.id){
    backEl.onclick = (e)=>{
      e.preventDefault();
      location.href = `proyecto-detalle.html?projectId=${encodeURIComponent(project.id)}`;
    };
  }
}

function renderApuTableGeneric(project, rows){
  const tbody = qsAny([
    "#apuBody",
    "#apuRows",
    "#descompBody",
    "#apuTableBody",
    "#tablaApu tbody",
    "tbody"
  ]);

  if(!tbody) return;

  tbody.innerHTML = (rows || []).map((r, idx) => `
    <tr>
      <td>${UI.esc(r.group || "-")}</td>
      <td>${UI.esc(r.desc || "-")}</td>
      <td>${UI.esc(r.unit || "-")}</td>
      <td style="text-align:right">${UI.esc(String(r.qty || 0))}</td>
      <td style="text-align:right">${UI.fmtMoney(r.pu || 0, project?.currency || "COP")}</td>
      <td style="text-align:right"><b>${UI.fmtMoney(r.parcial || 0, project?.currency || "COP")}</b></td>
      <td class="row" style="gap:8px">
        <button class="btn" type="button" data-apu-edit-line="${idx}">Editar</button>
        <button class="btn danger" type="button" data-apu-del-line="${idx}">Eliminar</button>
      </td>
    </tr>
  `).join("");
}

async function loadApuDataCompat(project, apuCode, mode="base"){
  const override = getProjectApuOverride(project, apuCode, mode);

  let baseItem = null;
  let lines = [];

  if(window.APUBase){
    const itemFns = [
      "getAPUByCode",
      "getApuByCode",
      "getByCode",
      "getItemByCode",
      "getItemWithAnalysis",
      "getItemFull"
    ];

    for(const fn of itemFns){
      if(typeof APUBase[fn] === "function"){
        try{
          const out = await APUBase[fn](apuCode);
          if(out){
            baseItem = out;
            break;
          }
        }catch(_){}
      }
    }

    if(!baseItem && typeof APUBase.search === "function"){
      try{
        const found = await APUBase.search(apuCode, 20);
        if(Array.isArray(found) && found.length){
          baseItem =
            found.find(x => String(x?.code || "").trim() === String(apuCode).trim()) ||
            found.find(x => String(x?.code || "").trim() === String(apuCode).trim().replace(/^0+/, "")) ||
            found[0] ||
            null;
        }
      }catch(_){}
    }

    const lineFns = [
      "getCostosDirectosByItemCode",
      "listCostosDirectosByItemCode",
      "getCostosDirectos"
    ];

    for(const fn of lineFns){
      if(typeof APUBase[fn] === "function"){
        try{
          const out = await APUBase[fn](apuCode);
          if(Array.isArray(out) && out.length){
            lines = out.map(normalizeApuLine);
            break;
          }
        }catch(_){}
      }
    }

    if((!lines || !lines.length) && typeof APUBase.listCostosDirectosAll === "function"){
      try{
        const all = await APUBase.listCostosDirectosAll(apuCode, 500);
        if(Array.isArray(all) && all.length){
          lines = all
            .filter(x => String(x?.itemCode || x?.code || "").trim() === String(apuCode).trim())
            .map(normalizeApuLine);
        }
      }catch(_){}
    }
  }

  let apu = {
    code: String(baseItem?.code || apuCode || "").trim(),
    desc: String(baseItem?.desc || baseItem?.description || "").trim(),
    unit: String(baseItem?.unit || "").trim(),
    pu: Number(baseItem?.pu || 0),
    lines: Array.isArray(lines) ? lines : []
  };

  if(override && typeof override === "object"){
    apu = {
      code: String(override.code || apu.code || apuCode || "").trim(),
      desc: String(override.desc || apu.desc || "").trim(),
      unit: String(override.unit || apu.unit || "").trim(),
      pu: Number(override.pu || apu.pu || 0),
      lines: Array.isArray(override.lines) ? override.lines.map(normalizeApuLine) : apu.lines
    };
  }

  if((!apu.pu || apu.pu <= 0) && Array.isArray(apu.lines) && apu.lines.length){
    apu.pu = calcApuPU(apu.lines);
  }

  return apu;
}

async function bindApuPage(){
  const projectId = String(UI.getParam("projectId") || "").trim();
  const apuCode = String(UI.getParam("code") || "").trim();
  const mode = String(UI.getParam("mode") || "base").toLowerCase() === "oficial" ? "oficial" : "base";

  if(!projectId){
    alert("Falta projectId.");
    location.href = "proyectos.html";
    return;
  }

  if(!apuCode){
    alert("Falta el código del APU.");
    location.href = `proyecto-detalle.html?projectId=${encodeURIComponent(projectId)}`;
    return;
  }

  const project = StorageAPI.getProjectById(projectId);
  if(!project){
    alert("Proyecto no encontrado.");
    location.href = "proyectos.html";
    return;
  }

  const apu = await loadApuDataCompat(project, apuCode, mode);

  if(!apu || (!apu.desc && (!apu.lines || !apu.lines.length))){
    const loadEl = qsAny(["#apuLoading", "#loadingText", ".loading-text"]);
    if(loadEl) loadEl.textContent = "No se encontró la descomposición del APU.";
    return;
  }

  function redraw(currentApu){
    const lines = Array.isArray(currentApu.lines) ? currentApu.lines : [];
    currentApu.pu = calcApuPU(lines);

    renderApuHeaderGeneric({
      project,
      apuCode: currentApu.code || apuCode,
      apuName: currentApu.desc,
      apuUnit: currentApu.unit,
      apuPU: currentApu.pu,
      mode
    });

    renderApuTableGeneric(project, lines);

    const tbody = qsAny([
      "#apuBody",
      "#apuRows",
      "#descompBody",
      "#apuTableBody",
      "#tablaApu tbody",
      "tbody"
    ]);

    if(!tbody) return;

    tbody.querySelectorAll("[data-apu-edit-line]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const idx = Number(btn.getAttribute("data-apu-edit-line"));
        const row = lines[idx];
        if(!row) return;

        const group = prompt("Grupo:", row.group || "") ?? row.group;
        const desc = prompt("Descripción:", row.desc || "") ?? row.desc;
        const unit = prompt("Unidad:", row.unit || "") ?? row.unit;
        const qty = Number(prompt("Cant/Rend:", String(row.qty || 0)) ?? row.qty);
        const pu = Number(prompt("PU:", String(row.pu || 0)) ?? row.pu);

        lines[idx] = normalizeApuLine({ group, desc, unit, qty, pu });
        saveProjectApuOverride(projectId, apuCode, currentApu, mode);
        updateItemsPUByApuCompat(projectId, apuCode, calcApuPU(lines), mode);
        redraw(currentApu);
      });
    });

    tbody.querySelectorAll("[data-apu-del-line]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const idx = Number(btn.getAttribute("data-apu-del-line"));
        if(!(idx >= 0)) return;
        if(!confirm("¿Eliminar este insumo del APU?")) return;

        lines.splice(idx, 1);
        saveProjectApuOverride(projectId, apuCode, currentApu, mode);
        updateItemsPUByApuCompat(projectId, apuCode, calcApuPU(lines), mode);
        redraw(currentApu);
      });
    });
  }

  redraw(apu);

  const addBtn = qsAny(["#btnAddInsumo", "#btnAddLine", "#btnAgregarInsumo"]);
  if(addBtn){
    addBtn.addEventListener("click", ()=>{
      const group = prompt("Grupo:", "Materiales") || "";
      const desc = prompt("Descripción del insumo:", "") || "";
      if(!desc.trim()) return;

      const unit = prompt("Unidad:", "UND") || "";
      const qty = Number(prompt("Cant/Rend:", "1") || 0);
      const pu = Number(prompt("PU:", "0") || 0);

      if(!(qty > 0) || !(pu >= 0)){
        alert("Cantidad y PU no válidos.");
        return;
      }

      apu.lines = Array.isArray(apu.lines) ? apu.lines : [];
      apu.lines.push(normalizeApuLine({ group, desc, unit, qty, pu }));

      saveProjectApuOverride(projectId, apuCode, apu, mode);
      updateItemsPUByApuCompat(projectId, apuCode, calcApuPU(apu.lines), mode);
      redraw(apu);
    });
  }
}

/* =========================
   Boot general
   ========================= */
(function main(){
  initPWA();

  const p = page();

  if(p === "proyectos.html" || p === "index.html"){
    bindProjectsPage().catch(err=>{
      console.error(err);
      alert("Error inicializando proyectos: " + (err?.message || err));
    });
    return;
  }

  if(
    p === "proyecto-detalle.html" ||
    p === "presupuesto-base.html" ||
    p === "presupuesto-oficial.html"
  ){
    bindProjectDetailPage().catch(err=>{
      console.error(err);
      alert("Error inicializando proyecto: " + (err?.message || err));
    });
    return;
  }

  if(p === "apu.html"){
    bindApuPage().catch(err=>{
      console.error(err);
      alert("Error inicializando APU: " + (err?.message || err));
    });
    return;
  }
})();