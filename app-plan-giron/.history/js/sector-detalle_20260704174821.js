/* ==========================================================
   APP PLAN GIRÓN 2024 - 2027
   Detalle inteligente de sector
   ========================================================== */

let sectorActual = null;

function obtenerBaseDetalle() {
    return window.BASE_CONOCIMIENTO || {};
}

function obtenerSectorActual() {
    const id = ROUTER.parametro("id");
    const base = obtenerBaseDetalle();

    if (!base.sectores || !base.sectores.sectores) {
        return null;
    }

    return base.sectores.sectores.find(sector => sector.id === id);
}

function listaHTML(items) {
    if (!items || items.length === 0) {
        return "<p class='texto-suave'>No hay información disponible.</p>";
    }

    return `
        <ul class="lista-limpia">
            ${items.map(item => `<li>${item}</li>`).join("")}
        </ul>
    `;
}

function buscarPorSector(archivo, sectorId, campoArray) {
    if (!archivo) return [];

    const posiblesListas = [
        archivo.sectores,
        archivo.propuestas,
        archivo.preguntas,
        archivo.programas
    ];

    for (const lista of posiblesListas) {
        if (!Array.isArray(lista)) continue;

        const encontrado = lista.find(item => item.sectorId === sectorId);

        if (encontrado) {
            return encontrado[campoArray] || encontrado.metas || encontrado.indicadores || encontrado.proyectos || encontrado.ideas || encontrado.preguntas || [];
        }
    }

    return [];
}

function cargarDetalleSector() {
    sectorActual = obtenerSectorActual();

    if (!sectorActual) {
        document.getElementById("tituloSector").textContent = "Sector no encontrado";
        document.getElementById("descripcionSector").textContent = "No se encontró información para este sector.";
        return;
    }

    const base = obtenerBaseDetalle();

    document.getElementById("tituloSector").textContent = `${sectorActual.icono || "📌"} ${sectorActual.nombre}`;
    document.getElementById("descripcionSector").textContent = sectorActual.descripcion || "";

    document.getElementById("resumenSector").innerHTML = `
        <p><strong>Sector:</strong> ${sectorActual.nombre}</p>
        <p><strong>Eje principal:</strong> ${sectorActual.ejePrincipal || "No especificado"}</p>
        <p><strong>Uso dentro de la app:</strong> ${sectorActual.usoApp || "Consulta estratégica del Plan de Desarrollo."}</p>
    `;

    cargarPresupuestoSector(base, sectorActual);
    cargarBloquesEstrategicos(base, sectorActual);
    cargarProgramasSector(base, sectorActual);
    cargarProyectosSector(base, sectorActual);
    cargarMetasSector(base, sectorActual);
    cargarIndicadoresSector(base, sectorActual);
    cargarODSSector(base, sectorActual);
    cargarControlSector(base, sectorActual);
    cargarPropuestasSector(base, sectorActual);
}

function cargarPresupuestoSector(base, sector) {
    const contenedor = document.getElementById("presupuestoSector");

    if (!contenedor) return;

    const presupuesto = base.presupuesto;

    if (!presupuesto || !presupuesto.sectores) {
        contenedor.innerHTML = "<p class='texto-suave'>No hay presupuesto disponible.</p>";
        return;
    }

    const item = presupuesto.sectores.find(p => p.sectorId === sector.id);

    if (!item) {
        contenedor.innerHTML = "<p class='texto-suave'>No hay presupuesto específico para este sector.</p>";
        return;
    }

    contenedor.innerHTML = `
        <div class="presupuesto-card">
            <h3>${item.sector}</h3>
            <div class="valor">$ ${item.totalCuatrienio}</div>
            <p>Millones de pesos colombianos</p>
            <p><strong>Participación:</strong> ${item.participacionPorcentual}</p>
        </div>

        <ul class="presupuesto-lista">
            <li><strong>2024</strong><span>$ ${item.valores["2024"]} millones</span></li>
            <li><strong>2025</strong><span>$ ${item.valores["2025"]} millones</span></li>
            <li><strong>2026</strong><span>$ ${item.valores["2026"]} millones</span></li>
            <li><strong>2027</strong><span>$ ${item.valores["2027"]} millones</span></li>
        </ul>
    `;
}

