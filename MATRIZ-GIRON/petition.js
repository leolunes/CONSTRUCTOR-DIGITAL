/* ============================================================
   Derecho de Petición por necesidad · v1.3.1
   Módulo aislado: no modifica el motor base app.js.
   Genera un PDF real (páginas rasterizadas) con firma manuscrita
   capturada en pantalla y guarda trazabilidad dentro de la necesidad.
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

  const clean = v => String(v ?? '').trim();
  const escLocal = v => clean(v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const todayISO = () => new Date().toISOString().slice(0,10);
  const uidLocal = () => (crypto.randomUUID ? crypto.randomUUID() : 'pet-'+Date.now()+'-'+Math.random().toString(16).slice(2));
  const formatDate = iso => {
    if (!iso) return '';
    const d = new Date(iso + 'T12:00:00');
    return new Intl.DateTimeFormat('es-CO',{day:'2-digit',month:'long',year:'numeric'}).format(d);
  };

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

  function defaultRequests(n){
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
    form.elements.needId.value = n.id;
    form.elements.entity.value = clean(n.competentEntity);
    form.elements.recipient.value = '';
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
  function openPetitionCenter(){ renderPetitionCenter(); centerModal?.classList.add('open'); }
  window.openPetitionCenter = openPetitionCenter;
  document.getElementById('petitionCenterNav')?.addEventListener('click',openPetitionCenter);
  document.getElementById('petitionCenterQuick')?.addEventListener('click',openPetitionCenter);
  document.querySelectorAll('[data-petition-center-close]').forEach(b=>b.addEventListener('click',()=>centerModal?.classList.remove('open')));
  centerModal?.addEventListener('click',e=>{if(e.target===centerModal)centerModal.classList.remove('open')});

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
    signatureHasInk=false; drawing=false; last=null;
  }
  function pointerPos(e){ const r=signCanvas.getBoundingClientRect(); return {x:(e.clientX-r.left)*(signCanvas.width/r.width), y:(e.clientY-r.top)*(signCanvas.height/r.height)}; }
  signCanvas.addEventListener('pointerdown',e=>{ e.preventDefault(); drawing=true; last=pointerPos(e); signCanvas.setPointerCapture?.(e.pointerId); });
  signCanvas.addEventListener('pointermove',e=>{ if(!drawing)return; e.preventDefault(); const p=pointerPos(e),ctx=signCanvas.getContext('2d'); ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;signatureHasInk=true; });
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

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fd=Object.fromEntries(new FormData(form).entries());
    const n=getNeed(fd.needId); if(!n)return;
    if(!signatureHasInk){ alert('Por favor firme en el recuadro antes de generar el PDF.'); return; }
    if(!clean(fd.entity)){ alert('Indique la entidad destinataria.'); return; }
    const submit=form.querySelector('button[type="submit"]'); const old=submit.textContent; submit.disabled=true; submit.textContent='Generando PDF...';
    try{
      const signature=signCanvas.toDataURL('image/png');
      const data={...fd,need:n,signature,generatedAt:new Date().toISOString()};
      const blob=await buildPetitionPDF(data);
      const safe=(n.code||'NECESIDAD').replace(/[^A-Za-z0-9_-]+/g,'-');
      downloadPDF(blob,`DERECHO-PETICION-${safe}-${todayISO()}.pdf`);
      n.petitions = Array.isArray(n.petitions) ? n.petitions : [];
      n.petitions.push({id:uidLocal(),generatedAt:data.generatedAt,entity:clean(fd.entity),recipient:clean(fd.recipient),petitionerName:clean(fd.petitionerName),petitionerId:clean(fd.petitionerId),subject:clean(fd.subject),radicado:clean(fd.radicado),radicadoDate:clean(fd.radicadoDate),status:fd.radicado?'Radicado':'Generado'});
      saveDB();
      try{ toast('Derecho de Petición generado y guardado en la trazabilidad'); }catch(_){ }
      closePetition(); setTimeout(injectButtons,120);
    }catch(err){ console.error(err); alert('No fue posible generar el PDF: '+err.message); }
    finally{submit.disabled=false;submit.textContent=old;}
  });

  function downloadPDF(blob,name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000); }

  async function buildPetitionPDF(d){
    const W=1240,H=1754,M=105,BOTTOM=120;
    const pages=[]; let c,ctx,y;
    function newPage(){ c=document.createElement('canvas');c.width=W;c.height=H;ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);pages.push(c);y=105; }
    function font(size=24,bold=false,italic=false){ ctx.font=`${italic?'italic ':''}${bold?'700 ':'400 '}${size}px Arial, sans-serif`; ctx.fillStyle='#121b27'; }
    function line(){ ctx.strokeStyle='#173b66';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(M,y);ctx.lineTo(W-M,y);ctx.stroke();y+=24; }
    function ensure(h){if(y+h>H-BOTTOM)newPage();}
    function textBlock(text,{size=24,bold=false,italic=false,align='left',gap=12,indent=0}={}){
      const paras=String(text||'').split(/\n/); font(size,bold,italic); const maxW=W-2*M-indent; const lh=Math.round(size*1.48);
      paras.forEach((par,pi)=>{
        const words=par.split(/\s+/).filter(Boolean); const lines=[]; let line='';
        if(!words.length){lines.push('');}
        words.forEach(w=>{const test=line?line+' '+w:w;if(ctx.measureText(test).width>maxW&&line){lines.push(line);line=w}else line=test});if(line)lines.push(line);
        lines.forEach(L=>{ensure(lh+5);font(size,bold,italic);ctx.textAlign=align;const x=align==='center'?W/2:(align==='right'?W-M:M+indent);ctx.fillText(L,x,y);y+=lh;});
        if(pi<paras.length-1)y+=Math.round(lh*.25);
      }); y+=gap; ctx.textAlign='left';
    }
    function sectionTitle(t){ensure(55);font(25,true);ctx.fillStyle='#073763';ctx.fillText(t,M,y);y+=42;}
    function field(label,value){ if(!clean(value))return; textBlock(`${label}: ${clean(value)}`,{size:23,gap:8}); }

    newPage();
    textBlock('DERECHO DE PETICIÓN',{size:34,bold:true,align:'center',gap:4});
    textBlock('Artículo 23 de la Constitución Política · Ley 1755 de 2015',{size:19,align:'center',gap:20});
    line();
    textBlock(`Girón, Santander, ${new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'long',year:'numeric'}).format(new Date())}`,{size:22,gap:25});
    textBlock('Señores',{size:23,bold:true,gap:2});
    textBlock(clean(d.entity).toUpperCase(),{size:24,bold:true,gap:2});
    if(clean(d.recipient)) textBlock(clean(d.recipient),{size:22,gap:18});
    field('Asunto',d.subject);
    textBlock(`Yo, ${clean(d.petitionerName)}, identificado(a) con ${clean(d.petitionerId)}, actuando en nombre propio y en ejercicio del derecho fundamental de petición consagrado en el artículo 23 de la Constitución Política y desarrollado por la Ley 1755 de 2015, presento respetuosamente la siguiente solicitud:`,{size:23,gap:20});
    sectionTitle('I. HECHOS'); textBlock(d.facts,{size:23,gap:20});
    sectionTitle('II. PETICIONES'); textBlock(d.requests,{size:23,gap:20});
    sectionTitle('III. FUNDAMENTO');
    textBlock('La presente petición se formula con fundamento en el artículo 23 de la Constitución Política y en las disposiciones aplicables de la Ley 1755 de 2015. Solicito que la respuesta sea clara, de fondo, congruente con lo solicitado y comunicada dentro de los términos legales correspondientes.',{size:23,gap:20});
    if(clean(d.attachments)){ sectionTitle('IV. ANEXOS / EVIDENCIAS'); textBlock(d.attachments,{size:23,gap:20}); }
    sectionTitle('V. NOTIFICACIONES');
    field('Dirección',d.address); field('Teléfono',d.phone); field('Correo electrónico',d.email);
    if(clean(d.radicado)||clean(d.radicadoDate)){ sectionTitle('DATOS DE RADICACIÓN'); field('Radicado',d.radicado); field('Fecha de radicación',formatDate(d.radicadoDate)); }
    ensure(300); y+=20; textBlock('Cordialmente,',{size:23,gap:10});
    const sig=await loadImage(d.signature); const sigW=360,sigH=115;ctx.drawImage(sig,M,y,sigW,sigH);y+=sigH+8;
    textBlock(clean(d.petitionerName),{size:23,bold:true,gap:2});
    textBlock(clean(d.petitionerId),{size:21,gap:4});
    textBlock('Firma manuscrita electrónica capturada en pantalla',{size:16,italic:true,gap:18});
    line();
    textBlock(`Referencia interna de la Matriz: ${clean(d.need.code)} · ${clean(d.need.territory)} · ${clean(d.need.title)}`,{size:16,italic:true,gap:0});

    const jpegs=pages.map(p=>dataUrlBytes(p.toDataURL('image/jpeg',0.90)));
    return pdfFromJpegs(jpegs,W,H);
  }

  function loadImage(src){ return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src;}); }
  function dataUrlBytes(url){ const b=atob(url.split(',')[1]);const a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a; }
  function concat(parts){let len=0;parts.forEach(p=>len+=p.length);const out=new Uint8Array(len);let o=0;parts.forEach(p=>{out.set(p,o);o+=p.length});return out;}
  function ascii(s){return new TextEncoder().encode(s);}

  function pdfFromJpegs(images,pixelW,pixelH){
    const pw=595.28, ph=841.89; const n=images.length; const totalObjs=2+n*3; const bodies=new Array(totalObjs+1);
    bodies[1]=ascii('<< /Type /Catalog /Pages 2 0 R >>');
    const pageRefs=[];
    for(let i=0;i<n;i++)pageRefs.push(`${3+i*3} 0 R`);
    bodies[2]=ascii(`<< /Type /Pages /Kids [${pageRefs.join(' ')}] /Count ${n} >>`);
    for(let i=0;i<n;i++){
      const pageObj=3+i*3,imgObj=pageObj+1,contentObj=pageObj+2;
      bodies[pageObj]=ascii(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 ${imgObj} 0 R >> >> /Contents ${contentObj} 0 R >>`);
      const im=images[i]; bodies[imgObj]=concat([ascii(`<< /Type /XObject /Subtype /Image /Width ${pixelW} /Height ${pixelH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.length} >>\nstream\n`),im,ascii('\nendstream')]);
      const stream=`q\n${pw} 0 0 ${ph} 0 0 cm\n/Im0 Do\nQ\n`; bodies[contentObj]=ascii(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);
    }
    const chunks=[ascii('%PDF-1.4\n%âãÏÓ\n')]; const offsets=new Array(totalObjs+1).fill(0); let pos=chunks[0].length;
    for(let i=1;i<=totalObjs;i++){offsets[i]=pos;const head=ascii(`${i} 0 obj\n`),tail=ascii('\nendobj\n');chunks.push(head,bodies[i],tail);pos+=head.length+bodies[i].length+tail.length;}
    const xrefPos=pos; let xref=`xref\n0 ${totalObjs+1}\n0000000000 65535 f \n`; for(let i=1;i<=totalObjs;i++)xref+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
    const trailer=`trailer\n<< /Size ${totalObjs+1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
    chunks.push(ascii(xref+trailer)); return new Blob([concat(chunks)],{type:'application/pdf'});
  }
})();
