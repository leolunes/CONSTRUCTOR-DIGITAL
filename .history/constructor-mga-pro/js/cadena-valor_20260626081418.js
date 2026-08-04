// =====================================
// CADENA-VALOR.JS - CONSTRUCTOR MGA PRO
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
// CARGAR DATOS
// =====================================

function cargarDatosCadena(){

    const cv =
    cadenaModel.cadenaValor || {};

    const objetivo =
    cv.objetivoGeneral ||
    cadenaModel.arbolObjetivos?.objetivoGeneral ||
    "";

    setValue("objetivoGeneral", objetivo);

    if(!Array.isArray(cv.objetivosEspecificos)) cv.objetivosEspecificos = [];
    if(!Array.isArray(cv.productos)) cv.productos = [];
    if(!Array.isArray(cv.actividades)) cv.actividades = [];

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

    document.getElementById("btnGuardarCadenaTop").onclick =
    guardarCadenaValor;

    document.getElementById("formCadenaValor").addEventListener("submit", (e) => {

        e.preventDefault();

        guardarCadenaValor();

    });

    document.getElementById("btnAddObjetivoEspecifico").onclick =
    agregarObjetivoEspecifico;

    document.getElementById("btnAddProducto").onclick =
    agregarProducto;

    document.getElementById("btnAddActividad").onclick =
    agregarActividad;

}

// =====================================
// OBJETIVOS ESPECÍFICOS
// =====================================

function agregarObjetivoEspecifico(){

    const texto =
    getValue("objetivoEspecificoInput");

    if(!texto){
        alert("Escriba el objetivo específico.");
        return;
    }

    const obj =
    MGA.newObjetivoEspecifico(texto);

    cadenaModel.cadenaValor.objetivosEspecificos.push(obj);

    setValue("objetivoEspecificoInput", "");

    pintarObjetivosEspecificos();
    cargarSelectObjetivos();
    actualizarVistaCadena();

}

function pintarObjetivosEspecificos(){

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

    const nombre =
    getValue("productoNombre");

    if(!nombre){
        alert("Escriba el nombre del producto.");
        return;
    }

    const producto =
    MGA.newProducto(nombre);

    producto.descripcion =
    getValue("productoDescripcion");

    producto.unidadMedida =
    getValue("productoUnidad");

    producto.meta =
    MGA.safeNum(getValue("productoMeta"), 0);

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

function pintarProductos(){

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

    const nombre =
    getValue("actividadNombre");

    if(!nombre){
        alert("Escriba el nombre de la actividad.");
        return;
    }

    const actividad =
    MGA.newActividad(nombre);

    actividad.descripcion =
    getValue("actividadDescripcion");

    actividad.productoId =
    getValue("actividadProducto");

    actividad.duracionMeses =
    MGA.safeNum(getValue("actividadDuracion"), 0);

    actividad.valor =
    MGA.safeNum(getValue("actividadValor"), 0);

    cadenaModel.cadenaValor.actividades.push(actividad);

    setValue("actividadNombre", "");
    setValue("actividadDescripcion", "");
    setValue("actividadDuracion", "");
    setValue("actividadValor", "");

    pintarActividades();
    actualizarVistaCadena();

}

function pintarActividades(){

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
      <p><strong>${escapeHtml(objetivo)}</strong></p>
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

    cadenaModel.cadenaValor.objetivoGeneral =
    getValue("objetivoGeneral");

    MGA.updateModel(
        cadenaProjectId,
        {
            cadenaValor:
            cadenaModel.cadenaValor,

            arbolObjetivos: {
                objetivoGeneral:
                cadenaModel.cadenaValor.objetivoGeneral
            },

            checklist: {
                productosConActividades:
                validarProductosConActividades()
            }
        }
    );

    cadenaProject =
    StorageAPI.getProjectById(cadenaProjectId);

    cadenaModel =
    MGA.getModel(cadenaProject);

    alert("Cadena de valor guardada correctamente.");

}

// =====================================
// VALIDACIÓN
// =====================================

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
