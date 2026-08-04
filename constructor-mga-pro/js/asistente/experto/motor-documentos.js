// =====================================
// MOTOR-DOCUMENTOS.JS
// CONSTRUCTOR MGA PRO
// Generación automática de documentos
// =====================================

const MotorDocumentos = (()=>{

function generar(textoIdea){

    if(!window.MotorGenerador){
        return {ok:false,mensaje:"MotorGenerador no está disponible."};
    }

    const proyecto = MotorGenerador.generarDesdeTexto(textoIdea);

    if(!proyecto.ok){
        return proyecto;
    }

    const problema = proyecto.problema.problemaCentral;
    const objetivo = proyecto.objetivos.objetivoGeneral;

    const diagnostico =
`El diagnóstico evidencia que la problemática principal corresponde a ${problema.toLowerCase()}. La intervención se prioriza por su impacto sobre la población objetivo y la necesidad de mejorar las condiciones actuales mediante inversión pública.`;

    const justificacion = proyecto.justificacion;

    const resumen =
`El proyecto "${proyecto.nombreProyecto}" tiene como propósito ${objetivo.toLowerCase()}. La formulación se realizó utilizando la base de conocimiento del Constructor MGA Pro y contempla una cadena de valor compuesta por productos, actividades, indicadores, riesgos y fuentes de financiación.`;

    const arbolProblemas = {
        problemaCentral: problema,
        causasDirectas: proyecto.problema.causasDirectas || [],
        causasIndirectas: proyecto.problema.causasIndirectas || [],
        efectosDirectos: proyecto.problema.efectosDirectos || [],
        efectosIndirectos: proyecto.problema.efectosIndirectos || []
    };

    const arbolObjetivos = {
        objetivoGeneral: objetivo,
        objetivosEspecificos: proyecto.objetivos.objetivosEspecificos || []
    };

    const marcoLogico = {
        fin: proyecto.beneficios,
        proposito: objetivo,
        componentes: proyecto.cadenaValor.productos,
        actividades: proyecto.cadenaValor.actividades,
        indicadores: proyecto.cadenaValor.indicadores
    };

    return {
        ok:true,
        proyecto,
        documentos:{
            diagnostico,
            justificacion,
            resumenEjecutivo: resumen,
            descripcion: proyecto.descripcion,
            beneficios: proyecto.beneficios,
            sostenibilidad: proyecto.sostenibilidad,
            arbolProblemas,
            arbolObjetivos,
            marcoLogico
        }
    };
}

return{
    generar
};

})();

window.MotorDocumentos = MotorDocumentos;
