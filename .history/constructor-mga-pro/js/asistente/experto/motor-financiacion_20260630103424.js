// =====================================
// MOTOR-FINANCIACION.JS
// CONSTRUCTOR MGA PRO
// Recomendación de fuentes de financiación
// =====================================

const MotorFinanciacion = (()=>{

const REGLAS = [

{
sector:"Transporte",
fuentes:[
"SGP - Propósito General",
"Sistema General de Regalías",
"INVÍAS",
"Ministerio de Transporte",
"Recursos Propios",
"Crédito Público"
]
},

{
sector:"Agua Potable y Saneamiento Básico",
fuentes:[
"SGP Agua Potable",
"Ministerio de Vivienda",
"Sistema General de Regalías",
"Plan Departamental de Aguas",
"Recursos Propios"
]
},

{
sector:"Salud",
fuentes:[
"SGP Salud",
"Ministerio de Salud",
"ADRES",
"Sistema General de Regalías",
"Recursos Propios"
]
},

{
sector:"Educación",
fuentes:[
"SGP Educación",
"Ministerio de Educación",
"Sistema General de Regalías",
"Recursos Propios"
]
},

{
sector:"Vivienda",
fuentes:[
"Ministerio de Vivienda",
"Fonvivienda",
"Sistema General de Regalías",
"Recursos Propios"
]
},

{
sector:"Agricultura y Desarrollo Rural",
fuentes:[
"Ministerio de Agricultura",
"ADR",
"Agrosavia",
"Sistema General de Regalías",
"Recursos Propios"
]
}

];

const GENERICAS=[
"Recursos Propios",
"Sistema General de Regalías",
"SGP",
"Cooperación Internacional",
"Crédito Público",
"Alianzas Público-Privadas"
];

function normalizar(t){
 return String(t||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}

function recomendarSector(sector){

 const regla=REGLAS.find(r=>normalizar(r.sector)===normalizar(sector));

 return regla ? [...regla.fuentes] : [...GENERICAS];
}

function recomendarTipologia(codigoTipologia){

 if(!window.MotorConocimiento){
   return [...GENERICAS];
 }

 const tip=MotorConocimiento.obtenerTipologia(codigoTipologia);

 if(!tip){
   return [...GENERICAS];
 }

 const lista=recomendarSector(tip.sector);

 (tip.fuentes||[]).forEach(f=>{
   if(!lista.includes(f)) lista.push(f);
 });

 return lista;
}

function recomendarDesdeTexto(texto){

 if(!window.MotorAnalisis){
   return [...GENERICAS];
 }

 const a=MotorAnalisis.analizar(texto);

 if(!a.ok){
   return [...GENERICAS];
 }

 return recomendarTipologia(a.tipologiaCodigo);
}

function informe(texto){

 const fuentes=recomendarDesdeTexto(texto);

 return{
   proyecto:texto,
   fuentes,
   recomendacionPrincipal:fuentes[0]||"",
   observacion:"Las fuentes sugeridas son una orientación inicial y deben validarse con la normatividad y convocatorias vigentes."
 };
}

return{
 recomendarSector,
 recomendarTipologia,
 recomendarDesdeTexto,
 informe
};

})();

window.MotorFinanciacion=MotorFinanciacion;
