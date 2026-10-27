/* v1.4.17 — Respaldo integral y portabilidad offline, sin sincronización remota.
   Al importar siempre se FUSIONA: los registros actuales prevalecen en cualquier conflicto.
   Ninguna importación ejecuta clear/delete sobre localStorage o IndexedDB. */
(()=>{
'use strict';
const FORMAT='matriz-giron-respaldo-integral', VERSION=1;
const SIG_DB='matriz_giron_private_signatures_v1';
const KNOWN_DBS=['matriz_giron_photos_v2','matriz_giron_documents_v1','matriz_giron_representative_docs_db_v1','matriz_giron_business_media_v1',SIG_DB];
// Abrir una base inexistente debe crear los almacenes correctos; nunca una base vacía que rompa versiones anteriores.
const KNOWN_SCHEMAS={
  matriz_giron_photos_v2:{photos:{keyPath:'id',indexes:[{name:'needId',keyPath:'needId'}]}},
  matriz_giron_documents_v1:{petitionPdfs:{keyPath:'id',indexes:[]}},
  matriz_giron_representative_docs_db_v1:{pdfs:{keyPath:'id',indexes:[]}},
  matriz_giron_business_media_v1:{media:{keyPath:'id',indexes:[{name:'businessId',keyPath:'businessId'}]}},
  matriz_giron_private_signatures_v1:{signatures:{keyPath:'id',indexes:[]}}
};
const PREVIEW='portableBackupPreview', STATUS='portableBackupStatus';
let pending=null, busy=false;
const el=id=>document.getElementById(id);
const human=n=>Number(n||0).toLocaleString('es-CO');
const status=(msg,isError=false)=>{const node=el(STATUS);if(node){node.textContent=msg;node.classList.toggle('portable-error',isError);}console[isError?'error':'info']('[Respaldo integral]',msg)};
function getKeys(){const result={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('matriz_giron_'))result[k]=localStorage.getItem(k)}return result}
const readBlob=b=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error||new Error('No se puede leer un archivo adjunto'));r.readAsDataURL(b)});
function decodeBase64(text){const bin=atob(text),buf=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)buf[i]=bin.charCodeAt(i);return buf}
function toBlob(data){const parts=data.split(','),header=parts[0]||'',mime=(header.match(/data:([^;,]+)/)||[])[1]||'application/octet-stream';return new Blob([decodeBase64(parts[1]||'')],{type:mime})}
async function encode(v){
  if(v instanceof Blob){const out={__matrizType:'blob',dataUrl:await readBlob(v)};if(typeof File!=='undefined'&&v instanceof File){out.name=v.name;out.lastModified=v.lastModified;}return out;}
  if(v instanceof Date)return{__matrizType:'date',value:v.toISOString()};
  if(v instanceof ArrayBuffer){const a=new Uint8Array(v);let str='';for(let i=0;i<a.length;i+=16384)str+=String.fromCharCode(...a.subarray(i,i+16384));return{__matrizType:'arraybuffer',value:btoa(str)};}
  if(ArrayBuffer.isView(v))return{__matrizType:'typed',kind:v.constructor.name,value:Array.from(v)};
  if(Array.isArray(v)){const a=[];for(const x of v)a.push(await encode(x));return a}
  if(v&&typeof v==='object'){const out={};for(const k of Object.keys(v))out[k]=await encode(v[k]);return out}
  return v;
}
function decode(v){
  if(Array.isArray(v))return v.map(decode);
  if(v&&typeof v==='object'){
    if(v.__matrizType==='blob'){const b=toBlob(v.dataUrl);return v.name?new File([b],v.name,{type:b.type,lastModified:v.lastModified||Date.now()}):b}
    if(v.__matrizType==='date')return new Date(v.value);
    if(v.__matrizType==='arraybuffer')return decodeBase64(v.value).buffer;
    if(v.__matrizType==='typed'){const a=v.value||[];if(v.kind==='Uint8Array')return Uint8Array.from(a);if(v.kind==='Int8Array')return Int8Array.from(a);return a}
    const out={};for(const [k,x]of Object.entries(v))out[k]=decode(x);return out;
  }
  return v;
}
const keySpec=x=>x==null?null:Array.isArray(x)?Array.from(x):String(x);
async function dbNames(withSignature){
  const names=new Set(KNOWN_DBS);
  if(typeof indexedDB.databases==='function')try{for(const item of await indexedDB.databases())if(item.name?.startsWith('matriz_giron_'))names.add(item.name)}catch(_){}
  if(!withSignature)names.delete(SIG_DB);
  return [...names].sort();
}
function openDB(name,definitions){return new Promise((resolve,reject)=>{
  let request=indexedDB.open(name);let finished=false;
  request.onupgradeneeded=()=>{
    const d=request.result;
    if(definitions)for(const [storeName,info] of Object.entries(definitions)){
      if(d.objectStoreNames.contains(storeName))continue;
      const opts={};if(info.keyPath!=null)opts.keyPath=info.keyPath;if(info.autoIncrement)opts.autoIncrement=true;
      const st=d.createObjectStore(storeName,opts);
      for(const ix of info.indexes||[])try{st.createIndex(ix.name,ix.keyPath,{unique:!!ix.unique,multiEntry:!!ix.multiEntry})}catch(_){}
    }
  };
  request.onerror=()=>{if(!finished){finished=true;reject(request.error||new Error('No fue posible abrir '+name))}};
  request.onblocked=()=>{if(!finished){finished=true;reject(new Error('La base '+name+' está ocupada. Cierre otras pestañas de la aplicación.'))}};
  request.onsuccess=()=>{
    let d=request.result;
    if(definitions){const missing=Object.keys(definitions).filter(s=>!d.objectStoreNames.contains(s));if(missing.length){const nextVersion=d.version+1;d.close();request=indexedDB.open(name,nextVersion);request.onupgradeneeded=()=>{const target=request.result;for(const s of missing){const info=definitions[s];const opts={};if(info.keyPath!=null)opts.keyPath=info.keyPath;if(info.autoIncrement)opts.autoIncrement=true;const st=target.createObjectStore(s,opts);for(const ix of info.indexes||[])st.createIndex(ix.name,ix.keyPath,{unique:!!ix.unique,multiEntry:!!ix.multiEntry})}};request.onsuccess=()=>{if(!finished){finished=true;resolve(request.result)}};request.onerror=()=>{if(!finished){finished=true;reject(request.error)}};request.onblocked=()=>{if(!finished){finished=true;reject(new Error('Cierre las pestañas de la Matriz antes de importar '+name))}};return;}}
    if(!finished){finished=true;resolve(d)}
  };
})}
async function readStore(db,storeName){
  return await new Promise((resolve,reject)=>{
    const tx=db.transaction(storeName,'readonly'),st=tx.objectStore(storeName),entries=[];
    const indexes=[];for(const name of st.indexNames){const i=st.index(name);indexes.push({name:i.name,keyPath:keySpec(i.keyPath),unique:i.unique,multiEntry:i.multiEntry})}
    const info={keyPath:keySpec(st.keyPath),autoIncrement:st.autoIncrement,indexes,entries};
    const req=st.openCursor();req.onsuccess=()=>{const c=req.result;if(c){entries.push({key:c.key,value:c.value});c.continue()}};
    req.onerror=()=>reject(req.error);tx.oncomplete=()=>resolve(info);tx.onerror=()=>reject(tx.error);
  });
}
async function exportAll(){
  if(busy)return;busy=true;
  const btn=el('exportJson'),side=el('backupBtn');if(btn)btn.disabled=true;if(side)side.disabled=true;
  try{
    status('Preparando respaldo: leyendo registros, documentos y fotografías…');
    const includeSignature=!!el('backupIncludeSignature')?.checked;
    if(includeSignature&&!confirm('Está a punto de incluir la firma escaneada privada en el JSON. ¿Confirma que está autorizado y que lo guardará en un lugar seguro?')){status('Exportación cancelada. No se modificó ningún dato.');return}
    const snapshot={format:FORMAT,version:VERSION,createdAt:new Date().toISOString(),origin:location.origin,localStorage:getKeys(),indexedDB:{},summary:{databases:0,stores:0,records:0},signatureIncluded:includeSignature};
    for(const name of await dbNames(includeSignature)){
      status('Preparando respaldo: '+name+'…');
      const db=await openDB(name,KNOWN_SCHEMAS[name]),stores={};
      try{
        for(const storeName of db.objectStoreNames){
          const info=await readStore(db,storeName),entries=[];
          for(const entry of info.entries)entries.push({key:await encode(entry.key),value:await encode(entry.value)});
          stores[storeName]={keyPath:info.keyPath,autoIncrement:info.autoIncrement,indexes:info.indexes,entries};
          snapshot.summary.records+=entries.length;snapshot.summary.stores++;
        }
      }finally{db.close()}
      if(Object.keys(stores).length){snapshot.indexedDB[name]=stores;snapshot.summary.databases++}
    }
    const contents=JSON.stringify(snapshot);JSON.parse(contents);
    const now=new Date(),stamp=now.getFullYear()+String(now.getMonth()+1).padStart(2,'0')+String(now.getDate()).padStart(2,'0')+'-'+String(now.getHours()).padStart(2,'0')+String(now.getMinutes()).padStart(2,'0');
    const blob=new Blob([contents],{type:'application/json'}),a=document.createElement('a');
    const url=URL.createObjectURL(blob);a.href=url;a.download=`MATRIZ-GIRON-RESPALDO-INTEGRAL-${stamp}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),120000);
    status(`Respaldo generado: ${human(Object.keys(snapshot.localStorage).length)} grupos locales, ${human(snapshot.summary.records)} archivos/registros en ${human(snapshot.summary.stores)} almacenes (${(blob.size/1048576).toFixed(1)} MB). Compruebe que quedó guardado en Descargas.`);
  }catch(err){status('ERROR AL EXPORTAR: '+err.message+'; no se modificó ningún dato. Revise permisos y espacio disponible.',true)}
  finally{busy=false;if(btn)btn.disabled=false;if(side)side.disabled=false}
}
function parsedOrNull(v){try{return JSON.parse(v)}catch(_){return null}}
function recordKey(v){if(v&&typeof v==='object'){
  for(const k of ['id','code','radicado','key','uid'])if(v[k]!=null&&v[k]!=='')return `${k}:${String(v[k])}`;
}return 'valor:'+JSON.stringify(v)}
function mergeArrays(cur,inc){
  const out=cur.slice(),seen=new Set(out.map(recordKey));
  for(const item of inc){const k=recordKey(item);if(!seen.has(k)){out.push(item);seen.add(k)}}return out;
}
function mergeObjects(cur,inc){
  if(Array.isArray(cur)&&Array.isArray(inc))return mergeArrays(cur,inc);
  if(cur&&inc&&typeof cur==='object'&&typeof inc==='object'&&!Array.isArray(cur)&&!Array.isArray(inc)){
    const out={...cur};for(const [key,v]of Object.entries(inc)){if(['__proto__','prototype','constructor'].includes(key))continue;out[key]=key in out?mergeObjects(out[key],v):v}return out;
  }
  return cur===null||cur===''||cur===undefined?inc:cur;
}
function mergeStored(current,incoming){
  if(current===null)return incoming;
  const a=parsedOrNull(current),b=parsedOrNull(incoming);
  if(a!==null&&b!==null){const merged=mergeObjects(a,b);return JSON.stringify(merged)}
  return current||incoming;
}
async function ensureDb(name,definitions){return openDB(name,definitions)}
async function importStore(db,name,source){
  // Preparar todos los binarios antes de abrir la transacción. En WebKit,
  // guardar Blob directamente puede lanzar «BlobURLs are not yet supported».
  // ArrayBuffer sí admite la clonación estructurada de IndexedDB.
  const data=[];
  for(const entry of source.entries||[]){
    data.push({key:decode(entry.key),value:await window.MatrizBinaryStore.pack(decode(entry.value))});
  }
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(name,'readwrite'),store=tx.objectStore(name);let imported=0,kept=0;
    for(const row of data){
      const get=store.get(row.key);
      get.onsuccess=()=>{
        if(get.result!==undefined){kept++;return}
        const add=store.keyPath==null?store.add(row.value,row.key):store.add(row.value);
        add.onsuccess=()=>{imported++};
      };
    }
    tx.oncomplete=()=>resolve({imported,kept});tx.onerror=()=>reject(tx.error||new Error('Error al importar '+name));tx.onabort=()=>reject(tx.error||new Error('Importación interrumpida'));
  });
}
function normalizeOld(obj){
  if(obj.format===FORMAT){if(!obj.localStorage||!obj.indexedDB||!Number.isInteger(obj.version)||obj.version>VERSION)throw new Error('Respaldo integral incompatible o incompleto');return obj}
  if(obj&&typeof obj==='object'&&Array.isArray(obj.needs)&&Array.isArray(obj.leaders)){
    const {__photos,__photoBackupVersion,...core}=obj;
    const payload={format:'respaldo-antiguo',version:0,localStorage:{matriz_giron_v1:JSON.stringify(core)},indexedDB:{},summary:{records:0}};
    if(Array.isArray(__photos)){
      payload.indexedDB.matriz_giron_photos_v2={photos:{keyPath:'id',autoIncrement:false,indexes:[{name:'needId',keyPath:'needId',unique:false,multiEntry:false}],entries:__photos.map(p=>{const {dataUrl,...fields}=p;return{key:p.id,value:{...fields,blob:dataUrl?{__matrizType:'blob',dataUrl}:null}}})}};
      payload.summary.records=__photos.length;
    }
    return payload;
  }
  throw new Error('El archivo no es un respaldo de la Matriz Girón');
}
function summarize(obj){const ls=obj.localStorage||{},list=obj.indexedDB||{};const core=parsedOrNull(ls.matriz_giron_v1)||{},segments=[];
  for(const [key,title] of [['needs','necesidades'],['leaders','contactos'],['projects','proyectos'],['actions','gestiones']])segments.push(`${human(core[key]?.length||0)} ${title}`);
  const total=Object.values(list).flatMap(s=>Object.values(s)).reduce((n,s)=>n+(s.entries?.length||0),0);
  segments.push(`${human(total)} archivos en bases de datos`);
  return segments.join(' · ')
}
async function inspect(event){
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  pending=null;
  try{
    status('Leyendo respaldo elegido…');
    const parsed=normalizeOld(JSON.parse(await file.text()));
    if(parsed.indexedDB[SIG_DB]&&!el('backupIncludeSignature')?.checked){
      // Restore signatures only with explicit authorization below.
    }
    pending=parsed;
    const panel=el(PREVIEW);panel.hidden=false;
    el('portableBackupFile').textContent=file.name;
    el('portableBackupDetails').textContent=(parsed.version===0?'Respaldo antiguo (parcial): ':'Respaldo integral: ')+summarize(parsed);
    status('Archivo leído y validado. No se ha importado ni modificado nada todavía.');
  }catch(err){el(PREVIEW).hidden=true;status('No fue posible analizar el archivo: '+err.message,true)}
}
async function importAll(){
  if(busy||!pending)return;
  const source=pending;
  if(!confirm('Se añadirán ÚNICAMENTE los registros faltantes. Los existentes no se borrarán ni se reemplazarán. ¿Desea fusionar el respaldo?'))return;
  busy=true;el('portableBackupImport').disabled=true;
  let localKeys=0,imported=0,kept=0,failures=[];
  try{
    const includeSignature=!source.indexedDB[SIG_DB]||confirm('El respaldo incluye una firma privada. ¿Está autorizado a importarla en este dispositivo? Cancelar omitirá únicamente la firma.');
    for(const [k,v] of Object.entries(source.localStorage||{})){
      if(!k.startsWith('matriz_giron_'))continue;
      try{const current=localStorage.getItem(k);localStorage.setItem(k,mergeStored(current,v));localKeys++}
      catch(err){failures.push('Almacenamiento local / '+k+': '+err.message)}
    }
    for(const [name,stores] of Object.entries(source.indexedDB||{})){
      if(!name.startsWith('matriz_giron_')||(name===SIG_DB&&!includeSignature))continue;
      try{
        status('Fusionando archivos: '+name+'…');
        const database=await ensureDb(name,stores);
        try{for(const [storeName,info] of Object.entries(stores)){
          try{const stats=await importStore(database,storeName,info);imported+=stats.imported;kept+=stats.kept}
          catch(err){failures.push(name+'/'+storeName+': '+err.message)}
        }}finally{database.close()}
      }catch(err){failures.push(name+': '+err.message)}
    }
    const message=`Fusión finalizada: ${human(localKeys)} grupos locales revisados; ${human(imported)} archivos incorporados; ${human(kept)} archivos existentes conservados.`+
      (failures.length?' ERRORES: '+failures.join(' | '):' No se borró ningún registro.');
    status(message,failures.length>0);el(PREVIEW).hidden=true;pending=null;
    el('portableBackupReload').hidden=false;
    if(failures.length)alert('La fusión fue parcial. NO borre el archivo JSON. '+message);
    else alert(message+' Pulse «Recargar aplicación» para ver todos los datos fusionados.');
  }catch(err){status('No se pudo completar la fusión: '+err.message+'; los registros existentes no fueron borrados.',true)}
  finally{busy=false;el('portableBackupImport').disabled=false}
}
function init(){
  const exportBtn=el('exportJson'),sideBtn=el('backupBtn'),input=el('importJson');
  if(exportBtn){exportBtn.textContent='⬇ Exportar respaldo integral';exportBtn.onclick=exportAll}
  if(sideBtn){sideBtn.textContent='Exportar respaldo integral';sideBtn.onclick=exportAll}
  if(input){const clone=input.cloneNode(true);input.replaceWith(clone);clone.addEventListener('change',inspect)}
  el('portableBackupImport')?.addEventListener('click',importAll);
  el('portableBackupCancel')?.addEventListener('click',()=>{pending=null;el(PREVIEW).hidden=true;status('Importación cancelada. Sus datos no se modificaron.')});
  el('portableBackupReload')?.addEventListener('click',()=>location.reload());
  status('Respaldo integral listo. Para cambiar de dispositivo, exporte desde el dispositivo de origen y fusione el JSON en el destino.');
}
window.GironBackupIntegral={exportar:exportAll};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
