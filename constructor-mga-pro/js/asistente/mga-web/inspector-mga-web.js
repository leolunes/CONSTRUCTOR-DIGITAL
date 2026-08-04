// =====================================
// INSPECTOR-MGA-WEB.JS
// CONSTRUCTOR MGA PRO
// Revisor inteligente de calidad y completitud MGA Web
// =====================================

const InspectorMGAWeb = (() => {

function ahoraISO(){
  return new Date().toISOString();
}

function arr(v){
  return Array.isArray(v) ? v : [];
}

function txt(v){
  return String(v || "").trim();
}

function existe(v){
  if(v === undefined || v === null) return false;
  if(typeof v === "string") return v.trim().length > 0;
  if(typeof v === "number") return !isNaN(v) && v !== 0;
  if(Array.isArray(v)) return v.length > 0;
  if(typeof v === "object") return Object.keys(v).length > 0;
  return !!v;
}

function get(obj, path){
  return String(path).split(".").reduce((acc, key) => {
    if(acc === undefined || acc === null) return undefined;
    if(Array.isArray(acc) && !isNaN(Number(key))) return acc[Number(key)];
    return acc[key];
  }, obj);
}

function add(lista, severidad, modulo, mensaje, accion){
  lista.push({
    severidad,
    modulo,
    mensaje,
    accion: accion || "",
    fecha: ahoraISO()
  });
}

function validarIdentificacion(project, errores, advertencias){
  if(!existe(project.datosBasicos?.nombreProyecto)){
    add(errores, "Crítico", "Identificación", "Falta el nombre del proyecto.", "Complete el nombre del proyecto.");
  }

  if(!existe(project.datosBasicos?.entidadFormuladora)){
    add(advertencias, "Alto", "Identificación", "Falta la entidad formuladora.", "Registre la entidad formuladora.");
  }

  if(!existe(project.identificacionMGA?.sector)){
    add(errores, "Crítico", "Identificación", "No se ha identificado el sector del proyecto.", "Use el Copiloto o seleccione el sector manualmente.");
  }

  if(!existe(project.identificacionMGA?.tipologia)){
    add(advertencias, "Alto", "Identificación", "No se ha identificado la tipología del proyecto.", "Seleccione una tipología para mejorar la generación inteligente.");
  }

  if(!existe(project.datosBasicos?.municipio) && !existe(project.identificacionMGA?.localizacion?.municipio)){
    add(advertencias, "Medio", "Identificación", "Falta municipio o localización principal.", "Complete departamento y municipio.");
  }
}

function validarProblematica(project, errores, advertencias){
  const problema =
    txt(project.diagnosticoMGA?.problemaCentral) ||
    txt(project.arbolProblemasMGA?.problemaCentral);

  if(!problema){
    add(errores, "Crítico", "Problemática", "Falta el problema central.", "Genere o escriba el problema central.");
  }

  if(!existe(project.diagnosticoMGA?.situacionActual) && !existe(project.documentosMGA?.diagnostico)){
    add(advertencias, "Alto", "Problemática", "Falta el diagnóstico o situación actual.", "Complete el diagnóstico del proyecto.");
  }

  if(!existe(project.arbolProblemasMGA?.causasDirectas)){
    add(advertencias, "Alto", "Árbol de Problemas", "Faltan causas directas.", "Complete causas directas del problema.");
  }

  if(!existe(project.arbolProblemasMGA?.efectosDirectos)){
    add(advertencias, "Alto", "Árbol de Problemas", "Faltan efectos directos.", "Complete efectos directos del problema.");
  }
}

function validarObjetivos(project, errores, advertencias){
  if(!existe(project.arbolObjetivosMGA?.objetivoGeneral)){
    add(errores, "Crítico", "Objetivos", "Falta el objetivo general.", "Genere o escriba el objetivo general.");
  }

  if(!existe(project.arbolObjetivosMGA?.objetivosEspecificos)){
    add(advertencias, "Alto", "Objetivos", "Faltan objetivos específicos.", "Complete objetivos específicos.");
  }

  const problema = txt(project.diagnosticoMGA?.problemaCentral || project.arbolProblemasMGA?.problemaCentral);
  const objetivo = txt(project.arbolObjetivosMGA?.objetivoGeneral);

  if(problema && objetivo && problema.toLowerCase() === objetivo.toLowerCase()){
    add(advertencias, "Medio", "Coherencia", "El problema y el objetivo general parecen iguales.", "Redacte el objetivo como solución positiva del problema.");
  }
}

function validarPoblacion(project, errores, advertencias){
  const afectada = project.poblacionMGA?.poblacionAfectada?.cantidad;
  const objetivo = project.poblacionMGA?.poblacionObjetivo?.cantidad;

  if(!existe(afectada)){
    add(advertencias, "Alto", "Población", "Falta cuantificar la población afectada.", "Registre cantidad, unidad y fuente.");
  }

  if(!existe(objetivo)){
    add(advertencias, "Alto", "Población", "Falta cuantificar la población objetivo.", "Registre beneficiarios directos.");
  }

  if(existe(objetivo) && existe(afectada) && Number(objetivo) > Number(afectada)){
    add(advertencias, "Medio", "Población", "La población objetivo es mayor que la población afectada.", "Revise las cantidades de población.");
  }
}

function validarParticipantesAlternativas(project, errores, advertencias){
  if(!existe(project.participantesMGA)){
    add(advertencias, "Alto", "Participantes", "No hay actores participantes registrados.", "Agregue entidad formuladora, comunidad, ejecutor y beneficiarios.");
  }

  if(!existe(project.alternativasMGA)){
    add(advertencias, "Alto", "Alternativas", "No se han evaluado alternativas de solución.", "Genere al menos alternativa seleccionada y alternativa de no intervención.");
  }

  if(!existe(project.alternativaSeleccionadaMGA?.descripcion) && !existe(project.alternativaSeleccionadaMGA?.nombre)){
    add(advertencias, "Alto", "Alternativas", "No hay alternativa seleccionada.", "Defina y justifique la alternativa seleccionada.");
  }
}

function validarCadenaValor(project, errores, advertencias){
  const productos = arr(project.cadenaValorMGA?.productos);
  const actividades = arr(project.cadenaValorMGA?.actividades);

  if(!productos.length){
    add(errores, "Crítico", "Cadena de Valor", "No existen productos en la cadena de valor.", "Genere o registre productos MGA.");
  }

  if(!actividades.length){
    add(errores, "Crítico", "Cadena de Valor", "No existen actividades en la cadena de valor.", "Genere o registre actividades.");
  }

  const tieneRelacionPresupuesto =
    existe(project.cadenaValorMGA?.relacionPresupuesto) ||
    existe(project.presupuestoPreliminarMGA?.capitulosSugeridos);

  if(!tieneRelacionPresupuesto){
    add(advertencias, "Alto", "Cadena de Valor", "La cadena de valor no está relacionada con el presupuesto.", "Asocie actividades con capítulos o ítems presupuestales.");
  }
}

function validarIndicadores(project, errores, advertencias){
  const indicadores = arr(project.indicadoresMGA);

  if(!indicadores.length){
    add(errores, "Crítico", "Indicadores", "No existen indicadores.", "Genere indicadores de producto y resultado.");
    return;
  }

  const sinMeta = indicadores.filter(i => !existe(i.meta));
  if(sinMeta.length){
    add(advertencias, "Alto", "Indicadores", "Hay indicadores sin meta.", "Complete la meta de cada indicador.");
  }

  const sinFuente = indicadores.filter(i => !existe(i.fuenteVerificacion));
  if(sinFuente.length){
    add(advertencias, "Medio", "Indicadores", "Hay indicadores sin fuente de verificación.", "Complete fuente de verificación.");
  }
}

function validarRiesgos(project, errores, advertencias){
  const riesgos = arr(project.riesgosMGA);

  if(!riesgos.length){
    add(advertencias, "Alto", "Riesgos", "No existe matriz de riesgos.", "Genere riesgos técnicos, financieros, sociales y ambientales.");
    return;
  }

  const sinMitigacion = riesgos.filter(r => !existe(r.mitigacion) && !existe(r.medidaMitigacion));
  if(sinMitigacion.length){
    add(advertencias, "Medio", "Riesgos", "Hay riesgos sin medida de mitigación.", "Complete mitigación por riesgo.");
  }
}

function validarPresupuestoFinanciacion(project, errores, advertencias){
  const items = arr(project.presupuesto?.items).length || arr(project.items).length;
  const apus = arr(project.presupuesto?.apus).length || arr(project.apus).length;
  const preliminar = existe(project.presupuestoPreliminarMGA?.capitulosSugeridos);

  if(!items && !preliminar){
    add(errores, "Crítico", "Presupuesto", "No existe presupuesto ni presupuesto preliminar.", "Agregue ítems o genere presupuesto preliminar.");
  }

  if(items && !apus){
    add(advertencias, "Medio", "APUs", "Existen ítems pero no se detectan APUs asociados.", "Revise la descomposición APU.");
  }

  const fuentes = arr(project.fuentesFinanciacionMGA);
  if(!fuentes.length){
    add(advertencias, "Alto", "Financiación", "No existen fuentes de financiación.", "Registre fuente, vigencia y valor.");
  }

  const valorProyecto =
    Number(project.presupuesto?.valorTotal || project.datosBasicos?.valorTotal || project.total || 0);

  const totalFuentes = fuentes.reduce((s, f) => s + Number(f.valor || 0), 0);

  if(valorProyecto > 0 && totalFuentes > 0 && Math.abs(valorProyecto - totalFuentes) > 1){
    add(advertencias, "Alto", "Financiación", "El valor de las fuentes no coincide con el valor del proyecto.", "Ajuste las fuentes hasta igualar el valor total.");
  }
}

function validarCronogramaSostenibilidadDocumentos(project, errores, advertencias){
  if(!existe(project.cronogramaMGA?.actividades)){
    add(advertencias, "Alto", "Cronograma", "No existe cronograma de actividades.", "Genere cronograma físico y financiero.");
  }

  if(!existe(project.sostenibilidadMGA?.tecnica) && !existe(project.documentosMGA?.sostenibilidad)){
    add(advertencias, "Medio", "Sostenibilidad", "Falta sostenibilidad técnica.", "Complete sostenibilidad técnica, financiera, institucional y ambiental.");
  }

  if(!existe(project.documentosMGA?.justificacion)){
    add(advertencias, "Alto", "Documentos", "Falta justificación documental.", "Genere o complete la justificación.");
  }

  if(!existe(project.documentosMGA?.resumenEjecutivo)){
    add(advertencias, "Medio", "Documentos", "Falta resumen ejecutivo.", "Genere el resumen ejecutivo del proyecto.");
  }
}

function puntaje(errores, advertencias, cobertura){
  let score = 100;

  score -= errores.length * 12;
  score -= advertencias.filter(a => a.severidad === "Alto").length * 6;
  score -= advertencias.filter(a => a.severidad === "Medio").length * 3;
  score -= advertencias.filter(a => a.severidad === "Bajo").length * 1;

  if(typeof cobertura === "number"){
    score = Math.round((score * 0.55) + (cobertura * 0.45));
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function evaluar(project){
  const errores = [];
  const advertencias = [];

  const p = window.ProjectCoreMGA ? ProjectCoreMGA.normalizarProyecto(project || {}) : (project || {});

  validarIdentificacion(p, errores, advertencias);
  validarProblematica(p, errores, advertencias);
  validarObjetivos(p, errores, advertencias);
  validarPoblacion(p, errores, advertencias);
  validarParticipantesAlternativas(p, errores, advertencias);
  validarCadenaValor(p, errores, advertencias);
  validarIndicadores(p, errores, advertencias);
  validarRiesgos(p, errores, advertencias);
  validarPresupuestoFinanciacion(p, errores, advertencias);
  validarCronogramaSostenibilidadDocumentos(p, errores, advertencias);

  let cobertura = null;

  if(window.PanelCoberturaMGAWeb && typeof PanelCoberturaMGAWeb.evaluar === "function"){
    cobertura = PanelCoberturaMGAWeb.evaluar(p);
  }

  const score = puntaje(errores, advertencias, cobertura?.porcentaje);

  const resultado = {
    fechaRevision: ahoraISO(),
    puntajeCalidad: score,
    coberturaMGAWeb: cobertura,
    erroresCriticos: errores,
    advertencias,
    recomendaciones: generarRecomendaciones(errores, advertencias),
    listoParaMGAWeb: score >= 90 && errores.length === 0 && (cobertura?.porcentaje || 0) >= 95
  };

  return resultado;
}

function generarRecomendaciones(errores, advertencias){
  const lista = [...errores, ...advertencias].slice(0, 10);

  return lista.map(x => ({
    modulo:x.modulo,
    recomendacion:x.accion || x.mensaje,
    prioridad:x.severidad
  }));
}

function obtenerProyectoActual(){
  if(window.MGAProjectCore) return window.MGAProjectCore;
  if(window.App && App.project) return App.project;
  if(window.currentProject) return window.currentProject;
  if(window.project) return window.project;
  return {};
}

function clase(score){
  if(score >= 90) return "ok";
  if(score >= 70) return "warn";
  return "bad";
}

function render(contenedorId="panelInspectorMGAWeb", project=null){
  const cont = document.getElementById(contenedorId);
  if(!cont) return;

  const resultado = evaluar(project || obtenerProyectoActual());
  const scoreClass = clase(resultado.puntajeCalidad);

  cont.innerHTML = `
    <section class="inspector-mga-card">
      <div class="inspector-head">
        <div>
          <h2>🧪 Inspector MGA Web</h2>
          <p>Revisión inteligente de calidad, coherencia y completitud del proyecto.</p>
        </div>
        <div class="inspector-score ${scoreClass}">
          ${resultado.puntajeCalidad}
        </div>
      </div>

      <div class="inspector-status ${resultado.listoParaMGAWeb ? "ok" : "warn"}">
        ${resultado.listoParaMGAWeb
          ? "✅ Proyecto listo para revisión final MGA Web."
          : "⚠️ Proyecto aún requiere ajustes antes de considerarse listo."}
      </div>

      <div class="inspector-grid">
        <div>
          <strong>${resultado.erroresCriticos.length}</strong>
          <span>Errores críticos</span>
        </div>
        <div>
          <strong>${resultado.advertencias.length}</strong>
          <span>Advertencias</span>
        </div>
        <div>
          <strong>${resultado.coberturaMGAWeb?.porcentaje ?? 0}%</strong>
          <span>Cobertura MGA</span>
        </div>
      </div>

      <div class="inspector-section">
        <h3>Errores críticos</h3>
        ${resultado.erroresCriticos.length
          ? `<ul>${resultado.erroresCriticos.map(e => `<li><b>${e.modulo}:</b> ${e.mensaje}<br><small>${e.accion}</small></li>`).join("")}</ul>`
          : `<p>✅ No se detectan errores críticos.</p>`}
      </div>

      <div class="inspector-section">
        <h3>Advertencias principales</h3>
        ${resultado.advertencias.length
          ? `<ul>${resultado.advertencias.slice(0, 8).map(e => `<li><b>${e.modulo}:</b> ${e.mensaje}<br><small>${e.accion}</small></li>`).join("")}</ul>`
          : `<p>✅ No se detectan advertencias relevantes.</p>`}
      </div>

      <div class="inspector-next">
        <strong>Siguiente acción recomendada:</strong>
        <span>${resultado.recomendaciones[0]?.recomendacion || "Realizar revisión técnica final."}</span>
      </div>
    </section>
  `;

  return resultado;
}

async function guardarEnProyecto(projectId, project=null){
  const p = project || obtenerProyectoActual();
  const resultado = evaluar(p);

  p.inspectorMGA = resultado;
  p.estado = p.estado || {};
  p.estado.listoParaMGAWeb = resultado.listoParaMGAWeb;

  if(window.ProjectCoreMGA){
    ProjectCoreMGA.registrarHistorial(
      p,
      "INSPECTOR_MGA",
      "Revisión Inspector MGA Web",
      "El Inspector revisó calidad y completitud del proyecto.",
      resultado.recomendaciones
    );

    ProjectCoreMGA.actualizarMemoria(p);
    await ProjectCoreMGA.guardar(projectId, p);
    window.MGAProjectCore = p;
  }

  return resultado;
}

return {
  evaluar,
  render,
  guardarEnProyecto
};

})();

window.InspectorMGAWeb = InspectorMGAWeb;
