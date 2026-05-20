function renderAll() {
  const state = getState();

  renderSectionTabs();
  renderCurrentSection();
  renderProgress();
  renderResult();
  renderPlanner();
  renderCompare();
  renderPorticoPanel();
}

function renderSectionTabs() {
  const state = getState();
  const wrap = $("#sectionTabs");
  if (!wrap) return;

  wrap.innerHTML = "";
  const sections = state.data?.sections || [];

  sections.forEach((section, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `btn btn-ghost section-tab ${index === state.currentSectionIndex ? "active" : ""}`;
    btn.textContent = section.title;
    btn.dataset.sectionIndex = index;
    wrap.appendChild(btn);
  });
}

function renderCurrentSection() {
  const section = getCurrentSection();
  const state = getState();
  if (!section) return;

  const titleEl = $("#sectionTitle");
  const verseEl = $("#sectionVerse");
  const introEl = $("#sectionIntro");
  const introTopEl = $("#sectionIntroTop");
  const scorePillEl = $("#sectionScorePill");
  const wrap = $("#questionsWrap");

  if (titleEl) titleEl.textContent = safeText(section.title);
  if (verseEl) verseEl.textContent = safeText(section.verse);
  if (introEl) introEl.textContent = safeText(section.intro);
  if (introTopEl) introTopEl.textContent = `Estás evaluando la carga: ${section.title}. Responde desde la realidad actual, no desde lo ideal.`;

  const sectionScore = getSectionScore(section);
  setPillState(scorePillEl, sectionScore.answered ? sectionScore.level : "Sin responder");

  if (!wrap) return;
  wrap.innerHTML = "";

  const template = $("#questionTemplate");

  section.questions.forEach((question, qIndex) => {
    const node = template.content.firstElementChild.cloneNode(true);

    $(".question-index", node).textContent = `${qIndex + 1}.`;
    $(".question-text", node).textContent = question.text;

    const radios = $$("input[type='radio']", node);
    radios.forEach(radio => {
      const uniqueName = question.id;
      radio.name = uniqueName;
      radio.dataset.questionId = question.id;
      radio.value = radio.value;

      const currentValue = getAnswer(question.id);
      if (Number(currentValue) === Number(radio.value)) {
        radio.checked = true;
      }
    });

    wrap.appendChild(node);
  });
}

function renderProgress() {
  const answered = countAnswered();
  const total = totalQuestions();
  const pct = total ? round((answered / total) * 100, 1) : 0;

  const progressText = $("#progressText");
  const progressBar = $("#progressBar");
  const progressHint = $("#progressHint");

  if (progressText) progressText.textContent = `${answered} / ${total}`;
  if (progressBar) progressBar.style.width = `${pct}%`;

  if (progressHint) {
    if (!answered) {
      progressHint.textContent = "Responde todas las preguntas para obtener un diagnóstico completo.";
    } else if (answered < total) {
      progressHint.textContent = "La lectura es parcial. Para un diagnóstico serio, completa toda la evaluación.";
    } else {
      progressHint.textContent = "Evaluación completa. El diagnóstico estructural ya está disponible.";
    }
  }
}

function renderResult() {
  const total = totalQuestions();
  const answered = countAnswered();

  if (!total || !answered) {
    setResult(null);
    renderEmptyResult();
    return;
  }

  const result = computeResult();
  setResult(result);

  const globalBandPill = $("#globalBandPill");
  const resultBandPill = $("#resultBandPill");
  const globalScoreValue = $("#globalScoreValue");
  const resultGlobalScore = $("#resultGlobalScore");
  const dominantLoadLabel = $("#dominantLoadLabel");
  const transferLevelLabel = $("#transferLevelLabel");
  const resultDominant = $("#resultDominant");
  const resultSecondary = $("#resultSecondary");
  const resultRest = $("#resultRest");
  const mainDiagnosticText = $("#mainDiagnosticText");
  const structuralObservationText = $("#structuralObservationText");

  setPillState(globalBandPill, result.globalBand);
  setPillState(resultBandPill, result.globalBand);

  if (globalScoreValue) globalScoreValue.textContent = `${result.overallScore}%`;
  if (resultGlobalScore) resultGlobalScore.textContent = `${result.overallScore}%`;

  if (dominantLoadLabel) dominantLoadLabel.textContent = safeText(result.dominant?.title);
  if (transferLevelLabel) transferLevelLabel.textContent = safeText(result.transferLevel);
  if (resultDominant) resultDominant.textContent = safeText(result.dominant?.title);
  if (resultSecondary) resultSecondary.textContent = safeText(result.secondary?.title);
  if (resultRest) resultRest.textContent = `${result.axes?.cimiento || 0}%`;

  if (mainDiagnosticText) mainDiagnosticText.textContent = getGlobalDiagnosticText(result);
  if (structuralObservationText) structuralObservationText.textContent = getStructuralObservationText(result);

  renderLoadsTable(result);
  renderRouteActions(result);
  renderAxisCards(result);
}

