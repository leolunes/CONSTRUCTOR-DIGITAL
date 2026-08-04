// =====================================
// CRONOGRAMA.JS - CONSTRUCTOR MGA PRO
// =====================================

let cronProjectId="";
let cronProject=null;
let cronModel=null;

document.addEventListener("DOMContentLoaded",()=>{

    cronProjectId=MGA.getProjectIdFromUrl();
    cronProject=MGA.getProject(cronProjectId);

    if(!cronProject) return;

    cronModel=MGA.getModel(cronProject);

    configurarLinks();
    bindEventos();
    cargarCronograma();

});

function configurarLinks(){

    const id=encodeURIComponent(cronProjectId);

    const rutas={
        btnVolverProyecto:`proyecto-detalle.html?projectId=${id}`,
        btnProyecto:`proyecto-detalle.html?projectId=${id}`,
        btnCadenaValor:`cadena-valor.html?projectId=${id}`,
        btnIndicadores:`indicadores.html?projectId=${id}`,
        btnRiesgos:`riesgos.html?projectId=${id}`
    };

    Object.entries(rutas).forEach(([k,v])=>{
        const e=document.getElementById(k);
        if(e)e.href=v;
    });

    const sub=document.getElementById("cronogramaSub");
    if(sub){
        sub.textContent=(cronProject.name||"Proyecto")+" · Cronograma";
    }

    document.getElementById("fechaInicio").value=
        cronModel.cronograma.fechaInicio||"";

    document.getElementById("fechaFin").value=
        cronModel.cronograma.fechaFin||"";

}

function bindEventos(){

    document.getElementById("btnGenerarCronograma").onclick=generarDesdeCadena;
    document.getElementById("btnGuardarCronograma").onclick=guardar;
    document.getElementById("btnGuardarCronogramaTop").onclick=guardar;

}

function generarDesdeCadena(){

    const actividades=cronModel.cadenaValor.actividades||[];

    if(!actividades.length){
        alert("Primero registre actividades en la Cadena de Valor.");
        return;
    }

    cronModel.cronograma.actividades=[];

    let mes=1;

    actividades.forEach(a=>{

        const item=MGA.newCronogramaActividad();

        item.actividadId=a.id;
        item.nombre=a.nombre;
        item.mesInicio=mes;
        item.mesFin=mes+Math.max(0,(a.duracionMeses||1)-1);
        item.valorProgramado=a.valor||0;

        cronModel.cronograma.actividades.push(item);

        mes=item.mesFin+1;

    });

    cargarCronograma();

    alert("Cronograma generado automáticamente.");

}

function cargarCronograma(){

    const body=document.getElementById("cronogramaBody");

    const acts=cronModel.cronograma.actividades||[];

    if(!acts.length){

        body.innerHTML=
        `<tr>
            <td colspan="7" class="muted small">
                No existen actividades programadas.
            </td>
        </tr>`;

        actualizarResumen();
        return;
    }

    body.innerHTML=acts.map((a,index)=>{

        const prod=buscarProductoActividad(a.actividadId);

        return `
        <tr>

        <td>${esc(a.nombre)}</td>

        <td>${esc(prod)}</td>

        <td>
            <input type="number"
                min="1"
                value="${a.mesInicio}"
                onchange="cronActualizar(${index},'mesInicio',this.value)">
        </td>

        <td>
            <input type="number"
                min="1"
                value="${a.mesFin}"
                onchange="cronActualizar(${index},'mesFin',this.value)">
        </td>

        <td>${Number(a.mesFin)-Number(a.mesInicio)+1}</td>

        <td>
            <input type="number"
                value="${a.valorProgramado}"
                onchange="cronActualizar(${index},'valorProgramado',this.value)">
        </td>

        <td>
            <select onchange="cronActualizar(${index},'estado',this.value)">
                ${estadoOption(a.estado,"Pendiente")}
                ${estadoOption(a.estado,"En ejecución")}
                ${estadoOption(a.estado,"Finalizada")}
            </select>
        </td>

        </tr>
        `;

    }).join("");

    actualizarResumen();

}

function estadoOption(actual,val){
    return `<option ${actual===val?"selected":""}>${val}</option>`;
}

window.cronActualizar=function(index,campo,valor){

    const item=cronModel.cronograma.actividades[index];

    if(!item) return;

    if(campo==="mesInicio"||campo==="mesFin"||campo==="valorProgramado"){
        item[campo]=Number(valor||0);
    }else{
        item[campo]=valor;
    }

    actualizarResumen();

}

function actualizarResumen(){

    const acts=cronModel.cronograma.actividades||[];

    const total=acts.reduce((s,a)=>s+Number(a.valorProgramado||0),0);

    const meses=acts.length
        ?Math.max(...acts.map(a=>Number(a.mesFin||0)))
        :0;

    document.getElementById("resumenCronograma").innerHTML=
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
            <h2>${acts.filter(a=>a.estado==="Finalizada").length}/${acts.length} finalizadas</h2>
        </div>

    </div>
    `;

}

function guardar(){

    cronModel.cronograma.fechaInicio=
        document.getElementById("fechaInicio").value;

    cronModel.cronograma.fechaFin=
        document.getElementById("fechaFin").value;

    MGA.updateModel(cronProjectId,{
        cronograma:cronModel.cronograma,
        checklist:{
            cronogramaCompleto:
            (cronModel.cronograma.actividades||[]).length>0
        }
    });

    alert("Cronograma guardado correctamente.");

}

function buscarProductoActividad(id){

    const act=(cronModel.cadenaValor.actividades||[])
        .find(a=>a.id===id);

    if(!act) return "";

    const prod=(cronModel.cadenaValor.productos||[])
        .find(p=>p.id===act.productoId);

    return prod?prod.nombre:"";

}

function fmt(v){

    try{
        return new Intl.NumberFormat("es-CO",{
            style:"currency",
            currency:"COP",
            maximumFractionDigits:0
        }).format(v);
    }catch{
        return "$ "+Number(v||0).toLocaleString("es-CO");
    }

}

function esc(v){
    return String(v||"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}
