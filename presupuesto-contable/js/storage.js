const STORE_KEY = "presupuesto_contable_v1";
const STORE_BACKUP_KEY = "presupuesto_contable_v1_backup";

function nowISO(){ return new Date().toISOString(); }
function uid(prefix="id"){ return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`; }

function safeStr(v){ return String(v ?? "").trim(); }
function toNum(v, def=0){
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

/* =========================
   AJUSTES DE PERSISTENCIA MÓVIL
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
   Chapters helpers
   ========================= */
function normalizeChapterCode(code){
  return safeStr(code);
}

function normalizeChapterName(name){
  return safeStr(name);
}

function normalizeChapters(raw){
  const arr = Array.isArray(raw) ? raw : [];
  const out = [];

  for(const c of arr){
    const code = normalizeChapterCode(c?.chapterCode ?? c?.code);
    const name = normalizeChapterName(c?.chapterName ?? c?.name);
    if(!code) continue;

    out.push({
      id: safeStr(c?.id) || uid("chap"),
      chapterCode: code,
      chapterName: name
    });
  }

  const seen = new Set();
  const uniq = [];
  for(const c of out){
    if(seen.has(c.chapterCode)) continue;
    seen.add(c.chapterCode);
    uniq.push(c);
  }

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

  const seg = code.split(".")[0];
  const baseSeg = safeStr(seg);

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

  const chs = Array.isArray(project?.chapters) ? project.chapters : [];
  if(chs.length){
    const set = new Set(chs.map(c => String(c.chapterCode)));
    for(const c of cand){
      if(set.has(c)) return c;
    }
  }

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
   APU Ref helpers
   ========================= */
function normalizeApuRefCode(v){
  return safeStr(v);
}
function getItemApuLookupCode(it){
  const ref = normalizeApuRefCode(it?.apuRefCode);
  return ref || safeStr(it?.code);
}

/* =========================
   FACTURACIÓN
   Estructura alineada con app.js:
   project.facturacion = [ ...registros ]
   ========================= */
function normalizeFactCategory(v){
  const s = safeStr(v).toUpperCase()
    .replace(/Á/g, "A")
    .replace(/É/g, "E")
    .replace(/Í/g, "I")
    .replace(/Ó/g, "O")
    .replace(/Ú/g, "U")
    .replace(/\s+/g, " ")
    .trim();

  if(
    s === "EQUIPO Y HERRAMIENTA" ||
    s === "EQUIPO Y HERRAM" ||
    s === "EQUIPO/HERRAMIENTAS"
  ) return "EQUIPO Y HERRAMIENTAS";

  return s;
}

function normalizeFacturacionRegistro(r){
  const chapterCode = safeStr(r?.chapterCode);
  const chapterName = safeStr(r?.chapterName);
  const fecha = safeStr(r?.fecha);

  return {
    id: safeStr(r?.id) || uid("fact"),
    fecha: fecha || nowISO().slice(0,10),
    categoria: normalizeFactCategory(r?.categoria),
    chapterCode,
    chapterName,
    valor: toNum(r?.valor, toNum(r?.valorFacturado, 0)),
    proveedor: safeStr(r?.proveedor ?? r?.tercero),
    lugarFacturacion: safeStr(r?.lugarFacturacion),
    lugarEntrega: safeStr(r?.lugarEntrega),
    observacion: safeStr(r?.observacion ?? r?.concepto)
  };
}

function normalizeFacturacion(raw){
  if(Array.isArray(raw)){
    return raw.map(normalizeFacturacionRegistro);
  }

  if(raw && typeof raw === "object"){
    if(Array.isArray(raw.registros)){
      return raw.registros.map(normalizeFacturacionRegistro);
    }
  }

  return [];
}

/* =========================
   ACTAS PARCIALES
   ========================= */
function normalizeActaEstado(v){
  const s = safeStr(v).toUpperCase()
    .replace(/Á/g, "A")
    .replace(/É/g, "E")
    .replace(/Í/g, "I")
    .replace(/Ó/g, "O")
    .replace(/Ú/g, "U")
    .trim();

  if(!s) return "BORRADOR";
  if(["BORRADOR", "APROBADA", "PAGADA"].includes(s)) return s;
  return "BORRADOR";
}

function normalizeActaNumero(v){
  return safeStr(v);
}

function normalizeActaLine(line){
  const qtyPresupuesto = toNum(line?.qtyPresupuesto ?? line?.qtyBudget, 0);
  const qtyEjecutadoPrevio = toNum(line?.qtyEjecutadoPrevio ?? line?.qtyExecutedPrev, 0);
  const qtyActa = toNum(line?.qtyActa ?? line?.qty, 0);
  const qtySaldoLuego = toNum(
    line?.qtySaldoLuego,
    Math.max(0, qtyPresupuesto - qtyEjecutadoPrevio - qtyActa)
  );
  const pu = toNum(line?.pu, 0);
  const parcial = toNum(line?.parcial, qtyActa * pu);

  return {
    id: safeStr(line?.id) || uid("actaline"),
    itemId: safeStr(line?.itemId),
    chapterCode: safeStr(line?.chapterCode),
    chapterName: safeStr(line?.chapterName),
    code: safeStr(line?.code),
    desc: safeStr(line?.desc),
    unit: safeStr(line?.unit),
    qtyPresupuesto,
    qtyEjecutadoPrevio,
    qtyActa,
    qtySaldoLuego,
    pu,
    parcial
  };
}

function normalizeActaParcial(acta){
  const lines = Array.isArray(acta?.lines) ? acta.lines.map(normalizeActaLine) : [];
  const totalValor = toNum(
    acta?.totalValor,
    lines.reduce((acc, l)=> acc + toNum(l?.parcial, 0), 0)
  );
  const totalLineas = toNum(acta?.totalLineas, lines.length);

  return {
    id: safeStr(acta?.id) || uid("acta"),
    numero: normalizeActaNumero(acta?.numero),
    fecha: safeStr(acta?.fecha) || nowISO().slice(0,10),
    periodo: safeStr(acta?.periodo),
    estado: normalizeActaEstado(acta?.estado),
    observacion: safeStr(acta?.observacion),
    createdAt: safeStr(acta?.createdAt) || nowISO(),
    updatedAt: safeStr(acta?.updatedAt) || nowISO(),
    lines,
    totalValor,
    totalLineas
  };
}

function normalizeActasParciales(raw){
  if(!Array.isArray(raw)) return [];
  return raw.map(normalizeActaParcial).sort((a,b)=>{
    const fa = safeStr(a?.fecha);
    const fb = safeStr(b?.fecha);
    if(fa !== fb) return fb.localeCompare(fa);
    return safeStr(b?.createdAt).localeCompare(safeStr(a?.createdAt));
  });
}

/* =========================
   Helpers APU custom
   ========================= */
function normalizeApuLine(line){
  const qty = toNum(line?.qty, 0);
  const pu = toNum(line?.pu, 0);
  const parcial = toNum(line?.parcial, qty * pu);

  return {
    group: safeStr(line?.group ?? line?.tipo),
    tipo: safeStr(line?.tipo ?? line?.group),
    desc: safeStr(line?.desc),
    unit: safeStr(line?.unit),
    qty,
    pu,
    parcial
  };
}

function normalizeCustomAPURecord(apu){
  const code = safeStr(apu?.code);
  if(!code) throw new Error("Custom APU: falta code");

  const lines = Array.isArray(apu?.lines) ? apu.lines.map(normalizeApuLine) : [];

  return {
    code,
    desc: safeStr(apu?.desc),
    unit: safeStr(apu?.unit),
    chapterCode: safeStr(apu?.chapterCode),
    chapterName: safeStr(apu?.chapterName),
    lines
  };
}

function normalizeCustomInsumoRecord(ins){
  return {
    id: safeStr(ins?.id) || uid("ins"),
    tipo: safeStr(ins?.tipo),
    desc: safeStr(ins?.desc),
    unit: safeStr(ins?.unit),
    pu: toNum(ins?.pu, 0)
  };
}

/* =========================
   Proyecto
   ========================= */
function normalizeProject(p){
  const proj = p || {};

  proj.currency = String(proj.currency || "COP");

  const hasNew =
    (proj.adminPct != null) ||
    (proj.imprevPct != null) ||
    (proj.utilPct != null) ||
    (proj.ivaUtilPct != null);

  if(!hasNew){
    const legacyAIU = Number(proj.aiuPct ?? 25);
    const legacyIVA = Number(proj.ivaPct ?? 19);

    proj.adminPct = Number.isFinite(legacyAIU) ? legacyAIU : 25;
    proj.imprevPct = 0;
    proj.utilPct = 0;
    proj.ivaUtilPct = Number.isFinite(legacyIVA) ? legacyIVA : 19;
  }else{
    proj.adminPct = Number(proj.adminPct ?? 18);
    proj.imprevPct = Number(proj.imprevPct ?? 2);
    proj.utilPct = Number(proj.utilPct ?? 5);
    proj.ivaUtilPct = Number(proj.ivaUtilPct ?? 19);
  }

  const aiuCompat = Number(proj.adminPct||0) + Number(proj.imprevPct||0) + Number(proj.utilPct||0);
  proj.aiuPct = Number.isFinite(Number(proj.aiuPct)) ? Number(proj.aiuPct) : aiuCompat;
  if(!Number.isFinite(proj.aiuPct)) proj.aiuPct = aiuCompat;

  proj.ivaPct = Number.isFinite(Number(proj.ivaPct)) ? Number(proj.ivaPct) : Number(proj.ivaUtilPct||19);
  if(!Number.isFinite(proj.ivaPct)) proj.ivaPct = Number(proj.ivaUtilPct||19);

  proj.ivaBase = String(proj.ivaBase || "sobre_directo_aiu");

  proj.logoDataUrl = String(proj.logoDataUrl || "");

  proj.instPais = String(proj.instPais || "");
  proj.instDepto = String(proj.instDepto || "");
  proj.instMunicipio = String(proj.instMunicipio || "");
  proj.instEntidad = String(proj.instEntidad || "");
  proj.instProyectoLabel = String(proj.instProyectoLabel || "");
  proj.instFechaElab = String(proj.instFechaElab || "");

  proj.chapters = normalizeChapters(proj.chapters);

  if(!Array.isArray(proj.items)) proj.items = [];
  if(!proj.apuOverrides || typeof proj.apuOverrides !== "object") proj.apuOverrides = {};

  proj.facturacion = normalizeFacturacion(proj.facturacion);
  proj.actasParciales = normalizeActasParciales(proj.actasParciales);

  try{
    for(const key of Object.keys(proj.apuOverrides)){
      const ov = proj.apuOverrides[key] || {};
      proj.apuOverrides[key] = {
        code: safeStr(ov.code || key),
        updatedAt: safeStr(ov.updatedAt) || nowISO(),
        lines: Array.isArray(ov.lines) ? ov.lines.map(normalizeApuLine) : []
      };
    }
  }catch(_){}

  try{
    const chs = Array.isArray(proj.chapters) ? proj.chapters : [];
    if(Array.isArray(proj.items)){
      proj.items = proj.items.map(raw=>{
        const it = {
          id: safeStr(raw?.id) || uid("it"),
          chapterCode: safeStr(raw?.chapterCode),
          chapterName: safeStr(raw?.chapterName),
          apuRefCode: normalizeApuRefCode(raw?.apuRefCode) || safeStr(raw?.code || ""),
          code: safeStr(raw?.code),
          desc: safeStr(raw?.desc),
          unit: safeStr(raw?.unit),
          pu: toNum(raw?.pu, 0),
          qty: toNum(raw?.qty, 0)
        };

        const cc = normalizeChapterCode(it.chapterCode);
        if(cc && (!safeStr(it.chapterName))){
          const found = chs.find(c => String(c.chapterCode) === cc);
          if(found && found.chapterName) it.chapterName = String(found.chapterName);
        }

        return it;
      });
    }
  }catch(_){}

  return proj;
}

function buildInitialStore(){
  return {
    meta:{
      createdAt: nowISO(),
      version: 13,
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

    if(!db.meta) db.meta = { createdAt:nowISO(), version:13, lastSavedAt: nowISO() };
    if(!Number.isFinite(Number(db.meta.version))) db.meta.version = 13;
    if(!db.meta.lastSavedAt) db.meta.lastSavedAt = nowISO();

    if(!db.meta.customAPUs || typeof db.meta.customAPUs !== "object") db.meta.customAPUs = {};
    if(!Array.isArray(db.meta.customInsumos)) db.meta.customInsumos = [];

    if(!db.meta.elaborador){
      db.meta.elaborador = { nombre:"", profesion:"", matricula:"", firmaDataUrl:"" };
    }else{
      db.meta.elaborador.nombre = String(db.meta.elaborador.nombre||"");
      db.meta.elaborador.profesion = String(db.meta.elaborador.profesion||"");
      db.meta.elaborador.matricula = String(db.meta.elaborador.matricula||"");
      db.meta.elaborador.firmaDataUrl = String(db.meta.elaborador.firmaDataUrl||"");
    }

    try{
      const nextCustom = {};
      for(const key of Object.keys(db.meta.customAPUs)){
        const rec = normalizeCustomAPURecord({ ...db.meta.customAPUs[key], code:key });
        nextCustom[rec.code] = rec;
      }
      db.meta.customAPUs = nextCustom;
    }catch(_){
      db.meta.customAPUs = {};
    }

    try{
      db.meta.customInsumos = db.meta.customInsumos.map(normalizeCustomInsumoRecord);
    }catch(_){
      db.meta.customInsumos = [];
    }

    if(!db.projects) db.projects = [];

    db.projects = db.projects.map(p => normalizeProject(p));

    if(db.meta.version < 13) db.meta.version = 13;

    saveStore(db);
    return db;
  }catch(_){
    if(rawMain && rawBackup && rawMain !== rawBackup){
      try{
        const recovered = JSON.parse(rawBackup);
        if(!recovered.meta) recovered.meta = { createdAt:nowISO(), version:13, lastSavedAt: nowISO() };
        if(!recovered.projects) recovered.projects = [];
        if(!recovered.meta.customAPUs || typeof recovered.meta.customAPUs !== "object") recovered.meta.customAPUs = {};
        if(!Array.isArray(recovered.meta.customInsumos)) recovered.meta.customInsumos = [];
        if(!recovered.meta.elaborador) recovered.meta.elaborador = { nombre:"", profesion:"", matricula:"", firmaDataUrl:"" };

        try{
          const nextCustom = {};
          for(const key of Object.keys(recovered.meta.customAPUs)){
            const rec = normalizeCustomAPURecord({ ...recovered.meta.customAPUs[key], code:key });
            nextCustom[rec.code] = rec;
          }
          recovered.meta.customAPUs = nextCustom;
        }catch(_e){
          recovered.meta.customAPUs = {};
        }

        try{
          recovered.meta.customInsumos = recovered.meta.customInsumos.map(normalizeCustomInsumoRecord);
        }catch(_e){
          recovered.meta.customInsumos = [];
        }

        recovered.projects = recovered.projects.map(p => normalizeProject(p));
        recovered.meta.version = 13;
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
  out.meta.version = 13;
  out.meta.lastSavedAt = nowISO();

  if(!out.meta.customAPUs || typeof out.meta.customAPUs !== "object") out.meta.customAPUs = {};
  if(!Array.isArray(out.meta.customInsumos)) out.meta.customInsumos = [];

  try{
    const nextCustom = {};
    for(const key of Object.keys(out.meta.customAPUs)){
      const rec = normalizeCustomAPURecord({ ...out.meta.customAPUs[key], code:key });
      nextCustom[rec.code] = rec;
    }
    out.meta.customAPUs = nextCustom;
  }catch(_){
    out.meta.customAPUs = {};
  }

  try{
    out.meta.customInsumos = out.meta.customInsumos.map(normalizeCustomInsumoRecord);
  }catch(_){
    out.meta.customInsumos = [];
  }

  if(!Array.isArray(out.projects)) out.projects = [];
  out.projects = out.projects.map(normalizeProject);

  const txt = JSON.stringify(out);

  safeLocalSet(STORE_KEY, txt);
  safeLocalSet(STORE_BACKUP_KEY, txt);

  return true;
}

function exportBackup(){
  const db = loadStore();
  const blob = new Blob([JSON.stringify(db,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  return { url, filename:`backup_presupuesto_contable_${Date.now()}.json` };
}

async function importBackupFromFile(file){
  const text = await file.text();
  const data = JSON.parse(text);
  if(!data || !data.projects) throw new Error("Backup inválido.");

  if(!data.meta) data.meta = { createdAt:nowISO(), version:13, lastSavedAt: nowISO() };
  if(!data.meta.customAPUs || typeof data.meta.customAPUs !== "object") data.meta.customAPUs = {};
  if(!Array.isArray(data.meta.customInsumos)) data.meta.customInsumos = [];
  if(!data.meta.elaborador) data.meta.elaborador = { nombre:"", profesion:"", matricula:"", firmaDataUrl:"" };

  try{
    const nextCustom = {};
    for(const key of Object.keys(data.meta.customAPUs)){
      const rec = normalizeCustomAPURecord({ ...data.meta.customAPUs[key], code:key });
      nextCustom[rec.code] = rec;
    }
    data.meta.customAPUs = nextCustom;
  }catch(_){
    data.meta.customAPUs = {};
  }

  try{
    data.meta.customInsumos = data.meta.customInsumos.map(normalizeCustomInsumoRecord);
  }catch(_){
    data.meta.customInsumos = [];
  }

  if(!data.projects) data.projects = [];

  data.projects = data.projects.map(p => normalizeProject(p));

  data.meta.version = 13;
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
  const rec = normalizeCustomInsumoRecord({
    id: uid("ins"),
    tipo,
    desc,
    unit,
    pu
  });
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
  const rec = normalizeCustomAPURecord(apu || {});
  db.meta.customAPUs[rec.code] = rec;
  saveStore(db);
  return db.meta.customAPUs[rec.code];
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

    adminPct: 18,
    imprevPct: 2,
    utilPct: 5,
    ivaUtilPct: 19,

    aiuPct: 25,
    ivaPct: 19,
    ivaBase: "sobre_directo_aiu",

    logoDataUrl: "",
    instPais: "",
    instDepto: "",
    instMunicipio: "",
    instEntidad: "",
    instProyectoLabel: "",
    instFechaElab: "",

    chapters: [],

    items: [],
    apuOverrides: {},
    facturacion: [],
    actasParciales: [],
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
   Chapters (por proyecto)
   ========================= */
function listProjectChapters(projectId){
  const p = getProjectById(projectId);
  return (p && Array.isArray(p.chapters)) ? p.chapters : [];
}

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

  it.id = safeStr(it.id) || uid("it");
  it.code = safeStr(it.code);
  it.desc = safeStr(it.desc);
  it.unit = safeStr(it.unit);
  it.pu = toNum(it.pu, 0);
  it.qty = toNum(it.qty, 0);

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

  next.id = safeStr(next.id) || uid("it");
  next.code = safeStr(next.code);
  next.desc = safeStr(next.desc);
  next.unit = safeStr(next.unit);
  next.pu = toNum(next.pu, 0);
  next.qty = toNum(next.qty, 0);

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

function updateItemsPUByApuRefCode(projectId, apuRefCode, newPU){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return 0;

  const ref = String(apuRefCode||"").trim();
  let count = 0;

  for(const it of (db.projects[pidx].items||[])){
    const currentRef = normalizeApuRefCode(it?.apuRefCode) || safeStr(it?.code);
    if(String(currentRef).trim() === ref){
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
    lines: Array.isArray(lines) ? lines.map(normalizeApuLine) : []
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
   FACTURACIÓN
   ========================= */
function listFacturacion(projectId, categoria=""){
  const p = getProjectById(projectId);
  if(!p) return [];
  const rows = Array.isArray(p.facturacion) ? p.facturacion : [];
  const cat = safeStr(categoria);
  if(!cat) return rows.slice();
  const norm = normalizeFactCategory(cat);
  return rows.filter(r => normalizeFactCategory(r.categoria) === norm);
}

function addFacturacion(projectId, payload){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return null;

  const p = db.projects[pidx];
  if(!Array.isArray(p.facturacion)) p.facturacion = [];

  const rec = normalizeFacturacionRegistro(payload || {});
  p.facturacion.unshift(rec);
  p.updatedAt = nowISO();

  db.projects[pidx] = normalizeProject(p);
  saveStore(db);
  return rec;
}

function updateFacturacion(projectId, facturaId, patch){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return null;

  const p = db.projects[pidx];
  if(!Array.isArray(p.facturacion)) p.facturacion = [];

  const idx = p.facturacion.findIndex(r => String(r.id) === String(facturaId));
  if(idx === -1) return null;

  const merged = {
    ...p.facturacion[idx],
    ...(patch || {})
  };
  p.facturacion[idx] = normalizeFacturacionRegistro(merged);
  p.updatedAt = nowISO();

  db.projects[pidx] = normalizeProject(p);
  saveStore(db);
  return p.facturacion[idx];
}

function deleteFacturacion(projectId, facturaId){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return false;

  const p = db.projects[pidx];
  if(!Array.isArray(p.facturacion)) p.facturacion = [];

  const before = p.facturacion.length;
  p.facturacion = p.facturacion.filter(r => String(r.id) !== String(facturaId));

  const changed = p.facturacion.length !== before;
  if(changed){
    p.updatedAt = nowISO();
    db.projects[pidx] = normalizeProject(p);
    saveStore(db);
  }
  return changed;
}

function sumFacturacionByCategoria(projectId){
  const rows = listFacturacion(projectId);
  const out = {};
  for(const r of rows){
    const cat = normalizeFactCategory(r.categoria);
    out[cat] = Number(out[cat]||0) + Number(r.valor||0);
  }
  return out;
}

/* =========================
   ACTAS PARCIALES
   ========================= */
function listActasParciales(projectId){
  const p = getProjectById(projectId);
  if(!p) return [];
  return Array.isArray(p.actasParciales) ? p.actasParciales.slice() : [];
}

function getActaParcial(projectId, actaId){
  const p = getProjectById(projectId);
  if(!p || !Array.isArray(p.actasParciales)) return null;
  return p.actasParciales.find(a => String(a.id) === String(actaId)) || null;
}

function upsertActaParcial(projectId, payload){
  const db = loadStore();
  const pidx = db.projects.findIndex(p => p.id === projectId);
  if(pidx === -1) return null;

  const p = db.projects[pidx];
  if(!Array.isArray(p.actasParciales)) p.actasParciales = [];

  const rec = normalizeActaParcial({
    ...(payload || {}),
    updatedAt: nowISO()
  });

  const idx = p.actasParciales.findIndex(a => String(a.id) === String(rec.id));

  if(idx >= 0){
    rec.createdAt = safeStr(p.actasParciales[idx]?.createdAt) || rec.createdAt || nowISO();
    p.actasParciales[idx] = rec;
  }else{
    p.actasParciales.unshift(rec);
  }

  p.actasParciales = normalizeActasParciales(p.actasParciales);
  p.updatedAt = nowISO();

  db.projects[pidx] = normalizeProject(p);
  saveStore(db);
  return p.actasParciales.find(a => String(a.id) === String(rec.id)) || rec;
}

function saveActaParcialDetalle(projectId, actaId, lines){
  const db = loadStore();
  const pidx = db.projects.findIndex(p => p.id === projectId);
  if(pidx === -1) return null;

  const p = db.projects[pidx];
  if(!Array.isArray(p.actasParciales)) p.actasParciales = [];

  const idx = p.actasParciales.findIndex(a => String(a.id) === String(actaId));
  if(idx === -1) return null;

  const current = p.actasParciales[idx];
  const normalizedLines = Array.isArray(lines) ? lines.map(normalizeActaLine) : [];
  const totalValor = normalizedLines.reduce((acc, line)=> acc + toNum(line?.parcial, 0), 0);

  p.actasParciales[idx] = normalizeActaParcial({
    ...current,
    lines: normalizedLines,
    totalLineas: normalizedLines.length,
    totalValor,
    updatedAt: nowISO()
  });

  p.actasParciales = normalizeActasParciales(p.actasParciales);
  p.updatedAt = nowISO();

  db.projects[pidx] = normalizeProject(p);
  saveStore(db);
  return p.actasParciales.find(a => String(a.id) === String(actaId)) || null;
}

function deleteActaParcial(projectId, actaId){
  const db = loadStore();
  const pidx = db.projects.findIndex(p => p.id === projectId);
  if(pidx === -1) return false;

  const p = db.projects[pidx];
  if(!Array.isArray(p.actasParciales)) p.actasParciales = [];

  const before = p.actasParciales.length;
  p.actasParciales = p.actasParciales.filter(a => String(a.id) !== String(actaId));

  const changed = p.actasParciales.length !== before;
  if(changed){
    p.updatedAt = nowISO();
    db.projects[pidx] = normalizeProject(p);
    saveStore(db);
  }
  return changed;
}

function clearActaParcialLines(projectId, actaId){
  return saveActaParcialDetalle(projectId, actaId, []);
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

    adminPct: Number(payload.adminPct ?? 18),
    imprevPct: Number(payload.imprevPct ?? 2),
    utilPct: Number(payload.utilPct ?? 5),
    ivaUtilPct: Number(payload.ivaUtilPct ?? 19),

    aiuPct: Number(payload.aiuPct||0),
    ivaPct: Number(payload.ivaPct||0),
    ivaBase: payload.ivaBase || "sobre_directo_aiu",

    logoDataUrl: payload.logoDataUrl || "",
    instPais: payload.instPais || "",
    instDepto: payload.instDepto || "",
    instMunicipio: payload.instMunicipio || "",
    instEntidad: payload.instEntidad || "",
    instProyectoLabel: payload.instProyectoLabel || "",
    instFechaElab: payload.instFechaElab || "",

    chapters: Array.isArray(payload.chapters) ? payload.chapters : [],
    facturacion: normalizeFacturacion(payload.facturacion),
    actasParciales: normalizeActasParciales(payload.actasParciales)
  });

  const items = Array.isArray(payload.items) ? payload.items : [];
  const mapped = items.map(it => ({
    id: uid("it"),
    chapterCode: safeStr(it.chapterCode || ""),
    chapterName: safeStr(it.chapterName || ""),
    apuRefCode: normalizeApuRefCode(it.apuRefCode) || safeStr(it.code || ""),
    code: safeStr(it.code || ""),
    desc: safeStr(it.desc || ""),
    unit: safeStr(it.unit || ""),
    pu: Number(it.pu||0),
    qty: Number(it.qty||0)
  }));

  updateProject(base.id, {
    items: mapped,
    apuOverrides: {},
    facturacion: normalizeFacturacion(payload.facturacion),
    actasParciales: normalizeActasParciales(payload.actasParciales)
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

  listProjectChapters, upsertProjectChapter, deleteProjectChapter,

  addItem, updateItem, deleteItem,
  updateItemsPUByCode,
  updateItemsPUByApuRefCode,

  getApuOverride, setApuOverride, clearApuOverride,

  listFacturacion, addFacturacion, updateFacturacion, deleteFacturacion, sumFacturacionByCategoria,

  listActasParciales,
  getActaParcial,
  upsertActaParcial,
  saveActaParcialDetalle,
  deleteActaParcial,
  clearActaParcialLines,

  importProjectAsNew
};