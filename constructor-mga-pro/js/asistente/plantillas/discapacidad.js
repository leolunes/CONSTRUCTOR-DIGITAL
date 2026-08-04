// =====================================
// PLANTILLAS/DISCAPACIDAD.JS
// CONSTRUCTOR MGA PRO
// =====================================

const PlantillasDiscapacidad = (()=>{

const SECTOR="Discapacidad e Inclusión";
const SECTOR_CODIGO="SEC-DIS-001";

const comunes={
 riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-TEC-001"],
 normasBase:["NOR-DIS-001","NOR-DIS-002","NOR-CON-001","NOR-GEN-002"],
 fuentesBase:["FUE-PUB-001","FUE-NAC-001","FUE-SGP-001","FUE-COO-002"]
};

const tipologias=[

{
codigo:"TIP-DIS-001",
nombre:"Inclusión social de personas con discapacidad",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Fortalecimiento de acciones para la inclusión social, educativa, laboral y comunitaria de las personas con discapacidad.",
problemaCentral:"Barreras que limitan la inclusión y participación de las personas con discapacidad.",
objetivoGeneral:"Promover la inclusión social y el ejercicio pleno de derechos de las personas con discapacidad.",
productos:["PRO-FOR-001","PRO-SER-002","PRO-SER-003"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-005"],
indicadores:["IND-PRO-020","IND-PRO-031","IND-RES-001","IND-IMP-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-VUL-001"],
palabrasClave:["discapacidad","inclusión","accesibilidad"]
},

{
codigo:"TIP-DIS-002",
nombre:"Accesibilidad universal",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Adecuación de infraestructura y espacios públicos para garantizar accesibilidad universal.",
problemaCentral:"Infraestructura con barreras físicas para personas con discapacidad.",
objetivoGeneral:"Mejorar las condiciones de accesibilidad universal.",
productos:["PRO-INF-001","PRO-INF-002","PRO-DOT-001"],
actividades:["ACT-PLA-003","ACT-EJE-001","ACT-EJE-003"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-011"],
riesgos:["RIE-CON-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-VUL-001"],
palabrasClave:["rampas","accesibilidad","espacio público"]
},

{
codigo:"TIP-DIS-003",
nombre:"Fortalecimiento de cuidadores",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Capacitación y apoyo a cuidadores de personas con discapacidad.",
problemaCentral:"Limitadas capacidades de cuidado y apoyo familiar.",
objetivoGeneral:"Fortalecer capacidades de los cuidadores.",
productos:["PRO-FOR-001","PRO-SER-003"],
actividades:["ACT-PLA-009","ACT-EJE-004"],
indicadores:["IND-PRO-020","IND-RES-001"],
riesgos:["RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-VUL-001"],
palabrasClave:["cuidadores","familia"]
},

{
codigo:"TIP-DIS-004",
nombre:"Inclusión laboral",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Programas de formación e inclusión laboral para personas con discapacidad.",
problemaCentral:"Baja vinculación laboral de personas con discapacidad.",
objetivoGeneral:"Incrementar la inclusión laboral.",
productos:["PRO-FOR-003","PRO-SER-002","PRO-FOR-004"],
actividades:["ACT-PLA-009","ACT-EJE-004","ACT-EJE-005"],
indicadores:["IND-PRO-022","IND-PRO-023","IND-IMP-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-VUL-001"],
palabrasClave:["empleo","inclusión laboral"]
},

{
codigo:"TIP-DIS-005",
nombre:"Política pública de discapacidad",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Formulación e implementación de la política pública de discapacidad e inclusión.",
problemaCentral:"Débil gestión institucional para la garantía de derechos.",
objetivoGeneral:"Fortalecer la política pública de discapacidad.",
productos:["PRO-GES-003","PRO-FOR-002","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-005"],
indicadores:["IND-PRO-042","IND-PRO-021","IND-RES-003"],
riesgos:["RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-VUL-001"],
palabrasClave:["política pública","discapacidad"]
}

];

function registrar(){
 if(window.MotorTipologias){
  MotorTipologias.registrarVarias(tipologias);
 }
}

function listar(){
 return tipologias.map(x=>({...x}));
}

registrar();

return {listar,registrar};

})();

window.PlantillasDiscapacidad=PlantillasDiscapacidad;
