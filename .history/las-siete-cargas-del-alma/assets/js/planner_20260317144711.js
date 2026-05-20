function buildPlannerDays(result) {
  if (!result) return [];

  const teachingsOrder = [
    "miedo",
    "culpa",
    "ansiedad",
    "responsabilidad",
    "rechazo",
    "escasez",
    "soledad"
  ];

  const dayTitles = {
    miedo: "Día 1 — Miedo",
    culpa: "Día 2 — Culpa",
    ansiedad: "Día 3 — Ansiedad",
    responsabilidad: "Día 4 — Responsabilidad excesiva",
    rechazo: "Día 5 — Rechazo",
    escasez: "Día 6 — Temor a la escasez",
    soledad: "Día 7 — Soledad"
  };

  return teachingsOrder.map((id, index) => {
    const teaching = getContextualTeaching(id);
    const section = result.sections.find(s => s.sectionId === id);

    return {
      id,
      dayNumber: index + 1,
      badge: `Día ${index + 1}`,
      title: dayTitles[id] || `Día ${index + 1}`,
      verse: teaching.verse || "",
      teaching: teaching.teaching || "",
      action: teaching.actions?.[0] || "Entrega conscientemente esta carga al Cimiento.",
      prayer: `Señor, hoy te entrego la carga de ${teaching.title?.toLowerCase() || id}. No quiero retener en mi alma lo que debe descansar en Ti.`,
      currentScore: section?.percent || 0,
      currentLevel: section?.level || "Sin evaluar"
    };
  });
}