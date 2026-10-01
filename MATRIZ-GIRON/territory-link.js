/* ============================================================
   Vinculación territorial transversal · v1.3.12
   Módulo aislado: NO modifica app.js.
   Incorpora Vereda en necesidades, proyectos, gestiones y
   Derechos de Petición; migra registros históricos cuando hay
   una relación inequívoca y mantiene compatibilidad con datos previos.
   ============================================================ */
(()=>{
  'use strict';
  const VEREDAS=['GIRÓN - ÁREA URBANA','VEREDA MARTA','VEREDA SOGAMOSO','VEREDA LA PARROQUIA','VEREDA CEDRO','VEREDA MOTOSO','VEREDA BOCAS','VEREDA CARRIZAL','VEREDA RIO FRIO','VEREDA LLANADAS','VEREDA BARBOSA','VEREDA LLANO GRANDE','VEREDA ACAPULCO','VEREDA RUITOQUE','VEREDA PEÑAS','VEREDA CHOCOITA','VEREDA PALOGORDO','VEREDA PANTANO','VEREDA CANTALTA','VEREDA CHOCOA'];
  const clean=v=>String(v??'').trim();
  const norm=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
  const getDB=()=>window.db||((typeof db!=='undefined')?db:null);
  const persist=()=>{try{if(typeof saveDB==='function')saveDB();else localStorage.setItem('matriz_giron_v1',JSON.stringify(getDB()));}catch(e){console.warn('No se pudo persistir migración territorial',e)}};

  function canonicalVereda(value){
    const raw=clean(value), n=norm(raw); if(!n)return '';
    if(n==='GIRON'||n==='GIRON AREA URBANA'||n==='AREA URBANA'||n==='CASCO URBANO'||n==='CENTRO GIRON') return 'GIRÓN - ÁREA URBANA';
    // Solo inferir vereda cuando el texto la identifica explícitamente. Evita confundir BARRIO CARRIZAL con VEREDA CARRIZAL.
    if(!/^VEREDA\b/.test(n)) return '';
    const match=VEREDAS.find(v=>norm(v)===n); return match||'';
  }
  function leaderVereda(leaderId){const d=getDB();return clean(d?.leaders?.find(l=>l.id===leaderId)?.vereda)}
  function needVereda(needId){const d=getDB();return clean(d?.needs?.find(n=>n.id===needId)?.vereda)}
  function projectVereda(projectId){const d=getDB();return clean(d?.projects?.find(p=>p.id===projectId)?.vereda)}

  function fillSelect(id){
    const s=document.getElementById(id); if(!s)return;
    const cur=s.value;
    s.innerHTML='<option value="">Sin asignar / no aplica</option>'+VEREDAS.map(v=>`<option value="${v}">${v}</option>`).join('');
    if([...s.options].some(o=>o.value===cur))s.value=cur;
  }
  function fillAll(){['communityVereda','needVereda','projectVereda','actionVereda'].forEach(fillSelect)}

  function migrateDB(){
    const d=getDB(); if(!d)return false; let changed=false;
    for(const n of d.needs||[]){
      if(!clean(n.vereda)){
        const inherited=leaderVereda(n.leaderId)||canonicalVereda(n.zone)||canonicalVereda(n.territory);
        if(inherited){n.vereda=inherited;changed=true;}
      }
      if(Array.isArray(n.petitions) && clean(n.vereda)){
        for(const p of n.petitions){if(!clean(p.vereda)){p.vereda=n.vereda;changed=true;}}
      }
    }
    for(const p of d.projects||[]){
      if(!clean(p.vereda)){
        const inherited=needVereda(p.needId)||canonicalVereda(p.territory);
        if(inherited){p.vereda=inherited;changed=true;}
      }
    }
    for(const a of d.actions||[]){
      if(!clean(a.vereda)){
        const inherited=needVereda(a.needId)||projectVereda(a.projectId);
        if(inherited){a.vereda=inherited;changed=true;}
      }
    }
    if(changed)persist();
    return changed;
  }

  async function migrateArchivedPdfs(){
    if(!('indexedDB' in window))return;
    const d=getDB(); if(!d)return;
    const byNeed=new Map((d.needs||[]).filter(n=>clean(n.vereda)).map(n=>[n.id,n.vereda]));
    if(!byNeed.size)return;
    try{
      const dbx=await new Promise((res,rej)=>{const r=indexedDB.open('matriz_giron_documents_v1',1);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
      if(!dbx.objectStoreNames.contains('petitionPdfs')){dbx.close();return;}
      const all=await new Promise((res,rej)=>{const tx=dbx.transaction('petitionPdfs','readonly'),r=tx.objectStore('petitionPdfs').getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error)});
      const updates=all.filter(r=>!clean(r.vereda)&&byNeed.has(r.needId));
      if(updates.length){await new Promise((res,rej)=>{const tx=dbx.transaction('petitionPdfs','readwrite'),st=tx.objectStore('petitionPdfs');updates.forEach(r=>{r.vereda=byNeed.get(r.needId);st.put(r)});tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}
      dbx.close();
    }catch(e){console.warn('No se pudo completar metadato Vereda en PDFs históricos',e)}
  }

  function bindInheritance(){
    const d=()=>getDB();
    document.getElementById('needLeader')?.addEventListener('change',e=>{const v=leaderVereda(e.target.value),s=document.getElementById('needVereda');if(v&&s&&!s.value)s.value=v});
    document.getElementById('communityLeader')?.addEventListener('change',e=>{const v=leaderVereda(e.target.value),s=document.getElementById('communityVereda');if(v&&s)s.value=v});
    document.getElementById('projectNeed')?.addEventListener('change',e=>{const v=needVereda(e.target.value),s=document.getElementById('projectVereda');if(v&&s)s.value=v});
    document.getElementById('actionNeed')?.addEventListener('change',e=>{const v=needVereda(e.target.value),s=document.getElementById('actionVereda');if(v&&s)s.value=v});
    document.getElementById('actionProject')?.addEventListener('change',e=>{const v=projectVereda(e.target.value),s=document.getElementById('actionVereda');if(v&&s&&!s.value)s.value=v});

    // El formulario comunitario es guardado por app.js. El evento se dispara antes de que el formulario se reinicie.
    window.addEventListener('community-need-saved',e=>{
      const dbx=d(), n=dbx?.needs?.find(x=>x.id===e.detail?.needId); if(!n)return;
      const selected=clean(document.getElementById('communityVereda')?.value)||leaderVereda(n.leaderId);
      if(selected&&!clean(n.vereda)){n.vereda=selected;}
      // app.js ejecuta saveDB inmediatamente después de este evento; no hace falta duplicar la escritura.
    });
  }

  function refreshAfterForms(){fillAll();migrateDB();migrateArchivedPdfs();}
  function init(){fillAll();migrateDB();bindInheritance();migrateArchivedPdfs();
    // Si se abre un modal, asegurar que las listas estén disponibles sin tocar el motor base.
    document.querySelectorAll('.modal').forEach(m=>new MutationObserver(()=>{if(m.classList.contains('open'))fillAll()}).observe(m,{attributes:true,attributeFilter:['class']}));
    window.addEventListener('storage',refreshAfterForms);
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
