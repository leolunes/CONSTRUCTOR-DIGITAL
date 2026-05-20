// =====================================
// CARGAR CATEGORÍAS
// =====================================

async function cargarAudios(){

    try{

        // =====================================
        // LEER CATEGORÍAS
        // =====================================

        const respuestaCategorias =
        await fetch('./data/categorias.json');

        const categorias =
        await respuestaCategorias.json();

        // =====================================
        // LEER DECLARACIONES
        // =====================================

        const respuestaDeclaraciones =
        await fetch('./data/declaraciones.json');

        const declaraciones =
        await respuestaDeclaraciones.json();

        // =====================================
        // CONTENEDOR
        // =====================================

        const container =
        document.getElementById(
            'audios-container'
        );

        container.innerHTML = '';

        // =====================================
        // RECORRER CATEGORÍAS
        // =====================================

        categorias.forEach(categoria => {

            // =====================================
            // FILTRAR DECLARACIONES
            // =====================================

            const declaracionesCategoria =
            declaraciones.filter(
                item =>
                item.categoria_id == categoria.id
            );

            // =====================================
            // TARJETA
            // =====================================

            const card =
            document.createElement('div');

            card.classList.add(
                'categoria-card'
            );

            // =====================================
            // LISTA AUDIOS
            // =====================================

            let listaAudios = '';

            declaracionesCategoria.forEach(item => {

                const rutaAudio =

                `./assets/audio/${categoria.audio_carpeta}/${item.id}.mp3`;

                listaAudios += `

                    <button
                    class="audio-btn"
                    data-audio="${rutaAudio}">

                        ▶ ${item.titulo}

                    </button>

                    <br><br>

                `;

            });

            // =====================================
            // HTML
            // =====================================

            card.innerHTML = `

                <h2>
                    ${categoria.nombre}
                </h2>

                <br>

                ${listaAudios}

            `;

            // =====================================
            // AGREGAR
            // =====================================

            container.appendChild(card);

        });

        // =====================================
        // EVENTOS AUDIO
        // =====================================

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

        cargarAudios();

    }
);