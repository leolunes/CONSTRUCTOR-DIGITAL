// =====================================
// RIESGOS.JS - CONSTRUCTOR MGA PRO
// Integrado con asistencia inteligente
// =====================================

let riesgosProjectId = "";
let riesgosProject = null;
let riesgosModel = null;

document.addEventListener("DOMContentLoaded", () => {
    riesgosProjectId = MGA.getProjectIdFromUrl();
    riesgosProject = MGA.getProject(riesgosProjectId);
    if(!riesgosProject) return;

    riesgosModel = MGA.getModel(riesgosProject);
    asegurarModeloRiesgos();
    configurarLinksRiesgos();
    bindEventosRiesgos();
    renderRiesgos();
    renderResumenRiesgos();
});

// =====================================
// ASEGURAR MODELO
// =====================================

function asegurarModeloRiesgos(){
    if(!Array.isArray(riesgosModel.riesgos)) riesgosModel.riesgos = [];
    if(!riesgosModel.diagnostico) riesgosModel.diagnostico = {};
    if(!riesgosModel.cadenaValor) riesgosModel.cadenaValor = {};
    if(!Array.isArray(riesgosModel.cadenaValor.productos)) riesgosModel.cadenaValor.productos = [];
    if(!Array.isArray(riesgosModel.cadenaValor.actividades)) riesgosModel.cadenaValor.actividades = [];
}

// =====================================
// LINKS
// =====================================

function configurarLinksRiesgos(){
    const id = encodeURIComponent(riesgosProjectId);

    const rutas = {
        btnVolverProyecto: `proyecto-detalle.html?projectId=${id}`,
        btnProyecto: `proyecto-detalle.html?projectId=${id}`,
        btnCadenaValor: `cadena-valor.html?projectId=${id}`,
        btnIndicadores: `indicadores.html?projectId=${id}`,
        btnCronograma: `cronograma.html?projectId=${id}`
    };

    Object.keys(rutas).forEach(key => {
        const el = document.getElementById(key);
        if(el) el.href = rutas[key];
    });

    const sub = document.getElementById("riesgosSub");
    if(sub) sub.textContent = `${riesgosProject.name || "Proyecto"} · Matriz de Riesgos`;
}

// =====================================
// EVENTOS
// =====================================

function bindEventosRiesgos(){
    const form = document.getElementById("formRiesgo");
    if(form){
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            agregarRiesgo();
        });
    }

    const btnGuardar = document.getElementById("btnGuardarRiesgosTop");
    if(btnGuardar) btnGuardar.addEventListener("click", guardarRiesgos);

    const btnSugerir = document.getElementById("btnSugerirRiesgos");
    if(btnSugerir) btnSugerir.addEventListener("click", sugerirRiesgosTipo);

    agregarBotonRiesgosInteligentes();
}

// =====================================
// BOTÓN ASISTENTE
// =====================================

function agregarBotonRiesgosInteligentes(){
    if(document.getElementById("btnSugerirRiesgosInteligentes")) return;

    const btnBase = document.getElementById("btnSugerirRiesgos");
    if(!btnBase || !btnBase.parentElement) return;

    const btn = document.createElement("button");
    btn.className = "btn primary";
    btn.id = "btnSugerirRiesgosInteligentes";
    btn.type = "button";
    btn.textContent = "Generar riesgos inteligentes";
    btn.onclick = sugerirRiesgosInteligentes;

    btnBase.parentElement.appendChild(btn);
}

// =====================================
// AGREGAR RIESGO
// =====================================

function agregarRiesgo(){
    asegurarModeloRiesgos();

    const riesgo = crearRiesgo();

    riesgo.tipo = getValue("tipoRiesgo");
    riesgo.descripcion = getValue("descripcionRiesgo");
    riesgo.probabilidad = getValue("probabilidadRiesgo");
    riesgo.impacto = getValue("impactoRiesgo");
    riesgo.nivel = calcularNivelRiesgo(riesgo.probabilidad, riesgo.impacto);
    riesgo.medidaMitigacion = getValue("mitigacionRiesgo");
    riesgo.responsable = getValue("responsableRiesgo");

    if(!riesgo.descripcion){
        alert("Debe escribir la descripción del riesgo.");
        return;
    }

    riesgosModel.riesgos.push(riesgo);
    limpiarFormularioRiesgo();
    renderRiesgos();
    renderResumenRiesgos();
}

