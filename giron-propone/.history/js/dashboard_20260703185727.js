/* =========================================================
   GIRÓN PROPONE
   Archivo: js/dashboard.js
   Descripción: Lógica del dashboard principal.
========================================================= */

"use strict";

const Dashboard = {

    datos: {
        sectores: [],
        municipio: null
    },

    async iniciar() {

        await this.cargarDatos();

        this.actualizarCandidato();

        this.actualizarIndicadores();

        this.configurarAccionesRapidas();

        this.configurarTarjetas();

    },

    async cargarDatos() {

        const sectores = await cargarJSON(APP_CONFIG.archivos.sectores);
        const municipios = await cargarJSON(APP_CONFIG.archivos.municipios);

        this.datos.sectores = sectores || [];
        this.datos.municipio = municipios || null;

    },

    actualizarCandidato() {

        const candidato = obtenerCandidato();

        const nombre = document.getElementById("nombreCandidato");

        if (nombre) {
            nombre.textContent = candidato.nombre || APP_CONFIG.candidato.nombre;
        }

    },

    actualizarIndicadores() {

        const cards = document.querySelectorAll(".stat-card h3");

        if (cards.length >= 4) {

            cards[0].textContent = "12";
            cards[1].textContent = "72";
            cards[2].textContent = "36";
            cards[3].textContent = "PDF";

        }

    },

    configurarAccionesRapidas() {

        document.querySelectorAll("[data-view]").forEach(btn => {

            btn.addEventListener("click", e => {

                const vista = e.currentTarget.dataset.view;

                if (vista && window.Router) {

                    Router.ir(vista);

                }

            });

        });

    },

    configurarTarjetas() {

        document.querySelectorAll(".sector-card").forEach(card => {

            card.addEventListener("click", () => {

                const sector = card.dataset.sector;

                guardarSectorActivo(sector);

                agregarHistorial({
                    tipo: "sector",
                    valor: sector
                });

                if (window.Router) {
                    Router.ir("sectores");
                }

            });

        });

    }

};

window.Dashboard = Dashboard;

document.addEventListener("DOMContentLoaded", () => {

    Dashboard.iniciar();

});
