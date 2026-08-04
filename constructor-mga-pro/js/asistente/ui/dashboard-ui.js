// =====================================
// UI/DASHBOARD-UI.JS
// CONSTRUCTOR MGA PRO
// Interfaz visual del Dashboard Inteligente
// =====================================

const DashboardUI = (()=>{

function render(projectId,containerId="dashboardInteligente"){

    const c=document.getElementById(containerId);
    if(!c)return;

    let analisis=null;

    if(window.MGADashboard){
        analisis=MGADashboard.analizar(projectId);
    }else if(window.MotorFormulacion){
        analisis=MotorFormulacion.analizarProyecto(projectId);
    }

    if(!analisis){
        c.innerHTML=`
        <div class="item">
          <div class="name">Dashboard no disponible</div>
          <div class="muted small">
            No fue posible analizar el proyecto. Verifique que los motores estén cargados.
          </div>
        </div>`;
        return;
    }

    const avance=analisis.avance||{};
    const consistencia=analisis.consistencia||{};
    const siguiente=analisis.siguientePaso||{};

    c.innerHTML=`
    <div class="grid kpis">
      ${kpi("Avance MGA",(avance.porcentaje||0)+" %")}
      ${kpi("Consistencia",(consistencia.puntaje||0)+" %")}
      ${kpi("Estado",consistencia.estado||"Sin evaluar")}
      ${kpi("Listo MGA",analisis.listoMGA?"SI":"NO")}
    </div>

    <hr class="sep">

    <div class="grid two">
      <div class="item">
        <div class="name">Siguiente paso recomendado</div>
        <h3>${esc(siguiente.titulo||"Revisar proyecto")}</h3>
        <p class="muted small">${esc(siguiente.mensaje||"")}</p>
      </div>

      <div class="item">
        <div class="name">Acciones rápidas</div>
        <div class="row" style="gap:10px;flex-wrap:wrap;margin-top:10px">
          <button class="btn primary" id="dashActualizar" type="button">Actualizar</button>
          <button class="btn" id="dashSiguiente" type="button">Ir al siguiente paso</button>
        </div>
      </div>
    </div>

    <hr class="sep">

    <h3>Checklist de formulación</h3>

    <div class="tablewrap">
      <table class="table" style="min-width:720px">
        <thead>
          <tr>
            <th>Módulo</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${(avance.checks||[]).map(x=>`
            <tr>
              <td>${esc(x.label)}</td>
              <td>${x.ok?"✅ Completo":"❌ Pendiente"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    `;

    const b1=document.getElementById("dashActualizar");
    if(b1){
        b1.onclick=()=>render(projectId,containerId);
    }

    const b2=document.getElementById("dashSiguiente");
    if(b2){
        b2.onclick=()=>{
            if(window.MotorFormulacion){
                MotorFormulacion.irASiguientePaso(projectId);
            }
        };
    }

}

function kpi(t,v){
    return `
    <div class="item">
      <div class="name">${esc(t)}</div>
      <h2>${esc(String(v))}</h2>
    </div>`;
}

function esc(v){
    return String(v||"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

return{
    render
};

})();

window.DashboardUI=DashboardUI;
