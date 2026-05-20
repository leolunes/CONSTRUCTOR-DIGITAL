// =====================================
// PARÁMETROS URL
// =====================================

const parametros =
new URLSearchParams(
    window.location.search
);

const planId =
parametros.get('id');

// =====================================
// PLANES DEVOCIONALES
// =====================================

const planes = {

    1: {

        titulo:
        '📖 7 días de fe',

        subtitulo:
        'Aprende a confiar en Dios diariamente',

        proposito:
        'Este plan está diseñado para fortalecer tu confianza en Dios, especialmente cuando no entiendes el proceso, cuando la respuesta tarda o cuando las circunstancias parecen contradecir lo que Dios ha prometido.',

        dias: [

            {
                titulo:'Día 1 — Fe cuando no entiendo',

                versiculo:
                'Hebreos 11:1 — “Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve.”',

                ensenanza:
                'La fe no comienza cuando todo está claro. Muchas veces la fe nace en medio de preguntas, procesos y silencios. Creer en Dios no significa tener todas las respuestas, sino permanecer firme porque sabes quién está contigo.',

                declaracion:
                'Hoy declaro que mi fe no depende de lo que veo, sino de lo que Dios ha dicho. Aunque no entienda todo, confío en su carácter, en su palabra y en su fidelidad.',

                oracion:
                'Señor, fortalece mi fe en medio del proceso. Ayúdame a confiar cuando no vea resultados inmediatos y a permanecer firme en tu Palabra.',

                accion:
                'Escribe una situación que no entiendes y entrégasela a Dios en oración.'
            },

            {
                titulo:'Día 2 — Fe sobre temor',

                versiculo:
                '2 Timoteo 1:7 — “Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio.”',

                ensenanza:
                'El temor intenta gobernar tus decisiones, pero la fe te devuelve el gobierno interior. Dios no te llamó a vivir paralizado, sino a caminar con poder, amor y dominio propio.',

                declaracion:
                'Hoy declaro que el temor no gobierna mi mente ni mi corazón. Camino en fe, en paz y en dominio propio.',

                oracion:
                'Padre, arranca de mí todo temor que quiera detener mi avance. Recuérdame que tu Espíritu me sostiene y me fortalece.',

                accion:
                'Identifica un temor y reemplázalo con una promesa bíblica.'
            },

            {
                titulo:'Día 3 — Fe para esperar',

                versiculo:
                'Salmo 40:1 — “Pacientemente esperé a Jehová, y se inclinó a mí, y oyó mi clamor.”',

                ensenanza:
                'Esperar no es pasividad. Esperar en Dios es permanecer con gobierno, confianza y obediencia mientras Él obra. La espera revela qué tan firme está tu corazón.',

                declaracion:
                'Hoy declaro que no me desespero en la espera. Mi corazón permanece firme porque Dios oye mi clamor.',

                oracion:
                'Señor, enséñame a esperar sin perder la paz. Que mi confianza no dependa de la rapidez de la respuesta, sino de tu fidelidad.',

                accion:
                'Toma cinco minutos en silencio y declara: “Dios está obrando aunque yo no lo vea.”'
            },

            {
                titulo:'Día 4 — Fe para obedecer',

                versiculo:
                'Santiago 2:17 — “Así también la fe, si no tiene obras, es muerta en sí misma.”',

                ensenanza:
                'La fe verdadera produce pasos concretos. No basta con decir que creemos; la fe se evidencia cuando obedecemos incluso antes de ver el resultado.',

                declaracion:
                'Hoy declaro que mi fe se convierte en obediencia. No solo creo, también camino conforme a lo que Dios me muestra.',

                oracion:
                'Dios, dame valentía para obedecer tu dirección. No permitas que la duda me detenga cuando tú ya hablaste.',

                accion:
                'Haz hoy una acción concreta que represente obediencia a Dios.'
            },

            {
                titulo:'Día 5 — Fe para hablar correctamente',

                versiculo:
                '2 Corintios 4:13 — “Creí, por lo cual hablé.”',

                ensenanza:
                'La boca revela lo que gobierna el corazón. Cuando la fe está viva, tus palabras dejan de alimentar el miedo y comienzan a declarar vida, verdad y promesa.',

                declaracion:
                'Hoy declaro que mis labios estarán alineados con la Palabra de Dios. Hablaré vida, fe y esperanza.',

                oracion:
                'Señor, guarda mi boca. Que mis palabras no contradigan lo que tú estás formando en mí.',

                accion:
                'Durante el día, evita quejas y reemplázalas con declaraciones de fe.'
            },

            {
                titulo:'Día 6 — Fe para avanzar',

                versiculo:
                'Josué 1:9 — “Mira que te mando que te esfuerces y seas valiente.”',

                ensenanza:
                'La fe no siempre elimina el desafío, pero sí te da valor para avanzar. Dios no le prometió a Josué ausencia de batalla, le prometió presencia en el camino.',

                declaracion:
                'Hoy declaro que avanzo con valentía. No camino solo; Dios está conmigo dondequiera que voy.',

                oracion:
                'Padre, dame fuerza para avanzar sin retroceder. Que tu presencia sea mi seguridad.',

                accion:
                'Da un pequeño paso en algo que has venido postergando.'
            },

            {
                titulo:'Día 7 — Fe que permanece',

                versiculo:
                'Hebreos 10:23 — “Mantengamos firme, sin fluctuar, la profesión de nuestra esperanza.”',

                ensenanza:
                'La fe madura no es emocional ni inestable. Permanece firme porque está anclada en la fidelidad de Dios, no en los cambios del ambiente.',

                declaracion:
                'Hoy declaro que mi fe permanece firme. No fluctúo, no retrocedo y no abandono lo que Dios prometió.',

                oracion:
                'Señor, afirma mi corazón. Que mi esperanza permanezca firme en ti todos los días de mi vida.',

                accion:
                'Haz una oración de gratitud por lo que Dios ya hizo y por lo que aún hará.'
            }

        ]

    },

    2: {

        titulo:
        '🙏 Restaurando el hogar',

        subtitulo:
        'Sanidad y restauración familiar',

        proposito:
        'Este plan acompaña procesos de restauración emocional, matrimonial y familiar. No busca negar las heridas, sino llevarlas delante de Dios para que el amor, el perdón y la sabiduría gobiernen el hogar.',

        dias: [

            {
                titulo:'Día 1 — Dios también entra al hogar',

                versiculo:
                'Josué 24:15 — “Pero yo y mi casa serviremos a Jehová.”',

                ensenanza:
                'El hogar no se restaura solo con buenas intenciones. Se restaura cuando Dios vuelve a ocupar el centro de las decisiones, las conversaciones y las prioridades.',

                declaracion:
                'Hoy declaro que mi casa pertenece a Dios. Su presencia gobierna cada ambiente, cada relación y cada decisión.',

                oracion:
                'Señor, entra nuevamente a mi casa. Restaura lo que se ha debilitado y ordena lo que perdió dirección.',

                accion:
                'Ora por cada miembro de tu hogar mencionándolo por nombre.'
            },

            {
                titulo:'Día 2 — El perdón abre camino',

                versiculo:
                'Colosenses 3:13 — “Soportándoos unos a otros, y perdonándoos unos a otros.”',

                ensenanza:
                'El perdón no justifica el daño, pero rompe la prisión interior que mantiene el corazón atado al dolor. Restaurar comienza cuando el corazón deja de vivir bajo deuda emocional.',

                declaracion:
                'Hoy declaro que el perdón gobierna mi corazón. Renuncio a la amargura y permito que Dios sane mis heridas.',

                oracion:
                'Padre, ayúdame a perdonar con sabiduría. Sana lo que todavía duele y libérame de cargas antiguas.',

                accion:
                'Escribe una herida que necesitas entregar a Dios.'
            },

            {
                titulo:'Día 3 — Palabras que edifican',

                versiculo:
                'Proverbios 18:21 — “La muerte y la vida están en poder de la lengua.”',

                ensenanza:
                'Muchas casas no se destruyen por falta de amor, sino por exceso de palabras heridas. La restauración también comienza cuando cambia el lenguaje del hogar.',

                declaracion:
                'Hoy declaro que mis palabras traerán vida, paz y edificación a mi casa.',

                oracion:
                'Señor, limpia mi manera de hablar. Que mis labios no destruyan lo que tú quieres restaurar.',

                accion:
                'Habla una palabra de honra o gratitud a alguien de tu familia.'
            },

            {
                titulo:'Día 4 — Amor con paciencia',

                versiculo:
                '1 Corintios 13:4 — “El amor es sufrido, es benigno.”',

                ensenanza:
                'El amor maduro no reacciona desde la herida, sino desde el gobierno interior. Restaurar requiere paciencia, procesos y decisiones sostenidas.',

                declaracion:
                'Hoy declaro que el amor de Dios forma paciencia en mí. No responderé desde el enojo, sino desde la sabiduría.',

                oracion:
                'Dios, enséñame a amar como tú amas: con verdad, paciencia y gracia.',

                accion:
                'Antes de responder en una conversación difícil, respira y ora brevemente.'
            },

            {
                titulo:'Día 5 — Restaurar la confianza',

                versiculo:
                'Proverbios 3:3 — “Nunca se aparten de ti la misericordia y la verdad.”',

                ensenanza:
                'La confianza no se exige; se reconstruye con verdad, constancia y humildad. Dios restaura corazones, pero también nos llama a caminar en integridad.',

                declaracion:
                'Hoy declaro que mi hogar será afirmado en verdad, misericordia e integridad.',

                oracion:
                'Señor, restaura la confianza donde se ha perdido. Guíanos a vivir con transparencia y humildad.',

                accion:
                'Haz una acción pequeña pero concreta que comunique confianza.'
            },

            {
                titulo:'Día 6 — Paz en la casa',

                versiculo:
                'Juan 14:27 — “La paz os dejo, mi paz os doy.”',

                ensenanza:
                'La paz no es ausencia de problemas; es presencia de Dios gobernando el ambiente. Una casa en paz no es perfecta, pero aprende a rendirse al Señor.',

                declaracion:
                'Hoy declaro paz sobre mi hogar. Toda tensión, división y confusión pierde fuerza ante la presencia de Dios.',

                oracion:
                'Jesús, establece tu paz en mi casa. Que tu presencia llene cada habitación y cada conversación.',

                accion:
                'Pon música tranquila o una oración y dedica unos minutos a declarar paz en tu hogar.'
            },

            {
                titulo:'Día 7 — Una casa con propósito',

                versiculo:
                'Salmo 127:1 — “Si Jehová no edificare la casa, en vano trabajan los que la edifican.”',

                ensenanza:
                'El hogar no solo necesita solución de conflictos; necesita propósito. Cuando Dios edifica la casa, cada persona encuentra dirección y cobertura.',

                declaracion:
                'Hoy declaro que Dios edifica mi casa. Mi hogar tendrá propósito, dirección y bendición.',

                oracion:
                'Padre, edifica mi hogar sobre tu Palabra. Que nuestra casa sea lugar de paz, honra y propósito.',

                accion:
                'Haz una oración final dedicando tu hogar a Dios.'
            }

        ]

    },

    3: {

        titulo:
        '❤️ Sanidad interior',

        subtitulo:
        'Fortalece tu corazón y tu mente',

        proposito:
        'Este plan está diseñado para acompañar procesos de sanidad emocional. Cada día te ayudará a identificar cargas internas, rendirlas ante Dios y declarar verdad sobre tu corazón.',

        dias: [

            {
                titulo:'Día 1 — Dios ve lo que duele',

                versiculo:
                'Salmo 34:18 — “Cercano está Jehová a los quebrantados de corazón.”',

                ensenanza:
                'Dios no ignora tu dolor. Él se acerca al corazón quebrantado no para condenarlo, sino para restaurarlo con amor y verdad.',

                declaracion:
                'Hoy declaro que Dios está cerca de mi corazón. No estoy solo en mi proceso de sanidad.',

                oracion:
                'Señor, toca las áreas de mi corazón que aún duelen. Acércate a mí con tu amor restaurador.',

                accion:
                'Reconoce delante de Dios una herida que necesitas sanar.'
            },

            {
                titulo:'Día 2 — No soy mi herida',

                versiculo:
                '2 Corintios 5:17 — “Si alguno está en Cristo, nueva criatura es.”',

                ensenanza:
                'Lo que te pasó puede haber marcado una temporada, pero no define tu identidad. En Cristo hay una nueva vida y una nueva forma de verte.',

                declaracion:
                'Hoy declaro que no soy mi herida. Soy nueva criatura en Cristo y mi identidad está en Él.',

                oracion:
                'Padre, ayúdame a verme como tú me ves. Sana toda identidad construida desde el dolor.',

                accion:
                'Escribe: “No soy lo que me pasó; soy quien Dios dice que soy.”'
            },

            {
                titulo:'Día 3 — Libertad del temor',

                versiculo:
                '1 Juan 4:18 — “El perfecto amor echa fuera el temor.”',

                ensenanza:
                'El temor pierde fuerza cuando el amor de Dios ocupa el corazón. No se trata de negar el miedo, sino de permitir que el amor del Padre lo desplace.',

                declaracion:
                'Hoy declaro que el amor de Dios echa fuera todo temor de mi vida.',

                oracion:
                'Señor, lléname de tu amor perfecto. Que todo temor pierda autoridad sobre mi mente y emociones.',

                accion:
                'Identifica un miedo y ora específicamente por libertad.'
            },

            {
                titulo:'Día 4 — Paz para la mente',

                versiculo:
                'Filipenses 4:7 — “Y la paz de Dios guardará vuestros corazones y vuestros pensamientos.”',

                ensenanza:
                'Dios no solo quiere sanar tu corazón; también quiere guardar tus pensamientos. La paz de Dios actúa como protección interior.',

                declaracion:
                'Hoy declaro paz sobre mi mente. Mis pensamientos son guardados por Dios.',

                oracion:
                'Padre, ordena mis pensamientos. Que tu paz gobierne mi mente y mi corazón.',

                accion:
                'Apaga distracciones por diez minutos y medita en una promesa bíblica.'
            },

            {
                titulo:'Día 5 — Soltar cargas',

                versiculo:
                'Mateo 11:28 — “Venid a mí todos los que estáis trabajados y cargados.”',

                ensenanza:
                'No toda carga que llevas te corresponde. Jesús invita a entregar el peso que agota, consume y roba la paz.',

                declaracion:
                'Hoy declaro que entrego mis cargas a Jesús. No viviré agotado por pesos que Él ya me invitó a soltar.',

                oracion:
                'Jesús, recibo tu descanso. Te entrego mis cargas, mis preocupaciones y mis dolores ocultos.',

                accion:
                'Haz una lista de cargas y ora entregándolas una por una.'
            },

            {
                titulo:'Día 6 — Restaurar la alegría',

                versiculo:
                'Salmo 51:12 — “Vuélveme el gozo de tu salvación.”',

                ensenanza:
                'La sanidad interior también restaura la capacidad de alegrarte. Dios no solo quiere que sobrevivas; quiere devolverte gozo.',

                declaracion:
                'Hoy declaro que el gozo de Dios vuelve a mi corazón. Mi alma será renovada.',

                oracion:
                'Señor, devuélveme el gozo. Sana la tristeza profunda y renueva mi ánimo.',

                accion:
                'Haz algo sencillo que te recuerde la bondad de Dios.'
            },

            {
                titulo:'Día 7 — Corazón renovado',

                versiculo:
                'Ezequiel 36:26 — “Os daré corazón nuevo.”',

                ensenanza:
                'Dios no solo remienda el corazón; tiene poder para renovarlo. La sanidad interior es una obra profunda del Espíritu Santo.',

                declaracion:
                'Hoy declaro que Dios renueva mi corazón. Lo viejo pierde fuerza y lo nuevo comienza en mí.',

                oracion:
                'Padre, dame un corazón nuevo, sensible a tu voz y libre para amar, creer y avanzar.',

                accion:
                'Cierra este plan declarando en voz alta una nueva temporada de sanidad.'
            }

        ]

    },

    4: {

        titulo:
        '🔥 Victoriosos en Cristo',

        subtitulo:
        'Afirma tu identidad espiritual',

        proposito:
        'Este plan afirma la verdad de que la victoria cristiana no nace de la fuerza humana, sino de la obra de Cristo. Durante siete días declararás identidad, autoridad y perseverancia espiritual.',

        dias: [

            {
                titulo:'Día 1 — Mi identidad está en Cristo',

                versiculo:
                'Gálatas 2:20 — “Ya no vivo yo, mas vive Cristo en mí.”',

                ensenanza:
                'La victoria comienza cuando entiendes quién eres en Cristo. No eres definido por el pasado, por la opinión de otros ni por tus caídas.',

                declaracion:
                'Hoy declaro que mi identidad está en Cristo. Él vive en mí y gobierna mi vida.',

                oracion:
                'Señor, afirma mi identidad en ti. Que ninguna voz contraria tenga más peso que tu Palabra.',

                accion:
                'Declara tres veces: “Soy de Cristo y vivo en su victoria.”'
            },

            {
                titulo:'Día 2 — Más que vencedor',

                versiculo:
                'Romanos 8:37 — “Somos más que vencedores por medio de aquel que nos amó.”',

                ensenanza:
                'Ser vencedor no significa no enfrentar batalla. Significa que la batalla no define el resultado final porque Cristo ya venció.',

                declaracion:
                'Hoy declaro que soy más que vencedor por medio de Cristo que me ama.',

                oracion:
                'Padre, ayúdame a caminar como alguien que ya recibió victoria en Cristo.',

                accion:
                'Identifica una batalla actual y declara Romanos 8:37 sobre ella.'
            },

            {
                titulo:'Día 3 — Autoridad espiritual',

                versiculo:
                'Lucas 10:19 — “Os doy potestad... sobre toda fuerza del enemigo.”',

                ensenanza:
                'Cristo no solo te salvó; también te dio autoridad para resistir, permanecer y vencer toda oposición espiritual.',

                declaracion:
                'Hoy declaro que camino bajo la autoridad de Cristo. Ninguna fuerza contraria domina mi vida.',

                oracion:
                'Jesús, enséñame a ejercer autoridad con humildad, fe y obediencia.',

                accion:
                'Ora declarando autoridad sobre tu mente, tu hogar y tus decisiones.'
            },

            {
                titulo:'Día 4 — Victoria sobre la culpa',

                versiculo:
                'Romanos 8:1 — “Ahora, pues, ninguna condenación hay para los que están en Cristo Jesús.”',

                ensenanza:
                'La culpa paraliza, pero la gracia levanta. En Cristo no vives bajo condenación, sino bajo redención y nueva oportunidad.',

                declaracion:
                'Hoy declaro que no vivo bajo condenación. Cristo me hizo libre por su gracia.',

                oracion:
                'Señor, rompe toda culpa que quiera detenerme. Ayúdame a caminar en libertad.',

                accion:
                'Renuncia en oración a una culpa que has cargado por mucho tiempo.'
            },

            {
                titulo:'Día 5 — Resistir firmes',

                versiculo:
                'Santiago 4:7 — “Resistid al diablo, y huirá de vosotros.”',

                ensenanza:
                'La victoria requiere resistencia. Resistir no es pelear con ansiedad; es permanecer firme bajo la autoridad de Dios.',

                declaracion:
                'Hoy declaro que resisto firme en Dios. Nada me mueve de mi posición en Cristo.',

                oracion:
                'Padre, fortalece mi carácter para resistir tentaciones, pensamientos y ataques espirituales.',

                accion:
                'Identifica una área donde necesitas firmeza y toma una decisión concreta.'
            },

            {
                titulo:'Día 6 — Victoria en mi boca',

                versiculo:
                'Proverbios 18:21 — “La muerte y la vida están en poder de la lengua.”',

                ensenanza:
                'Un creyente victorioso aprende a hablar conforme al cielo. Tus palabras pueden alimentar derrota o afirmar victoria.',

                declaracion:
                'Hoy declaro vida, victoria y propósito. Mis labios estarán alineados con Cristo.',

                oracion:
                'Señor, usa mi boca para bendecir, declarar vida y afirmar tu verdad.',

                accion:
                'Graba o escribe una declaración de victoria sobre tu vida.'
            },

            {
                titulo:'Día 7 — Permanecer en victoria',

                versiculo:
                '1 Corintios 15:57 — “Mas gracias sean dadas a Dios, que nos da la victoria por medio de nuestro Señor Jesucristo.”',

                ensenanza:
                'La victoria es un regalo recibido en Cristo y una posición que se aprende a habitar cada día con gratitud, fe y obediencia.',

                declaracion:
                'Hoy declaro que permanezco en la victoria de Cristo. Mi vida dará testimonio de su poder.',

                oracion:
                'Gracias, Señor, porque mi victoria viene de ti. Enséñame a vivir cada día desde esa verdad.',

                accion:
                'Termina este plan dando gracias por tres victorias que Dios ha obrado en tu vida.'
            }

        ]

    }

};

