/* ============================================================
   Derecho de Petición por necesidad · v1.3.4
   Módulo aislado: no modifica el motor base app.js.
   PDF institucional con fotografía de Iván Ortiz, texto justificado,
   datos completos del destinatario, firma manuscrita electrónica,
   trazabilidad y compartir por WhatsApp / Web Share.
   ============================================================ */
(() => {
  'use strict';

  const modal = document.getElementById('petitionModal');
  const form = document.getElementById('petitionForm');
  const signCanvas = document.getElementById('petitionSignature');
  if (!modal || !form || !signCanvas) return;

  let signatureHasInk = false;
  let drawing = false;
  let last = null;
  let lastGenerated = null;

  const clean = v => String(v ?? '').trim();
  const escLocal = v => clean(v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const todayISO = () => new Date().toISOString().slice(0,10);
  const uidLocal = () => (crypto.randomUUID ? crypto.randomUUID() : 'pet-'+Date.now()+'-'+Math.random().toString(16).slice(2));
  const formatDate = iso => {
    if (!iso) return '';
    const d = new Date(iso + 'T12:00:00');
    return new Intl.DateTimeFormat('es-CO',{day:'2-digit',month:'long',year:'numeric'}).format(d);
  };
  const currentLongDate = () => new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'long',year:'numeric'}).format(new Date());

  const DOC_DB_NAME='matriz_giron_documents_v1', DOC_STORE='petitionPdfs';
  function openDocDB(){
    return new Promise((resolve,reject)=>{
      const r=indexedDB.open(DOC_DB_NAME,1);
      r.onupgradeneeded=()=>{
        const d=r.result;
        if(!d.objectStoreNames.contains(DOC_STORE)){
          const st=d.createObjectStore(DOC_STORE,{keyPath:'id'});
          st.createIndex('needId','needId',{unique:false});
          st.createIndex('generatedAt','generatedAt',{unique:false});
          st.createIndex('entity','entity',{unique:false});
          st.createIndex('recipientName','recipientName',{unique:false});
          st.createIndex('radicado','radicado',{unique:false});
        }
      };
      r.onsuccess=()=>resolve(r.result);
      r.onerror=()=>reject(r.error);
    });
  }
  async function savePDFRecord(record){
    const d=await openDocDB();
    return new Promise((resolve,reject)=>{
      const tx=d.transaction(DOC_STORE,'readwrite');
      tx.objectStore(DOC_STORE).put(record);
      tx.oncomplete=()=>{d.close();resolve(record)};
      tx.onerror=()=>{const e=tx.error;d.close();reject(e)};
    });
  }
  async function getPDFRecords(){
    const d=await openDocDB();
    return new Promise((resolve,reject)=>{
      const tx=d.transaction(DOC_STORE,'readonly');
      const r=tx.objectStore(DOC_STORE).getAll();
      r.onsuccess=()=>resolve((r.result||[]).sort((a,b)=>String(b.generatedAt||'').localeCompare(String(a.generatedAt||''))));
      r.onerror=()=>reject(r.error);
      tx.oncomplete=()=>d.close();
    });
  }
  async function getPDFRecord(id){
    const d=await openDocDB();
    return new Promise((resolve,reject)=>{
      const tx=d.transaction(DOC_STORE,'readonly');
      const r=tx.objectStore(DOC_STORE).get(id);
      r.onsuccess=()=>resolve(r.result||null);
      r.onerror=()=>reject(r.error);
      tx.oncomplete=()=>d.close();
    });
  }
  async function deletePDFRecord(id){
    const d=await openDocDB();
    return new Promise((resolve,reject)=>{
      const tx=d.transaction(DOC_STORE,'readwrite');
      tx.objectStore(DOC_STORE).delete(id);
      tx.oncomplete=()=>{d.close();resolve()};
      tx.onerror=()=>{const e=tx.error;d.close();reject(e)};
    });
  }
  async function countPDFRecords(){
    const d=await openDocDB();
    return new Promise((resolve,reject)=>{
      const tx=d.transaction(DOC_STORE,'readonly');
      const r=tx.objectStore(DOC_STORE).count();
      r.onsuccess=()=>resolve(r.result||0);
      r.onerror=()=>reject(r.error);
      tx.oncomplete=()=>d.close();
    });
  }

  const PHOTO_DB_NAME='matriz_giron_photos_v2', PHOTO_STORE='photos';
  function openPhotoDB(){
    return new Promise((resolve,reject)=>{
      const r=indexedDB.open(PHOTO_DB_NAME,1);
      r.onupgradeneeded=()=>{
        const d=r.result;
        if(!d.objectStoreNames.contains(PHOTO_STORE)){
          const st=d.createObjectStore(PHOTO_STORE,{keyPath:'id'});
          st.createIndex('needId','needId',{unique:false});
        }
      };
      r.onsuccess=()=>resolve(r.result);
      r.onerror=()=>reject(r.error);
    });
  }
  async function getNeedPhotos(needId){
    if(!needId)return[];
    const d=await openPhotoDB();
    return new Promise((resolve,reject)=>{
      const tx=d.transaction(PHOTO_STORE,'readonly');
      const idx=tx.objectStore(PHOTO_STORE).index('needId');
      const r=idx.getAll(needId);
      r.onsuccess=()=>resolve(r.result||[]);
      r.onerror=()=>reject(r.error);
      tx.oncomplete=()=>d.close();
    });
  }
  function loadBlobImage(blob){
    return new Promise((resolve,reject)=>{
      const url=URL.createObjectURL(blob),im=new Image();
      im.onload=()=>{URL.revokeObjectURL(url);resolve(im)};
      im.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('No se pudo cargar una fotografía de evidencia'))};
      im.src=url;
    });
  }

  function getNeed(id){ return db.needs.find(n => n.id === id); }
  function getLeader(need){ return need?.leaderId ? db.leaders.find(l => l.id === need.leaderId) : null; }

  function defaultFacts(n){
    const parts = [];
    parts.push(`1. En el territorio ${clean(n.territory) || 'indicado en esta solicitud'} se ha identificado la siguiente necesidad de interés comunitario: ${clean(n.title) || 'necesidad registrada en la Matriz Territorial'}.`);
    if (n.location) parts.push(`2. La situación se localiza específicamente en: ${clean(n.location)}.`);
    if (n.description) parts.push(`3. La situación reportada se describe así: ${clean(n.description)}`);
    if (n.affected) parts.push(`4. De acuerdo con la información disponible, la situación afecta o puede beneficiar con su atención a: ${clean(n.affected)}.`);
    if (n.age) parts.push(`5. La antigüedad aproximada del problema reportado es: ${clean(n.age)}.`);
    if (n.evidence) parts.push(`6. Como antecedentes o evidencias se cuenta con: ${clean(n.evidence)}.`);
    return parts.join('\n\n');
  }

  function defaultRequests(){
    return [
      '1. Informar si esa entidad es competente para conocer y atender la situación descrita. En caso de no serlo, solicito dar traslado a la autoridad competente e informarme de dicha remisión.',
      '2. Informar qué actuaciones técnicas, administrativas o presupuestales se han adelantado o se encuentran previstas respecto de la necesidad descrita.',
      '3. Informar si existe proyecto, estudio, diseño, contrato, programa, presupuesto o radicado relacionado con esta situación y, de existir, indicar su estado actual y los requisitos pendientes para avanzar.',
      '4. Indicar la ruta institucional que corresponde seguir para la evaluación y eventual atención de esta necesidad.',
      '5. Remitir la respuesta de fondo y los documentos públicos que la soporten al correo electrónico señalado para notificaciones.'
    ].join('\n\n');
  }

  function openPetition(needId){
    const n = getNeed(needId); if (!n) return;
    const l = getLeader(n);
    form.reset();
    lastGenerated = null;
    form.elements.needId.value = n.id;
    form.elements.recipientName.value = '';
    form.elements.recipientRole.value = '';
    form.elements.entity.value = clean(n.competentEntity);
    form.elements.recipientEmail.value = '';
    form.elements.recipientPhone.value = '';
    form.elements.petitionerName.value = clean(l?.name);
    form.elements.petitionerId.value = '';
    form.elements.address.value = '';
    form.elements.phone.value = clean(l?.phone);
    form.elements.email.value = clean(l?.email);
    form.elements.subject.value = `Derecho de petición - ${clean(n.title) || n.code}`;
    form.elements.facts.value = defaultFacts(n);
    form.elements.requests.value = defaultRequests(n);
    form.elements.attachments.value = clean(n.evidence);
    form.elements.radicado.value = '';
    form.elements.radicadoDate.value = '';
    document.getElementById('petitionNeedSummary').textContent = `${n.code} · ${n.territory || 'Sin territorio'} · ${n.title || 'Necesidad'}`;
    clearSignature();
    modal.classList.add('open');
    setTimeout(resizeSignatureCanvas, 80);
  }

  function closePetition(){ modal.classList.remove('open'); }
  window.openPetitionForNeed = openPetition;

  const centerModal = document.getElementById('petitionCenterModal');
  const centerList = document.getElementById('petitionCenterList');
  function renderPetitionCenter(){
    if(!centerList) return;
    const needs = Array.isArray(db.needs) ? db.needs : [];
    if(!needs.length){
      centerList.innerHTML = '<div class="petition-center-empty"><strong>Aún no hay necesidades registradas.</strong><br>Primero registre una necesidad. Después podrá generar y firmar su Derecho de Petición desde este mismo módulo.</div>';
      return;
    }
    centerList.innerHTML = needs.map(n=>{
      const count=Array.isArray(n.petitions)?n.petitions.length:0;
      return `<div class="petition-center-item"><div><strong>${escLocal(n.code)} · ${escLocal(n.title||'Necesidad')}${count?`<span class="petition-center-badge">${count} generado${count===1?'':'s'}</span>`:''}</strong><small>${escLocal(n.territory||'Sin territorio')} · ${escLocal(n.sector||'Sin sector')} · ${escLocal(n.status||'Sin estado')}</small></div><button type="button" data-petition-need="${escLocal(n.id)}">📄 Generar PDF firmado</button></div>`;
    }).join('');
    centerList.querySelectorAll('[data-petition-need]').forEach(b=>b.addEventListener('click',()=>{ centerModal?.classList.remove('open'); openPetition(b.dataset.petitionNeed); }));
  }
  function openPetitionCenter(){ renderPetitionCenter(); refreshArchiveCount(); centerModal?.classList.add('open'); }
  window.openPetitionCenter = openPetitionCenter;
  document.getElementById('petitionCenterNav')?.addEventListener('click',openPetitionCenter);
  document.getElementById('petitionCenterQuick')?.addEventListener('click',openPetitionCenter);
  document.querySelectorAll('[data-petition-center-close]').forEach(b=>b.addEventListener('click',()=>centerModal?.classList.remove('open')));
  centerModal?.addEventListener('click',e=>{if(e.target===centerModal)centerModal.classList.remove('open')});

  const archiveModal=document.getElementById('petitionArchiveModal');
  const archiveList=document.getElementById('petitionArchiveList');
  const archiveSearch=document.getElementById('petitionArchiveSearch');
  const archiveSummary=document.getElementById('petitionArchiveSummary');
  const archiveCount=document.getElementById('petitionArchiveCount');
  let archiveCache=[];
  const formatGeneratedAt=v=>{try{return new Intl.DateTimeFormat('es-CO',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v))}catch(_){return clean(v)}};
  async function refreshArchiveCount(){
    try{const n=await countPDFRecords();if(archiveCount)archiveCount.textContent=n;}catch(_){ }
  }
  function archiveMatches(r,q){
    if(!q)return true;
    const hay=[r.needCode,r.needTitle,r.territory,r.entity,r.recipientName,r.recipientEmail,r.recipientPhone,r.petitionerName,r.subject,r.radicado,r.filename].map(clean).join(' ').toLowerCase();
    return hay.includes(q.toLowerCase());
  }
  function renderArchiveList(){
    if(!archiveList)return;
    const q=clean(archiveSearch?.value);
    const rows=archiveCache.filter(r=>archiveMatches(r,q));
    if(archiveSummary)archiveSummary.textContent=`${rows.length} documento${rows.length===1?'':'s'}`;
    if(!rows.length){archiveList.innerHTML='<div class="petition-center-empty"><strong>No hay PDFs guardados que coincidan.</strong><br>Cuando genere un Derecho de Petición, el PDF quedará archivado automáticamente aquí.</div>';return;}
    archiveList.innerHTML=rows.map(r=>`<article class="petition-archive-item"><div class="petition-archive-main"><div class="petition-archive-icon">PDF</div><div><strong>${escLocal(r.needCode||'SIN-CÓDIGO')} · ${escLocal(r.needTitle||'Derecho de Petición')}</strong><small><b>Generado:</b> ${escLocal(formatGeneratedAt(r.generatedAt))}</small><small><b>Destinatario:</b> ${escLocal(r.recipientName||'Sin nombre')} · ${escLocal(r.entity||'Sin entidad')}</small><small><b>Peticionario:</b> ${escLocal(r.petitionerName||'')}</small>${r.radicado?`<small><b>Radicado:</b> ${escLocal(r.radicado)}${r.radicadoDate?' · '+escLocal(formatDate(r.radicadoDate)):''}</small>`:''}<small class="petition-archive-file">${escLocal(r.filename||'documento.pdf')}</small></div></div><div class="petition-archive-buttons"><button type="button" data-doc-view="${escLocal(r.id)}">👁️ Ver</button><button type="button" data-doc-download="${escLocal(r.id)}">⬇️ Descargar</button><button type="button" class="petition-whatsapp" data-doc-share="${escLocal(r.id)}">🟢 WhatsApp</button><button type="button" class="danger" data-doc-delete="${escLocal(r.id)}">🗑️ Eliminar</button></div></article>`).join('');
    archiveList.querySelectorAll('[data-doc-view]').forEach(b=>b.addEventListener('click',()=>viewArchivedPDF(b.dataset.docView)));
    archiveList.querySelectorAll('[data-doc-download]').forEach(b=>b.addEventListener('click',()=>downloadArchivedPDF(b.dataset.docDownload)));
    archiveList.querySelectorAll('[data-doc-share]').forEach(b=>b.addEventListener('click',()=>shareArchivedPDF(b.dataset.docShare)));
    archiveList.querySelectorAll('[data-doc-delete]').forEach(b=>b.addEventListener('click',()=>removeArchivedPDF(b.dataset.docDelete)));
  }
  async function openPetitionArchive(){
    try{archiveCache=await getPDFRecords();renderArchiveList();archiveModal?.classList.add('open');refreshArchiveCount();}
    catch(err){console.error(err);alert('No fue posible abrir el archivo de PDFs: '+err.message);}
  }
  async function viewArchivedPDF(id){
    const r=archiveCache.find(x=>x.id===id)||await getPDFRecord(id);if(!r?.blob)return;
    const url=URL.createObjectURL(r.blob);window.open(url,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
  async function downloadArchivedPDF(id){
    const r=archiveCache.find(x=>x.id===id)||await getPDFRecord(id);if(!r?.blob)return;downloadPDF(r.blob,r.filename||'Derecho-de-Peticion.pdf');
  }
  async function shareArchivedPDF(id){
    const r=archiveCache.find(x=>x.id===id)||await getPDFRecord(id);if(!r?.blob)return;
    const file=new File([r.blob],r.filename||'Derecho-de-Peticion.pdf',{type:'application/pdf'});
    const text=`Derecho de Petición: ${clean(r.subject||r.needTitle)}. Documento firmado en PDF.`;
    try{
      if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({title:'Derecho de Petición',text,files:[file]});return;}
      downloadPDF(r.blob,r.filename||file.name);
      const digits=clean(r.recipientPhone).replace(/\D/g,'');
      const url=digits?`https://wa.me/${digits}?text=${encodeURIComponent(text+' El PDF se descargó en el dispositivo; adjúntelo a este chat.')}`:`https://wa.me/?text=${encodeURIComponent(text+' El PDF se descargó en el dispositivo; adjúntelo al chat de WhatsApp.')}`;
      window.open(url,'_blank','noopener');
    }catch(err){if(err?.name!=='AbortError')alert('No fue posible compartir el PDF: '+err.message);}
  }
  async function removeArchivedPDF(id){
    const r=archiveCache.find(x=>x.id===id);if(!confirm(`¿Eliminar del archivo el PDF ${r?.filename||''}?\n\nEsta acción no elimina la necesidad ni su trazabilidad.`))return;
    await deletePDFRecord(id);archiveCache=archiveCache.filter(x=>x.id!==id);renderArchiveList();refreshArchiveCount();
  }
  window.openPetitionArchive=openPetitionArchive;
  document.getElementById('openPetitionArchive')?.addEventListener('click',()=>{centerModal?.classList.remove('open');openPetitionArchive();});
  document.querySelectorAll('[data-petition-archive-close]').forEach(b=>b.addEventListener('click',()=>archiveModal?.classList.remove('open')));
  archiveModal?.addEventListener('click',e=>{if(e.target===archiveModal)archiveModal.classList.remove('open')});
  archiveSearch?.addEventListener('input',renderArchiveList);
  refreshArchiveCount();


  const needPetitionBtn=document.getElementById('needPetitionBtn');
  needPetitionBtn?.addEventListener('click',()=>{
    const id=document.getElementById('needForm')?.elements?.id?.value;
    if(!id){ alert('Primero guarde la necesidad. Luego ábrala con el botón ✏️ Editar y presione “Generar Derecho de Petición”.'); return; }
    document.getElementById('needModal')?.classList.remove('open');
    openPetition(id);
  });
  document.querySelectorAll('[data-petition-close]').forEach(b => b.addEventListener('click', closePetition));
  modal.addEventListener('click', e => { if(e.target === modal) closePetition(); });
  document.querySelector('.petition-clear-sign')?.addEventListener('click', clearSignature);
  form.addEventListener('input',()=>{ lastGenerated=null; });

  function resizeSignatureCanvas(){
    const rect = signCanvas.getBoundingClientRect();
    if (!rect.width) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(320, Math.round(rect.width * ratio));
    const h = Math.max(150, Math.round(190 * ratio));
    if (signCanvas.width !== w || signCanvas.height !== h) {
      signCanvas.width = w; signCanvas.height = h;
      const ctx = signCanvas.getContext('2d');
      ctx.fillStyle='#fff'; ctx.fillRect(0,0,w,h);
      ctx.strokeStyle='#0b2344'; ctx.lineWidth=3*ratio; ctx.lineCap='round'; ctx.lineJoin='round';
      signatureHasInk = false;
    }
  }
  window.addEventListener('resize', () => { if(modal.classList.contains('open')) resizeSignatureCanvas(); });

  function clearSignature(){
    const ctx=signCanvas.getContext('2d');
    ctx.fillStyle='#fff'; ctx.fillRect(0,0,signCanvas.width,signCanvas.height);
    ctx.strokeStyle='#0b2344'; ctx.lineWidth=3*Math.min(window.devicePixelRatio||1,2); ctx.lineCap='round'; ctx.lineJoin='round';
    signatureHasInk=false; drawing=false; last=null; lastGenerated=null;
  }
  function pointerPos(e){ const r=signCanvas.getBoundingClientRect(); return {x:(e.clientX-r.left)*(signCanvas.width/r.width), y:(e.clientY-r.top)*(signCanvas.height/r.height)}; }
  signCanvas.addEventListener('pointerdown',e=>{ e.preventDefault(); drawing=true; last=pointerPos(e); signCanvas.setPointerCapture?.(e.pointerId); });
  signCanvas.addEventListener('pointermove',e=>{ if(!drawing)return; e.preventDefault(); const p=pointerPos(e),ctx=signCanvas.getContext('2d'); ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;signatureHasInk=true;lastGenerated=null; });
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>signCanvas.addEventListener(ev,e=>{ if(drawing){e.preventDefault();drawing=false;last=null;} }));

  /* Inyecta el botón PDF sin alterar renderNeeds() ni app.js */
  function injectButtons(){
    const table=document.querySelector('#needsTable table'); if(!table)return;
    table.querySelectorAll('tbody tr').forEach(tr=>{
      const cells=tr.querySelectorAll('td'); if(cells.length<2 || tr.dataset.petitionReady)return;
      const code=clean(cells[0]?.textContent); const n=db.needs.find(x=>x.code===code); if(!n)return;
      const actionCell=cells[cells.length-1];
      const btn=document.createElement('button'); btn.type='button'; btn.className='icon-btn petition-btn'; btn.title='Generar Derecho de Petición';
      const count=Array.isArray(n.petitions)?n.petitions.length:0;
      btn.innerHTML=`📄${count?`<span class="petition-count">${count}</span>`:''}`;
      btn.addEventListener('click',ev=>{ev.stopPropagation();openPetition(n.id);});
      actionCell.insertBefore(btn,actionCell.firstChild);
      tr.dataset.petitionReady='1';
    });
  }
  const needsWrap=document.getElementById('needsTable');
  if(needsWrap){ new MutationObserver(()=>requestAnimationFrame(injectButtons)).observe(needsWrap,{childList:true,subtree:true}); setTimeout(injectButtons,100); }

  function collectData(){
    if(!form.reportValidity()) return null;
    if(!signatureHasInk){ alert('Por favor firme en el recuadro antes de generar o compartir el PDF.'); return null; }
    const fd=Object.fromEntries(new FormData(form).entries());
    const n=getNeed(fd.needId); if(!n) return null;
    if(!clean(fd.entity)){ alert('Indique la entidad donde trabaja la persona destinataria.'); return null; }
    if(!clean(fd.recipientName)){ alert('Indique el nombre de la persona destinataria.'); return null; }
    return {fd,n,signature:signCanvas.toDataURL('image/png')};
  }

  function tracePetition(data){
    const {fd,n}=data;
    n.petitions = Array.isArray(n.petitions) ? n.petitions : [];
    const fingerprint = [clean(fd.entity),clean(fd.recipientName),clean(fd.petitionerName),clean(fd.subject),clean(fd.radicado),clean(fd.radicadoDate)].join('|');
    const recent=n.petitions[n.petitions.length-1];
    if(recent?.fingerprint===fingerprint && (Date.now()-new Date(recent.generatedAt).getTime())<120000) return;
    n.petitions.push({
      id:uidLocal(),generatedAt:data.generatedAt,entity:clean(fd.entity),recipientName:clean(fd.recipientName),recipientRole:clean(fd.recipientRole),recipientEmail:clean(fd.recipientEmail),recipientPhone:clean(fd.recipientPhone),
      petitionerName:clean(fd.petitionerName),petitionerId:clean(fd.petitionerId),subject:clean(fd.subject),radicado:clean(fd.radicado),radicadoDate:clean(fd.radicadoDate),status:fd.radicado?'Radicado':'Generado',fingerprint
    });
    saveDB();
    try{ toast('Derecho de Petición generado y guardado en la trazabilidad'); }catch(_){ }
  }

  async function archiveGeneratedPDF({blob,filename,data}){
    const fd=data, n=data.need;
    const record={
      id:uidLocal(),type:'derecho_peticion',needId:n.id,needCode:clean(n.code),needTitle:clean(n.title),territory:clean(n.territory),sector:clean(n.sector),
      generatedAt:data.generatedAt,filename,blob,
      entity:clean(fd.entity),recipientName:clean(fd.recipientName),recipientRole:clean(fd.recipientRole),recipientEmail:clean(fd.recipientEmail),recipientPhone:clean(fd.recipientPhone),
      petitionerName:clean(fd.petitionerName),petitionerId:clean(fd.petitionerId),subject:clean(fd.subject),radicado:clean(fd.radicado),radicadoDate:clean(fd.radicadoDate),
      size:blob.size||0
    };
    await savePDFRecord(record);
    await refreshArchiveCount();
    return record.id;
  }

  async function getOrBuildPDF(){
    const collected=collectData(); if(!collected) return null;
    const snapshot=JSON.stringify(collected.fd)+'|'+signatureHasInk;
    if(lastGenerated?.snapshot===snapshot) return lastGenerated;
    const data={...collected.fd,need:collected.n,signature:collected.signature,generatedAt:new Date().toISOString()};
    const blob=await buildPetitionPDF(data);
    const safe=(collected.n.code||'NECESIDAD').replace(/[^A-Za-z0-9_-]+/g,'-');
    const filename=`DERECHO-PETICION-${safe}-${todayISO()}.pdf`;
    const archiveId=await archiveGeneratedPDF({blob,filename,data});
    lastGenerated={snapshot,blob,filename,data,archiveId};
    tracePetition({fd:collected.fd,n:collected.n,generatedAt:data.generatedAt});
    try{ toast('PDF generado y guardado en el Archivo de Derechos de Petición'); }catch(_){ }
    return lastGenerated;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const submit=form.querySelector('button[type="submit"]'); const old=submit.textContent; submit.disabled=true; submit.textContent='Generando PDF...';
    try{
      const result=await getOrBuildPDF(); if(!result)return;
      downloadPDF(result.blob,result.filename);
      try{ toast('PDF generado correctamente'); }catch(_){ }
    }catch(err){ console.error(err); alert('No fue posible generar el PDF: '+err.message); }
    finally{submit.disabled=false;submit.textContent=old;}
  });

  document.getElementById('sharePetitionWhatsApp')?.addEventListener('click',async e=>{
    const btn=e.currentTarget,old=btn.textContent; btn.disabled=true; btn.textContent='Preparando PDF...';
    try{
      const result=await getOrBuildPDF(); if(!result)return;
      const file=new File([result.blob],result.filename,{type:'application/pdf'});
      const text=`Derecho de Petición: ${clean(result.data.subject)}. Documento firmado en PDF.`;
      if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){
        await navigator.share({title:'Derecho de Petición',text,files:[file]});
        try{ toast('PDF compartido'); }catch(_){ }
        return;
      }
      downloadPDF(result.blob,result.filename);
      const digits=clean(result.data.recipientPhone).replace(/\D/g,'');
      const url=digits?`https://wa.me/${digits}?text=${encodeURIComponent(text+' El PDF se descargó en el dispositivo; adjúntelo a este chat.')}`:`https://wa.me/?text=${encodeURIComponent(text+' El PDF se descargó en el dispositivo; adjúntelo al chat de WhatsApp.')}`;
      window.open(url,'_blank','noopener');
      alert('Su navegador no permite compartir archivos PDF directamente. El PDF fue descargado y se abrió WhatsApp; adjúntelo manualmente al mensaje.');
    }catch(err){
      if(err?.name!=='AbortError'){ console.error(err); alert('No fue posible compartir el PDF: '+err.message); }
    }finally{btn.disabled=false;btn.textContent=old;}
  });

  function downloadPDF(blob,name){
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);
  }

  async function buildPetitionPDF(d){
    const W=1240,H=1754,M=118,BOTTOM=116;
    const pages=[]; let c,ctx,y;
    const ivanPhoto=await loadImage('assets/ivan-ortiz-foto.png').catch(()=>null);
    const evidencePhotos=await getNeedPhotos(d.need?.id).catch(()=>[]);
    const phaseOrder={before:0,followup:1,after:2};
    evidencePhotos.sort((a,b)=>(phaseOrder[a.phase]??9)-(phaseOrder[b.phase]??9)||String(a.date||'').localeCompare(String(b.date||''))||String(a.created||'').localeCompare(String(b.created||'')));

    function drawHeader(){
      ctx.fillStyle='#062d55';ctx.fillRect(0,0,W,172);
      ctx.fillStyle='#0b5cad';ctx.fillRect(0,172,W,5);
      ctx.fillStyle='#f2c21a';ctx.fillRect(W*.42,172,W*.16,5);
      ctx.fillStyle='#d71920';ctx.fillRect(W*.58,172,W*.12,5);
      if(ivanPhoto){
        const cx=M+52,cy=80,r=48;ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();
        const sw=ivanPhoto.width,sh=ivanPhoto.height,s=Math.min(sw,sh);ctx.drawImage(ivanPhoto,(sw-s)/2,(sh-s)/2,s,s,cx-r,cy-r,r*2,r*2);ctx.restore();
        ctx.strokeStyle='#f2c21a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(cx,cy,r+3,0,Math.PI*2);ctx.stroke();
      }
      ctx.textAlign='left';ctx.fillStyle='#fff';ctx.font='700 30px Arial, sans-serif';ctx.fillText('IVÁN ORTIZ',M+120,68);
      ctx.font='400 18px Arial, sans-serif';ctx.fillStyle='#d8e7f6';ctx.fillText('Gestión Territorial para Girón',M+120,98);
      ctx.font='700 14px Arial, sans-serif';ctx.fillStyle='#f2c21a';ctx.fillText('MATRIZ MAESTRA DE GESTIÓN TERRITORIAL',M+120,123);
      ctx.textAlign='right';ctx.font='400 15px Arial, sans-serif';ctx.fillStyle='#d8e7f6';ctx.fillText('Documento generado desde la Matriz Territorial',W-M,92);
      ctx.textAlign='left';
    }
    function newPage(){
      c=document.createElement('canvas');c.width=W;c.height=H;ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);pages.push(c);drawHeader();y=225;
    }
    function font(size=23,bold=false,italic=false,color='#192431'){ctx.font=`${italic?'italic ':''}${bold?'700 ':'400 '}${size}px Arial, sans-serif`;ctx.fillStyle=color;}
    function ensure(h){if(y+h>H-BOTTOM)newPage();}
    function rule(){ensure(28);ctx.strokeStyle='#c6d6e6';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(M,y);ctx.lineTo(W-M,y);ctx.stroke();y+=24;}
    function wrapWords(text,maxW,size,bold=false,italic=false){
      font(size,bold,italic);const words=clean(text).split(/\s+/).filter(Boolean),lines=[];let line='';
      if(!words.length)return [''];
      words.forEach(w=>{const test=line?line+' '+w:w;if(line&&ctx.measureText(test).width>maxW){lines.push(line);line=w;}else line=test;});if(line)lines.push(line);return lines;
    }
    function drawJustifiedLine(line,x,yy,maxW,size,bold=false,italic=false,isLast=false){
      font(size,bold,italic);const words=line.split(/\s+/).filter(Boolean);
      if(isLast||words.length<3){ctx.fillText(line,x,yy);return;}
      const wordsWidth=words.reduce((sum,w)=>sum+ctx.measureText(w).width,0);const space=(maxW-wordsWidth)/(words.length-1);
      let xx=x;words.forEach((w,i)=>{ctx.fillText(w,xx,yy);xx+=ctx.measureText(w).width+(i<words.length-1?space:0);});
    }
    function paragraph(text,{size=22,bold=false,italic=false,gap=18,indent=0,justify=true,color='#192431'}={}){
      const paras=String(text||'').split(/\n+/);const maxW=W-2*M-indent;const lh=Math.round(size*1.60);
      paras.forEach((par,pi)=>{
        const lines=wrapWords(par,maxW,size,bold,italic);
        lines.forEach((L,li)=>{ensure(lh+4);font(size,bold,italic,color);drawJustifiedLine(L,M+indent,y,maxW,size,bold,italic,!justify||li===lines.length-1);y+=lh;});
        if(pi<paras.length-1)y+=Math.round(lh*.30);
      });y+=gap;
    }
    function centerText(text,size,bold=false,color='#073763',gap=12){
      ensure(size*2.4);font(size,bold,false,color);ctx.textAlign='center';ctx.fillText(text,W/2,y);ctx.textAlign='left';y+=Math.round(size*1.45)+gap;
    }
    function sectionTitle(t){ensure(56);font(24,true,false,'#073763');ctx.fillText(t,M,y);y+=37;ctx.strokeStyle='#d8e4ef';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(M,y);ctx.lineTo(W-M,y);ctx.stroke();y+=18;}
    function labelValue(label,value){
      if(!clean(value))return;ensure(42);font(20,true,false,'#073763');ctx.fillText(label,M,y);const labelW=ctx.measureText(label).width+12;font(20,false,false,'#192431');ctx.fillText(clean(value),M+labelW,y);y+=33;
    }
    function recipientBlock(){
      ensure(210);font(20,true,false,'#073763');ctx.fillText('DESTINATARIO',M,y);y+=34;
      ctx.fillStyle='#f5f9fd';ctx.strokeStyle='#d7e3ef';ctx.lineWidth=1.5;const boxY=y-14;const startY=y;const lines=[];
      if(clean(d.recipientName))lines.push(['Señor(a):',clean(d.recipientName)]);
      if(clean(d.recipientRole))lines.push(['Cargo / dependencia:',clean(d.recipientRole)]);
      lines.push(['Entidad:',clean(d.entity)]);
      if(clean(d.recipientEmail))lines.push(['Correo:',clean(d.recipientEmail)]);
      if(clean(d.recipientPhone))lines.push(['Celular / WhatsApp:',clean(d.recipientPhone)]);
      const boxH=lines.length*31+26;ctx.fillRect(M,boxY,W-2*M,boxH);ctx.strokeRect(M,boxY,W-2*M,boxH);
      lines.forEach(([lab,val])=>{font(18,true,false,'#073763');ctx.fillText(lab,M+18,y);const lw=ctx.measureText(lab).width+10;font(18,false,false,'#192431');ctx.fillText(val,M+18+lw,y);y+=31;});
      y=startY+boxH+18;
    }

    function phaseLabel(phase){return phase==='before'?'ANTES · Evidencia inicial':phase==='followup'?'SEGUIMIENTO · Evolución':'DESPUÉS · Resultado final';}
    function phaseColor(phase){return phase==='before'?'#0b5cad':phase==='followup'?'#f0a000':'#159447';}
    async function drawPhotoEvidence(photos){
      if(!photos.length)return;
      let currentPhase='';
      let number=0;
      for(const ph of photos){
        if(!ph?.blob)continue;
        if(ph.phase!==currentPhase){
          currentPhase=ph.phase;
          ensure(60);
          font(19,true,false,phaseColor(ph.phase));
          ctx.fillText(phaseLabel(ph.phase),M,y);y+=34;
        }
        const image=await loadBlobImage(ph.blob).catch(()=>null); if(!image)continue;
        number++;
        const maxW=W-2*M-36,maxH=500;
        const scale=Math.min(maxW/image.naturalWidth,maxH/image.naturalHeight,1.25);
        const iw=Math.round(image.naturalWidth*scale),ih=Math.round(image.naturalHeight*scale);
        const note=clean(ph.note);
        const noteLines=note?wrapWords(note,maxW-20,17,false,false):[];
        const captionH=54+(noteLines.length?noteLines.length*25:0);
        const cardH=ih+captionH+34;
        ensure(cardH+22);
        const bx=M,by=y-8,bw=W-2*M,bh=cardH;
        ctx.fillStyle='#f8fbfe';ctx.strokeStyle='#d6e2ee';ctx.lineWidth=1.5;ctx.fillRect(bx,by,bw,bh);ctx.strokeRect(bx,by,bw,bh);
        const ix=M+(bw-iw)/2,iy=y+10;
        ctx.fillStyle='#fff';ctx.fillRect(ix,iy,iw,ih);ctx.drawImage(image,ix,iy,iw,ih);
        y=iy+ih+30;
        font(18,true,false,'#073763');ctx.fillText(`Evidencia fotográfica ${number}`,M+18,y);
        const dateText=clean(ph.date)?`Fecha: ${formatDate(ph.date)}`:'';
        if(dateText){font(16,false,false,'#66788b');ctx.textAlign='right';ctx.fillText(dateText,W-M-18,y);ctx.textAlign='left';}
        y+=30;
        if(noteLines.length){
          noteLines.forEach(line=>{font(17,false,false,'#34495e');ctx.fillText(line,M+18,y);y+=25;});
        }else{
          font(16,false,true,'#7a8897');ctx.fillText('Sin descripción adicional.',M+18,y);y+=25;
        }
        y=by+bh+22;
      }
    }

    newPage();
    centerText('DERECHO DE PETICIÓN',34,true,'#073763',2);
    centerText('Artículo 23 de la Constitución Política · Ley 1755 de 2015',17,false,'#66788b',20);
    rule();
    paragraph(`Girón, Santander, ${currentLongDate()}`,{size:20,justify:false,gap:18});
    recipientBlock();
    labelValue('Asunto:',d.subject);
    y+=5;
    paragraph(`Yo, ${clean(d.petitionerName)}, identificado(a) con ${clean(d.petitionerId)}, actuando en nombre propio y en ejercicio del derecho fundamental de petición consagrado en el artículo 23 de la Constitución Política y desarrollado por la Ley 1755 de 2015, presento respetuosamente la siguiente solicitud:`,{size:21,gap:22,justify:true});
    sectionTitle('I. HECHOS'); paragraph(d.facts,{size:21,gap:24,justify:true});
    sectionTitle('II. PETICIONES'); paragraph(d.requests,{size:21,gap:24,justify:true});
    sectionTitle('III. FUNDAMENTO');
    paragraph('La presente petición se formula con fundamento en el artículo 23 de la Constitución Política y en las disposiciones aplicables de la Ley 1755 de 2015. Solicito que la respuesta sea clara, de fondo, congruente con lo solicitado y comunicada dentro de los términos legales correspondientes.',{size:21,gap:24,justify:true});
    if(clean(d.attachments)||evidencePhotos.length){
      sectionTitle('IV. ANEXOS / EVIDENCIAS');
      if(clean(d.attachments))paragraph(d.attachments,{size:21,gap:18,justify:true});
      if(evidencePhotos.length){
        paragraph(`Se incorporan ${evidencePhotos.length} fotografía(s) registradas en la necesidad como evidencia visual.`,{size:18,italic:true,color:'#66788b',gap:18,justify:false});
        await drawPhotoEvidence(evidencePhotos);
      }
    }
    sectionTitle('V. NOTIFICACIONES');
    labelValue('Dirección:',d.address);labelValue('Teléfono:',d.phone);labelValue('Correo electrónico:',d.email);y+=12;
    if(clean(d.radicado)||clean(d.radicadoDate)){sectionTitle('VI. DATOS DE RADICACIÓN');labelValue('Radicado:',d.radicado);labelValue('Fecha de radicación:',formatDate(d.radicadoDate));y+=10;}
    ensure(315);paragraph('Cordialmente,',{size:21,justify:false,gap:8});
    const sig=await loadImage(d.signature);const sigW=320,sigH=105;ctx.drawImage(sig,M,y,sigW,sigH);y+=sigH+4;
    paragraph(clean(d.petitionerName),{size:21,bold:true,justify:false,gap:0});
    paragraph(`C.C. ${clean(d.petitionerId)}`,{size:19,justify:false,gap:2});
    paragraph('Firma manuscrita electrónica capturada en pantalla',{size:15,italic:true,color:'#66788b',justify:false,gap:12});
    rule();
    paragraph(`Referencia interna: ${clean(d.need.code)} · ${clean(d.need.territory)} · ${clean(d.need.title)}`,{size:14,italic:true,color:'#66788b',justify:false,gap:0});

    /* Pie de página posterior para conocer el total de páginas. */
    pages.forEach((page,i)=>{
      const pctx=page.getContext('2d');pctx.strokeStyle='#d8e4ef';pctx.lineWidth=1;pctx.beginPath();pctx.moveTo(M,H-72);pctx.lineTo(W-M,H-72);pctx.stroke();
      pctx.font='400 13px Arial, sans-serif';pctx.fillStyle='#718095';pctx.textAlign='left';pctx.fillText('Matriz Maestra de Gestión Territorial para Girón',M,H-43);
      pctx.textAlign='right';pctx.fillText(`Página ${i+1} de ${pages.length}`,W-M,H-43);pctx.textAlign='left';
    });

    const jpegs=pages.map(p=>dataUrlBytes(p.toDataURL('image/jpeg',0.93)));
    return pdfFromJpegs(jpegs,W,H);
  }

  function loadImage(src){ return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src;}); }
  function dataUrlBytes(url){ const b=atob(url.split(',')[1]);const a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a; }
  function concat(parts){let len=0;parts.forEach(p=>len+=p.length);const out=new Uint8Array(len);let o=0;parts.forEach(p=>{out.set(p,o);o+=p.length});return out;}
  function ascii(s){return new TextEncoder().encode(s);}

  function pdfFromJpegs(images,pixelW,pixelH){
    const pw=595.28,ph=841.89,n=images.length,totalObjs=2+n*3,bodies=new Array(totalObjs+1);
    bodies[1]=ascii('<< /Type /Catalog /Pages 2 0 R >>');const pageRefs=[];for(let i=0;i<n;i++)pageRefs.push(`${3+i*3} 0 R`);
    bodies[2]=ascii(`<< /Type /Pages /Kids [${pageRefs.join(' ')}] /Count ${n} >>`);
    for(let i=0;i<n;i++){
      const pageObj=3+i*3,imgObj=pageObj+1,contentObj=pageObj+2;
      bodies[pageObj]=ascii(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 ${imgObj} 0 R >> >> /Contents ${contentObj} 0 R >>`);
      const im=images[i];bodies[imgObj]=concat([ascii(`<< /Type /XObject /Subtype /Image /Width ${pixelW} /Height ${pixelH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.length} >>\nstream\n`),im,ascii('\nendstream')]);
      const stream=`q\n${pw} 0 0 ${ph} 0 0 cm\n/Im0 Do\nQ\n`;bodies[contentObj]=ascii(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);
    }
    const chunks=[ascii('%PDF-1.4\n%âãÏÓ\n')],offsets=new Array(totalObjs+1).fill(0);let pos=chunks[0].length;
    for(let i=1;i<=totalObjs;i++){offsets[i]=pos;const head=ascii(`${i} 0 obj\n`),tail=ascii('\nendobj\n');chunks.push(head,bodies[i],tail);pos+=head.length+bodies[i].length+tail.length;}
    const xrefPos=pos;let xref=`xref\n0 ${totalObjs+1}\n0000000000 65535 f \n`;for(let i=1;i<=totalObjs;i++)xref+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
    const trailer=`trailer\n<< /Size ${totalObjs+1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;chunks.push(ascii(xref+trailer));return new Blob([concat(chunks)],{type:'application/pdf'});
  }
})();
