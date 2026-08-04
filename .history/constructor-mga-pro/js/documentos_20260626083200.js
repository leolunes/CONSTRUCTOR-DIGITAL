// =====================================
// DOCUMENTOS.JS - CONSTRUCTOR MGA PRO
// =====================================

let docProjectId="",docProject=null,docModel=null;

document.addEventListener("DOMContentLoaded",()=>{
  docProjectId=MGA.getProjectIdFromUrl();
  docProject=MGA.getProject(docProjectId);
  if(!docProject)return;
  docModel=MGA.getModel(docProject);

  configurar();
  document.getElementById("btnGenerarDocumentos").onclick=generar;
  document.querySelectorAll("[data-copy]").forEach(b=>{
    b.onclick=()=>copiar(document.getElementById(b.dataset.copy));
  });
  generar();
});

function configurar(){
  const id=encodeURIComponent(docProjectId);
  const map={
    btnVolverProyecto:`proyecto-detalle.html?projectId=${id}`,
    btnProyecto:`proyecto-detalle.html?projectId=${id}`,
    btnMGA:`mga.html?projectId=${id}`,
    btnDiagnostico:`diagnostico.html?projectId=${id}`,
    btnCadenaValor:`cadena-valor.html?projectId=${id}`
  };
  Object.entries(map).forEach(([k,v])=>{
    const e=document.getElementById(k);
    if(e)e.href=v;
  });
  const s=document.getElementById("documentosSub");
  if(s)s.textContent=(docProject.name||"Proyecto")+" · Documentos MGA";
}

function generar(){
  docProject=StorageAPI.getProjectById(docProjectId);
  docModel=MGA.getModel(docProject);

  const d=docModel.diagnostico||{};
  const ao=docModel.arbolObjetivos||{};
  const cv=docModel.cadenaValor||{};
  const r=docModel.riesgos||[];

  const problema=(docModel.documentosMGA&&docModel.documentosMGA.descripcionProblema)||d.problemaCentral||"";
  const just=d.justificacion||"";
  const obj=ao.objetivoGeneral||cv.objetivoGeneral||"";
  const alt=`Se analizaron diferentes alternativas de intervención. La alternativa seleccionada permite atender el problema identificado mediante ${cv.productos?.length||0} productos y ${cv.actividades?.length||0} actividades, optimizando recursos y maximizando el beneficio para la población objetivo.`;
  const ben=`Se espera mejorar las condiciones de la población objetivo mediante la ejecución del proyecto, generando resultados sostenibles, fortaleciendo la capacidad institucional y aumentando la cobertura y calidad de los servicios.`;
  const sost=`La sostenibilidad del proyecto estará soportada por la entidad ejecutora mediante recursos para operación, mantenimiento, seguimiento de indicadores, gestión de riesgos y mejora continua. Riesgos identificados: ${r.length}.`;

  set("txtDescripcionProblema",problema);
  set("txtJustificacion",just);
  set("txtObjetivoGeneral",obj);
  set("txtAlternativas",alt);
  set("txtBeneficios",ben);
  set("txtSostenibilidad",sost);

  set("txtConsolidado",
`DESCRIPCIÓN DEL PROBLEMA

${problema}

JUSTIFICACIÓN

${just}

OBJETIVO GENERAL

${obj}

ANÁLISIS DE ALTERNATIVAS

${alt}

BENEFICIOS

${ben}

SOSTENIBILIDAD

${sost}`);

  MGA.updateModel(docProjectId,{
    documentosMGA:{
      descripcionProblema:problema,
      justificacion:just,
      objetivoGeneral:obj,
      alternativas:alt,
      beneficios:ben,
      sostenibilidad:sost
    }
  });
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
