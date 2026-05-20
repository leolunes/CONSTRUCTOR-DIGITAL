// ===============================
// CONTROLADOR PRINCIPAL DE LA APP
// Archivo: js/app.js
// ===============================

import {
  DB,
  PROYECTOS,
  crearNuevoProyecto,
  guardarProyectoActual,
  cargarProyecto,
  listarProyectos,
  eliminarProyecto,
  duplicarProyecto,
  buscarProyectos,
  actualizarProceso,
  agregarOferta,
  eliminarOferta,
  actualizarOferta,
  actualizarDecisionOferta,
  obtenerOfertas,
  generarLineasOfertas
} from "./db.js";

import {
  guardarDB,
  cargarDB,
  guardarManual,
  limpiarStorage
} from "./storage.js";

import {
  ejecutarEvaluacionOAB,
  obtenerLecturaOAB,
  aplicarDecisionesSugeridas
} from "./oab.js";

import {
  aplicarMetodoTRM,
  obtenerResumenTRM
} from "./trm.js";

import {
  ejecutarEvaluacionEconomica,
  simularEscenarioGanadorDinamico,
  simularMultiplesEscenarios,
  calcularValorCompetitivo,
  calcularValorCompetitivoHistorico,
  calcularFactoresEstrategicos,
  obtenerTablaEconomica,
  obtenerLecturaEconomica
} from "./economica.js";

import {
  generarInformeBasico,
  generarInformeTecnicoCompleto,
  generarInformeFinalAdjudicacion
} from "./report.js";

import {
  generarPDFBasico,
  generarPDFTecnico,
  generarPDFFinalAdjudicacion,
  generarPDFResultadosEconomicos,
  generarPDFDetalleOfertas,
  generarPDFSimulacionEstrategica
} from "./pdf.js";

// ===============================
// SELECTORES UTILITARIOS
// ===============================
function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return document.querySelectorAll(selector);
}

// ===============================
// FORMATO MONEDA
// ===============================
function formatearPesos(valor) {
  return "$ " + Number(valor || 0).toLocaleString("es-CO");
}

function limpiarNumero(valor) {
  return String(valor || "")
    .replace(/\$/g, "")
    .replace(/\s/g, "")
    .replace(/,/g, "")
    .replace(/[^0-9]/g, "");
}

function calcularPorcentajeDesviacion(oferta, presupuesto) {
  const ofertaNum = Number(oferta || 0);
  const presupuestoNum = Number(presupuesto || 0);

  if (!presupuestoNum) return "0.0%";

  const porcentaje = ((ofertaNum - presupuestoNum) / presupuestoNum) * 100;
  return `${porcentaje.toFixed(1)}%`;
}

function calcularPuntajesFactores(oferta) {
  const puntajeCalidad = oferta.cumpleCalidad ? Number(DB.proceso.puntajeCalidad || 0) : 0;
  const puntajeIndustria = oferta.cumpleIndustria ? Number(DB.proceso.puntajeIndustriaNacional || 0) : 0;
  const puntajeDiscapacidad = oferta.cumpleDiscapacidad ? Number(DB.proceso.puntajeDiscapacidad || 0) : 0;
  const puntajeMujer = oferta.cumpleMujer ? Number(DB.proceso.puntajeMujer || 0) : 0;
  const puntajeMipyme = oferta.cumpleMipyme ? Number(DB.proceso.puntajeMipyme || 0) : 0;

  return {
    puntajeCalidad,
    puntajeIndustria,
    puntajeDiscapacidad,
    puntajeMujer,
    puntajeMipyme
  };
}

function recalcularPuntajeTotalOferta(id) {
  const oferta = DB.ofertas.find(o => o.id === id);
  if (!oferta) return;

  const factores = calcularPuntajesFactores(oferta);
  const puntajeEconomico = Number(oferta.puntaje || 0);
  const puntajeTotal =
    puntajeEconomico +
    factores.puntajeCalidad +
    factores.puntajeIndustria +
    factores.puntajeDiscapacidad +
    factores.puntajeMujer +
    factores.puntajeMipyme;

  actualizarOferta(id, {
    ...factores,
    puntajeTotal: Number(puntajeTotal.toFixed(4))
  });
}

function recalcularPuntajesTotalesTodasLasOfertas() {
  DB.ofertas.forEach(oferta => {
    recalcularPuntajeTotalOferta(oferta.id);
  });

  recalcularRankingFinal();
}

function recalcularRankingFinal() {
  const ofertasValidas = [...DB.ofertas]
    .filter(o =>
      String(o.empresa || "").trim() !== "" &&
      Number(o.oferta || 0) > 0 &&
      String(o.observacion || "").trim().toUpperCase() !== "ELIMINADA"
    )
    .sort((a, b) => {
      const diffTotal = Number(b.puntajeTotal || 0) - Number(a.puntajeTotal || 0);
      if (diffTotal !== 0) return diffTotal;

      const diffEco = Number(b.puntaje || 0) - Number(a.puntaje || 0);
      if (diffEco !== 0) return diffEco;

      return Number(a.oferta || 0) - Number(b.oferta || 0);
    });

  ofertasValidas.forEach((oferta, index) => {
    actualizarOferta(oferta.id, {
      rankingFinal: index + 1
    });
  });

  DB.ofertas
    .filter(o => !ofertasValidas.some(v => v.id === o.id))
    .forEach(o => {
      actualizarOferta(o.id, {
        rankingFinal: 0
      });
    });
}

function obtenerLiderFinalNombre() {
  const lider = [...DB.ofertas]
    .filter(o => Number(o.rankingFinal || 0) === 1)
    .sort((a, b) => Number(a.rankingFinal || 0) - Number(b.rankingFinal || 0))[0];

  return lider?.empresa || "No definido";
}

function obtenerNombreMetodoLocal(metodo) {
  const nombres = {
    MEDIANA: "Mediana",
    GEOMETRICA: "Media geométrica",
    ARITMETICA_BAJA: "Media aritmética baja",
    MENOR_VALOR: "Menor valor"
  };

  return nombres[metodo] || metodo || "No definido";
}

// ===============================
// MOTOR LOCAL DE SIMULACIÓN DE FÓRMULAS
// ===============================
function redondearSim(numero, decimales = 7) {
  return Number(Number(numero || 0).toFixed(decimales));
}

function promedioSim(valores = []) {
  if (!valores.length) return 0;
  return valores.reduce((acc, v) => acc + v, 0) / valores.length;
}

function medianaSim(valores = []) {
  if (!valores.length) return 0;
  const ordenados = [...valores].sort((a, b) => a - b);
  const n = ordenados.length;
  const mitad = Math.floor(n / 2);

  if (n % 2 !== 0) return ordenados[mitad];
  return (ordenados[mitad - 1] + ordenados[mitad]) / 2;
}

function valorMedianaInferiorSim(valores = []) {
  if (!valores.length) return 0;
  const ordenados = [...valores].sort((a, b) => a - b);
  const n = ordenados.length;

  if (n % 2 !== 0) return ordenados[Math.floor(n / 2)];
  return ordenados[n / 2 - 1];
}

function mediaGeometricaSim(valores = []) {
  const positivos = valores.filter(v => Number(v) > 0);
  if (!positivos.length) return 0;

  const sumaLogs = positivos.reduce((acc, v) => acc + Math.log(v), 0);
  return Math.exp(sumaLogs / positivos.length);
}

function menorValorSim(valores = []) {
  if (!valores.length) return 0;
  return Math.min(...valores);
}

function mediaAritmeticaBajaSim(valores = []) {
  if (!valores.length) return 0;
  return (menorValorSim(valores) + promedioSim(valores)) / 2;
}

function obtenerOfertasSimulables() {
  return DB.ofertas.filter(o =>
    String(o.empresa || "").trim() !== "" &&
    Number(o.oferta || 0) > 0 &&
    String(o.observacion || "").trim().toUpperCase() !== "ELIMINADA"
  );
}

function calcularBasesSimulacion() {
  const valores = obtenerOfertasSimulables()
    .map(o => Number(o.oferta || 0))
    .filter(v => v > 0);

  return {
    totalAceptadas: valores.length,
    mediana: medianaSim(valores),
    vme: valorMedianaInferiorSim(valores),
    mediaGeometrica: mediaGeometricaSim(valores),
    mediaAritmeticaBaja: mediaAritmeticaBajaSim(valores),
    menorValor: menorValorSim(valores)
  };
}

function calcularPuntajeSimulado(oferta, metodo, puntajeMaximo, bases) {
  const vi = Number(oferta || 0);
  const max = Number(puntajeMaximo || 0);

  if (vi <= 0 || max <= 0) return 0;

  let base = 0;

  if (metodo === "MEDIANA") {
    base = bases.totalAceptadas % 2 === 0 ? bases.vme : bases.mediana;
  } else if (metodo === "GEOMETRICA") {
    base = bases.mediaGeometrica;
  } else if (metodo === "ARITMETICA_BAJA") {
    base = bases.mediaAritmeticaBaja;
  } else if (metodo === "MENOR_VALOR") {
    base = bases.menorValor;
  }

  if (base <= 0) return 0;

  if (metodo === "MENOR_VALOR") {
    return Math.max(0, redondearSim(max * (base / vi), 7));
  }

  return Math.max(0, redondearSim(max * (1 - Math.abs((base - vi) / base)), 7));
}

function simularEvaluacionEconomicaLocal(metodoSimulado) {
  const puntajeMaximo = Number(DB.proceso.puntajeMaximo || 0);
  const bases = calcularBasesSimulacion();

  const tabla = obtenerOfertasSimulables()
    .map(oferta => {
      const factores = calcularPuntajesFactores(oferta);
      const puntaje = calcularPuntajeSimulado(oferta.oferta, metodoSimulado, puntajeMaximo, bases);
      const puntajeTotal =
        Number(puntaje || 0) +
        Number(factores.puntajeCalidad || 0) +
        Number(factores.puntajeIndustria || 0) +
        Number(factores.puntajeDiscapacidad || 0) +
        Number(factores.puntajeMujer || 0) +
        Number(factores.puntajeMipyme || 0);

      return {
        id: oferta.id,
        empresa: oferta.empresa,
        oferta: oferta.oferta,
        puntaje,
        puntajeCalidad: factores.puntajeCalidad,
        puntajeIndustria: factores.puntajeIndustria,
        puntajeDiscapacidad: factores.puntajeDiscapacidad,
        puntajeMujer: factores.puntajeMujer,
        puntajeMipyme: factores.puntajeMipyme,
        puntajeTotal: Number(puntajeTotal.toFixed(4))
      };
    })
    .sort((a, b) => {
      const diffTotal = Number(b.puntajeTotal || 0) - Number(a.puntajeTotal || 0);
      if (diffTotal !== 0) return diffTotal;

      const diffEco = Number(b.puntaje || 0) - Number(a.puntaje || 0);
      if (diffEco !== 0) return diffEco;

      return Number(a.oferta || 0) - Number(b.oferta || 0);
    })
    .map((item, index) => ({
      ...item,
      ranking: index + 1
    }));

  return {
    metodo: metodoSimulado,
    nombreMetodo: obtenerNombreMetodoLocal(metodoSimulado),
    tabla,
    mejorOferta: tabla.length ? tabla[0] : null,
    bases
  };
}

// ===============================
// INICIALIZACIÓN
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  cargarDB();
  inicializarGestionProyectos();
  inicializarFormularioProceso();
  inicializarFormularioOfertas();
  inicializarAccionesEvaluacion();
  inicializarBotonesPDF();
  inicializarSimulacionFormulas();
  inicializarSecopYDocumentos();
  inicializarAnalisisEstrategico();
  inicializarValorCompetitivo();
  inicializarValorCompetitivoHistorico();
  inicializarFactoresEstrategicos();
  renderTodo();
});

// ===============================
// FORMULARIO DEL PROCESO
// ===============================
function inicializarFormularioProceso() {
  const campos = [
    "#procesoNombre",
    "#procesoObjeto",
    "#procesoEntidad",
    "#procesoTRM",
    "#procesoPuntajeMaximo",
    "#procesoNumeroPropuestas",
    "#procesoFecha",
    "#procesoUrlSecop",
    "#procesoObservaciones",

    "#procesoPuntajeCalidad",
    "#procesoPuntajeIndustria",
    "#procesoPuntajeDiscapacidad",
    "#procesoPuntajeMujer",
    "#procesoPuntajeMipyme"
  ];

  campos.forEach(selector => {
    const el = $(selector);
    if (!el) return;

    el.addEventListener("input", () => {
      actualizarProcesoDesdeUI();
      renderOfertas();
    });

    el.addEventListener("change", () => {
      actualizarProcesoDesdeUI();
      renderOfertas();
    });
  });

  const inputPresupuesto = $("#procesoPresupuesto");
  if (inputPresupuesto) {
    inputPresupuesto.type = "text";
    inputPresupuesto.inputMode = "numeric";

    inputPresupuesto.addEventListener("focus", () => {
      inputPresupuesto.value = DB.proceso.presupuesto ? String(DB.proceso.presupuesto) : "";
    });

    inputPresupuesto.addEventListener("input", () => {
      actualizarProcesoDesdeUI();
      renderOfertas();
    });

    inputPresupuesto.addEventListener("change", () => {
      actualizarProcesoDesdeUI();
      renderOfertas();
    });

    inputPresupuesto.addEventListener("blur", () => {
      actualizarProcesoDesdeUI();
      inputPresupuesto.value = DB.proceso.presupuesto
        ? formatearPesos(DB.proceso.presupuesto)
        : "";
      renderResumenProceso();
    });
  }
}

