'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/base-datos.js
   Propósito: administración central de la base de datos local
   ========================================================= */

(() => {

const CLAVE='bitacora_base_datos';

const E=()=>window.BitacoraEstado||{};
const A=()=>window.BitacoraAlmacenamiento||localStorage;

function estructuraInicial(){
 return {
   version:1,
   fechaCreacion:new Date().toISOString(),
   catalogos:{
     obras:[],
     contratistas:[]
   },
   registros:{
     folios:[],
     anexos:[],
     imagenes:[]
   }
 };
}

function cargar(){
 let datos=A().leer?.(CLAVE);

 if(!datos){
   datos=estructuraInicial();
   guardar(datos);
 }

 E().reemplazarEstado?.(datos,{
   origen:'base-datos',
   marcarCambios:false
 });

 return datos;
}

function guardar(datos){
 if(A().guardar){
   A().guardar(CLAVE,datos);
 }else{
   localStorage.setItem(CLAVE,JSON.stringify(datos));
 }
 return true;
}

function sincronizar(){
 const estado=E().obtenerEstadoCompleto
   ?E().obtenerEstadoCompleto()
   :E().obtener?.()||estructuraInicial();

 guardar(estado);
 return estado;
}

function exportarJSON(){
 const datos=sincronizar();
 return JSON.stringify(datos,null,2);
}

function importarJSON(contenido){
 const datos=typeof contenido==='string'
   ?JSON.parse(contenido)
   :contenido;

 guardar(datos);

 E().reemplazarEstado?.(
   datos,
   {
     origen:'importacion',
     marcarCambios:false
   }
 );

 return datos;
}

function reiniciar(){
 const datos=estructuraInicial();
 guardar(datos);
 E().reemplazarEstado?.(
   datos,
   {
     origen:'reinicio',
     marcarCambios:false
   }
 );
 return datos;
}

window.BitacoraBaseDatos=Object.freeze({
 cargar,
 guardar,
 sincronizar,
 exportarJSON,
 importarJSON,
 reiniciar,
 estructuraInicial
});

console.info('Base de datos inicializada.');

})();