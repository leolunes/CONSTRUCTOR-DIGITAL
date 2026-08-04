// =====================================
// ARBOL-OBJETIVOS.JS - CONSTRUCTOR MGA PRO
// Integrado con MotorCadenaValor
// =====================================

let objetivosProjectId = "";
let objetivosProject = null;
let objetivosModel = null;

document.addEventListener("DOMContentLoaded", () => {

    objetivosProjectId =
    MGA.getProjectIdFromUrl();

    objetivosProject =
    MGA.getProject(objetivosProjectId);

    if(!objetivosProject){
        return;
    }

    objetivosModel =
    MGA.getModel(objetivosProject);

    asegurarModeloObjetivos();

    configurarLinksObjetivos();
    cargarDatosObjetivos();
    bindEventosObjetivos();

});

// =====================================
// LINKS
// =====================================

function configurarLinksObjetivos(){

    const id =
    encodeURIComponent(objetivosProjectId);

    const rutas =
    {
        btnVolverProyecto:
        `proyecto-detalle.html?projectId=${id}`,

        btnProyecto:
        `proyecto-detalle.html?projectId=${id}`,

        btnDiagnostico:
        `diagnostico.html?projectId=${id}`,

        btnArbolProblemas:
        `arbol-problemas.html?projectId=${id}`,

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

    const sub =
    document.getElementById("objetivosSub");

    if(sub){
        sub.textContent =
        `${objetivosProject.name || "Proyecto"} · Árbol de Objetivos`;
    }

}

// =====================================
// ASEGURAR MODELO
// =====================================

function asegurarModeloObjetivos(){

    if(!objetivosModel.arbolObjetivos){
        objetivosModel.arbolObjetivos = {};
    }

    if(!Array.isArray(objetivosModel.arbolObjetivos.mediosDirectos)){
        objetivosModel.arbolObjetivos.mediosDirectos = [];
    }

    if(!Array.isArray(objetivosModel.arbolObjetivos.mediosIndirectos)){
        objetivosModel.arbolObjetivos.mediosIndirectos = [];
    }

    if(!Array.isArray(objetivosModel.arbolObjetivos.finesDirectos)){
        objetivosModel.arbolObjetivos.finesDirectos = [];
    }

    if(!Array.isArray(objetivosModel.arbolObjetivos.finesIndirectos)){
        objetivosModel.arbolObjetivos.finesIndirectos = [];
    }

}

// =====================================
// CARGAR DATOS
// =====================================

function cargarDatosObjetivos(){

    asegurarModeloObjetivos();

    const ao =
    objetivosModel.arbolObjetivos || {};

    document.getElementById("objetivoGeneral").value =
    ao.objetivoGeneral ||
    objetivosModel.cadenaValor?.objetivoGeneral ||
    "";

    pintarListaObjetivos(
        "mediosDirectosList",
        ao.mediosDirectos || []
    );

    pintarListaObjetivos(
        "mediosIndirectosList",
        ao.mediosIndirectos || []
    );

    pintarListaObjetivos(
        "finesDirectosList",
        ao.finesDirectos || []
    );

    pintarListaObjetivos(
        "finesIndirectosList",
        ao.finesIndirectos || []
    );

    actualizarVistaObjetivos();

}

// =====================================
// EVENTOS
// =====================================

function bindEventosObjetivos(){

    document.getElementById("btnGenerarDesdeProblemas").onclick =
    generarDesdeProblemas;

    document.getElementById("btnAddMedioDirecto").onclick =
    () => agregarObjetivos("mediosDirectos", "medioDirectoInput");

    document.getElementById("btnAddMedioIndirecto").onclick =
    () => agregarObjetivos("mediosIndirectos", "medioIndirectoInput");

    document.getElementById("btnAddFinDirecto").onclick =
    () => agregarObjetivos("finesDirectos", "finDirectoInput");

    document.getElementById("btnAddFinIndirecto").onclick =
    () => agregarObjetivos("finesIndirectos", "finIndirectoInput");

    document.getElementById("btnGuardarObjetivosTop").onclick =
    guardarObjetivos;

    document.getElementById("formArbolObjetivos").addEventListener("submit", (e) => {

        e.preventDefault();

        guardarObjetivos();

    });

    document.getElementById("btnEnviarCadenaValor").onclick =
    () => {

        guardarObjetivos();

        window.location.href =
        `cadena-valor.html?projectId=${encodeURIComponent(objetivosProjectId)}`;

    };

}

// =====================================
// GENERAR DESDE PROBLEMAS
// =====================================

function generarDesdeProblemas(){

    asegurarModeloObjetivos();

    const ap =
    objetivosModel.arbolProblemas || {};

    const problema =
    ap.problemaCentral ||
    objetivosModel.diagnostico?.problemaCentral ||
    "";

    if(!problema){
        alert("Primero debe diligenciar el problema central en Diagnóstico o Árbol de Problemas.");
        return;
    }

    let propuesta = null;

    if(window.MotorCadenaValor && typeof MotorCadenaValor.generarArbolObjetivos === "function"){

        propuesta =
        MotorCadenaValor.generarArbolObjetivos({
            problemaCentral:
            problema,

            causasDirectas:
            ap.causasDirectas || [],

            causasIndirectas:
            ap.causasIndirectas || [],

            efectosDirectos:
            ap.efectosDirectos || [],

            efectosIndirectos:
            ap.efectosIndirectos || []
        });

    }else{

        propuesta =
        generarDesdeProblemasBasico(ap, problema);

    }

    aplicarPropuestaObjetivos(propuesta);

    alert("Se generó una propuesta inicial. Revísela y ajústela antes de guardar.");

}

function generarDesdeProblemasBasico(ap, problema){

    return {
        objetivoGeneral:
        transformarProblemaEnObjetivo(problema),

        mediosDirectos:
        (ap.causasDirectas || []).map(transformarTextoNegativoAPositivo),

        mediosIndirectos:
        (ap.causasIndirectas || []).map(transformarTextoNegativoAPositivo),

        finesDirectos:
        (ap.efectosDirectos || []).map(transformarTextoNegativoAPositivo),

        finesIndirectos:
        (ap.efectosIndirectos || []).map(transformarTextoNegativoAPositivo)
    };

}

function aplicarPropuestaObjetivos(propuesta){

    if(!propuesta){
        return;
    }

    document.getElementById("objetivoGeneral").value =
    propuesta.objetivoGeneral || "";

    objetivosModel.arbolObjetivos.objetivoGeneral =
    propuesta.objetivoGeneral || "";

    objetivosModel.arbolObjetivos.mediosDirectos =
    fusionarListas(
        objetivosModel.arbolObjetivos.mediosDirectos,
        propuesta.mediosDirectos
    );

    objetivosModel.arbolObjetivos.mediosIndirectos =
    fusionarListas(
        objetivosModel.arbolObjetivos.mediosIndirectos,
        propuesta.mediosIndirectos
    );

    objetivosModel.arbolObjetivos.finesDirectos =
    fusionarListas(
        objetivosModel.arbolObjetivos.finesDirectos,
        propuesta.finesDirectos
    );

    objetivosModel.arbolObjetivos.finesIndirectos =
    fusionarListas(
        objetivosModel.arbolObjetivos.finesIndirectos,
        propuesta.finesIndirectos
    );

    cargarDatosObjetivos();

}

function fusionarListas(actual = [], propuesta = []){

    return Array.from(
        new Set(
            [
                ...(actual || []),
                ...(propuesta || [])
            ]
            .map(x => String(x || "").trim())
            .filter(Boolean)
        )
    );

}

// =====================================
// TRANSFORMADORES BÁSICOS
// =====================================

function transformarProblemaEnObjetivo(texto){

    if(window.MotorCadenaValor && typeof MotorCadenaValor.transformarProblemaEnObjetivo === "function"){
        return MotorCadenaValor.transformarProblemaEnObjetivo(texto);
    }

    let t =
    String(texto || "").trim();

    const reglas =
    [
        ["Insuficiente", "Mejorar el"],
        ["insuficiente", "mejorar el"],
        ["Deficiente", "Mejorar el"],
        ["deficiente", "mejorar el"],
        ["Baja", "Aumentar la"],
        ["baja", "aumentar la"],
        ["Bajo", "Aumentar el"],
        ["bajo", "aumentar el"],
        ["Limitado", "Ampliar el"],
        ["limitado", "ampliar el"],
        ["Limitada", "Ampliar la"],
        ["limitada", "ampliar la"],
        ["Inadecuado", "Adecuar el"],
        ["inadecuado", "adecuar el"],
        ["Inadecuada", "Adecuar la"],
        ["inadecuada", "adecuar la"],
        ["Deterioro", "Mejorar"],
        ["deterioro", "mejorar"]
    ];

    for(const [a,b] of reglas){

        if(t.startsWith(a)){
            t =
            t.replace(a,b);
            return limpiarObjetivo(t);
        }

    }

    return limpiarObjetivo(
        "Mejorar las condiciones relacionadas con " + t
    );

}

function transformarTextoNegativoAPositivo(texto){

    if(window.MotorCadenaValor && typeof MotorCadenaValor.transformarNegativoAPositivo === "function"){
        return MotorCadenaValor.transformarNegativoAPositivo(texto);
    }

    let t =
    String(texto || "").trim();

    const reglas =
    [
        ["Falta de", "Disponibilidad de"],
        ["falta de", "disponibilidad de"],
        ["Carencia de", "Disponibilidad de"],
        ["carencia de", "disponibilidad de"],
        ["Ausencia de", "Existencia de"],
        ["ausencia de", "existencia de"],
        ["Insuficiente", "Suficiente"],
        ["insuficiente", "suficiente"],
        ["Deficiente", "Adecuado"],
        ["deficiente", "adecuado"],
        ["Deterioro de", "Mejoramiento de"],
        ["deterioro de", "mejoramiento de"],
        ["Baja", "Alta"],
        ["baja", "alta"],
        ["Bajo", "Alto"],
        ["bajo", "alto"],
        ["Limitado", "Ampliado"],
        ["limitado", "ampliado"],
        ["Limitada", "Ampliada"],
        ["limitada", "ampliada"]
    ];

    for(const [a,b] of reglas){

        if(t.startsWith(a)){
            return t.replace(a,b);
        }

    }

    return "Mejoramiento de " + t;

}

function limpiarObjetivo(texto){

    let t =
    String(texto || "").trim();

    if(!t){
        return "";
    }

    t =
    t.replace(/\s+/g, " ");

    return t;

}

// =====================================
// AGREGAR ELEMENTOS
// =====================================

function agregarObjetivos(prop, inputId){

    asegurarModeloObjetivos();

    const input =
    document.getElementById(inputId);

    const texto =
    String(input.value || "").trim();

    if(!texto){
        return;
    }

    if(!Array.isArray(objetivosModel.arbolObjetivos[prop])){
        objetivosModel.arbolObjetivos[prop] = [];
    }

    objetivosModel.arbolObjetivos[prop].push(texto);

    input.value =
    "";

    refrescarListaObjetivos(prop);

    actualizarVistaObjetivos();

}

function refrescarListaObjetivos(prop){

    const mapa =
    {
        mediosDirectos:
        "mediosDirectosList",

        mediosIndirectos:
        "mediosIndirectosList",

        finesDirectos:
        "finesDirectosList",

        finesIndirectos:
        "finesIndirectosList"
    };

    pintarListaObjetivos(
        mapa[prop],
        objetivosModel.arbolObjetivos[prop]
    );

}

// =====================================
// PINTAR LISTAS
// =====================================

function pintarListaObjetivos(id, data){

    const cont =
    document.getElementById(id);

    if(!cont){
        return;
    }

    cont.innerHTML =
    "";

    (data || []).forEach((texto, index) => {

        const div =
        document.createElement("div");

        div.className =
        "item";

        div.style.marginBottom =
        "8px";

        div.innerHTML =
        `
        <div class="row space">
          <div>${escapeHtml(texto)}</div>
          <button class="btn danger" type="button">Eliminar</button>
        </div>
        `;

        div.querySelector("button").onclick =
        () => {

            data.splice(index, 1);

            pintarListaObjetivos(id, data);

            actualizarVistaObjetivos();

        };

        cont.appendChild(div);

    });

}

// =====================================
// VISTA
// =====================================

function actualizarVistaObjetivos(){

    const vista =
    document.getElementById("vistaArbolObjetivos");

    if(!vista){
        return;
    }

    asegurarModeloObjetivos();

    const ao =
    objetivosModel.arbolObjetivos;

    const objetivo =
    document.getElementById("objetivoGeneral").value || "";

    vista.innerHTML =
    `
    <div class="item">
      <h3>Fines</h3>
      <ul>
        ${
            (ao.finesIndirectos || [])
            .concat(ao.finesDirectos || [])
            .map(x => `<li>${escapeHtml(x)}</li>`)
            .join("") || "<li>Sin fines registrados.</li>"
        }
      </ul>

      <hr>

      <h3>Objetivo General</h3>
      <p><strong>${escapeHtml(objetivo || "Sin objetivo general.")}</strong></p>

      <hr>

      <h3>Medios</h3>
      <ul>
        ${
            (ao.mediosDirectos || [])
            .concat(ao.mediosIndirectos || [])
            .map(x => `<li>${escapeHtml(x)}</li>`)
            .join("") || "<li>Sin medios registrados.</li>"
        }
      </ul>
    </div>
    `;

}

// =====================================
// GUARDAR
// =====================================

function guardarObjetivos(){

    asegurarModeloObjetivos();

    const objetivo =
    document.getElementById("objetivoGeneral").value.trim();

    objetivosModel.arbolObjetivos.objetivoGeneral =
    objetivo;

    MGA.updateModel(
        objetivosProjectId,
        {
            arbolObjetivos:
            objetivosModel.arbolObjetivos,

            cadenaValor: {
                objetivoGeneral:
                objetivo
            },

            documentosMGA: {
                objetivoGeneral:
                objetivo
            },

            checklist: {
                objetivosConsistentes:
                objetivo.length > 0,

                arbolObjetivosCompleto:
                objetivo.length > 0 &&
                (objetivosModel.arbolObjetivos.mediosDirectos || []).length > 0 &&
                (objetivosModel.arbolObjetivos.finesDirectos || []).length > 0
            }
        }
    );

    objetivosProject =
    StorageAPI.getProjectById(objetivosProjectId);

    objetivosModel =
    MGA.getModel(objetivosProject);

    asegurarModeloObjetivos();

    actualizarVistaObjetivos();

    alert("Árbol de objetivos guardado correctamente.");

}

// =====================================
// ESCAPE HTML
// =====================================

function escapeHtml(value){

    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
