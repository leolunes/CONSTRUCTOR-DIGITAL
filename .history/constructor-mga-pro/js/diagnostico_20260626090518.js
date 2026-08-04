// =====================================
// DIAGNOSTICO.JS - CONSTRUCTOR MGA PRO
// =====================================

// =====================================
// VARIABLES
// =====================================

let diagnosticoProjectId = "";
let diagnosticoProject = null;
let diagnosticoModel = null;

// =====================================
// INICIALIZACIÓN
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    diagnosticoProjectId =
    MGA.getProjectIdFromUrl();

    diagnosticoProject =
    MGA.getProject(diagnosticoProjectId);

    if(!diagnosticoProject){
        return;
    }

    diagnosticoModel =
    MGA.getModel(diagnosticoProject);

    configurarLinksDiagnostico();
    cargarEncabezadoDiagnostico();
    cargarFormularioDiagnostico();
    bindEventosDiagnostico();

});

// =====================================
// CONFIGURAR LINKS
// =====================================

function configurarLinksDiagnostico(){

    const id =
    encodeURIComponent(diagnosticoProjectId);

    const rutas =
    {
        btnVolverProyecto:
        `proyecto-detalle.html?projectId=${id}`,

        btnProyecto:
        `proyecto-detalle.html?projectId=${id}`,

        btnArbolProblemas:
        `arbol-problemas.html?projectId=${id}`,

        btnArbolObjetivos:
        `arbol-objetivos.html?projectId=${id}`,

        btnCadenaValor:
        `cadena-valor.html?projectId=${id}`
    };

    Object.keys(rutas).forEach(key => {

        const el =
        document.getElementById(key);

        if(el){
            el.href =
            rutas[key];
        }

    });

}

// =====================================
// ENCABEZADO
// =====================================

function cargarEncabezadoDiagnostico(){

    const sub =
    document.getElementById("diagSub");

    if(sub){
        sub.textContent =
        `${diagnosticoProject.name || "Proyecto"} · ${diagnosticoProject.entity || "Entidad no definida"} · ${diagnosticoProject.location || "Ubicación no definida"}`;
    }

}

// =====================================
// CARGAR FORMULARIO
// =====================================

function cargarFormularioDiagnostico(){

    const m =
    diagnosticoModel;

    const dg =
    m.datosGenerales || {};

    const d =
    m.diagnostico || {};

    setValue("sector", dg.sector);
    setValue("programa", dg.programa);
    setValue("departamento", dg.departamento);
    setValue("municipio", dg.municipio);
    setValue("localizacion", dg.localizacion || diagnosticoProject.location || "");

    setValue("situacionActual", d.situacionActual);
    setValue("problemaCentral", d.problemaCentral);
    setValue("magnitudProblema", d.magnitudProblema);
    setValue("antecedentes", d.antecedentes);
    setValue("justificacion", d.justificacion);
    setValue("poblacionAfectada", d.poblacionAfectada);
    setValue("poblacionObjetivo", d.poblacionObjetivo);
    setValue("analisisTerritorial", d.analisisTerritorial);
    setValue("ofertaActual", d.ofertaActual);
    setValue("demandaActual", d.demandaActual);
    setValue("brecha", d.brecha);

    const texto =
    m.documentosMGA?.descripcionProblema || "";

    setValue("textoProblemaGenerado", texto);

}

// =====================================
// EVENTOS
// =====================================

function bindEventosDiagnostico(){

    const form =
    document.getElementById("formDiagnostico");

    if(form){

        form.addEventListener("submit", (e) => {

            e.preventDefault();

            guardarDiagnostico();

        });

    }

    const btnTop =
    document.getElementById("btnGuardarDiagnosticoTop");

    if(btnTop){

        btnTop.addEventListener("click", () => {

            guardarDiagnostico();

        });

    }

    const btnGenerar =
    document.getElementById("btnGenerarTextoProblema");

    if(btnGenerar){

        btnGenerar.addEventListener("click", () => {

            generarTextoProblema();

        });

    }

    const btnCopiar =
    document.getElementById("btnCopiarTextoProblema");

    if(btnCopiar){

        btnCopiar.addEventListener("click", () => {

            copiarTextoProblema();

        });

    }

    const btnLimpiar =
    document.getElementById("btnLimpiarDiagnostico");

    if(btnLimpiar){

        btnLimpiar.addEventListener("click", () => {

            limpiarFormularioDiagnostico();

        });

    }

}

// =====================================
// GUARDAR DIAGNÓSTICO
// =====================================

function guardarDiagnostico(){

    const patch =
    construirPatchDiagnostico();

    const updated =
    MGA.updateModel(
        diagnosticoProjectId,
        patch
    );

    if(!updated){
        return;
    }

    diagnosticoProject =
    updated;

    diagnosticoModel =
    MGA.getModel(updated);

    alert("Diagnóstico guardado correctamente.");

}

// =====================================
// CONSTRUIR PATCH
// =====================================

