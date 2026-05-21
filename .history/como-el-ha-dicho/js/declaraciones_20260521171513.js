// =====================================
// OBTENER TODAS LAS DECLARACIONES
// =====================================

async function obtenerDeclaraciones(){

    try{

        const respuesta = await fetch('./data/declaraciones.json');

        const declaraciones = await respuesta.json();

        return declaraciones;

    }catch(error){

        console.error('Error cargando declaraciones:', error);

        return [];

    }

}

// =====================================
// OBTENER DECLARACIÓN POR ID
// =====================================

async function obtenerDeclaracionPorId(id){

    const declaraciones = await obtenerDeclaraciones();

    return declaraciones.find(
        declaracion => declaracion.id == id
    );

}

// =====================================
// OBTENER DECLARACIONES POR CATEGORÍA
// =====================================

async function obtenerDeclaracionesPorCategoria(categoriaId){

    const declaraciones = await obtenerDeclaraciones();

    return declaraciones.filter(
        declaracion => declaracion.categoria_id == categoriaId
    );

}

// =====================================
// BUSCAR DECLARACIONES
// =====================================

async function buscarDeclaraciones(textoBusqueda){

    const declaraciones = await obtenerDeclaraciones();

    const texto = textoBusqueda.toLowerCase();

    return declaraciones.filter(item => {

        return (

            item.titulo.toLowerCase().includes(texto)

            ||

            item.como_el_ha_dicho.toLowerCase().includes(texto)

            ||

            item.podemos_decir_confiadamente.toLowerCase().includes(texto)

            ||

            item.referencia.toLowerCase().includes(texto)

        );

    });

}

// =====================================
// LIMPIAR NOMBRE DE ARCHIVO
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

// =====================================
// OBTENER EXTENSIÓN DE AUDIO
// =====================================

function obtenerExtensionAudio(rutaAudio){

    const ruta =
    String(rutaAudio || '').split('?')[0].split('#')[0];

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

// =====================================
// OBTENER MIME DE AUDIO
// =====================================

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

// =====================================
// CREAR ARCHIVO REAL DE AUDIO
// =====================================

async function crearArchivoAudioDeclaracion(declaracion){

    if(!declaracion || !declaracion.audio_url){

        alert(
            'Esta declaración todavía no tiene audio disponible.'
        );

        return null;

    }

    try{

        const respuesta =
        await fetch(
            declaracion.audio_url
        );

        if(!respuesta.ok){

            throw new Error(
                'No se pudo descargar el audio.'
            );

        }

        const blob =
        await respuesta.blob();

        const extension =
        obtenerExtensionAudio(
            declaracion.audio_url
        );

        const nombreArchivo =
        limpiarNombreArchivoAudio(
            `Audio_${declaracion.titulo || 'declaracion'}.${extension}`
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
            'Error creando archivo de audio:',
            error
        );

        alert(
            'No se pudo preparar el audio. Verifica que el archivo exista en la ruta indicada.'
        );

        return null;

    }

}

// =====================================
// DESCARGAR AUDIO DE DECLARACIÓN
// =====================================

async function descargarAudioDeclaracion(idDeclaracion){

    const declaracion =
    typeof idDeclaracion === 'object'
    ? idDeclaracion
    : await obtenerDeclaracionPorId(idDeclaracion);

    const archivoAudio =
    await crearArchivoAudioDeclaracion(
        declaracion
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

// =====================================
// COMPARTIR AUDIO DE DECLARACIÓN
// Método seguro:
// 1. Intenta compartir el audio como archivo real.
// 2. No envía enlaces.
// 3. Si el celular no permite compartir,
//    descarga el audio para enviarlo manualmente.
// =====================================

async function compartirAudioDeclaracion(idDeclaracion){

    const declaracion =
    typeof idDeclaracion === 'object'
    ? idDeclaracion
    : await obtenerDeclaracionPorId(idDeclaracion);

    const archivoAudio =
    await crearArchivoAudioDeclaracion(
        declaracion
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

        await descargarAudioDeclaracion(
            declaracion
        );

        alert(
            'El audio fue descargado correctamente. Ahora abre WhatsApp y adjúntalo desde Descargas como archivo.'
        );

    }catch(error){

        console.error(
            'Error compartiendo audio:',
            error
        );

        await descargarAudioDeclaracion(
            declaracion
        );

        alert(
            'No se pudo compartir automáticamente. El audio fue descargado para enviarlo manualmente desde WhatsApp.'
        );

    }

}

// =====================================
// CREAR BOTÓN DESCARGAR AUDIO
// Esta función se puede usar en la tarjeta
// donde hoy aparece “Escuchar Audio”.
// =====================================

function crearBotonDescargarAudio(declaracion){

    const boton =
    document.createElement('button');

    boton.type =
    'button';

    boton.className =
    'btn-descargar-audio';

    boton.innerHTML =
    '⬇️ Descargar Audio';

    boton.addEventListener('click', event => {

        event.stopPropagation();

        descargarAudioDeclaracion(
            declaracion
        );

    });

    return boton;

}

// =====================================
// CREAR BOTÓN COMPARTIR AUDIO
// =====================================

function crearBotonCompartirAudio(declaracion){

    const boton =
    document.createElement('button');

    boton.type =
    'button';

    boton.className =
    'btn-compartir-audio';

    boton.innerHTML =
    '📤 Compartir Audio';

    boton.addEventListener('click', event => {

        event.stopPropagation();

        compartirAudioDeclaracion(
            declaracion
        );

    });

    return boton;

}

// =====================================
// EXPORTAR FUNCIONES
// =====================================

window.declaracionesApp = {

    obtenerDeclaraciones,
    obtenerDeclaracionPorId,
    obtenerDeclaracionesPorCategoria,
    buscarDeclaraciones,
    crearArchivoAudioDeclaracion,
    descargarAudioDeclaracion,
    compartirAudioDeclaracion,
    crearBotonDescargarAudio,
    crearBotonCompartirAudio

};

// =====================================
// DISPONIBLE GLOBALMENTE
// =====================================

window.descargarAudioDeclaracion =
descargarAudioDeclaracion;

window.compartirAudioDeclaracion =
compartirAudioDeclaracion;

window.crearBotonDescargarAudio =
crearBotonDescargarAudio;

window.crearBotonCompartirAudio =
crearBotonCompartirAudio;