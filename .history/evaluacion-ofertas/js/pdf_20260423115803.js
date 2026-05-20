// ===============================
// GENERACIÓN DE PDF
// Archivo: js/pdf.js
// Requiere incluir en HTML:
// <script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js"></script>
// ===============================

import { DB } from "./db.js";
import {
  generarInformeBasico,
  generarInformeTecnicoCompleto,
  generarInformeFinalAdjudicacion,
  generarResumenEjecutivo
} from "./report.js";
import { obtenerTablaEconomica } from "./economica.js";

// ===============================
// UTILIDADES
// ===============================
function obtenerDoc() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    throw new Error("jsPDF no está cargado. Verifique las librerías en el HTML.");
  }

  return new window.jspdf.jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });
}

function dividirTexto(doc, texto, ancho = 180) {
  return doc.splitTextToSize(texto, ancho);
}

function agregarPiePagina(doc) {
  const total = doc.getNumberOfPages();

  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.text(
      `Página ${i} de ${total}`,
      105,
      290,
      { align: "center" }
    );
  }
}

function agregarEncabezado(doc, titulo) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(titulo, 105, 15, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(DB.proceso.entidad || "Entidad no registrada", 105, 22, { align: "center" });
}

function agregarBloqueTexto(doc, titulo, texto, yInicial = 30) {
  let y = yInicial;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(titulo, 15, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const lineas = dividirTexto(doc, texto, 180);
  doc.text(lineas, 15, y);

  return y + (lineas.length * 5);
}


function agregarTextoPaginadoPorBloques(doc, titulo, texto, yInicial = 30) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  let y = yInicial;
  const pageHeight = 280;

  const bloques = String(texto || "")
    .split(/\n\s*\n/)
    .map(b => b.trim())
    .filter(Boolean);

  bloques.forEach((bloque) => {
    const lineasBloque = dividirTexto(doc, bloque, 180);
    const altoBloque = lineasBloque.length * 5;

    if (y + altoBloque > pageHeight) {
      doc.addPage();
      agregarEncabezado(doc, titulo);
      y = 30;
    }

    lineasBloque.forEach((linea) => {
      doc.text(linea, 15, y);
      y += 5;
    });

    y += 4;
  });
}

function descargarPDF(doc, nombreArchivo) {
  agregarPiePagina(doc);
  doc.save(nombreArchivo);
}

function formatoMoneda(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(Number(valor) || 0);
}

// ===============================
// PDF DE INFORMACIÓN BÁSICA
// ===============================
export function generarPDFBasico() {
  try {
    const doc = obtenerDoc();
    agregarEncabezado(doc, "INFORME BÁSICO DEL PROCESO");

    const resumen = generarResumenEjecutivo();
    const texto = generarInformeBasico();

    let y = 30;

    y = agregarBloqueTexto(doc, "Resumen general", texto, y);

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Vista ejecutiva", 15, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const lineas = [
      `Proceso: ${resumen.proceso}`,
      `Objeto: ${resumen.objeto}`,
      `Presupuesto oficial: ${resumen.presupuesto}`,
      `Total ofertas: ${resumen.totalOfertas}`,
      `Aceptadas: ${resumen.aceptadas}`,
      `Rechazadas: ${resumen.rechazadas}`,
      `Pendientes: ${resumen.pendientes}`,
      `TRM: ${resumen.trm}`,
      `Método: ${resumen.metodo}`,
      `Líder: ${resumen.lider}`,
      `Puntaje líder: ${resumen.puntajeLider}`
    ];

    doc.text(lineas, 15, y);

    descargarPDF(doc, "informe_basico_proceso.pdf");
  } catch (error) {
    alert("Error al generar PDF básico: " + error.message);
  }
}

// ===============================
// PDF TÉCNICO COMPLETO
// ===============================
export function generarPDFTecnico() {
  try {
    const doc = obtenerDoc();
    agregarEncabezado(doc, "INFORME TÉCNICO DE EVALUACIÓN");

    const texto = generarInformeTecnicoCompleto();
    agregarTextoPaginadoPorBloques(doc, "INFORME TÉCNICO DE EVALUACIÓN", texto, 30);

    descargarPDF(doc, "informe_tecnico_evaluacion.pdf");
  } catch (error) {
    alert("Error al generar PDF técnico: " + error.message);
  }
}

// ===============================
// PDF FINAL DE ADJUDICACIÓN
// ===============================
export function generarPDFFinalAdjudicacion() {
  try {
    const doc = obtenerDoc();
    agregarEncabezado(doc, "INFORME FINAL DE ADJUDICACIÓN");

    const texto = generarInformeFinalAdjudicacion();
    agregarTextoPaginadoPorBloques(doc, "INFORME FINAL DE ADJUDICACIÓN", texto, 30);

    descargarPDF(doc, "informe_final_adjudicacion.pdf");
  } catch (error) {
    alert("Error al generar PDF final: " + error.message);
  }
}

