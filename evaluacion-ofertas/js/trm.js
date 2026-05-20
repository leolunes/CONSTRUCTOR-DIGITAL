// ===============================
// TRM - DETERMINACIÓN DEL MÉTODO
// Archivo: js/trm.js
// ===============================

import { DB, actualizarResultadosEconomicos } from "./db.js";

// ===============================
// UTILIDADES
// ===============================
function redondear(numero, decimales = 2) {
  return Number(Number(numero || 0).toFixed(decimales));
}

// ===============================
// EXTRAER PARTE DECIMAL DE LA TRM
// Ejemplo: 4105.23 -> 0.23
// ===============================
export function obtenerDecimalTRM(trm) {
  const valor = Number(trm) || 0;
  const decimal = valor - Math.trunc(valor);
  return redondear(decimal, 2);
}

// ===============================
// OBTENER MÉTODO SEGÚN TRM
// Rangos pliego tipo:
// 0.00 - 0.24 -> MEDIANA
// 0.25 - 0.49 -> GEOMETRICA
// 0.50 - 0.74 -> ARITMETICA_BAJA
// 0.75 - 0.99 -> MENOR_VALOR
// ===============================
export function obtenerMetodoPorTRM(trm) {
  const decimal = obtenerDecimalTRM(trm);

  if (decimal >= 0.00 && decimal <= 0.24) {
    return "MEDIANA";
  }

  if (decimal >= 0.25 && decimal <= 0.49) {
    return "GEOMETRICA";
  }

  if (decimal >= 0.50 && decimal <= 0.74) {
    return "ARITMETICA_BAJA";
  }

  return "MENOR_VALOR";
}

// ===============================
// OBTENER NOMBRE DESCRIPTIVO
// ===============================
export function obtenerNombreMetodo(metodo) {
  switch (metodo) {
    case "MEDIANA":
      return "Mediana con valor absoluto";
    case "GEOMETRICA":
      return "Media geométrica";
    case "ARITMETICA_BAJA":
      return "Media aritmética baja";
    case "MENOR_VALOR":
      return "Menor valor";
    default:
      return "Método no definido";
  }
}

// ===============================
// OBTENER RANGO DESCRIPTIVO
// ===============================
export function obtenerRangoMetodo(metodo) {
  switch (metodo) {
    case "MEDIANA":
      return "0.00 a 0.24";
    case "GEOMETRICA":
      return "0.25 a 0.49";
    case "ARITMETICA_BAJA":
      return "0.50 a 0.74";
    case "MENOR_VALOR":
      return "0.75 a 0.99";
    default:
      return "";
  }
}

// ===============================
// VALIDAR TRM
// ===============================
export function validarTRM(trm) {
  const valor = Number(trm);
  return !Number.isNaN(valor) && valor > 0;
}

// ===============================
// APLICAR MÉTODO A LA BASE DE DATOS
// Guarda el método en resultadosEconomicos
// ===============================
export function aplicarMetodoTRM() {
  const trm = Number(DB.proceso.trm) || 0;

  if (!validarTRM(trm)) {
    actualizarResultadosEconomicos({
      metodo: ""
    });

    return {
      trm: 0,
      decimal: 0,
      metodo: "",
      nombreMetodo: "TRM no válida"
    };
  }

  const decimal = obtenerDecimalTRM(trm);
  const metodo = obtenerMetodoPorTRM(trm);
  const nombreMetodo = obtenerNombreMetodo(metodo);
  const rango = obtenerRangoMetodo(metodo);

  actualizarResultadosEconomicos({
    ...DB.resultadosEconomicos,
    metodo
  });

  return {
    trm,
    decimal,
    metodo,
    nombreMetodo,
    rango
  };
}

// ===============================
// OBTENER RESUMEN TRM
// ===============================
export function obtenerResumenTRM() {
  const trm = Number(DB.proceso.trm) || 0;

  if (!validarTRM(trm)) {
    return {
      trm: 0,
      decimal: 0,
      metodo: "",
      nombreMetodo: "TRM no registrada",
      rango: ""
    };
  }

  const decimal = obtenerDecimalTRM(trm);
  const metodo = obtenerMetodoPorTRM(trm);
  const nombreMetodo = obtenerNombreMetodo(metodo);
  const rango = obtenerRangoMetodo(metodo);

  return {
    trm,
    decimal,
    metodo,
    nombreMetodo,
    rango
  };
}

// ===============================
// TEXTO BASE PARA INFORME
// ===============================
export function generarTextoMetodoTRM() {
  const resumen = obtenerResumenTRM();

  if (!resumen.metodo) {
    return "No se ha registrado una TRM válida para determinar el método de ponderación económica.";
  }

  return `De conformidad con los pliegos tipo, el método de ponderación económica se determinó con base en los centavos de la TRM. Para la presente evaluación, la TRM registrada fue ${resumen.trm}, cuyo decimal corresponde a ${resumen.decimal.toFixed(2)}. En consecuencia, el método aplicable es ${resumen.nombreMetodo}, por encontrarse en el rango ${resumen.rango}.`;
}

// ===============================
// FORZAR MÉTODO MANUAL (opcional)
// Sirve si la entidad quiere dejarlo definido sin TRM.
// ===============================
export function fijarMetodoManual(metodo = "") {
  const metodosValidos = [
    "MEDIANA",
    "GEOMETRICA",
    "ARITMETICA_BAJA",
    "MENOR_VALOR"
  ];

  if (!metodosValidos.includes(metodo)) {
    return false;
  }

  actualizarResultadosEconomicos({
    ...DB.resultadosEconomicos,
    metodo
  });

  return true;
}
