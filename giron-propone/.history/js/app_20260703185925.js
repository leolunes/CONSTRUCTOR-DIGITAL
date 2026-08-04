/* =========================================================
   GIRÓN PROPONE
   Archivo: js/app.js
   Descripción: Inicializador principal de la aplicación.
========================================================= */

"use strict";

const App = {

    version: APP_CONFIG.version,
    iniciada: false,

    async iniciar() {

        if (this.iniciada) return;

        console.log("======================================");
        console.log(APP_CONFIG.nombre);
        console.log("Versión:", this.version);
        console.log("Municipio:", APP_CONFIG.municipio.nombre);
        console.log("======================================");

        this.configurarEventos();

        if (window.Menu) {
            Menu.iniciar();
        }

        if (window.Router) {
            Router.iniciar();
        }

        if (window.Dashboard) {
            await Dashboard.iniciar();
        }

        this.cargarPreferencias();

        this.iniciada = true;

        console.log("Aplicación iniciada correctamente.");

    },

    configurarEventos() {

        window.addEventListener("online", () => {
            mostrarMensaje("Conexión restablecida.", "success");
        });

        window.addEventListener("offline", () => {
            mostrarMensaje("La aplicación está funcionando sin conexión.", "warning");
        });

        window.addEventListener("beforeunload", () => {

            agregarHistorial({
                tipo: "salida",
                valor: "Cierre de aplicación"
            });

        });

    },

    cargarPreferencias() {

        const preferencias = obtenerPreferencias();

        if (preferencias.modoOscuro) {
            document.body.classList.add("dark-mode");
        }

        if (!preferencias.animaciones) {
            document.body.classList.add("reduce-motion");
        }

    },

    obtenerInformacion() {

        return {
            nombre: APP_CONFIG.nombre,
            version: APP_CONFIG.version,
            municipio: APP_CONFIG.municipio.nombre,
            departamento: APP_CONFIG.municipio.departamento,
            fecha: fechaActual(),
            hora: horaActual()
        };

    }

};

window.App = App;

document.addEventListener("DOMContentLoaded", async () => {

    await App.iniciar();

});
