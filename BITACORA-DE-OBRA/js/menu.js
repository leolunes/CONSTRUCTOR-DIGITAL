'use strict';

/* =========================================================
   BITÁCORA DE OBRA
   Archivo: js/menu.js
   Propósito: navegación principal de la aplicación
   ========================================================= */

(() => {

  const SELECTORES = Object.freeze({
    botones: '[data-vista]',
    paneles: '[data-panel]',
    titulo: '#titulo-vista'
  });

  let vistaActual = 'bitacora';

  function $(selector){
    return document.querySelector(selector);
  }

  function $$(selector){
    return [...document.querySelectorAll(selector)];
  }

  function actualizarTitulo(vista){
    const titulo = $(SELECTORES.titulo);
    if(!titulo) return;

    const boton = document.querySelector(
      `${SELECTORES.botones}[data-vista="${vista}"]`
    );

    titulo.textContent = boton?.dataset.titulo || boton?.textContent?.trim() || 'Bitácora de Obra';
  }

  function activarVista(vista){

    vistaActual = vista;

    $$(SELECTORES.paneles).forEach(panel=>{
      panel.hidden = panel.dataset.panel !== vista;
      panel.classList.toggle('activo', panel.dataset.panel===vista);
    });

    $$(SELECTORES.botones).forEach(btn=>{
      const activa = btn.dataset.vista===vista;
      btn.classList.toggle('activo',activa);
      btn.setAttribute('aria-current',activa?'page':'false');
    });

    actualizarTitulo(vista);

    window.BitacoraEstado?.actualizar?.(
      'sesion.vistaActual',
      vista,
      {
        origen:'menu',
        marcarCambios:false
      }
    );

    document.dispatchEvent(
      new CustomEvent(
        'bitacora:vista-cambiada',
        {detail:{vista}}
      )
    );
  }

  function registrarEventos(){

    $$(SELECTORES.botones).forEach(boton=>{
      boton.addEventListener('click',()=>{
        activarVista(boton.dataset.vista);
      });
    });

    document.addEventListener(
      'keydown',
      (e)=>{
        if(e.altKey && e.key>='1' && e.key<='9'){
          const botones=$$(SELECTORES.botones);
          const indice=Number(e.key)-1;
          if(botones[indice]){
            e.preventDefault();
            activarVista(botones[indice].dataset.vista);
          }
        }
      }
    );
  }

  function iniciar(){

    registrarEventos();

    const inicial =
      window.BitacoraEstado?.obtener?.('sesion.vistaActual') ||
      vistaActual;

    activarVista(inicial);

    document.dispatchEvent(
      new CustomEvent('bitacora:menu-listo')
    );

    console.info('Menú principal inicializado.');
  }

  window.BitacoraMenu = Object.freeze({
    iniciar,
    activarVista,
    obtenerVistaActual:()=>vistaActual
  });

  if(document.readyState==='loading'){
    document.addEventListener(
      'DOMContentLoaded',
      iniciar,
      {once:true}
    );
  }else{
    iniciar();
  }

})();

/* =========================================================
   MENÚ SUPERIOR DESPLEGABLE — v1.34
   Activa Archivo, Editar, Ver y Ayuda sin duplicar la lógica
   existente: las acciones principales reutilizan los botones
   ya probados de la barra de herramientas.
   ========================================================= */