function actualizarProcesoDesdeUI() {
  actualizarProceso({
    nombre: $("#procesoNombre")?.value || "",
    objeto: $("#procesoObjeto")?.value || "",
    entidad: $("#procesoEntidad")?.value || "",
    presupuesto: Number(limpiarNumero($("#procesoPresupuesto")?.value || 0) || 0),
    trm: Number($("#procesoTRM")?.value || 0),
    puntajeMaximo: Number($("#procesoPuntajeMaximo")?.value || 0),

    puntajeCalidad: Number($("#procesoPuntajeCalidad")?.value || 0),
    puntajeIndustriaNacional: Number($("#procesoPuntajeIndustria")?.value || 0),
    puntajeDiscapacidad: Number($("#procesoPuntajeDiscapacidad")?.value || 0),
    puntajeMujer: Number($("#procesoPuntajeMujer")?.value || 0),
    puntajeMipyme: Number($("#procesoPuntajeMipyme")?.value || 0),
    numeroPropuestasHabilitadas: Number($("#procesoNumeroPropuestas")?.value || 0),
    fechaEvaluacion: $("#procesoFecha")?.value || "",
    urlSecop: $("#procesoUrlSecop")?.value || "",
    observaciones: $("#procesoObservaciones")?.value || ""
  });

  recalcularPuntajesTotalesTodasLasOfertas();
  guardarDB();
  renderResumenProceso();
}

// ===============================
// FORMULARIO DE OFERTAS
// ===============================
function inicializarFormularioOfertas() {
  const btnAgregar = $("#btnAgregarOferta");
  const btnGenerarLineas = $("#btnGenerarLineas");
  const btnImportarExcel = $("#btnImportarExcel");
  const btnLimpiarListado = $("#btnLimpiarListadoOfertas");

  const modo = $("#modoIngresoOfertas");
  const bloqueManual = $("#bloqueManual");
  const bloqueLineas = $("#bloqueGenerarLineas");
  const bloqueExcel = $("#bloqueImportarExcel");

  function actualizarModoIngreso() {
    const valor = modo?.value || "manual";

    if (bloqueManual) bloqueManual.style.display = valor === "manual" ? "block" : "none";
    if (bloqueLineas) bloqueLineas.style.display = valor === "lineas" ? "block" : "none";
    if (bloqueExcel) bloqueExcel.style.display = valor === "excel" ? "block" : "none";
  }

  if (modo) {
    modo.addEventListener("change", actualizarModoIngreso);
    actualizarModoIngreso();
  }

  if (btnAgregar) {
    btnAgregar.addEventListener("click", () => {
      const empresa = $("#empresaOferta")?.value?.trim() || "";
      const valor = Number($("#valorOferta")?.value || 0);

      if (!empresa || valor <= 0) {
        alert("Debe ingresar el nombre del proponente y un valor de oferta válido.");
        return;
      }

      agregarOferta(empresa, valor);

      if ($("#empresaOferta")) $("#empresaOferta").value = "";
      if ($("#valorOferta")) $("#valorOferta").value = "";

      guardarDB();
      renderOfertas();
    });
  }

  if (btnGenerarLineas) {
    btnGenerarLineas.addEventListener("click", () => {
      const total = Number($("#procesoNumeroPropuestas")?.value || 0);

      if (total <= 0) {
        alert("Debe registrar un número válido de propuestas habilitadas.");
        return;
      }

      generarLineasOfertas(total);
      guardarDB();
      renderOfertas();
    });
  }

  if (btnImportarExcel) {
    btnImportarExcel.addEventListener("click", () => {
      importarExcel();
    });
  }

  if (btnLimpiarListado) {
    btnLimpiarListado.addEventListener("click", () => {
      const confirmar = confirm("¿Desea eliminar todo el listado de ofertas?");
      if (!confirmar) return;

      DB.ofertas = [];
      guardarDB();
      renderOfertas();
      renderOAB();
      renderEconomica();
    });
  }
}

// ===============================
// ACCIONES DE EVALUACIÓN
// ===============================
function inicializarAccionesEvaluacion() {
  $("#btnEvaluarOAB")?.addEventListener("click", () => {
    ejecutarEvaluacionOAB(0.2);
    guardarDB();
    renderOAB();
    renderOfertas();
  });

  $("#btnAplicarDecisiones")?.addEventListener("click", () => {
    aplicarDecisionesSugeridas();
    guardarDB();
    renderOfertas();
    renderEconomica();
  });

  $("#btnEvaluarEconomica")?.addEventListener("click", () => {
    aplicarMetodoTRM();
    ejecutarEvaluacionEconomica();
    recalcularPuntajesTotalesTodasLasOfertas();
    guardarDB();
    renderEconomica();
    renderOfertas();
    renderInformes();
    renderDashboard();
  });

  // 🔥 BOTÓN RECALCULAR TODO
  $("#btnRecalcularTodo")?.addEventListener("click", () => {
    ejecutarEvaluacionOAB(0.2);
    aplicarMetodoTRM();
    ejecutarEvaluacionEconomica();
    recalcularPuntajesTotalesTodasLasOfertas();

    guardarDB();

    renderOfertas();
    renderOAB();
    renderEconomica();
    renderInformes();
    renderDashboard();

    alert("Recalculo completo realizado");
  });

  $("#btnGuardarManual")?.addEventListener("click", () => {
    guardarManual();
  });

  $("#btnLimpiarStorage")?.addEventListener("click", () => {
    const confirmar = confirm("¿Está seguro de eliminar los datos guardados?");
    if (!confirmar) return;
    limpiarStorage();
    location.reload();
  });
}

// ===============================
// BOTONES PDF
// ===============================
function inicializarBotonesPDF() {
  $("#btnPDFBasico")?.addEventListener("click", generarPDFBasico);
  $("#btnPDFTecnico")?.addEventListener("click", generarPDFTecnico);
  $("#btnPDFFinal")?.addEventListener("click", generarPDFFinalAdjudicacion);
  $("#btnPDFEconomico")?.addEventListener("click", generarPDFResultadosEconomicos);
  $("#btnPDFOfertas")?.addEventListener("click", generarPDFDetalleOfertas);

  // 🔥 PDF ANALISIS ESTRATEGICO
  $("#btnPDFSimulacion")?.addEventListener("click", () => {
    const id = Number($("#selectMiProponente")?.value);
    if (!id) {
      alert("Seleccione un proponente");
      return;
    }
    generarPDFSimulacionEstrategica(id);
  });
}

// ===============================
// RENDER GENERAL
// ===============================
function renderTodo() {
  recalcularPuntajesTotalesTodasLasOfertas();
  cargarProcesoEnUI();
  renderResumenProceso();
  renderOfertas();
  renderOAB();
  renderEconomica();
  renderInformes();
  renderDashboard();
}

// ===============================
// CARGAR DATOS DEL PROCESO EN UI
// ===============================
function cargarProcesoEnUI() {
  if ($("#procesoNombre")) $("#procesoNombre").value = DB.proceso.nombre || "";
  if ($("#procesoObjeto")) $("#procesoObjeto").value = DB.proceso.objeto || "";
  if ($("#procesoEntidad")) $("#procesoEntidad").value = DB.proceso.entidad || "";
  if ($("#procesoPresupuesto")) $("#procesoPresupuesto").value = formatearPesos(DB.proceso.presupuesto || 0);
  if ($("#procesoTRM")) $("#procesoTRM").value = DB.proceso.trm || "";
  if ($("#procesoPuntajeMaximo")) $("#procesoPuntajeMaximo").value = DB.proceso.puntajeMaximo || "";

  if ($("#procesoPuntajeCalidad")) $("#procesoPuntajeCalidad").value = DB.proceso.puntajeCalidad || "";
  if ($("#procesoPuntajeIndustria")) $("#procesoPuntajeIndustria").value = DB.proceso.puntajeIndustriaNacional || "";
  if ($("#procesoPuntajeDiscapacidad")) $("#procesoPuntajeDiscapacidad").value = DB.proceso.puntajeDiscapacidad || "";
  if ($("#procesoPuntajeMujer")) $("#procesoPuntajeMujer").value = DB.proceso.puntajeMujer || "";
  if ($("#procesoPuntajeMipyme")) $("#procesoPuntajeMipyme").value = DB.proceso.puntajeMipyme || "";
  if ($("#procesoNumeroPropuestas")) $("#procesoNumeroPropuestas").value = DB.proceso.numeroPropuestasHabilitadas || "";
  if ($("#procesoFecha")) $("#procesoFecha").value = DB.proceso.fechaEvaluacion || "";
  if ($("#procesoUrlSecop")) $("#procesoUrlSecop").value = DB.proceso.urlSecop || "";
  if ($("#procesoObservaciones")) $("#procesoObservaciones").value = DB.proceso.observaciones || "";

  renderDocumentosAnexos();
}

// ===============================
// RESUMEN DEL PROCESO
// ===============================
function renderResumenProceso() {
  const box = $("#resumenProceso");
  if (!box) return;

  box.innerHTML = `
    <div><strong>Proceso:</strong> ${DB.proceso.nombre || "No registrado"}</div>
    <div><strong>Objeto:</strong> ${DB.proceso.objeto || "No registrado"}</div>
    <div><strong>Entidad:</strong> ${DB.proceso.entidad || "No registrada"}</div>
    <div><strong>Presupuesto:</strong> ${formatearPesos(DB.proceso.presupuesto || 0)}</div>
    <div><strong>TRM:</strong> ${DB.proceso.trm || 0}</div>
    <div><strong>Puntaje máximo:</strong> ${DB.proceso.puntajeMaximo || 0}</div>
    <div><strong>No. propuestas habilitadas:</strong> ${DB.proceso.numeroPropuestasHabilitadas || 0}</div>
    <div><strong>SECOP II:</strong> ${DB.proceso.urlSecop ? `<a href="${normalizarUrl(DB.proceso.urlSecop)}" target="_blank" rel="noopener noreferrer">Abrir enlace</a>` : "No registrado"}</div>
    <div><strong>Documentos anexos:</strong> ${Array.isArray(DB.proceso.documentosAnexos) ? DB.proceso.documentosAnexos.length : 0}</div>

    <hr>

    <div><strong>Puntaje económico:</strong> ${DB.proceso.puntajeMaximo || 0}</div>
    <div><strong>Calidad:</strong> ${DB.proceso.puntajeCalidad || 0}</div>
    <div><strong>Industria:</strong> ${DB.proceso.puntajeIndustriaNacional || 0}</div>
    <div><strong>Discapacidad:</strong> ${DB.proceso.puntajeDiscapacidad || 0}</div>
    <div><strong>Mujer:</strong> ${DB.proceso.puntajeMujer || 0}</div>
    <div><strong>Mipyme:</strong> ${DB.proceso.puntajeMipyme || 0}</div>

    <hr>

    <div><strong>Líder final:</strong> ${obtenerLiderFinalNombre()}</div>
  `;
}

