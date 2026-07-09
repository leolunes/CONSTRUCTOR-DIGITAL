// =====================================
// ESTADO HOME
// =====================================

let categoriasHomeActuales = [];

// =====================================
// CARGAR CATEGORÍAS
// =====================================

async function cargarCategorias(){

    try{

        const respuesta =
        await fetch('./data/categorias.json');

        const categorias =
        await respuesta.json();

        categoriasHomeActuales =
        categorias;

        actualizarEstadisticasHome(
            categorias
        );

        if(
            document.getElementById('categorias-container')
        ){

            mostrarCategorias(categorias);

            prepararBusquedaHome();

        }

    }catch(error){

        console.error(
            'Error cargando categorías:',
            error
        );

    }

}

// =====================================
// ICONOS POR CATEGORÍA
// Usa solo iconos existentes en assets/icons
// =====================================

function obtenerIconoCategoria(id){

    const iconos = {

        1:'./assets/icons/profile.png',
        2:'./assets/icons/favorite.png',
        3:'./assets/icons/search.png',
        4:'./assets/icons/home.png',
        5:'./assets/icons/favorite.png',
        6:'./assets/icons/profile.png',
        7:'./assets/icons/play.png',
        8:'./assets/icons/back.png',
        9:'./assets/icons/home.png',
        10:'./assets/icons/favorite.png',
        11:'./assets/icons/search.png',
        12:'./assets/icons/play.png',
        13:'./assets/icons/profile.png',
        14:'./assets/icons/home.png',
        15:'./assets/icons/back.png'

    };

    return iconos[id] || './assets/icons/home.png';

}

// =====================================
// MOSTRAR CATEGORÍAS
// =====================================

function mostrarCategorias(categorias){

    const container =
    document.getElementById(
        'categorias-container'
    );

    if(!container){

        return;

    }

    container.innerHTML = '';

    categorias.forEach(categoria => {

        const card =
        document.createElement('div');

        card.classList.add(
            'categoria-card'
        );

        const icono =
        obtenerIconoCategoria(
            categoria.id
        );

        card.innerHTML = `

            <div class="card-icon">

                <img
                src="${icono}"
                alt="${categoria.nombre}">

            </div>

            <div class="card-info">

                <h2>
                    ${categoria.nombre}
                </h2>

                <p>
                    ${categoria.descripcion}
                </p>

            </div>

        `;

        card.addEventListener('click', () => {

            window.location.href =
            `categorias.html?id=${categoria.id}`;

        });

        container.appendChild(card);

    });

}


// =====================================
// ESTADÍSTICAS HOME
// =====================================

async function actualizarEstadisticasHome(categorias){

    const statCategorias =
    document.getElementById('statCategorias');

    const statDeclaraciones =
    document.getElementById('statDeclaraciones');

    const statAudiolibros =
    document.getElementById('statAudiolibros');

    if(statCategorias){

        statCategorias.textContent =
        Array.isArray(categorias)
        ? categorias.length
        : 0;

    }

    if(statDeclaraciones){

        try{

            const respuesta =
            await fetch('./data/declaraciones.json');

            const declaraciones =
            await respuesta.json();

            statDeclaraciones.textContent =
            Array.isArray(declaraciones)
            ? declaraciones.length
            : 0;

        }catch(error){

            statDeclaraciones.textContent =
            '150';

        }

    }

    if(statAudiolibros){

        try{

            const respuesta =
            await fetch('./data/audiolibros.json');

            const libros =
            await respuesta.json();

            statAudiolibros.textContent =
            Array.isArray(libros)
            ? libros.length
            : 0;

        }catch(error){

            statAudiolibros.textContent =
            '3';

        }

    }

}

// =====================================
// BÚSQUEDA HOME CATEGORÍAS
// =====================================

function prepararBusquedaHome(){

    const input =
    document.getElementById('busquedaCategoriasHome');

    const btnLimpiar =
    document.getElementById('btnLimpiarBusquedaHome');

    if(!input){

        return;

    }

    input.addEventListener('input', () => {

        filtrarCategoriasHome(input.value);

    });

    if(btnLimpiar){

        btnLimpiar.addEventListener('click', () => {

            input.value = '';

            filtrarCategoriasHome('');

            input.focus();

        });

    }

}

function filtrarCategoriasHome(texto){

    const container =
    document.getElementById('categorias-container');

    if(!container){

        return;

    }

    const busqueda =
    String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

    const cards =
    container.querySelectorAll('.categoria-card');

    let visibles = 0;

    cards.forEach(card => {

        const contenido =
        card.innerText
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

        const coincide =
        !busqueda ||
        contenido.includes(busqueda);

        card.classList.toggle(
            'oculta-busqueda',
            !coincide
        );

        if(coincide){

            visibles++;

        }

    });

    let aviso =
    container.querySelector('.sin-resultados-home');

    if(visibles === 0){

        if(!aviso){

            aviso =
            document.createElement('div');

            aviso.className =
            'sin-resultados-home';

            aviso.innerHTML =
            'No encontramos categorías con esa búsqueda. Intenta con otra palabra.';

            container.appendChild(aviso);

        }

    }else if(aviso){

        aviso.remove();

    }

}



