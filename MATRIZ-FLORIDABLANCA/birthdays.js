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
  const GREET_KEY='matriz_floridablanca_birthday_greeted_v1';
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
    el.innerHTML=`<div class="birthday-panel-head"><div><h3>🎂 Cumpleaños de la red</h3><small class="muted">Seguimiento para contactos autorizados a recibir comunicaciones.</small></div><div class="birthday-summary"><span class="birthday-chip">Hoy: ${today.length}</span><span class="birthday-chip">Próximos 7 días: ${week.length}</span><span class="birthday-chip">Próximos 30 días: ${month.length}</span></div></div>${show.length?`<div class="birthday-list">${show.map(l=>`<div class="birthday-item ${l._next.days===0?'today':''} ${isGreeted(l)?'birthday-done':''}"><div class="birthday-person"><strong>${l._next.days===0?'🎉 HOY · ':''}${clean(l.name)} ${isGreeted(l)?'✓':''}</strong><small>${fmt(l.birthDate)} · ${clean(l.role||l.contactType||'Contacto')} · ${clean(l.vereda||l.territory||'Floridablanca')} · ${l._next.days===0?'Hoy':l._next.days===1?'Mañana':`En ${l._next.days} días`}</small></div><div class="birthday-actions"><button class="birthday-greet" data-birthday-id="${l.id}">🎨 Tarjeta</button><button class="birthday-wa-mini" data-birthday-wa="${l.id}">🟢 WhatsApp</button><button class="birthday-mark" data-birthday-mark="${l.id}">${isGreeted(l)?'↩ Pendiente':'✓ Ya felicité'}</button></div></div>`).join('')}</div>`:`<div class="birthday-empty">No hay cumpleaños registrados para los próximos 30 días.</div>`}`;
    el.querySelectorAll('[data-birthday-id]').forEach(b=>b.onclick=()=>openCard(b.dataset.birthdayId));
    el.querySelectorAll('[data-birthday-wa]').forEach(b=>b.onclick=()=>quickWhatsapp(b.dataset.birthdayWa));
    el.querySelectorAll('[data-birthday-mark]').forEach(b=>b.onclick=()=>{const l=(data.leaders||[]).find(x=>String(x.id)===String(b.dataset.birthdayMark));if(l){isGreeted(l)?unmarkGreeted(l):markGreeted(l)}});
    renderDashboard();
  }
  function quickWhatsapp(id){
    const data=getDB(),l=(data?.leaders||[]).find(x=>String(x.id)===String(id));if(!l)return;
    let n=digits(l.whatsapp||l.phone);if(!n){alert('Este contacto no tiene número de WhatsApp registrado.');return}if(n.length===10)n='57'+n;
    const msg=`¡Feliz cumpleaños, ${clean(l.name)}! 🎉🎂\n\nQue este nuevo año de vida llegue lleno de salud, alegría y muchas bendiciones para usted y su familia.\n\nCon cariño,\nMarco Andrés Silva López`;
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
  // v1.0.23 · Composición editorial vertical. La ubicación de cada bloque
  // se calcula a partir de las líneas realmente visibles: nunca se solapan.
  function birthdayWrapLines(ctx,text,maxWidth){
    const paragraphs=String(text||'').trim().split(/\n+/);
    const output=[];
    for(const paragraph of paragraphs){
      let row='';
      const words=paragraph.trim().split(/\s+/).filter(Boolean);
      if(!words.length)continue;
      for(let word of words){
        if(ctx.measureText(word).width>maxWidth){
          const segments=[];let segment='';
          for(const char of word){
            if(segment&&ctx.measureText(segment+char).width>maxWidth){segments.push(segment);segment=char}
            else segment+=char;
          }
          if(segment)segments.push(segment);
          for(const segmentText of segments){
            if(row){output.push(row);row='';}
            output.push(segmentText);
          }
          continue;
        }
        const candidate=row?row+' '+word:word;
        if(row&&ctx.measureText(candidate).width>maxWidth){output.push(row);row=word}
        else row=candidate;
      }
      if(row)output.push(row);
    }
    return output;
  }
  function birthdayFitText(ctx,text,maxW,maxRows,start,min,weight='700'){
    let font=start,rows=[];
    for(;font>=min;font-=2){
      ctx.font=`${weight} ${font}px Arial`;
      rows=birthdayWrapLines(ctx,text,maxW);
      if(rows.length<=maxRows)break;
    }
    return {font:Math.max(font,min),rows};
  }
  function birthdayDrawCentered(ctx,rows,y,lineHeight,color,font,weight='400'){
    ctx.fillStyle=color;ctx.font=`${weight} ${font}px Arial`;ctx.textAlign='center';
    rows.forEach((row,i)=>ctx.fillText(row,540,y+i*lineHeight));
    return y+(rows.length-1)*lineHeight;
  }
  function birthdayGoldWave(ctx,W,H,gold){
    ctx.save();
    const base=H-120;
    const bg=ctx.createLinearGradient(0,base-35,0,H);
    bg.addColorStop(0,'rgba(1,51,34,0)');bg.addColorStop(.36,'rgba(1,43,28,.45)');bg.addColorStop(1,'rgba(0,31,21,.86)');
    ctx.fillStyle=bg;ctx.beginPath();ctx.moveTo(0,base+10);
    ctx.bezierCurveTo(W*.18,base-22,W*.40,base+80,W*.62,base+38);
    ctx.bezierCurveTo(W*.82,base+1,W*.89,base-22,W,base-4);
    ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
    ctx.strokeStyle=gold;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-4,base+8);
    ctx.bezierCurveTo(W*.18,base-22,W*.40,base+80,W*.62,base+38);
    ctx.bezierCurveTo(W*.82,base+1,W*.89,base-22,W+4,base-4);ctx.stroke();
    ctx.restore();
  }
  async function drawCard(l){
    const c=document.getElementById('birthdayCardCanvas'),ctx=c.getContext('2d'),W=1080;
    birthdayTemplate=document.querySelector('input[name="birthdayTemplate"]:checked')?.value||'1';
    const palettes={1:['#064a34','#0b8051','#033b2b','#f2c14e'],2:['#385b25','#8b9837','#2c4820','#f6d787'],3:['#f9f4de','#ecdfab','#cfb879','#23553b'],4:['#153d2d','#32785a','#0b2b20','#f2c14e']};
    const P=palettes[birthdayTemplate];
    const gold=P[3],white=birthdayTemplate==='3'?'#173b36':'#ffffff';
    const copyColor=birthdayTemplate==='3'?'#254e3c':'#f4faf5';
    const softColor=birthdayTemplate==='3'?'#315a44':'#e0eee6';
    const userText=clean(document.getElementById('birthdayCardText')?.value)||suggestedBirthdayText();
    const extra='Que este nuevo año de vida esté lleno de buenos momentos para compartir con las personas que aprecia.';
    const fullName=clean(l.name||'').toUpperCase();
    // Measure blocks on scratch canvas; canvas resizing would otherwise reset the font.
    const scratch=document.createElement('canvas').getContext('2d');
    const name=birthdayFitText(scratch,fullName,880,3,74,46,'800');
    const nameLineH=Math.round(name.font*1.07);
    const titleY=414,titleDecoY=463,nameY=555;
    const lastNameY=nameY+(name.rows.length-1)*nameLineH;
    const msgStart=lastNameY+100;
    let msgFont=35,msgRows=[];
    for(;msgFont>=26;msgFont--){
      scratch.font=`400 ${msgFont}px Arial`;
      msgRows=birthdayWrapLines(scratch,userText,880);
      if(msgRows.length*Math.round(msgFont*1.40)<=350)break;
    }
    const msgLH=Math.round(msgFont*1.40);
    const msgLast=msgStart+(msgRows.length-1)*msgLH;
    // Second paragraph is part of the approved design. Reduce it for long custom text.
    const showExtra=userText.length<310;
    let extraRows=[],extraFont=31,extraStart=msgLast+91,extraLast=msgLast;
    if(showExtra){
      for(;extraFont>=26;extraFont--){
        scratch.font=`400 ${extraFont}px Arial`;
        extraRows=birthdayWrapLines(scratch,extra,870);
        if(extraRows.length<=4)break;
      }
      extraLast=extraStart+(extraRows.length-1)*Math.round(extraFont*1.45);
    }
    const signIntroY=Math.max(1182,(showExtra?extraLast:msgLast)+125);
    const signCardY=signIntroY+57;
    const signCardH=152;
    // A longer greeting expands the card rather than drawing text over the signature.
    const H=Math.max(1536,signCardY+signCardH+120);
    c.width=W;c.height=H;
    const x=c.getContext('2d');
    const g=x.createLinearGradient(0,0,W,H);
    g.addColorStop(0,P[0]);g.addColorStop(.52,P[1]);g.addColorStop(1,P[2]);
    x.fillStyle=g;x.fillRect(0,0,W,H);
    // Gentle light and decorative dots, without obscuring the message.
    const glow=x.createRadialGradient(W*.60,H*.47,15,W*.60,H*.47,740);
    glow.addColorStop(0,'rgba(255,255,255,.07)');glow.addColorStop(1,'rgba(255,255,255,0)');
    x.fillStyle=glow;x.fillRect(0,0,W,H);
    x.fillStyle='rgba(255,255,255,.065)';
    for(let i=0;i<19;i++){
      const px=(i*197+65)%W,py=(i*251+70)%H,r=9+(i%5)*9;
      x.beginPath();x.arc(px,py,r,0,Math.PI*2);x.fill();
    }
    let photo=null,watermark=null;
    try{photo=await loadImage('assets/marco-andres-silva-lopez.jpeg')}catch(_){}
    try{watermark=await loadImage('assets/marca-agua-marco-palacio-v116.png')}catch(_){}
    // Scenic watermark fills the lower third, behind the signing area.
    if(watermark){
      x.save();x.globalAlpha=birthdayTemplate==='3' ? .085 : .13;
      x.filter='grayscale(8%) saturate(80%)';
      const ww=W*.98,hh=ww*(watermark.height/watermark.width);
      x.drawImage(watermark,(W-ww)/2,H-610,ww,hh);x.restore();
    }
    birthdayGoldWave(x,W,H,gold);
    x.strokeStyle=gold;x.lineWidth=5;x.strokeRect(22,22,W-44,H-44);
    // Signature at the top: circular portrait and large name plate.
    if(photo){
      const cx=202,cy=194,r=130;
      x.save();x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.clip();
      const side=Math.min(photo.width,photo.height);
      x.drawImage(photo,(photo.width-side)/2,(photo.height-side)/2,side,side,cx-r,cy-r,r*2,r*2);
      x.restore();x.strokeStyle=gold;x.lineWidth=7;x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.stroke();
    }
    const plateX=520,plateY=120,plateW=470,plateH=143;
    x.fillStyle='rgba(0,58,39,.58)';x.beginPath();x.roundRect(plateX,plateY,plateW,plateH,17);x.fill();
    x.strokeStyle='rgba(240,215,129,.45)';x.lineWidth=1.5;x.stroke();
    x.fillStyle=gold;x.beginPath();x.roundRect(plateX,plateY,11,plateH,6);x.fill();
    x.textAlign='left';x.fillStyle='#fff';x.font='800 46px Arial';x.fillText('MARCO ANDRÉS',plateX+34,plateY+56);
    x.fillStyle=gold;x.font='800 46px Arial';x.fillText('SILVA LÓPEZ',plateX+34,plateY+107);
    x.fillStyle='#f8df95';x.font='italic 23px Georgia';x.fillText('Floridablanca, nuestra casa',plateX+35,plateY+135);
    // Main title and separator.
    const heading=birthdayTemplate==='2'?'CELEBRAMOS TU VIDA':birthdayTemplate==='4'?'UN DÍA MUY ESPECIAL':'¡FELIZ CUMPLEAÑOS!';
    x.textAlign='center';x.fillStyle=gold;
    let headFont=64;x.font=`800 ${headFont}px Arial`;
    while(headFont>43&&x.measureText(heading).width>910){headFont-=2;x.font=`800 ${headFont}px Arial`}
    x.fillText(heading,W/2,titleY);
    x.strokeStyle=gold;x.lineWidth=2;
    x.beginPath();x.moveTo(250,titleDecoY);x.lineTo(495,titleDecoY);x.moveTo(585,titleDecoY);x.lineTo(830,titleDecoY);x.stroke();
    x.fillStyle=gold;x.beginPath();x.moveTo(540,titleDecoY-13);x.lineTo(552,titleDecoY);x.lineTo(540,titleDecoY+13);x.lineTo(528,titleDecoY);x.closePath();x.fill();
    birthdayDrawCentered(x,name.rows,nameY,nameLineH,white,name.font,'800');
    birthdayDrawCentered(x,msgRows,msgStart,msgLH,copyColor,msgFont,'400');
    if(showExtra)birthdayDrawCentered(x,extraRows,extraStart,Math.round(extraFont*1.45),softColor,extraFont,'400');
    // Always below the last message line. No duplicated/overlapping footer sentence.
    x.fillStyle=gold;x.textAlign='center';x.font='italic 54px Georgia';x.fillText('Con cariño,',W/2,signIntroY);
    const fw=525,fx=(W-fw)/2;
    x.fillStyle='rgba(0,55,36,.78)';x.beginPath();x.roundRect(fx,signCardY,fw,signCardH,18);x.fill();
    x.strokeStyle='rgba(244,219,137,.48)';x.lineWidth=2;x.stroke();
    x.fillStyle=gold;x.beginPath();x.roundRect(fx,signCardY,12,signCardH,6);x.fill();
    x.textAlign='center';x.fillStyle='#fff';x.font='800 43px Arial';x.fillText('MARCO ANDRÉS',W/2,signCardY+59);
    x.fillStyle=gold;x.font='800 42px Arial';x.fillText('SILVA LÓPEZ',W/2,signCardY+106);
    x.strokeStyle='rgba(255,255,255,.38)';x.lineWidth=1;x.beginPath();x.moveTo(fx+98,signCardY+118);x.lineTo(fx+fw-98,signCardY+118);x.stroke();
    x.fillStyle='#f8df95';x.font='italic 24px Georgia';x.fillText('Floridablanca, nuestra casa',W/2,signCardY+142);
    return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('No se pudo generar la tarjeta.')),'image/png',.96));
  }
  function refreshBirthdayCard(){if(current)drawCard(current).then(()=>document.getElementById('birthdayCardCanvas')?.toBlob(b=>currentBlob=b,'image/png',.95))}
  async function openCard(id){
    const data=getDB();current=(data?.leaders||[]).find(l=>String(l.id)===String(id));if(!current)return;
    if(!authorized(current)){alert('Este contacto no tiene autorización registrada para recibir comunicaciones.');return}
    document.getElementById('birthdayPersonSummary').textContent=`${current.name} · ${fmt(current.birthDate)} · ${current.vereda||current.territory||'Floridablanca'}`;
    const text=document.getElementById('birthdayCardText');if(text)text.value=birthdayTexts['1'];
    const first=document.querySelector('input[name="birthdayTemplate"][value="1"]');if(first)first.checked=true;
    const modal=document.getElementById('birthdayModal');if(modal){modal.classList.add('open');modal.scrollTop=0}
    currentBlob=await drawCard(current)
  }
  function close(){document.getElementById('birthdayModal')?.classList.remove('open');current=null;currentBlob=null}
  function filename(){return `FELIZ-CUMPLEANOS-${clean(current?.name||'CONTACTO').replace(/[^a-z0-9]+/gi,'-')}.png`}
  async function share(){if(!currentBlob||!current)return;const file=new File([currentBlob],filename(),{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:`Feliz cumpleaños ${current.name}`,text:`¡Feliz cumpleaños, ${current.name}!`});markCommunication();return}catch(e){if(e.name==='AbortError')return}}download();alert('La tarjeta quedó guardada como imagen. Puede adjuntarla directamente en WhatsApp.')}
  function download(){if(!currentBlob)return;const a=document.createElement('a');a.href=URL.createObjectURL(currentBlob);a.download=filename();a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200)}
  async function downloadPDF(){
    if(!current)return;
    try{
      await drawCard(current);
      window.FloridablancaCanvasPDF.downloadCanvas(document.getElementById('birthdayCardCanvas'),filename());
    }catch(e){alert('No se pudo guardar la tarjeta en PDF: '+e.message);}
  }
  function markCommunication(){if(!current)return;markGreeted(current);current.lastCommunication=new Date().toISOString().slice(0,10);try{if(typeof saveDB==='function')saveDB();else localStorage.setItem('matriz_floridablanca_v1',JSON.stringify(getDB()))}catch(_){}setTimeout(render,50)}
  function whatsapp(){if(!current)return;let n=digits(current.whatsapp||current.phone);if(!n){alert('Este contacto no tiene número de WhatsApp registrado.');return}if(n.length===10)n='57'+n;const msg=`¡Feliz cumpleaños, ${clean(current.name)}! 🎉🎂\n\nQue este nuevo año de vida llegue lleno de salud, alegría, sueños cumplidos y muchas bendiciones para usted y su familia. Que disfrute este día especial junto a las personas que aprecia.\n\nCon cariño,\nMarco Andrés Silva López`;window.open(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`,'_blank','noopener');markCommunication()}
  document.getElementById('birthdayMassWhatsApp')?.addEventListener('click',()=>{
    if(!currentBlob||!current){alert('Primero genere la tarjeta de cumpleaños.');return}
    if(typeof window.openCardMassWhatsAppShare!=='function'){alert('No se cargó el selector de WhatsApp. Recargue la aplicación.');return}
    window.openCardMassWhatsAppShare({
      title:`Enviar cumpleaños de ${clean(current.name)}`,
      message:`Hola {nombre}. 🎉\n\nQuiero compartir contigo esta felicitación especial de cumpleaños para ${clean(current.name)}.\n\nCon cariño,\nMarco Andrés Silva López`,
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
  document.getElementById('birthdayClose')?.addEventListener('click',close);document.getElementById('birthdayShare')?.addEventListener('click',share);document.getElementById('birthdayDownload')?.addEventListener('click',download);document.getElementById('birthdayDownloadPdf')?.addEventListener('click',downloadPDF);document.getElementById('birthdayWhatsApp')?.addEventListener('click',whatsapp);
  document.getElementById('leaderForm')?.addEventListener('submit',()=>setTimeout(()=>{render();renderDashboard();renderReminder();const d=getDB();const hasToday=birthdayRows(d,0).some(l=>!isGreeted(l));if(hasToday)document.getElementById('birthdayReminderModal')?.classList.add('open')},180));
  document.addEventListener('click',e=>{if(e.target?.matches('[data-open-modal="leaderModal"]'))setTimeout(()=>{const f=document.getElementById('leaderForm');if(f&&!f.elements.id.value)f.elements.birthDate.value=''},0)});
  window.addEventListener('storage',()=>{render();renderDashboard();renderReminder()});document.addEventListener('click',e=>{if(e.target?.closest?.('[data-view="dashboard"]'))setTimeout(()=>{render();renderDashboard()},80)});setTimeout(()=>{render();renderDashboard();autoBirthdayReminder()},1000);
})();
