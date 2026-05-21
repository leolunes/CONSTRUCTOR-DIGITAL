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
            '📥 Descargar PDF para enviar por WhatsApp';

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
        `💜 *Victoriosos en Cristo*\\n\\n` +
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
// DESCARGAR PDF PARA ENVIAR POR WHATSAPP
// Método seguro:
// 1. Descarga el PDF real en el celular.
// 2. NO comparte texto.
// 3. NO comparte enlaces.
// 4. NO genera blob visible en WhatsApp.
// 5. El usuario envía manualmente el PDF desde Descargas.
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

    await generarPdfPalabra(
        'descargar'
    );

    alert(
        'PDF descargado correctamente. Ahora abre WhatsApp, entra al chat de la persona y adjunta este PDF desde Descargas como documento.'
    );

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
    opciones.espacioLinea || 1.22;

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

        const lineasUsadas =
        lineas.slice(
            0,
            maxLineas
        );

        const altoLinea =
        tamano * 0.3528 * espacioLinea;

        const altoTexto =
        lineasUsadas.length * altoLinea;

        if(
            lineas.length <= maxLineas &&
            altoTexto <= alto
        ){

            break;

        }

        tamano -= 0.5;

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
    yInicio + ((alto - altoTexto) / 2) + (tamano * 0.3528);

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

// =====================================
// GENERAR PDF
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

    const morado =
    [97, 59, 204];

    const gris =
    [76, 70, 104];

    const oscuro =
    [24, 18, 55];

    // =====================================
    // PLANTILLA VISUAL FIJA
    // =====================================

    const plantilla =
    await cargarImagenComoBase64(
        './assets/pdf/pdf-template-victoriosos.png'
    );

    if(plantilla){

        pdf.addImage(
            plantilla,
            'PNG',
            0,
            0,
            anchoPagina,
            altoPagina
        );

    }else{

        pdf.setFillColor(
            249,
            246,
            255
        );

        pdf.rect(
            0,
            0,
            anchoPagina,
            altoPagina,
            'F'
        );

    }

    // =====================================
    // LOGO REAL
    // =====================================

    const logoApp =
    await cargarImagenComoBase64(
        './assets/icons/logo.png'
    );

    if(logoApp){

        pdf.addImage(
            logoApp,
            'PNG',
            25,
            16,
            166,
            40
        );

    }

    // =====================================
    // DESTINATARIO
    // =====================================

    const textoDestino =
    `Preparado especialmente para ${nombrePersona}`;

    escribirTextoCentradoEnCajaPdf(
        pdf,
        {
            texto:textoDestino,
            xCentro:anchoPagina / 2,
            yInicio:72,
            ancho:178,
            alto:18,
            fuente:'times',
            estilo:'bold',
            tamanoInicial:22,
            tamanoMinimo:13,
            color:oscuro,
            maxLineas:2,
            espacioLinea:1.15
        }
    );

    // =====================================
    // DEDICATORIA
    // Texto centrado dentro del recuadro.
    // No usa comillas externas para evitar cortes.
    // =====================================

    escribirTextoCentradoEnCajaPdf(
        pdf,
        {
            texto:dedicatoria,
            xCentro:anchoPagina / 2,
            yInicio:96,
            ancho:118,
            alto:18,
            fuente:'times',
            estilo:'italic',
            tamanoInicial:13,
            tamanoMinimo:7.5,
            color:gris,
            maxLineas:4,
            espacioLinea:1.08
        }
    );

    // =====================================
    // TÍTULO
    // =====================================

    const titulo =
    palabraSeleccionadaPdf.titulo ||
    'Palabra de bendición';

    escribirTextoCentradoEnCajaPdf(
        pdf,
        {
            texto:titulo,
            xCentro:anchoPagina / 2,
            yInicio:132,
            ancho:140,
            alto:22,
            fuente:'times',
            estilo:'bold',
            tamanoInicial:24,
            tamanoMinimo:13,
            color:morado,
            maxLineas:2,
            espacioLinea:1.12
        }
    );

    // =====================================
    // COMO ÉL HA DICHO
    // =====================================

    pdf.setFont(
        'times',
        'bold'
    );

    pdf.setFontSize(14);

    pdf.setTextColor(
        oscuro[0],
        oscuro[1],
        oscuro[2]
    );

    pdf.text(
        'Como Él ha dicho:',
        78,
        169
    );

    const textoPalabra =
    palabraSeleccionadaPdf.texto ||
    palabraSeleccionadaPdf.versiculo ||
    '';

    escribirTextoCentradoEnCajaPdf(
        pdf,
        {
            texto:textoPalabra,
            xCentro:137,
            yInicio:173,
            ancho:112,
            alto:16,
            fuente:'times',
            estilo:'normal',
            tamanoInicial:13,
            tamanoMinimo:8,
            color:gris,
            maxLineas:3,
            espacioLinea:1.08
        }
    );

    // =====================================
    // VERSÍCULO
    // =====================================

    if(palabraSeleccionadaPdf.versiculo){

        escribirTextoCentradoEnCajaPdf(
            pdf,
            {
                texto:palabraSeleccionadaPdf.versiculo,
                xCentro:anchoPagina / 2,
                yInicio:191,
                ancho:82,
                alto:11,
                fuente:'helvetica',
                estilo:'bold',
                tamanoInicial:12,
                tamanoMinimo:8,
                color:morado,
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

    pdf.setFontSize(13.8);

    pdf.setTextColor(
        oscuro[0],
        oscuro[1],
        oscuro[2]
    );

    pdf.text(
        'Podemos decir confiadamente:',
        78,
        210
    );

    const declaracion =
    palabraSeleccionadaPdf.declaracion ||
    'Dios está conmigo, me ama y fortalece mi vida.';

    escribirTextoCentradoEnCajaPdf(
        pdf,
        {
            texto:declaracion,
            xCentro:137,
            yInicio:214,
            ancho:112,
            alto:18,
            fuente:'times',
            estilo:'normal',
            tamanoInicial:12.7,
            tamanoMinimo:7.8,
            color:gris,
            maxLineas:3,
            espacioLinea:1.08
        }
    );

    // =====================================
    // FIRMA FINAL
    // =====================================

    escribirTextoCentradoEnCajaPdf(
        pdf,
        {
            texto:'Oramos que esta palabra fortalezca tu vida.',
            xCentro:anchoPagina / 2,
            yInicio:249,
            ancho:170,
            alto:13,
            fuente:'times',
            estilo:'bold',
            tamanoInicial:16,
            tamanoMinimo:11,
            color:oscuro,
            maxLineas:2,
            espacioLinea:1.05
        }
    );

    escribirTextoCentradoEnCajaPdf(
        pdf,
        {
            texto:'Victoriosos en Cristo',
            xCentro:anchoPagina / 2,
            yInicio:270,
            ancho:120,
            alto:10,
            fuente:'times',
            estilo:'normal',
            tamanoInicial:14,
            tamanoMinimo:10,
            color:oscuro,
            maxLineas:1,
            espacioLinea:1
        }
    );

    const nombreArchivo =
    limpiarNombreArchivo(
        `Palabra_para_${nombrePersona}.pdf`
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

        prepararModalPdf();

    }
);
