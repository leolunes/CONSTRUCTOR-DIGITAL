// =====================================
// NECESITO ORACIÓN
// Victoriosos en Cristo
// =====================================

let oracionesData = [];

async function cargarOraciones(){

    try{

        const respuesta =
        await fetch('./data/oraciones.json');

        oracionesData =
        await respuesta.json();

        mostrarTemasOracion(
            oracionesData
        );

    }catch(error){

        console.error(
            'Error cargando oraciones:',
            error
        );

        mostrarErrorOracion();

    }

}

function mostrarTemasOracion(oraciones){

    const container =
    document.getElementById(
        'oracion-temas-container'
    );

    if(!container){

        return;

    }

    container.innerHTML = '';

    oraciones.forEach(item => {

        const card =
        document.createElement('button');

        card.type =
        'button';

        card.classList.add(
            'oracion-tema-card'
        );

        card.innerHTML = `

            <div class="oracion-tema-icon">
                ${item.icono || '🙏'}
            </div>

            <h3>${item.tema}</h3>

            <p>${item.descripcion}</p>

        `;

        card.addEventListener(
            'click',
            () => {

                seleccionarOracion(
                    item.id
                );

            }
        );

        container.appendChild(
            card
        );

    });

}

function seleccionarOracion(id){

    const item =
    oracionesData.find(
        oracion => oracion.id === id
    );

    if(!item){

        return;

    }

    mostrarRespuestaOracion(
        item
    );

}

function mostrarRespuestaOracion(item){

    const container =
    document.getElementById(
        'oracion-respuesta-container'
    );

    if(!container){

        return;

    }

    container.classList.remove(
        'oculto'
    );

    container.innerHTML = `

        <div class="oracion-respuesta-card">

            <div class="oracion-respuesta-header">

                <div class="oracion-respuesta-icon">
                    ${item.icono || '🙏'}
                </div>

                <div>
                    <span class="oracion-badge">Necesito oración</span>
                    <h2>${item.palabra.titulo}</h2>
                    <p>${item.tema}</p>
                </div>

            </div>

            <div class="oracion-bloque">
                <h3>📖 Palabra</h3>
                <p>"${item.palabra.versiculo}"</p>
                <strong>${item.palabra.referencia}</strong>
            </div>

            <div class="oracion-bloque">
                <h3>🙏 Oración</h3>
                <p>${item.oracion}</p>
            </div>

            <div class="oracion-bloque declaracion">
                <h3>💜 Declaración</h3>
                <p>"${item.declaracion}"</p>
            </div>

            <div class="oracion-acciones">

                <button type="button" class="audio-btn" id="btnAudioOracion">
                    ▶ Escuchar audio
                </button>

                <button type="button" class="btn-descargar-pdf" id="btnPdfOracion">
                    📄 Descargar en PDF
                </button>

                <button type="button" class="btn-favorito" id="btnFavoritoOracion">
                    ❤️ Guardar favorito
                </button>

            </div>

        </div>

    `;

    prepararEventosRespuesta(
        item
    );

    setTimeout(() => {

        container.scrollIntoView({
            behavior:'smooth',
            block:'start'
        });

    }, 120);

}

function prepararEventosRespuesta(item){

    const btnAudio =
    document.getElementById('btnAudioOracion');

    const btnPdf =
    document.getElementById('btnPdfOracion');

    const btnFavorito =
    document.getElementById('btnFavoritoOracion');

    if(btnAudio){

        btnAudio.addEventListener('click', async () => {

            if(!item.audio){

                alert('Este audio aún no está disponible.');
                return;

            }

            if(typeof audioApp === 'undefined' || !audioApp.reproducirAudio){

                alert('El reproductor de audio no está disponible.');
                return;

            }

            const existe =
            audioApp.existeAudio
            ? await audioApp.existeAudio(item.audio)
            : true;

            if(!existe){

                alert('Este audio aún no existe.');
                return;

            }

            audioApp.reproducirAudio(item.audio);

        });

    }

    if(btnPdf){

        btnPdf.addEventListener('click', () => {

            if(typeof abrirModalPdfPalabra !== 'function'){

                alert('La función PDF no está disponible.');
                return;

            }

            abrirModalPdfPalabra({
                titulo:item.palabra.titulo,
                texto:item.palabra.versiculo,
                versiculo:item.palabra.referencia,
                declaracion:item.declaracion
            });

        });

    }

    if(btnFavorito){

        btnFavorito.addEventListener('click', () => {

            const favorito = {
                id:`oracion-${item.id}`,
                titulo:item.palabra.titulo,
                como_el_ha_dicho:item.palabra.versiculo,
                referencia:item.palabra.referencia,
                podemos_decir_confiadamente:item.declaracion
            };

            if(typeof storageApp !== 'undefined' && storageApp.agregarFavorito){

                storageApp.agregarFavorito(favorito);

            }else{

                guardarFavoritoOracion(favorito);

            }

            alert('Palabra guardada en favoritos');

        });

    }

}

function guardarFavoritoOracion(item){

    const favoritos =
    JSON.parse(
        localStorage.getItem('favoritos') || '[]'
    );

    const existe =
    favoritos.some(
        fav => fav.id === item.id
    );

    if(!existe){

        favoritos.push(item);

        localStorage.setItem(
            'favoritos',
            JSON.stringify(favoritos)
        );

    }

}

function mostrarErrorOracion(){

    const container =
    document.getElementById(
        'oracion-temas-container'
    );

    if(!container){

        return;

    }

    container.innerHTML = `

        <div class="categoria-card">
            <h2>No se pudo cargar el módulo de oración</h2>
            <p>Revisa que exista el archivo data/oraciones.json.</p>
        </div>

    `;

}

document.addEventListener(
    'DOMContentLoaded',
    () => {

        cargarOraciones();

    }
);
