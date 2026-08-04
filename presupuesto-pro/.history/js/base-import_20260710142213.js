// js/base-import.js
// PRESUPUESTO PRO — Gestor de múltiples Bases APU
// Mantiene el mismo formato XLSX que ya reconoce la aplicación.

(function(){
  "use strict";

  window.APUBase = window.APUBase || {};

  const CATALOG_DB_NAME = "apu_bases_catalog_v1";
  const CATALOG_DB_VER = 1;
  const CATALOG_STORE_BASES = "bases";
  const CATALOG_STORE_SETTINGS = "settings";

  const LEGACY_DB_NAME = "apu_base_v1";
  const BASE_DB_VER = 3;

  const STORE_META  = "meta";
  const STORE_ITEMS = "items";
  const STORE_CD    = "cd_lines";
  const STORE_SUB   = "sub_lines";
  const STORE_INSUM = "insumos";

  const SHEETS_REQUIRED = [
    "FORMULARIO DE PRECIOS",
    "Costos_Directos",
    "Subproductos",
    "Insumos"
  ];

  const _baseDbPromises = new Map();
  const _itemsCache = new Map();
  const _subKeysCache = new Map();

  let _catalogPromise = null;
  let _legacyChecked = false;

  function uid(prefix = "base"){
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  }

  function requestPersistentStorage(){
    try{
      if(navigator.storage && typeof navigator.storage.persist === "function"){
        navigator.storage.persist().catch(()=>{});
      }
    }catch(_){}
  }

  function requestToPromise(req, fallbackMessage){
    return new Promise((resolve, reject)=>{
      req.onsuccess = ()=>resolve(req.result);
      req.onerror = ()=>reject(req.error || new Error(fallbackMessage || "Error de IndexedDB"));
    });
  }

  function txToPromise(tx, fallbackMessage){
    return new Promise((resolve, reject)=>{
      tx.oncomplete = ()=>resolve(true);
      tx.onerror = ()=>reject(tx.error || new Error(fallbackMessage || "Error en transacción IndexedDB"));
      tx.onabort = ()=>reject(tx.error || new Error(fallbackMessage || "Transacción IndexedDB cancelada"));
    });
  }

  function openCatalog(){
    requestPersistentStorage();

    if(_catalogPromise) return _catalogPromise;

    _catalogPromise = new Promise((resolve, reject)=>{
      const req = indexedDB.open(CATALOG_DB_NAME, CATALOG_DB_VER);

      req.onupgradeneeded = ()=>{
        const db = req.result;

        if(!db.objectStoreNames.contains(CATALOG_STORE_BASES)){
          const st = db.createObjectStore(CATALOG_STORE_BASES, { keyPath:"id" });
          st.createIndex("by_name", "nameKey", { unique:false });
          st.createIndex("by_createdAt", "createdAt", { unique:false });
        }

        if(!db.objectStoreNames.contains(CATALOG_STORE_SETTINGS)){
          db.createObjectStore(CATALOG_STORE_SETTINGS, { keyPath:"key" });
        }
      };

      req.onsuccess = ()=>{
        const db = req.result;
        db.onclose = ()=>{ _catalogPromise = null; };
        db.onversionchange = ()=>{
          try{ db.close(); }catch(_){}
          _catalogPromise = null;
        };
        resolve(db);
      };

      req.onerror = ()=>{
        _catalogPromise = null;
        reject(req.error || new Error("No se pudo abrir el catálogo de Bases APU"));
      };
    });

    return _catalogPromise;
  }

  async function catalogGet(storeName, key){
    const db = await openCatalog();
    const tx = db.transaction(storeName, "readonly");
    return await requestToPromise(
      tx.objectStore(storeName).get(key),
      "No se pudo leer el catálogo"
    );
  }

  async function catalogPut(storeName, value){
    const db = await openCatalog();
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(value);
    await txToPromise(tx, "No se pudo guardar en el catálogo");
    return value;
  }

  async function catalogDelete(storeName, key){
    const db = await openCatalog();
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).delete(key);
    await txToPromise(tx, "No se pudo eliminar del catálogo");
    return true;
  }

  async function catalogGetAll(storeName){
    const db = await openCatalog();
    const tx = db.transaction(storeName, "readonly");
    const st = tx.objectStore(storeName);

    if(typeof st.getAll === "function"){
      return await requestToPromise(st.getAll(), "No se pudo listar el catálogo");
    }

    const out = [];
    await new Promise((resolve, reject)=>{
      const req = st.openCursor();
      req.onsuccess = ()=>{
        const cur = req.result;
        if(!cur) return resolve(true);
        out.push(cur.value);
        cur.continue();
      };
      req.onerror = ()=>reject(req.error || new Error("No se pudo recorrer el catálogo"));
    });
    return out;
  }

  function ensureBaseSchema(db, req){
    if(!db.objectStoreNames.contains(STORE_META)){
      db.createObjectStore(STORE_META, { keyPath:"key" });
    }

    if(!db.objectStoreNames.contains(STORE_ITEMS)){
      db.createObjectStore(STORE_ITEMS, { keyPath:"code" });
    }

    if(!db.objectStoreNames.contains(STORE_CD)){
      const st = db.createObjectStore(STORE_CD, { keyPath:"id" });
      st.createIndex("by_item", "itemCode", { unique:false });
    }else if(req?.transaction){
      const st = req.transaction.objectStore(STORE_CD);
      if(!st.indexNames.contains("by_item")){
        st.createIndex("by_item", "itemCode", { unique:false });
      }
    }

    if(!db.objectStoreNames.contains(STORE_SUB)){
      const st = db.createObjectStore(STORE_SUB, { keyPath:"id" });
      st.createIndex("by_sub", "subKey", { unique:false });
    }else if(req?.transaction){
      const st = req.transaction.objectStore(STORE_SUB);
      if(!st.indexNames.contains("by_sub")){
        st.createIndex("by_sub", "subKey", { unique:false });
      }
    }

    if(!db.objectStoreNames.contains(STORE_INSUM)){
      db.createObjectStore(STORE_INSUM, { keyPath:"key" });
    }
  }

  function openBaseDBByName(dbName){
    if(!dbName) return Promise.reject(new Error("No se indicó la Base APU"));

    if(_baseDbPromises.has(dbName)){
      return _baseDbPromises.get(dbName);
    }

    const promise = new Promise((resolve, reject)=>{
      const req = indexedDB.open(dbName, BASE_DB_VER);

      req.onupgradeneeded = ()=>{
        ensureBaseSchema(req.result, req);
      };

      req.onsuccess = ()=>{
        const db = req.result;
        db.onclose = ()=>{ _baseDbPromises.delete(dbName); };
        db.onversionchange = ()=>{
          try{ db.close(); }catch(_){}
          _baseDbPromises.delete(dbName);
        };
        resolve(db);
      };

      req.onerror = ()=>{
        _baseDbPromises.delete(dbName);
        reject(req.error || new Error("No se pudo abrir la Base APU"));
      };
    });

    _baseDbPromises.set(dbName, promise);
    return promise;
  }

  async function deleteDatabaseByName(dbName){
    if(!dbName) return true;

    try{
      const db = await _baseDbPromises.get(dbName);
      if(db) db.close();
    }catch(_){}

    _baseDbPromises.delete(dbName);

    await new Promise((resolve)=>{
      const req = indexedDB.deleteDatabase(dbName);
      req.onsuccess = ()=>resolve(true);
      req.onerror = ()=>resolve(true);
      req.onblocked = ()=>resolve(true);
    });

    return true;
  }

  async function databaseExists(dbName){
    try{
      if(typeof indexedDB.databases === "function"){
        const list = await indexedDB.databases();
        return list.some(x=>x && x.name === dbName);
      }
    }catch(_){}

    return await new Promise((resolve)=>{
      let created = false;
      const req = indexedDB.open(dbName);

      req.onupgradeneeded = ()=>{
        created = true;
        try{ req.transaction.abort(); }catch(_){}
      };

      req.onsuccess = ()=>{
        try{ req.result.close(); }catch(_){}
        resolve(!created);
      };

      req.onerror = ()=>{
        if(created){
          try{ indexedDB.deleteDatabase(dbName); }catch(_){}
          resolve(false);
        }else{
          resolve(false);
        }
      };
    });
  }

  async function readMetaFromDbName(dbName){
    if(!(await databaseExists(dbName))) return null;

    try{
      const db = await openBaseDBByName(dbName);
      if(!db.objectStoreNames.contains(STORE_META)) return null;
      const tx = db.transaction(STORE_META, "readonly");
      const result = await requestToPromise(
        tx.objectStore(STORE_META).get("meta"),
        "No se pudo leer la metadata"
      );
      return result || null;
    }catch(_){
      return null;
    }
  }

  async function ensureLegacyRegistered(){
    if(_legacyChecked) return;
    _legacyChecked = true;

    const current = await catalogGetAll(CATALOG_STORE_BASES);
    if(current.length) return;

    const meta = await readMetaFromDbName(LEGACY_DB_NAME);
    if(!meta) return;

    const filename = String(meta.filename || "Base APU existente");
    const name = filename.replace(/\.(xlsx|xls)$/i, "").trim() || "Base APU existente";

    const rec = {
      id: "legacy_base_v1",
      name,
      nameKey: normalizeText(name),
      dbName: LEGACY_DB_NAME,
      filename,
      createdAt: meta.installedAt || new Date().toISOString(),
      updatedAt: meta.installedAt || new Date().toISOString(),
      counts: meta.counts || {},
      sheetNames: meta.sheetNames || [],
      legacy: true
    };

    await catalogPut(CATALOG_STORE_BASES, rec);
    await catalogPut(CATALOG_STORE_SETTINGS, { key:"activeBaseId", value:rec.id });
  }

  async function listBases(){
    await ensureLegacyRegistered();

    const activeId = await getActiveBaseIdRaw();
    const list = await catalogGetAll(CATALOG_STORE_BASES);

    return list
      .map(x=>({ ...x, active:x.id === activeId }))
      .sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")));
  }

  async function getBaseById(baseId){
    await ensureLegacyRegistered();
    if(!baseId) return null;
    return (await catalogGet(CATALOG_STORE_BASES, String(baseId))) || null;
  }

  async function getActiveBaseIdRaw(){
    const rec = await catalogGet(CATALOG_STORE_SETTINGS, "activeBaseId");
    return rec?.value ? String(rec.value) : "";
  }

  async function getActiveBaseId(){
    await ensureLegacyRegistered();

    let id = await getActiveBaseIdRaw();
    if(id){
      const exists = await catalogGet(CATALOG_STORE_BASES, id);
      if(exists) return id;
    }

    const list = await catalogGetAll(CATALOG_STORE_BASES);
    if(!list.length) return "";

    id = list
      .slice()
      .sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")))[0].id;

    await catalogPut(CATALOG_STORE_SETTINGS, { key:"activeBaseId", value:id });
    return id;
  }

  async function getActiveBase(){
    const id = await getActiveBaseId();
    return id ? await getBaseById(id) : null;
  }

  async function setActiveBase(baseId){
    const rec = await getBaseById(baseId);
    if(!rec) throw new Error("La Base APU seleccionada no existe.");

    await catalogPut(CATALOG_STORE_SETTINGS, {
      key:"activeBaseId",
      value:rec.id
    });

    return rec;
  }

  async function resolveBase(baseId){
    await ensureLegacyRegistered();

    const id = String(baseId || await getActiveBaseId() || "").trim();
    if(!id) throw new Error("No hay ninguna Base APU seleccionada.");

    const rec = await getBaseById(id);
    if(!rec) throw new Error("No se encontró la Base APU solicitada.");

    return rec;
  }

  async function openResolvedBase(baseId){
    const base = await resolveBase(baseId);
    const db = await openBaseDBByName(base.dbName);
    return { base, db };
  }

  function clearCaches(baseId){
    if(baseId){
      _itemsCache.delete(baseId);
      _subKeysCache.delete(baseId);
      return;
    }
    _itemsCache.clear();
    _subKeysCache.clear();
  }

  function normalizeText(s){
    return String(s||"")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/\s+/g," ")
      .trim();
  }

  function isItemCode(v){
    const s = String(v||"").trim();
    return /^\d+(\.\d+)*$/.test(s);
  }

  function parseMoney(val){
    if(val === null || val === undefined) return 0;
    if(typeof val === "number") return val;
    const s = String(val).trim();
    if(!s) return 0;

    const cleaned = s
      .replace(/\$/g,"")
      .replace(/[^\d.,-]/g,"")
      .replace(/\.(?=\d{3}(\D|$))/g,"");

    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    let numStr = cleaned;

    if(lastComma > lastDot) numStr = cleaned.replace(/\./g,"").replace(",",".");

    else numStr = cleaned.replace(/,/g,"");

    const n = Number(numStr);
    return Number.isFinite(n) ? n : 0;
  }

  function parseNumber(val){ return parseMoney(val); }

  function looksHeaderRow(row){
    const r = (row||[]).map(x=>normalizeText(x));
    const hasDesc = r.includes("descripcion") || r.includes("descripción");
    const hasUnidad = r.includes("unidad");
    const hasCant = r.includes("cant/rend") || r.includes("cant") || r.includes("cantidad") || r.includes("cant / rend") || r.includes("cant. rend");
    const hasPU = r.includes("precio unitario") || r.includes("vr unitario") || r.includes("valor unitario");
    const hasPar = r.includes("vr parcial") || r.includes("valor parcial") || r.includes("parcial");
    return hasDesc && hasUnidad && (hasPU || hasPar) && (hasCant || hasPar);
  }

  function findHeaderIndex(rows, max=80){
    for(let i=0;i<Math.min(max, rows.length);i++){
      if(looksHeaderRow(rows[i])) return i;
    }
    return -1;
  }

  function getColIndex(headerRow, keys){
    const h = (headerRow||[]).map(x=>normalizeText(x));
    for(const k of keys){
      const idx = h.indexOf(normalizeText(k));
      if(idx >= 0) return idx;
    }
    return -1;
  }

  function extractFormularioItems(wb){
    const ws = wb.Sheets["FORMULARIO DE PRECIOS"];
    if(!ws) throw new Error("No existe la hoja: FORMULARIO DE PRECIOS");
    const rows = XLSX.utils.sheet_to_json(ws, { header:1, raw:true, defval:"" });
    const h = findHeaderIndex(rows, 120);
    if(h < 0) throw new Error("No se encontró encabezado en FORMULARIO DE PRECIOS.");

    const header = rows[h];
    const idxItem = getColIndex(header, ["ITEM"]);
    const idxDesc = getColIndex(header, ["DESCRIPCIÓN","DESCRIPCION"]);
    const idxUni  = getColIndex(header, ["UNIDAD"]);
    const idxVU   = getColIndex(header, ["VR UNITARIO","VALOR UNITARIO","PRECIO UNITARIO"]);

    if(idxItem < 0 || idxDesc < 0) throw new Error("Encabezados incompletos en FORMULARIO DE PRECIOS.");

    const out = [];
    let currentChapter = { code:"", name:"" };

    for(let r=h+1; r<rows.length; r++){
      const row = rows[r] || [];
      const code = String(row[idxItem]||"").trim();
      const desc = String(row[idxDesc]||"").trim();
      if(!code && !desc) continue;
      if(!isItemCode(code)) continue;

      const unit = idxUni >= 0 ? String(row[idxUni]||"").trim() : "";
      const pu = idxVU >= 0 ? parseMoney(row[idxVU]) : 0;

      const isChapter = /^\d+$/.test(code);
      if(isChapter) currentChapter = { code, name: desc };

      out.push({
        code, desc, unit, pu,
        isChapter: !!isChapter,
        chapterCode: currentChapter.code || "",
        chapterName: currentChapter.name || ""
      });
    }
    return out;
  }

  function extractInsumos(wb){
    const ws = wb.Sheets["Insumos"];
    if(!ws) throw new Error("No existe la hoja: Insumos");
    const rows = XLSX.utils.sheet_to_json(ws, { header:1, raw:true, defval:"" });

    const h = findHeaderIndex(rows, 120);
    if(h < 0) throw new Error("No se encontró encabezado en Insumos.");

    const header = rows[h];
    const idxTipo = getColIndex(header, ["TIPO"]);
    const idxDesc = getColIndex(header, ["DESCRIPCIÓN","DESCRIPCION"]);
    const idxUni  = getColIndex(header, ["UNIDAD"]);
    const idxPU   = getColIndex(header, ["PRECIO UNITARIO","VR UNITARIO","VALOR UNITARIO"]);

    if(idxDesc < 0 || idxPU < 0) throw new Error("Encabezados incompletos en Insumos.");

    const out = [];
    for(let r=h+1; r<rows.length; r++){
      const row = rows[r] || [];
      const desc = String(row[idxDesc]||"").trim();
      if(!desc) continue;
      const tipo = idxTipo >= 0 ? String(row[idxTipo]||"").trim() : "";
      const unit = idxUni >= 0 ? String(row[idxUni]||"").trim() : "";
      const pu = parseMoney(row[idxPU]);
      const key = `${normalizeText(tipo)}|${normalizeText(desc)}|${normalizeText(unit)}`;
      out.push({ key, tipo, desc, unit, pu });
    }
    return out;
  }

  function extractSubproductosLines(wb){
    const ws = wb.Sheets["Subproductos"];
    if(!ws) throw new Error("No existe la hoja: Subproductos");
    const rows = XLSX.utils.sheet_to_json(ws, { header:1, raw:true, defval:"" });

    const lines = [];
    let currentSubName = "";
    let currentSubKey = "";
    let currentGroup = "";

    let colDesc = 0, colUnit = 1, colQty = 2, colPU = 3, colPar = 4;

    function rowText0(i){
      return String((rows[i]||[])[0]||"").trim();
    }

    function isGlobalTitleRow(t){
      const s = normalizeText(t);
      if(!s) return false;
      if(s.includes("analisis de precios unitarios")) return true;
      if(s.includes("análisis de precios unitarios")) return true;
      if(s.includes("subproductos")) return true;
      if(s.includes("cesoft")) return true;
      if(s.includes("enero") || s.includes("febrero") || s.includes("marzo") || s.includes("abril")) return true;
      return false;
    }

    function isGroupRow(t){
      const s = String(t||"").trim();
      if(!s) return false;
      if(s.endsWith(":")) return true;
      const n = normalizeText(s);
      return n === "equipo y herramientas" || n === "materiales" || n === "mano de obra" || n === "transporte";
    }

    function isIgnoreLine(t){
      const n = normalizeText(t);
      if(!n) return true;
      if(n.includes("subtotal")) return true;
      if(n.includes("vr unitario")) return true;
      if(n.includes("valor unitario")) return true;
      if(n.includes("precio unitario") && n.length <= 20) return true;
      return false;
    }

    function isHeaderAt(i){
      return looksHeaderRow(rows[i]||[]);
    }

    function detectSubNameAt(i){
      const t = rowText0(i);
      if(!t) return "";
      if(isGlobalTitleRow(t)) return "";
      if(isHeaderAt(i)) return "";
      if(isGroupRow(t)) return "";
      if(isItemCode(t)) return "";
      for(let k=1;k<=8;k++){
        if(isHeaderAt(i+k)) return t;
      }
      return "";
    }

    for(let i=0;i<rows.length;i++){
      const row = rows[i] || [];
      const c0 = String(row[0]||"").trim();

      const newSub = detectSubNameAt(i);
      if(newSub){
        currentSubName = newSub.trim();
        currentSubKey = normalizeText(currentSubName);
        currentGroup = "";
        continue;
      }

      if(!currentSubKey) continue;

      if(isGroupRow(c0)){
        currentGroup = c0.replace(":","").trim();
        continue;
      }

      if(looksHeaderRow(row)){
        colDesc = getColIndex(row, ["DESCRIPCIÓN","DESCRIPCION"]); if(colDesc < 0) colDesc = 0;
        colUnit = getColIndex(row, ["UNIDAD"]); if(colUnit < 0) colUnit = 1;
        colQty  = getColIndex(row, ["CANT/REND","CANT","CANTIDAD","CANT / REND","CANT. REND"]); if(colQty < 0) colQty = 2;
        colPU   = getColIndex(row, ["PRECIO UNITARIO","VR UNITARIO","VALOR UNITARIO"]); if(colPU < 0) colPU = 3;
        colPar  = getColIndex(row, ["VR PARCIAL","VALOR PARCIAL","PARCIAL"]); if(colPar < 0) colPar = 4;
        continue;
      }

      const desc = String(row[colDesc]||c0||"").trim();
      if(isIgnoreLine(desc)) continue;

      const unit = String(row[colUnit]||"").trim();
      const qty  = parseNumber(row[colQty]);
      const pu   = parseMoney(row[colPU]);
      const parcial = parseMoney(row[colPar]) || (qty * pu);

      const hasNumbers = (qty || pu || parcial);
      if(!desc || !hasNumbers) continue;

      lines.push({
        id: `${currentSubKey}__${lines.length}`,
        subKey: currentSubKey,
        subName: currentSubName,
        group: currentGroup || "",
        desc, unit,
        qty, pu, parcial
      });
    }

    return lines;
  }

  function extractCostosDirectosLines(wb){
    const ws = wb.Sheets["Costos_Directos"];
    if(!ws) throw new Error("No existe la hoja: Costos_Directos");
    const rows = XLSX.utils.sheet_to_json(ws, { header:1, raw:true, defval:"" });

    const lines = [];
    let currentCode = "";
    let currentName = "";
    let currentUnit = "";
    let currentGroup = "";

    let colDesc = 0, colUnit = 1, colQty = 2, colPU = 3, colPar = 4;

    function detectBlockStart(row){
      const a = String(row?.[0]||"").trim();
      const b = String(row?.[1]||"").trim();
      if(isItemCode(a) && b) return { code:a, name:b };

      const s = String(row?.[0]||"").trim();
      const m = s.match(/^(\d+(\.\d+)*)\s+(.+)$/);
      if(m) return { code:m[1], name:m[3] };
      return null;
    }

    for(let i=0;i<rows.length;i++){
      const row = rows[i] || [];
      const start = detectBlockStart(row);
      if(start){
        currentCode = start.code;
        currentName = start.name;
        currentGroup = "";
        currentUnit = "";

        for(let k=0;k<4;k++){
          const rr = rows[i+k] || [];
          const joined = rr.map(x=>String(x||"")).join(" ");
          const m = joined.match(/unidad\s*:\s*([A-Za-z0-9]+)/i);
          if(m){ currentUnit = m[1]; break; }
        }
        continue;
      }

      if(!currentCode) continue;

      const c0 = String(row[0]||"").trim();
      if(c0 && c0.endsWith(":")){
        currentGroup = c0.replace(":","").trim();
        continue;
      }

      if(looksHeaderRow(row)){
        colDesc = getColIndex(row, ["DESCRIPCIÓN","DESCRIPCION"]); if(colDesc < 0) colDesc = 0;
        colUnit = getColIndex(row, ["UNIDAD"]); if(colUnit < 0) colUnit = 1;
        colQty  = getColIndex(row, ["CANT/REND","CANT","CANTIDAD","CANT / REND","CANT. REND"]); if(colQty < 0) colQty = 2;
        colPU   = getColIndex(row, ["PRECIO UNITARIO","VR UNITARIO","VALOR UNITARIO"]); if(colPU < 0) colPU = 3;
        colPar  = getColIndex(row, ["VR PARCIAL","VALOR PARCIAL","PARCIAL"]); if(colPar < 0) colPar = 4;
        continue;
      }

      const low0 = normalizeText(c0);
      if(low0.includes("vr costo directo") || low0.includes("valor costo directo")) continue;

      const desc = String(row[colDesc]||"").trim() || c0;
      if(!desc) continue;

      const low = normalizeText(desc);
      if(low.includes("subtotal")) continue;

      const unit = String(row[colUnit]||"").trim();
      const qty = parseNumber(row[colQty]);
      const pu  = parseMoney(row[colPU]);
      const parcial = parseMoney(row[colPar]) || (qty * pu);
      if(!(qty || pu || parcial)) continue;

      lines.push({
        id: `${currentCode}__${lines.length}`,
        itemCode: currentCode,
        itemName: currentName,
        itemUnit: currentUnit,
        group: currentGroup || "",
        desc, unit, qty, pu, parcial
      });
    }

    return lines;
  }


  async function clearStores(baseId, storeNames){
    const { db } = await openResolvedBase(baseId);
    const names = storeNames.filter(n=>db.objectStoreNames.contains(n));
    if(!names.length) return true;

    const tx = db.transaction(names, "readwrite");
    for(const name of names){
      tx.objectStore(name).clear();
    }
    await txToPromise(tx, "No se pudieron limpiar los datos de la Base APU");
    return true;
  }

  async function putMany(baseId, storeName, arr){
    const { db } = await openResolvedBase(baseId);
    const tx = db.transaction(storeName, "readwrite");
    const st = tx.objectStore(storeName);

    for(const rec of (arr || [])){
      st.put(rec);
    }

    await txToPromise(tx, "Error guardando datos en " + storeName);
    return true;
  }

  async function setMeta(baseId, meta){
    const { db } = await openResolvedBase(baseId);
    const tx = db.transaction(STORE_META, "readwrite");
    tx.objectStore(STORE_META).put({ key:"meta", ...meta });
    await txToPromise(tx, "No se pudo guardar la metadata");
    return true;
  }

  async function getMeta(baseId){
    let base = null;
    try{
      base = await resolveBase(baseId);
    }catch(_){
      return null;
    }

    const db = await openBaseDBByName(base.dbName);
    const tx = db.transaction(STORE_META, "readonly");
    const meta = await requestToPromise(
      tx.objectStore(STORE_META).get("meta"),
      "No se pudo leer la metadata"
    );

    if(!meta) return null;

    return {
      ...meta,
      baseId: base.id,
      baseName: base.name,
      dbName: base.dbName
    };
  }

  async function readAllFromStore(baseId, storeName){
    const { db } = await openResolvedBase(baseId);
    const tx = db.transaction(storeName, "readonly");
    const st = tx.objectStore(storeName);

    if(typeof st.getAll === "function"){
      return await requestToPromise(st.getAll(), "No se pudo leer " + storeName);
    }

    const out = [];
    await new Promise((resolve, reject)=>{
      const req = st.openCursor();
      req.onsuccess = ()=>{
        const cur = req.result;
        if(!cur) return resolve(true);
        out.push(cur.value);
        cur.continue();
      };
      req.onerror = ()=>reject(req.error || new Error("No se pudo recorrer " + storeName));
    });
    return out;
  }

  async function loadItemsCache(baseId){
    const base = await resolveBase(baseId);

    if(_itemsCache.has(base.id)){
      return _itemsCache.get(base.id);
    }

    const items = await readAllFromStore(base.id, STORE_ITEMS);
    _itemsCache.set(base.id, items);
    return items;
  }

  async function buildSubKeysCache(baseId){
    const base = await resolveBase(baseId);

    if(_subKeysCache.has(base.id)){
      return _subKeysCache.get(base.id);
    }

    const { db } = await openResolvedBase(base.id);
    const tx = db.transaction(STORE_SUB, "readonly");
    const idx = tx.objectStore(STORE_SUB).index("by_sub");
    const keys = new Set();

    await new Promise((resolve, reject)=>{
      const req = idx.openCursor();
      req.onsuccess = ()=>{
        const cur = req.result;
        if(!cur) return resolve(true);
        keys.add(cur.value.subKey);
        cur.continue();
      };
      req.onerror = ()=>reject(req.error || new Error("No se pudo recorrer subproductos"));
    });

    _subKeysCache.set(base.id, keys);
    return keys;
  }

  async function search(query, limit=20, baseId){
    const q = normalizeText(query);
    if(!q) return [];

    const items = await loadItemsCache(baseId);
    const isCodeLike = /^\d+(\.\d+)*$/.test(q);

    if(isCodeLike){
      const byCode = items
        .filter(it=>String(it.code||"").startsWith(q))
        .slice(0, limit);

      if(byCode.length) return byCode;
    }

    return items
      .filter(it=>
        normalizeText(it.desc).includes(q) ||
        normalizeText(it.code).includes(q)
      )
      .slice(0, limit);
  }

  async function getByCode(code, baseId){
    const { db } = await openResolvedBase(baseId);
    const tx = db.transaction(STORE_ITEMS, "readonly");

    return await requestToPromise(
      tx.objectStore(STORE_ITEMS).get(String(code||"").trim()),
      "No se pudo leer el ítem"
    ) || null;
  }

  async function listCostosDirectos(code, baseId){
    const { db } = await openResolvedBase(baseId);
    const tx = db.transaction(STORE_CD, "readonly");
    const idx = tx.objectStore(STORE_CD).index("by_item");
    const out = [];

    await new Promise((resolve, reject)=>{
      const req = idx.openCursor(IDBKeyRange.only(String(code||"").trim()));
      req.onsuccess = ()=>{
        const cur = req.result;
        if(!cur) return resolve(true);
        out.push(cur.value);
        cur.continue();
      };
      req.onerror = ()=>reject(req.error || new Error("No se pudo listar Costos_Directos"));
    });

    return out;
  }

  async function listSubLines(subKey, baseId){
    const { db } = await openResolvedBase(baseId);
    const tx = db.transaction(STORE_SUB, "readonly");
    const idx = tx.objectStore(STORE_SUB).index("by_sub");
    const out = [];

    await new Promise((resolve, reject)=>{
      const req = idx.openCursor(IDBKeyRange.only(String(subKey||"").trim()));
      req.onsuccess = ()=>{
        const cur = req.result;
        if(!cur) return resolve(true);
        out.push(cur.value);
        cur.continue();
      };
      req.onerror = ()=>reject(req.error || new Error("No se pudo listar Subproductos"));
    });

    return out;
  }

  async function getAPU(code, baseId){
    const item = await getByCode(code, baseId);
    if(!item) return null;

    const lines = await listCostosDirectos(code, baseId);
    const subKeys = await buildSubKeysCache(baseId);

    const lines2 = lines.map(line=>{
      const key = normalizeText(line.desc);
      return {
        ...line,
        subRef: subKeys.has(key) ? key : ""
      };
    });

    const directo = lines2.reduce((sum,line)=>sum + Number(line.parcial||0), 0);

    return {
      mode:"item",
      header:`${item.code} — ${item.desc||""}`,
      title:`APU ${item.code}`,
      subtitle:item.desc || "",
      metaLine:`Fuente: Costos_Directos · Capítulo ${item.chapterCode||"-"} ${item.chapterName||""}`,
      unit:item.unit || "",
      directo:item.pu || directo,
      lines:lines2
    };
  }

  async function getSubAPU(subKey, baseId){
    const key = String(subKey||"").trim();
    if(!key) return null;

    const lines = await listSubLines(key, baseId);
    if(!lines.length) return null;

    const name = lines[0].subName || key;
    const directo = lines.reduce((sum,line)=>sum + Number(line.parcial||0), 0);

    return {
      mode:"sub",
      header:name,
      title:"SUBPRODUCTO",
      subtitle:name,
      metaLine:"Fuente: Subproductos",
      unit:"",
      directo,
      lines:lines.map(line=>({ ...line, subRef:"" }))
    };
  }

  async function listBaseChapters(baseId){
    const items = await loadItemsCache(baseId);

    const chapters = items
      .filter(x=>x.isChapter)
      .map(x=>({
        chapterCode:String(x.code||"").trim(),
        chapterName:String(x.desc||"").trim()
      }));

    chapters.sort((a,b)=>Number(a.chapterCode) - Number(b.chapterCode));
    return chapters;
  }

  async function searchInsumos(query, limit=30, baseId){
    const q = normalizeText(query);
    if(!q) return [];

    const rows = await readAllFromStore(baseId, STORE_INSUM);
    return rows
      .filter(v=>
        normalizeText(v.tipo).includes(q) ||
        normalizeText(v.desc).includes(q) ||
        normalizeText(v.unit).includes(q)
      )
      .slice(0, limit);
  }

  async function listSubproductos(limit=200, baseId){
    const { db } = await openResolvedBase(baseId);
    const tx = db.transaction(STORE_SUB, "readonly");
    const idx = tx.objectStore(STORE_SUB).index("by_sub");
    const keys = new Map();

    await new Promise((resolve, reject)=>{
      const req = idx.openCursor();
      req.onsuccess = ()=>{
        const cur = req.result;
        if(!cur) return resolve(true);

        const value = cur.value;
        if(!keys.has(value.subKey)){
          keys.set(value.subKey, value.subName || value.subKey);
        }

        if(keys.size >= limit) return resolve(true);
        cur.continue();
      };
      req.onerror = ()=>reject(req.error || new Error("No se pudo listar subproductos"));
    });

    return Array.from(keys.entries()).map(([subKey, subName])=>({ subKey, subName }));
  }

  async function createCatalogRecord({ id, name, dbName, filename, meta }){
    const now = new Date().toISOString();

    const rec = {
      id,
      name,
      nameKey:normalizeText(name),
      dbName,
      filename:filename || "base.xlsx",
      createdAt:meta?.installedAt || now,
      updatedAt:now,
      counts:meta?.counts || {},
      sheetNames:meta?.sheetNames || [],
      legacy:false
    };

    await catalogPut(CATALOG_STORE_BASES, rec);
    return rec;
  }

  async function installFromFile(file, options={}){
    if(!file) throw new Error("No se recibió archivo XLSX.");
    if(!window.XLSX) throw new Error("No está cargada la librería XLSX.");

    const opts = typeof options === "string" ? { name:options } : (options || {});
    const suggested = String(file.name || "Base APU").replace(/\.(xlsx|xls)$/i, "").trim();
    const name = String(opts.name || suggested || "Base APU").trim();

    if(!name) throw new Error("Debe indicar un nombre para la Base APU.");

    const existing = await listBases();
    if(existing.some(x=>normalizeText(x.name) === normalizeText(name))){
      throw new Error(`Ya existe una Base APU llamada "${name}". Use otro nombre.`);
    }

    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type:"array" });

    const names = wb.SheetNames || [];
    const missing = SHEETS_REQUIRED.filter(n=>!names.includes(n));

    if(missing.length){
      throw new Error("Faltan hojas: " + missing.join(", "));
    }

    const items = extractFormularioItems(wb);
    const insumos = extractInsumos(wb);
    const subLines = extractSubproductosLines(wb);
    const cdLines = extractCostosDirectosLines(wb);

    const id = uid("base");
    const dbName = `apu_base_${id}`;

    await openBaseDBByName(dbName);

    const temporaryBase = {
      id,
      name,
      nameKey:normalizeText(name),
      dbName,
      filename:file.name || "base.xlsx",
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString(),
      counts:{},
      sheetNames:names
    };

    await catalogPut(CATALOG_STORE_BASES, temporaryBase);

    try{
      await clearStores(id, [STORE_ITEMS, STORE_INSUM, STORE_SUB, STORE_CD, STORE_META]);

      await putMany(id, STORE_ITEMS, items);
      await putMany(id, STORE_INSUM, insumos);
      await putMany(id, STORE_SUB, subLines);
      await putMany(id, STORE_CD, cdLines);

      const meta = {
        installedAt:new Date().toISOString(),
        filename:file.name || "base.xlsx",
        sheetNames:names,
        requiredSheets:SHEETS_REQUIRED,
        counts:{
          items:items.length,
          insumos:insumos.length,
          subLines:subLines.length,
          cdLines:cdLines.length
        }
      };

      await setMeta(id, meta);

      await createCatalogRecord({
        id,
        name,
        dbName,
        filename:file.name || "base.xlsx",
        meta
      });

      await setActiveBase(id);
      clearCaches(id);

      return {
        ...meta,
        baseId:id,
        baseName:name,
        dbName
      };
    }catch(err){
      await catalogDelete(CATALOG_STORE_BASES, id).catch(()=>{});
      await deleteDatabaseByName(dbName).catch(()=>{});
      throw err;
    }
  }

  async function renameBase(baseId, newName){
    const rec = await getBaseById(baseId);
    if(!rec) throw new Error("La Base APU no existe.");

    const name = String(newName || "").trim();
    if(!name) throw new Error("El nombre de la Base APU no puede quedar vacío.");

    const list = await listBases();
    const duplicate = list.some(x=>
      x.id !== rec.id &&
      normalizeText(x.name) === normalizeText(name)
    );

    if(duplicate){
      throw new Error(`Ya existe una Base APU llamada "${name}".`);
    }

    const updated = {
      ...rec,
      name,
      nameKey:normalizeText(name),
      updatedAt:new Date().toISOString()
    };

    await catalogPut(CATALOG_STORE_BASES, updated);
    return updated;
  }

  async function deleteBase(baseId){
    const rec = await getBaseById(baseId);
    if(!rec) return false;

    await deleteDatabaseByName(rec.dbName);
    await catalogDelete(CATALOG_STORE_BASES, rec.id);

    clearCaches(rec.id);

    const activeId = await getActiveBaseIdRaw();
    if(activeId === rec.id){
      const remaining = await catalogGetAll(CATALOG_STORE_BASES);
      const next = remaining
        .slice()
        .sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")))[0];

      await catalogPut(CATALOG_STORE_SETTINGS, {
        key:"activeBaseId",
        value:next?.id || ""
      });
    }

    return true;
  }

  async function clearAll(baseId){
    const base = await resolveBase(baseId);

    await clearStores(base.id, [
      STORE_ITEMS,
      STORE_INSUM,
      STORE_SUB,
      STORE_CD,
      STORE_META
    ]);

    clearCaches(base.id);
    return true;
  }

  async function deleteAllBases(){
    const list = await listBases();

    for(const base of list){
      await deleteDatabaseByName(base.dbName).catch(()=>{});
      await catalogDelete(CATALOG_STORE_BASES, base.id).catch(()=>{});
      clearCaches(base.id);
    }

    await catalogPut(CATALOG_STORE_SETTINGS, {
      key:"activeBaseId",
      value:""
    });

    return true;
  }

  // Compatibilidad:
  // - con baseId elimina solo esa base;
  // - sin baseId elimina todas las Bases APU.
  async function deleteBaseDatabase(baseId){
    if(baseId) return await deleteBase(baseId);
    return await deleteAllBases();
  }

  async function listFormularioItems(query="", limit=200, baseId){
    const items = await loadItemsCache(baseId);
    const q = normalizeText(query);

    const arr = !q
      ? items
      : items.filter(it=>
          normalizeText(it.code).includes(q) ||
          normalizeText(it.desc).includes(q) ||
          normalizeText(it.chapterCode).includes(q) ||
          normalizeText(it.chapterName).includes(q)
        );

    return arr.slice(0, limit);
  }

  async function listCostosDirectosAll(query="", limit=250, baseId){
    const q = normalizeText(query);
    const rows = await readAllFromStore(baseId, STORE_CD);

    return rows
      .filter(v=>!q || (
        normalizeText(v.itemCode).includes(q) ||
        normalizeText(v.itemName).includes(q) ||
        normalizeText(v.group).includes(q) ||
        normalizeText(v.desc).includes(q) ||
        normalizeText(v.unit).includes(q)
      ))
      .slice(0, limit);
  }

  async function listInsumos(query="", limit=250, baseId){
    const q = normalizeText(query);
    const rows = await readAllFromStore(baseId, STORE_INSUM);

    return rows
      .filter(v=>!q || (
        normalizeText(v.tipo).includes(q) ||
        normalizeText(v.desc).includes(q) ||
        normalizeText(v.unit).includes(q)
      ))
      .slice(0, limit);
  }

  window.APUBase = {
    // Catálogo de múltiples bases
    listBases,
    getBaseById,
    getActiveBaseId,
    getActiveBase,
    setActiveBase,
    renameBase,
    deleteBase,
    deleteAllBases,

    // Importación y metadata
    installFromFile,
    getMeta,

    // Consultas de la Base APU activa o indicada por baseId
    search,
    getByCode,
    getAPU,
    getSubAPU,
    listBaseChapters,
    searchInsumos,
    listSubproductos,
    listFormularioItems,
    listCostosDirectosAll,
    listInsumos,

    // Limpieza y compatibilidad
    clearAll,
    deleteBaseDatabase
  };

  requestPersistentStorage();
})();