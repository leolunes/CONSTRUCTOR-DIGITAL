"use strict";

/* ============================================================
   DATOS DEL EQUIPO
   Balde para Pluma Grúa
   Código: EQBAL0001
============================================================ */

window.DATOS_EQUIPO = {

  id: "balde-para-pluma-grua",
  carpeta: "balde-para-pluma-grua",

  codigo: "EQBAL0001",

  familia: "Accesorios para Izaje",

  marca: "Genérico",

  modelo: "Balde para Concreto 1.0 m³",

  nombre: "Balde para Pluma Grúa",

  referencia:
    "Balde metálico para transporte y descarga de concreto mediante pluma grúa o grúa torre.",

  rodaje: "No aplica",

  combustible: "No aplica",

  unidadAlquiler: "Día",

  imagen: "imagen.jpg",

  usoRecomendado:
    "Transporte vertical de concreto en edificaciones, puentes, estructuras industriales y obras donde no es posible utilizar bomba de concreto.",

  especificaciones: {

    tipo:
      "Balde metálico para concreto",

    capacidad:
      "1.00 m³",

    material:
      "Acero estructural",

    sistemaDescarga:
      "Compuerta inferior manual",

    tipoSuspension:
      "Orejas para gancho de grúa",

    pesoVacio:
      "420 kg",

    altura:
      "1.70 m",

    diametro:
      "1.20 m",

    acabado:
      "Pintura anticorrosiva",

    incluyeManguera:
      "No",

    incluyeCompuerta:
      "Sí",

    requiereGrua:
      "Sí"

  },

  entradas: {

    precioAdquisicion: 14500000,

    valorRescate: 0.10,

    vidaUtilHoras: 12000,

    horasAnio: 1800,

    tasaInteres: 0.12,

    seguroAnual: 0.015,

    mantenimientoFijoAnual: 350000,

    consumoCombustible: 0,

    precioCombustible: 0,

    factorLubricantes: 0,

    costoRodaje: 0,

    vidaRodajeHoras: 1,

    operadorMes: 0,

    horasOperadorMes: 200,

    margenAlquiler: 0.20,

    rendimiento: 80,

    unidadRendimiento: "m³/día",

    unidadCostoProduccion: "COP/m³",

    movilizacion: 120000,

    desmovilizacion: 120000,

    horasAmortizacion: 160,

    tarifaComercialObjetivo: 95000

  },

  calculados: {

    valorRescateCalculado: 1450000,

    depreciacionHora: 1087.50,

    inversionHora: 966.67,

    seguroHora: 120.83,

    mantenimientoHora: 194.44,

    combustibleHora: 0,

    lubricantesHora: 0,

    rodajeHora: 0,

    operadorHora: 0,

    costoDirectoHorario: 2369.44,

    utilidadHora: 473.89,

    alquilerEquivalente: 2843.33,

    alquilerPorUnidad: 95000,

    costoTransporteEquivalente: 1500,

    costoComercialFinal: 4343.33,

    tarifaComercial: 95000,

    costoPorUnidad: 1187.50

  }

};

/* ============================================================
   ALIAS DE COMPATIBILIDAD
============================================================ */

window.EQUIPO = window.DATOS_EQUIPO;
window.equipo = window.DATOS_EQUIPO;
window.datosEquipo = window.DATOS_EQUIPO;
window.equipoActual = window.DATOS_EQUIPO;