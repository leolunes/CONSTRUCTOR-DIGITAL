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
    const k = "__audit_ls_test__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  }catch(_){
    return false;
  }
}

async function requestPersistentStorage(){
  if(__persistTried) return false;
  __persistTried = true;

  try{
    if(navigator.storage && navigator.storage.persist){
      const already = await navigator.storage.persisted?.();
      if(already) return true;
      return !!(await navigator.storage.persist());
    }
  }catch(_){}
  return false;
}

function maybeWarnStorage(){
  if(__storageWarned) return;
  __storageWarned = true;

  const ios = isIOS();
  const emb = isInAppBrowser();
  const ok = localStorageWritable();

  if(!ok){
    alert("⚠️ Este navegador no permite guardar datos correctamente.\n\nPruebe abrir la app en Chrome, Edge o Safari normal.");
    return;
  }

  if(ios || emb){
    alert(
      "ℹ️ Recomendación:\n\n" +
      "Para evitar pérdida de información, abra esta app en el navegador normal del equipo " +
      "(no dentro de WhatsApp / Facebook / Instagram) y agréguela a pantalla de inicio si desea usarla como app."
    );
  }
}

async function initPWA(){
  maybeWarnStorage();
  await requestPersistentStorage().catch(()=>{});

  if("serviceWorker" in navigator){
    window.addEventListener("load", ()=>{
      navigator.serviceWorker.register("pwa/sw.js").catch(console.warn);
    });
  }
}

/* =========================
   Helpers de presupuesto
   ========================= */
function getBudgetModeFromUI(){
  const p = page();
  if(p === "presupuesto-oficial.html") return "oficial";
  return "base";
}
function budgetLabel(mode){
  return String(mode||"base").toLowerCase() === "oficial"
    ? "Presupuesto Oficial"
    : "Presupuesto Base";
}
function getProjectItemsByMode(project, mode){
  return String(mode||"base").toLowerCase() === "oficial"
    ? (project?.officialItems || [])
    : (project?.items || []);
}
function getProjectChaptersByMode(project, mode){
  return String(mode||"base").toLowerCase() === "oficial"
    ? (project?.officialChapters || [])
    : (project?.chapters || []);
}
function lookupChapterName(project, chapterCode, mode){
  const code = String(chapterCode||"").trim();
  if(!code) return "";
  const arr = getProjectChaptersByMode(project, mode);
  const hit = (arr||[]).find(c => String(c.code||"").trim() === code);
  return hit?.name || "";
}
function getAllChaptersForProject(project, mode){
  const base = Array.isArray(getProjectChaptersByMode(project, mode))
    ? [...getProjectChaptersByMode(project, mode)]
    : [];

  const seen = new Set(base.map(c => String(c.code||"").trim()));
  const items = getProjectItemsByMode(project, mode) || [];

  items.forEach(it=>{
    const code = String(it.chapterCode || (String(it.code||"").split(".")[0]||"")).trim();
    if(!code || seen.has(code)) return;
    seen.add(code);
    base.push({
      code,
      name: String(it.chapterName || "").trim() || `Capítulo ${code}`
    });
  });

  base.sort((a,b)=> String(a.code).localeCompare(String(b.code), undefined, { numeric:true }));
  return base;
}
function sanitizeFileName(str){
  return String(str||"archivo")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*]+/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 80);
}

/* =========================
   Totales compat
   ========================= */
function totalsCompat(project, mode){
  const calcInput = String(mode||"base").toLowerCase() === "oficial"
    ? { ...project, items: project?.officialItems || [] }
    : project;

  let t = {};
  try{
    t = (window.Calc && typeof Calc.calcTotals === "function")
      ? (Calc.calcTotals(calcInput) || {})
      : {};
  }catch(_){
    t = {};
  }

  const directo = Number(t.directo ?? t.directCost ?? 0);
  const adminPct = Number(project?.adminPct ?? project?.aiuPct ?? 0);
  const imprevPct = Number(project?.imprevPct ?? 0);
  const utilPct = Number(project?.utilPct ?? 0);
  const ivaUtilPct = Number(project?.ivaUtilPct ?? project?.ivaPct ?? 0);

  const admin = Number(t.admin ?? (directo * adminPct/100));
  const imprev = Number(t.imprev ?? (directo * imprevPct/100));
  const util = Number(t.util ?? (directo * utilPct/100));
  const subtotal = Number(t.subtotal ?? (directo + admin + imprev + util));
  const ivaUtil = Number(t.ivaUtil ?? t.iva ?? (util * ivaUtilPct/100));
  const total = Number(t.total ?? (subtotal + ivaUtil));

  return {
    directo,
    admin, imprev, util,
    subtotal,
    ivaUtil,
    total,
    adminPct, imprevPct, utilPct, ivaUtilPct
  };
}

