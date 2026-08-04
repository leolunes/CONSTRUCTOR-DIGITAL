"use strict";

window.EQUIPO_DATOS = {
  "id": "barredora-mecanica-6m3",
  "carpeta": "barredora-mecanica-6m3",
  "codigo": "EQBAR0001",
  "familia": "Barredora mecánica de cepillo, 6 m3",
  "nombre": "Barredora mecánica de cepillo, 6 m3",
  "referencia": "Barredora mecánica autopropulsada de cepillo con capacidad aproximada de 6 m³.",
  "rodaje": "Llantas / autopropulsada",
  "combustible": {
    "tipo": "ACPM",
    "consumoHora": 0,
    "unidad": "L/h",
    "precioUnitario": 0,
    "costoHora": 0
  },
  "unidadAlquiler": "Hr",
  "imagen": "data/equipos/barredora-mecanica-6m3/imagen.jpg",
  "entradas": {
    "precioAdquisicion": 0,
    "valorRescate": 0,
    "vidaUtilHoras": 1,
    "horasAnio": 1,
    "tasaInteres": 0,
    "seguroAnual": 0,
    "mantenimientoFijoAnual": 0,
    "consumoCombustible": 0,
    "precioCombustible": 0,
    "factorLubricantes": 0,
    "costoRodaje": 0,
    "vidaRodajeHoras": 1,
    "operadorMes": 0,
    "horasOperadorMes": 1,
    "margenAlquiler": 20,
    "rendimiento": 1,
    "unidadRendimiento": "km/h",
    "movilizacion": 0,
    "desmovilizacion": 0,
    "horasAmortizacion": 1
  },
  "identificacion": {
    "id": "barredora-mecanica-6m3",
    "codigo": "EQBAR0001",
    "nombre": "Barredora mecánica de cepillo, 6 m3",
    "familia": "Barredora mecánica de cepillo, 6 m3",
    "rodaje": "Llantas / autopropulsada",
    "equipoReferencia": "Barredora mecánica autopropulsada de cepillo con capacidad aproximada de 6 m³.",
    "usoRecomendado": "Barrido y limpieza mecanizada de vías, patios, zonas industriales y frentes de obra."
  },
  "presentacion": {
    "titulo": "Barredora mecánica de cepillo, 6 m3",
    "subtitulo": "Barredora mecánica autopropulsada de cepillo con capacidad aproximada de 6 m³.",
    "descripcion": "Barredora mecánica autopropulsada de cepillo con capacidad aproximada de 6 m³.",
    "imagen": "data/equipos/barredora-mecanica-6m3/imagen.jpg",
    "usoRecomendado": "Barrido y limpieza mecanizada de vías, patios, zonas industriales y frentes de obra."
  },
  "configuracion": {
    "rodaje": "Llantas / autopropulsada",
    "unidadAlquiler": "Hr"
  },
  "propiedad": {
    "precioAdquisicion": 0,
    "valorRescate": 0,
    "vidaUtilHoras": 1,
    "horasAnio": 1,
    "tasaInteres": 0,
    "seguroAnual": 0
  },
  "costosFijosHora": {
    "depreciacionHora": 0,
    "interesHora": 0,
    "seguroHora": 0,
    "mantenimientoFijoHora": 0
  },
  "lubricantes": {
    "factor": 0,
    "costoHora": 0
  },
  "rodajeDesgaste": {
    "costoRodaje": 0,
    "vidaRodajeHoras": 1,
    "costoHora": 0
  },
  "mantenimientoVariable": {
    "costoHora": 0
  },
  "operador": {
    "costoMensual": 0,
    "horasMes": 1,
    "costoHora": 0
  },
  "ayudante": {
    "costoHora": 0
  },
  "energia": {
    "tipo": "No aplica",
    "costoHora": 0
  },
  "otrosCostosOperacion": {
    "costoHora": 0
  },
  "costoDirecto": {
    "totalHora": 0
  },
  "alquiler": {
    "unidad": "Hr",
    "margen": 0.2,
    "alquilerEquivalente": 183600,
    "tarifaComercial": 183600,
    "condiciones": "Costo horario referencial tomado de la plantilla maestra de equipos."
  },
  "transporte": {
    "movilizacion": 0,
    "desmovilizacion": 0,
    "horasAmortizacion": 1,
    "equivalenteHora": 0
  },
  "costoComercial": {
    "costoFinal": 183600,
    "tarifaComercial": 183600,
    "margen": 0.2
  },
  "rendimiento": {
    "valor": 1,
    "unidad": "km/h",
    "unidadCostoProduccion": "COP/km",
    "usoRecomendado": "Barrido y limpieza mecanizada de vías, patios, zonas industriales y frentes de obra.",
    "condiciones": "Rendimiento referencial; debe ajustarse según las condiciones reales de trabajo."
  },
  "produccion": {
    "valor": 1,
    "unidad": "km/h",
    "costoPorUnidad": 183600
  },
  "aplicaciones": [
    "Barrido y limpieza mecanizada de vías, patios, zonas industriales y frentes de obra."
  ],
  "accesorios": [],
  "seguridad": {
    "recomendacion": "Operar conforme al manual del fabricante y a las condiciones de seguridad aplicables."
  },
  "observaciones": {
    "fuente": "Plantilla base de costo de alquiler comercial equivalente.",
    "nota": "Valores referenciales expresados en pesos colombianos."
  },
  "control": {
    "estado": "ACTIVO",
    "version": "2026-07-27"
  },
  "mercado": {
    "moneda": "COP",
    "costoHorarioReferencial": 183600
  },
  "factoresAjuste": {
    "ubicacion": 1,
    "disponibilidad": 1,
    "duracionAlquiler": 1
  }
};

window.EQUIPO = window.EQUIPO_DATOS;
window.DATOS_EQUIPO = window.EQUIPO_DATOS;
