// ===============================
// CONTROLADOR PRINCIPAL DE LA APP
// Archivo: js/app.js
// ===============================

import {
  DB,
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
// INICIALIZACIÓN
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  cargarDB();
  inicializarFormularioProceso();
  inicializarFormularioOfertas();
  inicializarAccionesEvaluacion();
  inicializarBotonesPDF();
  renderTodo();
});

// ===============================
// FORMULARIO DEL PROCESO
// Espera ids:
// #procesoNombre
// #procesoObjeto
// #procesoEntidad
// #procesoPresupuesto
// #procesoTRM
// #procesoPuntajeMaximo
// #procesoNumeroPropuestas
// #procesoFecha
// #procesoObservaciones
// ===============================
function inicializarFormularioProceso() {
  const campos = [
    "#procesoNombre",
    "#procesoObjeto",
    "#procesoEntidad",
    "#procesoPresupuesto",
    "#procesoTRM",
    "#procesoPuntajeMaximo",
    "#procesoNumeroPropuestas",
    "#procesoFecha",
    "#procesoObservaciones"
  ];

  campos.forEach(selector => {
    const el = $(selector);
    if (!el) return;

    el.addEventListener("input", () => {
      actualizarProcesoDesdeUI();
    });

    el.addEventListener("change", () => {
      actualizarProcesoDesdeUI();
    });
  });
}

function actualizarProcesoDesdeUI() {
  actualizarProceso({
    nombre: $("#procesoNombre")?.value || "",
    objeto: $("#procesoObjeto")?.value || "",
    entidad: $("#procesoEntidad")?.value || "",
    presupuesto: Number($("#procesoPresupuesto")?.value || 0),
    trm: Number($("#procesoTRM")?.value || 0),
    puntajeMaximo: Number($("#procesoPuntajeMaximo")?.value || 0),
    numeroPropuestasHabilitadas: Number($("#procesoNumeroPropuestas")?.value || 0),
    fechaEvaluacion: $("#procesoFecha")?.value || "",
    observaciones: $("#procesoObservaciones")?.value || ""
  });

  guardarDB();
  renderResumenProceso();
}

