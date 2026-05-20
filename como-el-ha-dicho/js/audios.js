// =====================================
// CARGAR CATEGORÍAS DE AUDIO
// =====================================

async function cargarAudios(){

    try{

        const respuestaCategorias =
        await fetch('./data/categorias.json');

        const categorias =
        await respuestaCategorias.json();

        const container =
        document.getElementById(
            'audios-container'
        );

        container.innerHTML = '';

        // =====================================
        // SOLO CATEGORÍAS QUE TIENEN CARPETA
        // =====================================

        const categoriasAudio =
        categorias.filter(
            categoria =>
            categoria.audio_carpeta &&
            categoria.audio_carpeta !== ''
        );

        categoriasAudio.forEach(categoria => {

            const card =
            document.createElement('div');

            card.classList.add(
                'audio-categoria-card'
            );

            card.innerHTML = `

                <div class="audio-icono">

                    ▶

                </div>

                <h2>
                    ${categoria.nombre}
                </h2>

                <p>
                    Escucha declaraciones de esta categoría.
                </p>

                <button
                class="audio-btn"
                data-id="${categoria.id}">

                    ▶ Escuchar

                </button>

            `;

            container.appendChild(card);

        });

        agregarEventosCategoriasAudio();

    }catch(error){

        console.error(
            'Error cargando categorías de audio:',
            error
        );

    }

}

// =====================================
// EVENTOS CATEGORÍAS
// =====================================

function agregarEventosCategoriasAudio(){

    const botones =
    document.querySelectorAll(
        '.audio-btn'
    );

    botones.forEach(boton => {

        boton.addEventListener(
            'click',
            () => {

                const id =
                boton.dataset.id;

                window.location.href =
                `audio-categoria.html?id=${id}`;

            }
        );

    });

}

// =====================================
// INICIAR
// =====================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        cargarAudios();

    }
);