// =====================================
// OBTENER ID DESDE LA URL
// =====================================

const parametros = new URLSearchParams(window.location.search);

const categoriaId = parametros.get('id');

// =====================================
// VARIABLE GLOBAL CATEGORÍA
// =====================================

let categoriaActual = null;

// =====================================
// UTILIDADES AUDIO DESCARGAR / COMPARTIR
// Integradas en este archivo para que
// Descargar Audio y Compartir Audio
// funcionen directamente desde la tarjeta.
// =====================================

function limpiarNombreArchivoAudio(nombre){

    return String(nombre || 'audio')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .trim();

}

function obtenerExtensionAudio(rutaAudio){

    const ruta =
    String(rutaAudio || '')
    .split('?')[0]
    .split('#')[0];

    const partes =
    ruta.split('.');

    const extension =
    partes.length > 1
    ? partes.pop().toLowerCase()
    : 'mp3';

    if(
        extension === 'mp3' ||
        extension === 'wav' ||
        extension === 'm4a' ||
        extension === 'aac' ||
        extension === 'ogg'
    ){

        return extension;

    }

    return 'mp3';

}

function obtenerMimeAudio(extension){

    const tipos = {

        mp3:'audio/mpeg',
        wav:'audio/wav',
        m4a:'audio/mp4',
        aac:'audio/aac',
        ogg:'audio/ogg'

    };

    return tipos[extension] || 'audio/mpeg';

}

async function crearArchivoAudioDesdeRuta(rutaAudio, titulo){

    if(!rutaAudio){

        alert(
            'Este audio aún no tiene ruta disponible.'
        );

        return null;

    }

    try{

        const respuesta =
        await fetch(
            rutaAudio,
            {
                cache:'no-store'
            }
        );

        if(!respuesta.ok){

            throw new Error(
                'Audio no encontrado: ' + rutaAudio
            );

        }

        const blob =
        await respuesta.blob();

        const extension =
        obtenerExtensionAudio(
            rutaAudio
        );

        const nombreArchivo =
        limpiarNombreArchivoAudio(
            `Audio_${titulo || 'declaracion'}.${extension}`
        );

        return new File(
            [blob],
            nombreArchivo,
            {
                type:
                obtenerMimeAudio(extension)
            }
        );

    }catch(error){

        console.error(
            'Error preparando audio:',
            error
        );

        alert(
            'No se pudo preparar el audio. Verifica que el archivo exista en la carpeta correcta y que los cambios ya estén subidos a GitHub.'
        );

        return null;

    }

}

async function descargarAudioDesdeRuta(rutaAudio, titulo){

    const archivoAudio =
    await crearArchivoAudioDesdeRuta(
        rutaAudio,
        titulo
    );

    if(!archivoAudio){

        return;

    }

    const urlTemporal =
    URL.createObjectURL(
        archivoAudio
    );

    const enlace =
    document.createElement('a');

    enlace.href =
    urlTemporal;

    enlace.download =
    archivoAudio.name;

    document.body.appendChild(
        enlace
    );

    enlace.click();

    enlace.remove();

    setTimeout(() => {

        URL.revokeObjectURL(
            urlTemporal
        );

    }, 1500);

}

async function compartirAudioDesdeRuta(rutaAudio, titulo){

    const archivoAudio =
    await crearArchivoAudioDesdeRuta(
        rutaAudio,
        titulo
    );

    if(!archivoAudio){

        return;

    }

    try{

        if(
            navigator.share &&
            navigator.canShare &&
            navigator.canShare({
                files:[archivoAudio]
            })
        ){

            await navigator.share({

                files:
                [archivoAudio]

            });

            return;

        }

        await descargarAudioDesdeRuta(
            rutaAudio,
            titulo
        );

        alert(
            'El audio fue descargado correctamente. Ahora abre WhatsApp y adjúntalo desde Descargas como archivo.'
        );

    }catch(error){

        console.error(
            'Error compartiendo audio:',
            error
        );

        await descargarAudioDesdeRuta(
            rutaAudio,
            titulo
        );

        alert(
            'No se pudo compartir automáticamente. El audio fue descargado para enviarlo manualmente desde WhatsApp.'
        );

    }

}

// =====================================
// DISPONIBLE GLOBALMENTE
// =====================================

window.descargarAudioDesdeRuta =
descargarAudioDesdeRuta;

window.compartirAudioDesdeRuta =
compartirAudioDesdeRuta;



// =====================================
// ESTADO DECLARACIONES
// =====================================

let categoriasGlobales =
[];

let declaracionesGlobales =
[];

let declaracionesCategoriaActual =
[];

// =====================================
// ICONOS POR CATEGORÍA
// =====================================

