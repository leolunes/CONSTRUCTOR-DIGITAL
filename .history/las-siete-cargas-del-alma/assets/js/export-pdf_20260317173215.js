async function exportResultPdf() {
  const state = getState();
  const result = state.result;

  if (!result) {
    alert("Primero completa la evaluación para exportar el PDF.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;

  function addTitle(title, subtitle = "") {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(title, pageW / 2, 22, { align: "center" });

    if (subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(subtitle, pageW / 2, 30, { align: "center" });
    }
  }

  function addSectionTitle(text, y) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(text, margin, y);
  }

  function addParagraph(text, x, y, maxWidth = 180, lineHeight = 6) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(String(text || ""), maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
  }

  function buildSvgCss() {
    return `
      .svg-bg{fill:#020617;}
      .struct-line{stroke:#64748b;}
      .viga-line{stroke:#3b82f6;}
      .columna-line{stroke:#22c55e;}
      .cimiento-line{stroke:#eab308;}
      .previous-line{stroke:#94a3b8;stroke-dasharray:8;}
      .struct-label{fill:#e5e7eb;font-size:12px;text-anchor:middle;font-family:Arial,Helvetica,sans-serif;}
      .struct-sub-label{fill:#9ca3af;font-size:10px;text-anchor:middle;font-family:Arial,Helvetica,sans-serif;}
      .node-circle{fill:#ffffff;}
      .node-halo{fill:rgba(59,130,246,0.2);}
      .load-block{fill:#374151;}
      .load-text{fill:#e5e7eb;font-size:11px;text-anchor:middle;font-family:Arial,Helvetica,sans-serif;}
      .load-ok{fill:#15803d;}
      .load-warn{fill:#d97706;}
      .load-risk{fill:#ea580c;}
      .load-critical{fill:#dc2626;}
      .load-neutral{fill:#374151;}
      .state-ok{stroke:#16a34a;}
      .state-warn{stroke:#eab308;}
      .state-risk{stroke:#f97316;}
      .state-critical{stroke:#ef4444;}
      .vertical-label{text-anchor:start;}
      .load-arrow{stroke-width:5;stroke-linecap:round;}
      .live-arrow{stroke:#22c55e;}
      .dead-arrow{stroke:#ef4444;}
      .seismic-arrow{stroke:#94a3b8;}
      .live-arrow-head{fill:#22c55e;}
      .dead-arrow-head{fill:#ef4444;}
      .seismic-arrow-head{fill:#94a3b8;}
      .arrow-label{fill:#cbd5e1;font-size:11px;text-anchor:middle;font-family:Arial,Helvetica,sans-serif;}
      .support-line{stroke:#475569;}
      .guided-focus{stroke:#ffffff !important;stroke-width:26 !important;}
      .hidden{display:none !important;}
      text{dominant-baseline:middle;}
    `;
  }

  async function svgElementToPngDataUrl(svgEl, width = 860, height = 420) {
    const clone = svgEl.cloneNode(true);

    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height));
    clone.setAttribute("viewBox", "0 0 860 420");

    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = buildSvgCss();
    clone.insertBefore(style, clone.firstChild);

    const serialized = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    try {
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
      });

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      return canvas.toDataURL("image/png");
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  // PORTADA
  addTitle("Las Siete Cargas del Alma", "Diagnóstico espiritual estructural");
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Autor base doctrinal: Leonard Moon", pageW / 2, 40, { align: "center" });
  doc.text(`Fecha del diagnóstico: ${result.computedAt}`, pageW / 2, 47, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(`Puntaje global: ${result.overallScore}%`, pageW / 2, 62, { align: "center" });
  doc.text(`Banda: ${result.globalBand}`, pageW / 2, 70, { align: "center" });
  doc.text(`Carga dominante: ${safeText(result.dominant?.title)}`, pageW / 2, 78, { align: "center" });

  // Imagen del pórtico
  const svg = document.getElementById("porticoSvg");
  if (svg) {
    try {
      const pngDataUrl = await svgElementToPngDataUrl(svg, 860, 420);
      doc.addImage(pngDataUrl, "PNG", 15, 90, 180, 88);
    } catch (error) {
      console.error("Error exportando SVG al PDF:", error);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("No fue posible renderizar el diagrama en la portada.", pageW / 2, 130, { align: "center" });
    }
  }

  // Página 2
  doc.addPage();
  let y = 18;
  addSectionTitle("Diagnóstico principal", y);
  y += 8;
  y = addParagraph(getGlobalDiagnosticText(result), margin, y);

  y += 4;
  addSectionTitle("Observación estructural", y);
  y += 8;
  y = addParagraph(getStructuralObservationText(result), margin, y);

  y += 4;
  addSectionTitle("Tabla de cargas", y);
  y += 6;

  doc.autoTable({
    startY: y,
    theme: "plain",
    head: [["Carga", "Puntaje", "Nivel", "Verso"]],
    body: result.sections.map(s => {
      const meta = getSectionMeta(s.sectionId);
      const verseFull = meta?.verse && meta?.verseText
        ? `${meta.verse} — “${meta.verseText}”`
        : (s.verse || "—");
      return [s.title, `${s.percent}%`, s.level, verseFull];
    }),
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fontStyle: "bold" }
  });

  y = doc.lastAutoTable.finalY + 8;
  addSectionTitle("Ruta pastoral sugerida", y);
  y += 8;

  getRouteActions(result).forEach(item => {
    y = addParagraph(`• ${item.title}: ${item.text}`, margin, y, 180, 5.5);
    y += 1;
    if (y > 270) {
      doc.addPage();
      y = 18;
    }
  });

  // Página 3 - Plan de 7 días
  doc.addPage();
  y = 18;
  addSectionTitle("Plan de transferencia de cargas — 7 días", y);
  y += 8;

  buildPlannerDays(result).forEach(day => {
    if (y > 255) {
      doc.addPage();
      y = 18;
    }

    const sectionMeta = getSectionMeta(day.id);
    const verseFull = sectionMeta?.verse && sectionMeta?.verseText
      ? `${sectionMeta.verse} — “${sectionMeta.verseText}”`
      : day.verse;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(day.title, margin, y);
    y += 6;

    y = addParagraph(`Verso: ${verseFull}`, margin, y, 180, 5);
    y = addParagraph(`Enseñanza: ${day.teaching}`, margin, y, 180, 5);
    y = addParagraph(`Acción práctica: ${day.action}`, margin, y, 180, 5);
    y = addParagraph(`Oración: ${day.prayer}`, margin, y, 180, 5);
    y += 4;
  });

  // Comparación
  if (state.previousResult) {
    const compare = buildCompareData(result, state.previousResult);
    if (compare) {
      doc.addPage();
      y = 18;
      addSectionTitle("Comparación antes / después", y);
      y += 10;

      y = addParagraph(`Medición anterior: ${compare.previousDate}`, margin, y);
      y = addParagraph(`Medición actual: ${compare.currentDate}`, margin, y);
      y = addParagraph(`Variación global: ${compare.globalDelta > 0 ? "+" : ""}${compare.globalDelta}%`, margin, y);

      doc.autoTable({
        startY: y + 4,
        theme: "plain",
        head: [["Carga", "Antes", "Después", "Variación"]],
        body: compare.rows.map(r => [
          r.title,
          `${r.before}%`,
          `${r.after}%`,
          `${r.delta > 0 ? "+" : ""}${r.delta}%`
        ]),
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fontStyle: "bold" }
      });
    }
  }

  doc.save(`${toFileName("Las_Siete_Cargas_del_Alma_Diagnostico")}_${Date.now()}.pdf`);
}