// =====================================
// PALABRA DEL DÍA
// Cambia automáticamente cada día
// =====================================

let palabraDiaActual = null;

const fondosPalabraDia = [
    'palabra-dia-fondo-1',
    'palabra-dia-fondo-2',
    'palabra-dia-fondo-3',
    'palabra-dia-fondo-4',
    'palabra-dia-fondo-5'
];

function obtenerIndicePalabraDelDia(total){

    const hoy = new Date();

    const inicioAnio =
    new Date(
        hoy.getFullYear(),
        0,
        0
    );

    const diferencia =
    hoy - inicioAnio;

    const diaDelAnio =
    Math.floor(
        diferencia / 86400000
    );

    return diaDelAnio % total;

}

async function cargarPalabraDelDia(){

    const card =
    document.getElementById(
        'palabraDiaCard'
    );

    if(!card){

        return;

    }

    try{

        const respuesta =
        await fetch(
            './data/declaraciones.json'
        );

        const declaraciones =
        await respuesta.json();

        if(
            !Array.isArray(declaraciones) ||
            declaraciones.length === 0
        ){

            return;

        }

        const indice =
        obtenerIndicePalabraDelDia(
            declaraciones.length
        );

        palabraDiaActual =
        declaraciones[indice];

        renderizarPalabraDelDia(
            palabraDiaActual,
            indice
        );

    }catch(error){

        console.error(
            'Error cargando palabra del día:',
            error
        );

    }

}

function renderizarPalabraDelDia(item, indice){

    const card =
    document.getElementById(
        'palabraDiaCard'
    );

    const etiqueta =
    document.getElementById(
        'palabraDiaEtiqueta'
    );

    const titulo =
    document.getElementById(
        'palabraDiaTitulo'
    );

    const texto =
    document.getElementById(
        'palabraDiaTexto'
    );

    const referencia =
    document.getElementById(
        'palabraDiaReferencia'
    );

    const botonAudio =
    document.getElementById(
        'btnEscucharPalabraDia'
    );

    if(!card || !item){

        return;

    }

    fondosPalabraDia.forEach(clase => {

        card.classList.remove(
            clase
        );

    });

    card.classList.add(
        fondosPalabraDia[
            indice % fondosPalabraDia.length
        ]
    );

    if(etiqueta){

        etiqueta.textContent =
        '🌅 Hoy Dios quiere recordarte...';

    }

    if(titulo){

        titulo.textContent =
        item.titulo || 'Dios está contigo';

    }

    if(texto){

        texto.textContent =
        `“${item.como_el_ha_dicho || item.podemos_decir_confiadamente || ''}”`;

    }

    if(referencia){

        referencia.textContent =
        item.referencia || '';

    }

    if(botonAudio){

        botonAudio.dataset.audio =
        obtenerRutaAudioPalabraDia(
            item
        );

        botonAudio.onclick =
        escucharPalabraDelDia;

    }

}

function obtenerRutaAudioPalabraDia(item){

    if(item.audio_url){

        return item.audio_url;

    }

    const carpetasPorCategoria = {
        1:'identidad',
        2:'fe',
        3:'peticiones',
        4:'paz',
        5:'sanidad',
        6:'matrimonio',
        7:'finanzas',
        8:'proposito',
        9:'victoria',
        10:'gratitud',
        11:'libertad',
        12:'disciplina',
        13:'sabiduria',
        14:'jovenes',
        15:'proteccion'
    };

    const carpeta =
    carpetasPorCategoria[
        item.categoria_id
    ];

    if(!carpeta || !item.id){

        return '';

    }

    return `./assets/audio/${carpeta}/${item.id}.mp3`;

}

async function escucharPalabraDelDia(){

    if(!palabraDiaActual){

        alert(
            'La palabra del día aún no está disponible.'
        );

        return;

    }

    const rutaAudio =
    obtenerRutaAudioPalabraDia(
        palabraDiaActual
    );

    if(!rutaAudio){

        alert(
            'Esta palabra aún no tiene audio disponible.'
        );

        return;

    }

    if(window.audioApp){

        try{

            const existe =
            await audioApp.existeAudio(
                rutaAudio
            );

            if(!existe){

                alert(
                    'El audio de esta palabra aún no existe.'
                );

                return;

            }

            audioApp.reproducirAudio(
                rutaAudio
            );

            return;

        }catch(error){

            console.warn(
                'No se pudo validar el audio:',
                error
            );

        }

    }

    const audio =
    new Audio(
        rutaAudio
    );

    audio.play()
    .catch(() => {

        alert(
            'No se pudo reproducir el audio.'
        );

    });

}


