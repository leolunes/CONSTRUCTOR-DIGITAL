/* ==========================================================
   APP PLAN GIRÓN 2024 - 2027
   Buscador inteligente de la Base de Conocimiento
   ========================================================== */

const BUSCADOR = {

    obtenerBase() {
        return window.BASE_CONOCIMIENTO || {};
    },

    normalizar(texto) {
        return texto
            .toString()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    },

    buscar(texto) {
        if (!texto || texto.trim() === "") {
            return [];
        }

        const consulta = this.normalizar(texto);
        const base = this.obtenerBase();
        const resultados = [];

        Object.keys(base).forEach(clave => {
            const contenido = base[clave];

            if (!contenido) return;

            const textoContenido = this.normalizar(JSON.stringify(contenido));

            if (textoContenido.includes(consulta)) {
                resultados.push({
                    archivo: clave,
                    titulo: this.nombreArchivo(clave),
                    descripcion: this.resumenArchivo(clave, contenido),
                    datos: contenido
                });
            }
        });

        return resultados;
    },

    nombreArchivo(clave) {
        const nombres = {
            planGeneral: "Información General",
            diagnostico: "Diagnóstico",
            sectores: "Sectores",
            indicadores: "Indicadores",
            programas: "Programas",
            metas: "Metas",
            proyectos: "Proyectos",
            presupuesto: "Presupuesto",
            controlPolitico: "Control Político",
            preguntasControl: "Preguntas de Control",
            propuestas: "Propuestas",
            estadisticas: "Estadísticas",
            competencias: "Competencias",
            secretarias: "Secretarías",
            fuentes: "Fuentes",
            barrios: "Barrios",
            comunas: "Comunas",
            veredas: "Veredas",
            poblaciones: "Poblaciones",
            problematicas: "Problemáticas",
            fortalezas: "Fortalezas",
            debilidades: "Debilidades",
            oportunidades: "Oportunidades",
            riesgos: "Riesgos",
            ods: "ODS",
            indicadoresClave: "Indicadores Clave",
            ejes: "Ejes Estratégicos",
            fichasSectoriales: "Fichas Sectoriales",
            lineasEstrategicas: "Líneas Estratégicas",
            glosario: "Glosario",
            diagnosticoDofa: "Diagnóstico DOFA",
            alertas: "Alertas",
            iaContexto: "Contexto IA"
        };

        return nombres[clave] || clave;
    },

    resumenArchivo(clave, contenido) {
        if (contenido.descripcion) {
            return contenido.descripcion;
        }

        if (contenido.municipio) {
            return "Información relacionada con " + contenido.municipio + ".";
        }

        return "Coincidencia encontrada en la Base de Conocimiento.";
    },

    renderResultados(resultados, contenedorId) {
        const contenedor = document.getElementById(contenedorId);

        if (!contenedor) return;

        if (!resultados || resultados.length === 0) {
            contenedor.innerHTML = `
                <div class="estado-vacio">
                    <h3>Sin resultados</h3>
                    <p>No se encontraron coincidencias en la Base de Conocimiento.</p>
                </div>
            `;
            return;
        }

        contenedor.innerHTML = resultados.map(resultado => `
            <div class="resultado-busqueda">
                <span class="categoria">${resultado.titulo}</span>
                <h4>${resultado.titulo}</h4>
                <p>${resultado.descripcion}</p>
            </div>
        `).join("");
    },

    ejecutarBusqueda() {
        const input = document.getElementById("inputBusqueda");
        const contenedorId = "resultadosBusqueda";

        if (!input) return;

        const texto = input.value.trim();

        if (texto === "") {
            alert("Escriba una palabra para buscar.");
            return;
        }

        localStorage.setItem("busquedaPlanGiron", texto);

        const resultados = this.buscar(texto);

        this.renderResultados(resultados, contenedorId);
    },

    cargarBusquedaInicial() {
        const input = document.getElementById("inputBusqueda");

        if (!input) return;

        const busquedaGuardada = localStorage.getItem("busquedaPlanGiron") || "";

        if (busquedaGuardada !== "") {
            input.value = busquedaGuardada;

            setTimeout(() => {
                const resultados = this.buscar(busquedaGuardada);
                this.renderResultados(resultados, "resultadosBusqueda");
            }, 500);
        }
    }
};

function realizarBusqueda() {
    BUSCADOR.ejecutarBusqueda();
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        BUSCADOR.cargarBusquedaInicial();
    }, 600);
});