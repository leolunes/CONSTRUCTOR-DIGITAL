(function(){
  /* =========================================================
     PDF.JS — ESTÁNDAR ÚNICO (TODOS LOS PDFs)
     Confirmado por usted:
     1) Portada institucional
     2) Contenido inicia limpio (sin repetir gran título)
     3) Firma siempre en la última página
     4) Encabezado superior solo desde página 2 en adelante

     ✅ ESTÁNDAR VISUAL DEFINIDO:
     - SIN sombreados (NO fill en títulos/headers/filas)
     - SIN contornos / cajas (NO rect en títulos/headers/celdas)
     - SOLO líneas horizontales finas (separadores)
     - Textos y filas NUNCA se montan (alto de fila dinámico)
     - Evitar cortes por ancho: columnas ajustadas + auto-fit numérico

     ✅ FIX NUEVO (2026-03):
     - Cuando el usuario CAMBIA el CÓDIGO visible del ítem, el PDF NO debe
       asumir que ese código corresponde al código real de la base.
     - Solución robusta: getAPUForProjectItem ahora:
         1) intenta apuRefCode (si existe)
         2) intenta code (tal cual, sin normalizar/padding)
         3) si falla: busca en la BASE por DESCRIPCIÓN (match fuerte) y usa ese code real
       Esto evita falsos mapeos tipo 1.9 -> 1.09 y evita “No se encontró descomposición”
       cuando el usuario renumera el presupuesto.

     ✅ AJUSTE NUEVO (2026-03 móvil):
     - Antes de exportar/compartir PDF se fuerza guardado del estado
     - Cuando la app pasa a segundo plano (share sheet / WhatsApp / visor PDF),
       se vuelve a forzar guardado
     - En móvil, la descarga intenta abrir el PDF en pestaña aparte para evitar
       que la PWA actual se desmonte

     ✅ AJUSTE NUEVO (2026-03 auditoría):
     - Compatibilidad con Presupuesto Base / Presupuesto Oficial
     - El PDF debe exportar el presupuesto visible/activo
     - NO rompe la lógica existente del presupuesto base

     ✅ AJUSTE NUEVO (2026-03 APU PDF):
     - El PDF ahora debe leer la misma lógica robusta del visor APU:
         a) override guardado dentro del proyecto
         b) override por helper de StorageAPI si existe
         c) custom APU global
         d) base APU por múltiples funciones compatibles
         e) fallback por búsqueda del código y por descripción
     - Esto corrige casos donde en pantalla sí aparece la descomposición,
       pero en PDF decía “No se encontró descomposición”.
     ========================================================= */

  // =========================
  // TEMA VISUAL (GLOBAL)
  // =========================
  const PDF_THEME = {
    safe: {
      top: 54,
      bottom: 64 // reserva real para footer
    },
    lines: {
      header: { w: 0.55, c: 120 },
      row:    { w: 0.35, c: 200 },
      band:   { w: 0.55, c: 160 }
    }
  };

  // =========================
  // Compat Base / Oficial
  // =========================
  function getBudgetModePDF(){
    try{
      const mode = String(
        window.UI?.getParam?.("budgetMode") ||
        window.UI?.getParam?.("mode") ||
        ""
      ).toLowerCase();

      if(mode === "oficial") return "oficial";
    }catch(_){}

    try{
      const sel = document.querySelector("#budgetMode");
      if(sel){
        const v = String(sel.value || "").toLowerCase();
        if(v === "oficial") return "oficial";
      }
    }catch(_){}

    return "base";
  }

  function cloneProjectWithBudgetViewPDF(project, mode){
    const p = project ? JSON.parse(JSON.stringify(project)) : {};
    const budgetMode = String(mode || "base").toLowerCase();

    if(budgetMode === "oficial"){
      p.items = Array.isArray(project?.oficialItems) ? project.oficialItems : [];
      p.chapters = Array.isArray(project?.oficialChapters) ? project.oficialChapters : [];
      p.apuOverrides = project?.oficialApuOverrides || project?.officialApuOverrides || {};
      p.__budgetMode = "oficial";
    }else{
      p.items = Array.isArray(project?.items) ? project.items : [];
      p.chapters = Array.isArray(project?.chapters) ? project.chapters : [];
      p.apuOverrides = project?.apuOverrides || {};
      p.__budgetMode = "base";
    }

    return p;
  }

  function getProjectForPDF(project, forcedMode){
    const mode = forcedMode || getBudgetModePDF();

    try{
      if(typeof window.getProjectView === "function"){
        return window.getProjectView(project, mode);
      }
    }catch(_){}

    return cloneProjectWithBudgetViewPDF(project, mode);
  }

  function getBudgetLabelPDF(mode){
    const m = String(mode || getBudgetModePDF()).toLowerCase();
    return m === "oficial" ? "PRESUPUESTO OFICIAL" : "PRESUPUESTO BASE";
  }

  function getProjectNameWithBudgetLabel(project, mode){
    const label = getBudgetLabelPDF(mode);
    const name = String(project?.name || "");
    return name ? `${name} · ${label}` : label;
  }

  // =========================
  // Formateadores / helpers
  // =========================
  function moneyCOP(n){  return "$ " + Math.round(Number(n||0)).toLocaleString("es-CO"); }
  function moneyCOP0(n){ return "$ " + Math.round(Number(n||0)).toLocaleString("es-CO"); }

  function fmt2(n){
    const v = Number(n||0);
    return v.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function fmt0(n){
    const v = Number(n||0);
    return Math.round(v).toLocaleString("es-CO");
  }
  function fmtQty(n){
    const v = Number(n||0);
    return v.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 6 });
  }
  function safe(s){ return String(s||""); }

  function sanitizeName(s){
    return String(s||"archivo")
      .replace(/[^\w\d]+/g,"_")
      .replace(/^_+|_+$/g,"")
      .slice(0,60) || "archivo";
  }

  function buildFilename(project, suffix=""){
    const name = sanitizeName(project?.name || "proyecto");
    return `Presupuesto_${name}${suffix ? "_"+suffix : ""}_${Date.now()}.pdf`;
  }
  function buildFilenameSpecs(project){
    const name = sanitizeName(project?.name || "proyecto");
    return `Especificaciones_Tecnicas_${name}_${Date.now()}.pdf`;
  }
  function buildFilenameDesagregado(project){
    const name = sanitizeName(project?.name || "proyecto");
    return `Presupuesto_Obra_Desagregado_${name}_${Date.now()}.pdf`;
  }
  function buildFilenameResumenDesagregado(project){
    const name = sanitizeName(project?.name || "proyecto");
    return `Resumen_Presupuesto_Obra_Desagregado_${name}_${Date.now()}.pdf`;
  }
  function buildFilenameDistribucionPctDirectos(project){
    const name = sanitizeName(project?.name || "proyecto");
    return `Distribucion_Porcentual_Costos_Directos_${name}_${Date.now()}.pdf`;
  }
  function buildFilenameRendimientos(project){
    const name = sanitizeName(project?.name || "proyecto");
    return `Rendimiento_Equipo_Mano_Obra_Por_Actividad_${name}_${Date.now()}.pdf`;
  }
  function buildFilenameResumenMaterialesActividad(project){
    const name = sanitizeName(project?.name || "proyecto");
    return `Resumen_Materiales_Por_Actividad_${name}_${Date.now()}.pdf`;
  }
  function buildFilenameCantRecursosInsumos(project){
    const name = sanitizeName(project?.name || "proyecto");
    return `Cantidad_Recursos_Insumos_Presupuesto_${name}_${Date.now()}.pdf`;
  }

  function newDoc(options){
    if(!window.jspdf?.jsPDF) throw new Error("jsPDF no está cargado.");
    const { jsPDF } = window.jspdf;

    const o = options || {};
    const orientation = o.orientation || "portrait";

    const doc = new jsPDF({
      unit: "pt",
      format: "letter",
      orientation
    });

    try{
      doc.setTextColor(0);
      doc.setDrawColor(0);
      doc.setFillColor(255,255,255);
    }catch(_){}

    return doc;
  }

  function getPageSize(doc){
    const w = doc.internal?.pageSize?.getWidth ? doc.internal.pageSize.getWidth() : 612;
    const h = doc.internal?.pageSize?.getHeight ? doc.internal.pageSize.getHeight() : 792;
    return { w, h };
  }

  // =========================
  // Persistencia móvil / guards
  // =========================
  let __pdfPersistHooksInstalled = false;

  function sleep(ms){
    return new Promise(res => setTimeout(res, ms));
  }

  function forcePersistAppState(){
    try{
      if(window.StorageAPI?.loadStore && window.StorageAPI?.saveStore){
        const db = StorageAPI.loadStore();
        StorageAPI.saveStore(db);
      }
    }catch(err){
      console.warn("[PDF] No se pudo forzar persistencia StorageAPI:", err);
    }

    try{
      if(navigator.storage && typeof navigator.storage.persist === "function"){
        navigator.storage.persist().catch(()=>{});
      }
    }catch(_){}

    try{
      sessionStorage.setItem("presupuesto_pro_last_pdf_ts", String(Date.now()));
      sessionStorage.setItem("presupuesto_pro_last_url", String(location.href || ""));
    }catch(_){}
  }

  function installPersistHooksOnce(){
    if(__pdfPersistHooksInstalled) return;
    __pdfPersistHooksInstalled = true;

    const persistNow = ()=>{
      try{ forcePersistAppState(); }catch(_){}
    };

    try{
      document.addEventListener("visibilitychange", ()=>{
        if(document.visibilityState === "hidden"){
          persistNow();
        }
      }, { passive:true });
    }catch(_){}

    try{
      window.addEventListener("pagehide", persistNow, { passive:true });
    }catch(_){}

    try{
      window.addEventListener("beforeunload", persistNow, { passive:true });
    }catch(_){}

    try{
      window.addEventListener("blur", persistNow, { passive:true });
    }catch(_){}
  }

  function isMobileLike(){
    try{
      const ua = navigator.userAgent || "";
      return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
    }catch(_){
      return false;
    }
  }

  // =========================
  // Líneas / Auto-fit / Column-fit
  // =========================
  function hLine(doc, x1, x2, y, w=0.35, c=200){
    doc.setDrawColor(c);
    doc.setLineWidth(w);
    doc.line(x1, y, x2, y);
    doc.setLineWidth(0.2);
    doc.setDrawColor(0);
  }

  function fitColsToWidth(cols, targetW, minW=18){
    const total = cols.reduce((s,c)=>s + (Number(c.w)||0), 0);
    if(total === targetW) return cols;

    if(total < targetW){
      const out = cols.map(c=>({ ...c }));
      const idx = out.findIndex(c => String(c.key||c.k||"") === "desc" || String(c.key||c.k||"") === "description");
      const useIdx = idx >= 0 ? idx : (out.length-1);
      out[useIdx].w = Math.max(minW, (out[useIdx].w||0) + (targetW-total));
      return out;
    }

    const scale = targetW / total;
    let acc = 0;
    const out = cols.map((c,i)=>{
      const w = (i === cols.length-1) ? 0 : Math.max(minW, Math.floor((Number(c.w)||0)*scale));
      acc += w;
      return { ...c, w };
    });
    out[out.length-1].w = Math.max(minW, Math.floor(targetW - acc));
    return out;
  }

  function fitTextRight(doc, text, maxW, baseFs, minFs=6.2){
    let fs = baseFs;
    doc.setFontSize(fs);
    while(fs > minFs && doc.getTextWidth(String(text)) > maxW){
      fs -= 0.2;
      doc.setFontSize(fs);
    }
    return fs;
  }

  function splitToLines(doc, text, maxW, maxLines){
    const lines = doc.splitTextToSize(safe(text), maxW);
    if(!maxLines) return lines;
    return lines.slice(0, maxLines);
  }

  function isAccesoriosPercentLine(ln){
    const d = String(ln?.desc || "").toLowerCase();
    const u = String(ln?.unit || "").trim().toLowerCase();
    return d.includes("accesorios") && (d.includes("%") || u === "%");
  }

  // =========================
  // Layout base (DINÁMICO a orientación)
  // =========================
  function mkLayout(doc){
    const { w: PAGE_W, h: PAGE_H } = getPageSize(doc);
    const margin = 44;
    const contentW = PAGE_W - margin*2;
    let y = (PDF_THEME?.safe?.top ?? 54);

    function ensure(h){
      const bottomLimit = PAGE_H - (PDF_THEME?.safe?.bottom ?? 64);
      if(y + h > bottomLimit){
        doc.addPage();
        try{
          doc.setTextColor(0);
          doc.setDrawColor(0);
          doc.setFillColor(255,255,255);
        }catch(_){}
        y = (PDF_THEME?.safe?.top ?? 54);
        return true;
      }
      return false;
    }

    function setY(v){ y = v; }
    function getY(){ return y; }

    function p(t){
      doc.setFont("helvetica","normal");
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(safe(t), contentW);
      const h = lines.length*13 + 8;
      ensure(h);
      doc.text(lines, margin, y);
      y += lines.length*13 + 6;
    }

    function row(label,value){
      ensure(18);
      doc.setFont("helvetica","bold"); doc.setFontSize(10);
      doc.text(safe(label), margin, y);
      doc.setFont("helvetica","normal");
      doc.text(safe(value), margin + 260, y);
      y += 16;
    }

    function line(){
      ensure(12);
      hLine(doc, margin, margin+contentW, y, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      y += 12;
    }

    const col = {
      item: margin + 0,
      desc: margin + 62,
      parc: margin + contentW,
      qty:  margin + contentW - 70,
      pu:   margin + contentW - 150,
      unit: margin + contentW - 230
    };
    const DESC_W = (col.unit - col.desc) - 12;

    function tableHeaderPresupuesto(){
      const yTop = y;
      const h = 18;
      ensure(h + 8);

      doc.setFont("helvetica","bold"); doc.setFontSize(9.2);
      const baseY = yTop + 12;

      doc.text("ITEM", col.item, baseY);
      doc.text("DESCRIPCIÓN", col.desc, baseY);
      doc.text("UNID", col.unit, baseY);
      doc.text("VR UNIT", col.pu, baseY, { align:"right" });
      doc.text("CANT", col.qty, baseY, { align:"right" });
      doc.text("VR PARCIAL", col.parc, baseY, { align:"right" });

      hLine(doc, margin, margin+contentW, yTop + h, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);

      y = yTop + h + 8;
    }

    function tableRowPresupuesto(it){
      const parcial = Number(it.pu||0) * Number(it.qty||0);
      const item = safe(it.code);
      const unit = safe(it.unit);

      doc.setFont("helvetica","normal"); doc.setFontSize(9.2);
      const descLines = doc.splitTextToSize(safe(it.desc), DESC_W).slice(0,3);

      const lineH = 11;
      const rowH = Math.max(18, 8 + (descLines.length * lineH));
      const jumped = ensure(rowH + 10);
      if(jumped) tableHeaderPresupuesto();

      const yTop = y;
      const baseY = yTop + 12;

      doc.setFont("helvetica","bold");
      doc.text(item, col.item, baseY);

      doc.setFont("helvetica","normal");
      doc.text(descLines, col.desc, baseY);

      doc.text(unit, col.unit, baseY);
      doc.text(moneyCOP(it.pu), col.pu, baseY, { align:"right" });
      doc.text(safe(it.qty), col.qty, baseY, { align:"right" });

      doc.setFont("helvetica","bold");
      doc.text(moneyCOP(parcial), col.parc, baseY, { align:"right" });

      hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      y = yTop + rowH + 2;
    }

    function shortGroup(g){
      const s = safe(g).trim();
      if(!s) return "-";
      const up = s.toUpperCase();
      if(up.includes("EQUIPO") && up.includes("HERRAM")) return "EQUIPO/HERR.";
      if(up.includes("MANO") && up.includes("OBRA")) return "MANO OBRA";
      if(up.includes("MATERIAL")) return "MATERIALES";
      if(up.includes("TRANSP")) return "TRANSPORTES";
      return s.length > 16 ? (s.slice(0,16) + "…") : s;
    }

    const aCol = {
      grp:  margin + 0,
      desc: margin + 150,
      parc: margin + contentW,
      pu:   margin + contentW - 110,
      qty:  margin + contentW - 180,
      unit: margin + contentW - 240
    };
    const A_DESC_W = (aCol.unit - aCol.desc) - 12;

    function tableHeaderAPU(){
      const yTop = y;
      const h = 18;
      ensure(h + 8);

      doc.setFont("helvetica","bold"); doc.setFontSize(9.2);
      const baseY = yTop + 12;

      doc.text("GRUPO", aCol.grp, baseY);
      doc.text("DESCRIPCIÓN", aCol.desc, baseY);
      doc.text("UNID", aCol.unit, baseY);
      doc.text("CANT", aCol.qty, baseY, { align:"right" });
      doc.text("VR UNIT", aCol.pu, baseY, { align:"right" });
      doc.text("VR PARCIAL", aCol.parc, baseY, { align:"right" });

      hLine(doc, margin, margin+contentW, yTop + h, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
      y = yTop + h + 8;
    }

    function tableRowAPU(lineObj){
      const grpRaw = safe(lineObj.group || lineObj.tipo || "-");
      const grp = shortGroup(grpRaw);
      const unit = safe(lineObj.unit || "");
      const qty = Number(lineObj.qty||0);
      const pu  = Number(lineObj.pu||0);
      const parcial = Number(lineObj.parcial||0) || (qty * pu);

      doc.setFont("helvetica","normal"); doc.setFontSize(9.2);
      const descLines = doc.splitTextToSize(safe(lineObj.desc), A_DESC_W).slice(0,3);

      const lineH = 11;
      const rowH = Math.max(18, 8 + (descLines.length * lineH));
      const jumped = ensure(rowH + 10);
      if(jumped) tableHeaderAPU();

      const yTop = y;
      const baseY = yTop + 12;

      doc.setFont("helvetica","normal");
      doc.text(grp, aCol.grp, baseY);
      doc.text(descLines, aCol.desc, baseY);

      doc.text(unit, aCol.unit, baseY);
      doc.text(String(qty||0), aCol.qty, baseY, { align:"right" });
      doc.text(moneyCOP(pu), aCol.pu, baseY, { align:"right" });

      doc.setFont("helvetica","bold");
      doc.text(moneyCOP(parcial), aCol.parc, baseY, { align:"right" });

      hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      y = yTop + rowH + 2;
    }

    return {
      PAGE_W, PAGE_H, margin, contentW,
      getY, setY,
      ensure, p, row, line,
      tableHeaderPresupuesto, tableRowPresupuesto,
      tableHeaderAPU, tableRowAPU
    };
  }

  function drawBand(doc, x, y, w, h, text, opts){
    const o = opts || {};
    const fs = o.fontSize || 10;
    const bold = (o.bold !== false);

    doc.setTextColor(0);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(fs);

    doc.text(safe(text), x, y + 12);

    hLine(doc, x, x+w, y + h - 2, PDF_THEME.lines.band.w, PDF_THEME.lines.band.c);
  }

  function drawCellText(doc, x, y, w, h, text, align, opts){
    const o = opts || {};
    const fs = o.fontSize || 7.2;
    const pad = o.pad ?? 2;

    doc.setFont("helvetica", o.bold ? "bold" : "normal");
    doc.setFontSize(fs);

    const tx = (align === "right") ? (x + w - pad)
            : (align === "center") ? (x + w/2)
            : (x + pad);

    if(Array.isArray(text)){
      const startY = y + pad + fs;
      doc.text(text, tx, startY, { align: align || "left" });
    }else{
      const baseY = y + pad + fs;
      doc.text(safe(text), tx, baseY, { align: align || "left" });
    }
  }

  function imageTypeFromDataUrl(dataUrl){
    const s = String(dataUrl||"");
    if(s.startsWith("data:image/png")) return "PNG";
    if(s.startsWith("data:image/jpeg") || s.startsWith("data:image/jpg")) return "JPEG";
    if(s.startsWith("data:image/webp")) return "WEBP";
    return "";
  }

  function tryAddImage(doc, dataUrl, x, y, w, h){
    const t = imageTypeFromDataUrl(dataUrl);
    if(!dataUrl || !t) return false;
    try{
      doc.addImage(String(dataUrl), t, x, y, w, h);
      return true;
    }catch(_){
      return false;
    }
  }

  function stampHeaderFooter(doc, { docType, projectName, logoDataUrl }){
    const pageCount = doc.getNumberOfPages();
    const marginX = 44;
    const now = new Date().toLocaleString();

    const headerTop = 14;
    const headerLineY = 42;

    const logoW = 64;
    const logoH = 24;

    for(let p=1; p<=pageCount; p++){
      doc.setPage(p);
      const { w: PAGE_W, h: PAGE_H } = getPageSize(doc);

      try{
        doc.setTextColor(0);
        doc.setDrawColor(0);
      }catch(_){}

      doc.setDrawColor(200);
      doc.setLineWidth(0.6);
      doc.line(marginX, PAGE_H - 44, PAGE_W - marginX, PAGE_H - 44);
      doc.setLineWidth(0.2);

      doc.setFont("helvetica","normal");
      doc.setFontSize(9);
      doc.text(`Página ${p} de ${pageCount}`, PAGE_W/2, PAGE_H - 28, { align:"center" });

      if(p === 1) continue;

      doc.setDrawColor(200);
      doc.setLineWidth(0.6);
      doc.line(marginX, headerLineY, PAGE_W - marginX, headerLineY);
      doc.setLineWidth(0.2);

      let textStartX = marginX;
      if(logoDataUrl){
        const ok = tryAddImage(doc, logoDataUrl, marginX, headerTop, logoW, logoH);
        if(ok) textStartX = marginX + logoW + 10;
      }

      doc.setFont("helvetica","bold");
      doc.setFontSize(9.5);
      doc.text(safe(docType), textStartX, 28);

      doc.setFont("helvetica","normal");
      doc.setFontSize(9.2);
      if(projectName) doc.text(safe(projectName), textStartX, 38);

      doc.setFont("helvetica","normal");
      doc.setFontSize(9.2);
      doc.text(now, PAGE_W - marginX, 28, { align:"right" });
    }
  }

  function dateLongEsCO(d){
    const dt = (d instanceof Date) ? d : new Date(d || Date.now());
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    return `${dt.getDate()} de ${meses[dt.getMonth()]} de ${dt.getFullYear()}`;
  }
  function up(s){ return String(s||"").trim().toUpperCase(); }

  function getInstitutionHeader(project){
    const country = up(project?.instPais || "REPÚBLICA DE COLOMBIA");

    const deptRaw = up(project?.instDepto || "");
    const deptLine = deptRaw
      ? (deptRaw.includes("DEPARTAMENTO") ? deptRaw : ("DEPARTAMENTO DE " + deptRaw))
      : "DEPARTAMENTO DE —";

    const muniRaw = up(project?.instMunicipio || "");
    const muniLine = muniRaw
      ? (muniRaw.includes("MUNICIPIO") ? muniRaw : ("MUNICIPIO DE " + muniRaw))
      : "MUNICIPIO DE —";

    return { country, deptLine, muniLine };
  }

  function drawInstitutionalCover(doc, L, project, docTitle){
    try{
      doc.setFillColor(255,255,255);
      doc.rect(0,0,L.PAGE_W,L.PAGE_H,"F");
      doc.setTextColor(0);
      doc.setDrawColor(0);
    }catch(_){}

    const elab = window.StorageAPI?.getElaborador ? StorageAPI.getElaborador() : null;

    const entidadContratante = String(project?.instEntidad || project?.entity || "—");
    const ubicacion = String(project?.location || "—");

    const fechaElabRaw = String(project?.instFechaElab || "");
    const fechaElab = fechaElabRaw ? fechaElabRaw : dateLongEsCO(new Date());

    const projectLabel = String(project?.instProyectoLabel || project?.name || "PROYECTO");
    const projectNameUpper = up(projectLabel);

    const { country, deptLine, muniLine } = getInstitutionHeader(project);

    const logo = String(project?.logoDataUrl || "");
    if(logo){
      const w = 160, h = 60;
      const x = (L.PAGE_W - w)/2;
      const yLogo = 44;
      tryAddImage(doc, logo, x, yLogo, w, h);
    }

    let y = 130;
    if(logo) y = 160;

    doc.setFont("helvetica","bold"); doc.setFontSize(12);
    doc.text(country, L.PAGE_W/2, y, { align:"center" }); y += 18;
    doc.text(deptLine, L.PAGE_W/2, y, { align:"center" }); y += 18;
    doc.text(muniLine, L.PAGE_W/2, y, { align:"center" }); y += 30;

    doc.setFont("helvetica","bold"); doc.setFontSize(14);
    doc.text(up(docTitle||""), L.PAGE_W/2, y, { align:"center" }); y += 22;

    doc.setFont("helvetica","bold"); doc.setFontSize(12);
    doc.text(`PROYECTO: ${projectNameUpper}`, L.PAGE_W/2, y, { align:"center" }); y += 16;

    doc.setFont("helvetica","bold"); doc.setFontSize(11);
    doc.text(getBudgetLabelPDF(project?.__budgetMode), L.PAGE_W/2, y, { align:"center" }); y += 24;

    doc.setFont("helvetica","normal"); doc.setFontSize(11);
    doc.text(`Entidad Contratante: ${entidadContratante}`, L.margin, y); y += 16;
    doc.text(`Ubicación: ${ubicacion}`, L.margin, y); y += 16;
    doc.text(`Fecha de Elaboración: ${fechaElab}`, L.margin, y); y += 16;

    if(elab && (elab.nombre || elab.profesion || elab.matricula)){
      y += 6;
      if(elab.nombre){ doc.text(`Elaboró: ${elab.nombre}`, L.margin, y); y += 14; }
      if(elab.profesion){ doc.text(`Profesión: ${elab.profesion}`, L.margin, y); y += 14; }
      if(elab.matricula){ doc.text(`Matrícula Profesional: ${elab.matricula}`, L.margin, y); y += 14; }
    }
  }

  function loadImage(dataUrl){
    return new Promise((res, rej)=>{
      const img = new Image();
      img.onload = ()=>res(img);
      img.onerror = ()=>rej(new Error("No se pudo cargar la imagen de firma."));
      img.src = dataUrl;
    });
  }

  async function firmaToBlackOnWhitePNG(firmaDataUrl){
    if(!firmaDataUrl || !String(firmaDataUrl).startsWith("data:image")) return "";
    try{
      const img = await loadImage(String(firmaDataUrl));
      const w = Math.max(1, img.naturalWidth || img.width || 1);
      const h = Math.max(1, img.naturalHeight || img.height || 1);

      const c = document.createElement("canvas");
      c.width = w; c.height = h;

      const ctx = c.getContext("2d", { willReadFrequently:true });
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0,0,w,h);
      ctx.drawImage(img, 0, 0, w, h);

      const im = ctx.getImageData(0,0,w,h);
      const d = im.data;

      const TH = 120;
      for(let i=0; i<d.length; i+=4){
        const r = d[i], g = d[i+1], b = d[i+2];
        const lum = (r*0.2126 + g*0.7152 + b*0.0722);
        if(lum < TH){
          d[i] = 255; d[i+1] = 255; d[i+2] = 255; d[i+3] = 255;
        }else{
          d[i] = 0; d[i+1] = 0; d[i+2] = 0; d[i+3] = 255;
        }
      }

      ctx.putImageData(im,0,0);
      return c.toDataURL("image/png");
    }catch(_){
      return "";
    }
  }

  async function appendElaboradorFirma(doc, L){
    const elab = window.StorageAPI?.getElaborador ? StorageAPI.getElaborador() : null;
    const nombre = elab?.nombre ? String(elab.nombre) : "";
    const profesion = elab?.profesion ? String(elab.profesion) : "";
    const matricula = elab?.matricula ? String(elab.matricula) : "";
    const firmaDataUrl = elab?.firmaDataUrl ? String(elab.firmaDataUrl) : "";

    const need = 240;
    L.ensure(need);

    const boxX = L.margin;
    const boxW = 520;

    const sigX = boxX;
    const sigY = L.getY() + 10;
    const sigW = 320;
    const sigH = 95;

    doc.setFont("helvetica","normal"); doc.setFontSize(11);
    doc.text("Firma:", sigX, sigY - 6);

    let firmaForPDF = "";
    if(firmaDataUrl && firmaDataUrl.startsWith("data:image")){
      firmaForPDF = await firmaToBlackOnWhitePNG(firmaDataUrl);
    }

    if(firmaForPDF){
      try{
        doc.setFillColor(255,255,255);
        doc.rect(sigX+1, sigY+1, sigW-2, sigH-2, "F");
        doc.addImage(firmaForPDF, "PNG", sigX+8, sigY+8, sigW-16, sigH-16);
      }catch(_){}
    }

    const lineY = sigY + sigH + 55;

    doc.setDrawColor(0);
    doc.setLineWidth(0.8);
    doc.line(boxX, lineY, boxX + boxW, lineY);
    doc.setLineWidth(0.2);

    doc.setFont("helvetica","bold"); doc.setFontSize(11);
    doc.text(nombre || "____________________________", boxX, lineY + 18);

    doc.setFont("helvetica","normal"); doc.setFontSize(11);
    let yy = lineY + 34;
    if(profesion){ doc.text(profesion, boxX, yy); yy += 14; }
    if(matricula){ doc.text(`M.P. ${matricula}`, boxX, yy); yy += 14; }

    L.setY(Math.max(L.getY(), yy + 10));
  }

  function pct(project, key, legacyKey){
    const v = project?.[key];
    if(Number.isFinite(Number(v))) return Number(v);
    const lv = legacyKey ? project?.[legacyKey] : undefined;
    if(Number.isFinite(Number(lv))) return Number(lv);
    return 0;
  }

  function totalsCompat(project){
    const t = (window.Calc && typeof Calc.calcTotals === "function") ? (Calc.calcTotals(project) || {}) : {};
    const directo = Number(t.directo||0);

    if(("admin" in t) || ("imprev" in t) || ("util" in t) || ("ivaUtil" in t) || ("subtotal" in t)){
      return {
        directo,
        admin: Number(t.admin||0),
        imprev: Number(t.imprev||0),
        util: Number(t.util||0),
        subtotal: Number(t.subtotal||0),
        ivaUtil: Number(t.ivaUtil||0),
        total: Number(t.total||0)
      };
    }

    const aiu = Number(t.aiu||0);
    const iva = Number(t.iva||0);
    const total = Number(t.total|| (directo + aiu + iva));
    return {
      directo,
      admin: aiu,
      imprev: 0,
      util: 0,
      subtotal: directo + aiu,
      ivaUtil: iva,
      total
    };
  }

  const __apuDescCache = new Map();

  function normDesc(s){
    return String(s||"")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/[^\w\s]+/g," ")
      .replace(/\s+/g," ")
      .trim();
  }

  function tokenSet(s){
    const t = normDesc(s);
    if(!t) return new Set();
    const parts = t.split(" ").filter(p=>p.length>=3);
    return new Set(parts);
  }

  function jaccard(aSet, bSet){
    if(!aSet.size && !bSet.size) return 0;
    let inter = 0;
    for(const x of aSet){ if(bSet.has(x)) inter++; }
    const uni = aSet.size + bSet.size - inter;
    return uni ? (inter/uni) : 0;
  }

  async function findApuCodeByDesc(desc, unit){
    const d = normDesc(desc);
    const u = String(unit||"").trim().toLowerCase();
    if(!d) return "";

    const cacheKey = d + "|" + u;
    if(__apuDescCache.has(cacheKey)) return __apuDescCache.get(cacheKey) || "";

    if(!window.APUBase || typeof APUBase.search !== "function"){
      __apuDescCache.set(cacheKey, "");
      return "";
    }

    try{
      const results = await APUBase.search(desc, 35);
      const list = Array.isArray(results) ? results : [];
      const candidates = list.filter(r => r && !r.isChapter && r.code && r.desc);

      if(!candidates.length){
        __apuDescCache.set(cacheKey, "");
        return "";
      }

      for(const r of candidates){
        const rNorm = normDesc(String(r.desc||""));
        const rUnit = String(r.unit||"").trim().toLowerCase();
        if(rNorm === d){
          if(!u || (rUnit && rUnit === u)){
            const exactCode = String(r.code||"").trim();
            __apuDescCache.set(cacheKey, exactCode);
            return exactCode;
          }
        }
      }

      const targetTokens = tokenSet(desc);

      let best = null;
      let bestScore = 0;

      for(const r of candidates){
        const rDesc = String(r.desc||"");
        const rUnit = String(r.unit||"").trim().toLowerCase();
        const rNorm = normDesc(rDesc);

        const sTok = jaccard(targetTokens, tokenSet(rDesc));
        const sExact = (rNorm === d) ? 0.55 : 0;
        const sUnit = (u && rUnit && u === rUnit) ? 0.12 : 0;
        const sContain = (rNorm.includes(d) || d.includes(rNorm)) ? 0.10 : 0;

        const score = sTok + sExact + sUnit + sContain;

        if(score > bestScore){
          bestScore = score;
          best = r;
        }
      }

      const OK = best && bestScore >= 0.62;
      const foundCode = OK ? String(best.code||"").trim() : "";

      __apuDescCache.set(cacheKey, foundCode);
      return foundCode;
    }catch(_){
      __apuDescCache.set(cacheKey, "");
      return "";
    }
  }
  async function getProjectApuOverride(project, apuCode, mode){
    const budgetMode = String(mode || project?.__budgetMode || "base").toLowerCase();

    try{
      if(typeof window.getProjectApuOverride === "function"){
        const ov = window.getProjectApuOverride(project, apuCode, budgetMode);
        if(ov) return ov;
      }
    }catch(_){}

    const key = budgetMode === "oficial"
      ? (project?.oficialApuOverrides ? "oficialApuOverrides" : "officialApuOverrides")
      : "apuOverrides";

    const map = project?.[key];
    if(map && typeof map === "object"){
      const direct = map[String(apuCode||"").trim()];
      if(direct) return direct;
    }

    return null;
  }

  async function getGlobalCustomAPUByCode(apuCode){
    const code = String(apuCode||"").trim();
    if(!code) return null;

    try{
      if(window.StorageAPI?.getCustomAPUByCode){
        const x = StorageAPI.getCustomAPUByCode(code);
        if(x) return x;
      }
    }catch(_){}

    try{
      if(window.StorageAPI?.getCustomApuByCode){
        const x = StorageAPI.getCustomApuByCode(code);
        if(x) return x;
      }
    }catch(_){}

    try{
      if(window.StorageAPI?.listCustomAPUs){
        const list = StorageAPI.listCustomAPUs() || [];
        const found = list.find(x => String(x?.code||"").trim() === code);
        if(found) return found;
      }
    }catch(_){}

    return null;
  }

  async function getBaseAPUByCode(apuCode){
    const code = String(apuCode||"").trim();
    if(!code || !window.APUBase) return null;

    const itemFns = [
      "getAPUByCode",
      "getApuByCode",
      "getByCode",
      "getItemByCode",
      "getItemWithAnalysis",
      "getItemFull"
    ];

    for(const fn of itemFns){
      if(typeof APUBase[fn] === "function"){
        try{
          const out = await APUBase[fn](code);
          if(out) return out;
        }catch(_){}
      }
    }

    try{
      if(typeof APUBase.search === "function"){
        const found = await APUBase.search(code, 20);
        if(Array.isArray(found) && found.length){
          const hit =
            found.find(x => String(x?.code||"").trim() === code) ||
            found.find(x => String(x?.code||"").trim() === code.replace(/^0+/, "")) ||
            found[0];
          if(hit) return hit;
        }
      }
    }catch(_){}

    return null;
  }

  async function getBaseAPULinesByCode(apuCode){
    const code = String(apuCode||"").trim();
    if(!code || !window.APUBase) return [];

    const lineFns = [
      "getCostosDirectosByItemCode",
      "listCostosDirectosByItemCode",
      "getCostosDirectos"
    ];

    for(const fn of lineFns){
      if(typeof APUBase[fn] === "function"){
        try{
          const out = await APUBase[fn](code);
          if(Array.isArray(out) && out.length){
            return out.map(normalizeApuLine);
          }
        }catch(_){}
      }
    }

    try{
      if(typeof APUBase.listCostosDirectosAll === "function"){
        const all = await APUBase.listCostosDirectosAll(code, 500);
        if(Array.isArray(all) && all.length){
          return all
            .filter(x => String(x?.itemCode || x?.code || "").trim() === code)
            .map(normalizeApuLine);
        }
      }
    }catch(_){}

    return [];
  }

  function calcPUFromLines(lines){
    return (Array.isArray(lines) ? lines : []).reduce((s, x)=> s + Number(x?.parcial || 0), 0);
  }

  async function buildAPUObjectFromAnySource(src, codeHint){
    if(!src) return null;

    const linesRaw =
      Array.isArray(src?.lines) ? src.lines :
      Array.isArray(src?.costosDirectos) ? src.costosDirectos :
      Array.isArray(src?.cdLines) ? src.cdLines :
      [];

    const lines = linesRaw.map(normalizeApuLine);

    const puDirect = Number(src?.pu || src?.price || 0);
    const puCalc = calcPUFromLines(lines);

    return {
      code: String(src?.code || codeHint || "").trim(),
      desc: String(src?.desc || src?.description || "").trim(),
      unit: String(src?.unit || src?.unidad || "").trim(),
      pu: puDirect > 0 ? puDirect : puCalc,
      lines
    };
  }

  async function getAPUForProjectItem(project, item, mode){
    const budgetMode = String(mode || project?.__budgetMode || "base").toLowerCase();

    const visibleCode = String(item?.code || "").trim();
    const refCode = String(item?.apuRefCode || "").trim();
    const desc = String(item?.desc || "").trim();
    const unit = String(item?.unit || "").trim();

    const tryCodes = [];
    if(refCode) tryCodes.push(refCode);
    if(visibleCode && visibleCode !== refCode) tryCodes.push(visibleCode);

    // 1) Override del proyecto por código real / visible
    for(const code of tryCodes){
      const ov = await getProjectApuOverride(project, code, budgetMode);
      if(ov){
        const apu = await buildAPUObjectFromAnySource(ov, code);
        if(apu && (apu.desc || apu.lines.length)){
          return { apu, source:`override:${code}` };
        }
      }
    }

    // 2) Helper explícito de StorageAPI por si existe
    try{
      if(window.StorageAPI?.getProjectApuOverride){
        for(const code of tryCodes){
          const ov = StorageAPI.getProjectApuOverride(project?.id, code, budgetMode);
          if(ov){
            const apu = await buildAPUObjectFromAnySource(ov, code);
            if(apu && (apu.desc || apu.lines.length)){
              return { apu, source:`storageOverride:${code}` };
            }
          }
        }
      }
    }catch(_){}

    // 3) Custom APU global
    for(const code of tryCodes){
      const custom = await getGlobalCustomAPUByCode(code);
      if(custom){
        const apu = await buildAPUObjectFromAnySource(custom, code);
        if(apu && (apu.desc || apu.lines.length)){
          return { apu, source:`custom:${code}` };
        }
      }
    }

    // 4) Base por código real / visible
    for(const code of tryCodes){
      const base = await getBaseAPUByCode(code);
      const lines = await getBaseAPULinesByCode(code);

      if(base || (lines && lines.length)){
        const apu = {
          code: String(base?.code || code || "").trim(),
          desc: String(base?.desc || base?.description || item?.desc || "").trim(),
          unit: String(base?.unit || item?.unit || "").trim(),
          pu: Number(base?.pu || 0),
          lines: Array.isArray(lines) ? lines : []
        };
        if((!apu.pu || apu.pu <= 0) && apu.lines.length){
          apu.pu = calcPUFromLines(apu.lines);
        }
        return { apu, source:`base:${code}` };
      }
    }

    // 5) Fallback robusto por descripción
    const foundByDescCode = await findApuCodeByDesc(desc, unit);
    if(foundByDescCode){
      const ov = await getProjectApuOverride(project, foundByDescCode, budgetMode);
      if(ov){
        const apu = await buildAPUObjectFromAnySource(ov, foundByDescCode);
        if(apu && (apu.desc || apu.lines.length)){
          return { apu, source:`override-desc:${foundByDescCode}` };
        }
      }

      const custom = await getGlobalCustomAPUByCode(foundByDescCode);
      if(custom){
        const apu = await buildAPUObjectFromAnySource(custom, foundByDescCode);
        if(apu && (apu.desc || apu.lines.length)){
          return { apu, source:`custom-desc:${foundByDescCode}` };
        }
      }

      const base = await getBaseAPUByCode(foundByDescCode);
      const lines = await getBaseAPULinesByCode(foundByDescCode);

      if(base || (lines && lines.length)){
        const apu = {
          code: String(base?.code || foundByDescCode || "").trim(),
          desc: String(base?.desc || base?.description || desc || "").trim(),
          unit: String(base?.unit || unit || "").trim(),
          pu: Number(base?.pu || 0),
          lines: Array.isArray(lines) ? lines : []
        };
        if((!apu.pu || apu.pu <= 0) && apu.lines.length){
          apu.pu = calcPUFromLines(apu.lines);
        }
        return { apu, source:`base-desc:${foundByDescCode}` };
      }
    }

    return {
      apu: {
        code: refCode || visibleCode || "",
        desc: desc || "",
        unit: unit || "",
        pu: Number(item?.pu || 0),
        lines: []
      },
      source:"none"
    };
  }

  function makeBudgetRows(project, mode){
    const view = getProjectForPDF(project, mode);
    try{
      const out = window.Calc?.groupByChapters ? Calc.groupByChapters(view) : { groups:[], items:view.items||[] };
      return {
        view,
        groups: Array.isArray(out?.groups) ? out.groups : [],
        items: Array.isArray(out?.items) ? out.items : (view.items || [])
      };
    }catch(_){
      return {
        view,
        groups: [],
        items: Array.isArray(view?.items) ? view.items : []
      };
    }
  }

  async function exportPresupuestoBase(doc, project, mode){
    const view = getProjectForPDF(project, mode);
    const rows = makeBudgetRows(project, mode);
    const totals = totalsCompat(view);
    const L = mkLayout(doc);

    drawInstitutionalCover(doc, L, view, "PRESUPUESTO DE OBRA");
    doc.addPage();

    const body = mkLayout(doc);
    body.setY(72);

    drawBand(doc, body.margin, body.getY(), body.contentW, 16,
      `PRESUPUESTO DE OBRA · ${getBudgetLabelPDF(mode)}`, { fontSize:11, bold:true });
    body.setY(body.getY() + 24);

    body.row("Proyecto", String(project?.name || "—"));
    body.row("Entidad contratante", String(project?.instEntidad || project?.entity || "—"));
    body.row("Ubicación", String(project?.location || "—"));
    body.row("Moneda", String(project?.currency || "COP"));
    body.line();

    body.tableHeaderPresupuesto();

    let currentChap = "";
    for(const it of (rows.items || [])){
      const chapCode = String(it?.chapterCode || "").trim();
      const chapName = String(it?.chapterName || "").trim();

      if(chapCode && chapCode !== currentChap){
        currentChap = chapCode;
        body.ensure(22);
        doc.setFont("helvetica","bold");
        doc.setFontSize(10);
        doc.text(`${chapCode} ${chapName}`.trim(), body.margin, body.getY()+10);
        hLine(doc, body.margin, body.margin + body.contentW, body.getY()+16, 0.45, 180);
        body.setY(body.getY()+22);
        body.tableHeaderPresupuesto();
      }

      body.tableRowPresupuesto(it);
    }

    body.line();
    body.row("Costo Directo", moneyCOP0(totals.directo || 0));
    body.row(`Administración (${pct(project,"adminPct","aiuPct")}%)`, moneyCOP0(totals.admin || 0));
    body.row(`Imprevistos (${pct(project,"imprevPct",null)}%)`, moneyCOP0(totals.imprev || 0));
    body.row(`Utilidad (${pct(project,"utilPct",null)}%)`, moneyCOP0(totals.util || 0));
    body.row("Subtotal", moneyCOP0(totals.subtotal || 0));
    body.row(`IVA sobre Utilidad (${pct(project,"ivaUtilPct","ivaPct")}%)`, moneyCOP0(totals.ivaUtil || 0));
    body.line();
    body.row("VALOR TOTAL", moneyCOP0(totals.total || 0));

    await appendElaboradorFirma(doc, body);

    stampHeaderFooter(doc, {
      docType: `PRESUPUESTO DE OBRA · ${getBudgetLabelPDF(mode)}`,
      projectName: String(project?.name || ""),
      logoDataUrl: String(project?.logoDataUrl || "")
    });

    return doc;
  }

  async function exportPresupuestoConAPUs(doc, project, mode){
    const view = getProjectForPDF(project, mode);
    const rows = makeBudgetRows(project, mode);
    const totals = totalsCompat(view);
    const L = mkLayout(doc);

    drawInstitutionalCover(doc, L, view, "PRESUPUESTO DE OBRA + APUs");
    doc.addPage();

    const body = mkLayout(doc);
    body.setY(72);

    drawBand(doc, body.margin, body.getY(), body.contentW, 16,
      `PRESUPUESTO DE OBRA + APUs · ${getBudgetLabelPDF(mode)}`, { fontSize:11, bold:true });
    body.setY(body.getY() + 24);

    body.row("Proyecto", String(project?.name || "—"));
    body.row("Entidad contratante", String(project?.instEntidad || project?.entity || "—"));
    body.row("Ubicación", String(project?.location || "—"));
    body.row("Moneda", String(project?.currency || "COP"));
    body.line();

    body.tableHeaderPresupuesto();

    let currentChap = "";
    for(const it of (rows.items || [])){
      const chapCode = String(it?.chapterCode || "").trim();
      const chapName = String(it?.chapterName || "").trim();

      if(chapCode && chapCode !== currentChap){
        currentChap = chapCode;
        body.ensure(22);
        doc.setFont("helvetica","bold");
        doc.setFontSize(10);
        doc.text(`${chapCode} ${chapName}`.trim(), body.margin, body.getY()+10);
        hLine(doc, body.margin, body.margin + body.contentW, body.getY()+16, 0.45, 180);
        body.setY(body.getY()+22);
        body.tableHeaderPresupuesto();
      }

      body.tableRowPresupuesto(it);
    }

    body.line();
    body.row("Costo Directo", moneyCOP0(totals.directo || 0));
    body.row(`Administración (${pct(project,"adminPct","aiuPct")}%)`, moneyCOP0(totals.admin || 0));
    body.row(`Imprevistos (${pct(project,"imprevPct",null)}%)`, moneyCOP0(totals.imprev || 0));
    body.row(`Utilidad (${pct(project,"utilPct",null)}%)`, moneyCOP0(totals.util || 0));
    body.row("Subtotal", moneyCOP0(totals.subtotal || 0));
    body.row(`IVA sobre Utilidad (${pct(project,"ivaUtilPct","ivaPct")}%)`, moneyCOP0(totals.ivaUtil || 0));
    body.line();
    body.row("VALOR TOTAL", moneyCOP0(totals.total || 0));

    for(const it of (rows.items || [])){
      doc.addPage();
      const A = mkLayout(doc);
      A.setY(72);

      const found = await getAPUForProjectItem(view, it, mode);
      const apu = found?.apu || null;

      drawBand(doc, A.margin, A.getY(), A.contentW, 16,
        `APU ${String(it?.code || "")} (Ref: ${String(it?.apuRefCode || it?.code || "")})`,
        { fontSize:11, bold:true }
      );
      A.setY(A.getY() + 24);

      if(!apu || !Array.isArray(apu.lines) || !apu.lines.length){
        doc.setFont("helvetica","normal");
        doc.setFontSize(10);
        doc.text("No se encontró descomposición (override, custom o base).", A.margin, A.getY()+8);
        A.setY(A.getY()+20);
        continue;
      }

      doc.setFont("helvetica","bold");
      doc.setFontSize(10.2);
      doc.text(String(apu.desc || it?.desc || "Sin descripción"), A.margin, A.getY()+10);

      doc.setFont("helvetica","normal");
      doc.setFontSize(9.4);
      doc.text(
        `Unidad: ${String(apu.unit || it?.unit || "-")} · PU: ${moneyCOP0(apu.pu || 0)}`,
        A.margin,
        A.getY()+24
      );
      A.setY(A.getY()+34);

      A.tableHeaderAPU();
      for(const ln of apu.lines){
        A.tableRowAPU(ln);
      }

      A.line();
      A.row("PU APU", moneyCOP0(apu.pu || 0));
      A.row("Fuente", String(found?.source || "—"));
    }

    await appendElaboradorFirma(doc, mkLayout(doc));

    stampHeaderFooter(doc, {
      docType: `PRESUPUESTO DE OBRA + APUs · ${getBudgetLabelPDF(mode)}`,
      projectName: String(project?.name || ""),
      logoDataUrl: String(project?.logoDataUrl || "")
    });

    return doc;
  }

  async function finalizePdf(doc, filename, options){
    const opts = options || {};
    installPersistHooksOnce();
    forcePersistAppState();
    await sleep(90);

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);

    if(opts.share && navigator.share && isMobileLike()){
      try{
        const file = new File([blob], filename, { type:"application/pdf" });
        await navigator.share({
          title: filename,
          text: filename,
          files: [file]
        });
        setTimeout(()=> URL.revokeObjectURL(url), 15000);
        return;
      }catch(err){
        console.warn("[PDF] Share cancel/fallback:", err);
      }
    }

    try{
      if(isMobileLike()){
        window.open(url, "_blank", "noopener,noreferrer");
        setTimeout(()=> URL.revokeObjectURL(url), 20000);
        return;
      }
    }catch(_){}

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(()=> URL.revokeObjectURL(url), 15000);
  }
  async function exportPresupuestoObraDesagregado(doc, project, mode){
    const view = getProjectForPDF(project, mode);
    const rows = makeBudgetRows(project, mode);
    const totals = totalsCompat(view);

    const body = mkLayout(doc);
    drawInstitutionalCover(doc, body, view, "PRESUPUESTO DE OBRA DESAGREGADO");
    doc.addPage();

    const L = mkLayout(doc);
    L.setY(72);

    drawBand(doc, L.margin, L.getY(), L.contentW, 16,
      `PRESUPUESTO DE OBRA DESAGREGADO · ${getBudgetLabelPDF(mode)}`, { fontSize:11, bold:true });
    L.setY(L.getY() + 24);

    const cols = fitColsToWidth([
      { key:"item", w:52 },
      { key:"desc", w:240 },
      { key:"unit", w:52 },
      { key:"qty",  w:58 },
      { key:"pu",   w:84 },
      { key:"par",  w:96 }
    ], L.contentW, 34);

    const x = {
      item: L.margin,
      desc: L.margin + cols[0].w,
      unit: L.margin + cols[0].w + cols[1].w,
      qty:  L.margin + cols[0].w + cols[1].w + cols[2].w,
      pu:   L.margin + cols[0].w + cols[1].w + cols[2].w + cols[3].w,
      par:  L.margin + cols[0].w + cols[1].w + cols[2].w + cols[3].w + cols[4].w
    };

    function header(){
      L.ensure(26);
      const y = L.getY();

      doc.setFont("helvetica","bold");
      doc.setFontSize(8.9);
      doc.text("ITEM", x.item + 2, y + 12);
      doc.text("DESCRIPCIÓN", x.desc + 2, y + 12);
      doc.text("UNID", x.unit + cols[2].w - 2, y + 12, { align:"right" });
      doc.text("CANT", x.qty + cols[3].w - 2, y + 12, { align:"right" });
      doc.text("VR UNIT", x.pu + cols[4].w - 2, y + 12, { align:"right" });
      doc.text("VR PARCIAL", x.par + cols[5].w - 2, y + 12, { align:"right" });

      hLine(doc, L.margin, L.margin+L.contentW, y + 18, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
      L.setY(y + 24);
    }

    function row(it){
      doc.setFont("helvetica","normal");
      doc.setFontSize(8.8);

      const descMaxW = cols[1].w - 6;
      const descLines = doc.splitTextToSize(String(it?.desc||""), descMaxW).slice(0,4);
      const rowH = Math.max(18, 8 + descLines.length*10);

      const jumped = L.ensure(rowH + 8);
      if(jumped) header();

      const y = L.getY();

      doc.setFont("helvetica","bold");
      doc.text(String(it?.code||""), x.item + 2, y + 11);

      doc.setFont("helvetica","normal");
      doc.text(descLines, x.desc + 2, y + 11);
      doc.text(String(it?.unit||""), x.unit + cols[2].w - 2, y + 11, { align:"right" });
      doc.text(fmtQty(it?.qty||0), x.qty + cols[3].w - 2, y + 11, { align:"right" });

      doc.setFont("helvetica","bold");
      doc.text(moneyCOP0(it?.pu||0), x.pu + cols[4].w - 2, y + 11, { align:"right" });
      doc.text(moneyCOP0((Number(it?.pu||0)*Number(it?.qty||0))), x.par + cols[5].w - 2, y + 11, { align:"right" });

      hLine(doc, L.margin, L.margin+L.contentW, y + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      L.setY(y + rowH + 2);
    }

    header();
    for(const it of (rows.items||[])) row(it);

    L.line();
    L.row("Costo Directo", moneyCOP0(totals.directo || 0));
    L.row(`Administración (${pct(project,"adminPct","aiuPct")}%)`, moneyCOP0(totals.admin || 0));
    L.row(`Imprevistos (${pct(project,"imprevPct",null)}%)`, moneyCOP0(totals.imprev || 0));
    L.row(`Utilidad (${pct(project,"utilPct",null)}%)`, moneyCOP0(totals.util || 0));
    L.row("Subtotal", moneyCOP0(totals.subtotal || 0));
    L.row(`IVA sobre Utilidad (${pct(project,"ivaUtilPct","ivaPct")}%)`, moneyCOP0(totals.ivaUtil || 0));
    L.line();
    L.row("VALOR TOTAL", moneyCOP0(totals.total || 0));

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType: `PRESUPUESTO DE OBRA DESAGREGADO · ${getBudgetLabelPDF(mode)}`,
      projectName: String(project?.name || ""),
      logoDataUrl: String(project?.logoDataUrl || "")
    });

    return doc;
  }

  async function exportResumenPresupuestoObraDesagregado(doc, project, mode){
    const view = getProjectForPDF(project, mode);
    const rows = makeBudgetRows(project, mode);
    const totals = totalsCompat(view);

    const body = mkLayout(doc);
    drawInstitutionalCover(doc, body, view, "RESUMEN PRESUPUESTO DE OBRA DESAGREGADO");
    doc.addPage();

    const L = mkLayout(doc);
    L.setY(72);

    drawBand(doc, L.margin, L.getY(), L.contentW, 16,
      `RESUMEN PRESUPUESTO DE OBRA DESAGREGADO · ${getBudgetLabelPDF(mode)}`, { fontSize:11, bold:true });
    L.setY(L.getY() + 24);

    doc.setFont("helvetica","bold");
    doc.setFontSize(10.2);

    const cols = fitColsToWidth([
      { key:"cap",  w:76 },
      { key:"name", w:280 },
      { key:"cnt",  w:72 },
      { key:"sub",  w:120 }
    ], L.contentW, 40);

    const x = {
      cap:  L.margin,
      name: L.margin + cols[0].w,
      cnt:  L.margin + cols[0].w + cols[1].w,
      sub:  L.margin + cols[0].w + cols[1].w + cols[2].w
    };

    function header(){
      L.ensure(26);
      const y = L.getY();
      doc.setFont("helvetica","bold");
      doc.setFontSize(9.2);
      doc.text("CAPÍTULO", x.cap + 2, y + 12);
      doc.text("DESCRIPCIÓN", x.name + 2, y + 12);
      doc.text("ÍTEMS", x.cnt + cols[2].w - 2, y + 12, { align:"right" });
      doc.text("SUBTOTAL", x.sub + cols[3].w - 2, y + 12, { align:"right" });
      hLine(doc, L.margin, L.margin+L.contentW, y + 18, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
      L.setY(y + 24);
    }

    function row(g){
      const descLines = doc.splitTextToSize(String(g?.chapterName||""), cols[1].w - 6).slice(0,3);
      const rowH = Math.max(18, 8 + descLines.length*10);
      const jumped = L.ensure(rowH + 8);
      if(jumped) header();

      const y = L.getY();

      doc.setFont("helvetica","bold");
      doc.setFontSize(9.1);
      doc.text(String(g?.chapterCode||""), x.cap + 2, y + 11);

      doc.setFont("helvetica","normal");
      doc.text(descLines, x.name + 2, y + 11);
      doc.text(String(g?.itemsCount||0), x.cnt + cols[2].w - 2, y + 11, { align:"right" });

      doc.setFont("helvetica","bold");
      doc.text(moneyCOP0(g?.subtotal||0), x.sub + cols[3].w - 2, y + 11, { align:"right" });

      hLine(doc, L.margin, L.margin+L.contentW, y + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      L.setY(y + rowH + 2);
    }

    header();
    for(const g of (rows.groups||[])) row(g);

    L.line();
    L.row("Costo Directo", moneyCOP0(totals.directo || 0));
    L.row(`Administración (${pct(project,"adminPct","aiuPct")}%)`, moneyCOP0(totals.admin || 0));
    L.row(`Imprevistos (${pct(project,"imprevPct",null)}%)`, moneyCOP0(totals.imprev || 0));
    L.row(`Utilidad (${pct(project,"utilPct",null)}%)`, moneyCOP0(totals.util || 0));
    L.row("Subtotal", moneyCOP0(totals.subtotal || 0));
    L.row(`IVA sobre Utilidad (${pct(project,"ivaUtilPct","ivaPct")}%)`, moneyCOP0(totals.ivaUtil || 0));
    L.line();
    L.row("VALOR TOTAL", moneyCOP0(totals.total || 0));

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType: `RESUMEN PRESUPUESTO DE OBRA DESAGREGADO · ${getBudgetLabelPDF(mode)}`,
      projectName: String(project?.name || ""),
      logoDataUrl: String(project?.logoDataUrl || "")
    });

    return doc;
  }

  async function exportDistribucionPorcentualCostosDirectos(doc, project, mode){
    const view = getProjectForPDF(project, mode);
    const rows = makeBudgetRows(project, mode);
    const totalDirecto = Number(totalsCompat(view).directo || 0);

    const body = mkLayout(doc);
    drawInstitutionalCover(doc, body, view, "DISTRIBUCIÓN PORCENTUAL DE COSTOS DIRECTOS");
    doc.addPage();

    const L = mkLayout(doc);
    L.setY(72);

    drawBand(doc, L.margin, L.getY(), L.contentW, 16,
      `DISTRIBUCIÓN PORCENTUAL DE COSTOS DIRECTOS · ${getBudgetLabelPDF(mode)}`, { fontSize:11, bold:true });
    L.setY(L.getY() + 24);

    const items = (rows.items || []).map(it=>{
      const parcial = Number(it?.pu||0) * Number(it?.qty||0);
      const pctDir = totalDirecto > 0 ? (parcial / totalDirecto * 100) : 0;
      return { ...it, parcial, pctDir };
    });

    const cols = fitColsToWidth([
      { key:"code", w:70 },
      { key:"desc", w:270 },
      { key:"par",  w:120 },
      { key:"pct",  w:80 }
    ], L.contentW, 40);

    const x = {
      code: L.margin,
      desc: L.margin + cols[0].w,
      par:  L.margin + cols[0].w + cols[1].w,
      pct:  L.margin + cols[0].w + cols[1].w + cols[2].w
    };

    function header(){
      L.ensure(26);
      const y = L.getY();
      doc.setFont("helvetica","bold");
      doc.setFontSize(9.2);
      doc.text("CÓDIGO", x.code + 2, y + 12);
      doc.text("DESCRIPCIÓN", x.desc + 2, y + 12);
      doc.text("VR PARCIAL", x.par + cols[2].w - 2, y + 12, { align:"right" });
      doc.text("% CD", x.pct + cols[3].w - 2, y + 12, { align:"right" });
      hLine(doc, L.margin, L.margin+L.contentW, y + 18, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
      L.setY(y + 24);
    }

    function row(it){
      const descLines = doc.splitTextToSize(String(it?.desc||""), cols[1].w - 6).slice(0,3);
      const rowH = Math.max(18, 8 + descLines.length*10);
      const jumped = L.ensure(rowH + 8);
      if(jumped) header();

      const y = L.getY();

      doc.setFont("helvetica","bold");
      doc.setFontSize(9.1);
      doc.text(String(it?.code||""), x.code + 2, y + 11);

      doc.setFont("helvetica","normal");
      doc.text(descLines, x.desc + 2, y + 11);
      doc.text(moneyCOP0(it?.parcial||0), x.par + cols[2].w - 2, y + 11, { align:"right" });

      doc.setFont("helvetica","bold");
      doc.text(`${fmt2(it?.pctDir||0)}%`, x.pct + cols[3].w - 2, y + 11, { align:"right" });

      hLine(doc, L.margin, L.margin+L.contentW, y + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      L.setY(y + rowH + 2);
    }

    header();
    for(const it of items) row(it);

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType: `DISTRIBUCIÓN PORCENTUAL DE COSTOS DIRECTOS · ${getBudgetLabelPDF(mode)}`,
      projectName: String(project?.name || ""),
      logoDataUrl: String(project?.logoDataUrl || "")
    });

    return doc;
  }

  async function exportRendimientoEquipoYManoDeObraPorActividad(doc, project, mode){
    const view = getProjectForPDF(project, mode);
    const rows = makeBudgetRows(project, mode);

    const body = mkLayout(doc);
    drawInstitutionalCover(doc, body, view, "RENDIMIENTO DE EQUIPO Y MANO DE OBRA POR ACTIVIDAD");
    doc.addPage();

    const L = mkLayout(doc);
    L.setY(72);

    drawBand(doc, L.margin, L.getY(), L.contentW, 16,
      `RENDIMIENTO DE EQUIPO Y MANO DE OBRA POR ACTIVIDAD · ${getBudgetLabelPDF(mode)}`, { fontSize:11, bold:true });
    L.setY(L.getY() + 24);

    const cols = fitColsToWidth([
      { key:"item", w:68 },
      { key:"desc", w:220 },
      { key:"group", w:110 },
      { key:"ins",  w:150 },
      { key:"qty",  w:60 }
    ], L.contentW, 44);

    const x = {
      item: L.margin,
      desc: L.margin + cols[0].w,
      group:L.margin + cols[0].w + cols[1].w,
      ins:  L.margin + cols[0].w + cols[1].w + cols[2].w,
      qty:  L.margin + cols[0].w + cols[1].w + cols[2].w + cols[3].w
    };

    function header(){
      L.ensure(26);
      const y = L.getY();
      doc.setFont("helvetica","bold");
      doc.setFontSize(9.2);
      doc.text("ÍTEM", x.item + 2, y + 12);
      doc.text("ACTIVIDAD", x.desc + 2, y + 12);
      doc.text("GRUPO", x.group + 2, y + 12);
      doc.text("INSUMO", x.ins + 2, y + 12);
      doc.text("CANT/R", x.qty + cols[4].w - 2, y + 12, { align:"right" });
      hLine(doc, L.margin, L.margin+L.contentW, y + 18, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
      L.setY(y + 24);
    }

    function row(item, ln){
      const lineH = 10;
      const a1 = doc.splitTextToSize(String(item?.desc||""), cols[1].w - 6).slice(0,2);
      const a2 = doc.splitTextToSize(String(ln?.desc||""), cols[3].w - 6).slice(0,2);
      const rowH = Math.max(18, 8 + Math.max(a1.length, a2.length)*lineH);

      const jumped = L.ensure(rowH + 8);
      if(jumped) header();

      const y = L.getY();

      doc.setFont("helvetica","bold");
      doc.setFontSize(8.8);
      doc.text(String(item?.code||""), x.item + 2, y + 11);

      doc.setFont("helvetica","normal");
      doc.text(a1, x.desc + 2, y + 11);
      doc.text(String(ln?.group||""), x.group + 2, y + 11);
      doc.text(a2, x.ins + 2, y + 11);
      doc.text(fmtQty(ln?.qty||0), x.qty + cols[4].w - 2, y + 11, { align:"right" });

      hLine(doc, L.margin, L.margin+L.contentW, y + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      L.setY(y + rowH + 2);
    }

    header();
    for(const it of (rows.items||[])){
      const found = await getAPUForProjectItem(view, it, mode);
      const apu = found?.apu || null;
      const lines = Array.isArray(apu?.lines) ? apu.lines : [];
      const filtered = lines.filter(ln=>{
        const g = String(ln?.group||"").toUpperCase();
        return g.includes("EQUIPO") || g.includes("HERRAM") || g.includes("MANO");
      });
      for(const ln of filtered) row(it, ln);
    }

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType: `RENDIMIENTO DE EQUIPO Y MANO DE OBRA POR ACTIVIDAD · ${getBudgetLabelPDF(mode)}`,
      projectName: String(project?.name || ""),
      logoDataUrl: String(project?.logoDataUrl || "")
    });

    return doc;
  }

  async function exportResumenMaterialesPorActividad(doc, project, mode){
    const view = getProjectForPDF(project, mode);
    const rows = makeBudgetRows(project, mode);

    const body = mkLayout(doc);
    drawInstitutionalCover(doc, body, view, "RESUMEN MATERIALES POR ACTIVIDAD");
    doc.addPage();

    const L = mkLayout(doc);
    L.setY(72);

    drawBand(doc, L.margin, L.getY(), L.contentW, 16,
      `RESUMEN MATERIALES POR ACTIVIDAD · ${getBudgetLabelPDF(mode)}`, { fontSize:11, bold:true });
    L.setY(L.getY() + 24);

    const cols = fitColsToWidth([
      { key:"item", w:70 },
      { key:"act",  w:210 },
      { key:"mat",  w:210 },
      { key:"qty",  w:70 }
    ], L.contentW, 44);

    const x = {
      item: L.margin,
      act:  L.margin + cols[0].w,
      mat:  L.margin + cols[0].w + cols[1].w,
      qty:  L.margin + cols[0].w + cols[1].w + cols[2].w
    };

    function header(){
      L.ensure(26);
      const y = L.getY();
      doc.setFont("helvetica","bold");
      doc.setFontSize(9.2);
      doc.text("ÍTEM", x.item + 2, y + 12);
      doc.text("ACTIVIDAD", x.act + 2, y + 12);
      doc.text("MATERIAL", x.mat + 2, y + 12);
      doc.text("CANT/R", x.qty + cols[3].w - 2, y + 12, { align:"right" });
      hLine(doc, L.margin, L.margin+L.contentW, y + 18, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
      L.setY(y + 24);
    }

    function row(item, ln){
      const lineH = 10;
      const a1 = doc.splitTextToSize(String(item?.desc||""), cols[1].w - 6).slice(0,2);
      const a2 = doc.splitTextToSize(String(ln?.desc||""), cols[2].w - 6).slice(0,2);
      const rowH = Math.max(18, 8 + Math.max(a1.length, a2.length)*lineH);

      const jumped = L.ensure(rowH + 8);
      if(jumped) header();

      const y = L.getY();
      doc.setFont("helvetica","bold");
      doc.setFontSize(8.8);
      doc.text(String(item?.code||""), x.item + 2, y + 11);

      doc.setFont("helvetica","normal");
      doc.text(a1, x.act + 2, y + 11);
      doc.text(a2, x.mat + 2, y + 11);
      doc.text(fmtQty(ln?.qty||0), x.qty + cols[3].w - 2, y + 11, { align:"right" });

      hLine(doc, L.margin, L.margin+L.contentW, y + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      L.setY(y + rowH + 2);
    }

    header();
    for(const it of (rows.items||[])){
      const found = await getAPUForProjectItem(view, it, mode);
      const apu = found?.apu || null;
      const lines = Array.isArray(apu?.lines) ? apu.lines : [];
      const filtered = lines.filter(ln=>{
        const g = String(ln?.group||"").toUpperCase();
        return g.includes("MATERIAL");
      });
      for(const ln of filtered) row(it, ln);
    }

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType: `RESUMEN MATERIALES POR ACTIVIDAD · ${getBudgetLabelPDF(mode)}`,
      projectName: String(project?.name || ""),
      logoDataUrl: String(project?.logoDataUrl || "")
    });

    return doc;
  }

  async function exportCantidadRecursosEInsumosPresupuesto(doc, project, mode){
    const view = getProjectForPDF(project, mode);
    const rows = makeBudgetRows(project, mode);

    const body = mkLayout(doc);
    drawInstitutionalCover(doc, body, view, "CANTIDAD DE RECURSOS E INSUMOS DEL PRESUPUESTO");
    doc.addPage();

    const L = mkLayout(doc);
    L.setY(72);

    drawBand(doc, L.margin, L.getY(), L.contentW, 16,
      `CANTIDAD DE RECURSOS E INSUMOS DEL PRESUPUESTO · ${getBudgetLabelPDF(mode)}`, { fontSize:11, bold:true });
    L.setY(L.getY() + 24);

    const acc = new Map();

    for(const it of (rows.items||[])){
      const found = await getAPUForProjectItem(view, it, mode);
      const apu = found?.apu || null;
      const lines = Array.isArray(apu?.lines) ? apu.lines : [];

      for(const ln of lines){
        if(isAccesoriosPercentLine(ln)) continue;
        const key = `${String(ln?.group||"").trim()}|${String(ln?.desc||"").trim()}|${String(ln?.unit||"").trim()}`;
        const qtyReq = Number(ln?.qty || 0) * Number(it?.qty || 0);

        if(!acc.has(key)){
          acc.set(key, {
            group: String(ln?.group||"").trim(),
            desc: String(ln?.desc||"").trim(),
            unit: String(ln?.unit||"").trim(),
            qty: 0
          });
        }
        acc.get(key).qty += qtyReq;
      }
    }

    const list = Array.from(acc.values()).sort((a,b)=>{
      const g = String(a.group).localeCompare(String(b.group));
      if(g !== 0) return g;
      return String(a.desc).localeCompare(String(b.desc));
    });

    const cols = fitColsToWidth([
      { key:"grp",  w:120 },
      { key:"desc", w:260 },
      { key:"uni",  w:70 },
      { key:"qty",  w:110 }
    ], L.contentW, 44);

    const x = {
      grp:  L.margin,
      desc: L.margin + cols[0].w,
      uni:  L.margin + cols[0].w + cols[1].w,
      qty:  L.margin + cols[0].w + cols[1].w + cols[2].w
    };

    function header(){
      L.ensure(26);
      const y = L.getY();
      doc.setFont("helvetica","bold");
      doc.setFontSize(9.2);
      doc.text("GRUPO", x.grp + 2, y + 12);
      doc.text("DESCRIPCIÓN", x.desc + 2, y + 12);
      doc.text("UNIDAD", x.uni + cols[2].w - 2, y + 12, { align:"right" });
      doc.text("CANTIDAD", x.qty + cols[3].w - 2, y + 12, { align:"right" });
      hLine(doc, L.margin, L.margin+L.contentW, y + 18, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
      L.setY(y + 24);
    }

    function row(r){
      const descLines = doc.splitTextToSize(String(r?.desc||""), cols[1].w - 6).slice(0,3);
      const rowH = Math.max(18, 8 + descLines.length*10);
      const jumped = L.ensure(rowH + 8);
      if(jumped) header();

      const y = L.getY();
      doc.setFont("helvetica","normal");
      doc.setFontSize(8.9);
      doc.text(String(r?.group||""), x.grp + 2, y + 11);
      doc.text(descLines, x.desc + 2, y + 11);
      doc.text(String(r?.unit||""), x.uni + cols[2].w - 2, y + 11, { align:"right" });

      doc.setFont("helvetica","bold");
      doc.text(fmtQty(r?.qty||0), x.qty + cols[3].w - 2, y + 11, { align:"right" });

      hLine(doc, L.margin, L.margin+L.contentW, y + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      L.setY(y + rowH + 2);
    }

    header();
    for(const r of list) row(r);

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType: `CANTIDAD DE RECURSOS E INSUMOS DEL PRESUPUESTO · ${getBudgetLabelPDF(mode)}`,
      projectName: String(project?.name || ""),
      logoDataUrl: String(project?.logoDataUrl || "")
    });

    return doc;
  }

  async function exportEspecificacionesTecnicas(doc, project, mode){
    const view = getProjectForPDF(project, mode);
    const rows = makeBudgetRows(project, mode);

    const body = mkLayout(doc);
    drawInstitutionalCover(doc, body, view, "ESPECIFICACIONES TÉCNICAS");
    doc.addPage();

    const L = mkLayout(doc);
    L.setY(72);

    drawBand(doc, L.margin, L.getY(), L.contentW, 16,
      `ESPECIFICACIONES TÉCNICAS · ${getBudgetLabelPDF(mode)}`, { fontSize:11, bold:true });
    L.setY(L.getY() + 24);

    for(const it of (rows.items||[])){
      const title = `${String(it?.code||"")} · ${String(it?.desc||"")}`.trim();
      L.ensure(28);
      doc.setFont("helvetica","bold");
      doc.setFontSize(10.5);
      doc.text(title, L.margin, L.getY()+10);
      hLine(doc, L.margin, L.margin + L.contentW, L.getY()+16, 0.45, 180);
      L.setY(L.getY()+24);

      const txt = String(it?.spec || it?.especificacion || it?.descripcionLarga || "Sin especificación técnica registrada.");
      L.p(txt);
      L.line();
    }

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType: `ESPECIFICACIONES TÉCNICAS · ${getBudgetLabelPDF(mode)}`,
      projectName: String(project?.name || ""),
      logoDataUrl: String(project?.logoDataUrl || "")
    });

    return doc;
  }

  // =========================
  // API pública
  // =========================
  async function exportPresupuestoPDF(project, options){
    const mode = String(options?.mode || getBudgetModePDF()).toLowerCase() === "oficial" ? "oficial" : "base";
    const doc = newDoc();
    await exportPresupuestoBase(doc, project, mode);
    await finalizePdf(doc, buildFilename(project, mode), options);
  }

  async function exportPresupuestoConAPUsPDF(project, options){
    const mode = String(options?.mode || getBudgetModePDF()).toLowerCase() === "oficial" ? "oficial" : "base";
    const doc = newDoc();
    await exportPresupuestoConAPUs(doc, project, mode);
    await finalizePdf(doc, buildFilename(project, `APUs_${mode}`), options);
  }

  async function exportPresupuestoObraDesagregadoPDF(project, options){
    const mode = String(options?.mode || getBudgetModePDF()).toLowerCase() === "oficial" ? "oficial" : "base";
    const doc = newDoc({ orientation:"landscape" });
    await exportPresupuestoObraDesagregado(doc, project, mode);
    await finalizePdf(doc, buildFilenameDesagregado(project), options);
  }

  async function exportResumenPresupuestoObraDesagregadoPDF(project, options){
    const mode = String(options?.mode || getBudgetModePDF()).toLowerCase() === "oficial" ? "oficial" : "base";
    const doc = newDoc();
    await exportResumenPresupuestoObraDesagregado(doc, project, mode);
    await finalizePdf(doc, buildFilenameResumenDesagregado(project), options);
  }

  async function exportDistribucionPorcentualCostosDirectosPDF(project, options){
    const mode = String(options?.mode || getBudgetModePDF()).toLowerCase() === "oficial" ? "oficial" : "base";
    const doc = newDoc();
    await exportDistribucionPorcentualCostosDirectos(doc, project, mode);
    await finalizePdf(doc, buildFilenameDistribucionPctDirectos(project), options);
  }

  async function exportRendimientoEquipoYManoDeObraPorActividadPDF(project, options){
    const mode = String(options?.mode || getBudgetModePDF()).toLowerCase() === "oficial" ? "oficial" : "base";
    const doc = newDoc();
    await exportRendimientoEquipoYManoDeObraPorActividad(doc, project, mode);
    await finalizePdf(doc, buildFilenameRendimientos(project), options);
  }

  async function exportResumenMaterialesPorActividadPDF(project, options){
    const mode = String(options?.mode || getBudgetModePDF()).toLowerCase() === "oficial" ? "oficial" : "base";
    const doc = newDoc();
    await exportResumenMaterialesPorActividad(doc, project, mode);
    await finalizePdf(doc, buildFilenameResumenMaterialesActividad(project), options);
  }

  async function exportCantidadRecursosEInsumosPresupuestoPDF(project, options){
    const mode = String(options?.mode || getBudgetModePDF()).toLowerCase() === "oficial" ? "oficial" : "base";
    const doc = newDoc();
    await exportCantidadRecursosEInsumosPresupuesto(doc, project, mode);
    await finalizePdf(doc, buildFilenameCantRecursosInsumos(project), options);
  }

  async function exportEspecificacionesTecnicasPDF(project, options){
    const mode = String(options?.mode || getBudgetModePDF()).toLowerCase() === "oficial" ? "oficial" : "base";
    const doc = newDoc();
    await exportEspecificacionesTecnicas(doc, project, mode);
    await finalizePdf(doc, buildFilenameSpecs(project), options);
  }

  window.PDF = {
    exportPresupuestoPDF,
    exportPresupuestoConAPUsPDF,
    exportPresupuestoObraDesagregadoPDF,
    exportResumenPresupuestoObraDesagregadoPDF,
    exportDistribucionPorcentualCostosDirectosPDF,
    exportRendimientoEquipoYManoDeObraPorActividadPDF,
    exportResumenMaterialesPorActividadPDF,
    exportCantidadRecursosEInsumosPresupuestoPDF,
    exportEspecificacionesTecnicasPDF
  };
})();