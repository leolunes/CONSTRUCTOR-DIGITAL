"use strict";

/* ============================================================
   MOTONIVELADORA DE REFERENCIA
   Código: EQMTA0089
============================================================ */

window.DATOS_EQUIPO = {

  /*==========================================================
    IDENTIFICACIÓN
  ==========================================================*/

  id: "EQMTA0089",

  carpeta: "motoniveladora",

  codigo: "EQMTA0089",

  familia: "Motoniveladora",

  marca: "",

  modelo: "",

  nombre: "Motoniveladora",

  referencia:
    "Motoniveladora para conformación y perfilado de vías",

  rodaje: "Llantas",

  combustible: "ACPM",

  unidadAlquiler: "Hr",

  imagen: "imagen.jpg",

  /*==========================================================
    PARÁMETROS DE ENTRADA
  ==========================================================*/

  entradas: {

    /*---------------------------------------------
      PROPIEDAD
    ----------------------------------------------*/

    precioAdquisicion: 500000000,

    valorRescate: 10,

    vidaUtilHoras: 9782.608695652174,

    horasAnio: 1800,

    tasaInteres: 11.78181818181818,

    seguroAnual: 2.7,

    mantenimientoFijoAnual: 36508500,

    /*---------------------------------------------
      COMBUSTIBLE
    ----------------------------------------------*/

    consumoCombustible: 7.131011122345803,

    precioCombustible: 11500,

    /*---------------------------------------------
      LUBRICANTES
    ----------------------------------------------*/

    factorLubricantes: 16.21621621621622,

    /*---------------------------------------------
      RODAJE
    ----------------------------------------------*/

    costoRodaje: 39000000,

    vidaRodajeHoras: 3000,

    /*---------------------------------------------
      OPERADOR
    ----------------------------------------------*/

    operadorMes: 5200000,

    horasOperadorMes: 200,

    /*---------------------------------------------
      COMERCIAL
    ----------------------------------------------*/

    margenAlquiler: 20,

    rendimiento: 250,

    unidadRendimiento: "m3/h",

    /*---------------------------------------------
      TRANSPORTE
    ----------------------------------------------*/

    movilizacion: 1800000,

    desmovilizacion: 1800000,

    horasAmortizacion: 300

  },

  /*==========================================================
    VALORES DE REFERENCIA CALCULADOS
  ==========================================================*/

  calculados: {

    costoDirectoHorario: 226087.50,

    alquilerEquivalente: 271305.00,

    costoPorUnidad: 1085.22,

    costoTransporteEquivalente: 12000.00,

    costoComercialFinal: 283305.00

  }

};

/*============================================================
  ALIAS DE COMPATIBILIDAD
============================================================*/

window.EQUIPO = window.DATOS_EQUIPO;
window.equipo = window.DATOS_EQUIPO;
window.datosEquipo = window.DATOS_EQUIPO;
window.equipoActual = window.DATOS_EQUIPO;