function computeChapterRows(project, mode){
  const items = getProjectItemsByMode(project, mode) || [];
  const by = new Map();

  items.forEach(it=>{
    const code = String(it.chapterCode || (String(it.code||"").split(".")[0]||"")).trim();
    const name = String(it.chapterName||"").trim() || lookupChapterName(project, code, mode) || `Capítulo ${code||"-"}`;
    const parcial = Number(it.pu||0) * Number(it.qty||0);
    if(!by.has(code)){
      by.set(code, { code, name, itemsCount:0, subtotal:0 });
    }
    const row = by.get(code);
    row.itemsCount += 1;
    row.subtotal += parcial;
  });

  return [...by.values()].sort((a,b)=> String(a.code).localeCompare(String(b.code), undefined, { numeric:true }));
}

/* =========================
   Storage compat adicional
   ========================= */
function ensureOfficialArrays(project){
  if(!project.officialItems) project.officialItems = [];
  if(!project.officialChapters) project.officialChapters = [];
  if(!project.oficialMeta) project.oficialMeta = {};
  return project;
}
function ensureApuOverrideMaps(project){
  if(!project.apuOverrides || typeof project.apuOverrides !== "object") project.apuOverrides = {};
  if(!project.oficialApuOverrides || typeof project.oficialApuOverrides !== "object") project.oficialApuOverrides = {};
  if(!project.officialApuOverrides || typeof project.officialApuOverrides !== "object") project.officialApuOverrides = project.oficialApuOverrides || {};
  return project;
}
function getAllProjectsCompat(){
  const list = StorageAPI.listProjects ? StorageAPI.listProjects() : [];
  return (list||[]).map(p=> ensureApuOverrideMaps(ensureOfficialArrays(p)));
}
function getProjectCompat(id){
  const p = StorageAPI.getProjectById(id);
  return p ? ensureApuOverrideMaps(ensureOfficialArrays(p)) : null;
}
function saveProjectCompat(project){
  ensureApuOverrideMaps(ensureOfficialArrays(project));
  StorageAPI.updateProject(project.id, project);
  return getProjectCompat(project.id);
}
function updateItemsPUByApuCompat(projectId, apuCode, newPU, mode="base"){
  const p = getProjectCompat(projectId);
  if(!p) return;

  const codeNeedle = String(apuCode||"").trim();
  const official = String(mode||"base").toLowerCase() === "oficial";

  const items = official ? (p.officialItems || []) : (p.items || []);
  const upd = items.map(it=>{
    const ref = String(it.apuRefCode || it.code || "").trim();
    const vis = String(it.code || "").trim();
    if(ref === codeNeedle || vis === codeNeedle){
      return { ...it, pu: Number(newPU||0) };
    }
    return it;
  });

  if(official){
    StorageAPI.updateProject(projectId, { officialItems: upd });
  }else{
    StorageAPI.updateProject(projectId, { items: upd });
  }
}

/* =========================
   Página proyectos
   ========================= */
