(function(){
  function safe(v){ return String(v ?? "").trim(); }
  function num(v){ return Number(v || 0); }

  function absPct(v){
    return Math.abs(num(v));
  }

  function classifySeverity(score){
    if(score >= 80) return "critica";
    if(score >= 55) return "alta";
    if(score >= 30) return "media";
    return "baja";
  }

  function severityWeight(level){
    switch(String(level||"").toLowerCase()){
      case "critica": return 100;
      case "alta": return 75;
      case "media": return 45;
      default: return 20;
    }
  }

  function riskLabel(score){
    const s = num(score);
    if(s >= 80) return "Riesgo crítico";
    if(s >= 55) return "Riesgo alto";
    if(s >= 30) return "Riesgo medio";
    return "Riesgo bajo";
  }

  function mkFinding({
    type,
    severity,
    title,
    detail,
    code="",
    desc="",
    chapterCode="",
    chapterName="",
    baseValue=null,
    officialValue=null,
    diffValue=null,
    pctValue=null,
    recommendation=""
  }){
    return {
      type: safe(type),
      severity: safe(severity || "media"),
      title: safe(title),
      detail: safe(detail),
      code: safe(code),
      desc: safe(desc),
      chapterCode: safe(chapterCode),
      chapterName: safe(chapterName),
      baseValue,
      officialValue,
      diffValue,
      pctValue,
      recommendation: safe(recommendation)
    };
  }

  function auditMissingItems(compareData){
    const findings = [];
    const rows = Array.isArray(compareData?.items) ? compareData.items : [];

    for(const r of rows){
      if(r.status === "solo_oficial"){
        findings.push(mkFinding({
          type: "item_no_existente_base",
          severity: "critica",
          title: "Ítem presente solo en el presupuesto oficial",
          detail: "El ítem aparece en el Presupuesto Oficial, pero no tiene correspondencia en el Presupuesto Base.",
          code: r.code,
          desc: r.desc,
          chapterCode: r.chapterCodeOfficial,
          chapterName: r.chapterNameOfficial,
          baseValue: 0,
          officialValue: r.parcialOfficial,
          diffValue: r.parcialOfficial,
          pctValue: 100,
          recommendation: "Verificar soporte técnico, contractual y trazabilidad del ítem en planos, APU y actas."
        }));
      }

      if(r.status === "solo_base"){
        findings.push(mkFinding({
          type: "item_omitido_oficial",
          severity: "alta",
          title: "Ítem presente solo en el presupuesto base",
          detail: "El ítem existe en el Presupuesto Base, pero no aparece en el Presupuesto Oficial.",
          code: r.code,
          desc: r.desc,
          chapterCode: r.chapterCodeBase,
          chapterName: r.chapterNameBase,
          baseValue: r.parcialBase,
          officialValue: 0,
          diffValue: -r.parcialBase,
          pctValue: -100,
          recommendation: "Verificar si hubo supresión indebida, cambio de alcance o traslado del ítem a otro código."
        }));
      }
    }

    return findings;
  }

  function auditUnitPrice(compareData){
    const findings = [];
    const rows = Array.isArray(compareData?.items) ? compareData.items : [];

    for(const r of rows){
      if(r.status !== "diferente") continue;

      const pct = num(r.puPctDiff);
      const abs = absPct(pct);

      if(abs < 10) continue;

      let severity = "baja";
      if(abs >= 40) severity = "critica";
      else if(abs >= 25) severity = "alta";
      else if(abs >= 15) severity = "media";

      findings.push(mkFinding({
        type: pct > 0 ? "sobreprecio_unitario" : "subprecio_unitario",
        severity,
        title: pct > 0 ? "Desviación relevante en precio unitario oficial" : "Precio unitario oficial inferior al base",
        detail: pct > 0
          ? `El precio unitario oficial supera el precio unitario base en ${pct.toFixed(2)}%.`
          : `El precio unitario oficial es inferior al precio unitario base en ${Math.abs(pct).toFixed(2)}%.`,
        code: r.code,
        desc: r.desc,
        chapterCode: r.chapterCodeOfficial || r.chapterCodeBase,
        chapterName: r.chapterNameOfficial || r.chapterNameBase,
        baseValue: r.puBase,
        officialValue: r.puOfficial,
        diffValue: r.puDiff,
        pctValue: pct,
        recommendation: "Contrastar con cotizaciones, análisis de mercado, APU soportado y condiciones reales de ejecución."
      }));
    }

    return findings;
  }

  function auditQuantity(compareData){
    const findings = [];
    const rows = Array.isArray(compareData?.items) ? compareData.items : [];

    for(const r of rows){
      if(r.status !== "diferente") continue;

      const pct = num(r.qtyPctDiff);
      const abs = absPct(pct);

      if(abs < 10) continue;

      let severity = "baja";
      if(abs >= 50) severity = "critica";
      else if(abs >= 30) severity = "alta";
      else if(abs >= 15) severity = "media";

      findings.push(mkFinding({
        type: pct > 0 ? "sobrecantidad" : "subcantidad",
        severity,
        title: pct > 0 ? "Desviación relevante en cantidad oficial" : "Cantidad oficial inferior al base",
        detail: pct > 0
          ? `La cantidad oficial supera la cantidad base en ${pct.toFixed(2)}%.`
          : `La cantidad oficial es inferior a la cantidad base en ${Math.abs(pct).toFixed(2)}%.`,
        code: r.code,
        desc: r.desc,
        chapterCode: r.chapterCodeOfficial || r.chapterCodeBase,
        chapterName: r.chapterNameOfficial || r.chapterNameBase,
        baseValue: r.qtyBase,
        officialValue: r.qtyOfficial,
        diffValue: r.qtyDiff,
        pctValue: pct,
        recommendation: "Revisar memorias de cálculo, cantidades de obra, planos récord, actas parciales y mediciones de campo."
      }));
    }

    return findings;
  }

  function auditPartialValue(compareData){
    const findings = [];
    const rows = Array.isArray(compareData?.items) ? compareData.items : [];

    for(const r of rows){
      if(r.status !== "diferente") continue;

      const pct = num(r.parcialPctDiff);
      const abs = absPct(pct);

      if(abs < 12) continue;

      let severity = "baja";
      if(abs >= 60) severity = "critica";
      else if(abs >= 35) severity = "alta";
      else if(abs >= 20) severity = "media";

      findings.push(mkFinding({
        type: pct > 0 ? "desviacion_valor_parcial_alza" : "desviacion_valor_parcial_baja",
        severity,
        title: "Desviación relevante en valor parcial del ítem",
        detail: `El valor parcial del ítem presenta una variación de ${pct.toFixed(2)}% entre base y oficial.`,
        code: r.code,
        desc: r.desc,
        chapterCode: r.chapterCodeOfficial || r.chapterCodeBase,
        chapterName: r.chapterNameOfficial || r.chapterNameBase,
        baseValue: r.parcialBase,
        officialValue: r.parcialOfficial,
        diffValue: r.parcialDiff,
        pctValue: pct,
        recommendation: "Analizar conjuntamente precio unitario, cantidad ejecutada y soporte contractual del ítem."
      }));
    }

    return findings;
  }

  function auditChapterDeviation(compareData){
    const findings = [];
    const rows = Array.isArray(compareData?.chapters) ? compareData.chapters : [];

    for(const r of rows){
      if(r.status === "ok") continue;

      const pct = num(r.subtotalPctDiff);
      const abs = absPct(pct);

      if(r.status === "solo_oficial"){
        findings.push(mkFinding({
          type: "capitulo_solo_oficial",
          severity: "critica",
          title: "Capítulo presente solo en el presupuesto oficial",
          detail: "Existe un capítulo en el Presupuesto Oficial que no tiene equivalente en el Presupuesto Base.",
          chapterCode: r.chapterCode,
          chapterName: r.chapterName,
          baseValue: 0,
          officialValue: r.subtotalOfficial,
          diffValue: r.subtotalOfficial,
          pctValue: 100,
          recommendation: "Verificar si el capítulo fue creado sin soporte técnico o corresponde a un cambio formalmente aprobado."
        }));
        continue;
      }

      if(r.status === "solo_base"){
        findings.push(mkFinding({
          type: "capitulo_solo_base",
          severity: "alta",
          title: "Capítulo presente solo en el presupuesto base",
          detail: "Existe un capítulo en el Presupuesto Base que no aparece en el Presupuesto Oficial.",
          chapterCode: r.chapterCode,
          chapterName: r.chapterName,
          baseValue: r.subtotalBase,
          officialValue: 0,
          diffValue: -r.subtotalBase,
          pctValue: -100,
          recommendation: "Verificar redistribución de ítems, omisiones o alteraciones de estructura presupuestal."
        }));
        continue;
      }

      if(abs < 10) continue;

      let severity = "baja";
      if(abs >= 50) severity = "critica";
      else if(abs >= 30) severity = "alta";
      else if(abs >= 15) severity = "media";

      findings.push(mkFinding({
        type: pct > 0 ? "desviacion_capitulo_alza" : "desviacion_capitulo_baja",
        severity,
        title: "Desviación relevante en subtotal de capítulo",
        detail: `El capítulo presenta una variación de ${pct.toFixed(2)}% entre el subtotal base y el subtotal oficial.`,
        chapterCode: r.chapterCode,
        chapterName: r.chapterName,
        baseValue: r.subtotalBase,
        officialValue: r.subtotalOfficial,
        diffValue: r.subtotalDiff,
        pctValue: pct,
        recommendation: "Analizar el detalle de ítems del capítulo y verificar si la desviación se concentra en pocos conceptos críticos."
      }));
    }

    return findings;
  }

  function auditGlobalTotals(compareData){
    const findings = [];
    const t = compareData?.totals || {};
    const pctTotal = num(t?.pct?.total);
    const diffTotal = num(t?.diff?.total);

    const abs = absPct(pctTotal);
    if(abs < 8) return findings;

    let severity = "baja";
    if(abs >= 40) severity = "critica";
    else if(abs >= 25) severity = "alta";
    else if(abs >= 12) severity = "media";

    findings.push(mkFinding({
      type: pctTotal > 0 ? "desviacion_total_alza" : "desviacion_total_baja",
      severity,
      title: "Desviación global del presupuesto",
      detail: `El valor total del Presupuesto Oficial presenta una variación de ${pctTotal.toFixed(2)}% frente al Presupuesto Base.`,
      baseValue: num(t?.base?.total),
      officialValue: num(t?.official?.total),
      diffValue: diffTotal,
      pctValue: pctTotal,
      recommendation: "Validar si la desviación total proviene de precios unitarios, cantidades, capítulos nuevos o ítems sin correspondencia."
    }));

    return findings;
  }

  function detectTransportAnomalies(compareData){
    const findings = [];
    const rows = Array.isArray(compareData?.items) ? compareData.items : [];

    for(const r of rows){
      const d = safe(r.desc).toLowerCase();
      if(!d.includes("transporte") && !d.includes("acarreo") && !d.includes("flete")) continue;

      const pct = num(r.parcialPctDiff);
      const abs = absPct(pct);
      if(abs < 15) continue;

      let severity = "media";
      if(abs >= 50) severity = "critica";
      else if(abs >= 30) severity = "alta";

      findings.push(mkFinding({
        type: "anomalia_transporte",
        severity,
        title: "Posible anomalía en transporte o acarreo",
        detail: `El ítem asociado a transporte/acarreo presenta una desviación de ${pct.toFixed(2)}% en valor parcial.`,
        code: r.code,
        desc: r.desc,
        chapterCode: r.chapterCodeOfficial || r.chapterCodeBase,
        chapterName: r.chapterNameOfficial || r.chapterNameBase,
        baseValue: r.parcialBase,
        officialValue: r.parcialOfficial,
        diffValue: r.parcialDiff,
        pctValue: pct,
        recommendation: "Revisar rutas, distancias, volúmenes transportados, facturas de soporte y posibles reclasificaciones tributarias."
      }));
    }

    return findings;
  }

  function detectMaterialAnomalies(compareData){
    const findings = [];
    const rows = Array.isArray(compareData?.items) ? compareData.items : [];

    for(const r of rows){
      const d = safe(r.desc).toLowerCase();
      const looksMaterial =
        d.includes("concreto") ||
        d.includes("acero") ||
        d.includes("cemento") ||
        d.includes("arena") ||
        d.includes("triturado") ||
        d.includes("material") ||
        d.includes("tuberia") ||
        d.includes("bloque") ||
        d.includes("ladrillo");

      if(!looksMaterial) continue;

      const pct = num(r.puPctDiff);
      const abs = absPct(pct);
      if(abs < 12) continue;

      let severity = "media";
      if(abs >= 35) severity = "alta";
      if(abs >= 55) severity = "critica";

      findings.push(mkFinding({
        type: "anomalia_material",
        severity,
        title: "Posible sobrecosto o desviación en materiales",
        detail: `El ítem asociado a materiales presenta una desviación en PU de ${pct.toFixed(2)}%.`,
        code: r.code,
        desc: r.desc,
        chapterCode: r.chapterCodeOfficial || r.chapterCodeBase,
        chapterName: r.chapterNameOfficial || r.chapterNameBase,
        baseValue: r.puBase,
        officialValue: r.puOfficial,
        diffValue: r.puDiff,
        pctValue: pct,
        recommendation: "Verificar cotizaciones, facturación, IVA aplicable, proveedor real y consistencia con el mercado."
      }));
    }

    return findings;
  }

  function sortFindings(findings){
    return [...(findings || [])].sort((a,b)=>{
      const wa = severityWeight(a.severity);
      const wb = severityWeight(b.severity);
      if(wb !== wa) return wb - wa;

      const pa = Math.abs(num(a.diffValue));
      const pb = Math.abs(num(b.diffValue));
      return pb - pa;
    });
  }

  function scoreAudit(findings){
    const list = Array.isArray(findings) ? findings : [];
    if(!list.length){
      return {
        score: 0,
        level: "Riesgo bajo",
        severity: "baja"
      };
    }

    let total = 0;
    for(const f of list){
      total += severityWeight(f.severity);
    }

    const normalized = Math.min(100, Math.round(total / Math.max(1, list.length) + Math.min(25, list.length * 1.5)));

    return {
      score: normalized,
      level: riskLabel(normalized),
      severity: classifySeverity(normalized)
    };
  }

  function summarizeAudit(compareData, findings){
    const score = scoreAudit(findings);
    const bySeverity = {
      critica: 0,
      alta: 0,
      media: 0,
      baja: 0
    };

    for(const f of (findings || [])){
      const sev = String(f.severity || "baja").toLowerCase();
      if(!(sev in bySeverity)) bySeverity.baja++;
      else bySeverity[sev]++;
    }

    const totals = compareData?.totals || {};
    const diffTotal = num(totals?.diff?.total);
    const pctTotal = num(totals?.pct?.total);

    return {
      risk: score,
      totals: {
        base: num(totals?.base?.total),
        official: num(totals?.official?.total),
        diff: diffTotal,
        pct: pctTotal
      },
      findings: {
        total: Array.isArray(findings) ? findings.length : 0,
        bySeverity
      },
      executiveComment:
        score.score >= 80
          ? "Se identifican desviaciones críticas con alto potencial de riesgo técnico, económico o forense."
          : score.score >= 55
            ? "Se identifican desviaciones relevantes que requieren revisión detallada y validación documental."
            : score.score >= 30
              ? "Se observan variaciones moderadas que ameritan verificación puntual."
              : "La comparación preliminar no evidencia desviaciones de alto impacto."
    };
  }

  function runAudit(projectOrCompare){
    const compareData = (projectOrCompare && projectOrCompare.items && projectOrCompare.chapters && projectOrCompare.totals)
      ? projectOrCompare
      : (window.Compare?.compareProject ? Compare.compareProject(projectOrCompare) : null);

    if(!compareData){
      return {
        findings: [],
        summary: summarizeAudit({}, [])
      };
    }

    const findings = []
      .concat(auditMissingItems(compareData))
      .concat(auditUnitPrice(compareData))
      .concat(auditQuantity(compareData))
      .concat(auditPartialValue(compareData))
      .concat(auditChapterDeviation(compareData))
      .concat(auditGlobalTotals(compareData))
      .concat(detectTransportAnomalies(compareData))
      .concat(detectMaterialAnomalies(compareData));

    const ordered = sortFindings(findings);
    const summary = summarizeAudit(compareData, ordered);

    return {
      findings: ordered,
      summary
    };
  }

  window.Audit = {
    auditMissingItems,
    auditUnitPrice,
    auditQuantity,
    auditPartialValue,
    auditChapterDeviation,
    auditGlobalTotals,
    detectTransportAnomalies,
    detectMaterialAnomalies,
    sortFindings,
    scoreAudit,
    summarizeAudit,
    runAudit
  };
})();