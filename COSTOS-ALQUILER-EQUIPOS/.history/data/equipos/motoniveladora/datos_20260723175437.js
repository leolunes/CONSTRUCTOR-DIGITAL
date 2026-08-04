"use strict";

/* ============================================================
   DATOS DEL EQUIPO
   Archivo:
   data/equipos/motoniveladora/datos.js
   ============================================================ */

const EQUIPO_DATOS = {

  identificacion: {
    codigo: "EQMTA0089",
    modelo: "EQMTA0089",
    nombre: "Motoniveladora",
    familia: "Motoniveladora",
    marca: "Referencia comercial",
    equipoReferencia: "Motoniveladora para conformación y perfilado de vías",
    rodaje: "Llantas",
    usoRecomendado: "Perfilado, conformación de subrasante, extendido y acabado de material granular."
  },

  presentacion: {
    titulo: "Motoniveladora",
    subtitulo: "Motoniveladora para conformación y perfilado de vías",
    descripcion: "Equipo autopropulsado sobre llantas, utilizado para nivelación, perfilado, conformación de subrasantes, extendido y acabado de materiales granulares en proyectos viales.",
    imagen: "data/equipos/motoniveladora/imagen.jpg",
    usoRecomendado: "Perfilado, conformación de subrasante, extendido y acabado de material granular."
  },

  configuracion: {
    rodaje: "Llantas",
    combustible: "ACPM",
    operadorRequerido: true,
    ayudanteRequerido: false,
    unidadAlquiler: "Hr",
    unidadRendimiento: "m3/h",
    unidadCostoProduccion: "COP/m3"
  },

  especificacionesTecnicas: [
    {
      parametro: "Tipo de equipo",
      valor: "Motoniveladora",
      unidad: ""
    },
    {
      parametro: "Sistema de rodaje",
      valor: "Llantas",
      unidad: ""
    },
    {
      parametro: "Combustible",
      valor: "ACPM",
      unidad: ""
    },
    {
      parametro: "Consumo de combustible",
      valor: 7.131011122345803,
      unidad: "L/h"
    },
    {
      parametro: "Rendimiento referencial",
      valor: 250,
      unidad: "m3/h"
    },
    {
      parametro: "Vida útil económica",
      valor: 9782.608695652174,
      unidad: "h"
    },
    {
      parametro: "Horas de trabajo por año",
      valor: 1800,
      unidad: "h/año"
    }
  ],

  propiedad: {
    precioAdquisicion: 500000000,
    valorRescate: 0.10,
    vidaUtilHoras: 9782.608695652174,
    horasAnio: 1800,
    tasaInteres: 0.1178181818181818,
    seguroAnual: 0.027,
    mantenimientoFijoAnual: 36508500
  },

  costosFijosHora: {
    depreciacionHora: 45999.99999999999,
    inversionHora: 32399.999999999996,
    seguroHora: 7500,
    mantenimientoFijoHora: 20282.5,
    totalHora: 106182.5
  },

  combustible: {
    tipo: "ACPM",
    consumoHora: 7.131011122345803,
    unidad: "L/h",
    precioUnitario: 11500,
    unidadPrecio: "COP/L",
    costoHora: 82006.62790697674
  },

  lubricantes: {
    factor: 0.1621621621621622,
    baseCalculo: "Costo de combustible",
    costoHora: 13298.37209302326
  },

  rodajeDesgaste: {
    tipo: "Llantas",
    costoRodaje: 39000000,
    vidaRodajeHoras: 3000,
    costoHora: 13000
  },

  mantenimientoVariable: {
    descripcion: "Mantenimiento variable incluido dentro de la estructura de costos consolidada.",
    costoHora: 0
  },

  operador: {
    salarioMes: 5200000,
    horasMes: 200,
    costoHora: 26000,
    cantidad: 1
  },

  ayudante: {
    requerido: false,
    salarioMes: 0,
    horasMes: 200,
    costoHora: 0,
    cantidad: 0
  },

  energia: {
    aplica: false,
    tipo: "",
    consumoHora: 0,
    costoHora: 0
  },

  otrosCostosOperacion: {
    descripcion: "No se registran otros costos operativos adicionales.",
    costoHora: 0
  },

  costoDirecto: {
    costosFijosHora: 106182.5,
    combustibleHora: 82006.62790697674,
    lubricantesHora: 13298.37209302326,
    rodajeHora: 13000,
    operadorHora: 26000,
    ayudanteHora: 0,
    energiaHora: 0,
    otrosCostosHora: 0,
    totalHora: 226087.5,
    unidad: "COP/h"
  },

  alquiler: {
    costoDirecto: 226087.5,
    margen: 0.20,
    utilidadHora: 45217.5,
    tarifaComercial: 271305,
    unidad: "Hr",
    condiciones: "Tarifa comercial referencial antes de considerar movilización y desmovilización. Puede variar según ubicación, disponibilidad, duración del alquiler y condiciones particulares de operación."
  },

  transporte: {
    movilizacion: 1800000,
    desmovilizacion: 1800000,
    horasAmortizacion: 300,
    equivalenteHora: 12000,
    transporteEquivalente: 12000,
    unidad: "COP/h"
  },

  costoComercial: {
    costoDirectoHora: 226087.5,
    margenAlquiler: 0.20,
    tarifaComercial: 271305,
    transporteEquivalenteHora: 12000,
    costoFinal: 283305,
    unidad: "COP/h",
    condiciones: "El costo comercial final incorpora la tarifa comercial del equipo y el transporte equivalente amortizado."
  },

  rendimiento: {
    valor: 250,
    rendimiento: 250,
    unidad: "m3/h",
    usoRecomendado: "Perfilado, conformación de subrasante, extendido y acabado de material granular.",
    condiciones: "Rendimiento referencial sujeto a condiciones del terreno, experiencia del operador, distancia de trabajo, pendiente, clima y organización de la obra."
  },

  produccion: {
    costoAlquilerUnidad: 1085.22,
    costoPorUnidad: 1085.22,
    unidad: "m3",
    unidadCosto: "COP/m3"
  },

  factoresAjuste: {
    region: 1,
    altura: 1,
    clima: 1,
    disponibilidad: 1,
    dificultad: 1,
    jornada: 1
  },

  aplicaciones: [
    {
      titulo: "Perfilado de vías",
      descripcion: "Conformación y corrección del perfil longitudinal y transversal de vías."
    },
    {
      titulo: "Conformación de subrasante",
      descripcion: "Nivelación y acabado de la superficie de apoyo de la estructura del pavimento."
    },
    {
      titulo: "Extendido de material granular",
      descripcion: "Distribución uniforme de afirmado, subbase y base granular."
    },
    {
      titulo: "Acabado de superficies",
      descripcion: "Terminación y ajuste de pendientes, bombeos y cotas de diseño."
    }
  ],

  accesorios: [
    {
      accesorio: "Cuchilla niveladora",
      descripcion: "Elemento principal para corte, extendido, conformación y acabado.",
      compatibilidad: "Configuración estándar"
    },
    {
      accesorio: "Escarificador",
      descripcion: "Utilizado para aflojar materiales compactados antes del perfilado.",
      compatibilidad: "Según configuración del equipo"
    },
    {
      accesorio: "Ripper trasero",
      descripcion: "Complemento para rotura superficial de materiales duros.",
      compatibilidad: "Opcional"
    }
  ],

  seguridad: {
    operadorCertificado: "Recomendado",
    inspeccionPreoperacional: "Obligatoria antes de iniciar la jornada",
    elementosProteccionPersonal: "Casco, botas de seguridad, protección auditiva, chaleco reflectivo y gafas",
    señalizacionAreaTrabajo: "Obligatoria",
    extintor: "Debe encontrarse vigente y disponible en el equipo"
  },

  mantenimientoRecomendado: [
    "Revisión diaria de niveles de aceite, refrigerante y combustible.",
    "Inspección del estado y presión de las llantas.",
    "Engrase de articulaciones y puntos indicados por el fabricante.",
    "Verificación periódica de cuchilla, escarificador y sistema hidráulico.",
    "Cumplimiento del plan de mantenimiento preventivo del fabricante."
  ],

  documentos: [
    {
      nombre: "Ficha técnica",
      disponible: false,
      archivo: ""
    },
    {
      nombre: "Manual de operación",
      disponible: false,
      archivo: ""
    }
  ],

  mercado: {
    tarifaMinima: 271305,
    tarifaPromedio: 271305,
    tarifaMaxima: 283305,
    ciudadReferencia: "Área Metropolitana de Bucaramanga",
    region: "Santander",
    condicionesComerciales: "Valores referenciales para alquiler por hora. No incluyen impuestos ni costos extraordinarios derivados de condiciones especiales de obra."
  },

  control: {
    estado: "ACTIVO",
    fechaCreacion: "2026-07-23",
    fechaActualizacion: "2026-07-23",
    version: "1.0",
    fuente: "PLANTILLA_BASE_COSTO_ALQUILER_COMERCIAL_EQUIVALENTE",
    responsable: "Base maestra de equipos"
  },

  observaciones: {
    tecnica: "Equipo de referencia para actividades de conformación y acabado en proyectos viales.",
    economica: "La tarifa comercial corresponde al costo directo más un margen de alquiler del 20 %.",
    transporte: "La movilización y desmovilización se amortizan en 300 horas, equivalentes a 12.000 COP/h.",
    rendimiento: "El rendimiento de 250 m3/h debe ajustarse a las condiciones reales de cada obra."
  }

};

window.EQUIPO_DATOS = EQUIPO_DATOS;