function renderEmptyResult() {
  const globalBandPill = $("#globalBandPill");
  const resultBandPill = $("#resultBandPill");
  const globalScoreValue = $("#globalScoreValue");
  const resultGlobalScore = $("#resultGlobalScore");
  const dominantLoadLabel = $("#dominantLoadLabel");
  const transferLevelLabel = $("#transferLevelLabel");
  const resultDominant = $("#resultDominant");
  const resultSecondary = $("#resultSecondary");
  const resultRest = $("#resultRest");
  const mainDiagnosticText = $("#mainDiagnosticText");
  const structuralObservationText = $("#structuralObservationText");

  setPillState(globalBandPill, "Sin evaluar");
  setPillState(resultBandPill, "Sin evaluar");

  if (globalScoreValue) globalScoreValue.textContent = "0";
  if (resultGlobalScore) resultGlobalScore.textContent = "0";
  if (dominantLoadLabel) dominantLoadLabel.textContent = "—";
  if (transferLevelLabel) transferLevelLabel.textContent = "—";
  if (resultDominant) resultDominant.textContent = "—";
  if (resultSecondary) resultSecondary.textContent = "—";
  if (resultRest) resultRest.textContent = "—";

  if (mainDiagnosticText) mainDiagnosticText.textContent = "Completa la evaluación para ver el diagnóstico pastoral estructural.";
  if (structuralObservationText) structuralObservationText.textContent = "La lectura del pórtico mostrará si la viga del alma está reteniendo peso, si la columna espiritual está transmitiendo adecuadamente y cuál es el nivel de descanso en el Cimiento.";

  renderLoadsTable(null);
  renderRouteActions(null);
  renderAxisCards(null);
}

