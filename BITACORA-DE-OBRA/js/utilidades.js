'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/utilidades.js
   Propósito: funciones reutilizables de apoyo para toda la app
   ========================================================= */

(() => {
  const MESES = Object.freeze([
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
  ]);

  function generarId(prefijo = 'id') {
    if (window.crypto?.randomUUID) {
      return `${prefijo}-${window.crypto.randomUUID()}`;
    }

    return `${prefijo}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function ahoraISO() {
    return new Date().toISOString();
  }

  function hoyISO() {
    const fecha = new Date();
    const diferenciaZona = fecha.getTimezoneOffset() * 60000;

    return new Date(fecha.getTime() - diferenciaZona)
      .toISOString()
      .slice(0, 10);
  }

  function horaActual() {
    const fecha = new Date();

    return [
      String(fecha.getHours()).padStart(2, '0'),
      String(fecha.getMinutes()).padStart(2, '0')
    ].join(':');
  }

  function esFechaValida(valor) {
    if (!valor) return false;

    const fecha = new Date(
      String(valor).includes('T')
        ? String(valor)
        : `${valor}T00:00:00`
    );

    return !Number.isNaN(fecha.getTime());
  }

  function formatearFecha(valor, opciones = {}) {
    if (!esFechaValida(valor)) return opciones.valorVacio || '';

    const fecha = new Date(
      String(valor).includes('T')
        ? String(valor)
        : `${valor}T00:00:00`
    );

    return new Intl.DateTimeFormat(
      opciones.locale || 'es-CO',
      opciones.formato || {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    ).format(fecha);
  }

  function formatearFechaLarga(valor) {
    if (!esFechaValida(valor)) return '';

    const fecha = new Date(
      String(valor).includes('T')
        ? String(valor)
        : `${valor}T00:00:00`
    );

    return `${fecha.getDate()} de ${MESES[fecha.getMonth()]} de ${fecha.getFullYear()}`;
  }

  function formatearFechaHora(valor) {
    if (!esFechaValida(valor)) return '';

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(valor));
  }

  function diferenciaDias(fechaInicial, fechaFinal) {
    if (!esFechaValida(fechaInicial) || !esFechaValida(fechaFinal)) {
      return 0;
    }

    const inicio = new Date(`${fechaInicial}T00:00:00`);
    const fin = new Date(`${fechaFinal}T00:00:00`);

    return Math.round((fin - inicio) / 86400000);
  }

  function normalizarTexto(valor) {
    return String(valor ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  function limpiarEspacios(valor) {
    return String(valor ?? '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function capitalizar(valor) {
    const texto = limpiarEspacios(valor);
    if (!texto) return '';

    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  function titulo(valor) {
    return limpiarEspacios(valor)
      .toLowerCase()
      .replace(/\b\p{L}/gu, (letra) => letra.toUpperCase());
  }

  function truncar(valor, longitud = 100, sufijo = '…') {
    const texto = String(valor ?? '');

    if (texto.length <= longitud) return texto;

    return `${texto.slice(0, Math.max(0, longitud - sufijo.length)).trim()}${sufijo}`;
  }

  function escaparHTML(valor) {
    return String(valor ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function eliminarHTML(valor) {
    const contenedor = document.createElement('div');
    contenedor.innerHTML = String(valor ?? '');

    return limpiarEspacios(
      contenedor.textContent || contenedor.innerText || ''
    );
  }

  function convertirSaltosHTML(valor) {
    return escaparHTML(valor).replace(/\r?\n/g, '<br>');
  }

  function slug(valor) {
    return normalizarTexto(valor)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function numero(valor, valorPredeterminado = 0) {
    if (typeof valor === 'number') {
      return Number.isFinite(valor) ? valor : valorPredeterminado;
    }

    const texto = String(valor ?? '')
      .trim()
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    const resultado = Number.parseFloat(texto);

    return Number.isFinite(resultado)
      ? resultado
      : valorPredeterminado;
  }

  function entero(valor, valorPredeterminado = 0) {
    const resultado = Number.parseInt(valor, 10);

    return Number.isFinite(resultado)
      ? resultado
      : valorPredeterminado;
  }

  function redondear(valor, decimales = 2) {
    const factor = 10 ** decimales;
    return Math.round((numero(valor) + Number.EPSILON) * factor) / factor;
  }

  function formatearNumero(valor, decimales = 0) {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    }).format(numero(valor));
  }

  function formatearMoneda(valor, moneda = 'COP', decimales = 0) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    }).format(numero(valor));
  }

  function limitar(valor, minimo, maximo) {
    return Math.min(Math.max(numero(valor), minimo), maximo);
  }

  function clonar(valor) {
    if (typeof structuredClone === 'function') {
      return structuredClone(valor);
    }

    return JSON.parse(JSON.stringify(valor));
  }

  function esObjetoPlano(valor) {
    return (
      valor !== null &&
      typeof valor === 'object' &&
      !Array.isArray(valor)
    );
  }

  function fusionarProfundo(destino, fuente) {
    const resultado = clonar(destino);

    Object.entries(fuente || {}).forEach(([clave, valor]) => {
      if (
        esObjetoPlano(valor) &&
        esObjetoPlano(resultado[clave])
      ) {
        resultado[clave] = fusionarProfundo(
          resultado[clave],
          valor
        );
      } else {
        resultado[clave] = clonar(valor);
      }
    });

    return resultado;
  }

  function obtenerRuta(objeto, ruta, valorPredeterminado = undefined) {
    if (!ruta) return objeto;

    const partes = Array.isArray(ruta)
      ? ruta
      : String(ruta).split('.').filter(Boolean);

    const resultado = partes.reduce(
      (acumulado, parte) =>
        acumulado !== undefined && acumulado !== null
          ? acumulado[parte]
          : undefined,
      objeto
    );

    return resultado === undefined
      ? valorPredeterminado
      : resultado;
  }

  function establecerRuta(objeto, ruta, valor) {
    const partes = Array.isArray(ruta)
      ? ruta
      : String(ruta).split('.').filter(Boolean);

    if (!partes.length) {
      throw new Error('La ruta no puede estar vacía.');
    }

    let referencia = objeto;

    for (let i = 0; i < partes.length - 1; i += 1) {
      const parte = partes[i];

      if (
        referencia[parte] === null ||
        typeof referencia[parte] !== 'object'
      ) {
        referencia[parte] = {};
      }

      referencia = referencia[parte];
    }

    referencia[partes.at(-1)] = valor;
    return objeto;
  }

  function ordenarPor(lista, campo, direccion = 'asc') {
    const factor = direccion === 'desc' ? -1 : 1;

    return [...lista].sort((a, b) => {
      const valorA = obtenerRuta(a, campo, '');
      const valorB = obtenerRuta(b, campo, '');

      if (
        typeof valorA === 'number' &&
        typeof valorB === 'number'
      ) {
        return (valorA - valorB) * factor;
      }

      return String(valorA).localeCompare(
        String(valorB),
        'es',
        {
          sensitivity: 'base',
          numeric: true
        }
      ) * factor;
    });
  }

  function agruparPor(lista, campo) {
    return lista.reduce((grupos, elemento) => {
      const clave = obtenerRuta(elemento, campo, 'Sin clasificar');

      if (!grupos[clave]) grupos[clave] = [];
      grupos[clave].push(elemento);

      return grupos;
    }, {});
  }

  function unicoPor(lista, campo) {
    const vistos = new Set();

    return lista.filter((elemento) => {
      const valor = obtenerRuta(elemento, campo);

      if (vistos.has(valor)) return false;

      vistos.add(valor);
      return true;
    });
  }

  function esperar(ms) {
    return new Promise((resolver) => {
      setTimeout(resolver, ms);
    });
  }

  function debounce(funcion, espera = 300) {
    let temporizador;

    return function funcionDebounce(...argumentos) {
      clearTimeout(temporizador);

      temporizador = setTimeout(() => {
        funcion.apply(this, argumentos);
      }, espera);
    };
  }

  function throttle(funcion, espera = 300) {
    let ejecutando = false;
    let argumentosPendientes = null;

    return function funcionThrottle(...argumentos) {
      if (ejecutando) {
        argumentosPendientes = argumentos;
        return;
      }

      funcion.apply(this, argumentos);
      ejecutando = true;

      setTimeout(() => {
        ejecutando = false;

        if (argumentosPendientes) {
          const pendientes = argumentosPendientes;
          argumentosPendientes = null;
          funcion.apply(this, pendientes);
        }
      }, espera);
    };
  }

  function descargarArchivo(
    nombre,
    contenido,
    tipo = 'text/plain;charset=utf-8'
  ) {
    const blob = contenido instanceof Blob
      ? contenido
      : new Blob([contenido], { type: tipo });

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download = nombre;
    enlace.style.display = 'none';

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function leerArchivoComoTexto(archivo, codificacion = 'UTF-8') {
    return new Promise((resolver, rechazar) => {
      const lector = new FileReader();

      lector.onload = () => resolver(String(lector.result ?? ''));
      lector.onerror = () => rechazar(
        lector.error || new Error('No fue posible leer el archivo.')
      );

      lector.readAsText(archivo, codificacion);
    });
  }

  function leerArchivoComoDataURL(archivo) {
    return new Promise((resolver, rechazar) => {
      const lector = new FileReader();

      lector.onload = () => resolver(String(lector.result ?? ''));
      lector.onerror = () => rechazar(
        lector.error || new Error('No fue posible leer el archivo.')
      );

      lector.readAsDataURL(archivo);
    });
  }

  function bytesLegibles(bytes) {
    const cantidad = numero(bytes);

    if (cantidad === 0) return '0 B';

    const unidades = ['B', 'KB', 'MB', 'GB', 'TB'];
    const indice = Math.floor(
      Math.log(cantidad) / Math.log(1024)
    );

    return `${redondear(
      cantidad / (1024 ** indice),
      2
    )} ${unidades[indice]}`;
  }

  function validarExtension(archivo, extensiones = []) {
    const nombre = String(archivo?.name || '').toLowerCase();

    return extensiones.some((extension) =>
      nombre.endsWith(
        extension.startsWith('.')
          ? extension.toLowerCase()
          : `.${extension.toLowerCase()}`
      )
    );
  }

  function obtenerExtension(nombreArchivo) {
    const partes = String(nombreArchivo || '').split('.');

    return partes.length > 1
      ? partes.pop().toLowerCase()
      : '';
  }

  function nombreArchivoSeguro(valor, valorPredeterminado = 'archivo') {
    const nombre = limpiarEspacios(valor || valorPredeterminado)
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
      .replace(/\.+$/g, '')
      .replace(/\s+/g, '_');

    return nombre || valorPredeterminado;
  }

  function generarNombreArchivo(prefijo, extension) {
    const fecha = new Date();
    const parte = (valor) => String(valor).padStart(2, '0');

    return [
      nombreArchivoSeguro(prefijo),
      `${fecha.getFullYear()}-${parte(fecha.getMonth() + 1)}-${parte(fecha.getDate())}`,
      `${parte(fecha.getHours())}-${parte(fecha.getMinutes())}-${parte(fecha.getSeconds())}`
    ].join('_') + `.${String(extension).replace(/^\./, '')}`;
  }

  function copiarAlPortapapeles(texto) {
    const valor = String(texto ?? '');

    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(valor);
    }

    const area = document.createElement('textarea');
    area.value = valor;
    area.style.position = 'fixed';
    area.style.opacity = '0';

    document.body.appendChild(area);
    area.select();

    const resultado = document.execCommand('copy');
    area.remove();

    return resultado
      ? Promise.resolve()
      : Promise.reject(new Error('No fue posible copiar el texto.'));
  }

  function crearEvento(nombre, detalle = {}) {
    return new CustomEvent(nombre, {
      detail: clonar(detalle)
    });
  }

  function emitir(nombre, detalle = {}) {
    document.dispatchEvent(crearEvento(nombre, detalle));
  }

  function seleccionar(selector, raiz = document) {
    return raiz.querySelector(selector);
  }

  function seleccionarTodos(selector, raiz = document) {
    return Array.from(raiz.querySelectorAll(selector));
  }

  function mostrar(elemento) {
    const objetivo = typeof elemento === 'string'
      ? seleccionar(elemento)
      : elemento;

    if (!objetivo) return;

    objetivo.hidden = false;
    objetivo.classList.remove('oculto');
  }

  function ocultar(elemento) {
    const objetivo = typeof elemento === 'string'
      ? seleccionar(elemento)
      : elemento;

    if (!objetivo) return;

    objetivo.hidden = true;
    objetivo.classList.add('oculto');
  }

  function alternar(elemento, visible) {
    if (visible) {
      mostrar(elemento);
    } else {
      ocultar(elemento);
    }
  }

  function enfocar(elemento, opciones = {}) {
    const objetivo = typeof elemento === 'string'
      ? seleccionar(elemento)
      : elemento;

    if (!objetivo) return;

    objetivo.focus({
      preventScroll: Boolean(opciones.preventScroll)
    });

    if (opciones.seleccionar && 'select' in objetivo) {
      objetivo.select();
    }
  }

  function desplazarA(elemento, opciones = {}) {
    const objetivo = typeof elemento === 'string'
      ? seleccionar(elemento)
      : elemento;

    objetivo?.scrollIntoView({
      behavior: opciones.comportamiento || 'smooth',
      block: opciones.bloque || 'start'
    });
  }

  function obtenerCoordenadas() {
    return new Promise((resolver, rechazar) => {
      if (!navigator.geolocation) {
        rechazar(
          new Error('La geolocalización no está disponible.')
        );
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (posicion) => {
          resolver({
            latitud: posicion.coords.latitude,
            longitud: posicion.coords.longitude,
            precision: posicion.coords.accuracy,
            fecha: ahoraISO()
          });
        },
        (error) => rechazar(error),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000
        }
      );
    });
  }

  function esCorreoValido(valor) {
    const texto = limpiarEspacios(valor);

    if (!texto) return true;

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto);
  }

  function esTelefonoValido(valor) {
    const texto = limpiarEspacios(valor);

    if (!texto) return true;

    return /^[+\d][\d\s()-]{6,20}$/.test(texto);
  }

  function esNITValido(valor) {
    const texto = String(valor ?? '').replace(/[^\d]/g, '');

    return texto.length >= 8 && texto.length <= 10;
  }

  function asegurarArreglo(valor) {
    if (Array.isArray(valor)) return valor;
    if (valor === null || valor === undefined || valor === '') return [];

    return [valor];
  }

  function limpiarObjeto(objeto) {
    if (Array.isArray(objeto)) {
      return objeto
        .map(limpiarObjeto)
        .filter((valor) => valor !== undefined);
    }

    if (esObjetoPlano(objeto)) {
      return Object.fromEntries(
        Object.entries(objeto)
          .map(([clave, valor]) => [clave, limpiarObjeto(valor)])
          .filter(([, valor]) => valor !== undefined)
      );
    }

    if (
      objeto === '' ||
      objeto === null ||
      objeto === undefined
    ) {
      return undefined;
    }

    return objeto;
  }

  window.BitacoraUtilidades = Object.freeze({
    MESES,
    generarId,
    ahoraISO,
    hoyISO,
    horaActual,
    esFechaValida,
    formatearFecha,
    formatearFechaLarga,
    formatearFechaHora,
    diferenciaDias,
    normalizarTexto,
    limpiarEspacios,
    capitalizar,
    titulo,
    truncar,
    escaparHTML,
    eliminarHTML,
    convertirSaltosHTML,
    slug,
    numero,
    entero,
    redondear,
    formatearNumero,
    formatearMoneda,
    limitar,
    clonar,
    esObjetoPlano,
    fusionarProfundo,
    obtenerRuta,
    establecerRuta,
    ordenarPor,
    agruparPor,
    unicoPor,
    esperar,
    debounce,
    throttle,
    descargarArchivo,
    leerArchivoComoTexto,
    leerArchivoComoDataURL,
    bytesLegibles,
    validarExtension,
    obtenerExtension,
    nombreArchivoSeguro,
    generarNombreArchivo,
    copiarAlPortapapeles,
    crearEvento,
    emitir,
    seleccionar,
    seleccionarTodos,
    mostrar,
    ocultar,
    alternar,
    enfocar,
    desplazarA,
    obtenerCoordenadas,
    esCorreoValido,
    esTelefonoValido,
    esNITValido,
    asegurarArreglo,
    limpiarObjeto
  });

  document.dispatchEvent(
    new CustomEvent('bitacora:utilidades-listas')
  );

  console.info('Utilidades de la Bitácora de Obra inicializadas.');
})();