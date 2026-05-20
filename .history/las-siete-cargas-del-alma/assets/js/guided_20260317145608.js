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

function openGuidedPanel() {
  setGuidedStep(0);
  const panel = $("#guidedPanel");
  if (!panel) return;
  panel.classList.remove("hidden");
  renderGuidedStep();
  bindGuidedControlsOnce();
}

function closeGuidedPanel() {
  const panel = $("#guidedPanel");
  if (!panel) return;
  panel.classList.add("hidden");
  clearGuidedHighlights();
}

let __guidedBound = false;
function bindGuidedControlsOnce() {
  if (__guidedBound) return;
  __guidedBound = true;

  $("#btnCloseGuided")?.addEventListener("click", closeGuidedPanel);

  $("#btnPrevGuided")?.addEventListener("click", () => {
    setGuidedStep(getState().guidedStep - 1);
    renderGuidedStep();
  });

  $("#btnNextGuided")?.addEventListener("click", () => {
    const next = getState().guidedStep + 1;
    if (next >= GUIDED_STEPS.length) {
      closeGuidedPanel();
      return;
    }
    setGuidedStep(next);
    renderGuidedStep();
  });
}

function renderGuidedStep() {
  const stepIndex = clamp(getState().guidedStep, 0, GUIDED_STEPS.length - 1);
  const step = GUIDED_STEPS[stepIndex];
  $("#guidedText").textContent = step.text;
  applyGuidedHighlight(step.id);
}

function clearGuidedHighlights() {
  const ids = [
    "load_miedo", "load_culpa", "load_ansiedad", "load_responsabilidad", "load_rechazo", "load_escasez",
    "vigaLine", "columnaLine", "cimientoLine"
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("guided-focus");
  });
}

function applyGuidedHighlight(id) {
  clearGuidedHighlights();

  if (id === "loads") {
    ["load_miedo", "load_culpa", "load_ansiedad", "load_responsabilidad", "load_rechazo", "load_escasez"]
      .forEach(loadId => document.getElementById(loadId)?.classList.add("guided-focus"));
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