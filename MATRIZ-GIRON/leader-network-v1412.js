/* Red territorial · v1.4.12 — Relación explícita líder / simpatizantes.
   Usa los mismos registros db.leaders y parentLeaderId; no duplica contactos ni infiere relaciones. */
(() => {
  'use strict';
  let currentLeaderId='';
  let mode='view';
  let selected=new Set();
  const q=id=>document.getElementById(id);
  const safe=v=>esc(v??'');
  const allLeaders=()=>db.leaders.filter(x=>x.contactType==='Líder');
  const allSupporters=()=>db.leaders.filter(x=>x.contactType==='Simpatizante');
  const activeLeaderFor=(x)=>allLeaders().find(l=>l.id===x.parentLeaderId);
  const listFor=id=>allSupporters().filter(x=>x.parentLeaderId===id);
  const order=(a,b)=>String(a.name||'').localeCompare(String(b.name||''),'es');

  window.renderLeaderRosterPanel=(leaders=allLeaders(),supporters=allSupporters())=>{
    const panel=q('leaderRosterPanel');if(!panel)return;
    const term=q('leaderRosterSearch')?.value||'';
    const missing=supporters.filter(x=>!leaders.some(l=>l.id===x.parentLeaderId));
    const cards=leaders.slice().sort(order).map(l=>{
      const children=supporters.filter(x=>x.parentLeaderId===l.id).sort(order);
      const first=children.slice(0,3).map(x=>safe(x.name)).join(' · ');
      return `<article class="leader-roster-card" data-roster-search="${safe([l.name,l.territory,l.barrio,l.organization,children.map(x=>x.name).join(' ')].join(' ').toLowerCase())}">
        <div class="leader-roster-card-top"><div class="leader-roster-person"><strong>${safe(l.name||'Sin nombre')}</strong><small>${safe(l.barrio||l.territory||'Territorio sin registrar')}</small></div><div class="leader-roster-count"><strong>${children.length}</strong><small>simpatizante${children.length===1?'':'s'}</small></div></div>
        <p class="leader-roster-names">${children.length?safe(first)+(children.length>3?' · …':''):'Todavía no tiene simpatizantes vinculados.'}</p>
        <div class="leader-roster-actions"><button type="button" onclick="openLeaderNetwork('${safe(l.id)}','view')">👥 Ver nombres</button><button type="button" onclick="openLeaderNetwork('${safe(l.id)}','assign')">＋ Vincular</button></div>
      </article>`;
    }).join('');
    panel.innerHTML=`<div class="leader-roster-header"><div><h3>👥 Simpatizantes de cada líder</h3><p>Consulte cuántos tiene cada líder y quiénes están vinculados. Puede relacionar contactos existentes sin registrarlos nuevamente.</p></div><label>🔎 Buscar líder o simpatizante<input id="leaderRosterSearch" type="search" placeholder="Escriba un nombre o territorio..." oninput="filterLeaderRoster(this.value)" value="${safe(term)}"></label></div>
    <div class="leader-roster-pending" role="status"><strong>${missing.length}</strong> simpatizante${missing.length===1?'':'s'} sin líder asignado. ${missing.length?'Vincúlelos desde el botón ＋ Vincular de cada líder.':'Todos los simpatizantes están asociados a un líder.'}</div>
    <div class="leader-roster-grid" id="leaderRosterGrid">${cards||'<p class="leader-roster-empty">No hay líderes clasificados todavía. Clasifique primero un contacto como Líder.</p>'}</div>`;
    filterLeaderRoster(term);
  };
  window.filterLeaderRoster=(value='')=>{
    const needle=String(value).toLocaleLowerCase('es').trim();
    q('leaderRosterGrid')?.querySelectorAll('.leader-roster-card').forEach(card=>{
      card.hidden=Boolean(needle&&!card.dataset.rosterSearch.includes(needle));
    });
  };
  window.openLeaderNetwork=(id,requestedMode='view')=>{
    const leader=allLeaders().find(x=>x.id===id);
    if(!leader){toast('Seleccione un líder clasificado');return;}
    currentLeaderId=leader.id;selected=new Set();
    q('leaderNetworkSearch').value='';
    q('leaderNetworkModal').classList.add('open');
    switchLeaderNetworkMode(requestedMode);
  };
  window.closeLeaderNetwork=()=>{q('leaderNetworkModal')?.classList.remove('open');selected=new Set();};
  window.switchLeaderNetworkMode=next=>{
    mode=next==='assign'?'assign':'view';
    q('leaderNetworkViewBtn').classList.toggle('active',mode==='view');
    q('leaderNetworkAssignBtn').classList.toggle('active',mode==='assign');
    q('leaderNetworkAssignTools').classList.toggle('hidden',mode!=='assign');
    renderLeaderNetworkModal();
  };
  window.renderLeaderNetworkModal=()=>{
    const leader=allLeaders().find(x=>x.id===currentLeaderId);if(!leader)return;
    const current=listFor(leader.id).slice().sort(order);
    q('leaderNetworkTitle').textContent=`Simpatizantes de ${leader.name||'líder'}`;
    q('leaderNetworkSubtitle').textContent=`${current.length} simpatizante${current.length===1?'':'s'} vinculado${current.length===1?'':'s'} · ${leader.barrio||leader.territory||'Sin territorio'}`;
    const term=String(q('leaderNetworkSearch')?.value||'').toLocaleLowerCase('es').trim();
    const matches=x=>[x.name,x.barrio,x.territory,x.whatsapp,x.phone].join(' ').toLocaleLowerCase('es').includes(term);
    const list=q('leaderNetworkList');
    if(mode==='view'){
      const visible=current.filter(matches);
      list.innerHTML=visible.map(person=>`<div class="leader-network-person"><div><strong>${safe(person.name)}</strong><small>${safe(person.barrio||person.territory||'Sin territorio')} · WhatsApp: ${safe(person.whatsapp||person.phone||'No registrado')}</small></div><button type="button" class="secondary" onclick="editLeaderNetworkSupporter('${safe(person.id)}')">Cambiar líder</button></div>`).join('')||'<p class="leader-roster-empty">No hay simpatizantes que coincidan con esta búsqueda.</p>';
    }else{
      // Solo los simpatizantes sin líder activo, para no reasignar accidentalmente a los de otra persona.
      const available=allSupporters().filter(x=>!activeLeaderFor(x)).sort(order).filter(matches);
      list.innerHTML='<p class="leader-network-tip">Marque los simpatizantes que desea vincular con este líder. Aquí solo aparecen contactos sin líder asignado.</p>'+available.map(person=>`<label class="leader-network-available"><input type="checkbox" value="${safe(person.id)}" ${selected.has(person.id)?'checked':''} onchange="toggleLeaderNetworkSelection('${safe(person.id)}',this.checked)"><span><strong>${safe(person.name)}</strong><small>${safe(person.barrio||person.territory||'Sin territorio')} · ${safe(person.whatsapp||person.phone||'Sin teléfono')}</small></span></label>`).join('')+(available.length?'':'<p class="leader-roster-empty">No hay simpatizantes sin líder que coincidan con esta búsqueda. Puede registrar uno nuevo.</p>');
      q('leaderNetworkAssignCount').textContent=`${selected.size} seleccionado${selected.size===1?'':'s'}`;
    }
  };
  window.toggleLeaderNetworkSelection=(id,checked)=>{
    if(checked)selected.add(id);else selected.delete(id);
    q('leaderNetworkAssignCount').textContent=`${selected.size} seleccionado${selected.size===1?'':'s'}`;
  };
  window.saveLeaderNetworkLinks=()=>{
    const leader=allLeaders().find(x=>x.id===currentLeaderId);
    if(!leader){toast('Líder no encontrado');return;}
    const eligible=allSupporters().filter(s=>selected.has(s.id)&&!activeLeaderFor(s));
    if(!eligible.length){toast('Seleccione simpatizantes sin líder asignado');return;}
    eligible.forEach(person=>{person.parentLeaderId=leader.id;person.leaderLinkedAt=new Date().toISOString()});
    selected.clear();saveDB();
    q('leaderNetworkSearch').value='';
    switchLeaderNetworkMode('view');
    toast(`${eligible.length} simpatizante(s) vinculados a ${leader.name}`);
  };
  window.editLeaderNetworkSupporter=(id)=>{
    closeLeaderNetwork();openContactClassification(id,'Simpatizante');
  };
  window.openNewSupporterUnderLeader=()=>{
    const leader=allLeaders().find(x=>x.id===currentLeaderId);
    if(!leader){toast('Líder no encontrado');return;}
    closeLeaderNetwork();
    const f=q('leaderForm');f.reset();f.elements.id.value='';
    f.elements.contactType.value='Simpatizante';
    f.elements.communicationsConsent.value='Pendiente';
    f.elements.preferredChannel.value='WhatsApp';
    openModal('leaderModal');toggleParentLeaderField();
    f.elements.parentLeaderId.value=leader.id;
  };
  // app.js llama init() antes de cargar este módulo; pintar panel inmediatamente.
  if(typeof renderLeaders==='function')renderLeaders();
})();
