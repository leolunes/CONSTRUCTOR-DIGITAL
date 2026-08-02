'use strict';
/* Compatibilidad PWA: reproduce en navegador la API usada por Electron. */
(() => {
  if (window.electronAPI) return;
  const K='bitacora.pwa.';
  const get=(k,d)=>{try{const v=localStorage.getItem(K+k);return v===null?d:JSON.parse(v)}catch{return d}};
  const set=(k,v)=>{try{localStorage.setItem(K+k,JSON.stringify(v));return true}catch(error){console.warn('No fue posible guardar en localStorage:',error);return false}};

  const DB_NAME='bitacora-obra-pwa';
  const DB_STORE='datos';
  const abrirDB=()=>new Promise((resolve,reject)=>{
    if(!('indexedDB' in window)){reject(new Error('IndexedDB no disponible'));return;}
    const req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(DB_STORE))db.createObjectStore(DB_STORE)};
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||new Error('No fue posible abrir IndexedDB'));
  });
  const idbLeer=async(clave,def)=>{try{const db=await abrirDB();return await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readonly');const req=tx.objectStore(DB_STORE).get(clave);req.onsuccess=()=>resolve(req.result===undefined?def:req.result);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close()})}catch(error){console.warn('Lectura IndexedDB no disponible:',error);return def}};
  const idbGuardar=async(clave,valor)=>{const db=await abrirDB();return await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).put(valor,clave);tx.oncomplete=()=>{db.close();resolve(true)};tx.onerror=()=>{db.close();reject(tx.error||new Error('No fue posible guardar en IndexedDB'))};tx.onabort=()=>{db.close();reject(tx.error||new Error('Guardado cancelado'))}})};
  const id=(p='id')=>`${p}-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
  const download=(blob,name)=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name||'archivo';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500)};
  const pick=(accept='',multiple=true)=>new Promise(resolve=>{const i=document.createElement('input');i.type='file';i.accept=accept;i.multiple=multiple;i.onchange=()=>resolve([...i.files]);i.click()});
  const toData=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)});
  async function seed(key,file,def=[]){if(localStorage.getItem(K+key)!==null)return;try{const r=await fetch(`../data/${file}`);if(r.ok)set(key,await r.json());else set(key,def)}catch{set(key,def)}}
  Promise.all([
    seed('obras','obras.json',[]),seed('folios','folios.json',[]),seed('contratistas','contratistas.json',[]),
    seed('configuracion','configuracion.json',{}),seed('empresa','empresa.json',{})
  ]).then(()=>document.dispatchEvent(new CustomEvent('bitacora:pwa-lista')));
  const saveEntity=(key,obj,p='id')=>{const a=get(key,[]);const registro={...obj,id:obj.id||id(p),actualizadoEn:new Date().toISOString()};const n=a.findIndex(x=>String(x.id)===String(registro.id));n>=0?a[n]=registro:a.push(registro);set(key,a);return {registro,a};};
  const api={
    async listarObras(){return {ok:true,obras:get('obras',[])}} ,
    async guardarObra(o={}){const r=saveEntity('obras',o,'obra');return {ok:true,obra:r.registro,obras:r.a}},
    async eliminarObra(x){const a=get('obras',[]).filter(o=>String(o.id)!==String(x));set('obras',a);return {ok:true,eliminado:true,obras:a}},
    async seleccionarObra(o={}){set('obraActiva',o||null);return {ok:true,obra:o||null}},
    async obtenerObraActiva(){return {ok:true,obra:get('obraActiva',null)}},
    async listarFolios(f={}){
      const locales=get('folios',[]);
      const almacenados=await idbLeer('folios',null);
      let a=Array.isArray(almacenados)?almacenados:locales;
      if(almacenados===null&&Array.isArray(locales))try{await idbGuardar('folios',locales)}catch{}
      if(f.obraId)a=a.filter(x=>String(x.obraId)===String(f.obraId));
      return {ok:true,folios:a};
    },
    async guardarFolio(o={}){
      try{
        const actuales=(await api.listarFolios({})).folios||[];
        const registro={...o,id:o.id||id('folio'),actualizadoEn:new Date().toISOString()};
        const n=actuales.findIndex(x=>String(x.id)===String(registro.id));
        n>=0?actuales[n]=registro:actuales.push(registro);
        await idbGuardar('folios',actuales);
        /* Mantener un respaldo liviano en localStorage solo cuando sea posible. */
        set('folios',actuales);
        return {ok:true,folio:registro,folios:actuales};
      }catch(error){
        console.error('Error guardando folio con evidencias:',error);
        return {ok:false,mensaje:'No fue posible guardar el folio con sus fotografías o anexos. Verifique que Safari no esté en navegación privada y que el dispositivo tenga espacio disponible.'};
      }
    },
    async eliminarFolio(x){
      try{
        const actuales=(await api.listarFolios({})).folios||[];
        const a=actuales.filter(o=>String(o.id)!==String(x));
        await idbGuardar('folios',a);set('folios',a);
        return {ok:true,eliminado:true,folios:a};
      }catch(error){return {ok:false,mensaje:'No fue posible eliminar el folio.'}}
    },
    async seleccionarFolio(o={}){set('folioActivo',o||null);return {ok:true,folio:o||null}},
    async obtenerFolioActivo(){return {ok:true,folio:get('folioActivo',null)}},
    async obtenerNuevoConsecutivo(obraId){const a=get('folios',[]).filter(x=>String(x.obraId)===String(obraId));const max=a.reduce((m,x)=>Math.max(m,Number(x.consecutivo||x.numero||0)),0);return {ok:true,consecutivo:max+1}},
    async listarContratistas(){
      const local=get('contratistas',[]);
      const almacenados=await idbLeer('contratistas',null);
      const contratistas=Array.isArray(almacenados)?almacenados:local;
      if(almacenados===null&&Array.isArray(local))try{await idbGuardar('contratistas',local)}catch{}
      return {ok:true,contratistas};
    },
    async guardarContratista(o={}){
      try{
        const actuales=(await api.listarContratistas()).contratistas||[];
        const registro={...o,id:o.id||id('contratista'),actualizadoEn:new Date().toISOString()};
        const n=actuales.findIndex(x=>String(x.id)===String(registro.id));
        n>=0?actuales[n]=registro:actuales.push(registro);
        await idbGuardar('contratistas',actuales);
        set('contratistas',actuales);
        return {ok:true,contratista:registro,contratistas:actuales};
      }catch(error){
        console.error('Error guardando contratista:',error);
        return {ok:false,mensaje:'Safari no permitió guardar la información. Verifique que no esté usando navegación privada y que haya espacio disponible en el dispositivo.'};
      }
    },
    async eliminarContratista(x){
      try{
        const actuales=(await api.listarContratistas()).contratistas||[];
        const a=actuales.filter(o=>String(o.id)!==String(x));
        await idbGuardar('contratistas',a);set('contratistas',a);
        return {ok:true,eliminado:true,contratistas:a};
      }catch(error){return {ok:false,mensaje:'No fue posible eliminar el contratista.'}}
    },
    async obtenerConfiguracion(o={}){const all=get('configuracion',{});const obraId=o.obraId||'';return {ok:true,configuracion:obraId?(all.porObra?.[obraId]||{}):all}},
    async guardarConfiguracion(c={},o={}){let all=get('configuracion',{});if(o.obraId){all.porObra=all.porObra||{};all.porObra[o.obraId]=c}else all=c;set('configuracion',all);return {ok:true,configuracion:c}},
    async seleccionarArchivos(o={}){const fs=await pick((o.filtros||[]).flatMap(x=>x.extensions||[]).map(x=>'.'+x).join(','),o.multiple!==false);return {ok:true,archivos:await Promise.all(fs.map(async f=>({nombre:f.name,name:f.name,tamano:f.size,tipo:f.type,dataUrl:await toData(f)})))}},
    async seleccionarImagenesEvidencia(){
      const fs=await pick('image/*',true);
      const archivos=await Promise.all(fs.map(async f=>{
        const datos=await toData(f);
        return {id:id('img'),nombre:f.name,ruta:f.name,tipo:f.type,tamano:f.size,datos,dataUrl:datos,fechaAgregada:new Date().toISOString()};
      }));
      return {ok:true,cancelado:!archivos.length,archivos,imagenes:archivos};
    },
    async seleccionarAnexosEvidencia(){
      const fs=await pick('*/*',true);
      const archivos=await Promise.all(fs.map(async f=>{
        const datos=await toData(f);
        return {id:id('anexo'),nombre:f.name,ruta:f.name,tipo:f.type||'application/octet-stream',tamano:f.size,datos,dataUrl:datos,fechaAgregada:new Date().toISOString()};
      }));
      return {ok:true,cancelado:!archivos.length,archivos,anexos:archivos};
    },
    async leerImagenEvidencia(i={}){
      const datos=i.datos||i.dataUrl||i.base64||'';
      return {ok:!!datos,datos,dataUrl:datos,tipo:i.tipo||'',tamano:i.tamano||0};
    }, async eliminarImagenEvidencia(){return {ok:true}},
    async guardarArchivo(o={}){const b=o.contenido instanceof Blob?o.contenido:new Blob([o.contenido||''],{type:o.tipoMime||'text/plain;charset=utf-8'});download(b,o.nombreSugerido||o.nombre||'archivo.txt');return {ok:true,ruta:o.nombreSugerido||o.nombre}},
    async guardarArchivoBinario(o={}){let b=o.contenido||o.datos||'';if(typeof b==='string'&&b.startsWith('data:')){const r=await fetch(b);b=await r.blob()}else if(!(b instanceof Blob))b=new Blob([b]);download(b,o.nombreSugerido||o.nombre||'archivo');return {ok:true}},
    async guardarPDFDesdeHTML(){window.print();return {ok:true}}, async imprimir(){window.print();return {ok:true}},
    async abrirRuta(r=''){if(/^https?:|^data:|^blob:/.test(r))window.open(r,'_blank');return {ok:true}}, async abrirArchivo(){return {ok:false,error:'Use el selector de archivos del navegador.'}},
    async seleccionarCarpeta(){return {ok:true,ruta:'Descargas'}}, async obtenerInformacionAplicacion(){return {ok:true,nombre:'Bitácora de Obra PWA',version:'1.50.0',plataforma:navigator.platform}},
    async listarDocumentosObra(obraId=''){return {ok:true,documentos:get('docs.'+obraId,[])}},
    async agregarDocumentosObra({obraId}={}){const fs=await pick('*/*',true);const docs=await Promise.all(fs.map(async f=>({id:id('doc'),nombre:f.name,tipo:f.type,tamano:f.size,dataUrl:await toData(f)})));const a=[...get('docs.'+obraId,[]),...docs];set('docs.'+obraId,a);return {ok:true,documentos:a}},
    async abrirDocumentoObra(d={}){if(d.dataUrl)window.open(d.dataUrl,'_blank');return {ok:true}},
    async descargarDocumentoObra(d={}){if(d.dataUrl){const b=await (await fetch(d.dataUrl)).blob();download(b,d.nombre)}return {ok:true}},
    async eliminarDocumentoObra(d={}){for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith(K+'docs.'))set(k.slice(K.length),get(k.slice(K.length),[]).filter(x=>x.id!==d.id))}return {ok:true}}
  };
  window.electronAPI=Object.freeze(api);
})();
