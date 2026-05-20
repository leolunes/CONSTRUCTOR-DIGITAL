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
import { obtenerTablaEconomica, simularEvaluacionEconomica, simularEscenarioGanadorDinamico } from "./economica.js";

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

    const tabla = obtenerTablaEconomica();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(`Proceso: ${DB.proceso.nombre || "No registrado"}`, 15, 30);
    doc.text(`Entidad: ${DB.proceso.entidad || "No registrada"}`, 15, 36);
    doc.text(`Puntaje máximo: ${DB.proceso.puntajeMaximo || 0}`, 15, 42);
    // 🔥 RESUMEN DASHBOARD
    const total = DB.ofertas.length;
    const alerta = DB.ofertas.filter(o => o.requiereSustentacion).length;
    const eliminadas = DB.ofertas.filter(o => String(o.observacion || "").toUpperCase() === "ELIMINADA").length;
    const habilitadas = DB.ofertas.filter(o => String(o.observacion || "").toUpperCase() !== "ELIMINADA").length;

    doc.text(`Total ofertas: ${total}`, 120, 30);
    doc.text(`En alerta OAB: ${alerta}`, 120, 36);
    doc.text(`Hábiles final: ${habilitadas}`, 120, 42);
    doc.text(`Eliminadas: ${eliminadas}`, 120, 48);


    const body = tabla.map(item => [
      item.ranking,
      item.empresa,
      formatoMoneda(item.oferta),
      item.puntaje
    ]);

    if (doc.autoTable) {
      doc.autoTable({
        startY: 54,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: "linebreak",
          valign: "middle"
        },
        headStyles: {
          halign: "center",
          valign: "middle"
        },
        columnStyles: {
          0: { cellWidth: 18, halign: "center" },
          1: { cellWidth: 78 },
          2: { cellWidth: 42, halign: "right" },
          3: { cellWidth: 38, halign: "center" }
        },
        head: [[
          "RANKING",
          "PROPONENTE",
          "VALOR OFERTA",
          "PUNTAJE\nVALOR OFERTA"
        ]],
        body
      });
    } else {
      doc.text("La librería autoTable no está cargada. No se pudo crear la tabla.", 15, 55);
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


// ===============================
// PDF SIMULACIÓN DE FÓRMULAS
// ===============================
export function generarPDFSimulacion() {
  try {
    const select = document.getElementById("selectSimulacionMetodo");
    if (!select || !select.value) {
      alert("Seleccione una fórmula para simular.");
      return;
    }

    const metodo = select.value;
    const resultado = simularEvaluacionEconomica(metodo);

    const doc = obtenerDoc();
    agregarEncabezado(doc, "SIMULACIÓN DE EVALUACIÓN ECONÓMICA");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(`Proceso: ${DB.proceso.nombre || "No registrado"}`, 15, 30);
    doc.text(`Método simulado: ${resultado.nombreMetodo}`, 15, 36);

    const body = resultado.tabla.map(item => [
      item.ranking,
      item.empresa,
      formatoMoneda(item.oferta),
      item.puntaje.toFixed(4)
    ]);

    if (doc.autoTable) {
      doc.autoTable({
        startY: 44,
        head: [[
          "RANKING",
          "PROPONENTE",
          "VALOR OFERTA",
          "PUNTAJE"
        ]],
        body
      });
    }

    descargarPDF(doc, "simulacion_evaluacion_economica.pdf");

  } catch (error) {
    alert("Error en PDF simulación: " + error.message);
  }
}

// ===============================
// PDF ANÁLISIS ESTRATÉGICO PROFESIONAL
// ===============================
export function generarPDFSimulacionEstrategica(idProponente) {
  try {
    const id = Number(idProponente || 0);

    if (!id) {
      alert("Seleccione un proponente para generar el análisis estratégico.");
      return;
    }

    const resultadoSim = simularEscenarioGanadorDinamico(id, 3);

    if (!resultadoSim) {
      alert("No hay información suficiente para generar el PDF estratégico.");
      return;
    }

    const doc = obtenerDoc();
    agregarEncabezado(doc, "ANÁLISIS ESTRATÉGICO DE OFERTA");

    const nombre = DB.ofertas.find(o => Number(o.id) === id)?.empresa || "Proponente no identificado";

    let y = 30;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("1. Información general", 15, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.text(`Proceso: ${DB.proceso.nombre || "No registrado"}`, 15, y); y += 5;
    doc.text(`Entidad: ${DB.proceso.entidad || "No registrada"}`, 15, y); y += 5;
    doc.text(`Proponente analizado: ${nombre}`, 15, y); y += 5;
    doc.text(`Presupuesto oficial: ${formatoMoneda(DB.proceso.presupuesto || 0)}`, 15, y); y += 5;
    doc.text(`Puntaje máximo económico: ${DB.proceso.puntajeMaximo || 0}`, 15, y); y += 5;
    doc.text(`TRM: ${DB.proceso.trm || 0}`, 15, y); y += 9;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("2. Diagnóstico estratégico", 15, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    if (resultadoSim.yaEsGanador) {
      const bases = resultadoSim.escenario?.bases || {};
      const mi = resultadoSim.escenario?.miResultado || {};

      const texto = `El proponente ${nombre} ya ocupa la posición No. 1 dentro del escenario evaluado. No se requiere simular exclusiones para alcanzar el primer lugar. La prioridad estratégica debe ser conservar la habilitación, proteger los factores de calificación obtenidos y atender oportunamente cualquier observación o requerimiento del proceso.`;

      const lineas = dividirTexto(doc, texto, 180);
      doc.text(lineas, 15, y);
      y += lineas.length * 5 + 6;

      doc.text(`Puntaje económico actual: ${Number(mi.puntaje || 0).toFixed(4)}`, 15, y); y += 5;
      doc.text(`Puntaje total actual: ${Number(mi.puntajeTotal || 0).toFixed(4)}`, 15, y); y += 8;

      doc.setFont("helvetica", "bold");
      doc.text("Bases económicas actuales:", 15, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.text(`Total ofertas evaluadas: ${bases.totalAceptadas || 0}`, 15, y); y += 5;
      doc.text(`Mediana: ${formatoMoneda(bases.mediana || 0)}`, 15, y); y += 5;
      doc.text(`VME: ${formatoMoneda(bases.vme || 0)}`, 15, y); y += 5;
      doc.text(`Media geométrica: ${formatoMoneda(bases.mediaGeometrica || 0)}`, 15, y); y += 5;
      doc.text(`Media aritmética baja: ${formatoMoneda(bases.mediaAritmeticaBaja || 0)}`, 15, y); y += 5;
      doc.text(`Menor valor: ${formatoMoneda(bases.menorValor || 0)}`, 15, y); y += 8;

      if (resultadoSim.escenario?.tabla?.length && doc.autoTable) {
        const body = resultadoSim.escenario.tabla.map(item => [
          item.rankingFinalSimulado || "",
          item.empresa || "",
          formatoMoneda(item.oferta || 0),
          Number(item.puntaje || 0).toFixed(4),
          Number(item.puntajeTotal || 0).toFixed(4)
        ]);

        doc.autoTable({
          startY: y,
          styles: {
            fontSize: 7,
            cellPadding: 2,
            overflow: "linebreak",
            valign: "middle"
          },
          headStyles: {
            halign: "center",
            valign: "middle"
          },
          columnStyles: {
            0: { cellWidth: 16, halign: "center" },
            1: { cellWidth: 72 },
            2: { cellWidth: 36, halign: "right" },
            3: { cellWidth: 30, halign: "center" },
            4: { cellWidth: 30, halign: "center" }
          },
          head: [[
            "Ranking",
            "Proponente",
            "Valor oferta",
            "Puntaje económico",
            "Puntaje total"
          ]],
          body
        });
      }

      descargarPDF(doc, "analisis_estrategico_oferta.pdf");
      return;
    }

    if (resultadoSim.encontrado) {
      const escenario = resultadoSim.escenario || {};
      const bases = escenario.bases || {};
      const mi = escenario.miResultado || {};
      const liderActual = resultadoSim.liderActual || {};
      const ganador = escenario.ganador || mi;
      const excluidos = escenario.excluidos || [];
      const tabla = escenario.tabla || [];
      const segundo = tabla.find(o => Number(o.rankingFinalSimulado || 0) === 2);
      const margenSimulado = segundo
        ? Number(mi.puntajeTotal || 0) - Number(segundo.puntajeTotal || 0)
        : 0;

      const textoDiagnostico =
        `La simulación dinámica identifica un escenario en el cual el proponente ${nombre} alcanza la posición No. 1. Este análisis no corresponde a una simple eliminación aritmética del ranking actual; la herramienta recalcula nuevamente las bases estadísticas de la evaluación económica, los puntajes económicos, los factores adicionales y el orden proyectado del proceso.`;

      const lineasDiagnostico = dividirTexto(doc, textoDiagnostico, 180);
      doc.text(lineasDiagnostico, 15, y);
      y += lineasDiagnostico.length * 5 + 6;

      doc.text(`Posición actual: ${resultadoSim.posicionActual || "-"}`, 15, y); y += 5;
      doc.text(`Líder actual: ${liderActual.empresa || "No definido"}`, 15, y); y += 5;
      doc.text(`Brecha actual contra el líder: ${Number(resultadoSim.brechaLider || 0).toFixed(4)} puntos`, 15, y); y += 5;
      doc.text(`Viabilidad estratégica: ${resultadoSim.viabilidad || "No definida"}`, 15, y); y += 8;

      doc.setFont("helvetica", "bold");
      doc.text("3. Escenario mínimo ganador identificado", 15, y);
      y += 7;

      doc.setFont("helvetica", "normal");

      const nombresExcluidos = excluidos.map(x => x.empresa).join(", ") || "Ninguno";
      const textoEscenario =
        `Para que ${nombre} quede en posición No. 1, la simulación identifica que no deberían ser considerados los siguientes proponentes: ${nombresExcluidos}.`;

      const lineasEscenario = dividirTexto(doc, textoEscenario, 180);
      doc.text(lineasEscenario, 15, y);
      y += lineasEscenario.length * 5 + 6;

      doc.text(`Total de exclusiones simuladas: ${escenario.totalExcluidos || 0}`, 15, y); y += 5;
      doc.text(`Nueva posición proyectada: ${mi.rankingFinalSimulado || 1}`, 15, y); y += 5;
      doc.text(`Ganador proyectado: ${ganador.empresa || nombre}`, 15, y); y += 8;

      if (excluidos.length && doc.autoTable) {
        const bodyExcluidos = excluidos.map(item => [
          item.rankingActual || "",
          item.empresa || "",
          Number(item.puntajeTotal || 0).toFixed(4),
          Number(item.diferenciaContraMi || 0).toFixed(4)
        ]);

        doc.autoTable({
          startY: y,
          styles: {
            fontSize: 7,
            cellPadding: 2,
            overflow: "linebreak",
            valign: "middle"
          },
          headStyles: {
            halign: "center",
            valign: "middle"
          },
          columnStyles: {
            0: { cellWidth: 22, halign: "center" },
            1: { cellWidth: 88 },
            2: { cellWidth: 36, halign: "center" },
            3: { cellWidth: 36, halign: "center" }
          },
          head: [[
            "Posición actual",
            "Proponente no considerado",
            "Puntaje total",
            "Diferencia"
          ]],
          body: bodyExcluidos
        });

        y = doc.lastAutoTable.finalY + 10;
      }

      if (y > 235) {
        doc.addPage();
        agregarEncabezado(doc, "ANÁLISIS ESTRATÉGICO DE OFERTA");
        y = 30;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("4. Bases estadísticas recalculadas", 15, y);
      y += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      doc.text(`Total ofertas evaluadas: ${bases.totalAceptadas || 0}`, 15, y); y += 5;
      doc.text(`Mediana: ${formatoMoneda(bases.mediana || 0)}`, 15, y); y += 5;
      doc.text(`VME: ${formatoMoneda(bases.vme || 0)}`, 15, y); y += 5;
      doc.text(`Media geométrica: ${formatoMoneda(bases.mediaGeometrica || 0)}`, 15, y); y += 5;
      doc.text(`Media aritmética baja: ${formatoMoneda(bases.mediaAritmeticaBaja || 0)}`, 15, y); y += 5;
      doc.text(`Menor valor: ${formatoMoneda(bases.menorValor || 0)}`, 15, y); y += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("5. Resultado proyectado del proponente", 15, y);
      y += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      doc.text(`Valor oferta: ${formatoMoneda(mi.oferta || 0)}`, 15, y); y += 5;
      doc.text(`Puntaje valor oferta proyectado: ${Number(mi.puntaje || 0).toFixed(4)}`, 15, y); y += 5;
      doc.text(`Puntaje total proyectado: ${Number(mi.puntajeTotal || 0).toFixed(4)}`, 15, y); y += 5;
      doc.text(`Margen proyectado frente al segundo lugar: ${Number(margenSimulado || 0).toFixed(4)} puntos`, 15, y); y += 10;

      if (y > 210) {
        doc.addPage();
        agregarEncabezado(doc, "ANÁLISIS ESTRATÉGICO DE OFERTA");
        y = 30;
      }

      if (tabla.length && doc.autoTable) {
        const bodyRanking = tabla.map(item => [
          item.rankingFinalSimulado || "",
          item.empresa || "",
          formatoMoneda(item.oferta || 0),
          Number(item.puntaje || 0).toFixed(4),
          Number(item.puntajeCalidad || 0).toFixed(2),
          Number(item.puntajeIndustria || 0).toFixed(2),
          Number(item.puntajeDiscapacidad || 0).toFixed(2),
          Number(item.puntajeMujer || 0).toFixed(2),
          Number(item.puntajeMipyme || 0).toFixed(2),
          Number(item.puntajeTotal || 0).toFixed(4)
        ]);

        doc.autoTable({
          startY: y,
          styles: {
            fontSize: 5.8,
            cellPadding: 1.2,
            overflow: "linebreak",
            valign: "middle"
          },
          headStyles: {
            halign: "center",
            valign: "middle"
          },
          columnStyles: {
            0: { cellWidth: 12, halign: "center" },
            1: { cellWidth: 46 },
            2: { cellWidth: 25, halign: "right" },
            3: { cellWidth: 18, halign: "center" },
            4: { cellWidth: 16, halign: "center" },
            5: { cellWidth: 16, halign: "center" },
            6: { cellWidth: 16, halign: "center" },
            7: { cellWidth: 16, halign: "center" },
            8: { cellWidth: 16, halign: "center" },
            9: { cellWidth: 18, halign: "center" }
          },
          head: [[
            "Rank",
            "Proponente",
            "Oferta",
            "P. oferta",
            "Cal.",
            "Ind.",
            "Disc.",
            "Muj.",
            "Mip.",
            "Total"
          ]],
          body: bodyRanking
        });
      }
    } else {
      const liderActual = resultadoSim.liderActual || {};
      const superiores = resultadoSim.superiores || [];

      const textoNoEncontrado =
        `No se encontró un escenario ganador para ${nombre} excluyendo hasta tres proponentes. La viabilidad estratégica se clasifica como ${resultadoSim.viabilidad || "no definida"}. Bajo este resultado, la revisión debe enfocarse en los proponentes superiores con menor diferencia, verificando exclusivamente causales objetivas, documentos habilitantes, sustentaciones y factores de calificación.`;

      const lineas = dividirTexto(doc, textoNoEncontrado, 180);
      doc.text(lineas, 15, y);
      y += lineas.length * 5 + 6;

      doc.text(`Posición actual: ${resultadoSim.posicionActual || "-"}`, 15, y); y += 5;
      doc.text(`Líder actual: ${liderActual.empresa || "No definido"}`, 15, y); y += 5;
      doc.text(`Brecha contra el líder: ${Number(resultadoSim.brechaLider || 0).toFixed(4)} puntos`, 15, y); y += 8;

      if (superiores.length && doc.autoTable) {
        const bodySuperiores = superiores.map(item => [
          item.rankingActual || "",
          item.empresa || "",
          Number(item.puntajeTotal || 0).toFixed(4),
          Number(item.diferenciaContraMi || 0).toFixed(4)
        ]);

        doc.autoTable({
          startY: y,
          styles: {
            fontSize: 7,
            cellPadding: 2,
            overflow: "linebreak",
            valign: "middle"
          },
          headStyles: {
            halign: "center",
            valign: "middle"
          },
          head: [[
            "Posición",
            "Proponente superior",
            "Puntaje total",
            "Diferencia"
          ]],
          body: bodySuperiores
        });
      }
    }

    descargarPDF(doc, "analisis_estrategico_oferta.pdf");
  } catch (error) {
    alert("Error al generar PDF estratégico: " + error.message);
  }
}

