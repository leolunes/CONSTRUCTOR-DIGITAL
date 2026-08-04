// =====================================
// MOTOR-FORMULACION.JS
// CONSTRUCTOR MGA PRO
// Orquestador general del Asistente Inteligente
// =====================================

/*
  Este archivo NO reemplaza los módulos existentes.
  Su función es coordinar la información del proyecto y preparar
  propuestas automáticas para los demás motores:

  - motor-diagnostico.js
  - motor-arbol.js
  - motor-cadena-valor.js
  - motor-indicadores.js
  - motor-riesgos.js
  - motor-cronograma.js
  - motor-presupuesto.js

  Requiere que existan previamente:
  - storage.js
  - mga.js
*/

const MotorFormulacion = (() => {

  // =====================================
  // OBTENER PROYECTO ACTUAL
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

  // =====================================
  // CONTEXTO GENERAL DEL PROYECTO
  // =====================================

  function buildContext(projectId){

    const project =
    getProject(projectId);

    if(!project){
      return null;
    }

    const model =
    getModel(project);

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

      diagnostico:
      model.diagnostico || {},

      datosGenerales:
      model.datosGenerales || {},

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

      presupuesto:
      {
        items:
        project.items || [],

        chapters:
        project.chapters || []
      }
    };

  }

  // =====================================
  // DIAGNÓSTICO DE COMPLETITUD
  // =====================================

  function evaluarAvance(context){

    if(!context){
      return {
        porcentaje:
        0,

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
        "diagnostico",

        label:
        "Diagnóstico con problema central",

        ok:
        !!m.diagnostico?.problemaCentral
      },

      {
        key:
        "arbolProblemas",

        label:
        "Árbol de problemas con causas",

        ok:
        (m.arbolProblemas?.causasDirectas || []).length > 0
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
        "cadenaValorProductos",

        label:
        "Cadena de valor con productos",

        ok:
        (m.cadenaValor?.productos || []).length > 0
      },

      {
        key:
        "cadenaValorActividades",

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
        (context.project.items || []).length > 0
      },

      {
        key:
        "documentos",

        label:
        "Textos MGA generados",

        ok:
        !!(
          m.documentosMGA?.descripcionProblema ||
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

  // =====================================
  // RECOMENDACIÓN DE SIGUIENTE PASO
  // =====================================

  function recomendarSiguientePaso(context){

    const avance =
    evaluarAvance(context);

    const pendientes =
    avance.pendientes || [];

    if(!pendientes.length){
      return {
        modulo:
        "documentos",

        titulo:
        "Proyecto completo",

        mensaje:
        "El proyecto tiene los componentes principales diligenciados. Puede generar documentos MGA, revisar consistencia y preparar la información final."
      };
    }

    const primero =
    avance.checks.find(x => !x.ok);

    const mapa =
    {
      diagnostico:
      {
        modulo:
        "diagnostico",

        titulo:
        "Completar diagnóstico",

        mensaje:
        "El proyecto debe iniciar con un diagnóstico claro, problema central, población objetivo, oferta, demanda y brecha."
      },

      arbolProblemas:
      {
        modulo:
        "arbol-problemas",

        titulo:
        "Construir árbol de problemas",

        mensaje:
        "A partir del problema central se deben definir causas y efectos."
      },

      arbolObjetivos:
      {
        modulo:
        "arbol-objetivos",

        titulo:
        "Construir árbol de objetivos",

        mensaje:
        "Transforme el problema en objetivo general, las causas en medios y los efectos en fines."
      },

      cadenaValorProductos:
      {
        modulo:
        "cadena-valor",

        titulo:
        "Crear productos",

        mensaje:
        "Defina los productos que entregará el proyecto para cumplir los objetivos específicos."
      },

      cadenaValorActividades:
      {
        modulo:
        "cadena-valor",

        titulo:
        "Crear actividades",

        mensaje:
        "Asocie actividades a cada producto. Estas actividades serán la base para cronograma, indicadores y presupuesto."
      },

      indicadores:
      {
        modulo:
        "indicadores",

        titulo:
        "Generar indicadores",

        mensaje:
        "Cree indicadores de producto, resultado, gestión e impacto."
      },

      riesgos:
      {
        modulo:
        "riesgos",

        titulo:
        "Registrar riesgos",

        mensaje:
        "Identifique riesgos técnicos, financieros, jurídicos, sociales, ambientales y administrativos."
      },

      cronograma:
      {
        modulo:
        "cronograma",

        titulo:
        "Generar cronograma",

        mensaje:
        "Programe las actividades en el tiempo para construir la programación física y financiera."
      },

      presupuesto:
      {
        modulo:
        "presupuesto",

        titulo:
        "Conectar presupuesto",

        mensaje:
        "Asocie actividades con ítems presupuestales y APUs desde Presupuesto Pro."
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

    return mapa[primero?.key] || {
      modulo:
      "proyecto",

      titulo:
      "Revisar proyecto",

      mensaje:
      "Revise la información general del proyecto."
    };

  }

  // =====================================
  // ORQUESTACIÓN GENERAL
  // =====================================

  function analizarProyecto(projectId){

    const context =
    buildContext(projectId);

    if(!context){
      return null;
    }

    const avance =
    evaluarAvance(context);

    const siguientePaso =
    recomendarSiguientePaso(context);

    return {
      context,
      avance,
      siguientePaso
    };

  }

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
  // RESUMEN PARA PANELES
  // =====================================

  function resumenEjecutivo(projectId){

    const analisis =
    analizarProyecto(projectId);

    if(!analisis){
      return null;
    }

    const { context, avance, siguientePaso } =
    analisis;

    return {
      nombre:
      context.nombre,

      entidad:
      context.entidad,

      ubicacion:
      context.ubicacion,

      porcentaje:
      avance.porcentaje,

      pendientes:
      avance.pendientes,

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

        itemsPresupuesto:
        (context.presupuesto.items || []).length
      }
    };

  }

  // =====================================
  // API PÚBLICA
  // =====================================

  return {
    getProjectIdFromUrl,
    buildContext,
    evaluarAvance,
    recomendarSiguientePaso,
    analizarProyecto,
    generarRutaModulo,
    irASiguientePaso,
    resumenEjecutivo,
    contarIndicadores
  };

})();

// Exponer globalmente
window.MotorFormulacion = MotorFormulacion;
