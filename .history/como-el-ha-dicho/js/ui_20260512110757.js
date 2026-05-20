// =====================================
// MOSTRAR MENSAJE
// =====================================

function mostrarMensaje(texto){

    alert(texto);

}

// =====================================
// MOSTRAR LOADER
// =====================================

function mostrarLoader(containerId){

    const container = document.getElementById(containerId);

    container.innerHTML = `

        <div class="categoria-card">

            <h2>Cargando...</h2>

            <p>
                Espera un momento
            </p>

        </div>

    `;

}

// =====================================
// MOSTRAR ERROR
// =====================================

function mostrarError(containerId, mensaje){

    const container = document.getElementById(containerId);

    container.innerHTML = `

        <div class="categoria-card">

            <h2>Error</h2>

            <p>
                ${mensaje}
            </p>

        </div>

    `;

}

// =====================================
// CREAR TARJETA SIMPLE
// =====================================

function crearCard(titulo, descripcion){

    return `

        <div class="categoria-card">

            <h2>${titulo}</h2>

            <p>${descripcion}</p>

        </div>

    `;

}

// =====================================
// EXPORTAR FUNCIONES
// =====================================

window.uiApp = {

    mostrarMensaje,
    mostrarLoader,
    mostrarError,
    crearCard

};