(() => {
'use strict';
const modal=document.getElementById('batchRecipientModal');
if(!modal)return;
const list=document.getElementById('batchRecipientList'), search=document.getElementById('batchRecipientSearch'), count=document.getElementById('batchRecipientCount');
let level='municipal', mode='petition', selected=new Map();
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const data=()=>window.MATRIZ_INSTITUTIONAL_DIRECTORY||{};
const key=(lv,i)=>lv+'::'+i;
function roleFor(e,lv){
  if(e.role)return e.role;
  if(e.contact)return lv==='municipios'?'Alcalde Municipal':'Representante / responsable institucional';
  return 'Representante legal / funcionario competente';
}
function recipient(e,lv,i){return {key:key(lv,i),level:lv,index:i,entity:e.n||'',recipientName:e.contact||e.n||'',recipientRole:roleFor(e,lv),email:e.email||'',phone:e.phone||'',address:e.address||'',url:e.url||''}}
function updateCount(){
  const n=selected.size; count.textContent=`${n} destinatario${n===1?'':'s'} seleccionado${n===1?'':'s'}`;
}
function render(){
  const q=norm(search.value), rows=(data()[level]||[]);
  const filtered=rows.map((e,i)=>({e,i})).filter(x=>!q||norm([x.e.n,x.e.contact,x.e.email,x.e.address].join(' ')).includes(q));
  if(!filtered.length){list.innerHTML='<div class="batch-empty">No hay entidades que coincidan con la búsqueda.</div>';updateCount();return}
  list.innerHTML=filtered.map(({e,i})=>{
    const k=key(level,i),checked=selected.has(k)?'checked':'';
    return `<label class="batch-recipient-row"><input type="checkbox" data-batch-key="${esc(k)}" ${checked}><span><strong>${esc(e.n)}</strong><small>${esc(e.contact||e.role||'Entidad institucional')}${e.email?' · '+esc(e.email):''}</small></span></label>`;
  }).join('');
  list.querySelectorAll('input[data-batch-key]').forEach(ch=>ch.onchange=()=>{
    const [lv,ix]=ch.dataset.batchKey.split('::');const e=(data()[lv]||[])[Number(ix)];
    if(ch.checked)selected.set(ch.dataset.batchKey,recipient(e,lv,Number(ix)));else selected.delete(ch.dataset.batchKey);updateCount();
  });
  updateCount();
}
function open(which){
  mode=which;selected=new Map((window.__batchRecipients?.[mode]||[]).map(x=>[x.key,x]));
  modal.classList.add('open');modal.classList.add('show');search.value='';render();
}
function close(){modal.classList.remove('open');modal.classList.remove('show')}
document.querySelectorAll('[data-batch-open]').forEach(b=>b.addEventListener('click',()=>open(b.dataset.batchOpen)));
document.querySelectorAll('[data-batch-close]').forEach(b=>b.addEventListener('click',close));
document.querySelectorAll('[data-batch-level]').forEach(b=>b.onclick=()=>{level=b.dataset.batchLevel;document.querySelectorAll('[data-batch-level]').forEach(x=>x.classList.toggle('active',x===b));render()});
search.addEventListener('input',render);
document.getElementById('batchClear').onclick=()=>{selected.clear();render()};
document.getElementById('batchSelectVisible').onclick=()=>{
 const q=norm(search.value);(data()[level]||[]).forEach((e,i)=>{if(!q||norm([e.n,e.contact,e.email,e.address].join(' ')).includes(q))selected.set(key(level,i),recipient(e,level,i))});render()
};
document.getElementById('batchApply').onclick=()=>{
 window.__batchRecipients=window.__batchRecipients||{};window.__batchRecipients[mode]=Array.from(selected.values());
 window.dispatchEvent(new CustomEvent('batch-recipients-changed',{detail:{mode,recipients:window.__batchRecipients[mode]}}));close();
};
window.__batchRecipients=window.__batchRecipients||{petition:[],representative:[]};
window.clearBatchRecipients=mode=>{window.__batchRecipients[mode]=[];window.dispatchEvent(new CustomEvent('batch-recipients-changed',{detail:{mode,recipients:[]}}))};
})();
