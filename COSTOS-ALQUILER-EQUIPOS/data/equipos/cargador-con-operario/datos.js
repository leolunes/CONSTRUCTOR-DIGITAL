"use strict";

window.DATOS_EQUIPO = {
  "versionDatos": "2026-07-28-base-22",
  "id": "cargador-con-operario",
  "carpeta": "cargador-con-operario",
  "codigo": "EQCAR0002",
  "familia": "Cargador con operario",
  "marca": "Referencial",
  "modelo": "Cargador frontal",
  "nombre": "Cargador con operario",
  "referencia": "Cargador frontal sobre llantas con operario para cargue, acopio y manejo de materiales.",
  "rodaje": "Llantas / cargador frontal",
  "combustible": "ACPM",
  "unidadAlquiler": "Hr",
  "horasPorUnidadAlquiler": 1,
  "imagen": "imagen.jpg",
  "usoRecomendado": "Cargue de materiales, conformación de acopios, alimentación de plantas y manejo de agregados.",
  "entradas": {
    "precioAdquisicion": 520000000,
    "valorRescate": 0.1,
    "vidaUtilHoras": 18000,
    "horasAnio": 2200,
    "tasaInteres": 0.12,
    "seguroAnual": 0.025,
    "mantenimientoFijoAnual": 16000000,
    "consumoCombustible": 9,
    "precioCombustible": 11500,
    "factorLubricantes": 0.1,
    "costoRodaje": 65000000,
    "vidaRodajeHoras": 6000,
    "operadorMes": 4200000,
    "horasOperadorMes": 200,
    "margenAlquiler": 0.2,
    "rendimiento": 180,
    "unidadRendimiento": "m3/h",
    "unidadCostoProduccion": "COP/m3",
    "unidadAlquiler": "Hr",
    "horasPorUnidadAlquiler": 1,
    "tarifaComercialObjetivo": 252592,
    "movilizacion": 1800000,
    "desmovilizacion": 1800000,
    "horasAmortizacion": 300
  },
  "calculados": {
    "valorRescateCalculado": 52000000.0,
    "depreciacionHora": 26000.0,
    "inversionHora": 15600.0,
    "seguroHora": 5909.090909090909,
    "mantenimientoHora": 7272.727272727273,
    "combustibleHora": 103500,
    "lubricantesHora": 10350.0,
    "rodajeHora": 10833.333333333334,
    "operadorHora": 21000.0,
    "costoDirectoHorario": 200465.15151515152,
    "utilidadHora": 40093.030303030304,
    "alquilerEquivalente": 240558.18181818182,
    "alquilerPorUnidad": 1403.29,
    "tarifaComercial": 252592,
    "costoTransporteEquivalente": 12000,
    "costoComercialFinal": 264592,
    "costoPorUnidad": 1403.29
  }
};

window.EQUIPO_DATOS = window.DATOS_EQUIPO;
window.EQUIPO = window.DATOS_EQUIPO;
window.equipo = window.DATOS_EQUIPO;
window.datosEquipo = window.DATOS_EQUIPO;
window.equipoActual = window.DATOS_EQUIPO;
