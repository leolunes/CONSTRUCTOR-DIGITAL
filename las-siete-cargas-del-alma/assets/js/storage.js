const STORAGE_KEY = "siete_cargas_alma_app_v1";
const STORAGE_BACKUP_KEY = "siete_cargas_alma_app_v1_backup";

function storageAvailable() {
  try {
    const key = "__test_storage__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return true;
  } catch (_) {
    return false;
  }
}

function buildStoragePayload() {
  const state = getState();
  return {
    answers: state.answers || {},
    previousResult: state.previousResult || null,
    compareEnabled: !!state.compareEnabled,
    currentSectionIndex: Number(state.currentSectionIndex || 0),
    ui: state.ui || { started: false }
  };
}

function saveStoredState() {
  if (!storageAvailable()) return;
  const payload = JSON.stringify(buildStoragePayload());
  try {
    localStorage.setItem(STORAGE_KEY, payload);
    localStorage.setItem(STORAGE_BACKUP_KEY, payload);
  } catch (error) {
    console.warn("No se pudo guardar el estado local:", error);
  }
}

function parseStoredPayload(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (_) {
    return null;
  }
}

function loadStoredState() {
  if (!storageAvailable()) return false;

  let payload = parseStoredPayload(localStorage.getItem(STORAGE_KEY));
  if (!payload) {
    payload = parseStoredPayload(localStorage.getItem(STORAGE_BACKUP_KEY));
  }
  if (!payload) return false;

  const state = getState();
  state.answers = payload.answers && typeof payload.answers === "object" ? payload.answers : {};
  state.previousResult = payload.previousResult || null;
  state.compareEnabled = !!payload.compareEnabled;
  state.currentSectionIndex = Number(payload.currentSectionIndex || 0);
  state.ui = payload.ui || { started: false };

  return true;
}

function clearStoredState() {
  if (!storageAvailable()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_BACKUP_KEY);
  } catch (_) {}
}