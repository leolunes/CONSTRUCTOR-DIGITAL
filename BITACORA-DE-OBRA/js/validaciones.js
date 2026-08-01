'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/validaciones.js
   Propósito: validaciones generales de la aplicación
   ========================================================= */

(() => {

function requerido(valor){
  return String(valor ?? '').trim().length > 0;
}

function longitudMinima(valor,minimo){
  return String(valor ?? '').trim().length >= minimo;
}

function longitudMaxima(valor,maximo){
  return String(valor ?? '').trim().length <= maximo;
}

function numero(valor){
  return !isNaN(Number(valor));
}

function entero(valor){
  return Number.isInteger(Number(valor));
}

function positivo(valor){
  return numero(valor) && Number(valor) >= 0;
}

function rango(valor,min,max){
  if(!numero(valor)) return false;
  const n = Number(valor);
  return n >= min && n <= max;
}

function correo(valor){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor).trim());
}

function telefono(valor){
  return /^[0-9()+\-\s]{7,20}$/.test(String(valor).trim());
}

function nit(valor){
  return /^[0-9\-\.]{5,25}$/.test(String(valor).trim());
}

function fecha(valor){
  if(!valor) return false;
  return !isNaN(new Date(valor).getTime());
}

function coordenada(valor){
  return numero(valor) && rango(Number(valor),-180,180);
}

function porcentaje(valor){
  return rango(valor,0,100);
}

function validarFormulario(reglas={}){

  const errores=[];

  Object.entries(reglas).forEach(([campo,config])=>{

    const valor=config.valor;

    if(config.requerido && !requerido(valor)){
      errores.push(`${campo}: obligatorio`);
      return;
    }

    if(config.minimo && !longitudMinima(valor,config.minimo))
      errores.push(`${campo}: longitud mínima ${config.minimo}`);

    if(config.maximo && !longitudMaxima(valor,config.maximo))
      errores.push(`${campo}: longitud máxima ${config.maximo}`);

    if(config.tipo==='numero' && !numero(valor))
      errores.push(`${campo}: número inválido`);

    if(config.tipo==='correo' && valor && !correo(valor))
      errores.push(`${campo}: correo inválido`);

    if(config.tipo==='telefono' && valor && !telefono(valor))
      errores.push(`${campo}: teléfono inválido`);

    if(config.tipo==='fecha' && valor && !fecha(valor))
      errores.push(`${campo}: fecha inválida`);

    if(config.tipo==='nit' && valor && !nit(valor))
      errores.push(`${campo}: NIT inválido`);

    if(config.tipo==='porcentaje' && valor!=='' && !porcentaje(valor))
      errores.push(`${campo}: porcentaje inválido`);

  });

  return {
    valido: errores.length===0,
    errores
  };

}

window.BitacoraValidaciones = Object.freeze({

  requerido,
  longitudMinima,
  longitudMaxima,
  numero,
  entero,
  positivo,
  rango,
  correo,
  telefono,
  nit,
  fecha,
  coordenada,
  porcentaje,
  validarFormulario

});

console.info('Validaciones inicializadas.');

})();