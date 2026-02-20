function page(){
  const p = location.pathname.split("/").pop().toLowerCase();
  return p || "index.html";
}

function initPWA(){
  if(!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("pwa/sw.js").catch(()=>{});
  });
}

/* =========================
   Tabs (Detalle obra)
   ========================= */
function bindTabsIfPresent(){
  const tabs = Array.from(document.querySelectorAll("[data-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));
  if(!tabs.length || !panels.length) return;

  function activate(key){
    tabs.forEach(t => t.classList.toggle("active", t.getAttribute("data-tab")===key));
    panels.forEach(p => p.style.display = (p.getAttribute("data-panel")===key) ? "" : "none");
  }

  tabs.forEach(t => t.addEventListener("click", (e)=>{
    e.preventDefault();
    activate(t.getAttribute("data-tab"));
  }));

  const tab = UI.getParam("tab");
  activate(tab || tabs[0].getAttribute("data-tab"));
}

/* =========================
   Helpers
   ========================= */
function semaforoFromAbiertos(n){
  if(n >= 3) return UI.chipStatus("ROJO","bad");
  if(n >= 1) return UI.chipStatus("AMARILLO","warn");
  return UI.chipStatus("VERDE","ok");
}

function estadoChip(estado){
  const st = (estado||"activa").toUpperCase();
  if(st==="ACTIVA") return UI.chipStatus("ACTIVA","ok");
  if(st==="SUSPENDIDA") return UI.chipStatus("SUSPENDIDA","warn");
  return UI.chipStatus("TERMINADA");
}

/* =========================
   OBRAS PAGE (wizard + tabla + editar)
   ========================= */
function renderKpisGlobal(){
  const k = StorageAPI.kpisGlobales();
  const el = UI.qs("#kpis");
  if(!el) return;
  el.innerHTML = `
    <div class="card item"><div class="topline"><div class="name">Obras activas</div><div class="chips">${UI.chipStatus(String(k.obrasActivas),"ok")}</div></div><div class="muted small">En estado “activa”.</div></div>
    <div class="card item"><div class="topline"><div class="name">Total visitas</div><div class="chips">${UI.chipStatus(String(k.totalVisitas))}</div></div><div class="muted small">Registradas en el dispositivo.</div></div>
    <div class="card item"><div class="topline"><div class="name">Hallazgos abiertos</div><div class="chips">${UI.chipStatus(String(k.abiertos),"warn")}</div></div><div class="muted small">Pendientes de cierre.</div></div>
    <div class="card item"><div class="topline"><div class="name">Hallazgos cerrados</div><div class="chips">${UI.chipStatus(String(k.cerrados),"ok")}</div></div><div class="muted small">Con fecha y evidencias.</div></div>
  `;
}

// Wizard state
const Wizard = {
  step: 1,
  docsObra: [],  // File[]
  docsInter: [], // File[]
  editObraId: null
};

function setStep(n){
  Wizard.step = n;
  document.querySelectorAll(".stepbtn").forEach(b=>{
    b.classList.toggle("active", Number(b.getAttribute("data-step"))===n);
  });
  document.querySelectorAll("[data-step-panel]").forEach(p=>{
    p.style.display = (Number(p.getAttribute("data-step-panel"))===n) ? "" : "none";
  });
}

function renderDocsTable(files, tableId, hintId){
  const table = UI.qs(tableId);
  const hint = UI.qs(hintId);
  if(!table) return;

  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";

  if(!files.length){
    if(hint) hint.style.display = "";
    return;
  }
  if(hint) hint.style.display = "none";

  files.forEach((f, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${UI.esc(f.name)}</td>
      <td>${UI.esc(f.type || "application/octet-stream")}</td>
      <td>${UI.esc(UI.fmtBytes(f.size || 0))}</td>
      <td>${new Date().toLocaleDateString()}</td>
      <td><button class="btn danger" type="button" data-remove="${idx}">Eliminar</button></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("[data-remove]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const i = Number(btn.getAttribute("data-remove"));
      files.splice(i,1);
      renderDocsTable(files, tableId, hintId);
    });
  });
}

function fillEditMode(obra){
  const hint = UI.qs("#wizardModeHint");
  if(hint){
    hint.textContent = `EDITANDO: ${obra.nombre} (Contrato ${obra.contrato}). Presiona GUARDAR / ACTUALIZAR para aplicar cambios.`;
  }

  const f1 = UI.qs("#formStep1");
  if(f1){
    f1.nombre.value = obra.nombre || "";
    f1.contrato.value = obra.contrato || "";
    f1.objeto.value = obra.objeto || "";
    f1.ubicacion.value = obra.ubicacion || "";
    f1.contratista.value = obra.contratista || "";
    f1.estado.value = obra.estado || "activa";
    f1.secopUrl.value = obra.secopUrl || "";
    f1.fechaInicio.value = obra.fechaInicio || "";
    f1.fechaFin.value = obra.fechaFin || "";
    f1.valorContratoObra.value = obra.valorContratoObra || "";
    f1.monedaContratoObra.value = obra.monedaContratoObra || "COP";
  }

  const f2 = UI.qs("#formStep2");
  if(f2){
    f2.interventoria.value = obra.interventoria || "";
    f2.contratoInterventoria.value = obra.contratoInterventoria || "";
    f2.valorContratoInterventoria.value = obra.valorContratoInterventoria || "";
    f2.monedaContratoInterventoria.value = obra.monedaContratoInterventoria || "COP";
  }

  const f3 = UI.qs("#formStep3");
  if(f3){
    const sup = obra.supervision?.supervisor || {};
    const apo = obra.supervision?.apoyo || {};
    f3.sup_nombre.value = sup.nombre || "";
    f3.sup_cargo.value = sup.cargo || "";
    f3.sup_profesion.value = sup.profesion || "";
    f3.apo_nombre.value = apo.nombre || "";
    f3.apo_profesion.value = apo.profesion || "";
    f3.apo_cps.value = apo.cps || "";
    f3.apo_inicio.value = apo.inicio || "";
    f3.apo_fin.value = apo.fin || "";
  }
}

function resetWizardToCreate(){
  Wizard.editObraId = null;
  const hint = UI.qs("#wizardModeHint");
  if(hint) hint.textContent = "Completa 1.1 → 1.2 → 1.3. Luego guarda la obra.";
  UI.qs("#formStep1")?.reset();
  UI.qs("#formStep2")?.reset();
  UI.qs("#formStep3")?.reset();
  Wizard.docsObra = [];
  Wizard.docsInter = [];
  renderDocsTable(Wizard.docsObra, "#tablaDocsObra", "#docsObraHint");
  renderDocsTable(Wizard.docsInter, "#tablaDocsInter", "#docsInterHint");
  setStep(1);

  const url = new URL(location.href);
  url.searchParams.delete("editObraId");
  history.replaceState({}, "", url.toString());
}

function renderObrasTable(){
  const tbody = UI.qs("#listaObras");
  const empty = UI.qs("#obrasEmpty");
  if(!tbody) return;

  const term = (UI.qs("#searchObra")?.value || "").toLowerCase().trim();
  const selectedEstado = UI.qs(".pill.active")?.getAttribute("data-estado") || "todas";

  let obras = StorageAPI.listObras();
  if(selectedEstado !== "todas"){
    obras = obras.filter(o => (o.estado||"activa") === selectedEstado);
  }
  if(term){
    obras = obras.filter(o => (`${o.nombre} ${o.contrato} ${o.ubicacion} ${o.contratista} ${o.interventoria}`).toLowerCase().includes(term));
  }

  if(!obras.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  tbody.innerHTML = obras.map(o => {
    const k = StorageAPI.kpisObra(o.id);
    const sem = semaforoFromAbiertos(k.abiertos);

    let av = 0;
    try{
      if(window.Crono && typeof Crono.calcAvance === "function"){
        av = Math.round(Crono.calcAvance(o.cronograma || []).avance || 0);
      }
    }catch(_){ av = 0; }

    const bar = `<div class="bar" style="margin-top:0"><div class="bar__fill" style="width:${av}%"></div></div>`;

    return `
      <tr>
        <td>${UI.esc(o.nombre)}</td>
        <td>${UI.esc(o.contrato)}</td>
        <td>${UI.esc(o.ubicacion)}</td>
        <td>${estadoChip(o.estado)}</td>
        <td><b>${av}%</b></td>
        <td style="min-width:180px">${bar}</td>
        <td>${sem}</td>
        <td class="row" style="gap:8px">
          <a class="btn" href="obras-detalle.html?obraId=${encodeURIComponent(o.id)}">Ver detalle</a>
          <a class="btn primary" href="visita-nueva.html?obraId=${encodeURIComponent(o.id)}">+ Nueva visita</a>
          <a class="btn" href="obras.html?editObraId=${encodeURIComponent(o.id)}">Editar</a>
        </td>
      </tr>
    `;
  }).join("");
}

function bindObrasPage(){
  document.querySelectorAll(".stepbtn").forEach(b=>{
    b.addEventListener("click", ()=> setStep(Number(b.getAttribute("data-step"))));
  });
  setStep(1);

  UI.qs("#docsObraInput")?.addEventListener("change", (e)=>{
    const arr = Array.from(e.target.files || []);
    Wizard.docsObra.push(...arr);
    renderDocsTable(Wizard.docsObra, "#tablaDocsObra", "#docsObraHint");
    e.target.value = "";
  });

  UI.qs("#docsInterInput")?.addEventListener("change", (e)=>{
    const arr = Array.from(e.target.files || []);
    Wizard.docsInter.push(...arr);
    renderDocsTable(Wizard.docsInter, "#tablaDocsInter", "#docsInterHint");
    e.target.value = "";
  });

  document.querySelectorAll(".pill").forEach(p=>{
    p.addEventListener("click", ()=>{
      document.querySelectorAll(".pill").forEach(x=>x.classList.remove("active"));
      p.classList.add("active");
      renderObrasTable();
    });
  });

  UI.qs("#searchObra")?.addEventListener("input", renderObrasTable);

  UI.qs("#btnExport")?.addEventListener("click", () => {
    const { url, filename } = StorageAPI.exportBackup();
    UI.downloadBlobUrl(url, filename);
  });

  UI.qs("#fileImport")?.addEventListener("change", async (e) => {
    const f = e.target.files?.[0];
    if(!f) return;
    try{
      await StorageAPI.importBackupFromFile(f);
      alert("Backup importado. Se recargará la página.");
      location.reload();
    } catch(err){
      alert("Error importando backup: " + err.message);
    } finally {
      e.target.value = "";
    }
  });

  UI.qs("#btnReset")?.addEventListener("click", async () => {
    if(!confirm("¿Borrar TODO? (obras, visitas, hallazgos, evidencias y documentos)")) return;

    const db = StorageAPI.loadStore();
    for(const o of db.obras) await DB.deleteFilesByOwner("obra", o.id).catch(()=>{});
    for(const v of db.visitas) await DB.deleteFilesByOwner("visita", v.id).catch(()=>{});
    for(const h of db.hallazgos) await DB.deleteFilesByOwner("hallazgo", h.id).catch(()=>{});

    StorageAPI.resetAll();
    alert("Listo. Se recargará.");
    location.reload();
  });

  const editObraId = UI.getParam("editObraId");
  if(editObraId){
    const obra = StorageAPI.getObraById(editObraId);
    if(obra){
      Wizard.editObraId = editObraId;
      fillEditMode(obra);
    } else {
      alert("No se encontró la obra a editar.");
      resetWizardToCreate();
    }
  }

  UI.qs("#btnGuardarObra")?.addEventListener("click", async () => {
    const f1 = UI.qs("#formStep1");
    const f2 = UI.qs("#formStep2");
    const f3 = UI.qs("#formStep3");
    if(!f1?.reportValidity() || !f2?.reportValidity() || !f3?.reportValidity()) return;

    const obraBase = Object.fromEntries(new FormData(f1).entries());
    const inter = Object.fromEntries(new FormData(f2).entries());
    const sup = Object.fromEntries(new FormData(f3).entries());

    const MAX_FILE = 25 * 1024 * 1024;
    const MAX_TOTAL = 200 * 1024 * 1024;
    const allNewFiles = [...Wizard.docsObra, ...Wizard.docsInter];
    const tooBig = allNewFiles.find(f => (f.size||0) > MAX_FILE);
    if(tooBig){ alert(`Archivo demasiado grande (>25MB): ${tooBig.name}`); return; }
    const totalBytes = allNewFiles.reduce((a,f)=>a+(f.size||0),0);
    if(totalBytes > MAX_TOTAL){ alert("La suma de adjuntos nuevos supera ~200MB."); return; }

    const supervisionPack = {
      supervisor: { nombre: sup.sup_nombre, cargo: sup.sup_cargo, profesion: sup.sup_profesion },
      apoyo: { nombre: sup.apo_nombre, profesion: sup.apo_profesion, cps: sup.apo_cps, inicio: sup.apo_inicio, fin: sup.apo_fin }
    };

    if(!Wizard.editObraId){
      const obra = StorageAPI.createObra({
        ...obraBase,
        ...inter,
        interventoria: inter.interventoria,
        contratoInterventoria: inter.contratoInterventoria || "",
        valorContratoObra: obraBase.valorContratoObra || "",
        monedaContratoObra: obraBase.monedaContratoObra || "COP",
        valorContratoInterventoria: inter.valorContratoInterventoria || "",
        monedaContratoInterventoria: inter.monedaContratoInterventoria || "COP",
        supervision: supervisionPack,
        documentos: { obra: [], interventoria: [] },
        cronograma: []
      });

      for(const file of Wizard.docsObra){
        await DB.putFile({
          ownerType: "obra",
          ownerId: obra.id,
          kind: "doc_obra",
          name: file.name,
          mime: file.type || "application/octet-stream",
          size: file.size || 0,
          blob: file
        });
      }
      for(const file of Wizard.docsInter){
        await DB.putFile({
          ownerType: "obra",
          ownerId: obra.id,
          kind: "doc_interventoria",
          name: file.name,
          mime: file.type || "application/octet-stream",
          size: file.size || 0,
          blob: file
        });
      }

      const all = await DB.listFilesByOwner("obra", obra.id);
      StorageAPI.updateObra(obra.id, {
        documentos: {
          obra: all.filter(x=>x.kind==="doc_obra"),
          interventoria: all.filter(x=>x.kind==="doc_interventoria")
        }
      });

      alert("Obra creada. Documentos guardados (ver en Detalle → Documentos).");
      resetWizardToCreate();
      renderKpisGlobal();
      renderObrasTable();
      return;
    }

    const obraId = Wizard.editObraId;
    const cur = StorageAPI.getObraById(obraId);
    if(!cur){ alert("No se encontró la obra a editar."); return; }

    for(const file of Wizard.docsObra){
      await DB.putFile({
        ownerType: "obra",
        ownerId: obraId,
        kind: "doc_obra",
        name: file.name,
        mime: file.type || "application/octet-stream",
        size: file.size || 0,
        blob: file
      });
    }
    for(const file of Wizard.docsInter){
      await DB.putFile({
        ownerType: "obra",
        ownerId: obraId,
        kind: "doc_interventoria",
        name: file.name,
        mime: file.type || "application/octet-stream",
        size: file.size || 0,
        blob: file
      });
    }

    const all = await DB.listFilesByOwner("obra", obraId);
    StorageAPI.updateObra(obraId, {
      ...obraBase,
      ...inter,
      interventoria: inter.interventoria,
      contratoInterventoria: inter.contratoInterventoria || "",
      valorContratoObra: obraBase.valorContratoObra || "",
      monedaContratoObra: obraBase.monedaContratoObra || "COP",
      valorContratoInterventoria: inter.valorContratoInterventoria || "",
      monedaContratoInterventoria: inter.monedaContratoInterventoria || "COP",
      supervision: supervisionPack,
      documentos: {
        obra: all.filter(x=>x.kind==="doc_obra"),
        interventoria: all.filter(x=>x.kind==="doc_interventoria")
      }
    });

    alert("Obra actualizada.");
    resetWizardToCreate();
    renderKpisGlobal();
    renderObrasTable();
  });

  UI.qs("#btnNuevaObra")?.addEventListener("click", () => {
    if(!confirm("¿Limpiar el asistente para crear una nueva obra?")) return;
    resetWizardToCreate();
  });

  renderDocsTable(Wizard.docsObra, "#tablaDocsObra", "#docsObraHint");
  renderDocsTable(Wizard.docsInter, "#tablaDocsInter", "#docsInterHint");

  renderKpisGlobal();
  renderObrasTable();
}

/* =========================
   DETALLE OBRA
   (✅ aquí arreglamos Acciones + Cronograma sin tocar lo demás)
   ========================= */
function bindObraDetallePage(){
  const obraId = UI.getParam("obraId");
  const obra = StorageAPI.getObraById(obraId);
  if(!obra){ alert("Obra no encontrada."); location.href="obras.html"; return; }

  UI.qs("#obraSub") && (UI.qs("#obraSub").textContent = `${obra.nombre} · Contrato ${obra.contrato}`);
  UI.qs("#btnNuevaVisita") && (UI.qs("#btnNuevaVisita").href = `visita-nueva.html?obraId=${encodeURIComponent(obraId)}`);

  const secopHref = (obra.secopUrl && obra.secopUrl.trim()) ? obra.secopUrl.trim() : "https://www.colombiacompra.gov.co/secop-ii";
  const btnSecop = UI.qs("#btnSecop");
  if(btnSecop) btnSecop.href = secopHref;

  // Resumen card
  const obraCard = UI.qs("#obraCard");
  if(obraCard){
    obraCard.innerHTML = `
      <div class="cardhead">
        <h2>${UI.esc(obra.nombre)}</h2>
        <p class="muted">Contrato: ${UI.esc(obra.contrato)} · Estado: ${(obra.estado||"activa").toUpperCase()}</p>
      </div>
      <div class="grid two">
        <div class="item"><div class="name">Ubicación</div><div class="muted small">${UI.esc(obra.ubicacion||"-")}</div></div>
        <div class="item"><div class="name">Objeto</div><div class="muted small" style="white-space:pre-wrap">${UI.esc(obra.objeto||"-")}</div></div>
        <div class="item"><div class="name">Contratista</div><div class="muted small">${UI.esc(obra.contratista||"-")}</div></div>
        <div class="item"><div class="name">Interventoría</div><div class="muted small">${UI.esc(obra.interventoria||"-")}</div></div>
      </div>
    `;
  }

  // KPIs
  const k = StorageAPI.kpisObra(obraId);
  const kEl = UI.qs("#obraKpis");
  if(kEl){
    kEl.innerHTML = `
      <div class="card item"><div class="name">Visitas</div><div class="chips">${UI.chipStatus(String(k.visitas))}</div></div>
      <div class="card item"><div class="name">Hallazgos abiertos</div><div class="chips">${UI.chipStatus(String(k.abiertos),"warn")}</div></div>
      <div class="card item"><div class="name">Hallazgos cerrados</div><div class="chips">${UI.chipStatus(String(k.cerrados),"ok")}</div></div>
      <div class="card item"><div class="name">Semáforo</div><div class="chips">${semaforoFromAbiertos(k.abiertos)}</div></div>
    `;
  }

  /* ====== AVANCE RESUMEN (si hay Crono.js, lo usa) ====== */
  function updateAvanceResumen(){
    let pct = 0;
    try{
      if(window.Crono?.calcAvance){
        pct = Math.round(Crono.calcAvance(StorageAPI.getObraById(obraId)?.cronograma || []).avance || 0);
      }
    }catch(_){ pct = 0; }

    if(UI.qs("#avanceLabel")) UI.qs("#avanceLabel").textContent = `${pct}%`;
    if(UI.qs("#avanceBar")) UI.qs("#avanceBar").style.width = `${pct}%`;
    if(UI.qs("#avanceCronoLabel")) UI.qs("#avanceCronoLabel").textContent = `${pct}%`;
    if(UI.qs("#avanceCronoBar")) UI.qs("#avanceCronoBar").style.width = `${pct}%`;
  }
  updateAvanceResumen();

  /* =========================
     CRONOGRAMA (✅ arregla + Agregar actividad)
     ========================= */
  function normalizeAct(a){
    const id = a?.id || StorageAPI.uid("act");
    const nombre = (a?.nombre || "").trim();
    const inicio = a?.inicio || "";
    const fin = a?.fin || "";
    const peso = Number(a?.peso || 0) || 0;
    const estado = a?.estado || "no_iniciada";
    const pct = Number(a?.pct || 0) || 0;
    return { id, nombre, inicio, fin, peso, estado, pct };
  }

  function calcPctAct(a){
    if(a.estado === "terminada") return 100;
    if(a.estado === "en_proceso") return Math.max(0, Math.min(100, Number(a.pct || 0)));
    return 0;
  }

  function calcAvanceLocal(acts){
    try{
      if(window.Crono?.calcAvance) return Crono.calcAvance(acts);
    }catch(_){}
    const pesoTotal = acts.reduce((s,a)=>s + (Number(a.peso||0) || 0), 0);
    if(!pesoTotal) return { avance: 0, pesoTotal: 0 };
    const suma = acts.reduce((s,a)=> s + ((Number(a.peso||0)||0) * (calcPctAct(a)/100)), 0);
    return { avance: (suma / pesoTotal) * 100, pesoTotal };
  }

  function renderCronograma(){
    const tbody = UI.qs("#listaCrono");
    const empty = UI.qs("#cronoEmpty");
    if(!tbody) return;

    const obraNow = StorageAPI.getObraById(obraId);
    const acts = (obraNow.cronograma || []).map(normalizeAct);

    tbody.innerHTML = "";

    if(!acts.length){
      if(empty) empty.style.display = "";
    }else{
      if(empty) empty.style.display = "none";
    }

    for(const a of acts){
      const pctAct = calcPctAct(a);
      const bar = `
        <div class="bar" style="margin-top:0; position:relative; height:14px">
          <div class="bar__fill" style="width:${pctAct}%; height:100%"></div>
        </div>
      `;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${UI.esc(a.nombre)}</td>
        <td>${UI.esc(a.inicio)}</td>
        <td>${UI.esc(a.fin)}</td>
        <td>${UI.esc(String(a.peso||0))}%</td>
        <td>${UI.esc(a.estado.replace("_"," "))}</td>
        <td>${UI.esc(String(pctAct))}%</td>
        <td style="min-width:220px">${bar}</td>
        <td class="row" style="gap:8px">
          <button class="btn" type="button" data-edit="${a.id}">Editar</button>
          <button class="btn danger" type="button" data-del="${a.id}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    }

    StorageAPI.updateObra(obraId, { cronograma: acts });

    const { avance, pesoTotal } = calcAvanceLocal(acts);
    if(UI.qs("#pesoTotalLabel")) UI.qs("#pesoTotalLabel").textContent = `${Math.round(pesoTotal || 0)}%`;
    if(UI.qs("#avanceCronoLabel")) UI.qs("#avanceCronoLabel").textContent = `${Math.round(avance || 0)}%`;
    if(UI.qs("#avanceCronoBar")) UI.qs("#avanceCronoBar").style.width = `${Math.round(avance || 0)}%`;

    updateAvanceResumen();

    tbody.querySelectorAll("[data-del]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const id = btn.getAttribute("data-del");
        const cur = StorageAPI.getObraById(obraId);
        const next = (cur.cronograma||[]).filter(x=>x.id!==id);
        StorageAPI.updateObra(obraId, { cronograma: next });
        renderCronograma();
      });
    });

    tbody.querySelectorAll("[data-edit]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const id = btn.getAttribute("data-edit");
        const cur = StorageAPI.getObraById(obraId);
        const a = (cur.cronograma||[]).find(x=>x.id===id);
        if(!a) return;

        const nombre = prompt("Actividad:", a.nombre || "") ?? a.nombre;
        const inicio = prompt("Fecha inicio (YYYY-MM-DD):", a.inicio || "") ?? a.inicio;
        const fin = prompt("Fecha fin (YYYY-MM-DD):", a.fin || "") ?? a.fin;
        const peso = Number(prompt("Peso %:", String(a.peso||0)) ?? a.peso);
        const estado = prompt("Estado (no_iniciada | en_proceso | terminada):", a.estado || "no_iniciada") ?? a.estado;
        const pct = estado==="en_proceso"
          ? Number(prompt("Porcentaje (0-100) si en_proceso:", String(a.pct||0)) ?? a.pct)
          : (estado==="terminada" ? 100 : 0);

        const next = (cur.cronograma||[]).map(x=> x.id===id ? normalizeAct({ ...x, nombre, inicio, fin, peso, estado, pct }) : x);
        StorageAPI.updateObra(obraId, { cronograma: next });
        renderCronograma();
      });
    });
  }

  UI.qs("#btnAddAct")?.addEventListener("click", ()=>{
    const nombre = prompt("Nombre de actividad:") || "";
    if(!nombre.trim()) return;

    const inicio = prompt("Fecha inicio (YYYY-MM-DD):") || "";
    const fin = prompt("Fecha fin (YYYY-MM-DD):") || "";
    const peso = Number(prompt("Peso % (ej 10):") || "0");
    const estado = prompt("Estado (no_iniciada | en_proceso | terminada):", "no_iniciada") || "no_iniciada";
    const pct = estado==="en_proceso" ? Number(prompt("Porcentaje (0-100):","0")||"0") : (estado==="terminada" ? 100 : 0);

    const cur = StorageAPI.getObraById(obraId);
    const next = [...(cur.cronograma||[]), normalizeAct({ nombre, inicio, fin, peso, estado, pct })];
    StorageAPI.updateObra(obraId, { cronograma: next });
    renderCronograma();
  });

  if(UI.qs("#listaCrono")) renderCronograma();

  /* ===== Visitas ===== */
  const vWrap = UI.qs("#listaVisitas");
  if(vWrap){
    const visitas = StorageAPI.listVisitasByObra(obraId);
    if(!visitas.length) vWrap.innerHTML = `<div class="item"><div class="muted">Sin visitas.</div></div>`;
    else vWrap.innerHTML = visitas.map(v => {
      const hs = StorageAPI.listHallazgosByObra(obraId).filter(h => h.visitaId === v.id);
      const abiertos = hs.filter(h => h.estado !== "cerrado").length;
      const sem = semaforoFromAbiertos(abiertos);
      return `
        <div class="item">
          <div class="topline">
            <div>
              <div class="name">${UI.esc(v.radicado)} — ${UI.esc(v.fecha)}</div>
              <div class="muted small">${UI.esc(v.objetivo||"")}</div>
            </div>
            <div class="chips">
              ${sem}
              <span class="chip">Hallazgos: ${hs.length}</span>
            </div>
          </div>
          <div class="row" style="margin-top:10px">
            <button class="btn primary" type="button" data-pdf="${UI.esc(v.id)}">Descargar PDF</button>
          </div>
        </div>
      `;
    }).join("");

    vWrap.querySelectorAll("[data-pdf]").forEach(btn=>{
      btn.addEventListener("click", async ()=>{
        if(!window.PDF?.exportVisitaPDF){
          alert("pdf.js no está cargado o no tiene exportVisitaPDF.");
          return;
        }
        const visitaId = btn.getAttribute("data-pdf");
        const visita = StorageAPI.getVisitaById(visitaId);
        const hs = StorageAPI.listHallazgosByObra(obraId).filter(h => h.visitaId === visitaId);

        await PDF.exportVisitaPDF({
          obra: StorageAPI.getObraById(obraId),
          visita,
          hallazgos: hs,
          returnBlob:false
        });
      });
    });
  }

  /* ===== Hallazgos ===== */
  const hWrap = UI.qs("#listaHallazgos");
  if(hWrap){
    const filter = UI.qs("#filterHallazgos");
    const search = UI.qs("#searchHallazgo");

    function renderHallazgos(){
      let hs = StorageAPI.listHallazgosByObra(obraId);
      const f = filter?.value || "todos";
      const term = (search?.value || "").toLowerCase().trim();

      if(f !== "todos") hs = hs.filter(h => h.estado === f);
      if(term) hs = hs.filter(h => (`${h.tipo} ${h.severidad} ${h.descripcion} ${h.responsable} ${h.accionRequerida}`).toLowerCase().includes(term));

      if(!hs.length){ hWrap.innerHTML = `<div class="item"><div class="muted">No hay hallazgos.</div></div>`; return; }

      hWrap.innerHTML = hs.map(h => `
        <div class="item">
          <div class="topline">
            <div>
              <div class="name">[${UI.esc(h.tipo)}] ${UI.esc(h.severidad)} — ${UI.esc(h.descripcion)}</div>
              <div class="muted small">Responsable: ${UI.esc(h.responsable)} · Límite: ${UI.esc(h.fechaLimite)}</div>
              <div class="muted small">Visita: ${UI.esc(h.radicado)}</div>
            </div>
            <div class="chips">${UI.statusFromHallazgo(h)}</div>
          </div>

          ${h.estado==="cerrado"
            ? `<div class="muted small" style="margin-top:10px">Cerrado: <b>${UI.esc(h.cerradoEn||"")}</b>${h.cierreObs?` · ${UI.esc(h.cierreObs)}`:""}</div>`
            : `<div class="row" style="margin-top:10px">
                <a class="btn primary" href="hallazgo-cerrar.html?obraId=${encodeURIComponent(obraId)}&hallazgoId=${encodeURIComponent(h.id)}">Cerrar</a>
              </div>`
          }
        </div>
      `).join("");
    }

    renderHallazgos();
    filter?.addEventListener("change", renderHallazgos);
    search?.addEventListener("input", renderHallazgos);
  }

  /* ===== Documentos (Detalle → Documentos) ===== */
  async function renderDocsDetalleFromIDB(){
    const t1 = UI.qs("#tablaDocsObraDetalle tbody");
    const t2 = UI.qs("#tablaDocsInterDetalle tbody");
    const e1 = UI.qs("#docsObraDetalleEmpty");
    const e2 = UI.qs("#docsInterDetalleEmpty");
    if(!t1 && !t2) return;

    const all = await DB.listFilesByOwner("obra", obraId);
    const docsObra = all.filter(x => x.kind === "doc_obra").sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")));
    const docsInter = all.filter(x => x.kind === "doc_interventoria").sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")));

    if(t1){
      t1.innerHTML = docsObra.map(d=>`
        <tr>
          <td>${UI.esc(d.name||"")}</td>
          <td>${UI.esc(d.mime||"")}</td>
          <td>${UI.esc(UI.fmtBytes(d.size||0))}</td>
          <td>${UI.esc((d.createdAt||"").slice(0,10))}</td>
          <td class="row" style="gap:8px">
            <button class="btn" type="button" data-dl="${d.id}">Descargar</button>
            <button class="btn danger" type="button" data-del="${d.id}">Eliminar</button>
          </td>
        </tr>
      `).join("");
      if(e1) e1.style.display = docsObra.length ? "none" : "";
    }

    if(t2){
      t2.innerHTML = docsInter.map(d=>`
        <tr>
          <td>${UI.esc(d.name||"")}</td>
          <td>${UI.esc(d.mime||"")}</td>
          <td>${UI.esc(UI.fmtBytes(d.size||0))}</td>
          <td>${UI.esc((d.createdAt||"").slice(0,10))}</td>
          <td class="row" style="gap:8px">
            <button class="btn" type="button" data-dl="${d.id}">Descargar</button>
            <button class="btn danger" type="button" data-del="${d.id}">Eliminar</button>
          </td>
        </tr>
      `).join("");
      if(e2) e2.style.display = docsInter.length ? "none" : "";
    }

    document.querySelectorAll("[data-dl]").forEach(btn=>{
      btn.addEventListener("click", ()=> UI.downloadFileFromIDB(btn.getAttribute("data-dl")));
    });

    document.querySelectorAll("[data-del]").forEach(btn=>{
      btn.addEventListener("click", async ()=>{
        const id = btn.getAttribute("data-del");
        if(!confirm("¿Eliminar este documento?")) return;
        await DB.deleteFile(id).catch(()=>{});
        await renderDocsDetalleFromIDB();
      });
    });

    StorageAPI.updateObra(obraId, { documentos: { obra: docsObra, interventoria: docsInter } });
  }
  renderDocsDetalleFromIDB().catch(()=>{});

  /* =========================
     ACCIONES (✅ arregla botones)
     ========================= */
  UI.qs("#btnEditarObra")?.addEventListener("click", ()=>{
    location.href = `obras.html?editObraId=${encodeURIComponent(obraId)}`;
  });

  UI.qs("#btnExportObra")?.addEventListener("click", ()=>{
    const db = StorageAPI.loadStore();
    const obraNow = StorageAPI.getObraById(obraId);
    const obraOnly = {
      meta: db.meta,
      obra: obraNow,
      visitas: db.visitas.filter(v => v.obraId === obraId),
      hallazgos: db.hallazgos.filter(h => h.obraId === obraId)
    };
    const blob = new Blob([JSON.stringify(obraOnly,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    UI.downloadBlobUrl(url, `obra_${obraNow.contrato}_${Date.now()}.json`);
  });

  UI.qs("#btnPdfConsolidado")?.addEventListener("click", async ()=>{
    if(!window.PDF?.exportObraConsolidadoPDF){
      alert("pdf.js no tiene exportObraConsolidadoPDF (falta esa función).");
      return;
    }
    const obraNow = StorageAPI.getObraById(obraId);
    const visitasNow = StorageAPI.listVisitasByObra(obraId);
    const hallNow = StorageAPI.listHallazgosByObra(obraId);

    await PDF.exportObraConsolidadoPDF({
      obra: obraNow,
      visitas: visitasNow,
      hallazgos: hallNow,
      returnBlob: false
    });
  });

  UI.qs("#btnShareConsolidado")?.addEventListener("click", async ()=>{
    if(!window.PDF?.exportObraConsolidadoPDF){
      alert("pdf.js no tiene exportObraConsolidadoPDF (falta esa función).");
      return;
    }
    if(!UI.shareFile){
      alert("ui.js no tiene shareFile().");
      return;
    }

    const obraNow = StorageAPI.getObraById(obraId);
    const visitasNow = StorageAPI.listVisitasByObra(obraId);
    const hallNow = StorageAPI.listHallazgosByObra(obraId);

    const { blob, filename } = await PDF.exportObraConsolidadoPDF({
      obra: obraNow,
      visitas: visitasNow,
      hallazgos: hallNow,
      returnBlob: true
    });

    await UI.shareFile(blob, filename);
  });

  UI.qs("#btnDeleteObra")?.addEventListener("click", async ()=>{
    if(!confirm("¿Eliminar la obra y todo su historial?")) return;

    const db = StorageAPI.loadStore();
    const visitas = db.visitas.filter(v=>v.obraId===obraId);
    const hallazgos = db.hallazgos.filter(h=>h.obraId===obraId);

    await DB.deleteFilesByOwner("obra", obraId).catch(()=>{});
    for(const v of visitas) await DB.deleteFilesByOwner("visita", v.id).catch(()=>{});
    for(const h of hallazgos) await DB.deleteFilesByOwner("hallazgo", h.id).catch(()=>{});

    StorageAPI.deleteObra(obraId);
    alert("Obra eliminada.");
    location.href = "obras.html";
  });
}

/* =========================
   VISITA NUEVA (hallazgos + evidencias)
   ========================= */
function bindVisitaNuevaPage(){
  const obraId = UI.getParam("obraId");
  const obra = StorageAPI.getObraById(obraId);
  if(!obra){ alert("Obra no encontrada."); location.href="obras.html"; return; }

  UI.qs("#obraSub") && (UI.qs("#obraSub").textContent = `${obra.nombre} · Contrato ${obra.contrato}`);
  UI.qs("#obraId") && (UI.qs("#obraId").value = obraId);
  UI.qs("#backObra") && (UI.qs("#backObra").href = `obras-detalle.html?obraId=${encodeURIComponent(obraId)}`);
  UI.qs("#btnCancelar") && (UI.qs("#btnCancelar").href = `obras-detalle.html?obraId=${encodeURIComponent(obraId)}&tab=visitas`);

  const hallWrap = UI.qs("#hallazgosWrap");
  const evidInput = UI.qs("#evidenciasVisita");
  const prev = UI.qs("#previewEvidencias");

  let evidFiles = []; // File[]

  function addHallazgoCard(){
    if(!hallWrap) return;
    const id = StorageAPI.uid("hall");
    hallWrap.insertAdjacentHTML("beforeend", `
      <div class="item" data-hall="${id}">
        <div class="topline">
          <div class="name">Hallazgo</div>
          <button class="btn danger" type="button" data-remove="${id}">Quitar</button>
        </div>

        <div class="grid two" style="margin-top:10px">
          <div>
            <label>Tipo</label>
            <select data-k="tipo">
              <option value="calidad">Calidad</option>
              <option value="cronograma">Cronograma</option>
              <option value="sst">SST</option>
              <option value="ambiental">Ambiental</option>
              <option value="contractual" selected>Contractual</option>
            </select>
          </div>
          <div>
            <label>Severidad</label>
            <select data-k="severidad">
              <option value="leve">Leve</option>
              <option value="mayor">Mayor</option>
              <option value="critica">Crítica</option>
            </select>
          </div>
        </div>

        <label>Descripción</label>
        <textarea data-k="descripcion" placeholder="Describe el hallazgo"></textarea>

        <div class="grid two">
          <div>
            <label>Acción requerida</label>
            <input data-k="accionRequerida" placeholder="Acción correctiva / requerimiento">
          </div>
          <div>
            <label>Responsable</label>
            <input data-k="responsable" placeholder="Contratista / interventoría">
          </div>
        </div>

        <label>Fecha límite</label>
        <input type="date" data-k="fechaLimite">
      </div>
    `);
  }

  UI.qs("#btnAddHallazgo")?.addEventListener("click", addHallazgoCard);

  hallWrap?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove]");
    if(!btn) return;
    const id = btn.getAttribute("data-remove");
    hallWrap.querySelector(`[data-hall="${id}"]`)?.remove();
  });

  // ✅ AJUSTE: permitir “acumular” evidencias hasta 4 (si el dispositivo solo deja elegir 1 por vez)
  evidInput?.addEventListener("change", (e) => {
    const selected = Array.from(e.target.files || []).filter(f => (f.type||"").startsWith("image/"));

    // dedupe simple: name+size+lastModified
    const key = (f) => `${f.name}__${f.size}__${f.lastModified}`;
    const map = new Map(evidFiles.map(f => [key(f), f]));
    for(const f of selected) map.set(key(f), f);

    let merged = Array.from(map.values());

    if(merged.length > 4){
      alert("Máximo 4 fotos. Se conservarán solo las primeras 4.");
      merged = merged.slice(0,4);
    }

    evidFiles = merged;

    const refs = evidFiles.map(f => ({ name:f.name, mime:f.type, size:f.size }));
    UI.renderEvidencePreviews(prev, refs);

    // ✅ permite volver a abrir el selector y agregar más
    e.target.value = "";
  });

  UI.qs("#formVisita")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const base = Object.fromEntries(fd.entries());

    const checklist = {
      tecnico: { estado: base.chk_tecnico, obs: base.obs_tecnico || "" },
      sst: { estado: base.chk_sst, obs: base.obs_sst || "" },
      ambiental: { estado: base.chk_ambiental, obs: base.obs_ambiental || "" },
      documental: { estado: base.chk_documental, obs: base.obs_documental || "" },
      pmt: { estado: base.chk_pmt, obs: base.obs_pmt || "" }
    };

    const hallCards = Array.from(hallWrap?.querySelectorAll("[data-hall]") || []);
    const hItems = [];
    for(const card of hallCards){
      const get = (k) => card.querySelector(`[data-k="${k}"]`)?.value || "";
      const descripcion = get("descripcion").trim();
      if(!descripcion) continue;
      hItems.push({
        id: StorageAPI.uid("hallazgo"),
        obraId,
        visitaId: "",
        radicado: "",
        creadoEn: StorageAPI.nowISO(),
        estado: "abierto",
        tipo: get("tipo"),
        severidad: get("severidad"),
        descripcion,
        accionRequerida: get("accionRequerida"),
        responsable: get("responsable"),
        fechaLimite: get("fechaLimite") || base.fecha
      });
    }

    const radicado = StorageAPI.nextRadicado();

    const visita = StorageAPI.createVisita({
      obraId,
      radicado,
      fecha: base.fecha,
      horaInicio: base.horaInicio,
      horaFin: base.horaFin,
      objetivo: base.objetivo,
      resumen: base.resumen,
      asistentes: base.asistentes || "",
      checklist,
      evidencias: []
    });

    const refs = [];
    for(const f of (evidFiles||[])){
      const meta = await DB.putFile({
        ownerType:"visita",
        ownerId: visita.id,
        kind:"evidencia_visita",
        name: f.name,
        mime: f.type || "image/jpeg",
        size: f.size || 0,
        blob: f
      });
      refs.push(meta);
    }

    const db = StorageAPI.loadStore();
    const idx = db.visitas.findIndex(v=>v.id===visita.id);
    if(idx!==-1){
      db.visitas[idx].evidencias = refs;
      StorageAPI.saveStore(db);
    }

    for(const h of hItems){ h.visitaId = visita.id; h.radicado = radicado; }
    if(hItems.length) StorageAPI.createHallazgosBulk(hItems);

    alert(`Visita guardada. Radicado: ${radicado}`);
    location.href = `obras-detalle.html?obraId=${encodeURIComponent(obraId)}&tab=visitas`;
  });

  addHallazgoCard();
}

