// =====================================
// MOTOR-COHERENCIA.JS
// CONSTRUCTOR MGA PRO
// Validador básico de coherencia MGA
// =====================================

const MotorCoherencia = (()=>{

function norm(t){
    return String(t||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}

function existe(v){
    if(Array.isArray(v)) return v.length>0;
    return v!==undefined && v!==null && String(v).trim()!=="";
}

function validarEstructura(e){

    const errores=[];
    const alertas=[];

    if(!e) return {ok:false,puntaje:0,errores:["No existe estructura del proyecto."],alertas:[]};

    if(!existe(e.identificacion?.sector)) errores.push("Falta el sector.");
    if(!existe(e.identificacion?.tipologia)) errores.push("Falta la tipología.");

    if(!existe(e.problema?.problemaCentral))
        errores.push("Falta el problema central.");

    if(!existe(e.objetivos?.objetivoGeneral))
        errores.push("Falta el objetivo general.");

    if(!existe(e.cadenaValor?.productos))
        errores.push("No existen productos.");

    if(!existe(e.cadenaValor?.actividades))
        errores.push("No existen actividades.");

    if(!existe(e.cadenaValor?.indicadores))
        errores.push("No existen indicadores.");

    if(!existe(e.riesgos))
        alertas.push("No hay riesgos definidos.");

    if(!existe(e.fuentesFinanciacion))
        alertas.push("No hay fuentes de financiación.");

    let puntaje=100;
    puntaje-=errores.length*15;
    puntaje-=alertas.length*5;
    if(puntaje<0) puntaje=0;

    return {
        ok:errores.length===0,
        puntaje,
        errores,
        alertas
    };
}

function validarRelacionProblemaObjetivo(problema,objetivo){

    if(!problema || !objetivo){
        return {
            ok:false,
            mensaje:"Problema u objetivo inexistente."
        };
    }

    const claves=[
        "mejor","fortal","reduc","increment","ampli","dismin",
        "constru","rehabil","dot","implem","garant"
    ];

    const o=norm(objetivo);

    const tieneVerbo=claves.some(k=>o.includes(k));

    return{
        ok:tieneVerbo,
        mensaje:tieneVerbo
            ?"La relación problema-objetivo parece consistente."
            :"El objetivo general debería formularse con un verbo de acción."
    };
}

function validarCadenaValor(cadena){

    const obs=[];

    if((cadena.productos||[]).length===0)
        obs.push("No existen productos.");

    if((cadena.actividades||[]).length<(cadena.productos||[]).length)
        obs.push("Revise la cantidad de actividades frente a los productos.");

    if((cadena.indicadores||[]).length===0)
        obs.push("No existen indicadores.");

    return{
        ok:obs.length===0,
        observaciones:obs
    };
}

function validarProyecto(proyecto){

    const estructura=validarEstructura(proyecto);

    const relacion=validarRelacionProblemaObjetivo(
        proyecto?.problema?.problemaCentral,
        proyecto?.objetivos?.objetivoGeneral
    );

    const cadena=validarCadenaValor(
        proyecto?.cadenaValor||{}
    );

    const puntaje=Math.round(
        (estructura.puntaje+
         (relacion.ok?100:60)+
         (cadena.ok?100:70))/3
    );

    return{
        ok:estructura.ok && relacion.ok && cadena.ok,
        puntaje,
        estructura,
        relacion,
        cadena
    };
}

return{
    validarProyecto,
    validarEstructura,
    validarRelacionProblemaObjetivo,
    validarCadenaValor
};

})();

window.MotorCoherencia=MotorCoherencia;
