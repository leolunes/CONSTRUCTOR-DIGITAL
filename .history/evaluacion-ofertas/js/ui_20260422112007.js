// ===============================
// INTERFAZ DE USUARIO
// Archivo: js/ui.js
// ===============================

import { DB, obtenerOfertas } from "./db.js";
import { obtenerResumenTRM } from "./trm.js";
import { obtenerTablaEconomica } from "./economica.js";
import {
  generarInformeBasico,
  generarInformeTecnicoCompleto,
  generarInformeFinalAdjudicacion
} from "./report.js";

// ===============================
// SELECTORES
// ===============================
export function $(selector) {
  return document.querySelector(selector);
}

export function $all(selector) {
  return document.querySelectorAll(selector);
}

// ===============================
// UTILIDADES DE FORMATO
// ===============================
export function formatoNumero(valor) {
  return new Intl.NumberFormat("es-CO").format(Number(valor) || 0);
}

export function formatoMoneda(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(Number(valor) || 0);
}

export function formatoPorcentaje(valor, decimales = 2) {
  return `${((Number(valor) || 0) * 100).toFixed(decimales)}%`;
}

export function limpiarHTML(selector) {
  const el = typeof selector === "string" ? $(selector) : selector;
  if (el) el.innerHTML = "";
}

export function setTexto(selector, texto = "") {
  const el = typeof selector === "string" ? $(selector) : selector;
  if (el) el.textContent = texto;
}

export function setHTML(selector, html = "") {
  const el = typeof selector === "string" ? $(selector) : selector;
  if (el) el.innerHTML = html;
}

export function setValor(selector, valor = "") {
  const el = typeof selector === "string" ? $(selector) : selector;
  if (el) el.value = valor;
}

// ===============================
// MENSAJES Y ALERTAS
// ===============================
export function mostrarMensaje(selector, mensaje, tipo = "info") {
  const el = typeof selector === "string" ? $(selector) : selector;
  if (!el) return;

  el.className = `alerta alerta-${tipo}`;
  el.textContent = mensaje;
}

export function limpiarMensaje(selector) {
  const el = typeof selector === "string" ? $(selector) : selector;
  if (!el) return;

  el.className = "";
  el.textContent = "";
}

// ===============================
// BADGES / ETIQUETAS
// ===============================
export function badgeEstado(texto = "") {
  const normalizado = String(texto || "").toUpperCase();

  let clase = "badge-gray";

  if (normalizado.includes("ACEPTADA")) clase = "badge-green";
  if (normalizado.includes("RECHAZADA")) clase = "badge-red";
  if (normalizado.includes("PENDIENTE")) clase = "badge-yellow";
  if (normalizado.includes("POSIBLE OAB")) clase = "badge-red";
  if (normalizado.includes("SIGUE EN CURSO")) clase = "badge-green";

  return `<span class="badge ${clase}">${texto}</span>`;
}

// ===============================
// RESUMEN DEL PROCESO
// Espera contenedor: #resumenProceso
// ===============================
export function renderResumenProceso(selector = "#resumenProceso") {
  const el = $(selector);
  if (!el) return;

  el.innerHTML = `
    <div><strong>Proceso:</strong> ${DB.proceso.nombre || "No registrado"}</div>
    <div><strong>Objeto:</strong> ${DB.proceso.objeto || "No registrado"}</div>
    <div><strong>Entidad:</strong> ${DB.proceso.entidad || "No registrada"}</div>
    <div><strong>Presupuesto oficial:</strong> ${formatoMoneda(DB.proceso.presupuesto)}</div>
    <div><strong>TRM:</strong> ${DB.proceso.trm || 0}</div>
    <div><strong>Puntaje máximo:</strong> ${formatoNumero(DB.proceso.puntajeMaximo)}</div>
    <div><strong>Fecha de evaluación:</strong> ${DB.proceso.fechaEvaluacion || "No registrada"}</div>
  `;
}

