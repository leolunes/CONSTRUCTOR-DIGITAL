const GUIDED_STEPS = [
  {
    id: "loads",
    text: "Paso 1. Estas son las cargas. Representan el peso que llega a la vida: miedo, culpa, ansiedad, responsabilidad excesiva, rechazo, escasez y soledad."
  },
  {
    id: "alma",
    text: "Paso 2. La viga representa el alma. Allí las cargas se perciben primero. El alma recibe, pero no fue diseñada para retener el peso."
  },
  {
    id: "espiritu",
    text: "Paso 3. La columna representa el espíritu. Su función es dirigir el peso hacia el Cimiento por medio de comunión, fe y entrega."
  },
  {
    id: "cimiento",
    text: "Paso 4. El cimiento representa a Cristo. Allí el peso encuentra descanso. El fundamento no elimina la carga, pero sí la sostiene."
  },
  {
    id: "flujo",
    text: "Paso 5. El diseño correcto es este: las cargas llegan al alma, el espíritu las transmite y Cristo las sostiene. Allí comienza el descanso."
  }
];

let guidedEventsBound = false;

function openGuidedPanel() {
  const panel = document.getElementById("guidedPanel");
  if (!panel) return;

  setGuidedStep(0);
  panel.classList.remove("hidden");
  bindGuidedControls();
  renderGuidedStep();
}

function closeGuidedPanel() {
  const panel = document.getElementById("guidedPanel");
  if (!panel) return;

  panel.classList.add("hidden");
  clearGuidedHighlights();
}

function bindGuidedControls() {
  if (guidedEventsBound) return;
  guidedEventsBound = true;

  const closeBtn = document.getElementById("btnCloseGuided");
  const prevBtn = document.getElementById("btnPrevGuided");
  const nextBtn = document.getElementById("btnNextGuided");
  const panel = document.getElementById("guidedPanel");

  closeBtn?.addEventListener("click", closeGuidedPanel);

  prevBtn?.addEventListener("click", () => {
    const current = getState().guidedStep || 0;
    setGuidedStep(Math.max(0, current - 1));
    renderGuidedStep();
  });

  nextBtn?.addEventListener("click", () => {
    const current = getState().guidedStep || 0;
    if (current >= GUIDED_STEPS.length - 1) {
      closeGuidedPanel();
      return;
    }
    setGuidedStep(current + 1);
    renderGuidedStep();
  });

  panel?.addEventListener("click", (e) => {
    if (e.target === panel) {
      closeGuidedPanel();
    }
  });

  document.addEventListener("keydown", (e) => {
    const panelVisible = panel && !panel.classList.contains("hidden");
    if (!panelVisible) return;

    if (e.key === "Escape") {
      closeGuidedPanel();
    }

    if (e.key === "ArrowRight") {
      const current = getState().guidedStep || 0;
      if (current >= GUIDED_STEPS.length - 1) {
        closeGuidedPanel();
      } else {
        setGuidedStep(current + 1);
        renderGuidedStep();
      }
    }

    if (e.key === "ArrowLeft") {
      const current = getState().guidedStep || 0;
      setGuidedStep(Math.max(0, current - 1));
      renderGuidedStep();
    }
  });
}

function renderGuidedStep() {
  const stepIndex = Math.max(0, Math.min(getState().guidedStep || 0, GUIDED_STEPS.length - 1));
  const step = GUIDED_STEPS[stepIndex];

  const textEl = document.getElementById("guidedText");
  if (textEl) textEl.textContent = step.text;

  clearGuidedHighlights();
  applyGuidedHighlight(step.id);

  const prevBtn = document.getElementById("btnPrevGuided");
  const nextBtn = document.getElementById("btnNextGuided");

  if (prevBtn) prevBtn.disabled = stepIndex === 0;
  if (nextBtn) nextBtn.textContent = stepIndex === GUIDED_STEPS.length - 1 ? "Cerrar" : "Siguiente";
}

function clearGuidedHighlights() {
  const ids = [
    "load_miedo",
    "load_culpa",
    "load_ansiedad",
    "load_responsabilidad",
    "load_rechazo",
    "load_escasez",
    "vigaLine",
    "columnaLine",
    "cimientoLine"
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("guided-focus");
  });
}

function applyGuidedHighlight(id) {
  if (id === "loads") {
    [
      "load_miedo",
      "load_culpa",
      "load_ansiedad",
      "load_responsabilidad",
      "load_rechazo",
      "load_escasez"
    ].forEach(loadId => {
      document.getElementById(loadId)?.classList.add("guided-focus");
    });
    return;
  }

  if (id === "alma") {
    document.getElementById("vigaLine")?.classList.add("guided-focus");
    return;
  }

  if (id === "espiritu") {
    document.getElementById("columnaLine")?.classList.add("guided-focus");
    return;
  }

  if (id === "cimiento") {
    document.getElementById("cimientoLine")?.classList.add("guided-focus");
    return;
  }

  if (id === "flujo") {
    document.getElementById("vigaLine")?.classList.add("guided-focus");
    document.getElementById("columnaLine")?.classList.add("guided-focus");
    document.getElementById("cimientoLine")?.classList.add("guided-focus");
  }
}