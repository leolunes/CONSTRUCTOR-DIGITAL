/* Matriz Girón v1.4.19 — archivos binarios portables en IndexedDB.
   Algunos motores WebKit rechazan almacenar Blob/File directamente.
   Los convertimos a ArrayBuffer antes de escribir; al leerlos se reconstruye
   el Blob original. No se borra ni migra ningún registro existente. */
(()=>{
  'use strict';
  const MARK='__matrizBinaryV1419';

  async function pack(value){
    if(typeof Blob!=='undefined' && value instanceof Blob){
      const result={
        [MARK]:true,
        type:value.type||'application/octet-stream',
        buffer:await value.arrayBuffer()
      };
      if(typeof File!=='undefined' && value instanceof File){
        result.fileName=value.name;
        result.lastModified=value.lastModified;
      }
      return result;
    }
    if(value instanceof Date || value instanceof ArrayBuffer || ArrayBuffer.isView(value))return value;
    if(Array.isArray(value)){
      const result=[];
      for(const item of value)result.push(await pack(item));
      return result;
    }
    if(value && typeof value==='object'){
      const result={};
      for(const [key,item] of Object.entries(value)){
        if(key==='__proto__'||key==='prototype'||key==='constructor')continue;
        result[key]=await pack(item);
      }
      return result;
    }
    return value;
  }

  function unpack(value){
    if(value && typeof value==='object' && value[MARK]===true){
      const bytes=value.buffer;
      if(!(bytes instanceof ArrayBuffer) && !ArrayBuffer.isView(bytes)){
        throw new Error('El archivo binario guardado está incompleto. Conserve el respaldo original.');
      }
      const blob=new Blob([bytes],{type:value.type||'application/octet-stream'});
      if(value.fileName && typeof File!=='undefined'){
        return new File([blob],value.fileName,{type:blob.type,lastModified:value.lastModified||Date.now()});
      }
      return blob;
    }
    if(value instanceof Blob || value instanceof Date || value instanceof ArrayBuffer || ArrayBuffer.isView(value))return value;
    if(Array.isArray(value))return value.map(unpack);
    if(value && typeof value==='object'){
      const result={};
      for(const [key,item] of Object.entries(value)){
        if(key==='__proto__'||key==='prototype'||key==='constructor')continue;
        result[key]=unpack(item);
      }
      return result;
    }
    return value;
  }

  window.MatrizBinaryStore={pack,unpack,isPortable:v=>!!(v&&v[MARK]===true)};
})();
