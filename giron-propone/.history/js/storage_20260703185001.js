/* =========================================================
   GIRÓN PROPONE
   Archivo: js/storage.js
   Descripción: Administración del almacenamiento local.
========================================================= */

"use strict";

const Storage = {

    disponible() {
        try {
            const k = "__gp_test__";
            localStorage.setItem(k, "1");
            localStorage.removeItem(k);
            return true;
        } catch {
            return false;
        }
    },

    guardar(clave, valor) {
        if (!this.disponible()) return false;
        localStorage.setItem(clave, JSON.stringify(valor));
        return true;
    },

    leer(clave, defecto = null) {
        if (!this.disponible()) return defecto;

        const dato = localStorage.getItem(clave);

        if (dato === null) return defecto;

        try {
            return JSON.parse(dato);
        } catch {
            return defecto;
        }
    },

    eliminar(clave) {
        if (!this.disponible()) return;
        localStorage.removeItem(clave);
    },

    limpiar() {
        if (!this.disponible()) return;
        localStorage.clear();
    },

    existe(clave) {
        return this.leer(clave) !== null;
    }

};

/* =========================================================
   PREFERENCIAS
========================================================= */

function guardarPreferencias(preferencias) {
    return Storage.guardar(APP_CONFIG.storage.preferencias, preferencias);
}

function obtenerPreferencias() {
    return Storage.leer(APP_CONFIG.storage.preferencias, {
        modoOscuro: false,
        animaciones: true,
        municipio: APP_CONFIG.municipio.nombre
    });
}

/* =========================================================
   CANDIDATO
========================================================= */

function guardarCandidato(datos) {
    return Storage.guardar(APP_CONFIG.storage.candidato, datos);
}

function obtenerCandidato() {
    return Storage.leer(APP_CONFIG.storage.candidato, APP_CONFIG.candidato);
}

/* =========================================================
   SECTOR ACTIVO
========================================================= */

function guardarSectorActivo(sector) {
    return Storage.guardar(APP_CONFIG.storage.sectorActivo, sector);
}

function obtenerSectorActivo() {
    return Storage.leer(APP_CONFIG.storage.sectorActivo, "infraestructura-educativa");
}

/* =========================================================
   HISTORIAL
========================================================= */

function agregarHistorial(item) {

    const historial = Storage.leer(APP_CONFIG.storage.historial, []);

    historial.unshift({
        ...item,
        fecha: fechaActual(),
        hora: horaActual()
    });

    Storage.guardar(APP_CONFIG.storage.historial, historial.slice(0,100));
}

function obtenerHistorial() {
    return Storage.leer(APP_CONFIG.storage.historial, []);
}

/* =========================================================
   EXPORTACIÓN GLOBAL
========================================================= */

window.Storage = Storage;
window.guardarPreferencias = guardarPreferencias;
window.obtenerPreferencias = obtenerPreferencias;
window.guardarCandidato = guardarCandidato;
window.obtenerCandidato = obtenerCandidato;
window.guardarSectorActivo = guardarSectorActivo;
window.obtenerSectorActivo = obtenerSectorActivo;
window.agregarHistorial = agregarHistorial;
window.obtenerHistorial = obtenerHistorial;
