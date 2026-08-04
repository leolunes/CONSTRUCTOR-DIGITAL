// =====================================
// MOTOR-FORMULACION-AUTOMATICA.JS
// CONSTRUCTOR MGA PRO
// Completa progresivamente componentes faltantes de la MGA Web
// =====================================

const MotorFormulacionAutomaticaMGA = (() => {

function ahoraISO(){
  return new Date().toISOString();
}

function arr(v){
  return Array.isArray(v) ? v : [];
}

function txt(v){
  return String(v || "").trim();
}

function obtenerProyecto(){
  return window.MGAProjectCore || window.currentProject || window.project || {};
}

function asegurar(project){
  if(window.ProjectCoreMGA){
    return ProjectCoreMGA.normalizarProyecto(project || obtenerProyecto() || {});
  }
  return project || obtenerProyecto() || {};
}

function generarDiagnostico(p){
  const sector = txt(p.identificacionMGA?.sector) || "el sector correspondiente";
  const tipologia = txt(p.identificacionMGA?.tipologia) || "la intervención propuesta";
  const municipio = txt(p.datosBasicos?.municipio || p.identificacionMGA?.localizacion?.municipio) || "el territorio";

  if(!txt(p.diagnosticoMGA?.situacionActual)){
    p.diagnosticoMGA.situacionActual =
      `En ${municipio} se identifica una necesidad de intervención pública asociada a ${tipologia}, en el marco del sector ${sector}. La situación actual evidencia limitaciones en la cobertura, calidad o disponibilidad del servicio o infraestructura requerida por la población beneficiaria, lo que afecta sus condiciones de bienestar y desarrollo.`;
  }

  if(!txt(p.documentosMGA?.diagnostico)){
    p.documentosMGA.diagnostico = p.diagnosticoMGA.situacionActual;
  }

  return p;
}

function generarProblema(p){
  const tipologia = txt(p.identificacionMGA?.tipologia) || "la intervención requerida";

  if(!txt(p.diagnosticoMGA?.problemaCentral)){
    p.diagnosticoMGA.problemaCentral =
      `Limitadas condiciones para garantizar adecuadamente ${tipologia.toLowerCase()} a la población beneficiaria.`;
  }

  if(!txt(p.arbolProblemasMGA?.problemaCentral)){
    p.arbolProblemasMGA.problemaCentral = p.diagnosticoMGA.problemaCentral;
  }

  if(!arr(p.arbolProblemasMGA?.causasDirectas).length){
    p.arbolProblemasMGA.causasDirectas = [
      "Insuficiente infraestructura, dotación o capacidad instalada",
      "Limitada gestión institucional para atender la necesidad identificada",
      "Deficiencias en la prestación, acceso o continuidad del servicio"
    ];
  }

  if(!arr(p.arbolProblemasMGA?.efectosDirectos).length){
    p.arbolProblemasMGA.efectosDirectos = [
      "Baja calidad en la atención o prestación del servicio",
      "Afectación de las condiciones de bienestar de la población",
      "Incremento de brechas sociales, territoriales o económicas"
    ];
  }

  return p;
}

function generarObjetivos(p){
  const problema = txt(p.diagnosticoMGA?.problemaCentral || p.arbolProblemasMGA?.problemaCentral);
  const tipologia = txt(p.identificacionMGA?.tipologia) || "la intervención propuesta";

  if(!txt(p.arbolObjetivosMGA?.objetivoGeneral)){
    if(problema){
      p.arbolObjetivosMGA.objetivoGeneral =
        problema
          .replace(/^Limitadas condiciones para garantizar adecuadamente/i, "Mejorar las condiciones para garantizar adecuadamente")
          .replace(/^Deficiente/i, "Mejorar")
          .replace(/^Insuficiente/i, "Fortalecer");
    }else{
      p.arbolObjetivosMGA.objetivoGeneral =
        `Mejorar las condiciones de acceso y calidad relacionadas con ${tipologia.toLowerCase()} para la población beneficiaria.`;
    }
  }

  if(!arr(p.arbolObjetivosMGA?.objetivosEspecificos).length){
    p.arbolObjetivosMGA.objetivosEspecificos = [
      "Fortalecer las condiciones técnicas, físicas o institucionales requeridas para la intervención",
      "Mejorar el acceso de la población beneficiaria a los bienes o servicios del proyecto",
      "Garantizar condiciones de sostenibilidad para la operación y mantenimiento de la intervención"
    ];
  }

  return p;
}

function generarParticipantes(p){
  if(!arr(p.participantesMGA).length){
    p.participantesMGA = [
      {
        actor:"Entidad territorial o entidad formuladora",
        tipoActor:"Público",
        rol:"Formulador y gestor del proyecto",
        interes:"Atender la necesidad identificada",
        contribucion:"Gestión técnica, administrativa y financiera"
      },
      {
        actor:"Población beneficiaria",
        tipoActor:"Comunitario",
        rol:"Beneficiario directo",
        interes:"Acceder a los beneficios del proyecto",
        contribucion:"Participación social y control ciudadano"
      },
      {
        actor:"Entidad ejecutora o contratista",
        tipoActor:"Ejecutor",
        rol:"Ejecución de actividades",
        interes:"Cumplir el alcance técnico contratado",
        contribucion:"Ejecución física y técnica"
      }
    ];
  }

  return p;
}

function generarPoblacion(p){
  p.poblacionMGA = p.poblacionMGA || {};
  p.poblacionMGA.poblacionAfectada = p.poblacionMGA.poblacionAfectada || {};
  p.poblacionMGA.poblacionObjetivo = p.poblacionMGA.poblacionObjetivo || {};
  p.poblacionMGA.caracterizacion = p.poblacionMGA.caracterizacion || {};

  if(!txt(p.poblacionMGA.poblacionAfectada.descripcion)){
    p.poblacionMGA.poblacionAfectada.descripcion =
      "Corresponde a la población que actualmente presenta la necesidad o problemática que origina el proyecto.";
  }

  if(!txt(p.poblacionMGA.poblacionObjetivo.descripcion)){
    p.poblacionMGA.poblacionObjetivo.descripcion =
      "Corresponde a la población que recibirá directamente los beneficios de la intervención.";
  }

  if(!txt(p.poblacionMGA.caracterizacion.grupoPoblacional)){
    p.poblacionMGA.caracterizacion.grupoPoblacional =
      "Población residente en el área de influencia del proyecto, según la naturaleza de la intervención.";
  }

  return p;
}

function generarAlternativas(p){
  const objetivo = txt(p.arbolObjetivosMGA?.objetivoGeneral) || "Atender la necesidad identificada";

  if(!arr(p.alternativasMGA).length){
    p.alternativasMGA = [
      {
        id:"alt_1",
        nombre:"Ejecutar la intervención propuesta",
        descripcion:objetivo,
        seleccionada:true
      },
      {
        id:"alt_2",
        nombre:"No realizar intervención",
        descripcion:"Mantener las condiciones actuales sin ejecutar acciones de inversión.",
        seleccionada:false
      }
    ];
  }

  if(!txt(p.alternativaSeleccionadaMGA?.descripcion)){
    p.alternativaSeleccionadaMGA = {
      id:"alt_1",
      nombre:"Ejecutar la intervención propuesta",
      descripcion:objetivo,
      justificacion:"Se selecciona esta alternativa por atender directamente la problemática identificada y presentar mayor conveniencia social, técnica e institucional."
    };
  }

  return p;
}

function generarCadenaValor(p){
  const objetivo = txt(p.arbolObjetivosMGA?.objetivoGeneral);
  const tipologia = txt(p.identificacionMGA?.tipologia) || "intervención pública";

  p.cadenaValorMGA = p.cadenaValorMGA || {};

  if(!txt(p.cadenaValorMGA.objetivoGeneral)){
    p.cadenaValorMGA.objetivoGeneral = objetivo;
  }

  if(!arr(p.cadenaValorMGA.objetivosEspecificos).length){
    p.cadenaValorMGA.objetivosEspecificos = arr(p.arbolObjetivosMGA?.objetivosEspecificos);
  }

  if(!arr(p.cadenaValorMGA.productos).length){
    p.cadenaValorMGA.productos = [
      {
        id:"prod_1",
        nombreProducto:`${tipologia} implementada`,
        descripcion:`Producto principal asociado a ${tipologia.toLowerCase()}.`,
        unidadMedida:"Unidad",
        meta:1
      }
    ];
  }

  if(!arr(p.cadenaValorMGA.actividades).length){
    p.cadenaValorMGA.actividades = [
      { id:"act_1", productoId:"prod_1", descripcion:"Realizar estudios, diseños o actividades preparatorias", costo:0 },
      { id:"act_2", productoId:"prod_1", descripcion:"Ejecutar la intervención principal del proyecto", costo:0 },
      { id:"act_3", productoId:"prod_1", descripcion:"Realizar interventoría, supervisión y seguimiento", costo:0 }
    ];
  }

  return p;
}

function generarIndicadores(p){
  if(!arr(p.indicadoresMGA).length){
    p.indicadoresMGA = [
      {
        id:"ind_1",
        nombre:"Producto principal entregado",
        tipo:"Producto",
        unidadMedida:"Unidad",
        lineaBase:0,
        meta:1,
        fuenteVerificacion:"Actas de recibo, informes de supervisión e interventoría",
        frecuencia:"Mensual"
      },
      {
        id:"ind_2",
        nombre:"Porcentaje de avance físico del proyecto",
        tipo:"Gestión",
        unidadMedida:"Porcentaje",
        lineaBase:0,
        meta:100,
        fuenteVerificacion:"Informes de avance físico y financiero",
        frecuencia:"Mensual"
      }
    ];
  }else{
    p.indicadoresMGA = p.indicadoresMGA.map((i,idx)=>({
      ...i,
      lineaBase: i.lineaBase ?? 0,
      meta: i.meta ?? (idx === 0 ? 1 : 100),
      fuenteVerificacion: i.fuenteVerificacion || "Actas, informes de supervisión e interventoría",
      frecuencia: i.frecuencia || "Mensual"
    }));
  }

  return p;
}

function generarRiesgos(p){
  if(!arr(p.riesgosMGA).length){
    p.riesgosMGA = [
      {
        id:"riesgo_1",
        riesgo:"Retrasos en la ejecución de actividades",
        categoria:"Operativo",
        probabilidad:"Media",
        impacto:"Alto",
        mitigacion:"Realizar seguimiento permanente al cronograma y aplicar medidas correctivas oportunas.",
        responsable:"Entidad ejecutora"
      },
      {
        id:"riesgo_2",
        riesgo:"Incremento de costos durante la ejecución",
        categoria:"Financiero",
        probabilidad:"Media",
        impacto:"Alto",
        mitigacion:"Revisar precios, cantidades y disponibilidad presupuestal antes de la contratación.",
        responsable:"Entidad formuladora"
      },
      {
        id:"riesgo_3",
        riesgo:"Baja apropiación social del proyecto",
        categoria:"Social",
        probabilidad:"Media",
        impacto:"Medio",
        mitigacion:"Promover participación comunitaria y socialización del proyecto.",
        responsable:"Entidad territorial"
      }
    ];
  }else{
    p.riesgosMGA = p.riesgosMGA.map(r=>({
      ...r,
      mitigacion: r.mitigacion || r.medidaMitigacion || "Implementar acciones de seguimiento y mitigación durante la ejecución.",
      responsable: r.responsable || "Entidad ejecutora"
    }));
  }

  return p;
}

function generarFuentes(p){
  if(!arr(p.fuentesFinanciacionMGA).length){
    p.fuentesFinanciacionMGA = [
      {
        id:"fuente_1",
        fuente:"Recursos por definir",
        tipoFuente:"Pendiente",
        entidadFinanciadora:"",
        vigencia:"",
        valor:0
      }
    ];
  }

  return p;
}

function generarCronograma(p){
  const actividades = arr(p.cadenaValorMGA?.actividades);

  if(!arr(p.cronogramaMGA?.actividades).length){
    p.cronogramaMGA = {
      fechaInicio:"",
      fechaFinal:"",
      duracionMeses:Math.max(3, actividades.length || 3),
      actividades:actividades.map((a,i)=>({
        id:"cron_" + (i+1),
        actividad:a.descripcion || a.nombre || `Actividad ${i+1}`,
        mesInicio:i+1,
        mesFin:i+1,
        costoProgramado:a.costo || 0
      }))
    };
  }

  return p;
}

function generarSostenibilidad(p){
  p.sostenibilidadMGA = p.sostenibilidadMGA || {};

  p.sostenibilidadMGA.tecnica = p.sostenibilidadMGA.tecnica ||
    "La sostenibilidad técnica se garantiza mediante la correcta ejecución, supervisión, recibo y operación de los productos del proyecto, de acuerdo con las especificaciones técnicas aplicables.";

  p.sostenibilidadMGA.financiera = p.sostenibilidadMGA.financiera ||
    "La sostenibilidad financiera dependerá de la disponibilidad de recursos para la operación, mantenimiento y seguimiento posterior, los cuales deberán ser previstos por la entidad responsable.";

  p.sostenibilidadMGA.institucional = p.sostenibilidadMGA.institucional ||
    "La entidad responsable deberá asumir la administración, operación, mantenimiento y seguimiento de los bienes o servicios generados por el proyecto.";

  p.sostenibilidadMGA.ambiental = p.sostenibilidadMGA.ambiental ||
    "Durante la ejecución y operación se deberán cumplir las medidas ambientales aplicables y las buenas prácticas de manejo ambiental.";

  return p;
}

function generarDocumentos(p){
  p.documentosMGA = p.documentosMGA || {};

  if(!txt(p.documentosMGA.justificacion)){
    p.documentosMGA.justificacion = txt(p.diagnosticoMGA?.justificacion) ||
      "El proyecto se justifica por la necesidad de atender una problemática pública identificada, mejorar las condiciones de acceso y calidad para la población beneficiaria y contribuir al cumplimiento de los objetivos de desarrollo territorial.";
  }

  if(!txt(p.documentosMGA.resumenEjecutivo)){
    p.documentosMGA.resumenEjecutivo =
      `El proyecto "${p.datosBasicos?.nombreProyecto || "sin nombre definido"}" busca ${txt(p.arbolObjetivosMGA?.objetivoGeneral).toLowerCase() || "atender la necesidad identificada"}. La intervención se desarrolla en el sector ${p.identificacionMGA?.sector || "correspondiente"} y contempla productos, actividades, indicadores, riesgos y condiciones de sostenibilidad orientadas a garantizar resultados verificables.`;
  }

  if(!txt(p.documentosMGA.beneficios)){
    p.documentosMGA.beneficios =
      "Los beneficios esperados incluyen el mejoramiento de las condiciones de acceso, calidad, cobertura, bienestar y desarrollo de la población beneficiaria.";
  }

  if(!txt(p.documentosMGA.sostenibilidad)){
    p.documentosMGA.sostenibilidad = [
      p.sostenibilidadMGA?.tecnica,
      p.sostenibilidadMGA?.financiera,
      p.sostenibilidadMGA?.institucional,
      p.sostenibilidadMGA?.ambiental
    ].filter(Boolean).join("\n\n");
  }

  return p;
}

function recalcular(p){
  if(window.PanelCoberturaMGAWeb){
    const c = PanelCoberturaMGAWeb.evaluar(p);
    p.coberturaMGAWeb = c;
    p.estado = p.estado || {};
    p.estado.coberturaMGAWeb = c.porcentaje;
  }

  if(window.InspectorMGAWeb){
    const i = InspectorMGAWeb.evaluar(p);
    p.inspectorMGA = i;
    p.estado = p.estado || {};
    p.estado.listoParaMGAWeb = i.listoParaMGAWeb;
  }

  if(window.ProjectCoreMGA){
    ProjectCoreMGA.actualizarMemoria(p);
  }

  return p;
}

function completarTodo(project=null){
  const p = asegurar(project);

  p.diagnosticoMGA = p.diagnosticoMGA || {};
  p.arbolProblemasMGA = p.arbolProblemasMGA || {};
  p.arbolObjetivosMGA = p.arbolObjetivosMGA || {};
  p.documentosMGA = p.documentosMGA || {};

  generarDiagnostico(p);
  generarProblema(p);
  generarObjetivos(p);
  generarParticipantes(p);
  generarPoblacion(p);
  generarAlternativas(p);
  generarCadenaValor(p);
  generarIndicadores(p);
  generarRiesgos(p);
  generarFuentes(p);
  generarCronograma(p);
  generarSostenibilidad(p);
  generarDocumentos(p);

  p.historialInteligente = arr(p.historialInteligente);
  p.historialInteligente.push({
    fecha:ahoraISO(),
    tipo:"FORMULACION_AUTOMATICA_MGA",
    titulo:"Formulación automática ejecutada",
    descripcion:"El motor completó componentes faltantes de la MGA Web."
  });

  recalcular(p);
  window.MGAProjectCore = p;

  return {
    ok:true,
    project:p,
    cobertura:p.coberturaMGAWeb?.porcentaje || 0,
    inspector:p.inspectorMGA || null,
    mensaje:"Formulación automática completada."
  };
}

async function guardar(projectId, project){
  if(projectId && window.ProjectCoreMGA){
    await ProjectCoreMGA.guardar(projectId, project);
  }
}

function crearUI(contenedorId="panelFormulacionAutomaticaMGA"){
  const cont = document.getElementById(contenedorId);
  if(!cont) return;

  cont.innerHTML = `
    <section class="formulacion-auto-card">
      <div class="formulacion-auto-head">
        <div>
          <h2>⚙️ Motor de Formulación Automática</h2>
          <p>Completa los componentes faltantes de la MGA Web con base en la información disponible del proyecto.</p>
        </div>
      </div>

      <div class="formulacion-auto-actions">
        <button class="btn primary" id="btnCompletarMGAAutomatico" type="button">Completar MGA automáticamente</button>
        <button class="btn" id="btnActualizarFormulacionAuto" type="button">Actualizar estado</button>
      </div>

      <div id="resultadoFormulacionAutomaticaMGA" class="formulacion-auto-result"></div>
    </section>
  `;

  const btn = document.getElementById("btnCompletarMGAAutomatico");
  const btnAct = document.getElementById("btnActualizarFormulacionAuto");
  const out = document.getElementById("resultadoFormulacionAutomaticaMGA");

  btn.onclick = async () => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("projectId") || "";

    const res = completarTodo(obtenerProyecto());
    await guardar(projectId, res.project);

    if(window.PanelCoberturaMGAWeb){
      PanelCoberturaMGAWeb.render("panelCoberturaMGAWeb", res.project);
    }

    if(window.InspectorMGAWeb){
      InspectorMGAWeb.render("panelInspectorMGAWeb", res.project);
    }

    if(window.AsesorExpertoMGA){
      AsesorExpertoMGA.crear("panelAsesorExpertoMGA");
    }

    if(window.ExportadorMGAWeb){
      ExportadorMGAWeb.crear("panelExportadorMGAWeb");
    }

    out.innerHTML = `
      <div class="item">
        <div class="name">✅ Formulación automática ejecutada</div>
        <div class="muted small">
          Cobertura MGA Web: ${res.cobertura}%<br>
          Revise el Inspector MGA y el Exportador MGA Web.
        </div>
      </div>
    `;
  };

  btnAct.onclick = () => {
    const p = recalcular(obtenerProyecto());
    out.innerHTML = `
      <div class="item">
        <div class="name">Estado actualizado</div>
        <div class="muted small">Cobertura actual: ${p.coberturaMGAWeb?.porcentaje || 0}%</div>
      </div>
    `;
  };
}

return {
  completarTodo,
  recalcular,
  crearUI
};

})();

window.MotorFormulacionAutomaticaMGA = MotorFormulacionAutomaticaMGA;
