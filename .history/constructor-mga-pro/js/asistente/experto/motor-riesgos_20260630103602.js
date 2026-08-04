// =====================================
// MOTOR-RIESGOS.JS
// CONSTRUCTOR MGA PRO
// Generación automática de matriz de riesgos
// =====================================

const MotorRiesgos=(()=>{

const DEFECTO=[
{tipo:"Técnico",probabilidad:"Media",impacto:"Alto",riesgo:"Cambios en diseños o especificaciones.",mitigacion:"Revisión técnica previa y control de cambios.",responsable:"Supervisor del proyecto"},
{tipo:"Financiero",probabilidad:"Media",impacto:"Alto",riesgo:"Incremento de costos.",mitigacion:"Seguimiento presupuestal y contingencias.",responsable:"Director financiero"},
{tipo:"Contractual",probabilidad:"Baja",impacto:"Alto",riesgo:"Retrasos del contratista.",mitigacion:"Cronograma y supervisión permanente.",responsable:"Supervisor"},
{tipo:"Ambiental",probabilidad:"Baja",impacto:"Medio",riesgo:"Afectaciones ambientales.",mitigacion:"Cumplimiento de obligaciones ambientales.",responsable:"Contratista"},
{tipo:"Social",probabilidad:"Media",impacto:"Medio",riesgo:"Resistencia de la comunidad.",mitigacion:"Socialización y participación ciudadana.",responsable:"Entidad ejecutora"}
];

function clonar(x){return JSON.parse(JSON.stringify(x));}

function obtenerPorTipologia(codigo){
 if(window.MotorConocimiento){
   const t=MotorConocimiento.obtenerTipologia(codigo);
   if(t && Array.isArray(t.riesgos) && t.riesgos.length){
     const base=clonar(DEFECTO);
     t.riesgos.forEach((r,i)=>{
       if(base[i]) base[i].codigoCatalogo=r;
       else base.push({tipo:"Específico",codigoCatalogo:r,probabilidad:"Media",impacto:"Medio",riesgo:"Riesgo tomado del catálogo.",mitigacion:"Definir plan de tratamiento.",responsable:"Equipo del proyecto"});
     });
     return base;
   }
 }
 return clonar(DEFECTO);
}

function desdeTexto(texto){
 if(!window.MotorAnalisis) return clonar(DEFECTO);
 const a=MotorAnalisis.analizar(texto);
 if(!a.ok) return clonar(DEFECTO);
 return obtenerPorTipologia(a.tipologiaCodigo);
}

function matriz(texto){
 const riesgos=desdeTexto(texto);
 return {
   proyecto:texto,
   total:riesgos.length,
   riesgos
 };
}

return{
 obtenerPorTipologia,
 desdeTexto,
 matriz
};

})();

window.MotorRiesgos=MotorRiesgos;
