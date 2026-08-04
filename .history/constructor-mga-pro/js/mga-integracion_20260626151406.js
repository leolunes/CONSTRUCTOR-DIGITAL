// =====================================
// MGA-INTEGRACION.JS - CONSTRUCTOR MGA PRO
// Integración Actividades MGA ↔ Presupuesto PRO
// =====================================

let mgaProjectId = "";
let mgaProject = null;
let mgaModel = null;

// =====================================
// INICIALIZACIÓN
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    mgaProjectId =
    MGA.getProjectIdFromUrl();

    mgaProject =
    MGA.getProject(mgaProjectId);

    if(!mgaProject){
        return;
    }

    mgaModel =
    MGA.getModel(mgaProject);

    asegurarModeloMGAIntegracion();

    configurarLinksMGA();
    cargarSelectsMGA();
    bindEventosMGA();
    renderMGA();

});

// =====================================
// ASEGURAR MODELO
// =====================================

function asegurarModeloMGAIntegracion(){

    if(!mgaModel.presupuestoMGA){
        mgaModel.presupuestoMGA = {};
    }

    if(!Array.isArray(mgaModel.presupuestoMGA.relacionItemsPresupuesto)){
        mgaModel.presupuestoMGA.relacionItemsPresupuesto = [];
    }

    if(!Array.isArray(mgaModel.presupuestoMGA.costosPorActividad)){
        mgaModel.presupuestoMGA.costosPorActividad = [];
    }

    if(!Array.isArray(mgaModel.presupuestoMGA.costosPorProducto)){
        mgaModel.presupuestoMGA.costosPorProducto = [];
    }

    if(!mgaModel.cadenaValor){
        mgaModel.cadenaValor = {};
    }

    if(!Array.isArray(mgaModel.cadenaValor.actividades)){
        mgaModel.cadenaValor.actividades = [];
    }

    if(!Array.isArray(mgaModel.cadenaValor.productos)){
        mgaModel.cadenaValor.productos = [];
    }

    if(!Array.isArray(mgaProject.items)){
        mgaProject.items = [];
    }

}

// =====================================
// LINKS
// =====================================

