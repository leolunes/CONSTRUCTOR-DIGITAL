/* =========================================================
   GIRÓN PROPONE
   Archivo: js/utilidades.js
   Descripción: Funciones utilitarias reutilizables.
========================================================= */

"use strict";

/* =========================================================
   SELECTORES
========================================================= */

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

/* =========================================================
   FORMATO
========================================================= */

function formatearNumero(valor, decimales = 0) {
    const numero = Number(valor || 0);
    return numero.toLocaleString("es-CO", {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales
    });
}

function porcentaje(valor, decimales = 1) {
    return `${Number(valor || 0).toFixed(decimales)} %`;
}

function capitalizar(texto = "") {
    return texto
        .toLowerCase()
        .split(" ")
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
}

/* =========================================================
   FECHAS
========================================================= */

function fechaActual() {
    return new Date().toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function horaActual() {
    return new Date().toLocaleTimeString("es-CO");
}

/* =========================================================
   MENSAJES
========================================================= */

function mostrarMensaje(texto, tipo = "info") {
    console.log(`[${tipo.toUpperCase()}] ${texto}`);
}

/* =========================================================
   FETCH JSON
========================================================= */

async function cargarJSON(ruta) {

    try {

        const respuesta = await fetch(ruta);

        if (!respuesta.ok) {
            throw new Error(`No se pudo cargar ${ruta}`);
        }

        return await respuesta.json();

    } catch (error) {

        console.error(error);
        mostrarMensaje(APP_CONFIG.textos.errorDatos, "error");

        return null;

    }

}

/* =========================================================
   CLONACIÓN
========================================================= */

function clonar(objeto) {
    return JSON.parse(JSON.stringify(objeto));
}

/* =========================================================
   ID ÚNICO
========================================================= */

function generarId(prefijo = "id") {

    return `${prefijo}_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;

}

/* =========================================================
   DESCARGAS
========================================================= */

function descargarTexto(nombreArchivo, contenido) {

    const blob = new Blob([contenido], {
        type: "text/plain;charset=utf-8"
    });

    const enlace = document.createElement("a");

    enlace.href = URL.createObjectURL(blob);

    enlace.download = nombreArchivo;

    document.body.appendChild(enlace);

    enlace.click();

    document.body.removeChild(enlace);

}

/* =========================================================
   COPIAR PORTAPAPELES
========================================================= */

async function copiarTexto(texto) {

    try {

        await navigator.clipboard.writeText(texto);

        mostrarMensaje(APP_CONFIG.textos.copiado, "success");

    } catch (error) {

        console.error(error);

    }

}

/* =========================================================
   VISIBILIDAD
========================================================= */

function mostrar(elemento) {

    if (!elemento) return;

    elemento.hidden = false;

}

function ocultar(elemento) {

    if (!elemento) return;

    elemento.hidden = true;

}

/* =========================================================
   SCROLL
========================================================= */

function irArriba() {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

/* =========================================================
   EXPORTACIÓN GLOBAL
========================================================= */

window.$ = $;
window.$$ = $$;
window.formatearNumero = formatearNumero;
window.porcentaje = porcentaje;
window.capitalizar = capitalizar;
window.fechaActual = fechaActual;
window.horaActual = horaActual;
window.mostrarMensaje = mostrarMensaje;
window.cargarJSON = cargarJSON;
window.clonar = clonar;
window.generarId = generarId;
window.descargarTexto = descargarTexto;
window.copiarTexto = copiarTexto;
window.mostrar = mostrar;
window.ocultar = ocultar;
window.irArriba = irArriba;
