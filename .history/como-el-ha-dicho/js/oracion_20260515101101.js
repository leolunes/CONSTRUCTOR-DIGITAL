// =====================================
// NECESITO ORACIÓN
// Victoriosos en Cristo
// =====================================

let oracionesData = [];

// =====================================
// RESPALDO INTERNO
// Si data/oraciones.json falla, la app igual funciona
// =====================================

const ORACIONES_RESPALDO = [

    {
        id: 1,
        tema: "Ansiedad",
        icono: "😔",
        descripcion: "Recibe paz cuando tu mente se siente cargada.",
        palabra: {
            titulo: "Dios guarda tu mente",
            versiculo: "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias.",
            referencia: "Filipenses 4:6"
        },
        oracion: "Señor, hoy entrego delante de Ti toda ansiedad, todo pensamiento acelerado y toda carga que ha intentado robarme la paz. Guarda mi mente, ordena mi corazón y enséñame a descansar en Tu presencia.",
        declaracion: "Cristo guarda mi mente y mi corazón. No vivo gobernado por la ansiedad, sino sostenido por la paz de Dios.",
        audio: "./assets/audio/oracion/ansiedad.mp3"
    },

    {
        id: 2,
        tema: "Tristeza",
        icono: "💔",
        descripcion: "Permite que Dios abrace tu corazón herido.",
        palabra: {
            titulo: "Dios está cerca del quebrantado",
            versiculo: "Cercano está Jehová a los quebrantados de corazón; y salva a los contritos de espíritu.",
            referencia: "Salmo 34:18"
        },
        oracion: "Señor, me acerco a Ti con mi corazón tal como está. Sana mi tristeza, acompaña mi proceso y recuérdame que no estoy solo. Que Tu amor vuelva a levantar mi interior.",
        declaracion: "Dios está cerca de mí. Mi tristeza no define mi destino; Su amor restaura mi corazón.",
        audio: "./assets/audio/oracion/tristeza.mp3"
    },

    {
        id: 3,
        tema: "Miedo",
        icono: "😟",
        descripcion: "Fortalece tu fe cuando el temor intenta detenerte.",
        palabra: {
            titulo: "Dios no me dio espíritu de temor",
            versiculo: "Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio.",
            referencia: "2 Timoteo 1:7"
        },
        oracion: "Señor, renuncio al temor que quiere controlar mis decisiones. Recibo Tu poder, Tu amor y Tu dominio propio. Afirma mi corazón y hazme caminar con confianza en Ti.",
        declaracion: "No soy gobernado por el miedo. Dios me dio poder, amor y dominio propio.",
        audio: "./assets/audio/oracion/miedo.mp3"
    },

    {
        id: 4,
        tema: "Hogar",
        icono: "🏠",
        descripcion: "Ora por paz, unidad y restauración familiar.",
        palabra: {
            titulo: "Dios guarda mi casa",
            versiculo: "Si Jehová no edificare la casa, en vano trabajan los que la edifican.",
            referencia: "Salmo 127:1"
        },
        oracion: "Señor, pongo mi hogar en Tus manos. Edifica nuestra casa con amor, perdón, orden y paz. Sana lo que esté herido y fortalece cada relación bajo Tu gobierno.",
        declaracion: "Mi hogar pertenece a Dios. Él edifica, guarda y restaura nuestra casa.",
        audio: "./assets/audio/oracion/hogar.mp3"
    },

    {
        id: 5,
        tema: "Finanzas",
        icono: "💰",
        descripcion: "Declara provisión, sabiduría y orden.",
        palabra: {
            titulo: "Dios es mi proveedor",
            versiculo: "Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús.",
            referencia: "Filipenses 4:19"
        },
        oracion: "Señor, entrego mis finanzas delante de Ti. Dame sabiduría, orden, diligencia y contentamiento. Abre puertas correctas y enséñame a administrar con fidelidad lo que pones en mis manos.",
        declaracion: "Dios es mi proveedor. Camino en sabiduría, orden y confianza en Su provisión.",
        audio: "./assets/audio/oracion/finanzas.mp3"
    },

    {
        id: 6,
        tema: "Salud",
        icono: "🩺",
        descripcion: "Recibe fortaleza espiritual en medio del proceso.",
        palabra: {
            titulo: "Dios fortalece mi vida",
            versiculo: "Él da esfuerzo al cansado, y multiplica las fuerzas al que no tiene ningunas.",
            referencia: "Isaías 40:29"
        },
        oracion: "Señor, presento mi salud delante de Ti. Fortalece mi cuerpo, mi mente y mi espíritu. Dame paz en el proceso, dirección correcta y esperanza firme en Tu amor.",
        declaracion: "Dios renueva mis fuerzas. Mi vida está en Sus manos y Su paz sostiene mi proceso.",
        audio: "./assets/audio/oracion/salud.mp3"
    }

];

// =====================================
// CARGAR ORACIONES
// =====================================