async function bindProjectsPage(){
  const projectsWrap = UI.qs("#projectsList");
  const empty = UI.qs("#projectsEmpty");
  const kpiProjects = UI.qs("#kpiProjects");
  const kpiTotal = UI.qs("#kpiTotal");
  const kpiBase = UI.qs("#kpiBase");

  function render(){
    const list = getAllProjectsCompat();

    if(kpiProjects) kpiProjects.textContent = String(list.length);

    let sum = 0;
    list.forEach(p=>{
      const t = totalsCompat(p, "base");
      sum += Number(t.total || 0);
    });
    if(kpiTotal) kpiTotal.textContent = UI.fmtMoney(sum, "COP");

    if(kpiBase){
      try{
        const meta = (window.APUBase && typeof APUBase.getMeta === "function") ? APUBase.getMeta() : null;
        if(meta && (meta.items || meta.insumos || meta.cdLines || meta.subLines)){
          kpiBase.textContent = `Sí · Ítems: ${meta.items||0} · CD: ${meta.cdLines||0} · Subp: ${meta.subLines||0} · Insumos: ${meta.insumos||0}`;
        }else{
          kpiBase.textContent = "No instalada";
        }
      }catch(_){
        kpiBase.textContent = "No instalada";
      }
    }

    if(!projectsWrap) return;
    if(!list.length){
      projectsWrap.innerHTML = "";
      if(empty) empty.style.display = "";
      return;
    }
    if(empty) empty.style.display = "none";

    projectsWrap.innerHTML = list.map(p=>{
      const t = totalsCompat(p, "base");
      const chapters = (p.chapters||[]).length;
      const items = (p.items||[]).length;
      return `
        <article class="card">
          <div class="row" style="justify-content:space-between;align-items:flex-start;gap:12px">
            <div>
              <h3 style="margin:0 0 6px 0">${UI.esc(p.name||"Proyecto sin nombre")}</h3>
              <div class="muted">${UI.esc(p.client||"")}</div>
              <div class="muted">${UI.esc(p.location||"")}</div>
            </div>
            <div class="row" style="gap:8px;flex-wrap:wrap">
              <a class="btn" href="proyecto-detalle.html?projectId=${encodeURIComponent(p.id)}">Abrir</a>
              <button class="btn danger" type="button" data-del="${p.id}">Eliminar</button>
            </div>
          </div>
          <div class="grid cols-4" style="margin-top:14px">
            <div class="mini-kpi"><small>Capítulos</small><b>${chapters}</b></div>
            <div class="mini-kpi"><small>Ítems</small><b>${items}</b></div>
            <div class="mini-kpi"><small>Total</small><b>${UI.fmtMoney(t.total||0, p.currency||"COP")}</b></div>
            <div class="mini-kpi"><small>Fecha</small><b>${UI.esc((p.createdAt||"").slice(0,10))}</b></div>
          </div>
        </article>
      `;
    }).join("");

    projectsWrap.querySelectorAll("[data-del]").forEach(btn=>{
      btn.addEventListener("click", async ()=>{
        const id = btn.getAttribute("data-del");
        if(!confirm("¿Eliminar proyecto y sus documentos?")) return;
        try{
          await DB.deleteFilesByOwner("project", id).catch(()=>{});
          StorageAPI.deleteProject(id);
          render();
        }catch(err){
          alert("Error eliminando proyecto: " + (err?.message || err));
        }
      });
    });
  }

  UI.qs("#formNewProject")?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const form = e.currentTarget;
    const name = form.name?.value?.trim();
    if(!name){
      alert("Digite el nombre del proyecto.");
      return;
    }

    const p = StorageAPI.createProject({
      name,
      client: form.client?.value?.trim() || "",
      location: form.location?.value?.trim() || "",
      currency: form.currency?.value?.trim() || "COP",
      adminPct: Number(form.adminPct?.value || 0),
      imprevPct: Number(form.imprevPct?.value || 0),
      utilPct: Number(form.utilPct?.value || 0),
      ivaUtilPct: Number(form.ivaUtilPct?.value || 0),
      chapters: [],
      items: [],
      officialChapters: [],
      officialItems: [],
      apuOverrides: {},
      officialApuOverrides: {}
    });

    form.reset();
    location.href = `proyecto-detalle.html?projectId=${encodeURIComponent(p.id)}`;
  });

  UI.qs("#btnExportBackup")?.addEventListener("click", ()=>{
    const out = StorageAPI.exportBackup();
    UI.downloadBlobUrl(out.url, out.filename);
  });

  UI.qs("#fileImportBackup")?.addEventListener("change", async (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;

    try{
      await StorageAPI.importBackupFromFile(f);
      alert("Backup importado correctamente.");
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
      const ps = getAllProjectsCompat();
      for(const p of ps){
        await DB.deleteFilesByOwner("project", p.id).catch(()=>{});
      }
      StorageAPI.resetAll();
      if(alsoBase){
        try{ await APUBase.deleteBaseDatabase(); }catch(_){}
      }
      alert("Todo fue eliminado.");
      location.reload();
    }catch(err){
      alert("Error reseteando: " + (err?.message || err));
    }
  });

  UI.qs("#btnGoBase")?.addEventListener("click", ()=>{
    location.href = "presupuesto-base.html";
  });

  UI.qs("#btnGoOfficial")?.addEventListener("click", ()=>{
    location.href = "presupuesto-oficial.html";
  });

  render();
}

/* =========================
   Render resumen proyecto
   ========================= */
function renderProjectDetail(project){
  const mode = getBudgetModeFromUI();
  const t = totalsCompat(project, mode);

  UI.qs("#projectName") && (UI.qs("#projectName").textContent = project?.name || "Proyecto");
  UI.qs("#projectClient") && (UI.qs("#projectClient").textContent = project?.client || "");
  UI.qs("#projectLocation") && (UI.qs("#projectLocation").textContent = project?.location || "");
  UI.qs("#budgetModeLabel") && (UI.qs("#budgetModeLabel").textContent = budgetLabel(mode));

  UI.qs("#kpiDirecto") && (UI.qs("#kpiDirecto").textContent = UI.fmtMoney(t.directo||0, project?.currency||"COP"));
  UI.qs("#kpiAdmin") && (UI.qs("#kpiAdmin").textContent = UI.fmtMoney(t.admin||0, project?.currency||"COP"));
  UI.qs("#kpiImprev") && (UI.qs("#kpiImprev").textContent = UI.fmtMoney(t.imprev||0, project?.currency||"COP"));
  UI.qs("#kpiUtil") && (UI.qs("#kpiUtil").textContent = UI.fmtMoney(t.util||0, project?.currency||"COP"));
  UI.qs("#kpiIvaUtil") && (UI.qs("#kpiIvaUtil").textContent = UI.fmtMoney(t.ivaUtil||0, project?.currency||"COP"));
  UI.qs("#kpiTotal") && (UI.qs("#kpiTotal").textContent = UI.fmtMoney(t.total||0, project?.currency||"COP"));

  const items = getProjectItemsByMode(project, mode) || [];
  UI.qs("#kpiItems") && (UI.qs("#kpiItems").textContent = String(items.length));

  const chapters = computeChapterRows(project, mode);
  UI.qs("#kpiChapters") && (UI.qs("#kpiChapters").textContent = String(chapters.length));
}

