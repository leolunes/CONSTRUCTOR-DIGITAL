function getSectionScore(section) {
  if (!section?.questions?.length) {
    return {
      sectionId: section?.id || "",
      title: section?.title || "",
      verse: section?.verse || "",
      answered: 0,
      total: 0,
      rawAverage: 0,
      percent: 0,
      level: "Sin evaluar"
    };
  }

  const state = getState();
  const values = section.questions
    .map(q => state.answers[q.id])
    .filter(v => Number.isFinite(v));

  const rawAverage = average(values);
  const percentValue = rawAverage * 20;
  const bands = state.data?.rubrics?.globalBands || [];

  return {
    sectionId: section.id,
    title: section.title,
    verse: section.verse,
    answered: values.length,
    total: section.questions.length,
    rawAverage: round(rawAverage, 2),
    percent: round(percentValue, 1),
    level: getBandLabel(percentValue, bands)
  };
}

function getAllSectionScores() {
  const state = getState();
  const sections = state.data?.sections || [];
  return sections.map(getSectionScore);
}

function getDominantSection(sectionScores = []) {
  if (!sectionScores.length) return null;
  const sorted = [...sectionScores].sort((a, b) => b.percent - a.percent);
  return sorted[0] || null;
}

function getSecondarySection(sectionScores = []) {
  if (sectionScores.length < 2) return null;
  const sorted = [...sectionScores].sort((a, b) => b.percent - a.percent);
  return sorted[1] || null;
}

function buildAxisScores(sectionScores = []) {
  const map = {};
  sectionScores.forEach(s => {
    map[s.sectionId] = s.percent;
  });

  const alma = average([
    map.miedo || 0,
    map.ansiedad || 0,
    map.rechazo || 0,
    map.soledad || 0,
    map.culpa || 0,
    map.responsabilidad || 0,
    map.escasez || 0
  ]);

  const espiritu = round(clamp(100 - average([
    map.miedo || 0,
    map.ansiedad || 0,
    map.responsabilidad || 0,
    map.soledad || 0
  ]), 0, 100), 1);

  const cimiento = round(clamp(100 - average([
    map.miedo || 0,
    map.culpa || 0,
    map.ansiedad || 0,
    map.escasez || 0
  ]), 0, 100), 1);

  return {
    alma: round(alma, 1),
    espiritu,
    cimiento
  };
}

function getTransferLevelLabel(axisScores) {
  const espiritu = Number(axisScores?.espiritu || 0);
  if (espiritu >= 75) return "Alta";
  if (espiritu >= 50) return "Media";
  if (espiritu >= 25) return "Baja";
  return "Muy baja";
}

function computeResult() {
  const sectionScores = getAllSectionScores();
  const totalAnswered = countAnswered();
  const totalQs = totalQuestions();

  const overall = average(sectionScores.map(s => s.percent));
  const bands = getState().data?.rubrics?.globalBands || [];
  const globalBand = getBandLabel(overall, bands);
  const dominant = getDominantSection(sectionScores);
  const secondary = getSecondarySection(sectionScores);
  const axes = buildAxisScores(sectionScores);

  return {
    computedAt: nowDateTimeText(),
    answered: totalAnswered,
    totalQuestions: totalQs,
    overallScore: round(overall, 1),
    globalBand,
    dominant,
    secondary,
    axes,
    transferLevel: getTransferLevelLabel(axes),
    sections: sectionScores
  };
}