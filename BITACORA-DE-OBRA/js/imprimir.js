'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/imprimir.js
   Propósito: impresión de la bitácora de obra
   ========================================================= */

(() => {

  function obtenerBitacora() {
    return window.BitacoraEstado?.obtener?.('bitacoraActual') || {};
  }

  function construirHTML() {

    const b = obtenerBitacora();

    return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Bitácora de Obra</title>
<style>
body{font-family:Arial,sans-serif;margin:30px;color:#222}
h1{text-align:center}
h2{margin-top:24px}
table{width:100%;border-collapse:collapse}
td,th{border:1px solid #999;padding:6px}
pre{white-space:pre-wrap;font-family:Arial}
</style>
</head>
<body>

<h1>BITÁCORA DE OBRA</h1>

<table>
<tr><th>Folio</th><td>${b.folio || ''}</td></tr>
<tr><th>Fecha</th><td>${b.informacionGeneral?.fecha || ''}</td></tr>
<tr><th>Obra</th><td>${b.obra?.nombre || ''}</td></tr>
<tr><th>Contrato</th><td>${b.obra?.numeroContrato || ''}</td></tr>
<tr><th>Contratista</th><td>${b.actores?.contratista?.nombre || ''}</td></tr>
</table>

<h2>Anotación</h2>
<pre>${b.anotacion?.contenidoTexto || ''}</pre>

</body>
</html>`;
  }

  function imprimir() {

    const ventana = window.open('', '_blank');

    if (!ventana) {
      throw new Error('No fue posible abrir la ventana de impresión.');
    }

    ventana.document.open();
    ventana.document.write(construirHTML());
    ventana.document.close();
    ventana.focus();

    setTimeout(() => {
      ventana.print();
      ventana.close();
    }, 300);

    document.dispatchEvent(
      new CustomEvent(
        'bitacora:impresion-realizada',
        {
          detail: {
            fecha: new Date().toISOString()
          }
        }
      )
    );

    return true;
  }

  window.BitacoraImprimir = Object.freeze({
    imprimir
  });

  console.info('Módulo de impresión inicializado.');

})();