// =====================================
// MOTOR-EXPORTADOR.JS
// CONSTRUCTOR MGA PRO
// Generador de textos, expediente y checklist para MGA Web
// =====================================

/*
  Este motor NO reemplaza:
  - documentos.js
  - pdf.js

  Su función es tomar el modelo completo del proyecto y generar:
  - textos listos para copiar en MGA Web,
  - resumen ejecutivo,
  - checklist de consistencia,
  - expediente técnico base.
*/

const MotorExportador = (() => {

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

  function buildContext(projectId){

    const project =
    getProject(projectId);

    if(!project){
      return null;
    }

    const model =
    getModel(project);

    return {
      project,
      model,
      datosGenerales:
      model.datosGenerales || {},
      diagnostico:
      model.diagnostico || {},
      arbolProblemas:
      model.arbolProblemas || {},
      arbolObjetivos:
      model.arbolObjetivos || {},
      cadenaValor:
      model.cadenaValor || {},
      indicadores:
      model.indicadores || {},
      riesgos:
      model.riesgos || [],
      cronograma:
      model.cronograma || {},
      presupuestoMGA:
      model.presupuestoMGA || {},
      documentosMGA:
      model.documentosMGA || {}
    };

  }

  // =====================================
  // GENERAR DOCUMENTOS MGA
  // =====================================

  function generarDocumentos(projectId){

    const ctx =
    buildContext(projectId);

    if(!ctx){
      return null;
    }

    const documentos =
    {
      resumenEjecutivo:
      generarResumenEjecutivo(ctx),

      descripcionProblema:
      generarDescripcionProblema(ctx),

      justificacion:
      generarJustificacion(ctx),

      objetivoGeneral:
      generarObjetivoGeneral(ctx),

      objetivosEspecificos:
      generarObjetivosEspecificos(ctx),

      cadenaValor:
      generarTextoCadenaValor(ctx),

      poblacion:
      generarTextoPoblacion(ctx),

      ofertaDemandaBrecha:
      generarTextoOfertaDemandaBrecha(ctx),

      indicadores:
      generarTextoIndicadores(ctx),

      riesgos:
      generarTextoRiesgos(ctx),

      cronograma:
      generarTextoCronograma(ctx),

      presupuesto:
      generarTextoPresupuesto(ctx),

      sostenibilidad:
      generarTextoSostenibilidad(ctx),

      alternativas:
      generarTextoAlternativas(ctx),

      checklist:
      generarChecklist(ctx),

      consolidado:
      ""
    };

    documentos.consolidado =
    generarConsolidado(documentos);

    return documentos;

  }

  // =====================================
  // BLOQUES DE TEXTO
  // =====================================

  function generarResumenEjecutivo(ctx){

    const project =
    ctx.project;

    const objetivo =
    ctx.arbolObjetivos.objetivoGeneral ||
    ctx.cadenaValor.objetivoGeneral ||
    "";

    const productos =
    ctx.cadenaValor.productos || [];

    const actividades =
    ctx.cadenaValor.actividades || [];

    const total =
    calcularTotalPresupuesto(project);

    return [
      `El proyecto denominado "${project.name || "Proyecto sin nombre"}" tiene como propósito ${objetivo || "atender la problemática pública identificada"}.`,
      `La intervención será desarrollada por ${project.entity || "la entidad responsable"} en ${project.location || "el área de intervención definida"}.`,
      `La cadena de valor contempla ${productos.length} producto(s) y ${actividades.length} actividad(es), orientadas al cumplimiento del objetivo general.`,
      `El presupuesto registrado en la herramienta asciende a ${formatoMoneda(total)}.`
    ].join("\n\n");

  }

  function generarDescripcionProblema(ctx){

    const d =
    ctx.diagnostico;

    const dg =
    ctx.datosGenerales;

    const partes =
    [];

    if(d.problemaCentral){
      partes.push(`El problema central identificado corresponde a: ${d.problemaCentral}`);
    }

    if(d.situacionActual){
      partes.push(`La situación actual se caracteriza por lo siguiente: ${d.situacionActual}`);
    }

    if(d.magnitudProblema){
      partes.push(`La magnitud del problema se evidencia en: ${d.magnitudProblema}`);
    }

    if(d.poblacionAfectada){
      partes.push(`La población afectada corresponde a: ${d.poblacionAfectada}`);
    }

    const territorio =
    [
      dg.localizacion,
      dg.municipio,
      dg.departamento
    ]
    .filter(Boolean)
    .join(", ");

    if(territorio){
      partes.push(`El área de intervención se localiza en ${territorio}.`);
    }

    return partes.join("\n\n");

  }

  function generarJustificacion(ctx){

    const d =
    ctx.diagnostico;

    if(d.justificacion){
      return d.justificacion;
    }

    return [
      "El proyecto se justifica por la necesidad de atender la problemática pública identificada, mejorar las condiciones actuales de la población objetivo y cerrar las brechas existentes entre la oferta disponible y la demanda real.",
      "La intervención permitirá fortalecer la capacidad institucional, optimizar el uso de los recursos públicos y generar beneficios sostenibles en el territorio."
    ].join("\n\n");

  }

  function generarObjetivoGeneral(ctx){

    return (
      ctx.arbolObjetivos.objetivoGeneral ||
      ctx.cadenaValor.objetivoGeneral ||
      ctx.documentosMGA.objetivoGeneral ||
      ""
    );

  }

  function generarObjetivosEspecificos(ctx){

    const objetivos =
    ctx.cadenaValor.objetivosEspecificos || [];

    if(!objetivos.length){
      return "No se han registrado objetivos específicos.";
    }

    return objetivos
    .map((o, i) => `${i + 1}. ${o.texto || ""}`)
    .join("\n");

  }

  function generarTextoCadenaValor(ctx){

    const cv =
    ctx.cadenaValor;

    const productos =
    cv.productos || [];

    const actividades =
    cv.actividades || [];

    if(!productos.length){
      return "No se han registrado productos en la cadena de valor.";
    }

    return productos.map((p, index) => {

      const acts =
      actividades.filter(a => a.productoId === p.id);

      return [
        `Producto ${index + 1}: ${p.nombre || ""}`,
        `Unidad de medida: ${p.unidadMedida || ""}`,
        `Meta: ${p.meta || 0}`,
        `Descripción: ${p.descripcion || ""}`,
        `Actividades asociadas:`,
        acts.length
          ? acts.map((a, i) => `  ${i + 1}. ${a.nombre || ""}`).join("\n")
          : "  Sin actividades asociadas."
      ].join("\n");

    }).join("\n\n");

  }

  function generarTextoPoblacion(ctx){

    const d =
    ctx.diagnostico;

    return [
      `Población afectada: ${d.poblacionAfectada || "No registrada."}`,
      `Población objetivo: ${d.poblacionObjetivo || "No registrada."}`,
      `Análisis territorial: ${d.analisisTerritorial || "No registrado."}`
    ].join("\n\n");

  }

  function generarTextoOfertaDemandaBrecha(ctx){

    const d =
    ctx.diagnostico;

    return [
      `Oferta actual: ${d.ofertaActual || "No registrada."}`,
      `Demanda actual: ${d.demandaActual || "No registrada."}`,
      `Brecha identificada: ${d.brecha || "No registrada."}`
    ].join("\n\n");

  }

  function generarTextoIndicadores(ctx){

    const ind =
    ctx.indicadores || {};

    const tipos =
    [
      "producto",
      "resultado",
      "gestion",
      "impacto"
    ];

    const bloques =
    [];

    tipos.forEach(tipo => {

      const lista =
      ind[tipo] || [];

      if(!lista.length){
        return;
      }

      bloques.push(
        `Indicadores de ${tipo}:\n` +
        lista.map((i, idx) => {
          return [
            `${idx + 1}. ${i.nombre || ""}`,
            `   Unidad: ${i.unidadMedida || ""}`,
            `   Línea base: ${i.lineaBase ?? 0}`,
            `   Meta: ${i.meta ?? 0}`,
            `   Fuente: ${i.fuenteVerificacion || ""}`
          ].join("\n");
        }).join("\n")
      );

    });

    return bloques.length
      ? bloques.join("\n\n")
      : "No se han registrado indicadores.";

  }

  function generarTextoRiesgos(ctx){

    const riesgos =
    ctx.riesgos || [];

    if(!riesgos.length){
      return "No se han registrado riesgos.";
    }

    return riesgos.map((r, i) => {
      return [
        `${i + 1}. Tipo: ${r.tipo || ""}`,
        `   Descripción: ${r.descripcion || ""}`,
        `   Probabilidad: ${r.probabilidad || ""}`,
        `   Impacto: ${r.impacto || ""}`,
        `   Nivel: ${r.nivel || ""}`,
        `   Mitigación: ${r.medidaMitigacion || r.mitigacion || ""}`,
        `   Responsable: ${r.responsable || ""}`
      ].join("\n");
    }).join("\n\n");

  }

  function generarTextoCronograma(ctx){

    const actividades =
    ctx.cronograma.actividades || [];

    if(!actividades.length){
      return "No se ha registrado cronograma.";
    }

    return actividades.map((a, i) => {
      return `${i + 1}. ${a.nombre || ""} — Inicio: mes ${a.mesInicio || "-"}, Fin: mes ${a.mesFin || "-"}, Valor programado: ${formatoMoneda(a.valorProgramado || 0)}.`;
    }).join("\n");

  }

  function generarTextoPresupuesto(ctx){

    const project =
    ctx.project;

    const total =
    calcularTotalPresupuesto(project);

    const items =
    project.items || [];

    const resumen =
    ctx.presupuestoMGA.resumen || {};

    return [
      `El presupuesto del proyecto contiene ${items.length} ítem(s) registrados.`,
      `El valor total calculado corresponde a ${formatoMoneda(total)}.`,
      `Valor vinculado a actividades MGA: ${formatoMoneda(resumen.totalVinculado || 0)}.`,
      `Porcentaje vinculado: ${resumen.porcentajeVinculado || 0}%.`
    ].join("\n\n");

  }

  function generarTextoSostenibilidad(ctx){

    const riesgos =
    ctx.riesgos || [];

    const productos =
    ctx.cadenaValor.productos || [];

    return [
      "La sostenibilidad del proyecto se soportará en la capacidad de la entidad responsable para operar, mantener y hacer seguimiento a los productos entregados.",
      `La intervención contempla ${productos.length} producto(s), los cuales deberán contar con acciones de operación, mantenimiento, seguimiento y evaluación.`,
      `Se han identificado ${riesgos.length} riesgo(s), para los cuales se deberán implementar medidas de mitigación y responsables de seguimiento.`
    ].join("\n\n");

  }

  function generarTextoAlternativas(ctx){

    const objetivo =
    generarObjetivoGeneral(ctx);

    return [
      "Durante la estructuración del proyecto se analizaron alternativas de intervención considerando pertinencia técnica, cobertura, costo, sostenibilidad, oportunidad y capacidad institucional.",
      `La alternativa seleccionada permite avanzar en el cumplimiento del objetivo general: ${objetivo || "objetivo no registrado"}.`,
      "Esta alternativa se considera viable al permitir una respuesta integral frente a la problemática identificada y una relación lógica entre objetivos, productos, actividades, indicadores, riesgos y presupuesto."
    ].join("\n\n");

  }

  // =====================================
  // CHECKLIST DE CONSISTENCIA
  // =====================================

  function generarChecklist(ctx){

    const checks =
    [
      {
        item:
        "Problema central formulado",

        ok:
        !!ctx.diagnostico.problemaCentral
      },

      {
        item:
        "Población objetivo definida",

        ok:
        !!ctx.diagnostico.poblacionObjetivo
      },

      {
        item:
        "Oferta, demanda y brecha registradas",

        ok:
        !!ctx.diagnostico.ofertaActual &&
        !!ctx.diagnostico.demandaActual &&
        !!ctx.diagnostico.brecha
      },

      {
        item:
        "Árbol de problemas con causas y efectos",

        ok:
        (ctx.arbolProblemas.causasDirectas || []).length > 0 &&
        (ctx.arbolProblemas.efectosDirectos || []).length > 0
      },

      {
        item:
        "Objetivo general definido",

        ok:
        !!generarObjetivoGeneral(ctx)
      },

      {
        item:
        "Cadena de valor con productos",

        ok:
        (ctx.cadenaValor.productos || []).length > 0
      },

      {
        item:
        "Cadena de valor con actividades",

        ok:
        (ctx.cadenaValor.actividades || []).length > 0
      },

      {
        item:
        "Indicadores registrados",

        ok:
        contarIndicadores(ctx.indicadores) > 0
      },

      {
        item:
        "Riesgos identificados",

        ok:
        (ctx.riesgos || []).length > 0
      },

      {
        item:
        "Cronograma registrado",

        ok:
        (ctx.cronograma.actividades || []).length > 0
      },

      {
        item:
        "Presupuesto con ítems",

        ok:
        (ctx.project.items || []).length > 0
      }
    ];

    return checks;

  }

  function checklistComoTexto(checks){

    return (checks || [])
    .map(c => `${c.ok ? "✅" : "⚠️"} ${c.item}`)
    .join("\n");

  }

  // =====================================
  // CONSOLIDADO
  // =====================================

  function generarConsolidado(documentos){

    return [
      titulo("RESUMEN EJECUTIVO"),
      documentos.resumenEjecutivo,

      titulo("DESCRIPCIÓN DEL PROBLEMA"),
      documentos.descripcionProblema,

      titulo("JUSTIFICACIÓN"),
      documentos.justificacion,

      titulo("OBJETIVO GENERAL"),
      documentos.objetivoGeneral,

      titulo("OBJETIVOS ESPECÍFICOS"),
      documentos.objetivosEspecificos,

      titulo("POBLACIÓN"),
      documentos.poblacion,

      titulo("OFERTA, DEMANDA Y BRECHA"),
      documentos.ofertaDemandaBrecha,

      titulo("CADENA DE VALOR"),
      documentos.cadenaValor,

      titulo("INDICADORES"),
      documentos.indicadores,

      titulo("RIESGOS"),
      documentos.riesgos,

      titulo("CRONOGRAMA"),
      documentos.cronograma,

      titulo("PRESUPUESTO"),
      documentos.presupuesto,

      titulo("SOSTENIBILIDAD"),
      documentos.sostenibilidad,

      titulo("ANÁLISIS DE ALTERNATIVAS"),
      documentos.alternativas,

      titulo("LISTA DE VERIFICACIÓN"),
      checklistComoTexto(documentos.checklist)
    ].join("\n\n");

  }

  function titulo(texto){

    return `==============================\n${texto}\n==============================`;

  }

  // =====================================
  // APLICAR AL PROYECTO
  // =====================================

  function aplicarDocumentos(projectId){

    if(!window.MGA || typeof MGA.updateModel !== "function"){
      alert("MGA.updateModel no está disponible.");
      return null;
    }

    const documentos =
    generarDocumentos(projectId);

    if(!documentos){
      alert("No se pudieron generar los documentos.");
      return null;
    }

    return MGA.updateModel(projectId, {
      documentosMGA:
      documentos
    });

  }

  // =====================================
  // HELPERS
  // =====================================

  function calcularTotalPresupuesto(project){

    return (project.items || [])
    .reduce((s, it) => {
      return s + (Number(it.qty || 0) * Number(it.pu || 0));
    }, 0);

  }

  function contarIndicadores(indicadores){

    return [
      "producto",
      "resultado",
      "gestion",
      "impacto"
    ]
    .reduce((s, key) => {
      return s + ((indicadores[key] || []).length);
    }, 0);

  }

  function formatoMoneda(value){

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

  // =====================================
  // API PÚBLICA
  // =====================================

  return {
    buildContext,
    generarDocumentos,
    aplicarDocumentos,

    generarResumenEjecutivo,
    generarDescripcionProblema,
    generarJustificacion,
    generarObjetivoGeneral,
    generarObjetivosEspecificos,
    generarTextoCadenaValor,
    generarTextoIndicadores,
    generarTextoRiesgos,
    generarTextoCronograma,
    generarTextoPresupuesto,
    generarTextoSostenibilidad,
    generarTextoAlternativas,

    generarChecklist,
    checklistComoTexto,
    generarConsolidado,

    calcularTotalPresupuesto,
    formatoMoneda
  };

})();

window.MotorExportador = MotorExportador;
