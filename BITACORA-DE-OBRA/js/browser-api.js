'use strict';
/* Compatibilidad PWA: reproduce en navegador la API usada por Electron. */
(() => {
  if (window.electronAPI) return;
  const K='bitacora.pwa.';
  const get=(k,d)=>{try{const v=localStorage.getItem(K+k);return v===null?d:JSON.parse(v)}catch{return d}};
  const set=(k,v)=>{try{localStorage.setItem(K+k,JSON.stringify(v));return true}catch(error){console.warn('No fue posible guardar en localStorage:',error);return false}};

  const DB_NAME='bitacora-obra-pwa';
  const DB_STORE='datos';
  const DB_FOLIOS='folios';
  const abrirDB=()=>new Promise((resolve,reject)=>{
    if(!('indexedDB' in window)){reject(new Error('IndexedDB no disponible'));return;}
    const req=indexedDB.open(DB_NAME,2);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(DB_STORE))db.createObjectStore(DB_STORE);
      if(!db.objectStoreNames.contains(DB_FOLIOS))db.createObjectStore(DB_FOLIOS,{keyPath:'id'});
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||new Error('No fue posible abrir IndexedDB'));
  });
  const idbLeer=async(clave,def)=>{try{const db=await abrirDB();return await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readonly');const req=tx.objectStore(DB_STORE).get(clave);req.onsuccess=()=>resolve(req.result===undefined?def:req.result);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close()})}catch(error){console.warn('Lectura IndexedDB no disponible:',error);return def}};
  const idbGuardar=async(clave,valor)=>{const db=await abrirDB();return await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).put(valor,clave);tx.oncomplete=()=>{db.close();resolve(true)};tx.onerror=()=>{db.close();reject(tx.error||new Error('No fue posible guardar en IndexedDB'))};tx.onabort=()=>{db.close();reject(tx.error||new Error('Guardado cancelado'))}})};
  const idbListarFolios=async()=>{try{const db=await abrirDB();return await new Promise((resolve,reject)=>{const tx=db.transaction(DB_FOLIOS,'readonly');const req=tx.objectStore(DB_FOLIOS).getAll();req.onsuccess=()=>resolve(Array.isArray(req.result)?req.result:[]);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close()})}catch(error){console.warn('No fue posible listar folios individuales:',error);return []}};
  const idbGuardarFolio=async(folio)=>{const db=await abrirDB();return await new Promise((resolve,reject)=>{const tx=db.transaction(DB_FOLIOS,'readwrite');tx.objectStore(DB_FOLIOS).put(folio);tx.oncomplete=()=>{db.close();resolve(true)};tx.onerror=()=>{db.close();reject(tx.error||new Error('No fue posible guardar el folio'))};tx.onabort=()=>{db.close();reject(tx.error||new Error('Guardado de folio cancelado'))}})};
  const idbEliminarFolio=async(folioId)=>{const db=await abrirDB();return await new Promise((resolve,reject)=>{const tx=db.transaction(DB_FOLIOS,'readwrite');tx.objectStore(DB_FOLIOS).delete(folioId);tx.oncomplete=()=>{db.close();resolve(true)};tx.onerror=()=>{db.close();reject(tx.error||new Error('No fue posible eliminar el folio'))}})};
  const claveFolio=(item={})=>String(item.id||`${item.obraId||''}:${item.numero||item.consecutivo||''}`);
  const unirFolios=(...listas)=>{const mapa=new Map();listas.flat().filter(Boolean).forEach(item=>{const clave=claveFolio(item);const anterior=mapa.get(clave)||{};mapa.set(clave,{...anterior,...item,id:item.id||anterior.id||clave})});return [...mapa.values()]};

  const id=(p='id')=>`${p}-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
  const download=(blob,name)=>{
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=name||'archivo';
    a.rel='noopener';
    a.style.display='none';
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{a.remove();URL.revokeObjectURL(url)},10000);
  };
  const esperarImagenes=(doc)=>Promise.all([...doc.images].map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});setTimeout(resolve,4000)})));
  const imprimirHTML=async(html,titulo='Bitácora de Obra')=>{
    const marco=document.createElement('iframe');
    marco.setAttribute('aria-hidden','true');
    marco.style.position='fixed';
    marco.style.right='0';
    marco.style.bottom='0';
    marco.style.width='1px';
    marco.style.height='1px';
    marco.style.border='0';
    marco.style.opacity='0';
    document.body.appendChild(marco);
    const doc=marco.contentDocument;
    doc.open();
    doc.write(String(html||'').replace(/<title>[\s\S]*?<\/title>/i,`<title>${titulo}</title>`));
    doc.close();
    await new Promise(resolve=>setTimeout(resolve,250));
    await esperarImagenes(doc);
    marco.contentWindow.focus();
    marco.contentWindow.print();
    setTimeout(()=>marco.remove(),15000);
    return {ok:true,entorno:'navegador',impreso:true};
  };
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
      const legado=await idbLeer('folios',[]);
      const individuales=await idbListarFolios();
      const unidos=unirFolios(
        Array.isArray(locales)?locales:[],
        Array.isArray(legado)?legado:[],
        Array.isArray(individuales)?individuales:[]
      );
      /* Migrar una sola vez los folios heredados al almacén individual. */
      if(unidos.length!==individuales.length){
        for(const folio of unidos){try{await idbGuardarFolio(folio)}catch(error){console.warn('No fue posible migrar un folio:',error)}}
      }
      let a=unidos;
      if(f.obraId)a=a.filter(x=>String(x.obraId)===String(f.obraId));
      a=[...a].sort((x,y)=>Number(x.consecutivo||x.numero||0)-Number(y.consecutivo||y.numero||0));
      return {ok:true,folios:a};
    },
    async guardarFolio(o={}){
      try{
        const registro={...o,id:o.id||id('folio'),actualizadoEn:new Date().toISOString()};
        await idbGuardarFolio(registro);
        const actuales=(await api.listarFolios({})).folios||[];
        /* Respaldo liviano: no bloquear el guardado si localStorage está lleno. */
        set('folios',actuales.map(f=>({...f,imagenes:(f.imagenes||[]).map(({dataUrl,datos,url,...m})=>m),anexos:(f.anexos||[]).map(({dataUrl,datos,url,...m})=>m)})));
        set('folioActivo',registro);
        return {ok:true,folio:registro,folios:actuales};
      }catch(error){
        console.error('Error guardando folio con evidencias:',error);
        return {ok:false,mensaje:'No fue posible guardar el folio con sus fotografías o anexos. Verifique que Safari no esté en navegación privada y que el dispositivo tenga espacio disponible.'};
      }
    },
    async eliminarFolio(x){
      try{
        await idbEliminarFolio(String(x));
        const actuales=(await api.listarFolios({})).folios||[];
        const a=actuales.filter(o=>String(o.id)!==String(x));
        set('folios',a);
        return {ok:true,eliminado:true,folios:a};
      }catch(error){return {ok:false,mensaje:'No fue posible eliminar el folio.'}}
    },
    async seleccionarFolio(o={}){set('folioActivo',o||null);return {ok:true,folio:o||null}},
    async obtenerFolioActivo(){return {ok:true,folio:get('folioActivo',null)}},
    async obtenerNuevoConsecutivo(obraId){const a=(await api.listarFolios({obraId})).folios||[];const max=a.reduce((m,x)=>Math.max(m,Number(x.consecutivo||x.numero||0)),0);return {ok:true,consecutivo:max+1,numero:String(max+1).padStart(5,'0')}},
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
    async obtenerConfiguracion(o={}){
      const local=get('configuracion',{});
      const almacenada=await idbLeer('configuracion',null);
      const all=(almacenada&&typeof almacenada==='object')?almacenada:local;
      if(almacenada===null&&all&&typeof all==='object')try{await idbGuardar('configuracion',all)}catch{}
      const obraId=String(o.obraId||'');
      if(!obraId)return {ok:true,configuracion:all||{}};
      const base={...(all||{})};
      delete base.porObra;
      const porObra=(all&&all.porObra&&typeof all.porObra==='object')?all.porObra:{};
      const especifica=porObra[obraId]||porObra[Object.keys(porObra).find(k=>String(k)===obraId)]||{};
      const algunaConLogo=Object.values(porObra).find(c=>c&&(c.logoEmpresa||c.empresaLogo))||{};
      const combinada={...base,...especifica};
      if(!combinada.logoEmpresa&&!combinada.empresaLogo){
        combinada.logoEmpresa=algunaConLogo.logoEmpresa||algunaConLogo.empresaLogo||base.logoEmpresa||base.empresaLogo||'';
      }
      return {ok:true,configuracion:combinada};
    },
    async guardarConfiguracion(c={},o={}){
      try{
        const local=get('configuracion',{});
        const almacenada=await idbLeer('configuracion',null);
        let all=(almacenada&&typeof almacenada==='object')?almacenada:local;
        if(!all||typeof all!=='object')all={};
        if(o.obraId){
          all.porObra=all.porObra||{};
          all.porObra[o.obraId]={...c};
        }else{
          const porObra=all.porObra||{};
          all={...c,porObra};
        }
        await idbGuardar('configuracion',all);
        /* Respaldo secundario. Puede fallar si el logo supera la cuota de localStorage. */
        set('configuracion',all);
        return {ok:true,configuracion:c};
      }catch(error){
        console.error('Error guardando configuración y logo:',error);
        return {ok:false,mensaje:'No fue posible guardar la configuración o el logo. Verifique el espacio disponible del dispositivo.'};
      }
    },
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
    async obtenerLogoEmpresa(o={}){
      const cfg=(await api.obtenerConfiguracion(o)).configuracion||{};
      let logo=cfg.logoEmpresa||cfg.empresaLogo||'';
      if(!logo){
        const all=await idbLeer('configuracion',{});
        const porObra=all&&all.porObra&&typeof all.porObra==='object'?all.porObra:{};
        const encontrado=Object.values(porObra).find(x=>x&&(x.logoEmpresa||x.empresaLogo));
        logo=encontrado?.logoEmpresa||encontrado?.empresaLogo||all?.logoEmpresa||all?.empresaLogo||'';
      }
      return {ok:true,logo};
    },
    async guardarArchivo(o={}){
      const nombre=o.nombreSugerido||o.nombre||'archivo.txt';
      const esWord=/\.docx?$/i.test(nombre);
      const tipo=o.tipoMime||(esWord?'application/msword':'text/plain;charset=utf-8');
      const contenido=o.contenido instanceof Blob?o.contenido:(esWord?'\ufeff'+String(o.contenido||''):o.contenido||'');
      const b=contenido instanceof Blob?contenido:new Blob([contenido],{type:tipo});
      /* En iPad/iPhone Safari el atributo download puede abrir el HTML como texto.
         La hoja Compartir entrega el archivo directamente a Word o Archivos. */
      try{
        const archivo=new File([b],nombre,{type:tipo,lastModified:Date.now()});
        if(esWord&&navigator.share&&navigator.canShare?.({files:[archivo]})){
          await navigator.share({title:o.titulo||'Documento Word',files:[archivo]});
          return {ok:true,ruta:nombre,entorno:'navegador',compartido:true};
        }
      }catch(error){
        if(error?.name==='AbortError')return {ok:false,cancelado:true,mensaje:'Operación cancelada.'};
        console.warn('No fue posible usar Compartir; se usará descarga normal.',error);
      }
      download(b,nombre);
      return {ok:true,ruta:nombre,entorno:'navegador',descargado:true};
    },
    async guardarArchivoBinario(o={}){let b=o.contenido||o.datos||'';if(typeof b==='string'&&b.startsWith('data:')){const r=await fetch(b);b=await r.blob()}else if(!(b instanceof Blob))b=new Blob([b]);download(b,o.nombreSugerido||o.nombre||'archivo');return {ok:true}},
    async guardarPDFDesdeHTML(o={}){return imprimirHTML(o.contenidoHTML||'',o.titulo||'Bitácora de Obra')}, async imprimir(o={}){if(o.contenidoHTML)return imprimirHTML(o.contenidoHTML,o.titulo||'Bitácora de Obra');window.print();return {ok:true,entorno:'navegador'}},
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
