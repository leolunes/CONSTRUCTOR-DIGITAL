/* v1.4.10 · Reportante en Necesidades: directorio vivo + alta rápida.
   Sin servidor; reutiliza db.leaders / APP_KEY existentes.
   No marca permisos de comunicación ni deduce afiliación para participantes. */
(()=>{
  'use strict';
  const f=document.getElementById('needForm'), reporter=document.getElementById('needLeader');
  if(!f||!reporter)return;
  const dbNow=()=>typeof db!=='undefined'?db:null;
  const clean=v=>String(v??'').trim();
  const norm=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
  const esc=v=>clean(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const base=window.MatrizBaseTerritorial?.records||[];
  const people=()=>[...(dbNow()?.leaders||[])].filter(x=>x?.id&&clean(x.name));
  const noBlank=(s,t)=>clean(s)||t;
  const contactBarrio=p=>clean(p.barrio||p.territory);
  const contactSector=p=>clean(p.sectorTerritorial||p.operationalSector||p.sector);
  const uniqueSorted=arr=>[...new Map(arr.filter(x=>clean(x)).map(x=>[norm(x),clean(x)])).values()].sort((a,b)=>a.localeCompare(b,'es',{numeric:true}));

  const box=document.createElement('section');
  box.id='needPeoplePicker';box.className='span-2 base-quick need-people-picker';
  box.innerHTML=`<div class="need-people-head"><div><strong>👥 Buscar a quien presenta la necesidad</strong><p>Seleccione en la base territorial o entre los contactos registrados. También puede registrar aquí a una persona nueva.</p></div></div>
   <div class="base-quick-row need-people-row">
     <label>Sector territorial<select id="npSector"><option value="">Todos los sectores</option></select></label>
     <label>Barrio / sector<select id="npBarrio"><option value="">Todos los barrios</option></select></label>
     <label>Persona registrada<select id="npPerson"><option value="">Seleccione una persona</option></select></label>
     <button type="button" class="secondary" id="npUse">✓ Usar persona</button>
   </div>
   <div class="need-people-tools"><small id="npCount" aria-live="polite"></small><button class="secondary" type="button" id="npNewBtn">+ Registrar líder o participante nuevo</button></div>
   <div id="npNewPanel" class="need-people-new" hidden>
      <strong>Nuevo contacto · se guarda también en el directorio de personas</strong>
      <div class="need-people-new-grid">
        <label>Tipo de persona<select id="npType"><option value="Líder">Líder comunitario</option><option value="Participante">Participante / ciudadano</option></select></label>
        <label>Nombre completo <span aria-hidden="true">*</span><input id="npName" autocomplete="off" placeholder="Nombre y apellidos"></label>
        <label>Cédula (opcional)<input id="npCedula" inputmode="numeric" autocomplete="off"></label>
        <label>Teléfono / WhatsApp (opcional)<input id="npPhone" inputmode="tel"></label>
        <label>Correo (opcional)<input id="npEmail" type="text" inputmode="email" autocomplete="off"></label>
        <label>Sector territorial<input id="npNewSector" list="npSectorSuggestions" placeholder="Sector o zona"></label>
        <label>Barrio o comunidad<input id="npNewBarrio" list="npBarrioSuggestions" placeholder="Barrio / sector / vereda"></label>
      </div>
      <datalist id="npSectorSuggestions"></datalist><datalist id="npBarrioSuggestions"></datalist>
      <div class="need-people-new-actions"><span>La autorización para recibir comunicaciones quedará <strong>pendiente</strong> hasta que se registre expresamente.</span><button class="primary" type="button" id="npSave">Guardar persona y vincular</button><button class="secondary" type="button" id="npCancel">Cancelar</button></div>
   </div>`;
  reporter.closest('label').insertAdjacentElement('beforebegin',box);
  const $=id=>box.querySelector('#'+id);
  const sec=$('npSector'),barr=$('npBarrio'),sel=$('npPerson');
  const identityMap=new Map();
  const fullRows=()=>{
    const live=people().map(p=>({...p,__type:'contact',__sector:contactSector(p),__barrio:contactBarrio(p)}));
    const knownCed=new Set(live.map(p=>clean(p.cedula).replace(/\D/g,'')).filter(Boolean));
    const knownNames=new Set(live.map(p=>norm(p.name)+'|'+norm(p.__barrio)));
    base.forEach((b,i)=>{
      const name=clean(b.name),ced=clean(b.cedula).replace(/\D/g,'');
      if(!name||['lider','líder','lideres','líderes'].includes(norm(name)))return;
      if((ced&&knownCed.has(ced))||knownNames.has(norm(name)+'|'+norm(b.barrio)))return;
      live.push({...b,id:'base:'+i,__type:'base',__sector:clean(b.sector),__barrio:clean(b.barrio)});
    });
    return live;
  };
  const identity=p=>p.id;
  const matched=(p)=>{
    const sector=sec.value,barrio=barr.value;
    return (!sector||norm(p.__sector)===norm(sector))&&(!barrio||norm(p.__barrio)===norm(barrio));
  };
  const refill=(el,values,placeholder)=>{
    const prev=el.value;
    el.innerHTML=`<option value="">${esc(placeholder)}</option>`+values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
    if(values.some(v=>v===prev))el.value=prev;
  };
  function renderPicker(options={}){
    const rows=fullRows();
    identityMap.clear();rows.forEach(p=>identityMap.set(identity(p),p));
    const sectors=uniqueSorted([...base.map(x=>x.sector),...rows.map(x=>x.__sector)]);
    refill(sec,sectors,'Todos los sectores');
    const zones=uniqueSorted([...base.filter(b=>!sec.value||norm(b.sector)===norm(sec.value)).map(b=>b.barrio),...rows.filter(p=>!sec.value||norm(p.__sector)===norm(sec.value)).map(p=>p.__barrio)]);
    refill(barr,zones,'Todos los barrios');
    const matching=rows.filter(matched).sort((a,b)=>clean(a.name).localeCompare(clean(b.name),'es'));
    const prev=options.resetSelection?'':sel.value;
    sel.innerHTML='<option value="">Seleccione una persona</option>'+matching.map(p=>`<option value="${esc(p.id)}">${esc(p.name)} · ${esc(p.__barrio||'Sin barrio')} ${p.__type==='base'?'(base territorial)':''}</option>`).join('');
    if(matching.some(p=>p.id===prev))sel.value=prev;
    $('npCount').textContent=`${matching.length} persona${matching.length===1?'':'s'} disponible${matching.length===1?'':'s'} · ${zones.length} barrio${zones.length===1?'':'s'} en el filtro`;
    $('npSectorSuggestions').innerHTML=sectors.map(v=>`<option value="${esc(v)}"></option>`).join('');
    $('npBarrioSuggestions').innerHTML=uniqueSorted([...base.map(x=>x.barrio),...rows.map(x=>x.__barrio)]).map(v=>`<option value="${esc(v)}"></option>`).join('');
  }
  function selectContact(id,{syncFilter=true}={}){
    const p=people().find(x=>x.id===id);
    if(!p){return false;}
    // RefreshRefs can recreate the select after saving, so select only afterward.
    reporter.value=id;
    if(reporter.value!==id){refreshRefs();reporter.value=id;}
    reporter.dispatchEvent(new Event('change',{bubbles:true}));
    if(syncFilter){
      renderPicker();
      const sector=contactSector(p),zone=contactBarrio(p);
      if(sector && [...sec.options].some(x=>norm(x.value)===norm(sector)))sec.value=[...sec.options].find(x=>norm(x.value)===norm(sector)).value;
      renderPicker();
      if(zone && [...barr.options].some(x=>norm(x.value)===norm(zone)))barr.value=[...barr.options].find(x=>norm(x.value)===norm(zone)).value;
      renderPicker();sel.value=id;
    }
    // Solo sugerir territorio cuando la necesidad aún no lo tiene; nunca sustituir lo escrito.
    if(!clean(f.elements.territory?.value) && contactBarrio(p))f.elements.territory.value=contactBarrio(p);
    const vd=f.elements.vereda;
    if(vd && !clean(vd.value) && p.vereda && [...vd.options].some(o=>o.value===p.vereda))vd.value=p.vereda;
    showReporter();
    return true;
  }
  function showReporter(){
    const p=people().find(x=>x.id===reporter.value);
    let detail=box.querySelector('#npSelected');
    if(!detail){detail=document.createElement('div');detail.id='npSelected';detail.className='need-people-selected';box.insertBefore(detail,$('npNewPanel'));}
    detail.hidden=!p;
    detail.innerHTML=p?`<strong>✓ Reportante vinculado:</strong> ${esc(p.name)} · ${esc(p.contactType||p.role||'Contacto registrado')} · ${esc(contactBarrio(p)||'Sin barrio')}${clean(p.phone||p.whatsapp)?' · '+esc(p.phone||p.whatsapp):''}`:'';
  }
  sec.addEventListener('change',()=>{barr.value='';sel.value='';renderPicker({resetSelection:true});});
  barr.addEventListener('change',()=>renderPicker({resetSelection:true}));
  $('npUse').addEventListener('click',()=>{
    const chosen=sel.value;
    if(!chosen){alert('Seleccione primero a una persona. Si no aparece, puede registrarla aquí mismo.');return;}
    const p=identityMap.get(chosen);
    if(p?.__type==='contact'){selectContact(chosen);return;}
    if(p?.__type==='base'){
      // La base es local; no asignar consentimiento ni clasificación partidista implícita.
      const existing=people().find(x=>clean(x.cedula)&&clean(x.cedula)===clean(p.cedula) || norm(x.name)===norm(p.name)&&norm(contactBarrio(x))===norm(p.barrio));
      if(existing){selectContact(existing.id);return;}
      const d=dbNow();if(!d)return;
      const x={id:uid('L'),created:new Date().toISOString(),name:clean(p.name),cedula:clean(p.cedula),contactType:'',role:'Líder territorial (base de referencia)',organization:'',sectorTerritorial:clean(p.sector),barrio:clean(p.barrio),territory:clean(p.barrio),vereda:'GIRÓN - ÁREA URBANA',phone:clean(p.phone),whatsapp:clean(p.phone),address:clean(p.address),pollingPlace:clean(p.pollingPlace),communicationsConsent:'Pendiente',notes:'Vinculado desde base territorial al registrar necesidad'};
      d.leaders.push(x);saveDB();selectContact(x.id);toast('Persona incorporada y vinculada');
    }
  });
  reporter.addEventListener('change',()=>{
    const p=people().find(x=>x.id===reporter.value);
    showReporter();
    if(p){const sector=contactSector(p), barrio=contactBarrio(p);if(sector){renderPicker();const s=[...sec.options].find(o=>norm(o.value)===norm(sector));if(s){sec.value=s.value;renderPicker();}}if(barrio){const b=[...barr.options].find(o=>norm(o.value)===norm(barrio));if(b){barr.value=b.value;renderPicker();}}sel.value=p.id;}
  });
  $('npNewBtn').addEventListener('click',()=>{
    const panel=$('npNewPanel'),opening=panel.hidden;
    panel.hidden=!opening;
    if(opening){
      $('npName').value='';$('npCedula').value='';$('npPhone').value='';$('npEmail').value='';
      $('npNewSector').value=sec.value;
      $('npNewBarrio').value=barr.value || clean(f.elements.territory?.value);
      $('npName').focus();
    }
  });
  $('npCancel').addEventListener('click',()=>{$('npNewPanel').hidden=true});
  $('npNewPanel').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'){e.preventDefault();$('npSave').click();}});
  $('npSave').addEventListener('click',()=>{
    const name=clean($('npName').value), ced=clean($('npCedula').value).replace(/\D/g,''), phone=clean($('npPhone').value), email=clean($('npEmail').value), sector=clean($('npNewSector').value), barrio=clean($('npNewBarrio').value), type=$('npType').value;
    if(!name){alert('Ingrese el nombre completo del líder o participante.');$('npName').focus();return;}
    if(!['Líder','Participante'].includes(type))return;
    if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){alert('Revise el correo electrónico.');return;}
    const d=dbNow();if(!d)return;
    const dupe=d.leaders.find(x=> (ced&&clean(x.cedula).replace(/\D/g,'')===ced)|| (norm(x.name)===norm(name)&&((phone&&norm(x.phone||x.whatsapp)===norm(phone))||(barrio&&norm(contactBarrio(x))===norm(barrio)))));
    if(dupe){selectContact(dupe.id);$('npNewPanel').hidden=true;toast('Esta persona ya estaba registrada; se vinculó sin duplicarla');return;}
    const record={id:uid('L'),created:new Date().toISOString(),name,cedula:ced,contactType:type,role:type==='Líder'?'Líder comunitario':'Participante comunitario',organization:'',sectorTerritorial:sector,barrio,territory:barrio,vereda:clean(f.elements.vereda?.value),phone,whatsapp:phone,email,communicationsConsent:'Pendiente',preferredChannel:'WhatsApp',notes:'Registrado desde el formulario de necesidad'};
    d.leaders.push(record);
    saveDB();
    $('npNewPanel').hidden=true;renderPicker();selectContact(record.id);toast('Persona registrada y vinculada a la necesidad');
  });

  // Refill using the most recent saved contacts, including new edits made elsewhere.
  const needModal=document.getElementById('needModal');
  if(needModal)new MutationObserver(()=>{
    if(needModal.classList.contains('open')){renderPicker();showReporter();}
  }).observe(needModal,{attributes:true,attributeFilter:['class']});
  // The edit-need form keeps the saved reporter even when legacy data had no contactType.
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-open-modal="needModal"]');
    if(button){$('npNewPanel').hidden=true;sec.value='';barr.value='';sel.value='';renderPicker();}
  });
  renderPicker();showReporter();
})();
