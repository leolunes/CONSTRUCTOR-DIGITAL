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

        1:'./assets/icons/shield.png',
        2:'./assets/icons/cross.png',
        3:'./assets/icons/pray.png',
        4:'./assets/icons/dove.png',
        5:'./assets/icons/heart.png',
        6:'./assets/icons/rings.png',
        7:'./assets/icons/chart.png',
        8:'./assets/icons/direction.png',
        9:'./assets/icons/crown.png',
        10:'./assets/icons/smile.png',
        11:'./assets/icons/freedom.png',
        12:'./assets/icons/bible.png',
        13:'./assets/icons/lamp.png',
        14:'./assets/icons/youth.png',
        15:'./assets/icons/protection.png'

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

            <div class="card-info">

                <h2>
                    ${categoria.nombre}
                </h2>

                <p>
                    ${categoria.descripcion}
                </p>

            </div>

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