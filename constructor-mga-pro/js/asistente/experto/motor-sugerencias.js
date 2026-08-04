// =====================================
// MOTOR-SUGERENCIAS.JS
// CONSTRUCTOR MGA PRO
// Sugerencias inteligentes
// =====================================

const MotorSugerencias = (()=>{

function sugerir(texto, limite=10){

    if(!window.MotorConocimiento){
        return [];
    }

    return MotorConocimiento.buscarTipologias(texto)
        .slice(0, limite)
        .map(t=>({
            codigo:t.codigo,
            sector:t.sector,
            tipologia:t.nombre,
            descripcion:t.descripcion||"",
            confianza:t.puntaje||0,
            palabrasClave:t.palabrasClave||[]
        }));
}

function sugerirPorSector(sector){

    if(!window.MotorConocimiento){
        return [];
    }

    const sectores=MotorConocimiento.sectores();
    const encontrado=sectores.find(s=>
        s.codigo===sector ||
        String(s.nombre).toLowerCase()===String(sector).toLowerCase()
    );

    if(!encontrado) return [];

    return MotorConocimiento.tipologiasPorSector(encontrado.codigo);
}

function relacionadas(codigoTipologia){

    if(!window.MotorConocimiento){
        return [];
    }

    const base=MotorConocimiento.obtenerTipologia(codigoTipologia);
    if(!base) return [];

    return MotorConocimiento
        .tipologiasPorSector(base.sectorCodigo)
        .filter(t=>t.codigo!==codigoTipologia)
        .slice(0,8);
}

function autocompletar(texto){

    if(!texto || texto.trim().length<2){
        return [];
    }

    return sugerir(texto,5).map(s=>({
        texto:s.tipologia,
        subtitulo:s.sector,
        codigo:s.codigo,
        confianza:s.confianza
    }));
}

function mejoresOpciones(texto){

    const lista=sugerir(texto,3);

    return {
        principal:lista[0]||null,
        alternativas:lista.slice(1)
    };
}

return{
    sugerir,
    sugerirPorSector,
    relacionadas,
    autocompletar,
    mejoresOpciones
};

})();

window.MotorSugerencias=MotorSugerencias;
