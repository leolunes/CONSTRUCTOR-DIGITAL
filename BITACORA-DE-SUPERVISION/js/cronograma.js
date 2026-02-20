// js/cronograma.js
(function(){
  function normalizeAct(a){
    return {
      id: a.id || StorageAPI.uid("act"),
      nombre: a.nombre || "",
      inicio: a.inicio || "",
      fin: a.fin || "",
      peso: Number(a.peso||0),
      estado: a.estado || "no_iniciada", // no_iniciada | en_proceso | terminada
      pct: Number(a.pct||0),
      obs: a.obs || ""
    };
  }

  function calcAvance(acts){
    const items = (acts||[]).map(normalizeAct);
    const pesoTotal = items.reduce((s,a)=>s + Number(a.peso||0), 0) || 0;

    let sum = 0;
    for(const a of items){
      const w = Number(a.peso||0);
      let p = 0;
      if(a.estado === "terminada") p = 100;
      else if(a.estado === "en_proceso") p = Math.max(0, Math.min(100, Number(a.pct||0)));
      else p = 0;
      sum += w * (p/100);
    }
    const avance = pesoTotal ? (sum / pesoTotal) * 100 : 0;
    return { avance, pesoTotal };
  }

  function ganttStyle(act, minTs, maxTs){
    const a = normalizeAct(act);
    const s = a.inicio ? new Date(a.inicio).getTime() : minTs;
    const e = a.fin ? new Date(a.fin).getTime() : s + 86400000;
    const span = Math.max(1, maxTs - minTs);
    const leftPct = ((s - minTs)/span)*100;
    const widthPct = (Math.max(1, e - s)/span)*100;
    return {
      leftPct: Math.max(0, Math.min(100, leftPct)),
      widthPct: Math.max(0.5, Math.min(100, widthPct))
    };
  }

  window.Crono = { normalizeAct, calcAvance, ganttStyle };
})();