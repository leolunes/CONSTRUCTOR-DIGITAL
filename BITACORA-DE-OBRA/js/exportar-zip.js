'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/exportar-zip.js
   Propósito: generar un respaldo ZIP del proyecto
   Requiere: JSZip
   ========================================================= */

(() => {

  function nombreArchivo() {
    const fecha = new Date().toISOString().replace(/[:.]/g, '-');
    return `Bitacora_Obra_${fecha}.zip`;
  }

  async function exportarZIP() {

    if (typeof window.JSZip === 'undefined') {
      throw new Error('La librería JSZip no está disponible.');
    }

    const zip = new window.JSZip();

    const baseDatos =
      window.BitacoraBaseDatos?.exportarJSON?.() || '{}';

    zip.file('base-datos.json', baseDatos);

    const copias =
      window.BitacoraCopiasSeguridad?.exportarListado?.() || '[]';

    zip.file('copias-seguridad.json', copias);

    const manifiesto = {
      aplicacion: 'Bitácora de Obra',
      version: 1,
      fechaExportacion: new Date().toISOString(),
      contenido: [
        'base-datos.json',
        'copias-seguridad.json'
      ]
    };

    zip.file(
      'manifiesto.json',
      JSON.stringify(manifiesto, null, 2)
    );

    const blob = await zip.generateAsync({
      type: 'blob'
    });

    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = nombreArchivo();
    enlace.click();

    URL.revokeObjectURL(enlace.href);

    document.dispatchEvent(
      new CustomEvent(
        'bitacora:zip-exportado',
        {
          detail: {
            archivo: nombreArchivo()
          }
        }
      )
    );

    return true;
  }

  window.BitacoraExportarZIP = Object.freeze({
    exportar: exportarZIP
  });

  console.info('Exportación ZIP inicializada.');

})();