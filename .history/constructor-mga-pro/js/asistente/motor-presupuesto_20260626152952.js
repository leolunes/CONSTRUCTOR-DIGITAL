// =====================================
// MOTOR-PRESUPUESTO.JS
// CONSTRUCTOR MGA PRO
// Motor avanzado de integración entre Cadena de Valor y Presupuesto PRO
// =====================================

/*
  Este motor NO reemplaza:
  - app.js
  - base-import.js
  - calc.js
  - pdf.js

  Su función es conectar las actividades MGA con:
  - capítulos del presupuesto,
  - ítems existentes,
  - APUs,
  - costos por actividad,
  - costos por producto,
  - costos por objetivo específico,
  - programación financiera,
  - validación presupuestal MGA.
*/

const MotorPresupuesto = (() => {

  // =====================================
  // CONTEXTO
  // =====================================

  function getProject(projectId){

    if(!window.StorageAPI){
      console.error("StorageAPI no está disponible.");
      return null;
    }

    return StorageAPI.getProjectById(projectId);

  }

  function getModel(project){

    if(!project){
      return null;
    }

    if(window.MGA && typeof MGA.getModel === "function"){
      return MGA.getModel(project);
    }

    return project.mga || {};

  }

  function prepararModeloPresupuesto(model = {}){

    if(!model.presupuestoMGA){
      model.presupuestoMGA = {};
    }

    const presupuestoMGA =
    model.presupuestoMGA;

    if(!Array.isArray(presupuestoMGA.relacionItemsPresupuesto)){
      presupuestoMGA.relacionItemsPresupuesto = [];
    }

    if(!Array.isArray(presupuestoMGA.costosPorActividad)){
      presupuestoMGA.costosPorActividad = [];
    }

    if(!Array.isArray(presupuestoMGA.costosPorProducto)){
      presupuestoMGA.costosPorProducto = [];
    }

    if(!Array.isArray(presupuestoMGA.costosPorObjetivo)){
      presupuestoMGA.costosPorObjetivo = [];
    }

    if(!presupuestoMGA.resumen){
      presupuestoMGA.resumen = {};
    }

    return presupuestoMGA;

  }

  // =====================================
  // NORMALIZACIÓN DE ÍTEMS
  // =====================================

  function getItems(project){

    if(Array.isArray(project?.items)){
      return project.items;
    }

    if(Array.isArray(project?.budgetItems)){
      return project.budgetItems;
    }

    return [];

  }

  function getChapters(project){

    if(Array.isArray(project?.chapters)){
      return project.chapters;
    }

    return [];

  }

  function normalizarItem(item = {}){

    const cantidad =
    num(
      item.qty ??
      item.cantidad ??
      item.quantity ??
      0
    );

    const precio =
    num(
      item.pu ??
      item.precioUnitario ??
      item.unitPrice ??
      0
    );

    return {
      id:
      item.id || item.itemId || "",

      codigo:
      item.code || item.codigo || item.itemCode || "",

      descripcion:
      item.desc || item.descripcion || item.name || item.nombre || "",

      unidad:
      item.unit || item.unidad || item.measure || "",

      cantidad,
      precioUnitario:
      precio,

      parcial:
      cantidad * precio,

      chapterId:
      item.chapterId || item.chapter || "",

      raw:
      item
    };

  }

  function calcularCostoItem(item){

    const it =
    normalizarItem(item || {});

    return it.parcial;

  }

  function totalPresupuesto(project){

    return getItems(project)
    .reduce((s, item) => s + calcularCostoItem(item), 0);

  }

  // =====================================
  // VÍNCULOS ACTIVIDAD ↔ ÍTEM
  // =====================================

  function vincularItemActividad(model, actividadId, itemId, origen = "manual"){

    const presupuestoMGA =
    prepararModeloPresupuesto(model);

    if(!actividadId || !itemId){
      return presupuestoMGA;
    }

    const existe =
    presupuestoMGA.relacionItemsPresupuesto.some(v =>
      v.actividadId === actividadId &&
      v.itemId === itemId
    );

    if(!existe){

      presupuestoMGA.relacionItemsPresupuesto.push({
        id:
        uid("vin"),

        actividadId,
        itemId,
        origen,
        creadoEn:
        new Date().toISOString()
      });

    }

    return presupuestoMGA;

  }

  function desvincularItemActividad(model, vinculoId){

    const presupuestoMGA =
    prepararModeloPresupuesto(model);

    presupuestoMGA.relacionItemsPresupuesto =
    presupuestoMGA.relacionItemsPresupuesto.filter(v =>
      v.id !== vinculoId
    );

    return presupuestoMGA;

  }

  function limpiarVinculos(model){

    const presupuestoMGA =
    prepararModeloPresupuesto(model);

    presupuestoMGA.relacionItemsPresupuesto = [];
    presupuestoMGA.costosPorActividad = [];
    presupuestoMGA.costosPorProducto = [];
    presupuestoMGA.costosPorObjetivo = [];
    presupuestoMGA.resumen = {};

    return presupuestoMGA;

  }

  // =====================================
  // AUTOVINCULACIÓN
  // =====================================

  function autovincularPorDescripcion(project, model){

    const presupuestoMGA =
    prepararModeloPresupuesto(model);

    const actividades =
    model.cadenaValor?.actividades || [];

    const items =
    getItems(project);

    let creados =
    0;

    actividades.forEach(act => {

      const palabrasActividad =
      extraerPalabrasClave(
        `${act.nombre || ""} ${act.descripcion || ""}`
      );

      if(!palabrasActividad.length){
        return;
      }

      items.forEach(item => {

        const itemNormalizado =
        normalizarItem(item);

        const textoItem =
        normalizarTexto(
          `${itemNormalizado.codigo} ${itemNormalizado.descripcion} ${itemNormalizado.unidad}`
        );

        const puntaje =
        calcularCoincidencia(
          palabrasActividad,
          textoItem
        );

        if(puntaje < 1){
          return;
        }

        const existe =
        presupuestoMGA.relacionItemsPresupuesto.some(v =>
          v.actividadId === act.id &&
          v.itemId === itemNormalizado.id
        );

        if(existe){
          return;
        }

        presupuestoMGA.relacionItemsPresupuesto.push({
          id:
          uid("vin"),

          actividadId:
          act.id,

          itemId:
          itemNormalizado.id,

          creadoEn:
          new Date().toISOString(),

          origen:
          "autovinculacion",

          puntaje
        });

        creados++;

      });

    });

    return {
      presupuestoMGA,
      creados
    };

  }

  function extraerPalabrasClave(texto){

    const stop =
    [
      "de", "del", "la", "el", "los", "las", "un", "una",
      "y", "o", "para", "por", "con", "en", "a", "al",
      "actividad", "producto", "proyecto", "realizar", "ejecutar",
      "implementar", "desarrollar", "hacer", "servicio", "general"
    ];

    return normalizarTexto(texto)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map(x => x.trim())
    .filter(x => x.length >= 5)
    .filter(x => !stop.includes(x));

  }

  function calcularCoincidencia(palabras, textoItem){

    let puntaje =
    0;

    palabras.forEach(p => {

      if(textoItem.includes(p)){
        puntaje++;
      }

    });

    return puntaje;

  }

  // =====================================
  // COSTOS POR ACTIVIDAD, PRODUCTO Y OBJETIVO
  // =====================================

  function calcularCostosPorActividad(project, model){

    const presupuestoMGA =
    prepararModeloPresupuesto(model);

    const actividades =
    model.cadenaValor?.actividades || [];

    const items =
    getItems(project);

    const vinculos =
    presupuestoMGA.relacionItemsPresupuesto || [];

    const costos =
    actividades.map(act => {

      const vin =
      vinculos.filter(v => v.actividadId === act.id);

      const detalleItems =
      vin.map(v => {

        const item =
        items.find(it => normalizarItem(it).id === v.itemId);

        const it =
        normalizarItem(item || {});

        return {
          vinculoId:
          v.id,

          itemId:
          v.itemId,

          codigo:
          it.codigo,

          descripcion:
          it.descripcion,

          unidad:
          it.unidad,

          cantidad:
          it.cantidad,

          precioUnitario:
          it.precioUnitario,

          parcial:
          it.parcial,

          origen:
          v.origen || "manual"
        };

      });

      const total =
      detalleItems.reduce((s, it) => s + num(it.parcial), 0);

      return {
        actividadId:
        act.id,

        actividad:
        act.nombre || "",

        productoId:
        act.productoId || "",

        itemsVinculados:
        detalleItems.length,

        costoDirecto:
        total,

        detalleItems
      };

    });

    presupuestoMGA.costosPorActividad =
    costos;

    return costos;

  }

  function calcularCostosPorProducto(project, model){

    const presupuestoMGA =
    prepararModeloPresupuesto(model);

    const productos =
    model.cadenaValor?.productos || [];

    const costosActividad =
    calcularCostosPorActividad(project, model);

    const costosProducto =
    productos.map(prod => {

      const acts =
      costosActividad.filter(a =>
        a.productoId === prod.id
      );

      const total =
      acts.reduce((s, a) => s + num(a.costoDirecto), 0);

      return {
        productoId:
        prod.id,

        producto:
        prod.nombre || "",

        objetivoEspecificoId:
        prod.objetivoEspecificoId || "",

        actividades:
        acts.length,

        costoDirecto:
        total,

        detalleActividades:
        acts
      };

    });

    presupuestoMGA.costosPorProducto =
    costosProducto;

    return costosProducto;

  }

  function calcularCostosPorObjetivo(project, model){

    const presupuestoMGA =
    prepararModeloPresupuesto(model);

    const objetivos =
    model.cadenaValor?.objetivosEspecificos || [];

    const costosProducto =
    calcularCostosPorProducto(project, model);

    const costosObjetivo =
    objetivos.map(obj => {

      const productos =
      costosProducto.filter(p =>
        p.objetivoEspecificoId === obj.id
      );

      const total =
      productos.reduce((s, p) => s + num(p.costoDirecto), 0);

      return {
        objetivoEspecificoId:
        obj.id,

        objetivo:
        obj.texto || "",

        productos:
        productos.length,

        costoDirecto:
        total,

        detalleProductos:
        productos
      };

    });

    presupuestoMGA.costosPorObjetivo =
    costosObjetivo;

    return costosObjetivo;

  }

  function calcularResumen(project, model){

    const presupuestoMGA =
    prepararModeloPresupuesto(model);

    const costosActividad =
    calcularCostosPorActividad(project, model);

    const costosProducto =
    calcularCostosPorProducto(project, model);

    const costosObjetivo =
    calcularCostosPorObjetivo(project, model);

    const totalVinculado =
    costosActividad.reduce((s, x) => s + num(x.costoDirecto), 0);

    const total =
    totalPresupuesto(project);

    const actividadesSinPresupuesto =
    costosActividad
    .filter(x => num(x.itemsVinculados) === 0)
    .map(x => x.actividad);

    const actividadesConPresupuesto =
    costosActividad
    .filter(x => num(x.itemsVinculados) > 0)
    .length;

    const porcentajeVinculado =
    total > 0
    ? Math.round((totalVinculado / total) * 100)
    : 0;

    const resumen =
    {
      totalPresupuesto:
      total,

      totalVinculado,

      diferencia:
      total - totalVinculado,

      porcentajeVinculado,

      actividades:
      costosActividad,

      productos:
      costosProducto,

      objetivos:
      costosObjetivo,

      actividadesConPresupuesto,

      actividadesSinPresupuesto,

      actividadesTotales:
      costosActividad.length,

      completo:
      costosActividad.length > 0 &&
      actividadesSinPresupuesto.length === 0
    };

    presupuestoMGA.resumen =
    resumen;

    return resumen;

  }

  // =====================================
  // PROGRAMACIÓN FINANCIERA
  // =====================================

  function generarProgramacionFinanciera(model){

    const cronograma =
    model.cronograma || {};

    const actividadesCron =
    cronograma.actividades || [];

    if(!actividadesCron.length){
      return [];
    }

    const meses =
    Math.max(
      ...actividadesCron.map(a => num(a.mesFin))
    );

    const programacion =
    [];

    for(let mes = 1; mes <= meses; mes++){

      const valorMes =
      actividadesCron.reduce((s, act) => {

        const inicio =
        num(act.mesInicio);

        const fin =
        num(act.mesFin);

        const valor =
        num(act.valorProgramado);

        if(mes < inicio || mes > fin){
          return s;
        }

        const duracion =
        Math.max(1, fin - inicio + 1);

        return s + (valor / duracion);

      }, 0);

      programacion.push({
        mes,
        valor:
        Math.round(valorMes)
      });

    }

    return programacion;

  }

  // =====================================
  // SUGERIR CAPÍTULOS
  // =====================================

  function sugerirCapituloParaActividad(actividadNombre){

    const t =
    normalizarTexto(actividadNombre || "");

    if(t.includes("estudio") || t.includes("diseno")){
      return {
        chapterCode:
        "1",

        chapterName:
        "Estudios y diseños"
      };
    }

    if(t.includes("preliminar") || t.includes("localizacion") || t.includes("replanteo")){
      return {
        chapterCode:
        "2",

        chapterName:
        "Preliminares"
      };
    }

    if(t.includes("excav") || t.includes("ciment") || t.includes("demolicion")){
      return {
        chapterCode:
        "3",

        chapterName:
        "Cimentación y movimiento de tierra"
      };
    }

    if(t.includes("obra") || t.includes("constru") || t.includes("civil")){
      return {
        chapterCode:
        "4",

        chapterName:
        "Obras civiles"
      };
    }

    if(t.includes("dotacion") || t.includes("equip")){
      return {
        chapterCode:
        "5",

        chapterName:
        "Dotación y equipamiento"
      };
    }

    if(t.includes("intervent") || t.includes("supervision")){
      return {
        chapterCode:
        "6",

        chapterName:
        "Supervisión e interventoría"
      };
    }

    if(t.includes("seguimiento") || t.includes("evalu")){
      return {
        chapterCode:
        "7",

        chapterName:
        "Seguimiento y evaluación"
      };
    }

    return {
      chapterCode:
      "9",

      chapterName:
      "Actividades generales"
    };

  }

  function sugerirCapitulosDesdeCadena(model){

    const actividades =
    model.cadenaValor?.actividades || [];

    const capitulos =
    [];

    actividades.forEach(act => {

      const cap =
      sugerirCapituloParaActividad(act.nombre);

      const existe =
      capitulos.some(c =>
        String(c.chapterCode) === String(cap.chapterCode)
      );

      if(!existe){
        capitulos.push({
          id:
          uid("chap"),

          chapterCode:
          cap.chapterCode,

          chapterName:
          cap.chapterName
        });
      }

    });

    capitulos.sort((a,b) => {
      return Number(a.chapterCode) - Number(b.chapterCode);
    });

    return capitulos;

  }

  // =====================================
  // VALIDACIÓN PRESUPUESTAL
  // =====================================

  function validarPresupuestoMGA(project, model){

    const resumen =
    calcularResumen(project, model);

    const errores =
    [];

    const advertencias =
    [];

    if(!getItems(project).length){
      errores.push("El proyecto no tiene ítems presupuestales.");
    }

    if(!(model.cadenaValor?.actividades || []).length){
      errores.push("La Cadena de Valor no tiene actividades.");
    }

    if(resumen.actividadesSinPresupuesto.length){
      advertencias.push(
        `Hay ${resumen.actividadesSinPresupuesto.length} actividad(es) sin presupuesto vinculado.`
      );
    }

    if(resumen.totalPresupuesto > 0 && resumen.totalVinculado === 0){
      errores.push("Existe presupuesto, pero no está vinculado a actividades MGA.");
    }

    if(resumen.totalVinculado > resumen.totalPresupuesto && resumen.totalPresupuesto > 0){
      advertencias.push("El valor vinculado supera el valor total del presupuesto. Revise vínculos duplicados.");
    }

    return {
      valido:
      errores.length === 0,

      porcentaje:
      resumen.porcentajeVinculado,

      errores,
      advertencias,
      resumen
    };

  }

  // =====================================
  // APLICAR AL PROYECTO
  // =====================================

  function aplicarAutovinculacion(projectId){

    const project =
    getProject(projectId);

    if(!project){
      alert("Proyecto no encontrado.");
      return null;
    }

    const model =
    getModel(project);

    const resultado =
    autovincularPorDescripcion(project, model);

    const resumen =
    calcularResumen(project, {
      ...model,
      presupuestoMGA:
      resultado.presupuestoMGA
    });

    const programacionFinanciera =
    generarProgramacionFinanciera(model);

    if(!window.MGA || typeof MGA.updateModel !== "function"){
      return null;
    }

    return MGA.updateModel(projectId, {
      presupuestoMGA:
      {
        ...resultado.presupuestoMGA,
        resumen,
        programacionFinanciera
      }
    });

  }

  function aplicarCapitulosSugeridos(projectId){

    const project =
    getProject(projectId);

    if(!project){
      alert("Proyecto no encontrado.");
      return null;
    }

    const model =
    getModel(project);

    const sugeridos =
    sugerirCapitulosDesdeCadena(model);

    const existentes =
    getChapters(project);

    const merged =
    [...existentes];

    sugeridos.forEach(cap => {

      const existe =
      merged.some(c =>
        String(c.chapterCode) === String(cap.chapterCode)
      );

      if(!existe){
        merged.push(cap);
      }

    });

    merged.sort((a,b) => Number(a.chapterCode) - Number(b.chapterCode));

    StorageAPI.updateProject(projectId, {
      chapters:
      merged
    });

    return StorageAPI.getProjectById(projectId);

  }

  function recalcularYGuardar(projectId){

    const project =
    getProject(projectId);

    if(!project){
      alert("Proyecto no encontrado.");
      return null;
    }

    const model =
    getModel(project);

    const presupuestoMGA =
    prepararModeloPresupuesto(model);

    const resumen =
    calcularResumen(project, {
      ...model,
      presupuestoMGA
    });

    const programacionFinanciera =
    generarProgramacionFinanciera(model);

    return MGA.updateModel(projectId, {
      presupuestoMGA:
      {
        ...presupuestoMGA,
        resumen,
        programacionFinanciera
      }
    });

  }

  // =====================================
  // HELPERS
  // =====================================

  function uid(prefix){

    if(window.MGA && typeof MGA.uid === "function"){
      return MGA.uid(prefix);
    }

    return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  }

  function num(value){

    if(typeof value === "number"){
      return Number.isFinite(value) ? value : 0;
    }

    const n =
    Number(
      String(value || "")
      .replace(/\./g, "")
      .replace(",", ".")
    );

    return Number.isFinite(n) ? n : 0;

  }

  function normalizarTexto(texto){

    return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  }

  // =====================================
  // API PÚBLICA
  // =====================================

  return {
    prepararModeloPresupuesto,
    vincularItemActividad,
    desvincularItemActividad,
    limpiarVinculos,

    autovincularPorDescripcion,
    aplicarAutovinculacion,

    calcularCostoItem,
    totalPresupuesto,
    normalizarItem,

    calcularCostosPorActividad,
    calcularCostosPorProducto,
    calcularCostosPorObjetivo,
    calcularResumen,

    generarProgramacionFinanciera,

    sugerirCapituloParaActividad,
    sugerirCapitulosDesdeCadena,
    aplicarCapitulosSugeridos,

    validarPresupuestoMGA,
    recalcularYGuardar
  };

})();

window.MotorPresupuesto = MotorPresupuesto;