function crearRiesgo(){
    if(window.MGA && typeof MGA.newRiesgo === "function"){
        return MGA.newRiesgo();
    }

    return {
        id: generarId("riesgo"),
        tipo: "",
        descripcion: "",
        probabilidad: "Baja",
        impacto: "Bajo",
        nivel: "Bajo",
        medidaMitigacion: "",
        responsable: ""
    };
}

// =====================================
// RIESGOS INTELIGENTES
// =====================================

function sugerirRiesgosInteligentes(){
    asegurarModeloRiesgos();
    const sugeridos = generarRiesgosDesdeModelo();
    agregarRiesgosSinDuplicar(sugeridos);
}

function generarRiesgosDesdeModelo(){
    const d = riesgosModel.diagnostico || {};
    const cv = riesgosModel.cadenaValor || {};

    const texto = [
        riesgosProject.name,
        riesgosProject.entity,
        riesgosProject.location,
        d.situacionActual,
        d.problemaCentral,
        d.justificacion,
        d.analisisTerritorial,
        d.ofertaActual,
        d.demandaActual,
        d.brecha,
        JSON.stringify(cv.productos || []),
        JSON.stringify(cv.actividades || [])
    ].filter(Boolean).join(" ").toLowerCase();

    const riesgos = riesgosBase();

    if(texto.includes("infraestructura") || texto.includes("obra") || texto.includes("constru") || texto.includes("adecu") || texto.includes("centro")){
        riesgos.push({
            tipo: "Técnico",
            descripcion: "Inconsistencias entre estudios, diseños, cantidades de obra, especificaciones técnicas o condiciones reales del sitio de intervención.",
            probabilidad: "Media",
            impacto: "Alto",
            medidaMitigacion: "Validar estudios, diseños, presupuesto, cantidades, especificaciones y condiciones del terreno antes de iniciar la ejecución.",
            responsable: "Equipo técnico / entidad ejecutora / supervisión"
        });

        riesgos.push({
            tipo: "Predial",
            descripcion: "Retrasos por falta de disponibilidad, saneamiento, titularidad, permisos de uso o condiciones jurídicas del predio de intervención.",
            probabilidad: "Media",
            impacto: "Alto",
            medidaMitigacion: "Verificar la disponibilidad jurídica, técnica y física del predio antes de iniciar la etapa contractual.",
            responsable: "Entidad formuladora / área jurídica / oficina de planeación"
        });
    }

    if(texto.includes("adulto mayor") || texto.includes("población") || texto.includes("comunidad") || texto.includes("beneficiarios")){
        riesgos.push({
            tipo: "Social",
            descripcion: "Baja participación, apropiación o asistencia de la población beneficiaria durante la ejecución y operación del proyecto.",
            probabilidad: "Media",
            impacto: "Medio",
            medidaMitigacion: "Implementar estrategia de socialización, convocatoria, participación comunitaria y seguimiento a beneficiarios.",
            responsable: "Equipo social / entidad ejecutora"
        });
    }

    if(texto.includes("ambiental") || texto.includes("residuos") || texto.includes("obra") || texto.includes("constru")){
        riesgos.push({
            tipo: "Ambiental",
            descripcion: "Generación de impactos ambientales asociados a residuos, ruido, polvo, manejo de materiales o intervención del entorno.",
            probabilidad: "Media",
            impacto: "Medio",
            medidaMitigacion: "Aplicar plan de manejo ambiental, buenas prácticas de obra, manejo de residuos y cumplimiento de permisos aplicables.",
            responsable: "Contratista / supervisión / autoridad competente cuando aplique"
        });
    }

    if(texto.includes("servicio") || texto.includes("atención") || texto.includes("operación") || texto.includes("bienestar")){
        riesgos.push({
            tipo: "Operativo",
            descripcion: "Dificultades para garantizar la operación, continuidad o sostenibilidad de los servicios previstos una vez finalizada la inversión.",
            probabilidad: "Media",
            impacto: "Alto",
            medidaMitigacion: "Definir responsable de operación, costos de sostenibilidad, esquema institucional y plan de seguimiento posterior a la entrega.",
            responsable: "Entidad responsable de la operación"
        });
    }

    return riesgos;
}

