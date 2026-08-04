/* ==========================================================
   APP PLAN GIRÓN 2024 - 2027
   Motor central de la aplicación
   ========================================================== */

/* =========================
   BASE CENTRAL TEMPORAL
   Luego se podrá reemplazar por JSON extraído del Plan
========================= */

const PLAN_GIRON = {
    municipio: "Girón",
    departamento: "Santander",
    periodo: "2024 - 2027",
    nombrePlan: "Más Campo para el Progreso",
    alcalde: "Campo Elías Ramírez Padilla",

    ejes: [
        {
            id: 1,
            nombre: "Administración Afectiva y Efectiva al Servicio de los Ciudadanos",
            descripcion: "Fortalecimiento institucional, justicia, TIC, movilidad, seguridad y gobierno territorial."
        },
        {
            id: 2,
            nombre: "Programas Sociales y Calidad de Vida para Todos",
            descripcion: "Salud, educación, inclusión social y atención a poblaciones vulnerables."
        },
        {
            id: 3,
            nombre: "Obras para Transformar a Girón",
            descripcion: "Infraestructura, vivienda, equipamientos, transporte, cultura y deporte."
        },
        {
            id: 4,
            nombre: "Progreso, Ocio Productivo y Recreativo",
            descripcion: "Agricultura, turismo, cultura, empleo, innovación, deporte y recreación."
        },
        {
            id: 5,
            nombre: "Sostenibilidad y Visión de Largo Plazo",
            descripcion: "Ambiente, vivienda, ordenamiento territorial, gestión del riesgo e información estadística."
        }
    ],

    sectores: [
        {
            id: "salud",
            icono: "🏥",
            nombre: "Salud y Protección Social",
            eje: 2,
            descripcion: "Sector orientado a la salud pública, aseguramiento, vacunación, prevención, atención primaria y población vulnerable.",
            estadoActual: "El Plan identifica la salud como un componente fundamental para mejorar la calidad de vida de los habitantes, fortaleciendo la salud pública, el aseguramiento y la atención a poblaciones vulnerables.",
            estadisticas: [
                "Cobertura de aseguramiento en salud.",
                "Cobertura en vacunación.",
                "Indicadores de mortalidad y fecundidad.",
                "Medición de desempeño en salud.",
                "Competitividad municipal en salud."
            ],
            problemas: [
                "Necesidad de fortalecer la salud pública municipal.",
                "Retos en vacunación y prevención.",
                "Atención diferencial para población vulnerable.",
                "Necesidad de mejorar indicadores de desempeño en salud."
            ],
            metas: [
                "Fortalecer las acciones de promoción y prevención.",
                "Mejorar la capacidad de gestión en salud pública.",
                "Ampliar estrategias de atención a población vulnerable.",
                "Mejorar indicadores de aseguramiento y calidad."
            ],
            indicadores: [
                "Cobertura en salud.",
                "Cobertura de vacunación.",
                "Tasa de mortalidad.",
                "Tasa de fecundidad.",
                "Índice de desempeño en salud."
            ],
            programas: [
                "Salud pública integral.",
                "Aseguramiento en salud.",
                "Atención a población vulnerable.",
                "Promoción y prevención."
            ],
            proyectos: [
                "Estrategias de salud preventiva.",
                "Jornadas de vacunación.",
                "Fortalecimiento de autoridad sanitaria.",
                "Atención a poblaciones vulnerables."
            ],
            presupuesto: "Pendiente de extracción detallada del componente financiero.",
            poblacion: [
                "Niños, niñas y adolescentes.",
                "Adultos mayores.",
                "Mujeres.",
                "Personas con discapacidad.",
                "Población vulnerable."
            ],
            concejo: [
                "Citar a debate de control político sobre ejecución del Plan Territorial de Salud.",
                "Revisar cumplimiento de metas de vacunación y salud pública.",
                "Solicitar informes sobre aseguramiento y atención a población vulnerable."
            ],
            alcalde: [
                "Dirigir la política pública de salud municipal.",
                "Coordinar acciones con EPS, IPS y autoridades sanitarias.",
                "Garantizar cumplimiento de metas del Plan de Desarrollo."
            ],
            propuestas: [
                "Crear una estrategia municipal de salud preventiva por barrios y veredas.",
                "Fortalecer brigadas de salud rural.",
                "Implementar un observatorio local de salud pública.",
                "Mejorar la atención integral del adulto mayor y población vulnerable."
            ],
            preguntasControl: [
                "¿Cuál es el avance real de las metas de salud pública establecidas en el Plan de Desarrollo?",
                "¿Qué acciones se han realizado para mejorar la cobertura de vacunación?",
                "¿Cómo se está atendiendo a la población vulnerable en salud?",
                "¿Qué indicadores han mejorado y cuáles presentan rezago?"
            ],
            normatividad: [
                "Ley 100 de 1993.",
                "Ley 715 de 2001.",
                "Plan Territorial de Salud.",
                "Normas del Sistema General de Seguridad Social en Salud."
            ],
            fuente: "Diagnóstico situacional y componente estratégico del Plan de Desarrollo Girón 2024 - 2027."
        },

        {
            id: "educacion",
            icono: "🎓",
            nombre: "Educación",
            eje: 2,
            descripcion: "Sector relacionado con cobertura, permanencia, calidad educativa, alimentación escolar y acceso a educación superior.",
            estadoActual: "El Plan analiza la educación desde las coberturas, permanencia educativa, calidad, resultados de pruebas Saber, educación superior y competitividad educativa.",
            estadisticas: [
                "Cobertura neta y bruta por nivel educativo.",
                "Indicadores de permanencia escolar.",
                "Deserción, repitencia y reprobación.",
                "Resultados pruebas Saber 11.",
                "Matrícula en educación superior."
            ],
            problemas: [
                "Retos en cobertura educativa.",
                "Deserción y permanencia escolar.",
                "Necesidad de mejorar calidad educativa.",
                "Brechas en acceso a educación superior."
            ],
            metas: [
                "Fortalecer el acceso y permanencia escolar.",
                "Mejorar indicadores de calidad educativa.",
                "Apoyar estrategias de alimentación escolar.",
                "Promover oportunidades de educación superior."
            ],
            indicadores: [
                "Tasa de cobertura neta.",
                "Tasa de cobertura bruta.",
                "Tasa de deserción.",
                "Resultados Saber 11.",
                "Matrícula educación superior."
            ],
            programas: [
                "Acceso y permanencia escolar.",
                "Calidad educativa.",
                "Alimentación escolar.",
                "Articulación con educación superior."
            ],
            proyectos: [
                "Fortalecimiento de instituciones educativas.",
                "Programas de permanencia escolar.",
                "Estrategias para mejorar pruebas Saber.",
                "Apoyo al Programa de Alimentación Escolar."
            ],
            presupuesto: "Pendiente de extracción detallada del componente financiero.",
            poblacion: [
                "Niños, niñas y adolescentes.",
                "Jóvenes.",
                "Familias.",
                "Comunidad educativa."
            ],
            concejo: [
                "Solicitar informe de cobertura educativa.",
                "Hacer seguimiento al PAE.",
                "Evaluar resultados de calidad educativa."
            ],
            alcalde: [
                "Garantizar la prestación del servicio educativo.",
                "Coordinar con Secretaría de Educación.",
                "Gestionar recursos para infraestructura y calidad."
            ],
            propuestas: [
                "Programa Girón Aprende Mejor para fortalecer competencias básicas.",
                "Becas o estímulos para jóvenes destacados.",
                "Plan de permanencia escolar rural.",
                "Escuela de liderazgo juvenil y vocación profesional."
            ],
            preguntasControl: [
                "¿Cuál es el avance en cobertura educativa por nivel?",
                "¿Qué acciones se han implementado para reducir la deserción escolar?",
                "¿Cómo se está fortaleciendo la calidad educativa?",
                "¿Cuál es el estado del Programa de Alimentación Escolar?"
            ],
            normatividad: [
                "Ley 115 de 1994.",
                "Ley 715 de 2001.",
                "Normativa del Ministerio de Educación Nacional."
            ],
            fuente: "Sector Educación del diagnóstico situacional y componente estratégico."
        },

        {
            id: "transporte",
            icono: "🚗",
            nombre: "Transporte y Movilidad",
            eje: 1,
            descripcion: "Sector relacionado con infraestructura vial, transporte público, bicicleta, parque automotor y seguridad vial.",
            estadoActual: "El Plan aborda la estructura vial, el sistema de transporte público, uso de bicicleta, parque automotor y accidentalidad vial.",
            estadisticas: [
                "Infraestructura vial existente y proyectada.",
                "Estadísticas de pasajeros de transporte público.",
                "Red de cicloinfraestructura.",
                "Parque automotor registrado.",
                "Accidentalidad y mortalidad vial."
            ],
            problemas: [
                "Necesidad de mejorar movilidad urbana.",
                "Retos en transporte público.",
                "Accidentalidad vial.",
                "Déficit o necesidad de cicloinfraestructura."
            ],
            metas: [
                "Fortalecer la movilidad segura.",
                "Mejorar infraestructura vial.",
                "Promover transporte sostenible.",
                "Reducir riesgos de accidentalidad."
            ],
            indicadores: [
                "Kilómetros de vías.",
                "Número de viajes por modo de transporte.",
                "Parque automotor.",
                "Tasa de accidentalidad.",
                "Víctimas fatales y lesionados."
            ],
            programas: [
                "Movilidad segura.",
                "Infraestructura vial.",
                "Transporte sostenible.",
                "Seguridad vial."
            ],
            proyectos: [
                "Mejoramiento vial.",
                "Plan de seguridad vial.",
                "Promoción del uso de bicicleta.",
                "Gestión del transporte público."
            ],
            presupuesto: "Pendiente de extracción detallada del componente financiero.",
            poblacion: [
                "Conductores.",
                "Peatones.",
                "Ciclistas.",
                "Usuarios de transporte público.",
                "Comunidad general."
            ],
            concejo: [
                "Solicitar informes de accidentalidad vial.",
                "Revisar inversión en infraestructura vial.",
                "Hacer seguimiento a políticas de movilidad."
            ],
            alcalde: [
                "Dirigir la política de movilidad municipal.",
                "Ejecutar obras viales.",
                "Coordinar seguridad vial y tránsito."
            ],
            propuestas: [
                "Plan de movilidad segura para barrios críticos.",
                "Rutas escolares seguras.",
                "Mejoramiento de puntos críticos de accidentalidad.",
                "Programa de cultura vial ciudadana."
            ],
            preguntasControl: [
                "¿Cuáles son los puntos de mayor accidentalidad en Girón?",
                "¿Qué inversiones se han hecho en mejoramiento vial?",
                "¿Cómo se está fortaleciendo la seguridad vial?",
                "¿Qué avances existen en movilidad sostenible?"
            ],
            normatividad: [
                "Código Nacional de Tránsito.",
                "Ley 769 de 2002.",
                "Planes locales de seguridad vial."
            ],
            fuente: "Sector Transporte del diagnóstico situacional y componente estratégico."
        },

        {
            id: "ambiente",
            icono: "🌱",
            nombre: "Ambiente y Desarrollo Sostenible",
            eje: 5,
            descripcion: "Sector relacionado con ecosistemas estratégicos, agua, biodiversidad, riesgo de desastres y sostenibilidad ambiental.",
            estadoActual: "El Plan identifica ecosistemas estratégicos, sistemas de agua, biodiversidad, riesgo de desastres, vulnerabilidad municipal y crecimiento verde.",
            estadisticas: [
                "Ecosistemas estratégicos.",
                "Cuencas hidrográficas.",
                "Índice de riesgo municipal.",
                "Índice de capacidades municipales.",
                "Índice territorial de crecimiento verde."
            ],
            problemas: [
                "Riesgos ambientales y de desastre.",
                "Protección de fuentes hídricas.",
                "Vulnerabilidad territorial.",
                "Necesidad de sostenibilidad ambiental."
            ],
            metas: [
                "Fortalecer gestión ambiental.",
                "Proteger ecosistemas estratégicos.",
                "Mejorar gestión del riesgo.",
                "Promover crecimiento verde."
            ],
            indicadores: [
                "Índice de riesgo.",
                "Índice de vulnerabilidad.",
                "Índice de crecimiento verde.",
                "Áreas de ecosistemas estratégicos."
            ],
            programas: [
                "Gestión ambiental sostenible.",
                "Gestión del riesgo.",
                "Protección hídrica.",
                "Crecimiento verde."
            ],
            proyectos: [
                "Protección de fuentes hídricas.",
                "Educación ambiental comunitaria.",
                "Gestión del riesgo en zonas vulnerables.",
                "Restauración ambiental."
            ],
            presupuesto: "Pendiente de extracción detallada del componente financiero.",
            poblacion: [
                "Comunidades rurales.",
                "Habitantes en zonas de riesgo.",
                "Instituciones educativas.",
                "Comunidad general."
            ],
            concejo: [
                "Hacer seguimiento a la gestión ambiental.",
                "Solicitar informes sobre zonas de riesgo.",
                "Controlar cumplimiento de metas ambientales."
            ],
            alcalde: [
                "Dirigir gestión ambiental municipal.",
                "Coordinar acciones con autoridad ambiental.",
                "Implementar gestión del riesgo."
            ],
            propuestas: [
                "Programa Girón Verde y Resiliente.",
                "Escuelas ambientales comunitarias.",
                "Plan de protección de microcuencas.",
                "Sistema de alertas comunitarias para riesgo."
            ],
            preguntasControl: [
                "¿Qué acciones se han ejecutado para proteger fuentes hídricas?",
                "¿Cuál es el avance en gestión del riesgo?",
                "¿Qué zonas presentan mayor vulnerabilidad ambiental?",
                "¿Cómo se está articulando el municipio con la autoridad ambiental?"
            ],
            normatividad: [
                "Ley 99 de 1993.",
                "Ley 1523 de 2012.",
                "Normativa ambiental nacional.",
                "Instrumentos de planificación ambiental."
            ],
            fuente: "Sector Ambiente y Desarrollo Sostenible del Plan de Desarrollo."
        },

        {
            id: "vivienda",
            icono: "🏘️",
            nombre: "Vivienda, Ciudad y Territorio",
            eje: 5,
            descripcion: "Sector asociado a vivienda, servicios públicos, acueducto, alcantarillado, residuos sólidos y espacio público.",
            estadoActual: "El Plan aborda vivienda, vivienda de interés social, déficit habitacional, servicios públicos, acueducto, alcantarillado, residuos sólidos y espacio público.",
            estadisticas: [
                "Déficit de vivienda.",
                "Cobertura de acueducto.",
                "Cobertura de alcantarillado.",
                "Tratamiento de aguas residuales.",
                "Espacio público y zonas verdes."
            ],
            problemas: [
                "Déficit habitacional.",
                "Necesidades de servicios públicos.",
                "Retos en tratamiento de aguas residuales.",
                "Necesidad de mejorar espacio público."
            ],
            metas: [
                "Promover vivienda digna.",
                "Mejorar servicios públicos.",
                "Fortalecer espacio público.",
                "Gestionar soluciones de saneamiento básico."
            ],
            indicadores: [
                "Déficit de vivienda.",
                "Cobertura acueducto.",
                "Cobertura alcantarillado.",
                "Residuos sólidos aprovechados.",
                "Índice de espacio público."
            ],
            programas: [
                "Vivienda digna.",
                "Servicios públicos eficientes.",
                "Espacio público para la comunidad.",
                "Saneamiento básico."
            ],
            proyectos: [
                "Mejoramiento de vivienda.",
                "Gestión de vivienda de interés social.",
                "Mejoramiento de espacio público.",
                "Fortalecimiento de servicios públicos."
            ],
            presupuesto: "Pendiente de extracción detallada del componente financiero.",
            poblacion: [
                "Familias vulnerables.",
                "Habitantes urbanos.",
                "Comunidades rurales.",
                "Usuarios de servicios públicos."
            ],
            concejo: [
                "Solicitar informes sobre déficit de vivienda.",
                "Hacer seguimiento a proyectos de servicios públicos.",
                "Verificar inversión en espacio público."
            ],
            alcalde: [
                "Gestionar programas de vivienda.",
                "Coordinar prestación de servicios públicos.",
                "Ejecutar obras de espacio público."
            ],
            propuestas: [
                "Banco municipal de mejoramiento de vivienda.",
                "Programa de barrios con espacio público digno.",
                "Plan de saneamiento básico rural.",
                "Gestión de vivienda para familias vulnerables."
            ],
            preguntasControl: [
                "¿Cuál es el déficit actual de vivienda en el municipio?",
                "¿Qué proyectos de mejoramiento de vivienda se han ejecutado?",
                "¿Cuál es el avance en acueducto y alcantarillado?",
                "¿Qué acciones se han realizado para mejorar el espacio público?"
            ],
            normatividad: [
                "Ley 388 de 1997.",
                "Normativa de vivienda y ordenamiento territorial.",
                "Regulación de servicios públicos domiciliarios."
            ],
            fuente: "Sector Vivienda, Ciudad y Territorio del Plan de Desarrollo."
        },

        {
            id: "inclusion",
            icono: "👥",
            nombre: "Inclusión Social y Reconciliación",
            eje: 2,
            descripcion: "Sector enfocado en población étnica, mujeres, juventudes, población LGBTIQ+, migración, infancia, adulto mayor, víctimas y discapacidad.",
            estadoActual: "El Plan identifica grupos poblacionales que requieren atención diferencial, protección de derechos e inclusión social.",
            estadisticas: [
                "Población étnica.",
                "Indicadores de violencia contra mujeres.",
                "Mercado laboral juvenil.",
                "Migración.",
                "Población con discapacidad."
            ],
            problemas: [
                "Vulnerabilidad de grupos poblacionales.",
                "Violencias basadas en género.",
                "Retos de inclusión laboral juvenil.",
                "Atención a víctimas y población migrante.",
                "Necesidades de población con discapacidad."
            ],
            metas: [
                "Fortalecer atención diferencial.",
                "Promover derechos de mujeres y familias.",
                "Impulsar participación juvenil.",
                "Atender población víctima y vulnerable.",
                "Mejorar inclusión de personas con discapacidad."
            ],
            indicadores: [
                "Tasa de violencia intrafamiliar.",
                "Indicadores de juventud.",
                "Registro de personas con discapacidad.",
                "Población víctima.",
                "Población migrante."
            ],
            programas: [
                "Atención a población vulnerable.",
                "Mujer y familia.",
                "Juventudes.",
                "Adulto mayor.",
                "Discapacidad.",
                "Víctimas."
            ],
            proyectos: [
                "Rutas de atención diferencial.",
                "Escuela de liderazgo juvenil.",
                "Atención integral al adulto mayor.",
                "Programa de inclusión para discapacidad."
            ],
            presupuesto: "Pendiente de extracción detallada del componente financiero.",
            poblacion: [
                "Mujeres.",
                "Jóvenes.",
                "Niños, niñas y adolescentes.",
                "Adultos mayores.",
                "Víctimas.",
                "Personas con discapacidad.",
                "Migrantes."
            ],
            concejo: [
                "Solicitar informes sobre políticas poblacionales.",
                "Hacer seguimiento a programas de adulto mayor.",
                "Revisar atención a víctimas y discapacidad."
            ],
            alcalde: [
                "Implementar políticas sociales.",
                "Garantizar atención diferencial.",
                "Coordinar programas poblacionales."
            ],
            propuestas: [
                "Centro integral de orientación familiar y social.",
                "Programa de cuidado al cuidador.",
                "Escuela de liderazgo para mujeres y jóvenes.",
                "Ruta municipal de atención al adulto mayor."
            ],
            preguntasControl: [
                "¿Cuál es el avance de los programas para adulto mayor?",
                "¿Qué acciones se han implementado para mujeres y familias?",
                "¿Cómo se atiende a la población con discapacidad?",
                "¿Qué programas existen para jóvenes en riesgo?"
            ],
            normatividad: [
                "Ley 1098 de 2006.",
                "Ley 1257 de 2008.",
                "Ley 1448 de 2011.",
                "Ley Estatutaria de Discapacidad."
            ],
            fuente: "Sector Inclusión Social y Reconciliación del Plan de Desarrollo."
        },

        {
            id: "seguridad",
            icono: "👮",
            nombre: "Seguridad y Convivencia Ciudadana",
            eje: 1,
            descripcion: "Sector relacionado con convivencia, seguridad, justicia local, prevención del delito y espacio público.",
            estadoActual: "El Plan aborda gobierno territorial, seguridad, convivencia ciudadana, justicia y fortalecimiento institucional.",
            estadisticas: [
                "Indicadores de convivencia ciudadana.",
                "Capturas.",
                "Acceso efectivo a la justicia.",
                "Participación ciudadana."
            ],
            problemas: [
                "Retos de convivencia ciudadana.",
                "Necesidad de fortalecer justicia local.",
                "Percepción de inseguridad.",
                "Control del espacio público."
            ],
            metas: [
                "Fortalecer seguridad ciudadana.",
                "Mejorar convivencia.",
                "Aumentar capacidad institucional.",
                "Promover cultura ciudadana."
            ],
            indicadores: [
                "Indicadores de convivencia.",
                "Índice de acceso efectivo a la justicia.",
                "Participación ciudadana.",
                "Capturas y delitos reportados."
            ],
            programas: [
                "Seguridad y convivencia.",
                "Justicia cercana al ciudadano.",
                "Cultura ciudadana.",
                "Fortalecimiento institucional."
            ],
            proyectos: [
                "Frentes de seguridad.",
                "Campañas de convivencia.",
                "Fortalecimiento de inspecciones.",
                "Recuperación de espacio público."
            ],
            presupuesto: "Pendiente de extracción detallada del componente financiero.",
            poblacion: [
                "Comunidad general.",
                "Comerciantes.",
                "Jóvenes.",
                "Familias.",
                "Juntas de Acción Comunal."
            ],
            concejo: [
                "Citar debate sobre seguridad y convivencia.",
                "Solicitar estadísticas delictivas.",
                "Hacer seguimiento a inversión en seguridad."
            ],
            alcalde: [
                "Dirigir política de seguridad municipal.",
                "Coordinar con Policía y organismos de justicia.",
                "Implementar planes de convivencia."
            ],
            propuestas: [
                "Plan barrios seguros y convivencia comunitaria.",
                "Red de alarmas comunitarias.",
                "Escuela de cultura ciudadana.",
                "Fortalecimiento de inspecciones de policía."
            ],
            preguntasControl: [
                "¿Cuáles son los delitos de mayor ocurrencia en Girón?",
                "¿Qué acciones se han implementado para mejorar la convivencia?",
                "¿Cuál es la inversión real en seguridad?",
                "¿Cómo se articula la Alcaldía con la Policía?"
            ],
            normatividad: [
                "Código Nacional de Seguridad y Convivencia Ciudadana.",
                "Ley 1801 de 2016.",
                "Planes integrales de seguridad y convivencia."
            ],
            fuente: "Sectores Justicia, Gobierno Territorial y Seguridad del Plan."
        },

        {
            id: "cultura",
            icono: "🎭",
            nombre: "Cultura y Turismo",
            eje: 4,
            descripcion: "Sector relacionado con patrimonio, servicios culturales, turismo histórico, promoción cultural y economía turística.",
            estadoActual: "El Plan reconoce la importancia cultural, patrimonial y turística de Girón como Monumento Nacional, con potencial para desarrollo económico.",
            estadisticas: [
                "Infraestructura cultural.",
                "Servicios artísticos y culturales.",
                "Circuitos culturales.",
                "Registro Nacional de Turismo.",
                "Sitios turísticos y patrimoniales."
            ],
            problemas: [
                "Necesidad de fortalecer oferta cultural.",
                "Potencial turístico por desarrollar.",
                "Articulación entre cultura, turismo y economía.",
                "Promoción del patrimonio."
            ],
            metas: [
                "Promover cultura local.",
                "Fortalecer turismo.",
                "Impulsar economía cultural.",
                "Proteger patrimonio."
            ],
            indicadores: [
                "Número de actividades culturales.",
                "Alojamientos con RNT.",
                "Inventario turístico.",
                "Participación cultural."
            ],
            programas: [
                "Promoción cultural.",
                "Turismo histórico y patrimonial.",
                "Economía cultural.",
                "Formación artística."
            ],
            proyectos: [
                "Circuitos turísticos.",
                "Eventos culturales.",
                "Escuelas de formación artística.",
                "Promoción del patrimonio histórico."
            ],
            presupuesto: "Pendiente de extracción detallada del componente financiero.",
            poblacion: [
                "Artistas.",
                "Emprendedores turísticos.",
                "Comerciantes.",
                "Jóvenes.",
                "Visitantes y comunidad general."
            ],
            concejo: [
                "Solicitar informe sobre promoción turística.",
                "Hacer seguimiento a inversión cultural.",
                "Revisar estrategias de protección patrimonial."
            ],
            alcalde: [
                "Dirigir política cultural y turística.",
                "Gestionar proyectos de promoción.",
                "Articular actores turísticos."
            ],
            propuestas: [
                "Marca turística Girón Monumento Vivo.",
                "Ruta cultural nocturna.",
                "Escuela de emprendimiento turístico.",
                "Festival anual de identidad gironesa."
            ],
            preguntasControl: [
                "¿Qué acciones se han ejecutado para fortalecer el turismo?",
                "¿Cuál es el presupuesto destinado a cultura?",
                "¿Cómo se está promoviendo el patrimonio histórico?",
                "¿Qué resultados tienen los programas culturales?"
            ],
            normatividad: [
                "Ley General de Cultura.",
                "Normativa de turismo.",
                "Protección de patrimonio cultural."
            ],
            fuente: "Sectores Cultura y Comercio, Industria y Turismo del Plan."
        },

        {
            id: "deporte",
            icono: "⚽",
            nombre: "Deporte y Recreación",
            eje: 4,
            descripcion: "Sector orientado a actividad física, recreación, escenarios deportivos y participación ciudadana.",
            estadoActual: "El Plan incluye el sector Deporte y Recreación como herramienta para calidad de vida, prevención, integración social y uso productivo del tiempo libre.",
            estadisticas: [
                "Participación ciudadana en actividades deportivas.",
                "Infraestructura deportiva.",
                "Programas recreativos.",
                "Escenarios deportivos."
            ],
            problemas: [
                "Necesidad de fortalecer escenarios deportivos.",
                "Acceso a programas recreativos.",
                "Uso adecuado del tiempo libre.",
                "Cobertura en deporte comunitario."
            ],
            metas: [
                "Promover deporte y recreación.",
                "Fortalecer escenarios deportivos.",
                "Aumentar participación comunitaria.",
                "Impulsar hábitos de vida saludable."
            ],
            indicadores: [
                "Participantes en actividades deportivas.",
                "Escenarios intervenidos.",
                "Programas ejecutados.",
                "Cobertura recreativa."
            ],
            programas: [
                "Deporte comunitario.",
                "Recreación para todos.",
                "Escuelas deportivas.",
                "Infraestructura deportiva."
            ],
            proyectos: [
                "Escuelas deportivas barriales.",
                "Eventos recreativos comunitarios.",
                "Mejoramiento de escenarios deportivos.",
                "Programas de actividad física."
            ],
            presupuesto: "Pendiente de extracción detallada del componente financiero.",
            poblacion: [
                "Niños, niñas y adolescentes.",
                "Jóvenes.",
                "Adultos mayores.",
                "Familias.",
                "Deportistas."
            ],
            concejo: [
                "Solicitar avance de programas deportivos.",
                "Revisar inversión en escenarios deportivos.",
                "Hacer seguimiento a cobertura recreativa."
            ],
            alcalde: [
                "Promover deporte municipal.",
                "Gestionar escenarios deportivos.",
                "Coordinar programas recreativos."
            ],
            propuestas: [
                "Escuelas deportivas gratuitas por comuna y vereda.",
                "Programa deporte para la prevención.",
                "Juegos interbarrios e interveredales.",
                "Plan de mantenimiento de escenarios deportivos."
            ],
            preguntasControl: [
                "¿Cuántos niños y jóvenes participan en programas deportivos?",
                "¿Qué escenarios deportivos han sido intervenidos?",
                "¿Cuál es el presupuesto ejecutado en deporte?",
                "¿Qué programas existen para adulto mayor y recreación?"
            ],
            normatividad: [
                "Ley del Deporte.",
                "Normativa de recreación y actividad física."
            ],
            fuente: "Sector Deporte y Recreación del Plan de Desarrollo."
        },

        {
            id: "rural",
            icono: "🌾",
            nombre: "Agricultura y Desarrollo Rural",
            eje: 4,
            descripcion: "Sector relacionado con frontera agrícola, vocación productiva, aptitudes de cultivo, pecuaria e irrigación.",
            estadoActual: "El Plan analiza la frontera agrícola, evaluaciones agropecuarias, aptitudes productivas por cultivo, vocación pecuaria y tierras con fines de irrigación.",
            estadisticas: [
                "Frontera agrícola.",
                "Evaluaciones agropecuarias.",
                "Aptitudes productivas por cultivo.",
                "Vocación pecuaria.",
                "Áreas potenciales para irrigación."
            ],
            problemas: [
                "Necesidad de fortalecer productividad rural.",
                "Limitaciones de irrigación.",
                "Aprovechamiento de aptitudes productivas.",
                "Comercialización campesina."
            ],
            metas: [
                "Fortalecer desarrollo rural.",
                "Apoyar productores agropecuarios.",
                "Promover cadenas productivas.",
                "Mejorar capacidades rurales."
            ],
            indicadores: [
                "Área agrícola.",
                "Producción agropecuaria.",
                "Cultivos aptos.",
                "Áreas con potencial de irrigación."
            ],
            programas: [
                "Desarrollo rural productivo.",
                "Asistencia técnica agropecuaria.",
                "Comercialización campesina.",
                "Fortalecimiento rural."
            ],
            proyectos: [
                "Mercados campesinos.",
                "Asistencia técnica rural.",
                "Apoyo a pequeños productores.",
                "Proyectos de riego y productividad."
            ],
            presupuesto: "Pendiente de extracción detallada del componente financiero.",
            poblacion: [
                "Campesinos.",
                "Productores rurales.",
                "Familias rurales.",
                "Asociaciones agropecuarias."
            ],
            concejo: [
                "Solicitar informes sobre inversión rural.",
                "Hacer seguimiento a asistencia técnica.",
                "Revisar apoyo a productores campesinos."
            ],
            alcalde: [
                "Promover desarrollo rural.",
                "Gestionar asistencia técnica.",
                "Articular programas departamentales y nacionales."
            ],
            propuestas: [
                "Banco de maquinaria y asistencia técnica rural.",
                "Mercados campesinos permanentes.",
                "Ruta de productividad rural.",
                "Programa de jóvenes rurales emprendedores."
            ],
            preguntasControl: [
                "¿Qué inversión se ha realizado en la zona rural?",
                "¿Cuántos productores han recibido asistencia técnica?",
                "¿Qué avances hay en mercados campesinos?",
                "¿Cómo se están aprovechando las aptitudes productivas del municipio?"
            ],
            normatividad: [
                "Ley 101 de 1993.",
                "Normativa de desarrollo rural.",
                "Planes agropecuarios territoriales."
            ],
            fuente: "Sector Agricultura y Desarrollo Rural del Plan."
        },

        {
            id: "gobierno",
            icono: "🏛️",
            nombre: "Gobierno Territorial",
            eje: 1,
            descripcion: "Sector relacionado con gestión municipal, participación ciudadana, finanzas públicas, desempeño institucional y gobierno abierto.",
            estadoActual: "El Plan analiza participación ciudadana, gestión municipal, gestión financiera, desempeño institucional y competitividad institucional.",
            estadisticas: [
                "Participación electoral.",
                "Índice de desempeño institucional.",
                "Indicadores de gestión financiera.",
                "Competitividad institucional."
            ],
            problemas: [
                "Necesidad de fortalecer gestión pública.",
                "Participación ciudadana.",
                "Mejorar desempeño institucional.",
                "Gestión financiera eficiente."
            ],
            metas: [
                "Fortalecer administración municipal.",
                "Promover participación ciudadana.",
                "Mejorar gestión financiera.",
                "Aumentar transparencia y eficiencia."
            ],
            indicadores: [
                "Índice de desempeño institucional.",
                "Indicadores financieros.",
                "Participación ciudadana.",
                "Competitividad institucional."
            ],
            programas: [
                "Gobierno eficiente.",
                "Participación ciudadana.",
                "Gestión financiera.",
                "Transparencia institucional."
            ],
            proyectos: [
                "Gobierno digital.",
                "Rendición de cuentas.",
                "Fortalecimiento de JAC.",
                "Modernización administrativa."
            ],
            presupuesto: "Pendiente de extracción detallada del componente financiero.",
            poblacion: [
                "Ciudadanía general.",
                "Juntas de Acción Comunal.",
                "Servidores públicos.",
                "Organizaciones sociales."
            ],
            concejo: [
                "Hacer seguimiento a desempeño institucional.",
                "Controlar ejecución presupuestal.",
                "Solicitar rendición de cuentas sectorial."
            ],
            alcalde: [
                "Dirigir la administración municipal.",
                "Garantizar eficiencia institucional.",
                "Rendir cuentas a la ciudadanía."
            ],
            propuestas: [
                "Gobierno abierto con datos públicos de ejecución.",
                "Escuela de liderazgo comunal.",
                "Tablero ciudadano de seguimiento al Plan.",
                "Modernización digital de trámites municipales."
            ],
            preguntasControl: [
                "¿Cuál es el avance del sistema de seguimiento al Plan?",
                "¿Qué indicadores de desempeño institucional han mejorado?",
                "¿Cómo se está fortaleciendo la participación ciudadana?",
                "¿Cuál es el estado de la ejecución presupuestal?"
            ],
            normatividad: [
                "Ley 152 de 1994.",
                "Ley 1757 de 2015.",
                "Ley de Transparencia.",
                "Normativa de gestión pública territorial."
            ],
            fuente: "Sector Gobierno Territorial, componente financiero y sistema de seguimiento."
        },

        {
            id: "empleo",
            icono: "💼",
            nombre: "Trabajo, Empleo y Emprendimiento",
            eje: 4,
            descripcion: "Sector relacionado con formación para el trabajo, empleo, formalización laboral, emprendimiento y ocupación.",
            estadoActual: "El Plan analiza formación para el trabajo, servicio público de empleo, formalización laboral, ocupación, conmutación laboral, emprendimiento y trabajo infantil.",
            estadisticas: [
                "Formación para el trabajo.",
                "Ofertas de empleo.",
                "Tasa de ocupación.",
                "Tasa de desempleo.",
                "Empresas creadas.",
                "Trabajo infantil."
            ],
            problemas: [
                "Retos de empleabilidad.",
                "Formalización laboral.",
                "Apoyo a emprendimientos.",
                "Articulación con formación para el trabajo.",
                "Prevención del trabajo infantil."
            ],
            metas: [
                "Fortalecer empleabilidad.",
                "Apoyar emprendimientos.",
                "Promover formación para el trabajo.",
                "Reducir barreras laborales."
            ],
            indicadores: [
                "Tasa de ocupación.",
                "Tasa de desempleo.",
                "Empresas creadas.",
                "Ofertas laborales.",
                "Formación para el trabajo."
            ],
            programas: [
                "Empleabilidad local.",
                "Emprendimiento.",
                "Formación para el trabajo.",
                "Formalización laboral."
            ],
            proyectos: [
                "Ferias de empleo.",
                "Escuela de emprendimiento.",
                "Formación con SENA y aliados.",
                "Ruta de formalización empresarial."
            ],
            presupuesto: "Pendiente de extracción detallada del componente financiero.",
            poblacion: [
                "Jóvenes.",
                "Mujeres.",
                "Emprendedores.",
                "Trabajadores informales.",
                "Empresarios."
            ],
            concejo: [
                "Solicitar informes sobre empleabilidad.",
                "Hacer seguimiento a programas de emprendimiento.",
                "Evaluar alianzas con sector productivo."
            ],
            alcalde: [
                "Promover empleo local.",
                "Gestionar alianzas con empresas.",
                "Impulsar formación para el trabajo."
            ],
            propuestas: [
                "Agencia local de empleo y emprendimiento.",
                "Ruta joven al primer empleo.",
                "Programa mujeres emprendedoras de Girón.",
                "Convenios con empresas para formación laboral."
            ],
            preguntasControl: [
                "¿Cuántas personas han accedido a programas de empleabilidad?",
                "¿Qué alianzas existen con el sector empresarial?",
                "¿Qué resultados tienen los programas de emprendimiento?",
                "¿Cómo se está promoviendo la formalización laboral?"
            ],
            normatividad: [
                "Normativa laboral colombiana.",
                "Políticas de empleo y emprendimiento.",
                "Lineamientos del Servicio Público de Empleo."
            ],
            fuente: "Sector Trabajo del diagnóstico situacional y componente estratégico."
        }
    ]
};

