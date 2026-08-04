// =====================================
// BUSCADOR/AUTOCOMPLETAR.JS
// CONSTRUCTOR MGA PRO
// Motor de autocompletado inteligente
// =====================================

const AutocompletarBusquedas = (()=>{

function sugerencias(texto,limite=8){

    const q=String(texto||"").trim();

    if(!q){
        return [];
    }

    let terminos=[q];

    if(window.SinonimosBusquedas){
        terminos=SinonimosBusquedas.expandir(q);
    }

    const mapa=new Map();

    terminos.forEach(t=>{

        let resultados=[];

        if(window.IndiceBusquedas){
            resultados=IndiceBusquedas.buscar(t,50);
        }else if(window.MotorBuscador){
            resultados=MotorBuscador.buscar(t);
        }

        if(window.RankingBusquedas){
            resultados=RankingBusquedas.ordenar(resultados,t);
        }

        resultados.forEach(r=>{
            const key=r.tipo+"|"+(r.codigo||r.titulo);
            if(!mapa.has(key)){
                mapa.set(key,r);
            }
        });

    });

    return [...mapa.values()].slice(0,limite);

}

function render(inputId,listaId,onSelect){

    const input=document.getElementById(inputId);
    const lista=document.getElementById(listaId);

    if(!input || !lista){
        return;
    }

    input.addEventListener("input",()=>{

        const datos=sugerencias(input.value);

        lista.innerHTML="";

        if(!datos.length){
            lista.style.display="none";
            return;
        }

        datos.forEach(item=>{

            const li=document.createElement("li");
            li.className="autocomplete-item";
            li.innerHTML=
            `<strong>${item.titulo}</strong><br>
             <small>${item.tipo}${item.sector?" · "+item.sector:""}</small>`;

            li.onclick=()=>{

                input.value=item.titulo;
                lista.style.display="none";

                if(typeof onSelect==="function"){
                    onSelect(item);
                }

            };

            lista.appendChild(li);

        });

        lista.style.display="block";

    });

    document.addEventListener("click",(e)=>{
        if(!lista.contains(e.target) && e.target!==input){
            lista.style.display="none";
        }
    });

}

return{
    sugerencias,
    render
};

})();

window.AutocompletarBusquedas=AutocompletarBusquedas;
