// =====================================
// MAESTRO-MGA.JS
// CONSTRUCTOR MGA PRO
// Motor Central - Coordinador principal
// =====================================

const MaestroMGA = (() => {

  // =====================================
  // UTILIDADES
  // =====================================

  function ahoraISO(){
    return new Date().toISOString();
  }

  function arr(v){
    return Array.isArray(v) ? v : [];
  }

  function texto(v){
    return String(v || "").trim();
  }

  function obtenerProyecto(){
    return window.MGAProjectCore || window.currentProject || window.project || {};
  }

  function obtenerProjectId(){
    const params = new URLSearchParams(window.location.search);
    return params.get("projectId") || "";
  }

  async function cargarProyecto(projectId = ""){
    const id = projectId || obtenerProjectId();

    if(window.ProjectCoreMGA && id){
      const core = await ProjectCoreMGA.cargar(
        id,
        window.currentProject || window.project || {}
      );

      window.MGAProjectCore = core;
      return core;
    }

    return obtenerProyecto();
  }

  async function guardarProyecto(project, projectId = ""){
    const id = projectId || obtenerProjectId();

    if(window.ProjectCoreMGA && id){
      ProjectCoreMGA.actualizarMemoria(project);
      await ProjectCoreMGA.guardar(id, project);
    }

    window.MGAProjectCore = project;
    return project;
  }

  function registrarHistorial(project, titulo, descripcion, tipo = "MAESTRO_MGA"){
    project.historialInteligente = arr(project.historialInteligente);

    project.historialInteligente.push({
      fecha: ahoraISO(),
      tipo,
      titulo,
      descripcion
    });

    if(window.ProjectCoreMGA && typeof ProjectCoreMGA.registrarHistorial === "function"){
      ProjectCoreMGA.registrarHistorial(
        project,
        tipo,
        titulo,
        descripcion
      );
    }

    return project;
  }

  // =====================================
  // EVALUAR ESTADO DEL PROYECTO
  // =====================================

  function evaluarEstado(project = null){

    const p = project || obtenerProyecto();

    const tieneIdea =
      texto(p.idea?.texto) ||
      texto(p.descripcion) ||
      texto(p.datosBasicos?.nombreProyecto);

    const tieneIdentificacion =
      texto(p.identificacionMGA?.sector) ||
      texto(p.identificacionMGA?.tipologia);

    const tieneDiagnostico =
      texto(p.diagnosticoMGA?.situacionActual) ||
      texto(p.documentosMGA?.diagnostico);

    const tieneProblema =
      texto(p.diagnosticoMGA?.problemaCentral) ||
      texto(p.arbolProblemasMGA?.problemaCentral);

    const tieneObjetivos =
      texto(p.arbolObjetivosMGA?.objetivoGeneral) &&
      arr(p.arbolObjetivosMGA?.objetivosEspecificos).length;

    const tieneCadena =
      arr(p.cadenaValorMGA?.productos).length &&
      arr(p.cadenaValorMGA?.actividades).length;

    const tieneIndicadores =
      arr(p.indicadoresMGA).length;

    const tieneRiesgos =
      arr(p.riesgosMGA).length;

    const cobertura = window.PanelCoberturaMGAWeb
      ? PanelCoberturaMGAWeb.evaluar(p)
      : (p.coberturaMGAWeb || null);

    const inspector = window.InspectorMGAWeb
      ? InspectorMGAWeb.evaluar(p)
      : (p.inspectorMGA || null);

    const semaforo = window.SemaforoRadicacionMGA
      ? SemaforoRadicacionMGA.evaluar(p)
      : (p.semaforoRadicacionMGA || null);

    let estado = "IDEA_INICIAL";

    if(tieneIdentificacion){
      estado = "IDENTIFICADO";
    }

    if(tieneDiagnostico && tieneProblema){
      estado = "DIAGNOSTICO_COMPLETO";
    }

    if(tieneObjetivos || tieneCadena || tieneIndicadores || tieneRiesgos){
      estado = "FORMULACION_EN_PROCESO";
    }

    if(tieneDiagnostico && tieneProblema && tieneObjetivos && tieneCadena && tieneIndicadores && tieneRiesgos){
      estado = "FORMULACION_COMPLETA";
    }

    if(inspector && arr(inspector.erroresCriticos).length){
      estado = "REQUIERE_AJUSTES";
    }

    if((cobertura?.porcentaje || 0) >= 90 && inspector && !arr(inspector.erroresCriticos).length){
      estado = "LISTO_REVISION_FINAL";
    }

    if((cobertura?.porcentaje || 0) >= 95 && semaforo?.estado === "VERDE"){
      estado = "LISTO_MGA_WEB";
    }

    return {
      estado,
      cobertura: cobertura?.porcentaje || 0,
      calidad: inspector?.puntajeCalidad || 0,
      erroresCriticos: arr(inspector?.erroresCriticos).length,
      advertencias: arr(inspector?.advertencias).length,
      semaforo: semaforo?.estado || "SIN_EVALUAR",
      tieneIdea: !!tieneIdea,
      tieneIdentificacion: !!tieneIdentificacion,
      tieneDiagnostico: !!tieneDiagnostico,
      tieneProblema: !!tieneProblema,
      tieneObjetivos: !!tieneObjetivos,
      tieneCadena: !!tieneCadena,
      tieneIndicadores: !!tieneIndicadores,
      tieneRiesgos: !!tieneRiesgos
    };
  }

  // =====================================
  // DECIDIR SIGUIENTE ACCIÓN
  // =====================================

  function decidirSiguienteAccion(project = null){

    const p = project || obtenerProyecto();
    const estado = evaluarEstado(p);

    if(!estado.tieneIdea){
      return {
        codigo: "SOLICITAR_IDEA",
        prioridad: "ALTA",
        mensaje: "Registre una idea inicial del proyecto para comenzar la formulación."
      };
    }

    if(!estado.tieneIdentificacion){
      return {
        codigo: "IDENTIFICAR_PROYECTO",
        prioridad: "ALTA",
        mensaje: "Identificar sector, tipología y producto MGA sugerido."
      };
    }

    if(!estado.tieneDiagnostico || !estado.tieneProblema){
      return {
        codigo: "FORMULAR_DIAGNOSTICO",
        prioridad: "ALTA",
        mensaje: "Completar diagnóstico, problema central, causas y efectos."
      };
    }

    if(!estado.tieneObjetivos){
      return {
        codigo: "FORMULAR_OBJETIVOS",
        prioridad: "ALTA",
        mensaje: "Construir objetivo general y objetivos específicos."
      };
    }

    if(!estado.tieneCadena){
      return {
        codigo: "FORMULAR_CADENA_VALOR",
        prioridad: "ALTA",
        mensaje: "Construir productos, actividades y relación con presupuesto."
      };
    }

    if(!estado.tieneIndicadores){
      return {
        codigo: "FORMULAR_INDICADORES",
        prioridad: "MEDIA",
        mensaje: "Definir indicadores, metas y fuentes de verificación."
      };
    }

    if(!estado.tieneRiesgos){
      return {
        codigo: "FORMULAR_RIESGOS",
        prioridad: "MEDIA",
        mensaje: "Definir riesgos, impacto, probabilidad y mitigación."
      };
    }

    if(estado.erroresCriticos > 0){
      return {
        codigo: "CORREGIR_ERRORES",
        prioridad: "CRITICA",
        mensaje: "Corregir errores críticos detectados por el Inspector MGA."
      };
    }

    if(estado.cobertura < 90){
      return {
        codigo: "AUMENTAR_COBERTURA",
        prioridad: "MEDIA",
        mensaje: "Completar componentes pendientes para aumentar la cobertura MGA Web."
      };
    }

    if(estado.semaforo !== "VERDE"){
      return {
        codigo: "REVISAR_RADICACION",
        prioridad: "MEDIA",
        mensaje: "Revisar condiciones del Semáforo de Radicación."
      };
    }

    return {
      codigo: "LISTO_MGA_WEB",
      prioridad: "BAJA",
      mensaje: "El proyecto está preparado para revisión final y cargue en MGA Web."
    };
  }

  // =====================================
  // REFRESCAR MÓDULOS VISUALES
  // =====================================

  function refrescarModulos(project = null){

    const p = project || obtenerProyecto();

    if(window.PanelCoberturaMGAWeb){
      PanelCoberturaMGAWeb.render("panelCoberturaMGAWeb", p);
    }

    if(window.InspectorMGAWeb){
      InspectorMGAWeb.render("panelInspectorMGAWeb", p);
    }

    if(window.AsesorExpertoMGA){
      AsesorExpertoMGA.crear("panelAsesorExpertoMGA");
    }

    if(window.CerebroMGA){
      CerebroMGA.crearUI("panelCerebroMGA");
    }

    if(window.MotorFormulacionAutomaticaMGA){
      MotorFormulacionAutomaticaMGA.crearUI("panelFormulacionAutomaticaMGA");
    }

    if(window.SemaforoRadicacionMGA){
      SemaforoRadicacionMGA.crear("panelSemaforoRadicacionMGA", p);
    }

    if(window.ExportadorMGAWeb){
      ExportadorMGAWeb.crear("panelExportadorMGAWeb");
    }

    if(window.ReporteEjecutivoMGA){
      ReporteEjecutivoMGA.crear("panelReporteEjecutivoMGA", p);
    }

    return p;
  }

  // =====================================
  // EJECUTAR FORMULACIÓN INTELIGENTE
  // =====================================

  async function formularDesdeIdea(idea, projectId = ""){

    const id = projectId || obtenerProjectId();
    let project = await cargarProyecto(id);

    if(!texto(idea)){
      return {
        ok: false,
        mensaje: "Debe indicar una idea inicial del proyecto.",
        project
      };
    }

    if(window.CerebroMGA){
      const resultado = CerebroMGA.construirDesdeIdea(idea, project);
      if(resultado?.ok){
        project = resultado.project;
      }
    }

    if(window.MotorFormulacionAutomaticaMGA){
      const resultadoAuto = MotorFormulacionAutomaticaMGA.completarTodo(project);
      if(resultadoAuto?.ok){
        project = resultadoAuto.project;
      }
    }

    registrarHistorial(
      project,
      "Formulación inteligente ejecutada",
      "El Maestro MGA coordinó Cerebro MGA y Formulación Automática."
    );

    project.estado = project.estado || {};
    project.estado.maestroMGA = evaluarEstado(project);
    project.estado.siguienteAccion = decidirSiguienteAccion(project);

    await guardarProyecto(project, id);
    refrescarModulos(project);

    return {
      ok: true,
      mensaje: "Formulación inteligente ejecutada por Maestro MGA.",
      estado: project.estado.maestroMGA,
      siguienteAccion: project.estado.siguienteAccion,
      project
    };
  }

  // =====================================
  // ANALIZAR PROYECTO
  // =====================================

  async function analizar(projectId = ""){

    const id = projectId || obtenerProjectId();
    const project = await cargarProyecto(id);

    project.estado = project.estado || {};
    project.estado.maestroMGA = evaluarEstado(project);
    project.estado.siguienteAccion = decidirSiguienteAccion(project);

    registrarHistorial(
      project,
      "Análisis ejecutado por Maestro MGA",
      "Se evaluó el estado general del proyecto y se definió la siguiente acción."
    );

    await guardarProyecto(project, id);
    refrescarModulos(project);

    return {
      ok: true,
      estado: project.estado.maestroMGA,
      siguienteAccion: project.estado.siguienteAccion,
      project
    };
  }

  // =====================================
  // API PÚBLICA
  // =====================================

  return {
    cargarProyecto,
    guardarProyecto,
    evaluarEstado,
    decidirSiguienteAccion,
    refrescarModulos,
    formularDesdeIdea,
    analizar
  };

})();

window.MaestroMGA = MaestroMGA;
