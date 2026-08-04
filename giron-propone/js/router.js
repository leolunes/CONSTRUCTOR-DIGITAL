/* =========================================================
   GIRÓN PROPONE
   Archivo: js/router.js
   Descripción: Router SPA básico.
========================================================= */

"use strict";

const Router = {

    vistaActual: "dashboard",

    titulos: {
        dashboard: ["Centro de Inteligencia Territorial","Girón, Santander"],
        sectores: ["Sectores","12 tipologías programáticas"],
        diagnostico: ["Diagnóstico Territorial","Situación actual del municipio"],
        estadisticas: ["Estadísticas","Indicadores e información"],
        estrategias: ["Estrategias","Campaña programática"],
        discursos: ["Discursos","Mensajes para la ciudadanía"],
        redes: ["Redes Sociales","Contenido para publicaciones"],
        proyectos: ["Proyectos","Banco de iniciativas"],
        debate: ["Debate","Preguntas y respuestas"],
        control: ["Control Político","Seguimiento a la gestión"],
        financiacion: ["Financiación","Fuentes y recursos"],
        pdf: ["Exportación PDF","Fichas programáticas"],
        configuracion: ["Configuración","Preferencias"]
    },

    iniciar() {
        this.ir("dashboard");
    },

    ir(vista="dashboard") {

        this.vistaActual = vista;

        this.actualizarTitulos(vista);

        if (window.Menu) {
            Menu.activarPorVista(vista);
        }

        const contenedor = document.getElementById("app");
        if (!contenedor) return;

        if (vista === "dashboard") {
            const dash = document.querySelector(".dashboard-view");
            if (dash) {
                dash.style.display = "";
            }
            return;
        }

        const dash = document.querySelector(".dashboard-view");
        if (dash) dash.style.display = "none";

        contenedor.innerHTML = this.plantilla(vista);
    },

    actualizarTitulos(vista) {
        const datos = this.titulos[vista] || [vista,""];
        const t = document.getElementById("tituloVista");
        const s = document.getElementById("subtituloVista");
        if (t) t.textContent = datos[0];
        if (s) s.textContent = datos[1];
    },

    plantilla(vista) {
        return `
        <section class="view fade-up">
            <div class="content-card">
                <span class="eyebrow">${vista.toUpperCase()}</span>
                <h2>${this.titulos[vista]?.[0] || vista}</h2>
                <p>Esta sección será desarrollada durante las siguientes etapas del proyecto.</p>

                <div class="alert info" style="margin-top:20px;">
                    <div>ℹ️</div>
                    <div>
                        <strong>Módulo en construcción</strong>
                        <p>La arquitectura ya está preparada. Aquí se integrarán los componentes funcionales de esta sección.</p>
                    </div>
                </div>
            </div>
        </section>`;
    }

};

window.Router = Router;

document.addEventListener("DOMContentLoaded", () => {
    Router.iniciar();
});
