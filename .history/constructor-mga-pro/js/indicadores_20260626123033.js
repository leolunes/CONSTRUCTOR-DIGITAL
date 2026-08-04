// =====================================
// INDICADORES.JS - CONSTRUCTOR MGA PRO
// Integrado con MotorCadenaValor
// =====================================

let indicadoresProjectId = "";
let indicadoresProject = null;
let indicadoresModel = null;

document.addEventListener("DOMContentLoaded", () => {

    indicadoresProjectId =
    MGA.getProjectIdFromUrl();

    indicadoresProject =
    MGA.getProject(indicadoresProjectId);

    if(!indicadoresProject){
        return;
    }

    indicadoresModel =
    MGA.getModel(indicadoresProject);

    asegurarModeloIndicadores();

    configurarLinks();
    bindEventos();
    renderTabla();
    renderResumenIndicadores();

});

// =====================================
// ASEGURAR MODELO
// =====================================

function asegurarModeloIndicadores(){

    if(!indicadoresModel.indicadores){
        indicadoresModel.indicadores = {};
    }

    ["producto", "resultado", "gestion", "impacto"].forEach(tipo => {

        if(!Array.isArray(indicadoresModel.indicadores[tipo])){
            indicadoresModel.indicadores[tipo] = [];
        }

    });

    if(!indicadoresModel.cadenaValor){
        indicadoresModel.cadenaValor = {};
    }

    if(!Array.isArray(indicadoresModel.cadenaValor.productos)){
        indicadoresModel.cadenaValor.productos = [];
    }

    if(!Array.isArray(indicadoresModel.cadenaValor.actividades)){
        indicadoresModel.cadenaValor.actividades = [];
    }

}

// =====================================
// LINKS
// =====================================

function configurarLinks(){

    const id =
    encodeURIComponent(indicadoresProjectId);

    const rutas =
    {
        btnVolverProyecto:
        `proyecto-detalle.html?projectId=${id}`,

        btnProyecto:
        `proyecto-detalle.html?projectId=${id}`,

        btnCadenaValor:
        `cadena-valor.html?projectId=${id}`,

        btnRiesgos:
        `riesgos.html?projectId=${id}`,

        btnCronograma:
        `cronograma.html?projectId=${id}`
    };

    Object.entries(rutas).forEach(([k, v]) => {

        const e =
        document.getElementById(k);

        if(e){
            e.href = v;
        }

    });

    const s =
    document.getElementById("indicadoresSub");

    if(s){
        s.textContent =
        (indicadoresProject.name || "Proyecto") + " · Indicadores";
    }

}

// =====================================
// EVENTOS
// =====================================

function bindEventos(){

    const form =
    document.getElementById("formIndicador");

    if(form){

        form.addEventListener("submit", (e) => {

            e.preventDefault();

            agregarIndicador();

        });

    }

    const btnGuardar =
    document.getElementById("btnGuardarIndicadoresTop");

    if(btnGuardar){
        btnGuardar.onclick =
        guardar;
    }

    const btnSugerir =
    document.getElementById("btnSugerirIndicadores");

    if(btnSugerir){
        btnSugerir.onclick =
        sugerirDesdeCadena;
    }

    const btnGestion =
    document.getElementById("btnIndicadoresGestion");

    if(btnGestion){
        btnGestion.onclick =
        agregarIndicadoresGestion;
    }

    const btnLimpiar =
    document.getElementById("btnLimpiarIndicadores");

    if(btnLimpiar){

        btnLimpiar.onclick =
        () => {

            if(!confirm("¿Desea limpiar todos los indicadores registrados? Esta acción solo se guardará cuando presione Guardar.")){
                return;
            }

            indicadoresModel.indicadores =
            {
                producto: [],
                resultado: [],
                gestion: [],
                impacto: []
            };

            renderTabla();
            renderResumenIndicadores();

        };

    }

}

// =====================================
// AGREGAR INDICADOR MANUAL
// =====================================

