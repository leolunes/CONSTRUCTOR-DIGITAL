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

const areaExportarPildoras =
document.getElementById("areaExportarPildoras");

const btnDescargarPildoras =
document.getElementById("btnDescargarPildoras");

const btnCompartirPildoras =
document.getElementById("btnCompartirPildoras");

let audiolibros = [];
let pildorasLibros = [];
let libroPildorasActivo = null;
let audiolibrosFiltrados = [];

/* =====================================
   INICIO
===================================== */

document.addEventListener(
    "DOMContentLoaded",
    iniciarAudiolibros
);

async function iniciarAudiolibros(){

    await cargarAudiolibros();

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

        audiolibrosFiltrados =
        audiolibros;

        actualizarResumenAudiolibros();

        configurarBusquedaAudiolibros();

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
   RENDER BIBLIOTECA
===================================== */

function renderizarBibliotecaAudiolibros() {

    listaAudiolibros.innerHTML = "";

    const librosParaMostrar =
    Array.isArray(audiolibrosFiltrados)
    ? audiolibrosFiltrados
    : audiolibros;

    if (!librosParaMostrar ||
        librosParaMostrar.length === 0) {

        listaAudiolibros.innerHTML = `
            <div class="empty-card audiolibros-empty-reino">

                <h3>
                    No hay audiolibros para mostrar
                </h3>

                <p>
                    Intenta con otra búsqueda o revisa el archivo
                    data/audiolibros.json.
                </p>

            </div>
        `;

        return;

    }

    librosParaMostrar.forEach((libro, indice) => {

        const card =
        document.createElement("article");

        card.className =
        "audiolibro-portada-card audiolibro-portada-card-reino";

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

        const totalSecciones =
        Array.isArray(libro.capitulos)
        ? libro.capitulos.length
        : 0;

        card.innerHTML = `

            <div class="audiolibro-portada-wrap">

                <img
                    src="${libro.portada}"
                    alt="${libro.titulo}"
                    class="audiolibro-portada"
                    loading="lazy"
                    onerror="this.src='./assets/icons/logo.png'"
                >

                <div class="audiolibro-portada-overlay">

                    <span>
                        Abrir libro
                    </span>

                </div>

            </div>

            <div class="audiolibro-portada-info">

                <div class="audiolibro-card-top">

                    <span class="audiolibro-badge">
                        Libro ${indice + 1}
                    </span>

                    <span class="audiolibro-badge badge-dorado">
                        ${totalSecciones} secciones
                    </span>

                </div>

                <h3>
                    ${libro.titulo}
                </h3>

                <p class="audiolibro-autor">
                    ${libro.autor || "Leonard Moon"}
                </p>

                <p class="audiolibro-descripcion-card">
                    ${libro.descripcion || "Audiolibro espiritual para edificación y crecimiento."}
                </p>

                <button
                type="button"
                class="btn-audiolibro btn-abrir-libro">
                    Abrir audiolibro →
                </button>

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
    "audiolibro-detalle-header audiolibro-detalle-header-reino";

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
                secciones disponibles
            </span>

            <h3>
                ${libro.autor || "Leonard Moon"}
            </h3>

            <p>
                Lee el PDF, escucha el audio, descarga los recursos o comparte cada sección. También puedes abrir las píldoras espirituales del libro completo.
            </p>

            <div class="acciones-libro-premium">

                <button
                type="button"
                class="btn-pildoras-libro-premium"
                onclick="abrirPildoras('${libro.id}')">
                    💡 Abrir píldoras del libro
                </button>

                <button
                type="button"
                class="btn-test-libro-premium"
                onclick="abrirTestLibro('${libro.id}')">
                    🧠 Test del Libro
                </button>

            </div>

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

        const tituloCompartir =
        `${libro.titulo} - ${capitulo.tipo} ${capitulo.titulo}`;

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

            <div class="chapter-actions chapter-actions-mejorado">

                ${
                    tienePdf
                    ? `
                        <div class="recurso-box recurso-pdf-box">

                            <span class="recurso-titulo">
                                📖 Documento PDF
                            </span>

                            <div class="recurso-botones">

                                <a
                                href="${capitulo.pdf}"
                                target="_blank"
                                class="btn-secondary btn-recurso">
                                    Leer PDF
                                </a>

                                <button
                                type="button"
                                class="btn-secondary btn-recurso"
                                onclick="descargarRecurso('${capitulo.pdf}','${crearNombreArchivo(libro.titulo, capitulo.titulo, 'pdf')}')">
                                    Descargar PDF
                                </button>

                                <button
                                type="button"
                                class="btn-secondary btn-recurso btn-recurso-share"
                                onclick="compartirRecurso('${tituloCompartir}','${capitulo.pdf}','PDF')">
                                    Compartir PDF
                                </button>

                            </div>

                        </div>
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
                        <div class="recurso-box recurso-audio-box">

                            <span class="recurso-titulo">
                                🎧 Audio del capítulo
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

                            <div class="recurso-botones recurso-botones-audio">

                                <button
                                type="button"
                                class="btn-secondary btn-recurso"
                                onclick="descargarRecurso('${capitulo.audio}','${crearNombreArchivo(libro.titulo, capitulo.titulo, 'mp3')}')">
                                    Descargar audio
                                </button>

                                <button
                                type="button"
                                class="btn-secondary btn-recurso btn-recurso-share"
                                onclick="compartirRecurso('${tituloCompartir}','${capitulo.audio}','Audio')">
                                    Compartir audio
                                </button>

                            </div>

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
   RESUMEN Y BÚSQUEDA AUDIOLIBROS
===================================== */

function actualizarResumenAudiolibros(){

    const totalLibros =
    document.getElementById("totalAudiolibrosVista");

    const totalCapitulos =
    document.getElementById("totalCapitulosVista");

    if(totalLibros){

        totalLibros.textContent =
        Array.isArray(audiolibros)
        ? audiolibros.length
        : 0;

    }

    if(totalCapitulos){

        const total =
        Array.isArray(audiolibros)
        ? audiolibros.reduce(
            (suma, libro) => {

                return suma + (
                    Array.isArray(libro.capitulos)
                    ? libro.capitulos.length
                    : 0
                );

            },
            0
        )
        : 0;

        totalCapitulos.textContent =
        total;

    }

}

function configurarBusquedaAudiolibros(){

    const input =
    document.getElementById("buscarAudiolibros");

    const limpiar =
    document.getElementById("limpiarBusquedaAudiolibros");

    if(!input){

        return;

    }

    input.addEventListener(
        "input",
        () => {

            filtrarAudiolibros(
                input.value
            );

        }
    );

    if(limpiar){

        limpiar.addEventListener(
            "click",
            () => {

                input.value = "";

                filtrarAudiolibros("");

                input.focus();

            }
        );

    }

}

function filtrarAudiolibros(texto){

    const busqueda =
    String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

    if(!busqueda){

        audiolibrosFiltrados =
        audiolibros;

        renderizarBibliotecaAudiolibros();

        return;

    }

    audiolibrosFiltrados =
    audiolibros.filter(
        (libro) => {

            const contenido =
            [
                libro.titulo,
                libro.autor,
                libro.descripcion
            ]
            .join(" ")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

            return contenido.includes(
                busqueda
            );

        }
    );

    renderizarBibliotecaAudiolibros();

}


/* =====================================
   DESCARGAR PDF / AUDIO
===================================== */

function descargarRecurso(ruta, nombreArchivo){

    if(!ruta){

        alert(
            "Este recurso no está disponible."
        );

        return;

    }

    const enlace =
    document.createElement("a");

    enlace.href =
    ruta;

    enlace.download =
    nombreArchivo || "";

    enlace.target =
    "_blank";

    document.body.appendChild(
        enlace
    );

    enlace.click();

    document.body.removeChild(
        enlace
    );

}

/* =====================================
   COMPARTIR PDF / AUDIO
===================================== */

async function compartirRecurso(titulo, ruta, tipo){

    if(!ruta){

        alert(
            "Este recurso no está disponible para compartir."
        );

        return;

    }

    const urlAbsoluta =
    new URL(
        ruta,
        window.location.href
    ).href;

    const texto =
`${tipo} — ${titulo}

${urlAbsoluta}

Constructores del Reino`;

    if(navigator.share){

        try{

            await navigator.share({
                title:
                titulo,

                text:
                texto,

                url:
                urlAbsoluta
            });

            return;

        }

        catch(error){

            console.log(
                "Compartir cancelado o no disponible:",
                error
            );

        }

    }

    const whatsapp =
    `https://wa.me/?text=${encodeURIComponent(texto)}`;

    window.open(
        whatsapp,
        "_blank"
    );

}

/* =====================================
   CREAR NOMBRE DE ARCHIVO
===================================== */

function crearNombreArchivo(tituloLibro, tituloCapitulo, extension){

    const base =
    `${tituloLibro}-${tituloCapitulo}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

    return `${base}.${extension}`;

}



/* =====================================
   ABRIR TEST DEL LIBRO
===================================== */

function abrirTestLibro(idLibro){

    if(!idLibro){

        alert(
            "No se pudo identificar el libro seleccionado."
        );

        return;

    }

    window.location.href =
    `tests.html?libro=${encodeURIComponent(idLibro)}`;

}

/* =====================================
   ABRIR PÍLDORAS
   Carga un archivo independiente por libro:
   data/pildoras/libro-1.json
   data/pildoras/libro-2.json
   data/pildoras/libro-3.json
===================================== */

async function abrirPildoras(idLibro){

    if(!idLibro){

        alert(
            "No se pudo identificar el libro seleccionado."
        );

        return;

    }

    try{

        const rutaPildoras =
        `./data/pildoras/${idLibro}.json`;

        const respuesta =
        await fetch(
            rutaPildoras,
            {
                cache:"no-store"
            }
        );

        if(!respuesta.ok){

            throw new Error(
                `No se encontró ${rutaPildoras}`
            );

        }

        libroPildorasActivo =
        await respuesta.json();

    }catch(error){

        console.error(
            "Error cargando píldoras:",
            error
        );

        alert(
            "Este libro todavía no tiene píldoras disponibles o el archivo no está en data/pildoras/"
        );

        return;

    }

    if(
        !libroPildorasActivo ||
        !Array.isArray(libroPildorasActivo.pildoras)
    ){

        alert(
            "El archivo de píldoras existe, pero no tiene la estructura correcta."
        );

        return;

    }

    tituloPildoras.textContent =
    libroPildorasActivo.titulo ||
    "Píldoras espirituales";

    descripcionPildoras.textContent =
    "Frases destacadas y respuestas espirituales del audiolibro.";

    contenidoPildoras.innerHTML = "";

    libroPildorasActivo.pildoras.forEach(
        (bloque) => {

        const section =
        document.createElement("section");

        section.className =
        "pildora-section";

        const frases =
        Array.isArray(bloque.frases)
        ? bloque.frases
        : [];

        const frasesHtml =
        frases.map(
            (item) => {

                if(typeof item === "string"){

                    return `
                        <div class="pildora-item">

                            <div class="pildora-exportable">

                                <div class="pildora-frase">

                                    💬 ${item}

                                </div>

                                <div class="pildora-marca">

                                    Constructores del Reino

                                </div>

                            </div>

                            <div class="pildora-acciones-individuales">

                                <button
                                type="button"
                                class="btn-pildora-mini"
                                onclick="descargarPildoraIndividual(this)">

                                    📥 Descargar

                                </button>

                                <button
                                type="button"
                                class="btn-pildora-mini btn-pildora-mini-share"
                                onclick="compartirPildoraIndividual(this)">

                                    📲 Compartir

                                </button>

                            </div>

                        </div>
                    `;

                }

                return `

                    <div class="pildora-item">

                        <div class="pildora-exportable">

                            <div class="pildora-frase">

                                💬 ${item.frase || ""}

                            </div>

                            ${
                                item.referencia
                                ? `
                                    <div class="pildora-referencia">

                                        📖 ${item.referencia}

                                    </div>
                                `
                                : ""
                            }

                            ${
                                item.texto_biblico
                                ? `
                                    <div class="pildora-texto-biblico">

                                        “${item.texto_biblico}”

                                    </div>
                                `
                                : ""
                            }

                            ${
                                item.respuesta
                                ? `
                                    <div class="pildora-respuesta">

                                        ➡️ ${item.respuesta}

                                    </div>
                                `
                                : ""
                            }

                            <div class="pildora-marca">

                                Constructores del Reino

                            </div>

                        </div>

                        <div class="pildora-acciones-individuales">

                            <button
                            type="button"
                            class="btn-pildora-mini"
                            onclick="descargarPildoraIndividual(this)">

                                📥 Descargar

                            </button>

                            <button
                            type="button"
                            class="btn-pildora-mini btn-pildora-mini-share"
                            onclick="compartirPildoraIndividual(this)">

                                📲 Compartir

                            </button>

                        </div>

                    </div>

                `;

            }
        ).join("");

        section.innerHTML = `

            <div class="pildora-header">

                <span class="audiolibro-badge">
                    ${bloque.seccion || "Sección"}
                </span>

                <h3>
                    ${bloque.titulo || ""}
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
   DESCARGAR PÍLDORAS COMO IMAGEN
   Exporta todo el bloque si decides usar botones generales.
===================================== */

async function descargarPildorasComoImagen(){

    if(!areaExportarPildoras){

        alert(
            "No se encontró el área para exportar."
        );

        return;

    }

    if(typeof html2canvas === "undefined"){

        alert(
            "No se pudo cargar la herramienta de descarga. Verifica tu conexión a internet."
        );

        return;

    }

    prepararExportacionPildoras(true);

    try{

        const canvas =
        await html2canvas(
            areaExportarPildoras,
            {
                backgroundColor: "#ffffff",
                scale: 2,
                useCORS: true,
                logging: false
            }
        );

        const enlace =
        document.createElement("a");

        const nombreArchivo =
        obtenerNombreArchivoPildoras();

        enlace.download =
        `${nombreArchivo}.png`;

        enlace.href =
        canvas.toDataURL("image/png");

        enlace.click();

    }

    catch(error){

        console.error(
            "Error descargando pildoras:",
            error
        );

        alert(
            "No se pudo descargar la imagen. Intenta nuevamente."
        );

    }

    finally{

        prepararExportacionPildoras(false);

    }

}

/* =====================================
   DESCARGAR PÍLDORA INDIVIDUAL
===================================== */

async function descargarPildoraIndividual(boton){

    const item =
    boton.closest(".pildora-item");

    if(!item){

        alert(
            "No se encontró la píldora para descargar."
        );

        return;

    }

    const card =
    item.querySelector(".pildora-exportable");

    if(!card){

        alert(
            "No se encontró la tarjeta exportable."
        );

        return;

    }

    if(typeof html2canvas === "undefined"){

        alert(
            "No se pudo cargar la herramienta de descarga. Verifica tu conexión a internet."
        );

        return;

    }

    card.classList.add(
        "pildora-individual-exportando"
    );

    try{

        const canvas =
        await html2canvas(
            card,
            {
                backgroundColor:"#ffffff",
                scale:2,
                useCORS:true,
                logging:false
            }
        );

        const enlace =
        document.createElement("a");

        enlace.download =
        "pildora-espiritual.png";

        enlace.href =
        canvas.toDataURL("image/png");

        enlace.click();

    }

    catch(error){

        console.error(
            "Error descargando pildora individual:",
            error
        );

        alert(
            "No se pudo descargar esta píldora. Intenta nuevamente."
        );

    }

    finally{

        card.classList.remove(
            "pildora-individual-exportando"
        );

    }

}

/* =====================================
   COMPARTIR PÍLDORA INDIVIDUAL
===================================== */

async function compartirPildoraIndividual(boton){

    const card =
    boton.closest(".pildora-item");

    if(!card){

        alert(
            "No se encontró la píldora para compartir."
        );

        return;

    }

    const frase =
    card.querySelector(".pildora-frase")
    ?.innerText || "";

    const respuesta =
    card.querySelector(".pildora-respuesta")
    ?.innerText || "";

    const texto =
`${frase}

${respuesta}

Constructores del Reino`;

    if(navigator.share){

        try{

            await navigator.share({
                title:
                "Píldora espiritual",

                text:
                texto
            });

            return;

        }

        catch(error){

            console.log(
                "Compartir cancelado o no disponible:",
                error
            );

        }

    }

    const whatsapp =
    `https://wa.me/?text=${encodeURIComponent(texto)}`;

    window.open(
        whatsapp,
        "_blank"
    );

}

/* =====================================
   COMPARTIR PÍLDORAS
   Comparte resumen general si decides usar botones generales.
===================================== */

async function compartirPildoras(){

    const texto =
    obtenerTextoPildorasParaCompartir();

    if(navigator.share){

        try{

            await navigator.share({
                title:
                libroPildorasActivo
                ? libroPildorasActivo.titulo
                : "Píldoras espirituales",

                text:
                texto
            });

            return;

        }

        catch(error){

            console.log(
                "Compartir cancelado o no disponible:",
                error
            );

        }

    }

    const urlWhatsApp =
    `https://wa.me/?text=${encodeURIComponent(texto)}`;

    window.open(
        urlWhatsApp,
        "_blank"
    );

}

/* =====================================
   TEXTO PARA COMPARTIR
===================================== */

function obtenerTextoPildorasParaCompartir(){

    if(!libroPildorasActivo){

        return "Píldoras espirituales";

    }

    let texto =
    `💡 Píldoras espirituales — ${libroPildorasActivo.titulo}\n\n`;

    libroPildorasActivo.pildoras.forEach(
        (bloque) => {

        texto +=
        `📖 ${bloque.seccion} — ${bloque.titulo}\n`;

        const frases =
        Array.isArray(bloque.frases)
        ? bloque.frases
        : [];

        frases.slice(0, 3).forEach(
            (item) => {

            if(typeof item === "string"){

                texto +=
                `💬 ${item}\n`;

            }

            else{

                texto +=
                `💬 ${item.frase || ""}\n`;

                if(item.referencia){

                    texto +=
                    `📖 ${item.referencia}\n`;

                }

                if(item.texto_biblico){

                    texto +=
                    `“${item.texto_biblico}”\n`;

                }

                if(item.respuesta){

                    texto +=
                    `➡️ ${item.respuesta}\n`;

                }

            }

        });

        texto += "\n";

    });

    texto +=
    "Constructores del Reino";

    return texto;

}


/* =====================================
   NOMBRE ARCHIVO
===================================== */

function obtenerNombreArchivoPildoras(){

    const titulo =
    libroPildorasActivo
    ? libroPildorasActivo.titulo
    : "pildoras";

    return titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

}

/* =====================================
   PREPARAR EXPORTACIÓN
===================================== */

function prepararExportacionPildoras(estado){

    if(!areaExportarPildoras) return;

    if(estado){

        areaExportarPildoras.classList.add(
            "exportando-pildoras"
        );

    }

    else{

        areaExportarPildoras.classList.remove(
            "exportando-pildoras"
        );

    }

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

    if(btnDescargarPildoras){

        btnDescargarPildoras
        .addEventListener(
            "click",
            descargarPildorasComoImagen
        );

    }

    if(btnCompartirPildoras){

        btnCompartirPildoras
        .addEventListener(
            "click",
            compartirPildoras
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