function construirPatchDiagnostico(){

    const problemaCentral =
    getValue("problemaCentral");

    return {

        datosGenerales: {

            sector:
            getValue("sector"),

            programa:
            getValue("programa"),

            departamento:
            getValue("departamento"),

            municipio:
            getValue("municipio"),

            localizacion:
            getValue("localizacion")

        },

        diagnostico: {

            situacionActual:
            getValue("situacionActual"),

            problemaCentral:
            problemaCentral,

            magnitudProblema:
            getValue("magnitudProblema"),

            antecedentes:
            getValue("antecedentes"),

            justificacion:
            getValue("justificacion"),

            poblacionAfectada:
            getValue("poblacionAfectada"),

            poblacionObjetivo:
            getValue("poblacionObjetivo"),

            analisisTerritorial:
            getValue("analisisTerritorial"),

            ofertaActual:
            getValue("ofertaActual"),

            demandaActual:
            getValue("demandaActual"),

            brecha:
            getValue("brecha")

        },

        arbolProblemas: {

            problemaCentral:
            problemaCentral

        },

        checklist: {

            problemaBienFormulado:
            problemaCentral.length > 0,

            poblacionDefinida:
            getValue("poblacionObjetivo").length > 0,

            localizacionCompleta:
            getValue("localizacion").length > 0

        }

    };

}

// =====================================
// GENERAR TEXTO DEL PROBLEMA
// =====================================

function generarTextoProblema(){

    const temp =
    MGA.deepMerge(
        diagnosticoModel || MGA.createBaseModel(),
        construirPatchDiagnostico()
    );

    const texto =
    generarTextoDiagnosticoCompleto(temp);

    setValue("textoProblemaGenerado", texto);

    MGA.updateModel(
        diagnosticoProjectId,
        {
            documentosMGA: {
                descripcionProblema:
                texto
            }
        }
    );

    diagnosticoProject =
    StorageAPI.getProjectById(diagnosticoProjectId);

    diagnosticoModel =
    MGA.getModel(diagnosticoProject);

    alert("Texto sugerido generado y guardado.");

}

// =====================================
// TEXTO SUGERIDO COMPLETO
// =====================================

function generarTextoDiagnosticoCompleto(model){

    const m =
    MGA.normalizeModel(model);

    const dg =
    m.datosGenerales;

    const d =
    m.diagnostico;

    const partes =
    [];

    if(d.problemaCentral){

        partes.push(
            `El problema central identificado corresponde a: ${d.problemaCentral}.`
        );

    }

    if(d.situacionActual){

        partes.push(
            `Actualmente, la situación se caracteriza por ${d.situacionActual}`
        );

    }

    if(d.magnitudProblema){

        partes.push(
            `La magnitud del problema se evidencia en ${d.magnitudProblema}`
        );

    }

    if(d.poblacionAfectada){

        partes.push(
            `La población afectada corresponde a ${d.poblacionAfectada}.`
        );

    }

    if(d.poblacionObjetivo){

        partes.push(
            `La población objetivo que será atendida directamente por el proyecto corresponde a ${d.poblacionObjetivo}.`
        );

    }

    const territorio =
    [
        dg.localizacion,
        dg.municipio,
        dg.departamento
    ]
    .filter(Boolean)
    .join(", ");

    if(territorio){

        partes.push(
            `El área de intervención se localiza en ${territorio}.`
        );

    }

    if(d.ofertaActual || d.demandaActual || d.brecha){

        let textoBrecha =
        "Desde el análisis de oferta y demanda, ";

        if(d.ofertaActual){
            textoBrecha +=
            `la oferta actual se describe así: ${d.ofertaActual}. `;
        }

        if(d.demandaActual){
            textoBrecha +=
            `La demanda identificada corresponde a ${d.demandaActual}. `;
        }

        if(d.brecha){
            textoBrecha +=
            `La brecha existente se expresa en ${d.brecha}.`;
        }

        partes.push(textoBrecha);

    }

    if(d.justificacion){

        partes.push(
            `La intervención se justifica porque ${d.justificacion}`
        );

    }

    if(!partes.length){

        return "";

    }

    return partes.join("\n\n");

}

// =====================================
// COPIAR TEXTO
// =====================================

async function copiarTextoProblema(){

    const texto =
    getValue("textoProblemaGenerado");

    if(!texto){
        alert("No hay texto para copiar.");
        return;
    }

    try{

        await navigator.clipboard.writeText(texto);

        alert("Texto copiado al portapapeles.");

    }catch(_){

        const area =
        document.getElementById("textoProblemaGenerado");

        if(area){
            area.removeAttribute("readonly");
            area.select();
            document.execCommand("copy");
            area.setAttribute("readonly", "readonly");
            alert("Texto copiado.");
        }

    }

}

// =====================================
// LIMPIAR FORMULARIO
// =====================================

function limpiarFormularioDiagnostico(){

    if(!confirm("¿Desea limpiar los campos del formulario? Esta acción no borra lo ya guardado hasta que vuelva a guardar.")){
        return;
    }

    const ids =
    [
        "sector",
        "programa",
        "departamento",
        "municipio",
        "localizacion",
        "situacionActual",
        "problemaCentral",
        "magnitudProblema",
        "antecedentes",
        "justificacion",
        "poblacionAfectada",
        "poblacionObjetivo",
        "analisisTerritorial",
        "ofertaActual",
        "demandaActual",
        "brecha",
        "textoProblemaGenerado"
    ];

    ids.forEach(id => setValue(id, ""));

}

// =====================================
// HELPERS DOM
// =====================================

function getValue(id){

    const el =
    document.getElementById(id);

    return el
        ? String(el.value || "").trim()
        : "";

}

function setValue(id, value){

    const el =
    document.getElementById(id);

    if(el){
        el.value =
        value || "";
    }

}