function renderResumenItems(project){
  const wrap = UI.qs("#itemsSummary");
  if(!wrap) return;

  const mode = getBudgetModeFromUI();
  const items = getProjectItemsByMode(project, mode) || [];
  const total = items.reduce((s,it)=> s + (Number(it.pu||0)*Number(it.qty||0)), 0);

  wrap.innerHTML = `
    <div class="mini-kpi"><small>Ítems</small><b>${items.length}</b></div>
    <div class="mini-kpi"><small>Parcial acumulado</small><b>${UI.fmtMoney(total, project?.currency||"COP")}</b></div>
    <div class="mini-kpi"><small>Modo</small><b>${UI.esc(budgetLabel(mode))}</b></div>
  `;
}

/* =========================
   Capítulos
   ========================= */
function renderProjectChaptersUI(project){
  const sel = UI.qs("#itemChapter");
  if(!sel) return;

  const mode = getBudgetModeFromUI();
  const caps = getAllChaptersForProject(project, mode);

  sel.innerHTML = `<option value="">-- Seleccione capítulo --</option>` +
    caps.map(c=> `<option value="${UI.esc(c.code)}">${UI.esc(c.code)} - ${UI.esc(c.name||"")}</option>`).join("");
}

function renderChaptersTable(project){
  const tbody = UI.qs("#chaptersBody");
  const empty = UI.qs("#chaptersEmpty");
  if(!tbody) return;

  const mode = getBudgetModeFromUI();
  const rows = computeChapterRows(project, mode);

  if(!rows.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  tbody.innerHTML = rows.map(r=> `
    <tr>
      <td><b>${UI.esc(r.code||"-")}</b></td>
      <td>${UI.esc(r.name||"-")}</td>
      <td style="text-align:right">${r.itemsCount}</td>
      <td style="text-align:right"><b>${UI.fmtMoney(r.subtotal||0, project?.currency||"COP")}</b></td>
    </tr>
  `).join("");
}

/* =========================
   Modal agregar APU
   ========================= */
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
  const caps = getAllChaptersForProject(project, mode);
  sel.innerHTML = `<option value="">-- Seleccione capítulo existente --</option>` +
    caps.map(c=> `<option value="${UI.esc(c.code)}" data-name="${UI.esc(c.name||"")}">${UI.esc(c.code)} - ${UI.esc(c.name||"")}</option>`).join("");

  sel.onchange = ()=>{
    const code = String(sel.value||"").trim();
    const opt = sel.options[sel.selectedIndex];
    const name = String(opt?.getAttribute("data-name") || "").trim();
    if(inpCode) inpCode.value = code;
    if(inpName) inpName.value = name;
  };
}

function bindAddApuModalEvents(){
  UI.qs("#btnCloseAddApu")?.addEventListener("click", closeAddApuModal);
  UI.qs("#btnCancelAddApu")?.addEventListener("click", closeAddApuModal);

  UI.qs("#formAddApu")?.addEventListener("submit", (e)=>{
    e.preventDefault();

    const projectId = __addApuModalState.projectId;
    const apu = __addApuModalState.apu;
    const project = StorageAPI.getProjectById(projectId);
    const mode = getBudgetModeFromUI();

    if(!project || !apu){
      alert("No se pudo completar la operación.");
      return;
    }

    const chapterCode = String(UI.qs("#addApuChapterCode")?.value || "").trim();
    let chapterName = String(UI.qs("#addApuChapterName")?.value || "").trim();
    const code = String(UI.qs("#addApuCode")?.value || apu.code || "").trim();
    const desc = String(UI.qs("#addApuDesc")?.value || apu.desc || "").trim();
    const unit = String(UI.qs("#addApuUnit")?.value || apu.unit || "").trim();
    const qty = Number(UI.qs("#addApuQty")?.value || 0);

    if(!code || !desc || !unit){
      alert("Complete la información del ítem.");
      return;
    }
    if(!(qty > 0)){
      alert("La cantidad debe ser mayor a 0.");
      return;
    }

    if(chapterCode && !chapterName){
      chapterName = lookupChapterName(project, chapterCode, mode) || "";
    }

    const itemData = {
      chapterCode,
      chapterName,
      code,
      apuRefCode: String(apu.code || code).trim(),
      desc,
      unit,
      pu: Number(apu.pu || 0),
      qty
    };

    if(mode === "oficial"){
      StorageAPI.addOfficialItem(project.id, itemData);
    }else{
      StorageAPI.addItem(project.id, itemData);
    }

    const fresh = StorageAPI.getProjectById(project.id);
    renderProjectDetail(fresh);
    renderChaptersTable(fresh);
    renderProjectChaptersUI(fresh);
    renderItemsTable(fresh);
    renderResumenItems(fresh);

    closeAddApuModal();
    alert(`Ítem agregado al ${budgetLabel(mode).toLowerCase()}. Puedes volver a agregar.`);
  });
}
/* Full file loaded from generated artifact */
  });
}