/* =========================
   CERRAR HALLAZGO
   ========================= */
function bindHallazgoCerrarPage(){
  const obraId = UI.getParam("obraId");
  const hallazgoId = UI.getParam("hallazgoId");
  const obra = StorageAPI.getObraById(obraId);
  const hallazgo = StorageAPI.getHallazgoById(hallazgoId);
  if(!obra || !hallazgo){ alert("No se encontró obra/hallazgo."); location.href="obras.html"; return; }

  UI.qs("#sub") && (UI.qs("#sub").textContent = `${obra.nombre} · ${hallazgo.radicado}`);
  UI.qs("#backToObra") && (UI.qs("#backToObra").href = `obras-detalle.html?obraId=${encodeURIComponent(obraId)}&tab=hallazgos`);
  UI.qs("#btnCancelar") && (UI.qs("#btnCancelar").href = `obras-detalle.html?obraId=${encodeURIComponent(obraId)}&tab=hallazgos`);

  const evidInput = UI.qs("#evidenciasCierre");
  const prev = UI.qs("#previewEvidencias");
  let evidFiles = [];

  evidInput?.addEventListener("change", (e) => {
    const all = Array.from(e.target.files || []).filter(f => (f.type||"").startsWith("image/"));
    evidFiles = all;
    const refs = evidFiles.map(f => ({ name:f.name, mime:f.type, size:f.size }));
    UI.renderEvidencePreviews(prev, refs);
    e.target.value = "";
  });

  UI.qs("#formCerrar")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const fechaCierre = fd.get("fechaCierre");
    const obsCierre = fd.get("obsCierre");

    const refs = [];
    for(const f of (evidFiles||[])){
      const meta = await DB.putFile({
        ownerType:"hallazgo",
        ownerId: hallazgoId,
        kind:"evidencia_cierre",
        name: f.name,
        mime: f.type || "image/jpeg",
        size: f.size || 0,
        blob: f
      });
      refs.push(meta);
    }

    const ok = StorageAPI.closeHallazgo(hallazgoId, { fechaCierre, obsCierre, evidenciasCierre: refs });
    if(!ok){ alert("No se pudo cerrar el hallazgo."); return; }

    alert("Hallazgo cerrado.");
    location.href = `obras-detalle.html?obraId=${encodeURIComponent(obraId)}&tab=hallazgos`;
  });
}

/* =========================
   BOOT
   ========================= */
(function boot(){
  initPWA();

  const p = page();
  if(p==="obras.html") bindObrasPage();
  if(p==="obras-detalle.html"){ bindTabsIfPresent(); bindObraDetallePage(); }
  if(p==="visita-nueva.html") bindVisitaNuevaPage();
  if(p==="hallazgo-cerrar.html") bindHallazgoCerrarPage();
})();