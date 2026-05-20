// =====================================
// AUDIO GLOBAL
// =====================================

let audioActual = null;

// =====================================
// REPRODUCIR AUDIO
// =====================================

function reproducirAudio(rutaAudio){

    // =====================================
    // VALIDAR RUTA
    // =====================================

    if(!rutaAudio || rutaAudio === ""){

        alert(
            "Esta declaración todavía no tiene audio disponible."
        );

        return;

    }

    // =====================================
    // DETENER AUDIO ANTERIOR
    // =====================================

    if(audioActual){

        audioActual.pause();

        audioActual.currentTime = 0;

    }

    // =====================================
    // CREAR AUDIO
    // =====================================

    audioActual = new Audio(rutaAudio);

    // =====================================
    // REPRODUCIR
    // =====================================

    audioActual.play()

    .then(() => {

        console.log(
            "Audio reproduciéndose..."
        );

    })

    .catch(error => {

        console.error(
            "Error reproduciendo audio:",
            error
        );

        alert(
            "No se pudo reproducir el audio."
        );

    });

}

// =====================================
// PAUSAR AUDIO
// =====================================

function pausarAudio(){

    if(audioActual){

        audioActual.pause();

    }

}

// =====================================
// DETENER AUDIO
// =====================================

function detenerAudio(){

    if(audioActual){

        audioActual.pause();

        audioActual.currentTime = 0;

    }

}

// =====================================
// VERIFICAR SI EXISTE AUDIO
// =====================================

async function existeAudio(ruta){

    try{

        const respuesta = await fetch(ruta);

        return respuesta.ok;

    }catch(error){

        return false;

    }

}

// =====================================
// EXPORTAR FUNCIONES
// =====================================

window.audioApp = {

    reproducirAudio,
    pausarAudio,
    detenerAudio,
    existeAudio

};