/* =========================
   Base APU
   ========================= */
function renderBaseMeta(){
  const metaEl = UI.qs("#baseMeta");
  if(!metaEl) return;

  try{
    const meta = (window.APUBase && typeof APUBase.getMeta === "function") ? APUBase.getMeta() : null;
    if(meta && (meta.items || meta.insumos || meta.cdLines || meta.subLines)){
      metaEl.innerHTML = `
        <div class="mini-kpi"><small>Ítems</small><b>${meta.items||0}</b></div>
        <div class="mini-kpi"><small>Costos Directos</small><b>${meta.cdLines||0}</b></div>
        <div class="mini-kpi"><small>Subproductos</small><b>${meta.subLines||0}</b></div>
        <div class="mini-kpi"><small>Insumos</small><b>${meta.insumos||0}</b></div>
      `;
    }else{
      metaEl.innerHTML = `<div class="muted">No hay base APU instalada.</div>`;
    }
  }catch(_){
    metaEl.innerHTML = `<div class="muted">No hay base APU instalada.</div>`;
  }
}

async function bindBaseImportPage(){
  renderBaseMeta();

  UI.qs("#fileBaseImport")?.addEventListener("change", async (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;

    try{
      if(!(window.APUBase && typeof APUBase.installFromFile === "function")){
        throw new Error("APUBase no está disponible.");
      }
      await APUBase.installFromFile(f);
      alert("Base APU instalada correctamente.");
      renderBaseMeta();
    }catch(err){
      alert("Error importando la base: " + (err?.message || err));
    }finally{
      e.target.value = "";
    }
  });

  UI.qs("#btnDeleteBase")?.addEventListener("click", async ()=>{
    if(!confirm("¿Eliminar la Base APU instalada?")) return;
    try{
      await APUBase.deleteBaseDatabase();
      alert("Base eliminada.");
      renderBaseMeta();
    }catch(err){
      alert("Error eliminando base: " + (err?.message || err));
    }
  });
}

/* =========================
   Presupuesto oficial
   ========================= */
function renderOfficialImportInfo(project){
  const info = UI.qs("#officialImportInfo");
  if(!info) return;

  const rows = project?.officialItems || [];
  const chapters = computeChapterRows(project, "oficial");
  const total = rows.reduce((s,it)=> s + Number(it.pu||0)*Number(it.qty||0), 0);

  info.innerHTML = `
    <div class="mini-kpi"><small>Capítulos</small><b>${chapters.length}</b></div>
    <div class="mini-kpi"><small>Ítems</small><b>${rows.length}</b></div>
    <div class="mini-kpi"><small>Parcial</small><b>${UI.fmtMoney(total, project?.currency||"COP")}</b></div>
  `;
}
/* =========================
   Comparativo / Auditoría
   ========================= */
function buildComparisonRows(project){
  const baseItems = project?.items || [];
  const officialItems = project?.officialItems || [];

  const baseMap = new Map();
  baseItems.forEach(it=>{
    const key = String(it.apuRefCode || it.code || "").trim();
    baseMap.set(key, it);
  });

  const offMap = new Map();
  officialItems.forEach(it=>{
    const key = String(it.apuRefCode || it.code || "").trim();
    offMap.set(key, it);
  });

  const allKeys = new Set([...baseMap.keys(), ...offMap.keys()]);
  const rows = [];

  allKeys.forEach(key=>{
    const b = baseMap.get(key);
    const o = offMap.get(key);

    const puBase = Number(b?.pu || 0);
    const puOff = Number(o?.pu || 0);
    const qtyBase = Number(b?.qty || 0);
    const qtyOff = Number(o?.qty || 0);
    const parcialBase = puBase * qtyBase;
    const parcialOff = puOff * qtyOff;

    rows.push({
      code: String(o?.code || b?.code || key || "").trim(),
      apuRefCode: key,
      desc: String(o?.desc || b?.desc || "").trim(),
      unit: String(o?.unit || b?.unit || "").trim(),
      puBase,
      puOff,
      diffPu: puOff - puBase,
      qtyBase,
      qtyOff,
      diffQty: qtyOff - qtyBase,
      parcialBase,
      parcialOff,
      diffParcial: parcialOff - parcialBase
    });
  });

  rows.sort((a,b)=> String(a.code).localeCompare(String(b.code), undefined, { numeric:true }));
  return rows;
}

