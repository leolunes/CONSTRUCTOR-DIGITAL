// =====================================
// GUARDAR EN LOCAL STORAGE
// =====================================

function guardarStorage(clave, datos){

    localStorage.setItem(
        clave,
        JSON.stringify(datos)
    );

}

// =====================================
// OBTENER DE LOCAL STORAGE
// =====================================

function obtenerStorage(clave){

    const datos = localStorage.getItem(clave);

    // Si no existe
    if(datos === null){

        return [];

    }

    // Convertir JSON
    return JSON.parse(datos);

}

// =====================================
// AGREGAR FAVORITO
// =====================================

function agregarFavorito(declaracion){

    // Obtener favoritos actuales
    const favoritos = obtenerStorage('favoritos');

    // Validar duplicados
    const existe = favoritos.some(
        item => item.id === declaracion.id
    );

    // Si no existe, agregar
    if(!existe){

        favoritos.push(declaracion);

        guardarStorage('favoritos', favoritos);

    }

}

// =====================================
// ELIMINAR FAVORITO
// =====================================

function eliminarFavorito(id){

    const favoritos = obtenerStorage('favoritos');

    const nuevosFavoritos = favoritos.filter(
        item => item.id !== id
    );

    guardarStorage('favoritos', nuevosFavoritos);

}

// =====================================
// EXPORTAR FUNCIONES
// =====================================

window.storageApp = {

    guardarStorage,
    obtenerStorage,
    agregarFavorito,
    eliminarFavorito

};