async function cargarOraciones(){

    try{

        const respuesta =
        await fetch('./data/oraciones.json', {
            cache:'no-store'
        });

        if(!respuesta.ok){

            throw new Error(
                'No se encontró data/oraciones.json'
            );

        }

        const data =
        await respuesta.json();

        if(!Array.isArray(data) || data.length === 0){

            throw new Error(
                'El archivo oraciones.json está vacío o mal formado'
            );

        }

        oracionesData =
        data;

    }catch(error){

        console.warn(
            'Usando oraciones de respaldo interno:',
            error
        );

        oracionesData =
        ORACIONES_RESPALDO;

    }

    mostrarTemasOracion(
        oracionesData
    );

}

// =====================================
// MOSTRAR TEMAS
// =====================================

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

            <h3>
                ${item.tema}
            </h3>

            <p>
                ${item.descripcion}
            </p>

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

// =====================================
// SELECCIONAR ORACIÓN
// =====================================

function seleccionarOracion(id){

    const item =
    oracionesData.find(
        oracion => Number(oracion.id) === Number(id)
    );

    if(!item){

        return;

    }

    mostrarRespuestaOracion(
        item
    );

}

// =====================================
// MOSTRAR RESPUESTA
// =====================================

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

                    <span class="oracion-badge">
                        Necesito oración
                    </span>

                    <h2>
                        ${item.palabra.titulo}
                    </h2>

                    <p>
                        ${item.tema}
                    </p>

                </div>

            </div>

            <div class="oracion-bloque">

                <h3>
                    📖 Palabra
                </h3>

                <p>
                    "${item.palabra.versiculo}"
                </p>

                <strong>
                    ${item.palabra.referencia}
                </strong>

            </div>

            <div class="oracion-bloque">

                <h3>
                    🙏 Oración
                </h3>

                <p>
                    ${item.oracion}
                </p>

            </div>

            <div class="oracion-bloque declaracion">

                <h3>
                    💜 Declaración
                </h3>

                <p>
                    "${item.declaracion}"
                </p>

            </div>

            <div class="oracion-acciones">

                <button
                type="button"
                class="audio-btn"
                id="btnAudioOracion">
                    ▶ Escuchar audio
                </button>

                <button
                type="button"
                class="btn-descargar-pdf"
                id="btnPdfOracion">
                    📄 Descargar en PDF
                </button>

                <button
                type="button"
                class="btn-favorito"
                id="btnFavoritoOracion">
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

// =====================================
// EVENTOS RESPUESTA
// =====================================

function prepararEventosRespuesta(item){

    const btnAudio =
    document.getElementById(
        'btnAudioOracion'
    );

    const btnPdf =
    document.getElementById(
        'btnPdfOracion'
    );

    const btnFavorito =
    document.getElementById(
        'btnFavoritoOracion'
    );

    if(btnAudio){

        btnAudio.addEventListener(
            'click',
            async () => {

                if(!item.audio){

                    alert(
                        'Este audio aún no está disponible.'
                    );

                    return;

                }

                if(
                    typeof audioApp === 'undefined' ||
                    !audioApp.reproducirAudio
                ){

                    alert(
                        'El reproductor de audio no está disponible.'
                    );

                    return;

                }

                const existe =
                audioApp.existeAudio
                ? await audioApp.existeAudio(
                    item.audio
                )
                : true;

                if(!existe){

                    alert(
                        'Este audio aún no existe.'
                    );

                    return;

                }

                audioApp.reproducirAudio(
                    item.audio
                );

            }
        );

    }

    if(btnPdf){

        btnPdf.addEventListener(
            'click',
            () => {

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
                    item.palabra.titulo,

                    texto:
                    item.palabra.versiculo,

                    versiculo:
                    item.palabra.referencia,

                    declaracion:
                    item.declaracion

                });

            }
        );

    }

    if(btnFavorito){

        btnFavorito.addEventListener(
            'click',
            () => {

                const favorito = {
                    id:`oracion-${item.id}`,
                    titulo:item.palabra.titulo,
                    como_el_ha_dicho:item.palabra.versiculo,
                    referencia:item.palabra.referencia,
                    podemos_decir_confiadamente:item.declaracion
                };

                guardarFavoritoOracion(
                    favorito
                );

                alert(
                    'Palabra guardada en favoritos'
                );

            }
        );

    }

}

// =====================================
// GUARDAR FAVORITO
// =====================================

function guardarFavoritoOracion(item){

    const favoritos =
    JSON.parse(
        localStorage.getItem('favoritos') || '[]'
    );

    const existe =
    favoritos.some(
        fav => String(fav.id) === String(item.id)
    );

    if(!existe){

        favoritos.push(
            item
        );

        localStorage.setItem(
            'favoritos',
            JSON.stringify(favoritos)
        );

    }

}

// =====================================
// INICIAR
// =====================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        cargarOraciones();

    }
);
