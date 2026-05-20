function bindUIEvents() {
  bindStaticButtons();
  document.addEventListener("click", handleDelegatedClick);
  document.addEventListener("change", handleDelegatedChange);
}

function bindStaticButtons() {
  $("#btnStart")?.addEventListener("click", () => {
    markStarted();
    saveStoredState();
    renderAll();
    $("#evaluationPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("#btnViewResults")?.addEventListener("click", () => {
    $("#resultsPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("#btnPrevSection")?.addEventListener("click", () => {
    setCurrentSectionIndex(getState().currentSectionIndex - 1);
    saveStoredState();
    renderAll();
  });

  $("#btnNextSection")?.addEventListener("click", () => {
    setCurrentSectionIndex(getState().currentSectionIndex + 1);
    saveStoredState();
    renderAll();
  });

  $("#btnReset")?.addEventListener("click", () => {
    const ok = window.confirm("¿Deseas reiniciar la evaluación actual? Se conservará únicamente la medición previa guardada.");
    if (!ok) return;

    resetStatePreservingData();
    clearStoredState();
    saveStoredState();
    closeContextModal();
    closeGuidedPanel();
    renderAll();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  $("#btnExplainDiagram")?.addEventListener("click", () => {
    openGuidedPanel();
  });

  $("#btnCloseModal")?.addEventListener("click", () => {
    closeContextModal();
  });

  $("#btnSaveMeasurement")?.addEventListener("click", () => {
    const result = getState().result;
    if (!result) {
      alert("Primero completa la evaluación para guardar una medición.");
      return;
    }

    setPreviousResult(deepClone(result));
    saveStoredState();
    renderAll();
    alert("Medición actual guardada correctamente.");
  });

  $("#btnToggleCompare")?.addEventListener("click", () => {
    if (!getState().previousResult) {
      alert("Aún no existe una medición previa guardada.");
      return;
    }

    toggleCompare();
    saveStoredState();
    renderAll();
  });

  $("#btnExportTxt")?.addEventListener("click", () => {
    if (typeof exportResultTxt === "function") exportResultTxt();
  });

  $("#btnExportPdf")?.addEventListener("click", () => {
    if (typeof exportResultPdf === "function") exportResultPdf();
  });

  $("#btnExportPng")?.addEventListener("click", () => {
    if (typeof exportResultPng === "function") exportResultPng();
  });
}

function handleDelegatedClick(event) {
  const tab = event.target.closest(".section-tab");
  if (tab) {
    const index = Number(tab.dataset.sectionIndex);
    if (Number.isFinite(index)) {
      setCurrentSectionIndex(index);
      saveStoredState();
      renderAll();
    }
    return;
  }

  const modalClose = event.target.closest("[data-close-modal='true']");
  if (modalClose) {
    closeContextModal();
    return;
  }

  const contextTarget = event.target.closest("[data-context-id]");
  if (contextTarget) {
    const id = contextTarget.dataset.contextId;
    if (id) openContextModal(id);
  }
}

function handleDelegatedChange(event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  if (input.type !== "radio") return;

  const questionId = input.dataset.questionId;
  if (!questionId) return;

  setAnswer(questionId, Number(input.value));
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

  const wrap = $("#modalActions");
  wrap.innerHTML = "";

  if (Array.isArray(info.actions) && info.actions.length) {
    info.actions.forEach(action => {
      const div = document.createElement("div");
      div.className = "route-item";
      div.innerHTML = `<p class="route-text">${escapeHtml(action)}</p>`;
      wrap.appendChild(div);
    });
  } else {
    wrap.innerHTML = `<p class="muted">No hay acciones sugeridas.</p>`;
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