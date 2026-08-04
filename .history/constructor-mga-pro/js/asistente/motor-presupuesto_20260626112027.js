// =====================================
// MOTOR-PRESUPUESTO.JS
// CONSTRUCTOR MGA PRO
// Integración entre Cadena de Valor y Presupuesto PRO
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
  - programación financiera.
*/

const MotorPresupuesto = (() => {

  // =====================================
  // OBTENER CONTEXTO
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

  // =====================================
  // CREAR RELACIÓN ACTIVIDAD ↔ PRESUPUESTO
  // =====================================

  function prepararModeloPresupuesto(model = {}){

    const presupuestoMGA =
    model.presupuestoMGA || {};

    if(!Array.isArray(presupuestoMGA.relacionItemsPresupuesto)){
      presupuestoMGA.relacionItemsPresupuesto = [];
    }

    if(!Array.isArray(presupuestoMGA.costosPorActividad)){
      presupuestoMGA.costosPorActividad = [];
    }

    if(!Array.isArray(presupuestoMGA.costosPorProducto)){
      presupuestoMGA.costosPorProducto = [];
    }

    return presupuestoMGA;

  }

  function vincularItemActividad(model, actividadId, itemId){

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

  // =====================================
  // AUTOVINCULACIÓN POR TEXTO
  // =====================================

  function autovincularPorDescripcion(project, model){

    const presupuestoMGA =
    prepararModeloPresupuesto(model);

    const actividades =
    model.cadenaValor?.actividades || [];

    const items =
    project.items || [];

    let creados =
    0;

    actividades.forEach(act => {

      const palabras =
      extraerPalabrasClave(act.nombre + " " + (act.descripcion || ""));

      items.forEach(item => {

        const textoItem =
        `${item.code || ""} ${item.desc || ""} ${item.unit || ""}`
        .toLowerCase();

        const match =
        palabras.some(p => textoItem.includes(p));

        if(!match){
          return;
        }

        const existe =
        presupuestoMGA.relacionItemsPresupuesto.some(v =>
          v.actividadId === act.id &&
          v.itemId === item.id
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
          item.id,

          creadoEn:
          new Date().toISOString(),

          origen:
          "autovinculacion"
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
      "actividad", "producto", "proyecto", "realizar", "ejecutar"
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
  // CALCULAR COSTOS
  // =====================================

  function calcularCostoItem(item){

    return Number(item.qty || 0) * Number(item.pu || 0);

  }

  function calcularCostosPorActividad(project, model){

    const presupuestoMGA =
    prepararModeloPresupuesto(model);

    const actividades =
    model.cadenaValor?.actividades || [];

    const items =
    project.items || [];

    const vinculos =
    presupuestoMGA.relacionItemsPresupuesto || [];

    const costos =
    actividades.map(act => {

      const vin =
      vinculos.filter(v => v.actividadId === act.id);

      const total =
      vin.reduce((s, v) => {

        const item =
        items.find(it => it.id === v.itemId);

        if(!item){
          return s;
        }

        return s + calcularCostoItem(item);

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
      acts.reduce((s, a) => s + Number(a.costoDirecto || 0), 0);

      return {
        productoId:
        prod.id,

        producto:
        prod.nombre || "",

        actividades:
        acts.length,

        costoDirecto:
        total
      };

    });

    presupuestoMGA.costosPorProducto =
    costosProducto;

    return costosProducto;

  }

  function calcularResumen(project, model){

    const costosActividad =
    calcularCostosPorActividad(project, model);

    const costosProducto =
    calcularCostosPorProducto(project, model);

    const totalVinculado =
    costosActividad.reduce((s, x) => s + Number(x.costoDirecto || 0), 0);

    const totalPresupuesto =
    (project.items || []).reduce((s, it) => {
      return s + calcularCostoItem(it);
    }, 0);

    const actividadesSinPresupuesto =
    costosActividad
    .filter(x => Number(x.itemsVinculados || 0) === 0)
    .map(x => x.actividad);

    return {
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
      costosProducto,

      actividadesSinPresupuesto
    };

  }

  // =====================================
  // SUGERIR CAPÍTULOS PARA ACTIVIDADES
  // =====================================

  function sugerirCapituloParaActividad(actividadNombre){

    const t =
    String(actividadNombre || "").toLowerCase();

    if(t.includes("estudio") || t.includes("diseño")){
      return {
        chapterCode:
        "1",

        chapterName:
        "Estudios y diseños"
      };
    }

    if(t.includes("preliminar") || t.includes("localización") || t.includes("replanteo")){
      return {
        chapterCode:
        "2",

        chapterName:
        "Preliminares"
      };
    }

    if(t.includes("excav") || t.includes("ciment")){
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

    if(t.includes("dotación") || t.includes("equip")){
      return {
        chapterCode:
        "5",

        chapterName:
        "Dotación y equipamiento"
      };
    }

    if(t.includes("intervent") || t.includes("supervisión")){
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
        c.chapterCode === cap.chapterCode
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

    if(!window.MGA || typeof MGA.updateModel !== "function"){
      return null;
    }

    return MGA.updateModel(projectId, {
      presupuestoMGA:
      {
        ...resultado.presupuestoMGA,
        resumen
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
    Array.isArray(project.chapters)
    ? project.chapters
    : [];

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

    return MGA.updateModel(projectId, {
      presupuestoMGA:
      {
        ...presupuestoMGA,
        resumen
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

  // =====================================
  // API PÚBLICA
  // =====================================

  return {
    prepararModeloPresupuesto,
    vincularItemActividad,
    desvincularItemActividad,

    autovincularPorDescripcion,
    aplicarAutovinculacion,

    calcularCostoItem,
    calcularCostosPorActividad,
    calcularCostosPorProducto,
    calcularResumen,

    sugerirCapituloParaActividad,
    sugerirCapitulosDesdeCadena,
    aplicarCapitulosSugeridos,

    recalcularYGuardar
  };

})();

window.MotorPresupuesto = MotorPresupuesto;