/* =========================
   FUNCIONES GENERALES
========================= */

function obtenerSectores() {
    return PLAN_GIRON.sectores;
}

function obtenerSectorPorId(id) {
    return PLAN_GIRON.sectores.find(sector => sector.id === id);
}

function obtenerParametroUrl(nombre) {
    const parametros = new URLSearchParams(window.location.search);
    return parametros.get(nombre);
}

function guardarBusqueda(texto) {
    localStorage.setItem("busquedaPlanGiron", texto);
}

function obtenerBusquedaGuardada() {
    return localStorage.getItem("busquedaPlanGiron") || "";
}

function limpiarTexto(texto) {
    return texto
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

/* =========================
   RENDERIZADORES
========================= */

function renderLista(items) {
    if (!items || items.length === 0) {
        return "<p class='texto-suave'>Información pendiente de estructuración.</p>";
    }

    return `
        <ul class="lista-limpia">
            ${items.map(item => `<li>${item}</li>`).join("")}
        </ul>
    `;
}

function renderTarjetas(items, clase = "card-mini") {
    if (!items || items.length === 0) {
        return "<p class='texto-suave'>Información pendiente de estructuración.</p>";
    }

    return items.map(item => `
        <div class="${clase}">
            <p>${item}</p>
        </div>
    `).join("");
}

function renderSelectSectores(idSelect) {
    const select = document.getElementById(idSelect);

    if (!select) return;

    const sectores = obtenerSectores();

    sectores.forEach(sector => {
        const option = document.createElement("option");
        option.value = sector.id;
        option.textContent = sector.nombre;
        select.appendChild(option);
    });
}

/* =========================
   BUSCADOR CENTRAL
========================= */

function buscarEnPlan(texto) {
    const consulta = limpiarTexto(texto);

    if (!consulta) return [];

    const resultados = [];

    PLAN_GIRON.sectores.forEach(sector => {
        const campos = [
            sector.nombre,
            sector.descripcion,
            sector.estadoActual,
            ...(sector.estadisticas || []),
            ...(sector.problemas || []),
            ...(sector.metas || []),
            ...(sector.indicadores || []),
            ...(sector.programas || []),
            ...(sector.proyectos || []),
            ...(sector.propuestas || []),
            ...(sector.preguntasControl || []),
            ...(sector.poblacion || [])
        ].join(" ");

        if (limpiarTexto(campos).includes(consulta)) {
            resultados.push(sector);
        }
    });

    return resultados;
}

/* =========================
   NAVEGACIÓN
========================= */

function abrirSector(id) {
    window.location.href = `sectores-detalle.html?id=${id}`;
}

/* =========================
   UTILIDADES DE SALIDA
========================= */

function mostrarMensajeVacio(contenedorId, mensaje) {
    const contenedor = document.getElementById(contenedorId);

    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="estado-vacio">
            <h3>Sin resultados</h3>
            <p>${mensaje}</p>
        </div>
    `;
}

function formatoFuente(texto) {
    return `
        <div class="card-fuente">
            <strong>Fuente:</strong> ${texto}
        </div>
    `;
}

/* =========================
   CARGA GLOBAL
========================= */

document.addEventListener("DOMContentLoaded", () => {
    console.log("App Plan Girón cargada correctamente.");
});