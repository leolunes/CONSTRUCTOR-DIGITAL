// =====================================
// EXPORTADOR-MGA-WEB.JS
// CONSTRUCTOR MGA PRO
// Genera textos y componentes listos para copiar en MGA Web
// =====================================

const ExportadorMGAWeb = (() => {

function txt(v){
  return String(v || "").trim();
}

function arr(v){
  return Array.isArray(v) ? v : [];
}

function esc(v){
  return String(v || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

function obtenerProyecto(){
  return window.MGAProjectCore || window.currentProject || window.project || {};
}

function listaTexto(items, campo=""){
  return arr(items).map((x,i) => {
    if(typeof x === "string") return `${i+1}. ${x}`;
    return `${i+1}. ${x[campo] || x.nombre || x.descripcion || x.nombreProducto || x.riesgo || ""}`;
  }).filter(Boolean).join("\n");
}

function construirPaquete(project=null){
  const p = project || obtenerProyecto();

  const problema = txt(p.diagnosticoMGA?.problemaCentral || p.arbolProblemasMGA?.problemaCentral);
  const objetivo = txt(p.arbolObjetivosMGA?.objetivoGeneral);
  const causas = listaTexto(p.arbolProblemasMGA?.causasDirectas);
  const efectos = listaTexto(p.arbolProblemasMGA?.efectosDirectos);
  const objetivosEsp = listaTexto(p.arbolObjetivosMGA?.objetivosEspecificos);

  const productos = arr(p.cadenaValorMGA?.productos).map((x,i)=>({
    numero:i+1,
    producto:x.nombreProducto || x.nombre || x.descripcion || "",
    unidad:x.unidadMedida || "",
    meta:x.meta || ""
  }));

  const actividades = arr(p.cadenaValorMGA?.actividades).map((x,i)=>({
    numero:i+1,
    actividad:x.descripcion || x.nombre || "",
    producto:x.productoId || "",
    costo:x.costo || 0
  }));

  const indicadores = arr(p.indicadoresMGA).map((x,i)=>({
    numero:i+1,
    indicador:x.nombre || "",
    tipo:x.tipo || "",
    unidad:x.unidadMedida || "",
    lineaBase:x.lineaBase ?? "",
    meta:x.meta ?? "",
    fuente:x.fuenteVerificacion || "",
    frecuencia:x.frecuencia || ""
  }));

  const riesgos = arr(p.riesgosMGA).map((x,i)=>({
    numero:i+1,
    riesgo:x.riesgo || x.nombre || "",
    categoria:x.categoria || "",
    probabilidad:x.probabilidad || "",
    impacto:x.impacto || "",
    mitigacion:x.mitigacion || x.medidaMitigacion || "",
    responsable:x.responsable || ""
  }));

  const fuentes = arr(p.fuentesFinanciacionMGA).map((x,i)=>({
    numero:i+1,
    fuente:x.fuente || x.nombre || "",
    vigencia:x.vigencia || "",
    valor:x.valor || 0
  }));

  return {
    identificacion:{
      nombreProyecto:p.datosBasicos?.nombreProyecto || "",
      entidadFormuladora:p.datosBasicos?.entidadFormuladora || "",
      sector:p.identificacionMGA?.sector || "",
      tipologia:p.identificacionMGA?.tipologia || "",
      municipio:p.datosBasicos?.municipio || p.identificacionMGA?.localizacion?.municipio || "",
      departamento:p.datosBasicos?.departamento || p.identificacionMGA?.localizacion?.departamento || ""
    },
    problema:{
      diagnostico:p.documentosMGA?.diagnostico || p.diagnosticoMGA?.situacionActual || "",
      problemaCentral:problema,
      causas,
      efectos,
      magnitud:p.diagnosticoMGA?.magnitudProblema || ""
    },
    poblacion:{
      afectada:p.poblacionMGA?.poblacionAfectada?.descripcion || "",
      afectadaCantidad:p.poblacionMGA?.poblacionAfectada?.cantidad || "",
      objetivo:p.poblacionMGA?.poblacionObjetivo?.descripcion || "",
      objetivoCantidad:p.poblacionMGA?.poblacionObjetivo?.cantidad || "",
      caracterizacion:p.poblacionMGA?.caracterizacion?.grupoPoblacional || ""
    },
    objetivos:{
      objetivoGeneral:objetivo,
      objetivosEspecificos:objetivosEsp
    },
    alternativas:{
      alternativas:listaTexto(p.alternativasMGA, "nombre"),
      seleccionada:p.alternativaSeleccionadaMGA?.descripcion || p.alternativaSeleccionadaMGA?.nombre || "",
      justificacion:p.alternativaSeleccionadaMGA?.justificacion || ""
    },
    cadenaValor:{
      productos,
      actividades
    },
    indicadores,
    riesgos,
    fuentes,
    cronograma:arr(p.cronogramaMGA?.actividades),
    sostenibilidad:{
      tecnica:p.sostenibilidadMGA?.tecnica || "",
      financiera:p.sostenibilidadMGA?.financiera || "",
      institucional:p.sostenibilidadMGA?.institucional || "",
      ambiental:p.sostenibilidadMGA?.ambiental || "",
      resumen:p.documentosMGA?.sostenibilidad || ""
    },
    documentos:{
      justificacion:p.documentosMGA?.justificacion || p.diagnosticoMGA?.justificacion || "",
      resumenEjecutivo:p.documentosMGA?.resumenEjecutivo || "",
      beneficios:p.documentosMGA?.beneficios || "",
      marcoLogico:p.documentosMGA?.marcoLogico || ""
    }
  };
}

function bloqueHTML(titulo, contenido){
  return `
    <div class="exportador-bloque">
      <div class="exportador-bloque-head">
        <strong>${esc(titulo)}</strong>
        <button class="btn" type="button" data-copy="${esc(contenido)}">Copiar</button>
      </div>
      <textarea readonly>${esc(contenido)}</textarea>
    </div>
  `;
}

function tablaHTML(titulo, filas, columnas){
  return `
    <div class="exportador-bloque">
      <div class="exportador-bloque-head">
        <strong>${esc(titulo)}</strong>
      </div>
      <div class="tablewrap">
        <table class="table">
          <thead>
            <tr>${columnas.map(c=>`<th>${esc(c.label)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${filas.length ? filas.map(f => `
              <tr>${columnas.map(c=>`<td>${esc(f[c.key])}</td>`).join("")}</tr>
            `).join("") : `<tr><td colspan="${columnas.length}">Sin información</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function textoCompleto(paquete){
  return [
    "IDENTIFICACIÓN",
    `Nombre del proyecto: ${paquete.identificacion.nombreProyecto}`,
    `Entidad formuladora: ${paquete.identificacion.entidadFormuladora}`,
    `Sector: ${paquete.identificacion.sector}`,
    `Tipología: ${paquete.identificacion.tipologia}`,
    `Departamento: ${paquete.identificacion.departamento}`,
    `Municipio: ${paquete.identificacion.municipio}`,
    "",
    "DIAGNÓSTICO",
    paquete.problema.diagnostico,
    "",
    "PROBLEMA CENTRAL",
    paquete.problema.problemaCentral,
    "",
    "CAUSAS",
    paquete.problema.causas,
    "",
    "EFECTOS",
    paquete.problema.efectos,
    "",
    "OBJETIVO GENERAL",
    paquete.objetivos.objetivoGeneral,
    "",
    "OBJETIVOS ESPECÍFICOS",
    paquete.objetivos.objetivosEspecificos,
    "",
    "JUSTIFICACIÓN",
    paquete.documentos.justificacion,
    "",
    "RESUMEN EJECUTIVO",
    paquete.documentos.resumenEjecutivo,
    "",
    "SOSTENIBILIDAD",
    paquete.sostenibilidad.resumen || [
      paquete.sostenibilidad.tecnica,
      paquete.sostenibilidad.financiera,
      paquete.sostenibilidad.institucional,
      paquete.sostenibilidad.ambiental
    ].filter(Boolean).join("\n")
  ].join("\n");
}

function crear(contenedorId="panelExportadorMGAWeb"){
  const cont = document.getElementById(contenedorId);
  if(!cont) return;

  const paquete = construirPaquete();
  const completo = textoCompleto(paquete);

  cont.innerHTML = `
    <section class="exportador-mga-card">
      <div class="exportador-head">
        <div>
          <h2>📋 Exportador MGA Web</h2>
          <p>Textos y tablas preparados para copiar y pegar en la plataforma MGA Web.</p>
        </div>
        <button class="btn primary" id="btnCopiarTodoMGAWeb" type="button">Copiar todo</button>
      </div>

      ${bloqueHTML("Diagnóstico", paquete.problema.diagnostico)}
      ${bloqueHTML("Problema central", paquete.problema.problemaCentral)}
      ${bloqueHTML("Causas directas", paquete.problema.causas)}
      ${bloqueHTML("Efectos directos", paquete.problema.efectos)}
      ${bloqueHTML("Objetivo general", paquete.objetivos.objetivoGeneral)}
      ${bloqueHTML("Objetivos específicos", paquete.objetivos.objetivosEspecificos)}
      ${bloqueHTML("Justificación", paquete.documentos.justificacion)}
      ${bloqueHTML("Resumen ejecutivo", paquete.documentos.resumenEjecutivo)}
      ${bloqueHTML("Sostenibilidad", paquete.sostenibilidad.resumen || paquete.sostenibilidad.tecnica)}

      ${tablaHTML("Productos", paquete.cadenaValor.productos, [
        {key:"numero", label:"#"},
        {key:"producto", label:"Producto"},
        {key:"unidad", label:"Unidad"},
        {key:"meta", label:"Meta"}
      ])}

      ${tablaHTML("Actividades", paquete.cadenaValor.actividades, [
        {key:"numero", label:"#"},
        {key:"actividad", label:"Actividad"},
        {key:"costo", label:"Costo"}
      ])}

      ${tablaHTML("Indicadores", paquete.indicadores, [
        {key:"numero", label:"#"},
        {key:"indicador", label:"Indicador"},
        {key:"tipo", label:"Tipo"},
        {key:"unidad", label:"Unidad"},
        {key:"lineaBase", label:"Línea base"},
        {key:"meta", label:"Meta"},
        {key:"fuente", label:"Fuente"}
      ])}

      ${tablaHTML("Riesgos", paquete.riesgos, [
        {key:"numero", label:"#"},
        {key:"riesgo", label:"Riesgo"},
        {key:"categoria", label:"Categoría"},
        {key:"probabilidad", label:"Probabilidad"},
        {key:"impacto", label:"Impacto"},
        {key:"mitigacion", label:"Mitigación"}
      ])}

      <textarea id="txtExportadorMGACompleto" readonly style="display:none">${esc(completo)}</textarea>
    </section>
  `;

  cont.querySelectorAll("[data-copy]").forEach(btn => {
    btn.onclick = async () => {
      await navigator.clipboard.writeText(btn.getAttribute("data-copy") || "");
      btn.textContent = "Copiado";
      setTimeout(()=>btn.textContent="Copiar", 1200);
    };
  });

  const btnTodo = document.getElementById("btnCopiarTodoMGAWeb");
  if(btnTodo){
    btnTodo.onclick = async () => {
      await navigator.clipboard.writeText(completo);
      btnTodo.textContent = "Todo copiado";
      setTimeout(()=>btnTodo.textContent="Copiar todo", 1200);
    };
  }
}

return {
  construirPaquete,
  textoCompleto,
  crear
};

})();

window.ExportadorMGAWeb = ExportadorMGAWeb;
