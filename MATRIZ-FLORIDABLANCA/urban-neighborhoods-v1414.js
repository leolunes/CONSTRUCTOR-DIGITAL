/* Consulta de barrios de Floridablanca con orientación visual sobre el plano de 2016.
   Los puntos de referencia son aproximados; los marcadores manuales los reemplazan. */
(()=>{
  'use strict';
  const q=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const tidy=value=>String(value??'').trim().replace(/\s+/g,' ');
  const norm=value=>tidy(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/^(BARRIO|URBANIZACION|URB\.?|SECTOR URBANO)\s+/,'').replace(/[^A-Z0-9]+/g,' ').trim();
  const cityOnly=/^(FLORIDABLANCA|FLORIDABLANCA SANTANDER|FLORIDABLANCA AREA URBANA|FLORIDABLANCA URBANO|CASCO URBANO|AREA URBANA|URBANO|SIN ASIGNAR|SIN BARRIO|NO APLICA|N A|SECTOR \d+|VEREDA|SANTANDER)$/;
  const valid=value=>{const n=norm(value);return n.length>=3&&!cityOnly.test(n)&&!/^VEREDA\s/.test(n)};
  const getDB=()=>typeof db!=='undefined'&&db?db:{needs:[],leaders:[]};
  const urban=record=>{const v=norm(record?.vereda);return !v||v==='FLORIDABLANCA'||v==='FLORIDABLANCA AREA URBANA'||v==='AREA URBANA'||v==='URBANA'||v==='CASCO URBANO'||v==='NO APLICA'||v==='SIN ASIGNAR'};

  // Catálogo ampliado con los barrios, conjuntos, asentamientos y sectores rurales
  // presentes en las tablas territoriales municipales de 2016.
  const fromPlan=window.FLORIDABLANCA_TERRITORIO.BARRIOS;
  const officialEntries=window.FLORIDABLANCA_TERRITORIO.CATALOGO_AMPLIADO||[];
  const metaByKey=new Map(officialEntries.map(r=>[norm(r.nombre),r]));
  const metaFor=key=>metaByKey.get(key)||{tipo:'Referencia del plano',comuna:null,barrio:'',zona:'por-verificar'};
  const referencePoints=window.FLORIDABLANCA_UBICACIONES_REFERENCIA||{barrios:{},comunas:{}};
  const relatedKeys=key=>{
    const meta=metaFor(key);
    if(meta.tipo!=='Barrio'&&meta.tipo!=='Centro poblado especial')return new Set([key]);
    return new Set([key,...officialEntries.filter(x=>norm(x.barrio)===key).map(x=>norm(x.nombre))]);
  };

  // Orientaciones dibujadas sobre la imagen, nunca coordenadas catastrales.
  const pdfLabelPins=referencePoints.barrios||{};
  const fields={needs:'Necesidades',leaders:'Líderes',supporters:'Simpatizantes'};
  let selected='';
  let query='';
  let comunaFilter='';
  let displayLimit=70;
  let catalogue=[];
  const distinct=[];
  const uniqueAdd=(value)=>{if(!valid(value))return;const k=norm(value);if(!distinct.some(o=>o.key===k))distinct.push({key:k,label:tidy(value)});};
  fromPlan.forEach(uniqueAdd);
  const planKeys=new Set(distinct.map(r=>r.key));
  function neighborhoodForNeed(n){
    const own=valid(n.barrio)?n.barrio:(valid(n.territory)?n.territory:'');
    if(own&&(urban(n)||metaFor(norm(own)).zona==='rural'))return {key:norm(own),source:'directo'};
    if(!urban(n))return {key:'',source:''};
    const person=getDB().leaders?.find(p=>p.id===n.leaderId);
    const suggested=urban(person)&&valid(person?.barrio||person?.territory)?person.barrio||person.territory:'';
    return suggested?{key:norm(suggested),source:'reportante'}:{key:'',source:''};
  }
  const neighborhoodForPerson=p=>{
    const own=valid(p.barrio)?p.barrio:(valid(p.territory)?p.territory:'');
    return urban(p)||metaFor(norm(own)).zona==='rural'?norm(own):'';
  };
  function dataFor(key){
    const d=getDB(), people=d.leaders||[];
    const related=relatedKeys(key);
    const needs=(d.needs||[]).filter(n=>related.has(neighborhoodForNeed(n).key));
    const leaders=people.filter(p=>p.contactType==='Líder'&&related.has(neighborhoodForPerson(p)));
    const supporters=people.filter(p=>p.contactType==='Simpatizante'&&related.has(neighborhoodForPerson(p)));
    const others=people.filter(p=>p.contactType!=='Simpatizante'&&p.contactType!=='Líder'&&related.has(neighborhoodForPerson(p)));
    const needIds=new Set(needs.map(n=>n.id));
    const projects=(d.projects||[]).filter(p=>{
      const own=norm(valid(p.barrio)?p.barrio:p.territory);
      return (urban(p)||metaFor(own).zona==='rural')&&(related.has(own)||needIds.has(p.needId));
    });
    const projectIds=new Set(projects.map(p=>p.id));
    const actions=(d.actions||[]).filter(a=>needIds.has(a.needId)||projectIds.has(a.projectId)||related.has(norm(a.barrio||a.territory)));
    return {needs,leaders,supporters,others,projects,actions};
  }
  function buildCatalogue(){
    const found=new Map(distinct.map(x=>[x.key,{...x}]));
    const d=getDB();
    (d.leaders||[]).filter(x=>urban(x)||metaFor(neighborhoodForPerson(x)).zona==='rural').forEach(x=>[x.barrio,x.territory].forEach(v=>{
      // If barrio is explicitly filled, do not add the person's larger territory as a second barrio.
      if(valid(x.barrio)&&v===x.territory)return;
      if(valid(v)&&!found.has(norm(v)))found.set(norm(v),{key:norm(v),label:tidy(v)});
    }));
    (d.needs||[]).filter(x=>urban(x)||metaFor(neighborhoodForNeed(x).key).zona==='rural').forEach(x=>{
      const name=valid(x.barrio)?x.barrio:x.territory;
      if(valid(name)&&!found.has(norm(name)))found.set(norm(name),{key:norm(name),label:tidy(name)});
    });
    (d.projects||[]).filter(x=>urban(x)||metaFor(norm(x.barrio||x.territory)).zona==='rural').forEach(x=>{
      const name=valid(x.barrio)?x.barrio:x.territory;
      if(valid(name)&&!found.has(norm(name)))found.set(norm(name),{key:norm(name),label:tidy(name)});
    });
    const items=[...found.values()].map(x=>({...x,meta:metaFor(x.key),...dataFor(x.key)}));
    items.sort((a,b)=>a.label.localeCompare(b.label,'es',{numeric:true}));
    catalogue=items;
  }
  const count=r=>r.needs.length+r.leaders.length+r.supporters.length+r.others.length+r.projects.length+r.actions.length;
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
    el.innerHTML='<option value="">Seleccione un lugar para consultar...</option>'+catalogue.map(x=>`<option value="${esc(x.key)}">${esc(x.label)}${x.meta.comuna?` · Comuna ${x.meta.comuna}`:x.meta.zona==='rural'?' · Rural':''}${count(x)?` · ${count(x)} registro(s)`:''}</option>`).join('');
    el.value=selected;
    const datalist=q('urbanBarrioSuggestions');
    if(datalist)datalist.innerHTML=catalogue.map(x=>`<option value="${esc(x.label)}"></option>`).join('');
  }
  function renderList(){
    const holder=q('urbanBarrioList');if(!holder)return;
    const filtered=catalogue.filter(x=>(!query||norm(x.label).includes(norm(query)))&&(!comunaFilter||(comunaFilter==='rural'?x.meta.zona==='rural':comunaFilter==='sin-clasificar'?x.meta.zona==='por-verificar':String(x.meta.comuna)===comunaFilter)));
    const withData=filtered.filter(x=>count(x)>0);
    const empty=filtered.filter(x=>!count(x));
    const show=[...withData,...empty].slice(0,displayLimit);
    holder.innerHTML=show.length?show.map(x=>`<button type="button" class="urban-barrio-chip ${x.key===selected?'selected':''} ${count(x)===0?'empty':''}" data-urban-key="${esc(x.key)}"><span>${esc(x.label)}</span><small>${esc(x.meta.comuna?'Comuna '+x.meta.comuna:x.meta.zona==='rural'?'Sector rural':'Por clasificar')} · ${esc(x.meta.tipo)} · ${count(x)?human(count(x),'registro','registros'):'Sin registros'}</small></button>`).join(''):'<p class="urban-muted">No hay lugares con ese nombre o filtro.</p>';
    holder.querySelectorAll('[data-urban-key]').forEach(btn=>btn.addEventListener('click',()=>choose(btn.dataset.urbanKey)));
    const n=q('urbanBarrioListCount');if(n)n.textContent=`${filtered.length} lugares · mostrando ${show.length}`;
    const more=q('urbanBarrioMore');if(more)more.hidden=show.length>=filtered.length;
  }
  function renderStats(){
    const root=q('urbanGlobalStats');if(!root)return;
    const active=catalogue.filter(x=>count(x)>0),unique=field=>new Set(active.flatMap(x=>x[field].map(v=>v.id))).size;
    const needs=unique('needs'),leaders=unique('leaders'),supporters=unique('supporters');
    const {n,p}=totals();
    root.innerHTML=`<div><strong>${catalogue.length}</strong><span>Lugares del catálogo</span></div><div><strong>${active.length}</strong><span>Lugares con registros</span></div><div><strong>${needs}</strong><span>Necesidades relacionadas</span></div><div><strong>${leaders}</strong><span>Líderes por sector</span></div><div><strong>${supporters}</strong><span>Simpatizantes por sector</span></div>`;
    const catalogLabel=q('urbanCatalogVersion');if(catalogLabel)catalogLabel.textContent=`${catalogue.length} lugares · 8 comunas y sector rural`;
    const pending=q('urbanMissing');if(pending)pending.textContent=n||p?`Por ubicar: ${human(n,'necesidad','necesidades')} y ${human(p,'contacto','contactos')} urbanos sin barrio identificable. Puede asignar el barrio editando el registro.`:'La consulta incluye barrios, urbanizaciones, asentamientos y sectores de Ruitoque Condominio. Las demás veredas se consultan en el mapa rural.';
  }
  const row=(title,detail,kind,id,extra='')=>`<div class="urban-entry"><div><strong>${esc(title)}</strong><small>${esc(detail)}</small>${extra?`<small class="urban-inferred">${esc(extra)}</small>`:''}</div><button type="button" class="secondary" data-urban-open="${esc(kind)}" data-id="${esc(id)}">Abrir ficha</button></div>`;
  function renderSelected(){
    const panel=q('urbanBarrioDetails');if(!panel)return;
    const r=catalogue.find(x=>x.key===selected);
    const label=q('urbanSelectedName');
    if(label)label.textContent=r?`${r.meta.tipo}: ${r.label}`:'Seleccione un lugar en el buscador o en la lista';
    const newBtn=q('urbanNewNeed');if(newBtn)newBtn.disabled=!r;
    if(!r){panel.innerHTML='<div class="urban-empty"><strong>Toque un barrio sobre el mapa</strong><p>Consulte necesidades, líderes, simpatizantes, compromisos futuros y registros anteriores.</p></div>';return;}
    const people=getDB().leaders||[];
    const humanList=(items,type,fn)=>items.length?items.map(fn).join(''):`<p class="urban-muted">Todavía no hay ${type} registrad${type==='necesidades'||type==='gestiones'?'as':'os'} en este lugar.</p>`;
    const needsRows=humanList(r.needs,'necesidades',n=>row(`${n.code||'Necesidad'} · ${n.title||'Sin título'}`,`${n.status||'Sin estado'} · ${n.priority||'Sin prioridad'}${n.sectorTerritorial?' · '+n.sectorTerritorial:''}`,'needs',n.id,neighborhoodForNeed(n).source==='reportante'?'Barrio sugerido por el contacto reportante; confirme en la ficha.':''));
    const leaderRows=humanList(r.leaders,'líderes',l=>{const linked=people.filter(s=>s.contactType==='Simpatizante'&&s.parentLeaderId===l.id);return row(l.name,`${l.role||'Líder'} · ${human(linked.length,'simpatizante vinculado','simpatizantes vinculados')} en su red (pueden vivir en otros barrios)`,'leaders',l.id)});
    const supportersRows=humanList(r.supporters,'simpatizantes',s=>{const parent=people.find(l=>l.id===s.parentLeaderId&&l.contactType==='Líder');return row(s.name,`Líder relacionado: ${parent?.name||'Pendiente de asignar'}`,'supporters',s.id)});
    const projectRows=humanList(r.projects,'registros',p=>row(p.name||'Registro',`${p.recordType==='futureCommitment'?'Condicionado a resultar elegido':'Proyecto anterior'} · ${p.status||'Sin estado'}`,'projects',p.id));
    const actionRows=humanList(r.actions,'gestiones',a=>row(a.type||'Gestión',`${a.date||'Sin fecha'} · ${a.description||'Sin descripción'}`,'actions',a.id));
    const otherRows=r.others.length?`<details class="urban-other"><summary>Otros contactos / por clasificar (${r.others.length})</summary>${r.others.map(s=>row(s.name,s.contactType||s.role||'Por clasificar','supporters',s.id)).join('')}</details>`:'';
    panel.innerHTML=`<div class="urban-detail-head"><h3>📍 ${esc(r.label)}</h3><span>${esc(r.meta.tipo)} · ${esc(r.meta.comuna?'Comuna '+r.meta.comuna:r.meta.zona==='rural'?'Zona rural · Ruitoque':planKeys.has(r.key)?'Referencia territorial':'Sector nuevo registrado')}${r.meta.barrio&&norm(r.meta.barrio)!==r.key?` · Barrio ${esc(r.meta.barrio)}`:''}</span></div>
      <div class="urban-detail-kpis"><div><strong>${r.needs.length}</strong><small>Necesidades</small></div><div><strong>${r.leaders.length}</strong><small>Líderes</small></div><div><strong>${r.supporters.length}</strong><small>Simpatizantes</small></div><div><strong>${r.projects.length}</strong><small>Compromisos / archivo</small></div><div><strong>${r.actions.length}</strong><small>Gestiones</small></div></div>
      <details open class="urban-detail-section"><summary>◆ Necesidades registradas (${r.needs.length})</summary>${needsRows}</details>
      <details open class="urban-detail-section"><summary>♟ Líderes del barrio (${r.leaders.length})</summary>${leaderRows}</details>
      <details open class="urban-detail-section"><summary>👥 Simpatizantes del barrio (${r.supporters.length})</summary>${supportersRows}</details>
      <details open class="urban-detail-section"><summary>📁 Compromisos futuros y proyectos previos (${r.projects.length})</summary>${projectRows}</details>
      <details open class="urban-detail-section"><summary>✓ Gestiones y seguimiento (${r.actions.length})</summary>${actionRows}</details>${otherRows}
      <div class="urban-source-notice">La información corresponde al lugar consignado en cada ficha. Al elegir un barrio principal también se incluyen registros de sus conjuntos y urbanizaciones vinculados en el catálogo municipal; al elegir uno de esos conjuntos solo se consulta su propia información. Una necesidad sin barrio puede sugerirse por el contacto que la reportó. Los puntos del plano de 2016 son orientativos, no coordenadas ni límites geográficos exactos.</div>`;
    panel.querySelectorAll('[data-urban-open]').forEach(btn=>btn.addEventListener('click',()=>openRecord(btn.dataset.urbanOpen,btn.dataset.id)));
  }

  // El usuario puede corregir o asignar puntos sobre su copia visual del plano.
  // Estos marcadores se almacenan separadamente de las fichas: NO alteran la base territorial.
  const PIN_STORAGE_KEY='matriz_floridablanca_urban_map_pins_v1415';
  let manualPins={};
  let placingPin=false;
  // El plano se abre limpio: solo el lugar seleccionado recibe marcador.
  // Esta preferencia visual nunca borra los marcadores guardados.
  let showOtherPins=false;
  let popupVisible=true;
  let popupTab='needs';
  let touchSheet='',touchPoint=null;
  function loadPins(){
    try{const value=JSON.parse(localStorage.getItem(PIN_STORAGE_KEY)||'{}');
      manualPins=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    }catch(_){manualPins={}}
  }
  function savePins(){try{localStorage.setItem(PIN_STORAGE_KEY,JSON.stringify(manualPins))}catch(_){alert('No se pudo guardar la ubicación en este navegador.')}}
  function validPin(candidate){
    if(!Array.isArray(candidate)||candidate.length!==2)return null;
    const x=Number(candidate[0]),y=Number(candidate[1]);
    return Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<=100&&y>=0&&y<=100?{x,y}:null;
  }
  function pinFor(key){
    if(!key)return null;
    const manuallyPlaced=validPin(manualPins[key]);
    if(manuallyPlaced)return {...manuallyPlaced,manual:true,level:'Ubicación ajustada por usted'};
    const meta=metaFor(key),parent=norm(meta.barrio);
    const direct=validPin(pdfLabelPins[key]);
    if(direct)return {...direct,manual:false,level:'Referencia visual del barrio'};
    const inherited=validPin(pdfLabelPins[parent]);
    if(inherited)return {...inherited,manual:false,level:'Zona de referencia: '+meta.barrio};
    const aliasKey=referencePoints.aliases?.[key];
    const aliasPin=validPin(pdfLabelPins[aliasKey]);
    if(aliasPin)return {...aliasPin,manual:false,level:'Zona orientativa por denominación relacionada'};
    const comuna=validPin(referencePoints.comunas?.[meta.comuna]);
    if(comuna)return {...comuna,manual:false,level:'Centro orientativo de la comuna '+meta.comuna};
    const pending=validPin(referencePoints.pendientes);
    if(pending)return {...pending,manual:false,unknown:true,level:'Sector pendiente de ubicar: marcador de aviso FUERA de la cartografía'};
    return null;
  }
  function currentPin(){return pinFor(selected)}
  // La imagen original puede fallar por caché del navegador o por una copia
  // incompleta de assets. Una segunda copia del MISMO plano evita perder la
  // referencia visual y la selección no toca la base de datos.
  function initMapImages(){
    const mainImage=q('urbanMapImage');
    const errorPanel=q('urbanMapImageError');
    const normal='assets/mapa-floridablanca-barrios.png';
    const fallback='assets/mapa-floridablanca-barrios-respaldo.jpg';
    function watch(image,isMain){
      if(!image)return;
      const failed=()=>{
        if(image.dataset.mapFallback!=='yes'){
          image.dataset.mapFallback='yes';
          image.src=fallback+'?v=1.0.11';
          return;
        }
        if(isMain&&errorPanel)errorPanel.hidden=false;
      };
      image.addEventListener('error',failed);
      image.addEventListener('load',()=>{
        if(isMain&&errorPanel)errorPanel.hidden=true;
        renderPinMap();
      });
      if(image.complete&&!image.naturalWidth)failed();
    }
    watch(mainImage,true);
    watch(q('urbanZoomImage'),false);
    q('urbanMapReloadImage')?.addEventListener('click',()=>{
      if(!mainImage)return;
      mainImage.dataset.mapFallback='no';
      if(errorPanel)errorPanel.hidden=true;
      mainImage.src=normal+'?reintento='+Date.now();
    });
  }
  function renderAllPins(layerId){
    const host=q(layerId);if(!host)return;
    if(!showOtherPins){host.innerHTML='';return;}
    // Los otros marcadores son únicamente los ubicados manualmente: evita
    // que los cientos de conjuntos se acumulen en el centro de su barrio.
    const located=catalogue.map(r=>({...r,p:validPin(manualPins[r.key])})).filter(r=>r.p&&r.key!==selected);
    host.innerHTML=located.map(r=>`<button type="button" class="urban-map-pinpoint ${count(r)?'has-data':''}" style="left:${r.p.x}%;top:${r.p.y}%" data-urban-pin="${esc(r.key)}" title="${esc(r.label)} · ${count(r)} registro(s)" aria-label="Consultar barrio ${esc(r.label)}: ${count(r)} registros"><span>📍</span><b>${esc(r.label)}</b>${count(r)?`<small>${count(r)}</small>`:''}</button>`).join('');
    host.querySelectorAll('[data-urban-pin]').forEach(button=>button.addEventListener('click',event=>{
      event.stopPropagation();closeTouchPicker();choose(button.dataset.urbanPin);popupVisible=true;renderPinMap();
    }));
  }
  function renderUnlocated(){
    const host=q('urbanMapPending');if(!host)return;
    if(!showOtherPins){host.innerHTML='<span>🧹 Mapa limpio: solo se señala el lugar que usted seleccione. Los demás marcadores guardados permanecen disponibles y no se han borrado.</span>';return;}
    const waiting=catalogue.filter(r=>count(r)>0&&!validPin(manualPins[r.key]));
    if(!waiting.length){host.innerHTML='<span>🏘️ Todos los lugares con registros ya tienen su ubicación manual guardada en este navegador.</span>';return;}
    host.innerHTML=`<strong>📌 Lugares con registros que puede ubicar con mayor precisión (${waiting.length})</strong><div>${waiting.slice(0,14).map(r=>`<button type="button" data-urban-unlocated="${esc(r.key)}">${esc(r.label)} <small>${count(r)}</small></button>`).join('')}</div>${waiting.length>14?'<small>También puede elegirlos desde el directorio territorial.</small>':''}`;
    host.querySelectorAll('[data-urban-unlocated]').forEach(button=>button.addEventListener('click',()=>choose(button.dataset.urbanUnlocated)));
  }
  const touchIds={urbanMapSheet:['urbanTapPicker','urbanTapSearch','urbanTapResults'],urbanZoomSheet:['urbanZoomTapPicker','urbanZoomTapSearch','urbanZoomTapResults']};
  function closeTouchPicker(){
    touchSheet='';touchPoint=null;
    Object.values(touchIds).forEach(([id])=>{const panel=q(id);if(panel)panel.hidden=true;});
  }
  function renderTouchResults(){
    if(!touchSheet)return;
    const [,searchId,resultsId]=touchIds[touchSheet],search=norm(q(searchId)?.value||'');
    const list=catalogue.filter(r=>!search||r.key.includes(search));
    const box=q(resultsId);if(!box)return;
    const visible=list.slice(0,45);
    box.innerHTML=visible.map(r=>`<button type="button" data-touch-key="${esc(r.key)}"><span>${esc(r.label)}</span><small>${count(r)?`${count(r)} registros`:'Sin registros'}${validPin(manualPins[r.key])?' · ubicado':''}</small></button>`).join('')||'<p>No encontramos ese barrio. Puede escribirlo en el formulario de la ficha y luego ubicarlo.</p>';
    box.querySelectorAll('[data-touch-key]').forEach(button=>button.addEventListener('click',event=>{
      event.stopPropagation();
      const key=button.dataset.touchKey,point=touchPoint;
      if(!point)return;
      manualPins[key]=[Number(point.x.toFixed(3)),Number(point.y.toFixed(3))];
      savePins();closeTouchPicker();choose(key);popupVisible=true;renderPinMap();
    }));
  }
  function openTouchPicker(sheetId,point){
    closeTouchPicker();placingPin=false;popupVisible=false;
    touchSheet=sheetId;touchPoint=point;
    renderPinMap();
    const [pickerId,searchId]=touchIds[sheetId],sheet=q(sheetId),picker=q(pickerId),input=q(searchId);
    if(!sheet||!picker||!input)return;
    input.value='';picker.hidden=false;
    const width=Math.min(350,Math.max(160,sheet.clientWidth-12));
    picker.style.width=width+'px';
    picker.style.left=Math.min(Math.max(6,sheet.clientWidth*point.x/100-width/2),Math.max(6,sheet.clientWidth-width-6))+'px';
    picker.style.top=Math.min(Math.max(6,sheet.clientHeight*point.y/100+16),Math.max(6,sheet.clientHeight-320))+'px';
    renderTouchResults();
    input.focus({preventScroll:true});
  }
  function popupRows(items,kind){
    if(!items.length)return '<p class="urban-map-popup-empty">Sin registros para esta categoría.</p>';
    return items.slice(0,35).map(item=>{
      const parent=(getDB().leaders||[]).find(p=>p.id===item.parentLeaderId);
      const linked=kind==='leaders'?(getDB().leaders||[]).filter(p=>p.contactType==='Simpatizante'&&p.parentLeaderId===item.id).length:0;
      const title=kind==='needs'?`${item.code||'Necesidad'} · ${item.title||'Sin título'}`:kind==='projects'?item.name||'Registro':kind==='actions'?item.type||'Gestión':item.name||'Sin nombre';
      const subtitle=kind==='needs'?`${item.status||'Sin estado'} · ${item.priority||'Sin prioridad'}`:kind==='projects'?`${item.recordType==='futureCommitment'?'Condicionado a elección':'Proyecto previo'} · ${item.status||'Sin estado'}`:kind==='actions'?`${item.date||'Sin fecha'} · ${item.description||'Sin descripción'}`:kind==='leaders'?`${linked} simpatizante(s) vinculado(s) en su red`:kind==='others'?item.contactType||item.role||'Contacto':`Líder: ${parent?.name||'Sin asignar'}`;
      return `<div class="urban-map-popup-row"><div><b>${esc(title)}</b><small>${esc(subtitle)}</small></div><button type="button" data-urban-open="${esc(kind)}" data-id="${esc(item.id)}" aria-label="Abrir ficha de ${esc(title)}">Ver</button></div>`;
    }).join('')+(items.length>35?`<small>Se muestran 35 de ${items.length}. Abra la ficha completa para consultar los demás.</small>`:'');
  }
  function drawPopup(popup,r,pos){
    if(!popup)return;
    if(!r||!popupVisible||placingPin){popup.hidden=true;popup.innerHTML='';return;}
    const tabs=[['needs','Necesidades',r.needs.length],['leaders','Líderes',r.leaders.length],['supporters','Simpatizantes',r.supporters.length],['projects','Compromisos / archivo',r.projects.length],['actions','Gestiones',r.actions.length],['others','Otros contactos',r.others.length]];
    popup.innerHTML=`<div class="urban-map-popup-head"><div><strong>📍 ${esc(r.label)}</strong><small class="urban-map-popup-precision">${pos?.manual?'✅ Señal colocada por usted':`🧭 ${esc(pos?.level||'Ubicación orientativa, no exacta')}`}</small></div><button type="button" data-urban-popup-close aria-label="Cerrar ficha">×</button></div>
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
  function drawOnSheet(sheetId,pinId,popupId,tagId,pos,r){
    const sheet=q(sheetId),pin=q(pinId),popup=q(popupId),tag=q(tagId);
    if(!sheet||!pin||!popup)return;
    if(!r||!pos){pin.hidden=true;popup.hidden=true;if(tag)tag.hidden=true;return;}
    pin.hidden=false;pin.style.left=pos.x+'%';pin.style.top=pos.y+'%';
    pin.classList.toggle('urban-reference-marker',!pos.manual);
    pin.classList.toggle('urban-unlocated-marker',!!pos.unknown);
    pin.title=`${r.label} · ${pos.manual?'Ubicación señalada manualmente':'Ubicación orientativa en el plano'}`;
    pin.setAttribute('aria-label','Abrir información de '+r.label);
    if(tag){tag.hidden=false;tag.style.left=Math.min(83,Math.max(17,pos.x))+'%';tag.style.top=pos.y+'%';tag.textContent=`${r.label} · ${count(r)} registro(s) · ${pos.manual?'señal guardada':pos.unknown?'ubicación por confirmar':'referencia aproximada'}`;}
    drawPopup(popup,r,pos);
    if(!popup.hidden)positionPopup(sheet,popup,pos);
  }
  function renderPinMap({focus=false}={}){
    const r=catalogue.find(x=>x.key===selected),pos=currentPin();
    renderAllPins('urbanMapAllPins');
    renderAllPins('urbanZoomAllPins');
    renderUnlocated();
    drawOnSheet('urbanMapSheet','urbanMapPin','urbanMapPopover','urbanMapFocusTag',pos,r);
    drawOnSheet('urbanZoomSheet','urbanZoomPin','urbanZoomPopover','urbanZoomFocusTag',pos,r);
    const status=q('urbanMapPinStatus');const place=q('urbanMapPlacePin');const reset=q('urbanMapResetPin');
    const allBtn=q('urbanMapShowSavedPins'),clearBtn=q('urbanMapClear');
    if(allBtn)allBtn.textContent=showOtherPins?'🙈 Ocultar otros puntos':'👁️ Mostrar otros puntos guardados';
    if(clearBtn)clearBtn.disabled=!selected&&!showOtherPins;
    if(place){place.disabled=!r;place.textContent=placingPin?'Cancelar ubicación':(pos?.manual?'✏️ Corregir señal en el plano':pos?'📍 Precisar ubicación en el plano':'📍 Ubicar este barrio en el plano');}
    if(reset)reset.hidden=!(r&&manualPins[selected]);
    if(status){status.textContent=placingPin&&r?`Toque la nueva ubicación de ${r.label} sobre el mapa; sus datos se conservarán.`:touchSheet?'Elija el nombre del barrio tocado. Su ubicación se recordará para consultas posteriores.':!r?'👆 Seleccione un barrio en el directorio inferior: aparecerá señalado aquí con su información.':pos?.manual?`${r.label}: ubicación guardada por usted. Toque el marcador o las pestañas de la ficha para consultar sus registros.`:pos?.unknown?`${r.label}: no hay un punto verificable en el plano original. El marcador de aviso está FUERA del área urbana; precise la ubicación real si la conoce.`:pos?`${r.label}: señalado de forma aproximada (${pos.level}). La ficha muestra los registros asociados; puede precisar el punto tocando «Precisar ubicación».`:`${r.label}: ficha disponible a la derecha. Este sector no tiene referencia gráfica; toque el plano para ubicarlo.`;}
    for(const id of ['urbanMapSheet','urbanZoomSheet'])q(id)?.classList.toggle('urban-pin-placing',placingPin);
    if(focus){
      const stage=q('urbanMapStage'),sheet=q('urbanMapSheet');
      stage?.scrollIntoView({behavior:'smooth',block:'nearest'});
      const image=q('urbanMapImage');
      if(stage&&sheet&&pos&&image?.complete&&image.naturalWidth>0){
        const desired=sheet.clientHeight*pos.y/100-stage.clientHeight*.51;
        stage.scrollTo({top:Math.max(0,desired),behavior:'smooth'});
      }
    }
  }
  function renderChosenBanner(){
    const host=q('urbanChosenBanner');if(!host)return;
    const r=catalogue.find(x=>x.key===selected);
    if(!r){host.hidden=true;host.innerHTML='';return;}
    const pos=currentPin(),grouped=r.meta.tipo==='Barrio'||r.meta.tipo==='Centro poblado especial';
    host.hidden=false;
    host.innerHTML=`<div class="urban-chosen-heading"><div><small>📍 Lugar seleccionado</small><h4>${esc(r.label)}</h4><p>${esc(r.meta.comuna?'Comuna '+r.meta.comuna:r.meta.zona==='rural'?'Ruitoque Condominio':'Sector por clasificar')} · ${esc(r.meta.tipo)}${grouped?' · Incluye registros de sectores y conjuntos asociados':''}</p></div><span class="urban-chosen-status">${pos?.manual?'✅ Ubicación guardada':pos?.unknown?'⚠️ Ubicación por confirmar':pos?'🧭 Ubicación orientativa':'📍 Sin punto de referencia'}</span></div>
      <div class="urban-chosen-totals"><span><strong>${r.needs.length}</strong> necesidades</span><span><strong>${r.leaders.length}</strong> líderes</span><span><strong>${r.supporters.length}</strong> simpatizantes</span><span><strong>${r.projects.length}</strong> compromisos / archivo</span><span><strong>${r.actions.length}</strong> gestiones</span>${r.others.length?`<span><strong>${r.others.length}</strong> otros contactos</span>`:''}</div>
      <div class="urban-chosen-actions"><button type="button" class="primary" id="urbanChosenViewMap">🗺️ Ver ubicación y ficha en el mapa</button><button type="button" class="secondary" id="urbanChosenViewDetails">📋 Ver todos los registros</button><button type="button" class="secondary" id="urbanChosenClear">🧹 Limpiar mapa</button></div>`;
    q('urbanChosenViewMap')?.addEventListener('click',()=>renderPinMap({focus:true}));
    q('urbanChosenViewDetails')?.addEventListener('click',()=>q('urbanBarrioDetails')?.scrollIntoView({behavior:'smooth',block:'start'}));
    q('urbanChosenClear')?.addEventListener('click',clearSelection);
  }
  function clearSelection(){
    closeTouchPicker();selected='';placingPin=false;popupVisible=false;showOtherPins=false;
    renderOptions();renderList();renderSelected();renderChosenBanner();renderPinMap();
  }
  function onMapClick(e,sheetId){
    if(e.target.closest('.urban-map-popup,.urban-map-marker,.urban-map-pinpoint,.urban-tap-picker'))return;
    const sheet=q(sheetId),img=sheet?.querySelector('img');if(!img)return;
    const rect=img.getBoundingClientRect();
    if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)return;
    const x=Math.max(0,Math.min(100,(e.clientX-rect.left)/rect.width*100));
    const y=Math.max(0,Math.min(100,(e.clientY-rect.top)/rect.height*100));
    if(placingPin&&selected){
      manualPins[selected]=[Number(x.toFixed(3)),Number(y.toFixed(3))];
      savePins();placingPin=false;popupVisible=true;renderPinMap();renderChosenBanner();return;
    }
    openTouchPicker(sheetId,{x,y});
  }
  function initPinMap(){
    loadPins();
    ['urbanMapPin','urbanZoomPin'].forEach(id=>q(id)?.addEventListener('click',e=>{e.stopPropagation();closeTouchPicker();popupVisible=true;renderPinMap();}));
    ['urbanMapSheet','urbanZoomSheet'].forEach(id=>q(id)?.addEventListener('click',e=>onMapClick(e,id)));
    Object.entries(touchIds).forEach(([sheetId,[pickerId,searchId]])=>{
      q(searchId)?.addEventListener('input',renderTouchResults);
      q(pickerId)?.querySelector('.secondary')?.addEventListener('click',event=>{event.stopPropagation();closeTouchPicker();renderPinMap();});
      q(pickerId)?.addEventListener('click',event=>event.stopPropagation());
    });
    q('urbanMapPlacePin')?.addEventListener('click',()=>{if(!selected)return;closeTouchPicker();placingPin=!placingPin;popupVisible=false;renderPinMap();});
    q('urbanMapResetPin')?.addEventListener('click',()=>{delete manualPins[selected];savePins();closeTouchPicker();placingPin=false;popupVisible=true;renderPinMap();renderChosenBanner();});
    q('urbanMapClear')?.addEventListener('click',clearSelection);
    q('urbanMapShowSavedPins')?.addEventListener('click',()=>{showOtherPins=!showOtherPins;renderPinMap();});
    q('urbanMapZoomBtn')?.addEventListener('click',()=>{setTimeout(()=>renderPinMap(),0)});
    const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(()=>renderPinMap()):null;
    if(observer){['urbanMapSheet','urbanZoomSheet'].forEach(id=>{const el=q(id);if(el)observer.observe(el);});}
    renderPinMap();
  }

  function choose(key){
    closeTouchPicker();selected=key;placingPin=false;
    showOtherPins=false;
    // Al escoger desde el directorio, mostrar primero el lugar SIN taparlo
    // con una ventana grande. La ficha completa ya se ve al lado del mapa.
    popupVisible=false;
    const r=catalogue.find(x=>x.key===key);
    popupTab=['needs','leaders','supporters','projects','actions','others'].find(kind=>(r?.[kind]?.length||0)>0)||'needs';
    renderOptions();renderList();renderSelected();renderChosenBanner();renderPinMap({focus:!!key});
  }
  function refresh(){buildCatalogue();renderStats();renderOptions();renderList();renderSelected();renderChosenBanner();renderPinMap();}
  function openRecord(kind,id){
    if(kind==='needs'){
      window.showView?.('needs');window.editNeed?.(id);
    }else if(kind==='projects'){
      window.showView?.('projects');window.editProject?.(id);
    }else if(kind==='actions'){
      window.showView?.('actions');
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
    if(vereda){const wanted=r.meta.zona==='rural'?'VEREDA RUITOQUE':'FLORIDABLANCA AREA URBANA';const match=[...vereda.options].find(o=>norm(o.value)===wanted);if(match)vereda.value=match.value;}
    if(form.elements.comuna&&r.meta.comuna){const opt=[...form.elements.comuna.options].find(o=>norm(o.value)===norm('COMUNA '+r.meta.comuna));if(opt)form.elements.comuna.value=opt.value;}
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
    q('urbanBarrioSearch').addEventListener('input',e=>{query=e.target.value;displayLimit=70;renderList();});
    q('urbanComunaFilter')?.addEventListener('change',e=>{comunaFilter=e.target.value;displayLimit=70;renderList();});
    q('urbanBarrioMore')?.addEventListener('click',()=>{displayLimit+=70;renderList();});
    q('urbanNewNeed')?.addEventListener('click',newNeed);
    document.querySelector('[data-map-tab="urbano"]')?.addEventListener('click',()=>{showOtherPins=false;refresh();});
    window.addEventListener('matriz:contacts-updated',refresh);
    window.addEventListener('storage',refresh);
    syncNeedBarrio();initMapImages();initPinMap();refresh();
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
  // Pure diagnostic API used by the local smoke tests. Does not modify the data.
  window.MatrizUrbanMap={norm,neighborhoodForNeed,neighborhoodForPerson,dataFor,referenceFor:pinFor,refresh,choose,pdfLabelPins,getManualPins:()=>({...manualPins})};
})();
