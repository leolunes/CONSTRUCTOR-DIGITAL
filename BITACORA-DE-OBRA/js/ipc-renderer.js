'use strict';

(() => {
  const api = window.electronAPI || null;

  async function llamar(nombre, ...args) {
    if (!api || typeof api[nombre] !== 'function') {
      console.warn(`Función Electron no disponible: ${nombre}`);
      return null;
    }
    return api[nombre](...args);
  }

  window.BitacoraIPC = Object.freeze({
    disponible: Boolean(api),
    abrirArchivo: (opciones = {}) => llamar('abrirArchivo', opciones),
    abrirRuta: (ruta = '') => llamar('abrirRuta', ruta),
    guardarPDFDesdeHTML: (opciones = {}) => llamar('guardarPDFDesdeHTML', opciones),
    guardarArchivo: (opciones = {}) => llamar('guardarArchivo', opciones),
    guardarArchivoBinario: (opciones = {}) => llamar('guardarArchivoBinario', opciones),
    seleccionarArchivos: (opciones = {}) => llamar('seleccionarArchivos', opciones),
    seleccionarCarpeta: (opciones = {}) => llamar('seleccionarCarpeta', opciones),
    imprimir: (opciones = {}) => llamar('imprimir', opciones),
    obtenerInformacionAplicacion: () => llamar('obtenerInformacionAplicacion'),
    listarObras: () => llamar('listarObras'),
    guardarObra: (obra = {}) => llamar('guardarObra', obra),
    eliminarObra: (id) => llamar('eliminarObra', id),
    seleccionarObra: (obra = {}) => llamar('seleccionarObra', obra),
    obtenerObraActiva: () => llamar('obtenerObraActiva'),
    listarFolios: (filtro = {}) => llamar('listarFolios', filtro),
    guardarFolio: (folio = {}) => llamar('guardarFolio', folio),
    eliminarFolio: (id) => llamar('eliminarFolio', id),
    seleccionarFolio: (folio = {}) => llamar('seleccionarFolio', folio),
    obtenerFolioActivo: () => llamar('obtenerFolioActivo'),
    obtenerNuevoConsecutivo: (obraId) => llamar('obtenerNuevoConsecutivo', obraId),
    listarContratistas: () => llamar('listarContratistas'),
    guardarContratista: (contratista = {}) => llamar('guardarContratista', contratista),
    eliminarContratista: (id) => llamar('eliminarContratista', id),
    obtenerConfiguracion: (opciones = {}) => llamar('obtenerConfiguracion', opciones),
    obtenerLogoEmpresa: (opciones = {}) => llamar('obtenerLogoEmpresa', opciones),
    guardarConfiguracion: (configuracion = {}, opciones = {}) => llamar('guardarConfiguracion', configuracion, opciones),
    seleccionarImagenesEvidencia: (opciones = {}) => llamar('seleccionarImagenesEvidencia', opciones),
    seleccionarAnexosEvidencia: (opciones = {}) => llamar('seleccionarAnexosEvidencia', opciones),
    leerImagenEvidencia: (imagen = {}) => llamar('leerImagenEvidencia', imagen),
    eliminarImagenEvidencia: (imagen = {}) => llamar('eliminarImagenEvidencia', imagen)
  });

  document.dispatchEvent(new CustomEvent('bitacora:ipc-listo', {
    detail: { disponible: Boolean(api) }
  }));
})();
