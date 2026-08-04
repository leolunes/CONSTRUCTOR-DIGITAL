/* =========================================================
   GIRÓN PROPONE
   Archivo: js/menu.js
   Descripción: Control del menú lateral y navegación visual.
========================================================= */

"use strict";

const Menu = {

    sidebar: null,
    botonMenu: null,
    items: [],

    iniciar() {

        this.sidebar = document.getElementById("sidebar");
        this.botonMenu = document.getElementById("btnMenu");
        this.items = [...document.querySelectorAll(".nav-item")];

        this.configurarEventos();

    },

    configurarEventos() {

        if (this.botonMenu) {

            this.botonMenu.addEventListener("click", () => {

                document.body.classList.toggle("menu-open");

            });

        }

        this.items.forEach(item => {

            item.addEventListener("click", () => {

                this.activar(item);

                const vista = item.dataset.view || "";

                if (window.Router && typeof Router.ir === "function") {
                    Router.ir(vista);
                }

                if (window.innerWidth <= 920) {
                    document.body.classList.remove("menu-open");
                }

            });

        });

        window.addEventListener("resize", () => {

            if (window.innerWidth > 920) {
                document.body.classList.remove("menu-open");
            }

        });

    },

    activar(itemActivo) {

        this.items.forEach(item => item.classList.remove("active"));

        itemActivo.classList.add("active");

    },

    activarPorVista(vista) {

        const encontrado = this.items.find(i => i.dataset.view === vista);

        if (encontrado) {
            this.activar(encontrado);
        }

    }

};

/* =========================================================
   ACCESOS DIRECTOS
========================================================= */

function abrirMenu() {

    document.body.classList.add("menu-open");

}

function cerrarMenu() {

    document.body.classList.remove("menu-open");

}

function alternarMenu() {

    document.body.classList.toggle("menu-open");

}

/* =========================================================
   EXPORTACIÓN
========================================================= */

window.Menu = Menu;
window.abrirMenu = abrirMenu;
window.cerrarMenu = cerrarMenu;
window.alternarMenu = alternarMenu;

/* =========================================================
   INICIALIZACIÓN
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    Menu.iniciar();

});
