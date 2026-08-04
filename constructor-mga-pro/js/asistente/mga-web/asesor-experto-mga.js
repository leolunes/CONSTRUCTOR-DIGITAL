// =====================================
// ASESOR-EXPERTO-MGA.JS
// CONSTRUCTOR MGA PRO
// Asesor inteligente para completar el 100% de la MGA Web
// =====================================

const AsesorExpertoMGA = (() => {

function ahoraISO(){
  return new Date().toISOString();
}

function esc(v){
  return String(v || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

function txt(v){
  return String(v || "").trim();
}

function arr(v){
  return Array.isArray(v) ? v : [];
}

function obtenerProyecto(){
  return window.MGAProjectCore || window.currentProject || window.project || {};
}

function evaluar(project){
  const p = project || obtenerProyecto();

  const cobertura = window.PanelCoberturaMGAWeb
    ? PanelCoberturaMGAWeb.evaluar(p)
    : null;

  const inspector = window.InspectorMGAWeb
    ? InspectorMGAWeb.evaluar(p)
    : null;

  return { project:p, cobertura, inspector };
}

function detectarFaltantes(project){
  const e = evaluar(project);
  const camposPendientes = e.cobertura?.campos?.filter(c => !c.ok) || [];
  const errores = e.inspector?.erroresCriticos || [];
  const advertencias = e.inspector?.advertencias || [];

  return {
    cobertura:e.cobertura,
    inspector:e.inspector,
    camposPendientes,
    errores,
    advertencias
  };
}

function preguntaParaCampo(campo){
  const nombre = campo?.campo || "";
  const grupo = campo?.grupo || "";

  const mapa = {
    "Entidad formuladora":"¿Cuál es la entidad formuladora del proyecto?",
    "Sector":"¿A qué sector pertenece el proyecto? Ejemplo: Transporte, Salud, Educación, Agua Potable, Deporte.",
    "Tipología":"¿Qué tipo de intervención es? Ejemplo: placa huella, centro de salud, institución educativa, acueducto.",
    "Localización":"¿En qué departamento, municipio, vereda o barrio se ejecutará el proyecto?",
    "Horizonte y vigencias":"¿En qué año inicia y en qué año termina la ejecución del proyecto?",
    "Plan Nacional / Departamental / Municipal":"¿A qué plan de desarrollo o línea estratégica se articula el proyecto?",
    "Programa y meta del plan":"¿Cuál programa, meta o indicador del plan de desarrollo atiende este proyecto?",
    "Diagnóstico":"Describa brevemente la situación actual que justifica el proyecto.",
    "Problema central":"¿Cuál es el problema principal que se busca resolver?",
    "Causas":"¿Cuáles son las principales causas de ese problema?",
    "Efectos":"¿Qué consecuencias produce actualmente ese problema?",
    "Magnitud del problema":"¿Cómo se mide actualmente el problema? Incluya cantidad, porcentaje o evidencia.",
    "Actores participantes":"¿Qué actores participan? Ejemplo: Alcaldía, comunidad, beneficiarios, interventoría, entidad financiadora.",
    "Población afectada":"¿Cuántas personas están afectadas por el problema y cuál es la fuente de ese dato?",
    "Población objetivo":"¿Cuántas personas serán beneficiarias directas del proyecto?",
    "Caracterización":"¿Qué características tiene la población? Edad, género, condición diferencial o vulnerabilidad.",
    "Objetivo general":"¿Qué resultado principal espera lograr el proyecto?",
    "Objetivos específicos":"¿Qué logros específicos permitirán alcanzar el objetivo general?",
    "Alternativas evaluadas":"¿Qué alternativas de solución se analizaron antes de seleccionar esta intervención?",
    "Alternativa seleccionada":"¿Cuál alternativa se seleccionó y por qué es la más conveniente?",
    "Productos":"¿Qué productos concretos entregará el proyecto?",
    "Actividades":"¿Qué actividades deben ejecutarse para obtener esos productos?",
    "Metas":"¿Cuál es la meta física de cada producto o actividad?",
    "Relación con presupuesto":"¿Qué capítulos o ítems del presupuesto corresponden a cada actividad?",
    "Indicadores":"¿Cómo se medirá el cumplimiento del proyecto?",
    "Línea base y meta":"¿Cuál es la situación inicial del indicador y cuál es la meta esperada?",
    "Fuente de verificación":"¿Qué documento o fuente verificará el indicador?",
    "Matriz de riesgos":"¿Qué riesgos podrían afectar la ejecución del proyecto?",
    "Mitigación y responsable":"¿Qué acción mitigará cada riesgo y quién será responsable?",
    "Presupuesto":"¿El proyecto ya cuenta con presupuesto o valor estimado?",
    "APUs":"¿Los ítems principales tienen análisis de precios unitarios?",
    "Costos indirectos":"¿Cuáles serán los porcentajes de administración, imprevistos, utilidad e IVA?",
    "Fuentes":"¿Con qué fuentes se financiará el proyecto?",
    "Valores por fuente y vigencia":"¿Qué valor aporta cada fuente y en qué vigencia?",
    "Cronograma físico":"¿Cuáles son las actividades y fechas de ejecución?",
    "Cronograma financiero":"¿Cómo se distribuirá el presupuesto en el tiempo?",
    "Sostenibilidad técnica":"¿Cómo se garantizará la operación técnica del proyecto después de ejecutado?",
    "Sostenibilidad financiera":"¿Quién asumirá los costos de operación y mantenimiento?",
    "Sostenibilidad ambiental":"¿Qué medidas ambientales se tendrán en cuenta?",
    "Justificación":"¿Por qué es necesario ejecutar el proyecto?",
    "Resumen ejecutivo":"¿Desea que genere un resumen ejecutivo con la información disponible?",
    "Marco lógico":"¿Desea que construya el marco lógico del proyecto?",
    "Soportes / adjuntos":"¿Qué documentos soporte tiene el proyecto?"
  };

  return mapa[nombre] || `Para completar ${grupo} - ${nombre}, indique la información correspondiente.`;
}

function siguientePregunta(project){
  const faltantes = detectarFaltantes(project);

  if(faltantes.errores.length){
    const err = faltantes.errores[0];
    return {
      tipo:"error",
      grupo:err.modulo,
      campo:err.modulo,
      pregunta:err.accion || err.mensaje,
      razon:err.mensaje
    };
  }

  if(faltantes.camposPendientes.length){
    const campo = faltantes.camposPendientes.find(c => c.prioridad === "Muy Alta") ||
                  faltantes.camposPendientes.find(c => c.prioridad === "Alta") ||
                  faltantes.camposPendientes[0];

    return {
      tipo:"campo",
      grupo:campo.grupo,
      campo:campo.campo,
      pregunta:preguntaParaCampo(campo),
      razon:`Este campo está pendiente y afecta la cobertura MGA Web.`
    };
  }

  if(faltantes.advertencias.length){
    const adv = faltantes.advertencias[0];
    return {
      tipo:"advertencia",
      grupo:adv.modulo,
      campo:adv.modulo,
      pregunta:adv.accion || adv.mensaje,
      razon:adv.mensaje
    };
  }

  return {
    tipo:"completo",
    grupo:"MGA Web",
    campo:"Revisión final",
    pregunta:"El proyecto no presenta pendientes críticos. Realice una revisión técnica final antes de copiar a MGA Web.",
    razon:"La cobertura y el inspector no detectan faltantes principales."
  };
}

function generarPlanTrabajo(project){
  const faltantes = detectarFaltantes(project);

  const campos = faltantes.camposPendientes || [];

  const bloques = [
    "Identificación",
    "Política Pública",
    "Problemática",
    "Participantes",
    "Población",
    "Objetivos",
    "Alternativas",
    "Cadena de Valor",
    "Indicadores",
    "Riesgos",
    "Costos",
    "Financiación",
    "Cronograma",
    "Sostenibilidad",
    "Documentos"
  ];

  return bloques.map(grupo => {
    const pendientes = campos.filter(c => c.grupo === grupo);
    return {
      grupo,
      totalPendientes:pendientes.length,
      pendientes:pendientes.map(c => c.campo),
      estado:pendientes.length ? "Pendiente" : "Completo"
    };
  });
}

function aplicarRespuestaSimple(project, campo, respuesta){
  const p = project || obtenerProyecto();
  const r = txt(respuesta);

  if(!r) return p;

  switch(campo){
    case "Entidad formuladora":
      p.datosBasicos = p.datosBasicos || {};
      p.datosBasicos.entidadFormuladora = r;
      break;

    case "Sector":
      p.identificacionMGA = p.identificacionMGA || {};
      p.identificacionMGA.sector = r;
      break;

    case "Tipología":
      p.identificacionMGA = p.identificacionMGA || {};
      p.identificacionMGA.tipologia = r;
      break;

    case "Localización":
      p.identificacionMGA = p.identificacionMGA || {};
      p.identificacionMGA.localizacion = p.identificacionMGA.localizacion || {};
      p.identificacionMGA.localizacion.descripcion = r;
      break;

    case "Diagnóstico":
      p.diagnosticoMGA = p.diagnosticoMGA || {};
      p.diagnosticoMGA.situacionActual = r;
      p.documentosMGA = p.documentosMGA || {};
      p.documentosMGA.diagnostico = r;
      break;

    case "Problema central":
      p.diagnosticoMGA = p.diagnosticoMGA || {};
      p.arbolProblemasMGA = p.arbolProblemasMGA || {};
      p.diagnosticoMGA.problemaCentral = r;
      p.arbolProblemasMGA.problemaCentral = r;
      break;

    case "Causas":
      p.arbolProblemasMGA = p.arbolProblemasMGA || {};
      p.arbolProblemasMGA.causasDirectas = r.split(";").map(x => x.trim()).filter(Boolean);
      break;

    case "Efectos":
      p.arbolProblemasMGA = p.arbolProblemasMGA || {};
      p.arbolProblemasMGA.efectosDirectos = r.split(";").map(x => x.trim()).filter(Boolean);
      break;

    case "Objetivo general":
      p.arbolObjetivosMGA = p.arbolObjetivosMGA || {};
      p.arbolObjetivosMGA.objetivoGeneral = r;
      break;

    case "Objetivos específicos":
      p.arbolObjetivosMGA = p.arbolObjetivosMGA || {};
      p.arbolObjetivosMGA.objetivosEspecificos = r.split(";").map(x => x.trim()).filter(Boolean);
      break;

    case "Población afectada":
      p.poblacionMGA = p.poblacionMGA || {};
      p.poblacionMGA.poblacionAfectada = p.poblacionMGA.poblacionAfectada || {};
      p.poblacionMGA.poblacionAfectada.descripcion = r;
      p.poblacionMGA.poblacionAfectada.cantidad = Number(r.match(/\d+/)?.[0] || 0);
      break;

    case "Población objetivo":
      p.poblacionMGA = p.poblacionMGA || {};
      p.poblacionMGA.poblacionObjetivo = p.poblacionMGA.poblacionObjetivo || {};
      p.poblacionMGA.poblacionObjetivo.descripcion = r;
      p.poblacionMGA.poblacionObjetivo.cantidad = Number(r.match(/\d+/)?.[0] || 0);
      break;

    case "Actores participantes":
      p.participantesMGA = r.split(";").map(x => ({
        actor:x.trim(),
        tipoActor:"",
        rol:"",
        interes:"",
        contribucion:""
      })).filter(x => x.actor);
      break;

    case "Alternativas evaluadas":
      p.alternativasMGA = r.split(";").map((x,i) => ({
        id:"alt_" + (i+1),
        nombre:x.trim(),
        descripcion:x.trim(),
        seleccionada:i===0
      })).filter(x => x.nombre);
      break;

    case "Alternativa seleccionada":
      p.alternativaSeleccionadaMGA = p.alternativaSeleccionadaMGA || {};
      p.alternativaSeleccionadaMGA.nombre = r;
      p.alternativaSeleccionadaMGA.descripcion = r;
      p.alternativaSeleccionadaMGA.justificacion = "Se selecciona por ser la alternativa más conveniente técnica, social y financieramente.";
      break;

    case "Productos":
      p.cadenaValorMGA = p.cadenaValorMGA || {};
      p.cadenaValorMGA.productos = r.split(";").map((x,i) => ({
        id:"prod_" + (i+1),
        nombreProducto:x.trim(),
        descripcion:x.trim(),
        unidadMedida:"",
        meta:0
      })).filter(x => x.nombreProducto);
      break;

    case "Actividades":
      p.cadenaValorMGA = p.cadenaValorMGA || {};
      p.cadenaValorMGA.actividades = r.split(";").map((x,i) => ({
        id:"act_" + (i+1),
        descripcion:x.trim(),
        costo:0
      })).filter(x => x.descripcion);
      break;

    case "Fuentes":
      p.fuentesFinanciacionMGA = r.split(";").map((x,i) => ({
        id:"fuente_" + (i+1),
        fuente:x.trim(),
        tipoFuente:"",
        entidadFinanciadora:"",
        vigencia:"",
        valor:0
      })).filter(x => x.fuente);
      break;

    case "Justificación":
      p.documentosMGA = p.documentosMGA || {};
      p.documentosMGA.justificacion = r;
      p.diagnosticoMGA = p.diagnosticoMGA || {};
      p.diagnosticoMGA.justificacion = r;
      break;

    default:
      p.memoriaInteligente = p.memoriaInteligente || {};
      p.memoriaInteligente.ultimaRespuestaAsesor = {
        campo,
        respuesta:r,
        fecha:ahoraISO()
      };
      break;
  }

  p.historialInteligente = arr(p.historialInteligente);
  p.historialInteligente.push({
    fecha:ahoraISO(),
    tipo:"ASESOR_EXPERTO_MGA",
    titulo:"Respuesta registrada por Asesor Experto MGA",
    descripcion:`Campo: ${campo}`,
    respuesta:r
  });

  if(window.PanelCoberturaMGAWeb){
    const cobertura = PanelCoberturaMGAWeb.evaluar(p);
    p.coberturaMGAWeb = cobertura;
    p.estado = p.estado || {};
    p.estado.coberturaMGAWeb = cobertura.porcentaje;
  }

  if(window.InspectorMGAWeb){
    p.inspectorMGA = InspectorMGAWeb.evaluar(p);
  }

  if(window.ProjectCoreMGA){
    ProjectCoreMGA.actualizarMemoria(p);
  }

  window.MGAProjectCore = p;

  return p;
}

async function guardar(projectId, project){
  if(window.ProjectCoreMGA && projectId){
    await ProjectCoreMGA.guardar(projectId, project);
  }
}

function crear(contenedorId="panelAsesorExpertoMGA"){
  const cont = document.getElementById(contenedorId);
  if(!cont) return;

  const estado = evaluar();
  const pregunta = siguientePregunta(estado.project);
  const plan = generarPlanTrabajo(estado.project);

  cont.innerHTML = `
    <section class="asesor-experto-card">
      <div class="asesor-head">
        <div>
          <h2>🧠 Asesor Experto MGA</h2>
          <p>Guía inteligente para completar progresivamente el 100% de la MGA Web.</p>
        </div>
        <span class="asesor-badge">${estado.cobertura?.porcentaje ?? 0}% MGA</span>
      </div>

      <div class="asesor-question">
        <strong>${esc(pregunta.grupo)} / ${esc(pregunta.campo)}</strong>
        <p>${esc(pregunta.pregunta)}</p>
        <small>${esc(pregunta.razon)}</small>
      </div>

      <textarea id="asesorRespuestaMGA" rows="4" placeholder="Escriba aquí la respuesta para completar este componente..."></textarea>

      <div class="asesor-actions">
        <button class="btn primary" id="btnAsesorGuardarRespuesta" type="button">Guardar respuesta y recalcular</button>
        <button class="btn" id="btnAsesorActualizar" type="button">Actualizar asesor</button>
      </div>

      <div class="asesor-plan">
        <h3>Plan de trabajo MGA Web</h3>
        <div class="asesor-plan-grid">
          ${plan.map(x => `
            <div class="asesor-plan-item ${x.estado === "Completo" ? "ok" : "warn"}">
              <strong>${esc(x.grupo)}</strong>
              <span>${x.estado === "Completo" ? "Completo" : x.totalPendientes + " pendiente(s)"}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `;

  const btnGuardar = document.getElementById("btnAsesorGuardarRespuesta");
  const btnActualizar = document.getElementById("btnAsesorActualizar");

  if(btnGuardar){
    btnGuardar.onclick = async () => {
      const respuesta = document.getElementById("asesorRespuestaMGA")?.value || "";
      const params = new URLSearchParams(window.location.search);
      const projectId = params.get("projectId") || "";

      if(!txt(respuesta)){
        alert("Escriba una respuesta antes de guardar.");
        return;
      }

      const p = aplicarRespuestaSimple(obtenerProyecto(), pregunta.campo, respuesta);
      await guardar(projectId, p);

      if(window.PanelCoberturaMGAWeb){
        PanelCoberturaMGAWeb.render("panelCoberturaMGAWeb", p);
      }

      if(window.InspectorMGAWeb){
        InspectorMGAWeb.render("panelInspectorMGAWeb", p);
      }

      crear(contenedorId);
    };
  }

  if(btnActualizar){
    btnActualizar.onclick = () => crear(contenedorId);
  }
}

return {
  evaluar,
  detectarFaltantes,
  siguientePregunta,
  generarPlanTrabajo,
  aplicarRespuestaSimple,
  crear
};

})();

window.AsesorExpertoMGA = AsesorExpertoMGA;