function riesgosBase(){
    return [
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
            descripcion: "Demoras asociadas a trámites contractuales, permisos, autorizaciones, licencias o requisitos normativos.",
            probabilidad: "Media",
            impacto: "Medio",
            medidaMitigacion: "Verificar requisitos jurídicos, contractuales, normativos y permisos desde la etapa de estructuración del proyecto.",
            responsable: "Área jurídica / entidad ejecutora"
        },
        {
            tipo: "Administrativo",
            descripcion: "Retrasos en procesos administrativos, coordinación institucional, contratación, supervisión o toma de decisiones.",
            probabilidad: "Media",
            impacto: "Medio",
            medidaMitigacion: "Definir cronograma institucional, responsables, rutas de aprobación y mecanismos de seguimiento periódico.",
            responsable: "Entidad ejecutora / supervisión"
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
}

// =====================================
// SUGERIR RIESGOS TIPO
// =====================================

function sugerirRiesgosTipo(){
    asegurarModeloRiesgos();
    agregarRiesgosSinDuplicar(riesgosBase());
}

function agregarRiesgosSinDuplicar(sugeridos){
    let agregados = 0;

    sugeridos.forEach(item => {
        const existe = riesgosModel.riesgos.some(r =>
            normalizar(r.descripcion) === normalizar(item.descripcion)
        );

        if(existe) return;

        const riesgo = crearRiesgo();

        riesgo.tipo = item.tipo;
        riesgo.descripcion = item.descripcion;
        riesgo.probabilidad = item.probabilidad;
        riesgo.impacto = item.impacto;
        riesgo.nivel = calcularNivelRiesgo(item.probabilidad, item.impacto);
        riesgo.medidaMitigacion = item.medidaMitigacion;
        riesgo.responsable = item.responsable;

        riesgosModel.riesgos.push(riesgo);
        agregados++;
    });

    renderRiesgos();
    renderResumenRiesgos();

    alert(`Riesgos sugeridos agregados: ${agregados}`);
}

// =====================================
// CALCULAR NIVEL
// =====================================

function calcularNivelRiesgo(probabilidad, impacto){
    const p = valorProbabilidad(probabilidad);
    const i = valorImpacto(impacto);
    const total = p * i;

    if(total >= 6) return "Alto";
    if(total >= 3) return "Medio";
    return "Bajo";
}

function valorProbabilidad(value){
    const v = String(value || "").toLowerCase();
    if(v.includes("alta")) return 3;
    if(v.includes("media")) return 2;
    return 1;
}

function valorImpacto(value){
    const v = String(value || "").toLowerCase();
    if(v.includes("alto")) return 3;
    if(v.includes("medio")) return 2;
    return 1;
}

// =====================================
// RENDER TABLA
// =====================================

function renderRiesgos(){
    const body = document.getElementById("riesgosBody");
    if(!body) return;

    const riesgos = riesgosModel.riesgos || [];

    if(!riesgos.length){
        body.innerHTML = `<tr><td colspan="8" class="muted small">No existen riesgos registrados.</td></tr>`;
        return;
    }

    body.innerHTML = riesgos.map((r, index) => `
        <tr>
          <td>${escapeHtml(r.tipo || "")}</td>
          <td>${escapeHtml(r.descripcion || "")}</td>
          <td>${escapeHtml(r.probabilidad || "")}</td>
          <td>${escapeHtml(r.impacto || "")}</td>
          <td><b>${escapeHtml(r.nivel || "")}</b></td>
          <td>${escapeHtml(r.medidaMitigacion || r.mitigacion || "")}</td>
          <td>${escapeHtml(r.responsable || "")}</td>
          <td>
            <button class="btn danger" type="button" data-del-riesgo="${index}">Eliminar</button>
          </td>
        </tr>
    `).join("");

    body.querySelectorAll("[data-del-riesgo]").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = Number(btn.getAttribute("data-del-riesgo"));
            eliminarRiesgo(index);
        });
    });
}

