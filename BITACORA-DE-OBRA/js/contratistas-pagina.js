'use strict';

(() => {
  const $ = selector => document.querySelector(selector);

  const estado = {
    contratistas: [],
    editandoId: null
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

    item.className = `alerta alerta-${tipo}`;
    item.textContent = mensaje;

    contenedor.appendChild(item);
    setTimeout(() => item.remove(), 3500);
  }

  function habilitarFormulario() {
    const formulario = $('#formulario-contratista');
    if (!formulario) return;

    formulario.querySelectorAll('input, select, textarea, button')
      .forEach(control => {
        control.disabled = false;

        if (control.matches('input:not([type=hidden]), textarea')) {
          control.readOnly = false;
        }
      });
  }

  function abrirModal(contratista = null) {
    estado.editandoId = contratista?.id || null;
    $('#titulo-modal-contratista').textContent =
      contratista ? 'Editar contratista' : 'Nuevo contratista';

    $('#formulario-contratista').reset();
    $('#contratista-id').value = contratista?.id || '';
    $('#contratista-nombre').value = contratista?.nombre || '';
    $('#contratista-nit').value = contratista?.nit || '';
    $('#contratista-tipo').value = contratista?.tipo || 'Persona Jurídica';
    $('#contratista-representante').value = contratista?.representante || '';
    $('#contratista-residente').value = contratista?.residente || '';
    $('#contratista-telefono').value = contratista?.telefono || '';
    $('#contratista-celular').value = contratista?.celular || '';
    $('#contratista-correo').value = contratista?.correo || '';
    $('#contratista-ciudad').value = contratista?.ciudad || '';
    $('#contratista-direccion').value = contratista?.direccion || '';
    $('#contratista-observaciones').value = contratista?.observaciones || '';

    habilitarFormulario();
    $('#modal-contratista').hidden = false;
    document.body.classList.add('modal-abierto');

    setTimeout(() => {
      habilitarFormulario();
      const primerCampo = $('#contratista-nombre');
      primerCampo?.focus();
      primerCampo?.select();
    }, 0);
  }

  function cerrarModal() {
    $('#modal-contratista').hidden = true;
    document.body.classList.remove('modal-abierto');
  }

  function leerFormulario() {
    return {
      id: estado.editandoId,
      nombre: $('#contratista-nombre').value.trim(),
      nit: $('#contratista-nit').value.trim(),
      tipo: $('#contratista-tipo').value,
      representante: $('#contratista-representante').value.trim(),
      residente: $('#contratista-residente').value.trim(),
      telefono: $('#contratista-telefono').value.trim(),
      celular: $('#contratista-celular').value.trim(),
      correo: $('#contratista-correo').value.trim(),
      ciudad: $('#contratista-ciudad').value.trim(),
      direccion: $('#contratista-direccion').value.trim(),
      observaciones: $('#contratista-observaciones').value.trim()
    };
  }

  function filtrados() {
    const texto = ($('#buscar-contratista').value || '')
      .trim()
      .toLowerCase();

    return estado.contratistas.filter(item => {
      const contenido = [
        item.nombre,
        item.nit,
        item.tipo,
        item.representante,
        item.ciudad
      ].join(' ').toLowerCase();

      return !texto || contenido.includes(texto);
    });
  }

  function renderizar() {
    const cuerpo = $('#cuerpo-contratistas');
    const lista = filtrados();

    cuerpo.innerHTML = '';

    lista.forEach(item => {
      const fila = document.createElement('tr');

      fila.innerHTML = `
        <td><strong>${escapar(item.nombre)}</strong><small>${escapar(item.ciudad || '')}</small></td>
        <td>${escapar(item.nit)}</td>
        <td>${escapar(item.tipo || '')}</td>
        <td>${escapar(item.representante || '')}</td>
        <td>${escapar(item.telefono || item.celular || item.correo || '')}</td>
        <td>
          <div class="grupo-acciones-tabla">
            <button class="boton-icono" type="button" data-editar="${escapar(item.id)}" title="Editar">✎</button>
            <button class="boton-icono" type="button" data-eliminar="${escapar(item.id)}" title="Eliminar">🗑</button>
          </div>
        </td>
      `;

      cuerpo.appendChild(fila);
    });

    $('#resumen-contratistas').textContent =
      `${estado.contratistas.length} contratista${estado.contratistas.length === 1 ? '' : 's'}`;

    $('#sin-contratistas').hidden = lista.length > 0;
  }

  async function cargar() {
    const respuesta = await ipc()?.listarContratistas?.();

    estado.contratistas =
      respuesta?.ok && Array.isArray(respuesta.contratistas)
        ? respuesta.contratistas
        : [];

    renderizar();
  }

  async function guardar(evento) {
    evento.preventDefault();

    if (!evento.currentTarget.reportValidity()) {
      return;
    }

    const botonGuardar = evento.currentTarget.querySelector('button[type="submit"]');
    if (botonGuardar) {
      botonGuardar.disabled = true;
      botonGuardar.textContent = 'Guardando...';
    }

    let respuesta;
    try {
      respuesta = await ipc()?.guardarContratista?.(leerFormulario());
    }
    catch (error) {
      console.error('Error al guardar contratista:', error);
      respuesta = {
        ok: false,
        mensaje: 'No fue posible guardar. Verifique que Safari no esté en navegación privada y que el dispositivo tenga espacio disponible.'
      };
    }
    finally {
      if (botonGuardar) {
        botonGuardar.disabled = false;
        botonGuardar.textContent = 'Guardar contratista';
      }
    }

    if (!respuesta?.ok) {
      alerta(
        respuesta?.mensaje ||
        'No fue posible guardar el contratista.',
        'error'
      );
      return;
    }

    cerrarModal();
    alerta('Contratista guardado correctamente.', 'exito');
    await cargar();
  }

  async function eliminar(id) {
    const item =
      estado.contratistas.find(c => c.id === id);

    if (!item) return;

    if (!window.confirm(
      `¿Eliminar el contratista ${item.nombre}?`
    )) {
      return;
    }

    const respuesta =
      await ipc()?.eliminarContratista?.(id);

    if (respuesta?.ok) {
      alerta('Contratista eliminado.', 'exito');
      await cargar();
    }
  }

  function eventos() {
    const contenidoModal = document.querySelector(
      '#modal-contratista .modal__contenido'
    );

    contenidoModal?.addEventListener('click', evento => {
      evento.stopPropagation();
    });

    contenidoModal?.addEventListener('mousedown', evento => {
      evento.stopPropagation();
    });

    $('#formulario-contratista')?.addEventListener('focusin', evento => {
      const control = evento.target;
      if (control.matches?.('input, select, textarea')) {
        control.disabled = false;
        if (control.matches('input:not([type=hidden]), textarea')) {
          control.readOnly = false;
        }
      }
    });

    $('#btn-nuevo-contratista').addEventListener(
      'click',
      () => abrirModal()
    );

    $('#buscar-contratista').addEventListener(
      'input',
      renderizar
    );

    $('#formulario-contratista').addEventListener(
      'submit',
      guardar
    );

    document.querySelectorAll('[data-cerrar-modal]')
      .forEach(elemento => {
        elemento.addEventListener('click', cerrarModal);
      });

    $('#cuerpo-contratistas').addEventListener(
      'click',
      evento => {
        const editarId = evento.target.dataset.editar;
        const eliminarId = evento.target.dataset.eliminar;

        if (editarId) {
          abrirModal(
            estado.contratistas.find(
              item => item.id === editarId
            )
          );
        }

        if (eliminarId) {
          eliminar(eliminarId);
        }
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