// =====================================
// CONFIGURACIÓN PDF PERSONALIZADO
// =====================================

let palabraSeleccionadaPdf = {

    titulo: '',
    texto: '',
    versiculo: '',
    declaracion: ''

};

// =====================================
// PREPARAR MODAL PDF
// =====================================

function prepararModalPdf(){

    const modal =
    document.getElementById('modalPdfPalabra');

    const cerrar =
    document.getElementById('cerrarModalPdf');

    const cancelar =
    document.getElementById('cancelarPdfPalabra');

    const form =
    document.getElementById('formPdfPalabra');

    if(!modal || !form){

        return;

    }

    // =====================================
    // CREAR BOTÓN WHATSAPP SI NO EXISTE
    // =====================================

    if(!document.getElementById('btnCompartirWhatsapp')){

        const acciones =
        form.querySelector('.modal-pdf-actions');

        if(acciones){

            const btnWhatsapp =
            document.createElement('button');

            btnWhatsapp.type =
            'button';

            btnWhatsapp.id =
            'btnCompartirWhatsapp';

            btnWhatsapp.className =
            'btn-pdf-whatsapp';

            btnWhatsapp.innerHTML =
            '💌 Descargar y compartir por WhatsApp';

            btnWhatsapp.addEventListener(
                'click',
                () => {

                    compartirWhatsAppPalabra();

                }
            );

            acciones.appendChild(
                btnWhatsapp
            );

        }

    }

    if(cerrar){

        cerrar.addEventListener('click', cerrarModalPdf);

    }

    if(cancelar){

        cancelar.addEventListener('click', cerrarModalPdf);

    }

    modal.addEventListener('click', event => {

        if(event.target === modal){

            cerrarModalPdf();

        }

    });

    form.addEventListener('submit', event => {

        event.preventDefault();

        generarPdfPalabra('descargar');

    });

}

// =====================================
// ABRIR MODAL PDF
// Esta función queda disponible para usarla
// desde otras páginas o tarjetas dinámicas.
// =====================================

function abrirModalPdfPalabra(datosPalabra){

    const modal =
    document.getElementById('modalPdfPalabra');

    const nombre =
    document.getElementById('pdfNombrePersona');

    const dedicatoria =
    document.getElementById('pdfDedicatoria');

    const tituloHidden =
    document.getElementById('pdfTituloPalabra');

    const textoHidden =
    document.getElementById('pdfTextoPalabra');

    const versiculoHidden =
    document.getElementById('pdfVersiculoPalabra');

    const declaracionHidden =
    document.getElementById('pdfDeclaracionPalabra');

    if(!modal){

        alert(
            'No se encontró el formulario para descargar PDF.'
        );

        return;

    }

    palabraSeleccionadaPdf = {

        titulo: datosPalabra?.titulo || '',
        texto: datosPalabra?.texto || '',
        versiculo: datosPalabra?.versiculo || '',
        declaracion: datosPalabra?.declaracion || ''

    };

    if(nombre){

        nombre.value = '';

    }

    if(dedicatoria){

        dedicatoria.value = '';

    }

    if(tituloHidden){

        tituloHidden.value =
        palabraSeleccionadaPdf.titulo;

    }

    if(textoHidden){

        textoHidden.value =
        palabraSeleccionadaPdf.texto;

    }

    if(versiculoHidden){

        versiculoHidden.value =
        palabraSeleccionadaPdf.versiculo;

    }

    if(declaracionHidden){

        declaracionHidden.value =
        palabraSeleccionadaPdf.declaracion;

    }

    modal.classList.add('activo');
    modal.setAttribute('aria-hidden', 'false');

    setTimeout(() => {

        if(nombre){

            nombre.focus();

        }

    }, 120);

}

// =====================================
// CERRAR MODAL PDF
// =====================================

function cerrarModalPdf(){

    const modal =
    document.getElementById('modalPdfPalabra');

    if(!modal){

        return;

    }

    modal.classList.remove('activo');
    modal.setAttribute('aria-hidden', 'true');

}

// =====================================
// CREAR BOTÓN PDF PARA UNA TARJETA
// Esta función sirve para integrarla después
// en categorias.js, favoritos.js o cualquier
// renderizador de palabras.
// =====================================

function crearBotonDescargarPdf(datosPalabra){

    const boton =
    document.createElement('button');

    boton.type = 'button';

    boton.classList.add(
        'btn-descargar-pdf'
    );

    boton.innerHTML =
    '📄 Descargar en PDF';

    boton.addEventListener('click', event => {

        event.stopPropagation();

        abrirModalPdfPalabra(datosPalabra);

    });

    return boton;

}

