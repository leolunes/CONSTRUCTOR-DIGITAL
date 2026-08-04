"use strict";

/* ============================================================
   DATOS DEL EQUIPO
   Andamio de carga
   Código: EQAND0003
============================================================ */

window.DATOS_EQUIPO = {

  id: "andamio-de-carga",
  carpeta: "andamio-de-carga",

  codigo: "EQAND0003",

  familia: "Andamios y equipos de acceso",

  marca: "Genérico",

  modelo: "Andamio de carga reforzado",

  nombre: "Andamio de carga",

  referencia:
    "Andamio metálico reforzado para soportar cargas de materiales y personal durante la ejecución de obras civiles.",

  rodaje: "No aplica",

  combustible: "No aplica",

  unidadAlquiler: "Día",

  imagen: "imagen.jpg",

  usoRecomendado:
    "Construcción de edificaciones, puentes, estructuras industriales, mantenimiento y obras civiles donde se requiera una plataforma temporal de alta capacidad de carga.",

  especificaciones: {

    tipo:
      "Andamio de carga modular",

    material:
      "Acero estructural galvanizado",

    alturaModulo:
      "2.00 m",

    anchoModulo:
      "1.20 m",

    longitudModulo:
      "2.50 m",

    capacidadCarga:
      "2.000 kg por módulo",

    plataforma:
      "Metálica antideslizante",

    sistemaUnion:
      "Espigas y pasadores de seguridad",

    incluyeEscalera:
      "Sí",

    incluyeBarandas:
      "Sí",

    incluyeRodapies:
      "Sí",

    incluyeBasesNiveladoras:
      "Sí",

    incluyeMontaje:
      "No",

    incluyeTransporte:
      "No"

  },

  entradas: {

    precioAdquisicion: 18500000,

    valorRescate: 0.10,

    vidaUtilHoras: 12000,

    horasAnio: 1800,

    tasaInteres: 0.12,

    seguroAnual: 0.02,

    mantenimientoFijoAnual: 600000,

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

    movilizacion: 180000,

    desmovilizacion: 180000,

    horasAmortizacion: 180,

    tarifaComercialObjetivo: 95000

  },

  calculados: {

    valorRescateCalculado: 1850000,

    depreciacionHora: 1387.50,

    inversionHora: 1233.33,

    seguroHora: 205.56,

    mantenimientoHora: 333.33,

    combustibleHora: 0,

    lubricantesHora: 0,

    rodajeHora: 0,

    operadorHora: 0,

    costoDirectoHorario: 3159.72,

    utilidadHora: 631.94,

    alquilerEquivalente: 3791.66,

    alquilerPorUnidad: 95000,

    costoTransporteEquivalente: 2000,

    costoComercialFinal: 5791.66,

    tarifaComercial: 95000,

    costoPorUnidad: 95000

  }

};

/* ============================================================
   ALIAS DE COMPATIBILIDAD
============================================================ */

window.EQUIPO = window.DATOS_EQUIPO;
window.equipo = window.DATOS_EQUIPO;
window.datosEquipo = window.DATOS_EQUIPO;
window.equipoActual = window.DATOS_EQUIPO;