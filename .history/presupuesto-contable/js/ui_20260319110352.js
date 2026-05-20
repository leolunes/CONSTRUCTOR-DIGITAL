function qs(sel){ return document.querySelector(sel); }

function getParam(name){
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

function esc(s=""){
  return String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

function chip(label, kind=""){
  const cls = kind ? `chip ${kind}` : "chip";
  return `<span class="${cls}">${esc(label)}</span>`;
}

function fmtBytes(bytes=0){
  const b = Number(bytes||0);
  if(!b) return "0 B";
  const k = 1024;
  const sizes = ["B","KB","MB","GB"];
  const i = Math.min(Math.floor(Math.log(b)/Math.log(k)), sizes.length-1);
  return `${(b/Math.pow(k,i)).toFixed(i===0?0:1)} ${sizes[i]}`;
}

function fmtMoney(n, currency="COP"){
  const v = Number(n||0);
  if(currency === "COP") return "$ " + Math.round(v).toLocaleString("es-CO");
  return `${currency} ` + Math.round(v).toLocaleString("es-CO");
}

function downloadBlobUrl(url, filename){
  const a = document.createElement("a");
  a.href=url; a.download=filename || "archivo";
  document.body.appendChild(a);
  a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}

async function downloadFileFromIDB(fileId){
  if(!fileId) return;
  const rec = await DB.getFile(fileId);
  if(!rec || !rec.blob){ alert("No se encontró el archivo en IndexedDB."); return; }
  const url = URL.createObjectURL(rec.blob);
  downloadBlobUrl(url, rec.name || "archivo");
}

/* =========================================================
   🔥 NUEVO: GESTIÓN DE PRESUPUESTO ACTIVO (UI)
   ========================================================= */

const BUDGET_OFICIAL = "oficial";
const BUDGET_CONTRATISTA = "contratista";

function getActiveBudget(projectId){
  if(!projectId) return BUDGET_CONTRATISTA;
  try{
    return StorageAPI.getActiveBudget(projectId) || BUDGET_CONTRATISTA;
  }catch(_){
    return BUDGET_CONTRATISTA;
  }
}

function setActiveBudget(projectId, budgetKey){
  if(!projectId) return;
  try{
    return StorageAPI.setActiveBudget(projectId, budgetKey);
  }catch(_){
    return null;
  }
}

function getBudgetLabel(key){
  if(key === BUDGET_OFICIAL) return "Presupuesto Oficial";
  return "Presupuesto Contratista";
}

function renderBudgetSelector(projectId, containerSelector){
  const el = qs(containerSelector);
  if(!el) return;

  const active = getActiveBudget(projectId);

  el.innerHTML = `
    <div class="budget-switch">
      <button class="btn-budget ${active===BUDGET_OFICIAL?"active":""}" data-budget="${BUDGET_OFICIAL}">
        OFICIAL
      </button>
      <button class="btn-budget ${active===BUDGET_CONTRATISTA?"active":""}" data-budget="${BUDGET_CONTRATISTA}">
        CONTRATISTA
      </button>
    </div>
  `;

  el.querySelectorAll(".btn-budget").forEach(btn=>{
    btn.onclick = ()=>{
      const key = btn.dataset.budget;
      setActiveBudget(projectId, key);
      location.reload(); // recarga simple para mantener estabilidad
    };
  });
}

/* =========================================================
   🔥 NUEVO: BOTÓN AUDITORÍA PRESUPUESTAL
   ========================================================= */

function renderAuditButton(containerSelector, onClick){
  const el = qs(containerSelector);
  if(!el) return;

  const btn = document.createElement("button");
  btn.className = "btn btn-audit";
  btn.textContent = "AUDITORÍA PRESUPUESTAL";

  btn.onclick = ()=>{
    if(typeof onClick === "function"){
      onClick();
    }else{
      alert("Función de auditoría no implementada aún.");
    }
  };

  el.appendChild(btn);
}

/* =========================================================
   🔥 NUEVO: RENDER TABLA COMPARATIVA SIMPLE
   ========================================================= */

function renderAuditTable(containerSelector, data){
  const el = qs(containerSelector);
  if(!el || !data || !Array.isArray(data.rows)) return;

  const rows = data.rows;

  el.innerHTML = `
    <table class="tabla-auditoria">
      <thead>
        <tr>
          <th>Código</th>
          <th>Descripción</th>
          <th>PU Oficial</th>
          <th>PU Contratista</th>
          <th>Diferencia %</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r=>{
          const pct = Number(r.diff?.puPct || 0);
          const color = pct > 0 ? "red" : "green";

          return `
            <tr>
              <td>${esc(r.code)}</td>
              <td>${esc(r.desc)}</td>
              <td>${fmtMoney(r.oficial?.pu)}</td>
              <td>${fmtMoney(r.contratista?.pu)}</td>
              <td style="color:${color}">
                ${pct.toFixed(2)}%
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}

/* =========================================================
   EXPORT
   ========================================================= */

window.UI = {
  qs,
  getParam,
  esc,
  chip,
  fmtBytes,
  fmtMoney,
  downloadBlobUrl,
  downloadFileFromIDB,

  // 🔥 NUEVO
  getActiveBudget,
  setActiveBudget,
  getBudgetLabel,
  renderBudgetSelector,
  renderAuditButton,
  renderAuditTable
};