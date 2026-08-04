// =====================================
// BUSCADOR/RANKING.JS
// CONSTRUCTOR MGA PRO
// Algoritmo de relevancia de resultados
// =====================================

const RankingBusquedas = (()=>{

const PESOS={
    coincidenciaExacta:100,
    iniciaCon:60,
    contiene:30,
    palabraClave:20,
    tipologia:25,
    sector:15,
    producto:12,
    actividad:10,
    indicador:8,
    riesgo:6,
    norma:6,
    poblacion:6
};

function norm(v){
    return String(v||"")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .trim();
}

function calcular(item,texto){

    const q=norm(texto);

    const titulo=norm(item.titulo||"");
    const desc=norm(item.descripcion||"");
    const palabras=norm(item.palabras||"");

    let p=0;

    if(titulo===q) p+=PESOS.coincidenciaExacta;
    if(titulo.startsWith(q)) p+=PESOS.iniciaCon;
    if(titulo.includes(q)) p+=PESOS.contiene;
    if(desc.includes(q)) p+=15;
    if(palabras.includes(q)) p+=PESOS.palabraClave;

    switch(item.tipo){
        case "tipologia": p+=PESOS.tipologia; break;
        case "sectores":
        case "sector": p+=PESOS.sector; break;
        case "productos":
        case "producto": p+=PESOS.producto; break;
        case "actividades":
        case "actividad": p+=PESOS.actividad; break;
        case "indicadores":
        case "indicador": p+=PESOS.indicador; break;
        case "riesgos":
        case "riesgo": p+=PESOS.riesgo; break;
        case "normatividad":
        case "norma": p+=PESOS.norma; break;
        case "poblaciones":
        case "poblacion": p+=PESOS.poblacion; break;
    }

    return p;
}

function ordenar(lista,texto){
    return [...(lista||[])]
    .map(x=>({...x,relevancia:calcular(x,texto)}))
    .sort((a,b)=>b.relevancia-a.relevancia);
}

return{
    calcular,
    ordenar,
    PESOS
};

})();

window.RankingBusquedas=RankingBusquedas;
