'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/editor-profesional.js
   Módulo 3 — Editor profesional de anotaciones
   ========================================================= */

(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));

  const estado = {
    temporizadorBorrador: null,
    temporizadorGuardadoPersistente: null,
    pantallaCompleta: false,
    restauracionOfrecida: false,
    cambiosPendientes: false,
    guardando: false
  };

  const campoEditable = (etiqueta, placeholder = 'Escriba aquí...') => `
    <div class="campo-bloque">
      <strong>${etiqueta}</strong>
      <span
        class="valor-bloque"
        contenteditable="true"
        data-placeholder="${placeholder}"
      ></span>
    </div>
  `;

  const botonEliminarBloque = `
    <button
      class="eliminar-bloque-editor"
      type="button"
      contenteditable="false"
      title="Eliminar este bloque"
    >
      ×
    </button>
  `;


  const botonMinimizarBloque = `
    <button
      class="minimizar-bloque-editor"
      type="button"
      contenteditable="false"
      title="Minimizar este bloque"
      aria-label="Minimizar este bloque"
      aria-expanded="true"
    >
      −
    </button>
  `;

  const tiposBloque = Object.freeze({
    actividad: { selector: '.bloque-actividad', etiqueta: 'actividad ejecutada' },
    novedad: { selector: '.bloque-novedad', etiqueta: 'novedad' },
    seguridad: { selector: '.bloque-seguridad', etiqueta: 'bloque de seguridad' },
    calidad: { selector: '.bloque-calidad', etiqueta: 'bloque de calidad' },
    personal: { selector: '.bloque-personal', etiqueta: 'bloque de personal y equipos' },
    compromiso: { selector: '.bloque-compromiso', etiqueta: 'compromiso' }
  });

  const plantillas = Object.freeze({
    actividad: `
      <section
        class="bloque-editor bloque-actividad"
        contenteditable="false"
      >
        ${botonMinimizarBloque}
        ${botonEliminarBloque}
        <h3 contenteditable="false" data-titulo-base="ACTIVIDAD EJECUTADA">ACTIVIDAD EJECUTADA <span class="consecutivo-bloque"></span></h3>
        ${campoEditable('Frente de trabajo:', 'Ej.: Frente norte, placa del segundo piso')}
        ${campoEditable('Descripción:', 'Describa la actividad ejecutada')}
        ${campoEditable('Cantidad ejecutada:', 'Ej.: 30 m²')}
        ${campoEditable('Personal y equipos utilizados:', 'Indique cuadrilla, maquinaria y herramientas')}
        ${campoEditable('Observaciones:', 'Registre calidad, restricciones o comentarios')}
      </section>
      <p><br></p>
    `,

    novedad: `
      <section
        class="bloque-editor bloque-novedad"
        contenteditable="false"
      >
        ${botonMinimizarBloque}
        ${botonEliminarBloque}
        <h3 contenteditable="false">NOVEDAD DE OBRA</h3>
        ${campoEditable('Hora:', 'Ej.: 10:30 a. m.')}
        ${campoEditable('Descripción de la novedad:', 'Explique lo sucedido')}
        ${campoEditable('Afectación:', 'Indique la incidencia sobre plazo, costo o calidad')}
        ${campoEditable('Medida adoptada:', 'Acción ejecutada para atender la novedad')}
        ${campoEditable('Responsable:', 'Nombre o cargo responsable')}
      </section>
      <p><br></p>
    `,

    seguridad: `
      <section
        class="bloque-editor bloque-seguridad"
        contenteditable="false"
      >
        ${botonMinimizarBloque}
        ${botonEliminarBloque}
        <h3 contenteditable="false">SEGURIDAD Y SALUD EN EL TRABAJO</h3>
        ${campoEditable('Inspección o charla realizada:', 'Describa la actividad de seguridad')}
        ${campoEditable('Condición identificada:', 'Riesgo, acto o condición observada')}
        ${campoEditable('Acción preventiva o correctiva:', 'Medida aplicada')}
        ${campoEditable('Responsable y fecha de cierre:', 'Responsable y compromiso')}
      </section>
      <p><br></p>
    `,

    calidad: `
      <section
        class="bloque-editor bloque-calidad"
        contenteditable="false"
      >
        ${botonMinimizarBloque}
        ${botonEliminarBloque}
        <h3 contenteditable="false">CONTROL DE CALIDAD</h3>
        ${campoEditable('Elemento o actividad controlada:', 'Elemento inspeccionado')}
        ${campoEditable('Ensayo, verificación o inspección:', 'Control realizado')}
        ${campoEditable('Resultado:', 'Cumple / No cumple y resultado obtenido')}
        ${campoEditable('Documento de soporte:', 'Acta, ensayo, formato o certificado')}
        ${campoEditable('Observaciones:', 'Comentarios adicionales')}
      </section>
      <p><br></p>
    `,

    personal: `
      <section
        class="bloque-editor bloque-personal"
        contenteditable="false"
      >
        ${botonMinimizarBloque}
        ${botonEliminarBloque}
        <h3 contenteditable="false">PERSONAL Y EQUIPOS EN OBRA</h3>
        <table contenteditable="false">
          <thead>
            <tr>
              <th>Recurso</th>
              <th>Cantidad</th>
              <th>Horas</th>
              <th>Observación</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td contenteditable="true">Personal</td>
              <td contenteditable="true"></td>
              <td contenteditable="true"></td>
              <td contenteditable="true"></td>
            </tr>
            <tr>
              <td contenteditable="true">Equipo</td>
              <td contenteditable="true"></td>
              <td contenteditable="true"></td>
              <td contenteditable="true"></td>
            </tr>
          </tbody>
        </table>
      </section>
      <p><br></p>
    `,

    compromiso: `
      <section
        class="bloque-editor bloque-compromiso"
        contenteditable="false"
      >
        ${botonMinimizarBloque}
        ${botonEliminarBloque}
        <h3 contenteditable="false">COMPROMISO O INSTRUCCIÓN</h3>
        ${campoEditable('Compromiso:', 'Instrucción o actividad pendiente')}
        ${campoEditable('Responsable:', 'Nombre, cargo o entidad')}
        ${campoEditable('Fecha límite:', 'DD/MM/AAAA')}
        ${campoEditable('Estado:', 'Pendiente / En proceso / Cumplido')}
      </section>
      <p><br></p>
    `
  });

  function editor() {
    return $('#editor-contenido');
  }

  function contenidoPersistible() {
    const areaEditor = editor();
    if (!areaEditor) return { html: '', texto: '' };

    const copia = areaEditor.cloneNode(true);
    copia.querySelectorAll('.agregar-otro-bloque-editor, [data-eliminar-imagen-editor]')
      .forEach(boton => boton.remove());

    return {
      html: copia.innerHTML,
      texto: copia.innerText || copia.textContent || ''
    };
  }

  function claveBorrador() {
    const obraId =
      $('#selector-obra-activa')?.value ||
      'sin-obra';

    const folio =
      $('#numero-folio')?.value ||
      'sin-folio';

    return `bitacora-editor-borrador:${obraId}:${folio}`;
  }

  function cambiarEstado(texto, tipo = 'normal') {
    const elemento = $('#estado-editor');

    if (elemento) {
      elemento.textContent = texto;
      elemento.dataset.tipo = tipo;
    }
  }

  function actualizarEstadoBorrador(texto) {
    const elemento = $('#estado-borrador-editor');

    if (elemento) {
      elemento.textContent = texto;
    }
  }

  function insertarPlantilla(nombre, botonAgregar = null) {
    const html = plantillas[nombre];
    const areaEditor = editor();

    if (!html || !areaEditor) return;

    /*
      Los botones están fuera del contenteditable. Al hacer clic, el navegador
      puede perder la selección del editor; por eso insertamos en la posición
      activa únicamente cuando realmente pertenece al editor. En cualquier
      otro caso, agregamos el bloque al final de la anotación.
    */
    const seleccion = window.getSelection();
    const rangoActivo = seleccion?.rangeCount
      ? seleccion.getRangeAt(0)
      : null;
    const contenedorRango = rangoActivo?.commonAncestorContainer;
    const nodoContenedor = contenedorRango?.nodeType === Node.TEXT_NODE
      ? contenedorRango.parentNode
      : contenedorRango;
    const seleccionDentroEditor = Boolean(
      rangoActivo &&
      nodoContenedor &&
      (nodoContenedor === areaEditor || areaEditor.contains(nodoContenedor))
    );

    /*
      Las actividades ejecutadas siempre se agregan como bloques independientes
      al final del editor. De esta manera el usuario puede crear tantas como
      necesite, sin que una actividad quede anidada dentro de otra por tener el
      cursor ubicado en un campo existente.
    */
    if (botonAgregar?.classList.contains('agregar-otro-bloque-editor')) {
      botonAgregar.insertAdjacentHTML('beforebegin', html);
    }
    else if (nombre === 'actividad') {
      areaEditor.insertAdjacentHTML('beforeend', html);
    }
    else if (seleccionDentroEditor) {
      rangoActivo.deleteContents();

      const fragmento = rangoActivo.createContextualFragment(html);
      const ultimoNodo = fragmento.lastChild;
      rangoActivo.insertNode(fragmento);

      if (ultimoNodo) {
        rangoActivo.setStartAfter(ultimoNodo);
        rangoActivo.collapse(true);
        seleccion.removeAllRanges();
        seleccion.addRange(rangoActivo);
      }
    }
    else {
      areaEditor.insertAdjacentHTML('beforeend', html);
    }

    areaEditor.dispatchEvent(
      new Event('input', { bubbles: true })
    );

    normalizarBloquesExistentes();
    actualizarBotonesAgregar();
    areaEditor.focus();
    cambiarEstado('Bloque insertado');
  }


  function actualizarConsecutivosActividades() {
    const actividades = Array.from(
      editor()?.querySelectorAll('.bloque-actividad') || []
    );

    actividades.forEach((bloque, indice) => {
      const titulo = bloque.querySelector('h3');
      if (!titulo) return;

      titulo.dataset.tituloBase = 'ACTIVIDAD EJECUTADA';

      let consecutivo = titulo.querySelector('.consecutivo-bloque');
      if (!consecutivo) {
        titulo.textContent = 'ACTIVIDAD EJECUTADA ';
        consecutivo = document.createElement('span');
        consecutivo.className = 'consecutivo-bloque';
        titulo.appendChild(consecutivo);
      }

      const textoConsecutivo = `N.º ${indice + 1}`;
      if (consecutivo.textContent !== textoConsecutivo) {
        consecutivo.textContent = textoConsecutivo;
      }
      bloque.dataset.consecutivo = String(indice + 1);
    });
  }

  function actualizarBotonesAgregar() {
    const areaEditor = editor();
    if (!areaEditor) return;

    const tiposValidos = new Set(Object.keys(tiposBloque));

    areaEditor.querySelectorAll('.agregar-otro-bloque-editor')
      .forEach(boton => {
        if (!tiposValidos.has(boton.dataset.agregarOtroBloque)) {
          boton.remove();
        }
      });

    Object.entries(tiposBloque).forEach(([tipo, configuracion]) => {
      const bloques = Array.from(areaEditor.querySelectorAll(configuracion.selector));
      const ultimoBloque = bloques.at(-1);
      const existentes = Array.from(
        areaEditor.querySelectorAll(
          `.agregar-otro-bloque-editor[data-agregar-otro-bloque="${tipo}"]`
        )
      );

      if (!ultimoBloque) {
        existentes.forEach(boton => boton.remove());
        return;
      }

      let boton = existentes.shift();
      existentes.forEach(duplicado => duplicado.remove());

      if (!boton) {
        boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'agregar-otro-bloque-editor';
        boton.dataset.agregarOtroBloque = tipo;
        boton.contentEditable = 'false';
        boton.setAttribute('data-ui-temporal', 'true');
        boton.textContent = `+ Agregar otro ${configuracion.etiqueta}`;
        boton.title = `Agregar otro ${configuracion.etiqueta}`;
      }

      const separador = ultimoBloque.nextElementSibling;
      const referencia =
        separador?.tagName === 'P' && !separador.textContent.trim()
          ? separador
          : ultimoBloque;

      if (referencia.nextElementSibling !== boton) {
        referencia.insertAdjacentElement('afterend', boton);
      }
    });
  }

  function alternarBloqueMinimizado(boton) {
    const bloque = boton.closest('.bloque-editor');
    if (!bloque) return;

    const minimizado = bloque.classList.toggle('bloque-minimizado');

    boton.textContent = minimizado ? '+' : '−';
    boton.title = minimizado
      ? 'Expandir este bloque'
      : 'Minimizar este bloque';
    boton.setAttribute(
      'aria-label',
      minimizado ? 'Expandir este bloque' : 'Minimizar este bloque'
    );
    boton.setAttribute('aria-expanded', String(!minimizado));

    cambiarEstado(
      minimizado ? 'Bloque minimizado' : 'Bloque expandido',
      'normal'
    );
  }


  function normalizarBloquesExistentes() {
    editor()?.querySelectorAll('.bloque-editor')
      .forEach(bloque => {
        bloque.setAttribute(
          'contenteditable',
          'false'
        );

        if (!bloque.querySelector('.eliminar-bloque-editor')) {
          bloque.insertAdjacentHTML(
            'afterbegin',
            botonEliminarBloque
          );
        }

        if (!bloque.querySelector('.minimizar-bloque-editor')) {
          bloque.insertAdjacentHTML(
            'afterbegin',
            botonMinimizarBloque
          );
        }

        const botonMinimizar =
          bloque.querySelector('.minimizar-bloque-editor');
        const estaMinimizado =
          bloque.classList.contains('bloque-minimizado');

        if (botonMinimizar) {
          const simboloMinimizar = estaMinimizado ? '+' : '−';
          if (botonMinimizar.textContent.trim() !== simboloMinimizar) {
            botonMinimizar.textContent = simboloMinimizar;
          }
          botonMinimizar.title = estaMinimizado
            ? 'Expandir este bloque'
            : 'Minimizar este bloque';
          botonMinimizar.setAttribute(
            'aria-expanded',
            String(!estaMinimizado)
          );
        }

        bloque.querySelectorAll('h3')
          .forEach(titulo => {
            titulo.setAttribute(
              'contenteditable',
              'false'
            );
          });

        bloque.querySelectorAll('p')
          .forEach(parrafo => {
            const etiqueta =
              parrafo.querySelector('strong');

            if (!etiqueta) return;

            const textoEtiqueta =
              etiqueta.textContent || '';

            const textoActual =
              parrafo.textContent
                .replace(textoEtiqueta, '')
                .trim();

            const campo =
              document.createElement('div');

            campo.className = 'campo-bloque';

            const fuerte =
              document.createElement('strong');

            fuerte.textContent = textoEtiqueta;

            const valor =
              document.createElement('span');

            valor.className = 'valor-bloque';
            valor.contentEditable = 'true';
            valor.dataset.placeholder =
              'Escriba aquí...';
            valor.textContent = textoActual;

            campo.append(fuerte, valor);
            parrafo.replaceWith(campo);
          });

        bloque.querySelectorAll('td')
          .forEach(celda => {
            celda.setAttribute(
              'contenteditable',
              'true'
            );
          });
      });

    actualizarConsecutivosActividades();
    actualizarBotonesAgregar();
  }

  function eliminarBloque(boton) {
    const bloque =
      boton.closest('.bloque-editor');

    if (!bloque) return;

    const confirmar = window.confirm(
      '¿Eliminar este bloque del folio?'
    );

    if (!confirmar) return;

    bloque.remove();
    actualizarConsecutivosActividades();
    actualizarBotonesAgregar();

    editor()?.dispatchEvent(
      new Event('input', {
        bubbles: true
      })
    );

    cambiarEstado(
      'Bloque eliminado',
      'normal'
    );
  }

  function aplicarFormato(valor) {
    const editorAPI = window.BitacoraEditor;

    if (!editorAPI) return;

    const mapa = {
      p: '<p>',
      h2: '<h2>',
      h3: '<h3>',
      blockquote: '<blockquote>'
    };

    editorAPI.ejecutarComando(
      'formatBlock',
      mapa[valor] || '<p>'
    );
  }

  function alternarPantallaCompleta() {
    const seccion = editor()?.closest('.seccion-bitacora');
    const boton = $('#btn-editor-pantalla-completa');

    if (!seccion) return;

    estado.pantallaCompleta =
      !estado.pantallaCompleta;

    seccion.classList.toggle(
      'editor-pantalla-completa',
      estado.pantallaCompleta
    );

    document.body.classList.toggle(
      'editor-modal-activo',
      estado.pantallaCompleta
    );

    if (boton) {
      boton.textContent =
        estado.pantallaCompleta
          ? '🗗 Reducir'
          : '⛶ Ampliar';
    }

    editor()?.focus();
  }


  async function guardarAvancePersistente(mostrarMensaje = true) {
    if (estado.guardando) return false;

    const app = window.BitacoraApp;

    if (!app || typeof app.guardar !== 'function') {
      cambiarEstado(
        'Guardado no disponible',
        'error'
      );
      return false;
    }

    estado.guardando = true;
    cambiarEstado(
      'Guardando cambios...',
      'guardando'
    );

    try {
      const resultado = await app.guardar();

      if (resultado) {
        estado.cambiosPendientes = false;
        cambiarEstado(
          'Cambios guardados',
          'guardado'
        );

        if (mostrarMensaje) {
          const boton =
            $('#btn-guardar-avance-editor');

          if (boton) {
            const textoAnterior = boton.textContent;
            boton.textContent = '✓ Guardado';

            setTimeout(() => {
              boton.textContent = textoAnterior;
            }, 1400);
          }
        }
      }
      else {
        cambiarEstado(
          'No se pudo guardar',
          'error'
        );
      }

      return Boolean(resultado);
    }
    catch (error) {
      console.error(error);

      cambiarEstado(
        'Error al guardar',
        'error'
      );

      return false;
    }
    finally {
      estado.guardando = false;
    }
  }

  function programarGuardadoPersistente() {
    estado.cambiosPendientes = true;

    clearTimeout(
      estado.temporizadorGuardadoPersistente
    );

    estado.temporizadorGuardadoPersistente =
      setTimeout(
        () => guardarAvancePersistente(false),
        12000
      );
  }

  function guardarBorradorLocal() {
    const contenido = contenidoPersistible().html;

    const datos = {
      contenido,
      fecha: new Date().toISOString(),
      obraId:
        $('#selector-obra-activa')?.value ||
        null,
      folio:
        $('#numero-folio')?.value ||
        null
    };

    try {
      localStorage.setItem(
        claveBorrador(),
        JSON.stringify(datos)
      );

      actualizarEstadoBorrador(
        `Borrador local: ${new Date().toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit'
        })}`
      );
    }
    catch (error) {
      console.warn(
        'No fue posible guardar el borrador local:',
        error
      );
    }
  }

  function programarBorrador() {
    clearTimeout(estado.temporizadorBorrador);

    actualizarEstadoBorrador(
      'Guardando borrador...'
    );

    estado.temporizadorBorrador =
      setTimeout(guardarBorradorLocal, 700);
  }

  function restaurarBorradorLocal() {
    if (estado.restauracionOfrecida) return;

    estado.restauracionOfrecida = true;

    try {
      const guardado =
        localStorage.getItem(claveBorrador());

      if (!guardado) return;

      const datos = JSON.parse(guardado);
      const actual = editor()?.innerHTML?.trim() || '';
      const borrador = datos?.contenido?.replace(/<button[^>]*agregar-otro-bloque-editor[\s\S]*?<\/button>/gi, '').trim() || '';

      if (!borrador || borrador === actual) return;

      // Los borradores antiguos se descartan silenciosamente para evitar
      // que reaparezca información después de usar la opción Limpiar.
      localStorage.removeItem(claveBorrador());
      actualizarEstadoBorrador('Listo');
    }
    catch (error) {
      console.warn(
        'No fue posible restaurar el borrador:',
        error
      );
    }
  }

  function eliminarBorradorActual() {
    try {
      localStorage.removeItem(claveBorrador());
      actualizarEstadoBorrador(
        'Folio guardado'
      );
    }
    catch {
      // Sin acción.
    }
  }

  function limpiarHTMLPegado(evento) {
    const html =
      evento.clipboardData?.getData('text/html');

    if (!html) return;

    evento.preventDefault();

    const contenedor =
      document.createElement('div');

    contenedor.innerHTML = html;

    contenedor.querySelectorAll(
      'script, style, iframe, object, embed, meta, link'
    ).forEach(nodo => nodo.remove());

    contenedor.querySelectorAll('*')
      .forEach(nodo => {
        Array.from(nodo.attributes)
          .forEach(atributo => {
            if (
              atributo.name.startsWith('on') ||
              atributo.name === 'style'
            ) {
              nodo.removeAttribute(
                atributo.name
              );
            }
          });
      });

    const limpio = contenedor.innerHTML;

    if (window.BitacoraEditor?.insertarHTML) {
      window.BitacoraEditor.insertarHTML(limpio);
    }
  }

  function actualizarMetricas() {
    const contenido = editor()?.innerText || '';
    const palabras = contenido.trim()
      ? contenido.trim().split(/\s+/).length
      : 0;

    const contador = $('#contador-editor');

    if (contador) {
      contador.textContent =
        `${palabras} palabra${palabras === 1 ? '' : 's'} · ` +
        `${contenido.length} caracteres`;
    }
  }

  function vincularEventos() {
    $('[data-editor-formato]')?.addEventListener(
      'change',
      evento => aplicarFormato(
        evento.target.value
      )
    );

    $$('[data-plantilla-editor]')
      .forEach(boton => {
        boton.addEventListener(
          'click',
          () => insertarPlantilla(
            boton.dataset.plantillaEditor
          )
        );
      });

    $('#btn-editor-pantalla-completa')
      ?.addEventListener(
        'click',
        alternarPantallaCompleta
      );

    $('#btn-guardar-avance-editor')
      ?.addEventListener(
        'click',
        () => guardarAvancePersistente(true)
      );

    editor()?.addEventListener(
      'click',
      evento => {
        const botonAgregar = evento.target.closest('.agregar-otro-bloque-editor');

        if (botonAgregar) {
          evento.preventDefault();
          insertarPlantilla(
            botonAgregar.dataset.agregarOtroBloque,
            botonAgregar
          );
          return;
        }

        const botonMinimizar =
          evento.target.closest(
            '.minimizar-bloque-editor'
          );

        if (botonMinimizar) {
          evento.preventDefault();
          alternarBloqueMinimizado(botonMinimizar);
          return;
        }

        const boton =
          evento.target.closest(
            '.eliminar-bloque-editor'
          );

        if (boton) {
          evento.preventDefault();
          eliminarBloque(boton);
          return;
        }

        const campo =
          evento.target.closest(
            '.valor-bloque,[contenteditable="true"]'
          );

        campo?.focus();
      }
    );

    editor()?.addEventListener(
      'input',
      () => {
        programarBorrador();
        programarGuardadoPersistente();
        actualizarMetricas();
        cambiarEstado(
          'Cambios pendientes',
          'normal'
        );
      }
    );

    editor()?.addEventListener(
      'paste',
      limpiarHTMLPegado,
      { capture: true }
    );

    $('#selector-obra-activa')
      ?.addEventListener(
        'change',
        () => {
          estado.restauracionOfrecida = false;
          setTimeout(
            restaurarBorradorLocal,
            700
          );
        }
      );

    document.addEventListener(
      'bitacora:guardada',
      () => {
        eliminarBorradorActual();
        estado.cambiosPendientes = false;
        cambiarEstado(
          'Cambios guardados',
          'guardado'
        );
      }
    );

    window.addEventListener(
      'beforeunload',
      evento => {
        if (estado.cambiosPendientes) {
          evento.preventDefault();
          evento.returnValue = '';
        }
      }
    );

    document.addEventListener(
      'keydown',
      evento => {
        if (
          evento.ctrlKey &&
          evento.key.toLowerCase() === 's'
        ) {
          evento.preventDefault();
          guardarAvancePersistente(true);
        }

        if (
          evento.key === 'Escape' &&
          estado.pantallaCompleta
        ) {
          alternarPantallaCompleta();
        }
      }
    );
  }

  function iniciar() {
    vincularEventos();
    normalizarBloquesExistentes();
    actualizarMetricas();

    const observador = new MutationObserver(() => {
      normalizarBloquesExistentes();
    });

    if (editor()) {
      observador.observe(editor(), {
        childList: true,
        subtree: true
      });
    }

    setTimeout(
      restaurarBorradorLocal,
      900
    );

    cambiarEstado('Editor profesional listo');

    console.info(
      'Módulo 3 — Editor profesional inicializado.'
    );
  }

  window.BitacoraEditorProfesional =
    Object.freeze({
      iniciar,
      insertarPlantilla,
      obtenerContenidoPersistible: contenidoPersistible,
      alternarPantallaCompleta,
      guardarBorradorLocal,
      guardarAvancePersistente,
      restaurarBorradorLocal,
      eliminarBorradorActual
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
})();
