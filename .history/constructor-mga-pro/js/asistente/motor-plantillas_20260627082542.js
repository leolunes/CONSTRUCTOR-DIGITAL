// =====================================
// MOTOR-PLANTILLAS.JS
// CONSTRUCTOR MGA PRO
// Administrador central de plantillas sectoriales
// =====================================

const MotorPlantillas = (()=>{

const REGISTRO={};

function registrarSector(nombre,objeto){
    if(!nombre||!objeto) return;
    REGISTRO[String(nombre).toLowerCase()]=objeto;
}

function obtenerSector(nombre){
    return REGISTRO[String(nombre||"").toLowerCase()]||null;
}

function sectores(){
    return Object.keys(REGISTRO).sort();
}

function tiposProyecto(sector){
    const s=obtenerSector(sector);
    if(!s) return [];
    return Object.keys(s.proyectos||{}).sort();
}

function obtenerProyecto(sector,tipo){
    const s=obtenerSector(sector);
    if(!s) return null;
    return (s.proyectos||{})[tipo]||null;
}

function generarModelo(sector,tipo){

    const p=obtenerProyecto(sector,tipo);

    if(!p){
        return null;
    }

    return structuredClone
        ? structuredClone(p)
        : JSON.parse(JSON.stringify(p));

}

function aplicarPlantilla(projectId,sector,tipo){

    if(!window.MGA){
        return null;
    }

    const modelo=generarModelo(sector,tipo);

    if(!modelo){
        alert("La plantilla solicitada no existe.");
        return null;
    }

    return MGA.updateModel(projectId,modelo);

}

function buscar(texto){

    texto=String(texto||"").toLowerCase();

    const resultado=[];

    sectores().forEach(sec=>{

        const s=obtenerSector(sec);

        Object.entries(s.proyectos||{}).forEach(([k,v])=>{

            const palabras=[
                k,
                v.nombre||"",
                ...(v.palabrasClave||[])
            ].join(" ").toLowerCase();

            if(palabras.includes(texto)){
                resultado.push({
                    sector:sec,
                    tipo:k,
                    nombre:v.nombre||k
                });
            }

        });

    });

    return resultado;

}

function estadisticas(){

    let total=0;

    sectores().forEach(sec=>{
        total+=tiposProyecto(sec).length;
    });

    return{
        sectores:sectores().length,
        proyectos:total
    };

}

return{
    registrarSector,
    obtenerSector,
    sectores,
    tiposProyecto,
    obtenerProyecto,
    generarModelo,
    aplicarPlantilla,
    buscar,
    estadisticas
};

})();

window.MotorPlantillas=MotorPlantillas;

/*
Cada archivo de plantillas deberá terminar con algo como:

MotorPlantillas.registrarSector("salud", PlantillasSalud);

MotorPlantillas.registrarSector("desarrollo-social", PlantillasDesarrolloSocial);

etc.
*/
