(function(){
  function safe(v){ return String(v ?? "").trim(); }
  function num(v){ return Number(v || 0); }

  function normText(s){
    return String(s || "")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function pctDiff(base, oficial){
    const b = num(base);
    const o = num(oficial);
    if(b === 0 && o === 0) return 0;
    if(b === 0) return 100;
    return ((o - b) / b) * 100;
  }

  function moneyDiff(base, oficial){
    return num(oficial) - num(base);
  }

  function parcial(it){
    return num(it?.pu) * num(it?.qty);
  }

  function getBaseItems(project){
    return Array.isArray(project?.items) ? project.items : [];
  }

  function getOfficialItems(project){
    return Array.isArray(project?.oficialItems) ? project.oficialItems : [];
  }

  function getBaseChapters(project){
    return Array.isArray(project?.chapters) ? project.chapters : [];
  }

  function getOfficialChapters(project){
    return Array.isArray(project?.oficialChapters) ? project.oficialChapters : [];
  }

  function itemKey(it){
    const ref = safe(it?.apuRefCode);
    const code = safe(it?.code);
    const desc = normText(it?.desc);
    const unit = normText(it?.unit);

    if(ref) return `ref:${ref}`;
    if(code) return `code:${code}`;
    if(desc) return `desc:${desc}|unit:${unit}`;
    return `row:${Math.random().toString(16).slice(2)}`;
  }

  function chapterKey(ch){
    return safe(ch?.chapterCode || ch?.code);
  }

  function buildItemIndex(items){
    const map = new Map();

    for(const it of (items || [])){
      const key = itemKey(it);

      map.set(key, {
        id: safe(it?.id),
        chapterCode: safe(it?.chapterCode),
        chapterName: safe(it?.chapterName),
        code: safe(it?.code),
        apuRefCode: safe(it?.apuRefCode),
        desc: safe(it?.desc),
        unit: safe(it?.unit),
        pu: num(it?.pu),
        qty: num(it?.qty),
        parcial: parcial(it),
        raw: it
      });
    }

    return map;
  }

  function buildChapterMapFromItems(items, chapters){
    const out = new Map();
    const manual = Array.isArray(chapters) ? chapters : [];

    for(const ch of manual){
      const code = chapterKey(ch);
      if(!code) continue;
      out.set(code, {
        chapterCode: code,
        chapterName: safe(ch?.chapterName || ch?.name),
        itemsCount: 0,
        subtotal: 0
      });
    }

    for(const it of (items || [])){
      const code = safe(it?.chapterCode) || (safe(it?.code).includes(".") ? safe(it?.code).split(".")[0] : "SIN");
      const name = safe(it?.chapterName);
      if(!out.has(code)){
        out.set(code, {
          chapterCode: code,
          chapterName: name,
          itemsCount: 0,
          subtotal: 0
        });
      }
      const row = out.get(code);
      row.itemsCount += 1;
      row.subtotal += parcial(it);
      if(!row.chapterName && name) row.chapterName = name;
    }

    return out;
  }

  function compareItems(project){
    const baseItems = getBaseItems(project);
    const officialItems = getOfficialItems(project);

    const baseIndex = buildItemIndex(baseItems);
    const officialIndex = buildItemIndex(officialItems);

    const keys = new Set([...baseIndex.keys(), ...officialIndex.keys()]);
    const rows = [];

    for(const key of keys){
      const b = baseIndex.get(key) || null;
      const o = officialIndex.get(key) || null;

      const puBase = num(b?.pu);
      const puOfficial = num(o?.pu);
      const qtyBase = num(b?.qty);
      const qtyOfficial = num(o?.qty);
      const parcialBase = num(b?.parcial);
      const parcialOfficial = num(o?.parcial);

      let status = "ok";
      if(b && !o) status = "solo_base";
      else if(!b && o) status = "solo_oficial";
      else if(
        puBase !== puOfficial ||
        qtyBase !== qtyOfficial ||
        parcialBase !== parcialOfficial
      ) status = "diferente";

      rows.push({
        key,
        status,

        chapterCodeBase: safe(b?.chapterCode),
        chapterNameBase: safe(b?.chapterName),
        chapterCodeOfficial: safe(o?.chapterCode),
        chapterNameOfficial: safe(o?.chapterName),

        code: safe(o?.code || b?.code),
        apuRefCode: safe(o?.apuRefCode || b?.apuRefCode),
        desc: safe(o?.desc || b?.desc),
        unit: safe(o?.unit || b?.unit),

        puBase,
        puOfficial,
        puDiff: moneyDiff(puBase, puOfficial),
        puPctDiff: pctDiff(puBase, puOfficial),

        qtyBase,
        qtyOfficial,
        qtyDiff: moneyDiff(qtyBase, qtyOfficial),
        qtyPctDiff: pctDiff(qtyBase, qtyOfficial),

        parcialBase,
        parcialOfficial,
        parcialDiff: moneyDiff(parcialBase, parcialOfficial),
        parcialPctDiff: pctDiff(parcialBase, parcialOfficial),

        base: b,
        official: o
      });
    }

    rows.sort((a,b)=>{
      const ca = safe(a.code);
      const cb = safe(b.code);
      if(ca && cb) return ca.localeCompare(cb, "es", { numeric:true });
      return safe(a.desc).localeCompare(safe(b.desc), "es");
    });

    return rows;
  }

  function compareChapters(project){
    const baseItems = getBaseItems(project);
    const officialItems = getOfficialItems(project);

    const baseMap = buildChapterMapFromItems(baseItems, getBaseChapters(project));
    const officialMap = buildChapterMapFromItems(officialItems, getOfficialChapters(project));

    const keys = new Set([...baseMap.keys(), ...officialMap.keys()]);
    const rows = [];

    for(const key of keys){
      const b = baseMap.get(key) || null;
      const o = officialMap.get(key) || null;

      const subtotalBase = num(b?.subtotal);
      const subtotalOfficial = num(o?.subtotal);

      let status = "ok";
      if(b && !o) status = "solo_base";
      else if(!b && o) status = "solo_oficial";
      else if(subtotalBase !== subtotalOfficial) status = "diferente";

      rows.push({
        chapterCode: safe(o?.chapterCode || b?.chapterCode),
        chapterName: safe(o?.chapterName || b?.chapterName),

        itemsCountBase: num(b?.itemsCount),
        itemsCountOfficial: num(o?.itemsCount),
        itemsCountDiff: moneyDiff(num(b?.itemsCount), num(o?.itemsCount)),

        subtotalBase,
        subtotalOfficial,
        subtotalDiff: moneyDiff(subtotalBase, subtotalOfficial),
        subtotalPctDiff: pctDiff(subtotalBase, subtotalOfficial),

        status,
        base: b,
        official: o
      });
    }

    rows.sort((a,b)=>{
      const na = Number(a.chapterCode);
      const nb = Number(b.chapterCode);
      const aNum = Number.isFinite(na);
      const bNum = Number.isFinite(nb);
      if(aNum && bNum) return na - nb;
      return safe(a.chapterCode).localeCompare(safe(b.chapterCode), "es", { numeric:true });
    });

    return rows;
  }

  function compareTotals(project){
    const baseProject = {
      ...project,
      items: getBaseItems(project)
    };
    const officialProject = {
      ...project,
      items: getOfficialItems(project)
    };

    const baseTotals = window.Calc?.calcTotals ? Calc.calcTotals(baseProject) : {};
    const officialTotals = window.Calc?.calcTotals ? Calc.calcTotals(officialProject) : {};

    return {
      base: {
        directo: num(baseTotals.directo),
        admin: num(baseTotals.admin),
        imprev: num(baseTotals.imprev),
        util: num(baseTotals.util),
        subtotal: num(baseTotals.subtotal),
        ivaUtil: num(baseTotals.ivaUtil ?? baseTotals.iva),
        total: num(baseTotals.total)
      },
      official: {
        directo: num(officialTotals.directo),
        admin: num(officialTotals.admin),
        imprev: num(officialTotals.imprev),
        util: num(officialTotals.util),
        subtotal: num(officialTotals.subtotal),
        ivaUtil: num(officialTotals.ivaUtil ?? officialTotals.iva),
        total: num(officialTotals.total)
      },
      diff: {
        directo: moneyDiff(num(baseTotals.directo), num(officialTotals.directo)),
        admin: moneyDiff(num(baseTotals.admin), num(officialTotals.admin)),
        imprev: moneyDiff(num(baseTotals.imprev), num(officialTotals.imprev)),
        util: moneyDiff(num(baseTotals.util), num(officialTotals.util)),
        subtotal: moneyDiff(num(baseTotals.subtotal), num(officialTotals.subtotal)),
        ivaUtil: moneyDiff(num(baseTotals.ivaUtil ?? baseTotals.iva), num(officialTotals.ivaUtil ?? officialTotals.iva)),
        total: moneyDiff(num(baseTotals.total), num(officialTotals.total))
      },
      pct: {
        directo: pctDiff(num(baseTotals.directo), num(officialTotals.directo)),
        admin: pctDiff(num(baseTotals.admin), num(officialTotals.admin)),
        imprev: pctDiff(num(baseTotals.imprev), num(officialTotals.imprev)),
        util: pctDiff(num(baseTotals.util), num(officialTotals.util)),
        subtotal: pctDiff(num(baseTotals.subtotal), num(officialTotals.subtotal)),
        ivaUtil: pctDiff(num(baseTotals.ivaUtil ?? baseTotals.iva), num(officialTotals.ivaUtil ?? officialTotals.iva)),
        total: pctDiff(num(baseTotals.total), num(officialTotals.total))
      }
    };
  }

  function buildSummary(project){
    const itemRows = compareItems(project);
    const chapterRows = compareChapters(project);
    const totals = compareTotals(project);

    const onlyBase = itemRows.filter(r => r.status === "solo_base").length;
    const onlyOfficial = itemRows.filter(r => r.status === "solo_oficial").length;
    const changed = itemRows.filter(r => r.status === "diferente").length;

    const chapterOnlyBase = chapterRows.filter(r => r.status === "solo_base").length;
    const chapterOnlyOfficial = chapterRows.filter(r => r.status === "solo_oficial").length;
    const chapterChanged = chapterRows.filter(r => r.status === "diferente").length;

    return {
      counts: {
        itemsBase: getBaseItems(project).length,
        itemsOfficial: getOfficialItems(project).length,
        chaptersBase: getBaseChapters(project).length,
        chaptersOfficial: getOfficialChapters(project).length,

        itemsOnlyBase: onlyBase,
        itemsOnlyOfficial: onlyOfficial,
        itemsChanged: changed,

        chaptersOnlyBase: chapterOnlyBase,
        chaptersOnlyOfficial: chapterOnlyOfficial,
        chaptersChanged: chapterChanged
      },
      totals
    };
  }

  function getTopDifferences(project, limit=10){
    const rows = compareItems(project)
      .filter(r => r.status === "diferente" || r.status === "solo_oficial" || r.status === "solo_base")
      .sort((a,b)=> Math.abs(num(b.parcialDiff)) - Math.abs(num(a.parcialDiff)));

    return rows.slice(0, limit);
  }

  function getPotentialFindings(project){
    const rows = compareItems(project);
    const findings = [];

    for(const r of rows){
      if(r.status === "solo_oficial"){
        findings.push({
          type: "item_no_existe_en_base",
          severity: "alta",
          code: r.code,
          desc: r.desc,
          detail: "El ítem aparece en el Presupuesto Oficial pero no existe en el Presupuesto Base."
        });
        continue;
      }

      if(r.status === "solo_base"){
        findings.push({
          type: "item_omitido_en_oficial",
          severity: "media",
          code: r.code,
          desc: r.desc,
          detail: "El ítem existe en el Presupuesto Base pero no aparece en el Presupuesto Oficial."
        });
        continue;
      }

      if(r.puPctDiff > 20){
        findings.push({
          type: "sobreprecio_unitario",
          severity: "alta",
          code: r.code,
          desc: r.desc,
          detail: `El PU oficial supera el PU base en ${r.puPctDiff.toFixed(2)}%.`
        });
      }

      if(r.qtyPctDiff > 20){
        findings.push({
          type: "sobrecantidad",
          severity: "alta",
          code: r.code,
          desc: r.desc,
          detail: `La cantidad oficial supera la cantidad base en ${r.qtyPctDiff.toFixed(2)}%.`
        });
      }

      if(Math.abs(r.parcialPctDiff) > 25){
        findings.push({
          type: "desviacion_parcial",
          severity: "media",
          code: r.code,
          desc: r.desc,
          detail: `El valor parcial presenta una desviación de ${r.parcialPctDiff.toFixed(2)}%.`
        });
      }
    }

    return findings;
  }

  function compareProject(project){
    return {
      items: compareItems(project),
      chapters: compareChapters(project),
      totals: compareTotals(project),
      summary: buildSummary(project),
      topDifferences: getTopDifferences(project, 15),
      findings: getPotentialFindings(project)
    };
  }

  window.Compare = {
    compareItems,
    compareChapters,
    compareTotals,
    buildSummary,
    getTopDifferences,
    getPotentialFindings,
    compareProject
  };
})();