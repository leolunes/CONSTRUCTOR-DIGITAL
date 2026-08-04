// =====================================
// PRODUCTOS.JS
// CONSTRUCTOR MGA PRO
// Catálogo maestro de productos MGA
// =====================================

const CatalogoProductos = {

    nombre:
    "Catálogo Maestro de Productos MGA",

    version:
    "1.0.0",

    descripcion:
    "Banco reutilizable de productos tipo para construir cadenas de valor, indicadores, actividades, plantillas sectoriales y documentos MGA.",

    categorias: {

        // =====================================
        // INFRAESTRUCTURA
        // =====================================

        INFRAESTRUCTURA: {

            INFRAESTRUCTURA_CONSTRUIDA: {
                id: "PRO-INF-001",
                codigo: "PRO-INF-001",
                nombre: "Infraestructura construida",
                descripcion: "Infraestructura física nueva construida y puesta al servicio de la población objetivo.",
                unidadMedida: "Unidad",
                tipo: "Infraestructura",
                categoria: "Infraestructura",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-001",
                actividades: [
                    "ACT-PLA-003",
                    "ACT-PLA-004",
                    "ACT-PLA-005",
                    "ACT-EJE-001",
                    "ACT-CTL-001",
                    "ACT-CIE-001"
                ],
                palabrasClave: ["infraestructura", "construcción", "obra", "edificación", "nuevo"]
            },

            INFRAESTRUCTURA_MEJORADA: {
                id: "PRO-INF-002",
                codigo: "PRO-INF-002",
                nombre: "Infraestructura mejorada",
                descripcion: "Infraestructura existente intervenida para mejorar sus condiciones físicas, funcionales, técnicas o de prestación del servicio.",
                unidadMedida: "Unidad",
                tipo: "Infraestructura",
                categoria: "Infraestructura",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-002",
                actividades: [
                    "ACT-PLA-003",
                    "ACT-PLA-004",
                    "ACT-EJE-002",
                    "ACT-CTL-001",
                    "ACT-CIE-001"
                ],
                palabrasClave: ["mejoramiento", "adecuación", "infraestructura existente", "rehabilitación"]
            },

            INFRAESTRUCTURA_REHABILITADA: {
                id: "PRO-INF-003",
                codigo: "PRO-INF-003",
                nombre: "Infraestructura rehabilitada",
                descripcion: "Infraestructura recuperada o rehabilitada para restablecer su funcionalidad y condiciones de operación.",
                unidadMedida: "Unidad",
                tipo: "Infraestructura",
                categoria: "Infraestructura",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-003",
                actividades: [
                    "ACT-PLA-004",
                    "ACT-PLA-005",
                    "ACT-EJE-002",
                    "ACT-CTL-001",
                    "ACT-CIE-001"
                ],
                palabrasClave: ["rehabilitación", "recuperación", "restauración", "infraestructura"]
            },

            INFRAESTRUCTURA_AMPLIADA: {
                id: "PRO-INF-004",
                codigo: "PRO-INF-004",
                nombre: "Infraestructura ampliada",
                descripcion: "Infraestructura existente ampliada para incrementar capacidad, cobertura o funcionalidad.",
                unidadMedida: "Unidad",
                tipo: "Infraestructura",
                categoria: "Infraestructura",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-004",
                actividades: [
                    "ACT-PLA-004",
                    "ACT-PLA-005",
                    "ACT-EJE-001",
                    "ACT-CTL-001",
                    "ACT-CIE-001"
                ],
                palabrasClave: ["ampliación", "capacidad", "cobertura", "infraestructura"]
            },

            ESPACIO_PUBLICO_MEJORADO: {
                id: "PRO-INF-005",
                codigo: "PRO-INF-005",
                nombre: "Espacio público mejorado",
                descripcion: "Espacio público intervenido para mejorar accesibilidad, seguridad, uso, disfrute y condiciones urbanas.",
                unidadMedida: "Metro cuadrado",
                tipo: "Infraestructura",
                categoria: "Infraestructura",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-005",
                actividades: [
                    "ACT-PLA-004",
                    "ACT-PLA-005",
                    "ACT-EJE-001",
                    "ACT-CTL-001",
                    "ACT-CIE-001"
                ],
                palabrasClave: ["espacio público", "parque", "andenes", "urbanismo"]
            }

        },

        // =====================================
        // DOTACIÓN
        // =====================================

        DOTACION: {

            DOTACION_INSTALADA: {
                id: "PRO-DOT-001",
                codigo: "PRO-DOT-001",
                nombre: "Dotación instalada",
                descripcion: "Dotación adquirida, instalada y puesta en funcionamiento para fortalecer la prestación del servicio.",
                unidadMedida: "Unidad",
                tipo: "Dotación",
                categoria: "Dotación",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-010",
                actividades: [
                    "ACT-PLA-003",
                    "ACT-EJE-003",
                    "ACT-CTL-002",
                    "ACT-CIE-001"
                ],
                palabrasClave: ["dotación", "equipamiento", "instalación", "mobiliario"]
            },

            EQUIPOS_ADQUIRIDOS: {
                id: "PRO-DOT-002",
                codigo: "PRO-DOT-002",
                nombre: "Equipos adquiridos",
                descripcion: "Equipos técnicos, tecnológicos, biomédicos, operativos o especializados adquiridos para el proyecto.",
                unidadMedida: "Unidad",
                tipo: "Dotación",
                categoria: "Dotación",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-011",
                actividades: [
                    "ACT-EJE-003",
                    "ACT-CTL-002",
                    "ACT-CIE-001"
                ],
                palabrasClave: ["equipos", "adquisición", "tecnología", "biomédico"]
            },

            MOBILIARIO_SUMINISTRADO: {
                id: "PRO-DOT-003",
                codigo: "PRO-DOT-003",
                nombre: "Mobiliario suministrado",
                descripcion: "Mobiliario suministrado e instalado para adecuar espacios de atención, formación, servicio u operación.",
                unidadMedida: "Unidad",
                tipo: "Dotación",
                categoria: "Dotación",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-012",
                actividades: [
                    "ACT-EJE-003",
                    "ACT-CTL-002",
                    "ACT-CIE-001"
                ],
                palabrasClave: ["mobiliario", "sillas", "mesas", "dotación"]
            },

            ELEMENTOS_ENTREGADOS: {
                id: "PRO-DOT-004",
                codigo: "PRO-DOT-004",
                nombre: "Elementos entregados",
                descripcion: "Elementos, insumos, kits o materiales entregados a la población objetivo o a la entidad responsable.",
                unidadMedida: "Unidad",
                tipo: "Dotación",
                categoria: "Dotación",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-013",
                actividades: [
                    "ACT-EJE-003",
                    "ACT-CTL-002",
                    "ACT-CIE-001"
                ],
                palabrasClave: ["elementos", "kits", "insumos", "entrega"]
            }

        },

        // =====================================
        // FORMACIÓN Y FORTALECIMIENTO
        // =====================================

        FORMACION: {

            PERSONAS_CAPACITADAS: {
                id: "PRO-FOR-001",
                codigo: "PRO-FOR-001",
                nombre: "Personas capacitadas",
                descripcion: "Personas beneficiarias formadas o capacitadas en temas relacionados con el objeto del proyecto.",
                unidadMedida: "Personas",
                tipo: "Formación",
                categoria: "Formación",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-020",
                actividades: [
                    "ACT-EJE-004",
                    "ACT-CTL-003",
                    "ACT-CIE-003"
                ],
                palabrasClave: ["capacitación", "personas", "formación", "beneficiarios"]
            },

            FUNCIONARIOS_CAPACITADOS: {
                id: "PRO-FOR-002",
                codigo: "PRO-FOR-002",
                nombre: "Funcionarios capacitados",
                descripcion: "Funcionarios, servidores públicos o personal institucional capacitado para fortalecer capacidades de gestión y prestación del servicio.",
                unidadMedida: "Personas",
                tipo: "Formación",
                categoria: "Formación",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-021",
                actividades: [
                    "ACT-EJE-004",
                    "ACT-CTL-003",
                    "ACT-CIE-003"
                ],
                palabrasClave: ["funcionarios", "capacitación", "servidores públicos", "gestión"]
            },

            ORGANIZACIONES_FORTALECIDAS: {
                id: "PRO-FOR-003",
                codigo: "PRO-FOR-003",
                nombre: "Organizaciones fortalecidas",
                descripcion: "Organizaciones comunitarias, sociales, productivas o institucionales fortalecidas mediante asistencia técnica, capacitación o acompañamiento.",
                unidadMedida: "Organizaciones",
                tipo: "Fortalecimiento",
                categoria: "Formación",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-022",
                actividades: [
                    "ACT-EJE-004",
                    "ACT-EJE-005",
                    "ACT-CTL-003",
                    "ACT-CIE-003"
                ],
                palabrasClave: ["organizaciones", "fortalecimiento", "asistencia técnica", "acompañamiento"]
            },

            ASISTENCIA_TECNICA_PRESTADA: {
                id: "PRO-FOR-004",
                codigo: "PRO-FOR-004",
                nombre: "Asistencia técnica prestada",
                descripcion: "Asistencia técnica brindada a beneficiarios, organizaciones o entidades para mejorar capacidades y resultados.",
                unidadMedida: "Asistencias",
                tipo: "Fortalecimiento",
                categoria: "Formación",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-023",
                actividades: [
                    "ACT-EJE-004",
                    "ACT-EJE-005",
                    "ACT-CTL-003"
                ],
                palabrasClave: ["asistencia técnica", "acompañamiento", "fortalecimiento", "asesoría"]
            }

        },

        // =====================================
        // SERVICIOS Y PROGRAMAS
        // =====================================

        SERVICIOS: {

            SERVICIO_IMPLEMENTADO: {
                id: "PRO-SER-001",
                codigo: "PRO-SER-001",
                nombre: "Servicio implementado",
                descripcion: "Servicio público, social, comunitario o institucional implementado para atender la necesidad identificada.",
                unidadMedida: "Servicio",
                tipo: "Servicio",
                categoria: "Servicios",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-030",
                actividades: [
                    "ACT-EJE-005",
                    "ACT-CTL-003",
                    "ACT-CIE-003"
                ],
                palabrasClave: ["servicio", "implementación", "atención", "operación"]
            },

            PROGRAMA_EJECUTADO: {
                id: "PRO-SER-002",
                codigo: "PRO-SER-002",
                nombre: "Programa ejecutado",
                descripcion: "Programa institucional o social ejecutado para beneficiar directamente a la población objetivo.",
                unidadMedida: "Programa",
                tipo: "Programa",
                categoria: "Servicios",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-031",
                actividades: [
                    "ACT-EJE-005",
                    "ACT-CTL-003",
                    "ACT-CIE-003"
                ],
                palabrasClave: ["programa", "ejecución", "beneficiarios", "social"]
            },

            PERSONAS_ATENDIDAS: {
                id: "PRO-SER-003",
                codigo: "PRO-SER-003",
                nombre: "Personas atendidas",
                descripcion: "Personas atendidas mediante servicios, programas, jornadas o intervenciones desarrolladas por el proyecto.",
                unidadMedida: "Personas",
                tipo: "Servicio",
                categoria: "Servicios",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-032",
                actividades: [
                    "ACT-EJE-005",
                    "ACT-CTL-003",
                    "ACT-CIE-003"
                ],
                palabrasClave: ["personas", "atención", "beneficiarios", "servicio"]
            },

            JORNADAS_REALIZADAS: {
                id: "PRO-SER-004",
                codigo: "PRO-SER-004",
                nombre: "Jornadas realizadas",
                descripcion: "Jornadas de atención, promoción, prevención, formación o intervención realizadas en el marco del proyecto.",
                unidadMedida: "Jornadas",
                tipo: "Servicio",
                categoria: "Servicios",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-033",
                actividades: [
                    "ACT-EJE-005",
                    "ACT-CTL-003"
                ],
                palabrasClave: ["jornadas", "atención", "promoción", "prevención"]
            }

        },

        // =====================================
        // GESTIÓN Y DOCUMENTOS
        // =====================================

        GESTION: {

            ESTUDIOS_ELABORADOS: {
                id: "PRO-GES-001",
                codigo: "PRO-GES-001",
                nombre: "Estudios elaborados",
                descripcion: "Estudios técnicos, sociales, económicos, ambientales, jurídicos o financieros elaborados para soportar el proyecto.",
                unidadMedida: "Documento",
                tipo: "Gestión",
                categoria: "Gestión",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-040",
                actividades: [
                    "ACT-PLA-003",
                    "ACT-PLA-004",
                    "ACT-PLA-013"
                ],
                palabrasClave: ["estudios", "documentos", "soporte", "técnicos"]
            },

            DISENOS_REALIZADOS: {
                id: "PRO-GES-002",
                codigo: "PRO-GES-002",
                nombre: "Diseños realizados",
                descripcion: "Diseños, planos, memorias, especificaciones y documentos técnicos elaborados.",
                unidadMedida: "Documento",
                tipo: "Gestión",
                categoria: "Gestión",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-041",
                actividades: [
                    "ACT-PLA-005",
                    "ACT-PLA-006",
                    "ACT-PLA-007"
                ],
                palabrasClave: ["diseños", "planos", "memorias", "documentos técnicos"]
            },

            PLAN_FORMULADO: {
                id: "PRO-GES-003",
                codigo: "PRO-GES-003",
                nombre: "Plan formulado",
                descripcion: "Plan, programa, estrategia o instrumento de planificación formulado y validado.",
                unidadMedida: "Documento",
                tipo: "Gestión",
                categoria: "Gestión",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-042",
                actividades: [
                    "ACT-PLA-001",
                    "ACT-PLA-002",
                    "ACT-PLA-012",
                    "ACT-PLA-014"
                ],
                palabrasClave: ["plan", "estrategia", "formulación", "instrumento"]
            },

            PROYECTO_FORMULADO: {
                id: "PRO-GES-004",
                codigo: "PRO-GES-004",
                nombre: "Proyecto formulado",
                descripcion: "Proyecto de inversión pública formulado conforme a la metodología y requisitos aplicables.",
                unidadMedida: "Proyecto",
                tipo: "Gestión",
                categoria: "Gestión",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-043",
                actividades: [
                    "ACT-PLA-012",
                    "ACT-PLA-014",
                    "ACT-PLA-015"
                ],
                palabrasClave: ["proyecto", "formulación", "mga", "banco de proyectos"]
            }

        },

        // =====================================
        // TECNOLOGÍA
        // =====================================

        TECNOLOGIA: {

            PLATAFORMA_IMPLEMENTADA: {
                id: "PRO-TIC-001",
                codigo: "PRO-TIC-001",
                nombre: "Plataforma tecnológica implementada",
                descripcion: "Plataforma tecnológica implementada para mejorar la gestión, operación, atención o acceso a servicios.",
                unidadMedida: "Plataforma",
                tipo: "Tecnología",
                categoria: "Tecnología",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-050",
                actividades: [
                    "ACT-PLA-004",
                    "ACT-EJE-003",
                    "ACT-EJE-004",
                    "ACT-CTL-003",
                    "ACT-CIE-003"
                ],
                palabrasClave: ["plataforma", "tecnología", "software", "sistema"]
            },

            SOFTWARE_DESARROLLADO: {
                id: "PRO-TIC-002",
                codigo: "PRO-TIC-002",
                nombre: "Software desarrollado",
                descripcion: "Solución de software desarrollada, implementada, probada y puesta en operación.",
                unidadMedida: "Software",
                tipo: "Tecnología",
                categoria: "Tecnología",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-051",
                actividades: [
                    "ACT-PLA-004",
                    "ACT-EJE-004",
                    "ACT-CTL-003",
                    "ACT-CIE-003"
                ],
                palabrasClave: ["software", "desarrollo", "aplicación", "sistema"]
            },

            SISTEMA_INFORMACION_IMPLEMENTADO: {
                id: "PRO-TIC-003",
                codigo: "PRO-TIC-003",
                nombre: "Sistema de información implementado",
                descripcion: "Sistema de información implementado para capturar, procesar, consultar y reportar información institucional o territorial.",
                unidadMedida: "Sistema",
                tipo: "Tecnología",
                categoria: "Tecnología",
                generaIndicador: true,
                indicadorSugerido: "IND-PRO-052",
                actividades: [
                    "ACT-PLA-004",
                    "ACT-EJE-003",
                    "ACT-EJE-004",
                    "ACT-CTL-003",
                    "ACT-CIE-003"
                ],
                palabrasClave: ["sistema de información", "datos", "reportes", "gestión"]
            }

        }

    }

};

// Registrar catálogo si existe el administrador central
if(window.CatalogoMGA){
    CatalogoMGA.registrar("productos", CatalogoProductos);
}

window.CatalogoProductos = CatalogoProductos;
