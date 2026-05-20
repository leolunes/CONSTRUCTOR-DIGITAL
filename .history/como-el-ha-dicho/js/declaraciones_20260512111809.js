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
// EXPORTAR FUNCIONES
// =====================================

window.declaracionesApp = {

    obtenerDeclaraciones,
    obtenerDeclaracionPorId,
    obtenerDeclaracionesPorCategoria,
    buscarDeclaraciones

};