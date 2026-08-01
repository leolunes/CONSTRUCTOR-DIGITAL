'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/editor.js
   Propósito: lógica completa del editor enriquecido
   ========================================================= */

(() => {
  const SELECTORES = Object.freeze({
    editor: '#editor-contenido, .editor-contenido',
    contador: '#contador-editor, .editor-estado .contador',
    estado: '#estado-editor, [data-estado-editor]',
    barra: '.editor-toolbar',
    entradaImagen: '#input-imagen, #entrada-imagen-editor, [data-editor-imagen-input]',
    entradaArchivo: '#entrada-archivo-editor, [data-editor-archivo-input]',
    panelBusqueda: '#editor-busqueda, .editor-busqueda',
    campoBusqueda: '#campo-busqueda-editor, [data-editor-busqueda-campo]',
    resultadoBusqueda: '#resultado-busqueda-editor, [data-editor-busqueda-resultado]'
  });

  const ESTADO = {
    rangoGuardado: null,
    coincidencias: [],
    indiceCoincidencia: -1,
    contenidoAntesBusqueda: null
  };

  function seleccionar(selector, raiz = document) {
    return raiz.querySelector(selector);
  }

  function seleccionarTodos(selector, raiz = document) {
    return Array.from(raiz.querySelectorAll(selector));
  }

  function obtenerEditor() {
    return seleccionar(SELECTORES.editor);
  }

  function enfocarEditor() {
    const editor = obtenerEditor();
    if (editor) editor.focus();
    return editor;
  }

  function guardarSeleccion() {
    const seleccion = window.getSelection();
    const editor = obtenerEditor();

    if (!seleccion || seleccion.rangeCount === 0 || !editor) return;

    const rango = seleccion.getRangeAt(0);
    const contenedor = rango.commonAncestorContainer;

    if (
      editor === contenedor ||
      editor.contains(contenedor.nodeType === Node.TEXT_NODE
        ? contenedor.parentNode
        : contenedor)
    ) {
      ESTADO.rangoGuardado = rango.cloneRange();
    }
  }

  function restaurarSeleccion() {
    const editor = obtenerEditor();
    const seleccion = window.getSelection();

    if (!editor || !seleccion) return;

    editor.focus();

    if (ESTADO.rangoGuardado) {
      seleccion.removeAllRanges();
      seleccion.addRange(ESTADO.rangoGuardado);
    }
  }

  function notificarCambio() {
    const editor = obtenerEditor();
    if (!editor) return;

    editor.dispatchEvent(new Event('input', { bubbles: true }));
    document.dispatchEvent(
      new CustomEvent('bitacora:editor-cambio', {
        detail: {
          html: editor.innerHTML,
          texto: editor.innerText
        }
      })
    );

    actualizarContador();
  }

  function ejecutarComando(comando, valor = null) {
    const editor = restaurarYObtenerEditor();
    if (!editor) return false;

    try {
      document.execCommand('styleWithCSS', false, true);
      const resultado = document.execCommand(comando, false, valor);
      guardarSeleccion();
      actualizarEstadoBotones();
      notificarCambio();
      return resultado;
    } catch (error) {
      console.error(`No fue posible ejecutar el comando "${comando}":`, error);
      return false;
    }
  }

  function restaurarYObtenerEditor() {
    restaurarSeleccion();
    return obtenerEditor();
  }

  function insertarHTML(html) {
    const editor = restaurarYObtenerEditor();
    if (!editor) return;

    if (!document.execCommand('insertHTML', false, html)) {
      const seleccion = window.getSelection();

      if (seleccion && seleccion.rangeCount > 0) {
        const rango = seleccion.getRangeAt(0);
        rango.deleteContents();

        const fragmento = rango.createContextualFragment(html);
        const ultimoNodo = fragmento.lastChild;
        rango.insertNode(fragmento);

        if (ultimoNodo) {
          rango.setStartAfter(ultimoNodo);
          rango.collapse(true);
          seleccion.removeAllRanges();
          seleccion.addRange(rango);
        }
      } else {
        editor.insertAdjacentHTML('beforeend', html);
      }
    }

    guardarSeleccion();
    notificarCambio();
  }

  function limpiarFormato() {
    ejecutarComando('removeFormat');
    ejecutarComando('unlink');
  }

  function insertarEnlace() {
    guardarSeleccion();

    const urlIngresada = window.prompt(
      'Escriba la dirección completa del enlace:',
      'https://'
    );

    if (!urlIngresada) return;

    const url = normalizarURL(urlIngresada);

    if (!url) {
      window.alert('La dirección ingresada no es válida.');
      return;
    }

    restaurarSeleccion();
    const seleccion = window.getSelection();
    const textoSeleccionado = seleccion ? seleccion.toString().trim() : '';

    if (textoSeleccionado) {
      ejecutarComando('createLink', url);
      configurarEnlaces();
    } else {
      insertarHTML(
        `<a href="${escaparAtributo(url)}" target="_blank" rel="noopener noreferrer">${escaparHTML(url)}</a>`
      );
    }
  }

  function normalizarURL(valor) {
    const texto = String(valor || '').trim();
    if (!texto) return null;

    try {
      const url = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(texto)
        ? new URL(texto)
        : new URL(`https://${texto}`);

      if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) {
        return null;
      }

      return url.href;
    } catch {
      return null;
    }
  }

  function configurarEnlaces() {
    const editor = obtenerEditor();
    if (!editor) return;

    seleccionarTodos('a', editor).forEach((enlace) => {
      enlace.target = '_blank';
      enlace.rel = 'noopener noreferrer';
    });
  }

  function insertarImagenDesdeArchivo(archivo) {
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      window.alert('Seleccione un archivo de imagen válido.');
      return;
    }

    const lector = new FileReader();

    lector.onload = () => {
      const nombre = escaparAtributo(archivo.name || 'Imagen');
      insertarHTML(
        `<figure class="imagen-editor" contenteditable="false">
          <button type="button" class="boton-eliminar-imagen-editor" data-eliminar-imagen-editor title="Eliminar fotografía" aria-label="Eliminar fotografía">×</button>
          <img src="${lector.result}" alt="${nombre}">
          <figcaption contenteditable="true">${escaparHTML(archivo.name || 'Imagen de la obra')}</figcaption>
        </figure><p><br></p>`
      );
    };

    lector.onerror = () => {
      window.alert('No fue posible leer la imagen seleccionada.');
    };

    lector.readAsDataURL(archivo);
  }

  function solicitarImagen() {
    let entrada = seleccionar(SELECTORES.entradaImagen);

    if (!entrada) {
      entrada = document.createElement('input');
      entrada.type = 'file';
      entrada.accept = 'image/*';
      entrada.hidden = true;
      entrada.id = 'entrada-imagen-editor';
      document.body.appendChild(entrada);
    }

    entrada.value = '';
    entrada.click();
  }

  function insertarTabla() {
    const filas = solicitarNumero('Número de filas:', 3, 1, 20);
    if (filas === null) return;

    const columnas = solicitarNumero('Número de columnas:', 3, 1, 10);
    if (columnas === null) return;

    let html = '<table><tbody>';

    for (let fila = 0; fila < filas; fila += 1) {
      html += '<tr>';

      for (let columna = 0; columna < columnas; columna += 1) {
        const etiqueta = fila === 0 ? 'th' : 'td';
        html += `<${etiqueta}><br></${etiqueta}>`;
      }

      html += '</tr>';
    }

    html += '</tbody></table><p><br></p>';
    insertarHTML(html);
  }

  function solicitarNumero(mensaje, valorInicial, minimo, maximo) {
    const respuesta = window.prompt(mensaje, String(valorInicial));
    if (respuesta === null) return null;

    const numero = Number.parseInt(respuesta, 10);

    if (!Number.isFinite(numero) || numero < minimo || numero > maximo) {
      window.alert(`Ingrese un número entre ${minimo} y ${maximo}.`);
      return null;
    }

    return numero;
  }

  function insertarLineaHorizontal() {
    insertarHTML('<hr><p><br></p>');
  }

  function insertarFechaHora() {
    const fecha = new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'long',
      timeStyle: 'short'
    }).format(new Date());

    insertarHTML(`<span>${escaparHTML(fecha)}</span>`);
  }

  function actualizarContador() {
    const editor = obtenerEditor();
    const contador = seleccionar(SELECTORES.contador);

    if (!editor || !contador) return;

    const texto = (editor.innerText || '').replace(/\u00a0/g, ' ').trim();
    const palabras = texto ? texto.split(/\s+/).filter(Boolean).length : 0;
    const caracteres = texto.length;

    contador.textContent = `${palabras} palabras · ${caracteres} caracteres`;
  }

  function actualizarEstadoBotones() {
    const comandos = [
      'bold',
      'italic',
      'underline',
      'strikeThrough',
      'justifyLeft',
      'justifyCenter',
      'justifyRight',
      'justifyFull',
      'insertUnorderedList',
      'insertOrderedList'
    ];

    comandos.forEach((comando) => {
      seleccionarTodos(`[data-editor-comando="${comando}"]`).forEach((boton) => {
        try {
          boton.classList.toggle('activo', document.queryCommandState(comando));
        } catch {
          boton.classList.remove('activo');
        }
      });
    });
  }

  function abrirBusqueda() {
    const panel = seleccionar(SELECTORES.panelBusqueda);
    const campo = seleccionar(SELECTORES.campoBusqueda);

    if (!panel || !campo) {
      const termino = window.prompt('Texto que desea buscar:');
      if (termino) buscarTexto(termino);
      return;
    }

    panel.classList.add('visible');
    campo.focus();
    campo.select();
  }

  function cerrarBusqueda() {
    limpiarMarcasBusqueda();

    const panel = seleccionar(SELECTORES.panelBusqueda);
    const campo = seleccionar(SELECTORES.campoBusqueda);

    if (panel) panel.classList.remove('visible');
    if (campo) campo.value = '';

    actualizarResultadoBusqueda();
    enfocarEditor();
  }

  function buscarTexto(termino) {
    limpiarMarcasBusqueda();

    const editor = obtenerEditor();
    const consulta = String(termino || '').trim();

    if (!editor || !consulta) {
      actualizarResultadoBusqueda();
      return;
    }

    ESTADO.contenidoAntesBusqueda = editor.innerHTML;

    const caminante = document.createTreeWalker(
      editor,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(nodo) {
          if (!nodo.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          if (nodo.parentElement?.closest('script, style, mark')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodos = [];
    while (caminante.nextNode()) nodos.push(caminante.currentNode);

    const expresion = new RegExp(escaparExpresionRegular(consulta), 'gi');

    nodos.forEach((nodo) => {
      const texto = nodo.nodeValue;
      let coincidencia;
      let ultimoIndice = 0;
      const fragmento = document.createDocumentFragment();
      let encontro = false;

      while ((coincidencia = expresion.exec(texto)) !== null) {
        encontro = true;

        if (coincidencia.index > ultimoIndice) {
          fragmento.appendChild(
            document.createTextNode(texto.slice(ultimoIndice, coincidencia.index))
          );
        }

        const marca = document.createElement('mark');
        marca.className = 'marca-busqueda';
        marca.textContent = coincidencia[0];
        fragmento.appendChild(marca);

        ultimoIndice = coincidencia.index + coincidencia[0].length;

        if (coincidencia[0].length === 0) expresion.lastIndex += 1;
      }

      if (!encontro) return;

      if (ultimoIndice < texto.length) {
        fragmento.appendChild(document.createTextNode(texto.slice(ultimoIndice)));
      }

      nodo.parentNode.replaceChild(fragmento, nodo);
    });

    ESTADO.coincidencias = seleccionarTodos('.marca-busqueda', editor);
    ESTADO.indiceCoincidencia = ESTADO.coincidencias.length ? 0 : -1;

    resaltarCoincidenciaActual();
    actualizarResultadoBusqueda();
  }

  function limpiarMarcasBusqueda() {
    const editor = obtenerEditor();
    if (!editor) return;

    seleccionarTodos('mark.marca-busqueda', editor).forEach((marca) => {
      marca.replaceWith(document.createTextNode(marca.textContent || ''));
    });

    editor.normalize();
    ESTADO.coincidencias = [];
    ESTADO.indiceCoincidencia = -1;
    ESTADO.contenidoAntesBusqueda = null;
  }

  function moverCoincidencia(direccion) {
    if (!ESTADO.coincidencias.length) return;

    ESTADO.indiceCoincidencia =
      (ESTADO.indiceCoincidencia + direccion + ESTADO.coincidencias.length) %
      ESTADO.coincidencias.length;

    resaltarCoincidenciaActual();
    actualizarResultadoBusqueda();
  }

  function resaltarCoincidenciaActual() {
    ESTADO.coincidencias.forEach((elemento, indice) => {
      elemento.classList.toggle(
        'actual',
        indice === ESTADO.indiceCoincidencia
      );
    });

    const actual = ESTADO.coincidencias[ESTADO.indiceCoincidencia];
    actual?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function actualizarResultadoBusqueda() {
    const resultado = seleccionar(SELECTORES.resultadoBusqueda);
    if (!resultado) return;

    if (!ESTADO.coincidencias.length) {
      resultado.textContent = '0 coincidencias';
      return;
    }

    resultado.textContent =
      `${ESTADO.indiceCoincidencia + 1} de ${ESTADO.coincidencias.length}`;
  }

  function manejarPegado(evento) {
    const editor = obtenerEditor();
    if (!editor) return;

    const portapapeles = evento.clipboardData;
    if (!portapapeles) return;

    const imagen = Array.from(portapapeles.items || []).find(
      (item) => item.type.startsWith('image/')
    );

    if (imagen) {
      evento.preventDefault();
      insertarImagenDesdeArchivo(imagen.getAsFile());
      return;
    }

    const texto = portapapeles.getData('text/plain');
    if (!texto) return;

    evento.preventDefault();
    insertarHTML(escaparHTML(texto).replace(/\r?\n/g, '<br>'));
  }

  function manejarSoltar(evento) {
    const archivos = Array.from(evento.dataTransfer?.files || []);
    const imagen = archivos.find((archivo) => archivo.type.startsWith('image/'));

    if (!imagen) return;

    evento.preventDefault();
    guardarSeleccionDesdePunto(evento.clientX, evento.clientY);
    insertarImagenDesdeArchivo(imagen);
  }

  function guardarSeleccionDesdePunto(x, y) {
    let rango = null;

    if (document.caretRangeFromPoint) {
      rango = document.caretRangeFromPoint(x, y);
    } else if (document.caretPositionFromPoint) {
      const posicion = document.caretPositionFromPoint(x, y);
      if (posicion) {
        rango = document.createRange();
        rango.setStart(posicion.offsetNode, posicion.offset);
        rango.collapse(true);
      }
    }

    if (rango) ESTADO.rangoGuardado = rango;
  }

  function escaparHTML(valor) {
    return String(valor ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function escaparAtributo(valor) {
    return escaparHTML(valor).replaceAll('`', '&#096;');
  }

  function escaparExpresionRegular(valor) {
    return String(valor).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function configurarBotones() {
    const acciones = {
      negrita: () => ejecutarComando('bold'),
      cursiva: () => ejecutarComando('italic'),
      subrayado: () => ejecutarComando('underline'),
      tachado: () => ejecutarComando('strikeThrough'),
      izquierda: () => ejecutarComando('justifyLeft'),
      centro: () => ejecutarComando('justifyCenter'),
      derecha: () => ejecutarComando('justifyRight'),
      justificar: () => ejecutarComando('justifyFull'),
      lista: () => ejecutarComando('insertUnorderedList'),
      numeracion: () => ejecutarComando('insertOrderedList'),
      sangria: () => ejecutarComando('indent'),
      quitarSangria: () => ejecutarComando('outdent'),
      deshacer: () => ejecutarComando('undo'),
      rehacer: () => ejecutarComando('redo'),
      limpiarFormato,
      enlace: insertarEnlace,
      imagen: solicitarImagen,
      tabla: insertarTabla,
      linea: insertarLineaHorizontal,
      fechaHora: insertarFechaHora,
      buscar: abrirBusqueda
    };

    Object.entries(acciones).forEach(([accion, manejador]) => {
      seleccionarTodos(`[data-accion="${accion}"]`).forEach((boton) => {
        if (boton.dataset.editorConfigurado === 'true') return;

        boton.dataset.editorConfigurado = 'true';
        boton.addEventListener('mousedown', guardarSeleccion);
        boton.addEventListener('click', (evento) => {
          evento.preventDefault();
          manejador();
        });
      });
    });

    seleccionarTodos('[data-editor-comando]').forEach((boton) => {
      if (boton.dataset.editorConfigurado === 'true') return;

      boton.dataset.editorConfigurado = 'true';
      boton.addEventListener('mousedown', guardarSeleccion);
      boton.addEventListener('click', (evento) => {
        evento.preventDefault();
        ejecutarComando(
          boton.dataset.editorComando,
          boton.dataset.editorValor || null
        );
      });
    });

    seleccionarTodos('[data-editor-fuente]').forEach((selector) => {
      selector.addEventListener('change', () => {
        ejecutarComando('fontName', selector.value);
      });
    });

    seleccionarTodos('[data-editor-tamano]').forEach((selector) => {
      selector.addEventListener('change', () => {
        ejecutarComando('fontSize', selector.value);
      });
    });

    seleccionarTodos('[data-editor-color]').forEach((selector) => {
      selector.addEventListener('input', () => {
        ejecutarComando('foreColor', selector.value);
      });
    });

    seleccionarTodos('[data-editor-fondo]').forEach((selector) => {
      selector.addEventListener('input', () => {
        ejecutarComando('hiliteColor', selector.value);
      });
    });
  }

  function configurarEntradasArchivos() {
    const entradaImagen = seleccionar(SELECTORES.entradaImagen);

    if (entradaImagen) {
      entradaImagen.addEventListener('change', () => {
        insertarImagenDesdeArchivo(entradaImagen.files?.[0]);
        entradaImagen.value = '';
      });
    }
  }

  function configurarBusqueda() {
    const campo = seleccionar(SELECTORES.campoBusqueda);

    if (campo) {
      campo.addEventListener('input', () => buscarTexto(campo.value));
      campo.addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter') {
          evento.preventDefault();
          moverCoincidencia(evento.shiftKey ? -1 : 1);
        }

        if (evento.key === 'Escape') {
          cerrarBusqueda();
        }
      });
    }

    seleccionarTodos('[data-accion="buscar-anterior"]').forEach((boton) => {
      boton.addEventListener('click', () => moverCoincidencia(-1));
    });

    seleccionarTodos('[data-accion="buscar-siguiente"]').forEach((boton) => {
      boton.addEventListener('click', () => moverCoincidencia(1));
    });

    seleccionarTodos('[data-accion="cerrar-busqueda"]').forEach((boton) => {
      boton.addEventListener('click', cerrarBusqueda);
    });
  }

  function esNombreDeImagen(texto = '') {
    return /\.(?:png|jpe?g|gif|webp|bmp|svg|tiff?)$/i.test(String(texto).trim());
  }

  function convertirImagenesAntiguasEnFiguras(editor) {
    seleccionarTodos('img', editor).forEach((imagen) => {
      if (imagen.closest('figure.imagen-editor')) return;

      const siguienteOriginal = imagen.nextSibling;
      const figura = document.createElement('figure');
      figura.className = 'imagen-editor';
      figura.setAttribute('contenteditable', 'false');

      imagen.parentNode.insertBefore(figura, imagen);
      figura.appendChild(imagen);

      let nombre = imagen.getAttribute('alt')?.trim() || 'Fotografía de la obra';
      let nodoNombre = siguienteOriginal;

      if (nodoNombre?.nodeType === Node.TEXT_NODE) {
        const texto = nodoNombre.textContent?.trim() || '';
        if (esNombreDeImagen(texto)) {
          nombre = texto;
          nodoNombre.remove();
        }
      } else if (nodoNombre?.nodeType === Node.ELEMENT_NODE) {
        const texto = nodoNombre.textContent?.trim() || '';
        const esParrafoSimple = nodoNombre.matches('p, div') && nodoNombre.children.length === 0;
        if (esParrafoSimple && esNombreDeImagen(texto)) {
          nombre = texto;
          nodoNombre.remove();
        }
      }

      const pie = document.createElement('figcaption');
      pie.setAttribute('contenteditable', 'true');
      pie.textContent = nombre;
      figura.appendChild(pie);
    });
  }

  function asegurarBotonesEliminarImagenes() {
    const editor = obtenerEditor();
    if (!editor) return;

    convertirImagenesAntiguasEnFiguras(editor);

    seleccionarTodos('figure.imagen-editor', editor).forEach((figura) => {
      if (figura.querySelector('[data-eliminar-imagen-editor]')) return;

      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'boton-eliminar-imagen-editor';
      boton.dataset.eliminarImagenEditor = '';
      boton.title = 'Eliminar fotografía';
      boton.setAttribute('aria-label', 'Eliminar fotografía');
      boton.textContent = '×';
      figura.insertBefore(boton, figura.firstChild);
    });
  }

  function manejarClickEditor(evento) {
    const boton = evento.target.closest('[data-eliminar-imagen-editor]');
    if (!boton) {
      configurarEnlaces();
      return;
    }

    evento.preventDefault();
    evento.stopPropagation();

    const figura = boton.closest('figure.imagen-editor');
    if (!figura) return;

    const nombre = figura.querySelector('figcaption')?.textContent?.trim() || 'esta fotografía';
    const confirmar = window.confirm(`¿Desea eliminar ${nombre}?`);
    if (!confirmar) return;

    const siguiente = figura.nextElementSibling;
    figura.remove();

    if (siguiente?.tagName === 'P' && !siguiente.textContent.trim()) {
      siguiente.remove();
    }

    notificarCambio();
  }

  function configurarEditor() {
    const editor = obtenerEditor();
    if (!editor) return;

    editor.setAttribute('contenteditable', 'true');
    editor.setAttribute('role', 'textbox');
    editor.setAttribute('aria-multiline', 'true');
    editor.setAttribute(
      'aria-label',
      'Anotación diaria de la Bitácora de Obra'
    );

    editor.addEventListener('mouseup', guardarSeleccion);
    editor.addEventListener('keyup', () => {
      guardarSeleccion();
      actualizarEstadoBotones();
      actualizarContador();
    });
    editor.addEventListener('input', () => {
      asegurarBotonesEliminarImagenes();
      actualizarContador();
    });
    editor.addEventListener('paste', manejarPegado);
    editor.addEventListener('dragover', (evento) => evento.preventDefault());
    editor.addEventListener('drop', manejarSoltar);
    editor.addEventListener('click', manejarClickEditor);
    asegurarBotonesEliminarImagenes();

    let normalizacionPendiente = false;
    const observadorImagenes = new MutationObserver(() => {
      if (normalizacionPendiente) return;
      normalizacionPendiente = true;
      queueMicrotask(() => {
        normalizacionPendiente = false;
        asegurarBotonesEliminarImagenes();
      });
    });
    observadorImagenes.observe(editor, { childList: true, subtree: true });

    document.addEventListener('selectionchange', () => {
      guardarSeleccion();
      actualizarEstadoBotones();
    });
  }

  function configurarAtajos() {
    document.addEventListener('keydown', (evento) => {
      const editor = obtenerEditor();
      if (!editor || !editor.contains(document.activeElement)) return;

      const control = evento.ctrlKey || evento.metaKey;
      if (!control) return;

      const tecla = evento.key.toLowerCase();

      const comandos = {
        b: 'bold',
        i: 'italic',
        u: 'underline'
      };

      if (comandos[tecla]) {
        evento.preventDefault();
        ejecutarComando(comandos[tecla]);
      }

      if (tecla === 'f') {
        evento.preventDefault();
        abrirBusqueda();
      }

      if (tecla === 'k') {
        evento.preventDefault();
        insertarEnlace();
      }
    });
  }

  function iniciar() {
    configurarEditor();
    configurarBotones();
    configurarEntradasArchivos();
    configurarBusqueda();
    configurarAtajos();
    actualizarContador();
    configurarEnlaces();

    document.dispatchEvent(new CustomEvent('bitacora:editor-listo'));
    console.info('Editor de la Bitácora de Obra inicializado.');
  }

  window.BitacoraEditor = Object.freeze({
    iniciar,
    ejecutarComando,
    insertarHTML,
    insertarEnlace,
    solicitarImagen,
    insertarImagenDesdeArchivo,
    insertarTabla,
    abrirBusqueda,
    cerrarBusqueda,
    buscarTexto,
    limpiarFormato,
    actualizarContador
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  } else {
    iniciar();
  }
})();