// ===============================
// TABLA DE OFERTAS
// Espera tbody: #tablaOfertasBody
// ===============================
export function renderTablaOfertas(selector = "#tablaOfertasBody") {
  const tbody = $(selector);
  if (!tbody) return;

  const ofertas = obtenerOfertas();
  tbody.innerHTML = "";

  if (!ofertas.length) {
    tbody.innerHTML = `<tr><td colspan="10">No existen ofertas registradas.</td></tr>`;
    return;
  }

  ofertas.forEach(oferta => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${oferta.empresa || ""}</td>
      <td>${formatoMoneda(oferta.oferta)}</td>
      <td>${oferta.clasificacionInicial ? badgeEstado(oferta.clasificacionInicial) : ""}</td>
      <td>${oferta.alertaAbsoluta ? "SI" : "NO"}</td>
      <td>${oferta.bajoMinimoRelativo ? "SI" : "NO"}</td>
      <td>${oferta.requiereSustentacion ? "SI" : "NO"}</td>
      <td>${badgeEstado(oferta.estado || "PENDIENTE")}</td>
      <td>${oferta.respondio || ""}</td>
      <td>${oferta.sustentoValido || ""}</td>
      <td>${oferta.observacion || ""}</td>
    `;

    tbody.appendChild(tr);
  });
}

// ===============================
// RESULTADOS OAB
// Espera contenedor: #resultadoOAB
// ===============================
export function renderResultadosOAB(selector = "#resultadoOAB") {
  const el = $(selector);
  if (!el) return;

  const r = DB.resultadosOAB;

  el.innerHTML = `
    <div><strong>Promedio:</strong> ${formatoMoneda(r.promedio)}</div>
    <div><strong>Mediana:</strong> ${formatoMoneda(r.mediana)}</div>
    <div><strong>Desviación estándar:</strong> ${formatoMoneda(r.desviacion)}</div>
    <div><strong>Mínimo aceptable:</strong> ${formatoMoneda(r.minimoAceptable)}</div>
    <div><strong>Límite absoluto:</strong> ${formatoMoneda(r.limiteAbsoluto)}</div>
    <div><strong>Total de ofertas:</strong> ${formatoNumero(r.totalOfertas)}</div>
    <div><strong>Ofertas en alerta:</strong> ${formatoNumero(r.ofertasEnAlerta)}</div>
  `;
}

// ===============================
// RESUMEN TRM
// Espera contenedor: #resultadoTRM
// ===============================
export function renderResumenTRM(selector = "#resultadoTRM") {
  const el = $(selector);
  if (!el) return;

  const t = obtenerResumenTRM();

  el.innerHTML = `
    <div><strong>TRM:</strong> ${t.trm || 0}</div>
    <div><strong>Decimal:</strong> ${typeof t.decimal === "number" ? t.decimal.toFixed(2) : "0.00"}</div>
    <div><strong>Método:</strong> ${t.nombreMetodo || "No definido"}</div>
    <div><strong>Rango:</strong> ${t.rango || ""}</div>
  `;
}

// ===============================
// TABLA ECONÓMICA
// Espera tbody: #tablaEconomicaBody
// ===============================
export function renderTablaEconomica(selector = "#tablaEconomicaBody") {
  const tbody = $(selector);
  if (!tbody) return;

  const tabla = obtenerTablaEconomica();
  tbody.innerHTML = "";

  if (!tabla.length) {
    tbody.innerHTML = `<tr><td colspan="4">No existen ofertas aceptadas para evaluación económica.</td></tr>`;
    return;
  }

  tabla.forEach(item => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.ranking || ""}</td>
      <td>${item.empresa || ""}</td>
      <td>${formatoMoneda(item.oferta)}</td>
      <td>${item.puntaje ?? 0}</td>
    `;

    tbody.appendChild(tr);
  });
}

// ===============================
// RESULTADOS ECONÓMICOS
// Espera contenedor: #resultadoEconomico
// ===============================
export function renderResultadosEconomicos(selector = "#resultadoEconomico") {
  const el = $(selector);
  if (!el) return;

  const r = DB.resultadosEconomicos;

  el.innerHTML = `
    <div><strong>Método:</strong> ${r.metodo || "No definido"}</div>
    <div><strong>Mediana:</strong> ${formatoMoneda(r.mediana)}</div>
    <div><strong>Vme:</strong> ${formatoMoneda(r.vme)}</div>
    <div><strong>Media geométrica:</strong> ${formatoMoneda(r.mediaGeometrica)}</div>
    <div><strong>Media aritmética baja:</strong> ${formatoMoneda(r.mediaAritmeticaBaja)}</div>
    <div><strong>Menor valor:</strong> ${formatoMoneda(r.menorValor)}</div>
    <div><strong>Total aceptadas:</strong> ${formatoNumero(r.totalAceptadas)}</div>
    <div><strong>Mejor puntaje:</strong> ${r.mejorPuntaje || 0}</div>
    <div><strong>Proponente líder:</strong> ${r.mejorOferta?.empresa || "No definido"}</div>
  `;
}

// ===============================
// INFORMES EN TEXTAREA
// Espera ids:
// #textoInformeBasico
// #textoInformeTecnico
// #textoInformeFinal
// ===============================
export function renderInformes() {
  const basico = $("#textoInformeBasico");
  const tecnico = $("#textoInformeTecnico");
  const final = $("#textoInformeFinal");

  if (basico) basico.value = generarInformeBasico();
  if (tecnico) tecnico.value = generarInformeTecnicoCompleto();
  if (final) final.value = generarInformeFinalAdjudicacion();
}

// ===============================
// LLENAR FORMULARIO DEL PROCESO
// ===============================
export function cargarProcesoEnFormulario() {
  setValor("#procesoNombre", DB.proceso.nombre || "");
  setValor("#procesoObjeto", DB.proceso.objeto || "");
  setValor("#procesoEntidad", DB.proceso.entidad || "");
  setValor("#procesoPresupuesto", DB.proceso.presupuesto || "");
  setValor("#procesoTRM", DB.proceso.trm || "");
  setValor("#procesoPuntajeMaximo", DB.proceso.puntajeMaximo || "");
  setValor("#procesoFecha", DB.proceso.fechaEvaluacion || "");
  setValor("#procesoObservaciones", DB.proceso.observaciones || "");
}

// ===============================
// RENDER GENERAL
// ===============================
export function renderTodoUI() {
  cargarProcesoEnFormulario();
  renderResumenProceso();
  renderTablaOfertas();
  renderResultadosOAB();
  renderResumenTRM();
  renderResultadosEconomicos();
  renderTablaEconomica();
  renderInformes();
}

// ===============================
// LIMPIAR FORMULARIO DE NUEVA OFERTA
// ===============================
export function limpiarFormularioOferta() {
  setValor("#empresaOferta", "");
  setValor("#valorOferta", "");
}

// ===============================
// BLOQUEAR / DESBLOQUEAR BOTÓN
// ===============================
export function setBotonEstado(selector, deshabilitado = false, texto = "") {
  const btn = $(selector);
  if (!btn) return;

  btn.disabled = deshabilitado;
  if (texto) btn.textContent = texto;
}

// ===============================
// SCROLL A SECCIÓN
// ===============================
export function irA(selector) {
  const el = $(selector);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