// =====================================
// EXTRAER DATOS DESDE UNA CARD EXISTENTE
// Funciona como apoyo si una tarjeta ya está
// pintada en HTML y queremos leer su contenido.
// =====================================

function extraerDatosPalabraDesdeCard(card){

    if(!card){

        return {

            titulo: '',
            texto: '',
            versiculo: '',
            declaracion: ''

        };

    }

    const titulo =
    card.querySelector('h1, h2, .titulo, .palabra-titulo');

    const parrafos =
    card.querySelectorAll('p');

    const negritas =
    card.querySelectorAll('strong, b');

    let texto = '';
    let versiculo = '';
    let declaracion = '';

    if(parrafos.length > 0){

        texto =
        parrafos[0].innerText.trim();

    }

    if(negritas.length > 0){

        versiculo =
        negritas[negritas.length - 1].innerText.trim();

    }

    if(parrafos.length > 1){

        declaracion =
        parrafos[parrafos.length - 1].innerText.trim();

    }

    return {

        titulo: titulo ? titulo.innerText.trim() : '',
        texto,
        versiculo,
        declaracion

    };

}


// =====================================
// CARGAR IMAGEN COMO BASE64 PARA PDF
// =====================================

function cargarImagenComoBase64(ruta){

    return new Promise(resolve => {

        const imagen =
        new Image();

        imagen.crossOrigin =
        'anonymous';

        imagen.onload = () => {

            try{

                const canvas =
                document.createElement('canvas');

                canvas.width =
                imagen.naturalWidth || imagen.width;

                canvas.height =
                imagen.naturalHeight || imagen.height;

                const ctx =
                canvas.getContext('2d');

                ctx.drawImage(
                    imagen,
                    0,
                    0
                );

                const dataUrl =
                canvas.toDataURL('image/png');

                resolve(dataUrl);

            }catch(error){

                console.warn(
                    'No se pudo convertir el logo a base64:',
                    error
                );

                resolve(null);

            }

        };

        imagen.onerror = () => {

            console.warn(
                'No se pudo cargar la imagen:',
                ruta
            );

            resolve(null);

        };

        imagen.src =
        ruta;

    });

}


// =====================================
// MENSAJE PARA WHATSAPP
// =====================================

function construirMensajeWhatsApp(){

    const nombreInput =
    document.getElementById('pdfNombrePersona');

    const dedicatoriaInput =
    document.getElementById('pdfDedicatoria');

    const nombrePersona =
    nombreInput ? nombreInput.value.trim() : '';

    const dedicatoria =
    dedicatoriaInput ? dedicatoriaInput.value.trim() : '';

    const titulo =
    palabraSeleccionadaPdf.titulo ||
    'Palabra de bendición';

    const texto =
    palabraSeleccionadaPdf.texto || '';

    const versiculo =
    palabraSeleccionadaPdf.versiculo || '';

    const declaracion =
    palabraSeleccionadaPdf.declaracion || '';

    return (
        `💜 *Constructores del Reino*\\n\\n` +
        `Preparé esta palabra especialmente para ti, ${nombrePersona}.\\n\\n` +
        `💌 ${dedicatoria}\\n\\n` +
        `📖 *${titulo}*\\n\\n` +
        `Como Él ha dicho:\\n"${texto}"\\n\\n` +
        `${versiculo}\\n\\n` +
        `Podemos decir confiadamente:\\n"${declaracion}"\\n\\n` +
        `Oramos que esta palabra fortalezca tu vida.`
    );

}

// =====================================
// COMPARTIR POR WHATSAPP
// =====================================

async function compartirWhatsAppPalabra(){

    const nombreInput =
    document.getElementById('pdfNombrePersona');

    const dedicatoriaInput =
    document.getElementById('pdfDedicatoria');

    const nombrePersona =
    nombreInput ? nombreInput.value.trim() : '';

    const dedicatoria =
    dedicatoriaInput ? dedicatoriaInput.value.trim() : '';

    if(!nombrePersona){

        alert(
            'Por favor escribe el nombre de la persona.'
        );

        return;

    }

    if(!dedicatoria){

        alert(
            'Por favor escribe una dedicatoria.'
        );

        return;

    }

    // Primero descarga el PDF para que la persona pueda adjuntarlo si desea.
    await generarPdfPalabra(
        'descargar'
    );

    const mensaje =
    construirMensajeWhatsApp();

    const urlWhatsapp =
    'https://wa.me/?text=' +
    encodeURIComponent(
        mensaje
    );

    setTimeout(() => {

        window.open(
            urlWhatsapp,
            '_blank'
        );

    }, 600);

}


// =====================================
// UTILIDADES DE TEXTO PARA PDF
// Ajustan automáticamente tamaño de letra
// y líneas para que el contenido quepa.
// =====================================

