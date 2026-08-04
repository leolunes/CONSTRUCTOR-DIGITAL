// =====================================
// PLANTILLAS/MUJER-EQUIDAD.JS
// CONSTRUCTOR MGA PRO
// =====================================

const PlantillasMujerEquidad = (()=>{

const SECTOR="Mujer y Equidad de Género";
const SECTOR_CODIGO="SEC-MUJ-001";

const comunes={
 riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-TEC-001"],
 normasBase:["NOR-MUJ-001","NOR-MUJ-002","NOR-CON-001","NOR-GEN-002"],
 fuentesBase:["FUE-PUB-001","FUE-NAC-001","FUE-SGP-001","FUE-COO-002"]
};

const tipologias=[

{
codigo:"TIP-MUJ-001",
nombre:"Autonomía económica de las mujeres",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Fortalecimiento de capacidades productivas, empresariales y laborales de las mujeres.",
problemaCentral:"Limitadas oportunidades de generación de ingresos para las mujeres.",
objetivoGeneral:"Fortalecer la autonomía económica de las mujeres.",
productos:["PRO-FOR-001","PRO-FOR-003","PRO-SER-002","PRO-DOT-004"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-005"],
indicadores:["IND-PRO-020","IND-PRO-022","IND-PRO-031","IND-IMP-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-CV-001"],
palabrasClave:["mujer","emprendimiento","autonomía económica"]
},

{
codigo:"TIP-MUJ-002",
nombre:"Prevención de violencias basadas en género",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Acciones de prevención, atención y sensibilización frente a violencias basadas en género.",
problemaCentral:"Alta incidencia de violencias contra las mujeres.",
objetivoGeneral:"Reducir las violencias basadas en género.",
productos:["PRO-FOR-001","PRO-SER-003","PRO-SER-004"],
actividades:["ACT-PLA-009","ACT-EJE-004","ACT-EJE-005"],
indicadores:["IND-PRO-020","IND-PRO-033","IND-RES-001"],
riesgos:["RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-CV-001","POB-VUL-003"],
palabrasClave:["violencia","género","mujer"]
},

{
codigo:"TIP-MUJ-003",
nombre:"Participación y liderazgo de las mujeres",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Fortalecer la participación social, comunitaria y política de las mujeres.",
problemaCentral:"Baja participación de las mujeres en espacios de decisión.",
objetivoGeneral:"Incrementar la participación y liderazgo femenino.",
productos:["PRO-FOR-002","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-EJE-004"],
indicadores:["IND-PRO-021","IND-PRO-031"],
riesgos:["RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-CV-001"],
palabrasClave:["liderazgo","participación","equidad"]
},

{
codigo:"TIP-MUJ-004",
nombre:"Casas de la Mujer",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Fortalecimiento de espacios integrales de atención para las mujeres.",
problemaCentral:"Oferta institucional insuficiente para atención integral.",
objetivoGeneral:"Fortalecer la atención integral a las mujeres.",
productos:["PRO-INF-001","PRO-DOT-001","PRO-SER-001"],
actividades:["ACT-PLA-003","ACT-EJE-001","ACT-EJE-005"],
indicadores:["IND-PRO-001","IND-PRO-030","IND-RES-003"],
riesgos:["RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-CV-001"],
palabrasClave:["casa de la mujer","atención"]
},

{
codigo:"TIP-MUJ-005",
nombre:"Política pública de mujer y equidad",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Formulación, implementación y seguimiento de políticas públicas de mujer.",
problemaCentral:"Débil incorporación del enfoque de género en la gestión pública.",
objetivoGeneral:"Fortalecer la política pública de mujer y equidad.",
productos:["PRO-GES-003","PRO-FOR-002","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-005"],
indicadores:["IND-PRO-042","IND-PRO-021","IND-RES-003"],
riesgos:["RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
poblaciones:["POB-TER-003"],
palabrasClave:["política pública","equidad de género"]
}

];

function registrar(){
 if(window.MotorTipologias){
  MotorTipologias.registrarVarias(tipologias);
 }
}

function listar(){ return tipologias.map(x=>({...x})); }

registrar();

return {listar,registrar};

})();

window.PlantillasMujerEquidad=PlantillasMujerEquidad;
