/* =========================================================
   GIRÓN PROPONE
   Archivo: js/config.js
   Descripción: Configuración general de la aplicación.
========================================================= */

const APP_CONFIG = {
    nombre: "Girón Propone",
    subtitulo: "Plataforma de Inteligencia Territorial y Programática",
    version: "1.0.0",
    autor: "Leonardo Luna",

    municipio: {
        nombre: "Girón",
        departamento: "Santander",
        pais: "Colombia",
        codigoDane: "68307"
    },

    candidato: {
        nombre: "Candidato al Concejo",
        cargo: "Concejo Municipal de Girón",
        lema: "Propuestas serias para un Girón con futuro",
        partido: "Movimiento / Partido",
        telefono: "",
        email: "",
        sitioWeb: "",
        foto: "assets/avatar/usuario.png"
    },

    rutas: {
        datos: "data/",
        sectores: "data/sectores/",
        assets: "assets/",
        iconos: "assets/iconos/",
        municipios: "assets/municipios/",
        avatar: "assets/avatar/",
        pdf: "pdf/",
        exportaciones: "exportaciones/"
    },

    archivos: {
        sectores: "data/sectores.json",
        municipios: "data/municipios.json",
        configuracion: "data/configuracion.json"
    },

    colores: {
        principal: "#6d5dfc",
        secundario: "#00c2a8",
        acento: "#ffb84d",
        peligro: "#ff5c7a",
        exito: "#22c55e",
        advertencia: "#f59e0b",
        informacion: "#38bdf8"
    },

    pdf: {
        titulo: "Ficha Programática Territorial",
        subtitulo: "Municipio de Girón, Santander",
        orientacion: "portrait",
        formato: "a4",
        nombreArchivoBase: "giron-propone-ficha"
    },

    graficas: {
        fuente: "Segoe UI",
        colorTexto: "#172033",
        colorGrid: "#e6eaf2",
        coloresBase: [
            "#6d5dfc",
            "#00c2a8",
            "#ffb84d",
            "#38bdf8",
            "#22c55e",
            "#ff5c7a"
        ]
    },

    storage: {
        prefijo: "gironPropone_",
        candidato: "gironPropone_candidato",
        preferencias: "gironPropone_preferencias",
        sectorActivo: "gironPropone_sectorActivo",
        historial: "gironPropone_historial"
    },

    opciones: {
        usarLocalStorage: true,
        activarPWA: true,
        activarModoOscuro: false,
        activarAnimaciones: true,
        mostrarFuentes: true,
        mostrarVersion: true
    },

    textos: {
        cargando: "Cargando información territorial...",
        sinDatos: "No hay información disponible para esta sección.",
        errorDatos: "No fue posible cargar la información solicitada.",
        pdfGenerado: "La ficha PDF fue generada correctamente.",
        copiado: "Contenido copiado al portapapeles."
    }
};

window.APP_CONFIG = APP_CONFIG;
