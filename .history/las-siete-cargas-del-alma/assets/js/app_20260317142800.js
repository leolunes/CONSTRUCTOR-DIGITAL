async function loadAppData() {
  const response = await fetch("./data/siete-cargas.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("No se pudo cargar el archivo de datos siete-cargas.json");
  }
  return response.json();
}

function applyMetaToUI() {
  const state = getState();
  const meta = state.data?.meta || {};

  const titleEl = $("#appTitle");
  const subtitleEl = $("#appSubtitle");
  const authorEl = $("#metaAuthor");
  const versionEl = $("#metaVersion");

  if (titleEl) titleEl.textContent = safeText(meta.appName, "Las Siete Cargas del Alma");
  if (subtitleEl) subtitleEl.textContent = safeText(meta.subtitle, "Diagnóstico espiritual estructural");
  if (authorEl) authorEl.textContent = safeText(meta.author, "Leonard Moon");
  if (versionEl) versionEl.textContent = safeText(meta.version, "v1.0.0");
  if (document.title) {
    document.title = `${safeText(meta.appName, "Las Siete Cargas del Alma")} — ${safeText(meta.subtitle, "Diagnóstico espiritual estructural")}`;
  }
}

async function initApp() {
  try {
    const data = await loadAppData();
    setData(data);

    if (typeof loadStoredState === "function") {
      loadStoredState();
    }

    applyMetaToUI();

    if (typeof bindUIEvents === "function") {
      bindUIEvents();
    }

    if (typeof renderAll === "function") {
      renderAll();
    }

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(() => {});
      });
    }
  } catch (error) {
    console.error(error);
    document.body.innerHTML = `
      <div style="padding:40px;color:#fff;background:#0f172a;font-family:system-ui,sans-serif;">
        <h1 style="margin-bottom:12px;">Error al cargar la aplicación</h1>
        <p style="color:#cbd5e1;">No fue posible iniciar la app. Revisa que el archivo <strong>data/siete-cargas.json</strong> exista y esté bien escrito.</p>
        <pre style="margin-top:16px;padding:12px;background:#111827;border-radius:8px;color:#fca5a5;white-space:pre-wrap;">${escapeHtml(error.message)}</pre>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", initApp);