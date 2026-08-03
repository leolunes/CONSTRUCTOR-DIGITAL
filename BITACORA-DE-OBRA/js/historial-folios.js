'use strict';

(() => {
  const $ = selector => document.querySelector(selector);

  const estado = {
    obra: null,
    folios: []
  };

  function ipc() {
    return window.BitacoraIPC || null;
  }

  function escapar(texto) {
    return String(texto ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function alerta(mensaje, tipo = 'informacion') {
    const contenedor = $('#contenedor-alertas');
    const item = document.createElement('div');

    item.className = `alerta alerta-${tipo} visible`;
    item.textContent = mensaje;
    contenedor.appendChild(item);

    setTimeout(() => item.remove(), 3000);
  }

  function resumenFolio(folio) {
    const texto =
      folio.anotacion?.contenidoTexto ||
      folio.contenidoTexto ||
      '';

    const limpio = texto.replace(/\s+/g, ' ').trim();

    return limpio
      ? limpio.slice(0, 120) + (limpio.length > 120 ? '…' : '')
      : 'Sin anotación';
  }

  function fechaVisible(valor) {
    if (!valor) return '';

    const fecha = new Date(`${valor}T00:00:00`);

    return Number.isNaN(fecha.getTime())
      ? valor
      : fecha.toLocaleDateString('es-CO');
  }

  function fechaHoraVisible(valor) {
    if (!valor) return '';

    const fecha = new Date(valor);

    return Number.isNaN(fecha.getTime())
      ? valor
      : fecha.toLocaleString('es-CO');
  }

  function foliosFiltrados() {
    const texto = ($('#buscar-folios').value || '')
      .trim()
      .toLowerCase();

    const estadoFiltro = $('#filtro-estado').value;

    return estado.folios.filter(folio => {
      const coincideEstado =
        !estadoFiltro ||
        folio.estadoFolio === estadoFiltro;

      const contenido = [
        folio.numero,
        folio.fecha,
        folio.estadoFolio,
        resumenFolio(folio)
      ].join(' ').toLowerCase();

      return coincideEstado &&
        (!texto || contenido.includes(texto));
    });
  }

  function renderizar() {
    const cuerpo = $('#cuerpo-folios');
    const lista = foliosFiltrados();

    cuerpo.innerHTML = '';

    lista.forEach(folio => {
      const fila = document.createElement('tr');

      fila.innerHTML = `
        <td><strong>${escapar(folio.numero)}</strong></td>
        <td>${escapar(fechaVisible(folio.fecha))}</td>
        <td><span class="estado-folio">${escapar(folio.estadoFolio || 'Borrador')}</span></td>
        <td>${escapar(resumenFolio(folio))}</td>
        <td><strong>${Array.isArray(folio.imagenes) ? folio.imagenes.length : 0}</strong></td>
        <td>${escapar(fechaHoraVisible(folio.actualizadoEn))}</td>
        <td class="acciones-folio">
          <button type="button" data-abrir="${escapar(folio.id)}">Abrir</button>
          ${folio.exportaciones?.word?.ruta ? `<button type="button" data-abrir-documento="word" data-folio="${escapar(folio.id)}">Word</button>` : ''}
          ${folio.exportaciones?.pdf?.ruta ? `<button type="button" data-abrir-documento="pdf" data-folio="${escapar(folio.id)}">PDF</button>` : ''}
          <button type="button" data-duplicar="${escapar(folio.id)}">Duplicar</button>
          <button type="button" class="peligro" data-eliminar="${escapar(folio.id)}">Eliminar</button>
        </td>
      `;

      cuerpo.appendChild(fila);
    });

    $('#total-folios').textContent = estado.folios.length;
    $('#sin-folios').hidden = lista.length > 0;
  }

  async function cargar() {
    const obraRespuesta =
      await ipc()?.obtenerObraActiva?.();

    estado.obra =
      obraRespuesta?.ok
        ? obraRespuesta.obra
        : null;

    if (!estado.obra?.id) {
      $('#nombre-obra-activa').textContent =
        'No hay una obra activa';

      alerta(
        'Seleccione una obra antes de consultar folios.',
        'advertencia'
      );

      renderizar();
      return;
    }

    $('#nombre-obra-activa').textContent =
      `${estado.obra.codigo || ''} — ${estado.obra.nombre || ''}`;

    const respuesta =
      await ipc()?.listarFolios?.({
        obraId: estado.obra.id
      });

    estado.folios =
      respuesta?.ok && Array.isArray(respuesta.folios)
        ? respuesta.folios
        : [];

    renderizar();
  }

  async function abrir(id) {
    const folio =
      estado.folios.find(item => item.id === id);

    if (!folio) return;

    await ipc()?.seleccionarFolio?.(folio);
    window.location.href = './index.html';
  }

  async function abrirDocumento(id, tipo) {
    const folio = estado.folios.find(item => item.id === id);
    const ruta = folio?.exportaciones?.[tipo]?.ruta;

    if (!ruta) {
      alerta('Este folio no tiene un archivo exportado de ese tipo.', 'advertencia');
      return;
    }

    const respuesta = await ipc()?.abrirRuta?.(ruta);

    if (!respuesta?.ok) {
      alerta(
        respuesta?.mensaje || 'No fue posible abrir el archivo exportado.',
        'error'
      );
    }
  }

  async function duplicar(id) {
    const original =
      estado.folios.find(item => item.id === id);

    if (!original) return;

    const consecutivo =
      await ipc()?.obtenerNuevoConsecutivo?.(
        estado.obra.id
      );

    const copia = {
      ...original,
      id: null,
      consecutivo: consecutivo?.consecutivo,
      numero: consecutivo?.numero,
      estadoFolio: 'Borrador',
      creadoEn: null,
      actualizadoEn: null
    };

    const respuesta =
      await ipc()?.guardarFolio?.(copia);

    if (respuesta?.ok) {
      alerta(
        `Folio ${respuesta.folio.numero} duplicado.`,
        'exito'
      );
      await cargar();
    }
  }

  async function eliminar(id) {
    const folio =
      estado.folios.find(item => item.id === id);

    if (!folio) return;

    const confirmar = window.confirm(
      `¿Eliminar definitivamente el folio ${folio.numero}?`
    );

    if (!confirmar) return;

    const boton = document.querySelector(`[data-eliminar="${CSS.escape(String(id))}"]`);
    if (boton) {
      boton.disabled = true;
      boton.textContent = 'Eliminando…';
    }

    const respuesta = await ipc()?.eliminarFolio?.(id);

    if (respuesta?.ok) {
      estado.folios = estado.folios.filter(item => String(item.id) !== String(id));
      renderizar();
      alerta('Folio eliminado definitivamente.', 'exito');
      await cargar();
    }
    else {
      if (boton) {
        boton.disabled = false;
        boton.textContent = 'Eliminar';
      }
      alerta(respuesta?.mensaje || 'No fue posible eliminar el folio.', 'error');
    }
  }

  function eventos() {
    $('#buscar-folios').addEventListener(
      'input',
      renderizar
    );

    $('#filtro-estado').addEventListener(
      'change',
      renderizar
    );

    $('#btn-volver-bitacora').addEventListener(
      'click',
      () => {
        window.location.href = './index.html';
      }
    );

    $('#btn-nuevo-folio').addEventListener(
      'click',
      async () => {
        await ipc()?.seleccionarFolio?.({
          id: null,
          obraId: estado.obra?.id || null,
          nuevo: true
        });

        window.location.href = './index.html?nuevo=1';
      }
    );

    $('#cuerpo-folios').addEventListener(
      'click',
      evento => {
        const abrirId =
          evento.target.dataset.abrir;

        const duplicarId =
          evento.target.dataset.duplicar;

        const eliminarId =
          evento.target.dataset.eliminar;

        const tipoDocumento =
          evento.target.dataset.abrirDocumento;

        const folioDocumento =
          evento.target.dataset.folio;

        if (abrirId) abrir(abrirId);
        if (tipoDocumento && folioDocumento) abrirDocumento(folioDocumento, tipoDocumento);
        if (duplicarId) duplicar(duplicarId);
        if (eliminarId) eliminar(eliminarId);
      }
    );
  }

  async function iniciar() {
    eventos();
    await cargar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      iniciar,
      { once: true }
    );
  }
  else {
    iniciar();
  }
})();
