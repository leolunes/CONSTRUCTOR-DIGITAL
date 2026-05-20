// =====================================
// BUSCAR DECLARACIONES
// =====================================

async function buscarDeclaraciones(textoBusqueda){

    try{

        // Leer JSON
        const respuesta = await fetch('./data/declaraciones.json');

        // Convertir JSON
        const declaraciones = await respuesta.json();

        // Convertir búsqueda a minúscula
        const texto = textoBusqueda.toLowerCase();

        // Filtrar resultados
        const resultados = declaraciones.filter(item => {

            return (

                item.titulo.toLowerCase().includes(texto)

                ||

                item.como_el_ha_dicho.toLowerCase().includes(texto)

                ||

                item.podemos_decir_confiadamente.toLowerCase().includes(texto)

                ||

                item.referencia.toLowerCase().includes(texto)

            );

        });

        return resultados;

    }catch(error){

        console.error('Error buscando declaraciones:', error);

        return [];

    }

}

// =====================================
// MOSTRAR RESULTADOS
// =====================================

function mostrarResultados(resultados, containerId){

    const container = document.getElementById(containerId);

    // Limpiar
    container.innerHTML = '';

    // Validar resultados
    if(resultados.length === 0){

        container.innerHTML = `

            <div class="categoria-card">

                <h2>Sin resultados</h2>

                <p>
                    No se encontraron declaraciones.
                </p>

            </div>

        `;

        return;

    }

    // Mostrar resultados
    resultados.forEach(item => {

        const card = document.createElement('div');

        card.classList.add('categoria-card');

        card.innerHTML = `

            <h2>${item.titulo}</h2>

            <br>

            <p>

                <strong>${item.referencia}</strong>

            </p>

            <br>

            <p>

                "${item.podemos_decir_confiadamente}"

            </p>

        `;

        container.appendChild(card);

    });

}

// =====================================
// EXPORTAR FUNCIONES
// =====================================

window.buscadorApp = {

    buscarDeclaraciones,
    mostrarResultados

};