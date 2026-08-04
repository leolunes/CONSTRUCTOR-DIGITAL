"use strict";

/* ============================================================
   PLANTILLA BASE PARA NUEVOS EQUIPOS

   Para agregar un nuevo equipo:

   1. Copie esta carpeta.
   2. Cambie el nombre de la carpeta.
   3. Reemplace los datos de este archivo.
   4. Guarde la fotografía como imagen.jpg.
   5. Registre el equipo en data/equipos-index.json.

   IMPORTANTE:
   Conserve los nombres de las propiedades para que las páginas
   Entradas, Cálculo, Resumen y Catálogo funcionen correctamente.
============================================================ */

window.DATOS_EQUIPO = {

  /* ==========================================================
     IDENTIFICACIÓN
  ========================================================== */

  id: "plantilla",

  carpeta: "plantilla",

  codigo: "CODIGO-EQUIPO",

  familia: "Familia del equipo",

  marca: "Marca",

  modelo: "Modelo",

  nombre: "Nombre completo del equipo",

  referencia: "Marca Modelo",

  rodaje: "Llantas / Orugas / Otro",

  combustible: "ACPM",

  unidadAlquiler: "hora",

  imagen: "imagen.jpg",

  /* ==========================================================
     PARÁMETROS DE ENTRADA

     Los porcentajes se escriben de forma visible.
     Ejemplo:
     20 = 20 %
     5 = 5 %
  ========================================================== */

  entradas: {

    /* --------------------------------------------------------
       PROPIEDAD Y COSTOS FIJOS
    --------------------------------------------------------- */

    precioAdquisicion: 0,

    valorRescate: 0,

    vidaUtilHoras: 0,

    horasAnio: 0,

    tasaInteres: 0,

    seguroAnual: 0,

    mantenimientoFijoAnual: 0,

    /* --------------------------------------------------------
       COMBUSTIBLE
    --------------------------------------------------------- */

    consumoCombustible: 0,

    precioCombustible: 0,

    /* --------------------------------------------------------
       LUBRICANTES
    --------------------------------------------------------- */

    factorLubricantes: 0,

    /* --------------------------------------------------------
       RODAJE Y DESGASTE
    --------------------------------------------------------- */

    costoRodaje: 0,

    vidaRodajeHoras: 0,

    /* --------------------------------------------------------
       OPERADOR
    --------------------------------------------------------- */

    operadorMes: 0,

    horasOperadorMes: 0,

    /* --------------------------------------------------------
       PRODUCCIÓN Y COMERCIAL
    --------------------------------------------------------- */

    margenAlquiler: 20,

    rendimiento: 0,

    unidadRendimiento: "unidad/h",

    /* --------------------------------------------------------
       TRANSPORTE
    --------------------------------------------------------- */

    movilizacion: 0,

    desmovilizacion: 0,

    horasAmortizacion: 0

  }

};

/* ============================================================
   ALIAS DE COMPATIBILIDAD

   Se conservan para que los archivos actuales puedan encontrar
   el objeto, aunque busquen alguno de estos nombres.
============================================================ */

window.EQUIPO = window.DATOS_EQUIPO;
window.equipo = window.DATOS_EQUIPO;
window.datosEquipo = window.DATOS_EQUIPO;
window.equipoActual = window.DATOS_EQUIPO;