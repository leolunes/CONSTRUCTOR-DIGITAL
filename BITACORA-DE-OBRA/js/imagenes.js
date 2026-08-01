'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/imagenes.js
   Propósito: administración de fotografías de la bitácora
   ========================================================= */

(() => {

const EVENTOS = Object.freeze({
LISTO:'bitacora:imagenes-listas',
AGREGADA:'bitacora:imagen-agregada',
ACTUALIZADA:'bitacora:imagen-actualizada',
ELIMINADA:'bitacora:imagen-eliminada'
});

const U = () => window.BitacoraUtilidades || {};
const E = () => window.BitacoraEstado || {};

function emitir(nombre, detalle={}){
  document.dispatchEvent(new CustomEvent(nombre,{detail:detalle}));
}

function obtenerTodas(){
  return E().obtener?.('registros.imagenes') || [];
}

function obtenerPorId(id){
  return obtenerTodas().find(i=>i.id===id) || null;
}

function crear(datos={}){
  const imagen={
    id: U().generarId ? U().generarId('imagen') : 'img-'+Date.now(),
    titulo: datos.titulo || '',
    descripcion: datos.descripcion || '',
    archivo: datos.archivo || '',
    miniatura: datos.miniatura || '',
    fechaCaptura: datos.fechaCaptura || new Date().toISOString(),
    latitud: datos.latitud ?? null,
    longitud: datos.longitud ?? null,
    precision: datos.precision ?? null,
    folioId: datos.folioId || E().obtener?.('sesion.folioActualId') || null,
    etiquetas: Array.isArray(datos.etiquetas)?datos.etiquetas:[],
    auditoria:{
      creado:new Date().toISOString(),
      actualizado:new Date().toISOString(),
      version:1
    }
  };

  const creada = E().agregarALista?.(
    'registros.imagenes',
    imagen,
    {origen:'imagenes'}
  );

  emitir(EVENTOS.AGREGADA,{imagen:creada});
  return creada;
}

function actualizar(id,cambios={}){
  const actual=obtenerPorId(id);
  if(!actual) throw new Error('Imagen no encontrada.');

  const actualizada={
    ...actual,
    ...cambios,
    auditoria:{
      ...actual.auditoria,
      actualizado:new Date().toISOString(),
      version:(actual.auditoria.version||1)+1
    }
  };

  const resultado=E().actualizarEnLista?.(
    'registros.imagenes',
    id,
    actualizada,
    {origen:'imagenes'}
  );

  emitir(EVENTOS.ACTUALIZADA,{imagen:resultado});
  return resultado;
}

function eliminar(id){
  const eliminado=E().eliminarDeLista?.(
    'registros.imagenes',
    id,
    {origen:'imagenes'}
  );

  emitir(EVENTOS.ELIMINADA,{imagen:eliminado});
  return eliminado;
}

function buscar(texto=''){
  texto=String(texto).toLowerCase();
  return obtenerTodas().filter(i=>
    (`${i.titulo} ${i.descripcion} ${(i.etiquetas||[]).join(' ')}`)
      .toLowerCase()
      .includes(texto)
  );
}

function filtrarPorFolio(folioId){
  return obtenerTodas().filter(i=>i.folioId===folioId);
}

async function capturarUbicacion(id){
  if(!U().obtenerCoordenadas) return null;
  const img=obtenerPorId(id);
  if(!img) throw new Error('Imagen no encontrada.');
  const gps=await U().obtenerCoordenadas();
  return actualizar(id,{
    latitud:gps.latitud,
    longitud:gps.longitud,
    precision:gps.precision
  });
}

function exportarDatos(){
  return JSON.stringify({
    version:1,
    fecha:new Date().toISOString(),
    imagenes:obtenerTodas()
  },null,2);
}

window.BitacoraImagenes=Object.freeze({
  EVENTOS,
  crear,
  actualizar,
  eliminar,
  buscar,
  filtrarPorFolio,
  capturarUbicacion,
  obtenerTodas,
  obtenerPorId,
  exportar:exportarDatos
});

emitir(EVENTOS.LISTO,{imagenes:obtenerTodas()});
console.info('Imágenes inicializadas.');

})();