/* ==========================================================
   PLANTILLA MAESTRA DE EQUIPO
   Archivo: data/equipos/plantilla/datos.js

   INSTRUCCIONES:
   1. Copie esta carpeta cuando vaya a crear un equipo nuevo.
   2. Cambie únicamente los valores, sin alterar los nombres de los campos.
   3. Mantenga el archivo con el nombre datos.js.
   4. Coloque la imagen principal en la misma carpeta con el nombre imagen.jpg.
   ========================================================== */

"use strict";

const EQUIPO_DATOS = {

  /* ========================================================
     1. IDENTIFICACIÓN GENERAL
     ======================================================== */

  identificacion: {
    id: "nombre-del-equipo",
    codigoModelo: "EQ0000000",
    nombreEquipo: "Nombre principal del equipo",
    familia: "Familia del equipo",
    marca: "",
    modeloComercial: "",
    version: "",
    anoReferencia: null,
    estadoEquipo: "Nuevo",
    paisReferencia: "Colombia",
    moneda: "COP",
    activo: true
  },

  /* ========================================================
     2. PRESENTACIÓN Y REFERENCIA
     ======================================================== */

  presentacion: {
    imagenPrincipal: "data/equipos/nombre-del-equipo/imagen.jpg",
    imagenAlternativa: "",
    equipoReferencia: "Descripción corta del equipo de referencia",
    descripcionGeneral:
      "Descripción general del equipo, sus principales características y el contexto en el cual se utiliza.",
    usoRecomendado:
      "Describa las actividades, trabajos y condiciones recomendadas para este equipo.",
    palabrasClave: [
      "equipo",
      "construcción",
      "alquiler"
    ],
    fuenteInformacion: "Base maestra del proyecto",
    fechaActualizacion: "2026-07-23"
  },

  /* ========================================================
     3. CONFIGURACIÓN FÍSICA Y OPERATIVA
     ======================================================== */

  configuracion: {
    rodaje: "",
    tipoEquipo: "",
    tipoCombustible: "No aplica",
    capacidadTanqueLitros: 0,
    potenciaHp: 0,
    potenciaKw: 0,
    pesoOperacionKg: 0,
    longitudM: 0,
    anchoM: 0,
    alturaM: 0,
    capacidadNominal: 0,
    unidadCapacidad: "",
    requiereOperador: true,
    requiereAyudante: false,
    cantidadOperadores: 1,
    cantidadAyudantes: 0
  },

  /* ========================================================
     4. ESPECIFICACIONES TÉCNICAS
     Agregue o elimine filas dentro de la lista según el equipo.
     ======================================================== */

  especificacionesTecnicas: [
    {
      nombre: "Especificación 1",
      valor: "",
      unidad: ""
    },
    {
      nombre: "Especificación 2",
      valor: "",
      unidad: ""
    }
  ],

  /* ========================================================
     5. PARÁMETROS DE PROPIEDAD
     ======================================================== */

  propiedad: {
    precioAdquisicion: 0,
    valorRescatePorcentaje: 0.10,
    valorRescate: 0,
    vidaUtilHoras: 0,
    horasTrabajoAno: 0,
    interesAnualPorcentaje: 0,
    seguroAnualPorcentaje: 0,
    impuestosAnualesPorcentaje: 0,
    administracionAnualPorcentaje: 0,
    mantenimientoFijoAnual: 0
  },

  /* ========================================================
     6. COSTOS FIJOS POR HORA
     Estos campos pueden contener valores calculados o digitados.
     ======================================================== */

  costosFijosHora: {
    depreciacion: 0,
    inversionPromedio: 0,
    interesCapital: 0,
    seguros: 0,
    impuestos: 0,
    administracion: 0,
    mantenimientoFijo: 0,
    otrosCostosFijos: 0,
    totalCostosFijos: 0
  },

  /* ========================================================
     7. COMBUSTIBLE
     ======================================================== */

  combustible: {
    aplica: false,
    tipo: "No aplica",
    consumoLitrosHora: 0,
    precioPorLitro: 0,
    costoHora: 0,
    fuentePrecio: "",
    fechaPrecio: "2026-07-23"
  },

  /* ========================================================
     8. LUBRICANTES, FILTROS Y FLUIDOS
     ======================================================== */

  lubricantes: {
    aplica: false,
    porcentajeSobreCombustible: 0,
    costoHora: 0,
    aceiteMotorHora: 0,
    aceiteHidraulicoHora: 0,
    grasasHora: 0,
    filtrosHora: 0,
    refrigeranteHora: 0,
    otrosFluidosHora: 0
  },

  /* ========================================================
     9. RODAJE, LLANTAS, ORUGAS Y ELEMENTOS DE DESGASTE
     ======================================================== */

  rodajeDesgaste: {
    aplica: false,
    tipo: "",
    costoReposicion: 0,
    vidaUtilHoras: 1,
    costoHora: 0,
    llantasHora: 0,
    orugasHora: 0,
    cuchillasHora: 0,
    dientesHora: 0,
    cablesHora: 0,
    otrosElementosHora: 0
  },

  /* ========================================================
     10. MANTENIMIENTO Y REPARACIONES VARIABLES
     ======================================================== */

  mantenimientoVariable: {
    aplica: true,
    factorMantenimiento: 0,
    costoHora: 0,
    repuestosHora: 0,
    manoObraTallerHora: 0,
    mantenimientoPreventivoHora: 0,
    mantenimientoCorrectivoHora: 0,
    otrosCostosHora: 0
  },

  /* ========================================================
     11. OPERADOR Y PERSONAL
     ======================================================== */

  operador: {
    aplica: true,
    cargo: "Operador de equipo",
    costoMensual: 0,
    horasMes: 200,
    prestacionesIncluidas: true,
    costoHora: 0
  },

  ayudante: {
    aplica: false,
    cargo: "Ayudante",
    costoMensual: 0,
    horasMes: 200,
    prestacionesIncluidas: true,
    costoHora: 0
  },

  /* ========================================================
     12. ENERGÍA ELÉCTRICA U OTRAS FUENTES
     ======================================================== */

  energia: {
    aplica: false,
    consumoKwhHora: 0,
    precioKwh: 0,
    costoHora: 0,
    otraFuenteEnergia: "",
    costoOtraFuenteHora: 0
  },

  /* ========================================================
     13. OTROS COSTOS DE OPERACIÓN
     ======================================================== */

  otrosCostosOperacion: {
    herramientasMenoresHora: 0,
    elementosSeguridadHora: 0,
    limpiezaHora: 0,
    consumiblesHora: 0,
    vigilanciaHora: 0,
    permisosHora: 0,
    otrosHora: 0,
    totalOtrosCostosHora: 0
  },

  /* ========================================================
     14. COSTO DIRECTO
     ======================================================== */

  costoDirecto: {
    costosFijosHora: 0,
    combustibleHora: 0,
    lubricantesHora: 0,
    rodajeDesgasteHora: 0,
    mantenimientoVariableHora: 0,
    operadorHora: 0,
    ayudanteHora: 0,
    energiaHora: 0,
    otrosCostosOperacionHora: 0,
    totalCostoDirectoHora: 0
  },

  /* ========================================================
     15. TARIFA DE ALQUILER
     ======================================================== */

  alquiler: {
    margenPorcentaje: 0.20,
    alquilerEquivalenteHora: 0,
    unidadAlquiler: "Hr",
    horasPorJornada: 8,
    tarifaComercial: 0,
    tarifaMinima: 0,
    tarifaMaxima: 0,
    incluyeOperador: true,
    incluyeCombustible: true,
    incluyeMantenimiento: true,
    incluyeTransporte: false,
    condicionesComerciales:
      "La tarifa puede variar según ubicación, duración, disponibilidad, condiciones del frente de obra y alcance contratado."
  },

  /* ========================================================
     16. MOVILIZACIÓN Y DESMOVILIZACIÓN
     ======================================================== */

  transporte: {
    requiereMovilizacion: false,
    movilizacion: 0,
    desmovilizacion: 0,
    horasAmortizacion: 1,
    costoTransporteEquivalenteHora: 0,
    tipoVehiculoRequerido: "",
    distanciaBaseKm: 0,
    observaciones:
      "El costo definitivo debe ajustarse según origen, destino, peajes, cargue, descargue y permisos."
  },

  /* ========================================================
     17. COSTO COMERCIAL FINAL
     ======================================================== */

  costoComercial: {
    tarifaComercialBase: 0,
    costoTransporteEquivalenteHora: 0,
    costoComercialFinalHora: 0,
    costoComercialFinalDia: 0
  },

  /* ========================================================
     18. RENDIMIENTO Y PRODUCCIÓN
     ======================================================== */

  rendimiento: {
    rendimientoReferencial: 0,
    unidadRendimiento: "",
    jornadaHoras: 8,
    produccionPorJornada: 0,
    eficienciaOperacionPorcentaje: 1,
    rendimientoAjustado: 0,
    condicionesReferencia:
      "Rendimiento estimado en condiciones normales de operación, con operador competente y frente de trabajo disponible."
  },

  /* ========================================================
     19. COSTO POR UNIDAD DE PRODUCCIÓN
     ======================================================== */

  produccion: {
    unidadCostoProduccion: "",
    alquilerPorUnidad: 0,
    costoDirectoPorUnidad: 0,
    costoComercialPorUnidad: 0
  },

  /* ========================================================
     20. FACTORES DE AJUSTE
     ======================================================== */

  factoresAjuste: {
    region: "Santander",
    factorRegional: 1,
    alturaSobreNivelMar: 0,
    factorAltura: 1,
    estadoEquipo: "Bueno",
    factorEstado: 1,
    dificultadAcceso: "Normal",
    factorAcceso: 1,
    disponibilidadMercado: "Normal",
    factorDisponibilidad: 1,
    factorTotal: 1
  },

  /* ========================================================
     21. APLICACIONES Y ACTIVIDADES
     ======================================================== */

  aplicaciones: [
    {
      actividad: "Actividad principal",
      descripcion: "",
      unidadMedida: "",
      rendimientoMinimo: 0,
      rendimientoPromedio: 0,
      rendimientoMaximo: 0
    }
  ],

  /* ========================================================
     22. ACCESORIOS Y CONFIGURACIONES COMPATIBLES
     ======================================================== */

  accesorios: [
    {
      nombre: "",
      descripcion: "",
      incrementoTarifaHora: 0,
      requiereOperadorEspecializado: false
    }
  ],

  /* ========================================================
     23. SEGURIDAD Y REQUISITOS
     ======================================================== */

  seguridad: {
    requiereCertificacion: false,
    certificaciones: [],
    elementosProteccionPersonal: [],
    inspeccionPreoperacional: true,
    requisitosOperador: [],
    restriccionesUso: [],
    observaciones: ""
  },

  /* ========================================================
     24. MANTENIMIENTO RECOMENDADO
     ======================================================== */

  mantenimientoRecomendado: [
    {
      actividad: "Inspección general",
      frecuenciaHoras: 0,
      frecuenciaDias: 1,
      observaciones: ""
    }
  ],

  /* ========================================================
     25. DOCUMENTOS Y SOPORTES
     ======================================================== */

  documentos: [
    {
      nombre: "",
      tipo: "",
      ruta: "",
      descripcion: ""
    }
  ],

  /* ========================================================
     26. PROVEEDORES Y REFERENCIAS DE MERCADO
     ======================================================== */

  mercado: {
    ciudadReferencia: "Bucaramanga",
    departamentoReferencia: "Santander",
    proveedoresConsultados: [],
    fechaCotizacion: "2026-07-23",
    rangoMercadoMinimo: 0,
    rangoMercadoPromedio: 0,
    rangoMercadoMaximo: 0,
    observacionesMercado: ""
  },

  /* ========================================================
     27. CONTROL DE CALIDAD DE LOS DATOS
     ======================================================== */

  control: {
    estadoRegistro: "Borrador",
    revisadoPor: "",
    aprobadoPor: "",
    fechaCreacion: "2026-07-23",
    fechaRevision: "",
    versionRegistro: "1.0",
    fuentePrincipal: "",
    nivelConfiabilidad: "Medio",
    requiereActualizacion: false,
    observacionesRevision: ""
  },

  /* ========================================================
     28. OBSERVACIONES GENERALES
     ======================================================== */

  observaciones: {
    tecnicas: "",
    economicas: "",
    operativas: "",
    comerciales: "",
    adicionales: ""
  }
};

/* ==========================================================
   EXPOSICIÓN DEL EQUIPO A LA APLICACIÓN
   No modificar esta sección.
   ========================================================== */

window.EQUIPO_DATOS = EQUIPO_DATOS;