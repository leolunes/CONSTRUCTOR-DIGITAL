"use strict";

/* ============================================================
   DATOS DEL EQUIPO
   Motoniveladora
   Código: EQMOTN0001
============================================================ */

window.DATOS_EQUIPO = {

    id: "motoniveladora",

    carpeta: "motoniveladora",

    codigo: "EQMOTN0001",

    familia: "Movimiento de Tierras",

    marca: "Caterpillar",

    modelo: "120K",

    nombre: "Motoniveladora",

    referencia:
        "Motoniveladora Caterpillar 120K para conformación, nivelación y mantenimiento de vías.",

    rodaje: "Llantas",

    combustible: "Diésel",

    unidadAlquiler: "Hora",

    imagen: "imagen.jpg",

    usoRecomendado:
        "Nivelación de plataformas, mantenimiento de vías, conformación de taludes, cunetas, extendido de materiales granulares y acabados de precisión.",

    especificaciones: {

        tipo:
            "Motoniveladora",

        potencia:
            "140 HP",

        pesoOperativo:
            "14.800 kg",

        anchoHoja:
            "3.66 m",

        longitudEquipo:
            "8.70 m",

        anchoEquipo:
            "2.46 m",

        alturaEquipo:
            "3.13 m",

        velocidadMaxima:
            "44 km/h",

        traccion:
            "6x4",

        cabina:
            "Cerrada con aire acondicionado",

        operador:
            "1"

    },

    entradas: {

        precioAdquisicion: 980000000,

        valorRescate: 0.10,

        vidaUtilHoras: 18000,

        horasAnio: 2200,

        tasaInteres: 0.12,

        seguroAnual: 0.025,

        mantenimientoFijoAnual: 32000000,

        consumoCombustible: 18.00,

        precioCombustible: 17000,

        factorLubricantes: 0.15,

        costoRodaje: 85000000,

        vidaRodajeHoras: 6000,

        operadorMes: 4200000,

        horasOperadorMes: 200,

        margenAlquiler: 0.20,

        rendimiento: 450,

        unidadRendimiento: "m²/h",

        unidadCostoProduccion: "COP/m²",

        movilizacion: 950000,

        desmovilizacion: 950000,

        horasAmortizacion: 250,

        tarifaComercialObjetivo: 295000

    },

    calculados: {

        valorRescateCalculado: 98000000,

        depreciacionHora: 49000.00,

        inversionHora: 29400.00,

        seguroHora: 11136.36,

        mantenimientoHora: 14545.45,

        combustibleHora: 306000.00,

        lubricantesHora: 45900.00,

        rodajeHora: 14166.67,

        operadorHora: 21000.00,

        costoDirectoHorario: 491148.48,

        utilidadHora: 98229.70,

        alquilerEquivalente: 589378.18,

        alquilerPorUnidad: 295000.00,

        costoTransporteEquivalente: 7600.00,

        costoComercialFinal: 596978.18,

        tarifaComercial: 295000.00,

        costoPorUnidad: 1319.95

    }

};

/* ============================================================
   ALIAS DE COMPATIBILIDAD
============================================================ */

window.EQUIPO = window.DATOS_EQUIPO;

window.equipo = window.DATOS_EQUIPO;

window.datosEquipo = window.DATOS_EQUIPO;

window.equipoActual = window.DATOS_EQUIPO;