// ===============================
// TABLA DE OFERTAS
// ===============================
function renderOfertas() {
  const tbody = $("#tablaOfertasBody");
  if (!tbody) return;

  const ofertas = [...obtenerOfertas()];
  const presupuesto = Number(DB.proceso.presupuesto || 0);

  ofertas.sort((a, b) => {
    const ra = Number(a.rankingFinal || 0);
    const rb = Number(b.rankingFinal || 0);

    if (ra > 0 && rb > 0) return ra - rb;
    if (ra > 0) return -1;
    if (rb > 0) return 1;

    return 0;
  });

  tbody.innerHTML = "";

  ofertas.forEach(oferta => {
    const tr = document.createElement("tr");
    const desviacion = calcularPorcentajeDesviacion(oferta.oferta, presupuesto);

    const observacionEliminada =
      String(oferta.observacion || "").trim().toUpperCase() === "ELIMINADA";

    // 🔥 LÓGICA VISUAL OAB FINAL
    // 1. Si quedó rechazada/eliminada → rojo
    // 2. Si está pendiente y requiere sustentación → amarillo
    // 3. Si fue aceptada después de sustentar → sin color especial
    if (observacionEliminada || oferta.estado === "RECHAZADA") {
      tr.classList.add("fila-rechazada");
    } else if (oferta.requiereSustentacion && oferta.estado === "PENDIENTE") {
      tr.classList.add("fila-alerta");
    } else if (
      oferta.clasificacionInicial === "RECHAZADA INICIAL (POR DEBAJO DEL MÍNIMO ACEPTABLE)" &&
      oferta.estado === "PENDIENTE"
    ) {
      tr.classList.add("fila-rechazada-inicial");
    } else if (oferta.estado === "ACEPTADA" && !oferta.requiereSustentacion) {
      tr.classList.add("fila-aceptada");
    }

    // 🔥 GANADOR VISUAL
    if (Number(oferta.rankingFinal || 0) === 1) {
      tr.classList.add("fila-ganadora");
    }

    tr.innerHTML = `
      <td class="col-proponente">
        <input
          data-id="${oferta.id}"
          class="input-empresa"
          type="text"
          value="${oferta.empresa || ""}"
          title="${oferta.empresa || ""}"
        />
      </td>

      <td class="col-oferta" title="${formatearPesos(oferta.oferta)}">
        <input
          data-id="${oferta.id}"
          class="input-oferta"
          type="text"
          inputmode="numeric"
          value="${formatearPesos(oferta.oferta)}"
          title="${formatearPesos(oferta.oferta)}"
        />
      </td>

      <td class="col-desviacion" title="Desviación frente al presupuesto oficial">
        ${desviacion}
      </td>

      <td>${oferta.clasificacionInicial || ""}</td>
      <td>${oferta.alertaAbsoluta ? "SI" : "NO"}</td>
      <td>${oferta.bajoMinimoRelativo ? "SI" : "NO"}</td>
      <td>${oferta.requiereSustentacion ? "SI" : "NO"}</td>
      <td>
        <select data-id="${oferta.id}" class="select-estado">
          <option value="PENDIENTE" ${oferta.estado === "PENDIENTE" ? "selected" : ""}>PENDIENTE</option>
          <option value="ACEPTADA" ${oferta.estado === "ACEPTADA" ? "selected" : ""}>ACEPTADA</option>
          <option value="RECHAZADA" ${oferta.estado === "RECHAZADA" ? "selected" : ""}>RECHAZADA</option>
        </select>
      </td>
      <td>
        <select data-id="${oferta.id}" class="select-respondio">
          <option value="" ${oferta.respondio === "" ? "selected" : ""}>--</option>
          <option value="SI" ${oferta.respondio === "SI" ? "selected" : ""}>SI</option>
          <option value="NO" ${oferta.respondio === "NO" ? "selected" : ""}>NO</option>
        </select>
      </td>
      <td>
        <select data-id="${oferta.id}" class="select-sustento">
          <option value="" ${oferta.sustentoValido === "" ? "selected" : ""}>--</option>
          <option value="SI" ${oferta.sustentoValido === "SI" ? "selected" : ""}>SI</option>
          <option value="NO" ${oferta.sustentoValido === "NO" ? "selected" : ""}>NO</option>
        </select>
      </td>
      <td style="text-align:center;">
        <input data-id="${oferta.id}" class="check-calidad" type="checkbox" ${oferta.cumpleCalidad ? "checked" : ""} />
      </td>
      <td style="text-align:center;">
        <input data-id="${oferta.id}" class="check-industria" type="checkbox" ${oferta.cumpleIndustria ? "checked" : ""} />
      </td>
      <td style="text-align:center;">
        <input data-id="${oferta.id}" class="check-discapacidad" type="checkbox" ${oferta.cumpleDiscapacidad ? "checked" : ""} />
      </td>
      <td style="text-align:center;">
        <input data-id="${oferta.id}" class="check-mujer" type="checkbox" ${oferta.cumpleMujer ? "checked" : ""} />
      </td>
      <td style="text-align:center;">
        <input data-id="${oferta.id}" class="check-mipyme" type="checkbox" ${oferta.cumpleMipyme ? "checked" : ""} />
      </td>
      <td>${Number(oferta.puntaje || 0).toFixed(4)}</td>
      <td>
        <strong>${Number(oferta.puntajeTotal || 0).toFixed(4)}</strong>
        <div style="font-size:12px;color:#475569;">Puesto final: ${Number(oferta.rankingFinal || 0) || "-"}</div>
      </td>
      <td>
        <input data-id="${oferta.id}" class="input-observacion" value="${oferta.observacion || ""}" />
      </td>
      <td>
        <button data-id="${oferta.id}" class="btn-editar-oferta">Editar</button>
        <button data-id="${oferta.id}" class="btn-eliminar-oferta">Eliminar</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  bindTablaOfertas();
}

function bindTablaOfertas() {
  $all(".btn-eliminar-oferta").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = Number(e.target.dataset.id);
      eliminarOferta(id);
      guardarDB();
      renderOfertas();
      renderOAB();
      renderEconomica();
    });
  });

  $all(".input-empresa").forEach(input => {
    input.addEventListener("change", e => {
      const id = Number(e.target.dataset.id);
      actualizarOferta(id, { empresa: e.target.value });
      guardarDB();
      renderOfertas();
    });
  });

  $all(".input-oferta").forEach(input => {
    input.addEventListener("focus", e => {
      const id = Number(e.target.dataset.id);
      const oferta = DB.ofertas.find(x => x.id === id);
      if (!oferta) return;
      e.target.value = oferta.oferta || "";
    });

    input.addEventListener("blur", e => {
      const id = Number(e.target.dataset.id);
      const valorLimpio = Number(limpiarNumero(e.target.value) || 0);

      actualizarOferta(id, { oferta: valorLimpio });
      guardarDB();
      renderOfertas();
    });
  });

  $all(".select-estado").forEach(select => {
    select.addEventListener("change", e => {
      const id = Number(e.target.dataset.id);
      const estado = e.target.value;
      actualizarOferta(id, { estado });
      recalcularPuntajeTotalOferta(id);
      guardarDB();
      renderEconomica();
      renderOfertas();
    });
  });

  $all(".select-respondio").forEach(select => {
    select.addEventListener("change", e => {
      const id = Number(e.target.dataset.id);
      actualizarDecisionOferta(id, { respondio: e.target.value });
      guardarDB();
    });
  });

  $all(".select-sustento").forEach(select => {
    select.addEventListener("change", e => {
      const id = Number(e.target.dataset.id);
      actualizarDecisionOferta(id, { sustentoValido: e.target.value });
      guardarDB();
    });
  });

  
  // EDITAR Y GUARDAR CON RECALCULO AUTOMATICO
  $all(".btn-editar-oferta").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = Number(e.target.dataset.id);
      const fila = e.target.closest("tr");

      const inputEmpresa = fila.querySelector(".input-empresa");
      const inputOferta = fila.querySelector(".input-oferta");

      const editando = e.target.textContent === "Guardar";

      if (!editando) {
        inputEmpresa.disabled = false;
        inputOferta.disabled = false;
        e.target.textContent = "Guardar";
        inputEmpresa.focus();
      } else {
        const empresa = inputEmpresa.value.trim();
        const valor = Number(limpiarNumero(inputOferta.value) || 0);

        if (!empresa || valor <= 0) {
          alert("Datos inválidos.");
          return;
        }

        actualizarOferta(id, { empresa, oferta: valor });
        guardarDB();

        // 🔥 RECALCULO AUTOMATICO
        ejecutarEvaluacionOAB(0.2);
        aplicarMetodoTRM();
        ejecutarEvaluacionEconomica();
        recalcularPuntajesTotalesTodasLasOfertas();

        renderOfertas();
        renderOAB();
        renderEconomica();
        renderInformes();
        renderDashboard();
      }
    });
  });


  $all(".check-calidad").forEach(input => {
    input.addEventListener("change", e => {
      const id = Number(e.target.dataset.id);
      actualizarOferta(id, { cumpleCalidad: e.target.checked });
      recalcularPuntajeTotalOferta(id);
      guardarDB();
      renderOfertas();
    });
  });

  $all(".check-industria").forEach(input => {
    input.addEventListener("change", e => {
      const id = Number(e.target.dataset.id);
      actualizarOferta(id, { cumpleIndustria: e.target.checked });
      recalcularPuntajeTotalOferta(id);
      guardarDB();
      renderOfertas();
    });
  });

  $all(".check-discapacidad").forEach(input => {
    input.addEventListener("change", e => {
      const id = Number(e.target.dataset.id);
      actualizarOferta(id, { cumpleDiscapacidad: e.target.checked });
      recalcularPuntajeTotalOferta(id);
      guardarDB();
      renderOfertas();
    });
  });

  $all(".check-mujer").forEach(input => {
    input.addEventListener("change", e => {
      const id = Number(e.target.dataset.id);
      actualizarOferta(id, { cumpleMujer: e.target.checked });
      recalcularPuntajeTotalOferta(id);
      guardarDB();
      renderOfertas();
    });
  });

  $all(".check-mipyme").forEach(input => {
    input.addEventListener("change", e => {
      const id = Number(e.target.dataset.id);
      actualizarOferta(id, { cumpleMipyme: e.target.checked });
      recalcularPuntajeTotalOferta(id);
      guardarDB();
      renderOfertas();
    });
  });

  $all(".input-observacion").forEach(input => {
    input.addEventListener("change", e => {
      const id = Number(e.target.dataset.id);
      actualizarDecisionOferta(id, { observacion: e.target.value });
      guardarDB();
    });
  });
}

// ===============================
// VISTA OAB
// ===============================
function renderOAB() {
  const resultado = $("#resultadoOAB");
  const lectura = $("#lecturaOAB");

  if (resultado) {
    resultado.innerHTML = `
      <div><strong>Promedio:</strong> ${formatearPesos(DB.resultadosOAB.promedio || 0)}</div>
      <div><strong>Mediana:</strong> ${formatearPesos(DB.resultadosOAB.mediana || 0)}</div>
      <div><strong>Desviación:</strong> ${formatearPesos(DB.resultadosOAB.desviacion || 0)}</div>
      <div><strong>Mínimo aceptable:</strong> ${formatearPesos(DB.resultadosOAB.minimoAceptable || 0)}</div>
      <div><strong>Límite absoluto:</strong> ${formatearPesos(DB.resultadosOAB.limiteAbsoluto || 0)}</div>
      <div><strong>Total ofertas:</strong> ${DB.resultadosOAB.totalOfertas || 0}</div>
      <div><strong>Ofertas en alerta:</strong> ${DB.resultadosOAB.ofertasEnAlerta || 0}</div>
    `;
  }

  if (lectura) {
    lectura.textContent = obtenerLecturaOAB();
  }
}

// ===============================
// VISTA ECONÓMICA
// ===============================
function renderEconomica() {
  const boxTRM = $("#resultadoTRM");
  const tbody = $("#tablaEconomicaBody");
  const lectura = $("#lecturaEconomica");

  const trm = obtenerResumenTRM();

  if (boxTRM) {
    boxTRM.innerHTML = `
      <div><strong>TRM:</strong> ${trm.trm || 0}</div>
      <div><strong>Decimal:</strong> ${trm.decimal || 0}</div>
      <div><strong>Método:</strong> ${trm.nombreMetodo || "No definido"}</div>
      <div><strong>Rango:</strong> ${trm.rango || ""}</div>
    `;
  }

  if (tbody) {
    const tabla = [...DB.ofertas]
      .filter(o =>
        String(o.empresa || "").trim() !== "" &&
        Number(o.oferta || 0) > 0 &&
        String(o.observacion || "").trim().toUpperCase() !== "ELIMINADA"
      )
      .sort((a, b) => {
        const ra = Number(a.rankingFinal || 0);
        const rb = Number(b.rankingFinal || 0);

        if (ra > 0 && rb > 0) return ra - rb;
        if (ra > 0) return -1;
        if (rb > 0) return 1;

        return Number(b.puntajeTotal || 0) - Number(a.puntajeTotal || 0);
      });

    tbody.innerHTML = "";

    tabla.forEach(item => {
      const tr = document.createElement("tr");

      // 🔥 GANADOR VISUAL
      if (Number(item.rankingFinal || 0) === 1) {
        tr.classList.add("fila-ganadora");
      }
      tr.innerHTML = `
        <td>${item.rankingFinal || item.ranking || "-"}</td>
        <td title="${item.empresa || ""}">${item.empresa || ""}</td>
        <td title="${formatearPesos(item.oferta)}">${formatearPesos(item.oferta)}</td>
        <td>${Number(item.puntaje || 0).toFixed(4)}</td>
        <td>${Number(item.puntajeCalidad || 0).toFixed(2)}</td>
        <td>${Number(item.puntajeIndustria || 0).toFixed(2)}</td>
        <td>${Number(item.puntajeDiscapacidad || 0).toFixed(2)}</td>
        <td>${Number(item.puntajeMujer || 0).toFixed(2)}</td>
        <td>${Number(item.puntajeMipyme || 0).toFixed(2)}</td>
        <td><strong>${Number(item.puntajeTotal || 0).toFixed(4)}</strong></td>
      `;
      tbody.appendChild(tr);
    });
  }

  if (lectura) {
    lectura.textContent = obtenerLecturaEconomica();
  }
  // 🔥 MOSTRAR BASE ECONÓMICA
  const baseMetodoEl = $("#baseMetodo");
  const baseValorEl = $("#baseValor");

  if (baseMetodoEl && baseValorEl) {
    const r = DB.resultadosEconomicos || {};
    baseMetodoEl.textContent = r.nombreMetodo || "-";

    let valorBase = 0;

    if (r.metodo === "MEDIANA") valorBase = r.mediana;
    else if (r.metodo === "GEOMETRICA") valorBase = r.mediaGeometrica;
    else if (r.metodo === "ARITMETICA_BAJA") valorBase = r.mediaAritmeticaBaja;
    else if (r.metodo === "MENOR_VALOR") valorBase = r.menorValor;

    baseValorEl.textContent = valorBase ? formatearPesos(valorBase) : "-";
  }

}

// ===============================
// INFORMES EN PANTALLA
// ===============================
function renderInformes() {
  if ($("#textoInformeBasico")) {
    $("#textoInformeBasico").value = generarInformeBasico();
  }

  if ($("#textoInformeTecnico")) {
    $("#textoInformeTecnico").value = generarInformeTecnicoCompleto();
  }

  if ($("#textoInformeFinal")) {
    $("#textoInformeFinal").value = generarInformeFinalAdjudicacion();
  }
}




// ===============================
// SECOP II Y DOCUMENTOS ANEXOS - NIVEL PRO
// Persistencia real por proyecto usando IndexedDB
// ===============================
function normalizarUrl(url = "") {
  const limpio = String(url || "").trim();

  if (!limpio) return "";

  if (limpio.startsWith("http://") || limpio.startsWith("https://")) {
    return limpio;
  }

  return "https://" + limpio;
}

function esUrl(texto = "") {
  const limpio = String(texto || "").trim().toLowerCase();
  return limpio.startsWith("http://") || limpio.startsWith("https://") || limpio.includes("www.");
}

function asegurarArrayDocumentosAnexos() {
  if (!Array.isArray(DB.proceso.documentosAnexos)) {
    DB.proceso.documentosAnexos = [];
  }
}

function obtenerProyectoActivoIdSeguro() {
  return PROYECTOS?.activoId || null;
}

function requiereProyectoActivo() {
  const proyectoId = obtenerProyectoActivoIdSeguro();

  // CASO 1: hay proyecto activo
  if (proyectoId) return proyectoId;

  // CASO 2: no hay proyecto activo, pero sí hay información cargada en la app.
  // Se permite trabajar en modo temporal para no bloquear documentos ni extracción PDF.
  const hayDatos =
    (Array.isArray(DB?.ofertas) && DB.ofertas.length > 0) ||
    (DB?.proceso && (
      String(DB.proceso.nombre || "").trim() ||
      String(DB.proceso.entidad || "").trim() ||
      Number(DB.proceso.presupuesto || 0) > 0 ||
      (Array.isArray(DB.proceso.documentosAnexos) && DB.proceso.documentosAnexos.length > 0)
    ));

  if (hayDatos) {
    console.warn("Trabajando sin proyecto activo formal, pero con datos en memoria.");
    return "TEMP_SIN_PROYECTO_ACTIVO";
  }

  // CASO 3: no hay proyecto ni datos suficientes
  alert("Primero cree o cargue un proyecto antes de continuar.");
  return null;
}

function formatearTamanoArchivo(bytes) {
  const n = Number(bytes || 0);

  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;

  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function generarIdDocumento() {
  return `doc_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

// ===============================
// INDEXEDDB DOCUMENTOS
// ===============================
const DOCUMENTOS_DB_NOMBRE = "APP_EVALUACION_OFERTAS_DOCUMENTOS";
const DOCUMENTOS_DB_VERSION = 1;
const DOCUMENTOS_STORE = "archivos";

function abrirDBDocumentos() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DOCUMENTOS_DB_NOMBRE, DOCUMENTOS_DB_VERSION);

    request.onupgradeneeded = event => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(DOCUMENTOS_STORE)) {
        db.createObjectStore(DOCUMENTOS_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function guardarArchivoDocumentoIndexedDB(registro) {
  const db = await abrirDBDocumentos();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOCUMENTOS_STORE, "readwrite");
    const store = tx.objectStore(DOCUMENTOS_STORE);

    store.put(registro);

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function obtenerArchivoDocumentoIndexedDB(id) {
  const db = await abrirDBDocumentos();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOCUMENTOS_STORE, "readonly");
    const store = tx.objectStore(DOCUMENTOS_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function eliminarArchivoDocumentoIndexedDB(id) {
  const db = await abrirDBDocumentos();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOCUMENTOS_STORE, "readwrite");
    const store = tx.objectStore(DOCUMENTOS_STORE);

    store.delete(id);

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function abrirDocumentoLocalPersistente(doc) {
  if (!doc?.id) {
    alert("El documento no tiene identificador válido.");
    return;
  }

  try {
    const registro = await obtenerArchivoDocumentoIndexedDB(doc.id);

    if (!registro || !registro.blob) {
      alert("No se encontró el archivo guardado. Puede que haya sido eliminado del almacenamiento del navegador.");
      return;
    }

    const url = URL.createObjectURL(registro.blob);
    window.open(url, "_blank", "noopener,noreferrer");

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);
  } catch (error) {
    console.error(error);
    alert("No fue posible abrir el documento.");
  }
}

async function descargarDocumentoLocalPersistente(doc) {
  if (!doc?.id) {
    alert("El documento no tiene identificador válido.");
    return;
  }

  try {
    const registro = await obtenerArchivoDocumentoIndexedDB(doc.id);

    if (!registro || !registro.blob) {
      alert("No se encontró el archivo guardado.");
      return;
    }

    const url = URL.createObjectURL(registro.blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = doc.nombre || "documento";
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);
  } catch (error) {
    console.error(error);
    alert("No fue posible descargar el documento.");
  }
}

async function agregarArchivosAnexosAlProyecto() {
  const proyectoId = requiereProyectoActivo();
  if (!proyectoId) return;

  const input = $("#inputArchivosAnexos");

  if (!input || !input.files || input.files.length === 0) {
    input?.click();
    return;
  }

  asegurarArrayDocumentosAnexos();

  const archivos = Array.from(input.files);

  for (const file of archivos) {
    const yaExiste = DB.proceso.documentosAnexos.some(doc =>
      String(doc.nombre || "").toLowerCase() === String(file.name || "").toLowerCase() &&
      Number(doc.size || 0) === Number(file.size || 0)
    );

    if (yaExiste) continue;

    const id = generarIdDocumento();

    const metadata = {
      id,
      proyectoId,
      nombre: file.name,
      tipo: "LOCAL",
      mime: file.type || "archivo",
      size: file.size,
      tamano: formatearTamanoArchivo(file.size),
      fechaRegistro: new Date().toISOString()
    };

    await guardarArchivoDocumentoIndexedDB({
      id,
      proyectoId,
      nombre: file.name,
      mime: file.type || "archivo",
      size: file.size,
      fechaRegistro: metadata.fechaRegistro,
      blob: file
    });

    DB.proceso.documentosAnexos.push(metadata);
  }

  input.value = "";

  guardarDB();
  guardarProyectoActual(DB.proceso.nombre || "Proyecto");
  guardarDB();

  renderDocumentosAnexos();
  renderResumenProceso();
}

function inicializarSecopYDocumentos() {
  const inputUrl = $("#procesoUrlSecop");
  const btnAbrir = $("#btnAbrirSecop");
  const btnDocs = $("#btnDocumentosAnexos");
  const bloqueDocs = $("#bloqueDocumentos");
  const inputArchivos = $("#inputArchivosAnexos");
  const btnAgregarDoc = $("#btnAgregarDocumento");

  if (btnAgregarDoc) btnAgregarDoc.type = "button";
  if (btnAbrir) btnAbrir.type = "button";
  if (btnDocs) btnDocs.type = "button";

  if (inputUrl) {
    inputUrl.addEventListener("input", () => {
      actualizarProceso({
        urlSecop: inputUrl.value || ""
      });

      guardarDB();
    });

    inputUrl.addEventListener("change", () => {
      actualizarProceso({
        urlSecop: inputUrl.value || ""
      });

      guardarDB();
      renderResumenProceso();
    });
  }

  btnAbrir?.addEventListener("click", () => {
    let url = inputUrl?.value?.trim() || String(DB.proceso.urlSecop || "").trim();

    if (!url) {
      url = "https://community.secop.gov.co/Public/Tendering/ContractNoticeManagement/Index?currentLanguage=es-CO";
    }

    url = normalizarUrl(url);

    if (inputUrl) inputUrl.value = url;
    actualizarProceso({ urlSecop: url });
    guardarDB();
    renderResumenProceso();

    const nuevaVentana = window.open(url, "_blank");

    if (!nuevaVentana || nuevaVentana.closed || typeof nuevaVentana.closed === "undefined") {
      window.location.assign(url);
    }
  });

  btnDocs?.addEventListener("click", () => {
    const proyectoId = requiereProyectoActivo();
    if (!proyectoId) return;

    if (!bloqueDocs) return;

    const visible = bloqueDocs.style.display === "block";
    bloqueDocs.style.display = visible ? "none" : "block";

    if (!visible) {
      renderDocumentosAnexos();
    }
  });

  btnAgregarDoc?.addEventListener("click", async e => {
    e.preventDefault();
    await agregarArchivosAnexosAlProyecto();
  });

  inputArchivos?.addEventListener("change", async () => {
    if (inputArchivos.files && inputArchivos.files.length > 0) {
      await agregarArchivosAnexosAlProyecto();
    }
  });

  document.addEventListener("click", async e => {
    if (e.target?.classList?.contains("btn-abrir-doc-local")) {
      const id = e.target.dataset.id;
      const doc = DB.proceso.documentosAnexos.find(x => x.id === id);
      await abrirDocumentoLocalPersistente(doc);
    }

    if (e.target?.classList?.contains("btn-descargar-doc-local")) {
      const id = e.target.dataset.id;
      const doc = DB.proceso.documentosAnexos.find(x => x.id === id);
      await descargarDocumentoLocalPersistente(doc);
    }

    if (e.target?.classList?.contains("btn-eliminar-doc-local")) {
      const id = e.target.dataset.id;

      if (!confirm("¿Eliminar este documento anexo del proyecto?")) return;

      asegurarArrayDocumentosAnexos();

      DB.proceso.documentosAnexos = DB.proceso.documentosAnexos.filter(doc => doc.id !== id);

      await eliminarArchivoDocumentoIndexedDB(id);

      guardarDB();
      guardarProyectoActual(DB.proceso.nombre || "Proyecto");
      guardarDB();

      renderDocumentosAnexos();
      renderResumenProceso();
    }
  });

  asegurarArrayDocumentosAnexos();
  renderDocumentosAnexos();
}

function renderDocumentosAnexos() {
  const listaDocs = $("#listaDocumentosAnexos");
  if (!listaDocs) return;

  asegurarArrayDocumentosAnexos();

  const proyectoId = obtenerProyectoActivoIdSeguro();

  listaDocs.innerHTML = "";

  const docs = proyectoId
    ? DB.proceso.documentosAnexos.filter(doc =>
        !doc.proyectoId || String(doc.proyectoId) === String(proyectoId)
      )
    : DB.proceso.documentosAnexos;

  if (!docs.length) {
    const li = document.createElement("li");
    li.textContent = "No hay documentos anexos registrados para este proyecto.";
    listaDocs.appendChild(li);
    return;
  }

  docs.forEach(doc => {
    const li = document.createElement("li");
    li.style.marginBottom = "10px";
    li.style.display = "flex";
    li.style.alignItems = "center";
    li.style.gap = "8px";
    li.style.flexWrap = "wrap";

    const etiqueta = document.createElement("span");
    etiqueta.innerHTML = `
      📄 <strong>${doc.nombre || "Documento anexo"}</strong>
      <small style="color:#64748b;">(${doc.tamano || formatearTamanoArchivo(doc.size || 0)} · ${doc.tipo || "LOCAL"})</small>
    `;
    li.appendChild(etiqueta);

    const abrir = document.createElement("button");
    abrir.type = "button";
    abrir.className = "btn secondary btn-abrir-doc-local";
    abrir.textContent = "Abrir";
    abrir.dataset.id = doc.id;
    li.appendChild(abrir);

    const descargar = document.createElement("button");
    descargar.type = "button";
    descargar.className = "btn secondary btn-descargar-doc-local";
    descargar.textContent = "Descargar";
    descargar.dataset.id = doc.id;
    li.appendChild(descargar);

    const eliminar = document.createElement("button");
    eliminar.type = "button";
    eliminar.className = "btn danger btn-eliminar-doc-local";
    eliminar.textContent = "Eliminar";
    eliminar.dataset.id = doc.id;
    li.appendChild(eliminar);

    listaDocs.appendChild(li);
  });
}



// ===============================
// IMPORTAR EXCEL
// ===============================
function normalizarTextoExcel(valor = "") {
  return String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extraerNumeroExcel(valor) {
  if (typeof valor === "number") return valor;

  let texto = String(valor || "").trim();

  if (!texto) return 0;

  texto = texto
    .replace(/\$/g, "")
    .replace(/COP/gi, "")
    .replace(/\s/g, "")
    .replace(/,/g, "")
    .replace(/\.00$/g, "")
    .replace(/[^0-9.-]/g, "");

  const numero = Number(texto);

  return isNaN(numero) ? 0 : numero;
}

function detectarColumnasExcel(json = []) {
  let headerRowIndex = -1;
  let colEmpresa = -1;
  let colOferta = -1;

  const posiblesEmpresa = [
    "nombre del proponente",
    "proponente",
    "nombre proponente",
    "oferente",
    "empresa",
    "participante",
    "contratista"
  ];

  const posiblesOferta = [
    "valor de la oferta",
    "valor oferta",
    "valor de oferta",
    "oferta",
    "valor ofertado",
    "precio"
  ];

  // 1. Buscar encabezados reales en las primeras filas
  for (let i = 0; i < Math.min(json.length, 25); i++) {
    const fila = Array.isArray(json[i]) ? json[i] : [];

    fila.forEach((celda, idx) => {
      const texto = normalizarTextoExcel(celda);

      if (colEmpresa === -1 && posiblesEmpresa.some(p => texto.includes(p))) {
        colEmpresa = idx;
        headerRowIndex = i;
      }

      if (colOferta === -1 && posiblesOferta.some(p => texto.includes(p))) {
        colOferta = idx;
        headerRowIndex = i;
      }
    });

    if (colEmpresa !== -1 && colOferta !== -1) {
      return { headerRowIndex, colEmpresa, colOferta };
    }
  }

  // 2. Si no encuentra encabezados, detectar por contenido:
  //    - columna con más textos largos = proponente
  //    - columna con más valores grandes = oferta
  const puntajesTexto = {};
  const puntajesNumero = {};

  json.slice(0, 60).forEach(fila => {
    if (!Array.isArray(fila)) return;

    fila.forEach((celda, idx) => {
      const texto = String(celda || "").trim();
      const numero = extraerNumeroExcel(celda);

      if (!puntajesTexto[idx]) puntajesTexto[idx] = 0;
      if (!puntajesNumero[idx]) puntajesNumero[idx] = 0;

      if (
        texto &&
        isNaN(Number(texto)) &&
        texto.length > 5 &&
        !normalizarTextoExcel(texto).includes("nombre del proponente") &&
        !normalizarTextoExcel(texto).includes("valor de la oferta")
      ) {
        puntajesTexto[idx]++;
      }

      if (numero > 1000000) {
        puntajesNumero[idx]++;
      }
    });
  });

  const columnasTexto = Object.entries(puntajesTexto).sort((a, b) => b[1] - a[1]);
  const columnasNumero = Object.entries(puntajesNumero).sort((a, b) => b[1] - a[1]);

  if (colEmpresa === -1 && columnasTexto.length) {
    colEmpresa = Number(columnasTexto[0][0]);
  }

  if (colOferta === -1 && columnasNumero.length) {
    colOferta = Number(columnasNumero[0][0]);
  }

  // 3. Buscar la primera fila de datos real
  let primeraFilaDatos = 0;

  for (let i = 0; i < json.length; i++) {
    const fila = Array.isArray(json[i]) ? json[i] : [];
    const empresa = String(fila[colEmpresa] || "").trim();
    const valor = extraerNumeroExcel(fila[colOferta]);

    if (empresa && valor > 0 && !normalizarTextoExcel(empresa).includes("proponente")) {
      primeraFilaDatos = i;
      break;
    }
  }

  return {
    headerRowIndex: primeraFilaDatos > 0 ? primeraFilaDatos - 1 : 0,
    colEmpresa: colEmpresa >= 0 ? colEmpresa : 0,
    colOferta: colOferta >= 0 ? colOferta : 1
  };
}

function importarExcel() {
  const input = document.getElementById("inputExcel");

  if (!input || !input.files || input.files.length === 0) {
    alert("Seleccione un archivo Excel.");
    return;
  }

  if (typeof XLSX === "undefined") {
    alert("La librería de Excel no está cargada. Revise index.html.");
    return;
  }

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const json = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        defval: ""
      });

      if (!json || !json.length) {
        alert("El archivo no tiene datos válidos para importar.");
        return;
      }

      const columnas = detectarColumnasExcel(json);
      const colEmpresa = columnas.colEmpresa;
      const colOferta = columnas.colOferta;
      const inicioDatos = columnas.headerRowIndex >= 0 ? columnas.headerRowIndex + 1 : 1;

      if (colEmpresa < 0 || colOferta < 0) {
        alert("No fue posible identificar las columnas de proponente y valor de la oferta.");
        return;
      }

      const filasLimpias = [];
      const filasOmitidas = [];

      json.slice(inicioDatos).forEach((fila, idx) => {
        if (!Array.isArray(fila)) return;

        const empresa = String(fila[colEmpresa] || "").trim();
        const valorOriginal = fila[colOferta];
        const valor = extraerNumeroExcel(valorOriginal);

        const empresaNormalizada = normalizarTextoExcel(empresa);

        const pareceEncabezado =
          empresaNormalizada.includes("nombre del proponente") ||
          empresaNormalizada === "proponente" ||
          empresaNormalizada.includes("valor de la oferta") ||
          empresaNormalizada.includes("valor oferta");

        if (pareceEncabezado) return;

        if (empresa && valor > 0) {
          filasLimpias.push({
            empresa,
            oferta: valor
          });
        } else if (empresa || String(valorOriginal || "").trim()) {
          filasOmitidas.push({
            fila: inicioDatos + idx + 1,
            empresa,
            valorOriginal: String(valorOriginal || "")
          });
        }
      });

      if (!filasLimpias.length) {
        alert(
          "No se encontraron filas válidas con proponente y oferta.\n\n" +
          "Verifique que el Excel tenga columnas como: Nombre del proponente y Valor de la oferta."
        );
        return;
      }

      const confirmar = confirm(
        `Se importarán ${filasLimpias.length} oferta(s).\n\n` +
        "¿Desea reemplazar el listado actual de ofertas?"
      );

      if (!confirmar) return;

      DB.ofertas = [];

      const nuevasOfertas = generarLineasOfertas(filasLimpias.length);

      filasLimpias.forEach((fila, index) => {
        const ofertaCreada = nuevasOfertas[index];
        if (!ofertaCreada) return;

        actualizarOferta(ofertaCreada.id, {
          empresa: fila.empresa,
          oferta: fila.oferta
        });
      });

      if ($("#procesoNumeroPropuestas")) {
        $("#procesoNumeroPropuestas").value = filasLimpias.length;
      }

      actualizarProceso({
        numeroPropuestasHabilitadas: filasLimpias.length
      });

      guardarDB();
      renderResumenProceso();
      renderOfertas();
      renderOAB();
      renderEconomica();
      renderDashboard();

      if (filasOmitidas.length > 0) {
        const detalle = filasOmitidas
          .slice(0, 10)
          .map(x => `Fila ${x.fila}: ${x.empresa || "(sin nombre)"} | ${x.valorOriginal || "(sin valor)"}`)
          .join("\n");

        alert(
          `Importación parcial: ${filasLimpias.length} oferta(s) cargada(s).\n` +
          `${filasOmitidas.length} fila(s) fueron omitida(s).\n\n${detalle}`
        );
      } else {
        alert(`Importación exitosa: ${filasLimpias.length} oferta(s) cargada(s).`);
      }
    } catch (error) {
      console.error(error);
      alert("No fue posible leer el archivo Excel. Verifique la estructura del archivo.");
    }
  };

  reader.readAsArrayBuffer(file);
}


