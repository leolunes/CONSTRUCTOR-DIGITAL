// =====================================
// OBTENER FAVORITOS
// =====================================

function obtenerFavoritos(){

    const favoritos =
    localStorage.getItem('favoritos');

    if(!favoritos){

        return [];

    }

    return JSON.parse(favoritos);

}

// =====================================
// CARGAR PERFIL
// =====================================

function cargarPerfil(){

    const favoritos =
    obtenerFavoritos();

    // =====================================
    // TOTAL FAVORITOS
    // =====================================

    document.getElementById(
        'total-favoritos'
    ).innerText = favoritos.length;

    // =====================================
    // MENSAJE PROGRESO
    // =====================================

    let mensaje = '';

    if(favoritos.length === 0){

        mensaje =
        'Comienza guardando declaraciones favoritas.';

    }else if(favoritos.length < 5){

        mensaje =
        'Vas creciendo espiritualmente paso a paso.';

    }else if(favoritos.length < 15){

        mensaje =
        'Estás fortaleciendo tu vida espiritual diariamente.';

    }else{

        mensaje =
        'Tu constancia espiritual está dando fruto.';

    }

    document.getElementById(
        'mensaje-progreso'
    ).innerText = mensaje;

}

// =====================================
// INICIAR
// =====================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        cargarPerfil();

    }
);