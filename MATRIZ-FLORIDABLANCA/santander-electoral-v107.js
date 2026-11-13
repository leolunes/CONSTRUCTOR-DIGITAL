/* Matriz Floridablanca v1.0.7 — consulta departamental y de puestos.
   Los contactos siguen en db.leaders/localStorage; no se envían datos a servidores. */
(()=>{
  'use strict';
  const catalog=window.SANTANDER_ELECTORAL;
  if(!catalog?.municipios?.length)return;
  const q=id=>document.getElementById(id);
  const safe=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ');
  const names=catalog.municipios.map(x=>x.nombre);
  const byName=new Map(names.map(x=>[norm(x),x]));
  const byCode=new Map(catalog.municipios.map(x=>[x.codigo,x.nombre]));
  const sitesByCity=new Map(names.map(x=>[x,[]]));
  const siteById=new Map(catalog.puestos.map(x=>[x.id,x]));
  catalog.puestos.forEach(s=>sitesByCity.get(s.municipio)?.push(s));
  const activePeople=()=>((typeof db!=='undefined'&&db?.leaders)||[]).filter(p=>['Líder','Simpatizante'].includes(p.contactType));
  const canonical=s=>byName.get(norm(s))||'';

  // Older records came from a Floridablanca-only app. Infer its city only where
  // a local comuna, vereda or catalogued barrio provides evidence.
  function territoryCity(p){
    if(p.municipio)return canonical(p.municipio);
    if(norm(p.vereda).includes('floridablanca')||p.comuna)return 'Floridablanca';
    const barrios=window.FLORIDABLANCA_TERRITORIO?.BARRIOS||[];
    if(p.barrio&&barrios.some(x=>norm(x)===norm(p.barrio)))return 'Floridablanca';
    return '';
  }
  function voteCity(p){return canonical(p.municipioVotacion)}
  function matchedSite(p){
    if(p.pollingPlaceId&&siteById.has(p.pollingPlaceId))return siteById.get(p.pollingPlaceId);
    const city=voteCity(p);
    return (sitesByCity.get(city)||[]).find(s=>norm(s.puesto)===norm(p.pollingPlace))||null;
  }
  function siteTitle(p){return matchedSite(p)?.puesto||String(p.pollingPlace||'').trim()}
  function cityOptions(empty='Seleccione municipio'){
    return `<option value="">${safe(empty)}</option>`+names.map(n=>`<option value="${safe(n)}">${safe(n)}</option>`).join('');
  }
  function summaryKpi(value,label){return `<div class="santander-kpi"><strong>${value}</strong><span>${safe(label)}</span></div>`}
  function personRow(p){return `<div class="santander-person"><div><strong>${safe(p.name||'Sin nombre')}</strong><small>${safe(p.contactType)} · ${safe(territoryCity(p)||'Municipio sin definir')} · vota en ${safe(voteCity(p)||'sin informar')}</small><small>🗳️ ${safe(siteTitle(p)||'Sin puesto registrado')}</small></div><button type="button" class="secondary" data-santander-person="${safe(p.id)}">Abrir ficha</button></div>`}
  function profileNotice(){return `<p class="santander-help">Los totales cuentan fichas guardadas, no votos ni compromisos electorales. Los registros históricos solo se asignan a Floridablanca cuando existe una referencia territorial local identificable.</p>`}

  let selectedCity='', showMapDots=false;
  function updateMapStats(){
    const people=activePeople();
    const cities=new Set(people.map(territoryCity).filter(Boolean));
    const other=people.filter(p=>territoryCity(p)&&territoryCity(p)!=='Floridablanca').length;
    q('santanderMapStats').innerHTML=summaryKpi(87,'Municipios')+summaryKpi(818,'Puestos en catálogo')+summaryKpi(cities.size,'Municipios con red')+summaryKpi(other,'Contactos de otros municipios');
  }
  function mapPoint(site){
    // Empirical affine approximation for this non-georeferenced map image.
    if(!Number.isFinite(site.lat)||!Number.isFinite(site.lon))return null;
    const x=820+550*(site.lon+73.116),y=520-570*(site.lat-7.125);
    if(x<25||x>1240||y<25||y>1260)return null;
    return {x:x/1270*100,y:y/1297*100};
  }
  function representativeSite(city){
    const opts=sitesByCity.get(city)||[];
    return opts.find(p=>norm(p.puesto).includes('cabecera'))||opts[0];
  }
  function renderMapDots(){
    const host=q('santanderMapMarkers');if(!host)return;
    host.innerHTML=names.map(city=>{
      const site=representativeSite(city),pos=site&&mapPoint(site);
      if(!pos||(!showMapDots&&city!==selectedCity))return '';
      const isSelected=city===selectedCity;
      return `<button type="button" class="santander-map-dot ${isSelected?'selected':''}" style="left:${pos.x.toFixed(2)}%;top:${pos.y.toFixed(2)}%" data-santander-municipio="${safe(city)}" title="${safe(city)} (ubicación aproximada)" aria-label="Consultar ${safe(city)}"></button>`;
    }).join('');
    q('santanderMapMarkersBtn').textContent=showMapDots?'Ocultar puntos de referencia':'Mostrar puntos de referencia';
    q('santanderMapMarkersBtn').setAttribute('aria-pressed',String(showMapDots));
  }
  function renderCityDirectory(){
    const term=norm(q('santanderMunicipioSearch')?.value||'');
    const people=activePeople();
    const cities=names.filter(n=>norm(n).includes(term));
    q('santanderMunicipiosVisible').textContent=`${cities.length} de 87 municipios`;
    q('santanderMunicipiosChips').innerHTML=cities.map(city=>{
      const total=people.filter(p=>territoryCity(p)===city).length;
      return `<button type="button" class="santander-city-chip ${city===selectedCity?'selected':''}" data-santander-municipio="${safe(city)}"><span>${safe(city)}</span><b>${total}</b></button>`;
    }).join('');
  }
  function renderMapDetail(){
    const host=q('santanderMapDetail');if(!host)return;
    if(!selectedCity){host.innerHTML='<div class="santander-empty"><h3>Seleccione un municipio</h3><p>Podrá consultar aquí contactos, puestos y sus respectivos conteos. Use el buscador o la lista de los 87 municipios.</p></div>';return}
    const people=activePeople(),locals=people.filter(p=>territoryCity(p)===selectedCity),voters=people.filter(p=>voteCity(p)===selectedCity);
    const registered=voters.filter(p=>siteTitle(p));
    const stationGroups=new Map();
    registered.forEach(p=>{const name=siteTitle(p),key=norm(name);if(!stationGroups.has(key))stationGroups.set(key,{name,count:0});stationGroups.get(key).count++});
    const stationList=[...stationGroups.values()].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'es'));
    const allSites=sitesByCity.get(selectedCity)||[];
    const shownPeople=new Map([...locals,...voters].map(p=>[p.id,p]));
    host.innerHTML=`<div class="santander-detail-title"><div><span>Municipio seleccionado</span><h3>📍 ${safe(selectedCity)}</h3></div><span class="santander-source-tag">${allSites.length} puestos</span></div>
      <div class="santander-detail-kpis">${summaryKpi(locals.length,'Vinculados')}${summaryKpi(voters.length,'Votan aquí')}${summaryKpi(registered.length,'Con puesto')}${summaryKpi(stationList.length,'Puestos con registro')}</div>
      <details class="santander-detail-group" open><summary>Puestos con personas registradas (${stationList.length})</summary><div class="santander-site-list">${stationList.length?stationList.map(s=>`<div><span>${safe(s.name)}</span><b>${s.count}</b></div>`).join(''):'<p class="santander-help">Aún no hay puestos registrados para contactos de este municipio.</p>'}</div></details>
      <details class="santander-detail-group"><summary>Ver todos los puestos del catálogo (${allSites.length})</summary><div class="santander-site-list">${allSites.map(s=>`<div><span>${safe(s.puesto)} <small>${safe(s.id)}</small></span><b>${voters.filter(p=>matchedSite(p)?.id===s.id).length}</b></div>`).join('')}</div></details>
      <details class="santander-detail-group" open><summary>Contactos vinculados o con votación aquí (${shownPeople.size})</summary><div class="santander-people-list">${shownPeople.size?[...shownPeople.values()].sort((a,b)=>a.name.localeCompare(b.name,'es')).map(personRow).join(''):'<p class="santander-help">Este municipio aún no tiene contactos asociados.</p>'}</div></details>
      ${profileNotice()}`;
  }
  function chooseCity(city){
    selectedCity=canonical(city);
    q('santanderMapMunicipio').value=selectedCity;
    renderMapDots();renderCityDirectory();renderMapDetail();
  }
  function renderLeadersSummary(){
    const host=q('santanderLeadersResults');if(!host)return;
    const people=activePeople(),municipality=q('santanderLeadersMunicipio')?.value||'',mode=q('santanderLeadersGroup')?.value||'territorial';
    const term=norm(q('santanderLeadersPuestoSearch')?.value||'');
    const selected=people.filter(p=>(!municipality||(mode==='territorial'?territoryCity(p):voteCity(p))===municipality)&&(!term||norm(siteTitle(p)).includes(term)));
    const cities=new Map();selected.forEach(p=>{const city=(mode==='territorial'?territoryCity(p):voteCity(p))||'Sin asignar';cities.set(city,(cities.get(city)||0)+1)});
    const stations=new Map();selected.filter(p=>siteTitle(p)).forEach(p=>{
      const city=voteCity(p)||'Sin municipio de votación',name=siteTitle(p),key=norm(city)+'|'+norm(name);
      if(!stations.has(key))stations.set(key,{city,name,count:0,leaders:0,supporters:0});
      const s=stations.get(key);s.count++;if(p.contactType==='Líder')s.leaders++;else s.supporters++;
    });
    const cityRows=[...cities].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'es'));
    const stationRows=[...stations.values()].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'es'));
    host.innerHTML=`<div class="santander-result-grid"><div><h4>Distribución por municipio (${cityRows.length})</h4><div class="santander-count-list">${cityRows.map(([name,count])=>`<button type="button" data-santander-go="${safe(name)}"><span>${safe(name)}</span><b>${count}</b></button>`).join('')||'<p class="santander-help">Todavía no hay contactos para este filtro.</p>'}</div></div>
      <div><h4>Puestos con registros (${stationRows.length})</h4><div class="santander-count-list">${stationRows.map(s=>`<div><span>${safe(s.name)}<small>${safe(s.city)} · ${s.leaders} líder(es), ${s.supporters} simpatizante(s)</small></span><b>${s.count}</b></div>`).join('')||'<p class="santander-help">No hay puestos de votación consignados para este filtro.</p>'}</div></div></div>
      <details class="santander-contact-detail"><summary>Ver las fichas filtradas (${selected.length})</summary><div class="santander-people-list">${selected.map(personRow).join('')||'<p>Sin contactos.</p>'}</div></details>${profileNotice()}`;
  }
  function updateLeaderCounters(){
    const people=activePeople();
    const flori=people.filter(p=>territoryCity(p)==='Floridablanca').length;
    const other=people.filter(p=>territoryCity(p)&&territoryCity(p)!=='Floridablanca').length;
    const noCity=people.filter(p=>!territoryCity(p)).length;
    const sites=people.filter(p=>siteTitle(p)).length;
    q('santanderContactNumbers').innerHTML=summaryKpi(flori,'Floridablanca')+summaryKpi(other,'Otros municipios')+summaryKpi(noCity,'Sin municipio')+summaryKpi(sites,'Con puesto registrado');
  }

  let manualPollingInput,selectPolling,hiddenPollingId;
  function renderPollingChoices(previousId='',previousText=''){
    const city=q('leaderMunicipioVotacion')?.value||'';
    const list=sitesByCity.get(city)||[];
    selectPolling.innerHTML='<option value="">Seleccione un puesto de votación</option>'+list.map(s=>`<option value="${safe(s.id)}">${safe(s.puesto)}</option>`).join('');
    const found=previousId&&list.find(s=>s.id===previousId)||list.find(s=>norm(s.puesto)===norm(previousText));
    selectPolling.value=found?.id||'';
    if(found){hiddenPollingId.value=found.id;manualPollingInput.value=found.puesto}
    else{hiddenPollingId.value='';manualPollingInput.value=previousText||''}
    const tip=q('santanderPollingTip');
    tip.textContent=city?`${list.length} puestos disponibles para ${city}. Puede escribir una referencia diferente si no figura en el catálogo.`:'Elija primero el municipio donde vota; también puede escribir el puesto manualmente.';
  }
  function editingPerson(){const id=q('leaderForm')?.elements?.id?.value;return id?((typeof db!=='undefined'&&db.leaders)||[]).find(p=>p.id===id):null}
  function restoreForm(){
    const f=q('leaderForm'),p=editingPerson();if(!f)return;
    const city=p?territoryCity(p):'Floridablanca';
    q('leaderMunicipio').value=city;
    const voto=p?canonical(p.municipioVotacion):'Floridablanca';
    q('leaderMunicipioVotacion').value=voto;
    q('leaderMunicipioVotacion').dataset.followTerritory=(!p||!voto||voto===city)?'yes':'no';
    renderPollingChoices(p?.pollingPlaceId||'',p?.pollingPlace||'');
  }
  function initContactForm(){
    const f=q('leaderForm');if(!f)return;
    q('leaderMunicipio').innerHTML=cityOptions('Sin municipio asignado');
    q('leaderMunicipioVotacion').innerHTML=cityOptions('Sin informar');
    manualPollingInput=f.elements.pollingPlace;
    if(!manualPollingInput){console.warn('Campo territorial pollingPlace no encontrado');return}
    manualPollingInput.placeholder='Escriba si su puesto no está en el listado';
    const field=manualPollingInput.closest('label');
    field.classList.add('santander-polling-field');
    field.insertAdjacentHTML('afterbegin','<span>Seleccione del catálogo de puestos</span><select id="santanderPollingSelect"><option value="">Primero seleccione municipio donde vota</option></select><small id="santanderPollingTip"></small><span>Referencia guardada / puesto manual</span>');
    selectPolling=q('santanderPollingSelect');
    hiddenPollingId=document.createElement('input');hiddenPollingId.type='hidden';hiddenPollingId.name='pollingPlaceId';f.append(hiddenPollingId);
    selectPolling.addEventListener('change',()=>{const s=siteById.get(selectPolling.value);hiddenPollingId.value=s?.id||'';manualPollingInput.value=s?.puesto||''});
    manualPollingInput.addEventListener('input',()=>{const s=siteById.get(hiddenPollingId.value);if(!s||norm(s.puesto)!==norm(manualPollingInput.value)){hiddenPollingId.value='';selectPolling.value=''}});
    q('leaderMunicipioVotacion').addEventListener('change',()=>renderPollingChoices('',''));
    q('leaderMunicipio').addEventListener('change',e=>{
      const vote=q('leaderMunicipioVotacion');if(!vote.value||vote.dataset.followTerritory==='yes'){vote.value=e.target.value;renderPollingChoices('','')}vote.dataset.followTerritory='yes';
    });
    q('leaderMunicipioVotacion').addEventListener('change',()=>{q('leaderMunicipioVotacion').dataset.followTerritory='no'});
    f.addEventListener('submit',()=>{const id=hiddenPollingId.value;if(id&&!siteById.has(id))hiddenPollingId.value=''},true);
    // The original application opens the form both from the new-contact button
    // and while editing an existing record; this observer handles both paths.
    new MutationObserver(()=>{if(q('leaderModal').classList.contains('open'))queueMicrotask(restoreForm)}).observe(q('leaderModal'),{attributes:true,attributeFilter:['class']});
    document.addEventListener('click',event=>{
      if(event.target.closest('[data-open-modal="leaderModal"]'))setTimeout(restoreForm,0);
    });
    const originalEdit=window.editLeader;
    if(typeof originalEdit==='function')window.editLeader=function(id){originalEdit(id);restoreForm()};
    restoreForm();
  }
  function init(){
    initContactForm();
    q('santanderMapMunicipio').innerHTML=cityOptions('Seleccione un municipio');
    q('santanderLeadersMunicipio').innerHTML=cityOptions('Todos los municipios');
    q('santanderMapMunicipio').addEventListener('change',event=>chooseCity(event.target.value));
    q('santanderMunicipioSearch').addEventListener('input',renderCityDirectory);
    q('santanderMapMarkersBtn').addEventListener('click',()=>{showMapDots=!showMapDots;renderMapDots()});
    q('santanderMapClearBtn').addEventListener('click',()=>{q('santanderMunicipioSearch').value='';showMapDots=false;chooseCity('')});
    q('santanderMapMarkers').addEventListener('click',event=>{const chip=event.target.closest('[data-santander-municipio]');if(chip)chooseCity(chip.dataset.santanderMunicipio)});
    q('santanderMunicipiosChips').addEventListener('click',event=>{const chip=event.target.closest('[data-santander-municipio]');if(chip)chooseCity(chip.dataset.santanderMunicipio)});
    ['santanderLeadersMunicipio','santanderLeadersGroup'].forEach(id=>q(id).addEventListener('change',renderLeadersSummary));
    q('santanderLeadersPuestoSearch').addEventListener('input',renderLeadersSummary);
    document.addEventListener('click',event=>{
      const person=event.target.closest('[data-santander-person]');
      if(person){const p=activePeople().find(p=>p.id===person.dataset.santanderPerson);if(p&&typeof window.editLeader==='function')window.editLeader(p.id)}
      const city=event.target.closest('[data-santander-go]');
      if(city&&canonical(city.dataset.santanderGo)){if(typeof showView==='function')showView('map');document.querySelector('[data-map-tab="santander"]')?.click();chooseCity(city.dataset.santanderGo)}
    });
    const render=()=>{updateMapStats();updateLeaderCounters();renderLeadersSummary();renderCityDirectory();renderMapDetail();renderMapDots()};
    window.addEventListener('matriz:contacts-updated',render);
    window.addEventListener('storage',render);
    render();
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
