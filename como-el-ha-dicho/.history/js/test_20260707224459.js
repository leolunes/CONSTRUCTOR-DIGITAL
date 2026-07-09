// =====================================
// TEST DEL LIBRO
// Constructores del Reino
// Genera preguntas desde data/pildoras/libro-x.json
// =====================================

let libroIdActual = "";
let pildorasLibro = null;
let preguntasTest = [];
let respuestasUsuario = {};
let testFinalizado = false;

const MAX_PREGUNTAS = 10;

document.addEventListener(
    "DOMContentLoaded",
    iniciarTestLibro
);

async function iniciarTestLibro(){

    const parametros =
    new URLSearchParams(
        window.location.search
    );

    libroIdActual =
    parametros.get("libro") || "";

    if(!libroIdActual){

        mostrarErrorTest(
            "No se encontró el libro seleccionado."
        );

        return;

    }

    await cargarPildorasParaTest(
        libroIdActual
    );

}

async function cargarPildorasParaTest(idLibro){

    try{

        const ruta =
        `./data/pildoras/${idLibro}.json`;

        const respuesta =
        await fetch(
            ruta,
            {
                cache:"no-store"
            }
        );

        if(!respuesta.ok){

            throw new Error(
                `No se encontró ${ruta}`
            );

        }

        pildorasLibro =
        await respuesta.json();

        if(
            !pildorasLibro ||
            !Array.isArray(pildorasLibro.pildoras)
        ){

            throw new Error(
                "El archivo de píldoras no tiene la estructura correcta."
            );

        }

        preguntasTest =
        construirPreguntasDesdePildoras(
            pildorasLibro
        );

        renderizarEncabezadoTest();
        renderizarTest();

    }catch(error){

        console.error(
            "Error cargando test:",
            error
        );

        mostrarErrorTest(
            "Este libro todavía no tiene test disponible. Verifica que exista su archivo en data/pildoras/."
        );

    }

}

function construirPreguntasDesdePildoras(data){

    const banco =
    [];

    data.pildoras.forEach((bloque) => {

        const frases =
        Array.isArray(bloque.frases)
        ? bloque.frases
        : [];

        frases.forEach((item) => {

            if(
                !item ||
                typeof item !== "object" ||
                !item.frase ||
                !item.respuesta
            ){

                return;

            }

            banco.push(
                crearPreguntaOpcionMultiple(
                    item,
                    bloque
                )
            );

        });

    });

    return mezclarArray(
        banco
    ).slice(
        0,
        MAX_PREGUNTAS
    );

}

function crearPreguntaOpcionMultiple(item, bloque){

    const correcta =
    limpiarRespuestaCorta(
        item.respuesta
    );

    const distractores =
    obtenerDistractoresGenerales(
        correcta
    );

    const opciones =
    mezclarArray([
        correcta,
        ...distractores
    ]).slice(0, 4);

    return {
        id:crearIdPregunta(),
        tipo:"opcion_multiple",
        seccion:bloque.seccion || "Sección",
        titulo:bloque.titulo || "",
        frase:item.frase,
        referencia:item.referencia || "",
        texto_biblico:item.texto_biblico || "",
        pregunta:`Según esta píldora, ¿cuál es la enseñanza principal?`,
        opciones:opciones,
        correcta:correcta,
        explicacion:item.respuesta
    };

}

function limpiarRespuestaCorta(texto){

    const limpio =
    String(texto || "")
    .replace(/\s+/g, " ")
    .trim();

    const oraciones =
    limpio.split(/(?<=[.!?])\s+/);

    let respuesta =
    oraciones[0] || limpio;

    if(respuesta.length > 145){

        respuesta =
        respuesta.slice(0, 145).trim() + "...";

    }

    return respuesta;

}

function obtenerDistractoresGenerales(correcta){

    const opcionesBase = [
        "La vida espiritual depende principalmente de conservar una apariencia externa.",
        "El conocimiento por sí solo siempre produce transformación interior.",
        "La obediencia puede ser reemplazada por información espiritual acumulada.",
        "La madurez consiste únicamente en conocer más conceptos religiosos.",
        "El cambio verdadero ocurre sin rendición, sin verdad y sin comunión con Dios.",
        "La estabilidad espiritual nace de controlar las circunstancias externas."
    ];

    return mezclarArray(
        opcionesBase.filter(
            item => item !== correcta
        )
    ).slice(0, 3);

}

