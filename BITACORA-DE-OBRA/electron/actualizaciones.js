'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: electron/actualizaciones.js
   Gestión de versión y actualización de la aplicación.
   ========================================================= */

const {app, ipcMain, shell} = require('electron');
const https = require('https');

const CANALES = Object.freeze({
  VERSION:'actualizaciones:version',
  BUSCAR:'actualizaciones:buscar',
  ABRIR_DESCARGA:'actualizaciones:abrir-descarga'
});

const estado={ipc:false};

function ok(d={}){return {ok:true,...d};}
function fail(e){return {ok:false,error:e instanceof Error?e.message:String(e)};}

function versionActual(){
  return {
    version:app.getVersion(),
    nombre:app.getName(),
    plataforma:process.platform,
    arquitectura:process.arch
  };
}

function comparar(a,b){
  const pa=String(a).split('.').map(Number);
  const pb=String(b).split('.').map(Number);
  const n=Math.max(pa.length,pb.length);
  for(let i=0;i<n;i++){
    const x=pa[i]||0,y=pb[i]||0;
    if(x>y) return 1;
    if(x<y) return -1;
  }
  return 0;
}

function consultar(url){
  return new Promise((resolve,reject)=>{
    https.get(url,res=>{
      let data='';
      res.on('data',d=>data+=d);
      res.on('end',()=>{
        try{resolve(JSON.parse(data));}
        catch(e){reject(e);}
      });
    }).on('error',reject);
  });
}

async function buscarActualizacion(op={}){
  if(!op.url)
    return {
      disponible:false,
      motivo:'No se configuró URL de actualizaciones.',
      actual:versionActual()
    };

  const remoto=await consultar(op.url);
  const actual=versionActual();

  const disponible=comparar(remoto.version,actual.version)>0;

  return {
    disponible,
    actual,
    remoto,
    urlDescarga:remoto.urlDescarga||null
  };
}

async function abrirDescarga(url){
  if(!url) throw new Error('No se indicó URL.');
  await shell.openExternal(url);
  return true;
}

function registrarIPC(){
 if(estado.ipc) return;

 ipcMain.handle(CANALES.VERSION,async()=>{
   try{return ok({version:versionActual()});}
   catch(e){return fail(e);}
 });

 ipcMain.handle(CANALES.BUSCAR,async(_,op={})=>{
   try{return ok({resultado:await buscarActualizacion(op)});}
   catch(e){return fail(e);}
 });

 ipcMain.handle(CANALES.ABRIR_DESCARGA,async(_,url)=>{
   try{return ok({abierto:await abrirDescarga(url)});}
   catch(e){return fail(e);}
 });

 estado.ipc=true;
}

function eliminarIPC(){
 Object.values(CANALES).forEach(c=>ipcMain.removeHandler(c));
 estado.ipc=false;
}

function iniciar(){
 registrarIPC();
 return {version:versionActual()};
}

module.exports=Object.freeze({
 CANALES,
 iniciar,
 registrarIPC,
 eliminarIPC,
 versionActual,
 buscarActualizacion,
 abrirDescarga,
 comparar
});