// =====================================
// COPILOTO-ORQUESTADOR.JS
// CONSTRUCTOR MGA PRO
// Interfaz visual para ejecutar el Motor Orquestador
// =====================================

const CopilotoOrquestador = (()=>{

let ultimoPaquete = null;

function $(id){
    return document.getElementById(id);
}

function esc(v){
    return String(v || "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;");
}

function projectIdActual(){
    const params = new URLSearchParams(window.location.search);
    return params.get("projectId") || "";
}

function crear(contenedorId="panelCopilotoOrquestador"){

    const cont = $(contenedorId);

    if(!cont){
        console.warn("No existe contenedor para CopilotoOrquestador:", contenedorId);
        return;
    }

    cont.innerHTML = `
        <div class="copiloto-orquestador">
            <div class="copiloto-head">
                <div>
                    <h2>🤖 Copiloto Constructor MGA Pro</h2>
                    <p>
                        Escriba una idea de proyecto y el sistema coordinará MGA,
                        presupuesto preliminar, indicadores, riesgos, financiación y documentos.
                    </p>
                </div>
                <span class="copiloto-badge">Motor Orquestador</span>
            </div>

            <div class="copiloto-form">
                <label>Idea del proyecto</label>
                <textarea id="copilotoIdea" rows="3" placeholder="Ej: Construcción de placa huella de 2 km para la vereda El Diamante, beneficiando a 320 personas."></textarea>

                <div class="copiloto-grid">
                    <div>
                        <label>Ubicación</label>
                        <input id="copilotoUbicacion" placeholder="Ej: Vereda El Diamante, San Gil">
                    </div>
                    <div>
                        <label>Beneficiarios</label>
                        <input id="copilotoBeneficiarios" placeholder="Ej: 320 personas">
                    </div>
                    <div>
                        <label>Alcance físico</label>
                        <input id="copilotoAlcance" placeholder="Ej: 2 km">
                    </div>
                </div>

                <div class="copiloto-actions">
                    <button class="btn primary" id="btnCopilotoOrquestar" type="button">Generar Proyecto Integral</button>
                    <button class="btn" id="btnCopilotoGuardar" type="button" disabled>Guardar resultado en el proyecto</button>
                    <button class="btn" id="btnCopilotoLimpiar" type="button">Limpiar</button>
                </div>
            </div>

            <div id="copilotoResultado" class="copiloto-resultado"></div>
        </div>
    `;

    $("btnCopilotoOrquestar").addEventListener("click", ejecutar);
    $("btnCopilotoGuardar").addEventListener("click", guardar);
    $("btnCopilotoLimpiar").addEventListener("click", limpiar);
}

function ejecutar(){

    const idea = $("copilotoIdea")?.value.trim() || "";

    if(!idea){
        alert("Escriba primero la idea del proyecto.");
        return;
    }

    if(!window.MotorOrquestador){
        alert("MotorOrquestador no está disponible. Verifique que el archivo esté enlazado.");
        return;
    }

    const datos = {
        ubicacion: $("copilotoUbicacion")?.value || "",
        beneficiarios: $("copilotoBeneficiarios")?.value || "",
        alcance: $("copilotoAlcance")?.value || ""
    };

    ultimoPaquete = MotorOrquestador.orquestarDesdeIdea(idea, datos);

    renderResultado(ultimoPaquete);

    const btnGuardar = $("btnCopilotoGuardar");
    if(btnGuardar){
        btnGuardar.disabled = !ultimoPaquete.ok;
    }
}

function renderResultado(ctx){

    const out = $("copilotoResultado");
    if(!out) return;

    if(!ctx){
        out.innerHTML = "";
        return;
    }

    const resumen = window.MotorOrquestador
        ? MotorOrquestador.resumenEstado(ctx)
        : null;

    const r = ctx.resultado || {};
    const analisis = r.analisis || {};
    const proyecto = r.proyecto || {};
    const presupuesto = r.presupuesto || {};
    const coherencia = r.coherencia || null;

    let html = `
        <div class="copiloto-resumen">
            <div>
                <strong>Avance</strong>
                <span>${resumen ? resumen.avance : 0}%</span>
            </div>
            <div>
                <strong>Sector</strong>
                <span>${esc(analisis.sector || "No identificado")}</span>
            </div>
            <div>
                <strong>Tipología</strong>
                <span>${esc(analisis.tipologia || "No identificada")}</span>
            </div>
            <div>
                <strong>Coherencia</strong>
                <span>${coherencia ? coherencia.puntaje + "/100" : "No calculada"}</span>
            </div>
        </div>
    `;

    if(ctx.errores && ctx.errores.length){
        html += `
            <div class="copiloto-alert error">
                <strong>Errores:</strong>
                <ul>${ctx.errores.map(e=>`<li>${esc(e)}</li>`).join("")}</ul>
            </div>
        `;
    }

    if(ctx.alertas && ctx.alertas.length){
        html += `
            <div class="copiloto-alert">
                <strong>Alertas:</strong>
                <ul>${ctx.alertas.map(e=>`<li>${esc(e)}</li>`).join("")}</ul>
            </div>
        `;
    }

    html += `
        <div class="copiloto-section">
            <h3>Pasos ejecutados</h3>
            <div class="copiloto-pasos">
                ${(ctx.pasos || []).map(p=>`
                    <div class="copiloto-paso ${p.ok ? "ok" : "bad"}">
                        <strong>${p.ok ? "✅" : "⚠️"} ${esc(p.nombre)}</strong>
                        <span>${esc(p.detalle)}</span>
                    </div>
                `).join("")}
            </div>
        </div>
    `;

    if(proyecto && proyecto.ok){
        html += `
            <div class="copiloto-section">
                <h3>Proyecto generado</h3>
                <div class="copiloto-card">
                    <div><strong>Nombre:</strong> ${esc(proyecto.nombreProyecto)}</div>
                    <div><strong>Problema:</strong> ${esc(proyecto.problema?.problemaCentral)}</div>
                    <div><strong>Objetivo:</strong> ${esc(proyecto.objetivos?.objetivoGeneral)}</div>
                    <div><strong>Beneficios:</strong> ${esc(proyecto.beneficios)}</div>
                </div>
            </div>
        `;
    }

    if(presupuesto && presupuesto.capitulosSugeridos){
        html += `
            <div class="copiloto-section">
                <h3>Presupuesto preliminar</h3>
                <div class="copiloto-card">
                    <p>${esc(presupuesto.observacion)}</p>
                    <ul>
                        ${presupuesto.capitulosSugeridos.map(c=>`<li>${esc(c)}</li>`).join("")}
                    </ul>
                </div>
            </div>
        `;
    }

    if(r.financiacion && r.financiacion.length){
        html += `
            <div class="copiloto-section">
                <h3>Fuentes de financiación sugeridas</h3>
                <div class="copiloto-card">
                    <ul>${r.financiacion.map(f=>`<li>${esc(f)}</li>`).join("")}</ul>
                </div>
            </div>
        `;
    }

    html += `
        <div class="copiloto-next">
            <strong>Siguiente recomendación:</strong>
            <span>${esc(r.siguienteAccion || "Revise la información generada.")}</span>
        </div>
    `;

    out.innerHTML = html;
}

async function guardar(){

    if(!ultimoPaquete || !ultimoPaquete.ok){
        alert("No hay un paquete válido para guardar.");
        return;
    }

    const projectId = projectIdActual();

    if(!projectId){
        alert("No se encontró el proyecto activo.");
        return;
    }

    if(!window.MotorOrquestador){
        alert("MotorOrquestador no está disponible.");
        return;
    }

    const res = await MotorOrquestador.guardarEnProyecto(projectId, ultimoPaquete);

    if(res.ok){
        alert("Resultado del copiloto guardado correctamente.");
    }else{
        alert("No se pudo guardar: " + (res.mensaje || "Error desconocido"));
    }
}

function limpiar(){
    ultimoPaquete = null;

    if($("copilotoIdea")) $("copilotoIdea").value = "";
    if($("copilotoUbicacion")) $("copilotoUbicacion").value = "";
    if($("copilotoBeneficiarios")) $("copilotoBeneficiarios").value = "";
    if($("copilotoAlcance")) $("copilotoAlcance").value = "";

    if($("copilotoResultado")) $("copilotoResultado").innerHTML = "";

    if($("btnCopilotoGuardar")) $("btnCopilotoGuardar").disabled = true;
}

return{
    crear,
    ejecutar,
    guardar,
    limpiar
};

})();

window.CopilotoOrquestador = CopilotoOrquestador;
