// =====================================
// PLANTILLAS/ADULTO-MAYOR.JS
// CONSTRUCTOR MGA PRO
// =====================================

const PlantillasAdultoMayor = (()=>{

const SECTOR="Adulto Mayor";
const SECTOR_CODIGO="SEC-AM-001";

const comunes={
 riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-TEC-001"],
 normasBase:["NOR-AM-001","NOR-AM-002","NOR-CON-001","NOR-GEN-002"],
 fuentesBase:["FUE-PUB-001","FUE-NAC-001","FUE-SGP-001","FUE-COO-002"]
};

const tipologias=[

{
codigo:"TIP-AM-001",
nombre:"Atención integral al adulto mayor",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Programas integrales de bienestar, protección, participación y envejecimiento activo.",
problemaCentral:"Limitado acceso de las personas mayores a servicios integrales de atención y bienestar.",
objetivoGeneral:"Fortalecer la atención integral y el bienestar de las personas mayores.",
productos:["PRO-SER-001","PRO-SER-003","PRO-FOR-001"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-005"],
indicadores:["IND-PRO-030","IND-PRO-020","IND-RES-001","IND-IMP-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-CV-006"],
palabrasClave:["adulto mayor","envejecimiento activo","bienestar"]
},

{
codigo:"TIP-AM-002",
nombre:"Centros Vida",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Fortalecimiento, dotación y operación de Centros Vida para personas mayores.",
problemaCentral:"Infraestructura insuficiente para atención del adulto mayor.",
objetivoGeneral:"Ampliar y fortalecer la oferta de Centros Vida.",
productos:["PRO-INF-001","PRO-DOT-001","PRO-SER-001"],
actividades:["ACT-PLA-003","ACT-EJE-001","ACT-EJE-003","ACT-EJE-005"],
indicadores:["IND-PRO-001","IND-PRO-011","IND-PRO-030"],
riesgos:["RIE-FIN-001","RIE-CON-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-CV-006"],
palabrasClave:["centro vida","adulto mayor"]
},

{
codigo:"TIP-AM-003",
nombre:"Envejecimiento activo y saludable",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Promoción de hábitos saludables, actividad física y participación social.",
problemaCentral:"Baja participación en actividades de envejecimiento activo.",
objetivoGeneral:"Promover estilos de vida saludables en personas mayores.",
productos:["PRO-FOR-001","PRO-SER-003"],
actividades:["ACT-PLA-009","ACT-EJE-004"],
indicadores:["IND-PRO-020","IND-RES-001"],
riesgos:["RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-CV-006"],
palabrasClave:["envejecimiento","actividad física","salud"]
},

{
codigo:"TIP-AM-004",
nombre:"Protección social del adulto mayor",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Fortalecimiento de rutas de protección y acceso a programas sociales.",
problemaCentral:"Débil acceso a programas de protección social.",
objetivoGeneral:"Mejorar la protección social de las personas mayores.",
productos:["PRO-SER-001","PRO-SER-002","PRO-FOR-004"],
actividades:["ACT-PLA-001","ACT-EJE-004","ACT-EJE-005"],
indicadores:["IND-PRO-030","IND-PRO-031","IND-RES-003"],
riesgos:["RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-CV-006"],
palabrasClave:["protección social","adulto mayor"]
},

{
codigo:"TIP-AM-005",
nombre:"Política pública de envejecimiento",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Formulación, implementación y seguimiento de la política pública de envejecimiento y vejez.",
problemaCentral:"Débil gestión pública para las personas mayores.",
objetivoGeneral:"Fortalecer la política pública de envejecimiento y vejez.",
productos:["PRO-GES-003","PRO-FOR-002","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-005"],
indicadores:["IND-PRO-042","IND-PRO-021","IND-RES-003"],
riesgos:["RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-CV-006"],
palabrasClave:["política pública","vejez","envejecimiento"]
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

window.PlantillasAdultoMayor=PlantillasAdultoMayor;
