// =====================================
// OBTENER ID
// =====================================

const parametros =
new URLSearchParams(
    window.location.search
);

const categoriaId =
parametros.get('id');

// =====================================
// CARGAR AUDIOS
// =====================================

async function cargarAudiosCategoria(){

    try{

        // =====================================
        // CATEGORÍAS
        // =====================================

        const respuestaCategorias =
        await fetch('./data/categorias.json');

        const categorias =
        await respuestaCategorias.json();

        const categoria =
        categorias.find(
            item => item.id == categoriaId
        );

        // =====================================
        // TÍTULO
        // =====================================

        if(categoria){

            document.getElementById(
                'titulo-audio'
            ).innerText =
            categoria.nombre;

        }

        // =====================================
        // DECLARACIONES
        // =====================================

        const respuestaDeclaraciones =
        await fetch('./data/declaraciones.json');

        const declaraciones =
        await respuestaDeclaraciones.json();

        const filtradas =
        declaraciones.filter(
            item =>
            item.categoria_id == categoriaId
        );

        // =====================================
        // CONTENEDOR
        // =====================================

        const container =
        document.getElementById(
            'audios-categoria-container'
        );

        container.innerHTML = '';

        // =====================================
        // RECORRER AUDIOS
        // =====================================

        filtradas.forEach(item => {

            const rutaAudio =

            `./assets/audio/${categoria.audio_carpeta}/${item.id}.mp3`;

            const card =
            document.createElement('div');

            card.classList.add(
                'categoria-card'
            );

            card.innerHTML = `

                <h2>
                    ${item.titulo}
                </h2>

                <br>

                <button
                class="audio-btn"
                data-audio="${rutaAudio}">

                    ▶ Escuchar Audio

                </button>

            `;

            container.appendChild(card);

        });

        agregarEventosAudio();

    }catch(error){

        console.error(
            'Error cargando audios:',
            error
        );

    }

}

// =====================================
// EVENTOS AUDIO
// =====================================

function agregarEventosAudio(){

    const botones =
    document.querySelectorAll(
        '.audio-btn'
    );

    botones.forEach(boton => {

        boton.addEventListener(
            'click',
            async () => {

                const ruta =
                boton.dataset.audio;

                const existe =
                await audioApp.existeAudio(
                    ruta
                );

                if(!existe){

                    alert(
                        'Este audio aún no existe.'
                    );

                    return;

                }

                audioApp.reproducirAudio(
                    ruta
                );

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

        cargarAudiosCategoria();

    }
);