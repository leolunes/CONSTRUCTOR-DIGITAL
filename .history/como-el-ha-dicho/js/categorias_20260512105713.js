// =====================================
// OBTENER ID DE LA URL
// =====================================

const parametros = new URLSearchParams(window.location.search);

const categoriaId = parametros.get('id');

// =====================================
// CARGAR DECLARACIONES
// =====================================

async function cargarDeclaraciones(){

    try{

        const respuesta = await fetch('./data/declaraciones.json');

        const declaraciones = await respuesta.json();

        // Filtrar declaraciones
        const filtradas = declaraciones.filter(
            declaracion => declaracion.categoria_id == categoriaId
        );

        mostrarDeclaraciones(filtradas);

    }catch(error){

        console.error('Error cargando declaraciones:', error);

    }

}

// =====================================
// MOSTRAR DECLARACIONES
// =====================================

function mostrarDeclaraciones(declaraciones){

    const container = document.getElementById('declaraciones-container');

    if(declaraciones.length === 0){

        container.innerHTML = `
            <p>No hay declaraciones disponibles.</p>
        `;

        return;

    }

    declaraciones.forEach(item => {

        const card = document.createElement('div');

        card.classList.add('categoria-card');

        card.innerHTML = `

            <h2>${item.titulo}</h2>

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

        `;

        container.appendChild(card);

    });

}

// =====================================
// INICIAR
// =====================================

cargarDeclaraciones();