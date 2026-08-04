// =====================================
// BUSCADOR/INDICE.JS
// CONSTRUCTOR MGA PRO
// Índice Maestro de Búsquedas
// =====================================

const IndiceBusquedas = (()=>{

let indice=[];

const norm=v=>String(v||"")
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.trim();

function agregar(tipo,obj){

    if(!obj)return;

    indice.push({
        tipo,
        codigo:obj.codigo||obj.id||"",
        titulo:obj.nombre||obj.titulo||"",
        descripcion:obj.descripcion||"",
        sector:obj.sector||"",
        palabras:norm([
            obj.codigo,
            obj.id,
            obj.nombre,
            obj.titulo,
            obj.descripcion,
            obj.sector,
            ...(obj.palabrasClave||[])
        ].join(" ")),
        data:obj
    });

}

function construir(){

    indice=[];

    if(window.MotorTipologias){
        MotorTipologias.listar().forEach(x=>agregar("tipologia",x));
    }

    if(window.MotorCatalogos){

        [
            "sectores",
            "productos",
            "actividades",
            "indicadores",
            "riesgos",
            "poblaciones",
            "normatividad",
            "fuentes-financiacion"
        ].forEach(cat=>{
            (MotorCatalogos.listar(cat)||[])
            .forEach(x=>agregar(cat,x));
        });

    }

    return indice.length;

}

function buscar(texto,limite=30){

    const q=norm(texto);

    if(!q)return[];

    return indice
    .filter(x=>x.palabras.includes(q))
    .sort((a,b)=>score(b,q)-score(a,q))
    .slice(0,limite);

}

function score(item,q){

    let s=0;

    if(norm(item.titulo)===q)s+=100;

    if(norm(item.titulo).startsWith(q))s+=60;

    if(item.palabras.includes(q))s+=20;

    return s;

}

function actualizar(){
    return construir();
}

function total(){
    return indice.length;
}

function estadisticas(){

    const r={};

    indice.forEach(i=>{
        r[i.tipo]=(r[i.tipo]||0)+1;
    });

    return r;

}

construir();

return{
    construir,
    actualizar,
    buscar,
    total,
    estadisticas
};

})();

window.IndiceBusquedas=IndiceBusquedas;
