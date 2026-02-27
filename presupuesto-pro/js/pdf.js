(function(){
  function moneyCOP(n){
    return "$ " + Math.round(Number(n||0)).toLocaleString("es-CO");
  }
  function safe(s){ return String(s||""); }

  function buildFilename(project, suffix=""){
    const name = (project.name||"proyecto").replace(/[^\w\d]+/g,"_").slice(0,40);
    return `Presupuesto_${name}${suffix ? "_"+suffix : ""}_${Date.now()}.pdf`;
  }

  function newDoc(){
    if(!window.jspdf?.jsPDF) throw new Error("jsPDF no está cargado.");
    const { jsPDF } = window.jspdf;
    return new jsPDF({ unit:"pt", format:"letter" });
  }

  function mkLayout(doc){
    const PAGE_W = 612, PAGE_H = 792;
    const margin = 44;
    const contentW = PAGE_W - margin*2;
    let y = 54;

    function ensure(h){
      if(y + h > PAGE_H - 54){
        doc.addPage(); y = 54;
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

  // ========= Encabezado / Pie (sin repetir portada) =========
  function stampHeaderFooter(doc, { docType, projectName }){
    const pageCount = doc.getNumberOfPages();
    const PAGE_W = 612, PAGE_H = 792;
    const marginX = 44;

    const now = new Date().toLocaleString();

    for(let p=1; p<=pageCount; p++){
      doc.setPage(p);

      // Header line
      doc.setDrawColor(200);
      doc.line(marginX, 42, PAGE_W - marginX, 42);

      // Header text
      doc.setFont("helvetica","bold");
      doc.setFontSize(9.5);

      // ✅ Portada (p==1): NO poner docType ni projectName para evitar duplicar el título grande
      // Solo dejamos la fecha/hora a la derecha.
      if(p !== 1){
        doc.text(safe(docType), marginX, 28);
        doc.setFont("helvetica","normal");
        doc.setFontSize(9.2);
        if(projectName) doc.text(safe(projectName), marginX, 38);
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

  // ✅ BLOQUE FIRMA (inserta imagen si existe)
  function appendElaboradorFirma(doc, L){
    const elab = window.StorageAPI?.getElaborador ? StorageAPI.getElaborador() : null;
    const nombre = elab?.nombre ? String(elab.nombre) : "";
    const profesion = elab?.profesion ? String(elab.profesion) : "";
    const matricula = elab?.matricula ? String(elab.matricula) : "";
    const firmaDataUrl = elab?.firmaDataUrl ? String(elab.firmaDataUrl) : "";

    L.line();
    L.ensure(120);

    doc.setFont("helvetica","bold"); doc.setFontSize(11);
    doc.text("Elaboró", L.margin, L.getY());
    L.setY(L.getY()+16);

    doc.setFont("helvetica","normal"); doc.setFontSize(10);
    doc.text(`Nombre: ${nombre || "—"}`, L.margin, L.getY()); L.setY(L.getY()+14);
    doc.text(`Profesión: ${profesion || "—"}`, L.margin, L.getY()); L.setY(L.getY()+14);
    doc.text(`Matrícula profesional: ${matricula || "—"}`, L.margin, L.getY()); L.setY(L.getY()+14);

    // firma
    const boxX = L.margin;
    const boxY = L.getY() + 8;
    const boxW = 240;
    const boxH = 80;

    doc.setDrawColor(160);
    doc.rect(boxX, boxY, boxW, boxH);

    doc.setFont("helvetica","normal"); doc.setFontSize(9);
    doc.text("Firma:", boxX, boxY - 6);

    if(firmaDataUrl && firmaDataUrl.startsWith("data:image")){
      try{
        doc.addImage(firmaDataUrl, "JPEG", boxX+6, boxY+6, boxW-12, boxH-12);
      }catch(_){
        doc.setFont("helvetica","normal"); doc.setFontSize(9);
        doc.text("(No se pudo insertar la firma)", boxX+10, boxY+20);
      }
    }else{
      doc.setFont("helvetica","normal"); doc.setFontSize(9);
      doc.text("(Sin firma guardada)", boxX+10, boxY+20);
    }

    L.setY(boxY + boxH + 18);

    doc.setDrawColor(160);
    doc.line(boxX, L.getY(), boxX+boxW, L.getY());
    L.setY(L.getY()+12);
    doc.setFont("helvetica","bold"); doc.setFontSize(10);
    doc.text(nombre || "____________________________", boxX, L.getY());
    L.setY(L.getY()+16);
  }

  // ===== Helper: leer APU (override > custom app > base) =====
  async function getAPUForProjectItem(project, it){
    const code = String(it.code||"").trim();
    if(!code) return null;

    // 1) Override por proyecto (si existe en tu StorageAPI)
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

    // 2) Custom APU global (creado en la app)
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

  async function exportPresupuestoPDF(project){
    const doc = newDoc();
    const L = mkLayout(doc);

    const { groups, items } = Calc.groupByChapters(project);
    const totals = Calc.calcTotals(project);

    // PORTADA
    L.h1("PRESUPUESTO DE OBRA");
    L.h2(project.name || "Proyecto");
    L.p(`Entidad: ${project.entity || "-"}`);
    L.p(`Ubicación: ${project.location || "-"}`);
    L.p(`Fecha generación: ${new Date().toLocaleString()}`);

    // Elaboró en portada (si existe)
    const elab = window.StorageAPI?.getElaborador ? StorageAPI.getElaborador() : null;
    if(elab && (elab.nombre || elab.profesion || elab.matricula)){
      L.p(" ");
      L.h2("Elaboró");
      L.p(`Nombre: ${elab.nombre || "—"}`);
      L.p(`Profesión: ${elab.profesion || "—"}`);
      L.p(`Matrícula: ${elab.matricula || "—"}`);
    }

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

    appendElaboradorFirma(doc, L);

    // Encabezado + paginación (sin repetir en portada)
    stampHeaderFooter(doc, { docType:"PRESUPUESTO DE OBRA", projectName: project.name || "" });

    doc.save(buildFilename(project, "DETALLE"));
    return true;
  }

  async function exportPresupuestoConAPUsPDF(project){
    const doc = newDoc();
    const L = mkLayout(doc);

    const { groups, items } = Calc.groupByChapters(project);
    const totals = Calc.calcTotals(project);

    // PORTADA
    L.h1("PRESUPUESTO DE OBRA + APUs");
    L.h2(project.name || "Proyecto");
    L.p(`Entidad: ${project.entity || "-"}`);
    L.p(`Ubicación: ${project.location || "-"}`);
    L.p(`Fecha generación: ${new Date().toLocaleString()}`);

    // Elaboró en portada
    const elab = window.StorageAPI?.getElaborador ? StorageAPI.getElaborador() : null;
    if(elab && (elab.nombre || elab.profesion || elab.matricula)){
      L.p(" ");
      L.h2("Elaboró");
      L.p(`Nombre: ${elab.nombre || "—"}`);
      L.p(`Profesión: ${elab.profesion || "—"}`);
      L.p(`Matrícula: ${elab.matricula || "—"}`);
    }

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

      // Título y descripción correctos
      L.h1(`APU ${code}`);
      L.h2(apuObj.subtitle || it.desc || "");

      // ✅ NO imprimir "(Override del proyecto)"
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
    appendElaboradorFirma(doc, L);

    // Encabezado + paginación (sin repetir en portada)
    stampHeaderFooter(doc, { docType:"PRESUPUESTO DE OBRA + APUs", projectName: project.name || "" });

    doc.save(buildFilename(project, "APUS"));
    return true;
  }

  window.PDF = {
    exportPresupuestoPDF,
    exportPresupuestoConAPUsPDF
  };
})();