// =====================================
// UI/REPORTES-UI.JS
// CONSTRUCTOR MGA PRO
// Interfaz para reportes rápidos del asistente
// =====================================

const ReportesUI = (()=>{

function renderCatalogos(containerId="reporteCatalogos"){

    const c=document.getElementById(containerId);
    if(!c)return;

    let stats=null;

    if(window.MotorCatalogos){
        stats=MotorCatalogos.estadisticas();
    }else if(window.CatalogoMGA){
        stats=CatalogoMGA.estadisticas();
    }

    if(!stats){
        c.innerHTML=msg("No hay estadísticas disponibles.");
        return;
    }

    const detalle=stats.detalle||{};

    c.innerHTML=`
    <div class="grid kpis">
      ${kpi("Catálogos",stats.catalogos||0)}
      ${kpi("Elementos",stats.totalElementos||0)}
      ${kpi("Tipologías",window.MotorTipologias?MotorTipologias.estadisticas().total:0)}
      ${kpi("Índice",window.IndiceBusquedas?IndiceBusquedas.total():0)}
    </div>

    <hr class="sep">

    <div class="tablewrap">
      <table class="table" style="min-width:720px">
        <thead>
          <tr>
            <th>Catálogo</th>
            <th style="text-align:right">Registros</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(detalle).map(([k,v])=>`
            <tr>
              <td>${esc(k)}</td>
              <td style="text-align:right">${v}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`;
}

function renderTipologias(containerId="reporteTipologias"){

    const c=document.getElementById(containerId);
    if(!c)return;

    if(!window.MotorTipologias){
        c.innerHTML=msg("MotorTipologias no está disponible.");
        return;
    }

    const lista=MotorTipologias.listar();

    c.innerHTML=`
    <div class="tablewrap">
      <table class="table" style="min-width:900px">
        <thead>
          <tr>
            <th>Código</th>
            <th>Tipología</th>
            <th>Sector</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          ${lista.map(t=>`
            <tr>
              <td>${esc(t.codigo)}</td>
              <td><b>${esc(t.nombre)}</b></td>
              <td>${esc(t.sector)}</td>
              <td class="muted small">${esc(t.descripcion)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`;
}

function diagnostico(containerId="reporteDiagnostico"){

    const c=document.getElementById(containerId);
    if(!c)return;

    const datos={
        CatalogoMGA:!!window.CatalogoMGA,
        MotorCatalogos:!!window.MotorCatalogos,
        MotorTipologias:!!window.MotorTipologias,
        MotorBuscador:!!window.MotorBuscador,
        IndiceBusquedas:!!window.IndiceBusquedas,
        RankingBusquedas:!!window.RankingBusquedas,
        SinonimosBusquedas:!!window.SinonimosBusquedas,
        AutocompletarBusquedas:!!window.AutocompletarBusquedas,
        HistorialBusquedas:!!window.HistorialBusquedas,
        FavoritosBusquedas:!!window.FavoritosBusquedas,
        SugerenciasBusquedas:!!window.SugerenciasBusquedas,
        BuscadorUI:!!window.BuscadorUI,
        TipologiasUI:!!window.TipologiasUI,
        AsistentesUI:!!window.AsistentesUI
    };

    c.innerHTML=`
    <div class="tablewrap">
      <table class="table" style="min-width:520px">
        <thead>
          <tr>
            <th>Componente</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(datos).map(([k,v])=>`
            <tr>
              <td>${esc(k)}</td>
              <td>${v?"✅ Cargado":"❌ No cargado"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`;
}

function renderTodo(config={}){

    renderCatalogos(config.catalogosId||"reporteCatalogos");
    renderTipologias(config.tipologiasId||"reporteTipologias");
    diagnostico(config.diagnosticoId||"reporteDiagnostico");

}

function kpi(t,v){
    return `
    <div class="item">
      <div class="name">${esc(t)}</div>
      <h2>${esc(String(v))}</h2>
    </div>`;
}

function msg(t){
    return `<div class="item"><div class="muted small">${esc(t)}</div></div>`;
}

function esc(v){
    return String(v||"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

return{
    renderCatalogos,
    renderTipologias,
    diagnostico,
    renderTodo
};

})();

window.ReportesUI=ReportesUI;
