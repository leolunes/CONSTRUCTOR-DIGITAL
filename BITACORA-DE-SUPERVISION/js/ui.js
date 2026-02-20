// js/ui.js
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

function chipStatus(label, kind=""){
  const cls = kind ? `chip ${kind}` : "chip";
  return `<span class="${cls}">${esc(label)}</span>`;
}

function statusFromHallazgo(h){
  if(h.estado==="cerrado") return chipStatus("CERRADO","ok");
  const sev=(h.severidad||"").toLowerCase();
  if(sev==="critica") return chipStatus("ABIERTO · CRÍTICO","bad");
  if(sev==="mayor") return chipStatus("ABIERTO · MAYOR","warn");
  return chipStatus("ABIERTO","warn");
}

function fmtBytes(bytes=0){
  const b = Number(bytes||0);
  if(!b) return "0 B";
  const k = 1024;
  const sizes = ["B","KB","MB","GB"];
  const i = Math.min(Math.floor(Math.log(b)/Math.log(k)), sizes.length-1);
  return `${(b/Math.pow(k,i)).toFixed(i===0?0:1)} ${sizes[i]}`;
}

function downloadBlobUrl(url, filename){
  const a = document.createElement("a");
  a.href=url; a.download=filename || "archivo";
  document.body.appendChild(a);
  a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}

/* ===== IDB download ===== */
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

/* ===== Share (WhatsApp/Email si el navegador lo soporta) ===== */
async function shareFile(blob, filename){
  try{
    if(navigator.share && navigator.canShare){
      const file = new File([blob], filename, { type: blob.type || "application/pdf" });
      if(navigator.canShare({ files:[file] })){
        await navigator.share({ files:[file], title: filename });
        return true;
      }
    }
  }catch(_){}
  // fallback: descargar
  const url = URL.createObjectURL(blob);
  downloadBlobUrl(url, filename);
  return false;
}

/* ===== Previews simples ===== */
function renderEvidencePreviews(container, evidences){
  if(!container) return;
  if(!evidences?.length){ container.innerHTML=""; return; }
  container.innerHTML = evidences.map(ev => {
    const isImg = (ev.mime||"").startsWith("image/");
    const thumb = isImg
      ? `<div style="padding:12px">🖼️ ${esc(ev.name||"foto")}</div>`
      : `<div style="padding:12px">📄 ${esc(ev.name||"archivo")}</div>`;
    return `<div class="preview">${thumb}<div class="cap">${esc(ev.name||"")}</div></div>`;
  }).join("");
}

window.UI = {
  qs, getParam, esc,
  chipStatus, statusFromHallazgo,
  fmtBytes,
  downloadBlobUrl,
  downloadFileFromIDB,
  shareFile,
  renderEvidencePreviews
};