// =====================================
// CARGAR PLAN
// =====================================

function cargarPlan(){

    const plan =
    planes[planId];

    if(!plan){

        return;

    }

    // =====================================
    // HEADER
    // =====================================

    document.getElementById(
        'titulo-plan'
    ).innerText =
    plan.titulo;

    document.getElementById(
        'subtitulo-plan'
    ).innerText =
    plan.subtitulo;

    // =====================================
    // CONTENEDOR
    // =====================================

    const container =
    document.getElementById(
        'dias-container'
    );

    container.innerHTML = '';

    // =====================================
    // PROPÓSITO DEL PLAN
    // =====================================

    const propositoCard =
    document.createElement('section');

    propositoCard.classList.add(
        'categoria-card'
    );

    propositoCard.innerHTML = `

        <h2>
            Propósito del plan
        </h2>

        <p>
            ${plan.proposito}
        </p>

    `;

    container.appendChild(
        propositoCard
    );

    // =====================================
    // RECORRER DÍAS
    // =====================================

    plan.dias.forEach(dia => {

        const card =
        document.createElement('section');

        card.classList.add(
            'categoria-card'
        );

        card.innerHTML = `

            <h2>
                ${dia.titulo}
            </h2>

            <p>
                <strong>Versículo base:</strong>
                <br>
                ${dia.versiculo}
            </p>

            <br>

            <p>
                <strong>Enseñanza:</strong>
                <br>
                ${dia.ensenanza}
            </p>

            <br>

            <p>
                <strong>Declaración de fe:</strong>
                <br>
                ${dia.declaracion}
            </p>

            <br>

            <p>
                <strong>Oración:</strong>
                <br>
                ${dia.oracion}
            </p>

            <br>

            <p>
                <strong>Acción práctica:</strong>
                <br>
                ${dia.accion}
            </p>

        `;

        container.appendChild(card);

    });

}

// =====================================
// INICIAR
// =====================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        cargarPlan();

    }
);
