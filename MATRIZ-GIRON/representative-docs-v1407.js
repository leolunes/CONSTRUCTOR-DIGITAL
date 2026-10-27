console.info('MOTOR PDF REPRESENTANTE ÚNICO v1.4.08 · firma antes de anexo · sin portada azul');

(() => {
'use strict';
const REPRESENTATIVE_PDF_ENGINE='1.3.69-SEND-TRACEABILITY';
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const center=$('#representativeDocsModal'), formModal=$('#representativeFormModal'), archiveModal=$('#representativeArchiveModal'), form=$('#representativeForm');
if(!center||!formModal||!archiveModal||!form)return;

const META_KEY='matriz_giron_representative_docs_v1';
const DB='matriz_giron_representative_docs_db_v1', STORE='pdfs';
let previewUrl=null, sendDocId=null;
let representativePhotos=[];
const repPhotosInput=document.getElementById('representativePhotos');
const repPhotoGallery=document.getElementById('representativePhotoGallery');
function fileDataUrl(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error);r.readAsDataURL(file)})}
function renderRepresentativePhotos(){
 if(!repPhotoGallery)return;
 if(!representativePhotos.length){repPhotoGallery.innerHTML='<div class="rep-photo-empty">Sin fotografías seleccionadas.</div>';return}
 repPhotoGallery.innerHTML=representativePhotos.map((p,i)=>`<div class="rep-photo-thumb"><img src="${p.url}" alt="Fotografía ${i+1}"><button type="button" data-rep-photo-remove="${i}" title="Eliminar">×</button><span>Foto ${i+1}</span></div>`).join('');
 repPhotoGallery.querySelectorAll('[data-rep-photo-remove]').forEach(b=>b.onclick=()=>{representativePhotos.splice(Number(b.dataset.repPhotoRemove),1);renderRepresentativePhotos()});
}
repPhotosInput?.addEventListener('change',async()=>{for(const f of Array.from(repPhotosInput.files||[])){if(!f.type.startsWith('image/'))continue;representativePhotos.push({name:f.name,url:await fileDataUrl(f)})}repPhotosInput.value='';renderRepresentativePhotos()});
const SEND_EMAIL_KEY='matriz_giron_representative_default_send_email_v1';
const REP_DRAFT_KEY='matriz_giron_representative_draft_v1';
function saveRepresentativeDraft(){
 try{
  const values={};new FormData(form).forEach((v,k)=>{if(typeof v==='string')values[k]=v});
  localStorage.setItem(REP_DRAFT_KEY,JSON.stringify({values,batch:window.__batchRecipients?.representative||[],savedAt:new Date().toISOString()}));
 }catch(_){}
}
function clearRepresentativeDraft(){try{localStorage.removeItem(REP_DRAFT_KEY)}catch(_){}}
function restoreRepresentativeDraft(){
 try{
  const d=JSON.parse(localStorage.getItem(REP_DRAFT_KEY)||'null');if(!d)return false;
  Object.entries(d.values||{}).forEach(([k,v])=>{const el=form.elements[k];if(el&&el.type!=='file')el.value=v});
  window.__batchRecipients=window.__batchRecipients||{};window.__batchRecipients.representative=Array.isArray(d.batch)?d.batch:[];
  renderRepresentativeBatchRecipients();
  return true;
 }catch(_){return false}
}


const clean=v=>String(v??'').trim();
const esc=v=>clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const uid=()=>crypto.randomUUID?crypto.randomUUID():'rep-'+Date.now()+'-'+Math.random().toString(16).slice(2);
const isoToday=()=>{const d=new Date(); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const longDate=iso=>new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'long',year:'numeric'}).format(new Date(iso+'T12:00:00'));
const metas=()=>{try{return JSON.parse(localStorage.getItem(META_KEY)||'[]')}catch{return[]}};
const saveMetas=a=>localStorage.setItem(META_KEY,JSON.stringify(a));

