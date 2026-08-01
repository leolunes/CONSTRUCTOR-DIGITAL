'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/exportar-pdf.js
   Propósito: generación de reportes PDF
   Requiere: jsPDF
   ========================================================= */

(() => {

function obtenerBitacora(){
  return window.BitacoraEstado?.obtener?.('bitacoraActual') || {};
}

function nombreArchivo(){
  const b = obtenerBitacora();
  const folio = b.folio || '0000';
  const fecha = (b.informacionGeneral?.fecha || new Date().toISOString().slice(0,10));
  return `Bitacora_Folio_${folio}_${fecha}.pdf`;
}

function exportarPDF(){

  if(typeof window.jspdf === 'undefined'){
    throw new Error('jsPDF no está disponible.');
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const b = obtenerBitacora();

  let y = 20;

  doc.setFontSize(18);
  doc.text('BITÁCORA DE OBRA', 15, y);

  y += 12;
  doc.setFontSize(11);

  doc.text(`Folio: ${b.folio || ''}`,15,y); y+=7;
  doc.text(`Fecha: ${b.informacionGeneral?.fecha || ''}`,15,y); y+=7;
  doc.text(`Obra: ${b.obra?.nombre || ''}`,15,y); y+=7;
  doc.text(`Contrato: ${b.obra?.numeroContrato || ''}`,15,y); y+=7;
  doc.text(`Contratista: ${b.actores?.contratista?.nombre || ''}`,15,y); y+=10;

  doc.setFontSize(13);
  doc.text('ANOTACIÓN',15,y);
  y+=8;

  doc.setFontSize(10);

  const texto = doc.splitTextToSize(
    b.anotacion?.contenidoTexto || '',
    180
  );

  doc.text(texto,15,y);

  doc.save(nombreArchivo());

  document.dispatchEvent(
    new CustomEvent(
      'bitacora:pdf-exportado',
      {
        detail:{
          archivo:nombreArchivo()
        }
      }
    )
  );

  return true;
}

window.BitacoraExportarPDF = Object.freeze({
  exportar: exportarPDF
});

console.info('Exportación PDF inicializada.');

})();