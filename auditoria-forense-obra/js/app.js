(function () {
  let deferredPrompt = null;

  function safeArray(v) {
    return Array.isArray(v) ? v : [];
  }

  function moneyCOP(n) {
    const value = Number(n || 0);
    return "$ " + value.toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  function getStoreArray(key) {
    try {
      if (window.AFOStorage && typeof window.AFOStorage.get === "function") {
        return safeArray(window.AFOStorage.get(key, []));
      }
      const raw = localStorage.getItem(key);
      return safeArray(raw ? JSON.parse(raw) : []);
    } catch (e) {
      return [];
    }
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function updateDashboard() {
    const contratos = getStoreArray("afo_contratos");
    const facturas = getStoreArray("afo_facturas");
    const alertas = getStoreArray("afo_alertas");

    let totalIVA = 0;
    for (const f of facturas) {
      totalIVA += Number(f.iva || 0);
    }

    setText("statContratos", contratos.length);
    setText("statFacturas", facturas.length);
    setText("statAlertas", alertas.length);
    setText("statIVA", moneyCOP(totalIVA));

    setText("systemStateText", "Sistema base cargado correctamente");
    setText("appStatusBadge", "Sistema listo");
  }

  function createDemoContract() {
    const contratos = getStoreArray("afo_contratos");

    const nuevo = {
      id: "cto_" + Date.now(),
      numeroContrato: "CTO-" + new Date().getFullYear() + "-" + (contratos.length + 1),
      nombre: "Contrato de obra ejemplo",
      objeto: "Mejoramiento y adecuación de infraestructura",
      entidad: "Entidad pública de ejemplo",
      contratista: "Contratista ejemplo",
      ubicacion: "Santander",
      valorContrato: 0,
      plazoMeses: 0,
      fechaCreacion: new Date().toISOString()
    };

    contratos.unshift(nuevo);

    try {
      if (window.AFOStorage && typeof window.AFOStorage.set === "function") {
        window.AFOStorage.set("afo_contratos", contratos);
      } else {
        localStorage.setItem("afo_contratos", JSON.stringify(contratos));
      }
      updateDashboard();
      alert("Contrato base creado correctamente. Ahora podrá administrarlo en la sección Contratos.");
    } catch (e) {
      alert("No fue posible crear el contrato base.");
    }
  }

  function bindEvents() {
    const btnNuevoContrato = document.getElementById("btnNuevoContrato");
    if (btnNuevoContrato) {
      btnNuevoContrato.addEventListener("click", function () {
        createDemoContract();
      });
    }

    const btnInstalarApp = document.getElementById("btnInstalarApp");
    if (btnInstalarApp) {
      btnInstalarApp.addEventListener("click", async function () {
        if (!deferredPrompt) {
          alert("La opción de instalación aún no está disponible en este navegador o en este momento.");
          return;
        }

        deferredPrompt.prompt();
        try {
          await deferredPrompt.userChoice;
        } catch (e) {
          // sin acción
        }
        deferredPrompt = null;
      });
    }
  }

  function setupInstallPrompt() {
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      deferredPrompt = e;
    });
  }

  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("pwa/sw.js")
        .catch(function () {
          // sin acción por ahora
        });
    });
  }

  function markActiveMenu() {
    const file = location.pathname.split("/").pop() || "index.html";
    const links = document.querySelectorAll(".nav-link");
    links.forEach(function (link) {
      const href = link.getAttribute("href");
      if (href === file) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  function init() {
    markActiveMenu();
    bindEvents();
    setupInstallPrompt();
    registerSW();
    updateDashboard();
  }

  window.AFOApp = {
    init,
    updateDashboard
  };

  document.addEventListener("DOMContentLoaded", init);
})();