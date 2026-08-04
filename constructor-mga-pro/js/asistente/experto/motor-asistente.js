// =====================================
// MOTOR-ASISTENTE.JS
// CONSTRUCTOR MGA PRO
// Orquestador conversacional
// =====================================

const MotorAsistente = (()=>{

const estado={
    proyecto:{},
    paso:0
};

const preguntas=[
{
    campo:"idea",
    texto:"¿Qué proyecto desea formular?"
},
{
    campo:"ubicacion",
    texto:"¿En qué municipio, corregimiento, barrio o vereda se ejecutará?"
},
{
    campo:"beneficiarios",
    texto:"¿Cuántos beneficiarios tendrá el proyecto?"
},
{
    campo:"alcance",
    texto:"¿Cuál será el alcance físico? (km, m², unidades, etc.)"
}
];

function iniciar(){
    estado.proyecto={};
    estado.paso=0;
    return preguntas[0];
}

function responder(valor){

    const actual=preguntas[estado.paso];

    estado.proyecto[actual.campo]=valor;

    estado.paso++;

    if(estado.paso<preguntas.length){
        return{
            finalizado:false,
            pregunta:preguntas[estado.paso]
        };
    }

    const texto=estado.proyecto.idea||"";

    const generado=window.MotorGenerador
        ? MotorGenerador.generarDesdeTexto(texto)
        : {ok:false,mensaje:"MotorGenerador no disponible."};

    if(generado.ok){

        generado.nombreProyecto=estado.proyecto.idea;
        generado.ubicacion=estado.proyecto.ubicacion;
        generado.beneficiariosUsuario=estado.proyecto.beneficiarios;
        generado.alcanceUsuario=estado.proyecto.alcance;

    }

    return{
        finalizado:true,
        datos:estado.proyecto,
        proyecto:generado
    };
}

function estadoActual(){
    return JSON.parse(JSON.stringify(estado));
}

return{
    iniciar,
    responder,
    estadoActual
};

})();

window.MotorAsistente=MotorAsistente;
