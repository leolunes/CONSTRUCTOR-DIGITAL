'use strict';

(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));

  // Escapa texto antes de insertarlo en las plantillas HTML de Word, PDF
  // e informe consolidado. Se define dentro de este módulo para que las
  // exportaciones no dependan de funciones privadas de otros archivos.
  function escaparHTML(valor) {
    return String(valor ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  const estado = {
    iniciado: false,
    obraActiva: null,
    obras: [],
    contratistas: [],
    folioActual: null,
    folios: [],
    imagenes: [],
    anexos: [],
    guardando: false
  };

  function ipc() {
    return window.BitacoraIPC || null;
  }

  function alerta(mensaje, tipo = 'informacion') {
    const contenedor = $('#contenedor-alertas');

    if (!contenedor) {
      console.log(`[${tipo}] ${mensaje}`);
      return;
    }

    const item = document.createElement('div');
    item.className = `alerta alerta-${tipo} visible`;
    item.innerHTML =
      '<div class="alerta-titulo">Bitácora de Obra</div>' +
      '<div class="alerta-mensaje"></div>';

    item.querySelector('.alerta-mensaje').textContent = mensaje;
    contenedor.appendChild(item);

    setTimeout(() => item.remove(), 3500);
  }

  function cambiarEstado(texto, tipo = 'normal') {
    const elemento = $('#estado-guardado');

    if (!elemento) return;

    elemento.textContent = texto;
    elemento.dataset.tipo = tipo;
  }

  function hoy() {
    const fecha = new Date();
    const zona = fecha.getTimezoneOffset() * 60000;

    return new Date(fecha.getTime() - zona)
      .toISOString()
      .slice(0, 10);
  }

  function actualizarContador() {
    const texto = $('#editor-contenido')?.innerText || '';
    const palabras = texto.trim()
      ? texto.trim().split(/\s+/).length
      : 0;

    const elemento = $('#contador-editor');

    if (elemento) {
      elemento.textContent =
        `${palabras} palabra${palabras === 1 ? '' : 's'} · ` +
        `${texto.length} caracteres`;
    }
  }

  function limpiarVistaArchivos() {
    estado.imagenes = [];
    estado.anexos = [];

    renderizarImagenes();
    renderizarAnexos();
  }

  const firmasDigitales = new Map();

  function prepararFirmaDigital(tipo, canvasId, inputId) {
    const canvas = document.getElementById(canvasId);
    const input = document.getElementById(inputId);
    if (!canvas || !input || firmasDigitales.has(tipo)) return;

    const contexto = canvas.getContext('2d');
    let dibujando = false;
    let ultimo = null;

    const redimensionar = () => {
      const valorActual = input.value;
      const rect = canvas.getBoundingClientRect();
      const escala = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = Math.max(1, Math.round(rect.width * escala));
      canvas.height = Math.max(1, Math.round(rect.height * escala));
      contexto.setTransform(escala, 0, 0, escala, 0, 0);
      contexto.lineWidth = 2.2;
      contexto.lineCap = 'round';
      contexto.lineJoin = 'round';
      contexto.strokeStyle = '#0f172a';
      if (valorActual) cargarImagenFirma(canvas, contexto, valorActual);
    };

    const posicion = evento => {
      const rect = canvas.getBoundingClientRect();
      return { x: evento.clientX - rect.left, y: evento.clientY - rect.top };
    };

    const iniciarTrazo = evento => {
      evento.preventDefault();
      dibujando = true;
      ultimo = posicion(evento);
      canvas.setPointerCapture?.(evento.pointerId);
    };

    const dibujar = evento => {
      if (!dibujando || !ultimo) return;
      evento.preventDefault();
      const actual = posicion(evento);
      contexto.beginPath();
      contexto.moveTo(ultimo.x, ultimo.y);
      contexto.lineTo(actual.x, actual.y);
      contexto.stroke();
      ultimo = actual;
    };

    const terminarTrazo = evento => {
      if (!dibujando) return;
      dibujando = false;
      ultimo = null;
      try { canvas.releasePointerCapture?.(evento.pointerId); } catch (_) {}
      input.value = canvas.toDataURL('image/png');
      cambiarEstado('Sin guardar', 'advertencia');
    };

    canvas.addEventListener('pointerdown', iniciarTrazo);
    canvas.addEventListener('pointermove', dibujar);
    canvas.addEventListener('pointerup', terminarTrazo);
    canvas.addEventListener('pointercancel', terminarTrazo);
    window.addEventListener('resize', redimensionar);

    firmasDigitales.set(tipo, { canvas, input, contexto, redimensionar });
    redimensionar();
  }

  function cargarImagenFirma(canvas, contexto, datos) {
    contexto.clearRect(0, 0, canvas.width, canvas.height);
    if (!datos) return;
    const imagen = new Image();
    imagen.onload = () => {
      const rect = canvas.getBoundingClientRect();
      contexto.clearRect(0, 0, rect.width, rect.height);
      contexto.drawImage(imagen, 0, 0, rect.width, rect.height);
    };
    imagen.src = datos;
  }

  function establecerFirmaDigital(tipo, datos = '') {
    const firma = firmasDigitales.get(tipo);
    if (!firma) return;
    firma.input.value = datos || '';
    const rect = firma.canvas.getBoundingClientRect();
    firma.contexto.clearRect(0, 0, rect.width, rect.height);
    if (datos) cargarImagenFirma(firma.canvas, firma.contexto, datos);
  }

  function inicializarFirmasDigitales() {
    prepararFirmaDigital('contratista', 'canvas-firma-contratista', 'firma-contratista-digital');
    prepararFirmaDigital('interventoria', 'canvas-firma-interventoria', 'firma-interventoria-digital');
    document.querySelectorAll('[data-limpiar-firma]').forEach(boton => {
      boton.addEventListener('click', () => {
        establecerFirmaDigital(boton.dataset.limpiarFirma, '');
        cambiarEstado('Sin guardar', 'advertencia');
      });
    });
  }

  function leerFormulario() {
    const formulario = $('#formulario-bitacora');
    const datos = {};

    if (formulario) {
      new FormData(formulario).forEach((valor, clave) => {
        datos[clave] = valor;
      });
    }

    return {
      ...datos,
      id: estado.folioActual?.id || null,
      obraId: estado.obraActiva?.id || null,
      obraCodigo: estado.obraActiva?.codigo || '',
      obraNombre:
        estado.obraActiva?.nombre ||
        datos.nombreObra ||
        '',
      consecutivo:
        Number(
          estado.folioActual?.consecutivo ||
          $('#numero-folio')?.value ||
          0
        ) || null,
      numero: $('#numero-folio')?.value || '',
      fecha:
        $('#fecha-folio')?.value ||
        hoy(),
      estadoFolio:
        $('#estado-folio')?.value ||
        'Borrador',
      anotacion: {
        contenidoHTML:
          window.BitacoraEditorProfesional?.obtenerContenidoPersistible?.().html ||
          $('#editor-contenido')?.innerHTML || '',
        contenidoTexto:
          window.BitacoraEditorProfesional?.obtenerContenidoPersistible?.().texto ||
          $('#editor-contenido')?.innerText || ''
      },
      ubicacion: {
        referencia:
          $('#direccion-registro')?.value || '',
        latitud:
          $('#latitud')?.value !== ''
            ? Number($('#latitud').value)
            : null,
        longitud:
          $('#longitud')?.value !== ''
            ? Number($('#longitud').value)
            : null,
        precision:
          $('#precision-gps')?.dataset.valor
            ? Number($('#precision-gps').dataset.valor)
            : null,
        precisionTexto:
          $('#precision-gps')?.value || '',
        fechaCaptura:
          $('#fecha-ubicacion')?.dataset.iso || '',
        fuente:
          $('#estado-ubicacion')?.dataset.fuente || 'manual'
      },
      imagenes: estado.imagenes.map(item => {
        const { datos, url, ...metadata } = item;
        return metadata;
      }),
      anexos: estado.anexos.map(item => ({
        ...item
      })),
      exportaciones: {
        ...(estado.folioActual?.exportaciones || {})
      }
    };
  }

  function ajustarAlturaCampoLargo(campo) {
    if (!(campo instanceof HTMLTextAreaElement)) return;

    campo.style.height = 'auto';
    campo.style.height = `${Math.max(campo.scrollHeight, 52)}px`;
  }

  function escribirCampo(nombre, valor) {
    const formulario = $('#formulario-bitacora');
    const campo = formulario?.elements?.namedItem(nombre);

    if (campo && valor !== undefined && valor !== null) {
      campo.value = valor;
      ajustarAlturaCampoLargo(campo);
    }
  }

  function obtenerContratistaDeObra(obra) {
    if (!obra) return null;

    // Priorizar la lista persistente recargada por IPC antes de exportar.
    // En versiones anteriores se consultaba primero un catálogo en memoria que
    // podía estar vacío o desactualizado, por lo que el PDF solo recibía el
    // nombre del contratista y dejaba los demás campos en blanco.
    const contratistas =
      (Array.isArray(estado.contratistas) && estado.contratistas.length
        ? estado.contratistas
        : null) ||
      window.BitacoraContratistas?.obtenerTodos?.() ||
      window.BitacoraEstado?.obtener?.('catalogos.contratistas') ||
      [];

    const contratistaId =
      obra.contratistaId ||
      obra.idContratista ||
      obra.contratista_id ||
      obra.contratista?.id ||
      obra.contratista?.contratistaId ||
      window.BitacoraEstado?.obtener?.('bitacoraActual.actores.contratista.id') ||
      window.BitacoraEstado?.obtener?.('sesion.contratistaActualId') ||
      null;

    if (contratistaId) {
      const relacionado = contratistas.find(
        contratista => contratista.id === contratistaId
      );

      if (relacionado) return relacionado;
    }

    const nombreRegistrado =
      obra.contratista?.nombre ||
      obra.contratista?.nombreRazonSocial ||
      obra.contratistaNombre ||
      obra.nombreContratista ||
      '';

    if (nombreRegistrado) {
      const nombreNormalizado = String(nombreRegistrado).trim().toLowerCase();
      const relacionadoPorNombre = contratistas.find(item => {
        const candidato = item.nombre || item.nombreRazonSocial || item.razonSocial || '';
        return String(candidato).trim().toLowerCase() === nombreNormalizado;
      });
      if (relacionadoPorNombre) return relacionadoPorNombre;

      // Como último respaldo se devuelve el objeto embebido en la obra, pues
      // algunas versiones antiguas guardaban allí la ficha completa.
      return {
        ...(typeof obra.contratista === 'object' ? obra.contratista : {}),
        nombre: nombreRegistrado
      };
    }

    return null;
  }

  function mostrarContratistaEnEncabezado(contratista) {
    const titulo = $('#nombre-contratista-obra');
    const selector = $('#selector-contratista-obra');
    const nombre = String(contratista?.nombre || contratista?.nombreRazonSocial || '').trim();

    if (titulo) titulo.textContent = nombre || 'CONTRATISTA NO ASIGNADO';
    if (selector) selector.value = contratista?.id || '';

    escribirCampo('empresaNit', contratista?.nit || contratista?.nitDocumento || contratista?.nitIdentificacion || '');
    escribirCampo('empresaDireccion', contratista?.direccion || '');
    escribirCampo('empresaTelefono', contratista?.telefono || contratista?.celular || '');
  }

  function actualizarNombreContratistaDeObra(obra) {
    mostrarContratistaEnEncabezado(obtenerContratistaDeObra(obra));
  }

  async function cargarSelectorContratistas() {
    const selector = $('#selector-contratista-obra');
    if (!selector) return;

    const respuesta = await ipc()?.listarContratistas?.();
    estado.contratistas = respuesta?.ok && Array.isArray(respuesta.contratistas)
      ? respuesta.contratistas
      : [];

    selector.innerHTML = '<option value="">Seleccione un contratista...</option>';

    estado.contratistas.forEach(contratista => {
      const opcion = document.createElement('option');
      opcion.value = contratista.id;
      opcion.textContent = contratista.nombre || contratista.nombreRazonSocial || 'Contratista sin nombre';
      selector.appendChild(opcion);
    });

    actualizarNombreContratistaDeObra(estado.obraActiva);
  }

  async function cambiarContratistaDeObra(contratistaId) {
    if (!estado.obraActiva?.id) {
      alerta('Primero debe seleccionar una obra.', 'advertencia');
      actualizarNombreContratistaDeObra(estado.obraActiva);
      return;
    }

    const contratista = estado.contratistas.find(item => item.id === contratistaId) || null;
    const obraActualizada = {
      ...estado.obraActiva,
      contratistaId: contratista?.id || null,
      contratistaNombre: contratista?.nombre || contratista?.nombreRazonSocial || ''
    };

    const respuesta = await ipc()?.guardarObra?.(obraActualizada);
    if (!respuesta?.ok) {
      alerta(respuesta?.mensaje || 'No fue posible asociar el contratista a la obra.', 'error');
      actualizarNombreContratistaDeObra(estado.obraActiva);
      return;
    }

    estado.obraActiva = respuesta.obra || obraActualizada;
    const indice = estado.obras.findIndex(item => item.id === estado.obraActiva.id);
    if (indice >= 0) estado.obras[indice] = estado.obraActiva;

    await ipc()?.seleccionarObra?.(estado.obraActiva);
    mostrarContratistaEnEncabezado(contratista);
    alerta(contratista ? `Contratista asignado: ${contratista.nombre || contratista.nombreRazonSocial}` : 'Contratista retirado de la obra.', 'exito');
  }

  function formatearValorContrato(valor) {
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero <= 0) return 'NO REGISTRADO';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(numero);
  }

  function cargarObraEnFormulario(obra) {
    if (!obra) return;

    actualizarNombreContratistaDeObra(obra);

    escribirCampo('nombreObra', obra.nombre || '');
    escribirCampo('numeroContrato', obra.numeroContrato || '');
    escribirCampo(
      'fechaInicio',
      obra.contrato?.fechaInicio || obra.fechaInicio || ''
    );
    escribirCampo(
      'fechaFinal',
      obra.contrato?.fechaTerminacion || obra.fechaTerminacion || obra.fechaFinal || ''
    );
    escribirCampo(
      'direccion',
      obra.ubicacion?.direccion || obra.direccion || ''
    );
    escribirCampo(
      'ciudad',
      obra.ubicacion?.municipio || obra.municipio || ''
    );
    escribirCampo(
      'departamento',
      obra.ubicacion?.departamento || obra.departamento || ''
    );
    escribirCampo(
      'telefono',
      obra.telefono || obra.contacto?.telefono || 'NO REGISTRADO'
    );
    escribirCampo(
      'valorContrato',
      formatearValorContrato(
        obra.valorContrato ||
        obra.contrato?.valorFinal ||
        obra.contrato?.valorInicial ||
        0
      )
    );
    escribirCampo(
      'estado',
      convertirEstadoObra(obra.estado)
    );

    requestAnimationFrame(ajustarTextoDatosObra);

    if ($('#latitud') && obra.ubicacion?.latitud != null) {
      $('#latitud').value = obra.ubicacion.latitud;
    }

    if ($('#longitud') && obra.ubicacion?.longitud != null) {
      $('#longitud').value = obra.ubicacion.longitud;
    }
  }

  function ajustarTextoDatosObra() {
    const campos = document.querySelectorAll(
      '#obra-ciudad, #obra-departamento, #numero-contrato, #obra-telefono, #obra-valor'
    );

    campos.forEach((campo) => {
      campo.style.fontSize = '';
      let tamano = 16;
      const minimo = 11;
      campo.style.fontSize = `${tamano}px`;

      while (tamano > minimo && campo.scrollWidth > campo.clientWidth + 2) {
        tamano -= 0.5;
        campo.style.fontSize = `${tamano}px`;
      }

      if (campo.tagName === 'TEXTAREA') {
        campo.style.height = 'auto';
        campo.style.height = `${Math.max(52, campo.scrollHeight)}px`;
      }
    });
  }

  function convertirEstadoObra(estadoObra) {
    const mapa = {
      'Planeación': 'INICIO',
      'En ejecución': 'EN EJECUCIÓN',
      'Suspendida': 'SUSPENDIDA',
      'Terminada': 'TERMINADA',
      'Liquidada': 'TERMINADA',
      'Archivada': 'TERMINADA'
    };

    return mapa[estadoObra] || 'INICIO';
  }

  function cargarFolioEnFormulario(folio) {
    if (!folio) return;

    estado.folioActual = folio;

    $('#numero-folio').value =
      folio.numero ||
      String(folio.consecutivo || 1).padStart(5, '0');

    $('#fecha-folio').value =
      folio.fecha ||
      hoy();

    $('#estado-folio').value =
      folio.estadoFolio ||
      'Borrador';

    Object.entries(folio).forEach(([clave, valor]) => {
      if (
        valor === null ||
        typeof valor === 'object' ||
        ['id', 'obraId', 'consecutivo', 'numero'].includes(clave)
      ) {
        return;
      }

      escribirCampo(clave, valor);
    });

    if ($('#editor-contenido')) {
      $('#editor-contenido').innerHTML =
        folio.anotacion?.contenidoHTML ||
        folio.contenidoHTML ||
        '';
    }

    if ($('#nota')) {
      $('#nota').value =
        folio.nota ||
        folio.observaciones ||
        '';
    }

    establecerFirmaDigital('contratista', folio.firmaContratista || folio.firmas?.contratista || '');
    establecerFirmaDigital('interventoria', folio.firmaInterventoria || folio.firmas?.interventoria || folio.firmaInterventor || '');

    if ($('#latitud')) {
      $('#latitud').value =
        folio.ubicacion?.latitud ?? '';
    }

    if ($('#longitud')) {
      $('#longitud').value =
        folio.ubicacion?.longitud ?? '';
    }

    if ($('#direccion-registro')) {
      $('#direccion-registro').value =
        folio.ubicacion?.referencia || '';
    }

    if ($('#precision-gps')) {
      $('#precision-gps').value =
        folio.ubicacion?.precisionTexto ||
        (
          folio.ubicacion?.precision != null
            ? `± ${Math.round(folio.ubicacion.precision)} m`
            : ''
        );

      $('#precision-gps').dataset.valor =
        folio.ubicacion?.precision ?? '';
    }

    if ($('#fecha-ubicacion')) {
      const fechaISO =
        folio.ubicacion?.fechaCaptura || '';

      $('#fecha-ubicacion').dataset.iso =
        fechaISO;

      $('#fecha-ubicacion').value =
        fechaISO
          ? new Date(fechaISO).toLocaleString('es-CO')
          : '';
    }

    if ($('#estado-ubicacion')) {
      $('#estado-ubicacion').dataset.fuente =
        folio.ubicacion?.fuente || 'manual';
    }

    estado.imagenes =
      Array.isArray(folio.imagenes)
        ? folio.imagenes.map(item => ({ ...item }))
        : [];

    estado.anexos =
      Array.isArray(folio.anexos)
        ? folio.anexos.map(item => ({ ...item }))
        : [];

    cargarDatosImagenesPersistidas();
    renderizarImagenes();
    renderizarAnexos();
    actualizarVistaUbicacion();
    actualizarContador();
    cambiarEstado('Folio abierto', 'exito');
  }


  async function cargarSelectorObras() {
    const selector = $('#selector-obra-activa');

    if (!selector) return;

    const respuesta = await ipc()?.listarObras?.();

    estado.obras =
      respuesta?.ok && Array.isArray(respuesta.obras)
        ? respuesta.obras
        : [];

    selector.innerHTML =
      '<option value="">Seleccione una obra...</option>';

    estado.obras.forEach(obra => {
      const opcion = document.createElement('option');
      opcion.value = obra.id;
      opcion.textContent =
        `${obra.codigo || 'SIN CÓDIGO'} — ${obra.nombre || 'Obra sin nombre'}`;

      selector.appendChild(opcion);
    });

    if (estado.obraActiva?.id) {
      const obraActualizada = estado.obras.find(
        item => item.id === estado.obraActiva.id
      );

      if (obraActualizada) {
        estado.obraActiva = obraActualizada;
        selector.value = obraActualizada.id;
        cargarObraEnFormulario(obraActualizada);
        await ipc()?.seleccionarObra?.(obraActualizada);
      }
      else {
        selector.value = '';
      }
    }
  }

  async function cambiarObraActiva(obraId) {
    if (
      estado.folioActual &&
      !(await confirmarGuardadoAntesDeCambiar())
    ) {
      const selector = $('#selector-obra-activa');

      if (selector && estado.obraActiva?.id) {
        selector.value = estado.obraActiva.id;
      }

      return;
    }

    const obra =
      estado.obras.find(item => item.id === obraId);

    if (!obra) {
      estado.obraActiva = null;
      alerta(
        'Seleccione una obra válida.',
        'advertencia'
      );
      return;
    }

    const respuesta =
      await ipc()?.seleccionarObra?.(obra);

    if (!respuesta?.ok) {
      alerta(
        respuesta?.mensaje ||
        'No fue posible seleccionar la obra.',
        'error'
      );
      return;
    }

    estado.obraActiva = obra;
    cargarObraEnFormulario(obra);

    await recargarFolios();
    await restaurarFolioActivo();

    alerta(
      `Obra activa: ${obra.nombre}`,
      'exito'
    );
  }

  async function cargarObraActiva() {
    const respuesta = await ipc()?.obtenerObraActiva?.();

    estado.obraActiva =
      respuesta?.ok
        ? respuesta.obra
        : null;

    if (estado.obraActiva) {
      cargarObraEnFormulario(estado.obraActiva);
      const selector = $('#selector-obra-activa');
      if (selector) selector.value = estado.obraActiva.id;
      return true;
    }

    alerta(
      'Antes de registrar folios debe crear o seleccionar una obra.',
      'advertencia'
    );

    return false;
  }

  async function recargarFolios() {
    if (!estado.obraActiva?.id) {
      estado.folios = [];
      return [];
    }

    const respuesta = await ipc()?.listarFolios?.({
      obraId: estado.obraActiva.id
    });

    estado.folios =
      respuesta?.ok && Array.isArray(respuesta.folios)
        ? respuesta.folios
        : [];

    return estado.folios;
  }


  async function confirmarGuardadoAntesDeCambiar() {
    const estadoVisual =
      $('#estado-guardado')?.textContent || '';

    const editorVisual =
      $('#estado-editor')?.textContent || '';

    const hayCambios =
      estadoVisual.includes('Sin guardar') ||
      editorVisual.includes('pendientes');

    if (!hayCambios) return true;

    const confirmar = window.confirm(
      'Hay cambios sin guardar en el folio actual. ¿Desea guardarlos antes de continuar?'
    );

    if (!confirmar) {
      return window.confirm(
        '¿Desea continuar y descartar los cambios no guardados?'
      );
    }

    return await guardarFolio();
  }

  async function limpiarParaNuevaObra() {
    const confirmar = window.confirm(
      `Esta acción limpiará la pantalla, retirará la obra y el folio activos, y borrará los datos del responsable guardados en Configuración.

Las obras, contratistas y folios ya archivados no serán eliminados. ¿Desea continuar?`
    );

    if (!confirmar) return false;

    try {
      await ipc()?.seleccionarFolio?.({});
      await ipc()?.seleccionarObra?.({});

      const respuestaConfiguracion = await ipc()?.obtenerConfiguracion?.();
      const configuracion = respuestaConfiguracion?.ok
        ? { ...(respuestaConfiguracion.configuracion || {}) }
        : {};

      [
        'usuarioNombre',
        'usuarioCargo',
        'usuarioEntidad',
        'usuarioCorreo',
        'empresaNombre',
        'empresaNit',
        'empresaDireccion',
        'empresaTelefono'
      ].forEach(clave => {
        configuracion[clave] = '';
      });

      await ipc()?.guardarConfiguracion?.(configuracion);

      estado.obraActiva = null;
      estado.folioActual = null;
      estado.folios = [];
      estado.imagenes = [];
      estado.anexos = [];

      const selectorObra = $('#selector-obra-activa');
      if (selectorObra) selectorObra.value = '';

      const selectorContratista = $('#selector-contratista-obra');
      if (selectorContratista) selectorContratista.value = '';

      const formulario = $('#formulario-bitacora');
      if (formulario) {
        Array.from(formulario.elements).forEach(campo => {
          if (!campo || !('value' in campo)) return;

          if (campo.type === 'checkbox' || campo.type === 'radio') {
            campo.checked = false;
          }
          else if (campo.tagName === 'SELECT') {
            campo.selectedIndex = 0;
          }
          else {
            campo.value = '';
          }
        });
      }

      const tituloContratista = $('#nombre-contratista-obra');
      if (tituloContratista) {
        tituloContratista.textContent = 'CONTRATISTA NO ASIGNADO';
      }

      if ($('#numero-folio')) $('#numero-folio').value = '00001';
      if ($('#fecha-folio')) $('#fecha-folio').value = hoy();
      if ($('#estado-folio')) $('#estado-folio').value = 'Borrador';
      if ($('#editor-contenido')) $('#editor-contenido').innerHTML = '';
      if ($('#nota')) $('#nota').value = '';

      establecerFirmaDigital('contratista', '');
      establecerFirmaDigital('interventoria', '');
      renderizarImagenes();
      renderizarAnexos();
      actualizarVistaUbicacion();
      actualizarContador();

      try {
        localStorage.removeItem('bitacora.estado');
        localStorage.removeItem('bitacora.configuracion');
        localStorage.removeItem('bitacora_registro_actual');
        localStorage.removeItem('bitacora_ultimo_folio');
        localStorage.removeItem('bitacora_configuracion');

        // Eliminar todos los borradores automáticos del editor para que
        // no se ofrezca restaurar información de una obra anterior.
        Object.keys(localStorage)
          .filter(clave => clave.startsWith('bitacora-editor-borrador:'))
          .forEach(clave => localStorage.removeItem(clave));
      }
      catch (error) {
        console.warn('No fue posible limpiar parte del almacenamiento local:', error);
      }

      cambiarEstado('Pantalla limpia', 'exito');
      alerta(
        'La aplicación quedó limpia para registrar una nueva obra desde cero.',
        'exito'
      );

      return true;
    }
    catch (error) {
      console.error('No fue posible limpiar la aplicación:', error);
      alerta(
        `No fue posible completar la limpieza: ${error.message}`,
        'error'
      );
      return false;
    }
  }

  async function prepararNuevoFolio(mostrarMensaje = true) {
    if (
      estado.folioActual &&
      !(await confirmarGuardadoAntesDeCambiar())
    ) {
      return null;
    }

    if (!estado.obraActiva?.id) {
      alerta(
        'Seleccione una obra antes de crear un folio.',
        'advertencia'
      );
      return null;
    }

    const respuesta =
      await ipc()?.obtenerNuevoConsecutivo?.(
        estado.obraActiva.id
      );

    const consecutivo =
      Number(respuesta?.consecutivo) ||
      1;

    estado.folioActual = {
      id: null,
      obraId: estado.obraActiva.id,
      consecutivo,
      numero:
        respuesta?.numero ||
        String(consecutivo).padStart(5, '0'),
      fecha: hoy(),
      estadoFolio: 'Borrador'
    };

    const formulario = $('#formulario-bitacora');

    if (formulario) formulario.reset();

    limpiarVistaArchivos();
    cargarObraEnFormulario(estado.obraActiva);

    $('#numero-folio').value = estado.folioActual.numero;
    $('#fecha-folio').value = hoy();
    $('#estado-folio').value = 'Borrador';
    $('#editor-contenido').innerHTML = '';
    $('#nota').value = '';
    establecerFirmaDigital('contratista', '');
    establecerFirmaDigital('interventoria', '');

    actualizarContador();
    cambiarEstado('Nuevo folio', 'normal');

    if (mostrarMensaje) {
      alerta(
        `Folio ${estado.folioActual.numero} preparado.`,
        'exito'
      );
    }

    return estado.folioActual;
  }

  async function guardarFolio() {
    if (estado.guardando) return false;

    if (!estado.obraActiva?.id) {
      alerta(
        'Debe seleccionar una obra antes de guardar.',
        'advertencia'
      );
      return false;
    }

    estado.guardando = true;
    cambiarEstado('Guardando...', 'proceso');

    try {
      const datos = leerFormulario();

      if (!datos.nombreObra) {
        throw new Error(
          'La obra activa no contiene un nombre válido.'
        );
      }

      if (!datos.fecha) {
        throw new Error(
          'La fecha del folio es obligatoria.'
        );
      }

      const respuesta =
        await ipc()?.guardarFolio?.(datos);

      if (!respuesta?.ok) {
        throw new Error(
          respuesta?.mensaje ||
          'No fue posible guardar el folio.'
        );
      }

      estado.folioActual = respuesta.folio;

      $('#numero-folio').value =
        respuesta.folio.numero;

      await recargarFolios();

      cambiarEstado('Guardado', 'exito');
      alerta(
        `Folio ${respuesta.folio.numero} guardado correctamente.`,
        'exito'
      );

      document.dispatchEvent(
        new CustomEvent(
          'bitacora:guardada',
          {
            detail: respuesta.folio
          }
        )
      );

      return true;
    }
    catch (error) {
      console.error(error);
      cambiarEstado('Error al guardar', 'error');
      alerta(
        error.message ||
        'No fue posible guardar el folio.',
        'error'
      );
      return false;
    }
    finally {
      estado.guardando = false;
    }
  }

  async function abrirHistorial() {
    window.location.href = './historial.html';
  }

  async function navegarFolio(direccion) {
    if (!(await confirmarGuardadoAntesDeCambiar())) {
      return;
    }

    await recargarFolios();

    if (!estado.folios.length) {
      alerta('No hay folios guardados para esta obra.', 'informacion');
      return;
    }

    const indice = estado.folios.findIndex(item =>
      item.id === estado.folioActual?.id
    );

    let nuevoIndice;

    if (indice < 0) {
      nuevoIndice =
        direccion === 'anterior'
          ? estado.folios.length - 1
          : 0;
    }
    else {
      nuevoIndice =
        direccion === 'anterior'
          ? indice - 1
          : indice + 1;
    }

    if (
      nuevoIndice < 0 ||
      nuevoIndice >= estado.folios.length
    ) {
      alerta(
        `No hay un folio ${direccion} disponible.`,
        'informacion'
      );
      return;
    }

    const folio = estado.folios[nuevoIndice];

    await ipc()?.seleccionarFolio?.(folio);
    cargarFolioEnFormulario(folio);
  }

  async function restaurarFolioActivo() {
    const respuesta =
      await ipc()?.obtenerFolioActivo?.();

    const folio = respuesta?.ok
      ? respuesta.folio
      : null;

    if (
      folio &&
      folio.obraId === estado.obraActiva?.id
    ) {
      cargarFolioEnFormulario(folio);
      return folio;
    }

    await recargarFolios();

    if (estado.folios.length) {
      const ultimo = estado.folios.at(-1);
      await ipc()?.seleccionarFolio?.(ultimo);
      cargarFolioEnFormulario(ultimo);
      return ultimo;
    }

    return prepararNuevoFolio(false);
  }

  function generarIdLocal(prefijo) {
    return `${prefijo}-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;
  }

  function formatearBytes(bytes = 0) {
    const valor = Number(bytes) || 0;

    if (valor < 1024) {
      return `${valor} B`;
    }

    if (valor < 1024 * 1024) {
      return `${(valor / 1024).toFixed(1)} KB`;
    }

    return `${(valor / 1024 / 1024).toFixed(1)} MB`;
  }

  function archivoADataURL(file) {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();

      lector.onload = () => resolve(
        String(lector.result || '')
      );

      lector.onerror = () => reject(
        new Error(
          `No fue posible leer el archivo ${file.name}.`
        )
      );

      lector.readAsDataURL(file);
    });
  }

  function actualizarResumenEvidencias() {
    const totalImagenes =
      $('#total-imagenes-folio');

    const totalAnexos =
      $('#total-anexos-folio');

    if (totalImagenes) {
      totalImagenes.textContent =
        estado.imagenes.length;
    }

    if (totalAnexos) {
      totalAnexos.textContent =
        estado.anexos.length;
    }

    if ($('#sin-imagenes')) {
      $('#sin-imagenes').hidden =
        estado.imagenes.length > 0;
    }

    if ($('#sin-anexos')) {
      $('#sin-anexos').hidden =
        estado.anexos.length > 0;
    }
  }

  function renderizarImagenes() {
    const galeria =
      $('#galeria-imagenes');

    if (!galeria) return;

    galeria.innerHTML = '';

    estado.imagenes.forEach(item => {
      const tarjeta =
        document.createElement('article');

      tarjeta.className =
        'tarjeta-evidencia-fotografica';

      const imagen =
        document.createElement('img');

      imagen.src =
        item.datos ||
        item.url ||
        '';

      imagen.alt =
        item.nombre ||
        'Fotografía del folio';

      const cuerpo =
        document.createElement('div');

      cuerpo.className =
        'tarjeta-evidencia__cuerpo';

      const nombre =
        document.createElement('strong');

      nombre.textContent =
        `Foto ${estado.imagenes.indexOf(item) + 1}: ${item.nombre || 'Fotografía'}`;

      const detalle =
        document.createElement('small');

      detalle.textContent =
        `${formatearBytes(item.tamano)} · ` +
        `${item.tipo || 'imagen'}`;

      const descripcion =
        document.createElement('textarea');

      descripcion.placeholder =
        'Descripción de la fotografía';

      descripcion.value =
        item.descripcion || '';

      descripcion.rows = 2;

      descripcion.addEventListener(
        'input',
        evento => {
          item.descripcion =
            evento.target.value;

          cambiarEstado(
            'Sin guardar',
            'advertencia'
          );
        }
      );

      const acciones =
        document.createElement('div');

      acciones.className =
        'tarjeta-evidencia__acciones';

      const abrir =
        document.createElement('button');

      abrir.type = 'button';
      abrir.className = 'boton';
      abrir.textContent = 'Ver';
      abrir.dataset.verImagen = item.id;

      const eliminar =
        document.createElement('button');

      eliminar.type = 'button';
      eliminar.className =
        'boton boton-peligro-suave';

      eliminar.textContent = 'Eliminar';
      eliminar.dataset.eliminarImagen = item.id;

      acciones.append(abrir, eliminar);
      cuerpo.append(
        nombre,
        detalle,
        descripcion,
        acciones
      );

      tarjeta.append(imagen, cuerpo);
      galeria.appendChild(tarjeta);
    });

    actualizarResumenEvidencias();
  }

  function renderizarAnexos() {
    const lista =
      $('#lista-anexos');

    if (!lista) return;

    lista.innerHTML = '';

    estado.anexos.forEach(item => {
      const fila =
        document.createElement('article');

      fila.className = 'fila-anexo';

      const icono =
        document.createElement('div');

      icono.className = 'fila-anexo__icono';
      icono.textContent = '📎';

      const informacion =
        document.createElement('div');

      informacion.className =
        'fila-anexo__informacion';

      const nombre =
        document.createElement('strong');

      nombre.textContent =
        item.nombre ||
        'Documento anexo';

      const detalle =
        document.createElement('small');

      detalle.textContent =
        `${formatearBytes(item.tamano)} · ` +
        `${item.tipo || 'archivo'}`;

      const descripcion =
        document.createElement('input');

      descripcion.type = 'text';
      descripcion.placeholder =
        'Descripción del anexo';

      descripcion.value =
        item.descripcion || '';

      descripcion.addEventListener(
        'input',
        evento => {
          item.descripcion =
            evento.target.value;

          cambiarEstado(
            'Sin guardar',
            'advertencia'
          );
        }
      );

      informacion.append(
        nombre,
        detalle,
        descripcion
      );

      const acciones =
        document.createElement('div');

      acciones.className =
        'fila-anexo__acciones';

      const abrir =
        document.createElement('button');

      abrir.type = 'button';
      abrir.className = 'boton';
      abrir.textContent = 'Abrir';
      abrir.dataset.abrirAnexo = item.id;

      const eliminar =
        document.createElement('button');

      eliminar.type = 'button';
      eliminar.className =
        'boton boton-peligro-suave';

      eliminar.textContent = 'Eliminar';
      eliminar.dataset.eliminarAnexo = item.id;

      acciones.append(abrir, eliminar);

      fila.append(
        icono,
        informacion,
        acciones
      );

      lista.appendChild(fila);
    });

    actualizarResumenEvidencias();
  }

  async function cargarDatosImagenesPersistidas() {
    const pendientes = estado.imagenes.filter(
      item => !item.datos && item.ruta
    );

    if (!pendientes.length) return;

    for (const item of pendientes) {
      const respuesta = await ipc()?.leerImagenEvidencia?.(item);

      if (respuesta?.ok) {
        item.datos = respuesta.datos;
        item.tipo = respuesta.tipo || item.tipo;
        item.tamano = respuesta.tamano || item.tamano;
      }
      else {
        item.noDisponible = true;
      }
    }

    renderizarImagenes();
  }


  function anexoEsImagen(anexo = {}) {
    const tipo = String(anexo.tipo || '').toLowerCase();
    const nombre = String(anexo.nombre || anexo.ruta || '').toLowerCase();
    return tipo.startsWith('image/') || /\.(?:jpe?g|png|webp|gif|bmp)$/i.test(nombre);
  }

  async function cargarDatosAnexosImagenPersistidos() {
    const pendientes = estado.anexos.filter(
      item => anexoEsImagen(item) && !item.datos && item.ruta
    );

    for (const item of pendientes) {
      try {
        // El mismo lector binario de evidencias sirve para anexos de imagen.
        const respuesta = await ipc()?.leerImagenEvidencia?.(item);
        if (respuesta?.ok) {
          item.datos = respuesta.datos || '';
          item.tipo = respuesta.tipo || item.tipo;
          item.tamano = respuesta.tamano || item.tamano;
        }
      }
      catch (error) {
        console.warn('No fue posible cargar la vista del anexo de imagen.', error);
      }
    }
  }

  async function cargarAnexosDeFolio(folio = {}) {
    const anexos = Array.isArray(folio.anexos)
      ? folio.anexos.map(item => ({ ...item }))
      : [];

    for (const item of anexos) {
      if (!anexoEsImagen(item) || item.datos || !item.ruta) continue;
      try {
        const respuesta = await ipc()?.leerImagenEvidencia?.(item);
        if (respuesta?.ok) {
          item.datos = respuesta.datos || '';
          item.tipo = respuesta.tipo || item.tipo;
          item.tamano = respuesta.tamano || item.tamano;
        }
      }
      catch (error) {
        console.warn('No fue posible cargar un anexo de imagen del folio consolidado.', error);
      }
    }

    return anexos;
  }

  async function seleccionarFotografiasNativas() {
    if (!estado.obraActiva?.id) {
      alerta('Debe seleccionar una obra antes de agregar fotografías.', 'advertencia');
      return;
    }

    /* En navegador no existe el selector nativo de Electron.
       En ese caso se utiliza el input HTML para que el botón nunca quede inactivo. */
    const apiIPC = ipc();
    if (typeof apiIPC?.seleccionarImagenesEvidencia !== 'function') {
      $('#input-imagen')?.click();
      return;
    }

    try {
      cambiarEstado('Seleccionando fotografías...', 'proceso');

      const respuesta = await apiIPC.seleccionarImagenesEvidencia({
        titulo: 'Seleccionar fotografías del folio',
        obraId: estado.obraActiva.id,
        folioId: estado.folioActual?.id || '',
        folioNumero: $('#numero-folio')?.value || 'folio-nuevo'
      });

      if (!respuesta || respuesta.cancelado) {
        cambiarEstado('Sin cambios', 'normal');
        return;
      }

      if (!respuesta.ok) {
        throw new Error(respuesta.mensaje || 'No fue posible seleccionar las fotografías.');
      }

      const inicio = estado.imagenes.length;

      respuesta.archivos.forEach((item, indice) => {
        estado.imagenes.push({
          ...item,
          numero: inicio + indice + 1,
          descripcion: item.descripcion || ''
        });
      });

      renderizarImagenes();
      cambiarEstado('Sin guardar', 'advertencia');
      alerta(`${respuesta.archivos.length} fotografía(s) agregada(s) y almacenada(s).`, 'exito');
    }
    catch (error) {
      console.error(error);
      cambiarEstado('Error en fotografías', 'error');
      alerta(error.message || 'No fue posible agregar fotografías.', 'error');
    }
  }

  async function agregarImagenes(archivos) {
    const lista =
      Array.from(archivos || []);

    if (!lista.length) return;

    cambiarEstado(
      'Procesando fotografías...',
      'proceso'
    );

    for (const file of lista) {
      if (!file.type.startsWith('image/')) {
        continue;
      }

      const datos =
        await archivoADataURL(file);

      estado.imagenes.push({
        id: generarIdLocal('imagen'),
        nombre: file.name,
        tipo: file.type,
        tamano: file.size,
        datos,
        descripcion: '',
        fechaAgregada:
          new Date().toISOString()
      });
    }

    renderizarImagenes();

    cambiarEstado(
      'Sin guardar',
      'advertencia'
    );

    alerta(
      `${lista.length} fotografía(s) agregada(s).`,
      'exito'
    );
  }

  async function seleccionarAnexosNativos() {
    /* En navegador se abre el selector HTML. En Electron se conserva
       el selector nativo y el almacenamiento existente. */
    const apiIPC = ipc();
    if (typeof apiIPC?.seleccionarAnexosEvidencia !== 'function') {
      $('#input-anexo')?.click();
      return;
    }

    try {
      const respuesta = await apiIPC.seleccionarAnexosEvidencia({
        titulo: 'Seleccionar anexos del folio'
      });

      if (!respuesta || respuesta.cancelado) return;

      if (!respuesta.ok) {
        throw new Error(respuesta.mensaje || 'No fue posible seleccionar los anexos.');
      }

      respuesta.archivos.forEach(item => {
        estado.anexos.push({
          ...item,
          id: item.id || generarIdLocal('anexo'),
          descripcion: item.descripcion || ''
        });
      });

      renderizarAnexos();
      cambiarEstado('Sin guardar', 'advertencia');
      alerta(`${respuesta.archivos.length} anexo(s) agregado(s).`, 'exito');
    }
    catch (error) {
      console.error(error);
      alerta(error.message || 'No fue posible agregar anexos.', 'error');
    }
  }

  async function agregarAnexos(archivos) {
    const lista =
      Array.from(archivos || []);

    if (!lista.length) return;

    cambiarEstado(
      'Procesando anexos...',
      'proceso'
    );

    for (const file of lista) {
      const datos =
        await archivoADataURL(file);

      estado.anexos.push({
        id: generarIdLocal('anexo'),
        nombre: file.name,
        tipo:
          file.type ||
          'application/octet-stream',
        tamano: file.size,
        datos,
        descripcion: '',
        fechaAgregada:
          new Date().toISOString()
      });
    }

    renderizarAnexos();

    cambiarEstado(
      'Sin guardar',
      'advertencia'
    );

    alerta(
      `${lista.length} anexo(s) agregado(s).`,
      'exito'
    );
  }

  function abrirDataURL(datos, nombre = 'archivo') {
    if (!datos) {
      alerta(
        'El archivo no contiene datos disponibles.',
        'advertencia'
      );
      return;
    }

    const enlace =
      document.createElement('a');

    enlace.href = datos;
    enlace.download = nombre;
    enlace.target = '_blank';
    enlace.rel = 'noopener';

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
  }

  async function eliminarImagen(id) {
    const item =
      estado.imagenes.find(
        elemento => elemento.id === id
      );

    if (!item) return;

    if (!window.confirm(
      `¿Eliminar la fotografía ${item.nombre}?`
    )) {
      return;
    }

    const respuesta = await ipc()?.eliminarImagenEvidencia?.(item);

    if (respuesta && !respuesta.ok) {
      alerta(respuesta.mensaje || 'No fue posible eliminar el archivo físico.', 'advertencia');
    }

    estado.imagenes =
      estado.imagenes.filter(
        elemento => elemento.id !== id
      );

    estado.imagenes.forEach((imagen, indice) => { imagen.numero = indice + 1; });
    renderizarImagenes();

    cambiarEstado(
      'Sin guardar',
      'advertencia'
    );
  }

  function eliminarAnexo(id) {
    const item =
      estado.anexos.find(
        elemento => elemento.id === id
      );

    if (!item) return;

    if (!window.confirm(
      `¿Eliminar el anexo ${item.nombre}?`
    )) {
      return;
    }

    estado.anexos =
      estado.anexos.filter(
        elemento => elemento.id !== id
      );

    renderizarAnexos();

    cambiarEstado(
      'Sin guardar',
      'advertencia'
    );
  }

  function coordenadasValidas() {
    const valorLatitud = String($('#latitud')?.value ?? '').trim();
    const valorLongitud = String($('#longitud')?.value ?? '').trim();

    if (!valorLatitud || !valorLongitud) return false;

    const latitud = Number(valorLatitud);
    const longitud = Number(valorLongitud);

    return (
      Number.isFinite(latitud) &&
      Number.isFinite(longitud) &&
      latitud >= -90 &&
      latitud <= 90 &&
      longitud >= -180 &&
      longitud <= 180
    );
  }

  function actualizarVistaUbicacion() {
    const marcador =
      $('#marcador-mapa-local');

    const mensaje =
      $('#mensaje-mapa-local');

    const coordenadas =
      $('#coordenadas-mapa-local');

    const estadoTexto =
      $('#estado-ubicacion');

    const mapaOSM =
      $('#mapa-openstreetmap');

    const cuadricula =
      $('#mapa .mapa-local__cuadricula');

    if (!coordenadasValidas()) {
      if (mapaOSM) {
        mapaOSM.hidden = true;
        mapaOSM.removeAttribute('src');
      }

      if (cuadricula) cuadricula.hidden = false;

      if (marcador) marcador.hidden = true;

      if (mensaje) {
        mensaje.hidden = false;
        mensaje.textContent =
          'Capture el GPS o diligencie coordenadas válidas.';
      }

      if (coordenadas) {
        coordenadas.textContent = '';
      }

      if (estadoTexto) {
        estadoTexto.textContent =
          'Coordenadas pendientes';
      }

      return false;
    }

    const latitud =
      Number($('#latitud').value);

    const longitud =
      Number($('#longitud').value);

    const deltaLat = 0.008;
    const deltaLon = 0.012;
    const bbox = [
      longitud - deltaLon,
      latitud - deltaLat,
      longitud + deltaLon,
      latitud + deltaLat
    ].join(',');

    if (mapaOSM) {
      const urlMapa =
        `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}` +
        `&layer=mapnik&marker=${encodeURIComponent(latitud)},${encodeURIComponent(longitud)}`;

      if (mapaOSM.dataset.url !== urlMapa) {
        mapaOSM.src = urlMapa;
        mapaOSM.dataset.url = urlMapa;
      }

      mapaOSM.hidden = false;
    }

    if (cuadricula) cuadricula.hidden = true;

    if (marcador) {
      marcador.hidden = true;

      const x =
        ((longitud + 180) / 360) * 100;

      const y =
        (1 - ((latitud + 90) / 180)) * 100;

      marcador.style.left =
        `${Math.min(92, Math.max(8, x))}%`;

      marcador.style.top =
        `${Math.min(85, Math.max(15, y))}%`;
    }

    if (mensaje) {
      mensaje.hidden = true;
    }

    if (coordenadas) {
      coordenadas.textContent =
        `${latitud.toFixed(6)}, ` +
        `${longitud.toFixed(6)}`;
    }

    if (estadoTexto) {
      estadoTexto.textContent =
        'Ubicación registrada';
    }

    return true;
  }

  function usarUbicacionObra() {
    const obra =
      estado.obraActiva;

    if (!obra) {
      alerta(
        'Primero seleccione una obra activa.',
        'advertencia'
      );

      return;
    }

    const latitud =
      obra?.ubicacion?.latitud ??
      obra?.latitud;

    const longitud =
      obra?.ubicacion?.longitud ??
      obra?.longitud;

    const referencia = [
      obra?.ubicacion?.direccion ||
        obra?.direccion,
      obra?.ubicacion?.municipio ||
        obra?.municipio,
      obra?.ubicacion?.departamento ||
        obra?.departamento
    ].filter(Boolean).join(', ');

    if ($('#direccion-registro')) {
      $('#direccion-registro').value =
        referencia ||
        `Ubicación general de ${obra.nombre || 'la obra'}`;
    }

    if (
      latitud != null &&
      longitud != null
    ) {
      $('#latitud').value = latitud;
      $('#longitud').value = longitud;

      if ($('#precision-gps')) {
        $('#precision-gps').value =
          'Ubicación registrada en la obra';

        $('#precision-gps').dataset.valor = '';
      }

      const fecha =
        new Date().toISOString();

      if ($('#fecha-ubicacion')) {
        $('#fecha-ubicacion').value =
          new Date(fecha)
            .toLocaleString('es-CO');

        $('#fecha-ubicacion').dataset.iso =
          fecha;
      }

      if ($('#estado-ubicacion')) {
        $('#estado-ubicacion').dataset.fuente =
          'obra';
      }

      actualizarVistaUbicacion();

      cambiarEstado(
        'Sin guardar',
        'advertencia'
      );

      alerta(
        'Se aplicó la ubicación registrada en la obra.',
        'exito'
      );

      return;
    }

    alerta(
      'La obra no tiene coordenadas. Ingréselas para asociarlas a este folio.',
      'advertencia'
    );

    solicitarCoordenadasManuales();
  }

  async function copiarCoordenadas() {
    if (!coordenadasValidas()) {
      alerta(
        'Primero registre coordenadas válidas.',
        'advertencia'
      );
      return;
    }

    const texto =
      `${$('#latitud').value}, ` +
      `${$('#longitud').value}`;

    try {
      await navigator.clipboard.writeText(texto);

      alerta(
        'Coordenadas copiadas.',
        'exito'
      );
    }
    catch {
      window.prompt(
        'Copie las coordenadas:',
        texto
      );
    }
  }

  function abrirMapaExterno() {
    if (!coordenadasValidas()) {
      alerta(
        'Primero registre coordenadas válidas.',
        'advertencia'
      );
      return;
    }

    const latitud =
      $('#latitud').value;

    const longitud =
      $('#longitud').value;

    window.open(
      `https://www.openstreetmap.org/?mlat=${encodeURIComponent(latitud)}&mlon=${encodeURIComponent(longitud)}#map=18/${encodeURIComponent(latitud)}/${encodeURIComponent(longitud)}`,
      '_blank',
      'noopener'
    );
  }


  async function imprimir() {
    await guardarFolio();

    if (ipc()?.disponible) {
      await ipc().imprimir({});
    }
    else {
      window.print();
    }
  }

  function normalizarContenidoParaWord(html) {
    if (!html) return '';

    const contenedor = document.createElement('div');
    contenedor.innerHTML = String(html);

    contenedor.querySelectorAll('script, style, iframe, object, embed').forEach((nodo) => nodo.remove());

    contenedor.querySelectorAll('*').forEach((nodo) => {
      nodo.removeAttribute('width');
      nodo.removeAttribute('height');
      nodo.removeAttribute('align');

      const estilo = nodo.getAttribute('style');
      if (estilo) {
        const limpio = estilo
          .split(';')
          .map((regla) => regla.trim())
          .filter(Boolean)
          .filter((regla) => !/^(width|min-width|max-width|height|min-height|max-height|font-size|margin-left|margin-right|left|right|position|transform|zoom)\s*:/i.test(regla))
          .join('; ');

        if (limpio) nodo.setAttribute('style', limpio);
        else nodo.removeAttribute('style');
      }
    });

    contenedor.querySelectorAll('table').forEach((tabla) => {
      tabla.setAttribute('width', '100%');
      tabla.style.width = '100%';
      tabla.style.tableLayout = 'fixed';
      tabla.style.borderCollapse = 'collapse';
    });

    contenedor.querySelectorAll('img').forEach((imagen) => {
      imagen.removeAttribute('width');
      imagen.removeAttribute('height');
      imagen.style.display = 'block';
      imagen.style.width = '100%';
      imagen.style.maxWidth = '16.2cm';
      imagen.style.height = 'auto';
      imagen.style.margin = '8px auto';
    });

    return contenedor.innerHTML;
  }

  async function cargarConfiguracionInforme() {
    const obra = estado.obraActiva || {};
    const respuesta = await ipc()?.obtenerConfiguracion?.({
      obraId: obra.id || '',
      obraNombre: obra.nombre || ''
    });
    const configuracion = respuesta?.ok ? (respuesta.configuracion || {}) : {};
    if (!configuracion.logoEmpresa && !configuracion.empresaLogo) {
      try {
        const logoRespuesta = await ipc()?.obtenerLogoEmpresa?.({
          obraId: obra.id || '',
          obraNombre: obra.nombre || ''
        });
        if (logoRespuesta?.ok && logoRespuesta.logo) configuracion.logoEmpresa = logoRespuesta.logo;
      }
      catch (error) {
        console.warn('No fue posible recuperar el logo para el informe.', error);
      }
    }
    window.__bitacoraConfiguracionInforme = configuracion;
    return configuracion;
  }

  function contenidoAnotacionSinImagenes(html) {
    if (!html) return '';
    const contenedor = document.createElement('div');
    contenedor.innerHTML = normalizarContenidoParaWord(html);

    // El informe tiene secciones propias para anexos y registro fotográfico.
    // Por eso se retiran del contenido editable todas las imágenes, sus rótulos
    // de control y cualquier encabezado heredado que pudiera duplicarlas.
    contenedor.querySelectorAll(
      'img, figure, picture, .imagen-editor, .editor-imagen, .editor-imagen-contenedor, .imagen-incrustada, [data-imagen-id], [data-editor-imagen], [data-tipo="imagen"]'
    ).forEach(nodo => nodo.remove());

    contenedor.querySelectorAll('h1,h2,h3,h4,h5,h6,p,div,span,strong').forEach(nodo => {
      const texto = String(nodo.textContent || '')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase();
      const esRotuloHeredado = /^(ANEXOS(?:\s+Y\s+FOTOGRAF[IÍ]AS)?|REGISTRO\s+FOTOGR[AÁ]FICO)(?:\s*\(\d+\))?$/.test(texto);
      const esNombreImagenSuelto = /^[^\n]{1,120}\.(PNG|JPE?G|WEBP|GIF|BMP|TIFF?)$/.test(texto);
      if (esRotuloHeredado || esNombreImagenSuelto) nodo.remove();
    });

    contenedor.querySelectorAll('p, div, span').forEach(nodo => {
      if (!String(nodo.textContent || '').trim() && !nodo.querySelector('table,ul,ol')) nodo.remove();
    });
    return contenedor.innerHTML;
  }

  function documentoHTML() {
    const datos = leerFormulario();
    const obra = estado.obraActiva || {};
    const contratista = obtenerContratistaDeObra(obra) || {};
    const configuracion = window.__bitacoraConfiguracionInforme || {};

    const valor = contenido => {
      const texto = String(contenido ?? '').trim();
      return texto ? escaparHTML(texto) : '—';
    };
    const fechaVisible = contenido => {
      if (!contenido) return '—';
      const partes = String(contenido).split('-');
      return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : valor(contenido);
    };
    const moneda = numero => {
      const n = Number(numero || 0);
      return n ? n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }) : '—';
    };

    const logo = configuracion.logoEmpresa || configuracion.empresaLogo || '';
    const empresa = configuracion.usuarioEntidad || configuracion.empresaNombre || obra.entidadContratante || 'BITÁCORA DE OBRA';
    const codigo = obra.codigo || datos.obraCodigo || '—';
    const contrato = obra.numeroContrato || datos.numeroContrato || '—';
    const valorContrato = obra.valorContrato || obra.contrato?.valorFinal || obra.contrato?.valorInicial || datos.valorContrato || 0;

    const filasDatos = [
      ['Código', codigo],
      ['Nombre de la obra', obra.nombre || datos.obraNombre || datos.nombreObra],
      ['Objeto', obra.objetoContrato || datos.objetoContrato],
      ['Contrato', contrato],
      ['Valor', moneda(valorContrato)],
      ['Entidad contratante', obra.entidadContratante || configuracion.entidadContratante],
      ['Fecha de inicio', fechaVisible(obra.fechaInicio || obra.contrato?.fechaInicio || datos.fechaInicio)],
      ['Fecha final', fechaVisible(obra.fechaFinal || obra.fechaTerminacion || obra.contrato?.fechaTerminacion || datos.fechaFinal)],
      ['Plazo', (() => {
        // El campo actual de la ficha de obra es texto (ej.: "12 meses").
        // Si una obra guardó únicamente el número en `plazo`, la unidad
        // contractual predeterminada es meses. Solo los campos heredados
        // `plazoDias` conservan explícitamente la unidad días.
        const plazoActual = obra.plazo ?? datos.plazo;
        if (plazoActual !== undefined && plazoActual !== null && String(plazoActual).trim()) {
          const texto = String(plazoActual).trim();
          if (!/^\d+(?:[.,]\d+)?$/.test(texto)) return texto;
          const unidad = String(obra.plazoUnidad || obra.unidadPlazo || obra.contrato?.unidadPlazo || 'meses').trim();
          return `${texto} ${unidad || 'meses'}`;
        }
        const plazoDias = obra.plazoDias ?? obra.contrato?.plazoDias;
        return plazoDias ? `${plazoDias} días` : '—';
      })()],
      ['Dirección', obra.direccion || obra.ubicacion?.direccion || datos.direccion],
      ['Ciudad / Municipio', obra.municipio || obra.ciudad || obra.ubicacion?.municipio || datos.ciudad],
      ['Departamento', obra.departamento || obra.ubicacion?.departamento || datos.departamento],
      ['Teléfono', obra.telefono || obra.contacto?.telefono || datos.telefono],
      ['Estado', obra.estado || datos.estado]
    ].map(([etiqueta, contenido]) => `<tr><td class="etiqueta">${escaparHTML(etiqueta)}</td><td>${contenido === '—' || String(contenido).startsWith('$') ? contenido : valor(contenido)}</td></tr>`).join('');

    const nombreContratista = contratista.nombre || contratista.nombreRazonSocial || obra.contratistaNombre || $('#nombre-contratista-obra')?.textContent || 'CONTRATISTA NO ASIGNADO';
    const contactoContratista = contratista.contacto || {};
    const ubicacionContratista = contratista.ubicacion || {};
    const filasContratista = [
      ['Nombre o razón social', nombreContratista],
      ['NIT / Documento',
        contratista.nit || contratista.nitDocumento || contratista.nitIdentificacion ||
        contratista.documento || contratista.identificacion || datos.empresaNit],
      ['Representante legal',
        contratista.representanteLegal || contratista.representante ||
        contratista.nombreRepresentante || contratista.representante_legal],
      ['Residente / Responsable',
        contratista.residenteResponsable || contratista.residenteObra ||
        contratista.residente || contratista.directorObra ||
        contratista.responsable || contratista.residente_obra],
      ['Dirección',
        contratista.direccion || contactoContratista.direccion ||
        ubicacionContratista.direccion || datos.empresaDireccion],
      ['Teléfono',
        contratista.telefono || contratista.celular ||
        contactoContratista.telefono || contactoContratista.celular ||
        datos.empresaTelefono],
      ['Correo',
        contratista.correo || contratista.email ||
        contactoContratista.correo || contactoContratista.email]
    ].map(([etiqueta, contenido]) => `<tr><td class="etiqueta">${escaparHTML(etiqueta)}</td><td>${valor(contenido)}</td></tr>`).join('');

    const hashTexto = texto => {
      const valor = String(texto || '');
      let hash = 2166136261;
      for (let i = 0; i < valor.length; i += Math.max(1, Math.floor(valor.length / 4000))) {
        hash ^= valor.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
      }
      return (hash >>> 0).toString(36);
    };
    const claveImagen = item => {
      // Priorizar el contenido permite detectar la misma fotografía aunque
      // tenga identificadores o rutas diferentes.
      if (item?.datos) return `datos:${hashTexto(item.datos)}:${String(item.datos).length}`;
      if (item?.ruta) return `ruta:${String(item.ruta).toLowerCase()}`;
      return `archivo:${String(item?.nombre || '').toLowerCase()}:${Number(item?.tamano || 0)}`;
    };
    const vistas = [];
    const usadas = new Set();
    estado.imagenes.forEach(item => {
      const clave = claveImagen(item);
      if (!clave || usadas.has(clave)) return;
      usadas.add(clave);
      vistas.push(item);
    });

    const fotografias = vistas.map((item, indice) => `
      <td class="foto-celda">
        <div class="foto-marco">${item.datos ? `<img src="${item.datos}" alt="Fotografía ${indice + 1}" width="300">` : '<span>Imagen no disponible</span>'}</div>
        <div class="foto-pie"><strong>Fotografía ${indice + 1}.</strong> ${valor(item.descripcion || item.nombre || 'Registro fotográfico')}</div>
      </td>`).reduce((filas, celda, indice) => {
        if (indice % 2 === 0) filas.push([celda]); else filas[filas.length - 1].push(celda);
        return filas;
      }, []).map(fila => `<tr>${fila.join('')}${fila.length === 1 ? '<td class="foto-celda foto-vacia"></td>' : ''}</tr>`).join('');

    const anexos = estado.anexos.map((item, indice) => {
      const vista = anexoEsImagen(item) && String(item.datos || '').startsWith('data:image/')
        ? `<div class="anexo-vista"><img src="${item.datos}" alt="Anexo ${indice + 1}"><div class="anexo-pie">${valor(item.descripcion || item.nombre || 'Anexo')}</div></div>`
        : '';
      return `<tr><td>${indice + 1}</td><td>${valor(item.nombre || 'Documento anexo')}</td><td>${valor(item.descripcion || 'Sin descripción')}${vista}</td><td>${valor(item.tipo || '')}</td></tr>`;
    }).join('');
    const anotacionLimpia = contenidoAnotacionSinImagenes(datos.anotacion.contenidoHTML)
      .replace(/ANEXOS\s+Y\s+FOTOGRAF[IÍ]AS/gi, 'ANEXOS');

    const htmlInforme = `<!doctype html>
<html lang="es" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><title>Bitácora ${escaparHTML(datos.numero)}</title>
<style>
@page WordSection1 { size:21cm 29.7cm; margin:1.35cm 1.35cm 1.45cm; }
div.WordSection1 { page:WordSection1; }
*{box-sizing:border-box} body{font-family:Arial,Helvetica,sans-serif;font-size:9.5pt;line-height:1.22;color:#1f2937;margin:0;width:18.3cm} img{mso-width-percent:100;display:inline-block}
table{border-collapse:collapse;width:100%!important;table-layout:fixed;page-break-inside:auto} tr{page-break-inside:avoid;page-break-after:auto} td,th{border:1px solid #7f8c99;padding:5px;vertical-align:top;word-wrap:break-word;overflow-wrap:anywhere} th{background:#dcebf5;color:#123c6b}.etiqueta{width:28%;font-weight:bold;background:#f3f6f8}
.rotulo{margin-bottom:9px;page-break-inside:avoid}.rotulo td{padding:4px}.logo{width:20%;text-align:center;vertical-align:middle}.logo img{width:2.8cm!important;max-width:2.8cm!important;max-height:2.2cm!important;height:auto!important;mso-width-source:userset;mso-height-source:userset}.titulo{font-size:15pt;font-weight:bold;text-align:center;color:#0b4f7c}.empresa{text-align:center;font-size:9pt;font-weight:bold}.meta{width:25%;font-size:8.5pt}
h2{color:#0b4f7c;font-size:11.5pt;margin:12px 0 6px;padding:4px 6px;border:1px solid #9fb7c8;background:#eaf3f8;page-break-after:avoid}.bloque{page-break-inside:avoid}.anotacion{border:1px solid #9ca3af;padding:8px}.anotacion img{display:none!important}.anotacion table{font-size:8.5pt}.anotacion p,.anotacion div{margin:3px 0}
.galeria{table-layout:fixed}.foto-celda{width:50%;padding:7px;page-break-inside:avoid}.foto-marco{height:5.2cm;border:1.2px solid #64748b;padding:4px;text-align:center;background:#fff;overflow:hidden}.foto-marco img{display:block;width:7.8cm!important;max-width:7.8cm!important;max-height:4.8cm!important;height:auto!important;margin:0 auto;mso-width-source:userset;mso-height-source:userset}.foto-pie{font-size:8.3pt;margin-top:4px;min-height:.7cm}.foto-vacia{border:none}
.anexo-vista{margin-top:6px;padding:5px;border:1px solid #94a3b8;text-align:center;page-break-inside:avoid;background:#fff}.anexo-vista img{display:block;max-width:13.5cm!important;max-height:9cm!important;width:auto!important;height:auto!important;margin:0 auto}.anexo-pie{font-size:8pt;margin-top:4px;text-align:left}
.firmas-bloque{page-break-inside:avoid;margin-top:14px}.firmas{table-layout:fixed}.firmas td{width:50%;border:none;text-align:center;padding:8px 14px;vertical-align:bottom}.firma-img{height:2.4cm}.firma-img img{width:4.8cm!important;max-width:4.8cm!important;max-height:2.3cm!important;height:auto!important;mso-width-source:userset;mso-height-source:userset}.firma-linea{border-top:1px solid #111;margin:3px 0}.cargo{font-weight:bold;font-size:9pt}.nombre{font-size:8.5pt}.sin-datos{color:#64748b;font-style:italic}.pie{margin-top:10px;border-top:1px solid #9ca3af;padding-top:4px;text-align:center;font-size:7.5pt;color:#64748b}
</style></head>
<body><div class="WordSection1">
<table class="rotulo"><tr>
<td class="logo" rowspan="2">${logo ? `<img src="${logo}" alt="Logo de la empresa" width="105">` : '<strong>LOGO</strong>'}</td>
<td><div class="empresa">${valor(empresa)}</div><div class="titulo">BITÁCORA DE OBRA</div></td>
<td class="meta" rowspan="2"><strong>Código:</strong> ${valor(codigo)}<br><strong>Folio:</strong> ${valor(datos.numero)}<br><strong>Fecha:</strong> ${fechaVisible(datos.fecha)}<br><strong>Estado:</strong> ${valor(datos.estadoFolio)}</td>
</tr><tr><td style="text-align:center;font-weight:bold">${valor(obra.nombre || datos.obraNombre)}</td></tr></table>

<div class="bloque"><h2>DATOS DE LA OBRA</h2><table>${filasDatos}</table></div>
<div class="bloque"><h2>CONTRATISTA</h2><table>${filasContratista}</table></div>
<div class="bloque"><h2>ANOTACIÓN DEL FOLIO</h2><div class="anotacion">${anotacionLimpia || '<p class="sin-datos">Sin anotación.</p>'}</div></div>
${datos.nota ? `<div class="bloque"><h2>OBSERVACIONES</h2><div class="anotacion">${valor(datos.nota)}</div></div>` : ''}
<div class="bloque anexos-documentales"><h2>ANEXOS</h2>${anexos ? `<table><thead><tr><th style="width:8%">N.º</th><th style="width:34%">Archivo</th><th>Descripción</th><th style="width:18%">Tipo</th></tr></thead><tbody>${anexos}</tbody></table>` : '<p class="sin-datos">Sin anexos.</p>'}</div>
<div class="bloque"><h2>REGISTRO FOTOGRÁFICO (${vistas.length})</h2>${fotografias ? `<table class="galeria">${fotografias}</table>` : '<p class="sin-datos">Sin fotografías.</p>'}</div>
<div class="firmas-bloque"><h2>FIRMAS</h2><table class="firmas"><tr>
<td><div class="firma-img">${datos.firmaContratista ? `<img src="${datos.firmaContratista}" alt="Firma contratista" width="180">` : ''}</div><div class="firma-linea"></div><div class="nombre">${valor(datos.representanteContratista || contratista.representanteLegal || '')}</div><div class="cargo">Representante del Contratista</div></td>
<td><div class="firma-img">${datos.firmaInterventoria ? `<img src="${datos.firmaInterventoria}" alt="Firma interventoría" width="180">` : ''}</div><div class="firma-linea"></div><div class="nombre">${valor(datos.representanteContratante || configuracion.representanteInterventoria || '')}</div><div class="cargo">Representante de la Interventoría</div></td>
</tr></table></div>
<div class="pie">${valor(empresa)} · Folio ${valor(datos.numero)} · Formato v1.54 · Generado ${new Date().toLocaleString('es-CO')}</div>
</div></body></html>`;

    // Normalización final v1.47: garantiza que ninguna plantilla heredada
    // vuelva a mostrar el título combinado ni duplique fotografías.
    return htmlInforme
      .replace(/ANEXOS\s*(?:Y|&)\s*FOTOGRAF(?:I|Í)AS/gi, 'ANEXOS')
      .replace(/ANEXOS\s*\/\s*FOTOGRAF(?:I|Í)AS/gi, 'ANEXOS');
  }

  function ordenarFoliosConsecutivamente(folios = []) {
    return [...(Array.isArray(folios) ? folios : [])].sort((a, b) => {
      const fechaA = String(a?.fecha || '');
      const fechaB = String(b?.fecha || '');
      if (fechaA !== fechaB) return fechaA.localeCompare(fechaB);

      const numeroA = Number(String(a?.numero || '').replace(/\D+/g, '')) || 0;
      const numeroB = Number(String(b?.numero || '').replace(/\D+/g, '')) || 0;
      return numeroA - numeroB;
    });
  }

  async function cargarImagenesDeFolio(folio = {}) {
    const imagenes = Array.isArray(folio.imagenes)
      ? folio.imagenes.map(item => ({ ...item }))
      : [];

    for (const imagen of imagenes) {
      if (imagen.datos || !imagen.ruta) continue;
      try {
        const respuesta = await ipc()?.leerImagenEvidencia?.(imagen);
        if (respuesta?.ok) {
          imagen.datos = respuesta.datos || '';
          imagen.tipo = respuesta.tipo || imagen.tipo;
          imagen.tamano = respuesta.tamano || imagen.tamano;
        }
      }
      catch (error) {
        console.warn('No fue posible cargar una imagen del folio consolidado.', error);
      }
    }

    const unicas = [];
    const claves = new Set();
    imagenes.forEach(imagen => {
      const clave = String(imagen.id || imagen.ruta || imagen.nombre || imagen.datos || '').slice(0, 500);
      if (!clave || claves.has(clave)) return;
      claves.add(clave);
      unicas.push(imagen);
    });
    return unicas;
  }

  async function registrarExportacion(tipo, resultado = {}) {
    if (!resultado?.ruta || !estado.folioActual) return true;

    const exportaciones = Array.isArray(estado.folioActual.exportaciones)
      ? [...estado.folioActual.exportaciones]
      : [];

    exportaciones.push({
      id: generarIdLocal('exportacion'),
      tipo: String(tipo || 'archivo'),
      ruta: resultado.ruta,
      fecha: new Date().toISOString()
    });

    estado.folioActual.exportaciones = exportaciones;
    return true;
  }

  function contenidoFolioConsolidado(folio, indice, total, imagenes = []) {
    const valor = contenido => {
      const texto = String(contenido ?? '').trim();
      return texto ? escaparHTML(texto) : '—';
    };
    const fecha = contenido => {
      if (!contenido) return '—';
      const partes = String(contenido).split('-');
      return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : valor(contenido);
    };

    const fotos = imagenes.map((imagen, i) => `
      <div class="foto-consolidado">
        <h4>Fotografía ${i + 1}</h4>
        ${imagen.datos
          ? `<img src="${imagen.datos}" alt="Fotografía ${i + 1}">`
          : '<p class="sin-datos">Imagen no disponible.</p>'}
        <p><strong>Descripción:</strong> ${valor(imagen.descripcion || 'Sin descripción')}</p>
      </div>
    `).join('');

    const anexos = (Array.isArray(folio.anexos) ? folio.anexos : []).map((anexo, i) => `
      <tr><td>${i + 1}</td><td>${valor(anexo.nombre)}</td><td>${valor(anexo.descripcion || 'Sin descripción')}</td></tr>
    `).join('');

    return `
      <section class="folio-consolidado ${indice > 0 ? 'salto-pagina' : ''}">
        <div class="folio-encabezado">
          <h2>FOLIO ${valor(folio.numero)}</h2>
          <p><strong>Folio ${indice + 1} de ${total}</strong></p>
        </div>
        <table class="datos-folio">
          <tr><td class="etiqueta">Fecha</td><td>${fecha(folio.fecha)}</td><td class="etiqueta">Estado</td><td>${valor(folio.estadoFolio || 'Borrador')}</td></tr>
          <tr><td class="etiqueta">Obra</td><td colspan="3">${valor(folio.obraNombre || estado.obraActiva?.nombre)}</td></tr>
          <tr><td class="etiqueta">Contrato</td><td>${valor(folio.numeroContrato)}</td><td class="etiqueta">Dirección</td><td>${valor(folio.direccion)}</td></tr>
        </table>

        <h3>ANOTACIÓN</h3>
        <div class="anotacion">${normalizarContenidoParaWord(folio.anotacion?.contenidoHTML || '') || '<p class="sin-datos">Sin anotación.</p>'}</div>

        <h3>NOTA U OBSERVACIONES</h3>
        <div class="anotacion"><p>${valor(folio.nota || 'Sin observaciones adicionales.')}</p></div>

        <h3>DOCUMENTOS ANEXOS (${Array.isArray(folio.anexos) ? folio.anexos.length : 0})</h3>
        ${anexos ? `<table><thead><tr><th style="width:8%">N.º</th><th style="width:42%">Archivo</th><th>Descripción</th></tr></thead><tbody>${anexos}</tbody></table>` : '<p class="sin-datos">Sin anexos.</p>'}

        <h3>REGISTRO FOTOGRÁFICO (${imagenes.length})</h3>
        ${fotos || '<p class="sin-datos">Sin fotografías.</p>'}

        <h3>FIRMAS</h3>
        <table class="firmas-informe"><tr>
          <td>
            <div class="firma-informe__imagen">${folio.firmaContratista ? `<img src="${folio.firmaContratista}" alt="Firma del representante del contratista">` : ''}</div>
            <div class="firma-informe__linea"></div>
            <div class="firma-informe__nombre">${valor(folio.representanteContratista || '')}</div>
            <div class="firma-informe__cargo">Representante del Contratista</div>
          </td>
          <td>
            <div class="firma-informe__imagen">${folio.firmaInterventoria ? `<img src="${folio.firmaInterventoria}" alt="Firma del representante de la interventoría">` : ''}</div>
            <div class="firma-informe__linea"></div>
            <div class="firma-informe__nombre">${valor(folio.representanteContratante || '')}</div>
            <div class="firma-informe__cargo">Representante de la Interventoría</div>
          </td>
        </tr></table>
      </section>`;
  }

  async function exportarInformeConsolidado() {
    if (!estado.obraActiva?.id) {
      alerta('Debe seleccionar una obra antes de consolidar sus folios.', 'advertencia');
      return;
    }

    const boton = $('#btn-informe-consolidado');
    const textoOriginal = boton?.textContent;

    // Se conserva una copia completa de lo que el usuario tiene abierto para
    // restaurarlo al terminar. La generación no altera ni vuelve a guardar
    // los folios durante el recorrido.
    const folioVisible = {
      ...leerFormulario(),
      imagenes: estado.imagenes.map(item => ({ ...item })),
      anexos: estado.anexos.map(item => ({ ...item }))
    };

    try {
      if (boton) {
        boton.disabled = true;
        boton.textContent = '⏳ Consolidando...';
      }

      const guardado = await guardarFolio();
      if (!guardado) return;

      // Misma fuente de datos que usa el PDF aprobado.
      await actualizarDatosParaPDF();
      await cargarConfiguracionInforme();

      const respuesta = await ipc()?.listarFolios?.({ obraId: estado.obraActiva.id });
      const folios = ordenarFoliosConsecutivamente(
        respuesta?.ok && Array.isArray(respuesta.folios) ? respuesta.folios : []
      );

      if (!folios.length) {
        alerta('La obra seleccionada todavía no tiene folios guardados.', 'advertencia');
        return;
      }

      const cuerpos = [];
      let cabeceraHTML = '';

      for (let i = 0; i < folios.length; i += 1) {
        const folio = {
          ...folios[i],
          imagenes: await cargarImagenesDeFolio(folios[i]),
          anexos: await cargarAnexosDeFolio(folios[i])
        };

        cargarFolioEnFormulario(folio);
        // cargarFolioEnFormulario inicia una carga no bloqueante; esta espera
        // garantiza que documentoHTML reciba todas las fotos en base64.
        await cargarDatosImagenesPersistidas();

        // Aplicar al Word consolidado exactamente la misma preparación
        // de logo, fotografías y firmas usada por el Word del folio.
        const restaurarRecursosWord = await prepararRecursosParaWord();
        let htmlFolio;
        try {
          htmlFolio = ajustarHTMLExclusivoParaWord(documentoHTML());
        }
        finally {
          restaurarRecursosWord();
        }
        if (!cabeceraHTML) {
          const coincidenciaHead = htmlFolio.match(/<head>[\s\S]*?<\/head>/i);
          cabeceraHTML = coincidenciaHead ? coincidenciaHead[0] : '<head><meta charset="utf-8"></head>';
          cabeceraHTML = cabeceraHTML.replace(
            /<\/style>/i,
            '.folio-consolidado-word{display:block;width:100%;}' +
            '.folio-consolidado-word .bloque-anotacion{page-break-before:always;mso-break-before:page;page-break-inside:avoid;mso-break-inside:avoid;}' +
            '.folio-consolidado-word .anotacion .bloque-editor{page-break-inside:avoid;mso-break-inside:avoid;break-inside:avoid;}' +
            '.folio-consolidado-word .anotacion .bloque-editor table{page-break-inside:avoid;mso-break-inside:avoid;}' +
            '<\/style>'
          );
        }

        const coincidenciaBody = htmlFolio.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        let cuerpo = coincidenciaBody ? coincidenciaBody[1] : htmlFolio;

        // En el consolidado, la anotación empieza siempre en una página nueva.
        // Así no queda una parte al final de la hoja de datos y el resto en la
        // siguiente. Además, cada bloque interno se conserva unido cuando cabe.
        cuerpo = cuerpo
          .replace(
            /<div class="bloque"><h2>ANOTACIÓN DEL FOLIO<\/h2>/i,
            '<div class="bloque bloque-anotacion"><h2>ANOTACIÓN DEL FOLIO</h2>'
          )
          .replace(
            /class="bloque-editor([^"]*)"/gi,
            'class="bloque-editor$1" style="page-break-inside:avoid;mso-break-inside:avoid;break-inside:avoid;"'
          );

        // Word no siempre respeta page-break-before aplicado a section. Por eso
        // se inserta un salto de página explícito compatible con Microsoft Word
        // antes de cada folio, excepto el primero.
        if (i > 0) {
          cuerpos.push(
            '<p class="MsoNormal" style="page-break-before:always;mso-break-before:page;margin:0;height:0;line-height:0;font-size:0;">&nbsp;</p>'
          );
        }
        cuerpos.push(`<div class="folio-consolidado-word">${cuerpo}</div>`);
      }

      const contenido = `<!doctype html>
<html lang="es" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
${cabeceraHTML}
<body>${cuerpos.join('')}</body></html>`;

      const obra = estado.obraActiva || {};
      const nombreSeguro = String(obra.nombre || 'Obra')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 55);

      const resultado = await ipc()?.guardarArchivo?.({
        titulo: 'Guardar informe consolidado de bitácora',
        nombreSugerido: `Informe_Consolidado_WORD_v167_${nombreSeguro || 'Obra'}.doc`,
        contenido,
        tipoMime: 'application/msword',
        filtros: [{ name: 'Documento Word', extensions: ['doc'] }]
      });

      if (resultado?.ok) {
        if (resultado.entorno === 'navegador') {
          alerta(`Informe consolidado Word descargado con ${folios.length} folios. Ábralo desde Archivos o desde Microsoft Word.`, 'exito');
        } else {
          const apertura = await ipc()?.abrirRuta?.(resultado.ruta);
          alerta(
            apertura?.ok
              ? `Informe consolidado generado con ${folios.length} folios y abierto correctamente.`
              : `Informe consolidado generado con ${folios.length} folios.`,
            apertura?.ok ? 'exito' : 'advertencia'
          );
        }
      }
    }
    catch (error) {
      console.error(error);
      alerta(error.message || 'No fue posible generar el informe consolidado.', 'error');
    }
    finally {
      // Restaurar exactamente el folio que estaba visible antes del proceso.
      cargarFolioEnFormulario(folioVisible);
      estado.imagenes = folioVisible.imagenes.map(item => ({ ...item }));
      estado.anexos = folioVisible.anexos.map(item => ({ ...item }));
      renderizarImagenes();
      renderizarAnexos();

      if (boton) {
        boton.disabled = false;
        boton.textContent = textoOriginal || '📘 Informe consolidado';
      }
    }
  }

  function normalizarImagenParaWord(origen, ancho = 900, alto = 540, fondo = '#ffffff') {
    return new Promise(resolve => {
      if (!origen) {
        resolve(origen);
        return;
      }

      const imagen = new Image();
      imagen.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = ancho;
          canvas.height = alto;
          const contexto = canvas.getContext('2d');
          contexto.fillStyle = fondo;
          contexto.fillRect(0, 0, ancho, alto);

          const escala = Math.min(ancho / imagen.naturalWidth, alto / imagen.naturalHeight);
          const anchoDibujo = Math.max(1, Math.round(imagen.naturalWidth * escala));
          const altoDibujo = Math.max(1, Math.round(imagen.naturalHeight * escala));
          const x = Math.round((ancho - anchoDibujo) / 2);
          const y = Math.round((alto - altoDibujo) / 2);
          contexto.drawImage(imagen, x, y, anchoDibujo, altoDibujo);
          resolve(canvas.toDataURL('image/jpeg', 0.92));
        }
        catch (error) {
          console.warn('No fue posible normalizar una imagen para Word.', error);
          resolve(origen);
        }
      };
      imagen.onerror = () => resolve(origen);
      imagen.src = origen;
    });
  }

  async function prepararRecursosParaWord() {
    const configuracion = window.__bitacoraConfiguracionInforme || {};
    const logoOriginal = configuracion.logoEmpresa || configuracion.empresaLogo || '';
    const imagenesOriginales = estado.imagenes;

    const imagenesWord = await Promise.all(
      (Array.isArray(estado.imagenes) ? estado.imagenes : []).map(async item => ({
        ...item,
        datos: item?.datos
          ? await normalizarImagenParaWord(item.datos, 900, 540)
          : item?.datos
      }))
    );

    let logoWord = logoOriginal;
    if (logoOriginal) {
      logoWord = await normalizarImagenParaWord(logoOriginal, 360, 360);
      if (configuracion.logoEmpresa) configuracion.logoEmpresa = logoWord;
      else configuracion.empresaLogo = logoWord;
    }
    estado.imagenes = imagenesWord;

    return () => {
      estado.imagenes = imagenesOriginales;
      if (configuracion.logoEmpresa) configuracion.logoEmpresa = logoOriginal;
      else if (configuracion.empresaLogo) configuracion.empresaLogo = logoOriginal;
    };
  }

  function ajustarHTMLExclusivoParaWord(html) {
    return String(html || '')
      // Word interpreta mso-width-percent como 100 % y agranda el logo.
      .replace(/img\{mso-width-percent:100;display:inline-block\}/i, 'img{display:inline-block}')
      // Dimensiones físicas explícitas: Word respeta mejor atributos que max-width CSS.
      .replace(/(<td class="logo"[\s\S]*?<img\s+src="[^"]+"[^>]*?)\s+width="105"([^>]*>)/i, '$1 width="82" height="82"$2')
      .replace(/(<div class="foto-marco">\s*<img\s+src="[^"]+"[^>]*?)\s+width="300"([^>]*>)/gi, '$1 width="300" height="180"$2')
      .replace(/(<div class="firma-img">\s*<img\s+src="[^"]+"[^>]*?)\s+width="180"([^>]*>)/gi, '$1 width="180" height="86"$2')
      .replace(/\.logo img\{[^}]*\}/i, '.logo img{width:2.2cm!important;height:2.2cm!important;max-width:2.2cm!important;max-height:2.2cm!important;mso-width-source:userset;mso-height-source:userset}')
      .replace(/\.foto-marco\{[^}]*\}/i, '.foto-marco{height:5.1cm;border:1.2px solid #64748b;padding:4px;text-align:center;background:#fff;overflow:hidden}')
      .replace(/\.foto-marco img\{[^}]*\}/i, '.foto-marco img{display:block;width:7.8cm!important;height:4.65cm!important;max-width:7.8cm!important;max-height:4.65cm!important;margin:0 auto;mso-width-source:userset;mso-height-source:userset}')
      .replace(/\.galeria\{table-layout:fixed\}/i, '.galeria{table-layout:fixed;width:100%!important}')
      .replace(/\.foto-celda\{[^}]*\}/i, '.foto-celda{width:50%;padding:6px;page-break-inside:avoid;vertical-align:top}')
      .replace(/\.firma-img img\{[^}]*\}/i, '.firma-img img{width:4.8cm!important;height:2.3cm!important;max-width:4.8cm!important;max-height:2.3cm!important;mso-width-source:userset;mso-height-source:userset}');
  }

  async function exportarWord() {
    const guardado = await guardarFolio();
    if (!guardado) return;

    // Word debe alimentarse y maquetarse exactamente con la misma ruta
    // aprobada para el PDF: refrescar obra/contratista, cargar imágenes y
    // configuración, y finalmente reutilizar documentoHTML().
    await actualizarDatosParaPDF();
    await cargarDatosImagenesPersistidas();
    await cargarDatosAnexosImagenPersistidos();
    await cargarConfiguracionInforme();

    const restaurarRecursos = await prepararRecursosParaWord();
    let contenido;
    try {
      contenido = ajustarHTMLExclusivoParaWord(documentoHTML());
    }
    finally {
      restaurarRecursos();
    }

    const resultado = await ipc()?.guardarArchivo?.({
      titulo: 'Exportar a Word',
      nombreSugerido:
        `Bitacora_Folio_${$('#numero-folio').value}_FORMATO_PDF_v167_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.doc`,
      contenido,
      tipoMime: 'application/msword',
      filtros: [{
        name: 'Documento Word',
        extensions: ['doc']
      }]
    });

    if (resultado?.ok) {
      await registrarExportacion('word', resultado);

      if (resultado.entorno === 'navegador') {
        alerta('Documento Word descargado. Ábralo desde Archivos o desde Microsoft Word; Safari ya no mostrará el código HTML como informe.', 'exito');
      } else {
        const apertura = await ipc()?.abrirRuta?.(resultado.ruta);
        if (apertura?.ok) {
          alerta('Documento Word guardado, referenciado y abierto para revisar su presentación.', 'exito');
        } else {
          alerta('Documento Word guardado y referenciado. No fue posible abrirlo automáticamente.', 'advertencia');
        }
      }
    }
  }

  async function actualizarDatosParaPDF() {
    try {
      const [obrasRespuesta, contratistasRespuesta] = await Promise.all([
        ipc()?.listarObras?.(),
        ipc()?.listarContratistas?.()
      ]);

      if (obrasRespuesta?.ok && Array.isArray(obrasRespuesta.obras)) {
        estado.obras = obrasRespuesta.obras;
        const obraId = estado.obraActiva?.id || leerFormulario().obraId;
        const obraActualizada = obrasRespuesta.obras.find(item => item.id === obraId);
        if (obraActualizada) {
          estado.obraActiva = obraActualizada;
          cargarObraEnFormulario(obraActualizada);
        }
      }

      if (contratistasRespuesta?.ok && Array.isArray(contratistasRespuesta.contratistas)) {
        estado.contratistas = contratistasRespuesta.contratistas;
        const contratista = obtenerContratistaDeObra(estado.obraActiva);
        if (contratista) mostrarContratistaEnEncabezado(contratista);
      }
    }
    catch (error) {
      console.warn('No fue posible refrescar los datos antes de generar el PDF.', error);
    }
  }

  async function elegirTipoPDF() {
    return new Promise((resolve) => {
      const fondo = document.createElement('div');
      fondo.className = 'modal-fondo visible';
      fondo.style.zIndex = '20000';

      fondo.innerHTML = `
        <div class="modal modal-pequeno" role="dialog" aria-modal="true" aria-labelledby="titulo-tipo-pdf">
          <div class="modal-encabezado">
            <h2 id="titulo-tipo-pdf">Exportar PDF</h2>
            <button class="modal-cerrar" type="button" data-pdf-opcion="cancelar" aria-label="Cerrar">×</button>
          </div>
          <div class="modal-contenido">
            <p>Seleccione el documento que desea generar:</p>
            <div style="display:grid;gap:12px;margin-top:16px;">
              <button class="boton boton-primario" type="button" data-pdf-opcion="folio">📄 PDF del folio actual</button>
              <button class="boton" type="button" data-pdf-opcion="consolidado">📚 PDF consolidado de todos los folios</button>
            </div>
          </div>
          <div class="modal-pie">
            <button class="boton" type="button" data-pdf-opcion="cancelar">Cancelar</button>
          </div>
        </div>`;

      const cerrar = (valor) => {
        fondo.remove();
        document.body.classList.remove('modal-abierto');
        resolve(valor);
      };

      fondo.addEventListener('click', (evento) => {
        if (evento.target === fondo) cerrar(null);
        const boton = evento.target.closest('[data-pdf-opcion]');
        if (!boton) return;
        const opcion = boton.dataset.pdfOpcion;
        cerrar(opcion === 'cancelar' ? null : opcion);
      });

      document.body.appendChild(fondo);
      document.body.classList.add('modal-abierto');
      fondo.querySelector('[data-pdf-opcion="folio"]')?.focus();
    });
  }

  async function exportarPDFFolioActual() {
    const guardado = await guardarFolio();
    if (!guardado) return;
    await actualizarDatosParaPDF();
    await cargarDatosImagenesPersistidas();
    await cargarConfiguracionInforme();

    const datos = leerFormulario();
    const resultado = await ipc()?.guardarPDFDesdeHTML?.({
      titulo: 'Exportar PDF del folio',
      nombreSugerido: `Bitacora_${datos.numero}.pdf`,
      contenidoHTML: documentoHTML()
    });

    if (resultado?.ok) {
      await registrarExportacion('pdf', resultado);

      const apertura = await ipc()?.abrirRuta?.(resultado.ruta);

      if (apertura?.ok) {
        alerta(
          'Documento PDF del folio guardado, referenciado y abierto para revisar su presentación.',
          'exito'
        );
      }
      else {
        alerta(
          'Documento PDF del folio guardado y referenciado. No fue posible abrirlo automáticamente.',
          'advertencia'
        );
      }
    }
  }

  async function exportarPDFConsolidado() {
    if (!estado.obraActiva?.id) {
      alerta('Debe seleccionar una obra antes de generar el PDF consolidado.', 'advertencia');
      return;
    }

    const boton = $('#btn-pdf');
    const textoOriginal = boton?.textContent;
    const folioVisible = {
      ...leerFormulario(),
      imagenes: estado.imagenes.map(item => ({ ...item })),
      anexos: estado.anexos.map(item => ({ ...item }))
    };

    try {
      if (boton) {
        boton.disabled = true;
        boton.textContent = '⏳ PDF...';
      }

      const guardado = await guardarFolio();
      if (!guardado) return;

      await actualizarDatosParaPDF();
      await cargarConfiguracionInforme();

      const respuesta = await ipc()?.listarFolios?.({ obraId: estado.obraActiva.id });
      const folios = ordenarFoliosConsecutivamente(
        respuesta?.ok && Array.isArray(respuesta.folios) ? respuesta.folios : []
      );

      if (!folios.length) {
        alerta('La obra seleccionada todavía no tiene folios guardados.', 'advertencia');
        return;
      }

      const cuerpos = [];
      let cabeceraHTML = '';

      for (let i = 0; i < folios.length; i += 1) {
        const folio = {
          ...folios[i],
          imagenes: await cargarImagenesDeFolio(folios[i]),
          anexos: await cargarAnexosDeFolio(folios[i])
        };

        cargarFolioEnFormulario(folio);
        await cargarDatosImagenesPersistidas();

        const htmlFolio = documentoHTML();
        if (!cabeceraHTML) {
          const coincidenciaHead = htmlFolio.match(/<head>[\s\S]*?<\/head>/i);
          cabeceraHTML = coincidenciaHead
            ? coincidenciaHead[0]
            : '<head><meta charset="utf-8"></head>';

          cabeceraHTML = cabeceraHTML.replace(
            /<\/style>/i,
            '.folio-consolidado-pdf{display:block;width:100%;}' +
            '.folio-consolidado-pdf.nueva-pagina{page-break-before:always;break-before:page;}' +
            '<\/style>'
          );
        }

        const coincidenciaBody = htmlFolio.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const cuerpo = coincidenciaBody ? coincidenciaBody[1] : htmlFolio;

        cuerpos.push(`<section class="folio-consolidado-pdf${i > 0 ? ' nueva-pagina' : ''}">${cuerpo}</section>`);
      }

      const contenidoHTML = `<!doctype html>
<html lang="es">
${cabeceraHTML}
<body>${cuerpos.join('')}</body>
</html>`;

      const obra = estado.obraActiva || {};
      const nombreSeguro = String(obra.nombre || 'Obra')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 55);

      const resultado = await ipc()?.guardarPDFDesdeHTML?.({
        titulo: 'Exportar PDF consolidado de la obra',
        nombreSugerido: `Informe_Consolidado_${nombreSeguro || 'Obra'}.pdf`,
        contenidoHTML
      });

      if (resultado?.ok) {
        await registrarExportacion('pdf-consolidado', resultado);
        const apertura = await ipc()?.abrirRuta?.(resultado.ruta);
        alerta(
          apertura?.ok
            ? `PDF consolidado generado con ${folios.length} folios y abierto correctamente.`
            : `PDF consolidado generado con ${folios.length} folios.`,
          apertura?.ok ? 'exito' : 'advertencia'
        );
      }
    }
    catch (error) {
      console.error(error);
      alerta(error.message || 'No fue posible generar el PDF consolidado.', 'error');
    }
    finally {
      cargarFolioEnFormulario(folioVisible);
      estado.imagenes = folioVisible.imagenes.map(item => ({ ...item }));
      estado.anexos = folioVisible.anexos.map(item => ({ ...item }));
      renderizarImagenes();
      renderizarAnexos();

      if (boton) {
        boton.disabled = false;
        boton.textContent = textoOriginal || '📕 PDF';
      }
    }
  }

  async function exportarPDF() {
    const opcion = await elegirTipoPDF();
    if (opcion === 'folio') {
      await exportarPDFFolioActual();
    }
    else if (opcion === 'consolidado') {
      await exportarPDFConsolidado();
    }
  }

  async function exportarZIP() {
    await guardarFolio();

    if (!window.JSZip) {
      throw new Error(
        'La librería ZIP no está disponible.'
      );
    }

    const zip = new window.JSZip();
    const datos = leerFormulario();

    zip.file(
      `Bitacora_${datos.numero}.json`,
      JSON.stringify(datos, null, 2)
    );

    const blob =
      await zip.generateAsync({
        type: 'blob'
      });

    const bytes =
      Array.from(
        new Uint8Array(
          await blob.arrayBuffer()
        )
      );

    await ipc()?.guardarArchivoBinario?.({
      titulo: 'Exportar respaldo ZIP',
      nombreSugerido:
        `Bitacora_${datos.numero}.zip`,
      datos: bytes,
      filtros: [{
        name: 'Archivo ZIP',
        extensions: ['zip']
      }]
    });
  }


  async function capturarGPS() {
    const botones = [
      $('#btn-gps'),
      $('#btn-capturar-ubicacion-panel')
    ].filter(Boolean);

    const botonPanel =
      $('#btn-capturar-ubicacion-panel');

    const textoOriginal =
      botonPanel?.textContent || '📍 Capturar GPS';

    const restaurarBotones = () => {
      botones.forEach(boton => {
        boton.disabled = false;
      });

      if (botonPanel) {
        botonPanel.textContent = textoOriginal;
      }
    };

    if (!navigator.geolocation) {
      const usarManual = window.confirm(
        'Este equipo no ofrece geolocalización automática. ' +
        '¿Desea ingresar las coordenadas manualmente?'
      );

      if (usarManual) solicitarCoordenadasManuales();
      return;
    }

    botones.forEach(boton => {
      boton.disabled = true;
    });

    if (botonPanel) {
      botonPanel.textContent = '📍 Buscando ubicación...';
    }

    const obtenerPosicion = opciones =>
      new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          opciones
        );
      });

    try {
      let posicion;

      // En la aplicación de escritorio se consulta primero el servicio
      // nativo de ubicación de Windows. Es más confiable que depender
      // únicamente de la geolocalización incorporada en Chromium.
      if (window.electronAPI?.capturarGPSWindows) {
        const respuestaWindows =
          await window.electronAPI.capturarGPSWindows();

        if (respuestaWindows?.ok) {
          posicion = {
            coords: {
              latitude: respuestaWindows.latitud,
              longitude: respuestaWindows.longitud,
              accuracy: respuestaWindows.precision || 0
            },
            timestamp: respuestaWindows.fecha
              ? new Date(respuestaWindows.fecha).getTime()
              : Date.now()
          };
        }
      }

      if (!posicion) try {
        // Segundo recurso: geolocalización de Chromium.
        posicion = await obtenerPosicion({
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0
        });
      }
      catch (primerError) {
        // Segundo intento: ubicación de red/Wi-Fi, más estable en portátiles.
        if (primerError?.code === 1) throw primerError;

        if (botonPanel) {
          botonPanel.textContent = '📍 Reintentando ubicación...';
        }

        posicion = await obtenerPosicion({
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 300000
        });
      }

      const fecha = new Date();
      const latitud = Number(posicion.coords.latitude);
      const longitud = Number(posicion.coords.longitude);
      const precision = Number(posicion.coords.accuracy || 0);

      if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
        throw new Error('El sistema devolvió coordenadas inválidas.');
      }

      if ($('#latitud')) {
        $('#latitud').value = latitud.toFixed(6);
      }

      if ($('#longitud')) {
        $('#longitud').value = longitud.toFixed(6);
      }

      if ($('#precision-gps')) {
        $('#precision-gps').value = precision > 0
          ? `± ${Math.round(precision)} m`
          : 'Precisión no informada';
        $('#precision-gps').dataset.valor = String(precision);
      }

      if ($('#fecha-ubicacion')) {
        $('#fecha-ubicacion').value =
          fecha.toLocaleString('es-CO');
        $('#fecha-ubicacion').dataset.iso =
          fecha.toISOString();
      }

      if ($('#estado-ubicacion')) {
        $('#estado-ubicacion').dataset.fuente = 'gps';
      }

      actualizarVistaUbicacion();
      cambiarEstado('Sin guardar', 'advertencia');

      alerta(
        'Ubicación GPS capturada correctamente.',
        'exito'
      );
    }
    catch (error) {
      const mensajes = {
        1: 'El permiso de ubicación fue rechazado. Active la ubicación de Windows y permita el acceso a las aplicaciones de escritorio.',
        2: 'No fue posible determinar la ubicación. Verifique que la ubicación de Windows esté activada y que el equipo tenga conexión a Internet o Wi-Fi.',
        3: 'La búsqueda de la ubicación agotó el tiempo de espera.'
      };

      const detalle =
        mensajes[error?.code] ||
        error?.message ||
        'No fue posible obtener la ubicación automáticamente.';

      const usarManual = window.confirm(
        `${detalle}\n\n¿Desea ingresar las coordenadas manualmente?`
      );

      if (usarManual) {
        solicitarCoordenadasManuales();
      }
      else {
        alerta('No se registró una ubicación.', 'advertencia');
      }
    }
    finally {
      restaurarBotones();
    }
  }

  function vincularEventos() {
    ['#obra-nombre', '#obra-direccion'].forEach(selector => {
      const campo = $(selector);
      if (!campo || campo.dataset.alturaAutomatica === '1') return;

      campo.dataset.alturaAutomatica = '1';
      campo.addEventListener('input', () => ajustarAlturaCampoLargo(campo));
      ajustarAlturaCampoLargo(campo);
    });
    $('#selector-obra-activa')?.addEventListener(
      'change',
      evento => cambiarObraActiva(evento.target.value)
    );

    $('#selector-contratista-obra')?.addEventListener(
      'change',
      evento => cambiarContratistaDeObra(evento.target.value)
    );

    $('#btn-nuevo')?.addEventListener(
      'click',
      () => prepararNuevoFolio(true)
    );

    $('#btn-abrir')?.addEventListener(
      'click',
      abrirHistorial
    );

    $('#btn-limpiar')?.addEventListener(
      'click',
      limpiarParaNuevaObra
    );

    $('#btn-obras')?.addEventListener(
      'click',
      () => {
        window.location.href = './obras.html';
      }
    );

    $('#btn-historial')?.addEventListener(
      'click',
      abrirHistorial
    );

    $('#btn-informe-consolidado')?.addEventListener(
      'click',
      exportarInformeConsolidado
    );

    $('#btn-guardar')?.addEventListener(
      'click',
      guardarFolio
    );

    $('#btn-atras')?.addEventListener(
      'click',
      () => navegarFolio('anterior')
    );

    $('#btn-adelante')?.addEventListener(
      'click',
      () => navegarFolio('siguiente')
    );

    $('#btn-imprimir')?.addEventListener(
      'click',
      imprimir
    );

    $('#btn-word')?.addEventListener(
      'click',
      exportarWord
    );

    $('#btn-pdf')?.addEventListener(
      'click',
      exportarPDF
    );

    $('#btn-zip')?.addEventListener(
      'click',
      () => exportarZIP().catch(error =>
        alerta(error.message, 'error')
      )
    );

    $('#btn-agregar-fotos-panel')?.addEventListener(
      'click',
      seleccionarFotografiasNativas
    );

    $('#btn-anexo')?.addEventListener(
      'click',
      seleccionarAnexosNativos
    );

    $('#btn-agregar-anexos-panel')?.addEventListener(
      'click',
      seleccionarAnexosNativos
    );

    $('#btn-gps')?.addEventListener(
      'click',
      capturarGPS
    );

    $('#btn-capturar-ubicacion-panel')?.addEventListener(
      'click',
      capturarGPS
    );

    $('#btn-usar-ubicacion-obra')?.addEventListener(
      'click',
      usarUbicacionObra
    );

    $('#btn-copiar-coordenadas')?.addEventListener(
      'click',
      copiarCoordenadas
    );

    $('#btn-abrir-mapa-externo')?.addEventListener(
      'click',
      abrirMapaExterno
    );

    ['#latitud', '#longitud'].forEach(selector => {
      $(selector)?.addEventListener(
        'input',
        () => {
          actualizarVistaUbicacion();
          cambiarEstado(
            'Sin guardar',
            'advertencia'
          );
        }
      );
    });

    $('#input-imagen')?.addEventListener(
      'change',
      async evento => {
        await agregarImagenes(
          evento.target.files
        );

        evento.target.value = '';
      }
    );

    $('#input-anexo')?.addEventListener(
      'change',
      async evento => {
        await agregarAnexos(
          evento.target.files
        );

        evento.target.value = '';
      }
    );

    $('#galeria-imagenes')?.addEventListener(
      'click',
      evento => {
        const verId =
          evento.target.dataset.verImagen;

        const eliminarId =
          evento.target.dataset.eliminarImagen;

        if (verId) {
          const item =
            estado.imagenes.find(
              elemento => elemento.id === verId
            );

          abrirDataURL(
            item?.datos,
            item?.nombre
          );
        }

        if (eliminarId) {
          eliminarImagen(eliminarId);
        }
      }
    );

    $('#lista-anexos')?.addEventListener(
      'click',
      evento => {
        const abrirId =
          evento.target.dataset.abrirAnexo;

        const eliminarId =
          evento.target.dataset.eliminarAnexo;

        if (abrirId) {
          const item =
            estado.anexos.find(
              elemento => elemento.id === abrirId
            );

          abrirDataURL(
            item?.datos,
            item?.nombre
          );
        }

        if (eliminarId) {
          eliminarAnexo(eliminarId);
        }
      }
    );

    $('#editor-contenido')?.addEventListener(
      'input',
      () => {
        actualizarContador();
        cambiarEstado('Sin guardar', 'advertencia');
      }
    );

    $('#formulario-bitacora')?.addEventListener(
      'input',
      () => cambiarEstado(
        'Sin guardar',
        'advertencia'
      )
    );

    $$('[data-comando]').forEach(boton => {
      boton.addEventListener('click', () => {
        $('#editor-contenido')?.focus();
        document.execCommand(
          boton.dataset.comando,
          false,
          null
        );
      });
    });

    document.addEventListener('keydown', evento => {
      if (
        evento.ctrlKey &&
        evento.key.toLowerCase() === 's'
      ) {
        evento.preventDefault();
        guardarFolio();
      }

      if (
        evento.ctrlKey &&
        evento.key.toLowerCase() === 'p'
      ) {
        evento.preventDefault();
        imprimir();
      }
    });
  }

  async function iniciar() {
    if (estado.iniciado) return;

    estado.iniciado = true;

    try {
      vincularEventos();
      inicializarFirmasDigitales();
    }
    catch (error) {
      console.error(
        'Error al vincular eventos principales:',
        error
      );

      alerta(
        `No fue posible activar todos los botones: ${error.message}`,
        'error'
      );
    }

    renderizarImagenes();
    renderizarAnexos();
    actualizarVistaUbicacion();
    actualizarContador();

    $('#fecha-folio').value ||= hoy();

    await cargarObraActiva();
    await cargarSelectorContratistas();
    await cargarSelectorObras();
    await recargarFolios();
    if (new URLSearchParams(window.location.search).get('nuevo') === '1') {
      await prepararNuevoFolio(false);
      history.replaceState({}, '', './index.html');
    }
    else {
      await restaurarFolioActivo();
    }

    cambiarEstado('Listo', 'normal');

    console.info(
      'Módulo 2 — Folios inicializado.'
    );
  }

  document.addEventListener('bitacora:contratista-actualizado', () => {
    actualizarNombreContratistaDeObra(estado.obraActiva);
  });

  document.addEventListener('bitacora:contratista-seleccionado', () => {
    actualizarNombreContratistaDeObra(estado.obraActiva);
  });

  document.addEventListener('bitacora:obra-seleccionada', evento => {
    actualizarNombreContratistaDeObra(
      evento.detail?.obra || estado.obraActiva
    );
  });

  window.BitacoraApp = Object.freeze({
    iniciar,
    guardar: guardarFolio,
    nuevo: prepararNuevoFolio,
    limpiar: limpiarParaNuevaObra,
    abrir: abrirHistorial,
    anterior: () => navegarFolio('anterior'),
    siguiente: () => navegarFolio('siguiente'),
    leerFormulario
  });

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

  window.addEventListener('resize', ajustarTextoDatosObra);

  /* =========================================================
     Áreas plegables para tabletas y celulares
     ========================================================= */
  function inicializarAreasPlegables() {
    const formulario = document.getElementById('formulario-bitacora');
    if (!formulario || formulario.dataset.areasPlegables === '1') return;
    formulario.dataset.areasPlegables = '1';

    const definiciones = [
      { selector: ':scope > .encabezado', titulo: 'Encabezado del folio' },
      { selector: ':scope > .seccion-bitacora:nth-of-type(2)', titulo: 'Datos de la obra' },
      { selector: ':scope > .seccion-bitacora:nth-of-type(3)', titulo: 'Anotación del folio' },
      { selector: ':scope > #panel-anexos', titulo: 'Fotografías y anexos' },
      { selector: ':scope > .firmas', titulo: 'Firmas' }
    ];

    const secciones = [];
    definiciones.forEach((definicion, indice) => {
      const seccion = formulario.querySelector(definicion.selector);
      if (!seccion || seccion.dataset.plegable === '1') return;
      seccion.dataset.plegable = '1';
      seccion.classList.add('area-plegable');
      seccion.id ||= `area-plegable-${indice + 1}`;

      const control = document.createElement('div');
      control.className = 'control-area-plegable no-imprimir';
      control.innerHTML = `
        <strong>${definicion.titulo}</strong>
        <button type="button" class="boton-area-plegable" aria-expanded="true" aria-controls="${seccion.id}" title="Minimizar esta área">−</button>`;
      seccion.insertBefore(control, seccion.firstChild);

      const boton = control.querySelector('button');
      const aplicar = minimizada => {
        seccion.classList.toggle('area-minimizada', minimizada);
        boton.textContent = minimizada ? '+' : '−';
        boton.title = minimizada ? 'Expandir esta área' : 'Minimizar esta área';
        boton.setAttribute('aria-expanded', String(!minimizada));
      };
      boton.addEventListener('click', () => aplicar(!seccion.classList.contains('area-minimizada')));
      secciones.push({ seccion, aplicar });
    });

    if (!secciones.length) return;
    const barra = document.createElement('div');
    barra.className = 'barra-areas-plegables no-imprimir';
    barra.innerHTML = `
      <span>Vista compacta</span>
      <button type="button" data-areas="minimizar">Minimizar áreas</button>
      <button type="button" data-areas="expandir">Expandir áreas</button>`;
    formulario.insertBefore(barra, formulario.firstChild);
    barra.addEventListener('click', evento => {
      const accion = evento.target.closest('[data-areas]')?.dataset.areas;
      if (!accion) return;
      secciones.forEach(item => item.aplicar(accion === 'minimizar'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarAreasPlegables, { once: true });
  } else {
    inicializarAreasPlegables();
  }
})();
