function exportResultTxt() {
  const state = getState();
  const result = state.result;

  if (!result) {
    alert("Primero completa la evaluación para exportar el resultado.");
    return;
  }

  const lines = [];
  lines.push("LAS SIETE CARGAS DEL ALMA");
  lines.push("Diagnóstico espiritual estructural");
  lines.push(`Fecha: ${result.computedAt}`);
  lines.push("");

  lines.push(`Puntaje global: ${result.overallScore}%`);
  lines.push(`Banda global: ${result.globalBand}`);
  lines.push(`Carga dominante: ${safeText(result.dominant?.title)}`);
  lines.push(`Carga secundaria: ${safeText(result.secondary?.title)}`);
  lines.push(`Transferencia espiritual: ${safeText(result.transferLevel)}`);
  lines.push(`Descanso en el Cimiento: ${result.axes?.cimiento || 0}%`);
  lines.push("");

  lines.push("DIAGNÓSTICO PRINCIPAL");
  lines.push(getGlobalDiagnosticText(result));
  lines.push("");
  lines.push("OBSERVACIÓN ESTRUCTURAL");
  lines.push(getStructuralObservationText(result));
  lines.push("");

  lines.push("TABLA DE CARGAS");
  result.sections.forEach(section => {
    const meta = getSectionMeta(section.sectionId);
    const verseFull = meta?.verse && meta?.verseText
      ? `${meta.verse} — “${meta.verseText}”`
      : (section.verse || "—");

    lines.push(`- ${section.title}: ${section.percent}% | ${section.level}`);
    lines.push(`  Verso: ${verseFull}`);
    lines.push(`  ${getSectionObservation(section)}`);
  });
  lines.push("");

  lines.push("RUTA PASTORAL SUGERIDA");
  getRouteActions(result).forEach(item => {
    lines.push(`- ${item.title}: ${item.text}`);
  });
  lines.push("");

  lines.push("PLAN DE TRANSFERENCIA DE CARGAS — 7 DÍAS");
  buildPlannerDays(result).forEach(day => {
    const sectionMeta = getSectionMeta(day.id);
    const verseFull = sectionMeta?.verse && sectionMeta?.verseText
      ? `${sectionMeta.verse} — “${sectionMeta.verseText}”`
      : day.verse;

    lines.push(`${day.title}`);
    lines.push(`Verso: ${verseFull}`);
    lines.push(`Enseñanza: ${day.teaching}`);
    lines.push(`Acción: ${day.action}`);
    lines.push(`Oración: ${day.prayer}`);
    lines.push("");
  });

  if (state.previousResult) {
    const compare = buildCompareData(result, state.previousResult);
    if (compare) {
      lines.push("COMPARACIÓN ANTES / DESPUÉS");
      lines.push(`Antes: ${compare.globalBefore}%`);
      lines.push(`Después: ${compare.globalAfter}%`);
      lines.push(`Variación global: ${compare.globalDelta > 0 ? "+" : ""}${compare.globalDelta}%`);
      compare.rows.forEach(row => {
        lines.push(`- ${row.title}: ${row.before}% → ${row.after}% (${row.delta > 0 ? "+" : ""}${row.delta}%)`);
      });
      lines.push("");
    }
  }

  const filename = `${toFileName("Las_Siete_Cargas_del_Alma_Diagnostico")}_${Date.now()}.txt`;
  downloadTextFile(filename, lines.join("\n"));
}