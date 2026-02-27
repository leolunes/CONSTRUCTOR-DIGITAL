const STORE_KEY = "presupuesto_pro_v1";

function nowISO(){ return new Date().toISOString(); }
function uid(prefix="id"){ return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`; }

function loadStore(){
  const raw = localStorage.getItem(STORE_KEY);
  if(!raw){
    const init = {
      meta:{
        createdAt: nowISO(),
        version: 4,

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
    localStorage.setItem(STORE_KEY, JSON.stringify(init));
    return init;
  }
  try{
    const db = JSON.parse(raw);
    if(!db.meta) db.meta = { createdAt:nowISO(), version:4 };

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
    // ✅ asegurar apuOverrides por proyecto
    for(const p of db.projects){
      if(!p.apuOverrides) p.apuOverrides = {}; // { "1.01": { lines:[...], updatedAt } }
    }

    localStorage.setItem(STORE_KEY, JSON.stringify(db));
    return db;
  }catch{
    localStorage.removeItem(STORE_KEY);
    return loadStore();
  }
}

function saveStore(db){ localStorage.setItem(STORE_KEY, JSON.stringify(db)); }

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
  if(!data.meta) data.meta = { createdAt:nowISO(), version:4 };
  if(!data.meta.customAPUs) data.meta.customAPUs = {};
  if(!data.meta.customInsumos) data.meta.customInsumos = [];
  if(!data.meta.elaborador) data.meta.elaborador = { nombre:"", profesion:"", matricula:"", firmaDataUrl:"" };
  if(!data.projects) data.projects = [];
  for(const p of data.projects){
    if(!p.apuOverrides) p.apuOverrides = {};
  }
  saveStore(data);
  return true;
}

function resetAll(){ localStorage.removeItem(STORE_KEY); }

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
  const p = {
    id: uid("proj"),
    createdAt: nowISO(),
    updatedAt: nowISO(),
    currency: "COP",
    aiuPct: 25,
    ivaPct: 19,
    ivaBase: "sobre_directo_aiu",
    items: [],
    apuOverrides: {}, // ✅ override APU por proyecto
    ...payload
  };
  db.projects.unshift(p);
  saveStore(db);
  return p;
}

function updateProject(id, patch){
  const db = loadStore();
  const idx = db.projects.findIndex(p=>p.id===id);
  if(idx===-1) return null;
  db.projects[idx] = { ...db.projects[idx], ...patch, updatedAt: nowISO() };
  if(!db.projects[idx].apuOverrides) db.projects[idx].apuOverrides = {};
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

/* ===== Items ===== */
function addItem(projectId, item){
  const db = loadStore();
  const idx = db.projects.findIndex(p=>p.id===projectId);
  if(idx===-1) return null;

  const code = String(item.code || "").trim();
  const defaultChap = code.includes(".") ? code.split(".")[0] : (code || "");

  const it = {
    id: uid("it"),
    chapterCode: item.chapterCode || (defaultChap && /^\d+$/.test(defaultChap) ? defaultChap : ""),
    chapterName: item.chapterName || "",
    code: "",
    desc: "",
    unit: "",
    pu: 0,
    qty: 0,
    ...item
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

  const iidx = (db.projects[pidx].items||[]).findIndex(i=>i.id===itemId);
  if(iidx===-1) return null;

  const cur = db.projects[pidx].items[iidx];
  const next = { ...cur, ...patch };

  if(patch.code && !patch.chapterCode){
    const code = String(patch.code).trim();
    const ch = code.includes(".") ? code.split(".")[0] : "";
    if(/^\d+$/.test(ch)) next.chapterCode = ch;
  }

  db.projects[pidx].items[iidx] = next;
  db.projects[pidx].updatedAt = nowISO();
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

// ✅ NUEVO: actualizar PU de todos los ítems por código dentro del proyecto
function updateItemsPUByCode(projectId, code, newPU){
  const db = loadStore();
  const pidx = db.projects.findIndex(p=>p.id===projectId);
  if(pidx===-1) return 0;

  const c = String(code||"").trim();
  let count = 0;
  for(const it of (db.projects[pidx].items||[])){
    if(String(it.code||"").trim() === c){
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
   ✅ Override APU por proyecto
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
   ✅ Importar proyecto como NUEVO
   ========================= */
function importProjectAsNew(projectObj){
  if(!projectObj) throw new Error("Proyecto inválido");
  const payload = { ...projectObj };

  const base = createProject({
    name: payload.name || "Proyecto importado",
    entity: payload.entity || "",
    location: payload.location || "",
    currency: payload.currency || "COP",
    aiuPct: Number(payload.aiuPct||0),
    ivaPct: Number(payload.ivaPct||0),
    ivaBase: payload.ivaBase || "sobre_directo_aiu"
  });

  // reemplazar items con IDs nuevos
  const items = Array.isArray(payload.items) ? payload.items : [];
  const mapped = items.map(it => ({
    id: uid("it"),
    chapterCode: it.chapterCode || "",
    chapterName: it.chapterName || "",
    code: it.code || "",
    desc: it.desc || "",
    unit: it.unit || "",
    pu: Number(it.pu||0),
    qty: Number(it.qty||0)
  }));

  updateProject(base.id, {
    items: mapped,
    apuOverrides: {} // overrides NO se importan por defecto (si los quieres, se puede)
  });

  return getProjectById(base.id);
}

window.StorageAPI = {
  loadStore, saveStore,
  exportBackup, importBackupFromFile, resetAll,

  getElaborador, setElaborador, clearFirma,

  listCustomInsumos, addCustomInsumo,
  getCustomAPU, upsertCustomAPU, listCustomAPUs,

  createProject, updateProject, listProjects, getProjectById, deleteProject,

  addItem, updateItem, deleteItem,
  updateItemsPUByCode,

  // ✅ overrides
  getApuOverride, setApuOverride, clearApuOverride,

  // ✅ import proyecto nuevo
  importProjectAsNew
};