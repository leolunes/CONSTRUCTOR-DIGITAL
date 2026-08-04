// =====================================
// MOTOR-FORMULACION.JS
// CONSTRUCTOR MGA PRO
// Orquestador general del Asistente Inteligente
// =====================================

/*
  Este motor es el director general del Constructor MGA Pro.

  Responsabilidades:
  - Leer el proyecto completo.
  - Medir avance de formulación.
  - Validar consistencia MGA.
  - Recomendar el siguiente paso.
  - Coordinar motores existentes:
      MotorDiagnostico
      MotorCadenaValor
      MotorPresupuesto
      MotorExportador
  - Preparar resumen ejecutivo del proyecto.
  - Determinar si el proyecto está listo para MGA Web.

  Requiere:
  - storage.js
  - mga.js
*/

const MotorFormulacion = (() => {

  // =====================================
  // PROYECTO Y MODELO
  // =====================================

  function getProjectIdFromUrl(){

    const params =
    new URLSearchParams(window.location.search);

    return (
      params.get("projectId") ||
      params.get("id") ||
      ""
    );

  }

  function getProject(projectId){

    if(!projectId){
      return null;
    }

    if(!window.StorageAPI){
      console.error("StorageAPI no está disponible.");
      return null;
    }

    return StorageAPI.getProjectById(projectId);

  }

  function getModel(project){

    if(!project){
      return null;
    }

    if(window.MGA && typeof MGA.getModel === "function"){
      return MGA.getModel(project);
    }

    return project.mga || {};

  }

  function updateModel(projectId, patch){

    if(!window.MGA || typeof MGA.updateModel !== "function"){
      console.error("MGA.updateModel no está disponible.");
      return null;
    }

    return MGA.updateModel(projectId, patch);

  }

  // =====================================
  // CONTEXTO GENERAL
  // =====================================

  function buildContext(projectId){

    const project =
    getProject(projectId);

    if(!project){
      return null;
    }

    const model =
    getModel(project);

    const presupuestoMGA =
    model.presupuestoMGA || {};

    return {
      projectId,
      project,
      model,

      nombre:
      project.name || "",

      entidad:
      project.entity || "",

      ubicacion:
      project.location || "",

      datosGenerales:
      model.datosGenerales || {},

      diagnostico:
      model.diagnostico || {},

      arbolProblemas:
      model.arbolProblemas || {},

      arbolObjetivos:
      model.arbolObjetivos || {},

      cadenaValor:
      model.cadenaValor || {},

      indicadores:
      model.indicadores || {},

      riesgos:
      model.riesgos || [],

      cronograma:
      model.cronograma || {},

      documentosMGA:
      model.documentosMGA || {},

      presupuestoMGA,

      presupuesto:
      {
        items:
        Array.isArray(project.items) ? project.items : [],

        chapters:
        Array.isArray(project.chapters) ? project.chapters : []
      }
    };

  }

  // =====================================
  // VALIDAR MOTORES
  // =====================================

  function estadoMotores(){

    return {
      diagnostico:
      !!window.MotorDiagnostico,

      cadenaValor:
      !!window.MotorCadenaValor,

      presupuesto:
      !!window.MotorPresupuesto,

      exportador:
      !!window.MotorExportador,

      mga:
      !!window.MGA,

      storage:
      !!window.StorageAPI
    };

  }

  function motoresFaltantes(){

    const estado =
    estadoMotores();

    return Object.keys(estado)
    .filter(key => !estado[key]);

  }

  // =====================================
  // EVALUACIÓN DE AVANCE
  // =====================================

  function evaluarAvance(context){

    if(!context){
      return {
        porcentaje:
        0,

        completados:
        0,

        total:
        0,

        checks:
        [],

        pendientes:
        ["No se encontró el proyecto."]
      };
    }

    const m =
    context.model || {};

    const checks =
    [
      {
        key:
        "datosGenerales",

        label:
        "Datos generales y localización",

        ok:
        !!(
          m.datosGenerales?.sector ||
          m.datosGenerales?.municipio ||
          context.ubicacion
        )
      },

      {
        key:
        "diagnostico",

        label:
        "Diagnóstico con problema central",

        ok:
        !!m.diagnostico?.problemaCentral
      },

      {
        key:
        "poblacion",

        label:
        "Población afectada y objetivo",

        ok:
        !!(
          m.diagnostico?.poblacionAfectada ||
          m.diagnostico?.poblacionObjetivo
        )
      },

      {
        key:
        "ofertaDemandaBrecha",

        label:
        "Oferta, demanda y brecha",

        ok:
        !!(
          m.diagnostico?.ofertaActual &&
          m.diagnostico?.demandaActual &&
          m.diagnostico?.brecha
        )
      },

      {
        key:
        "arbolProblemas",

        label:
        "Árbol de problemas con causas y efectos",

        ok:
        !!m.arbolProblemas?.problemaCentral &&
        (m.arbolProblemas?.causasDirectas || []).length > 0 &&
        (m.arbolProblemas?.efectosDirectos || []).length > 0
      },

      {
        key:
        "arbolObjetivos",

        label:
        "Árbol de objetivos con objetivo general",

        ok:
        !!m.arbolObjetivos?.objetivoGeneral
      },

      {
        key:
        "objetivosEspecificos",

        label:
        "Objetivos específicos",

        ok:
        (m.cadenaValor?.objetivosEspecificos || []).length > 0
      },

      {
        key:
        "productos",

        label:
        "Cadena de valor con productos",

        ok:
        (m.cadenaValor?.productos || []).length > 0
      },

      {
        key:
        "actividades",

        label:
        "Cadena de valor con actividades",

        ok:
        (m.cadenaValor?.actividades || []).length > 0
      },

      {
        key:
        "indicadores",

        label:
        "Indicadores registrados",

        ok:
        contarIndicadores(m.indicadores || {}) > 0
      },

      {
        key:
        "riesgos",

        label:
        "Riesgos identificados",

        ok:
        (m.riesgos || []).length > 0
      },

      {
        key:
        "cronograma",

        label:
        "Cronograma programado",

        ok:
        (m.cronograma?.actividades || []).length > 0
      },

      {
        key:
        "presupuesto",

        label:
        "Presupuesto con ítems",

        ok:
        (context.presupuesto.items || []).length > 0
      },

      {
        key:
        "integracionPresupuesto",

        label:
        "Actividades vinculadas con presupuesto",

        ok:
        (m.presupuestoMGA?.relacionItemsPresupuesto || []).length > 0 ||
        Number(m.presupuestoMGA?.resumen?.totalVinculado || 0) > 0
      },

      {
        key:
        "documentos",

        label:
        "Textos MGA generados",

        ok:
        !!(
          m.documentosMGA?.descripcionProblema ||
          m.documentosMGA?.consolidado ||
          m.documentosMGA?.objetivoGeneral
        )
      }
    ];

    const completados =
    checks.filter(x => x.ok).length;

    const porcentaje =
    Math.round((completados / checks.length) * 100);

    const pendientes =
    checks
    .filter(x => !x.ok)
    .map(x => x.label);

    return {
      porcentaje,
      completados,
      total:
      checks.length,

      checks,
      pendientes
    };

  }

  // =====================================
  // CONSISTENCIA MGA
  // =====================================

  function evaluarConsistencia(context){

    if(!context){
      return {
        puntaje:
        0,

        estado:
        "Sin proyecto",

        errores:
        ["No se encontró el proyecto."],

        advertencias:
        []
      };
    }

    const m =
    context.model || {};

    const errores =
    [];

    const advertencias =
    [];

    const problema =
    m.diagnostico?.problemaCentral || "";

    const objetivo =
    m.arbolObjetivos?.objetivoGeneral ||
    m.cadenaValor?.objetivoGeneral ||
    "";

    const productos =
    m.cadenaValor?.productos || [];

    const actividades =
    m.cadenaValor?.actividades || [];

    if(!problema){
      errores.push("No existe problema central.");
    }

    if(problema && esProblemaMalFormulado(problema)){
      advertencias.push("El problema central puede estar formulado como falta de solución. Revise la redacción MGA.");
    }

    if(!objetivo){
      errores.push("No existe objetivo general.");
    }

    if(problema && objetivo && normalizar(problema) === normalizar(objetivo)){
      advertencias.push("El objetivo general parece repetir el problema central sin transformarlo a situación positiva.");
    }

    if(!productos.length){
      errores.push("No existen productos en la Cadena de Valor.");
    }

    if(!actividades.length){
      errores.push("No existen actividades en la Cadena de Valor.");
    }

    const objetivos =
    m.cadenaValor?.objetivosEspecificos || [];

    const objetivosSinProducto =
    objetivos.filter(o =>
      !productos.some(p => p.objetivoEspecificoId === o.id)
    );

    if(objetivosSinProducto.length){
      advertencias.push(`${objetivosSinProducto.length} objetivo(s) específico(s) no tienen productos asociados.`);
    }

    const productosSinActividad =
    productos.filter(p =>
      !actividades.some(a => a.productoId === p.id)
    );

    if(productosSinActividad.length){
      advertencias.push(`${productosSinActividad.length} producto(s) no tienen actividades asociadas.`);
    }

    const indicadores =
    contarIndicadores(m.indicadores || {});

    if(productos.length && indicadores === 0){
      advertencias.push("Existen productos, pero no se han generado indicadores.");
    }

    if((m.riesgos || []).length === 0){
      advertencias.push("No se han identificado riesgos del proyecto.");
    }

    if((m.cronograma?.actividades || []).length === 0 && actividades.length){
      advertencias.push("Existen actividades, pero no se ha generado cronograma.");
    }

    if((context.presupuesto.items || []).length === 0){
      advertencias.push("No existen ítems presupuestales registrados.");
    }

    const resumenPresupuesto =
    m.presupuestoMGA?.resumen || {};

    if((context.presupuesto.items || []).length > 0 &&
       Number(resumenPresupuesto.totalVinculado || 0) === 0){
      advertencias.push("Existe presupuesto, pero aún no está vinculado con actividades MGA.");
    }

    let puntaje =
    100;

    puntaje -= errores.length * 15;
    puntaje -= advertencias.length * 5;

    puntaje =
    Math.max(0, Math.min(100, puntaje));

    const estado =
    puntaje >= 90
    ? "Listo para revisión MGA"
    : puntaje >= 70
      ? "Requiere ajustes menores"
      : puntaje >= 50
        ? "Requiere ajustes importantes"
        : "Incompleto";

    return {
      puntaje,
      estado,
      errores,
      advertencias
    };

  }

  function esProblemaMalFormulado(texto){

    const t =
    normalizar(texto);

    return (
      t.startsWith("no existe") ||
      t.startsWith("falta") ||
      t.includes("falta de construccion") ||
      t.includes("no hay") ||
      t.includes("ausencia de obra")
    );

  }

  // =====================================
  // RECOMENDACIÓN DE SIGUIENTE PASO
  // =====================================

  function recomendarSiguientePaso(context){

    const avance =
    evaluarAvance(context);

    if(!avance.checks.length){
      return {
        modulo:
        "proyecto",

        titulo:
        "Crear o seleccionar proyecto",

        mensaje:
        "No se encontró un proyecto activo."
      };
    }

    const primero =
    avance.checks.find(x => !x.ok);

    if(!primero){
      return {
        modulo:
        "documentos",

        titulo:
        "Proyecto completo",

        mensaje:
        "El proyecto tiene los componentes principales diligenciados. Puede generar documentos MGA, revisar consistencia y preparar la información final."
      };
    }

    const mapa =
    {
      datosGenerales:
      {
        modulo:
        "diagnostico",

        titulo:
        "Completar datos generales",

        mensaje:
        "Complete sector, programa, departamento, municipio y localización."
      },

      diagnostico:
      {
        modulo:
        "diagnostico",

        titulo:
        "Completar diagnóstico",

        mensaje:
        "Formule el problema central, la situación actual y la justificación."
      },

      poblacion:
      {
        modulo:
        "diagnostico",

        titulo:
        "Definir población",

        mensaje:
        "Defina la población afectada y la población objetivo."
      },

      ofertaDemandaBrecha:
      {
        modulo:
        "diagnostico",

        titulo:
        "Completar oferta, demanda y brecha",

        mensaje:
        "Registre la oferta actual, demanda actual y la brecha identificada."
      },

      arbolProblemas:
      {
        modulo:
        "arbol-problemas",

        titulo:
        "Construir árbol de problemas",

        mensaje:
        "Genere o registre causas y efectos del problema central."
      },

      arbolObjetivos:
      {
        modulo:
        "arbol-objetivos",

        titulo:
        "Construir árbol de objetivos",

        mensaje:
        "Transforme el problema en objetivo general, medios y fines."
      },

      objetivosEspecificos:
      {
        modulo:
        "cadena-valor",

        titulo:
        "Definir objetivos específicos",

        mensaje:
        "Genere objetivos específicos desde el árbol de objetivos."
      },

      productos:
      {
        modulo:
        "cadena-valor",

        titulo:
        "Crear productos",

        mensaje:
        "Defina los productos que entregará el proyecto."
      },

      actividades:
      {
        modulo:
        "cadena-valor",

        titulo:
        "Crear actividades",

        mensaje:
        "Asocie actividades a cada producto."
      },

      indicadores:
      {
        modulo:
        "indicadores",

        titulo:
        "Generar indicadores",

        mensaje:
        "Genere indicadores de producto, resultado, gestión e impacto."
      },

      riesgos:
      {
        modulo:
        "riesgos",

        titulo:
        "Registrar riesgos",

        mensaje:
        "Identifique riesgos y medidas de mitigación."
      },

      cronograma:
      {
        modulo:
        "cronograma",

        titulo:
        "Generar cronograma",

        mensaje:
        "Programe las actividades en el tiempo."
      },

      presupuesto:
      {
        modulo:
        "proyecto",

        titulo:
        "Cargar presupuesto",

        mensaje:
        "Registre ítems presupuestales o instale la base presupuestal."
      },

      integracionPresupuesto:
      {
        modulo:
        "mga",

        titulo:
        "Integrar presupuesto MGA",

        mensaje:
        "Vincule actividades MGA con ítems del presupuesto."
      },

      documentos:
      {
        modulo:
        "documentos",

        titulo:
        "Generar documentos",

        mensaje:
        "Prepare los textos listos para copiar en MGA Web."
      }
    };

    return mapa[primero.key] || {
      modulo:
      "proyecto",

      titulo:
      "Revisar proyecto",

      mensaje:
      "Revise la información general del proyecto."
    };

  }

  // =====================================
  // AUTOMATIZACIÓN GENERAL
  // =====================================

  function ejecutarAsistenteBasico(projectId){

    const project =
    getProject(projectId);

    if(!project){
      alert("Proyecto no encontrado.");
      return null;
    }

    let model =
    getModel(project);

    const patch =
    {};

    if(window.MotorCadenaValor &&
       typeof MotorCadenaValor.generarEstructuraCompleta === "function"){

      const estructura =
      MotorCadenaValor.generarEstructuraCompleta(model);

      Object.assign(patch, estructura);

      model =
      deepMerge(model, estructura);

    }

    if(window.MotorPresupuesto &&
       typeof MotorPresupuesto.calcularResumen === "function"){

      const presupuestoMGA =
      MotorPresupuesto.prepararModeloPresupuesto(model);

      const resumen =
      MotorPresupuesto.calcularResumen(project, model);

      patch.presupuestoMGA =
      {
        ...presupuestoMGA,
        resumen
      };

      model =
      deepMerge(model, patch);

    }

    if(window.MotorExportador &&
       typeof MotorExportador.generarDocumentos === "function"){

      try{

        const documentos =
        MotorExportador.generarDocumentos(projectId);

        if(documentos){
          patch.documentosMGA =
          documentos;
        }

      }catch(_){}

    }

    const updated =
    updateModel(projectId, patch);

    return updated;

  }

  function recalcularProyecto(projectId){

    const project =
    getProject(projectId);

    if(!project){
      return null;
    }

    const model =
    getModel(project);

    const patch =
    {};

    if(window.MotorPresupuesto &&
       typeof MotorPresupuesto.calcularResumen === "function"){

      const presupuestoMGA =
      MotorPresupuesto.prepararModeloPresupuesto(model);

      const resumen =
      MotorPresupuesto.calcularResumen(project, model);

      const programacionFinanciera =
      typeof MotorPresupuesto.generarProgramacionFinanciera === "function"
      ? MotorPresupuesto.generarProgramacionFinanciera(model)
      : [];

      patch.presupuestoMGA =
      {
        ...presupuestoMGA,
        resumen,
        programacionFinanciera
      };

    }

    const analisis =
    analizarProyecto(projectId);

    patch.checklistGeneral =
    analisis
    ? {
        avance:
        analisis.avance.porcentaje,

        consistencia:
        analisis.consistencia.puntaje,

        estado:
        analisis.consistencia.estado,

        listoMGA:
        analisis.listoMGA
      }
    : {};

    return updateModel(projectId, patch);

  }

  // =====================================
  // ANÁLISIS GENERAL
  // =====================================

  function analizarProyecto(projectId){

    const context =
    buildContext(projectId);

    if(!context){
      return null;
    }

    const avance =
    evaluarAvance(context);

    const consistencia =
    evaluarConsistencia(context);

    const siguientePaso =
    recomendarSiguientePaso(context);

    const listoMGA =
    avance.porcentaje >= 90 &&
    consistencia.puntaje >= 85 &&
    consistencia.errores.length === 0;

    return {
      context,
      avance,
      consistencia,
      siguientePaso,
      listoMGA,
      motores:
      estadoMotores()
    };

  }

  // =====================================
  // RUTAS
  // =====================================

  function generarRutaModulo(modulo, projectId){

    const id =
    encodeURIComponent(projectId || "");

    const rutas =
    {
      proyecto:
      `proyecto-detalle.html?projectId=${id}`,

      diagnostico:
      `diagnostico.html?projectId=${id}`,

      "arbol-problemas":
      `arbol-problemas.html?projectId=${id}`,

      "arbol-objetivos":
      `arbol-objetivos.html?projectId=${id}`,

      "cadena-valor":
      `cadena-valor.html?projectId=${id}`,

      indicadores:
      `indicadores.html?projectId=${id}`,

      riesgos:
      `riesgos.html?projectId=${id}`,

      cronograma:
      `cronograma.html?projectId=${id}`,

      presupuesto:
      `proyecto-detalle.html?projectId=${id}&tab=items`,

      documentos:
      `documentos.html?projectId=${id}`,

      mga:
      `mga.html?projectId=${id}`
    };

    return rutas[modulo] || rutas.proyecto;

  }

  function irASiguientePaso(projectId){

    const analisis =
    analizarProyecto(projectId);

    if(!analisis){
      alert("No se pudo analizar el proyecto.");
      return;
    }

    const modulo =
    analisis.siguientePaso.modulo;

    window.location.href =
    generarRutaModulo(modulo, projectId);

  }

  // =====================================
  // RESUMEN EJECUTIVO
  // =====================================

  function resumenEjecutivo(projectId){

    const analisis =
    analizarProyecto(projectId);

    if(!analisis){
      return null;
    }

    const { context, avance, consistencia, siguientePaso, listoMGA } =
    analisis;

    const presupuesto =
    context.model.presupuestoMGA?.resumen || {};

    return {
      nombre:
      context.nombre,

      entidad:
      context.entidad,

      ubicacion:
      context.ubicacion,

      avance:
      avance.porcentaje,

      consistencia:
      consistencia.puntaje,

      estado:
      consistencia.estado,

      listoMGA,

      pendientes:
      avance.pendientes,

      errores:
      consistencia.errores,

      advertencias:
      consistencia.advertencias,

      siguientePaso,

      conteos:
      {
        productos:
        (context.cadenaValor.productos || []).length,

        actividades:
        (context.cadenaValor.actividades || []).length,

        indicadores:
        contarIndicadores(context.indicadores),

        riesgos:
        (context.riesgos || []).length,

        cronograma:
        (context.cronograma.actividades || []).length,

        itemsPresupuesto:
        (context.presupuesto.items || []).length,

        vinculosPresupuesto:
        (context.presupuestoMGA.relacionItemsPresupuesto || []).length
      },

      presupuesto:
      {
        total:
        presupuesto.totalPresupuesto || 0,

        vinculado:
        presupuesto.totalVinculado || 0,

        porcentajeVinculado:
        presupuesto.porcentajeVinculado || 0
      }
    };

  }

  // =====================================
  // HELPERS
  // =====================================

  function contarIndicadores(indicadores){

    return [
      "producto",
      "resultado",
      "gestion",
      "impacto"
    ]
    .reduce((total, key) => {
      return total + ((indicadores[key] || []).length);
    }, 0);

  }

  function normalizar(texto){

    return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  }

  function deepMerge(target, source){

    const output =
    Array.isArray(target)
    ? [...target]
    : { ...(target || {}) };

    Object.keys(source || {}).forEach(key => {

      const value =
      source[key];

      if(value && typeof value === "object" && !Array.isArray(value)){

        output[key] =
        deepMerge(output[key] || {}, value);

      }else{

        output[key] =
        value;

      }

    });

    return output;

  }

  // =====================================
  // API PÚBLICA
  // =====================================

  return {
    getProjectIdFromUrl,
    getProject,
    getModel,
    buildContext,

    estadoMotores,
    motoresFaltantes,

    evaluarAvance,
    evaluarConsistencia,
    recomendarSiguientePaso,

    ejecutarAsistenteBasico,
    recalcularProyecto,

    analizarProyecto,
    generarRutaModulo,
    irASiguientePaso,
    resumenEjecutivo,

    contarIndicadores
  };

})();

window.MotorFormulacion = MotorFormulacion;
