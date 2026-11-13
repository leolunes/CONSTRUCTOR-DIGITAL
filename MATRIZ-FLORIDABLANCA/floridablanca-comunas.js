/* Módulo adicional del clon: ocho comunas y registro de comuna por ficha.
   Los puntos son etiquetas orientativas, NO polígonos catastrales. */
(()=>{
  'use strict';
  const names=window.FLORIDABLANCA_TERRITORIO?.COMUNAS||[];
  const pins=[
    [1,72,74],[2,44,78],[3,64,67],[4,46,19],
    [5,33,52],[6,57,56],[7,47,42],[8,63,43]
  ];
  const id=x=>document.getElementById(x);
  const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase();
  const dbNow=()=>typeof db!=='undefined'?db:{leaders:[],needs:[],projects:[],actions:[]};
  let selected='';

  function readComuna(record){
    const c=normalize(record?.comuna);
    if(names.includes(c))return c;
    const z=normalize(record?.zone);
    return names.includes(z)?z:'';
  }
  function recordsFor(comuna){
    const data=dbNow();
    const leaders=(data.leaders||[]).filter(x=>readComuna(x)===comuna);
    const needs=(data.needs||[]).filter(x=>readComuna(x)===comuna);
    const needIds=new Set(needs.map(x=>x.id));
    const projects=(data.projects||[]).filter(x=>readComuna(x)===comuna||needIds.has(x.needId));
    const projectIds=new Set(projects.map(x=>x.id));
    const actions=(data.actions||[]).filter(x=>readComuna(x)===comuna||needIds.has(x.needId)||projectIds.has(x.projectId));
    return {leaders,needs,projects,actions};
  }
  function show(comuna){
    selected=comuna;
    const p=id('floriComunaPanel');if(!p)return;
    const r=recordsFor(comuna),authorized=r.leaders.filter(x=>x.communicationsConsent==='Sí');
    const entries=(arr,fn)=>arr.length?arr.map(fn).join(''):'<div class="territory-none">Aún no hay registros asociados.</div>';
    p.innerHTML=`<div class="territory-panel-head"><h3>📍 ${safe(comuna)}</h3><p>Información de las fichas que tienen esta comuna asignada.</p></div>
      <div class="territory-mini-kpis"><div class="territory-mini-kpi"><strong>${authorized.length}</strong><span>Contactos autorizados</span></div><div class="territory-mini-kpi"><strong>${r.needs.length}</strong><span>Necesidades</span></div><div class="territory-mini-kpi"><strong>${r.projects.length}</strong><span>Proyectos</span></div><div class="territory-mini-kpi"><strong>${r.actions.length}</strong><span>Gestiones</span></div></div>
      <div class="territory-block"><h4>👥 Contactos autorizados</h4>${entries(authorized,x=>`<div class="territory-row"><strong>${safe(x.name)}</strong><small>${safe(x.barrio||x.territory||'Sin barrio')} · ${safe(x.role||x.contactType||'')}</small></div>`)}</div>
      <div class="territory-block"><h4>◆ Necesidades</h4>${entries(r.needs,x=>`<div class="territory-row"><strong>${safe(x.code||'')} · ${safe(x.title)}</strong><small>${safe(x.barrio||x.territory)} · ${safe(x.status)}</small></div>`)}</div>
      <div class="territory-block"><h4>▣ Proyectos</h4>${entries(r.projects,x=>`<div class="territory-row"><strong>${safe(x.name)}</strong><small>${safe(x.status||'')}</small></div>`)}</div>
      <div class="map-source-note">Conteos según la comuna indicada en cada registro. No se infiere la comuna desde la imagen.</div>`;
    document.querySelectorAll('#floriComunaHotspots .map-hotspot').forEach(x=>x.classList.toggle('active',x.dataset.comuna===comuna));
  }
  function renderPins(){
    const host=id('floriComunaHotspots');if(!host)return;
    host.innerHTML=pins.map(([num,x,y])=>{
      const name=`COMUNA ${num}`,count=recordsFor(name).leaders.filter(r=>r.communicationsConsent==='Sí').length;
      return `<button type="button" class="map-hotspot" data-comuna="${name}" style="left:${x}%;top:${y}%" aria-label="Consultar ${name}: ${count} contactos autorizados" title="${name} · ${count} contactos autorizados"><span>${num}</span><span class="map-hotspot-count">${count}</span></button>`;
    }).join('');
    host.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>show(btn.dataset.comuna)));
  }
  function init(){
    document.querySelectorAll('.flori-comuna-select').forEach(s=>{
      const previous=s.value;
      s.innerHTML='<option value="">Sin comuna asignada</option>'+names.map(c=>`<option value="${c}">${c}</option>`).join('');
      if(previous)s.value=previous;
    });
    renderPins();
    window.addEventListener('matriz:contacts-updated',()=>{renderPins();if(selected)show(selected)});
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
