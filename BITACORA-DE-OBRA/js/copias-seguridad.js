'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/copias-seguridad.js
   Propósito: administración de copias de seguridad
   ========================================================= */

(() => {

const CLAVE='bitacora_copias_seguridad';

const BD=()=>window.BitacoraBaseDatos||{};
const ALM=()=>window.BitacoraAlmacenamiento||{};

function obtenerCopias(){
  return ALM.leer?.(CLAVE) || [];
}

function guardarIndice(copias){
  if(ALM.guardar){
    ALM.guardar(CLAVE,copias);
  }else{
    localStorage.setItem(CLAVE,JSON.stringify(copias));
  }
}

function crear(nombre='Copia manual'){
  const respaldo={
    id:'backup-'+Date.now(),
    nombre,
    fecha:new Date().toISOString(),
    datos:BD.exportarJSON?BD.exportarJSON():'{}'
  };

  const copias=obtenerCopias();
  copias.unshift(respaldo);

  while(copias.length>20){
    copias.pop();
  }

  guardarIndice(copias);

  document.dispatchEvent(new CustomEvent(
    'bitacora:copia-creada',
    {detail:{copia:respaldo}}
  ));

  return respaldo;
}

function restaurar(id){
  const copia=obtenerCopias().find(c=>c.id===id);
  if(!copia) throw new Error('No existe la copia solicitada.');

  BD.importarJSON?.(copia.datos);

  document.dispatchEvent(new CustomEvent(
    'bitacora:copia-restaurada',
    {detail:{copia}}
  ));

  return copia;
}

function eliminar(id){
  const copias=obtenerCopias().filter(c=>c.id!==id);
  guardarIndice(copias);

  document.dispatchEvent(new CustomEvent(
    'bitacora:copia-eliminada',
    {detail:{id}}
  ));

  return true;
}

function exportarListado(){
  return JSON.stringify(obtenerCopias(),null,2);
}

window.BitacoraCopiasSeguridad=Object.freeze({
  crear,
  restaurar,
  eliminar,
  obtenerCopias,
  exportarListado
});

console.info('Copias de seguridad inicializadas.');

})();