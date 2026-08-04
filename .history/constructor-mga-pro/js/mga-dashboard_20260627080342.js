// =====================================
// MGA-DASHBOARD.JS
// CONSTRUCTOR MGA PRO
// Panel Inteligente de Formulación - Versión Mejorada
// =====================================

const MGADashboard = (() => {

    // =====================================
    // ANALIZAR
    // =====================================

    function analizar(projectId){

        if(!window.MotorFormulacion){
            return null;
        }

        return MotorFormulacion.analizarProyecto(projectId);

    }

    // =====================================
    // RENDER PRINCIPAL
    // =====================================

    function render(projectId, containerId = "mgaDashboard"){

        const c =
        document.getElementById(containerId);

        if(!c){
            return;
        }

        const r =
        analizar(projectId);

        if(!r){

            c.innerHTML =
            `
            <div class="card">
                <h3>No fue posible analizar el proyecto.</h3>
                <p class="muted small">
                    Revise que los motores inteligentes estén cargados correctamente.
                </p>
            </div>
            `;

            return;

        }

        const a =
        r.avance || {};

        const cons =
        r.consistencia || {};

        const sig =
        r.siguientePaso || {};

        const resumen =
        resumen(projectId) || {};

        const presupuesto =
        resumen.presupuesto || {};

        c.innerHTML =
        `
        <section class="card">

          <div class="cardhead">
            <div>
              <h2>Panel Inteligente MGA</h2>
              <div class="muted small">${esc(r.context?.nombre || "")}</div>
            </div>

            <div class="chips">
              ${chipEstado(r.listoMGA ? "LISTO MGA" : "EN FORMULACIÓN", r.listoMGA ? "ok" : "warn")}
            </div>
          </div>

          ${barraAvance(a.porcentaje || 0, "Avance de formulación")}
          ${barraAvance(cons.puntaje || 0, "Consistencia técnica")}

          <div class="grid kpis" style="margin-top:14px">
            ${kpi("Avance", (a.porcentaje || 0) + " %", estadoPorcentaje(a.porcentaje || 0))}
            ${kpi("Consistencia", (cons.puntaje || 0) + " %", estadoPorcentaje(cons.puntaje || 0))}
            ${kpi("Estado", cons.estado || "Sin evaluar", estadoPorcentaje(cons.puntaje || 0))}
            ${kpi("Listo MGA", r.listoMGA ? "SI" : "NO", r.listoMGA ? "ok" : "bad")}
          </div>

          <hr class="sep">

          <div class="grid two">

            <div class="item">
              <div class="name">Presupuesto total</div>
              <h2>${fmtMoney(presupuesto.total || 0)}</h2>
              <div class="muted small">Valor total registrado en el presupuesto.</div>
            </div>

            <div class="item">
              <div class="name">Presupuesto vinculado MGA</div>
              <h2>${presupuesto.porcentajeVinculado || 0}%</h2>
              <div class="muted small">
                ${fmtMoney(presupuesto.vinculado || 0)} vinculado a actividades MGA.
              </div>
            </div>

          </div>

          <hr class="sep">

          ${renderAlertas(cons)}

          <hr class="sep">

          <h3>Checklist de Formulación</h3>

          <div class="tablewrap">
            <table class="table" style="min-width:760px">
              <thead>
                <tr>
                  <th>Módulo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
              ${(a.checks || []).map(x => `
                <tr>
                  <td>${esc(x.label)}</td>
                  <td>${x.ok ? "✅ Completo" : "❌ Pendiente"}</td>
                </tr>
              `).join("")}
              </tbody>
            </table>
          </div>

          <hr class="sep">

          <h3>Siguiente paso recomendado</h3>

          <div class="item">
            <b>${esc(sig.titulo || "Revisar proyecto")}</b><br>
            <span class="muted small">${esc(sig.mensaje || "")}</span>
          </div>

          <div class="row" style="margin-top:14px;gap:10px;flex-wrap:wrap">
            <button class="btn primary" id="btnDashboardActualizar">Actualizar análisis</button>
            <button class="btn" id="btnDashboardRecalcular">Recalcular proyecto</button>
            <button class="btn" id="btnDashboardSiguiente">Ir al siguiente paso</button>
          </div>

        </section>
        `;

        bindBotones(projectId, containerId);

    }

    // =====================================
    // BOTONES
    // =====================================

    function bindBotones(projectId, containerId){

        const b1 =
        document.getElementById("btnDashboardActualizar");

        if(b1){
            b1.onclick = () => render(projectId, containerId);
        }

        const b2 =
        document.getElementById("btnDashboardSiguiente");

        if(b2){

            b2.onclick = () => {

                if(window.MotorFormulacion){
                    MotorFormulacion.irASiguientePaso(projectId);
                }

            };

        }

        const b3 =
        document.getElementById("btnDashboardRecalcular");

        if(b3){

            b3.onclick = () => {

                if(window.MotorFormulacion && typeof MotorFormulacion.recalcularProyecto === "function"){

                    MotorFormulacion.recalcularProyecto(projectId);

                    setTimeout(() => {
                        render(projectId, containerId);
                    }, 300);

                    alert("Proyecto recalculado.");

                }else{

                    alert("MotorFormulacion.recalcularProyecto no está disponible.");

                }

            };

        }

    }

    // =====================================
    // ALERTAS
    // =====================================

    function renderAlertas(cons){

        const errores =
        cons.errores || [];

        const advertencias =
        cons.advertencias || [];

        if(!errores.length && !advertencias.length){

            return `
            <div class="item">
              <div class="name">✅ Sin alertas críticas</div>
              <div class="muted small">
                El proyecto no presenta errores críticos en el análisis actual.
              </div>
            </div>
            `;

        }

        let html =
        `<h3>Alertas del análisis</h3>`;

        if(errores.length){

            html +=
            `
            <div class="item" style="border-color:#dc2626">
              <div class="name">Errores críticos</div>
              <ul>
                ${errores.map(e => `<li>${esc(e)}</li>`).join("")}
              </ul>
            </div>
            `;

        }

        if(advertencias.length){

            html +=
            `
            <div class="item" style="margin-top:10px">
              <div class="name">Advertencias</div>
              <ul>
                ${advertencias.map(e => `<li>${esc(e)}</li>`).join("")}
              </ul>
            </div>
            `;

        }

        return html;

    }

    // =====================================
    // RESUMEN
    // =====================================

    function resumen(projectId){

        if(!window.MotorFormulacion){
            return null;
        }

        return MotorFormulacion.resumenEjecutivo(projectId);

    }

    function imprimirConsola(projectId){

        const r =
        resumen(projectId);

        if(r){
            console.table(r.conteos);
        }

        return r;

    }

    // =====================================
    // COMPONENTES VISUALES
    // =====================================

    function kpi(t, v, estado = "neutral"){

        return `
        <div class="item">
          <div class="name">${esc(t)}</div>
          <h2>${esc(String(v))}</h2>
          <div>${chipEstado(nombreEstado(estado), estado)}</div>
        </div>
        `;

    }

    function barraAvance(valor, label){

        const n =
        Math.max(0, Math.min(100, Number(valor || 0)));

        const estado =
        estadoPorcentaje(n);

        const color =
        estado === "ok"
        ? "#16a34a"
        : estado === "warn"
          ? "#f59e0b"
          : "#dc2626";

        return `
        <div style="margin-top:12px">
          <div class="row space">
            <div class="name">${esc(label)}</div>
            <div><b>${n}%</b></div>
          </div>

          <div style="
            height:12px;
            background:rgba(148,163,184,.25);
            border-radius:999px;
            overflow:hidden;
            margin-top:6px;
          ">
            <div style="
              width:${n}%;
              height:12px;
              background:${color};
              border-radius:999px;
            "></div>
          </div>
        </div>
        `;

    }

    function chipEstado(texto, estado){

        const color =
        estado === "ok"
        ? "background:#dcfce7;color:#166534;border:1px solid #86efac"
        : estado === "warn"
          ? "background:#fef3c7;color:#92400e;border:1px solid #fcd34d"
          : estado === "bad"
            ? "background:#fee2e2;color:#991b1b;border:1px solid #fca5a5"
            : "background:#e5e7eb;color:#374151;border:1px solid #cbd5e1";

        return `
        <span style="
          display:inline-flex;
          align-items:center;
          padding:4px 10px;
          border-radius:999px;
          font-size:12px;
          font-weight:700;
          ${color}
        ">
          ${esc(texto)}
        </span>
        `;

    }

    function estadoPorcentaje(v){

        const n =
        Number(v || 0);

        if(n >= 85){
            return "ok";
        }

        if(n >= 60){
            return "warn";
        }

        return "bad";

    }

    function nombreEstado(estado){

        if(estado === "ok"){
            return "ALTO";
        }

        if(estado === "warn"){
            return "MEDIO";
        }

        if(estado === "bad"){
            return "BAJO";
        }

        return "INFO";

    }

    // =====================================
    // HELPERS
    // =====================================

    function fmtMoney(value){

        const n =
        Number(value || 0);

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

    // =====================================
    // API PÚBLICA
    // =====================================

    return {
        analizar,
        render,
        resumen,
        imprimirConsola
    };

})();

window.MGADashboard = MGADashboard;
