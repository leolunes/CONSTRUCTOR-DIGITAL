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
  generarPDFDetalleOfertas
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
// SECOP II Y DOCUMENTOS ANEXOS
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

function inicializarSecopYDocumentos() {
  const inputUrl = $("#procesoUrlSecop");
  const btnAbrir = $("#btnAbrirSecop");
  const btnDocs = $("#btnDocumentosAnexos");
  const bloqueDocs = $("#bloqueDocumentos");
  const inputDoc = $("#inputDocumentoAnexo");
  const btnAgregarDoc = $("#btnAgregarDocumento");

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
    // 🔹 Siempre toma el valor del input
    let url = inputUrl?.value?.trim() || "";

    // 🔹 Si está vacío, intenta usar lo que haya en DB
    if (!url) {
      url = String(DB.proceso.urlSecop || "").trim();
    }

    if (!url) {
      alert("No hay enlace SECOP II registrado para este proyecto.");
      return;
    }

    // 🔹 Normaliza (agrega https si falta)
    url = normalizarUrl(url);

    // 🔹 Guarda sincronizado
    actualizarProceso({ urlSecop: url });
    guardarDB();

    // 🔹 Intenta abrir
    const win = window.open(url, "_blank", "noopener,noreferrer");

    // 🔹 Respaldo por bloqueo del navegador
    if (!win) {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  });

  btnDocs?.addEventListener("click", () => {
    if (!bloqueDocs) return;

    const visible = bloqueDocs.style.display === "block";
    bloqueDocs.style.display = visible ? "none" : "block";

    if (!visible) {
      renderDocumentosAnexos();
    }
  });

  btnAgregarDoc?.addEventListener("click", () => {
    const texto = inputDoc?.value?.trim() || "";

    if (!texto) {
      alert("Ingrese un enlace o nombre de documento.");
      return;
    }

    if (!Array.isArray(DB.proceso.documentosAnexos)) {
      DB.proceso.documentosAnexos = [];
    }

    DB.proceso.documentosAnexos.push(texto);

    if (inputDoc) inputDoc.value = "";

    guardarDB();
    renderDocumentosAnexos();
  });

  inputDoc?.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      btnAgregarDoc?.click();
    }
  });

  renderDocumentosAnexos();
}

function renderDocumentosAnexos() {
  const listaDocs = $("#listaDocumentosAnexos");
  if (!listaDocs) return;

  if (!Array.isArray(DB.proceso.documentosAnexos)) {
    DB.proceso.documentosAnexos = [];
  }

  const docs = DB.proceso.documentosAnexos;

  listaDocs.innerHTML = "";

  if (!docs.length) {
    const li = document.createElement("li");
    li.textContent = "No hay documentos anexos registrados.";
    listaDocs.appendChild(li);
    return;
  }

  docs.forEach((doc, index) => {
    const li = document.createElement("li");
    li.style.marginBottom = "8px";

    const texto = String(doc || "").trim();
    const contenido = esUrl(texto)
      ? `<a href="${normalizarUrl(texto)}" target="_blank" rel="noopener noreferrer">${texto}</a>`
      : `<span>${texto}</span>`;

    li.innerHTML = `
      ${contenido}
      <button data-index="${index}" class="btn-eliminar-doc btn danger" style="margin-left:8px;">Eliminar</button>
    `;

    listaDocs.appendChild(li);
  });

  $all(".btn-eliminar-doc").forEach(btn => {
    btn.addEventListener("click", e => {
      const index = Number(e.target.dataset.index);

      if (!confirm("¿Eliminar este documento anexo?")) return;

      DB.proceso.documentosAnexos.splice(index, 1);

      guardarDB();
      renderDocumentosAnexos();
    });
  });
}


// ===============================
// IMPORTAR EXCEL
// ===============================
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

      let filasBase = [...json];

      if (filasBase.length > 0) {
        const celdaA1 = String(filasBase[0][0] || "").toLowerCase().trim();
        const celdaB1 = String(filasBase[0][1] || "").toLowerCase().trim();

        const pareceEncabezado =
          celdaA1.includes("empresa") ||
          celdaA1.includes("proponente") ||
          celdaB1.includes("oferta");

        if (pareceEncabezado) {
          filasBase = filasBase.slice(1);
        }
      }

      const filasLimpias = [];
      const filasOmitidas = [];

      filasBase.forEach((fila, idx) => {
        if (!Array.isArray(fila)) return;

        const empresa = String(fila[0] || "").trim();
        let valorTexto = String(fila[1] || "").trim();

        valorTexto = valorTexto.replace(/\$/g, "");
        valorTexto = valorTexto.replace(/\s/g, "");
        valorTexto = valorTexto.replace(/,/g, "");
        valorTexto = valorTexto.replace(/\.00$/g, "");
        valorTexto = valorTexto.replace(/[^0-9]/g, "");

        const valor = Number(valorTexto || 0);

        if (empresa && valor > 0) {
          filasLimpias.push({
            empresa,
            oferta: valor
          });
        } else if (empresa || valorTexto) {
          filasOmitidas.push({
            fila: idx + 1,
            empresa,
            valorOriginal: String(fila[1] || "")
          });
        }
      });

      if (!filasLimpias.length) {
        alert("No se encontraron filas válidas con proponente y oferta.");
        return;
      }

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

    metodos
      .filter(m => m !== metodoActual)
      .forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.textContent = obtenerNombreMetodoLocal(m);
        select.appendChild(opt);
      });
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
