// =====================================
// CADENA-VALOR.JS - CONSTRUCTOR MGA PRO
// Integrado con MotorCadenaValor
// =====================================

let cadenaProjectId = "";
let cadenaProject = null;
let cadenaModel = null;

// =====================================
// INICIALIZACIÓN
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    cadenaProjectId =
    MGA.getProjectIdFromUrl();

    cadenaProject =
    MGA.getProject(cadenaProjectId);

    if(!cadenaProject){
        return;
    }

    cadenaModel =
    MGA.getModel(cadenaProject);

    asegurarModeloCadena();

    configurarLinksCadena();
    cargarDatosCadena();
    bindEventosCadena();

});

// =====================================
// LINKS
// =====================================

function configurarLinksCadena(){

    const id =
    encodeURIComponent(cadenaProjectId);

    const rutas =
    {
        btnVolverProyecto:
        `proyecto-detalle.html?projectId=${id}`,

        btnProyecto:
        `proyecto-detalle.html?projectId=${id}`,

        btnDiagnostico:
        `diagnostico.html?projectId=${id}`,

        btnObjetivos:
        `arbol-objetivos.html?projectId=${id}`,

        btnArbolObjetivos:
        `arbol-objetivos.html?projectId=${id}`,

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
    document.getElementById("cadenaSub");

    if(sub){
        sub.textContent =
        `${cadenaProject.name || "Proyecto"} · Cadena de Valor`;
    }

}

// =====================================
// ASEGURAR MODELO
// =====================================

function asegurarModeloCadena(){

    if(!cadenaModel.cadenaValor){
        cadenaModel.cadenaValor = {};
    }

    if(!Array.isArray(cadenaModel.cadenaValor.objetivosEspecificos)){
        cadenaModel.cadenaValor.objetivosEspecificos = [];
    }

    if(!Array.isArray(cadenaModel.cadenaValor.productos)){
        cadenaModel.cadenaValor.productos = [];
    }

    if(!Array.isArray(cadenaModel.cadenaValor.actividades)){
        cadenaModel.cadenaValor.actividades = [];
    }

    if(!cadenaModel.indicadores){
        cadenaModel.indicadores = {
            producto: [],
            resultado: [],
            gestion: [],
            impacto: []
        };
    }

}

// =====================================
// CARGAR DATOS
// =====================================

function cargarDatosCadena(){

    asegurarModeloCadena();

    const cv =
    cadenaModel.cadenaValor || {};

    const objetivo =
    cv.objetivoGeneral ||
    cadenaModel.arbolObjetivos?.objetivoGeneral ||
    "";

    setValue("objetivoGeneral", objetivo);

    pintarObjetivosEspecificos();
    cargarSelectObjetivos();
    cargarSelectProductos();
    pintarProductos();
    pintarActividades();
    actualizarVistaCadena();

}

// =====================================
// EVENTOS
// =====================================

function bindEventosCadena(){

    const btnGuardarTop =
    document.getElementById("btnGuardarCadenaTop");

    if(btnGuardarTop){
        btnGuardarTop.onclick =
        guardarCadenaValor;
    }

    const form =
    document.getElementById("formCadenaValor");

    if(form){

        form.addEventListener("submit", (e) => {

            e.preventDefault();

            guardarCadenaValor();

        });

    }

    const btnGenerar =
    document.getElementById("btnGenerarCadena");

    if(btnGenerar){
        btnGenerar.onclick =
        generarCadenaConMotor;
    }

    const btnLimpiar =
    document.getElementById("btnLimpiarCadena");

    if(btnLimpiar){
        btnLimpiar.onclick =
        limpiarCadenaValor;
    }

    const btnObj =
    document.getElementById("btnAddObjetivoEspecifico");

    if(btnObj){
        btnObj.onclick =
        agregarObjetivoEspecifico;
    }

    const btnProd =
    document.getElementById("btnAddProducto");

    if(btnProd){
        btnProd.onclick =
        agregarProducto;
    }

    const btnAct =
    document.getElementById("btnAddActividad");

    if(btnAct){
        btnAct.onclick =
        agregarActividad;
    }

}

// =====================================
// GENERAR PROPUESTA CON MOTOR
// =====================================

function generarCadenaConMotor(){

    if(!window.MotorCadenaValor || typeof MotorCadenaValor.generarCadenaValor !== "function"){

        alert("MotorCadenaValor no está disponible. Revise que motor-cadena-valor.js esté cargado antes de cadena-valor.js.");

        return;

    }

    asegurarModeloCadena();

    sincronizarObjetivoGeneralDesdePantalla();

    const existeInformacion =
    (cadenaModel.cadenaValor.objetivosEspecificos || []).length > 0 ||
    (cadenaModel.cadenaValor.productos || []).length > 0 ||
    (cadenaModel.cadenaValor.actividades || []).length > 0;

    let reemplazar =
    false;

    if(existeInformacion){

        reemplazar =
        confirm("Ya existe información en la Cadena de Valor. ¿Desea reemplazarla por una propuesta nueva del asistente? Si selecciona Cancelar, solo se completarán campos faltantes.");

    }

    const arbolProblemas =
    cadenaModel.arbolProblemas || {};

    const arbolObjetivos =
    cadenaModel.arbolObjetivos?.objetivoGeneral
    ? cadenaModel.arbolObjetivos
    : (
        typeof MotorCadenaValor.generarArbolObjetivos === "function"
        ? MotorCadenaValor.generarArbolObjetivos(arbolProblemas)
        : {}
    );

    const propuesta =
    MotorCadenaValor.generarCadenaValor(
        arbolObjetivos,
        cadenaModel
    );

    if(!propuesta){
        alert("No fue posible generar la propuesta de Cadena de Valor.");
        return;
    }

    aplicarPropuestaCadena(propuesta, reemplazar);

    actualizarVistaCadena();

    alert("Propuesta de Cadena de Valor generada. Revise, ajuste y guarde.");

}

function aplicarPropuestaCadena(propuesta, reemplazar){

    asegurarModeloCadena();

    if(reemplazar){

        cadenaModel.cadenaValor.objetivoGeneral =
        propuesta.objetivoGeneral || getValue("objetivoGeneral");

        cadenaModel.cadenaValor.objetivosEspecificos =
        normalizarObjetivos(propuesta.objetivosEspecificos || []);

        cadenaModel.cadenaValor.productos =
        normalizarProductos(propuesta.productos || []);

        cadenaModel.cadenaValor.actividades =
        normalizarActividades(propuesta.actividades || []);

    }else{

        cadenaModel.cadenaValor.objetivoGeneral =
        getValue("objetivoGeneral") ||
        cadenaModel.cadenaValor.objetivoGeneral ||
        propuesta.objetivoGeneral ||
        "";

        if(!(cadenaModel.cadenaValor.objetivosEspecificos || []).length){
            cadenaModel.cadenaValor.objetivosEspecificos =
            normalizarObjetivos(propuesta.objetivosEspecificos || []);
        }

        if(!(cadenaModel.cadenaValor.productos || []).length){
            cadenaModel.cadenaValor.productos =
            normalizarProductos(propuesta.productos || []);
        }

        if(!(cadenaModel.cadenaValor.actividades || []).length){
            cadenaModel.cadenaValor.actividades =
            normalizarActividades(propuesta.actividades || []);
        }

    }

    setValue("objetivoGeneral", cadenaModel.cadenaValor.objetivoGeneral);

    pintarObjetivosEspecificos();
    cargarSelectObjetivos();
    cargarSelectProductos();
    pintarProductos();
    pintarActividades();

}

function sincronizarObjetivoGeneralDesdePantalla(){

    asegurarModeloCadena();

    const objetivo =
    getValue("objetivoGeneral");

    if(objetivo){
        cadenaModel.cadenaValor.objetivoGeneral =
        objetivo;
    }

}

function normalizarObjetivos(lista){

    return (lista || [])
    .map(obj => {

        if(typeof obj === "string"){
            return crearObjetivoEspecifico(obj);
        }

        return {
            id:
            obj.id || generarId("obj"),

            texto:
            obj.texto || obj.nombre || ""
        };

    })
    .filter(x => x.texto);

}

function normalizarProductos(lista){

    return (lista || [])
    .map(p => {

        return {
            id:
            p.id || generarId("prod"),

            nombre:
            p.nombre || "",

            descripcion:
            p.descripcion || "",

            unidadMedida:
            p.unidadMedida || p.unidad || "Unidad",

            meta:
            MGA.safeNum ? MGA.safeNum(p.meta, 0) : Number(p.meta || 0),

            objetivoEspecificoId:
            p.objetivoEspecificoId || ""
        };

    })
    .filter(x => x.nombre);

}

function normalizarActividades(lista){

    return (lista || [])
    .map(a => {

        return {
            id:
            a.id || generarId("act"),

            nombre:
            a.nombre || "",

            descripcion:
            a.descripcion || "",

            productoId:
            a.productoId || "",

            duracionMeses:
            MGA.safeNum ? MGA.safeNum(a.duracionMeses, 0) : Number(a.duracionMeses || 0),

            valor:
            MGA.safeNum ? MGA.safeNum(a.valor, 0) : Number(a.valor || 0)
        };

    })
    .filter(x => x.nombre);

}

// =====================================
// OBJETIVOS ESPECÍFICOS
// =====================================

function agregarObjetivoEspecifico(){

    asegurarModeloCadena();

    const texto =
    getValue("objetivoEspecificoInput");

    if(!texto){
        alert("Escriba el objetivo específico.");
        return;
    }

    const obj =
    crearObjetivoEspecifico(texto);

    cadenaModel.cadenaValor.objetivosEspecificos.push(obj);

    setValue("objetivoEspecificoInput", "");

    pintarObjetivosEspecificos();
    cargarSelectObjetivos();
    actualizarVistaCadena();

}

function crearObjetivoEspecifico(texto){

    if(window.MGA && typeof MGA.newObjetivoEspecifico === "function"){
        return MGA.newObjetivoEspecifico(texto);
    }

    return {
        id:
        generarId("obj"),

        texto:
        texto
    };

}

function pintarObjetivosEspecificos(){

    asegurarModeloCadena();

    const cont =
    document.getElementById("objetivosEspecificosList");

    if(!cont){
        return;
    }

    const objetivos =
    cadenaModel.cadenaValor.objetivosEspecificos || [];

    if(!objetivos.length){

        cont.innerHTML =
        `<div class="muted small">Aún no hay objetivos específicos.</div>`;

        return;

    }

    cont.innerHTML =
    objetivos.map((obj, index) => {

        return `
        <div class="item" style="margin-bottom:8px">
          <div class="row space">
            <div>${escapeHtml(obj.texto || "")}</div>
            <button class="btn danger" type="button" data-del-obj="${index}">Eliminar</button>
          </div>
        </div>
        `;

    }).join("");

    cont.querySelectorAll("[data-del-obj]").forEach(btn => {

        btn.onclick =
        () => {

            const index =
            Number(btn.getAttribute("data-del-obj"));

            if(!confirm("¿Eliminar este objetivo específico?")){
                return;
            }

            const obj =
            objetivos[index];

            cadenaModel.cadenaValor.productos =
            (cadenaModel.cadenaValor.productos || []).map(p => {

                if(p.objetivoEspecificoId === obj.id){
                    return {
                        ...p,
                        objetivoEspecificoId:
                        ""
                    };
                }

                return p;

            });

            objetivos.splice(index, 1);

            pintarObjetivosEspecificos();
            cargarSelectObjetivos();
            pintarProductos();
            actualizarVistaCadena();

        };

    });

}

// =====================================
// PRODUCTOS
// =====================================

function agregarProducto(){

    asegurarModeloCadena();

    const nombre =
    getValue("productoNombre");

    if(!nombre){
        alert("Escriba el nombre del producto.");
        return;
    }

    const producto =
    crearProducto(nombre);

    producto.descripcion =
    getValue("productoDescripcion");

    producto.unidadMedida =
    getValue("productoUnidad");

    producto.meta =
    MGA.safeNum ? MGA.safeNum(getValue("productoMeta"), 0) : Number(getValue("productoMeta") || 0);

    producto.objetivoEspecificoId =
    getValue("productoObjetivo");

    cadenaModel.cadenaValor.productos.push(producto);

    setValue("productoNombre", "");
    setValue("productoDescripcion", "");
    setValue("productoUnidad", "");
    setValue("productoMeta", "");

    pintarProductos();
    cargarSelectProductos();
    actualizarVistaCadena();

}

function crearProducto(nombre){

    if(window.MGA && typeof MGA.newProducto === "function"){
        return MGA.newProducto(nombre);
    }

    return {
        id:
        generarId("prod"),

        nombre:
        nombre,

        descripcion:
        "",

        unidadMedida:
        "",

        meta:
        0,

        objetivoEspecificoId:
        ""
    };

}

function pintarProductos(){

    asegurarModeloCadena();

    const tbody =
    document.getElementById("productosBody");

    if(!tbody){
        return;
    }

    const productos =
    cadenaModel.cadenaValor.productos || [];

    if(!productos.length){

        tbody.innerHTML =
        `<tr><td colspan="5" class="muted small">Aún no hay productos.</td></tr>`;

        return;

    }

    tbody.innerHTML =
    productos.map((p, index) => {

        const obj =
        buscarObjetivo(p.objetivoEspecificoId);

        return `
        <tr>
          <td><b>${escapeHtml(p.nombre || "")}</b><br><span class="muted small">${escapeHtml(p.descripcion || "")}</span></td>
          <td>${escapeHtml(p.unidadMedida || "")}</td>
          <td>${escapeHtml(String(p.meta || 0))}</td>
          <td>${escapeHtml(obj?.texto || "Sin asociar")}</td>
          <td>
            <button class="btn danger" type="button" data-del-prod="${index}">Eliminar</button>
          </td>
        </tr>
        `;

    }).join("");

    tbody.querySelectorAll("[data-del-prod]").forEach(btn => {

        btn.onclick =
        () => {

            const index =
            Number(btn.getAttribute("data-del-prod"));

            if(!confirm("¿Eliminar este producto?")){
                return;
            }

            const producto =
            productos[index];

            cadenaModel.cadenaValor.actividades =
            (cadenaModel.cadenaValor.actividades || []).map(a => {

                if(a.productoId === producto.id){
                    return {
                        ...a,
                        productoId:
                        ""
                    };
                }

                return a;

            });

            productos.splice(index, 1);

            pintarProductos();
            cargarSelectProductos();
            pintarActividades();
            actualizarVistaCadena();

        };

    });

}

// =====================================
// ACTIVIDADES
// =====================================

function agregarActividad(){

    asegurarModeloCadena();

    const nombre =
    getValue("actividadNombre");

    if(!nombre){
        alert("Escriba el nombre de la actividad.");
        return;
    }

    const actividad =
    crearActividad(nombre);

    actividad.descripcion =
    getValue("actividadDescripcion");

    actividad.productoId =
    getValue("actividadProducto");

    actividad.duracionMeses =
    MGA.safeNum ? MGA.safeNum(getValue("actividadDuracion"), 0) : Number(getValue("actividadDuracion") || 0);

    actividad.valor =
    MGA.safeNum ? MGA.safeNum(getValue("actividadValor"), 0) : Number(getValue("actividadValor") || 0);

    cadenaModel.cadenaValor.actividades.push(actividad);

    setValue("actividadNombre", "");
    setValue("actividadDescripcion", "");
    setValue("actividadDuracion", "");
    setValue("actividadValor", "");

    pintarActividades();
    actualizarVistaCadena();

}

function crearActividad(nombre){

    if(window.MGA && typeof MGA.newActividad === "function"){
        return MGA.newActividad(nombre);
    }

    return {
        id:
        generarId("act"),

        nombre:
        nombre,

        descripcion:
        "",

        productoId:
        "",

        duracionMeses:
        0,

        valor:
        0
    };

}

function pintarActividades(){

    asegurarModeloCadena();

    const tbody =
    document.getElementById("actividadesBody");

    if(!tbody){
        return;
    }

    const actividades =
    cadenaModel.cadenaValor.actividades || [];

    if(!actividades.length){

        tbody.innerHTML =
        `<tr><td colspan="5" class="muted small">Aún no hay actividades.</td></tr>`;

        return;

    }

    tbody.innerHTML =
    actividades.map((a, index) => {

        const producto =
        buscarProducto(a.productoId);

        return `
        <tr>
          <td><b>${escapeHtml(a.nombre || "")}</b><br><span class="muted small">${escapeHtml(a.descripcion || "")}</span></td>
          <td>${escapeHtml(producto?.nombre || "Sin asociar")}</td>
          <td>${escapeHtml(String(a.duracionMeses || 0))} meses</td>
          <td>${fmtMoney(a.valor || 0)}</td>
          <td>
            <button class="btn danger" type="button" data-del-act="${index}">Eliminar</button>
          </td>
        </tr>
        `;

    }).join("");

    tbody.querySelectorAll("[data-del-act]").forEach(btn => {

        btn.onclick =
        () => {

            const index =
            Number(btn.getAttribute("data-del-act"));

            if(!confirm("¿Eliminar esta actividad?")){
                return;
            }

            actividades.splice(index, 1);

            pintarActividades();
            actualizarVistaCadena();

        };

    });

}

// =====================================
// SELECTS
// =====================================

function cargarSelectObjetivos(){

    asegurarModeloCadena();

    const sel =
    document.getElementById("productoObjetivo");

    if(!sel){
        return;
    }

    const objetivos =
    cadenaModel.cadenaValor.objetivosEspecificos || [];

    sel.innerHTML =
    `<option value="">Sin asociar</option>` +
    objetivos.map(o => {
        return `<option value="${escapeHtml(o.id)}">${escapeHtml(o.texto || "")}</option>`;
    }).join("");

}

function cargarSelectProductos(){

    asegurarModeloCadena();

    const sel =
    document.getElementById("actividadProducto");

    if(!sel){
        return;
    }

    const productos =
    cadenaModel.cadenaValor.productos || [];

    sel.innerHTML =
    `<option value="">Sin asociar</option>` +
    productos.map(p => {
        return `<option value="${escapeHtml(p.id)}">${escapeHtml(p.nombre || "")}</option>`;
    }).join("");

}

// =====================================
// BUSCADORES
// =====================================

function buscarObjetivo(id){

    return (cadenaModel.cadenaValor.objetivosEspecificos || [])
    .find(o => o.id === id) || null;

}

function buscarProducto(id){

    return (cadenaModel.cadenaValor.productos || [])
    .find(p => p.id === id) || null;

}

// =====================================
// VISTA RESUMIDA
// =====================================

function actualizarVistaCadena(){

    const vista =
    document.getElementById("vistaCadenaValor");

    if(!vista){
        return;
    }

    asegurarModeloCadena();

    const cv =
    cadenaModel.cadenaValor;

    const objetivo =
    getValue("objetivoGeneral") ||
    cv.objetivoGeneral ||
    "";

    const productos =
    cv.productos || [];

    const actividades =
    cv.actividades || [];

    let html =
    `
    <div class="item">
      <h3>Objetivo general</h3>
      <p><strong>${escapeHtml(objetivo || "Sin objetivo general.")}</strong></p>
    </div>
    `;

    if(!(cv.objetivosEspecificos || []).length){

        html +=
        `<div class="muted small">Aún no hay objetivos específicos.</div>`;

        vista.innerHTML =
        html;

        return;

    }

    html +=
    (cv.objetivosEspecificos || []).map(obj => {

        const productosObj =
        productos.filter(p => p.objetivoEspecificoId === obj.id);

        return `
        <div class="item" style="margin-top:10px">
          <h3>${escapeHtml(obj.texto || "")}</h3>
          ${
            productosObj.length
            ? productosObj.map(p => {
                const acts =
                actividades.filter(a => a.productoId === p.id);

                return `
                <div style="margin-top:8px">
                  <b>Producto:</b> ${escapeHtml(p.nombre || "")}
                  <div class="muted small">Meta: ${escapeHtml(String(p.meta || 0))} ${escapeHtml(p.unidadMedida || "")}</div>
                  <ul>
                    ${
                      acts.length
                      ? acts.map(a => `<li>${escapeHtml(a.nombre || "")} — ${fmtMoney(a.valor || 0)}</li>`).join("")
                      : "<li>Sin actividades asociadas</li>"
                    }
                  </ul>
                </div>
                `;
              }).join("")
            : `<div class="muted small">Sin productos asociados.</div>`
          }
        </div>
        `;

    }).join("");

    vista.innerHTML =
    html;

}

// =====================================
// GUARDAR
// =====================================

function guardarCadenaValor(){

    asegurarModeloCadena();

    cadenaModel.cadenaValor.objetivoGeneral =
    getValue("objetivoGeneral");

    const indicadoresGenerados =
    generarIndicadoresDesdeCadena();

    MGA.updateModel(
        cadenaProjectId,
        {
            cadenaValor:
            cadenaModel.cadenaValor,

            arbolObjetivos: {
                objetivoGeneral:
                cadenaModel.cadenaValor.objetivoGeneral
            },

            indicadores:
            indicadoresGenerados || cadenaModel.indicadores,

            checklist: {
                cadenaValorCompleta:
                validarCadenaCompleta(),

                productosConActividades:
                validarProductosConActividades(),

                objetivosConProductos:
                validarObjetivosConProductos()
            }
        }
    );

    cadenaProject =
    StorageAPI.getProjectById(cadenaProjectId);

    cadenaModel =
    MGA.getModel(cadenaProject);

    asegurarModeloCadena();

    alert("Cadena de valor guardada correctamente.");

}

// =====================================
// INDICADORES DESDE CADENA
// =====================================

function generarIndicadoresDesdeCadena(){

    if(!window.MotorCadenaValor || typeof MotorCadenaValor.generarIndicadores !== "function"){
        return null;
    }

    const actuales =
    cadenaModel.indicadores || {};

    const existen =
    ["producto", "resultado", "gestion", "impacto"]
    .some(k => (actuales[k] || []).length > 0);

    if(existen){
        return actuales;
    }

    return MotorCadenaValor.generarIndicadores(
        cadenaModel.cadenaValor,
        cadenaModel
    );

}

// =====================================
// LIMPIAR
// =====================================

function limpiarCadenaValor(){

    if(!confirm("¿Desea limpiar toda la Cadena de Valor? Esta acción solo se guardará cuando presione Guardar.")){
        return;
    }

    cadenaModel.cadenaValor.objetivoGeneral =
    "";

    cadenaModel.cadenaValor.objetivosEspecificos =
    [];

    cadenaModel.cadenaValor.productos =
    [];

    cadenaModel.cadenaValor.actividades =
    [];

    setValue("objetivoGeneral", "");
    setValue("objetivoEspecificoInput", "");
    setValue("productoNombre", "");
    setValue("productoDescripcion", "");
    setValue("productoUnidad", "");
    setValue("productoMeta", "");
    setValue("actividadNombre", "");
    setValue("actividadDescripcion", "");
    setValue("actividadDuracion", "");
    setValue("actividadValor", "");

    pintarObjetivosEspecificos();
    cargarSelectObjetivos();
    cargarSelectProductos();
    pintarProductos();
    pintarActividades();
    actualizarVistaCadena();

}

// =====================================
// VALIDACIÓN
// =====================================

function validarCadenaCompleta(){

    const cv =
    cadenaModel.cadenaValor || {};

    return !!cv.objetivoGeneral &&
    (cv.objetivosEspecificos || []).length > 0 &&
    (cv.productos || []).length > 0 &&
    (cv.actividades || []).length > 0;

}

function validarProductosConActividades(){

    const productos =
    cadenaModel.cadenaValor.productos || [];

    const actividades =
    cadenaModel.cadenaValor.actividades || [];

    if(!productos.length){
        return false;
    }

    return productos.every(p =>
        actividades.some(a => a.productoId === p.id)
    );

}

function validarObjetivosConProductos(){

    const objetivos =
    cadenaModel.cadenaValor.objetivosEspecificos || [];

    const productos =
    cadenaModel.cadenaValor.productos || [];

    if(!objetivos.length){
        return false;
    }

    return objetivos.every(o =>
        productos.some(p => p.objetivoEspecificoId === o.id)
    );

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

function generarId(prefix){

    if(window.MGA && typeof MGA.uid === "function"){
        return MGA.uid(prefix);
    }

    return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

}

function escapeHtml(value){

    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

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
