"use strict";

/* ============================================================
   DATOS DEL EQUIPO
   Aspiradora Industrial
   Código: EQASP0001
============================================================ */

window.DATOS_EQUIPO = {

  id: "aspiradora-industrial",
  carpeta: "aspiradora-industrial",

  codigo: "EQASP0001",

  familia: "Equipos de limpieza industrial",

  marca: "Genérico",

  modelo: "Aspiradora Industrial 80 L",

  nombre: "Aspiradora Industrial",

  referencia:
    "Aspiradora industrial para recolección de polvo, residuos sólidos y líquidos en obras de construcción, industrias y bodegas.",

  rodaje: "No aplica",

  combustible: "Energía eléctrica",

  unidadAlquiler: "Día",

  imagen: "imagen.jpg",

  usoRecomendado:
    "Limpieza de obras civiles, bodegas, industrias, talleres, centros comerciales, hospitales y todo tipo de superficies con residuos sólidos o líquidos.",

  especificaciones: {

    tipo:
      "Aspiradora industrial húmedo/seco",

    capacidadTanque:
      "80 litros",

    potenciaMotor:
      "3.000 W",

    alimentacion:
      "110 V",

    numeroMotores:
      "3",

    caudalAire:
      "160 L/s",

    vacio:
      "2.400 mmH₂O",

    longitudManguera:
      "2.5 m",

    longitudCable:
      "8 m",

    sistemaFiltrado:
      "Filtro lavable",

    peso:
      "28 kg",

    incluyeAccesorios:
      "Sí"

  },

  entradas: {

    precioAdquisicion: 4200000,

    valorRescate: 0.10,

    vidaUtilHoras: 7000,

    horasAnio: 1600,

    tasaInteres: 0.12,

    seguroAnual: 0.01,

    mantenimientoFijoAnual: 180000,

    consumoCombustible: 3.00,

    precioCombustible: 900,

    factorLubricantes: 0,

    costoRodaje: 0,

    vidaRodajeHoras: 1,

    operadorMes: 0,

    horasOperadorMes: 200,

    margenAlquiler: 0.20,

    rendimiento: 1200,

    unidadRendimiento: "m²/día",

    unidadCostoProduccion: "COP/m²",

    movilizacion: 40000,

    desmovilizacion: 40000,

    horasAmortizacion: 80,

    tarifaComercialObjetivo: 95000

  },

  calculados: {

    valorRescateCalculado: 420000,

    depreciacionHora: 540.00,

    inversionHora: 315.00,

    seguroHora: 26.25,

    mantenimientoHora: 112.50,

    combustibleHora: 2700.00,

    lubricantesHora: 0,

    rodajeHora: 0,

    operadorHora: 0,

    costoDirectoHorario: 3693.75,

    utilidadHora: 738.75,

    alquilerEquivalente: 4432.50,

    alquilerPorUnidad: 95000,

    costoTransporteEquivalente: 1000,

    costoComercialFinal: 5432.50,

    tarifaComercial: 95000,

    costoPorUnidad: 79.17

  }

};

/* ============================================================
   ALIAS DE COMPATIBILIDAD
============================================================ */

window.EQUIPO = window.DATOS_EQUIPO;
window.equipo = window.DATOS_EQUIPO;
window.datosEquipo = window.DATOS_EQUIPO;
window.equipoActual = window.DATOS_EQUIPO;