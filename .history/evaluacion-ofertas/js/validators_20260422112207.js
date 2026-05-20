// ===============================
// VALIDADORES DE LA APP
// Archivo: js/validators.js
// ===============================

import { DB, obtenerOfertas, obtenerOfertasAceptadas } from "./db.js";

// ===============================
// UTILIDADES
// ===============================
function esVacio(valor) {
  return valor === null || valor === undefined || String(valor).trim() === "";
}

function esNumeroValido(valor) {
  return !Number.isNaN(Number(valor)) && Number(valor) > 0;
}

function limpiarTexto(valor) {
  return String(valor || "").trim();
}

// ===============================
// VALIDAR DATOS DEL PROCESO
// ===============================
export function validarProceso() {
  const errores = [];

  if (esVacio(DB.proceso.nombre)) {
    errores.push("Debe registrar el nombre o número del proceso.");
  }

  if (esVacio(DB.proceso.objeto)) {
    errores.push("Debe registrar el objeto del proceso.");
  }

  if (esVacio(DB.proceso.entidad)) {
    errores.push("Debe registrar el nombre de la entidad.");
  }

  if (!esNumeroValido(DB.proceso.presupuesto)) {
    errores.push("El presupuesto oficial debe ser un número mayor que cero.");
  }

  if (!esNumeroValido(DB.proceso.puntajeMaximo)) {
    errores.push("El puntaje máximo por valor de oferta debe ser un número mayor que cero.");
  }

  return {
    valido: errores.length === 0,
    errores
  };
}

// ===============================
// VALIDAR TRM
// ===============================
export function validarTRM() {
  const errores = [];

  if (!esNumeroValido(DB.proceso.trm)) {
    errores.push("Debe registrar una TRM válida mayor que cero.");
  }

  return {
    valido: errores.length === 0,
    errores
  };
}

// ===============================
// VALIDAR UNA OFERTA
// ===============================
export function validarOferta(empresa, oferta) {
  const errores = [];

  if (esVacio(empresa)) {
    errores.push("Debe registrar el nombre del proponente.");
  }

  if (!esNumeroValido(oferta)) {
    errores.push("El valor de la oferta debe ser un número mayor que cero.");
  }

  return {
    valido: errores.length === 0,
    errores
  };
}

// ===============================
// VALIDAR TODAS LAS OFERTAS
// ===============================
export function validarOfertas() {
  const errores = [];
  const ofertas = obtenerOfertas();

  if (!ofertas.length) {
    errores.push("Debe registrar al menos una oferta.");
  }

  ofertas.forEach((oferta, index) => {
    if (esVacio(oferta.empresa)) {
      errores.push(`La oferta ${index + 1} no tiene nombre de proponente.`);
    }

    if (!esNumeroValido(oferta.oferta)) {
      errores.push(`La oferta ${index + 1} no tiene un valor válido mayor que cero.`);
    }
  });

  return {
    valido: errores.length === 0,
    errores
  };
}

// ===============================
// VALIDAR QUE NO HAYA DUPLICADOS
// POR NOMBRE DE PROPONENTE
// ===============================
export function validarProponentesDuplicados() {
  const errores = [];
  const ofertas = obtenerOfertas();
  const nombres = {};

  ofertas.forEach((oferta, index) => {
    const nombre = limpiarTexto(oferta.empresa).toUpperCase();
    if (!nombre) return;

    if (nombres[nombre]) {
      errores.push(`El proponente "${oferta.empresa}" está repetido en la fila ${index + 1}.`);
    } else {
      nombres[nombre] = true;
    }
  });

  return {
    valido: errores.length === 0,
    errores
  };
}

// ===============================
// VALIDAR EVALUACIÓN OAB
// ===============================
export function validarEvaluacionOAB() {
  const errores = [];

  const validacionProceso = validarProceso();
  const validacionOfertas = validarOfertas();

  errores.push(...validacionProceso.errores);
  errores.push(...validacionOfertas.errores);

  return {
    valido: errores.length === 0,
    errores
  };
}

// ===============================
// VALIDAR DECISIONES DEL COMITÉ
// ===============================
export function validarDecisionesComite() {
  const errores = [];
  const ofertas = obtenerOfertas();

  if (!ofertas.length) {
    errores.push("No existen ofertas registradas.");
  }

  ofertas.forEach((oferta, index) => {
    if (oferta.clasificacionInicial === "POSIBLE OAB - REQUERIR SUSTENTACIÓN") {
      if (esVacio(oferta.respondio)) {
        errores.push(`La oferta ${index + 1} (${oferta.empresa}) requiere indicar si respondió la sustentación.`);
      }

      if (oferta.respondio === "SI" && esVacio(oferta.sustentoValido)) {
        errores.push(`La oferta ${index + 1} (${oferta.empresa}) requiere indicar si el sustento es válido.`);
      }

      if (oferta.estado === "RECHAZADA" && esVacio(oferta.causalRechazo)) {
        errores.push(`La oferta ${index + 1} (${oferta.empresa}) está rechazada y debe registrar causal de rechazo.`);
      }
    }
  });

  return {
    valido: errores.length === 0,
    errores
  };
}

// ===============================
// VALIDAR EVALUACIÓN ECONÓMICA
// ===============================
export function validarEvaluacionEconomica() {
  const errores = [];

  const validacionProceso = validarProceso();
  const validacionTRM = validarTRM();
  const aceptadas = obtenerOfertasAceptadas();

  errores.push(...validacionProceso.errores);
  errores.push(...validacionTRM.errores);

  if (!aceptadas.length) {
    errores.push("Debe existir al menos una oferta aceptada para aplicar la evaluación económica.");
  }

  aceptadas.forEach((oferta, index) => {
    if (!esNumeroValido(oferta.oferta)) {
      errores.push(`La oferta aceptada ${index + 1} (${oferta.empresa}) tiene un valor inválido.`);
    }
  });

  return {
    valido: errores.length === 0,
    errores
  };
}

// ===============================
// VALIDACIÓN GENERAL DE LA APP
// ===============================
export function validarTodo() {
  const errores = [];

  const vp = validarProceso();
  const vo = validarOfertas();
  const vd = validarProponentesDuplicados();

  errores.push(...vp.errores);
  errores.push(...vo.errores);
  errores.push(...vd.errores);

  return {
    valido: errores.length === 0,
    errores
  };
}

// ===============================
// OBTENER ERRORES COMO TEXTO
// ===============================
export function erroresComoTexto(validacion) {
  if (!validacion || !Array.isArray(validacion.errores) || !validacion.errores.length) {
    return "";
  }

  return validacion.errores.map((e, i) => `${i + 1}. ${e}`).join("\n");
}

// ===============================
// MOSTRAR ALERTA SIMPLE
// ===============================
export function alertarErrores(validacion, titulo = "Se encontraron errores") {
  if (!validacion || validacion.valido) return true;

  const mensaje = `${titulo}:\n\n${erroresComoTexto(validacion)}`;
  alert(mensaje);
  return false;
}
