"use strict";

/* ============================================================
   DATOS DEL EQUIPO
   Allanadora de concreto de 36"
   Código: EQALL0001
============================================================ */

window.DATOS_EQUIPO = {

  id: "allanadora",
  carpeta: "allanadora",

  codigo: "EQALL0001",

  familia: "Allanadora",
  marca: "Genérica",
  modelo: "36 pulgadas",

  nombre: "Allanadora",
  referencia:
    'Allanadora de concreto de 36" para acabado y pulido de superficies de concreto',

  rodaje: "Manual / Empuje",
  combustible: "Gasolina",

  unidadAlquiler: "Día",

  imagen: "imagen.jpg",

  usoRecomendado:
    "Afinado, nivelación y acabado superficial de placas y pisos de concreto fresco.",

  entradas: {

    precioAdquisicion: 8500000,

    valorRescate: 0.10,

    vidaUtilHoras: 4000,

    horasAnio: 800,

    tasaInteres: 0.1178181818181818,

    seguroAnual: 0.027,

    mantenimientoFijoAnual: 850000,

    consumoCombustible: 0.4420359848484849,

    precioCombustible: 16000,

    factorLubricantes: 0.10,

    costoRodaje: 0,

    vidaRodajeHoras: 1,

    operadorMes: 0,

    horasOperadorMes: 200,

    margenAlquiler: 0.20,

    rendimiento: 600,

    unidadRendimiento: "m2/día",

    unidadCostoProduccion: "COP/m2",

    movilizacion: 80000,

    desmovilizacion: 80000,

    horasAmortizacion: 80,

    tarifaComercialObjetivo: 112610
  },

  calculados: {

    valorRescateCalculado: 850000,

    costoDirectoHorario: 11730.208333333334,

    alquilerEquivalente: 14076.25,

    alquilerPorUnidad: 187.68333333333334,

    costoTransporteEquivalente: 2000,

    costoComercialFinal: 16076.25,

    tarifaComercial: 112610,

    costoPorUnidad: 187.68333333333334
  }
};

/* ============================================================
   ALIAS DE COMPATIBILIDAD
============================================================ */

window.EQUIPO = window.DATOS_EQUIPO;
window.equipo = window.DATOS_EQUIPO;
window.datosEquipo = window.DATOS_EQUIPO;
window.equipoActual = window.DATOS_EQUIPO;