// =====================================
// PLANTILLAS/JUSTICIA.JS
// CONSTRUCTOR MGA PRO
// =====================================

const PlantillasJusticia = (()=>{

const SECTOR="Justicia";
const SECTOR_CODIGO="SEC-JUS-001";

const comunes={
 riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-TEC-001"],
 normasBase:["NOR-JUS-001","NOR-JUS-002","NOR-CON-001","NOR-GEN-002"],
 fuentesBase:["FUE-PUB-001","FUE-NAC-001","FUE-COO-002"]
};

const tipologias=[

{
codigo:"TIP-JUS-001",
nombre:"Casa de Justicia",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Fortalecimiento de Casas de Justicia para acceso oportuno a servicios de justicia.",
problemaCentral:"Limitado acceso de la ciudadanía a servicios integrales de justicia.",
objetivoGeneral:"Mejorar el acceso a la justicia.",
causasDirectas:["Infraestructura insuficiente.","Débil articulación institucional."],
causasIndirectas:["Barreras geográficas.","Desconocimiento ciudadano."],
efectosDirectos:["Conflictos sin resolver.","Congestión institucional."],
efectosIndirectos:["Pérdida de confianza.","Mayor conflictividad."],
objetivosEspecificos:["Fortalecer infraestructura.","Integrar entidades.","Mejorar atención."],
productos:["PRO-INF-001","PRO-DOT-001","PRO-SER-001"],
actividades:["ACT-PLA-003","ACT-EJE-001","ACT-EJE-005"],
indicadores:["IND-PRO-001","IND-PRO-030","IND-RES-003"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
beneficios:"Mayor acceso a la justicia.",
sostenibilidad:"Gestión institucional permanente.",
palabrasClave:["casa de justicia","acceso a justicia"]
},

{
codigo:"TIP-JUS-002",
nombre:"Conciliación en equidad",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Formación y fortalecimiento de conciliadores en equidad.",
problemaCentral:"Escasa resolución alternativa de conflictos.",
objetivoGeneral:"Fortalecer mecanismos alternativos de solución de conflictos.",
productos:["PRO-FOR-002","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-EJE-004","ACT-EJE-005"],
indicadores:["IND-PRO-021","IND-PRO-031"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["conciliación","equidad"]
},

{
codigo:"TIP-JUS-003",
nombre:"Comisarías de Familia",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Fortalecimiento de la capacidad institucional de las Comisarías de Familia.",
problemaCentral:"Capacidad insuficiente para atender conflictos familiares y violencias.",
objetivoGeneral:"Mejorar la atención integral en Comisarías de Familia.",
productos:["PRO-DOT-002","PRO-FOR-002","PRO-SER-001"],
actividades:["ACT-PLA-003","ACT-EJE-003","ACT-EJE-005"],
indicadores:["IND-PRO-011","IND-PRO-021","IND-RES-003"],
riesgos:["RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-CV-001","POB-CV-002","POB-CV-006"],
palabrasClave:["comisaría","familia"]
},

{
codigo:"TIP-JUS-004",
nombre:"Atención integral a víctimas",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Fortalecimiento de rutas de atención, orientación y acceso a derechos de víctimas.",
problemaCentral:"Barreras de acceso a la oferta institucional para víctimas.",
objetivoGeneral:"Fortalecer la atención integral a víctimas.",
productos:["PRO-SER-001","PRO-SER-003","PRO-FOR-004"],
actividades:["ACT-PLA-001","ACT-EJE-004","ACT-EJE-005"],
indicadores:["IND-PRO-030","IND-PRO-023","IND-RES-001"],
riesgos:["RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-VUL-003"],
palabrasClave:["víctimas","reparación"]
},

{
codigo:"TIP-JUS-005",
nombre:"Prevención de violencias",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Acciones preventivas frente a violencia intrafamiliar, sexual y basada en género.",
problemaCentral:"Alta incidencia de violencias contra poblaciones vulnerables.",
objetivoGeneral:"Reducir factores asociados a las violencias.",
productos:["PRO-FOR-001","PRO-SER-003"],
actividades:["ACT-PLA-009","ACT-EJE-004"],
indicadores:["IND-PRO-020","IND-RES-001"],
riesgos:["RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-CV-001","POB-CV-002","POB-VUL-003"],
palabrasClave:["violencia","prevención","género"]
}

];

function registrar(){ if(window.MotorTipologias){MotorTipologias.registrarVarias(tipologias);} }
function listar(){ return tipologias.map(x=>({...x})); }

registrar();

return {listar,registrar};

})();

window.PlantillasJusticia=PlantillasJusticia;
