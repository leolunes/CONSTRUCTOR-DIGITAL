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
   - Aún no hace auditoría forense
   - Solo deja listo el comparativo técnico
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
   ✅ Export Excel
   - Base: lo existente
   - Oficial: mismo comportamiento usando la vista oficial
   ========================================== */
function exportProjectExcel(project, mode="base"){
  if(!project) return;

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

  // ✅ NUEVO: hoja comparativa si existe oficial
  const hasOfficial = Array.isArray(project?.oficialItems) && project.oficialItems.length > 0;
  if(hasOfficial){
    const comp = compareBudgets(project);
    const compRows = (comp.rows||[]).map(r=>({
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

function renderBudgetModeIndicator(project){
  const host = UI.qs("#budgetModeInfo");
  if(!host) return;

  const mode = getBudgetModeFromUI();
  const counts = getBudgetCounts(project);
  const label = budgetLabel(mode);

  const total = totalsCompat(getProjectView(project, mode));
  host.innerHTML = `
    <div class="row" style="gap:10px; flex-wrap:wrap">
      ${UI.chip(label, mode === "oficial" ? "warn" : "ok")}
      ${UI.chip(`Ítems: ${mode==="oficial" ? counts.oficialItems : counts.baseItems}`)}
      ${UI.chip(`Capítulos: ${mode==="oficial" ? counts.oficialChapters : counts.baseChapters}`)}
      ${UI.chip(`Total: ${UI.fmtMoney(total.total||0, project.currency||"COP")}`)}
    </div>
  `;
}

function renderComparisonPanel(project){
  const host = UI.qs("#comparisonPanel");
  if(!host) return;

  const comp = compareBudgets(project);
  const rows = comp.rows || [];
  const critical = rows.filter(r => Math.abs(Number(r.parcialDiff||0)) > 0);

  host.innerHTML = `
    <section class="card" style="margin-top:14px">
      <div class="cardhead">
        <h2>Comparativo Base vs Oficial</h2>
        <p class="muted small">Vista preliminar de diferencias para auditoría técnica.</p>
      </div>

      <div class="grid two">
        <div class="item">
          <div class="name">Total Base</div>
          <div class="muted small"><b>${UI.fmtMoney(comp.totals.base.total||0, project.currency||"COP")}</b></div>
        </div>
        <div class="item">
          <div class="name">Total Oficial</div>
          <div class="muted small"><b>${UI.fmtMoney(comp.totals.oficial.total||0, project.currency||"COP")}</b></div>
        </div>
        <div class="item">
          <div class="name">Diferencia Total</div>
          <div class="muted small"><b>${UI.fmtMoney(comp.totals.diffTotal||0, project.currency||"COP")}</b></div>
        </div>
        <div class="item">
          <div class="name">Ítems con diferencia</div>
          <div class="muted small"><b>${critical.length}</b></div>
        </div>
      </div>

      <div class="tablewrap" style="margin-top:12px">
        <table class="table" style="min-width:1200px">
          <thead>
            <tr>
              <th>Código</th>
              <th>Descripción</th>
              <th style="text-align:right">PU Base</th>
              <th style="text-align:right">PU Oficial</th>
              <th style="text-align:right">DIF PU</th>
              <th style="text-align:right">Cant Base</th>
              <th style="text-align:right">Cant Oficial</th>
              <th style="text-align:right">DIF Cant</th>
              <th style="text-align:right">Parcial Base</th>
              <th style="text-align:right">Parcial Oficial</th>
              <th style="text-align:right">DIF Parcial</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows.length
                ? rows.map(r=>`
                    <tr>
                      <td><b>${UI.esc(r.code||"")}</b></td>
                      <td>${UI.esc(r.desc||"")}</td>
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
                : `<tr><td colspan="11" class="muted">No hay datos comparables todavía.</td></tr>`
            }
          </tbody>
        </table>
      </div>
    </section>
  `;
}

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

  const totals = totalsCompat(view);
  const k = UI.qs("#cardTotals");
  if(k){
    k.innerHTML = `
      <div class="card item"><div class="name">Ítems</div><div class="chips">${UI.chip(String((view.items||[]).length),"ok")}</div></div>
      <div class="card item"><div class="name">Costos directos</div><div class="chips">${UI.chip(UI.fmtMoney(totals.directo, project.currency||"COP"))}</div></div>
      <div class="card item"><div class="name">SUBTOTAL</div><div class="chips">${UI.chip(UI.fmtMoney(totals.subtotal||0, project.currency||"COP"))}</div></div>
      <div class="card item"><div class="name">VALOR TOTAL</div><div class="chips">${UI.chip(UI.fmtMoney(totals.total, project.currency||"COP"),"ok")}</div></div>
    `;
  }

  const rows = UI.qs("#totalsRows");
  if(rows){
    rows.innerHTML = `
      <div class="row space"><div class="name">TIPO</div><div><b>${UI.esc(budgetLabel(mode))}</b></div></div>
      <hr class="sep">
      <div class="row space"><div class="name">TOTAL COSTOS DIRECTOS</div><div><b>${UI.fmtMoney(totals.directo, project.currency||"COP")}</b></div></div>

      <div class="row space"><div class="name">ADMINISTRACIÓN (${UI.esc(String(adminPct||0))}%)</div><div><b>${UI.fmtMoney(totals.admin||0, project.currency||"COP")}</b></div></div>
      <div class="row space"><div class="name">IMPREVISTOS (${UI.esc(String(imprevPct||0))}%)</div><div><b>${UI.fmtMoney(totals.imprev||0, project.currency||"COP")}</b></div></div>
      <div class="row space"><div class="name">UTILIDAD (${UI.esc(String(utilPct||0))}%)</div><div><b>${UI.fmtMoney(totals.util||0, project.currency||"COP")}</b></div></div>

      <hr class="sep">

      <div class="row space"><div class="name">SUBTOTAL</div><div><b>${UI.fmtMoney(totals.subtotal||0, project.currency||"COP")}</b></div></div>
      <div class="row space"><div class="name">IVA sobre Utilidad (${UI.esc(String(ivaUtilPct||0))}%)</div><div><b>${UI.fmtMoney(totals.ivaUtil||0, project.currency||"COP")}</b></div></div>

      <hr class="sep">
      <div class="row space"><div class="name">VALOR TOTAL</div><div><b>${UI.fmtMoney(totals.total, project.currency||"COP")}</b></div></div>

      <div id="comparisonPanel"></div>
    `;
  }

  renderBudgetModeIndicator(project);
  renderComparisonPanel(project);
}

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
      <td><b>${UI.esc(g.chapterCode)}</b></td>
      <td>${UI.esc(g.chapterName||"")}</td>
      <td style="text-align:right">${UI.esc(String(g.itemsCount))}</td>
      <td style="text-align:right"><b>${UI.fmtMoney(g.subtotal, project.currency||"COP")}</b></td>
    </tr>
  `).join("");
}

/* =========================
   render + bind capítulos manuales
   ========================= */
function renderProjectChaptersUI(project){
  const tbody = UI.qs("#projectChaptersBody");
  const empty = UI.qs("#projectChaptersEmpty");
  if(!tbody) return;

  const mode = getBudgetModeFromUI();
  const chapters = ensureProjectChapters(project, mode);

  if(!chapters.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  tbody.innerHTML = chapters
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

      const mode2 = getBudgetModeFromUI();
      const list = ensureProjectChapters(fresh, mode2);
      const c = list.find(x=>x.id===id);
      if(!c) return;

      if(!confirm(`¿Eliminar el capítulo ${c.chapterCode} - ${c.chapterName}?`)) return;

      const next = list.filter(x=>x.id!==id);

      if(mode2 === "oficial"){
        StorageAPI.updateProject(fresh.id, { oficialChapters: next });
      }else{
        StorageAPI.updateProject(fresh.id, { chapters: next });
      }

      const updated = StorageAPI.getProjectById(fresh.id);
      renderProjectChaptersUI(updated);
      refreshAddApuModalChapterOptions(updated);
      renderChaptersTable(updated);
      renderResumenItems(updated);
      renderItemsTable(updated);
    });
  });

  tbody.querySelectorAll("[data-editchap]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-editchap");
      const fresh = StorageAPI.getProjectById(project.id);
      if(!fresh) return;

      const mode2 = getBudgetModeFromUI();
      const list = ensureProjectChapters(fresh, mode2);
      const c = list.find(x=>x.id===id);
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

    const mode = getBudgetModeFromUI();
    const list = ensureProjectChapters(fresh, mode);

    const chapterCode = String(inpCode.value||"").trim();
    const chapterName = String(inpName.value||"").trim();

    if(!chapterCode){
      alert("Escribe el número del capítulo.");
      return;
    }
    if(!/^\d+(\.\d+)?$/.test(chapterCode)){
      alert("El número de capítulo debe ser numérico (ej: 1, 2, 10, 10.00).");
      return;
    }
    if(!chapterName){
      alert("Escribe el nombre del capítulo.");
      return;
    }

    const editId = String(hid?.value||"").trim();
    const dup = list.find(x=>x.chapterCode===chapterCode && x.id!==editId);
    if(dup){
      alert(`Ya existe el capítulo ${chapterCode}. Edita el existente.`);
      return;
    }

    let next = list.slice();
    if(editId){
      next = next.map(x => x.id===editId ? ({...x, chapterCode, chapterName}) : x);
    }else{
      next.push({ id: makeId(mode === "oficial" ? "ochap" : "chap"), chapterCode, chapterName });
    }

    if(mode === "oficial"){
      StorageAPI.updateProject(projectId, { oficialChapters: next });
    }else{
      StorageAPI.updateProject(projectId, { chapters: next });
    }

    const updated = StorageAPI.getProjectById(projectId);
    clearForm();
    renderProjectChaptersUI(updated);
    refreshAddApuModalChapterOptions(updated);
    renderChaptersTable(updated);
    renderResumenItems(updated);
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
   Modal agregar APU con capítulo
   ========================= */
let __addApuModalState = {
  projectId: "",
  apu: null
};

function openAddApuModal(project, apu){
  const mode = getBudgetModeFromUI();
  const modal = UI.qs("#addApuModal");

  if(!modal) {
    const qtyOld = Number(prompt("Cantidad del ítem:", "1") || "0");
    if(!qtyOld) return;

    if(mode === "oficial"){
      StorageAPI.addOfficialItem(project.id, {
        chapterCode: apu.chapterCode || "",
        chapterName: apu.chapterName || "",
        code: apu.code,
        apuRefCode: apu.code,
        desc: apu.desc,
        unit: apu.unit,
        pu: Number(apu.pu||0),
        qty: qtyOld
      });
    }else{
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
   VISOR "Consultas de Base APU"
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
      sub.textContent = "Líneas de descomposición (muestra una muestra filtrable).";
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
      sub.textContent = "Listado de subproductos. Puedes abrir el detalle.";
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
      sub.textContent = "Listado de insumos (filtrable por tipo/desc/unidad).";
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
        const rows = await APUBase.listFormularioItems(q || "", 250);
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
        const rows = await APUBase.listCostosDirectosAll(q || "", 250);
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
        const list = await APUBase.listSubproductos(250);
        const qn = (q||"").trim().toLowerCase();
        const filtered = !qn ? list : list.filter(x =>
          String(x.subName||"").toLowerCase().includes(qn) ||
          String(x.subKey||"").toLowerCase().includes(qn)
        );

        if(!filtered.length){ showEmpty(true); return; }

        const budgetMode = getBudgetModeFromUI();

        body.innerHTML = filtered.map(s=>`
          <tr>
            <td><b>${UI.esc(s.subName||"")}</b></td>
            <td class="muted small">${UI.esc(s.subKey||"")}</td>
            <td>
              <a class="btn" href="apu.html?sub=${encodeURIComponent(s.subKey||"")}&projectId=${encodeURIComponent(projectId||"")}&mode=${encodeURIComponent(budgetMode)}">Ver</a>
            </td>
          </tr>
        `).join("");
        return;
      }

      if(mode === "insumos"){
        const rows = await APUBase.listInsumos(q || "", 250);
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

  ensureProjectChapters(project, "base");
  ensureProjectChapters(project, "oficial");

  bindTabsIfPresent();
  bindFirmaModal();
  bindBaseViewer(projectId);

  bindProjectChaptersUI(projectId);
  renderProjectChaptersUI(project);

  const budgetModeSelect = UI.qs("#budgetMode");
  if(budgetModeSelect){
    budgetModeSelect.value = (UI.getParam("budgetMode") || "base").toLowerCase() === "oficial" ? "oficial" : "base";
    budgetModeSelect.addEventListener("change", ()=>{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      renderProjectDetail(fresh);
      renderProjectChaptersUI(fresh);
      refreshAddApuModalChapterOptions(fresh);
      renderChaptersTable(fresh);
      renderItemsTable(fresh);
      renderResumenItems(fresh);
    });
  }

  UI.qs("#btnAddApuClose")?.addEventListener("click", closeAddApuModal);
  UI.qs("#btnAddApuConfirm")?.addEventListener("click", ()=> confirmAddApuToProject({ keepOpen:false }));
  UI.qs("#btnAddApuConfirmAndKeep")?.addEventListener("click", ()=> confirmAddApuToProject({ keepOpen:true }));

  renderProjectDetail(project);
  renderChaptersTable(project);
  renderItemsTable(project);
  renderResumenItems(project);
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
      exportProjectExcel(fresh, getBudgetModeFromUI());
    }catch(err){
      alert("Error exportando Excel: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfPresupuesto")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      const mode = getBudgetModeFromUI();
      const view = getProjectView(fresh, mode);
      await PDF.exportPresupuestoPDF(view, { share: isIOS() });
    }catch(err){
      alert("Error generando PDF: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfPresupuestoAPUs")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      const mode = getBudgetModeFromUI();
      const view = getProjectView(fresh, mode);
      await PDF.exportPresupuestoConAPUsPDF(view, { share: isIOS() });
    }catch(err){
      alert("Error generando PDF + APUs: " + (err?.message || err));
    }
  });

  UI.qs("#btnDlPdfPresupuesto")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      const mode = getBudgetModeFromUI();
      const view = getProjectView(fresh, mode);
      await PDF.exportPresupuestoPDF(view);
    }catch(err){
      alert("Error descargando PDF Presupuesto: " + (err?.message || err));
    }
  });

  UI.qs("#btnDlPdfPresupuestoAPUs")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      const mode = getBudgetModeFromUI();
      const view = getProjectView(fresh, mode);
      await PDF.exportPresupuestoConAPUsPDF(view);
    }catch(err){
      alert("Error descargando PDF Presupuesto + APUs: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfEspecificacionesTec")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      const mode = getBudgetModeFromUI();
      const view = getProjectView(fresh, mode);
      await PDF.exportEspecificacionesTecnicasPDF(view, { share: isIOS() });
    }catch(err){
      alert("Error generando PDF Especificaciones Técnicas: " + (err?.message || err));
    }
  });

  UI.qs("#btnDlPdfEspecificacionesTec")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      const mode = getBudgetModeFromUI();
      const view = getProjectView(fresh, mode);
      await PDF.exportEspecificacionesTecnicasPDF(view);
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
      const mode = getBudgetModeFromUI();
      const view = getProjectView(fresh, mode);
      await PDF.exportPresupuestoObraDesagregadoPDF(view, { share: isIOS() });
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
      const mode = getBudgetModeFromUI();
      const view = getProjectView(fresh, mode);
      await PDF.exportResumenPresupuestoObraDesagregadoPDF(view, { share: isIOS() });
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
      const mode = getBudgetModeFromUI();
      const view = getProjectView(fresh, mode);
      await PDF.exportDistribucionPorcentualCostosDirectosPDF(view, { share: isIOS() });
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
      const mode = getBudgetModeFromUI();
      const view = getProjectView(fresh, mode);
      await PDF.exportRendimientoEquipoManoObraActividadPDF(view, { share: isIOS() });
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
      const mode = getBudgetModeFromUI();
      const view = getProjectView(fresh, mode);
      await PDF.exportResumenMaterialesPorActividadPDF(view, { share: isIOS() });
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
      const mode = getBudgetModeFromUI();
      const view = getProjectView(fresh, mode);
      await PDF.exportCantidadRecursosInsumosPresupuestoPDF(view, { share: isIOS() });
    }catch(err){
      alert("Error generando Cantidad de Recurso e Insumos del Presupuesto: " + (err?.message || err));
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

    StorageAPI.updateProject(projectId, {
      adminPct, imprevPct, utilPct, ivaUtilPct,
      instPais, instDepto, instMunicipio, instEntidad, instProyectoLabel, instFechaElab
    });

    const fresh = StorageAPI.getProjectById(projectId);
    alert("Ajustes guardados.");
    renderProjectDetail(fresh);
    renderResumenItems(fresh);
  });

  const form = UI.qs("#formAjustes");
  if(form){
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
  }

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

    const mode = getBudgetModeFromUI();

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
      chapterName = lookupChapterName(fresh, chapterCode, mode) || "";
    }

    if(mode === "oficial"){
      StorageAPI.addOfficialItem(projectId, { chapterCode, chapterName, code, apuRefCode: code, unit, desc, pu, qty });
    }else{
      StorageAPI.addItem(projectId, { chapterCode, chapterName, code, apuRefCode: code, unit, desc, pu, qty });
    }

    e.target.reset();
    const updated = StorageAPI.getProjectById(projectId);
    renderProjectDetail(updated);
    renderChaptersTable(updated);
    renderItemsTable(updated);
    renderResumenItems(updated);
    alert(`Ítem agregado al ${budgetLabel(mode).toLowerCase()}.`);
  });
}

