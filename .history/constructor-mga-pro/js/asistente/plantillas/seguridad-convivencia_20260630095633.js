// =====================================
// PLANTILLAS/SEGURIDAD-CONVIVENCIA.JS
// CONSTRUCTOR MGA PRO
// =====================================

const PlantillasSeguridadConvivencia = (()=>{

const SECTOR="Seguridad y Convivencia Ciudadana";
const SECTOR_CODIGO="SEC-SEG-001";

const comunes={
 riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-CON-001","RIE-TEC-001"],
 normasBase:["NOR-SEG-001","NOR-SEG-002","NOR-CON-001","NOR-CON-003","NOR-GEN-002"],
 fuentesBase:["FUE-PUB-001","FUE-NAC-001","FUE-NAC-003","FUE-COO-002"]
};

const tipologias=[
{
codigo:"TIP-SEG-001",
nombre:"Fortalecimiento de la seguridad ciudadana",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Fortalece capacidades institucionales para prevenir el delito y mejorar la convivencia.",
problemaCentral:"Alta percepción de inseguridad y ocurrencia de delitos.",
objetivoGeneral:"Mejorar las condiciones de seguridad y convivencia.",
causasDirectas:["Baja capacidad operativa.","Escasa articulación institucional."],
causasIndirectas:["Débil cultura ciudadana.","Limitada prevención social."],
efectosDirectos:["Mayor victimización.","Pérdida de confianza."],
efectosIndirectos:["Afectación económica.","Deterioro del tejido social."],
objetivosEspecificos:["Fortalecer prevención.","Mejorar respuesta institucional.","Promover participación ciudadana."],
productos:["PRO-DOT-002","PRO-SER-001","PRO-FOR-002"],
actividades:["ACT-PLA-001","ACT-EJE-003","ACT-EJE-004","ACT-EJE-005"],
indicadores:["IND-PRO-011","IND-PRO-021","IND-RES-003"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
beneficios:"Mayor tranquilidad ciudadana.",
sostenibilidad:"Seguimiento institucional y participación comunitaria.",
palabrasClave:["seguridad","convivencia","delito"]
},
{
codigo:"TIP-SEG-002",
nombre:"Sistema de videovigilancia",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Implementación de cámaras, centros de monitoreo y analítica.",
problemaCentral:"Cobertura insuficiente de vigilancia tecnológica.",
objetivoGeneral:"Ampliar la vigilancia tecnológica del territorio.",
productos:["PRO-TIC-003","PRO-DOT-002"],
actividades:["ACT-PLA-003","ACT-EJE-003","ACT-CTL-002"],
indicadores:["IND-PRO-011","IND-PRO-052","IND-RES-003"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["cámaras","CCTV","videovigilancia"]
},
{
codigo:"TIP-SEG-003",
nombre:"Frentes de seguridad",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Organización comunitaria para prevención del delito.",
problemaCentral:"Baja organización comunitaria en seguridad.",
objetivoGeneral:"Fortalecer redes comunitarias de prevención.",
productos:["PRO-FOR-001","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-EJE-004","ACT-EJE-005"],
indicadores:["IND-PRO-020","IND-PRO-031"],
riesgos:["RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"]
},
{
codigo:"TIP-SEG-004",
nombre:"Prevención del consumo de SPA",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Programas preventivos frente al consumo de sustancias psicoactivas.",
problemaCentral:"Incremento del consumo de SPA.",
objetivoGeneral:"Reducir factores de riesgo asociados al consumo.",
productos:["PRO-FOR-001","PRO-SER-003"],
actividades:["ACT-PLA-009","ACT-EJE-004"],
indicadores:["IND-PRO-020","IND-RES-001"],
riesgos:["RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-CV-003","POB-CV-004"]
},
{
codigo:"TIP-SEG-005",
nombre:"Justicia local y conciliación",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Fortalecimiento de mecanismos alternativos de resolución de conflictos.",
problemaCentral:"Alta conflictividad comunitaria.",
objetivoGeneral:"Mejorar el acceso a mecanismos de conciliación.",
productos:["PRO-FOR-002","PRO-SER-001"],
actividades:["ACT-PLA-001","ACT-EJE-005"],
indicadores:["IND-PRO-021","IND-RES-003"],
riesgos:["RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"]
}
];

function registrar(){ if(window.MotorTipologias){ MotorTipologias.registrarVarias(tipologias);} }
function listar(){ return tipologias.map(t=>({...t}));}
registrar();
return {listar,registrar};

})();

window.PlantillasSeguridadConvivencia=PlantillasSeguridadConvivencia;
