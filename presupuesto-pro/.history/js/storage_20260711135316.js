// js/storage.js
// PRESUPUESTO PRO — almacenamiento de proyectos
// Versión ajustada para múltiples Bases APU y AIU estructurado (esquema 11)

const STORE_KEY = "presupuesto_pro_v1";
const STORE_BACKUP_KEY = "presupuesto_pro_v1_backup";

function nowISO(){ return new Date().toISOString(); }
function uid(prefix="id"){ return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`; }

function safeStr(v){ return String(v ?? "").trim(); }

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
   Costos indirectos / AIU estructurado
   ========================= */

function normalizeIndirectMode(value){
  const raw = safeStr(value || "percentages").toLowerCase();

  if(
    raw === "structured" ||
    raw === "structure" ||
    raw === "estructurado" ||
    raw === "estructura"
  ){
    return "structured";
  }

  return "percentages";
}

function normalizeIndirectCategory(value){
  const raw = safeStr(value || "OTHER").toUpperCase();

  if(raw.includes("ADMIN")) return "ADMIN";
  if(raw.includes("IMPREV")) return "IMPREV";
  if(raw.includes("UTIL")) return "UTIL";
  if(raw === "IVA" || raw.includes("IVA")) return "IVA";

  return "OTHER";
}

function normalizeIndirectCalcType(value){
  const raw = safeStr(value || "QTY_PU").toUpperCase();

  if(["%CD","PCT_CD","PORCENTAJE_CD","PERCENT_DIRECT"].includes(raw)){
    return "PCT_CD";
  }

  if(["%U","PCT_UTIL","PORCENTAJE_UTILIDAD","PERCENT_UTILITY"].includes(raw)){
    return "PCT_UTIL";
  }

  if(["%AIU","PCT_AIU","PORCENTAJE_AIU"].includes(raw)){
    return "PCT_AIU";
  }

  if(["FIJO","FIXED","VALOR_FIJO"].includes(raw)){
    return "FIXED";
  }

  return "QTY_PU";
}

function normalizeIndirectChapters(raw){
  const arr = Array.isArray(raw) ? raw : [];

  const out = arr.map((chapter, index)=>({
    id: safeStr(chapter?.id) || uid("indchap"),
    code: safeStr(
      chapter?.code ??
      chapter?.chapterCode ??
      chapter?.codigo ??
      String(index + 1)
    ),
    name: safeStr(
      chapter?.name ??
      chapter?.chapterName ??
      chapter?.nombre ??
      `CAPÍTULO ${index + 1}`
    ),
    category: normalizeIndirectCategory(
      chapter?.category ??
      chapter?.categoria ??
      chapter?.groupType ??
      chapter?.tipoGrupo
    ),
    order: Number.isFinite(Number(chapter?.order))
      ? Number(chapter.order)
      : index
  }));

  out.sort((a,b)=>{
    if(a.order !== b.order) return a.order - b.order;
    return String(a.code).localeCompare(String(b.code), "es");
  });

  return out;
}

function normalizeIndirectLines(raw){
  const arr = Array.isArray(raw) ? raw : [];

  const out = arr.map((line, index)=>({
    id: safeStr(line?.id) || uid("indline"),

    chapterId: safeStr(
      line?.chapterId ??
      line?.indirectChapterId ??
      line?.capituloId ??
      ""
    ),

    chapterCode: safeStr(
      line?.chapterCode ??
      line?.capituloCodigo ??
      ""
    ),

    chapterName: safeStr(
      line?.chapterName ??
      line?.capituloNombre ??
      ""
    ),

    code: safeStr(
      line?.code ??
      line?.codigo ??
      ""
    ),

    desc: safeStr(
      line?.desc ??
      line?.description ??
      line?.concepto ??
      ""
    ),

    unit: safeStr(
      line?.unit ??
      line?.unidad ??
      ""
    ),

    category: normalizeIndirectCategory(
      line?.category ??
      line?.categoria ??
      line?.groupType ??
      line?.tipoGrupo
    ),

    calcType: normalizeIndirectCalcType(
      line?.calcType ??
      line?.calculationType ??
      line?.tipoCalculo ??
      line?.unidadCalculo ??
      line?.unit
    ),

    qty: Number(
      line?.qty ??
      line?.quantity ??
      line?.cantidad ??
      line?.percentage ??
      line?.porcentaje ??
      0
    ) || 0,

    pu: Number(
      line?.pu ??
      line?.unitPrice ??
      line?.precioUnitario ??
      line?.fixedValue ??
      line?.valorFijo ??
      0
    ) || 0,

    manualBase: Number(
      line?.manualBase ??
      line?.base ??
      line?.calculationBase ??
      line?.baseCalculo ??
      0
    ) || 0,

    enabled: line?.enabled !== false && line?.activo !== false,

    order: Number.isFinite(Number(line?.order))
      ? Number(line.order)
      : index
  }));

  out.sort((a,b)=>{
    if(a.order !== b.order) return a.order - b.order;
    return String(a.code).localeCompare(String(b.code), "es");
  });

  return out;
}

function normalizeIndirectCosts(project){
  const p = project || {};

  const legacyStructure =
    p.indirectCostStructure ||
    p.costosIndirectosEstructura ||
    {};

  const nested =
    p.indirectCosts && typeof p.indirectCosts === "object"
      ? p.indirectCosts
      : {};

  const mode = normalizeIndirectMode(
    nested.mode ??
    p.indirectCostMode ??
    p.aiuMode ??
    p.costosIndirectosModo ??
    "percentages"
  );

  const chapters = normalizeIndirectChapters(
    nested.chapters ??
    legacyStructure.chapters ??
    p.indirectChapters ??
    []
  );

  const lines = normalizeIndirectLines(
    nested.lines ??
    legacyStructure.lines ??
    p.indirectLines ??
    []
  );

  return {
    mode,
    chapters,
    lines
  };
}

/* =========================
   Proyecto
   ========================= */
function normalizeProject(p){
  const proj = p || {};

  // ✅ Defaults robustos
  proj.currency = String(proj.currency || "COP");

  // =========================================================
  // ✅ VÍNCULO CON BASE APU
  // - baseId identifica la Base APU elegida para el proyecto.
  // - baseName conserva un nombre visible de respaldo.
  // - Los proyectos antiguos quedan con baseId vacío y seguirán
  //   usando temporalmente la Base APU activa de la aplicación.
  // =========================================================
  proj.baseId = safeStr(proj.baseId || "");
  proj.baseName = safeStr(proj.baseName || "");

  // =========================================================
  // ✅ COSTOS INDIRECTOS — DOS MODALIDADES
  // - percentages: A/I/U por porcentajes
  // - structured: estructura detallada por capítulos y conceptos
  // =========================================================
  proj.indirectCosts = normalizeIndirectCosts(proj);

  // Alias de compatibilidad para calc.js, app.js y respaldos anteriores
  proj.indirectCostMode = proj.indirectCosts.mode;
  proj.indirectCostStructure = {
    chapters: proj.indirectCosts.chapters,
    lines: proj.indirectCosts.lines
  };

  // =========================================================
  // ✅ NUEVO ESQUEMA A-I-U + IVA sobre utilidad
  // =========================================================
  const hasNew =
    (proj.adminPct != null) ||
    (proj.imprevPct != null) ||
    (proj.utilPct != null) ||
    (proj.ivaUtilPct != null);

  if(!hasNew){
    // Legacy -> nuevo
    const legacyAIU = Number(proj.aiuPct ?? 25);
    const legacyIVA = Number(proj.ivaPct ?? 19);

    proj.adminPct = Number.isFinite(legacyAIU) ? legacyAIU : 25;
    proj.imprevPct = 0;
    proj.utilPct = 0;
    proj.ivaUtilPct = Number.isFinite(legacyIVA) ? legacyIVA : 19;
  }else{
    // Asegurar valores numéricos (con defaults típicos)
    proj.adminPct = Number(proj.adminPct ?? 18);
    proj.imprevPct = Number(proj.imprevPct ?? 2);
    proj.utilPct = Number(proj.utilPct ?? 5);
    proj.ivaUtilPct = Number(proj.ivaUtilPct ?? 19);
  }

  // ✅ Compatibilidad: mantener aiuPct / ivaPct para pantallas/PDF antiguos
  const aiuCompat = Number(proj.adminPct||0) + Number(proj.imprevPct||0) + Number(proj.utilPct||0);
  proj.aiuPct = Number.isFinite(Number(proj.aiuPct)) ? Number(proj.aiuPct) : aiuCompat;
  if(!Number.isFinite(proj.aiuPct)) proj.aiuPct = aiuCompat;

  proj.ivaPct = Number.isFinite(Number(proj.ivaPct)) ? Number(proj.ivaPct) : Number(proj.ivaUtilPct||19);
  if(!Number.isFinite(proj.ivaPct)) proj.ivaPct = Number(proj.ivaUtilPct||19);

  proj.ivaBase = String(proj.ivaBase || "sobre_directo_aiu");

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

  if(!Array.isArray(proj.items)) proj.items = [];
  if(!proj.apuOverrides) proj.apuOverrides = {};

  // ✅ Normalización suave de items:
  // - completa chapterName desde chapters
  // - ✅ NUEVO: garantiza apuRefCode para NO romper PDFs al renumerar item.code
  try{
    const chs = Array.isArray(proj.chapters) ? proj.chapters : [];
    if(Array.isArray(proj.items)){
      for(const it of proj.items){
        // ✅ migración / default: si no existe apuRefCode, lo seteamos al code actual
        // (Así proyectos viejos quedan enlazados al APU original que tenían antes de renumerar)
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
      }
    }
  }catch(_){}

  return proj;
}

function buildInitialStore(){
  return {
    meta:{
      createdAt: nowISO(),
      version: 11,
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

  let raw = rawMain || rawBackup;

  try{
    const db = JSON.parse(raw);

    if(!db.meta) db.meta = { createdAt:nowISO(), version:11, lastSavedAt: nowISO() };
    if(!Number.isFinite(Number(db.meta.version))) db.meta.version = 11;
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

    // ✅ Normalizar proyectos (incluye chapters + nuevos % + logo + inst* + apuRefCode)
    db.projects = db.projects.map(p => normalizeProject(p));

    if(db.meta.version < 11) db.meta.version = 11;

    // ✅ Reescribe ambas copias ya normalizadas
    saveStore(db);
    return db;
  }catch(_){
    // ✅ Si falla el principal, intentar recuperar desde backup
    if(rawMain && rawBackup && rawMain !== rawBackup){
      try{
        const recovered = JSON.parse(rawBackup);
        if(!recovered.meta) recovered.meta = { createdAt:nowISO(), version:11, lastSavedAt: nowISO() };
        if(!recovered.projects) recovered.projects = [];
        recovered.projects = recovered.projects.map(p => normalizeProject(p));
        recovered.meta.version = 11;
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
  out.meta.version = 11;
  out.meta.lastSavedAt = nowISO();

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

  if(!data.meta) data.meta = { createdAt:nowISO(), version:11, lastSavedAt: nowISO() };
  if(!data.meta.customAPUs) data.meta.customAPUs = {};
  if(!data.meta.customInsumos) data.meta.customInsumos = [];
  if(!data.meta.elaborador) data.meta.elaborador = { nombre:"", profesion:"", matricula:"", firmaDataUrl:"" };

  if(!data.projects) data.projects = [];

  // ✅ Normalizar proyectos importados (incluye chapters + apuRefCode)
  data.projects = data.projects.map(p => normalizeProject(p));

  data.meta.version = 11;
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

    // ✅ Base APU asociada al proyecto
    baseId: "",
    baseName: "",

    // ✅ Costos indirectos
    indirectCosts: {
      mode: "percentages",
      chapters: [],
      lines: []
    },

    // Alias de compatibilidad
    indirectCostMode: "percentages",
    indirectCostStructure: {
      chapters: [],
      lines: []
    },

    // ✅ Defaults nuevos (formato A-I-U)
    adminPct: 18,
    imprevPct: 2,
    utilPct: 5,
    ivaUtilPct: 19,

    // ✅ Compat
    aiuPct: 25,
    ivaPct: 19,
    ivaBase: "sobre_directo_aiu",

    // ✅ logo + institucional
    logoDataUrl: "",
    instPais: "",
    instDepto: "",
    instMunicipio: "",
    instEntidad: "",
    instProyectoLabel: "",
    instFechaElab: "",

    // ✅ capítulos del proyecto (schema app.js)
    chapters: [],

    items: [],
    apuOverrides: {},
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
   Base APU por proyecto
   ========================= */

/**
 * Asigna o cambia la Base APU vinculada a un proyecto.
 * No copia miles de registros dentro del proyecto: solo guarda
 * el identificador y el nombre visible de la base.
 */
function setProjectBase(projectId, baseId, baseName=""){
  const id = safeStr(projectId);
  if(!id) return null;

  return updateProject(id, {
    baseId: safeStr(baseId),
    baseName: safeStr(baseName)
  });
}

/**
 * Devuelve la referencia de Base APU guardada en el proyecto.
 * Los proyectos antiguos pueden devolver valores vacíos.
 */
function getProjectBase(projectId){
  const p = getProjectById(projectId);
  if(!p) return null;

  return {
    baseId: safeStr(p.baseId || ""),
    baseName: safeStr(p.baseName || "")
  };
}

/**
 * Lista proyectos vinculados a una Base APU determinada.
 * Será útil antes de permitir eliminar una base que ya esté en uso.
 */
function listProjectsByBase(baseId){
  const id = safeStr(baseId);
  if(!id) return [];

  return listProjects().filter(p => safeStr(p.baseId || "") === id);
}

/* =========================
   Costos indirectos por proyecto
   ========================= */

function getIndirectCosts(projectId){
  const project = getProjectById(projectId);
  if(!project) return null;

  return normalizeIndirectCosts(project);
}

function setIndirectCostMode(projectId, mode){
  const project = getProjectById(projectId);
  if(!project) return null;

  const indirectCosts = normalizeIndirectCosts(project);
  indirectCosts.mode = normalizeIndirectMode(mode);

  return updateProject(projectId, {
    indirectCosts,
    indirectCostMode: indirectCosts.mode,
    indirectCostStructure: {
      chapters: indirectCosts.chapters,
      lines: indirectCosts.lines
    }
  });
}

function setIndirectCosts(projectId, structure){
  const project = getProjectById(projectId);
  if(!project) return null;

  const current = normalizeIndirectCosts(project);

  const next = normalizeIndirectCosts({
    indirectCosts: {
      mode: structure?.mode ?? current.mode,
      chapters: structure?.chapters ?? current.chapters,
      lines: structure?.lines ?? current.lines
    }
  });

  return updateProject(projectId, {
    indirectCosts: next,
    indirectCostMode: next.mode,
    indirectCostStructure: {
      chapters: next.chapters,
      lines: next.lines
    }
  });
}

function upsertIndirectChapter(projectId, chapter){
  const project = getProjectById(projectId);
  if(!project) return null;

  const indirectCosts = normalizeIndirectCosts(project);
  const incomingId = safeStr(chapter?.id);
  const incomingCode = safeStr(
    chapter?.code ??
    chapter?.chapterCode ??
    chapter?.codigo
  );

  let index = incomingId
    ? indirectCosts.chapters.findIndex(x=>x.id === incomingId)
    : -1;

  if(index === -1 && incomingCode){
    index = indirectCosts.chapters.findIndex(x=>x.code === incomingCode);
  }

  const normalized = normalizeIndirectChapters([{
    ...chapter,
    id: index >= 0
      ? indirectCosts.chapters[index].id
      : (incomingId || uid("indchap"))
  }])[0];

  if(index >= 0){
    indirectCosts.chapters[index] = normalized;
  }else{
    indirectCosts.chapters.push(normalized);
  }

  indirectCosts.chapters = normalizeIndirectChapters(indirectCosts.chapters);

  return setIndirectCosts(projectId, indirectCosts);
}

function deleteIndirectChapter(projectId, chapterId){
  const project = getProjectById(projectId);
  if(!project) return false;

  const key = safeStr(chapterId);
  if(!key) return false;

  const indirectCosts = normalizeIndirectCosts(project);
  const before = indirectCosts.chapters.length;

  indirectCosts.chapters = indirectCosts.chapters.filter(ch=>ch.id !== key);
  indirectCosts.lines = indirectCosts.lines.filter(line=>line.chapterId !== key);

  if(indirectCosts.chapters.length === before) return false;

  setIndirectCosts(projectId, indirectCosts);
  return true;
}

function upsertIndirectLine(projectId, line){
  const project = getProjectById(projectId);
  if(!project) return null;

  const indirectCosts = normalizeIndirectCosts(project);
  const incomingId = safeStr(line?.id);

  let index = incomingId
    ? indirectCosts.lines.findIndex(x=>x.id === incomingId)
    : -1;

  const normalized = normalizeIndirectLines([{
    ...line,
    id: index >= 0
      ? indirectCosts.lines[index].id
      : (incomingId || uid("indline"))
  }])[0];

  if(index >= 0){
    indirectCosts.lines[index] = normalized;
  }else{
    indirectCosts.lines.push(normalized);
  }

  indirectCosts.lines = normalizeIndirectLines(indirectCosts.lines);

  return setIndirectCosts(projectId, indirectCosts);
}

function deleteIndirectLine(projectId, lineId){
  const project = getProjectById(projectId);
  if(!project) return false;

  const key = safeStr(lineId);
  if(!key) return false;

  const indirectCosts = normalizeIndirectCosts(project);
  const before = indirectCosts.lines.length;

  indirectCosts.lines = indirectCosts.lines.filter(line=>line.id !== key);

  if(indirectCosts.lines.length === before) return false;

  setIndirectCosts(projectId, indirectCosts);
  return true;
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

  // ✅ Propagar chapterName a ítems que tengan el mismo chapterCode y estén vacíos
  try{
    for(const it of (p.items||[])){
      if(String(it.chapterCode||"") === chapterCode && !safeStr(it.chapterName)){
        it.chapterName = chapterName;
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

/* ===== Items ===== */
function addItem(projectId, item){
  const db = loadStore();
  const idx = db.projects.findIndex(p=>p.id===projectId);
  if(idx===-1) return null;

  const proj = db.projects[idx];

  const code = safeStr(item?.code);
  const chapCode = resolveChapterCodeForItem(proj, code, item?.chapterCode);
  const chapName = resolveChapterNameForItem(proj, chapCode, item?.chapterName);

  // ✅ NUEVO: apuRefCode (para no perder descomposición al renumerar code)
  const apuRefCode =
    normalizeApuRefCode(item?.apuRefCode) ||
    safeStr(item?.code || ""); // cuando viene desde base, normalmente es el mismo código

  const it = {
    id: uid("it"),
    chapterCode: chapCode,
    chapterName: chapName,
    apuRefCode, // ✅ nuevo
    code: "",
    desc: "",
    unit: "",
    pu: 0,
    qty: 0,
    ...item,
    // Asegurar que la resolución gane si venían vacíos
    chapterCode: chapCode || safeStr(item?.chapterCode || ""),
    chapterName: chapName || safeStr(item?.chapterName || ""),
    // ✅ asegurar apuRefCode al final (si patch lo borró)
    apuRefCode: apuRefCode || normalizeApuRefCode(item?.apuRefCode) || safeStr(item?.code || "")
  };

  db.projects[idx].items.push(it);
  db.projects[idx].updatedAt = nowISO();
  saveStore(db);
  return it;
}

function updateItem(projectId, itemId, patch){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return null;

  const proj = db.projects[pidx];

  const iidx = (proj.items||[]).findIndex(i=>i.id===itemId);
  if(iidx===-1) return null;

  const cur = proj.items[iidx];
  const next = { ...cur, ...patch };

  // ✅ NUEVO: preservar referencia APU cuando el usuario renumera "code"
  // Regla:
  // - Si el usuario cambia patch.code
  // - y NO está enviando patch.apuRefCode explícito
  // - y el ítem no tenía apuRefCode válido
  // => guardamos como apuRefCode el código anterior (cur.code)
  const incomingCode = safeStr(patch?.code);
  const codeChanged = incomingCode && incomingCode !== safeStr(cur?.code);
  const patchHasApuRef = patch && Object.prototype.hasOwnProperty.call(patch, "apuRefCode");
  if(codeChanged && !patchHasApuRef){
    if(!normalizeApuRefCode(cur?.apuRefCode)){
      next.apuRefCode = safeStr(cur?.code || "");
    }else{
      // ya tenía ref => se mantiene
      next.apuRefCode = normalizeApuRefCode(cur.apuRefCode);
    }
  }

  // Si llega apuRefCode explícito (por API futura), normalizarlo
  if(patchHasApuRef){
    next.apuRefCode = normalizeApuRefCode(patch.apuRefCode);
  }

  // Garantía final: si sigue vacío, amarrarlo a code actual
  if(!normalizeApuRefCode(next.apuRefCode)){
    next.apuRefCode = safeStr(next.code || "");
  }

  // Si cambia el code y NO mandan chapterCode, intentar derivarlo (considerando chapters del proyecto)
  if(patch.code && patch.chapterCode == null){
    const resolved = resolveChapterCodeForItem(proj, String(patch.code), "");
    if(resolved) next.chapterCode = resolved;
  }

  // Si mandan chapterCode o quedó resuelto, completar chapterName si viene vacío
  if((patch.chapterCode != null) || next.chapterCode){
    if(!safeStr(next.chapterName)){
      next.chapterName = resolveChapterNameForItem(proj, next.chapterCode, next.chapterName);
    }
  }

  proj.items[iidx] = next;
  proj.updatedAt = nowISO();
  db.projects[pidx] = normalizeProject(proj);

  saveStore(db);
  return next;
}

function deleteItem(projectId, itemId){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return false;
  db.projects[pidx].items = (db.projects[pidx].items||[]).filter(i=>i.id!==itemId);
  db.projects[pidx].updatedAt = nowISO();
  saveStore(db);
  return true;
}

// ✅ actualizar PU de todos los ítems por código dentro del proyecto
// ✅ FIX: ahora compara contra (apuRefCode || code), para que el override aplique aunque renumeres code.
function updateItemsPUByCode(projectId, code, newPU){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return 0;

  const c = String(code||"").trim();
  let count = 0;
  for(const it of (db.projects[pidx].items||[])){
    const lookup = getItemApuLookupCode(it);
    if(String(lookup||"").trim() === c){
      it.pu = Number(newPU||0);
      count++;
    }
  }
  if(count){
    db.projects[pidx].updatedAt = nowISO();
    saveStore(db);
  }
  return count;
}

/* =========================
   Override APU por proyecto
   ========================= */
function getApuOverride(projectId, code){
  const p = getProjectById(projectId);
  if(!p) return null;
  const c = String(code||"").trim();
  return (p.apuOverrides && p.apuOverrides[c]) ? p.apuOverrides[c] : null;
}

function setApuOverride(projectId, code, lines){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return null;

  const c = String(code||"").trim();
  if(!db.projects[pidx].apuOverrides) db.projects[pidx].apuOverrides = {};
  db.projects[pidx].apuOverrides[c] = {
    code: c,
    updatedAt: nowISO(),
    lines: Array.isArray(lines) ? lines : []
  };
  db.projects[pidx].updatedAt = nowISO();
  saveStore(db);
  return db.projects[pidx].apuOverrides[c];
}

function clearApuOverride(projectId, code){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return false;

  const c = String(code||"").trim();
  if(db.projects[pidx].apuOverrides && db.projects[pidx].apuOverrides[c]){
    delete db.projects[pidx].apuOverrides[c];
    db.projects[pidx].updatedAt = nowISO();
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

    // ✅ vínculo con Base APU
    baseId: safeStr(payload.baseId || ""),
    baseName: safeStr(payload.baseName || ""),

    // ✅ Costos indirectos
    indirectCosts: normalizeIndirectCosts(payload),

    // Alias de compatibilidad
    indirectCostMode: normalizeIndirectCosts(payload).mode,
    indirectCostStructure: {
      chapters: normalizeIndirectCosts(payload).chapters,
      lines: normalizeIndirectCosts(payload).lines
    },

    // ✅ nuevos %
    adminPct: Number(payload.adminPct ?? 18),
    imprevPct: Number(payload.imprevPct ?? 2),
    utilPct: Number(payload.utilPct ?? 5),
    ivaUtilPct: Number(payload.ivaUtilPct ?? 19),

    // ✅ compat legacy
    aiuPct: Number(payload.aiuPct||0),
    ivaPct: Number(payload.ivaPct||0),
    ivaBase: payload.ivaBase || "sobre_directo_aiu",

    // ✅ institucional + logo
    logoDataUrl: payload.logoDataUrl || "",
    instPais: payload.instPais || "",
    instDepto: payload.instDepto || "",
    instMunicipio: payload.instMunicipio || "",
    instEntidad: payload.instEntidad || "",
    instProyectoLabel: payload.instProyectoLabel || "",
    instFechaElab: payload.instFechaElab || "",

    // ✅ chapters del proyecto (ya normalizados al schema correcto)
    chapters: Array.isArray(payload.chapters) ? payload.chapters : []
  });

  // reemplazar items con IDs nuevos
  const items = Array.isArray(payload.items) ? payload.items : [];
  const mapped = items.map(it => ({
    id: uid("it"),
    chapterCode: safeStr(it.chapterCode || ""),
    chapterName: safeStr(it.chapterName || ""),
    apuRefCode: normalizeApuRefCode(it.apuRefCode) || safeStr(it.code || ""), // ✅ nuevo
    code: it.code || "",
    desc: it.desc || "",
    unit: it.unit || "",
    pu: Number(it.pu||0),
    qty: Number(it.qty||0)
  }));

  updateProject(base.id, {
    items: mapped,
    apuOverrides: {} // overrides NO se importan por defecto
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

  listCustomInsumos, addCustomInsumo,
  getCustomAPU, upsertCustomAPU, listCustomAPUs,

  createProject, updateProject, listProjects, getProjectById, deleteProject,

  // ✅ Base APU por proyecto
  setProjectBase, getProjectBase, listProjectsByBase,

  // ✅ Costos indirectos por proyecto
  getIndirectCosts,
  setIndirectCostMode,
  setIndirectCosts,
  upsertIndirectChapter,
  deleteIndirectChapter,
  upsertIndirectLine,
  deleteIndirectLine,

  // ✅ Chapters
  listProjectChapters, upsertProjectChapter, deleteProjectChapter,

  addItem, updateItem, deleteItem,
  updateItemsPUByCode,

  getApuOverride, setApuOverride, clearApuOverride,

  importProjectAsNew
};