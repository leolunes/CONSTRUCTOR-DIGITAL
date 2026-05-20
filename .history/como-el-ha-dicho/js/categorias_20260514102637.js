// =====================================
// OBTENER ID DESDE LA URL
// =====================================

const parametros = new URLSearchParams(window.location.search);

const categoriaId = parametros.get('id');

// =====================================
// CARGAR DECLARACIONES
// =====================================

async function cargarDeclaraciones(){

    try{

        // =====================================
        // CARGAR DECLARACIONES
        // =====================================

        const respuesta = await fetch('./data/declaraciones.json');

        const declaraciones = await respuesta.json();

        // =====================================
        // FILTRAR POR CATEGORÍA
        // =====================================

        const filtradas = declaraciones.filter(
            declaracion => declaracion.categoria_id == categoriaId
        );

        // =====================================
        // MOSTRAR
        // =====================================

        mostrarDeclaraciones(filtradas);

        // =====================================
        // CARGAR NOMBRE DE CATEGORÍA
        // =====================================

        cargarNombreCategoria();

    }catch(error){

        console.error('Error cargando declaraciones:', error);

    }

}

// =====================================
// CARGAR NOMBRE DE LA CATEGORÍA
// =====================================

async function cargarNombreCategoria(){

    try{

        const respuesta = await fetch('./data/categorias.json');

        const categorias = await respuesta.json();

        const categoria = categorias.find(
            item => item.id == categoriaId
        );

        if(categoria){

            document.getElementById('titulo-categoria').innerText =
            categoria.nombre;

        }

    }catch(error){

        console.error('Error cargando categoría:', error);

    }

}

// =====================================
// MOSTRAR DECLARACIONES
// =====================================

function mostrarDeclaraciones(declaraciones){

    const container =
    document.getElementById('declaraciones-container');

    // =====================================
    // LIMPIAR CONTENEDOR
    // =====================================

    container.innerHTML = '';

    // =====================================
    // SI NO HAY DECLARACIONES
    // =====================================

    if(declaraciones.length === 0){

        container.innerHTML = `

            <div class="categoria-card">

                <h2>No hay declaraciones</h2>

                <p>
                    Esta categoría todavía no tiene contenido.
                </p>

            </div>

        `;

        return;

    }

    // =====================================
    // RECORRER DECLARACIONES
    // =====================================

    declaraciones.forEach(item => {

        const card = document.createElement('div');

        card.classList.add('categoria-card');

        // =====================================
        // RUTA AUTOMÁTICA DE AUDIO
        // =====================================

        let audioHTML = '';

        if(item.audio && item.audio !== ''){

            audioHTML = `

                <button class="audio-btn">

                    ▶ Escuchar Audio

                </button>

            `;

        }

        // =====================================
        // HTML TARJETA
        // =====================================

        card.innerHTML = `

            <h2>${item.titulo}</h2>

            <br>

            <p>

                <strong>
                    Como Él ha dicho:
                </strong>

                <br><br>

                "${item.como_el_ha_dicho}"

            </p>

            <br>

            <p>

                <strong>
                    ${item.referencia}
                </strong>

            </p>

            <br>

            <p>

                <strong>
                    Podemos decir confiadamente:
                </strong>

                <br><br>

                "${item.podemos_decir_confiadamente}"

            </p>

            <br>

            ${audioHTML}

        `;

        // =====================================
        // AGREGAR TARJETA
        // =====================================

        container.appendChild(card);

    });

}

// =====================================
// INICIAR
// =====================================

document.addEventListener('DOMContentLoaded', () => {

    cargarDeclaraciones();

});