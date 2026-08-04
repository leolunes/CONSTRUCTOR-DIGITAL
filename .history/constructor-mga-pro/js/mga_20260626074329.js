// =====================================
// MGA.JS - CONSTRUCTOR MGA PRO
// =====================================
// Archivo central para el modelo MGA.
// Aquí se guardan las funciones comunes que usarán:
// Diagnóstico, Árbol de Problemas, Árbol de Objetivos,
// Cadena de Valor, Indicadores, Riesgos, Cronograma,
// Documentos y textos listos para MGA Web.

// =====================================
// UTILIDADES GENERALES
// =====================================

function MGA_nowISO(){
    return new Date().toISOString();
}

function MGA_uid(prefix = "mga"){
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function MGA_safeStr(value){
    return String(value ?? "").trim();
}

function MGA_safeNum(value, def = 0){
    const n = Number(value);
    return Number.isFinite(n) ? n : def;
}

function MGA_getProjectIdFromUrl(){
    const params = new URLSearchParams(window.location.search);
    return params.get("projectId") || "";
}

function MGA_goProject(projectId){
    if(!projectId){
        window.location.href = "proyectos.html";
        return;
    }

    window.location.href =
    `proyecto-detalle.html?projectId=${encodeURIComponent(projectId)}`;
}

// =====================================
// MODELO BASE DEL PROYECTO MGA
// =====================================

function MGA_createBaseModel(){

    return {

        versionMGA:
        1,

        actualizadoEn:
        MGA_nowISO(),

        datosGenerales: {

            nombreProyecto:
            "",

            entidadFormuladora:
            "",

            entidadEjecutora:
            "",

            sector:
            "",

            programa:
            "",

            subprograma:
            "",

            departamento:
            "",

            municipio:
            "",

            localizacion:
            "",

            fuenteFinanciacion:
            "",

            duracionMeses:
            0,

            valorEstimado:
            0,

            responsable:
            "",

            correoResponsable:
            ""

        },

        diagnostico: {

            situacionActual:
            "",

            problemaCentral:
            "",

            magnitudProblema:
            "",

            antecedentes:
            "",

            justificacion:
            "",

            poblacionAfectada:
            "",

            poblacionObjetivo:
            "",

            analisisTerritorial:
            "",

            ofertaActual:
            "",

            demandaActual:
            "",

            brecha:
            ""

        },

        arbolProblemas: {

            problemaCentral:
            "",

            causasDirectas:
            [],

            causasIndirectas:
            [],

            efectosDirectos:
            [],

            efectosIndirectos:
            []

        },

        arbolObjetivos: {

            objetivoGeneral:
            "",

            mediosDirectos:
            [],

            mediosIndirectos:
            [],

            finesDirectos:
            [],

            finesIndirectos:
            []

        },

        alternativas: {

            alternativasAnalizadas:
            [],

            alternativaSeleccionada:
            "",

            justificacionSeleccion:
            ""

        },

        cadenaValor: {

            objetivoGeneral:
            "",

            objetivosEspecificos:
            [],

            productos:
            [],

            actividades:
            [],

            insumos:
            []

        },

        indicadores: {

            producto:
            [],

            resultado:
            [],

            gestion:
            [],

            impacto:
            []

        },

        riesgos:
        [],

        cronograma: {

            fechaInicio:
            "",

            fechaFin:
            "",

            actividades:
            []

        },

        presupuestoMGA: {

            fuenteFinanciacion:
            "",

            valorTotal:
            0,

            fuentes:
            [],

            relacionItemsPresupuesto:
            []

        },

        documentosMGA: {

            descripcionProblema:
            "",

            justificacion:
            "",

            objetivoGeneral:
            "",

            analisisAlternativas:
            "",

            beneficios:
            "",

            sostenibilidad:
            "",

            textoCopiarMGA:
            ""

        },

        checklist: {

            problemaBienFormulado:
            false,

            causasRelacionadas:
            false,

            objetivosConsistentes:
            false,

            productosConActividades:
            false,

            actividadesConPresupuesto:
            false,

            indicadoresConMeta:
            false,

            riesgosIdentificados:
            false,

            cronogramaCompleto:
            false,

            poblacionDefinida:
            false,

            localizacionCompleta:
            false

        }

    };

}

// =====================================
// NORMALIZACIÓN DEL MODELO
// =====================================

function MGA_normalizeModel(model){

    const base =
    MGA_createBaseModel();

    const m =
    model && typeof model === "object"
        ? model
        : {};

    const out =
    {
        ...base,
        ...m
    };

    out.datosGenerales =
    {
        ...base.datosGenerales,
        ...(m.datosGenerales || {})
    };

    out.diagnostico =
    {
        ...base.diagnostico,
        ...(m.diagnostico || {})
    };

    out.arbolProblemas =
    {
        ...base.arbolProblemas,
        ...(m.arbolProblemas || {})
    };

    out.arbolObjetivos =
    {
        ...base.arbolObjetivos,
        ...(m.arbolObjetivos || {})
    };

    out.alternativas =
    {
        ...base.alternativas,
        ...(m.alternativas || {})
    };

    out.cadenaValor =
    {
        ...base.cadenaValor,
        ...(m.cadenaValor || {})
    };

    out.indicadores =
    {
        ...base.indicadores,
        ...(m.indicadores || {})
    };

    out.cronograma =
    {
        ...base.cronograma,
        ...(m.cronograma || {})
    };

    out.presupuestoMGA =
    {
        ...base.presupuestoMGA,
        ...(m.presupuestoMGA || {})
    };

    out.documentosMGA =
    {
        ...base.documentosMGA,
        ...(m.documentosMGA || {})
    };

    out.checklist =
    {
        ...base.checklist,
        ...(m.checklist || {})
    };

    if(!Array.isArray(out.arbolProblemas.causasDirectas)) out.arbolProblemas.causasDirectas = [];
    if(!Array.isArray(out.arbolProblemas.causasIndirectas)) out.arbolProblemas.causasIndirectas = [];
    if(!Array.isArray(out.arbolProblemas.efectosDirectos)) out.arbolProblemas.efectosDirectos = [];
    if(!Array.isArray(out.arbolProblemas.efectosIndirectos)) out.arbolProblemas.efectosIndirectos = [];

    if(!Array.isArray(out.arbolObjetivos.mediosDirectos)) out.arbolObjetivos.mediosDirectos = [];
    if(!Array.isArray(out.arbolObjetivos.mediosIndirectos)) out.arbolObjetivos.mediosIndirectos = [];
    if(!Array.isArray(out.arbolObjetivos.finesDirectos)) out.arbolObjetivos.finesDirectos = [];
    if(!Array.isArray(out.arbolObjetivos.finesIndirectos)) out.arbolObjetivos.finesIndirectos = [];

    if(!Array.isArray(out.alternativas.alternativasAnalizadas)) out.alternativas.alternativasAnalizadas = [];
    if(!Array.isArray(out.cadenaValor.objetivosEspecificos)) out.cadenaValor.objetivosEspecificos = [];
    if(!Array.isArray(out.cadenaValor.productos)) out.cadenaValor.productos = [];
    if(!Array.isArray(out.cadenaValor.actividades)) out.cadenaValor.actividades = [];
    if(!Array.isArray(out.cadenaValor.insumos)) out.cadenaValor.insumos = [];

    if(!Array.isArray(out.indicadores.producto)) out.indicadores.producto = [];
    if(!Array.isArray(out.indicadores.resultado)) out.indicadores.resultado = [];
    if(!Array.isArray(out.indicadores.gestion)) out.indicadores.gestion = [];
    if(!Array.isArray(out.indicadores.impacto)) out.indicadores.impacto = [];

    if(!Array.isArray(out.riesgos)) out.riesgos = [];
    if(!Array.isArray(out.cronograma.actividades)) out.cronograma.actividades = [];
    if(!Array.isArray(out.presupuestoMGA.fuentes)) out.presupuestoMGA.fuentes = [];
    if(!Array.isArray(out.presupuestoMGA.relacionItemsPresupuesto)) out.presupuestoMGA.relacionItemsPresupuesto = [];

    out.versionMGA =
    MGA_safeNum(out.versionMGA, 1);

    out.actualizadoEn =
    out.actualizadoEn || MGA_nowISO();

    out.datosGenerales.duracionMeses =
    MGA_safeNum(out.datosGenerales.duracionMeses, 0);

    out.datosGenerales.valorEstimado =
    MGA_safeNum(out.datosGenerales.valorEstimado, 0);

    out.presupuestoMGA.valorTotal =
    MGA_safeNum(out.presupuestoMGA.valorTotal, 0);

    return out;

}

// =====================================
// MEZCLA PROFUNDA
// =====================================

function MGA_deepMerge(target, source){

    const output =
    {
        ...(target || {})
    };

    for(const key of Object.keys(source || {})){

        const src =
        source[key];

        const tgt =
        output[key];

        if(
            src &&
            typeof src === "object" &&
            !Array.isArray(src)
        ){

            output[key] =
            MGA_deepMerge(
                tgt && typeof tgt === "object" ? tgt : {},
                src
            );

        }else{

            output[key] =
            src;

        }

    }

    return output;

}

// =====================================
// INTEGRACIÓN CON STORAGEAPI
// =====================================

function MGA_getProject(projectId){

    if(!window.StorageAPI){
        alert("StorageAPI no está disponible.");
        return null;
    }

    const project =
    StorageAPI.getProjectById(projectId);

    if(!project){
        alert("Proyecto no encontrado.");
        window.location.href = "proyectos.html";
        return null;
    }

    return project;

}

function MGA_getModel(project){

    if(!project){
        return MGA_createBaseModel();
    }

    return MGA_normalizeModel(project.mga);

}

function MGA_updateModel(projectId, patch){

    if(!window.StorageAPI){
        alert("StorageAPI no está disponible.");
        return null;
    }

    const project =
    StorageAPI.getProjectById(projectId);

    if(!project){
        alert("Proyecto no encontrado.");
        return null;
    }

    const current =
    MGA_getModel(project);

    const next =
    MGA_deepMerge(current, patch || {});

    next.actualizadoEn =
    MGA_nowISO();

    StorageAPI.updateProject(projectId, {
        mga:
        MGA_normalizeModel(next)
    });

    return StorageAPI.getProjectById(projectId);

}

// =====================================
// GENERADORES DE ELEMENTOS
// =====================================

function MGA_newTextItem(texto = ""){

    return {
        id:
        MGA_uid("txt"),

        texto:
        MGA_safeStr(texto)
    };

}

function MGA_newObjetivoEspecifico(texto = ""){

    return {
        id:
        MGA_uid("obj"),

        texto:
        MGA_safeStr(texto),

        productoIds:
        []
    };

}

function MGA_newProducto(nombre = ""){

    return {
        id:
        MGA_uid("prod"),

        nombre:
        MGA_safeStr(nombre),

        descripcion:
        "",

        unidadMedida:
        "",

        meta:
        0,

        objetivoEspecificoId:
        "",

        actividadesIds:
        []
    };

}

function MGA_newActividad(nombre = ""){

    return {
        id:
        MGA_uid("act"),

        nombre:
        MGA_safeStr(nombre),

        descripcion:
        "",

        productoId:
        "",

        duracionMeses:
        0,

        valor:
        0,

        itemPresupuestoIds:
        []
    };

}

function MGA_newIndicador(tipo = "producto"){

    return {
        id:
        MGA_uid("ind"),

        tipo:
        MGA_safeStr(tipo),

        nombre:
        "",

        descripcion:
        "",

        unidadMedida:
        "",

        lineaBase:
        0,

        meta:
        0,

        fuenteVerificacion:
        ""
    };

}

function MGA_newRiesgo(){

    return {
        id:
        MGA_uid("risk"),

        tipo:
        "",

        descripcion:
        "",

        probabilidad:
        "",

        impacto:
        "",

        nivel:
        "",

        medidaMitigacion:
        "",

        responsable:
        ""
    };

}

function MGA_newCronogramaActividad(){

    return {
        id:
        MGA_uid("cron"),

        actividadId:
        "",

        nombre:
        "",

        mesInicio:
        1,

        mesFin:
        1,

        valorProgramado:
        0
    };

}

// =====================================
// TEXTOS AUTOMÁTICOS BÁSICOS
// =====================================

function MGA_generarTextoDescripcionProblema(model){

    const m =
    MGA_normalizeModel(model);

    const problema =
    MGA_safeStr(m.diagnostico.problemaCentral);

    const poblacion =
    MGA_safeStr(m.diagnostico.poblacionAfectada);

    const territorio =
    MGA_safeStr(m.datosGenerales.localizacion || m.datosGenerales.municipio);

    if(!problema){
        return "";
    }

    let texto =
    `El problema identificado corresponde a ${problema}.`;

    if(territorio){
        texto += ` Esta situación se presenta en ${territorio}.`;
    }

    if(poblacion){
        texto += ` La población afectada corresponde a ${poblacion}.`;
    }

    texto +=
    " Esta condición limita el acceso efectivo a bienes, servicios u oportunidades de desarrollo, generando efectos negativos sobre la calidad de vida y el bienestar de la comunidad.";

    return texto;

}

function MGA_generarTextoObjetivoGeneral(model){

    const m =
    MGA_normalizeModel(model);

    const problema =
    MGA_safeStr(m.diagnostico.problemaCentral);

    if(!problema){
        return "";
    }

    return "Contribuir a la solución de la problemática identificada mediante la implementación de acciones integrales orientadas a mejorar las condiciones actuales de la población objetivo.";

}

// =====================================
// API GLOBAL
// =====================================

window.MGA = {

    nowISO:
    MGA_nowISO,

    uid:
    MGA_uid,

    safeStr:
    MGA_safeStr,

    safeNum:
    MGA_safeNum,

    getProjectIdFromUrl:
    MGA_getProjectIdFromUrl,

    goProject:
    MGA_goProject,

    createBaseModel:
    MGA_createBaseModel,

    normalizeModel:
    MGA_normalizeModel,

    deepMerge:
    MGA_deepMerge,

    getProject:
    MGA_getProject,

    getModel:
    MGA_getModel,

    updateModel:
    MGA_updateModel,

    newTextItem:
    MGA_newTextItem,

    newObjetivoEspecifico:
    MGA_newObjetivoEspecifico,

    newProducto:
    MGA_newProducto,

    newActividad:
    MGA_newActividad,

    newIndicador:
    MGA_newIndicador,

    newRiesgo:
    MGA_newRiesgo,

    newCronogramaActividad:
    MGA_newCronogramaActividad,

    generarTextoDescripcionProblema:
    MGA_generarTextoDescripcionProblema,

    generarTextoObjetivoGeneral:
    MGA_generarTextoObjetivoGeneral

};
