'use strict';

(() => {
  let obraActual = null;
  let documentos = [];

  const $ = (selector, raiz = document) => raiz.querySelector(selector);
  const escapar = valor => String(valor ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

  function formatoTamano(bytes = 0) {
    const n = Number(bytes) || 0;
    if (n < 1024) return `${n} B`;
    if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 ** 2).toFixed(1)} MB`;
  }

  function icono(extension = '') {
    const e = extension.toLowerCase();
    if (e === '.pdf') return '📕';
    if (['.doc', '.docx'].includes(e)) return '📝';
    if (['.xls', '.xlsx', '.csv'].includes(e)) return '📊';
    if (['.ppt', '.pptx'].includes(e)) return '📽️';
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(e)) return '🖼️';
    if (['.dwg', '.dxf'].includes(e)) return '📐';
    if (['.zip', '.rar'].includes(e)) return '📦';
    return '📄';
  }

  function modal() { return $('#modal-documentos-obra'); }
  function cerrar() { modal()?.classList.remove('modal-documentos--visible'); }

  function renderizar() {
    const cuerpo = $('#lista-documentos-obra');
    const busqueda = ($('#buscar-documentos-obra')?.value || '').toLowerCase();
    const filtrados = documentos.filter(d => [d.nombre, d.tipo, d.categoria, d.descripcion].join(' ').toLowerCase().includes(busqueda));
    $('#contador-documentos-obra').textContent = `${filtrados.length} documento${filtrados.length === 1 ? '' : 's'}`;
    cuerpo.innerHTML = filtrados.length ? filtrados.map(d => `
      <article class="documento-obra-item" data-id="${escapar(d.id)}">
        <div class="documento-obra-icono">${icono(d.extension)}</div>
        <div class="documento-obra-info">
          <strong title="${escapar(d.nombre)}">${escapar(d.nombre)}</strong>
          <span>${escapar(d.tipo)} · ${formatoTamano(d.tamano)} · ${new Date(d.cargadoEn).toLocaleDateString('es-CO')}</span>
        </div>
        <div class="documento-obra-acciones">
          <button class="boton boton-secundario" data-doc-accion="abrir">Abrir</button>
          <button class="boton boton-secundario" data-doc-accion="descargar">Descargar</button>
          <button class="boton boton-peligro" data-doc-accion="eliminar">Eliminar</button>
        </div>
      </article>`).join('') : '<div class="documentos-vacio">No hay documentos cargados para esta obra.</div>';
  }

  async function cargar() {
    const r = await window.electronAPI.listarDocumentosObra(obraActual.id);
    documentos = r?.ok && Array.isArray(r.documentos) ? r.documentos : [];
    renderizar();
  }

  async function abrirGestor(id) {
    const r = await window.electronAPI.listarObras();
    obraActual = r?.obras?.find(o => o.id === id);
    if (!obraActual) return alert('No fue posible identificar la obra.');
    $('#titulo-documentos-obra').textContent = 'Documentos de la Obra';
    $('#nombre-obra-documentos').textContent = obraActual.nombre || 'Obra sin nombre';
    modal().classList.add('modal-documentos--visible');
    await cargar();
  }

  async function agregar() {
    const r = await window.electronAPI.agregarDocumentosObra({ obraId: obraActual.id });
    if (r?.ok) { documentos = r.documentos || []; renderizar(); }
    else if (!r?.cancelado) alert(r?.mensaje || 'No fue posible agregar el documento.');
  }

  document.addEventListener('click', async e => {
    const botonObra = e.target.closest('[data-accion="documentos"]');
    if (botonObra) return abrirGestor(botonObra.dataset.id);
    if (e.target.closest('#cerrar-documentos-obra') || e.target === modal()) return cerrar();
    if (e.target.closest('#agregar-documento-obra')) return agregar();

    const accion = e.target.closest('[data-doc-accion]');
    if (!accion) return;
    const item = accion.closest('[data-id]');
    const doc = documentos.find(d => d.id === item?.dataset.id);
    if (!doc) return;
    const tipo = accion.dataset.docAccion;
    if (tipo === 'abrir') {
      const r = await window.electronAPI.abrirDocumentoObra(doc);
      if (!r?.ok) alert(r?.mensaje || 'No fue posible abrir el documento.');
    } else if (tipo === 'descargar') {
      const r = await window.electronAPI.descargarDocumentoObra(doc);
      if (!r?.ok && !r?.cancelado) alert(r?.mensaje || 'No fue posible descargar el documento.');
    } else if (tipo === 'eliminar') {
      if (!confirm(`¿Eliminar el documento “${doc.nombre}”?`)) return;
      const r = await window.electronAPI.eliminarDocumentoObra(doc);
      if (r?.ok) { documentos = r.documentos || []; renderizar(); }
      else alert(r?.mensaje || 'No fue posible eliminar el documento.');
    }
  });

  document.addEventListener('input', e => {
    if (e.target.id === 'buscar-documentos-obra') renderizar();
  });
})();
