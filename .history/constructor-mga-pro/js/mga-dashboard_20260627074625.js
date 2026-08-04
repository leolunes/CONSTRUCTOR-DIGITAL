// =====================================
// MGA-DASHBOARD.JS
// CONSTRUCTOR MGA PRO
// Panel Inteligente de Formulación
// =====================================

const MGADashboard = (()=>{

function analizar(projectId){
    if(!window.MotorFormulacion){
        return null;
    }
    return MotorFormulacion.analizarProyecto(projectId);
}

function render(projectId,containerId="mgaDashboard"){
    const c=document.getElementById(containerId);
    if(!c) return;

    const r=analizar(projectId);

    if(!r){
        c.innerHTML=`<div class="card"><h3>No fue posible analizar el proyecto.</h3></div>`;
        return;
    }

    const a=r.avance;
    const cons=r.consistencia;
    const sig=r.siguientePaso;

    c.innerHTML=`
    <section class="card">
      <div class="cardhead">
        <h2>Panel Inteligente MGA</h2>
        <div class="muted small">${r.context.nombre||""}</div>
      </div>

      <div class="grid kpis">
        ${kpi("Avance",a.porcentaje+" %")}
        ${kpi("Consistencia",cons.puntaje+" %")}
        ${kpi("Estado",cons.estado)}
        ${kpi("Listo MGA",r.listoMGA?"SI":"NO")}
      </div>

      <hr class="sep">

      <h3>Checklist</h3>

      <table class="table">
        <thead>
          <tr>
            <th>Módulo</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
        ${a.checks.map(x=>`
          <tr>
            <td>${esc(x.label)}</td>
            <td>${x.ok?"✅":"❌"}</td>
          </tr>`).join("")}
        </tbody>
      </table>

      <hr class="sep">

      <h3>Siguiente paso recomendado</h3>

      <div class="item">
        <b>${esc(sig.titulo)}</b><br>
        ${esc(sig.mensaje)}
      </div>

      <div class="row" style="margin-top:14px;gap:10px;flex-wrap:wrap">
        <button class="btn primary" id="btnDashboardActualizar">Actualizar análisis</button>
        <button class="btn" id="btnDashboardSiguiente">Ir al siguiente paso</button>
      </div>
    </section>`;

    const b1=document.getElementById("btnDashboardActualizar");
    if(b1){
        b1.onclick=()=>render(projectId,containerId);
    }

    const b2=document.getElementById("btnDashboardSiguiente");
    if(b2){
        b2.onclick=()=>{
            if(window.MotorFormulacion){
                MotorFormulacion.irASiguientePaso(projectId);
            }
        };
    }
}

function resumen(projectId){
    if(!window.MotorFormulacion) return null;
    return MotorFormulacion.resumenEjecutivo(projectId);
}

function imprimirConsola(projectId){
    const r=resumen(projectId);
    if(r) console.table(r.conteos);
    return r;
}

function kpi(t,v){
return `<div class="item">
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
 analizar,
 render,
 resumen,
 imprimirConsola
};

})();

window.MGADashboard=MGADashboard;
