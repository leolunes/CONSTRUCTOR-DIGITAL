// =====================================
// CARGAR CATEGORÍAS
// =====================================

async function cargarCategorias(){

    try{

        const respuesta =
        await fetch('./data/categorias.json');

        const categorias =
        await respuesta.json();

        mostrarCategorias(categorias);

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

        generarPdfPalabra();

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
// GENERAR PDF
// =====================================

async function generarPdfPalabra(){

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

    const margen =
    14;

    let y =
    18;

    const morado =
    [97, 59, 204];

    const moradoOscuro =
    [42, 20, 86];

    const lavanda =
    [248, 244, 255];

    const lavandaFuerte =
    [237, 223, 255];

    const gris =
    [83, 76, 105];

    const oscuro =
    [28, 20, 58];

    // =====================================
    // FONDO GENERAL
    // =====================================

    pdf.setFillColor(
        lavanda[0],
        lavanda[1],
        lavanda[2]
    );

    pdf.rect(
        0,
        0,
        anchoPagina,
        altoPagina,
        'F'
    );

    // Detalles decorativos laterales suaves
    pdf.setDrawColor(
        224,
        210,
        250
    );

    pdf.setLineWidth(0.35);

    for(let i = 0; i < 5; i++){

        pdf.line(
            margen - 4,
            92 + i * 11,
            margen + 10,
            108 + i * 11
        );

        pdf.line(
            anchoPagina - margen + 4,
            92 + i * 11,
            anchoPagina - margen - 10,
            108 + i * 11
        );

    }

    // =====================================
    // ENCABEZADO CON LOGO
    // =====================================

    const logoApp =
    await cargarImagenComoBase64(
        './assets/icons/logo.png'
    );

    const headerX =
    margen;

    const headerY =
    y;

    const headerW =
    anchoPagina - margen * 2;

    const headerH =
    58;

    pdf.setFillColor(
        255,
        255,
        255
    );

    pdf.roundedRect(
        headerX,
        headerY,
        headerW,
        headerH,
        5,
        5,
        'F'
    );

    pdf.setDrawColor(
        220,
        205,
        255
    );

    pdf.roundedRect(
        headerX,
        headerY,
        headerW,
        headerH,
        5,
        5,
        'S'
    );

    if(logoApp){

        pdf.addImage(
            logoApp,
            'PNG',
            headerX + 8,
            headerY + 8,
            headerW - 16,
            headerH - 16
        );

    }

    y += headerH + 20;

    // =====================================
    // DESTINATARIO CENTRADO
    // =====================================

    pdf.setTextColor(
        oscuro[0],
        oscuro[1],
        oscuro[2]
    );

    pdf.setFont(
        'times',
        'bold'
    );

    pdf.setFontSize(22);

    pdf.text(
        `Preparado especialmente para ${nombrePersona}`,
        anchoPagina / 2,
        y,
        {
            align:'center'
        }
    );

    y += 14;

    // =====================================
    // DEDICATORIA TIPO TARJETA
    // =====================================

    const dedX =
    34;

    const dedW =
    anchoPagina - 68;

    const dedH =
    26;

    pdf.setFillColor(
        249,
        241,
        255
    );

    pdf.roundedRect(
        dedX,
        y,
        dedW,
        dedH,
        5,
        5,
        'F'
    );

    pdf.setDrawColor(
        222,
        193,
        255
    );

    pdf.roundedRect(
        dedX,
        y,
        dedW,
        dedH,
        5,
        5,
        'S'
    );

    // Comillas decorativas simples
    pdf.setFont(
        'times',
        'bold'
    );

    pdf.setFontSize(28);

    pdf.setTextColor(
        178,
        116,
        235
    );

    pdf.text(
        '“',
        dedX + 7,
        y + 17
    );

    pdf.setFont(
        'times',
        'italic'
    );

    pdf.setFontSize(13);

    pdf.setTextColor(
        gris[0],
        gris[1],
        gris[2]
    );

    const dedicatoriaTexto =
    pdf.splitTextToSize(
        `“${dedicatoria}”`,
        dedW - 32
    );

    pdf.text(
        dedicatoriaTexto,
        dedX + 22,
        y + 15
    );

    y += dedH + 18;

    // =====================================
    // TARJETA PRINCIPAL DEVOCIONAL
    // =====================================

    const cardX =
    26;

    const cardY =
    y;

    const cardW =
    anchoPagina - 52;

    const cardH =
    116;

    pdf.setFillColor(
        255,
        255,
        255
    );

    pdf.roundedRect(
        cardX,
        cardY,
        cardW,
        cardH,
        6,
        6,
        'F'
    );

    pdf.setDrawColor(
        219,
        202,
        250
    );

    pdf.roundedRect(
        cardX,
        cardY,
        cardW,
        cardH,
        6,
        6,
        'S'
    );

    // Línea lateral morada
    pdf.setFillColor(
        morado[0],
        morado[1],
        morado[2]
    );

    pdf.roundedRect(
        cardX,
        cardY,
        3,
        cardH,
        2,
        2,
        'F'
    );

    // Título
    pdf.setFont(
        'times',
        'bold'
    );

    pdf.setFontSize(26);

    pdf.setTextColor(
        morado[0],
        morado[1],
        morado[2]
    );

    const titulo =
    palabraSeleccionadaPdf.titulo ||
    'Palabra de bendición';

    const lineasTitulo =
    pdf.splitTextToSize(
        titulo,
        cardW - 24
    );

    pdf.text(
        lineasTitulo,
        cardX + 14,
        cardY + 17
    );

    // Decoración central bajo título
    pdf.setDrawColor(
        210,
        183,
        245
    );

    pdf.line(
        anchoPagina / 2 - 24,
        cardY + 28,
        anchoPagina / 2 - 5,
        cardY + 28
    );

    pdf.line(
        anchoPagina / 2 + 5,
        cardY + 28,
        anchoPagina / 2 + 24,
        cardY + 28
    );

    pdf.setFillColor(
        morado[0],
        morado[1],
        morado[2]
    );

    pdf.circle(
        anchoPagina / 2,
        cardY + 28,
        1.6,
        'F'
    );

    // Sección "Como Él ha dicho"
    const icon1X =
    cardX + 22;

    const icon1Y =
    cardY + 46;

    pdf.setFillColor(
        239,
        225,
        255
    );

    pdf.circle(
        icon1X,
        icon1Y,
        9,
        'F'
    );

    pdf.setFont(
        'helvetica',
        'bold'
    );

    pdf.setFontSize(12);

    pdf.setTextColor(
        morado[0],
        morado[1],
        morado[2]
    );

    pdf.text(
        'Biblia',
        icon1X,
        icon1Y + 1,
        {
            align:'center'
        }
    );

    pdf.setFont(
        'times',
        'bold'
    );

    pdf.setFontSize(15);

    pdf.setTextColor(
        oscuro[0],
        oscuro[1],
        oscuro[2]
    );

    pdf.text(
        'Como Él ha dicho:',
        cardX + 42,
        cardY + 43
    );

    pdf.setFont(
        'times',
        'normal'
    );

    pdf.setFontSize(14);

    pdf.setTextColor(
        gris[0],
        gris[1],
        gris[2]
    );

    const textoPalabra =
    palabraSeleccionadaPdf.texto ||
    palabraSeleccionadaPdf.versiculo ||
    '';

    const lineasTexto =
    pdf.splitTextToSize(
        textoPalabra,
        cardW - 70
    );

    pdf.text(
        lineasTexto,
        cardX + 42,
        cardY + 52
    );

    // Línea punteada
    pdf.setDrawColor(
        210,
        183,
        245
    );

    pdf.setLineDashPattern(
        [1.3, 1.5],
        0
    );

    pdf.line(
        cardX + 16,
        cardY + 66,
        cardX + cardW - 16,
        cardY + 66
    );

    pdf.setLineDashPattern(
        [],
        0
    );

    // Versículo en cápsula
    if(palabraSeleccionadaPdf.versiculo){

        const versiculoTxt =
        palabraSeleccionadaPdf.versiculo;

        const versW =
        Math.min(
            70,
            pdf.getTextWidth(versiculoTxt) + 22
        );

        pdf.setFillColor(
            239,
            225,
            255
        );

        pdf.roundedRect(
            anchoPagina / 2 - versW / 2,
            cardY + 73,
            versW,
            11,
            5,
            5,
            'F'
        );

        pdf.setFont(
            'helvetica',
            'bold'
        );

        pdf.setFontSize(11);

        pdf.setTextColor(
            morado[0],
            morado[1],
            morado[2]
        );

        pdf.text(
            versiculoTxt,
            anchoPagina / 2,
            cardY + 80.2,
            {
                align:'center'
            }
        );

    }

    // Segunda línea punteada
    pdf.setDrawColor(
        210,
        183,
        245
    );

    pdf.setLineDashPattern(
        [1.3, 1.5],
        0
    );

    pdf.line(
        cardX + 16,
        cardY + 91,
        cardX + cardW - 16,
        cardY + 91
    );

    pdf.setLineDashPattern(
        [],
        0
    );

    // Declaración
    const icon2X =
    cardX + 22;

    const icon2Y =
    cardY + 103;

    pdf.setFillColor(
        239,
        225,
        255
    );

    pdf.circle(
        icon2X,
        icon2Y,
        9,
        'F'
    );

    pdf.setFont(
        'helvetica',
        'bold'
    );

    pdf.setFontSize(14);

    pdf.setTextColor(
        morado[0],
        morado[1],
        morado[2]
    );

    pdf.text(
        '♥',
        icon2X,
        icon2Y + 4,
        {
            align:'center'
        }
    );

    pdf.setFont(
        'times',
        'bold'
    );

    pdf.setFontSize(15);

    pdf.setTextColor(
        oscuro[0],
        oscuro[1],
        oscuro[2]
    );

    pdf.text(
        'Podemos decir confiadamente:',
        cardX + 42,
        cardY + 101
    );

    pdf.setFont(
        'times',
        'normal'
    );

    pdf.setFontSize(13.5);

    pdf.setTextColor(
        gris[0],
        gris[1],
        gris[2]
    );

    const declaracion =
    palabraSeleccionadaPdf.declaracion ||
    'Dios está conmigo, me ama y fortalece mi vida.';

    const lineasDeclaracion =
    pdf.splitTextToSize(
        `“${declaracion}”`,
        cardW - 70
    );

    pdf.text(
        lineasDeclaracion,
        cardX + 42,
        cardY + 110
    );

    y =
    cardY + cardH + 16;

    // =====================================
    // FIRMA FINAL DECORADA
    // =====================================

    pdf.setDrawColor(
        morado[0],
        morado[1],
        morado[2]
    );

    pdf.setLineWidth(0.35);

    pdf.line(
        margen,
        y,
        anchoPagina / 2 - 8,
        y
    );

    pdf.line(
        anchoPagina / 2 + 8,
        y,
        anchoPagina - margen,
        y
    );

    pdf.setFillColor(
        morado[0],
        morado[1],
        morado[2]
    );

    pdf.circle(
        anchoPagina / 2,
        y,
        1.5,
        'F'
    );

    y += 12;

    pdf.setFont(
        'times',
        'bold'
    );

    pdf.setFontSize(18);

    pdf.setTextColor(
        oscuro[0],
        oscuro[1],
        oscuro[2]
    );

    pdf.text(
        'Oramos que esta palabra fortalezca tu vida.',
        anchoPagina / 2,
        y,
        {
            align:'center'
        }
    );

    y += 13;

    pdf.setDrawColor(
        morado[0],
        morado[1],
        morado[2]
    );

    pdf.line(
        anchoPagina / 2 - 6,
        y - 5,
        anchoPagina / 2 + 6,
        y - 5
    );

    pdf.setFont(
        'times',
        'normal'
    );

    pdf.setFontSize(15);

    pdf.setTextColor(
        oscuro[0],
        oscuro[1],
        oscuro[2]
    );

    pdf.text(
        'Victoriosos en Cristo',
        anchoPagina / 2,
        y + 4,
        {
            align:'center'
        }
    );

    const nombreArchivo =
    limpiarNombreArchivo(
        `Palabra_para_${nombrePersona}.pdf`
    );

    pdf.save(nombreArchivo);

    cerrarModalPdf();

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

// =====================================
// INICIAR APP
// =====================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        cargarCategorias();

        prepararModalPdf();

    }
);
