// js/db.js - Archivos del proyecto / actas en IndexedDB (VERSIÓN ESTABLE MÓVIL)

const DB = (() => {

  const DB_NAME = "presupuesto_contable_files_v2";
  const DB_VER = 2;
  const STORE = "files";

  let _dbPromise = null;

  /* =========================
     Solicitar almacenamiento persistente
     (evita que el navegador borre datos)
  ========================= */

  function requestPersistentStorage(){
    try{
      if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(() => {});
      }
    }catch(_){}
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

        if (db.objectStoreNames.contains(STORE)) {
          db.deleteObjectStore(STORE);
        }

        const st = db.createObjectStore(STORE, { keyPath: "id" });

        st.createIndex("by_owner", ["ownerType", "ownerId"], { unique: false });
        st.createIndex("by_owner_kind", ["ownerType", "ownerId", "kind"], { unique: false });
        st.createIndex("by_kind", "kind", { unique: false });
        st.createIndex("by_createdAt", "createdAt", { unique: false });
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

  function uid(prefix = "file") {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  }

  async function store(mode = "readonly") {
    const db = await open();
    const tx = db.transaction(STORE, mode);

    tx.onerror = () => {
      console.warn("IndexedDB transaction error:", tx.error);
    };

    return tx.objectStore(STORE);
  }

  function cleanMeta(rec){
    if (!rec) return null;
    const { blob, ...meta } = rec;
    return meta;
  }

  /* =========================
     Guardar archivo
  ========================= */

  async function putFile({ ownerType, ownerId, kind, name, mime, size, blob, extra }) {
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
      extra: extra && typeof extra === "object" ? extra : {},
      blob
    };

    const st = await store("readwrite");

    await new Promise((res, rej) => {
      const r = st.put(record);
      r.onsuccess = () => res(true);
      r.onerror = () => rej(r.error || new Error("No se pudo guardar archivo en IDB"));
    });

    return cleanMeta(record);
  }

  /* =========================
     Obtener archivo
  ========================= */

  async function getFile(id) {
    const st = await store("readonly");

    return await new Promise((res, rej) => {
      const r = st.get(id);
      r.onsuccess = () => res(r.result || null);
      r.onerror = () => rej(r.error || new Error("No se pudo leer archivo de IDB"));
    });
  }

  /* =========================
     Obtener solo metadatos
  ========================= */

  async function getFileMeta(id) {
    const rec = await getFile(id);
    return cleanMeta(rec);
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
     Listar archivos por owner
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
          out.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
          return res(out);
        }

        out.push(cleanMeta(cur.value));
        cur.continue();
      };

      r.onerror = () => rej(r.error || new Error("No se pudo listar archivos por owner"));
    });
  }

  /* =========================
     Listar archivos por owner + kind
  ========================= */

  async function listFilesByOwnerAndKind(ownerType, ownerId, kind) {
    const st = await store("readonly");
    const idx = st.index("by_owner_kind");
    const out = [];

    return await new Promise((res, rej) => {
      const r = idx.openCursor(IDBKeyRange.only([ownerType, ownerId, kind]));

      r.onsuccess = () => {
        const cur = r.result;
        if (!cur) {
          out.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
          return res(out);
        }

        out.push(cleanMeta(cur.value));
        cur.continue();
      };

      r.onerror = () => rej(r.error || new Error("No se pudo listar archivos por owner y kind"));
    });
  }

  /* =========================
     Borrar archivos por owner
  ========================= */

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

  /* =========================
     Borrar archivos por owner + kind
  ========================= */

  async function deleteFilesByOwnerAndKind(ownerType, ownerId, kind) {
    const st = await store("readwrite");
    const idx = st.index("by_owner_kind");
    const ids = [];

    await new Promise((res, rej) => {
      const r = idx.openCursor(IDBKeyRange.only([ownerType, ownerId, kind]));

      r.onsuccess = () => {
        const cur = r.result;
        if (!cur) return res(true);
        ids.push(cur.value.id);
        cur.continue();
      };

      r.onerror = () => rej(r.error || new Error("No se pudo recorrer owner + kind"));
    });

    for (const id of ids) {
      await new Promise((res, rej) => {
        const d = st.delete(id);
        d.onsuccess = () => res(true);
        d.onerror = () => rej(d.error || new Error("No se pudo borrar archivo de owner + kind"));
      });
    }

    return true;
  }

  /* =========================
     Contadores útiles
  ========================= */

  async function countFilesByOwner(ownerType, ownerId) {
    const files = await listFilesByOwner(ownerType, ownerId);
    return files.length;
  }

  async function countFilesByOwnerAndKind(ownerType, ownerId, kind) {
    const files = await listFilesByOwnerAndKind(ownerType, ownerId, kind);
    return files.length;
  }

  return {
    open,
    putFile,
    getFile,
    getFileMeta,
    deleteFile,
    listFilesByOwner,
    listFilesByOwnerAndKind,
    deleteFilesByOwner,
    deleteFilesByOwnerAndKind,
    countFilesByOwner,
    countFilesByOwnerAndKind
  };

})();

window.DB = DB;