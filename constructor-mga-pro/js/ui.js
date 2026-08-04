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

window.UI = { qs, getParam, esc, chip, fmtBytes, fmtMoney, downloadBlobUrl, downloadFileFromIDB };