// =====================================
// MOTOR-ANALISIS.JS
// CONSTRUCTOR MGA PRO
// Analiza una idea escrita por el usuario
// =====================================

/*
  Requiere cargar antes:
  - js/asistente/experto/motor-conocimiento.js
*/

const MotorAnalisis = (()=>{

function normalizar(texto){
    if(window.MotorConocimiento && MotorConocimiento.normalizar){
        return MotorConocimiento.normalizar(texto);
    }

    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .trim();
}

function extraerLongitud(texto){

    const t = normalizar(texto);

    const km = t.match(/(\d+(\.\d+)?|\d+(,\d+)?)\s*(km|kilometro|kilometros)/);
    if(km){
        return {
            valor: parseFloat(km[1].replace(",",".")),
            unidad: "km"
        };
    }

    const m = t.match(/(\d+(\.\d+)?|\d+(,\d+)?)\s*(m|metro|metros)/);
    if(m){
        return {
            valor: parseFloat(m[1].replace(",",".")),
            unidad: "m"
        };
    }

    return null;
}

function extraerBeneficiarios(texto){

    const t = normalizar(texto);

    const patron = t.match(/(\d+)\s*(personas|habitantes|beneficiarios|familias|hogares|usuarios|estudiantes|productores|mujeres|jovenes|adultos)/);

    if(!patron) return null;

    return {
        cantidad: parseInt(patron[1],10),
        tipo: patron[2]
    };
}

function detectarAmbito(texto){

    const t = normalizar(texto);

    if(t.includes("vereda") || t.includes("rural") || t.includes("corregimiento") || t.includes("campo")){
        return "Rural";
    }

    if(t.includes("barrio") || t.includes("urbano") || t.includes("comuna") || t.includes("ciudad")){
        return "Urbano";
    }

    return "No determinado";
}

function detectarTipoIntervencion(texto){

    const t = normalizar(texto);

    const reglas = [
        {clave:"construccion", valor:"Construcción"},
        {clave:"construir", valor:"Construcción"},
        {clave:"mejoramiento", valor:"Mejoramiento"},
        {clave:"mejorar", valor:"Mejoramiento"},
        {clave:"rehabilitacion", valor:"Rehabilitación"},
        {clave:"rehabilitar", valor:"Rehabilitación"},
        {clave:"dotacion", valor:"Dotación"},
        {clave:"dotar", valor:"Dotación"},
        {clave:"fortalecimiento", valor:"Fortalecimiento"},
        {clave:"fortalecer", valor:"Fortalecimiento"},
        {clave:"adecuacion", valor:"Adecuación"},
        {clave:"adecuar", valor:"Adecuación"},
        {clave:"mantenimiento", valor:"Mantenimiento"},
        {clave:"mantener", valor:"Mantenimiento"},
        {clave:"formacion", valor:"Formación"},
        {clave:"capacitar", valor:"Formación"}
    ];

    const encontrada = reglas.find(r => t.includes(r.clave));

    return encontrada ? encontrada.valor : "No determinado";
}

function detectarLugar(texto){

    const original = String(texto || "");

    const patrones = [
        /vereda\s+([A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+)/i,
        /barrio\s+([A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+)/i,
        /municipio\s+de\s+([A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+)/i,
        /en\s+([A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+)/i
    ];

    for(const p of patrones){
        const m = original.match(p);
        if(m && m[1]){
            return m[1].trim();
        }
    }

    return "";
}

function calcularConfianza(resultadoConocimiento){

    if(!resultadoConocimiento || !resultadoConocimiento.ok) return "Baja";

    const p = resultadoConocimiento.puntaje || 0;

    if(p >= 80) return "Alta";
    if(p >= 40) return "Media";
    return "Baja";
}

function analizar(texto){

    const base = window.MotorConocimiento
        ? MotorConocimiento.analizarIdea(texto)
        : {ok:false, mensaje:"MotorConocimiento no está cargado."};

    const analisis = {
        textoOriginal: texto,
        ok: base.ok,
        mensaje: base.mensaje || "",
        sector: base.sector || "",
        sectorCodigo: base.sectorCodigo || "",
        tipologia: base.tipologia || "",
        tipologiaCodigo: base.tipologiaCodigo || "",
        confianza: calcularConfianza(base),
        puntaje: base.puntaje || 0,
        datosDetectados: {
            tipoIntervencion: detectarTipoIntervencion(texto),
            ambito: detectarAmbito(texto),
            lugar: detectarLugar(texto),
            longitud: extraerLongitud(texto),
            beneficiarios: extraerBeneficiarios(texto)
        },
        estructura: base.estructura || null,
        sugerencias: base.sugerencias || []
    };

    return analisis;
}

function analizarRapido(texto){
    const r = analizar(texto);

    return {
        sector: r.sector,
        tipologia: r.tipologia,
        confianza: r.confianza,
        tipoIntervencion: r.datosDetectados.tipoIntervencion,
        ambito: r.datosDetectados.ambito,
        lugar: r.datosDetectados.lugar
    };
}

function requierePreguntas(analisis){

    const faltantes = [];

    if(!analisis.tipologia) faltantes.push("tipología");
    if(!analisis.datosDetectados.lugar) faltantes.push("ubicación");
    if(!analisis.datosDetectados.beneficiarios) faltantes.push("beneficiarios");

    const requiereLongitud = ["Placa Huella","Pavimentación","Vía","Puente","Acueducto","Alcantarillado"]
        .some(x => normalizar(analisis.tipologia).includes(normalizar(x)));

    if(requiereLongitud && !analisis.datosDetectados.longitud){
        faltantes.push("longitud o alcance físico");
    }

    return {
        requiere: faltantes.length > 0,
        faltantes
    };
}

function preguntasSugeridas(analisis){

    const r = requierePreguntas(analisis);

    if(!r.requiere) return [];

    const preguntas = [];

    r.faltantes.forEach(f => {

        if(f === "tipología") preguntas.push("¿Qué tipo de proyecto desea formular?");
        if(f === "ubicación") preguntas.push("¿En qué municipio, barrio o vereda se ejecutará el proyecto?");
        if(f === "beneficiarios") preguntas.push("¿Cuántas personas, hogares o usuarios se beneficiarán?");
        if(f === "longitud o alcance físico") preguntas.push("¿Cuál es la longitud, cantidad o alcance físico de la intervención?");

    });

    return preguntas;
}

return {
    analizar,
    analizarRapido,
    requierePreguntas,
    preguntasSugeridas,
    extraerLongitud,
    extraerBeneficiarios,
    detectarAmbito,
    detectarTipoIntervencion,
    detectarLugar
};

})();

window.MotorAnalisis = MotorAnalisis;
