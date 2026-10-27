/* v1.4.15 — Consulta de barrios urbanos y señalización sobre el plano PDF, vinculada sin migrar ni duplicar datos existentes.
   El plano PDF de 2010 es referencia gráfica; sin capa GIS, las búsquedas son textuales y no geocodificación. */
(()=>{
  'use strict';
  const q=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const tidy=value=>String(value??'').trim().replace(/\s+/g,' ');
  const norm=value=>tidy(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/^(BARRIO|URBANIZACION|URB\.?|SECTOR URBANO)\s+/,'').replace(/[^A-Z0-9]+/g,' ').trim();
  const cityOnly=/^(GIRON|GIRON SANTANDER|GIRON AREA URBANA|GIRON URBANO|CASCO URBANO|AREA URBANA|URBANO|SIN ASIGNAR|SIN BARRIO|NO APLICA|N A|SECTOR \d+|VEREDA|SANTANDER)$/;
  const valid=value=>{const n=norm(value);return n.length>=3&&!cityOnly.test(n)&&!/^VEREDA\s/.test(n)};
  const getDB=()=>typeof db!=='undefined'&&db?db:{needs:[],leaders:[]};
  const urban=record=>{const v=norm(record?.vereda);return !v||v==='GIRON'||v==='GIRON AREA URBANA'||v==='AREA URBANA'||v==='URBANA'||v==='CASCO URBANO'||v==='NO APLICA'||v==='SIN ASIGNAR'};

  // Nombres legibles en el plano básico urbano suministrado (noviembre de 2010).
  // Es una guía no exhaustiva: los nuevos barrios escritos por el usuario también se incorporan.
  const fromPlan=[
    'Industrial Chimita','Carrizal Campestre','San Antonio del Carrizal',
    'El Palenque','Bellavista','El Paraíso','El Poblado','El Carmen','Giraluz','Alicante','La Arboleda',
    'La Isla','Rincón de Girón','El Llanito','El Tejar','Centro','La Muralla','Villa del Río','La Campiña',
    'El Malecón','Altos del Tejar','Santa Cruz','Portal Campestre','Río de Oro','El Consuelo','Río Prado',
    'Arenales','Altos de Arenales','Arenales IV','Jardín de Arenales','Mirador de Arenales',
    'El Progreso','Villa de los Caballeros','Riveras del Río','La Aldea','El Gallineral','Los Guayacanes',
    'Villas de San Juan','Villas de Don Juan I','Villas de Don Juan II','Ciudadela Villamil',
    'Balcones de Galicia','El Portal 1','El Portal 2','Carrizal','Castilla la Nueva','Castilla Real 1',
    'Castilla Real 2','San Juan','El Paraíso','San Antonio','El Poblado','San Jorge','San Jorge II',
    'Sagrado Corazón','Las Mesetas','Meseta 1','Meseta 2','La Rinconada','La Cascada','La Hacienda',
    'Hacienda Alcalá','Villa Carolina I','Villa Carolina II','El Carmen','Brisas del Río',
    'Quintas del Llanito','La Constituyente','Altos del Llanito','1º de Mayo',
    'Quintas del Campestre','Arenales Campestre','Villas de Don Juan II','El Portal',
    'Villa Linda','Los Cambulos','Altos de la Campiña',
    'Balcones de Alejandría','Balcones del Portal',
    'El Gallineral','El Tejar','Las Palmas','Ciudadela Nuevo Girón'
  ];

  // Posición de los rótulos comprobada en el PDF suministrado (2010), no centroides ni polígonos GIS.
  const pdfLabelPins={"INDUSTRIAL CHIMITA":[28.225,19.217],"CARRIZAL CAMPESTRE":[15.015,30.474],"SAN ANTONIO DEL CARRIZAL":[14.703,33.151],"EL PALENQUE":[25.387,34.818],"BELLAVISTA":[16.549,45.544],"EL PARAISO":[6.039,48.554],"EL POBLADO":[30.241,47.811],"EL CARMEN":[37.982,48.596],"GIRALUZ":[20.228,50.207],"ALICANTE":[25.32,50.707],"LA ARBOLEDA":[25.522,53.096],"LA ISLA":[35.371,55.273],"RINCON DE GIRON":[40.669,52.873],"EL LLANITO":[25.393,55.759],"EL TEJAR":[23.347,64.297],"CENTRO":[24.081,60.304],"LA MURALLA":[34.205,60.926],"VILLA DEL RIO":[33.65,57.148],"LA CAMPINA":[13.077,65.464],"EL MALECON":[26.366,65.995],"ALTOS DEL TEJAR":[20.711,66.599],"SANTA CRUZ":[21.858,73.849],"PORTAL CAMPESTRE":[32.026,72.38],"RIO DE ORO":[23.734,70.967],"EL CONSUELO":[35.285,78.089],"RIO PRADO":[29.333,81.026],"ARENALES":[25.561,85.283],"ALTOS DE ARENALES":[30.36,85.894],"ARENALES IV":[27.172,88.012],"JARDIN DE ARENALES":[33.735,87.988],"MIRADOR DE ARENALES":[36.783,89.186],"EL PROGRESO":[31.259,89.422],"VILLA DE LOS CABALLEROS":[38.468,92.401],"RIVERAS DEL RIO":[36.625,94.974],"LA ALDEA":[13.688,61.276],"EL GALLINERAL":[21.946,69.176],"LOS GUAYACANES":[37.202,71.988],"VILLAS DE SAN JUAN":[31.78,83.162],"VILLAS DE DON JUAN I":[46.22,76.287],"VILLAS DE DON JUAN II":[55.423,79.064],"CIUDADELA VILLAMIL":[40.476,77.172],"BALCONES DE GALICIA":[37.174,71.113],"EL PORTAL 1":[36.745,42.794],"EL PORTAL 2":[38.354,45.759],"CARRIZAL":[33.321,56.057],"CASTILLA LA NUEVA":[22.239,53.064],"CASTILLA REAL 1":[39.037,59.294],"CASTILLA REAL 2":[38.523,63.141],"SAN JUAN":[33.433,59.342],"SAN ANTONIO":[22.088,54.842],"SAN JORGE":[42.788,68.908],"SAN JORGE II":[45.16,70.682],"SAGRADO CORAZON":[15.482,67.304],"MESETA 1":[38.125,80.832],"MESETA 2":[38.974,83.481],"LA RINCONADA":[30.323,56.637],"LA CASCADA":[28.739,57.304],"LA HACIENDA":[43.08,55.693],"HACIENDA ALCALA":[20.721,58.155],"VILLA CAROLINA I":[16.528,61.554],"VILLA CAROLINA II":[11.325,58.238],"BRISAS DEL RIO":[31.391,44.599],"QUINTAS DEL LLANITO":[14.548,51.46],"LA CONSTITUYENTE":[35.799,61.728],"ALTOS DEL LLANITO":[20.085,54.419],"1 DE MAYO":[28.805,76.332],"QUINTAS DEL CAMPESTRE":[24.061,80.11],"ARENALES CAMPESTRE":[24.091,81.905],"VILLA LINDA":[37.209,70.151],"LOS CAMBULOS":[44.144,75.669],"ALTOS DE LA CAMPINA":[15.716,66.082],"BALCONES DE ALEJANDRIA":[20.181,42.214],"BALCONES DEL PORTAL":[38.59,41.342],"LAS PALMAS":[8.217,38.682]};
  const fields={needs:'Necesidades',leaders:'Líderes',supporters:'Simpatizantes'};
  let selected='';
  let query='';
  let catalogue=[];
  const distinct=[];
  const uniqueAdd=(value)=>{if(!valid(value))return;const k=norm(value);if(!distinct.some(o=>o.key===k))distinct.push({key:k,label:tidy(value)});};
  fromPlan.forEach(uniqueAdd);
  const planKeys=new Set(distinct.map(r=>r.key));
  function neighborhoodForNeed(n){
    if(!urban(n))return {key:'',source:''};
    const own=valid(n.barrio)?n.barrio:(valid(n.territory)?n.territory:'');
    if(own)return {key:norm(own),source:'directo'};
    const person=getDB().leaders?.find(p=>p.id===n.leaderId);
    const suggested=urban(person)&&valid(person?.barrio||person?.territory)?person.barrio||person.territory:'';
    return suggested?{key:norm(suggested),source:'reportante'}:{key:'',source:''};
  }
  const neighborhoodForPerson=p=>urban(p)?norm(valid(p.barrio)?p.barrio:(valid(p.territory)?p.territory:'')):'';
  function dataFor(key){
    const d=getDB(), people=d.leaders||[];
    const needs=(d.needs||[]).filter(n=>neighborhoodForNeed(n).key===key);
    const leaders=people.filter(p=>p.contactType==='Líder'&&neighborhoodForPerson(p)===key);
    const supporters=people.filter(p=>p.contactType==='Simpatizante'&&neighborhoodForPerson(p)===key);
    const others=people.filter(p=>p.contactType!=='Simpatizante'&&p.contactType!=='Líder'&&neighborhoodForPerson(p)===key);
    return {needs,leaders,supporters,others};
  }
  function buildCatalogue(){
    const found=new Map(distinct.map(x=>[x.key,{...x}]));
    const d=getDB();
    (d.leaders||[]).filter(urban).forEach(x=>[x.barrio,x.territory].forEach(v=>{
      // If barrio is explicitly filled, do not add the person's larger territory as a second barrio.
      if(valid(x.barrio)&&v===x.territory)return;
      if(valid(v)&&!found.has(norm(v)))found.set(norm(v),{key:norm(v),label:tidy(v)});
    }));
    (d.needs||[]).filter(urban).forEach(x=>{
      const name=valid(x.barrio)?x.barrio:x.territory;
      if(valid(name)&&!found.has(norm(name)))found.set(norm(name),{key:norm(name),label:tidy(name)});
    });
    const items=[...found.values()].map(x=>({...x,...dataFor(x.key)}));
    items.sort((a,b)=>a.label.localeCompare(b.label,'es',{numeric:true}));
    catalogue=items;
  }
  const count=r=>r.needs.length+r.leaders.length+r.supporters.length;
  const human=(number,single,plural)=>`${number} ${number===1?single:plural}`;
  function totals(){
    const n=(getDB().needs||[]).filter(x=>urban(x)&&neighborhoodForNeed(x).key==='').length;
    const p=(getDB().leaders||[]).filter(x=>urban(x)&&!neighborhoodForPerson(x)).length;
    return {n,p};
  }
  function renderOptions(){
    const el=q('urbanBarrioSelect');if(!el)return;
    const keys=new Set(catalogue.map(x=>x.key));
    if(selected&&!keys.has(selected))selected='';
    el.innerHTML='<option value="">Seleccione un barrio para consultar...</option>'+catalogue.map(x=>`<option value="${esc(x.key)}">${esc(x.label)}${count(x)?` · ${count(x)} registro(s)`:''}</option>`).join('');
    el.value=selected;
    const datalist=q('urbanBarrioSuggestions');
    if(datalist)datalist.innerHTML=catalogue.map(x=>`<option value="${esc(x.label)}"></option>`).join('');
  }
  function renderList(){
    const holder=q('urbanBarrioList');if(!holder)return;
    const filtered=catalogue.filter(x=>!query||norm(x.label).includes(norm(query)));
    const withData=filtered.filter(x=>count(x)>0);
    const empty=filtered.filter(x=>!count(x));
    const show=[...withData,...empty].slice(0,70);
    holder.innerHTML=show.length?show.map(x=>`<button type="button" class="urban-barrio-chip ${x.key===selected?'selected':''} ${count(x)===0?'empty':''}" data-urban-key="${esc(x.key)}"><span>${esc(x.label)}</span><small>${count(x)?human(count(x),'registro','registros'):'Sin registros'}</small></button>`).join(''):'<p class="urban-muted">No hay barrios con ese nombre.</p>';
    holder.querySelectorAll('[data-urban-key]').forEach(btn=>btn.addEventListener('click',()=>choose(btn.dataset.urbanKey)));
    const n=q('urbanBarrioListCount');if(n)n.textContent=`${filtered.length} barrio(s)${filtered.length>70?' · mostrando 70':''}`;
  }
  function renderStats(){
    const root=q('urbanGlobalStats');if(!root)return;
    const active=catalogue.filter(x=>count(x)>0), needs=active.reduce((s,x)=>s+x.needs.length,0),leaders=active.reduce((s,x)=>s+x.leaders.length,0),supporters=active.reduce((s,x)=>s+x.supporters.length,0);
    const {n,p}=totals();
    root.innerHTML=`<div><strong>${active.length}</strong><span>Barrios con registros</span></div><div><strong>${needs}</strong><span>Necesidades relacionadas</span></div><div><strong>${leaders}</strong><span>Líderes por barrio</span></div><div><strong>${supporters}</strong><span>Simpatizantes por barrio</span></div>`;
    const pending=q('urbanMissing');if(pending)pending.textContent=n||p?`Por ubicar: ${human(n,'necesidad','necesidades')} y ${human(p,'contacto','contactos')} urbanos sin barrio identificable. Puede asignar el barrio editando el registro.`:'Todos los registros identificables tienen barrio asociado. Los rurales se mantienen fuera de esta consulta.';
  }
  const row=(title,detail,kind,id,extra='')=>`<div class="urban-entry"><div><strong>${esc(title)}</strong><small>${esc(detail)}</small>${extra?`<small class="urban-inferred">${esc(extra)}</small>`:''}</div><button type="button" class="secondary" data-urban-open="${esc(kind)}" data-id="${esc(id)}">Abrir ficha</button></div>`;
  function renderSelected(){
    const panel=q('urbanBarrioDetails');if(!panel)return;
    const r=catalogue.find(x=>x.key===selected);
    const label=q('urbanSelectedName');
    if(label)label.textContent=r?`Barrio seleccionado: ${r.label}`:'Seleccione un barrio en el buscador o en la lista';
    const newBtn=q('urbanNewNeed');if(newBtn)newBtn.disabled=!r;
    if(!r){panel.innerHTML='<div class="urban-empty"><strong>Seleccione un barrio</strong><p>Verá sus necesidades, los líderes registrados, los simpatizantes y las relaciones con sus líderes.</p></div>';return;}
    const people=getDB().leaders||[];
    const humanList=(items,type,fn)=>items.length?items.map(fn).join(''):`<p class="urban-muted">Todavía no hay ${type} asociados a este barrio.</p>`;
    const needsRows=humanList(r.needs,'necesidades',n=>row(`${n.code||'Necesidad'} · ${n.title||'Sin título'}`,`${n.status||'Sin estado'} · ${n.priority||'Sin prioridad'}${n.sectorTerritorial?' · '+n.sectorTerritorial:''}`,'needs',n.id,neighborhoodForNeed(n).source==='reportante'?'Barrio sugerido por el contacto reportante; confirme en la ficha.':''));
    const leaderRows=humanList(r.leaders,'líderes',l=>{const linked=people.filter(s=>s.contactType==='Simpatizante'&&s.parentLeaderId===l.id);return row(l.name,`${l.role||'Líder'} · ${human(linked.length,'simpatizante vinculado','simpatizantes vinculados')} en su red (pueden vivir en otros barrios)`,'leaders',l.id)});
    const supportersRows=humanList(r.supporters,'simpatizantes',s=>{const parent=people.find(l=>l.id===s.parentLeaderId&&l.contactType==='Líder');return row(s.name,`Líder relacionado: ${parent?.name||'Pendiente de asignar'}`,'supporters',s.id)});
    const otherRows=r.others.length?`<details class="urban-other"><summary>Otros contactos / por clasificar (${r.others.length})</summary>${r.others.map(s=>row(s.name,s.contactType||s.role||'Por clasificar','supporters',s.id)).join('')}</details>`:'';
    panel.innerHTML=`<div class="urban-detail-head"><h3>📍 ${esc(r.label)}</h3><span>${planKeys.has(r.key)?'Nombre visible en el plano de 2010':'Barrio o sector registrado en la Matriz'}</span></div>
      <div class="urban-detail-kpis"><div><strong>${r.needs.length}</strong><small>Necesidades</small></div><div><strong>${r.leaders.length}</strong><small>Líderes</small></div><div><strong>${r.supporters.length}</strong><small>Simpatizantes</small></div></div>
      <details open class="urban-detail-section"><summary>◆ Necesidades registradas (${r.needs.length})</summary>${needsRows}</details>
      <details open class="urban-detail-section"><summary>♟ Líderes del barrio (${r.leaders.length})</summary>${leaderRows}</details>
      <details open class="urban-detail-section"><summary>👥 Simpatizantes del barrio (${r.supporters.length})</summary>${supportersRows}</details>${otherRows}
      <div class="urban-source-notice">La relación se obtiene del barrio registrado en cada ficha. Una necesidad sin barrio puede sugerirse por el contacto que la reportó. El plano de 2010 es una referencia visual y no determina automáticamente límites o ubicaciones geográficas exactas.</div>`;
    panel.querySelectorAll('[data-urban-open]').forEach(btn=>btn.addEventListener('click',()=>openRecord(btn.dataset.urbanOpen,btn.dataset.id)));
  }

  // El usuario puede corregir o asignar puntos sobre su copia visual del plano.
  // Estos marcadores se almacenan separadamente de las fichas: NO alteran la base territorial.
  const PIN_STORAGE_KEY='matriz_giron_urban_map_pins_v1415';
  let manualPins={};
  let placingPin=false;
  let popupVisible=true;
  let popupTab='needs';
  function loadPins(){
    try{const value=JSON.parse(localStorage.getItem(PIN_STORAGE_KEY)||'{}');
      manualPins=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    }catch(_){manualPins={}}
  }
  function savePins(){try{localStorage.setItem(PIN_STORAGE_KEY,JSON.stringify(manualPins))}catch(_){alert('No se pudo guardar la ubicación en este navegador.')}}
  function currentPin(){
    const candidate=manualPins[selected]||pdfLabelPins[selected];
    if(!Array.isArray(candidate)||candidate.length!==2||candidate.some(x=>!Number.isFinite(Number(x))))return null;
    const x=Number(candidate[0]),y=Number(candidate[1]);
    return x>=0&&x<=100&&y>=0&&y<=100?{x,y,manual:!!manualPins[selected]}:null;
  }
  function popupRows(items,kind){
    if(!items.length)return '<p class="urban-map-popup-empty">Sin registros para esta categoría.</p>';
    return items.slice(0,35).map(item=>{
      const parent=(getDB().leaders||[]).find(p=>p.id===item.parentLeaderId);
      const linked=kind==='leaders'?(getDB().leaders||[]).filter(p=>p.contactType==='Simpatizante'&&p.parentLeaderId===item.id).length:0;
      const title=kind==='needs'?`${item.code||'Necesidad'} · ${item.title||'Sin título'}`:item.name||'Sin nombre';
      const subtitle=kind==='needs'?`${item.status||'Sin estado'} · ${item.priority||'Sin prioridad'}`:kind==='leaders'?`${linked} simpatizante(s) vinculado(s) en su red`:`Líder: ${parent?.name||'Sin asignar'}`;
      return `<div class="urban-map-popup-row"><div><b>${esc(title)}</b><small>${esc(subtitle)}</small></div><button type="button" data-urban-open="${esc(kind)}" data-id="${esc(item.id)}" aria-label="Abrir ficha de ${esc(title)}">Ver</button></div>`;
    }).join('')+(items.length>35?`<small>Se muestran 35 de ${items.length}. Abra la ficha completa para consultar los demás.</small>`:'');
  }
  function drawPopup(popup,r){
    if(!popup)return;
    if(!r||!popupVisible||placingPin){popup.hidden=true;popup.innerHTML='';return;}
    const tabs=[['needs','Necesidades',r.needs.length],['leaders','Líderes',r.leaders.length],['supporters','Simpatizantes',r.supporters.length]];
    popup.innerHTML=`<div class="urban-map-popup-head"><strong>📍 ${esc(r.label)}</strong><button type="button" data-urban-popup-close aria-label="Cerrar ficha">×</button></div>
       <div class="urban-map-popup-tabs" role="tablist" aria-label="Información del barrio">${tabs.map(([k,name,num])=>`<button type="button" data-urban-popup-tab="${k}" class="${k===popupTab?'active':''}" aria-selected="${k===popupTab}">${esc(name)} <b>${num}</b></button>`).join('')}</div>
       <div class="urban-map-popup-content">${popupRows(r[popupTab]||[],popupTab)}</div>
       <div class="urban-map-popup-footer"><button type="button" data-urban-full>Ver información completa del barrio</button></div>`;
    popup.hidden=false;
    popup.querySelector('[data-urban-popup-close]')?.addEventListener('click',()=>{popupVisible=false;renderPinMap();});
    popup.querySelectorAll('[data-urban-popup-tab]').forEach(btn=>btn.addEventListener('click',()=>{popupTab=btn.dataset.urbanPopupTab;renderPinMap();}));
    popup.querySelectorAll('[data-urban-open]').forEach(btn=>btn.addEventListener('click',()=>openRecord(btn.dataset.urbanOpen,btn.dataset.id)));
    popup.querySelector('[data-urban-full]')?.addEventListener('click',()=>q('urbanBarrioDetails')?.scrollIntoView({behavior:'smooth',block:'start'}));
  }
  function positionPopup(sheet,popup,pos){
    if(!sheet||!popup||popup.hidden||!pos)return;
    const width=sheet.clientWidth,height=sheet.clientHeight;
    const pw=Math.min(345,Math.max(225,width-16));
    popup.style.width=pw+'px';
    const actualWidth=popup.offsetWidth||pw,actualHeight=popup.offsetHeight||285;
    // Mantener la ficha dentro de la imagen, junto a su marcador.
    const left=Math.min(Math.max(6,width*pos.x/100-actualWidth/2),Math.max(6,width-actualWidth-6));
    const markerY=height*pos.y/100;
    const top=markerY>actualHeight+35?markerY-actualHeight-24:markerY+24;
    popup.style.left=left+'px';popup.style.top=Math.min(Math.max(6,top),Math.max(6,height-actualHeight-6))+'px';
  }
  function drawOnSheet(sheetId,pinId,popupId,pos,r){
    const sheet=q(sheetId),pin=q(pinId),popup=q(popupId);
    if(!sheet||!pin||!popup)return;
    if(!r||!pos){pin.hidden=true;popup.hidden=true;return;}
    pin.hidden=false;pin.style.left=pos.x+'%';pin.style.top=pos.y+'%';
    pin.title=`${r.label} · ${pos.manual?'Ubicación señalada manualmente':'Rótulo en el plano de 2010'}`;
    pin.setAttribute('aria-label','Abrir información de '+r.label);
    drawPopup(popup,r);
    if(!popup.hidden)positionPopup(sheet,popup,pos);
  }
  function renderPinMap({focus=false}={}){
    const r=catalogue.find(x=>x.key===selected),pos=currentPin();
    drawOnSheet('urbanMapSheet','urbanMapPin','urbanMapPopover',pos,r);
    drawOnSheet('urbanZoomSheet','urbanZoomPin','urbanZoomPopover',pos,r);
    const status=q('urbanMapPinStatus');const place=q('urbanMapPlacePin');const reset=q('urbanMapResetPin');
    if(place){place.disabled=!r;place.textContent=placingPin?'Cancelar ubicación':(pos?'✏️ Corregir señal en el plano':'📍 Ubicar este barrio en el plano');}
    if(reset)reset.hidden=!(r&&manualPins[selected]);
    if(status){status.textContent=!r?'Seleccione un barrio para mostrar su señal en el plano.':placingPin?`Pulse sobre el plano donde corresponde ${r.label}. No se cambia ninguna ficha.`:pos?`${r.label}: ${pos.manual?'señal colocada manualmente':'rótulo identificado en el plano de 2010'}. Pulse la señal para consultar sus datos.`:`${r.label} no tiene una posición identificable en este plano. Pulse «Ubicar este barrio» y señale el punto manualmente.`;}
    for(const id of ['urbanMapSheet','urbanZoomSheet'])q(id)?.classList.toggle('urban-pin-placing',placingPin);
    if(focus){
      const stage=q('urbanMapStage'),sheet=q('urbanMapSheet');
      stage?.scrollIntoView({behavior:'smooth',block:'center'});
      if(stage&&sheet&&pos){
        const desired=sheet.clientHeight*pos.y/100-stage.clientHeight*.51;
        stage.scrollTo({top:Math.max(0,desired),behavior:'smooth'});
      }
    }
  }
  function onMapClick(e,sheetId){
    if(!placingPin||!selected)return;
    if(e.target.closest('.urban-map-popup,.urban-map-marker'))return;
    const sheet=q(sheetId),img=sheet?.querySelector('img');if(!img)return;
    const rect=img.getBoundingClientRect();
    if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)return;
    const x=Math.max(0,Math.min(100,(e.clientX-rect.left)/rect.width*100));
    const y=Math.max(0,Math.min(100,(e.clientY-rect.top)/rect.height*100));
    manualPins[selected]=[Number(x.toFixed(3)),Number(y.toFixed(3))];
    savePins();placingPin=false;popupVisible=true;renderPinMap();
  }
  function initPinMap(){
    loadPins();
    ['urbanMapPin','urbanZoomPin'].forEach(id=>q(id)?.addEventListener('click',e=>{e.stopPropagation();popupVisible=!popupVisible;renderPinMap();}));
    ['urbanMapSheet','urbanZoomSheet'].forEach(id=>q(id)?.addEventListener('click',e=>onMapClick(e,id)));
    q('urbanMapPlacePin')?.addEventListener('click',()=>{if(!selected)return;placingPin=!placingPin;popupVisible=false;renderPinMap();});
    q('urbanMapResetPin')?.addEventListener('click',()=>{delete manualPins[selected];savePins();placingPin=false;popupVisible=true;renderPinMap();});
    q('urbanMapZoomBtn')?.addEventListener('click',()=>{setTimeout(()=>renderPinMap(),0)});
    const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(()=>renderPinMap()):null;
    if(observer){['urbanMapSheet','urbanZoomSheet'].forEach(id=>{const el=q(id);if(el)observer.observe(el);});}
    renderPinMap();
  }

  function choose(key){selected=key;placingPin=false;popupVisible=true;popupTab='needs';renderOptions();renderList();renderSelected();renderPinMap({focus:!!key});}
  function refresh(){buildCatalogue();renderStats();renderOptions();renderList();renderSelected();renderPinMap();}
  function openRecord(kind,id){
    if(kind==='needs'){
      window.showView?.('needs');window.editNeed?.(id);
    }else{
      window.showView?.('leaders');window.editLeader?.(id);
    }
  }
  function newNeed(){
    const r=catalogue.find(x=>x.key===selected);if(!r)return;
    const form=q('needForm');if(!form)return;
    form.reset();
    if(form.elements.id)form.elements.id.value='';
    if(form.elements.territory)form.elements.territory.value=r.label;
    if(form.elements.barrio)form.elements.barrio.value=r.label;
    const vereda=form.elements.vereda;
    if(vereda){const urbanOption=[...vereda.options].find(o=>norm(o.value)==='GIRON AREA URBANA');if(urbanOption)vereda.value=urbanOption.value;}
    window.openModal?.('needModal');
  }
  function syncNeedBarrio(){
    const form=q('needForm');if(!form||!form.elements.barrio)return;
    const p=form.elements.territory;
    form.elements.barrio.addEventListener('change',()=>{
      if(!tidy(p.value)&&tidy(form.elements.barrio.value))p.value=tidy(form.elements.barrio.value);
    });
  }
  function init(){
    if(!q('urbanBarrioSelect'))return;
    q('urbanBarrioSelect').addEventListener('change',e=>choose(e.target.value));
    q('urbanBarrioSearch').addEventListener('input',e=>{query=e.target.value;renderList();});
    q('urbanNewNeed')?.addEventListener('click',newNeed);
    document.querySelector('[data-map-tab="urbano"]')?.addEventListener('click',refresh);
    window.addEventListener('matriz:contacts-updated',refresh);
    window.addEventListener('storage',refresh);
    syncNeedBarrio();initPinMap();refresh();
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
  // Pure diagnostic API used by the local smoke tests. Does not modify the data.
  window.MatrizUrbanMap={norm,neighborhoodForNeed,neighborhoodForPerson,dataFor,refresh,choose,pdfLabelPins,getManualPins:()=>({...manualPins})};
})();
