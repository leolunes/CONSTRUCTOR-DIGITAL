// ===============================
// BASE DE DATOS PRINCIPAL (APP)
// Archivo: js/db.js
// ===============================

export const DB = {
  // ===============================
  // DATOS DEL PROCESO
  // ===============================
  proceso: {
    nombre: "",
    objeto: "",
    entidad: "",
    presupuesto: 0,
    trm: 0,
    puntajeMaximo: 100,
    numeroPropuestasHabilitadas: 0,
    fechaEvaluacion: "",
    observaciones: ""
  },

  // ===============================
  // OFERTAS REGISTRADAS
  // ===============================
  ofertas: [
    /*
    {
      id: 1,
      empresa: "",
      oferta: 0,

      // OAB
      diferenciaPO: 0,
      variacionPO: 0,
      alertaAbsoluta: false,
      bajoMinimoRelativo: false,
      clasificacionInicial: "",

      // DECISIÓN DEL COMITÉ
      estado: "PENDIENTE", // ACEPTADA | RECHAZADA | PENDIENTE
      requiereSustentacion: false,
      respondio: "",
      sustentoValido: "",
      causalRechazo: "",
      observacion: "",

      // EVALUACIÓN ECONÓMICA
      puntaje: 0,
      ranking: 0
    }
    */
  ],

  // ===============================
  // RESULTADOS OFERTAS ARTIFICIALMENTE BAJAS
  // ===============================
  resultadosOAB: {
    promedio: 0,
    mediana: 0,
    desviacion: 0,
    minimoAceptable: 0,
    limiteAbsoluto: 0,
    totalOfertas: 0,
    ofertasEnAlerta: 0
  },

  // ===============================
  // RESULTADOS EVALUACIÓN ECONÓMICA
  // ===============================
  resultadosEconomicos: {
    metodo: "",
    mediana: 0,
    mediaGeometrica: 0,
    mediaAritmeticaBaja: 0,
    menorValor: 0,
    vme: 0,
    totalAceptadas: 0,
    mejorOferta: null,
    mejorPuntaje: 0
  }
};

// ===============================
// RESET GENERAL DE LA BASE DE DATOS
// ===============================
export function resetDB() {
  DB.proceso = {
    nombre: "",
    objeto: "",
    entidad: "",
    presupuesto: 0,
    trm: 0,
    puntajeMaximo: 100,
    numeroPropuestasHabilitadas: 0,
    fechaEvaluacion: "",
    observaciones: ""
  };

  DB.ofertas = [];

  DB.resultadosOAB = {
    promedio: 0,
    mediana: 0,
    desviacion: 0,
    minimoAceptable: 0,
    limiteAbsoluto: 0,
    totalOfertas: 0,
    ofertasEnAlerta: 0
  };

  DB.resultadosEconomicos = {
    metodo: "",
    mediana: 0,
    mediaGeometrica: 0,
    mediaAritmeticaBaja: 0,
    menorValor: 0,
    vme: 0,
    totalAceptadas: 0,
    mejorOferta: null,
    mejorPuntaje: 0
  };
}

// ===============================
// ACTUALIZAR DATOS DEL PROCESO
// ===============================
export function actualizarProceso(cambios = {}) {
  DB.proceso = {
    ...DB.proceso,
    ...cambios,
    presupuesto: Number(cambios.presupuesto ?? DB.proceso.presupuesto) || 0,
    trm: Number(cambios.trm ?? DB.proceso.trm) || 0,
    puntajeMaximo: Number(cambios.puntajeMaximo ?? DB.proceso.puntajeMaximo) || 0,
    numeroPropuestasHabilitadas: Number(
      cambios.numeroPropuestasHabilitadas ?? DB.proceso.numeroPropuestasHabilitadas
    ) || 0
  };
}

// ===============================
// CREAR ESTRUCTURA BASE DE OFERTA
// ===============================
export function crearOfertaBase(empresa = "", valor = 0) {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    empresa: String(empresa).trim(),
    oferta: Number(valor) || 0,

    // OAB
    diferenciaPO: 0,
    variacionPO: 0,
    alertaAbsoluta: false,
    bajoMinimoRelativo: false,
    clasificacionInicial: "",

    // DECISIÓN DEL COMITÉ
    estado: "PENDIENTE",
    requiereSustentacion: false,
    respondio: "",
    sustentoValido: "",
    causalRechazo: "",
    observacion: "",

    // EVALUACIÓN ECONÓMICA
    puntaje: 0,
    ranking: 0
  };
}

