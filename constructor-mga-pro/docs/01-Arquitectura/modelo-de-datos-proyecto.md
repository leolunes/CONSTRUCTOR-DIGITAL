# MODELO DE DATOS DEL PROYECTO
# CONSTRUCTOR MGA PRO
# Versión 1.0
# Ubicación sugerida:
# docs/01-Arquitectura/modelo-de-datos-proyecto.md

============================================================
1. OBJETIVO
============================================================

Este documento define la estructura maestra de datos que debe tener
cada proyecto dentro del Constructor MGA Pro.

El objetivo es evitar que cada módulo guarde información en formatos
separados o duplicados.

A partir de esta versión, todo proyecto deberá entenderse como un
objeto integral que contiene:

- Identificación.
- Formulación MGA.
- Diagnóstico.
- Árbol de problemas.
- Árbol de objetivos.
- Participantes.
- Población.
- Alternativas.
- Cadena de valor.
- Indicadores.
- Riesgos.
- Presupuesto.
- APUs.
- Cronograma.
- Fuentes de financiación.
- Sostenibilidad.
- Documentos.
- Memoria inteligente.
- Historial.
- Estado de cobertura MGA Web.

============================================================
2. PRINCIPIO DE DISEÑO
============================================================

El proyecto debe tener una única fuente de verdad.

Esto significa que:

1. El presupuesto no debe vivir aislado de la MGA.
2. La cadena de valor debe poder conectarse con costos.
3. Los documentos deben tomar información de los módulos reales.
4. El Copiloto debe guardar datos en la estructura oficial.
5. El Inspector debe validar esa misma estructura.
6. La futura exportación a MGA Web debe leer esta estructura.

============================================================
3. ESTRUCTURA MAESTRA PROPUESTA
============================================================

project = {

  id: "",
  createdAt: "",
  updatedAt: "",

  datosBasicos: {},

  identificacionMGA: {},

  politicaPublica: {},

  diagnosticoMGA: {},

  arbolProblemasMGA: {},

  arbolObjetivosMGA: {},

  participantesMGA: [],

  poblacionMGA: {},

  alternativasMGA: [],

  alternativaSeleccionadaMGA: {},

  cadenaValorMGA: {},

  indicadoresMGA: [],

  riesgosMGA: [],

  presupuesto: {},

  apus: [],

  capitulos: [],

  items: [],

  fuentesFinanciacionMGA: [],

  cronogramaMGA: {},

  sostenibilidadMGA: {},

  documentosMGA: {},

  adjuntos: [],

  memoriaInteligente: {},

  historialInteligente: [],

  coberturaMGAWeb: {},

  inspectorMGA: {}

}

============================================================
4. DATOS BÁSICOS
============================================================

datosBasicos = {

  nombreProyecto: "",
  entidadFormuladora: "",
  entidadEjecutora: "",
  departamento: "",
  municipio: "",
  fechaCreacion: "",
  responsable: "",
  estado: "",
  valorTotal: 0

}

Propósito:
Contiene la información general que identifica el proyecto en el
banco de proyectos y en reportes principales.

Estado actual:
Parcialmente implementado.

Prioridad:
Muy Alta.

============================================================
5. IDENTIFICACIÓN MGA
============================================================

identificacionMGA = {

  nombreProyecto: "",
  sector: "",
  sectorCodigo: "",
  programa: "",
  programaCodigo: "",
  productoMGA: "",
  productoCodigo: "",
  tipologia: "",
  tipologiaCodigo: "",
  localizacion: {
    departamento: "",
    municipio: "",
    zona: "",
    veredaBarrio: "",
    coordenadas: ""
  },
  horizonteEvaluacion: {
    anioInicio: "",
    anioFinal: "",
    numeroVigencias: 0
  },
  bpin: "",
  estadoRegistro: ""

}

Propósito:
Representa la sección inicial de la MGA Web.

Falta:
Programa, producto oficial, horizonte y vigencias.

Prioridad:
Muy Alta.

============================================================
6. POLÍTICA PÚBLICA
============================================================

politicaPublica = {

  planNacional: "",
  lineaPND: "",
  programaPND: "",
  planDepartamental: "",
  lineaDepartamental: "",
  metaDepartamental: "",
  planMunicipal: "",
  lineaMunicipal: "",
  programaMunicipal: "",
  metaMunicipal: "",
  indicadorPlan: ""

}

Propósito:
Conectar el proyecto con planes de desarrollo y metas públicas.

Estado actual:
Pendiente.

Prioridad:
Alta.

============================================================
7. DIAGNÓSTICO MGA
============================================================

diagnosticoMGA = {

  situacionActual: "",
  problemaCentral: "",
  magnitudProblema: "",
  fuenteMagnitud: "",
  justificacion: "",
  descripcionTerritorial: "",
  ofertaActual: "",
  demandaActual: "",
  brecha: "",
  poblacionAfectadaResumen: ""

}

Propósito:
Conservar todos los textos base para la sección de problemática.