function obtenerIconoCategoriaDeclaraciones(id){

    const iconos = {

        1:'./assets/icons/profile.png',
        2:'./assets/icons/favorite.png',
        3:'./assets/icons/search.png',
        4:'./assets/icons/home.png',
        5:'./assets/icons/favorite.png',
        6:'./assets/icons/profile.png',
        7:'./assets/icons/play.png',
        8:'./assets/icons/back.png',
        9:'./assets/icons/home.png',
        10:'./assets/icons/favorite.png',
        11:'./assets/icons/search.png',
        12:'./assets/icons/play.png',
        13:'./assets/icons/profile.png',
        14:'./assets/icons/home.png',
        15:'./assets/icons/back.png'

    };

    return iconos[id] || './assets/icons/home.png';

}

// =====================================
// CARGAR DATOS
// =====================================

async function cargarDeclaraciones(){

    try{

        const respuestaCategorias =
        await fetch('./data/categorias.json');

        categoriasGlobales =
        await respuestaCategorias.json();

        const respuestaDeclaraciones =
        await fetch('./data/declaraciones.json');

        declaracionesGlobales =
        await respuestaDeclaraciones.json();

        actualizarResumenDeclaraciones();

        if(categoriaId){

            cargarCategoriaPorId(
                categoriaId
            );

        }else{

            mostrarPortadaCategorias();

        }

    }catch(error){

        console.error(
            'Error cargando declaraciones:',
            error
        );

    }

}

// =====================================
// RESUMEN
// =====================================

function actualizarResumenDeclaraciones(){

    const totalCategorias =
    document.getElementById(
        'totalCategoriasDeclaraciones'
    );

    const totalDeclaraciones =
    document.getElementById(
        'totalDeclaracionesVista'
    );

    if(totalCategorias){

        totalCategorias.textContent =
        Array.isArray(categoriasGlobales)
        ? categoriasGlobales.length
        : 0;

    }

    if(totalDeclaraciones){

        totalDeclaraciones.textContent =
        Array.isArray(declaracionesGlobales)
        ? declaracionesGlobales.length
        : 0;

    }

}

// =====================================
// MOSTRAR PORTADA DE CATEGORÍAS
// =====================================

function mostrarPortadaCategorias(){

    const titulo =
    document.getElementById(
        'titulo-categoria'
    );

    const subtitulo =
    document.getElementById(
        'subtitulo-categoria'
    );

    const declaracionesToolbar =
    document.getElementById(
        'declaraciones-toolbar'
    );

    const declaracionesContainer =
    document.getElementById(
        'declaraciones-container'
    );

    if(titulo){

        titulo.innerText =
        'Declaraciones Bíblicas';

    }

    if(subtitulo){

        subtitulo.innerText =
        'Escoge una categoría para fortalecer tu fe, tu hogar y tu caminar con Dios.';

    }

    if(declaracionesToolbar){

        declaracionesToolbar.classList.add(
            'oculto'
        );

    }

    if(declaracionesContainer){

        declaracionesContainer.innerHTML =
        '';

    }

    renderizarCategoriasDeclaraciones(
        categoriasGlobales
    );

    prepararBusquedaCategoriasDeclaraciones();

}

// =====================================
// RENDERIZAR CATEGORÍAS
// =====================================

function renderizarCategoriasDeclaraciones(categorias){

    const container =
    document.getElementById(
        'categorias-declaraciones-container'
    );

    if(!container){

        return;

    }

    container.innerHTML =
    '';

    if(!Array.isArray(categorias) || categorias.length === 0){

        container.innerHTML =
        '<div class="sin-resultados-home">No encontramos categorías.</div>';

        return;

    }

    categorias.forEach(categoria => {

        const card =
        document.createElement('article');

        card.className =
        'categoria-card categoria-declaracion-card';

        const icono =
        obtenerIconoCategoriaDeclaraciones(
            categoria.id
        );

        const total =
        declaracionesGlobales.filter(
            item => String(item.categoria_id) === String(categoria.id)
        ).length;

        card.innerHTML = `

            <div class="card-icon">

                <img src="${icono}" alt="${categoria.nombre}">

            </div>

            <div class="card-info">

                <span class="categoria-declaracion-badge">
                    ${total} declaraciones
                </span>

                <h2>
                    ${categoria.nombre}
                </h2>

                <p>
                    ${categoria.descripcion}
                </p>

                <div class="categoria-declaracion-link">
                    Abrir categoría →
                </div>

            </div>

        `;

        card.addEventListener(
            'click',
            () => {

                window.location.href =
                `categorias.html?id=${categoria.id}`;

            }
        );

        container.appendChild(
            card
        );

    });

}

