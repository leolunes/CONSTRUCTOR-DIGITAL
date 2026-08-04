// =====================================
// UI/TIPOLOGIAS-UI.JS
// CONSTRUCTOR MGA PRO
// Interfaz para selección y aplicación de tipologías
// =====================================

const TipologiasUI = (()=>{

let cfg={};

function iniciar(config={}){

    cfg={
        sectorId:config.sectorId||"iaSector",
        tipologiaId:config.tipologiaId||"iaTipologia",
        resultadoId:config.resultadoId||"iaSectorialResultado",
        projectId:config.projectId||"",
        onApply:config.onApply||null
    };

    cargarSectores();
    bind();

}

function cargarSectores(){

    const sel=document.getElementById(cfg.sectorId);
    if(!sel || !window.MotorCatalogos)return;

    const sectores=MotorCatalogos.listar("sectores")||[];

    sel.innerHTML=
    `<option value="">Seleccione sector...</option>`+
    sectores.map(s=>{
        const codigo=s.codigo||s.id||"";
        return `<option value="${esc(codigo)}">${esc(s.nombre||codigo)}</option>`;
    }).join("");

    cargarTipologias();

}

function cargarTipologias(){

    const selSector=document.getElementById(cfg.sectorId);
    const selTip=document.getElementById(cfg.tipologiaId);

    if(!selTip)return;

    selTip.innerHTML=
    `<option value="">Seleccione una tipología...</option>`;

    if(!window.MotorTipologias || !selSector?.value)return;

    const sector=selSector.value;
    const sectorNombre=selSector.options[selSector.selectedIndex]?.textContent||"";

    let lista=MotorTipologias.porSector(sector)||[];

    if(!lista.length){
        lista=MotorTipologias.porSector(sectorNombre)||[];
    }

    lista.forEach(t=>{
        const op=document.createElement("option");
        op.value=t.codigo||t.id;
        op.textContent=t.nombre||t.codigo;
        selTip.appendChild(op);
    });

}

function bind(){

    const selSector=document.getElementById(cfg.sectorId);
    if(selSector){
        selSector.onchange=cargarTipologias;
    }

}

function preview(){

    const out=document.getElementById(cfg.resultadoId);
    const selTip=document.getElementById(cfg.tipologiaId);
    const selSector=document.getElementById(cfg.sectorId);

    if(!out)return;

    const tip=selTip?.value||"";

    if(tip && window.MotorTipologias){

        const r=MotorTipologias.resolver(tip);

        if(!r){
            out.innerHTML=msg("No fue posible resolver la tipología.");
            return;
        }

        out.innerHTML=`
        <div class="item">
          <div class="name">${esc(r.tipologia.nombre)}</div>
          <p class="muted small">${esc(r.tipologia.descripcion)}</p>

          <hr class="sep">

          <b>Productos:</b>
          <ul>${(r.productos||[]).map(x=>`<li>${esc(x.nombre)}</li>`).join("")}</ul>

          <b>Indicadores:</b>
          <ul>${(r.indicadores||[]).map(x=>`<li>${esc(x.nombre)}</li>`).join("")}</ul>

          <b>Riesgos:</b>
          <ul>${(r.riesgos||[]).map(x=>`<li>${esc(x.nombre)}</li>`).join("")}</ul>
        </div>`;
        return;
    }

    const sector=selSector?.value||"";

    if(sector && window.MotorCatalogos){

        const r=MotorCatalogos.sugerirParaSector(sector);

        if(!r){
            out.innerHTML=msg("No fue posible generar sugerencia para el sector.");
            return;
        }

        out.innerHTML=`
        <div class="item">
          <div class="name">${esc(r.sector.nombre)}</div>
          <p class="muted small">${esc(r.sector.descripcion)}</p>

          <hr class="sep">

          <b>Productos sugeridos:</b>
          <ul>${(r.productos||[]).map(x=>`<li>${esc(x.nombre)}</li>`).join("")}</ul>
        </div>`;
        return;
    }

    out.innerHTML=msg("Seleccione un sector o una tipología.");

}

function aplicar(opciones={}){

    const selTip=document.getElementById(cfg.tipologiaId);
    const selSector=document.getElementById(cfg.sectorId);
    const out=document.getElementById(cfg.resultadoId);

    const projectId=opciones.projectId||cfg.projectId;

    if(!projectId){
        alert("No se encontró el proyecto activo.");
        return null;
    }

    const tip=selTip?.value||"";
    const sector=selSector?.value||"";

    let result=null;

    if(tip && window.MotorTipologias){
        result=MotorTipologias.aplicar(projectId,tip,opciones);
    }else if(sector && window.MotorCatalogos){
        result=MotorCatalogos.aplicarModeloBase(projectId,sector,opciones);
    }else{
        alert("Seleccione un sector o una tipología.");
        return null;
    }

    if(result){

        if(out){
            out.innerHTML=`
            <div class="item">
              <div class="name">✅ Estructura generada</div>
              <div class="muted small">
                Revise y ajuste la información antes de radicar el proyecto.
              </div>
            </div>`;
        }

        if(typeof cfg.onApply==="function"){
            cfg.onApply(result);
        }

    }

    return result;

}

function msg(texto){
    return `<div class="item"><div class="muted small">${esc(texto)}</div></div>`;
}

function esc(v){
    return String(v||"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

return{
    iniciar,
    cargarSectores,
    cargarTipologias,
    preview,
    aplicar
};

})();

window.TipologiasUI=TipologiasUI;
