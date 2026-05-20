function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

function byId(id){
  return document.getElementById(id);
}

function getParam(name){
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

function esc(s=""){
  return String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

function safeStr(v=""){
  return String(v ?? "").trim();
}

function toNum(v, def=0){
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function isEmpty(val){
  return val == null || String(val).trim() === "";
}

function arr(v){
  return Array.isArray(v) ? v : [];
}

function chip(label, kind=""){
  const cls = kind ? `chip ${kind}` : "chip";
  return `<span class="${cls}">${esc(label)}</span>`;
}

function badge(label, kind=""){
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

function fmtQty(n){
  const v = Number(n || 0);
  return v.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4
  });
}

function fmtPct(n){
  const v = Number(n || 0);
  return `${v.toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}%`;
}

function fmtDate(v){
  const s = safeStr(v);
  if(!s) return "";
  const d = new Date(s);
  if(Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("es-CO");
}

function fmtDateTime(v){
  const s = safeStr(v);
  if(!s) return "";
  const d = new Date(s);
  if(Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("es-CO");
}

function yesNo(v){
  return v ? "Sí" : "No";
}

function statusKind(status){
  const s = safeStr(status).toUpperCase()
    .replace(/Á/g, "A")
    .replace(/É/g, "E")
    .replace(/Í/g, "I")
    .replace(/Ó/g, "O")
    .replace(/Ú/g, "U");

  if(s === "PAGADA") return "ok";
  if(s === "APROBADA") return "warn";
  if(s === "BORRADOR") return "";
  return "";
}

function actaEstadoChip(status){
  const s = safeStr(status).toUpperCase() || "BORRADOR";
  return chip(s, statusKind(s));
}

function alertLevelChip(level){
  const s = safeStr(level).toLowerCase();
  if(s === "alto") return chip("ALTO", "danger");
  if(s === "medio") return chip("MEDIO", "warn");
  if(s === "bajo") return chip("BAJO", "ok");
  return chip((safeStr(level) || "INFO").toUpperCase());
}

function diffStateChip(v){
  const n = Number(v || 0);
  if(n > 0) return chip("SUPERA", "danger");
  if(n < 0) return chip("POR DEBAJO", "ok");
  return chip("EN EQUILIBRIO");
}

function boolChip(v, yes="Sí", no="No"){
  return v ? chip(yes, "ok") : chip(no);
}

function emptyRow(colspan, msg="Sin registros"){
  return `<tr><td colspan="${Number(colspan||1)}" class="muted">${esc(msg)}</td></tr>`;
}

function textOrDash(v){
  const s = safeStr(v);
  return s || "—";
}

function setHTML(elOrId, html){
  const el = typeof elOrId === "string" ? byId(elOrId) : elOrId;
  if(el) el.innerHTML = html;
  return el;
}

function setText(elOrId, text){
  const el = typeof elOrId === "string" ? byId(elOrId) : elOrId;
  if(el) el.textContent = text == null ? "" : String(text);
  return el;
}

function setValue(elOrId, value){
  const el = typeof elOrId === "string" ? byId(elOrId) : elOrId;
  if(el) el.value = value == null ? "" : String(value);
  return el;
}

function show(elOrId, display=""){
  const el = typeof elOrId === "string" ? byId(elOrId) : elOrId;
  if(el) el.style.display = display;
  return el;
}

function hide(elOrId){
  const el = typeof elOrId === "string" ? byId(elOrId) : elOrId;
  if(el) el.style.display = "none";
  return el;
}

function toggle(elOrId, visible, display=""){
  return visible ? show(elOrId, display) : hide(elOrId);
}

function clearNode(elOrId){
  const el = typeof elOrId === "string" ? byId(elOrId) : elOrId;
  if(el) el.innerHTML = "";
  return el;
}

function on(elOrId, eventName, handler, opts){
  const el = typeof elOrId === "string" ? byId(elOrId) : elOrId;
  if(el && typeof handler === "function"){
    el.addEventListener(eventName, handler, opts);
  }
  return el;
}

function delegate(rootOrId, eventName, selector, handler){
  const root = typeof rootOrId === "string" ? byId(rootOrId) : rootOrId;
  if(!root) return null;

  root.addEventListener(eventName, (ev)=>{
    const target = ev.target.closest(selector);
    if(target && root.contains(target)){
      handler(ev, target);
    }
  });

  return root;
}

function renderOptions(items, mapFn, placeholder=""){
  const rows = arr(items).map((item, idx)=>{
    const r = typeof mapFn === "function" ? mapFn(item, idx) : item;
    const value = esc(r?.value ?? "");
    const label = esc(r?.label ?? r?.value ?? "");
    const selected = r?.selected ? " selected" : "";
    return `<option value="${value}"${selected}>${label}</option>`;
  });

  if(placeholder){
    rows.unshift(`<option value="">${esc(placeholder)}</option>`);
  }

  return rows.join("");
}

function renderTableRows(tbodyOrId, rowsHtml, emptyElOrId=null, hasRows=true){
  const tbody = typeof tbodyOrId === "string" ? byId(tbodyOrId) : tbodyOrId;
  if(tbody){
    tbody.innerHTML = rowsHtml || "";
  }

  if(emptyElOrId){
    toggle(emptyElOrId, !hasRows);
  }

  return tbody;
}

function normalizeAlertList(list){
  return arr(list).map(it => ({
    level: safeStr(it?.level),
    type: safeStr(it?.type),
    code: safeStr(it?.code),
    chapterCode: safeStr(it?.chapterCode),
    desc: safeStr(it?.desc),
    value: toNum(it?.value, 0),
    message: safeStr(it?.message)
  }));
}

function renderAlertRows(list){
  const rows = normalizeAlertList(list);
  if(!rows.length) return "";

  return rows.map(r => `
    <tr>
      <td>${alertLevelChip(r.level)}</td>
      <td>${esc(r.type || "ALERTA")}</td>
      <td>${esc(r.chapterCode || "—")}</td>
      <td>${esc(r.code || "—")}</td>
      <td>${esc(r.desc || "—")}</td>
      <td style="text-align:right">${fmtMoney(r.value || 0)}</td>
      <td>${esc(r.message || "—")}</td>
    </tr>
  `).join("");
}

function renderActaResumenRows(actas, currency="COP"){
  const rows = arr(actas);
  if(!rows.length) return "";

  return rows.map(a => `
    <tr data-acta-id="${esc(a.id)}">
      <td>${esc(a.numero || "—")}</td>
      <td>${esc(fmtDate(a.fecha) || "—")}</td>
      <td>${esc(a.periodo || "—")}</td>
      <td>${actaEstadoChip(a.estado || "BORRADOR")}</td>
      <td style="text-align:right">${fmtQty(a.totalLineas || 0)}</td>
      <td style="text-align:right">${fmtMoney(a.totalValor || 0, currency)}</td>
      <td>${esc(a.observacion || "—")}</td>
    </tr>
  `).join("");
}

function renderActaDetalleRows(lines, currency="COP"){
  const rows = arr(lines);
  if(!rows.length) return "";

  return rows.map(line => `
    <tr>
      <td>${esc(line.chapterCode || "—")}</td>
      <td>${esc(line.code || "—")}</td>
      <td>${esc(line.desc || "—")}</td>
      <td>${esc(line.unit || "—")}</td>
      <td style="text-align:right">${fmtQty(line.qtyPresupuesto || 0)}</td>
      <td style="text-align:right">${fmtQty(line.qtyEjecutadoPrevio || 0)}</td>
      <td style="text-align:right">${fmtQty(line.qtyActa || 0)}</td>
      <td style="text-align:right">${fmtQty(line.qtySaldoLuego || 0)}</td>
      <td style="text-align:right">${fmtMoney(line.pu || 0, currency)}</td>
      <td style="text-align:right">${fmtMoney(line.parcial || 0, currency)}</td>
    </tr>
  `).join("");
}

function renderExecutionRows(rows, currency="COP"){
  const list = arr(rows);
  if(!list.length) return "";

  return list.map(r => `
    <tr>
      <td>${esc(r.chapterCode || "—")}</td>
      <td>${esc(r.code || "—")}</td>
      <td>${esc(r.desc || "—")}</td>
      <td>${esc(r.unit || "—")}</td>
      <td style="text-align:right">${fmtQty(r.qtyPresupuesto || 0)}</td>
      <td style="text-align:right">${fmtQty(r.qtyEjecutada || 0)}</td>
      <td style="text-align:right">${fmtQty(r.qtyPendiente || 0)}</td>
      <td style="text-align:right">${fmtMoney(r.pu || 0, currency)}</td>
      <td style="text-align:right">${fmtMoney(r.valorPresupuesto || 0, currency)}</td>
      <td style="text-align:right">${fmtMoney(r.valorEjecutado || 0, currency)}</td>
      <td style="text-align:right">${fmtMoney(r.valorPendiente || 0, currency)}</td>
      <td>${r.overExecuted ? chip("SUPERADO", "danger") : chip("OK", "ok")}</td>
    </tr>
  `).join("");
}

function downloadBlobUrl(url, filename){
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "archivo";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}

async function downloadFileFromIDB(fileId){
  if(!fileId) return;
  const rec = await DB.getFile(fileId);
  if(!rec || !rec.blob){
    alert("No se encontró el archivo en IndexedDB.");
    return;
  }
  const url = URL.createObjectURL(rec.blob);
  downloadBlobUrl(url, rec.name || "archivo");
}

window.UI = {
  qs, qsa, byId,
  getParam,
  esc,

  chip,
  badge,
  actaEstadoChip,
  alertLevelChip,
  diffStateChip,
  boolChip,

  fmtBytes,
  fmtMoney,
  fmtQty,
  fmtPct,
  fmtDate,
  fmtDateTime,

  safeStr,
  toNum,
  isEmpty,
  arr,
  textOrDash,

  setHTML,
  setText,
  setValue,
  show,
  hide,
  toggle,
  clearNode,
  on,
  delegate,

  renderOptions,
  renderTableRows,
  emptyRow,

  normalizeAlertList,
  renderAlertRows,
  renderActaResumenRows,
  renderActaDetalleRows,
  renderExecutionRows,

  downloadBlobUrl,
  downloadFileFromIDB
};