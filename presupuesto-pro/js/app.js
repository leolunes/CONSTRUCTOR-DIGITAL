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

/* ========= helpers base64 docs ========= */
function blobToDataUrl(blob){
  return new Promise((res, rej)=>{
    const fr = new FileReader();
    fr.onload = ()=>res(String(fr.result||""));
    fr.onerror = ()=>rej(fr.error || new Error("No se pudo leer archivo"));
    fr.readAsDataURL(blob);
  });
}
async function dataUrlToBlob(dataUrl){
  const r = await fetch(dataUrl);
  return await r.blob();
}

/* ========= helpers logo/image ========= */
async function fileToDataUrl(file){
  if(!file) return "";
  const MAX_IMG = 4 * 1024 * 1024; // 4MB
  if((file.size||0) > MAX_IMG) throw new Error("Imagen demasiado grande. Máx 4MB.");
  return await blobToDataUrl(file);
}

/* ========= helper excel ========= */
function sanitizeFileName(name){
  return String(name||"archivo")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "archivo";
}

function exportProjectExcel(project){
  if(!project) return;

  if(typeof XLSX === "undefined" || !XLSX?.utils){
    alert("No se encontró XLSX. Verifica que está cargado en el HTML.");
    return;
  }

  const totals = Calc.calcTotals(project);
  const { groups, items } = Calc.groupByChapters(project);

  // ===== Sheet 1: Resumen (A-O-A) =====
  const resumenAOA = [
    ["FORMATO INSTITUCIONAL"],
    ["República / País", project.instPais || ""],
    ["Departamento", project.instDepto || ""],
    ["Municipio", project.instMunicipio || ""],
    ["Entidad contratante", project.instEntidad || (project.entity || "")],
    ["Proyecto (portada)", project.instProyectoLabel || project.name || ""],
    ["Ubicación", project.location || ""],
    ["Fecha elaboración", project.instFechaElab || ""],
    [""],
    ["RESUMEN PRESUPUESTO"],
    ["Moneda", project.currency || "COP"],
    ["AIU (%)", Number(project.aiuPct||0)],
    ["IVA (%)", Number(project.ivaPct||0)],
    ["Regla IVA", project.ivaBase || ""],
    [""],
    ["Costo Directo", Number(totals.directo||0)],
    ["AIU", Number(totals.aiu||0)],
    ["IVA", Number(totals.iva||0)],
    ["TOTAL", Number(totals.total||0)],
    [""],
    ["Items", (project.items||[]).length],
    ["Capítulos", (groups||[]).length],
  ];

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenAOA);

  // ===== Sheet 2: Capítulos =====
  const capsRows = (groups||[]).map(g=>({
    Capitulo: String(g.chapterCode||""),
    Nombre: String(g.chapterName||""),
    Items: Number(g.itemsCount||0),
    Subtotal: Number(g.subtotal||0),
    Moneda: project.currency || "COP"
  }));
  const wsCaps = XLSX.utils.json_to_sheet(capsRows.length ? capsRows : [{Capitulo:"",Nombre:"",Items:"",Subtotal:"",Moneda:project.currency||"COP"}]);

  // ===== Sheet 3: Ítems =====
  const itemsRows = (items||[]).map(it=>{
    const parcial = Number(it.pu||0) * Number(it.qty||0);
    const cap = it.chapterCode || (String(it.code||"").split(".")[0] || "");
    return {
      Capitulo: String(cap||""),
      Codigo: String(it.code||""),
      Descripcion: String(it.desc||""),
      Unidad: String(it.unit||""),
      VR_Unitario: Number(it.pu||0),
      Cantidad: Number(it.qty||0),
      VR_Parcial: Number(parcial||0),
      Moneda: project.currency || "COP"
    };
  });
  const wsItems = XLSX.utils.json_to_sheet(itemsRows.length ? itemsRows : [{
    Capitulo:"",Codigo:"",Descripcion:"",Unidad:"",VR_Unitario:"",Cantidad:"",VR_Parcial:"",Moneda:project.currency||"COP"
  }]);

  // ===== Workbook =====
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
  XLSX.utils.book_append_sheet(wb, wsCaps, "Capitulos");
  XLSX.utils.book_append_sheet(wb, wsItems, "Items");

  const out = XLSX.write(wb, { bookType:"xlsx", type:"array" });
  const blob = new Blob([out], { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);

  const filename = `presupuesto_${sanitizeFileName(project.name)}_${Date.now()}.xlsx`;
  UI.downloadBlobUrl(url, filename);
}

/* ---------- PROYECTOS ---------- */
async function renderKpis(){
  const el = UI.qs("#kpis");
  if(!el) return;

  const ps = StorageAPI.listProjects();
  const total = ps.reduce((s,p)=> s + (Calc.calcTotals(p).total||0), 0);

  let baseChip = UI.chip("NO","bad");
  try{
    const meta = await APUBase.getMeta();
    if(meta) baseChip = UI.chip(`OK (${meta.counts?.items||0})`,"ok");
  }catch(_){}

  el.innerHTML = `
    <div class="card item"><div class="topline"><div class="name">Proyectos</div><div class="chips">${UI.chip(String(ps.length),"ok")}</div></div><div class="muted small">En este dispositivo.</div></div>
    <div class="card item"><div class="topline"><div class="name">Total presupuestado</div><div class="chips">${UI.chip(UI.fmtMoney(total,"COP"))}</div></div><div class="muted small">Suma de totales.</div></div>
    <div class="card item"><div class="topline"><div class="name">Base APU</div><div class="chips">${baseChip}</div></div><div class="muted small">Importada desde XLSX.</div></div>
    <div class="card item"><div class="topline"><div class="name">Modo</div><div class="chips">${UI.chip("OFFLINE","ok")}</div></div><div class="muted small">LocalStorage + IndexedDB.</div></div>
  `;
}