// ===============================
// AGREGAR OFERTA
// ===============================
export function agregarOferta(empresa, valor) {
  const nueva = crearOfertaBase(empresa, valor);
  DB.ofertas.push(nueva);
  return nueva;
}

// ===============================
// AGREGAR MUCHAS OFERTAS
// ===============================
export function agregarOfertas(lista = []) {
  lista.forEach(item => {
    const empresa = item.empresa ?? item.nombre ?? "";
    const valor = item.oferta ?? item.valor ?? 0;
    DB.ofertas.push(crearOfertaBase(empresa, valor));
  });
}

// ===============================
// GENERAR LÍNEAS DE OFERTAS
// ===============================
export function generarLineasOfertas(cantidad = 0) {
  const total = Number(cantidad) || 0;
  DB.ofertas = [];

  for (let i = 0; i < total; i++) {
    DB.ofertas.push(crearOfertaBase("", 0));
  }

  return DB.ofertas;
}

// ===============================
// OBTENER TODAS LAS OFERTAS
// ===============================
export function obtenerOfertas() {
  return DB.ofertas;
}

// ===============================
// BUSCAR OFERTA POR ID
// ===============================
export function obtenerOfertaPorId(id) {
  return DB.ofertas.find(o => o.id === id) || null;
}

// ===============================
// ACTUALIZAR OFERTA
// ===============================
export function actualizarOferta(id, cambios = {}) {
  const index = DB.ofertas.findIndex(o => o.id === id);
  if (index === -1) return null;

  DB.ofertas[index] = {
    ...DB.ofertas[index],
    ...cambios
  };

  if ("oferta" in cambios) {
    DB.ofertas[index].oferta = Number(cambios.oferta) || 0;
  }

  return DB.ofertas[index];
}

// ===============================
// ELIMINAR OFERTA
// ===============================
export function eliminarOferta(id) {
  DB.ofertas = DB.ofertas.filter(o => o.id !== id);
}

// ===============================
// LIMPIAR TODAS LAS OFERTAS
// ===============================
export function limpiarOfertas() {
  DB.ofertas = [];
}

// ===============================
// ACTUALIZAR ESTADO DE UNA OFERTA
// ===============================
export function actualizarEstadoOferta(id, estado) {
  const oferta = DB.ofertas.find(o => o.id === id);
  if (!oferta) return null;

  oferta.estado = estado;
  return oferta;
}

// ===============================
// MARCAR RESPUESTA / SUSTENTACIÓN
// ===============================
export function actualizarDecisionOferta(id, datos = {}) {
  const oferta = DB.ofertas.find(o => o.id === id);
  if (!oferta) return null;

  oferta.requiereSustentacion = Boolean(
    datos.requiereSustentacion ?? oferta.requiereSustentacion
  );
  oferta.respondio = datos.respondio ?? oferta.respondio;
  oferta.sustentoValido = datos.sustentoValido ?? oferta.sustentoValido;
  oferta.causalRechazo = datos.causalRechazo ?? oferta.causalRechazo;
  oferta.observacion = datos.observacion ?? oferta.observacion;
  oferta.estado = datos.estado ?? oferta.estado;

  return oferta;
}

// ===============================
// OBTENER OFERTAS ACEPTADAS
// ===============================
export function obtenerOfertasAceptadas() {
  return DB.ofertas.filter(o => o.estado === "ACEPTADA");
}

// ===============================
// OBTENER OFERTAS PENDIENTES
// ===============================
export function obtenerOfertasPendientes() {
  return DB.ofertas.filter(o => o.estado === "PENDIENTE");
}

// ===============================
// OBTENER OFERTAS RECHAZADAS
// ===============================
export function obtenerOfertasRechazadas() {
  return DB.ofertas.filter(o => o.estado === "RECHAZADA");
}

// ===============================
// CONTADORES RÁPIDOS
// ===============================
export function contarOfertas() {
  return DB.ofertas.length;
}

export function contarAceptadas() {
  return obtenerOfertasAceptadas().length;
}

export function contarRechazadas() {
  return obtenerOfertasRechazadas().length;
}

