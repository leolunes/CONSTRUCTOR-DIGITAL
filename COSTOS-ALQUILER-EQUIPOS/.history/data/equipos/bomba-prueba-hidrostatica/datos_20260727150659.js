"use strict";

window.EQUIPO_DATOS = {
  "id": "bomba-prueba-hidrostatica",
  "carpeta": "bomba-prueba-hidrostatica",
  "codigo": "EQBOM0002",
  "familia": "Bomba prueba hidrostática",
  "nombre": "Bomba prueba hidrostática",
  "referencia": "Bomba manual para realizar pruebas hidrostáticas de presión en tuberías y redes.",
  "rodaje": "Portátil / manual",
  "combustible": {
    "tipo": "No aplica",
    "consumoHora": 0,
    "unidad": "L/h",
    "precioUnitario": 0,
    "costoHora": 0
  },
  "unidadAlquiler": "Día",
  "imagen": "data/equipos/bomba-prueba-hidrostatica/imagen.jpg",
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
    "unidadRendimiento": "unidad/día",
    "movilizacion": 0,
    "desmovilizacion": 0,
    "horasAmortizacion": 1
  },
  "identificacion": {
    "id": "bomba-prueba-hidrostatica",
    "codigo": "EQBOM0002",
    "nombre": "Bomba prueba hidrostática",
    "familia": "Bomba prueba hidrostática",
    "rodaje": "Portátil / manual",
    "equipoReferencia": "Bomba manual para realizar pruebas hidrostáticas de presión en tuberías y redes.",
    "usoRecomendado": "Pruebas de estanqueidad y presión en redes hidráulicas, sanitarias y tuberías."
  },
  "presentacion": {
    "titulo": "Bomba prueba hidrostática",
    "subtitulo": "Bomba manual para realizar pruebas hidrostáticas de presión en tuberías y redes.",
    "descripcion": "Bomba manual para realizar pruebas hidrostáticas de presión en tuberías y redes.",
    "imagen": "data/equipos/bomba-prueba-hidrostatica/imagen.jpg",
    "usoRecomendado": "Pruebas de estanqueidad y presión en redes hidráulicas, sanitarias y tuberías."
  },
  "configuracion": {
    "rodaje": "Portátil / manual",
    "unidadAlquiler": "Día"
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
    "unidad": "Día",
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
    "costoFinal": 7012.5,
    "tarifaComercial": 56100,
    "margen": 0.2
  },
  "rendimiento": {
    "valor": 1,
    "unidad": "unidad/día",
    "unidadCostoProduccion": "COP/unidad",
    "usoRecomendado": "Pruebas de estanqueidad y presión en redes hidráulicas, sanitarias y tuberías.",
    "condiciones": "Rendimiento referencial; debe ajustarse según las condiciones reales de trabajo."
  },
  "produccion": {
    "valor": 1,
    "unidad": "unidad/día",
    "costoPorUnidad": 56100
  },
  "aplicaciones": [
    "Pruebas de estanqueidad y presión en redes hidráulicas, sanitarias y tuberías."
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
