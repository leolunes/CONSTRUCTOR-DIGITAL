// =====================================
// MOTOR-IA-SECTORIAL.JS
// CONSTRUCTOR MGA PRO
// Generador inteligente de estructuras MGA por sector
// =====================================

const MotorIASectorial = (()=>{

const PLANTILLAS={

salud:{
 problema:"Insuficiente acceso de la población a servicios integrales de salud.",
 objetivo:"Mejorar el acceso oportuno y la calidad de los servicios de salud.",
 productos:[
  "Infraestructura construida o mejorada",
  "Dotación biomédica instalada",
  "Personal capacitado"
 ],
 riesgos:[
  "Retrasos contractuales",
  "Incremento de costos",
  "Baja participación comunitaria"
 ]
},

educacion:{
 problema:"Limitadas condiciones para la prestación del servicio educativo.",
 objetivo:"Fortalecer las condiciones de prestación del servicio educativo.",
 productos:[
  "Infraestructura educativa mejorada",
  "Dotación escolar entregada",
  "Docentes capacitados"
 ],
 riesgos:[
  "Demoras constructivas",
  "Baja matrícula",
  "Retrasos en suministros"
 ]
},

transporte:{
 problema:"Deficiente conectividad vial.",
 objetivo:"Mejorar la movilidad y conectividad.",
 productos:[
  "Vías intervenidas",
  "Obras de drenaje",
  "Señalización instalada"
 ],
 riesgos:[
  "Clima",
  "Predios",
  "Licencias"
 ]
},

desarrollo_social:{
 problema:"Insuficiente acceso de la población a programas integrales de bienestar.",
 objetivo:"Fortalecer el bienestar y la inclusión social.",
 productos:[
  "Centro de atención construido",
  "Programas implementados",
  "Beneficiarios atendidos"
 ],
 riesgos:[
  "Baja cobertura",
  "Financiación",
  "Participación"
 ]
}

};

function generarProyecto({sector="",nombreProyecto="",municipio="",departamento=""}){

 const key=normalizarSector(sector);
 const p=PLANTILLAS[key]||PLANTILLAS.desarrollo_social;

 return{

  diagnostico:{
   sector,
   municipio,
   departamento,
   situacionActual:
   `En ${municipio||"el territorio"} se evidencian necesidades asociadas al sector ${sector}.`,
   problemaCentral:p.problema,
   justificacion:
   `El proyecto "${nombreProyecto}" permitirá atender el problema identificado mediante una intervención pública sostenible.`
  },

  arbolObjetivos:{
   objetivoGeneral:p.objetivo
  },

  cadenaValor:{
   objetivoGeneral:p.objetivo,
   objetivosEspecificos:[
    {id:uid(),texto:"Incrementar la cobertura del servicio."},
    {id:uid(),texto:"Fortalecer la capacidad institucional."}
   ],
   productos:p.productos.map((x,i)=>({
    id:uid(),
    nombre:x,
    meta:1,
    unidadMedida:"Unidad",
    objetivoEspecificoId:null,
    orden:i+1
   })),
   actividades:[
    {id:uid(),nombre:"Estudios y diseños",duracionMeses:2},
    {id:uid(),nombre:"Proceso contractual",duracionMeses:2},
    {id:uid(),nombre:"Ejecución",duracionMeses:8},
    {id:uid(),nombre:"Supervisión",duracionMeses:10}
   ]
  },

  riesgos:p.riesgos.map(r=>({
   id:uid(),
   nombre:r,
   probabilidad:"Media",
   impacto:"Medio"
  }))

 };

}

function aplicarPlantilla(projectId,datos){

 if(!window.MGA) return null;

 const estructura=
 generarProyecto(datos);

 return MGA.updateModel(projectId,estructura);

}

function sectoresDisponibles(){
 return Object.keys(PLANTILLAS);
}

function normalizarSector(s){
 s=String(s||"").toLowerCase().trim();
 if(s.includes("salud")) return "salud";
 if(s.includes("educ")) return "educacion";
 if(s.includes("trans")) return "transporte";
 if(s.includes("social")) return "desarrollo_social";
 return "desarrollo_social";
}

function uid(){
 return "ia_"+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
}

return{
 generarProyecto,
 aplicarPlantilla,
 sectoresDisponibles
};

})();

window.MotorIASectorial=MotorIASectorial;
