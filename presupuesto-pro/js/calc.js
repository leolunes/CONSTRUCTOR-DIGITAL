function calcTotals(project){
  const items = project.items || [];
  const directo = items.reduce((s,it)=> s + (Number(it.pu||0) * Number(it.qty||0)), 0);

  const aiuPct = Number(project.aiuPct||0);
  const ivaPct = Number(project.ivaPct||0);

  const aiu = directo * (aiuPct/100);

  let ivaBaseAmount = 0;
  if(project.ivaBase === "solo_aiu") ivaBaseAmount = aiu;
  else if(project.ivaBase === "solo_directo") ivaBaseAmount = directo;
  else ivaBaseAmount = directo + aiu;

  const iva = ivaBaseAmount * (ivaPct/100);
  const total = directo + aiu + iva;

  return { directo, aiu, iva, total };
}

function groupByChapters(project){
  const items = (project.items || []).map(it => ({
    ...it,
    parcial: Number(it.pu||0) * Number(it.qty||0)
  }));

  function chapterOf(it){
    const c = String(it.chapterCode||"").trim();
    if(c) return c;
    const code = String(it.code||"").trim();
    const ch = code.includes(".") ? code.split(".")[0] : "";
    return /^\d+$/.test(ch) ? ch : "SIN";
  }

  const map = new Map();
  for(const it of items){
    const ch = chapterOf(it);
    if(!map.has(ch)){
      map.set(ch, {
        chapterCode: ch,
        chapterName: it.chapterName || "",
        itemsCount: 0,
        subtotal: 0,
        items: []
      });
    }
    const g = map.get(ch);
    g.itemsCount += 1;
    g.subtotal += it.parcial;
    g.items.push(it);

    if(!g.chapterName && it.chapterName) g.chapterName = it.chapterName;
  }

  const groups = Array.from(map.values()).sort((a,b)=>{
    const an = Number(a.chapterCode), bn = Number(b.chapterCode);
    const aNum = Number.isFinite(an) && a.chapterCode !== "SIN";
    const bNum = Number.isFinite(bn) && b.chapterCode !== "SIN";
    if(aNum && bNum) return an - bn;
    if(a.chapterCode === "SIN") return 1;
    if(b.chapterCode === "SIN") return -1;
    return String(a.chapterCode).localeCompare(String(b.chapterCode));
  });

  return { groups, items };
}

window.Calc = { calcTotals, groupByChapters };