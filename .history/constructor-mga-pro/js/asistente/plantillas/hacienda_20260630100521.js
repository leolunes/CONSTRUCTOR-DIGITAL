// =====================================
// PLANTILLAS/HACIENDA.JS
// CONSTRUCTOR MGA PRO
// =====================================

const PlantillasHacienda = (()=>{

const SECTOR="Hacienda Pública";
const SECTOR_CODIGO="SEC-HAC-001";

const comunes={
 riesgos:["RIE-FIN-001","RIE-TEC-001","RIE-CON-001","RIE-SOC-001"],
 normasBase:["NOR-HAC-001","NOR-HAC-002","NOR-CON-001","NOR-GEN-002"],
 fuentesBase:["FUE-PUB-001","FUE-SGP-001","FUE-NAC-001"]
};

const tipologias=[

{
codigo:"TIP-HAC-001",
nombre:"Fortalecimiento de la gestión tributaria",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Modernización de procesos de recaudo, fiscalización y administración tributaria.",
problemaCentral:"Bajo recaudo de ingresos propios.",
objetivoGeneral:"Incrementar el recaudo y la eficiencia tributaria.",
productos:["PRO-GES-003","PRO-TIC-003","PRO-FOR-002"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005"],
indicadores:["IND-PRO-042","IND-PRO-052","IND-RES-003"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["tributos","recaudo","impuestos"]
},

{
codigo:"TIP-HAC-002",
nombre:"Actualización del estatuto tributario",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Revisión y actualización del estatuto tributario territorial.",
problemaCentral:"Normativa tributaria desactualizada.",
objetivoGeneral:"Modernizar el marco tributario territorial.",
productos:["PRO-GES-003","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-EJE-005"],
indicadores:["IND-PRO-042","IND-RES-003"],
riesgos:["RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["estatuto tributario"]
},

{
codigo:"TIP-HAC-003",
nombre:"Gestión financiera territorial",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Fortalecimiento de la planeación financiera y sostenibilidad fiscal.",
problemaCentral:"Debilidades en la gestión financiera.",
objetivoGeneral:"Mejorar la sostenibilidad fiscal.",
productos:["PRO-GES-003","PRO-FOR-002"],
actividades:["ACT-PLA-002","ACT-EJE-004"],
indicadores:["IND-PRO-042","IND-PRO-021"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["finanzas","sostenibilidad fiscal"]
},

{
codigo:"TIP-HAC-004",
nombre:"Gestión de cartera",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Recuperación de cartera e implementación de estrategias de cobro.",
problemaCentral:"Alta cartera morosa.",
objetivoGeneral:"Incrementar la recuperación de cartera.",
productos:["PRO-GES-003","PRO-TIC-003"],
actividades:["ACT-PLA-002","ACT-EJE-005"],
indicadores:["IND-PRO-042","IND-PRO-052"],
riesgos:["RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["cartera","cobro"]
},

{
codigo:"TIP-HAC-005",
nombre:"Modernización catastral para recaudo",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Fortalecer la gestión predial y el recaudo asociado.",
problemaCentral:"Información predial insuficiente para optimizar el recaudo.",
objetivoGeneral:"Mejorar la gestión predial y tributaria.",
productos:["PRO-TIC-003","PRO-GES-003","PRO-SER-001"],
actividades:["ACT-PLA-002","ACT-EJE-004","ACT-EJE-005"],
indicadores:["IND-PRO-052","IND-PRO-042","IND-RES-003"],
riesgos:["RIE-TEC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["predial","catastro","recaudo"]
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

window.PlantillasHacienda=PlantillasHacienda;
