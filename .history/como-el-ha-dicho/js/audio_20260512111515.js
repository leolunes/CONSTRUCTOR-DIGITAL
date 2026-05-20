// =====================================
// AUDIO GLOBAL
// =====================================

let audioActual = null;

// =====================================
// REPRODUCIR AUDIO
// =====================================

function reproducirAudio(rutaAudio){

    if(!rutaAudio || rutaAudio === ""){

        alert("Esta declaración todavía no tiene audio disponible.");

        return;

    }

    if(audioActual){

        audioActual.pause();

        audioActual.currentTime = 0;

    }

    audioActual = new Audio(rutaAudio);

    audioActual.play();

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
// EXPORTAR FUNCIONES
// =====================================

window.audioApp = {

    reproducirAudio,
    pausarAudio,
    detenerAudio

};


