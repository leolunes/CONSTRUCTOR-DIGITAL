"use strict";

/* ============================================================
   DATOS DEL EQUIPO
   Antorcha / Soplete a Gas
   Código: EQANT0001
============================================================ */

window.DATOS_EQUIPO = {

  id: "antorcha-soplete-a-gas",
  carpeta: "antorcha-soplete-a-gas",

  codigo: "EQANT0001",

  familia: "Herramientas térmicas",

  marca: "Genérico",

  modelo: "Soplete a Gas Profesional",

  nombre: "Antorcha / Soplete a Gas",

  referencia:
    "Antorcha profesional a gas propano para impermeabilización, calentamiento, soldadura, secado y trabajos industriales.",

  rodaje: "No aplica",

  combustible: "Gas Propano (GLP)",

  unidadAlquiler: "Día",

  imagen: "imagen.jpg",

  usoRecomendado:
    "Impermeabilización con mantos asfálticos, calentamiento de tuberías, secado de superficies, soldadura liviana, corte térmico y aplicaciones industriales.",

  especificaciones: {

    tipo:
      "Soplete profesional de alta presión",

    combustible:
      "Gas propano (GLP)",

    presionTrabajo:
      "2 a 4 bar",

    longitudManguera:
      "10 m",

    longitudLanza:
      "600 mm",

    encendido:
      "Manual",

    consumoGas:
      "2.5 kg/h",

    temperaturaLlama:
      "Hasta 1.900 °C",

    regulador:
      "Incluido",

    incluyeManguera:
      "Sí",

    incluyeValvulas:
      "Sí",

    incluyeCilindro:
      "No"

  },

  entradas: {

    precioAdquisicion: 850000,

    valorRescate: 0.10,

    vidaUtilHoras: 5000,

    horasAnio: 1200,

    tasaInteres: 0.12,

    seguroAnual: 0.01,

    mantenimientoFijoAnual: 60000,

    consumoCombustible: 2.50,

    precioCombustible: 5200,

    factorLubricantes: 0,

    costoRodaje: 0,

    vidaRodajeHoras: 1,

    operadorMes: 0,

    horasOperadorMes: 200,

    margenAlquiler: 0.20,

    rendimiento: 250,

    unidadRendimiento: "m²/día",

    unidadCostoProduccion: "COP/m²",

    movilizacion: 30000,

    desmovilizacion: 30000,

    horasAmortizacion: 60,

    tarifaComercialObjetivo: 35000

  },

  calculados: {

    valorRescateCalculado: 85000,

    depreciacionHora: 153.00,

    inversionHora: 102.00,

    seguroHora: 7.08,

    mantenimientoHora: 50.00,

    combustibleHora: 13000.00,

    lubricantesHora: 0,

    rodajeHora: 0,

    operadorHora: 0,

    costoDirectoHorario: 13312.08,

    utilidadHora: 2662.42,

    alquilerEquivalente: 15974.50,

    alquilerPorUnidad: 35000,

    costoTransporteEquivalente: 1000,

    costoComercialFinal: 16974.50,

    tarifaComercial: 35000,

    costoPorUnidad: 140.00

  }

};

/* ============================================================
   ALIAS DE COMPATIBILIDAD
============================================================ */

window.EQUIPO = window.DATOS_EQUIPO;
window.equipo = window.DATOS_EQUIPO;
window.datosEquipo = window.DATOS_EQUIPO;
window.equipoActual = window.DATOS_EQUIPO;