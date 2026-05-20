function buildCompareData(currentResult, previousResult) {
  if (!currentResult || !previousResult) return null;

  const rows = currentResult.sections.map(currentSection => {
    const previousSection = previousResult.sections.find(s => s.sectionId === currentSection.sectionId);

    const previousScore = previousSection?.percent || 0;
    const delta = round(currentSection.percent - previousScore, 1);

    return {
      id: currentSection.sectionId,
      title: currentSection.title,
      before: previousScore,
      after: currentSection.percent,
      delta
    };
  });

  const globalDelta = round(currentResult.overallScore - previousResult.overallScore, 1);

  return {
    currentDate: currentResult.computedAt,
    previousDate: previousResult.computedAt,
    globalBefore: previousResult.overallScore,
    globalAfter: currentResult.overallScore,
    globalDelta,
    rows
  };
}