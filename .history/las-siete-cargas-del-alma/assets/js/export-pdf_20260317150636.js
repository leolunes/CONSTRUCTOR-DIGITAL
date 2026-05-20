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
  const pageH = doc.internal.pageSize.getHeight();
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
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
  }

  // PORTADA
  addTitle("Las Siete Cargas del Alma", "Diagnóstico espiritual estructural");
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Autor base doctrinal: Leonard Moon`, pageW / 2, 40, { align: "center" });
  doc.text(`Fecha del diagnóstico: ${result.computedAt}`, pageW / 2, 47, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(`Puntaje global: ${result.overallScore}%`, pageW / 2, 62, { align: "center" });
  doc.text(`Banda: ${result.globalBand}`, pageW / 2, 70, { align: "center" });
  doc.text(`Carga dominante: ${safeText(result.dominant?.title)}`, pageW / 2, 78, { align: "center" });

  // Imagen del pórtico
  const svg = document.getElementById("porticoSvg");
  if (svg) {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    }).catch(() => null);

    if (img) {
      const canvas = document.createElement("canvas");
      canvas.width = 860;
      canvas.height = 420;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, 860, 420);
      const png = canvas.toDataURL("image/png");
      doc.addImage(png, "PNG", 15, 90, 180, 88);
    }
    URL.revokeObjectURL(url);
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
    body: result.sections.map(s => [s.title, `${s.percent}%`, s.level, s.verse || "—"]),
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

  // Página 3 Plan de 7 días
  doc.addPage();
  y = 18;
  addSectionTitle("Plan de transferencia de cargas — 7 días", y);
  y += 8;

  buildPlannerDays(result).forEach(day => {
    if (y > 255) {
      doc.addPage();
      y = 18;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(day.title, margin, y);
    y += 6;
    y = addParagraph(`Verso: ${day.verse}`, margin, y, 180, 5);
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
        body: compare.rows.map(r => [r.title, `${r.before}%`, `${r.after}%`, `${r.delta > 0 ? "+" : ""}${r.delta}%`]),
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fontStyle: "bold" }
      });
    }
  }

  doc.save(`${toFileName("Las_Siete_Cargas_del_Alma_Diagnostico")}_${Date.now()}.pdf`);
}