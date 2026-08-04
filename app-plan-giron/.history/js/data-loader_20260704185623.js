/* ==========================================================
   APP PLAN GIRÓN 2024 - 2027
   Cargador único y seguro de la Base de Conocimiento
   ========================================================== */

const DATA_LOADER = {
    rutaBase: "data/",

    archivos: {
        planGeneral: "plan-general.json",
        diagnostico: "diagnostico.json",
        sectores: "sectores.json",
        indicadores: "indicadores.json",
        programas: "programas.json",
        metas: "metas.json",
        proyectos: "proyectos.json",
        presupuesto: "presupuesto.json",
        controlPolitico: "control-politico.json",
        preguntasControl: "preguntas-control.json",
        propuestas: "propuestas.json",
        estadisticas: "estadisticas.json",
        competencias: "competencias.json",
        secretarias: "secretarias.json",
        fuentes: "fuentes.json",
        barrios: "barrios.json",
        comunas: "comunas.json",
        veredas: "veredas.json",
        poblaciones: "poblaciones.json",
        problematicas: "problematicas.json",
        fortalezas: "fortalezas.json",
        debilidades: "debilidades.json",
        oportunidades: "oportunidades.json",
        riesgos: "riesgos.json",
        ods: "ods.json",
        indicadoresClave: "indicadores-clave.json",
        ejes: "ejes.json",
        fichasSectoriales: "fichas-sectoriales.json",
        lineasEstrategicas: "lineas-estrategicas.json",
        glosario: "glosario.json",
        diagnosticoDofa: "diagnostico-dofa.json",
        alertas: "alertas.json",
        iaContexto: "ia-contexto.json"
    },

    base: {},
    errores: [],
    cargado: false,

    async cargarArchivo(clave, archivo) {
        try {
            const respuesta = await fetch(this.rutaBase + archivo);

            if (!respuesta.ok) {
                throw new Error("No se encontró " + archivo);
            }

            const datos = await respuesta.json();

            this.base[clave] = datos;

            return true;

        } catch (error) {
            console.error("Error cargando:", archivo, error);

            this.errores.push({
                clave: clave,
                archivo: archivo,
                mensaje: error.message
            });

            this.base[clave] = {};
            return false;
        }
    },

    async cargarTodo() {
        this.base = {};
        this.errores = [];
        this.cargado = false;

        const entradas = Object.entries(this.archivos);

        for (const [clave, archivo] of entradas) {
            await this.cargarArchivo(clave, archivo);
        }

        this.cargado = true;

        window.BASE_CONOCIMIENTO = this.base;
        window.BASE_CONOCIMIENTO_CARGADA = true;

        document.dispatchEvent(new CustomEvent("baseConocimientoLista", {
            detail: {
                base: this.base,
                errores: this.errores
            }
        }));

        console.log("Base de Conocimiento cargada:", this.base);

        if (this.errores.length > 0) {
            console.warn("Archivos con error:", this.errores);
        }

        return this.base;
    },

    cuandoEsteLista(callback) {
        if (window.BASE_CONOCIMIENTO_CARGADA) {
            callback(window.BASE_CONOCIMIENTO);
            return;
        }

        document.addEventListener("baseConocimientoLista", function(evento) {
            callback(evento.detail.base);
        });
    },

    obtener(clave) {
        return this.base[clave] || {};
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    await DATA_LOADER.cargarTodo();
});