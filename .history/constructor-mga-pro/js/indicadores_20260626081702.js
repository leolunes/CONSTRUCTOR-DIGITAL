// =====================================
// INDICADORES.JS - CONSTRUCTOR MGA PRO
// =====================================

let indicadoresProjectId="";
let indicadoresProject=null;
let indicadoresModel=null;

document.addEventListener("DOMContentLoaded",()=>{

    indicadoresProjectId=MGA.getProjectIdFromUrl();
    indicadoresProject=MGA.getProject(indicadoresProjectId);

    if(!indicadoresProject){
        return;
    }

    indicadoresModel=MGA.getModel(indicadoresProject);

    configurarLinks();
    bindEventos();
    renderTabla();

});

function configurarLinks(){

    const id=encodeURIComponent(indicadoresProjectId);

    const rutas={
        btnVolverProyecto:`proyecto-detalle.html?projectId=${id}`,
        btnProyecto:`proyecto-detalle.html?projectId=${id}`,
        btnCadenaValor:`cadena-valor.html?projectId=${id}`,
        btnRiesgos:`riesgos.html?projectId=${id}`,
        btnCronograma:`cronograma.html?projectId=${id}`
    };

    Object.entries(rutas).forEach(([k,v])=>{
        const e=document.getElementById(k);
        if(e)e.href=v;
    });

    const s=document.getElementById("indicadoresSub");
    if(s){
        s.textContent=(indicadoresProject.name||"Proyecto")+" · Indicadores";
    }
}

function bindEventos(){

    document.getElementById("formIndicador").addEventListener("submit",(e)=>{
        e.preventDefault();
        agregarIndicador();
    });

    document.getElementById("btnGuardarIndicadoresTop").onclick=guardar;

    document.getElementById("btnSugerirIndicadores").onclick=sugerirDesdeCadena;

}

function agregarIndicador(){

    const tipo=val("tipoIndicador");

    const ind=MGA.newIndicador(tipo);

    ind.nombre=val("nombreIndicador");
    ind.descripcion=val("descripcionIndicador");
    ind.unidadMedida=val("unidadIndicador");
    ind.fuenteVerificacion=val("fuenteIndicador");
    ind.lineaBase=MGA.safeNum(val("lineaBaseIndicador"),0);
    ind.meta=MGA.safeNum(val("metaIndicador"),0);

    if(!ind.nombre){
        alert("Debe escribir el nombre del indicador.");
        return;
    }

    indicadoresModel.indicadores[tipo].push(ind);

    limpiarFormulario();

    renderTabla();

}

function sugerirDesdeCadena(){

    const productos=indicadoresModel.cadenaValor.productos||[];

    if(!productos.length){
        alert("Primero registre productos en la Cadena de Valor.");
        return;
    }

    productos.forEach(p=>{

        const existe=indicadoresModel.indicadores.producto
        .some(i=>i.nombre===p.nombre);

        if(existe) return;

        const ind=MGA.newIndicador("producto");

        ind.nombre=p.nombre;
        ind.descripcion=p.descripcion;
        ind.unidadMedida=p.unidadMedida;
        ind.meta=p.meta;

        indicadoresModel.indicadores.producto.push(ind);

    });

    renderTabla();

    alert("Se generaron indicadores de producto a partir de la Cadena de Valor.");

}

function renderTabla(){

    const body=document.getElementById("indicadoresBody");

    const tipos=[
        "producto",
        "resultado",
        "gestion",
        "impacto"
    ];

    let html="";

    tipos.forEach(tipo=>{

        (indicadoresModel.indicadores[tipo]||[]).forEach((i,index)=>{

            html+=`
            <tr>
              <td>${tipo}</td>
              <td><b>${esc(i.nombre)}</b><br><span class="muted small">${esc(i.descripcion)}</span></td>
              <td>${esc(i.unidadMedida)}</td>
              <td>${i.lineaBase}</td>
              <td>${i.meta}</td>
              <td>${esc(i.fuenteVerificacion)}</td>
              <td>
                <button class="btn danger" onclick="eliminarIndicador('${tipo}',${index})">Eliminar</button>
              </td>
            </tr>
            `;

        });

    });

    if(!html){
        html=`<tr><td colspan="7" class="muted small">No existen indicadores registrados.</td></tr>`;
    }

    body.innerHTML=html;

}

function eliminarIndicador(tipo,index){

    if(!confirm("¿Eliminar indicador?")){
        return;
    }

    indicadoresModel.indicadores[tipo].splice(index,1);

    renderTabla();

}

function guardar(){

    MGA.updateModel(indicadoresProjectId,{
        indicadores:indicadoresModel.indicadores,
        checklist:{
            indicadoresConMeta:
            totalIndicadores()>0
        }
    });

    alert("Indicadores guardados correctamente.");

}

function totalIndicadores(){

    return ["producto","resultado","gestion","impacto"]
    .reduce((t,k)=>t+(indicadoresModel.indicadores[k]||[]).length,0);

}

function limpiarFormulario(){

    [
        "nombreIndicador",
        "descripcionIndicador",
        "unidadIndicador",
        "fuenteIndicador",
        "lineaBaseIndicador",
        "metaIndicador"
    ].forEach(id=>document.getElementById(id).value="");

    document.getElementById("tipoIndicador").value="producto";

}

function val(id){
    return String(document.getElementById(id).value||"").trim();
}

function esc(v){
    return String(v||"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}
