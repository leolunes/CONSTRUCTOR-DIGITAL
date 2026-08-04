// =====================================
// ARBOL-PROBLEMAS.JS - CONSTRUCTOR MGA PRO
// Integrado con MotorCadenaValor
// =====================================

let projectId = "";
let project = null;
let model = null;

document.addEventListener("DOMContentLoaded", () => {

    projectId = MGA.getProjectIdFromUrl();

    project = MGA.getProject(projectId);

    if(!project){
        return;
    }

    model = MGA.getModel(project);

    asegurarModeloArbolProblemas();

    configurarLinks();
    cargarDatos();
    bindEventos();

});

// =====================================
// CONFIGURAR LINKS
// =====================================

function configurarLinks(){

    const id = encodeURIComponent(projectId);

    const rutas = {
        btnVolverProyecto: `proyecto-detalle.html?projectId=${id}`,
        btnProyecto: `proyecto-detalle.html?projectId=${id}`,
        btnDiagnostico: `diagnostico.html?projectId=${id}`,
        btnArbolObjetivos: `arbol-objetivos.html?projectId=${id}`,
        btnCadenaValor: `cadena-valor.html?projectId=${id}`
    };

    Object.entries(rutas).forEach(([k, v]) => {

        const e = document.getElementById(k);

        if(e){
            e.href = v;
        }

    });

    const s = document.getElementById("arbolSub");

    if(s){
        s.textContent = (project.name || "Proyecto") + " · Árbol de Problemas";
    }

}

// =====================================
// ASEGURAR MODELO
// =====================================

function asegurarModeloArbolProblemas(){

    if(!model.arbolProblemas){
        model.arbolProblemas = {};
    }

    if(!Array.isArray(model.arbolProblemas.causasDirectas)){
        model.arbolProblemas.causasDirectas = [];
    }

    if(!Array.isArray(model.arbolProblemas.causasIndirectas)){
        model.arbolProblemas.causasIndirectas = [];
    }

    if(!Array.isArray(model.arbolProblemas.efectosDirectos)){
        model.arbolProblemas.efectosDirectos = [];
    }

    if(!Array.isArray(model.arbolProblemas.efectosIndirectos)){
        model.arbolProblemas.efectosIndirectos = [];
    }

}

// =====================================
// CARGAR DATOS
// =====================================

function cargarDatos(){

    asegurarModeloArbolProblemas();

    const ap = model.arbolProblemas || {};

    document.getElementById("problemaCentral").value =
    ap.problemaCentral ||
    model.diagnostico?.problemaCentral ||
    "";

    pintarLista("causasDirectasList", ap.causasDirectas || []);
    pintarLista("causasIndirectasList", ap.causasIndirectas || []);
    pintarLista("efectosDirectosList", ap.efectosDirectos || []);
    pintarLista("efectosIndirectosList", ap.efectosIndirectos || []);

    actualizarVista();

}

// =====================================
// EVENTOS
// =====================================

function bindEventos(){

    document.getElementById("btnAddCausaDirecta").onclick =
    () => agregar("causasDirectas", "causaDirectaInput");

    document.getElementById("btnAddCausaIndirecta").onclick =
    () => agregar("causasIndirectas", "causaIndirectaInput");

    document.getElementById("btnAddEfectoDirecto").onclick =
    () => agregar("efectosDirectos", "efectoDirectoInput");

    document.getElementById("btnAddEfectoIndirecto").onclick =
    () => agregar("efectosIndirectos", "efectoIndirectoInput");

    document.getElementById("btnGuardarArbolTop").onclick =
    guardar;

    document.getElementById("formArbolProblemas").addEventListener("submit", (e) => {

        e.preventDefault();

        guardar();

    });

    const btnSugerir =
    document.getElementById("btnSugerirObjetivos");

    if(btnSugerir){

        btnSugerir.onclick = () => {

            guardar();

            window.location.href =
            `arbol-objetivos.html?projectId=${encodeURIComponent(projectId)}`;

        };

    }

    agregarBotonGenerarConMotor();

}

// =====================================
// BOTÓN ASISTENTE
// =====================================

function agregarBotonGenerarConMotor(){

    const form =
    document.getElementById("formArbolProblemas");

    if(!form){
        return;
    }

    if(document.getElementById("btnGenerarArbolProblemasMotor")){
        return;
    }

    const problema =
    document.getElementById("problemaCentral");

    if(!problema){
        return;
    }

    const row =
    document.createElement("div");

    row.className = "row";

    row.style.marginTop = "10px";
    row.style.gap = "10px";
    row.style.flexWrap = "wrap";

    row.innerHTML = `
        <button
            class="btn primary"
            id="btnGenerarArbolProblemasMotor"
            type="button"
        >
            Generar causas y efectos con asistente
        </button>
    `;

    problema.insertAdjacentElement("afterend", row);

    document.getElementById("btnGenerarArbolProblemasMotor").onclick =
    generarArbolProblemasConMotor;

}

// =====================================
// GENERAR CON MOTOR
// =====================================

