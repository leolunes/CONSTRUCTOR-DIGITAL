/* ==========================================================
   APP PLAN GIRÓN 2024 - 2027
   Controlador de navegación interna
   ========================================================== */

const ROUTER = {

    paginas: {
        inicio: "index.html",
        sectores: "sectores.html",
        sectorDetalle: "sectores-detalle.html",
        buscador: "buscador.html",
        propuestas: "propuestas.html",
        controlPolitico: "control-politico.html",
        indicadores: "indicadores.html",
        presupuesto: "presupuesto.html",
        seguimiento: "seguimiento.html",
        comparador: "comparador.html",
        configuracion: "config.html"
    },

    ir(pagina) {
        if (!this.paginas[pagina]) {
            console.warn("Página no registrada:", pagina);
            return;
        }

        window.location.href = this.paginas[pagina];
    },

    irSector(sectorId) {
        if (!sectorId) {
            alert("No se encontró el sector seleccionado.");
            return;
        }

        window.location.href = this.paginas.sectorDetalle + "?id=" + encodeURIComponent(sectorId);
    },

    irBuscador(texto) {
        if (texto && texto.trim() !== "") {
            localStorage.setItem("busquedaPlanGiron", texto.trim());
        }

        window.location.href = this.paginas.buscador;
    },

    parametro(nombre) {
        const parametros = new URLSearchParams(window.location.search);
        return parametros.get(nombre);
    },

    paginaActual() {
        const ruta = window.location.pathname;
        const partes = ruta.split("/");
        return partes[partes.length - 1] || "index.html";
    },

    marcarMenuActivo() {
        const pagina = this.paginaActual();
        const enlaces = document.querySelectorAll(".nav-inferior a");

        enlaces.forEach(enlace => {
            const href = enlace.getAttribute("href");

            if (href === pagina) {
                enlace.classList.add("activo");
            } else {
                enlace.classList.remove("activo");
            }
        });
    },

    volver() {
        window.history.back();
    },

    inicio() {
        window.location.href = this.paginas.inicio;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    ROUTER.marcarMenuActivo();
});