function agregarIndicador(){

    asegurarModeloIndicadores();

    const tipo =
    val("tipoIndicador");

    const ind =
    crearIndicador(tipo);

    ind.nombre =
    val("nombreIndicador");

    ind.descripcion =
    val("descripcionIndicador");

    ind.unidadMedida =
    val("unidadIndicador");

    ind.fuenteVerificacion =
    val("fuenteIndicador");

    ind.lineaBase =
    safeNum(val("lineaBaseIndicador"), 0);

    ind.meta =
    safeNum(val("metaIndicador"), 0);

    if(!ind.nombre){
        alert("Debe escribir el nombre del indicador.");
        return;
    }

    if(!indicadoresModel.indicadores[tipo]){
        indicadoresModel.indicadores[tipo] = [];
    }

    indicadoresModel.indicadores[tipo].push(ind);

    limpiarFormulario();

    renderTabla();
    renderResumenIndicadores();

}

function crearIndicador(tipo){

    if(window.MGA && typeof MGA.newIndicador === "function"){
        return MGA.newIndicador(tipo);
    }

    return {
        id:
        generarId("ind"),

        tipo:
        tipo,

        nombre:
        "",

        descripcion:
        "",

        unidadMedida:
        "",

        lineaBase:
        0,

        meta:
        0,

        fuenteVerificacion:
        ""
    };

}

// =====================================
// SUGERIR DESDE CADENA DE VALOR
// =====================================

function sugerirDesdeCadena(){

    asegurarModeloIndicadores();

    const productos =
    indicadoresModel.cadenaValor.productos || [];

    const actividades =
    indicadoresModel.cadenaValor.actividades || [];

    if(!productos.length){
        alert("Primero registre productos en la Cadena de Valor.");
        return;
    }

    let propuesta = null;

    if(window.MotorCadenaValor && typeof MotorCadenaValor.generarIndicadores === "function"){

        propuesta =
        MotorCadenaValor.generarIndicadores(
            indicadoresModel.cadenaValor,
            indicadoresModel
        );

    }else{

        propuesta =
        generarIndicadoresBasicos(productos, actividades);

    }

    fusionarIndicadores(propuesta);

    renderTabla();
    renderResumenIndicadores();

    alert("Se generaron indicadores a partir de la Cadena de Valor.");

}

function generarIndicadoresBasicos(productos, actividades){

    const indicadores =
    {
        producto:
        [],

        resultado:
        [],

        gestion:
        [],

        impacto:
        []
    };

    productos.forEach(p => {

        indicadores.producto.push({
            id:
            generarId("ind"),

            tipo:
            "producto",

            nombre:
            p.nombre || "",

            descripcion:
            p.descripcion || `Mide la entrega del producto: ${p.nombre || ""}`,

            unidadMedida:
            p.unidadMedida || "Unidad",

            fuenteVerificacion:
            "Acta de recibo, informe de supervisión o registro administrativo.",

            lineaBase:
            0,

            meta:
            safeNum(p.meta, 0)
        });

    });

    if(productos.length){

        indicadores.resultado.push({
            id:
            generarId("ind"),

            tipo:
            "resultado",

            nombre:
            "Población beneficiada con el proyecto",

            descripcion:
            "Mide la población que recibe los beneficios directos o indirectos del proyecto.",

            unidadMedida:
            "Personas",

            fuenteVerificacion:
            "Registro de beneficiarios, informes de ejecución o base administrativa.",

            lineaBase:
            0,

            meta:
            0
        });

    }

    if(actividades.length){

        indicadores.gestion.push({
            id:
            generarId("ind"),

            tipo:
            "gestion",

            nombre:
            "Avance físico del proyecto",

            descripcion:
            "Mide el porcentaje de avance en la ejecución de actividades programadas.",

            unidadMedida:
            "Porcentaje",

            fuenteVerificacion:
            "Informes de supervisión, cronograma de ejecución y actas de seguimiento.",

            lineaBase:
            0,

            meta:
            100
        });

        indicadores.gestion.push({
            id:
            generarId("ind"),

            tipo:
            "gestion",

            nombre:
            "Avance financiero del proyecto",

            descripcion:
            "Mide el porcentaje de ejecución financiera frente al presupuesto programado.",

            unidadMedida:
            "Porcentaje",

            fuenteVerificacion:
            "Informes financieros, actas de pago y reportes presupuestales.",

            lineaBase:
            0,

            meta:
            100
        });

    }

    indicadores.impacto.push({
        id:
        generarId("ind"),

        tipo:
        "impacto",

        nombre:
        "Mejoramiento de condiciones de bienestar",

        descripcion:
        "Mide la contribución del proyecto al mejoramiento de las condiciones de bienestar de la población objetivo.",

        unidadMedida:
        "Porcentaje",

        fuenteVerificacion:
        "Encuestas, mediciones posteriores o informes de evaluación.",

        lineaBase:
        0,

        meta:
        0
    });

    return indicadores;

}