export function contarPendientes() {
  return obtenerOfertasPendientes().length;
}

// ===============================
// ACTUALIZAR RESULTADOS OAB
// ===============================
export function actualizarResultadosOAB(datos = {}) {
  DB.resultadosOAB = {
    ...DB.resultadosOAB,
    ...datos
  };
}

// ===============================
// LIMPIAR RESULTADOS OAB
// ===============================
export function limpiarResultadosOAB() {
  DB.resultadosOAB = {
    promedio: 0,
    mediana: 0,
    desviacion: 0,
    minimoAceptable: 0,
    limiteAbsoluto: 0,
    totalOfertas: 0,
    ofertasEnAlerta: 0
  };

  DB.ofertas = DB.ofertas.map(o => ({
    ...o,
    diferenciaPO: 0,
    variacionPO: 0,
    alertaAbsoluta: false,
    bajoMinimoRelativo: false,
    clasificacionInicial: ""
  }));
}

// ===============================
// ACTUALIZAR RESULTADOS ECONÓMICOS
// ===============================
export function actualizarResultadosEconomicos(datos = {}) {
  DB.resultadosEconomicos = {
    ...DB.resultadosEconomicos,
    ...datos
  };
}

// ===============================
// LIMPIAR RESULTADOS ECONÓMICOS
// ===============================
export function limpiarResultadosEconomicos() {
  DB.ofertas = DB.ofertas.map(o => ({
    ...o,
    puntaje: 0,
    ranking: 0
  }));

  DB.resultadosEconomicos = {
    metodo: "",
    mediana: 0,
    mediaGeometrica: 0,
    mediaAritmeticaBaja: 0,
    menorValor: 0,
    vme: 0,
    totalAceptadas: 0,
    mejorOferta: null,
    mejorPuntaje: 0
  };
}

// ===============================
// OBTENER RESUMEN GENERAL
// ===============================
export function obtenerResumenGeneral() {
  return {
    proceso: DB.proceso,
    totalOfertas: contarOfertas(),
    aceptadas: contarAceptadas(),
    rechazadas: contarRechazadas(),
    pendientes: contarPendientes(),
    resultadosOAB: DB.resultadosOAB,
    resultadosEconomicos: DB.resultadosEconomicos
  };
}

// ===============================
// EXPORTAR SNAPSHOT COMPLETO
// ===============================
export function exportarDB() {
  return JSON.parse(JSON.stringify(DB));
}

// ===============================
// IMPORTAR SNAPSHOT COMPLETO
// ===============================
export function importarDB(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return;

  if (snapshot.proceso) DB.proceso = { ...DB.proceso, ...snapshot.proceso };
  if (Array.isArray(snapshot.ofertas)) DB.ofertas = snapshot.ofertas;
  if (snapshot.resultadosOAB) {
    DB.resultadosOAB = { ...DB.resultadosOAB, ...snapshot.resultadosOAB };
  }
  if (snapshot.resultadosEconomicos) {
    DB.resultadosEconomicos = {
      ...DB.resultadosEconomicos,
      ...snapshot.resultadosEconomicos
    };
  }
}


// ===============================
// GESTIÓN DE PROYECTOS
// ===============================
export const PROYECTOS = {
  lista: [],
  activoId: null
};

export function crearNuevoProyecto(nombre = "Proyecto sin nombre") {
  const snapshot = exportarDB();
  const id = Date.now();

  const proyecto = {
    id,
    nombre,
    data: snapshot
  };

  PROYECTOS.lista.push(proyecto);
  PROYECTOS.activoId = id;

  return proyecto;
}

export function guardarProyectoActual(nombre = null) {
  const id = PROYECTOS.activoId;
  if (!id) return;

  const proyecto = PROYECTOS.lista.find(p => p.id === id);
  if (!proyecto) return;

  proyecto.data = exportarDB();
  if (nombre) proyecto.nombre = nombre;
}

export function cargarProyecto(id) {
  const proyecto = PROYECTOS.lista.find(p => p.id === id);
  if (!proyecto) return;

  importarDB(proyecto.data);
  PROYECTOS.activoId = id;
}

export function listarProyectos() {
  return PROYECTOS.lista.map(p => ({
    id: p.id,
    nombre: p.nombre
  }));
}
