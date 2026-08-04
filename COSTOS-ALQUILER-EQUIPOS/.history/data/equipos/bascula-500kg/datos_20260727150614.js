"use strict";

window.EQUIPO_DATOS = {
  "id": "bascula-500kg",
  "carpeta": "bascula-500kg",
  "codigo": "EQBAS0001",
  "familia": "Báscula 500 kg",
  "nombre": "Báscula 500 kg",
  "referencia": "Báscula portátil de plataforma con capacidad máxima de 500 kg.",
  "rodaje": "Portátil / plataforma",
  "combustible": {
    "tipo": "Energía eléctrica / batería",
    "consumoHora": 0,
    "unidad": "L/h",
    "precioUnitario": 0,
    "costoHora": 0
  },
  "unidadAlquiler": "Día",
  "imagen": "data/equipos/bascula-500kg/imagen.jpg",
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
    "id": "bascula-500kg",
    "codigo": "EQBAS0001",
    "nombre": "Báscula 500 kg",
    "familia": "Báscula 500 kg",
    "rodaje": "Portátil / plataforma",
    "equipoReferencia": "Báscula portátil de plataforma con capacidad máxima de 500 kg.",
    "usoRecomendado": "Pesaje de materiales, insumos y elementos en bodegas, talleres y frentes de obra."
  },
  "presentacion": {
    "titulo": "Báscula 500 kg",
    "subtitulo": "Báscula portátil de plataforma con capacidad máxima de 500 kg.",
    "descripcion": "Báscula portátil de plataforma con capacidad máxima de 500 kg.",
    "imagen": "data/equipos/bascula-500kg/imagen.jpg",
    "usoRecomendado": "Pesaje de materiales, insumos y elementos en bodegas, talleres y frentes de obra."
  },
  "configuracion": {
    "rodaje": "Portátil / plataforma",
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
    "tipo": "Energía eléctrica / batería",
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
    "alquilerEquivalente": 40800,
    "tarifaComercial": 40800,
    "condiciones": "Costo horario referencial tomado de la plantilla maestra de equipos."
  },
  "transporte": {
    "movilizacion": 0,
    "desmovilizacion": 0,
    "horasAmortizacion": 1,
    "equivalenteHora": 0
  },
  "costoComercial": {
    "costoFinal": 5100,
    "tarifaComercial": 40800,
    "margen": 0.2
  },
  "rendimiento": {
    "valor": 1,
    "unidad": "unidad/día",
    "unidadCostoProduccion": "COP/unidad",
    "usoRecomendado": "Pesaje de materiales, insumos y elementos en bodegas, talleres y frentes de obra.",
    "condiciones": "Rendimiento referencial; debe ajustarse según las condiciones reales de trabajo."
  },
  "produccion": {
    "valor": 1,
    "unidad": "unidad/día",
    "costoPorUnidad": 40800
  },
  "aplicaciones": [
    "Pesaje de materiales, insumos y elementos en bodegas, talleres y frentes de obra."
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
    "costoHorarioReferencial": 40800
  },
  "factoresAjuste": {
    "ubicacion": 1,
    "disponibilidad": 1,
    "duracionAlquiler": 1
  }
};

window.EQUIPO = window.EQUIPO_DATOS;
window.DATOS_EQUIPO = window.EQUIPO_DATOS;
