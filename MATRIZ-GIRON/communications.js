/* Centro de Comunicaciones WhatsApp · v1.3.32
   Cola asistida: nunca envía automáticamente. Solo contactos con autorización Sí. */
(() => {
  'use strict';
  const clean=v=>String(v??'').trim();
  const digits=v=>clean(v).replace(/\D/g,'');
  const esc=s=>clean(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const KEY='matriz_giron_wa_queue_v1';
  let queue=[];

  function leaders(){
    const d=window.db || (typeof db!=='undefined'?db:null);
    return d && Array.isArray(d.leaders) ? d.leaders : [];
  }
  function validNumber(l){let n=digits(l.whatsapp||l.phone);return n.length>=10?n:''}
  function normNumber(l){let n=validNumber(l);if(n.length===10)n='57'+n;return n}
  function authorized(){return leaders().filter(l=>l.communicationsConsent==='Sí' && validNumber(l));}
  function uniq(a){return [...new Set(a.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));}
  function canonicalOperationalSector(v){const m=clean(v).match(/(?:GRUPO|SECTOR)?\s*(\d+)/i);return m?`SECTOR ${Number(m[1])}`:''}
  function getSector(l){return clean(l.operationalSector)||canonicalOperationalSector(l.groupTerritorial||l.group)||canonicalOperationalSector(l.sectorTerritorial||l.sector||l.territorialSector)}
  function getBarrio(l){return clean(l.barrio||l.neighborhood||l.territory)}
  function baseRecords(){return Array.isArray(window.MatrizBaseTerritorial?.records)?window.MatrizBaseTerritorial.records:[]}
  function sectorOptions(){const fromBase=baseRecords().map(x=>clean(x.operationalSector)||canonicalOperationalSector(x.group)||canonicalOperationalSector(x.sector));const fromLeaders=authorized().map(getSector);return uniq([...fromBase,...fromLeaders]).sort((a,b)=>(Number((a.match(/\d+/)||['999'])[0])-Number((b.match(/\d+/)||['999'])[0]))||a.localeCompare(b,'es'));}
  function barrioOptions(sector){const fromBase=baseRecords().filter(x=>!sector||(clean(x.operationalSector)||canonicalOperationalSector(x.group)||canonicalOperationalSector(x.sector))===sector).map(x=>clean(x.barrio));const fromLeaders=authorized().filter(l=>!sector||getSector(l)===sector).map(getBarrio);return uniq([...fromBase,...fromLeaders]);}

  function showBaseStats(){const e=els();if(!e.sector)return;let n=document.getElementById('waBaseStats');if(!n){n=document.createElement('p');n.id='waBaseStats';n.className='wa-privacy-note';e.sector.closest('.wa-center-grid')?.insertAdjacentElement('afterend',n)}const br=uniq(baseRecords().map(x=>clean(x.barrio))).length;const ld=window.MatrizBaseTerritorial?.leaderRecords?.length||baseRecords().filter(x=>clean(x.name)).length;n.textContent=`Base Territorial cargada: ${sectorOptions().length} sectores operativos · ${br} barrios · ${ld} registros de líderes.`}
  function els(){return {sector:document.getElementById('waSectorFilter'),barrio:document.getElementById('waBarrioFilter'),search:document.getElementById('waLeaderSearch'),message:document.getElementById('waBulkMessage'),summary:document.getElementById('waQueueSummary'),list:document.getElementById('waQueueList')}}
  function leaderOptions(sector,barrio){
    return authorized()
      .filter(l=>(!sector||getSector(l)===sector)&&(!barrio||getBarrio(l)===barrio))
      .slice()
      .sort((a,b)=>clean(a.name).localeCompare(clean(b.name),'es'));
  }
  function fillLeaderFilter(preserve=true){
    const e=els(); if(!e.search)return;
    const old=preserve?e.search.value:'';
    const options=leaderOptions(e.sector?.value||'',e.barrio?.value||'');
    e.search.innerHTML='<option value="">Todos los líderes</option>'+options.map(l=>`<option value="${esc(l.id)}">${esc(l.name||'Contacto')}${getBarrio(l)?` · ${esc(getBarrio(l))}`:''}</option>`).join('');
    if(old && [...e.search.options].some(o=>o.value===old)) e.search.value=old;
    else e.search.value='';
  }
  function fillFilters(){
    const e=els(); if(!e.sector||!e.barrio)return;
    const sv=e.sector.value,bv=e.barrio.value;
    e.sector.innerHTML='<option value="">Todos los sectores</option>'+sectorOptions().map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
    if([...e.sector.options].some(o=>o.value===sv))e.sector.value=sv;
    e.barrio.innerHTML='<option value="">Todos los barrios</option>'+barrioOptions(e.sector.value).map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
    if([...e.barrio.options].some(o=>o.value===bv))e.barrio.value=bv;
    else e.barrio.value='';
    fillLeaderFilter(true);
  }
  function filtered(){
    const e=els(), leaderId=clean(e.search?.value);
    return authorized().filter(l=>(!e.sector?.value||getSector(l)===e.sector.value)&&(!e.barrio?.value||getBarrio(l)===e.barrio.value)&&(!leaderId||String(l.id)===leaderId));
  }
  function save(){localStorage.setItem(KEY,JSON.stringify(queue.map(x=>({id:x.id,status:x.status||'pending',sentAt:x.sentAt||''}))));}
  function restore(){
    try{const saved=JSON.parse(localStorage.getItem(KEY)||'[]');const map=new Map(saved.map(x=>[x.id,x]));queue=authorized().filter(l=>map.has(l.id)).map(l=>({...l,...map.get(l.id)}));}catch{queue=[]}
  }
  function stats(){return {total:queue.length,sent:queue.filter(x=>x.status==='sent').length,pending:queue.filter(x=>x.status!=='sent').length}}
  function render(){
    const e=els(); if(!e.list||!e.summary)return; const s=stats();
    e.summary.innerHTML=queue.length?`<div><span>Cola preparada</span><strong>${s.total}</strong></div><div><span>Procesados</span><strong>${s.sent}</strong></div><div><span>Pendientes</span><strong>${s.pending}</strong></div>`:'<div class="wa-empty"><b>Sin cola preparada.</b><span>Seleccione filtros, escriba el mensaje y pulse “Preparar cola”.</span></div>';
    e.list.innerHTML=queue.map((l,i)=>`<div class="wa-contact-row ${l.status==='sent'?'done':''}"><div class="wa-contact-index">${i+1}</div><div class="wa-contact-main"><b>${esc(l.name||'Contacto')}</b><small>${esc(getSector(l)||'Sin sector')} · ${esc(getBarrio(l)||'Sin barrio')}</small><small>WhatsApp: ${esc(l.whatsapp||l.phone)}${l.pollingPlace?` · Puesto: ${esc(l.pollingPlace)}`:''}</small></div><div class="wa-contact-status">${l.status==='sent'?'✓ Procesado':'Pendiente'}</div><div class="wa-contact-actions"><button class="primary wa-open" data-id="${esc(l.id)}">🟢 Abrir WhatsApp</button><button class="secondary wa-mark" data-id="${esc(l.id)}">${l.status==='sent'?'Marcar pendiente':'Marcar procesado'}</button></div></div>`).join('');
    e.list.querySelectorAll('.wa-open').forEach(b=>b.onclick=()=>openWhatsApp(b.dataset.id));
    e.list.querySelectorAll('.wa-mark').forEach(b=>b.onclick=()=>toggle(b.dataset.id));
  }
  function prepare(){
    const e=els(), msg=clean(e.message?.value); if(!msg){alert('Escriba primero la información que desea compartir.');return}
    const list=filtered(); if(!list.length){alert('No hay contactos autorizados con WhatsApp para los filtros seleccionados.');return}
    queue=list.map(l=>({...l,status:'pending',sentAt:''})); save(); render();
  }
  function openWhatsApp(id){
    const e=els(), msg=clean(e.message?.value); if(!msg){alert('El mensaje está vacío.');return}
    const l=queue.find(x=>x.id===id); if(!l)return;
    if(l.communicationsConsent!=='Sí'){alert('Este contacto no tiene autorización registrada para recibir comunicaciones.');return}
    const n=normNumber(l); if(!n){alert('Este contacto no tiene un número válido de WhatsApp.');return}
    window.open(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`,'_blank','noopener');
    l.status='sent'; l.sentAt=new Date().toISOString();
    const original=leaders().find(x=>x.id===id); if(original){original.lastCommunication=new Date().toISOString().slice(0,10);try{saveDB()}catch(_){}}
    save(); render();
  }
  function toggle(id){const l=queue.find(x=>x.id===id);if(!l)return;l.status=l.status==='sent'?'pending':'sent';l.sentAt=l.status==='sent'?new Date().toISOString():'';save();render()}
  function reset(){if(queue.length&&!confirm('¿Reiniciar la cola actual?'))return;queue=[];localStorage.removeItem(KEY);render()}
  function init(){
    const e=els(); if(!e.sector)return; fillFilters(); showBaseStats(); restore(); render();
    e.sector.addEventListener('change',()=>{e.barrio.value='';fillFilters();});
    e.barrio.addEventListener('change',()=>{fillLeaderFilter(false);});
    e.search.addEventListener('change',()=>{});
    document.getElementById('waPrepareQueue')?.addEventListener('click',prepare);
    document.getElementById('waResetQueue')?.addEventListener('click',reset);
    document.addEventListener('click',ev=>{if(ev.target.closest('[data-view="communications"]'))setTimeout(()=>{fillFilters();showBaseStats();render()},0)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
