/* v1.3.28 - Mapa territorial: amplía la ficha visible de líderes con sector, barrio y puesto de votación. Módulo aislado: no modifica app.js. */
(()=>{
  'use strict';
  const areas=[
    ['VEREDA MARTA',24.5,17.0],['VEREDA SOGAMOSO',31.7,26.0],['VEREDA LA PARROQUIA',39.0,30.5],['VEREDA CEDRO',44.0,33.8],['VEREDA MOTOSO',48.0,40.0],
    ['VEREDA BOCAS',72.7,8.0],['VEREDA CARRIZAL',66.6,25.0],['GIRÓN',69.4,31.2,'giron'],['VEREDA RIO FRIO',73.3,27.0],['VEREDA RIO FRIO',73.7,34.0],
    ['VEREDA LLANADAS',71.0,39.0],['VEREDA BARBOSA',73.5,42.0],['VEREDA LLANO GRANDE',65.4,45.5],['VEREDA ACAPULCO',77.0,46.0],['VEREDA RUITOQUE',70.2,48.5],
    ['VEREDA PEÑAS',65.8,52.0],['VEREDA CHOCOITA',70.0,53.5],['VEREDA PALOGORDO',75.0,56.5],['VEREDA PANTANO',56.2,49.0],['VEREDA CANTALTA',61.7,61.0],['VEREDA CHOCOA',73.8,68.0]
  ];
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\b(BARRIO|VEREDA|SECTOR|URBANIZACION|COMUNA|CORREGIMIENTO)\b/g,' ').replace(/[^A-Z0-9]+/g,' ').trim();
  const cleanArea=v=>norm(v).replace(/^GIRON$/,'GIRON');
  const territoryMatch=(value,area)=>{const v=norm(value),a=cleanArea(area);if(!v)return false;if(a==='GIRON')return v==='GIRON'||v.includes('CASCO URBANO')||v.includes('CENTRO GIRON')||v.includes('AREA URBANA');return v===a||v.includes(a)||a.includes(v)};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const getDB=()=>window.db||((typeof db!=='undefined')?db:{needs:[],leaders:[],projects:[],actions:[]});
  let selected='';

  function leaderMatchesArea(l,area){
    // La vereda explícita manda. Solo si el registro es antiguo y no tiene vereda, se usa territorio como compatibilidad.
    if(String(l.vereda||'').trim()) return territoryMatch(l.vereda,area);
    return territoryMatch(l.territory,area);
  }
  function authorizedForArea(area){return (getDB().leaders||[]).filter(l=>l.communicationsConsent==='Sí'&&leaderMatchesArea(l,area))}
  function globalAuthorized(){return (getDB().leaders||[]).filter(l=>l.communicationsConsent==='Sí')}
  function updateSummary(area=''){
    const d=getDB();
    const totalGlobal=globalAuthorized().length;
    const g=document.getElementById('mapGlobalAuthorized'); if(g)g.textContent=totalGlobal;
    const go=document.getElementById('mapGlobalAuthorizedOverlay'); if(go)go.textContent=totalGlobal;
    const s=document.getElementById('mapSelectedAuthorized'); if(s)s.textContent=area?authorizedForArea(area).length:'—';
    const u=document.getElementById('mapUnassignedCount'); if(u)u.textContent=[...(d.needs||[]),...(d.projects||[]),...(d.actions||[])].filter(r=>!String(r.vereda||'').trim()).length;
  }
  function countForArea(area){return authorizedForArea(area).length}

  function renderHotspots(){
    const host=document.getElementById('territorialHotspots'); if(!host)return;
    host.innerHTML=areas.map(([name,x,y,cls])=>{const count=countForArea(name);return `<button type="button" class="map-hotspot ${cls||''}" style="left:${x}%;top:${y}%" data-map-area="${esc(name)}" title="Consultar ${esc(name)} · ${count} contacto(s) autorizado(s)" aria-label="Consultar ${esc(name)}: ${count} contactos autorizados"><span class="map-hotspot-symbol">${cls?'GIRÓN':'●'}</span><span class="map-hotspot-count">${count}</span></button>`}).join('');
    host.querySelectorAll('[data-map-area]').forEach(b=>b.addEventListener('click',()=>selectArea(b.dataset.mapArea,b)));
    updateSummary(selected);
  }
  async function petitionDocsFor(needs,area){
    if(!('indexedDB' in window)||!needs.length)return [];
    const ids=new Set(needs.map(n=>n.id)),codes=new Set(needs.map(n=>n.code));
    try{const d=await new Promise((res,rej)=>{const r=indexedDB.open('matriz_giron_documents_v1',1);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});const all=await new Promise((res,rej)=>{const tx=d.transaction('petitionPdfs','readonly'),r=tx.objectStore('petitionPdfs').getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error)});d.close();return all.filter(r=>ids.has(r.needId)||codes.has(r.needCode)||territoryMatch(r.vereda,area))}catch(_){return []}
  }
  async function selectArea(area,button){
    selected=area;document.querySelectorAll('.map-hotspot').forEach(x=>x.classList.remove('active'));button?.classList.add('active');updateSummary(area);
    const data=getDB();
    const matchesRecord=(r,legacyFields=[])=>String(r?.vereda||'').trim()?territoryMatch(r.vereda,area):legacyFields.some(k=>territoryMatch(r?.[k],area));
    const needs=(data.needs||[]).filter(n=>matchesRecord(n,['territory','zone']));
    const needIds=new Set(needs.map(n=>n.id));
    const leaders=(data.leaders||[]).filter(l=>(leaderMatchesArea(l,area)||needs.some(n=>n.leaderId===l.id))&&l.communicationsConsent==='Sí');
    const projects=(data.projects||[]).filter(p=>matchesRecord(p,['territory'])||needIds.has(p.needId));
    const projectIds=new Set(projects.map(p=>p.id));
    const actions=(data.actions||[]).filter(a=>matchesRecord(a,[])||needIds.has(a.needId)||projectIds.has(a.projectId));
    const docs=await petitionDocsFor(needs,area),panel=document.getElementById('territoryDataPanel');if(!panel)return;
    const rows=(arr,fn,empty='Sin registros asociados en este territorio.')=>arr.length?arr.map(fn).join(''):`<div class="territory-none">${empty}</div>`;
    panel.innerHTML=`
      <div class="territory-panel-head"><h3>📍 ${esc(area)}</h3><p>Ficha territorial vinculada a la información actualmente registrada.</p></div>
      <div class="territory-mini-kpis">
        <div class="territory-mini-kpi territory-highlight"><strong>${leaders.length}</strong><span>Contactos autorizados</span></div><div class="territory-mini-kpi"><strong>${needs.length}</strong><span>Necesidades</span></div>
        <div class="territory-mini-kpi"><strong>${actions.length}</strong><span>Gestiones</span></div><div class="territory-mini-kpi"><strong>${projects.length}</strong><span>Proyectos</span></div>
        <div class="territory-mini-kpi"><strong>${docs.length}</strong><span>Derechos de petición</span></div><div class="territory-mini-kpi"><strong>${needs.filter(n=>n.status==='Solucionada').length}</strong><span>Solucionadas</span></div>
      </div>
      <div class="territory-block"><h4>👥 Líderes / JAC / Ediles autorizados para comunicaciones</h4>${rows(leaders,l=>`<div class="territory-row"><strong>${esc(l.name)}</strong><small>${esc(l.role||'')} · ${esc(l.organization||'')}</small><span class="territory-badge">Sector: ${esc(l.sectorTerritorial||'Sin sector')}</span><span class="territory-badge">Barrio: ${esc(l.barrio||l.territory||'Sin barrio')}</span><span class="territory-badge">Puesto de votación: ${esc(l.pollingPlace||'Sin registrar')}</span><span class="territory-badge">Vereda: ${esc(l.vereda||'Registro anterior sin vereda')}</span><span class="territory-badge">WhatsApp: ${esc(l.whatsapp||l.phone||'—')}</span></div>`)}</div>
      <div class="territory-block"><h4>📌 Peticiones y necesidades de la comunidad</h4>${rows(needs,n=>`<div class="territory-row"><strong>${esc(n.code)} · ${esc(n.title)}</strong><small>${esc(n.sector||'Sin sector')} · ${esc(n.priority||'')} · ${esc(n.status||'')}</small><span class="territory-badge">Vereda: ${esc(n.vereda||'Sin asignar')}</span><span class="territory-badge">${esc(n.nextAction||'Sin próxima acción')}</span></div>`)}</div>
      <div class="territory-block"><h4>✓ Gestión realizada / seguimiento</h4>${rows(actions,a=>`<div class="territory-row"><strong>${esc(a.type||'Gestión')} · ${esc(a.date||'')}</strong><small>${esc(a.description||'')}</small><span class="territory-badge">Vereda: ${esc(a.vereda||'Sin asignar')}</span><span class="territory-badge">Responsable: ${esc(a.responsible||'—')}</span></div>`)}</div>
      <div class="territory-block"><h4>📁 Proyectos e iniciativas</h4>${rows(projects,p=>`<div class="territory-row"><strong>${esc(p.name||'Proyecto')}</strong><small>${esc(p.entity||'')} · ${esc(p.status||'')}</small><span class="territory-badge">Vereda: ${esc(p.vereda||'Sin asignar')}</span>${p.radicado?`<span class="territory-badge">Radicado ${esc(p.radicado)}</span>`:''}</div>`)}</div>
      <div class="territory-block"><h4>📄 Derechos de Petición enviados / archivados</h4>${rows(docs,r=>`<div class="territory-row"><strong>${esc(r.needCode||'')} · ${esc(r.entity||'Derecho de Petición')}</strong><small>${esc(r.recipientName||'')} · ${esc(r.filename||'PDF archivado')}</small><span class="territory-badge">Vereda: ${esc(r.vereda||'Heredada por necesidad')}</span>${r.radicado?`<span class="territory-badge">Radicado ${esc(r.radicado)}</span>`:''}</div>`)}</div>
      <div class="territory-panel-actions"><button type="button" class="primary" id="mapOpenNeeds">Ver necesidades</button><button type="button" class="primary" id="mapOpenIntel">Inteligencia territorial</button></div>
      <div class="map-source-note">Mapa base suministrado para la aplicación. Las zonas táctiles son una capa de consulta y no sustituyen cartografía GIS oficial.</div>`;
    document.getElementById('mapOpenNeeds')?.addEventListener('click',()=>window.showView?.('needs'));
    document.getElementById('mapOpenIntel')?.addEventListener('click',()=>{window.showView?.('reports');setTimeout(()=>{const s=document.getElementById('intelTerritorySelect');if(s){const opt=[...s.options].find(o=>territoryMatch(o.value,area));if(opt){s.value=opt.value;s.dispatchEvent(new Event('change'))}}},80)});
  }
  function init(){renderHotspots();const lt=document.getElementById('leadersTable');if(lt)new MutationObserver(()=>{renderHotspots();if(selected){const b=[...document.querySelectorAll('.map-hotspot')].find(x=>x.dataset.mapArea===selected);selectArea(selected,b)}}).observe(lt,{childList:true,subtree:true});window.addEventListener('storage',()=>{renderHotspots();if(selected){const b=[...document.querySelectorAll('.map-hotspot')].find(x=>x.dataset.mapArea===selected);selectArea(selected,b)}})}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
