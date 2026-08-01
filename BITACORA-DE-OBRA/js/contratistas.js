'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/contratistas.js
   Propósito: administración de contratistas e interventorías
   ========================================================= */

(() => {

const EVENTOS = Object.freeze({
LISTO:'bitacora:contratistas-listos',
CREADO:'bitacora:contratista-creado',
ACTUALIZADO:'bitacora:contratista-actualizado',
ELIMINADO:'bitacora:contratista-eliminado',
SELECCIONADO:'bitacora:contratista-seleccionado'
});

const TIPOS=[
'Persona Natural',
'Persona Jurídica',
'Consorcio',
'Unión Temporal',
'Entidad Pública',
'Interventoría'
];

let contratistaActual=null;

const U=()=>window.BitacoraUtilidades||{};
const E=()=>window.BitacoraEstado||{};

function obtenerTodos(){
return E().obtener?.('catalogos.contratistas')||[];
}

function obtenerPorId(id){
return obtenerTodos().find(c=>c.id===id)||null;
}

function emitir(nombre,detalle={}){
document.dispatchEvent(new CustomEvent(nombre,{detail:detalle}));
}

function validar(c){
const errores=[];
if(!String(c.nombre||'').trim()) errores.push('Nombre obligatorio.');
if(!String(c.nit||'').trim()) errores.push('NIT obligatorio.');
return errores;
}

function crear(datos={}){
const nuevo={
id:U().generarId?U().generarId('contratista'):'ctr-'+Date.now(),
tipo:TIPOS.includes(datos.tipo)?datos.tipo:'Persona Jurídica',
nombre:datos.nombre||'',
nit:datos.nit||'',
representante:datos.representante||'',
residente:datos.residente||'',
contacto:{
telefono:datos.contacto?.telefono||'',
celular:datos.contacto?.celular||'',
correo:datos.contacto?.correo||'',
direccion:datos.contacto?.direccion||''
},
auditoria:{
creado:new Date().toISOString(),
actualizado:new Date().toISOString(),
version:1
}
};

const errores=validar(nuevo);
if(errores.length) throw new Error(errores.join(' '));

const creado=E().agregarALista?.('catalogos.contratistas',nuevo,{origen:'contratistas'});
seleccionar(creado.id);
emitir(EVENTOS.CREADO,{contratista:creado});
return creado;
}

function actualizar(id,cambios={}){
const actual=obtenerPorId(id);
if(!actual) throw new Error('Contratista no encontrado.');

const actualizado={
...actual,
...cambios,
contacto:{...actual.contacto,...(cambios.contacto||{})},
auditoria:{
...actual.auditoria,
actualizado:new Date().toISOString(),
version:(actual.auditoria.version||1)+1
}
};

const resultado=E().actualizarEnLista?.('catalogos.contratistas',id,actualizado,{origen:'contratistas'});
if(contratistaActual===id) sincronizar(resultado);
emitir(EVENTOS.ACTUALIZADO,{contratista:resultado});
return resultado;
}

function eliminar(id){
const eliminado=E().eliminarDeLista?.('catalogos.contratistas',id,{origen:'contratistas'});
emitir(EVENTOS.ELIMINADO,{contratista:eliminado});
return eliminado;
}

function sincronizar(c){
E().actualizarVarios?.({
'bitacoraActual.actores.contratista.id':c.id,
'bitacoraActual.actores.contratista.nombre':c.nombre,
'bitacoraActual.actores.contratista.nit':c.nit,
'bitacoraActual.actores.contratista.representanteLegal':c.representante,
'bitacoraActual.actores.contratista.residente':c.residente
},{origen:'contratistas',marcarCambios:false});
}

function seleccionar(id){
const c=obtenerPorId(id);
if(!c) throw new Error('Contratista no encontrado.');
contratistaActual=id;
E().actualizar?.('sesion.contratistaActualId',id,{marcarCambios:false});
sincronizar(c);
emitir(EVENTOS.SELECCIONADO,{contratista:c});
return c;
}

function buscar(texto=''){
texto=(texto||'').toLowerCase();
return obtenerTodos().filter(c=>(`${c.nombre} ${c.nit}`).toLowerCase().includes(texto));
}

function exportarDatos(){
return JSON.stringify({version:1,fecha:new Date().toISOString(),contratistas:obtenerTodos()},null,2);
}

window.BitacoraContratistas=Object.freeze({
EVENTOS,
TIPOS,
crear,
actualizar,
eliminar,
seleccionar,
buscar,
obtenerTodos,
obtenerPorId,
exportar:exportarDatos,
validar
});

emitir(EVENTOS.LISTO,{contratistas:obtenerTodos()});
console.info('Contratistas inicializados.');

})();