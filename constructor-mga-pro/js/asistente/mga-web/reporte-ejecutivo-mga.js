// =====================================
// REPORTE-EJECUTIVO-MGA.JS
// CONSTRUCTOR MGA PRO
// Genera un reporte ejecutivo integral del estado del proyecto MGA
// =====================================

const ReporteEjecutivoMGA = (() => {

function obtenerProyecto(){
  return window.MGAProjectCore || window.currentProject || window.project || {};
}

function arr(v){
  return Array.isArray(v) ? v : [];
}

function esc(v){
  return String(v || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

function moneda(v){
  const n = Number(v || 0);
  return n.toLocaleString("es-CO", {
    style:"currency",
    currency:"COP",
    maximumFractionDigits:0
  });
}

function construir(project=null){

  const p = project || obtenerProyecto();

  const cobertura = window.PanelCoberturaMGAWeb
    ? PanelCoberturaMGAWeb.evaluar(p)
    : p.coberturaMGAWeb || null;

  const inspector = window.InspectorMGAWeb
    ? InspectorMGAWeb.evaluar(p)
    : p.inspectorMGA || null;

  const semaforo = window.SemaforoRadicacionMGA
    ? SemaforoRadicacionMGA.evaluar(p)
    : p.semaforoRadicacionMGA || null;

  const valorProyecto =
    p.presupuesto?.valorTotal ||
    p.datosBasicos?.valorTotal ||
    p.total ||
    0;

  return {
    fecha:new Date().toLocaleString("es-CO"),
    identificacion:{
      nombre:p.datosBasicos?.nombreProyecto || "Proyecto sin nombre definido",
      entidad:p.datosBasicos?.entidadFormuladora || "",
      departamento:p.datosBasicos?.departamento || p.identificacionMGA?.localizacion?.departamento || "",
      municipio:p.datosBasicos?.municipio || p.identificacionMGA?.localizacion?.municipio || "",
      sector:p.identificacionMGA?.sector || "",
      tipologia:p.identificacionMGA?.tipologia || "",
      producto:p.identificacionMGA?.productoMGA || ""
    },
    resumen:{
      problema:p.diagnosticoMGA?.problemaCentral || p.arbolProblemasMGA?.problemaCentral || "",
      objetivo:p.arbolObjetivosMGA?.objetivoGeneral || "",
      justificacion:p.documentosMGA?.justificacion || p.diagnosticoMGA?.justificacion || "",
      resumenEjecutivo:p.documentosMGA?.resumenEjecutivo || ""
    },
    poblacion:{
      afectada:p.poblacionMGA?.poblacionAfectada?.cantidad || 0,
      objetivo:p.poblacionMGA?.poblacionObjetivo?.cantidad || 0,
      descripcionObjetivo:p.poblacionMGA?.poblacionObjetivo?.descripcion || ""
    },
    cadenaValor:{
      productos:arr(p.cadenaValorMGA?.productos),
      actividades:arr(p.cadenaValorMGA?.actividades)
    },
    indicadores:arr(p.indicadoresMGA),
    riesgos:arr(p.riesgosMGA),
    presupuesto:{
      valor:valorProyecto,
      items:arr(p.presupuesto?.items || p.items).length,
      apus:arr(p.presupuesto?.apus || p.apus).length,
      fuentes:arr(p.fuentesFinanciacionMGA)
    },
    estado:{
      cobertura:cobertura?.porcentaje || 0,
      calidad:inspector?.puntajeCalidad || 0,
      errores:arr(inspector?.erroresCriticos).length,
      advertencias:arr(inspector?.advertencias).length,
      semaforo:semaforo?.estado || "SIN EVALUAR",
      puntajeRadicacion:semaforo?.puntaje || 0,
      mensajeRadicacion:semaforo?.mensaje || ""
    },
    pendientes:{
      cobertura:arr(cobertura?.campos).filter(x => !x.ok).slice(0,10),
      inspector:arr(inspector?.recomendaciones).slice(0,10),
      semaforo:arr(semaforo?.pendientes).slice(0,10)
    }
  };
}

function textoReporte(r){

  return [
    "REPORTE EJECUTIVO MGA",
    "Fecha: " + r.fecha,
    "",
    "1. IDENTIFICACIÓN",
    "Proyecto: " + r.identificacion.nombre,
    "Entidad formuladora: " + r.identificacion.entidad,
    "Departamento: " + r.identificacion.departamento,
    "Municipio: " + r.identificacion.municipio,
    "Sector: " + r.identificacion.sector,
    "Tipología: " + r.identificacion.tipologia,
    "Producto MGA: " + r.identificacion.producto,
    "",
    "2. PROBLEMA CENTRAL",
    r.resumen.problema,
    "",
    "3. OBJETIVO GENERAL",
    r.resumen.objetivo,
    "",
    "4. POBLACIÓN",
    "Población afectada: " + r.poblacion.afectada,
    "Población objetivo: " + r.poblacion.objetivo,
    "Descripción: " + r.poblacion.descripcionObjetivo,
    "",
    "5. CADENA DE VALOR",
    "Productos: " + r.cadenaValor.productos.length,
    "Actividades: " + r.cadenaValor.actividades.length,
    "",
    "6. INDICADORES Y RIESGOS",
    "Indicadores: " + r.indicadores.length,
    "Riesgos: " + r.riesgos.length,
    "",
    "7. PRESUPUESTO",
    "Valor estimado: " + moneda(r.presupuesto.valor),
    "Ítems: " + r.presupuesto.items,
    "APUs: " + r.presupuesto.apus,
    "Fuentes de financiación: " + r.presupuesto.fuentes.length,
    "",
    "8. ESTADO MGA",
    "Cobertura MGA Web: " + r.estado.cobertura + "%",
    "Calidad técnica: " + r.estado.calidad,
    "Errores críticos: " + r.estado.errores,
    "Advertencias: " + r.estado.advertencias,
    "Semáforo de radicación: " + r.estado.semaforo,
    "Puntaje de radicación: " + r.estado.puntajeRadicacion + "%",
    "Mensaje: " + r.estado.mensajeRadicacion,
    "",
    "9. PRINCIPALES PENDIENTES",
    ...(r.pendientes.semaforo.length
      ? r.pendientes.semaforo.map((x,i)=>`${i+1}. ${x.nombre}`)
      : ["No se registran pendientes principales según el semáforo."]),
    "",
    "10. RESUMEN EJECUTIVO",
    r.resumen.resumenEjecutivo || r.resumen.justificacion
  ].join("\n");
}

function crear(contenedorId="panelReporteEjecutivoMGA", project=null){

  const cont = document.getElementById(contenedorId);
  if(!cont) return;

  const r = construir(project);
  const texto = textoReporte(r);

  cont.innerHTML = `
    <section class="reporte-ejecutivo-mga-card">
      <div class="reporte-head">
        <div>
          <h2>📑 Reporte Ejecutivo MGA</h2>
          <p>Resumen técnico integral del proyecto, cobertura, calidad y estado de radicación.</p>
        </div>
        <button class="btn primary" id="btnCopiarReporteEjecutivoMGA" type="button">Copiar reporte</button>
      </div>

      <div class="reporte-kpis">
        <div><strong>${r.estado.cobertura}%</strong><span>Cobertura MGA</span></div>
        <div><strong>${r.estado.calidad}</strong><span>Calidad técnica</span></div>
        <div><strong>${r.estado.semaforo}</strong><span>Radicación</span></div>
        <div><strong>${moneda(r.presupuesto.valor)}</strong><span>Valor estimado</span></div>
      </div>

      <div class="reporte-bloque">
        <h3>Identificación</h3>
        <p><b>Proyecto:</b> ${esc(r.identificacion.nombre)}</p>
        <p><b>Sector:</b> ${esc(r.identificacion.sector)} — <b>Tipología:</b> ${esc(r.identificacion.tipologia)}</p>
        <p><b>Ubicación:</b> ${esc(r.identificacion.departamento)} / ${esc(r.identificacion.municipio)}</p>
      </div>

      <div class="reporte-bloque">
        <h3>Problema y objetivo</h3>
        <p><b>Problema:</b> ${esc(r.resumen.problema)}</p>
        <p><b>Objetivo:</b> ${esc(r.resumen.objetivo)}</p>
      </div>

      <div class="reporte-bloque">
        <h3>Estado para MGA Web</h3>
        <p>${esc(r.estado.mensajeRadicacion)}</p>
        <ul>
          <li>Cobertura MGA Web: ${r.estado.cobertura}%</li>
          <li>Errores críticos: ${r.estado.errores}</li>
          <li>Advertencias: ${r.estado.advertencias}</li>
          <li>Puntaje radicación: ${r.estado.puntajeRadicacion}%</li>
        </ul>
      </div>

      <div class="reporte-bloque">
        <h3>Pendientes principales</h3>
        ${
          r.pendientes.semaforo.length
          ? `<ul>${r.pendientes.semaforo.map(x=>`<li>${esc(x.nombre)}</li>`).join("")}</ul>`
          : `<p>✅ No se registran pendientes principales según el semáforo.</p>`
        }
      </div>

      <textarea id="txtReporteEjecutivoMGA" readonly>${esc(texto)}</textarea>
    </section>
  `;

  const btn = document.getElementById("btnCopiarReporteEjecutivoMGA");
  if(btn){
    btn.onclick = async () => {
      await navigator.clipboard.writeText(texto);
      btn.textContent = "Reporte copiado";
      setTimeout(()=>btn.textContent="Copiar reporte", 1200);
    };
  }

  return r;
}

return {
  construir,
  textoReporte,
  crear
};

})();

window.ReporteEjecutivoMGA = ReporteEjecutivoMGA;
