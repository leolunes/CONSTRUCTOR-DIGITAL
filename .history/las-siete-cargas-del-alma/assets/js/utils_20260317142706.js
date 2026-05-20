const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function safeText(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function round(value, decimals = 0) {
  const factor = Math.pow(10, decimals);
  return Math.round((Number(value) || 0) * factor) / factor;
}

function percent(part, total) {
  if (!total) return 0;
  return round((part / total) * 100, 1);
}

function average(values = []) {
  const valid = values.filter(v => Number.isFinite(Number(v)));
  if (!valid.length) return 0;
  return valid.reduce((sum, v) => sum + Number(v), 0) / valid.length;
}

function sum(values = []) {
  return values.reduce((acc, v) => acc + (Number(v) || 0), 0);
}

function slugify(text = "") {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function nowDateTimeText() {
  const d = new Date();
  return d.toLocaleString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getBandLabel(score, bands = []) {
  const numeric = Number(score) || 0;
  const band = bands.find(b => numeric >= b.min && numeric <= b.max);
  return band ? band.label : "Sin rango";
}

function bandClass(label = "") {
  const normalized = String(label).toLowerCase();
  if (normalized.includes("alineado") || normalized.includes("leve") || normalized.includes("ok")) return "ok";
  if (normalized.includes("ajuste") || normalized.includes("moderado")) return "warn";
  if (normalized.includes("riesgo") || normalized.includes("alto")) return "risk";
  if (normalized.includes("crítico") || normalized.includes("critico") || normalized.includes("severo")) return "critical";
  return "neutral";
}

function setPillState(element, label) {
  if (!element) return;
  element.classList.remove("neutral", "ok", "warn", "risk", "critical");
  const cls = bandClass(label);
  element.classList.add("pill", cls);
  element.textContent = safeText(label, "Sin evaluar");
}

function toFileName(text = "archivo") {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\d]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80) || "archivo";
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}