function openDB(){return new Promise((res,rej)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'id'})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function putPdf(id,blob){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put({id,blob});tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}
async function getPdf(id){const db=await openDB();return new Promise((res,rej)=>{const q=db.transaction(STORE).objectStore(STORE).get(id);q.onsuccess=()=>res(q.result?.blob||null);q.onerror=()=>rej(q.error)})}
async function delPdf(id){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}

function show(m){m.classList.add('show');m.classList.add('open');m.setAttribute('aria-hidden','false')}
function hide(m){m.classList.remove('show');m.classList.remove('open');m.setAttribute('aria-hidden','true')}
function openCenter(){renderRecent();show(center)}
$('#representativeDocsNav')?.addEventListener('click',openCenter);
$('#representativeDocsQuick')?.addEventListener('click',openCenter);
$$('[data-rep-close]').forEach(b=>b.onclick=()=>hide(center));
$$('[data-rep-form-close]').forEach(b=>b.onclick=()=>hide(formModal));
$$('[data-rep-archive-close]').forEach(b=>b.onclick=()=>hide(archiveModal));

$('#newRepresentativeDoc').onclick=()=>{const hasDraft=!!localStorage.getItem(REP_DRAFT_KEY);if(!hasDraft&&window.clearBatchRecipients)window.clearBatchRecipients('representative');representativePhotos=[];renderRepresentativePhotos();form.reset();form.elements.city.value='Bogotá D.C.';form.elements.date.value=isoToday();form.elements.subject.value='Solicitud de Informe a Congresista – Art. 258 de la Ley 5ª de 1992';form.elements.notificationEmail.value='jonathan.pineda@camara.gov.co';hide(center);show(formModal)};
$('#newRepresentativeBatchDoc')?.addEventListener('click',()=>{if(window.clearBatchRecipients)window.clearBatchRecipients('representative');form.reset();form.elements.city.value='Bogotá D.C.';form.elements.date.value=isoToday();form.elements.subject.value='Solicitud de Informe a Congresista – Art. 258 de la Ley 5ª de 1992';form.elements.notificationEmail.value='jonathan.pineda@camara.gov.co';hide(center);show(formModal);setTimeout(()=>document.querySelector('[data-batch-open=\"representative\"]')?.click(),120)});
$('#openRepresentativeArchive').onclick=()=>{hide(center);renderArchive();show(archiveModal)};
$('#representativeArchiveSearch').addEventListener('input',renderArchive);
['#representativeArchiveRecipient','#representativeArchiveEntity','#representativeArchiveStatus','#representativeArchiveFrom','#representativeArchiveTo'].forEach(sel=>$(sel)?.addEventListener('change',renderArchive));
$('#representativeArchiveClear')?.addEventListener('click',()=>{['#representativeArchiveSearch','#representativeArchiveRecipient','#representativeArchiveEntity','#representativeArchiveStatus','#representativeArchiveFrom','#representativeArchiveTo'].forEach(sel=>{const el=$(sel);if(el)el.value=''});renderArchive()});