function renderComparison(project){
  const tbody = UI.qs("#compareBody");
  const empty = UI.qs("#compareEmpty");
  const kpiWrap = UI.qs("#compareKpis");
  if(!tbody) return;

  const rows = buildComparisonRows(project);

  if(kpiWrap){
    const sumBase = rows.reduce((s,r)=> s + Number(r.parcialBase||0), 0);
    const sumOff = rows.reduce((s,r)=> s + Number(r.parcialOff||0), 0);
    const sumDiff = sumOff - sumBase;
    kpiWrap.innerHTML = `
      <div class="mini-kpi"><small>Total Base</small><b>${UI.fmtMoney(sumBase, project?.currency||"COP")}</b></div>
      <div class="mini-kpi"><small>Total Oficial</small><b>${UI.fmtMoney(sumOff, project?.currency||"COP")}</b></div>
      <div class="mini-kpi"><small>Diferencia</small><b>${UI.fmtMoney(sumDiff, project?.currency||"COP")}</b></div>
    `;
  }

  if(!rows.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  tbody.innerHTML = rows.map(r=> `
    <tr>
      <td>${UI.esc(r.code||"")}</td>
      <td>${UI.esc(r.desc||"")}</td>
      <td>${UI.esc(r.unit||"")}</td>
      <td style="text-align:right">${UI.fmtMoney(r.puBase||0, project?.currency||"COP")}</td>
      <td style="text-align:right">${UI.fmtMoney(r.puOff||0, project?.currency||"COP")}</td>
      <td style="text-align:right"><b>${UI.fmtMoney(r.diffPu||0, project?.currency||"COP")}</b></td>
      <td style="text-align:right">${UI.esc(String(r.qtyBase||0))}</td>
      <td style="text-align:right">${UI.esc(String(r.qtyOff||0))}</td>
      <td style="text-align:right"><b>${UI.esc(String(r.diffQty||0))}</b></td>
      <td style="text-align:right">${UI.fmtMoney(r.parcialBase||0, project?.currency||"COP")}</td>
      <td style="text-align:right">${UI.fmtMoney(r.parcialOff||0, project?.currency||"COP")}</td>
      <td style="text-align:right"><b>${UI.fmtMoney(r.diffParcial||0, project?.currency||"COP")}</b></td>
    </tr>
  `).join("");
}

function renderAudit(project){
  const wrap = UI.qs("#auditResults");
  if(!wrap) return;

  if(!(window.Audit && typeof Audit.runProjectAudit === "function")){
    wrap.innerHTML = `<div class="muted">El módulo Audit no está disponible.</div>`;
    return;
  }

  try{
    const result = Audit.runProjectAudit(project) || {};
    const alerts = Array.isArray(result.alerts) ? result.alerts : [];
    const score = Number(result.score || 0);

    if(!alerts.length){
      wrap.innerHTML = `
        <div class="mini-kpi"><small>Puntaje de riesgo</small><b>${score}</b></div>
        <div class="muted">No se detectaron alertas automáticas con la información actual.</div>
      `;
      return;
    }

    wrap.innerHTML = `
      <div class="mini-kpi"><small>Puntaje de riesgo</small><b>${score}</b></div>
      ${alerts.map(a=> `
        <article class="card" style="margin-top:10px">
          <h4 style="margin:0 0 6px 0">${UI.esc(a.title||"Alerta")}</h4>
          <div class="muted">${UI.esc(a.message||"")}</div>
        </article>
      `).join("")}
    `;
  }catch(err){
    wrap.innerHTML = `<div class="muted">Error generando auditoría: ${UI.esc(err?.message || String(err))}</div>`;
  }
}

/* =========================
   Documentos del proyecto
   ========================= */
async function renderDocs(projectId){
  const tbody = UI.qs("#docsBody");
  const empty = UI.qs("#docsEmpty");
  if(!tbody) return;

  let docs = [];
  try{
    docs = await DB.listFilesByOwner("project", projectId);
  }catch(_){
    docs = [];
  }

  if(!docs.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  tbody.innerHTML = docs.map(d=> `
    <tr>
      <td>${UI.esc(d.name||"")}</td>
      <td>${UI.esc(d.mime||"")}</td>
      <td style="text-align:right">${UI.esc(String(d.size||0))}</td>
      <td>${UI.esc((d.createdAt||"").slice(0,19).replace("T"," "))}</td>
      <td class="row" style="gap:8px">
        <button class="btn" type="button" data-open="${d.id}">Abrir</button>
        <button class="btn danger" type="button" data-del="${d.id}">Eliminar</button>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-open]").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const id = btn.getAttribute("data-open");
      const file = await DB.getFile(id).catch(()=>null);
      if(!file?.blob) return alert("No se pudo abrir el archivo.");
      const url = URL.createObjectURL(file.blob);
      window.open(url, "_blank");
      setTimeout(()=> URL.revokeObjectURL(url), 15000);
    });
  });

  tbody.querySelectorAll("[data-del]").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const id = btn.getAttribute("data-del");
      if(!confirm("¿Eliminar este documento?")) return;
      await DB.deleteFile(id).catch(()=>{});
      await renderDocs(projectId);
    });
  });
}

function bindDocs(projectId){
  UI.qs("#fileDoc")?.addEventListener("change", async (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;

    try{
      await DB.putFile({
        ownerType: "project",
        ownerId: projectId,
        kind: "doc_project",
        name: f.name,
        mime: f.type || "application/octet-stream",
        size: f.size || 0,
        blob: f
      });
      await renderDocs(projectId);
    }catch(err){
      alert("Error guardando documento: " + (err?.message || err));
    }finally{
      e.target.value = "";
    }
  });
}

/* =========================
   Ajustes
   ========================= */
function renderAjustes(project){
  UI.qs("#setAdminPct") && (UI.qs("#setAdminPct").value = String(project?.adminPct ?? project?.aiuPct ?? 0));
  UI.qs("#setImprevPct") && (UI.qs("#setImprevPct").value = String(project?.imprevPct ?? 0));
  UI.qs("#setUtilPct") && (UI.qs("#setUtilPct").value = String(project?.utilPct ?? 0));
  UI.qs("#setIvaUtilPct") && (UI.qs("#setIvaUtilPct").value = String(project?.ivaUtilPct ?? project?.ivaPct ?? 0));

  UI.qs("#btnSaveSettings")?.addEventListener("click", ()=>{
    StorageAPI.updateProject(project.id, {
      adminPct: Number(UI.qs("#setAdminPct")?.value || 0),
      imprevPct: Number(UI.qs("#setImprevPct")?.value || 0),
      utilPct: Number(UI.qs("#setUtilPct")?.value || 0),
      ivaUtilPct: Number(UI.qs("#setIvaUtilPct")?.value || 0)
    });

    const fresh = StorageAPI.getProjectById(project.id);
    renderProjectDetail(fresh);
    renderResumenItems(fresh);
    alert("Ajustes guardados.");
  });
}

/* =========================
   Exportaciones PDF / Excel
   ========================= */
function bindProjectExports(projectId){
  const btnPdfBudget = UI.qs("#btnPdfBudget");
  const btnPdfBudgetApu = UI.qs("#btnPdfBudgetApu");
  const btnPdfDesag = UI.qs("#btnPdfDesagregado");
  const btnPdfResumen = UI.qs("#btnPdfResumenDesag");
  const btnPdfDistribucion = UI.qs("#btnPdfDistribucion");
  const btnPdfRendimiento = UI.qs("#btnPdfRendimiento");
  const btnPdfMateriales = UI.qs("#btnPdfMateriales");
  const btnPdfRecursos = UI.qs("#btnPdfRecursos");
  const btnXlsxCompare = UI.qs("#btnExportCompareXlsx");
  const btnXlsxOfficial = UI.qs("#btnExportOfficialXlsx");

  btnPdfBudget?.addEventListener("click", async ()=>{
    try{
      if(!(window.AppPDF && typeof AppPDF.exportBudgetPdf === "function")){
        throw new Error("AppPDF.exportBudgetPdf no está disponible.");
      }
      await AppPDF.exportBudgetPdf(projectId);
    }catch(err){
      alert("Error generando PDF Presupuesto: " + (err?.message || err));
    }
  });

  btnPdfBudgetApu?.addEventListener("click", async ()=>{
    try{
      if(!(window.AppPDF && typeof AppPDF.exportBudgetWithApusPdf === "function")){
        throw new Error("AppPDF.exportBudgetWithApusPdf no está disponible.");
      }
      await AppPDF.exportBudgetWithApusPdf(projectId);
    }catch(err){
      alert("Error generando PDF Presupuesto + APUs: " + (err?.message || err));
    }
  });

  btnPdfDesag?.addEventListener("click", async ()=>{
    try{
      if(!(window.AppPDF && typeof AppPDF.exportBudgetDesagregadoPdf === "function")){
        throw new Error("AppPDF.exportBudgetDesagregadoPdf no está disponible.");
      }
      await AppPDF.exportBudgetDesagregadoPdf(projectId);
    }catch(err){
      alert("Error generando PDF Presupuesto de Obra Desagregado: " + (err?.message || err));
    }
  });

  btnPdfResumen?.addEventListener("click", async ()=>{
    try{
      if(!(window.AppPDF && typeof AppPDF.exportResumenDesagregadoPdf === "function")){
        throw new Error("AppPDF.exportResumenDesagregadoPdf no está disponible.");
      }
      await AppPDF.exportResumenDesagregadoPdf(projectId);
    }catch(err){
      alert("Error generando Resumen Presupuesto de Obra Desagregado: " + (err?.message || err));
    }
  });

  btnPdfDistribucion?.addEventListener("click", async ()=>{
    try{
      if(!(window.AppPDF && typeof AppPDF.exportDistribucionCostosPdf === "function")){
        throw new Error("AppPDF.exportDistribucionCostosPdf no está disponible.");
      }
      await AppPDF.exportDistribucionCostosPdf(projectId);
    }catch(err){
      alert("Error generando Distribución porcentual de Costos Directos: " + (err?.message || err));
    }
  });

  btnPdfRendimiento?.addEventListener("click", async ()=>{
    try{
      if(!(window.AppPDF && typeof AppPDF.exportRendimientoPdf === "function")){
        throw new Error("AppPDF.exportRendimientoPdf no está disponible.");
      }
      await AppPDF.exportRendimientoPdf(projectId);
    }catch(err){
      alert("Error generando Rendimiento de Equipo y Mano de Obra: " + (err?.message || err));
    }
  });

  btnPdfMateriales?.addEventListener("click", async ()=>{
    try{
      if(!(window.AppPDF && typeof AppPDF.exportResumenMaterialesPdf === "function")){
        throw new Error("AppPDF.exportResumenMaterialesPdf no está disponible.");
      }
      await AppPDF.exportResumenMaterialesPdf(projectId);
    }catch(err){
      alert("Error generando Resumen materiales por actividad: " + (err?.message || err));
    }
  });

  btnPdfRecursos?.addEventListener("click", async ()=>{
    try{
      if(!(window.AppPDF && typeof AppPDF.exportRecursosPdf === "function")){
        throw new Error("AppPDF.exportRecursosPdf no está disponible.");
      }
      await AppPDF.exportRecursosPdf(projectId);
    }catch(err){
      alert("Error generando Cantidad de Recursos e Insumos del Presupuesto: " + (err?.message || err));
    }
  });

  btnXlsxCompare?.addEventListener("click", async ()=>{
    try{
      if(!(window.ExcelExport && typeof ExcelExport.exportComparativo === "function")){
        throw new Error("ExcelExport.exportComparativo no está disponible.");
      }
      await ExcelExport.exportComparativo(projectId);
    }catch(err){
      alert("Error exportando comparativo Excel: " + (err?.message || err));
    }
  });

  btnXlsxOfficial?.addEventListener("click", async ()=>{
    try{
      if(!(window.ExcelExport && typeof ExcelExport.exportPresupuestoOficial === "function")){
        throw new Error("ExcelExport.exportPresupuestoOficial no está disponible.");
      }
      await ExcelExport.exportPresupuestoOficial(projectId);
    }catch(err){
      alert("Error exportando presupuesto oficial Excel: " + (err?.message || err));
    }
  });
}

/* =========================
   Proyecto detalle / base / oficial
   ========================= */
async function bindProjectDetailPage(){
  const projectId = String(UI.getParam("projectId") || "").trim();
  if(!projectId){
    alert("No se encontró projectId.");
    location.href = "proyectos.html";
    return;
  }

  const project = getProjectCompat(projectId);
  if(!project){
    alert("Proyecto no encontrado.");
    location.href = "proyectos.html";
    return;
  }

  UI.qs("#btnBackProjects")?.addEventListener("click", ()=>{
    location.href = "proyectos.html";
  });

  bindProjectExports(projectId);
  bindDocs(projectId);
  bindOfficialImport(projectId);

  UI.qs("#btnOpenAuditoria")?.addEventListener("click", ()=>{
    location.href = `auditoria.html?projectId=${encodeURIComponent(projectId)}`;
  });

  UI.qs("#btnOpenCompare")?.addEventListener("click", ()=>{
    location.href = `comparativo.html?projectId=${encodeURIComponent(projectId)}`;
  });

  UI.qs("#btnOpenBasePage")?.addEventListener("click", ()=>{
    location.href = `presupuesto-base.html?projectId=${encodeURIComponent(projectId)}`;
  });

  UI.qs("#btnOpenOfficialPage")?.addEventListener("click", ()=>{
    location.href = `presupuesto-oficial.html?projectId=${encodeURIComponent(projectId)}`;
  });

  UI.qs("#formAddItem")?.addEventListener("submit", (e)=>{
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
  renderOfficialImportInfo(project);
  renderComparison(project);
  renderAudit(project);
  await renderDocs(projectId);

  if(page() === "presupuesto-base.html"){
    bindBaseImportPage();
  }
}

/* =========================
   Página APU — FIX VER APU
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