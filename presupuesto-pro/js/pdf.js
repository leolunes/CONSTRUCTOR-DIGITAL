(function(){
  function moneyCOP(n){
    return "$ " + Math.round(Number(n||0)).toLocaleString("es-CO");
  }
  function safe(s){ return String(s||""); }

  function buildFilename(project, suffix=""){
    const name = (project.name||"proyecto").replace(/[^\w\d]+/g,"_").slice(0,40);
    return `Presupuesto_${name}${suffix ? "_"+suffix : ""}_${Date.now()}.pdf`;
  }

  function buildFilenameSpecs(project){
    const name = (project.name||"proyecto").replace(/[^\w\d]+/g,"_").slice(0,40);
    return `Especificaciones_Tecnicas_${name}_${Date.now()}.pdf`;
  }

  function newDoc(){
    if(!window.jspdf?.jsPDF) throw new Error("jsPDF no está cargado.");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:"pt", format:"letter" });

    // ✅ Asegurar texto negro “normal”
    try{
      doc.setTextColor(0);
      doc.setDrawColor(0);
      doc.setFillColor(255,255,255);
    }catch(_){}

    return doc;
  }

  function mkLayout(doc){
    const PAGE_W = 612, PAGE_H = 792;
    const margin = 44;
    const contentW = PAGE_W - margin*2;
    let y = 54;

    function ensure(h){
      if(y + h > PAGE_H - 54){
        doc.addPage();
        // ✅ asegurar colores “normales” en nuevas páginas
        try{
          doc.setTextColor(0);
          doc.setDrawColor(0);
          doc.setFillColor(255,255,255);
        }catch(_){}
        y = 54;
        return true;
      }
      return false;
    }

    function h1(t){
      ensure(24);
      doc.setFont("helvetica","bold");
      doc.setFontSize(14);
      doc.text(safe(t), margin, y);
      y += 18;
    }

    function h2(t){
      ensure(20);
      doc.setFont("helvetica","bold");
      doc.setFontSize(11.5);
      doc.text(safe(t), margin, y);
      y += 16;
    }

    function p(t){
      doc.setFont("helvetica","normal");
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(safe(t), contentW);
      ensure(lines.length*13 + 8);
      doc.text(lines, margin, y);
      y += lines.length*13 + 6;
    }

    function row(label,value){
      ensure(16);
      doc.setFont("helvetica","bold"); doc.setFontSize(10);
      doc.text(safe(label), margin, y);
      doc.setFont("helvetica","normal");
      doc.text(safe(value), margin + 170, y);
      y += 14;
    }

    function line(){
      ensure(10);
      doc.setDrawColor(140);
      doc.line(margin, y, margin+contentW, y);
      y += 12;
    }

    // TABLA PRESUPUESTO
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
      ensure(26);
      doc.setFont("helvetica","bold"); doc.setFontSize(9.2);

      doc.text("ITEM", col.item, y);
      doc.text("DESCRIPCIÓN", col.desc, y);

      doc.text("UNID", col.unit, y);
      doc.text("VR UNIT", col.pu, y, { align:"right" });
      doc.text("CANT", col.qty, y, { align:"right" });
      doc.text("VR PARCIAL", col.parc, y, { align:"right" });

      y += 8;
      doc.setDrawColor(170);
      doc.line(margin, y, margin+contentW, y);
      y += 12;
    }

    function tableRowPresupuesto(it){
      const parcial = Number(it.pu||0) * Number(it.qty||0);
      const item = safe(it.code);
      const unit = safe(it.unit);

      doc.setFont("helvetica","normal"); doc.setFontSize(9.2);

      const descLines = doc.splitTextToSize(safe(it.desc), DESC_W).slice(0,3);
      const rowH = Math.max(14, descLines.length * 11);

      const jumped = ensure(rowH + 10);
      if(jumped) tableHeaderPresupuesto();

      doc.setFont("helvetica","bold");
      doc.text(item, col.item, y);

      doc.setFont("helvetica","normal");
      doc.text(descLines, col.desc, y);

      doc.text(unit, col.unit, y);
      doc.text(moneyCOP(it.pu), col.pu, y, { align:"right" });
      doc.text(safe(it.qty), col.qty, y, { align:"right" });

      doc.setFont("helvetica","bold");
      doc.text(moneyCOP(parcial), col.parc, y, { align:"right" });

      y += rowH;
    }

    // TABLA APU
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
      ensure(26);
      doc.setFont("helvetica","bold"); doc.setFontSize(9.2);

      doc.text("GRUPO", aCol.grp, y);
      doc.text("DESCRIPCIÓN", aCol.desc, y);
      doc.text("UNID", aCol.unit, y);
      doc.text("CANT", aCol.qty, y, { align:"right" });
      doc.text("VR UNIT", aCol.pu, y, { align:"right" });
      doc.text("VR PARCIAL", aCol.parc, y, { align:"right" });

      y += 8;
      doc.setDrawColor(170);
      doc.line(margin, y, margin+contentW, y);
      y += 12;
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
      const rowH = Math.max(14, descLines.length * 11);

      const jumped = ensure(rowH + 10);
      if(jumped) tableHeaderAPU();

      doc.text(grp, aCol.grp, y);
      doc.text(descLines, aCol.desc, y);

      doc.text(unit, aCol.unit, y);
      doc.text(String(qty||0), aCol.qty, y, { align:"right" });
      doc.text(moneyCOP(pu), aCol.pu, y, { align:"right" });

      doc.setFont("helvetica","bold");
      doc.text(moneyCOP(parcial), aCol.parc, y, { align:"right" });

      y += rowH;
    }

    return {
      PAGE_W, PAGE_H, margin, contentW,
      getY:()=>y, setY:(v)=>{y=v;},
      ensure, h1, h2, p, row, line,
      tableHeaderPresupuesto, tableRowPresupuesto,
      tableHeaderAPU, tableRowAPU
    };
  }

  // =========================================================
  // ✅ LOGO (dataUrl) helpers
  // =========================================================
  function imageTypeFromDataUrl(dataUrl){
    const s = String(dataUrl||"");
    if(s.startsWith("data:image/png")) return "PNG";
    if(s.startsWith("data:image/jpeg") || s.startsWith("data:image/jpg")) return "JPEG";
    if(s.startsWith("data:image/webp")) return "WEBP"; // jsPDF puede fallar en algunos builds, lo intentamos
    return ""; // unknown
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

  // ========= Encabezado / Pie (con logo por proyecto) =========
  function stampHeaderFooter(doc, { docType, projectName, logoDataUrl }){
    const pageCount = doc.getNumberOfPages();
    const PAGE_W = 612, PAGE_H = 792;
    const marginX = 44;
    const now = new Date().toLocaleString();

    // área header
    const headerTop = 14;
    const headerLineY = 42;

    const logoW = 64;
    const logoH = 24;

    for(let p=1; p<=pageCount; p++){
      doc.setPage(p);

      // ✅ asegurar colores “normales”
      try{
        doc.setTextColor(0);
        doc.setDrawColor(0);
      }catch(_){}

      // Header line
      doc.setDrawColor(200);
      doc.line(marginX, headerLineY, PAGE_W - marginX, headerLineY);

      // ✅ Portada (p==1): NO repetir docType/projectName (evita duplicar portada)
      if(p !== 1){
        // Logo pequeño en header (si existe)
        let textStartX = marginX;
        if(logoDataUrl){
          const ok = tryAddImage(doc, logoDataUrl, marginX, headerTop, logoW, logoH);
          if(ok) textStartX = marginX + logoW + 10;
        }

        // Header text
        doc.setFont("helvetica","bold");
        doc.setFontSize(9.5);
        doc.text(safe(docType), textStartX, 28);

        doc.setFont("helvetica","normal");
        doc.setFontSize(9.2);
        if(projectName) doc.text(safe(projectName), textStartX, 38);
      }

      doc.setFont("helvetica","normal");
      doc.setFontSize(9.2);
      doc.text(now, PAGE_W - marginX, 28, { align:"right" });

      // Footer (paginación)
      doc.setDrawColor(200);
      doc.line(marginX, PAGE_H - 44, PAGE_W - marginX, PAGE_H - 44);

      doc.setFont("helvetica","normal");
      doc.setFontSize(9);
      doc.text(`Página ${p} de ${pageCount}`, PAGE_W/2, PAGE_H - 28, { align:"center" });
    }
  }

  // ========= PORTADA INSTITUCIONAL (para TODOS los PDF) =========
  function dateLongEsCO(d){
    const dt = (d instanceof Date) ? d : new Date(d || Date.now());
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    return `${dt.getDate()} de ${meses[dt.getMonth()]} de ${dt.getFullYear()}`;
  }

  function up(s){ return String(s||"").trim().toUpperCase(); }

  function getInstitutionHeader(project){
    // ✅ Leer campos institucionales por proyecto (inst*)
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
    // Limpio: blanco + texto negro
    try{
      doc.setFillColor(255,255,255);
      doc.rect(0,0,L.PAGE_W,L.PAGE_H,"F");
      doc.setTextColor(0);
      doc.setDrawColor(0);
    }catch(_){}

    const elab = window.StorageAPI?.getElaborador ? StorageAPI.getElaborador() : null;

    // ✅ Campos por proyecto (con fallback)
    const entidadContratante = String(project?.instEntidad || project?.entity || "—");
    const ubicacion = String(project?.location || "—");

    const fechaElabRaw = String(project?.instFechaElab || "");
    const fechaElab = fechaElabRaw ? fechaElabRaw : dateLongEsCO(new Date());

    const projectLabel = String(project?.instProyectoLabel || project?.name || "PROYECTO");
    const projectNameUpper = up(projectLabel);

    const { country, deptLine, muniLine } = getInstitutionHeader(project);

    // ✅ Logo grande en portada (si existe)
    const logo = String(project?.logoDataUrl || "");
    if(logo){
      // centrado arriba
      const w = 160, h = 60;
      const x = (L.PAGE_W - w)/2;
      const yLogo = 44;
      tryAddImage(doc, logo, x, yLogo, w, h);
    }

    let y = 130;
    if(logo) y = 130 + 30; // bajar un poco si hay logo

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

    // Opcional: elaboró (si hay)
    if(elab && (elab.nombre || elab.profesion || elab.matricula)){
      y += 6;
      if(elab.nombre){ doc.text(`Elaboró: ${elab.nombre}`, L.margin, y); y += 14; }
      if(elab.profesion){ doc.text(`Profesión: ${elab.profesion}`, L.margin, y); y += 14; }
      if(elab.matricula){ doc.text(`Matrícula Profesional: ${elab.matricula}`, L.margin, y); y += 14; }
    }
  }

  /* =========================================================
     ✅ FIRMA: convertir “blanco sobre negro” -> “negro sobre blanco”
     ========================================================= */
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
      c.width = w;
      c.height = h;

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

  // ✅ BLOQUE FIRMA (estilo institucional simple)
  async function appendElaboradorFirma(doc, L){
    const elab = window.StorageAPI?.getElaborador ? StorageAPI.getElaborador() : null;
    const nombre = elab?.nombre ? String(elab.nombre) : "";
    const profesion = elab?.profesion ? String(elab.profesion) : "";
    const matricula = elab?.matricula ? String(elab.matricula) : "";
    const firmaDataUrl = elab?.firmaDataUrl ? String(elab.firmaDataUrl) : "";

    L.ensure(220);

    const boxX = L.margin;
    const boxW = 520;

    // rect de firma
    const sigX = boxX;
    const sigY = L.getY() + 10;
    const sigW = 320;
    const sigH = 95;

    doc.setFont("helvetica","normal"); doc.setFontSize(11);
    doc.text("Firma:", sigX, sigY - 6);

    doc.setDrawColor(0);
    doc.rect(sigX, sigY, sigW, sigH);

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

    // línea de firma + datos
    const lineY = sigY + sigH + 55;

    doc.setDrawColor(0);
    doc.line(boxX, lineY, boxX + boxW, lineY);

    doc.setFont("helvetica","bold"); doc.setFontSize(11);
    doc.text(nombre || "____________________________", boxX, lineY + 18);

    doc.setFont("helvetica","normal"); doc.setFontSize(11);
    let yy = lineY + 34;
    if(profesion){ doc.text(profesion, boxX, yy); yy += 14; }
    if(matricula){ doc.text(`M.P. ${matricula}`, boxX, yy); yy += 14; }

    L.setY(Math.max(L.getY(), yy + 10));
  }

  // ===== Helper: leer APU (override > custom app > base) =====
  async function getAPUForProjectItem(project, it){
    const code = String(it.code||"").trim();
    if(!code) return null;

    // 1) Override por proyecto
    try{
      if(window.StorageAPI?.getApuOverride){
        const ov = StorageAPI.getApuOverride(project.id, code);
        if(ov){
          const lines = Array.isArray(ov.lines) ? ov.lines : [];
          const directo = lines.reduce((s,l)=>{
            const qty = Number(l.qty||0);
            const pu = Number(l.pu||0);
            const parcial = Number(l.parcial||0) || (qty*pu);
            return s + parcial;
          }, 0);

          return {
            _src: "override",
            code,
            subtitle: String(ov.desc || it.desc || "").trim(),
            unit: String(ov.unit || it.unit || "").trim(),
            directo,
            lines
          };
        }
      }
    }catch(_){}

    // 2) Custom APU global
    try{
      const custom = window.StorageAPI?.getCustomAPU ? StorageAPI.getCustomAPU(code) : null;
      if(custom){
        const directo = (custom.lines||[]).reduce((s,l)=>{
          const qty = Number(l.qty||0);
          const pu = Number(l.pu||0);
          const parcial = Number(l.parcial||0) || (qty*pu);
          return s + parcial;
        }, 0);

        return {
          _src:"custom",
          code,
          subtitle: String(custom.desc || it.desc || "").trim(),
          unit: String(custom.unit || it.unit || "").trim(),
          directo,
          lines: custom.lines || []
        };
      }
    }catch(_){}

    // 3) Base XLSX
    const base = await (window.APUBase?.getAPU ? APUBase.getAPU(code) : null);
    if(!base) return null;

    return {
      _src:"base",
      code,
      subtitle: String(base.subtitle || it.desc || "").trim(),
      unit: String(base.unit || it.unit || "").trim(),
      directo: Number(base.directo||0),
      lines: base.lines || []
    };
  }

  // =========================================================
  // PRESUPUESTO PDF (con portada institucional + logo)
  // =========================================================
  async function exportPresupuestoPDF(project){
    const doc = newDoc();
    const L = mkLayout(doc);

    const { groups, items } = Calc.groupByChapters(project);
    const totals = Calc.calcTotals(project);

    // ✅ Portada institucional (página 1)
    drawInstitutionalCover(doc, L, project, "PRESUPUESTO DE OBRA");

    // ✅ Contenido en página 2
    doc.addPage();
    L.setY(54);

    L.h1("PRESUPUESTO DE OBRA");
    L.h2(project.name || "Proyecto");
    L.p(`Entidad: ${project.entity || "-"}`);
    L.p(`Ubicación: ${project.location || "-"}`);
    L.p(`Fecha generación: ${new Date().toLocaleString()}`);

    L.p(" ");
    L.h2("Resumen económico");
    L.row("Costo directo:", moneyCOP(totals.directo));
    L.row(`AIU (${project.aiuPct||0}%):`, moneyCOP(totals.aiu));
    L.row(`IVA (${project.ivaPct||0}%):`, moneyCOP(totals.iva));
    L.row("TOTAL:", moneyCOP(totals.total));

    L.p(" ");
    L.h2("Capítulos (subtotales)");
    if(!groups.length){
      L.p("No hay ítems para calcular capítulos.");
    }else{
      for(const g of groups){
        L.ensure(18);
        doc.setFont("helvetica","bold");
        doc.setFontSize(10.5);
        doc.text(`${g.chapterCode}  ${safe(g.chapterName||"")}`, L.margin, L.getY());

        doc.setFont("helvetica","normal");
        doc.text(`Ítems: ${g.itemsCount}`, L.margin + 320, L.getY());
        doc.setFont("helvetica","bold");
        doc.text(moneyCOP(g.subtotal), L.margin + 520, L.getY(), { align:"right" });
        L.setY(L.getY()+14);
      }
    }

    // DETALLE PRESUPUESTO
    doc.addPage();
    L.setY(54);
    L.h1("PRESUPUESTO DE OBRA (DETALLE)");

    L.line();
    L.tableHeaderPresupuesto();

    if(!items.length){
      L.p("Sin ítems.");
    }else{
      let currentChap = null;
      for(const it of items){
        const chap = it.chapterCode || (String(it.code||"").split(".")[0] || "SIN");
        if(chap !== currentChap){
          currentChap = chap;

          L.ensure(28);
          doc.setFont("helvetica","bold");
          doc.setFontSize(11);
          doc.text(`CAPÍTULO ${chap} — ${safe(it.chapterName||"")}`, L.margin, L.getY());
          L.setY(L.getY()+18);

          L.tableHeaderPresupuesto();
        }
        L.tableRowPresupuesto(it);
      }
    }

    // TOTALES + FIRMA
    L.line();
    doc.setFont("helvetica","bold"); doc.setFontSize(11);
    doc.text("Totales", L.margin, L.getY()); L.setY(L.getY()+16);
    doc.setFont("helvetica","normal"); doc.setFontSize(10);
    L.row("Costo directo:", moneyCOP(totals.directo));
    L.row(`AIU (${project.aiuPct||0}%):`, moneyCOP(totals.aiu));
    L.row(`IVA (${project.ivaPct||0}%):`, moneyCOP(totals.iva));
    L.row("TOTAL:", moneyCOP(totals.total));

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"PRESUPUESTO DE OBRA",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });
    doc.save(buildFilename(project, "DETALLE"));
    return true;
  }

  // =========================================================
  // PRESUPUESTO + APUs (con portada institucional + logo)
  // =========================================================
  async function exportPresupuestoConAPUsPDF(project){
    const doc = newDoc();
    const L = mkLayout(doc);

    const { groups, items } = Calc.groupByChapters(project);
    const totals = Calc.calcTotals(project);

    // ✅ Portada institucional (página 1)
    drawInstitutionalCover(doc, L, project, "PRESUPUESTO DE OBRA + APUs");

    // ✅ Contenido en página 2
    doc.addPage();
    L.setY(54);

    L.h1("PRESUPUESTO DE OBRA + APUs");
    L.h2(project.name || "Proyecto");
    L.p(`Entidad: ${project.entity || "-"}`);
    L.p(`Ubicación: ${project.location || "-"}`);
    L.p(`Fecha generación: ${new Date().toLocaleString()}`);

    L.p(" ");
    L.h2("Resumen económico");
    L.row("Costo directo:", moneyCOP(totals.directo));
    L.row(`AIU (${project.aiuPct||0}%):`, moneyCOP(totals.aiu));
    L.row(`IVA (${project.ivaPct||0}%):`, moneyCOP(totals.iva));
    L.row("TOTAL:", moneyCOP(totals.total));

    L.p(" ");
    L.h2("Capítulos (subtotales)");
    if(!groups.length){
      L.p("No hay ítems para calcular capítulos.");
    }else{
      for(const g of groups){
        L.ensure(18);
        doc.setFont("helvetica","bold");
        doc.setFontSize(10.5);
        doc.text(`${g.chapterCode}  ${safe(g.chapterName||"")}`, L.margin, L.getY());

        doc.setFont("helvetica","normal");
        doc.text(`Ítems: ${g.itemsCount}`, L.margin + 320, L.getY());
        doc.setFont("helvetica","bold");
        doc.text(moneyCOP(g.subtotal), L.margin + 520, L.getY(), { align:"right" });
        L.setY(L.getY()+14);
      }
    }

    // DETALLE PRESUPUESTO
    doc.addPage();
    L.setY(54);
    L.h1("PRESUPUESTO DE OBRA (DETALLE)");
    L.line();
    L.tableHeaderPresupuesto();
    for(const it of items){
      L.tableRowPresupuesto(it);
    }

    // APUS
    for(const it of items){
      const code = String(it.code||"").trim();
      if(!code) continue;

      doc.addPage();
      L.setY(54);

      const apuObj = await getAPUForProjectItem(project, it);
      if(!apuObj){
        L.h1(`APU ${code}`);
        L.p("No se encontró descomposición (override, custom o base).");
        continue;
      }

      L.h1(`APU ${code}`);
      L.h2(apuObj.subtitle || it.desc || "");
      L.p(`Unidad: ${safe(apuObj.unit||it.unit||"-")} · Costo directo: ${moneyCOP(apuObj.directo||0)}`);

      L.line();
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

    // FIRMAS
    doc.addPage();
    L.setY(54);
    L.h1("FIRMAS");
    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"PRESUPUESTO DE OBRA + APUs",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });
    doc.save(buildFilename(project, "APUS"));
    return true;
  }

  /* =========================================================
     ESPECIFICACIONES TÉCNICAS (ya con portada institucional + logo)
     ========================================================= */

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

  async function exportEspecificacionesTecnicasPDF(project){
    const doc = newDoc();
    const L = mkLayout(doc);

    const { groups, items } = Calc.groupByChapters(project);
    const elab = window.StorageAPI?.getElaborador ? StorageAPI.getElaborador() : null;

    const entidadContratante = project?.entity ? String(project.entity) : "—";
    const ubicacion = project?.location ? String(project.location) : "—";

    // ✅ Portada institucional (página 1)
    drawInstitutionalCover(doc, L, project, "ESPECIFICACIONES TÉCNICAS DEL PROYECTO");

    // TABLA DE CONTENIDO
    doc.addPage();
    L.setY(54);

    doc.setFont("helvetica","bold"); doc.setFontSize(12);
    doc.text("TABLA DE CONTENIDO", L.margin, L.getY());
    L.setY(L.getY()+22);

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

    // 1. INFORMACIÓN GENERAL
    doc.addPage();
    L.setY(54);

    doc.setFont("helvetica","bold"); doc.setFontSize(12);
    doc.text("1. INFORMACIÓN GENERAL", L.margin, L.getY());
    L.setY(L.getY()+18);

    doc.setFont("helvetica","normal"); doc.setFontSize(11);
    L.p(`Entidad: ${entidadContratante}`);
    L.p(`Ubicación: ${ubicacion}`);

    if(elab){
      if(elab.nombre) L.p(`Elaboró: ${elab.nombre}`);
      if(elab.profesion) L.p(`Profesión: ${elab.profesion}`);
      if(elab.matricula) L.p(`Matrícula Profesional: ${elab.matricula}`);
    }

    // 2. ALCANCE DEL DOCUMENTO
    doc.addPage();
    L.setY(54);

    doc.setFont("helvetica","bold"); doc.setFontSize(12);
    doc.text("2. ALCANCE DEL DOCUMENTO", L.margin, L.getY());
    L.setY(L.getY()+18);

    doc.setFont("helvetica","normal"); doc.setFontSize(11);
    L.p(
      "El presente documento consolida las especificaciones técnicas correspondientes a los ítems contemplados " +
      "dentro del presupuesto oficial del proyecto. Las especificaciones se estructuran con base en el " +
      "Análisis de Precios Unitarios (APU) y establecen los lineamientos técnicos, constructivos y normativos exigidos."
    );

    // CAPÍTULOS 3..N
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

      doc.addPage();
      L.setY(54);

      doc.setFont("helvetica","bold"); doc.setFontSize(12);
      doc.text(
        `${chapSec}. CAPÍTULO ${chapCode}${chapName ? " – " + chapName.toUpperCase() : ""}`,
        L.margin,
        L.getY()
      );
      L.setY(L.getY()+18);

      const chapItems = byChap.get(chapKey) || [];
      let itemSub = 1;

      for(const it of chapItems){
        const code = safe(it.code||"");
        const desc = safe(it.desc||"");
        const unit = safe(it.unit||"-");
        const qty = Number(it.qty||0);
        const pu = Number(it.pu||0);
        const parcial = pu * qty;

        const norms = detectNormatividad(desc);

        doc.setFont("helvetica","bold"); doc.setFontSize(11.5);
        L.ensure(22);
        doc.text(`${chapSec}.${itemSub} Ítem ${code} – ${desc}`, L.margin, L.getY());
        L.setY(L.getY()+16);

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

        L.p(" ");
        itemSub++;
      }

      chapSec++;
    }

    // FIRMAS
    doc.addPage();
    L.setY(54);

    doc.setFont("helvetica","bold"); doc.setFontSize(12);
    doc.text(`${chapSec}. FIRMAS`, L.margin, L.getY());
    L.setY(L.getY()+18);

    await appendElaboradorFirma(doc, L);

    stampHeaderFooter(doc, {
      docType:"ESPECIFICACIONES TÉCNICAS",
      projectName: project.name || "",
      logoDataUrl: project.logoDataUrl || ""
    });
    doc.save(buildFilenameSpecs(project));
    return true;
  }

  window.PDF = {
    exportPresupuestoPDF,
    exportPresupuestoConAPUsPDF,
    exportEspecificacionesTecnicasPDF
  };
})();