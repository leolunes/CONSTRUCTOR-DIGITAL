(function () {

  function safe(value, fallback = "") {
    return value === undefined || value === null ? fallback : String(value);
  }

  function money(value) {
    const n = Number(value || 0);
    return "$ " + n.toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  function sanitizeName(text) {
    return String(text || "reporte")
      .replace(/[^\w\d]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80) || "reporte";
  }

  function buildFileName(data) {
    const contrato = data?.contrato?.numero || "Contrato";
    const nombre = data?.contrato?.nombre || "Auditoria";
    return (
      "Informe_Auditoria_" +
      sanitizeName(contrato) +
      "_" +
      sanitizeName(nombre) +
      ".pdf"
    );
  }

  function requireJsPDF() {
    if (window.jspdf && window.jspdf.jsPDF) {
      return window.jspdf.jsPDF;
    }
    if (window.jsPDF) {
      return window.jsPDF;
    }
    return null;
  }

  function addSectionTitle(doc, text, y) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(text, 14, y);
    return y + 6;
  }

  function addParagraph(doc, text, y, maxWidth = 180, lineHeight = 5) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const lines = doc.splitTextToSize(String(text || ""), maxWidth);
    doc.text(lines, 14, y);

    return y + (lines.length * lineHeight);
  }

  function ensurePage(doc, y, minBottom = 270) {
    if (y > minBottom) {
      doc.addPage();
      return 20;
    }
    return y;
  }

  function addKeyValue(doc, label, value, y) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(label, 14, y);

    doc.setFont("helvetica", "normal");
    doc.text(String(value || ""), 60, y);

    return y + 6;
  }

  function generateSimpleTable(doc, headers, rows, y) {
    const startX = 14;
    const widths = [42, 42, 42, 42];
    const rowHeight = 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    let x = startX;
    headers.forEach((h, i) => {
      doc.rect(x, y - 5, widths[i], rowHeight);
      doc.text(String(h), x + 2, y);
      x += widths[i];
    });

    y += rowHeight;

    doc.setFont("helvetica", "normal");

    rows.forEach(row => {
      x = startX;

      row.forEach((cell, i) => {
        doc.rect(x, y - 5, widths[i], rowHeight);
        const text = doc.splitTextToSize(String(cell || ""), widths[i] - 4);
        doc.text(text, x + 2, y);
        x += widths[i];
      });

      y += rowHeight;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    return y + 4;
  }

  function buildCrucesRows(data) {
    const cruces = Array.isArray(data?.cruces) ? data.cruces : [];
    return cruces.map(item => [
      safe(item.componente),
      money(item.esperado),
      money(item.real),
      safe((Number(item.porcentaje || 0)).toFixed(2) + " %")
    ]);
  }

  function buildAlertasRows(data) {
    const alertas = Array.isArray(data?.alertas) ? data.alertas : [];
    return alertas.map(item => [
      safe(item.nivel),
      safe(item.titulo),
      safe(item.origen),
      safe(item.detalle).slice(0, 45)
    ]);
  }

  function generateReport(data) {
    const JsPDF = requireJsPDF();

    if (!JsPDF) {
      alert(
        "No se encontró la librería jsPDF. Para exportar PDF, primero debemos integrarla en la app."
      );
      return;
    }

    const doc = new JsPDF({ unit: "mm", format: "a4" });
    let y = 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("INFORME DE AUDITORÍA TÉCNICO-CONTABLE", 14, y);

    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Aplicación: Auditoría Forense de Obra", 14, y);

    y += 10;
    y = addSectionTitle(doc, "1. Información general del contrato", y);

    y = addKeyValue(doc, "Número:", safe(data?.contrato?.numero), y);
    y = addKeyValue(doc, "Nombre:", safe(data?.contrato?.nombre), y);
    y = addKeyValue(doc, "Entidad:", safe(data?.contrato?.entidad), y);
    y = addKeyValue(doc, "Contratista:", safe(data?.contrato?.contratista), y);
    y = addKeyValue(doc, "Ubicación:", safe(data?.contrato?.ubicacion), y);
    y = addKeyValue(doc, "Valor:", money(data?.contrato?.valor), y);
    y = addKeyValue(doc, "Plazo:", safe(data?.contrato?.plazo) + " meses", y);

    y += 4;
    y = ensurePage(doc, y);

    y = addSectionTitle(doc, "2. Resumen técnico esperado", y);
    y = addKeyValue(doc, "Materiales:", money(data?.tecnico?.materiales), y);
    y = addKeyValue(doc, "Mano de obra:", money(data?.tecnico?.manoObra), y);
    y = addKeyValue(doc, "Equipos:", money(data?.tecnico?.equipos), y);
    y = addKeyValue(doc, "Transportes:", money(data?.tecnico?.transportes), y);
    y = addKeyValue(doc, "Otros:", money(data?.tecnico?.otros), y);
    y = addKeyValue(doc, "Total técnico:", money(data?.tecnico?.total), y);

    y += 4;
    y = ensurePage(doc, y);

    y = addSectionTitle(doc, "3. Resumen de facturación registrada", y);
    y = addKeyValue(doc, "Materiales:", money(data?.facturacion?.materiales), y);
    y = addKeyValue(doc, "Mano de obra:", money(data?.facturacion?.manoObra), y);
    y = addKeyValue(doc, "Equipos:", money(data?.facturacion?.equipos), y);
    y = addKeyValue(doc, "Transportes:", money(data?.facturacion?.transportes), y);
    y = addKeyValue(doc, "Otros:", money(data?.facturacion?.otros), y);
    y = addKeyValue(doc, "IVA:", money(data?.facturacion?.iva), y);
    y = addKeyValue(doc, "Total facturado:", money(data?.facturacion?.total), y);

    y += 4;
    y = ensurePage(doc, y);

    y = addSectionTitle(doc, "4. Análisis narrativo", y);
    y = addParagraph(
      doc,
      safe(data?.narrativa, "No se generó narrativa del análisis."),
      y,
      180,
      5
    );

    y += 5;
    y = ensurePage(doc, y);

    y = addSectionTitle(doc, "5. Cruce técnico vs facturación", y);
    y = generateSimpleTable(
      doc,
      ["Componente", "Esperado", "Real", "Desviación"],
      buildCrucesRows(data),
      y + 2
    );

    y = ensurePage(doc, y);

    y = addSectionTitle(doc, "6. Alertas detectadas", y);
    const alertRows = buildAlertasRows(data);
    if (alertRows.length) {
      y = generateSimpleTable(
        doc,
        ["Nivel", "Código", "Origen", "Detalle"],
        alertRows,
        y + 2
      );
    } else {
      y = addParagraph(doc, "No se registran alertas para este contrato.", y + 2);
    }

    y += 6;
    y = ensurePage(doc, y);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text(
      "Generado por Auditoría Forense de Obra - " + new Date().toLocaleString("es-CO"),
      14,
      Math.min(y, 285)
    );

    doc.save(buildFileName(data));
  }

  window.AFOPDF = {
    generateReport
  };

})();