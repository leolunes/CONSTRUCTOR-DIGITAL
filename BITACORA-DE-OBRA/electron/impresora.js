'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: electron/impresora.js
   Gestión centralizada de impresión.
   ========================================================= */

const {BrowserWindow, ipcMain} = require('electron');

const CANALES = Object.freeze({
  IMPRIMIR:'impresora:imprimir',
  IMPRIMIR_SILENCIOSO:'impresora:imprimir-silencioso',
  OBTENER_IMPRESORAS:'impresora:obtener-impresoras',
  VISTA_PREVIA:'impresora:vista-previa'
});

const estado={ipc:false};

function ok(d={}){return {ok:true,...d};}
function fail(e){return {ok:false,error:e instanceof Error?e.message:String(e)};}

function ventana(evt){
  return evt?.sender?BrowserWindow.fromWebContents(evt.sender):BrowserWindow.getFocusedWindow();
}

async function obtenerImpresoras(win){
  const lista=await win.webContents.getPrintersAsync();
  return lista.map(p=>({
    nombre:p.name,
    predeterminada:!!p.isDefault,
    estado:p.status,
    opciones:p.options||{}
  }));
}

async function imprimir(win,op={}){
  return new Promise((resolve,reject)=>{
    win.webContents.print({
      silent:!!op.silent,
      printBackground:op.printBackground!==false,
      deviceName:op.deviceName||''
    },(success,errorType)=>{
      if(success) resolve({impreso:true});
      else reject(new Error(errorType||'No fue posible imprimir.'));
    });
  });
}

async function vistaPrevia(win){
  await win.webContents.executeJavaScript("window.print();");
  return {mostrada:true};
}

function registrarIPC(){
  if(estado.ipc) return;

  ipcMain.handle(CANALES.OBTENER_IMPRESORAS,async(evt)=>{
    try{return ok({impresoras:await obtenerImpresoras(ventana(evt))});}
    catch(e){return fail(e);}
  });

  ipcMain.handle(CANALES.IMPRIMIR,async(evt,op={})=>{
    try{return ok(await imprimir(ventana(evt),{...op,silent:false}));}
    catch(e){return fail(e);}
  });

  ipcMain.handle(CANALES.IMPRIMIR_SILENCIOSO,async(evt,op={})=>{
    try{return ok(await imprimir(ventana(evt),{...op,silent:true}));}
    catch(e){return fail(e);}
  });

  ipcMain.handle(CANALES.VISTA_PREVIA,async(evt)=>{
    try{return ok(await vistaPrevia(ventana(evt)));}
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
  return {canales:CANALES};
}

module.exports=Object.freeze({
  CANALES,
  iniciar,
  registrarIPC,
  eliminarIPC,
  obtenerImpresoras,
  imprimir,
  vistaPrevia
});