// ===============================
// PDF DE RESULTADOS ECONÓMICOS CON TABLA
// ===============================
export function generarPDFResultadosEconomicos() {
  try {
    const doc = obtenerDoc();
    agregarEncabezado(doc, "RESULTADOS DE EVALUACIÓN ECONÓMICA");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(`Proceso: ${DB.proceso.nombre || "No registrado"}`, 15, 30);
    doc.text(`Entidad: ${DB.proceso.entidad || "No registrada"}`, 15, 36);
    doc.text(`Puntaje máximo: ${DB.proceso.puntajeMaximo || 0}`, 15, 42);

    const total = DB.ofertas.length;
    const eliminadas = DB.ofertas.filter(o => String(o.observacion || "").toUpperCase() === "ELIMINADA").length;
    const habilitadas = DB.ofertas.filter(o => String(o.observacion || "").toUpperCase() !== "ELIMINADA").length;

    doc.text(`Total ofertas: ${total}`, 120, 30);
    doc.text(`Hábiles: ${habilitadas}`, 120, 36);
    doc.text(`Eliminadas: ${eliminadas}`, 120, 42);

    // 🔥 NUEVA TABLA COMPLETA
    const ofertas = DB.ofertas
      .filter(o => String(o.observacion || "").toUpperCase() !== "ELIMINADA")
      .sort((a, b) => Number(a.rankingFinal || 0) - Number(b.rankingFinal || 0));

    const body = ofertas.map(o => [
      o.rankingFinal || "-",
      o.empresa || "",
      formatoMoneda(o.oferta),
      Number(o.puntaje || 0).toFixed(4),
      Number(o.puntajeCalidad || 0).toFixed(2),
      Number(o.puntajeIndustria || 0).toFixed(2),
      Number(o.puntajeDiscapacidad || 0).toFixed(2),
      Number(o.puntajeMujer || 0).toFixed(2),
      Number(o.puntajeMipyme || 0).toFixed(2),
      Number(o.puntajeTotal || 0).toFixed(4)
    ]);

    if (doc.autoTable) {
      doc.autoTable({
        startY: 50,
        styles: { fontSize: 7, cellWidth: "wrap" },
        head: [[
          "RANKING",
          "PROPONENTE",
          "VALOR OFERTA",
          "PUNTAJE
VALOR OFERTA",
          "PUNTAJE
FACTOR DE
CALIDAD",
          "PUNTAJE
APOYO
INDUSTRIA
NACIONAL",
          "PUNTAJE
VINCULACIÓN
PERSONAS CON
DISCAPACIDAD",
          "PUNTAJE
EMPRENDIMIENTOS
Y EMPRESAS DE
MUJERES",
          "PUNTAJE
MIPYME",
          "PUNTAJE
TOTAL"
        ]],
        body
      });
    } else {
      doc.text("No se pudo crear la tabla.", 15, 55);
    }

    descargarPDF(doc, "resultados_evaluacion_economica.pdf");
  } catch (error) {
    alert("Error al generar PDF económico: " + error.message);
  }
}

    descargarPDF(doc, "resultados_evaluacion_economica.pdf");
  } catch (error) {
    alert("Error al generar PDF económico: " + error.message);
  }
}

// ===============================
// PDF DE DETALLE DE OFERTAS
// ===============================
export function generarPDFDetalleOfertas() {
  try {
    const doc = obtenerDoc();
    agregarEncabezado(doc, "DETALLE DE OFERTAS REGISTRADAS");

    const body = DB.ofertas.map((oferta, index) => [
      index + 1,
      oferta.empresa || "Sin nombre",
      formatoMoneda(oferta.oferta),
      oferta.clasificacionInicial || "No evaluada",
      oferta.estado || "PENDIENTE"
    ]);

    if (doc.autoTable) {
      doc.autoTable({
        startY: 30,
        head: [["No.", "Empresa", "Oferta", "Clasificación inicial", "Estado final"]],
        body
      });
    } else {
      doc.text("La librería autoTable no está cargada. No se pudo crear la tabla.", 15, 35);
    }

    descargarPDF(doc, "detalle_ofertas_registradas.pdf");
  } catch (error) {
    alert("Error al generar PDF de detalle de ofertas: " + error.message);
  }
}

// ===============================
// GENERADOR GENÉRICO POR TIPO
// ===============================
export function generarPDFPorTipo(tipo = "basico") {
  switch (tipo) {
    case "basico":
      generarPDFBasico();
      break;
    case "tecnico":
      generarPDFTecnico();
      break;
    case "adjudicacion":
      generarPDFFinalAdjudicacion();
      break;
    case "economico":
      generarPDFResultadosEconomicos();
      break;
    case "ofertas":
      generarPDFDetalleOfertas();
      break;
    default:
      alert("Tipo de PDF no reconocido");
      break;
  }
}