// =====================================
// RESUMEN
// =====================================

function renderResumenRiesgos(){
    let cont = document.getElementById("resumenRiesgos");

    if(!cont){
        const main = document.querySelector("main.container");
        if(!main) return;

        const section = document.createElement("section");
        section.className = "card";
        section.style.marginTop = "14px";
        section.innerHTML = `
        <div class="cardhead">
          <h2>Resumen de riesgos</h2>
          <p class="muted small">Consolidado por nivel y tipo.</p>
        </div>
        <div id="resumenRiesgos"></div>
        `;

        main.appendChild(section);
        cont = document.getElementById("resumenRiesgos");
    }

    const riesgos = riesgosModel.riesgos || [];
    const alto = riesgos.filter(r => r.nivel === "Alto").length;
    const medio = riesgos.filter(r => r.nivel === "Medio").length;
    const bajo = riesgos.filter(r => r.nivel === "Bajo").length;

    cont.innerHTML = `
    <div class="grid kpis">
      <div class="card item"><div class="name">Total</div><h2>${riesgos.length}</h2></div>
      <div class="card item"><div class="name">Alto</div><h2>${alto}</h2></div>
      <div class="card item"><div class="name">Medio</div><h2>${medio}</h2></div>
      <div class="card item"><div class="name">Bajo</div><h2>${bajo}</h2></div>
    </div>
    `;
}

// =====================================
// ELIMINAR
// =====================================

function eliminarRiesgo(index){
    if(!confirm("¿Eliminar este riesgo?")) return;
    riesgosModel.riesgos.splice(index, 1);
    renderRiesgos();
    renderResumenRiesgos();
}

// =====================================
// GUARDAR
// =====================================

function guardarRiesgos(){
    asegurarModeloRiesgos();

    MGA.updateModel(
        riesgosProjectId,
        {
            riesgos: riesgosModel.riesgos || [],

            checklist: {
                riesgosIdentificados: (riesgosModel.riesgos || []).length > 0,
                riesgosConMitigacion: validarRiesgosConMitigacion()
            }
        }
    );

    riesgosProject = StorageAPI.getProjectById(riesgosProjectId);
    riesgosModel = MGA.getModel(riesgosProject);
    asegurarModeloRiesgos();

    alert("Matriz de riesgos guardada correctamente.");
}

function validarRiesgosConMitigacion(){
    const riesgos = riesgosModel.riesgos || [];
    if(!riesgos.length) return false;

    return riesgos.every(r =>
        r.descripcion &&
        r.probabilidad &&
        r.impacto &&
        (r.medidaMitigacion || r.mitigacion)
    );
}

// =====================================
// HELPERS DOM
// =====================================

function getValue(id){
    const el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
}

function setValue(id, value){
    const el = document.getElementById(id);
    if(el) el.value = value || "";
}

function limpiarFormularioRiesgo(){
    setValue("descripcionRiesgo", "");
    setValue("mitigacionRiesgo", "");
    setValue("responsableRiesgo", "");

    const tipo = document.getElementById("tipoRiesgo");
    if(tipo) tipo.value = "Técnico";

    const prob = document.getElementById("probabilidadRiesgo");
    if(prob) prob.value = "Baja";

    const imp = document.getElementById("impactoRiesgo");
    if(imp) imp.value = "Bajo";
}

function generarId(prefix){
    if(window.MGA && typeof MGA.uid === "function"){
        return MGA.uid(prefix);
    }

    return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function normalizar(value){
    return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function escapeHtml(value){
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
