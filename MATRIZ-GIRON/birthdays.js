/* ============================================================
   Cumpleaños de contactos autorizados · v1.3.14
   Módulo aislado: no modifica app.js ni la clave de almacenamiento.
   ============================================================ */
(() => {
  'use strict';
  const clean=v=>String(v??'').trim();
  const digits=v=>clean(v).replace(/\D/g,'');
  const getDB=()=>window.db || (typeof db!=='undefined'?db:null);
  let current=null, currentBlob=null;
  const pad=n=>String(n).padStart(2,'0');
  function parts(v){if(!v)return null;const m=String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?{y:+m[1],m:+m[2],d:+m[3]}:null}
  function nextBirthday(v){const p=parts(v);if(!p)return null;const now=new Date(), today=new Date(now.getFullYear(),now.getMonth(),now.getDate());let d=new Date(now.getFullYear(),p.m-1,p.d);if(d<today)d=new Date(now.getFullYear()+1,p.m-1,p.d);return {date:d,days:Math.round((d-today)/86400000)}}
  function fmt(v){const p=parts(v);if(!p)return '—';return new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'long'}).format(new Date(2000,p.m-1,p.d))}
  function authorized(l){return l.communicationsConsent==='Sí'}
  function render(){
    const el=document.getElementById('birthdayPanel'), data=getDB();if(!el||!data)return;
    const all=(data.leaders||[]).filter(l=>authorized(l)&&parts(l.birthDate)).map(l=>({...l,_next:nextBirthday(l.birthDate)})).filter(l=>l._next).sort((a,b)=>a._next.days-b._next.days);
    const today=all.filter(l=>l._next.days===0), week=all.filter(l=>l._next.days>=0&&l._next.days<=7), month=all.filter(l=>l._next.days>=0&&l._next.days<=30);
    const show=all.filter(l=>l._next.days<=30).slice(0,9);
    el.innerHTML=`<div class="birthday-panel-head"><div><h3>🎂 Cumpleaños de la red</h3><small class="muted">Seguimiento para contactos autorizados a recibir comunicaciones.</small></div><div class="birthday-summary"><span class="birthday-chip">Hoy: ${today.length}</span><span class="birthday-chip">Próximos 7 días: ${week.length}</span><span class="birthday-chip">Próximos 30 días: ${month.length}</span></div></div>${show.length?`<div class="birthday-list">${show.map(l=>`<div class="birthday-item ${l._next.days===0?'today':''}"><div class="birthday-person"><strong>${l._next.days===0?'🎉 HOY · ':''}${clean(l.name)}</strong><small>${fmt(l.birthDate)} · ${clean(l.role||'Contacto')} · ${clean(l.vereda||l.territory||'Girón')}</small></div><div class="birthday-actions"><button class="birthday-greet" data-birthday-id="${l.id}">💌 Felicitar</button></div></div>`).join('')}</div>`:`<div class="birthday-empty">No hay cumpleaños registrados para los próximos 30 días.</div>`}`;
    el.querySelectorAll('[data-birthday-id]').forEach(b=>b.onclick=()=>openCard(b.dataset.birthdayId));
  }
  function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
  function wrap(ctx,text,x,y,maxW,lineH,maxLines=99){const words=clean(text).split(/\s+/);let line='',lines=[];for(const w of words){const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){lines.push(line);line=w}else line=t}if(line)lines.push(line);lines.slice(0,maxLines).forEach((ln,i)=>ctx.fillText(ln,x,y+i*lineH));return Math.min(lines.length,maxLines)*lineH}
  async function drawCard(l){
    const c=document.getElementById('birthdayCardCanvas'),ctx=c.getContext('2d'),W=c.width,H=c.height;
    const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#062a52');g.addColorStop(.55,'#0b4c83');g.addColorStop(1,'#031e3d');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<28;i++){ctx.beginPath();ctx.arc((i*173)%W,(i*251)%H,8+(i%5)*5,0,Math.PI*2);ctx.fill()}
    ctx.strokeStyle='#f3bf23';ctx.lineWidth=5;ctx.strokeRect(42,42,W-84,H-84);
    let photo=null,logo=null;try{photo=await loadImage('assets/ivan-ortiz-foto.png')}catch(_){}try{logo=await loadImage('assets/ivan-ortiz-marca.png')}catch(_){}
    if(photo){ctx.save();ctx.beginPath();ctx.arc(170,175,88,0,Math.PI*2);ctx.clip();ctx.drawImage(photo,82,87,176,176);ctx.restore();ctx.strokeStyle='#f3bf23';ctx.lineWidth=5;ctx.beginPath();ctx.arc(170,175,90,0,Math.PI*2);ctx.stroke()}
    if(logo){const lw=320,lh=lw*(logo.height/logo.width);ctx.drawImage(logo,W-lw-70,95,lw,lh);}
    ctx.textAlign='center';ctx.fillStyle='#f8c62b';ctx.font='bold 46px Arial';ctx.fillText('¡FELIZ CUMPLEAÑOS!',W/2,330);
    ctx.fillStyle='#fff';ctx.font='bold 62px Arial';wrap(ctx,clean(l.name).toUpperCase(),W/2,410,820,72,2);
    ctx.font='30px Arial';ctx.fillStyle='#f4f7fb';const msg='Que este nuevo año de vida llegue lleno de salud, alegría, sueños cumplidos y muchas bendiciones para usted y su familia.';wrap(ctx,msg,W/2,570,820,43,4);
    ctx.font='28px Arial';ctx.fillStyle='#dbe9f7';wrap(ctx,'Gracias por su compromiso con su comunidad y por aportar cada día a construir un mejor Girón.',W/2,755,820,40,3);
    ctx.fillStyle='#f8c62b';ctx.font='italic 28px Georgia';ctx.fillText('Con aprecio,',W/2,895);if(logo){const sw=360,sh=sw*(logo.height/logo.width);ctx.drawImage(logo,(W-sw)/2,920,sw,sh);}ctx.font='22px Arial';ctx.fillStyle='#dbe9f7';ctx.fillText('Construyendo juntos el Girón que soñamos',W/2,1010);
    return new Promise(r=>c.toBlob(r,'image/png',.96));
  }
  async function openCard(id){const data=getDB();current=(data?.leaders||[]).find(l=>l.id===id);if(!current)return;if(!authorized(current)){alert('Este contacto no tiene autorización registrada para recibir comunicaciones.');return}document.getElementById('birthdayPersonSummary').textContent=`${current.name} · ${fmt(current.birthDate)} · ${current.vereda||current.territory||'Girón'}`;document.getElementById('birthdayModal').classList.add('open');currentBlob=await drawCard(current)}
  function close(){document.getElementById('birthdayModal')?.classList.remove('open');current=null;currentBlob=null}
  function filename(){return `FELIZ-CUMPLEANOS-${clean(current?.name||'CONTACTO').replace(/[^a-z0-9]+/gi,'-')}.png`}
  async function share(){if(!currentBlob||!current)return;const file=new File([currentBlob],filename(),{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:`Feliz cumpleaños ${current.name}`,text:`¡Feliz cumpleaños, ${current.name}!`});markCommunication();return}catch(e){if(e.name==='AbortError')return}}download();alert('La tarjeta quedó guardada como imagen. Puede adjuntarla directamente en WhatsApp.')}
  function download(){if(!currentBlob)return;const a=document.createElement('a');a.href=URL.createObjectURL(currentBlob);a.download=filename();a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200)}
  function markCommunication(){if(!current)return;current.lastCommunication=new Date().toISOString().slice(0,10);try{if(typeof saveDB==='function')saveDB();else localStorage.setItem('matriz_giron_v1',JSON.stringify(getDB()))}catch(_){}setTimeout(render,50)}
  function whatsapp(){if(!current)return;let n=digits(current.whatsapp||current.phone);if(!n){alert('Este contacto no tiene número de WhatsApp registrado.');return}if(n.length===10)n='57'+n;const msg=`¡Feliz cumpleaños, ${clean(current.name)}! 🎉🎂\n\nQue este nuevo año de vida llegue lleno de salud, alegría, sueños cumplidos y muchas bendiciones para usted y su familia. Gracias por su compromiso con su comunidad y por aportar cada día a construir un mejor Girón.\n\nCon aprecio,\nIván Ortiz`;window.open(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`,'_blank','noopener');markCommunication()}
  document.getElementById('birthdayClose')?.addEventListener('click',close);document.getElementById('birthdayShare')?.addEventListener('click',share);document.getElementById('birthdayDownload')?.addEventListener('click',download);document.getElementById('birthdayWhatsApp')?.addEventListener('click',whatsapp);
  document.getElementById('leaderForm')?.addEventListener('submit',()=>setTimeout(render,80));
  document.addEventListener('click',e=>{if(e.target?.matches('[data-open-modal="leaderModal"]'))setTimeout(()=>{const f=document.getElementById('leaderForm');if(f&&!f.elements.id.value)f.elements.birthDate.value=''},0)});
  window.addEventListener('storage',render);setTimeout(render,100);
})();