/* ---------- APU PAGE (Override por proyecto) ---------- */
async function bindAPUPage(){
  const codeParam = UI.getParam("code");
  const sub = UI.getParam("sub");
  const projectId = UI.getParam("projectId");
  const budgetMode = (UI.getParam("mode") || "base").toLowerCase() === "oficial" ? "oficial" : "base";

  const btnGo = UI.qs("#btnGoProject");
  if(btnGo){
    btnGo.href = projectId
      ? `proyecto-detalle.html?projectId=${encodeURIComponent(projectId)}&tab=items&budgetMode=${encodeURIComponent(budgetMode)}`
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
          ? `<a class="btn" href="apu.html?sub=${encodeURIComponent(l.subRef)}${projectId?`&projectId=${encodeURIComponent(projectId)}`:""}&mode=${encodeURIComponent(budgetMode)}">Ver subproducto</a>`
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
    const list = budgetMode === "oficial" ? (proj?.oficialItems||[]) : (proj?.items||[]);
    const hit = list.find(x => String(x.code||"").trim() === apuCode);
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
      const ov = budgetMode === "oficial"
        ? StorageAPI.getOfficialApuOverride(projectId, apuCode)
        : StorageAPI.getApuOverride(projectId, apuCode);

      if(ov && Array.isArray(ov.lines) && ov.lines.length){
        const title = (displayCode && displayCode !== apuCode) ? `APU ${displayCode} (Ref: ${apuCode})` : `APU ${apuCode}`;
        apu = {
          title,
          subtitle: budgetMode === "oficial" ? "(Override del presupuesto oficial)" : "(Override del proyecto)",
          header: `${apuCode} — Override ${budgetMode === "oficial" ? "oficial" : "base"}`,
          metaLine: `Fuente: Override ${budgetMode === "oficial" ? "oficial" : "base"} · Actualizado: ${(ov.updatedAt||"").slice(0,19).replace("T"," ")}`,
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
    apu = await APUBase.getSubAPU(sub);
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
      <p class="muted small"><b>Modo:</b> ${UI.esc(budgetLabel(budgetMode))}</p>
    </div>
    <div class="grid two">
      <div class="item"><div class="name">Unidad</div><div class="muted small">${UI.esc(apu.unit||"-")}</div></div>
      <div class="item"><div class="name">Costo directo</div><div class="muted small"><b>${UI.fmtMoney(apu.directo||0,"COP")}</b></div></div>
    </div>
  `);

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
      const label = budgetLabel(budgetMode).toLowerCase();
      if(!confirm(`¿Guardar override del APU para este ${label}?\nEsto actualizará el PU del ítem en el presupuesto.`)) return;

      const cleaned = localLines.map(l=>({
        group: String(l.group||"-"),
        desc: String(l.desc||""),
        unit: String(l.unit||""),
        qty: Number(l.qty||0),
        pu: Number(l.pu||0),
        parcial: Number(l.parcial||0) || (Number(l.qty||0)*Number(l.pu||0))
      }));

      if(budgetMode === "oficial"){
        StorageAPI.setOfficialApuOverride(projectId, apuCode, cleaned);
      }else{
        StorageAPI.setApuOverride(projectId, apuCode, cleaned);
      }

      const newPU = computeDirecto(cleaned);
      const count = updateItemsPUByApuCompat(projectId, apuCode, newPU, budgetMode);

      alert(`Override guardado.\nNuevo PU (Costo directo): ${UI.fmtMoney(newPU,"COP")}\nÍtems actualizados: ${count}`);
      apu.directo = newPU;
      subEl && (subEl.textContent = budgetMode === "oficial" ? "(Override del presupuesto oficial)" : "(Override del proyecto)");
      renderLines();
    });

    btnResetOverride?.addEventListener("click", async ()=>{
      if(!confirm(`¿Quitar override del ${budgetLabel(budgetMode).toLowerCase()}?\n(NO borra la Base APU).`)) return;

      if(budgetMode === "oficial"){
        StorageAPI.clearOfficialApuOverride(projectId, apuCode);
      }else{
        StorageAPI.clearApuOverride(projectId, apuCode);
      }

      alert("Override eliminado. Vuelve a abrir el APU para ver el original.");
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