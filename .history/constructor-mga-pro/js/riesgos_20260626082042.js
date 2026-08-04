// =====================================
// RIESGOS.JS - CONSTRUCTOR MGA PRO
// =====================================

let riesgosProjectId = "";
let riesgosProject = null;
let riesgosModel = null;

document.addEventListener("DOMContentLoaded", () => {

    riesgosProjectId =
    MGA.getProjectIdFromUrl();

    riesgosProject =
    MGA.getProject(riesgosProjectId);

    if(!riesgosProject){
        return;
    }

    riesgosModel =
    MGA.getModel(riesgosProject);

    configurarLinksRiesgos();
    bindEventosRiesgos();
    renderRiesgos();

});

// =====================================
// LINKS
// =====================================

function configurarLinksRiesgos(){

    const id =
    encodeURIComponent(riesgosProjectId);

    const rutas =
    {
        btnVolverProyecto:
        `proyecto-detalle.html?projectId=${id}`,

        btnProyecto:
        `proyecto-detalle.html?projectId=${id}`,

        btnCadenaValor:
        `cadena-valor.html?projectId=${id}`,

        btnIndicadores:
        `indicadores.html?projectId=${id}`,

        btnCronograma:
        `cronograma.html?projectId=${id}`
    };

    Object.keys(rutas).forEach(key => {

        const el =
        document.getElementById(key);

        if(el){
            el.href =
            rutas[key];
        }

    });

    const sub =
    document.getElementById("riesgosSub");

    if(sub){
        sub.textContent =
        `${riesgosProject.name || "Proyecto"} · Matriz de Riesgos`;
    }

}

// =====================================
// EVENTOS
// =====================================

function bindEventosRiesgos(){

    const form =
    document.getElementById("formRiesgo");

    if(form){

        form.addEventListener("submit", (e) => {

            e.preventDefault();

            agregarRiesgo();

        });

    }

    const btnGuardar =
    document.getElementById("btnGuardarRiesgosTop");

    if(btnGuardar){

        btnGuardar.addEventListener("click", guardarRiesgos);

    }

    const btnSugerir =
    document.getElementById("btnSugerirRiesgos");

    if(btnSugerir){

        btnSugerir.addEventListener("click", sugerirRiesgosTipo);

    }

}

// =====================================
// AGREGAR RIESGO
// =====================================

function agregarRiesgo(){

    const riesgo =
    MGA.newRiesgo();

    riesgo.tipo =
    getValue("tipoRiesgo");

    riesgo.descripcion =
    getValue("descripcionRiesgo");

    riesgo.probabilidad =
    getValue("probabilidadRiesgo");

    riesgo.impacto =
    getValue("impactoRiesgo");

    riesgo.nivel =
    calcularNivelRiesgo(
        riesgo.probabilidad,
        riesgo.impacto
    );

    riesgo.medidaMitigacion =
    getValue("mitigacionRiesgo");

    riesgo.responsable =
    getValue("responsableRiesgo");

    if(!riesgo.descripcion){
        alert("Debe escribir la descripción del riesgo.");
        return;
    }

    if(!Array.isArray(riesgosModel.riesgos)){
        riesgosModel.riesgos = [];
    }

    riesgosModel.riesgos.push(riesgo);

    limpiarFormularioRiesgo();

    renderRiesgos();

}

// =====================================
// SUGERIR RIESGOS TIPO
// =====================================

function sugerirRiesgosTipo(){

    if(!Array.isArray(riesgosModel.riesgos)){
        riesgosModel.riesgos = [];
    }

    const sugeridos =
    [
        {
            tipo: "Técnico",
            descripcion: "Posibles ajustes técnicos durante la ejecución del proyecto por condiciones no previstas en el diagnóstico inicial.",
            probabilidad: "Media",
            impacto: "Medio",
            medidaMitigacion: "Realizar revisión técnica previa, validar diseños, especificaciones, cantidades y condiciones de ejecución antes del inicio contractual.",
            responsable: "Entidad ejecutora / equipo técnico"
        },
        {
            tipo: "Financiero",
            descripcion: "Variación de precios de insumos, materiales, transporte o mano de obra durante el horizonte de ejecución.",
            probabilidad: "Media",
            impacto: "Alto",
            medidaMitigacion: "Actualizar presupuesto antes de la contratación, revisar análisis de precios unitarios y prever mecanismos contractuales permitidos.",
            responsable: "Entidad formuladora / entidad ejecutora"
        },
        {
            tipo: "Jurídico",
            descripcion: "Demoras asociadas a trámites contractuales, permisos, autorizaciones o requisitos normativos.",
            probabilidad: "Media",
            impacto: "Medio",
            medidaMitigacion: "Verificar requisitos jurídicos, contractuales y normativos desde la etapa de estructuración del proyecto.",
            responsable: "Área jurídica / entidad ejecutora"
        },
        {
            tipo: "Social",
            descripcion: "Baja apropiación comunitaria o resistencia de algunos actores frente a la ejecución del proyecto.",
            probabilidad: "Baja",
            impacto: "Medio",
            medidaMitigacion: "Implementar procesos de socialización, participación y comunicación con la comunidad beneficiaria.",
            responsable: "Entidad ejecutora / equipo social"
        },
        {
            tipo: "Ambiental",
            descripcion: "Impactos ambientales menores derivados de las actividades propias del proyecto.",
            probabilidad: "Baja",
            impacto: "Medio",
            medidaMitigacion: "Aplicar buenas prácticas ambientales, manejo adecuado de residuos y cumplimiento de permisos cuando aplique.",
            responsable: "Contratista / supervisión"
        }
    ];

    let agregados =
    0;

    sugeridos.forEach(item => {

        const existe =
        riesgosModel.riesgos.some(r =>
            String(r.descripcion || "").trim().toLowerCase() ===
            String(item.descripcion || "").trim().toLowerCase()
        );

        if(existe){
            return;
        }

        const riesgo =
        MGA.newRiesgo();

        riesgo.tipo =
        item.tipo;

        riesgo.descripcion =
        item.descripcion;

        riesgo.probabilidad =
        item.probabilidad;

        riesgo.impacto =
        item.impacto;

        riesgo.nivel =
        calcularNivelRiesgo(
            item.probabilidad,
            item.impacto
        );

        riesgo.medidaMitigacion =
        item.medidaMitigacion;

        riesgo.responsable =
        item.responsable;

        riesgosModel.riesgos.push(riesgo);

        agregados++;

    });

    renderRiesgos();

    alert(`Riesgos sugeridos agregados: ${agregados}`);

}

