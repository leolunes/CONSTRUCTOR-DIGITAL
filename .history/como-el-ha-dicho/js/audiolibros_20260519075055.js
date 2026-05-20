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

        renderizarBibliotecaAudiolibros();

    } catch (error) {
        console.error("Error cargando audiolibros:", error);

        listaAudiolibros.innerHTML = `
            <div class="empty-card">
                <h3>No se pudieron cargar los audiolibros</h3>
                <p>Verifica que exista el archivo data/audiolibros.json y que esté bien escrito.</p>
            </div>
        `;
    }
}

function renderizarBibliotecaAudiolibros() {
    listaAudiolibros.innerHTML = "";

    if (!audiolibros || audiolibros.length === 0) {
        listaAudiolibros.innerHTML = `
            <div class="empty-card">
                <h3>No hay audiolibros disponibles</h3>
                <p>Agrega libros en data/audiolibros.json para mostrarlos aquí.</p>
            </div>
        `;
        return;
    }

    audiolibros.forEach((libro) => {
        const card = document.createElement("article");
        card.className = "audiolibro-portada-card";
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `Abrir audiolibro ${libro.titulo}`);

        card.innerHTML = `
            <div class="audiolibro-portada-wrap">
                <img
                    src="${libro.portada}"
                    alt="${libro.titulo}"
                    class="audiolibro-portada"
                    loading="lazy"
                    onerror="this.src='./assets/icons/logo.png'"
                >
            </div>

            <div class="audiolibro-portada-info">
                <span class="audiolibro-badge">
                    📚 Audiolibro
                </span>

                <h3>${libro.titulo}</h3>

                <p>${libro.autor || "Autor no especificado"}</p>

                <small>
                    ${libro.capitulos.length} secciones disponibles
                </small>
            </div>
        `;

        card.addEventListener("click", () => abrirAudiolibro(libro.id));

        card.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                abrirAudiolibro(libro.id);
            }
        });

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

    const encabezadoDetalle = document.createElement("div");
    encabezadoDetalle.className = "audiolibro-detalle-header";

    encabezadoDetalle.innerHTML = `
        <div class="audiolibro-detalle-portada-wrap">
            <img
                src="${libro.portada}"
                alt="${libro.titulo}"
                class="audiolibro-detalle-portada"
                onerror="this.src='./assets/icons/logo.png'"
            >
        </div>

        <div class="audiolibro-detalle-info">
            <span class="audiolibro-badge">
                ${libro.capitulos.length} secciones
            </span>

            <h3>${libro.autor || "Autor no especificado"}</h3>

            <p>
                Selecciona una sección para leer el PDF o escuchar el audio correspondiente.
            </p>
        </div>
    `;

    capitulosLibro.appendChild(encabezadoDetalle);

    libro.capitulos.forEach((capitulo, index) => {
        const item = document.createElement("div");
        item.className = "chapter-card";

        const tienePdf = capitulo.pdf && capitulo.pdf.trim() !== "";
        const tieneAudio = capitulo.audio && capitulo.audio.trim() !== "";

        item.innerHTML = `
            <div class="chapter-card-header">
                <span class="audiolibro-badge">${capitulo.tipo}</span>

                <h3>${capitulo.titulo}</h3>

                <p>
                    Sección ${index + 1} de ${libro.capitulos.length}
                </p>
            </div>

            <div class="chapter-actions">
                ${
                    tienePdf
                        ? `
                            <a href="${capitulo.pdf}" target="_blank" class="btn-secondary">
                                📖 Leer PDF
                            </a>
                        `
                        : `
                            <button class="btn-secondary" disabled>
                                PDF no disponible
                            </button>
                        `
                }

                ${
                    tieneAudio
                        ? `
                            <div class="audio-capitulo-box">
                                <span>🎧 Escuchar audio</span>

                                <audio controls preload="none">
                                    <source src="${capitulo.audio}" type="audio/mpeg">
                                    Tu navegador no soporta audio.
                                </audio>
                            </div>
                        `
                        : `
                            <button class="btn-secondary" disabled>
                                Audio no disponible
                            </button>
                        `
                }
            </div>
        `;

        capitulosLibro.appendChild(item);
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function cerrarDetalleAudiolibro() {
    detalleAudiolibro.classList.add("hidden");
    listaAudiolibros.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
