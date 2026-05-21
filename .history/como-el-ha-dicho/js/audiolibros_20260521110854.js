const listaAudiolibros = document.getElementById("listaAudiolibros");
const detalleAudiolibro = document.getElementById("detalleAudiolibro");
const tituloLibro = document.getElementById("tituloLibro");
const descripcionLibro = document.getElementById("descripcionLibro");
const capitulosLibro = document.getElementById("capitulosLibro");

/* =====================================
   MODAL PÍLDORAS
===================================== */

const modalPildoras =
document.getElementById("modalPildoras");

const cerrarModalPildorasBtn =
document.getElementById("cerrarModalPildoras");

const contenidoPildoras =
document.getElementById("contenidoPildoras");

const tituloPildoras =
document.getElementById("tituloPildoras");

const descripcionPildoras =
document.getElementById("descripcionPildoras");

let audiolibros = [];
let pildorasLibros = [];

/* =====================================
   INICIO
===================================== */

document.addEventListener(
    "DOMContentLoaded",
    iniciarAudiolibros
);

async function iniciarAudiolibros(){

    await cargarAudiolibros();

    await cargarPildoras();

    configurarEventosModal();

}

/* =====================================
   CARGAR AUDIOLIBROS
===================================== */

async function cargarAudiolibros() {

    try {

        const respuesta =
        await fetch("./data/audiolibros.json");

        if (!respuesta.ok) {

            throw new Error(
                "No se encontró data/audiolibros.json"
            );

        }

        audiolibros =
        await respuesta.json();

        renderizarBibliotecaAudiolibros();

    } catch (error) {

        console.error(
            "Error cargando audiolibros:",
            error
        );

        listaAudiolibros.innerHTML = `
            <div class="empty-card">

                <h3>
                    No se pudieron cargar los audiolibros
                </h3>

                <p>
                    Verifica que exista el archivo
                    data/audiolibros.json
                </p>

            </div>
        `;

    }

}

/* =====================================
   CARGAR PÍLDORAS
===================================== */

async function cargarPildoras(){

    try{

        const respuesta =
        await fetch("./data/pildoras.json");

        if(!respuesta.ok){

            throw new Error(
                "No se encontró data/pildoras.json"
            );

        }

        pildorasLibros =
        await respuesta.json();

    }

    catch(error){

        console.error(
            "Error cargando pildoras:",
            error
        );

    }

}

/* =====================================
   RENDER BIBLIOTECA
===================================== */

