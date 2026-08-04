// js/bases.js
// PRESUPUESTO PRO — Administración de múltiples Bases APU

(function(){
  "use strict";

  const state = {
    bases: [],
    importing: false
  };

  function qs(sel){
    return document.querySelector(sel);
  }

  function esc(value=""){
    return String(value).replace(/[&<>"']/g, char => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    }[char]));
  }

  function fmtDate(iso){
    if(!iso) return "-";

    try{
      return new Date(iso).toLocaleString("es-CO", {
        year:"numeric",
        month:"2-digit",
        day:"2-digit",
        hour:"2-digit",
        minute:"2-digit"
      });
    }catch(_){
      return String(iso);
    }
  }

  function fmtNumber(value){
    return Number(value || 0).toLocaleString("es-CO");
  }

  function getCounts(base){
    const counts = base?.counts || {};

    return {
      items: Number(counts.items || 0),
      insumos: Number(counts.insumos || 0),
      cdLines: Number(counts.cdLines || 0),
      subLines: Number(counts.subLines || 0)
    };
  }

  function setBusy(flag){
    state.importing = !!flag;

    const btn = qs("#btnImportBase");
    const file = qs("#fileBase");

    if(btn){
      btn.disabled = !!flag;
      btn.textContent = flag ? "Importando..." : "Importar nueva Base APU";
    }

    if(file){
      file.disabled = !!flag;
    }
  }

  function showMessage(message, kind="info"){
    const box = qs("#baseMessage");
    if(!box) return;

    box.className = `notice ${kind}`;
    box.textContent = message;
    box.style.display = "";
  }

  function clearMessage(){
    const box = qs("#baseMessage");
    if(!box) return;

    box.style.display = "none";
    box.textContent = "";
  }

  async function loadBases(){
    clearMessage();

    try{
      state.bases = await APUBase.listBases();
      renderSummary();
      renderBases();
    }catch(err){
      console.error(err);
      state.bases = [];
      renderSummary();
      renderBases();
      showMessage("No se pudieron cargar las Bases APU: " + (err?.message || err), "error");
    }
  }

  function renderSummary(){
    const summary = qs("#basesSummary");
    if(!summary) return;

    const total = state.bases.length;
    const active = state.bases.find(base => base.active);
    const totalItems = state.bases.reduce((sum, base)=>{
      return sum + getCounts(base).items;
    }, 0);

    summary.innerHTML = `
      <div class="card item">
        <div class="topline">
          <div class="name">Bases instaladas</div>
          <div class="chips"><span class="chip ok">${esc(String(total))}</span></div>
        </div>
        <div class="muted small">Guardadas de forma independiente.</div>
      </div>

      <div class="card item">
        <div class="topline">
          <div class="name">Base activa</div>
          <div class="chips">
            <span class="chip ${active ? "ok" : "bad"}">${esc(active ? active.name : "NINGUNA")}</span>
          </div>
        </div>
        <div class="muted small">Se usa como base general mientras no haya proyecto asociado.</div>
      </div>

      <div class="card item">
        <div class="topline">
          <div class="name">Ítems totales</div>
          <div class="chips"><span class="chip">${esc(fmtNumber(totalItems))}</span></div>
        </div>
        <div class="muted small">Suma de ítems de todas las bases.</div>
      </div>

      <div class="card item">
        <div class="topline">
          <div class="name">Modo</div>
          <div class="chips"><span class="chip ok">OFFLINE</span></div>
        </div>
        <div class="muted small">IndexedDB local del dispositivo.</div>
      </div>
    `;
  }

  function renderBases(){
    const tbody = qs("#basesBody");
    const empty = qs("#basesEmpty");

    if(!tbody) return;

    if(!state.bases.length){
      tbody.innerHTML = "";
      if(empty) empty.style.display = "";
      return;
    }

    if(empty) empty.style.display = "none";

    tbody.innerHTML = state.bases.map(base=>{
      const c = getCounts(base);

      return `
        <tr>
          <td>
            <div class="base-name-line">
              <b>${esc(base.name || "Base APU")}</b>
              ${base.active ? '<span class="chip ok">ACTIVA</span>' : ""}
            </div>
            <div class="muted small">${esc(base.filename || "base.xlsx")}</div>
          </td>

          <td style="text-align:right">${esc(fmtNumber(c.items))}</td>
          <td style="text-align:right">${esc(fmtNumber(c.insumos))}</td>
          <td style="text-align:right">${esc(fmtNumber(c.cdLines))}</td>
          <td style="text-align:right">${esc(fmtNumber(c.subLines))}</td>
          <td>${esc(fmtDate(base.createdAt))}</td>

          <td>
            <div class="row" style="gap:8px; flex-wrap:wrap">
              <button
                class="btn ${base.active ? "" : "primary"}"
                type="button"
                data-action="activate"
                data-id="${esc(base.id)}"
                ${base.active ? "disabled" : ""}
              >
                ${base.active ? "Activa" : "Usar"}
              </button>

              <button
                class="btn"
                type="button"
                data-action="rename"
                data-id="${esc(base.id)}"
              >
                Renombrar
              </button>

              <button
                class="btn danger"
                type="button"
                data-action="delete"
                data-id="${esc(base.id)}"
              >
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    tbody.querySelectorAll("[data-action]").forEach(button=>{
      button.addEventListener("click", async ()=>{
        const action = button.getAttribute("data-action");
        const id = button.getAttribute("data-id");

        if(action === "activate"){
          await activateBase(id);
        }

        if(action === "rename"){
          await renameBase(id);
        }

        if(action === "delete"){
          await deleteBase(id);
        }
      });
    });
  }

  async function activateBase(baseId){
    const base = state.bases.find(x=>x.id === baseId);
    if(!base) return;

    try{
      await APUBase.setActiveBase(baseId);
      showMessage(`Base activa: ${base.name}`, "success");
      await loadBases();
    }catch(err){
      showMessage("No se pudo activar la base: " + (err?.message || err), "error");
    }
  }

  async function renameBase(baseId){
    const base = state.bases.find(x=>x.id === baseId);
    if(!base) return;

    const newName = prompt("Nuevo nombre de la Base APU:", base.name || "");
    if(newName === null) return;

    const cleanName = String(newName || "").trim();
    if(!cleanName){
      alert("El nombre no puede quedar vacío.");
      return;
    }

    try{
      await APUBase.renameBase(baseId, cleanName);
      showMessage("Base renombrada correctamente.", "success");
      await loadBases();
    }catch(err){
      showMessage("No se pudo renombrar la base: " + (err?.message || err), "error");
    }
  }

  async function deleteBase(baseId){
    const base = state.bases.find(x=>x.id === baseId);
    if(!base) return;

    const ok = confirm(
      `¿Eliminar la Base APU "${base.name}"?\n\n` +
      `Esta acción borrará únicamente esta base y no eliminará las demás.\n\n` +
      `Los proyectos existentes no se borrarán, pero si alguno está vinculado a esta base no podrá consultarla.`
    );

    if(!ok) return;

    try{
      await APUBase.deleteBase(baseId);
      showMessage("Base eliminada correctamente.", "success");
      await loadBases();
    }catch(err){
      showMessage("No se pudo eliminar la base: " + (err?.message || err), "error");
    }
  }

  async function importBaseFromFile(file){
    if(!file || state.importing) return;

    const suggestedName = String(file.name || "Base APU")
      .replace(/\.(xlsx|xls)$/i, "")
      .trim();

    const name = prompt("Nombre para identificar esta Base APU:", suggestedName);
    if(name === null) return;

    const cleanName = String(name || "").trim();
    if(!cleanName){
      alert("Debe escribir un nombre para la Base APU.");
      return;
    }

    setBusy(true);
    showMessage("Importando la Base APU. Este proceso puede tardar unos momentos...", "info");

    try{
      const meta = await APUBase.installFromFile(file, { name:cleanName });

      showMessage(
        `Base "${meta.baseName}" importada correctamente. ` +
        `Ítems: ${fmtNumber(meta.counts?.items || 0)} · ` +
        `Costos directos: ${fmtNumber(meta.counts?.cdLines || 0)} · ` +
        `Insumos: ${fmtNumber(meta.counts?.insumos || 0)} · ` +
        `Subproductos: ${fmtNumber(meta.counts?.subLines || 0)}.`,
        "success"
      );

      await loadBases();
    }catch(err){
      console.error(err);
      showMessage("Error importando la Base APU: " + (err?.message || err), "error");
    }finally{
      setBusy(false);

      const input = qs("#fileBase");
      if(input) input.value = "";
    }
  }

  function bindEvents(){
    qs("#btnImportBase")?.addEventListener("click", ()=>{
      qs("#fileBase")?.click();
    });

    qs("#fileBase")?.addEventListener("change", async event=>{
      const file = event.target.files?.[0];
      if(!file) return;

      await importBaseFromFile(file);
    });

    qs("#btnDeleteAllBases")?.addEventListener("click", async ()=>{
      if(!state.bases.length){
        alert("No hay Bases APU para eliminar.");
        return;
      }

      const ok = confirm(
        "¿Eliminar TODAS las Bases APU?\n\n" +
        "Esta acción no elimina los proyectos, pero borra todas las bases importadas."
      );

      if(!ok) return;

      const confirmText = prompt('Para confirmar escriba: BORRAR BASES', "");
      if(String(confirmText || "").trim().toUpperCase() !== "BORRAR BASES"){
        alert("Operación cancelada.");
        return;
      }

      try{
        await APUBase.deleteAllBases();
        showMessage("Todas las Bases APU fueron eliminadas.", "success");
        await loadBases();
      }catch(err){
        showMessage("No se pudieron eliminar todas las bases: " + (err?.message || err), "error");
      }
    });

    qs("#btnRefreshBases")?.addEventListener("click", ()=>{
      loadBases();
    });
  }

  async function boot(){
    if(!window.APUBase){
      showMessage("No se cargó js/base-import.js.", "error");
      return;
    }

    bindEvents();
    await loadBases();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();