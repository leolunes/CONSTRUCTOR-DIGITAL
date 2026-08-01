'use strict';
/* Compatibilidad PWA: reproduce en navegador la API usada por Electron. */
(() => {
  if (window.electronAPI) return;
  const K='bitacora.pwa.';
  const get=(k,d)=>{try{const v=localStorage.getItem(K+k);return v===null?d:JSON.parse(v)}catch{return d}};
  const set=(k,v)=>{localStorage.setItem(K+k,JSON.stringify(v));return v};
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
    async listarFolios(f={}){let a=get('folios',[]);if(f.obraId)a=a.filter(x=>String(x.obraId)===String(f.obraId));return {ok:true,folios:a}},
    async guardarFolio(o={}){const r=saveEntity('folios',o,'folio');return {ok:true,folio:r.registro,folios:r.a}},
    async eliminarFolio(x){const a=get('folios',[]).filter(o=>String(o.id)!==String(x));set('folios',a);return {ok:true,eliminado:true,folios:a}},
    async seleccionarFolio(o={}){set('folioActivo',o||null);return {ok:true,folio:o||null}},
    async obtenerFolioActivo(){return {ok:true,folio:get('folioActivo',null)}},
    async obtenerNuevoConsecutivo(obraId){const a=get('folios',[]).filter(x=>String(x.obraId)===String(obraId));const max=a.reduce((m,x)=>Math.max(m,Number(x.consecutivo||x.numero||0)),0);return {ok:true,consecutivo:max+1}},
    async listarContratistas(){return {ok:true,contratistas:get('contratistas',[])}},
    async guardarContratista(o={}){const r=saveEntity('contratistas',o,'contratista');return {ok:true,contratista:r.registro,contratistas:r.a}},
    async eliminarContratista(x){const a=get('contratistas',[]).filter(o=>String(o.id)!==String(x));set('contratistas',a);return {ok:true,eliminado:true,contratistas:a}},
    async obtenerConfiguracion(o={}){const all=get('configuracion',{});const obraId=o.obraId||'';return {ok:true,configuracion:obraId?(all.porObra?.[obraId]||{}):all}},
    async guardarConfiguracion(c={},o={}){let all=get('configuracion',{});if(o.obraId){all.porObra=all.porObra||{};all.porObra[o.obraId]=c}else all=c;set('configuracion',all);return {ok:true,configuracion:c}},
    async seleccionarArchivos(o={}){const fs=await pick((o.filtros||[]).flatMap(x=>x.extensions||[]).map(x=>'.'+x).join(','),o.multiple!==false);return {ok:true,archivos:await Promise.all(fs.map(async f=>({nombre:f.name,name:f.name,tamano:f.size,tipo:f.type,dataUrl:await toData(f)})))}},
    async seleccionarImagenesEvidencia(){const fs=await pick('image/*',true);return {ok:true,imagenes:await Promise.all(fs.map(async f=>({id:id('img'),nombre:f.name,ruta:f.name,tipo:f.type,tamano:f.size,dataUrl:await toData(f)})))}},
    async seleccionarAnexosEvidencia(){const fs=await pick('*/*',true);return {ok:true,anexos:await Promise.all(fs.map(async f=>({id:id('anexo'),nombre:f.name,ruta:f.name,tipo:f.type,tamano:f.size,dataUrl:await toData(f)})))}},
    async leerImagenEvidencia(i={}){return {ok:true,dataUrl:i.dataUrl||i.base64||''}}, async eliminarImagenEvidencia(){return {ok:true}},
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