// =====================================
// CARGAR CATEGORÍA POR ID
// =====================================

function cargarCategoriaPorId(id){

    categoriaActual =
    categoriasGlobales.find(
        item => String(item.id) === String(id)
    );

    if(!categoriaActual){

        mostrarPortadaCategorias();

        return;

    }

    const portada =
    document.getElementById(
        'declaraciones-portada'
    );

    const toolbarCategorias =
    document.getElementById(
        'declaraciones-categorias-toolbar'
    );

    const categoriasContainer =
    document.getElementById(
        'categorias-declaraciones-container'
    );

    const declaracionesToolbar =
    document.getElementById(
        'declaraciones-toolbar'
    );

    const titulo =
    document.getElementById(
        'titulo-categoria'
    );

    const subtitulo =
    document.getElementById(
        'subtitulo-categoria'
    );

    const tituloSeleccionada =
    document.getElementById(
        'tituloCategoriaSeleccionada'
    );

    if(portada){

        portada.classList.add(
            'oculto'
        );

    }

    if(toolbarCategorias){

        toolbarCategorias.classList.add(
            'oculto'
        );

    }

    if(categoriasContainer){

        categoriasContainer.innerHTML =
        '';

    }

    if(declaracionesToolbar){

        declaracionesToolbar.classList.remove(
            'oculto'
        );

    }

    if(titulo){

        titulo.innerText =
        categoriaActual.nombre;

    }

    if(subtitulo){

        subtitulo.innerText =
        categoriaActual.descripcion ||
        'Declaraciones bíblicas para fortalecer tu fe.';

    }

    if(tituloSeleccionada){

        tituloSeleccionada.innerText =
        categoriaActual.nombre;

    }

    declaracionesCategoriaActual =
    declaracionesGlobales.filter(
        declaracion =>
        String(declaracion.categoria_id) === String(id)
    );

    mostrarDeclaraciones(
        declaracionesCategoriaActual
    );

    prepararBusquedaDeclaracionesCategoria();

}

// =====================================
// BÚSQUEDA CATEGORÍAS
// =====================================

function prepararBusquedaCategoriasDeclaraciones(){

    const input =
    document.getElementById(
        'buscarCategoriasDeclaraciones'
    );

    const limpiar =
    document.getElementById(
        'limpiarCategoriasDeclaraciones'
    );

    if(!input){

        return;

    }

    input.addEventListener(
        'input',
        () => {

            const texto =
            normalizarBusqueda(
                input.value
            );

            const filtradas =
            categoriasGlobales.filter(
                categoria => {

                    const contenido =
                    normalizarBusqueda(
                        `${categoria.nombre} ${categoria.descripcion}`
                    );

                    return contenido.includes(
                        texto
                    );

                }
            );

            renderizarCategoriasDeclaraciones(
                filtradas
            );

        }
    );

    if(limpiar){

        limpiar.addEventListener(
            'click',
            () => {

                input.value = '';

                renderizarCategoriasDeclaraciones(
                    categoriasGlobales
                );

                input.focus();

            }
        );

    }

}

// =====================================
// BÚSQUEDA DECLARACIONES
// =====================================

function prepararBusquedaDeclaracionesCategoria(){

    const input =
    document.getElementById(
        'buscarDeclaracionesCategoria'
    );

    const limpiar =
    document.getElementById(
        'limpiarDeclaracionesCategoria'
    );

    if(!input){

        return;

    }

    input.addEventListener(
        'input',
        () => {

            const texto =
            normalizarBusqueda(
                input.value
            );

            const filtradas =
            declaracionesCategoriaActual.filter(
                item => {

                    const contenido =
                    normalizarBusqueda(
                        `${item.titulo} ${item.como_el_ha_dicho} ${item.referencia} ${item.podemos_decir_confiadamente}`
                    );

                    return contenido.includes(
                        texto
                    );

                }
            );

            mostrarDeclaraciones(
                filtradas
            );

        }
    );

    if(limpiar){

        limpiar.addEventListener(
            'click',
            () => {

                input.value = '';

                mostrarDeclaraciones(
                    declaracionesCategoriaActual
                );

                input.focus();

            }
        );

    }

}

function normalizarBusqueda(texto){

    return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

}

// =====================================
// MOSTRAR DECLARACIONES
// =====================================