function renderizarBibliotecaAudiolibros() {

    listaAudiolibros.innerHTML = "";

    if (!audiolibros ||
        audiolibros.length === 0) {

        listaAudiolibros.innerHTML = `
            <div class="empty-card">

                <h3>
                    No hay audiolibros disponibles
                </h3>

                <p>
                    Agrega libros en
                    data/audiolibros.json
                </p>

            </div>
        `;

        return;

    }

    audiolibros.forEach((libro) => {

        const card =
        document.createElement("article");

        card.className =
        "audiolibro-portada-card";

        card.setAttribute(
            "role",
            "button"
        );

        card.setAttribute(
            "tabindex",
            "0"
        );

        card.setAttribute(
            "aria-label",
            `Abrir audiolibro ${libro.titulo}`
        );

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

                <h3>
                    ${libro.titulo}
                </h3>

                <p>
                    ${libro.autor || "Autor no especificado"}
                </p>

                <small>
                    ${libro.capitulos.length}
                    secciones disponibles
                </small>

            </div>

        `;

        card.addEventListener(
            "click",
            () => abrirAudiolibro(libro.id)
        );

        card.addEventListener(
            "keydown",
            (evento) => {

                if (
                    evento.key === "Enter" ||
                    evento.key === " "
                ){

                    evento.preventDefault();

                    abrirAudiolibro(
                        libro.id
                    );

                }

            }
        );

        listaAudiolibros.appendChild(card);

    });

}

/* =====================================
   ABRIR AUDIOLIBRO
===================================== */

function abrirAudiolibro(idLibro) {

    const libro =
    audiolibros.find(
        (item) => item.id === idLibro
    );

    if (!libro) return;

    listaAudiolibros.classList.add(
        "hidden"
    );

    detalleAudiolibro.classList.remove(
        "hidden"
    );

    tituloLibro.textContent =
    libro.titulo;

    descripcionLibro.textContent =
    libro.descripcion;

    capitulosLibro.innerHTML = "";

    const encabezadoDetalle =
    document.createElement("div");

    encabezadoDetalle.className =
    "audiolibro-detalle-header";

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
                ${libro.capitulos.length}
                secciones
            </span>

            <h3>
                ${libro.autor || "Autor no especificado"}
            </h3>

            <p>
                Selecciona una sección para leer,
                escuchar o meditar.
            </p>

        </div>

    `;

    capitulosLibro.appendChild(
        encabezadoDetalle
    );

    libro.capitulos.forEach(
        (capitulo, index) => {

        const item =
        document.createElement("div");

        item.className =
        "chapter-card";

        const tienePdf =
        capitulo.pdf &&
        capitulo.pdf.trim() !== "";

        const tieneAudio =
        capitulo.audio &&
        capitulo.audio.trim() !== "";

        item.innerHTML = `

            <div class="chapter-card-header">

                <span class="audiolibro-badge">
                    ${capitulo.tipo}
                </span>

                <h3>
                    ${capitulo.titulo}
                </h3>

                <p>
                    Sección ${index + 1}
                    de
                    ${libro.capitulos.length}
                </p>

            </div>

            <div class="chapter-actions">

                ${
                    tienePdf
                    ? `
                        <a
                        href="${capitulo.pdf}"
                        target="_blank"
                        class="btn-secondary">

                            📖 Leer PDF

                        </a>
                    `
                    : `
                        <button
                        class="btn-secondary"
                        disabled>

                            PDF no disponible

                        </button>
                    `
                }

                ${
                    tieneAudio
                    ? `
                        <div class="audio-capitulo-box">

                            <span>
                                🎧 Escuchar audio
                            </span>

                            <audio
                            controls
                            preload="none">

                                <source
                                src="${capitulo.audio}"
                                type="audio/mpeg">

                                Tu navegador
                                no soporta audio.

                            </audio>

                        </div>
                    `
                    : `
                        <button
                        class="btn-secondary"
                        disabled>

                            Audio no disponible

                        </button>
                    `
                }

                <button
                class="btn-secondary btn-pildoras"
                onclick="abrirPildoras('${libro.id}')">

                    💡 Píldoras

                </button>

            </div>

        `;

        capitulosLibro.appendChild(item);

    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

/* =====================================
   ABRIR PÍLDORAS
===================================== */

function abrirPildoras(idLibro){

    const libroPildoras =
    pildorasLibros.find(
        (item) => item.libroId === idLibro
    );

    if(!libroPildoras){

        alert(
            "Este libro todavía no tiene píldoras disponibles."
        );

        return;

    }

    tituloPildoras.textContent =
    libroPildoras.titulo;

    descripcionPildoras.textContent =
    "Frases destacadas y respuestas espirituales del audiolibro.";

    contenidoPildoras.innerHTML = "";

    libroPildoras.pildoras.forEach(
        (bloque) => {

        const section =
        document.createElement("section");

        section.className =
        "pildora-section";

        const frasesHtml =
        bloque.frases.map(
            (item) => {

                if (typeof item === "string") {

                    return `
                        <div class="pildora-item">

                            <div class="pildora-frase">

                                💬 ${item}

                            </div>

                        </div>
                    `;

                }

                return `

                    <div class="pildora-item">

                        <div class="pildora-frase">

                            💬 ${item.frase || ""}

                        </div>

                        ${
                            item.respuesta
                            ? `
                                <div class="pildora-respuesta">

                                    ➡️ ${item.respuesta}

                                </div>
                            `
                            : ""
                        }

                    </div>

                `;

            }
        ).join("");

        section.innerHTML = `

            <div class="pildora-header">

                <span class="audiolibro-badge">
                    ${bloque.seccion}
                </span>

                <h3>
                    ${bloque.titulo}
                </h3>

            </div>

            <div class="pildora-lista">

                ${frasesHtml}

            </div>

        `;

        contenidoPildoras.appendChild(
            section
        );

    });

    modalPildoras.classList.add(
        "modal-pildoras-activo"
    );

    document.body.style.overflow =
    "hidden";

}

/* =====================================
   CERRAR PÍLDORAS
===================================== */

function cerrarModalPildoras(){

    modalPildoras.classList.remove(
        "modal-pildoras-activo"
    );

    document.body.style.overflow =
    "";

}

/* =====================================
   EVENTOS MODAL
===================================== */

function configurarEventosModal(){

    if(cerrarModalPildorasBtn){

        cerrarModalPildorasBtn
        .addEventListener(
            "click",
            cerrarModalPildoras
        );

    }

    if(modalPildoras){

        modalPildoras
        .addEventListener(
            "click",
            (evento) => {

                if(
                    evento.target ===
                    modalPildoras
                ){

                    cerrarModalPildoras();

                }

            }
        );

    }

}

/* =====================================
   CERRAR DETALLE
===================================== */

function cerrarDetalleAudiolibro() {

    detalleAudiolibro.classList.add(
        "hidden"
    );

    listaAudiolibros.classList.remove(
        "hidden"
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}
