// =====================================
// BUSCADOR/SUGERENCIAS.JS
// CONSTRUCTOR MGA PRO
// Motor de sugerencias inteligentes
// =====================================

const SugerenciasBusquedas = (()=>{

function sugerir(texto="", limite=10){

    const resultados=[];

    const usados=new Set();

    // 1. Buscar directamente
    if(window.MotorBuscador){

        (MotorBuscador.buscar(texto)||[])
        .forEach(r=>{

            const id=r.tipo+"|"+(r.codigo||r.titulo);

            if(usados.has(id)) return;

            usados.add(id);

            resultados.push({
                origen:"busqueda",
                ...r
            });

        });

    }

    // 2. Completar con favoritos
    if(window.HistorialBusquedas){

        (HistorialBusquedas.favoritos()||[])
        .forEach(f=>{

            const item=f.item;

            if(!item) return;

            const id=item.tipo+"|"+(item.codigo||item.titulo);

            if(usados.has(id)) return;

            usados.add(id);

            resultados.push({
                origen:"favorito",
                ...item
            });

        });

    }

    // 3. Completar con recientes
    if(window.HistorialBusquedas){

        (HistorialBusquedas.recientes()||[])
        .forEach(h=>{

            if(!h.item) return;

            const item=h.item;

            const id=item.tipo+"|"+(item.codigo||item.titulo);

            if(usados.has(id)) return;

            usados.add(id);

            resultados.push({
                origen:"reciente",
                ...item
            });

        });

    }

    // 4. Si aún hay pocos resultados, agregar tipologías
    if(resultados.length<limite && window.MotorTipologias){

        (MotorTipologias.listar()||[])
        .forEach(t=>{

            const id="tipologia|"+t.codigo;

            if(usados.has(id)) return;

            usados.add(id);

            resultados.push({
                origen:"catalogo",
                tipo:"tipologia",
                titulo:t.nombre,
                descripcion:t.descripcion||"",
                sector:t.sector,
                codigo:t.codigo,
                data:t
            });

        });

    }

    return resultados.slice(0,limite);

}

function relacionados(item, limite=8){

    if(!item){
        return [];
    }

    const sector=
    item.sector||"";

    if(window.MotorTipologias){

        return (MotorTipologias
            .porSector(sector)||[])
            .filter(t=>
                t.codigo!==item.codigo
            )
            .slice(0,limite)
            .map(t=>({
                tipo:"tipologia",
                titulo:t.nombre,
                descripcion:t.descripcion||"",
                sector:t.sector,
                codigo:t.codigo,
                data:t
            }));

    }

    return [];

}

function recomendados(){

    if(window.HistorialBusquedas){

        const recientes=
        HistorialBusquedas.recientes(1);

        if(recientes.length && recientes[0].item){

            return relacionados(
                recientes[0].item,
                6
            );

        }

    }

    return sugerir("",6);

}

return{
    sugerir,
    relacionados,
    recomendados
};

})();

window.SugerenciasBusquedas=SugerenciasBusquedas;
