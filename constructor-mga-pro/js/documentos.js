// =====================================
// DOCUMENTOS.JS - CONSTRUCTOR MGA PRO
// Generador inteligente de textos MGA
// =====================================

let docProjectId="";
let docProject=null;
let docModel=null;

document.addEventListener("DOMContentLoaded",()=>{

    docProjectId=MGA.getProjectIdFromUrl();
    docProject=MGA.getProject(docProjectId);

    if(!docProject)return;

    docModel=MGA.getModel(docProject);

    configurar();

    const btn=document.getElementById("btnGenerarDocumentos");
    if(btn) btn.onclick=generar;

    document.querySelectorAll("[data-copy]").forEach(b=>{
        b.onclick=()=>copiar(document.getElementById(b.dataset.copy));
    });

    generar();

});

function configurar(){

    const id=encodeURIComponent(docProjectId);

    const rutas={
        btnVolverProyecto:`proyecto-detalle.html?projectId=${id}`,
        btnProyecto:`proyecto-detalle.html?projectId=${id}`,
        btnMGA:`mga.html?projectId=${id}`,
        btnDiagnostico:`diagnostico.html?projectId=${id}`,
        btnCadenaValor:`cadena-valor.html?projectId=${id}`
    };

    Object.entries(rutas).forEach(([k,v])=>{
        const e=document.getElementById(k);
        if(e)e.href=v;
    });

    const s=document.getElementById("documentosSub");
    if(s){
        s.textContent=(docProject.name||"Proyecto")+" · Documentos MGA";
    }

}

function generar(){

    docProject=StorageAPI.getProjectById(docProjectId);
    docModel=MGA.getModel(docProject);

    let textos=null;

    if(window.MotorExportador &&
       typeof MotorExportador.generarDocumentos==="function"){

        textos=MotorExportador.generarDocumentos(
            docProject,
            docModel
        );

    }else{

        textos=generarLocal();

    }

    set("txtDescripcionProblema",textos.descripcionProblema);
    set("txtJustificacion",textos.justificacion);
    set("txtObjetivoGeneral",textos.objetivoGeneral);
    set("txtAlternativas",textos.alternativas);
    set("txtBeneficios",textos.beneficios);
    set("txtSostenibilidad",textos.sostenibilidad);
    set("txtConsolidado",textos.consolidado);

    MGA.updateModel(docProjectId,{
        documentosMGA:textos,
        checklist:{
            documentosGenerados:true
        }
    });

}

function generarLocal(){

    const d=docModel.diagnostico||{};
    const ao=docModel.arbolObjetivos||{};
    const cv=docModel.cadenaValor||{};
    const r=docModel.riesgos||[];
    const ind=docModel.indicadores||{};

    const totalIndicadores=
    ["producto","resultado","gestion","impacto"]
    .reduce((s,k)=>s+((ind[k]||[]).length),0);

    const problema=
    d.problemaCentral||"";

    const justificacion=
    d.justificacion||
    "El proyecto responde a la problemática identificada durante el diagnóstico territorial y busca mejorar las condiciones actuales de la población objetivo.";

    const objetivo=
    ao.objetivoGeneral||
    cv.objetivoGeneral||
    "";

    const alternativas=
`Se evaluaron diferentes alternativas de intervención.

La alternativa seleccionada permite atender el problema identificado mediante ${cv.productos?.length||0} producto(s), ${cv.actividades?.length||0} actividad(es) y una adecuada articulación con la inversión pública.`;

    const beneficios=
`La ejecución del proyecto permitirá mejorar las condiciones de la población objetivo, fortalecer la capacidad institucional y generar beneficios sostenibles para el territorio.

Indicadores previstos: ${totalIndicadores}.`;

    const sostenibilidad=
`La entidad responsable garantizará la operación, mantenimiento y seguimiento del proyecto mediante recursos institucionales, monitoreo permanente e implementación de acciones de mitigación frente a ${r.length} riesgo(s) identificado(s).`;

    const consolidado=
`DESCRIPCIÓN DEL PROBLEMA

${problema}

JUSTIFICACIÓN

${justificacion}

OBJETIVO GENERAL

${objetivo}

ANÁLISIS DE ALTERNATIVAS

${alternativas}

BENEFICIOS ESPERADOS

${beneficios}

SOSTENIBILIDAD

${sostenibilidad}`;

    return{
        descripcionProblema:problema,
        justificacion,
        objetivoGeneral:objetivo,
        alternativas,
        beneficios,
        sostenibilidad,
        consolidado
    };

}

function set(id,v){
    const e=document.getElementById(id);
    if(e)e.value=v||"";
}

async function copiar(el){

    if(!el)return;

    try{

        await navigator.clipboard.writeText(el.value||"");
        alert("Texto copiado.");

    }catch{

        el.select();
        document.execCommand("copy");
        alert("Texto copiado.");

    }

}
