"use strict";

/* ============================================================
   DATOS DEL EQUIPO
   Motobomba
   Código: EQMOT0001
============================================================ */

window.DATOS_EQUIPO = {

  id: "motobomba",
  carpeta: "motobomba",

  codigo: "EQMOT0001",

  familia: "Equipos de Bombeo",

  marca: "Honda",

  modelo: "WT30X - 3 pulgadas",

  nombre: "Motobomba",

  referencia:
    "Motobomba autocebante de 3 pulgadas accionada por motor a gasolina para bombeo de agua limpia o ligeramente contaminada en obras civiles.",

  rodaje: "No aplica",

  combustible: "Gasolina",

  unidadAlquiler: "Día",

  imagen: "imagen.jpg",

  usoRecomendado:
    "Desagüe de excavaciones, control de aguas lluvias, llenado de tanques, conducción temporal de agua, obras civiles, agricultura y atención de emergencias.",

  especificaciones: {

    tipo:
      "Motobomba autocebante",

    diametroSuccion:
      "3 pulgadas",

    diametroDescarga:
      "3 pulgadas",

    caudalMaximo:
      "1.210 L/min",

    alturaMaxima:
      "27 m",

    alturaSuccion:
      "8 m",

    motor:
      "Honda GX270",

    potencia:
      "8.5 HP",

    combustible:
      "Gasolina",

    capacidadTanque:
      "5.3 L",

    arranque:
      "Manual",

    peso:
      "61 kg"

  },

  entradas: {

    precioAdquisicion: 6200000,

    valorRescate: 0.10,

    vidaUtilHoras: 7000,

    horasAnio: 1500,

    tasaInteres: 0.12,

    seguroAnual: 0.015,

    mantenimientoFijoAnual: 250000,

    consumoCombustible: 2.20,

    precioCombustible: 17000,

    factorLubricantes: 0.10,

    costoRodaje: 0,

    vidaRodajeHoras: 1,

    operadorMes: 0,

    horasOperadorMes: 200,

    margenAlquiler: 0.20,

    rendimiento: 900,

    unidadRendimiento: "m³/día",

    unidadCostoProduccion: "COP/m³",

    movilizacion: 60000,

    desmovilizacion: 60000,

    horasAmortizacion: 80,

    tarifaComercialObjetivo: 120000

  },

  calculados: {

    valorRescateCalculado: 620000,

    depreciacionHora: 797.14,

    inversionHora: 531.43,

    seguroHora: 62.00,

    mantenimientoHora: 166.67,

    combustibleHora: 37400.00,

    lubricantesHora: 3740.00,

    rodajeHora: 0,

    operadorHora: 0,

    costoDirectoHorario: 42697.24,

    utilidadHora: 8539.45,

    alquilerEquivalente: 51236.69,

    alquilerPorUnidad: 120000.00,

    costoTransporteEquivalente: 1500.00,

    costoComercialFinal: 52736.69,

    tarifaComercial: 120000.00,

    costoPorUnidad: 133.33

  }

};

/* ============================================================
   ALIAS DE COMPATIBILIDAD
============================================================ */

window.EQUIPO = window.DATOS_EQUIPO;
window.equipo = window.DATOS_EQUIPO;
window.datosEquipo = window.DATOS_EQUIPO;
window.equipoActual = window.DATOS_EQUIPO;