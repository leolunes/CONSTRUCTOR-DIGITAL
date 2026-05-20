window.APP_STATE = {
  data: null,
  currentSectionIndex: 0,
  answers: {},
  result: null,
  previousResult: null,
  compareEnabled: false,
  guidedStep: 0,
  ui: {
    started: false
  }
};

function getState() {
  return window.APP_STATE;
}

function resetStatePreservingData() {
  const state = getState();
  const previousData = state.data;
  const previousSaved = state.previousResult;

  window.APP_STATE = {
    data: previousData,
    currentSectionIndex: 0,
    answers: {},
    result: null,
    previousResult: previousSaved,
    compareEnabled: false,
    guidedStep: 0,
    ui: {
      started: false
    }
  };
  return window.APP_STATE;
}

function setData(data) {
  const state = getState();
  state.data = data;
}

function setAnswer(questionId, value) {
  const state = getState();
  state.answers[questionId] = Number(value);
}

function getAnswer(questionId) {
  const state = getState();
  return state.answers[questionId];
}

function setCurrentSectionIndex(index) {
  const state = getState();
  const total = state.data?.sections?.length || 0;
  state.currentSectionIndex = clamp(index, 0, Math.max(total - 1, 0));
}

function getCurrentSection() {
  const state = getState();
  if (!state.data?.sections?.length) return null;
  return state.data.sections[state.currentSectionIndex] || null;
}

function getAllQuestions() {
  const state = getState();
  const sections = state.data?.sections || [];
  return sections.flatMap(section =>
    (section.questions || []).map(q => ({
      ...q,
      sectionId: section.id,
      sectionTitle: section.title,
      verse: section.verse,
      intro: section.intro
    }))
  );
}

function countAnswered() {
  const allQuestions = getAllQuestions();
  const state = getState();
  return allQuestions.filter(q => Number.isFinite(state.answers[q.id])).length;
}

function totalQuestions() {
  return getAllQuestions().length;
}

function markStarted() {
  getState().ui.started = true;
}

function setResult(result) {
  getState().result = result;
}

function setPreviousResult(result) {
  getState().previousResult = result;
}

function toggleCompare(value = null) {
  const state = getState();
  if (typeof value === "boolean") {
    state.compareEnabled = value;
  } else {
    state.compareEnabled = !state.compareEnabled;
  }
  return state.compareEnabled;
}

function setGuidedStep(step) {
  getState().guidedStep = Math.max(0, Number(step) || 0);
}