// ===============================
// FORMULARIO DE OFERTAS
// Espera ids:
// #empresaOferta
// #valorOferta
// #btnAgregarOferta
// #btnGenerarLineas
// #tablaOfertasBody
// ===============================
function inicializarFormularioOfertas() {
  const btnAgregar = $("#btnAgregarOferta");
  const btnGenerarLineas = $("#btnGenerarLineas");
  const btnProcesarPegado = $("#btnProcesarPegado");

  if (btnAgregar) {
    btnAgregar.addEventListener("click", () => {

      const total = Number($("#procesoNumeroPropuestas")?.value || 0);

      // SI YA DEFINIÓ EL NÚMERO → GENERA TODAS LAS LÍNEAS
      if (total > 0) {

        const existentes = obtenerOfertas().length;

        if (existentes === total) {
          alert("Las líneas ya fueron generadas.");
          return;
        }

        generarLineasOfertas(total);

        guardarDB();
        renderOfertas();

        return;
      }

      // FUNCIONAMIENTO MANUAL
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

  
  if (btnProcesarPegado) {
    btnProcesarPegado.addEventListener("click", () => {
      procesarPegadoMasivo();
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
}

// ===============================
// ACCIONES DE EVALUACIÓN
// Espera ids:
// #btnEvaluarOAB
// #btnAplicarDecisiones
// #btnEvaluarEconomica
// #btnGuardarManual
// #btnLimpiarStorage
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
    guardarDB();
    renderEconomica();
    renderInformes();
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
// Espera ids:
// #btnPDFBasico
// #btnPDFTecnico
// #btnPDFFinal
// #btnPDFEconomico
// #btnPDFOfertas
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
  cargarProcesoEnUI();
  renderResumenProceso();
  renderOfertas();
  renderOAB();
  renderEconomica();
  renderInformes();
}

// ===============================
// CARGAR DATOS DEL PROCESO EN UI
// ===============================
function cargarProcesoEnUI() {
  if ($("#procesoNombre")) $("#procesoNombre").value = DB.proceso.nombre || "";
  if ($("#procesoObjeto")) $("#procesoObjeto").value = DB.proceso.objeto || "";
  if ($("#procesoEntidad")) $("#procesoEntidad").value = DB.proceso.entidad || "";
  if ($("#procesoPresupuesto")) $("#procesoPresupuesto").value = DB.proceso.presupuesto || "";
  if ($("#procesoTRM")) $("#procesoTRM").value = DB.proceso.trm || "";
  if ($("#procesoPuntajeMaximo")) $("#procesoPuntajeMaximo").value = DB.proceso.puntajeMaximo || "";
  if ($("#procesoNumeroPropuestas")) $("#procesoNumeroPropuestas").value = DB.proceso.numeroPropuestasHabilitadas || "";
  if ($("#procesoFecha")) $("#procesoFecha").value = DB.proceso.fechaEvaluacion || "";
  if ($("#procesoObservaciones")) $("#procesoObservaciones").value = DB.proceso.observaciones || "";
}

// ===============================
// RESUMEN DEL PROCESO
// Espera id:
// #resumenProceso
// ===============================
function renderResumenProceso() {
  const box = $("#resumenProceso");
  if (!box) return;

  box.innerHTML = `
    <div><strong>Proceso:</strong> ${DB.proceso.nombre || "No registrado"}</div>
    <div><strong>Objeto:</strong> ${DB.proceso.objeto || "No registrado"}</div>
    <div><strong>Entidad:</strong> ${DB.proceso.entidad || "No registrada"}</div>
    <div><strong>Presupuesto:</strong> ${DB.proceso.presupuesto || 0}</div>
    <div><strong>TRM:</strong> ${DB.proceso.trm || 0}</div>
    <div><strong>Puntaje máximo:</strong> ${DB.proceso.puntajeMaximo || 0}</div>
    <div><strong>No. propuestas habilitadas:</strong> ${DB.proceso.numeroPropuestasHabilitadas || 0}</div>
  `;
}

// ===============================
// TABLA DE OFERTAS
// Espera id:
// #tablaOfertasBody
// ===============================
function renderOfertas() {
  const tbody = $("#tablaOfertasBody");
  if (!tbody) return;

  const ofertas = obtenerOfertas();

  tbody.innerHTML = "";

  ofertas.forEach(oferta => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><input data-id="${oferta.id}" class="input-empresa" value="${oferta.empresa || ""}" /></td>
      <td><input data-id="${oferta.id}" class="input-oferta" type="number" value="${oferta.oferta || ""}" /></td>
      <td>${oferta.clasificacionInicial || ""}</td>
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
      <td>
        <input data-id="${oferta.id}" class="input-observacion" value="${oferta.observacion || ""}" />
      </td>
      <td>
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
    });
  });

  $all(".input-oferta").forEach(input => {
    input.addEventListener("change", e => {
      const id = Number(e.target.dataset.id);
      actualizarOferta(id, { oferta: Number(e.target.value || 0) });
      guardarDB();
    });
  });

  $all(".select-estado").forEach(select => {
    select.addEventListener("change", e => {
      const id = Number(e.target.dataset.id);
      const estado = e.target.value;
      actualizarOferta(id, { estado });
      guardarDB();
      renderEconomica();
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
// Espera ids:
// #resultadoOAB
// #lecturaOAB
// ===============================
function renderOAB() {
  const resultado = $("#resultadoOAB");
  const lectura = $("#lecturaOAB");

  if (resultado) {
    resultado.innerHTML = `
      <div><strong>Promedio:</strong> ${DB.resultadosOAB.promedio || 0}</div>
      <div><strong>Mediana:</strong> ${DB.resultadosOAB.mediana || 0}</div>
      <div><strong>Desviación:</strong> ${DB.resultadosOAB.desviacion || 0}</div>
      <div><strong>Mínimo aceptable:</strong> ${DB.resultadosOAB.minimoAceptable || 0}</div>
      <div><strong>Límite absoluto:</strong> ${DB.resultadosOAB.limiteAbsoluto || 0}</div>
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
// Espera ids:
// #resultadoTRM
// #tablaEconomicaBody
// #lecturaEconomica
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
    const tabla = obtenerTablaEconomica();
    tbody.innerHTML = "";

    tabla.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.ranking}</td>
        <td>${item.empresa}</td>
        <td>${item.oferta}</td>
        <td>${item.puntaje}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  if (lectura) {
    lectura.textContent = obtenerLecturaEconomica();
  }
}

// ===============================
// INFORMES EN PANTALLA
// Espera ids:
// #textoInformeBasico
// #textoInformeTecnico
// #textoInformeFinal
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
// PEGADO MASIVO DESDE EXCEL
// ===============================
function procesarPegadoMasivo() {
  const texto = $("#inputPegadoMasivo")?.value || "";
  if (!texto.trim()) {
    alert("No hay datos para procesar.");
    return;
  }

  const filas = texto.trim().split("\n");
  generarLineasOfertas(filas.length);

  filas.forEach((fila, index) => {
    const partes = fila.split("\t");
    const empresa = (partes[0] || "").trim();
    const valor = Number((partes[1] || "0").replace(/[^0-9]/g, ""));

    actualizarOferta(index + 1, {
      empresa: empresa,
      oferta: valor
    });
  });

  guardarDB();
  renderOfertas();
}