function renderProjects(){
  const tbody = UI.qs("#lista");
  const empty = UI.qs("#empty");
  if(!tbody) return;

  const term = (UI.qs("#search")?.value || "").toLowerCase().trim();
  let ps = StorageAPI.listProjects();

  if(term){
    ps = ps.filter(p => `${p.name} ${p.entity} ${p.location}`.toLowerCase().includes(term));
  }

  if(!ps.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  tbody.innerHTML = ps.map(p=>{
    const t = Calc.calcTotals(p);
    return `
      <tr>
        <td><b>${UI.esc(p.name)}</b></td>
        <td>${UI.esc(p.entity||"-")}</td>
        <td>${UI.esc(p.location||"-")}</td>
        <td>${p.updatedAt ? UI.esc(new Date(p.updatedAt).toLocaleString()) : "-"}</td>
        <td><b>${UI.fmtMoney(t.total, p.currency||"COP")}</b></td>
        <td class="row" style="gap:8px">
          <a class="btn primary" href="proyecto-detalle.html?projectId=${encodeURIComponent(p.id)}">Abrir</a>
          <button class="btn danger" type="button" data-del="${p.id}">Eliminar</button>
        </td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll("[data-del]").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const id = btn.getAttribute("data-del");
      if(!confirm("¿Eliminar proyecto y sus documentos?")) return;
      await DB.deleteFilesByOwner("project", id).catch(()=>{});
      StorageAPI.deleteProject(id);
      renderKpis();
      renderProjects();
    });
  });
}

async function bindProjectsPage(){
  UI.qs("#btnNew")?.addEventListener("click", ()=>{
    const name = prompt("Nombre del proyecto:","") || "";
    if(!name.trim()) return;

    const entity = prompt("Entidad (opcional):","") || "";
    const ubicacion = prompt("Ubicación (opcional):","") || "";

    const p = StorageAPI.createProject({ name, entity, location: ubicacion });
    window.location.href = `proyecto-detalle.html?projectId=${encodeURIComponent(p.id)}`;
  });

  UI.qs("#search")?.addEventListener("input", renderProjects);

  UI.qs("#btnInstallBase")?.addEventListener("click", ()=> UI.qs("#fileBase")?.click());

  UI.qs("#fileBase")?.addEventListener("change", async (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;
    try{
      alert("Importando base... (puede tardar un poco)");
      const meta = await APUBase.installFromFile(f);
      alert(`Base instalada OK.\nItems: ${meta.counts?.items || 0}\nCD lines: ${meta.counts?.cdLines||0}\nInsumos: ${meta.counts?.insumos||0}\nSubproductos: ${meta.counts?.subLines||0}`);
      await renderKpis();
    }catch(err){
      alert("Error instalando base: " + (err?.message || err));
    }finally{
      e.target.value = "";
    }
  });

  UI.qs("#btnExport")?.addEventListener("click", ()=>{
    const { url, filename } = StorageAPI.exportBackup();
    UI.downloadBlobUrl(url, filename);
  });

  UI.qs("#fileImport")?.addEventListener("change", async (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;
    try{
      await StorageAPI.importBackupFromFile(f);
      alert("Backup importado. Se recargará.");
      window.location.reload();
    }catch(err){
      alert("Error importando backup: " + err.message);
    }finally{
      e.target.value = "";
    }
  });

  // ✅ Importar proyecto (JSON + adjuntos base64) como proyecto NUEVO
  UI.qs("#fileImportProject")?.addEventListener("change", async (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;
    try{
      const text = await f.text();
      const payload = JSON.parse(text);
      if(!payload || !payload.project) throw new Error("Archivo inválido. Falta 'project'.");

      const newProj = StorageAPI.importProjectAsNew(payload.project);

      const docs = Array.isArray(payload.docs) ? payload.docs : [];
      for(const d of docs){
        if(!d?.dataUrl) continue;
        const blob = await dataUrlToBlob(d.dataUrl);
        await DB.putFile({
          ownerType:"project",
          ownerId: newProj.id,
          kind:"doc_project",
          name: d.name || "archivo",
          mime: d.mime || blob.type || "application/octet-stream",
          size: Number(d.size || blob.size || 0),
          blob
        });
      }

      alert(`Proyecto importado OK.\nProyecto: ${newProj.name}\nAdjuntos: ${docs.length}`);
      await renderKpis();
      renderProjects();
    }catch(err){
      alert("Error importando proyecto: " + (err?.message || err));
    }finally{
      e.target.value = "";
    }
  });

  // ✅ Borrar todo + pregunta por Base APU
  UI.qs("#btnReset")?.addEventListener("click", async ()=>{
    if(!confirm("¿Borrar TODO? (proyectos + documentos)")) return;

    const alsoBase = confirm("¿También deseas borrar la Base APU (IndexedDB)?\n\nOJO: tendrás que instalar el XLSX de nuevo.");
    const ps = StorageAPI.listProjects();
    for(const p of ps){
      await DB.deleteFilesByOwner("project", p.id).catch(()=>{});
    }
    StorageAPI.resetAll();

    if(alsoBase){
      try{
        await APUBase.deleteBaseDatabase();
      }catch(_){}
    }

    alert("Listo. Se recargará.");
    window.location.reload();
  });

  await renderKpis();
  renderProjects();
}

/* ---------- DETALLE PROYECTO ---------- */
async function renderDocs(projectId){
  const tbody = UI.qs("#tablaDocs tbody");
  const empty = UI.qs("#docsEmpty");
  if(!tbody) return;

  const all = await DB.listFilesByOwner("project", projectId);
  const docs = all.sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")));

  tbody.innerHTML = docs.map(d=>`
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

  if(empty) empty.style.display = docs.length ? "none" : "";

  document.querySelectorAll("[data-dl]").forEach(btn=>{
    btn.addEventListener("click", ()=> UI.downloadFileFromIDB(btn.getAttribute("data-dl")));
  });

  document.querySelectorAll("[data-del]").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const id = btn.getAttribute("data-del");
      if(!confirm("¿Eliminar este documento?")) return;
      await DB.deleteFile(id).catch(()=>{});
      await renderDocs(projectId);
    });
  });
}

