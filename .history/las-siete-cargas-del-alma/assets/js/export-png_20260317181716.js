function exportResultPng() {
  const state = getState();
  const result = state.result;

  if (!result) {
    alert("Primero completa la evaluación para exportar la imagen.");
    return;
  }

  const svg = document.getElementById("porticoSvg");
  if (!svg) {
    alert("No se encontró el diagrama para exportar.");
    return;
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
      .label-alma{fill:#60a5fa !important;font-weight:800;}
      .label-espiritu{fill:#34d399 !important;font-weight:800;}
      .label-cimiento{fill:#facc15 !important;font-weight:800;}
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

  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clone.setAttribute("width", "860");
  clone.setAttribute("height", "420");
  clone.setAttribute("viewBox", "0 0 860 420");

  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = buildSvgCss();
  clone.insertBefore(style, clone.firstChild);

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = 860;
    canvas.height = 520;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#e5e7eb";
    ctx.font = "bold 28px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Las Siete Cargas del Alma", canvas.width / 2, 38);

    ctx.fillStyle = "#9ca3af";
    ctx.font = "16px Arial, sans-serif";
    ctx.fillText("Diagnóstico espiritual estructural", canvas.width / 2, 62);
    ctx.fillText(nowDateTimeText(), canvas.width / 2, 84);

    ctx.drawImage(img, 0, 100, 860, 420);

    ctx.fillStyle = "#e5e7eb";
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Global: ${result.overallScore}%  |  Banda: ${result.globalBand}`, 20, 505);

    canvas.toBlob(blob => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${toFileName("Las_Siete_Cargas_del_Alma_Portico")}_${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  img.onerror = function () {
    URL.revokeObjectURL(url);
    alert("No fue posible generar la imagen PNG.");
  };

  img.src = url;
}