// =====================================
// CALCULAR NIVEL
// =====================================

function calcularNivelRiesgo(probabilidad, impacto){

    const p =
    valorProbabilidad(probabilidad);

    const i =
    valorImpacto(impacto);

    const total =
    p * i;

    if(total >= 6){
        return "Alto";
    }

    if(total >= 3){
        return "Medio";
    }

    return "Bajo";

}

function valorProbabilidad(value){

    const v =
    String(value || "").toLowerCase();

    if(v.includes("alta")) return 3;
    if(v.includes("media")) return 2;
    return 1;

}

function valorImpacto(value){

    const v =
    String(value || "").toLowerCase();

    if(v.includes("alto")) return 3;
    if(v.includes("medio")) return 2;
    return 1;

}

// =====================================
// RENDER TABLA
// =====================================

function renderRiesgos(){

    const body =
    document.getElementById("riesgosBody");

    if(!body){
        return;
    }

    const riesgos =
    riesgosModel.riesgos || [];

    if(!riesgos.length){

        body.innerHTML =
        `<tr><td colspan="8" class="muted small">No existen riesgos registrados.</td></tr>`;

        return;

    }

    body.innerHTML =
    riesgos.map((r, index) => {

        return `
        <tr>
          <td>${escapeHtml(r.tipo || "")}</td>
          <td>${escapeHtml(r.descripcion || "")}</td>
          <td>${escapeHtml(r.probabilidad || "")}</td>
          <td>${escapeHtml(r.impacto || "")}</td>
          <td><b>${escapeHtml(r.nivel || "")}</b></td>
          <td>${escapeHtml(r.medidaMitigacion || "")}</td>
          <td>${escapeHtml(r.responsable || "")}</td>
          <td>
            <button class="btn danger" type="button" data-del-riesgo="${index}">Eliminar</button>
          </td>
        </tr>
        `;

    }).join("");

    body.querySelectorAll("[data-del-riesgo]").forEach(btn => {

        btn.addEventListener("click", () => {

            const index =
            Number(btn.getAttribute("data-del-riesgo"));

            eliminarRiesgo(index);

        });

    });

}

// =====================================
// ELIMINAR
// =====================================

function eliminarRiesgo(index){

    if(!confirm("¿Eliminar este riesgo?")){
        return;
    }

    riesgosModel.riesgos.splice(index, 1);

    renderRiesgos();

}

// =====================================
// GUARDAR
// =====================================

function guardarRiesgos(){

    MGA.updateModel(
        riesgosProjectId,
        {
            riesgos:
            riesgosModel.riesgos || [],

            checklist: {
                riesgosIdentificados:
                (riesgosModel.riesgos || []).length > 0
            }
        }
    );

    riesgosProject =
    StorageAPI.getProjectById(riesgosProjectId);

    riesgosModel =
    MGA.getModel(riesgosProject);

    alert("Matriz de riesgos guardada correctamente.");

}

// =====================================
// HELPERS DOM
// =====================================

function getValue(id){

    const el =
    document.getElementById(id);

    return el
        ? String(el.value || "").trim()
        : "";

}

function setValue(id, value){

    const el =
    document.getElementById(id);

    if(el){
        el.value =
        value || "";
    }

}

function limpiarFormularioRiesgo(){

    setValue("descripcionRiesgo", "");
    setValue("mitigacionRiesgo", "");
    setValue("responsableRiesgo", "");

    const tipo =
    document.getElementById("tipoRiesgo");

    if(tipo){
        tipo.value =
        "Técnico";
    }

    const prob =
    document.getElementById("probabilidadRiesgo");

    if(prob){
        prob.value =
        "Baja";
    }

    const imp =
    document.getElementById("impactoRiesgo");

    if(imp){
        imp.value =
        "Bajo";
    }

}

function escapeHtml(value){

    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
