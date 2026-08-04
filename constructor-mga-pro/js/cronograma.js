// =====================================
// CRONOGRAMA.JS - CONSTRUCTOR MGA PRO
// Integrado con Cadena de Valor
// =====================================

let cronProjectId = "";
let cronProject = null;
let cronModel = null;

document.addEventListener("DOMContentLoaded", () => {

    cronProjectId =
    MGA.getProjectIdFromUrl();

    cronProject =
    MGA.getProject(cronProjectId);

    if(!cronProject){
        return;
    }

    cronModel =
    MGA.getModel(cronProject);

    asegurarModeloCronograma();

    configurarLinks();
    bindEventos();
    cargarCronograma();

});

// =====================================
// ASEGURAR MODELO
// =====================================

function asegurarModeloCronograma(){

    if(!cronModel.cronograma){
        cronModel.cronograma = {};
    }

    if(!Array.isArray(cronModel.cronograma.actividades)){
        cronModel.cronograma.actividades = [];
    }

    if(!cronModel.cadenaValor){
        cronModel.cadenaValor = {};
    }

    if(!Array.isArray(cronModel.cadenaValor.productos)){
        cronModel.cadenaValor.productos = [];
    }

    if(!Array.isArray(cronModel.cadenaValor.actividades)){
        cronModel.cadenaValor.actividades = [];
    }

}

// =====================================
// LINKS
// =====================================

function configurarLinks(){

    const id =
    encodeURIComponent(cronProjectId);

    const rutas =
    {
        btnVolverProyecto:
        `proyecto-detalle.html?projectId=${id}`,

        btnProyecto:
        `proyecto-detalle.html?projectId=${id}`,

        btnCadenaValor:
        `cadena-valor.html?projectId=${id}`,

        btnIndicadores:
        `indicadores.html?projectId=${id}`,

        btnRiesgos:
        `riesgos.html?projectId=${id}`
    };

    Object.entries(rutas).forEach(([k, v]) => {

        const e =
        document.getElementById(k);

        if(e){
            e.href = v;
        }

    });

    const sub =
    document.getElementById("cronogramaSub");

    if(sub){
        sub.textContent =
        (cronProject.name || "Proyecto") + " · Cronograma";
    }

    const fechaInicio =
    document.getElementById("fechaInicio");

    if(fechaInicio){
        fechaInicio.value =
        cronModel.cronograma.fechaInicio || "";
    }

    const fechaFin =
    document.getElementById("fechaFin");

    if(fechaFin){
        fechaFin.value =
        cronModel.cronograma.fechaFin || "";
    }

}

// =====================================
// EVENTOS
// =====================================

function bindEventos(){

    const btnGenerar =
    document.getElementById("btnGenerarCronograma");

    if(btnGenerar){
        btnGenerar.onclick =
        generarDesdeCadena;
    }

    const btnGuardar =
    document.getElementById("btnGuardarCronograma");

    if(btnGuardar){
        btnGuardar.onclick =
        guardar;
    }

    const btnGuardarTop =
    document.getElementById("btnGuardarCronogramaTop");

    if(btnGuardarTop){
        btnGuardarTop.onclick =
        guardar;
    }

}

// =====================================
// GENERAR DESDE CADENA
// =====================================

function generarDesdeCadena(){

    asegurarModeloCronograma();

    const actividades =
    cronModel.cadenaValor.actividades || [];

    if(!actividades.length){
        alert("Primero registre actividades en la Cadena de Valor.");
        return;
    }

    const existeCronograma =
    (cronModel.cronograma.actividades || []).length > 0;

    if(existeCronograma){

        const reemplazar =
        confirm("Ya existe un cronograma generado. ¿Desea reemplazarlo con las actividades actuales de la Cadena de Valor?");

        if(!reemplazar){
            return;
        }

    }

    cronModel.cronograma.actividades =
    [];

    let mes =
    1;

    actividades.forEach(a => {

        const duracion =
        Math.max(
            1,
            Number(a.duracionMeses || 1)
        );

        const item =
        crearActividadCronograma();

        item.actividadId =
        a.id;

        item.nombre =
        a.nombre;

        item.mesInicio =
        mes;

        item.mesFin =
        mes + duracion - 1;

        item.valorProgramado =
        Number(a.valor || 0);

        item.estado =
        item.estado || "Pendiente";

        item.productoId =
        a.productoId || "";

        cronModel.cronograma.actividades.push(item);

        mes =
        item.mesFin + 1;

    });

    sugerirFechasProyecto();

    cargarCronograma();

    alert("Cronograma generado automáticamente desde la Cadena de Valor.");

}

