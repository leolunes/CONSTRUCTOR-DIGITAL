// =====================================
// CEREBRO-MGA.JS
// CONSTRUCTOR MGA PRO
// Cerebro inteligente para construir progresivamente el 100% de la MGA Web
// =====================================

const CerebroMGA = (() => {

function ahoraISO(){
  return new Date().toISOString();
}

function arr(v){
  return Array.isArray(v) ? v : [];
}

function txt(v){
  return String(v || "").trim();
}

function esc(v){
  return String(v || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

function normalizar(v){
  return String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .trim();
}

const BASE_TIPOLOGIAS = [
  {
    claves:["centro vida","adulto mayor","centro dia","persona mayor"],
    sector:"Inclusión Social",
    tipologia:"Centro Vida para Adulto Mayor",
    producto:"Servicio de atención integral a adultos mayores implementado",
    problema:"Limitado acceso de la población adulta mayor a servicios integrales de atención, cuidado, recreación, alimentación y acompañamiento psicosocial.",
    objetivo:"Mejorar el acceso de la población adulta mayor a servicios integrales de atención mediante la construcción, adecuación o dotación de un Centro Vida.",
    causas:[
      "Insuficiente infraestructura social para la atención de adultos mayores",
      "Limitada oferta institucional de servicios integrales",
      "Baja capacidad para brindar atención psicosocial, recreativa y nutricional"
    ],
    efectos:[
      "Aumento de condiciones de vulnerabilidad en la población adulta mayor",
      "Baja participación social y comunitaria de los adultos mayores",
      "Deterioro de la calidad de vida de la población beneficiaria"
    ],
    productos:[
      "Centro Vida construido o adecuado",
      "Dotación para atención integral instalada",
      "Servicios integrales para adultos mayores fortalecidos"
    ],
    actividades:[
      "Realizar estudios y diseños",
      "Construir o adecuar infraestructura física",
      "Adquirir e instalar dotación",
      "Implementar acciones de atención integral",
      "Realizar interventoría y seguimiento"
    ],
    indicadores:[
      "Centros Vida construidos o adecuados",
      "Adultos mayores beneficiados",
      "Porcentaje de avance físico del proyecto"
    ],
    riesgos:[
      "Retrasos en la ejecución de obra",
      "Insuficiencia de recursos para operación",
      "Baja participación de la población beneficiaria"
    ]
  },
  {
    claves:["placa huella","via rural","vía rural","camino rural"],
    sector:"Transporte",
    tipologia:"Mejoramiento de vía rural mediante placa huella",
    producto:"Vía rural mejorada",
    problema:"Dificultad en la movilidad de la población rural por deterioro de la vía y condiciones deficientes de transitabilidad.",
    objetivo:"Mejorar las condiciones de movilidad de la población rural mediante la construcción de placa huella y obras complementarias.",
    causas:[
      "Deterioro de la superficie de rodadura",
      "Deficiente manejo de aguas lluvias",
      "Limitado mantenimiento vial"
    ],
    efectos:[
      "Aumento en tiempos de desplazamiento",
      "Dificultades para transportar productos agropecuarios",
      "Mayor riesgo de accidentalidad"
    ],
    productos:[
      "Placa huella construida",
      "Obras de drenaje construidas",
      "Señalización instalada"
    ],
    actividades:[
      "Realizar localización y replanteo",
      "Ejecutar movimiento de tierras",
      "Construir placa huella",
      "Construir obras de drenaje",
      "Instalar señalización",
      "Realizar interventoría"
    ],
    indicadores:[
      "Metros lineales de placa huella construidos",
      "Número de obras de drenaje construidas",
      "Porcentaje de avance físico"
    ],
    riesgos:[
      "Afectación por temporada de lluvias",
      "Dificultades prediales",
      "Incremento de costos de materiales"
    ]
  },
  {
    claves:["polideportivo","cancha","escenario deportivo","coliseo"],
    sector:"Deporte y Recreación",
    tipologia:"Construcción o mejoramiento de escenario deportivo",
    producto:"Escenario deportivo construido o mejorado",
    problema:"Insuficiente infraestructura deportiva y recreativa para el desarrollo de actividades físicas, comunitarias y de aprovechamiento del tiempo libre.",
    objetivo:"Mejorar el acceso de la comunidad a infraestructura deportiva y recreativa mediante la construcción o mejoramiento de un escenario deportivo.",
    causas:[
      "Déficit de espacios deportivos adecuados",
      "Deterioro de la infraestructura existente",
      "Limitadas oportunidades para la práctica deportiva"
    ],
    efectos:[
      "Baja participación comunitaria en actividades deportivas",
      "Uso inadecuado del tiempo libre",
      "Reducción de oportunidades para la integración social"
    ],
    productos:[
      "Escenario deportivo construido o mejorado",
      "Dotación deportiva instalada",
      "Espacio público complementario adecuado"
    ],
    actividades:[
      "Realizar estudios y diseños",
      "Ejecutar obras civiles",
      "Instalar dotación deportiva",
      "Adecuar zonas complementarias",
      "Realizar interventoría"
    ],
    indicadores:[
      "Escenarios deportivos construidos o mejorados",
      "Metros cuadrados intervenidos",
      "Población beneficiada"
    ],
    riesgos:[
      "Retrasos en obra",
      "Uso inadecuado del escenario",
      "Insuficiente mantenimiento posterior"
    ]
  },
  {
    claves:["acueducto","agua potable","red de agua","ptap"],
    sector:"Agua Potable y Saneamiento Básico",
    tipologia:"Construcción u optimización de sistema de acueducto",
    producto:"Sistema de acueducto optimizado",
    problema:"Deficiente acceso de la población al servicio de agua potable en condiciones de continuidad, cobertura y calidad.",
    objetivo:"Mejorar el acceso al servicio de agua potable mediante la construcción, ampliación u optimización del sistema de acueducto.",
    causas:[
      "Infraestructura de acueducto insuficiente o deteriorada",
      "Baja capacidad de tratamiento o almacenamiento",
      "Deficiencias en redes de distribución"
    ],
    efectos:[
      "Riesgos para la salud pública",
      "Baja calidad de vida de la población",
      "Limitaciones para el desarrollo social y económico"
    ],
    productos:[
      "Redes de acueducto instaladas u optimizadas",
      "Sistema de tratamiento mejorado",
      "Sistema de almacenamiento construido u optimizado"
    ],
    actividades:[
      "Realizar estudios y diseños",
      "Construir u optimizar redes",
      "Construir u optimizar sistema de tratamiento",
      "Realizar pruebas hidráulicas",
      "Ejecutar interventoría"
    ],
    indicadores:[
      "Usuarios beneficiados con servicio de agua potable",
      "Metros lineales de red instalada",
      "Sistema de acueducto optimizado"
    ],
    riesgos:[
      "Interferencia con redes existentes",
      "Dificultades en permisos ambientales",
      "Incremento de costos de tubería y equipos"
    ]
  }
];

function detectarTipologia(texto){
  const t = normalizar(texto);
  let mejor = null;
  let puntaje = 0;

  BASE_TIPOLOGIAS.forEach(x => {
    const p = x.claves.reduce((s,k) => s + (t.includes(normalizar(k)) ? 1 : 0), 0);
    if(p > puntaje){
      puntaje = p;
      mejor = x;
    }
  });

  return mejor || null;
}

function extraerDatos(texto){
  const numeros = String(texto || "").match(/\d+/g) || [];
  const cantidad = numeros.length ? Number(numeros[0]) : 0;

  let municipio = "";
  const m = String(texto || "").match(/en\s+([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+?)(?:\.|,|$)/);
  if(m) municipio = txt(m[1]);

  return { cantidad, municipio };
}

function obtenerProyecto(){
  return window.MGAProjectCore || window.currentProject || window.project || {};
}

function construirDesdeIdea(idea, project = null){
  const p = window.ProjectCoreMGA
    ? ProjectCoreMGA.normalizarProyecto(project || obtenerProyecto() || {})
    : (project || obtenerProyecto() || {});

  const modelo = detectarTipologia(idea);
  const datos = extraerDatos(idea);

  if(!modelo){
    return {
      ok:false,
      mensaje:"No se encontró una tipología suficiente para construir el proyecto automáticamente.",
      project:p
    };
  }

  p.idea = p.idea || {};
  p.idea.texto = idea;
  p.idea.origen = "Cerebro MGA";
  p.idea.fecha = ahoraISO();

  p.identificacionMGA = p.identificacionMGA || {};
  p.identificacionMGA.sector = modelo.sector;
  p.identificacionMGA.tipologia = modelo.tipologia;
  p.identificacionMGA.productoMGA = modelo.producto;

  p.datosBasicos = p.datosBasicos || {};
  if(!p.datosBasicos.nombreProyecto){
    p.datosBasicos.nombreProyecto = `${modelo.tipologia}${datos.municipio ? " en " + datos.municipio : ""}`;
  }
  if(datos.municipio) p.datosBasicos.municipio = datos.municipio;

  p.diagnosticoMGA = p.diagnosticoMGA || {};
  p.diagnosticoMGA.problemaCentral = modelo.problema;
  p.diagnosticoMGA.situacionActual =
    `En el territorio se evidencia ${modelo.problema.toLowerCase()} Esta situación afecta la calidad de vida de la población beneficiaria y limita el acceso adecuado a bienes y servicios públicos.`;
  p.diagnosticoMGA.justificacion =
    `El proyecto se justifica por la necesidad de atender la problemática identificada y generar condiciones que permitan mejorar el bienestar de la población beneficiaria mediante una intervención pública pertinente, sostenible y técnicamente viable.`;

  p.arbolProblemasMGA = {
    problemaCentral:modelo.problema,
    causasDirectas:modelo.causas,
    causasIndirectas:[],
    efectosDirectos:modelo.efectos,
    efectosIndirectos:[]
  };

  p.arbolObjetivosMGA = {
    objetivoGeneral:modelo.objetivo,
    objetivosEspecificos:[
      "Fortalecer la infraestructura necesaria para la prestación del servicio o intervención pública",
      "Mejorar las condiciones de acceso de la población beneficiaria",
      "Garantizar la sostenibilidad técnica, social e institucional del proyecto"
    ],
    medios:modelo.causas.map(c => c.replace(/^Insuficiente|^Deficiente|^Limitada|^Limitado|^Baja|^Deterioro/i,"Fortalecimiento de")),
    fines:modelo.efectos.map(e => "Reducción de " + e.toLowerCase())
  };

  p.poblacionMGA = p.poblacionMGA || {};
  p.poblacionMGA.poblacionObjetivo = p.poblacionMGA.poblacionObjetivo || {};
  if(datos.cantidad){
    p.poblacionMGA.poblacionObjetivo.cantidad = datos.cantidad;
    p.poblacionMGA.poblacionObjetivo.unidad = "Personas";
    p.poblacionMGA.poblacionObjetivo.descripcion = `Población beneficiaria directa estimada en ${datos.cantidad} personas.`;
  }

  p.participantesMGA = [
    { actor:"Entidad territorial", tipoActor:"Público", rol:"Formulador y/o ejecutor", interes:"Ejecutar el proyecto", contribucion:"Gestión técnica, administrativa y financiera" },
    { actor:"Comunidad beneficiaria", tipoActor:"Comunitario", rol:"Beneficiario", interes:"Recibir los beneficios del proyecto", contribucion:"Participación y control social" },
    { actor:"Entidad financiadora", tipoActor:"Público", rol:"Financiador", interes:"Apoyar la inversión pública", contribucion:"Aporte de recursos" }
  ];

  p.alternativasMGA = [
    { id:"alt_1", nombre:"Ejecutar la intervención propuesta", descripcion:modelo.objetivo, seleccionada:true },
    { id:"alt_2", nombre:"No intervenir", descripcion:"Mantener las condiciones actuales sin ejecutar inversiones.", seleccionada:false }
  ];

  p.alternativaSeleccionadaMGA = {
    id:"alt_1",
    nombre:"Ejecutar la intervención propuesta",
    descripcion:modelo.objetivo,
    justificacion:"Se selecciona por ser la alternativa que atiende de manera directa la problemática identificada y genera mayores beneficios sociales."
  };

  p.cadenaValorMGA = {
    objetivoGeneral:modelo.objetivo,
    objetivosEspecificos:p.arbolObjetivosMGA.objetivosEspecificos,
    productos:modelo.productos.map((x,i) => ({
      id:"prod_" + (i+1),
      nombreProducto:x,
      descripcion:x,
      unidadMedida:i === 0 ? "Unidad" : "",
      meta:1
    })),
    actividades:modelo.actividades.map((x,i) => ({
      id:"act_" + (i+1),
      descripcion:x,
      productoId:"prod_1",
      costo:0
    })),
    relacionPresupuesto:[]
  };

  p.indicadoresMGA = modelo.indicadores.map((x,i) => ({
    id:"ind_" + (i+1),
    nombre:x,
    tipo:i === 0 ? "Producto" : "Gestión",
    unidadMedida:i === 1 && datos.cantidad ? "Personas" : "Unidad",
    lineaBase:0,
    meta:i === 1 && datos.cantidad ? datos.cantidad : 1,
    fuenteVerificacion:"Informes de supervisión, actas de recibo e informes de interventoría",
    frecuencia:"Mensual"
  }));

  p.riesgosMGA = modelo.riesgos.map((x,i) => ({
    id:"riesgo_" + (i+1),
    riesgo:x,
    categoria:i === 0 ? "Técnico" : "Operativo",
    probabilidad:"Media",
    impacto:"Alto",
    mitigacion:"Realizar seguimiento técnico, administrativo y financiero durante la ejecución del proyecto.",
    responsable:"Entidad ejecutora"
  }));

  p.sostenibilidadMGA = {
    tecnica:"La sostenibilidad técnica se garantiza mediante la adecuada planeación, ejecución, supervisión y entrega de las obras, bienes o servicios previstos.",
    financiera:"La sostenibilidad financiera dependerá de la apropiación de recursos para operación, mantenimiento y seguimiento posterior.",
    institucional:"La entidad territorial o responsable del proyecto asumirá las acciones necesarias para garantizar su funcionamiento.",
    ambiental:"Se deberán cumplir las medidas ambientales aplicables según la naturaleza de la intervención.",
    operacion:"La operación será asumida por la entidad competente o responsable del servicio.",
    mantenimiento:"Se deberá prever un plan de mantenimiento preventivo y correctivo."
  };

  p.documentosMGA = p.documentosMGA || {};
  p.documentosMGA.diagnostico = p.diagnosticoMGA.situacionActual;
  p.documentosMGA.justificacion = p.diagnosticoMGA.justificacion;
  p.documentosMGA.resumenEjecutivo =
    `El proyecto denominado "${p.datosBasicos.nombreProyecto}" busca ${modelo.objetivo.toLowerCase()} La intervención se enmarca en el sector ${modelo.sector} y está orientada a beneficiar a la población objetivo mediante productos, actividades e indicadores definidos en la cadena de valor.`;
  p.documentosMGA.sostenibilidad = `${p.sostenibilidadMGA.tecnica} ${p.sostenibilidadMGA.financiera} ${p.sostenibilidadMGA.institucional}`;
  p.documentosMGA.beneficios =
    "El proyecto permitirá mejorar las condiciones de acceso, calidad, cobertura y bienestar de la población beneficiaria, contribuyendo al cumplimiento de los objetivos de inversión pública.";

  p.presupuestoPreliminarMGA = {
    modo:"preliminar",
    sector:modelo.sector,
    tipologia:modelo.tipologia,
    alcance:idea,
    capitulosSugeridos:modelo.actividades.map((a,i) => ({
      capitulo:String(i+1),
      nombre:a,
      valorEstimado:0
    })),
    observacion:"Presupuesto preliminar generado por Cerebro MGA. Debe conectarse con el presupuesto APU definitivo."
  };

  p.fuentesFinanciacionMGA = arr(p.fuentesFinanciacionMGA);

  p.cronogramaMGA = {
    fechaInicio:"",
    fechaFinal:"",
    duracionMeses:6,
    actividades:modelo.actividades.map((a,i) => ({
      id:"cron_" + (i+1),
      actividad:a,
      mesInicio:i+1,
      mesFin:i+1,
      costoProgramado:0
    }))
  };

  p.historialInteligente = arr(p.historialInteligente);
  p.historialInteligente.push({
    fecha:ahoraISO(),
    tipo:"CEREBRO_MGA",
    titulo:"Proyecto generado desde idea inicial",
    descripcion:`Se generó estructura MGA base para la tipología ${modelo.tipologia}.`
  });

  recalcular(p);

  window.MGAProjectCore = p;

  return {
    ok:true,
    mensaje:"Estructura MGA generada correctamente por Cerebro MGA.",
    modelo,
    project:p
  };
}

function recalcular(project){
  if(window.PanelCoberturaMGAWeb){
    const c = PanelCoberturaMGAWeb.evaluar(project);
    project.coberturaMGAWeb = c;
    project.estado = project.estado || {};
    project.estado.coberturaMGAWeb = c.porcentaje;
  }

  if(window.InspectorMGAWeb){
    project.inspectorMGA = InspectorMGAWeb.evaluar(project);
    project.estado = project.estado || {};
    project.estado.listoParaMGAWeb = project.inspectorMGA.listoParaMGAWeb;
  }

  if(window.ProjectCoreMGA){
    ProjectCoreMGA.actualizarMemoria(project);
  }

  return project;
}

async function guardar(projectId, project){
  if(projectId && window.ProjectCoreMGA){
    await ProjectCoreMGA.guardar(projectId, project);
  }
}

function crearUI(contenedorId="panelCerebroMGA"){
  const cont = document.getElementById(contenedorId);
  if(!cont) return;

  cont.innerHTML = `
    <section class="cerebro-mga-card">
      <div class="cerebro-head">
        <div>
          <h2>🧠 Cerebro MGA</h2>
          <p>Genere una estructura MGA completa desde una idea inicial del proyecto.</p>
        </div>
      </div>

      <label>Idea del proyecto</label>
      <textarea id="txtIdeaCerebroMGA" rows="4" placeholder="Ej: Construcción de un Centro Vida para 250 adultos mayores en Floridablanca"></textarea>

      <div class="cerebro-actions">
        <button class="btn primary" id="btnGenerarCerebroMGA" type="button">Generar MGA inteligente</button>
        <button class="btn" id="btnRecalcularCerebroMGA" type="button">Recalcular cobertura</button>
      </div>

      <div id="resultadoCerebroMGA" class="cerebro-result"></div>
    </section>
  `;

  const btn = document.getElementById("btnGenerarCerebroMGA");
  const btnRec = document.getElementById("btnRecalcularCerebroMGA");
  const out = document.getElementById("resultadoCerebroMGA");

  btn.onclick = async () => {
    const idea = txt(document.getElementById("txtIdeaCerebroMGA")?.value);
    if(!idea){
      alert("Escriba la idea del proyecto.");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("projectId") || "";

    const res = construirDesdeIdea(idea, obtenerProyecto());

    if(!res.ok){
      out.innerHTML = `<div class="item"><b>⚠️ ${esc(res.mensaje)}</b></div>`;
      return;
    }

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

    out.innerHTML = `
      <div class="item">
        <div class="name">✅ MGA base generada</div>
        <div class="muted small">
          Sector: ${esc(res.modelo.sector)}<br>
          Tipología: ${esc(res.modelo.tipologia)}<br>
          Problema: ${esc(res.modelo.problema)}
        </div>
      </div>
    `;
  };

  btnRec.onclick = () => {
    const p = recalcular(obtenerProyecto());

    if(window.PanelCoberturaMGAWeb){
      PanelCoberturaMGAWeb.render("panelCoberturaMGAWeb", p);
    }

    if(window.InspectorMGAWeb){
      InspectorMGAWeb.render("panelInspectorMGAWeb", p);
    }

    if(window.AsesorExpertoMGA){
      AsesorExpertoMGA.crear("panelAsesorExpertoMGA");
    }

    out.innerHTML = `<div class="item"><div class="name">✅ Cobertura recalculada</div></div>`;
  };
}

return {
  BASE_TIPOLOGIAS,
  detectarTipologia,
  construirDesdeIdea,
  recalcular,
  crearUI
};

})();

window.CerebroMGA = CerebroMGA;
