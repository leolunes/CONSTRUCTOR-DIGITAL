'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/exportar-word.js
   Propósito: generación de documentos Microsoft Word
   Requiere: docx.js (https://docx.js.org/)
   ========================================================= */

(() => {

  function obtenerBitacora() {
    return window.BitacoraEstado?.obtener?.('bitacoraActual') || {};
  }

  function nombreArchivo() {
    const bitacora = obtenerBitacora();
    const folio = bitacora.folio || '0000';
    const fecha =
      bitacora.informacionGeneral?.fecha ||
      new Date().toISOString().slice(0, 10);

    return `Bitacora_Folio_${folio}_${fecha}.docx`;
  }

  async function exportarWord() {

    if (typeof window.docx === 'undefined') {
      throw new Error('La librería docx no está disponible.');
    }

    const {
      Document,
      Packer,
      Paragraph,
      HeadingLevel,
      TextRun
    } = window.docx;

    const b = obtenerBitacora();

    const documento = new Document({

      sections: [

        {

          properties: {},

          children: [

            new Paragraph({
              heading: HeadingLevel.TITLE,
              children: [
                new TextRun('BITÁCORA DE OBRA')
              ]
            }),

            new Paragraph(`Folio: ${b.folio || ''}`),
            new Paragraph(`Fecha: ${b.informacionGeneral?.fecha || ''}`),
            new Paragraph(`Obra: ${b.obra?.nombre || ''}`),
            new Paragraph(`Contrato: ${b.obra?.numeroContrato || ''}`),
            new Paragraph(`Contratista: ${b.actores?.contratista?.nombre || ''}`),

            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [
                new TextRun('ANOTACIÓN')
              ]
            }),

            new Paragraph(
              b.anotacion?.contenidoTexto || ''
            )

          ]

        }

      ]

    });

    const blob = await Packer.toBlob(documento);

    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = nombreArchivo();
    enlace.click();

    URL.revokeObjectURL(enlace.href);

    document.dispatchEvent(
      new CustomEvent(
        'bitacora:word-exportado',
        {
          detail: {
            archivo: nombreArchivo()
          }
        }
      )
    );

    return true;

  }

  window.BitacoraExportarWord = Object.freeze({
    exportar: exportarWord
  });

  console.info('Exportación Word inicializada.');

})();