function renderProjectDetail(project){
  UI.qs("#projTitle") && (UI.qs("#projTitle").textContent = project.name);
  UI.qs("#projSub") && (UI.qs("#projSub").textContent = `${project.entity || "—"} · ${project.location || "—"} · ${project.currency || "COP"}`);

  const info = UI.qs("#cardInfo");
  if(info){
    info.innerHTML = `
      <div class="cardhead">
        <h2>${UI.esc(project.name)}</h2>
        <p class="muted small">Entidad: ${UI.esc(project.entity||"-")} · Ubicación: ${UI.esc(project.location||"-")}</p>
      </div>
      <div class="grid two">
        <div class="item"><div class="name">AIU</div><div class="muted small">${UI.esc(String(project.aiuPct||0))}%</div></div>
        <div class="item"><div class="name">IVA</div><div class="muted small">${UI.esc(String(project.ivaPct||0))}% (${UI.esc(project.ivaBase||"")})</div></div>
      </div>
    `;
  }

  const totals = Calc.calcTotals(project);
  const k = UI.qs("#cardTotals");
  if(k){
    k.innerHTML = `
      <div class="card item"><div class="name">Ítems</div><div class="chips">${UI.chip(String((project.items||[]).length),"ok")}</div></div>
      <div class="card item"><div class="name">Costo Directo</div><div class="chips">${UI.chip(UI.fmtMoney(totals.directo, project.currency||"COP"))}</div></div>
      <div class="card item"><div class="name">AIU</div><div class="chips">${UI.chip(UI.fmtMoney(totals.aiu, project.currency||"COP"))}</div></div>
      <div class="card item"><div class="name">TOTAL</div><div class="chips">${UI.chip(UI.fmtMoney(totals.total, project.currency||"COP"),"ok")}</div></div>
    `;
  }

  const rows = UI.qs("#totalsRows");
  if(rows){
    rows.innerHTML = `
      <div class="row space"><div class="name">Costo Directo</div><div><b>${UI.fmtMoney(totals.directo, project.currency||"COP")}</b></div></div>
      <div class="row space"><div class="name">AIU (${UI.esc(String(project.aiuPct||0))}%)</div><div><b>${UI.fmtMoney(totals.aiu, project.currency||"COP")}</b></div></div>
      <div class="row space"><div class="name">IVA (${UI.esc(String(project.ivaPct||0))}%)</div><div><b>${UI.fmtMoney(totals.iva, project.currency||"COP")}</b></div></div>
      <hr class="sep">
      <div class="row space"><div class="name">TOTAL</div><div><b>${UI.fmtMoney(totals.total, project.currency||"COP")}</b></div></div>
    `;
  }
}

function renderChaptersTable(project){
  const tbody = UI.qs("#capsBody");
  const empty = UI.qs("#capsEmpty");
  if(!tbody) return;

  const { groups } = Calc.groupByChapters(project);
  if(!groups.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  tbody.innerHTML = groups.map(g=>`
    <tr>
      <td><b>${UI.esc(g.chapterCode)}</b></td>
      <td>${UI.esc(g.chapterName||"")}</td>
      <td style="text-align:right">${UI.esc(String(g.itemsCount))}</td>
      <td style="text-align:right"><b>${UI.fmtMoney(g.subtotal, project.currency||"COP")}</b></td>
    </tr>
  `).join("");
}

function renderItemsTable(project){
  const tbody = UI.qs("#itemsBody");
  const empty = UI.qs("#itemsEmpty");
  if(!tbody) return;

  const items = project.items || [];
  if(!items.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  tbody.innerHTML = items.map(it=>{
    const parcial = Number(it.pu||0) * Number(it.qty||0);
    const cap = it.chapterCode || (String(it.code||"").split(".")[0] || "");
    return `
      <tr>
        <td><b>${UI.esc(cap||"-")}</b></td>
        <td>${UI.esc(it.code||"")}</td>
        <td>${UI.esc(it.desc||"")}</td>
        <td>${UI.esc(it.unit||"")}</td>
        <td style="text-align:right"><b>${UI.fmtMoney(it.pu, project.currency||"COP")}</b></td>
        <td style="text-align:right">${UI.esc(String(it.qty||0))}</td>
        <td style="text-align:right"><b>${UI.fmtMoney(parcial, project.currency||"COP")}</b></td>
        <td class="row" style="gap:8px">
          <a class="btn" href="apu.html?code=${encodeURIComponent(it.code||"")}&projectId=${encodeURIComponent(project.id)}">Ver APU</a>
          <button class="btn" type="button" data-edit="${it.id}">Editar</button>
          <button class="btn danger" type="button" data-del="${it.id}">Eliminar</button>
        </td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll("[data-del]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-del");
      if(!confirm("¿Eliminar ítem?")) return;
      StorageAPI.deleteItem(project.id, id);
      const fresh = StorageAPI.getProjectById(project.id);
      renderProjectDetail(fresh);
      renderChaptersTable(fresh);
      renderItemsTable(fresh);
      renderResumenItems(fresh);
    });
  });

  tbody.querySelectorAll("[data-edit]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-edit");
      const fresh = StorageAPI.getProjectById(project.id);
      const it = (fresh.items||[]).find(x=>x.id===id);
      if(!it) return;

      const code = prompt("Código:", it.code||"") ?? it.code;
      const desc = prompt("Descripción:", it.desc||"") ?? it.desc;
      const unit = prompt("Unidad:", it.unit||"") ?? it.unit;
      const pu = Number(prompt("VR Unitario:", String(it.pu||0)) ?? it.pu);
      const qty = Number(prompt("Cantidad:", String(it.qty||0)) ?? it.qty);

      StorageAPI.updateItem(fresh.id, id, { code, desc, unit, pu, qty });
      const updated = StorageAPI.getProjectById(fresh.id);
      renderProjectDetail(updated);
      renderChaptersTable(updated);
      renderItemsTable(updated);
      renderResumenItems(updated);
    });
  });
}

function renderResumenItems(project){
  const tbody = UI.qs("#resumenItemsBody");
  const empty = UI.qs("#resumenItemsEmpty");
  if(!tbody) return;

  const items = project.items || [];
  if(!items.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  const { items: items2 } = Calc.groupByChapters(project);

  tbody.innerHTML = items2.map(it=>{
    const parcial = Number(it.pu||0) * Number(it.qty||0);
    const cap = it.chapterCode || (String(it.code||"").split(".")[0] || "");
    return `
      <tr>
        <td><b>${UI.esc(cap||"-")}</b></td>
        <td><b>${UI.esc(it.code||"")}</b></td>
        <td>${UI.esc(it.desc||"")}</td>
        <td>${UI.esc(it.unit||"")}</td>
        <td style="text-align:right"><b>${UI.fmtMoney(it.pu, project.currency||"COP")}</b></td>
        <td style="text-align:right">${UI.esc(String(it.qty||0))}</td>
        <td style="text-align:right"><b>${UI.fmtMoney(parcial, project.currency||"COP")}</b></td>
      </tr>
    `;
  }).join("");
}

function renderApuResults(projectId, results){
  const tbody = UI.qs("#apuResultsBody");
  const empty = UI.qs("#apuResultsEmpty");
  if(!tbody) return;

  if(!results || !results.length){
    tbody.innerHTML = "";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  tbody.innerHTML = results.map(r=>`
    <tr>
      <td><b>${UI.esc(r.code||"")}</b></td>
      <td>${UI.esc(r.desc||"")}</td>
      <td>${UI.esc(r.unit||"")}</td>
      <td style="text-align:right"><b>${UI.fmtMoney(r.pu||0,"COP")}</b></td>
      <td>
        <button class="btn primary" type="button" data-addapu="${UI.esc(r.code||"")}">Agregar</button>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-addapu]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const code = btn.getAttribute("data-addapu");
      const sel = results.find(x=>String(x.code||"")===String(code||""));
      if(!sel) return;

      if(sel.isChapter){
        alert("Ese código es un CAPÍTULO. Escoge un ítem (ej: 1.01).");
        return;
      }

      const qty = Number(prompt("Cantidad del ítem:", "1") || "0");
      if(!qty) return;

      StorageAPI.addItem(projectId, {
        chapterCode: sel.chapterCode || "",
        chapterName: sel.chapterName || "",
        code: sel.code,
        desc: sel.desc,
        unit: sel.unit,
        pu: Number(sel.pu||0),
        qty
      });

      const fresh = StorageAPI.getProjectById(projectId);
      renderProjectDetail(fresh);
      renderChaptersTable(fresh);
      renderItemsTable(fresh);
      renderResumenItems(fresh);
      alert("Ítem agregado al presupuesto.");
    });
  });
}

