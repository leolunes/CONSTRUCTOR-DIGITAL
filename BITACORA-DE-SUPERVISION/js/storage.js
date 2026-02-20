// js/storage.js
const STORE_KEY = "bitacora_supervision_v1";

function nowISO(){ return new Date().toISOString(); }
function getYear(){ return new Date().getFullYear(); }
function uid(prefix="id"){ return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`; }

function loadStore(){
  const raw = localStorage.getItem(STORE_KEY);
  if(!raw){
    const init = {
      meta:{createdAt:nowISO(),version:1},
      radicados:{},
      obras:[],
      visitas:[],
      hallazgos:[]
    };
    localStorage.setItem(STORE_KEY, JSON.stringify(init));
    return init;
  }
  try{
    const db = JSON.parse(raw);

    if (!db.meta) db.meta = { createdAt: nowISO(), version: 1 };
    if (!db.radicados) db.radicados = {};
    if (!db.obras) db.obras = [];
    if (!db.visitas) db.visitas = [];
    if (!db.hallazgos) db.hallazgos = [];

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
  return { url, filename:`backup_bitacora_${getYear()}_${Date.now()}.json` };
}

async function importBackupFromFile(file){
  const text = await file.text();
  const data = JSON.parse(text);
  if(!data || !data.obras || !data.visitas || !data.hallazgos) throw new Error("Backup inválido.");
  saveStore(data);
  return true;
}

function resetAll(){ localStorage.removeItem(STORE_KEY); }

function nextRadicado(){
  const db = loadStore();
  const y = String(getYear());
  const last = Number(db.radicados[y] || 0) + 1;
  db.radicados[y] = last;
  saveStore(db);
  return `SUP-FLOR-${y}-${String(last).padStart(4,"0")}`;
}

/* ===== Obras ===== */
function createObra(payload){
  const db = loadStore();
  const obra = { id:uid("obra"), creadoEn:nowISO(), actualizadoEn: nowISO(), ...payload };
  db.obras.unshift(obra);
  saveStore(db);
  return obra;
}

function updateObra(obraId, patch){
  const db = loadStore();
  const idx = db.obras.findIndex(o=>o.id===obraId);
  if(idx===-1) return null;
  db.obras[idx] = { ...db.obras[idx], ...patch, actualizadoEn: nowISO() };
  saveStore(db);
  return db.obras[idx];
}

function listObras(){ return loadStore().obras; }
function getObraById(id){ return loadStore().obras.find(o=>o.id===id) || null; }

function deleteObra(obraId){
  const db = loadStore();
  db.obras = db.obras.filter(o=>o.id!==obraId);
  db.visitas = db.visitas.filter(v=>v.obraId!==obraId);
  db.hallazgos = db.hallazgos.filter(h=>h.obraId!==obraId);
  saveStore(db);
}

/* ===== Visitas ===== */
function createVisita(payload){
  const db = loadStore();
  const visita = { id:uid("visita"), creadoEn:nowISO(), ...payload };
  db.visitas.unshift(visita);
  saveStore(db);
  return visita;
}
function listVisitasByObra(obraId){
  return loadStore().visitas
    .filter(v=>v.obraId===obraId)
    .sort((a,b)=>(b.fecha||"").localeCompare(a.fecha||""));
}
function getVisitaById(visitaId){ return loadStore().visitas.find(v=>v.id===visitaId) || null; }

/* ===== Hallazgos ===== */
function createHallazgosBulk(items){
  const db = loadStore();
  for(const h of items) db.hallazgos.unshift(h);
  saveStore(db);
}
function listHallazgosByObra(obraId){ return loadStore().hallazgos.filter(h=>h.obraId===obraId); }
function getHallazgoById(hallazgoId){ return loadStore().hallazgos.find(h=>h.id===hallazgoId) || null; }
function closeHallazgo(hallazgoId, cierre){
  const db = loadStore();
  const idx = db.hallazgos.findIndex(h=>h.id===hallazgoId);
  if(idx===-1) return false;
  db.hallazgos[idx] = {
    ...db.hallazgos[idx],
    estado:"cerrado",
    cerradoEn: cierre.fechaCierre,
    cierreObs: cierre.obsCierre || "",
    evidenciasCierre: cierre.evidenciasCierre || [],
    actualizadoEn: nowISO()
  };
  saveStore(db);
  return true;
}

/* ===== KPIs ===== */
function kpisGlobales(){
  const db = loadStore();
  const obrasActivas = db.obras.filter(o=>(o.estado||"activa")==="activa").length;
  const totalVisitas = db.visitas.length;
  const abiertos = db.hallazgos.filter(h=>h.estado!=="cerrado").length;
  const cerrados = db.hallazgos.filter(h=>h.estado==="cerrado").length;
  return { obrasActivas, totalVisitas, abiertos, cerrados };
}
function kpisObra(obraId){
  const visitas = listVisitasByObra(obraId);
  const hallazgos = listHallazgosByObra(obraId);
  const abiertos = hallazgos.filter(h=>h.estado!=="cerrado").length;
  const cerrados = hallazgos.filter(h=>h.estado==="cerrado").length;
  return { visitas: visitas.length, abiertos, cerrados };
}

window.StorageAPI = {
  nowISO, uid,
  loadStore, saveStore,
  exportBackup, importBackupFromFile, resetAll,
  nextRadicado,
  createObra, updateObra, listObras, getObraById, deleteObra,
  createVisita, listVisitasByObra, getVisitaById,
  createHallazgosBulk, listHallazgosByObra, getHallazgoById, closeHallazgo,
  kpisGlobales, kpisObra
};