function renderRepresentativeBatchRecipients(){
 const rows=window.__batchRecipients?.representative||[],el=$('#representativeBatchCount'),box=$('#representativeBatchRecipientCards'),title=$('#representativeSingleRecipientTitle');
 if(el)el.textContent=rows.length?`${rows.length} destinatario${rows.length===1?'':'s'} seleccionado${rows.length===1?'':'s'}`:'Sin selección múltiple';
 $$('.rep-single-recipient').forEach(x=>{
   x.classList.toggle('hidden',rows.length>0);
   x.querySelectorAll('input,select,textarea').forEach(inp=>{inp.disabled=rows.length>0});
 });
 if(title)title.textContent=rows.length?'Destinatarios seleccionados':'Destinatario';
 if(!box)return;
 if(!rows.length){box.innerHTML='';box.classList.add('hidden');return}
 box.classList.remove('hidden');
 box.innerHTML=`<div class="rep-batch-help">Complete o corrija los datos de cada destinatario. La solicitud, observaciones, fotografías y demás contenido serán comunes para todos.</div><div class="rep-batch-cards">${rows.map((r,i)=>`<div class="rep-batch-card" data-rep-batch-index="${i}"><div class="rep-batch-card-head"><strong>Destinatario ${i+1}</strong><span>${esc(r.entity||'Entidad institucional')}</span></div><div class="rep-batch-grid"><label>Tratamiento<input data-rf="treatment" value="${esc(r.treatment||'Dr.')}"></label><label>Nombre<input data-rf="recipientName" value="${esc(r.recipientName||'')}"></label><label>Cargo<input data-rf="recipientRole" value="${esc(r.recipientRole||'')}"></label><label>Entidad<input data-rf="entity" value="${esc(r.entity||'')}"></label><label class="span-2">Correo institucional<input data-rf="email" type="email" value="${esc(r.email||'')}"></label></div></div>`).join('')}</div>`;
 box.querySelectorAll('[data-rep-batch-index]').forEach(card=>card.querySelectorAll('[data-rf]').forEach(inp=>inp.addEventListener('input',()=>{const i=Number(card.dataset.repBatchIndex),row=window.__batchRecipients.representative[i];if(row){row[inp.dataset.rf]=inp.value;saveRepresentativeDraft()}})));
}
const updateRepresentativeBatchCount=renderRepresentativeBatchRecipients;
window.addEventListener('batch-recipients-changed',e=>{if(e.detail?.mode==='representative'){renderRepresentativeBatchRecipients();saveRepresentativeDraft()}});
form.addEventListener('input',()=>saveRepresentativeDraft());
function data(){return Object.fromEntries(new FormData(form).entries())}
function validate(d){if(!clean(d.recipientName)||!clean(d.recipientRole)||!clean(d.entity)||!clean(d.subject)||!clean(d.requestText)){alert('Complete destinatario, cargo, entidad, asunto y solicitud.');return false}return true}

