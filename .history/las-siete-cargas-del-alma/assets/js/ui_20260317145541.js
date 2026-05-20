function bindUIEvents() {
  document.addEventListener("click", handleGlobalClick);
  document.addEventListener("change", handleGlobalChange);

  const btnStart = $("#btnStart");
  const btnViewResults = $("#btnViewResults");
  const btnPrevSection = $("#btnPrevSection");
  const btnNextSection = $("#btnNextSection");
  const btnReset = $("#btnReset");
  const btnExplainDiagram = $("#btnExplainDiagram");
  const btnCloseModal = $("#btnCloseModal");
  const btnSaveMeasurement = $("#btnSaveMeasurement");
  const btnToggleCompare = $("#btnToggleCompare");
  const btnExportTxt = $("#btnExportTxt");
  const btnExportPdf = $("#btnExportPdf");
  const btnExportPng = $("#btnExportPng");

  if (btnStart) {
    btnStart.addEventListener("click", () => {
      markStarted();
      $("#evaluationPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      saveStoredState();
      renderAll();
    });
  }

  if (btnViewResults) {
    btnViewResults.addEventListener("click", () => {
      $("#resultsPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (btnPrevSection) {
    btnPrevSection.addEventListener("click", () => {
      setCurrentSectionIndex(getState().currentSectionIndex - 1);
      saveStoredState();
      renderAll();
    });
  }

  if (btnNextSection) {
    btnNextSection.addEventListener("click", () => {
      setCurrentSectionIndex(getState().currentSectionIndex + 1);
      saveStoredState();
      renderAll();
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      const ok = window.confirm("¿Deseas reiniciar la evaluación actual? Se conservará únicamente la medición previa guardada.");
      if (!ok) return;
      resetStatePreservingData();
      clearStoredState();
      saveStoredState();
      renderAll();
      closeContextModal();
      closeGuidedPanel();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (btnExplainDiagram) {
    btnExplainDiagram.addEventListener("click", () => {
      openGuidedPanel();
    });
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener("click", closeContextModal);
  }

  if (btnSaveMeasurement) {
    btnSaveMeasurement.addEventListener("click", () => {
      const result = getState().result;
      if (!result) {
        alert("Primero completa al menos parte de la evaluación para guardar una medición.");
        return;
      }
      setPreviousResult(deepClone(result));
      saveStoredState();
      renderAll();
      alert("Medición actual guardada como referencia para comparación.");
    });
  }

  if (btnToggleCompare) {
    btnToggleCompare.addEventListener("click", () => {
      if (!getState().previousResult) {
        alert("Aún no existe una medición previa guardada.");
        return;
      }
      toggleCompare();
      saveStoredState();
      renderAll();
    });
  }

  if (btnExportTxt) {
    btnExportTxt.addEventListener("click", () => {
      if (typeof exportResultTxt === "function") exportResultTxt();
    });
  }

  if (btnExportPdf) {
    btnExportPdf.addEventListener("click", () => {
      if (typeof exportResultPdf === "function") exportResultPdf();
    });
  }

  if (btnExportPng) {
    btnExportPng.addEventListener("click", () => {
      if (typeof exportResultPng === "function") exportResultPng();
    });
  }
}

function handleGlobalClick(event) {
  const sectionTab = event.target.closest(".section-tab");
  if (sectionTab) {
    const index = Number(sectionTab.dataset.sectionIndex);
    if (Number.isFinite(index)) {
      setCurrentSectionIndex(index);
      saveStoredState();
      renderAll();
    }
    return;
  }

  const closeModalTrigger = event.target.closest("[data-close-modal='true']");
  if (closeModalTrigger) {
    closeContextModal();
    return;
  }

  const contextualTarget = event.target.closest("[data-context-id]");
  if (contextualTarget) {
    const id = contextualTarget.dataset.contextId;
    if (id) openContextModal(id);
    return;
  }
}

function handleGlobalChange(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.type !== "radio") return;

  const questionId = target.dataset.questionId;
  if (!questionId) return;

  setAnswer(questionId, Number(target.value));
  markStarted();
  saveStoredState();
  renderAll();
}

function openContextModal(id) {
  const modal = $("#contextModal");
  if (!modal) return;

  const info = getContextualTeaching(id);
  $("#modalTitle").textContent = safeText(info.title, "Panel contextual");
  $("#modalVerse").textContent = safeText(info.verse, "");
  $("#modalTeaching").textContent = safeText(info.teaching, "");

  const actionsWrap = $("#modalActions");
  actionsWrap.innerHTML = "";

  const actions = info.actions || [];
  if (!actions.length) {
    actionsWrap.innerHTML = `<p class="muted">No hay acciones sugeridas.</p>`;
  } else {
    actions.forEach(action => {
      const item = document.createElement("div");
      item.className = "route-item";
      item.innerHTML = `<p class="route-text">${escapeHtml(action)}</p>`;
      actionsWrap.appendChild(item);
    });
  }

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeContextModal() {
  const modal = $("#contextModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}