Estado actual:
Parcial / avanzado.

Prioridad:
Muy Alta.

============================================================
8. ÁRBOL DE PROBLEMAS
============================================================

arbolProblemasMGA = {

  problemaCentral: "",
  causasDirectas: [],
  causasIndirectas: [],
  efectosDirectos: [],
  efectosIndirectos: []

}

Propósito:
Estructurar la lógica causal del proyecto.

Estado actual:
Avanzado.

Prioridad:
Muy Alta.

============================================================
9. ÁRBOL DE OBJETIVOS
============================================================

arbolObjetivosMGA = {

  objetivoGeneral: "",
  objetivosEspecificos: [],
  medios: [],
  fines: []

}

Propósito:
Convertir la problemática en objetivos de intervención.

Estado actual:
Avanzado.

Prioridad:
Muy Alta.

============================================================
10. PARTICIPANTES
============================================================

participantesMGA = [

  {
    actor: "",
    tipoActor: "",
    rol: "",
    interes: "",
    posicion: "",
    contribucion: "",
    experiencia: ""
  }

]

Propósito:
Registrar actores relacionados con el proyecto.

Estado actual:
Pendiente.

Prioridad:
Media / Alta.

============================================================
11. POBLACIÓN
============================================================

poblacionMGA = {

  poblacionAfectada: {
    cantidad: 0,
    unidad: "",
    descripcion: "",
    fuente: "",
    localizacion: ""
  },

  poblacionObjetivo: {
    cantidad: 0,
    unidad: "",
    descripcion: "",
    fuente: "",
    localizacion: ""
  },

  caracterizacion: {
    genero: "",
    edad: "",
    condicionVulnerabilidad: "",
    enfoqueDiferencial: "",
    grupoPoblacional: ""
  }

}

Propósito:
Diferenciar población afectada, población objetivo y beneficiarios.

Estado actual:
Parcial.

Prioridad:
Muy Alta.

============================================================
12. ALTERNATIVAS
============================================================

alternativasMGA = [

  {
    id: "",
    nombre: "",
    descripcion: "",
    tipo: "",
    costoEstimado: 0,
    ventajas: [],
    desventajas: [],
    evaluacionTecnica: "",
    evaluacionEconomica: "",
    evaluacionSocial: "",
    evaluacionAmbiental: "",
    seleccionada: false,
    justificacionSeleccion: ""
  }

]

alternativaSeleccionadaMGA = {

  id: "",
  nombre: "",
  descripcion: "",
  justificacion: ""

}

Propósito:
Soportar la selección de la alternativa de solución.

Estado actual:
Pendiente.

Prioridad:
Alta.

============================================================
13. CADENA DE VALOR
============================================================

cadenaValorMGA = {

  objetivoGeneral: "",
  objetivosEspecificos: [

    {
      id: "",
      descripcion: "",
      productos: [

        {
          id: "",
          codigoProducto: "",
          nombreProducto: "",
          unidadMedida: "",
          meta: 0,
          indicadorProducto: "",
          actividades: [

            {
              id: "",
              descripcion: "",
              unidadMedida: "",
              meta: 0,
              costo: 0,
              itemsPresupuesto: [],
              insumos: []
            }

          ]
        }

      ]
    }

  ]

}

Propósito:
Conectar objetivos, productos, actividades, indicadores y costos.

Estado actual:
Parcial.

Prioridad:
Muy Alta.

============================================================
14. INDICADORES
============================================================

indicadoresMGA = [

  {
    id: "",
    codigo: "",
    nombre: "",
    tipo: "",
    descripcion: "",
    unidadMedida: "",
    lineaBase: 0,
    meta: 0,
    fuenteVerificacion: "",
    frecuenciaMedicion: "",
    productoRelacionado: "",
    objetivoRelacionado: ""
  }

]

Propósito:
Registrar indicadores completos para MGA Web.

Estado actual:
Parcial.

Prioridad:
Alta.

============================================================
15. RIESGOS
============================================================

riesgosMGA = [

  {
    id: "",
    riesgo: "",
    tipo: "",
    etapa: "",
    probabilidad: "",
    impacto: "",
    nivel: "",
    mitigacion: "",
    responsable: "",
    actividadRelacionada: "",
    seguimiento: ""
  }

]

Propósito:
Estructurar la matriz de riesgos.

Estado actual:
Parcial / avanzado.

Prioridad:
Alta.

============================================================
16. PRESUPUESTO
============================================================

presupuesto = {

  costoDirecto: 0,
  administracionPct: 0,
  imprevistosPct: 0,
  utilidadPct: 0,
  ivaUtilidadPct: 0,
  administracionValor: 0,
  imprevistosValor: 0,
  utilidadValor: 0,
  ivaUtilidadValor: 0,
  valorTotal: 0,

  capitulos: [],
  items: [],
  apus: [],
  insumos: [],
  subproductos: []

}

Propósito:
Conservar todo el motor heredado de Presupuesto Pro.

Estado actual:
Muy avanzado.

