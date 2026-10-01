/* ============================================================
   MI POSICIÓN · v1.3.20
   Módulo independiente. No modifica app.js ni el esquema base.
   Genera tarjetas, comparte mediante Web Share y conserva histórico.
   ============================================================ */
(()=>{'use strict';
const KEY='matriz_giron_position_v1';
let archive=load(), current=null, photoData='';
const $=id=>document.getElementById(id), clean=v=>String(v??'').trim();
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}
function persist(){localStorage.setItem(KEY,JSON.stringify(archive));renderArchive()}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function getLeaders(){try{return (window.db||db).leaders||[]}catch{return []}}
function authorized(){return getLeaders().filter(x=>x.communicationsConsent==='Sí')}
function fmtDate(v){if(!v)return '';try{return new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'long',year:'numeric'}).format(new Date(v+'T12:00:00'))}catch{return v}}
function wrap(ctx,text,maxW,font){if(font)ctx.font=font;const paras=clean(text).split(/\n+/),out=[];paras.forEach(p=>{let line='';p.split(/\s+/).forEach(w=>{const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){out.push(line);line=w}else line=t});if(line)out.push(line)});return out}
function fitLines(ctx,text,maxW,maxLines,startSize,minSize=28,weight='700'){for(let s=startSize;s>=minSize;s-=2){ctx.font=`${weight} ${s}px Arial`;const lines=wrap(ctx,text,maxW);if(lines.length<=maxLines)return {s,lines}}ctx.font=`${weight} ${minSize}px Arial`;return {s:minSize,lines:wrap(ctx,text,maxW).slice(0,maxLines)}}
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
async function img(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
async function draw(data){
  const c=$('positionCanvas'); if(!c)return;
  const story=data.format==='story';
  c.width=1080; c.height=story?1920:1080;
  const ctx=c.getContext('2d'), W=c.width, H=c.height;
  ctx.fillStyle='#f8fafc'; ctx.fillRect(0,0,W,H);
  const headerH=story?245:176, footerH=story?108:82;
  ctx.fillStyle='#063b6f'; ctx.fillRect(0,0,W,headerH);

  let portrait=null,brand=null; try{portrait=await img('assets/ivan-ortiz-foto.png')}catch{}; try{brand=await img('assets/ivan-ortiz-marca.png')}catch{};
  const portraitR=story?76:62, portraitCY=story?122:88;
  if(portrait){
    ctx.save(); ctx.beginPath(); ctx.arc(W-120,portraitCY,portraitR-4,0,Math.PI*2); ctx.clip();
    ctx.drawImage(portrait,W-120-(portraitR-4),portraitCY-(portraitR-4),(portraitR-4)*2,(portraitR-4)*2); ctx.restore();
    ctx.strokeStyle='#f5b400';ctx.lineWidth=7;ctx.beginPath();ctx.arc(W-120,portraitCY,portraitR,0,Math.PI*2);ctx.stroke();
  }
  if(brand){const bw=story?510:430,bh=bw*(brand.height/brand.width);ctx.drawImage(brand,58,story?36:22,bw,bh);}
  ctx.fillStyle='#fff';ctx.font=`${story?20:18}px Arial`;ctx.fillText('MI POSICIÓN · '+clean(data.scope).toUpperCase(),62,story?158:124);
  ctx.fillStyle='#f5b400';ctx.font=`italic ${story?22:19}px Georgia`;ctx.fillText('Escuchar · Conocer · Proponer',62,story?200:152);
  ctx.textAlign='right';ctx.fillStyle='#fff';ctx.font=`italic ${story?26:20}px Georgia`;ctx.fillText('Por un Girón con más oportunidades',W-220,story?205:150);ctx.textAlign='left';

  const pad=64, maxW=W-pad*2, foot=H-footerH;
  let y=headerH+(story?62:42);

  // Título y referencia: se ajustan primero para dejar el máximo espacio al contenido.
  ctx.fillStyle='#0a3158';
  const title=fitLines(ctx,data.title,maxW,story?4:3,story?52:40,story?30:27,'800');
  ctx.font=`800 ${title.s}px Arial`; title.lines.forEach(l=>{ctx.fillText(l,pad,y);y+=title.s*1.12}); y+=story?20:14;
  ctx.fillStyle='#6b7d90'; ctx.font=`${story?20:17}px Arial`;
  const ref=[fmtDate(data.newsDate),clean(data.source)].filter(Boolean).join(' · ');
  if(ref){wrap(ctx,'Referencia: '+ref,maxW).slice(0,2).forEach(l=>{ctx.fillText(l,pad,y);y+=story?27:23}); y+=story?10:6}

  if(data.photo){
    try{
      const im=await img(data.photo),boxH=story?400:185,ratio=Math.max(maxW/im.width,boxH/im.height),dw=im.width*ratio,dh=im.height*ratio;
      ctx.save();roundRect(ctx,pad,y,maxW,boxH,18);ctx.clip();ctx.drawImage(im,pad+(maxW-dw)/2,y+(boxH-dh)/2,dw,dh);ctx.restore();y+=boxH+(story?22:14)
    }catch{}
  }

  const blocks=[
    {label:'EL HECHO',text:clean(data.summary),bg:'#eef4fa',lc:'#0b5b9b'},
    {label:'MI POSICIÓN',text:clean(data.opinion),bg:'#fff4d9',lc:'#8b5b00'},
    {label:'PROPUESTA / MENSAJE FINAL',text:clean(data.proposal),bg:'#eaf7ef',lc:'#167044'}
  ].filter(b=>b.text);

  // Calcula todos los bloques sin truncar texto. Si hace falta, reduce tipografía y espaciado.
  const available=Math.max(220,foot-y-(story?28:18));
  let bodySize=story?30:23, minBody=story?19:15, labelSize=story?22:18, gap=story?18:10, vPad=story?18:12;
  let layouts=[];
  const measure=(size)=>{
    ctx.font=`500 ${size}px Arial`;
    return blocks.map(b=>{
      const lines=wrap(ctx,b.text,maxW-50);
      const lineH=size*1.28;
      return {...b,lines,lineH,h:(labelSize+18)+vPad*2+lines.length*lineH};
    });
  };
  for(let s=bodySize;s>=minBody;s-=1){
    const test=measure(s); const total=test.reduce((a,b)=>a+b.h,0)+gap*Math.max(0,test.length-1);
    if(total<=available || s===minBody){bodySize=s;layouts=test;break}
  }
  // Si aun excede, compacta encabezados/espaciados de bloque, manteniendo TODO el texto.
  let total=layouts.reduce((a,b)=>a+b.h,0)+gap*Math.max(0,layouts.length-1);
  if(total>available){
    labelSize=story?19:15; gap=story?10:5; vPad=story?10:7;
    const size=Math.max(story?16:12,bodySize-2); bodySize=size;
    ctx.font=`500 ${size}px Arial`;
    layouts=blocks.map(b=>{const lines=wrap(ctx,b.text,maxW-42),lineH=size*1.20;return {...b,lines,lineH,h:(labelSize+14)+vPad*2+lines.length*lineH}});
    total=layouts.reduce((a,b)=>a+b.h,0)+gap*Math.max(0,layouts.length-1);
  }
  // Último recurso para textos extraordinariamente largos: escala vertical del conjunto, sin recortar.
  const scaleY=total>available?Math.max(.70,available/total):1;
  if(scaleY<1){ctx.save();ctx.translate(0,y);ctx.scale(1,scaleY);y=0}

  layouts.forEach((b,idx)=>{
    ctx.fillStyle=b.bg;roundRect(ctx,pad,y,maxW,b.h,16);ctx.fill();
    ctx.fillStyle=b.lc;ctx.font=`800 ${labelSize}px Arial`;ctx.fillText(b.label,pad+25,y+labelSize+vPad);
    ctx.fillStyle='#17283b';ctx.font=`500 ${bodySize}px Arial`;let yy=y+labelSize+vPad+18;
    b.lines.forEach(l=>{ctx.fillText(l,pad+25,yy);yy+=b.lineH}); y+=b.h+(idx<layouts.length-1?gap:0);
  });
  if(scaleY<1)ctx.restore();

  ctx.fillStyle='#063b6f';ctx.fillRect(0,foot,W,footerH);if(brand){const fw=story?420:330,fh=fw*(brand.height/brand.width);ctx.drawImage(brand,pad,foot+(footerH-fh)/2,fw,fh);}ctx.fillStyle='#fff';ctx.textAlign='right';ctx.font=`${story?18:15}px Arial`;ctx.fillText('Construyendo juntos el Girón que soñamos',W-pad,foot+(story?66:52));ctx.textAlign='left';ctx.fillStyle='#f5b400';ctx.fillRect(W-250,foot,250,7);
  current={...data,generated:new Date().toISOString()};
}
function dataFromForm(){const f=$('positionForm'),o=Object.fromEntries(new FormData(f));return {...o,photo:photoData}}
function message(d){return `📣 *${clean(d.title)}*\n\n${clean(d.summary)}\n\n*Mi posición:* ${clean(d.opinion)}${clean(d.proposal)?'\n\n'+clean(d.proposal):''}${clean(d.sourceUrl)?'\n\nFuente: '+clean(d.sourceUrl):''}\n\nIván Ortiz`}
function canvasBlob(){return new Promise(r=>$('positionCanvas').toBlob(r,'image/png',.96))}
async function share(){if(!current){alert('Primero genere una tarjeta.');return}const blob=await canvasBlob(),file=new File([blob],`MI-POSICION-${Date.now()}.png`,{type:'image/png'});try{if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({title:current.title,text:message(current),files:[file]});return}}catch(e){if(e.name==='AbortError')return}download();alert('La tarjeta fue guardada como imagen. Puede publicarla o adjuntarla en la red social que prefiera.')}
async function download(){
  if(!current){alert('Primero genere una tarjeta.');return}
  const c=$('positionCanvas');
  if(!c){alert('No se encontró la tarjeta generada.');return}
  const filename=`MI-POSICION-${clean(current.scope).replace(/\s+/g,'-')}-${new Date().toISOString().slice(0,10)}.png`;
  const blob=await canvasBlob();
  if(!blob){alert('No fue posible preparar la imagen. Intente generar nuevamente la tarjeta.');return}
  try{
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=filename;a.style.display='none';
    document.body.appendChild(a);a.click();
    setTimeout(()=>{a.remove();URL.revokeObjectURL(url)},2500);
    if(typeof toast==='function')toast('Imagen preparada para guardar');
    return;
  }catch(e){}
  try{
    const file=new File([blob],filename,{type:'image/png'});
    if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){
      await navigator.share({title:'Guardar tarjeta',files:[file]});return;
    }
  }catch(e){if(e.name==='AbortError')return}
  try{
    const dataUrl=c.toDataURL('image/png',.96); const w=window.open();
    if(w){w.document.write(`<title>${filename}</title><img src="${dataUrl}" style="max-width:100%;height:auto">`);w.document.close();alert('Se abrió la imagen. En el celular, manténgala presionada para guardarla.');return}
  }catch(e){}
  alert('El navegador no permitió guardar automáticamente. Use “Compartir tarjeta” para guardar o enviar la imagen.');
}
function archiveCurrent(){if(!current)return;const item={id:'POS-'+Date.now(),title:current.title,scope:current.scope,source:current.source,sourceUrl:current.sourceUrl,newsDate:current.newsDate,summary:current.summary,opinion:current.opinion,proposal:current.proposal,format:current.format,generated:current.generated};archive.unshift(item);archive=archive.slice(0,100);persist()}
function renderArchive(){const box=$('positionArchive');if(!box)return;$('positionArchiveCount').textContent=archive.length;if(!archive.length){box.innerHTML='<p class="muted">Aún no hay comunicaciones archivadas.</p>';return}box.innerHTML=archive.map(x=>`<div class="position-archive-item"><div><b>${esc(x.title)}</b><small>${esc(x.scope)} · ${esc(fmtDate((x.generated||'').slice(0,10)))}${x.source?' · '+esc(x.source):''}</small></div><div class="position-archive-buttons"><button type="button" data-pos-load="${esc(x.id)}">Abrir</button><button type="button" data-pos-del="${esc(x.id)}">🗑</button></div></div>`).join('')}
function loadArchive(id){const x=archive.find(a=>a.id===id);if(!x)return;const f=$('positionForm');['title','scope','newsDate','source','sourceUrl','summary','opinion','proposal'].forEach(k=>{if(f.elements[k])f.elements[k].value=x[k]||''});if(f.elements.format){[...f.elements.format].forEach(r=>r.checked=r.value===(x.format||'square'))}photoData='';draw({...x,photo:''});window.scrollTo({top:0,behavior:'smooth'})}
function renderContacts(){const list=$('positionContactsList'),sel=$('positionVeredaFilter');if(!list||!sel)return;const all=authorized(),vs=[...new Set(all.map(x=>clean(x.vereda||x.territory)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));const cur=sel.value;sel.innerHTML='<option value="">Todas</option>'+vs.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');sel.value=cur;const arr=all.filter(x=>!sel.value||clean(x.vereda||x.territory)===sel.value);list.innerHTML=arr.length?arr.map(l=>`<div class="position-contact-row"><div><b>${esc(l.name)}</b><span>${esc(l.role||'Contacto')} · ${esc(l.vereda||l.territory||'Sin vereda')} · ${esc(l.whatsapp||l.phone||'Sin WhatsApp')}</span></div><button type="button" data-pos-wa="${esc(l.id)}">WhatsApp</button></div>`).join(''):'<p class="muted">No hay contactos autorizados para este filtro.</p>'}
function openWA(id){if(!current){alert('Primero genere una tarjeta.');return}const l=authorized().find(x=>x.id===id);if(!l)return;let n=clean(l.whatsapp||l.phone).replace(/\D/g,'');if(n.length===10)n='57'+n;if(!n){alert('Este contacto no tiene WhatsApp registrado.');return}window.open(`https://wa.me/${n}?text=${encodeURIComponent(message(current))}`,'_blank','noopener')}

function generateDraft(){
 const f=$('positionForm'); if(!f) return;
 const summary=clean(f.elements.summary?.value);
 const scope=clean(f.elements.scope?.value)||'nuestro territorio';
 if(!summary){alert('Primero escriba el resumen del hecho.');f.elements.summary?.focus();return}
 const lead=summary.replace(/\s+/g,' ').replace(/[.!?]+$/,'');
 const draft=`Frente a este hecho, considero importante que la comunidad conozca con claridad lo que está ocurriendo y que las entidades competentes informen oportunamente las actuaciones que correspondan. ${lead}. Este tema merece seguimiento responsable por su posible impacto en ${scope}. Mi posición es que cualquier respuesta institucional debe priorizar información verificable, atención oportuna y soluciones concretas para la ciudadanía.`;
 f.elements.opinion.value=draft.slice(0,900);
 if(!clean(f.elements.proposal?.value)) f.elements.proposal.value='Seguiremos atentos a la información oficial y a las acciones que permitan dar una respuesta clara y útil a la comunidad.';
 f.elements.opinion.focus();
}
function init(){const f=$('positionForm');if(!f)return;draw({title:'SU VOZ FRENTE A LOS TEMAS QUE IMPORTAN',scope:'Girón',summary:'Aquí aparecerá un resumen claro del hecho o noticia.',opinion:'Aquí aparecerá la posición de Iván Ortiz.',proposal:'Una propuesta concreta para seguir construyendo juntos.',format:'square',photo:''});renderArchive();
 $('positionImage').addEventListener('change',e=>{const file=e.target.files[0];if(!file){photoData='';return}const r=new FileReader();r.onload=()=>photoData=r.result;r.readAsDataURL(file)});
 f.addEventListener('submit',async e=>{e.preventDefault();await draw(dataFromForm());archiveCurrent();if(typeof toast==='function')toast('Tarjeta generada y archivada')});
 $('positionDraft').onclick=generateDraft;$('positionShare').onclick=share;$('positionDownload').onclick=download;$('positionContacts').onclick=()=>{if(!current){alert('Primero genere una tarjeta.');return}$('positionContactsPanel').classList.remove('hidden');renderContacts();$('positionContactsPanel').scrollIntoView({behavior:'smooth'})};$('positionContactsClose').onclick=()=>$('positionContactsPanel').classList.add('hidden');$('positionVeredaFilter').onchange=renderContacts;
 $('positionArchive').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.posLoad)loadArchive(b.dataset.posLoad);if(b.dataset.posDel&&confirm('¿Eliminar esta comunicación del archivo?')){archive=archive.filter(x=>x.id!==b.dataset.posDel);persist()}});
 $('positionContactsList').addEventListener('click',e=>{const b=e.target.closest('[data-pos-wa]');if(b)openWA(b.dataset.posWa)});
 $('positionClear').addEventListener('click',()=>{setTimeout(()=>{photoData='';$('positionImage').value=''},0)});
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
