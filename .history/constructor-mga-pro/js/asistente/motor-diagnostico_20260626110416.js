// =====================================
// MOTOR-DIAGNOSTICO.JS
// CONSTRUCTOR MGA PRO
// Motor inteligente para generar diagnóstico MGA
// =====================================

/*
  Este motor genera propuestas técnicas de diagnóstico a partir de datos básicos.

  No reemplaza diagnostico.js.
  Puede ser usado por diagnostico.js, motor-formulacion.js o futuros asistentes.

  Requiere:
  - mga.js
  - storage.js
*/

const MotorDiagnostico = (() => {

  // =====================================
  // NORMALIZAR INSUMOS
  // =====================================

  function normalizarEntrada(data = {}){

    return {
      necesidad:
      limpiar(data.necesidad || data.que || data.problema || ""),

      lugar:
      limpiar(data.lugar || data.ubicacion || data.localizacion || ""),

      poblacion:
      limpiar(data.poblacion || data.poblacionAfectada || data.beneficiariosTipo || ""),

      beneficiarios:
      limpiar(data.beneficiarios || data.numeroBeneficiarios || data.cantidad || ""),

      situacion:
      limpiar(data.situacion || data.situacionActual || ""),

      consecuencias:
      limpiar(data.consecuencias || data.efectos || ""),

      sector:
      limpiar(data.sector || ""),

      programa:
      limpiar(data.programa || ""),

      departamento:
      limpiar(data.departamento || ""),

      municipio:
      limpiar(data.municipio || "")
    };

  }

  // =====================================
  // GENERAR DIAGNÓSTICO COMPLETO
  // =====================================

  function generarDiagnostico(data = {}){

    const e =
    normalizarEntrada(data);

    const problemaCentral =
    generarProblemaCentral(e);

    const diagnostico =
    {
      situacionActual:
      generarSituacionActual(e),

      problemaCentral:
      problemaCentral,

      magnitudProblema:
      generarMagnitud(e),

      antecedentes:
      generarAntecedentes(e),

      justificacion:
      generarJustificacion(e),

      poblacionAfectada:
      generarPoblacionAfectada(e),

      poblacionObjetivo:
      generarPoblacionObjetivo(e),

      analisisTerritorial:
      generarAnalisisTerritorial(e),

      ofertaActual:
      generarOferta(e),

      demandaActual:
      generarDemanda(e),

      brecha:
      generarBrecha(e)
    };

    const datosGenerales =
    {
      sector:
      e.sector,

      programa:
      e.programa,

      departamento:
      e.departamento,

      municipio:
      e.municipio,

      localizacion:
      e.lugar
    };

    const documentosMGA =
    {
      descripcionProblema:
      generarTextoProblema(diagnostico, datosGenerales),

      justificacion:
      diagnostico.justificacion
    };

    return {
      datosGenerales,
      diagnostico,
      arbolProblemas:
      {
        problemaCentral
      },
      documentosMGA,
      checklist:
      {
        problemaBienFormulado:
        !!problemaCentral,

        poblacionDefinida:
        !!diagnostico.poblacionObjetivo,

        localizacionCompleta:
        !!e.lugar
      }
    };

  }

  // =====================================
  // BLOQUES DE REDACCIÓN
  // =====================================

  function generarProblemaCentral(e){

    if(!e.necesidad && !e.poblacion && !e.lugar){
      return "";
    }

    const poblacion =
    e.poblacion || "la población objetivo";

    const lugar =
    e.lugar || "el área de intervención";

    const necesidad =
    e.necesidad || "la necesidad pública identificada";

    return `Insuficiente acceso de ${poblacion} a condiciones adecuadas relacionadas con ${necesidad} en ${lugar}.`;

  }

  function generarSituacionActual(e){

    const partes =
    [];

    if(e.lugar){
      partes.push(`En ${e.lugar} se identifica una situación pública que requiere intervención.`);
    }

    if(e.poblacion){
      partes.push(`La población afectada corresponde principalmente a ${e.poblacion}.`);
    }

    if(e.necesidad){
      partes.push(`La problemática se relaciona con ${e.necesidad}.`);
    }

    if(e.situacion){
      partes.push(`Actualmente, ${e.situacion}.`);
    }else{
      partes.push("La oferta disponible resulta limitada frente a las necesidades existentes, generando restricciones en el acceso a bienes, servicios u oportunidades de desarrollo.");
    }

    return unir(partes);

  }

  function generarMagnitud(e){

    const partes =
    [];

    if(e.beneficiarios && e.poblacion){
      partes.push(`La problemática impacta aproximadamente a ${e.beneficiarios} personas pertenecientes a ${e.poblacion}.`);
    }else if(e.poblacion){
      partes.push(`La problemática afecta a ${e.poblacion}, población que presenta necesidades asociadas al problema identificado.`);
    }

    if(e.lugar){
      partes.push(`El impacto se concentra en ${e.lugar}.`);
    }

    if(e.consecuencias){
      partes.push(`Entre las principales consecuencias se identifican: ${e.consecuencias}.`);
    }

    if(!partes.length){
      partes.push("La magnitud del problema deberá precisarse con información estadística, registros administrativos, diagnósticos técnicos o estimaciones de la entidad formuladora.");
    }

    return unir(partes);

  }

  function generarAntecedentes(e){

    const necesidad =
    e.necesidad || "la necesidad identificada";

    const lugar =
    e.lugar || "el territorio de intervención";

    return `La situación relacionada con ${necesidad} ha sido identificada en ${lugar} como una necesidad que requiere intervención pública, estructuración técnica y articulación institucional. Los antecedentes disponibles evidencian la conveniencia de formular un proyecto que permita atender la problemática de manera planificada y sostenible.`;

  }

  function generarJustificacion(e){

    const partes =
    [];

    if(e.necesidad){
      partes.push(`El proyecto se justifica por la necesidad de atender la problemática asociada a ${e.necesidad}.`);
    }else{
      partes.push("El proyecto se justifica por la necesidad de atender una problemática pública identificada.");
    }

    if(e.poblacion){
      partes.push(`Esta situación afecta a ${e.poblacion}.`);
    }

    if(e.lugar){
      partes.push(`La intervención se localiza en ${e.lugar}.`);
    }

    partes.push("La ejecución del proyecto permitirá mejorar las condiciones actuales, cerrar brechas de atención, fortalecer la capacidad institucional y generar beneficios sostenibles para la población objetivo.");

    if(e.consecuencias){
      partes.push(`Además, contribuirá a mitigar consecuencias como ${e.consecuencias}.`);
    }

    return unir(partes);

  }

  function generarPoblacionAfectada(e){

    if(e.beneficiarios && e.poblacion && e.lugar){
      return `La población afectada corresponde aproximadamente a ${e.beneficiarios} personas pertenecientes a ${e.poblacion}, ubicadas en ${e.lugar}.`;
    }

    if(e.poblacion && e.lugar){
      return `La población afectada corresponde a ${e.poblacion}, ubicada en ${e.lugar}.`;
    }

    if(e.poblacion){
      return `La población afectada corresponde a ${e.poblacion}.`;
    }

    return "La población afectada deberá definirse con base en el diagnóstico territorial, los registros administrativos y la información disponible de la entidad formuladora.";

  }

  function generarPoblacionObjetivo(e){

    if(e.beneficiarios && e.poblacion){
      return `La población objetivo directa corresponde a ${e.beneficiarios} personas pertenecientes a ${e.poblacion}, quienes serán beneficiadas directamente con la intervención propuesta.`;
    }

    if(e.poblacion){
      return `La población objetivo directa corresponde a ${e.poblacion}, priorizada de acuerdo con la necesidad identificada y el alcance del proyecto.`;
    }

    return "La población objetivo deberá definirse de acuerdo con los criterios de priorización, focalización y alcance técnico del proyecto.";

  }

  function generarAnalisisTerritorial(e){

    const lugar =
    e.lugar || "el área de intervención";

    const poblacion =
    e.poblacion || "la población objetivo";

    return `El área de intervención corresponde a ${lugar}, donde se ubica ${poblacion}. Las condiciones territoriales, sociales, físicas e institucionales hacen necesaria una intervención planificada, pertinente y coherente con la realidad local.`;

  }

  function generarOferta(e){

    const necesidad =
    e.necesidad || "la necesidad pública identificada";

    const lugar =
    e.lugar || "el área de intervención";

    return `La oferta actual relacionada con ${necesidad} en ${lugar} es limitada o insuficiente frente a la demanda identificada, lo cual evidencia la necesidad de fortalecer la capacidad de atención y respuesta institucional.`;

  }

  function generarDemanda(e){

    const necesidad =
    e.necesidad || "la necesidad identificada";

    if(e.beneficiarios && e.poblacion){
      return `La demanda actual está representada por aproximadamente ${e.beneficiarios} personas pertenecientes a ${e.poblacion}, quienes requieren acceso a soluciones relacionadas con ${necesidad}.`;
    }

    if(e.poblacion){
      return `La demanda actual está representada por ${e.poblacion}, quienes requieren acceso a soluciones relacionadas con ${necesidad}.`;
    }

    return `La demanda actual corresponde a la población que requiere acceso a soluciones relacionadas con ${necesidad}.`;

  }

  function generarBrecha(e){

    const necesidad =
    e.necesidad || "la necesidad identificada";

    const poblacion =
    e.poblacion || "la población objetivo";

    const lugar =
    e.lugar || "el área de intervención";

    return `La brecha se expresa en la diferencia entre la capacidad actual de atención relacionada con ${necesidad} y las necesidades reales de ${poblacion} en ${lugar}.`;

  }

  function generarTextoProblema(diagnostico, datosGenerales){

    const partes =
    [];

    if(diagnostico.problemaCentral){
      partes.push(`El problema central identificado corresponde a: ${diagnostico.problemaCentral}`);
    }

    if(diagnostico.situacionActual){
      partes.push(`La situación actual se caracteriza por lo siguiente: ${diagnostico.situacionActual}`);
    }

    if(diagnostico.magnitudProblema){
      partes.push(`La magnitud del problema se evidencia en: ${diagnostico.magnitudProblema}`);
    }

    if(diagnostico.poblacionAfectada){
      partes.push(`La población afectada corresponde a: ${diagnostico.poblacionAfectada}`);
    }

    if(diagnostico.poblacionObjetivo){
      partes.push(`La población objetivo corresponde a: ${diagnostico.poblacionObjetivo}`);
    }

    const territorio =
    [
      datosGenerales.localizacion,
      datosGenerales.municipio,
      datosGenerales.departamento
    ]
    .filter(Boolean)
    .join(", ");

    if(territorio){
      partes.push(`El área de intervención se localiza en ${territorio}.`);
    }

    if(diagnostico.ofertaActual || diagnostico.demandaActual || diagnostico.brecha){
      partes.push(`Desde el análisis de oferta y demanda, ${diagnostico.ofertaActual || ""} ${diagnostico.demandaActual || ""} ${diagnostico.brecha || ""}`);
    }

    return partes.join("\n\n");

  }

  // =====================================
  // APLICAR AL PROYECTO
  // =====================================

  function aplicarDiagnostico(projectId, data = {}){

    if(!window.MGA || typeof MGA.updateModel !== "function"){
      alert("MGA.updateModel no está disponible.");
      return null;
    }

    const patch =
    generarDiagnostico(data);

    return MGA.updateModel(projectId, patch);

  }

  // =====================================
  // HELPERS
  // =====================================

  function limpiar(texto){

    return String(texto || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\.$/, "");

  }

  function unir(partes){

    return (partes || [])
    .filter(Boolean)
    .join(" ");

  }

  // =====================================
  // API PÚBLICA
  // =====================================

  return {
    normalizarEntrada,
    generarDiagnostico,
    generarProblemaCentral,
    generarSituacionActual,
    generarMagnitud,
    generarJustificacion,
    generarTextoProblema,
    aplicarDiagnostico
  };

})();

window.MotorDiagnostico = MotorDiagnostico;
