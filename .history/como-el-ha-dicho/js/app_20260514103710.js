// =====================================
// CARGAR CATEGORÍAS
// =====================================

async function cargarCategorias(){

    try{

        // Leer categorías
        const respuesta =
        await fetch('./data/categorias.json');

        // Convertir a JSON
        const categorias =
        await respuesta.json();

        // Mostrar categorías
        mostrarCategorias(categorias);

    }catch(error){

        console.error(
            'Error cargando categorías:',
            error
        );

    }

}

// =====================================
// MOSTRAR CATEGORÍAS
// =====================================

function mostrarCategorias(categorias){

    // Contenedor
    const container =
    document.getElementById(
        'categorias-container'
    );

    // Limpiar
    container.innerHTML = '';

    // Recorrer categorías
    categorias.forEach(categoria => {

        // Crear tarjeta
        const card =
        document.createElement('div');

        // Clase CSS
        card.classList.add(
            'categoria-card'
        );

        // HTML tarjeta
        card.innerHTML = `

            <h2>
                ${categoria.nombre}
            </h2>

            <p>
                ${categoria.descripcion}
            </p>

        `;

        // =====================================
        // ABRIR CATEGORÍA
        // =====================================

        card.addEventListener('click', () => {

            window.location.href =
            `categorias.html?id=${categoria.id}`;

        });

        // Agregar al contenedor
        container.appendChild(card);

    });

}

// =====================================
// INICIAR APP
// =====================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        cargarCategorias();

    }
);