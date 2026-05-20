// ===============================
// FUNCIONES DE CÁLCULO GENERAL
// Archivo: js/calc.js
// ===============================

// ===============================
// CONVERTIR A NÚMERO
// ===============================
export function aNumero(valor) {
  if (valor === null || valor === undefined || valor === "") return 0;
  return Number(valor) || 0;
}

// ===============================
// REDONDEAR
// ===============================
export function redondear(numero, decimales = 7) {
  return Number(aNumero(numero).toFixed(decimales));
}

// ===============================
// SUMA
// ===============================
export function suma(valores = []) {
  return valores.reduce((acc, v) => acc + aNumero(v), 0);
}

// ===============================
// PROMEDIO / MEDIA ARITMÉTICA
// ===============================
export function promedio(valores = []) {
  if (!valores.length) return 0;
  return suma(valores) / valores.length;
}

// ===============================
// MEDIANA
// ===============================
export function mediana(valores = []) {
  const datos = valores.map(aNumero).filter(v => v > 0).sort((a, b) => a - b);
  const n = datos.length;
  if (!n) return 0;

  const mitad = Math.floor(n / 2);

  if (n % 2 !== 0) {
    return datos[mitad];
  }

  return (datos[mitad - 1] + datos[mitad]) / 2;
}

// ===============================
// VALOR INMEDIATAMENTE INFERIOR A LA MEDIANA
// (Para mediana con número par de ofertas)
// ===============================
export function valorMedianaInferior(valores = []) {
  const datos = valores.map(aNumero).filter(v => v > 0).sort((a, b) => a - b);
  const n = datos.length;
  if (!n) return 0;

  if (n % 2 !== 0) {
    return datos[Math.floor(n / 2)];
  }

  return datos[n / 2 - 1];
}

// ===============================
// DESVIACIÓN ESTÁNDAR POBLACIONAL
// ===============================
export function desviacionEstandarPoblacional(valores = []) {
  const datos = valores.map(aNumero).filter(v => v > 0);
  const n = datos.length;
  if (!n) return 0;

  const prom = promedio(datos);
  const varianza = datos.reduce((acc, v) => acc + Math.pow(v - prom, 2), 0) / n;

  return Math.sqrt(varianza);
}

// ===============================
// MEDIA GEOMÉTRICA
// ===============================
export function mediaGeometrica(valores = []) {
  const datos = valores.map(aNumero).filter(v => v > 0);
  const n = datos.length;
  if (!n) return 0;

  const sumaLogs = datos.reduce((acc, v) => acc + Math.log(v), 0);
  return Math.exp(sumaLogs / n);
}

// ===============================
// MENOR VALOR
// ===============================
export function menorValor(valores = []) {
  const datos = valores.map(aNumero).filter(v => v > 0);
  if (!datos.length) return 0;
  return Math.min(...datos);
}

// ===============================
// MAYOR VALOR
// ===============================
export function mayorValor(valores = []) {
  const datos = valores.map(aNumero).filter(v => v > 0);
  if (!datos.length) return 0;
  return Math.max(...datos);
}

// ===============================
// MEDIA ARITMÉTICA BAJA
// Fórmula: (menor valor + promedio) / 2
// ===============================
export function mediaAritmeticaBaja(valores = []) {
  const datos = valores.map(aNumero).filter(v => v > 0);
  if (!datos.length) return 0;

  const min = menorValor(datos);
  const prom = promedio(datos);

  return (min + prom) / 2;
}

// ===============================
// DIFERENCIA CONTRA PRESUPUESTO OFICIAL
// ===============================
export function diferenciaContraPresupuesto(oferta, presupuesto) {
  return aNumero(oferta) - aNumero(presupuesto);
}

// ===============================
// VARIACIÓN CONTRA PRESUPUESTO OFICIAL
// ===============================
export function variacionContraPresupuesto(oferta, presupuesto) {
  const p = aNumero(presupuesto);
  if (p <= 0) return 0;

  return (aNumero(oferta) - p) / p;
}

// ===============================
// LÍMITE ABSOLUTO
// Fórmula: presupuesto * (1 - umbral)
// ===============================
export function limiteAbsoluto(presupuesto, umbral = 0.2) {
  return aNumero(presupuesto) * (1 - aNumero(umbral));
}

// ===============================
// MÍNIMO ACEPTABLE
// Fórmula usada en la app:
// mediana - desviación estándar poblacional
// ===============================
export function minimoAceptable(valores = []) {
  const med = mediana(valores);
  const desv = desviacionEstandarPoblacional(valores);
  return med - desv;
}

// ===============================
// EXTRAER DECIMAL DE LA TRM
// Ejemplo: 4105.23 -> 0.23
// ===============================
export function decimalTRM(trm) {
  const valor = aNumero(trm);
  return redondear(valor - Math.trunc(valor), 2);
}

// ===============================
// OBTENER MÉTODO POR TRM
// ===============================
export function metodoPorTRM(trm) {
  const decimal = decimalTRM(trm);

  if (decimal >= 0.00 && decimal <= 0.24) return "MEDIANA";
  if (decimal >= 0.25 && decimal <= 0.49) return "GEOMETRICA";
  if (decimal >= 0.50 && decimal <= 0.74) return "ARITMETICA_BAJA";
  return "MENOR_VALOR";
}

// ===============================
// PUNTAJE GENÉRICO POR PROXIMIDAD
// Fórmula:
// puntajeMaximo * (1 - |(base - oferta) / base|)
// ===============================
export function puntajePorProximidad(oferta, base, puntajeMaximo) {
  const vi = aNumero(oferta);
  const b = aNumero(base);
  const max = aNumero(puntajeMaximo);

  if (vi <= 0 || b <= 0 || max <= 0) return 0;

  const puntaje = max * (1 - Math.abs((b - vi) / b));
  return Math.max(0, redondear(puntaje, 7));
}

// ===============================
// PUNTAJE POR MENOR VALOR
// Fórmula:
// puntajeMaximo * (menorValor / oferta)
// ===============================
export function puntajeMenorValor(oferta, menor, puntajeMaximo) {
  const vi = aNumero(oferta);
  const min = aNumero(menor);
  const max = aNumero(puntajeMaximo);

  if (vi <= 0 || min <= 0 || max <= 0) return 0;

  const puntaje = max * (min / vi);
  return Math.max(0, redondear(puntaje, 7));
}

// ===============================
// ORDENAR ASCENDENTE
// ===============================
export function ordenarAsc(valores = []) {
  return [...valores].map(aNumero).sort((a, b) => a - b);
}

// ===============================
// ORDENAR DESCENDENTE
// ===============================
export function ordenarDesc(valores = []) {
  return [...valores].map(aNumero).sort((a, b) => b - a);
}

// ===============================
// GENERAR RANKING
// Recibe array de objetos con campo puntaje
// ===============================
export function generarRanking(items = [], campoPuntaje = "puntaje") {
  const ordenados = [...items].sort((a, b) => aNumero(b[campoPuntaje]) - aNumero(a[campoPuntaje]));

  return ordenados.map((item, index) => ({
    ...item,
    ranking: index + 1
  }));
}

// ===============================
// FORMATEO SIMPLE DE PORCENTAJE
// ===============================
export function porcentajeTexto(valor, decimales = 2) {
  return `${(aNumero(valor) * 100).toFixed(decimales)}%`;
}
