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
// CARGAR DECLARACIONES
// =====================================

async function cargarDeclaraciones(){

    try{

        // =====================================
        // CATEGORÍAS
        // =====================================

        const respuestaCategorias =
        await fetch('./data/categorias.json');

        const categorias =
        await respuestaCategorias.json();

        categoriaActual =
        categorias.find(
            item => item.id == categoriaId
        );

        // =====================================
        // DECLARACIONES
        // =====================================

        const respuesta =
        await fetch('./data/declaraciones.json');

        const declaraciones =
        await respuesta.json();

        const filtradas =
        declaraciones.filter(
            declaracion =>
            declaracion.categoria_id == categoriaId
        );

        mostrarDeclaraciones(filtradas);

        cargarNombreCategoria();

    }catch(error){

        console.error(
            'Error cargando declaraciones:',
            error
        );

    }

}

// =====================================
// CARGAR NOMBRE CATEGORÍA
// =====================================

async function cargarNombreCategoria(){

    try{

        const respuesta =
        await fetch('./data/categorias.json');

        const categorias =
        await respuesta.json();

        const categoria =
        categorias.find(
            item => item.id == categoriaId
        );

        if(categoria){

            document.getElementById(
                'titulo-categoria'
            ).innerText =
            categoria.nombre;

        }

    }catch(error){

        console.error(
            'Error cargando categoría:',
            error
        );

    }

}

// =====================================
// MOSTRAR DECLARACIONES
// =====================================

function mostrarDeclaraciones(declaraciones){

    const container =
    document.getElementById(
        'declaraciones-container'
    );

    container.innerHTML = '';

    // =====================================
    // SIN DECLARACIONES
    // =====================================

    if(declaraciones.length === 0){

        container.innerHTML = `

            <div class="categoria-card">

                <h2>
                    No hay declaraciones
                </h2>

                <p>
                    Esta categoría todavía
                    no tiene contenido.
                </p>

            </div>

        `;

        return;

    }

    // =====================================
    // RECORRER DECLARACIONES
    // =====================================

    declaraciones.forEach(item => {

        const card =
        document.createElement('div');

        card.classList.add(
            'categoria-card'
        );

        // =====================================
        // RUTA AUDIO AUTOMÁTICA
        // =====================================

        let rutaAudio = '';

        if(categoriaActual){

            rutaAudio =

            `./assets/audio/${categoriaActual.audio_carpeta}/${item.id}.mp3`;

        }

        // =====================================
        // HTML AUDIO
        // =====================================

        const audioHTML = `

            <button class="audio-btn">

                ▶ Escuchar Audio

            </button>

        `;

        // =====================================
        // HTML TARJETA
        // =====================================

        card.innerHTML = `

            <!-- HEADER -->

            <div class="declaracion-header">

                <div class="card-icon small-icon">

                    <img
                    src="./assets/icons/favorite.png"
                    alt="Declaración">

                </div>

                <h2>${item.titulo}</h2>

                <span class="toggle-icon">+</span>

            </div>

            <!-- CONTENIDO -->

            <div class="declaracion-contenido oculto">

                <br>

                <p>

                    <strong>
                        Como Él ha dicho:
                    </strong>

                    <br><br>

                    "${item.como_el_ha_dicho}"

                </p>

                <br>

                <p>

                    <strong>
                        ${item.referencia}
                    </strong>

                </p>

                <br>

                <p>

                    <strong>
                        Podemos decir confiadamente:
                    </strong>

                    <br><br>

                    "${item.podemos_decir_confiadamente}"

                </p>

                <br>

                ${audioHTML}

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

        // =====================================
        // ELEMENTOS
        // =====================================

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

        // =====================================
        // ABRIR / CERRAR
        // =====================================

        header.addEventListener('click', () => {

            // CERRAR TODAS
            document.querySelectorAll(
                '.declaracion-contenido'
            ).forEach(item => {

                if(item !== contenido){

                    item.classList.add(
                        'oculto'
                    );

                }

            });

            // RESET ICONOS
            document.querySelectorAll(
                '.toggle-icon'
            ).forEach(icon => {

                if(icon !== icono){

                    icon.innerText = '+';

                }

            });

            // TOGGLE
            contenido.classList.toggle(
                'oculto'
            );

            // ICONO
            if(
                contenido.classList.contains(
                    'oculto'
                )
            ){

                icono.innerText = '+';

            }else{

                icono.innerText = '−';

            }

        });

        // =====================================
        // FAVORITO
        // =====================================

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


        // =====================================
        // DESCARGAR PDF
        // =====================================

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


        // =====================================
        // AUDIO
        // =====================================

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

        // =====================================
        // DESCARGAR AUDIO
        // =====================================

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

        // =====================================
        // COMPARTIR AUDIO
        // =====================================

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

        // =====================================
        // AGREGAR TARJETA
        // =====================================

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