// =====================================
// NORMATIVIDAD.JS
// CONSTRUCTOR MGA PRO
// Catálogo maestro de normatividad aplicable
// =====================================

const CatalogoNormatividad = {

    nombre:
    "Catálogo Maestro de Normatividad",

    version:
    "1.0.0",

    descripcion:
    "Banco reutilizable de referencias normativas generales para apoyar la formulación de proyectos de inversión pública en Colombia.",

    nota:
    "Este catálogo es una guía de apoyo. Cada proyecto debe validar la normatividad vigente y específica aplicable antes de su radicación o contratación.",

    categorias: {

        // =====================================
        // PLANEACIÓN E INVERSIÓN PÚBLICA
        // =====================================

        PLANEACION_INVERSION: {

            CONSTITUCION_POLITICA: {
                id: "NOR-GEN-001",
                codigo: "NOR-GEN-001",
                nombre: "Constitución Política de Colombia",
                descripcion: "Marco constitucional general sobre fines esenciales del Estado, derechos, función administrativa, planeación, descentralización y gasto público.",
                sector: "General",
                tipo: "Constitución",
                aplicaA: ["todos"],
                palabrasClave: ["constitución", "estado", "derechos", "planeación"]
            },

            LEY_152_1994: {
                id: "NOR-GEN-002",
                codigo: "NOR-GEN-002",
                nombre: "Ley 152 de 1994",
                descripcion: "Ley Orgánica del Plan de Desarrollo. Define principios, procedimientos y contenidos de los planes de desarrollo.",
                sector: "General",
                tipo: "Ley",
                aplicaA: ["planeación", "plan de desarrollo", "inversión pública"],
                palabrasClave: ["plan de desarrollo", "planeación", "ley orgánica"]
            },

            DECRETO_111_1996: {
                id: "NOR-GEN-003",
                codigo: "NOR-GEN-003",
                nombre: "Decreto 111 de 1996",
                descripcion: "Estatuto Orgánico del Presupuesto. Referencia general para programación, aprobación, ejecución y control presupuestal.",
                sector: "General",
                tipo: "Decreto",
                aplicaA: ["presupuesto", "recursos públicos", "inversión"],
                palabrasClave: ["presupuesto", "estatuto orgánico", "recursos"]
            },

            LEY_2056_2020: {
                id: "NOR-GEN-004",
                codigo: "NOR-GEN-004",
                nombre: "Ley 2056 de 2020",
                descripcion: "Regula la organización y funcionamiento del Sistema General de Regalías.",
                sector: "General",
                tipo: "Ley",
                aplicaA: ["sgr", "regalías", "inversión pública"],
                palabrasClave: ["sgr", "regalías", "ocad", "inversión"]
            },

            DECRETO_1821_2020: {
                id: "NOR-GEN-005",
                codigo: "NOR-GEN-005",
                nombre: "Decreto 1821 de 2020",
                descripcion: "Decreto Único Reglamentario del Sistema General de Regalías.",
                sector: "General",
                tipo: "Decreto",
                aplicaA: ["sgr", "regalías", "proyectos"],
                palabrasClave: ["sgr", "regalías", "decreto único"]
            },

            MGA_DNP: {
                id: "NOR-GEN-006",
                codigo: "NOR-GEN-006",
                nombre: "Metodología General Ajustada - MGA",
                descripcion: "Herramienta metodológica del DNP para la formulación y estructuración de proyectos de inversión pública.",
                sector: "General",
                tipo: "Metodología",
                aplicaA: ["mga", "formulación", "banco de proyectos"],
                palabrasClave: ["mga", "dnp", "formulación", "proyecto"]
            }

        },

        // =====================================
        // CONTRATACIÓN PÚBLICA
        // =====================================

        CONTRATACION_PUBLICA: {

            LEY_80_1993: {
                id: "NOR-CON-001",
                codigo: "NOR-CON-001",
                nombre: "Ley 80 de 1993",
                descripcion: "Estatuto General de Contratación de la Administración Pública.",
                sector: "General",
                tipo: "Ley",
                aplicaA: ["contratación", "obra", "consultoría", "suministro"],
                palabrasClave: ["contratación", "estatuto", "contratos estatales"]
            },

            LEY_1150_2007: {
                id: "NOR-CON-002",
                codigo: "NOR-CON-002",
                nombre: "Ley 1150 de 2007",
                descripcion: "Introduce medidas para la eficiencia y transparencia en la contratación pública.",
                sector: "General",
                tipo: "Ley",
                aplicaA: ["contratación", "selección", "transparencia"],
                palabrasClave: ["contratación", "eficiencia", "transparencia"]
            },

            DECRETO_1082_2015: {
                id: "NOR-CON-003",
                codigo: "NOR-CON-003",
                nombre: "Decreto 1082 de 2015",
                descripcion: "Decreto Único Reglamentario del sector administrativo de planeación nacional; incluye disposiciones de contratación pública.",
                sector: "General",
                tipo: "Decreto",
                aplicaA: ["contratación", "planeación", "secop"],
                palabrasClave: ["decreto único", "contratación", "planeación"]
            },

            LEY_1474_2011: {
                id: "NOR-CON-004",
                codigo: "NOR-CON-004",
                nombre: "Ley 1474 de 2011",
                descripcion: "Estatuto Anticorrupción. Incluye disposiciones relacionadas con la gestión pública y la contratación.",
                sector: "General",
                tipo: "Ley",
                aplicaA: ["anticorrupción", "control", "contratación"],
                palabrasClave: ["anticorrupción", "transparencia", "control"]
            }

        },

        // =====================================
        // DESARROLLO SOCIAL
        // =====================================

        DESARROLLO_SOCIAL: {

            LEY_1251_2008: {
                id: "NOR-SOC-001",
                codigo: "NOR-SOC-001",
                nombre: "Ley 1251 de 2008",
                descripcion: "Normas tendientes a procurar la protección, promoción y defensa de los derechos de las personas adultas mayores.",
                sector: "Desarrollo Social",
                tipo: "Ley",
                aplicaA: ["adulto mayor", "centro vida", "centro día"],
                palabrasClave: ["adulto mayor", "protección", "derechos"]
            },

            LEY_1276_2009: {
                id: "NOR-SOC-002",
                codigo: "NOR-SOC-002",
                nombre: "Ley 1276 de 2009",
                descripcion: "Modifica disposiciones relacionadas con la estampilla para el bienestar del adulto mayor y centros vida.",
                sector: "Desarrollo Social",
                tipo: "Ley",
                aplicaA: ["adulto mayor", "centro vida", "estampilla"],
                palabrasClave: ["centro vida", "adulto mayor", "estampilla"]
            },

            LEY_1098_2006: {
                id: "NOR-SOC-003",
                codigo: "NOR-SOC-003",
                nombre: "Ley 1098 de 2006",
                descripcion: "Código de la Infancia y la Adolescencia.",
                sector: "Desarrollo Social",
                tipo: "Ley",
                aplicaA: ["primera infancia", "infancia", "adolescencia", "cdi"],
                palabrasClave: ["infancia", "adolescencia", "niñez"]
            },

            LEY_1618_2013: {
                id: "NOR-SOC-004",
                codigo: "NOR-SOC-004",
                nombre: "Ley 1618 de 2013",
                descripcion: "Disposiciones para garantizar el pleno ejercicio de los derechos de las personas con discapacidad.",
                sector: "Desarrollo Social",
                tipo: "Ley",
                aplicaA: ["discapacidad", "inclusión", "accesibilidad"],
                palabrasClave: ["discapacidad", "inclusión", "derechos"]
            },

            LEY_1448_2011: {
                id: "NOR-SOC-005",
                codigo: "NOR-SOC-005",
                nombre: "Ley 1448 de 2011",
                descripcion: "Ley de víctimas y restitución de tierras.",
                sector: "Desarrollo Social",
                tipo: "Ley",
                aplicaA: ["víctimas", "conflicto armado", "atención"],
                palabrasClave: ["víctimas", "reparación", "conflicto"]
            },

            LEY_1257_2008: {
                id: "NOR-SOC-006",
                codigo: "NOR-SOC-006",
                nombre: "Ley 1257 de 2008",
                descripcion: "Normas de sensibilización, prevención y sanción de formas de violencia contra las mujeres.",
                sector: "Desarrollo Social",
                tipo: "Ley",
                aplicaA: ["mujeres", "violencia", "equidad"],
                palabrasClave: ["mujer", "violencia", "equidad"]
            }

        },

        // =====================================
        // SALUD
        // =====================================

        SALUD: {

            LEY_100_1993: {
                id: "NOR-SAL-001",
                codigo: "NOR-SAL-001",
                nombre: "Ley 100 de 1993",
                descripcion: "Crea el Sistema de Seguridad Social Integral.",
                sector: "Salud",
                tipo: "Ley",
                aplicaA: ["salud", "seguridad social", "servicios"],
                palabrasClave: ["salud", "seguridad social", "sistema"]
            },

            LEY_1751_2015: {
                id: "NOR-SAL-002",
                codigo: "NOR-SAL-002",
                nombre: "Ley 1751 de 2015",
                descripcion: "Ley Estatutaria de Salud. Regula el derecho fundamental a la salud.",
                sector: "Salud",
                tipo: "Ley Estatutaria",
                aplicaA: ["salud", "derecho fundamental", "servicios"],
                palabrasClave: ["derecho a la salud", "salud", "estatutaria"]
            },

            DECRETO_780_2016: {
                id: "NOR-SAL-003",
                codigo: "NOR-SAL-003",
                nombre: "Decreto 780 de 2016",
                descripcion: "Decreto Único Reglamentario del Sector Salud y Protección Social.",
                sector: "Salud",
                tipo: "Decreto",
                aplicaA: ["salud", "protección social", "servicios"],
                palabrasClave: ["salud", "decreto único", "protección social"]
            },

            RESOLUCION_3100_2019: {
                id: "NOR-SAL-004",
                codigo: "NOR-SAL-004",
                nombre: "Resolución 3100 de 2019",
                descripcion: "Define procedimientos y condiciones de inscripción de prestadores de servicios de salud y habilitación de servicios.",
                sector: "Salud",
                tipo: "Resolución",
                aplicaA: ["habilitación", "prestadores", "servicios de salud"],
                palabrasClave: ["habilitación", "prestadores", "salud"]
            }

        },

        // =====================================
        // EDUCACIÓN
        // =====================================

        EDUCACION: {

            LEY_115_1994: {
                id: "NOR-EDU-001",
                codigo: "NOR-EDU-001",
                nombre: "Ley 115 de 1994",
                descripcion: "Ley General de Educación.",
                sector: "Educación",
                tipo: "Ley",
                aplicaA: ["educación", "instituciones educativas", "servicio educativo"],
                palabrasClave: ["educación", "ley general", "colegio"]
            },

            LEY_715_2001: {
                id: "NOR-EDU-002",
                codigo: "NOR-EDU-002",
                nombre: "Ley 715 de 2001",
                descripcion: "Normas orgánicas en materia de recursos y competencias para educación, salud y otros sectores.",
                sector: "Educación",
                tipo: "Ley",
                aplicaA: ["educación", "competencias", "recursos"],
                palabrasClave: ["educación", "competencias", "sgp"]
            },

            DECRETO_1075_2015: {
                id: "NOR-EDU-003",
                codigo: "NOR-EDU-003",
                nombre: "Decreto 1075 de 2015",
                descripcion: "Decreto Único Reglamentario del Sector Educación.",
                sector: "Educación",
                tipo: "Decreto",
                aplicaA: ["educación", "servicio educativo", "instituciones"],
                palabrasClave: ["educación", "decreto único", "sector"]
            },

            NTC_4595: {
                id: "NOR-EDU-004",
                codigo: "NOR-EDU-004",
                nombre: "NTC 4595",
                descripcion: "Norma técnica relacionada con planeamiento y diseño de instalaciones y ambientes escolares.",
                sector: "Educación",
                tipo: "Norma Técnica",
                aplicaA: ["infraestructura educativa", "colegios", "aulas"],
                palabrasClave: ["infraestructura educativa", "colegio", "aula"]
            }

        },

        // =====================================
        // TRANSPORTE E INFRAESTRUCTURA VIAL
        // =====================================

        TRANSPORTE: {

            LEY_105_1993: {
                id: "NOR-TRA-001",
                codigo: "NOR-TRA-001",
                nombre: "Ley 105 de 1993",
                descripcion: "Disposiciones básicas sobre transporte, competencias y recursos.",
                sector: "Transporte",
                tipo: "Ley",
                aplicaA: ["transporte", "infraestructura vial", "movilidad"],
                palabrasClave: ["transporte", "vías", "movilidad"]
            },

            LEY_1682_2013: {
                id: "NOR-TRA-002",
                codigo: "NOR-TRA-002",
                nombre: "Ley 1682 de 2013",
                descripcion: "Disposiciones y medidas para proyectos de infraestructura de transporte.",
                sector: "Transporte",
                tipo: "Ley",
                aplicaA: ["infraestructura", "transporte", "proyectos viales"],
                palabrasClave: ["infraestructura", "transporte", "vial"]
            },

            MANUAL_INVIAS: {
                id: "NOR-TRA-003",
                codigo: "NOR-TRA-003",
                nombre: "Manuales técnicos INVÍAS",
                descripcion: "Referencias técnicas para diseño, construcción, mantenimiento, especificaciones y control de calidad en infraestructura vial.",
                sector: "Transporte",
                tipo: "Manual Técnico",
                aplicaA: ["vías", "pavimentos", "placa huella", "puentes"],
                palabrasClave: ["invías", "vías", "pavimento", "placa huella"]
            }

        },

        // =====================================
        // AGUA POTABLE Y SANEAMIENTO
        // =====================================

        AGUA_SANEAMIENTO: {

            LEY_142_1994: {
                id: "NOR-AGU-001",
                codigo: "NOR-AGU-001",
                nombre: "Ley 142 de 1994",
                descripcion: "Régimen de los servicios públicos domiciliarios.",
                sector: "Agua Potable y Saneamiento",
                tipo: "Ley",
                aplicaA: ["acueducto", "alcantarillado", "aseo", "servicios públicos"],
                palabrasClave: ["servicios públicos", "acueducto", "alcantarillado"]
            },

            RESOLUCION_0330_2017: {
                id: "NOR-AGU-002",
                codigo: "NOR-AGU-002",
                nombre: "Resolución 0330 de 2017",
                descripcion: "Reglamento Técnico del Sector de Agua Potable y Saneamiento Básico - RAS.",
                sector: "Agua Potable y Saneamiento",
                tipo: "Resolución",
                aplicaA: ["acueducto", "alcantarillado", "ptap", "ptar"],
                palabrasClave: ["ras", "agua potable", "saneamiento"]
            },

            DECRETO_1077_2015: {
                id: "NOR-AGU-003",
                codigo: "NOR-AGU-003",
                nombre: "Decreto 1077 de 2015",
                descripcion: "Decreto Único Reglamentario del Sector Vivienda, Ciudad y Territorio.",
                sector: "Agua Potable y Saneamiento",
                tipo: "Decreto",
                aplicaA: ["vivienda", "agua", "saneamiento", "territorio"],
                palabrasClave: ["vivienda", "agua", "saneamiento"]
            }

        },

        // =====================================
        // DEPORTE, CULTURA Y RECREACIÓN
        // =====================================

        DEPORTE_CULTURA: {

            LEY_181_1995: {
                id: "NOR-DEP-001",
                codigo: "NOR-DEP-001",
                nombre: "Ley 181 de 1995",
                descripcion: "Disposiciones para el fomento del deporte, la recreación y el aprovechamiento del tiempo libre.",
                sector: "Deporte",
                tipo: "Ley",
                aplicaA: ["deporte", "recreación", "escenarios deportivos"],
                palabrasClave: ["deporte", "recreación", "escenarios"]
            },

            LEY_397_1997: {
                id: "NOR-CUL-001",
                codigo: "NOR-CUL-001",
                nombre: "Ley 397 de 1997",
                descripcion: "Ley General de Cultura.",
                sector: "Cultura",
                tipo: "Ley",
                aplicaA: ["cultura", "patrimonio", "bibliotecas", "casa de cultura"],
                palabrasClave: ["cultura", "patrimonio", "biblioteca"]
            },

            LEY_1185_2008: {
                id: "NOR-CUL-002",
                codigo: "NOR-CUL-002",
                nombre: "Ley 1185 de 2008",
                descripcion: "Modifica y adiciona disposiciones relacionadas con patrimonio cultural.",
                sector: "Cultura",
                tipo: "Ley",
                aplicaA: ["patrimonio", "cultura", "bienes culturales"],
                palabrasClave: ["patrimonio", "cultura", "bienes"]
            }

        },

        // =====================================
        // AMBIENTE
        // =====================================

        AMBIENTE: {

            LEY_99_1993: {
                id: "NOR-AMB-001",
                codigo: "NOR-AMB-001",
                nombre: "Ley 99 de 1993",
                descripcion: "Crea el Ministerio del Medio Ambiente y organiza el Sistema Nacional Ambiental.",
                sector: "Ambiente",
                tipo: "Ley",
                aplicaA: ["ambiente", "licencias", "autoridad ambiental"],
                palabrasClave: ["ambiente", "sina", "licencias"]
            },

            DECRETO_1076_2015: {
                id: "NOR-AMB-002",
                codigo: "NOR-AMB-002",
                nombre: "Decreto 1076 de 2015",
                descripcion: "Decreto Único Reglamentario del Sector Ambiente y Desarrollo Sostenible.",
                sector: "Ambiente",
                tipo: "Decreto",
                aplicaA: ["ambiente", "permisos", "licencias"],
                palabrasClave: ["ambiente", "decreto único", "permisos"]
            }

        },

        // =====================================
        // TIC
        // =====================================

        TIC: {

            LEY_1341_2009: {
                id: "NOR-TIC-001",
                codigo: "NOR-TIC-001",
                nombre: "Ley 1341 de 2009",
                descripcion: "Define principios y conceptos sobre la sociedad de la información y las TIC.",
                sector: "TIC",
                tipo: "Ley",
                aplicaA: ["tic", "conectividad", "tecnología"],
                palabrasClave: ["tic", "conectividad", "tecnología"]
            },

            LEY_1978_2019: {
                id: "NOR-TIC-002",
                codigo: "NOR-TIC-002",
                nombre: "Ley 1978 de 2019",
                descripcion: "Moderniza el sector TIC y distribuye competencias relacionadas.",
                sector: "TIC",
                tipo: "Ley",
                aplicaA: ["tic", "modernización", "conectividad"],
                palabrasClave: ["tic", "modernización", "sector"]
            }

        }

    }

};

if(window.CatalogoMGA){
    CatalogoMGA.registrar("normatividad", CatalogoNormatividad);
}

window.CatalogoNormatividad = CatalogoNormatividad;
