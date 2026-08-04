// =====================================
// SEMAFORO-RADICACION-MGA.JS
// CONSTRUCTOR MGA PRO
// Determina si el proyecto está listo para ser llevado a MGA Web
// =====================================

const SemaforoRadicacionMGA = (() => {

function obtenerProyecto(){
  return window.MGAProjectCore || window.currentProject || window.project || {};
}

function arr(v){
  return Array.isArray(v) ? v : [];
}

function valor(v){
  if(v === undefined || v === null) return false;
  if(typeof v === "string") return v.trim().length > 0;
  if(typeof v === "number") return !isNaN(v) && v > 0;
  if(Array.isArray(v)) return v.length > 0;
  if(typeof v === "object") return Object.keys(v).length > 0;
  return !!v;
}

function evaluar(project=null){

  const p = project || obtenerProyecto();

  const cobertura = window.PanelCoberturaMGAWeb
    ? PanelCoberturaMGAWeb.evaluar(p)
    : p.coberturaMGAWeb || null;

  const inspector = window.InspectorMGAWeb
    ? InspectorMGAWeb.evaluar(p)
    : p.inspectorMGA || null;

  const criterios = [
    {
      nombre:"Cobertura MGA Web",
      peso:25,
      ok:(cobertura?.porcentaje || 0) >= 90,
      valor:(cobertura?.porcentaje || 0) + "%"
    },
    {
      nombre:"Sin errores críticos",
      peso:20,
      ok:(inspector?.erroresCriticos || []).length === 0,
      valor:(inspector?.erroresCriticos || []).length + " error(es)"
    },
    {
      nombre:"Diagnóstico y problema",
      peso:10,
      ok:valor(p.diagnosticoMGA?.situacionActual || p.documentosMGA?.diagnostico) &&
         valor(p.diagnosticoMGA?.problemaCentral || p.arbolProblemasMGA?.problemaCentral),
      valor:"Diagnóstico / problema"
    },
    {
      nombre:"Objetivos",
      peso:10,
      ok:valor(p.arbolObjetivosMGA?.objetivoGeneral) &&
         valor(p.arbolObjetivosMGA?.objetivosEspecificos),
      valor:"General / específicos"
    },
    {
      nombre:"Cadena de valor",
      peso:10,
      ok:valor(p.cadenaValorMGA?.productos) &&
         valor(p.cadenaValorMGA?.actividades),
      valor:`${arr(p.cadenaValorMGA?.productos).length} producto(s), ${arr(p.cadenaValorMGA?.actividades).length} actividad(es)`
    },
    {
      nombre:"Indicadores",
      peso:10,
      ok:valor(p.indicadoresMGA) &&
         arr(p.indicadoresMGA).every(i => valor(i.meta) && valor(i.fuenteVerificacion)),
      valor:`${arr(p.indicadoresMGA).length} indicador(es)`
    },
    {
      nombre:"Riesgos",
      peso:5,
      ok:valor(p.riesgosMGA) &&
         arr(p.riesgosMGA).every(r => valor(r.mitigacion || r.medidaMitigacion)),
      valor:`${arr(p.riesgosMGA).length} riesgo(s)`
    },
    {
      nombre:"Presupuesto / fuentes",
      peso:5,
      ok:valor(p.presupuesto?.items || p.items || p.presupuestoPreliminarMGA?.capitulosSugeridos) &&
         valor(p.fuentesFinanciacionMGA),
      valor:"Presupuesto y financiación"
    },
    {
      nombre:"Documentos base",
      peso:5,
      ok:valor(p.documentosMGA?.justificacion) &&
         valor(p.documentosMGA?.resumenEjecutivo),
      valor:"Justificación / resumen"
    }
  ];

  const puntaje = criterios.reduce((s,c) => s + (c.ok ? c.peso : 0), 0);

  let estado = "ROJO";
  let mensaje = "No recomendado para radicar. Debe completar componentes críticos.";

  if(puntaje >= 90){
    estado = "VERDE";
    mensaje = "Proyecto técnicamente preparado para revisión final y cargue a MGA Web.";
  }else if(puntaje >= 70){
    estado = "AMARILLO";
    mensaje = "Proyecto avanzado, pero aún requiere ajustes antes de radicar.";
  }

  return {
    fecha:new Date().toISOString(),
    puntaje,
    estado,
    mensaje,
    cobertura: cobertura?.porcentaje || 0,
    calidad: inspector?.puntajeCalidad || 0,
    criterios,
    pendientes: criterios.filter(c => !c.ok)
  };
}

function clase(estado){
  if(estado === "VERDE") return "ok";
  if(estado === "AMARILLO") return "warn";
  return "bad";
}

function crear(contenedorId="panelSemaforoRadicacionMGA", project=null){
  const cont = document.getElementById(contenedorId);
  if(!cont) return;

  const r = evaluar(project);
  const cls = clase(r.estado);

  cont.innerHTML = `
    <section class="semaforo-mga-card">
      <div class="semaforo-head">
        <div>
          <h2>🚦 Semáforo de Radicación MGA</h2>
          <p>Evalúa si el proyecto está listo para revisión final y cargue en MGA Web.</p>
        </div>
        <div class="semaforo-score ${cls}">
          <strong>${r.puntaje}%</strong>
          <span>${r.estado}</span>
        </div>
      </div>

      <div class="semaforo-msg ${cls}">
        ${r.mensaje}
      </div>

      <div class="semaforo-grid">
        ${r.criterios.map(c => `
          <div class="semaforo-item ${c.ok ? "ok" : "bad"}">
            <strong>${c.ok ? "✅" : "⚠️"} ${c.nombre}</strong>
            <span>${c.valor}</span>
            <small>Peso: ${c.peso}%</small>
          </div>
        `).join("")}
      </div>

      <div class="semaforo-next">
        <strong>Siguiente acción:</strong>
        <span>${
          r.pendientes.length
          ? "Completar: " + r.pendientes.slice(0,3).map(x => x.nombre).join(", ")
          : "Realizar revisión técnica final antes de copiar a MGA Web."
        }</span>
      </div>
    </section>
  `;

  return r;
}

async function guardar(projectId, project=null){
  const p = project || obtenerProyecto();
  const r = evaluar(p);

  p.semaforoRadicacionMGA = r;
  p.estado = p.estado || {};
  p.estado.puntajeRadicacionMGA = r.puntaje;
  p.estado.estadoRadicacionMGA = r.estado;

  if(window.ProjectCoreMGA && projectId){
    ProjectCoreMGA.actualizarMemoria(p);
    await ProjectCoreMGA.guardar(projectId, p);
    window.MGAProjectCore = p;
  }

  return r;
}

return {
  evaluar,
  crear,
  guardar
};

})();

window.SemaforoRadicacionMGA = SemaforoRadicacionMGA;
