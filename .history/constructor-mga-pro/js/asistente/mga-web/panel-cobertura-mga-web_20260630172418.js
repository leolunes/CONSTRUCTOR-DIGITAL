// =====================================
// PANEL-COBERTURA-MGA-WEB.JS
// CONSTRUCTOR MGA PRO
// Calcula y muestra cobertura para llegar al 100% MGA Web
// =====================================

const PanelCoberturaMGAWeb = (() => {

const COMPONENTES = [
  // IDENTIFICACIÓN
  { grupo:"Identificación", campo:"Nombre del proyecto", path:["name","nombreProyecto","datosBasicos.nombreProyecto"], prioridad:"Muy Alta" },
  { grupo:"Identificación", campo:"Entidad formuladora", path:["entity","entidad","datosBasicos.entidadFormuladora"], prioridad:"Muy Alta" },
  { grupo:"Identificación", campo:"Sector", path:["identificacionMGA.sector","formulacionMGA.identificacion.sector"], prioridad:"Muy Alta" },
  { grupo:"Identificación", campo:"Tipología", path:["identificacionMGA.tipologia","formulacionMGA.identificacion.tipologia"], prioridad:"Muy Alta" },
  { grupo:"Identificación", campo:"Localización", path:["municipio","departamento","identificacionMGA.localizacion.municipio"], prioridad:"Alta" },
  { grupo:"Identificación", campo:"Horizonte y vigencias", path:["identificacionMGA.horizonteEvaluacion","vigenciasMGA"], prioridad:"Alta" },

  // POLÍTICA PÚBLICA
  { grupo:"Política Pública", campo:"Plan Nacional / Departamental / Municipal", path:["politicaPublica.planNacional","politicaPublica.planMunicipal"], prioridad:"Alta" },
  { grupo:"Política Pública", campo:"Programa y meta del plan", path:["politicaPublica.programaMunicipal","politicaPublica.metaMunicipal"], prioridad:"Alta" },

  // PROBLEMÁTICA
  { grupo:"Problemática", campo:"Diagnóstico", path:["diagnosticoMGA.diagnostico","diagnosticoMGA.situacionActual","formulacionMGA.diagnostico.diagnostico"], prioridad:"Muy Alta" },
  { grupo:"Problemática", campo:"Problema central", path:["diagnosticoMGA.problemaCentral","arbolProblemasMGA.problemaCentral","formulacionMGA.diagnostico.problemaCentral"], prioridad:"Muy Alta" },
  { grupo:"Problemática", campo:"Causas", path:["arbolProblemasMGA.causasDirectas","formulacionMGA.arbolProblemas.causasDirectas"], prioridad:"Muy Alta" },
  { grupo:"Problemática", campo:"Efectos", path:["arbolProblemasMGA.efectosDirectos","formulacionMGA.arbolProblemas.efectosDirectos"], prioridad:"Muy Alta" },
  { grupo:"Problemática", campo:"Magnitud del problema", path:["diagnosticoMGA.magnitudProblema"], prioridad:"Alta" },

  // PARTICIPANTES
  { grupo:"Participantes", campo:"Actores participantes", path:["participantesMGA"], prioridad:"Alta" },

  // POBLACIÓN
  { grupo:"Población", campo:"Población afectada", path:["poblacionMGA.poblacionAfectada.cantidad","formulacionMGA.diagnostico.poblacionObjetivo"], prioridad:"Muy Alta" },
  { grupo:"Población", campo:"Población objetivo", path:["poblacionMGA.poblacionObjetivo.cantidad","beneficiarios","formulacionMGA.identificacion.idea"], prioridad:"Muy Alta" },
  { grupo:"Población", campo:"Caracterización", path:["poblacionMGA.caracterizacion.grupoPoblacional","poblacionMGA.caracterizacion.enfoqueDiferencial"], prioridad:"Alta" },

  // OBJETIVOS
  { grupo:"Objetivos", campo:"Objetivo general", path:["arbolObjetivosMGA.objetivoGeneral","formulacionMGA.arbolObjetivos.objetivoGeneral"], prioridad:"Muy Alta" },
  { grupo:"Objetivos", campo:"Objetivos específicos", path:["arbolObjetivosMGA.objetivosEspecificos","formulacionMGA.arbolObjetivos.objetivosEspecificos"], prioridad:"Muy Alta" },

  // ALTERNATIVAS
  { grupo:"Alternativas", campo:"Alternativas evaluadas", path:["alternativasMGA"], prioridad:"Muy Alta" },
  { grupo:"Alternativas", campo:"Alternativa seleccionada", path:["alternativaSeleccionadaMGA.nombre","alternativaSeleccionadaMGA.descripcion"], prioridad:"Muy Alta" },

  // CADENA DE VALOR
  { grupo:"Cadena de Valor", campo:"Productos", path:["cadenaValorMGA.productos","cadenaValorMGA.objetivosEspecificos.0.productos","formulacionMGA.cadenaValor.productos"], prioridad:"Muy Alta" },
  { grupo:"Cadena de Valor", campo:"Actividades", path:["cadenaValorMGA.actividades","formulacionMGA.cadenaValor.actividades"], prioridad:"Muy Alta" },
  { grupo:"Cadena de Valor", campo:"Metas", path:["cadenaValorMGA.metas","cadenaValorMGA.objetivosEspecificos.0.productos.0.meta"], prioridad:"Muy Alta" },
  { grupo:"Cadena de Valor", campo:"Relación con presupuesto", path:["cadenaValorMGA.relacionPresupuesto","presupuestoPreliminarMGA.capitulosSugeridos"], prioridad:"Muy Alta" },

  // INDICADORES
  { grupo:"Indicadores", campo:"Indicadores", path:["indicadoresMGA","formulacionMGA.indicadores"], prioridad:"Muy Alta" },
  { grupo:"Indicadores", campo:"Línea base y meta", path:["indicadoresMGA.0.lineaBase","indicadoresMGA.0.meta"], prioridad:"Alta" },
  { grupo:"Indicadores", campo:"Fuente de verificación", path:["indicadoresMGA.0.fuenteVerificacion"], prioridad:"Alta" },

  // RIESGOS
  { grupo:"Riesgos", campo:"Matriz de riesgos", path:["riesgosMGA","formulacionMGA.riesgos"], prioridad:"Alta" },
  { grupo:"Riesgos", campo:"Mitigación y responsable", path:["riesgosMGA.0.mitigacion","riesgosMGA.0.responsable"], prioridad:"Media" },

  // COSTOS
  { grupo:"Costos", campo:"Presupuesto", path:["items","presupuesto.items","presupuestoPreliminarMGA.capitulosSugeridos"], prioridad:"Muy Alta" },
  { grupo:"Costos", campo:"APUs", path:["apus","presupuesto.apus"], prioridad:"Alta" },
  { grupo:"Costos", campo:"Costos indirectos", path:["settings.adminPct","presupuesto.administracionPct"], prioridad:"Alta" },

  // FINANCIACIÓN
  { grupo:"Financiación", campo:"Fuentes", path:["fuentesFinanciacionMGA","formulacionMGA.fuentesFinanciacion"], prioridad:"Muy Alta" },
  { grupo:"Financiación", campo:"Valores por fuente y vigencia", path:["fuentesFinanciacionMGA.0.valor","fuentesFinanciacionMGA.0.vigencia"], prioridad:"Alta" },

  // CRONOGRAMA
  { grupo:"Cronograma", campo:"Cronograma físico", path:["cronogramaMGA.actividades"], prioridad:"Alta" },
  { grupo:"Cronograma", campo:"Cronograma financiero", path:["cronogramaMGA.actividades.0.costoProgramado"], prioridad:"Alta" },

  // SOSTENIBILIDAD
  { grupo:"Sostenibilidad", campo:"Sostenibilidad técnica", path:["sostenibilidadMGA.tecnica","documentosMGA.sostenibilidad","formulacionMGA.documentos.sostenibilidad"], prioridad:"Alta" },
  { grupo:"Sostenibilidad", campo:"Sostenibilidad financiera", path:["sostenibilidadMGA.financiera"], prioridad:"Alta" },
  { grupo:"Sostenibilidad", campo:"Sostenibilidad ambiental", path:["sostenibilidadMGA.ambiental"], prioridad:"Media" },

  // DOCUMENTOS
  { grupo:"Documentos", campo:"Justificación", path:["documentosMGA.justificacion","formulacionMGA.documentos.justificacion"], prioridad:"Muy Alta" },
  { grupo:"Documentos", campo:"Resumen ejecutivo", path:["documentosMGA.resumenEjecutivo","formulacionMGA.documentos.resumenEjecutivo"], prioridad:"Alta" },
  { grupo:"Documentos", campo:"Marco lógico", path:["documentosMGA.marcoLogico","formulacionMGA.documentos.marcoLogico"], prioridad:"Alta" },
  { grupo:"Documentos", campo:"Soportes / adjuntos", path:["adjuntos","documents"], prioridad:"Media" }
];

function get(obj, path){
  return String(path).split(".").reduce((acc, key) => {
    if(acc === undefined || acc === null) return undefined;
    if(Array.isArray(acc) && !isNaN(Number(key))) return acc[Number(key)];
    return acc[key];
  }, obj);
}

function tieneValor(v){
  if(v === undefined || v === null) return false;
  if(typeof v === "string") return v.trim().length > 0;
  if(typeof v === "number") return !isNaN(v) && v !== 0;
  if(Array.isArray(v)) return v.length > 0;
  if(typeof v === "object") return Object.keys(v).length > 0;
  return !!v;
}

function evaluarCampo(project, componente){
  const encontrado = componente.path.some(p => tieneValor(get(project, p)));
  return {
    ...componente,
    estado: encontrado ? "Completo" : "Pendiente",
    ok: encontrado
  };
}

function evaluar(project){
  const campos = COMPONENTES.map(c => evaluarCampo(project || {}, c));
  const completos = campos.filter(c => c.ok).length;
  const pendientes = campos.length - completos;
  const porcentaje = campos.length ? Math.round((completos / campos.length) * 100) : 0;

  const grupos = {};
  campos.forEach(c => {
    if(!grupos[c.grupo]){
      grupos[c.grupo] = { grupo:c.grupo, total:0, completos:0, pendientes:0, porcentaje:0, campos:[] };
    }
    grupos[c.grupo].total++;
    if(c.ok) grupos[c.grupo].completos++;
    else grupos[c.grupo].pendientes++;
    grupos[c.grupo].campos.push(c);
  });

  Object.values(grupos).forEach(g => {
    g.porcentaje = g.total ? Math.round((g.completos / g.total) * 100) : 0;
  });

  return {
    porcentaje,
    total:campos.length,
    completos,
    pendientes,
    campos,
    grupos:Object.values(grupos)
  };
}

function obtenerProyectoActual(){
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("projectId") || "";

  if(window.App && App.project) return App.project;
  if(window.currentProject) return window.currentProject;
  if(window.project) return window.project;

  try{
    const raw = localStorage.getItem("mga_autocompletado_" + projectId);
    if(raw){
      const parsed = JSON.parse(raw);
      return parsed.data || parsed.paquete || parsed;
    }
  }catch(e){}

  return {};
}

function colorClase(pct){
  if(pct >= 90) return "ok";
  if(pct >= 60) return "warn";
  return "bad";
}

function render(contenedorId="panelCoberturaMGAWeb", project=null){
  const cont = document.getElementById(contenedorId);
  if(!cont) return;

  const data = evaluar(project || obtenerProyectoActual());

  const pendientesCriticos = data.campos
    .filter(c => !c.ok && (c.prioridad === "Muy Alta" || c.prioridad === "Alta"))
    .slice(0, 8);

  cont.innerHTML = `
    <section class="cobertura-mga-card">
      <div class="cobertura-head">
        <div>
          <h2>📊 Cobertura MGA Web</h2>
          <p>Estado de completitud de los componentes necesarios para preparar la MGA Web.</p>
        </div>
        <div class="cobertura-score ${colorClase(data.porcentaje)}">
          ${data.porcentaje}%
        </div>
      </div>

      <div class="cobertura-bar">
        <div style="width:${data.porcentaje}%"></div>
      </div>

      <div class="cobertura-kpis">
        <div><strong>${data.total}</strong><span>Componentes</span></div>
        <div><strong>${data.completos}</strong><span>Completos</span></div>
        <div><strong>${data.pendientes}</strong><span>Pendientes</span></div>
      </div>

      <div class="cobertura-grid">
        ${data.grupos.map(g => `
          <div class="cobertura-grupo">
            <div class="row space">
              <strong>${g.grupo}</strong>
              <span class="chip ${colorClase(g.porcentaje)}">${g.porcentaje}%</span>
            </div>
            <small>${g.completos}/${g.total} completos</small>
          </div>
        `).join("")}
      </div>

      <div class="cobertura-pendientes">
        <h3>Próximos campos críticos por completar</h3>
        ${
          pendientesCriticos.length
          ? `<ul>${pendientesCriticos.map(c => `<li><b>${c.grupo}:</b> ${c.campo}</li>`).join("")}</ul>`
          : `<p>✅ No hay campos críticos pendientes. Revise detalles finales y documentos soporte.</p>`
        }
      </div>

      <div class="cobertura-next">
        <strong>Siguiente paso recomendado:</strong>
        <span>${siguientePaso(data)}</span>
      </div>
    </section>
  `;

  return data;
}

function siguientePaso(data){
  const prioridades = ["Política Pública","Participantes","Población","Alternativas","Cadena de Valor","Financiación","Cronograma"];
  for(const g of prioridades){
    const grupo = data.grupos.find(x => x.grupo === g && x.pendientes > 0);
    if(grupo){
      const campo = grupo.campos.find(c => !c.ok);
      return `Completar ${campo ? campo.campo : grupo.grupo}.`;
    }
  }
  if(data.porcentaje < 100) return "Revisar componentes pendientes y soportes documentales.";
  return "Proyecto con cobertura completa. Proceda a revisión técnica final.";
}

return {
  COMPONENTES,
  evaluar,
  render
};

})();

window.PanelCoberturaMGAWeb = PanelCoberturaMGAWeb;
