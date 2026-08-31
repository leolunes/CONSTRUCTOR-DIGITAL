/* Seguimiento fotográfico v1.2.1
   Extensión aislada: no modifica la navegación ni el motor original de la app. */
(() => {
  'use strict';
  const DB_NAME='matriz_giron_photos_v2', STORE='photos';
  let activeNeedId='';
  let pending=[];

  function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(STORE)){const s=d.createObjectStore(STORE,{keyPath:'id'});s.createIndex('needId','needId',{unique:false})}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
  async function listPhotos(needId){if(!needId)return[];const d=await openDB();return new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readonly'),idx=tx.objectStore(STORE).index('needId'),r=idx.getAll(needId);r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error);tx.oncomplete=()=>d.close()})}
  async function putPhoto(p){const d=await openDB();return new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).put(p);tx.oncomplete=()=>{d.close();resolve()};tx.onerror=()=>{const e=tx.error;d.close();reject(e)}})}
  async function deletePhoto(id){const d=await openDB();return new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);tx.oncomplete=()=>{d.close();resolve()};tx.onerror=()=>{const e=tx.error;d.close();reject(e)}})}
  async function allPhotos(){const d=await openDB();return new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readonly'),r=tx.objectStore(STORE).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error);tx.oncomplete=()=>d.close()})}
  async function clearPhotos(){const d=await openDB();return new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();tx.oncomplete=()=>{d.close();resolve()};tx.onerror=()=>{const e=tx.error;d.close();reject(e)}})}
  function id(){return 'F-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
  function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function revokePending(){pending.forEach(p=>{if(p.url)URL.revokeObjectURL(p.url)});pending=[]}
  function meta(phase){const today=new Date().toISOString().slice(0,10);if(phase==='followup')return{date:document.getElementById('photoFollowDate')?.value||today,note:document.getElementById('photoFollowNote')?.value||''};if(phase==='before')return{date:today,note:document.getElementById('photoBeforeNote')?.value||''};return{date:today,note:document.getElementById('photoAfterNote')?.value||''}}
  function compress(file,max=1280,q=.72){return new Promise((resolve,reject)=>{const u=URL.createObjectURL(file),i=new Image();i.onload=()=>{try{let w=i.naturalWidth,h=i.naturalHeight,sc=Math.min(1,max/Math.max(w,h));w=Math.max(1,Math.round(w*sc));h=Math.max(1,Math.round(h*sc));const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{alpha:false});x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(i,0,0,w,h);c.toBlob(b=>{URL.revokeObjectURL(u);b?resolve(b):reject(new Error('No se pudo comprimir la foto'))},'image/jpeg',q)}catch(e){URL.revokeObjectURL(u);reject(e)}};i.onerror=()=>{URL.revokeObjectURL(u);reject(new Error('Imagen no válida'))};i.src=u})}
  function card(p,isPending){const u=isPending?p.url:URL.createObjectURL(p.blob);return `<div class="photo-thumb"><button type="button" class="photo-remove" data-photo-remove="${escapeHtml(p.id)}" data-pending="${isPending?'1':'0'}">×</button><img src="${u}" alt="Evidencia fotográfica"><div class="photo-thumb-info"><strong>${escapeHtml(p.date||'Sin fecha')}${isPending?' · por guardar':''}</strong>${escapeHtml(p.note||'Sin descripción')}</div></div>`}
  async function render(){const stored=activeNeedId?await listPhotos(activeNeedId):[];for(const ph of ['before','followup','after']){const el=document.getElementById(ph==='before'?'beforeGallery':ph==='followup'?'followupGallery':'afterGallery');if(!el)continue;const html=[...stored.filter(x=>x.phase===ph).map(x=>card(x,false)),...pending.filter(x=>x.phase===ph).map(x=>card(x,true))].join('');el.innerHTML=html||`<div class="photo-empty">Aún no hay fotografías ${ph==='before'?'iniciales':ph==='followup'?'de seguimiento':'finales'}.</div>`}}
  async function onFiles(e){const input=e.currentTarget,files=[...(input.files||[])],phase=input.dataset.phase;if(!files.length)return;const m=meta(phase),phaseBox=input.closest('.photo-phase'),note=document.createElement('div');note.className='photo-processing';note.textContent='Procesando fotografías…';phaseBox?.appendChild(note);try{for(const f of files){if(!f.type.startsWith('image/'))continue;const blob=await compress(f);pending.push({id:id(),phase,date:m.date,note:m.note,blob,url:URL.createObjectURL(blob),created:new Date().toISOString()})}await render()}catch(err){alert('No fue posible procesar la fotografía: '+err.message)}finally{note.remove();input.value=''}}
  async function savePending(needId){for(const p of pending){await putPhoto({id:p.id,needId,phase:p.phase,date:p.date,note:p.note,blob:p.blob,created:p.created})}revokePending()}
  function resetPhotoUI(){revokePending();activeNeedId='';const d=document.getElementById('photoFollowDate');if(d)d.value=new Date().toISOString().slice(0,10);['photoBeforeNote','photoFollowNote','photoAfterNote'].forEach(x=>{const e=document.getElementById(x);if(e)e.value=''});render().catch(console.error)}
  function findSavedNeed(ctx){if(ctx.id)return ctx.id;const matches=db.needs.filter(n=>n.title===ctx.title&&n.territory===ctx.territory);return matches.length?matches[matches.length-1].id:(db.needs.length?db.needs[db.needs.length-1].id:'')}
  function blobToDataURL(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob)})}
  function dataURLToBlob(s){const [h,d]=s.split(','),mime=(h.match(/data:(.*?);/)||[])[1]||'image/jpeg',bin=atob(d),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return new Blob([a],{type:mime})}
  async function exportFull(){try{const ps=await allPhotos(),ser=[];for(const p of ps)ser.push({...p,blob:undefined,dataUrl:await blobToDataURL(p.blob)});const payload={...db,__photoBackupVersion:2,__photos:ser};const b=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});downloadBlob(b,`MATRIZ-GIRON-RESPALDO-${new Date().toISOString().slice(0,10)}.json`);toast(`Respaldo exportado · ${ps.length} foto(s)`)}catch(e){alert('No fue posible exportar el respaldo: '+e.message)}}
  async function importFull(e){const f=e.target.files?.[0];if(!f)return;try{const text=await f.text(),obj=JSON.parse(text);if(!obj.needs||!obj.leaders)throw new Error('Formato inválido');const ps=Array.isArray(obj.__photos)?obj.__photos:[];delete obj.__photos;delete obj.__photoBackupVersion;db={...blankDB(),...obj};await clearPhotos();for(const p of ps){if(p.dataUrl)await putPhoto({...p,blob:dataURLToBlob(p.dataUrl),dataUrl:undefined})}saveDB();toast(`Respaldo restaurado · ${ps.length} foto(s)`)}catch(err){alert('No fue posible importar el archivo: '+err.message)}finally{e.target.value=''}}

  function initPhotos(){
    const form=document.getElementById('needForm');if(!form)return;
    const fd=document.getElementById('photoFollowDate');if(fd&&!fd.value)fd.value=new Date().toISOString().slice(0,10);
    document.querySelectorAll('.photo-input').forEach(x=>x.addEventListener('change',onFiles));

    // Nuevo registro: se limpia únicamente el módulo fotográfico y el formulario para evitar IDs residuales.
    document.querySelectorAll('[data-open-modal="needModal"]').forEach(b=>b.addEventListener('click',()=>{form.reset();resetPhotoUI()}));

    // Edición: se conserva exactamente el flujo original y se añade la carga fotográfica.
    const originalEdit=window.editNeed;
    window.editNeed=function(needId){revokePending();originalEdit(needId);activeNeedId=needId;render().catch(console.error)};

    // Captura el contexto antes de que el motor original guarde y resetee el formulario.
    let ctx=null;
    form.addEventListener('submit',()=>{const o=Object.fromEntries(new FormData(form));ctx={id:o.id||'',title:o.title||'',territory:o.territory||''}},true);
    form.addEventListener('submit',()=>{const savedId=findSavedNeed(ctx||{});if(savedId&&pending.length){const count=pending.length;savePending(savedId).then(()=>toast(`Necesidad guardada · ${count} foto(s)`)).catch(err=>alert('La necesidad se guardó, pero no fue posible guardar las fotografías: '+err.message))}ctx=null});

    form.elements.status?.addEventListener('change',async e=>{if(e.target.value!=='Solucionada')return;const stored=activeNeedId?await listPhotos(activeNeedId):[];if(!stored.some(x=>x.phase==='after')&&!pending.some(x=>x.phase==='after'))toast('Recomendación: agregue fotografía del DESPUÉS antes de cerrar la necesidad')});

    document.getElementById('photoFollowupPanel')?.addEventListener('click',async e=>{const btn=e.target.closest('[data-photo-remove]');if(btn){const pid=btn.dataset.photoRemove;if(btn.dataset.pending==='1'){const i=pending.findIndex(x=>x.id===pid);if(i>=0){const [p]=pending.splice(i,1);if(p.url)URL.revokeObjectURL(p.url);await render()}}else if(confirm('¿Eliminar esta fotografía?')){await deletePhoto(pid);await render()}return}const im=e.target.closest('.photo-thumb img');if(im){const d=document.createElement('div');d.className='photo-fullscreen';d.innerHTML=`<img src="${im.src}" alt="Fotografía ampliada">`;d.onclick=()=>d.remove();document.body.appendChild(d)}});

    // Respaldo completo: reemplaza únicamente los manejadores de respaldo, no la navegación.
    const backup=document.getElementById('backupBtn'),exp=document.getElementById('exportJson');if(backup)backup.onclick=exportFull;if(exp)exp.onclick=exportFull;
    const oldImp=document.getElementById('importJson');if(oldImp){const clone=oldImp.cloneNode(true);oldImp.replaceWith(clone);clone.addEventListener('change',importFull)}
    const clear=document.getElementById('clearData');if(clear)clear.onclick=async()=>{if(confirm('¿Seguro que desea borrar todos los datos locales y sus fotografías? Esta acción no se puede deshacer.')){db=blankDB();await clearPhotos();saveDB();toast('Datos y fotografías borrados')}};
  }

  // app.js se carga inmediatamente antes. Su init() ya terminó al llegar aquí.
  try{initPhotos()}catch(err){console.error('Módulo fotográfico:',err)}
})();
