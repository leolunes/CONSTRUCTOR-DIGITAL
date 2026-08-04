"use strict";

/* ============================================================
   DATOS DEL EQUIPO
   Andamio colgante eléctrico 30–60 m
   Código: EQAND0002
============================================================ */

window.DATOS_EQUIPO = {

  id: "andamio-colgante-30-60-mts",
  carpeta: "andamio-colgante-30-60-mts",

  codigo: "EQAND0002",

  familia: "Andamios y equipos de acceso",

  marca: "Genérico",

  modelo: "Andamio colgante eléctrico 30-60 m",

  nombre: "Andamio colgante",

  referencia:
    "Andamio colgante eléctrico para trabajos en fachadas y estructuras de hasta 60 metros de altura.",

  rodaje: "No aplica",

  combustible: "Energía eléctrica",

  unidadAlquiler: "Día",

  imagen: "imagen.jpg",

  usoRecomendado:
    "Trabajos de pintura, limpieza, impermeabilización, instalación de fachadas, mantenimiento de edificios y estructuras en altura.",

  especificaciones: {

    tipo:
      "Andamio colgante eléctrico",

    longitudPlataforma:
      "2 a 6 m",

    alturaTrabajo:
      "30 a 60 m",

    capacidadCarga:
      "630 kg",

    velocidadElevacion:
      "9 - 11 m/min",

    alimentacion:
      "220 V",

    motores:
      "2 eléctricos",

    cableAcero:
      "8.3 mm",

    incluyeContrapesos:
      "Sí",

    incluyeSistemaAnticaidas:
      "Sí",

    incluyeTransporte:
      "No",

    incluyeMontaje:
      "No"

  },

  entradas: {

    precioAdquisicion: 42000000,

    valorRescate: 0.10,

    vidaUtilHoras: 12000,

    horasAnio: 1800,

    tasaInteres: 0.12,

    seguroAnual: 0.025,

    mantenimientoFijoAnual: 1500000,

    consumoCombustible: 0,

    precioCombustible: 0,

    factorLubricantes: 0,

    costoRodaje: 0,

    vidaRodajeHoras: 1,

    operadorMes: 0,

    horasOperadorMes: 200,

    margenAlquiler: 0.20,

    rendimiento: 1,

    unidadRendimiento: "equipo/día",

    unidadCostoProduccion: "COP/equipo-día",

    movilizacion: 350000,

    desmovilizacion: 350000,

    horasAmortizacion: 240,

    tarifaComercialObjetivo: 380000

  },

  calculados: {

    valorRescateCalculado: 4200000,

    depreciacionHora: 3150,

    inversionHora: 2800,

    seguroHora: 583.33,

    mantenimientoHora: 833.33,

    combustibleHora: 0,

    lubricantesHora: 0,

    rodajeHora: 0,

    operadorHora: 0,

    costoDirectoHorario: 7366.66,

    utilidadHora: 1473.33,

    alquilerEquivalente: 8840.00,

    alquilerPorUnidad: 380000,

    costoTransporteEquivalente: 2916.67,

    costoComercialFinal: 11756.67,

    tarifaComercial: 380000,

    costoPorUnidad: 380000

  }

};

/* ============================================================
   ALIAS DE COMPATIBILIDAD
============================================================ */

window.EQUIPO = window.DATOS_EQUIPO;
window.equipo = window.DATOS_EQUIPO;
window.datosEquipo = window.DATOS_EQUIPO;
window.equipoActual = window.DATOS_EQUIPO;