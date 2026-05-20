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

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
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
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Las Siete Cargas del Alma", canvas.width / 2, 38);

    ctx.fillStyle = "#9ca3af";
    ctx.font = "16px system-ui, sans-serif";
    ctx.fillText("Diagnóstico espiritual estructural", canvas.width / 2, 62);
    ctx.fillText(nowDateTimeText(), canvas.width / 2, 84);

    ctx.drawImage(img, 0, 100, 860, 420);

    ctx.fillStyle = "#e5e7eb";
    ctx.font = "bold 18px system-ui, sans-serif";
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