function renderizarEncabezadoTest(){

    const titulo =
    document.getElementById(
        "tituloTestLibro"
    );

    const descripcion =
    document.getElementById(
        "descripcionTestLibro"
    );

    const total =
    document.getElementById(
        "totalPreguntasTest"
    );

    if(titulo){

        titulo.textContent =
        pildorasLibro.titulo ||
        "Test del Libro";

    }

    if(descripcion){

        descripcion.textContent =
        "Responde el test construido con las píldoras espirituales del audiolibro. Al finalizar recibirás tu resultado y una retroalimentación.";

    }

    if(total){

        total.textContent =
        preguntasTest.length;

    }

    actualizarProgresoTest();

}

function renderizarTest(){

    const contenedor =
    document.getElementById(
        "testContenedor"
    );

    if(!contenedor){

        return;

    }

    if(preguntasTest.length === 0){

        contenedor.innerHTML = `

            <div class="test-empty">

                <h2>
                    No hay suficientes píldoras para generar el test
                </h2>

                <p>
                    Agrega frases con respuesta en el archivo de píldoras del libro.
                </p>

            </div>

        `;

        return;

    }

    contenedor.innerHTML =
    preguntasTest.map(
        (pregunta, index) => {

            const opcionesHtml =
            pregunta.opciones.map(
                (opcion, opcionIndex) => {

                    return `

                        <button
                        type="button"
                        class="test-opcion"
                        data-pregunta="${pregunta.id}"
                        data-opcion="${encodeURIComponent(opcion)}"
                        onclick="seleccionarRespuesta('${pregunta.id}', decodeURIComponent(this.dataset.opcion), this)">
                            <span>
                                ${String.fromCharCode(65 + opcionIndex)}
                            </span>

                            ${opcion}
                        </button>

                    `;

                }
            ).join("");

            return `

                <article class="test-pregunta-card">

                    <div class="test-pregunta-header">

                        <span class="test-badge">
                            Pregunta ${index + 1}
                        </span>

                        <span class="test-seccion">
                            ${pregunta.seccion}
                        </span>

                    </div>

                    <div class="test-pildora-base">

                        <strong>
                            💬 Píldora base
                        </strong>

                        <p>
                            “${pregunta.frase}”
                        </p>

                        ${
                            pregunta.referencia
                            ? `<small>📖 ${pregunta.referencia}</small>`
                            : ""
                        }

                    </div>

                    <h3>
                        ${pregunta.pregunta}
                    </h3>

                    <div class="test-opciones">

                        ${opcionesHtml}

                    </div>

                    <div class="test-retro hidden"
                    id="retro-${pregunta.id}">

                    </div>

                </article>

            `;

        }
    ).join("");

    contenedor.innerHTML += `

        <div class="test-acciones-finales">

            <button
            type="button"
            class="btn-finalizar-test"
            onclick="finalizarTest()">
                ✅ Finalizar test
            </button>

            <button
            type="button"
            class="btn-reiniciar-test"
            onclick="reiniciarTest()">
                🔄 Reiniciar
            </button>

        </div>

    `;

}

function seleccionarRespuesta(idPregunta, opcion, boton){

    if(testFinalizado){

        return;

    }

    respuestasUsuario[idPregunta] =
    opcion;

    const botones =
    document.querySelectorAll(
        `.test-opcion[data-pregunta="${idPregunta}"]`
    );

    botones.forEach(item => {

        item.classList.remove(
            "seleccionada"
        );

    });

    boton.classList.add(
        "seleccionada"
    );

    actualizarProgresoTest();

}

function actualizarProgresoTest(){

    const progreso =
    document.getElementById(
        "progresoTest"
    );

    const respondidas =
    Object.keys(
        respuestasUsuario
    ).length;

    const porcentaje =
    preguntasTest.length
    ? Math.round(
        (respondidas / preguntasTest.length) * 100
    )
    : 0;

    if(progreso){

        progreso.textContent =
        `${porcentaje}%`;

    }

}

function finalizarTest(){

    if(preguntasTest.length === 0){

        return;

    }

    const respondidas =
    Object.keys(
        respuestasUsuario
    ).length;

    if(respondidas < preguntasTest.length){

        const continuar =
        confirm(
            `Has respondido ${respondidas} de ${preguntasTest.length} preguntas. ¿Deseas finalizar de todas formas?`
        );

        if(!continuar){

            return;

        }

    }

    testFinalizado =
    true;

    let correctas = 0;

    preguntasTest.forEach(pregunta => {

        const respuestaUsuario =
        respuestasUsuario[pregunta.id];

        const esCorrecta =
        respuestaUsuario === pregunta.correcta;

        if(esCorrecta){

            correctas++;

        }

        mostrarRetroalimentacion(
            pregunta,
            esCorrecta,
            respuestaUsuario
        );

    });

    const porcentaje =
    Math.round(
        (correctas / preguntasTest.length) * 100
    );

    const puntaje =
    document.getElementById(
        "puntajeTest"
    );

    if(puntaje){

        puntaje.textContent =
        `${correctas}/${preguntasTest.length}`;

    }

    mostrarResultadoFinal(
        correctas,
        preguntasTest.length,
        porcentaje
    );

    guardarResultadoTest(
        correctas,
        preguntasTest.length,
        porcentaje
    );

}