function fusionarIndicadores(propuesta){

    if(!propuesta){
        return;
    }

    ["producto", "resultado", "gestion", "impacto"].forEach(tipo => {

        const nuevos =
        propuesta[tipo] || [];

        nuevos.forEach(ind => {

            const existe =
            (indicadoresModel.indicadores[tipo] || [])
            .some(i =>
                normalizarTexto(i.nombre) === normalizarTexto(ind.nombre)
            );

            if(existe){
                return;
            }

            indicadoresModel.indicadores[tipo].push({
                id:
                ind.id || generarId("ind"),

                tipo:
                ind.tipo || tipo,

                nombre:
                ind.nombre || "",

                descripcion:
                ind.descripcion || "",

                unidadMedida:
                ind.unidadMedida || ind.unidad || "",

                fuenteVerificacion:
                ind.fuenteVerificacion || ind.fuente || "",

                lineaBase:
                safeNum(ind.lineaBase, 0),

                meta:
                safeNum(ind.meta, 0)
            });

        });

    });

}

// =====================================
// INDICADORES DE GESTIÓN
// =====================================

function agregarIndicadoresGestion(){

    asegurarModeloIndicadores();

    const actividades =
    indicadoresModel.cadenaValor.actividades || [];

    const propuesta =
    generarIndicadoresBasicos(
        indicadoresModel.cadenaValor.productos || [],
        actividades.length ? actividades : [{ nombre: "Actividad" }]
    );

    fusionarIndicadores({
        producto: [],
        resultado: [],
        gestion: propuesta.gestion || [],
        impacto: []
    });

    renderTabla();
    renderResumenIndicadores();

    alert("Indicadores de gestión agregados.");

}

// =====================================
// TABLA
// =====================================

function renderTabla(){

    asegurarModeloIndicadores();

    const body =
    document.getElementById("indicadoresBody");

    if(!body){
        return;
    }

    const tipos =
    [
        "producto",
        "resultado",
        "gestion",
        "impacto"
    ];

    let html =
    "";

    tipos.forEach(tipo => {

        (indicadoresModel.indicadores[tipo] || []).forEach((i, index) => {

            html +=
            `
            <tr>
              <td>${esc(tipo)}</td>
              <td><b>${esc(i.nombre)}</b><br><span class="muted small">${esc(i.descripcion)}</span></td>
              <td>${esc(i.unidadMedida)}</td>
              <td>${esc(String(i.lineaBase ?? 0))}</td>
              <td>${esc(String(i.meta ?? 0))}</td>
              <td>${esc(i.fuenteVerificacion)}</td>
              <td>
                <button class="btn danger" onclick="eliminarIndicador('${tipo}',${index})">Eliminar</button>
              </td>
            </tr>
            `;

        });

    });

    if(!html){
        html =
        `<tr><td colspan="7" class="muted small">No existen indicadores registrados.</td></tr>`;
    }

    body.innerHTML =
    html;

}

function eliminarIndicador(tipo, index){

    if(!confirm("¿Eliminar indicador?")){
        return;
    }

    indicadoresModel.indicadores[tipo].splice(index, 1);

    renderTabla();
    renderResumenIndicadores();

}

