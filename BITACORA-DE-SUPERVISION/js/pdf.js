// js/pdf.js
async function blobToDataUrl(blob){
  return new Promise((res, rej)=>{
    const r = new FileReader();
    r.onload = ()=>res(r.result);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}

async function addImagesGrid(doc, filesMeta, startY, margin, contentW){
  let y = startY;
  const PAGE_H = doc.internal.pageSize.getHeight();
  const gap = 10;
  const cellW = (contentW - gap) / 2;
  const imgH = 180;

  for(let i=0;i<filesMeta.length;i++){
    const col = i % 2;
    if(col===0 && y + imgH + 30 > PAGE_H - 54){
      doc.addPage(); y = 54;
    }
    const x = margin + col * (cellW + gap);

    const rec = await DB.getFile(filesMeta[i].id);
    if(rec?.blob && (rec.mime||"").startsWith("image/")){
      const dataUrl = await blobToDataUrl(rec.blob);
      const fmt = (rec.mime||"").includes("png") ? "PNG" : "JPEG";
      doc.addImage(dataUrl, fmt, x, y, cellW, imgH, undefined, "FAST");
    } else {
      doc.rect(x,y,cellW,imgH);
      doc.text("Sin imagen", x+10, y+20);
    }

    doc.setFontSize(9);
    doc.text((filesMeta[i].name||"").slice(0,70), x, y + imgH + 12);

    if(col===1) y += imgH + 26;
  }
  if(filesMeta.length % 2 === 1) y += imgH + 26;
  return y;
}

async function exportVisitaPDF({ obra, visita, hallazgos, returnBlob=false }){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:"pt", format:"letter" });

  const PAGE_W = 612, PAGE_H = 792;
  const margin = 44;
  const contentW = PAGE_W - margin*2;
  let y = 54;

  function ensure(h){
    if(y + h > PAGE_H - 54){
      doc.addPage(); y = 54;
    }
  }

  function h1(t){
    ensure(24);
    doc.setFont("helvetica","bold");
    doc.setFontSize(14);
    doc.text(t, margin, y);
    y += 18;
  }
  function h2(t){
    ensure(20);
    doc.setFont("helvetica","bold");
    doc.setFontSize(11.5);
    doc.text(t, margin, y);
    y += 16;
  }
  function p(t){
    doc.setFont("helvetica","normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(String(t||""), contentW);
    ensure(lines.length*13 + 8);
    doc.text(lines, margin, y);
    y += lines.length*13 + 6;
  }
  function row(label,value){
    ensure(16);
    doc.setFont("helvetica","bold"); doc.setFontSize(10);
    doc.text(label, margin, y);
    doc.setFont("helvetica","normal");
    doc.text(String(value||""), margin + 170, y);
    y += 14;
  }

  h1("ALCALDÍA DE FLORIDABLANCA - SANTANDER");
  h2("BITÁCORA / ACTA DE VISITA DE SUPERVISIÓN");
  row("Radicado:", visita.radicado);
  row("Fecha:", visita.fecha);
  row("Hora:", `${visita.horaInicio} - ${visita.horaFin}`);
  y += 6;

  h2("Datos de la obra");
  row("Obra:", obra.nombre);
  row("Contrato:", obra.contrato);
  row("Ubicación:", obra.ubicacion);
  row("Contratista:", obra.contratista);
  row("Interventoría:", obra.interventoria);
  y += 6;

  h2("1. Objetivo"); p(visita.objetivo);
  h2("2. Resumen"); p(visita.resumen);
  h2("3. Asistentes"); p(visita.asistentes || "-");

  h2("4. Hallazgos");
  if(!hallazgos.length) p("No se registran hallazgos.");
  else {
    for(const h of hallazgos){
      p(`[${h.tipo}] ${h.severidad} - ${h.estado.toUpperCase()} - ${h.descripcion}`);
      p(`Acción: ${h.accionRequerida} | Responsable: ${h.responsable} | Límite: ${h.fechaLimite}`);
      if(h.estado==="cerrado") p(`Cierre: ${h.cerradoEn||"-"} ${h.cierreObs?`| ${h.cierreObs}`:""}`);
      p(" ");
    }
  }

  h2("5. Evidencias de la visita");
  const evVisita = (visita.evidencias || []).filter(e => (e.mime||"").startsWith("image/"));
  if(!evVisita.length) p("Sin evidencias fotográficas.");
  else y = await addImagesGrid(doc, evVisita, y, margin, contentW);

  // ✅ AJUSTE: “Evidencias de cierre” SOLO si hubo hallazgos en esta visita
  if((hallazgos || []).length){
    h2("6. Evidencias de cierre");
    const cerradosConEvid = (hallazgos||[]).filter(h=>h.estado==="cerrado" && (h.evidenciasCierre||[]).length);
    if(!cerradosConEvid.length) p("No hay evidencias de cierre.");
    else {
      for(const h of cerradosConEvid){
        h2(`Hallazgo: ${(h.descripcion||"").slice(0,70)}`);
        const ev = (h.evidenciasCierre||[]).filter(e => (e.mime||"").startsWith("image/"));
        if(!ev.length) p("Sin fotos de cierre.");
        else y = await addImagesGrid(doc, ev, y, margin, contentW);
      }
    }
  }

  p(`Generado: ${new Date().toLocaleString()}`);

  if(returnBlob){
    return doc.output("blob");
  }
  doc.save(`${visita.radicado}.pdf`);
}

async function exportObraConsolidadoPDF({ obra, visitas, hallazgos, returnBlob=false }){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:"pt", format:"letter" });

  const PAGE_W = 612, PAGE_H = 792;
  const margin = 44;
  const contentW = PAGE_W - margin*2;
  let y = 54;

  function ensure(h){
    if(y + h > PAGE_H - 54){
      doc.addPage(); y = 54;
    }
  }
  function h1(t){
    ensure(24); doc.setFont("helvetica","bold"); doc.setFontSize(14);
    doc.text(t, margin, y); y+=18;
  }
  function h2(t){
    ensure(20); doc.setFont("helvetica","bold"); doc.setFontSize(11.5);
    doc.text(t, margin, y); y+=16;
  }
  function p(t){
    doc.setFont("helvetica","normal"); doc.setFontSize(10);
    const lines = doc.splitTextToSize(String(t||""), contentW);
    ensure(lines.length*13 + 8);
    doc.text(lines, margin, y);
    y += lines.length*13 + 6;
  }

  h1("INFORME CONSOLIDADO DE OBRA");
  h2(`${obra.nombre} — Contrato ${obra.contrato}`);
  p(`Ubicación: ${obra.ubicacion}`);
  p(`Contratista: ${obra.contratista}`);
  p(`Interventoría: ${obra.interventoria}`);
  p(`Estado: ${(obra.estado||"activa").toUpperCase()}`);

  const { avance } = Crono.calcAvance(obra.cronograma||[]);
  p(`Avance (cronograma): ${Math.round(avance)}%`);
  p(" ");

  h2("Visitas");
  if(!visitas.length) p("Sin visitas registradas.");
  else {
    for(const v of visitas){
      p(`• ${v.radicado} — ${v.fecha} — ${v.objetivo}`);
    }
  }

  p(" ");
  h2("Hallazgos");
  if(!hallazgos.length) p("Sin hallazgos.");
  else {
    for(const h of hallazgos){
      p(`• [${h.tipo}] ${h.severidad} — ${h.estado.toUpperCase()} — ${h.descripcion}`);
    }
  }

  p(`Generado: ${new Date().toLocaleString()}`);

  const filename = `Consolidado_${obra.contrato}_${Date.now()}.pdf`;
  if(returnBlob){
    return { blob: doc.output("blob"), filename };
  }
  doc.save(filename);
}

window.PDF = { exportVisitaPDF, exportObraConsolidadoPDF };