// ===============================
// GESTIÓN DE PROYECTOS (UI)
// ===============================
function inicializarGestionProyectos() {
  const btnNuevo = $("#btnNuevoProyecto");
  const btnGuardar = $("#btnGuardarProyecto");
  const btnCargar = $("#btnCargarProyecto");
  const btnEliminar = $("#btnEliminarProyecto");
  const btnDuplicar = $("#btnDuplicarProyecto");
  const inputBuscar = $("#inputBuscarProyecto");
  const select = $("#selectProyectos");

  function renderLista(filtro = "") {
    if (!select) return;
    const lista = filtro ? buscarProyectos(filtro) : listarProyectos();
    select.innerHTML = "";

    lista.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.nombre;
      if (p.id === PROYECTOS.activoId) opt.selected = true;
      select.appendChild(opt);
    });
  }

  btnNuevo?.addEventListener("click", () => {
    const nombre = prompt("Nombre del nuevo proyecto:", "Nuevo proyecto");
    if (!nombre) return;
    crearNuevoProyecto(nombre);
    guardarDB();
    renderLista();
    cargarProcesoEnUI();
    renderTodo();
  });

  btnGuardar?.addEventListener("click", () => {
    const nombre = prompt("Nombre del proyecto:", DB.proceso.nombre || "Proyecto");
    guardarProyectoActual(nombre);
    guardarDB();
    renderLista();
    alert("Proyecto guardado correctamente");
  });

  btnCargar?.addEventListener("click", () => {
    const id = Number(select?.value);
    if (!id) return;
    cargarProyecto(id);
    guardarDB();
    renderLista();
    cargarProcesoEnUI();
    renderTodo();
  });

  btnEliminar?.addEventListener("click", () => {
    const id = Number(select?.value);
    if (!id) return;
    if (!confirm("¿Eliminar este proyecto?")) return;
    eliminarProyecto(id);
    guardarDB();
    renderLista();
    renderTodo();
  });

  btnDuplicar?.addEventListener("click", () => {
    const id = Number(select?.value);
    if (!id) return;
    duplicarProyecto(id);
    guardarDB();
    renderLista();
  });

  inputBuscar?.addEventListener("input", e => {
    renderLista(e.target.value);
  });

  renderLista();
}


