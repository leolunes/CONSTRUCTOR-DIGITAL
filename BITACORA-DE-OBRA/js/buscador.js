'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/buscador.js
   Propósito: buscador global de la aplicación
   ========================================================= */

(() => {

const EVENTOS = Object.freeze({
BUSQUEDA:'bitacora:busqueda-realizada'
});

function normalizar(texto){
 return String(texto||'').toLowerCase().trim();
}

function buscarEnColeccion(nombre, elementos, campos, criterio){
 const texto = normalizar(criterio);
 return (elementos||[]).filter(item=>{
   const cadena = campos.map(c=>String(item[c]??'')).join(' ').toLowerCase();
   return cadena.includes(texto);
 }).map(item=>({tipo:nombre, dato:item}));
}

function buscar(criterio=''){
 const resultados=[];

 resultados.push(
   ...buscarEnColeccion(
     'folio',
     window.BitacoraFolios?.obtenerTodos?.(),
     ['numero','titulo','observaciones'],
     criterio
   )
 );

 resultados.push(
   ...buscarEnColeccion(
     'obra',
     window.BitacoraObras?.obtenerTodas?.(),
     ['nombre','numeroContrato','objetoContrato'],
     criterio
   )
 );

 resultados.push(
   ...buscarEnColeccion(
     'contratista',
     window.BitacoraContratistas?.obtenerTodos?.(),
     ['nombre','nit','representante'],
     criterio
   )
 );

 resultados.push(
   ...buscarEnColeccion(
     'anexo',
     window.BitacoraAnexos?.obtenerTodos?.(),
     ['nombre','descripcion','extension'],
     criterio
   )
 );

 resultados.push(
   ...buscarEnColeccion(
     'imagen',
     window.BitacoraImagenes?.obtenerTodas?.(),
     ['titulo','descripcion'],
     criterio
   )
 );

 document.dispatchEvent(
   new CustomEvent(EVENTOS.BUSQUEDA,{
     detail:{
       criterio,
       total:resultados.length,
       resultados
     }
   })
 );

 return resultados;
}

window.BitacoraBuscador = Object.freeze({
 buscar
});

console.info('Buscador global inicializado.');

})();