function mostrarRetroalimentacion(pregunta, esCorrecta, respuestaUsuario){

    const retro =
    document.getElementById(
        `retro-${pregunta.id}`
    );

    const botones =
    document.querySelectorAll(
        `.test-opcion[data-pregunta="${pregunta.id}"]`
    );

    botones.forEach(boton => {

        const opcion =
        decodeURIComponent(
            boton.dataset.opcion
        );

        boton.disabled = true;

        if(opcion === pregunta.correcta){

            boton.classList.add(
                "correcta"
            );

        }

        if(
            opcion === respuestaUsuario &&
            opcion !== pregunta.correcta
        ){

            boton.classList.add(
                "incorrecta"
            );

        }

    });

    if(retro){

        retro.classList.remove(
            "hidden"
        );

        retro.innerHTML = `

            <strong>
                ${esCorrecta ? "✅ Correcto" : "❌ Revisa esta enseñanza"}
            </strong>

            <p>
                ${pregunta.explicacion}
            </p>

        `;

    }

}

function mostrarResultadoFinal(correctas, total, porcentaje){

    const resultado =
    document.getElementById(
        "testResultado"
    );

    if(!resultado){

        return;

    }

    let mensaje =
    "Sigue repasando las píldoras del libro.";

    if(porcentaje >= 90){

        mensaje =
        "Excelente. Has comprendido muy bien las enseñanzas principales del libro.";

    }else if(porcentaje >= 70){

        mensaje =
        "Muy bien. Vas comprendiendo la esencia del libro; repasa las preguntas donde dudaste.";

    }else if(porcentaje >= 50){

        mensaje =
        "Buen inicio. Conviene volver a leer las píldoras para afirmar las enseñanzas principales.";

    }

    resultado.classList.remove(
        "hidden"
    );

    resultado.innerHTML = `

        <div class="test-resultado-card">

            <span>
                Resultado final
            </span>

            <h2>
                ${porcentaje}%
            </h2>

            <p class="test-resultado-puntaje">
                Respondiste correctamente ${correctas} de ${total} preguntas.
            </p>

            <p>
                ${mensaje}
            </p>

            <div class="test-resultado-acciones">

                <button
                type="button"
                class="btn-finalizar-test"
                onclick="reiniciarTest()">
                    🔄 Volver a intentarlo
                </button>

                <a href="audiolibros.html"
                class="btn-reiniciar-test">
                    ← Volver a audiolibros
                </a>

            </div>

        </div>

    `;

    resultado.scrollIntoView({
        behavior:"smooth",
        block:"start"
    });

}

function guardarResultadoTest(correctas, total, porcentaje){

    const clave =
    `test_${libroIdActual}`;

    const resultado =
    {
        libroId:libroIdActual,
        titulo:pildorasLibro?.titulo || "",
        correctas,
        total,
        porcentaje,
        fecha:new Date().toISOString()
    };

    localStorage.setItem(
        clave,
        JSON.stringify(resultado)
    );

}

function reiniciarTest(){

    respuestasUsuario = {};
    testFinalizado = false;

    preguntasTest =
    mezclarArray(
        preguntasTest
    );

    const resultado =
    document.getElementById(
        "testResultado"
    );

    if(resultado){

        resultado.classList.add(
            "hidden"
        );

        resultado.innerHTML = "";

    }

    const puntaje =
    document.getElementById(
        "puntajeTest"
    );

    if(puntaje){

        puntaje.textContent =
        "0";

    }

    actualizarProgresoTest();
    renderizarTest();

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

}

function mostrarErrorTest(mensaje){

    const contenedor =
    document.getElementById(
        "testContenedor"
    );

    if(!contenedor){

        return;

    }

    contenedor.innerHTML = `

        <div class="test-empty">

            <h2>
                No se pudo cargar el test
            </h2>

            <p>
                ${mensaje}
            </p>

            <a href="audiolibros.html"
            class="btn-finalizar-test">
                Volver a audiolibros
            </a>

        </div>

    `;

}

function crearIdPregunta(){

    return "pregunta_" +
    Math.random()
    .toString(36)
    .slice(2, 10);

}

function mezclarArray(array){

    const copia =
    [...array];

    for(
        let i = copia.length - 1;
        i > 0;
        i--
    ){

        const j =
        Math.floor(
            Math.random() * (i + 1)
        );

        [
            copia[i],
            copia[j]
        ] =
        [
            copia[j],
            copia[i]
        ];

    }

    return copia;

}
