(function(){
  window.APUBase = window.APUBase || {};

  const DB_NAME = "apu_base_v1";
  const DB_VER = 3;

  const STORE_META  = "meta";
  const STORE_ITEMS = "items";
  const STORE_CD    = "cd_lines";
  const STORE_SUB   = "sub_lines";
  const STORE_INSUM = "insumos";

  let _dbPromise = null;
  let _itemsCache = null;
  let _subKeysCache = null;

  const SHEETS_REQUIRED = [
    "FORMULARIO DE PRECIOS",
    "Costos_Directos",
    "Subproductos",
    "Insumos"
  ];

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
          db.createObjectStore(STORE_ITEMS, { keyPath:"code" });
        }

        if(!db.objectStoreNames.contains(STORE_CD)){
          const st = db.createObjectStore(STORE_CD, { keyPath:"id" });
          st.createIndex("by_item", "itemCode", { unique:false });
        }else{
          const st = req.transaction.objectStore(STORE_CD);
          if(!st.indexNames.contains("by_item")) st.createIndex("by_item","itemCode",{unique:false});
        }

        if(!db.objectStoreNames.contains(STORE_SUB)){
          const st = db.createObjectStore(STORE_SUB, { keyPath:"id" });
          st.createIndex("by_sub", "subKey", { unique:false });
        }else{
          const st = req.transaction.objectStore(STORE_SUB);
          if(!st.indexNames.contains("by_sub")) st.createIndex("by_sub","subKey",{unique:false});
        }

        if(!db.objectStoreNames.contains(STORE_INSUM)){
          db.createObjectStore(STORE_INSUM, { keyPath:"key" });
        }
      };

      req.onsuccess = ()=> resolve(req.result);
      req.onerror = ()=> reject(req.error || new Error("No se pudo abrir DB base"));
    });

    return _dbPromise;
  }

  async function store(name, mode="readonly"){
    const db = await openDB();
    return db.transaction(name, mode).objectStore(name);
  }

  function normalizeText(s){
    return String(s||"")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/\s+/g," ")
      .trim();
  }

  /* =========================================================
     ✅ NUEVO: normalización robusta de códigos APU
     - Igualar 1.9 con 1.09
     - Igualar 01.09 con 1.09
     - Igualar 3 con 3
     ========================================================= */
  function normalizeCode(code){
    const raw = String(code || "").trim();
    if(!raw) return "";

    // dejar solo dígitos y puntos
    const safe = raw.replace(/[^\d.]/g, "");
    if(!safe) return "";

    const parts = safe.split(".").filter(Boolean);
    if(!parts.length) return "";

    const first = String(parseInt(parts[0], 10));
    if(parts.length === 1){
      return Number.isFinite(Number(first)) ? first : raw;
    }

    const rest = parts.slice(1).map((p, idx)=>{
      const n = String(parseInt(p, 10));
      if(!Number.isFinite(Number(n))) return p;
      // solo el primer decimal se lleva a 2 dígitos porque así vienen muchos APUs tipo 1.09
      return idx === 0 ? n.padStart(2, "0") : n;
    });

    return [first, ...rest].join(".");
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

  async function setMeta(meta){
    const st = await store(STORE_META, "readwrite");
    await new Promise((res, rej)=>{
      const r = st.put({ key:"meta", ...meta });
      r.onsuccess = ()=>res(true);
      r.onerror = ()=>rej(r.error || new Error("No se pudo guardar meta"));
    });
  }

  async function getMeta(){
    const st = await store(STORE_META, "readonly");
    return await new Promise((res, rej)=>{
      const r = st.get("meta");
      r.onsuccess = ()=>res(r.result || null);
      r.onerror = ()=>rej(r.error || new Error("No se pudo leer meta"));
    });
  }

  async function loadItemsCache(){
    if(_itemsCache) return _itemsCache;

    const st = await store(STORE_ITEMS, "readonly");
    const items = [];
    await new Promise((res, rej)=>{
      const r = st.openCursor();
      r.onsuccess = ()=>{
        const cur = r.result;
        if(!cur) return res(true);
        items.push(cur.value);
        cur.continue();
      };
      r.onerror = ()=>rej(r.error || new Error("No se pudo recorrer items"));
    });

    _itemsCache = items;
    return items;
  }

  async function buildSubKeysCache(){
    if(_subKeysCache) return _subKeysCache;

    const st = await store(STORE_SUB, "readonly");
    const idx = st.index("by_sub");
    const keys = new Set();

    await new Promise((res, rej)=>{
      const r = idx.openCursor();
      r.onsuccess = ()=>{
        const cur = r.result;
        if(!cur) return res(true);
        keys.add(cur.value.subKey);
        cur.continue();
      };
      r.onerror = ()=>rej(r.error || new Error("No se pudo recorrer sub"));
    });

    _subKeysCache = keys;
    return keys;
  }
  async function search(query, limit=20){
    const qRaw = String(query || "").trim();
    const q = normalizeText(qRaw);
    if(!q) return [];

    const items = await loadItemsCache();
    const qNorm = normalizeCode(qRaw);
    const isCodeLike = /^\d+(\.\d+)*$/.test(qRaw);

    if(isCodeLike){
      const r = items.filter(it =>
        String(it.code||"").startsWith(qRaw) ||
        String(it.codeNorm||"").startsWith(qNorm) ||
        codeEquals(it.code, qRaw)
      ).slice(0, limit);
      if(r.length) return r;
    }

    return items.filter(it =>
      normalizeText(it.desc).includes(q) ||
      normalizeText(it.code).includes(q) ||
      normalizeText(it.codeNorm).includes(q) ||
      (qNorm && codeEquals(it.code, qRaw))
    ).slice(0, limit);
  }

  async function getByCode(code){
    const key = String(code||"").trim();
    if(!key) return null;

    const st = await store(STORE_ITEMS, "readonly");

    // 1) intento exacto
    const exact = await new Promise((res, rej)=>{
      const r = st.get(key);
      r.onsuccess = ()=>res(r.result || null);
      r.onerror = ()=>rej(r.error || new Error("No se pudo leer item"));
    });
    if(exact) return exact;

    // 2) intento por código normalizado (🔥 FIX)
    const items = await loadItemsCache();
    const found = items.find(it => codeEquals(it.code, key));
    return found || null;
  }

  async function listCostosDirectos(code){
    const key = String(code||"").trim();
    if(!key) return [];

    const st = await store(STORE_CD, "readonly");
    const idx = st.index("by_item");
    const out = [];

    // 1) intento exacto
    await new Promise((res, rej)=>{
      const r = idx.openCursor(IDBKeyRange.only(key));
      r.onsuccess = ()=>{
        const cur = r.result;
        if(!cur) return res(true);
        out.push(cur.value);
        cur.continue();
      };
      r.onerror = ()=>rej(r.error || new Error("No se pudo listar CD"));
    });

    if(out.length) return out;

    // 2) intento por código normalizado (🔥 FIX)
    const out2 = [];
    const wantedNorm = normalizeCode(key);

    await new Promise((res, rej)=>{
      const r = idx.openCursor();
      r.onsuccess = ()=>{
        const cur = r.result;
        if(!cur) return res(true);

        const v = cur.value;
        if(codeEquals(v.itemCode, wantedNorm)){
          out2.push(v);
        }
        cur.continue();
      };
      r.onerror = ()=>rej(r.error || new Error("No se pudo listar CD (normalizado)"));
    });

    return out2;
  }

  async function listSubLines(subKey){
    const st = await store(STORE_SUB, "readonly");
    const idx = st.index("by_sub");
    const out = [];
    await new Promise((res, rej)=>{
      const r = idx.openCursor(IDBKeyRange.only(String(subKey||"").trim()));
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

  async function getAPU(code){
    const item = await getByCode(code);
    if(!item) return null;

    const lines = await listCostosDirectos(code);
    const subKeys = await buildSubKeysCache();

    const lines2 = lines.map(l=>{
      const key = normalizeText(l.desc);
      return { ...l, subRef: subKeys.has(key) ? key : "" };
    });

    const directo = lines2.reduce((s,l)=> s + Number(l.parcial||0), 0);

    return {
      mode: "item",
      header: `${item.code} — ${item.desc||""}`,
      title: `APU ${item.code}`,
      subtitle: item.desc || "",
      metaLine: `Fuente: Costos_Directos · Capítulo ${item.chapterCode||"-"} ${item.chapterName||""}`,
      unit: item.unit || "",
      directo: item.pu || directo,
      lines: lines2
    };
  }

  async function getSubAPU(subKey){
    const key = String(subKey||"").trim();
    if(!key) return null;
    const lines = await listSubLines(key);
    if(!lines.length) return null;

    const name = lines[0].subName || key;
    const directo = lines.reduce((s,l)=> s + Number(l.parcial||0), 0);

    return {
      mode: "sub",
      header: name,
      title: "SUBPRODUCTO",
      subtitle: name,
      metaLine: "Fuente: Subproductos",
      unit: "",
      directo,
      lines: lines.map(l=>({ ...l, subRef:"" }))
    };
  }

  async function listBaseChapters(){
    const items = await loadItemsCache();
    const chapters = items.filter(x=>x.isChapter).map(x=>({
      chapterCode: String(x.code||"").trim(),
      chapterName: String(x.desc||"").trim()
    }));
    chapters.sort((a,b)=> Number(a.chapterCode) - Number(b.chapterCode));
    return chapters;
  }

  async function searchInsumos(query, limit=30){
    const q = normalizeText(query);
    if(!q) return [];
    const st = await store(STORE_INSUM, "readonly");
    const out = [];
    await new Promise((res, rej)=>{
      const r = st.openCursor();
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

  async function listSubproductos(limit=200){
    const st = await store(STORE_SUB, "readonly");
    const idx = st.index("by_sub");
    const out = [];
    const seen = new Set();

    await new Promise((res, rej)=>{
      const r = idx.openCursor();
      r.onsuccess = ()=>{
        const cur = r.result;
        if(!cur) return res(true);
        const v = cur.value;
        if(!seen.has(v.subKey)){
          seen.add(v.subKey);
          out.push({ subKey: v.subKey, subName: v.subName });
        }
        if(out.length >= limit) return res(true);
        cur.continue();
      };
      r.onerror = ()=>rej(r.error || new Error("No se pudo listar Sub"));
    });
    return out;
  }

  async function installFromFile(file){
    if(typeof XLSX === "undefined") throw new Error("XLSX no está cargado.");
    if(!file) throw new Error("Falta archivo XLSX.");

    const ab = await file.arrayBuffer();
    const wb = XLSX.read(ab, { type:"array" });

    for(const sh of SHEETS_REQUIRED){
      if(!wb.Sheets[sh]) throw new Error(`Falta la hoja requerida: ${sh}`);
    }

    const items = extractFormularioItems(wb);
    const cdLines = extractCostosDirectosLines(wb);
    const subLines = extractSubproductosLines(wb);
    const insumos = extractInsumos(wb);

    await clearStore(STORE_META);
    await clearStore(STORE_ITEMS);
    await clearStore(STORE_CD);
    await clearStore(STORE_SUB);
    await clearStore(STORE_INSUM);

    await putMany(STORE_ITEMS, items);
    await putMany(STORE_CD, cdLines);
    await putMany(STORE_SUB, subLines);
    await putMany(STORE_INSUM, insumos);

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
    await setMeta(meta);

    _itemsCache = null;
    _subKeysCache = null;

    return meta;
  }

  async function clearAll(){
    await clearStore(STORE_META);
    await clearStore(STORE_ITEMS);
    await clearStore(STORE_CD);
    await clearStore(STORE_SUB);
    await clearStore(STORE_INSUM);
    _itemsCache = null;
    _subKeysCache = null;
    return true;
  }

  async function deleteBaseDatabase(){
    _itemsCache = null;
    _subKeysCache = null;
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
     ✅ NUEVO: Funciones para VISOR (Consultas Base APU)
     (solo lectura, no afectan nada más)
     ========================================================= */

  // Lista items del formulario (desde cache) con filtro opcional
  async function listFormularioItems(query="", limit=200){
    const items = await loadItemsCache();
    const qRaw = String(query || "").trim();
    const q = normalizeText(qRaw);
    const qNorm = normalizeCode(qRaw);

    const arr = !q
      ? items
      : items.filter(it =>
          normalizeText(it.code).includes(q) ||
          normalizeText(it.desc).includes(q) ||
          normalizeText(it.chapterCode).includes(q) ||
          normalizeText(it.chapterName).includes(q) ||
          normalizeText(it.codeNorm).includes(q) ||
          (qNorm && codeEquals(it.code, qRaw))
        );

    return arr.slice(0, limit);
  }

  // Lista líneas de Costos Directos (recorriendo store) con filtro opcional
  async function listCostosDirectosAll(query="", limit=250){
    const qRaw = String(query || "").trim();
    const q = normalizeText(qRaw);
    const qNorm = normalizeCode(qRaw);
    const st = await store(STORE_CD, "readonly");
    const out = [];

    await new Promise((res, rej)=>{
      const r = st.openCursor();
      r.onsuccess = ()=>{
        const cur = r.result;
        if(!cur) return res(true);

        const v = cur.value;
        const hit = !q || (
          normalizeText(v.itemCode).includes(q) ||
          normalizeText(v.itemName).includes(q) ||
          normalizeText(v.group).includes(q) ||
          normalizeText(v.desc).includes(q) ||
          normalizeText(v.unit).includes(q) ||
          normalizeText(v.itemCodeNorm).includes(q) ||
          (qNorm && codeEquals(v.itemCode, qRaw))
        );

        if(hit) out.push(v);
        if(out.length >= limit) return res(true);

        cur.continue();
      };
      r.onerror = ()=>rej(r.error || new Error("No se pudo recorrer Costos_Directos"));
    });

    return out;
  }

  // Lista insumos (si no hay query devuelve primeros N)
  async function listInsumos(query="", limit=250){
    const q = normalizeText(query);
    const st = await store(STORE_INSUM, "readonly");
    const out = [];

    await new Promise((res, rej)=>{
      const r = st.openCursor();
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
        if(out.length >= limit) return res(true);

        cur.continue();
      };
      r.onerror = ()=>rej(r.error || new Error("No se pudo recorrer insumos"));
    });

    return out;
  }

  window.APUBase = {
    installFromFile,
    getMeta,
    search,
    getByCode,
    getAPU,
    getSubAPU,
    listBaseChapters,
    searchInsumos,
    listSubproductos,

    // ✅ NUEVOS
    clearAll,
    deleteBaseDatabase,

    // ✅ NUEVOS (visor)
    listFormularioItems,
    listCostosDirectosAll,
    listInsumos
  };
})();