// js/app.js
// PRESUPUESTO PRO — interfaz principal
// Versión ajustada para separar información institucional y costos indirectos

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
  const t = (window.Calc && typeof Calc.calcTotals === "function")
    ? (Calc.calcTotals(project) || {})
    : {};

  const directo = Number(t.directo || 0);
  const admin = Number(t.admin || 0);
  const imprev = Number(t.imprev || 0);
  const util = Number(t.util || 0);

  const ivaUtil =
    ("ivaUtil" in t)
      ? Number(t.ivaUtil || 0)
      : Number(t.iva || 0);

  const otherIndirect = Number(t.otherIndirect || 0);
  const aiu = Number.isFinite(Number(t.aiu))
    ? Number(t.aiu || 0)
    : (admin + imprev + util);

  const indirectTotal = Number.isFinite(Number(t.indirectTotal))
    ? Number(t.indirectTotal || 0)
    : (aiu + ivaUtil + otherIndirect);

  const subtotal = Number.isFinite(Number(t.subtotal))
    ? Number(t.subtotal || 0)
    : (directo + admin + imprev + util + otherIndirect);

  const total = Number.isFinite(Number(t.total))
    ? Number(t.total || 0)
    : (directo + indirectTotal);

  const enabled = project?.indirectCostsEnabled === true;

  const mode = enabled
    ? String(
        t.mode ||
        project?.indirectCosts?.mode ||
        project?.indirectCostMode ||
        "percentages"
      )
    : "none";

  return {
    ...t,
    enabled,
    mode,
    directo,
    admin,
    imprev,
    util,
    ivaUtil,
    iva: ivaUtil,
    aiu,
    otherIndirect,
    indirectTotal,
    subtotal,
    total,
    structuredChapters: Array.isArray(t.structuredChapters)
      ? t.structuredChapters
      : [],
    structuredSubchapters: Array.isArray(t.structuredSubchapters)
      ? t.structuredSubchapters
      : [],
    structuredLines: Array.isArray(t.structuredLines)
      ? t.structuredLines
      : []
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
   ✅ MÚLTIPLES BASES APU
   ========================================== */

async function listAvailableBases(){
  try{
    return await APUBase.listBases();
  }catch(_){
    return [];
  }
}

async function resolveProjectBase(project, { persistLegacy=true } = {}){
  if(!project) return null;

  const bases = await listAvailableBases();
  if(!bases.length) return null;

  let base = null;

  if(project.baseId){
    base = bases.find(x => String(x.id) === String(project.baseId)) || null;
  }

  // Compatibilidad con proyectos antiguos:
  // si no tienen base asignada, se usa la activa y se guarda el vínculo.
  if(!base){
    base = bases.find(x => x.active) || bases[0] || null;

    if(base && persistLegacy && window.StorageAPI){
      try{
        StorageAPI.setProjectBase(project.id, base.id, base.name);
        project.baseId = base.id;
        project.baseName = base.name;
      }catch(_){}
    }
  }

  return base;
}

async function chooseBaseForNewProject(){
  const bases = await listAvailableBases();

  if(!bases.length){
    alert("Primero debes importar al menos una Base APU.");
    window.location.href = "bases.html";
    return null;
  }

  const active = bases.find(x => x.active);
  const lines = bases.map((b, index)=>{
    const mark = b.active ? " (ACTIVA)" : "";
    return `${index + 1}. ${b.name}${mark}`;
  });

  const defaultIndex = active ? (bases.findIndex(x => x.id === active.id) + 1) : 1;

  const answer = prompt(
    "Seleccione la Base APU para este proyecto:\n\n" + lines.join("\n"),
    String(defaultIndex)
  );

  if(answer === null) return null;

  const index = Number(answer) - 1;
  if(!Number.isInteger(index) || index < 0 || index >= bases.length){
    alert("Selección inválida.");
    return null;
  }

  return bases[index];
}

async function getProjectBaseContext(projectId){
  const project = StorageAPI.getProjectById(projectId);
  if(!project) return { project:null, base:null, baseId:"" };

  const base = await resolveProjectBase(project);
  return {
    project: StorageAPI.getProjectById(projectId) || project,
    base,
    baseId: base?.id || ""
  };
}

/* ==========================================
   ✅ COSTOS INDIRECTOS — DOS MODALIDADES
   ========================================== */

function parseLocaleNumber(value){
  if(typeof value === "number"){
    return Number.isFinite(value) ? value : 0;
  }

  let s = String(value ?? "").trim().replace(/\s+/g, "");
  if(!s) return 0;

  if(s.includes(",") && s.includes(".")){
    if(s.lastIndexOf(",") > s.lastIndexOf(".")){
      s = s.replace(/\./g, "").replace(",", ".");
    }else{
      s = s.replace(/,/g, "");
    }
  }else if(s.includes(",")){
    s = s.replace(",", ".");
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function getIndirectCostsCompat(project){
  const nested = project?.indirectCosts || {};
  const legacy = project?.indirectCostStructure || {};

  return {
    mode: String(
      nested.mode ||
      project?.indirectCostMode ||
      "percentages"
    ),
    chapters: Array.isArray(nested.chapters)
      ? nested.chapters
      : (Array.isArray(legacy.chapters) ? legacy.chapters : []),
    subchapters: Array.isArray(nested.subchapters)
      ? nested.subchapters
      : (Array.isArray(legacy.subchapters) ? legacy.subchapters : []),
    lines: Array.isArray(nested.lines)
      ? nested.lines
      : (Array.isArray(legacy.lines) ? legacy.lines : [])
  };
}

function indirectCategoryLabel(category){
  const map = {
    ADMIN: "Administración",
    IMPREV: "Imprevistos",
    UTIL: "Utilidad",
    IVA: "IVA",
    OTHER: "Otros"
  };
  return map[String(category || "OTHER").toUpperCase()] || "Otros";
}

function indirectCalcTypeLabel(type){
  const map = {
    QTY_PU: "Cantidad × PU",
    PCT_CD: "% Costos directos",
    PCT_UTIL: "% Utilidad",
    PCT_AIU: "% AIU",
    FIXED: "Valor fijo"
  };
  return map[String(type || "QTY_PU").toUpperCase()] || "Cantidad × PU";
}

function indirectUnitForCalcType(type, currentUnit=""){
  const t = String(type || "QTY_PU").toUpperCase();
  if(t === "PCT_CD") return "%CD";
  if(t === "PCT_UTIL") return "%U";
  if(t === "PCT_AIU") return "%AIU";
  if(t === "FIXED") return "GLB";
  return String(currentUnit || "");
}

function refreshProjectViews(projectId){
  const fresh = StorageAPI.getProjectById(projectId);
  if(!fresh) return null;

  renderProjectDetail(fresh);
  renderChaptersTable(fresh);
  renderItemsTable(fresh);
  renderResumenItems(fresh);
  renderIndirectCostsUI(fresh);

  return fresh;
}

function fillIndirectChapterSelects(costs){
  const selects = [
    UI.qs("#indSubchapterChapterId"),
    UI.qs("#indLineChapterId")
  ].filter(Boolean);

  for(const select of selects){
    const currentValue = select.value;

    select.innerHTML = `
      <option value="">Seleccione un capítulo…</option>
      ${costs.chapters.map(chapter=>`
        <option value="${UI.esc(chapter.id)}">
          ${UI.esc(`${chapter.code} — ${chapter.name}`)}
        </option>
      `).join("")}
    `;

    if(costs.chapters.some(ch => ch.id === currentValue)){
      select.value = currentValue;
    }
  }
}

function fillIndirectSubchapterSelect(costs, chapterId, selectedId=""){
  const select = UI.qs("#indLineSubchapterId");
  if(!select) return;

  const filtered = costs.subchapters.filter(
    sub => sub.chapterId === chapterId
  );

  select.innerHTML = chapterId
    ? `
      <option value="">Seleccione un subcapítulo…</option>
      ${filtered.map(sub=>`
        <option value="${UI.esc(sub.id)}">
          ${UI.esc(`${sub.code} — ${sub.name}`)}
        </option>
      `).join("")}
    `
    : `<option value="">Seleccione primero un capítulo…</option>`;

  if(filtered.some(sub => sub.id === selectedId)){
    select.value = selectedId;
  }
}


/* ==========================================
   ✅ PLANTILLA BASE DE COSTOS INDIRECTOS
   ========================================== */

let __indirectTemplatePromise = null;

async function loadIndirectTemplateBase(){
  if(__indirectTemplatePromise) return __indirectTemplatePromise;

  __indirectTemplatePromise = fetch("data/plantillas-costos-indirectos.json", {
    cache: "no-store"
  })
    .then(async response=>{
      if(!response.ok){
        throw new Error(`No se pudo cargar la plantilla (${response.status}).`);
      }

      const data = await response.json();
      const template = data?.template && typeof data.template === "object"
        ? data.template
        : data;

      if(
        !template ||
        !Array.isArray(template.chapters) ||
        !Array.isArray(template.subchapters) ||
        !Array.isArray(template.lines)
      ){
        throw new Error("El archivo de plantilla no tiene la estructura esperada.");
      }

      return template;
    })
    .catch(error=>{
      __indirectTemplatePromise = null;
      throw error;
    });

  return __indirectTemplatePromise;
}

function indirectTemplateMetaCompat(project){
  const meta =
    project?.indirectTemplate && typeof project.indirectTemplate === "object"
      ? project.indirectTemplate
      : {};

  return {
    id: String(meta.id || project?.indirectTemplateId || ""),
    name: String(meta.name || project?.indirectTemplateName || ""),
    version: String(meta.version || project?.indirectTemplateVersion || ""),
    appliedAt: String(meta.appliedAt || project?.indirectTemplateAppliedAt || "")
  };
}

function renderIndirectTemplateStatus(project){
  const panel = UI.qs("#indirectTemplatePanel");
  const status = UI.qs("#indirectTemplateStatus");
  if(!panel || !status) return;

  const meta = indirectTemplateMetaCompat(project);
  const applied = !!meta.id;

  panel.classList.toggle("indirect-template-applied", applied);

  if(applied){
    const dateText = meta.appliedAt
      ? new Date(meta.appliedAt).toLocaleString()
      : "";

    status.innerHTML = `
      <div class="chips" style="justify-content:flex-end">
        ${UI.chip("APLICADA","ok")}
        ${meta.name ? UI.chip(meta.name) : ""}
        ${dateText ? `<span class="muted small">${UI.esc(dateText)}</span>` : ""}
      </div>
    `;
  }else{
    status.innerHTML = UI.chip("SIN APLICAR","warn");
  }
}

function renderIndirectTemplatePreview(template){
  const preview = UI.qs("#indirectTemplatePreview");
  const tree = UI.qs("#indirectTemplateTree");
  if(!preview || !tree) return;

  const chapters = Array.isArray(template?.chapters) ? template.chapters : [];
  const subchapters = Array.isArray(template?.subchapters) ? template.subchapters : [];
  const lines = Array.isArray(template?.lines) ? template.lines : [];

  if(UI.qs("#indirectTemplatePreviewTitle")){
    UI.qs("#indirectTemplatePreviewTitle").textContent =
      template?.name || "Plantilla Base de Costos Indirectos";
  }

  if(UI.qs("#indirectTemplateChapterCount")){
    UI.qs("#indirectTemplateChapterCount").textContent = String(chapters.length);
  }

  if(UI.qs("#indirectTemplateSubchapterCount")){
    UI.qs("#indirectTemplateSubchapterCount").textContent = String(subchapters.length);
  }

  if(UI.qs("#indirectTemplateLineCount")){
    UI.qs("#indirectTemplateLineCount").textContent = String(lines.length);
  }

  const sortedChapters = chapters.slice().sort(
    (a,b)=>Number(a?.order || 0) - Number(b?.order || 0)
  );

  tree.innerHTML = sortedChapters.map(chapter=>{
    const chapterSubs = subchapters
      .filter(sub => String(sub.chapterId) === String(chapter.id))
      .sort((a,b)=>Number(a?.order || 0) - Number(b?.order || 0));

    const directLines = lines
      .filter(line =>
        String(line.chapterId) === String(chapter.id) &&
        !String(line.subchapterId || "")
      )
      .sort((a,b)=>Number(a?.order || 0) - Number(b?.order || 0));

    const subHtml = chapterSubs.map(sub=>{
      const subLines = lines
        .filter(line => String(line.subchapterId) === String(sub.id))
        .sort((a,b)=>Number(a?.order || 0) - Number(b?.order || 0));

      return `
        <section class="template-tree-subchapter">
          <div class="template-tree-subchapter-head">
            ${UI.esc(`${sub.code || ""} — ${sub.name || ""}`)}
          </div>

          <div class="template-tree-lines">
            ${subLines.length
              ? subLines.map(line=>`
                  <div class="template-tree-line">
                    <span class="template-tree-line-code">
                      ${UI.esc(line.code || "")}
                    </span>

                    <span class="template-tree-line-name">
                      ${UI.esc(line.desc || "")}
                    </span>

                    <span class="template-tree-line-type">
                      ${UI.esc(indirectCalcTypeLabel(line.calcType))}
                    </span>
                  </div>
                `).join("")
              : `<div class="muted small" style="padding:8px 0">Sin conceptos.</div>`
            }
          </div>
        </section>
      `;
    }).join("");

    const directHtml = directLines.length
      ? `
        <section class="template-tree-subchapter">
          <div class="template-tree-subchapter-head">SIN SUBCAPÍTULO</div>
          <div class="template-tree-lines">
            ${directLines.map(line=>`
              <div class="template-tree-line">
                <span class="template-tree-line-code">${UI.esc(line.code || "")}</span>
                <span class="template-tree-line-name">${UI.esc(line.desc || "")}</span>
                <span class="template-tree-line-type">${UI.esc(indirectCalcTypeLabel(line.calcType))}</span>
              </div>
            `).join("")}
          </div>
        </section>
      `
      : "";

    return `
      <article class="template-tree-chapter">
        <div class="template-tree-chapter-head">
          <strong>${UI.esc(`${chapter.code || ""} — ${chapter.name || ""}`)}</strong>
          <span>${UI.esc(indirectCategoryLabel(chapter.category))}</span>
        </div>

        ${subHtml || directHtml
          ? `${subHtml}${directHtml}`
          : `<div class="muted small" style="padding:14px">Sin subcapítulos ni conceptos.</div>`
        }
      </article>
    `;
  }).join("");

  if(!chapters.length){
    tree.innerHTML = `<div class="muted">La plantilla no contiene capítulos.</div>`;
  }

  preview.style.display = "";
}

function bindIndirectTemplateUI(projectId){
  const panel = UI.qs("#indirectTemplatePanel");
  if(!panel || panel.dataset.bound === "1") return;

  panel.dataset.bound = "1";

  const preview = UI.qs("#indirectTemplatePreview");
  const btnPreview = UI.qs("#btnPreviewIndirectTemplate");
  const btnClose = UI.qs("#btnCloseIndirectTemplatePreview");
  const btnApply = UI.qs("#btnApplyIndirectTemplate");
  const btnEmpty = UI.qs("#btnCreateEmptyIndirectStructure");

  btnPreview?.addEventListener("click", async ()=>{
    try{
      btnPreview.disabled = true;
      btnPreview.textContent = "Cargando…";

      const template = await loadIndirectTemplateBase();
      renderIndirectTemplatePreview(template);
    }catch(error){
      alert("No se pudo mostrar la plantilla: " + (error?.message || error));
    }finally{
      btnPreview.disabled = false;
      btnPreview.textContent = "Ver contenido";
    }
  });

  btnClose?.addEventListener("click", ()=>{
    if(preview) preview.style.display = "none";
  });

  btnApply?.addEventListener("click", async ()=>{
    try{
      const project = StorageAPI.getProjectById(projectId);
      if(!project) return;

      const current = getIndirectCostsCompat(project);
      const hasStructure =
        current.chapters.length ||
        current.subchapters.length ||
        current.lines.length;

      const warning = hasStructure
        ? "\n\nLa estructura actual será reemplazada completamente."
        : "";

      if(!confirm(
        "¿Aplicar la Plantilla Base de Costos Indirectos a este proyecto?" +
        warning +
        "\n\nDespués podrá modificar, eliminar o agregar cualquier elemento."
      )){
        return;
      }

      btnApply.disabled = true;
      btnApply.textContent = "Aplicando…";

      const template = await loadIndirectTemplateBase();

      if(
        !window.StorageAPI ||
        typeof StorageAPI.applyIndirectTemplate !== "function"
      ){
        throw new Error(
          "storage.js no contiene applyIndirectTemplate(). " +
          "Verifique que copió la Tanda 1."
        );
      }

      StorageAPI.applyIndirectTemplate(projectId, template, {
        replace: true
      });

      const fresh = refreshProjectViews(projectId);
      renderIndirectTemplateStatus(fresh);

      alert(
        "Plantilla Base aplicada correctamente.\n\n" +
        "Ahora puede modificar, eliminar o agregar capítulos, subcapítulos " +
        "y conceptos. Los conceptos %CD usarán automáticamente el costo directo " +
        "del presupuesto del proyecto."
      );
    }catch(error){
      alert("No se pudo aplicar la plantilla: " + (error?.message || error));
    }finally{
      btnApply.disabled = false;
      btnApply.textContent = "Aplicar plantilla base";
    }
  });

  btnEmpty?.addEventListener("click", ()=>{
    const project = StorageAPI.getProjectById(projectId);
    if(!project) return;

    const current = getIndirectCostsCompat(project);
    const hasStructure =
      current.chapters.length ||
      current.subchapters.length ||
      current.lines.length;

    const warning = hasStructure
      ? "\n\nSe eliminarán los capítulos, subcapítulos y conceptos actuales."
      : "";

    if(!confirm(
      "¿Comenzar con una estructura vacía de costos indirectos?" +
      warning
    )){
      return;
    }

    if(
      !window.StorageAPI ||
      typeof StorageAPI.setIndirectCosts !== "function"
    ){
      alert("La versión actual de storage.js no permite vaciar la estructura.");
      return;
    }

    StorageAPI.setIndirectCosts(projectId, {
      mode: "structured",
      chapters: [],
      subchapters: [],
      lines: []
    });

    if(typeof StorageAPI.clearIndirectTemplateMeta === "function"){
      StorageAPI.clearIndirectTemplateMeta(projectId);
    }

    const fresh = refreshProjectViews(projectId);
    renderIndirectTemplateStatus(fresh);

    if(preview) preview.style.display = "none";

    alert(
      "Estructura vacía creada.\n\n" +
      "Puede comenzar agregando sus propios capítulos."
    );
  });

  loadIndirectTemplateBase().catch(error=>{
    console.warn("[PLANTILLA INDIRECTOS] No se pudo precargar:", error);
  });
}

function renderIndirectCostsUI(project){
  const costs = getIndirectCostsCompat(project);
  const totals = totalsCompat(project);
  const currency = project?.currency || "COP";

  const radioPct = UI.qs("#indirectModePercentages");
  const radioStructured = UI.qs("#indirectModeStructured");
  const pctPanel = UI.qs("#indirectPercentagePanel");
  const structuredPanel = UI.qs("#indirectStructuredPanel");
  const notice = UI.qs("#indirectModeNotice");

  const indirectEnabled = project?.indirectCostsEnabled === true;
  const isStructured = costs.mode === "structured";

  const masterToggle = UI.qs("#indirectCostsEnabled");
  const masterStatus = UI.qs("#indirectCostsEnabledStatus");

  if(masterToggle){
    masterToggle.checked = indirectEnabled;
  }

  if(masterStatus){
    masterStatus.className = `notice ${indirectEnabled ? "success" : "info"}`;
    masterStatus.textContent = indirectEnabled
      ? "Costos indirectos ACTIVADOS: intervienen en el valor total del proyecto."
      : "Costos indirectos DESACTIVADOS: el valor total corresponde únicamente a los costos directos.";
  }

  renderIndirectTemplateStatus(project);

  const directBaseEl = UI.qs("#indirectDirectCostBase");
  if(directBaseEl){
    directBaseEl.textContent = UI.fmtMoney(totals.directo, currency);
  }

  if(radioPct) radioPct.checked = !isStructured;
  if(radioStructured) radioStructured.checked = isStructured;
  if(pctPanel) pctPanel.style.display = isStructured ? "none" : "";
  if(structuredPanel) structuredPanel.style.display = isStructured ? "" : "none";

  if(notice){
    notice.className = `notice ${indirectEnabled ? "success" : "info"}`;

    if(!indirectEnabled){
      notice.textContent =
        "Método configurado, pero todavía no aplicado al presupuesto. " +
        "Active la opción superior cuando desee incluir costos indirectos.";
    }else{
      notice.textContent = isStructured
        ? "Método activo: costos indirectos estructurados por capítulos, subcapítulos y conceptos."
        : "Método activo: AIU por porcentajes.";
    }
  }

  const summaryCards = UI.qs("#indirectSummaryCards");
  if(summaryCards){
    summaryCards.innerHTML = `
      <div class="item">
        <div class="name">Administración</div>
        <div class="chips">${UI.chip(UI.fmtMoney(totals.admin, currency))}</div>
      </div>
      <div class="item">
        <div class="name">Imprevistos</div>
        <div class="chips">${UI.chip(UI.fmtMoney(totals.imprev, currency))}</div>
      </div>
      <div class="item">
        <div class="name">Utilidad</div>
        <div class="chips">${UI.chip(UI.fmtMoney(totals.util, currency))}</div>
      </div>
      <div class="item">
        <div class="name">IVA sobre utilidad</div>
        <div class="chips">${UI.chip(UI.fmtMoney(totals.ivaUtil, currency),"ok")}</div>
      </div>
      <div class="item">
        <div class="name">Otros indirectos</div>
        <div class="chips">${UI.chip(UI.fmtMoney(totals.otherIndirect, currency))}</div>
      </div>
    `;
  }

  const summaryRows = UI.qs("#indirectSummaryRows");
  if(summaryRows){
    summaryRows.innerHTML = `
      <div class="row space">
        <div class="name">TOTAL COSTOS DIRECTOS</div>
        <div><b>${UI.fmtMoney(totals.directo, currency)}</b></div>
      </div>
      <div class="row space">
        <div class="name">TOTAL COSTOS INDIRECTOS</div>
        <div><b>${UI.fmtMoney(totals.indirectTotal, currency)}</b></div>
      </div>
      <hr class="sep">
      <div class="row space">
        <div class="name">VALOR TOTAL DEL PROYECTO</div>
        <div><b>${UI.fmtMoney(totals.total, currency)}</b></div>
      </div>
    `;
  }

  const chapterBody = UI.qs("#indirectChaptersBody");
  const chapterEmpty = UI.qs("#indirectChaptersEmpty");

  if(chapterBody){
    const calculatedMap = new Map(
      (totals.structuredChapters || []).map(ch => [String(ch.id), ch])
    );

    if(!costs.chapters.length){
      chapterBody.innerHTML = "";
      if(chapterEmpty) chapterEmpty.style.display = "";
    }else{
      if(chapterEmpty) chapterEmpty.style.display = "none";

      chapterBody.innerHTML = costs.chapters.map(chapter=>{
        const calculated = calculatedMap.get(String(chapter.id));
        const subtotal = Number(calculated?.subtotal || 0);

        return `
          <tr>
            <td><b>${UI.esc(chapter.code || "")}</b></td>
            <td>${UI.esc(chapter.name || "")}</td>
            <td>${UI.esc(indirectCategoryLabel(chapter.category))}</td>
            <td style="text-align:right"><b>${UI.fmtMoney(subtotal, currency)}</b></td>
            <td class="row" style="gap:8px">
              <button class="btn" type="button" data-edit-indchapter="${UI.esc(chapter.id)}">Editar</button>
              <button class="btn danger" type="button" data-del-indchapter="${UI.esc(chapter.id)}">Eliminar</button>
            </td>
          </tr>
        `;
      }).join("");
    }
  }

  fillIndirectChapterSelects(costs);

  const subBody = UI.qs("#indirectSubchaptersBody");
  const subEmpty = UI.qs("#indirectSubchaptersEmpty");

  if(subBody){
    const calculatedMap = new Map(
      (totals.structuredSubchapters || []).map(sub => [String(sub.id), sub])
    );

    if(!costs.subchapters.length){
      subBody.innerHTML = "";
      if(subEmpty) subEmpty.style.display = "";
    }else{
      if(subEmpty) subEmpty.style.display = "none";

      subBody.innerHTML = costs.subchapters.map(sub=>{
        const chapter = costs.chapters.find(ch => ch.id === sub.chapterId);
        const calculated = calculatedMap.get(String(sub.id));
        const subtotal = Number(calculated?.subtotal || 0);

        return `
          <tr>
            <td><b>${UI.esc(sub.code || "")}</b></td>
            <td>${UI.esc(chapter ? `${chapter.code} — ${chapter.name}` : "-")}</td>
            <td>${UI.esc(sub.name || "")}</td>
            <td style="text-align:right"><b>${UI.fmtMoney(subtotal, currency)}</b></td>
            <td class="row" style="gap:8px">
              <button class="btn" type="button" data-edit-indsub="${UI.esc(sub.id)}">Editar</button>
              <button class="btn danger" type="button" data-del-indsub="${UI.esc(sub.id)}">Eliminar</button>
            </td>
          </tr>
        `;
      }).join("");
    }
  }

  const selectedLineChapter = UI.qs("#indLineChapterId")?.value || "";
  const selectedLineSub = UI.qs("#indLineSubchapterId")?.value || "";
  fillIndirectSubchapterSelect(costs, selectedLineChapter, selectedLineSub);

  const lineBody = UI.qs("#indirectLinesBody");
  const lineEmpty = UI.qs("#indirectLinesEmpty");

  if(lineBody){
    const calculatedMap = new Map(
      (totals.structuredLines || []).map(line => [String(line.id), line])
    );

    if(!costs.lines.length){
      lineBody.innerHTML = "";
      if(lineEmpty) lineEmpty.style.display = "";
    }else{
      if(lineEmpty) lineEmpty.style.display = "none";

      lineBody.innerHTML = costs.lines.map(line=>{
        const chapter = costs.chapters.find(ch => ch.id === line.chapterId);
        const subchapter = costs.subchapters.find(sub => sub.id === line.subchapterId);
        const calculated = calculatedMap.get(String(line.id));
        const base = Number(calculated?.base || 0);
        const parcial = Number(calculated?.parcial || 0);

        const puBase = line.calcType === "QTY_PU" || line.calcType === "FIXED"
          ? UI.fmtMoney(line.pu || 0, currency)
          : UI.fmtMoney(base, currency);

        return `
          <tr>
            <td><b>${UI.esc(line.code || "")}</b></td>
            <td>${UI.esc(chapter ? `${chapter.code} — ${chapter.name}` : "-")}</td>
            <td>${UI.esc(subchapter ? `${subchapter.code} — ${subchapter.name}` : "SIN SUBCAPÍTULO")}</td>
            <td>${UI.esc(line.desc || "")}</td>
            <td>${UI.esc(line.unit || indirectUnitForCalcType(line.calcType))}</td>
            <td>${UI.esc(indirectCalcTypeLabel(line.calcType))}</td>
            <td style="text-align:right">${UI.esc(String(line.qty || 0))}</td>
            <td style="text-align:right"><b>${puBase}</b></td>
            <td style="text-align:right"><b>${UI.fmtMoney(parcial, currency)}</b></td>
            <td>${line.enabled === false ? UI.chip("INACTIVO","bad") : UI.chip("ACTIVO","ok")}</td>
            <td class="row" style="gap:8px">
              <button class="btn" type="button" data-edit-indline="${UI.esc(line.id)}">Editar</button>
              <button class="btn danger" type="button" data-del-indline="${UI.esc(line.id)}">Eliminar</button>
            </td>
          </tr>
        `;
      }).join("");
    }
  }

  document.querySelectorAll("[data-edit-indchapter]").forEach(button=>{
    button.onclick = ()=>{
      const fresh = StorageAPI.getProjectById(project.id);
      const current = getIndirectCostsCompat(fresh);
      const chapter = current.chapters.find(ch => ch.id === button.dataset.editIndchapter);
      if(!chapter) return;

      UI.qs("#indChapterEditId").value = chapter.id || "";
      UI.qs("#indChapterCode").value = chapter.code || "";
      UI.qs("#indChapterName").value = chapter.name || "";
      UI.qs("#indChapterCategory").value = chapter.category || "OTHER";
      UI.qs("#indChapterOrder").value = String(chapter.order ?? "");
      setIndirectChapterFormMode("edit");
      focusIndirectForm("#formIndirectChapter", "#indChapterName");
    };
  });

  document.querySelectorAll("[data-del-indchapter]").forEach(button=>{
    button.onclick = ()=>{
      const id = button.dataset.delIndchapter;
      const fresh = StorageAPI.getProjectById(project.id);
      const current = getIndirectCostsCompat(fresh);
      const chapter = current.chapters.find(ch => ch.id === id);
      if(!chapter) return;

      if(!confirm(
        `¿Eliminar el capítulo "${chapter.code} — ${chapter.name}"?\n\n` +
        "También se eliminarán sus subcapítulos y conceptos."
      )) return;

      StorageAPI.deleteIndirectChapter(project.id, id);
      clearIndirectSubchapterForm();
      clearIndirectLineForm();
      refreshProjectViews(project.id);
    };
  });

  document.querySelectorAll("[data-edit-indsub]").forEach(button=>{
    button.onclick = ()=>{
      const fresh = StorageAPI.getProjectById(project.id);
      const current = getIndirectCostsCompat(fresh);
      const sub = current.subchapters.find(x => x.id === button.dataset.editIndsub);
      if(!sub) return;

      UI.qs("#indSubchapterEditId").value = sub.id || "";
      UI.qs("#indSubchapterChapterId").value = sub.chapterId || "";
      UI.qs("#indSubchapterCode").value = sub.code || "";
      UI.qs("#indSubchapterName").value = sub.name || "";
      UI.qs("#indSubchapterOrder").value = String(sub.order ?? "");
      setIndirectSubchapterFormMode("edit");
      focusIndirectForm("#formIndirectSubchapter", "#indSubchapterName");
    };
  });

  document.querySelectorAll("[data-del-indsub]").forEach(button=>{
    button.onclick = ()=>{
      const id = button.dataset.delIndsub;
      const fresh = StorageAPI.getProjectById(project.id);
      const current = getIndirectCostsCompat(fresh);
      const sub = current.subchapters.find(x => x.id === id);
      if(!sub) return;

      if(!confirm(
        `¿Eliminar el subcapítulo "${sub.code} — ${sub.name}"?\n\n` +
        "También se eliminarán sus conceptos."
      )) return;

      StorageAPI.deleteIndirectSubchapter(project.id, id);
      clearIndirectSubchapterForm();
      clearIndirectLineForm();
      refreshProjectViews(project.id);
    };
  });

  document.querySelectorAll("[data-edit-indline]").forEach(button=>{
    button.onclick = ()=>{
      const fresh = StorageAPI.getProjectById(project.id);
      const current = getIndirectCostsCompat(fresh);
      const line = current.lines.find(x => x.id === button.dataset.editIndline);
      if(!line) return;

      UI.qs("#indLineEditId").value = line.id || "";
      UI.qs("#indLineChapterId").value = line.chapterId || "";
      fillIndirectSubchapterSelect(current, line.chapterId || "", line.subchapterId || "");
      UI.qs("#indLineSubchapterId").value = line.subchapterId || "";
      UI.qs("#indLineCode").value = line.code || "";
      UI.qs("#indLineDesc").value = line.desc || "";
      UI.qs("#indLineCategory").value = line.category || "OTHER";
      UI.qs("#indLineCalcType").value = line.calcType || "QTY_PU";
      UI.qs("#indLineUnit").value = line.unit || "";
      UI.qs("#indLineQty").value = String(line.qty ?? "");
      UI.qs("#indLinePU").value = String(line.pu ?? "");
      UI.qs("#indLineOrder").value = String(line.order ?? "");
      UI.qs("#indLineEnabled").checked = line.enabled !== false;

      setIndirectLineFormMode("edit");
      updateIndirectLineFieldLabels();
      focusIndirectForm("#formIndirectLine", "#indLineDesc");
    };
  });

  document.querySelectorAll("[data-del-indline]").forEach(button=>{
    button.onclick = ()=>{
      const id = button.dataset.delIndline;
      const fresh = StorageAPI.getProjectById(project.id);
      const current = getIndirectCostsCompat(fresh);
      const line = current.lines.find(x => x.id === id);
      if(!line) return;

      if(!confirm(`¿Eliminar el concepto "${line.code} — ${line.desc}"?`)) return;

      StorageAPI.deleteIndirectLine(project.id, id);
      refreshProjectViews(project.id);
    };
  });
}


function nextIndirectOrder(items){
  const values = (Array.isArray(items) ? items : [])
    .map(item => Number(item?.order || 0))
    .filter(Number.isFinite);

  return values.length ? Math.max(...values) + 1 : 1;
}

function nextIndirectChapterCode(chapters){
  const numeric = (Array.isArray(chapters) ? chapters : [])
    .map(ch => Number(String(ch?.code || "").trim()))
    .filter(Number.isFinite);

  return numeric.length ? String(Math.max(...numeric) + 1) : "1";
}

function nextIndirectChildCode(parentCode, siblings){
  const parent = String(parentCode || "").trim();
  const prefix = parent ? `${parent}.` : "";

  const nums = (Array.isArray(siblings) ? siblings : [])
    .map(item => String(item?.code || "").trim())
    .filter(code => code.startsWith(prefix))
    .map(code => Number(code.slice(prefix.length)))
    .filter(Number.isFinite);

  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `${prefix}${next}`;
}

function setIndirectChapterFormMode(mode="create"){
  const editing = mode === "edit";
  const button = UI.qs("#btnSaveIndirectChapter");
  const modeText = UI.qs("#indChapterFormMode");

  if(button){
    button.textContent = editing ? "Guardar cambios del capítulo" : "Agregar capítulo";
  }

  if(modeText){
    modeText.textContent = editing
      ? "Modo edición: los cambios actualizarán este capítulo y sus referencias asociadas."
      : "Modo creación: agregará un capítulo nuevo a la estructura del proyecto.";
    modeText.classList.toggle("editing", editing);
  }
}

function setIndirectSubchapterFormMode(mode="create"){
  const editing = mode === "edit";
  const button = UI.qs("#btnSaveIndirectSubchapter");
  const modeText = UI.qs("#indSubchapterFormMode");

  if(button){
    button.textContent = editing ? "Guardar cambios del subcapítulo" : "Agregar subcapítulo";
  }

  if(modeText){
    modeText.textContent = editing
      ? "Modo edición: los cambios actualizarán este subcapítulo y sus conceptos."
      : "Modo creación: agregará un subcapítulo nuevo al capítulo seleccionado.";
    modeText.classList.toggle("editing", editing);
  }
}

function setIndirectLineFormMode(mode="create"){
  const editing = mode === "edit";
  const button = UI.qs("#btnSaveIndirectLine");
  const modeText = UI.qs("#indLineFormMode");

  if(button){
    button.textContent = editing ? "Guardar cambios del concepto" : "Agregar concepto";
  }

  if(modeText){
    modeText.textContent = editing
      ? "Modo edición: los cambios actualizarán este concepto."
      : "Modo creación: agregará un concepto nuevo al subcapítulo seleccionado.";
    modeText.classList.toggle("editing", editing);
  }
}

function focusIndirectForm(selector, inputSelector){
  const form = UI.qs(selector);
  if(!form) return;

  form.scrollIntoView({ behavior:"smooth", block:"start" });
  setTimeout(()=>UI.qs(inputSelector)?.focus(), 250);
}

function prepareNewIndirectChapter(projectId){
  clearIndirectChapterForm();

  const project = StorageAPI.getProjectById(projectId);
  const costs = getIndirectCostsCompat(project);

  if(UI.qs("#indChapterCode")){
    UI.qs("#indChapterCode").value = nextIndirectChapterCode(costs.chapters);
  }
  if(UI.qs("#indChapterOrder")){
    UI.qs("#indChapterOrder").value = String(nextIndirectOrder(costs.chapters));
  }

  setIndirectChapterFormMode("create");
  focusIndirectForm("#formIndirectChapter", "#indChapterName");
}

function prepareNewIndirectSubchapter(projectId){
  clearIndirectSubchapterForm();

  const project = StorageAPI.getProjectById(projectId);
  const costs = getIndirectCostsCompat(project);
  const chapterId = UI.qs("#indSubchapterChapterId")?.value || costs.chapters[0]?.id || "";

  if(UI.qs("#indSubchapterChapterId")){
    UI.qs("#indSubchapterChapterId").value = chapterId;
  }

  const siblings = costs.subchapters.filter(sub => sub.chapterId === chapterId);
  const chapter = costs.chapters.find(ch => ch.id === chapterId);

  if(UI.qs("#indSubchapterCode")){
    UI.qs("#indSubchapterCode").value = nextIndirectChildCode(chapter?.code || "", siblings);
  }
  if(UI.qs("#indSubchapterOrder")){
    UI.qs("#indSubchapterOrder").value = String(nextIndirectOrder(siblings));
  }

  setIndirectSubchapterFormMode("create");
  focusIndirectForm("#formIndirectSubchapter", "#indSubchapterName");
}

function prepareNewIndirectLine(projectId){
  clearIndirectLineForm();

  const project = StorageAPI.getProjectById(projectId);
  const costs = getIndirectCostsCompat(project);

  const chapterId = UI.qs("#indLineChapterId")?.value || costs.chapters[0]?.id || "";
  if(UI.qs("#indLineChapterId")){
    UI.qs("#indLineChapterId").value = chapterId;
  }

  const chapterSubs = costs.subchapters.filter(sub => sub.chapterId === chapterId);
  const subchapterId = chapterSubs[0]?.id || "";
  fillIndirectSubchapterSelect(costs, chapterId, subchapterId);

  if(UI.qs("#indLineSubchapterId")){
    UI.qs("#indLineSubchapterId").value = subchapterId;
  }

  const subchapter = costs.subchapters.find(sub => sub.id === subchapterId);
  const siblings = costs.lines.filter(line => line.subchapterId === subchapterId);

  if(UI.qs("#indLineCode")){
    UI.qs("#indLineCode").value = nextIndirectChildCode(subchapter?.code || "", siblings);
  }
  if(UI.qs("#indLineOrder")){
    UI.qs("#indLineOrder").value = String(nextIndirectOrder(siblings));
  }

  const chapter = costs.chapters.find(ch => ch.id === chapterId);
  if(UI.qs("#indLineCategory")){
    UI.qs("#indLineCategory").value = chapter?.category || "OTHER";
  }

  setIndirectLineFormMode("create");
  updateIndirectLineFieldLabels();
  focusIndirectForm("#formIndirectLine", "#indLineDesc");
}

function clearIndirectChapterForm(){
  if(UI.qs("#formIndirectChapter")) UI.qs("#formIndirectChapter").reset();
  if(UI.qs("#indChapterEditId")) UI.qs("#indChapterEditId").value = "";
  if(UI.qs("#indChapterCategory")) UI.qs("#indChapterCategory").value = "ADMIN";
  setIndirectChapterFormMode("create");
}

function clearIndirectSubchapterForm(){
  if(UI.qs("#formIndirectSubchapter")) UI.qs("#formIndirectSubchapter").reset();
  if(UI.qs("#indSubchapterEditId")) UI.qs("#indSubchapterEditId").value = "";
  setIndirectSubchapterFormMode("create");
}

function clearIndirectLineForm(){
  if(UI.qs("#formIndirectLine")) UI.qs("#formIndirectLine").reset();
  if(UI.qs("#indLineEditId")) UI.qs("#indLineEditId").value = "";
  if(UI.qs("#indLineCategory")) UI.qs("#indLineCategory").value = "ADMIN";
  if(UI.qs("#indLineCalcType")) UI.qs("#indLineCalcType").value = "QTY_PU";
  if(UI.qs("#indLineEnabled")) UI.qs("#indLineEnabled").checked = true;

  const projectId = UI.getParam("projectId");
  const project = StorageAPI.getProjectById(projectId);
  const costs = getIndirectCostsCompat(project);
  fillIndirectSubchapterSelect(costs, "");

  setIndirectLineFormMode("create");
  updateIndirectLineFieldLabels();
}

function updateIndirectLineFieldLabels(){
  const type = String(UI.qs("#indLineCalcType")?.value || "QTY_PU");
  const qtyLabel = UI.qs("#indLineQtyLabel");
  const puLabel = UI.qs("#indLinePULabel");
  const unit = UI.qs("#indLineUnit");
  const pu = UI.qs("#indLinePU");

  if(type === "QTY_PU"){
    if(qtyLabel) qtyLabel.textContent = "Cantidad";
    if(puLabel) puLabel.textContent = "Precio unitario";
    if(pu) pu.disabled = false;
  }else if(type === "FIXED"){
    if(qtyLabel) qtyLabel.textContent = "Cantidad (opcional)";
    if(puLabel) puLabel.textContent = "Valor fijo";
    if(pu) pu.disabled = false;
    if(unit && !unit.value) unit.value = "GLB";
  }else{
    if(qtyLabel) qtyLabel.textContent =
      type === "PCT_CD"
        ? "Porcentaje sobre costo directo (%)"
        : type === "PCT_UTIL"
          ? "Porcentaje sobre utilidad (%)"
          : "Porcentaje sobre AIU (%)";

    if(puLabel) puLabel.textContent =
      type === "PCT_CD"
        ? "Base automática: costo directo del proyecto"
        : type === "PCT_UTIL"
          ? "Base automática: utilidad calculada"
          : "Base automática: AIU calculado";

    if(pu){
      pu.value = "";
      pu.disabled = true;
    }
    if(unit) unit.value = indirectUnitForCalcType(type, unit.value);
  }
}

function bindIndirectCostsUI(projectId){
  bindIndirectTemplateUI(projectId);

  UI.qs("#indirectCostsEnabled")?.addEventListener("change", event=>{
    const enabled = event.target.checked === true;

    StorageAPI.updateProject(projectId, {
      indirectCostsEnabled: enabled
    });

    refreshProjectViews(projectId);
  });

  const modeInputs = document.querySelectorAll('input[name="indirectCostModeChoice"]');

  modeInputs.forEach(input=>{
    input.addEventListener("change", ()=>{
      if(!input.checked) return;

      StorageAPI.setIndirectCostMode(projectId, input.value);
      refreshProjectViews(projectId);
    });
  });

  UI.qs("#formIndirectChapter")?.addEventListener("submit", event=>{
    event.preventDefault();

    const code = String(UI.qs("#indChapterCode")?.value || "").trim();
    const name = String(UI.qs("#indChapterName")?.value || "").trim();
    const category = String(UI.qs("#indChapterCategory")?.value || "OTHER");
    const order = parseLocaleNumber(UI.qs("#indChapterOrder")?.value || 0);
    const id = String(UI.qs("#indChapterEditId")?.value || "").trim();

    if(!code || !name){
      alert("Complete el código y el nombre del capítulo.");
      return;
    }

    try{
      StorageAPI.upsertIndirectChapter(projectId, {
        id,
        code,
        name,
        category,
        order
      });

      clearIndirectChapterForm();
      refreshProjectViews(projectId);
    }catch(error){
      alert(error?.message || "No se pudo guardar el capítulo.");
    }
  });

  UI.qs("#btnNewIndirectChapter")?.addEventListener(
    "click",
    ()=>prepareNewIndirectChapter(projectId)
  );

  UI.qs("#btnClearIndirectChapter")?.addEventListener("click", ()=>{
    clearIndirectChapterForm();
    prepareNewIndirectChapter(projectId);
  });

  UI.qs("#formIndirectSubchapter")?.addEventListener("submit", event=>{
    event.preventDefault();

    const chapterId = String(UI.qs("#indSubchapterChapterId")?.value || "").trim();
    const code = String(UI.qs("#indSubchapterCode")?.value || "").trim();
    const name = String(UI.qs("#indSubchapterName")?.value || "").trim();
    const order = parseLocaleNumber(UI.qs("#indSubchapterOrder")?.value || 0);
    const id = String(UI.qs("#indSubchapterEditId")?.value || "").trim();

    if(!chapterId){
      alert("Seleccione el capítulo del subcapítulo.");
      return;
    }

    if(!code || !name){
      alert("Complete el código y el nombre del subcapítulo.");
      return;
    }

    const fresh = StorageAPI.getProjectById(projectId);
    const costs = getIndirectCostsCompat(fresh);
    const chapter = costs.chapters.find(ch => ch.id === chapterId);

    try{
      StorageAPI.upsertIndirectSubchapter(projectId, {
        id,
        chapterId,
        chapterCode: chapter?.code || "",
        code,
        name,
        category: chapter?.category || "OTHER",
        order
      });

      clearIndirectSubchapterForm();
      refreshProjectViews(projectId);
    }catch(error){
      alert(error?.message || "No se pudo guardar el subcapítulo.");
    }
  });

  UI.qs("#btnNewIndirectSubchapter")?.addEventListener(
    "click",
    ()=>prepareNewIndirectSubchapter(projectId)
  );

  UI.qs("#btnClearIndirectSubchapter")?.addEventListener(
    "click",
    ()=>prepareNewIndirectSubchapter(projectId)
  );

  UI.qs("#indSubchapterChapterId")?.addEventListener("change", ()=>{
    const editId = String(UI.qs("#indSubchapterEditId")?.value || "");
    if(editId) return;

    const project = StorageAPI.getProjectById(projectId);
    const costs = getIndirectCostsCompat(project);
    const chapterId = String(UI.qs("#indSubchapterChapterId")?.value || "");
    const chapter = costs.chapters.find(ch => ch.id === chapterId);
    const siblings = costs.subchapters.filter(sub => sub.chapterId === chapterId);

    if(UI.qs("#indSubchapterCode")){
      UI.qs("#indSubchapterCode").value =
        nextIndirectChildCode(chapter?.code || "", siblings);
    }
    if(UI.qs("#indSubchapterOrder")){
      UI.qs("#indSubchapterOrder").value =
        String(nextIndirectOrder(siblings));
    }
  });

  UI.qs("#indLineChapterId")?.addEventListener("change", ()=>{
    const fresh = StorageAPI.getProjectById(projectId);
    const costs = getIndirectCostsCompat(fresh);
    const chapterId = String(UI.qs("#indLineChapterId")?.value || "");
    const chapterSubs = costs.subchapters.filter(sub => sub.chapterId === chapterId);
    const firstSubId = chapterSubs[0]?.id || "";

    fillIndirectSubchapterSelect(costs, chapterId, firstSubId);

    if(!String(UI.qs("#indLineEditId")?.value || "")){
      const sub = costs.subchapters.find(x => x.id === firstSubId);
      const siblings = costs.lines.filter(line => line.subchapterId === firstSubId);

      if(UI.qs("#indLineCode")){
        UI.qs("#indLineCode").value =
          nextIndirectChildCode(sub?.code || "", siblings);
      }
      if(UI.qs("#indLineOrder")){
        UI.qs("#indLineOrder").value =
          String(nextIndirectOrder(siblings));
      }

      const chapter = costs.chapters.find(ch => ch.id === chapterId);
      if(UI.qs("#indLineCategory")){
        UI.qs("#indLineCategory").value = chapter?.category || "OTHER";
      }
    }
  });

  UI.qs("#indLineSubchapterId")?.addEventListener("change", ()=>{
    if(String(UI.qs("#indLineEditId")?.value || "")) return;

    const fresh = StorageAPI.getProjectById(projectId);
    const costs = getIndirectCostsCompat(fresh);
    const subchapterId = String(UI.qs("#indLineSubchapterId")?.value || "");
    const sub = costs.subchapters.find(x => x.id === subchapterId);
    const siblings = costs.lines.filter(line => line.subchapterId === subchapterId);

    if(UI.qs("#indLineCode")){
      UI.qs("#indLineCode").value =
        nextIndirectChildCode(sub?.code || "", siblings);
    }
    if(UI.qs("#indLineOrder")){
      UI.qs("#indLineOrder").value =
        String(nextIndirectOrder(siblings));
    }
  });

  UI.qs("#formIndirectLine")?.addEventListener("submit", event=>{
    event.preventDefault();

    const chapterId = String(UI.qs("#indLineChapterId")?.value || "").trim();
    const subchapterId = String(UI.qs("#indLineSubchapterId")?.value || "").trim();
    const code = String(UI.qs("#indLineCode")?.value || "").trim();
    const desc = String(UI.qs("#indLineDesc")?.value || "").trim();
    const category = String(UI.qs("#indLineCategory")?.value || "OTHER");
    const calcType = String(UI.qs("#indLineCalcType")?.value || "QTY_PU");
    const unit = String(UI.qs("#indLineUnit")?.value || "").trim();
    const qty = parseLocaleNumber(UI.qs("#indLineQty")?.value || 0);
    const pu = calcType === "PCT_CD" || calcType === "PCT_UTIL" || calcType === "PCT_AIU"
      ? 0
      : parseLocaleNumber(UI.qs("#indLinePU")?.value || 0);
    const order = parseLocaleNumber(UI.qs("#indLineOrder")?.value || 0);
    const enabled = UI.qs("#indLineEnabled")?.checked !== false;
    const id = String(UI.qs("#indLineEditId")?.value || "").trim();

    if(!chapterId){
      alert("Seleccione el capítulo del concepto.");
      return;
    }

    if(!subchapterId){
      alert("Seleccione el subcapítulo del concepto.");
      return;
    }

    if(!code || !desc){
      alert("Complete el código y la descripción del concepto.");
      return;
    }

    if(calcType === "QTY_PU" && qty === 0){
      alert("La cantidad no puede ser cero.");
      return;
    }

    if(
      (calcType === "PCT_CD" || calcType === "PCT_UTIL" || calcType === "PCT_AIU") &&
      qty === 0
    ){
      alert("El porcentaje no puede ser cero.");
      return;
    }

    const fresh = StorageAPI.getProjectById(projectId);
    const costs = getIndirectCostsCompat(fresh);
    const chapter = costs.chapters.find(ch => ch.id === chapterId);
    const subchapter = costs.subchapters.find(sub => sub.id === subchapterId);

    try{
      StorageAPI.upsertIndirectLine(projectId, {
        id,
        chapterId,
        chapterCode: chapter?.code || "",
        chapterName: chapter?.name || "",
        subchapterId,
        subchapterCode: subchapter?.code || "",
        subchapterName: subchapter?.name || "",
        code,
        desc,
        category,
        calcType,
        unit: indirectUnitForCalcType(calcType, unit),
        qty,
        pu,
        order,
        enabled
      });

      clearIndirectLineForm();
      refreshProjectViews(projectId);
    }catch(error){
      alert(error?.message || "No se pudo guardar el concepto.");
    }
  });

  UI.qs("#btnNewIndirectLine")?.addEventListener(
    "click",
    ()=>prepareNewIndirectLine(projectId)
  );

  UI.qs("#btnClearIndirectLine")?.addEventListener(
    "click",
    ()=>prepareNewIndirectLine(projectId)
  );
  UI.qs("#indLineCalcType")?.addEventListener("change", updateIndirectLineFieldLabels);

  renderIndirectCostsUI(StorageAPI.getProjectById(projectId));

  setIndirectChapterFormMode("create");
  setIndirectSubchapterFormMode("create");
  setIndirectLineFormMode("create");
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
    ["Método costos indirectos", totals.mode === "structured" ? "Estructurado" : "AIU por porcentajes"],
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
    ["OTROS COSTOS INDIRECTOS", Number(totals.otherIndirect||0)],
    ["TOTAL COSTOS INDIRECTOS", Number(totals.indirectTotal||0)],
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

  if(totals.mode === "structured"){
    const indirectRows = (totals.structuredLines || []).map(line=>({
      Capitulo: String(line.chapterCode || ""),
      Nombre_Capitulo: String(line.chapterName || ""),
      Subcapitulo: String(line.subchapterCode || ""),
      Nombre_Subcapitulo: String(line.subchapterName || ""),
      Codigo: String(line.code || ""),
      Concepto: String(line.desc || ""),
      Categoria: indirectCategoryLabel(line.category),
      Unidad: String(line.unit || ""),
      Tipo_Calculo: indirectCalcTypeLabel(line.calcType),
      Cantidad_o_Porcentaje: Number(line.qty || 0),
      PU_o_Base: Number(line.calcType === "QTY_PU" || line.calcType === "FIXED" ? line.pu || 0 : line.base || 0),
      Parcial: Number(line.parcial || 0),
      Estado: line.enabled === false ? "INACTIVO" : "ACTIVO"
    }));

    const wsIndirectos = XLSX.utils.json_to_sheet(
      indirectRows.length
        ? indirectRows
        : [{
            Capitulo:"",
            Nombre_Capitulo:"",
            Subcapitulo:"",
            Nombre_Subcapitulo:"",
            Codigo:"",
            Concepto:"",
            Categoria:"",
            Unidad:"",
            Tipo_Calculo:"",
            Cantidad_o_Porcentaje:"",
            PU_o_Base:"",
            Parcial:"",
            Estado:""
          }]
    );

    XLSX.utils.book_append_sheet(wb, wsIndirectos, "Costos Indirectos");
  }

  const out = XLSX.write(wb, { bookType:"xlsx", type:"array" });
  const blob = new Blob([out], { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);

  const filename = `presupuesto_${sanitizeFileName(project.name)}_${Date.now()}.xlsx`;
  UI.downloadBlobUrl(url, filename);
}


async function renderDashboardHome(){
  const recentContainer = UI.qs("#dashboardRecentProjects");
  const recentEmpty = UI.qs("#dashboardRecentEmpty");
  const activeCard = UI.qs("#dashboardActiveProject");

  if(!recentContainer && !activeCard) return;

  const projects = StorageAPI.listProjects()
    .slice()
    .sort((a,b)=>String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")));

  const recent = projects.slice(0,4);

  if(recentContainer){
    if(!recent.length){
      recentContainer.innerHTML = "";
      if(recentEmpty) recentEmpty.style.display = "";
    }else{
      if(recentEmpty) recentEmpty.style.display = "none";

      recentContainer.innerHTML = recent.map(project=>{
        const totals = totalsCompat(project);

        return `
          <article class="recent-project-card">
            <h3>${UI.esc(project.name || "Proyecto")}</h3>
            <p>${UI.esc(project.entity || "Sin entidad")}</p>
            <p>${UI.esc(project.location || "Sin ubicación")}</p>
            <p>Base APU: ${UI.esc(project.baseName || "Sin base")}</p>

            <div class="recent-project-total">
              ${UI.fmtMoney(totals.total, project.currency || "COP")}
            </div>

            <div class="recent-project-actions">
              <a
                class="btn primary"
                href="proyecto-detalle.html?projectId=${encodeURIComponent(project.id)}"
              >
                Abrir
              </a>
            </div>
          </article>
        `;
      }).join("");
    }
  }

  if(activeCard){
    const project = recent[0];

    if(!project){
      activeCard.innerHTML = `
        <div class="active-project-label">Proyecto más reciente</div>
        <div class="active-project-empty">No hay proyectos guardados.</div>
      `;
      return;
    }

    const totals = totalsCompat(project);

    activeCard.innerHTML = `
      <div class="active-project-label">Proyecto más reciente</div>

      <div class="active-project-content">
        <h3>${UI.esc(project.name || "Proyecto")}</h3>

        <div class="active-project-meta">
          <div>
            <span>Entidad</span>
            <strong>${UI.esc(project.entity || "—")}</strong>
          </div>

          <div>
            <span>Ubicación</span>
            <strong>${UI.esc(project.location || "—")}</strong>
          </div>

          <div>
            <span>Base APU</span>
            <strong>${UI.esc(project.baseName || "Sin base")}</strong>
          </div>
        </div>

        <div class="active-project-total">
          ${UI.fmtMoney(totals.total, project.currency || "COP")}
        </div>

        <div class="active-project-actions">
          <a
            class="btn primary"
            href="proyecto-detalle.html?projectId=${encodeURIComponent(project.id)}"
          >
            Abrir proyecto
          </a>
        </div>
      </div>
    `;
  }
}

/* ---------- PROYECTOS ---------- */
async function renderKpis(){
  const el = UI.qs("#kpis");
  if(!el) return;

  const ps = StorageAPI.listProjects();
  const total = ps.reduce((s,p)=> s + (totalsCompat(p).total||0), 0);

  let bases = [];
  try{
    bases = await APUBase.listBases();
  }catch(_){}

  const active = bases.find(x=>x.active) || null;
  const basesChip = bases.length
    ? UI.chip(String(bases.length), "ok")
    : UI.chip("0", "bad");

  el.innerHTML = `
    <div class="card item">
      <div class="topline">
        <div class="name">Proyectos</div>
        <div class="chips">${UI.chip(String(ps.length),"ok")}</div>
      </div>
      <div class="muted small">En este dispositivo.</div>
    </div>

    <div class="card item">
      <div class="topline">
        <div class="name">Total presupuestado</div>
        <div class="chips">${UI.chip(UI.fmtMoney(total,"COP"))}</div>
      </div>
      <div class="muted small">Suma de totales.</div>
    </div>

    <div class="card item">
      <div class="topline">
        <div class="name">Bases APU</div>
        <div class="chips">${basesChip}</div>
      </div>
      <div class="muted small">
        ${active ? `Activa: ${UI.esc(active.name)}` : "No hay bases instaladas."}
      </div>
    </div>

    <div class="card item">
      <div class="topline">
        <div class="name">Modo</div>
        <div class="chips">${UI.chip("OFFLINE","ok")}</div>
      </div>
      <div class="muted small">LocalStorage + IndexedDB.</div>
    </div>
  `;
}

async function renderProjects(){
  const tbody = UI.qs("#lista");
  const empty = UI.qs("#empty");
  if(!tbody) return;

  const term = (UI.qs("#search")?.value || "").toLowerCase().trim();
  let ps = StorageAPI.listProjects();

  if(term){
    ps = ps.filter(p => `${p.name} ${p.entity} ${p.location} ${p.baseName||""}`.toLowerCase().includes(term));
  }

  const bases = await listAvailableBases();
  const baseMap = new Map(bases.map(b=>[String(b.id), b]));
  const active = bases.find(b=>b.active) || null;

  if(!ps.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  tbody.innerHTML = ps.map(p=>{
    const t = totalsCompat(p);
    const linked = p.baseId ? baseMap.get(String(p.baseId)) : null;
    const baseLabel = linked?.name || p.baseName || (active ? `${active.name} (heredada)` : "Sin base");

    return `
      <tr>
        <td><b>${UI.esc(p.name)}</b></td>
        <td>${UI.esc(p.entity||"-")}</td>
        <td>${UI.esc(p.location||"-")}</td>
        <td>
          <div><b>${UI.esc(baseLabel)}</b></div>
          <div class="muted small">${linked ? "Base vinculada" : (active ? "Proyecto antiguo" : "No disponible")}</div>
        </td>
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
      await renderKpis();
      await renderProjects();
      await renderDashboardHome();
    });
  });
}

async function bindProjectsPage(){
  UI.qs("#btnNew")?.addEventListener("click", async ()=>{
    const base = await chooseBaseForNewProject();
    if(!base) return;

    const name = prompt("Nombre del proyecto:","") || "";
    if(!name.trim()) return;

    const entity = prompt("Entidad (opcional):","") || "";
    const ubicacion = prompt("Ubicación (opcional):","") || "";

    const p = StorageAPI.createProject({
      name,
      entity,
      location: ubicacion,
      baseId: base.id,
      baseName: base.name
    });

    window.location.href = `proyecto-detalle.html?projectId=${encodeURIComponent(p.id)}`;
  });

  UI.qs("#search")?.addEventListener("input", ()=>renderProjects());

  UI.qs("#btnInstallBase")?.addEventListener("click", ()=> UI.qs("#fileBase")?.click());

  UI.qs("#fileBase")?.addEventListener("change", async (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;

    const suggested = String(f.name || "Base APU").replace(/\.(xlsx|xls)$/i, "").trim();
    const name = prompt("Nombre para identificar esta Base APU:", suggested);

    if(name === null){
      e.target.value = "";
      return;
    }

    if(!String(name).trim()){
      alert("Debe escribir un nombre para la Base APU.");
      e.target.value = "";
      return;
    }

    try{
      alert("Importando base... (puede tardar un poco)");

      const meta = await APUBase.installFromFile(f, {
        name: String(name).trim()
      });

      alert(
        `Base instalada OK.\n` +
        `Nombre: ${meta.baseName}\n` +
        `Items: ${meta.counts?.items || 0}\n` +
        `CD lines: ${meta.counts?.cdLines||0}\n` +
        `Insumos: ${meta.counts?.insumos||0}\n` +
        `Subproductos: ${meta.counts?.subLines||0}`
      );

      await renderKpis();
      await renderProjects();
      await renderDashboardHome();
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

      let projectPayload = { ...payload.project };

      const bases = await listAvailableBases();
      const linkedExists = projectPayload.baseId && bases.some(b=>String(b.id)===String(projectPayload.baseId));

      if(!linkedExists){
        const base = await chooseBaseForNewProject();
        if(!base) throw new Error("Debe seleccionar una Base APU para importar el proyecto.");
        projectPayload.baseId = base.id;
        projectPayload.baseName = base.name;
      }

      const newProj = StorageAPI.importProjectAsNew(projectPayload);

      const docs = Array.isArray(payload.docs) ? payload.docs : [];
      for(const d of docs){
        if(!d?.dataUrl) continue;
        const blob = await dataUrlToBlob(d.dataUrl);

        await DB.putFile({
          ownerType:"project",
          ownerId:newProj.id,
          kind:"doc_project",
          name:d.name || "archivo",
          mime:d.mime || blob.type || "application/octet-stream",
          size:Number(d.size || blob.size || 0),
          blob
        });
      }

      alert(`Proyecto importado OK.\nProyecto: ${newProj.name}\nAdjuntos: ${docs.length}`);
      await renderKpis();
      await renderProjects();
      await renderDashboardHome();
    }catch(err){
      alert("Error importando proyecto: " + (err?.message || err));
    }finally{
      e.target.value = "";
    }
  });

  UI.qs("#btnReset")?.addEventListener("click", async ()=>{
    if(!confirm("¿Borrar TODO? (proyectos + documentos)")) return;

    const alsoBases = confirm(
      "¿También deseas borrar TODAS las Bases APU?\n\n" +
      "OJO: tendrás que importar nuevamente los archivos XLSX."
    );

    const ps = StorageAPI.listProjects();

    for(const p of ps){
      await DB.deleteFilesByOwner("project", p.id).catch(()=>{});
    }

    StorageAPI.resetAll();

    if(alsoBases){
      try{
        await APUBase.deleteAllBases();
      }catch(_){}
    }

    alert("Listo. Se recargará.");
    window.location.reload();
  });

  await renderKpis();
  await renderProjects();
  await renderDashboardHome();
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
  UI.qs("#projectHeroTitle") && (UI.qs("#projectHeroTitle").textContent = project.name || "Proyecto");
  UI.qs("#projectHeroBase") && (UI.qs("#projectHeroBase").textContent = project.baseName || "Sin base asignada");

  const totals = totalsCompat(project);
  const structured = totals.mode === "structured";

  const adminPct = structured ? Number(totals.adminPct || 0) : pct(project, "adminPct", "aiuPct");
  const imprevPct = structured ? Number(totals.imprevPct || 0) : pct(project, "imprevPct", null);
  const utilPct = structured ? Number(totals.utilPct || 0) : pct(project, "utilPct", null);
  const ivaUtilPct = structured ? Number(totals.ivaUtilPct || 0) : pct(project, "ivaUtilPct", "ivaPct");

  const info = UI.qs("#cardInfo");
  if(info){
    info.innerHTML = `
      <div class="cardhead">
        <h2>${UI.esc(project.name)}</h2>
        <p class="muted small">Entidad: ${UI.esc(project.entity||"-")} · Ubicación: ${UI.esc(project.location||"-")}</p>
      </div>
      <div class="grid two">
        <div class="item">
          <div class="name">Base APU</div>
          <div class="muted small">${UI.esc(project.baseName || "Sin base asignada")}</div>
        </div>
        <div class="item">
          <div class="name">Método de indirectos</div>
          <div class="muted small">
            ${project.indirectCostsEnabled
              ? (structured ? "Costos indirectos estructurados" : "AIU por porcentajes")
              : "No aplicado — solo costos directos"
            }
          </div>
        </div>
        <div class="item">
          <div class="name">Administración</div>
          <div class="muted small">
            ${structured ? UI.fmtMoney(totals.admin, project.currency||"COP") : `${UI.esc(String(adminPct||0))}%`}
          </div>
        </div>
        <div class="item">
          <div class="name">Imprevistos</div>
          <div class="muted small">
            ${structured ? UI.fmtMoney(totals.imprev, project.currency||"COP") : `${UI.esc(String(imprevPct||0))}%`}
          </div>
        </div>
        <div class="item">
          <div class="name">Utilidad</div>
          <div class="muted small">
            ${structured ? UI.fmtMoney(totals.util, project.currency||"COP") : `${UI.esc(String(utilPct||0))}%`}
          </div>
        </div>
        <div class="item">
          <div class="name">IVA s/Utilidad</div>
          <div class="muted small">
            ${structured ? UI.fmtMoney(totals.ivaUtil, project.currency||"COP") : `${UI.esc(String(ivaUtilPct||0))}%`}
          </div>
        </div>
      </div>
    `;
  }

  const k = UI.qs("#cardTotals");
  if(k){
    k.innerHTML = `
      <div class="card item"><div class="name">Ítems</div><div class="chips">${UI.chip(String((project.items||[]).length),"ok")}</div></div>
      <div class="card item"><div class="name">Costos directos</div><div class="chips">${UI.chip(UI.fmtMoney(totals.directo, project.currency||"COP"))}</div></div>
      <div class="card item"><div class="name">Costos indirectos</div><div class="chips">${UI.chip(UI.fmtMoney(totals.indirectTotal, project.currency||"COP"))}</div></div>
      <div class="card item"><div class="name">VALOR TOTAL</div><div class="chips">${UI.chip(UI.fmtMoney(totals.total, project.currency||"COP"),"ok")}</div></div>
    `;
  }

  const rows = UI.qs("#totalsRows");
  if(rows){
    const pctSuffix = value => structured
      ? ` (${Number(value || 0).toFixed(2)}% equiv. CD)`
      : ` (${UI.esc(String(value || 0))}%)`;

    rows.innerHTML = `
      <div class="row space">
        <div class="name">TOTAL COSTOS DIRECTOS</div>
        <div><b>${UI.fmtMoney(totals.directo, project.currency||"COP")}</b></div>
      </div>

      <div class="row space">
        <div class="name">ADMINISTRACIÓN${pctSuffix(adminPct)}</div>
        <div><b>${UI.fmtMoney(totals.admin, project.currency||"COP")}</b></div>
      </div>

      <div class="row space">
        <div class="name">IMPREVISTOS${pctSuffix(imprevPct)}</div>
        <div><b>${UI.fmtMoney(totals.imprev, project.currency||"COP")}</b></div>
      </div>

      <div class="row space">
        <div class="name">UTILIDAD${pctSuffix(utilPct)}</div>
        <div><b>${UI.fmtMoney(totals.util, project.currency||"COP")}</b></div>
      </div>

      ${totals.otherIndirect ? `
        <div class="row space">
          <div class="name">OTROS COSTOS INDIRECTOS</div>
          <div><b>${UI.fmtMoney(totals.otherIndirect, project.currency||"COP")}</b></div>
        </div>
      ` : ""}

      <hr class="sep">

      <div class="row space">
        <div class="name">SUBTOTAL</div>
        <div><b>${UI.fmtMoney(totals.subtotal, project.currency||"COP")}</b></div>
      </div>

      <div class="row space">
        <div class="name">IVA SOBRE UTILIDAD${structured ? "" : ` (${UI.esc(String(ivaUtilPct||0))}%)`}</div>
        <div><b>${UI.fmtMoney(totals.ivaUtil, project.currency||"COP")}</b></div>
      </div>

      <div class="row space">
        <div class="name">TOTAL COSTOS INDIRECTOS</div>
        <div><b>${UI.fmtMoney(totals.indirectTotal, project.currency||"COP")}</b></div>
      </div>

      <hr class="sep">

      <div class="row space">
        <div class="name">VALOR TOTAL</div>
        <div><b>${UI.fmtMoney(totals.total, project.currency||"COP")}</b></div>
      </div>
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
  const btnAdd = UI.qs("#btnAddProjectChapter"); // ✅ botón submit

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

    // no duplicar chapterCode en manual
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

    // ✅ Guardar
    StorageAPI.updateProject(projectId, { chapters: next });

    const updated = StorageAPI.getProjectById(projectId);
    clearForm();
    renderProjectChaptersUI(updated);
    refreshAddApuModalChapterOptions(updated);
    renderChaptersTable(updated);
    renderResumenItems(updated);
  }

  // ✅ submit del form
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    saveChapter();
  });

  // ✅ FIX extra: click directo del botón (hay entornos donde no dispara submit)
  btnAdd?.addEventListener("click", (e)=>{
    e.preventDefault();
    saveChapter();
  });

  // ✅ Enter dentro de inputs también guarda
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

    const visibleCodeOld = String(
      prompt("Código que aparecerá en el presupuesto:", apu.code || "") ??
      apu.code ??
      ""
    ).trim();

    if(!visibleCodeOld){
      alert("Debe escribir el código que aparecerá en el presupuesto.");
      return;
    }

    // El APU real permanece vinculado mediante apuRefCode.
    StorageAPI.addItem(project.id, {
      chapterCode: apu.chapterCode || "",
      chapterName: apu.chapterName || "",
      code: visibleCodeOld,
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

  UI.qs("#addApuModalSub") && (
    UI.qs("#addApuModalSub").textContent =
      `Código original Base APU: ${String(apu.code || "—")}. ` +
      "Puede cambiar el código visible antes de agregar el ítem."
  );

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

  // Código visible editable dentro del presupuesto.
  // El código original de la Base APU se conserva como referencia técnica.
  const visibleCode = String(
    UI.qs("#addApuCode")?.value || apu.code || ""
  ).trim();

  const apuRefCode = String(apu.code || "").trim();

  if(!visibleCode){
    alert("Debe escribir el código que aparecerá en el presupuesto.");
    UI.qs("#addApuCode")?.focus();
    return;
  }

  if(!apuRefCode){
    alert("El registro seleccionado no tiene un código APU válido en la Base APU.");
    return;
  }

  StorageAPI.addItem(projectId, {
    chapterCode,
    chapterName,
    code: visibleCode,      // código visible en el presupuesto
    apuRefCode,             // código real de la Base APU
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

    const codeInput = UI.qs("#addApuCode");
    if(codeInput){
      codeInput.focus();
      codeInput.select();
    }

    alert(
      "Ítem agregado. Puede cambiar el código, la cantidad o el capítulo " +
      "y volver a agregar el mismo APU."
    );
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

    // ✅ APU real para abrir visor
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

      // ✅ Visible code puede cambiar sin afectar APU real
      const code = prompt("Código (visible):", it.code||"") ?? it.code;

      // ✅ Nuevo: APU ref code (real)
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


function normalizeApuSearchText(value){
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function apuSearchTokens(value){
  const stop = new Set([
    "de","del","la","las","el","los","y","e","o","u",
    "para","por","con","sin","un","una","unos","unas","en"
  ]);

  return normalizeApuSearchText(value)
    .split(" ")
    .filter(token => token.length >= 2 && !stop.has(token));
}

function scoreApuSearchRow(row, query){
  const qNorm = normalizeApuSearchText(query);
  const codeNorm = normalizeApuSearchText(row?.code || "");
  const descNorm = normalizeApuSearchText(row?.desc || "");
  const chapterNorm = normalizeApuSearchText(
    `${row?.chapterCode || ""} ${row?.chapterName || ""}`
  );

  if(!qNorm) return 0;

  if(codeNorm === qNorm) return 1000;
  if(descNorm === qNorm) return 950;
  if(codeNorm.startsWith(qNorm)) return 900;
  if(descNorm.includes(qNorm)) return 850;

  const tokens = apuSearchTokens(query);
  if(!tokens.length) return 0;

  const combined = `${codeNorm} ${descNorm} ${chapterNorm}`;
  const matches = tokens.filter(token => combined.includes(token));

  if(matches.length === tokens.length){
    return 700 + matches.length * 10;
  }

  const ratio = matches.length / tokens.length;
  return ratio >= 0.6 ? Math.round(ratio * 500) : 0;
}

async function searchProjectApuBase(query, limit, baseId){
  const q = String(query || "").trim();
  const max = Number(limit || 30);

  // 1. Búsqueda nativa de la Base APU.
  const direct = await APUBase.search(q, max, baseId);
  if(Array.isArray(direct) && direct.length){
    return direct;
  }

  // 2. Búsqueda flexible:
  //    ignora tildes, artículos y preposiciones, y permite coincidencia
  //    por palabras aunque no estén escritas exactamente igual.
  if(typeof APUBase.listFormularioItems !== "function"){
    return [];
  }

  const allItems = await APUBase.listFormularioItems("", 50000, baseId);
  const ranked = (Array.isArray(allItems) ? allItems : [])
    .map(row => ({
      row,
      score: scoreApuSearchRow(row, q)
    }))
    .filter(entry => entry.score > 0)
    .sort((a,b)=>{
      if(b.score !== a.score) return b.score - a.score;
      return String(a.row?.code || "").localeCompare(
        String(b.row?.code || ""),
        undefined,
        { numeric:true }
      );
    })
    .slice(0, max)
    .map(entry => entry.row);

  return ranked;
}

function renderApuResults(projectId, results){
  const tbody = UI.qs("#apuResultsBody");
  const empty = UI.qs("#apuResultsEmpty");
  if(!tbody) return;

  if(!results || !results.length){
    tbody.innerHTML = "";
    if(empty){
      empty.style.display = "";
      empty.textContent =
        "No se encontraron coincidencias en los ítems de la Base APU vinculada. " +
        "Pruebe con una palabra principal, por ejemplo: ALQUILER o BAÑOS.";
    }
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
   ========================================================= */
function bindBaseViewer(projectId, baseId){
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
    try{ meta = await APUBase.getMeta(baseId); }catch(_){}
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
        const rows = await APUBase.listFormularioItems(q || "", 250, baseId);
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
        const rows = await APUBase.listCostosDirectosAll(q || "", 250, baseId);
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
        const list = await APUBase.listSubproductos(250, baseId);
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
        const rows = await APUBase.listInsumos(q || "", 250, baseId);
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

  const base = await resolveProjectBase(project);

  if(!base){
    alert("Este proyecto no tiene una Base APU disponible. Importa una base y asígnala desde la pantalla de proyectos.");
    window.location.href = "bases.html";
    return;
  }

  const projectFresh = StorageAPI.getProjectById(projectId) || project;
  projectFresh.baseId = base.id;
  projectFresh.baseName = base.name;

  ensureProjectChapters(projectFresh);

  bindTabsIfPresent();
  bindFirmaModal();
  bindBaseViewer(projectId, base.id);

  bindProjectChaptersUI(projectId);
  renderProjectChaptersUI(projectFresh);

  UI.qs("#btnAddApuClose")?.addEventListener("click", closeAddApuModal);
  UI.qs("#btnAddApuConfirm")?.addEventListener("click", ()=> confirmAddApuToProject({ keepOpen:false }));
  UI.qs("#btnAddApuConfirmAndKeep")?.addEventListener("click", ()=> confirmAddApuToProject({ keepOpen:true }));

  renderProjectDetail(projectFresh);
  renderChaptersTable(projectFresh);
  renderItemsTable(projectFresh);
  renderResumenItems(projectFresh);

  bindIndirectCostsUI(projectId);
  renderIndirectCostsUI(projectFresh);

  renderDocs(projectId).catch(()=>{});

  /* ===============================
     ✅ LOGO INSTITUCIONAL (por proyecto)
     =============================== */
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

  /* ===============================
     ✅ EXPORTAR A EXCEL
     =============================== */
  UI.qs("#btnExportExcel")?.addEventListener("click", ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      exportProjectExcel(fresh);
    }catch(err){
      alert("Error exportando Excel: " + (err?.message || err));
    }
  });

  // ====== PDFs ======
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

  /* =========================================================
     ✅ NUEVOS 6 BOTONES PDF
     ========================================================= */
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

  /* =========================================================
     ✅ INFORMACIÓN INSTITUCIONAL DEL PROYECTO
     ========================================================= */
  UI.qs("#formProjectInstitutional")?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);

    StorageAPI.updateProject(projectId, {
      instPais: String(fd.get("instPais") || "").trim(),
      instDepto: String(fd.get("instDepto") || "").trim(),
      instMunicipio: String(fd.get("instMunicipio") || "").trim(),
      instEntidad: String(fd.get("instEntidad") || "").trim(),
      instProyectoLabel: String(fd.get("instProyectoLabel") || "").trim(),
      instFechaElab: String(fd.get("instFechaElab") || "").trim()
    });

    const fresh = StorageAPI.getProjectById(projectId);
    renderProjectDetail(fresh);

    alert(
      "Información institucional guardada.\n\n" +
      "Estos datos se utilizarán en los PDF y archivos Excel del proyecto."
    );
  });

  /* =========================================================
     ✅ AIU POR PORCENTAJES
     ========================================================= */
  UI.qs("#formAjustes")?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);

    const adminPct = Number(fd.get("adminPct") || 0);
    const imprevPct = Number(fd.get("imprevPct") || 0);
    const utilPct = Number(fd.get("utilPct") || 0);
    const ivaUtilPct = Number(fd.get("ivaUtilPct") || 0);

    const current = StorageAPI.getProjectById(projectId);
    const indirectCosts = getIndirectCostsCompat(current);

    StorageAPI.updateProject(projectId, {
      adminPct,
      imprevPct,
      utilPct,
      ivaUtilPct,
      indirectCosts: {
        ...indirectCosts,
        mode: "percentages"
      },
      indirectCostMode: "percentages"
    });

    const fresh = StorageAPI.getProjectById(projectId);

    alert(
      "AIU por porcentajes guardado.\n\n" +
      (
        fresh.indirectCostsEnabled
          ? "Los costos indirectos están ACTIVADOS."
          : "Los costos indirectos continúan DESACTIVADOS y no afectan el total."
      )
    );

    renderProjectDetail(fresh);
    renderResumenItems(fresh);
    renderIndirectCostsUI(fresh);
  });

  const aiuForm = UI.qs("#formAjustes");
  if(aiuForm){
    if(aiuForm.adminPct){
      aiuForm.adminPct.value = String(
        projectFresh.adminPct ?? projectFresh.aiuPct ?? 0
      );
    }
    if(aiuForm.imprevPct){
      aiuForm.imprevPct.value = String(projectFresh.imprevPct ?? 0);
    }
    if(aiuForm.utilPct){
      aiuForm.utilPct.value = String(projectFresh.utilPct ?? 0);
    }
    if(aiuForm.ivaUtilPct){
      aiuForm.ivaUtilPct.value = String(
        projectFresh.ivaUtilPct ?? projectFresh.ivaPct ?? 0
      );
    }
  }

  const institutionalForm = UI.qs("#formProjectInstitutional");
  if(institutionalForm){
    if(institutionalForm.instPais){
      institutionalForm.instPais.value = String(projectFresh.instPais || "");
    }
    if(institutionalForm.instDepto){
      institutionalForm.instDepto.value = String(projectFresh.instDepto || "");
    }
    if(institutionalForm.instMunicipio){
      institutionalForm.instMunicipio.value = String(projectFresh.instMunicipio || "");
    }
    if(institutionalForm.instEntidad){
      institutionalForm.instEntidad.value = String(projectFresh.instEntidad || "");
    }
    if(institutionalForm.instProyectoLabel){
      institutionalForm.instProyectoLabel.value = String(projectFresh.instProyectoLabel || "");
    }
    if(institutionalForm.instFechaElab){
      institutionalForm.instFechaElab.value = String(projectFresh.instFechaElab || "");
    }
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
      try{ await APUBase.deleteAllBases(); }catch(_){}
    }

    alert("Listo. Se recargará.");
    window.location.href = "proyectos.html";
  });

  UI.qs("#btnApuSearch")?.addEventListener("click", async ()=>{
    try{
      // La búsqueda usa la Base APU vinculada al proyecto actual.
      const linkedBaseId = String(base?.id || projectFresh?.baseId || "").trim();

      if(!linkedBaseId){
        alert(
          "Este proyecto no tiene una Base APU asociada.\n\n" +
          "Seleccione o importe una Base APU antes de realizar búsquedas."
        );
        return;
      }

      const meta = await APUBase.getMeta(linkedBaseId);

      if(!meta){
        alert(
          "No se encontró la Base APU vinculada a este proyecto.\n\n" +
          "Verifique que la base siga instalada."
        );
        return;
      }

      const q = (UI.qs("#apuSearch")?.value || "").trim();

      if(!q){
        alert("Escriba un código o una descripción para buscar.");
        return;
      }

      const results = await searchProjectApuBase(q, 30, linkedBaseId);
      renderApuResults(projectId, results);
    }catch(err){
      console.error("[PRESUPUESTO PRO] Error buscando en Base APU:", err);
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

    // ✅ Manual: apuRefCode por defecto igual al code (no rompe nada)
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

  let projectBase = null;
  let projectBaseId = "";

  if(projectId){
    const projectForBase = StorageAPI.getProjectById(projectId);
    if(projectForBase){
      projectBase = await resolveProjectBase(projectForBase);
      projectBaseId = projectBase?.id || "";
    }
  }

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

  // ✅ apuCode real que se usa para override/custom/base
  let apuCode = String(codeParam||"").trim();
  let displayCode = apuCode;

  // ✅ Compat: si entran con code visible legacy, intentamos mapear a apuRefCode desde el proyecto
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
        apu = await APUBase.getAPU(apuCode, projectBaseId);
        if(apu && displayCode && displayCode !== apuCode){
          apu.title = `APU ${displayCode} (Ref: ${apuCode})`;
        }
      }
    }
  }else if(sub){
    apu = await APUBase.getSubAPU(sub, projectBaseId);
  }

  if(!apu){
    titleEl && (titleEl.textContent = "APU");
    subEl && (subEl.textContent = "No se encontró el APU solicitado en la Base APU vinculada al proyecto.");
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

      // ✅ Override por APU real
      StorageAPI.setApuOverride(projectId, apuCode, cleaned);

      const newPU = computeDirecto(cleaned);

      // ✅ Actualiza items por apuRefCode si existe; fallback legacy por code
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

  // La pantalla principal puede abrirse como proyectos.html,
  // index.html o directamente desde la raíz de la PWA.
  // En los tres casos se deben activar los botones y cargar los KPI.
  if(
    p === "proyectos.html" ||
    p === "index.html" ||
    p === ""
  ){
    bindProjectsPage().catch(err=>{
      console.error("[PRESUPUESTO PRO] Error iniciando Proyectos:", err);
      alert("No se pudo iniciar la pantalla de proyectos: " + (err?.message || err));
    });
  }

  if(p === "proyecto-detalle.html"){
    bindProjectDetailPage().catch(err=>{
      console.error("[PRESUPUESTO PRO] Error iniciando detalle:", err);
      alert("No se pudo abrir el proyecto: " + (err?.message || err));
    });
  }

  if(p === "apu.html"){
    bindAPUPage().catch(err=>{
      console.error("[PRESUPUESTO PRO] Error iniciando APU:", err);
      alert("No se pudo abrir el APU: " + (err?.message || err));
    });
  }
})();