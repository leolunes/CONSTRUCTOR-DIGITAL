// =====================================
// FAVORITOS
// Constructores del Reino
// =====================================

let favoritosVistaActual = [];

// =====================================
// OBTENER FAVORITOS
// =====================================

function obtenerFavoritos(){

    const favoritos =
    localStorage.getItem('favoritos');

    if(!favoritos){

        return [];

    }

    try{

        return JSON.parse(
            favoritos
        );

    }catch(error){

        console.error(
            'Error leyendo favoritos:',
            error
        );

        return [];

    }

}

// =====================================
// ACTUALIZAR RESUMEN
// =====================================

function actualizarResumenFavoritos(){

    const total =
    document.getElementById(
        'totalFavoritosVista'
    );

    if(total){

        total.textContent =
        obtenerFavoritos().length;

    }

}

// =====================================
// MOSTRAR FAVORITOS
// =====================================

function mostrarFavoritos(lista = null){

    const container =
    document.getElementById(
        'favoritos-container'
    );

    if(!container){

        return;

    }

    const favoritos =
    lista || obtenerFavoritos();

    favoritosVistaActual =
    favoritos;

    actualizarResumenFavoritos();

    container.innerHTML = '';

    if(favoritos.length === 0){

        container.innerHTML = `

            <div class="favoritos-empty-reino">

                <div class="favoritos-empty-icon">
                    ❤️
                </div>

                <h2>
                    No tienes favoritos guardados
                </h2>

                <p>
                    Guarda declaraciones, palabras de oración o enseñanzas para volver a meditarlas aquí.
                </p>

                <a href="index.html" class="home-reino-btn principal">
                    Ir a declaraciones
                </a>

            </div>

        `;

        return;

    }

    favoritos.forEach((item, index) => {

        const card =
        document.createElement('article');

        card.className =
        'favorito-card-reino';

        card.innerHTML = `

            <div class="favorito-card-header">

                <span class="favorito-badge">
                    Favorito ${index + 1}
                </span>

                <button
                type="button"
                class="btn-eliminar-favorito-reino"
                data-id="${item.id}">
                    ×
                </button>

            </div>

            <h2>
                ${item.titulo || 'Palabra guardada'}
            </h2>

            <div class="favorito-bloque">

                <span>
                    Como Él ha dicho
                </span>

                <p>
                    “${item.como_el_ha_dicho || ''}”
                </p>

                <strong>
                    ${item.referencia || ''}
                </strong>

            </div>

            <div class="favorito-bloque declaracion">

                <span>
                    Podemos decir confiadamente
                </span>

                <p>
                    “${item.podemos_decir_confiadamente || ''}”
                </p>

            </div>

            <div class="favorito-acciones">

                <button
                type="button"
                class="btn-descargar-pdf"
                data-id="${item.id}">
                    📄 Descargar PDF
                </button>

                <button
                type="button"
                class="btn-compartir-favorito"
                data-id="${item.id}">
                    📲 Compartir
                </button>

            </div>

        `;

        container.appendChild(
            card
        );

    });

    agregarEventosPdfFavoritos();
    agregarEventosEliminar();
    agregarEventosCompartirFavoritos();

}

// =====================================
// BÚSQUEDA
// =====================================

function prepararBusquedaFavoritos(){

    const input =
    document.getElementById(
        'buscarFavoritos'
    );

    const limpiar =
    document.getElementById(
        'limpiarBusquedaFavoritos'
    );

    if(!input){

        return;

    }

    input.addEventListener(
        'input',
        () => {

            filtrarFavoritos(
                input.value
            );

        }
    );

    if(limpiar){

        limpiar.addEventListener(
            'click',
            () => {

                input.value = '';

                filtrarFavoritos('');

                input.focus();

            }
        );

    }

}

function filtrarFavoritos(texto){

    const busqueda =
    String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

    const favoritos =
    obtenerFavoritos();

    if(!busqueda){

        mostrarFavoritos(
            favoritos
        );

        return;

    }

    const filtrados =
    favoritos.filter(item => {

        const contenido =
        [
            item.titulo,
            item.como_el_ha_dicho,
            item.referencia,
            item.podemos_decir_confiadamente
        ]
        .join(' ')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

        return contenido.includes(
            busqueda
        );

    });

    mostrarFavoritos(
        filtrados
    );

}

// =====================================
// EVENTOS PDF FAVORITOS
// =====================================

function agregarEventosPdfFavoritos(){

    const botones =
    document.querySelectorAll(
        '.btn-descargar-pdf'
    );

    botones.forEach(boton => {

        boton.addEventListener('click', event => {

            event.stopPropagation();

            const id =
            boton.dataset.id;

            const favoritos =
            obtenerFavoritos();

            const item =
            favoritos.find(
                favorito => String(favorito.id) === String(id)
            );

            if(!item){

                alert(
                    'No se encontró esta declaración.'
                );

                return;

            }

            if(
                typeof abrirModalPdfPalabra
                !== 'function'
            ){

                alert(
                    'La función PDF no está disponible.'
                );

                return;

            }

            abrirModalPdfPalabra({

                titulo:
                item.titulo,

                texto:
                item.como_el_ha_dicho,

                versiculo:
                item.referencia,

                declaracion:
                item.podemos_decir_confiadamente

            });

        });

    });

}

// =====================================
// COMPARTIR FAVORITO
// =====================================

function agregarEventosCompartirFavoritos(){

    const botones =
    document.querySelectorAll(
        '.btn-compartir-favorito'
    );

    botones.forEach(boton => {

        boton.addEventListener(
            'click',
            () => {

                const id =
                boton.dataset.id;

                compartirFavorito(
                    id
                );

            }
        );

    });

}

async function compartirFavorito(id){

    const favoritos =
    obtenerFavoritos();

    const item =
    favoritos.find(
        favorito => String(favorito.id) === String(id)
    );

    if(!item){

        alert(
            'No se encontró esta declaración.'
        );

        return;

    }

    const texto =
`💜 ${item.titulo || 'Palabra guardada'}

Como Él ha dicho:
“${item.como_el_ha_dicho || ''}”

${item.referencia || ''}

Podemos decir confiadamente:
“${item.podemos_decir_confiadamente || ''}”

Constructores del Reino`;

    if(navigator.share){

        try{

            await navigator.share({
                title:item.titulo || 'Favorito',
                text:texto
            });

            return;

        }catch(error){

            console.log(
                'Compartir cancelado:',
                error
            );

        }

    }

    const whatsapp =
    `https://wa.me/?text=${encodeURIComponent(texto)}`;

    window.open(
        whatsapp,
        '_blank'
    );

}

// =====================================
// ELIMINAR FAVORITO
// =====================================

function agregarEventosEliminar(){

    const botones =
    document.querySelectorAll(
        '.btn-eliminar-favorito-reino'
    );

    botones.forEach(boton => {

        boton.addEventListener(
            'click',
            () => {

                const id =
                boton.dataset.id;

                eliminarFavorito(
                    id
                );

            }
        );

    });

}

// =====================================
// FUNCIÓN ELIMINAR
// =====================================

function eliminarFavorito(id){

    const favoritos =
    obtenerFavoritos();

    const nuevosFavoritos =
    favoritos.filter(
        item => String(item.id) !== String(id)
    );

    localStorage.setItem(
        'favoritos',
        JSON.stringify(nuevosFavoritos)
    );

    mostrarFavoritos();

}

// =====================================
// INICIAR
// =====================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        mostrarFavoritos();

        prepararBusquedaFavoritos();

    }
);