// ===============================
// DASHBOARD
// ===============================
function renderDashboard() {
  const total = DB.ofertas.length;

  // 🔥 REVISIÓN INICIAL
  const alerta = DB.ofertas.filter(o => o.requiereSustentacion).length;
  const rechazadasInicial = DB.ofertas.filter(o => 
    o.clasificacionInicial && o.clasificacionInicial.includes("RECHAZADA")
  ).length;

  // 🔥 REVISIÓN FINAL (CLAVE)
  const eliminadasFinal = DB.ofertas.filter(o => 
    String(o.observacion || "").toUpperCase() === "ELIMINADA"
  ).length;

  const habilitadasFinal = DB.ofertas.filter(o => 
    String(o.observacion || "").toUpperCase() !== "ELIMINADA" &&
    Number(o.oferta || 0) > 0 &&
    String(o.empresa || "").trim() !== ""
  ).length;

  const evaluacionEconomica = habilitadasFinal;

  // 🔥 PINTAR DATOS
  if ($("#dashTotal")) $("#dashTotal").textContent = total;
  if ($("#dashAlerta")) $("#dashAlerta").textContent = alerta;
  if ($("#dashRechazadas")) $("#dashRechazadas").textContent = rechazadasInicial;
  if ($("#dashHabilitadasFinal")) $("#dashHabilitadasFinal").textContent = habilitadasFinal;
  if ($("#dashEliminadasFinal")) $("#dashEliminadasFinal").textContent = eliminadasFinal;
  if ($("#dashEvaluacionEconomica")) $("#dashEvaluacionEconomica").textContent = evaluacionEconomica;

  // 🔥 GRÁFICO TIPO TORTA
  const ctx = document.getElementById("graficoDashboard");

  if (ctx) {
    if (window.graficoDashboardInstance) {
      window.graficoDashboardInstance.destroy();
    }

    window.graficoDashboardInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [
          "En alerta OAB",
          "Rechazadas inicial",
          "Hábiles final",
          "Eliminadas final"
        ],
        datasets: [{
          label: "Cantidad de ofertas",
          data: [
            alerta,
            rechazadasInicial,
            habilitadasFinal,
            eliminadasFinal
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: "bottom"
          }
        }
      }
    });
  }
}


