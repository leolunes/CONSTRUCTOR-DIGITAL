// ==============================
// CARGAR CATEGORÍAS
// ==============================

async function cargarCategorias(){

    try{

        // Leer archivo JSON
        const respuesta = await fetch('./data/categorias.json');

        // Convertir respuesta a JSON
        const categorias = await respuesta.json();

        // Mostrar categorías en pantalla
        mostrarCategorias(categorias);

    }catch(error){

        console.error('Error cargando categorías:', error);

    }

}

// ==============================
// MOSTRAR CATEGORÍAS
// ==============================

function mostrarCategorias(categorias){

    // Contenedor principal
    const container = document.getElementById('categorias-container');

    // Limpiar contenedor antes de pintar
    container.innerHTML = '';

    // Recorrer categorías
    categorias.forEach(categoria => {

        // Crear tarjeta
        const card = document.createElement('div');

        // Agregar clase CSS
        card.classList.add('categoria-card');

        // Contenido HTML
        card.innerHTML = `
        
            <h2>${categoria.nombre}</h2>

            <p>${categoria.descripcion}</p>

        `;

        // Evento click para abrir la categoría
        card.addEventListener('click', () => {

            window.location.href = `categoria.html?id=${categoria.id}`;

        });

        // Agregar tarjeta al contenedor
        container.appendChild(card);

    });

}

// ==============================
// INICIAR APP
// ==============================

cargarCategorias();