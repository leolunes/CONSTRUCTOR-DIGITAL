/* ============================================================
   Cumpleaños de contactos autorizados · v1.3.14
   Módulo aislado: no modifica app.js ni la clave de almacenamiento.
   ============================================================ */
(() => {
  'use strict';
  const clean=v=>String(v??'').trim();
  const digits=v=>clean(v).replace(/\D/g,'');
  const getDB=()=>window.db || (typeof db!=='undefined'?db:null);
  let current=null, currentBlob=null, birthdayTemplate='1';
  const birthdayTexts={
    '1':'Que este nuevo año de vida llegue lleno de salud, alegría, sueños cumplidos y muchas bendiciones para usted y su familia.',
    '2':'Hoy celebramos el regalo de su vida. Que este nuevo año esté lleno de momentos especiales, nuevas oportunidades y muchas razones para sonreír.',
    '3':'Que cada nuevo día de este año de vida le acerque a sus sueños, fortalezca sus propósitos y le permita seguir dejando una huella positiva en quienes le rodean.',
    '4':'En este día especial deseo que Dios bendiga su vida, su familia y cada uno de sus proyectos. Que el nuevo año que comienza esté acompañado de salud, paz, sabiduría y nuevas oportunidades.'
  };
  const suggestedBirthdayText=()=>birthdayTexts[birthdayTemplate]||birthdayTexts['1'];
  const pad=n=>String(n).padStart(2,'0');
  const GREET_KEY='matriz_giron_birthday_greeted_v1';
  function greetedMap(){try{return JSON.parse(localStorage.getItem(GREET_KEY)||'{}')}catch(_){return {}}}
  function birthdayKey(l){const n=nextBirthday(l.birthDate);return n?`${l.id}|${n.date.getFullYear()}-${pad(n.date.getMonth()+1)}-${pad(n.date.getDate())}`:''}
  function isGreeted(l){const k=birthdayKey(l);return !!(k&&greetedMap()[k])}
  function markGreeted(l){if(!l)return;const k=birthdayKey(l);if(!k)return;const m=greetedMap();m[k]=new Date().toISOString();localStorage.setItem(GREET_KEY,JSON.stringify(m));render();renderReminder()}
  function unmarkGreeted(l){if(!l)return;const k=birthdayKey(l),m=greetedMap();delete m[k];localStorage.setItem(GREET_KEY,JSON.stringify(m));render();renderReminder()}
  function parts(v){if(!v)return null;const m=String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?{y:+m[1],m:+m[2],d:+m[3]}:null}
  function nextBirthday(v){const p=parts(v);if(!p)return null;const now=new Date(), today=new Date(now.getFullYear(),now.getMonth(),now.getDate());let d=new Date(now.getFullYear(),p.m-1,p.d);if(d<today)d=new Date(now.getFullYear()+1,p.m-1,p.d);return {date:d,days:Math.round((d-today)/86400000)}}
  function fmt(v){const p=parts(v);if(!p)return '—';return new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'long'}).format(new Date(2000,p.m-1,p.d))}
  function authorized(l){const v=clean(l.communicationsConsent).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();return v==='si'||v==='sí'||v==='yes'}
  function birthdayRows(data,days=30){return (data?.leaders||[]).filter(l=>authorized(l)&&parts(l.birthDate)).map(l=>({...l,_next:nextBirthday(l.birthDate)})).filter(l=>l._next&&l._next.days>=0&&l._next.days<=days).sort((a,b)=>a._next.days-b._next.days)}
  function renderDashboard(){
    const el=document.getElementById('birthdayDashboardPanel'),data=getDB();if(!el||!data)return;
    const rows=birthdayRows(data,7),today=rows.filter(l=>l._next.days===0),pending=rows.filter(l=>!isGreeted(l));
    el.innerHTML=`<div class="birthday-dashboard-head"><div><h3>🎂 Asistente de cumpleaños</h3><p>${today.length?`<strong>${today.length} cumpleaños HOY</strong>`:'No hay cumpleaños hoy'} · ${pending.length} pendiente${pending.length===1?'':'s'} en los próximos 7 días</p></div><button type="button" id="birthdayDashboardOpen">Ver cumpleaños</button></div>${rows.length?`<div class="birthday-dashboard-list">${rows.slice(0,5).map(l=>`<div class="birthday-dashboard-person ${l._next.days===0?'today':''} ${isGreeted(l)?'done':''}"><div><strong>${l._next.days===0?'🎉 HOY · ':l._next.days===1?'📅 MAÑANA · ':`📅 EN ${l._next.days} DÍAS · `}${clean(l.name)}</strong><small>${fmt(l.birthDate)} · ${clean(l.contactType||l.role||'Contacto')} ${isGreeted(l)?'· ✓ Ya felicitado':''}</small></div><div><button type="button" data-dash-card="${l.id}">🎨 Tarjeta</button><button type="button" data-dash-wa="${l.id}">🟢 WhatsApp</button><button type="button" data-dash-mark="${l.id}">${isGreeted(l)?'↩ Pendiente':'✓ Ya felicité'}</button></div></div>`).join('')}</div>`:`<div class="birthday-empty">No hay cumpleaños registrados para los próximos 7 días.</div>`}`;
    document.getElementById('birthdayDashboardOpen')?.addEventListener('click',()=>{renderReminder();document.getElementById('birthdayReminderModal')?.classList.add('open')});
    el.querySelectorAll('[data-dash-card]').forEach(b=>b.onclick=()=>openCard(b.dataset.dashCard));
    el.querySelectorAll('[data-dash-wa]').forEach(b=>b.onclick=()=>quickWhatsapp(b.dataset.dashWa));
    el.querySelectorAll('[data-dash-mark]').forEach(b=>b.onclick=()=>{const l=(data.leaders||[]).find(x=>String(x.id)===String(b.dataset.dashMark));if(l){isGreeted(l)?unmarkGreeted(l):markGreeted(l)}});
  }
  function render(){
    const el=document.getElementById('birthdayPanel'), data=getDB();if(!el||!data)return;
    const all=(data.leaders||[]).filter(l=>authorized(l)&&parts(l.birthDate)).map(l=>({...l,_next:nextBirthday(l.birthDate)})).filter(l=>l._next).sort((a,b)=>a._next.days-b._next.days);
    const today=all.filter(l=>l._next.days===0), week=all.filter(l=>l._next.days>=0&&l._next.days<=7), month=all.filter(l=>l._next.days>=0&&l._next.days<=30);
    const show=all.filter(l=>l._next.days<=30).slice(0,9);
    el.innerHTML=`<div class="birthday-panel-head"><div><h3>🎂 Cumpleaños de la red</h3><small class="muted">Seguimiento para contactos autorizados a recibir comunicaciones.</small></div><div class="birthday-summary"><span class="birthday-chip">Hoy: ${today.length}</span><span class="birthday-chip">Próximos 7 días: ${week.length}</span><span class="birthday-chip">Próximos 30 días: ${month.length}</span></div></div>${show.length?`<div class="birthday-list">${show.map(l=>`<div class="birthday-item ${l._next.days===0?'today':''} ${isGreeted(l)?'birthday-done':''}"><div class="birthday-person"><strong>${l._next.days===0?'🎉 HOY · ':''}${clean(l.name)} ${isGreeted(l)?'✓':''}</strong><small>${fmt(l.birthDate)} · ${clean(l.role||l.contactType||'Contacto')} · ${clean(l.vereda||l.territory||'Girón')} · ${l._next.days===0?'Hoy':l._next.days===1?'Mañana':`En ${l._next.days} días`}</small></div><div class="birthday-actions"><button class="birthday-greet" data-birthday-id="${l.id}">🎨 Tarjeta</button><button class="birthday-wa-mini" data-birthday-wa="${l.id}">🟢 WhatsApp</button><button class="birthday-mark" data-birthday-mark="${l.id}">${isGreeted(l)?'↩ Pendiente':'✓ Ya felicité'}</button></div></div>`).join('')}</div>`:`<div class="birthday-empty">No hay cumpleaños registrados para los próximos 30 días.</div>`}`;
    el.querySelectorAll('[data-birthday-id]').forEach(b=>b.onclick=()=>openCard(b.dataset.birthdayId));
    el.querySelectorAll('[data-birthday-wa]').forEach(b=>b.onclick=()=>quickWhatsapp(b.dataset.birthdayWa));
    el.querySelectorAll('[data-birthday-mark]').forEach(b=>b.onclick=()=>{const l=(data.leaders||[]).find(x=>String(x.id)===String(b.dataset.birthdayMark));if(l){isGreeted(l)?unmarkGreeted(l):markGreeted(l)}});
    renderDashboard();
  }
  function quickWhatsapp(id){
    const data=getDB(),l=(data?.leaders||[]).find(x=>String(x.id)===String(id));if(!l)return;
    let n=digits(l.whatsapp||l.phone);if(!n){alert('Este contacto no tiene número de WhatsApp registrado.');return}if(n.length===10)n='57'+n;
    const msg=`¡Feliz cumpleaños, ${clean(l.name)}! 🎉🎂\n\nQue este nuevo año de vida llegue lleno de salud, alegría y muchas bendiciones para usted y su familia.\n\nCon aprecio,\nIván Ortiz`;
    window.open(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`,'_blank','noopener');
  }
  function ensureReminderModal(){
    if(document.getElementById('birthdayReminderModal'))return;
    const d=document.createElement('div');d.className='modal';d.id='birthdayReminderModal';
    d.innerHTML=`<div class="modal-card birthday-reminder-card"><div class="modal-head"><div><h3>🎂 Asistente de cumpleaños</h3><p class="petition-subtitle">Recordatorio automático de cumpleaños de su red.</p></div><button type="button" id="birthdayReminderClose">×</button></div><div id="birthdayReminderBody"></div><div class="form-actions"><button class="secondary" type="button" id="birthdayReminderClose2">Cerrar</button></div></div>`;
    document.body.appendChild(d);document.getElementById('birthdayReminderClose').onclick=()=>d.classList.remove('open');document.getElementById('birthdayReminderClose2').onclick=()=>d.classList.remove('open');
  }
  function renderReminder(){
    ensureReminderModal();const data=getDB(),body=document.getElementById('birthdayReminderBody');if(!data||!body)return;
    const upcoming=(data.leaders||[]).filter(l=>authorized(l)&&parts(l.birthDate)).map(l=>({...l,_next:nextBirthday(l.birthDate)})).filter(l=>l._next&&l._next.days<=7).sort((a,b)=>a._next.days-b._next.days);
    const pending=upcoming.filter(l=>!isGreeted(l));
    body.innerHTML=upcoming.length?`<div class="birthday-reminder-summary"><strong>${pending.length} felicitación${pending.length===1?'':'es'} pendiente${pending.length===1?'':'s'} en los próximos 7 días</strong><span>No deje pasar una fecha importante.</span></div><div class="birthday-reminder-list">${upcoming.map(l=>`<div class="birthday-reminder-row ${isGreeted(l)?'done':''}"><div><strong>${l._next.days===0?'🎉 HOY':l._next.days===1?'📅 MAÑANA':`📅 EN ${l._next.days} DÍAS`} · ${clean(l.name)}</strong><small>${fmt(l.birthDate)} · ${clean(l.contactType||l.role||'Contacto')} ${isGreeted(l)?'· ✓ Ya felicitado':''}</small></div><div><button type="button" data-rem-card="${l.id}">🎨 Tarjeta</button><button type="button" data-rem-wa="${l.id}">🟢 WhatsApp</button><button type="button" data-rem-mark="${l.id}">${isGreeted(l)?'↩ Pendiente':'✓ Ya felicité'}</button></div></div>`).join('')}</div>`:`<div class="birthday-empty">No hay cumpleaños registrados para los próximos 7 días.</div>`;
    body.querySelectorAll('[data-rem-card]').forEach(b=>b.onclick=()=>openCard(b.dataset.remCard));
    body.querySelectorAll('[data-rem-wa]').forEach(b=>b.onclick=()=>quickWhatsapp(b.dataset.remWa));
    body.querySelectorAll('[data-rem-mark]').forEach(b=>b.onclick=()=>{const l=(data.leaders||[]).find(x=>String(x.id)===String(b.dataset.remMark));if(l){isGreeted(l)?unmarkGreeted(l):markGreeted(l)}});
  }
  function autoBirthdayReminder(){
    const data=getDB();if(!data)return;const upcoming=(data.leaders||[]).filter(l=>authorized(l)&&parts(l.birthDate)).map(l=>({...l,_next:nextBirthday(l.birthDate)})).filter(l=>l._next&&l._next.days<=7&&!isGreeted(l));
    if(!upcoming.length)return;
    const key='birthdayReminderShown:'+new Date().toISOString().slice(0,10);
    if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');renderReminder();document.getElementById('birthdayReminderModal')?.classList.add('open');
  }
    function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
  function wrap(ctx,text,x,y,maxW,lineH,maxLines=99){const words=clean(text).split(/\s+/);let line='',lines=[];for(const w of words){const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){lines.push(line);line=w}else line=t}if(line)lines.push(line);lines.slice(0,maxLines).forEach((ln,i)=>ctx.fillText(ln,x,y+i*lineH));return Math.min(lines.length,maxLines)*lineH}
  async function drawCard(l){
    const c=document.getElementById('birthdayCardCanvas'),ctx=c.getContext('2d'),W=c.width,H=c.height;
    birthdayTemplate=document.querySelector('input[name="birthdayTemplate"]:checked')?.value||'1'; const palettes={1:['#062a52','#0b4c83','#031e3d','#f3bf23'],2:['#4b1735','#8a315f','#26091a','#f6d58a'],3:['#f5efe5','#e6d2b5','#c69c6d','#183b36'],4:['#16352d','#2f6a58','#0d211c','#f2c14e']},P=palettes[birthdayTemplate]; const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,P[0]);g.addColorStop(.55,P[1]);g.addColorStop(1,P[2]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<28;i++){ctx.beginPath();ctx.arc((i*173)%W,(i*251)%H,8+(i%5)*5,0,Math.PI*2);ctx.fill()}
    ctx.strokeStyle=P[3];ctx.lineWidth=5;ctx.strokeRect(42,42,W-84,H-84);
    let photo=null,logo=null;try{photo=await loadImage('assets/ivan-ortiz-foto.png')}catch(_){}try{logo=await loadImage('assets/ivan-ortiz-marca.png')}catch(_){}
    if(photo){ctx.save();ctx.beginPath();ctx.arc(170,175,88,0,Math.PI*2);ctx.clip();ctx.drawImage(photo,82,87,176,176);ctx.restore();ctx.strokeStyle='#f3bf23';ctx.lineWidth=5;ctx.beginPath();ctx.arc(170,175,90,0,Math.PI*2);ctx.stroke()}
    if(logo){const lw=320,lh=lw*(logo.height/logo.width);ctx.drawImage(logo,W-lw-70,95,lw,lh);}
    ctx.textAlign='center';ctx.fillStyle=P[3];ctx.font=`bold ${birthdayTemplate==='3'?42:46}px Arial`;ctx.fillText(birthdayTemplate==='2'?'CELEBRAMOS TU VIDA':birthdayTemplate==='4'?'UN DÍA MUY ESPECIAL':'¡FELIZ CUMPLEAÑOS!',W/2,330);
    ctx.fillStyle=birthdayTemplate==='3'?'#173b36':'#fff';ctx.font='bold 62px Arial';wrap(ctx,clean(l.name).toUpperCase(),W/2,410,820,72,2);
    ctx.font='30px Arial';ctx.fillStyle=birthdayTemplate==='3'?'#173b36':'#f4f7fb';const msg=clean(document.getElementById('birthdayCardText')?.value)||suggestedBirthdayText();wrap(ctx,msg,W/2,570,820,43,4);
    ctx.font='28px Arial';ctx.fillStyle=birthdayTemplate==='3'?'#315b54':'#dbe9f7';wrap(ctx,'Que este nuevo año de vida esté lleno de buenos momentos para compartir con las personas que aprecia.',W/2,755,820,40,3);
    ctx.fillStyle='#f8c62b';ctx.font='italic 28px Georgia';ctx.fillText('Con aprecio,',W/2,895);if(logo){const sw=360,sh=sw*(logo.height/logo.width);ctx.drawImage(logo,(W-sw)/2,920,sw,sh);}ctx.font='22px Arial';ctx.fillStyle=birthdayTemplate==='3'?'#315b54':'#dbe9f7';ctx.fillText('Con nuestros mejores deseos en este día especial',W/2,1010);
    return new Promise(r=>c.toBlob(r,'image/png',.96));
  }
  function refreshBirthdayCard(){if(current)drawCard(current).then(()=>document.getElementById('birthdayCardCanvas')?.toBlob(b=>currentBlob=b,'image/png',.95))}
  async function openCard(id){
    const data=getDB();current=(data?.leaders||[]).find(l=>String(l.id)===String(id));if(!current)return;
    if(!authorized(current)){alert('Este contacto no tiene autorización registrada para recibir comunicaciones.');return}
    document.getElementById('birthdayPersonSummary').textContent=`${current.name} · ${fmt(current.birthDate)} · ${current.vereda||current.territory||'Girón'}`;
    const text=document.getElementById('birthdayCardText');if(text)text.value=birthdayTexts['1'];
    const first=document.querySelector('input[name="birthdayTemplate"][value="1"]');if(first)first.checked=true;
    const modal=document.getElementById('birthdayModal');if(modal){modal.classList.add('open');modal.scrollTop=0}
    currentBlob=await drawCard(current)
  }
  function close(){document.getElementById('birthdayModal')?.classList.remove('open');current=null;currentBlob=null}
  function filename(){return `FELIZ-CUMPLEANOS-${clean(current?.name||'CONTACTO').replace(/[^a-z0-9]+/gi,'-')}.png`}
  async function share(){if(!currentBlob||!current)return;const file=new File([currentBlob],filename(),{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:`Feliz cumpleaños ${current.name}`,text:`¡Feliz cumpleaños, ${current.name}!`});markCommunication();return}catch(e){if(e.name==='AbortError')return}}download();alert('La tarjeta quedó guardada como imagen. Puede adjuntarla directamente en WhatsApp.')}
  function download(){if(!currentBlob)return;const a=document.createElement('a');a.href=URL.createObjectURL(currentBlob);a.download=filename();a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200)}
  function markCommunication(){if(!current)return;markGreeted(current);current.lastCommunication=new Date().toISOString().slice(0,10);try{if(typeof saveDB==='function')saveDB();else localStorage.setItem('matriz_giron_v1',JSON.stringify(getDB()))}catch(_){}setTimeout(render,50)}
  function whatsapp(){if(!current)return;let n=digits(current.whatsapp||current.phone);if(!n){alert('Este contacto no tiene número de WhatsApp registrado.');return}if(n.length===10)n='57'+n;const msg=`¡Feliz cumpleaños, ${clean(current.name)}! 🎉🎂\n\nQue este nuevo año de vida llegue lleno de salud, alegría, sueños cumplidos y muchas bendiciones para usted y su familia. Que disfrute este día especial junto a las personas que aprecia.\n\nCon aprecio,\nIván Ortiz`;window.open(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`,'_blank','noopener');markCommunication()}
  document.getElementById('birthdayMassWhatsApp')?.addEventListener('click',()=>{
    if(!currentBlob||!current){alert('Primero genere la tarjeta de cumpleaños.');return}
    if(typeof window.openCardMassWhatsAppShare!=='function'){alert('No se cargó el selector de WhatsApp. Recargue la aplicación.');return}
    window.openCardMassWhatsAppShare({
      title:`Enviar cumpleaños de ${clean(current.name)}`,
      message:`Hola {nombre}. 🎉\n\nQuiero compartir contigo esta felicitación especial de cumpleaños para ${clean(current.name)}.\n\nCon aprecio,\nIván Ortiz`,
      filename:filename(),
      blob:async()=>currentBlob
    });
  });
  document.querySelectorAll('input[name="birthdayTemplate"]').forEach(r=>r.addEventListener('change',()=>{
    birthdayTemplate=r.value||'1';
    const t=document.getElementById('birthdayCardText');if(t)t.value=suggestedBirthdayText();
    refreshBirthdayCard();
  }));
  document.getElementById('birthdayCardText')?.addEventListener('input',()=>{clearTimeout(window.__bdTextTimer);window.__bdTextTimer=setTimeout(refreshBirthdayCard,180)});
  document.getElementById('birthdayRestoreText')?.addEventListener('click',()=>{const t=document.getElementById('birthdayCardText');if(t){t.value=suggestedBirthdayText();refreshBirthdayCard()}});
  document.getElementById('birthdayClose')?.addEventListener('click',close);document.getElementById('birthdayShare')?.addEventListener('click',share);document.getElementById('birthdayDownload')?.addEventListener('click',download);document.getElementById('birthdayWhatsApp')?.addEventListener('click',whatsapp);
  document.getElementById('leaderForm')?.addEventListener('submit',()=>setTimeout(()=>{render();renderDashboard();renderReminder();const d=getDB();const hasToday=birthdayRows(d,0).some(l=>!isGreeted(l));if(hasToday)document.getElementById('birthdayReminderModal')?.classList.add('open')},180));
  document.addEventListener('click',e=>{if(e.target?.matches('[data-open-modal="leaderModal"]'))setTimeout(()=>{const f=document.getElementById('leaderForm');if(f&&!f.elements.id.value)f.elements.birthDate.value=''},0)});
  window.addEventListener('storage',()=>{render();renderDashboard();renderReminder()});document.addEventListener('click',e=>{if(e.target?.closest?.('[data-view="dashboard"]'))setTimeout(()=>{render();renderDashboard()},80)});setTimeout(()=>{render();renderDashboard();autoBirthdayReminder()},1000);
})();
