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
    renderProjectDetail(fresh);
    renderChaptersTable(fresh);
    renderItemsTable(fresh);
    renderResumenItems(fresh);
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
  renderProjectDetail(updated);
  renderChaptersTable(updated);
  renderItemsTable(updated);
  renderResumenItems(updated);

  if(keepOpen){
    UI.qs("#addApuQty") && (UI.qs("#addApuQty").value = "1");
    refreshAddApuModalChapterOptions(updated);
    alert("Ítem agregado. Puedes escoger otro capítulo y volver a agregar.");
    return;
  }

  closeAddApuModal();
  alert("Ítem agregado al presupuesto.");
}

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
          <a class="btn" href="apu.html?itemId=${encodeURIComponent(it.id)}&projectId=${encodeURIComponent(project.id)}">Ver APU</a>
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
      renderProjectDetail(fresh);
      renderChaptersTable(fresh);
      renderItemsTable(fresh);
      renderResumenItems(fresh);
    });
  });
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

  ensureProjectChapters(project);

  bindTabsIfPresent();
  bindFirmaModal();
  bindBaseViewer(projectId);

  bindProjectChaptersUI(projectId);
  renderProjectChaptersUI(project);

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
  /* =========================
     🔍 BUSCADOR DE APUs
     ========================= */
  const inpApuSearch = UI.qs("#apuSearch");
  const btnApuSearch = UI.qs("#btnApuSearch");

  async function doSearch(){
    const q = String(inpApuSearch?.value || "").trim();

    let meta = null;
    try{ meta = await APUBase.getMeta(); }catch(_){}
    if(!meta){
      alert("Primero instala la Base APU (XLSX) desde Proyectos.");
      return;
    }

    try{
      const rows = await APUBase.search(q || "");
      renderApuResults(projectId, rows || []);
    }catch(err){
      alert("Error consultando base: " + (err?.message || err));
    }
  }

  btnApuSearch?.addEventListener("click", doSearch);
  inpApuSearch?.addEventListener("keydown", (e)=>{
    if(e.key === "Enter"){
      e.preventDefault();
      doSearch();
    }
  });

  /* =========================
     📎 DOCUMENTOS DEL PROYECTO
     ========================= */
  UI.qs("#fileDocs")?.addEventListener("change", async (e)=>{
    const files = Array.from(e.target.files || []);
    if(!files.length) return;

    try{
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
      await renderDocs(projectId);
      alert("Documento(s) cargado(s).");
    }catch(err){
      alert("Error guardando documento: " + (err?.message || err));
    }finally{
      e.target.value = "";
    }
  });

  /* =========================
     💾 EXPORTAR PROYECTO INDIVIDUAL
     ========================= */
  UI.qs("#btnExportProject")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;

      const docs = await DB.listFilesByOwner("project", projectId);

      const docsSerialized = [];
      for(const d of docs){
        try{
          const dataUrl = await blobToDataUrl(d.blob);
          docsSerialized.push({
            name: d.name,
            mime: d.mime,
            size: d.size,
            dataUrl
          });
        }catch(_){}
      }

      const payload = {
        project: fresh,
        docs: docsSerialized
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type:"application/json" });
      const url = URL.createObjectURL(blob);
      const filename = `proyecto_${sanitizeFileName(fresh.name)}_${Date.now()}.json`;

      UI.downloadBlobUrl(url, filename);
    }catch(err){
      alert("Error exportando proyecto: " + (err?.message || err));
    }
  });

  /* =========================
     🗑️ ELIMINAR PROYECTO
     ========================= */
  UI.qs("#btnDeleteProject")?.addEventListener("click", async ()=>{
    if(!confirm("¿Eliminar este proyecto y todos sus documentos?")) return;

    try{
      await DB.deleteFilesByOwner("project", projectId).catch(()=>{});
      StorageAPI.deleteProject(projectId);
      alert("Proyecto eliminado.");
      window.location.href = "proyectos.html";
    }catch(err){
      alert("Error eliminando proyecto: " + (err?.message || err));
    }
  });

  /* =========================
     🔄 ACTUALIZAR DATOS GENERALES
     ========================= */
  UI.qs("#btnSaveProject")?.addEventListener("click", ()=>{
    const fresh = StorageAPI.getProjectById(projectId);
    if(!fresh) return;

    const name = UI.qs("#projName")?.value || fresh.name;
    const entity = UI.qs("#projEntity")?.value || fresh.entity;
    const location = UI.qs("#projLocation")?.value || fresh.location;
    const currency = UI.qs("#projCurrency")?.value || fresh.currency;

    const adminPct = Number(UI.qs("#projAdminPct")?.value || fresh.adminPct || 0);
    const imprevPct = Number(UI.qs("#projImprevPct")?.value || fresh.imprevPct || 0);
    const utilPct = Number(UI.qs("#projUtilPct")?.value || fresh.utilPct || 0);
    const ivaUtilPct = Number(UI.qs("#projIvaUtilPct")?.value || fresh.ivaUtilPct || 0);

    StorageAPI.updateProject(projectId, {
      name,
      entity,
      location,
      currency,
      adminPct,
      imprevPct,
      utilPct,
      ivaUtilPct
    });

    const updated = StorageAPI.getProjectById(projectId);
    renderProjectDetail(updated);
    renderChaptersTable(updated);
    renderItemsTable(updated);
    renderResumenItems(updated);

    alert("Proyecto actualizado.");
  });

}

/* ==========================================
   🚀 INIT GENERAL
   ========================================== */
document.addEventListener("DOMContentLoaded", async ()=>{
  try{
    initPWA();

    const p = page();

    if(p === "proyectos.html"){
      await bindProjectsPage();
    }

    if(p === "proyecto-detalle.html"){
      await bindProjectDetailPage();
    }

  }catch(err){
    console.error("INIT ERROR:", err);
    alert("Error inicializando la aplicación: " + (err?.message || err));
  }
});