/* Centro de Comunicaciones WhatsApp · v1.3.87
   Selección múltiple asistida en lotes de máximo 20. Nunca envía automáticamente.
   Solo contactos con autorización registrada y WhatsApp válido. */
(() => {
'use strict';
const clean=v=>String(v??'').trim(),digits=v=>clean(v).replace(/\D/g,''),esc=s=>clean(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='matriz_giron_wa_queue_v1',MAX=20;
let queue=[],audience='all',selected=new Set();
function leaders(){const d=window.db||(typeof db!=='undefined'?db:null);return d&&Array.isArray(d.leaders)?d.leaders:[]}
function validNumber(l){let n=digits(l.whatsapp||l.phone);return n.length>=10?n:''}
function normNumber(l){let n=validNumber(l);if(n.length===10)n='57'+n;return n}
function authorized(){return leaders().filter(l=>l.communicationsConsent==='Sí'&&validNumber(l))}
function uniq(a){return [...new Set(a.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'))}
function canonicalOperationalSector(v){const m=clean(v).match(/(?:GRUPO|SECTOR)?\s*(\d+)/i);return m?`SECTOR ${Number(m[1])}`:''}
function getSector(l){return clean(l.operationalSector)||canonicalOperationalSector(l.groupTerritorial||l.group)||canonicalOperationalSector(l.sectorTerritorial||l.sector||l.territorialSector)}
function getBarrio(l){return clean(l.barrio||l.neighborhood||l.territory)}
function baseRecords(){return Array.isArray(window.MatrizBaseTerritorial?.records)?window.MatrizBaseTerritorial.records:[]}
function sectorOptions(){return uniq([...baseRecords().map(x=>clean(x.operationalSector)||canonicalOperationalSector(x.group)||canonicalOperationalSector(x.sector)),...authorized().map(getSector)]).sort((a,b)=>(Number((a.match(/\d+/)||['999'])[0])-Number((b.match(/\d+/)||['999'])[0]))||a.localeCompare(b,'es'))}
function barrioOptions(sector){return uniq([...baseRecords().filter(x=>!sector||(clean(x.operationalSector)||canonicalOperationalSector(x.group)||canonicalOperationalSector(x.sector))===sector).map(x=>clean(x.barrio)),...authorized().filter(l=>!sector||getSector(l)===sector).map(getBarrio)])}
function els(){return {sector:document.getElementById('waSectorFilter'),barrio:document.getElementById('waBarrioFilter'),search:document.getElementById('waLeaderSearch'),message:document.getElementById('waBulkMessage'),summary:document.getElementById('waQueueSummary'),list:document.getElementById('waQueueList'),picker:document.getElementById('waRecipientPicker'),selCount:document.getElementById('waSelectionCount')}}
function contactType(l){
 const raw=clean(l.contactType),v=raw.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(v.includes('simpat'))return 'Simpatizante';
 if(v.includes('lider'))return 'Líder';
 // Los contactos sin clasificación expresa se conservan en «Todos», no en Líderes/Simpatizantes.
 return 'Por clasificar';
}
function audienceRows(){
 const rows=authorized();
 if(audience==='all')return rows;
 return rows.filter(l=>contactType(l)===audience);
}
function updateAudienceCounts(){
 const rows=authorized(),lc=rows.filter(l=>contactType(l)==='Líder').length,sc=rows.filter(l=>contactType(l)==='Simpatizante').length;
 const counts={all:rows.length,'Líder':lc,'Simpatizante':sc};
 document.querySelectorAll('[data-wa-audience]').forEach(b=>{
   const base=b.dataset.waAudience==='all'?'👥 Todos':b.dataset.waAudience==='Líder'?'🧭 Líderes':'🤝 Simpatizantes';
   b.innerHTML=`${base} <span class="wa-audience-count">${counts[b.dataset.waAudience]||0}</span>`;
 });
}
function filtered(){
 const e=els(),id=clean(e.search?.value);
 return audienceRows().filter(l=>(!e.sector?.value||getSector(l)===e.sector.value)&&(!e.barrio?.value||getBarrio(l)===e.barrio.value)&&(!id||String(l.id)===id)).sort((a,b)=>clean(a.name).localeCompare(clean(b.name),'es'))
}
function fillFilters(){
 const e=els();if(!e.sector||!e.barrio)return;const sv=e.sector.value,bv=e.barrio.value;
 e.sector.innerHTML='<option value="">Todos los sectores</option>'+sectorOptions().map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');if([...e.sector.options].some(o=>o.value===sv))e.sector.value=sv;
 e.barrio.innerHTML='<option value="">Todos los barrios</option>'+barrioOptions(e.sector.value).map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');if([...e.barrio.options].some(o=>o.value===bv))e.barrio.value=bv;else e.barrio.value='';
 fillContactFilter();
}
function fillContactFilter(){const e=els();if(!e.search)return;const old=e.search.value,rows=audienceRows().filter(l=>(!e.sector.value||getSector(l)===e.sector.value)&&(!e.barrio.value||getBarrio(l)===e.barrio.value));e.search.innerHTML='<option value="">Todos los contactos</option>'+rows.map(l=>`<option value="${esc(l.id)}">${esc(l.name||'Contacto')} · ${esc(contactType(l))}</option>`).join('');if([...e.search.options].some(o=>o.value===old))e.search.value=old}
function updateSelection(){const e=els();if(e.selCount)e.selCount.textContent=`${selected.size} seleccionado${selected.size===1?'':'s'} · máximo ${MAX} por lote`}
function renderPicker(){
 const e=els();if(!e.picker)return;const rows=filtered();
 e.picker.innerHTML=rows.length?rows.map(l=>`<label class="wa-pick-row"><input type="checkbox" data-wa-pick="${esc(l.id)}" ${selected.has(String(l.id))?'checked':''}><span><b>${esc(l.name||'Contacto')}</b><small>${esc(contactType(l))} · ${esc(getSector(l)||'Sin sector')} · ${esc(getBarrio(l)||'Sin barrio')} · ${esc(l.whatsapp||l.phone)}</small></span></label>`).join(''):'<div class="wa-empty-picker">No hay contactos autorizados para estos filtros.</div>';
 e.picker.querySelectorAll('[data-wa-pick]').forEach(ch=>ch.onchange=()=>{const id=String(ch.dataset.waPick);if(ch.checked){if(selected.size>=MAX){ch.checked=false;alert(`Cada lote permite máximo ${MAX} contactos. Prepare este lote y luego continúe con el siguiente.`);return}selected.add(id)}else selected.delete(id);updateSelection()});updateSelection()
}
function save(){localStorage.setItem(KEY,JSON.stringify(queue.map(x=>({id:x.id,status:x.status||'pending',sentAt:x.sentAt||''}))))}
function restore(){try{const saved=JSON.parse(localStorage.getItem(KEY)||'[]'),map=new Map(saved.map(x=>[String(x.id),x]));queue=authorized().filter(l=>map.has(String(l.id))).map(l=>({...l,...map.get(String(l.id))}))}catch{queue=[]}}
function stats(){return {total:queue.length,sent:queue.filter(x=>x.status==='sent').length,pending:queue.filter(x=>x.status!=='sent').length}}
function renderQueue(){const e=els();if(!e.list||!e.summary)return;const s=stats();e.summary.innerHTML=queue.length?`<div><span>Lote preparado</span><strong>${s.total}/${MAX}</strong></div><div><span>Procesados</span><strong>${s.sent}</strong></div><div><span>Pendientes</span><strong>${s.pending}</strong></div>`:'<div class="wa-empty"><b>Sin lote preparado.</b><span>Seleccione hasta 20 destinatarios, escriba el mensaje y pulse “Preparar lote”.</span></div>';e.list.innerHTML=queue.map((l,i)=>`<div class="wa-contact-row ${l.status==='sent'?'done':''}"><div class="wa-contact-index">${i+1}</div><div class="wa-contact-main"><b>${esc(l.name||'Contacto')}</b><small>${esc(contactType(l))} · ${esc(getSector(l)||'Sin sector')} · ${esc(getBarrio(l)||'Sin barrio')}</small><small>WhatsApp: ${esc(l.whatsapp||l.phone)}</small></div><div class="wa-contact-status">${l.status==='sent'?'✓ Procesado':'Pendiente'}</div><div class="wa-contact-actions"><button class="primary wa-open" data-id="${esc(l.id)}">🟢 Abrir WhatsApp</button><button class="secondary wa-mark" data-id="${esc(l.id)}">${l.status==='sent'?'Marcar pendiente':'Marcar procesado'}</button></div></div>`).join('');e.list.querySelectorAll('.wa-open').forEach(b=>b.onclick=()=>openWhatsApp(b.dataset.id));e.list.querySelectorAll('.wa-mark').forEach(b=>b.onclick=()=>toggle(b.dataset.id))}
function prepare(){const e=els(),msg=clean(e.message?.value);if(!msg){alert('Escriba primero la información que desea compartir.');return}if(!selected.size){alert('Seleccione por lo menos un destinatario.');return}const ids=selected,rows=authorized().filter(l=>ids.has(String(l.id))).slice(0,MAX);queue=rows.map(l=>({...l,status:'pending',sentAt:''}));save();renderQueue();document.getElementById('waQueueList')?.scrollIntoView({behavior:'smooth',block:'start'})}
function openWhatsApp(id){const e=els(),msg=clean(e.message?.value);if(!msg){alert('El mensaje está vacío.');return}const l=queue.find(x=>String(x.id)===String(id));if(!l)return;if(l.communicationsConsent!=='Sí'){alert('Este contacto no tiene autorización registrada para recibir comunicaciones.');return}const n=normNumber(l);if(!n){alert('Este contacto no tiene un número válido de WhatsApp.');return}window.open(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`,'_blank','noopener');l.status='sent';l.sentAt=new Date().toISOString();const original=leaders().find(x=>String(x.id)===String(id));if(original){original.lastCommunication=new Date().toISOString().slice(0,10);try{saveDB()}catch(_){}}save();renderQueue()}
function toggle(id){const l=queue.find(x=>String(x.id)===String(id));if(!l)return;l.status=l.status==='sent'?'pending':'sent';l.sentAt=l.status==='sent'?new Date().toISOString():'';save();renderQueue()}
function reset(){if(queue.length&&!confirm('¿Reiniciar el lote actual?'))return;queue=[];localStorage.removeItem(KEY);renderQueue()}
function init(){
 const e=els();if(!e.sector)return;updateAudienceCounts();fillFilters();restore();renderPicker();renderQueue();
 document.querySelectorAll('[data-wa-audience]').forEach(b=>b.onclick=()=>{
   audience=b.dataset.waAudience;
   document.querySelectorAll('[data-wa-audience]').forEach(x=>x.classList.toggle('active',x===b));
   selected.clear();
   if(e.sector)e.sector.value='';
   if(e.barrio)e.barrio.value='';
   fillFilters();
   if(e.search)e.search.value='';
   renderPicker();
 });
 e.sector.onchange=()=>{e.barrio.value='';fillFilters();renderPicker()};e.barrio.onchange=()=>{fillContactFilter();renderPicker()};e.search.onchange=renderPicker;
 document.getElementById('waSelectVisible')?.addEventListener('click',()=>{const rows=filtered();let added=0;for(const l of rows){if(selected.size>=MAX)break;if(!selected.has(String(l.id))){selected.add(String(l.id));added++}}renderPicker();if(rows.length>added&&selected.size>=MAX)alert(`Se seleccionaron ${MAX} contactos, que es el máximo por lote. Los demás pueden enviarse en un lote siguiente.`)});
 document.getElementById('waClearSelection')?.addEventListener('click',()=>{selected.clear();renderPicker()});
 document.getElementById('waPrepareQueue')?.addEventListener('click',prepare);document.getElementById('waResetQueue')?.addEventListener('click',reset);
 document.addEventListener('click',ev=>{if(ev.target.closest('[data-view="communications"]'))setTimeout(()=>{updateAudienceCounts();fillFilters();renderPicker();renderQueue()},0)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.addEventListener('matriz:contacts-updated',()=>{updateAudienceCounts();fillFilters();renderPicker()});
})();
