"use strict";

/* ============================================================
   DATOS DEL EQUIPO
   Andamio certificado multidireccional
   Código: EQAND0001
============================================================ */

window.DATOS_EQUIPO = {

  id: "andamio-certificado",
  carpeta: "andamio-certificado",

  codigo: "EQAND0001",

  familia: "Andamios y equipos de acceso",
  marca: "Genérico certificado",
  modelo: "Andamio multidireccional certificado",

  nombre: "Andamio certificado",
  referencia:
    "Andamio metálico multidireccional certificado para trabajos seguros en altura",

  rodaje: "No aplica",
  combustible: "No aplica",

  unidadAlquiler: "Día",

  imagen: "imagen.jpg",

  usoRecomendado:
    "Trabajos de construcción, mantenimiento, fachada, instalaciones y actividades en altura que requieran una plataforma estable y certificada.",

  especificaciones: {

    tipo:
      "Andamio multidireccional certificado",

    material:
      "Acero galvanizado",

    alturaModulo:
      "2,00 m",

    anchoModulo:
      "0,73 m",

    longitudModulo:
      "2,50 m",

    areaTrabajoReferencia:
      "1 módulo",

    capacidadCarga:
      "Según configuración y certificación del fabricante",

    componentes:
      "Verticales, horizontales, diagonales, plataformas, rodapiés, bases niveladoras y acceso interno",

    normaSeguridad:
      "Sistema certificado para trabajo seguro en alturas",

    incluyeMontaje:
      "No",

    incluyeTransporte:
      "No"
  },

  entradas: {

    precioAdquisicion: 4800000,

    valorRescate: 0.10,

    vidaUtilHoras: 10000,

    horasAnio: 1800,

    tasaInteres: 0.12,

    seguroAnual: 0.02,

    mantenimientoFijoAnual: 240000,

    consumoCombustible: 0,

    precioCombustible: 0,

    factorLubricantes: 0,

    costoRodaje: 0,

    vidaRodajeHoras: 1,

    operadorMes: 0,

    horasOperadorMes: 200,

    margenAlquiler: 0.20,

    rendimiento: 1,

    unidadRendimiento: "módulo/día",

    unidadCostoProduccion: "COP/módulo-día",

    movilizacion: 120000,

    desmovilizacion: 120000,

    horasAmortizacion: 240,

    tarifaComercialObjetivo: 35000
  },

  calculados: {

    valorRescateCalculado: 480000,

    depreciacionHora: 432,

    inversionHora: 320,

    seguroHora: 53.333333333333336,

    mantenimientoHora: 133.33333333333334,

    combustibleHora: 0,

    lubricantesHora: 0,

    rodajeHora: 0,

    operadorHora: 0,

    costoDirectoHorario: 938.6666666666667,

    utilidadHora: 187.73333333333335,

    alquilerEquivalente: 1126.4,

    alquilerPorUnidad: 35000,

    costoTransporteEquivalente: 1000,

    costoComercialFinal: 2126.4,

    tarifaComercial: 35000,

    costoPorUnidad: 35000
  }
};

/* ============================================================
   ALIAS DE COMPATIBILIDAD
============================================================ */

window.EQUIPO = window.DATOS_EQUIPO;
window.equipo = window.DATOS_EQUIPO;
window.datosEquipo = window.DATOS_EQUIPO;
window.equipoActual = window.DATOS_EQUIPO;