function normalizarTextoPdf(texto){

    return String(texto || '')
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/[ ]+/g, ' ')
    .trim();

}

function dividirTextoManualPdf(pdf, texto, anchoMaximo){

    const limpio =
    normalizarTextoPdf(texto);

    const partes =
    limpio.split('\n');

    let lineas = [];

    partes.forEach(parte => {

        const bloque =
        pdf.splitTextToSize(
            parte.trim(),
            anchoMaximo
        );

        lineas =
        lineas.concat(
            bloque
        );

    });

    return lineas;

}

function escribirTextoCentradoEnCajaPdf(pdf, opciones){

    const texto =
    normalizarTextoPdf(
        opciones.texto
    );

    const xCentro =
    opciones.xCentro;

    const yInicio =
    opciones.yInicio;

    const ancho =
    opciones.ancho;

    const alto =
    opciones.alto;

    const fuente =
    opciones.fuente || 'times';

    const estilo =
    opciones.estilo || 'normal';

    const tamanoInicial =
    opciones.tamanoInicial || 12;

    const tamanoMinimo =
    opciones.tamanoMinimo || 8;

    const color =
    opciones.color || [0, 0, 0];

    const espacioLinea =
    opciones.espacioLinea || 1.15;

    const maxLineas =
    opciones.maxLineas || 4;

    let tamano =
    tamanoInicial;

    let lineas = [];

    while(tamano >= tamanoMinimo){

        pdf.setFont(
            fuente,
            estilo
        );

        pdf.setFontSize(
            tamano
        );

        lineas =
        dividirTextoManualPdf(
            pdf,
            texto,
            ancho
        );

        const altoLinea =
        tamano * 0.3528 * espacioLinea;

        const altoTexto =
        lineas.length * altoLinea;

        if(
            lineas.length <= maxLineas &&
            altoTexto <= alto
        ){

            break;

        }

        tamano -= 0.4;

    }

    pdf.setFont(
        fuente,
        estilo
    );

    pdf.setFontSize(
        tamano
    );

    pdf.setTextColor(
        color[0],
        color[1],
        color[2]
    );

    lineas =
    dividirTextoManualPdf(
        pdf,
        texto,
        ancho
    ).slice(
        0,
        maxLineas
    );

    const altoLinea =
    tamano * 0.3528 * espacioLinea;

    const altoTexto =
    lineas.length * altoLinea;

    const yTexto =
    yInicio + ((alto - altoTexto) / 2) + (tamano * 0.28);

    pdf.text(
        lineas,
        xCentro,
        yTexto,
        {
            align:'center',
            maxWidth:ancho
        }
    );

}

function escribirTextoIzquierdaEnCajaPdf(pdf, opciones){

    const texto =
    normalizarTextoPdf(
        opciones.texto
    );

    const x =
    opciones.x;

    const yInicio =
    opciones.yInicio;

    const ancho =
    opciones.ancho;

    const alto =
    opciones.alto;

    const fuente =
    opciones.fuente || 'times';

    const estilo =
    opciones.estilo || 'normal';

    const tamanoInicial =
    opciones.tamanoInicial || 12;

    const tamanoMinimo =
    opciones.tamanoMinimo || 8;

    const color =
    opciones.color || [0, 0, 0];

    const espacioLinea =
    opciones.espacioLinea || 1.12;

    const maxLineas =
    opciones.maxLineas || 5;

    let tamano =
    tamanoInicial;

    let lineas = [];

    while(tamano >= tamanoMinimo){

        pdf.setFont(
            fuente,
            estilo
        );

        pdf.setFontSize(
            tamano
        );

        lineas =
        dividirTextoManualPdf(
            pdf,
            texto,
            ancho
        );

        const altoLinea =
        tamano * 0.3528 * espacioLinea;

        const altoTexto =
        lineas.length * altoLinea;

        if(
            lineas.length <= maxLineas &&
            altoTexto <= alto
        ){

            break;

        }

        tamano -= 0.4;

    }

    pdf.setFont(
        fuente,
        estilo
    );

    pdf.setFontSize(
        tamano
    );

    pdf.setTextColor(
        color[0],
        color[1],
        color[2]
    );

    lineas =
    dividirTextoManualPdf(
        pdf,
        texto,
        ancho
    ).slice(
        0,
        maxLineas
    );

    const altoLinea =
    tamano * 0.3528 * espacioLinea;

    const yTexto =
    yInicio + (tamano * 0.35);

    pdf.text(
        lineas,
        x,
        yTexto,
        {
            align:'left',
            maxWidth:ancho,
            lineHeightFactor:espacioLinea
        }
    );

}


// =====================================
// GENERAR PDF
// Diseño certificado premium sin plantilla externa
// Constructores del Reino
// =====================================

