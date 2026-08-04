// =====================================
// PLANTILLAS/PLANEACION.JS
// CONSTRUCTOR MGA PRO
// =====================================

const PlantillasPlaneacion = (()=>{

const SECTOR="Planeación";
const SECTOR_CODIGO="SEC-PLA-001";

const comunes={
 riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-TEC-001","RIE-CON-001"],
 normasBase:["NOR-PLA-001","NOR-PLA-002","NOR-CON-001","NOR-GEN-002"],
 fuentesBase:["FUE-PUB-001","FUE-SGP-001","FUE-NAC-001"]
};

const tipologias=[

{
codigo:"TIP-PLA-001",
nombre:"Actualización del Plan de Desarrollo",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Formulación, seguimiento y actualización del Plan de Desarrollo Territorial.",
problemaCentral:"Instrumentos de planificación desactualizados o con bajo seguimiento.",
objetivoGeneral:"Fortalecer la planificación estratégica territorial.",
productos:["PRO-GES-003","PRO-SER-002","PRO-FOR-002"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-005"],
indicadores:["IND-PRO-042","IND-PRO-031","IND-RES-003"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["plan de desarrollo","planeación"]
},

{
codigo:"TIP-PLA-002",
nombre:"Banco de Programas y Proyectos",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Fortalecimiento del banco de programas y proyectos y formulación MGA.",
problemaCentral:"Baja capacidad para estructurar proyectos de inversión.",
objetivoGeneral:"Fortalecer el banco de programas y proyectos.",
productos:["PRO-GES-003","PRO-FOR-002","PRO-TIC-003"],
actividades:["ACT-PLA-001","ACT-EJE-004","ACT-EJE-005"],
indicadores:["IND-PRO-042","IND-PRO-021","IND-RES-003"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["MGA","BPIN","proyectos"]
},

{
codigo:"TIP-PLA-003",
nombre:"Sistema de información territorial",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Implementación de sistemas de información para apoyo a la planeación.",
problemaCentral:"Información territorial dispersa y desactualizada.",
objetivoGeneral:"Fortalecer la gestión de información territorial.",
productos:["PRO-TIC-003","PRO-GES-003"],
actividades:["ACT-PLA-002","ACT-EJE-004"],
indicadores:["IND-PRO-052","IND-PRO-042"],
riesgos:["RIE-TEC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["SIG","información territorial"]
},

{
codigo:"TIP-PLA-004",
nombre:"Actualización POT",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Formulación o revisión del Plan de Ordenamiento Territorial.",
problemaCentral:"Ordenamiento territorial desactualizado.",
objetivoGeneral:"Actualizar los instrumentos de ordenamiento territorial.",
productos:["PRO-GES-003","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-005"],
indicadores:["IND-PRO-042","IND-RES-003"],
riesgos:["RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["POT","ordenamiento territorial"]
},

{
codigo:"TIP-PLA-005",
nombre:"Catastro multipropósito",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Fortalecimiento de información catastral y geográfica.",
problemaCentral:"Información predial desactualizada.",
objetivoGeneral:"Mejorar la gestión catastral.",
productos:["PRO-TIC-003","PRO-GES-003","PRO-SER-001"],
actividades:["ACT-PLA-002","ACT-EJE-004","ACT-EJE-005"],
indicadores:["IND-PRO-052","IND-PRO-042","IND-RES-003"],
riesgos:["RIE-TEC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["catastro","predios","SIG"]
}

];

function registrar(){
 if(window.MotorTipologias){
  MotorTipologias.registrarVarias(tipologias);
 }
}

function listar(){ return tipologias.map(t=>({...t})); }

registrar();

return {listar,registrar};

})();

window.PlantillasPlaneacion=PlantillasPlaneacion;
