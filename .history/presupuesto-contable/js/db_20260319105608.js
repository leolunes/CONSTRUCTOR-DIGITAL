// js/db.js - Archivos del proyecto en IndexedDB (VERSIÓN AJUSTADA PARA PRESUPUESTO DUAL)

const DB = (() => {

  const DB_NAME = "presupuesto_contable_files_v1";
  const DB_VER = 2;
  const STORE = "files";

  const BUDGET_OFICIAL = "oficial";
  const BUDGET_CONTRATISTA = "contratista";
  const DEFAULT_BUDGET = BUDGET_CONTRATISTA;

  let _dbPromise = null;

  function nowISO(){
    return new Date().toISOString();
  }

  function uid(prefix = "file") {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  }

  function safeStr(v){
    return String(v ?? "").trim();
  }

  function normalizeBudgetKey(v){
    const s = safeStr(v).toLowerCase();
    if(s === BUDGET_OFICIAL) return BUDGET_OFICIAL;
    return BUDGET_CONTRATISTA;
  }

  function requestPersistentStorage(){
    try{
      if(navigator.storage && navigator.storage.persist){
        navigator.storage.persist().catch(()=>{});
      }
    }catch(_){}
  }

  function ensureRecordShape(rec){
    const row = rec || {};

    row.id = safeStr(row.id) || uid("idb");
    row.ownerType = safeStr(row.ownerType);
    row.ownerId = safeStr(row.ownerId);
    row.kind = safeStr(row.kind) || "file";
    row.name = safeStr(row.name) || "archivo";
    row.mime = safeStr(row.mime) || "application/octet-stream";
    row.size = Number(row.size || 0);
    row.createdAt = safeStr(row.createdAt) || nowISO();

    /* Nuevo: soporte de contexto documental */
    row.projectId = safeStr(row.projectId || (row.ownerType === "project" ? row.ownerId : ""));
    row.budgetKey = normalizeBudgetKey(row.budgetKey || DEFAULT_BUDGET);
    row.scope = safeStr(row.scope || "project"); 
    // project | presupuesto | auditoria | general

    row.label = safeStr(row.label || "");
    row.description = safeStr(row.description || "");

    return row;
  }

  function stripBlob(rec){
    if(!rec) return null;
    const { blob, ...meta } = rec;
    return meta;
  }

  /* =========================
     Abrir base de datos
  ========================= */
  function open() {

    requestPersistentStorage();

    if (_dbPromise) return _dbPromise;

    _dbPromise = new Promise((resolve, reject) => {

      const req = indexedDB.open(DB_NAME, DB_VER);

      req.onupgradeneeded = () => {

        const db = req.result;

        let st = null;

        if (!db.objectStoreNames.contains(STORE)) {
          st = db.createObjectStore(STORE, { keyPath: "id" });
        } else {
          st = req.transaction.objectStore(STORE);
        }

        if (!st.indexNames.contains("by_owner")) {
          st.createIndex("by_owner", ["ownerType", "ownerId"], { unique: false });
        }

        if (!st.indexNames.contains("by_kind")) {
          st.createIndex("by_kind", "kind", { unique: false });
        }

        if (!st.indexNames.contains("by_createdAt")) {
          st.createIndex("by_createdAt", "createdAt", { unique: false });
        }

        /* Nuevos índices */
        if (!st.indexNames.contains("by_project")) {
          st.createIndex("by_project", "projectId", { unique: false });
        }

        if (!st.indexNames.contains("by_budget")) {
          st.createIndex("by_budget", ["projectId", "budgetKey"], { unique: false });
        }

        if (!st.indexNames.contains("by_scope")) {
          st.createIndex("by_scope", ["projectId", "scope"], { unique: false });
        }

        if (!st.indexNames.contains("by_project_budget_kind")) {
          st.createIndex("by_project_budget_kind", ["projectId", "budgetKey", "kind"], { unique: false });
        }
      };

      req.onsuccess = () => {

        const db = req.result;

        db.onclose = () => {
          _dbPromise = null;
        };

        resolve(db);
      };

      req.onerror = () => {
        _dbPromise = null;
        reject(req.error || new Error("No se pudo abrir IndexedDB"));
      };

    });

    return _dbPromise;
  }

  async function store(mode = "readonly") {
    const db = await open();
    const tx = db.transaction(STORE, mode);

    tx.onerror = () => {
      console.warn("IndexedDB transaction error:", tx.error);
    };

    return tx.objectStore(STORE);
  }

  /* =========================
     Guardar archivo
  ========================= */
  async function putFile({
    ownerType,
    ownerId,
    kind,
    name,
    mime,
    size,
    blob,

    /* nuevos */
    projectId,
    budgetKey,
    scope,
    label,
    description
  }) {

    if (!ownerType || !ownerId) throw new Error("putFile: ownerType/ownerId requeridos");
    if (!blob) throw new Error("putFile: blob requerido");

    const record = ensureRecordShape({
      id: uid("idb"),

      ownerType,
      ownerId,
      kind,
      name,
      mime,
      size: Number(size || blob.size || 0),
      createdAt: nowISO(),

      projectId: projectId || (ownerType === "project" ? ownerId : ""),
      budgetKey,
      scope,
      label,
      description,

      blob
    });

    const st = await store("readwrite");

    await new Promise((res, rej) => {
      const r = st.put(record);
      r.onsuccess = () => res(true);
      r.onerror = () => rej(r.error || new Error("No se pudo guardar archivo en IDB"));
    });

    return stripBlob(record);
  }

  /* =========================
     Actualizar metadatos de archivo
  ========================= */
  async function updateFileMeta(id, patch = {}) {
    const st = await store("readwrite");

    const current = await new Promise((res, rej) => {
      const r = st.get(id);
      r.onsuccess = () => res(r.result || null);
      r.onerror = () => rej(r.error || new Error("No se pudo leer archivo para actualizar"));
    });

    if(!current) return null;

    const next = ensureRecordShape({
      ...current,
      ...patch,
      id: current.id,
      blob: current.blob
    });

    await new Promise((res, rej) => {
      const r = st.put(next);
      r.onsuccess = () => res(true);
      r.onerror = () => rej(r.error || new Error("No se pudo actualizar metadatos del archivo"));
    });

    return stripBlob(next);
  }

  /* =========================
     Obtener archivo
  ========================= */
  async function getFile(id) {
    const st = await store("readonly");

    return await new Promise((res, rej) => {
      const r = st.get(id);
      r.onsuccess = () => {
        const row = r.result || null;
        if(!row) return res(null);
        res(ensureRecordShape(row));
      };
      r.onerror = () => rej(r.error || new Error("No se pudo leer archivo de IDB"));
    });
  }

  /* =========================
     Borrar archivo
  ========================= */
  async function deleteFile(id) {
    const st = await store("readwrite");

    return await new Promise((res, rej) => {
      const r = st.delete(id);
      r.onsuccess = () => res(true);
      r.onerror = () => rej(r.error || new Error("No se pudo borrar archivo de IDB"));
    });
  }

  /* =========================
     Listar archivos de owner
  ========================= */
  async function listFilesByOwner(ownerType, ownerId) {
    const st = await store("readonly");
    const idx = st.index("by_owner");
    const out = [];

    return await new Promise((res, rej) => {
      const r = idx.openCursor(IDBKeyRange.only([ownerType, ownerId]));

      r.onsuccess = () => {
        const cur = r.result;
        if (!cur) {
          out.sort((a,b)=> String(b.createdAt).localeCompare(String(a.createdAt)));
          return res(out);
        }

        out.push(stripBlob(ensureRecordShape(cur.value)));
        cur.continue();
      };

      r.onerror = () => rej(r.error || new Error("No se pudo listar archivos por owner"));
    });
  }

  /* =========================
     Listar archivos por proyecto
  ========================= */
  async function listFilesByProject(projectId) {
    const pid = safeStr(projectId);
    if(!pid) return [];

    const st = await store("readonly");
    const idx = st.index("by_project");
    const out = [];

    return await new Promise((res, rej) => {
      const r = idx.openCursor(IDBKeyRange.only(pid));

      r.onsuccess = () => {
        const cur = r.result;
        if(!cur){
          out.sort((a,b)=> String(b.createdAt).localeCompare(String(a.createdAt)));
          return res(out);
        }

        out.push(stripBlob(ensureRecordShape(cur.value)));
        cur.continue();
      };

      r.onerror = () => rej(r.error || new Error("No se pudo listar archivos por proyecto"));
    });
  }

  /* =========================
     Listar archivos por presupuesto
  ========================= */
  async function listFilesByBudget(projectId, budgetKey = DEFAULT_BUDGET) {
    const pid = safeStr(projectId);
    if(!pid) return [];

    const bk = normalizeBudgetKey(budgetKey);
    const st = await store("readonly");
    const idx = st.index("by_budget");
    const out = [];

    return await new Promise((res, rej) => {
      const r = idx.openCursor(IDBKeyRange.only([pid, bk]));

      r.onsuccess = () => {
        const cur = r.result;
        if(!cur){
          out.sort((a,b)=> String(b.createdAt).localeCompare(String(a.createdAt)));
          return res(out);
        }

        out.push(stripBlob(ensureRecordShape(cur.value)));
        cur.continue();
      };

      r.onerror = () => rej(r.error || new Error("No se pudo listar archivos por presupuesto"));
    });
  }

  /* =========================
     Listar por scope
  ========================= */
  async function listFilesByScope(projectId, scope = "project") {
    const pid = safeStr(projectId);
    const sc = safeStr(scope || "project");
    if(!pid) return [];

    const st = await store("readonly");
    const idx = st.index("by_scope");
    const out = [];

    return await new Promise((res, rej) => {
      const r = idx.openCursor(IDBKeyRange.only([pid, sc]));

      r.onsuccess = () => {
        const cur = r.result;
        if(!cur){
          out.sort((a,b)=> String(b.createdAt).localeCompare(String(a.createdAt)));
          return res(out);
        }

        out.push(stripBlob(ensureRecordShape(cur.value)));
        cur.continue();
      };

      r.onerror = () => rej(r.error || new Error("No se pudo listar archivos por scope"));
    });
  }

  /* =========================
     Listar por proyecto + presupuesto + tipo
  ========================= */
  async function listFilesByProjectBudgetKind(projectId, budgetKey = DEFAULT_BUDGET, kind = "file") {
    const pid = safeStr(projectId);
    const bk = normalizeBudgetKey(budgetKey);
    const kd = safeStr(kind || "file");
    if(!pid) return [];

    const st = await store("readonly");
    const idx = st.index("by_project_budget_kind");
    const out = [];

    return await new Promise((res, rej) => {
      const r = idx.openCursor(IDBKeyRange.only([pid, bk, kd]));

      r.onsuccess = () => {
        const cur = r.result;
        if(!cur){
          out.sort((a,b)=> String(b.createdAt).localeCompare(String(a.createdAt)));
          return res(out);
        }

        out.push(stripBlob(ensureRecordShape(cur.value)));
        cur.continue();
      };

      r.onerror = () => rej(r.error || new Error("No se pudo listar archivos por presupuesto/tipo"));
    });
  }

  /* =========================
     Borrar archivos de owner
  ========================= */
  async function deleteFilesByOwner(ownerType, ownerId) {
    const rows = await listFilesByOwner(ownerType, ownerId);
    for (const row of rows) {
      await deleteFile(row.id);
    }
    return true;
  }

  /* =========================
     Borrar archivos por proyecto
  ========================= */
  async function deleteFilesByProject(projectId) {
    const rows = await listFilesByProject(projectId);
    for(const row of rows){
      await deleteFile(row.id);
    }
    return true;
  }

  /* =========================
     Borrar archivos por presupuesto
  ========================= */
  async function deleteFilesByBudget(projectId, budgetKey = DEFAULT_BUDGET) {
    const rows = await listFilesByBudget(projectId, budgetKey);
    for(const row of rows){
      await deleteFile(row.id);
    }
    return true;
  }

  /* =========================
     Borrar archivos por scope
  ========================= */
  async function deleteFilesByScope(projectId, scope = "project") {
    const rows = await listFilesByScope(projectId, scope);
    for(const row of rows){
      await deleteFile(row.id);
    }
    return true;
  }

  return {
    open,

    putFile,
    getFile,
    updateFileMeta,
    deleteFile,

    listFilesByOwner,
    listFilesByProject,
    listFilesByBudget,
    listFilesByScope,
    listFilesByProjectBudgetKind,

    deleteFilesByOwner,
    deleteFilesByProject,
    deleteFilesByBudget,
    deleteFilesByScope
  };

})();

window.DB = DB;