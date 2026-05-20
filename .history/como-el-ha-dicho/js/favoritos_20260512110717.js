// =====================================
// OBTENER FAVORITOS
// =====================================

function obtenerFavoritos(){

    const favoritos = localStorage.getItem('favoritos');

    if(!favoritos){

        return [];

    }

    return JSON.parse(favoritos);

}

// =====================================
// MOSTRAR FAVORITOS
// =====================================

function mostrarFavoritos(){

    // Contenedor
    const container = document.getElementById('favoritos-container');

    // Obtener favoritos
    const favoritos = obtenerFavoritos();

    // Limpiar
    container.innerHTML = '';

    // Validar si hay favoritos
    if(favoritos.length === 0){

        container.innerHTML = `

            <div class="categoria-card">

                <h2>No tienes favoritos</h2>

                <p>
                    Guarda declaraciones para verlas aquí.
                </p>

            </div>

        `;

        return;

    }

    // Recorrer favoritos
    favoritos.forEach(item => {

        // Crear tarjeta
        const card = document.createElement('div');

        card.classList.add('categoria-card');

        // HTML
        card.innerHTML = `

            <h2>${item.titulo}</h2>

            <br>

            <p>

                <strong>Como Él ha dicho:</strong>

                <br><br>

                "${item.como_el_ha_dicho}"

            </p>

            <br>

            <p>

                <strong>${item.referencia}</strong>

            </p>

            <br>

            <p>

                <strong>Podemos decir confiadamente:</strong>

                <br><br>

                "${item.podemos_decir_confiadamente}"

            </p>

            <br>

            <button class="btn-eliminar" data-id="${item.id}">

                Eliminar favorito

            </button>

        `;

        // Agregar
        container.appendChild(card);

    });

    // Eventos botones eliminar
    agregarEventosEliminar();

}

// =====================================
// ELIMINAR FAVORITO
// =====================================

function agregarEventosEliminar(){

    const botones = document.querySelectorAll('.btn-eliminar');

    botones.forEach(boton => {

        boton.addEventListener('click', () => {

            const id = Number(boton.dataset.id);

            eliminarFavorito(id);

        });

    });

}

// =====================================
// FUNCIÓN ELIMINAR
// =====================================

function eliminarFavorito(id){

    const favoritos = obtenerFavoritos();

    const nuevosFavoritos = favoritos.filter(
        item => item.id !== id
    );

    localStorage.setItem(
        'favoritos',
        JSON.stringify(nuevosFavoritos)
    );

    mostrarFavoritos();

}

// =====================================
// INICIAR
// =====================================

mostrarFavoritos();