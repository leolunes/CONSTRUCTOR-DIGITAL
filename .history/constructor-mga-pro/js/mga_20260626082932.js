// =====================================
// MGA.JS - CONSTRUCTOR MGA PRO
// =====================================
// Archivo central para el modelo MGA.
// Aquí se guardan las funciones comunes que usarán:
// Diagnóstico, Árbol de Problemas, Árbol de Objetivos,
// Cadena de Valor, Indicadores, Riesgos, Cronograma,
// Documentos y textos listos para MGA Web.

// =====================================
// UTILIDADES GENERALES
// =====================================

function MGA_nowISO(){
    return new Date().toISOString();
}

function MGA_uid(prefix = "mga"){
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function MGA_safeStr(value){
    return String(value ?? "").trim();
}

function MGA_safeNum(value, def = 0){
    const n = Number(value);
    return Number.isFinite(n) ? n : def;
}

function MGA_getProjectIdFromUrl(){
    const params = new URLSearchParams(window.location.search);
    return params.get("projectId") || "";
}

function MGA_goProject(projectId){
    if(!projectId){
        window.location.href = "proyectos.html";
        return;
    }

    window.location.href =
    `proyecto-detalle.html?projectId=${encodeURIComponent(projectId)}`;
}

// =====================================
// MODELO BASE DEL PROYECTO MGA
// =====================================

function MGA_createBaseModel(){

    return {

        versionMGA:
        1,

        actualizadoEn:
        MGA_nowISO(),

        datosGenerales: {

            nombreProyecto:
            "",

            entidadFormuladora:
            "",

            entidadEjecutora:
            "",

            sector:
            "",

            programa:
            "",

            subprograma:
            "",

            departamento:
            "",

            municipio:
            "",

            localizacion:
            "",

            fuenteFinanciacion:
            "",

            duracionMeses:
            0,

            valorEstimado:
            0,

            responsable:
            "",

            correoResponsable:
            ""

        },

        diagnostico: {

            situacionActual:
            "",

            problemaCentral:
            "",

            magnitudProblema:
            "",

            antecedentes:
            "",

            justificacion:
            "",

            poblacionAfectada:
            "",

            poblacionObjetivo:
            "",

            analisisTerritorial:
            "",

            ofertaActual:
            "",

            demandaActual:
            "",

            brecha:
            ""

        },

        arbolProblemas: {

            problemaCentral:
            "",

            causasDirectas:
            [],

            causasIndirectas:
            [],

            efectosDirectos:
            [],

            efectosIndirectos:
            []

        },

        arbolObjetivos: {

            objetivoGeneral:
            "",

            mediosDirectos:
            [],

            mediosIndirectos:
            [],

            finesDirectos:
            [],

            finesIndirectos:
            []

        },

        alternativas: {

            alternativasAnalizadas:
            [],

            alternativaSeleccionada:
            "",

            justificacionSeleccion:
            ""

        },

        cadenaValor: {

            objetivoGeneral:
            "",

            objetivosEspecificos:
            [],

            productos:
            [],

            actividades:
            [],

            insumos:
            []

        },

        indicadores: {

            producto:
            [],

            resultado:
            [],

            gestion:
            [],

            impacto:
            []

        },

        riesgos:
        [],

        cronograma: {

            fechaInicio:
            "",

            fechaFin:
            "",

            actividades:
            []

        },

        presupuestoMGA: {

            fuenteFinanciacion:
            "",

            valorTotal:
            0,

            fuentes:
            [],

            relacionItemsPresupuesto:
            []

        },

        documentosMGA: {

            descripcionProblema:
            "",

            justificacion:
            "",

            objetivoGeneral:
            "",

            analisisAlternativas:
            "",

            beneficios:
            "",

            sostenibilidad:
            "",

            textoCopiarMGA:
            ""

        },

        checklist: {

            problemaBienFormulado:
            false,

            causasRelacionadas:
            false,

            objetivosConsistentes:
            false,

            productosConActividades:
            false,

            actividadesConPresupuesto:
            false,

            indicadoresConMeta:
            false,

            riesgosIdentificados:
            false,

            cronogramaCompleto:
            false,

            poblacionDefinida:
            false,

            localizacionCompleta:
            false

        }

    };

}

// =====================================
// NORMALIZACIÓN DEL MODELO
// =====================================

function MGA_normalizeModel(model){

    const base =
    MGA_createBaseModel();

    const m =
    model && typeof model === "object"
        ? model
        : {};

    const out =
    {
        ...base,
        ...m
    };

    out.datosGenerales =
    {
        ...base.datosGenerales,
        ...(m.datosGenerales || {})
    };

    out.diagnostico =
    {
        ...base.diagnostico,
        ...(m.diagnostico || {})
    };

    out.arbolProblemas =
    {
        ...base.arbolProblemas,
        ...(m.arbolProblemas || {})
    };

    out.arbolObjetivos =
    {
        ...base.arbolObjetivos,
        ...(m.arbolObjetivos || {})
    };

    out.alternativas =
    {
        ...base.alternativas,
        ...(m.alternativas || {})
    };

    out.cadenaValor =
    {
        ...base.cadenaValor,
        ...(m.cadenaValor || {})
    };

    out.indicadores =
    {
        ...base.indicadores,
        ...(m.indicadores || {})
    };

    out.cronograma =
    {
        ...base.cronograma,
        ...(m.cronograma || {})
    };

    out.presupuestoMGA =
    {
        ...base.presupuestoMGA,
        ...(m.presupuestoMGA || {})
    };

    out.documentosMGA =
    {
        ...base.documentosMGA,
        ...(m.documentosMGA || {})
    };

    out.checklist =
    {
        ...base.checklist,
        ...(m.checklist || {})
    };

    if(!Array.isArray(out.arbolProblemas.causasDirectas)) out.arbolProblemas.causasDirectas = [];
    if(!Array.isArray(out.arbolProblemas.causasIndirectas)) out.arbolProblemas.causasIndirectas = [];
    if(!Array.isArray(out.arbolProblemas.efectosDirectos)) out.arbolProblemas.efectosDirectos = [];
    if(!Array.isArray(out.arbolProblemas.efectosIndirectos)) out.arbolProblemas.efectosIndirectos = [];

    if(!Array.isArray(out.arbolObjetivos.mediosDirectos)) out.arbolObjetivos.mediosDirectos = [];
    if(!Array.isArray(out.arbolObjetivos.mediosIndirectos)) out.arbolObjetivos.mediosIndirectos = [];
    if(!Array.isArray(out.arbolObjetivos.finesDirectos)) out.arbolObjetivos.finesDirectos = [];
    if(!Array.isArray(out.arbolObjetivos.finesIndirectos)) out.arbolObjetivos.finesIndirectos = [];

    if(!Array.isArray(out.alternativas.alternativasAnalizadas)) out.alternativas.alternativasAnalizadas = [];
    if(!Array.isArray(out.cadenaValor.objetivosEspecificos)) out.cadenaValor.objetivosEspecificos = [];
    if(!Array.isArray(out.cadenaValor.productos)) out.cadenaValor.productos = [];
    if(!Array.isArray(out.cadenaValor.actividades)) out.cadenaValor.actividades = [];
    if(!Array.isArray(out.cadenaValor.insumos)) out.cadenaValor.insumos = [];

    if(!Array.isArray(out.indicadores.producto)) out.indicadores.producto = [];
    if(!Array.isArray(out.indicadores.resultado)) out.indicadores.resultado = [];
    if(!Array.isArray(out.indicadores.gestion)) out.indicadores.gestion = [];
    if(!Array.isArray(out.indicadores.impacto)) out.indicadores.impacto = [];

    if(!Array.isArray(out.riesgos)) out.riesgos = [];
    if(!Array.isArray(out.cronograma.actividades)) out.cronograma.actividades = [];
    if(!Array.isArray(out.presupuestoMGA.fuentes)) out.presupuestoMGA.fuentes = [];
    if(!Array.isArray(out.presupuestoMGA.relacionItemsPresupuesto)) out.presupuestoMGA.relacionItemsPresupuesto = [];

    out.versionMGA =
    MGA_safeNum(out.versionMGA, 1);

    out.actualizadoEn =
    out.actualizadoEn || MGA_nowISO();

    out.datosGenerales.duracionMeses =
    MGA_safeNum(out.datosGenerales.duracionMeses, 0);

    out.datosGenerales.valorEstimado =
    MGA_safeNum(out.datosGenerales.valorEstimado, 0);

    out.presupuestoMGA.valorTotal =
    MGA_safeNum(out.presupuestoMGA.valorTotal, 0);

    return out;

}

// =====================================
// MEZCLA PROFUNDA
// =====================================

function MGA_deepMerge(target, source){

    const output =
    {
        ...(target || {})
    };

    for(const key of Object.keys(source || {})){

        const src =
        source[key];

        const tgt =
        output[key];

        if(
            src &&
            typeof src === "object" &&
            !Array.isArray(src)
        ){

            output[key] =
            MGA_deepMerge(
                tgt && typeof tgt === "object" ? tgt : {},
                src
            );

        }else{

            output[key] =
            src;

        }

    }

    return output;

}

// =====================================
// INTEGRACIÓN CON STORAGEAPI
// =====================================

function MGA_getProject(projectId){

    if(!window.StorageAPI){
        alert("StorageAPI no está disponible.");
        return null;
    }

    const project =
    StorageAPI.getProjectById(projectId);

    if(!project){
        alert("Proyecto no encontrado.");
        window.location.href = "proyectos.html";
        return null;
    }

    return project;

}

function MGA_getModel(project){

    if(!project){
        return MGA_createBaseModel();
    }

    return MGA_normalizeModel(project.mga);

}

function MGA_updateModel(projectId, patch){

    if(!window.StorageAPI){
        alert("StorageAPI no está disponible.");
        return null;
    }

    const project =
    StorageAPI.getProjectById(projectId);

    if(!project){
        alert("Proyecto no encontrado.");
        return null;
    }

    const current =
    MGA_getModel(project);

    const next =
    MGA_deepMerge(current, patch || {});

    next.actualizadoEn =
    MGA_nowISO();

    StorageAPI.updateProject(projectId, {
        mga:
        MGA_normalizeModel(next)
    });

    return StorageAPI.getProjectById(projectId);

}

// =====================================
// GENERADORES DE ELEMENTOS
// =====================================

function MGA_newTextItem(texto = ""){

    return {
        id:
        MGA_uid("txt"),

        texto:
        MGA_safeStr(texto)
    };

}

function MGA_newObjetivoEspecifico(texto = ""){

    return {
        id:
        MGA_uid("obj"),

        texto:
        MGA_safeStr(texto),

        productoIds:
        []
    };

}

function MGA_newProducto(nombre = ""){

    return {
        id:
        MGA_uid("prod"),

        nombre:
        MGA_safeStr(nombre),

        descripcion:
        "",

        unidadMedida:
        "",

        meta:
        0,

        objetivoEspecificoId:
        "",

        actividadesIds:
        []
    };

}

function MGA_newActividad(nombre = ""){

    return {
        id:
        MGA_uid("act"),

        nombre:
        MGA_safeStr(nombre),

        descripcion:
        "",

        productoId:
        "",

        duracionMeses:
        0,

        valor:
        0,

        itemPresupuestoIds:
        []
    };

}

function MGA_newIndicador(tipo = "producto"){

    return {
        id:
        MGA_uid("ind"),

        tipo:
        MGA_safeStr(tipo),

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

function MGA_newRiesgo(){

    return {
        id:
        MGA_uid("risk"),

        tipo:
        "",

        descripcion:
        "",

        probabilidad:
        "",

        impacto:
        "",

        nivel:
        "",

        medidaMitigacion:
        "",

        responsable:
        ""
    };

}

function MGA_newCronogramaActividad(){

    return {
        id:
        MGA_uid("cron"),

        actividadId:
        "",

        nombre:
        "",

        mesInicio:
        1,

        mesFin:
        1,

        valorProgramado:
        0
    };

}

// =====================================
// TEXTOS AUTOMÁTICOS BÁSICOS
// =====================================

function MGA_generarTextoDescripcionProblema(model){

    const m =
    MGA_normalizeModel(model);

    const problema =
    MGA_safeStr(m.diagnostico.problemaCentral);

    const poblacion =
    MGA_safeStr(m.diagnostico.poblacionAfectada);

    const territorio =
    MGA_safeStr(m.datosGenerales.localizacion || m.datosGenerales.municipio);

    if(!problema){
        return "";
    }

    let texto =
    `El problema identificado corresponde a ${problema}.`;

    if(territorio){
        texto += ` Esta situación se presenta en ${territorio}.`;
    }

    if(poblacion){
        texto += ` La población afectada corresponde a ${poblacion}.`;
    }

    texto +=
    " Esta condición limita el acceso efectivo a bienes, servicios u oportunidades de desarrollo, generando efectos negativos sobre la calidad de vida y el bienestar de la comunidad.";

    return texto;

}

function MGA_generarTextoObjetivoGeneral(model){

    const m =
    MGA_normalizeModel(model);

    const problema =
    MGA_safeStr(m.diagnostico.problemaCentral);

    if(!problema){
        return "";
    }

    return "Contribuir a la solución de la problemática identificada mediante la implementación de acciones integrales orientadas a mejorar las condiciones actuales de la población objetivo.";

}



// =====================================
// INTEGRACIÓN MGA ↔ PRESUPUESTO OFICIAL
// =====================================

function MGA_initIntegracionPage(){

    const projectId =
    MGA_getProjectIdFromUrl();

    const project =
    MGA_getProject(projectId);

    if(!project){
        return;
    }

    const model =
    MGA_getModel(project);

    MGA_configurarLinksIntegracion(projectId, project);
    MGA_renderKpisIntegracion(project, model);
    MGA_cargarSelectsIntegracion(project, model);
    MGA_renderVinculosIntegracion(project, model);
    MGA_renderCostosActividad(project, model);
    MGA_renderChecklist(project, model);

    const btnVincular =
    document.getElementById("btnVincularItem");

    if(btnVincular){
        btnVincular.addEventListener("click", () => {
            MGA_vincularItemPresupuesto(projectId);
        });
    }

    const btnAuto =
    document.getElementById("btnAutoVincular");

    if(btnAuto){
        btnAuto.addEventListener("click", () => {
            MGA_autoVincularItems(projectId);
        });
    }

    const btnGuardar =
    document.getElementById("btnGuardarMGA");

    if(btnGuardar){
        btnGuardar.addEventListener("click", () => {
            MGA_guardarIntegracion(projectId);
        });
    }

}

function MGA_configurarLinksIntegracion(projectId, project){

    const id =
    encodeURIComponent(projectId);

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
        `${project.name || "Proyecto"} · Integración MGA`;
    }

}

function MGA_renderKpisIntegracion(project, model){

    const el =
    document.getElementById("mgaKpis");

    if(!el){
        return;
    }

    const actividades =
    model.cadenaValor?.actividades || [];

    const productos =
    model.cadenaValor?.productos || [];

    const items =
    project.items || [];

    const vinculos =
    model.presupuestoMGA?.relacionItemsPresupuesto || [];

    const totalPresupuesto =
    (project.items || []).reduce((s,it) => {
        return s + (Number(it.qty || 0) * Number(it.pu || 0));
    }, 0);

    el.innerHTML =
    `
    <div class="card item">
      <div class="name">Productos MGA</div>
      <h2>${productos.length}</h2>
      <div class="muted small">Registrados en Cadena de Valor.</div>
    </div>

    <div class="card item">
      <div class="name">Actividades MGA</div>
      <h2>${actividades.length}</h2>
      <div class="muted small">Disponibles para vinculación.</div>
    </div>

    <div class="card item">
      <div class="name">Ítems presupuesto</div>
      <h2>${items.length}</h2>
      <div class="muted small">Tomados de Presupuesto Pro.</div>
    </div>

    <div class="card item">
      <div class="name">Vínculos creados</div>
      <h2>${vinculos.length}</h2>
      <div class="muted small">Actividad MGA ↔ Ítem presupuesto.</div>
    </div>

    <div class="card item">
      <div class="name">Costo directo presupuesto</div>
      <h2>${MGA_fmtMoney(totalPresupuesto)}</h2>
      <div class="muted small">Suma de ítems actuales.</div>
    </div>
    `;

}

function MGA_cargarSelectsIntegracion(project, model){

    const selAct =
    document.getElementById("selActividadMGA");

    const selItem =
    document.getElementById("selItemPresupuesto");

    if(selAct){

        const actividades =
        model.cadenaValor?.actividades || [];

        selAct.innerHTML =
        actividades.length
        ? actividades.map(a => `<option value="${MGA_escapeHtml(a.id)}">${MGA_escapeHtml(a.nombre || "")}</option>`).join("")
        : `<option value="">No hay actividades</option>`;

    }

    if(selItem){

        const items =
        project.items || [];

        selItem.innerHTML =
        items.length
        ? items.map(it => {
            const parcial =
            Number(it.qty || 0) * Number(it.pu || 0);

            const label =
            `${it.code || ""} · ${it.desc || ""} · ${MGA_fmtMoney(parcial)}`;

            return `<option value="${MGA_escapeHtml(it.id)}">${MGA_escapeHtml(label)}</option>`;
        }).join("")
        : `<option value="">No hay ítems</option>`;

    }

}

function MGA_vincularItemPresupuesto(projectId){

    const project =
    StorageAPI.getProjectById(projectId);

    const model =
    MGA_getModel(project);

    const actividadId =
    MGA_safeStr(document.getElementById("selActividadMGA")?.value);

    const itemId =
    MGA_safeStr(document.getElementById("selItemPresupuesto")?.value);

    if(!actividadId || !itemId){
        alert("Seleccione una actividad y un ítem.");
        return;
    }

    if(!model.presupuestoMGA){
        model.presupuestoMGA = MGA_createBaseModel().presupuestoMGA;
    }

    if(!Array.isArray(model.presupuestoMGA.relacionItemsPresupuesto)){
        model.presupuestoMGA.relacionItemsPresupuesto = [];
    }

    const existe =
    model.presupuestoMGA.relacionItemsPresupuesto.some(v =>
        v.actividadId === actividadId && v.itemId === itemId
    );

    if(existe){
        alert("Ese ítem ya está vinculado a esta actividad.");
        return;
    }

    model.presupuestoMGA.relacionItemsPresupuesto.push({
        id:
        MGA_uid("vin"),

        actividadId,
        itemId,
        creadoEn:
        MGA_nowISO()
    });

    MGA_updateModel(projectId, {
        presupuestoMGA:
        model.presupuestoMGA
    });

    location.reload();

}

function MGA_autoVincularItems(projectId){

    const project =
    StorageAPI.getProjectById(projectId);

    const model =
    MGA_getModel(project);

    const actividades =
    model.cadenaValor?.actividades || [];

    const items =
    project.items || [];

    if(!actividades.length || !items.length){
        alert("Debe existir al menos una actividad y un ítem de presupuesto.");
        return;
    }

    if(!Array.isArray(model.presupuestoMGA.relacionItemsPresupuesto)){
        model.presupuestoMGA.relacionItemsPresupuesto = [];
    }

    let count =
    0;

    actividades.forEach(act => {

        const palabras =
        MGA_safeStr(act.nombre)
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length >= 5);

        if(!palabras.length){
            return;
        }

        items.forEach(it => {

            const desc =
            `${it.code || ""} ${it.desc || ""}`
            .toLowerCase();

            const match =
            palabras.some(p => desc.includes(p));

            if(!match){
                return;
            }

            const existe =
            model.presupuestoMGA.relacionItemsPresupuesto.some(v =>
                v.actividadId === act.id && v.itemId === it.id
            );

            if(existe){
                return;
            }

            model.presupuestoMGA.relacionItemsPresupuesto.push({
                id:
                MGA_uid("vin"),

                actividadId:
                act.id,

                itemId:
                it.id,

                creadoEn:
                MGA_nowISO()
            });

            count++;

        });

    });

    MGA_updateModel(projectId, {
        presupuestoMGA:
        model.presupuestoMGA
    });

    alert(`Vínculos automáticos creados: ${count}`);

    location.reload();

}

function MGA_renderVinculosIntegracion(project, model){

    const body =
    document.getElementById("vinculosBody");

    if(!body){
        return;
    }

    const vinculos =
    model.presupuestoMGA?.relacionItemsPresupuesto || [];

    if(!vinculos.length){

        body.innerHTML =
        `<tr><td colspan="8" class="muted small">Aún no existen vínculos entre actividades MGA e ítems del presupuesto.</td></tr>`;

        return;

    }

    body.innerHTML =
    vinculos.map(v => {

        const act =
        MGA_buscarActividad(model, v.actividadId);

        const item =
        (project.items || []).find(it => it.id === v.itemId);

        if(!item){
            return "";
        }

        const parcial =
        Number(item.qty || 0) * Number(item.pu || 0);

        return `
        <tr>
          <td>${MGA_escapeHtml(act?.nombre || "Actividad no encontrada")}</td>
          <td>${MGA_escapeHtml(item.code || "")}</td>
          <td>${MGA_escapeHtml(item.desc || "")}</td>
          <td>${MGA_escapeHtml(item.unit || "")}</td>
          <td>${MGA_escapeHtml(String(item.qty || 0))}</td>
          <td>${MGA_fmtMoney(item.pu || 0)}</td>
          <td>${MGA_fmtMoney(parcial)}</td>
          <td>
            <button class="btn danger" type="button" onclick="MGA_eliminarVinculo('${MGA_escapeHtml(v.id)}')">Eliminar</button>
          </td>
        </tr>
        `;

    }).join("");

}

function MGA_renderCostosActividad(project, model){

    const body =
    document.getElementById("costosActividadBody");

    if(!body){
        return;
    }

    const actividades =
    model.cadenaValor?.actividades || [];

    const vinculos =
    model.presupuestoMGA?.relacionItemsPresupuesto || [];

    if(!actividades.length){

        body.innerHTML =
        `<tr><td colspan="4" class="muted small">No existen actividades en la cadena de valor.</td></tr>`;

        return;

    }

    body.innerHTML =
    actividades.map(act => {

        const vinAct =
        vinculos.filter(v => v.actividadId === act.id);

        const total =
        vinAct.reduce((s,v) => {
            const it =
            (project.items || []).find(x => x.id === v.itemId);

            if(!it) return s;

            return s + (Number(it.qty || 0) * Number(it.pu || 0));
        }, 0);

        const producto =
        MGA_buscarProducto(model, act.productoId);

        return `
        <tr>
          <td>${MGA_escapeHtml(act.nombre || "")}</td>
          <td>${MGA_escapeHtml(producto?.nombre || "Sin producto")}</td>
          <td>${vinAct.length}</td>
          <td style="text-align:right"><b>${MGA_fmtMoney(total)}</b></td>
        </tr>
        `;

    }).join("");

}

window.MGA_eliminarVinculo =
function(vinculoId){

    const projectId =
    MGA_getProjectIdFromUrl();

    const project =
    StorageAPI.getProjectById(projectId);

    const model =
    MGA_getModel(project);

    if(!confirm("¿Eliminar este vínculo?")){
        return;
    }

    model.presupuestoMGA.relacionItemsPresupuesto =
    (model.presupuestoMGA.relacionItemsPresupuesto || [])
    .filter(v => v.id !== vinculoId);

    MGA_updateModel(projectId, {
        presupuestoMGA:
        model.presupuestoMGA
    });

    location.reload();

};

function MGA_renderChecklist(project, model){

    const el =
    document.getElementById("checklistMGA");

    if(!el){
        return;
    }

    const checks =
    [
        ["Diagnóstico con problema central", !!model.diagnostico?.problemaCentral],
        ["Árbol de problemas con causas", (model.arbolProblemas?.causasDirectas || []).length > 0],
        ["Objetivo general definido", !!model.arbolObjetivos?.objetivoGeneral],
        ["Cadena de valor con productos", (model.cadenaValor?.productos || []).length > 0],
        ["Cadena de valor con actividades", (model.cadenaValor?.actividades || []).length > 0],
        ["Indicadores registrados", MGA_totalIndicadores(model) > 0],
        ["Riesgos identificados", (model.riesgos || []).length > 0],
        ["Cronograma programado", (model.cronograma?.actividades || []).length > 0],
        ["Presupuesto con ítems", (project.items || []).length > 0],
        ["Actividades vinculadas al presupuesto", (model.presupuestoMGA?.relacionItemsPresupuesto || []).length > 0]
    ];

    el.innerHTML =
    checks.map(([label, ok]) => {
        return `
        <div class="item" style="margin-bottom:8px">
          <div class="row space">
            <div>${MGA_escapeHtml(label)}</div>
            <div>${ok ? "✅" : "⚠️"}</div>
          </div>
        </div>
        `;
    }).join("");

}

function MGA_guardarIntegracion(projectId){

    const project =
    StorageAPI.getProjectById(projectId);

    const model =
    MGA_getModel(project);

    MGA_updateModel(projectId, {
        presupuestoMGA:
        model.presupuestoMGA,

        checklist: {
            actividadesConPresupuesto:
            (model.presupuestoMGA?.relacionItemsPresupuesto || []).length > 0
        }
    });

    alert("Integración MGA guardada correctamente.");

}

function MGA_buscarActividad(model, id){

    return (model.cadenaValor?.actividades || [])
    .find(a => a.id === id) || null;

}

function MGA_buscarProducto(model, id){

    return (model.cadenaValor?.productos || [])
    .find(p => p.id === id) || null;

}

function MGA_totalIndicadores(model){

    const ind =
    model.indicadores || {};

    return ["producto","resultado","gestion","impacto"]
    .reduce((s,k) => s + ((ind[k] || []).length), 0);

}

function MGA_fmtMoney(value){

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

function MGA_escapeHtml(value){

    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

document.addEventListener("DOMContentLoaded", () => {
    const page =
    location.pathname.split("/").pop().toLowerCase();

    if(page === "mga.html"){
        MGA_initIntegracionPage();
    }
});

// =====================================
// API GLOBAL
// =====================================

window.MGA = {

    nowISO:
    MGA_nowISO,

    uid:
    MGA_uid,

    safeStr:
    MGA_safeStr,

    safeNum:
    MGA_safeNum,

    getProjectIdFromUrl:
    MGA_getProjectIdFromUrl,

    goProject:
    MGA_goProject,

    createBaseModel:
    MGA_createBaseModel,

    normalizeModel:
    MGA_normalizeModel,

    deepMerge:
    MGA_deepMerge,

    getProject:
    MGA_getProject,

    getModel:
    MGA_getModel,

    updateModel:
    MGA_updateModel,

    newTextItem:
    MGA_newTextItem,

    newObjetivoEspecifico:
    MGA_newObjetivoEspecifico,

    newProducto:
    MGA_newProducto,

    newActividad:
    MGA_newActividad,

    newIndicador:
    MGA_newIndicador,

    newRiesgo:
    MGA_newRiesgo,

    newCronogramaActividad:
    MGA_newCronogramaActividad,

    generarTextoDescripcionProblema:
    MGA_generarTextoDescripcionProblema,

    generarTextoObjetivoGeneral:
    MGA_generarTextoObjetivoGeneral,

    initIntegracionPage:
    MGA_initIntegracionPage,

    fmtMoney:
    MGA_fmtMoney,

    escapeHtml:
    MGA_escapeHtml

};
