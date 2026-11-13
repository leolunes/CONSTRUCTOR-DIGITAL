/* ============================================================
   Derecho de Petición por necesidad · v1.0.34
   Módulo aislado: no modifica el motor base app.js.
   PDF institucional con fotografía de Marco Andrés Silva López, texto justificado,
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
  const marcoTouchConsent = document.getElementById('petitionMarcoTouchConsent');
  const marcoTouchConsentLabel = document.getElementById('petitionMarcoTouchConsentLabel');
  const signatureCanvasTitle = document.getElementById('petitionSignCanvasTitle');
  const signatureCanvasHint = document.getElementById('petitionSignCanvasHint');
  const personalUploadLabel = document.getElementById('petitionPersonalSignatureUploadLabel');
  const recipientPrefillStatus = document.getElementById('petitionRecipientPrefillStatus');
  const GENERAL_ID='__solicitud_libre_ivan_v1__';
  const GENERAL_NEED={id:GENERAL_ID,code:'SOLICITUD-LIBRE',title:'Solicitud general de Marco Andrés Silva López',territory:'Santander',sector:'Gestión territorial'};
  let authorizedSignature=null;
  let manualPetitionerName='';
  let drawing = false;
  let last = null;
  let lastGenerated = null;
  // Un PDF archivado conserva su contenido original. Para editarlo, se crea una
  // nueva versión desde los datos disponibles, con firma y autorización nuevas.
  const REBUILD_NEED_PREFIX='__petition_archive_rebuild__:';
  let rebuildNeed=null, rebuildSourceRecord=null;
  let originalPreviewUrl=null;
  let newDesignPreviewUrl=null;
  const DRAFT_FIELDS=[
    'documentType','recipientName','recipientRole','entity','recipientEmail',
    'recipientPhone','recipientAddress','petitionerName','petitionerId',
    'address','phone','email','subject','facts','requests','attachments'
  ];
  function archiveDraft(data){
    const draft={};
    DRAFT_FIELDS.forEach(k=>{draft[k]=clean(data?.[k]);});
    return draft;
  }

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

  const DOC_DB_NAME='matriz_floridablanca_documents_v1', DOC_STORE='petitionPdfs';
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

  const PHOTO_DB_NAME='matriz_floridablanca_photos_v2', PHOTO_STORE='photos';
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

  function getNeed(id){
    if(id===GENERAL_ID)return GENERAL_NEED;
    if(rebuildNeed && id===rebuildNeed.id)return rebuildNeed;
    return db.needs.find(n => n.id === id);
  }
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

  // Único punto de autocompletado: desde directorio o selección de uno o varios destinatarios.
  function setRecipientFromDirectory(r,{multiple=false}={}){
    if(!r)return;
    const entity=clean(r.entity||r.n), name=clean(r.recipientName||r.contact), role=clean(r.recipientRole||r.role);
    const fields={
      entity,
      recipientName:name||'A quien corresponda',
      recipientRole:role||(name&&name!=='A quien corresponda'?'Responsable institucional':'Funcionario(a) competente'),
      recipientEmail:clean(r.email||r.recipientEmail),
      recipientPhone:clean(r.phone||r.recipientPhone),
      recipientAddress:clean(r.address||r.recipientAddress)
    };
    Object.entries(fields).forEach(([field,value])=>{if(form.elements[field])form.elements[field].value=value;});
    if(recipientPrefillStatus){
      const missing=[];
      if(!fields.recipientEmail)missing.push('correo');
      if(!fields.recipientPhone)missing.push('teléfono');
      if(!fields.recipientAddress)missing.push('dirección');
      recipientPrefillStatus.hidden=false;
      recipientPrefillStatus.textContent=`✓ Datos traídos del Directorio: ${entity||'entidad seleccionada'}.${multiple?' En el formulario se muestra el primer destinatario; se generará un PDF individual por cada entidad seleccionada.':''}${missing.length?' No figuran en el directorio: '+missing.join(', ')+'. Puede completarlos manualmente.':''}`;
    }
    lastGenerated=null;
  }
  function clearRecipientNotice(){if(recipientPrefillStatus){recipientPrefillStatus.hidden=true;recipientPrefillStatus.textContent='';}}
  function openPetition(needId, signerChoice="personal"){
    const n = getNeed(needId); if (!n) return;
    rebuildSourceRecord=null;
    cleanRebuildPreview();
    if(window.clearBatchRecipients) window.clearBatchRecipients('petition');
    const l = getLeader(n);
    form.reset();
    lastGenerated = null;
    form.elements.needId.value = n.id;
    if(form.elements.vereda) form.elements.vereda.value = n.id===GENERAL_ID ? 'Solicitud sin necesidad registrada' : (clean(n.vereda) || 'Sin vereda asignada');
    clearRecipientNotice();
    form.elements.recipientName.value = '';
    form.elements.recipientRole.value = '';
    form.elements.entity.value = clean(n.competentEntity);
    form.elements.recipientEmail.value = '';
    form.elements.recipientPhone.value = '';
    form.elements.recipientAddress.value = '';
    const institutionPrefill = window.__petitionInstitutionPrefill || null;
    if(institutionPrefill){
      setRecipientFromDirectory(institutionPrefill);
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
    document.getElementById('petitionNeedSummary').textContent = n.id===GENERAL_ID ? 'Solicitud sin necesidad registrada · Marco Andrés Silva López' : `${n.code} · ${n.territory || 'Sin territorio'} · ${n.title || 'Necesidad'}`;
    docTypeControl.value=n.id===GENERAL_ID ? 'solicitud' : 'peticion';
    manualPetitionerName=clean(form.elements.petitionerName.value);
    signerModeControl.value=signerChoice;
    clearSignature();
    if(ivanConsent)ivanConsent.checked=false;
    if(marcoTouchConsent)marcoTouchConsent.checked=false;
    modal.classList.add('open');
    updateSignerMode(false);
    setTimeout(resizeSignatureCanvas, 80);
    if(signerChoice==='ivan')refreshAuthorizedSignature();
  }

  function cleanRebuildPreview(){
    document.getElementById('petitionRebuildWorkspace')?.remove();
    document.getElementById('petitionArchiveRebuildNote')?.remove();
    modal.classList.remove('petition-rebuild-mode');
    if(originalPreviewUrl){URL.revokeObjectURL(originalPreviewUrl);originalPreviewUrl=null;}
    if(newDesignPreviewUrl){URL.revokeObjectURL(newDesignPreviewUrl);newDesignPreviewUrl=null;}
    const primary=form.querySelector('button[type="submit"]');
    if(primary&&primary.dataset.oldLabel){primary.textContent=primary.dataset.oldLabel;delete primary.dataset.oldLabel;}
  }
  function closePetition(){ modal.classList.remove('open');cleanRebuildPreview();rebuildSourceRecord=null;const title=modal.querySelector('.modal-head h3');if(title)title.textContent='Generar documento'; }

  document.getElementById('newIvanFreeRequestBtn')?.addEventListener('click',()=>{
    centerModal?.classList.remove('open');
    openPetition(GENERAL_ID,'marco_touch');
  });
  window.openPetitionForNeed = openPetition;
  window.setPetitionInstitution = data => { window.__petitionInstitutionPrefill = data || null; };
  const updatePetitionBatchCount=()=>{
    const rows=window.__batchRecipients?.petition||[],el=document.getElementById('petitionBatchCount');
    if(el)el.textContent=rows.length?`${rows.length} destinatario${rows.length===1?'':'s'} seleccionado${rows.length===1?'':'s'}`:'Sin selección múltiple';
  };
  window.addEventListener('batch-recipients-changed',e=>{
    if(e.detail?.mode!=='petition')return;
    updatePetitionBatchCount();
    const rows=e.detail.recipients||[];
    if(rows.length&&modal.classList.contains('open'))setRecipientFromDirectory(rows[0],{multiple:rows.length>1});
    else if(!rows.length&&modal.classList.contains('open'))clearRecipientNotice();
  });

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
      centerList.innerHTML = '<div class="petition-center-empty"><strong>Aún no hay necesidades registradas.</strong><br>También puede preparar una solicitud libre de Marco Andrés Silva López con el botón superior.</div>';
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
      const radStatus=r.presentationCopy?`<span class="petition-doc-status pending">📋 Copia de consulta · No radicada</span>`:rad?`<span class="petition-doc-status assigned">🟢 Radicado: ${escLocal(rad)}</span>`:`<span class="petition-doc-status pending">🟡 Pendiente de radicado</span>`;
      // Solo un PDF realmente generado desde el formulario se considera rediseñado.
      const latest=archiveCache.filter(c=>c.sourceArchiveId===r.id&&!c.presentationCopy&&c.blob&&['1.0.31','1.0.32','1.0.33'].includes(clean(c.templateVersion)))
        .sort((a,b)=>String(b.generatedAt||'').localeCompare(String(a.generatedAt||'')))[0];
      const isRedesigned=Boolean(r.sourceArchiveId&&!r.presentationCopy&&r.draft&&['1.0.31','1.0.32','1.0.33'].includes(clean(r.templateVersion)));
      const viewLabel=r.presentationCopy?'Abrir copia antigua':isRedesigned?'Abrir PDF nuevo':'Abrir PDF original (sin cambios)';
      const remakeLabel=isRedesigned?'Editar y generar otra versión':'✦ CREAR NUEVO PDF con el diseño aprobado';
      const latestButton=latest?`<button type="button" class="petition-newest-btn" data-doc-view="${escLocal(latest.id)}">✓ Abrir versión rediseñada</button>`:'';
      return `<article class="petition-archive-item"><div class="petition-archive-main"><div class="petition-archive-icon">PDF</div><div><strong>${r.type==='solicitud'?'Solicitud':'Derecho de petición'} · ${escLocal(r.needCode||'SIN-CÓDIGO')} · ${escLocal(r.needTitle||'Documento')}</strong><small><b>Generado:</b> ${escLocal(formatGeneratedAt(r.generatedAt))}</small><small><b>Destinatario:</b> ${escLocal(r.recipientName||'Sin nombre')} · ${escLocal(r.entity||'Sin entidad')}</small><small><b>Asunto:</b> ${escLocal(r.subject||'')}</small>${r.vereda?`<small><b>Vereda:</b> ${escLocal(r.vereda)}</small>`:''}<div class="petition-doc-status-row">${radStatus}<span class="petition-send-row-status">${escLocal(petitionSendStatusText(r))}</span></div><small class="petition-archive-file">${escLocal(r.filename||'documento.pdf')}</small>${r.presentationCopy?'<small class="petition-remake-label">Copia visual para consulta · No sustituye el original firmado</small>':r.sourceArchiveId?'<small class="petition-remake-label">Nueva versión de un documento anterior · Sin radicación ni envío automático</small>':''}</div></div><div class="petition-archive-buttons"><button type="button" data-doc-view="${escLocal(r.id)}">${viewLabel}</button>${latestButton}<button type="button" class="petition-remake-btn" data-doc-remake="${escLocal(r.id)}">${remakeLabel}</button>${r.presentationCopy?'':`<button type="button" data-doc-radicado="${escLocal(r.id)}">✏️ ${rad?'Editar':'Registrar'} radicado</button><button type="button" data-doc-email="${escLocal(r.id)}">📤 Enviar</button>`}<button type="button" data-doc-download="${escLocal(r.id)}">⬇ PDF</button><button type="button" class="danger" data-doc-delete="${escLocal(r.id)}">🗑</button></div></article>`;
    }).join('');
    archiveList.querySelectorAll('[data-doc-view]').forEach(b=>b.addEventListener('click',()=>viewArchivedPDF(b.dataset.docView)));
    archiveList.querySelectorAll('[data-doc-remake]').forEach(b=>b.addEventListener('click',()=>rebuildArchivedPDF(b.dataset.docRemake)));
    // La copia visual ya no se ofrece: no permite rehacer tipografía ni estructura de un PDF rasterizado.
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
  async function rebuildArchivedPDF(id){
    try{
      // El botón pasa SIEMPRE el ID del registro visible. Los archivos antiguos pueden
      // conservar solo una copia visual cuyo original ya no existe en IndexedDB.
      let selected=archiveCache.find(x=>String(x.id)===String(id))||await getPDFRecord(id);
      if(!selected){
        archiveCache=await getPDFRecords();
        selected=archiveCache.find(x=>String(x.id)===String(id));
      }
      if(!selected){
        alert('Este registro no se encuentra en el archivo local. Abra de nuevo el Archivo de PDF y verifique su respaldo integral.');
        return;
      }
      let r=selected;
      let missingOriginal=false;
      if(selected.presentationCopy && selected.sourceArchiveId){
        // Preferir el original solo cuando verdaderamente existe. No bloquear la
        // reedición si solo ha sobrevivido la copia de consulta seleccionada.
        const original=archiveCache.find(x=>String(x.id)===String(selected.sourceArchiveId))||
          await getPDFRecord(selected.sourceArchiveId);
        if(original)r=original;
        else missingOriginal=true;
      }
      // Abrir un editor de NUEVA VERSIÓN, no el PDF anterior.
      const existingNeed=r.needId&&getNeed(r.needId);
      const n=existingNeed||{
        id:REBUILD_NEED_PREFIX+r.id,
        code:clean(r.needCode)||'DOCUMENTO-ARCHIVADO',
        title:clean(r.needTitle)||'Documento recuperado del archivo',
        territory:clean(r.territory)||'Floridablanca',
        vereda:clean(r.vereda),sector:clean(r.sector),evidence:''
      };
      rebuildNeed=existingNeed?null:n;
      const signer=r.signatureKind==='ivan-escaneada'?'ivan':
        r.signatureKind==='marco-manuscrita-en-pantalla'?'marco_touch':'personal';
      archiveModal?.classList.remove('open');
      openPetition(n.id,signer);
      rebuildSourceRecord=r;
      const draft=r.draft||{};
      const values={
        documentType:r.type==='solicitud'?'solicitud':'peticion',
        recipientName:r.recipientName,recipientRole:r.recipientRole,entity:r.entity,
        recipientEmail:r.recipientEmail,recipientPhone:r.recipientPhone,
        recipientAddress:r.recipientAddress,petitionerName:r.petitionerName,
        petitionerId:r.petitionerId,subject:r.subject,
        facts:'',requests:'',attachments:'',address:'',phone:'',email:'',
        ...draft
      };
      DRAFT_FIELDS.forEach(field=>{
        if(form.elements[field] && field!=='documentType' && field!=='petitionerName')
          form.elements[field].value=clean(values[field]);
      });
      if(form.elements.documentType)form.elements.documentType.value=values.documentType;
      if(form.elements.petitionerName)form.elements.petitionerName.value=clean(values.petitionerName);
      if(signer==='ivan'||signer==='marco_touch')form.elements.petitionerName.value='MARCO ANDRÉS SILVA LÓPEZ';
      form.elements.radicado.value='';form.elements.radicadoDate.value='';
      if(ivanConsent)ivanConsent.checked=false;
      if(marcoTouchConsent)marcoTouchConsent.checked=false;
      clearSignature();lastGenerated=null;

      const missing = [
        ['Hechos',values.facts],['Peticiones',values.requests],
        ['Cédula',values.petitionerId],['Dirección de notificación',values.address],
        ['Correo de notificación',values.email]
      ].filter(([,v])=>!clean(v)).map(([label])=>label);
      const full=missing.length===0;
      const workspace=document.createElement('section');
      workspace.id='petitionRebuildWorkspace';
      workspace.className='petition-rebuild-workspace';
      workspace.innerHTML=`<div class="petition-rebuild-info" role="status">
        <strong>✦ Está preparando un PDF NUEVO, con el diseño aprobado</strong>
        <p><b>El documento guardado aún NO ha cambiado.</b> Aquí verá una vista previa de la plantilla nueva. La firma del archivo anterior no se reutiliza; para archivar un PDF actualizado, revise el texto y firme nuevamente.</p>
        ${missingOriginal?'<p class="petition-rebuild-missing"><strong>Solo está disponible esta copia visual.</strong> El PDF original referenciado ya no figura en el archivo local. Se recuperaron los datos generales de la copia seleccionada. Puede consultarla y completar manualmente el contenido pendiente; no se borrará ni se reemplazará.</p>':''}
        ${full?'<p class="petition-rebuild-ready">✓ Se recuperaron los datos principales. Revise y firme.</p>':`<p class="petition-rebuild-missing">⚠ Información que el archivo antiguo NO conservó como formulario: <b>${escLocal(missing.join(', '))}</b>. Complétela a la izquierda consultando el original si es necesario.</p>`}
        <div class="petition-rebuild-buttons">
          <button type="button" id="petitionRebuildRefresh" class="primary">↻ Actualizar vista del NUEVO diseño</button>
          <button type="button" id="petitionRebuildOpenOriginal" class="secondary">↗ ${missingOriginal?'Consultar copia disponible':'Abrir PDF antiguo aparte'}</button>
          <button type="button" id="petitionRebuildBackArchive" class="secondary">Volver al archivo</button>
        </div>
      </div>
      <div class="petition-rebuild-preview" id="petitionRebuildPreview">
        <div class="petition-rebuild-preview-title">✓ VISTA PREVIA DEL NUEVO DISEÑO · No es un PDF firmado</div>
        <p class="petition-rebuild-preview-note">Esta vista usa la nueva plantilla. Los campos pendientes se muestran como «POR COMPLETAR». No se archiva hasta que pulse «Generar PDF nuevo firmado» al final del formulario.</p>
        <iframe id="petitionRebuildNewFrame" title="Vista previa PDF con el diseño nuevo, sin firma"></iframe>
      </div>
      <details class="petition-rebuild-old" id="petitionRebuildOldPanel">
        <summary>${missingOriginal?'Consultar aquí la copia visual guardada':'Consultar aquí el PDF original (con diseño antiguo)'}</summary>
        <iframe id="petitionRebuildFrame" title="PDF original guardado, sin modificaciones"></iframe>
      </details>`;
      form.parentNode.insertBefore(workspace,form);
      modal.classList.add('petition-rebuild-mode');
      modal.querySelector('.modal-head h3').textContent='Recrear documento · diseño aprobado';
      const primary=form.querySelector('button[type="submit"]');
      if(primary){primary.dataset.oldLabel=primary.textContent;primary.textContent='✓ Generar PDF NUEVO firmado y archivarlo';}
      // El PDF original no se enseña como resultado principal: se consulta solo al pedirlo.
      const src=r.blob instanceof Blob?r.blob:(r.blob?new Blob([r.blob],{type:'application/pdf'}):null);
      if(src?.size){originalPreviewUrl=URL.createObjectURL(src);document.getElementById('petitionRebuildFrame').src=originalPreviewUrl+'#toolbar=0&navpanes=0';}
      else {document.getElementById('petitionRebuildOldPanel').hidden=true;}
      document.getElementById('petitionRebuildOpenOriginal').onclick=()=>{
        if(src?.size)viewArchivedPDF(r.id);
        else alert('Los datos generales se recuperaron, pero el PDF de esta copia no está disponible en el archivo local.');
      };
      document.getElementById('petitionRebuildBackArchive').onclick=()=>{closePetition();openPetitionArchive();};
      const newPreviewFrame=document.getElementById('petitionRebuildNewFrame');
      const previewButton=document.getElementById('petitionRebuildRefresh');
      let previewSequence=0;
      const updateNewDesignPreview=async()=>{
        const seq=++previewSequence;
        previewButton.disabled=true;
        previewButton.textContent='Preparando vista del diseño nuevo...';
        try{
          const fd=Object.fromEntries(new FormData(form).entries());
          // Solo para la vista previa: no fabricar contenido que vaya a guardarse.
          const preview={...fd,need:n,signature:null,previewOnly:true,
            recipientName:clean(fd.recipientName)||'A QUIEN CORRESPONDA',
            entity:clean(fd.entity)||'ENTIDAD POR COMPLETAR',
            petitionerName:clean(fd.petitionerName)||'NOMBRE POR COMPLETAR',
            petitionerId:clean(fd.petitionerId)||'POR COMPLETAR',
            subject:clean(fd.subject)||'ASUNTO POR COMPLETAR',
            facts:clean(fd.facts)||'HECHOS POR COMPLETAR — revise el PDF original',
            requests:clean(fd.requests)||'PETICIONES POR COMPLETAR — revise el PDF original'};
          const blob=await buildPetitionPDF(preview);
          if(!document.getElementById('petitionRebuildNewFrame')||seq!==previewSequence)return;
          if(newDesignPreviewUrl)URL.revokeObjectURL(newDesignPreviewUrl);
          newDesignPreviewUrl=URL.createObjectURL(blob);
          newPreviewFrame.src=newDesignPreviewUrl+'#toolbar=0&navpanes=0';
        }catch(err){console.error(err);newPreviewFrame.removeAttribute('src');
          document.getElementById('petitionRebuildPreview').querySelector('.petition-rebuild-preview-note').textContent='No fue posible generar la vista previa: '+err.message;
        }finally{previewButton.disabled=false;previewButton.textContent='↻ Actualizar vista del NUEVO diseño';}
      };
      previewButton.onclick=updateNewDesignPreview;
      requestAnimationFrame(()=>{resizeSignatureCanvas();workspace.scrollIntoView({block:'start'});updateNewDesignPreview();});

    }catch(err){console.error(err);alert('No fue posible recuperar los datos del documento: '+err.message);}
  }

  async function decodeArchivedJpegs(blob){
    // Los PDF antiguos de esta matriz contienen las hojas como imágenes JPEG.
    // Se extraen SIN OCR ni cambios en el texto o en la firma ya visible.
    if(!blob)throw new Error('No está disponible el archivo PDF original.');
    const bytes=new Uint8Array(await blob.arrayBuffer());
    const textBytes=new TextDecoder('latin1').decode(bytes);
    const rx=/\/Subtype\s*\/Image\b[^>]*?\/Width\s+(\d+)[^>]*?\/Height\s+(\d+)[^>]*?\/Length\s+(\d+)\s*>>\s*stream\r?\n/g;
    const images=[];let m;
    while((m=rx.exec(textBytes))!==null){
      const width=Number(m[1]),height=Number(m[2]),length=Number(m[3]),offset=rx.lastIndex;
      if(length<128||length>50_000_000||width<200||height<200)continue;
      const jpeg=bytes.slice(offset,offset+length);
      if(jpeg[0]!==0xff||jpeg[1]!==0xd8)continue;
      const url=URL.createObjectURL(new Blob([jpeg],{type:'image/jpeg'}));
      try{
        const img=await new Promise((resolve,reject)=>{const el=new Image();el.onload=()=>resolve(el);el.onerror=()=>reject(new Error('Imagen PDF ilegible'));el.src=url;});
        images.push(img);
      }finally{URL.revokeObjectURL(url)}
      rx.lastIndex=offset+length;
    }
    if(!images.length)throw new Error('El PDF no tiene páginas JPEG reconocibles. Use «Rehacer con diseño nuevo» para consultar su contenido y preparar otro escrito.');
    return images;
  }
  async function remasterArchivedPDF(id){
    const r=archiveCache.find(x=>x.id===id)||await getPDFRecord(id);
    if(!r?.blob){alert('No se encontró el PDF original en el archivo.');return;}
    if(!confirm('Se preparará una COPIA VISUAL de consulta, no una remaquetación del texto. Para obtener el diseño aprobado debe usar «Recrear editable con diseño aprobado» y completar el contenido que no esté guardado. Se conservará todo el contenido visible del PDF anterior, incluida la imagen de su firma, sin editar el texto. NO es una nueva firma, un documento nuevamente autorizado ni reemplaza el original radicado. ¿Desea crear esta copia de presentación?'))return;
    try{
      const images=await decodeArchivedJpegs(r.blob);
      const photo=await loadImage('assets/marco-andres-silva-lopez.jpeg').catch(()=>null);
      const W=1240,H=1754,margin=62,headerH=190,footerH=72;
      const jpegs=[];
      for(let i=0;i<images.length;i++){
        const im=images[i];const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
        const cx=canvas.getContext('2d');cx.fillStyle='#fbfcf8';cx.fillRect(0,0,W,H);
        const soft=cx.createLinearGradient(0,0,0,headerH);soft.addColorStop(0,'#075638');soft.addColorStop(1,'#0a6a45');
        cx.fillStyle=soft;cx.fillRect(0,0,W,headerH);cx.fillStyle='#f2c14e';cx.fillRect(0,headerH-5,W,5);
        // título y subtítulo
        cx.textAlign='left';cx.fillStyle='#ffffff';cx.font='bold 31px Arial';cx.fillText(r.type==='solicitud'?'SOLICITUD CIUDADANA':'DERECHO DE PETICIÓN',margin,64);
        cx.font='21px Arial';cx.fillStyle='#e6f1e7';cx.fillText('Floridablanca · Copia visual para consulta',margin,103);
        // foto + nombre
        if(photo){
          const px=W-370,py=32,pr=44;
          cx.save();cx.beginPath();cx.arc(px,py+pr,pr,0,Math.PI*2);cx.clip();cx.drawImage(photo,px-pr,py,pr*2,pr*2);cx.restore();
          cx.lineWidth=3;cx.strokeStyle='#f2c14e';cx.beginPath();cx.arc(px,py+pr,pr+2,0,Math.PI*2);cx.stroke();
          cx.strokeStyle='rgba(255,255,255,.75)';cx.lineWidth=2;cx.beginPath();cx.moveTo(px+60,38);cx.lineTo(px+60,120);cx.stroke();
          cx.fillStyle='#ffffff';cx.font='700 26px Arial';cx.fillText('MARCO ANDRÉS',px+85,66);
          cx.fillStyle='#f2c14e';cx.fillText('SILVA LÓPEZ',px+85,101);
        }else{
          cx.textAlign='right';cx.font='bold 26px Arial';cx.fillStyle='#ffffff';cx.fillText('MARCO ANDRÉS',W-margin,64);cx.fillStyle='#f2c14e';cx.fillText('SILVA LÓPEZ',W-margin,100);cx.textAlign='left';
        }
        // cuerpo antiguo recortado, sin recuadro pegado
        const cutTop=im.naturalHeight*(188/1754),cutBottom=im.naturalHeight*(94/1754);
        const srcH=Math.max(1,im.naturalHeight-cutTop-cutBottom);
        const dx=42,dy=214,dw=W-84,dh=H-dy-footerH-63;
        cx.fillStyle='#ffffff';cx.fillRect(dx,dy,dw,dh);
        cx.drawImage(im,0,cutTop,im.naturalWidth,srcH,dx,dy,dw,dh);
        // pie institucional inferior
        cx.fillStyle='#0a6a45';cx.fillRect(0,H-footerH,W,footerH);
        cx.fillStyle='#f2c14e';cx.fillRect(0,H-footerH,W,4);
        cx.save();cx.strokeStyle='#f5cf72';cx.lineWidth=3;
        const leafX=W/2-175,leafY=H-36;
        cx.beginPath();cx.moveTo(leafX,leafY+8);cx.lineTo(leafX,leafY-11);cx.stroke();
        cx.beginPath();cx.moveTo(leafX,leafY+3);cx.quadraticCurveTo(leafX-21,leafY-20,leafX-27,leafY-18);cx.quadraticCurveTo(leafX-21,leafY+5,leafX,leafY+8);cx.stroke();
        cx.beginPath();cx.moveTo(leafX,leafY+3);cx.quadraticCurveTo(leafX+21,leafY-20,leafX+27,leafY-18);cx.quadraticCurveTo(leafX+21,leafY+5,leafX,leafY+8);cx.stroke();cx.restore();
        cx.fillStyle='#ffffff';cx.font='italic bold 23px Georgia';cx.textAlign='center';cx.fillText('Floridablanca, nuestra casa',W/2+38,H-27);
        cx.textAlign='left';cx.font='14px Arial';cx.fillStyle='#536b60';cx.fillText('Copia visual de consulta · El texto antiguo no fue remaquetado',margin,H-footerH-20);
        cx.textAlign='right';cx.fillText(`Página ${i+1} de ${images.length}`,W-margin,H-footerH-20);cx.textAlign='left';
        jpegs.push(dataUrlBytes(canvas.toDataURL('image/jpeg',.93)));
      }
      const out=pdfFromJpegs(jpegs,1240,1754);
      const copy={...r,id:uidLocal(),generatedAt:new Date().toISOString(),
        filename:'COPIA-VISUAL-RENOVADA-'+(clean(r.needCode)||'DOCUMENTO').replace(/[^A-Za-z0-9_-]+/g,'-')+'-'+todayISO()+'.pdf',
        blob:out,size:out.size,presentationCopy:true,sourceArchiveId:r.id,
        radicado:'',radicadoDate:'',sentAt:null,sentTo:null,sendPreparedAt:null,sendPreparedTo:null,
        templateVersion:'1.0.33',draft:null};
      await savePDFRecord(copy);
      archiveCache=await getPDFRecords();renderArchiveList();await refreshArchiveCount();
      downloadPDF(out,copy.filename);
      alert('Se creó y archivó una copia visual de consulta. El diseño interior de un PDF antiguo no se puede reconstruir a partir de una imagen. Su contenido y la firma permanecen como imagen del original; no constituye un nuevo derecho de petición firmado. El original no se alteró.');
    }catch(e){console.error(e);alert('No se pudo producir la copia visual: '+e.message);}
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
  const IVAN_SIG_DB='matriz_floridablanca_private_signatures_v1', IVAN_SIG_STORE='signatures';
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
      const req=operation==='get'?st.get('marco-andres-silva-lopez'):operation==='put'?st.put(record):st.delete('marco-andres-silva-lopez');
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
      : 'No hay firma de Marco Andrés Silva López guardada en este navegador. Pulse «Registrar / actualizar» y seleccione la imagen escaneada.';
    lastGenerated=null;
  }
  async function refreshAuthorizedSignature(){
    if(ivanStatus)ivanStatus.textContent='Consultando firma local...';
    try{authorizedSignature=await signatureRecord('get')||null;showIvanSignatureState();}
    catch(err){console.error(err);if(ivanStatus)ivanStatus.textContent='No se puede acceder al almacenamiento local de firmas: '+err.message;}
  }
  function updateSignerMode(fromChoice=true){
    const isIvan=signerModeControl?.value==='ivan';
    const isMarcoTouch=signerModeControl?.value==='marco_touch';
    const isMarco=isIvan||isMarcoTouch;
    if(isMarco){
      if(fromChoice&&!clean(form.elements.petitionerName.value).toUpperCase().includes('MARCO ANDRÉS'))manualPetitionerName=clean(form.elements.petitionerName.value);
      form.elements.petitionerName.value='MARCO ANDRÉS SILVA LÓPEZ';
    }else if(fromChoice){form.elements.petitionerName.value=manualPetitionerName;}
    form.elements.petitionerName.readOnly=isMarco;
    if(ivanPanel)ivanPanel.hidden=!isIvan;
    if(personalPanel)personalPanel.hidden=isIvan;
    if(ivanConsent)ivanConsent.checked=false;
    if(marcoTouchConsentLabel)marcoTouchConsentLabel.hidden=!isMarcoTouch;
    if(marcoTouchConsent)marcoTouchConsent.checked=false;
    if(personalUploadLabel)personalUploadLabel.hidden=isMarcoTouch;
    if(signatureCanvasTitle)signatureCanvasTitle.textContent=isMarcoTouch?'✍️ Firma manuscrita de Marco Andrés en pantalla':'Firma del peticionario';
    if(signatureCanvasHint)signatureCanvasHint.textContent=isMarcoTouch?'Pida a Marco que firme aquí con el dedo, lápiz táctil o mouse. La firma no se conserva para reutilizarla: se inserta únicamente en el documento autorizado.':'Firme con el dedo, lápiz táctil o mouse, o cargue una firma escaneada.';
    clearSignature();
    lastGenerated=null;
    if(isIvan)refreshAuthorizedSignature();
    else requestAnimationFrame(resizeSignatureCanvas);
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
      const rec={id:'marco-andres-silva-lopez',dataUrl,fileName:file.name,savedAt:new Date().toISOString()};
      await signatureRecord('put',rec);
      authorizedSignature=rec;
      showIvanSignatureState();
      if(ivanConsent)ivanConsent.checked=false;
    }catch(err){alert('No fue posible registrar la firma: '+err.message);}
    finally{ivanFile.value='';}
  });
  ivanRemove?.addEventListener('click',async()=>{
    if(!confirm('¿Eliminar de este navegador la firma escaneada guardada de Marco Andrés Silva López? No elimina los PDF existentes.'))return;
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
      const copy=document.createElement('canvas');copy.width=signCanvas.width;copy.height=signCanvas.height;
      if(signatureHasInk)copy.getContext('2d').drawImage(signCanvas,0,0);
      signCanvas.width = w; signCanvas.height = h;
      const ctx = signCanvas.getContext('2d');
      ctx.fillStyle='#fff'; ctx.fillRect(0,0,w,h);
      if(signatureHasInk)ctx.drawImage(copy,0,0,w,h);
      ctx.strokeStyle='#075638'; ctx.lineWidth=3*ratio; ctx.lineCap='round'; ctx.lineJoin='round';
      lastGenerated=null;
    }
  }
  window.addEventListener('resize', () => { if(modal.classList.contains('open')) resizeSignatureCanvas(); });

  function clearSignature(){
    const ctx=signCanvas.getContext('2d');
    ctx.fillStyle='#fff'; ctx.fillRect(0,0,signCanvas.width,signCanvas.height);
    ctx.strokeStyle='#075638'; ctx.lineWidth=3*Math.min(window.devicePixelRatio||1,2); ctx.lineCap='round'; ctx.lineJoin='round';
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
    if(signerModeControl?.value==='marco_touch'){signatureUpload.value='';alert('Para firmar como Marco Andrés, use el recuadro táctil.');return;}
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
    const ctx=signCanvas.getContext('2d');ctx.beginPath();ctx.arc(last.x,last.y,Math.max(ctx.lineWidth/2,1.5),0,Math.PI*2);ctx.fillStyle='#075638';ctx.fill();lastGenerated=null;
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
    const isMarcoTouch=signerModeControl?.value==='marco_touch';
    if(isIvan && !authorizedSignature?.dataUrl){alert('Primero registre la firma escaneada de Marco Andrés Silva López en este navegador.');return null;}
    if(isIvan && !ivanConsent?.checked){alert('Confirme la autorización de Marco Andrés Silva López para usar su firma en este documento.');return null;}
    if(isMarcoTouch && !marcoTouchConsent?.checked){alert('Confirme la autorización de Marco Andrés Silva López para la firma táctil de este documento específico.');return null;}
    if(!isIvan && !signatureHasInk){alert('Firme en el recuadro táctil o cargue su firma antes de generar el PDF.');return null;}
    const fd=Object.fromEntries(new FormData(form).entries());
    const n=getNeed(fd.needId); if(!n) return null;
    if(!clean(fd.entity)){ alert('Indique la entidad donde trabaja la persona destinataria.'); return null; }
    if(!clean(fd.recipientName)){ alert('Indique el nombre de la persona destinataria.'); return null; }
    return {fd,n,signature:isIvan?authorizedSignature.dataUrl:signCanvas.toDataURL('image/png'), signatureKind:isIvan?'ivan-escaneada':isMarcoTouch?'marco-manuscrita-en-pantalla':'personal'};
  }

  function tracePetition(data){
    const {fd,n}=data;
    if(n?.id===GENERAL_ID||String(n?.id||'').startsWith(REBUILD_NEED_PREFIX))return;
    n.petitions = Array.isArray(n.petitions) ? n.petitions : [];
    const fingerprint = [clean(fd.entity),clean(fd.recipientName),clean(fd.petitionerName),clean(fd.subject),clean(fd.radicado),clean(fd.radicadoDate)].join('|');
    const recent=n.petitions[n.petitions.length-1];
    if(recent?.fingerprint===fingerprint && (Date.now()-new Date(recent.generatedAt).getTime())<120000) return;
    n.petitions.push({
      id:uidLocal(),generatedAt:data.generatedAt,entity:clean(fd.entity),recipientName:clean(fd.recipientName),recipientRole:clean(fd.recipientRole),recipientEmail:clean(fd.recipientEmail),recipientPhone:clean(fd.recipientPhone),recipientAddress:clean(fd.recipientAddress),
      petitionerName:clean(fd.petitionerName),petitionerId:clean(fd.petitionerId),subject:clean(fd.subject),radicado:clean(fd.radicado),radicadoDate:clean(fd.radicadoDate),vereda:clean(n.vereda),status:fd.radicado?'Radicado':'Generado',fingerprint
    });
    saveDB();
    try{ toast('Derecho de Petición generado y guardado en la trazabilidad'); }catch(_){ }
  }

  async function archiveGeneratedPDF({blob,filename,data}){
    const fd=data, n=data.need;
    const record={
      id:uidLocal(),type:fd.documentType==='solicitud'?'solicitud':'derecho_peticion',signatureKind:data.signatureKind||'personal',
      needId:rebuildSourceRecord?.needId||n.id,
      needCode:clean(rebuildSourceRecord?.needCode||n.code),needTitle:clean(rebuildSourceRecord?.needTitle||n.title),
      territory:clean(rebuildSourceRecord?.territory||n.territory),vereda:clean(rebuildSourceRecord?.vereda||n.vereda),sector:clean(rebuildSourceRecord?.sector||n.sector),
      generatedAt:data.generatedAt,filename,blob,
      entity:clean(fd.entity),recipientName:clean(fd.recipientName),recipientRole:clean(fd.recipientRole),recipientEmail:clean(fd.recipientEmail),recipientPhone:clean(fd.recipientPhone),recipientAddress:clean(fd.recipientAddress),
      petitionerName:clean(fd.petitionerName),petitionerId:clean(fd.petitionerId),subject:clean(fd.subject),radicado:clean(fd.radicado),radicadoDate:clean(fd.radicadoDate),
      // Conserva el texto del formulario para futuras versiones, sin almacenar la firma.
      draft:archiveDraft(data),templateVersion:'1.0.33',
      sourceArchiveId:rebuildSourceRecord?.id||null,
      originalNeedId:rebuildSourceRecord?.needId||null,
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
          const fd={...base,entity:r.entity,recipientName:r.recipientName||r.entity,recipientRole:r.recipientRole||'Funcionario competente',recipientEmail:r.email||'',recipientPhone:r.phone||'',recipientAddress:r.address||''};
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
    const W=1240,H=1754,M=90,BOTTOM=155,TOP=207;
    const CONTENT_HEIGHT=H-BOTTOM-TOP;
    const pages=[]; let c,ctx,y;
    const ivanPhoto=await loadImage('assets/marco-andres-silva-lopez.jpeg').catch(()=>null);
    const civicWatermark=await loadImage('assets/marca-agua-marco-palacio-v116.png').catch(()=>null);
    const evidencePhotos=await getNeedPhotos(d.need?.id).catch(()=>[]);
    const phaseOrder={before:0,followup:1,after:2};
    evidencePhotos.sort((a,b)=>(phaseOrder[a.phase]??9)-(phaseOrder[b.phase]??9)||String(a.date||'').localeCompare(String(b.date||''))||String(a.created||'').localeCompare(String(b.created||'')));

    function drawHeader(){
      const isGeneral=d.documentType==='solicitud';
      const gradient=ctx.createLinearGradient(0,0,W,180);
      gradient.addColorStop(0,'#03432e');gradient.addColorStop(.5,'#08704a');gradient.addColorStop(1,'#03432e');
      ctx.fillStyle=gradient;ctx.fillRect(0,0,W,184);
      // Emblema ornamental ciudadano, no escudo institucional.
      ctx.save();ctx.translate(93,85);ctx.strokeStyle='#f3cc65';ctx.lineWidth=4;
      ctx.beginPath();ctx.moveTo(-35,33);ctx.lineTo(-35,-14);ctx.lineTo(-19,-14);ctx.lineTo(-19,-35);ctx.lineTo(0,-51);ctx.lineTo(19,-35);ctx.lineTo(19,-14);ctx.lineTo(35,-14);ctx.lineTo(35,33);ctx.stroke();
      ctx.beginPath();ctx.moveTo(-15,33);ctx.lineTo(-15,3);ctx.quadraticCurveTo(0,-16,15,3);ctx.lineTo(15,33);ctx.stroke();
      ctx.beginPath();ctx.moveTo(-36,42);ctx.quadraticCurveTo(0,22,36,42);ctx.stroke();ctx.restore();
      ctx.fillStyle='rgba(255,255,255,.72)';ctx.fillRect(158,36,2,104);
      ctx.textAlign='left';ctx.fillStyle='#fff';ctx.font='700 36px Arial, sans-serif';
      ctx.fillText(isGeneral?'SOLICITUD CIUDADANA':'DERECHO DE PETICIÓN',183,73);
      ctx.font='20px Arial, sans-serif';ctx.fillStyle='#e2f1e6';
      ctx.fillText('Floridablanca · Documento ciudadano',184,113);
      if(ivanPhoto){
        const centerX=832,cy=83,r=54;ctx.save();ctx.beginPath();ctx.arc(centerX,cy,r,0,Math.PI*2);ctx.clip();
        const sw=ivanPhoto.naturalWidth||ivanPhoto.width,sh=ivanPhoto.naturalHeight||ivanPhoto.height;
        const ss=Math.min(sw,sh*.84),sx=(sw-ss)/2,sy=sh*.045;
        ctx.drawImage(ivanPhoto,sx,sy,ss,Math.min(ss,sh-sy),centerX-r,cy-r,r*2,r*2);
        ctx.restore();ctx.strokeStyle='#f2c14e';ctx.lineWidth=4;ctx.beginPath();ctx.arc(centerX,cy,r+2,0,Math.PI*2);ctx.stroke();
      }
      ctx.fillStyle='rgba(255,255,255,.78)';ctx.fillRect(904,32,2,106);
      ctx.fillStyle='#fff';ctx.font='700 29px Arial, sans-serif';ctx.fillText('MARCO ANDRÉS',929,71);
      ctx.fillStyle='#f2c14e';ctx.fillText('SILVA LÓPEZ',929,111);
      // Filete dorado arqueado, una sola línea de separación.
      ctx.fillStyle='#f2c14e';ctx.beginPath();ctx.moveTo(0,181);ctx.quadraticCurveTo(W*.49,201,W,181);ctx.lineTo(W,189);ctx.quadraticCurveTo(W*.49,208,0,189);ctx.closePath();ctx.fill();
    }

    function drawPageWatermark(){
      // Solamente una fachada tenue al pie, sin retratos duplicados en el cuerpo.
      if(!civicWatermark)return;
      ctx.save();ctx.globalAlpha=.09;ctx.filter='saturate(.48)';
      const im=civicWatermark,sw=im.naturalWidth||im.width,sh=im.naturalHeight||im.height;
      const sx=Math.round(sw*.37),sy=Math.round(sh*.18),cw=Math.round(sw*.59),ch=Math.round(sh*.70);
      ctx.drawImage(im,sx,sy,cw,ch,W*.45,H-645,W*.53,490);
      ctx.restore();
    }

    function newPage(){
      const continuation=pages.length>0;
      c=document.createElement('canvas');c.width=W;c.height=H;ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);drawPageWatermark();pages.push(c);drawHeader();y=TOP+(continuation?58:0);
    }
    function roundRect(x,y,w,h,r,fill=null,stroke=null,lineWidth=1.5){
      const rr=Math.min(r,w/2,h/2);
      ctx.beginPath();
      ctx.moveTo(x+rr,y);
      ctx.arcTo(x+w,y,x+w,y+h,rr);
      ctx.arcTo(x+w,y+h,x,y+h,rr);
      ctx.arcTo(x,y+h,x,y,rr);
      ctx.arcTo(x,y,x+w,y,rr);
      ctx.closePath();
      if(fill){ctx.fillStyle=fill;ctx.fill();}
      if(stroke){ctx.lineWidth=lineWidth;ctx.strokeStyle=stroke;ctx.stroke();}
    }
    function font(size=23,bold=false,italic=false,color='#192431'){ctx.font=`${italic?'italic ':''}${bold?'700 ':'400 '}${size}px Arial, sans-serif`;ctx.fillStyle=color;}
    function ensure(h){if(y+h>H-BOTTOM&&y>TOP+1)newPage();}
    function rule(){ensure(28);ctx.strokeStyle='#bfd9c2';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(M,y);ctx.lineTo(W-M,y);ctx.stroke();y+=24;}
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
        if(blockH<=260)ensure(blockH);else ensure(Math.min(2,lines.length)*lh+6);
        lines.forEach((L,li)=>{ensure(lh+4);font(size,bold,italic,color);drawJustifiedLine(L,M+indent,y,maxW,size,bold,italic,!justify||li===lines.length-1);y+=lh;});
        if(pi<paras.length-1)y+=Math.round(lh*.30);
      });y+=gap;
    }
    function centerText(text,size,bold=false,color='#075638',gap=12){
      ensure(size*2.4);font(size,bold,false,color);ctx.textAlign='center';ctx.fillText(text,W/2,y);ctx.textAlign='left';y+=Math.round(size*1.45)+gap;
    }
    function titlePanel(main,sub){
      ensure(128);
      const y0=y;
      ctx.textAlign='center';
      ctx.fillStyle='#075638';ctx.font='700 45px Arial, sans-serif';ctx.fillText(main,W/2,y0+39);
      ctx.fillStyle='#435349';ctx.font='400 22px Arial, sans-serif';ctx.fillText(sub,W/2,y0+80);
      ctx.strokeStyle='#d7a932';ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(W/2-365,y0+72);ctx.lineTo(W/2-280,y0+72);ctx.moveTo(W/2+280,y0+72);ctx.lineTo(W/2+365,y0+72);ctx.stroke();
      ctx.textAlign='left';y=y0+116;
    }

    function sectionTitle(t,minFollowing=106){
      ensure(64+Math.min(minFollowing,CONTENT_HEIGHT-64));
      ctx.font='700 23px Arial, sans-serif';const labelWidth=Math.min(W-2*M-80,Math.max(265,ctx.measureText(t).width+65));
      const h=45,yy=y-16;
      const grad=ctx.createLinearGradient(M,yy,M+labelWidth,yy);
      grad.addColorStop(0,'#075638');grad.addColorStop(1,'#118158');
      roundRect(M,yy,labelWidth,h,13,grad);
      ctx.fillStyle='#fff';ctx.font='700 23px Arial, sans-serif';ctx.fillText(t,M+25,yy+30);
      ctx.strokeStyle='#92bd92';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(M+labelWidth+22,yy+23);ctx.lineTo(W-M,yy+23);ctx.stroke();
      y=yy+h+25;
    }

    function firstParagraphHeight(text,size=21){
      const first=String(text||'').split(/\n+/)[0]||'';
      return Math.min(138,wrapWords(first,W-2*M,size).length*Math.round(size*1.60)+24);
    }
    function labelValue(label,value){
      if(!clean(value))return;
      font(20,true,false,'#075638');const labelW=ctx.measureText(label).width+12;
      const availableW=W-2*M-labelW;
      const lines=wrapWords(value,Math.max(180,availableW),20);
      ensure(lines.length*33+8);
      font(20,true,false,'#075638');ctx.fillText(label,M,y);
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
      if(clean(d.recipientAddress))fields.push(['Dirección física:',clean(d.recipientAddress)]);
      const rows=fields.map(([label,value])=>{
        font(20,true);const labelW=ctx.measureText(label).width+8;
        return {label,labelW,lines:wrapWords(value,W-2*M-122-labelW,20)};
      });
      const rowH=29, boxH=33+rows.reduce((a,r)=>a+r.lines.length*rowH+4,0)+17;
      ensure(boxH+68);
      const top=y;
      roundRect(M,top+27,W-2*M,boxH,20,'#eef6ee');
      const grad=ctx.createLinearGradient(M,top,M+305,top);
      grad.addColorStop(0,'#06442f');grad.addColorStop(1,'#127f55');
      roundRect(M,top,305,48,14,grad);
      ctx.fillStyle='#fff';ctx.font='700 24px Arial, sans-serif';ctx.fillText('DESTINATARIO',M+32,top+31);
      y=top+78;
      rows.forEach((row,i)=>{
        const xx=M+42;
        // Punto identificador discreto por fila.
        ctx.fillStyle='#0d7650';ctx.beginPath();ctx.arc(M+23,y-5,3.3,0,Math.PI*2);ctx.fill();
        font(20,true,false,'#075638');ctx.fillText(row.label,xx,y);
        row.lines.forEach((ln,j)=>{
          font(20,false,false,'#1e2d25');ctx.fillText(ln,xx+row.labelW,y);y+=rowH;
        });y+=4;
      });
      y=top+27+boxH+28;
    }

    function phaseLabel(phase){return phase==='before'?'ANTES · Evidencia inicial':phase==='followup'?'SEGUIMIENTO · Evolución':'DESPUÉS · Resultado final';}
    function phaseColor(phase){return phase==='before'?'#167647':phase==='followup'?'#b38108':'#159447';}
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
        ctx.fillStyle='#f7faf4';ctx.strokeStyle='#d3e3d0';ctx.lineWidth=1.5;ctx.fillRect(bx,by,bw,bh);ctx.strokeRect(bx,by,bw,bh);
        const ix=M+(bw-iw)/2,iy=by+17;
        ctx.fillStyle='#fff';ctx.fillRect(ix,iy,iw,ih);ctx.drawImage(image,ix,iy,iw,ih);
        y=iy+ih+34;
        font(18,true,false,'#075638');ctx.fillText(`Evidencia fotográfica ${number}`,M+18,y);
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
    titlePanel(isGeneralRequest?'SOLICITUD FORMAL':'DERECHO DE PETICIÓN',isGeneralRequest?'Gestión y solicitud ciudadana':'Artículo 23 de la Constitución Política · Ley 1755 de 2015');
    // Fecha con línea de lectura y pequeño calendario dibujado.
    ensure(48);
    ctx.strokeStyle='#075638';ctx.lineWidth=2;ctx.strokeRect(M+3,y-23,24,24);
    ctx.beginPath();ctx.moveTo(M+3,y-15);ctx.lineTo(M+27,y-15);ctx.moveTo(M+9,y-28);ctx.lineTo(M+9,y-20);ctx.moveTo(M+21,y-28);ctx.lineTo(M+21,y-20);ctx.stroke();
    ctx.fillStyle='#23362c';ctx.font='20px Arial';ctx.fillText(`Floridablanca, Santander, ${currentLongDate()}`,M+45,y-2);
    ctx.strokeStyle='#95bc97';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(M+510,y);ctx.lineTo(W-M,y);ctx.stroke();y+=41;
    recipientBlock();
    ctx.fillStyle='#f2c14e';ctx.fillRect(M,y-19,5,30);
    labelValue('Asunto:',d.subject);
    y+=17;
    paragraph(isGeneralRequest?`Yo, ${clean(d.petitionerName)}, identificado(a) con ${clean(d.petitionerId)}, presento respetuosamente ante su entidad la siguiente solicitud:`:`Yo, ${clean(d.petitionerName)}, identificado(a) con ${clean(d.petitionerId)}, actuando en nombre propio y en ejercicio del derecho fundamental de petición consagrado en el artículo 23 de la Constitución Política y desarrollado por la Ley 1755 de 2015, presento respetuosamente la siguiente solicitud:`,{size:21,gap:22,justify:true});
    sectionTitle(isGeneralRequest?'I. ANTECEDENTES':'I. HECHOS',firstParagraphHeight(d.facts)); paragraph(d.facts,{size:21,gap:24,justify:true});
    sectionTitle(isGeneralRequest?'II. SOLICITUDES':'II. PETICIONES',firstParagraphHeight(d.requests)); paragraph(d.requests,{size:21,gap:24,justify:true});
    if(!isGeneralRequest){sectionTitle('III. FUNDAMENTO');
      paragraph('La presente petición se formula con fundamento en el artículo 23 de la Constitución Política y en las disposiciones aplicables de la Ley 1755 de 2015. Solicito que la respuesta sea clara, de fondo, congruente con lo solicitado y comunicada dentro de los términos legales correspondientes.',{size:21,gap:24,justify:true});}
    if(clean(d.attachments)||evidencePhotos.length){
      sectionTitle(isGeneralRequest?'III. ANEXOS / EVIDENCIAS':'IV. ANEXOS / EVIDENCIAS');
      if(clean(d.attachments))paragraph(d.attachments,{size:21,gap:18,justify:true});
      if(evidencePhotos.length){
        paragraph(`Se incorporan ${evidencePhotos.length} fotografía(s) registradas en la necesidad como evidencia visual.`,{size:18,italic:true,color:'#66788b',gap:18,justify:false});
        await drawPhotoEvidence(evidencePhotos);
      }
    }
    // Notificaciones y firma forman el cierre del mismo escrito; evitar una
    // página casi vacía donde aparezca únicamente la firma.
    const sig=d.signature?await loadImage(d.signature):null;
    const sigScale=sig?Math.min(330/sig.naturalWidth,110/sig.naturalHeight):1;
    const sigW=sig?Math.round(sig.naturalWidth*sigScale):250;
    const sigH=sig?Math.round(sig.naturalHeight*sigScale):56;
    const signatureNote=d.previewOnly?'VISTA PREVIA · SIN FIRMA · No apta para radicar':d.signatureKind==='ivan-escaneada'?'Firma escaneada de Marco Andrés Silva López incorporada con autorización declarada':d.signatureKind==='marco-manuscrita-en-pantalla'?'Firma manuscrita capturada en pantalla y autorizada para este documento':'Firma manuscrita electrónica incorporada al PDF';
    const internalReference=`Referencia interna: ${clean(d.need.code)} · ${clean(d.need.territory)} · ${clean(d.need.title)}`;
    // Reservar el espacio REAL del cierre; la estimación antigua añadía márgenes
    // duplicados y enviaba notificaciones y firma a otra hoja incluso cuando cabían.
    // Los 12 px de seguridad incluyen ligeras diferencias entre navegadores.
    const referenceLines=wrapWords(internalReference,W-2*M,14,false,true).length;
    const closingHeight=Math.round(21*1.60)+3+sigH+7+29+31+28+32+25+
      referenceLines*Math.round(14*1.60)+12;
    const notificationHeight=labelHeight('Dirección:',d.address)+labelHeight('Teléfono:',d.phone)+labelHeight('Correo electrónico:',d.email)+12;
    const hasRadicado=Boolean(clean(d.radicado)||clean(d.radicadoDate));
    const radicadoHeight=hasRadicado?65+labelHeight('Radicado:',d.radicado)+labelHeight('Fecha de radicación:',formatDate(d.radicadoDate))+10:0;
    const hasAnnexes=Boolean(clean(d.attachments)||evidencePhotos.length);
    const notificationSection=isGeneralRequest?(hasAnnexes?'IV. NOTIFICACIONES':'III. NOTIFICACIONES'):(hasAnnexes?'V. NOTIFICACIONES':'IV. NOTIFICACIONES');
    sectionTitle(notificationSection,notificationHeight+radicadoHeight+closingHeight);
    labelValue('Dirección:',d.address);labelValue('Teléfono:',d.phone);labelValue('Correo electrónico:',d.email);y+=12;
    if(hasRadicado){sectionTitle(isGeneralRequest?'V. DATOS DE RADICACIÓN':'VI. DATOS DE RADICACIÓN');labelValue('Radicado:',d.radicado);labelValue('Fecha de radicación:',formatDate(d.radicadoDate));y+=10;}
    // Firma y datos del solicitante, sin cuadro superpuesto sobre el texto.
    const signaturesSpace=closingHeight;
    ensure(signaturesSpace);
    paragraph('Cordialmente,',{size:21,justify:false,gap:3});
    const sx=M+14,sy=y+2;
    if(sig)ctx.drawImage(sig,sx,sy,sigW,sigH);
    else{font(20,true,false,'#9b7b29');ctx.fillText('FIRMA PENDIENTE',sx,sy+36);}
    y=sy+sigH+5;
    ctx.strokeStyle='#4a6251';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(M+5,y);ctx.lineTo(M+Math.max(330,sigW+36),y);ctx.stroke();
    y+=29;
    font(22,true,false,'#172b1c');ctx.fillText(clean(d.petitionerName),M+5,y);y+=31;
    font(18,false,false,'#192431');ctx.fillText(`C.C. ${clean(d.petitionerId)}`,M+5,y);y+=28;
    font(15,false,true,'#576c5c');ctx.fillText(signatureNote,M+5,y);y+=32;
    // Referencia interna separada del bloque de firma.
    ctx.strokeStyle='#d1e4d0';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(M,y);ctx.lineTo(W-M,y);ctx.stroke();y+=25;
    paragraph(internalReference,{size:14,italic:true,color:'#59695d',justify:false,gap:0});

    /* Pie final con una única marca, sin otros textos que puedan montarse. */
    pages.forEach((page,i)=>{
      const pctx=page.getContext('2d');
      if(d.previewOnly){
        pctx.save();pctx.fillStyle='rgba(242,193,78,.90)';pctx.fillRect(M,184,370,27);
        pctx.fillStyle='#513e0a';pctx.font='700 15px Arial';pctx.fillText('BORRADOR DE VISTA PREVIA · NO FIRMADO',M+10,202);pctx.restore();
      }
      const y0=H-94;
      pctx.fillStyle='#075638';pctx.fillRect(0,y0,W,H-y0);
      pctx.fillStyle='#f2c14e';pctx.beginPath();pctx.moveTo(0,y0-4);pctx.quadraticCurveTo(W*.55,y0+17,W,y0-4);pctx.lineTo(W,y0+3);pctx.quadraticCurveTo(W*.55,y0+25,0,y0+3);pctx.closePath();pctx.fill();
      const iconX=W/2-224,iconY=H-42;
      pctx.save();pctx.translate(iconX,iconY);pctx.strokeStyle='#f2c14e';pctx.lineWidth=3.4;
      pctx.beginPath();pctx.moveTo(-7,6);pctx.quadraticCurveTo(-29,-14,-45,-9);pctx.quadraticCurveTo(-39,11,-7,11);
      pctx.moveTo(7,6);pctx.quadraticCurveTo(29,-14,45,-9);pctx.quadraticCurveTo(39,11,7,11);
      pctx.moveTo(0,15);pctx.lineTo(0,-4);pctx.stroke();pctx.restore();
      pctx.fillStyle='rgba(255,255,255,.8)';pctx.fillRect(W/2-161,H-67,2,43);
      pctx.font='italic 700 27px Georgia, serif';pctx.textAlign='center';pctx.fillStyle='#ffffff';
      pctx.fillText('Floridablanca, nuestra casa',W/2+112,H-31);
      // Folio por encima de la banda, sin superposición.
      pctx.font='15px Arial, sans-serif';pctx.fillStyle='#667b68';pctx.textAlign='right';
      pctx.fillText(`Página ${i+1} de ${pages.length}`,W-M,H-114);pctx.textAlign='left';
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