async function generarPdfPalabra(modo = 'descargar'){

    const nombreInput =
    document.getElementById('pdfNombrePersona');

    const dedicatoriaInput =
    document.getElementById('pdfDedicatoria');

    const nombrePersona =
    nombreInput ? nombreInput.value.trim() : '';

    const dedicatoria =
    dedicatoriaInput ? dedicatoriaInput.value.trim() : '';

    if(!nombrePersona){

        alert(
            'Por favor escribe el nombre de la persona.'
        );

        return;

    }

    if(!dedicatoria){

        alert(
            'Por favor escribe una dedicatoria.'
        );

        return;

    }

    if(!window.jspdf || !window.jspdf.jsPDF){

        alert(
            'No se pudo cargar la librería para generar PDF.'
        );

        return;

    }

    const { jsPDF } = window.jspdf;

    const pdf =
    new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
    });

    const anchoPagina =
    pdf.internal.pageSize.getWidth();

    const altoPagina =
    pdf.internal.pageSize.getHeight();

    const azul =
    [8, 35, 67];

    const azulOscuro =
    [5, 24, 50];

    const dorado =
    [211, 164, 55];

    const doradoSuave =
    [238, 205, 125];

    const marfil =
    [255, 252, 246];

    const crema =
    [250, 245, 232];

    const gris =
    [43, 38, 70];

    const blanco =
    [255, 255, 255];

    // =====================================
    // FONDO GENERAL
    // =====================================

    pdf.setFillColor(
        marfil[0],
        marfil[1],
        marfil[2]
    );

    pdf.rect(
        0,
        0,
        anchoPagina,
        altoPagina,
        'F'
    );

    // Borde exterior
    pdf.setDrawColor(
        219,
        202,
        160
    );

    pdf.setLineWidth(
        0.45
    );

    pdf.rect(
        6,
        6,
        anchoPagina - 12,
        altoPagina - 12
    );

    // Franja azul superior
    pdf.setFillColor(
        azul[0],
        azul[1],
        azul[2]
    );

    pdf.rect(
        0,
        0,
        anchoPagina,
        42,
        'F'
    );

    // Curva inferior simulada de la franja
    pdf.setFillColor(
        marfil[0],
        marfil[1],
        marfil[2]
    );

    pdf.ellipse(
        anchoPagina / 2,
        49,
        130,
        22,
        'F'
    );

    // Línea dorada curva simulada
    pdf.setDrawColor(
        doradoSuave[0],
        doradoSuave[1],
        doradoSuave[2]
    );

    pdf.setLineWidth(
        1.2
    );

    pdf.line(
        0,
        75,
        anchoPagina,
        75
    );

    // =====================================
    // LOGO SUPERIOR
    // =====================================

    const logoApp =
    await cargarImagenComoBase64(
        './assets/icons/logo.png?v=' + Date.now()
    );

    // Caja del logo
    pdf.setFillColor(
        blanco[0],
        blanco[1],
        blanco[2]
    );

    pdf.setDrawColor(
        dorado[0],
        dorado[1],
        dorado[2]
    );

    pdf.roundedRect(
        44,
        10,
        128,
        38,
        3,
        3,
        'FD'
    );

    if(logoApp){

        pdf.addImage(
            logoApp,
            'PNG',
            54,
            14,
            108,
            28
        );

    }

    // =====================================
    // ENCABEZADO PERSONAL
    // =====================================

    pdf.setDrawColor(
        dorado[0],
        dorado[1],
        dorado[2]
    );

    pdf.setLineWidth(
        0.55
    );

    pdf.line(
        58,
        69,
        98,
        69
    );

    pdf.line(
        118,
        69,
        158,
        69
    );

    pdf.setFillColor(
        dorado[0],
        dorado[1],
        dorado[2]
    );

    pdf.circle(
        anchoPagina / 2,
        69,
        1.6,
        'F'
    );

    pdf.setFont(
        'times',
        'bold'
    );

    pdf.setFontSize(
        17
    );

    pdf.setTextColor(
        azulOscuro[0],
        azulOscuro[1],
        azulOscuro[2]
    );

    pdf.text(
        'Preparado especialmente para',
        anchoPagina / 2,
        87,
        {
            align:'center'
        }
    );

    escribirTextoCentradoEnCajaPdf(
        pdf,
        {
            texto:nombrePersona,
            xCentro:anchoPagina / 2,
            yInicio:94,
            ancho:140,
            alto:18,
            fuente:'times',
            estilo:'bolditalic',
            tamanoInicial:33,
            tamanoMinimo:17,
            color:dorado,
            maxLineas:1,
            espacioLinea:1
        }
    );

    // =====================================
    // TARJETA PRINCIPAL BLANCA
    // =====================================

    pdf.setFillColor(
        blanco[0],
        blanco[1],
        blanco[2]
    );

    pdf.setDrawColor(
        226,
        198,
        135
    );

    pdf.roundedRect(
        18,
        120,
        anchoPagina - 36,
        127,
        5,
        5,
        'FD'
    );

    // Cinta azul izquierda
    pdf.setFillColor(
        azul[0],
        azul[1],
        azul[2]
    );

    pdf.roundedRect(
        24,
        119,
        14,
        44,
        2,
        2,
        'F'
    );

    pdf.setFillColor(
        blanco[0],
        blanco[1],
        blanco[2]
    );

    pdf.triangle(
        24,
        163,
        31,
        155,
        38,
        163,
        'F'
    );

    // Icono Biblia
    pdf.setFillColor(
        azul[0],
        azul[1],
        azul[2]
    );

    pdf.circle(
        57,
        143,
        10,
        'F'
    );

    pdf.setDrawColor(
        dorado[0],
        dorado[1],
        dorado[2]
    );

    pdf.setLineWidth(
        0.8
    );

    pdf.rect(
        53,
        139,
        8,
        8
    );

    pdf.line(
        57,
        139,
        57,
        147
    );

    // Icono corazón
    pdf.setFillColor(
        azul[0],
        azul[1],
        azul[2]
    );

    pdf.circle(
        57,
        200,
        10,
        'F'
    );

    pdf.setDrawColor(
        dorado[0],
        dorado[1],
        dorado[2]
    );

    pdf.setLineWidth(
        1
    );

    pdf.line(
        52,
        199,
        57,
        205
    );

    pdf.line(
        57,
        205,
        63,
        198
    );

    pdf.circle(
        54,
        197,
        2.2
    );

    pdf.circle(
        60,
        197,
        2.2
    );

    // =====================================
    // COMO ÉL HA DICHO
    // =====================================

    pdf.setFont(
        'times',
        'bold'
    );

    pdf.setFontSize(
        20
    );

    pdf.setTextColor(
        azulOscuro[0],
        azulOscuro[1],
        azulOscuro[2]
    );

    pdf.text(
        'COMO ÉL HA DICHO:',
        anchoPagina / 2,
        139,
        {
            align:'center'
        }
    );

    pdf.setDrawColor(
        dorado[0],
        dorado[1],
        dorado[2]
    );

    pdf.line(
        74,
        147,
        101,
        147
    );

    pdf.line(
        115,
        147,
        142,
        147
    );

    pdf.setFillColor(
        dorado[0],
        dorado[1],
        dorado[2]
    );

    pdf.circle(
        anchoPagina / 2,
        147,
        1.4,
        'F'
    );

    const textoPalabra =
    palabraSeleccionadaPdf.texto ||
    '';

    escribirTextoCentradoEnCajaPdf(
        pdf,
        {
            texto:textoPalabra,
            xCentro:anchoPagina / 2,
            yInicio:157,
            ancho:132,
            alto:34,
            fuente:'times',
            estilo:'italic',
            tamanoInicial:14,
            tamanoMinimo:7,
            color:gris,
            maxLineas:5,
            espacioLinea:1.08
        }
    );

    // Referencia bíblica en píldora azul
    if(palabraSeleccionadaPdf.versiculo){

        pdf.setFillColor(
            azul[0],
            azul[1],
            azul[2]
        );

        pdf.setDrawColor(
            dorado[0],
            dorado[1],
            dorado[2]
        );

        pdf.roundedRect(
            80,
            190,
            56,
            14,
            6,
            6,
            'FD'
        );

        escribirTextoCentradoEnCajaPdf(
            pdf,
            {
                texto:palabraSeleccionadaPdf.versiculo,
                xCentro:anchoPagina / 2,
                yInicio:191,
                ancho:52,
                alto:11,
                fuente:'times',
                estilo:'bold',
                tamanoInicial:12.8,
                tamanoMinimo:8,
                color:blanco,
                maxLineas:1,
                espacioLinea:1
            }
        );

    }

    // =====================================
    // DECLARACIÓN
    // =====================================

    pdf.setFont(
        'times',
        'bold'
    );

    pdf.setFontSize(
        18
    );

    pdf.setTextColor(
        azulOscuro[0],
        azulOscuro[1],
        azulOscuro[2]
    );

    pdf.text(
        'PODEMOS DECIR CONFIADAMENTE:',
        anchoPagina / 2,
        219,
        {
            align:'center'
        }
    );

    pdf.setDrawColor(
        dorado[0],
        dorado[1],
        dorado[2]
    );

    pdf.line(
        70,
        226,
        101,
        226
    );

    pdf.line(
        115,
        226,
        146,
        226
    );

    pdf.setFillColor(
        dorado[0],
        dorado[1],
        dorado[2]
    );

    pdf.circle(
        anchoPagina / 2,
        226,
        1.5,
        'F'
    );

    const declaracion =
    palabraSeleccionadaPdf.declaracion ||
    'Dios está conmigo, me ama y fortalece mi vida.';

    escribirTextoCentradoEnCajaPdf(
        pdf,
        {
            texto:`“${declaracion}”`,
            xCentro:anchoPagina / 2,
            yInicio:232,
            ancho:142,
            alto:15,
            fuente:'times',
            estilo:'italic',
            tamanoInicial:13,
            tamanoMinimo:7,
            color:gris,
            maxLineas:2,
            espacioLinea:1.08
        }
    );

    // =====================================
    // PIE FINAL
    // =====================================

    pdf.setDrawColor(
        dorado[0],
        dorado[1],
        dorado[2]
    );

    pdf.line(
        52,
        258,
        98,
        258
    );

    pdf.line(
        118,
        258,
        164,
        258
    );

    pdf.setFillColor(
        dorado[0],
        dorado[1],
        dorado[2]
    );

    pdf.circle(
        anchoPagina / 2,
        258,
        1.3,
        'F'
    );

    escribirTextoCentradoEnCajaPdf(
        pdf,
        {
            texto:'Oramos que esta palabra fortalezca tu vida y te recuerde quién eres en Él.',
            xCentro:anchoPagina / 2,
            yInicio:263,
            ancho:170,
            alto:11,
            fuente:'times',
            estilo:'normal',
            tamanoInicial:12,
            tamanoMinimo:8,
            color:azulOscuro,
            maxLineas:2,
            espacioLinea:1.04
        }
    );

    escribirTextoCentradoEnCajaPdf(
        pdf,
        {
            texto:'Constructores del Reino',
            xCentro:anchoPagina / 2,
            yInicio:283,
            ancho:130,
            alto:8,
            fuente:'times',
            estilo:'bold',
            tamanoInicial:17,
            tamanoMinimo:10,
            color:azulOscuro,
            maxLineas:1,
            espacioLinea:1
        }
    );

    escribirTextoCentradoEnCajaPdf(
        pdf,
        {
            texto:'EDIFICAMOS · ENSEÑAMOS · TRANSFORMAMOS',
            xCentro:anchoPagina / 2,
            yInicio:292,
            ancho:150,
            alto:6,
            fuente:'times',
            estilo:'normal',
            tamanoInicial:8.5,
            tamanoMinimo:7,
            color:dorado,
            maxLineas:1,
            espacioLinea:1
        }
    );

    const nombreArchivo =
    generarNombrePdfUnico(
        nombrePersona,
        palabraSeleccionadaPdf.versiculo
    );

    if(modo === 'archivo'){

        const blob =
        pdf.output('blob');

        return new File(
            [blob],
            nombreArchivo,
            {
                type:'application/pdf'
            }
        );

    }

    pdf.save(nombreArchivo);

    cerrarModalPdf();

    return null;

}


