// =====================================
// UI/BUSCADOR-UI.JS
// CONSTRUCTOR MGA PRO
// Interfaz del Buscador Inteligente
// =====================================

const BuscadorUI = (()=>{

let input=null;
let lista=null;
let callback=null;

function iniciar(config={}){

    input=document.getElementById(config.inputId||"txtBuscarProyecto");
    lista=document.getElementById(config.listaId||"listaBuscarProyecto");
    callback=config.onSelect||null;

    if(!input || !lista){
        return;
    }

    AutocompletarBusquedas.render(
        input.id,
        lista.id,
        seleccionar
    );

    input.addEventListener("keydown",e=>{

        if(e.key==="Enter"){

            e.preventDefault();

            ejecutarBusqueda(
                input.value
            );

        }

    });

}

function seleccionar(item){

    if(window.HistorialBusquedas){
        HistorialBusquedas.registrar(
            item.titulo,
            item
        );
    }

    if(typeof callback==="function"){
        callback(item);
        return;
    }

    console.log("Elemento seleccionado:",item);

}

function ejecutarBusqueda(texto){

    if(!window.MotorBuscador){
        return [];
    }

    const resultados=
    MotorBuscador.buscar(texto);

    renderResultados(resultados);

    return resultados;

}

function renderResultados(resultados=[]){

    if(!lista){
        return;
    }

    lista.innerHTML="";

    if(!resultados.length){

        lista.innerHTML=
        `<li class="autocomplete-item muted">
            No se encontraron resultados.
        </li>`;

        lista.style.display="block";
        return;

    }

    resultados.forEach(item=>{

        const li=
        document.createElement("li");

        li.className="autocomplete-item";

        li.innerHTML=`
        <strong>${esc(item.titulo)}</strong><br>
        <small>
            ${esc(item.tipo)}
            ${item.sector?" · "+esc(item.sector):""}
        </small>`;

        li.onclick=()=>seleccionar(item);

        lista.appendChild(li);

    });

    lista.style.display="block";

}

function ocultar(){
    if(lista){
        lista.style.display="none";
    }
}

function limpiar(){

    if(input){
        input.value="";
    }

    if(lista){
        lista.innerHTML="";
        lista.style.display="none";
    }

}

function esc(v){

    return String(v||"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");

}

return{
    iniciar,
    ejecutarBusqueda,
    renderResultados,
    limpiar,
    ocultar
};

})();

window.BuscadorUI=BuscadorUI;
