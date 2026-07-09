// =====================================
// MOTOR GENERAL DE TEST ESPIRITUALES
// Constructores del Reino
// =====================================

let testActual = null;
let preguntaActualIndice = 0;
let respuestasTest = {};

let testsDisponibles = [
    {
        id:"libro-1",
        archivo:"libro-1-test.json",
        titulo:"Coherencia Espiritual",
        subtitulo:"Cuando lo que crees, dices y vives deja de estar dividido",
        portada:"assets/libros/libro-1/portada.png",
        estado:"Disponible"
    },
    {
        id:"libro-2",
        archivo:"libro-2-test.json",
        titulo:"Del Aula al Altar",
        subtitulo:"Cuando el Espíritu reemplaza al sistema",
        portada:"assets/libros/libro-2/portada.png",
        estado:"Disponible"
    },
    {
        id:"libro-3",
        archivo:"libro-3-test.json",
        titulo:"A Plomo y a Nivel",
        subtitulo:"Cuando el hogar vuelve a alinearse con el cielo",
        portada:"assets/libros/libro-3/portada.png",
        estado:"Disponible"
    }
];

document.addEventListener(
    "DOMContentLoaded",
    iniciarMotorTests
);

async function iniciarMotorTests(){

    const fecha =
    document.getElementById("fechaEvaluacionTest");

    if(fecha && !fecha.value){

        fecha.value =
        new Date().toISOString().slice(0,10);

    }

    const parametros =
    new URLSearchParams(window.location.search);

    const libro =
    parametros.get("libro");

    if(libro){

        await cargarTestPorLibro(libro);

        return;

    }

    renderizarListaTests();

}

function mostrarPanel(idPanel){

    const paneles =
    document.querySelectorAll(".screen");

    paneles.forEach(panel => {
        panel.classList.remove("active");
    });

    const activo =
    document.getElementById(idPanel);

    if(activo){
        activo.classList.add("active");
    }

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

}

function renderizarListaTests(){

    const contenedor =
    document.getElementById("listaTestsDisponibles");

    if(!contenedor){
        return;
    }

    contenedor.innerHTML =
    testsDisponibles.map(test => {

        const resultado =
        obtenerResultadoGuardado(test.id);

        const estadoHtml =
        resultado
        ? `
            <div class="test-card-resultado-previo">
                <strong>${resultado.porcentaje}%</strong>
                <span>${resultado.nivel}</span>
            </div>
        `
        : `
            <div class="test-card-resultado-previo pendiente">
                <strong>Nuevo</strong>
                <span>Sin realizar</span>
            </div>
        `;

        return `

            <article class="test-disponible-card">

                <div class="test-disponible-portada">

                    <img
                    src="${test.portada}"
                    alt="${test.titulo}"
                    onerror="this.src='./assets/icons/logo.png'">

                </div>

                <div class="test-disponible-info">

                    <span class="test-disponible-badge">
                        ${test.estado}
                    </span>

                    <h2>
                        ${test.titulo}
                    </h2>

                    <p>
                        ${test.subtitulo}
                    </p>

                    ${estadoHtml}

                    <button
                    type="button"
                    onclick="cargarTestPorLibro('${test.id}')">
                        🧠 Iniciar test
                    </button>

                </div>

            </article>

        `;

    }).join("");

    mostrarPanel("pantallaListaTests");

}

async function cargarTestPorLibro(idLibro){

    try{

        const ruta =
        `./data/tests/${idLibro}-test.json`;

        const respuesta =
        await fetch(ruta, { cache:"no-store" });

        if(!respuesta.ok){
            throw new Error(`No se encontró ${ruta}`);
        }

        testActual =
        await respuesta.json();

        if(!testActual || !Array.isArray(testActual.preguntas)){
            throw new Error("El archivo del test no tiene preguntas válidas.");
        }

        preguntaActualIndice = 0;
        respuestasTest = {};

        renderizarInicioTest();

    }catch(error){

        console.error("Error cargando test:", error);

        alert(
            "Este libro todavía no tiene test disponible. Verifica que exista su archivo en data/tests/."
        );

        renderizarListaTests();

    }

}

function renderizarInicioTest(){

    const badge =
    document.getElementById("badgeTipoTest");

    const titulo =
    document.getElementById("testTitulo");

    const subtitulo =
    document.getElementById("testSubtitulo");

    const descripcion =
    document.getElementById("testDescripcion");

    if(badge){
        badge.textContent = `🧠 ${testActual.tipo || "Test espiritual"}`;
    }

    if(titulo){
        titulo.textContent = testActual.titulo;
    }

    if(subtitulo){
        subtitulo.textContent = testActual.subtitulo || "";
    }

    if(descripcion){
        descripcion.textContent =
        `${testActual.descripcion || ""} Duración aproximada: ${testActual.duracion || "5 minutos"}.`;
    }

    mostrarPanel("pantallaInicioTest");

}

function iniciarEvaluacionLibro(){

    const nombre =
    document.getElementById("nombreUsuarioTest");

    if(nombre && !nombre.value.trim()){

        nombre.focus();

        alert("Escribe el nombre de la persona antes de iniciar.");

        return;

    }

    preguntaActualIndice = 0;

    renderizarPreguntaActual();

    mostrarPanel("pantallaEvaluacionTest");

}

