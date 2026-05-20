function updatePorticoVisuals(result, previousResult, compareEnabled = false) {
  updateLoadBlocks(result);
  updateMainStructure(result);
  updateAxisNotesAndHalo(result);
  bindPorticoInteractions(result);
  updatePreviousOverlay(previousResult, compareEnabled);
}

function updateLoadBlocks(result) {
  const map = result?.sections?.reduce((acc, item) => {
    acc[item.sectionId] = item;
    return acc;
  }, {}) || {};

  const ids = ["miedo", "culpa", "ansiedad", "responsabilidad", "rechazo", "escasez"];

  ids.forEach(id => {
    const block = document.getElementById(`load_${id}`);
    if (!block) return;

    block.classList.remove("load-ok", "load-warn", "load-risk", "load-critical", "load-neutral");
    const section = map[id];

    if (!section) {
      block.classList.add("load-neutral");
      return;
    }

    const cls = bandClass(section.level);
    if (cls === "ok") block.classList.add("load-ok");
    else if (cls === "warn") block.classList.add("load-warn");
    else if (cls === "risk") block.classList.add("load-risk");
    else if (cls === "critical") block.classList.add("load-critical");
    else block.classList.add("load-neutral");

    block.dataset.contextId = id;
    block.dataset.tooltip = `${section.title}: ${section.percent}% (${section.level})`;
  });
}

function updateMainStructure(result) {
  const viga = document.getElementById("vigaLine");
  const columna = document.getElementById("columnaLine");
  const cimiento = document.getElementById("cimientoLine");

  if (!viga || !columna || !cimiento) return;

  resetStructureClasses(viga);
  resetStructureClasses(columna);
  resetStructureClasses(cimiento);

  if (!result) return;

  applyBandToStructure(viga, getBandLabel(result.axes.alma, getState().data?.rubrics?.globalBands || []));
  applyBandToStructure(columna, getBandLabel(100 - result.axes.espiritu, getState().data?.rubrics?.globalBands || []));
  applyBandToStructure(cimiento, getBandLabel(100 - result.axes.cimiento, getState().data?.rubrics?.globalBands || []));

  viga.dataset.contextId = "alma";
  columna.dataset.contextId = "espiritu";
  cimiento.dataset.contextId = "cimiento";

  viga.dataset.tooltip = `Alma / Viga: ${result.axes.alma}% de retención`;
  columna.dataset.tooltip = `Espíritu / Columna: ${result.axes.espiritu}% de transferencia`;
  cimiento.dataset.tooltip = `Cimiento / Cristo: ${result.axes.cimiento}% de descanso`;
}

function resetStructureClasses(el) {
  el.classList.remove("state-ok", "state-warn", "state-risk", "state-critical", "anim-warn", "anim-risk", "anim-critical");
}

function applyBandToStructure(el, label) {
  const cls = bandClass(label);
  if (cls === "ok") {
    el.classList.add("state-ok");
  } else if (cls === "warn") {
    el.classList.add("state-warn", "anim-warn");
  } else if (cls === "risk") {
    el.classList.add("state-risk", "anim-risk");
  } else if (cls === "critical") {
    el.classList.add("state-critical", "anim-critical");
  }
}

function updateAxisNotesAndHalo(result) {
  const halos = [
    document.getElementById("halo_comunion"),
    document.getElementById("halo_interseccion"),
    document.getElementById("halo_congregacion")
  ];

  halos.forEach(h => h?.classList.add("hidden"));

  if (!result) return;

  const alma = result.axes.alma || 0;
  const espiritu = result.axes.espiritu || 0;
  const cimiento = result.axes.cimiento || 0;

  const diff1 = Math.abs(alma - espiritu);
  const diff2 = Math.abs(alma - cimiento);
  const diff3 = Math.abs(espiritu - cimiento);

  if (diff1 > 20) document.getElementById("halo_interseccion")?.classList.remove("hidden");
  if (diff2 > 20) document.getElementById("halo_comunion")?.classList.remove("hidden");
  if (diff3 > 20) document.getElementById("halo_congregacion")?.classList.remove("hidden");

  document.getElementById("node_comunion")?.setAttribute("data-context-id", "alma");
  document.getElementById("node_interseccion")?.setAttribute("data-context-id", "espiritu");
  document.getElementById("node_congregacion")?.setAttribute("data-context-id", "cimiento");

  document.getElementById("node_comunion")?.setAttribute("data-tooltip", `Diagnóstico breve: el alma está ${alma >= 60 ? "sobrecargada" : "operando con menor retención"}.`);
  document.getElementById("node_interseccion")?.setAttribute("data-tooltip", `Diagnóstico breve: la columna espiritual muestra ${espiritu >= 60 ? "transmisión firme" : "debilidad de transmisión"}.`);
  document.getElementById("node_congregacion")?.setAttribute("data-tooltip", `Diagnóstico breve: el descanso en el Cimiento es ${cimiento >= 60 ? "estable" : "limitado"}.`);
}

let __porticoBound = false;
function bindPorticoInteractions(result) {
  if (__porticoBound) return;
  __porticoBound = true;

  const container = $("#porticoContainer");
  const tooltip = $("#porticoTooltip");
  if (!container || !tooltip) return;

  container.addEventListener("mousemove", event => {
    const target = event.target.closest("[data-tooltip]");
    if (!target) {
      tooltip.classList.add("hidden");
      return;
    }

    const text = target.getAttribute("data-tooltip") || target.dataset.tooltip;
    tooltip.textContent = text || "";
    tooltip.classList.remove("hidden");

    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left + 12;
    const y = event.clientY - rect.top + 12;

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  });

  container.addEventListener("mouseleave", () => {
    tooltip.classList.add("hidden");
  });

  container.addEventListener("click", event => {
    const target = event.target.closest("[data-context-id]");
    if (!target) return;
    const id = target.dataset.contextId;
    if (id) openContextModal(id);
  });
}

function updatePreviousOverlay(previousResult, compareEnabled) {
  const group = document.getElementById("porticoPrevious");
  if (!group) return;

  if (!previousResult || !compareEnabled) {
    group.classList.add("hidden");
    return;
  }

  group.classList.remove("hidden");

  const almaOffset = mapPercentToOffset(previousResult.axes?.alma || 0, 0, 14);
  const espirituOffset = mapPercentToOffset(100 - (previousResult.axes?.espiritu || 0), 0, 14);

  const prevViga = document.getElementById("prevVigaLine");
  const prevColumna = document.getElementById("prevColumnaLine");
  const prevCimiento = document.getElementById("prevCimientoLine");

  if (prevViga) {
    prevViga.setAttribute("y1", 150 + almaOffset);
    prevViga.setAttribute("y2", 150 + almaOffset);
  }

  if (prevColumna) {
    prevColumna.setAttribute("y1", 308);
    prevColumna.setAttribute("y2", 170 + espirituOffset);
  }

  if (prevCimiento) {
    prevCimiento.setAttribute("y1", 330);
    prevCimiento.setAttribute("y2", 330);
  }
}

function mapPercentToOffset(value, minOffset, maxOffset) {
  const pct = clamp(Number(value) || 0, 0, 100) / 100;
  return round(minOffset + (pct * maxOffset), 1);
}