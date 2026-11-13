/* PDF de una sola página para las tarjetas de cumpleaños y Mi posición.
   Convierte el lienzo existente sin modificar su contenido ni el almacenamiento. */
(() => {
  'use strict';
  const ascii = str => new TextEncoder().encode(str);
  function join(parts) {
    const length = parts.reduce((n, item) => n + item.length, 0);
    const result = new Uint8Array(length);
    let cursor = 0;
    parts.forEach(item => { result.set(item, cursor); cursor += item.length; });
    return result;
  }
  function jpegBytes(canvas) {
    const encoded = atob(canvas.toDataURL('image/jpeg', 0.94).split(',')[1]);
    const bytes = new Uint8Array(encoded.length);
    for (let i = 0; i < bytes.length; i++) bytes[i] = encoded.charCodeAt(i);
    return bytes;
  }
  function canvasBlob(canvas) {
    if (!(canvas instanceof HTMLCanvasElement) || !canvas.width || !canvas.height) {
      throw new Error('La tarjeta aún no está preparada.');
    }
    const image = jpegBytes(canvas);
    // Se exporta el lienzo completo en una hoja PDF, conservando su proporción.
    const square = Math.abs(canvas.width - canvas.height) < canvas.width * 0.08;
    const pageW = 595.28, pageH = square ? 595.28 : 841.89;
    const margin = square ? 0 : 15;
    const scale = Math.min((pageW - 2 * margin) / canvas.width, (pageH - 2 * margin) / canvas.height);
    const drawW = +(canvas.width * scale).toFixed(3), drawH = +(canvas.height * scale).toFixed(3);
    const offsetX = +((pageW - drawW) / 2).toFixed(3), offsetY = +((pageH - drawH) / 2).toFixed(3);
    const draw = `q\n${drawW} 0 0 ${drawH} ${offsetX} ${offsetY} cm\n/Im0 Do\nQ\n`;
    const parts = [
      ascii('<< /Type /Catalog /Pages 2 0 R >>'),
      ascii('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
      ascii(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`),
      join([ascii(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`), image, ascii('\nendstream')]),
      ascii(`<< /Length ${ascii(draw).length} >>\nstream\n${draw}endstream`)
    ];
    const header = ascii('%PDF-1.4\n%âãÏÓ\n');
    const chunks = [header], offsets = [0];
    let position = header.length;
    parts.forEach((body, index) => {
      offsets.push(position);
      const start = ascii(`${index + 1} 0 obj\n`), end = ascii('\nendobj\n');
      chunks.push(start, body, end);
      position += start.length + body.length + end.length;
    });
    let xref = 'xref\n0 6\n0000000000 65535 f \n';
    for (let i = 1; i <= 5; i++) xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    const footer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${position}\n%%EOF`;
    return new Blob([join([...chunks, ascii(xref + footer)])], {type:'application/pdf'});
  }
  function downloadCanvas(canvas, filename) {
    const blob = canvasBlob(canvas);
    const name = String(filename || 'TARJETA-FLORIDABLANCA.pdf').replace(/\.png$/i, '.pdf');
    if (window.GironPdfPortable?.isAppleMobile?.() && window.GironPdfPortable?.open) {
      window.GironPdfPortable.open(blob, name);
      return;
    }
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = name; link.style.display = 'none';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 120000);
  }
  window.FloridablancaCanvasPDF = {canvasBlob, downloadCanvas};
})();
