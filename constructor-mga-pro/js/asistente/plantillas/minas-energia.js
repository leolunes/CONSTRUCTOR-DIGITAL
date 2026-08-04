// =====================================
// PLANTILLAS/MINAS-ENERGIA.JS
// CONSTRUCTOR MGA PRO
// =====================================

const PlantillasMinasEnergia = (()=>{

const SECTOR="Minas y Energía";
const SECTOR_CODIGO="SEC-MIN-001";

const comunes={
 riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-AMB-001"],
 normasBase:["NOR-MIN-001","NOR-ENE-001","NOR-CON-001","NOR-GEN-002"],
 fuentesBase:["FUE-PUB-001","FUE-NAC-001","FUE-REG-001","FUE-COO-002"]
};

const tipologias=[

{
codigo:"TIP-MIN-001",
nombre:"Electrificación rural",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Ampliación de cobertura del servicio de energía eléctrica en zonas rurales.",
problemaCentral:"Hogares rurales sin acceso al servicio de energía.",
objetivoGeneral:"Incrementar la cobertura de energía eléctrica rural.",
causasDirectas:["Redes insuficientes.","Baja inversión."],
causasIndirectas:["Dispersión poblacional.","Altos costos."],
efectosDirectos:["Limitaciones productivas y sociales.","Baja calidad de vida."],
efectosIndirectos:["Mayor pobreza rural.","Brecha territorial."],
objetivosEspecificos:["Construir redes.","Conectar usuarios.","Garantizar operación."],
productos:["PRO-INF-001","PRO-INF-002","PRO-SER-001"],
actividades:["ACT-PLA-003","ACT-EJE-001","ACT-CTL-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-RES-002"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-001"],
beneficios:"Acceso a energía y mejora de calidad de vida.",
sostenibilidad:"Operación del prestador y mantenimiento.",
palabrasClave:["electrificación","energía rural"]
},

{
codigo:"TIP-MIN-002",
nombre:"Energía solar fotovoltaica",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Implementación de sistemas solares para viviendas o equipamientos.",
problemaCentral:"Dependencia de fuentes convencionales o ausencia de energía.",
objetivoGeneral:"Promover soluciones energéticas sostenibles.",
productos:["PRO-DOT-002","PRO-INF-002"],
actividades:["ACT-PLA-003","ACT-EJE-003","ACT-CTL-002"],
indicadores:["IND-PRO-011","IND-RES-002"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-001"],
palabrasClave:["solar","fotovoltaica","energía renovable"]
},

{
codigo:"TIP-MIN-003",
nombre:"Alumbrado público eficiente",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Modernización del alumbrado público con tecnología LED.",
problemaCentral:"Sistema de alumbrado ineficiente.",
objetivoGeneral:"Mejorar eficiencia energética del alumbrado.",
productos:["PRO-DOT-002","PRO-INF-002"],
actividades:["ACT-PLA-003","ACT-EJE-003"],
indicadores:["IND-PRO-011","IND-RES-003"],
riesgos:["RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["LED","alumbrado"]
},

{
codigo:"TIP-MIN-004",
nombre:"Eficiencia energética institucional",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Reducción del consumo energético en edificios públicos.",
problemaCentral:"Alto consumo de energía.",
objetivoGeneral:"Incrementar la eficiencia energética.",
productos:["PRO-DOT-002","PRO-FOR-002"],
actividades:["ACT-PLA-001","ACT-EJE-003","ACT-EJE-004"],
indicadores:["IND-PRO-011","IND-PRO-021"],
riesgos:["RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["eficiencia energética"]
},

{
codigo:"TIP-MIN-005",
nombre:"Transición energética",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyectos para adopción de energías limpias y descarbonización.",
problemaCentral:"Alta dependencia de energías convencionales.",
objetivoGeneral:"Promover transición hacia energías limpias.",
productos:["PRO-FOR-002","PRO-SER-002","PRO-DOT-002"],
actividades:["ACT-PLA-001","ACT-EJE-004","ACT-EJE-005"],
indicadores:["IND-PRO-021","IND-RES-003"],
riesgos:["RIE-AMB-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["transición energética","energía limpia"]
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

window.PlantillasMinasEnergia=PlantillasMinasEnergia;