(() => {
  'use strict';

  const definiciones = {
    archivo: [
      ['nuevo', '📄 Nuevo folio', 'Ctrl+N'],
      ['abrir', '📂 Abrir folio', 'Ctrl+O'],
      ['guardar', '💾 Guardar', 'Ctrl+S'],
      ['separador'],
      ['word', '🟦 Exportar a Word'],
      ['pdf', '📕 Exportar a PDF'],
      ['zip', '🗜 Exportar ZIP'],
      ['imprimir', '🖨 Imprimir', 'Ctrl+P'],
      ['separador'],
      ['salir', '✖ Salir']
    ],
    editar: [
      ['deshacer', '↶ Deshacer', 'Ctrl+Z'],
      ['rehacer', '↷ Rehacer', 'Ctrl+Y'],
      ['separador'],
      ['cortar', '✂ Cortar', 'Ctrl+X'],
      ['copiar', '📋 Copiar', 'Ctrl+C'],
      ['pegar', '📌 Pegar', 'Ctrl+V'],
      ['seleccionar-todo', 'Seleccionar todo', 'Ctrl+A']
    ],
    ver: [
      ['folios', '📚 Visualizar folios'],
      ['informe', '📘 Informe consolidado'],
      ['obras', '🏗 Administrar obras'],
      ['contratistas', '👷 Administrar contratistas'],
      ['configuracion', '⚙ Configuración'],
      ['separador'],
      ['zoom-mas', '🔍 Aumentar zoom', 'Ctrl++'],
      ['zoom-menos', '🔎 Reducir zoom', 'Ctrl+-'],
      ['zoom-restablecer', '↺ Restablecer zoom', 'Ctrl+0'],
      ['pantalla-completa', '⛶ Pantalla completa', 'F11']
    ],
    ayuda: [
      ['guia', '❓ Guía rápida'],
      ['atajos', '⌨ Atajos de teclado'],
      ['acerca', 'ℹ Acerca de Bitácora de Obra']
    ]
  };

  let menuAbierto = null;
  let zoomActual = 1;

  const $ = (selector) => document.querySelector(selector);

  function pulsar(selector) {
    const boton = $(selector);
    if (!boton) return false;
    boton.click();
    return true;
  }

  function cerrarMenus() {
    document.querySelectorAll('.menu-desplegable.activo').forEach((menu) => {
      menu.classList.remove('activo');
      menu.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('.menu-principal [data-menu].activo').forEach((boton) => {
      boton.classList.remove('activo');
      boton.setAttribute('aria-expanded', 'false');
    });
    menuAbierto = null;
  }

  function crearMenus() {
    const nav = $('.menu-principal');
    if (!nav || $('#menus-desplegables')) return;

    const contenedor = document.createElement('div');
    contenedor.id = 'menus-desplegables';
    contenedor.className = 'menus-desplegables';

    Object.entries(definiciones).forEach(([nombre, items]) => {
      const botonPrincipal = nav.querySelector(`[data-menu="${nombre}"]`);
      if (!botonPrincipal) return;

      botonPrincipal.setAttribute('aria-haspopup', 'menu');
      botonPrincipal.setAttribute('aria-expanded', 'false');

      const menu = document.createElement('div');
      menu.className = 'menu-desplegable';
      menu.dataset.menuDesplegable = nombre;
      menu.setAttribute('role', 'menu');
      menu.setAttribute('aria-hidden', 'true');

      items.forEach(([accion, etiqueta, atajo]) => {
        if (accion === 'separador') {
          const separador = document.createElement('div');
          separador.className = 'menu-desplegable__separador';
          separador.setAttribute('role', 'separator');
          menu.appendChild(separador);
          return;
        }

        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'menu-desplegable__item';
        item.dataset.accionMenu = accion;
        item.setAttribute('role', 'menuitem');
        item.innerHTML = `<span>${etiqueta}</span>${atajo ? `<kbd>${atajo}</kbd>` : ''}`;
        menu.appendChild(item);
      });

      contenedor.appendChild(menu);

      botonPrincipal.addEventListener('click', (evento) => {
        evento.stopPropagation();
        const estabaAbierto = menu.classList.contains('activo');
        cerrarMenus();
        if (estabaAbierto) return;

        const rect = botonPrincipal.getBoundingClientRect();
        menu.style.left = `${Math.max(6, rect.left)}px`;
        menu.style.top = `${rect.bottom + 2}px`;
        menu.classList.add('activo');
        menu.setAttribute('aria-hidden', 'false');
        botonPrincipal.classList.add('activo');
        botonPrincipal.setAttribute('aria-expanded', 'true');
        menuAbierto = menu;
        menu.querySelector('button')?.focus();
      });
    });

    document.body.appendChild(contenedor);
  }

  function comandoEdicion(comando) {
    const activo = document.activeElement;
    if (!activo) return;
    activo.focus();
    try {
      document.execCommand(comando, false, null);
    } catch (error) {
      console.warn(`No fue posible ejecutar ${comando}.`, error);
    }
  }

  async function pegar() {
    const activo = document.activeElement;
    try {
      const texto = await navigator.clipboard.readText();
      activo?.focus();
      if (activo && (activo.tagName === 'INPUT' || activo.tagName === 'TEXTAREA')) {
        const inicio = activo.selectionStart ?? activo.value.length;
        const fin = activo.selectionEnd ?? activo.value.length;
        activo.setRangeText(texto, inicio, fin, 'end');
        activo.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        document.execCommand('insertText', false, texto);
      }
    } catch {
      comandoEdicion('paste');
    }
  }

  function ajustarZoom(valor) {
    zoomActual = Math.min(1.5, Math.max(0.75, valor));
    document.documentElement.style.zoom = String(zoomActual);
  }

  function mostrarDialogo(titulo, contenido) {
    let dialogo = $('#dialogo-menu-superior');
    if (!dialogo) {
      dialogo = document.createElement('dialog');
      dialogo.id = 'dialogo-menu-superior';
      dialogo.className = 'dialogo-menu-superior';
      dialogo.innerHTML = `
        <div class="dialogo-menu-superior__cabecera">
          <h2></h2>
          <button type="button" data-cerrar-dialogo aria-label="Cerrar">×</button>
        </div>
        <div class="dialogo-menu-superior__contenido"></div>
        <div class="dialogo-menu-superior__pie">
          <button type="button" class="boton boton-primario" data-cerrar-dialogo>Cerrar</button>
        </div>`;
      document.body.appendChild(dialogo);
      dialogo.addEventListener('click', (e) => {
        if (e.target === dialogo || e.target.closest('[data-cerrar-dialogo]')) dialogo.close();
      });
    }
    dialogo.querySelector('h2').textContent = titulo;
    dialogo.querySelector('.dialogo-menu-superior__contenido').innerHTML = contenido;
    if (typeof dialogo.showModal === 'function') dialogo.showModal();
  }

  async function ejecutarAccion(accion) {
    cerrarMenus();
    switch (accion) {
      case 'nuevo': pulsar('#btn-nuevo'); break;
      case 'abrir': pulsar('#btn-abrir'); break;
      case 'guardar': pulsar('#btn-guardar'); break;
      case 'word': pulsar('#btn-word'); break;
      case 'pdf': pulsar('#btn-pdf'); break;
      case 'zip': pulsar('#btn-zip'); break;
      case 'imprimir': pulsar('#btn-imprimir'); break;
      case 'salir': window.close(); break;
      case 'deshacer': comandoEdicion('undo'); break;
      case 'rehacer': comandoEdicion('redo'); break;
      case 'cortar': comandoEdicion('cut'); break;
      case 'copiar': comandoEdicion('copy'); break;
      case 'pegar': await pegar(); break;
      case 'seleccionar-todo': comandoEdicion('selectAll'); break;
      case 'folios': pulsar('#btn-historial'); break;
      case 'informe': pulsar('#btn-informe-consolidado'); break;
      case 'obras': pulsar('#btn-obras'); break;
      case 'contratistas': window.location.href = './contratistas.html'; break;
      case 'configuracion': window.location.href = './configuracion.html'; break;
      case 'zoom-mas': ajustarZoom(zoomActual + 0.1); break;
      case 'zoom-menos': ajustarZoom(zoomActual - 0.1); break;
      case 'zoom-restablecer': ajustarZoom(1); break;
      case 'pantalla-completa':
        if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
        else await document.exitFullscreen?.();
        break;
      case 'guia':
        mostrarDialogo('Guía rápida', `
          <p><strong>1.</strong> Seleccione la obra activa en la barra superior.</p>
          <p><strong>2.</strong> Use <b>Nuevo</b> para crear un folio y diligencie la información.</p>
          <p><strong>3.</strong> Inserte actividades, novedades, seguridad, calidad, personal y compromisos.</p>
          <p><strong>4.</strong> Agregue fotografías y anexos, firme en pantalla y pulse <b>Guardar</b>.</p>
          <p><strong>5.</strong> Consulte los folios o genere el informe consolidado para la interventoría.</p>`);
        break;
      case 'atajos':
        mostrarDialogo('Atajos de teclado', `
          <table class="tabla-atajos"><tbody>
            <tr><th>Ctrl + N</th><td>Nuevo folio</td></tr>
            <tr><th>Ctrl + O</th><td>Abrir folio</td></tr>
            <tr><th>Ctrl + S</th><td>Guardar</td></tr>
            <tr><th>Ctrl + P</th><td>Imprimir</td></tr>
            <tr><th>Ctrl + Z / Ctrl + Y</th><td>Deshacer / Rehacer</td></tr>
            <tr><th>Ctrl + 0</th><td>Restablecer zoom</td></tr>
            <tr><th>F11</th><td>Pantalla completa</td></tr>
          </tbody></table>`);
        break;
      case 'acerca':
        mostrarDialogo('Acerca de Bitácora de Obra', `
          <p><strong>BITÁCORA DE OBRA</strong></p>
          <p>Aplicación de escritorio para administrar obras, folios diarios, evidencias, anexos, firmas e informes.</p>
          <p>Versión funcional v1.34.</p>`);
        break;
    }
  }

  function registrarEventos() {
    document.addEventListener('click', (e) => {
      const item = e.target.closest('[data-accion-menu]');
      if (item) {
        e.preventDefault();
        ejecutarAccion(item.dataset.accionMenu);
        return;
      }
      if (menuAbierto && !e.target.closest('.menu-desplegable') && !e.target.closest('[data-menu]')) cerrarMenus();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cerrarMenus();
      if (e.key === 'F11') {
        e.preventDefault();
        ejecutarAccion('pantalla-completa');
      }
      if (!e.ctrlKey) return;
      const tecla = e.key.toLowerCase();
      const mapa = { n: 'nuevo', o: 'abrir', s: 'guardar', p: 'imprimir', '0': 'zoom-restablecer' };
      if (mapa[tecla]) {
        e.preventDefault();
        ejecutarAccion(mapa[tecla]);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        ejecutarAccion('zoom-mas');
      } else if (e.key === '-') {
        e.preventDefault();
        ejecutarAccion('zoom-menos');
      }
    });
  }

  function iniciarMenuSuperior() {
    crearMenus();
    registrarEventos();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarMenuSuperior, { once: true });
  } else {
    iniciarMenuSuperior();
  }
})();
