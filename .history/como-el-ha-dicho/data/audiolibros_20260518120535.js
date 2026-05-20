const listaAudiolibros = document.getElementById("listaAudiolibros");
const detalleAudiolibro = document.getElementById("detalleAudiolibro");
const tituloLibro = document.getElementById("tituloLibro");
const descripcionLibro = document.getElementById("descripcionLibro");
const capitulosLibro = document.getElementById("capitulosLibro");

let audiolibros = [];

document.addEventListener("DOMContentLoaded", cargarAudiolibros);

async function cargarAudiolibros() {
    try {
        const respuesta = await fetch("./data/audiolibros.json");

        if (!respuesta.ok) {
            throw new Error("No se encontró data/audiolibros.json");
        }

        audiolibros = await respuesta.json();

        renderizarAudiolibros();

    } catch (error) {
        console.error("Error cargando audiolibros:", error);

        listaAudiolibros.innerHTML = `
            <div class="empty-card">
                <h3>No se pudieron cargar los audiolibros</h3>
                <p>Verifica el archivo data/audiolibros.json.</p>
            </div>
        `;
    }
}

function renderizarAudiolibros() {
    listaAudiolibros.innerHTML = "";

    audiolibros.forEach((libro) => {
        const card = document.createElement("article");
        card.className = "audiolibro-card";

        card.innerHTML = `
            <div class="audiolibro-icon">
                📚
            </div>

            <h3>${libro.titulo}</h3>

            <p>${libro.descripcion}</p>

            <div class="audiolibro-meta">
                <span class="audiolibro-badge">
                    Autor: ${libro.autor}
                </span>

                <span class="audiolibro-badge">
                    ${libro.capitulos.length} secciones
                </span>
            </div>

            <button class="btn-audiolibro" onclick="abrirAudiolibro('${libro.id}')">
                Ver capítulos
            </button>
        `;

        listaAudiolibros.appendChild(card);
    });
}

function abrirAudiolibro(idLibro) {
    const libro = audiolibros.find((item) => item.id === idLibro);

    if (!libro) return;

    listaAudiolibros.classList.add("hidden");
    detalleAudiolibro.classList.remove("hidden");

    tituloLibro.textContent = libro.titulo;
    descripcionLibro.textContent = libro.descripcion;

    capitulosLibro.innerHTML = "";

    libro.capitulos.forEach((capitulo) => {
        const item = document.createElement("div");
        item.className = "chapter-card";

        item.innerHTML = `
            <div>
                <span class="audiolibro-badge">${capitulo.tipo}</span>
                <h3>${capitulo.titulo}</h3>
            </div>

            <div class="chapter-actions">
                <a href="${capitulo.pdf}" target="_blank" class="btn-secondary">
                    Leer PDF
                </a>

                <audio controls preload="none">
                    <source src="${capitulo.audio}" type="audio/mpeg">
                    Tu navegador no soporta audio.
                </audio>
            </div>
        `;

        capitulosLibro.appendChild(item);
    });
}

function cerrarDetalleAudiolibro() {
    detalleAudiolibro.classList.add("hidden");
    listaAudiolibros.classList.remove("hidden");
}