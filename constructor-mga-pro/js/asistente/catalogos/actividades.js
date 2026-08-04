// =====================================
// ACTIVIDADES.JS
// CONSTRUCTOR MGA PRO
// Catálogo maestro de actividades MGA
// =====================================

const CatalogoActividades = {

    nombre:
    "Catálogo Maestro de Actividades",

    version:
    "1.0.0",

    descripcion:
    "Banco reutilizable de actividades tipo para formulación MGA, cronograma, presupuesto y plantillas sectoriales.",

    categorias: {

        // =====================================
        // PLANEACIÓN
        // =====================================

        PLANEACION: {

            DIAGNOSTICO_TERRITORIAL: {
                id: "ACT-PLA-001",
                codigo: "ACT-PLA-001",
                nombre: "Realizar diagnóstico territorial",
                descripcion: "Levantar y analizar información territorial, social, económica, institucional y física relacionada con la necesidad pública identificada.",
                etapa: "Planeación",
                tipo: "Preinversión",
                duracionMinima: 1,
                duracionSugerida: 1,
                duracionMaxima: 3,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: false,
                aplicaConsultoria: true,
                palabrasClave: ["diagnóstico", "territorio", "información", "situación actual"]
            },

            LEVANTAMIENTO_INFORMACION: {
                id: "ACT-PLA-002",
                codigo: "ACT-PLA-002",
                nombre: "Realizar levantamiento de información",
                descripcion: "Recolectar información primaria y secundaria necesaria para sustentar la formulación del proyecto.",
                etapa: "Planeación",
                tipo: "Preinversión",
                duracionMinima: 1,
                duracionSugerida: 1,
                duracionMaxima: 2,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: false,
                aplicaConsultoria: true,
                palabrasClave: ["levantamiento", "información", "datos", "diagnóstico"]
            },

            ESTUDIOS_PREVIOS: {
                id: "ACT-PLA-003",
                codigo: "ACT-PLA-003",
                nombre: "Elaborar estudios previos",
                descripcion: "Preparar los estudios previos requeridos para definir la necesidad, conveniencia, oportunidad y condiciones generales del proyecto.",
                etapa: "Planeación",
                tipo: "Preinversión",
                duracionMinima: 1,
                duracionSugerida: 1,
                duracionMaxima: 3,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: true,
                palabrasClave: ["estudios previos", "precontractual", "necesidad", "conveniencia"]
            },

            ESTUDIOS_TECNICOS: {
                id: "ACT-PLA-004",
                codigo: "ACT-PLA-004",
                nombre: "Elaborar estudios técnicos",
                descripcion: "Desarrollar los estudios técnicos necesarios para sustentar la alternativa de solución y las condiciones de ejecución del proyecto.",
                etapa: "Planeación",
                tipo: "Preinversión",
                duracionMinima: 1,
                duracionSugerida: 2,
                duracionMaxima: 6,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: true,
                palabrasClave: ["estudios técnicos", "ingeniería", "soporte técnico", "preinversión"]
            },

            DISENOS: {
                id: "ACT-PLA-005",
                codigo: "ACT-PLA-005",
                nombre: "Elaborar diseños",
                descripcion: "Realizar diseños, planos, memorias, especificaciones técnicas y demás documentos requeridos para la ejecución del proyecto.",
                etapa: "Planeación",
                tipo: "Preinversión",
                duracionMinima: 1,
                duracionSugerida: 2,
                duracionMaxima: 6,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: true,
                palabrasClave: ["diseños", "planos", "memorias", "especificaciones"]
            },

            TOPOGRAFIA: {
                id: "ACT-PLA-006",
                codigo: "ACT-PLA-006",
                nombre: "Realizar levantamiento topográfico",
                descripcion: "Ejecutar levantamiento topográfico del área de intervención para soportar diseños, cantidades y localización del proyecto.",
                etapa: "Planeación",
                tipo: "Preinversión",
                duracionMinima: 1,
                duracionSugerida: 1,
                duracionMaxima: 2,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: true,
                palabrasClave: ["topografía", "levantamiento", "localización", "terreno"]
            },

            GEOTECNIA: {
                id: "ACT-PLA-007",
                codigo: "ACT-PLA-007",
                nombre: "Realizar estudio geotécnico",
                descripcion: "Analizar las condiciones del suelo y subsuelo para definir parámetros técnicos de diseño y construcción.",
                etapa: "Planeación",
                tipo: "Preinversión",
                duracionMinima: 1,
                duracionSugerida: 1,
                duracionMaxima: 3,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: true,
                palabrasClave: ["geotecnia", "suelos", "subsuelo", "cimentación"]
            },

            SOCIALIZACION_INICIAL: {
                id: "ACT-PLA-008",
                codigo: "ACT-PLA-008",
                nombre: "Realizar socialización inicial",
                descripcion: "Presentar a la comunidad y actores institucionales la necesidad, alcance preliminar y beneficios esperados del proyecto.",
                etapa: "Planeación",
                tipo: "Gestión social",
                duracionMinima: 1,
                duracionSugerida: 1,
                duracionMaxima: 2,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: true,
                palabrasClave: ["socialización", "comunidad", "participación", "actores"]
            },

            PARTICIPACION_CIUDADANA: {
                id: "ACT-PLA-009",
                codigo: "ACT-PLA-009",
                nombre: "Desarrollar espacios de participación ciudadana",
                descripcion: "Realizar reuniones, talleres o mesas de trabajo para recoger aportes de la comunidad y actores beneficiarios.",
                etapa: "Planeación",
                tipo: "Gestión social",
                duracionMinima: 1,
                duracionSugerida: 1,
                duracionMaxima: 3,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: false,
                aplicaConsultoria: true,
                palabrasClave: ["participación", "ciudadanía", "talleres", "comunidad"]
            },

            GESTION_PREDIAL: {
                id: "ACT-PLA-010",
                codigo: "ACT-PLA-010",
                nombre: "Realizar gestión predial",
                descripcion: "Verificar disponibilidad, titularidad, afectaciones, permisos y condiciones jurídicas del predio o área de intervención.",
                etapa: "Planeación",
                tipo: "Gestión predial",
                duracionMinima: 1,
                duracionSugerida: 2,
                duracionMaxima: 6,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: true,
                palabrasClave: ["predio", "titularidad", "gestión predial", "disponibilidad"]
            },

            GESTION_AMBIENTAL: {
                id: "ACT-PLA-011",
                codigo: "ACT-PLA-011",
                nombre: "Realizar gestión ambiental previa",
                descripcion: "Identificar permisos, restricciones, impactos y medidas ambientales aplicables a la intervención.",
                etapa: "Planeación",
                tipo: "Gestión ambiental",
                duracionMinima: 1,
                duracionSugerida: 2,
                duracionMaxima: 4,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: true,
                palabrasClave: ["ambiental", "permisos", "impactos", "licencia"]
            },

            FORMULACION_MGA: {
                id: "ACT-PLA-012",
                codigo: "ACT-PLA-012",
                nombre: "Formular proyecto en metodología MGA",
                descripcion: "Estructurar el proyecto conforme a los componentes de la metodología MGA, incluyendo diagnóstico, objetivos, cadena de valor, indicadores, riesgos y cronograma.",
                etapa: "Planeación",
                tipo: "Formulación",
                duracionMinima: 1,
                duracionSugerida: 2,
                duracionMaxima: 4,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: true,
                palabrasClave: ["mga", "formulación", "proyecto", "dnp"]
            },

            ESTRUCTURACION_FINANCIERA: {
                id: "ACT-PLA-013",
                codigo: "ACT-PLA-013",
                nombre: "Realizar estructuración financiera",
                descripcion: "Definir costos, fuentes de financiación, programación financiera y sostenibilidad económica del proyecto.",
                etapa: "Planeación",
                tipo: "Financiera",
                duracionMinima: 1,
                duracionSugerida: 1,
                duracionMaxima: 3,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: true,
                palabrasClave: ["financiera", "costos", "fuentes", "presupuesto"]
            },

            REVISION_TECNICA: {
                id: "ACT-PLA-014",
                codigo: "ACT-PLA-014",
                nombre: "Realizar revisión técnica del proyecto",
                descripcion: "Revisar la consistencia técnica, financiera, jurídica y metodológica del proyecto antes de su radicación.",
                etapa: "Planeación",
                tipo: "Revisión",
                duracionMinima: 1,
                duracionSugerida: 1,
                duracionMaxima: 2,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: true,
                palabrasClave: ["revisión", "técnica", "consistencia", "viabilidad"]
            },

            RADICACION_PROYECTO: {
                id: "ACT-PLA-015",
                codigo: "ACT-PLA-015",
                nombre: "Radicar proyecto ante instancia competente",
                descripcion: "Presentar el proyecto formulado ante la entidad, banco de proyectos o instancia de viabilización correspondiente.",
                etapa: "Planeación",
                tipo: "Trámite",
                duracionMinima: 1,
                duracionSugerida: 1,
                duracionMaxima: 2,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: false,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: false,
                palabrasClave: ["radicación", "banco de proyectos", "viabilización", "presentación"]
            }

        },

        // =====================================
        // CONTRATACIÓN
        // =====================================

        CONTRATACION: {

            ELABORAR_DOCUMENTOS_PRECONTRACTUALES: {
                id: "ACT-CON-001",
                codigo: "ACT-CON-001",
                nombre: "Elaborar documentos precontractuales",
                descripcion: "Preparar estudios previos, análisis del sector, matriz de riesgos, pliegos o invitación, y demás documentos requeridos para iniciar la contratación.",
                etapa: "Contratación",
                tipo: "Precontractual",
                duracionMinima: 1,
                duracionSugerida: 1,
                duracionMaxima: 3,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: false,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: true,
                palabrasClave: ["precontractual", "pliegos", "estudios previos", "contratación"]
            },

            PUBLICAR_PROCESO: {
                id: "ACT-CON-002",
                codigo: "ACT-CON-002",
                nombre: "Publicar proceso de contratación",
                descripcion: "Publicar el proceso contractual en la plataforma o medio correspondiente conforme a la modalidad seleccionada.",
                etapa: "Contratación",
                tipo: "Precontractual",
                duracionMinima: 1,
                duracionSugerida: 1,
                duracionMaxima: 2,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: false,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: true,
                palabrasClave: ["publicar", "secop", "proceso", "contratación"]
            },

            EVALUAR_OFERTAS: {
                id: "ACT-CON-003",
                codigo: "ACT-CON-003",
                nombre: "Evaluar ofertas",
                descripcion: "Revisar y evaluar las ofertas presentadas conforme a los requisitos jurídicos, técnicos, financieros y económicos establecidos.",
                etapa: "Contratación",
                tipo: "Evaluación",
                duracionMinima: 1,
                duracionSugerida: 1,
                duracionMaxima: 3,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: false,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: true,
                palabrasClave: ["evaluación", "ofertas", "proponentes", "adjudicación"]
            },

            ADJUDICAR_CONTRATO: {
                id: "ACT-CON-004",
                codigo: "ACT-CON-004",
                nombre: "Adjudicar contrato",
                descripcion: "Seleccionar la oferta más favorable y expedir el acto o documento de adjudicación correspondiente.",
                etapa: "Contratación",
                tipo: "Adjudicación",
                duracionMinima: 1,
                duracionSugerida: 1,
                duracionMaxima: 2,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: false,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: true,
                palabrasClave: ["adjudicación", "contrato", "selección", "oferta"]
            },

            SUSCRIBIR_CONTRATO: {
                id: "ACT-CON-005",
                codigo: "ACT-CON-005",
                nombre: "Suscribir y legalizar contrato",
                descripcion: "Formalizar el contrato, obtener garantías, registros presupuestales y requisitos de perfeccionamiento y ejecución.",
                etapa: "Contratación",
                tipo: "Legalización",
                duracionMinima: 1,
                duracionSugerida: 1,
                duracionMaxima: 2,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: false,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: true,
                palabrasClave: ["contrato", "legalización", "garantías", "registro presupuestal"]
            }

        },

        // =====================================
        // EJECUCIÓN
        // =====================================

        EJECUCION: {

            EJECUTAR_OBRAS_CIVILES: {
                id: "ACT-EJE-001",
                codigo: "ACT-EJE-001",
                nombre: "Ejecutar obras civiles",
                descripcion: "Realizar las actividades constructivas necesarias para materializar la infraestructura prevista en el proyecto.",
                etapa: "Ejecución",
                tipo: "Obra",
                duracionMinima: 2,
                duracionSugerida: 6,
                duracionMaxima: 18,
                requiereProfesional: true,
                requiereInterventoria: true,
                generaProducto: true,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: false,
                palabrasClave: ["obra", "construcción", "infraestructura", "ejecución"]
            },

            ADECUAR_INFRAESTRUCTURA: {
                id: "ACT-EJE-002",
                codigo: "ACT-EJE-002",
                nombre: "Adecuar infraestructura existente",
                descripcion: "Realizar adecuaciones físicas, funcionales o técnicas sobre infraestructura existente para mejorar su operación.",
                etapa: "Ejecución",
                tipo: "Obra",
                duracionMinima: 1,
                duracionSugerida: 4,
                duracionMaxima: 12,
                requiereProfesional: true,
                requiereInterventoria: true,
                generaProducto: true,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: false,
                palabrasClave: ["adecuación", "mejoramiento", "infraestructura existente"]
            },

            DOTAR_EQUIPAMIENTO: {
                id: "ACT-EJE-003",
                codigo: "ACT-EJE-003",
                nombre: "Adquirir e instalar dotación",
                descripcion: "Adquirir, transportar, instalar y poner en funcionamiento la dotación, equipos, mobiliario o elementos requeridos.",
                etapa: "Ejecución",
                tipo: "Dotación",
                duracionMinima: 1,
                duracionSugerida: 3,
                duracionMaxima: 8,
                requiereProfesional: true,
                requiereInterventoria: true,
                generaProducto: true,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: false,
                aplicaConsultoria: false,
                palabrasClave: ["dotación", "equipos", "mobiliario", "instalación"]
            },

            CAPACITAR_BENEFICIARIOS: {
                id: "ACT-EJE-004",
                codigo: "ACT-EJE-004",
                nombre: "Capacitar beneficiarios",
                descripcion: "Desarrollar jornadas de formación, capacitación o transferencia de conocimiento dirigidas a la población beneficiaria.",
                etapa: "Ejecución",
                tipo: "Fortalecimiento",
                duracionMinima: 1,
                duracionSugerida: 2,
                duracionMaxima: 6,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: true,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: false,
                aplicaConsultoria: true,
                palabrasClave: ["capacitación", "beneficiarios", "formación", "fortalecimiento"]
            },

            IMPLEMENTAR_PROGRAMA_SOCIAL: {
                id: "ACT-EJE-005",
                codigo: "ACT-EJE-005",
                nombre: "Implementar programa social",
                descripcion: "Ejecutar acciones de atención, acompañamiento, formación, promoción o intervención social dirigidas a la población objetivo.",
                etapa: "Ejecución",
                tipo: "Servicio",
                duracionMinima: 2,
                duracionSugerida: 6,
                duracionMaxima: 24,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: true,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: false,
                aplicaConsultoria: true,
                palabrasClave: ["programa social", "atención", "acompañamiento", "beneficiarios"]
            }

        },

        // =====================================
        // CONTROL
        // =====================================

        CONTROL: {

            INTERVENTORIA: {
                id: "ACT-CTL-001",
                codigo: "ACT-CTL-001",
                nombre: "Realizar interventoría",
                descripcion: "Ejercer seguimiento técnico, administrativo, financiero, jurídico y ambiental a la ejecución del contrato.",
                etapa: "Control",
                tipo: "Interventoría",
                duracionMinima: 1,
                duracionSugerida: 6,
                duracionMaxima: 24,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: true,
                palabrasClave: ["interventoría", "seguimiento", "control", "supervisión"]
            },

            SUPERVISION: {
                id: "ACT-CTL-002",
                codigo: "ACT-CTL-002",
                nombre: "Realizar supervisión",
                descripcion: "Realizar seguimiento institucional al cumplimiento del objeto, obligaciones, cronograma, presupuesto y resultados del proyecto.",
                etapa: "Control",
                tipo: "Supervisión",
                duracionMinima: 1,
                duracionSugerida: 6,
                duracionMaxima: 24,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: false,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: true,
                palabrasClave: ["supervisión", "control", "seguimiento", "contrato"]
            },

            SEGUIMIENTO_INDICADORES: {
                id: "ACT-CTL-003",
                codigo: "ACT-CTL-003",
                nombre: "Realizar seguimiento a indicadores",
                descripcion: "Monitorear el avance de los indicadores de producto, resultado, gestión e impacto definidos para el proyecto.",
                etapa: "Control",
                tipo: "Seguimiento",
                duracionMinima: 1,
                duracionSugerida: 3,
                duracionMaxima: 24,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: false,
                aplicaConsultoria: true,
                palabrasClave: ["indicadores", "seguimiento", "monitoreo", "resultados"]
            }

        },

        // =====================================
        // CIERRE
        // =====================================

        CIERRE: {

            ENTREGA_PRODUCTOS: {
                id: "ACT-CIE-001",
                codigo: "ACT-CIE-001",
                nombre: "Entregar productos del proyecto",
                descripcion: "Realizar la entrega formal de los productos, bienes, servicios u obras ejecutadas a la entidad responsable o comunidad beneficiaria.",
                etapa: "Cierre",
                tipo: "Entrega",
                duracionMinima: 1,
                duracionSugerida: 1,
                duracionMaxima: 2,
                requiereProfesional: true,
                requiereInterventoria: true,
                generaProducto: false,
                generaCostoDirecto: false,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: true,
                palabrasClave: ["entrega", "productos", "recibo", "acta"]
            },

            LIQUIDACION: {
                id: "ACT-CIE-002",
                codigo: "ACT-CIE-002",
                nombre: "Liquidar contrato o proyecto",
                descripcion: "Realizar el cierre administrativo, financiero, jurídico y técnico del contrato o proyecto, incluyendo actas y balances finales.",
                etapa: "Cierre",
                tipo: "Liquidación",
                duracionMinima: 1,
                duracionSugerida: 1,
                duracionMaxima: 3,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: false,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: true,
                aplicaConsultoria: true,
                palabrasClave: ["liquidación", "cierre", "acta", "balance"]
            },

            EVALUACION_FINAL: {
                id: "ACT-CIE-003",
                codigo: "ACT-CIE-003",
                nombre: "Realizar evaluación final",
                descripcion: "Evaluar el cumplimiento de objetivos, productos, metas, indicadores, beneficios y lecciones aprendidas del proyecto.",
                etapa: "Cierre",
                tipo: "Evaluación",
                duracionMinima: 1,
                duracionSugerida: 1,
                duracionMaxima: 3,
                requiereProfesional: true,
                requiereInterventoria: false,
                generaProducto: false,
                generaCostoDirecto: true,
                aplicaMGA: true,
                aplicaSGR: true,
                aplicaObra: false,
                aplicaConsultoria: true,
                palabrasClave: ["evaluación final", "cierre", "resultados", "lecciones aprendidas"]
            }

        }

    }

};

// Registrar catálogo si existe el administrador central
if(window.CatalogoMGA){
    CatalogoMGA.registrar("actividades", CatalogoActividades);
}

window.CatalogoActividades = CatalogoActividades;
