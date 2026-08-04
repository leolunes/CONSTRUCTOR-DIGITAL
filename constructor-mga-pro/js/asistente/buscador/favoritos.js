// =====================================
// BUSCADOR/FAVORITOS.JS
// CONSTRUCTOR MGA PRO
// Gestión independiente de favoritos del buscador
// =====================================

const FavoritosBusquedas = (()=>{

const KEY = "mga.buscador.favoritos";
const MAX = 100;

function leer(){
    try{
        return JSON.parse(localStorage.getItem(KEY) || "[]");
    }catch(_){
        return [];
    }
}

function guardar(lista){
    localStorage.setItem(
        KEY,
        JSON.stringify(lista || [])
    );
}

function idItem(item){
    return String(
        (item?.tipo || "") + "|" +
        (item?.codigo || item?.id || item?.titulo || item?.nombre || "")
    );
}

function agregar(item){

    if(!item){
        return false;
    }

    const id =
    idItem(item);

    if(!id || id === "|"){
        return false;
    }

    let lista =
    leer();

    lista =
    lista.filter(x => x.id !== id);

    lista.unshift({
        id,
        fecha:
        new Date().toISOString(),
        item
    });

    if(lista.length > MAX){
        lista = lista.slice(0, MAX);
    }

    guardar(lista);

    return true;

}

function quitar(id){

    let lista =
    leer();

    lista =
    lista.filter(x => x.id !== id);

    guardar(lista);

    return true;

}

function alternar(item){

    const id =
    idItem(item);

    if(existe(id)){
        quitar(id);
        return false;
    }

    agregar(item);
    return true;

}

function existe(idOItem){

    const id =
    typeof idOItem === "string"
    ? idOItem
    : idItem(idOItem);

    return leer().some(x => x.id === id);

}

function listar(){
    return leer();
}

function limpiar(){
    guardar([]);
}

function buscar(texto){

    const q =
    String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .trim();

    if(!q){
        return listar();
    }

    return listar().filter(x => {

        const item =
        x.item || {};

        const base =
        [
            item.tipo,
            item.codigo,
            item.id,
            item.titulo,
            item.nombre,
            item.descripcion,
            item.sector
        ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"");

        return base.includes(q);

    });

}

return{
    agregar,
    quitar,
    alternar,
    existe,
    listar,
    limpiar,
    buscar
};

})();

window.FavoritosBusquedas = FavoritosBusquedas;