// ===============================
// 🔥 ANALISIS ESTRATEGICO - NIVEL EXPERTO TOTAL + MULTI-ESCENARIO
// ===============================
function inicializarAnalisisEstrategico() {
  const select = $("#selectMiProponente");
  const btn = $("#btnAnalisisEstrategico");

  function cargarProponentes() {
    if (!select) return;

    const valorActual = select.value;
    select.innerHTML = "";

    const ofertas = [...DB.ofertas]
      .filter(o =>
        String(o.empresa || "").trim() !== "" &&
        Number(o.oferta || 0) > 0 &&
        String(o.observacion || "").trim().toUpperCase() !== "ELIMINADA"
      )
      .sort((a, b) => {
        const ra = Number(a.rankingFinal || 0);
        const rb = Number(b.rankingFinal || 0);
        if (ra > 0 && rb > 0) return ra - rb;
        return String(a.empresa || "").localeCompare(String(b.empresa || ""));
      });

    ofertas.forEach(o => {
      const opt = document.createElement("option");
      opt.value = o.id;
      opt.textContent = `${o.rankingFinal ? "#" + o.rankingFinal + " - " : ""}${o.empresa}`;
      select.appendChild(opt);
    });

    if (valorActual && [...select.options].some(opt => opt.value === valorActual)) {
      select.value = valorActual;
    }
  }

  function textoViabilidad(viabilidad) {
    const v = String(viabilidad || "").toUpperCase();

    if (v === "ALTA") {
      return "Alta: el escenario requiere muy pocas exclusiones simuladas y la revisión puede enfocarse con alta precisión.";
    }

    if (v === "MEDIA") {
      return "Media: el escenario es posible, pero exige revisar varios proponentes con impacto directo en el ranking.";
    }

    if (v === "BAJA") {
      return "Baja: el escenario requiere una cantidad considerable de exclusiones simuladas.";
    }

    return "Remota: el escenario ganador directo no es eficiente; conviene enfocar la revisión en mejorar posición o validar causales objetivas muy fuertes.";
  }

  function renderFilaEstrategica({
    ranking,
    empresa,
    puntajeTotal,
    diferencia,
    posicion,
    clase = ""
  }) {
    const tr = document.createElement("tr");

    if (clase) {
      tr.classList.add(clase);
    }

    tr.innerHTML = `
      <td>${ranking || ""} ${empresa || ""}</td>
      <td>${Number(puntajeTotal || 0).toFixed(4)}</td>
      <td>${diferencia === null || diferencia === undefined ? "-" : Number(diferencia || 0).toFixed(4)}</td>
      <td>${posicion || "-"}</td>
    `;

    return tr;
  }

  function renderMatrizMultiEscenario(multi = []) {
    if (!multi.length) return "";

    const filas = multi.map(e => {
      const excluidos = (e.excluidos || []).map(x => x.empresa).join(", ") || "-";

      return `
        <tr>
          <td style="text-align:center;">${e.escenario}</td>
          <td style="text-align:center;">${e.totalExcluidos || e.escenario}</td>
          <td style="text-align:center;"><strong>${e.gana ? "SI" : "NO"}</strong></td>
          <td style="text-align:center;">${e.viabilidad || "-"}</td>
          <td style="text-align:center;">${e.puntajeProyectado === null || e.puntajeProyectado === undefined ? "-" : Number(e.puntajeProyectado || 0).toFixed(4)}</td>
          <td>${excluidos}</td>
        </tr>
      `;
    }).join("");

    return `
      <hr>
      <h3>MATRIZ MULTI-ESCENARIO</h3>
      <p>
        Esta matriz compara escenarios de 1, 2 y 3 exclusiones simuladas.
        Cada escenario recalcula nuevamente la base estadística, el puntaje económico,
        el puntaje total y el ranking proyectado.
      </p>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ESCENARIO</th>
              <th>EXCLUSIONES</th>
              <th>¿GANA?</th>
              <th>VIABILIDAD</th>
              <th>PUNTAJE PROYECTADO</th>
              <th>PROPONENTES NO CONSIDERADOS</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
          </tbody>
        </table>
      </div>
    `;
  }

  function obtenerRecomendacionMultiEscenario(multi = [], resultadoSim = null) {
    const ganador = multi.find(e => e.gana);

    if (ganador) {
      return `
        <strong>Recomendación estratégica:</strong><br>
        El primer escenario ganador se logra con ${ganador.totalExcluidos || ganador.escenario} exclusión(es) simulada(s).
        La revisión debe concentrarse inicialmente en los proponentes identificados en ese escenario,
        verificando exclusivamente causales objetivas de rechazo, habilitación, sustentación y consistencia documental.
      `;
    }

    return `
      <strong>Recomendación estratégica:</strong><br>
      No se identificó escenario ganador hasta con 3 exclusiones simuladas.
      La estrategia debe orientarse a priorizar revisión de competidores superiores, evaluar brechas de puntaje
      y verificar si existen causales objetivas suficientemente fuertes antes de invertir tiempo en una revisión completa.
    `;
  }

  function analizar() {
    cargarProponentes();

    const id = Number(select?.value);
    if (!id) return;

    const miNombre = DB.ofertas.find(o => Number(o.id) === id)?.empresa || "Proponente seleccionado";

    const resultadoSim = simularEscenarioGanadorDinamico(id, 3);
    const multiEscenarios = simularMultiplesEscenarios(id, 3);

    const resultado = $("#resultadoEstrategico");
    const tbody = $("#tablaEstrategicoBody");

    if (!resultadoSim) return;

    const matrizHTML = renderMatrizMultiEscenario(multiEscenarios);
    const recomendacionHTML = obtenerRecomendacionMultiEscenario(multiEscenarios, resultadoSim);

    if (resultado) {
      if (resultadoSim.yaEsGanador) {
        const bases = resultadoSim.escenario?.bases || {};
        const mi = resultadoSim.escenario?.miResultado || {};

        resultado.innerHTML = `
          <h3>DIAGNÓSTICO ESTRATÉGICO</h3>
          <strong>${miNombre}</strong> ya ocupa la posición No. 1 del proceso.<br><br>

          <strong>Lectura ejecutiva:</strong><br>
          No se requiere simular exclusiones para alcanzar el primer lugar. La prioridad debe ser conservar la habilitación, sustentar adecuadamente cualquier alerta y proteger los factores que explican la posición actual.

          <hr>

          <strong>Resultado actual:</strong><br>
          Puntaje económico: ${Number(mi.puntaje || 0).toFixed(4)}<br>
          Puntaje total: ${Number(mi.puntajeTotal || 0).toFixed(4)}<br>

          <hr>

          <strong>Bases económicas actuales:</strong><br>
          Mediana: ${formatearPesos(bases.mediana || 0)}<br>
          VME: ${formatearPesos(bases.vme || 0)}<br>
          Media geométrica: ${formatearPesos(bases.mediaGeometrica || 0)}<br>
          Media aritmética baja: ${formatearPesos(bases.mediaAritmeticaBaja || 0)}<br>
          Menor valor: ${formatearPesos(bases.menorValor || 0)}

          ${matrizHTML}

          <hr>
          ${recomendacionHTML}
        `;
      } else if (resultadoSim.encontrado) {
        const excluidos = resultadoSim.escenario?.excluidos || [];
        const nombres = excluidos.map(x => x.empresa).join(", ");
        const bases = resultadoSim.escenario?.bases || {};
        const mi = resultadoSim.escenario?.miResultado || {};
        const ganador = resultadoSim.escenario?.ganador || {};
        const liderActual = resultadoSim.liderActual || {};
        const tabla = resultadoSim.escenario?.tabla || [];
        const segundo = tabla.find(o => Number(o.rankingFinalSimulado || 0) === 2);
        const margenSimulado = segundo
          ? Number(mi.puntajeTotal || 0) - Number(segundo.puntajeTotal || 0)
          : 0;

        resultado.innerHTML = `
          <h3>ESCENARIO GANADOR DINÁMICO IDENTIFICADO</h3>

          <strong>Proponente analizado:</strong> ${miNombre}<br>
          <strong>Posición actual:</strong> ${resultadoSim.posicionActual}<br>
          <strong>Brecha actual contra el líder:</strong> ${Number(resultadoSim.brechaLider || 0).toFixed(4)} puntos<br>
          <strong>Líder actual:</strong> ${liderActual.empresa || "No definido"}<br>
          <strong>Viabilidad estratégica:</strong> ${resultadoSim.viabilidad}<br>
          <em>${textoViabilidad(resultadoSim.viabilidad)}</em>

          <hr>

          <strong>Escenario mínimo encontrado:</strong><br>
          Para que <strong>${miNombre}</strong> quede en posición No. 1, la simulación identifica que no deberían ser considerados los siguientes proponentes:<br>
          <strong>${nombres || "Ninguno"}</strong><br><br>

          <strong>Total de exclusiones simuladas:</strong> ${resultadoSim.escenario.totalExcluidos}<br>
          <strong>Nueva posición proyectada:</strong> ${mi.rankingFinalSimulado || 1}<br>
          <strong>Ganador proyectado:</strong> ${ganador.empresa || miNombre}

          <hr>

          <strong>Bases económicas recalculadas del escenario:</strong><br>
          Total ofertas evaluadas: ${bases.totalAceptadas || 0}<br>
          Mediana: ${formatearPesos(bases.mediana || 0)}<br>
          VME: ${formatearPesos(bases.vme || 0)}<br>
          Media geométrica: ${formatearPesos(bases.mediaGeometrica || 0)}<br>
          Media aritmética baja: ${formatearPesos(bases.mediaAritmeticaBaja || 0)}<br>
          Menor valor: ${formatearPesos(bases.menorValor || 0)}

          <hr>

          <strong>Resultado del proponente en el escenario:</strong><br>
          Valor oferta: ${formatearPesos(mi.oferta || 0)}<br>
          Puntaje valor oferta: ${Number(mi.puntaje || 0).toFixed(4)}<br>
          Puntaje total proyectado: ${Number(mi.puntajeTotal || 0).toFixed(4)}<br>
          Margen proyectado frente al segundo lugar: ${Number(margenSimulado || 0).toFixed(4)} puntos

          ${matrizHTML}

          <hr>

          <strong>Lectura ejecutiva:</strong><br>
          Este no es un simple ajuste de ranking. La simulación recalcula nuevamente la base estadística y todos los puntajes económicos después de retirar los proponentes del escenario. Por tanto, el resultado refleja el nuevo orden proyectado bajo la misma fórmula aplicable por TRM.

          <hr>
          ${recomendacionHTML}
        `;
      } else {
        const liderActual = resultadoSim.liderActual || {};
        const superiores = resultadoSim.superiores || [];

        resultado.innerHTML = `
          <h3>NO SE ENCONTRÓ ESCENARIO GANADOR CON HASTA 3 EXCLUSIONES</h3>

          <strong>Proponente analizado:</strong> ${miNombre}<br>
          <strong>Posición actual:</strong> ${resultadoSim.posicionActual || "-"}<br>
          <strong>Líder actual:</strong> ${liderActual.empresa || "No definido"}<br>
          <strong>Brecha contra el líder:</strong> ${Number(resultadoSim.brechaLider || 0).toFixed(4)} puntos<br>
          <strong>Viabilidad estratégica:</strong> ${resultadoSim.viabilidad}<br>
          <em>${textoViabilidad(resultadoSim.viabilidad)}</em>

          ${matrizHTML}

          <hr>

          <strong>Lectura ejecutiva:</strong><br>
          Con el límite actual de simulación, el sistema no encontró una ruta directa para llegar al primer lugar excluyendo hasta 3 proponentes. En este caso, la estrategia debe orientarse a revisar los proponentes superiores con menor diferencia, validar causales objetivas de rechazo y evaluar si existe margen real para mejorar factores adicionales.

          <hr>

          <strong>Proponentes que actualmente están por encima:</strong> ${superiores.length}<br>
          ${resultadoSim.motivo || ""}

          <hr>
          ${recomendacionHTML}
        `;
      }
    }

    if (tbody) {
      tbody.innerHTML = "";

      if (resultadoSim.encontrado && resultadoSim.escenario) {
        const filaTitulo1 = document.createElement("tr");
        filaTitulo1.innerHTML = `<td colspan="4"><strong>PROPONENTES NO CONSIDERADOS EN EL ESCENARIO GANADOR</strong></td>`;
        tbody.appendChild(filaTitulo1);

        resultadoSim.escenario.excluidos.forEach(o => {
          tbody.appendChild(renderFilaEstrategica({
            ranking: "Excluir:",
            empresa: o.empresa,
            puntajeTotal: o.puntajeTotal,
            diferencia: o.diferenciaContraMi,
            posicion: o.rankingActual,
            clase: "fila-rechazada"
          }));
        });

        const filaTitulo2 = document.createElement("tr");
        filaTitulo2.innerHTML = `<td colspan="4"><strong>RANKING PROYECTADO DEL ESCENARIO SIMULADO</strong></td>`;
        tbody.appendChild(filaTitulo2);

        resultadoSim.escenario.tabla.forEach(o => {
          tbody.appendChild(renderFilaEstrategica({
            ranking: `#${o.rankingFinalSimulado}`,
            empresa: o.empresa,
            puntajeTotal: o.puntajeTotal,
            diferencia: null,
            posicion: o.rankingFinalSimulado,
            clase: Number(o.rankingFinalSimulado || 0) === 1 ? "fila-ganadora" : ""
          }));
        });
      } else {
        const superiores = resultadoSim.superiores || [];

        superiores.forEach(o => {
          tbody.appendChild(renderFilaEstrategica({
            ranking: "Superior:",
            empresa: o.empresa,
            puntajeTotal: o.puntajeTotal,
            diferencia: o.diferenciaContraMi,
            posicion: o.rankingActual
          }));
        });
      }
    }
  }

  btn?.addEventListener("click", analizar);
  select?.addEventListener("focus", cargarProponentes);

  cargarProponentes();
} 



