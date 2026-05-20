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

        dias: [

            {
                titulo:'Día 1',
                texto:
                'La fe comienza creyendo que Dios permanece contigo incluso cuando no entiendes el proceso.'
            },

            {
                titulo:'Día 2',
                texto:
                'No vivas por lo que ves. Vive por lo que Dios ha dicho.'
            },

            {
                titulo:'Día 3',
                texto:
                'La oración fortalece la confianza espiritual.'
            }

        ]

    },

    2: {

        titulo:
        '🙏 Restaurando el hogar',

        subtitulo:
        'Sanidad y restauración familiar',

        dias: [

            {
                titulo:'Día 1',
                texto:
                'El amor verdadero comienza con perdón.'
            },

            {
                titulo:'Día 2',
                texto:
                'Dios restaura relaciones quebradas.'
            }

        ]

    },

    3: {

        titulo:
        '❤️ Sanidad interior',

        subtitulo:
        'Fortalece tu corazón y tu mente',

        dias: [

            {
                titulo:'Día 1',
                texto:
                'No fuiste diseñado para vivir en temor.'
            },

            {
                titulo:'Día 2',
                texto:
                'La paz de Dios guarda tu mente y tu corazón.'
            }

        ]

    },

    4: {

        titulo:
        '🔥 Victoriosos en Cristo',

        subtitulo:
        'Afirma tu identidad espiritual',

        dias: [

            {
                titulo:'Día 1',
                texto:
                'Tu identidad no depende del mundo sino de Cristo.'
            },

            {
                titulo:'Día 2',
                texto:
                'Fuiste llamado a vivir en victoria espiritual.'
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
                ${dia.texto}
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