function cargarBloquesEstrategicos(base, sector) {
    const problematicas = buscarPorSector(base.problematicas, sector.id, "problematicas");
    const fortalezas = buscarPorSector(base.fortalezas, sector.id, "fortalezas");
    const debilidades = buscarPorSector(base.debilidades, sector.id, "debilidades");
    const oportunidades = buscarPorSector(base.oportunidades, sector.id, "oportunidades");
    const riesgos = buscarPorSector(base.riesgos, sector.id, "riesgos");

    document.getElementById("problematicasSector").innerHTML = listaHTML(problematicas);
    document.getElementById("fortalezasSector").innerHTML = listaHTML(fortalezas);
    document.getElementById("debilidadesSector").innerHTML = listaHTML(debilidades);
    document.getElementById("oportunidadesSector").innerHTML = listaHTML(oportunidades);
    document.getElementById("riesgosSector").innerHTML = listaHTML(riesgos);
}

function cargarProgramasSector(base, sector) {
    const contenedor = document.getElementById("programasSector");

    if (!contenedor) return;

    const programas = base.programas && base.programas.programas
        ? base.programas.programas.filter(p => p.sectorId === sector.id)
        : [];

    if (programas.length === 0) {
        contenedor.innerHTML = "<p class='texto-suave'>No hay programas asociados.</p>";
        return;
    }

    contenedor.innerHTML = programas.map(programa => `
        <div class="programa">
            <span class="programa-codigo">${programa.id}</span>
            <h4>${programa.nombre}</h4>
            <p>${programa.descripcion}</p>
        </div>
    `).join("");
}

function cargarProyectosSector(base, sector) {
    const contenedor = document.getElementById("proyectosSector");

    if (!contenedor) return;

    const proyectos = buscarPorSector(base.proyectos, sector.id, "proyectos");

    if (proyectos.length === 0) {
        contenedor.innerHTML = "<p class='texto-suave'>No hay proyectos asociados.</p>";
        return;
    }

    contenedor.innerHTML = proyectos.map(proyecto => `
        <div class="proyecto">
            <h4>${proyecto.nombre}</h4>
            <p>${proyecto.descripcion || ""}</p>
            <p><strong>Programa:</strong> ${proyecto.programa || "No especificado"}</p>
            <p><strong>Secretaría:</strong> ${proyecto.secretaria || "No especificada"}</p>
        </div>
    `).join("");
}

function cargarMetasSector(base, sector) {
    const contenedor = document.getElementById("metasSector");

    if (!contenedor) return;

    const metas = buscarPorSector(base.metas, sector.id, "metas");

    if (metas.length === 0) {
        contenedor.innerHTML = "<p class='texto-suave'>No hay metas asociadas.</p>";
        return;
    }

    contenedor.innerHTML = metas.map(meta => `
        <div class="meta">
            <h4>${meta.nombre}</h4>
            <p>${meta.descripcion || ""}</p>
            <span class="estado-meta estado-programada">${meta.tipo || "Meta"}</span>
        </div>
    `).join("");
}

function cargarIndicadoresSector(base, sector) {
    const contenedor = document.getElementById("indicadoresSector");

    if (!contenedor) return;

    const indicadores = buscarPorSector(base.indicadores, sector.id, "indicadores");

    if (indicadores.length === 0) {
        contenedor.innerHTML = "<p class='texto-suave'>No hay indicadores asociados.</p>";
        return;
    }

    contenedor.innerHTML = indicadores.map(indicador => `
        <div class="indicador">
            <h4>${indicador.nombre}</h4>
            <p><strong>Tipo:</strong> ${indicador.tipo || "No especificado"}</p>
            <p><strong>Unidad:</strong> ${indicador.unidad || "No especificada"}</p>
        </div>
    `).join("");
}

function cargarODSSector(base, sector) {
    const contenedor = document.getElementById("odsSector");

    if (!contenedor) return;

    const relacion = base.ods && base.ods.relacionPorSector
        ? base.ods.relacionPorSector.find(item => item.sectorId === sector.id)
        : null;

    if (!relacion) {
        contenedor.innerHTML = "<p class='texto-suave'>No hay ODS asociados.</p>";
        return;
    }

    contenedor.innerHTML = listaHTML(relacion.ods);
}

function cargarControlSector(base, sector) {
    const preguntas1 = buscarPorSector(base.controlPolitico, sector.id, "preguntas");
    const preguntas2 = buscarPorSector(base.preguntasControl, sector.id, "preguntas");

    const preguntas = [...preguntas1, ...preguntas2];

    document.getElementById("controlSector").innerHTML = listaHTML(preguntas);
}

function cargarPropuestasSector(base, sector) {
    const propuestas = buscarPorSector(base.propuestas, sector.id, "ideas");

    document.getElementById("propuestasSector").innerHTML = listaHTML(propuestas);
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(cargarDetalleSector, 700);
});