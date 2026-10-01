/* ============================================================
   Red de contactos autorizados · v1.3.11
   No registra ni infiere preferencias políticas.
   Gestiona autorización de comunicaciones, WhatsApp y PDF.
   ============================================================ */
(() => {
  'use strict';
  const clean=v=>String(v??'').trim();
  const digits=v=>clean(v).replace(/\D/g,'');
  const fmtDate=iso=>{if(!iso)return '—';try{return new Intl.DateTimeFormat('es-CO',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(iso+'T12:00:00'))}catch{return iso}};

  const VEREDAS=['GIRÓN - ÁREA URBANA','VEREDA MARTA','VEREDA SOGAMOSO','VEREDA LA PARROQUIA','VEREDA CEDRO','VEREDA MOTOSO','VEREDA BOCAS','VEREDA CARRIZAL','VEREDA RIO FRIO','VEREDA LLANADAS','VEREDA BARBOSA','VEREDA LLANO GRANDE','VEREDA ACAPULCO','VEREDA RUITOQUE','VEREDA PEÑAS','VEREDA CHOCOITA','VEREDA PALOGORDO','VEREDA PANTANO','VEREDA CANTALTA','VEREDA CHOCOA'];
  function fillLeaderVeredas(){const s=document.getElementById('leaderVereda');if(!s)return;const current=s.value;s.innerHTML='<option value="">Sin asignar / no aplica</option>'+VEREDAS.map(v=>`<option value="${v}">${v}</option>`).join('');s.value=current;}

  window.openLeaderWhatsApp = id => {
    const l=(window.db||db).leaders.find(x=>x.id===id); if(!l)return;
    if(l.communicationsConsent!=='Sí'){alert('Este contacto no tiene autorización registrada para recibir comunicaciones.');return;}
    let n=digits(l.whatsapp||l.phone); if(!n){alert('Este contacto no tiene número de WhatsApp registrado.');return;}
    if(n.length===10)n='57'+n;
    const msg=`Hola ${clean(l.name)}. Reciba un cordial saludo. Este mensaje se envía a través de la Matriz Maestra de Gestión Territorial para Girón.`;
    window.open(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`,'_blank','noopener');
    l.lastCommunication=new Date().toISOString().slice(0,10); try{saveDB()}catch(_){localStorage.setItem('matriz_giron_v1',JSON.stringify(window.db||db));}
  };

  function wrapText(ctx,text,maxW){
    const words=clean(text).split(/\s+/); const lines=[]; let line='';
    words.forEach(w=>{const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){lines.push(line);line=w}else line=t}); if(line)lines.push(line); return lines;
  }
  function pdfFromJpegs(images,pw,ph){
    const enc=new TextEncoder(), ascii=s=>enc.encode(s), concat=arr=>{let n=arr.reduce((a,b)=>a+b.length,0),o=new Uint8Array(n),p=0;arr.forEach(b=>{o.set(b,p);p+=b.length});return o};
    const pageW=595.28,pageH=841.89,totalObjs=2+images.length*3,chunks=[ascii('%PDF-1.4\n%âãÏÓ\n')],offsets=new Array(totalObjs+1).fill(0);let pos=chunks[0].length;
    const add=(id,parts)=>{offsets[id]=pos;const pre=ascii(`${id} 0 obj\n`),post=ascii('\nendobj\n');chunks.push(pre,...parts,post);pos+=pre.length+parts.reduce((a,b)=>a+b.length,0)+post.length};
    add(1,[ascii('<< /Type /Catalog /Pages 2 0 R >>')]); const kids=images.map((_,i)=>`${3+i*3} 0 R`).join(' '); add(2,[ascii(`<< /Type /Pages /Kids [${kids}] /Count ${images.length} >>`)]);
    images.forEach((im,i)=>{const pg=3+i*3,ct=pg+1,io=pg+2,cmd=`q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im0 Do\nQ\n`;add(pg,[ascii(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 ${io} 0 R >> >> /Contents ${ct} 0 R >>`)]);add(ct,[ascii(`<< /Length ${cmd.length} >>\nstream\n${cmd}endstream`)]);add(io,[ascii(`<< /Type /XObject /Subtype /Image /Width ${pw} /Height ${ph} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.length} >>\nstream\n`),im,ascii('\nendstream')]);});
    const xrefPos=pos;let xref=`xref\n0 ${totalObjs+1}\n0000000000 65535 f \n`;for(let i=1;i<=totalObjs;i++)xref+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';const trailer=`trailer\n<< /Size ${totalObjs+1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;chunks.push(ascii(xref+trailer));return new Blob([concat(chunks)],{type:'application/pdf'});
  }
  async function imageBytesFromCanvas(c){const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',0.9));return new Uint8Array(await blob.arrayBuffer())}
  function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}

  async function buildContactsPDF(){
    const leaders=(window.db||db).leaders.filter(l=>l.communicationsConsent==='Sí').slice().sort((a,b)=>clean(a.territory).localeCompare(clean(b.territory),'es')||clean(a.name).localeCompare(clean(b.name),'es'));
    if(!leaders.length){alert('No hay contactos con autorización registrada para recibir comunicaciones.');return null;}
    const W=1240,H=1754,margin=88,rowH=54; const pages=[]; let c,ctx,y;
    let logo=null; try{logo=await loadImage('assets/ivan-ortiz-foto.png')}catch(_){ }
    const newPage=(pageNo)=>{c=document.createElement('canvas');c.width=W;c.height=H;ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.fillStyle='#073763';ctx.fillRect(0,0,W,155);if(logo){ctx.save();ctx.beginPath();ctx.arc(100,77,52,0,Math.PI*2);ctx.clip();ctx.drawImage(logo,48,25,104,104);ctx.restore()}ctx.fillStyle='#fff';ctx.font='bold 32px Arial';ctx.fillText('RED DE CONTACTOS AUTORIZADOS',180,67);ctx.font='22px Arial';ctx.fillText('Matriz Maestra de Gestión Territorial para Girón',180,105);ctx.fillStyle='#073763';ctx.font='bold 24px Arial';ctx.fillText(`Total de contactos autorizados: ${leaders.length}`,margin,205);ctx.font='18px Arial';ctx.fillStyle='#536579';ctx.fillText(`Generado: ${new Intl.DateTimeFormat('es-CO',{day:'2-digit',month:'long',year:'numeric'}).format(new Date())}`,margin,238);y=285;ctx.fillStyle='#eaf2fa';ctx.fillRect(margin,y,W-margin*2,46);ctx.fillStyle='#073763';ctx.font='bold 16px Arial';[['Nombre',0],['Calidad',270],['Vereda',470],['WhatsApp',730],['Último contacto',930]].forEach(([t,x])=>ctx.fillText(t,margin+x,y+29));y+=46;};
    let pageNo=1;newPage(pageNo);
    for(const l of leaders){if(y+rowH>H-110){pages.push(await imageBytesFromCanvas(c));newPage(++pageNo)}ctx.strokeStyle='#d9e5f1';ctx.beginPath();ctx.moveTo(margin,y+rowH);ctx.lineTo(W-margin,y+rowH);ctx.stroke();ctx.fillStyle='#15243a';ctx.font='15px Arial';const vals=[clean(l.name),clean(l.role),clean(l.vereda||l.territory||l.organization),clean(l.whatsapp||l.phone),fmtDate(l.lastCommunication)];const widths=[255,185,245,175,180];let x=margin;vals.forEach((v,i)=>{const lines=wrapText(ctx,v||'—',widths[i]);lines.slice(0,2).forEach((ln,j)=>ctx.fillText(ln,x,y+22+j*18));x+= [270,200,260,200,0][i]});y+=rowH;}
    ctx.fillStyle='#718096';ctx.font='14px Arial';ctx.fillText('Este listado incluye únicamente contactos con autorización registrada para recibir comunicaciones.',margin,H-60);pages.push(await imageBytesFromCanvas(c));return pdfFromJpegs(pages,W,H);
  }

  // v1.3.16: al pulsar "+ Nuevo contacto" se limpia cualquier ID de edición previo.
  // Esto evita que un alta nueva sobrescriba el último líder editado.
  const newLeaderBtn=document.querySelector('[data-open-modal="leaderModal"]');
  if(newLeaderBtn)newLeaderBtn.addEventListener('click',()=>{
    const f=document.getElementById('leaderForm');
    if(!f)return;
    f.reset();
    if(f.elements.id)f.elements.id.value='';
    if(f.elements.communicationsConsent)f.elements.communicationsConsent.value='Pendiente';
    if(f.elements.preferredChannel)f.elements.preferredChannel.value='WhatsApp';
    setTimeout(fillLeaderVeredas,0);
  });

  fillLeaderVeredas();
  const leaderModal=document.getElementById('leaderModal');if(leaderModal)new MutationObserver(()=>{if(leaderModal.classList.contains('open'))fillLeaderVeredas()}).observe(leaderModal,{attributes:true,attributeFilter:['class']});
  const btn=document.getElementById('contactsPdfBtn');
  if(btn)btn.addEventListener('click',async()=>{const old=btn.textContent;btn.disabled=true;btn.textContent='Generando PDF...';try{const blob=await buildContactsPDF();if(!blob)return;const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`CONTACTOS-AUTORIZADOS-GIRON-${new Date().toISOString().slice(0,10)}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200)}finally{btn.disabled=false;btn.textContent=old}});
})();
