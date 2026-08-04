/* ==========================================================
   APP PLAN GIRÓN 2024 - 2027
   Cargador central de la Base de Conocimiento
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
                throw new Error("No se pudo cargar el archivo: " + archivo);
            }

            const datos = await respuesta.json();

            this.base[clave] = datos;

            return {
                clave: clave,
                archivo: archivo,
                estado: "ok"
            };

        } catch (error) {

            this.base[clave] = null;

            const errorInfo = {
                clave: clave,
                archivo: archivo,
                estado: "error",
                mensaje: error.message
            };

            this.errores.push(errorInfo);

            console.error("Error cargando:", archivo, error);

            return errorInfo;
        }
    },

    async cargarTodo() {
        this.base = {};
        this.errores = [];
        this.cargado = false;

        const claves = Object.keys(this.archivos);

        for (const clave of claves) {
            await this.cargarArchivo(clave, this.archivos[clave]);
        }

        this.cargado = true;

        window.BASE_CONOCIMIENTO = this.base;

        console.log("Base de Conocimiento cargada:", this.base);

        if (this.errores.length > 0) {
            console.warn("Archivos con errores:", this.errores);
        }

        return this.base;
    },

    obtener(clave) {
        return this.base[clave] || null;
    },

    obtenerTodo() {
        return this.base;
    },

    estaCargado() {
        return this.cargado;
    },

    obtenerErrores() {
        return this.errores;
    },

    buscarTexto(texto) {
        if (!texto || texto.trim() === "") {
            return [];
        }

        const consulta = this.normalizar(texto);
        const resultados = [];

        for (const clave in this.base) {
            const contenido = this.base[clave];

            if (!contenido) continue;

            const textoArchivo = this.normalizar(JSON.stringify(contenido));

            if (textoArchivo.includes(consulta)) {
                resultados.push({
                    archivo: clave,
                    datos: contenido
                });
            }
        }

        return resultados;
    },

    normalizar(texto) {
        return texto
            .toString()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    await DATA_LOADER.cargarTodo();
});