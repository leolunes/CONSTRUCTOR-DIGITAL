// =====================================
// ARBOL-OBJETIVOS.JS - CONSTRUCTOR MGA PRO
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
// CARGAR DATOS
// =====================================

function cargarDatosObjetivos(){

    const ao =
    objetivosModel.arbolObjetivos || {};

    document.getElementById("objetivoGeneral").value =
    ao.objetivoGeneral || objetivosModel.cadenaValor?.objetivoGeneral || "";

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

    const objetivo =
    transformarProblemaEnObjetivo(problema);

    document.getElementById("objetivoGeneral").value =
    objetivo;

    objetivosModel.arbolObjetivos.mediosDirectos =
    (ap.causasDirectas || []).map(transformarTextoNegativoAPositivo);

    objetivosModel.arbolObjetivos.mediosIndirectos =
    (ap.causasIndirectas || []).map(transformarTextoNegativoAPositivo);

    objetivosModel.arbolObjetivos.finesDirectos =
    (ap.efectosDirectos || []).map(transformarTextoNegativoAPositivo);

    objetivosModel.arbolObjetivos.finesIndirectos =
    (ap.efectosIndirectos || []).map(transformarTextoNegativoAPositivo);

    cargarDatosObjetivos();

    alert("Se generó una propuesta inicial. Revísela y ajústela antes de guardar.");

}

// =====================================
// TRANSFORMADORES BÁSICOS
// =====================================

function transformarProblemaEnObjetivo(texto){

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

    data.forEach((texto, index) => {

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

    const ao =
    objetivosModel.arbolObjetivos;

    const objetivo =
    document.getElementById("objetivoGeneral").value || "";

    vista.innerHTML =
    `
    <div class="item">
      <h3>Fines</h3>
      <ul>
        ${(ao.finesIndirectos || []).concat(ao.finesDirectos || []).map(x => `<li>${escapeHtml(x)}</li>`).join("")}
      </ul>

      <hr>

      <h3>Objetivo General</h3>
      <p><strong>${escapeHtml(objetivo)}</strong></p>

      <hr>

      <h3>Medios</h3>
      <ul>
        ${(ao.mediosDirectos || []).concat(ao.mediosIndirectos || []).map(x => `<li>${escapeHtml(x)}</li>`).join("")}
      </ul>
    </div>
    `;

}

// =====================================
// GUARDAR
// =====================================

function guardarObjetivos(){

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
                objetivo.length > 0
            }
        }
    );

    objetivosProject =
    StorageAPI.getProjectById(objetivosProjectId);

    objetivosModel =
    MGA.getModel(objetivosProject);

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
