/* v1.4.16 — Armonización del formulario de necesidades con directorios, mapa urbano,
   veredas y contactos, sin migrar ni alterar registros existentes automáticamente. */
(()=>{
  'use strict';
  const f=document.getElementById('needForm'); if(!f)return;
  const by=id=>document.getElementById(id);
  const clean=v=>String(v??'').trim().replace(/\s+/g,' ');
  const norm=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/^(BARRIO|URBANIZACION|URB\.?|SECTOR URBANO)\s+/,'').replace(/[^A-Z0-9]+/g,' ').trim();
  const esc=v=>clean(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const base=window.MatrizBaseTerritorial?.records||[];
  const dbNow=()=>typeof db==='undefined'?{needs:[],leaders:[]}:db;
  const el={type:by('needGeoType'),sector:by('needGeoSector'),barrio:by('needGeoBarrio'),custom:by('needGeoCustom'),customLabel:by('needGeoCustomLabel'),territory:f.elements.territory,vereda:f.elements.vereda,barrioData:f.elements.barrio,sectorData:f.elements.sectorTerritorial,zone:f.elements.zone,status:by('needGeoStatus'),reporter:f.elements.leaderId,find:by('needGeoFindPeople'),map:by('needGeoOpenMap')};
  if(Object.values(el).some(x=>!x))return;
  let opening=false;
  const unique=(arr)=>[...new Map(arr.map(clean).filter(Boolean).map(v=>[norm(v),v])).values()].sort((a,b)=>a.localeCompare(b,'es',{numeric:true}));
  const urbanV=v=>norm(v)==='GIRON AREA URBANA';
  const urbanRecord=r=>!clean(r.vereda)||urbanV(r.vereda)||['GIRON','AREA URBANA','CASCO URBANO'].includes(norm(r.vereda));
  const allSectors=()=>unique([...base.map(r=>r.sector),...(dbNow().leaders||[]).map(p=>p.sectorTerritorial),...(dbNow().needs||[]).map(n=>n.sectorTerritorial)]);
  const knownBarrio=()=>{
    const m=new Map(),push=name=>{const n=clean(name),k=norm(n);if(!n||!k||['GIRON','GIRON AREA URBANA','AREA URBANA','SIN BARRIO','SIN ASIGNAR','NO APLICA'].includes(k)||/^VEREDA\s/.test(k)||/^SECTOR \d+$/.test(k))return;if(!m.has(k))m.set(k,n);};
    by('urbanBarrioSuggestions')?.querySelectorAll('option').forEach(o=>push(o.value));
    base.forEach(x=>push(x.barrio));
    (dbNow().leaders||[]).filter(urbanRecord).forEach(x=>push(x.barrio||x.territory));
    (dbNow().needs||[]).filter(urbanRecord).forEach(x=>push(x.barrio||x.territory));
    push(el.barrioData.value);
    return [...m.values()].sort((a,b)=>a.localeCompare(b,'es',{numeric:true}));
  };
  function baseSectors(barrio){return unique(base.filter(r=>norm(r.barrio)===norm(barrio)).map(r=>r.sector));}
  function labelBarrio(name){const target=norm(name);return knownBarrio().find(v=>norm(v)===target)||clean(name);}
  function refill(select,values,empty,selected){select.innerHTML='<option value="">'+esc(empty)+'</option>'+values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');if(selected&&[...select.options].some(o=>norm(o.value)===norm(selected)))select.value=[...select.options].find(o=>norm(o.value)===norm(selected)).value;}
  function renderSelectors({preferredSector,preferredBarrio}={}){
    const sector=preferredSector===undefined?el.sector.value:preferredSector;
    refill(el.sector,allSectors(),'Sin asignar / no identificado',sector);
    const barrio=preferredBarrio===undefined?el.barrio.value:preferredBarrio;
    const available=knownBarrio();
    // Never exclude names found only in the PDF or in another contact's record;
    // the chosen sector is checked independently rather than silently hiding neighborhoods.
    refill(el.barrio,available,'Seleccione un barrio urbano...',barrio);
    el.barrio.add(new Option('Otro barrio (registrar nombre)', '__otro'));
    if(barrio&&norm(barrio)!=='OTRO'&&![...el.barrio.options].some(o=>norm(o.value)===norm(barrio))){
      el.barrio.add(new Option(barrio+' (sin catalogar)',barrio));el.barrio.value=barrio;
    }
  }
  function setUrbanVereda(){
    const option=[...el.vereda.options].find(o=>urbanV(o.value));
    if(option)el.vereda.value=option.value;
  }
  const person=()=> (dbNow().leaders||[]).find(p=>p.id===el.reporter.value);
  function showStatus(){
    el.status.className='need-geo-status';let msg='';
    const barrio=clean(el.barrioData.value),area=el.type.value,sec=clean(el.sector.value);
    if(area==='urban'){
      if(!barrio){msg='Seleccione el barrio urbano. Se guardará el mismo nombre en Territorio y Barrio para que las necesidades aparezcan en el mapa.';}
      else{
        msg='Barrio de la necesidad: '+barrio+'. Este nombre se usará en la Matriz y en el mapa urbano.';
        const ss=baseSectors(barrio);
        if(ss.length===1&&!sec)msg+=' Sector territorial sugerido: '+ss[0]+'.';
        if(sec&&ss.length&&!ss.some(v=>norm(v)===norm(sec))){msg+=' ATENCIÓN: el sector elegido no corresponde al registrado para ese barrio en la Base Territorial.';el.status.classList.add('error');}
      }
    }else if(area==='rural'){
      msg=clean(el.vereda.value)?'Vereda de la necesidad: '+el.vereda.value+'. Se vinculará al mapa general de Girón.':'Seleccione una vereda rural del listado del mapa general.';
    }else{
      msg='Ubicación pendiente: este registro no se asignará automáticamente a un barrio urbano hasta que usted identifique el lugar.';
      el.status.classList.add('warning');
    }
    const p=person(),pBarrio=clean(p?.barrio||p?.territory);
    if(p&&area==='urban'&&barrio&&pBarrio&&norm(pBarrio)!==norm(barrio)){
      msg+=' El reportante '+p.name+' está registrado en '+pBarrio+'; puede reportar otra zona, así que no cambiaremos su ficha.';
      if(!el.status.classList.contains('error'))el.status.classList.add('warning');
    }
    el.status.textContent=msg;
  }
  function update({userSector=false,applySuggestion=false}={}){
    const area=el.type.value;
    by('needGeoSectorLabel').hidden=area!=='urban';
    by('needGeoBarrioLabel').hidden=area!=='urban';
    by('needVeredaLabel').hidden=area!=='rural';
    el.customLabel.hidden=area!=='urban'||el.barrio.value!=='__otro';
    el.find.hidden=area!=='urban';el.map.hidden=area!=='urban';
    el.territory.readOnly=area!=='pending';
    if(area==='urban'){
      let selected=el.barrio.value==='__otro'?clean(el.custom.value):clean(el.barrio.value);
      if(selected && el.barrio.value!=='__otro')selected=labelBarrio(selected);
      el.barrioData.value=selected;
      el.territory.value=selected;
      if(!userSector && applySuggestion&&selected){const ss=baseSectors(selected);if(ss.length===1&&!el.sector.value)el.sector.value=ss[0];}
      el.sectorData.value=el.sector.value;
      setUrbanVereda();
    }else if(area==='rural'){
      el.territory.value=clean(el.vereda.value);el.barrioData.value='';el.sectorData.value='';
    }else{
      el.barrioData.value='';el.sectorData.value='';el.vereda.value='';
    }
    showStatus();
  }
  function syncOnOpen(){
    if(!by('needModal').classList.contains('open'))return;
    opening=true;
    // editNeed writes values synchronously after opening the modal; the mutation callback
    // runs after that script has finished, so saved values are already available here.
    const territory=clean(el.territory.value), b=clean(el.barrioData.value),v=clean(el.vereda.value),sec=clean(el.sectorData.value);
    let area='urban';
    if(v&&!urbanV(v))area='rural';
    else if(urbanV(v)||b)area='urban';
    else if(territory){
      if(/^VEREDA\b/i.test(territory))area='rural';
      else if(knownBarrio().some(x=>norm(x)===norm(territory)))area='urban';
      else area='pending';
    }
    el.type.value=area;
    renderSelectors({preferredSector:sec,preferredBarrio:b|| (area==='urban'?territory:'')});
    // An older/unknown barrio can be kept as its own option without inventing a match.
    if(area==='urban'&&!el.barrio.value&&territory){el.barrio.add(new Option(territory+' (registro anterior)',territory));el.barrio.value=territory;}
    if(area==='rural'&&!v&&territory){const option=[...el.vereda.options].find(o=>norm(o.value)===norm(territory));if(option)el.vereda.value=option.value;}
    el.custom.value='';
    // In editing an old record, preserve its original stored strings until the user changes a selector.
    if(f.elements.id.value && territory){
      by('needGeoSectorLabel').hidden=area!=='urban';by('needGeoBarrioLabel').hidden=area!=='urban';by('needVeredaLabel').hidden=area!=='rural';
      el.customLabel.hidden=true;el.find.hidden=area!=='urban';el.map.hidden=area!=='urban';
      el.territory.readOnly=area!=='pending';showStatus();
    }else update({applySuggestion:true});
    opening=false;
  }
  el.type.addEventListener('change',()=>{
    if(el.type.value==='urban'){
      const b=clean(el.barrioData.value)||(!/^VEREDA\b/i.test(el.territory.value)?clean(el.territory.value):'');
      renderSelectors({preferredBarrio:b});
    }
    update({applySuggestion:true});
  });
  el.barrio.addEventListener('change',()=>{el.custom.value='';update({applySuggestion:true});});
  el.custom.addEventListener('input',()=>update({applySuggestion:true}));
  el.sector.addEventListener('change',()=>update({userSector:true}));
  el.vereda.addEventListener('change',()=>update());
  el.reporter.addEventListener('change',()=>{setTimeout(()=>{if(el.type.value==='urban'&&!clean(el.barrioData.value)){
    // People picker already suggests a territory for unlocated needs. Offer it as a known barrio.
    const p=person();const b=clean(p?.barrio||p?.territory);
    if(p&&b&&urbanRecord(p)){
      renderSelectors({preferredBarrio:b});
      if(el.barrio.value)update({applySuggestion:true});
    }
  }showStatus()},0);});
  el.find.addEventListener('click',()=>{
    const barrio=clean(el.barrioData.value);if(!barrio){alert('Seleccione primero el barrio de la necesidad.');return;}
    const sc=by('npSector'),br=by('npBarrio');if(!br){return;}
    sc.value=el.sector.value && [...sc.options].some(o=>norm(o.value)===norm(el.sector.value))?el.sector.value:'';
    sc.dispatchEvent(new Event('change',{bubbles:true}));
    const opt=[...br.options].find(o=>norm(o.value)===norm(barrio));
    if(opt){br.value=opt.value;br.dispatchEvent(new Event('change',{bubbles:true}));}
    by('needPeoplePicker')?.scrollIntoView({behavior:'smooth',block:'center'});
  });
  el.map.addEventListener('click',()=>{
    const barrio=clean(el.barrioData.value);if(!barrio){alert('Seleccione primero el barrio.');return;}
    if(!window.MatrizUrbanMap?.choose){alert('El módulo del mapa todavía no está disponible.');return;}
    const mapSelect=by('urbanBarrioSelect');
    if(!mapSelect || ![...mapSelect.options].some(o=>o.value===norm(barrio))){
      alert('Este barrio es nuevo y todavía no está en el catálogo del mapa. Guarde primero la necesidad para incorporarlo; luego podrá señalarlo sobre el plano.');
      return;
    }
    if(!confirm('Se cerrará el formulario. Si tiene cambios sin guardar, se perderán. ¿Desea consultar el barrio en el mapa ahora?'))return;
    window.closeModals?.();window.showView?.('map');document.querySelector('[data-map-tab="urbano"]')?.click();
    window.MatrizUrbanMap.refresh();window.MatrizUrbanMap.choose(norm(barrio));
  });
  const entities=window.MATRIZ_INSTITUTIONAL_DIRECTORY||{};
  const institutions=[...new Map(Object.values(entities).flatMap(arr=>Array.isArray(arr)?arr.map(x=>x.n):[]).filter(Boolean).map(v=>[norm(v),v])).values()].sort((a,b)=>a.localeCompare(b,'es'));
  if(by('needEntityOptions'))by('needEntityOptions').innerHTML=institutions.map(v=>`<option value="${esc(v)}"></option>`).join('');
  // Capture phase: block contradictory geography before app.js persists the need.
  f.addEventListener('submit',event=>{
    const area=el.type.value;
    if(area==='urban'||area==='rural')update({userSector:true});
    const b=clean(el.barrioData.value),v=clean(el.vereda.value),t=clean(el.territory.value);
    let error='';
    if(area==='urban'){
      if(!b)error='Seleccione el barrio urbano o registre su nombre con la opción «Otro barrio».';
      else if(!urbanV(v))error='La ubicación urbana debe tener la vereda «GIRÓN - ÁREA URBANA».';
      else if(norm(t)!==norm(b))error='Territorio y barrio deben referirse al mismo lugar.';
      const known=baseSectors(b),sec=clean(el.sector.value);
      if(!error&&sec&&known.length&&!known.some(x=>norm(x)===norm(sec)))error='El sector territorial elegido no corresponde al barrio en la Base Territorial. Cambie el sector o déjelo sin asignar.';
    }else if(area==='rural'){
      if(!v||urbanV(v))error='Seleccione una vereda rural registrada en el mapa general.';
    }else if(!t)error='Describa la ubicación pendiente antes de guardar.';
    if(error){event.preventDefault();event.stopImmediatePropagation();showStatus();el.status.classList.add('error');el.status.textContent=error;el.status.scrollIntoView({behavior:'smooth',block:'center'});alert(error);}
  },true);
  const modal=by('needModal');new MutationObserver(()=>{if(modal.classList.contains('open'))syncOnOpen();}).observe(modal,{attributes:true,attributeFilter:['class']});
  f.addEventListener('reset',()=>{setTimeout(()=>{el.type.value='urban';el.custom.value='';renderSelectors();update();},0);});
  window.MatrizNeedTerritory={refresh:()=>{renderSelectors();update();},normalize:norm,lookupSectors:baseSectors};
  renderSelectors();syncOnOpen();
})();
