// =====================================
// CARGAR CATEGORÍAS
// =====================================

async function cargarCategorias(){

    try{

        const respuesta =
        await fetch('./data/categorias.json');

        const categorias =
        await respuesta.json();

        mostrarCategorias(categorias);

    }catch(error){

        console.error(
            'Error cargando categorías:',
            error
        );

    }

}

// =====================================
// ICONOS POR CATEGORÍA
// =====================================

function obtenerIconoCategoria(id){

    const iconos = {
        1: './assets/icons/profile.png',
        2: './assets/icons/favorite.png',
        3: './assets/icons/search.png',
        4: './assets/icons/home.png',
        5: './assets/icons/favorite.png',
        6: './assets/icons/profile.png',
        7: './assets/icons/play.png',
        8: './assets/icons/back.png'
    };

    return iconos[id] || './assets/icons/home.png';

}

// =====================================
// MOSTRAR CATEGORÍAS
// =====================================

function mostrarCategorias(categorias){

    const container =
    document.getElementById(
        'categorias-container'
    );

    container.innerHTML = '';

    categorias.forEach(categoria => {

        const card =
        document.createElement('div');

        card.classList.add(
            'categoria-card'
        );

        const icono =
        obtenerIconoCategoria(
            categoria.id
        );

        card.innerHTML = `

            <div class="card-icon">

                <img
                src="${icono}"
                alt="${categoria.nombre}">

            </div>

            <h2>
                ${categoria.nombre}
            </h2>

            <p>
                ${categoria.descripcion}
            </p>

        `;

        card.addEventListener('click', () => {

            window.location.href =
            `categorias.html?id=${categoria.id}`;

        });

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