function crearActividadCronograma(){

    if(window.MGA && typeof MGA.newCronogramaActividad === "function"){
        return MGA.newCronogramaActividad();
    }

    return {
        id:
        generarId("cron"),

        actividadId:
        "",

        nombre:
        "",

        mesInicio:
        1,

        mesFin:
        1,

        valorProgramado:
        0,

        estado:
        "Pendiente"
    };

}

function sugerirFechasProyecto(){

    const inicioInput =
    document.getElementById("fechaInicio");

    const finInput =
    document.getElementById("fechaFin");

    if(!inicioInput || !finInput){
        return;
    }

    if(!inicioInput.value){

        const hoy =
        new Date();

        inicioInput.value =
        hoy.toISOString().slice(0, 10);

    }

    if(inicioInput.value && !finInput.value){

        const meses =
        calcularHorizonteMeses();

        const fecha =
        new Date(inicioInput.value);

        fecha.setMonth(
            fecha.getMonth() + Math.max(1, meses)
        );

        finInput.value =
        fecha.toISOString().slice(0, 10);

    }

}

// =====================================
// CARGAR TABLA
// =====================================

function cargarCronograma(){

    asegurarModeloCronograma();

    const body =
    document.getElementById("cronogramaBody");

    if(!body){
        return;
    }

    const acts =
    cronModel.cronograma.actividades || [];

    if(!acts.length){

        body.innerHTML =
        `<tr>
            <td colspan="7" class="muted small">
                No existen actividades programadas.
            </td>
        </tr>`;

        actualizarResumen();

        return;

    }

    body.innerHTML =
    acts.map((a, index) => {

        const prod =
        buscarProductoActividad(a.actividadId);

        return `
        <tr>

        <td>${esc(a.nombre)}</td>

        <td>${esc(prod)}</td>

        <td>
            <input type="number"
                min="1"
                value="${Number(a.mesInicio || 1)}"
                onchange="cronActualizar(${index},'mesInicio',this.value)">
        </td>

        <td>
            <input type="number"
                min="1"
                value="${Number(a.mesFin || 1)}"
                onchange="cronActualizar(${index},'mesFin',this.value)">
        </td>

        <td>${calcularDuracion(a)}</td>

        <td>
            <input type="number"
                value="${Number(a.valorProgramado || 0)}"
                onchange="cronActualizar(${index},'valorProgramado',this.value)">
        </td>

        <td>
            <select onchange="cronActualizar(${index},'estado',this.value)">
                ${estadoOption(a.estado, "Pendiente")}
                ${estadoOption(a.estado, "En ejecución")}
                ${estadoOption(a.estado, "Finalizada")}
            </select>
        </td>

        </tr>
        `;

    }).join("");

    actualizarResumen();

}

function estadoOption(actual, val){

    return `<option ${actual === val ? "selected" : ""}>${val}</option>`;

}

// =====================================
// ACTUALIZAR EN LÍNEA
// =====================================

window.cronActualizar = function(index, campo, valor){

    const item =
    cronModel.cronograma.actividades[index];

    if(!item){
        return;
    }

    if(campo === "mesInicio" || campo === "mesFin" || campo === "valorProgramado"){

        item[campo] =
        Number(valor || 0);

        if(campo === "mesInicio" && item.mesFin < item.mesInicio){
            item.mesFin = item.mesInicio;
        }

        if(campo === "mesFin" && item.mesFin < item.mesInicio){
            item.mesInicio = item.mesFin;
        }

    }else{

        item[campo] =
        valor;

    }

    actualizarResumen();

};

