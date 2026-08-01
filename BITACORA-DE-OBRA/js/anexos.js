'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/anexos.js
   Propósito: administración de anexos de la bitácora
   ========================================================= */

(() => {

const EVENTOS = Object.freeze({
LISTO:'bitacora:anexos-listos',
AGREGADO:'bitacora:anexo-agregado',
ACTUALIZADO:'bitacora:anexo-actualizado',
ELIMINADO:'bitacora:anexo-eliminado'
});

const U = () => window.BitacoraUtilidades || {};
const E = () => window.BitacoraEstado || {};

function emitir(nombre,detalle={}){
 document.dispatchEvent(new CustomEvent(nombre,{detail}));
}

function obtenerTodos(){
 return E().obtener?.('registros.anexos') || [];
}

function obtenerPorId(id){
 return obtenerTodos().find(a=>a.id===id) || null;
}

function crear(datos={}){
 const anexo={
   id: U().generarId ? U().generarId('anexo') : 'anexo-'+Date.now(),
   nombre: datos.nombre || '',
   tipo: datos.tipo || '',
   descripcion: datos.descripcion || '',
   archivo: datos.archivo || '',
   tamano: datos.tamano || 0,
   extension: datos.extension || '',
   folioId: datos.folioId || E().obtener?.('sesion.folioActualId') || null,
   fecha: new Date().toISOString(),
   auditoria:{
     creado:new Date().toISOString(),
     actualizado:new Date().toISOString(),
     version:1
   }
 };

 const agregado = E().agregarALista?.(
   'registros.anexos',
   anexo,
   {origen:'anexos'}
 );

 emitir(EVENTOS.AGREGADO,{anexo:agregado});
 return agregado;
}

function actualizar(id,cambios={}){
 const actual = obtenerPorId(id);
 if(!actual) throw new Error('Anexo no encontrado.');

 const actualizado={
   ...actual,
   ...cambios,
   auditoria:{
     ...actual.auditoria,
     actualizado:new Date().toISOString(),
     version:(actual.auditoria.version||1)+1
   }
 };

 const resultado = E().actualizarEnLista?.(
   'registros.anexos',
   id,
   actualizado,
   {origen:'anexos'}
 );

 emitir(EVENTOS.ACTUALIZADO,{anexo:resultado});
 return resultado;
}

function eliminar(id){
 const eliminado = E().eliminarDeLista?.(
   'registros.anexos',
   id,
   {origen:'anexos'}
 );

 emitir(EVENTOS.ELIMINADO,{anexo:eliminado});
 return eliminado;
}

function buscar(texto=''){
 texto = String(texto).toLowerCase();
 return obtenerTodos().filter(a =>
   (`${a.nombre} ${a.descripcion} ${a.extension}`)
   .toLowerCase()
   .includes(texto)
 );
}

function filtrarPorFolio(folioId){
 return obtenerTodos().filter(a=>a.folioId===folioId);
}

function exportarDatos(){
 return JSON.stringify({
   version:1,
   fecha:new Date().toISOString(),
   anexos:obtenerTodos()
 },null,2);
}

window.BitacoraAnexos = Object.freeze({
 EVENTOS,
 crear,
 actualizar,
 eliminar,
 buscar,
 filtrarPorFolio,
 obtenerTodos,
 obtenerPorId,
 exportar:exportarDatos
});

emitir(EVENTOS.LISTO,{anexos:obtenerTodos()});
console.info('Anexos inicializados.');

})();