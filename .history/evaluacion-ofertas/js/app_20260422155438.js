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
    <div><strong>Presupuesto:</strong> ${formatearPesos(DB.proceso.presupuesto || 0)}</div>
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
        <td title="${item.empresa}">${item.empresa}</td>
        <td title="${formatearPesos(item.oferta)}">${formatearPesos(item.oferta)}</td>
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