// =====================================
// RESUMEN
// =====================================

function renderResumenIndicadores(){

    const cont =
    document.getElementById("resumenIndicadores");

    if(!cont){
        return;
    }

    const resumen =
    {
        producto:
        (indicadoresModel.indicadores.producto || []).length,

        resultado:
        (indicadoresModel.indicadores.resultado || []).length,

        gestion:
        (indicadoresModel.indicadores.gestion || []).length,

        impacto:
        (indicadoresModel.indicadores.impacto || []).length
    };

    const total =
    totalIndicadores();

    cont.innerHTML =
    `
    <div class="grid kpis">
      <div class="card item">
        <div class="name">Producto</div>
        <h2>${resumen.producto}</h2>
      </div>

      <div class="card item">
        <div class="name">Resultado</div>
        <h2>${resumen.resultado}</h2>
      </div>

      <div class="card item">
        <div class="name">Gestión</div>
        <h2>${resumen.gestion}</h2>
      </div>

      <div class="card item">
        <div class="name">Impacto</div>
        <h2>${resumen.impacto}</h2>
      </div>
    </div>

    <div class="item" style="margin-top:12px">
      <div class="row space">
        <div><b>Total de indicadores</b></div>
        <div><b>${total}</b></div>
      </div>
      <div class="muted small">
        Los indicadores se guardan dentro del modelo MGA del proyecto y alimentan los documentos finales.
      </div>
    </div>
    `;

}

// =====================================
// GUARDAR
// =====================================

function guardar(){

    asegurarModeloIndicadores();

    MGA.updateModel(indicadoresProjectId, {
        indicadores:
        indicadoresModel.indicadores,

        checklist: {
            indicadoresConMeta:
            validarIndicadoresConMeta(),

            indicadoresRegistrados:
            totalIndicadores() > 0
        }
    });

    indicadoresProject =
    StorageAPI.getProjectById(indicadoresProjectId);

    indicadoresModel =
    MGA.getModel(indicadoresProject);

    asegurarModeloIndicadores();

    alert("Indicadores guardados correctamente.");

}

// =====================================
// VALIDACIONES
// =====================================

function totalIndicadores(){

    return ["producto", "resultado", "gestion", "impacto"]
    .reduce((t, k) => t + (indicadoresModel.indicadores[k] || []).length, 0);

}

function validarIndicadoresConMeta(){

    const todos =
    ["producto", "resultado", "gestion", "impacto"]
    .flatMap(k => indicadoresModel.indicadores[k] || []);

    if(!todos.length){
        return false;
    }

    return todos.every(i =>
        i.nombre &&
        i.unidadMedida &&
        i.fuenteVerificacion !== undefined &&
        i.meta !== undefined
    );

}

// =====================================
// FORMULARIO
// =====================================

function limpiarFormulario(){

    [
        "nombreIndicador",
        "descripcionIndicador",
        "unidadIndicador",
        "fuenteIndicador",
        "lineaBaseIndicador",
        "metaIndicador"
    ].forEach(id => {

        const el =
        document.getElementById(id);

        if(el){
            el.value = "";
        }

    });

    const tipo =
    document.getElementById("tipoIndicador");

    if(tipo){
        tipo.value = "producto";
    }

}

// =====================================
// HELPERS
// =====================================

function val(id){

    const el =
    document.getElementById(id);

    return String(el?.value || "").trim();

}

function safeNum(value, fallback = 0){

    if(window.MGA && typeof MGA.safeNum === "function"){
        return MGA.safeNum(value, fallback);
    }

    const n =
    Number(String(value || "").replaceAll(".", "").replace(",", "."));

    return Number.isFinite(n) ? n : fallback;

}

function generarId(prefix){

    if(window.MGA && typeof MGA.uid === "function"){
        return MGA.uid(prefix);
    }

    return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

}

function normalizarTexto(texto){

    return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

}

function esc(v){

    return String(v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}