/* =========================================================
   ✅ VISOR "Consultas de Base APU"
   ========================================================= */
function bindBaseViewer(projectId){
  const btnVerFormulario = UI.qs("#btnVerFormulario");
  const btnVerCD = UI.qs("#btnVerCD");
  const btnVerSub = UI.qs("#btnVerSub");
  const btnVerInsumos = UI.qs("#btnVerInsumos");

  const viewer = UI.qs("#baseViewer");
  const title = UI.qs("#baseViewerTitle");
  const sub = UI.qs("#baseViewerSub");
  const btnClose = UI.qs("#btnCloseViewer");

  const searchRow = UI.qs("#baseViewerSearchRow");
  const inpSearch = UI.qs("#baseViewerSearch");
  const btnSearch = UI.qs("#btnBaseViewerSearch");

  const head = UI.qs("#baseViewerHead");
  const body = UI.qs("#baseViewerBody");
  const empty = UI.qs("#baseViewerEmpty");

  if(!btnVerFormulario || !btnVerCD || !btnVerSub || !btnVerInsumos) return;
  if(!viewer || !title || !sub || !btnClose || !head || !body || !empty) return;

  let mode = "";

  function showEmpty(flag){
    empty.style.display = flag ? "" : "none";
  }

  function openViewer(newMode){
    mode = newMode;
    viewer.style.display = "";

    if(searchRow) searchRow.style.display = "";
    if(inpSearch) inpSearch.value = "";

    if(mode === "formulario"){
      title.textContent = "FORMULARIO DE PRECIOS";
      sub.textContent = "Items (capítulos + ítems) de la base.";
      head.innerHTML = `
        <tr>
          <th>Código</th>
          <th>Descripción</th>
          <th>Unidad</th>
          <th style="text-align:right">PU</th>
          <th>Capítulo</th>
        </tr>
      `;
    }

    if(mode === "cd"){
      title.textContent = "Costos_Directos";
      sub.textContent = "Líneas de descomposición (muestra una muestra filtrable).";
      head.innerHTML = `
        <tr>
          <th>Ítem</th>
          <th>Grupo</th>
          <th>Descripción</th>
          <th>Unidad</th>
          <th style="text-align:right">Cant/Rend</th>
          <th style="text-align:right">PU</th>
          <th style="text-align:right">Parcial</th>
        </tr>
      `;
    }

    if(mode === "sub"){
      title.textContent = "Subproductos";
      sub.textContent = "Listado de subproductos. Puedes abrir el detalle.";
      head.innerHTML = `
        <tr>
          <th>Nombre</th>
          <th>Key</th>
          <th>Acción</th>
        </tr>
      `;
    }

    if(mode === "insumos"){
      title.textContent = "Insumos";
      sub.textContent = "Listado de insumos (filtrable por tipo/desc/unidad).";
      head.innerHTML = `
        <tr>
          <th>Tipo</th>
          <th>Descripción</th>
          <th>Unidad</th>
          <th style="text-align:right">PU</th>
        </tr>
      `;
    }

    body.innerHTML = "";
    showEmpty(false);
    loadRows("");
  }

  function closeViewer(){
    viewer.style.display = "none";
    mode = "";
  }

  async function requireBase(){
    let meta = null;
    try{ meta = await APUBase.getMeta(); }catch(_){}
    if(!meta){
      alert("Primero instala la Base APU (XLSX) desde Proyectos.");
      return false;
    }
    return true;
  }

  async function loadRows(q){
    const ok = await requireBase();
    if(!ok) return;

    body.innerHTML = "";
    showEmpty(false);

    try{
      if(mode === "formulario"){
        const rows = await APUBase.listFormularioItems(q || "", 250);
        if(!rows.length){ showEmpty(true); return; }

        body.innerHTML = rows.map(r=>{
          const cap = r.isChapter ? `CAP ${r.code}` : (r.chapterCode ? `CAP ${r.chapterCode}` : "");
          const capName = r.isChapter ? (r.desc || "") : (r.chapterName || "");
          return `
            <tr>
              <td><b>${UI.esc(r.code||"")}</b></td>
              <td>${UI.esc(r.desc||"")}</td>
              <td>${UI.esc(r.unit||"")}</td>
              <td style="text-align:right"><b>${UI.fmtMoney(r.pu||0,"COP")}</b></td>
              <td>${UI.esc((cap ? cap + " — " : "") + (capName||""))}</td>
            </tr>
          `;
        }).join("");
        return;
      }

      if(mode === "cd"){
        const rows = await APUBase.listCostosDirectosAll(q || "", 250);
        if(!rows.length){ showEmpty(true); return; }

        body.innerHTML = rows.map(r=>`
          <tr>
            <td><b>${UI.esc(r.itemCode||"")}</b></td>
            <td>${UI.esc(r.group||"")}</td>
            <td>${UI.esc(r.desc||"")}</td>
            <td>${UI.esc(r.unit||"")}</td>
            <td style="text-align:right">${UI.esc(String(r.qty||0))}</td>
            <td style="text-align:right"><b>${UI.fmtMoney(r.pu||0,"COP")}</b></td>
            <td style="text-align:right"><b>${UI.fmtMoney(r.parcial||0,"COP")}</b></td>
          </tr>
        `).join("");
        return;
      }

      if(mode === "sub"){
        const list = await APUBase.listSubproductos(250);
        const qn = (q||"").trim().toLowerCase();
        const filtered = !qn ? list : list.filter(x =>
          String(x.subName||"").toLowerCase().includes(qn) ||
          String(x.subKey||"").toLowerCase().includes(qn)
        );

        if(!filtered.length){ showEmpty(true); return; }

        body.innerHTML = filtered.map(s=>`
          <tr>
            <td><b>${UI.esc(s.subName||"")}</b></td>
            <td class="muted small">${UI.esc(s.subKey||"")}</td>
            <td>
              <a class="btn" href="apu.html?sub=${encodeURIComponent(s.subKey||"")}&projectId=${encodeURIComponent(projectId||"")}">Ver</a>
            </td>
          </tr>
        `).join("");
        return;
      }

      if(mode === "insumos"){
        const rows = await APUBase.listInsumos(q || "", 250);
        if(!rows.length){ showEmpty(true); return; }

        body.innerHTML = rows.map(r=>`
          <tr>
            <td>${UI.esc(r.tipo||"")}</td>
            <td>${UI.esc(r.desc||"")}</td>
            <td>${UI.esc(r.unit||"")}</td>
            <td style="text-align:right"><b>${UI.fmtMoney(r.pu||0,"COP")}</b></td>
          </tr>
        `).join("");
        return;
      }
    }catch(err){
      alert("Error consultando base: " + (err?.message || err));
    }
  }

  btnClose.addEventListener("click", closeViewer);

  btnVerFormulario.addEventListener("click", ()=> openViewer("formulario"));
  btnVerCD.addEventListener("click", ()=> openViewer("cd"));
  btnVerSub.addEventListener("click", ()=> openViewer("sub"));
  btnVerInsumos.addEventListener("click", ()=> openViewer("insumos"));

  btnSearch?.addEventListener("click", ()=>{
    loadRows(inpSearch?.value || "");
  });

  inpSearch?.addEventListener("keydown", (e)=>{
    if(e.key === "Enter"){
      e.preventDefault();
      btnSearch?.click();
    }
  });
}

