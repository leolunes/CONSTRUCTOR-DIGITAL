// =====================================
// MOTOR-CADENA-VALOR.JS
// CONSTRUCTOR MGA PRO
// Motor técnico para árbol, objetivos, cadena de valor e indicadores
// =====================================

/*
  Este motor NO reemplaza:
  - arbol-problemas.js
  - arbol-objetivos.js
  - cadena-valor.js
  - indicadores.js

  Su función es generar propuestas automáticas y reutilizables.

  Responsabilidades:
  1. Crear árbol de problemas desde diagnóstico.
  2. Crear árbol de objetivos desde árbol de problemas.
  3. Crear cadena de valor desde árbol de objetivos.
  4. Crear indicadores desde productos y actividades.
*/

const MotorCadenaValor = (() => {

  // =====================================
  // FLUJO COMPLETO
  // =====================================

  function generarEstructuraCompleta(model = {}){

    const arbolProblemas =
    generarArbolProblemas(model);

    const arbolObjetivos =
    generarArbolObjetivos(arbolProblemas);

    const cadenaValor =
    generarCadenaValor(arbolObjetivos, model);

    const indicadores =
    generarIndicadores(cadenaValor, model);

    return {
      arbolProblemas,
      arbolObjetivos,
      cadenaValor,
      indicadores
    };

  }

  function aplicarEstructuraCompleta(projectId){

    if(!window.StorageAPI || !window.MGA){
      alert("StorageAPI o MGA no están disponibles.");
      return null;
    }

    const project =
    StorageAPI.getProjectById(projectId);

    if(!project){
      alert("Proyecto no encontrado.");
      return null;
    }

    const model =
    MGA.getModel(project);

    const estructura =
    generarEstructuraCompleta(model);

    return MGA.updateModel(projectId, estructura);

  }

  // =====================================
  // ÁRBOL DE PROBLEMAS
  // =====================================

  function generarArbolProblemas(model = {}){

    const d =
    model.diagnostico || {};

    const problemaCentral =
    limpiar(
      model.arbolProblemas?.problemaCentral ||
      d.problemaCentral ||
      ""
    );

    const textoBase =
    [
      d.situacionActual,
      d.magnitudProblema,
      d.ofertaActual,
      d.demandaActual,
      d.brecha,
      d.justificacion,
      problemaCentral
    ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

    return {
      problemaCentral,

      causasDirectas:
      generarCausasDirectas(textoBase),

      causasIndirectas:
      generarCausasIndirectas(textoBase),

      efectosDirectos:
      generarEfectosDirectos(textoBase, d),

      efectosIndirectos:
      generarEfectosIndirectos(textoBase, d)
    };

  }

  function generarCausasDirectas(texto){

    const causas =
    [];

    if(texto.includes("infraestructura") || texto.includes("centro") || texto.includes("espacio") || texto.includes("escenario")){
      causas.push("Infraestructura insuficiente o inadecuada para atender la necesidad identificada.");
    }

    if(texto.includes("servicio") || texto.includes("atención") || texto.includes("bienestar")){
      causas.push("Oferta institucional limitada para la prestación de servicios a la población objetivo.");
    }

    if(texto.includes("cobertura") || texto.includes("acceso")){
      causas.push("Cobertura insuficiente de los bienes o servicios requeridos por la población.");
    }

    if(texto.includes("capacidad") || texto.includes("institucional")){
      causas.push("Capacidad institucional limitada para responder de manera oportuna a la problemática.");
    }

    if(texto.includes("brecha") || texto.includes("demanda")){
      causas.push("Brecha entre la demanda de la población y la oferta actualmente disponible.");
    }

    if(!causas.length){
      causas.push("Capacidad de atención insuficiente frente a la necesidad identificada.");
      causas.push("Limitaciones técnicas, operativas o institucionales para atender la problemática.");
    }

    return unicos(causas).slice(0, 5);

  }

  function generarCausasIndirectas(texto){

    const causas =
    [
      "Limitada disponibilidad de recursos para atender integralmente la problemática.",
      "Insuficiente planeación técnica para estructurar soluciones sostenibles.",
      "Limitada información diagnóstica para la toma de decisiones."
    ];

    if(texto.includes("comunidad") || texto.includes("población")){
      causas.push("Baja participación o apropiación comunitaria frente a la solución requerida.");
    }

    if(texto.includes("institucional")){
      causas.push("Débil coordinación institucional para la gestión de la intervención.");
    }

    return unicos(causas).slice(0, 5);

  }

  function generarEfectosDirectos(texto, diagnostico = {}){

    const efectos =
    [];

    if(texto.includes("adulto mayor") || texto.includes("adultos mayores")){
      efectos.push("Deterioro de las condiciones de bienestar de la población adulta mayor.");
      efectos.push("Mayor vulnerabilidad social y emocional de la población beneficiaria.");
    }

    if(texto.includes("salud")){
      efectos.push("Aumento de riesgos asociados a la salud y al bienestar de la población.");
    }

    if(texto.includes("educación")){
      efectos.push("Dificultades en el acceso, permanencia o calidad del servicio educativo.");
    }

    if(texto.includes("vía") || texto.includes("movilidad") || texto.includes("transporte")){
      efectos.push("Aumento en los tiempos y costos de desplazamiento.");
    }

    efectos.push("Disminución en la calidad, oportunidad o cobertura de los servicios dirigidos a la población objetivo.");
    efectos.push("Persistencia de condiciones que limitan el desarrollo social y comunitario.");

    return unicos(efectos).slice(0, 5);

  }

  function generarEfectosIndirectos(){

    return [
      "Incremento de brechas sociales y territoriales.",
      "Reducción de oportunidades de desarrollo para la población objetivo.",
      "Mayor presión sobre la capacidad institucional existente.",
      "Deterioro progresivo de las condiciones de bienestar y calidad de vida.",
      "Baja percepción de respuesta institucional frente a las necesidades de la comunidad."
    ];

  }

  // =====================================
  // ÁRBOL DE OBJETIVOS
  // =====================================

  function generarArbolObjetivos(arbolProblemas = {}){

    return {
      objetivoGeneral:
      transformarProblemaEnObjetivo(arbolProblemas.problemaCentral || ""),

      mediosDirectos:
      (arbolProblemas.causasDirectas || []).map(transformarNegativoAPositivo),

      mediosIndirectos:
      (arbolProblemas.causasIndirectas || []).map(transformarNegativoAPositivo),

      finesDirectos:
      (arbolProblemas.efectosDirectos || []).map(transformarNegativoAPositivo),

      finesIndirectos:
      (arbolProblemas.efectosIndirectos || []).map(transformarNegativoAPositivo)
    };

  }

  function transformarProblemaEnObjetivo(texto){

    let t =
    limpiar(texto);

    if(!t){
      return "";
    }

    const reglas =
    [
      ["Insuficiente acceso de", "Mejorar el acceso de"],
      ["Insuficiente acceso", "Mejorar el acceso"],
      ["Insuficiente", "Mejorar"],
      ["Deficiente", "Mejorar"],
      ["Baja", "Aumentar"],
      ["Bajo", "Aumentar"],
      ["Limitado", "Ampliar"],
      ["Limitada", "Ampliar"],
      ["Deterioro", "Mejorar"]
    ];

    for(const [negativo, positivo] of reglas){

      if(t.toLowerCase().startsWith(negativo.toLowerCase())){
        return limpiar(t.replace(new RegExp("^" + escaparRegExp(negativo), "i"), positivo));
      }

    }

    return `Mejorar las condiciones relacionadas con ${t}`;

  }

  function transformarNegativoAPositivo(texto){

    let t =
    limpiar(texto);

    if(!t){
      return "";
    }

    const reglas =
    [
      ["Infraestructura insuficiente", "Infraestructura suficiente"],
      ["Oferta institucional limitada", "Oferta institucional fortalecida"],
      ["Cobertura insuficiente", "Cobertura ampliada"],
      ["Capacidad institucional limitada", "Capacidad institucional fortalecida"],
      ["Brecha entre", "Reducción de la brecha entre"],
      ["Limitada disponibilidad", "Disponibilidad suficiente"],
      ["Insuficiente planeación", "Planeación técnica fortalecida"],
      ["Limitada información", "Información diagnóstica suficiente"],
      ["Baja participación", "Mayor participación"],
      ["Débil coordinación", "Coordinación fortalecida"],
      ["Deterioro", "Mejoramiento"],
      ["Mayor vulnerabilidad", "Reducción de la vulnerabilidad"],
      ["Aumento", "Reducción"],
      ["Reducción de oportunidades", "Aumento de oportunidades"],
      ["Incremento de brechas", "Reducción de brechas"],
      ["Disminución", "Mejoramiento"],
      ["Persistencia", "Superación"]
    ];

    for(const [negativo, positivo] of reglas){

      if(t.toLowerCase().startsWith(negativo.toLowerCase())){
        return limpiar(t.replace(new RegExp("^" + escaparRegExp(negativo), "i"), positivo));
      }

    }

    return `Mejoramiento de ${t}`;

  }

  // =====================================
  // CADENA DE VALOR
  // =====================================

  function generarCadenaValor(arbolObjetivos = {}, model = {}){

    const objetivoGeneral =
    arbolObjetivos.objetivoGeneral ||
    model.cadenaValor?.objetivoGeneral ||
    "";

    const medios =
    [
      ...(arbolObjetivos.mediosDirectos || []),
      ...(arbolObjetivos.mediosIndirectos || [])
    ]
    .filter(Boolean);

    const objetivosEspecificos =
    generarObjetivosEspecificos(medios);

    const productos =
    generarProductos(objetivosEspecificos, model);

    const actividades =
    generarActividades(productos, model);

    return {
      objetivoGeneral,
      objetivosEspecificos,
      productos,
      actividades
    };

  }

  function generarObjetivosEspecificos(medios = []){

    if(!medios.length){
      return [
        crearObjetivo("Fortalecer las condiciones técnicas e institucionales para atender la problemática identificada."),
        crearObjetivo("Implementar acciones orientadas a mejorar la cobertura, calidad y oportunidad de los bienes o servicios dirigidos a la población objetivo.")
      ];
    }

    return medios.slice(0, 4).map(medio => {
      return crearObjetivo(convertirMedioEnObjetivo(medio));
    });

  }

  function convertirMedioEnObjetivo(medio){

    const t =
    limpiar(medio);

    if(t.toLowerCase().includes("infraestructura")){
      return "Mejorar la infraestructura requerida para atender la necesidad identificada.";
    }

    if(t.toLowerCase().includes("oferta institucional")){
      return "Fortalecer la oferta institucional dirigida a la población objetivo.";
    }

    if(t.toLowerCase().includes("cobertura")){
      return "Aumentar la cobertura de los bienes o servicios requeridos por la población objetivo.";
    }

    if(t.toLowerCase().includes("capacidad institucional")){
      return "Fortalecer la capacidad institucional para la gestión y sostenibilidad de la intervención.";
    }

    if(t.toLowerCase().includes("participación")){
      return "Fortalecer la participación y apropiación comunitaria frente al proyecto.";
    }

    return `Fortalecer ${t}.`;

  }

  function generarProductos(objetivos = [], model = {}){

    return objetivos.map((obj, index) => {

      const nombre =
      sugerirProducto(obj.texto, index);

      return {
        id:
        uid("prod"),

        nombre,
        descripcion:
        `Producto asociado al objetivo específico: ${obj.texto}`,

        unidadMedida:
        sugerirUnidadProducto(nombre),

        meta:
        index === 0 ? 1 : 0,

        objetivoEspecificoId:
        obj.id
      };

    });

  }

  function sugerirProducto(objetivo, index){

    const t =
    String(objetivo || "").toLowerCase();

    if(t.includes("infraestructura")){
      return "Infraestructura construida o adecuada";
    }

    if(t.includes("oferta institucional") || t.includes("servicio")){
      return "Servicio de atención integral brindado";
    }

    if(t.includes("cobertura")){
      return "Cobertura del servicio ampliada";
    }

    if(t.includes("capacidad institucional")){
      return "Capacidad institucional fortalecida";
    }

    if(t.includes("participación")){
      return "Proceso de participación comunitaria implementado";
    }

    return index === 0
      ? "Producto principal del proyecto entregado"
      : "Servicio complementario implementado";

  }

  function sugerirUnidadProducto(nombre){

    const n =
    String(nombre || "").toLowerCase();

    if(n.includes("infraestructura")){
      return "Unidad";
    }

    if(n.includes("servicio")){
      return "Personas beneficiadas";
    }

    if(n.includes("cobertura")){
      return "Porcentaje";
    }

    if(n.includes("capacidad")){
      return "Entidades fortalecidas";
    }

    if(n.includes("participación")){
      return "Jornadas";
    }

    return "Unidad";

  }

  function generarActividades(productos = []){

    const actividades =
    [];

    productos.forEach(producto => {

      sugerirActividades(producto.nombre)
      .forEach((nombre, index) => {

        actividades.push({
          id:
          uid("act"),

          nombre,
          descripcion:
          `Actividad necesaria para entregar el producto: ${producto.nombre}`,

          productoId:
          producto.id,

          duracionMeses:
          index === 0 ? 1 : 2,

          valor:
          0
        });

      });

    });

    return actividades;

  }

  function sugerirActividades(nombreProducto){

    const p =
    String(nombreProducto || "").toLowerCase();

    if(p.includes("infraestructura")){

      return [
        "Realizar estudios y diseños",
        "Ejecutar obras civiles",
        "Realizar supervisión o interventoría técnica",
        "Entregar y poner en funcionamiento la infraestructura"
      ];

    }

    if(p.includes("servicio") || p.includes("atención")){

      return [
        "Diseñar el modelo de atención",
        "Implementar servicios dirigidos a la población objetivo",
        "Realizar seguimiento a beneficiarios",
        "Evaluar resultados del servicio"
      ];

    }

    if(p.includes("capacidad")){

      return [
        "Realizar diagnóstico institucional",
        "Desarrollar jornadas de capacitación",
        "Implementar herramientas de seguimiento",
        "Evaluar capacidades fortalecidas"
      ];

    }

    if(p.includes("participación")){

      return [
        "Diseñar estrategia de participación",
        "Realizar jornadas comunitarias",
        "Sistematizar resultados de participación"
      ];

    }

    return [
      "Planear la ejecución del producto",
      "Ejecutar las actividades operativas",
      "Realizar seguimiento y control",
      "Cerrar y evaluar el producto entregado"
    ];

  }

  // =====================================
  // INDICADORES
  // =====================================

  function generarIndicadores(cadenaValor = {}, model = {}){

    const productos =
    cadenaValor.productos || [];

    const actividades =
    cadenaValor.actividades || [];

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

    productos.forEach(prod => {

      indicadores.producto.push({
        id:
        uid("ind"),

        tipo:
        "producto",

        nombre:
        prod.nombre,

        descripcion:
        `Mide la entrega del producto: ${prod.nombre}`,

        unidadMedida:
        prod.unidadMedida || "Unidad",

        lineaBase:
        0,

        meta:
        Number(prod.meta || 0),

        fuenteVerificacion:
        "Acta de recibo, informe de supervisión o registro administrativo."
      });

    });

    if(productos.length){

      indicadores.resultado.push({
        id:
        uid("ind"),

        tipo:
        "resultado",

        nombre:
        "Población beneficiada con el proyecto",

        descripcion:
        "Mide la población que recibe directa o indirectamente los beneficios del proyecto.",

        unidadMedida:
        "Personas",

        lineaBase:
        0,

        meta:
        0,

        fuenteVerificacion:
        "Registro de beneficiarios, informes de ejecución o base administrativa."
      });

    }

    if(actividades.length){

      indicadores.gestion.push({
        id:
        uid("ind"),

        tipo:
        "gestion",

        nombre:
        "Avance físico del proyecto",

        descripcion:
        "Mide el porcentaje de avance en la ejecución de actividades programadas.",

        unidadMedida:
        "Porcentaje",

        lineaBase:
        0,

        meta:
        100,

        fuenteVerificacion:
        "Informes de supervisión, cronograma de ejecución y actas de seguimiento."
      });

      indicadores.gestion.push({
        id:
        uid("ind"),

        tipo:
        "gestion",

        nombre:
        "Avance financiero del proyecto",

        descripcion:
        "Mide el porcentaje de ejecución financiera frente al presupuesto programado.",

        unidadMedida:
        "Porcentaje",

        lineaBase:
        0,

        meta:
        100,

        fuenteVerificacion:
        "Informes financieros, actas de pago y reportes presupuestales."
      });

    }

    indicadores.impacto.push({
      id:
      uid("ind"),

      tipo:
      "impacto",

      nombre:
      "Mejoramiento de condiciones de bienestar",

      descripcion:
      "Mide la contribución del proyecto al mejoramiento de las condiciones de bienestar de la población objetivo.",

      unidadMedida:
      "Porcentaje",

      lineaBase:
      0,

      meta:
      0,

      fuenteVerificacion:
      "Encuestas, mediciones posteriores o informes de evaluación."
    });

    return indicadores;

  }

  // =====================================
  // APLICAR SOLO CADENA
  // =====================================

  function aplicarCadenaValor(projectId){

    const project =
    StorageAPI.getProjectById(projectId);

    if(!project){
      alert("Proyecto no encontrado.");
      return null;
    }

    const model =
    MGA.getModel(project);

    const arbolProblemas =
    model.arbolProblemas || generarArbolProblemas(model);

    const arbolObjetivos =
    model.arbolObjetivos?.objetivoGeneral
    ? model.arbolObjetivos
    : generarArbolObjetivos(arbolProblemas);

    const cadenaValor =
    generarCadenaValor(arbolObjetivos, model);

    const indicadores =
    generarIndicadores(cadenaValor, model);

    return MGA.updateModel(projectId, {
      cadenaValor,
      indicadores
    });

  }

  // =====================================
  // HELPERS
  // =====================================

  function crearObjetivo(texto){

    return {
      id:
      uid("obj"),

      texto:
      limpiar(texto)
    };

  }

  function uid(prefix){

    if(window.MGA && typeof MGA.uid === "function"){
      return MGA.uid(prefix);
    }

    return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  }

  function limpiar(texto){

    return String(texto || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\.$/, "");

  }

  function unicos(arr){

    return Array.from(
      new Set(
        (arr || [])
        .map(limpiar)
        .filter(Boolean)
      )
    );

  }

  function escaparRegExp(texto){

    return String(texto)
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  }

  // =====================================
  // API PÚBLICA
  // =====================================

  return {
    generarEstructuraCompleta,
    aplicarEstructuraCompleta,

    generarArbolProblemas,
    generarArbolObjetivos,

    transformarProblemaEnObjetivo,
    transformarNegativoAPositivo,

    generarCadenaValor,
    aplicarCadenaValor,

    generarIndicadores
  };

})();

window.MotorCadenaValor = MotorCadenaValor;
