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
  try{
    if(!navigator.storage || !navigator.storage.persist) return false;
    const already = await navigator.storage.persisted?.();
    if(already) return true;
    if(__persistTried) return false;
    __persistTried = true;
    return await navigator.storage.persist();
  }catch(_){
    return false;
  }
}

async function maybeWarnVolatileStorage(){
  try{
    if(__storageWarned) return;
    __storageWarned = true;

    const inApp = isInAppBrowser();
    const writable = localStorageWritable();
    let persisted = false;

    try{
      persisted = !!(await navigator.storage?.persisted?.());
    }catch(_){}

    if(!writable){
      alert("⚠️ Este navegador no permite guardar datos localmente. Abre la app en Chrome/Safari normal.");
      return;
    }

    if(isIOS() || inApp || !persisted){
      console.log("[storage] modo posiblemente volátil", { ios:isIOS(), inApp, persisted });
    }
  }catch(_){}
}

/* ==========================================
   UI Helpers
   ========================================== */
const UI = {
  qs:(s,p=document)=>p.querySelector(s),
  qsa:(s,p=document)=>Array.from(p.querySelectorAll(s)),
  money(n){
    return new Intl.NumberFormat("es-CO", { style:"currency", currency:"COP", maximumFractionDigits:0 }).format(Number(n||0));
  },
  fmtMoney(n, currency="COP"){
    return new Intl.NumberFormat("es-CO", { style:"currency", currency, maximumFractionDigits:0 }).format(Number(n||0));
  },
  n(n){
    return new Intl.NumberFormat("es-CO").format(Number(n||0));
  },
  esc(s){
    return String(s ?? "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
  },
  uid(prefix="id"){
    return `${prefix}_${Math.random().toString(36).slice(2,9)}`;
  },
  today(){
    const d=new Date(), z=n=>String(n).padStart(2,"0");
    return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`;
  },
  getParam(name){
    return new URLSearchParams(location.search).get(name);
  },
  setHTML(el, html){
    if(el) el.innerHTML = html;
  },
  toast(msg){
    try{ alert(msg); }catch(_){ console.log(msg); }
  }
};

/* ==========================================
   Compat helpers
   ========================================== */
function normalizeCode(x){
  return String(x ?? "")
    .trim()
    .replace(/\s+/g," ")
    .replace(/_/g,".")
    .replace(/,/g,".")
    .replace(/\.+/g,".")
    .replace(/^\./,"")
    .replace(/\.$/,"");
}
function normKey(x){
  return normalizeCode(x).toLowerCase();
}

/* ==========================================
   Storage helpers (fallback defensivo)
   ========================================== */
const StorageAPI = window.StorageAPI || {
  getProjects(){
    try{ return JSON.parse(localStorage.getItem("ppro_projects") || "[]"); }catch(_){ return []; }
  },
  saveProjects(arr){
    localStorage.setItem("ppro_projects", JSON.stringify(arr||[]));
  },
  getProjectById(id){
    return this.getProjects().find(x=>String(x.id)===String(id)) || null;
  },
  createProject(data){
    const arr = this.getProjects();
    const row = {
      id: UI.uid("prj"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currency: "COP",
      municipality: "",
      department: "",
      contractor: "",
      interventor: "",
      contractNo: "",
      object: "",
      aiuPct: 0,
      adminPct: 0,
      imprevPct: 0,
      utilPct: 0,
      ivaPct: 0,
      ivaUtilPct: 0,
      ...data,
      chapters: Array.isArray(data?.chapters) ? data.chapters : [],
      items: Array.isArray(data?.items) ? data.items : []
    };
    arr.unshift(row);
    this.saveProjects(arr);
    return row;
  },
  updateProject(id, patch){
    const arr = this.getProjects();
    const i = arr.findIndex(x=>String(x.id)===String(id));
    if(i<0) return null;
    arr[i] = { ...arr[i], ...patch, updatedAt:new Date().toISOString() };
    this.saveProjects(arr);
    return arr[i];
  },
  deleteProject(id){
    const arr = this.getProjects().filter(x=>String(x.id)!==String(id));
    this.saveProjects(arr);
  },
  addChapter(projectId, chapter){
    const p = this.getProjectById(projectId); if(!p) return null;
    const chapters = Array.isArray(p.chapters) ? p.chapters.slice() : [];
    chapters.push({
      id: UI.uid("cap"),
      chapterCode: String(chapter.chapterCode||"").trim(),
      chapterName: String(chapter.chapterName||"").trim()
    });
    return this.updateProject(projectId, { chapters });
  },
  addItem(projectId, item){
    const p = this.getProjectById(projectId); if(!p) return null;
    const items = Array.isArray(p.items) ? p.items.slice() : [];
    items.push({
      id: UI.uid("it"),
      chapterCode: String(item.chapterCode||"").trim(),
      chapterName: String(item.chapterName||"").trim(),
      code: String(item.code||"").trim(),
      apuRefCode: String(item.apuRefCode || item.code || "").trim(),
      desc: String(item.desc||"").trim(),
      unit: String(item.unit||"").trim(),
      pu: Number(item.pu||0),
      qty: Number(item.qty||0)
    });
    return this.updateProject(projectId, { items });
  },
  updateItem(projectId, itemId, patch){
    const p = this.getProjectById(projectId); if(!p) return null;
    const items = (p.items||[]).map(it => String(it.id)===String(itemId) ? { ...it, ...patch } : it);
    return this.updateProject(projectId, { items });
  },
  deleteItem(projectId, itemId){
    const p = this.getProjectById(projectId); if(!p) return null;
    const items = (p.items||[]).filter(it => String(it.id)!==String(itemId));
    return this.updateProject(projectId, { items });
  },
  getBaseMeta(){
    try{ return JSON.parse(localStorage.getItem("ppro_base_meta") || "null"); }catch(_){ return null; }
  },
  setBaseMeta(meta){
    localStorage.setItem("ppro_base_meta", JSON.stringify(meta||null));
  },
  exportBackup(){
    const data = {
      projects: this.getProjects(),
      baseMeta: this.getBaseMeta(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `backup_presupuesto_pro_${UI.today()}.json`;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href), 1500);
  },
  async importBackupFromFile(file){
    const text = await file.text();
    const json = JSON.parse(text);
    if(Array.isArray(json.projects)) this.saveProjects(json.projects);
    if(json.baseMeta) this.setBaseMeta(json.baseMeta);
    return true;
  },
  _ovKey(projectId, code){
    return `ppro_apu_override__${projectId}__${normKey(code)}`;
  },
  getApuOverride(projectId, code){
    try{
      return JSON.parse(localStorage.getItem(this._ovKey(projectId, code)) || "null");
    }catch(_){
      return null;
    }
  },
  setApuOverride(projectId, code, lines){
    const payload = {
      code: String(code||"").trim(),
      lines: Array.isArray(lines) ? lines : [],
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(this._ovKey(projectId, code), JSON.stringify(payload));
    return payload;
  },
  clearApuOverride(projectId, code){
    localStorage.removeItem(this._ovKey(projectId, code));
  },
  _customAPUKey(){
    return "ppro_custom_apus";
  },
  getCustomAPUs(){
    try{
      return JSON.parse(localStorage.getItem(this._customAPUKey()) || "[]");
    }catch(_){
      return [];
    }
  },
  saveCustomAPUs(arr){
    localStorage.setItem(this._customAPUKey(), JSON.stringify(arr||[]));
  },
  getCustomAPU(code){
    const k = normKey(code);
    return this.getCustomAPUs().find(x => normKey(x.code)===k) || null;
  },
  upsertCustomAPU(apu){
    const arr = this.getCustomAPUs();
    const k = normKey(apu.code);
    const idx = arr.findIndex(x => normKey(x.code)===k);
    const row = {
      code: String(apu.code||"").trim(),
      desc: String(apu.desc||"").trim(),
      unit: String(apu.unit||"").trim(),
      chapterCode: String(apu.chapterCode||"").trim(),
      chapterName: String(apu.chapterName||"").trim(),
      lines: Array.isArray(apu.lines) ? apu.lines : [],
      updatedAt: new Date().toISOString()
    };
    if(idx>=0) arr[idx]=row; else arr.unshift(row);
    this.saveCustomAPUs(arr);
    return row;
  }
};

window.StorageAPI = StorageAPI;

/* ==========================================
   DB helpers (archivos)
   ========================================== */
const DB = window.DB || {
  async putFile(fileRow){
    const key = "ppro_files";
    const arr = JSON.parse(localStorage.getItem(key) || "[]");
    arr.push({ id:UI.uid("file"), ...fileRow, createdAt:new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(arr));
  },
  async getFilesByOwner(ownerType, ownerId){
    const arr = JSON.parse(localStorage.getItem("ppro_files") || "[]");
    return arr.filter(x => x.ownerType===ownerType && String(x.ownerId)===String(ownerId));
  },
  async clearByOwner(ownerType, ownerId){
    const arr = JSON.parse(localStorage.getItem("ppro_files") || "[]");
    const left = arr.filter(x => !(x.ownerType===ownerType && String(x.ownerId)===String(ownerId)));
    localStorage.setItem("ppro_files", JSON.stringify(left));
  }
};
window.DB = DB;

/* ==========================================
   Calc helpers
   ========================================== */
const Calc = window.Calc || {
  calcTotals(project){
    const directo = (project.items||[]).reduce((s,it)=> s + Number(it.pu||0)*Number(it.qty||0), 0);
    const adminPct = Number(project.adminPct ?? project.aiuPct ?? 0);
    const imprevPct = Number(project.imprevPct ?? 0);
    const utilPct = Number(project.utilPct ?? 0);
    const ivaUtilPct = Number(project.ivaUtilPct ?? project.ivaPct ?? 0);

    const admin = directo * adminPct/100;
    const imprev = directo * imprevPct/100;
    const util = directo * utilPct/100;
    const subtotal = directo + admin + imprev + util;
    const ivaUtil = util * ivaUtilPct/100;
    const total = subtotal + ivaUtil;

    return { directo, admin, imprev, util, subtotal, ivaUtil, total };
  },
  groupByChapters(project){
    const items = Array.isArray(project?.items) ? project.items.slice() : [];
    const map = new Map();

    for(const it of items){
      const chapterCode = String(it.chapterCode || (String(it.code||"").split(".")[0]||"")).trim();
      const chapterName = String(it.chapterName || "").trim();
      const key = `${chapterCode}__${chapterName}`;
      if(!map.has(key)){
        map.set(key, { chapterCode, chapterName, items:[] });
      }
      map.get(key).items.push(it);
    }

    const chapters = Array.from(map.values()).map(ch=>{
      ch.subtotal = ch.items.reduce((s,it)=> s + Number(it.pu||0)*Number(it.qty||0), 0);
      ch.itemsCount = ch.items.length;
      return ch;
    });

    return { chapters, items };
  }
};
window.Calc = Calc;

/* ==========================================
   APU Base facade
   ========================================== */
const APUBase = window.APUBase || {
  async installFromFile(file){
    const data = { name:file?.name||"", installedAt:new Date().toISOString(), items:0, cdLines:0, insumos:0, subLines:0 };
    localStorage.setItem("ppro_base_installed", "1");
    StorageAPI.setBaseMeta(data);
    return data;
  },
  getMeta(){
    return StorageAPI.getBaseMeta();
  },
  async search(q, limit=30){
    const arr = JSON.parse(localStorage.getItem("ppro_base_search") || "[]");
    const nq = String(q||"").toLowerCase().trim();
    return arr.filter(x =>
      String(x.code||"").toLowerCase().includes(nq) ||
      String(x.desc||"").toLowerCase().includes(nq)
    ).slice(0, limit);
  },
  async getAPU(code){
    const arr = JSON.parse(localStorage.getItem("ppro_base_apus") || "[]");
    return arr.find(x => normKey(x.code)===normKey(code)) || null;
  },
  async getSubAPU(code){
    const arr = JSON.parse(localStorage.getItem("ppro_base_subapus") || "[]");
    return arr.find(x => normKey(x.code)===normKey(code)) || null;
  }
};
window.APUBase = APUBase;

/* ==========================================
   PDF facade (si existe)
   ========================================== */
const PDFAPI = window.PDFAPI || window.PDF || window.pdfAPI || null;

/* ==========================================
   DOM helpers
   ========================================== */
function setKpi(id, value){
  const el = UI.qs(id);
  if(el) el.textContent = value;
}

function downloadBlob(blob, filename){
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename || "archivo";
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 1500);
}

function downloadText(text, filename, type="text/plain;charset=utf-8"){
  const blob = new Blob([text], { type });
  downloadBlob(blob, filename);
}

function showBaseStatus(){
  const meta = APUBase.getMeta?.();
  const el = UI.qs("#baseStatus");
  if(!el) return;
  if(!meta){
    el.innerHTML = `<span class="pill warn">Base APU no instalada</span>`;
    return;
  }
  el.innerHTML = `
    <span class="pill ok">Base instalada</span>
    <span class="muted small">Items: ${UI.n(meta.items||0)} · CD: ${UI.n(meta.cdLines||0)} · Sub: ${UI.n(meta.subLines||0)} · Insumos: ${UI.n(meta.insumos||0)}</span>
  `;
}

function renderProjectsList(){
  const tbody = UI.qs("#projectsBody");
  const empty = UI.qs("#projectsEmpty");
  if(!tbody) return;

  const rows = StorageAPI.getProjects();
  if(!rows.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    setKpi("#kpiProjects", "0");
    setKpi("#kpiTotal", UI.money(0));
    return;
  }
  if(empty) empty.style.display = "none";

  tbody.innerHTML = rows.map(p=>{
    const t = totalsCompat(p);
    return `
      <tr>
        <td><b>${UI.esc(p.name||"Sin nombre")}</b></td>
        <td>${UI.esc(p.contractNo||"-")}</td>
        <td>${UI.esc(p.municipality||"-")}</td>
        <td style="text-align:right"><b>${UI.fmtMoney(t.total||0, p.currency||"COP")}</b></td>
        <td class="row" style="gap:8px">
          <a class="btn" href="proyecto-detalle.html?projectId=${encodeURIComponent(p.id)}">Abrir</a>
          <button class="btn" type="button" data-export="${p.id}">Exportar</button>
          <button class="btn danger" type="button" data-del="${p.id}">Eliminar</button>
        </td>
      </tr>
    `;
  }).join("");

  setKpi("#kpiProjects", UI.n(rows.length));
  setKpi("#kpiTotal", UI.money(rows.reduce((s,p)=> s + Number(totalsCompat(p).total||0), 0)));

  tbody.querySelectorAll("[data-del]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-del");
      if(!confirm("¿Eliminar proyecto?")) return;
      StorageAPI.deleteProject(id);
      renderProjectsList();
    });
  });

  tbody.querySelectorAll("[data-export]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-export");
      const p = StorageAPI.getProjectById(id);
      if(!p) return;
      const blob = new Blob([JSON.stringify(p,null,2)], {type:"application/json"});
      downloadBlob(blob, `proyecto_${sanitizeFileName(p.name||id)}.json`);
    });
  });
}

function bindProjectsPage(){
  maybeWarnVolatileStorage().catch(()=>{});
  showBaseStatus();
  renderProjectsList();

  UI.qs("#btnExportBackup")?.addEventListener("click", ()=>StorageAPI.exportBackup());

  UI.qs("#fileImportBackup")?.addEventListener("change", async (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;
    try{
      await StorageAPI.importBackupFromFile(f);
      alert("Backup importado.");
      renderProjectsList();
      showBaseStatus();
    }catch(err){
      alert("No se pudo importar el backup: " + (err?.message || err));
    }finally{
      e.target.value = "";
    }
  });

  UI.qs("#fileBaseXlsx")?.addEventListener("change", async (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;
    try{
      await APUBase.installFromFile(f);
      showBaseStatus();
      alert("Base XLSX instalada correctamente.");
    }catch(err){
      alert("Error instalando base XLSX: " + (err?.message || err));
    }finally{
      e.target.value = "";
    }
  });

  UI.qs("#formProject")?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const p = StorageAPI.createProject({
      name: String(fd.get("name")||"").trim(),
      contractNo: String(fd.get("contractNo")||"").trim(),
      object: String(fd.get("object")||"").trim(),
      municipality: String(fd.get("municipality")||"").trim(),
      department: String(fd.get("department")||"").trim(),
      contractor: String(fd.get("contractor")||"").trim(),
      interventor: String(fd.get("interventor")||"").trim(),
      adminPct: Number(fd.get("adminPct")||0),
      imprevPct: Number(fd.get("imprevPct")||0),
      utilPct: Number(fd.get("utilPct")||0),
      ivaUtilPct: Number(fd.get("ivaUtilPct")||0)
    });
    alert("Proyecto creado.");
    e.target.reset();
    renderProjectsList();
    location.href = `proyecto-detalle.html?projectId=${encodeURIComponent(p.id)}`;
  });
}

/* ==========================================
   ✅ Helpers: capítulos, búsqueda y resolución robusta APU
   ========================================== */
function lookupChapterName(project, chapterCode){
  const code = String(chapterCode || "").trim();
  if(!code) return "";

  const chapters = Array.isArray(project?.chapters) ? project.chapters : [];
  const hit = chapters.find(c => String(c.chapterCode||"").trim() === code);
  if(hit?.chapterName) return String(hit.chapterName).trim();

  const fromItems = (project?.items||[]).find(it => String(it.chapterCode||"").trim() === code && String(it.chapterName||"").trim());
  return String(fromItems?.chapterName||"").trim();
}

function getAllChaptersForProject(project){
  const map = new Map();

  (project?.chapters||[]).forEach(c=>{
    const code = String(c.chapterCode||"").trim();
    const name = String(c.chapterName||"").trim();
    if(code) map.set(code, { chapterCode: code, chapterName: name });
  });

  (project?.items||[]).forEach(it=>{
    const code = String(it.chapterCode||"").trim() || (String(it.code||"").includes(".") ? String(it.code).split(".")[0] : "");
    const name = String(it.chapterName||"").trim() || lookupChapterName(project, code);
    if(code && !map.has(code)) map.set(code, { chapterCode: code, chapterName: name });
  });

  return Array.from(map.values()).sort((a,b)=> String(a.chapterCode).localeCompare(String(b.chapterCode), "es", {numeric:true}));
}

function getItemByAnyLookup(project, rawCode){
  const code = String(rawCode||"").trim();
  if(!project || !code) return null;

  const items = Array.isArray(project.items) ? project.items : [];

  let hit = items.find(it => String(it.code||"").trim() === code);
  if(hit) return hit;

  hit = items.find(it => String(it.apuRefCode||"").trim() === code);
  if(hit) return hit;

  const nk = normKey(code);

  hit = items.find(it => normKey(it.code) === nk);
  if(hit) return hit;

  hit = items.find(it => normKey(it.apuRefCode) === nk);
  if(hit) return hit;

  return null;
}

async function tryResolveAPUFromProjectItem(projectId, requestedCode){
  const project = StorageAPI.getProjectById(projectId);
  const item = getItemByAnyLookup(project, requestedCode);

  const visibleCode = String(item?.code || requestedCode || "").trim();
  const refCode = String(item?.apuRefCode || item?.code || requestedCode || "").trim();

  const overrideVisible = projectId ? StorageAPI.getApuOverride(projectId, visibleCode) : null;
  if(overrideVisible?.lines?.length){
    return {
      project,
      item,
      visibleCode,
      refCode,
      resolvedCode: visibleCode,
      source: "override",
      data: overrideVisible
    };
  }

  const overrideRef = (refCode && refCode !== visibleCode && projectId) ? StorageAPI.getApuOverride(projectId, refCode) : null;
  if(overrideRef?.lines?.length){
    return {
      project,
      item,
      visibleCode,
      refCode,
      resolvedCode: refCode,
      source: "override",
      data: overrideRef
    };
  }

  const customVisible = StorageAPI.getCustomAPU(visibleCode);
  if(customVisible){
    return {
      project,
      item,
      visibleCode,
      refCode,
      resolvedCode: visibleCode,
      source: "custom",
      data: customVisible
    };
  }
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

    // ✅ FIX:
    // "Ver APU" debe enviar primero el código visible del ítem del proyecto.
    // La resolución robusta del APU real se hace luego en bindAPUPage()
    // usando code visible + apuRefCode.
    const apuCode = String(it.code || it.apuRefCode || "").trim();

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
    loadRows(String(inpSearch?.value || ""));
  });

  inpSearch?.addEventListener("keydown", (e)=>{
    if(e.key === "Enter"){
      e.preventDefault();
      loadRows(String(inpSearch?.value || ""));
    }
  });
}

/* ---------- IMPORTAR ITEMS DESDE BASE ---------- */
function bindImportFromBase(projectId){
  UI.qs("#btnApuSearch")?.addEventListener("click", async ()=>{
    try{
      const q = String(UI.qs("#apuSearch")?.value || "").trim();
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
    renderProjectDetail(updated);
    renderChaptersTable(updated);
    renderItemsTable(updated);
    renderResumenItems(updated);
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
  let apuCode = "";
  let displayCode = "";

  if(codeParam){
    const requestedCode = String(codeParam||"").trim();

    if(projectId){
      const resolved = await tryResolveAPUFromProjectItem(projectId, requestedCode);
      const item = resolved?.item || null;

      displayCode = String(item?.code || resolved?.visibleCode || requestedCode || "").trim();
      apuCode = String(resolved?.resolvedCode || resolved?.refCode || resolved?.visibleCode || requestedCode || "").trim();

      if(resolved?.source === "override" && resolved?.data){
        const ov = resolved.data;
        const title =
          (displayCode && apuCode && displayCode !== apuCode)
            ? `APU ${displayCode} (Ref: ${apuCode})`
            : `APU ${displayCode || apuCode}`;

        apu = {
          title,
          subtitle: item?.desc || "(Override del proyecto)",
          header: `${displayCode || apuCode} — ${item?.desc || "Override del proyecto"}`,
          metaLine: `Fuente: Override del proyecto · Actualizado: ${(ov.updatedAt||"").slice(0,19).replace("T"," ")}`,
          unit: item?.unit || "",
          directo: computeDirecto(ov.lines),
          lines: (ov.lines||[]).map(x=>({ ...x, subRef:"" }))
        };
      }

      if(!apu && resolved?.source === "custom" && resolved?.data){
        const custom = resolved.data;
        const directo = (custom.lines||[]).reduce((s,l)=> s + Number(l.parcial||0), 0);
        const title =
          (displayCode && apuCode && displayCode !== apuCode)
            ? `APU ${displayCode} (Ref: ${apuCode})`
            : `APU ${displayCode || custom.code || apuCode}`;

        apu = {
          title,
          subtitle: item?.desc || custom.desc || "",
          header: `${displayCode || custom.code || apuCode} — ${item?.desc || custom.desc || ""}`,
          metaLine: `APU creado en la app · Capítulo ${custom.chapterCode||"-"} ${custom.chapterName||""}`,
          unit: item?.unit || custom.unit || "",
          directo,
          lines: (custom.lines||[]).map(l=>({
            group:l.tipo||l.group||"-",
            desc:l.desc,
            unit:l.unit,
            qty:l.qty,
            pu:l.pu,
            parcial:l.parcial,
            subRef:""
          }))
        };
      }

      if(!apu && resolved?.source === "base" && resolved?.data){
        apu = { ...resolved.data };

        const finalTitle =
          (displayCode && apuCode && displayCode !== apuCode)
            ? `APU ${displayCode} (Ref: ${apuCode})`
            : `APU ${displayCode || apuCode}`;

        apu.title = finalTitle;

        if(item?.desc){
          apu.subtitle = item.desc;
          apu.header = `${displayCode || apuCode} — ${item.desc}`;
        }else if(displayCode && apuCode && displayCode !== apuCode){
          apu.header = `${displayCode} — ${apu.header || ""}`;
        }
      }

      if(!apu){
        const proj = StorageAPI.getProjectById(projectId);
        const hit = getItemByAnyLookup(proj, requestedCode);
        displayCode = String(hit?.code || requestedCode || "").trim();
        apuCode = String(hit?.apuRefCode || hit?.code || requestedCode || "").trim();

        const ov = StorageAPI.getApuOverride(projectId, apuCode);
        if(ov && Array.isArray(ov.lines) && ov.lines.length){
          const title =
            (displayCode && displayCode !== apuCode)
              ? `APU ${displayCode} (Ref: ${apuCode})`
              : `APU ${displayCode || apuCode}`;

          apu = {
            title,
            subtitle: hit?.desc || "(Override del proyecto)",
            header: `${displayCode || apuCode} — ${hit?.desc || "Override del proyecto"}`,
            metaLine: `Fuente: Override del proyecto · Actualizado: ${(ov.updatedAt||"").slice(0,19).replace("T"," ")}`,
            unit: hit?.unit || "",
            directo: computeDirecto(ov.lines),
            lines: ov.lines.map(x=>({ ...x, subRef:"" }))
          };
        }

        if(!apu){
          const custom = StorageAPI.getCustomAPU(apuCode);
          if(custom){
            const directo = (custom.lines||[]).reduce((s,l)=> s + Number(l.parcial||0), 0);
            apu = {
              title: `APU ${displayCode || custom.code || apuCode}`,
              subtitle: hit?.desc || custom.desc || "",
              header: `${displayCode || custom.code || apuCode} — ${hit?.desc || custom.desc || ""}`,
              metaLine: `APU creado en la app · Capítulo ${custom.chapterCode||"-"} ${custom.chapterName||""}`,
              unit: hit?.unit || custom.unit || "",
              directo,
              lines: (custom.lines||[]).map(l=>({
                group:l.tipo||l.group||"-",
                desc:l.desc,
                unit:l.unit,
                qty:l.qty,
                pu:l.pu,
                parcial:l.parcial,
                subRef:""
              }))
            };
          }else{
            apu = await APUBase.getAPU(apuCode);
            if(apu){
              apu = { ...apu };
              apu.title = `APU ${displayCode || apuCode}`;
              if(hit?.desc){
                apu.subtitle = hit.desc;
                apu.header = `${displayCode || apuCode} — ${hit.desc}`;
              }
            }
          }
        }
      }
    }else{
      apuCode = String(codeParam||"").trim();
      displayCode = apuCode;

      const custom = StorageAPI.getCustomAPU(apuCode);
      if(custom){
        const directo = (custom.lines||[]).reduce((s,l)=> s + Number(l.parcial||0), 0);
        apu = {
          title: `APU ${custom.code}`,
          subtitle: custom.desc || "",
          header: `${custom.code} — ${custom.desc||""}`,
          metaLine: `APU creado en la app · Capítulo ${custom.chapterCode||"-"} ${custom.chapterName||""}`,
          unit: custom.unit || "",
          directo,
          lines: (custom.lines||[]).map(l=>({
            group:l.tipo||l.group||"-",
            desc:l.desc,
            unit:l.unit,
            qty:l.qty,
            pu:l.pu,
            parcial:l.parcial,
            subRef:""
          }))
        };
      }else{
        apu = await APUBase.getAPU(apuCode);
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
    </div>
    <div class="grid two">
      <div class="item"><div class="name">Unidad</div><div class="muted small">${UI.esc(apu.unit||"-")}</div></div>
      <div class="item"><div class="name">Costo directo</div><div class="muted small"><b>${UI.fmtMoney(apu.directo||0,"COP")}</b></div></div>
    </div>
  `);

  if(sub && !apuCode){
    localLines = (apu.lines||[]).map(l=>({
      group: l.group || l.tipo || "-",
      desc: l.desc || "",
      unit: l.unit || "",
      qty: Number(l.qty||0),
      pu: Number(l.pu||0),
      parcial: Number(l.parcial||0) || (Number(l.qty||0)*Number(l.pu||0)),
      subRef: l.subRef || ""
    }));

    editMode = false;

    editor && (editor.style.display = "none");
    btnSaveOverride && (btnSaveOverride.style.display = "none");
    btnResetOverride && (btnResetOverride.style.display = "none");

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

/* ---------- Firmas PDF ---------- */
function bindFirmasProyecto(projectId){
  const btnOpen = UI.qs("#btnFirmaOpen");
  const modal = UI.qs("#firmaModal");
  const btnClose = UI.qs("#btnFirmaClose");
  const btnClear = UI.qs("#btnFirmaClear");
  const btnSave = UI.qs("#btnFirmaSave");
  const canvas = UI.qs("#firmaCanvas");
  const inpNombre = UI.qs("#firmaNombre");
  const inpProf = UI.qs("#firmaProfesion");
  const inpMat = UI.qs("#firmaMatricula");

  if(!btnOpen || !modal || !btnClose || !canvas || !btnSave) return;

  const ctx = canvas.getContext("2d");
  let drawing = false, lastX=0, lastY=0;

  function resizeCanvas(){
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const w = canvas.clientWidth || 520;
    const h = canvas.clientHeight || 220;
    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = "#e5eefb";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  function getPos(evt){
    const r = canvas.getBoundingClientRect();
    const p = evt.touches ? evt.touches[0] : evt;
    return { x: p.clientX - r.left, y: p.clientY - r.top };
  }

  function start(evt){
    evt.preventDefault();
    drawing = true;
    const p = getPos(evt);
    lastX = p.x; lastY = p.y;
  }

  function move(evt){
    if(!drawing) return;
    evt.preventDefault();
    const p = getPos(evt);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastX = p.x; lastY = p.y;
  }

  function end(){
    drawing = false;
  }

  function clear(){
    resizeCanvas();
  }

  function redrawFromSaved(){
    const prj = StorageAPI.getProjectById(projectId);
    const e = prj?.elaborador || {};
    resizeCanvas();
    if(e.firmaDataUrl){
      const img
      = new Image();
      img.onload = ()=>{
        ctx.drawImage(img, 0, 0, canvas.clientWidth || 520, canvas.clientHeight || 220);
      };
      img.src = e.firmaDataUrl;
    }
    if(inpNombre) inpNombre.value = e.nombre || "";
    if(inpProf) inpProf.value = e.profesion || "";
    if(inpMat) inpMat.value = e.matricula || "";
  }

  btnOpen.addEventListener("click", ()=>{
    modal.style.display = "";
    redrawFromSaved();
  });

  btnClose.addEventListener("click", ()=> modal.style.display = "none");
  btnClear?.addEventListener("click", clear);

  btnSave.addEventListener("click", ()=>{
    const prj = StorageAPI.getProjectById(projectId);
    if(!prj) return;

    const elaborador = {
      nombre: String(inpNombre?.value||"").trim(),
      profesion: String(inpProf?.value||"").trim(),
      matricula: String(inpMat?.value||"").trim(),
      firmaDataUrl: canvas.toDataURL("image/png")
    };

    StorageAPI.updateProject(projectId, { elaborador });
    alert("Firma / elaborador guardados.");
    modal.style.display = "none";
  });

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);

  canvas.addEventListener("touchstart", start, {passive:false});
  canvas.addEventListener("touchmove", move, {passive:false});
  window.addEventListener("touchend", end, {passive:false});

  resizeCanvas();
  window.addEventListener("resize", ()=> {
    if(modal.style.display !== "none") redrawFromSaved();
  });
}

/* ---------- Detalle proyecto ---------- */
function renderProjectDetail(project){
  const t = totalsCompat(project);

  UI.setHTML(UI.qs("#projectTitle"), UI.esc(project.name||"Proyecto"));
  UI.setHTML(UI.qs("#projectMeta"), `
    <div class="grid two">
      <div class="item"><div class="name">Contrato</div><div class="muted small">${UI.esc(project.contractNo||"-")}</div></div>
      <div class="item"><div class="name">Objeto</div><div class="muted small">${UI.esc(project.object||"-")}</div></div>
      <div class="item"><div class="name">Municipio</div><div class="muted small">${UI.esc(project.municipality||"-")}</div></div>
      <div class="item"><div class="name">Departamento</div><div class="muted small">${UI.esc(project.department||"-")}</div></div>
      <div class="item"><div class="name">Contratista</div><div class="muted small">${UI.esc(project.contractor||"-")}</div></div>
      <div class="item"><div class="name">Interventor</div><div class="muted small">${UI.esc(project.interventor||"-")}</div></div>
    </div>
  `);

  setKpi("#kpiDirecto", UI.fmtMoney(t.directo||0, project.currency||"COP"));
  setKpi("#kpiAdmin", UI.fmtMoney(t.admin||0, project.currency||"COP"));
  setKpi("#kpiIvaUtil", UI.fmtMoney(t.ivaUtil||0, project.currency||"COP"));
  setKpi("#kpiTotalProject", UI.fmtMoney(t.total||0, project.currency||"COP"));
}

function renderChaptersTable(project){
  const tbody = UI.qs("#chaptersBody");
  const empty = UI.qs("#chaptersEmpty");
  if(!tbody) return;

  const { chapters } = Calc.groupByChapters(project);
  if(!chapters.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  tbody.innerHTML = chapters.map(ch=>`
    <tr>
      <td><b>${UI.esc(ch.chapterCode||"-")}</b></td>
      <td>${UI.esc(ch.chapterName||"-")}</td>
      <td style="text-align:right">${UI.esc(String(ch.itemsCount||0))}</td>
      <td style="text-align:right"><b>${UI.fmtMoney(ch.subtotal||0, project.currency||"COP")}</b></td>
    </tr>
  `).join("");
}

function bindProjectExports(projectId){
  const btnPdf = UI.qs("#btnPdfProject");
  const btnPdfApu = UI.qs("#btnPdfProjectApu");
  const btnPdfDes = UI.qs("#btnPdfDesagregado");
  const btnPdfResDes = UI.qs("#btnPdfResumenDesagregado");
  const btnPdfDist = UI.qs("#btnPdfDistribucionCD");
  const btnPdfRend = UI.qs("#btnPdfRendimientos");
  const btnPdfMat = UI.qs("#btnPdfMaterialesActividad");
  const btnPdfRec = UI.qs("#btnPdfRecursos");
  const btnPdfEsp = UI.qs("#btnPdfEspecificaciones");
  const btnExport = UI.qs("#btnExportProject");
  const fileImport = UI.qs("#fileImportProjectDocs");

  btnPdf?.addEventListener("click", async ()=>{
    const p = StorageAPI.getProjectById(projectId);
    if(!p) return;
    if(PDFAPI?.presupuesto) return PDFAPI.presupuesto(p);
    alert("La función PDF Presupuesto no está disponible.");
  });

  btnPdfApu?.addEventListener("click", async ()=>{
    const p = StorageAPI.getProjectById(projectId);
    if(!p) return;
    if(PDFAPI?.presupuestoConAPU) return PDFAPI.presupuestoConAPU(p);
    alert("La función PDF Presupuesto + APUs no está disponible.");
  });

  btnPdfDes?.addEventListener("click", async ()=>{
    const p = StorageAPI.getProjectById(projectId);
    if(!p) return;
    if(PDFAPI?.presupuestoDesagregado) return PDFAPI.presupuestoDesagregado(p);
    alert("La función PDF Presupuesto de Obra Desagregado no está disponible.");
  });

  btnPdfResDes?.addEventListener("click", async ()=>{
    const p = StorageAPI.getProjectById(projectId);
    if(!p) return;
    if(PDFAPI?.resumenPresupuestoDesagregado) return PDFAPI.resumenPresupuestoDesagregado(p);
    alert("La función Resumen Presupuesto de Obra Desagregado no está disponible.");
  });

  btnPdfDist?.addEventListener("click", async ()=>{
    const p = StorageAPI.getProjectById(projectId);
    if(!p) return;
    if(PDFAPI?.distribucionCostosDirectos) return PDFAPI.distribucionCostosDirectos(p);
    alert("La función Distribución porcentual de Costos Directos no está disponible.");
  });

  btnPdfRend?.addEventListener("click", async ()=>{
    const p = StorageAPI.getProjectById(projectId);
    if(!p) return;
    if(PDFAPI?.rendimientosEquipoManoObra) return PDFAPI.rendimientosEquipoManoObra(p);
    alert("La función Rendimiento de Equipo y Mano de Obra por Actividad no está disponible.");
  });

  btnPdfMat?.addEventListener("click", async ()=>{
    const p = StorageAPI.getProjectById(projectId);
    if(!p) return;
    if(PDFAPI?.resumenMaterialesPorActividad) return PDFAPI.resumenMaterialesPorActividad(p);
    alert("La función Resumen materiales por actividad no está disponible.");
  });

  btnPdfRec?.addEventListener("click", async ()=>{
    const p = StorageAPI.getProjectById(projectId);
    if(!p) return;
    if(PDFAPI?.cantidadRecursosInsumos) return PDFAPI.cantidadRecursosInsumos(p);
    alert("La función Cantidad de Recursos e Insumos del Presupuesto no está disponible.");
  });

  btnPdfEsp?.addEventListener("click", async ()=>{
    const p = StorageAPI.getProjectById(projectId);
    if(!p) return;
    if(PDFAPI?.especificacionesTecnicasProyecto) return PDFAPI.especificacionesTecnicasProyecto(p);
    alert("La función PDF Especificaciones Técnicas Proyecto no está disponible.");
  });

  btnExport?.addEventListener("click", async ()=>{
    const p = StorageAPI.getProjectById(projectId);
    if(!p) return;

    const docs = await DB.getFilesByOwner("project", projectId);
    const pack = {
      project: p,
      docs: docs || [],
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(pack,null,2)], {type:"application/json"});
    downloadBlob(blob, `proyecto_${sanitizeFileName(p.name||projectId)}_completo.json`);
  });

  fileImport?.addEventListener("change", async (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;
    try{
      const txt = await f.text();
      const json = JSON.parse(txt);

      const src = json.project || json;
      const newPrj = StorageAPI.createProject({
        ...src,
        id: undefined,
        name: `${src.name || "Proyecto"} (importado)`
      });

      if(Array.isArray(json.docs) && json.docs.length){
        for(const d of json.docs){
          await DB.putFile({
            ownerType:"project",
            ownerId:newPrj.id,
            kind:d.kind || "doc_project",
            name:d.name || "archivo",
            mime:d.mime || "application/octet-stream",
            size:Number(d.size||0),
            blob:d.blob || d.data || null
          });
        }
      }

      alert("Proyecto importado como nuevo.");
      location.href = `proyecto-detalle.html?projectId=${encodeURIComponent(newPrj.id)}`;
    }catch(err){
      alert("No se pudo importar el proyecto: " + (err?.message || err));
    }finally{
      e.target.value = "";
    }
  });
}

async function bindProjectDocs(projectId){
  const list = UI.qs("#projectDocsList");
  const empty = UI.qs("#projectDocsEmpty");
  const fileInput = UI.qs("#fileProjectDoc");
  if(!list || !fileInput) return;

  async function render(){
    const docs = await DB.getFilesByOwner("project", projectId);
    if(!docs.length){
      list.innerHTML = "";
      if(empty) empty.style.display = "";
      return;
    }
    if(empty) empty.style.display = "none";

    list.innerHTML = docs.map(d=>`
      <div class="card">
        <div class="cardhead">
          <h3>${UI.esc(d.name||"Archivo")}</h3>
          <p class="muted small">${UI.esc(d.mime||"")} · ${UI.n(d.size||0)} bytes</p>
        </div>
      </div>
    `).join("");
  }

  fileInput.addEventListener("change", async (e)=>{
    const files = Array.from(e.target.files||[]);
    for(const f of files){
      const data = await fileToDataURL(f);
      await DB.putFile({
        ownerType:"project",
        ownerId:projectId,
        kind:"doc_project",
        name:f.name,
        mime:f.type || "application/octet-stream",
        size:f.size || 0,
        blob:data
      });
    }
    e.target.value = "";
    render();
  });

  render();
}

function bindProjectDetailPage(){
  const projectId = UI.getParam("projectId");
  if(!projectId) return;

  maybeWarnVolatileStorage().catch(()=>{});

  const project = StorageAPI.getProjectById(projectId);
  if(!project){
    alert("Proyecto no encontrado.");
    location.href = "proyectos.html";
    return;
  }

  ensureProjectChapters(project);

  renderProjectDetail(project);
  renderProjectChaptersUI(project);
  renderChaptersTable(project);
  renderItemsTable(project);
  renderResumenItems(project);

  bindProjectChaptersUI(projectId);
  bindImportFromBase(projectId);
  bindBaseViewer(projectId);
  bindProjectExports(projectId);
  bindFirmasProyecto(projectId);
  bindProjectDocs(projectId);

  UI.qs("#btnAddApuCancel")?.addEventListener("click", closeAddApuModal);
  UI.qs("#btnAddApuConfirm")?.addEventListener("click", ()=>confirmAddApuToProject({ keepOpen:false }));
  UI.qs("#btnAddApuConfirmKeep")?.addEventListener("click", ()=>confirmAddApuToProject({ keepOpen:true }));

  const tabs = UI.qsa("[data-tabbtn]");
  const panes = UI.qsa("[data-tabpane]");

  function activate(tab){
    tabs.forEach(b=>b.classList.toggle("active", b.getAttribute("data-tabbtn")===tab));
    panes.forEach(p=>p.style.display = p.getAttribute("data-tabpane")===tab ? "" : "none");
  }

  tabs.forEach(btn=>{
    btn.addEventListener("click", ()=> activate(btn.getAttribute("data-tabbtn")));
  });

  activate(UI.getParam("tab") || "resumen");
}

/* ---------- Utils ---------- */
function fileToDataURL(file){
  return new Promise((resolve, reject)=>{
    const r = new FileReader();
    r.onload = ()=> resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function sanitizeFileName(s){
  return String(s||"archivo").replace(/[\\/:*?"<>|]+/g,"_").trim();
}

function makeId(prefix="id"){
  return `${prefix}_${Math.random().toString(36).slice(2,10)}`;
}

function ensureProjectChapters(project){
  if(!project) return;
  if(!Array.isArray(project.chapters)){
    project.chapters = [];
  }

  let changed = false;
  const existingCodes = new Set(project.chapters.map(c=>String(c.chapterCode||"").trim()).filter(Boolean));

  (project.items||[]).forEach(it=>{
    const code = String(it.chapterCode || (String(it.code||"").split(".")[0]||"")).trim();
    const name = String(it.chapterName||"").trim();
    if(code && !existingCodes.has(code)){
      project.chapters.push({
        id: makeId("chap"),
        chapterCode: code,
        chapterName: name
      });
      existingCodes.add(code);
      changed = true;
    }
  });

  if(changed){
    StorageAPI.updateProject(project.id, { chapters: project.chapters });
  }
}

function totalsCompat(project){
  const t = Calc.calcTotals(project) || {};
  const directo = Number(t.directo || 0);
  const admin = Number(t.admin ?? t.aiu ?? 0);
  const imprev = Number(t.imprev ?? 0);
  const util = Number(t.util ?? 0);
  const subtotal = Number(t.subtotal ?? (directo + admin + imprev + util));
  const ivaUtil = Number(t.ivaUtil ?? t.iva ?? 0);
  const total = Number(t.total ?? (subtotal + ivaUtil));

  return { directo, admin, imprev, util, subtotal, ivaUtil, total };
}

function updateItemsPUByApuCompat(projectId, apuCode, newPU){
  const project = StorageAPI.getProjectById(projectId);
  if(!project) return 0;

  const nk = normKey(apuCode);
  let count = 0;

  const items = (project.items||[]).map(it=>{
    const hit =
      normKey(it.code) === nk ||
      normKey(it.apuRefCode) === nk;

    if(hit){
      count++;
      return { ...it, pu:Number(newPU||0) };
    }
    return it;
  });

  StorageAPI.updateProject(projectId, { items });
  return count;
}

/* ---------- Router ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  const p = page();

  if(p === "index.html"){
    location.href = "proyectos.html";
    return;
  }

  if(p === "proyectos.html"){
    bindProjectsPage();
    return;
  }

  if(p === "proyecto-detalle.html"){
    bindProjectDetailPage();
    return;
  }

  if(p === "apu.html"){
    bindAPUPage();
    return;
  }
});

function getItemByAnyLookup(project, rawCode){
  const code = String(rawCode||"").trim();
  if(!project || !code) return null;

  const items = Array.isArray(project.items) ? project.items : [];

  let hit = items.find(it => String(it.code||"").trim() === code);
  if(hit) return hit;

  hit = items.find(it => String(it.apuRefCode||"").trim() === code);
  if(hit) return hit;

  const nk = normKey(code);

  hit = items.find(it => normKey(it.code) === nk);
  if(hit) return hit;

  hit = items.find(it => normKey(it.apuRefCode) === nk);
  if(hit) return hit;

  return null;
}

async function tryResolveAPUFromProjectItem(projectId, requestedCode){
  const project = StorageAPI.getProjectById(projectId);
  const item = getItemByAnyLookup(project, requestedCode);

  const visibleCode = String(item?.code || requestedCode || "").trim();
  const refCode = String(item?.apuRefCode || item?.code || requestedCode || "").trim();

  const overrideVisible = projectId ? StorageAPI.getApuOverride(projectId, visibleCode) : null;
  if(overrideVisible?.lines?.length){
    return {
      project,
      item,
      visibleCode,
      refCode,
      resolvedCode: visibleCode,
      source: "override",
      data: overrideVisible
    };
  }

  const overrideRef = (refCode && refCode !== visibleCode && projectId) ? StorageAPI.getApuOverride(projectId, refCode) : null;
  if(overrideRef?.lines?.length){
    return {
      project,
      item,
      visibleCode,
      refCode,
      resolvedCode: refCode,
      source: "override",
      data: overrideRef
    };
  }

  const customVisible = StorageAPI.getCustomAPU(visibleCode);
  if(customVisible){
    return {
      project,
      item,
      visibleCode,
      refCode,
      resolvedCode: visibleCode,
      source: "custom",
      data: customVisible
    };
  }

  const customRef = (refCode && refCode !== visibleCode) ? StorageAPI.getCustomAPU(refCode) : null;
  if(customRef){
    return {
      project,
      item,
      visibleCode,
      refCode,
      resolvedCode: refCode,
      source: "custom",
      data: customRef
    };
  }

  let base = await APUBase.getAPU(visibleCode);
  if(base){
    return {
      project,
      item,
      visibleCode,
      refCode,
      resolvedCode: visibleCode,
      source: "base",
      data: base
    };
  }

  base = (refCode && refCode !== visibleCode) ? await APUBase.getAPU(refCode) : null;
  if(base){
    return {
      project,
      item,
      visibleCode,
      refCode,
      resolvedCode: refCode,
      source: "base",
      data: base
    };
  }

  if(item?.desc){
    const found = await APUBase.search(item.desc, 20);
    const byDesc = (found||[]).find(x => String(x.desc||"").trim().toLowerCase() === String(item.desc||"").trim().toLowerCase());
    if(byDesc){
      const baseDesc = await APUBase.getAPU(byDesc.code);
      if(baseDesc){
        return {
          project,
          item,
          visibleCode,
          refCode,
          resolvedCode: byDesc.code,
          source: "base",
          data: baseDesc
        };
      }
    }
  }

  return {
    project,
    item,
    visibleCode,
    refCode,
    resolvedCode: refCode || visibleCode || requestedCode,
    source: "none",
    data: null
  };
}