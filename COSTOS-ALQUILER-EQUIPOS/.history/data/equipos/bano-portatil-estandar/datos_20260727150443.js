"use strict";

window.EQUIPO_DATOS = {
  "id": "bano-portatil-estandar",
  "carpeta": "bano-portatil-estandar",
  "codigo": "EQBAN0001",
  "familia": "Baño portátil estándar de polietileno de 1.20x1.20x2.35 m",
  "nombre": "Baño portátil estándar de polietileno de 1.20x1.20x2.35 m",
  "referencia": "Baño portátil estándar de polietileno para instalaciones temporales de obra y eventos.",
  "rodaje": "Portátil / polietileno",
  "combustible": {
    "tipo": "No aplica",
    "consumoHora": 0,
    "unidad": "L/h",
    "precioUnitario": 0,
    "costoHora": 0
  },
  "unidadAlquiler": "Mes",
  "imagen": "data/equipos/bano-portatil-estandar/imagen.jpg",
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
    "unidadRendimiento": "unidad/mes",
    "movilizacion": 0,
    "desmovilizacion": 0,
    "horasAmortizacion": 1
  },
  "identificacion": {
    "id": "bano-portatil-estandar",
    "codigo": "EQBAN0001",
    "nombre": "Baño portátil estándar de polietileno de 1.20x1.20x2.35 m",
    "familia": "Baño portátil estándar de polietileno de 1.20x1.20x2.35 m",
    "rodaje": "Portátil / polietileno",
    "equipoReferencia": "Baño portátil estándar de polietileno para instalaciones temporales de obra y eventos.",
    "usoRecomendado": "Servicios sanitarios temporales en obras, campamentos, eventos y zonas sin infraestructura sanitaria."
  },
  "presentacion": {
    "titulo": "Baño portátil estándar de polietileno de 1.20x1.20x2.35 m",
    "subtitulo": "Baño portátil estándar de polietileno para instalaciones temporales de obra y eventos.",
    "descripcion": "Baño portátil estándar de polietileno para instalaciones temporales de obra y eventos.",
    "imagen": "data/equipos/bano-portatil-estandar/imagen.jpg",
    "usoRecomendado": "Servicios sanitarios temporales en obras, campamentos, eventos y zonas sin infraestructura sanitaria."
  },
  "configuracion": {
    "rodaje": "Portátil / polietileno",
    "unidadAlquiler": "Mes"
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
    "unidad": "Mes",
    "margen": 0.2,
    "alquilerEquivalente": 489600,
    "tarifaComercial": 489600,
    "condiciones": "Costo horario referencial tomado de la plantilla maestra de equipos."
  },
  "transporte": {
    "movilizacion": 0,
    "desmovilizacion": 0,
    "horasAmortizacion": 1,
    "equivalenteHora": 0
  },
  "costoComercial": {
    "costoFinal": 2040,
    "tarifaComercial": 489600,
    "margen": 0.2
  },
  "rendimiento": {
    "valor": 1,
    "unidad": "unidad/mes",
    "unidadCostoProduccion": "COP/unidad",
    "usoRecomendado": "Servicios sanitarios temporales en obras, campamentos, eventos y zonas sin infraestructura sanitaria.",
    "condiciones": "Rendimiento referencial; debe ajustarse según las condiciones reales de trabajo."
  },
  "produccion": {
    "valor": 1,
    "unidad": "unidad/mes",
    "costoPorUnidad": 489600
  },
  "aplicaciones": [
    "Servicios sanitarios temporales en obras, campamentos, eventos y zonas sin infraestructura sanitaria."
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
    "costoHorarioReferencial": 489600
  },
  "factoresAjuste": {
    "ubicacion": 1,
    "disponibilidad": 1,
    "duracionAlquiler": 1
  }
};

window.EQUIPO = window.EQUIPO_DATOS;
window.DATOS_EQUIPO = window.EQUIPO_DATOS;
