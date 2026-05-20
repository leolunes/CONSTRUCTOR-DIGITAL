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

     ✅ AJUSTE NUEVO (2026-03 IVA PROYECTO):
     - PDF IVA PROYECTO NO liquida IVA sobre MANO DE OBRA ni TRANSPORTES
     - En Colombia, para esta lógica del proyecto:
         * MANO DE OBRA => IVA 0%
         * TRANSPORTES  => IVA 0%
       Las demás categorías se liquidan con la tarifa configurada del proyecto.

     ✅ AJUSTE NUEVO (2026-03 decimales APU):
     - En el desglose de los APUs, el VR PARCIAL debe mostrarse con dos decimales.
     - También el costo directo del encabezado del APU se muestra con dos decimales.

     ✅ AJUSTE NUEVO (2026-03 ACTAS PARCIALES):
     - Se agregan utilidades PDF para:
         * Acta parcial individual
         * Resumen de actas parciales
         * Ejecutado acumulado vs presupuesto
     - Estos PDFs trabajarán sobre la estructura:
         project.actasParciales = [...]
       sin romper la compatibilidad de los PDFs existentes.
     ========================================================= */

  // =========================
  // TEMA VISUAL (GLOBAL)
  // =========================
  const PDF_THEME = {
    safe: {
      top: 54,
      bottom: 64
    },
    lines: {
      header: { w: 0.55, c: 120 },
      row:    { w: 0.35, c: 200 },
      band:   { w: 0.55, c: 160 }
    }
  };

  // =========================
  // Formateadores / helpers
  // =========================
  function moneyCOP(n){ return "$ " + Math.round(Number(n||0)).toLocaleString("es-CO"); }
  function moneyCOP0(n){ return "$ " + Math.round(Number(n||0)).toLocaleString("es-CO"); }
  function moneyCOP2(n){
    const v = Number(n||0);
    return "$ " + v.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

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
  function buildFilenameIvaProyecto(project){
    const name = sanitizeName(project?.name || "proyecto");
    return `IVA_Proyecto_${name}_${Date.now()}.pdf`;
  }

  // ===== NUEVO: filenames ACTAS =====
  function buildFilenameActaParcial(project, acta){
    const name = sanitizeName(project?.name || "proyecto");
    const num = sanitizeName(acta?.numero || "acta");
    return `Acta_Parcial_${num}_${name}_${Date.now()}.pdf`;
  }
  function buildFilenameResumenActas(project){
    const name = sanitizeName(project?.name || "proyecto");
    return `Resumen_Actas_Parciales_${name}_${Date.now()}.pdf`;
  }
  function buildFilenameEjecutadoVsPresupuesto(project){
    const name = sanitizeName(project?.name || "proyecto");
    return `Ejecutado_vs_Presupuesto_${name}_${Date.now()}.pdf`;
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
      sessionStorage.setItem("presupuesto_contable_last_pdf_ts", String(Date.now()));
      sessionStorage.setItem("presupuesto_contable_last_url", String(location.href || ""));
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
  // Layout base
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
      doc.text(moneyCOP2(parcial), aCol.parc, baseY, { align:"right" });

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
    doc.text(`PROYECTO: ${projectNameUpper}`, L.PAGE_W/2, y, { align:"center" }); y += 40;

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

  // =========================
  // Helpers para ACTAS PARCIALES
  // =========================
  function getProjectActas(project){
    return Array.isArray(project?.actasParciales) ? project.actasParciales.slice() : [];
  }

  function getActaLines(acta){
    return Array.isArray(acta?.lines) ? acta.lines.slice() : [];
  }

  function actaEstado(acta){
    return String(acta?.estado || "BORRADOR").trim().toUpperCase();
  }

  function actaNumero(acta){
    return String(acta?.numero || "").trim() || "—";
  }

  function actaFecha(acta){
    return String(acta?.fecha || "").slice(0,10);
  }

  function actaPeriodo(acta){
    return String(acta?.periodo || "").trim() || "—";
  }

  function actaObservacion(acta){
    return String(acta?.observacion || "").trim();
  }

  function actaLineParcial(line){
    const qty = Number(line?.qtyActa ?? line?.qty ?? 0);
    const pu = Number(line?.pu ?? 0);
    const parcial = Number(line?.vrParcialActa ?? line?.parcial ?? 0);
    return parcial || (qty * pu);
  }

  function actaTotal(acta){
    const own = Number(acta?.totalValor || 0);
    if(own > 0) return own;
    return getActaLines(acta).reduce((s,ln)=> s + actaLineParcial(ln), 0);
  }

  function sortActas(list){
    return (list || []).slice().sort((a,b)=>{
      const fa = String(a?.fecha || "");
      const fb = String(b?.fecha || "");
      if(fa !== fb) return fb.localeCompare(fa, "es");
      return String(a?.numero || "").localeCompare(String(b?.numero || ""), "es", { numeric:true });
    });
  }

  function calcActasAcumuladas(project){
    const actas = getProjectActas(project);
    const acc = new Map();

    for(const acta of actas){
      for(const ln of getActaLines(acta)){
        const code = String(ln?.code || "").trim();
        if(!code) continue;
        const prev = Number(acc.get(code) || 0);
        const qtyActa = Number(ln?.qtyActa ?? ln?.qty ?? 0);
        acc.set(code, prev + qtyActa);
      }
    }
    return acc;
  }

  function calcActasResumen(project){
    const actas = sortActas(getProjectActas(project));
    const acumuladoPorItem = calcActasAcumuladas(project);
    const items = Array.isArray(project?.items) ? project.items.slice() : [];

    const rowsVsPres = items.map(it=>{
      const code = String(it?.code || "").trim();
      const qtyPres = Number(it?.qty || 0);
      const qtyEj = Number(acumuladoPorItem.get(code) || 0);
      const saldo = qtyPres - qtyEj;
      const pu = Number(it?.pu || 0);
      return {
        chapterCode: String(it?.chapterCode || ""),
        chapterName: String(it?.chapterName || ""),
        code,
        desc: String(it?.desc || ""),
        unit: String(it?.unit || ""),
        qtyPresupuesto: qtyPres,
        qtyEjecutada: qtyEj,
        saldo,
        pu,
        vrPresupuesto: qtyPres * pu,
        vrEjecutado: qtyEj * pu
      };
    });

    const totalActas = actas.reduce((s,a)=> s + actaTotal(a), 0);
    const totalEjecutado = rowsVsPres.reduce((s,r)=> s + Number(r.vrEjecutado || 0), 0);
    const totalPresupuesto = rowsVsPres.reduce((s,r)=> s + Number(r.vrPresupuesto || 0), 0);

    return {
      actas,
      rowsVsPres,
      totalActas,
      totalEjecutado,
      totalPresupuesto
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

  async function getAPUForProjectItem(project, it){
    const c1 = String(it?.apuRefCode || "").trim();
    const c2 = String(it?.code || "").trim();

    const candidates = [];
    for(const c of [c1, c2]){
      if(c && !candidates.includes(c)) candidates.push(c);
    }

    function looksLikeSameAPU(expectedDesc, expectedUnit, apuSubtitle){
      const ed = String(expectedDesc||"").trim();
      if(!ed) return true;
      const a = tokenSet(ed);
      const b = tokenSet(String(apuSubtitle||"").trim() || "");
      const sim = jaccard(a,b);
      if(sim < 0.30) return false;
      return true;
    }

    async function tryByCode(apuCode){
      if(!apuCode) return null;

      try{
        if(window.StorageAPI?.getApuOverride){
          const ov = StorageAPI.getApuOverride(project.id, apuCode);
          if(ov){
            const lines = Array.isArray(ov.lines) ? ov.lines : [];
            const directo = lines.reduce((s,l)=>{
              const qty = Number(l.qty||0);
              const pu = Number(l.pu||0);
              const parcial = Number(l.parcial||0) || (qty*pu);
              return s + parcial;
            }, 0);

            if(!looksLikeSameAPU(it?.desc, it?.unit, ov.desc || it?.desc)){
              return null;
            }

            return {
              _src: "override",
              _match: "code",
              code: apuCode,
              subtitle: String(ov.desc || it.desc || "").trim(),
              unit: String(ov.unit || it.unit || "").trim(),
              directo,
              lines
            };
          }
        }
      }catch(_){}

      try{
        const custom = window.StorageAPI?.getCustomAPU ? StorageAPI.getCustomAPU(apuCode) : null;
        if(custom){
          const directo = (custom.lines||[]).reduce((s,l)=>{
            const qty = Number(l.qty||0);
            const pu = Number(l.pu||0);
            const parcial = Number(l.parcial||0) || (qty*pu);
            return s + parcial;
          }, 0);

          if(!looksLikeSameAPU(it?.desc, it?.unit, custom.desc || it?.desc)){
            return null;
          }

          return {
            _src:"custom",
            _match: "code",
            code: apuCode,
            subtitle: String(custom.desc || it.desc || "").trim(),
            unit: String(custom.unit || it.unit || "").trim(),
            directo,
            lines: custom.lines || []
          };
        }
      }catch(_){}

      const base = await (window.APUBase?.getAPU ? APUBase.getAPU(apuCode) : null);
      if(!base) return null;

      if(!looksLikeSameAPU(it?.desc, it?.unit, base.subtitle || it?.desc)){
        return null;
      }

      return {
        _src:"base",
        _match: "code",
        code: apuCode,
        subtitle: String(base.subtitle || it.desc || "").trim(),
        unit: String(base.unit || it.unit || "").trim(),
        directo: Number(base.directo||0),
        lines: base.lines || []
      };
    }

    for(const c of candidates){
      const got = await tryByCode(c);
      if(got) return got;
    }

    const desc = String(it?.desc || "").trim();
    if(desc){
      const codeByDesc = await findApuCodeByDesc(desc, it?.unit);
      if(codeByDesc){
        const got = await tryByCode(codeByDesc);
        if(got){
          got._match = "desc";
          got._descCode = codeByDesc;
          return got;
        }
      }
    }

    return null;
  }

  function openBlobInNewTab(blob){
    try{
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(()=>URL.revokeObjectURL(url), 60000);
      return !!win;
    }catch(_){
      return false;
    }
  }

  function downloadBlob(blob, filename){
    const mobile = isMobileLike();

    if(mobile){
      const opened = openBlobInNewTab(blob);
      if(opened) return true;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `archivo_${Date.now()}.pdf`;
    a.rel = "noopener";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 1500);
    return true;
  }

  async function shareBlobAsFile(blob, filename){
    const canShare = !!navigator.share;
    if(!canShare) return false;

    const file = new File([blob], filename, { type:"application/pdf" });

    try{
      if(navigator.canShare && !navigator.canShare({ files:[file] })){
        return false;
      }
    }catch(_){}

    try{
      forcePersistAppState();
      await sleep(80);

      await navigator.share({
        title: filename,
        text: "PDF generado desde CONSTRUCTOR-DIGITAL",
        files: [file]
      });

      forcePersistAppState();
      return true;
    }catch(err){
      console.log("[PDF] share cancelled/error:", err);
      forcePersistAppState();
      return false;
    }
  }

  async function finalizePDF(doc, filename, opts){
    installPersistHooksOnce();
    forcePersistAppState();

    const o = opts || {};
    const blob = doc.output("blob");

    try{
      sessionStorage.setItem("presupuesto_contable_last_pdf_name", String(filename || ""));
      sessionStorage.setItem("presupuesto_contable_last_pdf_ts", String(Date.now()));
    }catch(_){}

    await sleep(60);
    forcePersistAppState();

    if(o.share){
      const ok = await shareBlobAsFile(blob, filename);
      forcePersistAppState();
      if(ok) return true;

      downloadBlob(blob, filename);
      await sleep(60);
      forcePersistAppState();
      return true;
    }

    downloadBlob(blob, filename);
    await sleep(60);
    forcePersistAppState();
    return true;
  }

  function ensureWithHeader(L, needH, headerFn){
    const jumped = L.ensure(needH);
    if(jumped && typeof headerFn === "function"){
      headerFn();
    }
    return jumped;
  }

  function classifyDirectGroup(grpRaw){
    const upg = String(grpRaw||"").toUpperCase();
    if(upg.includes("SUBCONTRAT")) return "SUBCONTRATOS";
    if(upg.includes("MATERIAL")) return "MATERIALES";
    if(upg.includes("MANO") && upg.includes("OBRA")) return "MANO DE OBRA";
    if(upg.includes("EQUIPO") || upg.includes("HERRAM") || upg.includes("MAQUIN")) return "EQUIPO Y HERRAM";
    if(upg.includes("TRANSP")) return "TRANSPORTES";
    return "OTROS";
  }

  function getChapterFromItem(it){
    return it.chapterCode || (String(it.code||"").split(".")[0] || "SIN");
  }
  function getChapterNameFromItem(it){
    return safe(it.chapterName||"");
  }

  async function calcDesagregadoByItemFromAPU(project, items){
    const out = [];
    const totals = {
      MATERIALES:0,
      "EQUIPO Y HERRAM":0,
      "MANO DE OBRA":0,
      SUBCONTRATOS:0,
      TRANSPORTES:0,
      OTROS:0
    };

    for(const it of (items||[])){
      const qtyItem = Number(it.qty||0);

      const apuObj = await getAPUForProjectItem(project, it);
      const lines = (apuObj && Array.isArray(apuObj.lines)) ? apuObj.lines : [];

      const unitBuckets = {
        MATERIALES:0,
        "EQUIPO Y HERRAM":0,
        "MANO DE OBRA":0,
        SUBCONTRATOS:0,
        TRANSPORTES:0,
        OTROS:0
      };

      for(const ln of lines){
        const grp = classifyDirectGroup(ln.group || ln.tipo || "");
        const lqty = Number(ln.qty||0);
        const lpu  = Number(ln.pu||0);
        const parcialUnit = Number(ln.parcial||0) || (lqty * lpu);
        unitBuckets[grp] = (unitBuckets[grp]||0) + parcialUnit;
      }

      const row = {
        chapterCode: getChapterFromItem(it),
        chapterName: getChapterNameFromItem(it),
        code: safe(it.code||""),
        desc: safe(it.desc||""),
        unit: safe(it.unit||""),
        qtyItem,
        MATERIALES: unitBuckets.MATERIALES * qtyItem,
        "EQUIPO Y HERRAM": unitBuckets["EQUIPO Y HERRAM"] * qtyItem,
        "MANO DE OBRA": unitBuckets["MANO DE OBRA"] * qtyItem,
        SUBCONTRATOS: unitBuckets.SUBCONTRATOS * qtyItem,
        TRANSPORTES: unitBuckets.TRANSPORTES * qtyItem,
        OTROS: unitBuckets.OTROS * qtyItem
      };

      row.VR_PARCIAL =
        row.MATERIALES +
        row["EQUIPO Y HERRAM"] +
        row["MANO DE OBRA"] +
        row.SUBCONTRATOS +
        row.TRANSPORTES +
        row.OTROS;

      totals.MATERIALES += row.MATERIALES;
      totals["EQUIPO Y HERRAM"] += row["EQUIPO Y HERRAM"];
      totals["MANO DE OBRA"] += row["MANO DE OBRA"];
      totals.SUBCONTRATOS += row.SUBCONTRATOS;
      totals.TRANSPORTES += row.TRANSPORTES;
      totals.OTROS += row.OTROS;

      out.push(row);
    }

    const totalDirecto =
      totals.MATERIALES +
      totals["EQUIPO Y HERRAM"] +
      totals["MANO DE OBRA"] +
      totals.SUBCONTRATOS +
      totals.TRANSPORTES +
      totals.OTROS;

    return { rows: out, totals, totalDirecto };
  }
  async function exportPresupuestoPDF(project, opts){
    const doc = newDoc();
    const L = mkLayout(doc);

    const { groups, items } = Calc.groupByChapters(project);

    const totals = totalsCompat(project);
    const adminPct = pct(project, "adminPct", "aiuPct");
    const imprevPct = pct(project, "imprevPct", null);
    const utilPct = pct(project, "utilPct", null);
    const ivaUtilPct = pct(project, "ivaUtilPct", "ivaPct");

    drawInstitutionalCover(doc, L, project, "PRESUPUESTO DE OBRA");

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "RESUMEN ECONÓMICO", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    L.row("TOTAL COSTOS DIRECTOS:", moneyCOP(totals.directo));
    L.row(`ADMINISTRACIÓN (${adminPct||0}%):`, moneyCOP(totals.admin||0));
    L.row(`IMPREVISTOS (${imprevPct||0}%):`, moneyCOP(totals.imprev||0));
    L.row(`UTILIDAD (${utilPct||0}%):`, moneyCOP(totals.util||0));
    L.row("SUBTOTAL:", moneyCOP(totals.subtotal||0));
    L.row(`IVA sobre Utilidad (${ivaUtilPct||0}%):`, moneyCOP(totals.ivaUtil||0));
    L.row("VALOR TOTAL:", moneyCOP(totals.total));

    L.p(" ");

    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "CAPÍTULOS (SUBTOTALES)", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    if(!groups.length){
      L.p("No hay ítems para calcular capítulos.");
    }else{
      for(const g of groups){
        L.ensure(20);
        doc.setFont("helvetica","bold");
        doc.setFontSize(10.2);
        doc.text(`${g.chapterCode}  ${safe(g.chapterName||"")}`, L.margin, L.getY());

        doc.setFont("helvetica","normal");
        doc.text(`Ítems: ${g.itemsCount}`, L.margin + 320, L.getY());
        doc.setFont("helvetica","bold");
        doc.text(moneyCOP(g.subtotal), L.margin + 520, L.getY(), { align:"right" });
        L.setY(L.getY()+16);

        hLine(doc, L.margin, L.margin + L.contentW, L.getY(), PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
        L.setY(L.getY()+10);
      }
    }

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    if(!items.length){
      L.p("Sin ítems.");
    }else{
      let currentChap = null;
      for(const it of items){
        const chap = it.chapterCode || (String(it.code||"").split(".")[0] || "SIN");
        if(chap !== currentChap){
          currentChap = chap;
          drawBand(doc, L.margin, L.getY(), L.contentW, 18, `CAPÍTULO ${chap} — ${safe(it.chapterName||"")}`, { fontSize:9.4, bold:true });
          L.setY(L.getY()+22);
          L.tableHeaderPresupuesto();
        }
        L.tableRowPresupuesto(it);
      }
    }

    L.line();
    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "TOTALES", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    L.row("TOTAL COSTOS DIRECTOS:", moneyCOP(totals.directo));
    L.row(`ADMINISTRACIÓN (${adminPct||0}%):`, moneyCOP(totals.admin||0));
    L.row(`IMPREVISTOS (${imprevPct||0}%):`, moneyCOP(totals.imprev||0));
    L.row(`UTILIDAD (${utilPct||0}%):`, moneyCOP(totals.util||0));
    L.row("SUBTOTAL:", moneyCOP(totals.subtotal||0));
    L.row(`IVA sobre Utilidad (${ivaUtilPct||0}%):`, moneyCOP(totals.ivaUtil||0));
    L.row("VALOR TOTAL:", moneyCOP(totals.total));

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"PRESUPUESTO DE OBRA",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });

    const filename = buildFilename(project, "DETALLE");
    return await finalizePDF(doc, filename, opts);
  }

  async function exportPresupuestoConAPUsPDF(project, opts){
    const doc = newDoc();
    const L = mkLayout(doc);

    const { groups, items } = Calc.groupByChapters(project);

    const totals = totalsCompat(project);
    const adminPct = pct(project, "adminPct", "aiuPct");
    const imprevPct = pct(project, "imprevPct", null);
    const utilPct = pct(project, "utilPct", null);
    const ivaUtilPct = pct(project, "ivaUtilPct", "ivaPct");

    drawInstitutionalCover(doc, L, project, "PRESUPUESTO DE OBRA + APUs");

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "RESUMEN ECONÓMICO", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    L.row("TOTAL COSTOS DIRECTOS:", moneyCOP(totals.directo));
    L.row(`ADMINISTRACIÓN (${adminPct||0}%):`, moneyCOP(totals.admin||0));
    L.row(`IMPREVISTOS (${imprevPct||0}%):`, moneyCOP(totals.imprev||0));
    L.row(`UTILIDAD (${utilPct||0}%):`, moneyCOP(totals.util||0));
    L.row("SUBTOTAL:", moneyCOP(totals.subtotal||0));
    L.row(`IVA sobre Utilidad (${ivaUtilPct||0}%):`, moneyCOP(totals.ivaUtil||0));
    L.row("VALOR TOTAL:", moneyCOP(totals.total));

    L.p(" ");
    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "CAPÍTULOS (SUBTOTALES)", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    if(!groups.length){
      L.p("No hay ítems para calcular capítulos.");
    }else{
      for(const g of groups){
        L.ensure(20);
        doc.setFont("helvetica","bold");
        doc.setFontSize(10.2);
        doc.text(`${g.chapterCode}  ${safe(g.chapterName||"")}`, L.margin, L.getY());

        doc.setFont("helvetica","normal");
        doc.text(`Ítems: ${g.itemsCount}`, L.margin + 320, L.getY());
        doc.setFont("helvetica","bold");
        doc.text(moneyCOP(g.subtotal), L.margin + 520, L.getY(), { align:"right" });
        L.setY(L.getY()+16);

        hLine(doc, L.margin, L.margin + L.contentW, L.getY(), PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
        L.setY(L.getY()+10);
      }
    }

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "PRESUPUESTO (DETALLE)", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    L.tableHeaderPresupuesto();
    for(const it of items){
      L.tableRowPresupuesto(it);
    }

    for(const it of items){
      const codeVisible = String(it.code||"").trim();

      doc.addPage();
      L.setY(PDF_THEME.safe.top);

      const apuObj = await getAPUForProjectItem(project, it);

      let title = `APU ${codeVisible || "-"}`;
      if(apuObj && apuObj._match === "desc"){
        title = `APU ${codeVisible || "-"} (Base por descripción: ${apuObj.code})`;
      }else{
        const apuRef = String(it.apuRefCode||"").trim();
        if(apuRef && codeVisible && apuRef !== codeVisible){
          title = `APU ${codeVisible} (Ref: ${apuRef})`;
        }
      }

      if(!apuObj){
        drawBand(doc, L.margin, L.getY(), L.contentW, 18, title, { fontSize:10, bold:true });
        L.setY(L.getY()+24);
        L.p("No se encontró descomposición (override, custom o base).");
        continue;
      }

      drawBand(doc, L.margin, L.getY(), L.contentW, 18, title, { fontSize:10, bold:true });
      L.setY(L.getY()+24);

      doc.setFont("helvetica","bold"); doc.setFontSize(10.2);
      doc.text(safe(apuObj.subtitle || it.desc || ""), L.margin, L.getY());
      L.setY(L.getY()+14);

      doc.setFont("helvetica","normal"); doc.setFontSize(10);
      L.p(`Unidad: ${safe(apuObj.unit||it.unit||"-")} · Costo directo: ${moneyCOP2(apuObj.directo||0)}`);

      L.tableHeaderAPU();

      const lines = apuObj.lines || [];
      if(!lines.length){
        L.p("Sin líneas en la descomposición.");
      }else{
        for(const ln of lines){
          L.tableRowAPU({
            group: ln.group || ln.tipo || "-",
            desc: ln.desc || "",
            unit: ln.unit || "",
            qty: ln.qty || 0,
            pu: ln.pu || 0,
            parcial: ln.parcial || 0
          });
        }
      }
    }

    doc.addPage();
    L.setY(PDF_THEME.safe.top);
    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "FIRMAS", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"PRESUPUESTO DE OBRA + APUs",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });

    const filename = buildFilename(project, "APUS");
    return await finalizePDF(doc, filename, opts);
  }

  function detectNormatividad(desc){
    const t = String(desc||"").toLowerCase();
    const invias = /v(i|í)a|carretera|pavimento|asfalto|subbase|base granular|señalizaci(o|ó)n|cuneta|alcantarilla|drenaje/.test(t);
    const nsr10  = /concreto|hormig(o|ó)n|acero|refuerzo|estructura|mamposter(i|í)a|cimentaci(o|ó)n|viga|columna|losa/.test(t);
    const retie  = /el(e|é)ctr|tablero|cable|conductor|puesta a tierra|toma|breaker|interruptor|transformador/.test(t);
    const retilap= /iluminaci(o|ó)n|luminaria|lux|fotometr|reflector|poste|proyector|lampara|l(a|á)mpara/.test(t);
    return { invias, nsr10, retie, retilap };
  }

  function normalizeGroup(g){
    const up = String(g||"").toUpperCase();
    if(!up.trim()) return "OTROS";
    if(up.includes("MATERIAL")) return "MATERIALES";
    if(up.includes("MANO") && up.includes("OBRA")) return "MANO DE OBRA";
    if(up.includes("EQUIPO") || up.includes("HERRAM") || up.includes("MAQUIN")) return "EQUIPO / HERRAMIENTA / MAQUINARIA";
    if(up.includes("TRANSP")) return "TRANSPORTE";
    if(up.includes("SUBPROD")) return "SUBPRODUCTOS";
    return "OTROS";
  }

  function formatInsumoLine(l){
    const desc = safe(l.desc || "");
    return `- ${desc}`;
  }

  function chapterLabel(g){
    const code = safe(g.chapterCode||"");
    const name = safe(g.chapterName||"");
    return name ? `Capítulo ${code} – ${name}` : `Capítulo ${code}`;
  }

  async function exportEspecificacionesTecnicasPDF(project, opts){
    const doc = newDoc();
    const L = mkLayout(doc);

    const { groups, items } = Calc.groupByChapters(project);
    const elab = window.StorageAPI?.getElaborador ? StorageAPI.getElaborador() : null;

    const entidadContratante = project?.entity ? String(project.entity) : "—";
    const ubicacion = project?.location ? String(project.location) : "—";

    drawInstitutionalCover(doc, L, project, "ESPECIFICACIONES TÉCNICAS DEL PROYECTO");

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "TABLA DE CONTENIDO", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    doc.setFont("helvetica","normal"); doc.setFontSize(11);

    const toc = [];
    toc.push("1. Información General");
    toc.push("2. Alcance del Documento");

    let sec = 3;
    for(const g of (groups||[])){
      toc.push(`${sec}. ${chapterLabel(g)}`);
      sec++;
    }
    toc.push(`${sec}. Firmas`);

    for(const t of toc){
      L.ensure(16);
      doc.text(t, L.margin, L.getY());
      L.setY(L.getY()+16);
    }

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "1. INFORMACIÓN GENERAL", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    doc.setFont("helvetica","normal"); doc.setFontSize(11);
    L.p(`Entidad: ${entidadContratante}`);
    L.p(`Ubicación: ${ubicacion}`);

    if(elab){
      if(elab.nombre) L.p(`Elaboró: ${elab.nombre}`);
      if(elab.profesion) L.p(`Profesión: ${elab.profesion}`);
      if(elab.matricula) L.p(`Matrícula Profesional: ${elab.matricula}`);
    }

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "2. ALCANCE DEL DOCUMENTO", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    doc.setFont("helvetica","normal"); doc.setFontSize(11);
    L.p(
      "El presente documento consolida las especificaciones técnicas correspondientes a los ítems contemplados " +
      "dentro del presupuesto oficial del proyecto. Las especificaciones se estructuran con base en el " +
      "Análisis de Precios Unitarios (APU) y establecen los lineamientos técnicos, constructivos y normativos exigidos."
    );

    const byChap = new Map();
    for(const it of (items||[])){
      const chap = it.chapterCode || (String(it.code||"").split(".")[0] || "");
      if(!byChap.has(chap)) byChap.set(chap, []);
      byChap.get(chap).push(it);
    }

    let chapSec = 3;

    for(const g of (groups||[])){
      const chapCode = safe(g.chapterCode||"");
      const chapName = safe(g.chapterName||"");
      const chapKey = chapCode || "";
      const chapItems = byChap.get(chapKey) || [];

      let itemSub = 1;

      for(const it of chapItems){
        doc.addPage();
        L.setY(PDF_THEME.safe.top);

        drawBand(
          doc,
          L.margin,
          L.getY(),
          L.contentW,
          18,
          `${chapSec}. CAPÍTULO ${chapCode}${chapName ? " – " + chapName.toUpperCase() : ""}   |   ${chapSec}.${itemSub} ÍTEM ${safe(it.code||"")}`,
          { fontSize:9.2, bold:true }
        );
        L.setY(L.getY()+24);

        const code = safe(it.code||"");
        const desc = safe(it.desc||"");
        const unit = safe(it.unit||"-");
        const qty = Number(it.qty||0);
        const pu = Number(it.pu||0);
        const parcial = pu * qty;

        const norms = detectNormatividad(desc);

        doc.setFont("helvetica","bold"); doc.setFontSize(11);
        L.p(`Descripción: ${desc}`);

        doc.setFont("helvetica","normal"); doc.setFontSize(11);
        L.p(`Unidad: ${unit} · Cantidad: ${qty||0} · VR Unitario: ${moneyCOP(pu)} · VR Parcial: ${moneyCOP(parcial)}`);

        doc.setFont("helvetica","bold"); doc.setFontSize(11);
        L.p("1. OBJETO Y ALCANCE");
        doc.setFont("helvetica","normal"); doc.setFontSize(11);
        L.p(
          "Ejecutar el ítem indicado conforme a los planos, especificaciones del proyecto y el presupuesto aprobado. " +
          "Incluye el suministro de insumos, transporte interno, equipos, herramientas, mano de obra, control de calidad " +
          "y disposición de residuos según aplique."
        );

        doc.setFont("helvetica","bold"); doc.setFontSize(11);
        L.p("2. INSUMOS Y RECURSOS (APU)");
        doc.setFont("helvetica","normal"); doc.setFontSize(11);

        const apuObj = await getAPUForProjectItem(project, it);
        const lines = (apuObj && Array.isArray(apuObj.lines)) ? apuObj.lines : [];

        const buckets = {
          "MATERIALES": [],
          "MANO DE OBRA": [],
          "EQUIPO / HERRAMIENTA / MAQUINARIA": [],
          "TRANSPORTE": [],
          "SUBPRODUCTOS": [],
          "OTROS": []
        };

        for(const ln of (lines||[])){
          const gg = normalizeGroup(ln.group || ln.tipo || "");
          (buckets[gg] || buckets["OTROS"]).push(ln);
        }

        L.p("2.1 Materiales");
        if(!buckets["MATERIALES"].length) L.p("- No aplica / sin registros.");
        else buckets["MATERIALES"].forEach(l => L.p(formatInsumoLine(l)));

        L.p("2.2 Mano de obra");
        if(!buckets["MANO DE OBRA"].length) L.p("- No aplica / sin registros.");
        else buckets["MANO DE OBRA"].forEach(l => L.p(formatInsumoLine(l)));

        L.p("2.3 Equipo, herramienta y/o maquinaria");
        if(!buckets["EQUIPO / HERRAMIENTA / MAQUINARIA"].length) L.p("- No aplica / sin registros.");
        else buckets["EQUIPO / HERRAMIENTA / MAQUINARIA"].forEach(l => L.p(formatInsumoLine(l)));

        L.p("2.4 Transporte");
        if(!buckets["TRANSPORTE"].length) L.p("- No aplica / sin registros.");
        else buckets["TRANSPORTE"].forEach(l => L.p(formatInsumoLine(l)));

        if(buckets["SUBPRODUCTOS"].length){
          L.p("2.5 Subproductos");
          buckets["SUBPRODUCTOS"].forEach(l => L.p(formatInsumoLine(l)));
        }

        if(buckets["OTROS"].length){
          L.p("2.6 Otros");
          buckets["OTROS"].forEach(l => L.p(formatInsumoLine(l)));
        }

        doc.setFont("helvetica","bold"); doc.setFontSize(11);
        L.p("3. PROCEDIMIENTO DE EJECUCIÓN (GENERAL)");
        doc.setFont("helvetica","normal"); doc.setFontSize(11);
        L.p(
          "a) Replanteo y verificación de condiciones del sitio. " +
          "b) Preparación de áreas y acopio de materiales. " +
          "c) Ejecución de actividades según planos y especificaciones del proyecto. " +
          "d) Control de calidad durante la ejecución. " +
          "e) Limpieza final, retiro de sobrantes y entrega del frente."
        );

        doc.setFont("helvetica","bold"); doc.setFontSize(11);
        L.p("4. MEDICIÓN Y FORMA DE PAGO");
        doc.setFont("helvetica","normal"); doc.setFontSize(11);
        L.p(
          `La medición se realizará en ${unit} para el ítem ${code}, conforme a actas de obra y/o reportes de medición aprobados por la interventoría. ` +
          "El pago se efectuará al precio unitario pactado, incluyendo suministros, equipos, mano de obra, transporte interno, " +
          "desperdicios normales, pruebas y controles exigidos."
        );

        doc.setFont("helvetica","bold"); doc.setFontSize(11);
        L.p("5. NORMATIVIDAD Y REQUISITOS APLICABLES");
        doc.setFont("helvetica","normal"); doc.setFontSize(11);

        const mark = (v)=> v ? "[X]" : "[ ]";
        const allFalse = !norms.invias && !norms.nsr10 && !norms.retie && !norms.retilap;

        if(allFalse){
          L.p("Este ítem deberá cumplir la normatividad que aplique según su naturaleza. Referencias típicas:");
          L.p(`- [ ] Normatividad INVÍAS (cuando aplique a infraestructura vial).`);
          L.p(`- [ ] NSR-10 (cuando aplique a componentes estructurales).`);
          L.p(`- [ ] RETIE (cuando aplique a instalaciones eléctricas).`);
          L.p(`- [ ] RETILAP (cuando aplique a iluminación).`);
        }else{
          L.p("Cumplimiento mínimo esperado (según inferencia por descripción del ítem):");
          L.p(`- ${mark(norms.invias)} Normatividad INVÍAS (según aplique).`);
          L.p(`- ${mark(norms.nsr10)} NSR-10 (según aplique).`);
          L.p(`- ${mark(norms.retie)} RETIE (según aplique).`);
          L.p(`- ${mark(norms.retilap)} RETILAP (según aplique).`);
        }

        itemSub++;
      }

      chapSec++;
    }

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    drawBand(doc, L.margin, L.getY(), L.contentW, 18, `${chapSec}. FIRMAS`, { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"ESPECIFICACIONES TÉCNICAS",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });

    const filename = buildFilenameSpecs(project);
    return await finalizePDF(doc, filename, opts);
  }

  async function exportActaParcialPDF(project, acta, opts){
    const doc = newDoc();
    const L = mkLayout(doc);

    const lines = getActaLines(acta);
    const totalValor = actaTotal(acta);

    drawInstitutionalCover(doc, L, project, `ACTA PARCIAL No. ${actaNumero(acta)}`);

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "DATOS DEL ACTA PARCIAL", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    L.row("No. ACTA:", actaNumero(acta));
    L.row("FECHA:", actaFecha(acta) || "—");
    L.row("PERIODO EJECUTADO:", actaPeriodo(acta));
    L.row("ESTADO:", actaEstado(acta));
    L.row("VALOR ACTA:", moneyCOP0(totalValor));

    const obs = actaObservacion(acta);
    if(obs){
      L.p(" ");
      drawBand(doc, L.margin, L.getY(), L.contentW, 18, "OBSERVACIÓN", { fontSize:10, bold:true });
      L.setY(L.getY()+24);
      L.p(obs);
    }

    L.p(" ");
    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "DETALLE DE ÍTEMS EJECUTADOS", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    const margin = L.margin;
    const contentW = L.contentW;

    let cols = [
      { k:"cap",  label:"CAP", w:40, align:"left" },
      { k:"code", label:"ITEM", w:55, align:"left" },
      { k:"desc", label:"DESCRIPCIÓN", w:210, align:"left" },
      { k:"unit", label:"UNID", w:36, align:"center" },
      { k:"qpre", label:"CANT PRES", w:58, align:"right" },
      { k:"qact", label:"CANT ACTA", w:58, align:"right" },
      { k:"pu",   label:"VR UNIT", w:70, align:"right" },
      { k:"parc", label:"VR PARCIAL", w:85, align:"right" }
    ];
    cols = fitColsToWidth(cols, contentW, 22);

    function header(){
      const yTop = L.getY();
      const h = 18;
      L.ensure(h + 8);

      let x = margin;
      doc.setFont("helvetica","bold");
      doc.setFontSize(7.6);

      for(const c of cols){
        drawCellText(doc, x, yTop, c.w, h, c.label, "center", { bold:true, fontSize:7.6 });
        x += c.w;
      }

      hLine(doc, margin, margin+contentW, yTop + h, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
      L.setY(yTop + h + 6);
    }

    function row(line){
      const descLines = splitToLines(doc, safe(line?.desc || ""), cols[2].w - 6, 2);
      const rowH = Math.max(18, 8 + descLines.length * 9);
      ensureWithHeader(L, rowH + 10, header);

      const yTop = L.getY();
      let x = margin;

      drawCellText(doc, x, yTop, cols[0].w, rowH, safe(line?.chapterCode || ""), "left", { fontSize:7.6 }); x += cols[0].w;
      drawCellText(doc, x, yTop, cols[1].w, rowH, safe(line?.code || ""), "left", { bold:true, fontSize:7.6 }); x += cols[1].w;
      drawCellText(doc, x, yTop, cols[2].w, rowH, descLines, "left", { fontSize:7.6 }); x += cols[2].w;
      drawCellText(doc, x, yTop, cols[3].w, rowH, safe(line?.unit || ""), "center", { fontSize:7.6 }); x += cols[3].w;
      drawCellText(doc, x, yTop, cols[4].w, rowH, fmtQty(Number(line?.qtyPresupuesto || 0)), "right", { fontSize:7.6 }); x += cols[4].w;
      drawCellText(doc, x, yTop, cols[5].w, rowH, fmtQty(Number(line?.qtyActa ?? line?.qty ?? 0)), "right", { fontSize:7.6 }); x += cols[5].w;
      drawCellText(doc, x, yTop, cols[6].w, rowH, moneyCOP0(Number(line?.pu || 0)), "right", { fontSize:7.6 }); x += cols[6].w;
      drawCellText(doc, x, yTop, cols[7].w, rowH, moneyCOP0(actaLineParcial(line)), "right", { bold:true, fontSize:7.6 });

      hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      L.setY(yTop + rowH + 2);
    }

    header();

    if(!lines.length){
      L.p("Esta acta parcial no tiene líneas registradas.");
    }else{
      for(const ln of lines){
        row(ln);
      }
    }

    ensureWithHeader(L, 40, header);
    const yT = L.getY();
    doc.setFont("helvetica","bold"); doc.setFontSize(9.4);
    doc.text("VALOR TOTAL DEL ACTA", margin, yT + 12);
    doc.text(moneyCOP0(totalValor), margin + contentW - 8, yT + 12, { align:"right" });
    hLine(doc, margin, margin+contentW, yT + 18, PDF_THEME.lines.band.w, PDF_THEME.lines.band.c);
    L.setY(yT + 26);

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:`ACTA PARCIAL No. ${actaNumero(acta)}`,
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });

    const filename = buildFilenameActaParcial(project, acta);
    return await finalizePDF(doc, filename, opts);
  }

  async function exportResumenActasParcialesPDF(project, opts){
    const doc = newDoc();
    const L = mkLayout(doc);

    const resumen = calcActasResumen(project);
    const actas = resumen.actas || [];

    drawInstitutionalCover(doc, L, project, "RESUMEN DE ACTAS PARCIALES");

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "RESUMEN GENERAL", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    L.row("NÚMERO DE ACTAS:", String(actas.length));
    L.row("VALOR TOTAL ACTAS:", moneyCOP0(resumen.totalActas || 0));
    L.row("VALOR EJECUTADO ACUMULADO:", moneyCOP0(resumen.totalEjecutado || 0));
    L.row("VALOR TOTAL PRESUPUESTO:", moneyCOP0(resumen.totalPresupuesto || 0));

    L.p(" ");
    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "HISTÓRICO DE ACTAS", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    const margin = L.margin;
    const contentW = L.contentW;

    let cols = [
      { k:"num",    label:"ACTA", w:52, align:"left" },
      { k:"fecha",  label:"FECHA", w:68, align:"left" },
      { k:"periodo",label:"PERIODO", w:180, align:"left" },
      { k:"estado", label:"ESTADO", w:70, align:"left" },
      { k:"items",  label:"ÍTEMS", w:42, align:"right" },
      { k:"valor",  label:"VALOR ACTA", w:100, align:"right" }
    ];
    cols = fitColsToWidth(cols, contentW, 24);

    function header(){
      const yTop = L.getY();
      const h = 18;
      L.ensure(h + 8);

      let x = margin;
      doc.setFont("helvetica","bold");
      doc.setFontSize(8.0);

      for(const c of cols){
        drawCellText(doc, x, yTop, c.w, h, c.label, "center", { bold:true, fontSize:8.0 });
        x += c.w;
      }

      hLine(doc, margin, margin+contentW, yTop + h, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
      L.setY(yTop + h + 6);
    }

    function row(acta){
      const periodoLines = splitToLines(doc, actaPeriodo(acta), cols[2].w - 6, 2);
      const rowH = Math.max(18, 8 + periodoLines.length * 9);

      ensureWithHeader(L, rowH + 10, header);

      const yTop = L.getY();
      let x = margin;

      drawCellText(doc, x, yTop, cols[0].w, rowH, actaNumero(acta), "left", { bold:true, fontSize:8.0 }); x += cols[0].w;
      drawCellText(doc, x, yTop, cols[1].w, rowH, actaFecha(acta) || "—", "left", { fontSize:8.0 }); x += cols[1].w;
      drawCellText(doc, x, yTop, cols[2].w, rowH, periodoLines, "left", { fontSize:8.0 }); x += cols[2].w;
      drawCellText(doc, x, yTop, cols[3].w, rowH, actaEstado(acta), "left", { fontSize:8.0 }); x += cols[3].w;
      drawCellText(doc, x, yTop, cols[4].w, rowH, String(getActaLines(acta).length), "right", { fontSize:8.0 }); x += cols[4].w;
      drawCellText(doc, x, yTop, cols[5].w, rowH, moneyCOP0(actaTotal(acta)), "right", { bold:true, fontSize:8.0 });

      hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      L.setY(yTop + rowH + 2);
    }

    header();

    if(!actas.length){
      L.p("No hay actas parciales registradas.");
    }else{
      for(const acta of actas){
        row(acta);
      }
    }

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"RESUMEN DE ACTAS PARCIALES",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });

    const filename = buildFilenameResumenActas(project);
    return await finalizePDF(doc, filename, opts);
  }

  async function exportEjecutadoVsPresupuestoPDF(project, opts){
    const doc = newDoc({ orientation:"landscape" });
    const L = mkLayout(doc);

    const resumen = calcActasResumen(project);
    const rows = resumen.rowsVsPres || [];

    drawInstitutionalCover(doc, L, project, "EJECUTADO ACUMULADO VS PRESUPUESTO");

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "RESUMEN GENERAL", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    L.row("VALOR TOTAL PRESUPUESTO:", moneyCOP0(resumen.totalPresupuesto || 0));
    L.row("VALOR TOTAL EJECUTADO:", moneyCOP0(resumen.totalEjecutado || 0));
    L.row("VALOR TOTAL ACTAS:", moneyCOP0(resumen.totalActas || 0));

    L.p(" ");
    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "CONTROL DE EJECUCIÓN POR ÍTEM", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    const margin = L.margin;
    const contentW = L.contentW;

    let cols = [
      { k:"cap",  label:"CAP", w:42, align:"left" },
      { k:"code", label:"ITEM", w:52, align:"left" },
      { k:"desc", label:"DESCRIPCIÓN", w:220, align:"left" },
      { k:"unit", label:"UNID", w:34, align:"center" },
      { k:"qpre", label:"CANT PRES", w:56, align:"right" },
      { k:"qej",  label:"EJEC ACUM", w:56, align:"right" },
      { k:"saldo",label:"SALDO", w:56, align:"right" },
      { k:"pu",   label:"VR UNIT", w:70, align:"right" },
      { k:"vpre", label:"VR PRES", w:85, align:"right" },
      { k:"vej",  label:"VR EJEC", w:85, align:"right" }
    ];
    cols = fitColsToWidth(cols, contentW, 22);

    function header(){
      const yTop = L.getY();
      const h = 18;
      L.ensure(h + 8);

      let x = margin;
      doc.setFont("helvetica","bold");
      doc.setFontSize(7.4);

      for(const c of cols){
        drawCellText(doc, x, yTop, c.w, h, c.label, "center", { bold:true, fontSize:7.4 });
        x += c.w;
      }

      hLine(doc, margin, margin+contentW, yTop + h, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
      L.setY(yTop + h + 6);
    }

    function chapterBand(txt){
      ensureWithHeader(L, 22, header);
      const yTop = L.getY();
      doc.setFont("helvetica","bold");
      doc.setFontSize(8.8);
      doc.text(String(txt||""), margin, yTop + 10);
      hLine(doc, margin, margin+contentW, yTop + 16, PDF_THEME.lines.band.w, PDF_THEME.lines.band.c);
      L.setY(yTop + 20);
    }

    function row(r){
      const descLines = splitToLines(doc, safe(r.desc || ""), cols[2].w - 6, 2);
      const rowH = Math.max(18, 8 + descLines.length * 9);

      ensureWithHeader(L, rowH + 10, header);

      const yTop = L.getY();
      let x = margin;

      drawCellText(doc, x, yTop, cols[0].w, rowH, safe(r.chapterCode || ""), "left", { fontSize:7.4 }); x += cols[0].w;
      drawCellText(doc, x, yTop, cols[1].w, rowH, safe(r.code || ""), "left", { bold:true, fontSize:7.4 }); x += cols[1].w;
      drawCellText(doc, x, yTop, cols[2].w, rowH, descLines, "left", { fontSize:7.4 }); x += cols[2].w;
      drawCellText(doc, x, yTop, cols[3].w, rowH, safe(r.unit || ""), "center", { fontSize:7.4 }); x += cols[3].w;
      drawCellText(doc, x, yTop, cols[4].w, rowH, fmtQty(r.qtyPresupuesto || 0), "right", { fontSize:7.4 }); x += cols[4].w;
      drawCellText(doc, x, yTop, cols[5].w, rowH, fmtQty(r.qtyEjecutada || 0), "right", { fontSize:7.4 }); x += cols[5].w;
      drawCellText(doc, x, yTop, cols[6].w, rowH, fmtQty(r.saldo || 0), "right", { fontSize:7.4 }); x += cols[6].w;
      drawCellText(doc, x, yTop, cols[7].w, rowH, moneyCOP0(r.pu || 0), "right", { fontSize:7.4 }); x += cols[7].w;
      drawCellText(doc, x, yTop, cols[8].w, rowH, moneyCOP0(r.vrPresupuesto || 0), "right", { fontSize:7.4 }); x += cols[8].w;
      drawCellText(doc, x, yTop, cols[9].w, rowH, moneyCOP0(r.vrEjecutado || 0), "right", { bold:true, fontSize:7.4 });

      hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      L.setY(yTop + rowH + 2);
    }

    header();

    if(!rows.length){
      L.p("No hay información de presupuesto y actas para comparar.");
    }else{
      let currentChap = null;
      for(const r of rows){
        const chap = safe(r.chapterCode || "SIN");
        if(chap !== currentChap){
          currentChap = chap;
          chapterBand(`CAPÍTULO ${chap} — ${safe(r.chapterName || "")}`);
          header();
        }
        row(r);
      }
    }

    ensureWithHeader(L, 40, header);
    const yT = L.getY();
    doc.setFont("helvetica","bold"); doc.setFontSize(9.2);
    doc.text("TOTALES", margin, yT + 12);
    doc.text(moneyCOP0(resumen.totalPresupuesto || 0), margin + contentW - 95, yT + 12, { align:"right" });
    doc.text(moneyCOP0(resumen.totalEjecutado || 0), margin + contentW - 8, yT + 12, { align:"right" });
    hLine(doc, margin, margin+contentW, yT + 18, PDF_THEME.lines.band.w, PDF_THEME.lines.band.c);
    L.setY(yT + 26);
    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"EJECUTADO ACUMULADO VS PRESUPUESTO",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });

    const filename = buildFilenameEjecutadoVsPresupuesto(project);
    return await finalizePDF(doc, filename, opts);
  }

  /* =========================================================
     PDFs COMPLEMENTARIOS
     ========================================================= */

  async function exportPresupuestoObraDesagregadoPDF(project, opts){
    const doc = newDoc({ orientation:"landscape" });
    const L = mkLayout(doc);

    const items = Array.isArray(Calc.groupByChapters(project)?.items)
      ? Calc.groupByChapters(project).items
      : [];

    const desg = await calcDesagregadoByItemFromAPU(project, items);

    drawInstitutionalCover(doc, L, project, "PRESUPUESTO DE OBRA DESAGREGADO");

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "DETALLE DESAGREGADO POR ÍTEM", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    const margin = L.margin;
    const contentW = L.contentW;

    let cols = [
      { k:"cap",  label:"CAP", w:36 },
      { k:"item", label:"ITEM", w:52 },
      { k:"desc", label:"DESCRIPCIÓN", w:170 },
      { k:"mat",  label:"MATERIALES", w:76 },
      { k:"eq",   label:"EQUIPO", w:72 },
      { k:"mo",   label:"MANO OBRA", w:74 },
      { k:"sub",  label:"SUBCONT.", w:72 },
      { k:"tra",  label:"TRANSP.", w:66 },
      { k:"otr",  label:"OTROS", w:60 },
      { k:"tot",  label:"VR PARCIAL", w:84 }
    ];
    cols = fitColsToWidth(cols, contentW, 22);

    function header(){
      const yTop = L.getY();
      const h = 18;
      L.ensure(h + 8);

      let x = margin;
      doc.setFont("helvetica","bold");
      doc.setFontSize(7.2);

      for(const c of cols){
        drawCellText(doc, x, yTop, c.w, h, c.label, "center", { bold:true, fontSize:7.2 });
        x += c.w;
      }

      hLine(doc, margin, margin+contentW, yTop + h, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
      L.setY(yTop + h + 6);
    }

    function row(r){
      const descLines = splitToLines(doc, safe(r.desc), cols[2].w - 6, 2);
      const rowH = Math.max(18, 8 + descLines.length * 9);

      ensureWithHeader(L, rowH + 10, header);

      const yTop = L.getY();
      let x = margin;

      drawCellText(doc, x, yTop, cols[0].w, rowH, safe(r.chapterCode), "left", { fontSize:7.2 }); x += cols[0].w;
      drawCellText(doc, x, yTop, cols[1].w, rowH, safe(r.code), "left", { bold:true, fontSize:7.2 }); x += cols[1].w;
      drawCellText(doc, x, yTop, cols[2].w, rowH, descLines, "left", { fontSize:7.2 }); x += cols[2].w;
      drawCellText(doc, x, yTop, cols[3].w, rowH, moneyCOP0(r.MATERIALES||0), "right", { fontSize:7.2 }); x += cols[3].w;
      drawCellText(doc, x, yTop, cols[4].w, rowH, moneyCOP0(r["EQUIPO Y HERRAM"]||0), "right", { fontSize:7.2 }); x += cols[4].w;
      drawCellText(doc, x, yTop, cols[5].w, rowH, moneyCOP0(r["MANO DE OBRA"]||0), "right", { fontSize:7.2 }); x += cols[5].w;
      drawCellText(doc, x, yTop, cols[6].w, rowH, moneyCOP0(r.SUBCONTRATOS||0), "right", { fontSize:7.2 }); x += cols[6].w;
      drawCellText(doc, x, yTop, cols[7].w, rowH, moneyCOP0(r.TRANSPORTES||0), "right", { fontSize:7.2 }); x += cols[7].w;
      drawCellText(doc, x, yTop, cols[8].w, rowH, moneyCOP0(r.OTROS||0), "right", { fontSize:7.2 }); x += cols[8].w;
      drawCellText(doc, x, yTop, cols[9].w, rowH, moneyCOP0(r.VR_PARCIAL||0), "right", { bold:true, fontSize:7.2 });

      hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      L.setY(yTop + rowH + 2);
    }

    header();

    if(!desg.rows.length){
      L.p("No hay ítems para desagregar.");
    }else{
      let currentChap = null;
      for(const r of desg.rows){
        if(r.chapterCode !== currentChap){
          currentChap = r.chapterCode;
          const bandY = L.getY();
          drawBand(doc, margin, bandY, contentW, 18, `CAPÍTULO ${safe(r.chapterCode)} — ${safe(r.chapterName)}`, { fontSize:8.8, bold:true });
          L.setY(bandY + 22);
          header();
        }
        row(r);
      }
    }

    L.p(" ");
    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "TOTALES COSTOS DIRECTOS", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    L.row("MATERIALES:", moneyCOP0(desg.totals.MATERIALES||0));
    L.row("EQUIPO Y HERRAMIENTA:", moneyCOP0(desg.totals["EQUIPO Y HERRAM"]||0));
    L.row("MANO DE OBRA:", moneyCOP0(desg.totals["MANO DE OBRA"]||0));
    L.row("SUBCONTRATOS:", moneyCOP0(desg.totals.SUBCONTRATOS||0));
    L.row("TRANSPORTES:", moneyCOP0(desg.totals.TRANSPORTES||0));
    L.row("OTROS:", moneyCOP0(desg.totals.OTROS||0));
    L.row("TOTAL COSTO DIRECTO:", moneyCOP0(desg.totalDirecto||0));

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"PRESUPUESTO DE OBRA DESAGREGADO",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });

    return await finalizePDF(doc, buildFilenameDesagregado(project), opts);
  }

  async function exportResumenPresupuestoObraDesagregadoPDF(project, opts){
    const doc = newDoc();
    const L = mkLayout(doc);

    const items = Array.isArray(Calc.groupByChapters(project)?.items)
      ? Calc.groupByChapters(project).items
      : [];

    const desg = await calcDesagregadoByItemFromAPU(project, items);

    drawInstitutionalCover(doc, L, project, "RESUMEN PRESUPUESTO DE OBRA DESAGREGADO");

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "RESUMEN GENERAL DE COSTOS DIRECTOS", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    L.row("MATERIALES:", moneyCOP0(desg.totals.MATERIALES||0));
    L.row("EQUIPO Y HERRAMIENTA:", moneyCOP0(desg.totals["EQUIPO Y HERRAM"]||0));
    L.row("MANO DE OBRA:", moneyCOP0(desg.totals["MANO DE OBRA"]||0));
    L.row("SUBCONTRATOS:", moneyCOP0(desg.totals.SUBCONTRATOS||0));
    L.row("TRANSPORTES:", moneyCOP0(desg.totals.TRANSPORTES||0));
    L.row("OTROS:", moneyCOP0(desg.totals.OTROS||0));
    L.row("TOTAL COSTO DIRECTO:", moneyCOP0(desg.totalDirecto||0));

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"RESUMEN PRESUPUESTO DE OBRA DESAGREGADO",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });

    return await finalizePDF(doc, buildFilenameResumenDesagregado(project), opts);
  }

  async function exportDistribucionPorcentualCostosDirectosPDF(project, opts){
    const doc = newDoc();
    const L = mkLayout(doc);

    const items = Array.isArray(Calc.groupByChapters(project)?.items)
      ? Calc.groupByChapters(project).items
      : [];

    const desg = await calcDesagregadoByItemFromAPU(project, items);
    const total = Number(desg.totalDirecto || 0);

    function pctVal(v){
      return total > 0 ? ((Number(v||0) / total) * 100) : 0;
    }

    drawInstitutionalCover(doc, L, project, "DISTRIBUCIÓN PORCENTUAL DE COSTOS DIRECTOS");

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "DISTRIBUCIÓN PORCENTUAL", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    L.row("MATERIALES:", `${fmt2(pctVal(desg.totals.MATERIALES))}%`);
    L.row("EQUIPO Y HERRAMIENTA:", `${fmt2(pctVal(desg.totals["EQUIPO Y HERRAM"]))}%`);
    L.row("MANO DE OBRA:", `${fmt2(pctVal(desg.totals["MANO DE OBRA"]))}%`);
    L.row("SUBCONTRATOS:", `${fmt2(pctVal(desg.totals.SUBCONTRATOS))}%`);
    L.row("TRANSPORTES:", `${fmt2(pctVal(desg.totals.TRANSPORTES))}%`);
    L.row("OTROS:", `${fmt2(pctVal(desg.totals.OTROS))}%`);
    L.row("TOTAL:", "100.00%");

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"DISTRIBUCIÓN PORCENTUAL DE COSTOS DIRECTOS",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });

    return await finalizePDF(doc, buildFilenameDistribucionPctDirectos(project), opts);
  }

  async function exportRendimientoEquipoYManoDeObraPorActividadPDF(project, opts){
    const doc = newDoc({ orientation:"landscape" });
    const L = mkLayout(doc);

    const items = Array.isArray(Calc.groupByChapters(project)?.items)
      ? Calc.groupByChapters(project).items
      : [];

    drawInstitutionalCover(doc, L, project, "RENDIMIENTO DE EQUIPO Y MANO DE OBRA POR ACTIVIDAD");

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "DETALLE POR ACTIVIDAD", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    const margin = L.margin;
    const contentW = L.contentW;

    let cols = [
      { k:"cap",  label:"CAP", w:36 },
      { k:"item", label:"ITEM", w:52 },
      { k:"desc", label:"DESCRIPCIÓN", w:200 },
      { k:"grupo",label:"GRUPO", w:90 },
      { k:"recurso",label:"RECURSO", w:170 },
      { k:"unit", label:"UNID", w:40 },
      { k:"qty",  label:"CANT/RDTO", w:70 },
      { k:"pu",   label:"VR UNIT", w:76 }
    ];
    cols = fitColsToWidth(cols, contentW, 22);

    function header(){
      const yTop = L.getY();
      const h = 18;
      L.ensure(h + 8);

      let x = margin;
      doc.setFont("helvetica","bold");
      doc.setFontSize(7.2);

      for(const c of cols){
        drawCellText(doc, x, yTop, c.w, h, c.label, "center", { bold:true, fontSize:7.2 });
        x += c.w;
      }

      hLine(doc, margin, margin+contentW, yTop + h, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
      L.setY(yTop + h + 6);
    }

    function row(baseItem, ln){
      const d1 = splitToLines(doc, safe(baseItem.desc), cols[2].w - 6, 2);
      const d2 = splitToLines(doc, safe(ln.desc), cols[4].w - 6, 2);
      const rowH = Math.max(18, 8 + Math.max(d1.length, d2.length) * 9);

      ensureWithHeader(L, rowH + 10, header);

      const yTop = L.getY();
      let x = margin;

      drawCellText(doc, x, yTop, cols[0].w, rowH, safe(baseItem.chapterCode), "left", { fontSize:7.2 }); x += cols[0].w;
      drawCellText(doc, x, yTop, cols[1].w, rowH, safe(baseItem.code), "left", { bold:true, fontSize:7.2 }); x += cols[1].w;
      drawCellText(doc, x, yTop, cols[2].w, rowH, d1, "left", { fontSize:7.2 }); x += cols[2].w;
      drawCellText(doc, x, yTop, cols[3].w, rowH, normalizeGroup(ln.group || ln.tipo || ""), "left", { fontSize:7.2 }); x += cols[3].w;
      drawCellText(doc, x, yTop, cols[4].w, rowH, d2, "left", { fontSize:7.2 }); x += cols[4].w;
      drawCellText(doc, x, yTop, cols[5].w, rowH, safe(ln.unit), "center", { fontSize:7.2 }); x += cols[5].w;
      drawCellText(doc, x, yTop, cols[6].w, rowH, fmtQty(Number(ln.qty||0)), "right", { fontSize:7.2 }); x += cols[6].w;
      drawCellText(doc, x, yTop, cols[7].w, rowH, moneyCOP0(Number(ln.pu||0)), "right", { fontSize:7.2 });

      hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      L.setY(yTop + rowH + 2);
    }

    header();

    for(const it of items){
      const apuObj = await getAPUForProjectItem(project, it);
      const lines = (apuObj && Array.isArray(apuObj.lines)) ? apuObj.lines : [];
      const filtered = lines.filter(ln=>{
        const g = normalizeGroup(ln.group || ln.tipo || "");
        return g === "MANO DE OBRA" || g === "EQUIPO / HERRAMIENTA / MAQUINARIA";
      });

      if(!filtered.length) continue;
      for(const ln of filtered){
        row(it, ln);
      }
    }

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"RENDIMIENTO DE EQUIPO Y MANO DE OBRA POR ACTIVIDAD",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });

    return await finalizePDF(doc, buildFilenameRendimientos(project), opts);
  }

  async function exportResumenMaterialesPorActividadPDF(project, opts){
    const doc = newDoc({ orientation:"landscape" });
    const L = mkLayout(doc);

    const items = Array.isArray(Calc.groupByChapters(project)?.items)
      ? Calc.groupByChapters(project).items
      : [];

    drawInstitutionalCover(doc, L, project, "RESUMEN MATERIALES POR ACTIVIDAD");

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "MATERIALES POR ACTIVIDAD", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    const margin = L.margin;
    const contentW = L.contentW;

    let cols = [
      { k:"cap",  label:"CAP", w:36 },
      { k:"item", label:"ITEM", w:54 },
      { k:"desc", label:"DESCRIPCIÓN ACTIVIDAD", w:180 },
      { k:"mat",  label:"MATERIAL", w:220 },
      { k:"unit", label:"UNID", w:42 },
      { k:"qty",  label:"CANT", w:70 },
      { k:"pu",   label:"VR UNIT", w:76 },
      { k:"parc", label:"VR PARCIAL", w:90 }
    ];
    cols = fitColsToWidth(cols, contentW, 22);

    function header(){
      const yTop = L.getY();
      const h = 18;
      L.ensure(h + 8);

      let x = margin;
      doc.setFont("helvetica","bold");
      doc.setFontSize(7.2);

      for(const c of cols){
        drawCellText(doc, x, yTop, c.w, h, c.label, "center", { bold:true, fontSize:7.2 });
        x += c.w;
      }

      hLine(doc, margin, margin+contentW, yTop + h, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
      L.setY(yTop + h + 6);
    }

    function row(baseItem, ln){
      const parcial = Number(ln.parcial||0) || (Number(ln.qty||0) * Number(ln.pu||0));
      const d1 = splitToLines(doc, safe(baseItem.desc), cols[2].w - 6, 2);
      const d2 = splitToLines(doc, safe(ln.desc), cols[3].w - 6, 2);
      const rowH = Math.max(18, 8 + Math.max(d1.length, d2.length) * 9);

      ensureWithHeader(L, rowH + 10, header);

      const yTop = L.getY();
      let x = margin;

      drawCellText(doc, x, yTop, cols[0].w, rowH, safe(baseItem.chapterCode), "left", { fontSize:7.2 }); x += cols[0].w;
      drawCellText(doc, x, yTop, cols[1].w, rowH, safe(baseItem.code), "left", { bold:true, fontSize:7.2 }); x += cols[1].w;
      drawCellText(doc, x, yTop, cols[2].w, rowH, d1, "left", { fontSize:7.2 }); x += cols[2].w;
      drawCellText(doc, x, yTop, cols[3].w, rowH, d2, "left", { fontSize:7.2 }); x += cols[3].w;
      drawCellText(doc, x, yTop, cols[4].w, rowH, safe(ln.unit), "center", { fontSize:7.2 }); x += cols[4].w;
      drawCellText(doc, x, yTop, cols[5].w, rowH, fmtQty(Number(ln.qty||0)), "right", { fontSize:7.2 }); x += cols[5].w;
      drawCellText(doc, x, yTop, cols[6].w, rowH, moneyCOP0(Number(ln.pu||0)), "right", { fontSize:7.2 }); x += cols[6].w;
      drawCellText(doc, x, yTop, cols[7].w, rowH, moneyCOP2(parcial), "right", { bold:true, fontSize:7.2 });

      hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      L.setY(yTop + rowH + 2);
    }

    header();

    for(const it of items){
      const apuObj = await getAPUForProjectItem(project, it);
      const lines = (apuObj && Array.isArray(apuObj.lines)) ? apuObj.lines : [];
      const filtered = lines.filter(ln => normalizeGroup(ln.group || ln.tipo || "") === "MATERIALES");

      if(!filtered.length) continue;
      for(const ln of filtered){
        row(it, ln);
      }
    }

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"RESUMEN MATERIALES POR ACTIVIDAD",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });

    return await finalizePDF(doc, buildFilenameResumenMaterialesActividad(project), opts);
  }

  async function exportCantidadRecursosEInsumosPresupuestoPDF(project, opts){
    const doc = newDoc({ orientation:"landscape" });
    const L = mkLayout(doc);

    const items = Array.isArray(Calc.groupByChapters(project)?.items)
      ? Calc.groupByChapters(project).items
      : [];

    const rows = [];

    for(const it of items){
      const apuObj = await getAPUForProjectItem(project, it);
      const lines = (apuObj && Array.isArray(apuObj.lines)) ? apuObj.lines : [];

      for(const ln of lines){
        const qtyLinea = Number(ln.qty || 0);
        const qtyItem = Number(it.qty || 0);
        rows.push({
          chapterCode: safe(it.chapterCode),
          code: safe(it.code),
          actividad: safe(it.desc),
          grupo: normalizeGroup(ln.group || ln.tipo || ""),
          recurso: safe(ln.desc),
          unit: safe(ln.unit),
          qtyUnit: qtyLinea,
          qtyTotal: qtyLinea * qtyItem
        });
      }
    }

    drawInstitutionalCover(doc, L, project, "CANTIDAD DE RECURSOS E INSUMOS DEL PRESUPUESTO");

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "CANTIDADES TOTALES", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    const margin = L.margin;
    const contentW = L.contentW;

    let cols = [
      { k:"cap",  label:"CAP", w:34 },
      { k:"item", label:"ITEM", w:48 },
      { k:"act",  label:"ACTIVIDAD", w:170 },
      { k:"grp",  label:"GRUPO", w:90 },
      { k:"rec",  label:"RECURSO / INSUMO", w:190 },
      { k:"unit", label:"UNID", w:40 },
      { k:"qu",   label:"CANT x ITEM", w:74 },
      { k:"qt",   label:"CANT TOTAL", w:80 }
    ];
    cols = fitColsToWidth(cols, contentW, 22);

    function header(){
      const yTop = L.getY();
      const h = 18;
      L.ensure(h + 8);

      let x = margin;
      doc.setFont("helvetica","bold");
      doc.setFontSize(7.2);

      for(const c of cols){
        drawCellText(doc, x, yTop, c.w, h, c.label, "center", { bold:true, fontSize:7.2 });
        x += c.w;
      }

      hLine(doc, margin, margin+contentW, yTop + h, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
      L.setY(yTop + h + 6);
    }

    function row(r){
      const d1 = splitToLines(doc, safe(r.actividad), cols[2].w - 6, 2);
      const d2 = splitToLines(doc, safe(r.recurso), cols[4].w - 6, 2);
      const rowH = Math.max(18, 8 + Math.max(d1.length, d2.length) * 9);

      ensureWithHeader(L, rowH + 10, header);

      const yTop = L.getY();
      let x = margin;

      drawCellText(doc, x, yTop, cols[0].w, rowH, safe(r.chapterCode), "left", { fontSize:7.2 }); x += cols[0].w;
      drawCellText(doc, x, yTop, cols[1].w, rowH, safe(r.code), "left", { bold:true, fontSize:7.2 }); x += cols[1].w;
      drawCellText(doc, x, yTop, cols[2].w, rowH, d1, "left", { fontSize:7.2 }); x += cols[2].w;
      drawCellText(doc, x, yTop, cols[3].w, rowH, safe(r.grupo), "left", { fontSize:7.2 }); x += cols[3].w;
      drawCellText(doc, x, yTop, cols[4].w, rowH, d2, "left", { fontSize:7.2 }); x += cols[4].w;
      drawCellText(doc, x, yTop, cols[5].w, rowH, safe(r.unit), "center", { fontSize:7.2 }); x += cols[5].w;
      drawCellText(doc, x, yTop, cols[6].w, rowH, fmtQty(r.qtyUnit), "right", { fontSize:7.2 }); x += cols[6].w;
      drawCellText(doc, x, yTop, cols[7].w, rowH, fmtQty(r.qtyTotal), "right", { bold:true, fontSize:7.2 });

      hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      L.setY(yTop + rowH + 2);
    }

    header();

    if(!rows.length){
      L.p("No se encontraron recursos e insumos.");
    }else{
      for(const r of rows){
        row(r);
      }
    }

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"CANTIDAD DE RECURSOS E INSUMOS DEL PRESUPUESTO",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });

    return await finalizePDF(doc, buildFilenameCantRecursosInsumos(project), opts);
  }

  async function exportIvaProyectoPDF(project, opts){
    const doc = newDoc();
    const L = mkLayout(doc);

    const items = Array.isArray(Calc.groupByChapters(project)?.items)
      ? Calc.groupByChapters(project).items
      : [];

    const desg = await calcDesagregadoByItemFromAPU(project, items);
    const ivaPct = pct(project, "ivaUtilPct", "ivaPct");

    const bases = {
      MATERIALES: Number(desg.totals.MATERIALES || 0),
      "EQUIPO Y HERRAM": Number(desg.totals["EQUIPO Y HERRAM"] || 0),
      "MANO DE OBRA": Number(desg.totals["MANO DE OBRA"] || 0),
      SUBCONTRATOS: Number(desg.totals.SUBCONTRATOS || 0),
      TRANSPORTES: Number(desg.totals.TRANSPORTES || 0),
      OTROS: Number(desg.totals.OTROS || 0)
    };

    const ivaRows = [
      { cat:"MATERIALES", base:bases.MATERIALES, tarifa:ivaPct, iva:bases.MATERIALES * (ivaPct/100) },
      { cat:"EQUIPO Y HERRAMIENTA", base:bases["EQUIPO Y HERRAM"], tarifa:ivaPct, iva:bases["EQUIPO Y HERRAM"] * (ivaPct/100) },
      { cat:"MANO DE OBRA", base:bases["MANO DE OBRA"], tarifa:0, iva:0 },
      { cat:"SUBCONTRATOS", base:bases.SUBCONTRATOS, tarifa:ivaPct, iva:bases.SUBCONTRATOS * (ivaPct/100) },
      { cat:"TRANSPORTES", base:bases.TRANSPORTES, tarifa:0, iva:0 },
      { cat:"OTROS", base:bases.OTROS, tarifa:ivaPct, iva:bases.OTROS * (ivaPct/100) }
    ];

    const totalBase = ivaRows.reduce((s,r)=> s + Number(r.base||0), 0);
    const totalIva = ivaRows.reduce((s,r)=> s + Number(r.iva||0), 0);

    drawInstitutionalCover(doc, L, project, "IVA PROYECTO");

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    drawBand(doc, L.margin, L.getY(), L.contentW, 18, "LIQUIDACIÓN DE IVA POR CATEGORÍA", { fontSize:10, bold:true });
    L.setY(L.getY()+24);

    const margin = L.margin;
    const contentW = L.contentW;

    let cols = [
      { k:"cat", label:"CATEGORÍA", w:220 },
      { k:"base", label:"BASE", w:120 },
      { k:"tar", label:"TARIFA IVA", w:90 },
      { k:"iva", label:"IVA", w:120 }
    ];
    cols = fitColsToWidth(cols, contentW, 24);

    function header(){
      const yTop = L.getY();
      const h = 18;
      L.ensure(h + 8);

      let x = margin;
      doc.setFont("helvetica","bold");
      doc.setFontSize(8.0);

      for(const c of cols){
        drawCellText(doc, x, yTop, c.w, h, c.label, "center", { bold:true, fontSize:8.0 });
        x += c.w;
      }

      hLine(doc, margin, margin+contentW, yTop + h, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
      L.setY(yTop + h + 6);
    }

    function row(r){
      const rowH = 18;
      ensureWithHeader(L, rowH + 10, header);

      const yTop = L.getY();
      let x = margin;

      drawCellText(doc, x, yTop, cols[0].w, rowH, r.cat, "left", { fontSize:8.0 }); x += cols[0].w;
      drawCellText(doc, x, yTop, cols[1].w, rowH, moneyCOP0(r.base||0), "right", { fontSize:8.0 }); x += cols[1].w;
      drawCellText(doc, x, yTop, cols[2].w, rowH, `${fmt2(r.tarifa||0)}%`, "right", { fontSize:8.0 }); x += cols[2].w;
      drawCellText(doc, x, yTop, cols[3].w, rowH, moneyCOP0(r.iva||0), "right", { bold:true, fontSize:8.0 });

      hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      L.setY(yTop + rowH + 2);
    }

    header();
    ivaRows.forEach(row);

    L.p(" ");
    L.row("TOTAL BASE:", moneyCOP0(totalBase));
    L.row("TOTAL IVA:", moneyCOP0(totalIva));

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"IVA PROYECTO",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });

    return await finalizePDF(doc, buildFilenameIvaProyecto(project), opts);
  }

  async function exportRendimientoEquipoManoObraActividadPDF(project, opts){
    return await exportRendimientoEquipoYManoDeObraPorActividadPDF(project, opts);
  }

  async function exportCantidadRecursosInsumosPresupuestoPDF(project, opts){
    return await exportCantidadRecursosEInsumosPresupuestoPDF(project, opts);
  }

  installPersistHooksOnce();

  window.PDF = {
    exportPresupuestoPDF,
    exportPresupuestoConAPUsPDF,
    exportEspecificacionesTecnicasPDF,

    exportPresupuestoObraDesagregadoPDF,
    exportResumenPresupuestoObraDesagregadoPDF,
    exportDistribucionPorcentualCostosDirectosPDF,
    exportRendimientoEquipoYManoDeObraPorActividadPDF,
    exportResumenMaterialesPorActividadPDF,
    exportCantidadRecursosEInsumosPresupuestoPDF,
    exportIvaProyectoPDF,

    exportActaParcialPDF,
    exportResumenActasParcialesPDF,
    exportEjecutadoVsPresupuestoPDF,

    exportRendimientoEquipoManoObraActividadPDF,
    exportCantidadRecursosInsumosPresupuestoPDF
  };
})();