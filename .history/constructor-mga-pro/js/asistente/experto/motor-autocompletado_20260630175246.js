// =====================================
// MOTOR-AUTOCOMPLETADO.JS
// CONSTRUCTOR MGA PRO
// Escribe el resultado del Orquestador en el proyecto real
// =====================================

/*
  Objetivo:
  Tomar el paquete generado por MotorOrquestador y convertirlo en datos
  persistibles dentro del proyecto.

  Este motor NO borra presupuesto ni APUs existentes.
  Guarda la formulación generada en una estructura segura:
  proyecto.formulacionMGA
  proyecto.memoriaInteligente
  proyecto.asistenteIntegral

  Requiere:
  - MotorOrquestador
  - storage.js / db.js / app.js, si existen métodos globales de guardado
*/

const MotorAutocompletado = (()=>{

function ahoraISO(){
    return new Date().toISOString();
}

function clonar(obj){
    return JSON.parse(JSON.stringify(obj || null));
}

function esc(v){
    return String(v || "");
}

function crearFormulacionDesdePaquete(paquete){

    const r = paquete?.resultado || {};
    const proyecto = r.proyecto || {};
    const analisis = r.analisis || {};
    const docs = r.documentos || {};
    const presupuesto = r.presupuesto || {};

    return {
        version:"1.1",
        generadoPor:"MotorAutocompletado",
        fechaGeneracion:ahoraISO(),

        identificacion:{
            idea:r.idea || paquete?.resultado?.idea || paquete?.idea || "",
            sector:analisis.sector || proyecto.identificacion?.sector || "",
            sectorCodigo:analisis.sectorCodigo || proyecto.identificacion?.sectorCodigo || "",
            tipologia:analisis.tipologia || proyecto.identificacion?.tipologia || "",
            tipologiaCodigo:analisis.tipologiaCodigo || proyecto.identificacion?.tipologiaCodigo || "",
            confianza:analisis.confianza || "",
            puntaje:analisis.puntaje || 0
        },

        diagnostico:{
            problemaCentral:proyecto.problema?.problemaCentral || "",
            causasDirectas:proyecto.problema?.causasDirectas || [],
            causasIndirectas:proyecto.problema?.causasIndirectas || [],
            efectosDirectos:proyecto.problema?.efectosDirectos || [],
            efectosIndirectos:proyecto.problema?.efectosIndirectos || [],
            justificacion:proyecto.justificacion || docs.justificacion || "",
            diagnostico:docs.diagnostico || "",
            descripcion:proyecto.descripcion || docs.descripcion || "",
            poblacionObjetivo:proyecto.poblacionObjetivo || []
        },

        arbolProblemas:docs.arbolProblemas || {
            problemaCentral:proyecto.problema?.problemaCentral || "",
            causasDirectas:proyecto.problema?.causasDirectas || [],
            causasIndirectas:proyecto.problema?.causasIndirectas || [],
            efectosDirectos:proyecto.problema?.efectosDirectos || [],
            efectosIndirectos:proyecto.problema?.efectosIndirectos || []
        },

        arbolObjetivos:docs.arbolObjetivos || {
            objetivoGeneral:proyecto.objetivos?.objetivoGeneral || "",
            objetivosEspecificos:proyecto.objetivos?.objetivosEspecificos || []
        },

        cadenaValor:{
            objetivoGeneral:proyecto.objetivos?.objetivoGeneral || "",
            objetivosEspecificos:proyecto.objetivos?.objetivosEspecificos || [],
            productos:proyecto.cadenaValor?.productos || [],
            actividades:proyecto.cadenaValor?.actividades || [],
            indicadores:proyecto.cadenaValor?.indicadores || []
        },

        indicadores:r.indicadores || [],
        riesgos:r.riesgos || [],
        fuentesFinanciacion:r.financiacion || proyecto.fuentesFinanciacion || [],

        documentos:{
            diagnostico:docs.diagnostico || "",
            justificacion:docs.justificacion || proyecto.justificacion || "",
            resumenEjecutivo:docs.resumenEjecutivo || proyecto.anexos?.resumenEjecutivo || "",
            descripcion:docs.descripcion || proyecto.descripcion || "",
            beneficios:docs.beneficios || proyecto.beneficios || "",
            sostenibilidad:docs.sostenibilidad || proyecto.sostenibilidad || "",
            marcoLogico:docs.marcoLogico || null
        },

        presupuestoPreliminar:{
            modo:presupuesto.modo || "preliminar",
            sector:presupuesto.sector || "",
            tipologia:presupuesto.tipologia || "",
            alcance:presupuesto.alcance || "",
            capitulosSugeridos:presupuesto.capitulosSugeridos || [],
            observacion:presupuesto.observacion || ""
        },

        coherencia:r.coherencia || null,
        pasos:paquete.pasos || [],
        alertas:paquete.alertas || [],
        errores:paquete.errores || [],
        siguienteAccion:r.siguienteAccion || ""
    };
}

function crearMemoriaInteligente(paquete, formulacion){

    const coherencia = formulacion.coherencia;
    const avance = window.MotorOrquestador
        ? MotorOrquestador.resumenEstado(paquete)?.avance || 0
        : 0;

    return {
        fecha:ahoraISO(),
        estado:"Generado por Copiloto",
        avance,
        sector:formulacion.identificacion.sector,
        tipologia:formulacion.identificacion.tipologia,
        problema:formulacion.diagnostico.problemaCentral,
        objetivo:formulacion.arbolObjetivos.objetivoGeneral,
        productos:formulacion.cadenaValor.productos,
        indicadores:formulacion.indicadores,
        riesgos:formulacion.riesgos,
        fuentes:formulacion.fuentesFinanciacion,
        presupuestoPreliminar:formulacion.presupuestoPreliminar,
        coherencia:coherencia ? coherencia.puntaje : null,
        proximoPaso:formulacion.siguienteAccion || "Revisar y ajustar la información generada."
    };
}

function crearHistorial(paquete, formulacion){

    return {
        fecha:ahoraISO(),
        tipo:"AUTOCOMPLETADO_COPILOTO",
        titulo:"El Copiloto generó estructura integral del proyecto",
        detalle:[
            `Sector identificado: ${formulacion.identificacion.sector}`,
            `Tipología identificada: ${formulacion.identificacion.tipologia}`,
            `Problema generado: ${formulacion.diagnostico.problemaCentral}`,
            `Objetivo generado: ${formulacion.arbolObjetivos.objetivoGeneral}`,
            `Indicadores generados: ${formulacion.indicadores.length}`,
            `Riesgos generados: ${formulacion.riesgos.length}`,
            `Fuentes sugeridas: ${formulacion.fuentesFinanciacion.length}`
        ],
        pasos:paquete.pasos || []
    };
}

async function obtenerProyecto(projectId){

    if(!projectId) return null;

    // Primero intenta cargar desde el nuevo núcleo inteligente del proyecto.
    if(window.ProjectCoreMGA && typeof ProjectCoreMGA.cargar === "function"){
        try{
            return await ProjectCoreMGA.cargar(projectId, window.MGAProjectCore || {});
        }catch(e){
            console.warn("ProjectCoreMGA no pudo cargar el proyecto:", e);
        }
    }

    if(window.StorageApp && typeof StorageApp.getProject === "function"){
        return await StorageApp.getProject(projectId);
    }

    if(window.AppStorage && typeof AppStorage.getProject === "function"){
        return await AppStorage.getProject(projectId);
    }

    if(window.DB && typeof DB.getProject === "function"){
        return await DB.getProject(projectId);
    }

    const rawCore = localStorage.getItem("project_core_" + projectId);
    if(rawCore){
        try{return JSON.parse(rawCore);}catch(e){}
    }

    const raw = localStorage.getItem("project_" + projectId);
    if(raw){
        try{return JSON.parse(raw);}catch(e){}
    }

    return null;
}

async function guardarProyecto(projectId, data){

    // Si existe el núcleo inteligente, se guarda el proyecto normalizado allí.
    if(window.ProjectCoreMGA && typeof ProjectCoreMGA.normalizarProyecto === "function"){
        try{
            const core = ProjectCoreMGA.normalizarProyecto(data);
            window.MGAProjectCore = core;

            if(typeof ProjectCoreMGA.guardar === "function"){
                return await ProjectCoreMGA.guardar(projectId, core);
            }
        }catch(e){
            console.warn("ProjectCoreMGA no pudo guardar el proyecto:", e);
        }
    }

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

    const key = "mga_autocompletado_" + projectId;
    localStorage.setItem(key, JSON.stringify({
        projectId,
        fecha:ahoraISO(),
        data
    }));

    return {ok:true, modo:"localStorage", key};
}


function aplicarSobreProjectCore(existente, formulacion, memoria, historial, paquete){

    let core = existente || {};

    if(window.ProjectCoreMGA && typeof ProjectCoreMGA.normalizarProyecto === "function"){

        core = ProjectCoreMGA.normalizarProyecto(core);

        core.idea = core.idea || {};
        core.idea.texto = core.idea.texto || formulacion.identificacion.idea || "";
        core.idea.origen = "Copiloto Orquestador";
        core.idea.fecha = ahoraISO();

        if(typeof ProjectCoreMGA.aplicarFormulacionMGA === "function"){
            ProjectCoreMGA.aplicarFormulacionMGA(core, formulacion);
        }

        core.memoriaInteligente = memoria;

        core.asistenteIntegral = {
            fecha:ahoraISO(),
            paquete:clonar(paquete)
        };

        core.historialInteligente = Array.isArray(core.historialInteligente)
            ? core.historialInteligente
            : [];

        core.historialInteligente.push(historial);

        core.estado = core.estado || {};
        core.estado.fase = "formulacion";
        core.estado.ultimoPaso = "Autocompletado por Copiloto";
        core.estado.proximoPaso = formulacion.siguienteAccion || "Revisar cobertura MGA Web.";

        if(window.PanelCoberturaMGAWeb && typeof PanelCoberturaMGAWeb.evaluar === "function"){
            const cobertura = PanelCoberturaMGAWeb.evaluar(core);
            core.coberturaMGAWeb = cobertura;
            core.estado.coberturaMGAWeb = cobertura.porcentaje;
            core.estado.listoParaMGAWeb = cobertura.porcentaje >= 100;
        }

        if(typeof ProjectCoreMGA.actualizarMemoria === "function"){
            ProjectCoreMGA.actualizarMemoria(core);
        }

        return core;
    }

    return core;
}


async function aplicar(projectId, paquete, opciones = {}){

    if(!projectId){
        return {ok:false, mensaje:"No se recibió projectId."};
    }

    if(!paquete || !paquete.ok){
        return {ok:false, mensaje:"No hay paquete válido del Orquestador."};
    }

    const formulacion = crearFormulacionDesdePaquete(paquete);
    const memoria = crearMemoriaInteligente(paquete, formulacion);
    const historial = crearHistorial(paquete, formulacion);

    const existente = await obtenerProyecto(projectId);

    const update = aplicarSobreProjectCore(
        existente || {},
        formulacion,
        memoria,
        historial,
        paquete
    );

    update.formulacionMGA = formulacion;
    update.memoriaInteligente = update.memoriaInteligente || memoria;

    update.asistenteIntegral = {
        fecha:ahoraISO(),
        paquete:clonar(paquete)
    };

    if(!Array.isArray(update.historialInteligente)){
        update.historialInteligente = [];
    }

    if(!update.historialInteligente.some(h => h.fecha === historial.fecha && h.tipo === historial.tipo)){
        update.historialInteligente.push(historial);
    }

    // Compatibilidad con módulos que esperan nombres simples
    if(opciones.compatibilidad !== false){
        update.diagnosticoMGA = formulacion.diagnostico;
        update.arbolProblemasMGA = formulacion.arbolProblemas;
        update.arbolObjetivosMGA = formulacion.arbolObjetivos;
        update.cadenaValorMGA = formulacion.cadenaValor;
        update.indicadoresMGA = formulacion.indicadores;
        update.riesgosMGA = formulacion.riesgos;
        update.documentosMGA = formulacion.documentos;
        update.fuentesFinanciacionMGA = formulacion.fuentesFinanciacion;
        update.presupuestoPreliminarMGA = formulacion.presupuestoPreliminar;
    }

    const res = await guardarProyecto(projectId, update);

    window.MGAProjectCore = update;

    return {
        ok:true,
        modo:res.modo,
        key:res.key || "",
        formulacion,
        memoria:update.memoriaInteligente || memoria,
        historial,
        cobertura:update.coberturaMGAWeb || null,
        projectCore:update,
        mensaje:"Proyecto autocompletado correctamente en Project Core."
    };
}

function resumenAplicacion(resultado){

    if(!resultado || !resultado.ok){
        return "No fue posible autocompletar el proyecto.";
    }

    const f = resultado.formulacion;

    return [
        "✅ Proyecto autocompletado",
        "",
        "Sector: " + esc(f.identificacion.sector),
        "Tipología: " + esc(f.identificacion.tipologia),
        "Problema: " + esc(f.diagnostico.problemaCentral),
        "Objetivo: " + esc(f.arbolObjetivos.objetivoGeneral),
        "Indicadores: " + f.indicadores.length,
        "Riesgos: " + f.riesgos.length,
        "Fuentes: " + f.fuentesFinanciacion.length,
        "Cobertura MGA Web: " + (resultado.cobertura?.porcentaje ?? "No calculada") + "%",
        "",
        "Siguiente paso: " + esc(f.siguienteAccion)
    ].join("\n");
}

return {
    crearFormulacionDesdePaquete,
    crearMemoriaInteligente,
    crearHistorial,
    aplicar,
    resumenAplicacion
};

})();

window.MotorAutocompletado = MotorAutocompletado;
