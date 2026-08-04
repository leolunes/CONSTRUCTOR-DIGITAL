"use strict";

window.EQUIPO_DATOS = {
  "id": "barredora-sopladora",
  "carpeta": "barredora-sopladora",
  "codigo": "EQBAR0002",
  "familia": "Barredora sopladora",
  "nombre": "Barredora sopladora",
  "referencia": "Barredora sopladora para limpieza de superficies mediante cepillado y flujo de aire.",
  "rodaje": "Accesorio / implemento",
  "combustible": {
    "tipo": "No aplica",
    "consumoHora": 0,
    "unidad": "L/h",
    "precioUnitario": 0,
    "costoHora": 0
  },
  "unidadAlquiler": "Hr",
  "imagen": "data/equipos/barredora-sopladora/imagen.jpg",
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
    "unidadRendimiento": "unidad/h",
    "movilizacion": 0,
    "desmovilizacion": 0,
    "horasAmortizacion": 1
  },
  "identificacion": {
    "id": "barredora-sopladora",
    "codigo": "EQBAR0002",
    "nombre": "Barredora sopladora",
    "familia": "Barredora sopladora",
    "rodaje": "Accesorio / implemento",
    "equipoReferencia": "Barredora sopladora para limpieza de superficies mediante cepillado y flujo de aire.",
    "usoRecomendado": "Limpieza de vías, pisos, patios y superficies mediante barrido y soplado."
  },
  "presentacion": {
    "titulo": "Barredora sopladora",
    "subtitulo": "Barredora sopladora para limpieza de superficies mediante cepillado y flujo de aire.",
    "descripcion": "Barredora sopladora para limpieza de superficies mediante cepillado y flujo de aire.",
    "imagen": "data/equipos/barredora-sopladora/imagen.jpg",
    "usoRecomendado": "Limpieza de vías, pisos, patios y superficies mediante barrido y soplado."
  },
  "configuracion": {
    "rodaje": "Accesorio / implemento",
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
    "alquilerEquivalente": 56100,
    "tarifaComercial": 56100,
    "condiciones": "Costo horario referencial tomado de la plantilla maestra de equipos."
  },
  "transporte": {
    "movilizacion": 0,
    "desmovilizacion": 0,
    "horasAmortizacion": 1,
    "equivalenteHora": 0
  },
  "costoComercial": {
    "costoFinal": 56100,
    "tarifaComercial": 56100,
    "margen": 0.2
  },
  "rendimiento": {
    "valor": 1,
    "unidad": "unidad/h",
    "unidadCostoProduccion": "COP/unidad",
    "usoRecomendado": "Limpieza de vías, pisos, patios y superficies mediante barrido y soplado.",
    "condiciones": "Rendimiento referencial; debe ajustarse según las condiciones reales de trabajo."
  },
  "produccion": {
    "valor": 1,
    "unidad": "unidad/h",
    "costoPorUnidad": 56100
  },
  "aplicaciones": [
    "Limpieza de vías, pisos, patios y superficies mediante barrido y soplado."
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
    "costoHorarioReferencial": 56100
  },
  "factoresAjuste": {
    "ubicacion": 1,
    "disponibilidad": 1,
    "duracionAlquiler": 1
  }
};

window.EQUIPO = window.EQUIPO_DATOS;
window.DATOS_EQUIPO = window.EQUIPO_DATOS;
