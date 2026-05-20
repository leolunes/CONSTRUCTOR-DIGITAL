// =====================================
// CONFIGURACIÓN REAL
// Victoriosos en Cristo
// =====================================

// Claves de almacenamiento
const CONFIG_KEY = 'victoriosos_configuracion';

// Valores por defecto
const CONFIG_DEFAULT = {
    recordatorioActivo: false,
    horaRecordatorio: '07:00',
    modoOscuro: false,
    sonidoAutomatico: false
};

// Elementos
const btnVolver = document.getElementById('btnVolver');

const recordatorioActivo = document.getElementById('recordatorioActivo');
const horaRecordatorio = document.getElementById('horaRecordatorio');
const bloqueHoraRecordatorio = document.getElementById('bloqueHoraRecordatorio');
const textoRecordatorio = document.getElementById('textoRecordatorio');

const modoOscuro = document.getElementById('modoOscuro');
const sonidoAutomatico = document.getElementById('sonidoAutomatico');

const btnGuardarConfig = document.getElementById('btnGuardarConfig');
const btnRestablecerConfig = document.getElementById('btnRestablecerConfig');
const estadoConfig = document.getElementById('estadoConfig');

// =====================================
// INICIAR
// =====================================

document.addEventListener('DOMContentLoaded', () => {
    cargarConfiguracion();
    prepararEventos();
});

// =====================================
// EVENTOS
// =====================================

function prepararEventos() {

    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            window.history.back();
        });
    }

    if (recordatorioActivo) {
        recordatorioActivo.addEventListener('change', () => {
            actualizarVistaRecordatorio();
            guardarConfiguracion();
        });
    }

    if (horaRecordatorio) {
        horaRecordatorio.addEventListener('change', () => {
            guardarConfiguracion();
            actualizarTextoRecordatorio();
        });
    }

    if (modoOscuro) {
        modoOscuro.addEventListener('change', () => {
            aplicarModoOscuro(modoOscuro.checked);
            guardarConfiguracion();
        });
    }

    if (sonidoAutomatico) {
        sonidoAutomatico.addEventListener('change', () => {
            guardarConfiguracion();
        });
    }

    if (btnGuardarConfig) {
        btnGuardarConfig.addEventListener('click', () => {
            guardarConfiguracion();
            mostrarEstado('Configuración guardada correctamente.');
        });
    }

    if (btnRestablecerConfig) {
        btnRestablecerConfig.addEventListener('click', () => {
            restablecerConfiguracion();
        });
    }
}

// =====================================
// CARGAR CONFIGURACIÓN
// =====================================

function cargarConfiguracion() {

    const config = obtenerConfiguracion();

    if (recordatorioActivo) {
        recordatorioActivo.checked = Boolean(config.recordatorioActivo);
    }

    if (horaRecordatorio) {
        horaRecordatorio.value = config.horaRecordatorio || CONFIG_DEFAULT.horaRecordatorio;
    }

    if (modoOscuro) {
        modoOscuro.checked = Boolean(config.modoOscuro);
    }

    if (sonidoAutomatico) {
        sonidoAutomatico.checked = Boolean(config.sonidoAutomatico);
    }

    aplicarModoOscuro(Boolean(config.modoOscuro));
    actualizarVistaRecordatorio();
    actualizarTextoRecordatorio();
}

// =====================================
// OBTENER CONFIGURACIÓN
// =====================================

function obtenerConfiguracion() {

    try {
        const guardado = localStorage.getItem(CONFIG_KEY);

        if (!guardado) {
            return { ...CONFIG_DEFAULT };
        }

        const config = JSON.parse(guardado);

        return {
            ...CONFIG_DEFAULT,
            ...config
        };

    } catch (error) {

        console.warn('No se pudo leer la configuración:', error);
        return { ...CONFIG_DEFAULT };
    }
}

// =====================================
// GUARDAR CONFIGURACIÓN
// =====================================

function guardarConfiguracion() {

    const config = {
        recordatorioActivo: recordatorioActivo ? recordatorioActivo.checked : false,
        horaRecordatorio: horaRecordatorio ? horaRecordatorio.value : CONFIG_DEFAULT.horaRecordatorio,
        modoOscuro: modoOscuro ? modoOscuro.checked : false,
        sonidoAutomatico: sonidoAutomatico ? sonidoAutomatico.checked : false
    };

    try {

        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));

        aplicarModoOscuro(config.modoOscuro);
        actualizarTextoRecordatorio();
        mostrarEstado('Configuración guardada correctamente.');

    } catch (error) {

        console.error('Error guardando configuración:', error);
        mostrarEstado('No se pudo guardar la configuración.', true);
    }
}

// =====================================
// RESTABLECER CONFIGURACIÓN
// =====================================

function restablecerConfiguracion() {

    localStorage.setItem(CONFIG_KEY, JSON.stringify(CONFIG_DEFAULT));

    if (recordatorioActivo) {
        recordatorioActivo.checked = CONFIG_DEFAULT.recordatorioActivo;
    }

    if (horaRecordatorio) {
        horaRecordatorio.value = CONFIG_DEFAULT.horaRecordatorio;
    }

    if (modoOscuro) {
        modoOscuro.checked = CONFIG_DEFAULT.modoOscuro;
    }

    if (sonidoAutomatico) {
        sonidoAutomatico.checked = CONFIG_DEFAULT.sonidoAutomatico;
    }

    aplicarModoOscuro(false);
    actualizarVistaRecordatorio();
    actualizarTextoRecordatorio();

    mostrarEstado('Configuración restablecida.');
}

// =====================================
// MODO OSCURO
// =====================================

function aplicarModoOscuro(activo) {

    if (activo) {
        document.body.classList.add('modo-oscuro');
        document.documentElement.classList.add('modo-oscuro');
    } else {
        document.body.classList.remove('modo-oscuro');
        document.documentElement.classList.remove('modo-oscuro');
    }
}

// =====================================
// RECORDATORIO
// =====================================

function actualizarVistaRecordatorio() {

    if (!bloqueHoraRecordatorio || !recordatorioActivo) {
        return;
    }

    if (recordatorioActivo.checked) {
        bloqueHoraRecordatorio.classList.remove('oculto-config');
    } else {
        bloqueHoraRecordatorio.classList.add('oculto-config');
    }

    actualizarTextoRecordatorio();
}

function actualizarTextoRecordatorio() {

    if (!textoRecordatorio || !horaRecordatorio || !recordatorioActivo) {
        return;
    }

    if (!recordatorioActivo.checked) {
        textoRecordatorio.textContent = 'El recordatorio diario está desactivado.';
        return;
    }

    const hora = horaRecordatorio.value || CONFIG_DEFAULT.horaRecordatorio;

    textoRecordatorio.textContent = `Tu recordatorio diario quedó configurado para las ${hora}.`;
}

// =====================================
// ESTADO VISUAL
// =====================================

function mostrarEstado(mensaje, esError = false) {

    if (!estadoConfig) {
        return;
    }

    estadoConfig.textContent = mensaje;

    if (esError) {
        estadoConfig.classList.add('error');
    } else {
        estadoConfig.classList.remove('error');
    }

    estadoConfig.classList.add('visible');

    setTimeout(() => {
        estadoConfig.classList.remove('visible');
    }, 2200);
}

// =====================================
// FUNCIONES DISPONIBLES PARA OTRAS PÁGINAS
// =====================================

window.VictoriososConfig = {
    obtenerConfiguracion,
    guardarConfiguracion,
    aplicarModoOscuro
};