function renderizarPreguntaActual(){

    const pregunta =
    testActual.preguntas[preguntaActualIndice];

    const total =
    testActual.preguntas.length;

    const contenedor =
    document.getElementById("contenedorPreguntaActual");

    const contador =
    document.getElementById("contadorPreguntasTest");

    const titulo =
    document.getElementById("tituloPreguntaActual");

    const barra =
    document.getElementById("barraProgresoTest");

    const btnSiguiente =
    document.getElementById("btnSiguientePregunta");

    if(contador){
        contador.textContent = `Pregunta ${preguntaActualIndice + 1} de ${total}`;
    }

    if(titulo){
        titulo.textContent = `${pregunta.capitulo} — ${pregunta.tituloCapitulo}`;
    }

    if(barra){
        barra.style.width = `${Math.round(((preguntaActualIndice + 1) / total) * 100)}%`;
    }

    if(btnSiguiente){
        btnSiguiente.textContent =
        preguntaActualIndice === total - 1
        ? "Finalizar test ✅"
        : "Siguiente →";
    }

    const respuestaActual =
    respuestasTest[pregunta.id];

    contenedor.innerHTML = `

        <article class="pregunta-motor-card">

            <div class="pregunta-motor-top">

                <span>${pregunta.eje || "Discernimiento"}</span>

                <small>${pregunta.capitulo}</small>

            </div>

            <h3>${pregunta.pregunta}</h3>

            <div class="opciones-motor-test">

                ${pregunta.opciones.map((opcion, index) => {

                    const checked =
                    respuestaActual &&
                    respuestaActual.texto === opcion.texto
                    ? "checked"
                    : "";

                    return `

                        <label class="opcion-motor ${checked ? "seleccionada" : ""}">

                            <input
                            type="radio"
                            name="respuesta-${pregunta.id}"
                            value="${index}"
                            ${checked}
                            onchange="guardarRespuestaPregunta('${pregunta.id}', ${index})">

                            <span class="opcion-letra">
                                ${String.fromCharCode(65 + index)}
                            </span>

                            <span>${opcion.texto}</span>

                        </label>

                    `;

                }).join("")}

            </div>

            <div class="pregunta-retro-base">

                <strong>Clave espiritual</strong>

                <p>${pregunta.retroalimentacion}</p>

            </div>

        </article>

    `;

}

function guardarRespuestaPregunta(idPregunta, indiceOpcion){

    const pregunta =
    testActual.preguntas.find(item => item.id === idPregunta);

    if(!pregunta){
        return;
    }

    const opcion =
    pregunta.opciones[indiceOpcion];

    respuestasTest[idPregunta] = {
        pregunta:idPregunta,
        texto:opcion.texto,
        valor:Number(opcion.valor || 0),
        eje:pregunta.eje,
        capitulo:pregunta.capitulo,
        tituloCapitulo:pregunta.tituloCapitulo
    };

    renderizarPreguntaActual();

}

function siguientePregunta(){

    const pregunta =
    testActual.preguntas[preguntaActualIndice];

    if(!respuestasTest[pregunta.id]){

        alert("Selecciona una respuesta para continuar.");

        return;

    }

    if(preguntaActualIndice < testActual.preguntas.length - 1){

        preguntaActualIndice++;
        renderizarPreguntaActual();
        return;

    }

    finalizarEvaluacionLibro();

}

function preguntaAnterior(){

    if(preguntaActualIndice > 0){

        preguntaActualIndice--;
        renderizarPreguntaActual();

    }

}

function finalizarEvaluacionLibro(){

    const totalPreguntas =
    testActual.preguntas.length;

    const maximo =
    totalPreguntas * 3;

    const puntaje =
    Object.values(respuestasTest)
    .reduce((suma, item) => suma + item.valor, 0);

    const porcentaje =
    Math.round((puntaje / maximo) * 100);

    const nivel =
    obtenerNivelResultado(porcentaje);

    const areasBajas =
    obtenerAreasBajas();

    const capitulos =
    obtenerCapitulosRecomendados(porcentaje);

    const datos =
    obtenerDatosPersona();

    const resultado = {
        libroId:testActual.id,
        titulo:testActual.titulo,
        porcentaje,
        puntaje,
        maximo,
        nivel:nivel.nombre,
        mensaje:nivel.mensaje,
        recomendacion:nivel.recomendacion,
        areasBajas,
        capitulos,
        datos,
        fecha:new Date().toISOString()
    };

    guardarResultado(resultado);
    renderizarResultado(resultado);
    mostrarPanel("pantallaResultadoTest");

}

function obtenerNivelResultado(porcentaje){

    const encontrado =
    (testActual.niveles || []).find(
        nivel => porcentaje >= nivel.min && porcentaje <= nivel.max
    );

    return encontrado || {
        nombre:"Resultado espiritual",
        mensaje:"Has completado el test.",
        recomendacion:"Sigue meditando el libro."
    };

}

