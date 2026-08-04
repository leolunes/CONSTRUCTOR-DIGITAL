// =====================================
// ARBOL-PROBLEMAS.JS - CONSTRUCTOR MGA PRO
// =====================================

let projectId="";
let project=null;
let model=null;

document.addEventListener("DOMContentLoaded",()=>{

    projectId=MGA.getProjectIdFromUrl();
    project=MGA.getProject(projectId);
    if(!project) return;

    model=MGA.getModel(project);

    configurarLinks();
    cargarDatos();
    bindEventos();

});

function configurarLinks(){

    const id=encodeURIComponent(projectId);

    const rutas={
        btnVolverProyecto:`proyecto-detalle.html?projectId=${id}`,
        btnProyecto:`proyecto-detalle.html?projectId=${id}`,
        btnDiagnostico:`diagnostico.html?projectId=${id}`,
        btnArbolObjetivos:`arbol-objetivos.html?projectId=${id}`,
        btnCadenaValor:`cadena-valor.html?projectId=${id}`
    };

    Object.entries(rutas).forEach(([k,v])=>{
        const e=document.getElementById(k);
        if(e)e.href=v;
    });

    const s=document.getElementById("arbolSub");
    if(s){
        s.textContent=(project.name||"Proyecto")+" · Árbol de Problemas";
    }
}

function cargarDatos(){

    const ap=model.arbolProblemas||{};

    document.getElementById("problemaCentral").value=ap.problemaCentral||model.diagnostico.problemaCentral||"";

    pintarLista("causasDirectasList",ap.causasDirectas||[]);
    pintarLista("causasIndirectasList",ap.causasIndirectas||[]);
    pintarLista("efectosDirectosList",ap.efectosDirectos||[]);
    pintarLista("efectosIndirectosList",ap.efectosIndirectos||[]);

    actualizarVista();
}

function bindEventos(){

    document.getElementById("btnAddCausaDirecta").onclick=()=>agregar("causasDirectas","causaDirectaInput");
    document.getElementById("btnAddCausaIndirecta").onclick=()=>agregar("causasIndirectas","causaIndirectaInput");
    document.getElementById("btnAddEfectoDirecto").onclick=()=>agregar("efectosDirectos","efectoDirectoInput");
    document.getElementById("btnAddEfectoIndirecto").onclick=()=>agregar("efectosIndirectos","efectoIndirectoInput");

    document.getElementById("btnGuardarArbolTop").onclick=guardar;

    document.getElementById("formArbolProblemas").addEventListener("submit",(e)=>{
        e.preventDefault();
        guardar();
    });

    document.getElementById("btnSugerirObjetivos").onclick=()=>{
        guardar();
        alert("La información quedó lista para construir el Árbol de Objetivos.");
    };

}

function agregar(prop,inputId){

    const inp=document.getElementById(inputId);
    const txt=(inp.value||"").trim();
    if(!txt) return;

    if(!Array.isArray(model.arbolProblemas[prop])){
        model.arbolProblemas[prop]=[];
    }

    model.arbolProblemas[prop].push(txt);
    inp.value="";

    refrescar(prop);
    actualizarVista();
}

function refrescar(prop){

    const mapa={
        causasDirectas:"causasDirectasList",
        causasIndirectas:"causasIndirectasList",
        efectosDirectos:"efectosDirectosList",
        efectosIndirectos:"efectosIndirectosList"
    };

    pintarLista(mapa[prop],model.arbolProblemas[prop]);

}

function pintarLista(id,data){

    const c=document.getElementById(id);
    c.innerHTML="";

    data.forEach((t,i)=>{
        const d=document.createElement("div");
        d.className="item";
        d.style.marginBottom="8px";
        d.innerHTML=`<div class="row space">
            <div>${t}</div>
            <button class="btn danger" type="button">Eliminar</button>
        </div>`;
        d.querySelector("button").onclick=()=>{
            data.splice(i,1);
            pintarLista(id,data);
            actualizarVista();
        };
        c.appendChild(d);
    });

}

function actualizarVista(){

    const v=document.getElementById("vistaArbolProblemas");
    const a=model.arbolProblemas;

    v.innerHTML=`
    <div class="item">
      <h3>Efectos</h3>
      <ul>${(a.efectosIndirectos||[]).concat(a.efectosDirectos||[]).map(x=>`<li>${x}</li>`).join("")}</ul>
      <hr>
      <h3>Problema Central</h3>
      <p><strong>${document.getElementById("problemaCentral").value||""}</strong></p>
      <hr>
      <h3>Causas</h3>
      <ul>${(a.causasDirectas||[]).concat(a.causasIndirectas||[]).map(x=>`<li>${x}</li>`).join("")}</ul>
    </div>`;
}

function guardar(){

    model.arbolProblemas.problemaCentral=document.getElementById("problemaCentral").value.trim();

    MGA.updateModel(projectId,{
        arbolProblemas:model.arbolProblemas,
        diagnostico:{
            problemaCentral:model.arbolProblemas.problemaCentral
        }
    });

    alert("Árbol de problemas guardado correctamente.");
}
