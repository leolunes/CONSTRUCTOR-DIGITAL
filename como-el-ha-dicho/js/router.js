// =====================================
// IR A INICIO
// =====================================

function irInicio(){

    window.location.href = 'index.html';

}

// =====================================
// IR A CATEGORÍA
// =====================================

function irCategoria(id){

    window.location.href = `categoria.html?id=${id}`;

}

// =====================================
// IR A FAVORITOS
// =====================================

function irFavoritos(){

    window.location.href = 'favoritos.html';

}

// =====================================
// IR A PERFIL
// =====================================

function irPerfil(){

    window.location.href = 'perfil.html';

}

// =====================================
// OBTENER PARÁMETRO URL
// =====================================

function obtenerParametro(nombre){

    const parametros = new URLSearchParams(window.location.search);

    return parametros.get(nombre);

}

// =====================================
// EXPORTAR FUNCIONES
// =====================================

window.routerApp = {

    irInicio,
    irCategoria,
    irFavoritos,
    irPerfil,
    obtenerParametro

};