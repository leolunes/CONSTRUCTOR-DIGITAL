(function(){
  window.APUBase = window.APUBase || {};

  const DB_NAME = "apu_base_multi_v1";
  const DB_VER = 1;

  const LEGACY_DB_NAME = "apu_base_v1";
  const LEGACY_DB_VER = 3;

  const STORE_META  = "meta";
  const STORE_ITEMS = "items";
  const STORE_CD    = "cd_lines";
  const STORE_SUB   = "sub_lines";
  const STORE_INSUM = "insumos";

  const META_CATALOG_KEY = "catalog";
  const META_ACTIVE_BASE_KEY = "active_base";

  let _dbPromise = null;
  let _itemsCacheByBase = Object.create(null);
  let _subKeysCacheByBase = Object.create(null);

  const SHEETS_REQUIRED = [
    "FORMULARIO DE PRECIOS",
    "Costos_Directos",
    "Subproductos",
    "Insumos"
  ];

  function safeBaseKey(v){
    return String(v || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_")
      .replace(/[^\w.-]/g, "_");
  }

  function makeScopedId(baseKey, rawId){
    return `${safeBaseKey(baseKey)}::${String(rawId || "").trim()}`;
  }

  function resetCaches(){
    _itemsCacheByBase = Object.create(null);
    _subKeysCacheByBase = Object.create(null);
  }

  function openDB(){
    if(_dbPromise) return _dbPromise;

    _dbPromise = new Promise((resolve, reject)=>{
      const req = indexedDB.open(DB_NAME, DB_VER);

      req.onupgradeneeded = () => {
        const db = req.result;

        if(!db.objectStoreNames.contains(STORE_META)){
          db.createObjectStore(STORE_META, { keyPath:"key" });
        }

        if(!db.objectStoreNames.contains(STORE_ITEMS)){
          const st = db.createObjectStore(STORE_ITEMS, { keyPath:"id" });
          st.createIndex("by_base", "baseKey", { unique:false });
          st.createIndex("by_base_code", ["baseKey","code"], { unique:true });
          st.createIndex("by_base_codeNorm", ["baseKey","codeNorm"], { unique:false });
        }

        if(!db.objectStoreNames.contains(STORE_CD)){
          const st = db.createObjectStore(STORE_CD, { keyPath:"id" });
          st.createIndex("by_base", "baseKey", { unique:false });
          st.createIndex("by_base_item", ["baseKey","itemCode"], { unique:false });
          st.createIndex("by_base_itemNorm", ["baseKey","itemCodeNorm"], { unique:false });
        }

        if(!db.objectStoreNames.contains(STORE_SUB)){
          const st = db.createObjectStore(STORE_SUB, { keyPath:"id" });
          st.createIndex("by_base", "baseKey", { unique:false });
          st.createIndex("by_base_sub", ["baseKey","subKey"], { unique:false });
        }

        if(!db.objectStoreNames.contains(STORE_INSUM)){
          const st = db.createObjectStore(STORE_INSUM, { keyPath:"id" });
          st.createIndex("by_base", "baseKey", { unique:false });
          st.createIndex("by_base_key", ["baseKey","key"], { unique:false });
        }
      };

      req.onsuccess = ()=> resolve(req.result);
      req.onerror = ()=> reject(req.error || new Error("No se pudo abrir DB base"));
    });

    return _dbPromise;
  }

  function openLegacyDB(){
    return new Promise((resolve, reject)=>{
      const req = indexedDB.open(LEGACY_DB_NAME, LEGACY_DB_VER);
      req.onsuccess = ()=> resolve(req.result);
      req.onerror = ()=> reject(req.error || new Error("No se pudo abrir DB legado"));
      req.onblocked = ()=> reject(new Error("La DB legado está bloqueada."));
      req.onupgradeneeded = ()=> resolve(req.result);
    });
  }

  async function store(name, mode="readonly"){
    const db = await openDB();
    return db.transaction(name, mode).objectStore(name);
  }

  async function metaGet(key){
    const st = await store(STORE_META, "readonly");
    return await new Promise((res, rej)=>{
      const r = st.get(String(key || "").trim());
      r.onsuccess = ()=>res(r.result || null);
      r.onerror = ()=>rej(r.error || new Error("No se pudo leer meta"));
    });
  }

  async function metaPut(obj){
    const st = await store(STORE_META, "readwrite");
    await new Promise((res, rej)=>{
      const r = st.put(obj);
      r.onsuccess = ()=>res(true);
      r.onerror = ()=>rej(r.error || new Error("No se pudo guardar meta"));
    });
    return obj;
  }

  async function getCatalog(){
    const raw = await metaGet(META_CATALOG_KEY);
    const bases = Array.isArray(raw?.bases) ? raw.bases.slice() : [];
    bases.sort((a,b)=> String(b.importedAt || "").localeCompare(String(a.importedAt || "")));
    return { key: META_CATALOG_KEY, bases };
  }

  async function setCatalog(catalog){
    const safe = {
      key: META_CATALOG_KEY,
      bases: Array.isArray(catalog?.bases) ? catalog.bases.slice() : []
    };
    return await metaPut(safe);
  }

  async function listBases(){
    const catalog = await getCatalog();
    return catalog.bases.slice();
  }

  async function getActiveBaseKey(){
    const active = await metaGet(META_ACTIVE_BASE_KEY);
    if(active?.baseKey) return safeBaseKey(active.baseKey);

    const catalog = await getCatalog();
    const first = catalog.bases[0];
    return first ? safeBaseKey(first.baseKey) : "";
  }

  async function setActiveBase(baseKey){
    const key = safeBaseKey(baseKey);
    if(!key) throw new Error("Base no válida.");
    await metaPut({ key: META_ACTIVE_BASE_KEY, baseKey: key, updatedAt: new Date().toISOString() });
    resetCaches();
    return key;
  }

  async function getBaseMeta(baseKey){
    const key = safeBaseKey(baseKey || await getActiveBaseKey());
    if(!key) return null;
    return await metaGet(`base::${key}`);
  }

  async function setBaseMeta(baseKey, meta){
    const key = safeBaseKey(baseKey);
    if(!key) throw new Error("Base no válida.");
    const record = { key: `base::${key}`, baseKey: key, ...meta };
    await metaPut(record);

    const catalog = await getCatalog();
    const bases = catalog.bases.filter(x => safeBaseKey(x.baseKey) !== key);
    bases.push({
      baseKey: key,
      fileName: String(meta?.fileName || ""),
      importedAt: String(meta?.importedAt || new Date().toISOString()),
      counts: meta?.counts || {}
    });
    await setCatalog({ bases });
    return record;
  }

  async function resolveBaseKey(baseKey){
    const key = safeBaseKey(baseKey);
    if(key) return key;
    return await getActiveBaseKey();
  }

  async function clearStore(name){
    const st = await store(name, "readwrite");
    await new Promise((res, rej)=>{
      const r = st.clear();
      r.onsuccess = ()=>res(true);
      r.onerror = ()=>rej(r.error || new Error("No se pudo limpiar " + name));
    });
  }

  async function putMany(name, arr){
    const st = await store(name, "readwrite");
    await new Promise((res, rej)=>{
      let i=0;
      function next(){
        if(i>=arr.length) return res(true);
        const r = st.put(arr[i]);
        r.onsuccess = ()=>{ i++; next(); };
        r.onerror = ()=>rej(r.error || new Error("Error guardando en " + name));
      }
      next();
    });
  }

  async function deleteByBaseKey(name, baseKey){
    const st = await store(name, "readwrite");
    const index = st.index("by_base");
    const ids = [];
    await new Promise((res, rej)=>{
      const r = index.openCursor(IDBKeyRange.only(safeBaseKey(baseKey)));
      r.onsuccess = ()=>{
        const cur = r.result;
        if(!cur) return res(true);
        ids.push(cur.primaryKey);
        cur.continue();
      };
      r.onerror = ()=>rej(r.error || new Error("No se pudo recorrer store por base"));
    });

    await new Promise((res, rej)=>{
      let i=0;
      function next(){
        if(i>=ids.length) return res(true);
        const r = st.delete(ids[i]);
        r.onsuccess = ()=>{ i++; next(); };
        r.onerror = ()=>rej(r.error || new Error("No se pudo borrar registros de la base"));
      }
      next();
    });
  }

  async function deleteBase(baseKey){
    const key = safeBaseKey(baseKey);
    if(!key) return false;

    await deleteByBaseKey(STORE_ITEMS, key);
    await deleteByBaseKey(STORE_CD, key);
    await deleteByBaseKey(STORE_SUB, key);
    await deleteByBaseKey(STORE_INSUM, key);

    const catalog = await getCatalog();
    catalog.bases = catalog.bases.filter(x => safeBaseKey(x.baseKey) !== key);
    await setCatalog(catalog);

    const activeKey = await getActiveBaseKey();
    if(activeKey === key){
      if(catalog.bases[0]?.baseKey) await setActiveBase(catalog.bases[0].baseKey);
      else await metaPut({ key: META_ACTIVE_BASE_KEY, baseKey:"", updatedAt: new Date().toISOString() });
    }

    const stMeta = await store(STORE_META, "readwrite");
    await new Promise((res)=>{ const r = stMeta.delete(`base::${key}`); r.onsuccess=()=>res(true); r.onerror=()=>res(true); });

    resetCaches();
    return true;
  }

  async function legacyReadAll(storeName){
    try{
      const db = await openLegacyDB();
      if(!db.objectStoreNames.contains(storeName)) return [];
      const tx = db.transaction(storeName, "readonly");
      const st = tx.objectStore(storeName);
      return await new Promise((res, rej)=>{
        const out = [];
        const r = st.openCursor();
        r.onsuccess = ()=>{
          const cur = r.result;
          if(!cur) return res(out);
          out.push(cur.value);
          cur.continue();
        };
        r.onerror = ()=>rej(r.error || new Error("No se pudo leer store legado"));
      });
    }catch(_){
      return [];
    }
  }

  async function legacyGetMeta(){
    try{
      const db = await openLegacyDB();
      if(!db.objectStoreNames.contains(STORE_META)) return null;
      const tx = db.transaction(STORE_META, "readonly");
      const st = tx.objectStore(STORE_META);
      return await new Promise((res, rej)=>{
        const r = st.get("meta");
        r.onsuccess = ()=>res(r.result || null);
        r.onerror = ()=>rej(r.error || new Error("No se pudo leer meta legado"));
      });
    }catch(_){
      return null;
    }
  }

  async function hasLegacyBaseData(){
    const legacyMeta = await legacyGetMeta();
    if(legacyMeta) return true;
    const items = await legacyReadAll(STORE_ITEMS);
    return !!items.length;
  }

  async function migrateLegacyBase(legacyBaseKey){
    const key = safeBaseKey(legacyBaseKey);
    if(!key) throw new Error("Debes indicar un identificador válido para la base anterior.");

    const [items, cdLines, subLines, insumos, legacyMeta] = await Promise.all([
      legacyReadAll(STORE_ITEMS),
      legacyReadAll(STORE_CD),
      legacyReadAll(STORE_SUB),
      legacyReadAll(STORE_INSUM),
      legacyGetMeta()
    ]);

    if(!items.length && !cdLines.length && !subLines.length && !insumos.length){
      return null;
    }

    await deleteBase(key);

    const scopedItems = items.map(it => ({ ...it, baseKey:key, id: makeScopedId(key, it.code || it.id || Math.random()) }));
    const scopedCd = cdLines.map((ln, i) => ({ ...ln, baseKey:key, id: makeScopedId(key, ln.id || `${ln.itemCode || "cd"}__${i}`) }));
    const scopedSub = subLines.map((ln, i) => ({ ...ln, baseKey:key, id: makeScopedId(key, ln.id || `${ln.subKey || "sub"}__${i}`) }));
    const scopedInsum = insumos.map((ins, i) => ({ ...ins, baseKey:key, id: makeScopedId(key, ins.key || `${ins.desc || "ins"}__${i}`) }));

    if(scopedItems.length) await putMany(STORE_ITEMS, scopedItems);
    if(scopedCd.length) await putMany(STORE_CD, scopedCd);
    if(scopedSub.length) await putMany(STORE_SUB, scopedSub);
    if(scopedInsum.length) await putMany(STORE_INSUM, scopedInsum);

    const meta = {
      importedAt: String(legacyMeta?.importedAt || new Date().toISOString()),
      fileName: String(legacyMeta?.fileName || "base_legado.xlsx"),
      migratedFromLegacy: true,
      counts: {
        items: scopedItems.length,
        cdLines: scopedCd.length,
        subLines: scopedSub.length,
        insumos: scopedInsum.length
      }
    };

    await setBaseMeta(key, meta);
    await setActiveBase(key);
    resetCaches();

    return meta;
  }

  async function ensureLegacyMigratedIfNeeded(){
    const bases = await listBases();
    if(bases.length) return false;

    const hasLegacy = await hasLegacyBaseData();
    if(!hasLegacy) return false;

    const suggested = "2026_T1";
    const entered = prompt(
      "Se detectó una base anterior ya instalada en la app.\n\n" +
      "Para conservarla junto con las nuevas bases trimestrales, escribe el período que corresponde a esa base existente.\n\n" +
      "Ejemplo: 2026_T1",
      suggested
    );

    const baseKey = safeBaseKey(entered || "");
    if(!baseKey) throw new Error("No se indicó el período de la base existente. Se canceló la migración preventiva.");

    await migrateLegacyBase(baseKey);
    return true;
  }
  function normalizeText(s){
    return String(s||"")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/\s+/g," ")
      .trim();
  }

  /* =========================================================
     ✅ AJUSTE CRÍTICO:
     - El código APU ya NO se normaliza agresivamente.
     - Se conserva como texto exacto.
     - Se evita deformar 4.29 -> 4.2 / 4.02 / equivalentes.
     ========================================================= */
  function normalizeCode(code){
    const raw = String(code || "").trim();
    if(!raw) return "";
    return raw.replace(/[^\d.]/g, "");
  }

  function codeEquals(a, b){
    const aa = normalizeCode(a);
    const bb = normalizeCode(b);
    if(!aa || !bb) return false;
    return aa === bb;
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

  function tokenSet(s){
    const t = normalizeText(s);
    if(!t) return new Set();
    return new Set(t.split(" ").filter(x => x && x.length >= 3));
  }

  function jaccard(aSet, bSet){
    if(!aSet.size && !bSet.size) return 0;
    let inter = 0;
    for(const x of aSet){
      if(bSet.has(x)) inter++;
    }
    const uni = aSet.size + bSet.size - inter;
    return uni ? (inter / uni) : 0;
  }

  function sameUnitLoose(a, b){
    const aa = normalizeText(a);
    const bb = normalizeText(b);
    if(!aa || !bb) return true;
    return aa === bb;
  }

  function descScore(expectedDesc, expectedUnit, item){
    const d1 = normalizeText(expectedDesc);
    const d2 = normalizeText(item?.desc || "");
    if(!d1 || !d2) return 0;

    if(d1 === d2){
      let score = 1.0;
      if(sameUnitLoose(expectedUnit, item?.unit)) score += 0.05;
      return score;
    }

    const sTok = jaccard(tokenSet(d1), tokenSet(d2));
    const sContain = (d1.includes(d2) || d2.includes(d1)) ? 0.08 : 0;
    const sUnit = sameUnitLoose(expectedUnit, item?.unit) ? 0.08 : 0;

    return sTok + sContain + sUnit;
  }

  async function findBestItemByDesc(desc, unit, baseKey){
    const d = String(desc || "").trim();
    if(!d) return null;

    const items = await loadItemsCache(baseKey);
    const candidates = (items || []).filter(it => it && !it.isChapter && it.code && it.desc);
    if(!candidates.length) return null;

    let best = null;
    let bestScore = 0;

    for(const it of candidates){
      const score = descScore(d, unit, it);
      if(score > bestScore){
        bestScore = score;
        best = it;
      }
    }

    if(best && bestScore >= 0.62) return best;
    return null;
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
        code,
        codeNorm: normalizeCode(code),
        desc,
        unit,
        pu,
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
    let colDesc = 0, colUnit = 1, colQty = 2, colPU = 3, colPar = 4;

    function rowText0(i){
      return String((rows[i]||[])[0]||"").trim();
    }

    function rowJoinedText(i){
      return (rows[i] || [])
        .map(x => String(x || "").trim())
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }

    function isGlobalTitleRow(t){
      const s = normalizeText(t);
      if(!s) return false;
      if(s.includes("analisis de precios unitarios")) return true;
      if(s.includes("análisis de precios unitarios")) return true;
      if(s === "subproductos") return true;
      if(s.includes("cesoft")) return true;
      if(s.includes("enero") || s.includes("febrero") || s.includes("marzo") || s.includes("abril") ||
         s.includes("mayo") || s.includes("junio") || s.includes("julio") || s.includes("agosto") ||
         s.includes("septiembre") || s.includes("octubre") || s.includes("noviembre") || s.includes("diciembre")) return true;
      return false;
    }

    function isGroupRow(t){
      const s = String(t||"").trim();
      if(!s) return false;
      if(s.endsWith(":")) return true;
      const n = normalizeText(s);
      return (
        n === "equipo y herramientas" ||
        n === "materiales" ||
        n === "mano de obra" ||
        n === "transporte" ||
        n === "subcontratos" ||
        n === "otros"
      );
    }

    function isIgnoreLine(t){
      const n = normalizeText(t);
      if(!n) return true;
      if(n.includes("subtotal")) return true;
      if(n.includes("vr unitario")) return true;
      if(n.includes("valor unitario")) return true;
      if(n.includes("vr parcial")) return true;
      if(n.includes("valor parcial")) return true;
      if(n.includes("precio unitario") && n.length <= 30) return true;
      if(n === "descripcion unidad cant/rend precio unitario vr parcial") return true;
      return false;
    }

    function isHeaderAt(i){
      return looksHeaderRow(rows[i]||[]);
    }

    function isCandidateSubNameText(t){
      const s = String(t || "").trim();
      if(!s) return false;
      if(isGlobalTitleRow(s)) return false;
      if(isGroupRow(s)) return false;
      if(isIgnoreLine(s)) return false;
      if(isItemCode(s)) return false;
      const n = normalizeText(s);
      if(n.length < 3) return false;
      if(/^\d+([.,]\d+)?$/.test(n)) return false;
      return true;
    }

    function findPreviousHeader(i){
      for(let k=i-1;k>=0;k--){
        if(isHeaderAt(k)) return k;
      }
      return -1;
    }

    function detectSubNameBeforeHeader(headerIndex){
      const lowerBound = Math.max(0, (findPreviousHeader(headerIndex) + 1));
      let best = "";

      for(let k = headerIndex - 1; k >= Math.max(lowerBound, headerIndex - 30); k--){
        const joined = rowJoinedText(k);
        const first = rowText0(k);

        if(isCandidateSubNameText(joined)){
          best = joined;
          break;
        }
        if(isCandidateSubNameText(first)){
          best = first;
          break;
        }
      }

      return best.trim();
    }

    function normalizeSubKey(name, headerIndex){
      return `${normalizeText(name)}__h${headerIndex}`;
    }

    const headerIndices = [];
    for(let i=0;i<rows.length;i++){
      if(isHeaderAt(i)) headerIndices.push(i);
    }

    if(!headerIndices.length) return lines;

    for(let h=0; h<headerIndices.length; h++){
      const headerIndex = headerIndices[h];
      const nextHeaderIndex = h < headerIndices.length - 1 ? headerIndices[h+1] : rows.length;

      const headerRow = rows[headerIndex] || [];
      colDesc = getColIndex(headerRow, ["DESCRIPCIÓN","DESCRIPCION"]); if(colDesc < 0) colDesc = 0;
      colUnit = getColIndex(headerRow, ["UNIDAD"]); if(colUnit < 0) colUnit = 1;
      colQty  = getColIndex(headerRow, ["CANT/REND","CANT","CANTIDAD","CANT / REND","CANT. REND"]); if(colQty < 0) colQty = 2;
      colPU   = getColIndex(headerRow, ["PRECIO UNITARIO","VR UNITARIO","VALOR UNITARIO"]); if(colPU < 0) colPU = 3;
      colPar  = getColIndex(headerRow, ["VR PARCIAL","VALOR PARCIAL","PARCIAL"]); if(colPar < 0) colPar = 4;

      const subName = detectSubNameBeforeHeader(headerIndex);
      if(!subName) continue;

      const subKey = normalizeSubKey(subName, headerIndex);
      let currentGroup = "";

      for(let i = headerIndex + 1; i < nextHeaderIndex; i++){
        const row = rows[i] || [];
        const c0 = String(row[0]||"").trim();
        const joined = rowJoinedText(i);

        if(!joined) continue;
        if(isGlobalTitleRow(joined)) continue;

        if(isGroupRow(c0)){
          currentGroup = c0.replace(":","").trim();
          continue;
        }

        const desc = String(row[colDesc]||c0||"").trim();
        if(isIgnoreLine(desc)) continue;

        const unit = String(row[colUnit]||"").trim();
        const qty  = parseNumber(row[colQty]);
        const pu   = parseMoney(row[colPU]);
        const parcial = parseMoney(row[colPar]) || (qty * pu);

        const hasNumbers = Boolean(qty || pu || parcial);
        if(!desc || !hasNumbers) continue;

        lines.push({
          id: `${subKey}__${lines.length}`,
          subKey,
          subName,
          group: currentGroup || "",
          desc,
          unit,
          qty,
          pu,
          parcial
        });
      }
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
        itemCodeNorm: normalizeCode(currentCode),
        itemName: currentName,
        itemUnit: currentUnit,
        group: currentGroup || "",
        desc, unit, qty, pu, parcial
      });
    }

    return lines;
  }

  async function clearStore(name){
    const st = await store(name, "readwrite");
    await new Promise((res, rej)=>{
      const r = st.clear();
      r.onsuccess = ()=>res(true);
      r.onerror = ()=>rej(r.error || new Error("No se pudo limpiar " + name));
    });
  }

  async function putMany(name, arr){
    const st = await store(name, "readwrite");
    await new Promise((res, rej)=>{
      let i=0;
      function next(){
        if(i>=arr.length) return res(true);
        const r = st.put(arr[i]);
        r.onsuccess = ()=>{ i++; next(); };
        r.onerror = ()=>rej(r.error || new Error("Error guardando en " + name));
      }
      next();
    });
  }

  async function getMeta(baseKey){
    if(baseKey){
      return await getBaseMeta(baseKey);
    }
    const activeKey = await getActiveBaseKey();
    return activeKey ? await getBaseMeta(activeKey) : null;
  }

  async function loadItemsCache(baseKey){
    const key = await resolveBaseKey(baseKey);
    if(!key) return [];
    if(_itemsCacheByBase[key]) return _itemsCacheByBase[key];

    const st = await store(STORE_ITEMS, "readonly");
    const idx = st.index("by_base");
    const items = [];
    await new Promise((res, rej)=>{
      const r = idx.openCursor(IDBKeyRange.only(key));
      r.onsuccess = ()=>{
        const cur = r.result;
        if(!cur) return res(true);
        items.push(cur.value);
        cur.continue();
      };
      r.onerror = ()=>rej(r.error || new Error("No se pudo recorrer items"));
    });

    _itemsCacheByBase[key] = items;
    return items;
  }

  async function buildSubKeysCache(baseKey){
    const key = await resolveBaseKey(baseKey);
    if(!key) return new Set();
    if(_subKeysCacheByBase[key]) return _subKeysCacheByBase[key];

    const st = await store(STORE_SUB, "readonly");
    const idx = st.index("by_base");
    const keys = new Set();

    await new Promise((res, rej)=>{
      const r = idx.openCursor(IDBKeyRange.only(key));
      r.onsuccess = ()=>{
        const cur = r.result;
        if(!cur) return res(true);
        keys.add(cur.value.subKey);
        cur.continue();
      };
      r.onerror = ()=>rej(r.error || new Error("No se pudo recorrer sub"));
    });

    _subKeysCacheByBase[key] = keys;
    return keys;
  }

  async function search(query, limit=20, baseKey){
    const qRaw = String(query || "").trim();
    const q = normalizeText(qRaw);
    if(!q) return [];

    const items = await loadItemsCache(baseKey);
    const qNorm = normalizeCode(qRaw);
    const isCodeLike = /^\d+(\.\d+)*$/.test(qRaw);

    if(isCodeLike){
      const byCode = items.filter(it =>
        String(it.code||"").trim() === qRaw ||
        String(it.code||"").trim().startsWith(qRaw + ".") ||
        String(it.code||"").trim().startsWith(qRaw)
      );

      if(byCode.length){
        return byCode.slice(0, limit);
      }
    }

    const scored = items.map(it=>{
      let score = 0;

      const code = String(it.code||"").trim();
      const codeNorm = String(it.codeNorm||"").trim();
      const desc = normalizeText(it.desc);
      const chapterCode = normalizeText(it.chapterCode);
      const chapterName = normalizeText(it.chapterName);

      if(code === qRaw) score += 100;
      if(codeNorm === qNorm && qNorm) score += 80;
      if(code.startsWith(qRaw + ".")) score += 60;
      if(code.startsWith(qRaw)) score += 35;

      if(desc === q) score += 90;
      else if(desc.includes(q)) score += 35;

      if(chapterCode.includes(q)) score += 8;
      if(chapterName.includes(q)) score += 8;

      return { it, score };
    })
    .filter(x => x.score > 0)
    .sort((a,b)=> b.score - a.score)
    .slice(0, limit)
    .map(x => x.it);

    return scored;
  }

  async function getByCode(code, baseKey){
    const key = String(code||"").trim();
    if(!key) return null;

    const resolvedBaseKey = await resolveBaseKey(baseKey);
    if(!resolvedBaseKey) return null;

    const st = await store(STORE_ITEMS, "readonly");
    const idx = st.index("by_base_code");

    const exact = await new Promise((res, rej)=>{
      const r = idx.get([resolvedBaseKey, key]);
      r.onsuccess = ()=>res(r.result || null);
      r.onerror = ()=>rej(r.error || new Error("No se pudo leer item"));
    });
    if(exact) return exact;

    const items = await loadItemsCache(resolvedBaseKey);

    let found = items.find(it => String(it.code||"").trim() === key);
    if(found) return found;

    const keyNorm = normalizeCode(key);
    found = items.find(it => String(it.codeNorm||"").trim() === keyNorm);
    if(found) return found;

    return null;
  }

  async function listCostosDirectos(code, baseKey){
    const key = String(code||"").trim();
    if(!key) return [];

    const resolvedBaseKey = await resolveBaseKey(baseKey);
    if(!resolvedBaseKey) return [];

    const st = await store(STORE_CD, "readonly");
    const idx = st.index("by_base_item");
    const out = [];

    await new Promise((res, rej)=>{
      const r = idx.openCursor(IDBKeyRange.only([resolvedBaseKey, key]));
      r.onsuccess = ()=>{
        const cur = r.result;
        if(!cur) return res(true);
        out.push(cur.value);
        cur.continue();
      };
      r.onerror = ()=>rej(r.error || new Error("No se pudo listar CD"));
    });

    if(out.length) return out;

    const idxNorm = st.index("by_base_itemNorm");
    const out2 = [];
    const wantedNorm = normalizeCode(key);

    await new Promise((res, rej)=>{
      const r = idxNorm.openCursor(IDBKeyRange.only([resolvedBaseKey, wantedNorm]));
      r.onsuccess = ()=>{
        const cur = r.result;
        if(!cur) return res(true);
        out2.push(cur.value);
        cur.continue();
      };
      r.onerror = ()=>rej(r.error || new Error("No se pudo listar CD (normalizado)"));
    });

    return out2;
  }

  async function listSubLines(subKey, baseKey){
    const resolvedBaseKey = await resolveBaseKey(baseKey);
    if(!resolvedBaseKey) return [];
    const st = await store(STORE_SUB, "readonly");
    const idx = st.index("by_base_sub");
    const out = [];
    await new Promise((res, rej)=>{
      const r = idx.openCursor(IDBKeyRange.only([resolvedBaseKey, String(subKey||"").trim()]));
      r.onsuccess = ()=>{
        const cur = r.result;
        if(!cur) return res(true);
        out.push(cur.value);
        cur.continue();
      };
      r.onerror = ()=>rej(r.error || new Error("No se pudo listar Sub"));
    });
    return out;
  }

  async function getAPU(code, baseKey){
    const resolvedBaseKey = await resolveBaseKey(baseKey);
    const item = await getByCode(code, resolvedBaseKey);
    if(!item) return null;

    const lines = await listCostosDirectos(item.code || code, resolvedBaseKey);
    const subKeys = await buildSubKeysCache(resolvedBaseKey);

    const lines2 = lines.map(l=>{
      const key = normalizeText(l.desc);
      return { ...l, subRef: subKeys.has(key) ? key : "" };
    });

    const directo = lines2.reduce((s,l)=> s + Number(l.parcial||0), 0);

    return {
      mode: "item",
      baseKey: resolvedBaseKey,
      header: `${item.code} — ${item.desc||""}`,
      title: `APU ${item.code}`,
      subtitle: item.desc || "",
      metaLine: `Fuente: Costos_Directos · Base ${resolvedBaseKey} · Capítulo ${item.chapterCode||"-"} ${item.chapterName||""}`,
      unit: item.unit || "",
      directo: item.pu || directo,
      lines: lines2
    };
  }

  async function getSubAPU(subKey, baseKey){
    const resolvedBaseKey = await resolveBaseKey(baseKey);
    const key = String(subKey||"").trim();
    if(!key || !resolvedBaseKey) return null;
    const lines = await listSubLines(key, resolvedBaseKey);
    if(!lines.length) return null;

    const name = lines[0].subName || key;
    const directo = lines.reduce((s,l)=> s + Number(l.parcial||0), 0);

    return {
      mode: "sub",
      baseKey: resolvedBaseKey,
      header: name,
      title: "SUBPRODUCTO",
      subtitle: name,
      metaLine: `Fuente: Subproductos · Base ${resolvedBaseKey}`,
      unit: "",
      directo,
      lines: lines.map(l=>({ ...l, subRef:"" }))
    };
  }

  async function listBaseChapters(baseKey){
    const items = await loadItemsCache(baseKey);
    const chapters = items.filter(x=>x.isChapter).map(x=>({
      chapterCode: String(x.code||"").trim(),
      chapterName: String(x.desc||"").trim()
    }));
    chapters.sort((a,b)=> Number(a.chapterCode) - Number(b.chapterCode));
    return chapters;
  }

  async function searchInsumos(query, limit=30, baseKey){
    const q = normalizeText(query);
    const resolvedBaseKey = await resolveBaseKey(baseKey);
    if(!resolvedBaseKey) return [];
    const st = await store(STORE_INSUM, "readonly");
    const idx = st.index("by_base");
    const out = [];
    await new Promise((res, rej)=>{
      const r = idx.openCursor(IDBKeyRange.only(resolvedBaseKey));
      r.onsuccess = ()=>{
        const cur = r.result;
        if(!cur) return res(true);
        const v = cur.value;
        const hit = normalizeText(v.tipo).includes(q) || normalizeText(v.desc).includes(q) || normalizeText(v.unit).includes(q);
        if(hit) out.push(v);
        if(out.length >= limit) return res(true);
        cur.continue();
      };
      r.onerror = ()=>rej(r.error || new Error("No se pudo recorrer insumos"));
    });
    return out;
  }

  async function listSubproductos(limit, baseKey){
    const resolvedBaseKey = await resolveBaseKey(baseKey);
    if(!resolvedBaseKey) return [];
    const st = await store(STORE_SUB, "readonly");
    const idx = st.index("by_base");
    const out = [];
    const seen = new Set();

    await new Promise((res, rej)=>{
      const r = idx.openCursor(IDBKeyRange.only(resolvedBaseKey));
      r.onsuccess = ()=>{
        const cur = r.result;
        if(!cur) return res(true);
        const v = cur.value;
        if(!seen.has(v.subKey)){
          seen.add(v.subKey);
          out.push({ subKey: v.subKey, subName: v.subName });
        }
        if(Number.isFinite(limit) && limit > 0 && out.length >= limit) return res(true);
        cur.continue();
      };
      r.onerror = ()=>rej(r.error || new Error("No se pudo listar Sub"));
    });
    return out;
  }

  async function installFromFile(file, explicitBaseKey){
    if(typeof XLSX === "undefined") throw new Error("XLSX no está cargado.");
    if(!file) throw new Error("Falta archivo XLSX.");

    await ensureLegacyMigratedIfNeeded();

    const enteredBaseKey = safeBaseKey(explicitBaseKey || prompt(
      "Ingrese el período de la base que va a importar.\n\nEjemplos:\n2026_T1\n2026_T2\n2026_T3\n2026_T4",
      ""
    ));
    if(!enteredBaseKey){
      throw new Error("Importación cancelada: no se indicó período para la base.");
    }

    const ab = await file.arrayBuffer();
    const wb = XLSX.read(ab, { type:"array" });

    for(const sh of SHEETS_REQUIRED){
      if(!wb.Sheets[sh]) throw new Error(`Falta la hoja requerida: ${sh}`);
    }

    const items = extractFormularioItems(wb).map(it => ({
      ...it,
      baseKey: enteredBaseKey,
      id: makeScopedId(enteredBaseKey, it.code || it.id || Math.random())
    }));

    const cdLines = extractCostosDirectosLines(wb).map((ln, i) => ({
      ...ln,
      baseKey: enteredBaseKey,
      id: makeScopedId(enteredBaseKey, ln.id || `${ln.itemCode || "cd"}__${i}`)
    }));

    const subLines = extractSubproductosLines(wb).map((ln, i) => ({
      ...ln,
      baseKey: enteredBaseKey,
      id: makeScopedId(enteredBaseKey, ln.id || `${ln.subKey || "sub"}__${i}`)
    }));

    const insumos = extractInsumos(wb).map((ins, i) => ({
      ...ins,
      baseKey: enteredBaseKey,
      id: makeScopedId(enteredBaseKey, ins.key || `${ins.desc || "ins"}__${i}`)
    }));

    await deleteBase(enteredBaseKey);

    if(items.length) await putMany(STORE_ITEMS, items);
    if(cdLines.length) await putMany(STORE_CD, cdLines);
    if(subLines.length) await putMany(STORE_SUB, subLines);
    if(insumos.length) await putMany(STORE_INSUM, insumos);

    const meta = {
      importedAt: new Date().toISOString(),
      fileName: String(file.name || "base.xlsx"),
      counts: {
        items: items.length,
        cdLines: cdLines.length,
        subLines: subLines.length,
        insumos: insumos.length
      }
    };
    await setBaseMeta(enteredBaseKey, meta);
    await setActiveBase(enteredBaseKey);

    resetCaches();

    return { baseKey: enteredBaseKey, ...meta };
  }

  async function clearAll(){
    await clearStore(STORE_META);
    await clearStore(STORE_ITEMS);
    await clearStore(STORE_CD);
    await clearStore(STORE_SUB);
    await clearStore(STORE_INSUM);
    resetCaches();
    return true;
  }

  async function deleteBaseDatabase(){
    resetCaches();
    _dbPromise = null;

    await new Promise((res)=>{
      const req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = ()=>res(true);
      req.onerror = ()=>res(true);
      req.onblocked = ()=>res(true);
    });

    return true;
  }

  /* =========================================================
     ✅ Funciones para VISOR (Consultas Base APU)  /* =========================================================
     ✅ Funciones para VISOR (Consultas Base APU)
     - ahora muestran TODO, también con buscador
     ========================================================= */

  async function listFormularioItems(query="", limit, baseKey){
    const items = await loadItemsCache(baseKey);
    const qRaw = String(query || "").trim();
    const q = normalizeText(qRaw);
    const qNorm = normalizeCode(qRaw);

    let arr = items;

    if(q){
      arr = items.map(it=>{
        let score = 0;

        const code = String(it.code||"").trim();
        const codeNorm = String(it.codeNorm||"").trim();
        const desc = normalizeText(it.desc);
        const chapterCode = normalizeText(it.chapterCode);
        const chapterName = normalizeText(it.chapterName);

        if(code === qRaw) score += 100;
        if(codeNorm === qNorm && qNorm) score += 80;
        if(code.startsWith(qRaw + ".")) score += 60;
        if(code.startsWith(qRaw)) score += 35;

        if(desc === q) score += 90;
        else if(desc.includes(q)) score += 35;

        if(chapterCode.includes(q)) score += 8;
        if(chapterName.includes(q)) score += 8;

        return { it, score };
      })
      .filter(x => x.score > 0)
      .sort((a,b)=> b.score - a.score)
      .map(x => x.it);
    }

    if(Number.isFinite(limit) && limit > 0) return arr.slice(0, limit);
    return arr;
  }

  async function listCostosDirectosAll(query="", limit, baseKey){
    const qRaw = String(query || "").trim();
    const q = normalizeText(qRaw);
    const qNorm = normalizeCode(qRaw);
    const resolvedBaseKey = await resolveBaseKey(baseKey);
    if(!resolvedBaseKey) return [];
    const st = await store(STORE_CD, "readonly");
    const idx = st.index("by_base");
    const out = [];

    await new Promise((res, rej)=>{
      const r = idx.openCursor(IDBKeyRange.only(resolvedBaseKey));
      r.onsuccess = ()=>{
        const cur = r.result;
        if(!cur) return res(true);

        const v = cur.value;

        let hit = !q;
        if(q){
          const itemCode = String(v.itemCode||"").trim();
          const itemCodeNorm = String(v.itemCodeNorm||"").trim();
          const itemName = normalizeText(v.itemName);
          const group = normalizeText(v.group);
          const desc = normalizeText(v.desc);
          const unit = normalizeText(v.unit);

          hit =
            itemCode === qRaw ||
            itemCodeNorm === qNorm ||
            itemCode.startsWith(qRaw + ".") ||
            itemCode.startsWith(qRaw) ||
            itemName.includes(q) ||
            group.includes(q) ||
            desc.includes(q) ||
            unit.includes(q);
        }

        if(hit) out.push(v);

        if(Number.isFinite(limit) && limit > 0 && out.length >= limit) return res(true);
        cur.continue();
      };
      r.onerror = ()=>rej(r.error || new Error("No se pudo recorrer Costos_Directos"));
    });

    return out;
  }

  async function listInsumos(query="", limit, baseKey){
    const q = normalizeText(query);
    const resolvedBaseKey = await resolveBaseKey(baseKey);
    if(!resolvedBaseKey) return [];
    const st = await store(STORE_INSUM, "readonly");
    const idx = st.index("by_base");
    const out = [];

    await new Promise((res, rej)=>{
      const r = idx.openCursor(IDBKeyRange.only(resolvedBaseKey));
      r.onsuccess = ()=>{
        const cur = r.result;
        if(!cur) return res(true);

        const v = cur.value;
        const hit = !q || (
          normalizeText(v.tipo).includes(q) ||
          normalizeText(v.desc).includes(q) ||
          normalizeText(v.unit).includes(q)
        );

        if(hit) out.push(v);

        if(Number.isFinite(limit) && limit > 0 && out.length >= limit) return res(true);
        cur.continue();
      };
      r.onerror = ()=>rej(r.error || new Error("No se pudo recorrer insumos"));
    });

    return out;
  }

  /* =========================================================
     ✅ NUEVO: ayuda para reparar cruces históricos SIN reinstalar base
     - dado un desc + unit, devuelve el mejor código APU real posible
     - sirve para rescatar proyectos viejos donde apuRefCode quedó mal
     ========================================================= */
  async function findBestCodeByDesc(desc, unit, baseKey){
    const best = await findBestItemByDesc(desc, unit, baseKey);
    return best ? String(best.code || "").trim() : "";
  }

  /* =========================================================
     ✅ NUEVO: resolver código real priorizando exactitud
     - 1) exacto por código dado
     - 2) si no existe, por descripción/unidad
     ========================================================= */
  async function resolveRealItemCode(inputCode, desc, unit, baseKey){
    const code = String(inputCode || "").trim();
    if(code){
      const exact = await getByCode(code, baseKey);
      if(exact && exact.code) return String(exact.code).trim();
    }

    const byDesc = await findBestCodeByDesc(desc, unit, baseKey);
    if(byDesc) return byDesc;

    return "";
  }

  /* =========================================================
     ✅ NUEVO: resolver item real completo
     ========================================================= */
  async function resolveRealItem(inputCode, desc, unit, baseKey){
    const realCode = await resolveRealItemCode(inputCode, desc, unit, baseKey);
    if(!realCode) return null;
    return await getByCode(realCode, baseKey);
  }

  window.APUBase = {
    installFromFile,
    getMeta,
    getBaseMeta,
    listBases,
    getActiveBaseKey,
    setActiveBase,
    deleteBase,
    search,
    getByCode,
    getAPU,
    getSubAPU,
    listBaseChapters,
    searchInsumos,
    listSubproductos,

    clearAll,
    deleteBaseDatabase,

    listFormularioItems,
    listCostosDirectosAll,
    listInsumos,

    findBestCodeByDesc,
    resolveRealItemCode,
    resolveRealItem
  };

})();
