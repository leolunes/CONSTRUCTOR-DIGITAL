// =====================================
// PLANTILLAS/GOBIERNO.JS
// CONSTRUCTOR MGA PRO
// =====================================

const PlantillasGobierno = (()=>{

const SECTOR="Gobierno";
const SECTOR_CODIGO="SEC-GOB-001";

const comunes={
 riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-TEC-001","RIE-CON-001"],
 normasBase:["NOR-GOB-001","NOR-GOB-002","NOR-CON-001","NOR-GEN-002"],
 fuentesBase:["FUE-PUB-001","FUE-NAC-001","FUE-SGP-001","FUE-COO-002"]
};

const tipologias=[

{
codigo:"TIP-GOB-001",
nombre:"Fortalecimiento institucional",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Fortalecer la capacidad administrativa, técnica y operativa de la entidad territorial.",
problemaCentral:"Baja capacidad institucional para cumplir funciones y prestar servicios.",
objetivoGeneral:"Fortalecer la capacidad institucional de la entidad territorial.",
causasDirectas:["Procesos desactualizados.","Déficit de capacidades técnicas."],
causasIndirectas:["Limitada modernización institucional.","Baja inversión en fortalecimiento."],
efectosDirectos:["Menor eficiencia administrativa.","Retrasos en la prestación de servicios."],
efectosIndirectos:["Disminución de confianza ciudadana.","Baja competitividad institucional."],
objetivosEspecificos:["Modernizar procesos.","Fortalecer talento humano.","Mejorar gestión institucional."],
productos:["PRO-GES-003","PRO-FOR-002","PRO-TIC-003"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005"],
indicadores:["IND-PRO-042","IND-PRO-021","IND-RES-003"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
beneficios:"Mayor eficiencia y mejor servicio al ciudadano.",
sostenibilidad:"Seguimiento institucional y mejora continua.",
palabrasClave:["fortalecimiento institucional","gobierno","administración pública"]
},

{
codigo:"TIP-GOB-002",
nombre:"Modernización administrativa",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Actualización de procesos, manuales, estructura y herramientas administrativas.",
problemaCentral:"Procesos administrativos poco eficientes.",
objetivoGeneral:"Modernizar la gestión administrativa.",
productos:["PRO-GES-003","PRO-TIC-003"],
actividades:["ACT-PLA-001","ACT-EJE-004"],
indicadores:["IND-PRO-042","IND-PRO-052"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["modernización","procesos"]
},

{
codigo:"TIP-GOB-003",
nombre:"Gobierno abierto y transparencia",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Fortalecimiento de transparencia, participación y acceso a la información.",
problemaCentral:"Baja participación y transparencia institucional.",
objetivoGeneral:"Fortalecer el gobierno abierto.",
productos:["PRO-GES-003","PRO-SER-002","PRO-TIC-003"],
actividades:["ACT-PLA-001","ACT-EJE-004","ACT-EJE-005"],
indicadores:["IND-PRO-042","IND-PRO-031","IND-RES-003"],
riesgos:["RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["transparencia","gobierno abierto","participación"]
},

{
codigo:"TIP-GOB-004",
nombre:"Servicio al ciudadano",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Mejoramiento de la atención presencial y digital al ciudadano.",
problemaCentral:"Baja calidad en la atención ciudadana.",
objetivoGeneral:"Mejorar la atención al ciudadano.",
productos:["PRO-SER-001","PRO-FOR-002","PRO-TIC-003"],
actividades:["ACT-PLA-001","ACT-EJE-004","ACT-EJE-005"],
indicadores:["IND-PRO-030","IND-PRO-021","IND-RES-003"],
riesgos:["RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["PQRSD","servicio al ciudadano"]
},

{
codigo:"TIP-GOB-005",
nombre:"Gestión documental institucional",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Fortalecer archivos, gestión documental y preservación de la información.",
problemaCentral:"Procesos documentales ineficientes.",
objetivoGeneral:"Optimizar la gestión documental institucional.",
productos:["PRO-TIC-003","PRO-GES-003","PRO-FOR-002"],
actividades:["ACT-PLA-002","ACT-EJE-004"],
indicadores:["IND-PRO-052","IND-PRO-042"],
riesgos:["RIE-TEC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["archivo","gestión documental"]
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

window.PlantillasGobierno=PlantillasGobierno;
