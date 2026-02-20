// js/db.js
// IndexedDB wrapper para archivos (documentos + evidencias)

const DB = (() => {
  const DB_NAME = "bitacora_supervision_files_v1";
  const DB_VER = 1;
  const STORE = "files";

  let _dbPromise = null;

  function open() {
    if (_dbPromise) return _dbPromise;

    _dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VER);

      req.onupgradeneeded = () => {
        const db = req.result;

        if (!db.objectStoreNames.contains(STORE)) {
          const st = db.createObjectStore(STORE, { keyPath: "id" });

          // ownerType + ownerId => listar por obra/visita/hallazgo
          st.createIndex("by_owner", ["ownerType", "ownerId"], { unique: false });

          // kind => doc_obra, doc_interventoria, evidencia_visita, etc.
          st.createIndex("by_kind", "kind", { unique: false });

          st.createIndex("by_createdAt", "createdAt", { unique: false });
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error("No se pudo abrir IndexedDB"));
    });

    return _dbPromise;
  }

  function uid(prefix = "file") {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  }

  async function store(mode = "readonly") {
    const db = await open();
    return db.transaction(STORE, mode).objectStore(STORE);
  }

  async function putFile({ ownerType, ownerId, kind, name, mime, size, blob }) {
    if (!ownerType || !ownerId) throw new Error("putFile: ownerType/ownerId requeridos");
    if (!blob) throw new Error("putFile: blob requerido");

    const record = {
      id: uid("idb"),
      ownerType,
      ownerId,
      kind: kind || "file",
      name: name || "archivo",
      mime: mime || "application/octet-stream",
      size: Number(size || blob.size || 0),
      createdAt: new Date().toISOString(),
      blob
    };

    const st = await store("readwrite");
    await new Promise((res, rej) => {
      const r = st.put(record);
      r.onsuccess = () => res(true);
      r.onerror = () => rej(r.error || new Error("No se pudo guardar archivo en IDB"));
    });

    const { blob: _b, ...meta } = record;
    return meta;
  }

  async function getFile(id) {
    const st = await store("readonly");
    return await new Promise((res, rej) => {
      const r = st.get(id);
      r.onsuccess = () => res(r.result || null);
      r.onerror = () => rej(r.error || new Error("No se pudo leer archivo de IDB"));
    });
  }

  async function deleteFile(id) {
    const st = await store("readwrite");
    return await new Promise((res, rej) => {
      const r = st.delete(id);
      r.onsuccess = () => res(true);
      r.onerror = () => rej(r.error || new Error("No se pudo borrar archivo de IDB"));
    });
  }

  async function listFilesByOwner(ownerType, ownerId) {
    const st = await store("readonly");
    const idx = st.index("by_owner");
    const out = [];

    return await new Promise((res, rej) => {
      const r = idx.openCursor(IDBKeyRange.only([ownerType, ownerId]));
      r.onsuccess = () => {
        const cur = r.result;
        if (!cur) return res(out);

        const rec = cur.value;
        const { blob, ...meta } = rec;
        out.push(meta);

        cur.continue();
      };
      r.onerror = () => rej(r.error || new Error("No se pudo listar archivos por owner"));
    });
  }

  async function deleteFilesByOwner(ownerType, ownerId) {
    const st = await store("readwrite");
    const idx = st.index("by_owner");

    const ids = [];
    await new Promise((res, rej) => {
      const r = idx.openCursor(IDBKeyRange.only([ownerType, ownerId]));
      r.onsuccess = () => {
        const cur = r.result;
        if (!cur) return res(true);
        ids.push(cur.value.id);
        cur.continue();
      };
      r.onerror = () => rej(r.error || new Error("No se pudo recorrer owner"));
    });

    for (const id of ids) {
      await new Promise((res, rej) => {
        const d = st.delete(id);
        d.onsuccess = () => res(true);
        d.onerror = () => rej(d.error || new Error("No se pudo borrar archivo de owner"));
      });
    }
    return true;
  }

  return {
    open,
    putFile,
    getFile,
    deleteFile,
    listFilesByOwner,
    deleteFilesByOwner
  };
})();

window.DB = DB;