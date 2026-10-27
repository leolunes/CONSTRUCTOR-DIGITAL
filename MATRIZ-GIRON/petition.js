/* ============================================================
   Derecho de Petición por necesidad · v1.3.70
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
  let uploadedSignatureName = '';
  const signatureUpload = document.getElementById('petitionSignatureUpload');
  const signatureFileName = document.getElementById('petitionSignatureFileName');
  const signerModeControl = document.getElementById('petitionSignerMode');
  const docTypeControl = document.getElementById('petitionDocumentType');
  const ivanPanel = document.getElementById('petitionIvanSignPanel');
  const personalPanel = document.getElementById('petitionPersonalSignPanel');
  const ivanFile = document.getElementById('ivanSignatureFile');
  const ivanRemove = document.getElementById('ivanSignatureRemove');
  const ivanPreview = document.getElementById('ivanSignaturePreview');
  const ivanStatus = document.getElementById('ivanSignatureStatus');
  const ivanConsent = document.getElementById('ivanSignatureAuthorized');
  const GENERAL_ID='__solicitud_libre_ivan_v1__';
  const GENERAL_NEED={id:GENERAL_ID,code:'SOLICITUD-LIBRE',title:'Solicitud general de Iván Ortiz',territory:'Santander',sector:'Gestión territorial'};
  let authorizedSignature=null;
  let manualPetitionerName='';
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
    const safeRecord=await window.MatrizBinaryStore.pack(record);
    const d=await openDocDB();
    return new Promise((resolve,reject)=>{
      const tx=d.transaction(DOC_STORE,'readwrite');
      tx.objectStore(DOC_STORE).put(safeRecord);
      tx.oncomplete=()=>{d.close();resolve(record)};
      tx.onerror=()=>{const e=tx.error;d.close();reject(e)};
    });
  }
  async function getPDFRecords(){
    const d=await openDocDB();
    return new Promise((resolve,reject)=>{
      const tx=d.transaction(DOC_STORE,'readonly');
      const r=tx.objectStore(DOC_STORE).getAll();
      r.onsuccess=()=>resolve((r.result||[]).map(window.MatrizBinaryStore.unpack).sort((a,b)=>String(b.generatedAt||'').localeCompare(String(a.generatedAt||''))));
      r.onerror=()=>reject(r.error);
      tx.oncomplete=()=>d.close();
    });
  }
  async function getPDFRecord(id){
    const d=await openDocDB();
    return new Promise((resolve,reject)=>{
      const tx=d.transaction(DOC_STORE,'readonly');
      const r=tx.objectStore(DOC_STORE).get(id);
      r.onsuccess=()=>resolve(r.result?window.MatrizBinaryStore.unpack(r.result):null);
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
      r.onsuccess=()=>resolve((r.result||[]).map(window.MatrizBinaryStore.unpack));
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

  function getNeed(id){ return id===GENERAL_ID ? GENERAL_NEED : db.needs.find(n => n.id === id); }
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

  function openPetition(needId, signerChoice="personal"){
    const n = getNeed(needId); if (!n) return;
    if(window.clearBatchRecipients) window.clearBatchRecipients('petition');
    const l = getLeader(n);
    form.reset();
    lastGenerated = null;
    form.elements.needId.value = n.id;
    if(form.elements.vereda) form.elements.vereda.value = n.id===GENERAL_ID ? 'Solicitud sin necesidad registrada' : (clean(n.vereda) || 'Sin vereda asignada');
    form.elements.recipientName.value = '';
    form.elements.recipientRole.value = '';
    form.elements.entity.value = clean(n.competentEntity);
    form.elements.recipientEmail.value = '';
    form.elements.recipientPhone.value = '';
    const institutionPrefill = window.__petitionInstitutionPrefill || null;
    if(institutionPrefill){
      form.elements.entity.value = clean(institutionPrefill.entity) || form.elements.entity.value;
      form.elements.recipientName.value = clean(institutionPrefill.recipientName);
      form.elements.recipientRole.value = clean(institutionPrefill.recipientRole);
      form.elements.recipientEmail.value = clean(institutionPrefill.email);
      form.elements.recipientPhone.value = clean(institutionPrefill.phone);
      window.__petitionInstitutionPrefill = null;
    }
    form.elements.petitionerName.value = clean(l?.name);
    form.elements.petitionerId.value = '';
    form.elements.address.value = '';
    form.elements.phone.value = clean(l?.phone);
    form.elements.email.value = clean(l?.email);
    form.elements.subject.value = n.id===GENERAL_ID ? '' : `Derecho de petición - ${clean(n.title) || n.code}`;
    form.elements.facts.value = n.id===GENERAL_ID ? '' : defaultFacts(n);
    form.elements.requests.value = n.id===GENERAL_ID ? '' : defaultRequests(n);
    form.elements.attachments.value = clean(n.evidence);
    form.elements.radicado.value = '';
    form.elements.radicadoDate.value = '';
    document.getElementById('petitionNeedSummary').textContent = n.id===GENERAL_ID ? 'Solicitud sin necesidad registrada · Iván Ortiz' : `${n.code} · ${n.territory || 'Sin territorio'} · ${n.title || 'Necesidad'}`;
    docTypeControl.value=n.id===GENERAL_ID ? 'solicitud' : 'peticion';
    manualPetitionerName=clean(form.elements.petitionerName.value);
    signerModeControl.value=signerChoice;
    clearSignature();
    if(ivanConsent)ivanConsent.checked=false;
    modal.classList.add('open');
    updateSignerMode(false);
    setTimeout(resizeSignatureCanvas, 80);
    if(signerChoice==='ivan')refreshAuthorizedSignature();
  }

  function closePetition(){ modal.classList.remove('open'); }
  document.getElementById('newIvanFreeRequestBtn')?.addEventListener('click',()=>{
    centerModal?.classList.remove('open');
    openPetition(GENERAL_ID,'ivan');
  });
  window.openPetitionForNeed = openPetition;
  window.setPetitionInstitution = data => { window.__petitionInstitutionPrefill = data || null; };
  const updatePetitionBatchCount=()=>{
    const rows=window.__batchRecipients?.petition||[],el=document.getElementById('petitionBatchCount');
    if(el)el.textContent=rows.length?`${rows.length} destinatario${rows.length===1?'':'s'} seleccionado${rows.length===1?'':'s'}`:'Sin selección múltiple';
  };
  window.addEventListener('batch-recipients-changed',e=>{if(e.detail?.mode==='petition')updatePetitionBatchCount()});

  const centerModal = document.getElementById('petitionCenterModal');
  const centerList = document.getElementById('petitionCenterList');
  const newNeedSelect = document.getElementById('petitionNewNeedSelect');
  const newPetitionBtn = document.getElementById('newPetitionBtn');
  function renderPetitionCenter(){
    if(!centerList) return;
    const needs = Array.isArray(db.needs) ? db.needs : [];
    if(newNeedSelect){
      newNeedSelect.innerHTML='<option value="">Seleccione una necesidad...</option>'+needs.map(n=>`<option value="${escLocal(n.id)}">${escLocal(n.code)} · ${escLocal(n.title||'Necesidad')}</option>`).join('');
      newNeedSelect.disabled=!needs.length;
    }
    if(newPetitionBtn) newPetitionBtn.disabled=!needs.length;
    if(!needs.length){
      centerList.innerHTML = '<div class="petition-center-empty"><strong>Aún no hay necesidades registradas.</strong><br>También puede preparar una solicitud libre de Iván Ortiz con el botón superior.</div>';
      return;
    }
    centerList.innerHTML = needs.map(n=>{
      const count=Array.isArray(n.petitions)?n.petitions.length:0;
      return `<div class="petition-center-item"><div><strong>${escLocal(n.code)} · ${escLocal(n.title||'Necesidad')}${count?`<span class="petition-center-badge">${count} generado${count===1?'':'s'}</span>`:''}</strong><small>${escLocal(n.territory||'Sin territorio')} · ${escLocal(n.sector||'Sin sector')} · ${escLocal(n.status||'Sin estado')}</small></div><button type="button" data-petition-need="${escLocal(n.id)}">📄 Generar PDF firmado</button></div>`;
    }).join('');
    centerList.querySelectorAll('[data-petition-need]').forEach(b=>b.addEventListener('click',()=>{ centerModal?.classList.remove('open'); openPetition(b.dataset.petitionNeed); }));
  }
  function openPetitionCenter(){ renderPetitionCenter(); refreshArchiveCount(); centerModal?.classList.add('open'); }
  newPetitionBtn?.addEventListener('click',()=>{
    const needId=newNeedSelect?.value;
    if(!needId){ alert('Seleccione primero la necesidad sobre la cual desea crear el nuevo Derecho de Petición.'); newNeedSelect?.focus(); return; }
    centerModal?.classList.remove('open');
    openPetition(needId);
  });
  document.getElementById('newPetitionBatchBtn')?.addEventListener('click',()=>{
    const needId=newNeedSelect?.value;
    if(!needId){ alert('Seleccione primero la necesidad sobre la cual desea crear los Derechos de Petición.'); newNeedSelect?.focus(); return; }
    centerModal?.classList.remove('open');
    openPetition(needId);
    setTimeout(()=>document.querySelector('[data-batch-open=\"petition\"]')?.click(),120);
  });
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
  const archiveRecipient=document.getElementById('petitionArchiveRecipient');
  const archiveEntity=document.getElementById('petitionArchiveEntity');
  const archiveStatus=document.getElementById('petitionArchiveStatus');
  const archiveFrom=document.getElementById('petitionArchiveFrom');
  const archiveTo=document.getElementById('petitionArchiveTo');
  const archiveClear=document.getElementById('petitionArchiveClear');
  const petitionSendModal=document.getElementById('petitionSendModal');
  let archiveCache=[], petitionSendDocId=null;
  const formatGeneratedAt=v=>{try{return new Intl.DateTimeFormat('es-CO',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v))}catch(_){return clean(v)}};
  async function refreshArchiveCount(){
    try{const n=await countPDFRecords();if(archiveCount)archiveCount.textContent=n;}catch(_){ }
  }
  function petitionSendStatusText(r){
    if(r.sentAt&&r.sentTo)return `🟢 Enviado · ${r.sentTo} · ${new Date(r.sentAt).toLocaleString('es-CO')}`;
    if(r.sendPreparedAt&&r.sendPreparedTo)return `🟠 Preparado para enviar · ${r.sendPreparedTo}`;
    return '⚪ No enviado';
  }
  function fillPetitionArchiveFilters(){
    const rv=archiveRecipient?.value||'', ev=archiveEntity?.value||'';
    const recipients=[...new Set(archiveCache.map(r=>clean(r.recipientName)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
    const entities=[...new Set(archiveCache.map(r=>clean(r.entity)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
    if(archiveRecipient){archiveRecipient.innerHTML='<option value="">Todos los destinatarios</option>'+recipients.map(v=>`<option value="${escLocal(v)}">${escLocal(v)}</option>`).join('');archiveRecipient.value=recipients.includes(rv)?rv:''}
    if(archiveEntity){archiveEntity.innerHTML='<option value="">Todas las entidades</option>'+entities.map(v=>`<option value="${escLocal(v)}">${escLocal(v)}</option>`).join('');archiveEntity.value=entities.includes(ev)?ev:''}
  }
  function archiveMatches(r,q){
    if(q){
      const hay=[r.needCode,r.needTitle,r.territory,r.vereda,r.entity,r.recipientName,r.recipientEmail,r.recipientPhone,r.petitionerName,r.subject,r.radicado,r.filename].map(clean).join(' ').toLowerCase();
      if(!hay.includes(q.toLowerCase()))return false;
    }
    const recipient=clean(archiveRecipient?.value),entity=clean(archiveEntity?.value),status=clean(archiveStatus?.value),from=clean(archiveFrom?.value),to=clean(archiveTo?.value);
    if(recipient&&clean(r.recipientName)!==recipient)return false;
    if(entity&&clean(r.entity)!==entity)return false;
    if(status==='pending'&&clean(r.radicado))return false;
    if(status==='assigned'&&!clean(r.radicado))return false;
    if(status==='prepared'&&!(r.sendPreparedAt&&r.sendPreparedTo)||status==='prepared'&&(r.sentAt&&r.sentTo))return false;
    if(status==='sent'&&!(r.sentAt&&r.sentTo))return false;
    const date=clean(r.generatedAt).slice(0,10);
    if(from&&date<from)return false;
    if(to&&date>to)return false;
    return true;
  }
  function renderArchiveList(){
    if(!archiveList)return;
    fillPetitionArchiveFilters();
    const q=clean(archiveSearch?.value);
    const rows=archiveCache.filter(r=>archiveMatches(r,q));
    if(archiveSummary)archiveSummary.textContent=`${rows.length} de ${archiveCache.length} documento${archiveCache.length===1?'':'s'}`;
    if(!rows.length){archiveList.innerHTML='<div class="petition-center-empty"><strong>No hay documentos que coincidan con los filtros.</strong><br>Puede limpiar los filtros o generar un nuevo Derecho de Petición.</div>';return;}
    archiveList.innerHTML=rows.map(r=>{
      const rad=clean(r.radicado);
      const radStatus=rad?`<span class="petition-doc-status assigned">🟢 Radicado: ${escLocal(rad)}</span>`:`<span class="petition-doc-status pending">🟡 Pendiente de radicado</span>`;
      return `<article class="petition-archive-item"><div class="petition-archive-main"><div class="petition-archive-icon">PDF</div><div><strong>${r.type==='solicitud'?'Solicitud':'Derecho de petición'} · ${escLocal(r.needCode||'SIN-CÓDIGO')} · ${escLocal(r.needTitle||'Documento')}</strong><small><b>Generado:</b> ${escLocal(formatGeneratedAt(r.generatedAt))}</small><small><b>Destinatario:</b> ${escLocal(r.recipientName||'Sin nombre')} · ${escLocal(r.entity||'Sin entidad')}</small><small><b>Asunto:</b> ${escLocal(r.subject||'')}</small>${r.vereda?`<small><b>Vereda:</b> ${escLocal(r.vereda)}</small>`:''}<div class="petition-doc-status-row">${radStatus}<span class="petition-send-row-status">${escLocal(petitionSendStatusText(r))}</span></div><small class="petition-archive-file">${escLocal(r.filename||'documento.pdf')}</small></div></div><div class="petition-archive-buttons"><button type="button" data-doc-view="${escLocal(r.id)}">Abrir</button><button type="button" data-doc-radicado="${escLocal(r.id)}">✏️ ${rad?'Editar':'Registrar'} radicado</button><button type="button" data-doc-email="${escLocal(r.id)}">📤 Enviar</button><button type="button" data-doc-download="${escLocal(r.id)}">⬇ PDF</button><button type="button" class="danger" data-doc-delete="${escLocal(r.id)}">🗑</button></div></article>`;
    }).join('');
    archiveList.querySelectorAll('[data-doc-view]').forEach(b=>b.addEventListener('click',()=>viewArchivedPDF(b.dataset.docView)));
    archiveList.querySelectorAll('[data-doc-radicado]').forEach(b=>b.addEventListener('click',()=>registerPetitionRadicado(b.dataset.docRadicado)));
    archiveList.querySelectorAll('[data-doc-email]').forEach(b=>b.addEventListener('click',()=>openPetitionSend(b.dataset.docEmail)));
    archiveList.querySelectorAll('[data-doc-download]').forEach(b=>b.addEventListener('click',()=>downloadArchivedPDF(b.dataset.docDownload)));
    archiveList.querySelectorAll('[data-doc-delete]').forEach(b=>b.addEventListener('click',()=>removeArchivedPDF(b.dataset.docDelete)));
  }
  async function registerPetitionRadicado(id){
    const r=archiveCache.find(x=>x.id===id)||await getPDFRecord(id);if(!r)return;
    const value=prompt('Digite el número de radicado asignado por la entidad:',clean(r.radicado));
    if(value===null)return;
    r.radicado=clean(value);
    r.radicadoDate=r.radicado?(clean(r.radicadoDate)||todayISO()):'';
    r.radicadoRegisteredAt=r.radicado?new Date().toISOString():'';
    await savePDFRecord(r);
    archiveCache=await getPDFRecords();renderArchiveList();
  }
  function openPetitionSend(id){
    const r=archiveCache.find(x=>x.id===id);if(!r||!petitionSendModal)return;
    petitionSendDocId=id;
    document.getElementById('petitionSendDocument').value=r.filename||r.subject||'Derecho de Petición';
    document.getElementById('petitionSendEmail').value=clean(r.sendPreparedTo||r.sentTo||r.recipientEmail);
    document.getElementById('petitionSendSubject').value=`${r.type==='solicitud'?'Solicitud':'Derecho de Petición'}: ${clean(r.subject||r.needTitle)}`;
    document.getElementById('petitionSendMessage').value=`Cordial saludo.\n\nAdjunto ${r.type==='solicitud'?'solicitud formal':'derecho de petición'} para su trámite y respuesta.\n\nAsunto: ${clean(r.subject||r.needTitle)}.\n\nAgradezco confirmar recibido.`;
    document.getElementById('petitionSendStatus').innerHTML=`<strong>Estado actual:</strong> ${escLocal(petitionSendStatusText(r))}`;
    petitionSendModal.classList.add('open');
  }
  function closePetitionSend(){petitionSendModal?.classList.remove('open');petitionSendDocId=null}
  async function openPetitionArchive(){
    try{archiveCache=await getPDFRecords();renderArchiveList();archiveModal?.classList.add('open');refreshArchiveCount();}
    catch(err){console.error(err);alert('No fue posible abrir el archivo de PDFs: '+err.message);}
  }
  async function viewArchivedPDF(id){
    try{
      const r=archiveCache.find(x=>x.id===id)||await getPDFRecord(id);
      if(!r?.blob){alert('El documento aparece en el archivo pero no se encontró su PDF. Compruebe el contenido del respaldo integral original.');return}
      if(window.GironPdfPortable)window.GironPdfPortable.open(r.blob,r.filename||'Derecho-de-Peticion.pdf');
      else {const url=URL.createObjectURL(r.blob);window.open(url,'_blank');setTimeout(()=>URL.revokeObjectURL(url),120000)}
    }catch(err){alert('Error al recuperar el PDF: '+err.message)}
  }
  async function downloadArchivedPDF(id){
    try{
      const r=archiveCache.find(x=>x.id===id)||await getPDFRecord(id);
      if(!r?.blob){alert('No se encontró el PDF en el archivo local. Conserve y compruebe el JSON original.');return}
      if(window.GironPdfPortable?.isAppleMobile())window.GironPdfPortable.open(r.blob,r.filename||'Derecho-de-Peticion.pdf');
      else downloadPDF(r.blob,r.filename||'Derecho-de-Peticion.pdf');
    }catch(err){alert('Error al recuperar el PDF: '+err.message)}
  }
  async function removeArchivedPDF(id){
    const r=archiveCache.find(x=>x.id===id);if(!confirm(`¿Eliminar del archivo el PDF ${r?.filename||''}?\n\nEsta acción no elimina la necesidad ni su trazabilidad.`))return;
    await deletePDFRecord(id);archiveCache=archiveCache.filter(x=>x.id!==id);renderArchiveList();refreshArchiveCount();
  }
  document.querySelectorAll('[data-petition-send-close]').forEach(b=>b.addEventListener('click',closePetitionSend));
  petitionSendModal?.addEventListener('click',e=>{if(e.target===petitionSendModal)closePetitionSend()});
  document.getElementById('petitionPrepareEmail')?.addEventListener('click',async()=>{
    const r=archiveCache.find(x=>x.id===petitionSendDocId)||await getPDFRecord(petitionSendDocId);if(!r?.blob)return;
    const email=clean(document.getElementById('petitionSendEmail')?.value);
    if(!email||!/^\S+@\S+\.\S+$/.test(email)){alert('Digite un correo electrónico válido.');return}
    downloadPDF(r.blob,r.filename||'Derecho-de-Peticion.pdf');
    r.sendPreparedAt=new Date().toISOString();r.sendPreparedTo=email;await savePDFRecord(r);
    archiveCache=await getPDFRecords();renderArchiveList();
    document.getElementById('petitionSendStatus').innerHTML=`<strong>Estado:</strong> 🟠 Preparado para enviar a ${escLocal(email)}. El PDF fue descargado; adjúntelo en el correo que se abrirá. <strong>Aún no se registra como enviado.</strong>`;
    const subject=clean(document.getElementById('petitionSendSubject')?.value),body=clean(document.getElementById('petitionSendMessage')?.value);
    setTimeout(()=>{window.location.href=`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`},250);
  });
  document.getElementById('petitionConfirmSent')?.addEventListener('click',async()=>{
    const r=archiveCache.find(x=>x.id===petitionSendDocId)||await getPDFRecord(petitionSendDocId);if(!r)return;
    const email=clean(document.getElementById('petitionSendEmail')?.value);
    if(!email||!/^\S+@\S+\.\S+$/.test(email)){alert('Digite el correo al que realmente envió el documento.');return}
    if(!confirm(`¿Confirma que usted ya envió este Derecho de Petición a ${email}?`))return;
    r.sentAt=new Date().toISOString();r.sentTo=email;await savePDFRecord(r);
    archiveCache=await getPDFRecords();renderArchiveList();
    document.getElementById('petitionSendStatus').innerHTML=`<strong>Estado:</strong> 🟢 Enviado a ${escLocal(email)} · ${new Date(r.sentAt).toLocaleString('es-CO')}`;
  });
  window.openPetitionArchive=openPetitionArchive;
  document.getElementById('openPetitionArchive')?.addEventListener('click',()=>{centerModal?.classList.remove('open');openPetitionArchive();});
  document.querySelectorAll('[data-petition-archive-close]').forEach(b=>b.addEventListener('click',()=>archiveModal?.classList.remove('open')));
  archiveModal?.addEventListener('click',e=>{if(e.target===archiveModal)archiveModal.classList.remove('open')});
  [archiveSearch,archiveRecipient,archiveEntity,archiveStatus,archiveFrom,archiveTo].forEach(el=>el?.addEventListener(el===archiveSearch?'input':'change',renderArchiveList));
  archiveClear?.addEventListener('click',()=>{
    if(archiveSearch)archiveSearch.value='';if(archiveRecipient)archiveRecipient.value='';if(archiveEntity)archiveEntity.value='';
    if(archiveStatus)archiveStatus.value='';if(archiveFrom)archiveFrom.value='';if(archiveTo)archiveTo.value='';renderArchiveList();
  });
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
  // Firma Iván: almacenamiento exclusivamente local en IndexedDB, nunca en assets públicos.
  const IVAN_SIG_DB='matriz_giron_private_signatures_v1', IVAN_SIG_STORE='signatures';
  function openPrivateSignatureDB(){
    return new Promise((resolve,reject)=>{
      const r=indexedDB.open(IVAN_SIG_DB,1);
      r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(IVAN_SIG_STORE))r.result.createObjectStore(IVAN_SIG_STORE,{keyPath:'id'});};
      r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
    });
  }
  async function signatureRecord(operation,record=null){
    const d=await openPrivateSignatureDB();
    return new Promise((resolve,reject)=>{
      const tx=d.transaction(IVAN_SIG_STORE,operation==='get'?'readonly':'readwrite');
      const st=tx.objectStore(IVAN_SIG_STORE);
      const req=operation==='get'?st.get('ivan-ortiz'):operation==='put'?st.put(record):st.delete('ivan-ortiz');
      let result=null;
      req.onsuccess=()=>{result=req.result;};
      tx.oncomplete=()=>{d.close();resolve(result);};
      tx.onerror=()=>{const e=tx.error;d.close();reject(e);};
    });
  }
  function showIvanSignatureState(){
    if(ivanPreview){
      if(authorizedSignature?.dataUrl){ivanPreview.src=authorizedSignature.dataUrl;ivanPreview.hidden=false;}
      else{ivanPreview.hidden=true;ivanPreview.removeAttribute('src');}
    }
    if(ivanStatus)ivanStatus.textContent=authorizedSignature
      ? `✓ Firma registrada en este navegador: ${authorizedSignature.fileName||'Imagen escaneada'} · lista para documentos autorizados.`
      : 'No hay firma de Iván Ortiz guardada en este navegador. Pulse «Registrar / actualizar» y seleccione la imagen escaneada.';
    lastGenerated=null;
  }
  async function refreshAuthorizedSignature(){
    if(ivanStatus)ivanStatus.textContent='Consultando firma local...';
    try{authorizedSignature=await signatureRecord('get')||null;showIvanSignatureState();}
    catch(err){console.error(err);if(ivanStatus)ivanStatus.textContent='No se puede acceder al almacenamiento local de firmas: '+err.message;}
  }
  function updateSignerMode(fromChoice=true){
    const isIvan=signerModeControl?.value==='ivan';
    if(isIvan){
      if(fromChoice)manualPetitionerName=clean(form.elements.petitionerName.value);
      form.elements.petitionerName.value='IVÁN ORTIZ';
    }else if(fromChoice){form.elements.petitionerName.value=manualPetitionerName;}
    form.elements.petitionerName.readOnly=isIvan;
    if(ivanPanel)ivanPanel.hidden=!isIvan;
    if(personalPanel)personalPanel.hidden=isIvan;
    if(ivanConsent)ivanConsent.checked=false;
    clearSignature();
    lastGenerated=null;
    if(isIvan)refreshAuthorizedSignature();
  }
  signerModeControl?.addEventListener('change',()=>updateSignerMode(true));
  docTypeControl?.addEventListener('change',()=>{
    lastGenerated=null;
    const v=clean(form.elements.subject.value);
    if(docTypeControl.value==='solicitud' && v.startsWith('Derecho de petición - ')) form.elements.subject.value='Solicitud - '+v.slice('Derecho de petición - '.length);
    else if(docTypeControl.value==='peticion' && v.startsWith('Solicitud - ')) form.elements.subject.value='Derecho de petición - '+v.slice('Solicitud - '.length);
  });
  function fileToDataUrl(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=()=>reject(r.error||new Error('Archivo no leído'));r.readAsDataURL(file);});}
  ivanFile?.addEventListener('change',async()=>{
    const file=ivanFile.files?.[0];if(!file)return;
    try{
      if(!/^image\/(png|jpeg|webp)$/i.test(file.type))throw Error('Seleccione una imagen JPG, PNG o WEBP.');
      if(file.size>5*1024*1024)throw Error('La imagen de la firma supera 5 MB.');
      const dataUrl=await fileToDataUrl(file);
      await loadImage(dataUrl); // Valida que es realmente una imagen legible.
      const rec={id:'ivan-ortiz',dataUrl,fileName:file.name,savedAt:new Date().toISOString()};
      await signatureRecord('put',rec);
      authorizedSignature=rec;
      showIvanSignatureState();
      if(ivanConsent)ivanConsent.checked=false;
    }catch(err){alert('No fue posible registrar la firma: '+err.message);}
    finally{ivanFile.value='';}
  });
  ivanRemove?.addEventListener('click',async()=>{
    if(!confirm('¿Eliminar de este navegador la firma escaneada guardada de Iván Ortiz? No elimina los PDF existentes.'))return;
    try{await signatureRecord('delete');authorizedSignature=null;showIvanSignatureState();if(ivanConsent)ivanConsent.checked=false;}
    catch(err){alert('No se pudo eliminar: '+err.message);}
  });
  refreshAuthorizedSignature();


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
    signatureHasInk=false; uploadedSignatureName=''; drawing=false; last=null; lastGenerated=null;
    if(signatureUpload) signatureUpload.value='';
    if(signatureFileName) signatureFileName.textContent='';
  }
  function loadSignatureImage(file){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>{
        const img=new Image();
        img.onload=()=>resolve(img);
        img.onerror=()=>reject(new Error('No fue posible leer la imagen de la firma.'));
        img.src=reader.result;
      };
      reader.onerror=()=>reject(new Error('No fue posible cargar el archivo seleccionado.'));
      reader.readAsDataURL(file);
    });
  }
  signatureUpload?.addEventListener('change',async()=>{
    const file=signatureUpload.files?.[0]; if(!file)return;
    if(!/^image\/(png|jpeg|webp)$/i.test(file.type)){alert('Seleccione una imagen PNG, JPG, JPEG o WEBP.');signatureUpload.value='';return}
    try{
      const img=await loadSignatureImage(file);
      const ctx=signCanvas.getContext('2d');
      ctx.fillStyle='#fff';ctx.fillRect(0,0,signCanvas.width,signCanvas.height);
      const pad=18,maxW=signCanvas.width-pad*2,maxH=signCanvas.height-pad*2;
      const scale=Math.min(maxW/img.width,maxH/img.height);
      const w=img.width*scale,h=img.height*scale;
      ctx.drawImage(img,(signCanvas.width-w)/2,(signCanvas.height-h)/2,w,h);
      signatureHasInk=true;uploadedSignatureName=file.name;lastGenerated=null;
      if(signatureFileName)signatureFileName.textContent=`Firma cargada: ${file.name}`;
    }catch(err){console.error(err);alert(err.message||'No fue posible cargar la firma escaneada.')}
  });
    function pointerPos(e){ const r=signCanvas.getBoundingClientRect(); return {x:(e.clientX-r.left)*(signCanvas.width/r.width), y:(e.clientY-r.top)*(signCanvas.height/r.height)}; }
  signCanvas.addEventListener('pointerdown',e=>{ e.preventDefault();
    if(uploadedSignatureName){const ctx=signCanvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,signCanvas.width,signCanvas.height);uploadedSignatureName='';if(signatureUpload)signatureUpload.value='';if(signatureFileName)signatureFileName.textContent='';signatureHasInk=false;}
    drawing=true; last=pointerPos(e); signCanvas.setPointerCapture?.(e.pointerId);
  });
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
    const isIvan=signerModeControl?.value==='ivan';
    if(isIvan && !authorizedSignature?.dataUrl){alert('Primero registre la firma escaneada de Iván Ortiz en este navegador.');return null;}
    if(isIvan && !ivanConsent?.checked){alert('Confirme la autorización de Iván Ortiz para usar su firma en este documento.');return null;}
    if(!isIvan && !signatureHasInk){alert('Firme en el recuadro o cargue su firma antes de generar el PDF.');return null;}
    const fd=Object.fromEntries(new FormData(form).entries());
    const n=getNeed(fd.needId); if(!n) return null;
    if(!clean(fd.entity)){ alert('Indique la entidad donde trabaja la persona destinataria.'); return null; }
    if(!clean(fd.recipientName)){ alert('Indique el nombre de la persona destinataria.'); return null; }
    return {fd,n,signature:isIvan?authorizedSignature.dataUrl:signCanvas.toDataURL('image/png'), signatureKind:isIvan?'ivan-escaneada':'personal'};
  }

  function tracePetition(data){
    const {fd,n}=data;
    if(n?.id===GENERAL_ID)return;
    n.petitions = Array.isArray(n.petitions) ? n.petitions : [];
    const fingerprint = [clean(fd.entity),clean(fd.recipientName),clean(fd.petitionerName),clean(fd.subject),clean(fd.radicado),clean(fd.radicadoDate)].join('|');
    const recent=n.petitions[n.petitions.length-1];
    if(recent?.fingerprint===fingerprint && (Date.now()-new Date(recent.generatedAt).getTime())<120000) return;
    n.petitions.push({
      id:uidLocal(),generatedAt:data.generatedAt,entity:clean(fd.entity),recipientName:clean(fd.recipientName),recipientRole:clean(fd.recipientRole),recipientEmail:clean(fd.recipientEmail),recipientPhone:clean(fd.recipientPhone),
      petitionerName:clean(fd.petitionerName),petitionerId:clean(fd.petitionerId),subject:clean(fd.subject),radicado:clean(fd.radicado),radicadoDate:clean(fd.radicadoDate),vereda:clean(n.vereda),status:fd.radicado?'Radicado':'Generado',fingerprint
    });
    saveDB();
    try{ toast('Derecho de Petición generado y guardado en la trazabilidad'); }catch(_){ }
  }

  async function archiveGeneratedPDF({blob,filename,data}){
    const fd=data, n=data.need;
    const record={
      id:uidLocal(),type:fd.documentType==='solicitud'?'solicitud':'derecho_peticion',signatureKind:data.signatureKind||'personal',needId:n.id,needCode:clean(n.code),needTitle:clean(n.title),territory:clean(n.territory),vereda:clean(n.vereda),sector:clean(n.sector),
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
    const snapshot=JSON.stringify(collected.fd)+'|'+collected.signature;
    if(lastGenerated?.snapshot===snapshot && lastGenerated.archiveId) return lastGenerated;
    const data={...collected.fd,need:collected.n,signature:collected.signature,signatureKind:collected.signatureKind,generatedAt:new Date().toISOString()};
    const blob=await buildPetitionPDF(data);
    const safe=(collected.n.code||'NECESIDAD').replace(/[^A-Za-z0-9_-]+/g,'-');
    const filename=`${collected.fd.documentType==='solicitud'?'SOLICITUD':'DERECHO-PETICION'}-${safe}-${todayISO()}.pdf`;
    let archiveId=null;
    try{archiveId=await archiveGeneratedPDF({blob,filename,data})}
    catch(err){
      console.error('PDF generado, pero el archivo local no lo pudo almacenar:',err);
      alert('El PDF se generó, pero NO quedó archivado en la Matriz. Se abrirá para que lo guarde en Archivos. Conserve esa copia. Detalle: '+err.message);
    }
    lastGenerated={snapshot,blob,filename,data,archiveId};
    if(archiveId){
      tracePetition({fd:collected.fd,n:collected.n,generatedAt:data.generatedAt});
      try{ toast('PDF generado y guardado en el Archivo de Derechos de Petición'); }catch(_){ }
    }
    return lastGenerated;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const submit=form.querySelector('button[type="submit"]'); const old=submit.textContent;
    const batch=window.__batchRecipients?.petition||[];
    submit.disabled=true; submit.textContent=batch.length?`Generando ${batch.length} PDF...`:'Generando PDF...';
    try{
      if(!batch.length){
        const result=await getOrBuildPDF(); if(!result)return;
        downloadPDF(result.blob,result.filename);
        try{ toast('PDF generado correctamente'); }catch(_){ }
      }else{
        const collected=collectData();if(!collected)return;
        const base=Object.fromEntries(new FormData(form).entries());
        const n=getNeed(base.needId); if(!n)return;
        const signature=collected.signature;
        let made=0,archiveFailures=0;
        for(const r of batch){
          const fd={...base,entity:r.entity,recipientName:r.recipientName||r.entity,recipientRole:r.recipientRole||'Funcionario competente',recipientEmail:r.email||'',recipientPhone:r.phone||''};
          const data={...fd,need:n,signature,signatureKind:collected.signatureKind,generatedAt:new Date().toISOString()};
          const blob=await buildPetitionPDF(data);
          const safeNeed=(n.code||'NECESIDAD').replace(/[^A-Za-z0-9_-]+/g,'-');
          const safeEntity=clean(r.entity).replace(/[^A-Za-z0-9áéíóúñÁÉÍÓÚÑ_-]+/g,'-').slice(0,55);
          const filename=`${fd.documentType==='solicitud'?'SOLICITUD':'DERECHO-PETICION'}-${safeNeed}-${safeEntity}-${todayISO()}.pdf`;
          let failedToArchive=false;
          try{
            await archiveGeneratedPDF({blob,filename,data});
            tracePetition({fd,n,generatedAt:data.generatedAt});
          }catch(err){archiveFailures++;failedToArchive=true;console.error('PDF sin archivar:',err)}
          if(!window.GironPdfPortable?.isAppleMobile()||failedToArchive)downloadPDF(blob,filename);
          made++;
          if(failedToArchive&&window.GironPdfPortable?.isAppleMobile())break;
          await new Promise(resolve=>setTimeout(resolve,120));
        }
        lastGenerated=null;
        alert(archiveFailures
          ?`Se generaron ${made} PDF, pero ${archiveFailures} NO pudieron archivarse. Guarde esos documentos desde el visor y conserve su respaldo.`
          :`Lote generado correctamente: ${made} Derechos de Petición individuales. Cada documento quedó archivado con su propio destinatario.`);
        try{toast(`${made} Derechos de Petición generados`)}catch(_){}
      }
    }catch(err){ console.error(err); alert('No fue posible generar el PDF: '+err.message); }
    finally{submit.disabled=false;submit.textContent=old;}
  });

  document.getElementById('sharePetitionWhatsApp')?.addEventListener('click',async e=>{
    const btn=e.currentTarget,old=btn.textContent; btn.disabled=true; btn.textContent='Preparando PDF...';
    try{
      const result=await getOrBuildPDF(); if(!result)return;
      const file=new File([result.blob],result.filename,{type:'application/pdf'});
      const text=`${result.data.documentType==='solicitud'?'Solicitud':'Derecho de Petición'}: ${clean(result.data.subject)}. Documento firmado en PDF.`;
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
    if(window.GironPdfPortable?.isAppleMobile()){
      window.GironPdfPortable.open(blob,name);
      return;
    }
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),120000);
  }

  async function buildPetitionPDF(d){
    // Área segura de impresión A4: ningún texto ni fotografía invade el pie.
    // La paginación se calcula por bloques, nunca cortando un numeral a medias.
    const W=1240,H=1754,M=118,BOTTOM=140,TOP=225;
    const CONTENT_HEIGHT=H-BOTTOM-TOP;
    const pages=[]; let c,ctx,y;
    const ivanPhoto=await loadImage('assets/ivan-ortiz-foto.png').catch(()=>null);
    const ivanBrand=await loadImage('assets/ivan-ortiz-marca.png').catch(()=>null);
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
      ctx.textAlign='left';if(ivanBrand){const bw=360,bh=bw*(ivanBrand.height/ivanBrand.width);ctx.drawImage(ivanBrand,M+120,36,bw,bh);}
      ctx.font='400 18px Arial, sans-serif';ctx.fillStyle='#d8e7f6';ctx.fillText('Gestión Territorial para Girón',M+120,118);
      
      ctx.textAlign='right';
      ctx.textAlign='left';
    }
    function newPage(){
      c=document.createElement('canvas');c.width=W;c.height=H;ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);pages.push(c);drawHeader();y=TOP;
    }
    function font(size=23,bold=false,italic=false,color='#192431'){ctx.font=`${italic?'italic ':''}${bold?'700 ':'400 '}${size}px Arial, sans-serif`;ctx.fillStyle=color;}
    function ensure(h){if(y+h>H-BOTTOM&&y>TOP+1)newPage();}
    function rule(){ensure(28);ctx.strokeStyle='#c6d6e6';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(M,y);ctx.lineTo(W-M,y);ctx.stroke();y+=24;}
    function wrapWords(text,maxW,size,bold=false,italic=false){
      font(size,bold,italic);const words=[],lines=[];let line='';
      // Correos, radicados y palabras largas tampoco deben salirse del margen.
      for(const token of clean(text).split(/\s+/).filter(Boolean)){
        if(ctx.measureText(token).width<=maxW){words.push(token);continue;}
        let chunk='';
        for(const character of token){
          if(chunk&&ctx.measureText(chunk+character).width>maxW){words.push(chunk);chunk='';}
          chunk+=character;
        }
        if(chunk)words.push(chunk);
      }
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
        const blockH=lines.length*lh+6;
        // Cada hecho o petición numerada permanece completo en una hoja, si cabe.
        if(blockH<=CONTENT_HEIGHT)ensure(blockH);
        lines.forEach((L,li)=>{ensure(lh+4);font(size,bold,italic,color);drawJustifiedLine(L,M+indent,y,maxW,size,bold,italic,!justify||li===lines.length-1);y+=lh;});
        if(pi<paras.length-1)y+=Math.round(lh*.30);
      });y+=gap;
    }
    function centerText(text,size,bold=false,color='#073763',gap=12){
      ensure(size*2.4);font(size,bold,false,color);ctx.textAlign='center';ctx.fillText(text,W/2,y);ctx.textAlign='left';y+=Math.round(size*1.45)+gap;
    }
    function sectionTitle(t,minFollowing=106){
      // No deja títulos huérfanos al final de una página.
      ensure(66+Math.min(minFollowing,CONTENT_HEIGHT-66));
      font(24,true,false,'#073763');ctx.fillText(t,M,y);y+=37;ctx.strokeStyle='#d8e4ef';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(M,y);ctx.lineTo(W-M,y);ctx.stroke();y+=28;
    }
    function firstParagraphHeight(text,size=21){
      const first=String(text||'').split(/\n+/)[0]||'';
      return Math.min(CONTENT_HEIGHT-100,wrapWords(first,W-2*M,size).length*Math.round(size*1.60)+24);
    }
    function labelValue(label,value){
      if(!clean(value))return;
      font(20,true,false,'#073763');const labelW=ctx.measureText(label).width+12;
      const availableW=W-2*M-labelW;
      const lines=wrapWords(value,Math.max(180,availableW),20);
      ensure(lines.length*33+8);
      font(20,true,false,'#073763');ctx.fillText(label,M,y);
      lines.forEach((line,i)=>{font(20,false,false,'#192431');ctx.fillText(line,M+labelW,y);y+=33;});
    }
    function labelHeight(label,value){
      if(!clean(value))return 0;
      font(20,true);const labelW=ctx.measureText(label).width+12;
      return wrapWords(value,Math.max(180,W-2*M-labelW),20).length*33;
    }
    function recipientBlock(){
      const fields=[];
      if(clean(d.recipientName))fields.push(['Señor(a):',clean(d.recipientName)]);
      if(clean(d.recipientRole))fields.push(['Cargo / dependencia:',clean(d.recipientRole)]);
      fields.push(['Entidad:',clean(d.entity)]);
      if(clean(d.recipientEmail))fields.push(['Correo:',clean(d.recipientEmail)]);
      if(clean(d.recipientPhone))fields.push(['Celular / WhatsApp:',clean(d.recipientPhone)]);
      const rows=fields.map(([label,value])=>{
        font(18,true);const labelW=ctx.measureText(label).width+10;
        return {label,labelW,lines:wrapWords(value,W-2*M-40-labelW,18)};
      });
      const boxH=22+rows.reduce((sum,row)=>sum+row.lines.length*29+3,0)+14;
      ensure(34+boxH+18);
      font(20,true,false,'#073763');ctx.fillText('DESTINATARIO',M,y);y+=34;
      const boxY=y-22;
      ctx.fillStyle='#f5f9fd';ctx.strokeStyle='#d7e3ef';ctx.lineWidth=1.5;
      ctx.fillRect(M,boxY,W-2*M,boxH);ctx.strokeRect(M,boxY,W-2*M,boxH);
      rows.forEach(row=>{
        font(18,true,false,'#073763');ctx.fillText(row.label,M+18,y);
        row.lines.forEach(line=>{font(18,false,false,'#192431');ctx.fillText(line,M+18+row.labelW,y);y+=29;});
        y+=3;
      });
      y=boxY+boxH+32;
    }

    function phaseLabel(phase){return phase==='before'?'ANTES · Evidencia inicial':phase==='followup'?'SEGUIMIENTO · Evolución':'DESPUÉS · Resultado final';}
    function phaseColor(phase){return phase==='before'?'#0b5cad':phase==='followup'?'#f0a000':'#159447';}
    async function drawPhotoEvidence(photos){
      if(!photos.length)return;
      let currentPhase='';
      let number=0;
      for(const ph of photos){
        if(!ph?.blob)continue;
        const image=await loadBlobImage(ph.blob).catch(()=>null); if(!image)continue;
        number++;
        const maxW=W-2*M-36;
        const note=clean(ph.note);
        const noteLines=note?wrapWords(note,maxW-20,17,false,false):[];
        // Las notas excepcionalmente largas continúan fuera de la tarjeta,
        // pero nunca se pierden ni fuerzan fotografías fuera de la hoja.
        const maxCardLines=Math.max(1,Math.floor((CONTENT_HEIGHT-440)/25));
        const cardLines=noteLines.slice(0,maxCardLines),extraLines=noteLines.slice(maxCardLines);
        const maxH=Math.max(120,Math.min(490,CONTENT_HEIGHT-195-cardLines.length*25));
        const scale=Math.min(maxW/image.naturalWidth,maxH/image.naturalHeight,1.25);
        const iw=Math.round(image.naturalWidth*scale),ih=Math.round(image.naturalHeight*scale);
        const cardH=ih+108+Math.max(cardLines.length,1)*25;
        const phaseChanged=ph.phase!==currentPhase;
        ensure(cardH+26+(phaseChanged?42:0));
        if(phaseChanged){
          currentPhase=ph.phase;
          font(19,true,false,phaseColor(ph.phase));
          ctx.fillText(phaseLabel(ph.phase),M,y);y+=36;
        }
        const bx=M,by=y,bw=W-2*M,bh=cardH;
        ctx.fillStyle='#f8fbfe';ctx.strokeStyle='#d6e2ee';ctx.lineWidth=1.5;ctx.fillRect(bx,by,bw,bh);ctx.strokeRect(bx,by,bw,bh);
        const ix=M+(bw-iw)/2,iy=by+17;
        ctx.fillStyle='#fff';ctx.fillRect(ix,iy,iw,ih);ctx.drawImage(image,ix,iy,iw,ih);
        y=iy+ih+34;
        font(18,true,false,'#073763');ctx.fillText(`Evidencia fotográfica ${number}`,M+18,y);
        const dateText=clean(ph.date)?`Fecha: ${formatDate(ph.date)}`:'';
        if(dateText){font(16,false,false,'#66788b');ctx.textAlign='right';ctx.fillText(dateText,W-M-18,y);ctx.textAlign='left';}
        y+=30;
        if(cardLines.length){
          cardLines.forEach(line=>{font(17,false,false,'#34495e');ctx.fillText(line,M+18,y);y+=25;});
        }else{
          font(16,false,true,'#7a8897');ctx.fillText('Sin descripción adicional.',M+18,y);y+=25;
        }
        y=by+bh+55;
        if(extraLines.length)paragraph('Descripción de la fotografía (continuación):\n'+extraLines.join(' '),{size:17,justify:false,gap:18});
      }
    }

    newPage();
    const isGeneralRequest=d.documentType==='solicitud';
    centerText(isGeneralRequest?'SOLICITUD FORMAL':'DERECHO DE PETICIÓN',34,true,'#073763',2);
    centerText(isGeneralRequest?'Gestión y solicitud ciudadana':'Artículo 23 de la Constitución Política · Ley 1755 de 2015',17,false,'#66788b',20);
    rule();
    paragraph(`Girón, Santander, ${currentLongDate()}`,{size:20,justify:false,gap:18});
    recipientBlock();
    labelValue('Asunto:',d.subject);
    y+=5;
    paragraph(isGeneralRequest?`Yo, ${clean(d.petitionerName)}, identificado(a) con ${clean(d.petitionerId)}, presento respetuosamente ante su entidad la siguiente solicitud:`:`Yo, ${clean(d.petitionerName)}, identificado(a) con ${clean(d.petitionerId)}, actuando en nombre propio y en ejercicio del derecho fundamental de petición consagrado en el artículo 23 de la Constitución Política y desarrollado por la Ley 1755 de 2015, presento respetuosamente la siguiente solicitud:`,{size:21,gap:22,justify:true});
    sectionTitle(isGeneralRequest?'I. ANTECEDENTES':'I. HECHOS',firstParagraphHeight(d.facts)); paragraph(d.facts,{size:21,gap:24,justify:true});
    sectionTitle(isGeneralRequest?'II. SOLICITUDES':'II. PETICIONES',firstParagraphHeight(d.requests)); paragraph(d.requests,{size:21,gap:24,justify:true});
    if(!isGeneralRequest){sectionTitle('III. FUNDAMENTO');
      paragraph('La presente petición se formula con fundamento en el artículo 23 de la Constitución Política y en las disposiciones aplicables de la Ley 1755 de 2015. Solicito que la respuesta sea clara, de fondo, congruente con lo solicitado y comunicada dentro de los términos legales correspondientes.',{size:21,gap:24,justify:true});}
    if(clean(d.attachments)||evidencePhotos.length){
      sectionTitle('IV. ANEXOS / EVIDENCIAS');
      if(clean(d.attachments))paragraph(d.attachments,{size:21,gap:18,justify:true});
      if(evidencePhotos.length){
        paragraph(`Se incorporan ${evidencePhotos.length} fotografía(s) registradas en la necesidad como evidencia visual.`,{size:18,italic:true,color:'#66788b',gap:18,justify:false});
        await drawPhotoEvidence(evidencePhotos);
      }
    }
    // Notificaciones y firma forman el cierre del mismo escrito; evitar una
    // página casi vacía donde aparezca únicamente la firma.
    const sig=await loadImage(d.signature);
    const sigScale=Math.min(330/sig.naturalWidth,175/sig.naturalHeight);
    const sigW=Math.round(sig.naturalWidth*sigScale),sigH=Math.round(sig.naturalHeight*sigScale);
    const signatureNote=d.signatureKind==='ivan-escaneada'?'Firma escaneada de Iván Ortiz incorporada con autorización declarada':'Firma manuscrita electrónica incorporada al PDF';
    const internalReference=`Referencia interna: ${clean(d.need.code)} · ${clean(d.need.territory)} · ${clean(d.need.title)}`;
    const closingHeight=34+8+sigH+4+
      wrapWords(clean(d.petitionerName),W-2*M,21,true).length*34+
      wrapWords(`C.C. ${clean(d.petitionerId)}`,W-2*M,19).length*30+2+
      wrapWords(signatureNote,W-2*M,15,false,true).length*24+12+24+
      wrapWords(internalReference,W-2*M,14,false,true).length*22+20;
    const notificationHeight=labelHeight('Dirección:',d.address)+labelHeight('Teléfono:',d.phone)+labelHeight('Correo electrónico:',d.email)+12;
    const hasRadicado=Boolean(clean(d.radicado)||clean(d.radicadoDate));
    const radicadoHeight=hasRadicado?65+labelHeight('Radicado:',d.radicado)+labelHeight('Fecha de radicación:',formatDate(d.radicadoDate))+10:0;
    sectionTitle('V. NOTIFICACIONES',notificationHeight+radicadoHeight+closingHeight);
    labelValue('Dirección:',d.address);labelValue('Teléfono:',d.phone);labelValue('Correo electrónico:',d.email);y+=12;
    if(hasRadicado){sectionTitle('VI. DATOS DE RADICACIÓN');labelValue('Radicado:',d.radicado);labelValue('Fecha de radicación:',formatDate(d.radicadoDate));y+=10;}
    // Firma, aclaración, cédula y referencia final deben terminar juntas.
    ensure(Math.min(CONTENT_HEIGHT-1,closingHeight));
    paragraph('Cordialmente,',{size:21,justify:false,gap:8});
    ctx.drawImage(sig,M,y,sigW,sigH);y+=sigH+4;
    paragraph(clean(d.petitionerName),{size:21,bold:true,justify:false,gap:0});
    paragraph(`C.C. ${clean(d.petitionerId)}`,{size:19,justify:false,gap:2});
    paragraph(signatureNote,{size:15,italic:true,color:'#66788b',justify:false,gap:12});
    rule();
    paragraph(internalReference,{size:14,italic:true,color:'#66788b',justify:false,gap:0});

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
