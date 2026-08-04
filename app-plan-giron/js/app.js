/* ==========================================================
   APP PLAN GIRÓN 2024 - 2027
   Motor central de la aplicación
   ========================================================== */

const DATA_PATH = "data/";

const archivosData = {
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
};

let BASE_CONOCIMIENTO = {};

async function cargarJSON(nombreArchivo) {
    try {
        const respuesta = await fetch(DATA_PATH + nombreArchivo);

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar " + nombreArchivo);
        }

        return await respuesta.json();

    } catch (error) {
        console.error(error);
        return null;
    }
}

async function cargarBaseConocimiento() {
    const base = {};

    for (const clave in archivosData) {
        base[clave] = await cargarJSON(archivosData[clave]);
    }

    BASE_CONOCIMIENTO = base;

    console.log("Base de Conocimiento cargada correctamente.");
    return base;
}

function obtenerSectores() {
    if (
        BASE_CONOCIMIENTO.sectores &&
        BASE_CONOCIMIENTO.sectores.sectores
    ) {
        return BASE_CONOCIMIENTO.sectores.sectores;
    }

    return [];
}

function obtenerSectorPorId(id) {
    return obtenerSectores().find(sector => sector.id === id || sector.sectorId === id);
}

function obtenerParametroUrl(nombre) {
    const parametros = new URLSearchParams(window.location.search);
    return parametros.get(nombre);
}

function guardarBusqueda(texto) {
    localStorage.setItem("busquedaPlanGiron", texto);
}

function obtenerBusquedaGuardada() {
    return localStorage.getItem("busquedaPlanGiron") || "";
}

function limpiarBusqueda() {
    localStorage.removeItem("busquedaPlanGiron");
}

function limpiarTexto(texto) {
    return texto
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function renderLista(items) {
    if (!items || items.length === 0) {
        return "<p class='texto-suave'>No hay información disponible.</p>";
    }

    return `
        <ul class="lista-limpia">
            ${items.map(item => `<li>${item}</li>`).join("")}
        </ul>
    `;
}

function renderTarjetas(items, clase = "card-mini") {
    if (!items || items.length === 0) {
        return "<p class='texto-suave'>No hay información disponible.</p>";
    }

    return items.map(item => `
        <div class="${clase}">
            <p>${item}</p>
        </div>
    `).join("");
}

function renderSelectSectores(idSelect) {
    const select = document.getElementById(idSelect);

    if (!select) return;

    const sectores = obtenerSectores();

    sectores.forEach(sector => {
        const option = document.createElement("option");
        option.value = sector.id;
        option.textContent = sector.nombre;
        select.appendChild(option);
    });
}

function buscarEnPlan(texto) {
    const consulta = limpiarTexto(texto);

    if (!consulta) return [];

    const resultados = [];
    const sectores = obtenerSectores();

    sectores.forEach(sector => {
        const campos = [
            sector.nombre,
            sector.descripcion,
            sector.usoApp,
            sector.icono,
            sector.ejePrincipal
        ].join(" ");

        if (limpiarTexto(campos).includes(consulta)) {
            resultados.push(sector);
        }
    });

    return resultados;
}

function abrirSector(id) {
    window.location.href = `sectores-detalle.html?id=${id}`;
}

function mostrarMensajeVacio(contenedorId, mensaje) {
    const contenedor = document.getElementById(contenedorId);

    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="estado-vacio">
            <h3>Sin resultados</h3>
            <p>${mensaje}</p>
        </div>
    `;
}

function formatoFuente(texto) {
    return `
        <div class="card-fuente">
            <strong>Fuente:</strong> ${texto}
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", async () => {
    await cargarBaseConocimiento();
});