// =====================================
// RESUMEN
// =====================================

function actualizarResumen(){

    const cont =
    document.getElementById("resumenCronograma");

    if(!cont){
        return;
    }

    const acts =
    cronModel.cronograma.actividades || [];

    const total =
    acts.reduce((s, a) => s + Number(a.valorProgramado || 0), 0);

    const meses =
    calcularHorizonteMeses();

    const finalizadas =
    acts.filter(a => a.estado === "Finalizada").length;

    const enEjecucion =
    acts.filter(a => a.estado === "En ejecución").length;

    const pendientes =
    acts.filter(a => !a.estado || a.estado === "Pendiente").length;

    cont.innerHTML =
    `
    <div class="grid two">

        <div class="item">
            <div class="name">Actividades programadas</div>
            <h2>${acts.length}</h2>
        </div>

        <div class="item">
            <div class="name">Horizonte del cronograma</div>
            <h2>${meses} meses</h2>
        </div>

        <div class="item">
            <div class="name">Valor programado</div>
            <h2>${fmt(total)}</h2>
        </div>

        <div class="item">
            <div class="name">Estado</div>
            <h2>${finalizadas}/${acts.length} finalizadas</h2>
            <div class="muted small">
                ${pendientes} pendientes · ${enEjecucion} en ejecución
            </div>
        </div>

    </div>
    `;

}

function calcularHorizonteMeses(){

    const acts =
    cronModel.cronograma.actividades || [];

    return acts.length
        ? Math.max(...acts.map(a => Number(a.mesFin || 0)))
        : 0;

}

function calcularDuracion(a){

    const inicio =
    Number(a.mesInicio || 1);

    const fin =
    Number(a.mesFin || inicio);

    return Math.max(1, fin - inicio + 1);

}

// =====================================
// GUARDAR
// =====================================

function guardar(){

    asegurarModeloCronograma();

    const fechaInicio =
    document.getElementById("fechaInicio");

    const fechaFin =
    document.getElementById("fechaFin");

    cronModel.cronograma.fechaInicio =
    fechaInicio ? fechaInicio.value : "";

    cronModel.cronograma.fechaFin =
    fechaFin ? fechaFin.value : "";

    MGA.updateModel(cronProjectId, {
        cronograma:
        cronModel.cronograma,

        checklist: {
            cronogramaCompleto:
            (cronModel.cronograma.actividades || []).length > 0,

            cronogramaConFechas:
            !!cronModel.cronograma.fechaInicio &&
            !!cronModel.cronograma.fechaFin,

            cronogramaConValores:
            validarCronogramaConValores()
        }
    });

    cronProject =
    StorageAPI.getProjectById(cronProjectId);

    cronModel =
    MGA.getModel(cronProject);

    asegurarModeloCronograma();

    alert("Cronograma guardado correctamente.");

}

function validarCronogramaConValores(){

    const acts =
    cronModel.cronograma.actividades || [];

    if(!acts.length){
        return false;
    }

    return acts.every(a =>
        Number(a.mesInicio || 0) > 0 &&
        Number(a.mesFin || 0) >= Number(a.mesInicio || 0)
    );

}

// =====================================
// BUSCAR PRODUCTO
// =====================================

function buscarProductoActividad(id){

    const act =
    (cronModel.cadenaValor.actividades || [])
    .find(a => a.id === id);

    if(!act){
        return "";
    }

    const prod =
    (cronModel.cadenaValor.productos || [])
    .find(p => p.id === act.productoId);

    return prod
        ? prod.nombre
        : "";

}

// =====================================
// HELPERS
// =====================================

function generarId(prefix){

    if(window.MGA && typeof MGA.uid === "function"){
        return MGA.uid(prefix);
    }

    return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

}

function fmt(v){

    const n =
    Number(v || 0);

    try{

        return new Intl.NumberFormat(
            "es-CO",
            {
                style:
                "currency",

                currency:
                "COP",

                maximumFractionDigits:
                0
            }
        ).format(n);

    }catch(_){

        return "$ " + n.toLocaleString("es-CO");

    }

}

function esc(v){

    return String(v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}
