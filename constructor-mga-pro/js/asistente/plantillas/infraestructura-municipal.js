// =====================================
// PLANTILLAS/INFRAESTRUCTURA-MUNICIPAL.JS
// CONSTRUCTOR MGA PRO
// =====================================

const PlantillasInfraestructuraMunicipal=(()=>{

const SECTOR="Infraestructura Municipal";
const SECTOR_CODIGO="SEC-INF-001";

const comunes={
 riesgos:["RIE-CON-001","RIE-FIN-001","RIE-TEC-001","RIE-AMB-001"],
 normasBase:["NOR-INF-001","NOR-INF-002","NOR-CON-001","NOR-GEN-002"],
 fuentesBase:["FUE-PUB-001","FUE-SGP-001","FUE-NAC-001","FUE-REG-001","FUE-COO-002"]
};

const tipologias=[

{
codigo:"TIP-INF-001",
nombre:"Construcción de equipamientos municipales",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Construcción de edificaciones para la prestación de servicios públicos municipales.",
problemaCentral:"Déficit de infraestructura para la prestación de servicios institucionales.",
objetivoGeneral:"Fortalecer la infraestructura física municipal.",
productos:["PRO-INF-001","PRO-INF-002","PRO-DOT-001"],
actividades:["ACT-PLA-003","ACT-PLA-005","ACT-EJE-001","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-011","IND-RES-003"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["equipamiento","infraestructura","edificio público"]
},

{
codigo:"TIP-INF-002",
nombre:"Mejoramiento de infraestructura pública",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Adecuación, mantenimiento y rehabilitación de edificaciones y espacios públicos.",
problemaCentral:"Deterioro de la infraestructura pública municipal.",
objetivoGeneral:"Mejorar el estado de la infraestructura pública.",
productos:["PRO-INF-002","PRO-DOT-001"],
actividades:["ACT-PLA-003","ACT-EJE-001","ACT-CTL-001"],
indicadores:["IND-PRO-002","IND-PRO-011","IND-RES-003"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["mantenimiento","rehabilitación","infraestructura"]
},

{
codigo:"TIP-INF-003",
nombre:"Plazas de mercado",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Construcción, ampliación o modernización de plazas de mercado municipales.",
problemaCentral:"Infraestructura comercial insuficiente o deteriorada.",
objetivoGeneral:"Fortalecer la infraestructura para comercialización local.",
productos:["PRO-INF-001","PRO-DOT-001","PRO-SER-001"],
actividades:["ACT-PLA-003","ACT-EJE-001","ACT-EJE-003"],
indicadores:["IND-PRO-001","IND-PRO-011","IND-RES-002"],
riesgos:["RIE-CON-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-SEC-005","POB-TER-003"],
palabrasClave:["plaza de mercado","mercado"]
},

{
codigo:"TIP-INF-004",
nombre:"Cementerios municipales",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Construcción, ampliación y adecuación de cementerios municipales.",
problemaCentral:"Capacidad insuficiente del cementerio municipal.",
objetivoGeneral:"Ampliar la capacidad de infraestructura funeraria.",
productos:["PRO-INF-001","PRO-INF-002"],
actividades:["ACT-PLA-003","ACT-EJE-001"],
indicadores:["IND-PRO-001","IND-PRO-002"],
riesgos:["RIE-CON-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["cementerio","infraestructura funeraria"]
},

{
codigo:"TIP-INF-005",
nombre:"Mantenimiento de bienes públicos",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Programa integral de mantenimiento preventivo y correctivo de bienes inmuebles municipales.",
problemaCentral:"Insuficiente mantenimiento de bienes públicos.",
objetivoGeneral:"Garantizar la conservación de la infraestructura municipal.",
productos:["PRO-INF-002","PRO-SER-001"],
actividades:["ACT-PLA-003","ACT-EJE-001","ACT-CTL-001"],
indicadores:["IND-PRO-002","IND-PRO-030","IND-RES-003"],
riesgos:["RIE-FIN-001","RIE-CON-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["mantenimiento","bienes públicos","infraestructura municipal"]
}

];

function registrar(){
 if(window.MotorTipologias){
   MotorTipologias.registrarVarias(tipologias);
 }
}

function listar(){
 return tipologias.map(t=>({...t}));
}

registrar();

return {listar,registrar};

})();

window.PlantillasInfraestructuraMunicipal=PlantillasInfraestructuraMunicipal;