function configurarLinksMGA(){

    const id =
    encodeURIComponent(mgaProjectId);

    const rutas =
    {
        btnVolverProyecto:
        `proyecto-detalle.html?projectId=${id}`,

        btnProyecto:
        `proyecto-detalle.html?projectId=${id}`,

        btnDiagnostico:
        `diagnostico.html?projectId=${id}`,

        btnCadenaValor:
        `cadena-valor.html?projectId=${id}`,

        btnDocumentos:
        `documentos.html?projectId=${id}`
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
    document.getElementById("mgaSub");

    if(sub){
        sub.textContent =
        `${mgaProject.name || "Proyecto"} · Integración general`;
    }

}

// =====================================
// EVENTOS
// =====================================

function bindEventosMGA(){

    const btnVincular =
    document.getElementById("btnVincularItem");

    if(btnVincular){
        btnVincular.onclick =
        vincularItem;
    }

    const btnAuto =
    document.getElementById("btnAutoVincular");

    if(btnAuto){
        btnAuto.onclick =
        autovincularItems;
    }

    const btnGuardar =
    document.getElementById("btnGuardarMGA");

    if(btnGuardar){
        btnGuardar.onclick =
        guardarIntegracionMGA;
    }

}

// =====================================
// SELECTS
// =====================================

function cargarSelectsMGA(){

    cargarSelectActividades();
    cargarSelectItems();

}

function cargarSelectActividades(){

    const sel =
    document.getElementById("selActividadMGA");

    if(!sel){
        return;
    }

    const actividades =
    mgaModel.cadenaValor.actividades || [];

    if(!actividades.length){

        sel.innerHTML =
        `<option value="">No hay actividades MGA</option>`;

        return;

    }

    sel.innerHTML =
    `<option value="">Seleccione actividad...</option>` +
    actividades.map(a => {

        const producto =
        buscarProductoPorActividad(a.id);

        return `
        <option value="${escapeHtml(a.id)}">
            ${escapeHtml(a.nombre || "")}${producto ? " · " + escapeHtml(producto) : ""}
        </option>
        `;

    }).join("");

}

function cargarSelectItems(){

    const sel =
    document.getElementById("selItemPresupuesto");

    if(!sel){
        return;
    }

    const items =
    mgaProject.items || [];

    if(!items.length){

        sel.innerHTML =
        `<option value="">No hay ítems presupuestales</option>`;

        return;

    }

    sel.innerHTML =
    `<option value="">Seleccione ítem...</option>` +
    items.map(item => {

        const codigo =
        item.code || item.codigo || "";

        const desc =
        item.desc || item.descripcion || item.name || "";

        const total =
        calcularTotalItem(item);

        return `
        <option value="${escapeHtml(item.id)}">
            ${escapeHtml(codigo)} · ${escapeHtml(desc)} · ${fmtMoney(total)}
        </option>
        `;

    }).join("");

}

// =====================================
// VINCULAR MANUAL
// =====================================

function vincularItem(){

    const actividadId =
    getValue("selActividadMGA");

    const itemId =
    getValue("selItemPresupuesto");

    if(!actividadId){
        alert("Seleccione una actividad MGA.");
        return;
    }

    if(!itemId){
        alert("Seleccione un ítem del presupuesto.");
        return;
    }

    const existe =
    mgaModel.presupuestoMGA.relacionItemsPresupuesto.some(v =>
        v.actividadId === actividadId &&
        v.itemId === itemId
    );

    if(existe){
        alert("Ese ítem ya está vinculado a la actividad seleccionada.");
        return;
    }

    const vinculo =
    crearVinculo(actividadId, itemId, "manual");

    mgaModel.presupuestoMGA.relacionItemsPresupuesto.push(vinculo);

    recalcularResumenMGA();
    renderMGA();

}

function crearVinculo(actividadId, itemId, origen){

    return {
        id:
        generarId("vin"),

        actividadId,
        itemId,

        origen:
        origen || "manual",

        creadoEn:
        new Date().toISOString()
    };

}

// =====================================
// AUTOVINCULAR
// =====================================

function autovincularItems(){

    asegurarModeloMGAIntegracion();

    if(!mgaModel.cadenaValor.actividades.length){
        alert("No existen actividades en la Cadena de Valor.");
        return;
    }

    if(!mgaProject.items.length){
        alert("No existen ítems presupuestales para vincular.");
        return;
    }

    let creados =
    0;

    if(window.MotorPresupuesto && typeof MotorPresupuesto.autovincularPorDescripcion === "function"){

        const resultado =
        MotorPresupuesto.autovincularPorDescripcion(
            mgaProject,
            mgaModel
        );

        if(resultado?.presupuestoMGA){

            const antes =
            mgaModel.presupuestoMGA.relacionItemsPresupuesto.length;

            mgaModel.presupuestoMGA =
            resultado.presupuestoMGA;

            const despues =
            mgaModel.presupuestoMGA.relacionItemsPresupuesto.length;

            creados =
            resultado.creados ?? Math.max(0, despues - antes);

        }

    }else{

        creados =
        autovincularBasico();

    }

    recalcularResumenMGA();
    renderMGA();

    alert(`Autovinculación finalizada. Vínculos creados: ${creados}`);

}

function autovincularBasico(){

    let creados =
    0;

    const actividades =
    mgaModel.cadenaValor.actividades || [];

    const items =
    mgaProject.items || [];

    actividades.forEach(act => {

        const palabras =
        extraerPalabrasClave(
            `${act.nombre || ""} ${act.descripcion || ""}`
        );

        items.forEach(item => {

            const textoItem =
            `${item.code || ""} ${item.desc || ""} ${item.descripcion || ""} ${item.name || ""}`
            .toLowerCase();

            const match =
            palabras.some(p =>
                textoItem.includes(p)
            );

            if(!match){
                return;
            }

            const existe =
            mgaModel.presupuestoMGA.relacionItemsPresupuesto.some(v =>
                v.actividadId === act.id &&
                v.itemId === item.id
            );

            if(existe){
                return;
            }

            mgaModel.presupuestoMGA.relacionItemsPresupuesto.push(
                crearVinculo(act.id, item.id, "autovinculacion")
            );

            creados++;

        });

    });

    return creados;

}

function extraerPalabrasClave(texto){

    const stop =
    [
        "actividad",
        "producto",
        "proyecto",
        "realizar",
        "ejecutar",
        "implementar",
        "para",
        "con",
        "del",
        "las",
        "los",
        "una",
        "uno"
    ];

    return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map(x => x.trim())
    .filter(x => x.length >= 5)
    .filter(x => !stop.includes(x));

}

// =====================================
// RENDER GENERAL
// =====================================

function renderMGA(){

    asegurarModeloMGAIntegracion();

    recalcularResumenMGA();

    renderKPIsMGA();
    renderVinculos();
    renderCostosActividad();
    renderChecklistMGA();

}

// =====================================
// KPIS
// =====================================

function renderKPIsMGA(){

    const cont =
    document.getElementById("mgaKpis");

    if(!cont){
        return;
    }

    const resumen =
    mgaModel.presupuestoMGA.resumen || {};

    const actividades =
    mgaModel.cadenaValor.actividades || [];

    const productos =
    mgaModel.cadenaValor.productos || [];

    const vinculos =
    mgaModel.presupuestoMGA.relacionItemsPresupuesto || [];

    cont.innerHTML =
    `
    <div class="card item">
      <div class="name">Productos MGA</div>
      <h2>${productos.length}</h2>
    </div>

    <div class="card item">
      <div class="name">Actividades MGA</div>
      <h2>${actividades.length}</h2>
    </div>

    <div class="card item">
      <div class="name">Ítems vinculados</div>
      <h2>${vinculos.length}</h2>
    </div>

    <div class="card item">
      <div class="name">Presupuesto vinculado</div>
      <h2>${resumen.porcentajeVinculado || 0}%</h2>
    </div>
    `;

}

// =====================================
// VÍNCULOS
// =====================================

function renderVinculos(){

    const body =
    document.getElementById("vinculosBody");

    if(!body){
        return;
    }

    const vinculos =
    mgaModel.presupuestoMGA.relacionItemsPresupuesto || [];

    if(!vinculos.length){

        body.innerHTML =
        `<tr><td colspan="8" class="muted small">No existen vínculos entre actividades MGA e ítems del presupuesto.</td></tr>`;

        return;

    }

    body.innerHTML =
    vinculos.map((v, index) => {

        const act =
        buscarActividad(v.actividadId);

        const item =
        buscarItem(v.itemId);

        if(!item){

            return `
            <tr>
              <td>${escapeHtml(act?.nombre || "Actividad no encontrada")}</td>
              <td colspan="6" class="muted small">Ítem no encontrado</td>
              <td><button class="btn danger" type="button" data-del-vinculo="${index}">Eliminar</button></td>
            </tr>
            `;

        }

        const codigo =
        item.code || item.codigo || "";

        const desc =
        item.desc || item.descripcion || item.name || "";

        const unidad =
        item.unit || item.unidad || "";

        const cantidad =
        Number(item.qty || item.cantidad || 0);

        const pu =
        Number(item.pu || item.precioUnitario || 0);

        const parcial =
        calcularTotalItem(item);

        return `
        <tr>
          <td>${escapeHtml(act?.nombre || "")}</td>
          <td>${escapeHtml(codigo)}</td>
          <td>${escapeHtml(desc)}</td>
          <td>${escapeHtml(unidad)}</td>
          <td>${cantidad}</td>
          <td>${fmtMoney(pu)}</td>
          <td>${fmtMoney(parcial)}</td>
          <td><button class="btn danger" type="button" data-del-vinculo="${index}">Eliminar</button></td>
        </tr>
        `;

    }).join("");

    body.querySelectorAll("[data-del-vinculo]").forEach(btn => {

        btn.onclick =
        () => {

            const index =
            Number(btn.getAttribute("data-del-vinculo"));

            eliminarVinculo(index);

        };

    });

}

function eliminarVinculo(index){

    if(!confirm("¿Eliminar este vínculo?")){
        return;
    }

    mgaModel.presupuestoMGA.relacionItemsPresupuesto.splice(index, 1);

    recalcularResumenMGA();
    renderMGA();

}

// =====================================
// COSTOS POR ACTIVIDAD
// =====================================

function renderCostosActividad(){

    const body =
    document.getElementById("costosActividadBody");

    if(!body){
        return;
    }

    const costos =
    mgaModel.presupuestoMGA.costosPorActividad || [];

    if(!costos.length){

        body.innerHTML =
        `<tr><td colspan="4" class="muted small">No existen costos calculados por actividad.</td></tr>`;

        return;

    }

    body.innerHTML =
    costos.map(c => {

        const producto =
        buscarProducto(c.productoId);

        return `
        <tr>
          <td>${escapeHtml(c.actividad || "")}</td>
          <td>${escapeHtml(producto?.nombre || "")}</td>
          <td>${Number(c.itemsVinculados || 0)}</td>
          <td style="text-align:right">${fmtMoney(c.costoDirecto || 0)}</td>
        </tr>
        `;

    }).join("");

}

// =====================================
// CHECKLIST
// =====================================

function renderChecklistMGA(){

    const cont =
    document.getElementById("checklistMGA");

    if(!cont){
        return;
    }

    const checks =
    generarChecklistMGA();

    cont.innerHTML =
    checks.map(c => {

        return `
        <div class="item" style="margin-bottom:8px">
          <div class="row space">
            <div>${c.ok ? "✅" : "⚠️"} ${escapeHtml(c.texto)}</div>
            <div class="muted small">${escapeHtml(c.detalle || "")}</div>
          </div>
        </div>
        `;

    }).join("");

}

function generarChecklistMGA(){

    const m =
    mgaModel;

    const resumen =
    m.presupuestoMGA?.resumen || {};

    return [
        {
            texto:
            "Diagnóstico con problema central",

            ok:
            !!m.diagnostico?.problemaCentral,

            detalle:
            m.diagnostico?.problemaCentral ? "Registrado" : "Pendiente"
        },
        {
            texto:
            "Árbol de objetivos con objetivo general",

            ok:
            !!m.arbolObjetivos?.objetivoGeneral,

            detalle:
            m.arbolObjetivos?.objetivoGeneral ? "Registrado" : "Pendiente"
        },
        {
            texto:
            "Cadena de valor con productos",

            ok:
            (m.cadenaValor?.productos || []).length > 0,

            detalle:
            `${(m.cadenaValor?.productos || []).length} producto(s)`
        },
        {
            texto:
            "Cadena de valor con actividades",

            ok:
            (m.cadenaValor?.actividades || []).length > 0,

            detalle:
            `${(m.cadenaValor?.actividades || []).length} actividad(es)`
        },
        {
            texto:
            "Indicadores registrados",

            ok:
            contarIndicadores(m.indicadores || {}) > 0,

            detalle:
            `${contarIndicadores(m.indicadores || {})} indicador(es)`
        },
        {
            texto:
            "Riesgos identificados",

            ok:
            (m.riesgos || []).length > 0,

            detalle:
            `${(m.riesgos || []).length} riesgo(s)`
        },
        {
            texto:
            "Cronograma programado",

            ok:
            (m.cronograma?.actividades || []).length > 0,

            detalle:
            `${(m.cronograma?.actividades || []).length} actividad(es) programada(s)`
        },
        {
            texto:
            "Presupuesto oficial con ítems",

            ok:
            (mgaProject.items || []).length > 0,

            detalle:
            `${(mgaProject.items || []).length} ítem(s)`
        },
        {
            texto:
            "Actividades MGA vinculadas con presupuesto",

            ok:
            Number(resumen.totalVinculado || 0) > 0,

            detalle:
            `${resumen.porcentajeVinculado || 0}% vinculado`
        }
    ];

}

// =====================================
// RECALCULAR
// =====================================

function recalcularResumenMGA(){

    if(window.MotorPresupuesto && typeof MotorPresupuesto.calcularResumen === "function"){

        const resumen =
        MotorPresupuesto.calcularResumen(
            mgaProject,
            mgaModel
        );

        mgaModel.presupuestoMGA.resumen =
        resumen;

        if(Array.isArray(resumen.actividades)){
            mgaModel.presupuestoMGA.costosPorActividad =
            resumen.actividades;
        }

        if(Array.isArray(resumen.productos)){
            mgaModel.presupuestoMGA.costosPorProducto =
            resumen.productos;
        }

        return resumen;

    }

    const costosActividad =
    calcularCostosPorActividadBasico();

    const costosProducto =
    calcularCostosPorProductoBasico(costosActividad);

    const totalVinculado =
    costosActividad.reduce((s, x) => s + Number(x.costoDirecto || 0), 0);

    const totalPresupuesto =
    (mgaProject.items || []).reduce((s, it) => s + calcularTotalItem(it), 0);

    const resumen =
    {
        totalPresupuesto,
        totalVinculado,
        diferencia:
        totalPresupuesto - totalVinculado,

        porcentajeVinculado:
        totalPresupuesto > 0
        ? Math.round((totalVinculado / totalPresupuesto) * 100)
        : 0,

        actividades:
        costosActividad,

        productos:
        costosProducto
    };

    mgaModel.presupuestoMGA.costosPorActividad =
    costosActividad;

    mgaModel.presupuestoMGA.costosPorProducto =
    costosProducto;

    mgaModel.presupuestoMGA.resumen =
    resumen;

    return resumen;

}

function calcularCostosPorActividadBasico(){

    const actividades =
    mgaModel.cadenaValor.actividades || [];

    const vinculos =
    mgaModel.presupuestoMGA.relacionItemsPresupuesto || [];

    return actividades.map(act => {

        const vin =
        vinculos.filter(v => v.actividadId === act.id);

        const total =
        vin.reduce((s, v) => {

            const item =
            buscarItem(v.itemId);

            return s + calcularTotalItem(item);

        }, 0);

        return {
            actividadId:
            act.id,

            actividad:
            act.nombre || "",

            productoId:
            act.productoId || "",

            itemsVinculados:
            vin.length,

            costoDirecto:
            total
        };

    });

}

function calcularCostosPorProductoBasico(costosActividad){

    const productos =
    mgaModel.cadenaValor.productos || [];

    return productos.map(prod => {

        const acts =
        costosActividad.filter(a => a.productoId === prod.id);

        return {
            productoId:
            prod.id,

            producto:
            prod.nombre || "",

            actividades:
            acts.length,

            costoDirecto:
            acts.reduce((s, a) => s + Number(a.costoDirecto || 0), 0)
        };

    });

}

// =====================================
// GUARDAR
// =====================================

function guardarIntegracionMGA(){

    recalcularResumenMGA();

    MGA.updateModel(
        mgaProjectId,
        {
            presupuestoMGA:
            mgaModel.presupuestoMGA,

            checklist: {
                integracionMGACompleta:
                validarIntegracionCompleta()
            }
        }
    );

    mgaProject =
    StorageAPI.getProjectById(mgaProjectId);

    mgaModel =
    MGA.getModel(mgaProject);

    asegurarModeloMGAIntegracion();

    alert("Integración MGA guardada correctamente.");

}

function validarIntegracionCompleta(){

    return !!mgaModel.diagnostico?.problemaCentral &&
    !!mgaModel.arbolObjetivos?.objetivoGeneral &&
    (mgaModel.cadenaValor?.productos || []).length > 0 &&
    (mgaModel.cadenaValor?.actividades || []).length > 0 &&
    (mgaModel.presupuestoMGA?.relacionItemsPresupuesto || []).length > 0;

}

// =====================================
// BUSCADORES
// =====================================

function buscarActividad(id){

    return (mgaModel.cadenaValor.actividades || [])
    .find(a => a.id === id) || null;

}

function buscarProducto(id){

    return (mgaModel.cadenaValor.productos || [])
    .find(p => p.id === id) || null;

}

function buscarProductoPorActividad(actividadId){

    const act =
    buscarActividad(actividadId);

    if(!act){
        return "";
    }

    const prod =
    buscarProducto(act.productoId);

    return prod
    ? prod.nombre
    : "";

}

function buscarItem(id){

    return (mgaProject.items || [])
    .find(it => it.id === id) || null;

}

// =====================================
// HELPERS
// =====================================

function calcularTotalItem(item){

    if(!item){
        return 0;
    }

    const qty =
    Number(item.qty || item.cantidad || 0);

    const pu =
    Number(item.pu || item.precioUnitario || 0);

    return qty * pu;

}

function contarIndicadores(indicadores){

    return ["producto", "resultado", "gestion", "impacto"]
    .reduce((s, k) => s + ((indicadores[k] || []).length), 0);

}

function getValue(id){

    const el =
    document.getElementById(id);

    return el
    ? String(el.value || "").trim()
    : "";

}

function generarId(prefix){

    if(window.MGA && typeof MGA.uid === "function"){
        return MGA.uid(prefix);
    }

    return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

}

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

function escapeHtml(value){

    return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}
