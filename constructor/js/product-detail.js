(() => {
  const page = document.querySelector('[data-product-id]');
  if (!page) return;

  const productId = page.dataset.productId;
  const products = Array.isArray(window.CONSTRUCTOR_DIGITAL_PRODUCTOS)
    ? window.CONSTRUCTOR_DIGITAL_PRODUCTOS
    : [];
  const product = products.find(item => item.id === productId);

  const setText = (id, value, fallback = '—') => {
    const element = document.getElementById(id);
    if (element) element.textContent = value || fallback;
  };

  const escapeHtml = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  if (!product) {
    const main = document.getElementById('productDetail');
    if (main) {
      main.innerHTML = '<section class="detail-section"><div class="container"><div class="detail-error">No se encontró la información del producto.</div></div></section>';
    }
    return;
  }

  document.title = `${product.nombre} | Constructor Digital`;
  setText('productIcon', product.icono);
  setText('productCategory', product.categoria);
  setText('productName', product.nombre);
  setText('productLongDescription', product.descripcionLarga || product.descripcion);
  setText('productStatus', product.estado);
  setText('productVersion', product.version);
  setText('productUpdated', product.fechaActualizacion);

  const platforms = Array.isArray(product.plataformas) ? product.plataformas : [];
  const platformMarkup = platforms.map(item => `<span>${escapeHtml(item)}</span>`).join('');
  const platformList = document.getElementById('platformList');
  const compatibilityList = document.getElementById('compatibilityList');
  if (platformList) platformList.innerHTML = platformMarkup;
  if (compatibilityList) compatibilityList.innerHTML = platformMarkup;

  const benefits = Array.isArray(product.beneficios) ? product.beneficios : [];
  const benefitIcons = ['📂', '📄', '🔎', '🤝', '📱'];
  const benefitsGrid = document.getElementById('benefitsGrid');
  if (benefitsGrid) {
    benefitsGrid.innerHTML = benefits.map((item, index) => `
      <article class="benefit-card">
        <span>${benefitIcons[index % benefitIcons.length]}</span>
        <p>${escapeHtml(item)}</p>
      </article>`).join('');
  }

  const features = Array.isArray(product.caracteristicas) ? product.caracteristicas : [];
  const featuresList = document.getElementById('featuresList');
  if (featuresList) {
    featuresList.innerHTML = features.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  }

  const history = Array.isArray(product.historial) ? product.historial : [];
  const historyList = document.getElementById('historyList');
  if (historyList) {
    historyList.innerHTML = history.map(entry => `
      <article class="timeline-item">
        <strong>${escapeHtml(entry.version)}</strong>
        <ul>${(entry.cambios || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </article>`).join('');
  }

  const roadmap = Array.isArray(product.proximasMejoras) ? product.proximasMejoras : [];
  const roadmapList = document.getElementById('roadmapList');
  if (roadmapList) {
    roadmapList.innerHTML = roadmap.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  }

  const docs = product.documentacion || {};
  const supportLink = document.getElementById('supportLink');
  if (supportLink && docs.soporte) supportLink.href = docs.soporte;

  if (docs.video) {
    setText('videoMessage', 'Video de demostración disponible.');
  }
  if (docs.manual) {
    setText('manualMessage', 'Manual de usuario disponible.');
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();