// ===============================
// 🔥 VALOR COMPETITIVO SUGERIDO
// ===============================
function inicializarValorCompetitivo() {
  const seccionEconomica = $("#btnEvaluarEconomica")?.closest("section");

  if (!seccionEconomica) {
    console.warn("No se encontró la sección económica para agregar Valor competitivo.");
    return;
  }

  // Crear botón si no existe
  let btn = $("#btnValorCompetitivo");

  if (!btn) {
    btn = document.createElement("button");
    btn.id = "btnValorCompetitivo";
    btn.className = "btn secondary";
    btn.textContent = "Valor competitivo";

    const acciones = seccionEconomica.querySelector(".actions") || seccionEconomica;
    acciones.appendChild(btn);
  }

  // Crear bloque de resultado si no existe
  let bloque = $("#bloqueValorCompetitivo");

  if (!bloque) {
    bloque = document.createElement("section");
    bloque.className = "card";
    bloque.id = "bloqueValorCompetitivo";
    bloque.style.display = "none";

    bloque.innerHTML = `
      <h2>Valor competitivo sugerido</h2>

      <div id="resultadoValorCompetitivo" class="summary-box"></div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>INDICADOR</th>
              <th>RESULTADO</th>
              <th>LECTURA</th>
            </tr>
          </thead>
          <tbody id="tablaValorCompetitivoBody"></tbody>
        </table>
      </div>
    `;

    seccionEconomica.insertAdjacentElement("afterend", bloque);
  }

  function textoRiesgo(riesgo) {
    const r = String(riesgo || "").toUpperCase();

    if (r === "BAJO") {
      return "El valor sugerido no se aleja excesivamente del presupuesto oficial.";
    }

    if (r === "MEDIO") {
      return "El valor sugerido es competitivo, pero debe revisarse frente a posibles alertas de precio artificialmente bajo.";
    }

    return "El valor sugerido podría generar alta exposición a revisión por precio artificialmente bajo.";
  }

  function textoRobustez(robustez) {
    const r = String(robustez || "").toUpperCase();

    if (r === "ALTA") {
      return "El rango sugerido conserva buen desempeño frente a las cuatro fórmulas.";
    }

    if (r === "MEDIA") {
      return "El rango sugerido es competitivo, aunque puede variar según la fórmula aplicable.";
    }

    return "El rango sugerido depende fuertemente de la fórmula; se recomienda usarlo con cautela.";
  }

  function renderValorCompetitivo() {
    const resultado = calcularValorCompetitivo();
    const box = $("#resultadoValorCompetitivo");
    const tbody = $("#tablaValorCompetitivoBody");

    if (!resultado) {
      if (box) {
        box.innerHTML = `
          <strong>No hay información suficiente para calcular el valor competitivo.</strong><br>
          Verifique que exista presupuesto oficial y ofertas válidas cargadas.
        `;
      }

      if (tbody) tbody.innerHTML = "";
      return;
    }

    const rangoMin = Math.min(...resultado.rango);
    const rangoMax = Math.max(...resultado.rango);

    if (box) {
      box.innerHTML = `
        <h3>DESVIACIÓN COMPETITIVA SUGERIDA</h3>

        <div style="font-size:34px;font-weight:800;margin:10px 0;">
          ${Number(resultado.desviacionSugerida || 0).toFixed(2)}%
        </div>

        <strong>Rango competitivo sugerido:</strong>
        ${rangoMin.toFixed(2)}% a ${rangoMax.toFixed(2)}% frente al presupuesto oficial<br>

        <strong>Valor estimado sugerido:</strong>
        ${formatearPesos(resultado.valorPesos || 0)}<br>

        <strong>Robustez frente a fórmulas:</strong>
        ${resultado.robustez}<br>

        <strong>Riesgo OAB:</strong>
        ${resultado.riesgo}

        <hr>

        <strong>Lectura ejecutiva:</strong><br>
        Este valor corresponde a una simulación estadística que busca una desviación competitiva frente al presupuesto oficial,
        evaluando el comportamiento del proyecto actual y la estabilidad del resultado frente a las cuatro fórmulas económicas.
      `;
    }

    if (tbody) {
      tbody.innerHTML = "";

      const filas = [
        {
          indicador: "Desviación sugerida",
          resultado: `${Number(resultado.desviacionSugerida || 0).toFixed(2)}%`,
          lectura: "Porcentaje recomendado frente al presupuesto oficial."
        },
        {
          indicador: "Rango competitivo",
          resultado: `${rangoMin.toFixed(2)}% a ${rangoMax.toFixed(2)}%`,
          lectura: "Zona de oferta que conserva competitividad estadística."
        },
        {
          indicador: "Valor sugerido",
          resultado: formatearPesos(resultado.valorPesos || 0),
          lectura: "Valor aproximado equivalente a la desviación sugerida."
        },
        {
          indicador: "Robustez",
          resultado: resultado.robustez,
          lectura: textoRobustez(resultado.robustez)
        },
        {
          indicador: "Riesgo OAB",
          resultado: resultado.riesgo,
          lectura: textoRiesgo(resultado.riesgo)
        }
      ];

      filas.forEach(f => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${f.indicador}</strong></td>
          <td>${f.resultado}</td>
          <td>${f.lectura}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  }

  btn.addEventListener("click", () => {
    const visible = bloque.style.display !== "none";
    bloque.style.display = visible ? "none" : "block";

    if (!visible) {
      renderValorCompetitivo();
      bloque.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}



// ===============================
// 🔥 VALOR COMPETITIVO HISTÓRICO
// ===============================
function inicializarValorCompetitivoHistorico() {
  const seccionEconomica = $("#btnEvaluarEconomica")?.closest("section");

  if (!seccionEconomica) {
    console.warn("No se encontró la sección económica para agregar Valor competitivo histórico.");
    return;
  }

  let btn = $("#btnValorCompetitivoHistorico");

  if (!btn) {
    btn = document.createElement("button");
    btn.id = "btnValorCompetitivoHistorico";
    btn.className = "btn secondary";
    btn.textContent = "Valor competitivo histórico";

    const acciones = seccionEconomica.querySelector(".actions") || seccionEconomica;
    acciones.appendChild(btn);
  }

  let bloque = $("#bloqueValorCompetitivoHistorico");

  if (!bloque) {
    bloque = document.createElement("section");
    bloque.className = "card";
    bloque.id = "bloqueValorCompetitivoHistorico";
    bloque.style.display = "none";

    bloque.innerHTML = `
      <h2>Valor competitivo histórico</h2>

      <div id="resultadoValorCompetitivoHistorico" class="summary-box"></div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>INDICADOR</th>
              <th>RESULTADO</th>
              <th>LECTURA</th>
            </tr>
          </thead>
          <tbody id="tablaValorCompetitivoHistoricoBody"></tbody>
        </table>
      </div>

      <h3>Detalle TOP 3 histórico ponderado</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>PROYECTO</th>
              <th>PROPONENTE</th>
              <th>POSICIÓN</th>
              <th>DESVIACIÓN</th>
              <th>PESO</th>
            </tr>
          </thead>
          <tbody id="tablaDetalleHistoricoBody"></tbody>
        </table>
      </div>
    `;

    const bloqueActual = $("#bloqueValorCompetitivo");
    if (bloqueActual) {
      bloqueActual.insertAdjacentElement("afterend", bloque);
    } else {
      seccionEconomica.insertAdjacentElement("afterend", bloque);
    }
  }

  function textoConfianza(confianza) {
    const c = String(confianza || "").toUpperCase();

    if (c === "ALTA") {
      return "La base histórica es suficientemente amplia para detectar una tendencia consistente.";
    }

    if (c === "MEDIA") {
      return "La base histórica empieza a ser útil, pero todavía debe contrastarse con el proceso actual.";
    }

    return "La base histórica es limitada; el resultado debe leerse como referencia inicial y mejorará con más proyectos guardados.";
  }

  function renderValorHistorico() {
    const resultado = calcularValorCompetitivoHistorico();
    const box = $("#resultadoValorCompetitivoHistorico");
    const tbody = $("#tablaValorCompetitivoHistoricoBody");
    const detalleBody = $("#tablaDetalleHistoricoBody");

    if (!resultado) {
      if (box) {
        box.innerHTML = `
          <strong>No hay información histórica suficiente.</strong><br>
          Guarde proyectos con presupuesto, ofertas y evaluación económica para construir el histórico.
        `;
      }

      if (tbody) tbody.innerHTML = "";
      if (detalleBody) detalleBody.innerHTML = "";
      return;
    }

    const rangoMin = Math.min(...resultado.rango);
    const rangoMax = Math.max(...resultado.rango);

    if (box) {
      box.innerHTML = `
        <h3>DESVIACIÓN COMPETITIVA HISTÓRICA SUGERIDA</h3>

        <div style="font-size:34px;font-weight:800;margin:10px 0;">
          ${Number(resultado.desviacionHistoricaSugerida || 0).toFixed(2)}%
        </div>

        <strong>Rango histórico competitivo:</strong>
        ${rangoMin.toFixed(2)}% a ${rangoMax.toFixed(2)}% frente al presupuesto oficial<br>

        <strong>Valor estimado con presupuesto actual:</strong>
        ${formatearPesos(resultado.valorPesos || 0)}<br>

        <strong>Procesos analizados:</strong>
        ${resultado.procesosAnalizados || 0}<br>

        <strong>Muestras TOP 3 usadas:</strong>
        ${resultado.muestrasTop3 || 0}<br>

        <strong>Confianza histórica:</strong>
        ${resultado.confianza}<br>

        <strong>Método:</strong>
        ${resultado.metodo}

        <hr>

        <strong>Lectura ejecutiva:</strong><br>
        ${resultado.lectura || ""}
      `;
    }

    if (tbody) {
      tbody.innerHTML = "";

      const filas = [
        {
          indicador: "Desviación histórica sugerida",
          resultado: `${Number(resultado.desviacionHistoricaSugerida || 0).toFixed(2)}%`,
          lectura: "Promedio ponderado del TOP 3 de los proyectos guardados."
        },
        {
          indicador: "Rango histórico competitivo",
          resultado: `${rangoMin.toFixed(2)}% a ${rangoMax.toFixed(2)}%`,
          lectura: "Rango P25-P75 del histórico ponderado."
        },
        {
          indicador: "Mediana histórica",
          resultado: `${Number(resultado.medianaHistorica || 0).toFixed(2)}%`,
          lectura: "Punto central robusto de la distribución histórica."
        },
        {
          indicador: "Valor estimado",
          resultado: formatearPesos(resultado.valorPesos || 0),
          lectura: "Valor calculado usando el presupuesto del proceso actual."
        },
        {
          indicador: "Procesos analizados",
          resultado: resultado.procesosAnalizados || 0,
          lectura: "Cantidad de proyectos guardados con información válida."
        },
        {
          indicador: "Confianza",
          resultado: resultado.confianza,
          lectura: textoConfianza(resultado.confianza)
        },
        {
          indicador: "Ponderación",
          resultado: "1°=3 | 2°=2 | 3°=1",
          lectura: "El TOP 3 pesa más según su cercanía al primer lugar."
        }
      ];

      filas.forEach(f => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${f.indicador}</strong></td>
          <td>${f.resultado}</td>
          <td>${f.lectura}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    if (detalleBody) {
      detalleBody.innerHTML = "";

      const detalle = Array.isArray(resultado.detalle) ? resultado.detalle : [];

      if (!detalle.length) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="5">No hay detalle histórico disponible.</td>`;
        detalleBody.appendChild(tr);
      } else {
        detalle.forEach(item => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${item.proyecto || ""}</td>
            <td>${item.empresa || ""}</td>
            <td>${item.posicion || ""}</td>
            <td>${Number(item.desviacion || 0).toFixed(2)}%</td>
            <td>${item.peso || ""}</td>
          `;
          detalleBody.appendChild(tr);
        });
      }
    }
  }

  btn.addEventListener("click", () => {
    const visible = bloque.style.display !== "none";
    bloque.style.display = visible ? "none" : "block";

    if (!visible) {
      renderValorHistorico();
      bloque.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}



// ===============================
// 🔥 FACTORES ESTRATÉGICOS
// ===============================
function inicializarFactoresEstrategicos() {
  const seccionEconomica = $("#btnEvaluarEconomica")?.closest("section");

  if (!seccionEconomica) {
    console.warn("No se encontró la sección económica para agregar Factores estratégicos.");
    return;
  }

  let btn = $("#btnFactoresEstrategicos");

  if (!btn) {
    btn = document.createElement("button");
    btn.id = "btnFactoresEstrategicos";
    btn.className = "btn secondary";
    btn.textContent = "Factores estratégicos";

    const acciones = seccionEconomica.querySelector(".actions") || seccionEconomica;
    acciones.appendChild(btn);
  }

  let bloque = $("#bloqueFactoresEstrategicos");

  if (!bloque) {
    bloque = document.createElement("section");
    bloque.className = "card";
    bloque.id = "bloqueFactoresEstrategicos";
    bloque.style.display = "none";

    bloque.innerHTML = `
      <h2>Análisis de factores estratégicos</h2>

      <div id="resumenFactoresActual" class="summary-box"></div>
      <div id="resumenFactoresHistorico" class="summary-box"></div>

      <h3>Factores del proceso actual comparados con histórico</h3>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>FACTOR</th>
              <th>% CUMPLIMIENTO<br>PROCESO ACTUAL</th>
              <th>% TOP 3<br>PROCESO ACTUAL</th>
              <th>% GANADORES<br>HISTÓRICO</th>
              <th>BRECHA<br>ACTUAL</th>
              <th>PRIORIDAD</th>
              <th>LECTURA</th>
            </tr>
          </thead>
          <tbody id="tablaFactoresEstrategicosBody"></tbody>
        </table>
      </div>

      <h3>Detalle histórico por factor</h3>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>FACTOR</th>
              <th>% CUMPLIMIENTO<br>HISTÓRICO</th>
              <th>% TOP 3<br>HISTÓRICO</th>
              <th>% GANADORES<br>HISTÓRICO</th>
              <th>BRECHA<br>GANADOR</th>
              <th>CONFIANZA</th>
            </tr>
          </thead>
          <tbody id="tablaFactoresHistoricosBody"></tbody>
        </table>
      </div>
    `;

    const bloqueHistorico = $("#bloqueValorCompetitivoHistorico");
    if (bloqueHistorico) {
      bloqueHistorico.insertAdjacentElement("afterend", bloque);
    } else {
      seccionEconomica.insertAdjacentElement("afterend", bloque);
    }
  }

  function clasePrioridad(prioridad) {
    const p = String(prioridad || "").toUpperCase();

    if (p === "ALTA" || p === "OBLIGATORIA") return "fila-ganadora";
    if (p === "BAJA") return "";
    return "";
  }

  function renderFactoresEstrategicos() {
    const data = calcularFactoresEstrategicos();

    const actual = data?.actual;
    const historico = data?.historico;

    const boxActual = $("#resumenFactoresActual");
    const boxHistorico = $("#resumenFactoresHistorico");
    const tbodyActual = $("#tablaFactoresEstrategicosBody");
    const tbodyHistorico = $("#tablaFactoresHistoricosBody");

    if (boxActual) {
      if (actual) {
        boxActual.innerHTML = `
          <h3>PROCESO ACTUAL</h3>
          <strong>Ofertas analizadas:</strong> ${actual.totalOfertas || 0}<br>
          <strong>TOP analizado:</strong> ${actual.topAnalizado || 0}<br>
          <strong>Ganador actual:</strong> ${actual.ganador || "No definido"}<br><br>
          <strong>Lectura:</strong><br>
          ${actual.lecturaGeneral || ""}
        `;
      } else {
        boxActual.innerHTML = `
          <strong>No hay información suficiente del proceso actual.</strong><br>
          Verifique que existan ofertas válidas y factores de evaluación registrados.
        `;
      }
    }

    if (boxHistorico) {
      if (historico) {
        boxHistorico.innerHTML = `
          <h3>HISTÓRICO DE PROYECTOS</h3>
          <strong>Procesos analizados:</strong> ${historico.procesosAnalizados || 0}<br>
          <strong>Confianza histórica:</strong> ${historico.confianza || "BAJA"}<br><br>
          <strong>Lectura:</strong><br>
          ${historico.lecturaGeneral || ""}
        `;
      } else {
        boxHistorico.innerHTML = `
          <strong>No hay información histórica suficiente.</strong><br>
          Guarde proyectos con ofertas, ranking final y factores para construir este análisis.
        `;
      }
    }

    if (tbodyActual) {
      tbodyActual.innerHTML = "";

      const factoresActuales = actual?.factores || [];

      if (!factoresActuales.length) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="7">No hay factores disponibles para analizar.</td>`;
        tbodyActual.appendChild(tr);
      } else {
        factoresActuales.forEach(f => {
          const hist = historico?.factores?.find(h => h.key === f.key);

          const tr = document.createElement("tr");
          const clase = clasePrioridad(f.prioridad);
          if (clase) tr.classList.add(clase);

          tr.innerHTML = `
            <td><strong>${f.factor}</strong></td>
            <td>${Number(f.tasaCumplimiento || 0).toFixed(2)}%</td>
            <td>${Number(f.tasaTop3 || 0).toFixed(2)}%</td>
            <td>${hist ? Number(hist.tasaGanadores || 0).toFixed(2) + "%" : "-"}</td>
            <td>${Number(f.brechaTop || 0).toFixed(2)}%</td>
            <td><strong>${f.prioridad || "-"}</strong></td>
            <td>${f.lectura || ""}</td>
          `;

          tbodyActual.appendChild(tr);
        });
      }
    }

    if (tbodyHistorico) {
      tbodyHistorico.innerHTML = "";

      const factoresHistoricos = historico?.factores || [];

      if (!factoresHistoricos.length) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="6">No hay histórico suficiente para mostrar detalle.</td>`;
        tbodyHistorico.appendChild(tr);
      } else {
        factoresHistoricos.forEach(f => {
          const tr = document.createElement("tr");

          tr.innerHTML = `
            <td><strong>${f.factor}</strong></td>
            <td>${Number(f.tasaCumplimiento || 0).toFixed(2)}%</td>
            <td>${Number(f.tasaTop3 || 0).toFixed(2)}%</td>
            <td>${Number(f.tasaGanadores || 0).toFixed(2)}%</td>
            <td>${Number(f.brechaGanador || 0).toFixed(2)}%</td>
            <td>${historico.confianza || "BAJA"}</td>
          `;

          tbodyHistorico.appendChild(tr);
        });
      }
    }
  }

  btn.addEventListener("click", () => {
    const visible = bloque.style.display !== "none";
    bloque.style.display = visible ? "none" : "block";

    if (!visible) {
      renderFactoresEstrategicos();
      bloque.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}


// ===============================
// 🔥 SIMULACIÓN DE FÓRMULAS
// ===============================
function asegurarBloqueSimulacion() {
  let bloque = $("#bloqueSimulacion");

  if (bloque) return bloque;

  const seccionEconomica = $("#btnSimulacionFormulas")?.closest("section");

  bloque = document.createElement("section");
  bloque.className = "card";
  bloque.id = "bloqueSimulacion";
  bloque.style.display = "none";

  bloque.innerHTML = `
    <h2>Simulación de fórmulas</h2>

    <div class="actions">
      <select id="selectSimulacionMetodo"></select>
      <button id="btnEjecutarSimulacion" class="btn primary">Simular</button>
    </div>

    <div id="resumenSimulacion" class="summary-box"></div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>RANKING</th>
            <th>PROPONENTE</th>
            <th>VALOR OFERTA</th>
            <th>PUNTAJE<br>VALOR OFERTA</th>
            <th>PUNTAJE<br>FACTOR DE<br>CALIDAD</th>
            <th>PUNTAJE<br>APOYO<br>INDUSTRIA<br>NACIONAL</th>
            <th>PUNTAJE<br>VINCULACIÓN<br>PERSONAS CON<br>DISCAPACIDAD</th>
            <th>PUNTAJE<br>EMPRENDIMIENTOS<br>Y EMPRESAS DE<br>MUJERES</th>
            <th>PUNTAJE<br>MIPYME</th>
            <th>PUNTAJE<br>TOTAL</th>
          </tr>
        </thead>
        <tbody id="tablaSimulacionBody"></tbody>
      </table>
    </div>
  `;

  if (seccionEconomica) {
    seccionEconomica.insertAdjacentElement("afterend", bloque);
  } else {
    document.querySelector("main")?.appendChild(bloque);
  }

  return bloque;
}

function inicializarSimulacionFormulas() {
  const btn = $("#btnSimulacionFormulas");
  const metodos = ["MEDIANA", "GEOMETRICA", "ARITMETICA_BAJA", "MENOR_VALOR"];

  if (!btn) {
    console.warn("No se encontró el botón btnSimulacionFormulas.");
    return;
  }

  function cargarOpcionesSimulacion() {
    const select = $("#selectSimulacionMetodo");
    if (!select) return;

    const metodoActual = DB.resultadosEconomicos?.metodo || "";

    select.innerHTML = "";

    // 🔥 Ahora se muestran las 4 fórmulas, incluida la fórmula ganadora por TRM
    metodos.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m === metodoActual
        ? `${obtenerNombreMetodoLocal(m)} (fórmula aplicada)`
        : obtenerNombreMetodoLocal(m);
      select.appendChild(opt);
    });

    // 🔹 Deja seleccionada inicialmente la fórmula aplicada por TRM, si existe
    if (metodoActual && metodos.includes(metodoActual)) {
      select.value = metodoActual;
    }
  }

  function ejecutarSimulacionSeleccionada() {
    const select = $("#selectSimulacionMetodo");
    const tbody = $("#tablaSimulacionBody");
    const resumen = $("#resumenSimulacion");

    const metodo = select?.value;

    if (!metodo || !tbody) return;

    const resultado = simularEvaluacionEconomicaLocal(metodo);

    tbody.innerHTML = "";

    if (resumen) {
      resumen.innerHTML = `
        <strong>Fórmula simulada:</strong> ${resultado.nombreMetodo}<br>
        <strong>Ofertas evaluadas:</strong> ${resultado.tabla.length}<br>
        <strong>Ganador simulado:</strong> ${resultado.mejorOferta?.empresa || "No definido"}<br>
        <strong>Puntaje valor oferta ganador:</strong> ${resultado.mejorOferta ? Number(resultado.mejorOferta.puntaje || 0).toFixed(4) : "0.0000"}<br>
        <strong>Puntaje total ganador:</strong> ${resultado.mejorOferta ? Number(resultado.mejorOferta.puntajeTotal || 0).toFixed(4) : "0.0000"}
      `;
    }

    if (!resultado.tabla.length) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="10">No existen ofertas habilitadas para simular.</td>`;
      tbody.appendChild(tr);
      return;
    }

    resultado.tabla.forEach(item => {
      const tr = document.createElement("tr");

      if (item.ranking === 1) {
        tr.classList.add("fila-ganadora");
      }

      tr.innerHTML = `
        <td>${item.ranking}</td>
        <td>${item.empresa || ""}</td>
        <td>${formatearPesos(item.oferta)}</td>
        <td>${Number(item.puntaje || 0).toFixed(4)}</td>
        <td>${Number(item.puntajeCalidad || 0).toFixed(2)}</td>
        <td>${Number(item.puntajeIndustria || 0).toFixed(2)}</td>
        <td>${Number(item.puntajeDiscapacidad || 0).toFixed(2)}</td>
        <td>${Number(item.puntajeMujer || 0).toFixed(2)}</td>
        <td>${Number(item.puntajeMipyme || 0).toFixed(2)}</td>
        <td><strong>${Number(item.puntajeTotal || 0).toFixed(4)}</strong></td>
      `;

      tbody.appendChild(tr);
    });
  }

  btn.addEventListener("click", () => {
    const bloque = asegurarBloqueSimulacion();

    const visible = bloque.style.display !== "none";
    bloque.style.display = visible ? "none" : "block";

    if (!visible) {
      cargarOpcionesSimulacion();
      ejecutarSimulacionSeleccionada();
      bloque.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  document.addEventListener("click", e => {
    if (e.target?.id === "btnEjecutarSimulacion") {
      ejecutarSimulacionSeleccionada();
    }
  });

  document.addEventListener("change", e => {
    if (e.target?.id === "selectSimulacionMetodo") {
      ejecutarSimulacionSeleccionada();
    }
  });
}



// ===============================
// 🔥 EXTRACCIÓN REAL DE TEXTO DESDE PDF (FASE 2)
// ===============================
async function leerTextoPDF(docMeta) {
  try {
    const registro = await obtenerArchivoDocumentoIndexedDB(docMeta.id);
    if (!registro || !registro.blob) return "";

    const arrayBuffer = await registro.blob.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let textoCompleto = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      textoCompleto += strings.join(" ") + " ";
    }

    return textoCompleto;
  } catch (error) {
    console.error("Error leyendo PDF:", error);
    return "";
  }
}

function detectarDatosClave(texto = "") {
  const resultados = {};

  const numeros = texto.match(/\$?\s?[0-9]{1,3}(?:\.?[0-9]{3})+/g);
  if (numeros && numeros.length) {
    resultados.posiblesValores = numeros.slice(0, 5);
  }

  const proceso = texto.match(/(LP|CD|MC)-?\d{1,4}-?\d{4}/i);
  if (proceso) {
    resultados.proceso = proceso[0];
  }

  return resultados;
}

async function extraerInformacionPDF() {
  const resultadoBox = document.getElementById("resultadoExtraccionPDF");

  if (!Array.isArray(DB?.proceso?.documentosAnexos)) {
    alert("No hay documentos.");
    return;
  }

  const pdfs = DB.proceso.documentosAnexos.filter(doc =>
    (doc.mime || "").includes("pdf") || (doc.nombre || "").toLowerCase().endsWith(".pdf")
  );

  if (!pdfs.length) {
    resultadoBox.innerHTML = "No hay PDFs.";
    return;
  }

  let html = "<strong>Resultados extracción:</strong><br><br>";

  for (const doc of pdfs) {
    const texto = await leerTextoPDF(doc);
    const datos = detectarDatosClave(texto);

    html += `<b>${doc.nombre}</b><br>`;
    html += `Texto detectado (primeros 300 caracteres):<br><small>${texto.slice(0,300)}</small><br>`;

    if (datos.proceso) {
      html += `Proceso detectado: ${datos.proceso}<br>`;
    }

    if (datos.posiblesValores) {
      html += `Valores detectados: ${datos.posiblesValores.join(", ")}<br>`;
    }

    html += "<hr>";
  }

  resultadoBox.innerHTML = html;
}

// Conectar botón
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnExtraerPDF");
  if (btn) {
    btn.addEventListener("click", extraerInformacionPDF);
  }
});
