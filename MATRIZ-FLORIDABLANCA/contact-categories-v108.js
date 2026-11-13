/* Matriz v1.0.8 — selects para categorías de contacto y vínculos explícitos.
   No convierte los campos de identidad/contacto en categorías cerradas. */
(()=>{
  'use strict';
  const q=id=>document.getElementById(id);
  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const catalog=window.FLORIDABLANCA_TERRITORIO?.CATALOGO_AMPLIADO||[];
  const knownNames=[...new Set([...catalog.map(x=>x.nombre),...(window.FLORIDABLANCA_TERRITORIO?.BARRIOS||[])].filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
  const byName=new Map(catalog.map(x=>[norm(x.nombre),x]));
  let barrioChooser, barrioText, sectorChooser;

  function ensureOption(select,value){
    const str=String(value??'').trim();if(!select||!str)return;
    if(![...select.options].some(o=>o.value===str)){
      const opt=document.createElement('option');opt.value=str;opt.textContent=`Registrado anteriormente: ${str}`;opt.dataset.legacy='1';
      select.append(opt);
    }
  }
  function syncOtherRole(){
    const other=q('leaderRole')?.value==='__otro__';
    const field=q('roleOtherField');if(field)field.classList.toggle('hidden',!other);
    if(q('leaderRoleOther'))q('leaderRoleOther').required=other;
  }
  function setRoleFromExisting(person){
    const sel=q('leaderRole');if(!sel)return;
    if(person?.role){ensureOption(sel,person.role);sel.value=person.role}
    else sel.value='';
    q('leaderRoleOther').value='';syncOtherRole();
  }
  function applyBarrio(value){
    if(!barrioText)return;
    barrioText.value=value;
    const meta=byName.get(norm(value));
    const form=q('leaderForm');
    if(meta){
      if(meta.comuna&&form.elements.comuna){const wanted='COMUNA '+meta.comuna;if([...form.elements.comuna.options].some(o=>o.value===wanted))form.elements.comuna.value=wanted}
      const zone=q('leaderZoneType');if(zone){zone.value=meta.zona==='rural'?'Rural':meta.tipo==='Barrio'?'Barrio':meta.tipo==='Urbanización'?'Urbanización':'Conjunto residencial'}
    }
    const terr=form.elements.territory;if(terr&&!terr.value)terr.value=value;
  }
  function refreshBarrioMunicipality(){
    if(!barrioChooser)return;
    const flori=!q('leaderMunicipio')?.value||q('leaderMunicipio').value==='Floridablanca';
    barrioChooser.disabled=!flori;
    const hint=q('contactBarrioHint');
    if(hint)hint.textContent=flori?`${knownNames.length} lugares de Floridablanca para elegir; si hace falta uno, escríbalo en el campo inferior.`:'Para otros municipios escriba el barrio o sector en el campo inferior: el catálogo territorial disponible es de Floridablanca.';
    if(!flori)barrioChooser.value='';
  }
  function restoreForm(person){
    const f=q('leaderForm');if(!f)return;
    setRoleFromExisting(person);
    if(person?.organizationType){ensureOption(q('leaderOrganizationType'),person.organizationType);q('leaderOrganizationType').value=person.organizationType}
    if(person?.zoneType){ensureOption(q('leaderZoneType'),person.zoneType);q('leaderZoneType').value=person.zoneType}
    if(barrioChooser){
      if(person?.barrio){ensureOption(barrioChooser,person.barrio);barrioChooser.value=person.barrio}
      else barrioChooser.value='';
    }
    if(sectorChooser){const sector=person?.sectorTerritorial||'';if(sector){ensureOption(sectorChooser,sector);sectorChooser.value=sector}else sectorChooser.value=''}
    refreshBarrioMunicipality();
  }
  function editingPerson(){
    const id=q('leaderForm')?.elements.id?.value;
    return id?((typeof db!=='undefined'&&db?.leaders)||[]).find(x=>x.id===id):null;
  }
  function decorateBarrio(){
    const f=q('leaderForm');barrioText=f.elements.barrio;if(!barrioText)return;
    const label=barrioText.closest('label');if(!label)return;
    label.insertAdjacentHTML('afterbegin',`<span class="category-subtitle">Elegir barrio, conjunto o asentamiento</span><select id="contactBarrioSelect"><option value="">Seleccione una opción del catálogo...</option>${knownNames.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('')}</select><small id="contactBarrioHint" class="category-hint"></small><span class="category-subtitle">Barrio o sector registrado (también puede escribir)</span>`);
    barrioChooser=q('contactBarrioSelect');
    barrioChooser.addEventListener('change',()=>{if(barrioChooser.value)applyBarrio(barrioChooser.value)});
    barrioText.addEventListener('change',()=>{
      const exact=knownNames.find(n=>norm(n)===norm(barrioText.value));
      if(exact){barrioChooser.value=exact}else barrioChooser.value='';
    });
  }
  function decorateTerritorialSector(){
    const f=q('leaderForm'),el=f.elements.sectorTerritorial;if(!el)return;
    const label=el.closest('label');if(!label)return;
    // The inherited field is computed from territorial data. The selector can
    // complete it manually, but never erases the imported value.
    label.insertAdjacentHTML('afterbegin','<span class="category-subtitle">Seleccionar sector territorial</span><select id="contactSectorSelect"><option value="">Automático / sin seleccionar</option><option>Área urbana de Floridablanca</option><option>Área rural de Floridablanca</option><option>Comuna 1</option><option>Comuna 2</option><option>Comuna 3</option><option>Comuna 4</option><option>Comuna 5</option><option>Comuna 6</option><option>Comuna 7</option><option>Comuna 8</option><option>Otro sector</option></select><span class="category-subtitle">Sector guardado</span>');
    sectorChooser=q('contactSectorSelect');
    sectorChooser.addEventListener('change',()=>{if(sectorChooser.value)el.value=sectorChooser.value});
  }
  function decorateTerritoryDatalist(){
    const d=q('contactTerritorySuggestions');if(!d)return;
    d.innerHTML=knownNames.map(n=>`<option value="${esc(n)}"></option>`).join('');
  }
  function init(){
    decorateBarrio();decorateTerritorialSector();decorateTerritoryDatalist();
    const role=q('leaderRole');role?.addEventListener('change',syncOtherRole);
    q('leaderMunicipio')?.addEventListener('change',refreshBarrioMunicipality);
    const originalEdit=window.editLeader;
    if(typeof originalEdit==='function')window.editLeader=function(id){
      const person=(typeof db!=='undefined'&&db?.leaders||[]).find(x=>x.id===id);
      // Populate any legacy custom role BEFORE the inherited edit handler sets
      // the select value, so no data is lost on edit.
      if(person?.role)ensureOption(role,person.role);
      originalEdit(id);restoreForm(person);
    };
    q('leaderModal')&&new MutationObserver(()=>{
      if(!q('leaderModal').classList.contains('open'))return;
      queueMicrotask(()=>restoreForm(editingPerson()));
    }).observe(q('leaderModal'),{attributes:true,attributeFilter:['class']});
    document.addEventListener('click',event=>{
      if(event.target.closest('[data-open-modal="leaderModal"]'))setTimeout(()=>restoreForm(editingPerson()),0);
    });
    restoreForm(null);
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
