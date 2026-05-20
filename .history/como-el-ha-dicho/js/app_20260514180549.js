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

    const margen =
    20;

    let y =
    24;

    const morado =
    [97, 59, 204];

    const gris =
    [93, 86, 112];

    const oscuro =
    [38, 26, 61];

    // Fondo suave
    pdf.setFillColor(248, 244, 255);
    pdf.rect(
        0,
        0,
        anchoPagina,
        pdf.internal.pageSize.getHeight(),
        'F'
    );

    // =====================================
    // ENCABEZADO CON LOGO REAL DE LA APP
    // =====================================

    const logoApp =
    await cargarImagenComoBase64(
        './assets/icons/logo.png'
    );

    const altoHeader =
    54;

    pdf.setFillColor(
        morado[0],
        morado[1],
        morado[2]
    );

    pdf.roundedRect(
        margen,
        y,
        anchoPagina - margen * 2,
        altoHeader,
        6,
        6,
        'F'
    );

    // Logo real
    if(logoApp){

        pdf.addImage(
            logoApp,
            'PNG',
            margen + 8,
            y + 8,
            58,
            32
        );

    }

    // Textos del encabezado
    pdf.setTextColor(
        255,
        255,
        255
    );

    pdf.setFont(
        'helvetica',
        'bold'
    );

    pdf.setFontSize(17);

    pdf.text(
        'Victoriosos en Cristo',
        margen + 72,
        y + 18
    );

    pdf.setFont(
        'helvetica',
        'normal'
    );

    pdf.setFontSize(9);

    const subtituloHeader =
    pdf.splitTextToSize(
        'Declaraciones bíblicas para restaurar, sanar y fortalecer tu hogar',
        anchoPagina - margen * 2 - 82
    );

    pdf.text(
        subtituloHeader,
        margen + 72,
        y + 28
    );

    y += 70;

    // Nombre destinatario
    pdf.setTextColor(
        oscuro[0],
        oscuro[1],
        oscuro[2]
    );

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);

    pdf.text(
        `Para ${nombrePersona}`,
        margen,
        y
    );

    y += 12;

    // Dedicatoria
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(12);
    pdf.setTextColor(
        gris[0],
        gris[1],
        gris[2]
    );

    const lineasDedicatoria =
    pdf.splitTextToSize(
        `"${dedicatoria}"`,
        anchoPagina - margen * 2
    );

    pdf.text(
        lineasDedicatoria,
        margen,
        y
    );

    y += lineasDedicatoria.length * 6 + 12;

    // Título palabra
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
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
        anchoPagina - margen * 2
    );

    pdf.text(
        lineasTitulo,
        margen,
        y
    );

    y += lineasTitulo.length * 8 + 10;

    // Como Él ha dicho
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(
        oscuro[0],
        oscuro[1],
        oscuro[2]
    );

    pdf.text(
        'Como Él ha dicho:',
        margen,
        y
    );

    y += 9;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
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
        anchoPagina - margen * 2
    );

    pdf.text(
        lineasTexto,
        margen,
        y
    );

    y += lineasTexto.length * 6 + 8;

    if(palabraSeleccionadaPdf.versiculo){

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(
            oscuro[0],
            oscuro[1],
            oscuro[2]
        );

        pdf.text(
            palabraSeleccionadaPdf.versiculo,
            margen,
            y
        );

        y += 12;

    }

    // Declaración
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(
        oscuro[0],
        oscuro[1],
        oscuro[2]
    );

    pdf.text(
        'Podemos decir confiadamente:',
        margen,
        y
    );

    y += 9;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
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
        `"${declaracion}"`,
        anchoPagina - margen * 2
    );

    pdf.text(
        lineasDeclaracion,
        margen,
        y
    );

    y += lineasDeclaracion.length * 6 + 18;

    // Firma
    pdf.setDrawColor(
        morado[0],
        morado[1],
        morado[2]
    );

    pdf.line(
        margen,
        y,
        anchoPagina - margen,
        y
    );

    y += 10;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(
        morado[0],
        morado[1],
        morado[2]
    );

    pdf.text(
        'Con cariño y fe,',
        margen,
        y
    );

    y += 7;

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(
        gris[0],
        gris[1],
        gris[2]
    );

    pdf.text(
        'Victoriosos en Cristo',
        margen,
        y
    );

    // Pie
    pdf.setFontSize(9);
    pdf.setTextColor(130, 120, 150);

    pdf.text(
        'Esta palabra fue preparada para compartir esperanza, amor y fortaleza espiritual.',
        margen,
        267
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