function mostrarDeclaraciones(declaraciones){

    const container =
    document.getElementById(
        'declaraciones-container'
    );

    if(!container){

        return;

    }

    container.innerHTML = '';

    if(declaraciones.length === 0){

        container.innerHTML = `

            <div class="categoria-card">

                <h2>
                    No hay declaraciones
                </h2>

                <p>
                    Esta categoría todavía no tiene contenido o no coincide con la búsqueda.
                </p>

            </div>

        `;

        return;

    }

    declaraciones.forEach(item => {

        const card =
        document.createElement('div');

        card.classList.add(
            'categoria-card',
            'declaracion-card-reino'
        );

        let rutaAudio = '';

        if(categoriaActual){

            rutaAudio =
            `./assets/audio/${categoriaActual.audio_carpeta}/${item.id}.mp3`;

        }

        card.innerHTML = `

            <div class="declaracion-header">

                <div class="card-icon small-icon">

                    <img
                    src="./assets/icons/favorite.png"
                    alt="Declaración">

                </div>

                <h2>${item.titulo}</h2>

                <span class="toggle-icon">+</span>

            </div>

            <div class="declaracion-contenido oculto">

                <div class="declaracion-bloque-reino">

                    <span>
                        Como Él ha dicho
                    </span>

                    <p>
                        “${item.como_el_ha_dicho}”
                    </p>

                    <strong>
                        ${item.referencia}
                    </strong>

                </div>

                <div class="declaracion-bloque-reino declaracion">

                    <span>
                        Podemos decir confiadamente
                    </span>

                    <p>
                        “${item.podemos_decir_confiadamente}”
                    </p>

                </div>

                <button class="audio-btn">
                    ▶ Escuchar Audio
                </button>

                <button class="btn-descargar-audio">
                    ⬇️ Descargar Audio
                </button>

                <button class="btn-compartir-audio">
                    📤 Compartir Audio
                </button>

                <button class="btn-descargar-pdf">
                    📄 Descargar en PDF
                </button>

                <button class="btn-favorito">
                    ❤️ Guardar Favorito
                </button>

            </div>

        `;

        const header =
        card.querySelector(
            '.declaracion-header'
        );

        const contenido =
        card.querySelector(
            '.declaracion-contenido'
        );

        const icono =
        card.querySelector(
            '.toggle-icon'
        );

        const btnFavorito =
        card.querySelector(
            '.btn-favorito'
        );

        const btnDescargarPdf =
        card.querySelector(
            '.btn-descargar-pdf'
        );

        const btnDescargarAudio =
        card.querySelector(
            '.btn-descargar-audio'
        );

        const btnCompartirAudio =
        card.querySelector(
            '.btn-compartir-audio'
        );

        const btnAudio =
        card.querySelector(
            '.audio-btn'
        );

        header.addEventListener('click', () => {

            document.querySelectorAll(
                '.declaracion-contenido'
            ).forEach(itemContenido => {

                if(itemContenido !== contenido){

                    itemContenido.classList.add(
                        'oculto'
                    );

                }

            });

            document.querySelectorAll(
                '.toggle-icon'
            ).forEach(icon => {

                if(icon !== icono){

                    icon.innerText = '+';

                }

            });

            contenido.classList.toggle(
                'oculto'
            );

            icono.innerText =
            contenido.classList.contains('oculto')
            ? '+'
            : '−';

        });

        btnFavorito.addEventListener(
            'click',
            () => {

                storageApp.agregarFavorito(
                    item
                );

                alert(
                    'Declaración guardada en favoritos'
                );

            }
        );

        btnDescargarPdf.addEventListener(
            'click',
            event => {

                event.stopPropagation();

                if(
                    typeof abrirModalPdfPalabra
                    !== 'function'
                ){

                    alert(
                        'La función PDF no está disponible.'
                    );

                    return;

                }

                abrirModalPdfPalabra({

                    titulo:
                    item.titulo,

                    texto:
                    item.como_el_ha_dicho,

                    versiculo:
                    item.referencia,

                    declaracion:
                    item.podemos_decir_confiadamente

                });

            }
        );

        btnAudio.addEventListener(
            'click',
            async event => {

                event.stopPropagation();

                if(!window.audioApp){

                    alert(
                        'El reproductor de audio no está disponible.'
                    );

                    return;

                }

                const existe =
                await audioApp.existeAudio(
                    rutaAudio
                );

                if(!existe){

                    alert(
                        'Este audio aún no existe.'
                    );

                    return;

                }

                audioApp.reproducirAudio(
                    rutaAudio
                );

            }
        );

        btnDescargarAudio.addEventListener(
            'click',
            async event => {

                event.stopPropagation();

                await descargarAudioDesdeRuta(
                    rutaAudio,
                    item.titulo
                );

            }
        );

        btnCompartirAudio.addEventListener(
            'click',
            async event => {

                event.stopPropagation();

                await compartirAudioDesdeRuta(
                    rutaAudio,
                    item.titulo
                );

            }
        );

        container.appendChild(card);

    });

}

// =====================================
// INICIAR
// =====================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        cargarDeclaraciones();

    }
);
