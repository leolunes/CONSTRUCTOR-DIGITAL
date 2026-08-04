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

    function looksLikeSameAPU(expectedDesc, expectedUnit, apuSubtitle, apuUnit){
      const ed = String(expectedDesc||"").trim();
      if(!ed) return true;
      const au = String(apuUnit||"").trim().toLowerCase();
      const eu = String(expectedUnit||"").trim().toLowerCase();
      if(eu && au && eu !== au) {}

      const a = tokenSet(ed);
      const b = tokenSet(String(apuSubtitle||"").trim() || "");
      const sim = jaccard(a,b);

      if(sim < 0.30){
        return false;
      }
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

            if(!looksLikeSameAPU(it?.desc, it?.unit, ov.desc || it?.desc, ov.unit || it?.unit)){
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

          if(!looksLikeSameAPU(it?.desc, it?.unit, custom.desc || it?.desc, custom.unit || it?.unit)){
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

      if(!looksLikeSameAPU(it?.desc, it?.unit, base.subtitle || it?.desc, base.unit || it?.unit)){
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
      sessionStorage.setItem("presupuesto_pro_last_pdf_name", String(filename || ""));
      sessionStorage.setItem("presupuesto_pro_last_pdf_ts", String(Date.now()));
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

  async function exportPresupuestoObraDesagregadoPDF(project, opts){
    const doc = newDoc({ orientation: "landscape" });
    const L = mkLayout(doc);
    const { items } = Calc.groupByChapters(project);

    drawInstitutionalCover(doc, L, project, "PRESUPUESTO DE OBRA DESAGREGADO");

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    doc.setFont("helvetica","bold"); doc.setFontSize(11);
    doc.text("DATOS GENERALES", L.margin, L.getY());
    L.setY(L.getY()+14);

    doc.setFont("helvetica","normal"); doc.setFontSize(10);
    L.p(`Proyecto: ${project.name || "—"}`);
    L.p(`Entidad: ${project.entity || "—"}`);
    L.p(`Ubicación: ${project.location || "—"}`);
    L.p(`Fecha generación: ${new Date().toLocaleString()}`);
    L.p(" ");

    const agg = await calcDesagregadoByItemFromAPU(project, items || []);
    const rows = agg.rows || [];
    const totalDirecto = Number(agg.totalDirecto||0);

    const margin = L.margin;
    const contentW = L.contentW;

    let cols = [
      { key:"code", label:"ITEM",        w:56,  align:"left"   },
      { key:"desc", label:"DESCRIPCIÓN", w:260, align:"left"   },
      { key:"unit", label:"UNID",        w:34,  align:"center" },
      { key:"qty",  label:"CANT",        w:54,  align:"right"  },
      { key:"mat",  label:"MAT",         w:64,  align:"right"  },
      { key:"eq",   label:"EQ/H",        w:64,  align:"right"  },
      { key:"mo",   label:"M.O.",        w:64,  align:"right"  },
      { key:"sub",  label:"SUBC",        w:64,  align:"right"  },
      { key:"tra",  label:"TRANS",       w:64,  align:"right"  },
      { key:"otr",  label:"OTR",         w:58,  align:"right"  },
      { key:"parc", label:"VR PARC",     w:92,  align:"right"  }
    ];
    cols = fitColsToWidth(cols, contentW, 26);

    function tableHeader(){
      const yTop = L.getY();
      const h = 18;
      L.ensure(h + 8);

      let x = margin;
      doc.setFont("helvetica","bold");
      doc.setFontSize(7.2);

      for(const c of cols){
        drawCellText(doc, x, yTop, c.w, h, c.label, "center", { bold:true, fontSize:7.2, pad:2 });
        x += c.w;
      }

      hLine(doc, margin, margin+contentW, yTop + h, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
      L.setY(yTop + h + 6);
    }

    function chapterBand(txt){
      ensureWithHeader(L, 22, tableHeader);
      const yTop = L.getY();
      doc.setFont("helvetica","bold");
      doc.setFontSize(9.2);
      doc.text(String(txt||""), margin, yTop + 10);
      hLine(doc, margin, margin+contentW, yTop + 16, PDF_THEME.lines.band.w, PDF_THEME.lines.band.c);
      L.setY(yTop + 20);
    }

    function dataRow(r){
      doc.setFont("helvetica","normal");
      doc.setFontSize(7.2);

      const descLines = splitToLines(doc, r.desc, cols[1].w - 6, 2);
      const lineH = 9.2;
      const rowH = Math.max(16, 6 + (descLines.length * lineH));

      ensureWithHeader(L, rowH + 10, tableHeader);

      const yTop = L.getY();
      let x = margin;

      drawCellText(doc, x, yTop, cols[0].w, rowH, r.code, "left", { bold:true, fontSize:7.2 }); x += cols[0].w;
      drawCellText(doc, x, yTop, cols[1].w, rowH, descLines, "left", { fontSize:7.2 }); x += cols[1].w;
      drawCellText(doc, x, yTop, cols[2].w, rowH, r.unit, "center", { fontSize:7.2 }); x += cols[2].w;
      drawCellText(doc, x, yTop, cols[3].w, rowH, fmtQty(r.qtyItem), "right", { fontSize:7.2 }); x += cols[3].w;

      function numCell(val, w){
        const s = moneyCOP0(val);
        doc.setFont("helvetica","normal");
        const fs = fitTextRight(doc, s, w-4, 7.2, 6.4);
        drawCellText(doc, x, yTop, w, rowH, s, "right", { fontSize:fs });
        x += w;
      }

      numCell(r.MATERIALES, cols[4].w);
      numCell(r["EQUIPO Y HERRAM"], cols[5].w);
      numCell(r["MANO DE OBRA"], cols[6].w);
      numCell(r.SUBCONTRATOS, cols[7].w);
      numCell(r.TRANSPORTES, cols[8].w);
      numCell(r.OTROS, cols[9].w);

      {
        const s = moneyCOP0(r.VR_PARCIAL);
        doc.setFont("helvetica","bold");
        const fs = fitTextRight(doc, s, cols[10].w-4, 7.2, 6.4);
        drawCellText(doc, x, yTop, cols[10].w, rowH, s, "right", { bold:true, fontSize:fs });
      }

      hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      L.setY(yTop + rowH + 2);
    }

    tableHeader();

    if(!rows.length){
      L.p("Sin ítems.");
    }else{
      let currentChap = null;
      for(const r of rows){
        const chap = r.chapterCode || "SIN";
        if(chap !== currentChap){
          currentChap = chap;
          chapterBand(`CAPÍTULO ${chap} — ${safe(r.chapterName||"")}`);
          tableHeader();
        }
        dataRow(r);
      }
    }

    ensureWithHeader(L, 50, tableHeader);
    const yT = L.getY() + 6;
    doc.setFont("helvetica","bold"); doc.setFontSize(9.4);
    doc.text("TOTAL COSTOS DIRECTOS", margin, yT + 12);
    doc.setFont("helvetica","bold"); doc.setFontSize(9.6);
    doc.text(moneyCOP0(totalDirecto), margin + contentW - 8, yT + 12, { align:"right" });
    hLine(doc, margin, margin+contentW, yT + 18, PDF_THEME.lines.band.w, PDF_THEME.lines.band.c);
    L.setY(yT + 26);

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"PRESUPUESTO DE OBRA DESAGREGADO",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });

    const filename = buildFilenameDesagregado(project);
    return await finalizePDF(doc, filename, opts);
  }

  function drawFormalBarChart(doc, x, y, w, h, labels, values){
    const maxV = Math.max(1, ...values.map(v=>Number(v||0)));
    const n = labels.length;
    const padL = 26;
    const padB = 26;
    const padT = 14;
    const padR = 10;

    doc.setDrawColor(0);
    doc.setLineWidth(0.6);
    doc.rect(x, y, w, h, "S");
    doc.setLineWidth(0.2);

    const innerX = x + padL;
    const innerY = y + padT;
    const innerW = w - padL - padR;
    const innerH = h - padT - padB;

    doc.setDrawColor(0);
    doc.line(innerX, innerY + innerH, innerX + innerW, innerY + innerH);

    const gap = 10;
    const barW = Math.max(10, Math.floor((innerW - gap*(n+1)) / n));

    for(let i=0;i<n;i++){
      const v = Number(values[i]||0);
      const bh = (v / maxV) * (innerH - 8);
      const bx = innerX + gap + i*(barW+gap);
      const by = innerY + innerH - bh;

      doc.setFillColor(230,230,230);
      doc.setDrawColor(80);
      doc.rect(bx, by, barW, bh, "FD");

      doc.setFont("helvetica","normal"); doc.setFontSize(7.4);
      const vTxt = (v/1e6).toFixed(2) + "M";
      doc.text(vTxt, bx + barW/2, by - 3, { align:"center" });

      doc.setFont("helvetica","normal"); doc.setFontSize(7.4);
      doc.text(labels[i], bx + barW/2, innerY + innerH + 16, { align:"center" });
    }

    doc.setFont("helvetica","normal");
    doc.setFontSize(6.8);
    doc.text("Valores en millones (COP)", x + 8, y + h - 22);
  }

  function pieToDataURL(labels, values, sizePx){
    const total = values.reduce((s,v)=>s+Number(v||0),0) || 1;
    const c = document.createElement("canvas");
    const s = Math.max(64, sizePx|0);
    c.width = s; c.height = s;
    const ctx = c.getContext("2d");

    ctx.clearRect(0,0,s,s);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0,0,s,s);

    const cx = s/2, cy = s/2;
    const r = s*0.46;

    const fills = [
      "#c8c8c8","#dedede","#b4b4b4","#f0f0f0","#a0a0a0","#d2d2d2"
    ];

    let ang = -Math.PI/2;
    for(let i=0;i<values.length;i++){
      const v = Number(values[i]||0);
      const a2 = ang + (v/total) * (Math.PI*2);

      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,r,ang,a2,false);
      ctx.closePath();
      ctx.fillStyle = fills[i % fills.length];
      ctx.fill();

      ang = a2;
    }

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = Math.max(1, s*0.006);
    ctx.beginPath();
    ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.stroke();

    return c.toDataURL("image/png");
  }

  function drawPieAndLegend(doc, opts){
    const {
      cx, cy, r,
      labels, values,
      pageW, marginR
    } = opts;

    const scale = 3;
    const img = pieToDataURL(labels, values, Math.round((2*r) * scale));
    try{
      doc.addImage(img, "PNG", cx - r, cy - r, 2*r, 2*r);
    }catch(_){
      doc.setDrawColor(0);
      doc.setLineWidth(0.6);
      doc.circle(cx, cy, r, "S");
      doc.setLineWidth(0.2);
    }

    const total = values.reduce((s,v)=>s+Number(v||0),0) || 1;

    doc.setFont("helvetica","normal");
    doc.setFontSize(8.2);

    const legendXRight = cx + r + 18;
    const rightLimit = (pageW - (marginR || 44));
    const rightSpace = rightLimit - legendXRight;

    let maxW = 0;
    for(let i=0;i<labels.length;i++){
      const v = Number(values[i]||0);
      const pctv = (v/total)*100;
      const line = `${labels[i]}: ${pctv.toFixed(2)}%`;
      maxW = Math.max(maxW, doc.getTextWidth(line));
    }

    const canRight = (rightSpace >= Math.min(140, maxW + 6));

    if(canRight){
      let ly = cy - r;
      for(let i=0;i<labels.length;i++){
        const v = Number(values[i]||0);
        const pctv = (v/total)*100;
        doc.text(`${labels[i]}: ${pctv.toFixed(2)}%`, legendXRight, ly + 10);
        ly += 12;
      }
    }else{
      const x0 = Math.max(44, cx - r);
      const y0 = cy + r + 16;
      const maxWidth = Math.max(140, Math.min(260, rightLimit - x0));

      let yy = y0;
      for(let i=0;i<labels.length;i++){
        const v = Number(values[i]||0);
        const pctv = (v/total)*100;
        const line = `${labels[i]}: ${pctv.toFixed(2)}%`;
        const parts = doc.splitTextToSize(line, maxWidth);
        doc.text(parts, x0, yy);
        yy += parts.length * 11;
      }
    }
  }

  async function exportResumenPresupuestoObraDesagregadoPDF(project, opts){
    const doc = newDoc();
    const L = mkLayout(doc);
    const { items } = Calc.groupByChapters(project);

    drawInstitutionalCover(doc, L, project, "RESUMEN PRESUPUESTO DE OBRA DESAGREGADO");

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    const agg = await calcDesagregadoByItemFromAPU(project, items || []);
    const totals = agg.totals || {};
    const totalDirecto = Number(agg.totalDirecto||0);
    const denom = totalDirecto>0 ? totalDirecto : 1;

    const cats = [
      { k:"MATERIALES", label:"MATERIALES" },
      { k:"EQUIPO Y HERRAM", label:"EQUIPO Y HERRAM." },
      { k:"MANO DE OBRA", label:"MANO DE OBRA" },
      { k:"SUBCONTRATOS", label:"SUBCONTRATOS" },
      { k:"TRANSPORTES", label:"TRANSPORTES" },
      { k:"OTROS", label:"OTROS" }
    ];
    const values = cats.map(c=>Number(totals[c.k]||0));
    const labelsShort = ["MAT","EQ/HERR","M.O.","SUB","TRANS","OTR"];

    doc.setFont("helvetica","bold"); doc.setFontSize(11);
    doc.text("DATOS GENERALES", L.margin, L.getY());
    L.setY(L.getY()+14);

    doc.setFont("helvetica","normal"); doc.setFontSize(10);
    L.p(`Proyecto: ${project.name || "—"}`);
    L.p(`Fecha generación: ${new Date().toLocaleString()}`);
    L.p(" ");

    const margin = L.margin;
    const contentW = L.contentW;

    drawBand(doc, margin, L.getY(), contentW, 18, "TOTALES POR CATEGORÍA (COSTOS DIRECTOS)", { fontSize:9.6, bold:true });
    L.setY(L.getY()+24);

    const tx = margin;
    const tw = contentW;
    const rowH = 18;

    const c1 = 240, c2 = 180, c3 = Math.max(80, tw - c1 - c2);

    {
      const yTop = L.getY();
      doc.setFont("helvetica","bold"); doc.setFontSize(8.4);
      drawCellText(doc, tx, yTop, c1, rowH, "CATEGORÍA", "center", { bold:true, fontSize:8.4 });
      drawCellText(doc, tx + c1, yTop, c2, rowH, "VALOR (COP)", "center", { bold:true, fontSize:8.4 });
      drawCellText(doc, tx + c1 + c2, yTop, c3, rowH, "%", "center", { bold:true, fontSize:8.4 });
      hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
      L.setY(yTop + rowH + 6);
    }

    for(let i=0;i<cats.length;i++){
      const cat = cats[i];
      const v = Number(totals[cat.k]||0);
      const pctv = (v/denom)*100;

      ensureWithHeader(L, rowH + 10, ()=>{});
      const yTop = L.getY();

      drawCellText(doc, tx, yTop, c1, rowH, cat.label, "left", { fontSize:8.4 });
      drawCellText(doc, tx + c1, yTop, c2, rowH, moneyCOP0(v), "right", { fontSize:8.4 });
      drawCellText(doc, tx + c1 + c2, yTop, c3, rowH, pctv.toFixed(2) + "%", "right", { fontSize:8.4 });

      hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      L.setY(yTop + rowH + 2);
    }

    {
      ensureWithHeader(L, rowH + 12, ()=>{});
      const yTop = L.getY();
      doc.setFont("helvetica","bold"); doc.setFontSize(8.6);
      drawCellText(doc, tx, yTop, c1, rowH, "TOTAL", "left", { bold:true, fontSize:8.6 });
      drawCellText(doc, tx + c1, yTop, c2, rowH, moneyCOP0(totalDirecto), "right", { bold:true, fontSize:8.6 });
      drawCellText(doc, tx + c1 + c2, yTop, c3, rowH, "100.00%", "right", { bold:true, fontSize:8.6 });
      hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.band.w, PDF_THEME.lines.band.c);
      L.setY(yTop + rowH + 18);
    }

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    drawBand(doc, margin, L.getY(), contentW, 18, "GRÁFICAS — COSTOS DIRECTOS", { fontSize:9.6, bold:true });
    L.setY(L.getY()+26);

    doc.setFont("helvetica","bold"); doc.setFontSize(10);
    doc.text("Gráfico de barras", margin, L.getY());
    L.setY(L.getY()+10);

    drawFormalBarChart(doc, margin, L.getY(), 330, 220, labelsShort, values);

    doc.setFont("helvetica","bold"); doc.setFontSize(10);
    doc.text("Gráfico circular", margin + 350, L.getY() - 10);

    const { w: PAGE_W } = getPageSize(doc);

    drawPieAndLegend(doc, {
      cx: margin + 410,
      cy: L.getY() + 110,
      r: 70,
      labels: cats.map(c=>c.label),
      values,
      pageW: PAGE_W,
      marginR: 44
    });

    L.setY(L.getY()+240);

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"RESUMEN PRESUPUESTO OBRA DESAGREGADO",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });

    const filename = buildFilenameResumenDesagregado(project);
    return await finalizePDF(doc, filename, opts);
  }

  // =========================================================
  // PDF 3: DISTRIBUCIÓN PORCENTUAL DE COSTOS DIRECTOS
  // =========================================================
  async function exportDistribucionPorcentualCostosDirectosPDF(project, opts){
    const doc = newDoc();
    const L = mkLayout(doc);

    const { items } = Calc.groupByChapters(project);
    const all = items || [];

    drawInstitutionalCover(doc, L, project, "DISTRIBUCIÓN PORCENTUAL DE COSTOS DIRECTOS");

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    const totalDirecto = all.reduce((s,it)=> s + (Number(it.pu||0)*Number(it.qty||0)), 0) || 0;
    const denom = totalDirecto>0 ? totalDirecto : 1;

    doc.setFont("helvetica","bold"); doc.setFontSize(11);
    doc.text("DATOS GENERALES", L.margin, L.getY());
    L.setY(L.getY()+14);

    doc.setFont("helvetica","normal"); doc.setFontSize(10);
    L.p(`Proyecto: ${project.name || "—"}`);
    L.p(`Fecha generación: ${new Date().toLocaleString()}`);
    L.p(" ");

    const margin = L.margin;
    const contentW = L.contentW;

    const X = {
      item: margin + 0,
      desc: margin + 62,
      parc: margin + contentW - 90,
      pct:  margin + contentW
    };
    const DESC_W = (X.parc - X.desc) - 10;

    function header(){
      const h = 18;
      L.ensure(h + 8);
      const yTop = L.getY();

      doc.setFont("helvetica","bold"); doc.setFontSize(9.4);
      const baseY = yTop + 12;

      doc.text("ITEM", X.item, baseY);
      doc.text("DESCRIPCIÓN", X.desc, baseY);
      doc.text("VR PARCIAL", X.parc, baseY, { align:"right" });
      doc.text("%", X.pct, baseY, { align:"right" });

      hLine(doc, margin, margin+contentW, yTop + h, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
      L.setY(yTop + h + 8);
    }

    function chapterTitle(code, name){
      ensureWithHeader(L, 26, header);
      const yTop = L.getY();
      doc.setFont("helvetica","bold"); doc.setFontSize(9.2);
      doc.text(`${safe(code)} — ${safe(name)}`, margin, yTop + 12);
      hLine(doc, margin, margin+contentW, yTop + 18, PDF_THEME.lines.band.w, PDF_THEME.lines.band.c);
      L.setY(yTop + 24);
    }

    function itemRow(it){
      const parcial = Number(it.pu||0) * Number(it.qty||0);
      const pctv = (parcial/denom)*100;

      doc.setFont("helvetica","normal"); doc.setFontSize(9.0);
      const descLines = doc.splitTextToSize(safe(it.desc||""), DESC_W).slice(0,2);
      const rowH = Math.max(18, 8 + descLines.length*10);

      const jumped = L.ensure(rowH + 10);
      if(jumped) header();

      const yTop = L.getY();
      const baseY = yTop + 12;

      doc.setFont("helvetica","bold");
      doc.text(safe(it.code||""), X.item, baseY);

      doc.setFont("helvetica","normal");
      doc.text(descLines, X.desc, baseY);

      doc.text(moneyCOP0(parcial), X.parc, baseY, { align:"right" });
      doc.text(pctv.toFixed(2) + "%", X.pct, baseY, { align:"right" });

      hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      L.setY(yTop + rowH + 2);
    }

    header();

    if(!all.length){
      L.p("Sin ítems.");
    }else{
      let currentChap = null;
      for(const it of all){
        const chap = getChapterFromItem(it);
        if(chap !== currentChap){
          currentChap = chap;
          chapterTitle(`CAPÍTULO ${chap}`, getChapterNameFromItem(it));
          header();
        }
        itemRow(it);
      }
    }

    ensureWithHeader(L, 50, header);
    const yT = L.getY();

    doc.setFont("helvetica","bold"); doc.setFontSize(9.4);
    doc.text("TOTAL COSTOS DIRECTOS", margin, yT + 12);

    doc.setFont("helvetica","bold"); doc.setFontSize(9.6);
    doc.text(moneyCOP0(totalDirecto), X.parc, yT + 12, { align:"right" });
    doc.text("100.00%", X.pct, yT + 12, { align:"right" });

    hLine(doc, margin, margin+contentW, yT + 18, PDF_THEME.lines.band.w, PDF_THEME.lines.band.c);
    L.setY(yT + 26);

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"DISTRIBUCIÓN PORCENTUAL COSTOS DIRECTOS",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });

    const filename = buildFilenameDistribucionPctDirectos(project);
    return await finalizePDF(doc, filename, opts);
  }

  function isExactEquipoGroup(g){
    return String(g||"").trim().toUpperCase() === "EQUIPO Y HERRAMIENTAS";
  }
  function isExactManoGroup(g){
    return String(g||"").trim().toUpperCase() === "MANO DE OBRA";
  }

  async function exportRendimientoEquipoYManoDeObraPorActividadPDF(project, opts){
    const doc = newDoc();
    const L = mkLayout(doc);

    const { items } = Calc.groupByChapters(project);
    const all = items || [];

    drawInstitutionalCover(doc, L, project, "RENDIMIENTO EQUIPO Y MANO DE OBRA POR ACTIVIDAD");

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    doc.setFont("helvetica","bold"); doc.setFontSize(11);
    doc.text("DATOS GENERALES", L.margin, L.getY());
    L.setY(L.getY()+14);

    doc.setFont("helvetica","normal"); doc.setFontSize(10);
    L.p(`Proyecto: ${project.name || "—"}`);
    L.p(`Fecha generación: ${new Date().toLocaleString()}`);
    L.p(" ");

    const margin = L.margin;
    const contentW = L.contentW;

    let cols = [
      { k:"item", label:"ITEM", w:42, align:"left" },
      { k:"unid", label:"UNID", w:28, align:"center" },
      { k:"cant", label:"CANT", w:40, align:"right" },
      { k:"eqDesc", label:"EQUIPO", w:158, align:"left" },
      { k:"eqR", label:"R/D", w:40, align:"right" },
      { k:"eqD", label:"DÍAS", w:40, align:"right" },
      { k:"moDesc", label:"M.O.", w:158, align:"left" },
      { k:"moR", label:"R/D", w:40, align:"right" },
      { k:"moD", label:"DÍAS", w:40, align:"right" }
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

    function chapterBand(txt){
      ensureWithHeader(L, 26, header);
      const yTop = L.getY();
      doc.setFont("helvetica","bold"); doc.setFontSize(9.2);
      doc.text(String(txt||""), margin, yTop + 12);
      hLine(doc, margin, margin+contentW, yTop + 18, PDF_THEME.lines.band.w, PDF_THEME.lines.band.c);
      L.setY(yTop + 24);
    }

    async function itemBlock(it){
      const qtyItem = Number(it.qty||0);
      const apuObj = await getAPUForProjectItem(project, it);
      const lines = (apuObj && Array.isArray(apuObj.lines)) ? apuObj.lines : [];

      const equipos = [];
      const manos = [];

      for(const ln of lines){
        const grp = String(ln.group || ln.tipo || "").trim();
        if(isExactEquipoGroup(grp)) equipos.push(ln);
        if(isExactManoGroup(grp)) manos.push(ln);
      }

      const maxRows = Math.max(equipos.length, manos.length, 1);

      for(let i=0;i<maxRows;i++){
        const eq = equipos[i] || null;
        const mo = manos[i] || null;

        doc.setFont("helvetica","normal"); doc.setFontSize(7.2);

        const eqLines = splitToLines(doc, eq?.desc||"", cols[3].w - 6, 2);
        const moLines = splitToLines(doc, mo?.desc||"", cols[6].w - 6, 2);

        const rowH = Math.max(18, 8 + Math.max(eqLines.length, moLines.length) * 9);

        const jumped = L.ensure(rowH + 10);
        if(jumped) header();

        const yTop = L.getY();
        let x = margin;

        drawCellText(doc, x, yTop, cols[0].w, rowH, (i===0? safe(it.code||"") : ""), "left", { bold:(i===0), fontSize:7.2 }); x += cols[0].w;
        drawCellText(doc, x, yTop, cols[1].w, rowH, (i===0? safe(it.unit||"") : ""), "center", { fontSize:7.2 }); x += cols[1].w;
        drawCellText(doc, x, yTop, cols[2].w, rowH, (i===0? fmt0(qtyItem) : ""), "right", { fontSize:7.2 }); x += cols[2].w;

        const eqR = eq ? Number(eq.qty||0) : 0;
        const eqD = eq ? Math.round(qtyItem * eqR) : 0;

        drawCellText(doc, x, yTop, cols[3].w, rowH, eq ? eqLines : "-", "left", { fontSize:7.2 }); x += cols[3].w;
        drawCellText(doc, x, yTop, cols[4].w, rowH, eq ? fmt2(eqR) : "0.00", "right", { fontSize:7.2 }); x += cols[4].w;
        drawCellText(doc, x, yTop, cols[5].w, rowH, eq ? String(eqD) : "0", "right", { fontSize:7.2 }); x += cols[5].w;

        const moR = mo ? Number(mo.qty||0) : 0;
        const moD = mo ? Math.round(qtyItem * moR) : 0;

        drawCellText(doc, x, yTop, cols[6].w, rowH, mo ? moLines : "-", "left", { fontSize:7.2 }); x += cols[6].w;
        drawCellText(doc, x, yTop, cols[7].w, rowH, mo ? fmt2(moR) : "0.00", "right", { fontSize:7.2 }); x += cols[7].w;
        drawCellText(doc, x, yTop, cols[8].w, rowH, mo ? String(moD) : "0", "right", { fontSize:7.2 });

        hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
        L.setY(yTop + rowH + 2);
      }
    }

    header();

    if(!all.length){
      L.p("Sin ítems.");
    }else{
      let currentChap = null;
      for(const it of all){
        const chap = getChapterFromItem(it);
        if(chap !== currentChap){
          currentChap = chap;
          chapterBand(`CAPÍTULO ${chap} — ${getChapterNameFromItem(it)}`);
          header();
        }
        await itemBlock(it);
      }
    }

    L.setY(L.getY()+10);
    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"RENDIMIENTO EQUIPO Y MANO DE OBRA",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });

    const filename = buildFilenameRendimientos(project);
    return await finalizePDF(doc, filename, opts);
  }

  async function exportResumenMaterialesPorActividadPDF(project, opts){
    const doc = newDoc();
    const L = mkLayout(doc);

    const { items } = Calc.groupByChapters(project);
    const all = items || [];

    drawInstitutionalCover(doc, L, project, "RESUMEN MATERIALES POR ACTIVIDAD");

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    doc.setFont("helvetica","bold"); doc.setFontSize(11);
    doc.text("DATOS GENERALES", L.margin, L.getY());
    L.setY(L.getY()+14);

    doc.setFont("helvetica","normal"); doc.setFontSize(10);
    L.p(`Proyecto: ${project.name || "—"}`);
    L.p(`Fecha generación: ${new Date().toLocaleString()}`);
    L.p(" ");

    const margin = L.margin;
    const contentW = L.contentW;

    let cols = [
      { k:"item", label:"ITEM", w:42, align:"left" },
      { k:"desc", label:"DESC", w:130, align:"left" },
      { k:"unid", label:"UNID", w:28, align:"center" },
      { k:"cantItem", label:"CANT", w:40, align:"right" },
      { k:"insDesc", label:"INSUMO", w:150, align:"left" },
      { k:"insUn", label:"U", w:24, align:"center" },
      { k:"cantUnit", label:"C/U", w:34, align:"right" },
      { k:"vrUnit", label:"VR U", w:54, align:"right" },
      { k:"cantTot", label:"C TOT", w:44, align:"right" },
      { k:"parc", label:"VR PARC", w:66, align:"right" }
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

    function chapterBand(txt){
      ensureWithHeader(L, 26, header);
      const yTop = L.getY();
      doc.setFont("helvetica","bold"); doc.setFontSize(9.2);
      doc.text(String(txt||""), margin, yTop + 12);
      hLine(doc, margin, margin+contentW, yTop + 18, PDF_THEME.lines.band.w, PDF_THEME.lines.band.c);
      L.setY(yTop + 24);
    }

    async function itemMaterials(it){
      const qtyItem = Number(it.qty||0);
      const apuObj = await getAPUForProjectItem(project, it);
      const lines = (apuObj && Array.isArray(apuObj.lines)) ? apuObj.lines : [];

      const mats = [];
      for(const ln of lines){
        const grp = classifyDirectGroup(ln.group || ln.tipo || "");
        if(grp === "MATERIALES") mats.push(ln);
      }

      let sub = 0;

      if(!mats.length){
        const rowH = 18;
        const jumped = L.ensure(rowH + 10);
        if(jumped) header();

        const yTop = L.getY();
        let x = margin;

        drawCellText(doc, x, yTop, cols[0].w, rowH, safe(it.code||""), "left", { bold:true, fontSize:7.2 }); x += cols[0].w;
        const itDesc = splitToLines(doc, safe(it.desc||""), cols[1].w-6, 1);
        drawCellText(doc, x, yTop, cols[1].w, rowH, itDesc, "left", { fontSize:7.2 }); x += cols[1].w;
        drawCellText(doc, x, yTop, cols[2].w, rowH, safe(it.unit||""), "center", { fontSize:7.2 }); x += cols[2].w;
        drawCellText(doc, x, yTop, cols[3].w, rowH, fmt0(qtyItem), "right", { fontSize:7.2 }); x += cols[3].w;

        drawCellText(doc, x, yTop, cols[4].w, rowH, "-", "left", { fontSize:7.2 }); x += cols[4].w;
        drawCellText(doc, x, yTop, cols[5].w, rowH, "-", "center", { fontSize:7.2 }); x += cols[5].w;
        drawCellText(doc, x, yTop, cols[6].w, rowH, "0.00", "right", { fontSize:7.2 }); x += cols[6].w;
        drawCellText(doc, x, yTop, cols[7].w, rowH, moneyCOP0(0), "right", { fontSize:7.2 }); x += cols[7].w;
        drawCellText(doc, x, yTop, cols[8].w, rowH, "0.00", "right", { fontSize:7.2 }); x += cols[8].w;
        drawCellText(doc, x, yTop, cols[9].w, rowH, moneyCOP0(0), "right", { bold:true, fontSize:7.2 });

        hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
        L.setY(yTop + rowH + 2);
      }else{
        for(let i=0;i<mats.length;i++){
          const ln = mats[i];
          const cantUnit = Number(ln.qty||0);
          const pu = Number(ln.pu||0);
          const cantTot = qtyItem * cantUnit;

          const parcialBruto = cantTot * pu;
          const parcial = isAccesoriosPercentLine(ln) ? (parcialBruto / 100) : parcialBruto;

          sub += parcial;

          doc.setFont("helvetica","normal"); doc.setFontSize(7.2);
          const itDesc = splitToLines(doc, safe(it.desc||""), cols[1].w-6, 1);
          const insDesc = splitToLines(doc, safe(ln.desc||""), cols[4].w-6, 2);

          const rowH = Math.max(18, 8 + (insDesc.length)*9);

          const jumped = L.ensure(rowH + 10);
          if(jumped) header();

          const yTop = L.getY();
          let x = margin;

          drawCellText(doc, x, yTop, cols[0].w, rowH, (i===0? safe(it.code||"") : ""), "left", { bold:(i===0), fontSize:7.2 }); x += cols[0].w;
          drawCellText(doc, x, yTop, cols[1].w, rowH, (i===0? itDesc : ""), "left", { fontSize:7.2 }); x += cols[1].w;
          drawCellText(doc, x, yTop, cols[2].w, rowH, (i===0? safe(it.unit||"") : ""), "center", { fontSize:7.2 }); x += cols[2].w;
          drawCellText(doc, x, yTop, cols[3].w, rowH, (i===0? fmt0(qtyItem) : ""), "right", { fontSize:7.2 }); x += cols[3].w;

          drawCellText(doc, x, yTop, cols[4].w, rowH, insDesc, "left", { fontSize:7.2 }); x += cols[4].w;
          drawCellText(doc, x, yTop, cols[5].w, rowH, safe(ln.unit||""), "center", { fontSize:7.2 }); x += cols[5].w;
          drawCellText(doc, x, yTop, cols[6].w, rowH, fmt2(cantUnit), "right", { fontSize:7.2 }); x += cols[6].w;

          {
            const s = moneyCOP0(pu);
            const fs = fitTextRight(doc, s, cols[7].w-4, 7.2, 6.2);
            drawCellText(doc, x, yTop, cols[7].w, rowH, s, "right", { fontSize:fs });
            x += cols[7].w;
          }
          drawCellText(doc, x, yTop, cols[8].w, rowH, fmt2(cantTot), "right", { fontSize:7.2 }); x += cols[8].w;

          {
            const s = moneyCOP0(parcial);
            const fs = fitTextRight(doc, s, cols[9].w-4, 7.2, 6.2);
            drawCellText(doc, x, yTop, cols[9].w, rowH, s, "right", { bold:true, fontSize:fs });
          }

          hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
          L.setY(yTop + rowH + 2);
        }
      }

      ensureWithHeader(L, 28, header);
      const yS = L.getY();
      doc.setFont("helvetica","bold"); doc.setFontSize(8.2);
      doc.text("SubTotal", margin + contentW - 160, yS + 12);
      doc.text(moneyCOP0(sub), margin + contentW - 8, yS + 12, { align:"right" });
      hLine(doc, margin, margin+contentW, yS + 18, PDF_THEME.lines.band.w, PDF_THEME.lines.band.c);
      L.setY(yS + 24);

      return sub;
    }

    header();

    let grand = 0;

    if(!all.length){
      L.p("Sin ítems.");
    }else{
      let currentChap = null;
      for(const it of all){
        const chap = getChapterFromItem(it);
        if(chap !== currentChap){
          currentChap = chap;
          chapterBand(`CAPÍTULO ${chap} — ${getChapterNameFromItem(it)}`);
          header();
        }
        grand += await itemMaterials(it);
      }
    }

    ensureWithHeader(L, 40, header);
    const yT = L.getY();

    doc.setFont("helvetica","bold"); doc.setFontSize(9.4);
    doc.text("VALOR TOTAL", margin, yT + 12);
    doc.setFont("helvetica","bold"); doc.setFontSize(9.6);
    doc.text(moneyCOP0(grand), margin + contentW - 8, yT + 12, { align:"right" });
    hLine(doc, margin, margin+contentW, yT + 18, PDF_THEME.lines.band.w, PDF_THEME.lines.band.c);
    L.setY(yT + 26);

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"RESUMEN MATERIALES POR ACTIVIDAD",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });

    const filename = buildFilenameResumenMaterialesActividad(project);
    return await finalizePDF(doc, filename, opts);
  }

  async function exportCantidadRecursosEInsumosPresupuestoPDF(project, opts){
    const doc = newDoc();
    const L = mkLayout(doc);

    const { items } = Calc.groupByChapters(project);
    const all = items || [];

    drawInstitutionalCover(doc, L, project, "CANTIDAD DE RECURSOS E INSUMOS DEL PRESUPUESTO");

    doc.addPage();
    L.setY(PDF_THEME.safe.top);

    doc.setFont("helvetica","bold"); doc.setFontSize(11);
    doc.text("DATOS GENERALES", L.margin, L.getY());
    L.setY(L.getY()+14);

    doc.setFont("helvetica","normal"); doc.setFontSize(10);
    L.p(`Proyecto: ${project.name || "—"}`);
    L.p(`Fecha generación: ${new Date().toLocaleString()}`);
    L.p(" ");

    const totalDirectoPres = all.reduce((s,it)=> s + (Number(it.pu||0)*Number(it.qty||0)), 0) || 0;
    const denom = totalDirectoPres>0 ? totalDirectoPres : 1;

    const map = new Map();

    for(const it of all){
      const qtyItem = Number(it.qty||0);
      const apuObj = await getAPUForProjectItem(project, it);
      const lines = (apuObj && Array.isArray(apuObj.lines)) ? apuObj.lines : [];

      for(const ln of lines){
        const desc = safe(ln.desc||"").trim();
        if(!desc) continue;

        const unit = safe(ln.unit||"").trim();
        const qtyUnit = Number(ln.qty||0);
        const pu = Number(ln.pu||0);

        const qtyTotal = qtyUnit * qtyItem;
        const parcial = qtyTotal * pu;

        const key = desc;

        if(!map.has(key)){
          map.set(key, {
            desc,
            unit,
            precioComercial: pu,
            precioUnitario: pu,
            cantidad: 0,
            vrParcial: 0
          });
        }

        const rec = map.get(key);
        if(!rec.unit && unit) rec.unit = unit;
        if(!Number.isFinite(Number(rec.precioUnitario))) rec.precioUnitario = pu;

        rec.cantidad += qtyTotal;
        rec.vrParcial += parcial;
      }
    }

    try{
      if(window.APUBase && typeof APUBase.getInsumoByDesc === "function"){
        for(const rec of map.values()){
          const ins = await APUBase.getInsumoByDesc(rec.desc);
          if(ins && Number.isFinite(Number(ins.pu || ins.precio || ins.precioComercial))){
            rec.precioComercial = Number(ins.pu || ins.precio || ins.precioComercial);
          }
        }
      }
    }catch(_){}

    const rows = Array.from(map.values()).sort((a,b)=> a.desc.localeCompare(b.desc, "es"));

    const margin = L.margin;
    const contentW = L.contentW;

    let cols = [
      { k:"desc", label:"DESCRIPCIÓN", w:220, align:"left" },
      { k:"unit", label:"UNID", w:34, align:"center" },
      { k:"pcom", label:"P COM", w:62, align:"right" },
      { k:"puni", label:"P UNI", w:62, align:"right" },
      { k:"cant", label:"CANT", w:56, align:"right" },
      { k:"parc", label:"VR PARC", w:66, align:"right" },
      { k:"pct",  label:"% INC", w:50, align:"right" }
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

    function row(rec){
      doc.setFont("helvetica","normal"); doc.setFontSize(7.2);
      const descLines = splitToLines(doc, rec.desc, cols[0].w - 6, 2);
      const rowH = Math.max(18, 8 + (descLines.length)*9);

      const jumped = L.ensure(rowH + 10);
      if(jumped) header();

      const pctv = (Number(rec.vrParcial||0)/denom)*100;

      const yTop = L.getY();
      let x = margin;

      drawCellText(doc, x, yTop, cols[0].w, rowH, descLines, "left", { fontSize:7.2 }); x += cols[0].w;
      drawCellText(doc, x, yTop, cols[1].w, rowH, safe(rec.unit||""), "center", { fontSize:7.2 }); x += cols[1].w;

      {
        const s = moneyCOP0(rec.precioComercial||0);
        const fs = fitTextRight(doc, s, cols[2].w-4, 7.2, 6.2);
        drawCellText(doc, x, yTop, cols[2].w, rowH, s, "right", { fontSize:fs }); x += cols[2].w;
      }
      {
        const s = moneyCOP0(rec.precioUnitario||0);
        const fs = fitTextRight(doc, s, cols[3].w-4, 7.2, 6.2);
        drawCellText(doc, x, yTop, cols[3].w, rowH, s, "right", { fontSize:fs }); x += cols[3].w;
      }

      drawCellText(doc, x, yTop, cols[4].w, rowH, fmt2(rec.cantidad||0), "right", { fontSize:7.2 }); x += cols[4].w;

      {
        const s = moneyCOP0(rec.vrParcial||0);
        const fs = fitTextRight(doc, s, cols[5].w-4, 7.2, 6.2);
        drawCellText(doc, x, yTop, cols[5].w, rowH, s, "right", { bold:true, fontSize:fs }); x += cols[5].w;
      }

      drawCellText(doc, x, yTop, cols[6].w, rowH, pctv.toFixed(2) + "%", "right", { fontSize:7.2 });

      hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
      L.setY(yTop + rowH + 2);
    }

    header();

    if(!rows.length){
      L.p("Sin recursos/insumos para listar.");
    }else{
      for(const r of rows){
        row(r);
      }
    }

    const totalVR = rows.reduce((s,r)=>s+Number(r.vrParcial||0),0) || 0;

    ensureWithHeader(L, 40, header);
    const yT = L.getY();

    doc.setFont("helvetica","bold"); doc.setFontSize(9.4);
    doc.text("TOTAL", margin, yT + 12);
    doc.setFont("helvetica","bold"); doc.setFontSize(9.6);
    doc.text(moneyCOP0(totalVR), margin + contentW - 90, yT + 12, { align:"right" });
    doc.text("100.00%", margin + contentW - 8, yT + 12, { align:"right" });
    hLine(doc, margin, margin+contentW, yT + 18, PDF_THEME.lines.band.w, PDF_THEME.lines.band.c);
    L.setY(yT + 26);

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"CANTIDAD DE RECURSOS E INSUMOS",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });

    const filename = buildFilenameCantRecursosInsumos(project);
    return await finalizePDF(doc, filename, opts);
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
      L.p(`Unidad: ${safe(apuObj.unit||it.unit||"-")} · Costo directo: ${moneyCOP(apuObj.directo||0)}`);

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

    exportRendimientoEquipoManoObraActividadPDF,
    exportCantidadRecursosInsumosPresupuestoPDF
  };
})();