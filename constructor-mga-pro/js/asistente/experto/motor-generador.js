// =====================================
// MOTOR-GENERADOR.JS
// CONSTRUCTOR MGA PRO
// Generador automático de contenido MGA
// =====================================

const MotorGenerador = (()=>{

function texto(v){ return String(v||"").trim(); }

function generar(tipologiaCodigo, datos={}){

    if(!window.MotorConocimiento){
        return {ok:false,mensaje:"MotorConocimiento no está disponible."};
    }

    const base = MotorConocimiento.estructuraBase(tipologiaCodigo);

    if(!base){
        return {ok:false,mensaje:"No existe la tipología solicitada."};
    }

    const nombreProyecto =
        datos.nombreProyecto ||
        `${datos.tipoIntervencion || "Proyecto"} de ${base.identificacion.tipologia}`;

    const ubicacion = datos.ubicacion || "el territorio priorizado";
    const beneficiarios = datos.beneficiarios || "la población objetivo";
    const alcance = datos.alcance || "";

    const problema = texto(base.problema.problemaCentral);

    const justificacion =
`El proyecto se formula para atender la problemática relacionada con ${problema.toLowerCase()} en ${ubicacion}. La intervención busca fortalecer las capacidades institucionales y territoriales mediante acciones alineadas con la Metodología General Ajustada (MGA), generando beneficios sostenibles para ${beneficiarios}.`;

    const descripcion =
`${nombreProyecto} comprende la planificación, ejecución, seguimiento y cierre de las actividades necesarias para alcanzar los productos definidos por la tipología ${base.identificacion.tipologia}. ${alcance ? "El alcance físico contempla " + alcance + "." : ""}`;

    const beneficios = base.beneficios ||
        "Mejora de las condiciones de vida de la población beneficiaria.";

    const sostenibilidad = base.sostenibilidad ||
        "El proyecto será sostenible mediante mantenimiento, seguimiento y apropiación institucional.";

    return {
        ok:true,
        identificacion: base.identificacion,
        nombreProyecto,
        justificacion,
        descripcion,
        problema: base.problema,
        objetivos: base.objetivos,
        cadenaValor: base.cadenaValor,
        riesgos: base.riesgos,
        normatividad: base.normatividad,
        fuentesFinanciacion: base.fuentesFinanciacion,
        poblacionObjetivo: base.poblacionObjetivo,
        beneficios,
        sostenibilidad,
        anexos:{
            resumenEjecutivo:
`El proyecto "${nombreProyecto}" busca ${base.objetivos.objetivoGeneral.toLowerCase()} mediante la ejecución de actividades que producirán resultados verificables en beneficio de ${beneficiarios}.`,
            impactoEsperado:
`Se espera una mejora progresiva de los indicadores asociados a la tipología ${base.identificacion.tipologia}, contribuyendo al desarrollo del territorio.`,
            observaciones:"Documento generado automáticamente por el Motor Generador MGA."
        }
    };
}

function generarDesdeTexto(textoIdea){

    if(!window.MotorAnalisis){
        return {ok:false,mensaje:"MotorAnalisis no disponible."};
    }

    const analisis = MotorAnalisis.analizar(textoIdea);

    if(!analisis.ok){
        return analisis;
    }

    return generar(
        analisis.tipologiaCodigo,
        {
            nombreProyecto:textoIdea,
            ubicacion:analisis.datosDetectados.lugar,
            beneficiarios:analisis.datosDetectados.beneficiarios ?
                `${analisis.datosDetectados.beneficiarios.cantidad} ${analisis.datosDetectados.beneficiarios.tipo}` :
                "",
            alcance:analisis.datosDetectados.longitud ?
                `${analisis.datosDetectados.longitud.valor} ${analisis.datosDetectados.longitud.unidad}` :
                "",
            tipoIntervencion:analisis.datosDetectados.tipoIntervencion
        }
    );
}

return{
    generar,
    generarDesdeTexto
};

})();

window.MotorGenerador = MotorGenerador;
