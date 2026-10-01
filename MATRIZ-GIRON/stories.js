/* ============================================================
   CONTANDO TU HISTORIA · v1.3.21
   Empresas y emprendimientos que generan progreso para Girón.
   Módulo aislado: no modifica app.js ni la estructura base.
   ============================================================ */
(()=>{
  'use strict';
  const APP_KEY='matriz_giron_v1';
  const MEDIA_DB='matriz_giron_business_media_v1', MEDIA_STORE='media';
  const SECTORS=['Comercio','Construcción','Turismo','Gastronomía','Industria','Servicios','Agro','Tecnología','Transporte','Salud','Educación','Cultura','Emprendimiento','Otro'];
  const OPPORTUNITIES=['Busca proveedores','Ofrece empleo','Busca trabajadores','Busca capacitación','Necesita apoyo institucional','Participa en actividades comunitarias','Busca alianzas comerciales'];
  let activeBusinessId='', pendingMedia=[], currentCardBusiness=null;

  const $=id=>document.getElementById(id);
  const clean=v=>String(v??'').trim();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const digits=v=>clean(v).replace(/\D/g,'');
  const norm=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\b(BARRIO|VEREDA|SECTOR|URBANIZACION|COMUNA|CORREGIMIENTO)\b/g,' ').replace(/[^A-Z0-9]+/g,' ').trim();
  const getData=()=>{try{return (typeof db!=='undefined'&&db)||JSON.parse(localStorage.getItem(APP_KEY)||'{}')}catch{return {}}};
  const businesses=()=>Array.isArray(getData().businesses)?getData().businesses:[];
  const toastMsg=m=>{try{toast(m)}catch{console.log(m)}};
  const uid=()=>`B-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
  const money=n=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(Number(n||0));

  function ensureBusinesses(){
    if(typeof db!=='undefined'&&!Array.isArray(db.businesses))db.businesses=[];
  }
  function persist(){
    if(typeof saveDB==='function')saveDB();
    else localStorage.setItem(APP_KEY,JSON.stringify(getData()));
    renderAllBusiness();
  }

  function openMediaDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open(MEDIA_DB,1);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(MEDIA_STORE)){const s=d.createObjectStore(MEDIA_STORE,{keyPath:'id'});s.createIndex('businessId','businessId',{unique:false})}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
  async function mediaFor(businessId){if(!businessId||!('indexedDB' in window))return[];const d=await openMediaDB();return new Promise((resolve,reject)=>{const tx=d.transaction(MEDIA_STORE,'readonly'),r=tx.objectStore(MEDIA_STORE).index('businessId').getAll(businessId);r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error);tx.oncomplete=()=>d.close()})}
  async function putMedia(m){const d=await openMediaDB();return new Promise((resolve,reject)=>{const tx=d.transaction(MEDIA_STORE,'readwrite');tx.objectStore(MEDIA_STORE).put(m);tx.oncomplete=()=>{d.close();resolve()};tx.onerror=()=>{const e=tx.error;d.close();reject(e)}})}
  async function removeMedia(id){const d=await openMediaDB();return new Promise((resolve,reject)=>{const tx=d.transaction(MEDIA_STORE,'readwrite');tx.objectStore(MEDIA_STORE).delete(id);tx.oncomplete=()=>{d.close();resolve()};tx.onerror=()=>{const e=tx.error;d.close();reject(e)}})}
  async function deleteBusinessMedia(bid){const rows=await mediaFor(bid);for(const r of rows)await removeMedia(r.id)}
  function compress(file,max=1200,q=.72){return new Promise((resolve,reject)=>{const u=URL.createObjectURL(file),i=new Image();i.onload=()=>{try{let w=i.naturalWidth,h=i.naturalHeight,s=Math.min(1,max/Math.max(w,h));w=Math.max(1,Math.round(w*s));h=Math.max(1,Math.round(h*s));const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{alpha:false});x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(i,0,0,w,h);c.toBlob(b=>{URL.revokeObjectURL(u);b?resolve(b):reject(new Error('No se pudo procesar la imagen'))},'image/jpeg',q)}catch(e){URL.revokeObjectURL(u);reject(e)}};i.onerror=()=>{URL.revokeObjectURL(u);reject(new Error('Imagen no válida'))};i.src=u})}

  function createModals(){
    if($('businessModal'))return;
    document.body.insertAdjacentHTML('beforeend',`
      <div class="modal" id="businessModal"><div class="modal-card business-modal-card">
        <div class="modal-head"><div><h3>Registrar empresa / emprendimiento</h3><p class="petition-subtitle">Contando tu historia · capacidades productivas de Girón</p></div><button type="button" data-business-close>×</button></div>
        <form id="businessForm" class="form-grid business-form">
          <input type="hidden" name="id">
          <label class="span-2">Nombre de la empresa / emprendimiento<input name="name" required></label>
          <label>Propietario / representante<input name="owner"></label><label>NIT (opcional)<input name="nit"></label>
          <label>Sector económico<select name="sector" id="businessSector"></select></label><label>Año de creación<input name="foundedYear" type="number" min="1800" max="2100"></label>
          <label>Territorio / barrio<input name="territory"></label><label>Vereda<input name="vereda" placeholder="Ej.: VEREDA CARRIZAL"></label>
          <label class="span-2">Dirección<input name="address"></label>
          <label>Teléfono<input name="phone"></label><label>WhatsApp<input name="whatsapp" inputmode="tel"></label>
          <label>Correo<input name="email" type="email"></label><label>Página web<input name="website" type="url" placeholder="https://..."></label>
          <label>Instagram<input name="instagram" placeholder="@empresa"></label><label>Facebook<input name="facebook"></label>
          <label>Número aproximado de empleos<input name="jobs" type="number" min="0" step="1"></label><label>¿Autoriza difusión pública?<select name="publicConsent"><option value="Pendiente">Pendiente</option><option value="Sí">Sí</option><option value="No">No</option></select></label>
          <label class="span-2">Productos / servicios<textarea name="products" placeholder="¿Qué hace y qué ofrece la empresa?"></textarea></label>
          <label class="span-2">Historia de la empresa<textarea name="story" placeholder="¿Cómo nació y cómo ha crecido?"></textarea></label>
          <label class="span-2">¿Cómo nació?<textarea name="origin"></textarea></label>
          <label class="span-2">¿Qué aporta a Girón?<textarea name="contribution"></textarea></label>
          <label>Mayor desafío<textarea name="challenge"></textarea></label><label>Sueño para el futuro<textarea name="dream"></textarea></label>
          <div class="span-2 business-opportunities"><strong>Oportunidades de conexión</strong><div>${OPPORTUNITIES.map(o=>`<label><input type="checkbox" name="opportunities" value="${esc(o)}"> ${esc(o)}</label>`).join('')}</div></div>
          <div class="span-2 business-media-box">
            <div class="business-media-head"><div><strong>Logo y fotografías</strong><small>Puede agregar 1 logo y hasta 4 fotografías representativas.</small></div></div>
            <div class="business-media-buttons"><label class="photo-button">🏷️ Logo<input id="businessLogoInput" type="file" accept="image/*"></label><label class="photo-button">📷 Tomar foto<input id="businessCameraInput" type="file" accept="image/*" capture="environment"></label><label class="photo-button secondary-photo">🖼️ Galería<input id="businessPhotoInput" type="file" accept="image/*" multiple></label></div>
            <div id="businessMediaGallery" class="business-media-gallery"></div>
          </div>
          <label class="span-2">Notas internas<textarea name="notes"></textarea></label>
          <div class="span-2 form-actions"><button class="primary" type="submit">Guardar empresa y generar tarjeta</button><button class="secondary" type="button" data-business-close>Cancelar</button></div>
        </form>
      </div></div>
      <div class="modal" id="businessDetailModal"><div class="modal-card business-detail-modal"><div class="modal-head"><h3>Contando tu historia</h3><button type="button" data-business-detail-close>×</button></div><div id="businessDetailBody"></div></div></div>
      <div class="modal" id="businessCardModal"><div class="modal-card business-card-modal"><div class="modal-head"><div><h3>🎨 Tarjeta · Contando tu historia</h3><p class="petition-subtitle">Lista para guardar o compartir.</p></div><button type="button" data-business-card-close>×</button></div><div class="business-card-preview"><canvas id="businessCardCanvas" width="1080" height="1080"></canvas></div><div class="business-card-actions"><button class="primary" id="businessCardShare" type="button">📤 Compartir</button><button class="secondary" id="businessCardDownload" type="button">⬇ Guardar imagen</button><button class="business-wa" id="businessCardContacts" type="button">🟢 Contactos autorizados</button></div></div></div>
      <div class="modal" id="businessContactsModal"><div class="modal-card business-contacts-modal"><div class="modal-head"><div><h3>Contactos autorizados</h3><p class="petition-subtitle">Seleccione individualmente a quién desea compartir esta historia.</p></div><button type="button" data-business-contacts-close>×</button></div><div class="business-contact-filter"><label>Vereda<select id="businessContactsVereda"><option value="">Todas</option></select></label></div><div id="businessContactsList"></div></div></div>
    `);
  }

  function openModalEl(id){$(id)?.classList.add('open')}
  function closeModalEl(id){$(id)?.classList.remove('open')}
  function clearPending(){pendingMedia.forEach(m=>m.url&&URL.revokeObjectURL(m.url));pendingMedia=[]}

  async function onMediaFiles(type,files){
    const list=[...(files||[])]; if(!list.length)return;
    if(type==='logo')pendingMedia=pendingMedia.filter(m=>{if(m.type==='logo'&&m.url)URL.revokeObjectURL(m.url);return m.type!=='logo'});
    const existing=activeBusinessId?await mediaFor(activeBusinessId):[];
    const photoCount=existing.filter(x=>x.type==='photo').length+pendingMedia.filter(x=>x.type==='photo').length;
    let allowed=type==='photo'?Math.max(0,4-photoCount):1;
    for(const f of list.slice(0,allowed)){
      if(!f.type.startsWith('image/'))continue;
      const blob=await compress(f,type==='logo'?800:1200,type==='logo'?.78:.72);
      pendingMedia.push({id:`BM-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`,type,blob,url:URL.createObjectURL(blob),created:new Date().toISOString()});
    }
    await renderMediaGallery();
  }
  async function renderMediaGallery(){
    const host=$('businessMediaGallery');if(!host)return;
    const stored=activeBusinessId?await mediaFor(activeBusinessId):[];
    const rows=[...stored.map(x=>({...x,stored:true,url:URL.createObjectURL(x.blob)})),...pendingMedia.map(x=>({...x,stored:false}))];
    host.innerHTML=rows.length?rows.map(m=>`<div class="business-media-thumb"><button type="button" data-media-remove="${esc(m.id)}" data-stored="${m.stored?'1':'0'}">×</button><img src="${m.url}" alt="${m.type==='logo'?'Logo':'Fotografía'}"><span>${m.type==='logo'?'LOGO':'FOTO'}${m.stored?'':' · por guardar'}</span></div>`).join(''):'<div class="business-media-empty">Aún no hay logo ni fotografías.</div>';
  }

  function resetBusinessForm(){
    const f=$('businessForm');if(!f)return;f.reset();f.elements.id.value='';activeBusinessId='';clearPending();renderMediaGallery();
  }
  async function openEdit(id){
    const b=businesses().find(x=>x.id===id);if(!b)return;resetBusinessForm();activeBusinessId=id;const f=$('businessForm');Object.entries(b).forEach(([k,v])=>{if(k==='opportunities')return;if(f.elements[k])f.elements[k].value=v??''});[...f.querySelectorAll('input[name="opportunities"]')].forEach(c=>c.checked=(b.opportunities||[]).includes(c.value));await renderMediaGallery();openModalEl('businessModal');
  }
  async function savePendingMedia(bid){for(const m of pendingMedia)await putMedia({id:m.id,businessId:bid,type:m.type,blob:m.blob,created:m.created});clearPending()}

  function matchTerritory(b,term){if(!term)return true;const t=norm(term);return norm(b.vereda).includes(t)||norm(b.territory).includes(t)||t.includes(norm(b.vereda))||t.includes(norm(b.territory))}
  function publicBusinesses(){return businesses().filter(b=>b.publicConsent==='Sí')}
  function businessKpis(){
    const bs=businesses(),publicBs=publicBusinesses();const jobs=bs.reduce((s,b)=>s+Number(b.jobs||0),0);const sectors=new Set(bs.map(b=>b.sector).filter(Boolean)).size;const territories=new Set(bs.map(b=>b.vereda||b.territory).filter(Boolean)).size;
    return [[bs.length,'Empresas registradas'],[publicBs.length,'Autorizadas para difusión'],[jobs,'Empleos reportados'],[sectors,'Sectores económicos'],[territories,'Territorios representados']];
  }

  function renderKpis(){const h=$('businessKpis');if(!h)return;h.innerHTML=businessKpis().map(([n,t])=>`<div class="business-kpi"><strong>${Number(n).toLocaleString('es-CO')}</strong><span>${esc(t)}</span></div>`).join('')}
  function renderFilters(){
    const sf=$('businessSectorFilter'),tf=$('businessTerritoryFilter');if(!sf||!tf)return;const sCur=sf.value,tCur=tf.value;
    const secs=[...new Set(businesses().map(b=>b.sector).filter(Boolean))].sort();sf.innerHTML='<option value="">Todos los sectores</option>'+secs.map(x=>`<option>${esc(x)}</option>`).join('');sf.value=secs.includes(sCur)?sCur:'';
    const terr=[...new Set(businesses().map(b=>b.vereda||b.territory).filter(Boolean))].sort();tf.innerHTML='<option value="">Todos los territorios</option>'+terr.map(x=>`<option>${esc(x)}</option>`).join('');tf.value=terr.includes(tCur)?tCur:'';
  }
  async function thumbnailFor(id){const ms=await mediaFor(id);const m=ms.find(x=>x.type==='logo')||ms.find(x=>x.type==='photo');return m?URL.createObjectURL(m.blob):''}
  async function renderDirectory(){
    const host=$('businessDirectory');if(!host)return;
    const q=norm($('businessSearch')?.value),sec=$('businessSectorFilter')?.value||'',terr=$('businessTerritoryFilter')?.value||'';
    const rows=businesses().filter(b=>(!q||[b.name,b.owner,b.sector,b.territory,b.vereda,b.products].some(v=>norm(v).includes(q)))&&(!sec||b.sector===sec)&&(!terr||(b.vereda||b.territory)===terr));
    if(!rows.length){host.innerHTML='<div class="card business-empty">No hay empresas que coincidan con los filtros.</div>';return}
    const cards=[];
    for(const b of rows){const img=await thumbnailFor(b.id);cards.push(`<article class="card business-card"><div class="business-card-top">${img?`<img src="${img}" alt="${esc(b.name)}">`:`<div class="business-avatar">🏢</div>`}<div><span class="business-sector-tag">${esc(b.sector||'Sin sector')}</span><h3>${esc(b.name)}</h3><p>${esc(b.vereda||b.territory||'Girón')}</p></div></div><div class="business-card-story">${esc(b.contribution||b.story||b.products||'')}</div><div class="business-card-meta"><span>👥 ${Number(b.jobs||0)} empleos</span><span>${b.publicConsent==='Sí'?'✅ Difusión autorizada':'🔒 Uso interno'}</span></div><div class="business-card-buttons"><button type="button" data-business-view="${b.id}">Ver historia</button>${b.publicConsent==='Sí'?`<button type="button" data-business-card="${b.id}">🎨 Tarjeta</button>`:''}${(b.whatsapp||b.phone)?`<button type="button" data-business-wa="${b.id}">🟢 WhatsApp</button>`:''}<button type="button" data-business-edit="${b.id}">✏️</button><button type="button" data-business-delete="${b.id}">🗑️</button></div></article>`)}
    host.innerHTML=cards.join('');
  }

  async function renderDetail(id){
    const b=businesses().find(x=>x.id===id);if(!b)return;const ms=await mediaFor(id);const urls=ms.map(m=>({...m,url:URL.createObjectURL(m.blob)}));const logo=urls.find(x=>x.type==='logo'),photos=urls.filter(x=>x.type==='photo');
    $('businessDetailBody').innerHTML=`<div class="business-detail-head">${logo?`<img src="${logo.url}" alt="Logo ${esc(b.name)}">`:'<div class="business-detail-logo">🏢</div>'}<div><span>${esc(b.sector||'Empresa')}</span><h2>${esc(b.name)}</h2><p>${esc(b.vereda||b.territory||'Girón')}</p></div></div>${photos.length?`<div class="business-photo-strip">${photos.map(p=>`<img src="${p.url}" alt="Fotografía de ${esc(b.name)}">`).join('')}</div>`:''}<div class="business-detail-grid"><section><h4>Su historia</h4><p>${esc(b.story||'—')}</p></section><section><h4>¿Cómo nació?</h4><p>${esc(b.origin||'—')}</p></section><section><h4>Lo que aporta a Girón</h4><p>${esc(b.contribution||'—')}</p></section><section><h4>Su sueño</h4><p>${esc(b.dream||'—')}</p></section></div><div class="business-detail-facts"><span><b>Productos / servicios</b>${esc(b.products||'—')}</span><span><b>Empleos reportados</b>${Number(b.jobs||0)}</span><span><b>Representante</b>${esc(b.owner||'—')}</span><span><b>Contacto</b>${esc(b.whatsapp||b.phone||b.email||'—')}</span></div>${(b.opportunities||[]).length?`<div class="business-opportunity-list"><strong>Oportunidades de conexión</strong>${b.opportunities.map(o=>`<span>${esc(o)}</span>`).join('')}</div>`:''}<div class="business-detail-actions">${b.publicConsent==='Sí'?`<button class="primary" type="button" data-business-card="${b.id}">🎨 Generar tarjeta</button>`:''}${b.website?`<a class="secondary" href="${esc(b.website)}" target="_blank" rel="noopener">🌐 Sitio web</a>`:''}</div>`;
    openModalEl('businessDetailModal');
  }

  function openWhatsAppBusiness(id){const b=businesses().find(x=>x.id===id);if(!b)return;let n=digits(b.whatsapp||b.phone);if(!n){alert('La empresa no tiene WhatsApp registrado.');return}if(n.length===10)n='57'+n;const msg=`Hola. Encontré a ${b.name} en “Contando tu historia”, el directorio de empresas y emprendimientos que generan progreso en Girón.`;window.open(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`,'_blank','noopener')}

  function wrap(ctx,text,maxWidth){const words=clean(text).split(/\s+/).filter(Boolean),lines=[];let line='';for(const w of words){const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxWidth&&line){lines.push(line);line=w}else line=t}if(line)lines.push(line);return lines}
  function drawLines(ctx,text,x,y,maxWidth,lineH,maxLines){const lines=wrap(ctx,text,maxWidth).slice(0,maxLines);lines.forEach((l,i)=>ctx.fillText(l,x,y+i*lineH));return y+lines.length*lineH}
  function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
  async function mediaImageForCard(id){const ms=await mediaFor(id),m=ms.find(x=>x.type==='photo')||ms.find(x=>x.type==='logo');if(!m)return null;const u=URL.createObjectURL(m.blob);try{return await loadImage(u)}finally{setTimeout(()=>URL.revokeObjectURL(u),1000)}}
  function cover(ctx,img,x,y,w,h){const r=Math.max(w/img.naturalWidth,h/img.naturalHeight),dw=img.naturalWidth*r,dh=img.naturalHeight*r;ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh)}

  async function cardMedia(id){
    const ms=await mediaFor(id), photo=ms.find(x=>x.type==='photo'), logo=ms.find(x=>x.type==='logo');
    async function img(m){if(!m)return null;const u=URL.createObjectURL(m.blob);try{return await loadImage(u)}finally{setTimeout(()=>URL.revokeObjectURL(u),1200)}}
    return {photo:await img(photo),logo:await img(logo)};
  }
  function fitImage(ctx,img,x,y,w,h,contain=false){
    if(!img)return;const r=contain?Math.min(w/img.naturalWidth,h/img.naturalHeight):Math.max(w/img.naturalWidth,h/img.naturalHeight),dw=img.naturalWidth*r,dh=img.naturalHeight*r;
    ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
  }
  function roundedImage(ctx,img,x,y,w,h,r=24){ctx.save();ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.clip();fitImage(ctx,img,x,y,w,h,false);ctx.restore()}
  async function buildCard(id){
    const b=businesses().find(x=>x.id===id);if(!b)return;currentCardBusiness=b;
    const c=$('businessCardCanvas'),x=c.getContext('2d'),W=1080,H=1080;x.clearRect(0,0,W,H);
    const media=await cardMedia(id);let ivan=null;try{ivan=await loadImage('assets/ivan-ortiz-foto.png')}catch{}

    // Tarjeta limpia: usa exclusivamente la información realmente diligenciada.
    x.fillStyle='#f7f8f5';x.fillRect(0,0,W,H);
    x.fillStyle='#062a52';x.fillRect(0,0,390,H);
    x.fillStyle='#f0c21a';x.fillRect(390,0,8,H);

    // Marca de la serie e Iván Ortiz, sin referencias electorales.
    x.fillStyle='#fff';x.font='italic 700 50px Georgia';x.fillText('Contando',46,74);x.fillText('tu historia',46,126);
    x.fillStyle='#f0c21a';x.fillRect(48,145,185,6);
    x.fillStyle='#fff';x.font='22px Arial';drawLines(x,'Empresas que hacen grande a Girón',48,185,285,28,2);
    if(ivan){x.save();x.beginPath();x.roundRect(34,252,322,430,30);x.clip();fitImage(x,ivan,34,252,322,430,false);x.restore()}
    x.fillStyle='#fff';x.font='italic 700 54px Georgia';x.fillText('Iván Ortiz',48,755);
    x.fillStyle='#f0c21a';x.fillRect(48,774,190,6);
    x.fillStyle='#fff';x.font='24px Arial';drawLines(x,'Conociendo y dando a conocer lo bueno de Girón',48,820,292,31,3);

    // Imagen principal. Si no fue cargada, se deja una superficie limpia, sin inventar contenido.
    if(media.photo){roundedImage(x,media.photo,430,48,606,425,30)}else{
      x.fillStyle='#e9eef2';x.beginPath();x.roundRect(430,48,606,425,30);x.fill();
      if(media.logo){x.fillStyle='#fff';x.beginPath();x.roundRect(590,125,286,286,32);x.fill();fitImage(x,media.logo,610,145,246,246,true)}
    }

    // Identidad de la empresa.
    if(media.logo&&media.photo){x.fillStyle='#fff';x.beginPath();x.roundRect(445,375,142,142,71);x.fill();x.save();x.beginPath();x.arc(516,446,62,0,Math.PI*2);x.clip();fitImage(x,media.logo,454,384,124,124,true);x.restore()}
    const nameX=media.logo&&media.photo?610:448;
    x.fillStyle='#062a52';x.font='900 43px Arial';drawLines(x,b.name,nameX,525,1015-nameX,48,2);
    let infoY=612;
    if(clean(b.sector)){x.fillStyle='#6b7785';x.font='21px Arial';x.fillText(clean(b.sector),nameX,infoY);infoY+=34}

    // Solo se dibujan bloques que contienen datos. No hay textos de relleno ni inferencias.
    const texts=[clean(b.contribution),clean(b.story),clean(b.products)].filter(Boolean);
    let y=Math.max(675,infoY+30);
    if(texts.length){
      x.fillStyle='#17324d';x.font='italic 700 31px Georgia';
      y=drawLines(x,texts[0],448,y,570,39,4)+18;
      x.fillStyle='#f0c21a';x.fillRect(448,y,135,5);y+=38;
      if(texts[1]){x.fillStyle='#17324d';x.font='23px Arial';y=drawLines(x,texts[1],448,y,570,31,3)+14}
      if(texts[2]){x.fillStyle='#17324d';x.font='21px Arial';y=drawLines(x,texts[2],448,y,570,29,3)+10}
    }
    if(Number(b.jobs||0)>0 && y<900){x.fillStyle='#17324d';x.font='21px Arial';x.fillText(`👥 ${Number(b.jobs)} empleo${Number(b.jobs)===1?'':'s'} reportado${Number(b.jobs)===1?'':'s'}`,448,y);y+=30}

    // Franja inferior: solo muestra los datos de contacto/ubicación realmente diligenciados.
    const contactRows=[];
    const place=clean(b.vereda||b.territory||b.address);
    const phone=clean(b.whatsapp||b.phone);
    const social=clean(b.instagram||b.website||b.facebook||b.email);
    if(place)contactRows.push('📍 '+place);
    if(phone)contactRows.push('📲 '+phone);
    if(social)contactRows.push('◉ '+social);
    x.fillStyle='#062a52';x.beginPath();x.roundRect(430,925,606,108,22);x.fill();
    x.fillStyle='#fff';x.font='20px Arial';
    if(contactRows.length){contactRows.slice(0,3).forEach((t,i)=>x.fillText(t,458,958+i*30))}
    else{x.fillStyle='#f0c21a';x.font='italic 700 23px Georgia';x.fillText(clean(b.name),458,987)}

    openModalEl('businessCardModal');
  }
  function canvasBlob(){return new Promise(resolve=>$('businessCardCanvas').toBlob(resolve,'image/png',.95))}
  async function shareCard(){if(!currentCardBusiness)return;const blob=await canvasBlob(),file=new File([blob],`CONTANDO-TU-HISTORIA-${clean(currentCardBusiness.name).replace(/[^A-Za-z0-9]+/g,'-')}.png`,{type:'image/png'});if(navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:`Contando tu historia · ${currentCardBusiness.name}`});return}downloadCard()}
  async function downloadCard(){if(!currentCardBusiness)return;const blob=await canvasBlob(),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`CONTANDO-TU-HISTORIA-${clean(currentCardBusiness.name).replace(/[^A-Za-z0-9]+/g,'-')}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200)}

  function renderContactShare(){
    const leaders=(getData().leaders||[]).filter(l=>l.communicationsConsent==='Sí'&&(l.whatsapp||l.phone));const vf=$('businessContactsVereda');if(vf){const cur=vf.value,vs=[...new Set(leaders.map(l=>l.vereda).filter(Boolean))].sort();vf.innerHTML='<option value="">Todas</option>'+vs.map(v=>`<option>${esc(v)}</option>`).join('');vf.value=vs.includes(cur)?cur:''}const f=vf?.value||'';const list=leaders.filter(l=>!f||l.vereda===f),host=$('businessContactsList');if(!host)return;host.innerHTML=list.length?list.map(l=>`<div class="business-contact-row"><div><strong>${esc(l.name)}</strong><span>${esc(l.role||'')} · ${esc(l.vereda||l.territory||'')}</span></div><button type="button" data-business-contact-wa="${l.id}">🟢 WhatsApp</button></div>`).join(''):'<div class="business-empty-inline">No hay contactos autorizados para este filtro.</div>';
  }
  function openContactWa(id){if(!currentCardBusiness)return;const l=(getData().leaders||[]).find(x=>x.id===id);if(!l||l.communicationsConsent!=='Sí')return;let n=digits(l.whatsapp||l.phone);if(n.length===10)n='57'+n;if(!n)return;const msg=`Hola ${clean(l.name)}. Quiero compartirte una historia de una empresa de Girón que genera progreso: *${currentCardBusiness.name}*. ${clean(currentCardBusiness.contribution||currentCardBusiness.story).slice(0,280)}`;window.open(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`,'_blank','noopener')}

  function renderBusinessIntel(){const host=$('businessIntel');if(!host)return;const bs=businesses(),jobs=bs.reduce((s,b)=>s+Number(b.jobs||0),0),by={};bs.forEach(b=>{const k=b.sector||'Sin sector';by[k]=(by[k]||0)+1});const rows=Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,8);host.innerHTML=`<div class="card business-intel"><div class="business-intel-head"><div><h3>🏢 Capacidades productivas de Girón</h3><p>Empresas y emprendimientos registrados en “Contando tu historia”.</p></div><button type="button" class="primary" data-open-stories>Ver directorio</button></div><div class="business-intel-kpis"><div><strong>${bs.length}</strong><span>Empresas</span></div><div><strong>${jobs.toLocaleString('es-CO')}</strong><span>Empleos reportados</span></div><div><strong>${new Set(bs.map(b=>b.sector).filter(Boolean)).size}</strong><span>Sectores</span></div><div><strong>${new Set(bs.map(b=>b.vereda||b.territory).filter(Boolean)).size}</strong><span>Territorios</span></div></div><div class="business-intel-bars">${rows.map(([n,c])=>`<div><span>${esc(n)}</span><i><b style="width:${bs.length?Math.max(4,c/bs.length*100):0}%"></b></i><strong>${c}</strong></div>`).join('')||'<small>Sin empresas registradas.</small>'}</div></div>`}

  function areaMatch(b,area){const a=norm(area),v=norm(b.vereda||b.territory);if(!v)return false;if(a==='GIRON')return v==='GIRON'||v.includes('AREA URBANA')||v.includes('CASCO URBANO');return v===a||v.includes(a)||a.includes(v)}
  function injectBusinessesIntoMap(){
    const panel=$('territoryDataPanel');if(!panel||panel.querySelector('[data-business-map-block]'))return;const h=panel.querySelector('.territory-panel-head h3');if(!h)return;const area=h.textContent.replace('📍','').trim();if(!area)return;const rows=publicBusinesses().filter(b=>areaMatch(b,area));const html=`<div class="territory-block" data-business-map-block><h4>🏢 Empresas que generan progreso</h4>${rows.length?rows.map(b=>`<div class="territory-row"><strong>${esc(b.name)}</strong><small>${esc(b.sector||'')} · ${esc(b.products||'')}</small><span class="territory-badge">${Number(b.jobs||0)} empleos reportados</span><button type="button" class="business-map-open" data-business-view="${b.id}">Ver historia</button></div>`).join(''):'<div class="territory-none">Sin empresas autorizadas para difusión asociadas a este territorio.</div>'}</div>`;const actions=panel.querySelector('.territory-panel-actions');if(actions)actions.insertAdjacentHTML('beforebegin',html);else panel.insertAdjacentHTML('beforeend',html);const kpis=panel.querySelector('.territory-mini-kpis');if(kpis)kpis.insertAdjacentHTML('beforeend',`<div class="territory-mini-kpi"><strong>${rows.length}</strong><span>Empresas</span></div>`);
  }

  async function deleteBusiness(id){if(!confirm('¿Eliminar esta empresa del directorio?'))return;const d=getData(),i=(d.businesses||[]).findIndex(x=>x.id===id);if(i<0)return;d.businesses.splice(i,1);await deleteBusinessMedia(id);persist();toastMsg('Empresa eliminada')}

  function renderAllBusiness(){renderKpis();renderFilters();renderDirectory();renderBusinessIntel();setTimeout(injectBusinessesIntoMap,40)}
  function bind(){
    ensureBusinesses();createModals();
    const sector=$('businessSector');if(sector)sector.innerHTML='<option value="">Seleccione...</option>'+SECTORS.map(s=>`<option>${esc(s)}</option>`).join('');
    $('businessNewBtn')?.addEventListener('click',()=>{resetBusinessForm();openModalEl('businessModal')});
    document.querySelectorAll('[data-business-close]').forEach(b=>b.addEventListener('click',()=>{closeModalEl('businessModal');clearPending()}));
    document.querySelectorAll('[data-business-detail-close]').forEach(b=>b.addEventListener('click',()=>closeModalEl('businessDetailModal')));
    document.querySelectorAll('[data-business-card-close]').forEach(b=>b.addEventListener('click',()=>closeModalEl('businessCardModal')));
    document.querySelectorAll('[data-business-contacts-close]').forEach(b=>b.addEventListener('click',()=>closeModalEl('businessContactsModal')));
    $('businessLogoInput')?.addEventListener('change',async e=>{try{await onMediaFiles('logo',e.target.files)}catch(err){alert(err.message)}e.target.value=''});
    $('businessCameraInput')?.addEventListener('change',async e=>{try{await onMediaFiles('photo',e.target.files)}catch(err){alert(err.message)}e.target.value=''});
    $('businessPhotoInput')?.addEventListener('change',async e=>{try{await onMediaFiles('photo',e.target.files)}catch(err){alert(err.message)}e.target.value=''});
    $('businessMediaGallery')?.addEventListener('click',async e=>{const b=e.target.closest('[data-media-remove]');if(!b)return;const id=b.dataset.mediaRemove;if(b.dataset.stored==='1'){if(confirm('¿Eliminar esta imagen?')){await removeMedia(id);await renderMediaGallery()}}else{const i=pendingMedia.findIndex(x=>x.id===id);if(i>=0){const [m]=pendingMedia.splice(i,1);m.url&&URL.revokeObjectURL(m.url);await renderMediaGallery()}}});
    $('businessForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,fd=new FormData(f),o=Object.fromEntries(fd.entries());o.opportunities=fd.getAll('opportunities');o.jobs=Number(o.jobs||0);o.updated=new Date().toISOString();const d=getData();if(!Array.isArray(d.businesses))d.businesses=[];let bid=o.id;if(bid){const i=d.businesses.findIndex(x=>x.id===bid);if(i>=0)d.businesses[i]={...d.businesses[i],...o}}else{bid=uid();o.id=bid;o.created=new Date().toISOString();d.businesses.push(o)}activeBusinessId=bid;await savePendingMedia(bid);closeModalEl('businessModal');persist();toastMsg('Empresa guardada en Contando tu historia');if(o.publicConsent==='Sí')setTimeout(()=>buildCard(bid),80)});
    ['businessSearch','businessSectorFilter','businessTerritoryFilter'].forEach(id=>$(id)?.addEventListener(id==='businessSearch'?'input':'change',renderDirectory));
    $('view-stories')?.addEventListener('click',e=>{const v=e.target.closest('[data-business-view]');if(v){renderDetail(v.dataset.businessView);return}const c=e.target.closest('[data-business-card]');if(c){buildCard(c.dataset.businessCard);return}const w=e.target.closest('[data-business-wa]');if(w){openWhatsAppBusiness(w.dataset.businessWa);return}const ed=e.target.closest('[data-business-edit]');if(ed){openEdit(ed.dataset.businessEdit);return}});
    document.body.addEventListener('click',e=>{const v=e.target.closest('[data-business-view]');if(v&&!e.target.closest('#view-stories'))renderDetail(v.dataset.businessView);const c=e.target.closest('[data-business-card]');if(c&&!e.target.closest('#view-stories'))buildCard(c.dataset.businessCard);const open=e.target.closest('[data-open-stories]');if(open&&typeof showView==='function')showView('stories');const wa=e.target.closest('[data-business-contact-wa]');if(wa)openContactWa(wa.dataset.businessContactWa)});
    $('businessCardShare')?.addEventListener('click',()=>shareCard().catch(err=>alert('No fue posible compartir: '+err.message)));
    $('businessCardDownload')?.addEventListener('click',()=>downloadCard().catch(err=>alert('No fue posible guardar: '+err.message)));
    $('businessCardContacts')?.addEventListener('click',()=>{renderContactShare();openModalEl('businessContactsModal')});
    $('businessContactsVereda')?.addEventListener('change',renderContactShare);
    $('businessDirectory')?.addEventListener('click',e=>{const del=e.target.closest('[data-business-delete]');if(del)deleteBusiness(del.dataset.businessDelete)});
    document.querySelectorAll('[data-view="stories"]').forEach(b=>b.addEventListener('click',()=>setTimeout(renderAllBusiness,0)));
    document.querySelectorAll('button[onclick*="stories"]').forEach(b=>b.addEventListener('click',()=>setTimeout(renderAllBusiness,0)));
    document.querySelectorAll('[data-view="reports"]').forEach(b=>b.addEventListener('click',()=>setTimeout(renderBusinessIntel,0)));
    const panel=$('territoryDataPanel');if(panel)new MutationObserver(()=>setTimeout(injectBusinessesIntoMap,0)).observe(panel,{childList:true,subtree:true});
    window.addEventListener('storage',renderAllBusiness);
    renderAllBusiness();
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',bind):bind();
})();
