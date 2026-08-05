
(() => {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  const division = grid.dataset.division;
  const allProducts = Array.isArray(window.CONSTRUCTOR_DIGITAL_PRODUCTOS)
    ? window.CONSTRUCTOR_DIGITAL_PRODUCTOS.filter(p => p.division === division)
    : [];

  const searchInput = document.getElementById('searchInput');
  const clearSearch = document.getElementById('clearSearch');
  const resultCount = document.getElementById('resultCount');
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  let activeFilter = 'Todos';

  const normalize = value => String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const escapeHtml = value => String(value ?? '')
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'","&#039;");

  const statusClass = status => {
    if (status === 'Disponible') return 'available';
    if (status === 'En desarrollo') return 'development';
    return '';
  };

  const renderCard = product => {
    const available = product.estado === 'Disponible' && product.ruta;
    const features = Array.isArray(product.caracteristicas) && product.caracteristicas.length
      ? `<ul class="features">${product.caracteristicas.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>` : '';
    const platforms = Array.isArray(product.plataformas)
      ? `<div class="platforms">${product.plataformas.map(x => `<span class="platform">${escapeHtml(x)}</span>`).join('')}</div>` : '';
    const destination = product.rutaFicha || product.ruta;
    const actionLabel = product.rutaFicha ? 'Ver producto' : 'Abrir aplicación';
    const action = available
      ? `<a class="open-app" href="${escapeHtml(destination)}">${actionLabel}</a>`
      : `<span class="unavailable">${escapeHtml(product.estado)}</span>`;

    return `<article class="product-card${product.destacado ? ' featured' : ''}">
      <div class="card-top">
        <span class="product-icon">${escapeHtml(product.icono)}</span>
        <span class="badge ${statusClass(product.estado)}">${escapeHtml(product.estado)}</span>
      </div>
      <span class="category">${escapeHtml(product.categoria)}</span>
      <h3>${escapeHtml(product.nombre)}</h3>
      <p>${escapeHtml(product.descripcion)}</p>
      ${features}
      ${platforms}
      <div class="card-bottom">
        ${action}
        <span class="version">${escapeHtml(product.version || '')}</span>
      </div>
    </article>`;
  };

  const updateStats = () => {
    const set = (name, value) => {
      const el = document.querySelector(`[data-stat="${name}"]`);
      if (el) el.textContent = value;
    };
    set('total', allProducts.length);
    set('available', allProducts.filter(p => p.estado === 'Disponible').length);
    set('development', allProducts.filter(p => p.estado === 'En desarrollo').length);
    set('featured', allProducts.filter(p => p.destacado).length);
  };

  const render = () => {
    const query = normalize(searchInput?.value);
    const filtered = allProducts.filter(product => {
      const matchesStatus = activeFilter === 'Todos' || product.estado === activeFilter;
      const haystack = normalize([
        product.nombre, product.categoria, product.descripcion,
        ...(product.caracteristicas || []), ...(product.plataformas || [])
      ].join(' '));
      return matchesStatus && (!query || haystack.includes(query));
    });

    grid.innerHTML = filtered.length
      ? filtered.map(renderCard).join('')
      : '<div class="empty">No se encontraron productos con esos criterios.</div>';

    if (resultCount) resultCount.textContent =
      `${filtered.length} producto${filtered.length === 1 ? '' : 's'} encontrado${filtered.length === 1 ? '' : 's'}.`;
  };

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach(b => b.classList.toggle('active', b === button));
      render();
    });
  });

  searchInput?.addEventListener('input', render);
  clearSearch?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    activeFilter = 'Todos';
    filterButtons.forEach(b => b.classList.toggle('active', b.dataset.filter === 'Todos'));
    render();
    searchInput?.focus();
  });

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  updateStats();
  render();
})();
