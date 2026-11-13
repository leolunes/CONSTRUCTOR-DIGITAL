/* Floridablanca: mapa rural y consulta por barrio / comuna, adaptados de los mapas aportados. */
(()=>{
  'use strict';
  // Posiciones orientativas sobre el plano raster de 2016. No son coordenadas GIS.
  const areas=[
    ['FLORIDABLANCA - ÁREA URBANA',32,58,'floridablanca'],
    ['VEREDA ALSACIA',57,54],['VEREDA CASIANO',47,69],
    // Helechales comprende La Judía (zona café claro al centro del plano).
    // El punto anterior [57,63] caía sobre Casiano y dejaba La Judía sin señal.
    ['VEREDA GUAYANAS',55,77],['VEREDA HELECHALES',58.5,41],
    ['VEREDA AGUABLANCA',65,28],['VEREDA VERICUTE',43,42],
    ['VEREDA RUITOQUE',28,81],['VEREDA RÍO FRÍO',18,72]
  ];
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\b(BARRIO|VEREDA|SECTOR|URBANIZACION|COMUNA|CORREGIMIENTO)\b/g,' ').replace(/[^A-Z0-9]+/g,' ').trim();
  const cleanArea=v=>norm(v);
  const territoryMatch=(value,area)=>{
    const v=norm(value),a=cleanArea(area);if(!v)return false;
    if(a==='FLORIDABLANCA AREA URBANA')return v===a||v==='FLORIDABLANCA'||v.includes('CASCO URBANO')||v.includes('AREA URBANA');
    return v===a || v.startsWith(a+' ');
  };
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const getDB=()=>window.db||((typeof db!=='undefined')?db:{needs:[],leaders:[],projects:[],actions:[]});
  const ruralCatalog=window.FLORIDABLANCA_TERRITORIO.SECTORES_RURALES||[];
  const ruralOther=window.FLORIDABLANCA_TERRITORIO.ASENTAMIENTOS_RURALES||[];
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
    host.innerHTML=areas.map(([name,x,y,cls])=>{const count=countForArea(name);return `<button type="button" class="map-hotspot ${cls||''}" style="left:${x}%;top:${y}%" data-map-area="${esc(name)}" title="Consultar ${esc(name)} · ${count} contacto(s) autorizado(s)" aria-label="Consultar ${esc(name)}: ${count} contactos autorizados"><span class="map-hotspot-symbol">${cls?'URBANA':'●'}</span><span class="map-hotspot-count">${count}</span>${cls?'':`<span class="map-hotspot-name" aria-hidden="true">${esc(name.replace(/^VEREDA\s+/i,''))}</span>`}</button>`}).join('');
    host.querySelectorAll('[data-map-area]').forEach(b=>b.addEventListener('click',()=>selectArea(b.dataset.mapArea,b)));
    updateSummary(selected);
  }
  async function petitionDocsFor(needs,area){
    if(!('indexedDB' in window)||!needs.length)return [];
    const ids=new Set(needs.map(n=>n.id)),codes=new Set(needs.map(n=>n.code));
    try{const d=await new Promise((res,rej)=>{const r=indexedDB.open('matriz_floridablanca_documents_v1',1);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});const all=await new Promise((res,rej)=>{const tx=d.transaction('petitionPdfs','readonly'),r=tx.objectStore('petitionPdfs').getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error)});d.close();return all.filter(r=>ids.has(r.needId)||codes.has(r.needCode)||territoryMatch(r.vereda,area))}catch(_){return []}
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
    const infoRural=ruralCatalog.find(t=>norm(t.vereda)===norm(area));
    const subareas=infoRural?.sectores||[];
    const docs=await petitionDocsFor(needs,area),panel=document.getElementById('territoryDataPanel');if(!panel)return;
    const rows=(arr,fn,empty='Sin registros asociados en este territorio.')=>arr.length?arr.map(fn).join(''):`<div class="territory-none">${empty}</div>`;
    panel.innerHTML=`
      <div class="territory-panel-head"><h3>📍 ${esc(area)}</h3><p>Ficha territorial vinculada a la información actualmente registrada.</p></div>
      <div class="territory-mini-kpis">
        <div class="territory-mini-kpi territory-highlight"><strong>${leaders.length}</strong><span>Contactos autorizados</span></div><div class="territory-mini-kpi"><strong>${needs.length}</strong><span>Necesidades</span></div>
        <div class="territory-mini-kpi"><strong>${actions.length}</strong><span>Gestiones</span></div><div class="territory-mini-kpi"><strong>${projects.length}</strong><span>Compromisos / archivo</span></div>
        <div class="territory-mini-kpi"><strong>${docs.length}</strong><span>Derechos de petición</span></div><div class="territory-mini-kpi"><strong>${needs.filter(n=>n.status==='Solucionada').length}</strong><span>Solucionadas</span></div>
      </div>
      ${infoRural?`<div class="territory-block rural-sector-block"><h4>🏡 Sectores de ${esc(area)} · Corregimiento ${infoRural.corregimiento}</h4><p>Seleccione un sector para ver sus registros específicos. El total de la vereda continúa disponible en los bloques inferiores.</p><div class="rural-sector-buttons">${subareas.map(s=>`<button type="button" class="secondary" data-rural-sector="${esc(s)}">${esc(s)}</button>`).join('')}</div><div id="ruralSectorDetails" class="rural-sector-details">Seleccione uno de los ${subareas.length} sectores relacionados en la cartografía municipal.</div></div>`:''}
      <div class="territory-block"><h4>👥 Líderes / JAC / Ediles autorizados para comunicaciones</h4>${rows(leaders,l=>`<div class="territory-row"><strong>${esc(l.name)}</strong><small>${esc(l.role||'')} · ${esc(l.organization||'')}</small><span class="territory-badge">Sector: ${esc(l.sectorTerritorial||'Sin sector')}</span><span class="territory-badge">Barrio: ${esc(l.barrio||l.territory||'Sin barrio')}</span><span class="territory-badge">Puesto de votación: ${esc(l.pollingPlace||'Sin registrar')}</span><span class="territory-badge">Vereda: ${esc(l.vereda||'Registro anterior sin vereda')}</span><span class="territory-badge">WhatsApp: ${esc(l.whatsapp||l.phone||'—')}</span></div>`)}</div>
      <div class="territory-block"><h4>📌 Peticiones y necesidades de la comunidad</h4>${rows(needs,n=>`<div class="territory-row"><strong>${esc(n.code)} · ${esc(n.title)}</strong><small>${esc(n.sector||'Sin sector')} · ${esc(n.priority||'')} · ${esc(n.status||'')}</small><span class="territory-badge">Vereda: ${esc(n.vereda||'Sin asignar')}</span><span class="territory-badge">${esc(n.nextAction||'Sin próxima acción')}</span></div>`)}</div>
      <div class="territory-block"><h4>✓ Gestión realizada / seguimiento</h4>${rows(actions,a=>`<div class="territory-row"><strong>${esc(a.type||'Gestión')} · ${esc(a.date||'')}</strong><small>${esc(a.description||'')}</small><span class="territory-badge">Vereda: ${esc(a.vereda||'Sin asignar')}</span><span class="territory-badge">Responsable: ${esc(a.responsible||'—')}</span></div>`)}</div>
      <div class="territory-block"><h4>📁 Compromisos futuros y proyectos anteriores</h4>${rows(projects,p=>`<div class="territory-row"><strong>${esc(p.name||'Registro')}</strong><small>${p.recordType==='futureCommitment'?'Propuesta condicionada a resultar elegido':'Proyecto de archivo anterior'} · ${esc(p.status||'')}</small><span class="territory-badge">Vereda: ${esc(p.vereda||'Sin asignar')}</span>${p.radicado?`<span class="territory-badge">Radicado ${esc(p.radicado)}</span>`:''}</div>`)}</div>
      <div class="territory-block"><h4>📄 Derechos de Petición enviados / archivados</h4>${rows(docs,r=>`<div class="territory-row"><strong>${esc(r.needCode||'')} · ${esc(r.entity||'Derecho de Petición')}</strong><small>${esc(r.recipientName||'')} · ${esc(r.filename||'PDF archivado')}</small><span class="territory-badge">Vereda: ${esc(r.vereda||'Heredada por necesidad')}</span>${r.radicado?`<span class="territory-badge">Radicado ${esc(r.radicado)}</span>`:''}</div>`)}</div>
      <div class="territory-panel-actions"><button type="button" class="primary" id="mapOpenNeeds">Ver necesidades</button><button type="button" class="primary" id="mapOpenIntel">Inteligencia territorial</button></div>
      <div class="map-source-note">Mapa base suministrado para la aplicación. Las zonas táctiles son una capa de consulta y no sustituyen cartografía GIS oficial.</div>`;
    document.getElementById('mapOpenNeeds')?.addEventListener('click',()=>window.showView?.('needs'));
    document.getElementById('mapOpenIntel')?.addEventListener('click',()=>{window.showView?.('reports');setTimeout(()=>{const s=document.getElementById('intelTerritorySelect');if(s){const opt=[...s.options].find(o=>territoryMatch(o.value,area));if(opt){s.value=opt.value;s.dispatchEvent(new Event('change'))}}},80)});
    const sectorField=x=>[x?.sectorTerritorial,x?.barrio,x?.territory,x?.sector].some(v=>String(v||'').trim()&&norm(v)===x.__sectorKey);
    panel.querySelectorAll('[data-rural-sector]').forEach(button=>button.addEventListener('click',()=>{
      const sec=button.dataset.ruralSector,id=norm(sec),matched=x=>sectorField({...x,__sectorKey:id});
      const groups=[['Necesidades',needs,n=>n.title||n.code||'Necesidad'],['Contactos autorizados',leaders,l=>l.name||'Contacto'],['Compromisos / archivo',projects,p=>p.name||'Registro'],['Gestiones',actions,a=>a.type||a.description||'Gestión']];
      const detail=panel.querySelector('#ruralSectorDetails');if(!detail)return;
      detail.innerHTML=`<strong>${esc(sec)}</strong>`+groups.map(([label,records,title])=>{const matches=records.filter(matched);return `<div><b>${esc(label)}: ${matches.length}</b>${matches.length?`<ul>${matches.slice(0,20).map(r=>`<li>${esc(title(r))}</li>`).join('')}</ul>`:''}</div>`}).join('');
      panel.querySelectorAll('[data-rural-sector]').forEach(b=>b.classList.toggle('active',b===button));
    }));
  }

  function renderRuralIndex(){
    const host=document.getElementById('ruralExtraList');if(!host)return;
    host.innerHTML=`<p>La Tabla 1 del Plan de Desarrollo 2024–2027 relaciona estos asentamientos rurales sin asignarles aquí una vereda individual. Para vincular registros, seleccione su vereda comprobada en la ficha.</p><div class="rural-extra-chips">${ruralOther.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`;
  }

  function initMapTabs(){
    const buttons=[...document.querySelectorAll('.map-tab-btn')];
    const panels={general:document.getElementById('mapTabGeneral'),urbano:document.getElementById('mapTabUrbano'),comunas:document.getElementById('mapTabComunas'),santander:document.getElementById('mapTabSantander')};
    if(!buttons.length)return;
    const activate=tab=>{
      buttons.forEach(btn=>{const on=btn.dataset.mapTab===tab;btn.classList.toggle('active',on);btn.setAttribute('aria-selected',on?'true':'false');});
      Object.entries(panels).forEach(([key,panel])=>panel&&panel.classList.toggle('active',key===tab));
    };
    buttons.forEach(btn=>btn.addEventListener('click',()=>activate(btn.dataset.mapTab)));
    activate('general');
    const zoomBtn=document.getElementById('urbanMapZoomBtn');
    const modal=document.getElementById('urbanMapModal');
    if(zoomBtn&&modal){zoomBtn.addEventListener('click',()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false')})}
  }

  function init(){initMapTabs();renderHotspots();renderRuralIndex();const lt=document.getElementById('leadersTable');if(lt)new MutationObserver(()=>{renderHotspots();if(selected){const b=[...document.querySelectorAll('.map-hotspot')].find(x=>x.dataset.mapArea===selected);selectArea(selected,b)}}).observe(lt,{childList:true,subtree:true});window.addEventListener('storage',()=>{renderHotspots();if(selected){const b=[...document.querySelectorAll('.map-hotspot')].find(x=>x.dataset.mapArea===selected);selectArea(selected,b)}})}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
