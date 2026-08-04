"use strict";

/* ============================================================
   DATOS DEL EQUIPO
   Montacargas
   Código: EQMON0001
============================================================ */

window.DATOS_EQUIPO = {

  id: "montacargas",
  carpeta: "montacargas",

  codigo: "EQMON0001",

  familia: "Equipos de Izaje y Manipulación de Materiales",

  marca: "Genérico",

  modelo: "Montacargas Diesel 3.0 Ton",

  nombre: "Montacargas",

  referencia:
    "Montacargas contrabalanceado diésel con capacidad de 3 toneladas para cargue, descargue y movilización de materiales.",

  rodaje: "Llantas neumáticas",

  combustible: "Diésel",

  unidadAlquiler: "Hora",

  imagen: "imagen.jpg",

  usoRecomendado:
    "Cargue y descargue de materiales, manejo de estibas, bodegas, centros logísticos, industrias, obras civiles y patios de almacenamiento.",

  especificaciones: {

    tipo:
      "Montacargas contrabalanceado",

    capacidadCarga:
      "3.000 kg",

    alturaElevacion:
      "4.50 m",

    centroCarga:
      "500 mm",

    motor:
      "Diésel",

    transmision:
      "Automática",

    traccion:
      "4x2",

    pesoOperativo:
      "4.450 kg",

    anchoEquipo:
      "1.23 m",

    longitudHorquillas:
      "1.22 m",

    llantas:
      "Neumáticas",

    cabina:
      "Abierta con techo protector"

  },

  entradas: {

    precioAdquisicion: 145000000,

    valorRescate: 0.10,

    vidaUtilHoras: 15000,

    horasAnio: 2000,

    tasaInteres: 0.12,

    seguroAnual: 0.025,

    mantenimientoFijoAnual: 4200000,

    consumoCombustible: 4.50,

    precioCombustible: 17000,

    factorLubricantes: 0.12,

    costoRodaje: 18000000,

    vidaRodajeHoras: 5000,

    operadorMes: 3200000,

    horasOperadorMes: 200,

    margenAlquiler: 0.20,

    rendimiento: 35,

    unidadRendimiento: "ton/h",

    unidadCostoProduccion: "COP/ton",

    movilizacion: 350000,

    desmovilizacion: 350000,

    horasAmortizacion: 200,

    tarifaComercialObjetivo: 165000

  },

  calculados: {

    valorRescateCalculado: 14500000,

    depreciacionHora: 8700.00,

    inversionHora: 5220.00,

    seguroHora: 1812.50,

    mantenimientoHora: 2100.00,

    combustibleHora: 76500.00,

    lubricantesHora: 9180.00,

    rodajeHora: 3600.00,

    operadorHora: 16000.00,

    costoDirectoHorario: 123112.50,

    utilidadHora: 24622.50,

    alquilerEquivalente: 147735.00,

    alquilerPorUnidad: 165000.00,

    costoTransporteEquivalente: 3500.00,

    costoComercialFinal: 151235.00,

    tarifaComercial: 165000.00,

    costoPorUnidad: 4714.29

  }

};

/* ============================================================
   ALIAS DE COMPATIBILIDAD
============================================================ */

window.EQUIPO = window.DATOS_EQUIPO;
window.equipo = window.DATOS_EQUIPO;
window.datosEquipo = window.DATOS_EQUIPO;
window.equipoActual = window.DATOS_EQUIPO;