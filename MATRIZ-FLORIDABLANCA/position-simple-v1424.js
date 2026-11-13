/* COMENTARIOS DE MARCO · v1.0.21 FLORIDABLANCA
   Una sola hoja editorial: imagen completa, titular proporcionado y marca visible.
   Redacción con revisión humana. Fotografías persistentes y respaldables.
*/
(()=>{
  'use strict';
  // Conservamos las claves antiguas para que todos los comentarios guardados sigan disponibles.
  const KEY='matriz_floridablanca_position_v1';
  const PHOTO_DB='matriz_floridablanca_position_photos_v1',PHOTO_STORE='photos';
  const $=id=>document.getElementById(id);
  const clean=v=>String(v??'').trim();
  const f=$('positionForm');
  if(!f)return;
  let archive=[],photoData='',current=null,activeArchiveId=null,drawCounter=0,drawTimer=0,loadCounter=0;
  let pageState=null,selectedPage=0;
  try{const previous=JSON.parse(localStorage.getItem(KEY)||'[]');archive=Array.isArray(previous)?previous:[]}catch{}
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fields=()=>Object.fromEntries(new FormData(f));
  const today=()=>new Date().toISOString().slice(0,10);
  const capital=s=>{const t=clean(s);return t?t[0].toUpperCase()+t.slice(1):''};
  const sentence=s=>{const t=capital(s).replace(/\s+/g,' ');return t&&/[.!?]$/.test(t)?t:t+'.'};
  function data(){
    const o=fields();
    return {...o,topic:clean(o.topic),title:clean(o.title),opinion:clean(o.opinion),cardText:clean(o.cardText),photo:photoData,format:o.format==='story'?'story':'post'};
  }
  function titleFrom(topic){
    let s=clean(topic).replace(/[.!?]+$/,'');
    if(s.length>89)s=s.slice(0,86).replace(/\s+\S*$/,'')+'…';
    return capital(s);
  }
  function makeDraft(){
    const topic=clean(f.elements.topic.value),angle=clean(f.elements.angle.value);
    if(!topic){alert('Escriba primero el tema sobre el que quiere hablar.');f.elements.topic.focus();return}
    f.elements.title.value=titleFrom(topic);
    const paragraphs=[
      'Quiero compartir un comentario sobre '+topic+'. Detrás de este tema hay historias, esfuerzos y personas que vale la pena conocer. Escuchar a nuestra comunidad nos permite apreciar lo que sucede a nuestro alrededor.',
      angle?'Lo que quiero destacar es lo siguiente: '+sentence(angle):
        'Este tema nos invita a escuchar distintas experiencias, reconocer los aportes de las personas y mirar con atención lo que significa para nuestra comunidad.',
      'Hablar de estos asuntos también es una oportunidad para encontrarnos, valorar nuestra ciudad y seguir aprendiendo unos de otros. Compartir estas reflexiones nos acerca a las personas y a los temas que nos unen.'
    ];
    f.elements.opinion.value=paragraphs.join('\n\n');
    f.elements.cardText.value='';
    $('positionEditor').classList.remove('hidden');
    render();
    $('positionEditor').scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function aiPrompt(){
    const o=data();
    if(!o.topic){alert('Escriba primero el tema.');f.elements.topic.focus();return}
    if(!clean(f.elements.title.value))f.elements.title.value=titleFrom(o.topic);
    $('positionEditor').classList.remove('hidden');
    const parts=[
      'Actúa como editor profesional de comentarios ciudadanos para redes sociales en Colombia.',
      'Redacta un comentario cercano, natural y respetuoso, en primera persona, con voz propia de Marco Andrés Silva López. El objetivo es compartir ideas, reconocer experiencias y conversar sobre temas de interés, para que la comunidad lo conozca mejor. No lo conviertas en un pronunciamiento político ni en una promesa de campaña.',
      'TEMA: '+o.topic,
      'LO QUE DESEO COMENTAR O DESTACAR: '+(clean(o.angle)||'No he definido una idea específica. Propón una reflexión equilibrada, sin atribuirme convicciones que no haya expresado.'),
      o.sourceUrl?'REFERENCIA QUE DEBES COMPROBAR, SI PUEDES ACCEDER A ELLA: '+o.sourceUrl:'',
      'Instrucciones: No inventes cifras, citas, nombres, declaraciones ni decisiones institucionales. Si faltan datos actuales o evidencia, dilo o pregunta. Distingue hechos verificables de apreciaciones personales. Si el tema es una celebración, prioriza el reconocimiento; si se refiere a una dificultad, expresa interés y cercanía sin prometer gestiones. Evita ataques personales, consignas y lenguaje electoral.',
      'Entrega exactamente: 1) Titular breve y agradable de 4 a 10 palabras, relacionado con el tema; 2) Comentario de 150 a 220 palabras, en primera persona, lenguaje natural y 3 párrafos. El texto COMPLETO aparecerá en una sola tarjeta editorial. Evita hashtags.',
      'La firma será Marco Andrés Silva López y ya aparece automáticamente en la tarjeta. Deja el comentario listo para mi revisión antes de publicarlo; no repitas la firma al final del texto.'
    ];
    $('positionAIPrompt').value=parts.filter(Boolean).join('\n\n');
    $('positionAIPanel').classList.remove('hidden');
    $('positionAIPrompt').scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  async function copyPrompt(){
    const el=$('positionAIPrompt');
    try{await navigator.clipboard.writeText(el.value);alert('Consulta copiada. Abra ChatGPT, péguela y después copie el resultado en los campos de revisión.')}catch{
      el.focus();el.select();
      try{document.execCommand('copy');alert('Consulta seleccionada. Abra ChatGPT y pegue el texto.')}catch{alert('Seleccione y copie la consulta para pegarla en ChatGPT.')}
    }
  }
  const img=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src});
  function fitImage(ctx,i,x,y,w,h){
    const ratio=Math.max(w/i.width,h/i.height),sw=w/ratio,sh=h/ratio;
    ctx.drawImage(i,(i.width-sw)/2,(i.height-sh)/2,sw,sh,x,y,w,h);
  }
  function containImage(ctx,i,x,y,w,h){
    const ratio=Math.min(w/i.width,h/i.height),nw=i.width*ratio,nh=i.height*ratio;
    ctx.drawImage(i,x+(w-nw)/2,y+(h-nh)/2,nw,nh);
  }
  function lines(ctx,s,maxW){
    const output=[];clean(s).split(/\n+/).forEach((p,idx)=>{
      if(idx&&output.length)output.push('');
      let line='';
      p.trim().split(/\s+/).forEach(w=>{
        const test=line?line+' '+w:w;
        if(line&&ctx.measureText(test).width>maxW){output.push(line);line=''}
        // Evitar que una URL o palabra muy larga desborde la columna.
        if(ctx.measureText((line?line+' ':'')+w).width>maxW){
          for(const char of w){
            const next=line+char;
            if(line&&ctx.measureText(next).width>maxW){output.push(line);line=char}
            else line=next;
          }
        }else line=line?line+' '+w:w;
      });
      if(line)output.push(line);
    });return output;
  }
  function justifiedLine(ctx,line,x,y,maxWidth,justify){
    if(!justify){ctx.fillText(line,x,y);return}
    const words=line.trim().split(/\s+/).filter(Boolean);
    if(words.length<2){ctx.fillText(line,x,y);return}
    const total=words.reduce((sum,word)=>sum+ctx.measureText(word).width,0);
    const spacing=(maxWidth-total)/(words.length-1);
    if(!Number.isFinite(spacing)||spacing<=0){ctx.fillText(line,x,y);return}
    let cursor=x;
    for(const word of words){ctx.fillText(word,cursor,y);cursor+=ctx.measureText(word).width+spacing}
  }
  function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.closePath()}
  function fitTitle(ctx,title,width,maxRows,largest,smallest){
    for(let size=largest;size>=smallest;size-=2){
      ctx.font='900 '+size+'px Arial';
      const list=lines(ctx,title.toUpperCase(),width).filter(Boolean);
      if(list.length<=maxRows)return {size,list};
    }
    ctx.font='900 '+smallest+'px Arial';
    return {size:smallest,list:lines(ctx,title.toUpperCase(),width).filter(Boolean)};
  }
  /* El formato conserva la foto sin recortarla y todos los párrafos en una sola hoja. */
  function geometry(ctx,o,topical){
    const story=o.format==='story',W=1080,baseH=story?1920:1800,pad=64,footerH=180;
    const gap=42,colW=(W-pad*2-gap)/2;
    const title=fitTitle(ctx,clean(o.title||o.topic||'UNA VOZ SOBRE LOS TEMAS QUE IMPORTAN'),W-pad*2-50,3,44,36);
    const titleY=326,titleStep=title.size*1.18;
    const heroY=Math.ceil(titleY+(title.list.length-1)*titleStep+45);
    const ratio=topical&&topical.height?topical.width/topical.height:2.1;
    const heroH=topical?Math.round(Math.max(320,Math.min(540,(W-pad*2)/ratio))):390;
    const bodyY=heroY+heroH+88;
    // La firma exacta al final del texto ya aparece en el pie editorial.
    const raw=(clean(o.opinion).replace(/\s+Marco Andrés Silva López\s*$/i,'').trim())||
      'Escriba su comentario completo para ver aquí el contenido de la publicación.';
    let font=story?34:32,step,bodyLines,rows,needed;
    for(;font>=26;font--){
      ctx.font='500 '+font+'px Arial';
      bodyLines=lines(ctx,raw,colW);
      rows=Math.max(1,Math.ceil(bodyLines.length/2));
      step=font*1.39;
      needed=Math.ceil(bodyY+(rows-1)*step+footerH+92);
      if(needed<=baseH||font===26)break;
    }
    const H=Math.max(baseH,needed),bottom=H-footerH;
    return {story,W,H,pad,bottom,gap,colW,font,step,title,titleY,titleStep,heroY,heroH,bodyY,bodyLines,rows};
  }
  function drawHeader(ctx,geo,assets){
    const {W,pad}=geo,navy='#075638',gold='#f2c14e';
    ctx.fillStyle='#f7f3e9';ctx.fillRect(0,0,W,geo.H);
    ctx.fillStyle=navy;ctx.fillRect(0,0,W,224);
    ctx.fillStyle=gold;ctx.fillRect(0,218,W,6);
    if(assets.brand){
      const s=Math.min(625/assets.brand.width,178/assets.brand.height);
      ctx.drawImage(assets.brand,pad,17,assets.brand.width*s,assets.brand.height*s);
    }else{
      ctx.fillStyle='#fff';ctx.font='900 51px Arial';ctx.fillText('MARCO ANDRÉS',pad,91);
      ctx.fillStyle=gold;ctx.fillText('SILVA LÓPEZ',pad,148);
      ctx.fillStyle='#d8efdb';ctx.font='23px Arial';ctx.fillText('Floridablanca, nuestra casa',pad,190);
    }
    if(assets.portrait){
      ctx.save();ctx.beginPath();ctx.arc(930,107,84,0,Math.PI*2);ctx.clip();
      fitImage(ctx,assets.portrait,846,23,168,168);ctx.restore();
      ctx.strokeStyle=gold;ctx.lineWidth=7;ctx.beginPath();ctx.arc(930,107,84,0,Math.PI*2);ctx.stroke();
    }
  }

  function drawSoftWatermark(ctx,geo,assets){
    // v1.0.21: El papel editorial debe conservar visible la composición COMPLETA,
    // sin cortar a Marco ni el Palacio y sin invadir fotografía, título o pie.
    if(!assets || !assets.watermark)return;
    const left=geo.pad+3;
    const top=geo.bodyY+4;
    const areaW=geo.W-2*geo.pad-6;
    const areaH=Math.max(0,geo.bottom-top-16);
    if(areaH<120)return;
    const image=assets.watermark;
    const ratio=image.width/image.height;
    // Contener, no recortar: usar la anchura y altura disponibles para
    // distribuir la figura y el edificio detrás de las dos columnas.
    const width=Math.min(areaW*.985,areaH*ratio*.985);
    const height=width/ratio;
    const x=left+(areaW-width)/2;
    const y=top+(areaH-height)/2;
    ctx.save();
    ctx.beginPath();ctx.rect(left,top,areaW,areaH);ctx.clip();
    ctx.globalAlpha=.28;
    ctx.filter='grayscale(18%) saturate(70%)';
    ctx.drawImage(image,x,y,width,height);
    ctx.restore();
  }
  function drawPage(c,index,state){
    const {o,geo,assets}=state,{W,H,pad,bottom,colW,gap,font,step}=geo;
    c.width=W;c.height=H;
    const ctx=c.getContext('2d'),navy='#075638',gold='#f2c14e',ink='#20382c';
    drawHeader(ctx,geo,assets);
    drawSoftWatermark(ctx,geo,assets);
    const {title,titleY,titleStep,heroY,heroH,bodyY,bodyLines,rows}=geo;
    ctx.fillStyle='#9a7728';ctx.font='800 21px Arial';
    ctx.fillText('MARCO ANDRÉS COMPARTE  /  TEMAS DE INTERÉS',pad+26,266);
    ctx.fillStyle=gold;rounded(ctx,pad,284,8,Math.max(16,heroY-306),4);ctx.fill();
    ctx.fillStyle=navy;ctx.font='900 '+title.size+'px Arial';
    let y=titleY;
    title.list.forEach(line=>{ctx.fillText(line,pad+27,y);y+=titleStep});
    if(assets.topical){
      const imageW=W-pad*2;
      ctx.save();rounded(ctx,pad,heroY,imageW,heroH,14);ctx.clip();
      // El fondo acompaña fotos estrechas; el primer plano muestra el archivo ENTERO.
      ctx.fillStyle='#e5eddf';ctx.fillRect(pad,heroY,imageW,heroH);
      ctx.save();ctx.filter='blur(26px) brightness(.84)';
      fitImage(ctx,assets.topical,pad-30,heroY-30,imageW+60,heroH+60);
      ctx.restore();
      ctx.fillStyle='rgba(255,255,255,.24)';ctx.fillRect(pad,heroY,imageW,heroH);
      containImage(ctx,assets.topical,pad+8,heroY+8,imageW-16,heroH-16);
      ctx.restore();
      ctx.strokeStyle='#dec995';ctx.lineWidth=2;rounded(ctx,pad,heroY,imageW,heroH,14);ctx.stroke();
    }else{
      const grd=ctx.createLinearGradient(pad,heroY,W-pad,heroY+heroH);
      grd.addColorStop(0,'#075638');grd.addColorStop(.7,'#0d8851');grd.addColorStop(1,'#c29b3f');
      ctx.fillStyle=grd;rounded(ctx,pad,heroY,W-pad*2,heroH,14);ctx.fill();
      ctx.fillStyle='#fff';ctx.font='italic 700 36px Georgia';
      ctx.fillText('Compartir también nos acerca.',pad+36,heroY+heroH/2+8);
    }
    const sectionY=bodyY-49;
    ctx.fillStyle='#6b7c72';ctx.font='21px Arial';ctx.textAlign='right';
    ctx.fillText((clean(o.scope)||'General')+' · '+new Date().toLocaleDateString('es-CO'),W-pad,sectionY);
    ctx.textAlign='left';
    ctx.fillStyle='#cdbb87';ctx.fillRect(pad,bodyY-35,W-pad*2,3);
    // Columnas equilibradas: todos los párrafos y todas las líneas, sin cortes.
    const leftSize=rows;
    ctx.fillStyle=ink;ctx.font='500 '+font+'px Arial';
    bodyLines.forEach((line,i)=>{
      if(!line)return;
      const col=i<leftSize?0:1,row=col?i-leftSize:i;
      // Las últimas líneas de cada párrafo conservan su longitud natural.
      // Las restantes llegan al borde derecho de su columna, estilo periodístico.
      const next=bodyLines[i+1]||'';
      justifiedLine(ctx,line,pad+col*(colW+gap),bodyY+row*step,colW,!!next&&i+1!==rows);
    });
    ctx.fillStyle='#d9cead';ctx.fillRect(pad+colW+gap/2-1,bodyY-10,2,Math.max(20,Math.min(bottom-bodyY-43,(rows-1)*step+23)));
    ctx.fillStyle=navy;ctx.fillRect(0,bottom,W,180);
    ctx.fillStyle=gold;ctx.fillRect(0,bottom,W,7);
    ctx.fillStyle=gold;ctx.fillRect(pad,bottom+28,6,120);
    ctx.fillStyle='#fff';ctx.font='900 43px Arial';ctx.fillText('MARCO ANDRÉS',pad+27,bottom+73);
    ctx.fillStyle=gold;ctx.fillText('SILVA LÓPEZ',pad+27,bottom+125);
    ctx.textAlign='right';ctx.fillStyle='#f5d56b';ctx.font='800 24px Arial';
    ctx.fillText('NUESTRA FLORIDABLANCA',W-pad,bottom+69);
    ctx.fillStyle='#d8efdb';ctx.font='700 19px Arial';
    ctx.fillText('ESCUCHAR · COMPARTIR · ACOMPAÑAR',W-pad,bottom+111);
    ctx.fillStyle='#c8dccc';ctx.font='italic 20px Georgia';
    ctx.fillText('Floridablanca, nuestra casa',W-pad,bottom+144);ctx.textAlign='left';
  }
  function previewPage(index){
    if(!pageState)return;
    selectedPage=0;
    drawPage($('positionCanvas'),0,pageState);
    $('positionCardCount').textContent='Una sola hoja';
    $('positionPrevCard').disabled=true;
    $('positionNextCard').disabled=true;
    const {font,H}=pageState.geo;
    $('positionCardNote').textContent='Su comentario está completo en una sola imagen ('+pageState.geo.W+' × '+H+' píxeles, letra de '+font+' px). Para redes sociales, un texto de 150 a 220 palabras suele resultar más cómodo de leer.';
    $('positionDownload').textContent='⬇ Guardar imagen';
  }
  async function render(){
    const seq=++drawCounter,o=data(),canvas=$('positionCanvas'),ctx=canvas.getContext('2d');
    const [brand,portrait,topical,watermark]=await Promise.all([
      img('assets/marco-andres-marca.svg').catch(()=>null),
      img('assets/marco-andres-silva-lopez.jpeg').catch(()=>null),
      o.photo?img(o.photo).catch(()=>null):Promise.resolve(null),
      img('assets/marca-agua-marco-palacio-v116.png').catch(()=>null)
    ]);
    if(seq!==drawCounter)return;
    const geo=geometry(ctx,o,topical);
    pageState={o,geo,pages:[{lines:geo.bodyLines}],assets:{brand,portrait,topical,watermark}};
    selectedPage=0;previewPage(0);
    current={...o,generated:new Date().toISOString()};
  }
  function canvasBlob(c){return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('No fue posible preparar la imagen.')),'image/png'))}
  async function allCards(){
    if(!pageState)await render();
    if(!pageState)return [];
    const output=[],temp=document.createElement('canvas'),stamp=today();
    for(let i=0;i<pageState.pages.length;i++){
      drawPage(temp,i,pageState);
      const blob=await canvasBlob(temp);
      output.push(new File([blob],'COMENTARIO-MARCO-'+stamp+'-TARJETA-'+String(i+1).padStart(2,'0')+'.png',{type:'image/png'}));
    }
    return output;
  }
  window.positionAllCardFiles=allCards;
  // ZIP sin dependencias externas: permite descargar todas las tarjetas desde Safari/iOS.
  function zip32(n){return [n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255]}
  function zip16(n){return [n&255,(n>>>8)&255]}
  function crc32(bytes){
    let c=0xFFFFFFFF;
    for(const b of bytes){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xEDB88320:0)}
    return (c^0xFFFFFFFF)>>>0;
  }
  async function makeZip(files){
    const encoder=new TextEncoder(),chunks=[],directory=[];
    let offset=0;
    for(const file of files){
      const name=encoder.encode(file.name),body=new Uint8Array(await file.arrayBuffer()),crc=crc32(body);
      const local=new Uint8Array([80,75,3,4,20,0,0,0,0,0,0,0,0,0,...zip32(crc),...zip32(body.length),...zip32(body.length),...zip16(name.length),0,0]);
      chunks.push(local,name,body);
      const central=new Uint8Array([80,75,1,2,20,0,20,0,0,0,0,0,0,0,0,0,...zip32(crc),...zip32(body.length),...zip32(body.length),...zip16(name.length),0,0,0,0,0,0,0,0,0,0,0,0,...zip32(offset)]);
      directory.push(central,name);offset+=local.length+name.length+body.length;
    }
    const dirLength=directory.reduce((n,b)=>n+b.length,0),count=files.length;
    const end=new Uint8Array([80,75,5,6,0,0,0,0,...zip16(count),...zip16(count),...zip32(dirLength),...zip32(offset),0,0]);
    return new Blob([...chunks,...directory,end],{type:'application/zip'});
  }
  function downloadBlob(blob,name){
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=name;a.style.display='none';document.body.appendChild(a);a.click();
    setTimeout(()=>{a.remove();URL.revokeObjectURL(url)},2500);
  }
  async function downloadAll(){
    const files=await allCards();if(!files.length)return;
    const filename='COMENTARIO-MARCO-COMPLETO-'+today();
    try{
      if(files.length===1)downloadBlob(files[0],files[0].name);
      else downloadBlob(await makeZip(files),filename+'.zip');
    }catch(e){alert('No se pudieron guardar las tarjetas. '+(e.message||''))}
  }
  window.positionDownloadAll=downloadAll;
  function schedule(){clearTimeout(drawTimer);drawTimer=setTimeout(()=>render().catch(console.error),220)}
  function openPhotoDB(){
    return new Promise((resolve,reject)=>{
      if(typeof indexedDB==='undefined'){reject(new Error('El almacenamiento de fotografías no está disponible.'));return}
      const r=indexedDB.open(PHOTO_DB,1);
      r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(PHOTO_STORE))r.result.createObjectStore(PHOTO_STORE,{keyPath:'id'})};
      r.onsuccess=()=>resolve(r.result);
      r.onerror=()=>reject(r.error||new Error('No se pudo abrir el archivo de fotografías.'));
      r.onblocked=()=>reject(new Error('Cierre las otras pestañas de la Matriz y vuelva a intentar.'));
    });
  }
  async function compactPhoto(){
    const image=await img(photoData);
    const scale=Math.min(1,1600/Math.max(image.width,image.height));
    const c=document.createElement('canvas');
    c.width=Math.max(1,Math.round(image.width*scale));c.height=Math.max(1,Math.round(image.height*scale));
    const ctx=c.getContext('2d');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(image,0,0,c.width,c.height);
    return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('No se pudo procesar la fotografía.')),'image/jpeg',.84));
  }
  async function savePositionPhoto(id){
    const blob=await compactPhoto();
    // El motor portátil transforma el Blob en ArrayBuffer para Safari de iPad/iPhone.
    const record=window.MatrizBinaryStore?await window.MatrizBinaryStore.pack({id,blob}):{id,blob:await blob.arrayBuffer(),type:'image/jpeg'};
    const db=await openPhotoDB();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(PHOTO_STORE,'readwrite');
      tx.objectStore(PHOTO_STORE).put(record);
      tx.oncomplete=()=>{db.close();resolve()};
      tx.onerror=()=>{const err=tx.error;db.close();reject(err||new Error('No se pudo guardar la fotografía.'))};
      tx.onabort=()=>{const err=tx.error;db.close();reject(err||new Error('Guardado de fotografía interrumpido.'))};
    });
  }
  async function getPositionPhoto(id){
    const db=await openPhotoDB();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(PHOTO_STORE,'readonly'),r=tx.objectStore(PHOTO_STORE).get(id);
      r.onsuccess=()=>{
        const record=r.result;
        if(!record){resolve(null);return}
        const unpack=window.MatrizBinaryStore?window.MatrizBinaryStore.unpack(record):record;
        resolve(unpack.blob instanceof Blob?unpack.blob:new Blob([unpack.blob],{type:unpack.type||'image/jpeg'}));
      };
      r.onerror=()=>reject(r.error);
      tx.oncomplete=()=>db.close();
    });
  }
  function blobDataURL(blob){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(reader.result);
      reader.onerror=()=>reject(reader.error||new Error('No se pudo recuperar la fotografía.'));
      reader.readAsDataURL(blob);
    });
  }
  async function removePositionPhoto(id){
    const db=await openPhotoDB();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(PHOTO_STORE,'readwrite');
      tx.objectStore(PHOTO_STORE).delete(id);
      tx.oncomplete=()=>{db.close();resolve()};
      tx.onerror=()=>{const err=tx.error;db.close();reject(err)};
    });
  }
  async function archiveSave(){
    if(!current||!clean(f.elements.opinion.value)){alert('Primero prepare y revise su comentario.');return}
    const button=$('positionSave');button.disabled=true;
    const o=data(),old=activeArchiveId?archive.find(a=>a.id===activeArchiveId):null;
    const id=old?.id||'POS-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);
    const now=new Date().toISOString();
    const item={...o,photo:undefined,id,hasPhoto:!!photoData||!!old?.hasPhoto,generated:old?.generated||now,updated:now};
    try{
      if(photoData)await savePositionPhoto(item.id);
      const next=[item,...archive.filter(a=>a.id!==id)].slice(0,100);
      localStorage.setItem(KEY,JSON.stringify(next));
      archive=next;activeArchiveId=id;
      button.textContent='💾 Actualizar comentario guardado';
      renderArchive();
      archiveStatus(old?'Comentario actualizado en el mismo registro, sin duplicados.':'Comentario guardado. Puede recuperarlo y ver su tarjeta desde el archivo.');
      alert(old?'El comentario guardado quedó actualizado, conservando su registro original.':photoData?'El comentario y su fotografía quedaron guardados en el archivo.':'Su comentario quedó guardado en el archivo.');
    }catch(e){
      alert('No fue posible guardar el comentario con su fotografía: '+(e.message||'revise el espacio disponible')+'. No se eliminó ningún registro anterior.');
    }finally{button.disabled=false}
  }
  function archiveStatus(message,warning=false){
    const box=$('positionArchiveStatus');if(!box)return;
    box.textContent=message;
    box.classList.toggle('hidden',!message);
    box.classList.toggle('warn',warning);
  }
  function renderArchive(){
    const box=$('positionArchive');$('positionArchiveCount').textContent=archive.length;
    if(!archive.length){box.innerHTML='<p class="muted">Aún no hay comentarios guardados.</p>';return}
    box.innerHTML=archive.map(a=>
      '<article class="position-archive-item" data-pos-card="'+esc(a.id)+'" tabindex="0" aria-label="Ver tarjeta de '+esc(a.title||a.topic||'Comentario')+'">'+
        '<div class="position-archive-copy"><b>'+esc(a.title||a.topic||'Comentario')+'</b><small>'+esc(a.scope||'Floridablanca')+' · '+esc((a.updated||a.generated||'').slice(0,10))+(a.hasPhoto?' · 📷 Fotografía guardada':'')+'</small>'+
        '<span class="position-archive-hint">👁 Toque aquí para recuperar y ver este comentario.</span></div>'+
        '<div class="position-archive-buttons">'+
          '<button type="button" data-pos-load="'+esc(a.id)+'">👁 Ver tarjeta actualizada</button>'+
          '<button type="button" data-pos-edit="'+esc(a.id)+'">✏️ Abrir y editar</button>'+
          '<button type="button" data-pos-del="'+esc(a.id)+'" aria-label="Eliminar posición archivada">🗑 Eliminar</button>'+
        '</div></article>'
    ).join('');
  }
  async function loadArchive(id,mode='view'){
    const item=archive.find(a=>a.id===id);if(!item)return;
    const seq=++loadCounter;
    activeArchiveId=id;
    $('positionSave').textContent='💾 Actualizar comentario guardado';
    archiveStatus('Recuperando el comentario guardado y preparando su nueva tarjeta…');
    ['topic','angle','title','opinion','cardText','scope','newsDate','source','sourceUrl'].forEach(k=>{
      if(f.elements[k])f.elements[k].value=item[k]||((k==='topic')?(item.title||''):'');
    });
    f.elements.cardText.value='';
    f.elements.format.value=item.format==='story'?'story':'post';
    const selected=f.querySelector('input[name="format"][value="'+(item.format==='story'?'story':'post')+'"]');
    if(selected)selected.checked=true;
    photoData='';$('positionImage').value='';
    let photoWarning='';
    if(item.hasPhoto){
      try{
        const blob=await getPositionPhoto(item.id);
        if(seq!==loadCounter)return;
        if(blob)photoData=await blobDataURL(blob);
        else photoWarning='Se recuperó el texto, pero no se encontró la fotografía en este dispositivo. Puede restaurarla desde un respaldo integral que la incluya.';
      }catch(e){if(seq===loadCounter)photoWarning='Se recuperó el texto, pero la fotografía no se pudo abrir: '+(e.message||'revise el respaldo integral')}
    }
    if(seq!==loadCounter)return;
    $('positionEditor').classList.remove('hidden');await render();
    if(seq!==loadCounter)return;
    archiveStatus(photoWarning||'Comentario recuperado. Su texto y su tarjeta se muestran con el diseño actual.',!!photoWarning);
    if(mode==='edit')$('positionEditor').scrollIntoView({behavior:'smooth',block:'start'});
    else document.querySelector('.position-preview-card')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  $('positionPrevCard').addEventListener('click',()=>previewPage(selectedPage-1));
  $('positionNextCard').addEventListener('click',()=>previewPage(selectedPage+1));
  f.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!clean(f.elements.title.value)||!clean(f.elements.opinion.value)){alert('Revise el titular y su comentario.');return}
    await render();$('positionCanvas').scrollIntoView({behavior:'smooth',block:'nearest'});
  });
  $('positionDraft').addEventListener('click',makeDraft);
  $('positionAI').addEventListener('click',aiPrompt);
  $('positionAICopy').addEventListener('click',copyPrompt);
  $('positionSave').addEventListener('click',async()=>{await render();await archiveSave()});
  $('positionClear').addEventListener('click',()=>{
    ++loadCounter;activeArchiveId=null;f.reset();photoData='';$('positionImage').value='';$('positionEditor').classList.add('hidden');$('positionAIPanel').classList.add('hidden');
    $('positionSave').textContent='💾 Guardar comentario y foto';archiveStatus('');
    render();$('positionTopic').focus();
  });
  $('positionImage').addEventListener('change',e=>{
    ++loadCounter;
    const file=e.target.files?.[0];if(!file){photoData='';schedule();return}
    if(file.size>8*1024*1024){alert('Elija una fotografía menor de 8 MB.');e.target.value='';return}
    const reader=new FileReader();reader.onload=()=>{photoData=reader.result;schedule()};reader.readAsDataURL(file);
  });
  $('positionEditor').addEventListener('input',schedule);
  $('positionEditor').addEventListener('change',schedule);
  $('positionShare').addEventListener('click',async()=>{
    if($('positionEditor').classList.contains('hidden')){alert('Prepare primero su comentario.');return}
    if(!$('positionEditor').classList.contains('hidden'))await render();
    if(typeof window.positionShareDirect==='function')await window.positionShareDirect();
    else alert('El botón para compartir no está disponible. Actualice la aplicación.');
  });
  $('positionDownload').addEventListener('click',async()=>{await render();await downloadAll()});
  $('positionDownloadPdf').addEventListener('click',async()=>{
    try{
      await render();
      window.FloridablancaCanvasPDF.downloadCanvas($('positionCanvas'),'COMENTARIO-MARCO-FLORIDABLANCA-'+today()+'.pdf');
    }catch(e){alert('No se pudo guardar el comentario en PDF: '+e.message);}
  });
  $('positionCopyText').addEventListener('click',async()=>{
    const o=data();
    if(!o.opinion){alert('Primero prepare su comentario.');return}
    const full=(o.title||o.topic)+'\n\n'+o.opinion+'\n\nMarco Andrés Silva López'+(o.sourceUrl?'\nFuente: '+o.sourceUrl:'');
    try{await navigator.clipboard.writeText(full);alert('Comentario completo copiado. Puede pegarlo como texto de su publicación.')}
    catch{
      const area=document.createElement('textarea');area.value=full;document.body.appendChild(area);area.select();
      const ok=document.execCommand('copy');area.remove();
      alert(ok?'Comentario completo copiado.':'Su navegador no permitió copiar automáticamente. Seleccione el texto en el editor.');
    }
  });
  $('positionContacts').addEventListener('click',async()=>{
    if($('positionEditor').classList.contains('hidden')){alert('Prepare primero su comentario.');return}
    await render();if(typeof window.positionWhatsAppDirect==='function')window.positionWhatsAppDirect();
  });
  $('positionArchive').addEventListener('click',e=>{
    const b=e.target.closest('button');
    if(b?.dataset.posLoad){loadArchive(b.dataset.posLoad).catch(err=>alert('No fue posible abrir esta posición: '+err.message));return}
    if(b?.dataset.posEdit){loadArchive(b.dataset.posEdit,'edit').catch(err=>alert('No fue posible editar esta posición: '+err.message));return}
    if(b?.dataset.posDel&&confirm('¿Eliminar esta posición del archivo?')){
      const deleted=archive.find(a=>a.id===b.dataset.posDel);
      const next=archive.filter(a=>a.id!==b.dataset.posDel);
      try{
        localStorage.setItem(KEY,JSON.stringify(next));archive=next;renderArchive();
        if(activeArchiveId===b.dataset.posDel){activeArchiveId=null;$('positionSave').textContent='💾 Guardar comentario y foto'}
        if(deleted?.hasPhoto)removePositionPhoto(deleted.id).catch(e=>console.warn('Fotografía pendiente de limpieza:',e));
      }catch{alert('No se pudo guardar el cambio. No se eliminó el registro anterior.')}
      return;
    }
    if(b)return;
    const card=e.target.closest('[data-pos-card]');
    if(card?.dataset.posCard)loadArchive(card.dataset.posCard).catch(err=>alert('No fue posible ver esta posición: '+err.message));
  });
  $('positionArchive').addEventListener('keydown',e=>{
    if(e.target.closest('button')||!['Enter',' '].includes(e.key))return;
    const card=e.target.closest('[data-pos-card]');if(!card)return;
    e.preventDefault();loadArchive(card.dataset.posCard).catch(err=>alert('No fue posible ver esta posición: '+err.message));
  });
  $('positionContactsClose')?.addEventListener('click',()=>$('positionContactsPanel').classList.add('hidden'));
  renderArchive();
  render();
})();
