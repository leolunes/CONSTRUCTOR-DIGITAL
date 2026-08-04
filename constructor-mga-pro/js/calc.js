function calcTotals(project){
  const items = project.items || [];
  const directo = items.reduce((s,it)=> s + (Number(it.pu||0) * Number(it.qty||0)), 0);

  // =========================================================
  // ✅ NUEVO ESQUEMA (como formato institucional)
  //   Directo
  //   + Administración (%)
  //   + Imprevistos (%)
  //   + Utilidad (%)
  //   = Subtotal
  //   + IVA sobre Utilidad (%)
  //   = Total
  //
  // ✅ COMPATIBILIDAD:
  // - Si no existen adminPct/imprevPct/utilPct/ivaUtilPct,
  //   usamos aiuPct como adminPct y ivaPct como ivaUtilPct.
  // =========================================================

  const adminPct = Number(
    (project.adminPct ?? project.administracionPct ?? project.aiuPct ?? 0)
  );
  const imprevPct = Number(
    (project.imprevPct ?? project.imprevistosPct ?? 0)
  );
  const utilPct = Number(
    (project.utilPct ?? project.utilidadPct ?? 0)
  );

  // IVA sobre utilidad (nuevo)
  const ivaUtilPct = Number(
    (project.ivaUtilPct ?? project.ivaSobreUtilidadPct ?? project.ivaPct ?? 0)
  );

  const admin = directo * (adminPct/100);
  const imprev = directo * (imprevPct/100);
  const util = directo * (utilPct/100);

  const subtotal = directo + admin + imprev + util;

  // IVA SOLO sobre utilidad
  const iva = util * (ivaUtilPct/100);

  const total = subtotal + iva;

  // ✅ Mantener "aiu" para compatibilidad:
  const aiu = admin + imprev + util;

  return {
    // base
    directo,

    // nuevo formato
    adminPct, imprevPct, utilPct, ivaUtilPct,
    admin, imprev, util,
    subtotal,

    // ✅ CLAVE DEL ARREGLO:
    // PDF esperaba ivaUtil y antes calc.js solo devolvía iva
    iva,
    ivaUtil: iva,

    total,

    // compatibilidad legacy
    aiu
  };
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