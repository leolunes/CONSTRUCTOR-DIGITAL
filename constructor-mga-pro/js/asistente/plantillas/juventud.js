// =====================================
// PLANTILLAS/JUVENTUD.JS
// CONSTRUCTOR MGA PRO
// =====================================

const PlantillasJuventud=(()=>{

const SECTOR="Juventud";
const SECTOR_CODIGO="SEC-JUV-001";

const comunes={
 riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-TEC-001"],
 normasBase:["NOR-JUV-001","NOR-JUV-002","NOR-CON-001","NOR-GEN-002"],
 fuentesBase:["FUE-PUB-001","FUE-NAC-001","FUE-SGP-001","FUE-COO-002"]
};

const tipologias=[

{
codigo:"TIP-JUV-001",
nombre:"Fortalecimiento integral de juventudes",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Programas para fortalecer capacidades, liderazgo, participación y proyecto de vida de los jóvenes.",
problemaCentral:"Limitadas oportunidades de desarrollo integral para la población joven.",
objetivoGeneral:"Fortalecer el desarrollo integral de las juventudes.",
productos:["PRO-FOR-001","PRO-FOR-002","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-005"],
indicadores:["IND-PRO-020","IND-PRO-021","IND-PRO-031","IND-IMP-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-CV-004"],
palabrasClave:["juventud","liderazgo","proyecto de vida"]
},

{
codigo:"TIP-JUV-002",
nombre:"Consejos de Juventud",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Fortalecimiento de instancias de participación juvenil.",
problemaCentral:"Baja participación juvenil en decisiones públicas.",
objetivoGeneral:"Incrementar la participación ciudadana de los jóvenes.",
productos:["PRO-FOR-002","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-EJE-004"],
indicadores:["IND-PRO-021","IND-PRO-031"],
riesgos:["RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-CV-004"],
palabrasClave:["consejo juventud","participación"]
},

{
codigo:"TIP-JUV-003",
nombre:"Empleabilidad juvenil",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Fortalecer competencias y oportunidades laborales para jóvenes.",
problemaCentral:"Alta tasa de desempleo juvenil.",
objetivoGeneral:"Mejorar la empleabilidad juvenil.",
productos:["PRO-FOR-001","PRO-FOR-003","PRO-SER-002"],
actividades:["ACT-PLA-009","ACT-EJE-004","ACT-EJE-005"],
indicadores:["IND-PRO-020","IND-PRO-022","IND-IMP-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-CV-004"],
palabrasClave:["empleo joven","juventud"]
},

{
codigo:"TIP-JUV-004",
nombre:"Prevención de riesgos en juventudes",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Prevención de consumo SPA, violencia y otras situaciones de riesgo.",
problemaCentral:"Alta exposición de jóvenes a factores de riesgo.",
objetivoGeneral:"Reducir factores de riesgo en población juvenil.",
productos:["PRO-FOR-001","PRO-SER-003"],
actividades:["ACT-PLA-009","ACT-EJE-004"],
indicadores:["IND-PRO-020","IND-RES-001"],
riesgos:["RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-CV-004"],
palabrasClave:["prevención","jóvenes","SPA"]
},

{
codigo:"TIP-JUV-005",
nombre:"Política pública de juventud",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Formulación e implementación de la política pública de juventud.",
problemaCentral:"Débil gestión pública para las juventudes.",
objetivoGeneral:"Fortalecer la política pública de juventud.",
productos:["PRO-GES-003","PRO-FOR-002","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-005"],
indicadores:["IND-PRO-042","IND-PRO-021","IND-RES-003"],
riesgos:["RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-CV-004"],
palabrasClave:["política pública","juventud"]
}

];

function registrar(){if(window.MotorTipologias){MotorTipologias.registrarVarias(tipologias);}}
function listar(){return tipologias.map(x=>({...x}));}
registrar();
return{listar,registrar};

})();

window.PlantillasJuventud=PlantillasJuventud;