function obtenerAreasBajas(){

    const porEje = {};

    testActual.preguntas.forEach(pregunta => {

        if(!porEje[pregunta.eje]){
            porEje[pregunta.eje] = { total:0, max:0 };
        }

        const respuesta =
        respuestasTest[pregunta.id];

        porEje[pregunta.eje].total += respuesta ? respuesta.valor : 0;
        porEje[pregunta.eje].max += 3;

    });

    return Object.entries(porEje)
    .map(([eje, data]) => ({
        eje,
        porcentaje:Math.round((data.total / data.max) * 100)
    }))
    .sort((a,b) => a.porcentaje - b.porcentaje)
    .slice(0,3);

}

function obtenerCapitulosRecomendados(porcentaje){

    if(porcentaje < 40){
        return testActual.capitulosRecomendados?.bajo || [];
    }

    if(porcentaje < 70){
        return testActual.capitulosRecomendados?.medio || [];
    }

    return testActual.capitulosRecomendados?.alto || [];

}

function obtenerDatosPersona(){

    return {
        nombre:document.getElementById("nombreUsuarioTest")?.value || "",
        fecha:document.getElementById("fechaEvaluacionTest")?.value || "",
        mentor:document.getElementById("mentorUsuarioTest")?.value || ""
    };

}

function renderizarResultado(resultado){

    const contenedor =
    document.getElementById("resultadoTestContenido");

    const aprobado =
    resultado.porcentaje >= (testActual.aprobacion || 70);

    contenedor.innerHTML = `

        <section class="resultado-motor-test">

            <div class="resultado-motor-hero">

                <span>Resultado final</span>

                <h2>${resultado.porcentaje}%</h2>

                <h3>${resultado.nivel}</h3>

                <p>${resultado.mensaje}</p>

                <div class="resultado-barra-general">
                    <span style="width:${resultado.porcentaje}%"></span>
                </div>

            </div>

            <div class="resultado-grid-motor">

                <div class="resultado-bloque-motor">
                    <h3>📌 Recomendación espiritual</h3>
                    <p>${resultado.recomendacion}</p>
                </div>

                <div class="resultado-bloque-motor">
                    <h3>🔎 Áreas para fortalecer</h3>
                    <ul>
                        ${resultado.areasBajas.map(area => `
                            <li>${area.eje} — ${area.porcentaje}%</li>
                        `).join("")}
                    </ul>
                </div>

                <div class="resultado-bloque-motor">
                    <h3>📚 Capítulos recomendados</h3>
                    <ul>
                        ${resultado.capitulos.map(capitulo => `
                            <li>${capitulo}</li>
                        `).join("")}
                    </ul>
                </div>

                <div class="resultado-bloque-motor">
                    <h3>🙏 Oración final</h3>
                    <p>${testActual.oracionFinal}</p>
                </div>

                <div class="resultado-bloque-motor declaracion-final">
                    <h3>📖 Declaración</h3>
                    <p>${testActual.declaracionFinal}</p>
                </div>

            </div>

            <div class="certificado-motor ${aprobado ? "" : "certificado-bloqueado"}" id="certificadoMotor">

                <span>🏆 ${testActual.certificado?.titulo || "Certificado"}</span>

                <h2>${resultado.datos.nombre || "Participante"}</h2>

                <p>${testActual.certificado?.texto || "Ha completado esta evaluación espiritual."}</p>

                <strong>${testActual.titulo}</strong>

                <small>
                    ${testActual.certificado?.firma || "Constructores del Reino"}
                    ${resultado.datos.fecha ? " · " + resultado.datos.fecha : ""}
                </small>

                ${
                    aprobado
                    ? ""
                    : "<p class='certificado-nota'>Certificado disponible al alcanzar el nivel de aprobación.</p>"
                }

            </div>

            <div class="test-botones-inicio resultado-acciones-motor">

                <button type="button" onclick="descargarResultadoPDF()">
                    📄 Descargar resultado
                </button>

                <button type="button" class="secondary" onclick="reiniciarTestActual()">
                    🔄 Repetir test
                </button>

                <button type="button" class="secondary" onclick="volverAListaTests()">
                    ← Volver a test
                </button>

            </div>

        </section>

    `;

}

function guardarResultado(resultado){

    localStorage.setItem(
        `resultado_test_${testActual.id}`,
        JSON.stringify(resultado)
    );

    const historial =
    JSON.parse(localStorage.getItem("historial_tests_reino") || "[]");

    historial.push(resultado);

    localStorage.setItem(
        "historial_tests_reino",
        JSON.stringify(historial)
    );

}

function obtenerResultadoGuardado(idLibro){

    try{
        return JSON.parse(localStorage.getItem(`resultado_test_${idLibro}`));
    }catch(error){
        return null;
    }

}

function reiniciarTestActual(){

    preguntaActualIndice = 0;
    respuestasTest = {};
    renderizarInicioTest();

}

function volverAListaTests(){

    testActual = null;
    preguntaActualIndice = 0;
    respuestasTest = {};
    renderizarListaTests();

}

function descargarResultadoPDF(){

    window.print();

}