function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
function ascii(s){return new TextEncoder().encode(s)}
function concat(parts){let n=0;parts.forEach(p=>n+=p.length);const o=new Uint8Array(n);let x=0;parts.forEach(p=>{o.set(p,x);x+=p.length});return o}
function dataUrlBytes(url){const b=atob(url.split(',')[1]),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
function pdfFromJpegs(images,pwpx,phpx){const pw=595.28,ph=841.89,n=images.length,total=2+n*3,bodies=new Array(total+1);bodies[1]=ascii('<< /Type /Catalog /Pages 2 0 R >>');const refs=[];for(let i=0;i<n;i++)refs.push(`${3+i*3} 0 R`);bodies[2]=ascii(`<< /Type /Pages /Kids [${refs.join(' ')}] /Count ${n} >>`);for(let i=0;i<n;i++){const po=3+i*3,io=po+1,co=po+2;const im=images[i];bodies[po]=ascii(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 ${io} 0 R >> >> /Contents ${co} 0 R >>`);bodies[io]=concat([ascii(`<< /Type /XObject /Subtype /Image /Width ${pwpx} /Height ${phpx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.length} >>\nstream\n`),im,ascii('\nendstream')]);const st=`q\n${pw} 0 0 ${ph} 0 0 cm\n/Im0 Do\nQ\n`;bodies[co]=ascii(`<< /Length ${st.length} >>\nstream\n${st}endstream`)}const chunks=[ascii('%PDF-1.4\n')],off=new Array(total+1).fill(0);let pos=chunks[0].length;for(let i=1;i<=total;i++){off[i]=pos;const a=ascii(`${i} 0 obj\n`),b=ascii('\nendobj\n');chunks.push(a,bodies[i],b);pos+=a.length+bodies[i].length+b.length}const xp=pos;let xr=`xref\n0 ${total+1}\n0000000000 65535 f \n`;for(let i=1;i<=total;i++)xr+=String(off[i]).padStart(10,'0')+' 00000 n \n';chunks.push(ascii(xr+`trailer\n<< /Size ${total+1} /Root 1 0 R >>\nstartxref\n${xp}\n%%EOF`));return new Blob([concat(chunks)],{type:'application/pdf'})}

function pdfFromJpeg(im,pwpx,phpx){const pw=595.28,ph=841.89;const bodies=[];bodies[1]=ascii('<< /Type /Catalog /Pages 2 0 R >>');bodies[2]=ascii('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');bodies[3]=ascii(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);bodies[4]=concat([ascii(`<< /Type /XObject /Subtype /Image /Width ${pwpx} /Height ${phpx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.length} >>\nstream\n`),im,ascii('\nendstream')]);const stream=`q\n${pw} 0 0 ${ph} 0 0 cm\n/Im0 Do\nQ\n`;bodies[5]=ascii(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);const chunks=[ascii('%PDF-1.4\n')],off=[0];let pos=chunks[0].length;for(let i=1;i<=5;i++){off[i]=pos;const a=ascii(`${i} 0 obj\n`),b=ascii('\nendobj\n');chunks.push(a,bodies[i],b);pos+=a.length+bodies[i].length+b.length}const xp=pos;let xr='xref\n0 6\n0000000000 65535 f \n';for(let i=1;i<=5;i++)xr+=String(off[i]).padStart(10,'0')+' 00000 n \n';chunks.push(ascii(xr+`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xp}\n%%EOF`));return new Blob([concat(chunks)],{type:'application/pdf'})}

async function buildPdf(d){
 const W=1240,H=1754,M=168,TOP=315,BOTTOM=135,pages=[];
 const makePage=async()=>{
   const pc=document.createElement('canvas');pc.width=W;pc.height=H;const x=pc.getContext('2d');
   x.fillStyle='#fff';x.fillRect(0,0,W,H);
   const head=await loadImage('assets/representante-jonathan-encabezado.png').catch(()=>null);
   if(head){const maxW=W-2*M,hh=maxW*(head.height/head.width);x.drawImage(head,M,78,maxW,hh);x.fillStyle='#fff';x.fillRect(M,78+hh*.70,maxW*.36,hh*.30)}
   return {pc,x};
 };
 let {pc,x}=await makePage(),y=TOP;
 const font=(sz=22,b=false)=>{x.font=`${b?'700 ':'400 '}${sz}px Arial, sans-serif`;x.fillStyle='#151515'};
 const commit=()=>pages.push(dataUrlBytes(pc.toDataURL('image/jpeg',.95)));
 const next=async()=>{commit();({pc,x}=await makePage());y=TOP};
 const lines=(txt,w,sz=22,b=false)=>{font(sz,b);const out=[];for(const par of String(txt||'').split(/\n/)){const ws=clean(par).split(/\s+/).filter(Boolean);let l='';for(const word of ws){const t=l?l+' '+word:word;if(l&&x.measureText(t).width>w){out.push(l);l=word}else l=t}if(l)out.push(l);out.push('')}if(out[out.length-1]==='')out.pop();return out};
 const ensure=async(n)=>{if(y+n>H-BOTTOM)await next()};
 const para=async(txt,{sz=22,b=false,gap=18,justify=true}={})=>{
   const ls=lines(txt,W-2*M,sz,b);
   for(let i=0;i<ls.length;i++){
     if(ls[i]===''){y+=12;continue}
     await ensure(48);font(sz,b);const last=i===ls.length-1||ls[i+1]==='';
     const words=ls[i].split(/\s+/),normal=x.measureText(' ').width,ww=words.reduce((a,w)=>a+x.measureText(w).width,0),gw=words.length>1?(W-2*M-ww)/(words.length-1):0;
     if(justify&&!last&&words.length>1&&gw<normal*2.3){let xx=M;words.forEach((w,k)=>{x.fillText(w,xx,y);xx+=x.measureText(w).width+(k<words.length-1?gw:0)})}else x.fillText(ls[i],M,y);
     y+=34;
   } y+=gap;
 };
 font(21);x.textAlign='right';x.fillText(`${clean(d.city)}, ${longDate(d.date)}`,W-M,y);x.textAlign='left';y+=72;
 await para(clean(d.treatment),{gap:0,justify:false});
 await para(clean(d.recipientName).toUpperCase(),{b:true,gap:0,justify:false});
 await para(clean(d.recipientRole).toUpperCase(),{gap:0,justify:false});
 await para(clean(d.entity).toUpperCase(),{gap:34,justify:false});
 await ensure(60);font(22,true);x.fillText('ASUNTO:',M,y);font(22);x.fillText(' '+clean(d.subject),M+112,y);y+=62;
 await para(`Yo, JONATHAN EDUARDO PINEDA LÓPEZ, miembro de la Cámara de Representantes del Congreso de la República de Colombia por el departamento de Santander, en ejercicio de la función constitucional de control político atribuida al Congreso de la República conforme a los artículos 135 numeral 3 y 137 de la Constitución Política, en concordancia con el numeral 1 del artículo 6 y el artículo 258 de la Ley 5 de 1992, me permito solicitar a ${clean(d.entity).toUpperCase()} que rinda un informe detallado, completo y debidamente soportado sobre los siguientes aspectos:`,{gap:16});
 await para(clean(d.requestText),{gap:16});
 if(clean(d.extraText))await para(clean(d.extraText),{gap:16});
 await para(`Se autoriza a que las notificaciones de respuesta del presente informe puedan ser notificadas mediante mensaje de datos al correo electrónico ${clean(d.notificationEmail)}`,{gap:22});

 // FIRMA: siempre antes de las fotografías. Si no cabe, abre continuación con el mismo encabezado.
 if(y+205>H-BOTTOM)await next();
 await para('Cordialmente,',{gap:52,justify:false});
 x.textAlign='center';font(22,true);x.fillText('JONATHAN EDUARDO PINEDA LÓPEZ',W/2,y);y+=31;
 font(20);x.fillText('Representante a la Cámara por el departamento de Santander',W/2,y);y+=28;
 x.fillText('Congreso de la República de Colombia',W/2,y);x.textAlign='left';y+=62;

 // ANEXO dentro del MISMO documento, después de la firma. Nunca una portada azul separada.
 for(let i=0;i<representativePhotos.length;i++){
   const img=await loadImage(representativePhotos[i].url).catch(()=>null);if(!img)continue;
   const needed=560;if(y+needed>H-BOTTOM)await next();
   font(23,true);x.fillText('ANEXO FOTOGRÁFICO',M,y);y+=32;
   font(17);x.fillStyle='#4b5b68';x.fillText(`Continuación del documento dirigido a ${clean(d.entity)}`,M,y);y+=24;
   x.strokeStyle='#c7d1da';x.lineWidth=1.4;x.beginPath();x.moveTo(M,y);x.lineTo(W-M,y);x.stroke();y+=28;
   const bw=W-2*M,bh=Math.min(760,H-BOTTOM-y-55),scale=Math.min((bw-24)/img.width,(bh-24)/img.height),dw=img.width*scale,dh=img.height*scale;
   x.fillStyle='#f7f9fb';x.fillRect(M,y,bw,bh);x.strokeStyle='#c8d5e1';x.strokeRect(M,y,bw,bh);
   x.drawImage(img,M+(bw-dw)/2,y+(bh-dh)/2,dw,dh);y+=bh+28;
   font(18,true);x.fillStyle='#263746';x.fillText(`Fotografía ${i+1}`,M,y);y+=42;
 }
 commit();
 return pdfFromJpegs(pages,W,H);
}
async function preview(){
 const base=data(),batch=window.__batchRecipients?.representative||[];
 if(!batch.length){
  if(!validate(base))return;
  const blob=await buildPdf(base);if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=URL.createObjectURL(blob);window.open(previewUrl,'_blank');return;
 }
 if(!clean(base.subject)||!clean(base.requestText)){alert('Complete asunto y solicitud.');return}
 const incomplete=batch.find(r=>!clean(r.recipientName)||!clean(r.recipientRole)||!clean(r.entity));
 if(incomplete){alert('Complete nombre, cargo y entidad de cada destinatario seleccionado.');return}
 const r=batch[0],d={...base,treatment:r.treatment||'Dr.',recipientName:r.recipientName,recipientRole:r.recipientRole,entity:r.entity,recipientEmail:r.email||''};
 const blob=await buildPdf(d);if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=URL.createObjectURL(blob);window.open(previewUrl,'_blank');
 if(batch.length>1)setTimeout(()=>alert(`Vista previa mostrada para el Destinatario 1 (${r.entity}). Al generar se crearán ${batch.length} PDF individuales.`),250);
}
$('#previewRepresentativeDoc').onclick=preview;
$('#saveRepresentativeDraft')?.addEventListener('click',()=>{saveRepresentativeDraft();try{toast('Borrador guardado en este dispositivo')}catch(_){alert('Borrador guardado en este dispositivo.')}});

form.addEventListener('submit',async e=>{
 e.preventDefault();const base=data(),batch=window.__batchRecipients?.representative||[];
 if(!batch.length && !validate(base))return;
 if(batch.length && (!clean(base.subject)||!clean(base.requestText))){alert('Complete asunto y solicitud.');return}
 if(batch.length){
  const incomplete=batch.find(r=>!clean(r.recipientName)||!clean(r.recipientRole)||!clean(r.entity));
  if(incomplete){alert('Complete nombre, cargo y entidad de cada destinatario seleccionado.');return}
 }
 const btn=form.querySelector('button[type=submit]'),old=btn.textContent;btn.disabled=true;btn.textContent=batch.length?`Generando ${batch.length} PDF...`:'Generando PDF...';
 try{
  if(!batch.length){
   const blob=await buildPdf(base),id=uid(),filename=`Solicitud-Representante-${clean(base.entity).replace(/[^\wáéíóúñ-]+/gi,'-')}-${base.date}.pdf`;
   await putPdf(id,blob);const a=metas();a.unshift({id,filename,created:new Date().toISOString(),consecutive:'',consecutiveAssignedAt:'',...base});saveMetas(a);download(blob,filename);
  }else{
   const a=metas();let made=0;
   for(const r of batch){
    const d={...base,treatment:r.treatment||base.treatment||'Dr.',recipientName:r.recipientName||r.entity,recipientRole:r.recipientRole||'Funcionario competente',entity:r.entity,recipientEmail:r.email||''};
    const blob=await buildPdf(d),id=uid(),filename=`Solicitud-Representante-${clean(d.entity).replace(/[^\wáéíóúñ-]+/gi,'-').slice(0,60)}-${d.date}.pdf`;
    await putPdf(id,blob);a.unshift({id,filename,created:new Date().toISOString(),consecutive:'',consecutiveAssignedAt:'',recipientEmail:r.email||'',...d});download(blob,filename);made++;
    await new Promise(resolve=>setTimeout(resolve,120));
   }
   saveMetas(a);alert(`Lote generado correctamente: ${made} documentos individuales del Representante. Cada destinatario quedó archivado por separado.`);
  }
  clearRepresentativeDraft();hide(formModal);renderRecent();show(center);
  try{toast(batch.length?`${batch.length} documentos del Representante generados`:'Documento generado y guardado en el Archivo del Representante')}catch{}
 }catch(err){console.error(err);alert('No fue posible generar el documento: '+err.message)}
 finally{btn.disabled=false;btn.textContent=old}
});

function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1200)}
function sendStatusText(m){
 if(m.sentAt&&m.sentTo)return `🟢 Enviado · ${m.sentTo} · ${new Date(m.sentAt).toLocaleString('es-CO')}`;
 if(m.sendPreparedAt&&m.sendPreparedTo)return `🟠 Preparado para enviar · ${m.sendPreparedTo}`;
 return '⚪ No enviado';
}
function openSend(id){
 const m=metas().find(x=>x.id===id);if(!m)return;
 sendDocId=id;
 $('#representativeSendDocument').value=m.filename||m.subject||'Documento PDF';
 $('#representativeSendEmail').value=clean(m.sendPreparedTo||m.sentTo||localStorage.getItem(SEND_EMAIL_KEY)||'');
 $('#representativeSendSubject').value=`Documento para revisión y trámite: ${clean(m.subject)}`;
 $('#representativeSendMessage').value=`Adjunto documento preparado para su revisión y trámite institucional.\n\nDestinatario del oficio: ${clean(m.recipientName)} – ${clean(m.entity)}.\n\nPor favor confirmar recibido.`;
 $('#representativeSendSaveDefault').checked=false;
 $('#representativeSendStatus').innerHTML=`<strong>Estado actual:</strong> ${esc(sendStatusText(m))}`;
 show($('#representativeSendModal'));
}
function closeSend(){hide($('#representativeSendModal'));sendDocId=null}
$$('[data-rep-send-close]').forEach(b=>b.onclick=closeSend);
$('#representativePrepareEmail')?.addEventListener('click',async()=>{
 const id=sendDocId,m=metas().find(x=>x.id===id),blob=id?await getPdf(id):null;if(!m||!blob)return;
 const email=clean($('#representativeSendEmail').value);if(!email||!/^\S+@\S+\.\S+$/.test(email)){alert('Digite un correo electrónico válido.');return}
 if($('#representativeSendSaveDefault').checked)localStorage.setItem(SEND_EMAIL_KEY,email);
 download(blob,m.filename);
 const subject=clean($('#representativeSendSubject').value),body=clean($('#representativeSendMessage').value);
 const a=metas(),i=a.findIndex(x=>x.id===id);if(i>=0){a[i].sendPreparedAt=new Date().toISOString();a[i].sendPreparedTo=email;saveMetas(a)}
 $('#representativeSendStatus').innerHTML=`<strong>Estado:</strong> 🟠 Preparado para enviar a ${esc(email)}. El PDF fue descargado; adjúntelo en el correo que se abrirá. <strong>Aún no se registra como enviado.</strong>`;
 renderRecent();renderArchive();
 setTimeout(()=>{window.location.href=`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`},250);
});
$('#representativeConfirmSent')?.addEventListener('click',()=>{
 const id=sendDocId,email=clean($('#representativeSendEmail').value);if(!id)return;if(!email||!/^\S+@\S+\.\S+$/.test(email)){alert('Digite el correo al que realmente envió el documento.');return}
 if(!confirm(`¿Confirma que usted ya envió este documento a ${email}?`))return;
 const a=metas(),i=a.findIndex(x=>x.id===id);if(i<0)return;a[i].sentAt=new Date().toISOString();a[i].sentTo=email;saveMetas(a);
 $('#representativeSendStatus').innerHTML=`<strong>Estado:</strong> 🟢 Enviado a ${esc(email)} · ${new Date(a[i].sentAt).toLocaleString('es-CO')}`;
 renderRecent();renderArchive();
});
async function openDoc(id){const m=metas().find(x=>x.id===id),b=await getPdf(id);if(!m||!b)return;window.open(URL.createObjectURL(b),'_blank')}
async function removeDoc(id){if(!confirm('¿Eliminar este documento del archivo local?'))return;saveMetas(metas().filter(x=>x.id!==id));await delPdf(id);renderArchive();renderRecent()}


function registerConsecutive(id){
 const a=metas(),i=a.findIndex(x=>x.id===id);if(i<0)return;
 const current=clean(a[i].consecutive);
 const value=prompt('Digite el consecutivo/radicado oficial asignado en Bogotá:',current);
 if(value===null)return;
 const v=clean(value);
 a[i].consecutive=v;
 a[i].consecutiveAssignedAt=v?new Date().toISOString():'';
 saveMetas(a);renderArchive();renderRecent();
}
function row(m){
 const assigned=!!clean(m.consecutive);
 const status=assigned?`<span class="rep-status assigned">🟢 Consecutivo asignado</span><div class="rep-consecutive">${esc(m.consecutive)}</div>`:`<span class="rep-status pending">🟡 Pendiente de consecutivo</span>`;
 return `<div class="rep-doc-row"><div><strong>${esc(m.recipientName)}</strong><small>${esc(m.recipientRole)} · ${esc(m.entity)}</small>${status}</div><div><strong>${esc(m.subject)}</strong><small>${esc(m.date)}</small><small class="rep-send-row-status">${esc(sendStatusText(m))}</small></div><div class="rep-doc-actions"><button data-open="${m.id}">Abrir</button><button data-consecutive="${m.id}">✏️ ${assigned?'Editar':'Registrar'} consecutivo</button><button data-share="${m.id}">📤 Enviar</button><button data-download="${m.id}">⬇ PDF</button><button data-delete="${m.id}">🗑</button></div></div>`
}
function bindRows(scope){scope.querySelectorAll('[data-consecutive]').forEach(b=>b.onclick=()=>registerConsecutive(b.dataset.consecutive));scope.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openDoc(b.dataset.open));scope.querySelectorAll('[data-share]').forEach(b=>b.onclick=()=>openSend(b.dataset.share));scope.querySelectorAll('[data-download]').forEach(b=>b.onclick=async()=>{const m=metas().find(x=>x.id===b.dataset.download),p=await getPdf(b.dataset.download);if(m&&p)download(p,m.filename)});scope.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>removeDoc(b.dataset.delete))}
function renderRecent(){const a=metas();$('#representativeArchiveCount').textContent=a.length;const el=$('#representativeRecent');el.innerHTML=a.length?'<h4>Documentos recientes</h4>'+a.slice(0,4).map(row).join(''):'<div class="rep-empty">Aún no hay documentos preparados para el Representante.</div>';bindRows(el)}
function fillArchiveFilters(all){
 const rec=$('#representativeArchiveRecipient'),ent=$('#representativeArchiveEntity');
 const rv=rec?.value||'',ev=ent?.value||'';
 const recipients=[...new Set(all.map(m=>clean(m.recipientName)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
 const entities=[...new Set(all.map(m=>clean(m.entity)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
 if(rec){rec.innerHTML='<option value="">Todos los destinatarios</option>'+recipients.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');rec.value=recipients.includes(rv)?rv:''}
 if(ent){ent.innerHTML='<option value="">Todas las entidades</option>'+entities.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');ent.value=entities.includes(ev)?ev:''}
}
function renderArchive(){
 const all=metas();fillArchiveFilters(all);
 const q=clean($('#representativeArchiveSearch')?.value).toLowerCase(),recipient=clean($('#representativeArchiveRecipient')?.value),entity=clean($('#representativeArchiveEntity')?.value),status=clean($('#representativeArchiveStatus')?.value),from=clean($('#representativeArchiveFrom')?.value),to=clean($('#representativeArchiveTo')?.value);
 const a=all.filter(m=>{
   if(q&&![m.recipientName,m.entity,m.subject,m.recipientRole,m.consecutive].some(v=>clean(v).toLowerCase().includes(q)))return false;
   if(recipient&&clean(m.recipientName)!==recipient)return false;
   if(entity&&clean(m.entity)!==entity)return false;
   if(status==='pending'&&clean(m.consecutive))return false;
   if(status==='assigned'&&!clean(m.consecutive))return false;
   if(from&&clean(m.date)<from)return false;
   if(to&&clean(m.date)>to)return false;
   return true;
 });
 $('#representativeArchiveSummary').textContent=`${a.length} de ${all.length} documento${all.length===1?'':'s'}`;
 const el=$('#representativeArchiveList');el.innerHTML=a.length?a.map(row).join(''):'<div class="rep-empty">No hay documentos que coincidan con los filtros seleccionados.</div>';bindRows(el)
}
renderRecent();
})();