function generarArbolProblemasConMotor(){

    if(!window.MotorCadenaValor || typeof MotorCadenaValor.generarArbolProblemas !== "function"){

        alert("MotorCadenaValor no está disponible. Revise que motor-cadena-valor.js esté cargado antes de arbol-problemas.js.");

        return;

    }

    sincronizarProblemaDesdePantalla();

    const propuesta =
    MotorCadenaValor.generarArbolProblemas(model);

    if(!propuesta){
        alert("No se pudo generar el árbol de problemas.");
        return;
    }

    model.arbolProblemas.problemaCentral =
    propuesta.problemaCentral ||
    document.getElementById("problemaCentral").value.trim() ||
    model.diagnostico?.problemaCentral ||
    "";

    model.arbolProblemas.causasDirectas =
    fusionarListas(model.arbolProblemas.causasDirectas, propuesta.causasDirectas);

    model.arbolProblemas.causasIndirectas =
    fusionarListas(model.arbolProblemas.causasIndirectas, propuesta.causasIndirectas);

    model.arbolProblemas.efectosDirectos =
    fusionarListas(model.arbolProblemas.efectosDirectos, propuesta.efectosDirectos);

    model.arbolProblemas.efectosIndirectos =
    fusionarListas(model.arbolProblemas.efectosIndirectos, propuesta.efectosIndirectos);

    document.getElementById("problemaCentral").value =
    model.arbolProblemas.problemaCentral;

    refrescarTodasLasListas();

    actualizarVista();

    alert("Causas y efectos generados. Revise, ajuste y guarde.");

}

function sincronizarProblemaDesdePantalla(){

    asegurarModeloArbolProblemas();

    const problema =
    document.getElementById("problemaCentral").value.trim();

    if(problema){
        model.arbolProblemas.problemaCentral = problema;
    }

}

function fusionarListas(actual = [], propuesta = []){

    const arr =
    [
        ...(actual || []),
        ...(propuesta || [])
    ]
    .map(x => String(x || "").trim())
    .filter(Boolean);

    return Array.from(new Set(arr));

}

// =====================================
// AGREGAR ELEMENTOS
// =====================================

function agregar(prop, inputId){

    asegurarModeloArbolProblemas();

    const inp =
    document.getElementById(inputId);

    const txt =
    (inp.value || "").trim();

    if(!txt){
        return;
    }

    if(!Array.isArray(model.arbolProblemas[prop])){
        model.arbolProblemas[prop] = [];
    }

    model.arbolProblemas[prop].push(txt);

    inp.value = "";

    refrescar(prop);

    actualizarVista();

}

function refrescar(prop){

    const mapa = {
        causasDirectas: "causasDirectasList",
        causasIndirectas: "causasIndirectasList",
        efectosDirectos: "efectosDirectosList",
        efectosIndirectos: "efectosIndirectosList"
    };

    pintarLista(mapa[prop], model.arbolProblemas[prop]);

}

function refrescarTodasLasListas(){

    pintarLista("causasDirectasList", model.arbolProblemas.causasDirectas || []);
    pintarLista("causasIndirectasList", model.arbolProblemas.causasIndirectas || []);
    pintarLista("efectosDirectosList", model.arbolProblemas.efectosDirectos || []);
    pintarLista("efectosIndirectosList", model.arbolProblemas.efectosIndirectos || []);

}

// =====================================
// PINTAR LISTAS
// =====================================

function pintarLista(id, data){

    const c =
    document.getElementById(id);

    if(!c){
        return;
    }

    c.innerHTML = "";

    (data || []).forEach((t, i) => {

        const d =
        document.createElement("div");

        d.className = "item";
        d.style.marginBottom = "8px";

        d.innerHTML = `
            <div class="row space">
                <div>${escapeHtml(t)}</div>
                <button class="btn danger" type="button">Eliminar</button>
            </div>
        `;

        d.querySelector("button").onclick = () => {

            data.splice(i, 1);

            pintarLista(id, data);

            actualizarVista();

        };

        c.appendChild(d);

    });

}

// =====================================
// VISTA RESUMIDA
// =====================================

function actualizarVista(){

    const v =
    document.getElementById("vistaArbolProblemas");

    if(!v){
        return;
    }

    asegurarModeloArbolProblemas();

    const a =
    model.arbolProblemas;

    const problema =
    document.getElementById("problemaCentral").value || "";

    v.innerHTML = `
        <div class="item">
          <h3>Efectos</h3>
          <ul>
            ${
                (a.efectosIndirectos || [])
                .concat(a.efectosDirectos || [])
                .map(x => `<li>${escapeHtml(x)}</li>`)
                .join("") || "<li>Sin efectos registrados.</li>"
            }
          </ul>

          <hr>

          <h3>Problema Central</h3>
          <p><strong>${escapeHtml(problema || "Sin problema central.")}</strong></p>

          <hr>

          <h3>Causas</h3>
          <ul>
            ${
                (a.causasDirectas || [])
                .concat(a.causasIndirectas || [])
                .map(x => `<li>${escapeHtml(x)}</li>`)
                .join("") || "<li>Sin causas registradas.</li>"
            }
          </ul>
        </div>
    `;

}

// =====================================
// GUARDAR
// =====================================

function guardar(){

    asegurarModeloArbolProblemas();

    model.arbolProblemas.problemaCentral =
    document.getElementById("problemaCentral").value.trim();

    MGA.updateModel(projectId, {
        arbolProblemas: model.arbolProblemas,
        diagnostico: {
            problemaCentral: model.arbolProblemas.problemaCentral
        },
        checklist: {
            arbolProblemasCompleto:
            !!model.arbolProblemas.problemaCentral &&
            (model.arbolProblemas.causasDirectas || []).length > 0 &&
            (model.arbolProblemas.efectosDirectos || []).length > 0
        }
    });

    project =
    StorageAPI.getProjectById(projectId);

    model =
    MGA.getModel(project);

    asegurarModeloArbolProblemas();

    alert("Árbol de problemas guardado correctamente.");

}

// =====================================
// HELPERS
// =====================================

function escapeHtml(value){

    return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}