// =====================================
// GENERAR NOMBRE ÚNICO PARA PDF
// Evita errores cuando un PDF anterior
// está abierto en Adobe o en otra app.
// =====================================

function generarNombrePdfUnico(nombrePersona, referenciaBiblica = ''){

    const ahora =
    new Date();

    const fecha =
    `${ahora.getFullYear()}-${
        String(ahora.getMonth() + 1).padStart(2, '0')
    }-${
        String(ahora.getDate()).padStart(2, '0')
    }`;

    const hora =
    `${String(ahora.getHours()).padStart(2, '0')}${
        String(ahora.getMinutes()).padStart(2, '0')
    }${
        String(ahora.getSeconds()).padStart(2, '0')
    }`;

    const persona =
    String(nombrePersona || 'Persona')
    .trim();

    const referencia =
    String(referenciaBiblica || '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/[–—]/g, '-');

    const parteReferencia =
    referencia
    ? `_${referencia}`
    : '';

    return limpiarNombreArchivo(
        `ConstructoresDelReino_${persona}${parteReferencia}_${fecha}_${hora}.pdf`
    );

}


// =====================================
// LIMPIAR NOMBRE DE ARCHIVO
// =====================================

function limpiarNombreArchivo(nombre){

    return nombre
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_');

}

// =====================================
// DISPONIBLE GLOBALMENTE
// =====================================

window.abrirModalPdfPalabra =
abrirModalPdfPalabra;

window.crearBotonDescargarPdf =
crearBotonDescargarPdf;

window.extraerDatosPalabraDesdeCard =
extraerDatosPalabraDesdeCard;

window.compartirWhatsAppPalabra =
compartirWhatsAppPalabra;

// =====================================
// INICIAR APP
// =====================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        cargarCategorias();

        cargarPalabraDelDia();

        prepararModalPdf();

    }
);
