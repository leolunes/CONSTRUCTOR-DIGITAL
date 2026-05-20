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

  async function findBestItemByDesc(desc, unit){
    const d = String(desc || "").trim();
    if(!d) return null;

    const items = await loadItemsCache();
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
    let currentSubName = "";
    let currentSubKey = "";
    let currentGroup = "";

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

    function detectSubNameBeforeHeader(headerIndex){
      let best = "";
      for(let k = headerIndex - 1; k >= Math.max(0, headerIndex - 15); k--){
        if(isHeaderAt(k)) break;

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

    for(let i=0;i<rows.length;i++){
      const row = rows[i] || [];
      const c0 = String(row[0]||"").trim();

      if(looksHeaderRow(row)){
        const detectedName = detectSubNameBeforeHeader(i);
        if(detectedName){
          currentSubName = detectedName;
          currentSubKey = `${normalizeText(currentSubName)}__h${i}`;
          currentGroup = "";
        }

        colDesc = getColIndex(row, ["DESCRIPCIÓN","DESCRIPCION"]); if(colDesc < 0) colDesc = 0;
        colUnit = getColIndex(row, ["UNIDAD"]); if(colUnit < 0) colUnit = 1;
        colQty  = getColIndex(row, ["CANT/REND","CANT","CANTIDAD","CANT / REND","CANT. REND"]); if(colQty < 0) colQty = 2;
        colPU   = getColIndex(row, ["PRECIO UNITARIO","VR UNITARIO","VALOR UNITARIO"]); if(colPU < 0) colPU = 3;
        colPar  = getColIndex(row, ["VR PARCIAL","VALOR PARCIAL","PARCIAL"]); if(colPar < 0) colPar = 4;
        continue;
      }

      if(!currentSubKey) continue;

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

    // ✅ búsqueda por código exacto o prefijo exacto, sin equivalencias agresivas
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

  async function getByCode(code){
    const key = String(code||"").trim();
    if(!key) return null;

    const st = await store(STORE_ITEMS, "readonly");

    const exact = await new Promise((res, rej)=>{
      const r = st.get(key);
      r.onsuccess = ()=>res(r.result || null);
      r.onerror = ()=>rej(r.error || new Error("No se pudo leer item"));
    });
    if(exact) return exact;

    const items = await loadItemsCache();

    // ✅ buscar exacto por texto primero
    let found = items.find(it => String(it.code||"").trim() === key);
    if(found) return found;

    // ✅ luego exacto por versión limpiada básica
    const keyNorm = normalizeCode(key);
    found = items.find(it => String(it.codeNorm||"").trim() === keyNorm);
    if(found) return found;

    return null;
  }

  async function listCostosDirectos(code){
    const key = String(code||"").trim();
    if(!key) return [];

    const st = await store(STORE_CD, "readonly");
    const idx = st.index("by_item");
    const out = [];

    // ✅ primero exacto por código tal cual
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

    // ✅ luego exacto por código normalizado básico
    const out2 = [];
    const wantedNorm = normalizeCode(key);

    await new Promise((res, rej)=>{
      const r = idx.openCursor();
      r.onsuccess = ()=>{
        const cur = r.result;
        if(!cur) return res(true);

        const v = cur.value;
        if(String(v.itemCodeNorm||"").trim() === wantedNorm){
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

    const lines = await listCostosDirectos(item.code || code);
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

  async function listSubproductos(limit){
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
        if(Number.isFinite(limit) && limit > 0 && out.length >= limit) return res(true);
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
     ✅ Funciones para VISOR (Consultas Base APU)
     - ahora muestran TODO, también con buscador
     ========================================================= */

  async function listFormularioItems(query="", limit){
    const items = await loadItemsCache();
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

    return arr;
  }
   async function listCostosDirectosAll(query="", limit){
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

        cur.continue();
      };
      r.onerror = ()=>rej(r.error || new Error("No se pudo recorrer Costos_Directos"));
    });

    return out;
  }

  async function listInsumos(query="", limit){
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
  async function findBestCodeByDesc(desc, unit){
    const best = await findBestItemByDesc(desc, unit);
    return best ? String(best.code || "").trim() : "";
  }

  /* =========================================================
     ✅ NUEVO: resolver código real priorizando exactitud
     - 1) exacto por código dado
     - 2) si no existe, por descripción/unidad
     ========================================================= */
  async function resolveRealItemCode(inputCode, desc, unit){
    const code = String(inputCode || "").trim();
    if(code){
      const exact = await getByCode(code);
      if(exact && exact.code) return String(exact.code).trim();
    }

    const byDesc = await findBestCodeByDesc(desc, unit);
    if(byDesc) return byDesc;

    return "";
  }

  /* =========================================================
     ✅ NUEVO: resolver item real completo
     ========================================================= */
  async function resolveRealItem(inputCode, desc, unit){
    const realCode = await resolveRealItemCode(inputCode, desc, unit);
    if(!realCode) return null;
    return await getByCode(realCode);
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