/* ---------- FIRMA ---------- */
function bindFirmaModal(){
  const btn = UI.qs("#btnDatosFirma");
  const modal = UI.qs("#firmaModal");
  if(!btn || !modal) return;

  const btnClose = UI.qs("#btnFirmaClose");
  const inpNombre = UI.qs("#firmaNombre");
  const inpProf = UI.qs("#firmaProfesion");
  const inpMat = UI.qs("#firmaMatricula");
  const canvas = UI.qs("#firmaCanvas");
  const btnClear = UI.qs("#firmaClear");
  const btnSave = UI.qs("#firmaSave");
  const btnDel = UI.qs("#firmaDelete");
  const btnJpg = UI.qs("#firmaDownloadJpg");
  const prev = UI.qs("#firmaPreview");

  if(!canvas) return;

  function open(){
    modal.style.display = "";
    const e = StorageAPI.getElaborador();
    if(inpNombre) inpNombre.value = e.nombre || "";
    if(inpProf) inpProf.value = e.profesion || "";
    if(inpMat) inpMat.value = e.matricula || "";
    if(prev) prev.src = e.firmaDataUrl || "";
    redrawFromSaved();
  }
  function close(){
    modal.style.display = "none";
  }

  btn.addEventListener("click", open);
  btnClose && btnClose.addEventListener("click", close);

  const ctx = canvas.getContext("2d");
  function fitCanvas(){
    const w = canvas.clientWidth || 520;
    const h = canvas.clientHeight || 220;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = "#ffffff";
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0,0,w,h);
  }

  let drawing = false;
  let last = null;

  function getPos(ev){
    const r = canvas.getBoundingClientRect();
    const x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
    const y = (ev.touches ? ev.touches[0].clientY : ev.clientY) - r.top;
    return { x, y };
  }

  function start(ev){
    ev.preventDefault();
    drawing = true;
    last = getPos(ev);
  }
  function move(ev){
    if(!drawing) return;
    ev.preventDefault();
    const p = getPos(ev);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
  }
  function end(){
    drawing = false;
    last = null;
  }

  function clear(){
    fitCanvas();
    if(prev) prev.src = StorageAPI.getElaborador().firmaDataUrl || "";
  }

  function toJpegDataUrl(){
    const tmp = document.createElement("canvas");
    tmp.width = canvas.width;
    tmp.height = canvas.height;
    const tctx = tmp.getContext("2d");
    tctx.fillStyle = "#0b1220";
    tctx.fillRect(0,0,tmp.width,tmp.height);
    tctx.drawImage(canvas,0,0);
    return tmp.toDataURL("image/jpeg", 0.92);
  }

  function redrawFromSaved(){
    fitCanvas();
    const e = StorageAPI.getElaborador();
    if(e.firmaDataUrl){
      const img = new Image();
      img.onload = ()=>{
        const w = canvas.clientWidth || 520;
        const h = canvas.clientHeight || 220;
        ctx.fillStyle = "#0b1220";
        ctx.fillRect(0,0,w,h);
        ctx.drawImage(img, 0, 0, w, h);
      };
      img.src = e.firmaDataUrl;
    }
  }

  window.addEventListener("resize", ()=>{
    if(modal.style.display !== "none") redrawFromSaved();
  });

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);

  canvas.addEventListener("touchstart", start, {passive:false});
  canvas.addEventListener("touchmove", move, {passive:false});
  canvas.addEventListener("touchend", end);

  btnClear && btnClear.addEventListener("click", ()=> clear());

  btnSave && btnSave.addEventListener("click", ()=>{
    const nombre = inpNombre ? inpNombre.value.trim() : "";
    const profesion = inpProf ? inpProf.value.trim() : "";
    const matricula = inpMat ? inpMat.value.trim() : "";

    const firmaDataUrl = toJpegDataUrl();
    const saved = StorageAPI.setElaborador({ nombre, profesion, matricula, firmaDataUrl });
    if(prev) prev.src = saved.firmaDataUrl || "";
    alert("Firma guardada. Ya aparecerá en el PDF.");
  });

  btnDel && btnDel.addEventListener("click", ()=>{
    if(!confirm("¿Quitar la firma guardada?")) return;
    StorageAPI.clearFirma();
    if(prev) prev.src = "";
    clear();
    alert("Firma eliminada.");
  });

  btnJpg && btnJpg.addEventListener("click", ()=>{
    const jpg = toJpegDataUrl();
    const a = document.createElement("a");
    a.href = jpg;
    a.download = `firma_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  fitCanvas();
  clear();
}

/* ---------- DETALLE (bind) ---------- */
async function bindProjectDetailPage(){
  const projectId = UI.getParam("projectId");
  const project = StorageAPI.getProjectById(projectId);
  if(!project){
    alert("Proyecto no encontrado.");
    window.location.href="proyectos.html";
    return;
  }

  bindTabsIfPresent();
  bindFirmaModal();
  bindBaseViewer(projectId);

  renderProjectDetail(project);
  renderChaptersTable(project);
  renderItemsTable(project);
  renderResumenItems(project);
  renderDocs(projectId).catch(()=>{});

  /* ===============================
     ✅ LOGO INSTITUCIONAL (por proyecto)
     =============================== */
  const inpLogo = UI.qs("#inpProjectLogo");
  const btnRmLogo = UI.qs("#btnRemoveProjectLogo");
  const logoPrev = UI.qs("#projectLogoPreview");

  function refreshLogoPreview(){
    const fresh = StorageAPI.getProjectById(projectId);
    if(!fresh) return;
    if(logoPrev) logoPrev.src = fresh.logoDataUrl || "";
  }
  refreshLogoPreview();

  inpLogo?.addEventListener("change", async (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;
    try{
      const dataUrl = await fileToDataUrl(f);
      StorageAPI.updateProject(projectId, { logoDataUrl: dataUrl });
      refreshLogoPreview();
      alert("Logo guardado en el proyecto.");
    }catch(err){
      alert("No se pudo guardar el logo: " + (err?.message || err));
    }finally{
      e.target.value = "";
    }
  });

  btnRmLogo?.addEventListener("click", ()=>{
    if(!confirm("¿Quitar el logo guardado de este proyecto?")) return;
    StorageAPI.updateProject(projectId, { logoDataUrl: "" });
    refreshLogoPreview();
    alert("Logo eliminado.");
  });

  /* ===============================
     ✅ EXPORTAR A EXCEL
     =============================== */
  UI.qs("#btnExportExcel")?.addEventListener("click", ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      exportProjectExcel(fresh);
    }catch(err){
      alert("Error exportando Excel: " + (err?.message || err));
    }
  });

  // ====== PDFs ======
  UI.qs("#btnPdfPresupuesto")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      await PDF.exportPresupuestoPDF(fresh);
    }catch(err){
      alert("Error generando PDF: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfPresupuestoAPUs")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      await PDF.exportPresupuestoConAPUsPDF(fresh);
    }catch(err){
      alert("Error generando PDF + APUs: " + (err?.message || err));
    }
  });

  UI.qs("#btnDlPdfPresupuesto")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      await PDF.exportPresupuestoPDF(fresh);
    }catch(err){
      alert("Error descargando PDF Presupuesto: " + (err?.message || err));
    }
  });

  UI.qs("#btnDlPdfPresupuestoAPUs")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      await PDF.exportPresupuestoConAPUsPDF(fresh);
    }catch(err){
      alert("Error descargando PDF Presupuesto + APUs: " + (err?.message || err));
    }
  });

  UI.qs("#btnPdfEspecificacionesTec")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      await PDF.exportEspecificacionesTecnicasPDF(fresh);
    }catch(err){
      alert("Error generando PDF Especificaciones Técnicas: " + (err?.message || err));
    }
  });

  UI.qs("#btnDlPdfEspecificacionesTec")?.addEventListener("click", async ()=>{
    try{
      const fresh = StorageAPI.getProjectById(projectId);
      if(!fresh) return;
      await PDF.exportEspecificacionesTecnicasPDF(fresh);
    }catch(err){
      alert("Error descargando PDF Especificaciones Técnicas: " + (err?.message || err));
    }
  });

  /* =========================================================
     ✅ AJUSTES: guarda Formato Institucional COMPLETO (por proyecto)
     ========================================================= */
  UI.qs("#formAjustes")?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);

    const aiuPct = Number(fd.get("aiuPct") || 0);
    const ivaPct = Number(fd.get("ivaPct") || 0);
    const ivaBase = String(fd.get("ivaBase") || "sobre_directo_aiu");

    // ✅ institucional completo
    const instPais = String(fd.get("instPais") || "").trim();
    const instDepto = String(fd.get("instDepto") || "").trim();
    const instMunicipio = String(fd.get("instMunicipio") || "").trim();
    const instEntidad = String(fd.get("instEntidad") || "").trim();
    const instProyectoLabel = String(fd.get("instProyectoLabel") || "").trim();
    const instFechaElab = String(fd.get("instFechaElab") || "").trim();

    StorageAPI.updateProject(projectId, {
      aiuPct, ivaPct, ivaBase,
      instPais, instDepto, instMunicipio, instEntidad, instProyectoLabel, instFechaElab
    });

    const fresh = StorageAPI.getProjectById(projectId);
    alert("Ajustes guardados.");
    renderProjectDetail(fresh);
    renderResumenItems(fresh);
  });

  // ✅ Precargar valores en el formulario, incluyendo institucional + logo preview
  const form = UI.qs("#formAjustes");
  if(form){
    form.aiuPct.value = String(project.aiuPct||0);
    form.ivaPct.value = String(project.ivaPct||0);
    form.ivaBase.value = project.ivaBase || "sobre_directo_aiu";

    if(form.instPais) form.instPais.value = String(project.instPais || "");
    if(form.instDepto) form.instDepto.value = String(project.instDepto || "");
    if(form.instMunicipio) form.instMunicipio.value = String(project.instMunicipio || "");
    if(form.instEntidad) form.instEntidad.value = String(project.instEntidad || "");
    if(form.instProyectoLabel) form.instProyectoLabel.value = String(project.instProyectoLabel || "");
    if(form.instFechaElab) form.instFechaElab.value = String(project.instFechaElab || "");
  }

  UI.qs("#docsInput")?.addEventListener("change", async (e)=>{
    const files = Array.from(e.target.files || []);
    if(!files.length) return;

    const MAX_FILE = 25 * 1024 * 1024;
    const tooBig = files.find(f => (f.size||0) > MAX_FILE);
    if(tooBig){ alert(`Archivo demasiado grande (>25MB): ${tooBig.name}`); e.target.value=""; return; }

    for(const f of files){
      await DB.putFile({
        ownerType:"project",
        ownerId: projectId,
        kind:"doc_project",
        name: f.name,
        mime: f.type || "application/octet-stream",
        size: f.size || 0,
        blob: f
      });
    }
    e.target.value = "";
    await renderDocs(projectId);
    alert("Documentos guardados.");
  });

  // ✅ Exportar proyecto con adjuntos base64
  UI.qs("#btnExportProj")?.addEventListener("click", async ()=>{
    try{
      const p = StorageAPI.getProjectById(projectId);
      if(!p) return;

      const metaDocs = await DB.listFilesByOwner("project", projectId);
      const docs = [];
      for(const m of metaDocs){
        const full = await DB.getFile(m.id);
        if(!full || !full.blob) continue;
        const dataUrl = await blobToDataUrl(full.blob);
        docs.push({
          name: full.name || m.name || "archivo",
          mime: full.mime || m.mime || "application/octet-stream",
          size: Number(full.size || m.size || 0),
          createdAt: full.createdAt || m.createdAt || nowISO(),
          dataUrl
        });
      }

      const payload = { meta: StorageAPI.loadStore().meta, project: p, docs };
      const blob = new Blob([JSON.stringify(payload,null,2)], {type:"application/json"});
      const url = URL.createObjectURL(blob);
      UI.downloadBlobUrl(url, `proyecto_${(p.name||"").replace(/\s+/g,"_")}_${Date.now()}.json`);
    }catch(err){
      alert("Error exportando proyecto: " + (err?.message || err));
    }
  });

  UI.qs("#btnDeleteProj")?.addEventListener("click", async ()=>{
    if(!confirm("¿Eliminar proyecto y sus documentos?")) return;
    await DB.deleteFilesByOwner("project", projectId).catch(()=>{});
    StorageAPI.deleteProject(projectId);
    alert("Proyecto eliminado.");
    window.location.href = "proyectos.html";
  });

  UI.qs("#btnExportBackup")?.addEventListener("click", ()=>{
    const { url, filename } = StorageAPI.exportBackup();
    UI.downloadBlobUrl(url, filename);
  });

  UI.qs("#fileImport2")?.addEventListener("change", async (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;
    try{
      await StorageAPI.importBackupFromFile(f);
      alert("Backup importado. Se recargará.");
      window.location.reload();
    }catch(err){
      alert("Error importando backup: " + err.message);
    }finally{
      e.target.value = "";
    }
  });

  UI.qs("#btnResetAll")?.addEventListener("click", async ()=>{
    if(!confirm("¿Borrar TODO? (proyectos + documentos)")) return;

    const alsoBase = confirm("¿También deseas borrar la Base APU (IndexedDB)?\n\nOJO: tendrás que instalar el XLSX de nuevo.");

    const ps = StorageAPI.listProjects();
    for(const p of ps){
      await DB.deleteFilesByOwner("project", p.id).catch(()=>{});
    }
    StorageAPI.resetAll();

    if(alsoBase){
      try{ await APUBase.deleteBaseDatabase(); }catch(_){}
    }

    alert("Listo. Se recargará.");
    window.location.href = "proyectos.html";
  });

  // Base APU búsquedas
  UI.qs("#btnApuSearch")?.addEventListener("click", async ()=>{
    try{
      const meta = await APUBase.getMeta();
      if(!meta){
        alert("Primero instala la Base APU (XLSX) desde Proyectos.");
        return;
      }
      const q = (UI.qs("#apuSearch")?.value || "").trim();
      if(!q) return;

      const results = await APUBase.search(q, 30);
      renderApuResults(projectId, results);
    }catch(err){
      alert("Error buscando en base: " + (err?.message || err));
    }
  });

  UI.qs("#apuSearch")?.addEventListener("keydown", (e)=>{
    if(e.key === "Enter"){
      e.preventDefault();
      UI.qs("#btnApuSearch")?.click();
    }
  });

  // Agregar manual
  UI.qs("#formAddManual")?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const chapterCode = String(fd.get("chapterCode") || "").trim();
    const chapterName = String(fd.get("chapterName") || "").trim();
    const code = String(fd.get("code") || "").trim();
    const unit = String(fd.get("unit") || "").trim();
    const desc = String(fd.get("desc") || "").trim();
    const pu = Number(String(fd.get("pu") || "0").replaceAll(",",""));
    const qty = Number(String(fd.get("qty") || "0").replaceAll(",",""));

    if(!code || !unit || !desc) { alert("Completa código, unidad y descripción."); return; }
    if(!(pu > 0) || !(qty > 0)) { alert("PU y Cantidad deben ser > 0."); return; }

    StorageAPI.addItem(projectId, { chapterCode, chapterName, code, unit, desc, pu, qty });

    e.target.reset();
    const fresh = StorageAPI.getProjectById(projectId);
    renderProjectDetail(fresh);
    renderChaptersTable(fresh);
    renderItemsTable(fresh);
    renderResumenItems(fresh);
    alert("Ítem agregado.");
  });
}

/* ---------- APU PAGE (Override por proyecto) ---------- */
async function bindAPUPage(){
  const code = UI.getParam("code");
  const sub = UI.getParam("sub");
  const projectId = UI.getParam("projectId");

  const btnGo = UI.qs("#btnGoProject");
  if(btnGo){
    btnGo.href = projectId
      ? `proyecto-detalle.html?projectId=${encodeURIComponent(projectId)}&tab=items`
      : "proyectos.html";
  }

  const titleEl = UI.qs("#apuTitle");
  const subEl = UI.qs("#apuSub");
  const infoEl = UI.qs("#apuInfo");
  const bodyEl = UI.qs("#apuBody");
  const emptyEl = UI.qs("#apuEmpty");

  const editor = UI.qs("#apuEditor");
  const btnAddLine = UI.qs("#btnAddLine");
  const btnSaveOverride = UI.qs("#btnSaveOverride");
  const btnResetOverride = UI.qs("#btnResetOverride");

  let editMode = false;
  let localLines = [];

  function computeDirecto(lines){
    return (lines||[]).reduce((s,l)=>{
      const qty = Number(l.qty||0);
      const pu = Number(l.pu||0);
      const parcial = Number(l.parcial||0) || (qty*pu);
      return s + parcial;
    },0);
  }

  function renderLines(){
    if(!bodyEl) return;
    if(!localLines.length){
      bodyEl.innerHTML = "";
      emptyEl && (emptyEl.style.display = "");
      return;
    }
    emptyEl && (emptyEl.style.display = "none");

    bodyEl.innerHTML = localLines.map((l, idx)=>{
      const qty = Number(l.qty||0);
      const pu = Number(l.pu||0);
      const parcial = Number(l.parcial||0) || (qty*pu);

      const action = editMode
        ? `<div class="row" style="gap:8px">
             <button class="btn" type="button" data-editline="${idx}">Editar</button>
             <button class="btn danger" type="button" data-rmline="${idx}">Quitar</button>
           </div>`
        : (l.subRef
          ? `<a class="btn" href="apu.html?sub=${encodeURIComponent(l.subRef)}${projectId?`&projectId=${encodeURIComponent(projectId)}`:""}">Ver subproducto</a>`
          : `<span class="muted small">—</span>`);

      return `
        <tr>
          <td>${UI.esc(l.group||l.tipo||"-")}</td>
          <td>${UI.esc(l.desc||"")}</td>
          <td>${UI.esc(l.unit||"")}</td>
          <td style="text-align:right">${UI.esc(String(qty||0))}</td>
          <td style="text-align:right"><b>${UI.fmtMoney(pu,"COP")}</b></td>
          <td style="text-align:right"><b>${UI.fmtMoney(parcial,"COP")}</b></td>
          <td>${action}</td>
        </tr>
      `;
    }).join("");

    bodyEl.querySelectorAll("[data-rmline]").forEach(b=>{
      b.addEventListener("click", ()=>{
        const i = Number(b.getAttribute("data-rmline"));
        localLines.splice(i,1);
        renderLines();
      });
    });

    bodyEl.querySelectorAll("[data-editline]").forEach(b=>{
      b.addEventListener("click", ()=>{
        const i = Number(b.getAttribute("data-editline"));
        const cur = localLines[i];
        if(!cur) return;

        const group = prompt("Grupo:", cur.group||cur.tipo||"") ?? (cur.group||cur.tipo||"");
        const desc = prompt("Descripción:", cur.desc||"") ?? (cur.desc||"");
        const unit = prompt("Unidad:", cur.unit||"") ?? (cur.unit||"");
        const qty = Number(prompt("Cant/Rend:", String(cur.qty||0)) ?? cur.qty);
        const pu = Number(prompt("PU:", String(cur.pu||0)) ?? cur.pu);
        const parcial = qty * pu;

        localLines[i] = { ...cur, group, desc, unit, qty, pu, parcial };
        renderLines();
      });
    });
  }

  let apu = null;

  if(code){
    if(projectId){
      const ov = StorageAPI.getApuOverride(projectId, code);
      if(ov && Array.isArray(ov.lines) && ov.lines.length){
        apu = {
          title: `APU ${code}`,
          subtitle: "(Override del proyecto)",
          header: `${code} — Override del proyecto`,
          metaLine: `Fuente: Override del proyecto · Actualizado: ${(ov.updatedAt||"").slice(0,19).replace("T"," ")}`,
          unit: "",
          directo: computeDirecto(ov.lines),
          lines: ov.lines.map(x=>({ ...x, subRef:"" }))
        };
      }
    }

    if(!apu){
      const custom = StorageAPI.getCustomAPU(code);
      if(custom){
        const directo = (custom.lines||[]).reduce((s,l)=> s + Number(l.parcial||0), 0);
        apu = {
          title: `APU ${custom.code}`,
          subtitle: custom.desc || "",
          header: `${custom.code} — ${custom.desc||""}`,
          metaLine: `APU creado en la app · Capítulo ${custom.chapterCode||"-"} ${custom.chapterName||""}`,
          unit: custom.unit || "",
          directo,
          lines: (custom.lines||[]).map(l=>({ group:l.tipo||l.group||"-", desc:l.desc, unit:l.unit, qty:l.qty, pu:l.pu, parcial:l.parcial, subRef:"" }))
        };
      }else{
        apu = await APUBase.getAPU(code);
      }
    }
  }else if(sub){
    apu = await APUBase.getSubAPU(sub);
  }

  if(!apu){
    titleEl && (titleEl.textContent = "APU");
    subEl && (subEl.textContent = "No se encontró el APU solicitado. ¿Instalaste la base XLSX?");
    infoEl && (infoEl.innerHTML = `<div class="muted">Instala la base y verifica el código.</div>`);
    return;
  }

  titleEl && (titleEl.textContent = apu.title || "APU");
  subEl && (subEl.textContent = apu.subtitle || "");

  infoEl && (infoEl.innerHTML = `
    <div class="cardhead">
      <h2>${UI.esc(apu.header || "")}</h2>
      <p class="muted small">${UI.esc(apu.metaLine||"")}</p>
    </div>
    <div class="grid two">
      <div class="item"><div class="name">Unidad</div><div class="muted small">${UI.esc(apu.unit||"-")}</div></div>
      <div class="item"><div class="name">Costo directo</div><div class="muted small"><b>${UI.fmtMoney(apu.directo||0,"COP")}</b></div></div>
    </div>
  `);

  if(projectId && code){
    btnSaveOverride && (btnSaveOverride.style.display = "");
    btnResetOverride && (btnResetOverride.style.display = "");

    localLines = (apu.lines||[]).map(l=>({
      group: l.group || l.tipo || "-",
      desc: l.desc || "",
      unit: l.unit || "",
      qty: Number(l.qty||0),
      pu: Number(l.pu||0),
      parcial: Number(l.parcial||0) || (Number(l.qty||0)*Number(l.pu||0))
    }));

    editor && (editor.style.display = "");
    editMode = true;

    btnAddLine?.addEventListener("click", ()=>{
      const group = prompt("Grupo:", "MATERIALES") || "";
      const desc = prompt("Descripción:", "") || "";
      const unit = prompt("Unidad:", "UND") || "";
      const qty = Number(prompt("Cant/Rend:", "1") || "0");
      const pu = Number(prompt("PU:", "0") || "0");
      if(!desc.trim()) return;
      if(!(qty>0) || !(pu>=0)) return;
      localLines.push({ group, desc, unit, qty, pu, parcial: qty*pu });
      renderLines();
    });

    btnSaveOverride?.addEventListener("click", ()=>{
      if(!confirm("¿Guardar override del APU para este proyecto?\nEsto actualizará el PU del ítem en el presupuesto.")) return;

      const cleaned = localLines.map(l=>({
        group: String(l.group||"-"),
        desc: String(l.desc||""),
        unit: String(l.unit||""),
        qty: Number(l.qty||0),
        pu: Number(l.pu||0),
        parcial: Number(l.parcial||0) || (Number(l.qty||0)*Number(l.pu||0))
      }));

      StorageAPI.setApuOverride(projectId, code, cleaned);

      const newPU = computeDirecto(cleaned);
      const count = StorageAPI.updateItemsPUByCode(projectId, code, newPU);

      alert(`Override guardado.\nNuevo PU (Costo directo): ${UI.fmtMoney(newPU,"COP")}\nÍtems actualizados: ${count}`);
      apu.directo = newPU;
      subEl && (subEl.textContent = "(Override del proyecto)");
      renderLines();
    });

    btnResetOverride?.addEventListener("click", async ()=>{
      if(!confirm("¿Quitar override del proyecto?\n(NO borra la Base APU).")) return;
      StorageAPI.clearApuOverride(projectId, code);
      alert("Override eliminado. Vuelve a abrir el APU para ver el original (base/custom).");
      location.reload();
    });
  }

  renderLines();
}

/* ---------- BOOT ---------- */
(function boot(){
  initPWA();
  const p = page();
  if(p==="proyectos.html") bindProjectsPage();
  if(p==="proyecto-detalle.html") bindProjectDetailPage();
  if(p==="apu.html") bindAPUPage();
})();