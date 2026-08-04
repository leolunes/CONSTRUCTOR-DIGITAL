// =====================================
// PROJECT-CORE.JS
// CONSTRUCTOR MGA PRO
// Núcleo Inteligente del Proyecto
// =====================================

/*
  Objetivo:
  Crear una fuente única de verdad para que la app pueda construir
  progresivamente el 100% de la MGA Web de forma inteligente.

  Este núcleo no reemplaza los módulos existentes.
  Los organiza, normaliza y prepara para que Diagnóstico, MGA,
  Presupuesto, Cronograma, Documentos, Copiloto e Inspector trabajen
  sobre una misma estructura.
*/

const ProjectCoreMGA = (() => {

const VERSION = "1.0.0";

function now(){
  return new Date().toISOString();
}

function uuid(prefix="id"){
  return prefix + "_" + Math.random().toString(36).slice(2) + "_" + Date.now();
}

function clone(obj){
  return JSON.parse(JSON.stringify(obj || null));
}

function ensureArray(v){
  return Array.isArray(v) ? v : [];
}

function ensureObject(v){
  return v && typeof v === "object" && !Array.isArray(v) ? v : {};
}

function deepMerge(target, source){
  const out = ensureObject(target);

  Object.keys(source || {}).forEach(key => {
    const sv = source[key];

    if(Array.isArray(sv)){
      out[key] = sv;
      return;
    }

    if(sv && typeof sv === "object"){
      out[key] = deepMerge(out[key] || {}, sv);
      return;
    }

    if(sv !== undefined){
      out[key] = sv;
    }
  });

  return out;
}

function createEmptyProjectCore(data = {}){

  const base = {
    coreVersion: VERSION,
    id: data.id || uuid("project"),
    createdAt: data.createdAt || now(),
    updatedAt: now(),

    estado: {
      fase: "formulacion",
      coberturaMGAWeb: 0,
      listoParaMGAWeb: false,
      ultimoPaso: "",
      proximoPaso: "Ingresar o analizar la idea del proyecto."
    },

    idea: {
      texto: "",
      origen: "",
      fecha: ""
    },

    datosBasicos: {
      nombreProyecto: "",
      entidadFormuladora: "",
      entidadEjecutora: "",
      departamento: "",
      municipio: "",
      responsable: "",
      valorTotal: 0
    },

    identificacionMGA: {
      sector: "",
      sectorCodigo: "",
      programa: "",
      programaCodigo: "",
      productoMGA: "",
      productoCodigo: "",
      tipologia: "",
      tipologiaCodigo: "",
      localizacion: {
        departamento: "",
        municipio: "",
        zona: "",
        veredaBarrio: "",
        coordenadas: ""
      },
      horizonteEvaluacion: {
        anioInicio: "",
        anioFinal: "",
        numeroVigencias: 0
      },
      bpin: ""
    },

    politicaPublica: {
      planNacional: "",
      lineaPND: "",
      programaPND: "",
      planDepartamental: "",
      lineaDepartamental: "",
      metaDepartamental: "",
      planMunicipal: "",
      lineaMunicipal: "",
      programaMunicipal: "",
      metaMunicipal: "",
      indicadorPlan: ""
    },

    diagnosticoMGA: {
      situacionActual: "",
      problemaCentral: "",
      magnitudProblema: "",
      fuenteMagnitud: "",
      justificacion: "",
      descripcionTerritorial: "",
      ofertaActual: "",
      demandaActual: "",
      brecha: "",
      poblacionAfectadaResumen: ""
    },

    arbolProblemasMGA: {
      problemaCentral: "",
      causasDirectas: [],
      causasIndirectas: [],
      efectosDirectos: [],
      efectosIndirectos: []
    },

    arbolObjetivosMGA: {
      objetivoGeneral: "",
      objetivosEspecificos: [],
      medios: [],
      fines: []
    },

    participantesMGA: [],

    poblacionMGA: {
      poblacionAfectada: {
        cantidad: 0,
        unidad: "",
        descripcion: "",
        fuente: "",
        localizacion: ""
      },
      poblacionObjetivo: {
        cantidad: 0,
        unidad: "",
        descripcion: "",
        fuente: "",
        localizacion: ""
      },
      caracterizacion: {
        genero: "",
        edad: "",
        condicionVulnerabilidad: "",
        enfoqueDiferencial: "",
        grupoPoblacional: ""
      }
    },

    alternativasMGA: [],
    alternativaSeleccionadaMGA: {
      id: "",
      nombre: "",
      descripcion: "",
      justificacion: ""
    },

    cadenaValorMGA: {
      objetivoGeneral: "",
      objetivosEspecificos: [],
      productos: [],
      actividades: [],
      relacionPresupuesto: []
    },

    indicadoresMGA: [],
    riesgosMGA: [],

    presupuesto: {
      costoDirecto: 0,
      administracionPct: 0,
      imprevistosPct: 0,
      utilidadPct: 0,
      ivaUtilidadPct: 0,
      valorTotal: 0,
      capitulos: [],
      items: [],
      apus: [],
      insumos: [],
      subproductos: []
    },

    fuentesFinanciacionMGA: [],

    cronogramaMGA: {
      fechaInicio: "",
      fechaFinal: "",
      duracionMeses: 0,
      actividades: []
    },

    sostenibilidadMGA: {
      tecnica: "",
      financiera: "",
      institucional: "",
      ambiental: "",
      operacion: "",
      mantenimiento: "",
      responsable: "",
      costosOperacion: 0,
      costosMantenimiento: 0
    },

    documentosMGA: {
      diagnostico: "",
      justificacion: "",
      resumenEjecutivo: "",
      descripcionProyecto: "",
      beneficios: "",
      sostenibilidad: "",
      marcoLogico: "",
      estudiosRequeridos: [],
      soportesRequeridos: [],
      checklistDocumental: []
    },

    adjuntos: [],
    memoriaInteligente: {},
    historialInteligente: [],
    coberturaMGAWeb: {},
    inspectorMGA: {}
  };

  return deepMerge(base, data || {});
}

function normalizarProyecto(project = {}){

  const p = createEmptyProjectCore(project);

  // Compatibilidad con estructura antigua.
  p.datosBasicos.nombreProyecto =
    p.datosBasicos.nombreProyecto ||
    project.name ||
    project.nombreProyecto ||
    project.title ||
    "";

  p.datosBasicos.entidadFormuladora =
    p.datosBasicos.entidadFormuladora ||
    project.entity ||
    project.entidad ||
    "";

  p.datosBasicos.departamento =
    p.datosBasicos.departamento ||
    project.departamento ||
    project.depto ||
    "";

  p.datosBasicos.municipio =
    p.datosBasicos.municipio ||
    project.municipio ||
    "";

  p.presupuesto.items = ensureArray(
    p.presupuesto.items.length ? p.presupuesto.items : project.items
  );

  p.presupuesto.capitulos = ensureArray(
    p.presupuesto.capitulos.length ? p.presupuesto.capitulos : project.chapters
  );

  p.presupuesto.apus = ensureArray(
    p.presupuesto.apus.length ? p.presupuesto.apus : project.apus
  );

  if(project.settings){
    p.presupuesto.administracionPct = project.settings.adminPct || p.presupuesto.administracionPct;
    p.presupuesto.imprevistosPct = project.settings.imprevPct || p.presupuesto.imprevistosPct;
    p.presupuesto.utilidadPct = project.settings.utilPct || p.presupuesto.utilidadPct;
    p.presupuesto.ivaUtilidadPct = project.settings.ivaUtilPct || p.presupuesto.ivaUtilidadPct;
  }

  if(project.formulacionMGA){
    aplicarFormulacionMGA(p, project.formulacionMGA);
  }

  p.updatedAt = now();

  return p;
}

function aplicarFormulacionMGA(project, formulacion){

  if(!formulacion) return project;

  const f = formulacion;

  if(f.identificacion){
    project.idea.texto = project.idea.texto || f.identificacion.idea || "";
    project.identificacionMGA.sector = f.identificacion.sector || project.identificacionMGA.sector;
    project.identificacionMGA.sectorCodigo = f.identificacion.sectorCodigo || project.identificacionMGA.sectorCodigo;
    project.identificacionMGA.tipologia = f.identificacion.tipologia || project.identificacionMGA.tipologia;
    project.identificacionMGA.tipologiaCodigo = f.identificacion.tipologiaCodigo || project.identificacionMGA.tipologiaCodigo;
  }

  if(f.diagnostico){
    project.diagnosticoMGA.situacionActual =
      f.diagnostico.diagnostico ||
      f.diagnostico.descripcion ||
      project.diagnosticoMGA.situacionActual;

    project.diagnosticoMGA.problemaCentral =
      f.diagnostico.problemaCentral ||
      project.diagnosticoMGA.problemaCentral;

    project.diagnosticoMGA.justificacion =
      f.diagnostico.justificacion ||
      project.diagnosticoMGA.justificacion;
  }

  if(f.arbolProblemas){
    project.arbolProblemasMGA = deepMerge(project.arbolProblemasMGA, f.arbolProblemas);
  }

  if(f.arbolObjetivos){
    project.arbolObjetivosMGA = deepMerge(project.arbolObjetivosMGA, f.arbolObjetivos);
  }

  if(f.cadenaValor){
    project.cadenaValorMGA = deepMerge(project.cadenaValorMGA, f.cadenaValor);
  }

  if(f.indicadores){
    project.indicadoresMGA = ensureArray(f.indicadores);
  }

  if(f.riesgos){
    project.riesgosMGA = ensureArray(f.riesgos);
  }

  if(f.fuentesFinanciacion){
    project.fuentesFinanciacionMGA = ensureArray(f.fuentesFinanciacion);
  }

  if(f.documentos){
    project.documentosMGA = deepMerge(project.documentosMGA, f.documentos);
  }

  if(f.presupuestoPreliminar){
    project.presupuestoPreliminarMGA = f.presupuestoPreliminar;
  }

  return project;
}

function registrarHistorial(project, tipo, titulo, descripcion, cambios = []){

  project.historialInteligente = ensureArray(project.historialInteligente);

  project.historialInteligente.push({
    id: uuid("hist"),
    fecha: now(),
    tipo: tipo || "GENERAL",
    titulo: titulo || "",
    descripcion: descripcion || "",
    cambios
  });

  project.updatedAt = now();

  return project;
}

function actualizarMemoria(project){

  project.memoriaInteligente = {
    fechaUltimaActualizacion: now(),
    estadoGeneral: project.estado?.fase || "formulacion",
    avanceMGAWeb: project.estado?.coberturaMGAWeb || 0,
    sector: project.identificacionMGA?.sector || "",
    tipologia: project.identificacionMGA?.tipologia || "",
    problema: project.diagnosticoMGA?.problemaCentral || project.arbolProblemasMGA?.problemaCentral || "",
    objetivo: project.arbolObjetivosMGA?.objetivoGeneral || "",
    proximoPaso: project.estado?.proximoPaso || "",
    recomendaciones: [],
    resumenEjecutivoInterno: construirResumenInterno(project)
  };

  return project;
}

function construirResumenInterno(project){

  const partes = [];

  if(project.datosBasicos?.nombreProyecto){
    partes.push("Proyecto: " + project.datosBasicos.nombreProyecto + ".");
  }

  if(project.identificacionMGA?.sector){
    partes.push("Sector: " + project.identificacionMGA.sector + ".");
  }

  if(project.identificacionMGA?.tipologia){
    partes.push("Tipología: " + project.identificacionMGA.tipologia + ".");
  }

  if(project.diagnosticoMGA?.problemaCentral){
    partes.push("Problema central: " + project.diagnosticoMGA.problemaCentral + ".");
  }

  if(project.arbolObjetivosMGA?.objetivoGeneral){
    partes.push("Objetivo general: " + project.arbolObjetivosMGA.objetivoGeneral + ".");
  }

  if(project.estado?.coberturaMGAWeb){
    partes.push("Cobertura MGA Web: " + project.estado.coberturaMGAWeb + "%.");
  }

  return partes.join(" ");
}

function set(project, path, value){
  const parts = String(path).split(".");
  let cur = project;

  parts.forEach((key, idx) => {
    if(idx === parts.length - 1){
      cur[key] = value;
    }else{
      cur[key] = cur[key] || {};
      cur = cur[key];
    }
  });

  project.updatedAt = now();

  return project;
}

function get(project, path){
  return String(path).split(".").reduce((acc, key) => {
    if(acc === undefined || acc === null) return undefined;
    if(Array.isArray(acc) && !isNaN(Number(key))) return acc[Number(key)];
    return acc[key];
  }, project);
}

function resumen(project){

  return {
    id: project.id,
    nombre: project.datosBasicos?.nombreProyecto || "",
    sector: project.identificacionMGA?.sector || "",
    tipologia: project.identificacionMGA?.tipologia || "",
    problema: project.diagnosticoMGA?.problemaCentral || project.arbolProblemasMGA?.problemaCentral || "",
    objetivo: project.arbolObjetivosMGA?.objetivoGeneral || "",
    indicadores: ensureArray(project.indicadoresMGA).length,
    riesgos: ensureArray(project.riesgosMGA).length,
    itemsPresupuesto: ensureArray(project.presupuesto?.items).length,
    cobertura: project.estado?.coberturaMGAWeb || 0,
    proximoPaso: project.estado?.proximoPaso || ""
  };
}

async function guardar(projectId, project){

  if(!projectId){
    return {ok:false, mensaje:"No se recibió projectId."};
  }

  const data = clone(project);
  data.updatedAt = now();

  try{

    if(window.StorageApp && typeof StorageApp.updateProject === "function"){
      await StorageApp.updateProject(projectId, data);
      return {ok:true, modo:"StorageApp.updateProject"};
    }

    if(window.AppStorage && typeof AppStorage.updateProject === "function"){
      await AppStorage.updateProject(projectId, data);
      return {ok:true, modo:"AppStorage.updateProject"};
    }

    if(window.DB && typeof DB.updateProject === "function"){
      await DB.updateProject(projectId, data);
      return {ok:true, modo:"DB.updateProject"};
    }

    localStorage.setItem("project_core_" + projectId, JSON.stringify(data));
    return {ok:true, modo:"localStorage", key:"project_core_" + projectId};

  }catch(err){
    return {ok:false, mensaje:err.message || String(err)};
  }
}

async function cargar(projectId, fallback = {}){

  let project = fallback || {};

  try{
    if(window.StorageApp && typeof StorageApp.getProject === "function"){
      project = await StorageApp.getProject(projectId);
    }else if(window.AppStorage && typeof AppStorage.getProject === "function"){
      project = await AppStorage.getProject(projectId);
    }else if(window.DB && typeof DB.getProject === "function"){
      project = await DB.getProject(projectId);
    }else{
      const raw = localStorage.getItem("project_core_" + projectId);
      if(raw) project = JSON.parse(raw);
    }
  }catch(e){}

  return normalizarProyecto(project || fallback || {});
}

return {
  VERSION,
  createEmptyProjectCore,
  normalizarProyecto,
  aplicarFormulacionMGA,
  registrarHistorial,
  actualizarMemoria,
  construirResumenInterno,
  set,
  get,
  resumen,
  guardar,
  cargar
};

})();

window.ProjectCoreMGA = ProjectCoreMGA;