Prioridad:
Muy Alta.

============================================================
17. FUENTES DE FINANCIACIÓN
============================================================

fuentesFinanciacionMGA = [

  {
    id: "",
    fuente: "",
    tipoFuente: "",
    entidadFinanciadora: "",
    vigencia: "",
    valor: 0,
    porcentaje: 0,
    observacion: ""
  }

]

Propósito:
Distribuir el valor total del proyecto entre fuentes y vigencias.

Estado actual:
Parcial.

Prioridad:
Alta.

============================================================
18. CRONOGRAMA
============================================================

cronogramaMGA = {

  fechaInicio: "",
  fechaFinal: "",
  duracionMeses: 0,

  actividades: [

    {
      id: "",
      descripcion: "",
      fechaInicio: "",
      fechaFinal: "",
      duracion: 0,
      avanceFisico: 0,
      avanceFinanciero: 0,
      costoProgramado: 0
    }

  ]

}

Propósito:
Crear programación física y financiera.

Estado actual:
Parcial.

Prioridad:
Alta.

============================================================
19. SOSTENIBILIDAD
============================================================

sostenibilidadMGA = {

  tecnica: "",
  financiera: "",
  institucional: "",
  ambiental: "",
  operacion: "",
  mantenimiento: "",
  responsable: "",
  costosOperacion: 0,
  costosMantenimiento: 0

}

Propósito:
Describir cómo se sostendrá el proyecto después de la inversión.

Estado actual:
Parcial.

Prioridad:
Media / Alta.

============================================================
20. DOCUMENTOS MGA
============================================================

documentosMGA = {

  diagnostico: "",
  justificacion: "",
  resumenEjecutivo: "",
  descripcionProyecto: "",
  beneficios: "",
  sostenibilidad: "",
  marcoLogico: "",
  estudiosRequeridos: [],
  soportesRequeridos: [],
  checklistDocumental: []

}

Propósito:
Consolidar documentos y textos listos para la MGA Web y soportes.

Estado actual:
Parcial / avanzado.

Prioridad:
Alta.

============================================================
21. MEMORIA INTELIGENTE
============================================================

memoriaInteligente = {

  fechaUltimaActualizacion: "",
  estadoGeneral: "",
  avanceMGAWeb: 0,
  sector: "",
  tipologia: "",
  problema: "",
  objetivo: "",
  proximoPaso: "",
  recomendaciones: [],
  resumenEjecutivoInterno: ""

}

Propósito:
Permitir que el proyecto recuerde su estado, avance y contexto.

Estado actual:
Inicial.

Prioridad:
Alta.

============================================================
22. HISTORIAL INTELIGENTE
============================================================

historialInteligente = [

  {
    fecha: "",
    tipo: "",
    titulo: "",
    descripcion: "",
    modulo: "",
    usuario: "",
    cambios: []
  }

]

Propósito:
Registrar decisiones, autocompletados, revisiones y cambios.

Estado actual:
Inicial.

Prioridad:
Media.

============================================================
23. COBERTURA MGA WEB
============================================================

coberturaMGAWeb = {

  porcentajeGeneral: 0,
  componentesCompletos: 0,
  componentesParciales: 0,
  componentesPendientes: 0,

  grupos: [

    {
      grupo: "",
      porcentaje: 0,
      completos: 0,
      parciales: 0,
      pendientes: 0,
      observaciones: []
    }

  ]

}

Propósito:
Medir qué tan listo está el proyecto para diligenciar la MGA Web.

Estado actual:
Pendiente.

Prioridad:
Muy Alta.

============================================================
24. INSPECTOR MGA
============================================================

inspectorMGA = {

  fechaRevision: "",
  puntajeCalidad: 0,
  erroresCriticos: [],
  advertencias: [],
  recomendaciones: [],
  listoParaMGAWeb: false

}

Propósito:
Validar la coherencia y completitud del proyecto.

Estado actual:
Pendiente.

Prioridad:
Muy Alta.

============================================================
25. REGLAS DE INTEGRACIÓN
============================================================

1. El Copiloto no debe guardar información en estructuras aisladas.
   Debe escribir en la estructura oficial del proyecto.

2. El presupuesto debe conectarse con cadena de valor.

3. Cada actividad debe poder tener costo.

4. Cada producto debe tener indicador y meta.

5. Cada fuente debe sumar al valor total del proyecto.

6. Cada documento debe generarse desde datos reales del proyecto.

7. El Inspector debe leer la misma estructura que usan los módulos.

8. El mapa MGA Web debe indicar qué campos están completos,
   parciales o pendientes.

============================================================
26. OBJETIVO DEL MODELO DE DATOS
============================================================

Este modelo permitirá que Constructor MGA Pro pase de ser una
aplicación con módulos separados a convertirse en una plataforma
integrada de formulación.

El objetivo final es que, cuando el usuario genere o modifique un
dato, toda la estructura del proyecto se actualice de manera coherente.

============================================================
FIN DEL DOCUMENTO
============================================================
