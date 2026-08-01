'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/bitacora.js
   Propósito: gestión de registros, folios y datos de bitácora
   ========================================================= */

(() => {
  const CLAVES = Object.freeze({
    REGISTROS: 'bitacora_registros',
    REGISTRO_ACTUAL: 'bitacora_registro_actual',
    ULTIMO_FOLIO: 'bitacora_ultimo_folio',
    CONFIGURACION: 'bitacora_configuracion'
  });

  const SELECTORES = Object.freeze({
    formulario: '#formulario-bitacora, form[data-bitacora]',
    editor: '#editor-contenido, .editor-contenido',
    folio: '#numero-folio, [data-campo="folio"]',
    estadoRegistro: '#estado-registro, [data-estado-registro]',
    listaRegistros: '#lista-registros, [data-lista-registros]',
    buscadorRegistros: '#buscar-registros, [data-buscar-registros]',
    filtroEstado: '#filtro-estado, [data-filtro-estado]',
    contadorRegistros: '#contador-registros, [data-contador-registros]'
  });

  const ESTADO = {
    idActual: null,
    registros: [],
    iniciado: false
  };

  function seleccionar(selector, raiz = document) {
    return raiz.querySelector(selector);
  }

  function seleccionarTodos(selector, raiz = document) {
    return Array.from(raiz.querySelectorAll(selector));
  }

  function generarId() {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }

    return `bitacora-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function normalizarTexto(valor) {
    return String(valor ?? '').trim();
  }

  function escaparHTML(valor) {
    return String(valor ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function hoyISO() {
    const fecha = new Date();
    const ajuste = fecha.getTimezoneOffset() * 60000;
    return new Date(fecha.getTime() - ajuste).toISOString().slice(0, 10);
  }

  function formatearFecha(valor) {
    if (!valor) return 'Sin fecha';

    const fecha = new Date(`${valor}T00:00:00`);
    if (Number.isNaN(fecha.getTime())) return valor;

    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(fecha);
  }

  function formatearFechaHora(valor) {
    if (!valor) return '';

    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return '';

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(fecha);
  }

  function obtenerRegistros() {
    try {
      const texto = localStorage.getItem(CLAVES.REGISTROS);
      const datos = texto ? JSON.parse(texto) : [];
      return Array.isArray(datos) ? datos : [];
    } catch (error) {
      console.error('No fue posible leer los registros:', error);
      return [];
    }
  }

  function guardarRegistros() {
    try {
      localStorage.setItem(CLAVES.REGISTROS, JSON.stringify(ESTADO.registros));
      return true;
    } catch (error) {
      console.error('No fue posible guardar los registros:', error);
      mostrarMensaje('No fue posible guardar la información.', 'error');
      return false;
    }
  }

  function obtenerValorCampo(campo) {
    if (!campo) return '';

    if (campo.type === 'checkbox') {
      return campo.checked;
    }

    if (campo.type === 'radio') {
      return campo.checked ? campo.value : undefined;
    }

    if (campo.isContentEditable) {
      return campo.innerHTML;
    }

    return campo.value ?? '';
  }

  function recopilarDatosFormulario() {
    const datos = {};
    const campos = seleccionarTodos(
      'input[name], select[name], textarea[name], [contenteditable="true"][data-campo]'
    );

    campos.forEach((campo) => {
      const nombre = campo.name || campo.dataset.campo;
      if (!nombre) return;

      if (campo.type === 'radio') {
        if (campo.checked) datos[nombre] = campo.value;
        return;
      }

      datos[nombre] = obtenerValorCampo(campo);
    });

    const editor = seleccionar(SELECTORES.editor);
    const folio = seleccionar(SELECTORES.folio);

    datos.contenido = editor?.innerHTML || '';
    datos.textoPlano = editor?.innerText?.trim() || '';
    datos.folio = folio
      ? ('value' in folio ? folio.value : folio.textContent)
      : datos.folio || '';

    return datos;
  }

  function aplicarDatosFormulario(datos = {}) {
    const campos = seleccionarTodos(
      'input[name], select[name], textarea[name], [contenteditable="true"][data-campo]'
    );

    campos.forEach((campo) => {
      const nombre = campo.name || campo.dataset.campo;
      if (!nombre || !(nombre in datos)) return;

      if (campo.type === 'checkbox') {
        campo.checked = Boolean(datos[nombre]);
      } else if (campo.type === 'radio') {
        campo.checked = campo.value === datos[nombre];
      } else if (campo.isContentEditable) {
        campo.innerHTML = datos[nombre] || '';
      } else {
        campo.value = datos[nombre] ?? '';
      }
    });

    const editor = seleccionar(SELECTORES.editor);
    if (editor) {
      editor.innerHTML = datos.contenido || '';
    }

    const folio = seleccionar(SELECTORES.folio);
    if (folio && datos.folio) {
      if ('value' in folio) {
        folio.value = datos.folio;
      } else {
        folio.textContent = datos.folio;
      }
    }

    window.BitacoraEditor?.actualizarContador?.();
  }

  function validarDatos(datos) {
    const errores = [];

    if (!normalizarTexto(datos.fechaInicio || datos.fecha || '')) {
      errores.push('Debe indicar la fecha de la anotación.');
    }

    if (!normalizarTexto(datos.contenido || '').replace(/<[^>]*>/g, '')) {
      errores.push('Debe escribir la anotación de la bitácora.');
    }

    return errores;
  }

  function construirRegistro(datos, existente = null) {
    const ahora = new Date().toISOString();

    return {
      id: existente?.id || generarId(),
      folio: normalizarTexto(datos.folio) || obtenerSiguienteFolio(),
      fechaInicio: datos.fechaInicio || datos.fecha || hoyISO(),
      fechaFinal: datos.fechaFinal || '',
      estado: datos.estado || 'Borrador',
      obra: datos.obra || datos.nombreObra || '',
      contrato: datos.contrato || datos.numeroContrato || '',
      contratista: datos.contratista || '',
      interventoria: datos.interventoria || datos.interventor || '',
      supervisor: datos.supervisor || '',
      residente: datos.residente || '',
      clima: datos.clima || '',
      contenido: datos.contenido || '',
      textoPlano: datos.textoPlano || '',
      nota: datos.nota || '',
      firmaContratista: datos.firmaContratista || '',
      firmaInterventor: datos.firmaInterventor || '',
      firmaSupervisor: datos.firmaSupervisor || '',
      datosAdicionales: datos,
      creadoEn: existente?.creadoEn || ahora,
      actualizadoEn: ahora
    };
  }

  function obtenerSiguienteFolio() {
    const ultimoGuardado = Number.parseInt(
      localStorage.getItem(CLAVES.ULTIMO_FOLIO) || '0',
      10
    );

    const ultimoRegistros = ESTADO.registros.reduce((maximo, registro) => {
      const numero = Number.parseInt(registro.folio, 10);
      return Number.isFinite(numero) ? Math.max(maximo, numero) : maximo;
    }, 0);

    const siguiente = Math.max(ultimoGuardado, ultimoRegistros) + 1;
    return String(siguiente).padStart(5, '0');
  }

  function actualizarUltimoFolio(folio) {
    const numero = Number.parseInt(folio, 10);
    if (Number.isFinite(numero)) {
      localStorage.setItem(CLAVES.ULTIMO_FOLIO, String(numero));
    }
  }

  function guardarRegistro(opciones = {}) {
    const datos = recopilarDatosFormulario();
    const errores = opciones.validar === false ? [] : validarDatos(datos);

    if (errores.length) {
      mostrarMensaje(errores.join('\n'), 'advertencia');
      enfocarPrimerCampoInvalido(datos);
      return null;
    }

    const indice = ESTADO.registros.findIndex(
      (registro) => registro.id === ESTADO.idActual
    );

    const existente = indice >= 0 ? ESTADO.registros[indice] : null;
    const registro = construirRegistro(datos, existente);

    if (indice >= 0) {
      ESTADO.registros.splice(indice, 1, registro);
    } else {
      ESTADO.registros.unshift(registro);
    }

    if (!guardarRegistros()) return null;

    ESTADO.idActual = registro.id;
    localStorage.setItem(CLAVES.REGISTRO_ACTUAL, registro.id);
    actualizarUltimoFolio(registro.folio);
    actualizarEstadoRegistro('Guardado');
    renderizarRegistros();
    mostrarMensaje(
      existente ? 'Registro actualizado correctamente.' : 'Registro guardado correctamente.',
      'exito'
    );

    document.dispatchEvent(
      new CustomEvent('bitacora:registro-guardado', {
        detail: registro
      })
    );

    return registro;
  }

  function abrirRegistro(id) {
    const registro = ESTADO.registros.find((item) => item.id === id);

    if (!registro) {
      mostrarMensaje('No se encontró el registro seleccionado.', 'error');
      return false;
    }

    const datos = {
      ...(registro.datosAdicionales || {}),
      ...registro
    };

    aplicarDatosFormulario(datos);
    ESTADO.idActual = registro.id;
    localStorage.setItem(CLAVES.REGISTRO_ACTUAL, registro.id);
    actualizarEstadoRegistro(`Folio ${registro.folio}`);

    document.dispatchEvent(
      new CustomEvent('bitacora:registro-abierto', {
        detail: registro
      })
    );

    return true;
  }

  function eliminarRegistro(id) {
    const registro = ESTADO.registros.find((item) => item.id === id);
    if (!registro) return false;

    const confirmar = window.confirm(
      `¿Desea eliminar definitivamente el folio ${registro.folio}?`
    );

    if (!confirmar) return false;

    ESTADO.registros = ESTADO.registros.filter((item) => item.id !== id);

    if (!guardarRegistros()) return false;

    if (ESTADO.idActual === id) {
      ESTADO.idActual = null;
      localStorage.removeItem(CLAVES.REGISTRO_ACTUAL);
    }

    renderizarRegistros();
    mostrarMensaje('Registro eliminado correctamente.', 'exito');

    document.dispatchEvent(
      new CustomEvent('bitacora:registro-eliminado', {
        detail: registro
      })
    );

    return true;
  }

  function duplicarRegistro(id) {
    const original = ESTADO.registros.find((item) => item.id === id);
    if (!original) return null;

    const ahora = new Date().toISOString();
    const copia = {
      ...original,
      id: generarId(),
      folio: obtenerSiguienteFolio(),
      estado: 'Borrador',
      creadoEn: ahora,
      actualizadoEn: ahora
    };

    ESTADO.registros.unshift(copia);
    guardarRegistros();
    actualizarUltimoFolio(copia.folio);
    renderizarRegistros();
    mostrarMensaje('Se creó una copia del registro.', 'exito');

    return copia;
  }

  function nuevoRegistro() {
    ESTADO.idActual = null;
    localStorage.removeItem(CLAVES.REGISTRO_ACTUAL);

    const formulario = seleccionar(SELECTORES.formulario);
    if (formulario?.reset) formulario.reset();

    seleccionarTodos('input, textarea, select').forEach((campo) => {
      if (campo.readOnly || campo.disabled) return;

      if (campo.type === 'checkbox' || campo.type === 'radio') {
        campo.checked = false;
      } else {
        campo.value = '';
      }
    });

    seleccionarTodos('[contenteditable="true"]').forEach((elemento) => {
      elemento.innerHTML = '';
    });

    const folio = seleccionar(SELECTORES.folio);
    const siguienteFolio = obtenerSiguienteFolio();

    if (folio) {
      if ('value' in folio) {
        folio.value = siguienteFolio;
      } else {
        folio.textContent = siguienteFolio;
      }
    }

    const fecha = seleccionar(
      '#fecha-inicio, [name="fechaInicio"], [name="fecha"]'
    );

    if (fecha) fecha.value = hoyISO();

    actualizarEstadoRegistro('Nuevo registro');
    window.BitacoraEditor?.actualizarContador?.();

    document.dispatchEvent(new CustomEvent('bitacora:registro-nuevo'));
  }

  function filtrarRegistros() {
    const buscador = seleccionar(SELECTORES.buscadorRegistros);
    const filtroEstado = seleccionar(SELECTORES.filtroEstado);

    const texto = normalizarTexto(buscador?.value).toLowerCase();
    const estado = normalizarTexto(filtroEstado?.value).toLowerCase();

    return ESTADO.registros.filter((registro) => {
      const coincideEstado =
        !estado ||
        estado === 'todos' ||
        normalizarTexto(registro.estado).toLowerCase() === estado;

      const contenidoBusqueda = [
        registro.folio,
        registro.fechaInicio,
        registro.obra,
        registro.contrato,
        registro.contratista,
        registro.interventoria,
        registro.supervisor,
        registro.textoPlano
      ]
        .join(' ')
        .toLowerCase();

      return coincideEstado && (!texto || contenidoBusqueda.includes(texto));
    });
  }

  function renderizarRegistros() {
    const contenedor = seleccionar(SELECTORES.listaRegistros);
    const contador = seleccionar(SELECTORES.contadorRegistros);
    const registros = filtrarRegistros();

    if (contador) {
      contador.textContent = `${registros.length} registro${registros.length === 1 ? '' : 's'}`;
    }

    if (!contenedor) return;

    if (!registros.length) {
      contenedor.innerHTML = `
        <div class="lista-vacia">
          <p>No hay registros que coincidan con la búsqueda.</p>
        </div>
      `;
      return;
    }

    contenedor.innerHTML = registros
      .map((registro) => {
        const resumen = normalizarTexto(registro.textoPlano).slice(0, 170);
        const activo = registro.id === ESTADO.idActual ? ' activo' : '';

        return `
          <article class="registro-bitacora${activo}" data-registro-id="${escaparHTML(registro.id)}">
            <div class="registro-cabecera">
              <div>
                <strong>Folio ${escaparHTML(registro.folio)}</strong>
                <span>${escaparHTML(formatearFecha(registro.fechaInicio))}</span>
              </div>
              <span class="etiqueta-estado">${escaparHTML(registro.estado || 'Borrador')}</span>
            </div>

            <div class="registro-detalle">
              <p><strong>Obra:</strong> ${escaparHTML(registro.obra || 'Sin especificar')}</p>
              <p>${escaparHTML(resumen || 'Sin anotación')}</p>
              <small>Actualizado: ${escaparHTML(formatearFechaHora(registro.actualizadoEn))}</small>
            </div>

            <div class="registro-acciones">
              <button type="button" class="boton boton-secundario" data-accion-registro="abrir">
                Abrir
              </button>
              <button type="button" class="boton boton-secundario" data-accion-registro="duplicar">
                Duplicar
              </button>
              <button type="button" class="boton boton-peligro" data-accion-registro="eliminar">
                Eliminar
              </button>
            </div>
          </article>
        `;
      })
      .join('');
  }

  function actualizarEstadoRegistro(texto) {
    const elemento = seleccionar(SELECTORES.estadoRegistro);
    if (elemento) elemento.textContent = texto;
  }

  function enfocarPrimerCampoInvalido(datos) {
    if (!normalizarTexto(datos.fechaInicio || datos.fecha || '')) {
      seleccionar('#fecha-inicio, [name="fechaInicio"], [name="fecha"]')?.focus();
      return;
    }

    if (!normalizarTexto(datos.textoPlano || '')) {
      seleccionar(SELECTORES.editor)?.focus();
    }
  }

  function mostrarMensaje(mensaje, tipo = 'informacion') {
    if (window.BitacoraUI?.mostrarAlerta) {
      window.BitacoraUI.mostrarAlerta(mensaje, tipo);
      return;
    }

    if (tipo === 'error' || tipo === 'advertencia') {
      window.alert(mensaje);
      return;
    }

    console.info(mensaje);
  }

  function exportarRegistroActual() {
    if (!ESTADO.idActual) {
      return guardarRegistro();
    }

    return ESTADO.registros.find((registro) => registro.id === ESTADO.idActual) || null;
  }

  function obtenerRegistroActual() {
    return ESTADO.registros.find((registro) => registro.id === ESTADO.idActual) || null;
  }

  function configurarEventos() {
    document.addEventListener('click', (evento) => {
      const boton = evento.target.closest('[data-accion-registro]');
      if (!boton) return;

      const tarjeta = boton.closest('[data-registro-id]');
      const id = tarjeta?.dataset.registroId;
      if (!id) return;

      const accion = boton.dataset.accionRegistro;

      if (accion === 'abrir') abrirRegistro(id);
      if (accion === 'eliminar') eliminarRegistro(id);
      if (accion === 'duplicar') duplicarRegistro(id);
    });

    seleccionar(SELECTORES.buscadorRegistros)?.addEventListener(
      'input',
      renderizarRegistros
    );

    seleccionar(SELECTORES.filtroEstado)?.addEventListener(
      'change',
      renderizarRegistros
    );

    document.addEventListener('bitacora:guardar-solicitado', () => {
      guardarRegistro();
    });

    document.addEventListener('bitacora:abrir-solicitado', () => {
      const panel = seleccionar(SELECTORES.listaRegistros);
      panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.addEventListener('bitacora:nueva', () => {
      ESTADO.idActual = null;
      localStorage.removeItem(CLAVES.REGISTRO_ACTUAL);
      renderizarRegistros();
    });

    document.addEventListener('bitacora:exportar-word', () => {
      document.dispatchEvent(
        new CustomEvent('bitacora:exportar-registro-word', {
          detail: exportarRegistroActual()
        })
      );
    });

    document.addEventListener('bitacora:exportar-pdf', () => {
      document.dispatchEvent(
        new CustomEvent('bitacora:exportar-registro-pdf', {
          detail: exportarRegistroActual()
        })
      );
    });

    window.addEventListener('storage', (evento) => {
      if (evento.key === CLAVES.REGISTROS) {
        ESTADO.registros = obtenerRegistros();
        renderizarRegistros();
      }
    });
  }

  function cargarRegistroAnterior() {
    const id = localStorage.getItem(CLAVES.REGISTRO_ACTUAL);
    if (!id) return false;

    return abrirRegistro(id);
  }

  function iniciar() {
    if (ESTADO.iniciado) return;
    ESTADO.iniciado = true;

    ESTADO.registros = obtenerRegistros();
    configurarEventos();
    renderizarRegistros();

    if (!cargarRegistroAnterior()) {
      const folio = seleccionar(SELECTORES.folio);
      if (folio) {
        const valorActual = 'value' in folio ? folio.value : folio.textContent;

        if (!normalizarTexto(valorActual)) {
          const siguiente = obtenerSiguienteFolio();

          if ('value' in folio) {
            folio.value = siguiente;
          } else {
            folio.textContent = siguiente;
          }
        }
      }
    }

    document.dispatchEvent(
      new CustomEvent('bitacora:modulo-registros-listo', {
        detail: {
          cantidad: ESTADO.registros.length
        }
      })
    );

    console.info('Módulo de registros de Bitácora inicializado.');
  }

  window.BitacoraRegistros = Object.freeze({
    iniciar,
    nuevoRegistro,
    guardarRegistro,
    abrirRegistro,
    eliminarRegistro,
    duplicarRegistro,
    obtenerRegistros: () => [...ESTADO.registros],
    obtenerRegistroActual,
    recopilarDatosFormulario,
    aplicarDatosFormulario,
    renderizarRegistros,
    obtenerSiguienteFolio
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  } else {
    iniciar();
  }
})();