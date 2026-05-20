(function () {

  function qs(selector, scope = document) {
    return scope.querySelector(selector);
  }

  function qsa(selector, scope = document) {
    return scope.querySelectorAll(selector);
  }

  function setHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function showMessage(message, type = "info") {
    const box = document.createElement("div");
    box.className = "ui-message " + type;
    box.textContent = message;

    document.body.appendChild(box);

    setTimeout(() => {
      box.remove();
    }, 3000);
  }

  function renderTable(containerId, columns, data) {

    const container = document.getElementById(containerId);
    if (!container) return;

    let html = `<table class="data-table">`;

    html += "<thead><tr>";
    columns.forEach(col => {
      html += `<th>${col.label}</th>`;
    });
    html += "</tr></thead>";

    html += "<tbody>";

    if (!data.length) {
      html += `<tr><td colspan="${columns.length}">Sin registros</td></tr>`;
    }

    data.forEach(row => {
      html += "<tr>";

      columns.forEach(col => {
        html += `<td>${row[col.field] ?? ""}</td>`;
      });

      html += "</tr>";
    });

    html += "</tbody></table>";

    container.innerHTML = html;
  }

  function createCard(title, value) {
    return `
      <div class="card stat-card">
        <div class="card-header">
          <h4>${title}</h4>
        </div>
        <div class="stat-value">${value}</div>
      </div>
    `;
  }

  function renderCards(containerId, cards) {

    const container = document.getElementById(containerId);
    if (!container) return;

    let html = "";

    cards.forEach(card => {
      html += createCard(card.title, card.value);
    });

    container.innerHTML = html;
  }

  function confirmAction(message) {
    return confirm(message);
  }

  function formatMoney(value) {
    const n = Number(value || 0);
    return "$ " + n.toLocaleString("es-CO");
  }

  function formatDate(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("es-CO");
  }

  function toggle(elementId, show) {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.style.display = show ? "block" : "none";
  }

  window.AFOUI = {
    qs,
    qsa,
    setHTML,
    setText,
    showMessage,
    renderTable,
    renderCards,
    confirmAction,
    formatMoney,
    formatDate,
    toggle
  };

})();