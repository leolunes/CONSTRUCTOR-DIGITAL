'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: electron/sistema.js
   Administración de funciones del sistema operativo.
   ========================================================= */

const {app, ipcMain, shell} = require('electron');
const os = require('os');
const path = require('path');
const fs = require('fs');

const CANALES = Object.freeze({
  INFO:'sistema:info',
  RUTAS:'sistema:rutas',
  MEMORIA:'sistema:memoria',
  CPU:'sistema:cpu',
  RED:'sistema:red',
  ABRIR_RUTA:'sistema:abrir-ruta',
  MOSTRAR_RUTA:'sistema:mostrar-ruta',
  EXISTE:'sistema:existe',
  CREAR_CARPETA:'sistema:crear-carpeta'
});

let ipc=false;

const ok=d=>({ok:true,...d});
const fail=e=>({ok:false,error:e instanceof Error?e.message:String(e)});

function infoSistema(){
  return {
    plataforma:process.platform,
    arquitectura:process.arch,
    hostname:os.hostname(),
    usuario:os.userInfo().username,
    versionSO:os.release(),
    versionElectron:process.versions.electron,
    versionNode:process.versions.node,
    versionChrome:process.versions.chrome,
    versionApp:app.getVersion()
  };
}

function rutas(){
  return {
    home:app.getPath('home'),
    documents:app.getPath('documents'),
    desktop:app.getPath('desktop'),
    downloads:app.getPath('downloads'),
    temp:app.getPath('temp'),
    userData:app.getPath('userData'),
    exe:app.getPath('exe')
  };
}

function memoria(){
  return {
    total:os.totalmem(),
    libre:os.freemem(),
    usada:os.totalmem()-os.freemem()
  };
}

function cpu(){
  return {
    modelo:os.cpus()[0]?.model||'',
    nucleos:os.cpus().length,
    carga:os.loadavg()
  };
}

function red(){
  return os.networkInterfaces();
}

async function abrirRuta(r){
  const e=await shell.openPath(path.resolve(r));
  if(e) throw new Error(e);
  return true;
}

async function mostrarRuta(r){
  const rr=path.resolve(r);
  if(!fs.existsSync(rr)) throw new Error('La ruta no existe.');
  shell.showItemInFolder(rr);
  return true;
}

function registrarIPC(){
 if(ipc) return;

 ipcMain.handle(CANALES.INFO,async()=>ok({info:infoSistema()}));
 ipcMain.handle(CANALES.RUTAS,async()=>ok({rutas:rutas()}));
 ipcMain.handle(CANALES.MEMORIA,async()=>ok({memoria:memoria()}));
 ipcMain.handle(CANALES.CPU,async()=>ok({cpu:cpu()}));
 ipcMain.handle(CANALES.RED,async()=>ok({red:red()}));

 ipcMain.handle(CANALES.EXISTE,async(_,r)=>{
   try{return ok({existe:fs.existsSync(path.resolve(r))});}
   catch(e){return fail(e);}
 });

 ipcMain.handle(CANALES.CREAR_CARPETA,async(_,r)=>{
   try{
     fs.mkdirSync(path.resolve(r),{recursive:true});
     return ok({ruta:path.resolve(r)});
   }catch(e){return fail(e);}
 });

 ipcMain.handle(CANALES.ABRIR_RUTA,async(_,r)=>{
   try{return ok({abierto:await abrirRuta(r)});}
   catch(e){return fail(e);}
 });

 ipcMain.handle(CANALES.MOSTRAR_RUTA,async(_,r)=>{
   try{return ok({mostrado:await mostrarRuta(r)});}
   catch(e){return fail(e);}
 });

 ipc=true;
}

function eliminarIPC(){
 Object.values(CANALES).forEach(c=>ipcMain.removeHandler(c));
 ipc=false;
}

function iniciar(){
 registrarIPC();
 return {
   info:infoSistema(),
   rutas:rutas()
 };
}

module.exports=Object.freeze({
 CANALES,
 iniciar,
 registrarIPC,
 eliminarIPC,
 infoSistema,
 rutas,
 memoria,
 cpu,
 red,
 abrirRuta,
 mostrarRuta
});