function renderLoadsTable(result) {
  const tbody = $("#loadsTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!result?.sections?.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="table-empty">Aún no hay diagnóstico disponible.</td></tr>`;
    return;
  }

  result.sections.forEach(section => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(section.title)}</td>
      <td>${section.percent}%</td>
      <td>${escapeHtml(section.level)}</td>
      <td>${escapeHtml(section.verse || "—")}</td>
      <td>${escapeHtml(getSectionObservation(section))}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderRouteActions(result) {
  const wrap = $("#routeActions");
  if (!wrap) return;

  wrap.innerHTML = "";

  const actions = getRouteActions(result);
  if (!actions.length) {
    wrap.innerHTML = `<div class="route-empty">Completa la evaluación para generar acciones pastorales sugeridas.</div>`;
    return;
  }

  const template = $("#routeItemTemplate");
  actions.forEach(item => {
    const node = template.content.firstElementChild.cloneNode(true);
    $(".route-title", node).textContent = item.title;
    $(".route-text", node).textContent = item.text;
    wrap.appendChild(node);
  });
}

function renderPlanner() {
  const wrap = $("#plannerWrap");
  if (!wrap) return;

  wrap.innerHTML = "";

  const result = getState().result;
  const days = buildPlannerDays(result);

  if (!days.length) {
    wrap.innerHTML = `<div class="planner-empty">El plan se activará después del diagnóstico.</div>`;
    return;
  }

  const template = $("#plannerDayTemplate");
  days.forEach(day => {
    const node = template.content.firstElementChild.cloneNode(true);
    $(".planner-day-badge", node).textContent = day.badge;
    $(".planner-day-title", node).textContent = day.title;
    $(".planner-day-verse", node).textContent = `Verso: ${day.verse}`;
    $(".planner-day-teaching", node).textContent = day.teaching;
    $(".planner-day-action", node).textContent = `Acción práctica: ${day.action}`;
    $(".planner-day-prayer", node).textContent = `Oración: ${day.prayer}`;
    wrap.appendChild(node);
  });
}

function renderCompare() {
  const wrap = $("#compareWrap");
  const badge = $("#compareBadge");
  if (!wrap) return;

  wrap.innerHTML = "";

  const state = getState();
  const current = state.result;
  const previous = state.previousResult;

  if (!current || !previous) {
    wrap.innerHTML = `<div class="compare-empty">Aún no existe una medición previa guardada.</div>`;
    if (badge) badge.textContent = "Sin comparación previa";
    return;
  }

  const compare = buildCompareData(current, previous);
  if (!compare) {
    wrap.innerHTML = `<div class="compare-empty">No fue posible construir la comparación.</div>`;
    if (badge) badge.textContent = "Sin comparación previa";
    return;
  }

  if (badge) badge.textContent = "Comparación activa";

  const container = document.createElement("div");
  container.className = "compare-table";

  let html = `
    <div class="compare-summary">
      <p><strong>Medición anterior:</strong> ${compare.previousDate}</p>
      <p><strong>Medición actual:</strong> ${compare.currentDate}</p>
      <p><strong>Variación global:</strong> ${compare.globalDelta > 0 ? "+" : ""}${compare.globalDelta}%</p>
    </div>
    <table class="diagnostic-table">
      <thead>
        <tr>
          <th>Carga</th>
          <th>Antes</th>
          <th>Después</th>
          <th>Variación</th>
        </tr>
      </thead>
      <tbody>
  `;

  compare.rows.forEach(row => {
    html += `
      <tr>
        <td>${escapeHtml(row.title)}</td>
        <td>${row.before}%</td>
        <td>${row.after}%</td>
        <td>${row.delta > 0 ? "+" : ""}${row.delta}%</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
  wrap.appendChild(container);
}

function renderAxisCards(result) {
  const almaValue = $("#axisAlmaValue");
  const almaNote = $("#axisAlmaNote");
  const espirituValue = $("#axisEspirituValue");
  const espirituNote = $("#axisEspirituNote");
  const cimientoValue = $("#axisCimientoValue");
  const cimientoNote = $("#axisCimientoNote");

  if (!result) {
    if (almaValue) almaValue.textContent = "0%";
    if (almaNote) almaNote.textContent = "Sin lectura";
    if (espirituValue) espirituValue.textContent = "0%";
    if (espirituNote) espirituNote.textContent = "Sin lectura";
    if (cimientoValue) cimientoValue.textContent = "0%";
    if (cimientoNote) cimientoNote.textContent = "Sin lectura";
    return;
  }

  if (almaValue) almaValue.textContent = `${result.axes.alma}%`;
  if (almaNote) almaNote.textContent = result.axes.alma >= 70 ? "Sobrecargada" : result.axes.alma >= 40 ? "Con retención moderada" : "Con retención leve";

  if (espirituValue) espirituValue.textContent = `${result.axes.espiritu}%`;
  if (espirituNote) espirituNote.textContent = result.transferLevel === "Alta" ? "Columna firme" : result.transferLevel === "Media" ? "Columna intermitente" : "Columna debilitada";

  if (cimientoValue) cimientoValue.textContent = `${result.axes.cimiento}%`;
  if (cimientoNote) cimientoNote.textContent = result.axes.cimiento >= 70 ? "Descanso alto" : result.axes.cimiento >= 40 ? "Descanso parcial" : "Descanso bajo";
}

function renderPorticoPanel() {
  if (typeof updatePorticoVisuals === "function") {
    updatePorticoVisuals(getState().result, getState().previousResult, getState().compareEnabled);
  }
}