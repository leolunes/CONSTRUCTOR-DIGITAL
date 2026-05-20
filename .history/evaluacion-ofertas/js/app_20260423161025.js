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
  if ($("#procesoObservaciones")) $("#procesoObservaciones").value = DB.proceso.observaciones || "";
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

    if (oferta.clasificacionInicial === "RECHAZADA INICIAL (POR DEBAJO DEL MÍNIMO ACEPTABLE)") {
      tr.classList.add("fila-rechazada-inicial");
    }

    // 🔥 GANADOR VISUAL
    if (Number(oferta.rankingFinal || 0) === 1) {
      tr.classList.add("fila-ganadora");
    }

    if (oferta.estado === "RECHAZADA") {
      tr.classList.add("fila-rechazada");
    } else if (oferta.estado === "ACEPTADA") {
      tr.classList.add("fila-aceptada");
    } else if (oferta.requiereSustentacion) {
      tr.classList.add("fila-alerta");
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

      const oferta = DB.ofertas.find(o => o.id === id);
      if (!oferta) return;

      let nuevaObservacion = oferta.observacion || "";

      // 🔥 LÓGICA OAB FINAL
      if (estado === "ACEPTADA") {
        // si se acepta, se limpia eliminación
        nuevaObservacion = "";
      }

      if (estado === "RECHAZADA") {
        // si se rechaza en etapa final → eliminada
        nuevaObservacion = "ELIMINADA";
      }

      actualizarOferta(id, {
        estado,
        observacion: nuevaObservacion
      });

      recalcularPuntajeTotalOferta(id);
      guardarDB();

      renderEconomica();
      renderOfertas();
      renderDashboard();
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
